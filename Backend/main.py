from fastapi import FastAPI,status, UploadFile, File
from fastapi.responses import HTTPException
from fastapi.middleware.cors import CORSMiddleware
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

@app.get("/")
async def root():
    return {"message": "Hello World"}

# Load the YOLO model
model = YOLO("yolov8n.pt")

@app.post("/detect/")
async def detect_elephant(file: UploadFile,camera: str):
    try:
        temp_file = f"temp_{file.filename}"
        with open(temp_file, "wb") as f:
            shutil.copyfileobj(file.file, f)
        results = model(temp_file)
        elephant_detected = False
        for result in results:
            if result.boxes:
                for box in result.boxes:
                    if int(box.cls[0]) == 0: # Change the class index to match the elephant class in your model
                        elephant_detected = True
                        break
            if elephant_detected:

                timestamp = datetime.now().isoformat()
                resp = requests.post(f"{DataPostAPIROUTE}/elephant-detection",
                                     json={"camera_location": camera,"timestamp": timestamp, "filename": file.filename})
                if resp.status_code != 200:
                    raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to post data to database")
                storage_id = resp.json().get("storageId")
                if not storage_id:
                    raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="No storage ID returned from database")
                return {"elephant_detected": elephant_detected, "storage_id": storage_id}
    except FileNotFoundError:
        return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found")
    except cv2.error as e:
        return HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"OpenCV error: {str(e)}")
    except Exception as e:
        return HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    finally:
        if os.path.exists(temp_file):
            os.remove(temp_file)