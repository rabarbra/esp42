"""Websockets api"""

import json
import logging
from typing import Dict

import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import RedirectResponse

import connection
import config

logger = logging.getLogger(__name__)
config.log_config["loggers"].update({
    logger.name: {
        "handlers":[
            "default"
        ],
        "level":"INFO"
    },
    connection.logger.name: {
        "handlers":[
            "default"
        ],
        "level":"INFO"
    }
})
uvicorn.Config('esp42', log_config=config.log_config)

app = FastAPI()
manager = connection.WsConnectionManager()

@app.get("/")
async def get():
    """Redirects to frontend main page"""
    return RedirectResponse(config.FRONTEND_ENDPOINT)

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
        logger.warning("Disconnecting web %s, reason: %s code: %s", client_id, err.reason, err.code)
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
        logger.warning("Disconnecting esp %s, reason: %s code: %s", client_id, err.reason, err.code)
        await manager.broadcast_web(
            json.dumps({"esp_id": client_id, "msg": "disconnected"})
        )
        await manager.disconnect(client_id, 'esp')

if __name__ == "__main__":
    uvicorn.run(app, host=config.DEV_HOST, port=config.DEV_PORT)
