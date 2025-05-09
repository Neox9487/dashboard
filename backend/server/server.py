from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from modules import CameraManager, Json

import cv2 as cv
import base64

class Server:
  def __init__(self, host = "0.0.0.0", port = 8000):
    self.app = FastAPI()
    self.app.add_middleware(
      CORSMiddleware,
      allow_origins=["*"],
      allow_credentials=True,
      allow_methods=["*"],
      allow_headers=["*"],
    )
    self.port = port
    self.host = host
    self.camera_manager = CameraManager()

    # ?
    @self.app.get("/")
    async def root():
      return ({"message": "Hello! You got wrong site."})
    
    # get camera settings
    @self.app.get("/camera_settings")
    async def camera_settings():
      return({"message": "Not done yet."})
    
    # for cameras
    @self.app.websocket("/ws/{camera_id}")
    async def camera_socket(websocket: WebSocket, camera_id: int):
      await websocket.accept()
      try:
        camera = self.camera_manager.get_camera(camera_id)
        while True:
          frame = camera.get_frame()
          _, img_encoded = cv.imencode('.jpg', frame)
          img_base64 = base64.b64encode(img_encoded).decode('utf-8')
          await websocket.send_text(Json.dumps({"image": img_base64}))
      except Exception as e:
         print(f"Error: {e}")
      finally:
        await websocket.close()

    # for available cameras
    @self.app.websocket("/ws/available_cameras")
    async def available_cameras(websocket: WebSocket):
      await websocket.accept()
      try:
        available_cameras = self.camera_manager.list_available_cameras()
        await websocket.send_text(Json.dumps({"available_cameras": available_cameras}))
      finally:
        await websocket.close()

  def start(self):
    import uvicorn
    try:
      uvicorn.run(app=self.app, host=self.host, port=self.port)
    except Exception as e:
      print(f"Can't start server! Error: {e}")