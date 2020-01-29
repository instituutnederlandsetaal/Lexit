
/** 
 * The fn namespace contains the basic/main set of functions to build projects with. <BR>
 * <BR>
 * The functions of this namespace can point at a table both by using its name (as a string) or its   
 * Datatables object instance. <BR>
 * Dealing with table cells and rows is done by pointing to TD and TR nodes
 * (just like in the {@link http://legacy.datatables.net/api|'old' Datatables API}).
 * But it is also possible to point at cells and rows by using a Datatables object instance of a cell
 * or row. This can be achieved by using the fx namespace functions. 
 * 
 * @namespace */
var fn = {};



/**
 * @typedef TableSettingsArray
 * @type {Object}
 * @property {String} [pane=all elements] - Elements to use in the rendering of the top pane. 
 * This string must consist of a combinations of letters symbolizing the needed functionalities,
 * like: 'i' for table information summary, 'f' for filtering input, 'l' for length changing input control,
 * 'p' for pagination control.
 * @property {String} [top] - Vertical position of the left upper corner of the table (px)
 * @property {String} [left] - Horizontal position of the left upper corner of the table (px)
 * @property {String} [viewtype=table] - 'table' or 'form'
 * @property {Integer} [displaylength=10] - Number of rows to show at once in the table
 * @property {Boolean} [ignore_initialisation_filters=false] - if true, the default filters (stated in config file) 
 * to be set at initialization time will be omitted
 */


/**
 * @typedef API-object-instance
 * @type {Object}
 * @see http://datatables.net/reference/type/DataTables.Api
 */


/* 
 
List of sections of functions:
-----------------------------
PROJECT FUNCTIONS
GET GENERAL TABLE INFORMATION
READ A TABLE FROM THE DATABASE
GENERAL TABLE FUNCTIONS

GENERAL ROW FUNCTIONS
ROW SELECTION FUNCTIONS
GENERAL CELL FUNCTIONS
GENERAL COLUMN FUNCTIONS
GENERAL NODE FUNCTIONS

GET DATA FROM A CELL OR ROW
PUT DATA INTO A CELL OR ROW

UPDATE THE DATABASE GIVEN A ROW/CELL
UPDATE THE DATABASE GIVEN SOME FIELD VALUES
INSERT DATA INTO THE DATABASE
GET ID FROM A RECORD IN THE DATABASE
REMOVE DATA FROM THE DATABASE
READ A SINGLE RECORD FROM THE DATABASE
CALL A FUNCTION FROM THE DATABASE THAT RETURNS A RECORD

INTERACTION

FILTER BOXES FUNCTIONS
GOTO FUNCTION
STRING FUNCTIONS

WEBSERVICES
EXTRA FUNCTIONS

 */

// *****************************************************************
// **        PROJECT FUNCTIONS									  **
// *****************************************************************

/**
 * Set the project title on the screen
 * 
 * @param {String} sProjectName - Name of the project
 * @param {String} sColor - Color code (eg. #3970b3)
 * @param {String} sFontSize - Font size (eg. 50px)
 * @param {String} sFondWeight - Font weight (eg. bold)
 */
fn.setProjectTitle = function(sProjectName, sColor, sFontSize, sFondWeight){
	
	// default values
	if (typeof sColor == 'undefined')
		sColor = "#3970b3";
	
	if (typeof sFondWeight == 'undefined')
		sFondWeight = "bold";
	
	if (typeof sFontSize == 'undefined')
		sFontSize = "50px";
	
	// create container if not present yet
	if ( !$("#projectname").find("span").elementExists())
		$("#projectname").append($("<span></span>"));
	
	// set text, color, size, etc
	$("#projectname").find("span")
	.text(sProjectName)
	.css("font-size", sFontSize).css("color", sColor).css("font-weight", sFondWeight);
	
	// set title tab as well (and don't double the lex'it version number after the '-'
	var sBaseTitle = $("title").text();
	if (sBaseTitle.indexOf(" - ")>-1)
		sBaseTitle = sBaseTitle.substring(sBaseTitle.indexOf(" - ")+3);
	$("title").text(sProjectName + " - " + sBaseTitle);
};

/**
 * Set background color 
 * 
 * @param {String} sColor - Color code (eg. #3970b3)
 */
fn.setBackgroundColor = function(sColor){
	
	$(document).find("body").css("background-color", sColor);
}


// *****************************************************************
// *     GET GENERAL TABLE INFORMATION                             *
// *****************************************************************

/**
 * Get the view type of a table
 * 
 * @param {(String|API-object-instance)} sSomeTablename - Name of a table
 * @returns {String} Type of the view, that is: 'table' or 'form'
 */
fn.getViewType = function(sSomeTablename){
	
	if (typeof sSomeTablename == 'object')
		sSomeTablename = fn.getTableName(sSomeTablename);
	return mt.getViewType(sSomeTablename);
};


/**
 * Check if a table exists
 * 
 * @param {(String|API-object-instance)} sSomeTablename - Name of a table
 * @returns {Boolean} true if the table exists, otherwise false
 */
fn.tableExists = function(sSomeTablename){

	if (typeof sSomeTablename == 'object')
		sSomeTablename = fn.getTableName(sSomeTablename);
	
	return $("div#"+sSomeTablename+"_wrapper").elementExists();
		
};


/**
 * Check if selecting rows is allowed now, given the state of the row selection user button
 * 
 * @param {(String|API-object-instance)} sSomeTablename - Name of a table
 * @returns {Boolean} true if selecting rows is allowed now, otherwise false
 */
fn.rowsSelectionIsAllowed = function(sSomeTablename){
	
	if (typeof sSomeTablename == 'object')
		sSomeTablename = fn.getTableName(sSomeTablename);
	
	// if assigned class says functions should be asleep, 
	// that means that the multiple rows selection is turned on.
	return $("#"+sSomeTablename+"_wrapper #selectionbutton").hasClass("functions_are_asleep");
};


/**
 * Check if a table is empty (that is: no rows to show)
 * 
 * @param {(String|API-object-instance)} sSomeTablename - Name of a table
 * @returns {Boolean} true if the table is empty, otherwise false
 */
fn.tableIsEmpty = function(sSomeTablename){
	
	if (typeof sSomeTablename == 'object')
		sSomeTablename = fn.getTableName(sSomeTablename);
	return $("#"+sSomeTablename+" tbody tr:eq(0)").find("td:eq(0)").hasClass("dataTables_empty");
};


/**
 * Check if a table is hidden (on the screen)
 * 
 * @param {(String|API-object-instance)} sSomeTablename - Name of a table
 * @returns {Boolean} true if the table is hidden, otherwise false
 * 
 * @see fn.hideTable
 * @see fn.showTable
 */
fn.tableIsHidden = function(sSomeTable){
	if (typeof sSomeTable == 'object')
		sSomeTable = fn.getTableName(sSomeTable);
	return $("#"+sSomeTable+"_wrapper:visible").length==0;
};


/**
 * Get the position of a table on screen. This enables us to save the position
 * of a table before it is closed, and put this table back at the very same
 * place if we need to.
 * 
 * @param {(String|API-object-instance)} sSomeTablename - Table name or object
 * @returns {Array} An associative array with the table position {"top": ..., "left": ...}
 * 
 * @see fn.getTableExtraSettings
 * @see fn.callDatabase
 */
fn.getTablePosition = function(sSomeTablename){
	
	if (typeof sSomeTablename == 'object')
		sSomeTablename = fn.getTableName(sSomeTablename);
	
	var iCurrentLeft =	$("#"+sSomeTablename+"_dynamic").offset().left;
	var iCurrentTop = 	$("#"+sSomeTablename+"_dynamic").offset().top;	
	
	return {"top": iCurrentTop, "left": iCurrentLeft};
};


/**
 * Get the table extra settings, like position, width, etc as stated in [oExtraSettings].
 * This enables us to save the settings of a table before its is closed, and put
 * the table back at the very same position and with the same width etc if we want to.
 * 
 *  @param {(String|API-object-instance)} sSomeTablename - Table name or object
 *  @returns {Array} An associative array with the table extra settings {"left": ..., "top": ..., "viewtype": ..., 
 *  "displaylength": ..., "size": ...}
 *  
 *  @see fn.getTablePosition
 *  @see fn.callDatabase
 */
fn.getTableExtraSettings = function(sSomeTablename){
	
	if (typeof sSomeTablename == 'object')
		sSomeTablename = fn.getTableName(sSomeTablename);
	
	var iCurrentLeft =		$("#"+sSomeTablename+"_dynamic").offset().left;
	var iCurrentTop = 		$("#"+sSomeTablename+"_dynamic").offset().top;
	var sViewtype = 		fn.getViewType(sSomeTablename);
	var iDisplayLength =	fn.getCurrentDisplayLength(sSomeTablename);
	var iTableWidth = 		$("#"+sSomeTablename+"_dynamic").css("width");
	
	var aSettings = new Array();
	aSettings["left"] = iCurrentLeft;
	aSettings["top"] = iCurrentTop;
	aSettings["viewtype"] = sViewtype;
	aSettings["displaylength"] = iDisplayLength;
	aSettings["size"] = iTableWidth;
	
	return aSettings;
};



/**
 * Get the name of a table, given its Datatables object or given some node
 * 
 * @param {(String|Node|API-object-instance)} mixed - Table name, table object, or some node of the table
 * @returns {String} The name of the table
 */
fn.getTableName = function(mixed){	
	
	// if input is a string, it's probably already a table name
	if (typeof mixed == 'string' && mt.tableExists(mixed))
		return mixed;
	
	// if input is a node, get the closest table name
	if ( $(mixed).is("td") || $(mixed).is("tr") )
		return $( mixed ).closest('table')[0].id;	
	
	// otherwise we must have an API instance
	return fx.getTableName(mixed);
};


/**
 * Get the number of visible rows
 * 
 * @param {(String|API-object-instance)} someTable - Table name or object
 * @returns {Integer} The number of visible rows
 */
// get the number of visible rows
// input   : table name
// returns : integer
fn.getNumberOfVisibleRows = function(someTable){
	
	return fx.getNumberOfVisibleRows(someTable);
};


/**
 * Get the current MAIN sorting column of a table
 * 
 * @param {(String|API-object-instance)} sSomeTablename - Table name or object
 * @returns {String} The current main sorting column, or null if no sorting column was set
 */
fn.getSortingColumn = function(sSomeTablename){
	if (typeof sSomeTablename == 'object')
		sSomeTablename = fn.getTableName(sSomeTablename);
	
	var aSortingSettings = mt.getDataTableObjectOf(sSomeTablename).order();
	
	if (aSortingSettings.length==0) 
		return null;
	var iSortingColumn = aSortingSettings[0][0];
	var sSortColumn = mt.getListOfColumnsOf(sSomeTablename)[iSortingColumn];
	return sSortColumn;
};


/**
 * Get all the sorting columns of a table, in priority order
 * 
 * @param {(String|API-object-instance)} sSomeTablename - Table name or object
 * @returns {String[]} An array with the names of all sorting columns, or null if no sorting column was set
 */
fn.getSortingColumns = function(sSomeTablename){
	if (typeof sSomeTablename == 'object')
		sSomeTablename = fn.getTableName(sSomeTablename);
	
	var aSortingSettings = mt.getDataTableObjectOf(sSomeTablename).order();
	
	if (aSortingSettings.length==0) return null;
	
	var aSortingColumns = new Array();
	for (var i=0; i<aSortingSettings.length; i++)
		{
		var iSortingColumn = aSortingSettings[i][0];
		var sSortColumn = mt.getListOfColumnsOf(sSomeTablename)[iSortingColumn];
		aSortingColumns.push(sSortColumn);
		}
		
	return aSortingColumns;
};

/**
 * Get the current MAIN sorting direction of the active sorting column of a table
 * 
 * @param {(String|API-object-instance)} sSomeTablename - Table name or object
 * @returns {String} Sorting direction 'asc' or 'desc'  (or null if not sorting column was set)
 */
fn.getSortingDirection = function(sSomeTablename){
	
	if (typeof sSomeTablename == 'object')
		sSomeTablename = fn.getTableName(sSomeTablename);
	
	var aSortingSettings =	mt.getDataTableObjectOf(sSomeTablename).order();
	var sSortDirection =	(aSortingSettings.length==0) ? null : aSortingSettings[0][1];
	return sSortDirection;
};

/**
 * Get all the sorting columns directions of a table, in priority order
 * 
 * @param {(String|API-object-instance)} sSomeTablename - Table name or object
 * @returns {String[]} Sorting directions 'asc' or 'desc' of all sorting columns (or null if not sorting column was set)
 */
fn.getSortingDirections = function(sSomeTablename){
	
	if (typeof sSomeTablename == 'object')
		sSomeTablename = fn.getTableName(sSomeTablename);
	
	var aSortingSettings = mt.getDataTableObjectOf(sSomeTablename).order();
	
	var aSortingDirs = new Array();
	for (var i=0; i<aSortingSettings.length; i++)
		{
		var iSortingDir = aSortingSettings[i][1];		
		aSortingDirs.push(iSortingDir);
		}
	
	return aSortingDirs;
};


/**
 * Set the sorting of a table,
 * given its name and an associative array as { colname1: sortdir1, colname2: sortdir2, ...}
 * where sortdir is 'asc' or 'desc'
 * 
 * @param {(String|API-object-instance)} sSomeTablename - Table name or object
 * @param {String[]} Sorting directions 'asc' or 'desc' of all sorting columns (or null if not sorting column was set)
 */
fn.setSorting = function(sSomeTablename, oSortingColumnsAndDirections){
	
	if (typeof sSomeTablename == 'object')
		sSomeTablename = fn.getTableName(sSomeTablename);
	
	var aNewSettings = new Array();
	for (aOnePair in oSortingColumnsAndDirections)
		{
		var iColumnNumber = $.inArray(aOnePair, mt.getListOfColumnsOf(sSomeTablename));
		var sSortingDirection = oSortingColumnsAndDirections[aOnePair];
		aNewSettings.push([iColumnNumber, sSortingDirection]);
		}
	mt.getDataTableObjectOf(sSomeTablename).order( aNewSettings );
};


/**
 * Get the current number of rows allowed to be shown at once in the table
 * (given the state of the display length selector in the GUI)
 * 
 * @param {(String|API-object-instance)} sSomeTablename - Table name or object
 * @returns {Integer} Number of rows allowed to be shown at once
 */
fn.getCurrentDisplayLength = function(sSomeTablename){
	if (typeof sSomeTablename == 'object')
		sSomeTablename = fn.getTableName(sSomeTablename);
	
	return mt.getDataTableObjectOf(sSomeTablename).page.len();
};


/**
 * Get the current index at which display of rows currently starts
 * 
 * @param {(String|API-object-instance)} sSomeTablename - Table name or object
 * @returns {Integer} Index at which display of rows currently starts
 */
fn.getCurrentDisplayStart = function(sSomeTablename){
	if (typeof sSomeTablename == 'object')
		sSomeTablename = fn.getTableName(sSomeTablename);
	
	return mt.getDataTableObjectOf(sSomeTablename).page.info().start;
};


// *************************************************
// *  READ A TABLE FROM THE DATABASE               *
// *  load a table into the datatables interface   *
// *************************************************/

/**
 * Call a table in the current GUI
 * 
 * @param {(String|API-object-instance)} sSomeTablename - Table name or object
 * @param {Array} [aContentToMatch=null] - An associative array of fields and values to match
 * @param {Function} [fnFunction=null] - A function to be called once the table has been loaded
 * @param {TableSettingsArray} [oExtraSettings=null] - An associative array containing some extra settings
 * 
 * @example
 * callDatabase("wordforms", {"wordform": somevalue, "has_analysis": true});
 * 
 * @see fn.callDatabaseInNewTab
 * @see fn.getTableExtraSettings
 */
fn.callDatabase = function(sSomeTablename, aContentToMatch, fnFunction, oExtraSettings){
	
	// make sure sSomeTablename contains a string
	if (typeof sSomeTablename == 'object')
		sSomeTablename = fn.getTableName(sSomeTablename);
	
	// In some rare cases, when a config.js-file calls a table straight
	// at initialization time, the function competes with the normal initialization 
	// functions, so some general data (tables list and types, etc.) are loaded too late,
	// t.i. after the current function call. To prevent this, we check here if
	// the normal initialization is finished, and if it is not, we call setTimeout
	
	// Trick to do that:
	// asTableTypes mustn't be undefined. If it is, the initialization is not
	// finished, so wait another 250 ms. Otherwise, carry on with fn._callDatabase
	
	var iTableIndex = $.inArray(sSomeTablename, asTableNames);
	
    if( (typeof asTableTypes[ iTableIndex ]) !== "undefined"){ 
    	
    	fn._callDatabase(sSomeTablename, aContentToMatch, fnFunction, oExtraSettings);
    }
    else{
        setTimeout(function(){
        	
        	fn.callDatabase(sSomeTablename, aContentToMatch, fnFunction, oExtraSettings);
        	
        }, 250);
    }
	
};

// subroutine of fn.callDatabase
fn._callDatabase = function(sSomeTablename, aContentToMatch, fnFunction, oExtraSettings){
	
	
	// the content to match must be at least an empty array
	if (aContentToMatch == null)
		aContentToMatch = {};
	
	// make sure sSomeTablename contains a string
	if (typeof sSomeTablename == 'object')
		sSomeTablename = fn.getTableName(sSomeTablename);
	
	// a new call to an existing table causes the content of 
	// the undo stack to become irrelevant (as we get new content), so clean the undo stack
	un.cleanUndoStack(sSomeTablename);
	
	// if the table doesn't exist yet, create it with the right settings
	if ( !mt.tableExists(sSomeTablename))
	{
		// create a table properties record		
		// we pass a function and its arguments for initial call
		// (this function can only be called after the table was created, which is why we store it and call it only later)
		var func = function(){fn._callTableWithFilter(sSomeTablename, aContentToMatch);};
		var args = [sSomeTablename, aContentToMatch];
		
		// very important: here the table record is created in the multitables namespace 
		// (which is where we always create a table by calling this function)
		mt.createTableRecordWithFilter(sSomeTablename, func, args);
		
		// load the table into a html frame, and store its datatables object
		tb.loadTable(sSomeTablename, fnFunction, oExtraSettings);
	}	
	// if the table exists already, just call it with the right settings
	else
	{		
		if (fnFunction != null) 
			mt.getDataTableObjectOf(sSomeTablename).addDrawCallback("userCallBack", fnFunction);		
		fn._callTableWithFilter(sSomeTablename, aContentToMatch);
	}
	
};



// this is a subroutine of fn.callDatabase
fn._callTableWithFilter = function(sSomeTablename, aContentToMatch){
	
	// set the required filters
	mt.getDataTableObjectOf(sSomeTablename).setSearchFilters(aContentToMatch);
	mt.getDataTableObjectOf(sSomeTablename).draw();
	
};



/**
 * Call a table in a new tab
 * 
 * @param {(String|API-object-instance)} sSomeTablename - Table name or object
 * @param {Array} [aContentToMatch=null] - An associative array of fields and values to match
 * @param {TableSettingsArray} [oExtraSettings=null] - An associative array containing some extra settings
 * @param {String} [sProjectName=null] - Name of a project, if the called table belongs to another project than the current one
 * 
 * @see fn.callDatabase
 * @see fn.getTableExtraSettings
 */
fn.callDatabaseInNewTab = function(sSomeTablename, aContentToMatch, oExtraSettings, sProjectName){
	
	if (typeof sSomeTablename == 'object')
		sSomeTablename = fn.getTableName(sSomeTablename);
	
	// the content to match must be at least an empty array
	if (aContentToMatch == null)
		aContentToMatch = {};
	
	var sBaseUrl = fn._getBaseUrl();
	var hParams = getHttpParams();
	var sDb = sProjectName == null ? hParams.get("db") : sProjectName;
	var sUrl = sBaseUrl+"?db="+sDb+"&table="+sSomeTablename;
	
	for (var sOneKey in aContentToMatch)
		{
		sUrl += "&"+sOneKey+"="+aContentToMatch[sOneKey];
		}
	for (var sOneKey in oExtraSettings)
		{
		sUrl += "&"+"setting."+sOneKey+"="+oExtraSettings[sOneKey];
		}
	window.open( encodeURI(sUrl), '_blank');
};

// get base url of the software (help function of fn.callDatabaseInNewTab)
fn._getBaseUrl = function(){
	var url = document.URL;
	var base = url.substring(0, url.indexOf("?db="));
	return base;
};



// *****************************************************************
// *             GENERAL TABLE FUNCTIONS                           *
// *****************************************************************


/**
 * Register a new table. This function is needed when one wants to 
 * call a fully configured table that didn't exist yet at start up (which is why
 * the table was not registered nor configured yet). 
 * 
 * @param {String} sTableName - Name of the new table to register
 * @param {String} sTableDescription - table description (visible to user in tables list)
 * @param {String} sType - database table type ('base table', 'view')
 * @param {String} sTableComment - table comments, which a user can edit by clicking onto the table name (in the table header) in the GUI
 * @param {Array} oConfiguration - An associative array, containing the table configuration, in the way this has to be declared in oTableConfigurationList
 * @param {Array} oSettings - An associative array, containing the table settings, in the way those have to be declared in oTableSettingsList
 * 
 * @see fn.declareNewTable
 */
fn.registerNewTable = function(sTableName, sTableDescription, sType, sTableComment, oConfiguration, oSettings ){
	
	if (sTableDescription == null)	sTableDescription = '';
	if (sType == null)	sType = '';
	if (sTableComment == null)	sTableComment = '';
	
	
	// register each table details
	
	asTableNames.push( sTableName );
	asTableDescriptions.push( sTableDescription );
	asTableComments.push( sTableComment );
	asTableTypes.push( sType );
	abTableVisible.push( false ); // the table list in the GUI won't be rebuilt, so it won't be visible in there...
	
	// details of the table
	
	mt.addAvailableTableDetails( sTableName, [ sTableDescription, sType, sTableComment ]);
	
	// table configuration and settings
	
	oTableConfigurationList[sTableName] = oConfiguration;
	
	oTableSettingsList[sTableName] = oSettings;
	
};

/**
 * Synonym of fn.registerNewTable
 * 
 * @see fn.registerNewTable
 */
fn.declareNewTable = function(sTableName, sTableDescription, sType, sTableComment, oConfiguration, oSettings ){
	
	fn.registerNewTable(sTableName, sTableDescription, sType, sTableComment, oConfiguration, oSettings );
};


/**
 * In case only one single table is available to the user to choose from,
 * this table will normally be opened automatically. But in
 * projects in which this behaviour is not desired, it can be switched off
 * by calling this function at the beginning of the config.js file
 */
fn.preventAutomaticStartup = function(){
	bOpenSingleTableAtStartup = false;
};


/**
 * Refresh a table (keep current filters etc)
 * 
 * @param {(String|API-object-instance)} sSomeTablename - Table name or object
 */
fn.refreshTable = function(sSomeTablename, fnCallback){
	
	if (typeof sSomeTablename == 'object')
		sSomeTablename = fn.getTableName(sSomeTablename);
	
	if (fnCallback != null) 
		mt.getDataTableObjectOf(sSomeTablename).addDrawCallback("userCallBack", fnCallback);

	// check if the table does exist, otherwise we get an error
	if ( fn.tableExists(sSomeTablename) )
		gui.refreshTable(sSomeTablename);
};


/**
 * Reset a table (t.i. restore the original configuration etc)
 * 
 * @param {(String|API-object-instance)} sSomeTablename - Table name or object
 * @param {Function} [fnCallback=null] - Some function to call after the table has been reset
 */
fn.resetTable = function(sSomeTablename, fnCallback){
	
	if (typeof sSomeTablename == 'object')
		sSomeTablename = fn.getTableName(sSomeTablename);
	
	if (fnCallback != null) 
		mt.getDataTableObjectOf(sSomeTablename).addDrawCallback("userCallBack", fnCallback);

	if ( fn.tableExists(sSomeTablename) )
		{
		$("#"+sSomeTablename+"_resetbutton button").click();
		}
		
};

// 

/**
 * Request the Lex'it webservice to clean its counter cache etc for a given table
 * 
 * @param {(String|API-object-instance)} sSomeTablename - Table name or object
 * @param {Function} fnCallback - Some function to call after the cache was cleaned
 * @param {Function} [fnErrorHandler=null] - Some function to call when an error occurs
 */
fn.cleanTableCache  = function(sSomeTablename, fnCallback, fnErrorHandler){
	
	if (typeof sSomeTablename == 'object')
		sSomeTablename = fn.getTableName(sSomeTablename);
	
	// force webservice to clean its counter cache etc
	// update the database
	var url = WEBSERV_URL+"/table/cleancache"; 
	$.ajax( {
		"type": "GET",
		"url": url,
		"data": {
			"db_name": getHttpParams().get("db"),
			"table_name": sSomeTablename,
			"dummy": getUniqueNumber()
			},
	 	"dataType": "xml", // get response as xml
	 	"success": function(xml) {
	 		// callback if it is set
	 		if (fnCallback!=null)
	 				fnCallback();
	 		},
		"error": function(jqXHR, textStatus, errorThrown){
			fn.refreshTable(sSomeTablename);
			
			if (fnErrorHandler!=null)
				fnErrorHandler({
					"jqXHR": jqXHR, "textStatus": textStatus, "errorThrown": errorThrown,
					"lexit_function": "fn.cleanTableCache",
					"sSomeTablename": sSomeTablename
					});
			else
				fn.message("Fout",
				"Fout bij aanroep van fn.cleanTableCache("+sSomeTablename+"): " +				
				textStatus+" "+errorThrown+"; "+getJqXHRInfo(jqXHR));
			}
		} );
};


/**
 * Define a table draw callback, if one is needed
 * (this callback will be called only once)
 * 
 * @param {(String|API-object-instance)} sSomeTablename - Table name or object
 * @param {Function} fnFunction - Some draw callback function
 */
fn.addDrawCallback = function(sSomeTablename, fnFunction){
	
	if (typeof sSomeTablename == 'object')
		sSomeTablename = fn.getTableName(sSomeTablename);
	mt.getDataTableObjectOf(sSomeTablename).addDrawCallback("userCallBack", fnFunction);
};



/**
 * Scroll to a table if it happens to be outside the visible window
 * 
 * @param {(String|API-object-instance)} sSomeTablename - Table name or object
 */
fn.scrollToTable = function(sSomeTablename){
	
	if (typeof sSomeTablename == 'object')
		sSomeTablename = fn.getTableName(sSomeTablename);
	
	smoothScroll("html,body", "#"+sSomeTablename+"_dynamic");
};



/**
 * Put a table to the right side of another table (alignment)
 * 
 * @param {String} sSomeTablename1 - Table name 
 * @param {String} sSomeTablename2 - Table name 
 * @param {Function} fnCallback - Some function to call after the tables have been aligned
 * 
 * @see fn.pileupTables
 */
fn.alignTables = function(sSomeTablename1, sSomeTablename2, fnCallback){
	
	var tableName1 = fn.getTableName(sSomeTablename1);
	var tableName2 = fn.getTableName(sSomeTablename2);
	
	// selectors
	var tableRef1 = $("#"+tableName1+"_dynamic");	
	var tableRef2 = $("#"+tableName2+"_dynamic");
	
	// we need to compute a new position, so get the current position data
	var tableWidth1 = tableRef1.width();
	var tableXpos1 = tableRef1.offset().left;
	var tableYpos1 = tableRef1.offset().top;	
	
	// Put the second table next to the first one
	// we need to set an absolute position instead of a relative one, since
	// any change in the height of the first table will cause the second one to shift up or down!
	tableRef2.css("position", "absolute");
	tableRef2.css("left", (tableXpos1+tableWidth1)+"px");
	tableRef2.css("top", tableYpos1+"px");
	
	// callback if it is set
	if (fnCallback!=null)
			fnCallback();
};


/**
 * Put a table right under another table
 * 
 * @param {String} sSomeTablename1 - Table name 
 * @param {String} sSomeTablename2 - Table name 
 * @param {Function} fnCallback - Some function to call after the tables have been aligned
 * 
 * @see fn.alignTables
 */
fn.pileupTables = function(sSomeTablename1, sSomeTablename2, fnCallback){
	
	var tableName1 = fn.getTableName(sSomeTablename1);
	var tableName2 = fn.getTableName(sSomeTablename2);
	
	// selectors
	var tableRef1 = $("#"+tableName1+"_dynamic");	
	var tableRef2 = $("#"+tableName2+"_dynamic");
	
	// we need to compute a new position, so get the current position data
	var tableHeight1 = tableRef1.height();
	var tableXpos1 = tableRef1.offset().left;
	var tableYpos1 = tableRef1.offset().top;
	
	// Put the second table next to the first one
	// we need to set an absolute position instead of a relative one, since
	// any change in the height of the first table will cause the second one to shift up or down!
	tableRef2.css("position", "absolute");
	tableRef2.css("left", tableXpos1+"px");
	tableRef2.css("top", (tableYpos1+tableHeight1)+"px");
	
	// callback if it is set
	if (fnCallback!=null)
			fnCallback();
};


/**
 * Since tables with a narrow width are put on the screen on the same line,
 * it can be convenient to prevent following tables to line up!
 * To do so, use this function
 * 
 * @deprecated
 */
fn.breakTableLine = function(){
	$("#dynamic").append($("<div></div>").css("clear", "both"));
};



/**
 * Show the Processing indicator
 * 
 * @param {(String|API-object-instance)} sSomeTablename - Table name or object
 */
fn.showProcessingMsg = function(sSomeTablename){
	if (typeof sSomeTablename == 'object')
		sSomeTablename = fn.getTableName(sSomeTablename);
	gui.showProcessingMsg(sSomeTablename);
};

/**
 * Hide the Processing indicator
 * 
 * @param {(String|API-object-instance)} sSomeTablename - Table name or object
 */
fn.removeProcessingMsg = function(sSomeTablename){
	if (typeof sSomeTablename == 'object')
		sSomeTablename = fn.getTableName(sSomeTablename);
	gui.removeProcessingMsg(sSomeTablename);
};


/**
 * Remove/close a table
 * 
 * @param {(String|API-object-instance)} sSomeTablename - Table name or object
 * @param {Function} fnCallback - Some function to call after the table if closed 
 */
fn.closeTable = function(sSomeTablename, fnCallback){
	if (typeof sSomeTablename == 'object')
		sSomeTablename = fn.getTableName(sSomeTablename);
	$("#"+sSomeTablename+"_wrapper div.top div#"+sSomeTablename+"_tableclosebutton button").click();
	
	if (fnCallback != null)
		fnCallback();
};



/**
 * Hide a table
 * 
 * @param {(String|API-object-instance)} sSomeTablename - Table name or object
 * 
 * @see fn.showTable
 * @see fn.tableIsHidden
 */
fn.hideTable = function(sSomeTablename){
	if (typeof sSomeTablename == 'object')
		sSomeTablename = fn.getTableName(sSomeTablename);
	$("#"+sSomeTablename+"_wrapper").hide("slow");
};


/**
 * Show a table
 * 
 * @param {(String|API-object-instance)} sSomeTablename - Table name or object
 * 
 * @see fn.hideTable
 * @see fn.tableIsHidden
 */
fn.showTable = function(sSomeTablename){
	if (typeof sSomeTablename == 'object')
		sSomeTablename = fn.getTableName(sSomeTablename);
	$("#"+sSomeTablename+"_wrapper").show("slow");
};


/**
 * Set manually which table is active now,
 * that is: which table key operations are to be applied to
 * (normally this is determined by the users actions in the GUI)
 * 
 * @param {(String|API-object-instance)} sSomeTablename - Table name or object
 */
fn.setActiveTable = function(sSomeTablename){
	
	if (typeof sSomeTablename == 'object')
		sSomeTablename = fn.getTableName(sSomeTablename);
	
	kf.setActiveTable(sSomeTablename);
}


// *****************************************************************
// *     GENERAL ROW FUNCTIONS                                     *
// *****************************************************************

/**
 * Retrieve the number of a row node (0-based)
 * that is: its index within the set of all database rows
 * 
 * @param {Node} nRow - A row node 
 * @returns {Integer} The number of a row node
 */
fn.getRowNodeIndex = function(nRow){
	
	fn._checkApiInstance("fn.getRowNodeIndex", nRow);
	fn._checkjQueryObject("fn.getRowNodeIndex", nRow);
	
	var oRow = fx.getRow(nRow);
	
	return fx.getRowIndex(oRow);
};



/**
 * Retrieve the (0-based) number of a row node on the screen,
 * that is: the row number within current display range [eg. 0-9]
 * 
 * @param {Node} nRow - A row node 
 * @returns {Integer} Row number within current display range
 */
fn.getRowNodeNumberOnScreen = function(nRow){
	
	fn._checkApiInstance("fn.getRowNodeNumberOnScreen", nRow);
	fn._checkjQueryObject("fn.getRowNodeNumberOnScreen", nRow);
	
	var oRow = fx.getRow(nRow); 

	return fx.getRowNumberOnScreen(oRow); 
};



/**
 * Get all displayed rows from a table
 * 
 * @param {(String|API-object-instance)} sSomeTablename - Table name or object
 * @returns {Node[]} An array of nodes
 */
fn.getAllRowNodes = function(oTable){

	if (typeof oTable == 'string')
		oTable = mt.getDataTableObjectOf(oTable);
	
	// return the nodes
	return (fx.getAllRows(oTable)).nodes().toArray();
};




/**
 * Get the first row node which contains some given values
 * 
 * @param {(String|API-object-instance)} sSomeTablename - Table name or object
 * @param {Array} aFieldsAndValues - An associative array of fields and search values
 * @returns {Node} A row node (or null if search failed)
 * 
 * @see fn.getAllRowNodesWhere
 */
fn.getRowNodeWhere = function(sSomeTable, aFieldsAndValues){
	
	var sTableName = (typeof sSomeTable == 'object' ? fn.getTableName(sSomeTable) : sSomeTable);
	
	// pre-check: are the given fields correct?
	for (sFieldName in aFieldsAndValues)
	{		
		if ($.inArray(sFieldName, mt.getListOfColumnsOf(sTableName)) < 0)
			{
			fn.message("Fout", 
					"Verkeerde aanroep van fn.getRowNodeWhere("+sTableName+"). " +
					"De opgegeven kolom '"+sFieldName+"' komt niet voor in tabel '"+sTableName+"'.");
			
			return null;
			}
	}
	
	// apply the filters and return the first row node
	
	return fn.getAllRowNodesWhere(sSomeTable, aFieldsAndValues, true);	
};


/**
 * Get ALL the row nodes which contain some given values
 * 
 * @param {(String|API-object-instance)} sSomeTablename - Table name or object
 * @param {Array} aFieldsAndValues - An associative array of fields and search values
 * @param {Boolean} [bOnlyFirstRow=false] - true if we only want the first row, otherwise false (default)
 * @returns {Node/Node[]} A node resp. an array of row nodes (NULL resp. an empty array if nothing was found)
 * 
 * @see fn.getRowNodeWhere
 */
fn.getAllRowNodesWhere = function(sSomeTable, aFieldsAndValues, bOnlyFirstRow){
	
	if (bOnlyFirstRow == null)
		bOnlyFirstRow = false;
	
	var sTableName = (typeof sSomeTable == 'object' ? fn.getTableName(sSomeTable) : sSomeTable);
	
	var oRows = fx.getAllRowsWhere(sTableName, aFieldsAndValues, bOnlyFirstRow);
	
	if (bOnlyFirstRow)
		{
		if (oRows.count() == 1)
			return oRows.node();
		else
			return null;
		}
	
	return oRows.nodes().toArray();
};


/**
 * Get the row node which has a given id
 * 
 * @param {(String|API-object-instance)} sSomeTable - Table name or object
 * @param {String} sId - A row id
 * @returns {Node} A row node, or null if it wasn't found
 */
fn.getRowNodeWhereIdIs = function(sSomeTable, sId){
	
	return (fx.getRowWhereIdIs(sSomeTable, sId)).node();
};



// *****************************************************************
// *     ROW SELECTION FUNCTIONS                                   *
// *****************************************************************

/**
 * Manually unselect all the row nodes in the table
 * 
 * @param {(String|API-object-instance)} sSomeTable - Table name or object
 */
fn.unselectAllRowNodes = function(sSomeTable){
	
	if (typeof sSomeTable == 'object')
		sSomeTable = fn.getTableName(sSomeTable);
	
	// NOTE the operation is performed onto the nodes
	$('#'+sSomeTable+' tbody').find("tr").removeClass('selected');
	
};



/**
 * Manually select all the row nodes in the table
 * 
 * @param {(String|API-object-instance)} sSomeTable - Table name or object
 */
fn.selectAllRowNodes = function(sSomeTable){
	
	if (typeof sSomeTable == 'object')
		sSomeTable = fn.getTableName(sSomeTable);
	
	// NOTE the operation is performed onto the nodes
	$('#'+sSomeTable+' tbody tr').each(function(){
		if ( !$(this).hasClass("selected"))
			$(this).toggleClass('selected');
	});
};



/**
 * Manually select a row, given its row number on screen
 * 
 * @param {(String|API-object-instance)} sSomeTable - Table name or object
 * @param {Integer} iRowNumber - A row number within the current display range (0-9 or such)
 */
fn.selectRowNode = function(sSomeTable, iRowNumber){
	
	if (typeof sSomeTable == 'object')
		sSomeTable = fn.getTableName(sSomeTable);
	
	// NOTE the operation is performed onto the node
	var nRowSelector = $('#'+sSomeTable+' tbody tr:eq('+iRowNumber+')');
	if ( iRowNumber>=0 && !nRowSelector.hasClass("selected"))
		{
		nRowSelector.toggleClass('selected');
		}
	else if (iRowNumber<0)
		{
		fn.message("Fout", "fn.selectRowNode("+sSomeTable+") " +
				"is aangeroepen met een negatieve waarde voor iRowNumber: "+iRowNumber);
		};
};




/**
 * Manually unselect a row, given its row number on screen
 * 
 * @param {(String|API-object-instance)} sSomeTable - Table name or object
 * @param {Integer} iRowNumber - A row number within the current display range (0-9 or such)
 */
fn.unselectRowNode = function(sSomeTable, iRowNumber){
	
	if (typeof sSomeTable == 'object')
		sSomeTable = fn.getTableName(sSomeTable);
	
	// NOTE the operation is performed onto the node
	var nRowSelector = $('#'+sSomeTable+' tbody tr:eq('+iRowNumber+')');
	if ( nRowSelector.hasClass("selected"))
		nRowSelector.toggleClass('selected');
};



/**
 * Get the rows that are selected (that is: highlighted by user) in a table
 * 
 * @param {(String|API-object-instance)} someTable - Table name or object
 * @returns {Node[]} An array of row nodes
 */
fn.getSelectedRowNodesFrom = function(someTable){
	
	if (typeof someTable == 'string')
		someTable = mt.getDataTableObjectOf(someTable);
		
	return fx.getSelectedRowsFrom(someTable).nodes().toArray();
};


/**
 * Get the first selected row node from a user rows selection
 * 
 * @param {(String|API-object-instance)} someTable - Table name or object
 * @returns {Node} A row node
 */
fn.getFirstSelectedRowNodeFrom = function(someTable){
	
	return fx.getFirstSelectedRowFrom(someTable).node();
}


/**
 * Get the row number of the first selected row
 * 
 * @param {(String|API-object-instance)} someTable - Table name or object
 * @returns {Integer} row number, or -1 if no row was selected by the user
 */
fn.getIndexOfFirstSelectedRowNodeFrom = function(someTable){
	
	if (typeof someTable == 'string')
		someTable = mt.getDataTableObjectOf(someTable);
	
	// using row() combined with eq(0) guarantees we get only one result
	var oRow = someTable.row(".selected:eq(0)");
	if (oRow.count() == 0)
		return -1;
	
	// find first selected row node in array of all row nodes
	return $.inArray( oRow.node(), someTable.rows().nodes().toArray() );
};


/**
 * Get the row where the cursor is at (= highlighted row when scrolling up or down)
 * 
 * @param {(String|API-object-instance)} someTable - Table name or object
 * @returns {Node} A row node
 */
fn.getActiveRowNode = function(sSomeTable){
	
	if (typeof sSomeTable == 'object')
		sSomeTable = fn.getTableName(sSomeTable);
		
	if (kf.getActiveTable() != sSomeTable) 
		{
		var oFirstSelectedRow =	fx.getFirstSelectedRowFrom(sSomeTable);
		var aAllRows = 			fx.getAllRows(sSomeTable);
		
		// There is no active node in a table which hasn't focus!
		// So: pick the first selected row, 
		// else if there is no selected row, pick the top row
		// else if table is empty, return null
		
		if ( oFirstSelectedRow.any() )
			{
			return oFirstSelectedRow.node();
			}
		else if ( aAllRows.any() )
			{
			return mt.getDataTableObjectOf(sSomeTable).row(0).node();
			}
		else
			{
			return null;
			}
		}
	
	return mt.getDataTableObjectOf(sSomeTable).row( kf.getActiveRowNumber() ).node();
};



/**
 * Get the row node preceding the one given as an argument
 * 
 * @param {(Node)} nRow - a row node
 * @returns {Node} The preceding row node 
 */
fn.getPreviousRowNode = function(nRow){
	
	return $(nRow).parent().prev().get();
};

/**
 * Get the row node following the one given as an argument
 * 
 * @param {(Node)} nRow - a row node
 * @returns {Node} The following row node 
 */
fn.getNextRowNode = function(nRow){
	
	return $(nRow).parent().next().get();
};



/**
 * Get the number of selected rows of a table
 * 
 * @param {(String|API-object-instance)} someTable - Table name or object
 * @returns {Integer} Number of selected rows
 */
fn.getNumberOfSelectedRowNodes = function(sSomeTable){
	
	if (typeof sSomeTable == 'string')
		sSomeTable = mt.getDataTableObjectOf(sSomeTable);
	
	return sSomeTable.rows(".selected").count();
};



// *****************************************************************
// *     GENERAL CELL FUNCTIONS                                    *
// *****************************************************************

/**
 * Get a cell node, given a row node and a column name.
 * This function gives the possibility to access a node so as to be able to modify its CSS and such.
 * 
 * @param {Node} nRow - A row node
 * @returns {Node} A cell node (or null if function failed)
 */
fn.getCellInRowNode = function(nRow, sColumnName){
	
	fn._checkApiInstance("fn.getCellInRowNode", nRow);
	fn._checkjQueryObject("fn.getCellInRowNode", nRow);
	
	if ( !fn.isRowNode(nRow) )
		{
		fn.message("Let op", "De functie fn.getCellInRowNode("+fn.getTableName(nRow)+") is aangeroepen " +
				"met een cell node, " +
				"maar deze functie verwacht een row node als argument.");
		return null;
		}
	else
		{
		var sTable = 			fn.getTableName(nRow);
		var iThisCellNumber =	fn.getVisibleColumnNumberOf(sTable, sColumnName);
		
		
		// get(0) makes sure we get the node out of the jQuery object
		return $('td:eq('+iThisCellNumber+')', nRow).get(0);
		}	
};


 
/**
 * Get the type of a cell node (or of a named cell within a row node)
 * 
 * @param {Node} nMixed - A cell/row node
 * @param {String} [sColumnName=null] - (in combination with a row node) Name of a column
 * @returns {String} Value 'text', 'checkbox', 'selectbox' or 'unknown'
 */
fn.getCellNodeType = function(nMixed, sColumnName){
	
	fn._checkApiInstance("fn.getCellNodeType", nMixed);
	fn._checkjQueryObject("fn.getCellNodeType", nMixed);
	
	var sTable = fn.getTableName(nMixed);
	
	// if some column name was specified,
	// we extract the named cell out of the row node
	if (typeof sColumnName != 'undefined')
		{
		nMixed = fn.getCellInRowNode(nMixed, sColumnName);		
		}
	
	// at this point, we are sure we have a cell node, which we actually need
	if ( $(nMixed).hasClass("editable_text") || $(nMixed).hasClass("not_editable_text"))
		return "text";
	else if ( $(nMixed).hasClass("editable_checkbox") || $(nMixed).hasClass("not_editable_checkbox"))
		return "checkbox";
	else if ( $(nMixed).hasClass("editable_selectbox") || $(nMixed).hasClass("not_editable_selectbox"))
		return "selectbox";
	
	return "unknown";
};



/**
 * Check if a node is an editable cell
 * 
 * @param {Node} nCell - A cell node
 * @returns {Boolean} true if cell is editable, otherwise false
 */
fn.isEditableNode = function(nCell){
	
	fn._checkApiInstance("fn.isEditableNode", nCell);
	fn._checkjQueryObject("fn.isEditableNode", nCell);
	
	var sTable = 		fn.getTableName(nCell);	
	var aPos = 			mt.getDataTableObjectOf(sTable).cell( nCell ).index();
	var oTableConfig = 	conf.getTableConfig(sTable);
	var sColumnName = 	mt.getListOfColumnsOf(sTable)[aPos.column];
	var oColumnConfig =	conf.getColumnConfig(oTableConfig, sColumnName);
	
	return conf.getEditability(oColumnConfig);
};



/**
 * Manually uncheck a list of checkboxes
 * 
 * @param {Node} nMixed - A cell/row node
 * @param {String[]} aListOfColumns - A list of columns in which the checkboxes are to be found
 * @param {Function} fnCallback - Some function to call after the checkboxes have been unchecked
 */
fn.uncheckCheckboxes = function(nMixed, aListOfColumns, fnCallback){
	
	fn._checkApiInstance("fn.uncheckCheckboxes", nMixed);
	fn._checkjQueryObject("fn.uncheckCheckboxes", nMixed);
	
	var sTable = fn.getTableName(nMixed);
	var oTable = mt.getDataTableObjectOf(sTable);
	
	
	// make sure we have a row node, and get its position on the screen
	nMixed = 			fn.getRowNode(nMixed);
	var iRowNumber =	fn.getRowNodeNumberOnScreen(nMixed);
	
	for (var i=0; i<aListOfColumns.length; i++)
		{
		// get the the setting of the checkbox
		var sColumnName =			aListOfColumns[i];			
		var iVisibleColumnNumber =	fn.getVisibleColumnNumberOf(oTable, sColumnName);
		
		var nCell = $("#"+sTable+" tbody tr").eq(iRowNumber)
			.find("td").eq(iVisibleColumnNumber)
			.find("input").eq(0);
		// prop is the most reliable 
		// (see: http://jquery-howto.blogspot.nl/2013/02/jquery-test-check-if-checkbox-checked.html)
		var bSetting = (nCell.prop("checked") == true);
		
		// if checkbox is checked, uncheck it! 
		if (bSetting)
			{			
			// focus is needed for the checkbox handler, which need to know
			// if the checkbox was clicked, or only the surrounding cell
			nCell.focus();
			nCell.click();
			nCell.blur();	
			}
		}
	
	if (fnCallback!=null)
			fnCallback();
};



/**
 * Manually click on a checkbox, given the name of the column containing the checkbox, and a row node
 * 
 * @param {Node} nRow - A row node
 * @param {String} sColumnName - A column name
 * @param {Function} fnCallback - Some function to call after the checkbox has been clicked upon
 */
fn.toggleCheckbox = function(nRow, sColumnName, fnCallback){
	
	fn._checkApiInstance("fn.toggleCheckbox", nRow);
	fn._checkjQueryObject("fn.toggleCheckbox", nRow);
	
	var sTable = fn.getTableName(nRow);
	var oTable = mt.getDataTableObjectOf(sTable);
	// get(0) makes sure we get the node out of the jQuery object
	var nCell = ($(fn.getCellInRowNode(nRow, sColumnName)).find("input").eq(0)).get(0);
	
	// we need to get focus onto the checkbox, otherwise the click
	// action we be seen as cell click instead of checkbox click (and thus ignored!)
	$(nCell).focus();
	$(nCell).click();
	
	// release focus
	$(nCell).blur();
	
	if (fnCallback!=null)
		fnCallback();
};



// *****************************************************************
// *     GENERAL COLUMN FUNCTIONS                                  *
// *****************************************************************

/**
 * Give the name of the column a cell node is part of
 * 
 * @param {Node} nCell - A cell node
 * @returns {String} Name of a column
 */
fn.getNameOfColumnForThisNode = function(nCell){
	
	fn._checkApiInstance("fn.getNameOfColumnForThisNode", nCell);
	fn._checkjQueryObject("fn.getNameOfColumnForThisNode", nCell);
	
	var sTable = 		fn.getTableName(nCell);
	var oTable = 		mt.getDataTableObjectOf(sTable);
	
	var aPos = 			oTable.cell( nCell ).index();
	var sColumnName =	mt.getListOfColumnsOf(sTable)[aPos.column];
	return sColumnName;
};


/**
 * Get the name of a column, given its visible index
 * 
 * @param {(String|API-object-instance)} sSomeTable - A table name or object
 * @param {Integer} iIndex - Visible index of a column (visible means hidden columns are skipped in the count)
 * @returns {String} Name of a column
 */
fn.getNameOfColumnForThisVisibleIndex = function( sSomeTable, iIndex){
	
	if (typeof sSomeTable == 'object')
		sSomeTable = fn.getTableName(sSomeTable);
	
	var sColumnName = mt.getListOfVisibleColumnsOf(sSomeTable)[iIndex];
	return sColumnName;
};


/**
 * Get the column number of a cell (including hidden columns), given the column name
 * 
 * @param {(String|API-object-instance)} sSomeTable - A table name or object
 * @param {String} sCellName - Column name
 * @returns {Integer} Column number (or -1 if the column doesn't exist)
 * 
 * @see fn.getVisibleColumnNumberOf
 */
fn.getColumnNumberOf = function(sSomeTable, sCellName){
	
	if (typeof sSomeTable == 'object')
		sSomeTable = fn.getTableName(sSomeTable);
	
	// here we use getListOfColumnsOf because this function is about all columns, not only the visible ones
	return $.inArray(sCellName, mt.getListOfColumnsOf(sSomeTable));
};

/**
 * Get the visible column number of a cell (so hidden columns are excluded from the count), given the column name
 * 
 * @param {(String|API-object-instance)} sSomeTable - A table name or object
 * @param {String} sCellName - Column name
 * @returns {Integer} Column number (or -1 if the column doesn't exist)
 * 
 * @see fn.getColumnNumberOf
 */
fn.getVisibleColumnNumberOf = function(sSomeTable, sCellName){
	
	if (typeof sSomeTable == 'object')
		sSomeTable = fn.getTableName(sSomeTable);
	
	return $.inArray(sCellName, mt.getListOfVisibleColumnsOf(sSomeTable));
};


// *****************************************************************
// *     GENERAL CELL/ROW NODE FUNCTIONS                           *
// *****************************************************************


/**
 * Check if a node is a cell node
 * 
 * @param {Node} nMixed - A node
 * @returns {Boolean} true if node is a cell, otherwise false
 */
fn.isCellNode = function(nMixed){
	
	if (nMixed == null) 
		return false;
	
	fn._checkApiInstance("fn.isCellNode", nMixed);
	fn._checkjQueryObject("fn.isCellNode", nMixed);
	
	return $(nMixed).is("td");
};


/**
 * Check if a node is a row node
 * 
 * @param {Node} nMixed - A node
 * @returns {Boolean} true if node is a cell, otherwise false
 */
fn.isRowNode = function(nMixed){	
	
	if (nMixed == null) 
		return false;
	
	fn._checkApiInstance("fn.isRowNode", nMixed);
	fn._checkjQueryObject("fn.isRowNode", nMixed);
	
	return $(nMixed).is("tr");
};


/**
 * Check if a node in the last one of an array of nodes
 * 
 * @param {Node} nRow - A row node
 * @param {Node[]} aSelection - An array of nodes
 * @returns {Boolean} true if the row is the last one, otherwise false
 */
fn.isLastNodeOf = function(nRow, aSelection){
	
	fn._checkApiInstance("fn.isLastNodeOf", nRow);
	fn._checkjQueryObject("fn.isLastNodeOf", nRow);
	
	fn._checkApiInstance("fn.isLastNodeOf", aSelection);
	
	var length = aSelection.length;
	return ($.inArray(nRow, aSelection) == length-1);
};


/**
 * Get the id of a row node
 * (if the node happens to be a cell, get its parent node)
 * 
 * @param {Node} nMixed - A cell/row node
 * @returns {String} The node id
 */
fn.getRowNodeId = function(nMixed){	
	
	fn._checkApiInstance("fn.getRowNodeId", nMixed);
	fn._checkjQueryObject("fn.getRowNodeId", nMixed);
	
	if (fn.isCellNode(nMixed))
		return fn.getRowNode(nMixed).id;
	return nMixed.id;
};




/**
 * Get the row node, given a node of any kind (row or cell).
 * This is to make sure we have a row, instead of only a cell
 * 
 * @param {Node} nMixed - A cell/row node
 * @returns {Node} A row node
 */
fn.getRowNode = function(nMixed){
	
	fn._checkApiInstance("fn.getRowNode", nMixed);
	fn._checkjQueryObject("fn.getRowNode", nMixed);
	
	if ( fn.isCellNode(nMixed) )
		{
		var sTable = 	fn.getTableName(nMixed);		
		var oTable = 	mt.getDataTableObjectOf(sTable);
		var iRowIndex =	oTable.cell(nMixed).index().row;
		
		return oTable.row(iRowIndex).node();
		}		
	
	return nMixed;
};





// *****************************************************************
// *     GET DATA FROM A CELL OR ROW                               *
// *****************************************************************


/**
 * Get the content of a cell which is a sibling of another cell node, given that node
 * and the name of the cell we want the content from
 * 
 * @param {Node} nCell - A cell node
 * @param {String} sOtherColumnName - Name of a column beside the cell
 * @returns {String} Cell content
 */
fn.getDataFromSiblingNode = function(nCell, sOtherColumnName){
	
	fn._checkApiInstance("fn.getDataFromSiblingNode", nCell);
	fn._checkjQueryObject("fn.getDataFromSiblingNode", nCell);
	
	var sTable = fn.getTableName(nCell);
	var oTable = mt.getDataTableObjectOf(sTable);

	var colNr = $.inArray(sOtherColumnName, mt.getListOfColumnsOf(sTable));
	
	if (  !fn.isCellNode(nCell) )
		{
		fn.message("Fout", "fn.getDataFromSiblingNode("+sTable+") " +
				"is aangeroepen met een row node, maar deze functie werkt met cell nodes.");
		return "";		
		}
	else if (colNr<0)
		{
		fn.message("Fout", "fn.getDataFromSiblingNode("+sTable+") " +
				"is aangeroepen met een niet bestaande kolomnaam: '"+sOtherColumnName+"'.");
		return "";
		}
	else
		{
		var nRowNodeForThisCellNode =	fn.getRowNode(nCell);
		var oRowData = 					oTable.row( nRowNodeForThisCellNode ).data();
		
		// data can return an object or an array 
		return (typeof oRowData == 'object') ?
			oRowData[sOtherColumnName] : oRowData[colNr];
		}	
};


/**
 * Get the content of a cell,
 * given a table name or datatable object, and a cell node
 * 
 * @param {Node} nCell - A cell node
 * @returns {String} Cell content
 */
fn.getDataFromCellNode = function(nCell){
	
	fn._checkApiInstance("fn.getDataFromCellNode", nCell);
	fn._checkjQueryObject("fn.getDataFromCellNode", nCell);
	
	if (fn.isRowNode(nCell))
		{
		fn.message("Fout", 
				"Verkeerde aanroep van fn.getDataFromCellNode("+fn.getTableName(nCell)+"). " +
				"nCell bevat geen cell node, maar een row node.");
		return;
		}	
	
	var sTable = fn.getTableName(nCell);
	var oTable = mt.getDataTableObjectOf(sTable);
		
	return oTable.cell(nCell).data();
};


/**
 * Get the content of a cell, given a row node and a column name
 * 
 * @param {Node} nRow - A row node
 * @param {String} sColumnName - Name of a column 
 * @returns {String} Cell content
 */
fn.getDataFromCellInRowNode = function(nRow, sColumnName){
	
	fn._checkApiInstance("fn.getDataFromCellInRowNode", nRow);
	fn._checkjQueryObject("fn.getDataFromCellInRowNode", nRow);
	
	if (fn.isCellNode(nRow))
		{
		fn.message("Fout", 
				"Verkeerde aanroep van fn.getDataFromCellInRowNode("+fn.getTableName(nRow)+"). " +
				"nRow bevat geen row node, maar een cell node.");
		return;
		}
	
	var sTable = fn.getTableName(nRow);
	var oTable = mt.getDataTableObjectOf(sTable);
	
	// get column number given column name	
	var colNr = $.inArray(sColumnName, mt.getListOfColumnsOf(sTable));
	
	if (colNr<0)
		{
		fn.message("Fout", "fn.getDataFromCellInRowNode("+sTable+") " +
				"is aangeroepen met een niet bestaande kolomnaam: '"+sColumnName+"'.");
		
		return "";
		}
	else
		{
		var oRowData = oTable.row( nRow ).data();
		
		// data can return an object or an array
		return (typeof oRowData == 'object') ?
			oRowData[sColumnName] : oRowData[colNr];
		}	
	
};



/**
 * Get the content of a whole column, given its name
 * 
 * @param {Node} sSomeTable - A table name or object
 * @param {String} sColumnName - Name of a column 
 * @returns {String[]} Content of the cells of the column
 * 
 * @see fn.getDataFromRowNode
 */
fn.getDataFromColumn = function(sSomeTable, sColumnName){
	
	var iVisibleColumnNumber = fn.getVisibleColumnNumberOf(sSomeTable, sColumnName);
	
	var oTable = ( typeof sSomeTable == 'string' ? mt.getDataTableObjectOf(sTableName) : sSomeTable );
	
	return oTable.column( iVisibleColumnNumber ).data();	
};

/**
 * Get the content of a row,
 * given a table name or datatable object, and a row node
 * 
 * @param {Node} nRow - A row node
 * @returns {Array} An associative array of fields names and their values
 * 
 * @see fn.getDataFromColumn
 */
fn.getDataFromRowNode = function(nRow){

	fn._checkApiInstance("fn.getDataFromRowNode", nRow);
	fn._checkjQueryObject("fn.getDataFromRowNode", nRow);

	if ( !fn.isRowNode(nRow) )
		{
		fn.message("Fout", 
				"Verkeerde aanroep van fn.getDataFromRowNode("+fn.getTableName(nRow)+"). " +
				"nRow bevat geen row node.");
		return;
		}
	
	var sTable = fn.getTableName(nRow);
	var oTable = mt.getDataTableObjectOf(sTable);
		
	return oTable.row(nRow).data();
}



/**
 * Get selected text within a node,
 * and also get the start and end positions of the selected text.
 * 
 * Adapted from:
 * http://stackoverflow.com/questions/7991474/calculate-position-of-selected-text-javascript-jquery
 * 
 * @param {Node} nMixed - A cell/row node 
 * @param {String} [sColumnName=null] - a column name, when first argument contains a row node
 * @returns {Object} Selected text, start and end position, reliability
 * 
 * @example
 * var sel = fn.getSelectedTextInNode(node);
 * alert(sel.start + ": " + sel.end + " = " + sel.text);
 * 
 * @see fn.getWordClickedUponInNode
 */
fn.getSelectedTextInNode = function(nMixed, sColumnName) {	
	
	fn._checkApiInstance("fn.getSelectedTextInNode", nMixed);
	fn._checkjQueryObject("fn.getSelectedTextInNode", nMixed);
	
	var nCell = (typeof sColumnName != 'undefined') ?
			fn.getCellInRowNode(nMixed, sColumnName) : nMixed;
	
	var start = 0, end = 0;
    var sel, range, priorRange, fulltext;
    
    // all browsers, except IE before version 9
    if (typeof window.getSelection != "undefined") 
    {    	
        range = window.getSelection().getRangeAt(0);        
        priorRange = range.cloneRange();
        priorRange.selectNodeContents(nCell);
        fulltext = priorRange.toString();
        priorRange.setEnd(range.startContainer, range.startOffset);
        start = priorRange.toString().length;
        text = range.toString();
    } 
    
    // IE before version 9
    else if (typeof document.selection != "undefined" &&
            (sel = document.selection).type != "Control") 
    {
        range = sel.createRange();
        priorRange = document.body.createTextRange();
        priorRange.moveToElementText(nCell);
        fulltext = priorRange.text;
        priorRange.setEndPoint("EndToStart", range);
        start = priorRange.text.length;
        text = range.text;
    }
    
    // Compute the true indexes of the text selection
    // This is needed because detection of positions doesn't take into account the tags and 
    //  html entitie names within the original string. We will need to remove highlighting
    //  in advance, because highlighting tags are no part of the original string
    var oTrueIndexes = getTrueIndexes(
    		fulltext,
    		fn.removeHighlight( fn.getDataFromCellNode(nCell) ), 
    		$.trim(text), start);
    // (we won't push bounderies here, since the user made a clear selection him/herself,
    // which is different from fn.getWordClickedUponInNode(): there we need to find the bounderies
    // since the user only clicked inside a word)
    
    // return an object with 4 parts: selection start/end indexes, selection text, and reliability
    return {
        start: oTrueIndexes.start,
        end: oTrueIndexes.end,
        text: $.trim(text),
        reliable: fn._selectionIsReliable(nCell, oTrueIndexes.start, oTrueIndexes.end, $.trim(text))
    };
};

/**
 * Select a word within a node just by clicking on it, 
 * and also get the start and end positions of the selected word.
 * 
 * [Adapted from fn.getSelectedTextInNode()]
 * 
 * @param {Node} nMixed - A cell/row node
 * @param {String} [sColumnName=null] - a column name, when first argument contains a row node
 * @returns {Object} Selected text, start and end position, reliability
 * 
 * @see fn.getSelectedTextInNode
 */
fn.getWordClickedUponInNode = function(nMixed, sColumnName){
	
	fn._checkApiInstance("fn.getWordClickedUponInNode", nMixed);
	fn._checkjQueryObject("fn.getWordClickedUponInNode", nMixed);
	
	var nCell = (typeof sColumnName != 'undefined') ?
			fn.getCellInRowNode(nMixed, sColumnName) : nMixed;
	
	var start = 0, end = 0;
    var sel, range, priorRange, wholeRange, fulltext;
    
    // all browsers, except IE before version 9
    if (typeof window.getSelection != "undefined") 
    {    	
        range = window.getSelection().getRangeAt(0);   
        wholeRange = range.cloneRange();
        wholeRange.selectNodeContents(nCell);
        priorRange = range.cloneRange();
        priorRange.selectNodeContents(nCell);
        priorRange.setEnd(range.startContainer, range.startOffset);
        start = priorRange.toString().regexLastIndexOf(/(\s|\.|,|;|:|\(|\[|'|"|„|”)/)+1;
        end   = wholeRange.toString().regexIndexOf(/(\s|\?|!|\.|,|;|:|\)|\]|'|"|„|”)/, start+1);
        if (end<0) end = wholeRange.toString().length;      
        fulltext = wholeRange.toString();
        text  = fulltext.substring(start, end);
    } 
    
    // IE before version 9
    else if (typeof document.selection != "undefined" &&
            (sel = document.selection).type != "Control") 
    {
        range = sel.createRange();
        wholeRange = document.body.createTextRange();
        wholeRange.moveToElementText(nCell);
        priorRange = document.body.createTextRange();
        priorRange.moveToElementText(nCell);
        priorRange.setEndPoint("EndToStart", range);
        start = priorRange.text.regexLastIndexOf(/\s|\.|,|;|:|\(|\[/)+1;
        end   = wholeRange.text.regexIndexOf(/(\s|\?|!|\.|,|;|:|\)|\])/, start+1);
        if (end<0) end = wholeRange.toString().length;
        fulltext = wholeRange.text;
        text  = fulltext.substring(start, end);
    }
    
    // Compute the true indexes of the text selection
    // This is needed because detection of positions doesn't take into account the tags and 
    //  html entities names within the original string. We will need to remove highlighting
    //  in advance, because highlighting tags are no part of the original string
    var oTrueIndexes = getTrueIndexes(
    		fulltext,
    		fn.removeHighlight( fn.getDataFromCellNode(nCell) ), 
    		$.trim(text), start, 
    		true); // extra parameter: push word boundaries (see explanation at util.getTrueIndexes)
    
    // return an object with 4 parts: selection start/end indexes, selection text, and reliability
    return {
        start: oTrueIndexes.start,
        end: oTrueIndexes.end,
        text: $.trim(text),
        reliable: fn._selectionIsReliable(nCell, oTrueIndexes.start, oTrueIndexes.end, $.trim(text))
    };
};



// subroutine of fn.getWordClickedUponInNode() and fn.getSelectedTextInNode()
// adapted from: http://help.dottoro.com/ljxgoxcb.php
fn._selectionIsReliable = function(nCell, iStart, iEnd, sText){
	
    var nCurrentNode = nCell;

    // all browsers, except IE before version 9
    if (document.createRange) {
    	
    	// select the contents of the node as a range
        var nodeRange = document.createRange(); 
        nodeRange.selectNodeContents (nCurrentNode);

        var selection = window.getSelection();
        if (selection.rangeCount > 0) {
            var selRange = selection.getRangeAt (0);
            
            var startPoints = selRange.compareBoundaryPoints (Range.START_TO_START, nodeRange);
            var endPoints = selRange.compareBoundaryPoints (Range.END_TO_END, nodeRange);

            if (startPoints < 0) {
                if (endPoints < 0) {
                    // The selection is before the bold text but intersects it
                	return false;
                }
                else {
                    // The selection contains the node
                	return false;
                }
            }
            else {
                if (endPoints > 0) {
                    // The selection is after the node but intersects it
                	return false;
                }
                else {
                    if (startPoints == 0 && endPoints == 0) {
                        // The selected element and the node are the same
                    	return true;
                    }
                    else {
                    	// The selection is inside the node
                    	return true;
                    }
                }
            }
            
        }
        else {
            // no content selected
        	return true;
        }
    }
    else {
        // browser doesn't support the check hereabove,
    	// so we have to do a "stupid" check:
    	
    	// 1. If start- and endindexes are both 0, the selection is not reliable (wrong selection)
        // 2. If the selection contains more than a given number of words, 
    	//    it may be a selection across more cells, so it is not reliable
    	return !( (iStart==0 && iEnd==0) || ( $.trim(sText).split(" ").length>10 ));
    }
	
};





// *****************************************************************
// *     PUT DATA INTO A CELL OR ROW                               * 
// *     (without database update)                                 *
// *****************************************************************


/**
 * Put some content into a cell, given a row node and a column name.
 * 
 * @param {Node} nRow - A row node
 * @param {String} sColumnName - Name of a column 
 * @param {String} Content to put into the cell
 */
fn.putDataIntoCellNode = function(nRow, sColumnName, sContent){
	
	fn._checkApiInstance("fn.putDataIntoCellNode", nRow);
	fn._checkjQueryObject("fn.putDataIntoCellNode", nRow);
	
	var sTable = fn.getTableName(nRow);
	var oTable = mt.getDataTableObjectOf(sTable);
	
	if ( fn.isCellNode(nRow) )
		{
		fn.message("Fout", 
				"Let op: fn.putDataIntoCellNode("+sTable+") " +
				"is aangeroepen met een cell node, " +
				"terwijl de functie een row node vereist.");
		return;
		}
	
	var sNodeId = fn.getRowNodeId(nRow);
	
	if (typeof sNodeId == 'undefined' || $.trim(sNodeId) == '')
		{
		fn.message("Fout",
				"Fout bij aanroep van fn.putDataIntoCellNode("+sTable+"). "+
				"Tabel '"+sTable+"' heeft geen IDs. " +
				"Rijen aanwijzen zonder IDs is onmogelijk. " +
				"[Het antwoord van de server bevat waarschijnlijk geen waarde voor DT_RowId " +
				"omdat de tabel geen primary key noch pkid-veld heeft; " +
				"LET erop dat multicolumns primary keys niet ondersteund worden]");
		return;
		}
	
	// put content into right cell, given column name
	// since we update the screen cells, we use the 'visible' column index here
	
	
	// PUT DATA INTO THE RIGHT CELL
	
	var colNr = $.inArray(sColumnName, mt.getListOfColumnsOf(sTable));	
	oTable.cell( nRow, colNr ).data( sContent );
	
};


// ************************************************************
// *       UPDATE THE DATABASE GIVEN A ROW/CELL               *
// ************************************************************

/**
 * Update a 'visible' database table (that is loaded into the GUI),
 * given a row/cell node, and an associative array of fields and values to update the corresponding row with.
 * 
 * @param {Node} nMixed - A cell/row node
 * @param {Array} aColumnNamesAndValues - An associative array of fields and values to update in the row 
 * @param {Function} fnCallback - Function called after the update
 * @param {Function} [fnErrorHandler=null] - Some function to call when an error occurs
 */
fn.updateDatabaseGivenANode = function(nMixed, aColumnNamesAndValues, fnCallback, fnErrorHandler){
	
	fn._checkApiInstance("fn.updateDatabaseGivenANode", nMixed);
	fn._checkjQueryObject("fn.updateDatabaseGivenANode", nMixed);
	
	var sTable = fn.getTableName(nMixed);
	var oTable = mt.getDataTableObjectOf(sTable);
		
	var sNodeId = fn.getRowNodeId(nMixed);	
	if (typeof sNodeId == 'undefined' || $.trim(sNodeId) == '')
		{
		fn.message("Fout",
				"Fout bij aanroep van fn.updateDatabaseGivenANode("+sTable+"). "+
				"Tabel '"+sTable+"' heeft geen IDs. Rijen aanwijzen zonder IDs is onmogelijk. " +
				"[Het antwoord van de server bevat waarschijnlijk geen waarde voor DT_RowId " +
				"omdat de tabel geen primary key noch pkid-veld heeft; " +
				"LET erop dat multicolumns primary keys niet ondersteund worden]");
		return;
		}
	
	
	// convert associative array into separate arrays of column names and values
	var aColumnNames = new Array();
	var aColumnValues = new Array();
	
	for (var sFieldName in aColumnNamesAndValues)
		{
		aColumnNames.push(sFieldName);
		aColumnValues.push(aColumnNamesAndValues[sFieldName]);
		}
	
	
	// update the database
	var url = WEBSERV_URL+"/table/setvalue"; 
	
	// make sure we send no null values, as join can't deal with it
	aColumnValues = convertNullToString(aColumnValues);
	
	$.ajax( {
		"type": "GET",
		"url": url,
		"data": {
			"db_name": getHttpParams().get("db"),
			"row_id": fn.getRowNodeId(nMixed),
			"table_name": sTable,
			"column_name": aColumnNames.join(ARG_INTERNAL_SEPARATOR),
			"new_value": aColumnValues.join(ARG_INTERNAL_SEPARATOR), 
			"dummy": getUniqueNumber()
			},
	 	"dataType": "xml", // get response as xml
	 	"success": function(xml) {
	 		if (fnCallback!=null)
	 			fnCallback();
	 		},
		"error": function(jqXHR, textStatus, errorThrown){
			fn.refreshTable(sTable);
			
			if (fnErrorHandler!=null)
				fnErrorHandler({
					"jqXHR": jqXHR, "textStatus": textStatus, "errorThrown": errorThrown,
					"lexit_function": "fn.updateDatabaseGivenANode",
					"nMixed": nMixed, "aColumnNamesAndValues": aColumnNamesAndValues
					});
			else
				fn.message("Fout", 
				"Fout bij aanroep van fn.updateDatabaseGivenANode("+sTable+"): "+
				textStatus+" "+errorThrown+"; "+getJqXHRInfo(jqXHR));
			}
		} );		

};


// ***********************************************************************************
// *     UPDATE THE DATABASE GIVEN SOME FIELD VALUES (instead of row id = pk id)     *
// ***********************************************************************************

/**
 * Update a table which is not loaded into the GUI, so it is "hidden",
 * given an array of columns names and values to match
 * and an array of columns names and values to update
 * 
 * @param {(String|API-object-instance)} sSomeTablename - A table name or object
 * @param {Array} aFieldsAndValuesToMatch - An associative array of fields and values to match
 * @param {Array} aFieldsAndValuesToUpdate - An associative array of fields and values to assign 
 * @param {Function} fnCallback - Function called after the update
 * @param {Function} [fnErrorHandler=null] - Some function to call when an error occurs
 */
fn.updateDatabaseGivenFieldValues = function(sSomeTablename, aFieldsAndValuesToMatch, 
		aFieldsAndValuesToUpdate, fnCallback, fnErrorHandler){
	
	if (typeof sSomeTablename == 'object')
		sSomeTablename = fn.getTableName(sSomeTablename);
	
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
	var url = WEBSERV_URL+"/table/setvalue_without_id"; 
	
	// make sure we send no null values, as join can't deal with it
	aValuesToMatch = convertNullToString(aValuesToMatch);
	aValuesToUpdate = convertNullToString(aValuesToUpdate);
	
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
	 		if (fnCallback!=null)
	 			fnCallback();
	 		},
	 	"error": function(jqXHR, textStatus, errorThrown){
			// if table is loaded, we update it on the screen
	 		if ( mt.tableExists(sSomeTablename))
	 			fn.refreshTable(sSomeTablename);
	 		
	 		if (fnErrorHandler!=null)
				fnErrorHandler({
					"jqXHR": jqXHR, "textStatus": textStatus, "errorThrown": errorThrown, 
					"lexit_function": "fn.updateDatabaseGivenFieldValues",
					"sSomeTablename": sSomeTablename, "aFieldsAndValuesToMatch": aFieldsAndValuesToMatch, "aFieldsAndValuesToUpdate": aFieldsAndValuesToUpdate
					});
			else
				fn.message("Fout", 
	 			"Fout bij aanroep van fn.updateDatabaseGivenFieldValues("+sSomeTablename+"): "+
				textStatus+" "+errorThrown+"; "+getJqXHRInfo(jqXHR));
			}
		} );
};


// *****************************************************************
// *     INSERT DATA INTO THE DATABASE                             *
// *****************************************************************


/**
 * Insert a record into a table
 * given an array of columns names and values to add
 * and get the id of the inserted record
 * 
 * @param {(String|API-object-instance)} sSomeTablename - A table name or object
 * @param {Array} aFieldsAndValuesToAdd - An associative array of fields and values to insert
 * @param {String} returnField - Field from which the value should be returned after insertion (eg. an ID, otherwise NULL)
 * @param {Function} [fnCallback=null] - Function called after the update
 * @param {Function} [fnErrorHandler=null] - Some function to call when an error occurs
 */
fn.insertIntoDatabase = function(sSomeTablename, aFieldsAndValuesToAdd, returnField, fnCallback, fnErrorHandler){
	
	if (typeof sSomeTablename == 'object')
		sSomeTablename = fn.getTableName(sSomeTablename);
	
	var aColNamesToAdd = new Array();
	var aValuesToAdd = new Array();	
	
	for (var sFieldName in aFieldsAndValuesToAdd)
		{
		aColNamesToAdd.push(sFieldName);
		aValuesToAdd.push(aFieldsAndValuesToAdd[sFieldName]);
		}
	
	// insert record into the database
	var url = WEBSERV_URL+"/table/insertvalue"; 
	
	// make sure we send no null values, as join can't deal with it
	aValuesToAdd = convertNullToString(aValuesToAdd);
	
	$.ajax( {
		"type": "GET",
		"async": false,
		"url": url,
		"data": {
			"db_name": getHttpParams().get("db"),
			"table_name": sSomeTablename,
			"column_name": aColNamesToAdd.join(ARG_INTERNAL_SEPARATOR),
			"value": aValuesToAdd.join(ARG_INTERNAL_SEPARATOR),
			"returning": returnField,
			"dummy": getUniqueNumber()
			},
	 	"dataType": "xml", // get response as xml
	 	"success": function(xml) {
	 		var resp = fn.getDbResponse(xml);
	 		
	 		if (fnCallback!=null)
	 			fnCallback(resp);
	 		},
	 	"error": function(jqXHR, textStatus, errorThrown){
			// if table is loaded, we update it on the screen
	 		if ( mt.tableExists(sSomeTablename))
	 			fn.refreshTable(sSomeTablename);
	 		
	 		if (fnErrorHandler!=null)
				fnErrorHandler({
					"jqXHR": jqXHR, "textStatus": textStatus, "errorThrown": errorThrown,
					"lexit_function": "fn.insertIntoDatabase",
					"sSomeTablename": sSomeTablename, "aFieldsAndValuesToAdd": aFieldsAndValuesToAdd, "returnField": returnField
					});
			else
				fn.message("Fout", 
	 			"Fout bij aanroep van fn.insertIntoDatabase("+sSomeTablename+"): "+
				textStatus+" "+errorThrown+"; "+getJqXHRInfo(jqXHR));
			}
		} );
};



/**
 * Duplicate a record in a table
 * given its id (or a value for some serial record acting as PK).
 * and, if needed, a list of columns to skip (t.i.: their values won't be duplicated).
 * Eventually get the id of the new duplicate record.
 * 
 * @param {(String|API-object-instance)} sSomeTablename - A table name or object
 * @param {String[]} [aListOfColumnsToSkip=null] - A list of columns to be skipped
 * @param {String} [pk_substitute=null] - field that acts as a primary key, in case the table lacks one; otherwise NULL
 * @param {String} pk_value - value the primary key (or pk_substitute) must have
 * @param {Function} [fnCallback=null] - Function called after the update
 * @param {Function} [fnErrorHandler=null] - Some function to call when an error occurs
 */
fn.duplicateRecord = function(sSomeTablename, aListOfColumnsToSkip, pkSubstitute, pkValue, fnCallback, fnErrorHandler){
	
	if (typeof sSomeTablename == 'object')
		sSomeTablename = fn.getTableName(sSomeTablename);
	
	// duplicate record in the database
	var url = WEBSERV_URL+"/table/duplicaterecord"; 
	
	$.ajax( {
		"type": "GET",
		"async": false,
		"url": url,
		"data": {
			"db_name": getHttpParams().get("db"),
			"table_name": sSomeTablename,
			"columns_to_skip": ( aListOfColumnsToSkip == null ? aListOfColumnsToSkip : aListOfColumnsToSkip.join(ARG_INTERNAL_SEPARATOR) ),
			"pk_substitute": ( pkSubstitute != null ? pkSubstitute : 'null' ),
			"pk_value": pkValue,
			"dummy": getUniqueNumber()
			},
	 	"dataType": "xml", // get response as xml
	 	"success": function(xml) {
	 		var resp = fn.getDbResponse(xml);
	 		
	 		if (fnCallback!=null)
	 			fnCallback(resp);
	 		},
	 	"error": function(jqXHR, textStatus, errorThrown){
			// if table is loaded, we update it on the screen
	 		if ( mt.tableExists(sSomeTablename))
	 			fn.refreshTable(sSomeTablename);
	 		
	 		if (fnErrorHandler!=null)
				fnErrorHandler({
					"jqXHR": jqXHR, "textStatus": textStatus, "errorThrown": errorThrown,
					"lexit_function": "fn.duplicateRecord",
					"sSomeTablename": sSomeTablename, "aListOfColumnsToSkip": aListOfColumnsToSkip, "pkSubstitute": pkSubstitute, "pkValue": pkValue
					});
			else
				fn.message("Fout", 
	 			"Fout bij aanroep van fn.duplicateRecord("+sSomeTablename+"): "+
				textStatus+" "+errorThrown+"; "+getJqXHRInfo(jqXHR));
			}
		} );
};


// *****************************************************************
// *      GET ID FROM A RECORD IN THE DATABASE                     *
// *****************************************************************


/**
 * Get the id of a record, given a table and some fields and values to match
 * 
 * @param {(String|API-object-instance)} sSomeTablename - A table name or object
 * @param {Array} aFieldsAndValues - An associative array of fields and values to match
 * @param {Function} fnCallback - Function called after the update
 * @param {Function} [fnErrorHandler=null] - Some function to call when an error occurs
 */
fn.getIdFromDatabase = function(sSomeTablename, aFieldsAndValues, fnCallback, fnErrorHandler){
	
	if (typeof sSomeTablename == 'object')
		sSomeTablename = fn.getTableName(sSomeTablename);
	
	var aColNamesToMatch = new Array();
	var aValuesToMatch = new Array();	
	
	for (var sFieldName in aFieldsAndValues)
		{
		aColNamesToMatch.push(sFieldName);
		aValuesToMatch.push(aFieldsAndValues[sFieldName]);
		}
	
	// insert record into the database
	var url = WEBSERV_URL+"/table/get_id_of_record"; 
	
	// make sure we send no null values, as join can't deal with it
	aValuesToMatch = convertNullToString(aValuesToMatch);
	
	$.ajax( {
		"type": "GET",
		"async": false, // needed to block code execution while awaiting the server response
		"url": url,
		"data": {
			"db_name": getHttpParams().get("db"),
			"table_name": sSomeTablename,
			"column_name": aColNamesToMatch.join(ARG_INTERNAL_SEPARATOR),
			"value": aValuesToMatch.join(ARG_INTERNAL_SEPARATOR),
			"dummy": getUniqueNumber()
			},
	 	"dataType": "xml", // get response as xml
	 	"success": function(xml) {
	 		// use the returned id in the callback 
	 		var resp = fn.getDbResponse(xml);
	 		if (fnCallback!=null)
	 			fnCallback(resp);
	 		
	 		},
	 	"error": function(jqXHR, textStatus, errorThrown){
	 		
	 		if (fnErrorHandler!=null)
				fnErrorHandler({
					"jqXHR": jqXHR, "textStatus": textStatus, "errorThrown": errorThrown,
					"lexit_function": "fn.getIdFromDatabase",
					"sSomeTablename": sSomeTablename, "aFieldsAndValues": aFieldsAndValues
					});
			else
				fn.message("Fout", 
	 				"Fout bij aanroep van fn.getIdFromDatabase("+sSomeTablename+"): "+
				textStatus+" "+errorThrown+"; "+getJqXHRInfo(jqXHR));
			}
		} );
};


// *****************************************************************
// *     REMOVE DATA FROM THE DATABASE                             *
// *****************************************************************


/**
 * Remove a record from the database given a row id
 * 
 * @param {Node} nRow - A row node
 * @param {Function} fnCallback - Function called after the operation
 * @param {Function} [fnErrorHandler=null] - Some function to call when an error occurs
 */
fn.removeFromDatabaseGivenANode = function(nRow, fnCallback, fnErrorHandler){
	
	fn._checkApiInstance("fn.removeFromDatabaseGivenANode", nRow);
	fn._checkjQueryObject("fn.removeFromDatabaseGivenANode", nRow);
	
	var sTable = fn.getTableName(nRow);
	var oTable = mt.getDataTableObjectOf(sTable);
	
	var sNodeId = fn.getRowNodeId(nRow);	
	if (typeof sNodeId == 'undefined' || $.trim(sNodeId) == '')
		{
		fn.message("Fout",
				"Fout bij aanroep van fn.removeFromDatabaseGivenANode("+sTable+"). "+
				"Tabel '"+sTable+"' heeft geen IDs. Rijen aanwijzen zonder IDs is onmogelijk. " +
				"[Het antwoord van de server bevat waarschijnlijk geen waarde voor DT_RowId " +
				"omdat de tabel geen primary key noch pkid-veld heeft; " +
				"LET erop dat multicolumns primary keys niet ondersteund worden]");
		return;
		}
	
	
	// update the database
	var url = WEBSERV_URL+"/table/delete_row"; 
	$.ajax( {
		"type": "GET",
		"url": url,
		"data": {
			"row_id": sNodeId,
			"db_name": getHttpParams().get("db"),
			"table_name": sTable,
			"dummy": getUniqueNumber()
			},
	 	"dataType": "xml", // get response as xml
	 	"success": function(xml) {
	 		if (fnCallback!=null)
	 			fnCallback();
	 		},
	 	"error": function(jqXHR, textStatus, errorThrown){
			// if table is loaded, we update it on the screen
	 		if ( mt.tableExists(sTable))
	 			fn.refreshTable(sTable);
	 		
	 		if (fnErrorHandler!=null)
				fnErrorHandler({
					"jqXHR": jqXHR, "textStatus": textStatus, "errorThrown": errorThrown,
					"lexit_function": "fn.removeFromDatabaseGivenANode",
					"nRow": nRow
					});
			else
				fn.message("Fout", 
	 			"Fout bij aanroep van fn.removeFromDatabaseGivenANode("+sTable+"): "+
				textStatus+" "+errorThrown+"; "+getJqXHRInfo(jqXHR));
			}
		} );
	
	
};


/**
 * Remove some records from the database
 * given an array of column names and values to match
 * 
 * @param {(String|API-object-instance)} sSomeTablename - A table name or object
 * @param {Array} aFieldsAndValuesToMatch - An associative array of fields and values to match
 * @param {Function} [fnCallback=null] - Function called after the operation
 * @param {Function} [fnErrorHandler=null] - Some function to call when an error occurs
 */
fn.removeFromDatabaseGivenFieldValues = function(sSomeTablename, aFieldsAndValuesToMatch, fnCallback, fnErrorHandler){
	
	if (typeof sSomeTablename == 'object')
		sSomeTablename = fn.getTableName(sSomeTablename);
	
	var aColNamesToMatch = new Array();
	var aValuesToMatch = new Array();	
	
	for (var sFieldName in aFieldsAndValuesToMatch)
		{
		aColNamesToMatch.push(sFieldName);
		aValuesToMatch.push(aFieldsAndValuesToMatch[sFieldName]);
		}
	
	// delete record from the database
	var url = WEBSERV_URL+"/table/delete_row_without_id";
	
	// make sure we send no null values, as join can't deal with it
	aValuesToMatch = convertNullToString(aValuesToMatch);
 
	$.ajax( {
		"type": "GET",
		"url": url,
		"data": {
			"db_name": getHttpParams().get("db"),
			"table_name": sSomeTablename,
			"column_name": aColNamesToMatch.join(ARG_INTERNAL_SEPARATOR),
			"value": aValuesToMatch.join(ARG_INTERNAL_SEPARATOR), 
			"dummy": getUniqueNumber()
			},
	 	"dataType": "xml", // get response as xml
	 	"success": function(xml) {
	 		if (fnCallback!=null)
	 			fnCallback();
	 		},
	 	"error": function(jqXHR, textStatus, errorThrown){
			// if table is loaded, we update it on the screen
	 		if ( mt.tableExists(sSomeTablename))
	 			fn.refreshTable(sSomeTablename);
	 		
	 		if (fnErrorHandler!=null)
				fnErrorHandler({
					"jqXHR": jqXHR, "textStatus": textStatus, "errorThrown": errorThrown,
					"lexit_function": "fn.removeFromDatabaseGivenFieldValues",
					"sSomeTablename": sSomeTablename, "aFieldsAndValuesToMatch": aFieldsAndValuesToMatch
					});
			else
				fn.message("Fout",
	 			"Fout bij aanroep van fn.removeFromDatabaseGivenFieldValues("+sSomeTablename+"): "+
				textStatus+" "+errorThrown+"; "+getJqXHRInfo(jqXHR));
			}
		} );
};



//*************************************************
//*  READ A SINGLE RECORD FROM THE DATABASE       *
//*  and load it into the datatables interface    *
//*************************************************

/**
* Call a record
* This does a job similar to fn.callDatabase(), but limited to a single record
* which will be updated in the current table view
* 
* @param {Node} nRow - A row node
* @param {String[]} [aColumnsToUpdate={all columns}] - An array of columns to reload
* @param {Function} [fnCallback=null] - Function called after the operation
* @param {Function} [fnErrorHandler=null] - Some function to call when an error occurs
* 
* @see fn.callDatabase
* @see fn.getRecord
* @see fn.getRecords
* @see fn.getRecordGivenFieldValues
*/
fn.callRecord = function(nRow, aColumnsToUpdate, fnCallback, fnErrorHandler){
	
	fn._checkApiInstance("fn.callRecord", nRow);
	fn._checkjQueryObject("fn.callRecord", nRow);
	
	
	var sTable = fn.getTableName(nRow);
	
	if ( fn.isCellNode(nRow))
		{
		fn.message("Fout", 
				"Let op: fn.callRecord("+sTable+") " +
				"is aangeroepen met een cell node, " +
				"terwijl de functie een row node vereist.");
		return;
		}	
	
	// we need to extract the record id from the row node
	var sRecordId = fn.getRowNodeId(nRow);
	
	// if that failed, give a error
	if ( $.isNullOrUndefined(sRecordId) || sRecordId == '' )
		{
		fn.message("Fout", 
				"Let op: fn.callRecord("+sTable+") " +
				"verreist een record id.");
		return;
		}
	
	
	var url = WEBSERV_URL+"/table/get_record";
	
	$.ajax( {
		"type": "GET",
		"url": url,
		"data": {
			"db_name": getHttpParams().get("db"),
			"table_name": sTable,
			"id": sRecordId,
			"dummy": getUniqueNumber() 
			},
	 	"dataType": "xml", // get response as xml
	 	"success": function(xml) {
	 		// if table is loaded, we update it on the screen
	 		if ( mt.tableExists(sTable))
	 			fn._callRecord(nRow, aColumnsToUpdate, xml, fnCallback);
	 		},
	 	"error": function(jqXHR, textStatus, errorThrown){
			// if table is loaded, we update it on the screen
	 		if ( mt.tableExists(sTable))
	 			fn.refreshTable(sTable);
	 		
	 		if (fnErrorHandler!=null)
				fnErrorHandler({
					"jqXHR": jqXHR, "textStatus": textStatus, "errorThrown": errorThrown,
					"lexit_function": "fn.callRecord",
					"nRow": nRow, "aColumnsToUpdate": aColumnsToUpdate
					});
			else
				fn.message("Fout",
	 			"Fout bij aanroep van fn.callRecord("+sTable+"): "+
				textStatus+" "+errorThrown+"; "+getJqXHRInfo(jqXHR));
			}
		} );
	
};

//this is a subroutine of fn.callRecord
//read the response from the database, and put the record value into the table on the screen
fn._callRecord = function(nRow, aColumnsToUpdate, xml, fnCallback){
	
	var sTable = 		fn.getTableName(nRow);	
	var oTableConfig =	conf.getTableConfig(sTable);
	
	$(xml).find("oneColumn").each(function(){
		
		var columnItems = 	$(this).find("item");
		var columnName = 	columnItems.eq(0).text();
		var columnValue = 	columnItems.eq(1).text();
		var oColumnConfig =	conf.getColumnConfig(oTableConfig, columnName);
		
		// should the current column be updated?
		var bUpdateCurrentColumn = 
			(aColumnsToUpdate == null || (aColumnsToUpdate != null && $.inArray(columnName, aColumnsToUpdate)>-1));
		if ( !bUpdateCurrentColumn )
			return; // continue
		
		// we don't do anything with button columns, since that contain only a button that must keep untouched
		var buttonSetting = conf.getButtonSetting(oColumnConfig);		
		if (buttonSetting != null) 
			return; // continue
		
		// update each cell 
		fn.putDataIntoCellNode( nRow, columnName, columnValue );
		
	});	
	
	// if some callback function is given, call it now
	if (fnCallback!=null) 
		fnCallback();
	
};



// *************************************************
// *  READ A SINGLE RECORD FROM THE DATABASE       *
// *  and return it in an array                    *
// *************************************************

/**
 * Get a record from the database, given its id.
 * The record can be retrieved by calling the callback with 'record' as a function argument.
 * The value of each cell can be read with record[column_name].
 * 
 * 
 * @param {(String|API-object-instance)} sSomeTablename - A table name or object
 * @param {String} sRecordId - A row id
 * @param {Function} fnCallback - Function called after the operation
 * @param {Function} [fnErrorHandler=null] - Some function to call when an error occurs
 * 
 * @see fn.getRecords
 * @see fn.getRecordGivenFieldValues
 * @see fn.callDatabase
 * @see fn.callRecord
 */
fn.getRecord = function(sSomeTablename, sRecordId, fnCallback, fnErrorHandler){
	
	if (typeof sSomeTablename == 'object')
		sSomeTablename = fn.getTableName(sSomeTablename);
	
	var url = WEBSERV_URL+"/table/get_record";
	
	$.ajax( {
		"type": "GET",
		"url": url,
		"async": false, // needed to block code execution while awaiting the server response
		"data": {
			"db_name": getHttpParams().get("db"),
			"table_name": sSomeTablename,
			"id": sRecordId,
			"dummy": getUniqueNumber() 
			},
	 	"dataType": "xml", // get response as xml
	 	"success": function(xml) {	 		
	 		var recordOutput = fn._getRecordFromXmlResponse(xml);
	 		if (fnCallback != null)
	 			fnCallback(recordOutput);
	 		},
	 	"error": function(jqXHR, textStatus, errorThrown){
	 		
	 		if (fnErrorHandler!=null)
				fnErrorHandler({
					"jqXHR": jqXHR, "textStatus": textStatus, "errorThrown": errorThrown, 
					"lexit_function": "fn.getRecord",
					"sSomeTablename": sSomeTablename, "sRecordId": sRecordId
					});
			else
				fn.message("Fout", 
	 			"Fout bij aanroep van fn.getRecord("+sSomeTablename+"): "+
				textStatus+" "+errorThrown+"; "+getJqXHRInfo(jqXHR));
			}
		} );
	
};

/**
 * Get some records from the database, given their ids.
 * The records can be retrieved by calling the callback with 'record' as a function argument.
 * The value of each cell can then be read with record[id][column_name].
 * 
 * @param {(String|API-object-instance)} sSomeTablename - A table name or object
 * @param {String[]} aRecordIds - row ids
 * @param {Function} fnCallback - Function called after the operation
 * @param {Function} [fnErrorHandler=null] - Some function to call when an error occurs
 * 
 * @see fn.getRecord
 * @see fn.getRecordGivenFieldValues
 * @see fn.callDatabase
 * @see fn.callRecord
 */
fn.getRecords = function(sSomeTablename, aRecordIds, fnCallback, fnErrorHandler){
	
	if (typeof sSomeTablename == 'object')
		sSomeTablename = fn.getTableName(sSomeTablename);
	
	var sRecords = aRecordIds.join(ARG_INTERNAL_SEPARATOR);
	
	var url = WEBSERV_URL+"/table/get_records";
	
	$.ajax( {
		"type": "GET",
		"url": url,
		"async": false, // needed to block code execution while awaiting the server response
		"data": {
			"db_name": getHttpParams().get("db"),
			"table_name": sSomeTablename,
			"ids": sRecords,
			"dummy": getUniqueNumber() 
			},
	 	"dataType": "xml", // get response as xml
	 	"success": function(xml) {	 		
	 		var recordsOutput = fn._getRecordsFromXmlResponse(xml);
	 		if (fnCallback != null)
	 			fnCallback(recordsOutput);
	 		},
	 	"error": function(jqXHR, textStatus, errorThrown){
	 		
	 		if (fnErrorHandler!=null)
				fnErrorHandler({
					"jqXHR": jqXHR, "textStatus": textStatus, "errorThrown": errorThrown,
					"lexit_function": "fn.getRecords",
					"sSomeTablename": sSomeTablename, "aRecordIds": aRecordIds
					});
			else
				fn.message("Fout", 
	 			"Fout bij aanroep van fn.getRecords("+sSomeTablename+"): "+
				textStatus+" "+errorThrown+"; "+getJqXHRInfo(jqXHR));
			}
		} );
	
};



/**
 * Get a record from the database, given some values to match (in an associative array {colname1:value1, ...}).
 * The record can be retrieved by calling the callback with 'record' as a function argument.
 * The value of each cell can be read with record[column_name].
 * 
 * @param {(String|API-object-instance)} sSomeTablename - A table name or object
 * @param {Array} aFieldsAndValuesToMatch - An associative array of fields and values to match
 * @param {Function} fnCallback - Function called after the operation
 * @param {Function} [fnErrorHandler=null] - Some function to call when an error occurs
 * 
 * @see fn.getRecord
 * @see fn.getRecords
 * @see fn.callRecord
 * @see fn.callDatabase
 */
fn.getRecordGivenFieldValues = function(sSomeTablename, aFieldsAndValuesToMatch, fnCallback, fnErrorHandler){
	
	if (typeof sSomeTablename == 'object')
		sSomeTablename = fn.getTableName(sSomeTablename);
	
	var aColNamesToMatch = new Array();
	var aValuesToMatch = new Array();
	
	for (var sFieldName in aFieldsAndValuesToMatch)
		{
		aColNamesToMatch.push(sFieldName);
		aValuesToMatch.push(aFieldsAndValuesToMatch[sFieldName]);
		}
	
	var url = WEBSERV_URL+"/table/get_record_without_id";
	
	// make sure we send no null values, as join can't deal with it
	aValuesToMatch = convertNullToString(aValuesToMatch);
	
	$.ajax( {
		"type": "GET",
		"url": url,
		"async": false, // needed to block code execution while awaiting the server response
		"data": {
			"db_name": getHttpParams().get("db"),
			"table_name": sSomeTablename,
			"column_name_to_match": aColNamesToMatch.join(ARG_INTERNAL_SEPARATOR),
			"value_to_match": aValuesToMatch.join(ARG_INTERNAL_SEPARATOR),
			"dummy": getUniqueNumber() 
			},
	 	"dataType": "xml", // get response as xml
	 	"success": function(xml) {	 		
	 		var recordOutput = fn._getRecordFromXmlResponse(xml);
	 		if (fnCallback != null)
	 			fnCallback(recordOutput);
	 		},
	 	"error": function(jqXHR, textStatus, errorThrown){
	 		
	 		if (fnErrorHandler!=null)
				fnErrorHandler({
					"jqXHR": jqXHR, "textStatus": textStatus, "errorThrown": errorThrown, 
					"lexit_function": "fn.getRecordGivenFieldValues",
					"sSomeTablename": sSomeTablename, "aFieldsAndValuesToMatch": aFieldsAndValuesToMatch
					});
			else
				fn.message("Fout", 
	 			"Fout bij aanroep van fn.getRecord("+sSomeTablename+"): "+
				textStatus+" "+errorThrown+"; "+getJqXHRInfo(jqXHR));
			}
		} );
	
};



// this are subroutines of fn.getRecord, fn.getRecords, fn.getRecordGivenFieldValues and fn.callFunction
// read the response from the database, and put the record value into an associative array
fn._getRecordFromXmlResponse = function(xml){
	
	var record = new Array();
	
	$(xml).find("oneColumn").each(function(){
		
		var columnItems = $(this).find("item");
		var columnName = columnItems.eq(0).text();
		var columnValue = columnItems.eq(1).text();
		
		record[columnName] = columnValue;
	});	
	
	return record;
	
};

fn._getRecordsFromXmlResponse = function(xml){
	
	var records = {};
	
	$(xml).find("oneColumn").each(function(){
		
		var columnItems = $(this).find("item");
		var columnId = columnItems.eq(0).text();
		var columnName = columnItems.eq(1).text();
		var columnValue = columnItems.eq(2).text();
		
		if (records[columnId] == undefined)
			records[columnId] = {};
		
		records[columnId][columnName] = columnValue;
		
	});	
	
	return records;
	
};


// ******************************************************************
// *  CALL A FUNCTION FROM THE DATABASE THAT RETURNS A RECORD       *
// *  and update some record cells with it                          *
// ******************************************************************

// needed to store function output
var functionCallOuput = new Array();

/**
 * Retrieve the function output after a function was called
 * (this method will normally be used in the callback of the function call)
 * 
 * @see fn.callFunction
 */
fn.getFunctionOutput = function(){
	return functionCallOuput;
};


/**
 * Call a function
 * [ function output can be read with function fn.getFunctionOutput() ]
 * 
 * @param {String} sFunctionName - A function name
 * @param {Array} aFunctionArguments - An array with the function args
 * @param {Function} fnCallback - Function called after the operation
 * @param {Function} [fnErrorHandler=null] - Some function to call when an error occurs
 * 
 * @see fn.getFunctionOutput
 */
fn.callFunction = function(sFunctionName, aFunctionArguments, fnCallback, fnErrorHandler){	
	
	var url = WEBSERV_URL+"/table/call_function";
	
	if (aFunctionArguments == null)
		aFunctionArguments = [];
	
	// make sure the function arguments contain no null value, as join can't deal with it		
	aFunctionArguments = convertNullToString(aFunctionArguments);		
	 
	$.ajax( {
		"type": "GET",
		"url": url,
		"async": false, // needed to block code execution while awaiting the server response
		"data": {
			"db_name": getHttpParams().get("db"),
			"function_name": sFunctionName,
			"args": aFunctionArguments.join(ARG_INTERNAL_SEPARATOR),
			"dummy": getUniqueNumber() 
			},
	 	"dataType": "xml", // get response as xml
	 	"success": function(xml) {
	 		
	 		// get function output from xml
 			var oFieldsAndValues = fn._getRecordFromXmlResponse(xml);
 			
 			// we use the function name as query result column name (as this is what Postgres does)
 			var sColumnNameToReadFrom = 
 				sFunctionName.indexOf(".")>-1 ?
 					// if function name contains schema name, remove schema part
 					sFunctionName.toLowerCase().substring(sFunctionName.indexOf(".")+1)
 					:
					sFunctionName.toLowerCase();

	 		
	 		// store the output for later retrieval
			// (for example for use within the callback)
	 		
	 		// [1] single return value
	 		// (in that case, the key is the function name)
	 		if (typeof oFieldsAndValues[ sColumnNameToReadFrom ] != 'undefined')
	 			{
	 			functionCallOuput = oFieldsAndValues[ sColumnNameToReadFrom ].split(ARG_INTERNAL_SEPARATOR);
	 			}
	 		
	 		// [2] more return values
	 		// (in that case, the keys are the returned columns names)
	 		else if (countProperties(oFieldsAndValues)>1)
	 			{
	 			functionCallOuput = new cloneObject(oFieldsAndValues);
	 			}
	 			 		
	 		// if some callback function is given, call it now		 		
	 		if (fnCallback!=null) 
	 			fnCallback( oFieldsAndValues );
	 		},
	 		
	 	"error": function(jqXHR, textStatus, errorThrown){
	 		
	 		if (fnErrorHandler!=null)
				fnErrorHandler({
					"jqXHR": jqXHR, "textStatus": textStatus, "errorThrown": errorThrown, 
					"lexit_function": "fn.callFunction",
					"sFunctionName": sFunctionName, "aFunctionArguments": aFunctionArguments
					});
			else
				fn.message("Fout", 
	 			"Fout bij aanroep van fn.callFunction(" + sFunctionName + "): "+
				textStatus+" "+errorThrown+"; "+getJqXHRInfo(jqXHR));			
			}
		} );
		

};









// ***************************************
// *           INTERACTION               *
// ***************************************

/**
 * Add an autocomplete functionality to a given filter box, or to a table cell
 * 
 * @param {(String|API-object-instance)} sSomeTablename - A table name or object
 * @param {String} sColumnName - Column name of the cell or filter box
 * @param {Boolean} bFilterBox - Set autocomplete onto the column filterbox (true), or onto the column cells (false)
 * @param {String} sFunctionName - Name of the database function which will provide the autocomplete suggestions (its output must be a string with separators, see sPrimarySeparator and sSecondarySeparator params)
 * @param {String} [sPrimarySeparator=|] - String separator between the suggestions returned by the database function (see sFunctionName param)
 * @param {String} [sSecondarySeparator=:::] - Separator between label and value strings, within a single suggestion (see sPrimarySeparator param)
 * @param {Integer} [iMinLength=2] - Input length (numer of characters) required for autocomplete activation (a value smaller than 2 is not recommended, since it may cause a heavy data load)
 * @param {Integer} [iDelay=750] - Delay (in milliseconds) between the very last keypress event and the autocomplete activation. Striking a key causes the stopwatch to be set back to zero, so the delay will be measured only after the very last keypress event. This allows the user to enter multiple characters before the search for autocomplete suggestions starts. A low value for iDelay is not recommended as it may cause the autocomplete to be less responsive because of the heavy data load.
 * 
 * @see fn.putDataIntoFilterBox
 */
fn.setAutoComplete = function(sSomeTablename, sColumnName, bFilterBox, sFunctionName, sPrimarySeparator, sSecondarySeparator, iMinLength, iDelay){
	
	var sSomeTablename = fx.getTableName(sSomeTablename);
	
	// set some defaults
	sPrimarySeparator = 	(sPrimarySeparator == null ? "|" : sPrimarySeparator);
	sSecondarySeparator =	(sSecondarySeparator == null ? ":::" : sSecondarySeparator);
	iDelay = 				(iDelay == null ? 750 : iDelay);
	iMinLength = 			(iMinLength == null ? 2 : iMinLength);
	
	// selector depends on bFilterBox param: is it a filter box or a cell we've to put the autocomplete onto?
	var sAutoCompleteSelector = bFilterBox ?
			"input#"+sSomeTablename+"_searchbox_"+sColumnName
			:
			"#"+sSomeTablename+" ."+sColumnName;
	
	// remove any focus event from selector
	// and append the autocomplete upon focus event
	
	$(document).off("focus", sAutoCompleteSelector);
	
	$(document).on(
		      "focus", 
		      sAutoCompleteSelector, 
		      function(event) {
		      	
		      	$(event.target).autocomplete({
		          	
		      		delay: iDelay,
		            minLength: iMinLength,
			        source: function(request, response){
			            	
			           	fn.callFunction(sFunctionName, [ fn.quote( request.term ) ], 
			          		function(func_resp){  
			            		
			           			var sOutputLabel = sFunctionName.indexOf(".")>-1 ?
			           					sFunctionName.substring(sFunctionName.indexOf(".")+1) : sFunctionName;
			            		var aSuggestionsArr = 
			            			(func_resp[sOutputLabel]).split(sPrimarySeparator);
			            		
			            		response($.map(aSuggestionsArr, function (item) {
			                        return {
			                            label: item.split(sSecondarySeparator)[0],
			                            value: item.split(sSecondarySeparator)[1]
			                        };
			                    }));
			            	});
			            }
		          });
		          
		      }
		  );
	
};

/**
 * Close any currently opened dialog programmatically.
 * 
 *  @see fn.message
 *  @see fn.confirm
 *  @see fn.prompt
 *  @see fn.promptReorder
 */
fn.closeDialog = function(){
	
	// find the dialogs, with regex catching all dialog ids
	// (see fn.message function etc about the way ids are defined)
	
	$("div[id^='dialog-message']").dialog( "close" );
};


/**
 * Make sure the buttons of a dialog 
 * can be triggered by the Enter key as well
 * @param dialog div ID
 */
fn._activeEnterForThisDialog = function(dialogDivId){
	
	// time is a way of preventing enter to be triggered by
	// another key event with enter occuring just before 
	// (like striking enter for validating something: if a dialog is to be shown right after that,
	// it should wait for enter to be pressed again)
	setTimeout(function(){
		
		$(document.body).keydown(function(e) {
			
			if (e.keyCode === $.ui.keyCode.ENTER && 
					$("#"+dialogDivId).elementExists())
				{		
				// two possibilities: 
				// click the button that has focus, 
				// but it none has focus, click the default accept button
				var buttonToClick = $( ".ui-button:focus");
				
				if (buttonToClick == null || buttonToClick.length == 0)
					buttonToClick = $( "#dialog_accept_button");
				
				buttonToClick.click();
				return false;
				}
		});
	}, 100);
}


/**
 * Show a message. This function is an equivalent of js native 'alert'
 * 
 * @param {String} sTitle - Title of the message window
 * @param {String} sMessage - Message to the user
 * @param {Function} [fnFunction=null] - Function called after the user clicked on 'OK'
 */
fn.message = function(sTitle, sMessage, fnFunction){
	
	var sP = $("<p></p>").html(sMessage);
	var dialogDivId = "dialog-message"+getUniqueNumber();
	var sDiv = $("<div></div>").attr("id",dialogDivId).attr("title", sTitle).append(sP);
	
	$(document.body).append(sDiv);
	
	$( "#"+dialogDivId ).dialog({
		modal: true,
		width: "auto",
		open: function(event, ui){
			$(".ui-dialog").addClass("ui-dialog-shadow");
        	$( this ).closest(".ui-dialog").putInFront();
		},
		close: function(event, ui){
			$( this ).remove();
		},
		position: fn._computeDialogPosition(),
		buttons: [
		          {			
		        	  text: "OK",
		        	  click: function() {
						$( this ).dialog( "close" );
						
						if (fnFunction != null)
							{
							fnFunction();
							}
		        	  },
		        	  id: 'dialog_accept_button'
		          }
		]
	});
	
	
	fn._activeEnterForThisDialog(dialogDivId);
	
};

/**
 * Show a dialog and ask the user to choose some action to perform (input is a list of action names and their corresponding functions attached). 
 * Since the action names to choose from are displayed horizontally, this function is only suitable for short lists
 * of actions (like 5 max), of course formulated in a concise way.
 * If one wants to be able to choose from a bigger list, consider using fn.promptSelect instead.
 * 
 * @param {String} sTitle - Title of the message window
 * @param {String} sMessage - Message to the user
 * @param {Array} oOptions - Associative array of options names (keys) and functions (values) to execute when a given option was clicked upon 
 * 
 * @see fn.promptSelect
 */
fn.askToChoose = function(sTitle, sMessage, oOptions){
	
	var sP = $("<p></p>").html(sMessage);
	var dialogDivId = "dialog-message"+getUniqueNumber();
	var sDiv = $("<div></div>").attr("id",dialogDivId).attr("title", sTitle).append(sP);
	
	$(document.body).append(sDiv);
	
	
	// Fill the buttons associative array of jQueri UI dialog.
	// We make a copy of the original oOptions param and enrich it with
	// some commands in such a way that clicking on an option will 
	// cause the dialog to be closed automatically, as required!
	
	var oButtons = {};
	
	// https://stackoverflow.com/questions/7113865/how-to-copy-clone-a-hash-object-in-jquery
	Object.keys(oOptions).forEach(function(key) {
		oButtons[ key ] = function(){
	
			// this will clause the dialog, as soon as an option was chosen
			$( "#"+dialogDivId ).dialog( "close" );
			
			// call the function assigned (within configuration) to the chosen option 
			var fnFunction = oOptions[ key ];
			fnFunction();
		}
	}); 		
		
	
	$( "#"+dialogDivId ).dialog({
		modal: true,
		width: "auto",
		open: function(event, ui){
			$(".ui-dialog").addClass("ui-dialog-shadow");
        	$( this ).closest(".ui-dialog").putInFront();
		},
		close: function(event, ui){
			$( "#"+dialogDivId ).remove();
		},
		position: fn._computeDialogPosition(),
		buttons: oButtons
	});
	
	// remove focus from buttons, 
	// to make sure OK won't be triggered 
	// when Enter was pressed just before 
	// in another context (like validating input in cell)
	$('.ui-dialog :button').blur();
	
};



/**
 * Show a confirmation dialog. This function is an equivalent of js native 'confirm'
 * 
 * @param {String} sTitle - Title of the message window
 * @param {String} sMessage - Message or question to the user
 * @param {Function} fnFunction - Function called after the user clicked on 'OK'
 * @param {Function} [fnCancelFunction=null] - Function called after the user clicked on 'Cancel'
 * 
 * @see fn.prompt
 */
fn.confirm = function(sTitle, sMessage, fnFunction, fnCancelFunction){
	
	if (fnFunction == null)
		{
		fn.message("Fout", "Illegale aanroep van fn.confirm(). " +
				"Er is geen callback gedefinieerd (fnFunction=null).");
		}
	else
		{
		var sP = $("<p></p>").html(sMessage);
		var dialogDivId = "dialog-message"+getUniqueNumber();
		var sDiv = $("<div></div>").attr("id",dialogDivId).attr("title", sTitle).append(sP);
		
		$(document.body).append(sDiv);
		
		$( "#"+dialogDivId ).dialog({
			modal: true,
			width: "auto",
			open: function(event, ui){
				$(".ui-dialog").addClass("ui-dialog-shadow");
	        	$( this ).closest(".ui-dialog").putInFront();
			},
			close: function(event, ui){
				$( this ).remove();
			},
			position: fn._computeDialogPosition(),
			buttons: [
			          {
			        	 text: "Ja",
			        	 click: function() {
								$( this ).dialog( "close" );					
								fnFunction();
						},
					    id: 'dialog_accept_button'
			          },
			          {
			        	  text: "Nee",
			        	  click: function() {
								$( this ).dialog( "close" );
								if (fnCancelFunction!=null)
									fnCancelFunction();
								}
			          }
			]		
			});
		
			fn._activeEnterForThisDialog(dialogDivId);
		}
	
};

// compute automatically a convenient position for a dialog, given the current active row in a table
// in such a way that the dialog does NOT hide the row
fn._computeDialogPosition = function(){
	
	var sTable = kf.getActiveTable();
	if (sTable == null)	return {};
	
	var nRow = $("#"+sTable+"_wrapper table tbody tr.selected:eq(0)");
	if (nRow == null) n = fn.getFirstSelectedRowNodeFrom(sTable);
	
	var iRowPosition = $(nRow).offset().top; 	
	var iMiddleOfScreen = $(window).height() / 2;
	
	return {
    	my: iRowPosition < iMiddleOfScreen ? 'center top' : 'center bottom',
    	at: iRowPosition < iMiddleOfScreen ? 'center bottom' : 'center top',
    	of: nRow
    }
};

/**
 * Generate a prompt pop-up, requesting some input from the user
 * The output can be retrieved by using fn.getPromptBoxInput()
 * 
 * @param {String|Array} sTitle - Title of the message window (if array: sTitle as element #1, sMessage as element #2)
 * @param {String[]} aFieldNames - Fields names to show
 * @param {Array} aValues - Default string values (pre-filled when dialog opens). When a pre-filled value mustn't be editable, add '::disabled' to the value string. / 
 * When the field at index i has to be a selectbox instead of an input field, aValues must contain (at the same index i) an array of values to choose from. The value to be
 * selected by default must have '::selected' attached in its string value  
 * @param {Function} fnFunction - Function called after the user clicked on 'OK'
 * @param {Function} [fnCancelFunction=null] - Function called after the user clicked on 'Cancel'
 * @param {Boolean} [bTextarea=false] - If true use textarea fields, otherwise use input fields (default)
 * @param {Integer[]} [aColsAndRows=null] - Textarea dimensions, if bTextarea was set to true
 * 
 * @see fn.getPromptBoxInput
 * @see fn.promptSelect
 * @see fn.promptReorder
 * @see fn.closeDialog
 */
fn.prompt = function(sTitle, aFieldNames, aValues, fnFunction, fnCancelFunction, bTextarea, aColsAndRows){
	
	fn._clearUserInput();
	
	// deal with title/message input
	var sMessage = "";
	if ( $.isArray(sTitle) )
		{
		sMessage = sTitle[1];
		sTitle = sTitle[0];
		}
	var sMessageP = $("<p></p>").html(sMessage);
	
	if (bTextarea == null) 
		bTextarea = false;
	
	var promptDivId = "dialog-message"+getUniqueNumber();
	
	var promptDiv = $("<div></div>") 
		.attr("id", promptDivId)
		.attr("title", sTitle)
		.css("font-size", "12px")
		.append(sMessageP);
	
	var promptForm = $("<form></form>");
	var promptFieldSet = $("<fieldset></fieldset>");
	for (var i=0; i<aFieldNames.length; i++)
		{
		// should the input field be editable?
		var bFixedValue = false;
		if (aValues != null && 
				(aValues[i] instanceof String || typeof aValues[i] === "string") ) // make sure we have a string, or this will crash!
			{
			bFixedValue = (aValues[i]).indexOf("::disabled")>-1;
			aValues[i] = (aValues[i]).split("::")[0];
			}
		
		// should the input field be an select box?
		// (in that case we expect the value at the current index i to contain an array of values to select from)
		var bSelectBox = (aValues != null && typeof aValues[i] === 'object');
		
		var fieldLC = $.trim( keepOnlyLettersAndDigits(aFieldNames[i].toLowerCase()) );
		var label = $("<label></label>")
			.attr("for", fieldLC)
			.text($.trim(aFieldNames[i]));
		
		
		// now build the input field
		
		var input;
		
		// select box type
		
		if (bSelectBox) 
			{
			input = $("<select></select>")
			.attr("id", "prompt_"+fieldLC)
			.prop('disabled', bFixedValue);
			
			// build the options to select 
			for (var j=0; j<aValues[i].length; j++)
				{
				var sThisValue = aValues[i][j];
				var bSelected = sThisValue.indexOf("::selected")>-1; // pre-selection!
				sThisValue = sThisValue.replace("::selected", "");
				var thisOption = $("<option></option>")
					.attr("value", sThisValue)
					.text(sThisValue);
				if (bSelected)
					thisOption.attr('selected','selected');
				$(input).append(thisOption);
				}
			}
		
		// text field type
		else
			{
			var sInputType = bTextarea ? "textarea" : "input";
			input = $("<"+sInputType+"></"+sInputType+">")
				.attr("type", "text" )
				.attr("name", fieldLC)
				.attr("id", "prompt_"+fieldLC)
				.prop('disabled', bFixedValue);
			
			// preset the input value, if available
			if (bTextarea)
				{
				input.text(aValues!=null ? aValues[i]: ""); // textarea
				}
			else
				{
				input.val(aValues!=null ? aValues[i]: "");  // input
				input.css("width", "95%");					// prevent small fields
				}
			
			// if cols and rows are given, set them!
			if (bTextarea && aColsAndRows!= null && aColsAndRows.length ==2)
				{
				input.attr("cols", aColsAndRows[0]);
				input.attr("rows", aColsAndRows[1]);
				}
			
			}				
		
		// append the current field
		
		promptFieldSet.append(label);
		promptFieldSet.append($("<br/>"));
		promptFieldSet.append(input);
		promptFieldSet.append($("<br/>"));
		}
	promptForm.append(promptFieldSet);
	promptDiv.append(promptForm);
	
	$(document.body).append(promptDiv);
	
	// Open dialog	
	// Important detail: Pressing enter should trigger click on OK button
	// cross-browser implementation: http://stackoverflow.com/questions/868889/submit-jquery-ui-dialog-on-enter
	// only change is use of keyup instead of keypress, otherwise it doesn't work in some cases
	$( "#"+promptDivId ).dialog({
		autoOpen: false,
        height: 300,
        width: "auto",
        modal: true,
        open: function( event, ui ){
        	$(".ui-dialog").addClass("ui-dialog-shadow");
        	$( this ).closest(".ui-dialog").putInFront();
        },
        close: function(event, ui){
        	$( this ).remove();        	
        },
        position: fn._computeDialogPosition(),
        buttons: [
                   {
                	 text: "OK",
                	 click: function(){
                		 
                		var aPromptResponse = {}; 
                 		for (var i=0; i<aFieldNames.length; i++)
                		{
                 			// fieldname
                 			var thisFieldName = $.trim(aFieldNames[i]);
                 			
                 			// value for this field, entered by the user
                			var fieldLC = $.trim( keepOnlyLettersAndDigits(aFieldNames[i].toLowerCase()) );
                			// read value for this field
                			// first try special case (select box), and then the normal case (text)
                			var thisValue = $("#"+promptDivId+" #prompt_"+fieldLC).children("option:selected").val();
                			if (thisValue == null) { thisValue = $("#"+promptDivId+" #prompt_"+fieldLC).val(); }
                			
                			
                			// compute output for fn.getPromptBoxInput
                			// (we keep this mainly for backwards compatibility, since we had no response in callback in the past)
                			fn._registerUserInput(                					
                					thisFieldName,                					
                					thisValue, 
                					// index of this field/value 
                					i
                					);
                			// compute response as well, to be easily used in callback
                			aPromptResponse[thisFieldName] = thisValue;
                			
                		}
                 		$( this ).dialog( "close" );  
                		// call callback
                 		if (fnFunction != null)
                 			fnFunction(aPromptResponse); 
                		              		
                	},
                	id: 'dialog_accept_button'
                   },
                   
                   {
                	text: "Annuleren",
                	click: function() {
                		$( this ).dialog( "close" );
                		// call callback upon Cancel, if available
                		if (fnCancelFunction != null)
                			fnCancelFunction(); 
                        
                    }
                   }
        ]
	}) 
	.keyup(function() {		 
		if (	kf.isPressed("enter") && 
				// enter when selecting from autocomplete mustn't trigger closing dialog
				// (in case an autocomplete has been set for this prompt)
				!$(".ui-autocomplete-input").elementExists() 
				)
			{		
			$( "#dialog_accept_button" ).click();
			return false;
			}
	});
	
	$( "#"+promptDivId ).dialog( "open" );	
	
};



/**
 * Generate a prompt pop-up, requesting the user to make a selection out of a list of items.
 * 
 * @param {String|Array} sTitle - Title of the message window (if array: sTitle as element #1, sMessage as element #2)
 * @param {String[]} aAllOptions - List of items to choose from
 * @param {String[]} aAlreadyChosen - List of pre-selected items (those will be shown as 'chosen' right from the start) 
 * @param {Function} fnFunction - Function called after the user clicked on 'OK'
 * @param {Function} [fnCancelFunction=null] - Function called after the user clicked on 'Cancel'
 * @param {Boolean|Function} [mSelectionMode=false] - true: close dialog as soon as an item was clicked; false: multiple choice; function: same as false, plus function to be called upon item selection (without closing the dialog), with the selected text as an argument
 * 
 * @see fn.prompt
 * @see fn.askToChoose
 * @see fn.closeDialog
 */
fn.promptSelect = function(sTitle, aAllOptions, aAlreadyChosen, fnFunction, fnCancelFunction, mSelectionMode){
	
	var promptDivId = "dialog-message"+getUniqueNumber();
	var selectableId = "selectable"; // don't change that one: the css expects this id!
	
	mSelectionMode = (typeof mSelectionMode == 'undefined' ? false : mSelectionMode);		
	
	// deal with title/message input
	var sMessage = "";
	if ( $.isArray(sTitle) )
		{
		sMessage = sTitle[1];
		sTitle = sTitle[0];
		}
	var sMessageP = $("<p></p>").html(sMessage);
	
	var promptDiv = $("<div></div>")
		.attr("id", promptDivId)
		.attr("title", sTitle)
		.css("font-size", "12px")
		.append(sMessageP);
	
	
	
	// adapt height of the prompt to the number of options, 
	// and if there are more options than the screen can show at once, 
	// add a filter box on top 
	
	var promptHeight = (200 + 30 * aAllOptions.length);
	
	if ( promptHeight > $(window).height()) 
		{
		promptHeight = $(window).height();

		var sFilter = $("<p></p>")
			.append(
				$("<span></span>")
					.text("Filter: ")
			)
			.append(
				$("<input></input>")
					.attr("id", promptDivId+"_valuefilter")
					.bind("input propertychange", function (evt) {
						// https://stackoverflow.com/questions/5917344/jquery-value-change-event-delay
						
					    // If it's the propertychange event, make sure it's the value that changed.
					    if (window.event && event.type == "propertychange" && event.propertyName != "value")
					        return;
					
					    // Clear any previously set timer before setting a fresh one
					    window.clearTimeout($(this).data("timeout"));
					    $(this).data("timeout", setTimeout(function () {
	
					    	// read new unique values given filter
					    	var sFilter = 	$("#"+promptDivId+"_valuefilter").val();
					    	var aAllOptionsFiltered = aAllOptions.filter(function(value ){
					    		return value.match(sFilter);
					    		});
					    	fn._promptSelect_AppendOptions(selectableUl, aAllOptionsFiltered, aAlreadyChosen);					    	
							
					    }, 1000));
					})
			);
		
		// append filter box
		promptDiv.append(sFilter);
		}

	
	// user instructions
	if (mSelectionMode == false)
		{
		var sP = $("<p></p>").html("Houd CTRL ingedrukt bij meervoudige keuze:");	
		promptDiv.append(sP);
		}	
	
	// selectable part	
	var selectableUl = $("<ol></ol>")
		.attr("id", selectableId)
		.css("list-style-type", "none")
		.css("margin", "0")
		.css("padding", "0")
		.css("width", "80%");
	
	
	// build the elements of the list to choose from
	
	fn._promptSelect_AppendOptions(selectableUl, aAllOptions, aAlreadyChosen);

	
	// append the whole thing to the dialog box
	
	promptDiv.append(selectableUl);
	$(document.body).append(promptDiv);
		
	
	// Open dialog	
	// Important detail: Pressing enter should trigger click on OK button
	// cross-browser implementation: http://stackoverflow.com/questions/868889/submit-jquery-ui-dialog-on-enter
	// only change is use of keyup instead of keypress, otherwise it doesn't work in some cases
	$( "#"+promptDivId ).dialog({
		autoOpen: false,
        height: promptHeight,
        width: 600,  // 'auto' setting caused dialog to get to small, very ugly and not readable
        modal: true,
        open: function( event, ui ){
        	$(".ui-dialog").addClass("ui-dialog-shadow");
        	$( this ).closest(".ui-dialog").putInFront();
        },
        close: function(event, ui){
        	
        	$( this ).remove();            
            // remove 'selectableselected' event
            $( "#"+selectableId ).off();
        },
        position: fn._computeDialogPosition(),
        buttons: [
                  {
                	  text: "OK",
                	  click: function(){
                		  
						var aNewChosenOptions = new Array();
						  
						var aSelectedNodes = $(".ui-selected");
						aSelectedNodes.each(function(){
							// sometimes doubles are added somehow, so prevent this!
							if (aNewChosenOptions.indexOf( $(this).text() )<0)
								  aNewChosenOptions.push( $(this).text());
						});
						
						// call close function
                		$( this ).dialog( "close" );
                  		
                		// call callback
                  		fnFunction(aNewChosenOptions);
                  		
                	},
                	id: 'dialog_accept_button'
                  },
                  {
                	  text: "Annuleren",
                	  click: function() {
                		  // call close function
                          $( this ).dialog( "close" );
                          
                		  // call callback upon Cancel, if available
                  		  if (fnCancelFunction != null)
                  			  fnCancelFunction();
                  		  
                      }
                  }
        ]
	});
	
	$( "#"+promptDivId ).dialog( "open" );
	
	fn._activeEnterForThisDialog(promptDivId);
	
	$( function() {		
		
		$( "#"+selectableId ).selectable();
		
		if (mSelectionMode != false)
		{
			$( "#"+selectableId ).on( "selectableselected", function( event, ui ) {
				
				// if some function was set, execute it and give the selected text as an argument
				if (typeof mSelectionMode == 'function')
					{
					mSelectionMode(ui.selected.innerText);
					}
				
				// if only one choice is allowed, dialog must be closed upon selection
				else
					{
					$( "#dialog_accept_button" ).click();		
					return false;
					}
				
			} );			
		}		
	});
	
};

// subroutine for building the options to choose from in fn.promptSelect
fn._promptSelect_AppendOptions = function(selectableUl, aAllOptions, aAlreadyChosen){
	
	selectableUl.empty();
	
	for (var i=0; i<aAllOptions.length; i++)
	{
	var sOption = aAllOptions[i];
	
	// null represent an empty space, which can be used to put room between groups of options not belonging together
	if (sOption == null)
		{
		selectableUl.append($("<br/>"));
		}
	
	// normal case: build option
	else
		{
		// one element 		
		var liElement = $("<li></li>")
			.addClass( "ui-widget-content" )
			.css("margin", "3px")
			.css("padding", "0.4em")
			.css("font-size", "12px")
			.css("height", "18px");	
		
		// if some item was pre-selected, assign it the selected class
		if (aAlreadyChosen != null && aAlreadyChosen.indexOf(sOption)>-1)
			{
			liElement.addClass("ui-selected");
			}
		
		var spanElement = $("<span></span>").text( $.trim(sOption) );
		liElement.append(spanElement);
		selectableUl.append(liElement);
		}	
	}
}




/**
 * Generate a prompt pop-up, requesting the user to reorder a set of data
 * The output can be retrieved by using fn.getPromptBoxOrder().
 * 
 * @param {String|Array} sTitle - Title of the message window (if array: sTitle as element #1, sMessage as element #2)
 * @param {String[]} aFieldNames - Fields names to show
 * @param {Function} fnFunction - Function called after the user clicked on 'OK'
 * @param {Function} [fnCancelFunction=null] - Function called after the user clicked on 'Cancel'
 * 
 * @see fn.getPromptBoxOrder
 * @see fn.getNewPositionOfElementAt
 * @see fn.processPromptBoxOrder
 * @see fn.prompt
 */
fn.promptReorder = function(sTitle, aFieldNames, fnFunction, fnCancelFunction){
	
	fn._clearUserInput();
	
	var promptDivId = "dialog-message"+getUniqueNumber();
	var sortableId = "sortable"+getUniqueNumber();
	
	// deal with title/message input
	var sMessage = "";
	if ( $.isArray(sTitle) )
		{
		sMessage = sTitle[1];
		sTitle = sTitle[0];
		}
	var sMessageP = $("<p></p>").html(sMessage);
	
	var promptDiv = $("<div></div>")
		.attr("id", promptDivId)
		.attr("title", sTitle)
		.css("font-size", "12px")
		.append(sMessageP);
	
	var sortableUl = $("<ul></ul>")
		.attr("id", sortableId)
		.css("list-style-type", "none")
		.css("margin", "0")
		.css("padding", "0")
		.css("width", "60%");
	
	var aOriginalOrder = new Array();
	
	for (var i=0; i<aFieldNames.length; i++)
		{
		var fieldLC = $.trim( keepOnlyLettersAndDigits(aFieldNames[i].toLowerCase()) );
		aOriginalOrder.push(fieldLC);
		
		var liElement = $("<li></li>")
			.addClass( "ui-state-default" )
			.attr("id", fieldLC)
			.css("margin", "0 3px 3px 3px")
			.css("padding", "0.4em")
			.css("padding-left", "1.5em")
			.css("font-size", "12px")
			.css("height", "18px");		
		var spanElement = $("<span></span>")
			.addClass( "ui-icon ui-icon-arrowthick-2-n-s" )	
			.css("position", "absolute")
			.css("margin-left", "-1.3em");
		var spanElement2 = $("<span></span>")
			.text( $.trim(aFieldNames[i]) );
		liElement.append(spanElement);
		liElement.append(spanElement2);
		sortableUl.append(liElement);
		}	
	
	promptDiv.append(sortableUl);

	$(document.body).append(promptDiv);
	
	
	// adapt height of the prompt to the number of values to reorder
	var promptHeight = (200 + 30 * aFieldNames.length);
	
	
	// Open dialog	
	// Important detail: Pressing enter should trigger click on OK button
	// cross-browser implementation: http://stackoverflow.com/questions/868889/submit-jquery-ui-dialog-on-enter
	// only change is use of keyup instead of keypress, otherwise it doesn't work in some cases
	$( "#"+promptDivId ).dialog({
		autoOpen: false,
        height: promptHeight,
        width: 600,  // 'auto' setting caused dialog to get to small, very ugly and not readable
        modal: true,
        open: function( event, ui ){
        	$(".ui-dialog").addClass("ui-dialog-shadow");
        	$( this ).closest(".ui-dialog").putInFront();
        },
        close: function(event, ui){
        	$( this ).remove();
        },
        position: fn._computeDialogPosition(),
        buttons: [
                  {
                	  text: "OK",
                	  click: function(){
                		  
                		for (var i=0; i<aFieldNames.length; i++)
                		{
                			var fieldLC = $.trim( keepOnlyLettersAndDigits(aFieldNames[i].toLowerCase()) );
                			
                			// compute output for fn.getPromptBoxInput
                			// (we keep this mainly for backwards compatibility, since we had no response in callback in the past)
                			fn._registerUserInput(
                					// fieldname
                					$.trim(aFieldNames[i]),
                					// no value entered, since user only had to (re)order the set of data
                					"", 
                					// index of reordered fieldname
                					$.inArray($("#"+sortableId).find("li").eq(i).attr("id"), aOriginalOrder)
                					);
                		}
                  		// compute response as well (the new way!)
                		// (compute a re-ordered input array straight away, which is what the user mostly expects)
                  		var aPromptResponse = fn.processPromptBoxOrder( fn.getPromptBoxOrder(), aFieldNames );
                  		
                  		$( this ).dialog( "close" );     
                		// call callback
                  		fnFunction(aPromptResponse); 
                		           		 
                	},
                	id: 'dialog_accept_button'
                  },
                  {
                	  text: "Annuleren",
                	  click: function() {
                		  $( this ).dialog( "close" );
                		  // call callback upon Cancel, if available
                  		  if (fnCancelFunction != null)
                  			  fnCancelFunction(); 
                          
                      }
                  }
        ]
	});
	
	$( "#"+promptDivId ).dialog( "open" );
	
	fn._activeEnterForThisDialog(promptDivId);
	
	$( "#"+sortableId ).sortable();
    $( "#"+sortableId ).disableSelection();
	
};

// variables to store user input upon call of fn.prompt()
var aPromptUserInputFields = new Array();
var aPromptUserInputValues = new Array();
//in case the order was changed during input, we store the field/value order
var aPromptUserInputFieldOrder = new Array(); 

// clear all user input variables
fn._clearUserInput = function(){
	aPromptUserInputFields = new Array();
	aPromptUserInputValues = new Array();
	aPromptUserInputFieldOrder = new Array();
};
// register input
fn._registerUserInput = function(field, value, order){
	aPromptUserInputFields.push(field);
	aPromptUserInputValues.push(value);
	aPromptUserInputFieldOrder.push(order);
};




/**
 * Get user input for all field, or of a single field if its name is specified.
 * 
 * @param {String} [sFieldName=null] - Prompt field to get the user input from  
 * @returns {(String[]|String)} An array of strings, or one single string if a fieldname was specified
 * @see fn.prompt
 */
fn.getPromptBoxInput = function(sFieldName){
	
	if (sFieldName == null)
		return aPromptUserInputValues;
	
	var index = $.inArray(sFieldName, aPromptUserInputFields);
	return (index>-1) ? $.trim(aPromptUserInputValues[index]) : null;
};


/**
 * Get the order of the field and values, in case the user changed the order
 * 
 * @returns {Integer[]} An array of integers. Their values represent the original indexes of
 * the re-ordered elements, but their order in this array is the new order applied by
 * the user. 
 * 
 * @see fn.promptReorder
 * @see fn.processPromptBoxOrder
 * @see fn.getNewPositionOfElementAt
 */
fn.getPromptBoxOrder = function(){
	return aPromptUserInputFieldOrder;
};


/**
 * Re-sort the input array, according to the new order defined by the user in fn.promptReorder()
 * 
 * @param {Integer[]} aPromptBoxOrder - An array of indexes, like specified as the ouput of fn.getPromptBoxOrder()
 * @param {String[]} aArrayToResort - An array to resort according to aPromptBoxOrder
 * @returns {String[]} An array, re-sorted according to input array aPromptBoxOrder
 * 
 * @see fn.promptReorder
 */
fn.processPromptBoxOrder = function(aPromptBoxOrder, aArrayToResort){
	
	if (aPromptBoxOrder.length != aArrayToResort.length)
		{
		fn.message("Fout", "fn.processPromptBoxOrder() is aangeroepen met twee arrays van verschillende lengtes.");
		}
	else
		{
		var aNewArray = new Array();
		
		for (var i=0; i<aPromptBoxOrder.length; i++)
			{
			aNewArray.push( aArrayToResort[ aPromptBoxOrder[i] ] );
			}
		
		return aNewArray;
		}
	
};


/**
 * Get the new index of an element 
 * in an array of elements that was re-sortered by the user 
 * (after the user was prompt to do so by fn.promptReorder).
 * 
 * @param {Integer} iOriginalIndex - The original index of an element within an array the user was prompted to re-arrange
 * @returns {Integer} The new index of the element after the user re-sorted the array
 * 
 * @see fn.promptReorder
 * @see fn.processPromptBoxOrder
 * @see fn.getPromptBoxOrder
 */
fn.getNewPositionOfElementAt = function(iOriginalIndex){
	var aNewPositions = fn.getPromptBoxOrder();
	return $.inArray(iOriginalIndex, aNewPositions);
}



/**
 * Click programmatically onto a button
 * 
 *  @param {(String|API-object-instance)} sTableName - A table name or object
 *  @param {String} sButtonId - id of a button in DOM tree
 */
fn.clickOnButton = function(sTableName, sButtonId){
	
	if (typeof sTableName == 'object')
		sTableName = fn.getTableName(sTableName);
	
	$("#"+sTableName+"_wrapper #"+sButtonId).click();
};



// *******************************
// ** modify the custom buttons **
// *******************************

/**
 * Set the name of a custom user button (in the header of a table)
 * 
 * @param {(String|API-object-instance)} sTableName - A table name or object
 * @param {Integer} iButtonNumber - Button number
 * @param {String}  sNewName - The name to assign to the button
 * 
 * @see fn.addCustomButton
 * @see fn.setCustomButtonCss
 */
fn.setCustomButtonName = function(sTableName, iButtonNumber, sNewName){
	
	if (typeof sTableName == 'object')
		sTableName = fn.getTableName(sTableName);
	
	// buttons are usually accessed by their 'iButtonNumber' or their id,
	// but never by their names, so it's safe to change the name
	// of a button in the array of settings.
	var oTableSettings = conf.getTableSettings(sTableName);
	oTableSettings["button_"+iButtonNumber]["name"] = sNewName;
	
	var oButton = $("div#"+sTableName+"_custombutton_"+iButtonNumber+" button#"+sTableName+"_button_"+iButtonNumber);
	oButton.html(sNewName);
};


/**
 * Set the css style of a custom user button (in the header of a table)
 * 
 * @param {(String|API-object-instance)} sTableName - A table name or object
 * @param {Integer} iButtonNumber - Button number
 * @param {String} sProperty - CSS property name
 * @param {String}  sNewValue - Value to assign to the property
 * 
 * @see fn.getCustomButtonCss
 */
fn.setCustomButtonCss = function(sTableName, iButtonNumber, sProperty, sNewValue){
	
	if (typeof sTableName == 'object')
		sTableName = fn.getTableName(sTableName);
	
	var oButton = $("div#"+sTableName+"_custombutton_"+iButtonNumber+" button#"+sTableName+"_button_"+iButtonNumber);
	oButton.css(sProperty, sNewValue);
};

/**
 * Get the css style of a custom user button (in the header of a table)
 * 
 * @param {(String|API-object-instance)} sTableName - A table name or object
 * @param {Integer} iButtonNumber - Button number
 * @param {String} sProperty - CSS property name
 * @returns {String} The value for the given property
 * 
 * @see fn.setCustomButtonCss 
 * @see fn.getNameOfButtonAtIndex
 * @see fn.getIndexOfButtonNamed
 */
fn.getCustomButtonCss = function(sTableName, iButtonNumber, sProperty){
	
	if (typeof sTableName == 'object')
		sTableName = fn.getTableName(sTableName);
	
	var oButton = $("div#"+sTableName+"_custombutton_"+iButtonNumber+" button#"+sTableName+"_button_"+iButtonNumber);
	return oButton.css(sProperty);
	
};

/**
 * Get the index of a custom user button, given its name (in the header of a table)
 * 
 * @param {(String|API-object-instance)} sTableName - A table name or object
 * @param {String} sName - Button name
 * @returns {Integer} The button number 
 * 
 * @see fn.getNameOfButtonAtIndex 
 */
fn.getIndexOfButtonNamed = function(sTableName, sName){
	
	if (typeof sTableName == 'object')
		sTableName = fn.getTableName(sTableName);
	
	var aTableSettings = conf.getTableSettings(sTableName);	
	
	for (sOneSetting in aTableSettings)
		{
		// if we found a button and it has the required name, return its index
		if ( $.startsWith(sOneSetting, "button") && 
				aTableSettings[sOneSetting]["name"] == sName)
			return parseInt(sOneSetting.replace("button_", ""));
		}
	
	// no button found with this name
	return -1;
};


/**
 * 
 * @param {(String|API-object-instance)} sTableName - A table name or object
 * @param {Integer} iIndex - The button number
 * @returns {String} The button name
 * 
 * @see fn.getIndexOfButtonNamed
 */
fn.getNameOfButtonAtIndex = function(sTableName, iIndex){
	
	if (typeof sTableName == 'object')
		sTableName = fn.getTableName(sTableName);
	
	var aTableSettings = conf.getTableSettings(sTableName);
	
	return aTableSettings["button_"+iIndex]["name"];
}


/**
 * Add a custom button after initialization time (in the header of a table)
 * This function might be needed when a button needs to be dynamically added,
 * as buttons are normally set in the tabel configuration
 * 
 * @param {(String|API-object-instance)} sSomeTableName - A table name or object
 * @param {Array} oButtonConfig - Associative array with the button settings
 * 
 * @see fn.setCustomButtonName
 */
fn.addCustomButton = function(sSomeTableName, oButtonConfig){
	
	if (typeof sSomeTableName == 'object')
		sSomeTableName = fn.getTableName(sSomeTableName);
		
	// get the table settings and the current number of custom buttons
	var aTableSettings = 			conf.getTableSettings(sSomeTableName);	
	var iNumberOfCustomButtons = 	conf.getNumberOfHeaderButtons(aTableSettings);
	var iIndexOfNewButton = 		iNumberOfCustomButtons;
	
	// put the new button config into the table settings array
	// with the right index
	aTableSettings["button_"+iIndexOfNewButton] = oButtonConfig;
	
	// now we can access the new button configuration exactly in the same 
	// way as the configuration of other buttons
	var aButtonSettings = 	conf.getHeaderButtonSettings(aTableSettings, iIndexOfNewButton);
	var sButtonName = 		conf.getHeaderButtonName(aButtonSettings);
	var sButtonBgColor = 	conf.getHeaderButtonBgColor(aButtonSettings);
	var sButtonTextColor = 	conf.getHeaderButtonTextColor(aButtonSettings);
	var sToolTip = 			conf.getHeaderButtonToolTip(aButtonSettings);
	
	var customButton = $("<button/>")
	.attr("id", sSomeTableName+"_button_"+iIndexOfNewButton)
	.attr("type", "button")
	.css("background-color", sButtonBgColor)
	.css("color", sButtonTextColor)
	.addClass("header_button")
	.attr("name", iIndexOfNewButton) // give button its number as name attribute
	.html(sButtonName)
	.bind("click", function(){
		// retrieve button function by its button number
		var aButtonSettings = 	conf.getHeaderButtonSettings(aTableSettings, $(this).attr("name"));
		var fnButtonFunction = 	conf.getHeaderButtonFunction(aButtonSettings);
		// execute the function
		fnButtonFunction( mt.getDataTableObjectOf(sSomeTableName) );
	});
	
	// add tooltip
	if (sToolTip != null)
		customButton.attr("title", sToolTip).addClass("tooltip");

	$("#"+sSomeTableName+"_filter").append(
		$("<div></div>").attr("id", sSomeTableName+"_custombutton_"+iIndexOfNewButton).css("display", "inline").append(customButton)
		);
};




// **********************************************************
// *             FILTER BOXES FUNCTIONS                     *
// **********************************************************

// PART 1
// ------
// BEWARE: The following functions affect the filter boxes in the user interface
//         but have no effect on the filters variables (one gets only effect when
//         pressing 'enter')
//         If you want to access the filters of the engine, see 'PART 2'

// put some data into a search filter box
// returns : n.a.

/**
 * Put some data into a search filter box in the GUI
 * (beware: no effect on the filters variables as long as 'enter' wasn't pressed)
 * 
 * @param {(String|API-object-instance)} sSomeTable - A table name or object
 * @param {String} sCellName - Column name of the search box
 * @param {String} sSomeData - Search value to put in the search box
 * 
 * @see fn.setAutoComplete
 */
fn.putDataIntoFilterBox = function(sSomeTable, sCellName, sSomeData){
	
	if (typeof sSomeTable == 'object')
		sSomeTable = fn.getTableName(sSomeTable);
	var sSomeTableName = fn.getTableName(sSomeTable);
	var iColNr = fn.getVisibleColumnNumberOf(sSomeTable, sCellName);
	
	// carry on only if the search box exists (is visible column) 
	if (iColNr>-1)
		{
		var oTableConfig = conf.getTableConfig(sSomeTableName);
		var oColumnConfig = conf.getColumnConfig(oTableConfig, sCellName);
		var oColumnSelectionBox = conf.getSelectionBox(oColumnConfig);
		
		// determine right selector for searchbox (input or select type)
		
		var searchBoxSelector = $("#"+sSomeTableName+"_searchbox_"+sCellName);		
			
		if (searchBoxSelector.attr("disabled") != "disabled")
			{			
			// put value
			searchBoxSelector.val( sSomeData );

			// special case: if we have a checkbox, we also need to (un)check it			
			if (searchBoxSelector.attr("type")=="checkbox" && sf.isCheckboxTrueValue(sSomeData))
				searchBoxSelector.prop("checked", "checked");
			
			}
		}
};


/**
 * Get the content of a given search filter box 
 * (beware: this is not the the filter variable in the engine, but only the content of the search box in the GUI)
 * 
 * @param {(String|API-object-instance)} sSomeTable - A table name or object
 * @param {String} sCellName - Column name of the filter box
 * @returns {String} Search value in the search box
 */
fn.getValueOfFilterBox = function(sSomeTable, sCellName){
	
	if (typeof sSomeTable == 'object')
		sSomeTable = fn.getTableName(sSomeTable);
	var sSomeTableName = fn.getTableName(sSomeTable);
	var iColNr = fn.getVisibleColumnNumberOf(sSomeTable, sCellName);
	
	// carry on only if the search box exists (is visible column)
	if (iColNr>-1)
		{
		var oTableConfig = conf.getTableConfig(sSomeTableName);
		var oColumnConfig = conf.getColumnConfig(oTableConfig, sCellName);
		var oColumnSelectionBox = conf.getSelectionBox(oColumnConfig);
		
		// determine right selector for searchbox (input or select type)
		var searchDivSelector = $("#"+sSomeTableName+"_searchboxes div:eq("+iColNr+")");
		var searchBoxSelector = (oColumnSelectionBox!=null) ? 
				searchDivSelector.find("select").eq(0).find(":selected") : searchDivSelector.find("input").eq(0);
		
		return $.trim(searchBoxSelector.val());
		}	
	return "";
};





/**
 * Get the type of a filterbox, given its column name
 * 
 * @param {(String|API-object-instance)} sSomeTablename - A table name or object
 * @param {String} sColumnName - Column name of the filter box
 * @returns {String} Value 'checkbox', 'select' or 'text'
 */
fn.getTypeOfFilterBox = function(sSomeTablename, sColumnName){
	
	if (typeof sSomeTablename == 'object')
		sSomeTablename = fn.getTableName(sSomeTablename);
	
	// checkbox 
	var iColumnNameIndex = fn.getColumnNumberOf(sSomeTablename, sColumnName);
	var sColumnType = mt.getListOfColumnTypesOf(sSomeTablename)[iColumnNameIndex];
	if ( $.inArray(sColumnType, ["bit varying(1)", "boolean"]) >=0)
		return "checkbox";
	
	// select 
	var oTableConfig = conf.getTableConfig(sSomeTablename);
	var aColumnConfig = conf.getColumnConfig(oTableConfig, sColumnName);
	//    select values from 'choosefrom' in config.js file,
	// or select values from Postgres ENUM custom type?
	//
	// [1] choosefrom
	var aSelectBoxValues = conf.getSelectionBox(aColumnConfig);
	// [2] ENUM
	if (aSelectBoxValues == null)
		aSelectBoxValues = mt.getListOfAllowedValuesInColumnsOf(sSomeTablename)[iColumnNameIndex];
	if ( aSelectBoxValues != null && aSelectBoxValues.length>1 )
		return "select";
	
	// default: text
	return "text";
};



// PART 2
// ------
// BEWARE: The following functions affect the filters variables,
//         but have no effect on the filter boxes in the user interface
//         If you want to access the filter boxes, see 'PART 1'

/**
 * Clear all the filters and remove initialisation filters
 * (beware: this has no effect on the filter boxes in the GUI)
 * 
 * @param {(String|API-object-instance)} sSomeTable - A table name or object
 * 
 * @see fn.resetAllFilters
 */
fn.clearAllFilters = function(sSomeTable){
	
	if (typeof sSomeTable == 'string')
		sSomeTable = mt.getDataTableObjectOf(sSomeTable);
	
	sSomeTable.clearSearchFilters();
};



/**
 * Put the filters back into their state at initialisation time.
 * This might have a quite different effect than fn.clearAllFilters
 * as this restore the initialisation values set by 'filter:'
 * in the config file; beware: only if 'keepfilter':true is set.
 * (beware: this has no effect on the filter boxes in the GUI)
 * 
 * @param {(String|API-object-instance)} sSomeTable - A table name or object
 * @param {Boolean} bUpdateSearchBoxesValues - if true, the content of filter boxes will be set as well
 * 
 * @see fn.clearAllFilters
 */
fn.resetAllFilters = function(sSomeTable, bUpdateSearchBoxesValues){
	
	if (typeof sSomeTable == 'string')
		sSomeTable = mt.getDataTableObjectOf(sSomeTable);
	
	sSomeTable.resetSearchFilters(bUpdateSearchBoxesValues);
};


/**
 * Set some filter values for a given table.
 * This erases the existing settings. If you want to keep the current
 * search settings, use fn.addFilters instead.
 * (beware: this has no effect on the filter boxes in the GUI)
 * 
 * @param {(String|API-object-instance)} sSomeTable - A table name or object
 * @param {Array} oFilters - An associative array of columns names and values to set
 * @param {Boolean} bUpdateSearchBoxesValues - if true, the content of filter boxes will be set as well
 * 
 * @see fn.addFilters
 * @see fn.getFilters
 */
fn.setFilters = function(sSomeTable, oFilters, bUpdateSearchBoxesValues){
	
	if (typeof sSomeTable == 'string')
		sSomeTable = mt.getDataTableObjectOf(sSomeTable);

	sSomeTable.setSearchFilters(oFilters, bUpdateSearchBoxesValues);
};


/**
 * Get the filters values for a given table.
 * (beware: this has nothing to do with the filter boxes in the GUI)
 * 
 * @param {(String|API-object-instance)} sSomeTable - A table name or object
 * @returns {Array} An associative array with the search filters values { colname1: value1, ...} 
 * 
 * @see fn.setFilters
 * @see fn.addFilters
 */
fn.getFilters = function(sSomeTable){
	
	if (typeof sSomeTable == 'string')
		sSomeTable = mt.getDataTableObjectOf(sSomeTable);
	
	return sSomeTable.getSearchFilters();
};


/**
 * Set the global filter for a given table.
 * (beware: this has no effect on the filter boxes in the GUI)
 * 
 * @param {(String|API-object-instance)} sSomeTable - A table name or object
 * @param {String} sValue - Search value to set
 * 
 * @see fn.getGlobalFilter
 */
fn.setGlobalFilter = function(sSomeTable, sValue){

	if (typeof sSomeTable == 'string')
		sSomeTable = mt.getDataTableObjectOf(sSomeTable);
	
	sSomeTable.search(sValue);
};


/**
 * Get the value of the global filter for a given table.
 * (beware: this has nothing to do with the filter boxes in the GUI)
 * 
 * @param {(String|API-object-instance)} sSomeTable - A table name or object
 * @returns {String} The global search value 
 * 
 * @see fn.setGlobalFilter
 */
fn.getGlobalFilter = function(sSomeTable){
	
	if (typeof sSomeTable == 'string')
		sSomeTable = mt.getDataTableObjectOf(sSomeTable);
	
	return sSomeTable.search();
};


/**
 * Add some filters to the current filter settings.
 * This is different from fn.setFilters, which erases existing settings.
 * (beware: this has no effect on the filter boxes in the GUI)
 * 
 * @param {(String|API-object-instance)} sSomeTable - A table name or object
 * @param {Array} oFilters - An associative array of columns names and values to set
 * 
 * @see fn.setFilters
 */
fn.addFilters = function(sSomeTable, oFilters){
	if (typeof sSomeTable == 'string')
		sSomeTable = mt.getDataTableObjectOf(sSomeTable);
	
	sSomeTable.addSearchFilters(oFilters);
};




// *************************************************************
// *                 GOTO FUNCTION                             *
// *************************************************************

/**
 * Go to the right page of a table, given some column name and a value it should contain 
 * 
 * @param {(String|API-object-instance)} sSomeTable - A table name or object
 * @param {String} sColumnName - Name of columns to search through
 * @param {String} sColumnValue - Value to search for
 */
fn.goToTheRightPage = function(sSomeTablename, sColumnName, sColumnValue){
	
	
	// BEWARE:
	// this function might not work as expected if some search was
	// carried out just before, as the result set might be much smaller
	// than the row number this function will try to show...
	
	if (typeof sSomeTablename == 'object')
		sSomeTablename = fn.getTableName(sSomeTablename);
	
	// reset filters
	// this is needed because we will add filters here and we want to make
	// sure that filters from previous rounds get cleaned
	mt.getDataTableObjectOf(sSomeTablename).resetSearchFilters(false);
	
	// initialize compulsory filters arrays
	// (these are filters in addition to the "go to"-filter)
	var filterColumnNames = new Array();
	var filterValues = new Array();
	
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


/**
 * Go to the previous page of a table 
 * 
 * @param {(String|API-object-instance)} sSomeTable - A table name or object
 */
fn.goToPreviousPage = function(sSomeTablename){
	
	if (typeof sSomeTablename == 'object')
		sSomeTablename = fn.getTableName(sSomeTablename);
	
	( mt.getDataTableObjectOf(sSomeTablename) ).page( 'previous' ).draw( 'page' );
};


/**
 * Go to the next page of a table 
 * 
 * @param {(String|API-object-instance)} sSomeTable - A table name or object
 */
fn.goToNextPage = function(sSomeTablename){
	
	if (typeof sSomeTablename == 'object')
		sSomeTablename = fn.getTableName(sSomeTablename);
	
	( mt.getDataTableObjectOf(sSomeTablename) ).page( 'next' ).draw( 'page' );
};

// *************************************************************
// *                 STRING FUNCTIONS                          *
// *************************************************************

/**
 * Escape single quotes
 * 
 * @param {String} str - Some string
 * @returns {String} String with escaped single quotes
 * 
 * @see fn.escapeDoubleQuotes
 */
fn.escapeSingleQuotes = function(str){
	return str.replace(/\'/g, "\\'");
};


/**
 * Escape double quotes
 * 
 * @param {String} str - Some string
 * @returns {String} String with escaped double quotes
 * 
 * @see fn.escapeSingleQuotes
 */
fn.escapeDoubleQuotes = function(str){
	return str.replace(/\"/g, '\\\"');
};

/**
 * Put single quotes around a string (and 
 * automatically escape the single quotes inside it)
 * 
 * @param {String} str - Some string
 * @returns {String} Quotes string (with escaped quotes in it, if needed)
 */
fn.quote = function(str){
	return "'"+fn.escapeSingleQuotes(str)+"'";
};


/**
 * Escape regular expression characters
 * 
 * @param {String} str - Some string
 * @returns {String} String with escaped regular expression characters
 */
fn.escapeRegexChars = function(str){
	return str.replace(/[-[\]{}()*+?.,\\^$|#]/g, "\\$&");
	//return str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};


/**
 * Convert a string containing an array reliably into an array
 * Trick: http://stackoverflow.com/questions/13272406/javascript-string-to-array-conversion
 * 
 * @param {String} str - Some string
 * @returns {Array} An array corresponding to the input string
 * 
 * @see fn.arrayToString
 */
fn.stringToArray = function(str){
	
	// remove curly brackets
	if (str.match("^(\{)(.+)(\})$"))
		str = str.replace(/^(\{)(.+)(\})$/, '$2');
	
	// conversion
	return JSON.parse("[" + str + "]");
};

/**
 * Convert an array into a string
 * 
 * @param {Array} str - Some array
 * @returns {String} A string corresponding to the input array
 * 
 * @see fn.stringToArray
 */
fn.arrayToString = function(arr, bCurlyBrackets){
	
	// conversion
	var str = (JSON.stringify(arr, null));
	
	// do we want curly brackets instead? 
	if (bCurlyBrackets)
		str = str.replace('\[', '{', 'g').replace('\]', '}', 'g');
	
	return str;
};


/**
 * Highlight some part of a string, by setting a 
 * background color between a given set of positions in a string
 * 
 * @param {String} sString - Some string
 * @param {Integer[][]} aaIndexes - An array of pairs of indexes like [ [start1, end1], [start2, end2], ...]
 * @param {String} sColor - The backgroup color code (eg. #ffffff) to use to highligh
 * @returns {String} A string with one of more highlighted parts
 * 
 * @see fn.removeHighlight
 */
fn.getHighlight = function(sString, aaIndexes, sColor){
	
	// make sure to remove highlight from input string, otherwise we might corrupt it
	// (by overlapping spans that bite each other)
	sString = fn.removeHighlight(sString);
	
	// check if indexes are given the right way:
	// when only one pair of positions needs to be given, it's easy to forget to put that array in an array
	// (that is: [] is wrong, [[]] is correct)
	if ( $.isArray(aaIndexes) )
		{
		if ( !$.isArray( aaIndexes[0]) )
			{
			fn.message("Fout", 
					"De highlightposities in fn.getHighlight() zijn niet correct opgegeven. " +
					"De posities moeten worden opgegeven als een array van arrays: " +
					"[[a1,b1], [a2,b2], [a3,b3]].");
			return sString;
			}			
		}
	
	// make sure the indexes are sorted correctly
	aaIndexes = sortArrayOfArray(aaIndexes);
	
	var sPreTag = "<span style='background: "+sColor+"'>";
	var sPostTag = "</span>";
	var iTotalIndexCorrection = 0;
	var iIndexCorrectionForEachStep = (sPreTag+sPostTag).length;
	
	for (var i=0; i<aaIndexes.length; i++)
		{
		var aIndexes = aaIndexes[i];
		
		// prevent wrong highlighting 
		// (e.g. when indexes are nog defined)
		if (isNaN(aIndexes[0]) || isNaN(aIndexes[1])) continue;
		
		// make sure we have index positions as numbers, and add index correption to those at each cycle
		// this is necessary since adding tags into the string causes following indexes to 
		// reference wrong string positions
		var iStartIndex = (typeof aIndexes[0]=='number') ? aIndexes[0] : parseInt(aIndexes[0]);
		iStartIndex += iTotalIndexCorrection;		
		var iEndIndex =   (typeof aIndexes[1]=='number') ? aIndexes[1] : parseInt(aIndexes[1]);
		iEndIndex += iTotalIndexCorrection;	
		
		// insert tags
		sString = sString.substring(0, iStartIndex) +
		sPreTag +
		sString.substring(iStartIndex, iEndIndex) +
		sPostTag +
		sString.substring(iEndIndex);
		
		// apply index correction
		iTotalIndexCorrection += iIndexCorrectionForEachStep;		
		}
	
	return sString;
};


/**
 * Remove highlighting from a string
 * 
 * @param {String} sString - Some highlighted string
 * @returns {String} A string with highlight
 * 
 * @see fn.getHighlight
 */
fn.removeHighlight = function(sString){

	var sNewString = sString.replace(/(\<span style='background: .+?\>)(.+?)(\<\/span\>)/gi, "$2");
	return sNewString;
};







// *******************************************
// *             WEBSERVICES                 *
// *******************************************


/**
 * Call a webservice (works automatically crossDomain as well)
 * 
 * @param {String} sUrl - URL of the service
 * @param {Array} aParameters - parameters to send to the service, in an associative array
 * @param {String} [sMethod=GET] - type of call: GET or POST
 * @param {String} [sResponseDataType=xml] - type of data that you're expecting back from the server
 * @param {Function} [fnCallback=null] - function to call as a callback after the service has sent a response
 * @param {Array} [oExtraParams=null] - additional ajax parameters, if needed
 * @param {Function} [fnErrorHandler=null] - Some function to call when an error occurs
 * 
 */
fn.callService = function(sUrl, aParameters, sMethod, sResponseDataType, fnCallback, oExtraParams, fnErrorHandler){
	
	if (sMethod == undefined)
		sMethod = "GET";
	
	if (sResponseDataType == undefined)
		sResponseDataType = "xml";
	
	var ajaxParams = {
		"type": sMethod,
		"url": sUrl,
		"data": aParameters,
	 	"success": function(xml) {
	 		// callback if it is set
	 		if (fnCallback!=null)
	 				fnCallback(xml);
	 		},
		"error": function(jqXHR, textStatus, errorThrown){
			
			if (fnErrorHandler!=null)
				fnErrorHandler({
					"jqXHR": jqXHR, "textStatus": textStatus, "errorThrown": errorThrown, 
					"lexit_function": "fn.callService",
					"sUrl": sUrl, "aParameters": aParameters, "sMethod": sMethod, "sResponseDataType": sResponseDataType
					});
			else
				fn.message("Fout",
				"Fout bij aanroep van fn.callService(): " +				
				textStatus+" "+errorThrown+"; "+getJqXHRInfo(jqXHR));
			}
		}
	
	// if the called url isn't on the same server, we need a cross domain call
	
	if (sUrl.indexOf(document.domain)<0)
		{
		ajaxParams["crossDomain"] = true;
		}
	
	if (sResponseDataType != null)
		{
		ajaxParams["dataType"] = sResponseDataType;
		}
	
	// if some extra parameters were sent, add them to the ajax call
	
	for (oneParam in oExtraParams)
		{
		ajaxParams[oneParam] = oExtraParams[oneParam];
		}
	
	$.ajax( ajaxParams );
};



//*******************************************
//*           EXTRA FUNCTIONS               *
//*******************************************


/**
 * Get the user name of Tomcat user which has logged in.
 * This only workt when 'send_tomcat_username_to_db=true'
 * was set in the project.database configuration file
 *
 * @returns {String} A user name
 * 
 * @see fn.setCurrentUser
 */
fn.getCurrentUser = function(){
	return USERNAME;
};


/**
 * Get the current project name
 *  
 * @returns {String} A project name
 */
fn.getCurrentProject = function(){
	return getHttpParams().get("db");
};


/**
 * Set the user name (the name of the user who has logged in is normally got from webservice
 * but it is possible to set it here by giving a string, if needed that way)
 *  
 * @param {String} sName - A user name
 * @param {Function} [fnErrorHandler=null] - Some function to call when an error occurs
 * 
 * @see fn.getCurrentUser
 */
fn.setCurrentUser = function(sName, fnErrorHandler){
	
	if (sName != null)
		USERNAME = sName;
	
	var url = WEBSERV_URL+"/table/get_username"; 
	$.ajax( {
		"type": "GET",
		"async": false, // needed to block code execution while awaiting the server response
		"url": url,
		"data": {
			"dummy": getUniqueNumber()
			},
	 	"dataType": "xml", // get response as xml
	 	"success": function(xml) {
	 		// return the user name
	 		USERNAME = fn.getDbResponse(xml);
	 		},
	 	"error": function(jqXHR, textStatus, errorThrown){
	 		
	 		if (fnErrorHandler!=null)
				fnErrorHandler({
					"jqXHR": jqXHR, "textStatus": textStatus, "errorThrown": errorThrown, 
					"lexit_function": "fn.setCurrentUser",
					"sName": sName
					});
			else
				fn.message("Fout", "Bij het aanroepen van fn.setCurrentUser('"+sName+"') is een fout opgetreden: "+
				textStatus+" "+errorThrown+"; "+getJqXHRInfo(jqXHR));
			}
		} );
};


/**
 * Get the current time, with a special format.
 *  
 * @param {String} [sFormat=YYYY-MM-DD HH-MI-SS] - if null, default is applied
 * @returns {String} current time, in specified format
 */
fn.getCurrentTimestamp = function(sFormat){
	
	// default
	if (sFormat == null) 
		sFormat = "YYYY-MM-DD HH-MI-SS";
	
	var d = new Date();
	var day = right("0"+d.getDate(), 2);
	var month = right("0"+ (d.getMonth()+1), 2); // month is 0-based
	var fullyear = right("0000"+d.getFullYear(), 4);
	var halfyear = right(fullyear, 2);
	var hours = right("0"+d.getHours(), 2);
	var minutes = right("0"+d.getMinutes(), 2);
	var seconds = right("0"+d.getSeconds(), 2);
	
	// replace time symbols by their current values
	sFormat = sFormat.replace("YYYY", fullyear, "g");
	sFormat = sFormat.replace("YY", halfyear, "g");
	sFormat = sFormat.replace("MM", month, "g");
	sFormat = sFormat.replace("DD", day, "g");
	
	sFormat = sFormat.replace("HH", hours, "g");
	sFormat = sFormat.replace("MI", minutes, "g");
	sFormat = sFormat.replace("SS", seconds, "g");
	return sFormat;
};


/**
 * Check if the inline edit function (jEditable) is active right now
 * (this might be needed to prevent key events when typing data in an input box)
 *  
 * @returns {Boolean} true if the inline edit function is active, otherwise false
 */
fn.editFunctionIsActiveNow = function(){
	return $("input:focus").elementExists();
};




/**
 * Trigger key strike on a given element
 * @param {Integer} iKeyCode -
 * @param {Node} nElement - Some dom element node
 * @param {Node} [nSubElement=null] - Some dom element node that is part of nElement
 */
fn.triggerKeyStrikeOnElement = function(iKeyCode, nElement, nSubElement){
	
	var e = $.Event('keydown');
	e.which = iKeyCode;
	
	if (typeof nSubElement == 'undefined')
		$(nElement).trigger(e);
	else
		$(nElement).find(nSubElement).trigger(e);
}



// this a subroutine, needed to parse database (server) response if needed
// returns : string
fn.getDbResponse = function(xml){
	
	lastDbResponse = $(xml).find("response").text();	
	return lastDbResponse;
};

// return the last db response (which was stored the last time fn.getDbResponse was called)
// returns : string
var lastDbResponse = null;
fn.getLastDbResponse = function(){
	return lastDbResponse;
};


// check if some function was called with an API instance
// and give an error if it was!
fn._checkApiInstance = function(sFunctionName, oArgument){
	
	if (fx.isApiInstance(oArgument))
		{
		fn.message("Fout", sFunctionName + "('"+fx.getTableName(oArgument)+"') is aangeroepen met een API instance. " +		
				"Dit is niet toegestaan! Gebruik een functie uit de fx-namespace, of vervang de API instance door een node.");
		return;
		}
	
}


fn._checkjQueryObject = function(sFunctionName, oArgument){
	
	if (oArgument instanceof jQuery)
		{
		// get(0) makes sure we get the node out of the jQuery object
		fn.message("Fout", sFunctionName + "('"+fn.getTableName(oArgument.get(0))+"') is aangeroepen met een jQuery object. " +
		"Dit is niet toegestaan! Gebruik een node.");
		return;
		}
}
