/**
 * 作者：虞健超（James.J.Yu） 日期：2010-11-26 简介：包括一个li的Grid实现
 */

function ListGrid(container) {
	var Dom = {};
	var templateContainer = container;
	var rowTemplateContainer;
	var isInit = false;
	var dropItem = null;
	var dropShowItem = null;
	var mousePos = {};
	var cfg = $(container);

	var EditButtonStatus = {
		Save: "Save",
		Edit: "Edit"
	}

	this.DataSource = null;
	this.PageContainer = null;
	this.KeyName = cfg.attr("key") || "";
	this.ForeignkeyName = cfg.attr("foreignKey") || "";
	this.NowPageData = [];
	this.DataArray = [];
	this.HoldArray = [];
	this.AddIndex =  cfg.attr("addIndex") ? eval(cfg.attr("addIndex")) : false;
	this.IndexNum = 0;
	this.AllowRowSelect = cfg.attr("allowSelect") ? eval(cfg.attr("allowSelect")) : false;
	this.RowSelectStyle = cfg.attr("selectStyle") || "";
	this.RowSelectItems = [];
	this.AllowRowMultiSelect = cfg.attr("allowMultiSelect") ? eval(cfg.attr("allowMultiSelect")) : false;
	this.ShowEditButton = cfg.attr("showEditButton") ? eval(cfg.attr("showEditButton")) : false;
	this.AutoBindEditContorl = cfg.attr("autoBindEdit") ? eval(cfg.attr("autoBindEdit")) : false;
	this.DefaultEditContorlStatus = EditButtonStatus.Save;
	this.AllowDrop = cfg.attr("allowDrop") ? eval(cfg.attr("allowDrop")) : false;
	this.MouseoverStyle = cfg.attr("mouseoverStyle") || "";
	this.PageNumberInfo = null;
	this.RowDBClick = eval(cfg.attr("@dbclick"));
	this.RowClick = eval(cfg.attr("@click"));
	this.PreBind = eval(cfg.attr("@preBind"));
	this.AfterBind = eval(cfg.attr("@afterBind"));
	this.filter = eval(cfg.attr("@filter"));
	this.Cells = [];
	// this.PageNumberIndex = 0;

	this.GridContainer = function () {
		return templateContainer;
	}

	this.PageInfo = {
		NowPage: 1,
		PageCount: 0,
		PageSize: 10,
		RowCount: 0,
		SortName: "",
		SortType: "desc"
	}

	var instance = this;

	this.ExecFuncton = function (func, args) {
		var f = eval(func);
		if (f){
            f.apply(this, args);
		}
    }

	this.CreateObject = function (r, d) {
		if (this.IsNull(d)) {
			d = {};
		}
		for (var n in r) {
			d[n] = {};
			if ("function" == typeof r[n]) {
				d[n] = r[n];
			} else if ("object" == typeof r[n]) {
				this.CreateObject(r[n], d[n]);
			} else {
				d[n] = r[n];
			}
		}

		return d;
	}

	this.GetPageInfo = function () {
		return this.PageInfo;
	}

	this.CopyObject = function (r, d) {
		if (this.IsNull(d)) {
			d = {};
		}
		for (var n in r) {
			if ("function" != typeof r[n]) {
				if ("object" == typeof r[n]) {
					if (this.IsNull(d[n])) {
						d[n] = {};
					}
					this.CopyObject(r[n], d[n]);
				} else {
					d[n] = r[n];
				}
			}
		}
	}

	this.SetArrayData = function (data, deleteStatus) {
		var index = this.FindDataRowIndex(data.Key);
		if (!(index < 0)) {
			this.DataArray.splice(index, 1);
		}

		if (!deleteStatus && data.IsChange()) {
			this.DataArray.push(data);
		}
	}

	this.CopyDataStatus = function (data) {
		var dr = this.FindDataRow(data.Key);
		if (!this.IsNull(dr)) {
			data.DataStatus.ValueChange = dr.DataStatus.ValueChange;
			data.DataStatus.Delete = dr.DataStatus.Delete;
			data.DataStatus.Add = dr.DataStatus.Add;
			data.DataStatus.Show = dr.DataStatus.Show;
			data.DataStatus.Select = dr.DataStatus.Select;
		}

		return data;
	}

	this.FindDataRowByRowItem = function (tr, isrow) {
		var item = this.SetJQueryObject(tr);
		if ("DataRow" == item.attr("__InnerType")
			&& !this.IsNull(item.attr("__RowNumber"))) {
			if (isrow) {
				return this.NowPageData[parseInt(item.attr("__RowNumber"))];
			} else {
				return this.NowPageData[parseInt(item.attr("__RowNumber"))].Value;
			}
		}

		return null;
	}

	this.FindRowItem = function (key) {
		var index = this.FindRowItemIndex(key);
		if (!(index < 0)) {
			return this.NowPageData[index];
		}

		return null;
	}

	this.FindRowItemIndex = function (key) {
		for (var i = 0; i < this.NowPageData.length; i++) {
			if (key == this.NowPageData[i].Value.Key) {
				return i;
			}
		}

		return -1;
	}

	this.FindDataRow = function (key) {
		var index = this.FindDataRowIndex(key);
		if (!(index < 0)) {
			return this.DataArray[index];
		}
		return null;
	}

	this.FindRowItemByObject = function (obj) {
		var item = this.SetJQueryObject(obj);
		var parent = this.FindParentRow(item);
		return this.FindDataRowByRowItem(parent, true);
	}

	this.FindDataRowIndex = function (key) {
		for (var i = 0; i < this.DataArray.length; i++) {
			if (key == this.DataArray[i].Key) {
				return i;
			}
		}

		return -1;
	}

	this.FindDataHoldData = function (key) {
		var index = this.FindHoldDataIndex(key);
		if (!(index < 0)) {
			return this.HoldArray[index];
		}
		return null;
	}

	this.FindHoldDataIndex = function (key) {
		for (var i = 0; i < this.HoldArray.length; i++) {
			if (key == this.HoldArray[i].Key) {
				return i;
			}
		}

		return -1;
	}

	this.SetHoldData = function (data, deleteStatus) {
		var index = this.FindHoldDataIndex(data.Key);
		if (!(index < 0)) {
			this.HoldArray.splice(index, 1);
		}

		if (!deleteStatus) {
			this.HoldArray.push(data);
		}
	}

	this.Type2String = function (obj, dataType) {
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

	this.String2Type = function (type, obj, dataType) {
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

	this.ReadObjectValue = function (obj, name, defVal) {
		var lastValItem = this.FindObjectValueByName(obj, name);
		if (!lastValItem.lastVal) {
			lastValItem.lastObj[lastValItem.lastName] = defVal;
		}
		return lastValItem.lastObj[lastValItem.lastName];
	}

	this.WriteObjectValue = function (obj, name, val, defVal) {
		var lastValItem = this.FindObjectValueByName(obj, name);
		lastValItem.lastObj[lastValItem.lastName] = val ? val : defVal;
	}

	this.FindObjectValueByName = function (obj, name) {
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

	this.GetRowData = function (tr, immediate) {
		var row = this.FindDataRowByRowItem(tr);
		if (immediate) {
			this.FindAllItem(tr, function (content) {
				var cont = instance.SetJQueryObject(content);
				if (!instance.IsNull(cont.attr("bind"))) {
					var bind = eval("(" + cont.attr("bind") + ")");
					var type = cont.attr("BindDataType");
					if ("innerHTML" == bind.BindType) {
						var typeVal = instance.String2Type(type, cont.html(), bind["DataType"]);
						instance.WriteObjectValue(row.Data, bind.Name, typeVal);
						// row.Data[bind.Name] = instance.String2Type(type, cont.html(), bind["DataType"]);
					} else if ("innerText" == bind.BindType) {
						var typeVal = instance.String2Type(type, cont.text(), bind["DataType"]);
						instance.WriteObjectValue(row.Data, bind.Name, typeVal);
						// row.Data[bind.Name] = instance.String2Type(type, cont.text(), bind["DataType"]);
					} else if (instance.IsNull(bind.BindType) || "value" == bind.BindType) {
						var typeVal = instance.String2Type(type, cont.val(), bind["DataType"]);
						instance.WriteObjectValue(row.Data, bind.Name, typeVal);
						// row.Data[bind.Name] = instance.String2Type(type, cont.val(), bind["DataType"]);
					} else {
						var typeVal = instance.String2Type(type, cont.attr(bind.BindType), bind["DataType"]);
						instance.WriteObjectValue(row.Data, bind.Name, typeVal);
						// row.Data[bind.Name] = instance.String2Type(type, cont.attr(bind.BindType), bind["DataType"]);
					}
				}
			});
		}

		return row;
	}

	this.IsNull = function (obj, allowNullChar) {
		return undefined == obj || null == obj || {} == obj
			|| (!allowNullChar ? "" === obj : false);
	}

	this.IsJQueryObject = function (obj) {
		return !this.IsNull(obj) && !this.IsNull(obj.jquery);
	}

	this.SetJQueryObject = function (obj) {
		return this.IsJQueryObject(obj) ? obj : $(obj);
	}

	this.RollbackRow = function (tr, rebind) {
		var row = this.FindDataRowByRowItem(tr, true);
		var hold = this.FindDataHoldData(row.Value.Key);
		if (!this.IsNull(hold)) {
			this.CopyObject(hold, row.Value);
		}

		if (rebind) {
			this.ReBindRow(tr, row.Value.Data);
		}
	}

	this.Init = function () {
		isInit = false;
		templateRows = $("li", templateContainer);
		rowTemplateContainer = $(templateRows[0]).clone(true);
		$(templateRows[0]).remove();

		if (this.AutoBindEditContorl) {
			this.BindEditControl();
			this.BindEditControlHandle();
		}

		isInit = true;

		this.DataSource = [];
		this.DataBind();
	}

    this.BindData = function (data) {
        this.DataSource = data;
        this.DataBind();
    }

	this.DataBind = function () {
		if (!isInit) {
			instance.Init();
		}
		instance.NowPageData = [];
		instance.RowSelectItems = [];
		instance.RemoveAll();
		instance.ClearShowStatus();
		var readDataList = instance.GetPageData(true);
		$.each(readDataList, function (index, item) {
			if (instance.PreCreateNewRow(item, index)){
                instance.CreateNewRow(item, index);
			}
		});
	}

	this.PreCreateNewRow = function (item, index) {
		if (this.filter){
			return this.filter(index, item);
		}

		return true;
	}

	this.CreateNewRow = function (item, index) {
		var row = rowTemplateContainer.clone(true);
		// var addData = instance.GetDataKey(item);
		this.PreBindRow(item.Data);
		row.attr("__InnerType", "DataRow");
		row.attr("__RowNumber", index);
		item.DataStatus.Show = true;

		this.ReBindRow(row, item.Data);
		this.AfterBindRow(row, item.Data);

		var itemData = {
			Row: row,
			Value: item,
			SubRow: null,
			ShowSubGrid: false
		};
		this.BindParentRowClick(row);
		this.NowPageData.push(itemData);

		this.BindRowEvent(row);

		templateContainer.append(row);

		this.CompleteBindRow(itemData);

		return row;
	}

	this.setSelectNone = function (unselect) {
		templateContainer.css("moz-user-select", "");
		templateContainer.css("-moz-user-select", "");
		templateContainer.css("-o-user-select", "");
		templateContainer.css("-khtml-user-select", "");
		templateContainer.css("-webkit-user-select", "");
		templateContainer.css("-ms-user-select", "");
		templateContainer.css("user-select", "");

		if (unselect){
			templateContainer.css("moz-user-select", "-moz-none");
			templateContainer.css("-moz-user-select", "none;");
			templateContainer.css("-o-user-select", "none;");
			templateContainer.css("-khtml-user-select", "none;");
			templateContainer.css("-webkit-user-select", "none;");
			templateContainer.css("-ms-user-select", "none;");
			templateContainer.css("user-select", "none;");
		}
	}

	this.DropShow = function (txt) {
		if (dropShowItem){
			dropShowItem.remove();
			dropShowItem = null;
		}
		dropShowItem = $("<span></span>");
		dropShowItem.text(txt);
		dropShowItem.css("position","absolute");

		$("body").append(dropShowItem);
		templateContainer.mousemove(function (e) {
			dropShowItem.css("top", (e.pageY + 2) + "px");
			dropShowItem.css("left", (e.pageX - 30) + "px");
		});
	}

	this.BindRowEvent = function (row) {
		if (this.AllowRowSelect) {
			row.click(this.RowSelectChangeFunc);
		}

		if (!this.IsNull(this.RowDBClick)) {
			row.bind("dblclick", this.RowDBClick);
		}

		if (!this.IsNull(this.RowClick)) {
			row.click(this.RowClick);
		}

		if (this.AllowDrop) {
			row.bind("mousedown", function (e) {
				// $(this).css("-moz-user-select", "none");
				instance.setSelectNone(true);
				this.onselectstart = function () {
					return false
				};
				// debugger
				mousePos = instance.GetMousePosition(e);
				dropItem = instance.FindDataRowByRowItem(this, true);
				instance.DropShow(dropItem.Row.text())
			});

			row.bind("mouseup", function (e) {


				if (!instance.IsNull(dropItem)) {
					var pos = instance.GetMousePosition(e);
					var item = instance.SetJQueryObject(dropItem.Row);
					var itemRow = instance.FindDataRowByRowItem(this, true);
					instance.setSelectNone(false);
					if (dropShowItem){
						dropShowItem.remove();
						dropShowItem = null;
					}
					if (item.hasClass(instance.MouseoverStyle)) {
						item.removeClass(instance.MouseoverStyle);
					}

					if ("SubRow" != $(this).attr("__InnerType")) {
						this.onselectstart = function () {
						};
						$(this).css("-moz-user-select", undefined);

						if (this != item[0]) {
							if (pos.Y > mousePos.Y) {
								if (instance.IsNull(itemRow.SubRow)) {
									item.insertAfter(itemRow.Row);
								} else {
									item.insertAfter(itemRow.SubRow);
									dropItem.SubRow.insertAfter(item);
								}
								instance.ResetPageData();
							} else if (pos.Y < mousePos.Y) {
								if (instance.IsNull(itemRow.SubRow)) {
									item.insertBefore(this);
								} else {
									item.insertBefore(this);
									dropItem.SubRow.insertBefore(this);
								}

								instance.ResetPageData();
							}
						}
					}
					dropItem = null;
				}
			});

			row.bind("mouseover", function () {
				if (!instance.IsNull(dropItem)
					&& "SubRow" != $(this).attr("__InnerType")) {
					$(this).addClass(instance.MouseoverStyle);
				}
			});

			row.bind("mouseout", function (e) {
				$(this).removeClass(instance.MouseoverStyle);
			});
		}
	}

	this.PreBindRow = function (data) {
		if (this.PreBind){
			this.PreBind(data);
		}
	}

	this.AfterBindRow = function (row, data) {
		if (this.AfterBind) {
			this.AfterBind(row, data);
		}
	}

	this.CompleteBindRow = function (dataItem) {
	}

	this.GetMousePosition = function (e) {
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

	this.BindParentRowClick = function (row) {

		row.dblclick(function () {
			var itemRow = instance.FindDataRowByRowItem(this, true);
			if (!instance.IsNull(itemRow.SubRow)) {
				var jItem = instance.SetJQueryObject(itemRow.SubRow)
				jItem.hide();
				itemRow.ShowSubGrid = !itemRow.ShowSubGrid;
				if (itemRow.ShowSubGrid) {
					jItem.show();
				}
			}
		});
	}

	this.ClearShowStatus = function () {
		$.each(this.DataArray, function (index, item) {
			item.DataStatus.Show = false;
		});
	}

	this.Clear = function () {
		this.DataArray = [];
		this.HoldArray = [];
	}

	this.RowSelectChangeFunc = function () {
		if (!instance.RowSelectChange(this)) {
			instance.RowSelect(this);
		}
	}

	this.RowSelectChange = function (tr) {
		return false;
	}

	this.RowSelect = function (tr) {
		tr = this.SetJQueryObject(tr);
		this.PreSelectRow(tr);
		if (!this.AllowRowMultiSelect) {
			$.each(this.RowSelectItems, function (index, item) {
				$(item).removeClass(instance.RowSelectStyle);
			});
			this.RowSelectItems = [];
		}
		tr.addClass(instance.RowSelectStyle);
		this.RowSelectItems.push(tr);

		this.AfterSelectRow(tr);
	}

	this.SelectRow = function (tr) {
		tr = this.SetJQueryObject(tr);
		if (!this.AllowRowMultiSelect) {
			$.each(this.RowSelectItems, function (index, item) {
				$(item).removeClass(instance.RowSelectStyle);
			});
			this.RowSelectItems = [];
		}
		tr.addClass(instance.RowSelectStyle);
		this.RowSelectItems.push(tr);
	}

	this.SelectRowByRowItem = function (row, allowEvnet) {
		var tr = row;
		if (!Global.IsNull(tr)) {
			tr = this.SetJQueryObject(tr);
			if (allowEvnet) {
				this.PreSelectRow(tr);
			}
			this.SelectRow(tr);
			if (allowEvnet) {
				this.AfterSelectRow(tr);
			}
		}
	}

	this.SelectRowByKey = function (key, allowEvnet) {
		var tr = this.FindRowItem(key);
		this.SelectRowByRowItem(tr, allowEvnet);
	}

	this.SelectRowByRowNum = function (index, allowEvnet) {
		if (!Global.IsNull(index) && index >= 0) {
			var tr = this.NowPageData[index].Row;
			this.SelectRowByRowItem(tr, allowEvnet);
		}
	}

	this.ClearSelect = function () {
		$.each(instance.RowSelectItems, function (index, item) {
			$(item).removeClass(instance.RowSelectStyle);
		});
		instance.RowSelectItems = [];
	}

	this.PreSelectRow = function (tr) {
	}

	this.AfterSelectRow = function (tr) {
	}

	this.SetCheckBoxValue = function (item) {
		var checkbox = this.SetJQueryObject(item);
		if (checkbox.attr("selectvalue") && "checkbox" == checkbox.attr("type").toLowerCase()) {
			var selectvalue = eval("(" + checkbox.attr("selectvalue") + ")");
			checkbox[0].checked = selectvalue.Yes == checkbox.val();
		}
	}

	this.PreBindCol = function (item, data) {
		var click = eval(item.attr("@click"));
        var blur = eval(item.attr("@blur"));
        var change = eval(item.attr("@change"));
		if (click){
            item.click(function () {
            	var f = eval($(this).attr("@click"));
                var tr = instance.FindRowItemByObject(this);
            	f.apply(this, [tr]);
            });
		}

		if (blur){
            item.blur(function () {
                var f = eval($(this).attr("@blur"));
                var tr = instance.FindRowItemByObject(this);
                f.apply(this, [tr]);
            })
		}

		if (change) {
            item.change(function () {
                var f = eval($(this).attr("@change"));
                var tr = instance.FindRowItemByObject(this);
                f.apply(this, [tr]);
            })
		}
	}

	this.CompleteBindCol = function (item, data) {
		var cont = instance.SetJQueryObject(item);
		if (cont.attr("@binding")) {
			var f = eval(cont.attr("@binding"));
			f.apply(cont[0], [data]);
		}
	}

	this.PreBindItemCol = function (item, bind, data) {
	}

	this.CompleteBindItemCol = function (item, bind, data, value) {
	}

	this.ReBindRow = function (row, item) {
		instance.FindAllItem(row, function (content) {
			var cont = instance.SetJQueryObject(content);
			instance.PreBindCol(cont, item);
			if (!instance.IsNull(cont.attr("bind"))) {
				var bind = eval("(" + cont.attr("bind") + ")");
				instance.PreBindItemCol(cont, bind, item);
				cont.attr("BindDataType", typeof item[bind.Name]);
				var readBindVal = instance.ReadObjectValue(item, bind.Name, "");
				var bindValueItemStr = instance.Type2String(readBindVal, bind.DataType);
				if ("innerHTML" == bind.BindType) {
					cont.html(bindValueItemStr);
				} else if ("innerText" == bind.BindType) {
					cont.text(bindValueItemStr);
				} else if (instance.IsNull(bind.BindType)
					|| "value" == bind.BindType) {
					cont.val(bindValueItemStr);
					instance.SetCheckBoxValue(cont);
				} else {
					cont.attr(bind.BindType, bindValueItemStr);
				}

				instance.CompleteBindItemCol(cont, bind, item, bindValueItemStr);
			}
			instance.CompleteBindCol(cont, item);
		});

		this.SetCellStatus(row);
	}

	this.SetCellStatus = function (row) {
		$.each(this.Cells, function (index, item) {
			if (item.Hide) {
				$(row[0].cells[item.Index]).hide();
			} else {
				$(row[0].cells[item.Index]).show();
			}
		});
	}

	this.SetCellHideByName = function (name, hideStatus) {
		for (var i = 0; i < this.Cells.length; i++) {
			if (name == this.Cells[i].Name) {
				this.SetCellHide(i, hideStatus);
				return;
			}
		}
	}

	this.SetCellHide = function (index, hideStatus) {
		this.Cells[index].Hide = hideStatus;
		if (hideStatus) {
			$(this.Cells[index].Cell).hide();
		} else {
			$(this.Cells[index].Cell).show();
		}
	}

	this.FindParentRow = function (obj) {
		var item = instance.SetJQueryObject(obj);
		if ("DataRow" == item.attr("__InnerType")) {
			return item[0];
		}

		var parent = item.parents();
		for (var i = 0; i < parent.length; i++) {
			if ("DataRow" == $(parent[i]).attr("__InnerType")) {
				return parent[i];
			}
		}

		return null;
	}

	this.RemoveAll = function () {
		templateContainer.empty();
	}

	this.GetPageData = function (status) {
		var data = [];
		$.each(this.DataSource, function (index, item) {
			var innerData = instance.GetInnerData(item, status);
			if (!instance.IsNull(innerData)) {
				data.push(innerData);
			}
		});
		return data;
	}

	this.GetInnerData = function (dataSoruce, status) {
		var innerData = this.GetDataKey(dataSoruce);
		if (status) {
			var findData = this.FindDataRow(innerData.Key);
			if (!this.IsNull(findData)) {
				if (findData.DataStatus.Delete) {
					return null;
				}
				innerData = findData;
			}
		}
		return innerData;
	}

	this.GetLength = function () {
		var count = 0;
		$.each(instance.DataArray, function (index, item) {
			if (item.DataStatus.Delete) {
				count++;
			}
		});

		return this.DataSource.length - count;
	}

	this.RemoveRow = function (num) {
		this.NowPageData[num].Row.remove();
		if (!this.IsNull(this.NowPageData[num].SubRow)) {
			this.NowPageData[num].SubRow.remove();
		}
		this.SetDeleteStatus(this.NowPageData[num].Row);
		this.NowPageData.splice(num, 1);
		// this.NowPageData[num].Value.DataStatus.Delete = true;
		// this.NowPageData[num].Show = false;
	}

	this.RemoveRowByRowItem = function (tr) {
		var item = this.FindDataRowByRowItem(tr);
		if (!this.IsNull(item)) {
			this.RemoveDataByKey(item.Key, true);
		}

		this.RestRowNumber();
	}

	this.RemoveData = function (num, deleteRow) {
		this.DataSource.splice(num, 1);
		if (deleteRow && this.DataArray[num].DataStatus.Show) {
			this.RemoveRow(num);
		}
		this.DataArray[num].DataStatus.Delete = true;
	}

	this.RemoveDataByKey = function (key, deleteRow) {
		var index = this.FindRowItemIndex(key);
		if (!(index < 0)) {
			this.RemoveRow(index);
		}
	}

	this.GetDataKey = function (data) {
		return {
			Key: this.SetDataKey(data),
			Data: data,
			EditStatus: instance.DefaultEditContorlStatus,
			DataStatus: {
				ValueChange: false,
				Delete: false,
				Add: false,
				Show: false,
				Select: false
			},
			GetCheckBox: function () {
			},
			IsChange: function () {
				return this.DataStatus.ValueChange || this.DataStatus.Delete
					|| this.DataStatus.Add || this.DataStatus.Select;
			},
			GetEditButton: function () {
			},
			GetSubRow: function () {
				return instance.FindRowItem(this.Key).SubRow;
			}
		};
	}

	this.FindAllItem = function (obj, func) {
		var items = this.SetJQueryObject(obj).contents();
		for (var i = 0; i < items.length; i++) {
			if (this.FindAllItem(items[i], func) || func(items[i])) {
				return true;
			}
		}
	}

	this.SetDataKey = function (data) {
		var name = this.BindDataKey(data);
		return name;
	}

	this.BindDataKey = function (data) {
		if (this.AddIndex) {
			return this.IndexNum++;
		} else {
			if (this.KeyName.length > 0) {
				return data[this.KeyName];
			}
			for (var n in data) {
				this.KeyName = n;
				return data[n];
			}
		}
	}

	this.SetRowSelectStatus = function (data, status, immediate) {
		data.DataStatus.Select = status;
		if (immediate) {
			var ck = data.GetCheckBox();
			if (!instance.IsNull(ck)) {
				ck.checked = data.DataStatus.Select;
			}
		}

		this.SetArrayData(data);
	}

	this.SetPageNumberInfo = function () {
		$.each(this.PageNumberInfo, function (index, items) {
			instance.SetPageNumberControl(items);
			instance.FindAllItem(items, function (obj) {
				instance.SetPageNumberControl(obj);
			});
		});
	}

	this.SetPageNumberControl = function (obj) {
		var item = this.SetJQueryObject(obj);
		if ("NowPage" == item.attr("__InnerType")) {
			item.text(this.PageInfo.NowPage + "");
		} else if ("PageCount" == item.attr("__InnerType")) {
			item.text(this.PageInfo.PageCount + "");
		} else if ("PageSize" == item.attr("__InnerType")) {
			item.text(this.PageInfo.PageSize + "");
		}
	}

	this.GetValueList = function (status, isData) {
		var list = [];
		$.each(this.DataArray, function (index, item) {
			if (item.DataStatus[status]) {
				if (isData) {
					list.push(item.Data);
				} else {
					list.push(item);
				}
			}
		});

		return list;
	}

	this.GetAddList = function (isData) {
		return this.GetValueList("Add", isData);
	}

	this.GetDeleteList = function (isData) {
		return this.GetValueList("Delete", isData);
	}

	this.GetValueChangeList = function (isData) {
		return this.GetValueList("ValueChange", isData);
	}

	this.GetShowList = function () {
		var list = [];
		$.each(this.NowPageData, function (index, item) {
			list.push(item.Value.Data);
		});
		return list;
	}

	this.GetActualShowList = function () {
		var list = [];
		$.each(templateContainer[0].childNodes, function (i, it) {
			list.push($(it).GetData());
		});

		return list;
	}

	this.HasItem = function (status) {
		for (var i = 0; i < this.DataArray.length; i++) {
			if (this.DataArray[i].DataStatus[status]) {
				return true;
			}
		}

		return false;
	}

	this.HasCheckBoxSelect = function () {
		return this.HasItem("Select");
	}

	this.HasDelete = function () {
		return this.HasItem("Delete");
	}

	this.HasAdd = function () {
		return this.HasItem("Add");
	}

	this.HasValueChange = function () {
		return this.HasItem("ValueChange");
	}

	this.BindEditControl = function (row) {
		if (this.IsNull(row)) {
			row = rowTemplateContainer;
		}
		this.FindAllItem(row, function (item) {
			if (!instance.IsNull(item.tagName)) {
				var tagName = item.tagName.toUpperCase();
				if ("INPUT" == tagName || "SELECT" == tagName
					|| "TEXTAREA" == tagName) {
					if (instance.IsNull($(item).attr("__InnerType"))) {
						$(item).attr("__EditItem", "EditItem");
					}
				}
			}
		});
	}

	this.BindEditControlHandle = function (row) {
		if (this.IsNull(row)) {
			row = rowTemplateContainer;
		}
		this.FindAllItem(row, function (item) {
			if (!instance.IsNull(item.tagName)) {
				var tagName = item.tagName.toUpperCase();
				var jqItem = instance.SetJQueryObject(item);
				if ("EditItem" == jqItem.attr("__EditItem")) {
					if ("INPUT" == tagName) {
						var type = item.type.toLowerCase();
						if ("text" == type) {
							jqItem.blur(instance.RowValueChangeFunc);
						} else {
							jqItem.click(instance.RowValueChangeFunc);
						}
					} else if ("SELECT" == tagName) {
						jqItem.change(instance.RowValueChangeFunc);
					} else if ("TEXTAREA" == tagName) {
						jqItem.blur(instance.RowValueChangeFunc);
					}
				}
			}
		});
	}

	this.RowValueChangeFunc = function () {
		instance.SetCheckBoxStatusValue(this);
		var row = instance.FindRowItemByObject(this);
		if (instance.PreRowValueChange(row)) {
			row.Value.DataStatus.ValueChange = true;
			instance.GetRowData(row.Row, true);
			instance.RowValueChange(this, row);
			instance.SetArrayData(row.Value);
		}
	}

	this.PreRowValueChange = function (row) {
		return true;
	}

	this.SetRowChange = function (item, status, value) {
		var row = this.FindRowItemByObject(item);
		if (this.IsNull(row)) {
			return;
		}

		if (this.IsNull(value)) {
			row.Value.DataStatus[status] = !row.Value.DataStatus[status];
		} else {
			row.Value.DataStatus[status] = value;
		}

		this.RowValueChange(item, row);
		this.SetArrayData(row.Value);
	}

	this.SetDeleteStatus = function (tr) {
		this.SetRowChange(tr, "Delete", true);
	}

	this.SetAddStatus = function (tr) {
		this.SetRowChange(tr, "Add", true);
	}

	this.SetDataChange = function (tr, data) {
		var row = this.FindDataRowByRowItem(tr, true);
		this.CopyObject(data, row.Value.Data);
		this.ReBindRow(tr, row.Value.Data);
		this.SetChangeStatus(tr);
		// this.ResetPageData();
	}

	this.SetChangeStatus = function (tr) {
		this.SetRowChange(tr, "ValueChange", true);
	}

	this.SetCheckBoxStatusValue = function (item) {
		var checkbox = this.SetJQueryObject(item);
		if (checkbox.attr("selectvalue") && "checkbox" == checkbox.attr("type").toLowerCase()) {
			var selectvalue = eval("(" + checkbox.attr("selectvalue") + ")");
			checkbox
				.val(checkbox[0].checked ? selectvalue.Yes : selectvalue.No);
		}
	}

	this.RowValueChange = function (item, data) {
	}

	this.SetDataEditContorl = function (tr) {
		var row = this.FindDataRowByRowItem(tr, true);
		this
			.FindAllItem(
				row.Row,
				function (item) {
					var jQueryObj = instance.SetJQueryObject(item);
					if ("EditItem" == jQueryObj.attr("__EditItem")) {
						jQueryObj
							.attr(
								"disabled",
								EditButtonStatus.Edit == row.Value.EditStatus ? "disabled"
									: "");
					}
				});
	}

	this.SetForeignKey = function (data) {
		if (this.ForeignkeyName.length > 0) {
			return data[this.ForeignkeyName];
		}

		for (var n in data) {
			this.ForeignkeyName = n;
			return data[n];
		}
	}

	this.Clone = function () {
		var grid = new Grid(templateContainer.clone(true));
		this.CopyObject(this, grid);
		// grid.Init();
		return grid;
	}

	this.GetTable = function (id) {
		templateContainer.id = id;
		return templateContainer;
	}

	this.HideTable = function (show) {
		if (show) {
			templateContainer.show();
		} else {
			templateContainer.hide();
		}
	}

	this.Rows = function () {
		var rows = [];
		$.each(templateContainer[0].childNodes, function (index, item) {
			if ("DataRow" == $(item).attr("__InnerType"))
				rows.push(item);
		});

		return rows;
	}

	this.ResetPageData = function () {
		var pageDate = [];
		var i = 0;
		$.each(templateContainer[0].childNodes, function (index, item) {
			if ("DataRow" == $(item).attr("__InnerType")) {
				pageDate.push(instance.FindDataRowByRowItem(item, true));
				$(item).attr("__RowNumber", i++);
			}
		});

		this.NowPageData = pageDate;
	}

	this.RestRowNumber = function () {
		var i = 0;
		var liList = $("[__InnerType='DataRow']", templateContainer);
		$.each(liList, function (index, item) {
			$(item).attr("__RowNumber", i++);
		});
	}

	this.InsertRow = function (data) {
		var item = this.GetDataKey(data);
		var row = this.CreateNewRow(item, 0);
		this.RestRowNumber();
		this.SetAddStatus(row);

		return row;
	}
}
