import {
	Container,
	Stack,
}							from "@mantine/core";
import DrawPanel			from "../components/DrawPanel";
import DropImg				from "../components/DropImg";
import { useScrollIntoView } from "@mantine/hooks";

const Main = () => {
	const { scrollIntoView, targetRef } = useScrollIntoView<HTMLDivElement>({
		offset: 60,
	});
	return (
		<Container size="md">
			<Stack
				ref={targetRef}
				align="center"
				spacing='md'
				justify="center"
				h="calc(100vh - 15rem)"
			>
				<DrawPanel/>
			</Stack>
			<DropImg scrl={scrollIntoView}/>
		</Container>
	);
};

export default Main;