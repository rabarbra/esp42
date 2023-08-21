import React	from 'react';
import {
	Button,
	ColorPicker,
	SimpleGrid,
	Text
}				from '@mantine/core';
import ws 		from '../api/api';

const Btn = (props: {ledNum: number, clr: string, clear: boolean}) => {
	const [clr, setClr] = React.useState("gray");
	React.useEffect(()=>{
		if (props.clear === true)
			setClr("gray");
	},[props.clear]);
	const chngClr = (on: boolean) => {
		if (ws.chngClr(props.ledNum, props.clr, on))
			setClr(on ? props.clr : "gray");
	}
	return (
		<Button
			bg={clr}
			sx={{":hover": {"backgroundColor": clr}}}
			variant='outlined'
			onClick={()=>chngClr(true)}
			onMouseOver={(e)=>{
				if (e.buttons === 1)
					chngClr(true);
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
						/>
					)
				}
			</SimpleGrid>
			<ColorPicker format="hex" value={clr} onChange={setClr} />
			<Text color={clr}>{clr}</Text>
			<Button
				onClick={()=>{
					ws.clear();
					setClear(true);
				}}
				onMouseUp={()=>setClear(false)}
			>
				Clear
			</Button>
		</>
	);
}

export default DrawPanel;