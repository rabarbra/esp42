import {
	client_id,
	ws_endpoint
}	from "../config/config";

export class WebSocketApi {
	endpoint: string;
	clientId: string;
	espId: string;
	ws: WebSocket;
	constructor(endpoint: string, clientId: string, espId: string) {
		this.endpoint = endpoint;
		this.espId = espId;
		this.clientId = clientId;
		this.ws = new WebSocket(this.endpoint + this.clientId);
		this.ws.onclose = (e) => {console.log("Closed: ", e)}
		this.ws.onerror = (e) => {console.log("Error: ", e)}
		this.ws.onopen = (e) => {console.log("Open: ", e)}
	}

	private reconnect() {
		this.ws = new WebSocket(this.endpoint + this.clientId);
		this.ws.onclose = (e) => {console.log("Closed: ", e)}
		this.ws.onerror = (e) => {console.log("Error: ", e)}
		this.ws.onopen = (e) => {console.log("Open: ", e)}
		console.log("Reconnecting");
	}

	public mstToEsp(msg: Object | string) {
		if (this.ws.readyState !== this.ws.OPEN)
			this.reconnect()
		if (this.ws.readyState === this.ws.OPEN) {
			const serialized = JSON.stringify({
				op: "msg_esp",
				data: {
					esp_id: this.espId,
					json: msg
				}
			})
			console.log("Sending", serialized);
			this.ws.send(serialized);
			return (true);
		}
		return (false);
	}

	public sendArray = (pixelArray: number[]) => {
		return (this.mstToEsp({op: 3, arr: pixelArray}));
	}

	public clear = () => {
		return (this.mstToEsp({op: 2}));
	}

	public chngClr = (ledNum: number, color: string, turnOn: boolean) => {
		if (turnOn)
			return this.mstToEsp({op: 0, msg: {led: ledNum, clr: Number("0x" + color.slice(1))}});
		else
			return this.mstToEsp({op: 1, msg: {led: ledNum}});
	}
}

const ws = new WebSocketApi(ws_endpoint, client_id, "123");

export default ws;