import {
    client_id,
    ws_endpoint
} from "../config/config";

const ws = new WebSocket(ws_endpoint + client_id);
export default ws;