
// var topUrl = "http://192.168.1.33:8080/api"
// var pageUrl = "http://192.168.1.33:8080";


// var pageUrl = "https://dhc.library.sh.cn/uc";
var webApi = "https://dhapi.library.sh.cn/management/webapi";
// var webSearch = "/es/jdbk";

// var topUrl = "http://127.0.0.1:8081/api"
// var pageUrl = "http://127.0.0.1:8081";

var pageUrl = Global.RootURI() + "uc/"; //pub
// var pageUrl = Global.RootURI(); //dev

var webSearch = Global.StringFormat("{0}websearch", [Global.RootURI()]);
//var webApi = Global.StringFormat("{0}webapi", [Global.RootURI()]);

// var topUrl = "https://dhcapi.library.sh.cn/gateway/hisuc/api/uc"; //pub cors
var topUrl = Global.StringFormat("{0}api", [pageUrl]); //pub
// var topUrl = "https://dhc.library.sh.cn/uc/api"; //test
// var topUrl = "http://localhost:8085/uc"; //dev cors

var webBk = "https://dhc.library.sh.cn/bk";





var ServerObject = new DataBaseCollcet();
ServerObject.Init();
ServerObject.Regiest("info", "info", topUrl);
ServerObject.Regiest("favorites", "favor", topUrl);
ServerObject.Regiest("language", "lang", topUrl);
ServerObject.Regiest("message", "message", topUrl);
ServerObject.Regiest("setting", "setting", topUrl);
ServerObject.Regiest("userLog", "log", topUrl);
ServerObject.Regiest("analyse", "analyse", topUrl);
ServerObject.Regiest("login", "login", topUrl);
ServerObject.Regiest("history", "history", topUrl);
ServerObject.Regiest("files", "files", topUrl);
ServerObject.Regiest("page", "web", pageUrl);

ServerObject.Regiest("cenofmagent", "cenofmagent", webApi);
ServerObject.Regiest("corpus", "corpus", webSearch,  null,null, "application/json");

var ServerItems = ServerObject.Items;
