import React	from "react";
import {
	Button,
	JsonInput
}				from "@mantine/core";
import ws 		from "../api/api";

const JsonMsg = () => {
	const [msg, setMsg] = React.useState("");
	return (
		<>
			<JsonInput
				autosize
				label="Send message to server"
				placeholder="Send message to server"
				formatOnBlur
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
		</>
	)
}

export default JsonMsg;