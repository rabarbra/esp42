import React from "react";
import {
	ColorScheme,
	ColorSchemeProvider,
	MantineProvider
}	from "@mantine/core";
import {
	useColorScheme,
	useMediaQuery
}	from "@mantine/hooks";

const ThemeProvider = (props: {children: React.ReactNode}) =>
{
	const preferredColorScheme = useColorScheme(
        useMediaQuery('(prefers-color-scheme: dark)') ? "dark" : "light"
    );
    const [colorScheme, setColorScheme] = React.useState<ColorScheme>(preferredColorScheme);
    const toggleColorScheme = (value?: ColorScheme) =>
        setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));
    React.useEffect(()=>{
        setColorScheme(preferredColorScheme);
    },[preferredColorScheme]);
	return (
		<ColorSchemeProvider
            colorScheme={colorScheme}
            toggleColorScheme={toggleColorScheme}
        >
            <MantineProvider
                theme={{colorScheme}}
                withGlobalStyles
                withNormalizeCSS
            >
                {props.children}
            </MantineProvider>
        </ColorSchemeProvider>
	);
}

export default ThemeProvider;