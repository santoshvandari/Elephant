from fastapi import FastAPI, status, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
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
import asyncio
from concurrent.futures import ThreadPoolExecutor
import queue

load_dotenv()

DATABASE_POST_API_ROUTE= os.getenv("DATABASE_POST_API_ROUTE")

if not DATABASE_POST_API_ROUTE:
    raise ValueError("Environment variables DATABASE_POST_API_ROUTE and CONVEX_DEPLOYMENT must be set.")


# Global variables
model = None
active_cameras = {}
detection_results = []
recent_detections = set()
detection_cooldown = 20
# New: Track last upload time per camera
last_upload_time = {}
upload_interval = 10  # 10 seconds between uploads
executor = ThreadPoolExecutor(max_workers=4)

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
    executor.shutdown(wait=True)

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def upload_to_convex(data):
    try:
        payload = json.dumps(data)
        loop = asyncio.get_event_loop()
        res = await loop.run_in_executor(
            executor,
            lambda: requests.post(DATABASE_POST_API_ROUTE, payload)
        )
        res.raise_for_status()
        if res.status_code != status.HTTP_200_OK:
            raise HTTPException(status_code=res.status_code, detail=res.text)

        print("Data uploaded to Convex successfully")
    except Exception as e:
        print(f"Failed to upload to Convex: {e}")

async def push_notification(data):
    try:
        loop = asyncio.get_event_loop()
        # send message to telegram 
        payload = {
            'message': f"Elephant detected at {data['location']} with {data['confidence']:.1%} confidence.",
        }
        res = await loop.run_in_executor(
            executor,
            lambda: requests.post(
                os.getenv("TELEGRAM_BOT_MESSAGE_API_ROUTE"),
                json=payload
            )
        )
        res.raise_for_status()
        if res.status_code != status.HTTP_200_OK:
            raise HTTPException(status_code=res.status_code, detail=res.text)
        print("Telegram notification sent successfully")

        # Push notification - Fixed the json.dump to json.dumps
        notification_payload = json.dumps({
            "title": "Elephant Detected!",
            "body": f"Elephant detected at {data['location']} with {data['confidence']:.1%} confidence.",
            "redirectUrl": "/mobile"
        })
        
        # Use proper push notification endpoint
        push_notification_url = os.getenv("NOTIFICATIONS_API_ROUTE")
        
        res = await loop.run_in_executor(
            executor,
            lambda: requests.post(
                push_notification_url,
                data=notification_payload,
                headers={'Content-Type': 'application/json'}
            )
        )
        res.raise_for_status()
        if res.status_code != status.HTTP_200_OK:
            raise HTTPException(status_code=res.status_code, detail=res.text)
    
        print("Push notification sent successfully")
    except Exception as e:
        print(f"Failed to send push notification: {e}")

async def upload_to_imgbb(imgpath):
    """Upload image to imgbb and return URL"""
    try:
        loop = asyncio.get_event_loop()
        
        def upload_request():
            with open(imgpath, 'rb') as img_file:
                response = requests.post(
                    "https://api.imgbb.com/1/upload",
                    params={"key": os.getenv("IMGBB_API_KEY")},
                    files={"image": img_file}
                )
                response.raise_for_status()
                return response.json().get("data", {}).get("url", "")
        
        return await loop.run_in_executor(executor, upload_request)
    except Exception as e:
        print(f"Failed to upload image to imgbb: {e}")
        return ""

def create_detection_hash(frame, boxes):
    """Create a hash to identify similar detections"""
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
    
    expired_hashes = []
    for stored_hash, timestamp in list(recent_detections):
        if current_time - timestamp > detection_cooldown:
            expired_hashes.append((stored_hash, timestamp))
    
    for expired in expired_hashes:
        recent_detections.discard(expired)
    
    for stored_hash, timestamp in recent_detections:
        if stored_hash == detection_hash:
            return True
    
    return False

def should_upload_detection(camera_id):
    """Check if enough time has passed since last upload for this camera"""
    current_time = time.time()
    
    if camera_id not in last_upload_time:
        last_upload_time[camera_id] = 0
    
    time_since_last_upload = current_time - last_upload_time[camera_id]
    return time_since_last_upload >= upload_interval

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

def process_detection_async(frame, results, camera_id, camera_location, confidence):
    """Process detection in a separate thread"""
    def process():
        try:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
            detection_data = loop.run_until_complete(
                save_detection(frame, results, camera_id, camera_location, confidence)
            )
            detection_results.append(detection_data)
            
            # Only upload if enough time has passed
            if should_upload_detection(camera_id):
                # Run notifications and upload concurrently for better performance
                loop.run_until_complete(asyncio.gather(
                    push_notification(detection_data),
                    upload_to_convex(detection_data)
                ))

                last_upload_time[camera_id] = time.time()
                print(f"NEW ELEPHANT DETECTED & UPLOADED! Camera: {camera_id}, Confidence: {confidence:.2f}")
            else:
                time_remaining = upload_interval - (time.time() - last_upload_time[camera_id])
                print(f"Elephant detected but not uploaded (cooldown: {time_remaining:.1f}s remaining). Camera: {camera_id}, Confidence: {confidence:.2f}")
            
        except Exception as e:
            print(f"Error processing detection: {e}")
        finally:
            loop.close()
    
    # This already runs in background as a daemon thread
    threading.Thread(target=process, daemon=True).start()

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
        
        if frame_count % 5 == 0:
            try:
                results = model.predict(frame, conf=0.5, verbose=False)
                
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
                            detection_hash = create_detection_hash(frame, elephant_boxes)
                            
                            if not is_duplicate_detection(detection_hash):
                                recent_detections.add((detection_hash, time.time()))
                                
                                # Process detection asynchronously
                                process_detection_async(
                                    frame.copy(), results, camera_id, camera_location, confidence
                                )
                            
            except Exception as e:
                print(f"Error processing frame: {e}")
        
        time.sleep(0.1)

async def save_detection(frame, results, camera_id, camera_location, confidence=0.7):
    """Save detection snapshot"""
    timestamp = datetime.now()
    unique_id = int(timestamp.timestamp() * 1e6)
    
    # Run annotation in executor to avoid blocking
    loop = asyncio.get_event_loop()
    annotated_frame = await loop.run_in_executor(
        executor, 
        lambda: results[0].plot()
    )
    
    snapshot_filename = f"elephant_{camera_id}_{unique_id}.jpg"
    snapshot_path = os.path.join(snapshot_dir, snapshot_filename)
    
    # Save image in executor
    await loop.run_in_executor(
        executor,
        lambda: cv2.imwrite(snapshot_path, annotated_frame)
    )
    
    img_url = await upload_to_imgbb(snapshot_path)
    if not img_url:
        raise HTTPException(status_code=500, detail="Failed to upload image to imgbb")

    data = {
        "type": "elephant_detection",
        "camera_id": camera_id,
        "location": camera_location,
        "message": f"Elephant detected with {confidence:.1%} confidence!",
        "confidence": confidence,
        "timestamp": timestamp.isoformat(),
        "image_path": img_url,
    }
    
    return data

@app.get("/")
async def root():
    return {
        "message": "Elephant Detection System",
        "status": "running",
        "active_cameras": len(active_cameras),
        "total_detections": len(detection_results),
        "last_upload_times": {k: datetime.fromtimestamp(v).isoformat() if v > 0 else "Never" for k, v in last_upload_time.items()}
    }

@app.get("/main/")
async def get_main_camera_stream():
    """Get live camera stream with detection"""
    camera_id = "camera_1"
    
    if camera_id not in active_cameras:
        raise HTTPException(status_code=404, detail="Camera not found")
    
    async def generate_frames():
        cap = active_cameras[camera_id]
        loop = asyncio.get_event_loop()
        
        while True:
            success, frame = cap.read()
            if not success:
                break
            
            try:
                # Run detection in executor to avoid blocking
                results = await loop.run_in_executor(
                    executor,
                    lambda: model.predict(frame, conf=0.5, verbose=False)
                )
                
                # Process frame annotation in executor
                annotated_frame = await loop.run_in_executor(
                    executor,
                    lambda: process_frame_annotation(frame.copy(), results, camera_id)
                )
                                    
            except Exception as e:
                print(f"Live detection error: {e}")
                annotated_frame = frame
            
            # Encode frame in executor
            buffer = await loop.run_in_executor(
                executor,
                lambda: cv2.imencode('.jpg', annotated_frame)[1]
            )
            
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
            
            await asyncio.sleep(0.033)
    
    return StreamingResponse(generate_frames(), media_type="multipart/x-mixed-replace; boundary=frame")

def process_frame_annotation(frame, results, camera_id):
    """Process frame annotation in a separate thread"""
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
    
    # Show upload cooldown status
    camera_id_key = camera_id
    if camera_id_key in last_upload_time and last_upload_time[camera_id_key] > 0:
        time_since_upload = time.time() - last_upload_time[camera_id_key]
        if time_since_upload < upload_interval:
            cooldown_remaining = upload_interval - time_since_upload
            cv2.putText(annotated_frame, f"Upload cooldown: {cooldown_remaining:.1f}s", (10, 150), font, 0.5, (255, 165, 0), 2)
    
    if elephant_count > 0:
        cv2.putText(annotated_frame, f"LIVE: {elephant_count}", (10, 120), font, 0.8, (0, 0, 255), 3)
    
    return annotated_frame