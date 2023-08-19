import React	from "react";
import {
	client_id,
	ws_endpoint
}				from "../config/config";

const Main = () => {
	const [msgs, setMsgs] = React.useState([""]);
	const [msg, setMsg] = React.useState("");

	const ws = new WebSocket(ws_endpoint + client_id);
	console.log(ws);
	ws.onmessage = function (event) {
		const json = JSON.parse(event.data);
		console.log("Recived...", json);
		setMsgs([json, ...msgs]);
	};
	const messages = msgs.map((item, idx) => {
		return (
			<div key={idx}>
				<p> {item}</p>
			</div>
		);
	});
	return (
		<div>
			<input
				style={{
					minWidth: 600
				}}
				onChange={event=>setMsg(event.target.value)}
			/>
			<button 
				style={{minHeight: 20, minWidth: 40}}
				onClick={()=>{
					if (ws.readyState === ws.OPEN)
					{
						console.log("Sending...", msg);
						ws.send(msg);
					}
				}}
			>
				Send
			</button>
			{messages}
		</div>
	);
};

export default Main;