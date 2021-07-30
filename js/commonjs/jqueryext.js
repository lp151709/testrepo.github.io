// jQuery.browser.mozilla = /firefox/.test(navigator.userAgent.toLowerCase());
// jQuery.browser.webkit = /webkit/.test(navigator.userAgent.toLowerCase());
// jQuery.browser.opera = /opera/.test(navigator.userAgent.toLowerCase());
// jQuery.browser.msie = /msie/.test(navigator.userAgent.toLowerCase());

jQuery.InnerPageItems = {};

jQuery.fn.ButtonDisabled = function (status) {
  if (status) {
    this.attr("disabled", "disabled");
    this.addClass("disabled");
  } else {
    this.attr("disabled", "");
    this.removeClass("disabled");
  }
}

jQuery.fn.ItemsDisabled = function (status) {
  this.ButtonDisabled(status);
  this.FindChildItem(function (childItem) {
    var item = Global.SetJQueryObject(childItem);
    item.ButtonDisabled(status);
  });
}

jQuery.fn.FindChildItem = function (func) {
  Global.FindAllItem(this, func);
}

jQuery.fn.ClearEvent = function () {
  var item = Global.SetJQueryObject(this);
  item.unbind();
  item.FindChildItem(function (childItem) {
    var child = Global.SetJQueryObject(childItem);
    child.unbind();
  });
}

jQuery.fn.BindElementDisabled = function () {
  var item = Global.SetJQueryObject(this);
  item.BindItemDisabled();
  item.FindChildItem(function (childItem) {
    var child = Global.SetJQueryObject(childItem);
    child.BindItemDisabled();
  });
}

jQuery.fn.BindItemDisabled = function () {
  for (var i = 0; i < this.length; i++) {
    var item = $(this[i]);
    if (!$.nodeName(this[i], "#text")) {
      var elm = item.data();
      for (var e in elm.events) {
        item.BindItemEvent(e, 0, function (event) {
          var rtn = true;
          if ($(this).Isdisabled()) {
            event.stopImmediatePropagation();
            rtn = false;
          }
          return rtn;
        });
      }
    }
  }
}

jQuery.fn.BindItemEvent = function (eventName, index, func) {
  var item = this;
  var elm = item.data();
  var tmpEvent = [];
  for (var i = 0; i < elm.events[eventName].length; i++) {
    if (i == index) {
      tmpEvent.push(func);
    }
    tmpEvent.push(elm.events[eventName][i].handler);
  }
  item.unbind(eventName);
  for (var i = 0; i < tmpEvent.length; i++) {
    item.bind(eventName, tmpEvent[i]);
  }
}

jQuery.fn.Isdisabled = function () {
  var dis = $(this).attr("disabled");
  if (true == dis || "disabled" == dis || "true" == dis) {
    return true;
  }

  return false;
}

jQuery.fn.SetItemClass = function (clsName, add) {
  if ($(this).hasClass(clsName) && !add) {
    $(this).removeClass(clsName);
  } else if (!$(this).hasClass(clsName) && add) {
    $(this).addClass(clsName);
  }
}

jQuery.getQueryString = function (name) {
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
  var r = window.location.search.substr(1).match(reg);
  if (r != null)
    return decodeURIComponent(r[2]);
  return null;
}



jQuery.fn.GetData = function () {
  return Binding.GetData(this);
}

jQuery.fn.DataBind = function (data) {
  Binding.DataBind(data, this);
}

jQuery.fn.ListGrid = function () {
  return Binding.GetListGrid(this);
}

jQuery.fn.Grid = function () {
  return Binding.GetGrid(this);
}

jQuery.fn.CreateGrid = function (tableBody, style) {
  var tableList = $("<table class='layui-table' style='width: 100%'></table>");
  var tableHead = $("<thead></thead>");
  var tableContent = $("<tbody></tbody>");
  var title_tr = $("<tr class=\"tr-bg-color\"></tr>");
  var content_tr = $("<tr></tr>");

  var innerStyle = {
    head: {
      tr: "",
      td: ""
    },
    body: {
      tr: "",
      td: ""
    }
  };

  if (style) {
    innerStyle.head.tr = Global.StringFormat("style='{0}'", [style.head.tr]);
    innerStyle.head.td = Global.StringFormat("style='{0}'", [style.head.td]);
    innerStyle.body.tr = Global.StringFormat("style='{0}'", [style.body.tr]);
    innerStyle.body.td = Global.StringFormat("style='{0}'", [style.body.td]);
  }


  tableList.append(tableHead);
  tableList.append(tableContent);
  tableHead.append(title_tr);
  tableContent.append(content_tr);
  // tableList.append(title_tr);
  // tableList.append(content_tr);
  $(this).append(tableList);

  title_tr.attr("style", innerStyle.head.tr);
  content_tr.attr("style", innerStyle.body.tr);

  for (var item in tableBody) {
    title_tr.append(Global.StringFormat("<td {2} sort='{0}'>{1}</td>", [tableBody[item], item, innerStyle.head.td]));
    content_tr.append(Global.StringFormat("<td {1} bind=\"{Name:'{0}',BindType:'innerHTML'}\"></td>", [tableBody[item], innerStyle.body.td]));
  }

  return tableList.Grid();
}

jQuery.fn.CreateGridByItem = function (tableBody, style) {
  var tableList = $("<table class='layui-table' style='width: 100%'></table>");
  var tableHead = $("<thead></thead>");
  var tableContent = $("<tbody></tbody>");
  var title_tr = $("<tr class=\"tr-bg-color\"></tr>");
  var content_tr = $("<tr></tr>");
  var innerStyle = {
    head: {
      tr: "",
      td: ""
    },
    body: {
      tr: "",
      td: ""
    }
  };

  if (style) {
    innerStyle.head.tr = Global.StringFormat("style='{0}'", [style.head.tr]);
    innerStyle.head.td = Global.StringFormat("style='{0}'", [style.head.td]);
    innerStyle.body.tr = Global.StringFormat("style='{0}'", [style.body.tr]);
    innerStyle.body.td = Global.StringFormat("style='{0}'", [style.body.td]);
  }

  tableList.append(tableHead);
  tableList.append(tableContent);
  tableHead.append(title_tr);
  tableContent.append(content_tr);
  // tableList.append(title_tr);
  // tableList.append(content_tr);
  $(this).append(tableList);
  title_tr.attr("style", innerStyle.head.tr);
  content_tr.attr("style", innerStyle.body.tr);
  for (var i = 0; i < tableBody.length; i++) {
    var bodyItem = tableBody[i];
    title_tr.append(Global.StringFormat("<td {3} sort='{0}' colname='{1}'>{2}</td>", [bodyItem.DateKey, bodyItem.ColName, bodyItem.TitleBody, innerStyle.head.td]));
    if (bodyItem.ContentBody) {
      content_tr.append(Global.StringFormat("<td {1}>{0}</td>", [bodyItem.ContentBody, innerStyle.body.td]));
    } else {
      content_tr.append(Global.StringFormat("<td {1} bind=\"{Name:'{0}',BindType:'innerText'}\"></td>", [bodyItem.DateKey, innerStyle.body.td]));
    }
  }

  return tableList.Grid();
}


jQuery.fn.DataClear = function () {
  Binding.Clear(this);
}


jQuery.BindGrid = function (grid, data, isClear) {
  var showpage = grid.AutoPage ? false : grid.ShowPageInfo;
  Binding.BindGrid(grid, data, showpage, isClear);
}

jQuery.fn.SelectBind = function (data) {
  Binding.BindSelect(data, this);
}

jQuery.fn.ChangeClass = function (oldCls, newCls, typeList) {
  var typeVal = {};
  var jqVal = Global.SetJQueryObject(this);
  if (typeList) {
    for (var tp in typeList) {
      typeVal[tp] = true;
    }

    jqVal.FindChildItem(function (childItem) {
      var item = Global.SetJQueryObject(childItem);
      if (typeVal[item.prop("tagName")]) {
        item.ItemChangeClass(oldCls, newCls);
      }
    });
  } else {
    jqVal.ItemChangeClass(oldCls, newCls);
  }

}

jQuery.fn.ItemChangeClass = function (oldCls, newCls) {
  var jqVal = Global.SetJQueryObject(this);
  if (jqVal.hasClass(oldCls)) {
    jqVal.removeClass(oldCls);
  }

  if (!jqVal.hasClass(newCls) && newCls) {
    jqVal.addClass(newCls);
  }
}

jQuery.fn.CheckValidateCollect = function (func) {
  var error = false;
  $.each($("[valid]", this), function (index, item) {
    if (!Binding.CheckValidate(item)) {
      if (!Global.IsNull(func)) {
        if (!func(item)) {
          error = true;
        }
      }
    }
  });

  return error;
}

jQuery.fn.DropDown = function (key, value) {
  var dropDownItem = new ShowDropDown($(this), key, value);
  dropDownItem.DivContainer.css("overflow", "auto");
  dropDownItem.DivContainer.height(100);
  dropDownItem.ShowAll = true;
  dropDownItem.ShowCount = 100;
  dropDownItem.ShowKey = value;

  // if (func) {
  //  dropDownItem.ReadData = function(f) {
  //   f(func());
  //  };
  // }

  return dropDownItem;
}

jQuery.fn.ReadOnly = function (className) {
  var contentVal = $(this);
  $("input", contentVal).attr("placeholder", "");
  $("select", contentVal).attr("placeholder", "");
  // $("a", contentVal).hide();
  $("a", contentVal).css("visibility", "hidden");
  $("button", contentVal).css("visibility", "hidden");
  $("[disable-item]", contentVal).hide();
  // $("input", contentVal).attr("disabled", "disabled");
  // $("select", contentVal).attr("disabled", "disabled");
  contentVal.ItemsDisabled(true);
  if (className) {
    contentVal.SetItemClass(className, true);
  }
}

jQuery.fn.GridAutoBind = function (dataEn, svr, func) {
  var gridVal = $("[bind-item]", $(this));
  var gridList = [];
  $.each(gridVal, function (i, t) {
    var grid = $(t).Grid();
    var svrName = $(t).attr("bind-svr");
    var bindItemName = $(t).attr("bind-item");
    if (func) {
      func(grid);
    }
    grid.Init();
    var gridItem = {
      containerItem: grid,
      serverName: svrName,
      serverContainer: svr,
      bindName: bindItemName,
      refresh: function (dataVal) {
        AjaxCommonSvrByGrid(this.serverName, this.containerItem, dataVal, this.serverContainer);
      }
    };
    gridList.push(gridItem);
    gridItem.refresh(dataEn);
  });

  return gridList;
}

jQuery.fn.ContainerAutoBind = function (dataEn, svr) {
  var bindValItem = $("[bind-item]", $(this));
  var cList = [];
  $.each(bindValItem, function (i, t) {
    var bindItemCon = $(t);
    var svrName = $(this).attr("bind-svr");
    var bindItemName = $(t).attr("bind-item");

    var cItem = {
      containerItem: bindItemCon,
      serverName: svrName,
      serverContainer: svr,
      bindName: bindItemName,
      refresh: function (dataVal) {
        bindItemCon.DataClear();
        AjaxCommonSvrByContainer(this.svrName, this.containerItem, dataVal, this.svrContainer);
      }
    };

    cList.push(cItem);
    cItem.refresh(dataEn);
  });

  return cList;
}
jQuery.fn.DateFormatter = function (date) {
  return new Date(date)
    .toLocaleString("zh-CN", {
      hour12: false
    })
    .replace(/\b\d\b/g, "0\$\&")
    .replace(new RegExp("/", "gm"), "-");
}