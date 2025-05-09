from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

class Server:
  def __init__(self):
    self.app = FastAPI()
    self.app.add_middleware(
      CORSMiddleware,
      allow_origins=["*"],
      allow_credentials=True,
      allow_methods=["*"],
      allow_headers=["*"],
    )

    @self.app.get("/")
    async def root():
      return ({"message": "hello~"})
    
    @self.app.websocket("/ws/{camera_id}")
    async def camera_socket(websocket: WebSocket):
      await websocket.accept()

  def start(self, prot: int):
    pass