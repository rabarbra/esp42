import React		from 'react';
import ws			from './api';
import ImageContext	from '../components/ImgCtx';

const ConnectionContext = React.createContext({
	connected: false,
	espId: "",
	setEspId: (id: string) => {},
	connect: (state: boolean) => {},
});

export const ConnectionContextProvider = (
	props: {children: React.ReactNode}
) => {
	const [connected, setConnected] = React.useState(false);
    const [espId, setEspId] = React.useState("");
	const { setImg, applyImg } = React.useContext(ImageContext);
    const ctx = {
        connected:  connected,
        espId:      espId,
        setEspId:   setEspId,
        connect:    setConnected
    }
	ws.ws.onmessage = (e) => {
		console.log("Message: ", e);
		const data = JSON.parse(e.data);
		if (data.esps && Array.isArray(data.esps) &&  data.esps.length > 0)
		{
			setConnected(true);
			ws.setEspId(data.esps[0]);
			setEspId(data.esps[0]);
		}
		else if (data.msg && data.msg === "disconnected")
		{
			setConnected(false);
			setEspId("");
		}
		else if (data.msg && data.msg === "connected")
		{
			setConnected(true);
			setEspId(data.esp_id);
		}
		else if (data.msg && (data.msg as string).startsWith("{\"img"))
		{
			const img: number[] = JSON.parse(data.msg).img;
			setImg(img.map(clr=>"#" + clr.toString(16)));
			applyImg();
		}
	}
	return (
		<ConnectionContext.Provider value={ctx}>
			{props.children}
		</ConnectionContext.Provider>
	);
}

export default ConnectionContext;