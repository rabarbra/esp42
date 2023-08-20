import ws from "../websocket/websocket"

export const sendArray = (pixelArray: number[]) => {
    if (ws.readyState === ws.OPEN)
    {
        ws.send(
			JSON.stringify({
				op: "msg_esp",
				data: {
					esp_id: "123",
					json: {
						op: 3,
						arr: pixelArray
					}
				}
			})
		)
    }
}