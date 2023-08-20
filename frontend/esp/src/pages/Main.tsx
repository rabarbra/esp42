import React	from "react";
import {
	Button,
	ColorPicker,
	Stack,
	Text
}					from "@mantine/core";
import ButtonSet	from "../components/ButtonSet";
import DropImg		from "../components/DropImg";
import JsonMsg 		from "../components/JsonMsg";
import ws 			from "../api/api";

const Main = () => {
	const [msgs, setMsgs] = React.useState([""]);
	const [value, onChange] = React.useState('#0000ff');
	const [clear, setClear] = React.useState(false);
	ws.ws.onmessage = function (event) {
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
			<JsonMsg/>
			<ButtonSet clr={value} clear={clear}/>
    	  	<ColorPicker format="hex" value={value} onChange={onChange} />
    	  	<Text color={value}>{value}</Text>
			<DropImg/>
			<Button onClick={()=>{
				ws.clear();
			}}>
				Clear
			</Button>
		</Stack>
	);
};

export default Main;