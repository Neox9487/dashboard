from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

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

    # ?
    @self.app.get("/")
    async def root():
      return ({"message": "Hello! You got wrong site."})
    
    # for cameras
    @self.app.websocket("/ws/{camera_id}")
    async def camera_socket(websocket: WebSocket, camera_id: str):
      await websocket.accept()
      await websocket.close()

    # for camera manager
    @self.app.websocket("/ws/available_cameras")
    async def available_cameras(websocket: WebSocket):
      await websocket.accept()
      await websocket.close()

  def start(self):
    import uvicorn
    try:
      uvicorn.run(app = self.app, host=self.host, port=self.port)
    except Exception as e:
      print("Can't start server! Error: "+ e)