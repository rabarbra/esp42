import React				from "react";
import {
	Button,
	JsonInput,
	Stack
}							from "@mantine/core";
import ws 					from "../api/api";
import ConnectionContext	from "../api/ConnectionContext";

const JsonMsg = () => {
	const {espId} = React.useContext(ConnectionContext);
	const [msg, setMsg] = React.useState(JSON.stringify(
		{op: "msg_esp", "data": {"esp_id": espId, "json": {"op": 4}}},
		null, 2
	));
	return (
		<Stack>
			<JsonInput
				autosize
				label="Enter yor message:"
				placeholder="Send message to server"
				formatOnBlur
				defaultValue={msg}
				onChange={event=>setMsg(event)}
			/>
			<Button
				style={{minHeight: 20, minWidth: 40}}
				onClick={()=>{
					if (ws.ws.readyState === ws.ws.OPEN)
					{
						console.log("Sending...", msg);
						ws.ws.send(msg);
					}
				}}
			>
				Send
			</Button>
		</Stack>
	)
}

export default JsonMsg;