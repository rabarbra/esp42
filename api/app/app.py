import uvicorn
from typing import Dict, List, Literal, Any
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import RedirectResponse
from mangum import Mangum

app = FastAPI()
handler = Mangum(app)

frontend_endpoint = 'http://localhost:3000'

class WsConnectionManager:
    def __init__(self) -> None:
        self.web: Dict[str, WebSocket] = {}
        self.esp: Dict[str, WebSocket] = {}
        self.web_esp: Dict[str, List[str]] = {}

    async def connect(
            self, websocket: WebSocket,
            client_id: str, kind: Literal['web', 'esp']
    ):
        await websocket.accept()
        if (kind == 'esp'):
            self.esp.update({client_id: websocket})
        else:
            self.web.update({client_id: websocket})
            self.web_esp.update({client_id: []})

    async def disconnect(self, client_id: str, kind: Literal['web', 'esp']):
        if (kind == 'esp' and client_id in self.esp):
            del self.esp[client_id]
        elif client_id in self.web:
            del self.web[client_id]
            del self.web_esp[client_id]

    async def connect_esp(self, web_id: str, esp_id: str):
        if (web_id in self.web and esp_id in self.esp):
            for _, val in self.web_esp.items():
                if esp_id in val:
                    return
            self.web_esp[web_id].append(esp_id)
            self.broadcast_web('taken')

    async def send_response_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast_web(self, message: str, client_id: str | None = None):
    	for id, connection in self.web.items():
            if not client_id or client_id != id:
                await connection.send_text(message)

    async def broadcast_esp(self, message: str):
        for _, connection in self.esp.items():
            await connection.send_text(message)
	
    async def send_to_web(self, message: str, client_id: str):
        await self.web[client_id].send_text(message)

    async def send_to_esp(
            self, message: Dict[str, Any],
            web_id: str, esp_id: str
    ):
        if (web_id in self.web_esp and esp_id in self.web_esp[web_id]):
            await self.esp[esp_id].send_json(message)

manager = WsConnectionManager()

@app.get("/")
async def get():
    return RedirectResponse(frontend_endpoint)

@app.websocket("/ws_web/{client_id}")
async def ws_web_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(websocket, client_id, 'web')
    try:
        while True:
            data: Dict[str, str] = await websocket.receive_json()
            print(f"Recived: {data}")
            if 'op' not in data:
                continue
            if (data['op'] == 'cnct_esp' and 'data' in data):
                await manager.connect_esp(client_id, data['data'].get('esp_id', None))
            elif (data['op'] == 'msg_esp' and 'data' in data):
                await manager.send_to_esp(data['data'].get('json'), client_id, data['data'].get('esp_id'))
    except WebSocketDisconnect:
        manager.disconnect(client_id, 'web')

@app.websocket("/ws_esp/{client_id}")
async def ws_esp_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(websocket, client_id, 'esp')
    manager.broadcast_web('connected');
    try:
        while True:
            data = await websocket.receive_text()
            await manager.broadcast_web(f"ESP #{client_id} says: {data}", client_id)
    except WebSocketDisconnect:
        manager.disconnect(client_id, 'esp')

if __name__ == "__main__":
   uvicorn.run(app, host="0.0.0.0", port=8080)