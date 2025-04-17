void setup() {
  Serial.begin(9600); // 初始化序列埠
}

void loop() {
  int potValue = analogRead(A0); // 讀取可調式電阻數據
  Serial.println(potValue);      // 傳輸數據到序列埠
  delay(100);                    // 每 100 毫秒傳輸一次
}