import {
	ActionIcon,
	ActionIconProps,
	useMantineColorScheme
}	from "@mantine/core";
import {
	IconMoonStars,
	IconSun
}	from "@tabler/icons-react";
import React from "react";

const ToggleColorScheme = (props: ActionIconProps) =>
{
	const sheme = useMantineColorScheme()
	return (
		<ActionIcon
    	    onClick={() => sheme.toggleColorScheme()}
    	    title="Toggle color scheme"
			{...props}
    	>
    	    {
    	        sheme.colorScheme === 'dark' ?
    	        <IconSun size="1.1rem" /> :
    	        <IconMoonStars size="1.1rem" />
    	    }
    	</ActionIcon>
	)
}

export default ToggleColorScheme;