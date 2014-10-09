/**
 * 
 */

var asr = {};

asr.buildAdvancedSearchAndReplaceDiv = function(sSomeTablename){
	
	var div = $("<div></div>")
	.addClass("top")
	.css("background-color", "#D8F781")
	.attr("id", sSomeTablename+"_search_and_replace")
	.css("display", "block")
	.hide();
	var form = $("<form></form>").attr("action", "");
	
	// title
	div.append(
			$("<span></span>")
			.css("font-weight", "bold")
			.css("font-size", "120%")
			.text("Zoek & Bewerk ")
			);
	div.append(
			$("<span></span>")
			.text("(onveilige modus: bewerking heeft invloed op de gehele database)")
			.append($("<br/>")).append($("<br/>"))
			);
	
	// we have two rows of boxes: filters (content to match) and replacement strings
	
	var filterBoxes = $("<div></div>")
	.attr("id", "filter_boxes");
	var replaceBoxes = $("<div></div>")
	.attr("id", "replacement_boxes");
	
	
	// build the BOXES divs
	
	var oTableConfig = conf.getTableConfig(sSomeTablename);
	
	$('#'+sSomeTablename+' thead th').each( function(i){
				
		var oneFilterBox = $("<div></div>").css("display", "inline-block");				
		filterBoxes.append(oneFilterBox);
		
		var oneReplaceBox = $("<div></div>").css("display", "inline-block");		
		replaceBoxes.append(oneReplaceBox);
		
	});	
	
	var addOrReplace = $("<select></select>")
	.attr("id", "addOrReplaceMode")
	.append($("<option></option>")
					.attr("value", "replace")
					.text("Vervang het door het onderstaande"))
	.append($("<option></option>")
					.attr("value", "add")
					.text("Voeg het onderstaande toe"));
	
	// append the BOXES and such to the form (one row of filters and one row of replace boxes)
	
	form.append( $("<select></select>")
			.append( $("<option></option>").attr("value", "").text("Als we dit vinden") ) 
			);
	form.append(filterBoxes);
	form.append( $("<br>") );
	form.append(addOrReplace);
	form.append( $("<br>") );
	form.append(replaceBoxes);
	
	div.append(form);		
	
	// build the boxes and add some css
	
	$("#"+sSomeTablename+" tbody tr:eq(0)").find("td").each(function(i){
		
		var oColumnConfig = conf.getColumnConfig( oTableConfig, mt.getListOfVisibleColumnsOf(sSomeTablename)[i]);
		
		// if we have a checkbox column, we need a checkbox here 
		var isACheckBox = ($(this).hasClass("editable_checkbox") || $(this).hasClass("not_editable_checkbox"));
		
		// get the width setting of the table
		// we need to subtract a fex pixels per box because the container is smaller than the screen 
		var width = parseInt($(this).css("width"))-10;
		// get padding settings as well
		var paddingleft = $(this).css("padding-left");
		var paddingright = $(this).css("padding-right");
		
		// now set the padding and width of the boxes according to the table columns
		
		filterBoxes.find("div:eq("+i+")")
		.css("max-width", width)
		.css("padding-left", paddingleft)
		.css("padding-right", paddingright)
		.append(
				$("<span></span>")
				.text(mt.getListOfVisibleColumnsOf(sSomeTablename)[i])
				.css("color", 
						// button columns must be disabled/grey
						conf.getButtonSetting(oColumnConfig)==null ? "#000000":"#BDBDBD")
				.append(
						$("<input/>")
						.css("width", width)
						.css("padding-left", paddingleft)
						.css("padding-right", paddingright)
						.attr("type", isACheckBox ? "checkbox":"text")	
						// buttons columns need no input / must be disabled
						.attr("disabled", conf.getButtonSetting(oColumnConfig)!=null ? "disabled":false)
						)				
		);
		
		replaceBoxes.find("div:eq("+i+")")
		.css("max-width", width)
		.css("padding-left", paddingleft)
		.css("padding-right", paddingright)
		.append(
				$("<span></span>")
				.text(mt.getListOfVisibleColumnsOf(sSomeTablename)[i])
				// not editable columns show grey column names
				.css("color", conf.getEditability(oColumnConfig) ? "#000000":"#BDBDBD")
				.append(
						$("<input/>")
						.css("width", width)
						.css("padding-left", paddingleft)
						.css("padding-right", paddingright)
						.attr("type", isACheckBox ? "checkbox":"text")
						// only some columns are editable
						.attr("disabled", 
								(conf.getEditability(oColumnConfig) && conf.getButtonSetting(oColumnConfig)==null ) ? false:"disabled")
						)				
		);
		
		
	});
	
	
	
	// buttons
	var buttons_span = $("<span></span>").attr("id", sSomeTablename+"_buttons_span");	
	
	// test button
	var test_button = $("<button/>")
	.attr("type", "button")
	.attr("class", "onego_button")
	.html("Test effect")
	.bind("click", function(){
		asr.alterTable(sSomeTablename, $("#addOrReplaceMode").val(), false);
	});
	buttons_span.append(test_button);
	
	// replace button
	var replace_button = $("<button/>")
	.attr("type", "button")
	.attr("class", "onego_button")
	.html("Uitvoeren")
	.css("margin-right", "20px")
	.bind("click", function(){
		var answer = confirm("Deze wijzigingen zullen nu in de gehele database worden doorgevoerd. Dit is ingrijpend! Wilt u dit echt?");
		if (answer){
			asr.alterTable(sSomeTablename, $("#addOrReplaceMode").val(), true);
			$("#"+sSomeTablename+"_wrapper .onego_button").attr("disabled", "disabled");			
		}
		
	});
	buttons_span.append(replace_button);
	
	// close button, meant to leave back to the main interface
	var close_button = $("<button/>")
	.attr("type", "button")
	.attr("id", sSomeTablename+"_searchandreplace_close_button")
	.html("Sluiten")
	.bind("click", function(){
		
		$("#"+sSomeTablename+"_search_and_replace").hide("slow");
		$("#"+sSomeTablename+"_search_and_replace").delay(500).queue( function(){$(this).remove(); $(this).dequeue();} );
		$("#"+sSomeTablename+"_wrapper div.top").show("slow");
		row.clearRowSelectionInAllTables();		
		
	});
	buttons_span.append(close_button);
	
	form.append( $("<br>") );
	form.append(buttons_span);
	
	// advanced search and replace function link
	var simplesearch_link = $("<button/>")
	.attr("type", "button")
	.attr("class", "onego_button styled-button-2")
	.css("margin-left", "40px")
	.text("Veilige modus")
	.bind("click", function(){
		$("#"+sSomeTablename+"_search_and_replace").remove();
		$("#"+sSomeTablename+"_wrapper div.top").before( ssr.buildSearchAndReplaceDiv(sSomeTablename) );
		$("#"+sSomeTablename+"_search_and_replace").show();
	});
	
	buttons_span.append(simplesearch_link);
	
	return div;
};



// search and replace/add content
// subroutine of  asr.buildSearchAndReplaceDiv

asr.alterTable = function(sSomeTablename, addOrReplaceMode, bReallyChange){

	// build a list of the filter columns and replacement columns 
	
	var aFieldsAndValuesToMatch = new Array();
	var filterColumnList = new Array();
	var filterValuesList = new Array();
	
	var aFieldsAndValuesToUpdate = new Array();
	var replaceColumnList = new Array();
	var replaceValuesList = new Array();
	
	// build list of columns to copy
	var columnsToCopy = conf.getListOfColumnsToCopyUponInsert(sSomeTablename);
	
	// build associative array of values to match
	$("#filter_boxes div").each(function(i){
		var boxName = $(this).find("span").text();
		var boxValue = $(this).find("input").val();
		var boxMustBeCopied = $.inArray(boxName, columnsToCopy)>-1;
		// if the box does not need to be copied and it is empty or disabled, skip it!
		if ( !boxMustBeCopied && (boxValue=='' || $(this).find("input").attr("disabled")=="disabled") )
			return;	
		// a box that must be copied should have a filled filter
		if (boxMustBeCopied && boxValue == '')
			boxValue = '.*';
		// now build the list of filters
		filterColumnList.push(boxName);
		filterValuesList.push(boxValue);
		aFieldsAndValuesToMatch[boxName] = boxValue;
	});
	
	// build associative array of values to replace
	$("#replacement_boxes div").each(function(i){
		var boxName = $(this).find("span").text();
		var boxValue = $(this).find("input").val();
		if ( boxValue=='' || $(this).find("input").attr("disabled")=="disabled" )
			return;		
		replaceColumnList.push(boxName);
		replaceValuesList.push(boxValue);
		aFieldsAndValuesToUpdate[boxName] = boxValue;
	});	
	
	
	
	// first check is some selection is made
	var aRowsToProcess = row.getSelectedRowsFrom(sSomeTablename);
	var bSelectionOnly = aRowsToProcess.length>0;
	// if no selection is made, we process all rows
	if ( !bSelectionOnly ) aRowsToProcess = $("#"+sSomeTablename+" tbody tr");
	
	
	// now process the table with the search & replace request
	
	// first clean rows from possible test output from a previous altertable call
	// that is restore original content
	$("#"+sSomeTablename+" tbody tr").each(function(){
		for (var i=0; i<filterColumnList.length; i++)
			{
			var sColumnName = filterColumnList[i];
			var trueIndexOfColumn = $.inArray(sColumnName, mt.getListOfColumnsOf(sSomeTablename));
			var sCell = mt.getDataTableObjectOf(sSomeTablename).fnGetData(this, trueIndexOfColumn);
			
			var visibleIndexOfColumn = $.inArray(sColumnName, mt.getListOfVisibleColumnsOf(sSomeTablename));
			if (visibleIndexOfColumn<0) continue;		
			$(this).find("td").eq(visibleIndexOfColumn).html(sCell);
			}		
			
		
	});
	
	// now process each row with replacement command
	aRowsToProcess.each(function(){
		
		// first check if the row meets the filter requirements
		
		var rowsMeetsRequirement = true;
		// we check one column filter at the time
		for (var i=0; i<filterColumnList.length; i++)
			{
			// get the cell data of current column and corresponding filter
			var indexOfColumn = $.inArray(filterColumnList[i], mt.getListOfColumnsOf(sSomeTablename));
			var sCell = mt.getDataTableObjectOf(sSomeTablename).fnGetData(this, indexOfColumn);
			var filterBoxValue = $.trim(filterValuesList[i]);			
			
			
			// if there is no filter for this column, skip to next one
			if (filterBoxValue=='') continue;
			
			// apply replace pattern 
			var pattern = new RegExp(filterBoxValue, "i");
			var match = pattern.exec(sCell);
			
			// is the filter requirement met?
			if (match==null)
				{
				rowsMeetsRequirement = false;
				break;
				}				
			}
		
		// if filter requirements are not met, loop straight to next row
		
		if ( !rowsMeetsRequirement ) return;
		
		
		// if filter requirements are met, carry on with processing
		
		// we must show the effect in each cell of this row
		for (var i=0; i<filterColumnList.length; i++)
			{
			// get the cell data of current column and corresponding filter
			var indexOfColumn = $.inArray(filterColumnList[i], mt.getListOfColumnsOf(sSomeTablename));
			var sCell = mt.getDataTableObjectOf(sSomeTablename).fnGetData(this, indexOfColumn);
			var filterBoxValue = $.trim(filterValuesList[i]);
			
			// apply replace pattern 
			var pattern = new RegExp(filterBoxValue, "i");
			var match = pattern.exec(sCell) ;
			
			
			// get the right column index in replacement list
			var indexOfFilterColumnInReplacementColumnList = $.inArray(filterColumnList[i], replaceColumnList);
			// read the replacement value at that index
			var oneReplacementValue = replaceValuesList[indexOfFilterColumnInReplacementColumnList];
			
			
			// we apply the modification only if replacement value exists at all!
			if (indexOfFilterColumnInReplacementColumnList>-1 && oneReplacementValue !='' &&
					match != "" && match != null)
				{
				var sNewValue = sCell.replace(pattern, oneReplacementValue);
				var sTestValue = sCell + " <b>>> "+sNewValue+"</b>";
				
				// update the html table without updating the database
				// this enables the user to test its replacement action before really performing it
				var trueIndexOfColumn = $.inArray(filterColumnList[i], mt.getListOfVisibleColumnsOf(sSomeTablename));
				
				$(this).find("td").eq(trueIndexOfColumn).html(sTestValue);
				
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
		
		
		// set the table filters to now filter both search and replacement strings
 		// so as to get to see both old and new records at refresh
 		var filtersToShowChanges = new Array();
 		for (var i=0; i<replaceColumnList.length; i++)
 			{
 			// (we do it only if the new string doesn't contain backreferences, otherwise it won't work)
 			if (replaceValuesList[i].indexOf("$")<0)
 				{
 				var indexOfMatchValue = $.inArray(replaceColumnList[i], filterColumnList);
 	 			filtersToShowChanges[replaceColumnList[i]] = 
 	 				filterValuesList[indexOfMatchValue].replace(/(\w+)/i, "($1|"+replaceValuesList[i]+")");
 				} 			
 			} 		
 		mt.getDataTableObjectOf(sSomeTablename).fnFilterAdd(filtersToShowChanges);
 		
		
		
		if (addOrReplaceMode=="replace")
			{						
			var aColNamesToMatch = new Array();
			var aValuesToMatch = new Array();
			
			var aColNamesToUpdate = new Array();
			var aValuesToUpdate = new Array();
			
			
			for (var sFieldName in aFieldsAndValuesToMatch)
				{
				aColNamesToMatch.push(sFieldName);
				aValuesToMatch.push(aFieldsAndValuesToMatch[sFieldName]);
				}
			for (var sFieldName in aFieldsAndValuesToUpdate)
				{
				aColNamesToUpdate.push(sFieldName);
				aValuesToUpdate.push(aFieldsAndValuesToUpdate[sFieldName]);
				}
			
			// update the database
			var url = "../lexit/lexit/table/setvalue_without_id"; 
			$.ajax( {
				"type": "GET",
				"url": url,
				"data": {
					"db_name": getHttpParams().get("db"),
					"table_name": sSomeTablename,
					"column_name_to_match": aColNamesToMatch.join(ARG_INTERNAL_SEPARATOR),
					"value_to_match": aValuesToMatch.join(ARG_INTERNAL_SEPARATOR), 
					"column_name_to_update": aColNamesToUpdate.join(ARG_INTERNAL_SEPARATOR),
					"value_to_update": aValuesToUpdate.join(ARG_INTERNAL_SEPARATOR), 
					"dummy": getUniqueNumber()
					},
			 	"dataType": "xml", // get response as xml
			 	"success": function(xml) {
			 		gui.removeProcessingMsg(sSomeTablename);		 			
		 			// re-enable close button
		 			$("#"+sSomeTablename+"_searchandreplace_close_button").removeAttr("disabled");
			 		},
				error: function(jqXHR, textStatus, errorThrown){
					gui.removeProcessingMsg(sSomeTablename);		 			
		 			// re-enable close button
		 			$("#"+sSomeTablename+"_searchandreplace_close_button").removeAttr("disabled");
		 			fn.message("Fout in tabel '"+sSomeTablename+"'", "Er is een fout opgetreden: "+
						textStatus+" "+errorThrown);
					}
				} );
			}
		else if (addOrReplaceMode=="add")
			{			
			
			var url = "../lexit/lexit/table/insertmodified_without_id";
			
			$.ajax( {
				"type": "GET",
				"url": url,
				"data": {
					"async": false,		
					"db_name": getHttpParams().get("db"),
					"table_name": sSomeTablename,
					"filter_column_name": filterColumnList.join(ARG_INTERNAL_SEPARATOR),
					"filter_value": filterValuesList.join(ARG_INTERNAL_SEPARATOR),
					"replacement_column_name": replaceColumnList.join(ARG_INTERNAL_SEPARATOR),
					"replacement_value": replaceValuesList.join(ARG_INTERNAL_SEPARATOR),
					"returning": null,
					"dummy": getUniqueNumber() 
					},
			 	"dataType": "xml", // get response as xml
			 	"success": function(xml) {
			 		gui.removeProcessingMsg(sSomeTablename);		 			
		 			// re-enable close button
		 			$("#"+sSomeTablename+"_searchandreplace_close_button").removeAttr("disabled");
			 		},
				"error": function(jqXHR, textStatus, errorThrown){
					gui.removeProcessingMsg(sSomeTablename);		 			
		 			// re-enable close button
		 			$("#"+sSomeTablename+"_searchandreplace_close_button").removeAttr("disabled");
		 			fn.message("Fout in tabel '"+sSomeTablename+"'", "Er is een fout opgetreden: "+
						textStatus+" "+errorThrown);
					}
				} );

			}
			
		} // end of real change part
};



