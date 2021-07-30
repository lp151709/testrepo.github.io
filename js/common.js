var loginInfo = {}
var token = "";
var cacheValue = {};
var baseContent = null;

$(function () {
    openPage($("body"));
    $("[name='mu_info']").click(function () {
        var goto_val = $(this).attr("goto");
        var baseName = $(this).attr("for");
        var base = baseName ? $("#" + baseName) : baseContent;
        showHtml(goto_val, null, base);
    });
});

function gotoPage(name, args, content) {
    checkLogin(function () {
        var con = content ? content : baseContent;
        showHtml(name, args, con);
    });
}

function getCache(key){
    return readCache(baseContent.attr("id"), key);
}

function setCache(key, value) {
    writeCache(baseContent.attr("id"), key, value);
}

function readCache(name, key) {
    if (cacheValue[name]){
        return cacheValue[name][key];
    }
}

function writeCache(name, key, value) {
    if (!cacheValue[name]){
        cacheValue[name] = {};
        if (!cacheValue[name][key]){
            cacheValue[name][key] = {}
        }
    }

    cacheValue[name][key] = value;
}

function checkDate(dt1, dt2) {
    return
        dt1.getFullYear() == dt2.getFullYear() &&
        dt1.getMonth() == dt2.getMonth() &&
        dt1.getDate() == dt2.getDate()
}

function showHtml(page, args, contentItem){
    var argStr = "";
    if (args){
        for (var arg in args){
            argStr += Global.StringFormat("&{0}={1}", [arg, encodeURIComponent(args[arg])]);
        }
    }

    if (!Global.EndWith(page, ".html")){
        page += ".html";
    }
    ServerItems.web.RunHTML(page, function (html) {
        contentItem.fadeOut(500, function () {
            contentItem.html(html);
            openPage(contentItem);
            contentItem.fadeIn(300);
        });

    }, argStr);
}

function headEntity(){
    return {
        appId: "history",
        token: token,
        userId: loginInfo.id
    }
}

function CreateEntity(data){
    return {
        Login: headEntity(),
        Body: data
    }
}

function linkToPost(svr, data, funcName, func){
    // var queryData = CreateEntity(data);
    ServerItems[svr].RunPost(funcName, data, function(val){
        func(val);
    });
}

function linkTo(svr, data, funcName, func){
    var queryData = CreateEntity(data);
    ServerItems[svr].RunData(funcName, queryData, function(val){
        if (func){
            func(val.body);
        }
    });
}

function uploadTo(data, fid, funcName, func){
    data.token = token;
    ServerItems["files"].FileUpload(funcName, fid, data, function(val){
        if (func){
            if ("0000" == val.resultCode) {
                show_message("上传成功！");
                func(val.body);
            } else {
                show_message("上传失败！");
            }
        }
    });
}

function readToken(){
    token = $.getQueryString("token");
    return token;
}

function checkLogin(func){
    linkTo("login", {
        token: readToken()
    }, "CheckLogin", function (val) {
        loginInfo = val;
        func();
    });
}

function longString(str, len) {
    return str.length > len ? str.substr(0, len) + "..." : str;
}

function randomNum(minNum, maxNum) {
    switch (arguments.length) {
        case 1:
            return parseInt(Math.random() * minNum + 1, 10);
            break;
        case 2:
            return parseInt(Math.random() * ( maxNum - minNum + 1 ) + minNum, 10);
            //或者 Math.floor(Math.random()*( maxNum - minNum + 1 ) + minNum );
            break;
        default:
            return 0;
            break;
    }
}

//十进制转化为16进制
function hex(x){
    return ("0" + parseInt(x).toString(16)).slice(-2);
}

function RGB2HEX(rgb){
    rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
}

function openPage (content) {
    var open_page = $("page", content);
    $.each(open_page, function (i, it) {
        var page_name = $(it).attr("goto");
        showHtml(page_name, null, $(it));
    });
}

function logout(){
    linkToPost("cenofmagent", {
        token: token
    }, "token/logout", function (val) {
        var json = eval("(" + val + ")");
        if (200 == json.code){
            window.location.replace("https://dhc.library.sh.cn");
        }
    });
}

function show_message(msg){
    showMessage(msg,2000,true,'bounceInUp-hastrans','bounceOutDown-hastrans');
}
