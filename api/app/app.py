import uvicorn
import json
import  logging
from typing import Dict, List, Literal, Any
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, websockets
from fastapi.responses import RedirectResponse

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

frontend_endpoint = 'http://esp42.eu'

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
                    logger.info("Already connected");
                    return
            self.web_esp[web_id].append(esp_id)
            logger.info("Connected");
            self.broadcast_web('taken')

    async def broadcast_web(self, message: str, client_id: str | None = None):
    	for id, connection in self.web.items():
            if not client_id or client_id != id:
                await connection.send_text(message)

    async def broadcast_esp(self, message: str):
        for _, connection in self.esp.items():
            await connection.send_text(message)
	
    async def send_to_web(self, message: str, client_id: str):
        if (client_id in self.web):
            await self.web[client_id].send_text(message)

    async def send_to_esp(
            self, message: Dict[str, Any],
            web_id: str, esp_id: str
    ):
        logger.info(f"web_esp: {self.web_esp} esp: {self.esp}")
        #if (web_id in self.web_esp and esp_id in self.web_esp[web_id]):
        logger.info(f"Sending to esp {esp_id} {message}")
        if (esp_id in self.esp):
            logger.info(f"Connected: {self.esp[esp_id].client_state == websockets.WebSocketState.CONNECTED}")
            await self.esp[esp_id].send_json(message)
            logger.info("Sent")
        else:
            logger.info(f"Not sent: {esp_id} not in {self.esp}")

manager = WsConnectionManager()

@app.get("/")
async def get():
    return RedirectResponse(frontend_endpoint)

@app.get("/hello")
async def hello():
    return "Hello"

@app.websocket("/ws_web/{client_id}")
async def ws_web_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(websocket, client_id, 'web')
    await manager.send_to_web(json.dumps(list(manager.esp.keys())), client_id)
    try:
        while True:
            text = await websocket.receive_text();
            logger.info(f"Recived: {text}")
            if text:
                try:
                    data: Dict[str, str] = json.loads(text);
                except json.JSONDecodeError:
                    logger.warning(f"Wrong json: {text}")
                if 'op' not in data:
                    return
                if (data['op'] == 'cnct_esp' and 'data' in data and isinstance(data['data'], dict)):
                    logger.info(f"Connecting {data['data'].get('esp_id', None)}")
                    await manager.connect_esp(client_id, data['data'].get('esp_id', None))
                elif (data['op'] == 'msg_esp' and 'data' in data and isinstance(data['data'], dict)):
                    logger.info(f"Message to esp {data}")
                    await manager.send_to_esp(
                        data['data'].get('json'),
                        client_id,
                        str(data['data'].get('esp_id'))
                    )
                elif (data['op'] == 'chck_esp' and 'data' in data and isinstance(data['data'], dict)):
                    esp_id = data['data'].get('esp_id')
                    if not esp_id:
                        await manager.send_to_web(
                            json.dumps({"srv": "err"}),
                            client_id
                        )
                    elif esp_id not in manager.esp:
                        await manager.send_to_web(
                            json.dumps({"srv": "no"}),
                            client_id
                        )
                    else:
                        status = manager.esp[esp_id].client_state.value
                        await manager.send_to_web(
                            json.dumps({"srv": status}),
                            client_id
                        )
                elif (data['op'] == 'get_esp'):
                    await manager.send_to_web(json.dumps(list(manager.esp.keys())), client_id)
    except WebSocketDisconnect as e:
        logger.warning(f"Disconnecting, reason: {e.reason} code: {e.code}")
        await manager.disconnect(client_id, 'web')

@app.websocket("/ws_esp/{client_id}")
async def ws_esp_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(websocket, client_id, 'esp')
    await manager.broadcast_web(
        json.dumps({"esp_id": client_id, "msg": "connected"})
    );
    try:
        while True:
            data = await websocket.receive_text()
            logger.info(f"Msg from esp {data}");
            await manager.broadcast_web(
                json.dumps({"esp_id": client_id, "msg": data})
            )
    except WebSocketDisconnect as e:
        logger.warning(f"Disconnecting, reason: {e.reason} code: {e.code}")
        await manager.broadcast_web(
            json.dumps({"esp_id": client_id, "msg": "disconnected"})
        )
        await manager.disconnect(client_id, 'esp')

if __name__ == "__main__":
   uvicorn.run(app, host="0.0.0.0", port=8080)
