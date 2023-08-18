#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <WebSocketsClient.h>
#include <FastLED.h>

#define NUM_LEDS    64      // Number of LEDs in your panel

CRGB leds[NUM_LEDS];

const int LED_PIN  = 0;

const int soundSensorPin = A0;

void setup() {
  Serial.begin(115200);
  FastLED.addLeds<WS2812, LED_PIN, GRB>(leds, NUM_LEDS); // Define LED strip configuration
  FastLED.setBrightness(50);  // Set initial brightness (adjust as needed)
  FastLED.clear();            // Clear all LEDs
  FastLED.show();             // Update LED strip
}

void loop() {
  int soundValue = analogRead(soundSensorPin);
  Serial.print("Sound Value: ");
  Serial.println(soundValue);

  FastLED.clear();           // Clear all LEDs
  if (soundValue < 50)
    leds[10] = 0xFF0000;
   if (soundValue >= 50)
    leds[11] = 0x00FF00;
   FastLED.show();            // Update LED strip
  delay(300);
}
