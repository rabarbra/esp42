"""Websocket connection management"""
import json
import logging
import asyncio
from typing import Dict, List, Literal, Any
from fastapi import WebSocket, websockets

logger = logging.getLogger(__name__)

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
            await asyncio.wait_for(ws.send_json({"op": 9}), 2000)
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
