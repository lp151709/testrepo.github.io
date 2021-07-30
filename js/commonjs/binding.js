/**
 * 作者：虞健超（James.J.Yu） 日期：2010-11-26 简介：包括调用公共方法实现
 */


Binding = {};

Binding.GetGrid = function (content) {
  var grid = new Grid(content);
  grid.Resources.Pre = "上一页";
  grid.Resources.Next = "下一页";
  grid.Resources.First = "首页";
  grid.Resources.Last = "尾页";

  grid.Resources.Edit = "<lable class='normalText'>编辑</lable>";
  grid.Resources.Cancel = "<lable class='normalText'>取消</lable>";
  grid.Resources.Delete = "<lable class='normalText'>删除</lable>";
  grid.Resources.Save = "<lable class='normalText'>保存</lable>";

  // grid.RowSelectStyle = "trcheched";
  // grid.MouseoverStyle = "gridmoveover";
  //
  // grid.AutoPage = false;
  // grid.ShowPageInfo = false;
  // grid.AllowRowSelect = true;
  // grid.Sort = false;
  // grid.AddIndex = true;
  //
  // grid.OddStyle = "odd";
  // grid.EvenStyle = "even";

  grid.GetPageInfo = function () {
    var page = {
      nowPage: this.PageInfo.NowPage,
      pageCount: this.PageInfo.PageCount,
      pageSize: this.PageInfo.PageSize,
      rowCount: this.PageInfo.RowCount,
      sortName: this.PageInfo.SortName,
      sortType: this.PageInfo.SortType
    };

    return page;
  };

  return grid;
}

Binding.GetListGrid = function (content) {
  var grid = new ListGrid(content);
  return grid;
}

Binding.BindGrid = function (grid, data, isPage, isClear) {

  if (isClear) {
    grid.Clear();
  }

  grid.DataSource = data.body;
  grid.DataBind();
}

Binding.GetWindowShowSize = function () {
  var x = 0;
  var y = 0;
  var left = 0;
  var top = 0

  if (window.top == window.self) {
    x = document.documentElement.clientWidth;
    y = document.documentElement.clientHeight;
    l = $("body").scrollLeft();
    t = $("body").scrollTop();

    return {
      width: x,
      height: y,
      left: 0,
      top: 0
    };
  } else {
    x = window.top.document.documentElement.clientWidth;
    y = window.top.document.documentElement.clientHeight;
    l = $(window.top.document).scrollLeft();
    t = $(window.top.document).scrollTop();

    return {
      width: x,
      height: y,
      left: l,
      top: t
    };
  }

}

Binding.CreateQueryEntity = function (data, grid) {
  if (!grid) {
    return Binding.CreateEntity(data);
  }
  return {
    Login: Binding.LoginEntity(),
    PageInfo: grid.PageInfo,
    Body: data
  };
}

Binding.Clear = function (content) {
  if (Global.IsNull(content)) {
    content = document;
  }

  content = Global.SetJQueryObject(content);

  $.each($("[bind]", content), function (index, item) {
    var bind = eval("(" + $(item).attr("bind") + ")");
    var type = $(item).attr("BindDataType");
    if ("innerHTML" == bind.BindType) {
      $(item).empty();
    } else if ("innerText" == bind.BindType) {
      $(item).empty();
    } else if (Global.IsNull(bind.BindType) || "value" == bind.BindType) {
      $(item).val("");
    } else {
      $(item).attr(bind.BindType, "");
    }

    if (!Global.IsNull(item["value"], true)) {
      item.value = "";
    }
  });
}

Binding.BindCheckBox = function (container) {
  if (Global.IsNull(container)) {
    container = document;
  }

  $.each(
      $("input[type=checkbox]", Global.SetJQueryObject(container)),
      function (index, item) {
        var checkbox = Global.SetJQueryObject(item);
        if (!Global.IsNull(checkbox.attr("selectvalue"))) {
          var selectvalue = eval("(" +
            checkbox.attr("selectvalue") + ")");
          if ((selectvalue.Yes == checkbox.val() && !checkbox[0].checked) ||
            (selectvalue.No == checkbox.val() && checkbox[0].checked)) {
            checkbox.click();
          }

          checkbox[0].checked = selectvalue.Yes == checkbox.val();
          checkbox.change(function () {
            var checkboxItem = $(this);
            if (!Global.IsNull(checkboxItem.attr("selectvalue"))) {
              var selectvalue = eval("(" + checkbox.attr("selectvalue") + ")");
              checkboxItem.val(checkbox[0].checked ? selectvalue.Yes : selectvalue.No);
            }
          });
        }
      });
}


Binding.DataBind = function (data, content) {
  if (Global.IsNull(content)) {
    content = document;
  }

  content = Global.SetJQueryObject(content);

  $.each(
    $("[bind]", content),
    function (index, item) {
      var bind = eval("(" + $(item).attr("bind") + ")");
      var findValItem = Binding.ReadObjectValue(data, bind.Name, "");
      var bindValue = Global.Type2String(findValItem, bind.DataType);
      $(item).attr("BindDataType", typeof bindValue);
      if ("innerHTML" == bind.BindType) {
        $(item).html(bindValue);
      } else if ("innerText" == bind.BindType) {
        $(item).text(bindValue);
      } else if ("radio" == bind.BindType) {
        var radioItems;
        if (Global.IsNull(bind.InputName)) {
          radioItems = $("input[type='radio']", $(item));
        } else {
          radioItems = $(Global.StringFormat("input[name='{0}']", [bind.InputName]), $(item));
        }

        $.each(radioItems, function (rdIndex, rdItem) {
          rdItem.checked = false;
          if (bindValue == rdItem.value) {
            rdItem.checked = true;
          }
        });
      } else if ("checkbox" == bind.BindType) {
        var radioItems;
        if (Global.IsNull(bind.InputName)) {
          radioItems = $("input[type='checkbox']", $(item));
        } else {
          radioItems = $(Global.StringFormat("input[name='{0}']", [bind.InputName]), $(item));
        }

        $.each(
          radioItems,
          function (rdIndex, rdItem) {
            rdItem.checked = false;
            if (bindValue instanceof Array) {
              for (var valueIndex = 0; valueIndex < bindValue.length; valueIndex++) {
                if (bindValue[valueIndex] == rdItem.value) {
                  rdItem.checked = true;
                }
              }
            } else {
              if (bindValue == rdItem.value) {
                rdItem.checked = true;
              }
            }
          });
      } else if (Global.IsNull(bind.BindType) ||
        "value" == bind.BindType) {
        $(item).val(bindValue);
      } else {
        $(item).attr(bind.BindType, bindValue);
      }

      if ("textarea" == item.tagName.toLowerCase() &&
        !Global.IsNull(item["value"], true)) {
        item.value = bindValue;
      }
    });

  Binding.BindCheckBox(content);
}

Binding.GetData = function (content) {
  if (Global.IsNull(content)) {
    content = document;
  }

  content = Global.SetJQueryObject(content);

  var data = {};
  $.each($("[bind]", content), function (index, item) {
    var bind = eval("(" + $(item).attr("bind") + ")");
    var type = $(item).attr("BindDataType");
    if ("innerHTML" == bind.BindType) {
      var typeVal = Global.String2Type(type, $(item).html(), bind["DataType"]);
      Binding.WriteObjectValue(data, bind.Name, typeVal, null);
      // data[bind.Name] = Global.String2Type(type, $(item).html(),
      // 	bind["DataType"]);
    } else if ("innerText" == bind.BindType) {
      var typeVal = Global.String2Type(type, $(item).text(), bind["DataType"]);
      Binding.WriteObjectValue(data, bind.Name, typeVal, null);
      // data[bind.Name] = Global.String2Type(type, $(item).text(),
      // 	bind["DataType"]);
    } else if ("radio" == bind.BindType) {
      var radioItems;
      if (Global.IsNull(bind.InputName)) {
        radioItems = $("input[type='radio']", $(item));
      } else {
        radioItems = $(Global.StringFormat("input[name='{0}']",
          [bind.InputName]), $(item));
      }

      for (var i = 0; i < radioItems.length; i++) {
        if (radioItems[i].checked) {
          Binding.WriteObjectValue(data, bind.Name, radioItems[i].value, null);
          // data[bind.Name] = radioItems[i].value;
          break;
        }
      }
    } else if ("checkbox" == bind.BindType) {
      var checkboxItems;
      if (Global.IsNull(bind.InputName)) {
        checkboxItems = $("input[type='checkbox']", $(item));
      } else {
        checkboxItems = $(Global.StringFormat("input[name='{0}']", [bind.InputName]), $(item));
      }

      for (var i = 0; i < checkboxItems.length; i++) {
        if ("array" == bind.DataType) {
          if (checkboxItems[i].checked) {
            // if (data[bind.Name]) {
            // 	data[bind.Name] = [];
            // }
            var findValItem = Binding.ReadObjectValue(data, bind.Name, []);
            findValItem.push(checkboxItems[i].value);
          }
        } else {
          if (checkboxItems[i].checked) {
            Binding.WriteObjectValue(data, bind.Name, checkboxItems[i].value, null);
            // data[bind.Name] = checkboxItems[i].value;
            break;
          }
        }
      }
    } else if (Global.IsNull(bind.BindType) || "value" == bind.BindType) {
      var typeVal = Global.String2Type(type, $(item).val(), bind["DataType"]);
      Binding.WriteObjectValue(data, bind.Name, typeVal, null);

    } else {
      var typeVal = Global.String2Type(type, $(item).attr(bind.BindType), bind["DataType"]);
      Binding.WriteObjectValue(data, bind.Name, typeVal, null);
    }

    if ("textarea" == item.tagName.toLowerCase() &&
      !Global.IsNull(item["value"], true)) {
      Binding.WriteObjectValue(data, bind.Name, item.value, null);
    }
  });

  return data;
}

Binding.ReadObjectValue = function (obj, name, defVal) {
  var lastValItem = Binding.FindObjectValueByName(obj, name);
  if (!lastValItem.lastVal) {
    lastValItem.lastObj[lastValItem.lastName] = defVal;
  }
  return lastValItem.lastObj[lastValItem.lastName];
}

Binding.WriteObjectValue = function (obj, name, val, defVal) {
  var lastValItem = Binding.FindObjectValueByName(obj, name);
  lastValItem.lastObj[lastValItem.lastName] = val ? val : defVal;
}

Binding.FindObjectValueByName = function (obj, name) {
  var objVal = name.split(".");
  var lName = null;
  var lVal = obj;
  for (var i = 0; i < objVal.length; i++) {
    lName = objVal[i];
    if (i > 0) {
      if (!lVal[objVal[i - 1]]) {
        lVal[objVal[i - 1]] = {};
      }
      lVal = lVal[objVal[i - 1]];
    }
  }

  return {
    lastObj: lVal,
    lastName: lName,
    lastVal: lVal[lName]
  };
}

Binding.Type2String = function (obj, dataType) {
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

Binding.String2Type = function (type, obj, dataType) {
  var dtype = null;
  if (!this.IsNull(dataType)) {
    dtype = dataType.toLowerCase();
    if ("int" == dtype || "float" == dtype || "decimal" == dtype ||
      "double" == dtype || "number" == type) {
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

Binding.BindSelect = function (data, item) {
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

Binding.ValidateControlBindByName = function (cName) {
  //
  if (cName) {
    Binding.ValidateControlBind($("#" + cName));
  }
}

Binding.ValidateControlBind = function (cItem) {
  $.each($("[error]", cItem), function (index, errorItem) {
    if ($(errorItem).attr("error") == "img") {
      $(errorItem).remove();
    }
  });
  $("[validate]", cItem).click(function (e) {
    var ckStatus = true;
    var ckItem = $(this).attr("validate");
    $.each($("[error]", cItem), function (index, errorItem) {
      if ($(errorItem).attr("error") == "error") {
        $(errorItem).remove();
      }
    });
    $("#" + ckItem, cItem).CheckValidateCollect(function (item) {
      //$(item).after("<img error='error' src='../img/error.png' style='display:inline;position: absolute;right: -20px;top: 12px;' />");
      var txt = $(item).attr("valid-message") ? $(item).attr("valid-message") : "输入错误";
      var errorItem = $(Global.StringFormat("<lable error='error' style='display:inline;top: -20px;color: red;position:absolute;'>{0}</lable>", [txt]));
      $(item).after(errorItem);
      // errorItem.css("right", (errorItem.width() + 10) * -1);
      errorItem.css("right", 0);
      ckStatus = false;
    });

    if (!ckStatus) {
      e.stopImmediatePropagation();
      return false;
    }
  });
}

Binding.CheckValidate = function (item) {
  var intV = /^(-|\+)?\d+$/;
  var numV = /^\d+\.{0,1}\d+$/;
  var mobile = /^1[34578]\d{9}$/;
  var email = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/;
  var v = $(item).attr("valid").split("-");
  var itemVal = null;
  if (Global.IsNull(item["value"], true)) {
    itemVal = $(item).text();
  } else {
    itemVal = $(item).val();
  }

  for (var i = 0; i < v.length; i++) {
    var vType = v[i].split(":");
    switch (vType[0]) {
      case "INT":
        if (!intV.test(itemVal)) {
          return false;
        }
        break;
      case "NUM":
        if (isNaN(Number(itemVal))) {
          return false;
        }
        break;
      case "MOB":
        if (!mobile.test(itemVal)) {
          return false;
        }
        break;
      case 'EML':
        if (!email.test(itemVal)) {
          return false;
        }
        break;
      case 'CER':
        if (!identityCodeValidator(itemVal)) {
          return false;
        }
        break;
      case "MAXLEN":
        if (vType.length > 1 && itemVal.length > vType[1]) {
          return false;
        }
        break;
      case "MINLEN":
        if (vType.length > 1 && itemVal.length < vType[1]) {
          return false;
        }
        break;
      case "MAX":
        if (vType.length > 1 && Number(itemVal) > Number(vType[1])) {
          return false;
        }
        break;
      case "MIN":
        if (vType.length > 1 && Number(itemVal) < Number(vType[1])) {
          return false;
        }
        break;
      case "EMP":
        if (Global.IsNull(itemVal)) {
          return false;
        }
        break;
      case "DEF":
        if (Global.IsNull(itemVal)) {
          $(item).val(vType[1]);
        }
        break;
      case "OTH":
        return eval(vType[1] + "();");
    }
  }

  return true;
}

function identityCodeValidator(code) {
  code ? code.toUpperCase() : '';
  let city = {
    11: '北京',
    12: '天津',
    13: '河北',
    14: '山西',
    15: '内蒙古',
    21: '辽宁',
    22: '吉林',
    23: '黑龙江 ',
    31: '上海',
    32: '江苏',
    33: '浙江',
    34: '安徽',
    35: '福建',
    36: '江西',
    37: '山东',
    41: '河南',
    42: '湖北 ',
    43: '湖南',
    44: '广东',
    45: '广西',
    46: '海南',
    50: '重庆',
    51: '四川',
    52: '贵州',
    53: '云南',
    54: '西藏 ',
    61: '陕西',
    62: '甘肃',
    63: '青海',
    64: '宁夏',
    65: '新疆',
    71: '台湾',
    81: '香港',
    82: '澳门',
    91: '国外'
  };
  let pass = true;
  let Y, JYM;
  let S, M;
  let idCardArray = [];
  if (code !== undefined) {
    idCardArray = code.split('');
    if (city[parseInt(code.substr(0, 2))] == null) {
      pass = false;
    }
    let ereg = new RegExp();
    let eregNow = new RegExp();
    switch (code.length) {
      case 15:
        if (
          (parseInt(code.substr(6, 2)) + 1900) % 4 === 0 ||
          ((parseInt(code.substr(6, 2)) + 1900) % 100 === 0 &&
            (parseInt(code.substr(6, 2)) + 1900) % 4 === 0)
        ) {
          ereg = /^[1-9][0-9]{5}[0-9]{2}((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|[1-2][0-9]))[0-9]{3}$/; // 测试出生日期的合法性
        } else {
          ereg = /^[1-9][0-9]{5}[0-9]{2}((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|1[0-9]|2[0-8]))[0-9]{3}$/; // 测试出生日期的合法性
        }
        if (ereg.test(code)) {
          pass = true;
        } else {
          pass = false;
        }
        break;
      case 18:
        if (
          parseInt(code.substr(6, 4)) % 4 === 0 ||
          (parseInt(code.substr(6, 4)) % 100 === 0 &&
            parseInt(code.substr(6, 4)) % 4 === 0)
        ) {
          ereg = /^[1-9][0-9]{5}19[0-9]{2}((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|[1-2][0-9]))[0-9]{3}[0-9Xx]$/; // 闰年出生日期的合法性正则表达式
          eregNow = /^[1-9][0-9]{5}20[0-9]{2}((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|[1-2][0-9]))[0-9]{3}[0-9Xx]$/; // 闰年出生日期的合法性正则表达式
        } else {
          ereg = /^[1-9][0-9]{5}19[0-9]{2}((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|1[0-9]|2[0-8]))[0-9]{3}[0-9Xx]$/; // 平年出生日期的合法性正则表达式
          eregNow = /^[1-9][0-9]{5}20[0-9]{2}((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|1[0-9]|2[0-8]))[0-9]{3}[0-9Xx]$/; // 平年出生日期的合法性正则表达式
        }
        if (ereg.test(code) || eregNow.test(code)) {
          S =
            (parseInt(idCardArray[0]) + parseInt(idCardArray[10])) * 7 +
            (parseInt(idCardArray[1]) + parseInt(idCardArray[11])) * 9 +
            (parseInt(idCardArray[2]) + parseInt(idCardArray[12])) * 10 +
            (parseInt(idCardArray[3]) + parseInt(idCardArray[13])) * 5 +
            (parseInt(idCardArray[4]) + parseInt(idCardArray[14])) * 8 +
            (parseInt(idCardArray[5]) + parseInt(idCardArray[15])) * 4 +
            (parseInt(idCardArray[6]) + parseInt(idCardArray[16])) * 2 +
            parseInt(idCardArray[7]) * 1 +
            parseInt(idCardArray[8]) * 6 +
            parseInt(idCardArray[9]) * 3;
          Y = S % 11;
          M = 'F';
          JYM = '10X98765432';
          M = JYM.substr(Y, 1);
          if (M === idCardArray[17]) {
            pass = true;
          } else {
            pass = false;
          }
        } else {
          pass = false;
        }
        break;
      default:
        pass = false;
        break;
    }
  }
  return pass;
}
