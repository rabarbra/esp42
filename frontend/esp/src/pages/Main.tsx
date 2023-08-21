import {
	Stack,
}							from "@mantine/core";
import DrawPanel			from "../components/DrawPanel";
import DropImg				from "../components/DropImg";
import JsonMsg 				from "../components/JsonMsg";

const Main = () => {
	return (
		<Stack align="center">
			<DrawPanel/>
			<DropImg/>
			<JsonMsg/>
		</Stack>
	);
};

export default Main;