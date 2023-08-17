#include <WiFi.h>
#include <WebServer.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>

const char*	ssid = "rabarbra";
const char*	password = "12345678";

const String	api_host = "localhost";
const int		api_port = 8000;
const String	api_path = "/ws/esp";
const String	esp_id = "1";

WebSocketsClient		webSocket;
StaticJsonDocument<100>	doc;

void	setup() {
	WiFi.begin(ssid, password);
	Serial.begin(115200);
	while (WiFi.status() != WL_CONNECTED) {
		Serial.print(".");
		delay(500);
	}
	Serial.println();
	Serial.println("ESP IP: " + WiFi.localIP());
	webSocket.begin(api_host, api_port, api_path + esp_id); 
	webSocket.onEvent(webSocketEvent);
	webSocket.setReconnectInterval(5000);
}
void	loop() {
	webSocket.loop();
}

void	webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
	if (type == WStype_TEXT)
	{
		DeserializationError error = deserializeJson(doc, payload);
		if (error) {
			Serial.println("deserializeJson() failed: " + error.c_str());
			return;
		}
		const int action = doc["act"];
		/*
			Action values:
			0 - turn on one led
			1 - turn of one led
			2 - display img
			3 - play animation
			4 - output text
			5 - clear screen
		*/
		const String data = doc["data"];
		switch (action)
		{
			case 0:
				oneLed(data, 1);
				break;
			case 1:
				oneLed(data, 0);
				break;
			case 2:
				img(data);
				break;
			case 3:
				anim(data);
				break;
			case 4:
				text(data);
				break;
			case 5:
				clear();
				break;
			default:
				webSocket.sendTXT("KO");
				break;
		}
	}
}

void	oneLed(String data, int on)
{
	webSocket.sendTXT("OK");
}

void	img(String data)
{
	webSocket.sendTXT("OK");
}

void	anim(String data)
{
	webSocket.sendTXT("OK");
}

void	text(String data)
{
	webSocket.sendTXT("OK");
}

void	clear()
{
	webSocket.sendTXT("OK");
}
