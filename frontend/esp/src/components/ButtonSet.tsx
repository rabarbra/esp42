import React	from 'react';
import {
	Button,
	SimpleGrid
}				from '@mantine/core';
import ws		from '../websocket/websocket';

const Btn = (props: {val: number, clr: string, clear: boolean}) => {
	const [clr, setClr] = React.useState("gray");
	React.useEffect(()=>{
		if (props.clear === true)
		{
			console.log("clear", props.clear);
			setClr("gray");
		} 
	}, [props.clear])
	const bgClr = clr;
	const chngClr = (on: boolean) => {
		if (ws.readyState === ws.OPEN){
			setClr(on ? props.clr : "gray");
			ws.send(
				JSON.stringify({
					op: "msg_esp",
					data: {
						esp_id: "123",
						json: {
							op: on? 0 : 1,
							msg: {
								led: props.val,
								clr: Number("0x" + props.clr.slice(1))
							}
						}
					}
				})
			);
		}
	}
	return (
		<Button
			bg={bgClr}
			sx={{":hover": {"backgroundColor": bgClr}}}
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

const ButtonSet = (props: {clr: string, clear: boolean}) => {

	return (
		<SimpleGrid cols={8} spacing={5}>
			{
				Array.from({length: 64}, (_, i) =>
					<Btn
						key={i+1}
						val={i}
						clr={props.clr}
						clear={props.clear}
					/>
				)
			}
		</SimpleGrid>
	);
}

export default ButtonSet;