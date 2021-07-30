var version = "1.1.0";
var errorMessage = "服务器返回错误，请刷新重试";

function DataBaseCollcet() {
	var currect = this;
	var ajaxRun = {};
	var ajaxIndex = 0;
	var instance = this;


	this.List = [];
	this.Items = {};
	this.IsRunEnd = false;
	this.ShowBlock = true;
	this.successCode = "0000";

	this.Init = function (topUrl) {
	}

	this.Regiest = function (url, name, baseUrl, header, dataType, contentType) {
		var item = {
			Url: url,
			BaseUrl: baseUrl,
			Header: header,
			dataType: dataType,
			contentType: contentType,
			RunData: function (fname, datas, func) {
				var json = $.toJSON(sendEntity(fname, datas, "NJSON"));
				var sendUrl = Global.StringFormat("{0}/{1}/{2}?v={3}", [this.BaseUrl, this.Url, fname, version]); //getLinkUri(this.Url, this.BaseUrl);
				$.ajax({
					type: "post",
					data: json,
					async: true,
					url: sendUrl,
					dataType: "json",
					contentType: "application/json",
					timeout: 10000,
					success: function (data) {
						if (instance.successCode == data.resultCode) {
							func(data);
						} else {
							window.top.location.replace("https://dhc.library.sh.cn");
							// alert(data.message);
						}
					},
					error: function (e) {
						alert(errorMessage);
					}
				});
			},
			RunPost: function (fname, datas, func) {
				// var json = $.toJSON(datas);
				var sendUrl = Global.StringFormat("{0}/{1}/{2}?v={3}", [this.BaseUrl, this.Url, fname, version]); //getLinkUri(this.Url, this.BaseUrl);
				$.post(sendUrl, datas, func);
				// $.ajax({
				// 	type: "post",
				// 	data: json,
				// 	async: true,
				// 	url: sendUrl,
				// 	dataType: this.dataType,
				// 	contentType: this.contentType,
				// 	timeout: 10000,
				// 	success: function (data) {
				// 		func(data);
				// 	},
				// 	error: function (e) {
				// 		alert(errorMessage);
				// 	}
				// });
			},
			RunDataJsonAsync: function (fname, datas, func) {
				//
				var json = sendEntity(fname, datas, "NJSON");
				var sendUrl = Global.StringFormat("{0}/{1}/{2}?v={3}", [this.BaseUrl, this.Url, fname, version]);//getLinkUri(this.Url, this.BaseUrl);
				$.ajax({
					type: "post",
					data: json,
					async: false,
					url: sendUrl,
					dataType: "json",
					contentType: "application/json",
					timeout: 10000,
					success: function (data) {
						if (instance.successCode == data.resultCode) {
							func(data);
						} else {
							alert(data.message);
						}
					},
					error: function (e) {
						alert(errorMessage);
					}
				});
			},
			RunHTML: function (page, func, arg) {
				var argVal = arg ? arg : "";
				var sendUrl = Global.StringFormat("{0}/{1}/{2}?v={3}{4}", [this.BaseUrl, this.Url, page, version, argVal]);
				$.ajax({
					type: "get",
					url: sendUrl,
					timeout: 10000,
					success: function (data) {
						func(data);
					},
					error: function (e) {
						alert(errorMessage);
					}
				});
			},
			RunPageHTML: function (page, func, arg) {
				var argVal = arg ? arg : "";
				var sendUrl = Global.StringFormat("{0}?v={1}{2}", [page, version, argVal]);
				$.ajax({
					type: "get",
					url: sendUrl,
					timeout: 10000,
					success: function (data) {
						func(data);
					},
					error: function (e) {
						alert(errorMessage);
					}
				});
			},
			FileUpload: function (fname, fid, datas, func, progressFunc, loadFunc) {
				//
				var sendUrl = Global.StringFormat("{0}/{1}/{2}", [this.BaseUrl, this.Url, fname]);
				$.ajaxFileUpload({
					url: sendUrl,
					secureuri: false,
					fileElementId: fid,
					data: datas,
					dataType: 'json',
					type: 'post',
					timeout: 10000,
					progress: function (evt) {
						if (progressFunc) {
							progressFunc(evt);
						}
					},
					load: function (evt) {
						if(loadFunc){
							loadFunc();
						}
					},
					success: function (data, status) {
						//var fileData = eval("(" + $(data).html() + ")");
						func(data, status);
					},
					error: function (data, status, e) {
						console.log(data);
					}
				});
			}
		};
		currect.List.push(item);
		currect.Items[name] = item;
	}
}

// function getLinkUri(uri, baseUrl) {
// 	return Global.StringFormat("{0}{1}?t={2}", [
// 			Global.IsNull(baseUrl) ? BASE.RootURI() : baseUrl, uri,
// 			BASE.MethodInvoke.Random(true, 2) ]);
// }

function sendEntity(fname, datas, mod) {
	return {
		appId: datas.Login.appId,
		token: datas.Login.token,
		method: mod,
		userId: datas.Login.userId,
		type: "SYNC",
		func: fname,
		body: datas.Body
	}
}
