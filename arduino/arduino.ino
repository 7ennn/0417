#include <Arduino.h>

// Arduino 程式碼：讀取可調式電阻並通過 Serial 傳輸數據

// 定義可調式電阻的模擬輸入腳位
const int potentiometerPin = A0;
int lastMappedValue = 0;  // 儲存上一次的數值

void setup() {
  // 初始化 Serial 通訊，波特率為 9600
  Serial.begin(9600);
}

void loop() {
  // 讀取可調式電阻的模擬值（範圍 0-1023）
  int sensorValue = analogRead(potentiometerPin);

  // 將數值映射到適合的範圍（例如 0-200，根據需求調整）
  int mappedValue = map(sensorValue, 0, 1023, 0, 200);

  // 只在數值變化時傳送
  if (mappedValue != lastMappedValue) {
    Serial.println(mappedValue);
    lastMappedValue = mappedValue;
  }

  // 延遲 100 毫秒，避免傳輸過於頻繁
  delay(100);
}