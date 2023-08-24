import React				from "react";
import {	
	Group,
	Header, Modal, Text
}							from "@mantine/core";
import { IconPoint } 		from "@tabler/icons-react";
import ToggleColorScheme	from "./ToggleColorScheme";
import ConnectionContext	from "../api/ConnectionContext";
import JsonMsg 				from "./JsonMsg";

const MainHeader = () =>
{
	const {connected, espId} = React.useContext(ConnectionContext);
	const [jsonOpen, setJsonOpen] = React.useState(false);
	return (
		<Header height={30} withBorder={false}>
			<Group spacing={0}>
				<IconPoint color={connected ? "green" : "red"}/>
				<Text
					color={connected ? "green" : "red"}
					size="xs"
					sx={{cursor: "pointer"}}
					onClick={()=>{
						setJsonOpen(true);
					}}
				>
					{espId}
				</Text>
				<ToggleColorScheme
					color="violet"
					mr={5}
					ml='auto'
				/>
			</Group>
			<Modal
				centered
				title="Send msg to server"
				opened={jsonOpen}
				onClose={()=>setJsonOpen(false)}
			>
				<JsonMsg clbck={()=>setJsonOpen(false)}/>
			</Modal>
    	</Header>
	)
}
export default MainHeader;