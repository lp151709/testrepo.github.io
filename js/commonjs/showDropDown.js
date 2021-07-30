//作者：虞健超
//时间：2012-07-30
//描述：自动下拉选择

function ShowDropDown(control, dataKey, compareKey) {
	var grid = null;
	var p = this;
	this.BaseParent = control.parent();
	this.Control = control;
	this.Valve = 2;
	this.ShowCount = 10;
	this.DataSource = [];
	this.DataKey = dataKey;
	this.CompareKey = compareKey;
	this.ShowKey = dataKey;
	this.Top = 20;
	this.Left = 0;
	this.DivBaseContainer = $("<div style=\"position:relative;margin:0px;z-index:999;\"></div>");
	this.DivContainer = $("<div style=\"width:210px;margin-top: 20px;position: absolute;z-index:999;\"></div>");
	this.GridContainer = $(Global
		.StringFormat(
			"<table style=\"background-color: White;width:100%;padding:10px;margin:0px;z-index:999;\" class=\"SelectedHover\"><thead><tr><td>KeyWord</td><td></td><td>ValueWord</td></tr></thead><tbody><tr><td bind=\"{Name:'{0}',BindType:'innerText'}\" align=\"left\"></td><td>-</td><td bind=\"{Name:'{1}',BindType:'innerText'}\" align=\"left\"></td></tr></tbody></table>",
			[this.DataKey, this.CompareKey]));
	this.DivContainer.append(this.GridContainer);
	this.DivBaseContainer.append(this.Control);
	this.DivBaseContainer.append(this.DivContainer);
	this.BaseParent.append(this.DivBaseContainer);
	this.SelectedItem;
	this.ShowAll = false;

	this.Init = function () {
		grid = new Grid(this.GridContainer);
		grid.ShowTitle = false;
		grid.AutoPage = false;
		grid.ShowPageInfo = false;
		grid.AllowRowSelect = true;
		// grid.AllowDrop = true;
		grid.RowSelectStyle = "gridMoveOver";

		grid.AfterSelectRow = function (tr) {
			var selectItme = grid.GetRowSelectList();
			p.ValueSelected(selectItme);
			$.each(selectItme, function (index, item) {
				p.SelectedItem = item.Data;
				p.Control.val(item.Data[p.ShowKey]);
				p.DivContainer.hide();
			});

			p.Control.focus();
		}

		if ($.support.msie) {
			this.Control.bind("propertychange", function () {
				p.eventChangeValue(this);
			});
		} else {
			this.Control.keyup(function () {
				p.eventChangeValue(this);
			});
		}

		grid.Init();
		// var top = this.GetTop(0, this.Control[0]) +
		// this.Control.attr("offsetHeight");
		// var left = this.GetLeft(0, this.Control[0]);
		// this.DivContainer.css("top", top);
		// this.DivContainer.css("left", left);
		this.DivContainer.css("left", this.Left);
		this.DivContainer.css("top", this.Top);
		this.DivContainer.hide();
	}

	this.ValueSelected = function (selectItems) {
		// 
	}

	this.eventChangeValue = function (e) {
		// 
		var txtValue = $(e).val();
		this.DivContainer.hide();
		if (txtValue.length > 0) {
			this.ValueChange(true);
			this.DivContainer.show();
		}
	}

	this.ShowContainer = function (status) {
		if (status) {
			this.DivContainer.show();
		} else {
			this.DivContainer.hide();
		}
	}

	this.ReadData = function (func) {
		// 
	}

	this.IsValue = function (item) {
		var txtValue = this.Control.val();
		var cValue = this.CompareValue(item);
		return Global.StartWith(txtValue, cValue);
	}

	this.CompareValue = function (item) {
		return item[this.CompareKey];
	}

	this.ValueChange = function (nextFind) {
		var bindDataValue = [];
		for (var i = 0; i < this.DataSource.length; i++) {
			var item = this.DataSource[i];
			if (bindDataValue.length >= this.ShowCount) {
				this.BindData(bindDataValue);
				return;
			}
			if ((this.ShowAll && Global.IsNull(this.Control.val()))
				|| this.IsValue(item)) {
				bindDataValue.push(item);
			}
		}

		if (nextFind && bindDataValue < this.Valve) {
			this.ReadData(this.ExecBind);
			return;
		}

		this.BindData(bindDataValue);
	}

	this.ExecBind = function (data) {
		// 
		p.DataSource = data;
		p.ValueChange(false);
	}

	this.BindData = function (data) {
		grid.Clear();
		grid.DataSource = data;
		grid.DataBind();
	}
}
