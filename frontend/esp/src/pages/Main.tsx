import React	from "react";
import ButtonSet from "../components/ButtonSet";
import ws from "../websocket/websocket";
import { Button, ColorPicker, JsonInput, Stack, Text } from "@mantine/core";
import DropImg from "../components/DropImg";
import PixelArtEditor from "../components/PixelArtEditor/PixelArtEditor";

const Main = () => {
	const [msgs, setMsgs] = React.useState([""]);
	const [msg, setMsg] = React.useState("");
	const [value, onChange] = React.useState('#0000ff');
	const [clear, setClear] = React.useState(false);
	ws.onmessage = function (event) {
		const json = JSON.parse(event.data);
		console.log("Recived...", json);
		setMsgs([json, ...msgs]);
	};
	const messages = msgs.map((item, idx) => {
		return (
			<div key={idx}>
				<Text> {item}</Text>
			</div>
		);
	});
	return (
		<Stack align="center">
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
					if (ws.readyState === ws.OPEN)
					{
						console.log("Sending...", msg);
						ws.send(msg);
					}
				}}
			>
				Send
			</Button>
			<ButtonSet clr={value} clear={clear}/>
    	  	<ColorPicker format="hex" value={value} onChange={onChange} />
    	  	<Text color={value}>{value}</Text>
			<DropImg/>
			<Button onClick={()=>{
				if (ws.readyState === ws.OPEN)
				{
					console.log("Clearing...");
					setClear(true);
					ws.send(
						JSON.stringify({
							op: "msg_esp",
							data: {
								esp_id: "123",
								json: {op: 2}
							}
						})
					)
					setClear(false);
				}
			}}>
				Clear
			</Button>
		</Stack>
	);
};

export default Main;