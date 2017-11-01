# spica-slack

## 自己紹介
- GAS製の貧弱slackbotです。GoogleDrive上で動きます。 
- 機能は単純に毎朝の挨拶+天気予報とメール受信のみです。 話しかけるとDocomoAPIで返してくれたりもします。

## 導入
1. google drive上のお好きな所にGoogle Apps Scriptファイルを新規作成し、コードをペタっと貼って下さい。
2. PropertiesService.getScriptProperties() 部分の指定はfile -> project properties -> script properties に追加して下さい。
3. 後は基本的にはtriggerを指定してお好きな時間に実行させて下さい。
4. 連携には主にFTTTを使用しています。ググってね。
