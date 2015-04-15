/**
 * 
 */


var ssr = {};


//build the search and replace interface
//this is a subroutine of head.putSearchAndReplaceButton

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
	.hide();
	var form = $("<form></form>").attr("action", "");
	
	
	// if the table is not editable, show an error message immediately
	if ( !conf.tableHasSomeEditableTextFields(sSomeTablename))
		{
		div.append(
				$("<span></span>")
				.css("text-align", "center")
				.css("font-weight", "bold")
				.text("De tekstvelden van deze tabel mogen niet bewerkt worden.")
				);
		// close button, meant to leave back to the main interface
		var close_button = $("<button/>")
		.attr("type", "button")
		.html("Sluiten")
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
	div.append(
			$("<span></span>")
			.css("font-weight", "bold")
			.css("font-size", "120%")
			.text("Zoek & Bewerk ")
			);
	div.append(
			$("<span></span>")
			.text("(veilige modus: bewerking beperkt zich tot de schermgegevens)")
			.append($("<br/>")).append($("<br/>"))
			);
	
	
	// column selection part
	var column_to_alter_txt = $("<span></span>").text(" in ");
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
			.text("vervang het door:")
			);
	selectActionTag.append(
			$("<option></option>")
			.attr("value", "insert")
			.text("voeg dit toe:")
			);
	
	action_to_perform.append(selectActionTag);
	
	
	// input fields for search and replace values
	var old_and_new_value = $("<div></div>").attr("id", sSomeTablename+"_old_and_new_value").css("display", "inline");
	var old_string_txt = $("<span></span>").text("Zoek dit [regex] ");
	var old_string = $("<input/>")
		.attr("type", "text").attr("id", sSomeTablename+"_old_string");
	var new_string_txt = $("<span></span>").text(" en ");
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
	.html("Test effect")
	.bind("click", function(){
		ssr.alterTable(sSomeTablename, false);
	});
	buttons_span.append(test_button);
	
	// execute button
	var execute_button = $("<button/>")
	.attr("type", "button")
	.attr("class", "onego_button")
	.html("Uitvoeren")
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
	.html("Velden legen")
	.bind("click", function(){
		$("#"+sSomeTablename+"_old_string").val("");
		$("#"+sSomeTablename+"_new_string").val("");
	});
	buttons_span.append(clearfields_button);
	
	// close button, meant to leave back to the main interface
	var close_button = $("<button/>")
	.attr("type", "button")
	.attr("id", sSomeTablename+"_searchandreplace_close_button")
	.html("Sluiten")
	.bind("click", function(){
		
		// remember the search and replace settings for the next time (to allow reuse, often convenient)
		mt.putPreviousOldString(sSomeTablename, $("#"+sSomeTablename+"_old_string").val());
		mt.putPreviousNewString(sSomeTablename, $("#"+sSomeTablename+"_new_string").val());
		mt.putPreviousColumnToAlter(sSomeTablename, $("#"+sSomeTablename+"_selected_column").val());
		mt.putPreviousActionToPerform(sSomeTablename, $("#"+sSomeTablename+"_selected_action").val());
		
		$("#"+sSomeTablename+"_search_and_replace").hide("slow");
		$("#"+sSomeTablename+"_search_and_replace").delay(500).queue( function(){$(this).remove(); $(this).dequeue();} );
		$("#"+sSomeTablename+"_wrapper div.top").show("slow");
		row.clearRowSelectionInAllTables();		
		
	});
	buttons_span.append(close_button);
	
	form.append(buttons_span);
	
	// advanced search and replace function link
	var advancedsearch_link = $("<button/>")
	.attr("type", "button")
	.attr("class", "onego_button styled-button-2")
	.css("margin-left", "40px")
	.text("Onveilige modus")
	.bind("click", function(){
		$("#"+sSomeTablename+"_search_and_replace").remove();
		$("#"+sSomeTablename+"_wrapper div.top").before( asr.buildAdvancedSearchAndReplaceDiv(sSomeTablename) );
		$("#"+sSomeTablename+"_search_and_replace").show();
		
	});
	
	// if advanced search button is unlocked (in configuration), show it, otherwise hide it!
	if ( conf.advancedSearchAndReplaceIsUnlocked( conf.getTableSettings(sSomeTablename) ) )
		buttons_span.append(advancedsearch_link);	
	
	// append the form to the div
	div.append(form);
	
	
	return div;
};







// search and replace content
// subroutine of  ssr.buildSearchAndReplaceDiv

ssr.alterTable = function(sSomeTablename, bReallyChange){

	
	var sOldString 		= $("#"+sSomeTablename+"_old_string").val();
	var sNewString 		= $("#"+sSomeTablename+"_new_string").val();
	var sSelectedColumn	= $("#"+sSomeTablename+"_selected_column").val();
	var sSelectedAction	= $("#"+sSomeTablename+"_selected_action").val();
	
	
	// if nor pattern nor replacement string is filled in, stop right away
	if (sOldString == '' || sNewString == '' )
		return;
	
	// first check is some selection is made
	var aRowsToProcess = row.getSelectedRowsFrom(sSomeTablename);
	var bSelectionOnly = aRowsToProcess.length>0;
	// if no selection is made, we process all rows
	if ( !bSelectionOnly ) aRowsToProcess = $("#"+sSomeTablename+" tbody tr");
	
	// now process the table with the search & replace request
	
	// arrays with data needed for the server to perform the database update
	var rowIds = new Array();
	var newValues = new Array();
	var indexOfColumn = $.inArray(sSelectedColumn, mt.getListOfColumnsOf(sSomeTablename));
	var trueIndexOfColumn = $.inArray(sSelectedColumn, mt.getListOfVisibleColumnsOf(sSomeTablename));
	
	// first clean rows from possible test output from a previous altertable call
	// t.i. restore original content
	$("#"+sSomeTablename+" tbody tr").each(function(){
		// get the data of cell in current row
		var sCell = mt.getDataTableObjectOf(sSomeTablename).fnGetData(this, indexOfColumn);
		$(this).find("td").eq(trueIndexOfColumn).html(sCell);
	});
	
	// now process each row with replacement command
	aRowsToProcess.each(function(){
		
		// get the data of cell in current row
		var sCell = mt.getDataTableObjectOf(sSomeTablename).fnGetData(this, indexOfColumn);
		
		// apply replace pattern 
		var pattern = new RegExp(sOldString, "i");
		var match = pattern.exec(sCell) ;
		
		if ( match != null && match != "" )
			{
			var sNewValue = sCell.replace(pattern, sNewString);
			var sTestValue = sCell + " <b>>> "+sNewValue+"</b>";
			
			// update the html table without updating the database
			// this enables the user to test its action before really performing it 
			$(this).find("td").eq(trueIndexOfColumn).html(sTestValue);
			
			if (bReallyChange)
				{
				$(this).find("td").eq(trueIndexOfColumn).html(sNewValue);
				rowIds.push(this.id);
				newValues.push(sNewValue);
				}
			}
	});
	
	// we collected al the cells to update, now send it all to the database
	if (bReallyChange)
		{
		// disable the close button for the duration of the database call
		// this is to prevent showing the table content again before all changes are performed
		$("#"+sSomeTablename+"_searchandreplace_close_button").attr("disabled", "disabled");
		gui.showProcessingMsg(sSomeTablename);
		
		// set the table filters to filter now both search and replacement string
 		// so as to get to see both old and new records at refresh
		// (we do it only if the new string doesn't contain backreferences, otherwise it won't work)
		if (sNewString.indexOf("$")<0)
			{
			// Is the modified column a sorting column?
			// - If so, we need to carry on and modify the filter setting, so the table
			//   keeps showing the modified content (which doesn't meet the 'old' filter setting). 
			// - If not, we needn't do anything, as the modified content will not affect the view
			//   as the table is not sorted by this column.
			var aSortingColumns = fn.getSortingColumns(sSomeTablename);
			if ($.inArray(sSelectedColumn, aSortingColumns)>-1)
				{
				var filtersToShowChanges = new Array();
		 		filtersToShowChanges[sSelectedColumn] = sOldString.replace(/(\w+)/i, "($1|"+sNewString+")");
		 		mt.getDataTableObjectOf(sSomeTablename).fnFilterAdd(filtersToShowChanges);
				}	 		
			} 		
		
		if (sSelectedAction == 'insert')
			{
			var url = "../lexit/lexit/table/insertmodified";
			
			// build list of columns to copy
			var columnsToCopy = conf.getListOfColumnsToCopyUponInsert(sSomeTablename);
			
			$.ajax( {
				"type": "GET",
				"url": url,
				"data": {
					"async": false,
					"row_id": rowIds.join(ARG_INTERNAL_SEPARATOR),
					"db_name": getHttpParams().get("db"),
					"table_name": sSomeTablename,
					"filter_column_name": sSelectedColumn,
					"filter_value": sOldString,
					"replacement_value": sNewString,
					"column_to_copy": columnsToCopy.join(ARG_INTERNAL_SEPARATOR),					
					"dummy": getUniqueNumber() 
					},
			 	"dataType": "xml", // get response as xml
			 	"success": function(xml) {
			 		gui.removeProcessingMsg(sSomeTablename);
			 		// re-enable close button
		 			$("#"+sSomeTablename+"_searchandreplace_close_button").removeAttr("disabled");
			 		if (!gui.getDbResponse(xml))
			 			{			 			
			 			fn.message("Fout in tabel '"+sSomeTablename+"'", "Er is een fout opgetreden ["+gui.getDbResponse(xml)+"]");
			 			}
			 		},
				"error": function(jqXHR, textStatus, errorThrown){
					
					fn.message("Fout in tabel '"+sSomeTablename+"'", 
							"Er is een fout opgetreden: "+textStatus+" "+errorThrown,
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
			var url = "../lexit/lexit/table/setvalue";
			
			$.ajax( {
				"type": "GET",
				"url": url,
				"data": {
					"async": false,
					"row_id": rowIds.join(ARG_INTERNAL_SEPARATOR),
					"db_name": getHttpParams().get("db"),
					"table_name": sSomeTablename,
					"column_name": sSelectedColumn,
					"new_value": newValues.join(ARG_INTERNAL_SEPARATOR), 
					"dummy": getUniqueNumber() 
					},
			 	"dataType": "xml", // get response as xml
			 	"success": function(xml) {
			 		gui.removeProcessingMsg(sSomeTablename);
		 			// re-enable close button
		 			$("#"+sSomeTablename+"_searchandreplace_close_button").removeAttr("disabled");
			 		if (!gui.getDbResponse(xml))
			 			{			 			
			 			fn.message("Fout in tabel '"+sSomeTablename+"'", "Er is een fout opgetreden ["+gui.getDbResponse(xml)+"]");
			 			}
			 		},
				"error": function(jqXHR, textStatus, errorThrown){
					
					fn.message("Fout in tabel '"+sSomeTablename+"'", 
							"Er is een fout opgetreden: "+textStatus+" "+errorThrown,
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