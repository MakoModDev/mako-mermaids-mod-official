import os
import sys
import platform

# Detect OS once at startup
OS = platform.system()  # "Linux", "Windows", "Darwin"

# Set Qt platform backend for Linux
if OS == "Linux":
    wayland_display = os.environ.get("WAYLAND_DISPLAY")
    xwayland_available = os.environ.get("DISPLAY")  # XWayland sets $DISPLAY too

    if wayland_display and xwayland_available:
        # Wayland + XWayland present — use X11 compatibility layer (most common case)
        os.environ["QT_QPA_PLATFORM"] = "xcb"
        print("[System] Wayland detected with XWayland — using xcb backend")
    elif wayland_display:
        # Pure Wayland, no XWayland — use native Wayland backend
        os.environ["QT_QPA_PLATFORM"] = "wayland"
        print("[System] Pure Wayland detected — using wayland backend")
    else:
        # Plain X11
        os.environ["QT_QPA_PLATFORM"] = "xcb"
        print("[System] X11 detected — using xcb backend")

import cv2
import mediapipe as mp
import json
import time
import math
import traceback
import glob
from collections import deque


class H2OGestureController:
    def __init__(self):
        user_home = os.path.expanduser("~")
        self.output_file = os.path.join(user_home, "minecraft_gestures.json")

        print(f"[System] Detected OS: {OS}")
        print("[AI] Loading AI models... (please wait)")

        self.mp_hands = mp.solutions.hands
        self.hands = self.mp_hands.Hands(
            static_image_mode=False,
            max_num_hands=1,
            min_detection_confidence=0.7,
            min_tracking_confidence=0.5
        )
        self.mp_draw = mp.solutions.drawing_utils

        self.current_gesture = "none"
        self.gesture_history = deque(maxlen=5)

        print("[Camera] Starting initial camera search...")
        self.cap = self.find_camera()

    # ------------------------------------------------------------------
    # Camera finding — per-OS strategy
    # ------------------------------------------------------------------

    def find_camera(self):
        if OS == "Linux":
            return self._find_camera_linux()
        elif OS == "Windows":
            return self._find_camera_windows()
        elif OS == "Darwin":
            return self._find_camera_mac()
        else:
            print(f"[Camera] Unknown OS '{OS}', falling back to default index scan...")
            return self._find_camera_fallback()

    def _find_camera_linux(self):
        """Linux: scan /dev/video* with the V4L2 backend (unchanged from original)."""
        devices = sorted(glob.glob("/dev/video*"))

        if not devices:
            print("❌ WARNING: No camera devices found under /dev/video*!")
            return None

        print(f"[Camera] System scan found: {devices}")

        for device in devices:
            print(f"[Camera] Testing {device}...")
            try:
                cap = cv2.VideoCapture(device, cv2.CAP_V4L2)

                if cap is not None and cap.isOpened():
                    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
                    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

                    ret, frame = cap.read()
                    if ret and frame is not None:
                        print(f"✅ SUCCESS: Camera connected on {device} ({frame.shape[1]}x{frame.shape[0]})")
                        return cap
                    else:
                        print(f"⚠️  {device} opened but delivers no frames (skipping).")
                    cap.release()
                else:
                    print(f"❌ {device} could not be opened.")
            except Exception as e:
                print(f"❌ Error accessing {device}: {e}")
                continue

        print("❌ No working camera found on Linux.")
        return None

    def _find_camera_windows(self):
        """Windows: use DirectShow backend, scan indices 0-4."""
        print("[Camera] Using Windows DirectShow backend...")

        for index in range(5):
            print(f"[Camera] Testing index {index}...")
            try:
                cap = cv2.VideoCapture(index, cv2.CAP_DSHOW)

                if cap is not None and cap.isOpened():
                    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
                    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

                    ret, frame = cap.read()
                    if ret and frame is not None:
                        print(f"✅ SUCCESS: Camera connected on index {index} ({frame.shape[1]}x{frame.shape[0]})")
                        return cap
                    else:
                        print(f"⚠️  Index {index} opened but delivers no frames (skipping).")
                    cap.release()
                else:
                    print(f"❌ Index {index} could not be opened.")
            except Exception as e:
                print(f"❌ Error accessing camera index {index}: {e}")
                continue

        print("❌ No working camera found on Windows.")
        return None

    def _find_camera_mac(self):
        """macOS: use AVFoundation backend, scan indices 0-4."""
        print("[Camera] Using macOS AVFoundation backend...")

        for index in range(5):
            print(f"[Camera] Testing index {index}...")
            try:
                cap = cv2.VideoCapture(index, cv2.CAP_AVFOUNDATION)

                if cap is not None and cap.isOpened():
                    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
                    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

                    ret, frame = cap.read()
                    if ret and frame is not None:
                        print(f"✅ SUCCESS: Camera connected on index {index} ({frame.shape[1]}x{frame.shape[0]})")
                        return cap
                    else:
                        print(f"⚠️  Index {index} opened but delivers no frames (skipping).")
                    cap.release()
                else:
                    print(f"❌ Index {index} could not be opened.")
            except Exception as e:
                print(f"❌ Error accessing camera index {index}: {e}")
                continue

        print("❌ No working camera found on macOS.")
        return None

    def _find_camera_fallback(self):
        """Generic fallback: try indices 0-4 with the default backend."""
        for index in range(5):
            try:
                cap = cv2.VideoCapture(index)
                if cap is not None and cap.isOpened():
                    ret, frame = cap.read()
                    if ret and frame is not None:
                        print(f"✅ SUCCESS: Camera connected on index {index}")
                        return cap
                    cap.release()
            except Exception:
                continue
        return None

    # ------------------------------------------------------------------
    # Gesture detection (unchanged)
    # ------------------------------------------------------------------

    def detect_power(self, landmarks):
        if not landmarks or len(landmarks) < 21:
            return "none"

        wrist = landmarks[0]
        tips = [4, 8, 12, 16, 20]
        pips = [3, 6, 10, 14, 18]

        def dist(p1, p2):
            return math.hypot(p1.x - p2.x, p1.y - p2.y)

        fingers = []
        fingers.append(abs(landmarks[tips[0]].x - landmarks[pips[0]].x) > 0.05)

        for i in range(1, 5):
            tip_dist = dist(wrist, landmarks[tips[i]])
            pip_dist = dist(wrist, landmarks[pips[i]])
            fingers.append(tip_dist > pip_dist * 1.15)

        if all(f is False for f in fingers) or fingers == [True, False, False, False, False]:
            return "boil"
        elif fingers[1] and fingers[2] and fingers[3] and fingers[4]:
            return "freeze"
        elif fingers[1] and not fingers[2] and not fingers[3] and not fingers[4]:
            return "move"

        return "none"

    # ------------------------------------------------------------------
    # JSON output (unchanged)
    # ------------------------------------------------------------------

    def write_to_minecraft(self, power):
        data = {
            "power": power,
            "active": power != "none",
            "timestamp": time.time()
        }
        try:
            temp_file = self.output_file + ".tmp"
            with open(temp_file, "w") as f:
                json.dump(data, f)
            os.replace(temp_file, self.output_file)
        except Exception as e:
            print(f"❌ Error writing JSON: {e}")

    # ------------------------------------------------------------------
    # Main loop (unchanged logic, English messages)
    # ------------------------------------------------------------------

    def run(self):
        print("\n=== H2O GESTURE CONTROLLER STARTED ===")
        print(f"Output file: {self.output_file}")
        print("-" * 40)

        consecutive_failures = 0

        try:
            while True:
                if self.cap is None or not self.cap.isOpened():
                    print("🔄 No active camera. Starting search...")
                    self.cap = self.find_camera()
                    if self.cap is None:
                        print("⏳ No camera found. Waiting 3 seconds...")
                        time.sleep(3)
                        continue

                success, image = self.cap.read()

                if not success or image is None:
                    consecutive_failures += 1
                    if consecutive_failures > 10:
                        print("⚠️  Connection lost. Resetting camera...")
                        if self.cap:
                            self.cap.release()
                        self.cap = None
                        consecutive_failures = 0
                    time.sleep(0.1)
                    continue

                consecutive_failures = 0
                image = cv2.flip(image, 1)
                img_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
                results = self.hands.process(img_rgb)
                detected_power = "none"

                if results.multi_hand_landmarks:
                    for hand_landmarks in results.multi_hand_landmarks:
                        self.mp_draw.draw_landmarks(
                            image,
                            hand_landmarks,
                            self.mp_hands.HAND_CONNECTIONS
                        )
                        detected_power = self.detect_power(hand_landmarks.landmark)

                self.gesture_history.append(detected_power)

                if self.gesture_history.count(detected_power) >= 3:
                    if detected_power != self.current_gesture:
                        self.current_gesture = detected_power
                        self.write_to_minecraft(detected_power)
                        print(f"🔥 Power: {detected_power}")

                color = (0, 0, 255) if self.current_gesture == "none" else (0, 255, 0)
                cv2.putText(
                    image,
                    f"Power: {self.current_gesture.upper()}",
                    (10, 50),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    1,
                    color,
                    2
                )

                try:
                    cv2.imshow("H2O Gesture Interface", image)
                except Exception:
                    pass

                if cv2.waitKey(5) & 0xFF == 27:
                    print("Exiting via ESC key...")
                    break

        except KeyboardInterrupt:
            print("\nScript stopped manually.")
        finally:
            print("[System] Cleaning up resources...")
            if self.cap is not None:
                self.cap.release()
            self.hands.close()
            cv2.destroyAllWindows()
            print("[System] Done.")


if __name__ == "__main__":
    try:
        app = H2OGestureController()
        app.run()
    except Exception:
        print("\n" + "!" * 20 + " CRITICAL ERROR " + "!" * 20)
        traceback.print_exc()
        print("!" * 56)
        input("Press ENTER to close...")
