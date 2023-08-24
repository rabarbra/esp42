#include "esp.h"

void    setup()
{
    // Serial setup
    Serial.begin(9600);
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
        connectionAnim();
        Serial.print(WiFi.status());
    }
    connectedAnim();
    Serial.println();
    Serial.print("Connected, IP address: ");
    Serial.println(WiFi.localIP());
    // WebSocket setup
    webSocket.begin(api_host, api_port, api_path, "");
	webSocket.onEvent(webSocketEvent);
	webSocket.setReconnectInterval(2000);
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
    FastLED.show();
}

void displayImg(JsonArray img)
{
    int i = 0;
    for(JsonVariant v : img) {
        leds[i++] = v.as<long>();
    }
    FastLED.show();
    FastLED.show();
}

void    sendImg()
{
    char txt[1024] = {0};
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

void    playLife(JsonObject obj)
{
    int     secs = obj["time"];
    bool    color = obj["clr"];
    bool    cast = obj["cast"];

    if (color)
        colorLife(secs, cast);
    else
        life(secs, cast);
}

void    doOp(uint8_t *payload)
{
    deserializeJson(doc, payload);
    int op_type = doc["op"];
    if (op_type == 0 || op_type == 1)
        switchLed(op_type, doc["msg"]);
    else if (op_type == 2)
    {
        FastLED.clear(true);
        FastLED.clear(true);
    }
    else if (op_type == 3)
        displayImg(doc["arr"]);
    else if (op_type == 4)
        sendImg();
    else if (op_type == 5)
        playLife(doc["msg"]);
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
            webSocket.sendTXT("connected");
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

void    connectionAnim()
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

bool     isAlive(CRGB cell)
{
    if (cell.r || cell.g || cell.b)
        return (true);
    return (false);
}

int     calcNeighbours(CRGBArray<64> field, int pos)
{
    int res = 0;

    if (pos - 8 >= 0 && isAlive(field[pos - 8]))
        res++;
    if (pos + 8 < 64 && isAlive(field[pos + 8]))
        res++;
    if (pos % 8 > 0)
    {
        if (isAlive(field[pos - 1]))
            res++;
        if (pos - 9 >= 0 && isAlive(field[pos - 9]))
            res++;
        if (pos + 7 < 64 && isAlive(field[pos + 7]))
            res++;
    }
    if (pos % 8 < 7)
    {
        if (isAlive(field[pos + 1]))
            res++;
        if (pos + 9 < 64 && isAlive(field[pos + 9]))
            res++;
        if (pos - 7 >= 0 && isAlive(field[pos - 7]))
            res++;
    }
    return (res);
}

void    life(unsigned int secs, bool send)
{
    CRGBArray<64>   buf;
    int             neighbours;
    int             clr = 0xFF0000;
    long unsigned   begin = millis();

    while (millis() < begin + secs * 1000)
    {
        buf = leds;
        for(int i = 0; i < 64; i++)
        {
            neighbours = calcNeighbours(buf, i);
            if (neighbours == 3)
                leds[i] = clr;
            else if (neighbours > 3 && !isAlive(buf[i])) 
                leds[i] = clr;
            else if (neighbours == 2 && isAlive(buf[i]))
                leds[i] = clr;
            else
                leds[i] = 0;
        }
        FastLED.show();
        FastLED.show();
        if (send)
        {
            sendImg();
            delay(200);
        }
        else
            delay(500);
    }
}

void     calcColorNeighbours(CRGBArray<64> field, int pos, uint8_t (*res)[3])
{
    (*res)[0] = 0;
    (*res)[1] = 0;
    (*res)[2] = 0;

    if (pos - 8 >= 0)
    {
        if (field[pos - 8].r > 1)
            (*res)[0]++;
        if (field[pos - 8].g > 1)
            (*res)[1]++;
        if (field[pos - 8].b > 1)
            (*res)[2]++;
    }
    if (pos + 8 < 64)
    {
        if (field[pos + 8].r > 1)
            (*res)[0]++;
        if (field[pos + 8].g > 1)
            (*res)[1]++;
        if (field[pos + 8].b > 1)
            (*res)[2]++;
    }
    if (pos % 8 > 0)
    {
        if (field[pos - 1].r > 1)
            (*res)[0]++;
        if (field[pos - 1].g > 1)
            (*res)[1]++;
        if (field[pos - 1].b > 1)
            (*res)[2]++;
        if (pos - 9 >= 0)
        {
            if (field[pos - 9].r > 1)
                (*res)[0]++;
            if (field[pos - 9].g > 1)
                (*res)[1]++;
            if (field[pos - 9].b > 1)
                (*res)[2]++;
        }
        if (pos + 7 < 64)
        {
            if (field[pos + 7].r > 1)
                (*res)[0]++;
            if (field[pos + 7].g > 1)
                (*res)[1]++;
            if (field[pos + 7].b > 1)
                (*res)[2]++;
        }
    }
    if (pos % 8 < 7)
    {
        if (field[pos + 1].r > 1)
            (*res)[0]++;
        if (field[pos + 1].g > 1)
            (*res)[1]++;
        if (field[pos + 1].b > 1)
            (*res)[2]++;
        if (pos + 9 < 64)
        {
            if (field[pos + 9].r > 1)
                (*res)[0]++;
            if (field[pos + 9].g > 1)
                (*res)[1]++;
            if (field[pos + 9].b > 1)
                (*res)[2]++;
        }
        if (pos - 7 >= 0)
        {
            if (field[pos - 7].r > 1)
                (*res)[0]++;
            if (field[pos - 7].g > 1)
                (*res)[1]++;
            if (field[pos - 7].b > 1)
                (*res)[2]++;
        }
    }
}

void    colorLife(unsigned int secs, bool send)
{
    uint8_t         neighbours[3];
    uint8_t         r, g, b;
    CRGBArray<64>   buf;
    long unsigned   begin = millis();

    while (millis() < begin + secs * 1000)
    {
        buf = leds;
        for(int i = 0; i < 64; i++)
        {
            calcColorNeighbours(buf, i, &neighbours);
            r = 0;
            g = 0;
            b = 0;
            if (buf[i].r > 1 && (neighbours[0] == 2 || neighbours[0] == 3))
                r = buf[i].r;
            else if (buf[i].r <= 1 && (neighbours[0] >= 3))
                r = 32 * neighbours[0] - 1;
            else
                r = 0;
            if (buf[i].g > 1 && (neighbours[1] == 2 || neighbours[1] == 3))
                g = buf[i].g;
            else if (buf[i].g <= 1 && (neighbours[1] >= 3))
                g = 32 * neighbours[1] - 1;
            else
                g = 0;
            if (buf[i].b >= 1 && (neighbours[2] == 2 || neighbours[2] == 3))
                b = buf[i].b;
            else if (buf[i].b <= 1 && (neighbours[2] >= 3))
                b = 32 * neighbours[2] - 1;
            else
                b = 0;
            leds[i].setRGB(r, g, b);
        }
        FastLED.show();
        FastLED.show();
        if (send)
        {
            sendImg();
            delay(100);
        }
        else
            delay(500);
    }
}
