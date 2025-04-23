void setup() {
  Serial.begin(9600);
}

void loop() {
  int sensorValue = analogRead(A0); // 可調電阻接 A0
  Serial.println(sensorValue);      // 傳給電腦
  delay(30); // 每 30 毫秒傳一次
}