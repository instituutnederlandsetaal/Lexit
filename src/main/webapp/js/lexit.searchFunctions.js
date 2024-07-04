/**
 * 
 */

var sf = {};

// --------------------------------------------------
//
// Content of this name space:
//
// GO-TO FUNCTION
// ENABLE SEARCH
// CLEAR SEARCH
// START SEARCH
// HELP FUNCTIONS for reading or setting values the right way, etc
// QUERY BUILDER
//
// --------------------------------------------------



// ========================================================================================
// GO-TO FUNCTION
// ========================================================================================

// given some term in a search box, 
// find the page on which this term is to be found and display it
sf.goTo = function(sSomeTablename){
	
	// initialize compulsory filters arrays
	// (these are filters in addition to the "go to"-filter)
	var filterColumnNames = new Array();
	var filterValues = new Array();
	
	// reset filters
	// this is needed because we will add filters here and we want to make
	// sure that filters from previous rounds get cleaned
	mt.getDataTableObjectOf(sSomeTablename).resetSearchFilters(false);
	
	
	// find the column to search and the value to match against
	var sColumnName = "";
	var sColumnValue = "";
	
	$("#"+sSomeTablename+"_searchboxes td").each(function(i){

		var oTableConfig = conf.getTableConfig(sSomeTablename);
		var oColumnConfig = conf.getColumnConfig(oTableConfig, mt.getListOfVisibleColumnsOf(sSomeTablename)[i]);
		var oColumnSelectionBox = conf.getSelectionBox(oColumnConfig);
		
		// determine right selector for searchbox (input or select type)
		var bCurrentColumnIsASelectBox = 
			(
			// values set by config
			 oColumnSelectionBox!=null 
					||
			// values set by Postgres ENUM type
			 mt.getListOfTypesOfVisibleColumnsOf(sSomeTablename)[i]==USER_DEFINED
			 );
		var searchBoxSelector = bCurrentColumnIsASelectBox ? 
				$(this).find("select") : $(this).find("input");
		
		var sCurrentColumnName = mt.getListOfVisibleColumnsOf(sSomeTablename)[i]; 
		var sCurrentColumnValue = $.trim(searchBoxSelector.val());
		
		// for checkboxes, we need to recompute the value
		var bCurrentColumnIsACheckBox = fn.getTypeOfFilterBox(sSomeTablename, sCurrentColumnName) == 'checkbox';
		if (bCurrentColumnIsACheckBox)
			{
			var iCycleValue = searchBoxSelector.attr("cycle_value");		
			var sVisibleColumnNumber = $.inArray(sCurrentColumnName, mt.getListOfVisibleColumnsOf(sSomeTablename));
			sCurrentColumnValue = sf.buildCorrectCheckboxFilterValue(sSomeTablename, sVisibleColumnNumber, iCycleValue);			
			}
		
		// selectboxes need 'exact:' in front, otherwise preset-values containing regex chars will be
		// interpreted as regexes, which we don't want
		if (bCurrentColumnIsASelectBox && sCurrentColumnValue!="" && !isRegex(sCurrentColumnValue))
			{
			sCurrentColumnValue = "exact:"+sCurrentColumnValue;
			}
				
		
		// if we have any value, use it
		if ( (!bCurrentColumnIsACheckBox && 
				sCurrentColumnValue != "")
				||
			 ( bCurrentColumnIsACheckBox && 
			    iCycleValue != 0) // somehow needed as false and "" are mixed
		   ) 
			{
			
			var bThisBoxHasFocus = 
				(mt.getSearchBoxNameThatHasFocus(sSomeTablename) == sCurrentColumnName);
			
			// The value of the searchbox that has focus (the last one clicked upon)
			// is the one we will use a the value to GO TO.
			// Other values will be set as normal filters
			if (bThisBoxHasFocus)
				{
				// GoTo-filter is set now!
				sColumnName = sCurrentColumnName;
				sColumnValue = sCurrentColumnValue;
				}
			else
				{
				// other search fields are added as common filters
				filterColumnNames.push(sCurrentColumnName);
				filterValues.push(sCurrentColumnValue);
				// Trick: add filter as if it was one of the compulsory filters required by configuration
				// These added filters can be easily removed by user upon clicking on RESET
				var tmpArray = new Array();
				tmpArray[sCurrentColumnName] = sCurrentColumnValue;
				mt.getDataTableObjectOf(sSomeTablename).addSearchFilters(tmpArray);
				}
			}
	});
	
	if (sColumnName==""){
		fn.message(lang.beware, lang.header_goto_no_search_term);
		return true;
	}
	
	// find sorting columns and directions	
	var aSortColumns = fn.getSortingColumns(sSomeTablename);
	var aSortDirections = fn.getSortingDirections(sSomeTablename);
	
	// gather the compulsory filters 
	
	var oTableConfig = conf.getTableConfig(sSomeTablename);
	for (var i=0; i<mt.getListOfColumnsOf(sSomeTablename).length; i++)
		{
		var aColumnConfig = conf.getColumnConfig(oTableConfig, mt.getListOfColumnsOf(sSomeTablename)[i]);		
		var keepfilter = conf.getKeepFilterSetting(aColumnConfig);
		if (keepfilter)
			{
			filterColumnNames.push(mt.getListOfColumnsOf(sSomeTablename)[i]);
			filterValues.push(conf.getFilter(aColumnConfig));
			}
		}
	
	
	// now request the corresponding row number
	// and jump to that position in the table
	sf.getRowNumber(sSomeTablename, sColumnName, sColumnValue, aSortColumns, aSortDirections, filterColumnNames, filterValues);
	
};



// subroutine van sf.goTo
// get the row number (!=id) of a record, given some value to match in some table
// and jump to that position in the table
sf.getRowNumber = function(sSomeTablename, sColumnName, sColumnValue, aSortColumns, aSortDirections, filterColumnNames, filterValues){
	
	if ( aSortColumns == null || aSortColumns.length == 0 ){
		fn.message(lang.beware, lang.header_goto_missing_sort);
		return;
	}
	
	gui.showProcessingMsg(sSomeTablename);
	
	// check if this call is the same as the previous one
	// (t.i. request for first occurence of word searched for, or some 'next' occurence...
	
	// we need a unique key!
	// (this consists of the parameters from which the setting mustn't change if we want
	//  to navigate through the results of a go-to call; as soon as some of those parameters
	//  has changed (for example because of a new sorting order set by the user), we have
	//  to query the database again for the locations of the terms we want to go to!;
	//  the unique key, which is compared to the one of the previous round, is used for this aim)
	var sCurrentCallOfGoTo =	getHttpParams().get("db") + 
								sSomeTablename + 
								sColumnName + sColumnValue +	
								(fn.getSortingColumns(sSomeTablename)).join() + 
								(fn.getSortingDirections(sSomeTablename)).join();
	
	if (sCurrentCallOfGoTo == mt.getLastGoToCommand(sSomeTablename) ) {
		// same call, so we will ask for the 'next' occurence of the word searched for
		mt.rememberOccurenceNr( sSomeTablename, mt.getOccurenceNr(sSomeTablename) + 1 );
	}
	else {
		// not the same call, so tell the GoTo memory we have a new table search, starting from occurence #0
		mt.rememberOccurenceNr( sSomeTablename, 0 );
		mt.rememberLastGoToCommand( sSomeTablename, sCurrentCallOfGoTo );
		
		// at the very first call, tell the user an index is being built
		fn.message(lang.header_goto_button, lang.header_goto_building_index);
	}
	

	
	var url = WEBSERV_URL+"/api/get_row_number";
	
	$.ajax({
		type: "GET",
		url: url,
		data: {
			"db_name": getHttpParams().get("db"),
			"table_name": sSomeTablename, 
			"column_name": sColumnName,
			"column_value": sColumnValue,
			"occurence_nr": mt.getOccurenceNr(sSomeTablename),
			"sort_columns": aSortColumns.join(","),
			"sort_directions": aSortDirections.join(","),
			"filter_column_names": filterColumnNames.join(ARG_INTERNAL_SEPARATOR),
			"filter_values": filterValues.join(ARG_INTERNAL_SEPARATOR),
			"display_length": fn.getCurrentDisplayLength(sSomeTablename)
			
		},
		dataType: "xml",
		contentType: "application/x-www-form-urlencoded;charset=UTF-8",
		success: function(xml) {
			fn.closeDialog(); // close automatically the GoTo message about building an index
			gui.removeProcessingMsg(sSomeTablename);
			sf.goToPageGiveXmlResponse(xml, sSomeTablename);
		},
		error: function(jqXHR, textStatus, errorThrown) {
			fn.closeDialog(); // close automatically the GoTo message about building an index
			gui.removeProcessingMsg(sSomeTablename);
			fn.message(lang.error_occurred_in_table+ " '"+sSomeTablename+"'", lang.loading_xml_failed+": "+textStatus+" "+errorThrown);
		}
	});
};



// subroutine of sf.getRowNumber
// go to a given table position, given some requested row number got as XML

sf.goToPageGiveXmlResponse = function(xml, sSomeTablename){

	var sServerResponse = $(xml).find("response").text();
	
	// two responses are possible:
	// * a list of rows ids (fast solution)
	// * or a row number (can result in slow rendering, because of use of OFFSET in webservice)
	//
	// See all info at Database.getRowNumberOfRecord
	
	
	// fast implementation (making use of PK)
	
	if (sServerResponse.indexOf(":")>-1) {
		// split by ':', which will split the response into a page nr, a list of ids
		
		var aSplitResponse =	sServerResponse.split(":");
		var iRowNumber = 		parseInt(aSplitResponse[1]);		
		
		// aGoToRowIds is a global variable. 
		// The table builder handles this by adding those values as argument for this particular Ajax call, 
		// telling the webservice that it has to handle it as a GoTo operation. 
		// At the client-side, the values in aGoToRowIds are of course disposed of straight after the Ajax call
		// because those values were only relevant to that particular call (more info at Database.getRowNumberOfRecord).
		
		var sFieldToQuery = 	aSplitResponse[2];
		// global: no var!
		aGoToRowIds[sSomeTablename] = sFieldToQuery+":^(" + ( (aSplitResponse[3]).split(ARG_INTERNAL_SEPARATOR) ).join("|") + ")$";
		
		mt.getDataTableObjectOf(sSomeTablename).displayRow(iRowNumber).draw(false);
	}
	
	
	// slow implementation (when no PK available)
	else {
		var iRowNumber = parseInt(sServerResponse);
		
		// if a 'next' occurence has been searched for, but it returned the 1st page of the table,
		// it is clear the search gave no results, so reset the GoTo-memory!
		
		if (	iRowNumber < fn.getCurrentDisplayLength(sSomeTablename) // result is page 1 
				&& 
				mt.getOccurenceNr(sSomeTablename) > 0 // it was not the first call
			) {
			// reset GoTo memory, so we won't keep requesting 'next' occurences
			mt.resetGoToMemoryForTable(sSomeTablename);
		}
		
		mt.getDataTableObjectOf(sSomeTablename).displayRow(iRowNumber).draw(false);
	}
	
};





// ========================================================================================
// ENABLE SEARCH
// ========================================================================================

// enable the search fields (normally called only at initialisation, or at each draw in 'optimal mode')
// job: 
// - disable default Datatables behaviour (which is: fire new search query at each keypress event = too demanding)
// - set 'pressing enter' as start sign for search actions
// - set special checkbox filter when column is boolean (bit varying)

sf.enableSearchFields = function(someTablename){
	
	// disable automatic search on keypress (default behaviour of DataTables)
	// now search starts only after pressing enter
	
	// main search function
	$('#'+someTablename+'_filter input').unbind();
	$('#'+someTablename+'_filter input').bind('keyup', function(e) {		
		
		// pressed keys are normally caught by the attached events in kf.addKeyFunctions()
		// but since the keyup-event on input-element is overriden here,
		// we need to call registerPressedKey() again here.
		kf.registerPressedKey(e);
		
		if (kf.isPressed("enter")) {
			sf.startSearch(someTablename);
		}
	});	
	
	
	// enable search on enter press
	$("#"+someTablename+"_dynamic").off('keyup', '#'+someTablename+'_searchboxes td input');
	$("#"+someTablename+"_dynamic").on('keyup', '#'+someTablename+'_searchboxes td input', function(e) {

		//var thisInput = this;
		
		// pressed keys are normally caught by the attached events in kf.addKeyFunctions()
		// but since the keyup-event on input-element is overriden here,
		// we need to call registerPressedKey() again here.
		kf.registerPressedKey(e);
		
		if (kf.isPressed("enter")) {			
        	sf.startMultiColumnSearch(someTablename);
		}

		// SOMEHOW not needed anymore? 
		// tab should lead to next input field 
		// if (kf.isPressed("tab")) {
		// 	var next = $(thisInput).parent().next("td:has(input)");
		// 	if (next != null){				
		// 		$(next).find("input").focus();
		// 	}
			
		// }
	});
	

	// empty whole-table search field when clicking on per-column search field
	// (this is meant to prevent user confusion, as he/she wouldn't understand the search
	//  results if some 'forgotten' search string in the main search box is affecting the search)
	$("#"+someTablename+"_dynamic").off("focus", '#'+someTablename+'_searchboxes td input');
    $("#"+someTablename+"_dynamic").on("focus", '#'+someTablename+'_searchboxes td input', function () {
    	
    	// clear whole-table search field
     	sf.clearSearchField(someTablename);
    } );
	
	// empty per-column search fields when clicking on whole-table search field
    // (this is meant to prevent user confusion, as he/she wouldn't understand the search
	//  results if some 'forgotten' search string in some search box is affecting the search)
    $("#"+someTablename+"_dynamic").off("focus", '#'+someTablename+'_filter input');
	$("#"+someTablename+"_dynamic").on("focus", '#'+someTablename+'_filter input', function () {
		
		// clear per-column search fields		
		sf.clearPerColumnSearchFields(someTablename);
	});
	
	
	// ****************************
	// add per-column search fields
	// ****************************
	
	var oTableConfig = conf.getTableConfig(someTablename);	
	
	var sSearchBoxesDiv = $("<table></table>")
		.attr("id", someTablename+"_searchboxes")
		.bind("mouseenter", function(){gui.setSearchboxesCss(someTablename);})
		.css("display", "block")
		.css("visibility", "hidden");

	var sSearchBoxesTr = $("<tr></tr>");
	sSearchBoxesDiv.append(sSearchBoxesTr);
	
	$('#'+someTablename+'_wrapper div.dataTables_scrollHeadInner table.display th').each( function(i){
		
		var sCurrentColumnName = mt.getListOfVisibleColumnsOf(someTablename)[i];
		
		// if the current column is set to searchable:false, we have to disable the search field
		var oColumnConfig = conf.getColumnConfig( oTableConfig, sCurrentColumnName);
		// if the column contains a button, the column must be UNsearchable 
		// (to prevent errors, since searching through buttons make no sense)
		var columnSearchable = conf.getButtonSetting(oColumnConfig) == null ?
				conf.getSearchability(oColumnConfig) : false;
		// if a column has a filter set and keepfilter:true, the searchbox won't work
		// so it must be UNsearchable
		if (conf.getKeepFilterSetting(oColumnConfig)) 
			columnSearchable = false;
		
		// do we have a selection box?
		var aColumnSelectionBox = conf.getSelectionBox(oColumnConfig);
		var aColumnSelectionLabels = conf.getSelectionBoxLabels(oColumnConfig);
		
		
		// if we have a checkbox column, we need checkbox-filters!
		var isACheckBox = ($(this).hasClass("editable_checkbox") || $(this).hasClass("not_editable_checkbox"));
		// or do we have a selectbox?
		var isASelectBox = aColumnSelectionBox != null || mt.getListOfTypesOfVisibleColumnsOf(someTablename)[i]==USER_DEFINED;
		
		
		
		// what kind of filter should we have?
		var inputTag;
		
		// 1. selection box
		if (isASelectBox) {
			// We have two possible selection box types
			//    [1] set in client configuration (conf.getSelectionBox)
			var aListOfOptions = aColumnSelectionBox;
			// or [2] set in Postgres database (Postgres ENUM type)
			if (aColumnSelectionBox == null) {
				aListOfOptions = cloneArray(mt.getListOfAllowedValuesInVisibleColumnsOf(someTablename)[i]);
				
				// empty value as neutral choice
				aListOfOptions.unshift("");
			}
			
			// add 'ALLES' value to be able to choose everything except neutral value(s)
			var sAllOptions = "";
			var aAllAllowedValues = new Array(); 
			for (var j=0; j<aListOfOptions.length; j++) {
				if (aListOfOptions[j] != '' && aListOfOptions[j] != '-') {
					// don't forget to escape the regex chars, otherwise choosing the ALLES option
					// will sometimes not give the expected results
					aAllAllowedValues.push( escapeRegexChars(aListOfOptions[j]) );						
				}
			}
			sAllOptions = "^("+aAllAllowedValues.join("|")+")$";
			
			// build select tag
			inputTag =  $("<select/>")
				.attr("disabled", !columnSearchable);
			
			inputTag.append(
				$("<option></option>")
					.attr("value", aListOfOptions[0] )
					.text( lang.choose )
			);
			for (var j=1; j<aListOfOptions.length; j++) {
				var sLabel = aListOfOptions[j];
				if (typeof aColumnSelectionLabels != 'undefined' && aColumnSelectionLabels != null && typeof aColumnSelectionLabels[ aListOfOptions[j] ] != 'undefined')
					sLabel = aColumnSelectionLabels[ aListOfOptions[j] ];
				
				// escape regex chars in select values, otherwise those values will be interpreted as regexes
				// (the escape is undone when reading the selected value by fn.getValueOfFilterBox() )
				var sThisValue = fn.escapeRegexChars( aListOfOptions[j] );
				sThisValue = sThisValue.replaceAll("\\\|", "|"); // exception to the rule (we alle regex pipes in select-values, so as to be able to query for alternative values in one single query)

				inputTag.append(
					$("<option></option>")							
						.attr("value", sThisValue) 	 
						.text( sLabel )
				);
			}
			// finally add the 'ALLES' option
			if (sAllOptions != null) {
				inputTag.append(
					$("<option></option>")							
						.attr("value", sAllOptions )
						.text( lang.EVERYTHING )
				);
			}
			
		}
		
		// 2. checkbox
		else if (isACheckBox) {
			inputTag = $("<input/>")
				.attr("type", "checkbox")
				.attr("disabled", !columnSearchable)
				.attr("title", lang.neutral)
				.attr("cycle_value", 0);
		}
		
		// 3. text field
		else {
			inputTag = $("<input/>")
				.attr("disabled", !columnSearchable);			
		}
		

		
		// the right filter type is set,	
		// now append the search box to the user interface
				
		sCurrentSearchBoxDiv = $("<td></td>")
			.append(inputTag.attr("id", someTablename+"_searchbox_"+sCurrentColumnName));
		sSearchBoxesTr.append(sCurrentSearchBoxDiv);
		
		
		// *************************		
		// now the filter is appended, 
		// it might be needed to give it a special value/setting:
		// *************************
		
		
		var sStartValueOfThisColumn = "";
		var oFilterSettings = mt.getDataTableObjectOf(someTablename).getSearchFilters();
		if (oFilterSettings[sCurrentColumnName] != null)
			sStartValueOfThisColumn = oFilterSettings[sCurrentColumnName];
	
		
		// put the filter value into the box		
		
		// general case
		inputTag.val(sStartValueOfThisColumn);		
		
		// for selection box
		if (isASelectBox) {			
			inputTag.val(sStartValueOfThisColumn);
		}
		
		// for checkboxes, we also need to (un)check the checkbox
		if (isACheckBox) {

			var iCycleValue;
			if (sStartValueOfThisColumn == '') {
				iCycleValue = 0;
			}
			else if (sf.isCheckboxTrueValue(sStartValueOfThisColumn)) {
				iCycleValue = 1;
				inputTag.prop("checked", "checked");
			}
			else if (sf.isCheckboxFalseValue(sStartValueOfThisColumn)) {
				iCycleValue = 2;
			}

			sf.setCheckboxRight(sCurrentSearchBoxDiv, iCycleValue);	
		}
			
	});
	
	
	// append the searchboxes we just built
	if ($("table#"+someTablename+"_searchboxes").elementExists()){
		$("table#"+someTablename+"_searchboxes").replaceWith(sSearchBoxesTr);
	}
	else {
		$("#"+someTablename+"_wrapper div.dataTables_scrollHeadInner table").before(sSearchBoxesDiv);
	}
	
	
	
	
	// *************************		
	// EVENTS to be attached (upon changing searchbox content)
	// *************************
	
	// last job: add events the search box should react to
	
	$('#'+someTablename+'_wrapper div.dataTables_scrollHeadInner table.display th').each( function(i){
		
		var sCurrentColumnName = mt.getListOfVisibleColumnsOf(someTablename)[i];
		var oColumnConfig = conf.getColumnConfig( oTableConfig, sCurrentColumnName);
		// do we have a selection box?
		var aColumnSelectionBox = conf.getSelectionBox(oColumnConfig);
		
		// if we have a checkbox column, we need checkbox-filters!
		var isACheckBox = ($(this).hasClass("editable_checkbox") || $(this).hasClass("not_editable_checkbox"));
		// or do we have a selectbox?
		var isASelectBox = aColumnSelectionBox != null || mt.getListOfTypesOfVisibleColumnsOf(someTablename)[i]==USER_DEFINED;
		
		// add click event for checkbox filters
		if (isACheckBox) {

			$("#"+someTablename+"_dynamic").off('click', "#"+someTablename+"_searchboxes td:eq("+i+")");
			$("#"+someTablename+"_dynamic").on('click', "#"+someTablename+"_searchboxes td:eq("+i+")", function(){				
				
				// remember last searchbox clicked upon (needed for goto function)
				mt.rememberLastSearchBoxClickUpon(someTablename, i);
				
				// we have three possible settings, following each other in a cycle
				// 0: unchecked  -> no value
				// 1: checked    -> true
				// 2: unchecked  -> false		
				// read the phase of the cycle in element attribute
				var iCycleValue = $(this).find("input").eq(0).attr("cycle_value");
				
				var iTrueIndex = $.inArray(mt.getListOfVisibleColumnsOf(someTablename)[i], mt.getListOfColumnsOf(someTablename));
				
				// we are now switching to the next phase in the cycle
				iCycleValue++;
				if (iCycleValue>2) iCycleValue = 0;
				
				sf.setCheckboxRight($(this), iCycleValue);
				
				// fire filter straight away
				var sCorrectCheckboxFilterValue = sf.buildCorrectCheckboxFilterValue(someTablename, i, iCycleValue);
				mt.getDataTableObjectOf(someTablename).column( iTrueIndex ).search( sCorrectCheckboxFilterValue ).draw();
				
				});
			
		}
		// add change event for selection box filters
		else if (isASelectBox) {

			$("#"+someTablename+"_dynamic").off('change', "#"+someTablename+"_searchboxes td:eq("+i+") select");
			$("#"+someTablename+"_dynamic").on('change', "#"+someTablename+"_searchboxes td:eq("+i+") select", function(){
				
				// remove focus from search box, to prevent unpredictable change because of user pressing an arrow key
				$(this).blur();
										
				// remember last searchbox clicked upon (needed for goto function)
				mt.rememberLastSearchBoxClickUpon(someTablename, i);
				
				var iTrueIndex = $.inArray(mt.getListOfVisibleColumnsOf(someTablename)[i], mt.getListOfColumnsOf(someTablename));
				
				// fire filter straight away
				mt.getDataTableObjectOf(someTablename).column(iTrueIndex).search($(this).val()).draw();
				
				});				
		}
		else {

			$("#"+someTablename+"_dynamic").off('click', "#"+someTablename+"_searchboxes td:eq("+i+")");
			$("#"+someTablename+"_dynamic").on('click', "#"+someTablename+"_searchboxes td:eq("+i+")", function(){
				
				// remember last searchbox clicked upon (needed for goto function)
				mt.rememberLastSearchBoxClickUpon(someTablename, i);
				
				// special: ctrl+click on text search box to call query builder
				if(kf._getPressedKey() == 'ctrl') {
					sf.getQueryBuilder(someTablename, sCurrentColumnName);					
				}				
			});
			
		}
		
	});

};









// ========================================================================================
// CLEAR SEARCH
// ========================================================================================


// clear all column filters
// and put in the initialization filter values if
// config file requires that

sf.clearPerColumnSearchFields = function(someTablename){
	
	var oTableConfig = conf.getTableConfig(someTablename);
	
	// clear all search field
	$("#"+someTablename+"_searchboxes td").each(function(i){		
		
		var sStartValueOfThisColumn = "";
		
		// put initialization column filter in search box (from config file)
		// or default value ""		
		var oColumnConfig = conf.getColumnConfig(oTableConfig, mt.getListOfVisibleColumnsOf(someTablename)[i]);
		var sColumnFilter = conf.getFilter(oColumnConfig);
		var bKeepFilter = conf.getKeepFilterSetting(oColumnConfig);
		if (bKeepFilter && sColumnFilter != null)
			sStartValueOfThisColumn = sColumnFilter;
			
		$(this).find("input").eq(0).val(sStartValueOfThisColumn);	
		$(this).find("select").eq(0).val(sStartValueOfThisColumn);
	});
	
	// uncheck the checkboxes and put selection boxes back to default
	$("#"+someTablename+"_searchboxes td").each(function(){
		var isACheckBox = $(this).find("input").eq(0).attr("type")=="checkbox";
		if(isACheckBox) {
			// remove the color indicating some value is activated (true or false)
			$(this).css("background-color", "#FFFFFF");
			$(this).find("input").eq(0).removeAttr("checked").prop('checked', false);	
			// the value of the checkbox needs to be set (doesn't happen upon checking the box!)
			$(this).find("input").eq(0).val("");
		}		
	});
	
};


// clear main search field
		
sf.clearSearchField = function(someTablename){
	$("#"+someTablename+"_filter input").val("");
};
		
		


// ========================================================================================
// START SEARCH
// ========================================================================================

// start search in whole table (input is main search field)

sf.startSearch = function(someTablename){
	
	
	// clear all search filters and reset compulsory init filters (config file)
	mt.getDataTableObjectOf(someTablename).resetSearchFilters(false);
	
	// start search
	var searchBoxValue = $.trim($("#"+someTablename+"_filter input").val());
	if (searchBoxValue=='') return true;	
	
	// set the global filter
	mt.getDataTableObjectOf(someTablename).search(searchBoxValue);
	
	// start search
	mt.getDataTableObjectOf(someTablename).draw();
};



// start multi column search (input is one or more column filters)

sf.startMultiColumnSearch = function(someTablename){
	
	var oTableConfig = conf.getTableConfig(someTablename);
	
	
	// clear all search filters and reset compulsory init filters (config file)
	mt.getDataTableObjectOf(someTablename).resetSearchFilters(false);
	
	// collect data from all per-column fields 
	$("#"+someTablename+"_searchboxes td").each(function(i){
				
		var oColumnConfig = conf.getColumnConfig(oTableConfig, mt.getListOfVisibleColumnsOf(someTablename)[i]);
		
		// do we have a checkbox?
		var isACheckBox = $(this).find("input").eq(0).attr("type")=="checkbox";
		
		// do we have a selection box?
		var oColumnConfig = conf.getColumnConfig(oTableConfig, mt.getListOfVisibleColumnsOf(someTablename)[i]);
		var aColumnSelectionBox = conf.getSelectionBox(oColumnConfig);
		var isASelectionBox = aColumnSelectionBox != null || mt.getListOfTypesOfVisibleColumnsOf(someTablename)[i]==USER_DEFINED;
		
		// get the query (search value) of the current column
		var oneSearchBoxValue = isASelectionBox ?			
				$(this).find("select").eq(0).val()  
				: 
				$(this).find("input").eq(0).val();
				
		// special short cut
		if ($.startsWith(oneSearchBoxValue, "//"))
			oneSearchBoxValue = "\""+oneSearchBoxValue.replace(/^\/\//, 'exact:')+"\"";
		
		
		// ** TEXT or SELECT filter **
		// Filter on the column if string non empty 
		if (!isACheckBox && jQuery.trim(oneSearchBoxValue)!='') {
			// get the true index (we want the index in all column, not the index in visible columns)
			var iTrueIndex = $.inArray(mt.getListOfVisibleColumnsOf(someTablename)[i], mt.getListOfColumnsOf(someTablename));
			
			// set the filter, with the correct column index			
			mt.getDataTableObjectOf(someTablename).column(iTrueIndex).search(oneSearchBoxValue);
		}
		
		// ** CHECKBOX filter **
		// Filter on the column if it is a checkbox and it has a filter value activated (colored)
		if (isACheckBox) {
			var bIsBooleanType = mt.getListOfTypesOfVisibleColumnsOf(someTablename)[i] == "boolean";
			var trueValue = bIsBooleanType ? true : 1;
			var falseValue = bIsBooleanType ? false : 0;
			
			var iTrueIndex = $.inArray(mt.getListOfVisibleColumnsOf(someTablename)[i], mt.getListOfColumnsOf(someTablename));
			
			// set value of the filter depending on the checkbox being checked/unchecked
			if (oneSearchBoxValue != "")
				mt.getDataTableObjectOf(someTablename).column(iTrueIndex).search(oneSearchBoxValue=="1" ? trueValue : falseValue);
			// if the checkbox has no value, empty the filter
			else
				mt.getDataTableObjectOf(someTablename).column(iTrueIndex).search("");
		}		
			
	});
	
	gui.highlightDiv(someTablename);
	
	// start search with collected multi-column filters
	mt.getDataTableObjectOf(someTablename).draw();
};




// ========================================================================================
// HELP FUNCTIONS
// for reading or setting values the right way, etc
// ========================================================================================



// make sure the current filter values are visible in all search boxes
sf.putCurrentValueInAllSearchBoxes = function(sTablename){
	
	// get the table filters settings
	var oFilterSettings = mt.getDataTableObjectOf(sTablename).getSearchFilters();
	var oTableConfig = conf.getTableConfig(sTablename);
	
	// process each visible column
	$("#"+sTablename+"_searchboxes td").each(function(i){
		
		// get column name and config
		var sCurrentColumnName = mt.getListOfVisibleColumnsOf(sTablename)[i];
		var oColumnConfig = conf.getColumnConfig(oTableConfig, sCurrentColumnName);
		
		// get the current filter setting		
		var sCurrentValueOfThisColumn = "";
		if (oFilterSettings[sCurrentColumnName] != null)
			sCurrentValueOfThisColumn = oFilterSettings[sCurrentColumnName];
				
		// do we have a selection box?
		var aColumnSelectionBox = conf.getSelectionBox(oColumnConfig);
		
		// if we have a checkbox column, we need checkbox-filters!
		var eColumnNameSelector = $('#'+sTablename+' thead th').eq(i);
		var isACheckBox = (eColumnNameSelector.hasClass("editable_checkbox") || eColumnNameSelector.hasClass("not_editable_checkbox"));		
		// or do we have a selectbox?
		var isASelectBox = aColumnSelectionBox != null || mt.getListOfTypesOfVisibleColumnsOf(sTablename)[i]==USER_DEFINED;
		
		
		
		// what kind of filter should we have?
		var inputTag;
		
		// 1. selection box
		if (isASelectBox) {
			inputTag =  $(this).find("select").eq(0);
			inputTag.val(sCurrentValueOfThisColumn);			
		}	
		
		
		// 2. checkbox
		else if (isACheckBox) {
			inputTag = $(this).find("input").eq(0);
			
			var iCycleValue;
			if (sCurrentValueOfThisColumn == '') {
				iCycleValue = 0;
			}
			else {
				iCycleValue = inputTag.attr("cycle_value");
			}			
			sf.setCheckboxRight($(this), iCycleValue);			
			if (sf.isCheckboxTrueValue(sCurrentValueOfThisColumn))
				inputTag.prop("checked", "checked");
		}
		
		// 3. text field
		else {
			inputTag = $(this).find("input").eq(0);
			
			// insert the value only if the field is empty
			// (this is a hack, to be able to have the searchbox keep its search value even after a refresh:
			//  the reason we need that, is that we sometimes want to call 'go-to' some more times without having
			//  to type the search value over and over again!)
			if (inputTag.val() == '')
				inputTag.val(sCurrentValueOfThisColumn);
		}
	});
	
};




// give the checkbox filter the right color etc., 
// so as to make the filter setting visible to the user

sf.setCheckboxRight = function(sSearchBoxesDiv, iCycleValue){

	// checkboxes have a cycle value 
	// values of several settings depend on the phase in the cycle (0 to 2)
	// we have three possible settings, following each other in a cycle
	//  0: unchecked  -> no value
	//  1: checked    -> true
	//  2: unchecked  -> false
	//
	// BEWARE: keep this IN the function (not outside), otherwise
	// the code will be executed before setLanguge can bet called,
	// causing checkboxes to keep default tooltip, instead of in the
	// chosen language
	var aCheckboxBackgroundColors =	["#FFFFFF",	"#D8F6CE",	"#F5A9A9"];
	var aCheckboxCheckvalue =     	["",		"1",		"0"];
	var aCheckboxCheckvalueTitle =	[lang.neutral,lang.on,  lang.off];
	var aCheckboxVisibleSetting = 	[false,  	true,		false];
	
	var inputTag = sSearchBoxesDiv.find("input").eq(0);
	
	inputTag.attr("cycle_value", iCycleValue);
		
	// set value of the filter depending on the checkbox being checked/unchecked
	
	// put the right color, to make the true checkbox value visible
	// since 'false' and 'no value' would otherwise look the same (unchecked)
	sSearchBoxesDiv.css("background-color", aCheckboxBackgroundColors[iCycleValue]);
	inputTag.attr("title", aCheckboxCheckvalueTitle[iCycleValue]);
	
	// the value of the checkbox needs to be set (doesn't happen upon checking the box!)
	inputTag.val( aCheckboxCheckvalue[iCycleValue] );
	
	// check or uncheck the checkbox (visible)
	inputTag.prop("checked", aCheckboxVisibleSetting[iCycleValue]);
	
};


// the value that should be given to a checkbox filter depends
// on the column datatype (boolean or something else)
// here we compute the right value according to the cycle value of the checkbox (neutral, on, off)
sf.buildCorrectCheckboxFilterValue = function(sTablename, sVisibleColumnNumber, iCycleValue){
	
	// what is required data type here?
	// we need to know that to be able to set the checkbox value properly
	var bIsBooleanType = mt.getListOfTypesOfVisibleColumnsOf(sTablename)[sVisibleColumnNumber] == "boolean";
	var trueValue = bIsBooleanType ? true : 1;
	var falseValue = bIsBooleanType ? false : 0;
	
	var aCheckboxFilterValue = ["", trueValue, falseValue];
	return aCheckboxFilterValue[iCycleValue];
};


// check if a given value means 'true' or 'false', if it belongs to a checkbox
sf.isCheckboxTrueValue = function(sValue){
	
	return (sValue==1||sValue=='1'||sValue==true||sValue==='true'||sValue=='t');
};
sf.isCheckboxFalseValue = function(sValue){
	
	return (sValue==0||sValue=='0'||sValue==false||sValue==='false'||sValue=='f');
};


// give search values the right shape
// t.i. values of select boxes must start with 'exact:' (except when value is empty)
// [which allow the resulting query to be very fast (as exact: will force use of '=' operator)]
// and other values remain unchanged
sf.giveRightShapeToSearchValue = function(sTableName, sColumnName, sValue){

	var oTableConfig = conf.getTableConfig(sTableName);
	
	var oColumnConfig = conf.getColumnConfig( oTableConfig, sColumnName);
	
	var iColumnIndex = $.inArray(sColumnName, mt.getListOfColumnsOf(sTableName));
	
	var isASelectBox = conf.getSelectionBox(oColumnConfig) != null || mt.getListOfColumnTypesOf(sTableName)[iColumnIndex]==USER_DEFINED;
	
	// query transformation (config lile "searchform": function(value){return value.blah();})
	var fnColumnSearchQueryTransformFunction = conf.getSearchForm(oColumnConfig);
	
	if (	isASelectBox && 
			fnColumnSearchQueryTransformFunction == null && // custom query transformation has priority on general transformation
			( sValue != '' && !$.startsWith(sValue, "exact:") && !$.startsWith(sValue, "^") && !isRegex(sValue) && (mt.getListOfColumnTypesOf(sTableName))[iColumnIndex] != "integer") 
		)
		sValue = "exact:"+sValue; //+escapeRegexChars( sValue );
	
	
	
	

	
	// apply custom query transformation if general transformation was canceled
	if (fnColumnSearchQueryTransformFunction != null)
		sValue = fnColumnSearchQueryTransformFunction(sValue);
	
	return sValue;
};


// ========================================================================================
// QUERY BUILDER
// ========================================================================================


// generate query builder

sf.getQueryBuilder = function(sTableName, sColumnName, sOtherColumnsFiltersAndValues, oAlternativeKeysAndValues){
	
	// read configuration:
	
	var oTableConfig = 		conf.getTableConfig(sTableName);	
	var oColumnConfig = 	conf.getColumnConfig( oTableConfig, sColumnName);
	
	// if query builder is not allowed for this column, we stop here
	if (conf.getQueryBuilderAllowed(oColumnConfig) == false) {
		return true;
	}
	
	
	// get the allowed search values (keys) and their conversion in a wellformed query (values)
	var oKeysAndValues =	conf.getQueryBuilderValues(oColumnConfig);
	
	// but if oKeysAndValues is null ...
	if ( oKeysAndValues == null){
		if (oAlternativeKeysAndValues == null) {
			// read unique values from database and call this function again!
			sf.getUniqueValuesForQueryBuilder(sTableName, sColumnName);
			return false;
		}
		else {
			// now, if we have read the database values, we are ready to carry on
			oKeysAndValues = oAlternativeKeysAndValues;
		}
	}
	
	// get the processor, which defines how to build the query given the chosen search values
	var fnProcessor = 		conf.getQueryBuilderProcessor(oColumnConfig);
	
	// settings
	var oSettings =			conf.getQueryBuilderSettings(oColumnConfig);
	var bGrid = 			(oSettings != null && typeof oSettings["grid"] != 'undefined' && oSettings["grid"] == true);	
	var aAlreadyChosen = 	(oSettings != null && typeof oSettings["preselected"] != 'undefined' ? oSettings["preselected"] : null);
	var bAutoStart = 		!(oSettings != null && typeof oSettings["autostart"] != 'undefined' && oSettings["autostart"] == false);
	
	
	// build dialog 
	
	var promptDivId = "dialog-message"+getUniqueNumber();
	var selectableId = "selectable"; // don't change that one: the css expects this id!	
	
	var sMessageP = $("<p></p>").html(lang.search_help_msg);
	
	var promptDiv = $("<div></div>")
		.attr("id", promptDivId)
		.attr("title", lang.search_help)
		.css("font-size", "12px")
		.append(sMessageP);
	
	
	// extra options
	
	// [a] checkbox: negation
	
	var bNegation = false;	
	var negationCheck = $("<div ></div>")
		.css("background-color", "#E0E6F8")
		.append(
			$('<label />').html(lang.search_help_search_for_contrary).prepend(
					$("<input />", {"type": "checkbox", "id": "querybuilder_negation_checkbox", "name": "querybuilder_negation_checkbox"})
						.click(function(){bNegation = !bNegation;})
					)
			)
		.css("border", "1px black outset")
		.css("padding", "3px");
	promptDiv.append(negationCheck);
	promptDiv.append("<p></p>");
	
	// [b] checkbox: exact match
	
	var bExactMatch = false;
	var exactMatchCheck = $("<div></div>")
		.css("background-color", "#E0E6F8")
		.append(
			$('<label />').html(lang.search_help_search_for_exact_match).prepend(
					$("<input />", {"type": "checkbox", "id": "querybuilder_exactmatch_checkbox", "name": "querybuilder_exactmatch_checkbox"})
						.click(function(){bExactMatch = !bExactMatch;})
					)
			)
		.css("border", "1px black outset")
		.css("padding", "3px");
	promptDiv.append(exactMatchCheck);
	promptDiv.append("<p></p>");
	
	
	// filter input
	
	var filter = $("<div></div>")
		.append(
			$("<span></span>")
				.text(lang.filter_regex+ ": ")
		)
		.append(
			$("<input></input>")
				.attr("id", "querybuilder_valuefilter")
				.bind("input propertychange", function (evt) {
					// https://stackoverflow.com/questions/5917344/jquery-value-change-event-delay
					
				    // If it's the propertychange event, make sure it's the value that changed.
				    if (window.event && event.type == "propertychange" && event.propertyName != "value")
				        return;
				
				    // Clear any previously set timer before setting a fresh one
				    window.clearTimeout($(this).data("timeout"));
				    $(this).data("timeout", setTimeout(function () {

				    	// read new unique values given filter
				    	var sFilter = 	$("#querybuilder_valuefilter").val();
						var sLimit = 	$("#querybuilder_limit").val();
						var bSortbyfreq=$("#querybuilder_sortbyfreq").find(":selected").val();
						sf._getUniqueValuesForQueryBuilder(sTableName, sColumnName, sFilter, sOtherColumnsFiltersAndValues, sLimit, bSortbyfreq, function(oValues){
							
							oKeysAndValues = new cloneObject(oValues);							
							$("#"+selectableId).empty();							
							buildSelectOptions(oKeysAndValues);
							
						});
						
				    }, 1000));
				})
		)
		.append(
			$("<span></span>")
				.text(" " +lang.show_max+ " ")
		)
		.append(
			$("<input></input>")
			.css("width", "40px")
			.val(20)
			.attr("id", "querybuilder_limit")
			.bind("input propertychange", function (evt) {
					// https://stackoverflow.com/questions/5917344/jquery-value-change-event-delay
					
				    // If it's the propertychange event, make sure it's the value that changed.
				    if (window.event && event.type == "propertychange" && event.propertyName != "value")
				        return;
				
				    // Clear any previously set timer before setting a fresh one
				    window.clearTimeout($(this).data("timeout"));
				    $(this).data("timeout", setTimeout(function () {

				    	// read new unique values given filter
				    	var sFilter = 	$("#querybuilder_valuefilter").val();
						var sLimit = 	$("#querybuilder_limit").val();
						var bSortbyfreq=$("#querybuilder_sortbyfreq").find(":selected").val();
						sf._getUniqueValuesForQueryBuilder(sTableName, sColumnName, sFilter, sOtherColumnsFiltersAndValues, sLimit, bSortbyfreq, function(oValues){
							
							oKeysAndValues = new cloneObject(oValues);							
							$("#"+selectableId).empty();							
							buildSelectOptions(oKeysAndValues);
							
						});
						
				    }, 1000));
				})
		)
		.append(
			$("<span></span>")
				.text(" "+lang.options+" ")
		)
		.append(
			$("<select></select>")
			.attr("id", "querybuilder_sortbyfreq")
			.append(
				$("<option></option>").val("true").text(lang.sort_by_freq)
			)
			.append(
				$("<option></option>").val("false").text(lang.sort_alphabetically).attr("selected", "selected")
			)
			.bind("input propertychange", function(evt){

				// If it's the propertychange event, make sure it's the value that changed.
				if (window.event && event.type == "propertychange" && event.propertyName != "value")
					return;

				// Clear any previously set timer before setting a fresh one
				    window.clearTimeout($(this).data("timeout"));
				    $(this).data("timeout", setTimeout(function () {

				    	// read new unique values given filter
				    	var sFilter = 	$("#querybuilder_valuefilter").val();
						var sLimit = 	$("#querybuilder_limit").val();
						var bSortbyfreq=$("#querybuilder_sortbyfreq").find(":selected").val();
						sf._getUniqueValuesForQueryBuilder(sTableName, sColumnName, sFilter, sOtherColumnsFiltersAndValues, sLimit, bSortbyfreq, function(oValues){
							
							oKeysAndValues = new cloneObject(oValues);							
							$("#"+selectableId).empty();							
							buildSelectOptions(oKeysAndValues);
							
						});
						
				    }, 1000));

			})
		);
	promptDiv.append(filter);
	promptDiv.append("<p></p>");

	
	// 'selectable' part: the options to choose from	
	
	var selectableUl = bGrid ?
				$("<ol></ol>")							// grid type
				.attr("id", selectableId)
				.css("list-style-type", "none")
				.css("margin", "0")
				.css("padding", "0")
				.css("width", "80%")
			:
				$("<ol></ol>")							// list type
				.attr("id", selectableId)
				.css("list-style-type", "none")
				.css("margin", "0")
				.css("padding", "0")
				.css("width", "auto") // allow longer values to be rendered nicely
			;
	
	
	// build the elements of the list to choose from
	
	buildSelectOptions = function(oKeysAndValues){
		
		for (sOption in oKeysAndValues){
		
			// one element 		
			var liElement =  bGrid ?
					$("<li></li>")							// grid type
					.addClass( "ui-state-default" )
					.css("margin", "3px")
					.css("padding", "1px")
					.css("float", "left")				
					.css("width", "200px")
					.css("height", "40px")
					.css("line-height", "40px") // should be the same as height (https://stackoverflow.com/questions/3400548/how-to-vertically-align-li-elements-in-ul)
					.css("font-size", "12px")
					.css("text-align", "center")
				:
					$("<li></li>")							// list type
					.addClass( "ui-widget-content" )
					.css("margin", "3px")
					.css("padding", "0.4em")
					.css("font-size", "12px")
					.css("height", "18px")
				;	
			
			// if some item was pre-selected, assign it the selected class
			if (aAlreadyChosen != null && aAlreadyChosen.indexOf(sOption)>-1){
				liElement.addClass("ui-selected");
			}
			
			var spanElement = $("<span></span>")
				.html( $.trim(sOption) );
			liElement.append(spanElement);
			selectableUl.append(liElement);
		}
	}
	
	buildSelectOptions(oKeysAndValues);
	
	// append the list/grid to the dialog box
	
	promptDiv.append(selectableUl);
	
	
	// append the whole thing to the dialog
	
	$(document.body).append(promptDiv);
	
	
	// adapt height of the prompt to the number of values 
	var promptHeight = (250 + 30 * countProperties(oKeysAndValues));
	
	
	// Open dialog	
	// Important detail: Pressing enter should trigger click on OK button
	// cross-browser implementation: http://stackoverflow.com/questions/868889/submit-jquery-ui-dialog-on-enter
	// only change is use of keyup instead of keypress, otherwise it doesn't work in some cases
	$( "#"+promptDivId ).dialog({
		autoOpen: false,
        height: promptHeight,
        width: 650,  // 'auto' setting caused dialog to get to small, very ugly and not readable
        modal: true,
        open: function( event, ui ){
        	$(".ui-dialog").addClass("ui-dialog-shadow");
        	$( this ).closest(".ui-dialog").putInFront();
        },
        close: function(event, ui){
        	
        	// remove 'selectableselected' event
            $( "#"+selectableId ).off();
            
        	$( this ).remove();
            
        },
        buttons: [
                  {
                	  text: lang.ok,
                	  click: function(){
                		  
						var aNewChosenOptions = new Array();
						  
						var aSelectedNodes = $("li.ui-selected");
						aSelectedNodes.each(function(){
							// sometimes doubles are added somehow, so prevent this!
							if (aNewChosenOptions.indexOf( $(this).text() )<0)
								  aNewChosenOptions.push( $(this).text());
						});
						

						// generate output
						// that is: get the conversion (declared in config)
						// and if available, process those conversion with some processor
						
						var aOutput = new Array();
						for (var i=0; i<aNewChosenOptions.length; i++){
							var oneNewChoice = aNewChosenOptions[i];

							aOutput.push( escapeRegexChars( oKeysAndValues[oneNewChoice] ) );
						}


						// ready for final steps:
						// ---------------------

						// cut off the counts from the values
						aOutput = sf._cutoffCounts(aOutput);


						// turn array of chosen values into regex string

						var sOutput = "("+aOutput.join("|")+")";
						
                		// or, if set in config, call the processor to process the values
						if (fnProcessor != null)
							sOutput = fnProcessor(aOutput);
						
						// exact match?
						if (bExactMatch)
							sOutput = "^"+sOutput+"$";
						
						// negation?
						if (bNegation)
							sOutput = "!"+sOutput;						
						
						// call close function
                		$( this ).dialog( "close" );                		
                		
                		// now do what this is all about: put the built query in the search box
                		fn.putDataIntoFilterBox(sTableName, sColumnName, sOutput);
                		
                		// autostart
                		if (bAutoStart)
                			sf.startMultiColumnSearch(sTableName);
                		
                	},
                	id: 'dialog_accept_button'
                  },
                  {
                	  text: lang.cancel,
                	  click: function() {
                		  
                		// call close function
                		  $( this ).dialog( "close" );                          
                      }
                  }
        ]
	}).keyup(function() {		 
		if (kf.isPressed("enter"))
		{		
		$( "#dialog_accept_button" ).click();		
		return false;
		}
	});
	
	$( "#"+promptDivId ).dialog( "open" );
	
	$( function() {		
		
		$( "#"+selectableId ).selectable();	
			
	});
}


// process array of values from the queryBuilder list, to make sure the count-value at the end of each string is removed
//
// like:				becomes:
//  somevalue1 (234)  		somevalue1
//	somevalue2 (654)		somevalue2
//	somevalue3 (31)			somevalue3
sf._cutoffCounts = function (aValueWithCounter){
	
	for (var i=0; i<aValueWithCounter.length; i++){
		// the replacement also matches the regex espaced chars of the count part [ t.i. like \(654\) ]
		aValueWithCounter[i] = (aValueWithCounter[i]).replace(/\\\([\d]+\\\)$/i, "").trim();
	}
	return aValueWithCounter
};


//needed for query builder to have values to work with
sf.getUniqueValuesForQueryBuilder = function(sSomeTableName, sCurrentColumnName){
	
	// gather the filters surrounding the column we search the uniques values of

	var oOtherFilters = mt.getDataTableObjectOf(sSomeTableName).getSearchFilters();
	var aOtherColumnsFiltersAndValues = new Array();
	for (var sOneFilter in oOtherFilters){
		if (sOneFilter != sCurrentColumnName && oOtherFilters[sOneFilter] != null && oOtherFilters[sOneFilter] != ''){
			aOtherColumnsFiltersAndValues.push( sOneFilter +"###"+ oOtherFilters[sOneFilter]);
		}
	}
	var sOtherColumnsFiltersAndValues = aOtherColumnsFiltersAndValues.join(ARG_INTERNAL_SEPARATOR);

	sf._getUniqueValuesForQueryBuilder(sSomeTableName, sCurrentColumnName, null, sOtherColumnsFiltersAndValues, null, null, function(oValues){
		
		sf.getQueryBuilder(sSomeTableName, sCurrentColumnName, sOtherColumnsFiltersAndValues, oValues);
	})
}

sf._getUniqueValuesForQueryBuilder = function(sSomeTableName, sCurrentColumnName, sValueFilter, sOtherColumnsFiltersAndValues, sLimit, bSortbyfreq, fnFunction){
	
	gui.showProcessingMsg(sSomeTableName);
	
	var url = WEBSERV_URL+"/api/get_unique_values_with_limit";
	$.ajax( {
		"type": "GET",
		"async": false, // needed to block code execution while awaiting the server response
		"url": url,
		"data": {
			"db_name": getHttpParams().get("db"),
			"table_name": sSomeTableName,
			"column_name": sCurrentColumnName,
			"column_value_filter": sValueFilter,
			"other_columns_filters_and_values": sOtherColumnsFiltersAndValues,
			"limit": ((sLimit == null || sLimit == '') ? 20 : sLimit),
			"sort_by_freq": bSortbyfreq,
			"dummy": getUniqueNumber()
			},
	 	"dataType": "xml", // get response as xml
	 	"success": function(xml) {
	 		
	 		// add values from XML
	 		var oValues = {};	 		
	 		$(xml).find("oneValue").each(function(){
	 			var thisValue = $(this).text();	 			
	 			oValues[thisValue] = thisValue;
	 			});	
	 		
	 		gui.removeProcessingMsg(sSomeTableName);
	 		
	 		if (typeof fnFunction != 'undefined')
	 			{
	 			fnFunction(oValues);
	 			}
	 		},
		"error": function(jqXHR, textStatus, errorThrown){
			gui.removeProcessingMsg(sSomeTableName);
			fn.message(lang.error_occurred_in_table+ " '"+sSomeTableName+"'", lang.error_when_calling+" sf._getUniqueValuesForQueryBuilder. "+
				textStatus+" "+errorThrown);
			}
		} );
}