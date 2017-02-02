

/** 
 * The conf namespace takes care of reading (or modifying) the client configuration stored in the .config.js files.
 * @namespace */
var conf = {};


// global variable for storage of restore objects
// (restore objects are shallow copies of the tables configurations, meant to be
//  able to restore those when the user requires Lex'it to)
var aRestoreObjects = new Array();


/**
 * Modify the value of a configuration setting
 * @param {String} sSomeTableName - Table name
 * @param {String} sColumnName - Column name
 * @param {String} sSettingName - Name of the setting to modify
 * @param {String} value - Value to assign to the setting
 */
conf.changeTableConfigValue = function(sSomeTableName, sColumnName, sSettingName, value){
	
	var oTableConfig = conf.getTableConfig(sSomeTableName);
	if (oTableConfig == null) 
		oTableConfig = new Object();		
	
	var aSettingForThisColumn = 				conf.getColumnConfig(oTableConfig, sColumnName);	
	aSettingForThisColumn[sSettingName] = 		value;	
	oTableConfig[sColumnName] = 				aSettingForThisColumn;
	oTableConfigurationList[sSomeTableName] =	oTableConfig;
};


// retrieve list of tables that must be hidden in tables pulldown menu at application start

conf.getHiddenTablesList = function(){
	
	return oHiddenTablesList;
};

// check if a table should be hidden in tables pulldown menu at application start

conf.isHiddenTable = function(sTablename){
	
	// if no table list was set in the configuration, than all the tables are by default visible
	if (typeof oShowOnlyTables == 'undefined' && typeof oHiddenTablesList == 'undefined')
		return false;
	
	// if the oShowOnlyTables list was set in the configuration, check that list first
	if (typeof oShowOnlyTables != 'undefined' && countProperties(oShowOnlyTables)>0)
		{
		return $.inArrayRegEx(sTablename, oShowOnlyTables)<0;
		}
		
	// otherwise check the oHiddenTablesList
	return $.inArrayRegEx(sTablename, oHiddenTablesList)>-1;
};



/**
 * Retrieve the configuration data of a given table
 * @param {String} sTablename - Name of a table
 * @returns {Object} An associative array, associating column names to configuration objects
 */
conf.getTableConfig = function(sTablename){
	
	for (sName in oTableConfigurationList)
		{
		if (sName == sTablename)
			{
			// add the table name as a key, 
			// so we can retrieve the name of the table from its config object!
			oTableConfigurationList[sName]["table_name"] = sName;
			return oTableConfigurationList[sName];
			}			
		}
	return null;
};



// retrieve the list of configured columns of a given table

conf.getColumnsList = function(oTableConfig){
	
	var columnList = new Array();
	for (oneColumnName in oTableConfig)
		{
		columnList.push(oneColumnName);
		}
	return columnList;
};

// retrieve the name of a table from its config
conf.getTableName = function(oTableConfig){
	if (oTableConfig == null  // if a table is visible but has no configuration, this is null!
			||
		typeof oTableConfig["table_name"] == 'undefined'
			)
		return null;
	return oTableConfig["table_name"];
};

// retrieve the list of configured columns of a given table
// which are set as 'visible':false
// NB: we can't get a list of columns for which 'visible'=true, since the configuration doesn't 
//     necessarily lists all columns. But as requiring a column to be 'visible'=false
//     makes it compulsory to declare that in the configuration file, we can indeed
//     get a reliable list of columns for which 'visible'=false
conf.getHiddenColumnsList = function(oTableConfig){
	
	var columnList = new Array();
	for (oneColumnName in oTableConfig)
		{
		var aColConfig = conf.getColumnConfig(oTableConfig, oneColumnName);
		if (conf.getVisibility(aColConfig) == false)
			columnList.push(oneColumnName);
		}
	return columnList;
};


/**
 * Retrieve the configuration of a given column
 * @param {Object} oTableConfig - A table config object
 * @param {String} sColumnName - A column name
 * @returns {Object} An associative array with configuration parameters
 */
conf.getColumnConfig = function( oTableConfig, sColumnName){
	
	var oColumnConfig = new Object();
	
	for (oneColumn in oTableConfig)
		{
		if (oneColumn == sColumnName)
			{			
			oColumnConfig = new cloneObject( oTableConfig[sColumnName] );
			break;
			}
		}
	
	// add the column name as a key, 
	// so we can retrieve the name of a column from its config object! 
	oColumnConfig["column_name"] = sColumnName;
	
	return oColumnConfig;
};



// retrieve the column name from its config object

conf.getColumnName = function(aColumnConfig){
	
	if (typeof aColumnConfig["column_name"] == 'undefined')
		return null;
	return aColumnConfig["column_name"];
};


// retrieve background color 
// default is null

conf.getBackgroundColor = function(aColumnConfig){
	
	if (typeof aColumnConfig["bgcolor"] == 'undefined')
		return null;
	var aColumnColorConfig = aColumnConfig["bgcolor"];
	
	// if only one color was given, generate the lighter shade automatically for the even rows
	// (this is only possible when the color is an hex color code)
	if (typeof aColumnColorConfig=='string' && $.startsWith(aColumnColorConfig, "#"))
		{
		return [shadeColor(aColumnColorConfig, -10), aColumnColorConfig];
		}
	if (aColumnColorConfig.length==1 && $.startsWith(aColumnColorConfig[0], "#"))
		{
		return [shadeColor(aColumnColorConfig[0], -10), aColumnColorConfig[0]];
		}
	return aColumnColorConfig;
};

// retrieve text color settings
// default is null

conf.getTextColor = function(aColumnConfig){
	
	if (typeof aColumnConfig["textcolor"] == 'undefined')
		return null;
	return aColumnConfig["textcolor"];
};

// retrieve text weight settings
// default is null

conf.getTextWeight = function(aColumnConfig){
	
	if (typeof aColumnConfig["textweight"] == 'undefined')
		return null;
	return aColumnConfig["textweight"];
};

// retrieve text style settings
// default is null

conf.getTextStyle = function(aColumnConfig){
	
	if (typeof aColumnConfig["textstyle"] == 'undefined')
		return null;
	return aColumnConfig["textstyle"];
};

// retrieve text font settings
// default is null

conf.getTextFont = function(aColumnConfig){
	
	if (typeof aColumnConfig["textfont"] == 'undefined')
		return null;
	return aColumnConfig["textfont"];
};

// retrieve text size settings
// default is null

conf.getTextSize = function(aColumnConfig){
	
	if (typeof aColumnConfig["textsize"] == 'undefined')
		return null;
	return aColumnConfig["textsize"];
};


/**
 * Retrieve values of a selection box to choose from, when the column filter is a selection box
 * @param {Object} aColumnConfig - An associative array of configuration parameters
 * @returns {String[]} An array of values, or null
 */
conf.getSelectionBox = function(aColumnConfig){
	
	if (typeof aColumnConfig["choosefrom"] == 'undefined')
		return null;
	return aColumnConfig["choosefrom"];
};


// retrieve visibility settings
// default is visible:true

conf.getVisibility = function(aColumnConfig){
	
	if (typeof aColumnConfig["visible"] == 'undefined')
		return true;
	return aColumnConfig["visible"];
};


// retrieve flexible_visibility settings
// default is flexible_visibility:true

conf.getFlexibleVisibility = function(aColumnConfig){
	
	if (typeof aColumnConfig["flexible_visibility"] == 'undefined')
		return true;
	return aColumnConfig["flexible_visibility"];
};


// retrieve searchability settings
// default is searchable:true

conf.getSearchability = function(aColumnConfig){
	
	if (typeof aColumnConfig["searchable"] == 'undefined')
		return true;
	return aColumnConfig["searchable"];
};


// retrieve sortability settings
// default is sortable:true

conf.getSortability = function(aColumnConfig){
	
	if (typeof aColumnConfig["sortable"] == 'undefined')
		return true;
	return aColumnConfig["sortable"];
};


// retrieve editability settings
// default is editable:false

conf.getEditability = function(aColumnConfig){
	
	if (typeof aColumnConfig["editable"] == 'undefined')
		return false;
	return aColumnConfig["editable"];
};


// retrieve filter settings for one column
// default is filter:null

conf.getFilter = function(aColumnConfig){
	
	if (typeof aColumnConfig["filter"] == 'undefined')
		return null;		
	return aColumnConfig["filter"];
};


// retrieve keep-filter setting for one column
// default is false
// (keep-filter is about freezing a column filter value, so it won't be change by the user)

conf.getKeepFilterSetting = function(aColumnConfig){
	
	if (typeof aColumnConfig["keepfilter"] == 'undefined')
		return false;
	return aColumnConfig["keepfilter"];
};

// retrieve name of button, if a button should be set in a column
// default is null

conf.getButtonSetting = function(aColumnConfig){
	
	if (typeof aColumnConfig["button"] == 'undefined')
		return null;
	return aColumnConfig["button"];
};

// retrieve tooltip of button, if a button should be set in a column
// default is empty string

conf.getButtonTooltip = function(aColumnConfig){
	
	if (typeof aColumnConfig["button_tooltip"] == 'undefined')
		return "";
	return aColumnConfig["button_tooltip"];
};

// retrieve tooltip of cell
// default is empty string

conf.getCellTooltip = function(aColumnConfig){
	
	if (typeof aColumnConfig["cell_tooltip"] == 'undefined')
		return "";
	return aColumnConfig["cell_tooltip"];
};



// get the title of a column
// default is null

conf.getTitle = function(aColumnConfig){
	
	if (typeof aColumnConfig["title"] == 'undefined')
		return null;
	return aColumnConfig["title"];
};


// get the default sorting columns list
conf.getDefaultSortingColumns = function(oTableConfig){
	
	var aColumnList = 		conf.getColumnsList(oTableConfig);
	var aSortingColumnsList = new Array();
	
	var sTableName =		conf.getTableName(oTableConfig);
	
	for (var i=0; i<aColumnList.length; i++){
		var sColName = 		aColumnList[i];
		var aColumnConfig =	conf.getColumnConfig(oTableConfig, sColName);
		
		if (typeof aColumnConfig["colsort"] != 'undefined')
			{
			if ($.inArray(sColName, mt.getListOfColumnsOf(sTableName))>-1)
				{
				aSortingColumnsList.push(sColName);
				}
			else
				{
				var hParamsHash = getHttpParams();
				var sDbName = hParamsHash.get("db");
				fn.message("Fout in configuratie van tabel '"+sTableName+"'",				
					"Kolom '"+sColName+"' van tabel '"+ sTableName + 
					"' is aangewezen als sorteerkolom, maar deze kolom bestaat niet. " +
					"Verwijder deze kolom uit het configuratiebestand " +
					"("+ sDbName +".config.js).");
				}
			}
	}	
	return aSortingColumnsList;
};

// get column sorting direction
// default is 'asc'
conf.getSortingColumnDirection = function(aColumnConfig){
	
	if (typeof aColumnConfig["colsort"] == 'undefined' || 
			$.inArray(aColumnConfig["colsort"], ["asc", "desc"])<0)
		return "asc";
	return aColumnConfig["colsort"];
};

// get the index and sorting direction of the default sorting columns, as an array 
// given a table name
// expected output is like [[1, 'asc'], [2, 'desc']]
// default is [] 
conf.getDefaultSortingSettings  = function(sSomeTablename){

	var aColSettings = 		new Array();
	
	// get the list of sorting columns
	var oTableConfig = 		conf.getTableConfig(sSomeTablename);
	var aDefaultSortCols =	conf.getDefaultSortingColumns(oTableConfig);
	
	for (var i=0; i<aDefaultSortCols.length; i++)
		{
		var sDefaultSortCol = aDefaultSortCols[i];		
		var sSortDir  = 	conf.getSortingColumnDirection(conf.getColumnConfig(oTableConfig, sDefaultSortCol));
		var iColIndex = 	$.inArray(sDefaultSortCol, mt.getListOfColumnsOf(sSomeTablename));
		
		aColSettings.push([ iColIndex, sSortDir]);
		}
	return aColSettings;
};




// get the function for conversion of the query in the search form  
// (that is a function that converts the search query for a given column
//  into some other form/formaat, if needed)
// default is null

conf.getSearchForm = function(aColumnConfig){
	
	if (typeof aColumnConfig["searchform"] == 'undefined')
		return null;
	return aColumnConfig["searchform"];
};


// retrieve edit mode function for one column
// (that is a custom function triggered when editing a given column,
//  designed to take care of correct processing of user input)
// default is null

conf.getEditFunction = function(aColumnConfig){
	
	if (typeof aColumnConfig["editfunc"] == 'undefined')
		return null;
	return aColumnConfig["editfunc"];
};

// retrieve edit callback function for one column
//(that is a callback function triggered after the editing of a given column)
// default is null

conf.getEditCallback = function(aColumnConfig){
	
	if (typeof aColumnConfig["editcallback"] == 'undefined')
		return null;
	return aColumnConfig["editcallback"];
};

// when handling a selectbox selection, if one wants
// to make sure selection didn't happen by accident (mis-clicking),
// on can require the user to validate his/her selection click
// by pressing some key at the same time. We call this key
// the 'validator' as it validates the selection
conf.getEditSelectValidator = function(aColumnConfig){
	if (typeof aColumnConfig["validator"] == 'undefined')
		return null;
	return aColumnConfig["validator"];
};

// retrieve the list of tables that must be refreshed
// upon editing of some cell to which the "editrefresh" parameter is attached
// default is null

conf.getEditRefresh = function(aColumnConfig){
	
	if (typeof aColumnConfig["editrefresh"] == 'undefined')
		return null;
	return aColumnConfig["editrefresh"];
};


// refresh the tables that need to be refreshed upon editing
// of a given cell to which the "editrefresh" parameter is attached
conf.refreshTables = function(aColumnConfig){
	
	var aTableList = conf.getEditRefresh(aColumnConfig);
	if (aTableList != null)
		{		
		for (var i=0; i<aTableList.length; i++)
			{
			gui.refreshTable(aTableList[i]);
			}
		}
};


// retrieve the regex the cell content should match with
// to be able to trigger the custom edit function
// stored in the config file as 'editfunc'

conf.getEditTrigger = function(aColumnConfig){
	
	if (typeof aColumnConfig["edittrigger"] == 'undefined')
		return null;
	return aColumnConfig["edittrigger"];
};


// check if the content of a column should be copied upon insert
// (t.i. when performing 'search & add').
conf.getCopyUponInsert = function(aColumnConfig){
	
	if (typeof aColumnConfig["copy_upon_insert"] == 'undefined')
		return false;
	return aColumnConfig["copy_upon_insert"];
};

// get the list of columns which should be copied upon insert
conf.getListOfColumnsToCopyUponInsert = function(sSomeTablename){
	
	var columnsToCopy = 	new Array();
	var oTableConfig = 		conf.getTableConfig(sSomeTablename);
	var aListOfColumns =	conf.getColumnsList(oTableConfig);
	
	for (var i=0; i<aListOfColumns.length; i++)
		{				
		var aColumnConfig = conf.getColumnConfig(oTableConfig, aListOfColumns[i]);
		
		if (conf.getCopyUponInsert(aColumnConfig))
			columnsToCopy.push(aListOfColumns[i]);
		}
	return columnsToCopy;
};



// check editability of whole table
// returns true if at least one column is editable, otherwise false 

conf.tableIsEditable = function(sSomeTablename){
	
	var oTableConfig = 		conf.getTableConfig(sSomeTablename);
	
	for (var i=0; i<mt.getListOfVisibleColumnsOf(sSomeTablename).length; i++)
	{
		var sColumnName = 	mt.getListOfVisibleColumnsOf(sSomeTablename)[i];		
		var aColConfig =	conf.getColumnConfig( oTableConfig, sColumnName);
		
		if ( conf.getEditability(aColConfig) )
			return true;
	}
	return false;
};

// check if a table has some editable text fields
conf.tableHasSomeEditableTextFields = function(sSomeTablename){
	
	var oTableConfig = 		conf.getTableConfig(sSomeTablename);
	
	var bTableHasEditableTextFields = false;
	
	for (var i=0; i<mt.getListOfVisibleColumnsOf(sSomeTablename).length; i++)
	{
		var sColumnName =	mt.getListOfVisibleColumnsOf(sSomeTablename)[i];		
		var sColumeType =	mt.getListOfTypesOfVisibleColumnsOf(sSomeTablename)[i];
		var aColConfig =	conf.getColumnConfig( oTableConfig, sColumnName);
		
		if ( conf.getEditability(aColConfig) && $.inArray(sColumeType, ['bit varying(1)', 'boolean'])<0 )
			{
			bTableHasEditableTextFields = true;
			}
	}
	
	return bTableHasEditableTextFields;
};




// *********** MOUSE ACTIONS ****************

var hLastSelectedRow = new Hashtable();
var hPreviousStateOfLastSelectedRow = new Hashtable();

var aListOfPossibleMouseActions = ["click", "dblclick", 
                                   "mouseup", "mousedown", 
                                   "mouseover",
                                   "mousemove",
                                   "mouseout"];

// check if some column configuration has a mouse action assigned
conf.someMouseActionIsAssigned = function(aColumnConfig){
	for (var i=0; i<aListOfPossibleMouseActions.length; i++)
		{
		if (typeof aColumnConfig[aListOfPossibleMouseActions[i]] != 'undefined')
			return true;
		}
	return false;
};

// (un)assign a function to a given column in a table
// (subroutine of conf.activateConfigFunctions)

conf.assignAction = function(sSomeTablename, aColumnConfig, iColumnNr){
	
	for (var i=0; i<aListOfPossibleMouseActions.length; i++)
		{
		var sOneMouseActionType = aListOfPossibleMouseActions[i];
		
		if (typeof aColumnConfig[sOneMouseActionType] != 'undefined')
			{
			// get the mouse event (leave it that way, otherwise it won't work)
			var sMouseEvent = sOneMouseActionType;
			
			// Attach the action to column having iColumnNr as class name
			// (but first dettach it to prevent multiple assignment)
			$('#'+sSomeTablename+'_dynamic').off(sMouseEvent, '#'+sSomeTablename+' tbody td.'+iColumnNr);
			$('#'+sSomeTablename+'_dynamic').on(sMouseEvent, '#'+sSomeTablename+' tbody td.'+iColumnNr,
					
					// The function gets the node as an argument, so as to be
					// able to process the right content.
					function(){			
				
						// highlight clicked row
						// if this row wasn't selected yet, we have to select it to
						// show that the function was activated for this row
						//
						// except if we have more than one row selected already, 
						// because this selection has nothing to do with the function so
						// we don't want to confuse the user by adding a new selected row
						if (fn.getNumberOfSelectedRowNodes(sSomeTablename)==0)
							{
							// check if some other row was already selected in this table
							// as a sign of function call
							var lastSelectedRowForThisTable = hLastSelectedRow.get(sSomeTablename);
							
							// if there was some row selected indeed, set it back in its previous
							// state (if it was selected already, do nothing)
							if ( lastSelectedRowForThisTable != null )
								{
								var bPreviousStateWasSelected = hPreviousStateOfLastSelectedRow.get(sSomeTablename);
								if ( !bPreviousStateWasSelected )
									{
									lastSelectedRowForThisTable.removeClass('selected');									
									}
								}
							// now select the current row
							var bRowWasAlreadySelectedBeforeSelection = $(this).parent().hasClass('selected');
							$(this).parent().addClass('selected');							
							
							// remember this row is selected now (since it must be unselected later)
							hLastSelectedRow.put(sSomeTablename, $(this).parent());
							hPreviousStateOfLastSelectedRow.put(sSomeTablename, bRowWasAlreadySelectedBeforeSelection);					
							}
						
						
						// execute function from the configuration file
						// except if the selection button is active (secure selection)
						if ( !fn.rowsSelectionIsAllowed(sSomeTablename))
							aColumnConfig[sMouseEvent]( mt.getDataTableObjectOf(sSomeTablename), this );

					} 
				);
			
			}
			
		}
	
	
};

// remove mouse event assigned to a column
conf.unassignAction = function(sSomeTablename, aColumnConfig, iColumnNr){
	
	// clean the memory of previously selected row for this table
	// (we need to know the last selected row to be able to unselect it when clicking on another row)
	hLastSelectedRow.remove(sSomeTablename);
	hPreviousStateOfLastSelectedRow.remove(sSomeTablename);
	
	var oSomeTable = mt.getDataTableObjectOf(sSomeTablename);
	
	// if some mouse event action is assigned to this column, unassign it
	// (remove the event attached to the column having iColumnNr as class name)
	if (conf.someMouseActionIsAssigned(aColumnConfig))
		$('#'+sSomeTablename+'_dynamic').off('#'+sSomeTablename+' tbody td.'+iColumnNr);
};



// ****************************************************************************************
// *** (de)activate all the functions defined in client configuration for a given table ***
// ****************************************************************************************

// this one does it for all the tables

conf.activateConfigFunctionsInAllTables = function(){
	var loadedTables = mt.getListOfLoadedTables();
	for (var i=0; i<loadedTables.length; i++ )
		{
		conf.activateConfigFunctions(loadedTables[i]);
		}
};

conf.deactivateConfigFunctionsInAllTables = function(){
	var loadedTables = mt.getListOfLoadedTables();
	for (var i=0; i<loadedTables.length; i++ )
		{
		conf.deactivateConfigFunctions(loadedTables[i]);
		}
};

// this one does it for one single table

conf.activateConfigFunctions = function(sSomeTablename){

	// retrieve table client configuration
	var oTableConfig = conf.getTableConfig(sSomeTablename);

	for (var i=0; i<mt.getListOfColumnsOf(sSomeTablename).length; i++)
		{
		// retrieve column client configuration
		var oColumnConfig = conf.getColumnConfig(oTableConfig, mt.getListOfColumnsOf(sSomeTablename)[i]);
		
		// activate column-click actions assigned in configuration
		conf.assignAction(sSomeTablename, oColumnConfig, i);
		}
	
};

conf.deactivateConfigFunctions = function(sSomeTablename){

	// retrieve table client configuration
	var oTableConfig = conf.getTableConfig(sSomeTablename);

	for (var i=0; i<mt.getListOfColumnsOf(sSomeTablename).length; i++)
		{
		// retrieve column client configuration
		var oColumnConfig = conf.getColumnConfig(oTableConfig, mt.getListOfColumnsOf(sSomeTablename)[i]);
		
		// activate column-click actions assigned in configuration
		conf.unassignAction(sSomeTablename, oColumnConfig, i);
		}
	
};


// Context menus for columns

conf.activateContextMenusForColumns = function(sSomeTablename){
	
	// retrieve table client configuration
	var oTableConfig = conf.getTableConfig(sSomeTablename);
	
	for (var i=0; i<mt.getListOfColumnsOf(sSomeTablename).length; i++)
		{
		var sCurrentColumnName =	mt.getListOfColumnsOf(sSomeTablename)[i];
		
		// retrieve column client configuration
		var oColumnConfig = 		conf.getColumnConfig(oTableConfig, sCurrentColumnName);
		
		// if we have a rightclick configuration, set the rightclick context menu
		var oRightClickConfig = 	oColumnConfig["contextmenu"];
		
		if (typeof oRightClickConfig != 'undefined')
			{
			var oItems = 		oRightClickConfig["items"];
			var fnCallback =	oRightClickConfig["callback"];
			
			if (typeof oItems != 'undefined' && typeof fnCallback != 'undefined')
			cm.setContextMenu(sSomeTablename, sCurrentColumnName, oItems, fnCallback);
			}
		}	
};




// ********************************************************************
// *                         RESTORE OBJECT                           *
// ******************************************************************** 



// make a copy of the visibility config or order setting of the table columns
// we need this to restore the original table settings when the user requires Lex'it to 
conf.makeRestoreCopyOfTableConfig = function(sTablename, aAllColumns){
	
	// if we already have a restore object, don't make it again
	// (Which would be wrong anyway: because we can only make such a object
	//  at initialisation time, when tables are still in their original state.
	//  When this function is called again, it is by definition because
	//  the table is being rebuilt as the configuration was manually modified
	//  by the user, so the table is not in its original state anymore!)
	if (typeof aRestoreObjects[sTablename] != 'undefined')
		return true;
	
	// new restore object
	aRestoreObjects[sTablename] = new Array();	
	
	// save original column visibility
	
	// get table config object to get column config from
	var oTableConfig = 		conf.getTableConfig(sTablename);
	
	aRestoreObjects[sTablename]["columns"] = new Array();
	
	for (var i=0; i<aAllColumns.length; i++){
		
		var sColName = 		aAllColumns[i];
		var aColumnConfig =	conf.getColumnConfig(oTableConfig, sColName);
		var bVisible = 		conf.getVisibility(aColumnConfig);
		
		aRestoreObjects[sTablename]["columns"][sColName] = {"visible": bVisible};		
		}
	
	// save original columns
	var oTableSettings = 	conf.getTableSettings(sTablename);
	var aColumnOrder =		conf.getColumnOrder(oTableSettings);
	
	// of course, give priority to the column order explicitly set in the configuration 
	if (aColumnOrder == null)
		aRestoreObjects[sTablename]["list_of_columns"] = cloneArray(aAllColumns);
	else
		aRestoreObjects[sTablename]["list_of_columns"] = cloneArray(aColumnOrder);
};

conf.getOriginalColumnList = function(sTablename){
	
	return aRestoreObjects[sTablename]["list_of_columns"];
};


conf.getOriginalVisibility = function(sTablename, sColumnName){
	
	if (typeof aRestoreObjects[sTablename]["columns"][sColumnName] == 'undefined')
		return true; // visible is default
	return aRestoreObjects[sTablename]["columns"][sColumnName]["visible"];
	
};





// ********************************************************************
// *                      TABLE GENERAL SETTINGS                      *
// ******************************************************************** 


/**
 * Modify the value of a setting
 * @param {String} sSomeTableName - Table name
 * @param {String} sSettingName - Setting name
 * @param {String} value - value to assign to the setting 
 */ 
conf.changeTableSettingValue = function(sSomeTableName, sSettingName, value){
	var aTableSettings = conf.getTableSettings(sSomeTableName);
	if (aTableSettings == null) aTableSettings = new Object();
	aTableSettings[sSettingName] = value;
	oTableSettingsList[sSomeTableName] = aTableSettings;
};

// retrieve the settings (size etc) of a given table
// result in an array

conf.getTableSettings = function(sTablename){
	
	for (sName in oTableSettingsList)
		{
		if (sName == sTablename)
			{
			return oTableSettingsList[sName];
			}			
		}
	return {};
};



// should the table be 'thrown' to the bottom of the selection list
// (when the user wants to keep it distinct from the other tables)
conf.throwToBottom = function(aTableSettings){
	
	if (typeof aTableSettings["throw_to_bottom"] == 'undefined')
		return false;
	return aTableSettings["throw_to_bottom"];
	
};


// setting for advanced search and replace
// default: not allowed = false
conf.advancedSearchAndReplaceIsUnlocked = function(aTableSettings){
	if (typeof aTableSettings["advanced_search_and_replace"] == 'undefined')
		return false;
	return aTableSettings["advanced_search_and_replace"];
};


// context menus for rows
conf.activateContextMenusForRows = function(sSomeTablename){
	
	// retrieve table client settings
	var aTableSettings = conf.getTableSettings(sSomeTablename);
	
	// if we have a rightclick configuration, set the rightclick context menu
	var oRightClickSetting = aTableSettings["contextmenu"];
	if (typeof oRightClickSetting != 'undefined')
		{
		var oItems = oRightClickSetting["items"];
		var fnCallback = oRightClickSetting["callback"];
		if (typeof oItems != 'undefined' && typeof fnCallback != 'undefined')
			cm.setContextMenu(sSomeTablename, null, oItems, fnCallback);
		}	
};



// get the settings for a given key event
conf.getKeysSettings = function(aTableSettings, sKeyEventType){
	
	if (typeof aTableSettings[sKeyEventType] == 'undefined')
		return null;
	return aTableSettings[sKeyEventType];
};


// get the number of user custom header buttons
conf.getNumberOfHeaderButtons = function(aTableSettings){
	
	var counter = 0;	
	for (sOneSetting in aTableSettings)
	{
	if ( $.startsWith(sOneSetting, "button") )
		counter++;			
	}
	return counter;
};

// get the settings of a button, given its number
conf.getHeaderButtonSettings = function(aTableSettings, iButtonNumber){
	
	for (sOneSetting in aTableSettings)
	{
	if ( sOneSetting == "button"+iButtonNumber || (sOneSetting == "button_"+iButtonNumber) )
		{
		return aTableSettings[sOneSetting];
		}			
	}
	return new Object();
};


conf.getHeaderButtonMenu = function(aButtonSettings){
	if (typeof aButtonSettings["menu"] == 'undefined')
		return null;
	return aButtonSettings["menu"];
};
conf.getHeaderButtonToolTip = function(aButtonSettings){
	if (typeof aButtonSettings["tooltip"] == 'undefined')
		return null;
	return aButtonSettings["tooltip"];
};
conf.getHeaderButtonName = function(aButtonSettings){
	if (typeof aButtonSettings["name"] == 'undefined')
		return "USER BUTTON";
	return aButtonSettings["name"];
};
conf.getHeaderButtonBgColor = function(aButtonSettings){
	if (typeof aButtonSettings["bgcolor"] == 'undefined')
		return "blue";
	return aButtonSettings["bgcolor"];
};
conf.getHeaderButtonTextColor = function(aButtonSettings){
	if (typeof aButtonSettings["textcolor"] == 'undefined')
		return "white";
	return aButtonSettings["textcolor"];
};

// this function is called when a button is being clicked upon
conf.getHeaderButtonFunction = function(aButtonSettings){
	if (typeof aButtonSettings["click"] == 'undefined')
		return function(){fn.message("Configuratieprobleem", "Aan deze button is geen functie toegekend.");};
	return aButtonSettings["click"];
};


// retrieve refresh setting: should we refresh upon window focus 
conf.getRefreshUponFocus = function(aTableSettings){
	
	if (typeof aTableSettings["refresh_upon_focus"] == 'undefined')
		return true;
	return aTableSettings["refresh_upon_focus"];
};


// retrive table 'nice name'
conf.getNiceName = function(aTableSettings){
	
	if (typeof aTableSettings["nice_name"] == 'undefined')
		return null;
	return aTableSettings["nice_name"];
};

// retrieve tab function setting for this table
conf.getTabSetting = function(aTableSettings){
	
	if (typeof aTableSettings["get_focus_on_tab"] == 'undefined')
		return true;
	return aTableSettings["get_focus_on_tab"];
};


// retrieve size (or width) settings
// default is 100%

conf.getSize = function(aTableSettings){
	
	// try 'size'
	if (typeof aTableSettings["size"] != 'undefined')
		return aTableSettings["size"];
	
	// otherwise try 'width'
	if (typeof aTableSettings["width"] != 'undefined')
		return aTableSettings["width"];
	
	// none is set, so return default value
	return "100%";
	
};



// retrieve view type
// default is table

conf.getViewtype = function(aTableSettings){
	
	if (typeof aTableSettings["viewtype"] == 'undefined')
		return "table";
	return aTableSettings["viewtype"];
};


// retrieve display length
// default is 10

conf.getDisplayLength = function(aTableSettings){
	
	if (typeof aTableSettings["displaylength"] == 'undefined')
		return 10;
	return aTableSettings["displaylength"];
};



// retrieve reset button settings
// default is true

conf.getResetButton = function(aTableSettings){
	
	if (typeof aTableSettings["reset_button"] == 'undefined')
		return true;
	return aTableSettings["reset_button"];
};

// retrieve columns selection button settings
// default is true

conf.getColumnsSelectionButton = function(aTableSettings){
	
	if (typeof aTableSettings["columns_button"] == 'undefined')
		return true;
	return aTableSettings["columns_button"];
};

// retrieve view type button settings
// default is true

conf.getViewTypeButton = function(aTableSettings){
	
	if (typeof aTableSettings["viewtype_button"] == 'undefined')
		return true;
	return aTableSettings["viewtype_button"];
};

conf.getRefreshButton = function(aTableSettings){
	
	if (typeof aTableSettings["refresh_button"] == 'undefined')
		return true;
	return aTableSettings["refresh_button"];
};

// retrieve search and replace button settings
// default is true

conf.getReplaceButton = function(aTableSettings){
	
	if (typeof aTableSettings["replace_button"] == 'undefined')
		return true;
	return aTableSettings["replace_button"];
};

// retrieve selection button settings
// default is true
conf.getSelectionButton = function(aTableSettings){
	
	if (typeof aTableSettings["selection_button"] == 'undefined')
		return true;
	return aTableSettings["selection_button"];
};
// retrieve selection button active setting
// default is false
conf.getSelectionButtonActive = function(aTableSettings){
	
	if (typeof aTableSettings["selection_button_active"] == 'undefined')
		return false;
	return aTableSettings["selection_button_active"];
};

//retrieve undo button settings
//default is true

conf.getUndoButton = function(aTableSettings){
	
	if (typeof aTableSettings["undo_button"] == 'undefined')
		return true;
	return aTableSettings["undo_button"];
};

//retrieve goto button settings
//default is true

conf.getGoToButton = function(aTableSettings){
	
	if (typeof aTableSettings["goto_button"] == 'undefined')
		return true;
	return aTableSettings["goto_button"];
};

//retrieve help button settings
//default is true

conf.getHelpButton = function(aTableSettings){
	
	if (typeof aTableSettings["help_button"] == 'undefined')
		return true;
	return aTableSettings["help_button"];
};

//retrieve main search function settings
//default is true

conf.getMainSearch = function(aTableSettings){
	
	if (typeof aTableSettings["main_search"] == 'undefined')
		return true;
	return aTableSettings["main_search"];
};

//retrieve header and footer height

conf.getHeaderHeight = function(aTableSettings){
	
	if (typeof aTableSettings["header_height"] == 'undefined')
		return conf._defaultHeight();
	return aTableSettings["header_height"];
};
conf._defaultHeight = function(){
	return "55px"; // less than 55px gives overlap problems in Google Chrome
};

conf.getFooterHeight = function(aTableSettings){
	
	if (typeof aTableSettings["footer_height"] == 'undefined')
		return "30px";
	return aTableSettings["footer_height"];
};

// retrieve pre-reset callback function
// (which is activated just before the Reset-button actually re-load the table to be reset)
// default is null

conf.getPreResetCallback = function(aTableSettings){
	
	if (typeof aTableSettings["prereset_callback"] == 'undefined')
		return null;
	return aTableSettings["prereset_callback"];
};

// retrieve callback function
// default is null

conf.getCallback = function(aTableSettings){
	
	if (typeof aTableSettings["callback"] == 'undefined')
		return null;
	return aTableSettings["callback"];
};

// retrieve callback repeat settings
// default is false

conf.getRepeatCallback = function(aTableSettings){
	
	if (typeof aTableSettings["repeat_callback"] == 'undefined')
		return false;
	return aTableSettings["repeat_callback"];
};


// get column order
// default is null
conf.getColumnOrder = function(aTableSettings){
	
	if (typeof aTableSettings["column_order"] != 'undefined')
		return aTableSettings["column_order"];
	
	else if (typeof aTableSettings["columns_order"] != 'undefined')
		return aTableSettings["columns_order"];
	
	return null;
};
