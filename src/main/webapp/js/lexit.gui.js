/**
 * Graphic user interface
 */

var gui = {};

// Config of tiptip calls
// We need the edgeOffset to be minimal 10, otherwise it causes
// some malfunctions where we have mouseenter events, as the appearing of the tooltip
// causes mouseleave and mouseenter events, so it seems!
gui.getTiptipConfig = function(){
	
	if (bTooltipsAllowedInTable){
		return {
			defaultPosition: "top", 
			edgeOffset: 10 // never less than 10! (see above)
			}; 
	}
	else {
		return {
			fadeOut: 0, // fade out immediately
			defaultPosition: "top", 
			edgeOffset: 10 // never less than 10! (see above)
			};
	}
			
	
}

// activate the table (give it focus) at mouseover, if configuration requires that
gui.activeAtMouseOver = function(sSomeTableName){
	
	// retrieve the table settings
	var oTableSettings = conf.getTableSettings(sSomeTableName);
	
	if (conf.getFocusAtMouseover(oTableSettings)) {
		$("#"+sSomeTableName+"_dynamic").mouseenter(function(){
			fn.setActiveTable(sSomeTableName);
		});
	}
	
};


// Activate ellipsis on columns where this is required by configuration
gui.activateEllipsis = function(sSomeTableName){
	
	// retrieve table client configuration
	var oTableConfig = conf.getTableConfig(sSomeTableName);
	
	// we'll loop through the column list, and activate ellipsis on the columns where that's required
	for (var iColNr=0; iColNr<mt.getListOfColumnsOf(sSomeTableName).length; iColNr++)
	{
		// column name
		var sNameOfCurrentColumn = mt.getListOfVisibleColumnsOf(sSomeTableName)[iColNr];
		
		// retrieve column client configuration
		var oColumnConfig = 	conf.getColumnConfig(oTableConfig, sNameOfCurrentColumn);
		
		// retrieve needed configuration parameters		
		var columnVisible = 	conf.getVisibility(oColumnConfig);
		var columnEllipsis =	conf.getEllipsis(oColumnConfig);
		var columnKeepSelectedOpen = conf.getEllipsisKeepSelectedRowOpen(oColumnConfig);
		var columnEllipsisWidth = conf.getEllipsisWidth(oColumnConfig);
		var columnEllipsisHeight = conf.getEllipsisHeight(oColumnConfig);
		var columnEllipsisUnwrap = conf.getEllipsisUnwrap(oColumnConfig);
		
	
		// if the column is visible and if ellipsis is required, that activate it! 
		if (columnVisible && columnEllipsis)
		{
			// get rows 
			var oRows = fx.getAllRows(sSomeTableName);
			
			oRows.every(function(iRowNr){
				
				var oCurrentRow = this;
				
				var divClassName = sSomeTableName+"_ellipdiv"+iRowNr+"_"+iColNr;
				
				// https://codepen.io/jessicamarcus/pen/KpMwZw
				
				var sData = fx.getDataFromCellInRow(oCurrentRow, sNameOfCurrentColumn);				
				sData = "<div class='"+divClassName+"'>" + sData + "</div>";				
				fx.putDataIntoCell(oCurrentRow, sNameOfCurrentColumn, sData);
				
				// currently selected row must be unwrapped
				var bSelectedRow = (kf.getActiveTable() == sSomeTableName) ? kf.getActiveRowNumber() == iRowNr : false;
								
				$("div."+divClassName)
				.css("overflow", "hidden")
				.css("text-overflow", "ellipsis")
				.css("white-space", bSelectedRow ? "normal" : "nowrap")
				.css("max-width", columnEllipsisWidth);

				// if some (max) height was set, apply that
				if (columnEllipsisHeight != null){
					$("div."+divClassName)
						.css("max-height", columnEllipsisHeight)
						.css("overflow-y", "auto");
				}
					
				setTimeout(function(){
					gui.setSearchboxesCss(sSomeTableName);
					$($.fn.dataTable.tables(true)).DataTable().columns.adjust();
				}, 300);


				// if content must be unwrapped at mouseover, assign that to mouseevent
				if (columnEllipsisUnwrap) {
					// first clean up
					$("div."+divClassName).off();
					
					
					// unwrap this ellipsis cell at mouseover
					$("div."+divClassName).mouseover(function(){
						var thisDiv = this;

						var thisNode = $(thisDiv).closest("td").get(0);
						var sTable = fn.getTableName(thisNode);
						var sColName = fn.getNameOfColumnForThisNode(thisNode);
						var columnEllipsisDelay = conf.getEllipsisDelay(conf.getColumnConfig(conf.getTableConfig(sTable), sColName));

						// wait a bit before unwrapping, to allow moving the mouse
						// over a table without unnecessarily unwrapping every cell the mouse meets 
						setTimeout(function(){
							var bStillHover = thisDiv.matches(":hover");
							if (bStillHover){
								$(thisDiv).css("white-space", "normal");
								setTimeout(function(){
									gui.setSearchboxesCss(sSomeTableName);
									$($.fn.dataTable.tables(true)).DataTable().columns.adjust();
								}, 300);
							}
						}, columnEllipsisDelay);
					});
					
					// wrap this ellipsis cell at mouseout
					if (columnKeepSelectedOpen) {
						$("div."+divClassName).mouseout(function(){
							var thisDiv = this;

							// special case: close this ellipsis cell at mouseout, except when config says selected rows must keep unwrapped
							if ( !$(thisDiv).closest("tr").hasClass("selected")){
								$(thisDiv).css("white-space", "nowrap");
								setTimeout(function(){
									gui.setSearchboxesCss(sSomeTableName);
									$($.fn.dataTable.tables(true)).DataTable().columns.adjust();
								}, 300);
							}
						});
					}
					else {
						$("div."+divClassName).mouseout(function(){
							var thisDiv = this;

							// close this ellipsis cell at mouseout							
							$(thisDiv).css("white-space", "nowrap");
							setTimeout(function(){
								gui.setSearchboxesCss(sSomeTableName);
								$($.fn.dataTable.tables(true)).DataTable().columns.adjust();
							}, 300);
						});
					}
					
				}				
				
			});
			
		}
	}	
	
};

// compute the heights of an element wrapped and unwrapped  
gui._getTrueHeights = function(nNode){

	$(nNode).css("height", "");
	var minimalHeight = $(nNode).css("white-space", "nowrap").css("height");
	var inExtensionHeight = $(nNode).css("white-space", "normal").css("height");

	return {"minimal": minimalHeight, "extended": inExtensionHeight};
}




// replace the possibly technical names of columns by nice user friendly names, if available
gui.setColumnNiceNames = function(sSomeTablename){
	
	var oTable = mt.getDataTableObjectOf(sSomeTablename);
	var oTableConfig = conf.getTableConfig(sSomeTablename);
	
	var aColumnsList = mt.getListOfColumnsOf(sSomeTablename);
		
	for (var i=0; i<aColumnsList.length; i++)
		{		
		var oColumnConfig = conf.getColumnConfig(oTableConfig, aColumnsList[i]);
		var sNiceName = conf.getColumnNiceName(oColumnConfig);
		
		// trick: https://datatables.net/forums/discussion/27038/how-change-dynamically-title-of-column#Comment_73504
		if(sNiceName != null)
			$( oTable.column(i).header() ).text( sNiceName );
		}
};

// put the tooltips of the different column buttons in the table
// if some are set in the config file
gui.putTooltipsOfColumnButtons = function(sSomeTablename){
	
	var oTableConfig = conf.getTableConfig(sSomeTablename);
	
	$("#"+sSomeTablename+" tbody tr:not('.group')").each(function(){
		
		$(this).find("td").each(function(i){	
				
			var oColumnConfig = conf.getColumnConfig(oTableConfig, mt.getListOfVisibleColumnsOf(sSomeTablename)[i]);
			var columnButtonName = conf.getButtonSetting(oColumnConfig);
			var columnButtonTooltip = conf.getButtonTooltip(oColumnConfig);
			
			if ($(this).find("span.colbutton button").length>0)
				{				
				// tooltip
				if (columnButtonTooltip != null && columnButtonTooltip != "")
					$(this).find("span.colbutton button").attr("title", columnButtonTooltip);
				
				// name
				if (columnButtonName != null && columnButtonName != "")
					$(this).find("span.colbutton button").html(columnButtonName);
				}			
		});
	});
};





// apply row grouping, if configuration requires that
gui.applyRowGrouping = function(sSomeTableName){
	
	var aTableSettings = conf.getTableSettings(sSomeTableName);
	var sGroupingColumn = conf.getGroupingColumn(aTableSettings);
	var iGroupingColumn = $.inArray(sGroupingColumn, mt.getListOfColumnsOf(sSomeTableName));
	
	// row grouping
	// https://datatables.net/examples/advanced_init/row_grouping.html
	
	if (iGroupingColumn>=0) {

		var oTableConfig = conf.getTableConfig(sSomeTableName);
		var oColumnConfig = conf.getColumnConfig(oTableConfig, sGroupingColumn);
		var bSortable = conf.getSortability(oColumnConfig);

		// Order by grouping column if config allows so
		if (bSortable){
			
			$('#'+sSomeTableName+' tbody').on( 'click', 'tr.group', function () {
				
				var oTable = mt.getDataTableObjectOf(sSomeTableName);
				
				var currentOrder = oTable.order();
				if ( currentOrder.length>0 && 
						currentOrder[0][0] === iGroupingColumn && currentOrder[0][1] === 'asc' ) {
					oTable.order( [ iGroupingColumn, 'desc' ] ).draw();
				}
				else {
					oTable.order( [ iGroupingColumn, 'asc' ] ).draw();
				}
			});
		}
		
	}
};

// build formgrid
gui.buildFormViewIfRequired = function(sSomeTablename){

	// do we have configuration for a form grid
	var oTableSettings =    conf.getTableSettings(sSomeTablename);
	var oFormGrid =         conf.getFormGrid(oTableSettings);
		
	// if the table was set to have a small height, we need to remove the 'smallheight' class
	// before going to form view, otherwise it won't behave as excepted!
	var bKeepSmall = (oTableSettings["keep_small"] ?? false);
	if (bKeepSmall){
		if (mt.getViewType(sSomeTablename) == 'form'){ 
			$("#"+sSomeTablename+"_dynamic").removeClass("smallheight");
		}
		else {
			$("#"+sSomeTablename+"_dynamic").addClass("smallheight");
		}
	}

	// if we don't, fall back to the old type of form view
	if (oFormGrid == null) {
		gui.buildFormViewIfRequiredOLD(sSomeTablename);

	}

	// otherwise do build the formgrid defined in config, if required now
	else {

		// we do this only in the 'form' view type of course!
		if (mt.getViewType(sSomeTablename) == 'table') {

			// undo form view settings

			// if form view is not built yet, build it!
			if ( $("#"+sSomeTablename+"_form").elementExists() ){
				$("#"+sSomeTablename+"_form").remove();
				$("#"+sSomeTablename+"_search_and_sort").remove();
			}

			// make main table visible again
			$("#"+sSomeTablename+"_dynamic .dataTables_scroll").css("display", "block");
			$("#"+sSomeTablename+"_dynamic .top button#"+sSomeTablename+"_undo_button").css("display", "inline");
			$("#"+sSomeTablename+"_dynamic .bottom_pane").show();
			$("#"+sSomeTablename+"_dynamic .export_pane").show();

			// make buttons visible again
			$("#"+sSomeTablename+"_dynamic .top div#"+sSomeTablename+"_undo_button_div").css("display", "inline");
			$("#"+sSomeTablename+"_dynamic .top div#"+sSomeTablename+"_goto_button").css("display", "inline");
			$("#"+sSomeTablename+"_dynamic .top div#"+sSomeTablename+"_colselect_button").css("display", "inline");
			$("#"+sSomeTablename+"_dynamic .top div#"+sSomeTablename+"_searchandreplacebutton").css("display", "inline");
			$("#"+sSomeTablename+"_dynamic .top div#"+sSomeTablename+"_selectionbutton").css("display", "inline");
			$("#"+sSomeTablename+"_dynamic .top button#"+sSomeTablename+"_selectionbutton").parent().css("display", "inline");

		}
		else {

			form.manageViewGrid(sSomeTablename);
		}
	}

};


// build the form view
gui.buildFormViewIfRequiredOLD = function(sSomeTablename){
	
	// we do this only in the 'form' view type of course!
	if (mt.getViewType(sSomeTablename) == 'table') {

		// remove any left label of previous round
		$("#"+sSomeTablename+"_wrapper div."+sSomeTablename+"_cell_label").remove(); 
		$("#"+sSomeTablename+"_wrapper div."+sSomeTablename+"_cell_value").remove();

		// in table view mode, make sure the export buttons are visible
		$("#"+sSomeTablename+"_wrapper div.export_pane").show();
		$("#"+sSomeTablename+"_wrapper div.bottom_pane").show();

		$("#"+sSomeTablename+"_searchboxes").show();
		$("#"+sSomeTablename+"_wrapper table thead").show();

		gui.setSearchboxesCss(sSomeTablename);

		return;
	}
		
	// make sure only one row at the time will be shown
	var iNowIndex = fn.getCurrentDisplayStart(sSomeTablename);
	mt.getDataTableObjectOf(sSomeTablename).page.len(1);
	mt.getDataTableObjectOf(sSomeTablename).displayRow(iNowIndex);
	
	// in form view mode, hide the export buttons
	$("#"+sSomeTablename+"_wrapper div.export_pane").hide();
	$("#"+sSomeTablename+"_wrapper div.bottom_pane").hide();
	// and hide the search boxes
	$("#"+sSomeTablename+"_searchboxes").hide();
	$("#"+sSomeTablename+"_wrapper table thead").hide();
		
	
	// remove the built-in datatables row even/odd class names, to prevent row highlight
	// (as a form represents only one row, row highlight is of no use)
	$("#"+sSomeTablename+"_wrapper div.dataTables_scrollBody tr:not('.group')").removeClass("odd");
	$("#"+sSomeTablename+"_wrapper div.dataTables_scrollBody tr:not('.group')").removeClass("even");
	
	// room to keep between top of form and bottom of header
	var iRoomAboveAll = parseInt( $("#"+sSomeTablename+"_wrapper").find("div.top").height()) + 35;
	
	// compute the cell referential positions etc
	// so as to be able to put the cells at new screen positions
	
	var nReference = $( "#"+sSomeTablename+"_wrapper div.dataTables_scrollBody table");
	var nReferentialTr = $("#"+sSomeTablename+"_wrapper div.dataTables_scrollBody tbody").find("tr:not('.group')").eq(0);
	var iBaseLeft = parseInt(nReference.position().left) + 5;
	var iBaseTop = parseInt(nReference.position().top);
	
	var iBaseHeight = 30 + // fixed, instead of 'parseInt(nReferentialTr.css("height"))',
	                       // which sometimes causes very ugly layout because of 
	                       // long, thus multilines column names.
		parseInt(nReferentialTr.css("padding-top")) +
		parseInt(nReferentialTr.css("padding-bottom")) +
		parseInt(nReferentialTr.css("margin-top")) +
		parseInt(nReferentialTr.css("margin-bottom"));
	
	// put the cells at new positions (as a form instead of as a table)
	// and add labels 
	$("#"+sSomeTablename+"_wrapper div."+sSomeTablename+"_cell_label").remove(); // remove any left label of previous round
	$("#"+sSomeTablename+"_wrapper div."+sSomeTablename+"_cell_value").remove();
	
	var iMaxColumnTitleWidth = gui.getMaxColumnTitleWidth(sSomeTablename);
	
	// compute number of row/columns to be built
	var iNumberOfTableColumns = $("#"+sSomeTablename+"_wrapper thead").find("th").length;
	var aFormDimensions = gui.getFormViewDimensions(sSomeTablename, iMaxColumnTitleWidth, iNumberOfTableColumns);
	var iNumberOfFormColumns  = aFormDimensions[0]; // x
	var iNumberOfFormRows     = aFormDimensions[1]; // y	
	
	
	$("#"+sSomeTablename+"_wrapper div.dataTables_scrollBody tbody").find("td").each(function(i){
		
		var thisCell = this;

		var y = i%iNumberOfFormRows ;
		var x = Math.floor(i/iNumberOfFormRows);
		
		// ------------
		// cell labels
		// ------------

		var nReferentialColumn = $("#"+sSomeTablename+"_wrapper thead").find("th").eq(i);
		var iFontSize = parseInt(nReferentialColumn.css("font-size"));
		var sColumnTitle = nReferentialColumn.text();
		var oTableConfig = conf.getTableConfig(sSomeTablename);
		var oColumnConfig = conf.getColumnConfig(oTableConfig, sColumnTitle);
		var sColNameToRender = conf.getColumnNiceName( oColumnConfig );
		if (sColNameToRender == null) sColNameToRender = sColumnTitle;
		

		var eCellLabel = $("<div></div>")			
			.addClass(sSomeTablename+"_cell_label")
			.css("width", iMaxColumnTitleWidth)
			.css("background-color", "#E2E4FF")
			.append(
				$("<b></b>").text(sColNameToRender).css("font-size", iFontSize)
			);	
		
		var iNewTop  = iBaseTop + y*(iBaseHeight+2);
		var iNewLeft = iBaseLeft + x*(2.5*iMaxColumnTitleWidth) + x*40;
		
		eCellLabel
			.css("position", "absolute")
			.css("left", iNewLeft)
			.css("top", iNewTop + iRoomAboveAll )
			.css("padding", "0px 0px 0px 3px")
			.css("margin", "0px 0px 0px 0px")
			.css("height", (iBaseHeight+2)+"px")
			.css("border", "1px dotted black");
		// tooltip for content, since long text can't be fully read in form view type
		eCellLabel
			.addClass("tooltip")
			.attr("title", $(this).text());
		$("#"+sSomeTablename+"_wrapper").append(eCellLabel);
		
		// ------------
		// cells values
		// ------------

		var sBgColor = conf.getBackgroundColor(oColumnConfig);
		var sBgColorToRender = (sBgColor == null ? "#FFFFFF" : ((sBgColor+",").split(","))[0] ); // deal with doubled color codes in config

		$(thisCell)
			.css("display", "block")
			.addClass(sSomeTablename+"_cell_value")
			.css("background-color", sBgColorToRender)
			.css("border", "1px dotted black")
			.css("position", "relative")
			.css("left", iNewLeft + parseInt( $(eCellLabel).css("width") ) + 15 +"px")
			.css("top", 3-(x*(iNumberOfFormRows*(iBaseHeight+2))))
			.css("padding", "0px 0px 0px 3px")
			.css("margin", "0px 0px 0px 0px")
			.css("width", (iMaxColumnTitleWidth*1.5)+"px")
			.css("height", (iBaseHeight)+"px" );

		
	});
	
	
	// activate tipTip jquery plugin for nice cross-browser tooltips
	// (needs to be reactivated at each draw, so it seems)
	$(".tooltip").tipTip( gui.getTiptipConfig() );	
	
};

// subroutine of gui.buildFormViewIfRequired (hier above)
// needed to get (and cache a constant value of) the max column width

gui.getMaxColumnTitleWidth = function(sSomeTablename){
	
	if ( mt.formviewGetColumnTitleWidth(sSomeTablename) == null)
		{
		var iMaxColumnTitleWidth = 0;
		$("#"+sSomeTablename+"_wrapper thead").find("th").each(function(){
			var iColumnTitleWidth = parseInt($(this).css("width"));
			if (iColumnTitleWidth>iMaxColumnTitleWidth) iMaxColumnTitleWidth = iColumnTitleWidth;
			});
		mt.formviewPutColumnTitleWidth(sSomeTablename, iMaxColumnTitleWidth);
		}
	
	return mt.formviewGetColumnTitleWidth(sSomeTablename);
};

// subroutine of gui.buildFormViewIfRequired (hier above)
// needed to compute (and cache constant) suitable form dimensions (y, x) given the number of table columns

gui.getFormViewDimensions = function(sSomeTablename, iMaxColumnTitleWidth, iNumberOfTableColumns){
	
	// compute the dimensions if they were are not computed yet,
	// or return the earlier computed values
	if ( mt.formviewGetDimensions(sSomeTablename) == null )
		{
		var aDimensions = new Array();
		// x
		aDimensions[0] = Math.floor( screen.width / (2*iMaxColumnTitleWidth));
		// y
		aDimensions[1] = Math.ceil(iNumberOfTableColumns / aDimensions[0]);
		mt.formviewPutDimensions(sSomeTablename, aDimensions);
		}
		
	return mt.formviewGetDimensions(sSomeTablename);
};


// Show a warning when the user has applied some change in a cell belonging to a column
// onto which a filter was applied.
// This is needed, since changing some values would mean that some rows implicitly won't be part
// of the filtered rows anymore, as these are implicitly replaced by the following rows which are still
// part of the filter selection. But since this is not reflected by the current view, going to the next
// page will cause the user to overlook those rows, which won't be part of the next page of course, since
// they have gone up into the page the user just left! 
//
// To prevent this from happening, hide the pagination and show a warning
// (refreshing by user will be enough to solve that all)

gui.showWarningWhenRefreshingIsRequired = function(sTableName, sColumnName){
	
	var sSearchValue = fn.getValueOfFilterBox(sTableName, sColumnName);
	
	if ( sSearchValue!= '')
		{
		var sWarning = "<SPAN><B>"+ lang.display_differs_from_selection +"!</B></SPAN>";
		
		$("#"+sTableName+"_wrapper .paginate_button").hide();
		$("#"+sTableName+"_wrapper .dataTables_paginate").html(sWarning).addClass("dont_paginate");
		}
	
};


// registration of cell changes for undo function
// = change event upon modifying a cell
gui.attachOnCellChangeEvent = function(sSomeTableName){	
	
	// TEXT CELLS
	
	$("#"+sSomeTableName+" td.editable_text").bind("change", function(){
		
		var aPos = mt.getDataTableObjectOf(sSomeTableName).cell( this ).index();
		
		// get value of cell
		var sOldValue = this.revert;

		// add event to undo memory stack, consisting
		// of the id of a node, its position in the table, and its old value
		
		un.addEvent(sSomeTableName, fn.getRowNodeId(this), aPos.columnVisible, sOldValue);
		
		
		// was the modified cell  part of a column onto which a filter was applied?
		// if so, disable the paginate buttons: the user will have to refresh to re-enable them!
		
		gui.showWarningWhenRefreshingIsRequired( sSomeTableName, (mt.getListOfVisibleColumnsOf(sSomeTableName))[aPos.columnVisible] );
	});	
	
	
	// CHECKBOXES
	
	$("#"+sSomeTableName+" td.editable_checkbox").bind("click", function(){
		
		// if rows are being selected, undo doesn't make sense!
		if (mt.rowSelectionIsAllowed(sSomeTableName))
			return true;
		
		// if the checkbox wasn't clicked but only the surrounding cell, cancel!
		if ($(this).find("input").is(":focus") == false)
			return true;
		
		var aPos = mt.getDataTableObjectOf(sSomeTableName).cell( this ).index();
		
		// get value of cell		
		// prop is most reliable (http://jquery-howto.blogspot.nl/2013/02/jquery-test-check-if-checkbox-checked.html)
		var checked = $(this).find("input").eq(0).prop("checked") == true;	
		
		var isACheckBoxType = $.inArray(mt.getListOfColumnTypesOf(sSomeTableName)[aPos.column], ["bit varying(1)", "boolean"]);
		var bIsBooleanType = mt.getListOfColumnTypesOf(sSomeTableName)[aPos.column] == "boolean";
		var trueValue = bIsBooleanType ? true : 1;
		var falseValue = bIsBooleanType ? false : 0;
		

		var sOldValue = !checked ? trueValue : falseValue;
		
		// add event to undo memory stack, consisting
		// of the id of a node, its position in the table, and its old value
		un.addEvent(sSomeTableName, fn.getRowNodeId(this), aPos.columnVisible, sOldValue);
		
		
		// give cell element true or false value 
		// (must be contrary of old values, as the checkbox was clicked upon) 
		var bNewValue = checked;
		$(this).find("input").val( bNewValue );
		
		
		// was the modified cell  part of a column onto which a filter was applied?
		// if so, disable the paginate buttons: the user will have to refresh to re-enable them!
		
		gui.showWarningWhenRefreshingIsRequired( sSomeTableName, (mt.getListOfVisibleColumnsOf(sSomeTableName))[aPos.columnVisible] );
		
	});
	
	
	// SELECT BOXES
	
	$("#"+sSomeTableName+" td.editable_selectbox").bind("change", function(){
		
		// if rows are being selected, undo doesn't make sense!
		if (mt.rowSelectionIsAllowed(sSomeTableName))
			return true;
		
		var aPos = mt.getDataTableObjectOf(sSomeTableName).cell( this ).index();
		
		// get value of cell
		var sOldValue = this.revert;

		// add event to undo memory stack, consisting
		// of the id of a node, its position in the table, and its old value
		un.addEvent(sSomeTableName, fn.getRowNodeId(this), aPos.columnVisible, sOldValue);
		
		
		// was the modified cell  part of a column onto which a filter was applied?
		// if so, disable the paginate buttons: the user will have to refresh to re-enable them!
		
		gui.showWarningWhenRefreshingIsRequired( sSomeTableName, (mt.getListOfVisibleColumnsOf(sSomeTableName))[aPos.columnVisible] );
	});

};






// Apply the jEditable handlers to the table

gui.makeTableEditable = function(sSomeTablename){
	
	// special case:
	// if this function is called at fnDrawCallback, while row selection mode is activated
	// than the checkboxes must keep disabled until the row selection mode is put back off	
	if (mt.rowSelectionIsAllowed(sSomeTablename))
		$('#'+sSomeTablename+' td.editable_checkbox input').attr("disabled", true);
	
	
	// TEXT CELLS HANDLER	
	
	$( mt.getDataTableObjectOf(sSomeTablename).cells('td.editable_text').nodes() ).editable( 
			
		function(value, settings){
			
			// current node 
			var nCurrentNode = this;
			
			// (needed for the undo registration, which is triggered by change events on cells)
			//if (bowser.msie || bowser.firefox) // here needed for IE and FF
				$(nCurrentNode).change();
			
			// instead of submitting an url (default in jEditable)
			// we submit an own function which makes an Ajax call
			// so we control everything
			var aPos = mt.getDataTableObjectOf(sSomeTablename).cell( nCurrentNode ).index();
			
			// check if we have a custom editing function from config file
			// if available, it must overrule the normal (following) function
			var oTableConfig = conf.getTableConfig(sSomeTablename);
			var sColumnName = mt.getListOfColumnsOf(sSomeTablename)[aPos.column];
			var sColumnType = mt.getListOfColumnTypesOf(sSomeTablename)[aPos.column];
			var oColumnConfig = conf.getColumnConfig(oTableConfig, sColumnName);
			var fnEditPreprocess = conf.getEditPreprocess(oColumnConfig);
			var fnEditFunction = conf.getEditFunction(oColumnConfig);
			var fnEditCallback = conf.getEditCallback(oColumnConfig);
			var fnEditErrorHandler = conf.getEditErrorHandler(oColumnConfig);
			var sEditTrigger = conf.getEditTrigger(oColumnConfig);

			// if a preprocess function was declared.... preprocess the value!
			var sPreprocessedValue = ( fnEditPreprocess != null ? fnEditPreprocess(value) : value);
			
			// Special case: we apply the custom edit function
			// If an edit trigger is defined, the edit function is called only 
			// if the cell content matches a given regex stored in the config file 
			// as 'edittrigger', which triggers the custom edit function!
			if (fnEditFunction != null &&
					// no trigger is needed, or trigger is matched
					( sEditTrigger==null || new RegExp(sEditTrigger).test(value) ) ) {
						
				conf.getEditFunction(oColumnConfig)(mt.getDataTableObjectOf(sSomeTablename), nCurrentNode, sPreprocessedValue);
				// callcack function, if it is set in configuration
				if (fnEditCallback!=null)
					fn.message(lang.error, 
						lang.editcallback_warning1+".<BR>"+
						lang.editcallback_warning2+": "+ sSomeTablename + "<BR>"+
						lang.editcallback_warning3+": "+ sColumnName);
				
				// new input might affect column and searchboxes alignment 
	 			gui.setSearchboxesCss(sSomeTablename);	 			
				// refresh the tables that config file requires to be refreshed upon editing of current cell
				conf.refreshTables(oColumnConfig);				
			}
			
			// normal case: we apply the normal edit function 
			else {
				gui.showProcessingMsg(sSomeTablename);
				var rowId = this.parentNode.getAttribute('id');
				var url = WEBSERV_URL+"/api/setvalue";
				$.ajax( {
					"type": "POST",
					"async": false,
					"url": url,
					"data": {
						"row_id": rowId,
						"db_name": lexutil.getHttpParams().get("db"),
						"table_name": sSomeTablename,
						"column_name": sColumnName,
						"new_value": sPreprocessedValue,
						"value_type": sColumnType,
						"dummy": lexutil.getUniqueNumber()
						},
				 	"dataType": "xml", // get response as xml
				 	"success": function(xml) {
				 		
				 		gui.removeProcessingMsg(sSomeTablename);
				 		if (gui.getDbResponse(xml)) {
				 			
				 			// callcack function, if it is set in configuration
				 			if (fnEditCallback!=null)
								fnEditCallback(mt.getDataTableObjectOf(sSomeTablename), nCurrentNode, sPreprocessedValue);
				 			
				 			// new input might affect column and searchboxes alignment 
				 			gui.setSearchboxesCss(sSomeTablename);				 			
				 			// refresh the tables that config file requires to be refreshed upon editing of current cell
				 			conf.refreshTables(oColumnConfig);	
				 			
				 		}
				 		else {
				 			fn.message(lang.error_occurred_in_table+ " '"+sSomeTablename+"'", 
				 					lang.some_error_has_occurred+ " ["+gui.getDbResponse(xml)+"]"
				 					);
				 		}
				 	},
					"error": function(jqXHR, textStatus, errorThrown){
						
						if (fnEditErrorHandler != null)	{
							fn.removeProcessingMsg(sSomeTablename);
							fnEditErrorHandler({
								"jqXHR": jqXHR, "textStatus": textStatus, "errorThrown": errorThrown, 
								"tableName": sSomeTablename, "columnName": sColumnName, "columnValue": sPreprocessedValue
								});
						}
						else {
							var bIdIsMissing = ($(fn.getRowNode(nCurrentNode)).attr('id') == undefined);
							fn.message(lang.error_occurred_in_table+ " '"+sSomeTablename+"'", 
									lang.some_error_has_occurred+ ": "+
									(bIdIsMissing ? lang.error_table_has_no_row_ids : textStatus+" "+errorThrown+"; "+lexutil.getJqXHRInfo(jqXHR)),
									function(){
										gui.refreshTable(sSomeTablename);
									}
							);
						}
						
					}
				 		
				} );
			}			
						
			// needed, otherwise clicking multiple times causes jeditable to be fired multiple times 
			return(value);
		},
		// end of custom function
			
		// parameters
		{
			"onblur": function(value){
				gui._closeJEditable(this, value);
			},
			"data": function(value, settings) {
				// encoding fix: https://stackoverflow.com/questions/6444668/jeditable-encoding-turns-into-amp-when-editing
				return String(value)
					.replace(/&gt;/g, '>')
					.replace(/&lt;/g, '<')
					.replace(/&#39;/g, "'")
					.replace(/&quot;/g, '"')
					.replace(/&amp;/g, '&')
					.replace(/&nbsp;/g, ' ');
			},
			// we need to update the datatable object in the callback, because
			// if we do it in the previous step of jeditable, it somehow breaks something
			// so the final call 'return(value);' can't help prevent multiple firing anymore...
			"callback": function(value, settings){				
				mt.getDataTableObjectOf(sSomeTablename).cell(this).data(value);				
			},
			"tooltip": lang.click_to_edit,
			"width": "100%",
			"type": "textarea", // this gives more room than the default 'input' field of jEditable
			"placeholder" : "" // prevents filling empty cells with default msg 'Click to edit'
		}
		
	// catch the press ENTER event, 
	// to be able to submit with ENTER within a textarea
	// and also to be able to adapt the size of the area as the text grows etc.
	).click(function(event) {
		
		// in which table are we operating?
		var sThisTable = $(this).closest('table')[0].id;
		
		// keep alignment of columns and searchboxes		
		gui.setSearchboxesCss(sThisTable);
		setTimeout(function(){
			gui.setSearchboxesCss(sThisTable);
		}, 500);
		
		// if rows are being selected, we don't want to edit rows!
		if (mt.rowSelectionIsAllowed(sThisTable))
			{
			// close editor
			var value = $(this).find('textarea').val();
			gui._closeJEditable(this, value);
			
			// handle row selection
			row._rowSelectionHandler(sThisTable, this.parentNode);
			return true;
			}
	
		
		// we must use keydown to prevent default behaviour
	    $(this).find('textarea')
	    .css("overflow", "hidden") // no scrollbars!
	    .keydown(function(event) { 
	    	
	    	// auto-adapt the size of the textarea
	    	// (http://stackoverflow.com/questions/995168/textarea-to-resize-based-on-content-length)
	    	$(this).css("height", "1px");
	    	$(this).css("height", (this.scrollHeight)+"px");	    	
	    	
	    	if (event.which == 13)
        	{
	    		$(this).closest('form').submit();	    		
        	}
	            
	    });
	});
	// end of jEditable for text fields
	
	
	// CHECKBOX CELLS HANDLER
	
	// kill the previously added handler, because
	// since it gets added each time the table is redrawn, so not killing
	// causes multiple handlers to be created and
	// as a consequence multiple ajax requests
	// with the very same content!
	$('#'+sSomeTablename+'_dynamic').off('click', '#'+sSomeTablename+' td.editable_checkbox');
	$('#'+sSomeTablename+'_dynamic').on('click', '#'+sSomeTablename+' td.editable_checkbox', function(){
		
		
		// keep alignment of columns and searchboxes		
		gui.setSearchboxesCss(sSomeTablename);
		
		// if rows are being selected, we don't want to edit rows!
		if (mt.rowSelectionIsAllowed(sSomeTablename))
			{
			// handle row selection
			row._rowSelectionHandler(sSomeTablename, this.parentNode);
			return true;
			}
		
		// if the checkbox wasn't clicked but only the surrounding cell, cancel!
		if ($(this).find("input").is(":focus") == false)
			return true;
		
		// current node 
		var nCurrentNode = this;
		
		// get position information
		var aPos = mt.getDataTableObjectOf(sSomeTablename).cell( nCurrentNode ).index();		
		var sColumnName = mt.getListOfColumnsOf(sSomeTablename)[aPos.column];
		var sColumnType = mt.getListOfColumnTypesOf(sSomeTablename)[aPos.column];
		
		// get the new value of the checkbox
		// (must be contrary of current value, which is actually the value before the click)
		var newValue = gui.getTrueCheckboxValue(sSomeTablename, nCurrentNode);
		// put the new value into the Datatable object too
		mt.getDataTableObjectOf(sSomeTablename).cell(nCurrentNode).data(  lexutil.translateBoolean(newValue) );
		
		// send the checked/unchecked value to the database		
		
		// check if we have a custom editing function from config file
		// if available, it must overrule the normal (following) function
		var oTableConfig = conf.getTableConfig(sSomeTablename);		
		var oColumnConfig = conf.getColumnConfig(oTableConfig, sColumnName);
		var fnEditFunction = conf.getEditFunction(oColumnConfig);
		var fnEditCallback = conf.getEditCallback(oColumnConfig);
		var fnEditErrorHandler = conf.getEditErrorHandler(oColumnConfig);
		var sEditTrigger = conf.getEditTrigger(oColumnConfig);
		
		
		// Special case: we apply the custom edit function
		// If an edit trigger is defined, the edit function is called only 
		// if the cell content matches a given regex stored in the config file 
		// as 'edittrigger', which triggers the custom edit function!
		if (fnEditFunction != null &&
				// no trigger is needed, or trigger is matched
				( sEditTrigger==null || new RegExp(sEditTrigger).test(value) ) )
			{			
			
			conf.getEditFunction(oColumnConfig)(mt.getDataTableObjectOf(sSomeTablename), nCurrentNode, newValue);
			
			// callback function, if it is set in configuration
			if (fnEditCallback!=null)
				fn.message(lang.error_occurred_in_table+ " '"+sSomeTablename+"'", 
					lang.editcallback_warning1+ ".<BR>"+
					lang.editcallback_warning2+ ": "+sSomeTablename+"<BR>"+
					lang.editcallback_warning3+ ": "+sColumnName);
			
			// refresh the tables that config file requires to be refreshed upon editing of current cell
			conf.refreshTables(oColumnConfig);
			}
		
		// normal case: we apply the normal edit function
		else {
			var url = WEBSERV_URL+"/api/setvalue";
			$.ajax( {
				"type": "POST",
				"async": false,
				"url": url,
				"data": {
					"row_id": this.parentNode.getAttribute('id'),
					"db_name": lexutil.getHttpParams().get("db"),
					"table_name": sSomeTablename,
					"column_name": sColumnName,
					"new_value": newValue,
					"value_type": sColumnType, 
					"dummy": lexutil.getUniqueNumber()
					},
			 	"dataType": "xml", // get response as xml
			 	"success": function(xml) {
			 		var oTableConfig = conf.getTableConfig(sSomeTablename);		 		
			 		var oColumnConfig = conf.getColumnConfig(oTableConfig, sColumnName);
			 		var fnEditCallback = conf.getEditCallback(oColumnConfig);
			 		
			 		if (fnEditCallback!=null)
			 			fnEditCallback(mt.getDataTableObjectOf(sSomeTablename), nCurrentNode, newValue);
			 							
			 		// refresh the tables that config file requires to be refreshed upon editing of current cell
			 		conf.refreshTables(oColumnConfig);
			 		
			 	},
				"error": function(jqXHR, textStatus, errorThrown){
					
					if (fnEditErrorHandler != null) {
						fn.removeProcessingMsg(sSomeTablename);
						fnEditErrorHandler({
							"jqXHR": jqXHR, "textStatus": textStatus, "errorThrown": errorThrown, 
							"tableName": sSomeTablename, "columnName": sColumnName, "columnValue": newValue
						});
					}
					else {
						var bIdIsMissing = ($(fn.getRowNode(nCurrentNode)).attr('id') == undefined);
						fn.message(lang.error_occurred_in_table+ " '"+sSomeTablename+"'", 
							lang.some_error_has_occurred+ ": "+
							(bIdIsMissing ? lang.error_table_has_no_row_ids : textStatus+" "+errorThrown+"; "+lexutil.getJqXHRInfo(jqXHR)),
							function(){
								gui.refreshTable(sSomeTablename);
							}
						);
					}
					
				}
			} );			
		}
		
		
	});
	
	// when not editable, a checkbox must be disabled
	$('#'+sSomeTablename+' td.not_editable_checkbox > center > input').removeAttr("disabled");
	$('#'+sSomeTablename+' td.not_editable_checkbox > center > input').attr("disabled", true);
	
	
	// SELECTBOX CELLS HANDLER
	
	for (var i=0; i<mt.getListOfVisibleColumnsOf(sSomeTablename).length; i++) {
		var oTableConfig = 		conf.getTableConfig(sSomeTablename);
		var oColumnConfig =		conf.getColumnConfig(oTableConfig, mt.getListOfVisibleColumnsOf(sSomeTablename)[i]);
		var bColumnEditable =	conf.getEditability(oColumnConfig);
		var sValidatorKey =		conf.getEditSelectValidator(oColumnConfig);
		var sSelectTriggerEvent = 	conf.getSelectTriggerEvent(oColumnConfig);
		var iSelectTriggerEventDelay = conf.getSelectTriggerDelay(oColumnConfig);
		
		// [1] select values from 'choosefrom' in config.js
		var aAllowedValues = 	conf.getSelectionBox(oColumnConfig);
		var aValuesToLabels = 	conf.getSelectionBoxLabels(oColumnConfig);
		
		// [2] ELSE  select values from Postgres ENUM type
		if (aAllowedValues == null)
			aAllowedValues = mt.getListOfAllowedValuesInVisibleColumnsOf(sSomeTablename)[i];		
		
		// if a column has a list allowed values and it is editable
		if (aAllowedValues != '' && bColumnEditable) {			
			
			var aAllRows = fx.getAllRows(sSomeTablename);
			
			aAllRows.every(function(){
				
				var sCellName = 		mt.getListOfVisibleColumnsOf(sSomeTablename)[i];				
				var sValueOfThisCell = 	fx.getDataFromCellInRow( this, sCellName );					
				var nCell = 			fn.getCellInRowNode( this.node(), sCellName );
								
				$(nCell)
					.data("tablename", sSomeTablename)
					.data("cellname", sCellName)
					.data("allowed_values", aAllowedValues)
					.each(function(){
					
					
					// we will implement a function timeout, in such a way that the selectbox only appears when the user stays on the cells a little bit
					// that prevents selectboxes to appear everywhere the mouse goes!
					let mouseoverTimeout;
					
					$(this).on(sSelectTriggerEvent, function(){
						
						const cell = $(this); // Store a reference to the current cell
						mouseoverTimeout = setTimeout(() => {
							
							cell.editable( 
						
								// this comes into action only once some value was chosen in the select-menu
								function(value, settings){
			
									// if rows are being selected, we don't want to edit rows!
									if (mt.rowSelectionIsAllowed(sSomeTablename)) {
										// close editor
										var backValue = (this.revert != value) ? this.revert : value;
										$(this).delay(100).queue(function(){
											$(this).html(backValue); // needs a delay to work
											$(this).dequeue();
											});
											
										
										// handle row selection
										row._rowSelectionHandler(sSomeTablename, this.parentNode);
										return true;
										}
									
									// current node 
									var nCurrentNode = this;
								
									// (needed for the undo registration, which is triggered by change events on cells)
									//if (browser.msie) // here needed for IE
									//	$(nCurrentNode).change();
									
									// instead of submitting an url (default in jEditable)
									// we submit an own function which makes an Ajaxcall
									// (so we control everything!)
									var aPos = mt.getDataTableObjectOf(sSomeTablename).cell( nCurrentNode ).index();
									
									// check if we have a custom editing function from config file
									// if available, it must overrule the normal (following) function
									var oTableConfig = 		conf.getTableConfig(sSomeTablename);
									var sColumnName = 		mt.getListOfColumnsOf(sSomeTablename)[aPos.column];
									var sColumnType = 		mt.getListOfColumnTypesOf(sSomeTablename)[aPos.column];
									var oColumnConfig = 	conf.getColumnConfig(oTableConfig, sColumnName);
									var sValidatorKey =		conf.getEditSelectValidator(oColumnConfig);
									var fnEditFunction =	conf.getEditFunction(oColumnConfig);
									var fnEditCallback = 	conf.getEditCallback(oColumnConfig);
									var fnEditErrorHandler = conf.getEditErrorHandler(oColumnConfig);
									var sEditTrigger = 		conf.getEditTrigger(oColumnConfig);
									
									
									
									
									// validator key check (if required by configuration):
									// if the validator key wasn't pressed, that means selection might
									// have happened by accident, so cancel.
									
									if ( sValidatorKey != null && kf._getPressedKey() != sValidatorKey)
										{					
										// put back original value and leave
										var backValue = (this.revert != value) ? this.revert : value;
										return backValue;
										}					
														
									
									
									// Special case: we apply the custom edit function
									// If an edit trigger is defined, the edit function is called only 
									// if the cell content matches a given regex stored in the config file 
									// as 'edittrigger', which triggers the custom edit function!
									if (fnEditFunction != null &&
											// no trigger is needed, or trigger is matched
											( sEditTrigger==null || new RegExp(sEditTrigger).test(value) ) )
										{
										conf.getEditFunction(oColumnConfig)(mt.getDataTableObjectOf(sSomeTablename), nCurrentNode, value);
										// callcack function, if it is set in configuration
										if (fnEditCallback!=null)
											fnEditCallback(mt.getDataTableObjectOf(sSomeTablename), nCurrentNode, value);
										// refresh the tables that config file requires to be refreshed upon editing of current cell
										conf.refreshTables(oColumnConfig);
									}
									
									// normal case: we apply the normal edit function 
									else {
										gui.showProcessingMsg(sSomeTablename);
										var rowId = this.parentNode.getAttribute('id');
										var url = WEBSERV_URL+"/api/setvalue";
										$.ajax( {
											"type": "POST",
											"async": false,
											"url": url,
											"data": {
												"row_id": rowId,
												"db_name": lexutil.getHttpParams().get("db"),
												"table_name": sSomeTablename,
												"column_name": sColumnName,
												"new_value": value,
												"value_type": sColumnType,
												"dummy": lexutil.getUniqueNumber()
												},
										 	"dataType": "xml", // get response as xml
										 	"success": function(xml) {
										 		gui.removeProcessingMsg(sSomeTablename);
										 		if (gui.getDbResponse(xml))
										 			{
										 			// put the new value into the Datatable object 							 			
										 			mt.getDataTableObjectOf(sSomeTablename).cell(nCurrentNode).data(value);
										 			
										 			// callcack function, if it is set in configuration
										 			if (fnEditCallback!=null)
														fnEditCallback(mt.getDataTableObjectOf(sSomeTablename), nCurrentNode, value);
										 			// refresh the tables that config file requires to be refreshed upon editing of current cell
										 			conf.refreshTables(oColumnConfig);
										 		}
										 		else {
										 			fn.message(lang.error_occurred_in_table+ " '"+sSomeTablename+"'", 
										 					lang.some_error_has_occurred+ " ["+gui.getDbResponse(xml)+"]",
										 					function(){
																gui.refreshTable(sSomeTablename);
															}
										 			);
										 		}
										 	},
											"error": function(jqXHR, textStatus, errorThrown){
												
												if (fnEditErrorHandler != null) {
													fn.removeProcessingMsg(sSomeTablename);
													fnEditErrorHandler({
														"jqXHR": jqXHR, "textStatus": textStatus, "errorThrown": errorThrown, 
														"tableName": sSomeTablename, "columnName": sColumnName, "columnValue": value
														});
												}
												else {
													var bIdIsMissing = ($(fn.getRowNode(nCurrentNode)).attr('id') == undefined);
													fn.message(lang.error_occurred_in_table+ " '"+sSomeTablename+"'", 
															lang.some_error_has_occurred+ ": "+
															(bIdIsMissing ? lang.error_table_has_no_row_ids : textStatus+" "+errorThrown+"; "+lexutil.getJqXHRInfo(jqXHR)),
															function(){
																gui.refreshTable(sSomeTablename);
															}
													);
												}
												
											}
										 		
										} );
									}			
									
								},
								// end of custom function
									
								// parameters
								// NOTE:
								// we added a callback as we need to put the chosen value into the jeditable internal settings
								// in such a way, that jeditable knows that value should be shown as 'selected'
								{
									    //"data": gui._buildDataArrayForJEditable( sSomeTablename, aAllowedValues, sValueOfThisCell, aValuesToLabels ),
									    "data": gui._buildDataArrayForJEditable( sSomeTablename, $(this).closest("td").data("allowed_values"), sValueOfThisCell, aValuesToLabels ),
									    "type": "select",
									    "event": "dblclick",
									    "onblur": "cancel", // function(value){gui._closeJEditable(this, value);},							
										"callback": function(value, settings) {
											value = value.replace("&amp;", "&"); // prevent mismatch of value, as jeditable converts & into &amp;
											settings.data.selected = value;
									     },
										"height": "14px",
								        "width": "100%",
								        "tooltip": (sValidatorKey != null) ? 
								        		lang.press_on +" "+ sValidatorKey +" & " + lang.click_to_edit : lang.click_to_edit,
								        "placeholder" : "" // prevents filling empty cells with default msg 'Click to edit'
								}
							); // end of jEditable for select boxes
							
							// Trigger the editable manually
            				cell.trigger("dblclick");
            				
						}, iSelectTriggerEventDelay);
						
					})
					.on("mouseout blur", function(){
						clearTimeout(mouseoverTimeout);
					});
					
				});
				
				
				
			});
			
			
		}
	};
	
};


// closes Jeditable manually
// see: http://stackoverflow.com/questions/4081040/jeditable-onblur-function
gui._closeJEditable = function(editor, value){

	// in which table are we operating?
	var sThisTable = $(editor).closest('table')[0].id;	
	
	// close the editor
	editor.reset(value);
	
	// update alignment of searchboxes with columns
	gui.setSearchboxesCss(sThisTable);
};


// for jEditable with selectbox input, we need to build an associative array
// of 'select text' to 'select values' to be set as options in the select box
gui._buildDataArrayForJEditable = function( sSomeTableName, aAllowedValues, sValueOfThisCell, aValuesToLabels ){
	
	var aNewArray = new Array();
	for (var i=0; i<aAllowedValues.length; i++)
		{
		var sLabel = aAllowedValues[i];
		// do we have labels instead of bare values?
		if (typeof aValuesToLabels != 'undefined' && aValuesToLabels != null && typeof aValuesToLabels[aAllowedValues[i]] != 'undefined' )
			sLabel = aValuesToLabels[ aAllowedValues[i] ];
		
		aNewArray[ aAllowedValues[i] ] = sLabel;
		}
	aNewArray['selected'] = sValueOfThisCell;
	
	return aNewArray;
};


// return the response of the webservice after a post of data (database modification)
gui.getDbResponse = function(xml){
	
	var response = $(xml).find("response").text();
	return (response == 'OK');
};




// Get the value of a checkbox in the DOM tree (not necessarily same as in database), according to its data type:
// - if bit varying(1), then true=1 and false=0
// - if boolean, then true=TRUE and false=FALSE
gui.getTrueCheckboxValue = function(sSomeTablename, nSomeNode){
	
	// get position information
	var aPos = mt.getDataTableObjectOf(sSomeTablename).cell( nSomeNode ).index();
	
	// is the checkbox checked?
	// prop is the most reliable way (http://jquery-howto.blogspot.nl/2013/02/jquery-test-check-if-checkbox-checked.html)
	var checked = $(nSomeNode).find("input").eq(0).prop("checked") == true;
	
	var isACheckBoxType = 
		$.inArray(mt.getListOfColumnTypesOf(sSomeTablename)[aPos.column], ["bit varying(1)", "boolean"]);
	var bIsBooleanType = 
		mt.getListOfColumnTypesOf(sSomeTablename)[aPos.column] == "boolean";
	var trueValue = bIsBooleanType ? true : 1;
	var falseValue = bIsBooleanType ? false : 0;
	
	return checked ? trueValue : falseValue;
};




// show/hide Processing... message
gui.showProcessingMsg = function(sSomeTablename, bRefreshing){
	if (typeof sSomeTablename == 'object')
		sSomeTablename = fn.getTableName(sSomeTablename);
	
	lexutil.showSpinner("#"+sSomeTablename+"_wrapper", bRefreshing);	
	$("body").css("cursor", "progress");
};
gui.removeProcessingMsg = function(sSomeTablename){
	if (typeof sSomeTablename == 'object')
		sSomeTablename = fn.getTableName(sSomeTablename);
	
	lexutil.removeSpinner("#"+sSomeTablename+"_wrapper");
	$("body").css("cursor", "auto");
};






// make div change color to draw attention to it

gui.highlightDiv = function(sDivName){
	if ( !$.startsWith(sDivName, "#") ) 
		sDivName = "#"+sDivName;
	
	var temporaryColor = "#D8D8D8";
	var currentColor = $(sDivName).css("background-color"); 
	originalBgColor = (typeof originalBgColor == 'undefined' || originalBgColor == '') ? 
			currentColor : originalBgColor;
	$(sDivName).css("background-color", temporaryColor);
};

gui.deHighlightDiv = function(sDivName){
	if ( !$.startsWith(sDivName, "#") ) 
		sDivName = "#"+sDivName;
	
	$(sDivName).css("background-color", originalBgColor);
};



/********************************************************************************************
 *   HIGHLIGHT OF COLUMNS
 */

// highlight whole column at mouseover
// http://datatables.net/examples/api/highlight.html
gui.setColumnHighlight = function(sSomeTableName){
	
	// column highlight is not needed in form view mode
	if (mt.getViewType(sSomeTableName) == 'form')
		{
		$("#"+sSomeTableName+" tbody").off("mouseenter.columnHighlight mouseleave.columnHighlight", "td");
		return;
		}		
	
	// a color map of the cell colors needs to be build
	// (we do it at each table redraw, because if the table contains only one row when it's
	//  called the first time [e.g. because of some applied filters], the map will only contain
	//  the colors of the uneven rows, which is not enough: we need the colors of 
	//  both even and uneven rows)
	gui.buildMapOfCellBackgroundColors(sSomeTableName);
	
	var iNumberOfVisibleColumns = mt.getListOfVisibleColumnsOf(sSomeTableName).length;
	
	// above this number of rows, do nothing because it gets too slow
	var iRowThreshold = 500;
	
	$("#"+sSomeTableName+" tbody").off("mouseenter.columnHighlight mouseleave.columnHighlight", "td");
	
	if ($("#"+sSomeTableName+" tbody tr:not('.group')").length <= iRowThreshold)
		{
		$("#"+sSomeTableName+" tbody tr:not('.group')").on("mouseenter.columnHighlight", "td", 
			function() {				
				// highlight columns
				var iNodeNr = $("#"+sSomeTableName+" tbody td").index(this);
				var iCol = iNodeNr % iNumberOfVisibleColumns;
				$("#"+sSomeTableName+" tbody tr:not('.group')").each(function(i){
					// don't highlight selected columns
					if ($(this).hasClass("selected")) return;
					// give each column the right shaded color
					var iIndexOfTdInMap = iCol+((i%2)*iNumberOfVisibleColumns);
					$(this).find("td:eq("+iCol+")")
					.css("background-color", mt.columnsHighlight_getNodeHighlightColors(sSomeTableName)[iIndexOfTdInMap]);
				});
			
				// keep column header adjustment
				gui.setSearchboxesCss(sSomeTableName);
			});
		$("#"+sSomeTableName+" tbody tr:not('.group')").on("mouseleave.columnHighlight", "td", 
				   function() {					
					// remove highlight from columns
					var iNodeNr = $("#"+sSomeTableName+" tbody td").index(this);
					var iCol = iNodeNr % iNumberOfVisibleColumns;
					$("#"+sSomeTableName+" tbody tr:not('.group')").each(function(i){
						// don't change color attributes of selected columns
						if ($(this).hasClass("selected")) return;
						// give each cell its own color back
						var iIndexOfTdInMap = iCol+((i%2)*iNumberOfVisibleColumns);
						$(this).find("td:eq("+iCol+")")
						.css("background-color", mt.columnsHighlight_getNodeColors(sSomeTableName)[iIndexOfTdInMap]);
					});
				} );
		};

		$("#"+sSomeTableName+" tbody tr:not('.group')").on("click.columnHighlight", "td", function(){
			setTimeout(function(){
				// keep column header adjustment
				gui.setSearchboxesCss(sSomeTableName);
			}, 500);
		});
		
};


// when the table is sorted by a new column, we need to rebuild the map of cell colors
gui.setColumnHighlightResetter = function(sSomeTableName){
	
	// column highlight is not needed in form view mode
	if (mt.getViewType(sSomeTableName) == 'form')
		{
		$("#"+sSomeTableName+" tbody").off("mouseenter.columnHighlight mouseleave.columnHighlight", "td");
		return;
		}
	
	// store default sorting setting
	var iDefaultSortColNr = gui._getTheSortingColumnIndex(sSomeTableName);
			
	mt.columnsHighlight_putSortingColumnForColor(sSomeTableName, iDefaultSortColNr);
	
	// when a new sorting column is chosen, store it
	$("#"+sSomeTableName+"_dynamic").on("click", "#"+sSomeTableName+" thead tr th", function(){
		
		var iColNr = $("#"+sSomeTableName+" thead tr th").index(this);
		mt.columnsHighlight_putSortingColumnForColor(sSomeTableName, iColNr);		
		gui.buildMapOfCellBackgroundColors(sSomeTableName);
	});
};

gui._getTheSortingColumnIndex = function(sSomeTableName){
	
	var oTableConfig = conf.getTableConfig(sSomeTableName);
	var asSortColumns = conf.getDefaultSortingColumns(oTableConfig);
	
	var iVisibleSortColumn = (asSortColumns.length>0) ? 
			fn.getVisibleColumnNumberOf(sSomeTableName, asSortColumns[0]) : -1;
			
	return iVisibleSortColumn;
};


gui.buildMapOfCellBackgroundColors = function(sSomeTableName){
	
	var iNumberOfVisibleColumns = mt.getListOfVisibleColumnsOf(sSomeTableName).length;
	var oTableConfig = conf.getTableConfig(sSomeTableName);
	var iSortColumn = (mt.columnsHighlight_getSortingColumnForColor(sSomeTableName)==null)?
			fn.getSortingColumn(sSomeTableName) : mt.columnsHighlight_getSortingColumnForColor(sSomeTableName);
	
	var aNodeColorsMap = new Array();
	var aNodeHighlightColorsMap = new Array();
	
	$("#"+sSomeTableName+" tbody td").each(function(i){
		
		var iRowNumber = Math.floor(i/iNumberOfVisibleColumns);
		var iColNumber = i%iNumberOfVisibleColumns;
		var sCurrentColumn = mt.getListOfVisibleColumnsOf(sSomeTableName)[iColNumber];
		var oColumnConfig = conf.getColumnConfig(oTableConfig, sCurrentColumn);
		var sCustomBgColor = conf.getBackgroundColor(oColumnConfig);
		// if the current column has some custom color, keep that color.
		// else if the current column is the sorting column, keep the sorting color.
		// else keep the normal colors.		
		var sNeutralBgColor = (sCustomBgColor!=null) ? 
				sCustomBgColor[iRowNumber%2] : 
					(iColNumber==iSortColumn  ? (iRowNumber%2==0 ? "#D3D6FF":"#EAEBFF") : 
						(iRowNumber%2==0 ? "#E2E4FF":"#FFFFFF")); 
		aNodeColorsMap[i] = sNeutralBgColor;
		aNodeHighlightColorsMap[i] = lexutil.shadeColor(sNeutralBgColor, -10);

		if (i==2*iNumberOfVisibleColumns-1) // = t.i. total number of cells in two rows (0-based)
			return false; // break, because we know enough after two rows (odd en even rows)
	});
	mt.columnsHighlight_putNodeColors(sSomeTableName, aNodeColorsMap);
	mt.columnsHighlight_putNodeHighlightColors(sSomeTableName, aNodeHighlightColorsMap);
};

/*
 *   HIGHLIGHT OF COLUMNS (END)
 *******************************************************************************************/




// set the css of the searchboxes (e.g. set same width as table cells etc).

gui.setSearchboxesCss = function(sSomeTableName){
	
	// safe: if the search boxes are not set, leave right away
	if ( !$("#"+sSomeTableName+"_searchboxes").elementExists())
		return;

	// reapply font size
	$("td").css("font-size", iFontSize);
	
	// synchronize with table width, to prevent misalignment 
	$("#"+sSomeTableName+"_searchboxes").css("width", $("#"+sSomeTableName).width());
	
	
	// Compute the width and relative position of each search box.
	// We will use the column names in THEAD as a reference for width, because
	// the THEAD element is always there, even when the table is empty
	// (on the contrary, the TBODY isn't always there)
	
	$("#"+sSomeTableName+"  thead tr:eq(0)").find("th").each(function(i){	
		
		// get the width setting of the table 	
		var iWidth = parseInt($(this).outerWidth());

		// now set the width of the searchboxes according to the table columns

		$("#"+sSomeTableName+"_searchboxes td:eq("+i+")").css("width", iWidth);
		

		// small tune up for particular types of search boxes 

		// filter box type?
		var sCurrentColumnName =	mt.getListOfVisibleColumnsOf(sSomeTableName)[i];
		var sFilterBoxType =		fn.getTypeOfFilterBox(sSomeTableName, sCurrentColumnName);
		
		
		// text and select boxes need to have full width
		if (sFilterBoxType == 'text' || sFilterBoxType == 'select'){
		
			// determine the right selector for searchbox (input or select type)
			// and set its width too
			var searchBoxSelector = (sFilterBoxType == 'select') ? 
					$("#"+sSomeTableName+"_searchboxes td:eq("+i+") select") :
					$("#"+sSomeTableName+"_searchboxes td:eq("+i+") input");
			searchBoxSelector.css("width", "97%");
		}
		
	});	
	
	
	// make searchboxes visible, as they are set now
	$("#"+sSomeTableName+"_searchboxes").css("visibility", "visible");

	// make sure header with is set properly too
	// https://datatables.net/forums/discussion/42938/header-width
	setTimeout(function(){
		$($.fn.dataTable.tables(true)).DataTable().columns.adjust();
	}, 500);
};



// refresh a table, given its name or datatables object
gui.refreshTable = function(oTable){
	
	var sTable = "";
	
	// prevent browser from selecting the whole page upon clicking on a button
	lexutil.clearSelection();
	
	if (typeof oTable == 'string') {
		sTable = oTable; // (primitives are not passed by reference, so this is ok)
		oTable = mt.getDataTableObjectOf(oTable);		
	}
	else {
		sTable = fn.getTableName(oTable);
	}
	
	// do redraw, but keep paging
	oTable.draw(false); 
	
	sf.putCurrentValueInAllSearchBoxes(sTable);
	
	// make sure we can paginate again
	$("#"+sTable+"_wrapper .dataTables_paginate").removeClass("dont_paginate");
	
};


