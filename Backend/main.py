from fastapi import FastAPI,status, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from ultralytics import YOLO
import cv2
import shutil
import os
import requests
from datetime import datetime
from dotenv import load_dotenv
load_dotenv()

DataPostAPIROUTE= os.getenv("DATABASE_POST_API_ROUTE")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/snapshots", StaticFiles(directory="snapshots"), name="snapshots")

@app.get("/")
async def root():
    return {"message": "Hello World"}

# Load the YOLO model
try:
    model = YOLO("./model/best.pt")  # Ensure the path to your YOLO model is correct
except Exception as e:
    raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to load YOLO model: {str(e)}")

snapshot_dir = "snapshots"
if not os.path.exists(snapshot_dir):
    os.makedirs(snapshot_dir)

@app.post("/detect/")
async def detect_elephant(file: UploadFile, camera: str):
    try:
        temp_file = f"temp_{file.filename}"
        with open(temp_file, "wb") as f:
            shutil.copyfileobj(file.file, f)
        
        frame = cv2.imread(temp_file)
        if frame is None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid image file")
        
        results = model(frame, classes=[20], conf=0.8)  # Only detect elephants (class 20)
        
        elephant_detected = False
        for result in results:
            if result.boxes:
                for box in result.boxes:
                    if int(box.cls[0]) == 20:  # Change the class index to match the elephant class in your model
                        elephant_detected = True
                        break
        
        if elephant_detected:
            # Create annotated frame and save snapshot
            annotated_frame = results[0].plot()
            timestamp = datetime.now().isoformat().replace(':', '-')  # Replace colons for filename compatibility
            snapshot_filename = f"elephant_detection_{camera}_{timestamp}.jpg"
            snapshot_path = os.path.join(snapshot_dir, snapshot_filename)
            cv2.imwrite(snapshot_path, annotated_frame)
            
            # Post data to database
            # resp = requests.post(f"{DataPostAPIROUTE}/elephant-detection",
            #                     json={"camera_location": camera, "timestamp": datetime.now().isoformat(), "filename": snapshot_filename})
            # if resp.status_code != 200:
            #     raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to post data to database")
            
            # storage_id = resp.json().get("storageId")
            # if not storage_id:
            #     raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="No storage ID returned from database")
            
            # return {"elephant_detected": True, "storage_id": storage_id, "snapshot_path": snapshot_path}
            return {"elephant_detected": True, "snapshot_path": snapshot_path}
        else:
            return {"elephant_detected": False}
            
    except FileNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")
    except cv2.error as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"OpenCV error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    finally:
        if os.path.exists(temp_file):
            os.remove(temp_file)