import React	from "react";
import ButtonSet from "../components/ButtonSet";
import ws from "../websocket/websocket";
import { ColorPicker, Stack, Text } from "@mantine/core";
import DropImg from "../components/DropImg";

const Main = () => {
	const [msgs, setMsgs] = React.useState([""]);
	const [msg, setMsg] = React.useState("");
	const [value, onChange] = React.useState('#0000ff');
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
    	<Stack align="center">
			<ButtonSet clr={value}/>
    	  	<ColorPicker format="hex" value={value} onChange={onChange} />
    	  	<Text color={value}>{value}</Text>
			<DropImg/>
    	</Stack>
		</div>
	);
};

export default Main;