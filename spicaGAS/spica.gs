var bot_name = "spica";
var bot_icon = "https://pbs.twimg.com/profile_images/847612503374700548/T4PycpQw.jpg";
var token = PropertiesService.getScriptProperties().getProperty('SLACK_ACCESS_TOKEN');
var verify_token = PropertiesService.getScriptProperties().getProperty('VERIFY_TOKEN');
var spread_url = PropertiesService.getScriptProperties().getProperty('SP_URL');
//���b�Z�[�W�𑗂�
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

//cell�֐�
function cells(i,j){
  var ss = SpreadsheetApp.openByUrl(spread_url);
  var sheet = ss.getSheets()[0];
  return sheet.getSheetValues(i,j,1,1);
}

//���Z���X�g
function getList(){
  postSlackMessage("�y���Y���z�z\n" + cells(1,22) + "�~ (�O���� "�@+ cells(3,22) +
  "�~)\n�y�����������z\n" + cells(4,22) + "�~ (�O���� "�@+ cells(6,22) + 
  "�~)\n�y�������x�o�z\n" + cells(7,22) + "�~ (�O���� "�@+ cells(9,22) + 
  "�~)\n\n�y�x�o����z\n�H��@�F" + cells(3,16) + "�~ (�O�� " + cells(3,14) + 
  "�~)\n���۔�F" + cells(2,16) + "�~ (�O�� " + cells(2,14) +
  "�~)\n�G�݁@�F" + cells(4,16) + "�~ (�O�� " + cells(4,14) + 
  "�~)\n�w��@�F" + cells(5,16) + "�~ (�O�� " + cells(5,14) + 
  "�~)\n��ʁ@�F" + cells(6,16) + "�~ (�O�� " + cells(6,14) + 
  "�~)\n��@�F" + cells(7,16) + "�~ (�O�� " + cells(7,14) + 
  "�~)\n���M��F" + cells(1,16) + "�~ (�O�� " + cells(1,14) + 
  "�~)\n�����@�F" + cells(8,16) + "�~ (�O�� " + cells(8,14) + 
  "�~)\n���̑��F" + cells(9,16) + "�~ (�O�� " + cells(9,14) + 
  "�~)\n\n�y��������z\n�d����F" + cells(1,20) + "�~ (�O�� " + cells(1,18) +
  "�~)\n���^�@�F" + cells(2,20) + "�~ (�O�� " + cells(2,18) +
  "�~)\n�Վ��@�F" + cells(3,20) + "�~ (�O�� " + cells(3,18) + "�~)");
}

function getWeather(){
  var weather = UrlFetchApp.fetch("http://weather.livedoor.com/forecast/webservice/json/v1?city=130010"); // ����
    // �G���[�������珈�����I��
  if(weather.getResponseCode() != 200){
      return false;
  }
  var json = JSON.parse(weather.getContentText());
  var today = json["forecasts"][0]["telop"]; // �����̓V�C
  var tomorrow = json["forecasts"][1]["telop"]; // �����̓V�C
  var message = " �����́u" + today + "�v�A�����́u" + tomorrow + "�v�ł���`�B";
  return message;
}

//���[�U�[�̓��e�ɔ�������
function doPost(e) {
  
  //���e�̔F��
  if (verify_token != e.parameter.token) {
    throw new Error("invalid token.");
  }
  
  var app = SlackApp.create(token);
  var ss = SpreadsheetApp.openByUrl(spread_url);
  var sheet = ss.getSheets()[0];
  //Trigger Words�����̍폜
  var text = e.parameter.text.substr(0);
  
  if(e.parameter.user_name=="pandorina463"){
  
  if(text.match(/list/) || text.match(/���X�g/) || text.match(/�肷��/)){
    //.list�R�}���h
    getList();
    var message = "���Ċ����݂����ł��I"
  }else if(text.match(/�Ă�/) || text.match(/�e���L/) || text.match(/tenki/) || text.match(/�V�C/)){
    //�V�C�\��
    var message = getWeather();
    //�ƌv��
  }else if(text.match(/�ƌv��/) || text.match(/��������/)){
    //.n Item �R�}���h�i�x�o�j
    sheet.getRange(12, 22).setValue(1);
    var message = "�ƌv����L�^��������ł��ˁB�����L�^����΂����H"
    
  }else{
    if((""+cells(12,22))==1){
      var text = e.parameter.text.substr(0);
      sheet.getRange(sheet.getRange("G:G").getValues().filter(String).length+1, 7).setValue(text);
      //�Ƃ肠�����x�o�̕��ɓ��́B
      var Name = cells(sheet.getRange("G:G").getValues().filter(String).length,9)
    
      if(Name != "�d����" && Name != "���^" && Name != "�Վ�"){
        //���Y���z�̏㏑��
        var oldAssets = Number(cells(1,22));
        var Assets = Number(cells(1,22)) - Number(cells(sheet.getRange("G:G").getValues().filter(String).length,8));
        sheet.getRange(1,22).setValue(Assets)
        sheet.getRange(11,22).setValue(Number(cells(11,22)) + Number(cells(sheet.getRange("G:G").getValues().filter(String).length,8)))
      
        //���M���b�Z
        var message = "�u" + text + "�v...�ӂނӂ�......�B\n��" + text + "�Ɏg�������ċL�^���Ƃ���I\n�y���Y���z�z\n" + 
          oldAssets + "->" +Assets +  "�~\n�y�������x�o�z\n" + cells(4,22) + "�~ (�O���� "�@+ cells(6,22) + 
            "�~)\n\n�y�x�o����z\n�H��@�F" + cells(3,16) + "�~ (�O�� " + cells(3,14) + 
              "�~)\n���۔�F" + cells(2,16) + "�~ (�O�� " + cells(2,14) + 
                "�~)\n�G�݁@�F" + cells(4,16) + "�~ (�O�� " + cells(4,14) + 
                  "�~)\n�w��@�F" + cells(5,16) + "�~ (�O�� " + cells(5,14) + 
                    "�~)\n��ʁ@�F" + cells(6,16) + "�~ (�O�� " + cells(6,14) + 
                      "�~)\n��@�F" + cells(7,16) + "�~ (�O�� " + cells(7,14) + 
                        "�~)\n���M��F" + cells(1,16) + "�~ (�O�� " + cells(1,14) + 
                          "�~)\n�����@�F" + cells(8,16) + "�~ (�O�� " + cells(8,14) + 
                            "�~)\n���̑��F" + cells(9,16) + "�~ (�O�� " + cells(9,14) + "�~)\n"
      
      }else{
        // n Item�R�}���h�i����)
        //����������������u��
        sheet.getRange(sheet.getRange("G:G").getValues().filter(String).length, 7).setValue("");
        sheet.getRange(sheet.getRange("J:J").getValues().filter(String).length+1, 10).setValue(text);
        
        var oldAssets = Number(cells(1,22));
        var Assets = Number(cells(1,22)) + Number(cells(sheet.getRange("J:J").getValues().filter(String).length,11));
        sheet.getRange(1,22).setValue(Assets)
      
      //���M���b�Z
        var message = "�u" + text + "�v...�ӂނӂ�......�B\n��" + text + "�ŉ҂������ċL�^���Ƃ���I\n�y���Y���z�z\n" + 
          oldAssets + "->" +Assets  +  "�~\n�y�����������z\n" + cells(7,22) + "�~ (�O���� "�@+ cells(9,22) +
            "�~)\n\n�d����F" + cells(1,20) + "�~ (�O�� " + cells(1,18) +
              "�~)\n���^�@�F" + cells(2,20) + "�~ (�O�� " + cells(2,18) +
                "�~)\n�Վ��@�F" + cells(3,20) + "�~ (�O�� " + cells(3,18) + "�~)";
        
      }
      
      sheet.getRange(12, 22).setValue(0);
      
    }else{
      //�ق�Ƃɂ킩��Ȃ���
      var message = "���߂�Ȃ����c���������Ă���̂��킩��Ȃ��āc";
    }
    
  }
  return app.postMessage(e.parameter.channel_id, message, {
    username: bot_name,
    icon_url: bot_icon
  });
  }
  
}
 
//�V�C�\��in��
function doMorning(){
  var message = "���͂悤�������܂��Ispica�ł��B" + getWeather();
  postSlackMessage(message)
}

//�ƌv����ʃ��|
function doEveryday(){
  var ss = SpreadsheetApp.openByUrl(spread_url);
  var sheet = ss.getSheets()[0];
  if(Number(cells(11,22))>2000){
    postSlackMessage("�������������ꂳ�܁B���Z���ɂ��܂�����B\n�y�{���̑��x�o�z  " + Number(cells(11,22)) + "�~ " + "(�O��" + cells(10,22) + "�~)\n�`���b�g�g���߂����ȁH���������撣�낤�I");
  }else{
    postSlackMessage("�������������ꂳ�܁B���Z���ɂ��܂�����B\n�y�{���̑��x�o�z  " + Number(cells(11,22)) + "�~ " + "(�O��" + cells(10,22) + "�~)\n����܂�����Ȃ������ˁI���₷�݂Ȃ����B");
  }
  //����������̗��Ɉڂ�
  sheet.getRange(10, 22).setValue(Number(cells(11,22)))
  sheet.getRange(11, 22).setValue("")
}

//�ƌv�댎�����|
function doMonth(){
  var ss = SpreadsheetApp.openByUrl(spread_url);
  var sheet = ss.getSheets()[0];
  var ss = SpreadsheetApp.openByUrl(spread_url);
  var sheet = ss.getSheets()[0];
  postSlackMessage("spica�ł��B���Z�񍐂̓�������Ă܂���܂����I\n\n");
  getList();
  postSlackMessage("\n���Ă��񂶂݂����B�������撣�낤��!");
}
