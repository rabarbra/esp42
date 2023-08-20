import React from "react";

const Pixel = (props: {color: string}) => {
	const defaultColor = "gray";
	const lightColor = "darkgray"
	const [clr, setClr] = React.useState(defaultColor);
	
	return (
		<div
			style={{minWidth: 38, minHeight: 38, borderRadius: 4}}
			className="mantine-UnstyledButton-root mantine-Button-root mantine-1ax4qmu"
			onMouseOver={(e)=>{
				if (e.buttons === 1)
					setClr(props.color)
				else if (clr === defaultColor)
					setClr(lightColor)
			}}
			onMouseLeave={(e)=>{
				if (e.buttons === 0 && clr === lightColor)
					setClr(defaultColor);
			}}
			onClick={()=>setClr(props.color)}
			onDoubleClick={()=>setClr(defaultColor)}
		/>
	)
}

export default Pixel;