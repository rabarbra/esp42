import React	from 'react';
import ws		from './api';

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
    const ctx = {
        connected:  connected,
        espId:      espId,
        setEspId:   setEspId,
        connect:    setConnected
    }
	ws.ws.onmessage = (e) => {
		console.log("Message: ", e);
		const data = JSON.parse(e.data)
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
	}
	return (
		<ConnectionContext.Provider value={ctx}>
			{props.children}
		</ConnectionContext.Provider>
	);
}

export default ConnectionContext;