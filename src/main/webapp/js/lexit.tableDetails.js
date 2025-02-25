/**
 * table details
 * request or process the list of columns of a given table
 */


var td = {};


// get the columns names and details of a given table

td.getColumnsOfTable = function(sSomeTableName, fnFunction, oExtraTableSettings){
	
	var url = WEBSERV_URL+"/api/getcolumns";
	
	$.ajax({
		type: "GET",
		url: url,
		data: {
			"table": sSomeTableName, 
			"db_name": getHttpParams().get("db") 
			},
		dataType: "xml",
		//contentType: "application/x-www-form-urlencoded;charset=UTF-8",
		success: function(xml) {
			td.processColumnResponse(xml, sSomeTableName, fnFunction, oExtraTableSettings);
			},
		error: function(jqXHR, textStatus, errorThrown){
			fn.message(lang.error_occurred_in_table+ " '"+sSomeTableName+"'", lang.loading_xml_failed+ ": "+textStatus+" "+errorThrown);
			}
	});
	
	
};



// process the list of columns of a table, so as to build the table properly
// (this is call by the previous function td.getColumnsOfTable)

td.processColumnResponse = function(xml, sSomeTableName, fnFunction, oExtraTableSettings, fnSecretCallback){
	
	var aAllColumns = new Array();	
	var aColumnsTypes = new Array();
	var oaAllowedValuesForColumns = new Array();	
	
	// retrieve table client configuration	
	var oTableConfig = conf.getTableConfig(sSomeTableName); 
		
	$(xml).find("columns").find("column").each(function(){
		
		var sColumnName = $(this).find("column_name").text();
		
		var sCurrentColumnName = $(this).find("column_name").text();
		var sCurrentColumnType = $(this).find("column_type").text();
		var aCurrentAllowedValues = $(this).find("customtype_values").text().split("|");
		var aCurrentColumnComment = $(this).find("column_comment").text();
		
		// The column comment is meant to modify the configuration of the javascript file
		// (read explanation of function td._processColumnComments)
		td._processColumnComments(sSomeTableName, sColumnName, aCurrentColumnComment);
		
		aAllColumns.push( sCurrentColumnName );				
		aColumnsTypes.push( sCurrentColumnType );
		oaAllowedValuesForColumns.push( aCurrentAllowedValues );
		
		// if the current column is set to searchable:false, we have to disable the search field
		var oColumnConfig = conf.getColumnConfig( oTableConfig, sCurrentColumnName );
		
		// do we have a selection box?
		var aColumnSelectionBox = conf.getSelectionBox(oColumnConfig);
		
		// if this column is set in the user configuration as a selection box
		// and the given array of values to select from is empty, that means we need
		// to get the values from the database (select distinct <col_name>). Do it now!
		if (aColumnSelectionBox != null && aColumnSelectionBox.length == 0)
		{				
			var url = WEBSERV_URL+"/api/get_unique_values";
			$.ajax( {
				"type": "GET",
				"async": false, // needed to block code execution while awaiting the server response
				"url": url,
				"data": {
					"db_name": getHttpParams().get("db"),
					"table_name": sSomeTableName,
					"column_name": sCurrentColumnName,
					"dummy": getUniqueNumber()
					},
			 	"dataType": "xml", // get response as xml
			 	"success": function(xml) {				 		
			 		// put the array of values into the configuration variable "choosefrom" of that column			 		
			 		conf.changeTableConfigValue(sSomeTableName, sCurrentColumnName, "choosefrom", td._getUniqueValues(xml));
			 		},
				"error": function(jqXHR, textStatus, errorThrown){
					fn.message(lang.error_occurred_in_table+ " '"+sSomeTableName+"'", lang.error_while_building_searchbox+ ": '"+sColumnName+"' "+
						textStatus+" "+errorThrown);
					}
				} );
			}
				
	});
	
	
	// we have a column list now, so we are able to 
	// make a shallow copy of the original config, so we can restore it when needed
	conf.makeRestoreCopyOfTableConfig(sSomeTableName, aAllColumns);
	
	
	// DEAL WITH SAVED CONFIG
	
	// adapt the configuration to custom user config (saved during some previous session)
	var sChosenColumns = $.cookie(fn.getCurrentProject()+"_"+sSomeTableName+"_columns");
	
	
	
	// the cookie contains a comma separated list of columns with their visibility settings and in the right order
	// like this:  col1:true,col2:false,...
	if (sChosenColumns != null) {
		var aCustomColumnOrder = new Array();
		var aChosenColumns = sChosenColumns.split(",");
		
		// if the number of saved columns in the cookie is the same as
		// the number of columns of the table, we can use the cookie
		// (we need this check, as some database update could cause some table or view
		//  to have more/less columns that before, so its number of columns won't
		//  match the number of columns in the cookie, causing an error)
		if (aChosenColumns.length == aAllColumns.length) {
			
			for (var i=0; i<aChosenColumns.length; i++) {
				
				var sColumnName = aChosenColumns[i].split(":")[0];
				aCustomColumnOrder.push(sColumnName);
				
				var sColumnVisibility = aChosenColumns[i].split(":")[1];						
				conf.changeTableConfigValue(sSomeTableName, sColumnName, "visible", sColumnVisibility=='true');
			}
			delete oTableSettingsList[sSomeTableName]["column_order"];  // make sure we don't have double settings (the singular setting is deprecated)
			conf.changeTableSettingValue(sSomeTableName, "columns_order", aCustomColumnOrder);
		}
		
		// if the test hereabove fails, remove the cookie, as it is incompatible now
		else {
			$.removeCookie(fn.getCurrentProject()+"_"+sSomeTableName+"_columns", { path: '/' });	
		}
	}
	
	
	
	// ----
	
	// retrieve the table settings and get the required column order, if any is given as a setting
	var aTableSettings = conf.getTableSettings(sSomeTableName);
	var aColumnOrder = conf.getColumnOrder(aTableSettings);
	
	
	// if a column order was given, reorder the column types accordingly
	if (aColumnOrder != null) {
		// first check if the list of columns returned by database is
		// the same as the list of columns from the table configuration settings
		var firstArray = cloneArray(aAllColumns);
		var secondArray = cloneArray(aColumnOrder);
		firstArray.sort();
		secondArray.sort();
		
		// the arrays are identical, we can proceed with the reordering of column types		
		if (arrays_equal(firstArray, secondArray)) {
			
			var aNewColumnTypes = new Array();
			var oaNewAllowedValues = new Array();
			// build new types list etc in right order
			for (var i=0; i<aColumnOrder.length; i++) {
				var iIndexOfCurrentColumnInOldColumnsArray = $.inArray(aColumnOrder[i], aAllColumns);				
				var sColTypeForCurrentColumn = aColumnsTypes[iIndexOfCurrentColumnInOldColumnsArray];
				var aAllowedValuesForCurrentColumn = oaAllowedValuesForColumns[iIndexOfCurrentColumnInOldColumnsArray];
				aNewColumnTypes.push(sColTypeForCurrentColumn);
				oaNewAllowedValues.push(aAllowedValuesForCurrentColumn);
				
			}			
			aAllColumns = aColumnOrder;
			aColumnsTypes = aNewColumnTypes;
			oaAllowedValuesForColumns = oaNewAllowedValues;
		}
		// if the arrays are not identical, we should give an error message
		else {
			
			var sCompare = lang.columns_list_to_compare + ": {" + symmetricDifference(firstArray, secondArray).join(", ") + "}";
			
			var sCause = (aColumnOrder.length != aAllColumns.length) ?
					lang.columns_list_number_mismatch1+": "+aAllColumns.length+".<BR><BR>"+
					lang.columns_list_number_mismatch2+": "+aColumnOrder.length+".<BR><BR>"+
					sCompare 
					: 
					lang.columns_list_name_mismatch1+ ":<BR>{"+ firstArray.join(", ") +"}.<BR><BR>"+
					lang.columns_list_name_mismatch2+ ":<BR>{"+ secondArray.join(", ") +"}<BR><BR>"+
					sCompare
			fn.message(lang.error_occurred_in_table+ " '"+sSomeTableName+"'", lang.columns_list_mismatch+ ": " +sCause+".");
		}
	}
	
	
	// assign list of columns names and types to table we're going to build
	mt.setListOfColumnsOf(sSomeTableName, aAllColumns);
	mt.setListOfColumnTypesOf(sSomeTableName, aColumnsTypes);
	// Postgres ENUM type
	mt.setListOfAllowedValuesInColumnsOf(sSomeTableName, oaAllowedValuesForColumns);
	
	removeSpinner('#indicators');
	
	// usual route is table building, but if a callback function is given, we call this function instead
	if (fnSecretCallback == null)
		tb.buildTable(sSomeTableName, fnFunction, oExtraTableSettings);
	else
		fnSecretCallback();
	
};


// Process the comments on columns.
// Comments are allowed to contain basic configuration we want to assign
// without using the normal javascript configuration file, but...
// BEWARE: using comments for this goal should remain a quick and dirty trick, enabling  
// ------  an administrator to update a configuration a bit without updating the
//         config-file, but this should never be the normal way to proceed
//         (one of the principles of Lex'it is that the database should never
//          be modified for Lex'it configuration, it is the other way round: Lex'it
//          has to adapt itself to the database).
td._processColumnComments = function(sSomeTableName, sColumnName, aCurrentColumnComment){
	
	var aSplitComments = aCurrentColumnComment.split(" ");
	for ( var i=0; i<aSplitComments.length; i++ )
		{
		// comments should contain properties separated by spaces,
		// and property name and value must be separated by ':'
		if (aSplitComments[i].split(":").length<2)
			continue;
		
		var sPropName = aSplitComments[i].split(":")[0];
		var sPropValue = aSplitComments[i].split(":")[1];
		var oProperValue;
		// set the right value (boolean or string)					
		if (sPropValue == "true") {oProperValue = true;}
		else if (sPropValue == "false") {oProperValue = false;}			
		else oProperValue = sPropValue;					
		
		// change the configuration of the table according to the
		// column comments
		if (sPropValue != '')
			conf.changeTableConfigValue(sSomeTableName, sColumnName, sPropName, oProperValue);
		}
};


// this is a subroutine of the function here above
// read the response from the database, and put the unique values into an array
td._getUniqueValues = function(xml){
	
	var aValues = new Array();	
	
	// add one empty value at index 0, needed as neutral value for the SELECT box
	aValues.push("");
	// add values from XML
	$(xml).find("oneValue").each(function(){
		var thisValue = $(this).text();
		if (thisValue == '') thisValue = '^$';
		aValues.push(thisValue);
	});	
	return aValues;
	
};


// This variable is set to TRUE when choosing option 'Herstel default' (restore default config).
// * When bRestoringOriginalConfig is set to TRUE, the algorithm knows it has just been restoring
//   the default config from the config.js-file, so it knows it doesn't need to save 
//   the columns configuration before the user modifies it (as it's available in config.js-file).
// * On the contrary, when bRestoringOriginalConfig is set to FALSE, the algorithm knows
//   the current configuration it not the default one, so it needs to be saved when the user
//   clicks on 'Toepassen'.
//
// N.B.:
//   The algorithm relies on the user's clicking 'Toepassen' to decide if the configuration has
//   been modified, which is of course not reliable by definition (as a user can click on 'Toepassen'
//   without having modified the configuration), but most of the time this strategy is good enough.
//   The only negative effect of clicking on 'Toepassen' without having modified anything, is
//   that the option 'Herstel default' will become available for restoring nothing, as nothing
//   was modified.
//
var bRestoringOriginalConfig = false;

// show a prompt to the user so he can choose which columns should be shown of not
td.selectColumns = function(sSomeTablename){
	
	// optimal mode was chosen? (default value is false) 
	var bOptimal = false;
	
	// retrieve table client configuration
	var oTableConfig = conf.getTableConfig(sSomeTablename);
	
	var promptDivId = "dialog-message"+getUniqueNumber();
	var sortableId = "sortable"+getUniqueNumber();
	
	var promptDiv = $("<div></div>")
		.attr("id", promptDivId)
		.attr("title", lang.columns_selection_and_order)
		.css("font-size", "12px");
	
	
	var sortableUl = $("<ul></ul>")
		.attr("id", sortableId)
		.css("list-style-type", "none")
		.css("margin", "0")
		.css("padding", "0")
		.css("width", "60%");
	
	
	// get list of columns to choose from
	var aColumnNames = mt.getListOfColumnsOf(sSomeTablename);
	
	// build the list of draggable and clickable columns
	
	for (var i=0; i<aColumnNames.length; i++)
		{
		// get column name
		var fieldLC = aColumnNames[i];
		
		// retrieve column client configuration
		var oColumnConfig = conf.getColumnConfig(oTableConfig, fieldLC);
		
		// there might be a preferred, GUI friendly name stated in config
		// (this name, if available, is the one to be displayed)
		var sNiceName = conf.getColumnNiceName(oColumnConfig);		
		
		// is the column visible?
		var columnVisible = conf.getVisibility(oColumnConfig);
		
		
		var input = $("<input></input>")
			.attr("type", "checkbox")
			.attr("name", fieldLC)			
			.attr("id", "prompt_"+fieldLC)
			// some users (un)checking a box implies that the table is NOT in automatic/optimal mode  
			.click(function(){bOptimal = false;}); 
		
		// check the box if the column is visible
		if (columnVisible)
			input.prop("checked", "checked");
		// if modifying the visibility is not allowed, disable the checkbox 
		if ( !conf.getFlexibleVisibility(oColumnConfig) )
			input.attr("disabled", "disabled");
		
		var liElement = $("<li></li>")
			.addClass( "ui-state-default" )
			.attr("id", fieldLC)
			.css("margin", "0 3px 3px 3px")
			.css("padding", "0.4em")
			.css("padding-left", "1.5em")
			.css("font-size", "1.0em")
			.css("height", "18px")
			.prepend(input);		
		var spanElement1 = $("<span></span>")
			.addClass( "ui-icon ui-icon-arrowthick-2-n-s" )	
			.css("position", "absolute")
			.css("margin-left", "-3.0em");
		var spanElement2 = $("<span></span>")
			.text( sNiceName != null ? sNiceName : fieldLC ); // show column name of (if available) a preferred, GUI friendly name
		liElement.append(spanElement1);
		liElement.append(spanElement2);
		sortableUl.append(liElement);
		}	
	
	

	promptDiv.append(sortableUl);
		
	$(document.body).append(promptDiv);
	
	
	// Open dialog	
	// Important detail: Pressing enter should trigger click on 'Toepassen' button
	// cross-browser implementation: http://stackoverflow.com/questions/868889/submit-jquery-ui-dialog-on-enter
	// only change is use of keyup instead of keypress, otherwise it doesn't work in some cases
	
	var aButtonsArray = [
	                	 {
	                		 text: lang.apply,     
	                		 title: lang.columns_selection_optimal_apply_msg,
	                		 click: function(){
	                     		
	                     		// if the optimal mode was chosen, put the table into this mode
	                     		mt.setTableMustBeOptimal(sSomeTablename, bOptimal);
	                     		
	                     		
	                     		// save the chosen config into a cookie
	                     		// (except in optimal mode, as we will save chosen columns but the optimal mode causes
	                     		//  different columns to be chosen depending on which part of a table we are navigating,
	                     		//  so it makes no sense to save columns then)
	                     		if (!bOptimal)
	                     			{	                     			
	                     			var aChosenColumns = new Array();
	                    			
	                    			$( "#"+promptDivId+" ul li" ).each(function(){
	                    				var sColumnName = $(this).attr("id");	                    				
	                    				var bChosen = $( "#"+promptDivId+" ul li input#prompt_"+sColumnName ).prop("checked");
	                    				
	                    				aChosenColumns.push( sColumnName+":"+(bChosen?"true":"false") );
	                    					
	                    			});        			
	                    			var sChosenColumns = aChosenColumns.join(",");
	                    			
	                    			// If we are dealing with a custom configuration, we need to save it
	                    			// so it will be available later on.
	                    			// On the contrary if we are restoring the original config, we needn't save!
	                    			if ( !bRestoringOriginalConfig )
	                    				{
	                    				// the cookie contains a comma separated list of columns with their visibility settings and in the right order
		                				// like this:  col1:true,col2:false,...
	                    				$.cookie(fn.getCurrentProject()+"_"+sSomeTablename+"_columns", sChosenColumns, { expires: 365, path: '/' });	                    				
	                    				}
	                    			
	                    			// tell the function we're done with restoring
	                    			bRestoringOriginalConfig = false;	                    				                    			
	                     			}
	                     		
	                     		
	                     		// change the visibility settings of each column according to the user's choices
	                     		var aColumnListInNewOrder = new Array();
	                     		for (var i=0; i<aColumnNames.length; i++)
	                     		{
	                     			var sNewColumnNameAfterResorting = $( "#"+promptDivId+" ul li:eq("+i+")" ).attr("id");
	                     			aColumnListInNewOrder.push(sNewColumnNameAfterResorting);
	                     			var columnChecked = $( "#"+promptDivId+" ul li:eq("+i+") input").eq(0).prop("checked") == true;
	                     			
	                     			conf.changeTableConfigValue(sSomeTablename, sNewColumnNameAfterResorting, "visible", columnChecked );
	                     		}
	                     		// change the column order settings according to the user's choices
	                     		delete oTableSettingsList[sSomeTablename]["column_order"]; // make sure we don't have double settings (the singular setting is deprecated)
	                     		conf.changeTableSettingValue(sSomeTablename, "columns_order", aColumnListInNewOrder);
	                     		
	                     		$( this ).dialog( "close" );
	                     		 
	                     		
	                     		// read the current Datatables filters settings and page number 
	                     		// we will re-apply those to the table as it is rebuilt with the new column selection
	                     		var oFilterSettings = mt.getDataTableObjectOf(sSomeTablename).getSearchFilters();
	                     		var iRecordNumberToStartAt = parseInt(fn.getCurrentDisplayStart(sSomeTablename));
	                     		var aSortingSettings = mt.getDataTableObjectOf(sSomeTablename).order();
	                     		
	                     		// adapt the sorting settings to the new column order
	                     		// The aSortingSettings variable has format
	                     		// [
	                     	    //   [ colIdx_1, orderingDirection_1 ],
	                     		//   [ colIdx_2, orderingDirection_2 ],
	                     		//   ...,
	                     		//   [ colIdx_n, orderingDirection_n ]
	                     		// ]
	                     		for (var i=0; i<aSortingSettings.length; i++)
	                     			{
	                     			// this has format [ colIdx_1, orderingDirection_1 ]
	                     			var aCurrentColSettings = aSortingSettings[i]; 
	                     			var iColumnNr = aCurrentColSettings[0];
	                     			
	                     			var sNameOfOriginalSortColumn = aColumnNames[iColumnNr];
	                     			var iNewColumnNr = $.inArray(sNameOfOriginalSortColumn, aColumnListInNewOrder);
	                     			// change sorting column number in sorting settings array
	                     			aCurrentColSettings[0] = iNewColumnNr;
	                     			aSortingSettings[i] = aCurrentColSettings;
	                     			}
	                     		
	                     		// also read the settings of the search boxes, so as to be able to put this content back
	                     		// into the rebuilt table
	                     		var aListOfFilterNames = new Array();
	                     		var aListOfFilterValues = new Array();
	                     		$('#'+sSomeTablename+'_searchboxes td').each( function(i){
	                     			var sCurrentColumnName = mt.getListOfVisibleColumnsOf(sSomeTablename)[i];
	                     			aListOfFilterNames.push( sCurrentColumnName );
	                     			aListOfFilterValues.push( fn.getValueOfFilterBox(sSomeTablename, sCurrentColumnName) );        			
	                     		});
	                     		
	                     		// read the table position etc, to be able to put the table back at the same place
	                     		var iCurrentLeft =		$("#"+sSomeTablename+"_dynamic").offset().left;
	                     		var iCurrentTop = 		$("#"+sSomeTablename+"_dynamic").offset().top;
	                     		var sViewtype = 		fn.getViewType(sSomeTablename);
	                     		var iDisplayLength =	fn.getCurrentDisplayLength(sSomeTablename);
	                     		var iTableWidth = 		$("#"+sSomeTablename+"_dynamic").css("width");
	                     		
	                     		tb.destroyTable(sSomeTablename, function(){ 
	                     			
	                     			fn.callDatabase(sSomeTablename, oFilterSettings, function(){
	                     				
	                     				// small delay needed otherwise this will be fired too early and won't work
	                     				$("#"+sSomeTablename).delay(200).queue(function(){
	                     					
	                     					// set the sorting	                     					                    						                     					
	                     					// see https://www.datatables.net/plug-ins/api/order.neutral%28%29
	                    					if (aSortingSettings.length==0) 
	                    						mt.getDataTableObjectOf(sSomeTablename).order.neutral();
	                    					else
	                    						mt.getDataTableObjectOf(sSomeTablename).order(aSortingSettings);
	                     						
	                     						                     					
	                     					// now we have the right sorting settings set, 
	                     					// we can set the page number and refresh
	                     					mt.getDataTableObjectOf(sSomeTablename)
	                     						.displayRow(iRecordNumberToStartAt)
	                     						.draw(false);	 
	                     					
	                     					
	                     					// put back the search boxes settings
	                         				for (var j=0; j<aListOfFilterNames.length; j++)
	                         					{
	                         					fn.putDataIntoFilterBox(sSomeTablename, aListOfFilterNames[j], aListOfFilterValues[j]);		
	                         					}
	                         				
	                         				$(this).dequeue();
	                     					});
	                     				
	                     				},
	                     				{
	                     					"top": iCurrentTop, 
	                     					"left": iCurrentLeft, 
	                     					"viewtype": sViewtype,
	                     					"displaylength": iDisplayLength,
	                     					"width": iTableWidth,
	                     					"ignore_initialisation_filters": true
	                     				}); 
	                     			});         		
	                     		
	                     	},
	                     	id: 'dialog_accept_button'
	                	 },
	                	{
	                		 text: lang.cancel,
	                		 title: lang.columns_selection_optimal_cancel_msg,
	                		 click: function() {
	                             $( this ).dialog( "close" );
	                         }
	                	},
	                	{
	                		text: lang.columns_selection_optimal_label,
	                		title: lang.columns_selection_optimal_tooltip,
	                		click: function() {
	                    		
	                        	bOptimal = true;
	                        	
	                        	// get the relevant columns
	                        	var aListOfRelevantColumns = td._getRelevantColumns(sSomeTablename);
	                    		$( "#"+promptDivId+" ul li" ).each(function(){
	                    			var sColumnName = $(this).attr("id");
	                    			
	                    			// if changing the setting is not allowed, skip
	                    			var oColumnConfig = conf.getColumnConfig(oTableConfig, sColumnName);
	                    			if ( !conf.getFlexibleVisibility(oColumnConfig))
	                    				return true;
	                    			
	                    			// (un)check (ir)relevant columns
	                    			if ($.inArray(sColumnName, aListOfRelevantColumns)>-1)
	                    				$( "#"+promptDivId+" ul li input#prompt_"+sColumnName ).prop("checked", "checked");
	                    			else
	                    				$( "#"+promptDivId+" ul li input#prompt_"+sColumnName ).removeAttr("checked").prop('checked', false);
	                    		});
	                        },
	                        style: "color: #3970b3"
	                	},
	                	{
	                		text: lang.everything,
	                		title: lang.columns_selection_select_all,
	                		click: function() {
	                    		
	                    		bOptimal = false;
	                    		
	                    		$( "#"+promptDivId+" ul li" ).each(function(){
	                    			var sColumnName = $(this).attr("id");
	                    			
	                    			// if changing the setting is not allowed, skip
	                    			var oColumnConfig = conf.getColumnConfig(oTableConfig, sColumnName);
	                    			if ( !conf.getFlexibleVisibility(oColumnConfig))
	                    				return true;
	                    			// else check this one
	                    			$( "#"+promptDivId+" ul li input#prompt_"+sColumnName ).prop("checked", "checked");
	                    		});
	                        },
	                        style: "color: #3970b3" 
	                		
	                	},
	                	{
	                		text: lang.nothing,
	                		title: lang.columns_selection_deselect_all,
	                		click: function() {
	                    		
	                    		bOptimal = false;
	                    		
	                    		$( "#"+promptDivId+" ul li" ).each(function(){
	                    			var sColumnName = $(this).attr("id");
	                    			
	                    			// if changing the setting is not allowed, skip
	                    			var oColumnConfig = conf.getColumnConfig(oTableConfig, sColumnName);
	                    			if ( !conf.getFlexibleVisibility(oColumnConfig))
	                    				return true;
	                    			// else UNcheck this one
	                    			$( "#"+promptDivId+" ul li input#prompt_"+sColumnName ).removeAttr("checked").prop('checked', false);
	                    		});        		
	                        },
	                        style: "color: #3970b3"
	                		
	                	}
	                	
	                ]; // end of buttons array (for config dialog)
	
	// if the user changed the table configuration before, 
	// add a button offering the possibility to restore the default config
	var sSavedCookie = $.cookie(fn.getCurrentProject()+"_"+sSomeTablename+"_columns");
	
	if ( typeof sSavedCookie != 'undefined' || mt.getTableMustBeOptimal(sSomeTablename) )
		aButtonsArray.push({
	                		text: lang.columns_selection_reset_default,
	                		title: lang.columns_selection_reset_default_msg,
	                		click: function() {
	                			
	                			var aOriginalColumnList = conf.getOriginalColumnList(sSomeTablename);
	                			
	                			// restore original column order and ids
	                			$( "#"+promptDivId+" ul li").each(function(i){
	                				
	                				var sColumnName = aOriginalColumnList[i];
	                				$(this).attr("id", sColumnName);
	                				
	                				$(this).find("input")
		                				.attr("id", "prompt_"+sColumnName );
		                				
	                			});
	                			
	                			// restore column order by changing li text at the right place
	                			// we need a trick, as changing the text property with text() destroys
	                			// the jquery-ui dialog
	                			// (see trick: http://stackoverflow.com/questions/12863437/change-just-text-in-li-that-contains-img)
	                			$( "#"+promptDivId+" ul li").each(function(i){
	                				
	                				// retrieve column client configuration
	                				var oColumnConfig = conf.getColumnConfig(oTableConfig, aOriginalColumnList[i]);
	                				
	                				// there might be a preferred, GUI friendly name stated in config
	                				// (this name, if available, is the one to be displayed)
	                				var sNiceName = conf.getColumnNiceName(oColumnConfig);	
	                				
	                				// get the text node of the li element and replace it by the column name
	                				// we want to have there...
	                				$(this).find("span").contents().filter(function() {	                			
	                			      return (this.nodeType != 1 && this.textContent != '\n');
	                				}).replaceWith( sNiceName != null ? sNiceName : aOriginalColumnList[i] );
	                				
	                			});
	                			
	                			// second, restore original visibility settings
	                			$( "#"+promptDivId+" ul li").each(function(i){
	                				
	                				var sColumnName = aOriginalColumnList[i];
	                				var bColumnVisibility = conf.getOriginalVisibility(sSomeTablename, sColumnName);	
	                				
	                				if (bColumnVisibility)
	                					$(this).find("input").prop("checked", "checked");
	                				else
	                					$(this).find("input").removeAttr("checked").prop('checked', false);
	                			});
	                				
	                			// remove the custom configuration, as we just restored the default
	                			$.removeCookie(fn.getCurrentProject()+"_"+sSomeTablename+"_columns", { path: '/' });	                			
	                			
	                			
	                			// tell this function we are restoring the original config
	                			// so it knows it doesn't need to save the chosen config now
	                			// (we only save custom configs!)
	                			bRestoringOriginalConfig = true;
	                			
	                			// as we remove the cookie now, we must carry on with this action
	                			// so we press the accept button automatically
	                			// Otherwise if we would do it automatically and the user would also
	                			// no click the accept button, we would end up with a removed original config
	                			// so not being able to restore it
	                			$( "#dialog_accept_button" ).click();
	                			
	                		},
	                        style: "color: #FA5882"
	                	});
	
	$( "#"+promptDivId ).dialog({
		autoOpen: false,
        height: 450,
        width: 700,
        modal: true,
        buttons: aButtonsArray,
        close: function(event, ui){
        	$( this ).remove();
        },
        open: function(event, ui){
        	// activate tipTip jquery plugin for nice cross-browser tooltips    
            $("div.ui-dialog-buttonpane div.ui-dialog-buttonset button.ui-button").tipTip({defaultPosition: "top"});
            // style
            $(".ui-dialog").addClass("ui-dialog-shadow");
            $( this ).closest(".ui-dialog").putInFront();
        }
	})
	.keyup(function() {		 
		if (kf.isPressed("enter"))
			{			
			$( "#dialog_accept_button" ).click();
			return false;
			}
	});
	
	$( "#"+promptDivId ).dialog( "open" );
	
	$( "#"+sortableId ).sortable();
    $( "#"+sortableId ).disableSelection();
    
    
	
};


// Get list of columns that are significantly filled with content
// Since some columns contains buttons, we will have to consider those ones as 'significantly filled'
// to make sure those keep in sight!
td._getRelevantColumns = function(sSomeTablename){
	
	// how frequently a column is used
	var hColumnToFreq = new Hashtable();
	
	var aListOfColumns = mt.getListOfColumnsOf(sSomeTablename);
	var aListOfRows = fx.getAllRows(sSomeTablename);
	var iNumberOfRows = aListOfRows.count();
	
	var oTableConfig = conf.getTableConfig(sSomeTablename);
	
	// go through all rows
	aListOfRows.every(function(){
		
		for (var i=0; i<aListOfColumns.length; i++)
			{
			var sColumnName = aListOfColumns[i];
			var sContent = fx.getDataFromCellInRow(this, sColumnName);
			
			// get column configuration so as to be able to check if there is a button in here 
			var aColumnConfig = conf.getColumnConfig(oTableConfig, sColumnName);
			var sButtonHere = 	conf.getButtonSetting(aColumnConfig);
			
			// if the column is significantly filled with content
			// OR 
			// if it contains a button 
			// -> consider it as relevant!
			if (sContent != "" || sButtonHere != null)
				{
				var freq = hColumnToFreq.containsKey(sColumnName) ?
						hColumnToFreq.get(sColumnName) : 0;
				hColumnToFreq.put(sColumnName, freq+1);
				}
			}
	});
	
	// now build a list of relevent columns
	// t.i. the percentage of cells of a column having content must reach a given threshold
		
	var threshold = .0;
	var aColumns = hColumnToFreq.keys();
	var aListOfRelevantColumns = new Array();
	for (var i=0; i<aColumns.length; i++)
		{
		var sColumnName = aColumns[i];
		var freq = hColumnToFreq.get(sColumnName);
		var percent = freq / iNumberOfRows;
		
		if (percent>threshold)
			{
			aListOfRelevantColumns.push(sColumnName);
			}
		}
	return aListOfRelevantColumns;
};
