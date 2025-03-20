/**
 * 
 */


var ssr = {};


// build the search and replace interface
// this is a subroutine of head.putSearchAndReplaceButton

ssr.buildSearchAndReplaceDiv = function(sSomeTablename){
	
	
	// we build a div with a form in it:
	// - a column select (search and replace will be applied there)
	// - an input field for search pattern and
	// - an input field for string replacement
	// - some buttons: test, replace and quit
	var div = $("<div></div>")
	.addClass("top")
	.css("background-color", "#D8F781")
	.attr("id", sSomeTablename+"_search_and_replace")
	.css("display", "block")
	.css("height", $("#"+sSomeTablename+"_wrapper").find("div.top").css("height")) // make sure we keep same size as table header
	.hide();
	var form = $("<form></form>").attr("action", "");
	
	
	// if the table is not editable, show an error message immediately
	if ( !conf.tableHasSomeEditableTextFields(sSomeTablename))
		{
		div.append(
				$("<span></span>")
				.css("text-align", "center")
				.css("font-weight", "bold")
				.text(lang.header_search_and_replace_denied+ ".")
				);
		// close button, meant to leave back to the main interface
		var close_button = $("<button/>")
		.attr("type", "button")
		.html(lang.close)
		.css("margin-left", "20px")
		.bind("click", function(){
			
			$("#"+sSomeTablename+"_search_and_replace").hide("slow");
			$("#"+sSomeTablename+"_search_and_replace").delay(500).queue( function(){$(this).remove(); $(this).dequeue();} );
			$("#"+sSomeTablename+"_wrapper div.top").show("slow");
			row.clearRowSelectionInAllTables();		
			
		});
		div.append(close_button);
		return div;
		}
	
	// title
	
	var titleAndButtonDiv = $("<div></div>");
	var titleDiv = $("<div></div>");
	var buttonDiv = $("<div></div>").css("margin-left", "30px");
	
	titleDiv.append(
			$("<span></span>")
			.css("font-weight", "bold")
			.css("font-size", "120%")
			.text(lang.header_search_and_replace_button+ " ")
			);
	titleDiv.append(
			$("<span></span>")
			.text(lang.header_search_and_replace_safemode)
			);
	buttonDiv.append( ssr.buildSelectionButton(sSomeTablename) );
	
	titleAndButtonDiv.append(titleDiv.css("display", "inline-block"));
	titleAndButtonDiv.append(buttonDiv.css("display", "inline-block"));
	div.append(titleAndButtonDiv).append($("<br/>"));
	
	
	
	
	// column selection part
	var column_to_alter_txt = $("<span></span>").text(" "+ lang.header_search_and_replace_in +" ");
	var column_to_alter = $("<div></div>").attr("id", sSomeTablename+"_column_to_alter").css("display", "inline");	
	var selectColumnTag = $("<select></select>").attr("id", sSomeTablename+"_selected_column");
	
	
	var oTableConfig = conf.getTableConfig(sSomeTablename);
	for (var i=0; i<mt.getListOfVisibleColumnsOf(sSomeTablename).length; i++)
		{
		var column_name = mt.getListOfVisibleColumnsOf(sSomeTablename)[i];
		var colume_type = mt.getListOfTypesOfVisibleColumnsOf(sSomeTablename)[i];
		
		// if the column is editable and it is a text column, 
		// than add its name in list of column to edit		
		var colconfig = conf.getColumnConfig( oTableConfig, column_name);
		if ( conf.getEditability(colconfig) && $.inArray(colume_type, ['bit varying(1)', 'boolean'])<0 )
			{
			selectColumnTag.append(
					$("<option></option>")
					.attr("value", column_name)
					.text(column_name)
					);
			someColumnsAreEditable = true;
			}
		}
	
	column_to_alter.append(selectColumnTag);
	

	// action selection part
	
	var action_to_perform = $("<div></div>").attr("id", sSomeTablename+"_action_to_perform").css("display", "inline");
	var selectActionTag = $("<select></select>").attr("id", sSomeTablename+"_selected_action");
	
	selectActionTag.append(
			$("<option></option>")
			.attr("value", "update")
			.text(lang.header_search_and_replace_replacethisby+ ":")
			);
	selectActionTag.append(
			$("<option></option>")
			.attr("value", "insert")
			.text(lang.header_search_and_replace_addthis+ ":")
			);
	
	action_to_perform.append(selectActionTag);
	
	
	// input fields for search and replace values
	var old_and_new_value = $("<div></div>").attr("id", sSomeTablename+"_old_and_new_value").css("display", "inline");
	var old_string_txt = $("<span></span>").text(lang.header_search_and_replace_searchforthis+ " ");
	var old_string = $("<input/>")
		.attr("type", "text").attr("id", sSomeTablename+"_old_string");
	var new_string_txt = $("<span></span>").text(" "+ lang.header_search_and_replace_and+ " ");
	var new_string = $("<input/>")
		.attr("type", "text").attr("id", sSomeTablename+"_new_string");
	
	old_and_new_value.append(old_string_txt);
	old_and_new_value.append(old_string);
	
	old_and_new_value.append(column_to_alter_txt);
	old_and_new_value.append(column_to_alter);
	
	old_and_new_value.append(new_string_txt);
	old_and_new_value.append($("<span></span>").text(" "));
	old_and_new_value.append(action_to_perform);
	old_and_new_value.append($("<span></span>").text(" "));
	old_and_new_value.append(new_string);

	// append it all to the form
	form.append(old_and_new_value);	
	
	// buttons
	var buttons_span = $("<span></span>").attr("id", sSomeTablename+"_buttons_span");
	
	// test button
	var test_button = $("<button/>")
	.attr("type", "button")
	.attr("class", "onego_button")
	.html(lang.header_search_and_replace_test)
	.bind("click", function(){
		ssr.alterTable(sSomeTablename, false);
	});
	buttons_span.append(test_button);
	
	// execute button
	var execute_button = $("<button/>")
	.attr("type", "button")
	.attr("class", "onego_button")
	.html(lang.carryout)
	.css("margin-right", "20px")
	.bind("click", function(){
		ssr.alterTable(sSomeTablename, true);
		$("#"+sSomeTablename+"_wrapper .onego_button").attr("disabled", "disabled");
	});
	buttons_span.append(execute_button);
	
	
	// clear fields button
	var clearfields_button = $("<button/>")
	.attr("type", "button")
	.attr("class", "onego_button")
	.html(lang.header_search_and_replace_emptyfields)
	.bind("click", function(){
		$("#"+sSomeTablename+"_old_string").val("");
		$("#"+sSomeTablename+"_new_string").val("");
	});
	buttons_span.append(clearfields_button);
	
	// close button, meant to leave back to the main interface
	var close_button = $("<button/>")
	.attr("type", "button")
	.attr("id", sSomeTablename+"_searchandreplace_close_button")
	.html(lang.close)
	.bind("click", function(){
		
		// remember the search and replace settings for the next time (to allow reuse, often convenient)
		mt.putPreviousOldString(sSomeTablename, $("#"+sSomeTablename+"_old_string").val());
		mt.putPreviousNewString(sSomeTablename, $("#"+sSomeTablename+"_new_string").val());
		mt.putPreviousColumnToAlter(sSomeTablename, $("#"+sSomeTablename+"_selected_column").val());
		mt.putPreviousActionToPerform(sSomeTablename, $("#"+sSomeTablename+"_selected_action").val());
		
		// remove functions for js garbage collector
		$("#"+sSomeTablename+"_dynamic").off("click", 
				"#"+sSomeTablename+"_wrapper #"+sSomeTablename+"_search_and_replace button.functions_are_asleep");
		$("#"+sSomeTablename+"_dynamic").off("click", 
				"#"+sSomeTablename+"_wrapper #"+sSomeTablename+"_search_and_replace button.functions_are_awake");
		
		$("#"+sSomeTablename+"_search_and_replace").hide("slow");
		$("#"+sSomeTablename+"_search_and_replace").delay(500).queue( function(){
			$(this).remove(); $(this).dequeue();
			} );
		$("#"+sSomeTablename+"_wrapper div.top").show("slow");
		row.clearRowSelectionInAllTables();		
		
	});
	buttons_span.append(close_button);
	
	form.append(buttons_span);	
	
	// append the form to the div
	div.append(form);
	
	
	return div;
};




ssr.buildSelectionButton = function(sSomeTablename){
	
	// is this button allowed according to configuration?
	var aTableSettings = conf.getTableSettings(sSomeTablename);
	if ( !conf.getSelectionButton(aTableSettings)) return $("<span/>");
	
	// what is the current setting of the button?
	var bRowSelectionAllowed = mt.rowSelectionIsAllowed(sSomeTablename);
	var sButtonMsg = bRowSelectionAllowed ? lang.turn_row_selection_off : lang.turn_row_selection_on;
	var sBackgroundColor = bRowSelectionAllowed ? "#EE0000" : "#99CCFF";
	var sFunctionAwakeOrAsleep = bRowSelectionAllowed ? "functions_are_asleep" : "functions_are_awake";
		
	
	// button to activate/deactivate selection mode
	var eSelectionButton = $("<button/>")
		.attr("type", "button")
		.attr("id", "selectionbutton")
		.css("background-color", sBackgroundColor)
		.addClass(sFunctionAwakeOrAsleep)		
		.append($("<span></span>").addClass("ui-icon ui-icon-pin-s"))
		.attr("title", sButtonMsg).addClass("tooltip");
	
	$(".tooltip").tipTip( gui.getTiptipConfig() );
	
	// functions activation and deactivation, depending on elements clicked on
	$("#"+sSomeTablename+"_dynamic").on("click", 
			"#"+sSomeTablename+"_wrapper #"+sSomeTablename+"_search_and_replace button.functions_are_awake", 
			function(){	
		
		mt.putRowSelectionIsAllowed(sSomeTablename, true);
		
		// disable the checkboxes to make sure those won't be (un)checked during row selection 
		$('#'+sSomeTablename+' td.editable_checkbox input').attr("disabled", true);
				
		// give button the right settings
		$("#"+sSomeTablename+"_wrapper #"+sSomeTablename+"_search_and_replace #selectionbutton")
			.css("background-color", "#EE0000")
			.attr("title", lang.turn_row_selection_off).addClass("tooltip");
		$("#"+sSomeTablename+"_wrapper #"+sSomeTablename+"_search_and_replace #selectionbutton")
			.delay(500).removeClass("functions_are_awake").addClass("functions_are_asleep");
		
		$(".tooltip").tipTip( gui.getTiptipConfig() );
		
	});
	$("#"+sSomeTablename+"_dynamic").on("click", 
			"#"+sSomeTablename+"_wrapper #"+sSomeTablename+"_search_and_replace button.functions_are_asleep", 
			function(){		
		
		mt.putRowSelectionIsAllowed(sSomeTablename, false);
		
		// re-enable checkboxes after those have been disabled when selection modus was put on
		$('#'+sSomeTablename+' td.editable_checkbox input').attr("disabled", false);		
		
		// give button the right settings
		$("#"+sSomeTablename+"_wrapper #"+sSomeTablename+"_search_and_replace #selectionbutton")
			.css("background-color", "#99CCFF")
			.attr("title", lang.turn_row_selection_on).addClass("tooltip");
		$("#"+sSomeTablename+"_wrapper #"+sSomeTablename+"_search_and_replace #selectionbutton")
			.delay(500).removeClass("functions_are_asleep").addClass("functions_are_awake");
		
		$(".tooltip").tipTip( gui.getTiptipConfig() );
		
		// remove row selection
		fx.unselectAllRows(sSomeTablename);
	});

	return eSelectionButton;
};





// search and replace content
// subroutine of  ssr.buildSearchAndReplaceDiv

ssr.alterTable = function(sSomeTablename, bReallyChange){

	
	var sOldString 		= $("#"+sSomeTablename+"_wrapper " +
			"#"+sSomeTablename+"_search_and_replace " +
			"#"+sSomeTablename+"_old_string").val();
	var sNewString 		= $("#"+sSomeTablename+"_wrapper " +
			"#"+sSomeTablename+"_search_and_replace " +
			"#"+sSomeTablename+"_new_string").val();
	var sSelectedColumn	= $("#"+sSomeTablename+"_wrapper " +
			"#"+sSomeTablename+"_search_and_replace " +
			"#"+sSomeTablename+"_selected_column").val();
	var sSelectedAction	= $("#"+sSomeTablename+"_wrapper " +
			"#"+sSomeTablename+"_search_and_replace " +
			"#"+sSomeTablename+"_selected_action").val();
	
	
	// if nor pattern nor replacement string is filled in, stop right away
	if (sOldString == '' && sNewString == '' )
		return;
	
	// first check is some selection is made
	var oRowsToProcess = row.getSelectedRowsFrom(sSomeTablename);
	
	// if no selection is made, we process all rows
	if ( oRowsToProcess.count() == 0 ) 
		oRowsToProcess = mt.getDataTableObjectOf(sSomeTablename).rows();
	
	// now process the table with the search & replace request
	
	// arrays with data needed for the server to perform the database update
	var rowIds = 			new Array();
	var newValues = 		new Array();
	var indexOfColumn = 	$.inArray(sSelectedColumn, mt.getListOfColumnsOf(sSomeTablename));
	var trueIndexOfColumn =	$.inArray(sSelectedColumn, mt.getListOfVisibleColumnsOf(sSomeTablename));
	
	// first clean rows from possible test output from a previous alterTable call
	// t.i. restore original content
	(fx.getAllRows(sSomeTablename)).every(function(){
		
		// get the data of cell in current row
		// data can return an object or an array 
		
		var oRowData = this.data();
		var sCell = (typeof oRowData == 'object') ?
				 oRowData[sSelectedColumn] : oRowData[indexOfColumn];
		
		$(this.node()).find("td").eq(trueIndexOfColumn).html(sCell);
	})
		
	
	// now process each row with replacement command
	oRowsToProcess.every(function(){
		
		// get the data of cell in current row
		// data can return an object or an array
		
		var oRowData = this.data();
		var sCell = (typeof oRowData == 'object') ?
				oRowData[sSelectedColumn] : oRowData[indexOfColumn];		
		
		// apply replace pattern 
		var pattern = new RegExp(sOldString, "i");
		var match = pattern.exec(sCell) ;
		
				
		if ( ( match != null && match != "" )		// if we have a non-empty match  
				|| 									//    OR
			 ( sCell == '' && sOldString == '^$') )	//    we have an empty input and wish to capture just that!
			{
			var sNewValue = sCell.replace(pattern, sNewString);
			var sTestValue = sCell + " <b>>> "+sNewValue+"</b>";
			
			// update the html table without updating the database
			// this enables the user to test its action before really performing it 
			$(this.node()).find("td").eq(trueIndexOfColumn).html(sTestValue);
			
			if (bReallyChange)
				{
				$(this.node()).find("td").eq(trueIndexOfColumn).html(sNewValue);
				rowIds.push( this.node().id );
				newValues.push(sNewValue);
				}
			}
	});
	
	// we collected all the cells to update, now send it all to the database
	if (bReallyChange)
		{
		// disable the close button for the duration of the database call
		// this is to prevent showing the table content again before all changes are performed
		$("#"+sSomeTablename+"_searchandreplace_close_button").attr("disabled", "disabled");
		gui.showProcessingMsg(sSomeTablename);
		
		// If the current view already have some search box filter,
		// set the table filters to filter now both search and replacement string
 		// so as to get to see both old and new records at refresh
		// (we do it only if the new string doesn't contain backreferences, otherwise it won't work)
		
		var sCurrentSearchBoxValue = fn.getValueOfFilterBox(sSomeTablename, sSelectedColumn);
		
		if (sNewString.indexOf("$")<0 && sCurrentSearchBoxValue != '')
			{
			// modify the filter setting, so the table
			//   keeps showing the modified content (which doesn't meet the 'old' filter setting). 
			
				var filtersToShowChanges = new Array();
		 		filtersToShowChanges[sSelectedColumn] = sOldString.replace(/(\w+)/i, "($1|"+sNewString+")");
		 		mt.getDataTableObjectOf(sSomeTablename).addSearchFilters(filtersToShowChanges);
			} 		
		
		if (sSelectedAction == 'insert')
			{
			var url = WEBSERV_URL+"/api/insertmodified";
			
			// build list of columns to copy
			var columnsToCopy = conf.getListOfColumnsToCopyUponInsert(sSomeTablename);
			
			$.ajax( {
				"type": "GET",
				"url": url,
				"data": {
					"async": false,
					"row_id": rowIds.join(ARG_INTERNAL_SEPARATOR),
					"db_name": lexutil.getHttpParams().get("db"),
					"table_name": sSomeTablename,
					"filter_column_name": sSelectedColumn,
					"filter_value": sOldString,
					"replacement_value": sNewString,
					"column_to_copy": columnsToCopy.join(ARG_INTERNAL_SEPARATOR),					
					"dummy": lexutil.getUniqueNumber() 
					},
			 	"dataType": "xml", // get response as xml
			 	"success": function(xml) {
			 		gui.removeProcessingMsg(sSomeTablename);
			 		// re-enable close button
		 			$("#"+sSomeTablename+"_searchandreplace_close_button").removeAttr("disabled");
		 			
		 			// refresh the table, so the internal table representation is also up-to-date
		 			// (otherwise a new replacement without refresh will cause a crash)
		 			gui.refreshTable(sSomeTablename);
		 			
			 		if (!gui.getDbResponse(xml))
			 			{			 			
			 			fn.message(lang.error_occurred_in_table+ " '"+sSomeTablename+"'", lang.some_error_has_occurred+ " ["+gui.getDbResponse(xml)+"]");
			 			}
			 		},
				"error": function(jqXHR, textStatus, errorThrown){
					
					fn.message(lang.error_occurred_in_table+" '"+sSomeTablename+"'", 
							lang.some_error_has_occurred+": "+textStatus+" "+errorThrown,
							function(){
								gui.refreshTable(sSomeTablename);
							}
					);
					// re-enable close button
		 			$("#"+sSomeTablename+"_searchandreplace_close_button").removeAttr("disabled");
					}
				} );
			}
		else if (sSelectedAction == 'update')
			{
			var url = WEBSERV_URL+"/api/setvalue";
			
			$.ajax( {
				"type": "GET",
				"url": url,
				"data": {
					"async": false,
					"row_id": rowIds.join(ARG_INTERNAL_SEPARATOR),
					"db_name": lexutil.getHttpParams().get("db"),
					"table_name": sSomeTablename,
					"column_name": sSelectedColumn,
					"new_value": newValues.join(ARG_INTERNAL_SEPARATOR), 
					"dummy": lexutil.getUniqueNumber() 
					},
			 	"dataType": "xml", // get response as xml
			 	"success": function(xml) {
			 		gui.removeProcessingMsg(sSomeTablename);
		 			// re-enable close button
		 			$("#"+sSomeTablename+"_searchandreplace_close_button").removeAttr("disabled");
		 			
		 			// refresh the table, so the internal table representation is also up-to-date
		 			// (otherwise a new replacement without refresh will cause a crash)
		 			gui.refreshTable(sSomeTablename);
		 			
			 		if (!gui.getDbResponse(xml))
			 			{			 			
			 			fn.message(lang.error_occurred_in_table+ " '"+sSomeTablename+"'", lang.some_error_has_occurred+ " ["+gui.getDbResponse(xml)+"]");
			 			}
			 		},
				"error": function(jqXHR, textStatus, errorThrown){
					
					fn.message(lang.error_occurred_in_table+" '"+sSomeTablename+"'", 
							lang.some_error_has_occurred+": "+textStatus+" "+errorThrown,
							function(){
								gui.refreshTable(sSomeTablename);
								}
					);
					// re-enable close button
		 			$("#"+sSomeTablename+"_searchandreplace_close_button").removeAttr("disabled");
					}
				} );
			}
		
		}
};