import React	from 'react';

const ConnectionContext = React.createContext({
	connected: false,
	espId: "",
	setEspId: (id: string) => {},
	connect: (state: boolean) => {},
});

export default ConnectionContext;