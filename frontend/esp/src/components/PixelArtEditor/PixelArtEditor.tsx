import { Button, ColorPicker, Stack } from "@mantine/core";
import PixelRow from "./PixelRow";
import React from "react";

const PixelArtEditor = (props: {
	width: number,
	height: number,
}) => {
	const [clr, setClr] = React.useState("#fff");
	let rows = [];
	for (let i = 0; i < props.height; i++)
		rows.push(<PixelRow key={i} width={props.width} color={clr}/>)
	return (
		<>
			<Stack align="stretch" spacing={4}>
				{rows}
			</Stack>
			<Button>Clear</Button>
			<ColorPicker format="hex" value={clr} onChange={setClr} />
		</>
	);
}

export default PixelArtEditor;