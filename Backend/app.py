from fastapi import FastAPI, status, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.staticfiles import StaticFiles
from ultralytics import YOLO
import cv2
import os
import requests
from datetime import datetime
import threading
import time
from dotenv import load_dotenv
from contextlib import asynccontextmanager
import hashlib
import json

load_dotenv()

DATABASE_POST_API_ROUTE= os.getenv("DATABASE_POST_API_ROUTE")

if not DATABASE_POST_API_ROUTE:
    raise ValueError("Environment variables DATABASE_POST_API_ROUTE and CONVEX_DEPLOYMENT must be set.")


# Global variables
model = None
active_cameras = {}
detection_results = []
recent_detections = set()  # Track recent detection hashes
detection_cooldown = 5  # Seconds to prevent duplicate detections

# Create snapshots directory
snapshot_dir = "snapshots"
if not os.path.exists(snapshot_dir):
    os.makedirs(snapshot_dir)

@asynccontextmanager
async def lifespan(app: FastAPI):
    global model
    try:
        model = YOLO("./model/best.pt")
        print("YOLO model loaded successfully")
    except Exception as e:
        print(f"Failed to load YOLO model: {str(e)}")
        raise
    
    await start_camera_monitoring()
    yield
    
    print("Shutting down camera monitoring...")
    for camera_id, cap in active_cameras.items():
        if cap:
            cap.release()

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/snapshots", StaticFiles(directory="snapshots"), name="snapshots")

async def upload_to_convex(data):
    try:
        payload = json.dumps(data)
        res=requests.post(DATABASE_POST_API_ROUTE,payload)
        res.raise_for_status()
        if res.status_code != status.HTTP_200_OK:
            raise HTTPException(status_code=res.status_code, detail=res.text)

        print("Data uploaded to Convex successfully")
    except Exception as e:
        print(f"Failed to upload to Convex: {e}")



async def upload_to_imgbb(imgpath):
    """Upload image to imgbb and return URL"""
    try:
        with open(imgpath, 'rb') as img_file:
            response = requests.post(
                "https://api.imgbb.com/1/upload",
                params={"key": os.getenv("IMGBB_API_KEY")},
                files={"image": img_file}
            )
            response.raise_for_status()
            return response.json().get("data", {}).get("url", "")
    except Exception as e:
        print(f"Failed to upload image to imgbb: {e}")
        return ""

def create_detection_hash(frame, boxes):
    """Create a hash to identify similar detections"""
    # Use frame dimensions and box coordinates to create unique hash
    height, width = frame.shape[:2]
    box_data = ""
    
    for box in boxes:
        x1, y1, x2, y2 = box.xyxy[0]
        box_data += f"{int(x1)}{int(y1)}{int(x2)}{int(y2)}"
    
    combined_data = f"{width}x{height}_{box_data}_{datetime.now().strftime('%Y%m%d%H%M')}"
    return hashlib.md5(combined_data.encode()).hexdigest()

def is_duplicate_detection(detection_hash):
    """Check if this detection already exists recently"""
    current_time = time.time()
    
    # Clean old hashes (older than cooldown period)
    expired_hashes = []
    for stored_hash, timestamp in list(recent_detections):
        if current_time - timestamp > detection_cooldown:
            expired_hashes.append((stored_hash, timestamp))
    
    for expired in expired_hashes:
        recent_detections.discard(expired)
    
    # Check if current hash exists
    for stored_hash, timestamp in recent_detections:
        if stored_hash == detection_hash:
            return True
    
    return False

async def start_camera_monitoring():
    """Start monitoring camera"""
    cameras_config = [
        {"id": "camera_1", "source": 0, "location": "Main Entrance"},
    ]
    
    for camera_config in cameras_config:
        threading.Thread(
            target=monitor_camera,
            args=(camera_config["id"], camera_config["source"], camera_config["location"]),
            daemon=True
        ).start()
        print(f"Started monitoring {camera_config['id']}")

def monitor_camera(camera_id, camera_source, camera_location):
    """Monitor camera for elephant detection"""
    global active_cameras
    
    cap = cv2.VideoCapture(camera_source)
    if not cap.isOpened():
        print(f"Failed to open camera {camera_id}")
        return
    
    active_cameras[camera_id] = cap
    frame_count = 0
    
    while True:
        success, frame = cap.read()
        if not success:
            print(f"Failed to read from camera {camera_id}")
            break
        
        frame_count += 1
        
        # Process every 5th frame for performance
        if frame_count % 5 == 0:
            try:
                results = model.predict(frame, conf=0.7, verbose=False)
                
                # Check for elephant detections
                for r in results:
                    if r.boxes is not None and len(r.boxes) > 0:
                        elephant_boxes = []
                        
                        for box in r.boxes:
                            cls_id = int(box.cls[0])
                            confidence = float(box.conf[0])
                            class_name = model.names[cls_id]
                            
                            if class_name.lower() == 'elephant' and confidence > 0.7:
                                elephant_boxes.append(box)
                        
                        if elephant_boxes:
                            # Create detection hash
                            detection_hash = create_detection_hash(frame, elephant_boxes)
                            
                            # Only save if not duplicate
                            if not is_duplicate_detection(detection_hash):
                                # Add to recent detections
                                recent_detections.add((detection_hash, time.time()))
                                
                                # Save detection
                                detection_data = save_detection(frame, results, camera_id, camera_location, confidence, class_name)
                                detection_results.append(detection_data)
                                
                                print(f"NEW ELEPHANT DETECTED! Camera: {camera_id}, Confidence: {confidence:.2f}")
                                
                                # Upload to database
                                threading.Thread(
                                    target= upload_to_convex,
                                    args=(detection_data,),
                                    daemon=True
                                ).start()

                            
            except Exception as e:
                print(f"Error processing frame: {e}")
        
        time.sleep(0.1)

async def save_detection(frame, results, camera_id, camera_location, confidence):
    """Save detection snapshot"""
    timestamp = datetime.now()
    unique_id = int(timestamp.timestamp() * 1e6)
    
    # Create annotated frame
    annotated_frame = results[0].plot()
    
    # Save snapshot
    snapshot_filename = f"elephant_{camera_id}_{unique_id}.jpg"
    snapshot_path = os.path.join(snapshot_dir, snapshot_filename)
    
    cv2.imwrite(snapshot_path, annotated_frame)
    
    # img_url = await upload_to_imgbb(snapshot_path)
    # if not img_url:
    #     img_url = f"/snapshots/{snapshot_filename}"
    # img_url = 


# {
#   "camera_id": "5555",
#   "confidence": 99,
#   "image_path": "/rtyry",
#   "image_url": "/jgjhg",
#   "location": "Baniyani",
#   "message": "Hello oo",
#   "timestamp": 76568798,
#   "type": "all"
# }

    data = {
        "type": "elephant_detection",
        "camera_id": camera_id,
        "location": camera_location,
        "message": f"Elephant detected with {confidence:.1%} confidence!",
        "confidence": confidence,
        "timestamp": timestamp.isoformat(),
        "image_path": snapshot_path
    }
    await upload_to_convex(data)

@app.get("/")
async def root():
    return {
        "message": "Elephant Detection System",
        "status": "running",
        "active_cameras": len(active_cameras),
        "total_detections": len(detection_results)
    }

@app.get("/main/")
async def get_main_camera_stream():
    """Get live camera stream with detection"""
    camera_id = "camera_1"
    
    if camera_id not in active_cameras:
        raise HTTPException(status_code=404, detail="Camera not found")
    
    async def generate_frames():
        cap = active_cameras[camera_id]
        
        while True:
            success, frame = cap.read()
            if not success:
                break
            
            try:
                # Run detection for live view
                results = model.predict(frame, conf=0.5, verbose=False)
                annotated_frame = frame.copy()
                
                elephant_count = 0
                for r in results:
                    if r.boxes is not None:
                        for box in r.boxes:
                            cls_id = int(box.cls[0])
                            confidence = float(box.conf[0])
                            class_name = model.names[cls_id]
                            
                            if class_name.lower() == 'elephant':
                                elephant_count += 1
                                
                                # Draw bounding box
                                x1, y1, x2, y2 = box.xyxy[0]
                                x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)
                                
                                cv2.rectangle(annotated_frame, (x1, y1), (x2, y2), (0, 0, 255), 3)
                                
                                # Draw label
                                label = f"Elephant: {confidence:.2f}"
                                cv2.putText(annotated_frame, label, (x1, y1-10), 
                                          cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
                
                # Add overlay info
                now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                font = cv2.FONT_HERSHEY_SIMPLEX
                
                cv2.putText(annotated_frame, now, (10, 30), font, 0.6, (0, 255, 0), 2)
                cv2.putText(annotated_frame, f"Camera: {camera_id}", (10, 60), font, 0.6, (0, 255, 0), 2)
                cv2.putText(annotated_frame, f"Total Saved: {len(detection_results)}", (10, 90), font, 0.6, (0, 255, 0), 2)
                
                if elephant_count > 0:
                    cv2.putText(annotated_frame, f"LIVE: {elephant_count}", (10, 120), font, 0.8, (0, 0, 255), 3)
                    # Save detection snapshot
                    await save_detection(annotated_frame, results, camera_id, "Main Entrance", 
                                    confidence=0.7)
                                    
            except Exception as e:
                print(f"Live detection error: {e}")
                annotated_frame = frame
            
            # Encode and yield frame
            _, buffer = cv2.imencode('.jpg', annotated_frame)
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
            
            time.sleep(0.033)
    
    return StreamingResponse(generate_frames(), media_type="multipart/x-mixed-replace; boundary=frame")