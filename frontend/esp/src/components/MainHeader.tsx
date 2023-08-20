import {	
	Header
}							from "@mantine/core";
import ToggleColorScheme	from "./ToggleColorScheme";

const MainHeader = () =>
{
	return (
		<Header height={30} withBorder={false}>
			<ToggleColorScheme
				color="violet"
				mr={5}
				ml='auto'
			/>
    	</Header>
	)
}
export default MainHeader;