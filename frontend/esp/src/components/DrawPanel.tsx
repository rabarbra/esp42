import React		from 'react';
import {
	ActionIcon,
	Button,
	ColorInput,
	Group,
	Modal,
	SimpleGrid,
	Stack,
	useMantineTheme,
}					from '@mantine/core';
import {
	IconCode,
	IconDroplet,
	IconEraser,
	IconTrash
}					from '@tabler/icons-react';
import ws 			from '../api/api';
import ImageContext	from './ImgCtx';
import {
	initColor
}					from '../config/config';
import JsonMsg		from './JsonMsg';

const Btn = (props: {
	ledNum: number,
	clr: string,
	clear: boolean,
	clbk: ()=>void,
	eraser?: boolean,
	fill?: boolean
}) => {
	const theme = useMantineTheme();
	const gray = theme.colorScheme === 'dark' ? theme.colors.gray[8] : theme.colors.gray[7];
	const [clr, setClr] = React.useState(gray);
	const { img, setImg, apply, applyImg } = React.useContext(ImageContext);
	React.useEffect(()=>{
		if (props.clear === true)
			setClr(gray);
	},[props.clear, gray]);
	React.useEffect(()=>{
		if (apply)
			setClr(img[props.ledNum]);
	}, [apply, img, props.ledNum])
	const chngClr = (on: boolean) => {
		ws.chngClr(props.ledNum, props.clr, on)
		setClr(on ? props.clr : gray);
		img[props.ledNum] = on ? props.clr : gray;
		setImg([...img]);
	}
	const colorCell = () => {
		if (props.eraser)
			chngClr(false);
		else if (props.fill) {
			setImg([...img.map((val) => {
				if (val === clr)
					return (props.clr);
				else
					return (val);
			})])
			applyImg();
		} else {
			chngClr(true);
			props.clbk();
		}
	}
	return (
		<Button
			bg={clr}
			sx={{":hover": {"backgroundColor": clr}}}
			variant='outlined'
			onClick={colorCell}
			onMouseOver={(e)=>{
				if (e.buttons === 1) {
					colorCell();
				}
				else if (e.buttons === 4)
					chngClr(false);
			}}
			onDoubleClick={() => chngClr(false)}
		/>
	)
};

const DrawPanel = () => {
	const theme = useMantineTheme();
	const [clr, setClr] = React.useState(initColor);
	const [clear, setClear] = React.useState(false);
	const [eraser, setEraser] = React.useState(false);
	const [fill, setFill] = React.useState(false);
	const [swatches, setSwatches] = React.useState([] as string[]);
	const [jsonOpen, setJsonOpen] = React.useState(false);
	const { setImg } = React.useContext(ImageContext);
	const gray = theme.colorScheme === 'dark' ? theme.colors.gray[8] : theme.colors.gray[7];
	const addToSwatches = () => {
		if (swatches.includes(clr))
			return;
		setSwatches([clr, ...swatches.slice(0, 9)])
	};
	return (
		<Stack align='center'>
			<SimpleGrid cols={8} spacing={5}>
				{
					Array.from({length: 64}, (_, i) =>
						<Btn
							key={i+1}
							ledNum={i}
							clr={clr}
							clear={clear}
							clbk={addToSwatches}
							eraser={eraser}
							fill={fill}
						/>
					)
				}
			</SimpleGrid>
			<Group spacing={10}>
				<ColorInput
					format="hex"
					w={140}
					swatches={swatches}
					value={clr}
					onChange={setClr}
				/>
				<ActionIcon
					size='md'
					variant={eraser ? "outline" : "transparent"}
					onClick={()=>{
						setEraser(!eraser);
						setFill(false);
					}}
				>
					<IconEraser/>
				</ActionIcon>
				<ActionIcon
					size='md'
					variant={fill ? "outline" : "transparent"}
					onClick={()=>{
						setEraser(false);
						setFill(!fill);
					}}
				>
					<IconDroplet/>
				</ActionIcon>
				<ActionIcon
					size='md'
					variant='transparent'
					onClick={()=>{
						ws.clear();
						setClear(true);
						setImg(Array.from({length: 64}, ()=>gray));
					}}
					onMouseUp={()=>setClear(false)}
				>
					<IconTrash/>
				</ActionIcon>
				<ActionIcon
					size='md'
					variant="transparent"
					onClick={()=>{
						setJsonOpen(true);
					}}
				>
					<IconCode/>
				</ActionIcon>
				<Modal
					centered
					title="Send msg to server"
					opened={jsonOpen}
					onClose={()=>setJsonOpen(false)}
				>
					<JsonMsg/>
				</Modal>
			</Group>
		</Stack>
	);
}

export default DrawPanel;