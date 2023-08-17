from typing import Dict
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse

app = FastAPI()

html = """
<!DOCTYPE html>
<html>
    <head>
        <title>Chat</title>
    </head>
    <body>
        <h1>WebSocket Chat</h1>
        <h2>Your ID: <span id="ws-id"></span></h2>
        <form action="" onsubmit="sendMessage(event)">
            <input type="text" id="messageText" autocomplete="off"/>
            <button>Send</button>
        </form>
        <ul id='messages'>
        </ul>
        <script>
            var client_id = Date.now()
            document.querySelector("#ws-id").textContent = client_id;
            var ws = new WebSocket(`ws://localhost:8000/ws/${client_id}`);
            ws.onmessage = function(event) {
                var messages = document.getElementById('messages')
                var message = document.createElement('li')
                var content = document.createTextNode(event.data)
                message.appendChild(content)
                messages.appendChild(message)
            };
            function sendMessage(event) {
                var input = document.getElementById("messageText")
                ws.send(input.value)
                input.value = ''
                event.preventDefault()
            }
        </script>
    </body>
</html>
"""


class ConnectionManager:
	def __init__(self):
		self.web_connections: Dict[str, WebSocket] = {}
		self.esp_connections: Dict[str, WebSocket] = {}

	async def connect(self, websocket: WebSocket, client_id: str):
		await websocket.accept()
		if (client_id.startswith("esp")):
			self.esp_connections.update({client_id: websocket})
		else:
			self.web_connections.update({client_id: websocket})

	def disconnect(self, client_id: str):
		if (client_id.startswith("esp") and client_id in self.esp_connections):
			del self.esp_connections[client_id]
		elif client_id in self.web_connections:
			del self.web_connections[client_id]

	async def send_personal_message(self, message: str, websocket: WebSocket):
		await websocket.send_text(message)

	async def broadcast_web(self, message: str, client_id: str | None = None):
		for id, connection in self.web_connections.items():
			if not client_id or client_id != id:
				await connection.send_text(message)

	async def broadcast_esp(self, message: str):
		for id, connection in self.esp_connections.items():
			await connection.send_text(message)
	
	async def send_to_web(self, message: str, client_id: str):
		await self.web_connections[client_id].send_text(message)


manager = ConnectionManager()


@app.get("/")
async def get():
    return HTMLResponse(html)

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(websocket, client_id)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.send_personal_message(f"You wrote: {data}", websocket)
            await manager.broadcast_web(f"Client #{client_id} says: {data}", client_id)
    except WebSocketDisconnect:
        manager.disconnect(websocket, client_id)
        await manager.broadcast_web(f"Client #{client_id} left the chat")
