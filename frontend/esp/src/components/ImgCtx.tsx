import React	from 'react';
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
	const [img, setImg] = React.useState(Array.from({length: 64}, ()=>"#000000"));
	const [apply, setApply] = React.useState(false);
	const applyImg = () => {
		setApply(true);
		ws.sendArray(img.map(val=>Number("0x" + val.slice(1))));
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