/**
 * 
 */

var gui = {};

// Config of tiptip calls
// We need the edgeOffset to be minimal 10, otherwise it causes
// some malfunctions where we have mouseenter events, as the appearing of the tooltip
// causes mouseleave and mouseenter events, so it seems!
var oTiptipConfig = {
		defaultPosition: "top", 
		edgeOffset: 10 // never less than 10! (see above)
		};

// put the tooltips of the different column buttons in the table
// if some are set in the config file
gui.putTooltipsOfColumnButtons = function(sSomeTablename){
	
	var oTableConfig = conf.getTableConfig(sSomeTablename);
	
	$("#"+sSomeTablename+" tbody tr").each(function(){
		
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


// align the position of the pagination pane at the bottom of the table
// with the position of the pagination pane at the top
gui.setPositionOfPaginationPane = function(sSomeTableName){
	
	// if we don't paginate, leave straight away
	if (!$("#"+sSomeTableName+"_paginate").elementExists())
		return;
	
	var p = $("#"+sSomeTableName+"_paginate");
	var iHorizontalPosition = p.offset().right;	
	var iWidth = $(".paging_full_numbers").css("width");	
	var iTop = 0;
		
	// If iHorizontalPosition == 0, it usually means we were not able to read p.offset().left
	// because the paginate div wasn't visible. In that case we won't change the css, otherwise
	// the bottom pagination pane will shift to the left, while we expect it to keep in place.
	if (iHorizontalPosition>0)
		{
		$("."+sSomeTableName+"_bottom_pane")
		.css("position", "relative")
		.css("width", iWidth)
		.css("top", iTop)
		.offset( {right: iHorizontalPosition} );		
		}

};






// build the form view
gui.buildFormViewIfRequired = function(sSomeTablename){
	
	// we do this only in the 'form' view type of course!
	if (mt.getViewType(sSomeTablename) == 'table')
		{
		// in table view mode, make sure the TableTools are visible
		$("#"+sSomeTablename+"_wrapper div.DTTT_container").show();		
		return;
		}
	
	// make sure only one row at the time will be shown
	var iNowIndex = fn.getCurrentDisplayStart(sSomeTablename);
	mt.getDataTableObjectOf(sSomeTablename).fnLengthChange(1, false);
	mt.getDataTableObjectOf(sSomeTablename).fnDisplayStart(iNowIndex, false);
	
	// in form view mode, hide the TableTools
	$("#"+sSomeTablename+"_wrapper div.DTTT_container").hide();
		
	
	// remove the built-in datatables row even/odd class names, to prevent row highlight
	// (as a form represents only one row, row highlight is of no use)
	$("#"+sSomeTablename+"_wrapper tr").removeClass("odd");
	$("#"+sSomeTablename+"_wrapper tr").removeClass("even");
	
	// room te keep between top of form and bottom of header
	var iRoomAboveAll = 10;
	
	// compute the cell referential positions etc
	// so as to be able to put the cells at new screen positions
	var nReferentialTd = $("#"+sSomeTablename+"_wrapper ").find("td").eq(0);
	var nReferentialTr = $("#"+sSomeTablename+"_wrapper ").find("tr").eq(0);
	var iBaseLeft = parseInt(nReferentialTd.position().left);
	var iBaseTop = parseInt(nReferentialTd.position().top);
	var iBaseHeight = 25 + // fixed to 25, instead of 'parseInt(nReferentialTr.css("height"))',
	                       // which sometimes causes very ugly layout because of 
	                       // long, thus multilines column names.
		parseInt(nReferentialTr.css("padding-top")) +
		parseInt(nReferentialTr.css("padding-bottom")) +
		parseInt(nReferentialTr.css("margin-top")) +
		parseInt(nReferentialTr.css("margin-bottom"));
	
	// put the cells at new positions (as a form instead of as a table)
	// and add labels 
	$("#"+sSomeTablename+"_wrapper div#"+sSomeTablename+"_cell_label").remove();
	
	var iMaxColumnTitleWidth = gui.getMaxColumnTitleWidth(sSomeTablename);
	
	// compute number of row/columns to be built
	var iNumberOfTableColumns = $("#"+sSomeTablename+"_wrapper thead").find("th").length;
	var aFormDimensions = gui.getFormViewDimensions(sSomeTablename, iMaxColumnTitleWidth, iNumberOfTableColumns);
	var iNumberOfFormColumns  = aFormDimensions[0]; // x
	var iNumberOfFormRows     = aFormDimensions[1]; // y	
	
	
	$("#"+sSomeTablename+"_wrapper").find("td").each(function(i){
		
		var y = i%iNumberOfFormRows ;
		var x = Math.floor(i/iNumberOfFormRows);
		
		// cell labels
		var nReferentialColumn = $("#"+sSomeTablename+"_wrapper thead").find("th").eq(i);
		var sColumnTitle = nReferentialColumn.text();
		var eCellLabel = $("<div></div>")			
			.attr("id", sSomeTablename+"_cell_label")
			.css("width", iMaxColumnTitleWidth)
			.css("background-color", "#E2E4FF")
			.append($("<span></span>").text(sColumnTitle));	
		
		var iNewTop  = iBaseTop + y*iBaseHeight;
		var iNewLeft = iBaseLeft + x*(2*iMaxColumnTitleWidth);
		
		eCellLabel.css("position", "absolute")
			.css("left", iNewLeft)
			.css("top", iNewTop + iRoomAboveAll );
		// tooltip for content, since long text can't be fully read in form view type
		eCellLabel.addClass("tooltip")
			.attr("title", $(this).text());
		$("#"+sSomeTablename+"_wrapper").append(eCellLabel);
		
		// cells 
		// the cells need to be lifted up a bit since they don't have the same height as the titles 
		var iYcorrection = -3; // default padding value is 3 
		$(this).css("position", "absolute")
			.css("left", iNewLeft + iMaxColumnTitleWidth)
			.css("top", iNewTop + iRoomAboveAll + iYcorrection );
		$(this).css("width", iMaxColumnTitleWidth+"px")
			.css("height", iBaseHeight+"px")		
			.css("empty-cells", "show")
			.css("overflow", "hidden")
			.css("display", "inline-block")
			.css("white-space", "nowrap");			
		// tooltip for content, since long text can't be fully read in form view type
		$(this).addClass("tooltip")
			.attr("title", $(this).text());
	});
	
	
	// give the tbody a height to force the bottom pagination pane to shift to the bottom
	
	// compute the needed height
	var iLowestYpos = 9999;
	var iHighestYpos = 0;
	$("#"+sSomeTablename+"_wrapper").find("td").each(function(){
		
		var iYpos = $(this).position().top;
		if (iYpos<iLowestYpos) iLowestYpos = iYpos;
		if (iYpos>iHighestYpos) iHighestYpos = iYpos;
	});		
	// Set the needed height
	$("#"+sSomeTablename+"_wrapper").css("height", "auto");
	var iOriginalTableWrapperHeight = parseInt($("#"+sSomeTablename+"_wrapper").css("height"));
	var iNewHeight = iOriginalTableWrapperHeight+(iHighestYpos-iLowestYpos+iBaseHeight + iRoomAboveAll);
	$("#"+sSomeTablename+"_wrapper").css("height", iNewHeight+"px");
	
	
	// activate tipTip jquery plugin for nice cross-browser tooltips
	// (needs to be reactivated at each draw, so it seeems)
	$(".tooltip").tipTip(oTiptipConfig);
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




// registration of cell changes for undo function
// = change event upon modifying a cell
gui.attachOnCellChangeEvent = function(sSomeTableName){	
	
	// TEXT CELLS
	
	$("#"+sSomeTableName+" td.editable_text").bind("change", function(){
		
		var aPos = mt.getDataTableObjectOf(sSomeTableName).fnGetPosition( this );
		
		// get value of cell
		var sOldValue = this.revert;

		// add event to undo memory stack, consisting
		// of the id of a node, its position in the table, and its old value
		un.addEvent(sSomeTableName, fn.getRowNode(this).getAttribute('id'), aPos[1], sOldValue);
	});	
	
	
	// CHECKBOXES
	
	$("#"+sSomeTableName+" td.editable_checkbox").bind("click", function(){
		
		// if rows are being selected, undo doesn't make sense!
		if (mt.rowSelectionIsAllowed(sSomeTableName))
			return true;
		
		// if the checkbox wasn't clicked but only the surrounding cell, cancel!
		if ($(this).find("input").is(":focus") == false)
			return true;
		
		var aPos = mt.getDataTableObjectOf(sSomeTableName).fnGetPosition( this );
		
		// get value of cell		
		// prop is most reliable (http://jquery-howto.blogspot.nl/2013/02/jquery-test-check-if-checkbox-checked.html)
		var checked = $(this).find("input").eq(0).prop("checked") == true;	
		
		var isACheckBoxType = $.inArray(mt.getListOfColumnTypesOf(sSomeTableName)[aPos[2]], ["bit varying(1)", "boolean"]);
		var bIsBooleanType = mt.getListOfColumnTypesOf(sSomeTableName)[aPos[2]] == "boolean";
		var trueValue = bIsBooleanType ? true : 1;
		var falseValue = bIsBooleanType ? false : 0;
		

		var sOldValue = !checked ? trueValue : falseValue;
		
		// add event to undo memory stack, consisting
		// of the id of a node, its position in the table, and its old value
		un.addEvent(sSomeTableName, fn.getRowNode(this).getAttribute('id'), aPos[1], sOldValue);
		
		
		// give cell element true or false value 
		// (must be contrary of old values, as the checkbox was clicked upon) 
		var bNewValue = checked;
		$(this).find("input").val( bNewValue );
		
	});
	
	
	// SELECT BOXES
	
	$("#"+sSomeTableName+" td.editable_selectbox").bind("change", function(){
		
		// if rows are being selected, undo doesn't make sense!
		if (mt.rowSelectionIsAllowed(sSomeTableName))
			return true;
		
		var aPos = mt.getDataTableObjectOf(sSomeTableName).fnGetPosition( this );
		
		// get value of cell
		var sOldValue = this.revert;

		// add event to undo memory stack, consisting
		// of the id of a node, its position in the table, and its old value
		un.addEvent(sSomeTableName, fn.getRowNode(this).getAttribute('id'), aPos[1], sOldValue);
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
	
	$('td.editable_text', 
			mt.getDataTableObjectOf(sSomeTablename).fnGetNodes()
			
			).editable( 
			
		function(value, settings){
			
			// current node 
			var nCurrentNode = this;
			
			// (needed for the undo registration, which is triggered by change events on cells)
			//if (bowser.msie || bowser.firefox) // here needed for IE and FF
				$(nCurrentNode).change();
			
			// instead of submitting an url (default in jEditable)
			// we submit an own function which makes an Ajax call
			// so we control everything
			var aPos = mt.getDataTableObjectOf(sSomeTablename).fnGetPosition( nCurrentNode );
			
			// check if we have a custom editing function from config file
			// if available, it must overrule the normal (following) function
			var oTableConfig = conf.getTableConfig(sSomeTablename);
			var sColumnName = mt.getListOfColumnsOf(sSomeTablename)[aPos[2]];
			var sColumnType = mt.getListOfColumnTypesOf(sSomeTablename)[aPos[2]];
			var oColumnConfig = conf.getColumnConfig(oTableConfig, sColumnName);
			var fnEditFunction = conf.getEditFunction(oColumnConfig);
			var fnEditCallback = conf.getEditCallback(oColumnConfig);
			var sEditTrigger = conf.getEditTrigger(oColumnConfig);
			
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
					fn.message("Configuratieprobleem", "Gebruik van 'editcallback' bij 'editfunc' is niet toegestaan. " +
							"Gebruik het callbackargument van uw fn.updateDatabase-functie in 'editfunc'. " +
							"Zie de configuratie van tabel '"+sSomeTablename+"' / kolom '"+sColumnName+"' " +
									"in uw configuratiebestand.");
				
				// new input might affect column and searchboxes alignment 
	 			gui.setSearchboxesCss(sSomeTablename);	 			
				// refresh the tables that config file requires to be refreshed upon editing of current cell
				conf.refreshTables(oColumnConfig);				
				}
			
			// normal case: we apply the normal edit function 
			else
				{
				gui.showProcessingMsg(sSomeTablename);
				var rowId = this.parentNode.getAttribute('id');
				var url = "../lexit/lexit/table/setvalue";
				$.ajax( {
					"type": "GET",
					"async": false,
					"url": url,
					"data": {
						"row_id": rowId,
						"db_name": getHttpParams().get("db"),
						"table_name": sSomeTablename,
						"column_name": sColumnName,
						"new_value": value,
						"value_type": sColumnType,
						"dummy": getUniqueNumber()
						},
				 	"dataType": "xml", // get response as xml
				 	"success": function(xml) {
				 		gui.removeProcessingMsg(sSomeTablename);
				 		if (gui.getDbResponse(xml))
				 			{				 			
				 			
				 			// callcack function, if it is set in configuration
				 			if (fnEditCallback!=null)
								fnEditCallback(mt.getDataTableObjectOf(sSomeTablename), nCurrentNode, value);
				 			
				 			// new input might affect column and searchboxes alignment 
				 			gui.setSearchboxesCss(sSomeTablename);				 			
				 			// refresh the tables that config file requires to be refreshed upon editing of current cell
				 			conf.refreshTables(oColumnConfig);	
				 			
				 			}
				 		else
				 			{
				 			fn.message("Fout", "Er is een fout opgetreden ["+gui.getDbResponse(xml)+"]");
				 			}
				 		},
					"error": function(jqXHR, textStatus, errorThrown){
						gui.refreshTable(sSomeTablename);
						mt.getDataTableObjectOf(sSomeTablename).fnDraw();
						fn.message("Fout", "Er is een fout opgetreden: "+
							textStatus+" "+errorThrown);
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
			// we need to update the datatable object in the callback, because
			// if we do it in the previous step of jeditable, it somehow breaks something
			// so the final call 'return(value);' can't help prevent multiple firing anymore...
			"callback": function(value, settings){
				var aPos = mt.getDataTableObjectOf(sSomeTablename).fnGetPosition( this );
				mt.getDataTableObjectOf(sSomeTablename).fnUpdate( value, aPos[0], aPos[2], false );
			},
			"tooltip": "Klik om te bewerken",
			"type": "textarea", // this gives more room than the default 'input' field of jEditable
			"placeholder" : "" // prevents filling empty cells with default msg 'Click to edit'
		}
		
	// catch the press ENTER event, 
	// to be able to submit with ENTER within a textarea
	// and also to be able to adapt the size of the area as the text grows etc.
	).click(function(event) {
		
		var sActiveTable = kf.getActiveTable();
		
		// keep alignment of columns and searchboxes		
		gui.setSearchboxesCss(sActiveTable);
		
		// if rows are being selected, we don't want to edit rows!
		if (mt.rowSelectionIsAllowed(sActiveTable))
			{
			// close editor
			var value = $(this).find('textarea').val();
			gui._closeJEditable(this, value);
			
			// handle row selection
			row._rowSelectionHandler(sActiveTable, this.parentNode);
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
		var aPos = mt.getDataTableObjectOf(sSomeTablename).fnGetPosition( nCurrentNode );		
		var sColumnName = mt.getListOfColumnsOf(sSomeTablename)[aPos[2]];
		var sColumnType = mt.getListOfColumnTypesOf(sSomeTablename)[aPos[2]];
		
		// get the new value of the checkbox
		// (must be contrary of current value, which is actully the value before the click)
		var newValue = gui.getTrueCheckboxValue(sSomeTablename, nCurrentNode);
		
		
		// send the checked/unchecked value to the database		
		
		// check if we have a custom editing function from config file
		// if available, it must overrule the normal (following) function
		var oTableConfig = conf.getTableConfig(sSomeTablename);		
		var oColumnConfig = conf.getColumnConfig(oTableConfig, sColumnName);
		var fnEditFunction = conf.getEditFunction(oColumnConfig);
		var fnEditCallback = conf.getEditCallback(oColumnConfig);
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
			
			// callcack function, if it is set in configuration
			if (fnEditCallback!=null)
				fn.message("Configuratieprobleem", "Gebruik van 'editcallback' bij 'editfunc' is niet toegestaan. " +
						"Gebruik het callbackargument van uw fn.updateDatabase-functie in 'editfunc'. " +
						"Zie de configuratie van tabel '"+sSomeTablename+"' / kolom '"+sColumnName+"' " +
								"in uw configuratiebestand.");
			
			// refresh the tables that config file requires to be refreshed upon editing of current cell
			conf.refreshTables(oColumnConfig);
			}
		
		// normal case: we apply the normal edit function
		else
			{
			var url = "../lexit/lexit/table/setvalue";
			$.ajax( {
				"type": "GET",
				"async": false,
				"url": url,
				"data": {
					"row_id": this.parentNode.getAttribute('id'),
					"db_name": getHttpParams().get("db"),
					"table_name": sSomeTablename,
					"column_name": sColumnName,
					"new_value": newValue,
					"value_type": sColumnType, 
					"dummy": getUniqueNumber()
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
				"error": function(jqXHR, textStatus, errorThrown){fn.message("Fout", "Er is een fout opgetreden: "+
						textStatus+" "+errorThrown);}
				} );			
			}
		
		
	});
	
	// when not editable, a checkbox must be disabled
	$('#'+sSomeTablename+' td.not_editable_checkbox > center > input').removeAttr("disabled");
	$('#'+sSomeTablename+' td.not_editable_checkbox > center > input').attr("disabled", true);
	
	
	// SELECTBOX CELLS HANDLER
	
	for (var i=0; i<mt.getListOfVisibleColumnsOf(sSomeTablename).length; i++)
		{
		var oTableConfig = conf.getTableConfig(sSomeTablename);
		var oColumnConfig = conf.getColumnConfig(oTableConfig, mt.getListOfVisibleColumnsOf(sSomeTablename)[i]);
		var bColumnEditable = conf.getEditability(oColumnConfig);
		
		var aAllowedValues = mt.getListOfAllowedValuesInVisibleColumnsOf(sSomeTablename)[i];		
		
		// if a column has a list allowed values and it is editable
		if (aAllowedValues != '' && bColumnEditable)
			{			
			
			var aAllRows = fn.getAllRows(sSomeTablename);
			
			aAllRows.each(function(j){
				
				var sCellName= mt.getListOfVisibleColumnsOf(sSomeTablename)[i];				
				var sValueOfThisCell = fn.getDataFromCellNamed(sSomeTablename, this, sCellName);	
				
				var eRow = fn.getCellElement(sSomeTablename, this, sCellName);
				
				$(eRow).editable( 
						
					function(value, settings){
						
						// if rows are being selected, we don't want to edit rows!
						if (mt.rowSelectionIsAllowed(sSomeTablename))
							{
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
						if (bowser.msie) // here needed for IE
							$(nCurrentNode).change();
						
						// instead of submitting an url (default in jEditable)
						// we submit an own function which makes an Ajaxcall
						// (so we control everything!)
						var aPos = mt.getDataTableObjectOf(sSomeTablename).fnGetPosition( nCurrentNode );
						
						// check if we have a custom editing function from config file
						// if available, it must overrule the normal (following) function
						var oTableConfig = conf.getTableConfig(sSomeTablename);
						var sColumnName = mt.getListOfColumnsOf(sSomeTablename)[aPos[2]];
						var sColumnType = mt.getListOfColumnTypesOf(sSomeTablename)[aPos[2]];
						var oColumnConfig = conf.getColumnConfig(oTableConfig, sColumnName);
						var fnEditFunction = conf.getEditFunction(oColumnConfig);
						var fnEditCallback = conf.getEditCallback(oColumnConfig);
						var sEditTrigger = conf.getEditTrigger(oColumnConfig);
						
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
						else
							{
							gui.showProcessingMsg(sSomeTablename);
							var rowId = this.parentNode.getAttribute('id');
							var url = "../lexit/lexit/table/setvalue";
							$.ajax( {
								"type": "GET",
								"async": false,
								"url": url,
								"data": {
									"row_id": rowId,
									"db_name": getHttpParams().get("db"),
									"table_name": sSomeTablename,
									"column_name": sColumnName,
									"new_value": value,
									"value_type": sColumnType,
									"dummy": getUniqueNumber()
									},
							 	"dataType": "xml", // get response as xml
							 	"success": function(xml) {
							 		gui.removeProcessingMsg(sSomeTablename);
							 		if (gui.getDbResponse(xml))
							 			{				 			
							 			mt.getDataTableObjectOf(sSomeTablename).fnUpdate( value, aPos[0], aPos[2], false );
							 			// callcack function, if it is set in configuration
							 			if (fnEditCallback!=null)
											fnEditCallback(mt.getDataTableObjectOf(sSomeTablename), nCurrentNode, value);
							 			// refresh the tables that config file requires to be refreshed upon editing of current cell
							 			conf.refreshTables(oColumnConfig);
							 			}
							 		else
							 			{
							 			fn.message("Fout", "Er is een fout opgetreden ["+gui.getDbResponse(xml)+"]");
							 			}
							 		},
								"error": function(jqXHR, textStatus, errorThrown){
									gui.refreshTable(sSomeTablename);
									mt.getDataTableObjectOf(sSomeTablename).fnDraw();
									fn.message("Fout", "Er is een fout opgetreden: "+
										textStatus+" "+errorThrown);
									}
								} );
							}			
						
					},
					// end of custom function
						
					// parameters
					// NOTE:
					// we added a callback as we need to put the choosen value into the jeditable internal settings
					// in such a way, that jeditable knows that value should be shown as 'selected'
					{
						    "data": gui._buildDataArrayForJEditable(sSomeTablename, aAllowedValues, sValueOfThisCell ),
						    "type": "select",
						    "event": "mouseover",
						    "onblur": function(value){
						    	gui._closeJEditable(this, value);
							},							
							"callback": function(value, settings) {
								value = value.replace("&amp;", "&"); // prevent mismatch of value, as jeditable converts & into &amp;
								settings.data.selected = value;
						     },
							"height": "14px",
					        "width": "100%",
					        "tooltip": "Klik om te bewerken",
					        "placeholder" : "" // prevents filling empty cells with default msg 'Click to edit'
					}
				); // end of jEditable for select boxes
				
			});
			
			
			}
		};
	
};

// closes Jeditable manually
// see: http://stackoverflow.com/questions/4081040/jeditable-onblur-function
gui._closeJEditable = function(editor, value){
	
	// close the editor
	editor.reset(value); 
	
	// update alignment of searchboxes with columns
	var sActiveTable = kf.getActiveTable();
	gui.setSearchboxesCss(sActiveTable);
};


// for jEditable with selectbox input, we need to build an associative array
// of 'select text' tot 'select values' to be set as options in the select box
gui._buildDataArrayForJEditable = function(sSomeTableName, aAllowedValues, sValueOfThisCell){
	
	var aNewArray = Array();
	for (var i=0; i<aAllowedValues.length; i++)
		{
		aNewArray[aAllowedValues[i]] = aAllowedValues[i];
		}
	aNewArray['selected'] = sValueOfThisCell;
	return aNewArray;
};


// return the response of the webservice after a post of data (database modification)
gui.getDbResponse = function(xml){
	
	var response = $(xml).find("response").text();
	return (response == 'OK');
};




//get the selected nodes
gui.fnGetAllRows = function( oSomeTable ){
	
	return oSomeTable.$('tr');
};


// get the value of a checkbox, according to its data type
// - if bit varying(1), then true=1 and false=0
// - if boolean, then true=TRUE and false=FALSE
gui.getTrueCheckboxValue = function(sSomeTablename, nSomeNode){
	
	// get position information
	var aPos = mt.getDataTableObjectOf(sSomeTablename).fnGetPosition( nSomeNode );
	
	// is the checkbox checked?
	// prop is the most reliable way (http://jquery-howto.blogspot.nl/2013/02/jquery-test-check-if-checkbox-checked.html)
	var checked = $(nSomeNode).find("input").eq(0).prop("checked") == true;
	
	var isACheckBoxType = 
		$.inArray(mt.getListOfColumnTypesOf(sSomeTablename)[aPos[2]], ["bit varying(1)", "boolean"]);
	var bIsBooleanType = 
		mt.getListOfColumnTypesOf(sSomeTablename)[aPos[2]] == "boolean";
	var trueValue = bIsBooleanType ? true : 1;
	var falseValue = bIsBooleanType ? false : 0;
	
	return checked ? trueValue : falseValue;
};




// show/hide Processing... message
gui.showProcessingMsg = function(sSomeTablename){
	if (typeof sSomeTablename == 'object')
		sSomeTablename = fn.getTableName(sSomeTablename);
	$("#"+sSomeTablename+"_wrapper .dataTables_processing").css('visibility','visible');
	$("html, body").css("cursor", "progress");
};
gui.removeProcessingMsg = function(sSomeTablename){
	if (typeof sSomeTablename == 'object')
		sSomeTablename = fn.getTableName(sSomeTablename);
	$("#"+sSomeTablename+"_wrapper .dataTables_processing").css('visibility','hidden');	
	$("html, body").css("cursor", "auto");
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
	
	if ($("#"+sSomeTableName+" tbody tr").length <= iRowThreshold)
		{
		$("#"+sSomeTableName+" tbody").on("mouseenter.columnHighlight", "td", 
				function() {				
				// highlight columns
				var iNodeNr = $("#"+sSomeTableName+" tbody td").index(this);
				var iCol = iNodeNr % iNumberOfVisibleColumns;
				$("#"+sSomeTableName+" tbody tr").each(function(i){
					// don't highlight selected columns
					if ($(this).hasClass("row_selected")) return;
					// give each column the right shaded color
					var iIndexOfTdInMap = iCol+((i%2)*iNumberOfVisibleColumns);
					$(this).find("td:eq("+iCol+")").css("background-color", mt.columnsHighlight_getNodeHighlightColors(sSomeTableName)[iIndexOfTdInMap]);
				});
			});
		$("#"+sSomeTableName+" tbody").on("mouseleave.columnHighlight", "td", 
				   function() {					
					// remove highlight from columns
					var iNodeNr = $("#"+sSomeTableName+" tbody td").index(this);
					var iCol = iNodeNr % iNumberOfVisibleColumns;
					$("#"+sSomeTableName+" tbody tr").each(function(i){
						// don't change color attributes of selected columns
						if ($(this).hasClass("row_selected")) return;
						// give each cell its own color back
						var iIndexOfTdInMap = iCol+((i%2)*iNumberOfVisibleColumns);
						$(this).find("td:eq("+iCol+")").css("background-color", mt.columnsHighlight_getNodeColors(sSomeTableName)[iIndexOfTdInMap]);
					});
				} );
		}
		
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
		aNodeHighlightColorsMap[i] = shadeColor(sNeutralBgColor, -10);

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
	
	// give searchboxes div little bigger width than the table (prevent line break)
	$("#"+sSomeTableName+"_searchboxes").css("width", (parseInt($("#"+sSomeTableName).css("width"))+500)+"px");
	$("#"+sSomeTableName+"_searchboxes").css("height", "25px");
	
	
	// Compute the width and relative position of each search box.
	// We will use the column names in THEAD as a reference for width, because
	// the THEAD element is always there, even when the table is empty
	// (on the contrary, the TBODY isn't always there)
	$("#"+sSomeTableName+" thead tr:eq(0)").find("th").each(function(i){
		
		var oTableConfig = conf.getTableConfig(sSomeTableName);
		var oColumnConfig = conf.getColumnConfig(oTableConfig, mt.getListOfVisibleColumnsOf(sSomeTableName)[i]);
		
		// set the relative horizontal position to zero, so as to be
		// able to compute the right horizontal correction at each draw
		$("#"+sSomeTableName+"_searchboxes div:eq("+i+")").css("position", "relative");
		$("#"+sSomeTableName+"_searchboxes div:eq("+i+")").css("left", 0);

		// get the width setting of the table 	
		var iPixelCorrection = -4;
		var iWidth = parseInt($(this).width()) + iPixelCorrection;
		var iLeft = parseInt($(this).position().left);
		var iLeftBox = parseInt($("#"+sSomeTableName+"_searchboxes div:eq("+i+")").position().left);
		var iPaddingLeft = parseInt($(this).css("padding-left"));
		var iPaddingRight = parseInt($(this).css("padding-right"));
		
		
		// now set the padding and width of the searchboxes according to the table columns
		
		$("#"+sSomeTableName+"_searchboxes div:eq("+i+")")
			.css("width", iWidth )
			.css("position", "relative")
			.css("left", (iLeft-iLeftBox) );			
		
		// filter box type?
		var sFilterBoxType = (fn.getTypeOfFilterBox(sSomeTableName, mt.getListOfVisibleColumnsOf(sSomeTableName)[i]));
		
		// checkboxes need to be centered
		if (sFilterBoxType == 'checkbox')
			{
			$("#"+sSomeTableName+"_searchboxes div:eq("+i+")")
				.css("text-align", "center")
				.css("padding-left", iPaddingLeft)
				.css("padding-right", iPaddingRight);
			}
		// text and select boxes need to have full width
		if (sFilterBoxType == 'text' || sFilterBoxType == 'select')
			{
			iWidth += iPaddingLeft + iPaddingRight - 2;
			}
		
		// determine the right selector for searchbox (input or select type)
		// and set its width too
		var searchBoxSelector = (sFilterBoxType == 'select') ? 
				$("#"+sSomeTableName+"_searchboxes div:eq("+i+") select") :
					$("#"+sSomeTableName+"_searchboxes div:eq("+i+") input");
		searchBoxSelector.css("width", iWidth);			

	});	
	
	
	// make searchboxes visible, as they are set now
	$("#"+sSomeTableName+"_searchboxes").css("visibility", "visible");
	
};



// refresh a table, given its name or datatables object
gui.refreshTable = function(oTable){
	
	var sTable = "";
	
	// prevents IE from selecting the whole page upon clicking on a button
	clearSelection();
	
	if (typeof oTable == 'string')
		{
		sTable = oTable;
		oTable = mt.getDataTableObjectOf(oTable);		
		}
	else
		{
		sTable = fn.getTableName(oTable);
		}
	
	// do we have a normal table with pagination or an infinite list?
	// (that requires different ways of refreshing)
	
	var searchBoxesFound = $("#"+fn.getTableName(oTable)+"_searchboxes div");
	// no searchboxes means we have an infinite list: refresh the normal way
	if (searchBoxesFound.length == 0)
		{		
		oTable.fnDraw(false);
		}
	// we have a normal table with pagination: refresh and keep pagination
	else	
		{
		// this is a hack, see fnStandingRedraw() at http://datatables.net/plug-ins/api
		var oSettings = oTable.fnSettings();
		oSettings.oApi._fnDraw(oSettings);
		// keep search values visible in the search boxes
		sf.putCurrentValueInAllSearchBoxes(sTable);
		}
	
};


