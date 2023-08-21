import React				from "react";
import {
	Stack,
}							from "@mantine/core";
import DrawPanel			from "../components/DrawPanel";
import DropImg				from "../components/DropImg";
import JsonMsg 				from "../components/JsonMsg";
import ws					from "../api/api";
import ConnectionContext	from "../api/ConnectionContext";

const Main = () => {
	const {setEspId, connect} = React.useContext(ConnectionContext);
	ws.ws.onmessage = (e) => {
		console.log("Message: ", e);
		if ((e.data as string).endsWith("disconnected"))
		{
			connect(false);
			setEspId("");
		}
		else if ((e.data as string).endsWith("connected"))
		{
			connect(true);
			setEspId((e.data as string).split(" ").slice(0, 2).join(" "));
		}
	}
	return (
		<Stack align="center">
			<DrawPanel/>
			<DropImg/>
			<JsonMsg/>
		</Stack>
	);
};

export default Main;