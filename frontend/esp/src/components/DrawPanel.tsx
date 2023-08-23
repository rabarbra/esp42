import React		from 'react';
import {
	ActionIcon,
	Button,
	ColorInput,
	Group,
	SimpleGrid,
}					from '@mantine/core';
import {
	IconDroplet,
	IconEraser,
	IconTrash
}					from '@tabler/icons-react';
import ws 			from '../api/api';
import ImageContext	from './ImgCtx';

const Btn = (props: {
	ledNum: number,
	clr: string,
	clear: boolean,
	clbk: ()=>void,
	eraser?: boolean,
	fill?: boolean
}) => {
	const [clr, setClr] = React.useState("gray");
	const { img, setImg, apply, applyImg } = React.useContext(ImageContext);
	React.useEffect(()=>{
		if (props.clear === true)
			setClr("gray");
	},[props.clear]);
	React.useEffect(()=>{
		if (apply)
			setClr(img[props.ledNum]);
	}, [apply])
	const chngClr = (on: boolean) => {
		//if (ws.chngClr(props.ledNum, props.clr, on))
			setClr(on ? props.clr : "gray");
			img[props.ledNum] = on ? props.clr : "#000000";
			setImg([...img]);
	}
	const colorCell = () => {
		if (props.eraser)
			chngClr(false);
		else if (props.fill) {
			setImg([...img.map((val) => {
				if (val === clr)
				return (props.clr);
				return (val);
			})])
			console.log(clr, props, img);
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
	const [clr, setClr] = React.useState('#0000ff');
	const [clear, setClear] = React.useState(false);
	const [eraser, setEraser] = React.useState(false);
	const [fill, setFill] = React.useState(false);
	const [swatches, setSwatches] = React.useState([] as string[]);
	const { setImg } = React.useContext(ImageContext);
	const addToSwatches = () => {
		if (swatches.includes(clr))
			return;
		setSwatches([clr, ...swatches.slice(0, 9)])
	};
	return (
		<>
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
			<Group>
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
						setImg(Array.from({length: 64}, ()=>"#000000"));
					}}
					onMouseUp={()=>setClear(false)}
				>
					<IconTrash/>
				</ActionIcon>
			</Group>
		</>
	);
}

export default DrawPanel;