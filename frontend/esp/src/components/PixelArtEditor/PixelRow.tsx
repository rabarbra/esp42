import { Group } from "@mantine/core";
import Pixel from "./Pixel";

const PixelRow = (props: {width: number, color: string}) => {
	let pixels = [];
	for (let i = 0; i < props.width; i++) {
		pixels.push(<Pixel key={i} color={props.color}/>);
	}
	return (
		<Group spacing={4}>{pixels}</Group>
	);
}

export default PixelRow;