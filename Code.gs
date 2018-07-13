function main(account) {
  var dateStr = function(d) {return Utilities.formatDate(new Date(d * 1000), Session.getScriptTimeZone(), 'yyyy/MM/dd HH:mm:ss')};
  var thisTime = Math.floor(new Date().getTime() / 1000);
  var url = "https://api.stackexchange.com/2.2/inbox/unread?filter=withbody&pagesize=100&access_token=" + account.accessToken + "&key=" + account.key;
  var comments = UrlFetchApp.fetch(url, {muteHttpExceptions: true});
  if (comments.getResponseCode() == 200) {
    comments = JSON.parse(comments.getContentText());
    var itemsLen = comments.items.length;
    if (itemsLen > 0) {
      var prop = PropertiesService.getScriptProperties();
      var lastTime = prop.getProperty("time");
      lastTime = parseInt((lastTime == null ? 0 : lastTime), 10);
      var newItems = comments.items.filter(function(e) {return e.creation_date > lastTime});
      var len = newItems.length;
      if (len > 0) {
        var header = "Comments got from " + dateStr(lastTime) + " to " + dateStr(thisTime) + ".\r\n\r\n";
        var body = newItems.reduce(function(s, e, i) {
          return s + 
            "- Comment " + (i + 1) + "/" + len + "\r\n" +
            "date: " + dateStr(e.creation_date) + "\r\n" +
            "title: " + e.title + "\r\n" +
            "comment: " + e.body + "\r\n" +
            "link: " + e.link + "\r\n" +
            "Site: " + e.site.api_site_parameter + "\r\n\r\n";
        }, "");
        var footer = "quota_remaining: " + comments.quota_remaining + "/" + comments.quota_max + "\r\n";
        MailApp.sendEmail({to: account.mail, subject: "SoReport: Got " + len + (len == 1 ? " comment." : " comments."), body: header + body + footer});
      }
      prop.setProperty("time", thisTime.toString());
    }
  }
}

function run() {
  // Please set this object.
  var account = {
    key: "#####",
    accessToken: "#####",
    mail: "#####",
  };
  main(account);
}
