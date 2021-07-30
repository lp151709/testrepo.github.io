/**
 * 作者：虞健超（James.J.Yu） 日期：2010-11-26 简介：包括一个Grid实现
 */

Global = {};

Global.RootURI = function (baseURI, addTop) {

	if (baseURI) {
		return location.hostname;
	}

	return Global.StringFormat("{0}//{1}{2}/{3}", [
		document.location.protocol,
		document.location.hostname,
		Global.IsNull(document.location.port) ? "" : ":"
			+ document.location.port, addTop ? topSite : ""]);
}

Global.Random = function (addTime, max) {
	var maxIndex = 10;
	for (var i = 0; i < max; i++) {
		maxIndex *= 10;
	}
	var randomData = parseInt(Math.random() * maxIndex);
	if (addTime) {
		var date = new Date();
		var dateStr = "" + date.getFullYear() + (date.getMonth() + 1)
			+ date.getDay() + date.getHours() + date.getMinutes()
			+ date.getSeconds();
		return dateStr + randomData;
	}

	return randomData;
}

Global.PageName = function (url) {
	var urlName = url ? url : document.location.href;
	var urlNameList = urlName.split("?");
	for (var i = 0; i < urlNameList.length; i++) {
		var page = urlNameList[i].split("/");
		return page[page.length - 1];
	}

	return document.location.href;
}

Global.IsNull = function (obj, allowNullChar) {
	return undefined == obj || null == obj || {} == obj
		|| (!allowNullChar ? "" === obj : false);
}

Global.GetCookieNames = function () {
	var cookieNames = [];
	if (document.cookie && document.cookie != '') {
		var cookies = document.cookie.split(';');
		for (var i = 0; i < cookies.length; i++) {
			cookieNames.push($.trim(cookies[i].split('=')[0]));
		}
	}

	return cookieNames;
}

Global.IsJQueryObject = function (obj) {
	return !Global.IsNull(obj) && !Global.IsNull(obj.jquery);
}

Global.SetJQueryObject = function (obj) {
	return Global.IsJQueryObject(obj) ? obj : $(obj);
}

Global.BindCheckBox = function (container) {
	if (Global.IsNull(container)) {
		container = document;
	}

	$
		.each(
			$("input[type=checkbox]", Global.SetJQueryObject(container)),
			function (index, item) {
				var checkbox = Global.SetJQueryObject(item);
				if (!Global.IsNull(checkbox.attr("selectvalue"))) {
					var selectvalue = eval("("
						+ checkbox.attr("selectvalue") + ")");
					if ((selectvalue.Yes == checkbox.val() && !checkbox[0].checked)
						|| (selectvalue.No == checkbox.val() && checkbox[0].checked)) {
						checkbox.click();
					}

					checkbox[0].checked = selectvalue.Yes == checkbox
						.val();
				}
			});
}

Global.GetMousePosition = function (e) {
	var x = 0, y = 0;
	var e = e || window.event;
	if (e.pageX || e.pageY) {
		x = e.pageX;
		y = e.pageY;
	} else if (e.clientX || e.clientY) {
		x = e.clientX + document.body.scrollLeft
			+ document.documentElement.scrollLeft;
		y = e.clientY + document.body.scrollTop
			+ document.documentElement.scrollTop;
	}
	return {
		X: x,
		Y: y
	};
}

Global.Type2String = function (obj, dataType) {
	var dtype = null;
	if (!this.IsNull(dataType)) {
		dtype = dataType.toLowerCase();
		if ("datetime" == dtype && obj.length > 1) {
			var strValue = obj.substring(1, obj.length - 1);
			return eval("new " + strValue).toLocaleString();
		}
	}
	return obj;
}

Global.String2Type = function (type, obj, dataType) {
	var dtype = null;
	if (!this.IsNull(dataType)) {
		dtype = dataType.toLowerCase();
		if ("int" == dtype || "float" == dtype || "decimal" == dtype
			|| "double" == dtype || "number" == type) {
			return Number(obj);
		} else if ("boolean" == dtype || "boolean" == type) {
			return "TRUE" == obj.toUpperCase();
		} else if ("datetime" == dtype && obj.length > 2) {
			var strValue = obj.substring(1, obj.length - 2);
			return eval("new " + strValue);
		}
	}
	return obj;
}

Global.Split = function (str, data) {
	var reg = new RegExp("(#+" + data + "|" + data + ")", "g");
	var lastIndex = 0;
	var list = [];
	var replaceReg = new RegExp("(#" + data + ")", "g");

	while (true) {
		var exec = reg.exec(str);
		if (null == exec)
			break;

		var start = exec[0].match(/#+/g);

		if (null != start && 1 == start[0].length % 2) {
			continue;
		}

		var splitIndex = exec[0].match(/([^#].*)/);
		var txt = str.substring(lastIndex, exec.index + splitIndex.index)
			.replace(replaceReg, data).replace(/##/g, "#");
		list.push(txt);
		lastIndex = exec.index + exec[0].length;
	}

	if (lastIndex < str.length) {
		var txt = str.substr(lastIndex).replace(replaceReg, data).replace(
			/##/g, "#");
		list.push(txt);
	}

	return list;
}

//	

Global.StringReplaceMap = function(str, name, map){
	var strReg = "(\\$\\{.*\:.*?\\})";
	var reg = new RegExp(strReg, "g");
	var find = str.match(reg);
	var rtn = str;
	for (i=0; i<find.length;i++){
		var key = find[i].substring(2, find[i].length - 1)
		var name_val = key.split(":");
		if (name_val[0] == name && map[name_val[1]]){
			rtn = rtn.replace(find[i], map[name_val[1]])
		}
	}

	return rtn;
}

Global.StringReplace = function(str, map){
	var strReg = "(\\$\\{+.*?\\})";
	var reg = new RegExp(strReg, "g");
	var find = str.match(reg);
	var rtn = str;
	for (i=0; i<find.length;i++){
		var key = find[0].substring(2, find[i].length - 1)
		if (map[key]){
			rtn = rtn.replace(find[i], map[key])
		}
	}

	return rtn;
}

Global.StringFormat = function (str, list) {
	var data = list;
	var strArray = str.split("");
	for (var i = 0; i < data.length; i++) {
		var strReg = "(\\{+" + i + "\\}+)";
		var reg = new RegExp(strReg, "g");

		while (true) {
			var exec = reg.exec(str);
			if (null == exec)
				break;

			var start = exec[0].match(/{+/g);
			var end = exec[0].match(/}+/g);
			var findStr = exec[0].replace(/{{/g, "{").replace(/}}/g, "}");
			var lastIndex = exec.index + exec[0].length;

			for (var strIndex = exec.index; strIndex < lastIndex; strIndex++) {
				strArray[strIndex] = "";
			}

			if (start[0].length % 2 > 0 && end[0].length % 2 > 0) {
				strArray[exec.index] = findStr.replace(/{\d+}/g, data[i]);
			} else {
				strArray[exec.index] = findStr;
			}
		}
	}

	str = strArray.join("");

	return str;
}

Global.CloneObject = function (r) {
	var obj = {};
	Global.CopyObject(r, obj);
	return obj;
}

Global.CopyObject = function (r, d) {
	if (Global.IsNull(d)) {
		d = {};
	}
	for (var n in r) {
		if ("function" != typeof r[n]) {
			if ("object" == typeof r[n]) {
				if (Global.IsNull(d[n])) {
					d[n] = {};
				}
				Global.CopyObject(r[n], d[n]);
			} else {
				d[n] = r[n];
			}
		}
	}
}

Global.FindAllItem = function (obj, func) {
	var items = Global.SetJQueryObject(obj).contents();
	for (var i = 0; i < items.length; i++) {
		if (Global.FindAllItem(items[i], func) || func(items[i])) {
			return true;
		}
	}
}

Global.StartWith = function (t1, t2) {
	if (!Global.IsNull(t1) && !Global.IsNull(t2) && t1.length <= t2.length) {
		return t1 == t2.substr(0, t1.length);
	}

	return false;
}

Global.EndWith = function (t1, t2) {
	if (!Global.IsNull(t1) && !Global.IsNull(t2) && t1.length <= t2.length) {
		return t1 == t2.substr(t2.length - t1.length);
	}

	return false;
}

Global.CreateUUID = function () {
	var createUUID = (function (uuidRegEx, uuidReplacer) {
		return function () {
			return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(uuidRegEx,
				uuidReplacer).toUpperCase();
		};
	})(/[xy]/g, function (c) {
		var r = Math.random() * 16 | 0, v = c == "x" ? r : (r & 3 | 8);
		return v.toString(16);
	});
	return (createUUID());
}

Global.GetNowFormatDate = function (dt) {
	var date = dt ? dt : new Date();
	var seperator1 = "-";
	var seperator2 = ":";
	var year = date.getFullYear();
	var month = date.getMonth() + 1;
	var strDate = date.getDate();
	if (month >= 1 && month <= 9) {
		month = "0" + month;
	}
	if (strDate >= 0 && strDate <= 9) {
		strDate = "0" + strDate;
	}
	var currentdate = year + seperator1 + month + seperator1 + strDate + " "
		+ date.getHours() + seperator2 + date.getMinutes() + seperator2
		+ date.getSeconds();
	return currentdate;
}

Global.SetNullValue = function (obj) {
	for (var item in obj) {
		obj[item] = Global.IsNull(obj[item]) ? null : obj[item];
	}

	return obj;
}

Global.Trim = function (str) {
	if (Global.IsNull(str)) {
		return "";
	}

	var s = " ";
	s = (s ? s : "\\s");
	s = ("(" + s + ")");
	var reg_trim = new RegExp("(^" + s + "*)|(" + s + "*$)", "g");
	return str.replace(reg_trim, "");
}

Global.BindSelect = function (data, item) {
	content = Global.SetJQueryObject(item);
	content.empty();
	var bindItem = eval("(" + content.attr("selectbind") + ")");
	for (var i = 0; i < data.length; i++) {
		var opt = $("<option></option>");
		opt.text(data[i][bindItem.name]);
		opt.attr("value", data[i][bindItem.value]);
		content.append(opt);
	}

}

Global.GetFormatDate = function (value, fmt) {
	var date = new Date(value);

	var o = {
		"M+": date.getMonth() + 1, //月份
		"d+": date.getDate(), //日
		"h+": date.getHours(), //小时
		"m+": date.getMinutes(), //分
		"s+": date.getSeconds(), //秒
		"q+": Math.floor((date.getMonth() + 3) / 3), //季度
		"S": date.getMilliseconds() //毫秒
	};
	if (/(y+)/.test(fmt))
		fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
	for (var k in o){
		if (new RegExp("(" + k + ")").test(fmt)) {
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
		}
	}
	return fmt;
}

