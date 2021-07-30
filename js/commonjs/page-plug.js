/**
 * 作者：虞健超（James.J.Yu） 日期：2010-11-26 简介：包括一个Grid的page实现
 */


function PagePlug(container) {
	var templateContainer = container;
	var instance = this;
	this.MaxPage = 0;
	this.PageNowIndex = 1;
	this.ShowRow = 10;
	this.ShowPageBtn = 5;
	this.SkipItem;
	this.FirstPage;
	this.LastPage;
	this.FinalPage;
	this.PageItem;
	this.PageContainer;
	this.PageItemCollect = [];
	this.MaxRow = 0;
	this.StartIndex = 1;
	this.EndIndex = 1;
	this.SelectClass;
	this.IsInit = false;
	this.PageChange = function (index) {

	}

	this.PrePage = function () {
		var index = this.PageNowIndex > 1 ? this.PageNowIndex - 1
			: this.PageNowIndex;
		this.ChangePage(index);
		this.PageNowIndex = index;
	}

	this.NextPage = function () {
		var index = this.PageNowIndex < this.MaxPage ? this.PageNowIndex + 1
			: this.PageNowIndex
		this.ChangePage(index);
		this.PageNowIndex = index;
	}

	this.ChangePage = function (index, nochange) {
		this.PageNowIndex = index;
		this.ChangeStartIndex();
		this.SetPageBtnStyle();
		if (!nochange) {
			this.PageChange(this.PageNowIndex);
		}
	}

	this.ReBindPage = function (nochange) {
		this.ChangePage(this.PageNowIndex, nochange);
	}

	this.Init = function () {
		if (!this.IsInit) {
			this.MaxPage = this.SetRowCount(this.MaxRow, this.ShowRow);
			this.FirstPage = $("[pagetype='first']", templateContainer);
			this.SkipItem = $("input[pagetype='skip']", templateContainer);
			this.LastPage = $("[pagetype='last']", templateContainer);
			this.PageItem = $("[pagetype='item']", templateContainer);
			this.PageContainer = $("[pagetype='container']", templateContainer);
			this.SkipButton = $("[pagetype='button']", templateContainer);
			this.FinalPage = $("[pagetype='final']", templateContainer);
			this.BindItem();
			this.IsInit = true;
		}

		// else {
		// 	this.ReBindPage();
		// }
	}

	this.GotoPage = function () {
		var itemValue = this.SkipItem.val();
		if (!Global.IsNull(itemValue)
			&& !isNaN(Number(itemValue))) {
			itemValue = itemValue > this.MaxPage ? this.MaxPage : itemValue;
			itemValue = itemValue < 1 ? 1 : itemValue;
			this.SkipItem.val(itemValue);
			this.ChangePage(parseInt(itemValue));
		}
	}

	this.BindItem = function () {
		if (this.FirstPage.length > 0) {
			// templateContainer.append(this.FirstPage);
			// 
			this.FirstPage.click(function () {
				instance.ChangePage(1);
			});
		}

		if (this.SkipButton.length > 0 && this.SkipItem.length > 0) {
			this.SkipButton.click(function () {
				instance.GotoPage();
			});
		}

		if (this.SkipItem.length > 0) {
			// templateContainer.append(this.SkipItem);
			this.SkipItem.DataBind({
				index: 1
			});

			// this.SkipItem.bind("blur",
			// 	function () {
			// 		var itemValue = $(this).val();
			// 		if (!Global.IsNull(itemValue)
			// 			&& !isNaN(Number(itemValue))) {
			// 			itemValue = itemValue > instance.MaxPage ? instance.MaxPage : itemValue;
			// 			itemValue = itemValue < 1 ? 1 : itemValue;
			// 			$(this).val(itemValue);
			// 			instance.ChangePage(parseInt(itemValue));
			// 		}
			// 	});

			this.SkipItem.keyup(function () {
				if (event.keyCode == 13) {
					instance.GotoPage();
					// var itemValue = $(this).val();
					// if (!Global.IsNull(itemValue)
					// 	&& !isNaN(Number(itemValue))) {
					// 	itemValue = itemValue > instance.MaxPage ? instance.MaxPage : itemValue;
					// 	itemValue = itemValue < 1 ? 1 : itemValue;
					// 	$(this).val(itemValue);
					// 	instance.ChangePage(parseInt(itemValue));
					// }
				}
			});
		}

		if (this.LastPage.length > 0) {
			// templateContainer.append(this.LastPage);
			this.LastPage.click(function () {
				instance.ChangePage(instance.MaxPage);
			});
		}

		if (this.FinalPage.length > 0) {
			this.FinalPage.DataBind({
				pageIndex: instance.MaxPage + ""
			});
			this.FinalPage.click(function () {
				instance.ChangePage(instance.MaxPage);
			});
		}
	}


	// this.Init = function() {
	// 	if (!this.IsInit) {
	// 		this.MaxPage = this.SetRowCount(this.MaxRow, this.ShowRow);

	// 		this.ReCreateBtn(1);

	// 		if (!Global.IsNull(this.FirstPage)) {
	// 			// templateContainer.append(this.FirstPage);
	// 			this.FirstPage.click(function() {
	// 				instance.ChangePage(1);
	// 			});
	// 		}

	// 		if (!Global.IsNull(this.SkipItem)) {
	// 			// templateContainer.append(this.SkipItem);
	// 			this.SkipItem.DataBind({
	// 				index : 1
	// 			});

	// 			this.SkipItem.bind("blur",
	// 					function() {
	// 						var itemValue = $(this).val();
	// 						if (!Global.IsNull(itemValue)
	// 								&& !isNaN(Number(itemValue))) {
	// 							instance.ChangePage(parseInt(itemValue));
	// 						}
	// 					});
	// 		}

	// 		if (!Global.IsNull(this.LastPage)) {
	// 			// templateContainer.append(this.LastPage);
	// 			this.LastPage.click(function() {
	// 				instance.ChangePage(instance.MaxPage);
	// 			});
	// 		}

	// 		this.IsInit = true;
	// 	} else {
	// 		this.ReBindPage();
	// 	}
	// }

	this.ReCreateBtn = function (start) {
		if (this.PageItem.length > 0 && this.PageContainer.length > 0) {
			this.PageItemCollect = [];
			for (i = 0; i < this.ShowPageBtn && start <= this.MaxPage; i++) {
				var item = this.PageItem.clone(true);
				this.PageItemCollect.push(item);
				this.PageContainer.append(item);
				item.DataBind({
					pageIndex: (start++) + ""
				});

				item.click(function () {
					var thisItem = $(this);
					var itemValue = thisItem.GetData();
					// instance.Values.PageNowIndex = parseInt(itemValue);
					instance.ChangePage(parseInt(itemValue.pageIndex));
					instance.SetPageBtnStyle();
				});
			}
		}

		this.EndIndex = start - 1;
		this.SetPageBtnStyle();
	}

	this.SetPageBtnStyle = function () {
		var PageNowIndexValue = this.PageNowIndex;
		$.each(this.PageItemCollect, function (index, pageBtnItem) {
			if (pageBtnItem.hasClass(instance.SelectClass)) {
				pageBtnItem.removeClass(instance.SelectClass);
			}

			if (PageNowIndexValue == parseInt(pageBtnItem.text())) {
				pageBtnItem.addClass(instance.SelectClass);
			}
		});
	}

	this.ChangeStartIndex = function () {
		// if (!(this.PageNowIndex < this.EndIndex) && (this.EndIndex < this.MaxPage)) {
		// 	this.ReCreateBtn(parseInt(this.EndIndex/2))
		// }
		// 
		this.PageContainer.empty();
		if (this.MaxPage >= this.ShowPageBtn && this.PageNowIndex >= 1) {
			var showIndex = this.MaxPage >= this.PageNowIndex + this.ShowPageBtn - 1 ? this.PageNowIndex - 1 : this.MaxPage - this.ShowPageBtn + 1;
			// var showIndex = this.ShowPageBtn - (this.MaxPage - this.PageNowIndex);
			showIndex = showIndex > 0 ? showIndex : 1;
			this.ReCreateBtn(showIndex);
		} else if (this.MaxPage < this.ShowPageBtn) {
			showIndex = 1;
			this.ReCreateBtn(showIndex);
		}
	}

	// this.CreateShowBtnCount = function () {
	// 	var nowShowBtn = this.MaxPage - this.PageNowIndex;
	// 	return nowShowBtn > this.ShowPageBtn ? this.ShowPageBtn : nowShowBtn
	// }

	this.SetRowCount = function (maxrow, showrow) {
		return parseInt(maxrow / showrow) + (maxrow % showrow > 0 ? 1 : 0);
	}

	this.ReSetting = function (nochange) {
		// this.PageNowIndex = 1;
		this.Init();
		this.ReBindPage(nochange);
	}

	this.BindPagePlug = function (rowCount, index) {
		if (rowCount > 0) {
			templateContainer.show();
		}
		else {
			templateContainer.hide();
		}

		this.PageNowIndex = index ? index : this.PageNowIndex;
		this.MaxRow = rowCount;
		this.MaxPage = this.SetRowCount(this.MaxRow, this.ShowRow);
		this.ReSetting(true);
	}
}

