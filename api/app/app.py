"""Websockets api"""

import json
import logging
import asyncio
from typing import Dict, List, Literal, Any

import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, websockets
from fastapi.responses import RedirectResponse

FRONTEND_ENDPOINT = 'http://esp42.eu'

logger = logging.getLogger(__name__)
uvicorn.Config(
    'esp42',
    log_config = {
        'version': 1,
        "disable_existing_loggers": True,
        "formatters":{
            "default":{
                "()":"uvicorn.logging.DefaultFormatter",
                "fmt": "%(levelprefix)s %(message)s",
                "use_colors":"None"
            }
        },
        "handlers": {
            "default": {
               "formatter":"default",
               "class":"logging.StreamHandler",
               "stream":"ext://sys.stderr"
            }
        },
        'loggers': {
            logger.name: {
                "handlers":[
                    "default"
                ],
                "level":"INFO"
            }
        }
    }
)

app = FastAPI()

class WsConnectionManager:
    """Connection manager for websockets"""
    def __init__(self) -> None:
        self.web: Dict[str, WebSocket] = {}
        self.esp: Dict[str, WebSocket] = {}
        self.web_esp: Dict[str, List[str]] = {}

    async def connect(
            self, websocket: WebSocket,
            client_id: str, kind: Literal['web', 'esp']
    ):
        """Connect websocket"""
        await websocket.accept()
        if kind == 'esp':
            self.esp.update({client_id: websocket})
        else:
            self.web.update({client_id: websocket})
            self.web_esp.update({client_id: []})

    async def disconnect(self, client_id: str, kind: Literal['web', 'esp']):
        """Disconnect websocket"""
        if kind == 'esp' and client_id in self.esp:
            del self.esp[client_id]
        elif client_id in self.web:
            del self.web[client_id]
            del self.web_esp[client_id]

    async def is_active(self, client_id: str, kind: Literal["web", "esp"]):
        """Check if connection is active"""
        if kind == "esp" and client_id not in self.esp:
            return False
        if kind == "web" and client_id not in self.web:
            return False
        ws = self.web.get(client_id) if kind == "web" else self.esp.get(client_id)
        if not ws:
            return False
        if ws.application_state != websockets.WebSocketState.CONNECTED:
            return False
        try:
            await ws.send_json({"op": 9})
            msg = await asyncio.wait_for(ws.receive_text(), 10000)
            logger.info("Msg: %s", msg)
            assert msg == "ok"
            return True
        except Exception:
            return False

    async def connect_esp(self, web_id: str, esp_id: str):
        """Attach esp to web client"""
        if web_id in self.web and esp_id in self.esp:
            for _, val in self.web_esp.items():
                if esp_id in val:
                    logger.info("Already connected")
                    await self.send_to_web(json.dumps({"srv": "busy", "esp_id": esp_id}), web_id)
                    return
            self.web_esp[web_id].append(esp_id)
            logger.info("Connected")
            await self.send_to_web(json.dumps({"srv": "connected", "esp_id": esp_id}), web_id)

    async def broadcast_web(self, message: str, client_id: str | None = None):
        """Broadcast message to web clients"""
        for _id, connection in self.web.items():
            if not client_id or client_id != _id:
                await connection.send_text(message)

    async def broadcast_esp(self, message: str):
        """Broadcast message to esp clients"""
        for _, connection in self.esp.items():
            await connection.send_text(message)

    async def send_to_web(self, message: str, client_id: str):
        """Send message to web client"""
        if client_id in self.web:
            await self.web[client_id].send_text(message)

    async def send_to_esp(
            self, message: Dict[str, Any],
            web_id: str, esp_id: str
    ):
        """Send message to esp"""
        logger.info("web_esp: %s esp: %s", self.web_esp, self.esp)
        #if web_id in self.web_esp and esp_id in self.web_esp[web_id]:
        logger.info("Sending to esp %s %s", esp_id, message)
        try:
            if esp_id in self.esp:
                logger.info(
                    "Connected: %s",
                    self.esp[esp_id].client_state == websockets.WebSocketState.CONNECTED
                )
                await self.esp[esp_id].send_json(message)
                logger.info("Sent")
            else:
                logger.info("Not sent: %s not in %s", esp_id, self.esp)
        except Exception as err:
            logger.warning(err)

manager = WsConnectionManager()

@app.get("/")
async def get():
    """Redirects to frontend main page"""
    return RedirectResponse(FRONTEND_ENDPOINT)

@app.get("/hello")
async def hello():
    """Hello endpoint, used by health-check"""
    return "Hello"

@app.websocket("/ws_web/{client_id}")
async def ws_web_endpoint(websocket: WebSocket, client_id: str):
    """Web clients websocket endpoint"""
    await manager.connect(websocket, client_id, 'web')
    await manager.send_to_web(json.dumps({"esps": list(manager.esp.keys())}), client_id)
    try:
        while True:
            text = await websocket.receive_text()
            logger.info("Recived: %s", text)
            if text:
                try:
                    data: Dict[str, str] = json.loads(text)
                except json.JSONDecodeError:
                    logger.warning("Wrong json: %s", text)
                    return
                if 'op' not in data:
                    return
                if data['op'] == 'cnct_esp' and 'data' in data and isinstance(data['data'], dict):
                    logger.info("Connecting %s", data['data'].get('esp_id', None))
                    await manager.connect_esp(client_id, data['data'].get('esp_id', None))
                elif data['op'] == 'msg_esp' and 'data' in data and isinstance(data['data'], dict):
                    logger.info("Message to esp %s", data)
                    if 'json' in data['data'] and isinstance(data['data']['json'], dict):
                        await manager.send_to_esp(
                            data['data'].get('json'),
                            client_id,
                            str(data['data'].get('esp_id'))
                        )
                elif data['op'] == 'chck_esp' and 'data' in data and isinstance(data['data'], dict):
                    esp_id = data['data'].get('esp_id')
                    if not esp_id:
                        await manager.send_to_web(
                            json.dumps({"srv": "err"}),
                            client_id
                        )
                        return()
                    is_active = await manager.is_active(esp_id, "esp")
                    if is_active:
                        logger.info("Esp %s active", esp_id)
                        await manager.send_to_web(
                            json.dumps({"esp_id": esp_id, "msg": "connected"}),
                            client_id
                        )
                    else:
                        logger.info("Esp %s is not active", esp_id)
                        await manager.send_to_web(
                            json.dumps({"esp_id": esp_id, "msg": "disconnected"}),
                            client_id
                        )
                elif data['op'] == 'get_esp':
                    await manager.send_to_web(
                        json.dumps({"esps": list(manager.esp.keys())}),
                        client_id
                    )
    except WebSocketDisconnect as err:
        logger.warning("Disconnecting, reason: %s code: %s", err.reason, err.code)
        await manager.disconnect(client_id, 'web')

@app.websocket("/ws_esp/{client_id}")
async def ws_esp_endpoint(websocket: WebSocket, client_id: str):
    """Esp websockets endpoint"""
    await manager.connect(websocket, client_id, 'esp')
    await manager.broadcast_web(
        json.dumps({"esp_id": client_id, "msg": "connected"})
    )
    try:
        while True:
            data = await websocket.receive_text()
            logger.info("Msg from esp %s", data)
            await manager.broadcast_web(
                json.dumps({"esp_id": client_id, "msg": data})
            )
    except WebSocketDisconnect as err:
        logger.warning("Disconnecting, reason: %s code: %s", err.reason, err.code)
        await manager.broadcast_web(
            json.dumps({"esp_id": client_id, "msg": "disconnected"})
        )
        await manager.disconnect(client_id, 'esp')

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080)
