import React	from 'react';
import {
	useMantineTheme
}				from '@mantine/core';
import ws 		from '../api/api';

const ImageContext = React.createContext({
	img: [] as string[],
	setImg: (img: string[]) => {},
	apply: false,
	applyImg: () => {},
});

export const ImgCtxProvider = (
	props: {children: React.ReactNode}
) => {
	const theme = useMantineTheme();
	const gray = theme.colorScheme === 'dark' ? theme.colors.gray[8] : theme.colors.gray[7];
	const [img, setImg] = React.useState(Array.from({length: 64}, ()=>gray));
	const [apply, setApply] = React.useState(false);
	React.useEffect(()=>{
		if (apply === true)
			ws.sendArray(img.map(val=>{
				if (val === gray)
					return (0)
				return Number("0x" + val.slice(1))
			}));
	},[apply, img, gray])
	const applyImg = () => {
		setApply(true);
		setTimeout(()=>setApply(false), 100);
	};
    const ctx = {
        img:  img,
        setImg: setImg,
		apply: apply,
        applyImg:  applyImg
    };
	return (
		<ImageContext.Provider value={ctx}>
			{props.children}
		</ImageContext.Provider>
	);
}

export default ImageContext;