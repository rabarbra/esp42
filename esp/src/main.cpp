#include <Arduino.h>
#include <ArduinoJson.h>
#include <FastLED.h>
#include <ESP8266WiFi.h>
#include <WebSocketsClient.h>

// LED MATRIX SETTINGS
#define NUM_LEDS 64
#define BRIGHTNESS 60
const int           LedPin = 0;
CRGBArray<NUM_LEDS> leds;

// WIFI SETTINGS
const char  *ssid = "rabarbra";
const char  *pass = "12345678";

// WEBSOCKET SETTINGS
const int   api_port = 80;
const char  *api_host = "api.esp42.eu";
//const int   api_port = 8080;
//const char  *api_host = "172.20.10.2";
const char  *api_path = "/ws_esp/123";

WebSocketsClient            webSocket;
StaticJsonDocument<2048>    doc;
StaticJsonDocument<1024>    responseDoc;

void    webSocketEvent(WStype_t type, uint8_t *payload, size_t length);

void    connectiomAnim()
{
    static int led = 0;
    static int color = 0x00FF00;

    leds[led % 64] = color % 0x1000000;
    FastLED.show();
    color += 0x10;
    led++;
}

void    connectedAnim()
{
    int ledArray[] = {17, 18, 19, 21, 23, 25, 27, 29, 30, 33, 35, 37, 38, 41, 42, 43, 45, 47};
    int i = -1;
    int len = 18;
    int color = 0x00FF00;
    
    FastLED.clear();
    FastLED.show();
    while (++i < len)
    {
        leds[ledArray[i]] = color;
        FastLED.show();
    }
}

void    setup()
{
    // Serial setup
    Serial.begin(9600);
    Serial.flush();
    Serial.println();
    // FastLED setup
    FastLED.addLeds<WS2812B, LedPin, GRB>(leds, NUM_LEDS);
    FastLED.setBrightness(BRIGHTNESS);
    FastLED.clear();
    // FastLED.setCorrection(Typical8mmPixel);
    // WiFi setup
    WiFi.begin(ssid, pass);
    Serial.println("Connecting");
    while (WiFi.status() != WL_CONNECTED)
    {
        delay(500);
        connectiomAnim();
        Serial.print(WiFi.status());
    }
    connectedAnim();
    Serial.println();
    Serial.print("Connected, IP address: ");
    Serial.println(WiFi.localIP());
    // WebSocket setup
    webSocket.begin(api_host, api_port, api_path);
	webSocket.onEvent(webSocketEvent);
	webSocket.setReconnectInterval(4000);
    //webSocket.enableHeartbeat(6000, 1000, 4);
    delay(1000);
    FastLED.clear();
    FastLED.show();
}

void    loop()
{
    webSocket.loop();
}

void switchLed(int op, JsonObject obj)
{
    int num = obj["led"];
    int color = obj["clr"];
    if (op == 0)
        leds[num] = color;
    else
        leds[num] = 0x000000;
    FastLED.show();
}

void displayImg(JsonArray img)
{
    int i = 0;
    for(JsonVariant v : img) {
        leds[i++] = v.as<long>();
        FastLED.show();
    }
}

void    sendImg()
{
    char txt[1024];
    long clr;
    responseDoc.createNestedArray("img");

    for(auto & led : leds) {
        clr = ((static_cast<long>(led.r)) << 16) + (led.g << 8) + led.b;
        responseDoc["img"].add<long>(clr);
    }
    serializeJson(responseDoc, txt);
    Serial.println(txt);
    webSocket.sendTXT(txt);
    responseDoc.clear();
}

void    doOp(uint8_t *payload)
{
    deserializeJson(doc, payload);
    int op_type = doc["op"];
    if (op_type == 0 || op_type == 1)
        switchLed(op_type, doc["msg"]);
    else if (op_type == 2)
    {
        FastLED.clear();
        FastLED.show();
    }
    else if (op_type == 3)
        displayImg(doc["arr"]);
    else if (op_type == 4)
        sendImg();
    else if (op_type == 9)
        webSocket.sendTXT("connected");
    doc.clear();
}

void    webSocketEvent(WStype_t type, uint8_t * payload, size_t length)
{
	switch(type)
    {
		case WStype_DISCONNECTED:
			Serial.printf("[WSc] Disconnected!\n");
			break;
		case WStype_CONNECTED:
			Serial.printf("[WSc] Connected to url: %s\n", payload);
            webSocket.sendPing();
			break;
		case WStype_TEXT:
			Serial.printf("[WSc] get text: %s\n", payload);
            doOp(payload);
			break;
        case WStype_PING:
            Serial.printf("[WSc] get ping\n");
            break;
        case WStype_PONG:
            Serial.printf("[WSc] get pong\n");
            break;
        case WStype_ERROR:
            Serial.printf("[WSc] error: %s\n", payload);
            break;
        default:
            break;
    }
}
