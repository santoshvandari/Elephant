from ultralytics import YOLO
import pygame
import cv2
import time

pygame.mixer.init()

model = YOLO("m.pt")

sound_file = "siren.mp3"
alert_sound = pygame.mixer.Sound(sound_file)

sound_playing = False
sound_start_time = 0
SOUND_DURATION = 4
SOUND_COOLDOWN = 10

cap = cv2.VideoCapture(0)

while cap.isOpened():
    success, frame = cap.read()
    if success:
        current_time = time.time()
        
        if sound_playing and current_time - sound_start_time >= SOUND_DURATION:
            pygame.mixer.stop()
            sound_playing = False
        
        results = model(frame, conf=0.75, classes=20)
        
        for r in results:
            boxes = r.boxes
            for box in boxes:
                if box.cls == 20 and not sound_playing:
                    if current_time - sound_start_time >= SOUND_DURATION + SOUND_COOLDOWN:
                        try:
                            alert_sound.play()
                            sound_playing = True
                            sound_start_time = current_time
                        except Exception as e:
                            print(f"Error playing sound: {e}")
        
        annotated_frame = results[0].plot()
        cv2.imshow("YOLOv8 Detection", annotated_frame)
        
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

cap.release()
cv2.destroyAllWindows()
pygame.mixer.quit()