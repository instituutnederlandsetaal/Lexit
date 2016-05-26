/**
 * 
 */

var sf = {};



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
	
	$("#"+sSomeTablename+"_searchboxes div").each(function(i){
		
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
		
		var sCurrentColumnName = $('#'+sSomeTablename+' thead th').eq(i).text();
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
		if (bCurrentColumnIsASelectBox && sCurrentColumnValue!="")
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
	
	if (sColumnName=="")
		{
		fn.message("Let op", "Tik een zoekterm in een zoekbox boven een kolom, en klik dan pas op 'Ga naar'!");
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
	
	if ( aSortColumns == null || aSortColumns.length == 0 )
		{
		fn.message("Let op", "De tabel '"+sSomeTablename+"' is niet gesorteerd op een kolom. De functie 'Ga naar' werkt niet zonder sortering. Sorteer eerst de tabel op een kolom.");
		return;
		}
	
	gui.showProcessingMsg(sSomeTablename);
	
	var url = WEBSERV_URL+"/table/get_row_number";
	
	$.ajax(
			{
				type: "GET",
				url: url,
				data: {
					"db_name": getHttpParams().get("db"),
					"table_name": sSomeTablename, 
					"column_name": sColumnName,
					"column_value": sColumnValue,
					"sort_columns": aSortColumns.join(","),
					"sort_directions": aSortDirections.join(","),
					"filter_column_names": filterColumnNames.join(ARG_INTERNAL_SEPARATOR),
					"filter_values": filterValues.join(ARG_INTERNAL_SEPARATOR)
					
					},
				dataType: "xml",
				contentType: "application/x-www-form-urlencoded;charset=UTF-8",
				success: function(xml) {
					gui.removeProcessingMsg(sSomeTablename);
					sf.goToPageGiveXmlResponse(xml, sSomeTablename);
					},
				error: function(jqXHR, textStatus, errorThrown){
					gui.removeProcessingMsg(sSomeTablename);
					fn.message("Fout in tabel '"+sSomeTablename+"'", "XML laden mislukt: "+textStatus+" "+errorThrown);
					}
			});
};

// subroutine of sf.getRowNumber
// go to a given table position, given some requested row number got as XML
sf.goToPageGiveXmlResponse = function(xml, sSomeTablename){
	
	var sRowNumber = $(xml).find("response").text();
	var iRowNumber = parseInt(sRowNumber);
	
	mt.getDataTableObjectOf(sSomeTablename).displayRow(iRowNumber).draw(false);
};




// enable the search fields (normally called only at initialisation, or at each draw in 'optimal mode')
// job: 
// - disable default behaviour (which is: fire new search query at each keypress event = too demanding)
// - set 'pressing enter' as start sign for search actions
// - set special checkbox filter when column is boolean (bit varying)


sf.enableSearchFields = function(someTablename){
	
	// disable automatic search on keypress (default behavious of Datatables)
	// now search starts only after pressing enter
	
	// main search function
	$('#'+someTablename+'_filter input').unbind('keyup');
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
	$("#"+someTablename+"_dynamic").off('keyup', '#'+someTablename+'_searchboxes div input');
	$("#"+someTablename+"_dynamic").on('keyup', '#'+someTablename+'_searchboxes div input', function(e) {
		
		// pressed keys are normally caught by the attached events in kf.addKeyFunctions()
		// but since the keyup-event on input-element is overriden here,
		// we need to call registerPressedKey() again here.
		kf.registerPressedKey(e);
		
		if (kf.isPressed("enter")) {			
        	sf.startMultiColumnSearch(someTablename);
		}
    } );
	

	// empty whole-table search field when clicking on per-column search field
	// (this is meant to prevent user confusion, as he/she wouldn't understand the search
	//  results if some 'forgotten' search string in the main search box is affecting the search)
	$("#"+someTablename+"_dynamic").off("focus", '#'+someTablename+'_searchboxes div input');
    $("#"+someTablename+"_dynamic").on("focus", '#'+someTablename+'_searchboxes div input', function () {
    	
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
	
	var bSearchBoxesExistedAlready = $("#"+someTablename+"_searchboxes").elementExists();
	
	
	var sSearchBoxesDiv = $("<div></div>")
		.attr("id", someTablename+"_searchboxes")
		.bind("mouseenter", function(){gui.setSearchboxesCss(someTablename);})
		.css("display", "block")
		.css("visibility", "hidden");
	
	
	$('#'+someTablename+' thead th').each( function(i){
		
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
		
		// if we have a checkbox column, we need checkbox-filters!
		var isACheckBox = ($(this).hasClass("editable_checkbox") || $(this).hasClass("not_editable_checkbox"));
		// or do we have a selectbox?
		var isASelectBox = aColumnSelectionBox != null || mt.getListOfTypesOfVisibleColumnsOf(someTablename)[i]==USER_DEFINED;
		
		
		
		// what kind of filter should we have?
		var inputTag;
		
		// 1. selection box
		if (isASelectBox)
			{
			// We have two possible selection box types
			//    [1] set in client configuration (conf.getSelectionBox)
			var aListOfOptions = aColumnSelectionBox;
			// or [2] set in Postgres database (Postgres ENUM type)
			if (aColumnSelectionBox == null)
				{
				aListOfOptions = cloneArray(mt.getListOfAllowedValuesInVisibleColumnsOf(someTablename)[i]);
				
				// empty value as neutral choice
				aListOfOptions.unshift("");
				}
			
			// add 'ALLES' value to be able to choose everything except neutral value(s)
			var sAllOptions = "";
			var aAllAllowedValues = new Array(); 
			for (var j=0; j<aListOfOptions.length; j++)
				{
				if (aListOfOptions[j] != '' && aListOfOptions[j] != '-')
					{
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
						.text( "Kiezen" )
				);
			for (var j=1; j<aListOfOptions.length; j++)
				{
				inputTag.append(
						$("<option></option>")							
							.attr("value", aListOfOptions[j] )
							.text( aListOfOptions[j] )
					);
				}
			// finally add the 'ALLES' option
			if (sAllOptions != null)
				{
				inputTag.append(
						$("<option></option>")							
							.attr("value", sAllOptions )
							.text( "ALLES" )
					);
				}
			
			}
		
		// 2. checkbox
		else if (isACheckBox)
			{
			inputTag = $("<input/>")
				.attr("type", "checkbox")
				.attr("disabled", !columnSearchable)
				.attr("title", "Neutraal")
				.attr("cycle_value", 0);
			}
		
		// 3. text field
		else
			{
			inputTag = $("<input/>")
				.attr("disabled", !columnSearchable);			
			}
		

		
		// the right filter type is set,	
		// now append the search box to the user interface
				
		sCurrentSearchBoxDiv = $("<div></div>")			
			.css("display", "inline")
			.append(inputTag.attr("id", someTablename+"_searchbox_"+sCurrentColumnName));
		sSearchBoxesDiv.append(sCurrentSearchBoxDiv);
		
		
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
		if (isASelectBox)
			{			
			inputTag.val(sStartValueOfThisColumn);
			}
		
		// for checkboxes, we also need to (un)check the checkbox
		if (isACheckBox)
			{
			var iCycleValue;
			if (sStartValueOfThisColumn == '')
				{
				iCycleValue = 0;
				}
			else if (sf.isCheckboxTrueValue(sStartValueOfThisColumn))
				{
				iCycleValue = 1;
				inputTag.prop("checked", "checked");
				}
			else if (sf.isCheckboxFalseValue(sStartValueOfThisColumn))
				{
				iCycleValue = 2;
				}
			sf.setCheckboxRight(sCurrentSearchBoxDiv, iCycleValue);	
			}
			
	});
	
	
	
	// append the searchboxes we just built
	if ($("#"+someTablename+"_searchboxes").elementExists())
		$("#"+someTablename+"_searchboxes").replaceWith(sSearchBoxesDiv);
	else
		$("#"+someTablename).before(sSearchBoxesDiv);
	
	
	
	
	// *************************		
	// EVENTS to be attached (upon changing searchbox content)
	// *************************
	
	// last job: add events the search box should react to
	
	$('#'+someTablename+' thead th').each( function(i){
		
		var sCurrentColumnName = mt.getListOfVisibleColumnsOf(someTablename)[i];
		var oColumnConfig = conf.getColumnConfig( oTableConfig, sCurrentColumnName);
		// do we have a selection box?
		var aColumnSelectionBox = conf.getSelectionBox(oColumnConfig);
		
		// if we have a checkbox column, we need checkbox-filters!
		var isACheckBox = ($(this).hasClass("editable_checkbox") || $(this).hasClass("not_editable_checkbox"));
		// or do we have a selectbox?
		var isASelectBox = aColumnSelectionBox != null || mt.getListOfTypesOfVisibleColumnsOf(someTablename)[i]==USER_DEFINED;
		
		// add click event for checkbox filters
		if (isACheckBox)
			{
			$("#"+someTablename+"_dynamic").off('click', "#"+someTablename+"_searchboxes div:eq("+i+")");
			$("#"+someTablename+"_dynamic").on('click', "#"+someTablename+"_searchboxes div:eq("+i+")", function(){				
				
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
		else if (isASelectBox)
			{
			$("#"+someTablename+"_dynamic").off('change', "#"+someTablename+"_searchboxes div:eq("+i+") select");
			$("#"+someTablename+"_dynamic").on('change', "#"+someTablename+"_searchboxes div:eq("+i+") select", function(){
				
				// remove focus from search box, to prevent unpredictable change because of user pressing an arrow key
				$(this).blur();
										
				// remember last searchbox clicked upon (needed for goto function)
				mt.rememberLastSearchBoxClickUpon(someTablename, i);
				
				var iTrueIndex = $.inArray(mt.getListOfVisibleColumnsOf(someTablename)[i], mt.getListOfColumnsOf(someTablename));
				
				// fire filter straight away
				mt.getDataTableObjectOf(someTablename).column(iTrueIndex).search($(this).val()).draw();
				
				});				
			}
		else 
			{
			$("#"+someTablename+"_dynamic").off('click', "#"+someTablename+"_searchboxes div:eq("+i+")");
			$("#"+someTablename+"_dynamic").on('click', "#"+someTablename+"_searchboxes div:eq("+i+")", function(){
				
				// remember last searchbox clicked upon (needed for goto function)
				mt.rememberLastSearchBoxClickUpon(someTablename, i);
				
				});
			}
		
	});

};



// make sure the current filter values are visible in all search boxes
sf.putCurrentValueInAllSearchBoxes = function(sTablename){	
	
	// get the table filters settings
	var oFilterSettings = mt.getDataTableObjectOf(sTablename).getSearchFilters();
	var oTableConfig = conf.getTableConfig(sTablename);
	
	// process each visible column
	$("#"+sTablename+"_searchboxes div").each(function(i){
		
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
		if (isASelectBox)
			{
			inputTag =  $(this).find("select").eq(0);
			inputTag.val(sCurrentValueOfThisColumn);			
			}	
		
		
		// 2. checkbox
		else if (isACheckBox)
			{
			inputTag = $(this).find("input").eq(0);
			
			var iCycleValue;
			if (sCurrentValueOfThisColumn == '')
				{
				iCycleValue = 0;
				}
			else
				{
				iCycleValue = inputTag.attr("cycle_value");
				}			
			sf.setCheckboxRight($(this), iCycleValue);			
			if (sf.isCheckboxTrueValue(sCurrentValueOfThisColumn))
				inputTag.prop("checked", "checked");
			}
		
		// 3. text field
		else
			{
			inputTag = $(this).find("input").eq(0);
			inputTag.val(sCurrentValueOfThisColumn);
			}
	});
	
};



// give the checkbox filter the right color etc., 
// so as to make the filter setting visible to the user

// checkboxes have a cycle value 
// values of several settings depend on the phase in the cycle (0 to 2)
// we have three possible settings, following each other in a cycle
//  0: unchecked  -> no value
//  1: checked    -> true
//  2: unchecked  -> false
var aCheckboxBackgroundColors =	["#FFFFFF",	"#D8F6CE",	"#F5A9A9"];
var aCheckboxCheckvalue =     	["",		"1",		"0"];
var aCheckboxCheckvalueTitle =	["Neutraal","Aan",  	"Uit"];
var aCheckboxVisibleSetting = 	[false,  	true,		false];

sf.setCheckboxRight = function(sSearchBoxesDiv, iCycleValue){
	
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





// clear all column filters
// and put in the initialization filter values if
// config file requires that

sf.clearPerColumnSearchFields = function(someTablename){
	
	var oTableConfig = conf.getTableConfig(someTablename);
	
	// clear all search field
	$("#"+someTablename+"_searchboxes div").each(function(i){		
		
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
	$("#"+someTablename+"_searchboxes div").each(function(){
		var isACheckBox = $(this).find("input").eq(0).attr("type")=="checkbox";
		if(isACheckBox) {
			// remove the color indicating some value is activated (true or false)
			$(this).css("background-color", "#FFFFFF");
			$(this).find("input").eq(0).removeAttr("checked");	
			// the value of the checkbox needs to be set (doesn't happen upon checking the box!)
			$(this).find("input").eq(0).val("");
		}		
	});
	
};


// clear main search field
		
sf.clearSearchField = function(someTablename){
	$("#"+someTablename+"_filter input").val("");
};
		
		

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
	$("#"+someTablename+"_searchboxes div").each(function(i){
				
		var oColumnConfig = conf.getColumnConfig(oTableConfig, mt.getListOfVisibleColumnsOf(someTablename)[i]);
		var columnSearchQueryTransformFunction = conf.getSearchForm(oColumnConfig);
		
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
		
		// if needed (config file), transform the query
		if (columnSearchQueryTransformFunction != null)
			oneSearchBoxValue = columnSearchQueryTransformFunction(oneSearchBoxValue);
		
		
		// ** TEXT or SELECT filter **
		// Filter on the column if string non empty 
		if (!isACheckBox && jQuery.trim(oneSearchBoxValue)!='')
			{
			// get the true index (we want the index in all column, not the index in visible columns)
			var iTrueIndex = $.inArray(mt.getListOfVisibleColumnsOf(someTablename)[i], mt.getListOfColumnsOf(someTablename));
			
			// set the filter, with the correct column index			
			mt.getDataTableObjectOf(someTablename).column(iTrueIndex).search(oneSearchBoxValue);
			}
		
		// ** CHECKBOX filter **
		// Filter on the column if it is a checkbox and it has a filter value activated (colored)
		if (isACheckBox)
			{
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


// check if a given value means 'true' or 'false', if it belongs to a checkbox
sf.isCheckboxTrueValue = function(sValue){
	
	return (sValue==1||sValue=='1'||sValue==true||sValue=='t');
};
sf.isCheckboxFalseValue = function(sValue){
	
	return (sValue==0||sValue=='0'||sValue==false||sValue=='f');
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
	
	if (isASelectBox && 
			( sValue != '' && !$.startsWith(sValue, "exact:") && !$.startsWith(sValue, "^") ) 
		)
		sValue = "exact:"+sValue; //+escapeRegexChars( sValue );
	
	return sValue;
};




