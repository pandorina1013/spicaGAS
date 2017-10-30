var bot_name = "spica";
var bot_icon = "https://pbs.twimg.com/profile_images/847612503374700548/T4PycpQw.jpg";
var token = PropertiesService.getScriptProperties().getProperty('SLACK_ACCESS_TOKEN');
var verify_token = PropertiesService.getScriptProperties().getProperty('VERIFY_TOKEN');
var spread_url = PropertiesService.getScriptProperties().getProperty('SP_URL');
//メッセージを送る
function postSlackMessage(content) {
  
  var slackApp = SlackApp.create(token); 
  var options = {
    channelId: "#spica",
    userName: bot_name,
    message: content,
    icon_url: bot_icon,
  };  
  slackApp.postMessage(options.channelId, options.message, {username: options.userName,icon_url:options.icon_url});
}

//cell関数
function cells(i,j){
  var ss = SpreadsheetApp.openByUrl(spread_url);
  var sheet = ss.getSheets()[0];
  return sheet.getSheetValues(i,j,1,1);
}

//決算リスト
function getList(){
  postSlackMessage("【資産総額】\n" + cells(1,22) + "円 (前月比 "　+ cells(3,22) +
  "円)\n【今月総収入】\n" + cells(4,22) + "円 (前月比 "　+ cells(6,22) + 
  "円)\n【今月総支出】\n" + cells(7,22) + "円 (前月比 "　+ cells(9,22) + 
  "円)\n\n【支出内訳】\n食費　：" + cells(3,16) + "円 (前月 " + cells(3,14) + 
  "円)\n交際費：" + cells(2,16) + "円 (前月 " + cells(2,14) +
  "円)\n雑貨　：" + cells(4,16) + "円 (前月 " + cells(4,14) + 
  "円)\n学問　：" + cells(5,16) + "円 (前月 " + cells(5,14) + 
  "円)\n交通　：" + cells(6,16) + "円 (前月 " + cells(6,14) + 
  "円)\n趣味　：" + cells(7,16) + "円 (前月 " + cells(7,14) + 
  "円)\n光熱費：" + cells(1,16) + "円 (前月 " + cells(1,14) + 
  "円)\n貯金　：" + cells(8,16) + "円 (前月 " + cells(8,14) + 
  "円)\nその他：" + cells(9,16) + "円 (前月 " + cells(9,14) + 
  "円)\n\n【収入内訳】\n仕送り：" + cells(1,20) + "円 (前月 " + cells(1,18) +
  "円)\n給与　：" + cells(2,20) + "円 (前月 " + cells(2,18) +
  "円)\n臨時　：" + cells(3,20) + "円 (前月 " + cells(3,18) + "円)");
}

function getWeather(){
  var weather = UrlFetchApp.fetch("http://weather.livedoor.com/forecast/webservice/json/v1?city=130010"); // 東京
    // エラーだったら処理を終了
  if(weather.getResponseCode() != 200){
      return false;
  }
  var json = JSON.parse(weather.getContentText());
  var today = json["forecasts"][0]["telop"]; // 今日の天気
  var tomorrow = json["forecasts"][1]["telop"]; // 明日の天気
  var message = " 今日は「" + today + "」、明日は「" + tomorrow + "」ですよ～。";
  return message;
}

//ユーザーの投稿に反応する
function doPost(e) {
  
  //投稿の認証
  if (verify_token != e.parameter.token) {
    throw new Error("invalid token.");
  }
  
  var app = SlackApp.create(token);
  var ss = SpreadsheetApp.openByUrl(spread_url);
  var sheet = ss.getSheets()[0];
  //Trigger Words部分の削除
  var text = e.parameter.text.substr(0);
  
  if(e.parameter.user_name=="pandorina463"){
  
  if(text.match(/list/) || text.match(/リスト/) || text.match(/りすと/)){
    //.listコマンド
    getList();
    var message = "って感じみたいです！"
  }else if(text.match(/てんき/) || text.match(/テンキ/) || text.match(/tenki/) || text.match(/天気/)){
    //天気予報
    var message = getWeather();
    //家計簿
  }else if(text.match(/家計簿/) || text.match(/かけいぼ/)){
    //.n Item コマンド（支出）
    sheet.getRange(12, 22).setValue(1);
    var message = "家計簿を記録したいんですね。何を記録すればいい？"
    
  }else{
    if((""+cells(12,22))==1){
      var text = e.parameter.text.substr(0);
      sheet.getRange(sheet.getRange("G:G").getValues().filter(String).length+1, 7).setValue(text);
      //とりあえず支出の方に入力。
      var Name = cells(sheet.getRange("G:G").getValues().filter(String).length,9)
    
      if(Name != "仕送り" && Name != "給与" && Name != "臨時"){
        //資産総額の上書き
        var oldAssets = Number(cells(1,22));
        var Assets = Number(cells(1,22)) - Number(cells(sheet.getRange("G:G").getValues().filter(String).length,8));
        sheet.getRange(1,22).setValue(Assets)
        sheet.getRange(11,22).setValue(Number(cells(11,22)) + Number(cells(sheet.getRange("G:G").getValues().filter(String).length,8)))
      
        //送信メッセ
        var message = "「" + text + "」...ふむふむ......。\n￥" + text + "に使ったって記録しとくよ！\n【資産総額】\n" + 
          oldAssets + "->" +Assets +  "円\n【今月総支出】\n" + cells(4,22) + "円 (前月比 "　+ cells(6,22) + 
            "円)\n\n【支出内訳】\n食費　：" + cells(3,16) + "円 (前月 " + cells(3,14) + 
              "円)\n交際費：" + cells(2,16) + "円 (前月 " + cells(2,14) + 
                "円)\n雑貨　：" + cells(4,16) + "円 (前月 " + cells(4,14) + 
                  "円)\n学問　：" + cells(5,16) + "円 (前月 " + cells(5,14) + 
                    "円)\n交通　：" + cells(6,16) + "円 (前月 " + cells(6,14) + 
                      "円)\n趣味　：" + cells(7,16) + "円 (前月 " + cells(7,14) + 
                        "円)\n光熱費：" + cells(1,16) + "円 (前月 " + cells(1,14) + 
                          "円)\n貯金　：" + cells(8,16) + "円 (前月 " + cells(8,14) + 
                            "円)\nその他：" + cells(9,16) + "円 (前月 " + cells(9,14) + "円)\n"
      
      }else{
        // n Itemコマンド（収入)
        //もし収入だったら置換
        sheet.getRange(sheet.getRange("G:G").getValues().filter(String).length, 7).setValue("");
        sheet.getRange(sheet.getRange("J:J").getValues().filter(String).length+1, 10).setValue(text);
        
        var oldAssets = Number(cells(1,22));
        var Assets = Number(cells(1,22)) + Number(cells(sheet.getRange("J:J").getValues().filter(String).length,11));
        sheet.getRange(1,22).setValue(Assets)
      
      //送信メッセ
        var message = "「" + text + "」...ふむふむ......。\n￥" + text + "で稼いだって記録しとくよ！\n【資産総額】\n" + 
          oldAssets + "->" +Assets  +  "円\n【今月総収入】\n" + cells(7,22) + "円 (前月比 "　+ cells(9,22) +
            "円)\n\n仕送り：" + cells(1,20) + "円 (前月 " + cells(1,18) +
              "円)\n給与　：" + cells(2,20) + "円 (前月 " + cells(2,18) +
                "円)\n臨時　：" + cells(3,20) + "円 (前月 " + cells(3,18) + "円)";
        
      }
      
      sheet.getRange(12, 22).setValue(0);
      
    }else{
      //ほんとにわかんない時
      var message = "ごめんなさい…何をいっているのかわからなくて…";
    }
    
  }
  return app.postMessage(e.parameter.channel_id, message, {
    username: bot_name,
    icon_url: bot_icon
  });
  }
  
}
 
//天気予報in朝
function doMorning(){
  var message = "おはようございます！spicaです。" + getWeather();
  postSlackMessage(message)
}

//家計簿日別レポ
function doEveryday(){
  var ss = SpreadsheetApp.openByUrl(spread_url);
  var sheet = ss.getSheets()[0];
  if(Number(cells(11,22))>2000){
    postSlackMessage("今日も一日お疲れさま。決算しにきましたよ。\n【本日の総支出】  " + Number(cells(11,22)) + "円 " + "(前日" + cells(10,22) + "円)\nチョット使い過ぎかな？あしたも頑張ろう！");
  }else{
    postSlackMessage("今日も一日お疲れさま。決算しにきましたよ。\n【本日の総支出】  " + Number(cells(11,22)) + "円 " + "(前日" + cells(10,22) + "円)\nあんましつかわなかったね！おやすみなさい。");
  }
  //今日を昨日の欄に移す
  sheet.getRange(10, 22).setValue(Number(cells(11,22)))
  sheet.getRange(11, 22).setValue("")
}

//家計簿月次レポ
function doMonth(){
  var ss = SpreadsheetApp.openByUrl(spread_url);
  var sheet = ss.getSheets()[0];
  var ss = SpreadsheetApp.openByUrl(spread_url);
  var sheet = ss.getSheets()[0];
  postSlackMessage("spicaです。決算報告の日がやってまいりました！\n\n");
  getList();
  postSlackMessage("\nってかんじみたい。来月も頑張ろうね!");
}
