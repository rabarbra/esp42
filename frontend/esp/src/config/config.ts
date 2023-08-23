//export const	ws_endpoint = window.location.hostname === 'localhost'
//	? "ws://api.localhost:8080/ws_web/"
//	: "wss://api.esp42.eu/ws_web/";
export const	ws_endpoint = "wss://api.esp42.eu/ws_web/";
export const	client_id = (Math.floor(Math.random() * 1000)).toString();
export const	initColor = "#0010ee";