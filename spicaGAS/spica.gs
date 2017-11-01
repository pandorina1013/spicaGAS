var bot_name = "spica";
var bot_icon = PropertiesService.getScriptProperties().getProperty('JPG');
var token = PropertiesService.getScriptProperties().getProperty('SLACK_ACCESS_TOKEN');
var verify_token = PropertiesService.getScriptProperties().getProperty('VERIFY_TOKEN');
var spread_url = PropertiesService.getScriptProperties().getProperty('SP_URL');
var docomo_api = PropertiesService.getScriptProperties().getProperty('API_DOCOMO');
var docomo_api_q = PropertiesService.getScriptProperties().getProperty('API_DOCOMO_Q');
var address = PropertiesService.getScriptProperties().getProperty('ADDRESS');

//post slack.
function postSlackMessage(content) {
  var slackApp = SlackApp.create(token); 
  var options = {channelId: "#spica", userName: bot_name, message: content, icon_url: bot_icon};  
  slackApp.postMessage(options.channelId, options.message, {username: options.userName,icon_url:options.icon_url});
}

//docomo api.
function getDocomoMessage(mes) {
  if(mes.slice(0,1)=="？" || mes.slice(0,1)=="?"){
    mes.substr(1);
    var dialogue_options = {'utt': mes}
    var url = docomo_api_q + encodeURI(mes);
    var response = UrlFetchApp.fetch(url);
    var content = JSON.parse(response.getContentText());
    var message = content["message"]["textForDisplay"];
    message = message.replace( /一位は、/g , "" ) ; 
  }else{
    var dialogue_options = {'utt': mes}
    var options = {'method': 'POST', 'contentType': 'text/json', 'payload': JSON.stringify(dialogue_options)};
    var response = UrlFetchApp.fetch("https://api.apigw.smt.docomo.ne.jp/dialogue/v1/dialogue?APIKEY=677844714c58442f50554f53706b5966794b33795631707357446d3778372f664f3556564a4e4a55597a30", options);
    var content = JSON.parse(response.getContentText());
    var message = content.utt;
  }
  return message;
}

//weather forecast
function getWeather(){
  var weather = UrlFetchApp.fetch("http://weather.livedoor.com/forecast/webservice/json/v1?city=130010"); // 東京
  if(weather.getResponseCode() != 200){return false;}
  var json = JSON.parse(weather.getContentText());
  var today = json["forecasts"][0]["telop"]; // 今日の天気
  var tomorrow = json["forecasts"][1]["telop"]; // 明日の天気
  var message = " 今の天気は「" + today + "」、明日は「" + tomorrow + "」ですよ～。";
  return message;
}

//choose post sentence.
function doPost(e) {
  if (verify_token != e.parameter.token) {
    throw new Error("invalid token.");
  }
  var app = SlackApp.create(token);
  var ss = SpreadsheetApp.openByUrl(spread_url);
  var sheet = ss.getSheets()[0];
  var text = e.parameter.text.substr(0);
  if(e.parameter.user_name=="pandorina463"){
    if(text.match(/てんき/) || text.match(/テンキ/) || text.match(/tenki/) || text.match(/天気/)){
      var message = getWeather();
    }else if(text.match(/メール/) || text.match(/めーる/)){
      var count = getNewGmail();
      if(count==0){
        var message = "メールは来てないみたいですよ～";
      }
    }else{
      var message = getDocomoMessage(text);
    }
    return app.postMessage(e.parameter.channel_id, message, {username: bot_name,icon_url: bot_icon});
  }
}

//execute every morning.
function doMorning(){
  var message = "おはようございます！spicaです。\n" + getWeather() + "\n";
  postSlackMessage(message)
}

//get gmail and post it.
function getNewGmail() {
  var threads = GmailApp.search('is:unread label:Slack');
  var count = threads.length;
  if(count!=0){
    postSlackMessage("メールが"　+ count + "件届いているみたいですね");
    for(var i = 0; i < count; i++) {
        postSlackMessage("\n[件名]：" + threads[i].getFirstMessageSubject() + " \n" + threads[i].getPermalink(), "GMAIL");
        threads[i].markRead();
    }
  }
  return count;
}
