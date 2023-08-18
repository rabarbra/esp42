#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <WebSocketsClient.h>

const char  *ssid = "rabarbra";
const char  *pass = "12345678";

const char  *api_host = "172.20.10.2";
const int   api_port = 8000;
const char  *api_path = "/ws/esp_1";

WebSocketsClient    webSocket;

void    webSocketEvent(WStype_t type, uint8_t *payload, size_t length);

void    setup()
{
    Serial.begin(9600);
    Serial.end();
    Serial.begin(9600);
    Serial.flush();
    Serial.println();
    WiFi.begin(ssid, pass);
    Serial.println("Connecting");
    while (WiFi.status() != WL_CONNECTED)
    {
        delay(500);
        Serial.print(WiFi.status());
    }
    Serial.println();
    Serial.print("Connected, IP address: ");
    Serial.println(WiFi.localIP());

    webSocket.begin(api_host, api_port, api_path);
	webSocket.onEvent(webSocketEvent);
	webSocket.setReconnectInterval(5000);
}

void    loop()
{
    webSocket.loop();
}

void    webSocketEvent(WStype_t type, uint8_t * payload, size_t length)
{
	switch(type) {
		case WStype_DISCONNECTED:
			Serial.printf("[WSc] Disconnected!\n");
			break;
		case WStype_CONNECTED: {
			Serial.printf("[WSc] Connected to url: %s\n", payload);
			//webSocket.sendTXT("Connected");
		}
			break;
		case WStype_TEXT:
			Serial.printf("[WSc] get text: %s\n", payload);
			break;
		case WStype_BIN:
			Serial.printf("[WSc] get binary length: %u\n", length);
			hexdump(payload, length);
			// send data to server
			// webSocket.sendBIN(payload, length);
			break;
        case WStype_PING:
            // pong will be send automatically
            Serial.printf("[WSc] get ping\n");
            break;
        case WStype_PONG:
            // answer to a ping we send
            Serial.printf("[WSc] get pong\n");
            break;
    }
}
