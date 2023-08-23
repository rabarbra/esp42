#ifndef ESP_H
# define ESP_H
# include <Arduino.h>
# include <ArduinoJson.h>
# include <FastLED.h>
# include <ESP8266WiFi.h>
# include <WebSocketsClient.h>

// LED MATRIX SETTINGS
# define NUM_LEDS 64
# define BRIGHTNESS 60
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
StaticJsonDocument<2048>    responseDoc;

void    webSocketEvent(WStype_t type, uint8_t *payload, size_t length);
void    connectionAnim();
void    connectedAnim();
void    life(unsigned int secs, bool send);
void    colorLife(unsigned int secs, bool send);
#endif