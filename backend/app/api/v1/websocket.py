from typing import Dict, List
import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        # delivery_id -> list of connected WebSockets
        self.active_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, delivery_id: int, websocket: WebSocket):
        await websocket.accept()
        if delivery_id not in self.active_connections:
            self.active_connections[delivery_id] = []
        self.active_connections[delivery_id].append(websocket)

    def disconnect(self, delivery_id: int, websocket: WebSocket):
        if delivery_id in self.active_connections:
            if websocket in self.active_connections[delivery_id]:
                self.active_connections[delivery_id].remove(websocket)
            if not self.active_connections[delivery_id]:
                del self.active_connections[delivery_id]

    async def broadcast_location(self, delivery_id: int, message: dict):
        if delivery_id in self.active_connections:
            for connection in self.active_connections[delivery_id]:
                try:
                    await connection.send_json(message)
                except Exception:
                    pass

manager = ConnectionManager()

@router.websocket("/ws/tracking/{delivery_id}")
async def websocket_tracking_endpoint(websocket: WebSocket, delivery_id: int):
    await manager.connect(delivery_id, websocket)
    try:
        while True:
            # Receive client ping or rider coords
            data = await websocket.receive_text()
            try:
                payload = json.loads(data)
                # If payload has latitude/longitude, broadcast to all listeners for this delivery
                if "latitude" in payload and "longitude" in payload:
                    await manager.broadcast_location(delivery_id, payload)
            except Exception:
                pass
    except WebSocketDisconnect:
        manager.disconnect(delivery_id, websocket)
