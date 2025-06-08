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
import asyncio
from contextlib import asynccontextmanager

load_dotenv()

DataPostAPIROUTE = os.getenv("DATABASE_POST_API_ROUTE")

# Global variables
model = None
camera_alert_states = {}
frame_skip = 2  # Process every 2nd frame for performance
active_cameras = {}
detection_results = []

# Create snapshots directory
snapshot_dir = "snapshots"
if not os.path.exists(snapshot_dir):
    os.makedirs(snapshot_dir)

# Initialize model and start camera monitoring
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    global model
    try:
        model = YOLO("./model/best.pt")
        print("YOLO model loaded successfully")
    except Exception as e:
        print(f"Failed to load YOLO model: {str(e)}")
        raise
    
    # Start camera monitoring
    await start_camera_monitoring()
    
    yield
    
    # Shutdown
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

# Mount static files for snapshots
app.mount("/snapshots", StaticFiles(directory="snapshots"), name="snapshots")

async def start_camera_monitoring():
    """Start monitoring all available cameras"""
    # Define cameras to monitor (you can modify this list)
    cameras_config = [
        {"id": "camera_1", "source": 0, "location": "Main Entrance"},  # Default webcam
        # {"id": "camera_2", "source": "path/to/video.mp4", "location": "Garden Area"},  # Video file
        # {"id": "camera_3", "source": "rtsp://camera_ip:port/stream", "location": "Back Yard"},  # IP camera
    ]
    
    for camera_config in cameras_config:
        threading.Thread(
            target=monitor_camera,
            args=(camera_config["id"], camera_config["source"], camera_config["location"]),
            daemon=True
        ).start()
        print(f"Started monitoring {camera_config['id']} at {camera_config['location']}")

def monitor_camera(camera_id, camera_source, camera_location):
    """Monitor a single camera for elephant detection"""
    global active_cameras, camera_alert_states
    
    cap = cv2.VideoCapture(camera_source)
    if not cap.isOpened():
        print(f"Failed to open camera {camera_id}")
        return
    
    active_cameras[camera_id] = cap
    
    # Initialize camera alert state
    if camera_id not in camera_alert_states:
        camera_alert_states[camera_id] = {
            'snapshot_taken': False,
            'last_alert_time': 0,
            'alert_cooldown': 30  # Seconds between alerts
        }
    
    frame_count = 0
    alert_state = camera_alert_states[camera_id]
    
    while True:
        success, frame = cap.read()
        if not success:
            print(f"Failed to read from camera {camera_id}")
            break
        
        frame_count += 1
        
        # Process every nth frame for performance
        if frame_count % frame_skip == 0:
            try:
                # Detect only elephants - using conf=0.8 for higher accuracy
                results = model.predict(frame, conf=0.8, verbose=False)
                
                current_time = time.time()
                
                # Check for elephant detections
                elephant_detected = False
                for r in results:
                    if r.boxes is not None and len(r.boxes) > 0:
                        boxes = r.boxes
                        for box in boxes:
                            cls_id = int(box.cls[0])
                            confidence = float(box.conf[0])
                            class_name = model.names[cls_id]
                            
                            # Check if detected object is an elephant
                            if (class_name.lower() == 'elephant' and confidence > 0.8 and 
                                not alert_state['snapshot_taken'] and 
                                (current_time - alert_state['last_alert_time'] > alert_state['alert_cooldown'])):
                                
                                elephant_detected = True
                                
                                # Save detection
                                detection_data = save_detection(frame, results, camera_id, camera_location, confidence, class_name)
                                detection_results.append(detection_data)
                                
                                # Update alert state
                                alert_state['snapshot_taken'] = True
                                alert_state['last_alert_time'] = current_time
                                
                                # Post to database if API route is configured
                                if DataPostAPIROUTE:
                                    try:
                                        resp = requests.post(f"{DataPostAPIROUTE}/elephant-detection", 
                                                           json=detection_data, timeout=5)
                                        if resp.status_code == 200:
                                            print(f"Detection data posted successfully for {camera_id}")
                                        else:
                                            print(f"Failed to post detection data: {resp.status_code}")
                                    except Exception as e:
                                        print(f"Error posting to database: {str(e)}")
                                
                                # Reset alert flag after cooldown
                                def reset_alert():
                                    alert_state['snapshot_taken'] = False
                                
                                threading.Timer(alert_state['alert_cooldown'], reset_alert).start()
                                break
                            
            except Exception as e:
                print(f"Error processing frame from {camera_id}: {str(e)}")
        
        # Small delay to prevent excessive CPU usage
        time.sleep(0.1)

def save_detection(frame, results, camera_id, camera_location, confidence, class_name):
    """Save detection snapshot and return detection data"""
    timestamp = datetime.now()
    unique_id = int(timestamp.timestamp() * 1e6)
    
    # Create annotated frame
    annotated_frame = results[0].plot()
    
    # Save snapshot
    snapshot_filename = f"elephant_{camera_id}_{unique_id}.jpg"
    snapshot_path = os.path.join("snapshots", snapshot_filename)
    
    success = cv2.imwrite(snapshot_path, annotated_frame)
    if success:
        print(f"Detection snapshot saved: {snapshot_path}")
    else:
        print(f"Failed to save snapshot: {snapshot_path}")
    
    # Prepare detection data
    detection_data = {
        "type": "elephant_detection",
        "camera_id": camera_id,
        "camera_name": f"Camera {camera_id}",
        "location": camera_location,
        "detected_class": class_name,
        "message": f"Elephant detected with {confidence:.1%} confidence!",
        "confidence": confidence,
        "timestamp": timestamp.isoformat(),
        "image_path": snapshot_path,
        "image_url": f"/snapshots/{snapshot_filename}"
    }
    
    return detection_data
    # save to the convex db too


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
    """Get live stream from the main camera with real-time detection"""
    camera_id = "camera_1"  # Default main camera
    
    if camera_id not in active_cameras:
        raise HTTPException(status_code=404, detail="Main camera not found or not active")
    
    def generate_frames():
        cap = active_cameras[camera_id]
        
        while True:
            success, frame = cap.read()
            if not success:
                print(f"Failed to read frame from {camera_id}")
                break
            
            try:
                # Run detection on frame for live visualization with higher confidence
                results = model.predict(frame, conf=0.5, verbose=False)
                
                # Draw detection boxes on frame only for elephants
                annotated_frame = frame.copy()
                
                elephant_count = 0
                for r in results:
                    if r.boxes is not None and len(r.boxes) > 0:
                        boxes = r.boxes
                        for box in boxes:
                            cls_id = int(box.cls[0])
                            confidence = float(box.conf[0])
                            class_name = model.names[cls_id]
                            
                            # Only draw boxes for elephants
                            if class_name.lower() == 'elephant':
                                elephant_count += 1
                                
                                # Get box coordinates
                                x1, y1, x2, y2 = box.xyxy[0]
                                x1, y1, x2, y2 = int(x1), int(y1), int(x2), int(y2)
                                
                                # Draw bounding box
                                cv2.rectangle(annotated_frame, (x1, y1), (x2, y2), (0, 0, 255), 2)
                                
                                # Draw label
                                label = f"Elephant: {confidence:.2f}"
                                font = cv2.FONT_HERSHEY_SIMPLEX
                                cv2.putText(annotated_frame, label, (x1, y1-10), font, 0.5, (0, 0, 255), 2)
                
                # Add timestamp and camera info overlay
                now = datetime.now()
                current_time = now.strftime("%Y-%m-%d %H:%M:%S")
                font = cv2.FONT_HERSHEY_SIMPLEX
                cv2.putText(annotated_frame, current_time, (10, 30), font, 0.5, (0, 255, 0), 2, cv2.LINE_AA)
                cv2.putText(annotated_frame, f"Camera: {camera_id}", (10, 60), font, 0.5, (0, 255, 0), 2, cv2.LINE_AA)
                
                if elephant_count > 0:
                    cv2.putText(annotated_frame, f"ELEPHANTS DETECTED: {elephant_count}", (10, 90), font, 0.8, (0, 0, 255), 3, cv2.LINE_AA)
                else:
                    cv2.putText(annotated_frame, "No elephants detected", (10, 90), font, 0.6, (0, 255, 0), 2, cv2.LINE_AA)
                
            except Exception as e:
                print(f"Error in live detection: {str(e)}")
                annotated_frame = frame
                # Add basic overlay even if detection fails
                now = datetime.now()
                current_time = now.strftime("%Y-%m-%d %H:%M:%S")
                font = cv2.FONT_HERSHEY_SIMPLEX
                cv2.putText(annotated_frame, current_time, (10, 30), font, 0.6, (0, 255, 0), 2, cv2.LINE_AA)
                cv2.putText(annotated_frame, f"Camera: {camera_id}", (10, 60), font, 0.6, (0, 255, 0), 2, cv2.LINE_AA)
            
            # Encode frame
            _, buffer = cv2.imencode('.jpg', annotated_frame)
            frame_bytes = buffer.tobytes()
            
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
            
            time.sleep(0.033)  # ~30 FPS
    
    return StreamingResponse(generate_frames(), media_type="multipart/x-mixed-replace; boundary=frame")
