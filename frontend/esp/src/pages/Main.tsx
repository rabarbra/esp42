import React from "react";

const Main = () => {
	const [msgs, setMsgs] = React.useState([""]);

	const ws = new WebSocket(ws_endpoint + );

	const apiCall = {
		event: "bts:subscribe",
		data: { channel: "order_book_btcusd" },
	};

	ws.onopen = (event) => {
		ws.send(JSON.stringify(apiCall));
	};

	ws.onmessage = function (event) {
		const json = JSON.parse(event.data);
		try {
			if ((json.event = "data")) {
				setBids(json.data.bids.slice(0, 5));
			}
		} catch (err) {
			console.log(err);
		}
	};
	const messages = bids.map((item) => {
	  return (
	    <div>
	      <p> {item}</p>
	    </div>
	  );
	});
	return <div>{messages}</div>;
};

export default Main;