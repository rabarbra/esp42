import React				from "react";
import {	
	Group,
	Header, Text
}							from "@mantine/core";
import ToggleColorScheme	from "./ToggleColorScheme";
import ConnectionContext	from "../api/ConnectionContext";
import { IconPoint } 		from "@tabler/icons-react";

const MainHeader = () =>
{
	const {connected, espId} = React.useContext(ConnectionContext);
	return (
		<Header height={30} withBorder={false}>
			<Group spacing={0}>
				<IconPoint color={connected ? "green" : "red"}/>
				<Text color={connected ? "green" : "red"} size="xs">{espId}</Text>
				<ToggleColorScheme
					color="violet"
					mr={5}
					ml='auto'
				/>
			</Group>
    	</Header>
	)
}
export default MainHeader;