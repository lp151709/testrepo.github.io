/**
 * 作者：虞健超（James.J.Yu） 日期：2010-11-26 简介：包括一个Grid实现
 */

function Grid(container) {
	var Dom = {};
	var templateContainer = container;
	var templateValues = $("tbody", container);
	var rowTemplateContainer;
	var isInit = false;
	var dropItem = null;
	var dropShowItem = null;
	var mousePos = {};
	var subScroll = true;
    var cfg = $(container);

	var EditButtonStatus = {
		Save: "Save",
		Edit: "Edit"
	}

	this.Resources = {
		Pre: "Pre",
		Next: "Next",
		First: "First",
		Last: "Last",
		Edit: "Edit",
		Cancel: "Cancel",
		Delete: "Delete",
		Save: "Save"
	};

	this.DataSource = null;
	this.PageContainer = null;
	this.PrePage = null;
	this.NextPage = null;
	this.FirstPage = null;
	this.LastPage = null;
	this.AutoPage = cfg.attr("autoPage") ? eval(cfg.attr("autoPage")) : false;
	this.ShowPageInfo = cfg.attr("showPage") ? eval(cfg.attr("showPage")) : false;
	this.ShowTitle = cfg.attr("showTitle") ? eval(cfg.attr("showTitle")) : true;
	this.KeyName = cfg.attr("key") || "";
	this.ForeignkeyName = cfg.attr("foreignKey") || "";
	this.NowPageData = [];
	this.DataArray = [];
	this.HoldArray = [];
	this.AddIndex = cfg.attr("addIndex") ? eval(cfg.attr("addIndex")) : false;
	this.IndexNum = 0;
	this.AllCheckBoxItem = null;
	this.ShowChecked = cfg.attr("showChecked") ? eval(cfg.attr("showChecked")) : false;
	this.AllowRowSelect = cfg.attr("allowSelect") ? eval(cfg.attr("allowSelect")) : false;
	this.RowSelectStyle = cfg.attr("selectStyle") || "";;
	this.RowSelectItems = [];
	this.AllowRowMultiSelect = cfg.attr("allowMultiSelect") ? eval(cfg.attr("allowMultiSelect")) : false;
	this.ShowEditButton = cfg.attr("showEditButton") ? eval(cfg.attr("showEditButton")) : false;
	this.AutoBindEditContorl = cfg.attr("autoBindEdit") ? eval(cfg.attr("autoBindEdit")) : false;
	this.DefaultEditContorlStatus = EditButtonStatus.Save;
	this.SubTableArray = [];
	this.ParentKey = "";
	this.IsHoldSubData = cfg.attr("isHoldSubData") ? eval(cfg.attr("isHoldSubData")) : false;
	this.SubGridArray = {};
	this.Sort = cfg.attr("sort") ? eval(cfg.attr("sort")) : false;
	this.AllowDrop = cfg.attr("allowDrop") ? eval(cfg.attr("allowDrop")) : false;
	this.MouseoverStyle = cfg.attr("mouseoverStyle") || "";
	this.PageNumberInfo = null;
	this.RowDBClick = eval(cfg.attr("@dbclick"));
	this.RowClick = eval(cfg.attr("@click"));
    this.PreBind = eval(cfg.attr("@preBind"));
    this.filter = eval(cfg.attr("@filter"));
    this.AfterBind = eval(cfg.attr("@afterBind"));
	this.Cells = [];
	this.OddStyle = cfg.attr("oddStyle") || "";
	this.EvenStyle = cfg.attr("evenStyle") || "";
	this.DisableStyle;
	this.TitleFixed = cfg.attr("titleFixed") ? eval(cfg.attr("titleFixed")) : false;
	this.CloseTitle = cfg.attr("closeTitle") ? eval(cfg.attr("closeTitle")) : false;
	this.CloseButton = null;
	this.THeadItem;
	this.TBodyItem = templateValues;
	this.UnionTable = null;
	this.UnionScroll = cfg.attr("unionScroll") ? eval(cfg.attr("unionScroll")) : false;
	this.UnionSelect = cfg.attr("unionSelect") ? eval(cfg.attr("unionSelect")) : false;
	this.IsTableInit = false;
	this.AutoResize = cfg.attr("autoResize") ? eval(cfg.attr("autoResize")) : false;
	this.IsRunResize = false;
	this.CheckBoxContentStyle = null;
	this.TableSize = {
		width: 0,
		height: 0
	}


	this.GridContainer = function () {
		return templateContainer;
	}

	this.EditButton = {
		BtnEidt: null,
		BtnCancel: null,
		BtnDelete: null,
		BtnSave: null,
		ShowEdit: true,
		ShowDelete: true,
		ShowSave: true,
		ShowCancel: true
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
						// row.Data[bind.Name] = instance.String2Type(type, cont
						// 	.html(), bind["DataType"]);
					} else if ("innerText" == bind.BindType) {
						var typeVal = instance.String2Type(type, cont.text(), bind["DataType"]);
						instance.WriteObjectValue(row.Data, bind.Name, typeVal);
						// row.Data[bind.Name] = instance.String2Type(type, cont
						// 	.text(), bind["DataType"]);
					} else if (instance.IsNull(bind.BindType)
						|| "value" == bind.BindType) {
						var typeVal = instance.String2Type(type, cont.val(), bind["DataType"]);
						instance.WriteObjectValue(row.Data, bind.Name, typeVal);
						// row.Data[bind.Name] = instance.String2Type(type, cont
						// 	.val(), bind["DataType"]);
					} else {
						var typeVal = instance.String2Type(type, cont.attr(bind.BindType), bind["DataType"]);
						instance.WriteObjectValue(row.Data, bind.Name, typeVal);
						// row.Data[bind.Name] = instance.String2Type(type, cont
						// 	.attr(bind.BindType), bind["DataType"]);
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
		rowTemplateContainer = $(templateContainer[0].rows[1]).clone(true);
		$(templateContainer[0].rows[1]).remove();

		this.BindTitle();
		//
		if (this.TitleFixed) {
			$.each(rowTemplateContainer[0].cells, function (i, item) {
				var widthVal = ($(instance.Cells[i].Cell).width());
				$(item).width(widthVal);
			});
		}

		if (instance.ShowChecked) {
			this.AddCheckBox();
		}

		if (this.ShowEditButton) {
			this.AddEditControl();
			this.AutoBindEditContorl = true;
			this.DefaultEditContorlStatus = EditButtonStatus.Edit;
		}

		if (this.AutoBindEditContorl) {
			this.BindEditControl();
			this.BindEditControlHandle();
		}


		isInit = true;


		this.DataSource = [];
		this.DataBind();
		this.IsTableInit = isInit;

		if (this.UnionTable) {
			this.UnionTable.ShowPageInfo = false;
			this.UnionTable.TitleFixed = this.TitleFixed;
			this.UnionTable.Init();
		}

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

	this.BindTitle = function () {
		var titles = $("thead", templateContainer);
		var titleTr = $("tr", titles);

		this.THeadItem = titles;
		for (var i = 0; i < titleTr[0].cells.length; i++) {
			var item = titleTr[0].cells[i];
			var cell = $(item);
			cell.attr("__InnerType", "DataCol");
			cell.attr("__ColIndex", i + "");
			//
			if (this.CloseTitle) {
				var cellhtml = cell.html();
				var divCell = $("<div style='display:inline'>" + cellhtml + "</div>");
				cell.empty();
				cell.append(divCell);
				var addCloseBtn = $("<a href='javascript:void(0)' style='display:inline;float: right;'></a>");
				if ("false" != cell.attr("close")) {
					if (this.CloseButton) {
						addCloseBtn.append(this.CloseButton.clone());
					} else {
						addCloseBtn.text("X");
					}

					cell.append(addCloseBtn);
					addCloseBtn.click(function () {
						//
						var col = instance.FindParentInnerType(this, "DataCol");
						var colIndex = $(col).attr("__ColIndex");
						//
						for (var i = 0; i < instance.Cells.length; i++) {
							if (parseInt(colIndex) == instance.Cells[i].Index) {
								instance.SetCellHide(i, true);
							}
						}
					});
				}
			}

			var hideCol = cell.attr("colhide") == "true" ? true : false;
			var cellItem = {
				Name: cell.attr("colname") ? cell.attr("colname") : "col_" + i,
				Cell: item,
				Index: i,
				Hide: hideCol,
				Sort: this.Sort,
				SortName: cell.attr("sort") ? cell.attr("sort") : "",
				SortType: cell.attr("sorttype") ? cell.attr("sorttype") : "",
				CellCollect: []
			};

			if (this.Sort) {
				cell.click(this.SortChange);
			}

			if (this.AllowDrop) {
				cell.bind("mousedown", function (e) {
					// $(this).css("-moz-user-select", "none");
					this.setSelectNone(true);
					this.onselectstart = function () {
						return false
					};
					var colVal = instance.FindParentInnerType(this, "DataCol");
					mousePos = instance.GetMousePosition(e);
					dropItem = colVal;
					instance.DropShow(dropItem.Row.text())
				});

				cell.bind("mouseup", function (e) {
					//
					if (!instance.IsNull(dropItem)) {
						var pos = instance.GetMousePosition(e);
						var item = instance.SetJQueryObject(dropItem);
						var col = instance.SetJQueryObject(instance.FindParentInnerType(this, "DataCol"));

						this.setSelectNone(false);

						if (dropShowItem){
							dropShowItem.remove();
							dropShowItem = null;
						}

						if (item.hasClass(instance.MouseoverStyle)) {
							item.removeClass(instance.MouseoverStyle);
						}

						this.onselectstart = function () { };
						$(this).css("-moz-user-select", undefined);

						if (this != item[0]) {
							var resItem, desItem;
							for (var i = 0; i < instance.Cells.length; i++) {
								if (item.attr("__ColIndex") == instance.Cells[i].Index) {
									resItem = instance.Cells[i];
								} else if (col.attr("__ColIndex") == instance.Cells[i].Index) {
									desItem = instance.Cells[i];
								}

								if (resItem && desItem) {
									break;
								}
							}
							//
							if (pos.X > mousePos.X) {
								item.insertAfter(col);
								$.each(resItem.CellCollect, function (index, item) {
									item.insertAfter(desItem.CellCollect[index]);
								});
							} else if (pos.X < mousePos.X) {
								item.insertBefore(col);
								$.each(resItem.CellCollect, function (index, item) {
									item.insertBefore(desItem.CellCollect[index]);
								});
							}
						}
					}
					dropItem = null;
				});

				cell.bind("mouseover", function () {
					if (!instance.IsNull(dropItem)) {
						$(this).addClass(instance.MouseoverStyle);
					}
				});

				cell.bind("mouseout", function (e) {
					$(this).removeClass(instance.MouseoverStyle);
				});
			}

			//
			this.Cells.push(cellItem);
		}

		if (this.TitleFixed) {
			templateContainer.css("table-layout", "fixed");
			// titles.css("overflow-y","scroll");
			// titles.css("height","10%");
			titles.css("display", "table");
			titles.css("word-wrap", "break-word");
			templateValues.css("height", "calc(100% - " + titles.height() + "px)");
			templateValues.css("overflow-y", "scroll");

			if (this.UnionTable && this.UnionScroll) {
				templateValues.scroll(this.BodyScroll);

			}

			// titles.css("width","calc(100%-1em)");
			// titles.css("table-layout","fixed");
		}

		if (this.ShowTitle) {
			titleTr.show();
		} else {
			titleTr.hide();
		}
	}

	this.Filter = function (name, func) {
		for (var i = 0; i < this.Cells.length; i++) {
			var item = this.Cells[i];
			if (item.Name == name) {
				$(item.CellCollect, function (index, colVal) {
					var dRow = this.FindRowItemByObject(colVal);
					if (func(colVal)) {
						dRow.Row.hide();
					} else {
						dRow.Row.show();
					}
				});
				break;
			}
		};
	}

	this.BodyScroll = function (e) {
		if (subScroll) {
			this.SetScroll($(this).scrollTop());
		}

		subScroll = true;
	}

	this.SetScroll = function (localNum) {
		subScroll = false;
		this.TBodyItem.scrollTop(localNum);
	}

	this.SortChange = function () {
		var item = $(this);
		if (instance.IsNull(item.attr("sorttype"))) {
			item.attr("sorttype", "desc");
		}

		var sortName = item.attr("sort");
		var sortType = "desc" == item.attr("sorttype").toLowerCase();
		var sortTypeStr = sortType ? "desc" : "asc";
		if (instance.SortEvent(sortName, sortTypeStr)) {
			instance.DataSource.sort(function (a, b) {
				var type = sortType ? 1 : -1;
				return a[sortName] > b[sortName] ? 1 * type : -1 * type;
			});

			instance.DataBind();
		}

		item.attr("sorttype", sortType ? "asc" : "desc");
	}

	this.SortEvent = function (name, type) {
		return true;
	}

	// this.BindHoldSubData = function() {
	// if (this.IsHoldSubData) {
	// for (var i = 0; i < this.NowPageData.length; i++) {
	// }
	// }
	// }

	this.PreDataBind = function () {

	}

	this.BindData = function (data) {
		this.DataSource = data;
		this.DataBind();
    }

	this.DataBind = function () {
		if (!isInit) {
			instance.Init();
		}
		this.PreDataBind();
		instance.NowPageData = [];
		instance.RowSelectItems = [];
		instance.RemoveAll();
		instance.ClearShowStatus();
		var readDataList = instance.GetPageData(true);

		$.each(this.Cells, function (index, item) {
			item.CellCollect = [];
		});

		$.each(readDataList, function (index, item) {
			if (instance.PreCreateNewRow(item, index)){
                instance.CreateNewRow(item, index);
			}
		});

		if (this.TitleFixed) {
			templateValues.css("overflow-y", "auto");
			// templateValues.css("height","90%");
			templateValues.css("display", "block");
			// templateValues.css("text-overflow","ellipsis");
			// templateValues.css("overflow","hidden");
			templateValues.css("word-break", "break-all");

			// templateValues.css("white-space","nowrap");
			// templateValues.css("width","100%");
			// templateValues.css("table-layout","fixed");
		}

		instance.SetPageRowItemSelectStatus();
		instance.InitEditContorl();
		// instance.SetAllCellHide();

		if (instance.ShowPageInfo) {
			instance.BindPageContainer();
			instance.SetPageButtomStatus();
		}

		// this.TableSize.width = templateContainer.width();
		// this.TableSize.height = templateContainer.height();
		this.OnResize();
	}

	this.HideCell = function () {

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
		// row.css("table-layout","fixed");
		// row.css("display","block");
		// row.css("width","100%");
		// row.css("display","table");
		var rowStyle = index % 2 > 0;

		if (rowStyle) {
			if (!this.IsNull(this.OddStyle))
				row.addClass(this.OddStyle);
		} else {
			if (!this.IsNull(this.EvenStyle))
				row.addClass(this.EvenStyle);
		}

		item.DataStatus.Show = true;

		this.ReBindRow(row, item.Data);
		this.AfterBindRow(row, item.Data);

		var subTr = this.BindSubGrid(item.Data, item.Key);
		var itemData = {
			Row: row,
			Value: item,
			SubRow: subTr,
			ShowSubGrid: false
		};

		this.BindParentRowClick(row);
		this.NowPageData.push(itemData);

		this.BindRowEvent(row);

		templateValues.append(row);
		if (!this.IsNull(subTr)) {
			templateValues.append(subTr);
		}

		this.CompleteBindRow(itemData);

		return row;
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
				$(this).css("-moz-user-select", "none");
				this.onselectstart = function () {
					return false
				};
				mousePos = instance.GetMousePosition(e);
				dropItem = instance.FindDataRowByRowItem(this, true);
			});

			row.bind("mouseup", function (e) {
				if (!instance.IsNull(dropItem)) {
					var pos = instance.GetMousePosition(e);
					var item = instance.SetJQueryObject(dropItem.Row);
					var itemRow = instance.FindDataRowByRowItem(this, true);

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
		if (!(this.SubTableArray.length > 0)) {
			return;
		}

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
		this.SubGridArray = [];
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
		if (checkbox.attr("type")
			&& "checkbox" == checkbox.attr("type").toLowerCase()
			&& !this.IsNull(checkbox.attr("selectvalue"))) {
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
		return false;
	}

	this.CompleteBindItemCol = function (item, bind, data, value) {
	}

	this.ReBindRow = function (row, item) {
		this.SetCellStatus(row);
		instance.FindAllItem(row, function (content) {
			var cont = instance.SetJQueryObject(content);
			instance.PreBindCol(cont, item);
			if (!instance.IsNull(cont.attr("bind"))) {
				var bind = eval("(" + cont.attr("bind") + ")");

				if (!instance.PreBindItemCol(cont, bind, item)) {
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
				}
				instance.CompleteBindItemCol(cont, bind, item, bindValueItemStr);
			}
			instance.CompleteBindCol(cont, item);
		});
	}

	this.SetCellStatus = function (row) {
		var indexCol = 0;
		$.each(row[0].cells, function (index, item) {
			var col = $(item);
			var innerTypeVal = col.attr("__innertype");
			var innerTypeStr = "_EditControlTB_AllCheckBoxTB_SelectCheckBoxTB_";
			if (!(innerTypeStr.indexOf(innerTypeVal) > 0)) {
				var cellVal = instance.Cells[indexCol++];
				col.attr("colName", cellVal.Name);
				col.attr("__InnerType", "DataBodyCol");
				col.css("min-width", $(cellVal.Cell).width());
				cellVal.CellCollect.push(col);
				if (cellVal.Hide) {
					col.hide();
				} else {
					col.show();
				}
			}
		});
	}


	this.SetCellHideByName = function (name, hideStatus) {
		for (var i = 0; i < this.Cells.length; i++) {
			if (name == this.Cells[i].Name) {
				this.SetCellHide(this.Cells[i].Index, hideStatus);
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

		$.each(this.Cells[index].CellCollect, function (i, itemVal) {
			if (instance.Cells[index].Hide) {
				itemVal.hide();
			} else {
				itemVal.show();
			}
		});

		// $.each(this.NowPageData, function (i, row) {
		// 	instance.SetCellStatus(row.Row);
		// });
	}

	// this.SetAllCellHide = function () {
	// 	for (var i = 0; i < this.Cells.length; i++) {
	// 		this.SetCellHide(i, this.Cells[index].Hide);
	// 	}


	// }

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

	this.FindParentInnerType = function (obj, typeName) {
		var item = instance.SetJQueryObject(obj);
		if (typeName == item.attr("__InnerType")) {
			return item[0];
		}

		var parent = item.parents();
		for (var i = 0; i < parent.length; i++) {
			if (typeName == $(parent[i]).attr("__InnerType")) {
				return parent[i];
			}
		}

		return null;
	}

	this.RemoveAll = function () {
		for (var i = templateContainer[0].rows.length - 1; i > 0; i--) {
			$(templateContainer[0].rows[i]).remove();
		}
	}

	this.PageChange = function (pageInfo, func) {
		func();
	}

	this.BindPageContainer = function () {
		var row = $(document.createElement("tr"));
		var td = $(document.createElement("td"));

		if (this.IsNull(this.PrePage)) {
			this.PrePage = $(document.createElement("a"));
			this.PrePage.attr("href", "javascript:void(0)");
		}

		if (this.IsNull(this.NextPage)) {
			this.NextPage = $(document.createElement("a"));
			this.NextPage.attr("href", "javascript:void(0)");
		}

		if (this.IsNull(this.FirstPage)) {
			this.FirstPage = $(document.createElement("a"));
			this.FirstPage.attr("href", "javascript:void(0)");
		}

		if (this.IsNull(this.LastPage)) {
			this.LastPage = $(document.createElement("a"));
			this.LastPage.attr("href", "javascript:void(0)");
		}

		this.PrePage.click(this.PrePageClick);
		this.NextPage.click(this.NextPageClick);
		this.FirstPage.click(this.FirstPageClick);
		this.LastPage.click(this.LastPageClick)
		this.PrePage.html(this.Resources.Pre);
		this.NextPage.html(this.Resources.Next);
		this.FirstPage.html(this.Resources.First);
		this.LastPage.html(this.Resources.Last);

		td.attr("colspan", rowTemplateContainer[0].cells.length);
		td.attr("align", "right");
		td.append(this.BindPageNumberInfo());
		td.append(this.FirstPage);
		td.append(this.PrePage);
		td.append(this.NextPage);
		td.append(this.LastPage);

		row.append(td);
		this.PageContainer = row;

		templateContainer.append(row);
	}

	this.BindPageNumberInfo = function () {
		if (this.IsNull(this.PageNumberInfo)) {
			var div = $(document.createElement("div"));
			this.PageNumberInfo = $("<span __InnerType='NowPage'>0</span>/<span __InnerType='PageCount'>0</span>");
		}
		return this.PageNumberInfo;
	}

	this.PrePageClick = function () {
		if (instance.PageInfo.NowPage > 1) {
			instance.PageInfo.NowPage--;
		}
		instance.PageChange(instance.PageInfo, instance.DataBind);
		instance.SetPageButtomStatus();
	}

	this.NextPageClick = function () {
		if (instance.PageInfo.NowPage < instance.PageInfo.PageCount) {
			instance.PageInfo.NowPage++;
		}
		instance.PageChange(instance.PageInfo, instance.DataBind);
		instance.SetPageButtomStatus();
	}

	this.FirstPageClick = function () {
		instance.PageInfo.NowPage = 1;
		instance.PageChange(instance.PageInfo, instance.DataBind);
		instance.SetPageButtomStatus();
	}

	this.LastPageClick = function () {
		instance.PageInfo.NowPage = instance.PageInfo.PageCount;
		instance.PageChange(instance.PageInfo, instance.DataBind);
		instance.SetPageButtomStatus();
	}

	this.GetPageData = function (status) {
		var data = [];
		if (this.AutoPage) {
			this.PageInfo.RowCount = this.GetLength();
			this.PageInfo.PageCount = this.PageInfo.RowCount
				% this.PageInfo.PageSize > 0 ? parseInt(this.PageInfo.RowCount
					/ this.PageInfo.PageSize) + 1
				: this.PageInfo.RowCount / this.PageInfo.PageSize;

			for (var i = (this.PageInfo.NowPage - 1) * this.PageInfo.PageSize; i < this.DataSource.length
				&& data.length < this.PageInfo.PageSize; i++) {
				// var innerData = this.GetDataKey(this.DataSource[i]);
				// if (status) {
				// var findData = this.FindDataRow(innerData.Key);
				// if (!this.IsNull(findData)) {
				// if (findData.DataStatus.Delete) {
				// continue;
				// }
				// else {
				// innerData = findData;
				// }
				// }
				// }
				var innerData = this.GetInnerData(this.DataSource[i], status);
				if (!this.IsNull(innerData)) {
					data.push(innerData);
				}
			}
		} else {
			$.each(this.DataSource, function (index, item) {
				var innerData = instance.GetInnerData(item, status);
				if (!instance.IsNull(innerData)) {
					data.push(innerData);
				}
			});
		}
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
				if (instance.ShowChecked) {
					var ck;
					instance.FindAllItem(instance.FindRowItem(this.Key).Row,
						function (item) {
							if ("SelectCheckBox" == $(item).attr(
								"__InnerType")) {
								ck = item;
								return true;
							}
						});

					return ck;
				}

				return null;
			},
			IsChange: function () {
				return this.DataStatus.ValueChange || this.DataStatus.Delete
					|| this.DataStatus.Add || this.DataStatus.Select;
			},
			GetEditButton: function () {
				if (instance.ShowEditButton) {
					var btnItem = {};
					var findedRowItem = instance.FindRowItem(this.Key);
					if (findedRowItem) {
						instance.FindAllItem(findedRowItem.Row,
							function (item) {
								if ("BtnEidt" == $(item).attr("__InnerType")) {
									btnItem.BtnEidt = item;
								} else if ("BtnCancel" == $(item).attr(
									"__InnerType")) {
									btnItem.BtnCancel = item;
								} else if ("BtnDelete" == $(item).attr(
									"__InnerType")) {
									btnItem.BtnDelete = item;
								} else if ("BtnSave" == $(item).attr(
									"__InnerType")) {
									btnItem.BtnSave = item;
								}
							});
					}
					return btnItem;
				}
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

	this.AddCheckBox = function () {
		this.AddAllCheckBox();
		this.AddSelectCheckBox();
	}

	this.AddAllCheckBox = function () {
		var td = $(document.createElement("td"));
		this.AllCheckBoxItem = $(document.createElement("input"));
		this.AllCheckBoxItem.attr("type", "checkbox");
		this.AllCheckBoxItem.attr("__InnerType", "AllCheckBox");
		this.AllCheckBoxItem.click(this.ClickAllCheckBoxFunc);

		//layui 独有忽略样式
		this.AllCheckBoxItem.attr("lay-ignore", "true");


		td.width("20px");
		td.css("min-width", "20px");
		td.append(this.AllCheckBoxItem);
		td.attr("align", "center");
		td.attr("__InnerType", "AllCheckBoxTB");
		td.insertBefore(templateContainer[0].rows[0].cells[0]);
	}

	this.AddSelectCheckBox = function () {
		var td = $(document.createElement("td"));
		var checkbox = $(document.createElement("input"));

		if (this.CheckBoxContentStyle){
			for (var k in this.CheckBoxContentStyle){
				td.css(k, this.CheckBoxContentStyle[k]);
			}
		} else {
			td.width("20px");
			td.css("min-width", "20px");
		}

		td.attr("__InnerType", "SelectCheckBoxTB");
		checkbox.attr("type", "checkbox");
		checkbox.attr("__InnerType", "SelectCheckBox");
		checkbox.click(this.ClickCheckBoxFunc);

		//layui 独有忽略样式
		checkbox.attr("lay-ignore", "true");

		td.append(checkbox);
		td.attr("align", "center");
		td.insertBefore(rowTemplateContainer[0].cells[0]);
	}

	this.ClickAllCheckBoxFunc = function () {
		if (!instance.ClickAllCheckBox(this)) {
			instance.SelectAllByPage(instance.AllCheckBoxItem[0].checked, true);
		}

		instance.ClickAllCheckBoxAfter(this);
	}

	this.ClickCheckBoxFunc = function () {
		var row = instance.FindRowItemByObject(this);
		if (!instance.ClickCheckBox(this, row)) {
			instance.SetRowSelectStatus(row.Value, this.checked, true);
			instance.SetAllCheckBoxStatus();
		}
		instance.ClickCheckBoxAfter(this);
	}

	this.ClickCheckBoxAfter = function (item) {

	}

	this.ClickCheckBox = function (item, row) {
		return false;
	}

	this.ClickAllCheckBox = function (item) {
		return false;
	}

	this.ClickAllCheckBoxAfter = function (item) {
	}

	this.SelectAllByPage = function (status, immediate) {
		$.each(this.NowPageData, function (index, data) {
			instance.SetRowSelectStatus(data.Value,
				instance.AllCheckBoxItem[0].checked, immediate);
		});
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

	this.SetPageRowItemSelectStatus = function () {
		if (this.ShowChecked) {
			$
				.each(
					this.NowPageData,
					function (index, item) {
						item.Value.GetCheckBox().checked = item.Value.DataStatus.Select;
					});

			this.SetAllCheckBoxStatus();
		}
	}

	this.SetAllCheckBoxStatus = function () {
		for (var i = 0; i < this.NowPageData.length; i++) {
			if (!this.NowPageData[i].Value.DataStatus.Select) {
				this.AllCheckBoxItem[0].checked = false;
				return;
			}
		}

		this.AllCheckBoxItem[0].checked = this.NowPageData.length > 0;
	}

	this.SetPageButtomStatus = function () {
		this.PrePage.hide();
		this.NextPage.hide();
		this.FirstPage.hide();
		this.LastPage.hide();

		if (this.PageInfo.NowPage > 1 && this.PageInfo.PageCount > 1) {
			this.PrePage.show();
			this.FirstPage.show();
		}

		if (this.PageInfo.PageCount > 1
			&& this.PageInfo.NowPage < this.PageInfo.PageCount) {
			this.LastPage.show();
			this.NextPage.show();
		}

		this.SetPageNumberInfo();
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

	this.GetCheckBoxSelectList = function (isData) {
		return this.GetValueList("Select", isData);
	}

	this.GetAddList = function (isData) {
		var addItems = this.GetValueList("Add");
		var rtn = [];
		$.each(addItems, function (index, item) {
			if (item.DataStatus.Add && !item.DataStatus.Delete
				&& item.DataStatus.ValueChange) {
				if (isData) {
					rtn.push(item.Data);
				} else {
					rtn.push(item);
				}
			}
		});
		return rtn;
	}

	this.GetDeleteList = function (isData) {
		var deleteValues = [];
		var deleteSaveVal = this.GetValueList("Delete");

		$.each(deleteSaveVal, function (index, item) {
			if (!item.DataStatus.Add && item.DataStatus.Delete) {
				if (isData) {
					deleteValues.push(item.Data);
				} else {
					deleteValues.push(item);
				}
			}
		});
		return deleteValues;
	}

	this.GetValueChangeList = function (isData) {
		var valueChangeItems = this.GetValueList("ValueChange");
		var rtn = [];
		$.each(valueChangeItems, function (index, item) {
			if (!item.DataStatus.Add && !item.DataStatus.Delete) {
				if (isData) {
					rtn.push(item.Data);
				} else {
					rtn.push(item);
				}
			}
		});
		return rtn;
	}

	this.GetShowList = function () {
		var list = [];
		$.each(this.NowPageData, function (index, item) {
			list.push(item.Value.Data);
		});
		return list;
	}

	this.GetRowSelectList = function (isRow) {
		var list = [];
		$.each(this.RowSelectItems, function (index, item) {
			list.push(instance.FindDataRowByRowItem(item, isRow));
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

	this.AddEditControl = function () {
		var tdTop = $(document.createElement("td"));
		var td = $(document.createElement("td"));
		td.attr("__InnerType", "EditControlTB");

		// tdTop.width("40px");
		// td.width("40px");

		this.EditButton.BtnEidt = $(document.createElement("a"));
		this.EditButton.BtnCancel = $(document.createElement("a"));
		this.EditButton.BtnDelete = $(document.createElement("a"));
		this.EditButton.BtnSave = $(document.createElement("a"));

		this.EditButton.BtnEidt.attr("href", "javascript:void(0)");
		this.EditButton.BtnCancel.attr("href", "javascript:void(0)");
		this.EditButton.BtnDelete.attr("href", "javascript:void(0)");
		this.EditButton.BtnSave.attr("href", "javascript:void(0)");

		this.EditButton.BtnEidt.attr("__InnerType", "BtnEidt");
		this.EditButton.BtnCancel.attr("__InnerType", "BtnCancel");
		this.EditButton.BtnDelete.attr("__InnerType", "BtnDelete");
		this.EditButton.BtnSave.attr("__InnerType", "BtnSave");

		this.EditButton.BtnEidt.css("padding-left", "3px");
		this.EditButton.BtnCancel.css("padding-left", "3px");
		this.EditButton.BtnDelete.css("padding-left", "3px");
		this.EditButton.BtnSave.css("padding-left", "3px");

		this.EditButton.BtnEidt.html(this.Resources.Edit);
		this.EditButton.BtnCancel.html(this.Resources.Cancel);
		this.EditButton.BtnDelete.html(this.Resources.Delete);
		this.EditButton.BtnSave.html(this.Resources.Save);

		this.EditButton.BtnEidt.click(this.BtnEidtClickFunc);
		this.EditButton.BtnCancel.click(this.BtnCancelClickFunc);
		this.EditButton.BtnDelete.click(this.BtnDeleteClickFunc);
		this.EditButton.BtnSave.click(this.BtnSaveClickFunc);

		td.append(this.EditButton.BtnEidt);
		td.append(this.EditButton.BtnDelete);
		td.append(this.EditButton.BtnSave);
		td.append(this.EditButton.BtnCancel);

		td.css("min-width", "100px");
		td.width(100);
		tdTop.css("min-width", "100px");
		tdTop.width(100);

		tdTop.insertBefore(templateContainer[0].rows[0].cells[0]);
		td.insertBefore(rowTemplateContainer[0].cells[0]);
	}

	this.SetEditButtonShow = function (btn, status) {
		if (btn) {
			for (var item in btn) {
				$(btn[item]).hide();
			}
		}

		if (btn && btn.BtnDelete && this.EditButton.ShowDelete && EditButtonStatus.Edit == status) {
			$(btn.BtnDelete).show();
		}

		if (btn && btn.BtnCancel && this.EditButton.ShowCancel && EditButtonStatus.Save == status) {
			$(btn.BtnCancel).show();
		}

		if (btn && btn.BtnEidt && this.EditButton.ShowEdit && EditButtonStatus.Edit == status) {
			$(btn.BtnEidt).show();
		}

		if (btn && btn.BtnSave && this.EditButton.ShowSave && EditButtonStatus.Save == status) {
			$(btn.BtnSave).show();
		}
	}

	this.BtnDeleteClickFunc = function () {
		instance.BtnDeleteClick(this, instance.FindRowItemByObject(this),
			instance.DeleteButtonHandle);
	}

	this.BtnCancelClickFunc = function () {
		instance.BtnCancelClick(this, instance.FindRowItemByObject(this),
			instance.CancelButtonHandle);
	}

	this.BtnSaveClickFunc = function (e) {
		var obj = this;
		instance.BtnSaveClick(obj, instance.FindRowItemByObject(obj),
			instance.SaveButtonHandle);
	}

	this.BtnEidtClickFunc = function () {
		instance.BtnEidtClick(this, instance.FindRowItemByObject(this),
			instance.EditButtonHandle);
	}

	this.BtnEidtClick = function (item, rowItem, handle) {
		handle(rowItem);
	}

	this.BtnSaveClick = function (item, rowItem, handle) {
		handle(rowItem);
	}

	this.BtnCancelClick = function (item, rowItem, handle) {
		handle(rowItem);
	}

	this.BtnDeleteClick = function (item, rowItem, handle) {
		handle(rowItem);
	}

	this.EditButtonChange = function (row, type) {

	}

	this.EditButtonHandle = function (row) {
		var rollbackValue = instance.CreateObject(row.Value);
		row.Value.EditStatus = EditButtonStatus.Save;
		instance.SetHoldData(rollbackValue);
		instance.SetEditButtonShow(row.Value.GetEditButton(),
			EditButtonStatus.Save);
		instance.SetDataEditContorl(row.Row);
		instance.EditButtonChange(row, "EDIT");
	}

	this.SaveButtonHandle = function (row) {
		row.Value.EditStatus = EditButtonStatus.Edit;
		instance.SetEditButtonShow(row.Value.GetEditButton(),
			EditButtonStatus.Edit);
		instance.SetDataEditContorl(row.Row);
		instance.EditButtonChange(row, "SAVE");
	}

	this.CancelButtonHandle = function (row) {
		row.Value.EditStatus = EditButtonStatus.Edit;
		instance.RollbackRow(row.Row, true);
		instance.SetEditButtonShow(row.Value.GetEditButton(),
			EditButtonStatus.Edit);
		instance.SetDataEditContorl(row.Row);
		instance.EditButtonChange(row, "CANCEL");
	}

	this.DeleteButtonHandle = function (row) {
		row.Value.EditStatus = EditButtonStatus.Edit;
		instance.RemoveRowByRowItem(row.Row);
		instance.SetEditButtonShow(row.Value.GetEditButton(),
			EditButtonStatus.Edit);
		instance.SetDataEditContorl(row.Row);
		instance.EditButtonChange(row, "DELETE");
	}

	this.BindEditControl = function (row) {
		if (this.IsNull(row)) {
			row = rowTemplateContainer;
		}
		this.FindAllItem(row, function (item) {
			if (!instance.IsNull(item.tagName)) {
				var tagName = item.tagName.toUpperCase();
				if ("INPUT" == tagName || "SELECT" == tagName
					|| "TEXTAREA" == tagName
					|| "true" == $(item).attr("contenteditable")) {
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
				jqItem.focus(instance.EditItemFocus);
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
					} else {
						jqItem.blur(instance.RowValueChangeFunc);
					}
				}
			}
		});
	}

	this.EditItemFocus = function () {
	}

	this.RowValueChangeFunc = function () {
		instance.SetCheckBoxStatusValue(this);
		var row = instance.FindRowItemByObject(this);
		var valid = $(this).attr("valid");
		if (instance.PreRowValueChange(row, this)) {
			if (valid && !instance.CheckValidate(valid, instance.GetBindItemValue(this))) {
				instance.ValidateChange(row, this);
				return;
			}
			row.Value.DataStatus.ValueChange = true;
			instance.GetRowData(row.Row, true);
			instance.RowValueChange(this, row);
			instance.SetArrayData(row.Value);
		}
	}

	this.ValidateChange = function (row, item) {

	}

	this.GetBindItemValue = function (item) {
		var rtn = null;
		var cont = instance.SetJQueryObject(item);
		if (!instance.IsNull(cont.attr("bind"))) {
			var bind = eval("(" + cont.attr("bind") + ")");
			var type = cont.attr("BindDataType");
			if ("innerHTML" == bind.BindType) {
				rtn = instance.String2Type(type, cont.html(), bind["DataType"]);
			} else if ("innerText" == bind.BindType) {
				rtn = instance.String2Type(type, cont.text(), bind["DataType"]);
			} else if (instance.IsNull(bind.BindType)
				|| "value" == bind.BindType) {
				rtn = instance.String2Type(type, cont.val(), bind["DataType"]);
			} else {
				rtn = instance.String2Type(type, cont.attr(bind.BindType),
					bind["DataType"]);
			}
		}

		return rtn;
	}

	this.CheckValidate = function (valid, valueItem) {
		var intV = /^(-|\+)?\d+$/;
		var numV = /^\d+\.{0,1}\d+$/;
		var v = valid.split("-");
		var itemVal = valueItem;
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

	this.PreRowValueChange = function (row, item) {
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

	this.SetSelectStatus = function (tr) {
		this.SetRowChange(tr, "Select", true);
	}

	this.SetCheckBoxStatusValue = function (item) {
		var checkbox = this.SetJQueryObject(item);
		if ("INPUT" == item.tagName.toUpperCase()
			&& "checkbox" == checkbox.attr("type").toLowerCase()
			&& !this.IsNull(checkbox.attr("selectvalue"))) {
			var selectvalue = eval("(" + checkbox.attr("selectvalue") + ")");
			checkbox
				.val(checkbox[0].checked ? selectvalue.Yes : selectvalue.No);
		}
	}

	this.RowValueChange = function (item, data) {
	}

	this.SetNowPageEditButtonStatus = function () {
		if (this.ShowEditButton) {
			$.each(this.NowPageData, function (index, item) {
				instance.SetEditButtonShow(item.Value.GetEditButton(),
					item.Value.EditStatus);
			});
		}
	}

	this.InitEditContorl = function () {
		this.SetNowPageEditButtonStatus();
		$.each(this.NowPageData, function (index, item) {
			instance.SetDataEditContorl(item.Row);
		});
	}


	this.SetDataEditContorl = function (tr) {
		var row = this.FindDataRowByRowItem(tr, true);
		if (row) {
			this.FindAllItem(row.Row, function (item) {
				var jQueryObj = instance.SetJQueryObject(item);
				if ("EditItem" == jQueryObj.attr("__EditItem")) {
					jQueryObj.removeClass(instance.DisableStyle);
					if (EditButtonStatus.Edit == row.Value.EditStatus) {
						jQueryObj.attr("disabled", "disabled");
						if (instance.DisableStyle){
							$(this).addClass(instance.DisableStyle);
						}
					} else {
						if (jQueryObj.attr("disabled")) {
							jQueryObj.removeAttr("disabled")
						}
					}
				}
			});
		}
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

	this.AddSubGrid = function (grid, data, compareFunc) {
		data.sort(function (a, b) {
			return grid.SetForeignKey(a) > grid.SetForeignKey(b) ? 1 : -1;
		});
		this.SubTableArray.push({
			GridItem: grid,
			Data: data,
			KeyCompare: compareFunc
		});
	}

	this.Clone = function () {
		var grid = new Grid(templateContainer.clone(true));
		this.CopyObject(this, grid);
		// grid.Init();
		return grid;
	}

	this.FindSubDataArray = function (parentData, data) {
		var subData = [];
		var finded = false;
		this.ParentKey = parentData.Key;
		for (var i = 0; i < data.Data.length; i++) {
			if (data.KeyCompare(parentData, data.Data[i])) {
				subData.push(data.Data[i]);
				finded = true;
			} else if (finded) {
				break;
			}
		}

		return subData;
	}

	this.GetTable = function (id) {
		templateContainer.id = id;
		return templateContainer;
	}

	this.CreateSubGrid = function (parentData, data) {
		var subGrid = this.Clone();
		subGrid.DataSource = this.FindSubDataArray(parentData, data);
		subGrid.Init();
		subGrid.DataBind();

		return subGrid;
	}

	this.HideTable = function (show) {
		if (show) {
			templateContainer.show();
		} else {
			templateContainer.hide();
		}
	}

	this.CreateTableRowByItems = function (items, parent) {
		var table = parent;
		var tr = $(document.createElement("tr"));

		if (this.IsNull(table)) {
			table = $(document.createElement("table"));
		}
		table.append(tr);

		for (var i = 0; i < items.length; i++) {
			var td = $(document.createElement("td"));
			td.append(items[i]);
			tr.append(td);
		}

		return table;
	}

	this.BindSubGrid = function (data, key) {
		if (!(this.SubTableArray.length > 0)) {
			return null;
		}

		var containerTr = $(document.createElement("tr"));
		var containerTd = $(document.createElement("td"));
		var table = $(document.createElement("table"));
		var subTableTr = $(document.createElement("tr"));
		var subTableTd = $(document.createElement("td"));
		containerTr.append(containerTd);
		containerTd.append(table);
		containerTd.attr("colspan", rowTemplateContainer[0].cells.length);
		table.attr("__InnerType", "ContainerTable");
		subTableTr.attr("__InnerType", "SubRow");
		containerTr.attr("__InnerType", "SubContainerRow");
		subTableTr.append(subTableTd);
		// table.append(row);
		table.append(subTableTr);

		$.each(this.SubTableArray, function (index, item) {
			var subTable;
			item.GridItem.HideTable();
			if (instance.IsHoldSubData
				&& !instance.IsNull(instance.SubGridArray[key])) {
				subTable = instance.SubGridArray[key];
			} else {
				subTable = item.GridItem.CreateSubGrid(data, item);
			}
			subTable.HideTable(true);
			subTableTd.append(subTable.GetTable(key));
			if (instance.IsHoldSubData) {
				instance.SubGridArray[key] = subTable;
			}
		});
		containerTr.hide();
		return containerTr;
	}

	this.Rows = function () {
		var rows = [];
		$.each(templateContainer[0].rows, function (index, item) {
			if ("DataRow" == $(item).attr("__InnerType"))
				rows.push(item);
		});

		return rows;
	}

	this.ResetPageData = function () {
		var pageDate = [];
		var i = 0;
		$.each(templateContainer[0].rows, function (index, item) {
			if ("DataRow" == $(item).attr("__InnerType")) {
				pageDate.push(instance.FindDataRowByRowItem(item, true));
				$(item).attr("__RowNumber", i++);
			}
		});

		this.NowPageData = pageDate;
	}

	this.RestRowNumber = function () {
		var i = 0;
		$.each(templateContainer[0].rows, function (index, item) {
			if ("DataRow" == $(item).attr("__InnerType")) {
				$(item).attr("__RowNumber", i++);
			}
		});
	}

	this.InsertRow = function (data) {
		var item = this.GetDataKey(data);
		var row = this.CreateNewRow(item, 0);
		this.RestRowNumber();
		this.SetAddStatus(row);
		this.InitEditContorl();
		// this.SetAllCellHide();
		return row;
	}

	this.SetRowCountByGrid = function () {
		this.PageInfo.PageCount = this.SetRowCount(this.PageInfo.RowCount,
			this.PageInfo.PageSize);
		return this.PageInfo.PageCount;
	}

	this.SetRowCount = function (maxrow, showrow) {
		return parseInt(maxrow / showrow) + (maxrow % showrow > 0 ? 1 : 0);
	}

	this.OnResize = function () {
		if (this.AutoResize) {
			setInterval(function () {
				// var height = templateContainer.height();
				if (!instance.IsRunResize && templateContainer.width() != instance.TableSize.width) {
					instance.IsRunResize = true;
					// var maxWidth = 0;
					// instance.TableSize.height = height;
					$.each(instance.Cells, function (i, title) {
						var cellWidth = $(title.Cell).width();
						// maxWidth += width;
						$.each(title.CellCollect, function (j, cell) {
							cell.css("min-width", cellWidth);
						});
					});

					instance.TableSize.width = templateContainer.width();
					instance.IsRunResize = false;
					// instance.TBodyItem.css("min-width", maxWidth);
					// instance.DataBind();
				}
			}, 20);
		}
	}
}
