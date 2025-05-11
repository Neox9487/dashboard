import cv2 as cv
import threading

class Camera:
  def __init__(self, camera_id=0):
    self.camera_id = camera_id
    self.cap = None
    self.lock = threading.Lock()
    self._ensure_camera()

  def _ensure_camera(self):
    if self.cap is None or not self.cap.isOpened():
      self.release()
      self.cap = cv.VideoCapture(self.camera_id)

  def get_frame(self):
    with self.lock:
      self._ensure_camera()
      if self.cap is None or not self.cap.isOpened():
        raise RuntimeError("Camera not available")
      ret, frame = self.cap.read()
      if not ret or frame is None:
        raise RuntimeError("Failed to read frame.")
      return frame

  def release(self):
    if self.cap is not None:
      self.cap.release()
      self.cap = None


class CameraManager:
  def __init__(self):
    self.cameras = {}
    self.lock = threading.Lock()
    self.available_ids = self._detect_available_cameras()

  def _detect_available_cameras(self, max_check=8):
    available = []
    for i in range(max_check):
      cap = cv.VideoCapture(i)
      if cap is not None and cap.read()[0]:
        available.append(i)
        cap.release()
    return available

  def list_available_cameras(self):
    return self.available_ids

  def get_camera(self, camera_id: int) -> Camera:
    with self.lock:
      if camera_id not in self.available_ids:
        raise RuntimeError(f"Camera ID {camera_id} not available")
      if camera_id not in self.cameras:
        self.cameras[camera_id] = Camera(camera_id)
      return self.cameras[camera_id]

  def release_all(self):
    with self.lock:
      for cam in self.cameras.values():
        cam.release()
        self.cameras.clear()