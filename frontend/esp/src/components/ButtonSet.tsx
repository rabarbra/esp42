import {
	Button,
	SimpleGrid
}	from '@mantine/core';
import ws from '../websocket/websocket';
import React from 'react';

const Btn = (props: {val: number, clr: string}) => {
	const [on, setOn] = React.useState(false);
	const [clr, setClr] = React.useState(props.clr);
	return (
		<Button
			bg={on ? clr : "gray"}
			sx={{":hover": {"backgroundColor": clr}}}
			variant='outlined'
			onClick={()=>{
				if (ws.readyState === ws.OPEN){
					setClr(props.clr);
					console.log("sending", props.val);
					ws.send(
						JSON.stringify({
							op: "msg_esp",
							data: {
								esp_id: "123",
								json: {
									op: on ? 1 : 0,
									msg: {
										led: props.val,
										clr: Number("0x" + props.clr.slice(1))
									}
								}
							}
						})
					);
					setOn(!on);
				}
			}}
		/>
	)
};

const ButtonSet = (props: {clr: string}) => {

	return (
		<SimpleGrid cols={8} spacing={5}>
			{
				Array.from({length: 64}, (_, i) =>
					<Btn
						key={i+1}
						val={i}
						clr={props.clr}
					/>
				)
			}
		</SimpleGrid>
	);
}

export default ButtonSet;