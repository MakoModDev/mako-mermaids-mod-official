os.environ["QT_QPA_PLATFORM"] = "xcb"
import cv2
import mediapipe as mp
import json
import time
import os
import sys
import math
from collections import deque
import traceback # To see errors


class H2OGestureController:
    def __init__(self):
        # --- WICHTIGE ÄNDERUNG HIER ---
        # Wir speichern die Datei jetzt im Home-Verzeichnis des Nutzers.
        # Das passt zum Java Code: System.getProperty("user.home")
        user_home = os.path.expanduser("~")
        self.output_file = os.path.join(user_home, "minecraft_gestures.json")
        
        print(f"Loading AI Models... (This might take a moment)")
        
        # Setup MediaPipe
        self.mp_hands = mp.solutions.hands
        self.hands = self.mp_hands.Hands(
            static_image_mode=False,
            max_num_hands=1,
            min_detection_confidence=0.7,
            min_tracking_confidence=0.5
        )
        self.mp_draw = mp.solutions.drawing_utils
        
        # Stabilization
        self.current_gesture = "none"
        self.gesture_history = deque(maxlen=5)
        
        # Start Webcam
        print("Opening Camera...")
        self.cap = cv2.VideoCapture(0)
        if not self.cap.isOpened():
            raise Exception("Could not open webcam! Is it connected?")

    def detect_power(self, landmarks):
        """Calculates gestures based on distance to wrist"""
        if not landmarks:
            return "none"
            
        wrist = landmarks[0]
        tips = [4, 8, 12, 16, 20]
        pips = [3, 6, 10, 14, 18] # Finger joints
        
        fingers = []

        def get_dist(p1, p2):
            return math.hypot(p1.x - p2.x, p1.y - p2.y)

        # 1. Thumb (Side check)
        fingers.append(abs(landmarks[tips[0]].x - landmarks[pips[0]].x) > 0.05)
            
        # 2. Fingers (Distance check: Tip further from wrist than joint?)
        for i in range(1, 5):
            tip_dist = get_dist(wrist, landmarks[tips[i]])
            pip_dist = get_dist(wrist, landmarks[pips[i]])
            fingers.append(tip_dist > pip_dist * 1.05)
            
        # --- LOGIC ---
        
        # Fist -> BOIL (Rikki)
        if all(f is False for f in fingers) or fingers == [True, False, False, False, False]:
            return "boil" 
            
        # Open Hand -> FREEZE (Emma/Bella)
        elif fingers[1] and fingers[2] and fingers[3] and fingers[4]:
            return "freeze"
            
        # Pointing -> MOVE (Cleo)
        elif fingers[1] and not fingers[2] and not fingers[3] and not fingers[4]:
            return "move"

        return "none"

    def write_to_minecraft(self, power):
        data = {
            "power": power,
            "active": power != "none",
            "timestamp": time.time()
        }
        try:
            temp_file = self.output_file + ".tmp"
            with open(temp_file, 'w') as f:
                json.dump(data, f)
            os.replace(temp_file, self.output_file)
        except Exception as e:
            print(f"Error writing file: {e}")

    def run(self):
        print(f"=== H2O MAGIC CONTROLLER STARTED ===")
        print(f"Target File: {self.output_file}")
        print("-" * 40)
        print("Instructions:")
        print("1. Keep this window open.")
        print("2. Use gestures to control water in Minecraft.")
        print("-" * 40)
        print("✋ OPEN HAND = FREEZE (Ice/Jelly)")
        print("✊ FIST      = BOIL (Heat/Steam)")
        print("☝️ POINTING  = MOVE (Water Control)")
        print("-" * 40)
        print("Press 'ESC' in the camera window to exit.")
        
        while self.cap.isOpened():
            success, image = self.cap.read()
            if not success:
                print("Ignoring empty camera frame.")
                continue

            image = cv2.flip(image, 1)
            img_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            results = self.hands.process(img_rgb)
            
            detected_power = "none"
            
            if results.multi_hand_landmarks:
                for hand_landmarks in results.multi_hand_landmarks:
                    self.mp_draw.draw_landmarks(image, hand_landmarks, self.mp_hands.HAND_CONNECTIONS)
                    detected_power = self.detect_power(hand_landmarks.landmark)
            
            self.gesture_history.append(detected_power)
            if self.gesture_history.count(detected_power) >= 3:
                if detected_power != self.current_gesture:
                    self.current_gesture = detected_power
                    self.write_to_minecraft(detected_power)
                    print(f"> Power Active: {detected_power.upper()}")

            # GUI Text
            color = (0, 0, 255) if self.current_gesture == "none" else (0, 255, 0)
            cv2.putText(image, f"Power: {self.current_gesture.upper()}", (10, 50), 
                        cv2.FONT_HERSHEY_SIMPLEX, 1, color, 2)
            
            cv2.imshow('H2O Gesture Interface', image)
            if cv2.waitKey(5) & 0xFF == 27: 
                break
                
        self.cap.release()
        cv2.destroyAllWindows()

if __name__ == "__main__":
    try:
        app = H2OGestureController()
        app.run()
    except Exception as e:
        # ERROR HANDLING - Keeps window open!
        print("\n" + "!"*20 + " CRITICAL ERROR " + "!"*20)
        traceback.print_exc()
        print("!"*56)
        input("Press ENTER to close this window...")
