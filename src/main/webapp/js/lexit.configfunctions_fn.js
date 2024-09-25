
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
 * @param {String} sFontWeight - Font weight (eg. bold)
 * @see fn.setProjectFont
 */
fn.setProjectTitle = function(sProjectName, sColor, sFontSize, sFontWeight){
	
	// default values
	if (typeof sColor == 'undefined')
		sColor = "#3970b3";
	
	if (typeof sFontWeight == 'undefined')
		sFontWeight = "bold";
	
	if (typeof sFontSize == 'undefined')
		sFontSize = "50px";
	
	// create container if not present yet
	if ( !$("#projectname").find("span").elementExists())
		$("#projectname").append($("<span></span>"));
	
	// set text, color, size, etc
	$("#projectname").find("span")
	.text(sProjectName)
	.css("font-size", sFontSize).css("color", sColor).css("font-weight", sFontWeight);
	
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
 * @see fn.setProjectFont
 */
fn.setBackgroundColor = function(sColor){
	
	$(document).find("body").css("background-color", sColor);
};




/**
 * If some action needs to be performed (eg. to restore a given situation)
 * as soon as a tab regains or looses focus, set a function to do so.
 * This call be cancelled by giving null as a argument
 * 
 * @param {*} fnFunction function to be executed in a tab that regains focus
 */
fn.doAtFocusGain = function(fnFunction){

	fnDoAtFocusGain = fnFunction;
};

fn.doAtFocusLoss = function(fnFunction){

	fnDoAtFocusLoss = fnFunction;
};



/**
 * Tell Lex'it to force exact count for the following table refresh
 * (the default setting is set back to normal immediatelly after the table refresh)
 */
fn.forceExactCount = function(){
	bForceExactCount = true;
};

/**
 * Load a library with extra functions for a given project
 * 
 * @param {String} [sPath=null] - Path to the library (see extra info below)
 * @param {Function} [fnCallback=null] - Function to be called after loading the library
 * @param {Function} [fnErrorHandler=null] - Some function to call when an error occurs
 * 
 * If no path to the library is specified, Lex'it assumes that
 * the library file is called the same as the project file: 
 * 
 * t.i. if the config file of a project is called 'myproject.config.js',
 * Lex'it assumes the library file is called 'myproject.library.js'  
 * and Lex'it will look for it as the very same location as the 
 * project file.
 */
fn.getLibrary = function(sPath, fnCallback, fnErrorHandler){
	
	// Default behaviour, when no pash was specified
	
	// in test mode, we load the file locally, 
	// but on the server we load the file from the 'lexit2_config' folder 
	var sPrefix = (paramsHash.get("test")=='true') ? "" : "../lexit2_config/";
	var sPathToLibrary = sPrefix + paramsHash.get("db") + ".library.js";
	
	// BUT if some path was specified, we'll follow that instead
	if (sPath != null) {
		sPathToLibrary = sPath;
	}
	
	$.getScript(sPathToLibrary)
		.done(function(){
			
			if (fnCallback != null)
				fnCallback();		
		})
		.fail(function(jqXHR, textStatus, errorThrown){
			
			if (fnErrorHandler!=null)
				fnErrorHandler({
					"jqXHR": jqXHR, "textStatus": textStatus, "errorThrown": errorThrown,
					"lexit_function": "fn.getLibrary"
					});
			else
				fn.message(lang.error, lang.error_when_calling+" fn.getLibrary(): " +				
				textStatus+" "+errorThrown+"; "+getJqXHRInfo(jqXHR));
		});
	
};


/**
 * Load a CSS file dynamically
 * 
 * @param {String} [sPath=null] - Path to the library (see extra info below)
 * @param {Function} [fnCallback=null] - Function to be called after loading the library
 * @param {Function} [fnErrorHandler=null] - Some function to call when an error occurs 
 */
fn.getCssFile = function(sPath, fnCallback, fnErrorHandler){

	$.get(sPath)
		.done(function(sCss){

			fn.addCss(sCss);
			
			if (fnCallback != null)
				fnCallback();		
		})
		.fail(function(jqXHR, textStatus, errorThrown){
			
			if (fnErrorHandler!=null)
				fnErrorHandler({
					"jqXHR": jqXHR, "textStatus": textStatus, "errorThrown": errorThrown,
					"lexit_function": "fn.getCssFile"
					});
			else
				fn.message(lang.error, lang.error_when_calling+" fn.getCssFile(): " +				
				textStatus+" "+errorThrown+"; "+getJqXHRInfo(jqXHR));
		});
};


/**
 * Add some CSS definition dynamically
 * 
 * @param {String} sSomeCssCode 
 * @see fn.setProjectFont
 */
fn.addCss = function(sSomeCssCode){
	
	// append styling to document

	// trick: https://stackoverflow.com/questions/524696/how-to-create-a-style-tag-with-javascript
	var docHead = document.head || document.getElementsByTagName('head')[0];
	var style = document.createElement('style');

	docHead.appendChild(style);
	style.type = 'text/css';
	if (style.styleSheet){
		// This is required for IE8 and below.
		style.styleSheet.cssText = sSomeCssCode;
	} 
	else {
		style.appendChild(document.createTextNode(sSomeCssCode));
	}
};


/**
 * set a CSS variable, to be used in calc(...) etc., like in 
 * :root {
 *    --main-padding: 20px;
 *    --sidebar-width: 200px;
 * }
 * @param {String} variable name (without the '--' part, as it is preprended automatically)
 * @param {String} variable value
 */
fn.setCssVariable = function(sVariableName, value) {
	sVariableName = "--"+sVariableName;
	document.documentElement.style.setProperty(sVariableName, value);
};

/**
 * Set the font family and size in whole GUI at once
 * @param {String} sFontFamily 
 * @param {String} sFontSize 
 * @see fn.setProjectTitle
 * @see fn.addCss
 */
fn.setProjectFont = function(sFontFamily, sFontSize){

	fn.addCss("table.display.dataTable thead th {font-family: "+sFontFamily+" !important; font-size: "+sFontSize+" !important;}");
	fn.addCss("table.display.dataTable tbody td {font-family: "+sFontFamily+" !important; font-size: "+sFontSize+" !important;}");
	fn.addCss("div.top div:first-child span {font-family: "+sFontFamily+" !important; font-size: "+sFontSize+" !important;}");
	fn.addCss("div#indicator {font-family: "+sFontFamily+" !important; font-size: "+sFontSize+" !important;}");
	fn.addCss(".dataTables_length {font-family: "+sFontFamily+" !important; font-size: "+sFontSize+" !important;}");
	fn.addCss(".dataTables_info {font-family: "+sFontFamily+" !important; font-size: "+sFontSize+" !important;}");
	fn.addCss(".dataTables_filter > label {font-family: "+sFontFamily+" !important; font-size: "+sFontSize+" !important;}");
	fn.addCss("a.paginate_button {font-family: "+sFontFamily+" !important; font-size: "+sFontSize+" !important;}");
	fn.addCss("div.export_pane a.dt-button {font-family: "+sFontFamily+" !important; font-size: "+sFontSize+" !important;}");
	fn.addCss("div.ui-dialog {font-family: "+sFontFamily+" !important; font-size: "+sFontSize+" !important;}");
	fn.addCss("div.ui-dialog-content {font-family: "+sFontFamily+" !important; font-size: "+sFontSize+" !important;}");
	fn.addCss("button.ui-button {font-family: "+sFontFamily+" !important; font-size: "+sFontSize+" !important;}");
	fn.addCss("#tiptip_content {font-family: "+sFontFamily+" !important; font-size: "+sFontSize+" !important;}");
};


/**
 * Add a balk on top of the screen, just like in any IvdNT website
 * @param {Boolean} bSetting - apply if true, otherwise unapply
 * @pparam {Boolean} bAppendHelp - append the help button if true
 */
fn.setBalk = function(bSetting, bAppendHelp){
	
	if (bAppendHelp == null) bAppendHelp = false;
	
	if (bSetting){
		$("body").removeClass("default").addClass("huisstijl");
		$("#headergroup").removeClass("default").addClass("huisstijl");
		$("#home_logo").removeClass("default").addClass("huisstijl");
		$("#square_logo").removeClass("default").addClass("huisstijl");
		$("#projectname").removeClass("default").addClass("huisstijl");
		$("#indicators").removeClass("default").addClass("huisstijl");
		$("#headerlinks").removeClass("default").addClass("huisstijl");
		
		if (bAppendHelp){
			// assign functions
			setTimeout(function(){
				head.showGeneralHelp();	
			}, 500);
		}
	}
	else {
		$("body").removeClass("huisstijl").removeClass("huisstijl")
		$("#headergroup").removeClass("huisstijl").addClass("default");
		$("#home_logo").removeClass("huisstijl").addClass("default");
		$("#square_logo").removeClass("huisstijl").addClass("default");
		$("#projectname").removeClass("huisstijl").addClass("default");
		$("#indicators").removeClass("huisstijl").addClass("default");
		$("#headerlinks").removeClass("huisstijl").addClass("default");
	}
	
};



// globals for the fn.setSchema() function
var setSchemaNameCache = null;
var setSchemaTimeOut = null;


/**
 * Change the psql search path
 * (the default search path of a project is normally set as schema=... in the .database config file)
 * 
 * @param {String} sNewSchema - new schema to work in
 * @param {Function} [fnCallback=null] - Some function to call after the new schema has been set
 * @param {Function} [fnErrorHandler=null] - Some function to call when an error occurs
 */
fn.setSchema = function(sNewSchema, fnCallback, fnErrorHandler){
	
	var url = WEBSERV_URL+"/api/set_schema"; 
	$.ajax( {
		"type": "GET",
		"url": url,
		"data": {
			"db_name": getHttpParams().get("db"),
			"schema_name": sNewSchema,
			"dummy": getUniqueNumber()
			},
	 	"dataType": "xml", // get response as xml
	 	"success": function(xml) {

			console.log("Lex'it: schema was set to "+sNewSchema);
	 		
	 		// Since the ContextObject (cache) of Lex'it is emptied after a few minutes of inactivity,
			// we might end up with Lex'it addressing the default schema again (t.i. the one set in the .database config file), 
	 		// instead of the schema set in this function.
	 		// So, we need to set a TimeOut with a duration shorter than the ContextObject life duration,
	 		// in such a way that this function is reactivated before the end of the ContextObject life cycle.
	 		// ( about ContextObject life duration, see: java Constants.java, MAX_DB_OBJECT_DURATION )
	 		
	 		// But of course, if the code sets another schema later on,
	 		// we must remove the TimeOut that was set to keep the previously set schema, 
	 		// and set a new TimeOut as final step.
	 		
	 		if (setSchemaTimeOut != null) {
	 			clearTimeout(setSchemaTimeOut);
	 		}
	 		
	 		setSchemaNameCache = sNewSchema;
	 		setSchemaTimeOut = setTimeout(
					function(){
						// BEWARE: the callback must be fired ONLY at the first call of fn.setSchema().
						// Calling it at every TimeOut could cause unexpected behavior to the developers:
						// the developers most probably expect that a schema is set once and for all, 
						// and do not know of the necessity to re-call the function regularly, as this is just
						// a trick to deal with the short life of the ContextObject. As a consequence, the
						// callback given as a parameter is called only at the first round, to meet this 
						// probable expectation (of developers) of the function behavior. 
						fn.setSchema(sNewSchema, null, fnErrorHandler);						
						}, 
					1000*60); 
			
	 		// callback if it is set
	 		if (fnCallback!=null)
	 				fnCallback();
	 	},
		"error": function(jqXHR, textStatus, errorThrown){

			fn.refreshTable(kf.getActiveTable());
			
			if (fnErrorHandler!=null)
				fnErrorHandler({
					"jqXHR": jqXHR, "textStatus": textStatus, "errorThrown": errorThrown,
					"lexit_function": "fn.setSchema",
					"sNewSchema": sNewSchema
					});
			else
				fn.message(lang.error, lang.error_when_calling+ " fn.setSchema("+sNewSchema+"): " +				
				textStatus+" "+errorThrown+"; "+getJqXHRInfo(jqXHR));
		}
	} );
};

/**
 * Get the current schema name
 * (this is to be used to keep track of what was set with fn.setSchema)
 */
fn.getCurrentSchema = function(){
	
	return setSchemaNameCache;	
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
 * Synonym of fn.tableExists
 * 
 * @see fn.tableExists
 */
fn.tableIsOpen = function(sSomeTablename){
	
	return fn.tableExists(sSomeTablename);
		
}


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
	return $("#"+sSomeTablename+" tbody tr:not('.group'):eq(0)").find("td:eq(0)").hasClass("dataTables_empty");
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
 * @see fn.callTable
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
 *  @see fn.callTable
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
		{
			if ($( mixed ).closest('table').length > 0)
				return $( mixed ).closest('table')[0].id;

			// in some rare cases, closest return nothing, don't know why...
			// so here's a rescue operation: extract the table name from the row class name
			var aClassNames = $(fn.getRowNode(mixed)).attr('class').split(" ");
			var aRowClassName = (aClassNames.filter( function(value){return $.endsWith(value, "_row");}));
			var sTableName = aRowClassName[0].replace("_row", "");
			return sTableName;

		}	
	
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
	for (var i=0; i<aSortingSettings.length; i++) {
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
	for (var i=0; i<aSortingSettings.length; i++) {
		var iSortingDir = aSortingSettings[i][1];		
		aSortingDirs.push(iSortingDir);
	}
	
	return aSortingDirs;
};

/**
 * Get the sorting direction of a specified column in a table
 * @param {(String|API-object-instance)} sSomeTablename - Table name or object
 * @param {String} sSortingColumn - name of the sorted column
 * @returns {String} Sorting direction 'asc' or 'desc', or '' if the column is not sorted
 */
fn.getSortingDirectionOf = function(sSomeTablename, sSortingColumn){
	
	if (typeof sSomeTablename == 'object')
		sSomeTablename = fn.getTableName(sSomeTablename);
	
	var aCurrentSortCols = fn.getSortingColumns(sSomeTablename);
	var aCurrentSortDirs = fn.getSortingDirections(sSomeTablename);
	var iCurrentSortColIdx = $.inArray(sSortingColumn, aCurrentSortCols);
	var sCurrentSortDir = aCurrentSortDirs[iCurrentSortColIdx];
	if (sCurrentSortDir == null) sCurrentSortDir = '';
	return sCurrentSortDir; 
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
	for (aOnePair in oSortingColumnsAndDirections) {
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





/**
 * Save current table state
 * 
 * @param {(String|API-object-instance)} sSomeTablename - Table name or object
 */
fn.saveTableState = function(sTableName){
	
	if (typeof sTableName == 'object')
		sTableName = fn.getTableName(sTableName);
	var oTable = mt.getDataTableObjectOf(sTableName);
	
	var oTableState = {};
	
	// Column filters 
	var aFilters = {};
	for ( var i=0, iLen=mt.getListOfColumnsOf(sTableName).length ; i<iLen ; i++ ) {
		var sColumnName = 		mt.getListOfColumnsOf(sTableName)[i];
		var sValue =			fn.getValueOfFilterBox(sTableName, sColumnName);
		if (sValue != null && sValue != '')
			aFilters[sColumnName] = sValue;
	}
	
	// Sorting
	var aSorting = {};
	var aSortColumns = fn.getSortingColumns(sTableName);
	var aSortDirections = fn.getSortingDirections(sTableName);
	if (aSortColumns != null){
		for (var i=0; i<aSortColumns.length; i++) {
			aSorting[ aSortColumns[i] ] = aSortDirections[i];
		}
	}
	
	
	// Save the table state
	
	oTableState["columns"] = aFilters;
	oTableState["sorting"] = aSorting;	
	oTableState["start"] = oTable.page.info().start;
	
	mt.setTableState(sTableName, oTableState);
};

/**
 * Restore the state of some table
 * 
 * @param {(String|API-object-instance)} sSomeTablename - Table name or object
 */
fn.restoreTableState = function(sTableName){
	
	if (typeof sTableName == 'object')
		sTableName = fn.getTableName(sTableName);
	var oTable = mt.getDataTableObjectOf(sTableName);
	
	// Read the saved table state
	var oTableState = mt.getTableState(sTableName);
	if (oTableState == null) return;
	
	aFilters = oTableState["columns"];
	
	// first empty the filters
	oTable.resetSearchFilters();
	
	// sorting 
	fn.setSorting(sTableName, oTableState["sorting"]);
	
	// Restore the column filters
	for ( var i=0, iLen=mt.getListOfColumnsOf(sTableName).length ; i<iLen ; i++ ) {
		var sColumnName = 		mt.getListOfColumnsOf(sTableName)[i];
		
		if (typeof aFilters[sColumnName] != 'undefined' && aFilters[sColumnName] != '') {
			// restore per column
			oTable.columns(i).search( aFilters[sColumnName] );
			
			// put values into filter boxes
			fn.putDataIntoFilterBox(sTableName, sColumnName, aFilters[sColumnName]);
		}
	}	
	
	var iPageNumber = parseInt(oTableState["start"]);
	
	// add a callback which will lead to the saved page number
	oTable.addDrawCallback(sTableName, function(){
		
		$(document.body).delay(500).queue(
				function(){
					// remove callback, as we don't want to end up in an infinite loop!
					oTable.addDrawCallback(sTableName, function(){});
					
					// go to the saved page
					oTable.displayRow( iPageNumber ).draw(false);
					
					$(this).dequeue();
				});
		
	});
	
	// restore the table state now!
	oTable.draw();

};



/**
 * Determine if a table if editable 
 * 
 * @param {String} sTableName
 * @returns {boolean} true if table is editable
 * 
 * @see conf.tableIsEditable
 */
fn.tableIsEditable = function(sTableName){

	if (typeof sTableName == 'object')
		sTableName = fn.getTableName(sTableName);

	return conf.tableIsEditable(sTableName);

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
 * @see fn.callTable
 */
fn.callDatabase = function(sSomeTablename, aContentToMatch, fnFunction, oExtraSettings){
	
	// make sure sSomeTablename contains a string
	if (typeof sSomeTablename == 'object')
		sSomeTablename = fn.getTableName(sSomeTablename);
	
	// Save current table state, in such a way that one can restore it after this call
	if (fn.tableExists(sSomeTablename))
		fn.saveTableState(sSomeTablename);
	
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
    else {
		// reload the list of tables (might be needed when fn.setSchema was called)
		ts.reinit();
		ts.getListOfTables(null, "", "");
		
        setTimeout(function(){
        	
        	fn.callDatabase(sSomeTablename, aContentToMatch, fnFunction, oExtraSettings);
        	
        }, 250);
    }
	
};

/**
 * Synonym of fn.callDatabase
 * 
 * @see fn.callDatabase
 */
fn.callTable = function(sSomeTablename, aContentToMatch, fnFunction, oExtraSettings){
	fn.callDatabase(sSomeTablename, aContentToMatch, fnFunction, oExtraSettings);
};


// subroutine of fn.callDatabase
fn._callDatabase = function(sSomeTablename, aContentToMatch, fnFunction, oExtraSettings){

	// check possible pre-init function for existence
	var aTableSettings = conf.getTableSettings(sSomeTablename);
	var fnPreInit = conf.getPreInitCallback(aTableSettings);

	var bTableAlreadyLoaded = fn.tableExists(sSomeTablename);

	
	// If pre-init function does exist, make sure it's executed before calling the table
	if ( !bTableAlreadyLoaded && fnPreInit != null ){


		// N.B. executing fnPreInit with a DataTables object would be the right (default) choice,
		// but we can't since the table wasn't created yet. So we use the table name instead.

		// trick: https://stackoverflow.com/questions/7691762/how-to-add-a-callback-to-a-function-in-javascript
		$.when($.ajax(fnPreInit(sSomeTablename))).then(function () {

			fn._callDatabaseSub(sSomeTablename, aContentToMatch, fnFunction, oExtraSettings);

		});

	}

	// if the pre-init function was dealt with already, carry on with calling the table
	else {
		fn._callDatabaseSub(sSomeTablename, aContentToMatch, fnFunction, oExtraSettings);
	}
};


fn._callDatabaseSub = function(sSomeTablename, aContentToMatch, fnFunction, oExtraSettings){

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
	else {		
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
 * Call a table silently, meaning that it won't be shown, but all its details will be loaded
 * into the multiple table registry, so as to be able to retrieve these details if needed elsewhere!
 * (It is, for example, sometimes convenient to known which columns a table consists of, even if it hasn't been loaded yet) 
 */
fn.callTableSilently = function(sSomeTablename){
	
	var aTableSettings = conf.getTableSettings(sSomeTablename);
	var fnPreInit = conf.getPreInitCallback(aTableSettings);
	var bTableAlreadyLoaded = fn.tableExists(sSomeTablename);
	if ( !bTableAlreadyLoaded && fnPreInit != null ){
		$.when($.ajax(fnPreInit(sSomeTablename))).then(function () {
	
			fn._callTableSilentlySub(sSomeTablename);
	
		});
	}
	else {
			fn._callTableSilentlySub(sSomeTablename);
	}
};

// help function of fn.callTableSilently
fn._callTableSilentlySub = function(sSomeTableName){

	var url = WEBSERV_URL+"/api/getcolumns";
	
	$.ajax({
		type: "GET",
		url: url,
		data: {
			"table": sSomeTableName, 
			"db_name": getHttpParams().get("db") 
		},
		dataType: "xml",
		contentType: "application/x-www-form-urlencoded;charset=UTF-8",
		success: function(xml) {
			td.processColumnResponse(xml, sSomeTableName, function(){}, {},
			
				// secret callback (officially not available in API) 
				function(){fn._callTableBuildSilently(sSomeTableName);}
			)
		},
		error: function(jqXHR, textStatus, errorThrown){
			fn.message(lang.error_occurred_in_table+ " '"+sSomeTableName+"'", lang.loading_xml_failed+ ": "+textStatus+" "+errorThrown);
		}
	});
};

// help function of fn._callTableSilentlySub
fn._callTableBuildSilently = function(sSomeTableName){

	var aTableSettings =				conf.getTableSettings(sSomeTableName);	
	var sViewtype = (aTableSettings!=null ? conf.getViewtype(aTableSettings) : "table");
	mt.setViewType(sSomeTableName, sViewtype);	
	//mt.setTableType(sSomeTableName, asTableTypes[$.inArray(sSomeTableName, asTableNames)]);
	un.cleanUndoStack(sSomeTableName);	
	tb.setColumnProperties(sSomeTableName, true);
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
	
	for (var sOneKey in aContentToMatch) {
		sUrl += "&"+sOneKey+"="+aContentToMatch[sOneKey];
	}
	for (var sOneKey in oExtraSettings) {
		sUrl += "&"+"setting."+sOneKey+"="+oExtraSettings[sOneKey];
	}
	window.open( encodeURI(sUrl), '_blank');
};

/**
 * Synonym of fn.callDatabaseInNewTab
 *  
 * @see fn.callDatabaseInNewTab 
 */
fn.callTableInNewTab = function(sSomeTablename, aContentToMatch, oExtraSettings, sProjectName){
	fn.callDatabaseInNewTab(sSomeTablename, aContentToMatch, oExtraSettings, sProjectName);
};


// get base url of the software (help function of fn.callDatabaseInNewTab)
fn._getBaseUrl = function(){
	var url = document.URL;
	var base = url.substring(0, url.indexOf("?db="));
	return base;
};



/**
 * Change the visibility of the columns of a table 
 * and redraw the table accordingly
 * 
 * @param {(String|API-object-instance)} sSomeTablename - Table name or object
 * @param {Array} - List of columns that have to be visible (the remaining columns will be invisible)
 * @param {Function} [fnFunction=null] - A function to be called once the table has been redrawn
 * @param {TableSettingsArray} [oExtraSettings=null] - An associative array containing some extra settings for the table to be redrawn
 */
fn.changeTableColumnsVisibility = function(sSomeTablename, aListOfVisibleColumns, fnFunction, oExtraSettings){
	
	// BEWARE: during tests it appeared that this function do not work properly when a users changed the column visibility manually
	
	if (typeof sSomeTablename == 'object')
		sSomeTablename = fn.getTableName(sSomeTablename);
	
	// get list of columns
	var aAllColumns = mt.getListOfColumnsOf(sSomeTablename);
	
	// set the columns visibility		
	for (var i=0; i<aAllColumns.length; i++) {
		var sColName = aAllColumns[i];
		var bVisible = $.inArray(sColName, aListOfVisibleColumns)>-1;
		conf.changeTableConfigValue(sSomeTablename, sColName, "visible", bVisible);	
	}
	
	// save position etc, so as to be able to put table back at same position
	var iCurrentLeft =		$("#"+sSomeTablename+"_dynamic").offset().left;
	var iCurrentTop = 		$("#"+sSomeTablename+"_dynamic").offset().top;
	var iTableWidth = 		$("#"+sSomeTablename+"_dynamic").css("width");
	var sViewtype = 		fn.getViewType(sSomeTablename);
	var iDisplayLength =	fn.getCurrentDisplayLength(sSomeTablename);
	var iRecordNumberToStartAt = parseInt(fn.getCurrentDisplayStart(sSomeTablename));	
	var aSortingSettings = 	mt.getDataTableObjectOf(sSomeTablename).order();
	
	// read current filters so we can re-apply those
	var oFilterSettings = mt.getDataTableObjectOf(sSomeTablename).getSearchFilters();	
	
	// we want to be able to put the table back at the very same place
	var oExtraSettingsBase = {
			"top": iCurrentTop, 
			"left": iCurrentLeft,
			"displaylength": iDisplayLength
	};	
	// add custom extra settings
	if (oExtraSettings != null) {
		for (sSettingName in oExtraSettings) {
			oExtraSettingsBase[sSettingName] = oExtraSettings[sSettingName];
		}
	}	
	
	tb.destroyTable(sSomeTablename, function(){
		
		fn.callDatabase(sSomeTablename, 
				oFilterSettings,		// re-apply the filters 
				function(){
			
					// small delay needed otherwise this will be fired too early and the following won't work
					$("#"+sSomeTablename).delay(200).queue(function(){
						
						// restore sorting settings
						if (aSortingSettings.length==0) 
							mt.getDataTableObjectOf(sSomeTablename).order.neutral();
						else
							mt.getDataTableObjectOf(sSomeTablename).order(aSortingSettings);
						
						// put table back at same page
						mt.getDataTableObjectOf(sSomeTablename)
							.displayRow(iRecordNumberToStartAt)
							.draw(false);
						
						// callback if available
						if (fnFunction!= null)
							fnFunction();
						
					});					
					
				}, 
				oExtraSettingsBase
		);
	});
		
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
	if (oConfiguration == null)	oConfiguration = {};
	if (oSettings == null)	oSettings = {};
	
	
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
 * Determine if a table is uploaded (t.i. as a CSV/XLS file or so)
 *
 * @param {(String|API-object-instance)} sSomeTablename - Table name or object
 * @returns {boolean} true if the table wass uploaded
 */
fn.tableIsUploaded = function(sSomeTablename){

	if (typeof sSomeTablename == 'object')
		sSomeTablename = fn.getTableName(sSomeTablename);

	var aTabbleDetails = mt.getAvailableTableDetails(sSomeTablename);
	return (aTabbleDetails != null && aTabbleDetails[2].indexOf("_UPLOADED_")>-1);
}


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

	if ( fn.tableExists(sSomeTablename) ) {
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
	var url = WEBSERV_URL+"/api/cleancache"; 
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
				fn.message(lang.error, lang.error_when_calling+ " fn.cleanTableCache("+sSomeTablename+"): " +				
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
 * Scroll to a table if it happens to be outside the visible window. 
 * Most of the time, tables are piled up on top of each other, so some tables are not visible. 
 * If some tables applied some left-padding or so, this function will not only scroll vertically, 
 * but also a bit horizontally; that can be prevented by setting the bVerticalOnly param to true.
 * 
 * @param {(String|API-object-instance)} sSomeTablename - Table name or object
 * @param {boolean} [bVerticalOnly=false] - set to true if you want to prevent horizontal scrolling   
 */
fn.scrollToTable = function(sSomeTablename, bVerticalOnly){
	
	if (typeof sSomeTablename == 'object')
		sSomeTablename = fn.getTableName(sSomeTablename);
	
	smoothScroll("html,body", "#"+sSomeTablename+"_dynamic", bVerticalOnly);
};



/**
 * Put a table to the right side of another table (alignment)
 * 
 * @param {(String|API-object-instance)} sSomeTablename1 - Table name 
 * @param {(String|API-object-instance)} sSomeTablename2 - Table name 
 * @param {Function} fnCallback - Some function to call after the tables have been aligned
 * 
 * @see fn.pileupTables, fn.centerTable, fn.putTableAtPosition
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
 * @param {(String|API-object-instance)} sSomeTablename1 - Table name 
 * @param {(String|API-object-instance)} sSomeTablename2 - Table name 
 * @param {Function} fnCallback - Some function to call after the tables have been aligned
 * 
 * @see fn.alignTables, fn.centerTable, fn.putTableAtPosition
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
 * Center a table horizontally
 * 
 * @param {(String|API-object-instance)} sSomeTablename  - Table name 
 * 
 * @see fn.alignTables, fn.pileupTables, fn.putTableAtPosition
 */
fn.centerTable = function(sSomeTablename){
	
	if (typeof sSomeTablename == 'object')
		sSomeTablename = fn.getTableName(sSomeTablename);
	
	// center

	$("#"+sSomeTablename+"_dynamic")
		.css("left", "50%")
		.css("display", "block")
		.css("transform", "translate(-50%, 0)");


	// get rid of some settings
	// causing buttons etc to be misplaced

	$("#"+sSomeTablename+"_dynamic")
		.css("margin", "unset");
	
	$("#"+sSomeTablename+"_filter")
		.css("width", "unset");
	$("#"+sSomeTablename+"_paginate")
		.css("width", "unset");

	$("#"+sSomeTablename+"_wrapper .bottom_pane")
		.css("width", "unset");
	$("#"+sSomeTablename+"_wrapper .bottom_pane .dataTables_paginate.paging_full_numbers")
		.css("width", "unset");
}


/**
 * Position a table at a given absolute position
 * @param {(String|API-object-instance)} sSomeTableName  - Table name
 * @param {number} aXPos - array [x,y] with x,y being the screen absolute positions
 * 
 * @see fn.alignTables, fn.pileupTables, fn.centerTable
 */
fn.putTableAtPosition = function(sSomeTableName, aPos){
	
	if (typeof sSomeTableName == 'object')
		sSomeTableName = fn.getTableName(sSomeTableName);
		
	var iXPos = aPos[0];
	var iYPos = aPos[1]
	
	$("#"+sSomeTableName+"_dynamic")
		.css("position", "absolute")
		.css("top", iYPos)
		.css("left", iXPos);	
}


/**
 * Put a table in front of anything else
 * @param {(String|API-object-instance)} sSomeTableName  - Table name 
 */
fn.putTableInFront = function(sSomeTableName){
	
	if (typeof sSomeTableName == 'object')
		sSomeTableName = fn.getTableName(sSomeTableName);
		
	$("#"+sSomeTableName+"_dynamic").putInFront();
}


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
 * @param {Function} fnCallback - Some function to call after the table is closed 
 */
fn.closeTable = function(sSomeTablename, fnCallback){
	if (typeof sSomeTablename == 'object')
		sSomeTablename = fn.getTableName(sSomeTablename);
	$("#"+sSomeTablename+"_wrapper div.top div#"+sSomeTablename+"_tableclosebutton button").click();
	
	if (fnCallback != null)
		fnCallback();
};


/**
 * Close all tables
 * @param {Function} fnCallback - Some function to call after the tables are closed 
 */
fn.closeAllTables = function(fnCallback){
	
	const queue = new FunctionQueue();
	
	var aTables = $("div#container div#dynamic div.table_div");				
	$(aTables).each(function() {
		var that = this;
		queue.enQueue(function(){			
			$(that).find("div[id$='tableclosebutton']").find("button").click(); // close button
		});
	});
	
	if (fnCallback != null){
		queue.enQueue(function(){			
			fnCallback();
		});		
	}	
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
};

/**
 * Toggle the viewtype of a table (form vs table view)
 * @param {(String|API-object-instance)} sSomeTablename - Table name or object
 * @param {Function} fnCallback - Some function to call after the viewtype has been toggled
 */
fn.toggleViewType = function(sSomeTablename, fnCallback){
	
	if (typeof sSomeTablename == 'object')
		sSomeTablename = fn.getTableName(sSomeTablename);
	
	if (fnCallback != null){
		fn.addDrawCallback(sSomeTablename, function(){
			fnCallback();
		});
	}	
	
	// do the toggle 
	head._toggleViewType(sSomeTablename);
	
};


/**
 * Change the table name in the header. 
 * Beware: this function is only about modifying the title element rendered in the table header, from the moment this function 
 * is called until the table is closed. 
 * This means that if the table is closed and then reopened, the table will regain the name stated in the configuration.
 * If you need to change the name in the configuration (which will have long term effect),
 * use this command instead: conf.changeTableSettingValue(sTableName, "nice_name", sNameToBeShown); 
 * @param {(String|API-object-instance)} sSomeTablename - Table name or object
 * @param {String} sNameToBeShown - the name to be put into the header, instead of the name stated in the configuration
 */
fn.setTableNameInHeader = function(sSomeTablename, sNameToBeShown){
	$("#"+sSomeTablename+"_wrapper").find("span#"+sSomeTablename+"_tablename").text(sNameToBeShown);
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
 * 
 * @see fn.getRowNodeNumberOnScreen
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
 * 
 * @see fn.getRowNodeIndex
 */
fn.getRowNodeNumberOnScreen = function(nRow){
	
	fn._checkApiInstance("fn.getRowNodeNumberOnScreen", nRow);
	fn._checkjQueryObject("fn.getRowNodeNumberOnScreen", nRow);

	var aRows = $(nRow).closest("tbody").find("tr:not('.group')");
	return aRows.index(nRow);
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
	for (sFieldName in aFieldsAndValues) {
		if ($.inArray(sFieldName, mt.getListOfColumnsOf(sTableName)) < 0) {
			fn.message(lang.error, lang.error_when_calling+ " fn.getRowNodeWhere("+sTableName+"). " + lang.error_column_doesnot_exist+": '"+sFieldName+"'");			
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
	
	if (bOnlyFirstRow) {
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
	$('#'+sSomeTable+' tbody').find("tr:not('.group')").removeClass('selected');
	
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
	$("#"+sSomeTable+" tbody tr:not('.group')").each(function(){
		if ( !$(this).hasClass("selected"))
			$(this).toggleClass('selected');
	});
};



/**
 * Manually select a row, given its node or its row number on screen
 * 
 * @param {(String|API-object-instance|Node)} sSomeTable - Table name or object, or row node
 * @param {Integer} iRowNumber - A row number within the current display range (0-9 or such); not needed if node was given as 1st parameter
 */
fn.selectRowNode = function(sSomeTable, iRowNumber){

	// special case: if 1st parameter is a node
	if (iRowNumber == null && fn.isRowNode(sSomeTable)) {
		if (!$(sSomeTable).hasClass("selected"))
			$(sSomeTable).toggleClass('selected');
	}
	
	// otherwise Table name or object
	if (typeof sSomeTable == 'object')
		sSomeTable = fn.getTableName(sSomeTable);
	
	// NOTE the operation is performed onto the node
	var nRowSelector = $("#"+sSomeTable+" tbody tr:not('.group'):eq("+iRowNumber+")");
	if ( iRowNumber>=0 && !nRowSelector.hasClass("selected")) {
		nRowSelector.toggleClass('selected');
	}
	else if (iRowNumber<0) {
		fn.message(lang.error, lang.error_when_calling+ " fn.selectRowNode("+sSomeTable+"). <BR>" +
				lang.error_function_called_with_illegal_value+ ": "+iRowNumber);
	};
};




/**
 * Manually unselect a row, given its node or its row number on screen
 * 
 * @param {(String|API-object-instance|Node)} sSomeTable - Table name or object
 * @param {Integer} iRowNumber - A row number within the current display range (0-9 or such); not needed if node was given as 1st parameter
 */
fn.unselectRowNode = function(sSomeTable, iRowNumber){

	// special case: if 1st parameter is a node
	if (iRowNumber == null && fn.isRowNode(sSomeTable)) {
		if ($(sSomeTable).hasClass("selected"))
			$(sSomeTable).toggleClass('selected');
	}
	
	// otherwise Table name or object
	if (typeof sSomeTable == 'object')
		sSomeTable = fn.getTableName(sSomeTable);
	
	// NOTE the operation is performed onto the node
	var nRowSelector = $("#"+sSomeTable+" tbody tr:not('.group'):eq("+iRowNumber+")");
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
 * Get the first row node of a table
 * 
 * @param {(String|API-object-instance)} someTable - Table name or object
 * @returns {Node} A row node
 */
fn.getFirstRowNodeFrom = function(someTable){

	return fx.getFirstRowFrom(someTable).node();
};


/**
 * Get the first selected row node from a user rows selection
 * 
 * @param {(String|API-object-instance)} someTable - Table name or object
 * @returns {Node} A row node
 */
fn.getFirstSelectedRowNodeFrom = function(someTable){
	
	return fx.getFirstSelectedRowFrom(someTable).node();
};


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
		
	if (kf.getActiveTable() != sSomeTable) {
		var oFirstSelectedRow =	fx.getFirstSelectedRowFrom(sSomeTable);
		var aAllRows = 			fx.getAllRows(sSomeTable);
		
		// There is no active node in a table which hasn't focus!
		// So: pick the first selected row, 
		// else if there is no selected row, pick the top row
		// else if table is empty, return null
		
		if ( oFirstSelectedRow.any() ) {
			return oFirstSelectedRow.node();
		}
		else if ( aAllRows.any() ) {
			return mt.getDataTableObjectOf(sSomeTable).row(0).node();
		}
		else {
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
 * @param {String} sColumnName - A column name
 * @returns {Node} A cell node (or null if function failed)
 */
fn.getCellInRowNode = function(nRow, sColumnName){
	
	fn._checkApiInstance("fn.getCellInRowNode", nRow);
	fn._checkjQueryObject("fn.getCellInRowNode", nRow);
	
	if ( !fn.isRowNode(nRow) ) {
		fn.message(lang.beware, 
				lang.error_when_calling+ " fn.getCellInRowNode("+ fn.getTableName(nRow)+").<BR>"+ 
				lang.error_function_called_with_illegal_value+". "+
				lang.error_function_called_with_illegal_value_input+ ": cell node. " +
				lang.error_function_called_with_illegal_value_expected+ ": row node.");
		return null;
	}
	else {
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
	if (typeof sColumnName != 'undefined') {
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
	
	for (var i=0; i<aListOfColumns.length; i++) {
		// get the the setting of the checkbox
		var sColumnName =			aListOfColumns[i];			
		var iVisibleColumnNumber =	fn.getVisibleColumnNumberOf(oTable, sColumnName);
		
		var nCell = $("#"+sTable+" tbody tr:not('.group')").eq(iRowNumber)
			.find("td").eq(iVisibleColumnNumber)
			.find("input").eq(0);
		// prop is the most reliable 
		// (see: http://jquery-howto.blogspot.nl/2013/02/jquery-test-check-if-checkbox-checked.html)
		var bSetting = (nCell.prop("checked") == true);
		
		// if checkbox is checked, uncheck it! 
		if (bSetting) {			
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
	
	return $(nMixed).is("tr:not('.group')");
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
	
	if (  !fn.isCellNode(nCell) ) {
		fn.message(lang.error, lang.error_when_calling+ " fn.getDataFromSiblingNode("+sTable+").<BR>"+ 
				lang.error_function_called_with_illegal_value+". "+
				lang.error_function_called_with_illegal_value_input+ ": row node. " +
				lang.error_function_called_with_illegal_value_expected+ ": cell node.");
		return "";		
	}
	else if (colNr<0) {
		fn.message(lang.error, lang.error_when_calling+ " fn.getDataFromSiblingNode("+sTable+").<BR>" +
				lang.error_function_called_with_illegal_value+". "+
				lang.error_function_called_with_illegal_value_input+ ": '"+ sOtherColumnName+"'.");
		return "";
	}
	else {
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
 * 
 * @see fn.getCheckboxValue
 */
fn.getDataFromCellNode = function(nCell){
	
	fn._checkApiInstance("fn.getDataFromCellNode", nCell);
	fn._checkjQueryObject("fn.getDataFromCellNode", nCell);
	
	if (fn.isRowNode(nCell))
		{
		fn.message(lang.error, 
				lang.error_when_calling+ " fn.getDataFromCellNode("+fn.getTableName(nCell)+").<BR>" +
				lang.error_function_called_with_illegal_value+". "+
				lang.error_function_called_with_illegal_value_input+ ": row node. " +
				lang.error_function_called_with_illegal_value_expected+ ": cell node.");
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
	
	if (fn.isCellNode(nRow)) {
		fn.message(lang.error, 
				lang.error_when_calling+ " fn.getDataFromCellInRowNode("+fn.getTableName(nRow)+").<BR>" +
				lang.error_function_called_with_illegal_value+". "+
				lang.error_function_called_with_illegal_value_input+ ": cell node. " +
				lang.error_function_called_with_illegal_value_expected+ ": row node.");
		return;
	}
	
	var sTable = fn.getTableName(nRow);
	var oTable = mt.getDataTableObjectOf(sTable);
	
	// get column number given column name	
	var colNr = $.inArray(sColumnName, mt.getListOfColumnsOf(sTable));
	
	if (colNr<0) {
		fn.message(lang.error, lang.error_when_calling+" fn.getDataFromCellInRowNode("+sTable+").<BR>" +
				lang.error_function_called_with_illegal_value+". "+
				lang.error_function_called_with_illegal_value_input+": '"+ sColumnName+"'.");
		
		return "";
	}
	else {
		var oRowData = oTable.row( nRow ).data();
		
		// data can return an object or an array
		return (typeof oRowData == 'object') ?
			oRowData[sColumnName] : oRowData[colNr];
	}	
	
};



/**
 * Get the content of a whole column, given its name
 * 
 * @param {String} sSomeTable - A table name or object
 * @param {String} sColumnName - Name of a column 
 * @returns {String[]} Content of the cells of the column
 * 
 * @see fn.getDataFromRowNode
 */
fn.getDataFromColumn = function(sSomeTable, sColumnName){	
	
	var oTable = ( typeof sSomeTable == 'string' ? mt.getDataTableObjectOf(sSomeTable) : sSomeTable );
	
	// special column selector: https://datatables.net/reference/type/column-selector
	return oTable.column( sColumnName+':name' ).data().toArray();	
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

	if ( !fn.isRowNode(nRow) ){
		fn.message(lang.error, 
				lang.error_when_calling+" fn.getDataFromRowNode("+fn.getTableName(nRow)+").<BR>" +
				lang.error_function_called_with_illegal_value+". "+
				lang.error_function_called_with_illegal_value_expected+ ": row node.");
		return;
	}
	
	var sTable = fn.getTableName(nRow);
	var oTable = mt.getDataTableObjectOf(sTable);
		
	return oTable.row(nRow).data();
};



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
    var sel, range, priorRange, fulltext = "", text = "";
    
    // all browsers, except IE before version 9
    if (typeof window.getSelection != "undefined" && window.getSelection().rangeCount > 0) 
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
            (sel = document.selection).type != "Control")  {
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
	
	// NB:
	// This function appeared to malfunction in FF
	// when right-clicking.
	// If needed in the future, some solution is provided here:
	//
	// https://stackoverflow.com/questions/43571090/detect-which-word-has-been-right-clicked-on-within-a-text
	
	fn._checkApiInstance("fn.getWordClickedUponInNode", nMixed);
	fn._checkjQueryObject("fn.getWordClickedUponInNode", nMixed);
	
	var nCell = (typeof sColumnName != 'undefined') ?
			fn.getCellInRowNode(nMixed, sColumnName) : nMixed;
	
	var start = 0, end = 0;
    var sel, range, priorRange, wholeRange, fulltext = "", text = "";
    
    // all browsers, except IE before version 9
    if (typeof window.getSelection != "undefined" && window.getSelection().rangeCount > 0) 
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
            (sel = document.selection).type != "Control")  {
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


/**
 * Read the value of a checkbox cell in a reliable way
 * 
 * @param {Node} nCell - A cell node containing a checkbox 
 * @returns {Boolean} the checkbox value
 * 
 * @see fn.getDataFromCellNode
 */
fn.getCheckboxValue = function(nCell){
	
	fn._checkApiInstance("fn.getDataFromCellNode", nCell);
	fn._checkjQueryObject("fn.getDataFromCellNode", nCell);
	
	return $(nCell).find("input").eq(0).prop("checked");
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
	
	if ( fn.isCellNode(nRow) ){
		fn.message(lang.error, 
				lang.error_when_calling+ " fn.putDataIntoCellNode("+sTable+").<BR>"+
				lang.error_function_called_with_illegal_value+". "+
				lang.error_function_called_with_illegal_value_input+ ": cell node. " +
				lang.error_function_called_with_illegal_value_expected+ ": row node.");
		return;
	}
	
	var sNodeId = fn.getRowNodeId(nRow);
	
	if (typeof sNodeId == 'undefined' || $.trim(sNodeId) == '') {
		fn.message(lang.error,
				lang.error_when_calling+ " fn.putDataIntoCellNode("+sTable+").<BR>"+ 
				lang.error_table_has_no_row_ids);
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
 * 
 * @see fn.updateTableGivenANode
 */
fn.updateDatabaseGivenANode = function(nMixed, aColumnNamesAndValues, fnCallback, fnErrorHandler){
	
	fn._checkApiInstance("fn.updateDatabaseGivenANode", nMixed);
	fn._checkjQueryObject("fn.updateDatabaseGivenANode", nMixed);
	
	var sTable = fn.getTableName(nMixed);
	var oTable = mt.getDataTableObjectOf(sTable);
		
	var sNodeId = fn.getRowNodeId(nMixed);	
	if (typeof sNodeId == 'undefined' || $.trim(sNodeId) == ''){
		fn.message(lang.error,
				lang.error_when_calling+ " fn.updateDatabaseGivenANode("+sTable+").<BR>"+ 
				lang.error_table_has_no_row_ids);
		return;
	}
	
	
	// convert associative array into separate arrays of column names and values
	var aColumnNames = new Array();
	var aColumnValues = new Array();
	
	for (var sFieldName in aColumnNamesAndValues){
		aColumnNames.push(sFieldName);
		aColumnValues.push(aColumnNamesAndValues[sFieldName]);
	}
	
	
	// update the database
	var url = WEBSERV_URL+"/api/setvalue"; 
	
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
				fn.message(lang.error, 
				lang.error_when_calling+ " fn.updateDatabaseGivenANode("+sTable+"): "+
				textStatus+" "+errorThrown+"; "+getJqXHRInfo(jqXHR));
			}
		} );		

};

/**
 * Synonym of fn.updateDatabaseGivenANode
 * 
 * @see fn.updateDatabaseGivenANode
 */
fn.updateTableGivenANode = function(nMixed, aColumnNamesAndValues, fnCallback, fnErrorHandler){
	fn.updateDatabaseGivenANode(nMixed, aColumnNamesAndValues, fnCallback, fnErrorHandler);
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
	
	
	for (var sFieldName in aFieldsAndValuesToMatch) {
		aColNamesToMatch.push(sFieldName);
		aValuesToMatch.push(aFieldsAndValuesToMatch[sFieldName]);
	}
	for (var sFieldName in aFieldsAndValuesToUpdate) {
		aColNamesToUpdate.push(sFieldName);
		aValuesToUpdate.push(aFieldsAndValuesToUpdate[sFieldName]);
	}
	
	// update the database
	var url = WEBSERV_URL+"/api/setvalue_without_id"; 
	
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
				fn.message(lang.error, 
	 			lang.error_when_calling+ " fn.updateDatabaseGivenFieldValues("+sSomeTablename+"): "+
				textStatus+" "+errorThrown+"; "+getJqXHRInfo(jqXHR));
			}
		} );
};


/**
 * Synonym of fn.updateDatabaseGivenFieldValues
 * 
 * @see fn.updateDatabaseGivenFieldValues
 */
fn.updateTableGivenFieldValues = function(sSomeTablename, aFieldsAndValuesToMatch, aFieldsAndValuesToUpdate, fnCallback, fnErrorHandler){
	fn.updateDatabaseGivenFieldValues(sSomeTablename, aFieldsAndValuesToMatch, aFieldsAndValuesToUpdate, fnCallback, fnErrorHandler);
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
 * 
 * @see fn.insertIntoTable
 */
fn.insertIntoDatabase = function(sSomeTablename, aFieldsAndValuesToAdd, returnField, fnCallback, fnErrorHandler){
	
	if (typeof sSomeTablename == 'object')
		sSomeTablename = fn.getTableName(sSomeTablename);
	
	var aColNamesToAdd = new Array();
	var aValuesToAdd = new Array();	
	
	for (var sFieldName in aFieldsAndValuesToAdd) {
		aColNamesToAdd.push(sFieldName);
		aValuesToAdd.push(aFieldsAndValuesToAdd[sFieldName]);
	}
	
	// insert record into the database
	var url = WEBSERV_URL+"/api/insertvalue"; 
	
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
				fn.message(lang.error, 
	 			lang.error_when_calling+ " fn.insertIntoDatabase("+sSomeTablename+"): "+
				textStatus+" "+errorThrown+"; "+getJqXHRInfo(jqXHR));
			}
		} );
};

/**
 * Synonym of fn.insertIntoDatabase
 * 
 * @see fn.insertIntoDatabase
 */
fn.insertIntoTable = function(sSomeTablename, aFieldsAndValuesToAdd, returnField, fnCallback, fnErrorHandler){
	fn.insertIntoDatabase(sSomeTablename, aFieldsAndValuesToAdd, returnField, fnCallback, fnErrorHandler);
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
	var url = WEBSERV_URL+"/api/duplicaterecord"; 
	
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
				fn.message(lang.error, 
	 			lang.error_when_calling+ " fn.duplicateRecord("+sSomeTablename+"): "+
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
 * 
 * @see fn.getIdFromTable
 * @see fn.getIdOfRecord
 */
fn.getIdFromDatabase = function(sSomeTablename, aFieldsAndValues, fnCallback, fnErrorHandler){
	
	if (typeof sSomeTablename == 'object')
		sSomeTablename = fn.getTableName(sSomeTablename);
	
	var aColNamesToMatch = new Array();
	var aValuesToMatch = new Array();	
	
	for (var sFieldName in aFieldsAndValues) {
		aColNamesToMatch.push(sFieldName);
		aValuesToMatch.push(aFieldsAndValues[sFieldName]);
	}
	
	// insert record into the database
	var url = WEBSERV_URL+"/api/get_id_of_record"; 
	
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
				fn.message(lang.error, 
	 				lang.error_when_calling+" fn.getIdFromDatabase("+sSomeTablename+"): "+
				textStatus+" "+errorThrown+"; "+getJqXHRInfo(jqXHR));
			}
		} );
};


/**
 * Synonym of fn.getIdFromDatabase
 * 
 * @see fn.getIdFromDatabase
 * @see fn.getIdOfRecord
 */
fn.getIdFromTable = function(sSomeTablename, aFieldsAndValues, fnCallback, fnErrorHandler){
	fn.getIdFromDatabase(sSomeTablename, aFieldsAndValues, fnCallback, fnErrorHandler);
};

/**
 * Synonym of fn.getIdFromDatabase
 * 
 * @see fn.getIdFromTable
 * @see fn.getIdOfRecord
 */
fn.getIdOfRecord = function(sSomeTablename, aFieldsAndValues, fnCallback, fnErrorHandler){
	fn.getIdFromDatabase(sSomeTablename, aFieldsAndValues, fnCallback, fnErrorHandler);
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
	if (typeof sNodeId == 'undefined' || $.trim(sNodeId) == ''){
		fn.message(lang.error,
				lang.error_when_calling+ " fn.removeFromDatabaseGivenANode("+sTable+").<BR>"+ 
				lang.error_table_has_no_row_ids);
		return;
	}
	
	
	// update the database
	var url = WEBSERV_URL+"/api/delete_row"; 
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
				fn.message(lang.error, 
	 			lang.error_when_calling+" fn.removeFromDatabaseGivenANode("+sTable+"): "+
				textStatus+" "+errorThrown+"; "+getJqXHRInfo(jqXHR));
			}
		} );
	
	
};

/**
 * Synonym of fn.removeFromDatabaseGivenANode
 * 
 * @see fn.removeFromDatabaseGivenANode
 */
fn.removeFromTableGivenANode = function(nRow, fnCallback, fnErrorHandler){
	fn.removeFromDatabaseGivenANode(nRow, fnCallback, fnErrorHandler);
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
	
	for (var sFieldName in aFieldsAndValuesToMatch) {
		aColNamesToMatch.push(sFieldName);
		aValuesToMatch.push(aFieldsAndValuesToMatch[sFieldName]);
	}
	
	// delete record from the database
	var url = WEBSERV_URL+"/api/delete_row_without_id";
	
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
				fn.message(lang.error,
	 			lang.error_when_calling+ " fn.removeFromDatabaseGivenFieldValues("+sSomeTablename+"): "+
				textStatus+" "+errorThrown+"; "+getJqXHRInfo(jqXHR));
			}
		} );
};

/**
 * Synonym of fn.removeFromDatabaseGivenFieldValues
 *  
 * @see  fn.removeFromDatabaseGivenFieldValues
 */
fn.removeFromTableGivenFieldValues = function(sSomeTablename, aFieldsAndValuesToMatch, fnCallback, fnErrorHandler){
	fn.removeFromDatabaseGivenFieldValues(sSomeTablename, aFieldsAndValuesToMatch, fnCallback, fnErrorHandler);
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
	
	if ( fn.isCellNode(nRow)){
		fn.message(lang.error, 
			lang.error_when_calling+ " fn.callRecord("+sTable+").<BR>"+ 
			lang.error_function_called_with_illegal_value+". "+
			lang.error_function_called_with_illegal_value_input+ ": cell node. " +
			lang.error_function_called_with_illegal_value_expected+ ": row node.");
		return;
	}
	
	// we need to extract the record id from the row node
	var sRecordId = fn.getRowNodeId(nRow);
	
	// if that failed, give a error
	if ( $.isNullOrUndefined(sRecordId) || sRecordId == '' ) {
		fn.message(lang.error, 
				lang.error_when_calling+ " fn.callRecord("+sTable+").<BR>"+ 
				lang.error_function_called_with_illegal_value+". "+
				lang.error_function_called_with_illegal_value_expected+": record id.");
		return;
	}
	
	
	var url = WEBSERV_URL+"/api/get_record";
	
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
				fn.message(lang.error,
	 			lang.error_when_calling+" fn.callRecord("+sTable+"): "+
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
 * @see fn.callTable
 * @see fn.callRecord
 */
fn.getRecord = function(sSomeTablename, sRecordId, fnCallback, fnErrorHandler){
	
	if (typeof sSomeTablename == 'object')
		sSomeTablename = fn.getTableName(sSomeTablename);
	
	var url = WEBSERV_URL+"/api/get_record";
	
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
				fn.message(lang.error, 
	 			lang.error_when_calling+" fn.getRecord("+sSomeTablename+"): "+
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
	
	var sRecordIds = aRecordIds.join(ARG_INTERNAL_SEPARATOR);
	
	var url = WEBSERV_URL+"/api/get_records";
	
	$.ajax( {
		"type": "GET",
		"url": url,
		"async": false, // needed to block code execution while awaiting the server response
		"data": {
			"db_name": getHttpParams().get("db"),
			"table_name": sSomeTablename,
			"ids": sRecordIds,
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
				fn.message(lang.error, 
	 			lang.error_when_calling+ " fn.getRecords("+sSomeTablename+"): "+
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
	
	for (var sFieldName in aFieldsAndValuesToMatch) {
		aColNamesToMatch.push(sFieldName);
		aValuesToMatch.push(aFieldsAndValuesToMatch[sFieldName]);
	}
	
	var url = WEBSERV_URL+"/api/get_record_without_id";
	
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
				fn.message(lang.error, 
	 			lang.error_when_calling+ " fn.getRecordGivenFieldValues("+sSomeTablename+"): "+
				textStatus+" "+errorThrown+"; "+getJqXHRInfo(jqXHR));
			}
		} );
	
};



fn.getRecordsGivenFieldValues = function(sSomeTablename, aFieldsAndValuesToMatch, fnCallback, fnErrorHandler){
	
	if (typeof sSomeTablename == 'object')
		sSomeTablename = fn.getTableName(sSomeTablename);
	
	var aColNamesToMatch = new Array();
	var aValuesToMatch = new Array();
	
	for (var sFieldName in aFieldsAndValuesToMatch) {
		aColNamesToMatch.push(sFieldName);
		aValuesToMatch.push(aFieldsAndValuesToMatch[sFieldName]);
	}
	
	var url = WEBSERV_URL+"/api/get_records_without_ids";
	
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
	 		var recordsOutput = fn._getRecordsFromXmlResponse(xml);
	 		if (fnCallback != null)
	 			fnCallback(recordsOutput);
	 		},
	 	"error": function(jqXHR, textStatus, errorThrown){
	 		
	 		if (fnErrorHandler!=null)
				fnErrorHandler({
					"jqXHR": jqXHR, "textStatus": textStatus, "errorThrown": errorThrown,
					"lexit_function": "fn.getRecords",
					"sSomeTablename": sSomeTablename, "aFieldsAndValuesToMatch": aFieldsAndValuesToMatch
					});
			else
				fn.message(lang.error, 
	 			lang.error_when_calling+ " fn.getRecordsGivenFieldValues("+sSomeTablename+"): "+
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
	
	var url = WEBSERV_URL+"/api/call_function";
	
	if (aFunctionArguments == null)
		aFunctionArguments = [];
	
	// make sure the function arguments contain no null value, as join can't deal with it		
	aFunctionArguments = convertNullToString(aFunctionArguments);		
	
	// data to be send
	var aData = {
			"db_name": getHttpParams().get("db"),
			"function_name": sFunctionName,
			"dummy": getUniqueNumber() 
			};
	// add the args only if those are non-empty (otherwise the webservice can't tell the difference between
	// no argument at all vs. one single empty string argument, which are two quite different things!)
	if (aFunctionArguments.length>0)
		aData["args"] = aFunctionArguments.join(ARG_INTERNAL_SEPARATOR);
	 
	$.ajax( {
		"type": "POST",
		"url": url,
		"async": false, // needed to block code execution while awaiting the server response
		"data": aData,
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
	 		if (typeof oFieldsAndValues[ sColumnNameToReadFrom ] != 'undefined') {
	 			functionCallOuput = oFieldsAndValues[ sColumnNameToReadFrom ].split(ARG_INTERNAL_SEPARATOR);
	 		}
	 		
	 		// [2] more return values
	 		// (in that case, the keys are the returned columns names)
	 		else if (countProperties(oFieldsAndValues)>1) {
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
				fn.message(lang.error, 
	 			lang.error_when_calling+" fn.callFunction(" + sFunctionName + "): "+
				textStatus+" "+errorThrown+"; "+getJqXHRInfo(jqXHR));			
			}
		} );
		

};









// ***************************************
// *           INTERACTION               *
// ***************************************


/**
 * Check if the current page is visible / has focus now
 * 
 */
fn.pageIsVisible = function(){
	return refr.pageIsVisible();
};



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
			            	
			           	fn.callFunction(sFunctionName, [ request.term ], 
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
					},
					open: function(event, ui){

						// make sure that the autocomplete won't disappear behind the table (it did happen in the past...)
						setTimeout(function(){
							$(".ui-front").css("z-index", getHighestZindex()+1);
						}, 100);
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
	
	// timeout is a way of preventing enter to be triggered by
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
};


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
	var sDiv = $("<div></div>").attr("id", dialogDivId).attr("title", sTitle).append(sP);
	
	$(document.body).append(sDiv);
	
	$( "#"+dialogDivId ).dialog({
		modal: true,
		width: "auto",
		open: function(event, ui){
			// remove close button (cancel is enough)
			$(".ui-dialog-titlebar-close").hide();
			// add shadows
			$(".ui-dialog").addClass("ui-dialog-shadow");
        	$( this ).closest(".ui-dialog").putInFront();
		},
		close: function(event, ui){
			$( this ).remove();
		},
		position: fn._computeDialogPosition(),
		buttons: [
		          {			
		        	  text: lang.ok,
		        	  click: function() {
						$( this ).dialog( "close" );
						
						if (fnFunction != null) {
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
			// remove close button (cancel is enough)
			$(".ui-dialog-titlebar-close").hide();
			// add shadows
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
	
	if (fnFunction == null) {
		fn.message(lang.error, 
			lang.error_when_calling+" fn.confirm().<BR>"+
			lang.error_function_called_with_illegal_value+". "+
			lang.error_function_called_with_illegal_value_expected+ ":  callback (fnFunction=null).");
	}
	else {
		var sP = $("<p></p>").html(sMessage);
		var dialogDivId = "dialog-message"+getUniqueNumber();
		var sDiv = $("<div></div>").attr("id",dialogDivId).attr("title", sTitle).append(sP);
		
		$(document.body).append(sDiv);
		
		$( "#"+dialogDivId ).dialog({
			modal: true,
			width: "auto",
			open: function(event, ui){
				// remove close button (cancel is enough)
				$(".ui-dialog-titlebar-close").hide();
				// add shadows
				$(".ui-dialog").addClass("ui-dialog-shadow");
	        	$( this ).closest(".ui-dialog").putInFront();
			},
			close: function(event, ui){
				$( this ).remove();
			},
			position: fn._computeDialogPosition(),
			buttons: [
			          {
			        	 text: lang.yes,
			        	 click: function() {
								$( this ).dialog( "close" );					
								fnFunction();
						},
					    id: 'dialog_accept_button'
			          },
			          {
			        	  text: lang.no,
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

/**
 * Build a dialog with a set of tabs, each with its own html content
 * 
 * @param {String} sTitle 
 * @param {String} sMessage (null if no message should be shown)
 * @param {Array} oTitles2HtmlContent : associative array from tab title to tab HTML content
 * @param {Function} fnFunction [fnFunction=null] - Function called after the user clicked on 'OK' 
 * @param {Array} oExtraSettings : associative array for extra jquery UI settings for the dialog
 */
fn.showTabs = function(sTitle, sMessage, oTitles2HtmlContent, fnFunction, oExtraSettings){
	
	var dialogDivId = "dialog-message"+getUniqueNumber();
	var nDiv = $("<div></div>").attr("id", dialogDivId).attr("title", sTitle);
	
	$(document.body).append(nDiv);

	// display message on top if available

	if (sMessage != null && sMessage != ''){
		var sP = $("<p></p>").html(sMessage);
		$("#"+dialogDivId).append(sP);
	}

	// now build the tabs

	var nTabsDiv = $("<div></div>").attr("id", "tabs");
	$("#"+dialogDivId).append(nTabsDiv);
	var nTabsTitles = $("<ul></ul>");
	$(nTabsDiv).append(nTabsTitles);	
	
	var iTabNr = 1;
	for (var sOneTitle in oTitles2HtmlContent){

		// id of tab
		var sTabId = "tabs-"+iTabNr;

		// append tab title
		var nLi = $("<li></li>").html("<a href='#"+sTabId+"'>"+ sOneTitle +"</a>");
		$(nTabsTitles).append(nLi);

		// append tab content
		var nTabDiv = $("<div></div>").attr("id", sTabId);
		$(nTabsDiv).append(nTabDiv);
		$(nTabDiv).html(oTitles2HtmlContent[sOneTitle]);

		iTabNr++;
	}

	// activate the tabs
	$( "#tabs" ).tabs();

	var oDialogConfig = {
		modal: true,
		width: "auto",
		open: function(event, ui){
			
			// add shadows
			$(".ui-dialog").addClass("ui-dialog-shadow");
			$( this ).closest(".ui-dialog").putInFront();		
			
		},
		close: function(event, ui){
			$( this ).remove();
		},
		position: fn._computeDialogPosition(),
		buttons: [
		          {			
		        	  text: lang.ok,
		        	  click: function() {
						$( this ).dialog( "close" );
						
						if (fnFunction != null){
							fnFunction();
						}
		        	  },
		        	  id: 'dialog_accept_button'
		          }
		]
	};

	// if extra settings have been given, add those to the dialog config
	if (oExtraSettings != null){

		for (sOneSetting in oExtraSettings){

			oDialogConfig[sOneSetting] = oExtraSettings[sOneSetting];
		}
	}	
	
	// open dialog now
	$( "#"+dialogDivId ).dialog(oDialogConfig);
	
	fn._activeEnterForThisDialog(dialogDivId);
};


// compute automatically a convenient position for a dialog, given the current active row in a table
// in such a way that the dialog does NOT hide the row
fn._computeDialogPosition = function(){
	
	var sTable = kf.getActiveTable();

	// No table open yet? Return empty settings, which will result in default window centering
	if (sTable == null)	return {};
	// active table might have been closed!
	if (!fn.tableExists(sTable)) return {};


	// if we do have a table open, try to find the active row

	var nElementToPositionAgainst = $("#"+sTable+"_dynamic");
	
	var nRow = $("#"+sTable+"_wrapper table tbody tr:not('.group').selected:eq(0)");	
	if ( nRow != null)
		nRow = nRow.get(0); // get DOM element out of jquery object
	else
		nRow = fn.getFirstSelectedRowNodeFrom(sTable); // last rescue?


	// in some cases, the row is empty
	if (nRow == null || nRow.length == 0){
		// this will cause the dialog to be centered
		return {
			my: "center",
			at: "center",
			of: nElementToPositionAgainst,
			using: function(oComputedPosition, oElementAndTarget){				
				var nDialog = oElementAndTarget.element.element.get(0);
				$(nDialog).css("left", $(window).width() / 2 - (oElementAndTarget.element.width / 2)).css("top", oComputedPosition.top);
			}
		}; 
	}
	
	// but if we have a non-empty row, position the dialog relative to that row
	var oOffset = $(nRow).offset();
	var iRowPosition = (typeof oOffset == 'undefined') ? 0 : oOffset.top;
	var iMiddleOfScreen = $(window).height() / 2;
	
	return {
		my: iRowPosition < iMiddleOfScreen ? 'center top' : 'center bottom',
    	at: iRowPosition < iMiddleOfScreen ? 'center bottom' : 'center top',
		of: nRow,
		within: nElementToPositionAgainst,
		using: function(oComputedPosition, oElementAndTarget){			
			var nDialog = oElementAndTarget.element.element.get(0);
			$(nDialog).css("left", $(window).width() / 2 - (oElementAndTarget.element.width / 2)).css("top", oComputedPosition.top);
			
		}
    }
};



/**
 * Generate a prompt pop-up, requesting some input from the user
 * The output can be retrieved by using fn.getPromptBoxInput()
 * 
 * @param {String|Array} sTitle - Title of the message window (if array: sTitle as element #1, sMessage as element #2)
 * @param {String[]} aFieldNames - Fields names to show
 * @param {Array} aValues - Default string values (pre-filled when dialog opens). When a pre-filled value mustn't be editable, add '::disabled' to the value string. / 
 * When one needs a field to be a checkbox instead, just fill in the boolean value which has to be chosen by default /
 * When when one needs a datepicker, add '::datepicker' to the value string. /
 * When when one needs a text area for one field only, add '::textarea' to the value string. / 
 * And when one needs a selectbox, give an array of values to choose from. 
 * The value to be selected by default must have '::selected' attached in its string value.  
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

	// list of datepickers to be activated when diolog is opened
	var aDatePickersIds = [];

	// deal with title/message input
	var sMessage = "";
	if ( $.isArray(sTitle) ) {
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
	for (var i=0; i<aFieldNames.length; i++) {
		// should the input field be editable?
		var bFixedValue = false;
		// datepicker?
		var bDatePicker = false;
		// textarea type
		var bOneTextarea = false;

		if (aValues != null && 
				(aValues[i] instanceof String || typeof aValues[i] === "string") ) { // make sure we have a string, or this will crash!
			bFixedValue = (aValues[i]).indexOf("::disabled")>-1;
			bDatePicker = (aValues[i]).indexOf("::datepicker")>-1;
			bOneTextarea = (aValues[i]).indexOf("::textarea")>-1;
			aValues[i] = (aValues[i]).split("::")[0];
		}

		
		// should the input field be an select box?
		// (in that case we expect the value at the current index i to contain an array of values to select from)
		var bSelectBox = (aValues != null && typeof aValues[i] === 'object');
		// or a checkbox?
		var bCheckBox = (aValues != null && typeof aValues[i] === 'boolean');
		
		var fieldLC = $.trim( keepOnlyLettersAndDigits(aFieldNames[i].toLowerCase()) );
		var label = $("<label></label>")
			.attr("for", fieldLC)
			.text($.trim(aFieldNames[i]));
		
		
		// now build the input field
		
		var input;
		
		// select box type
		
		if (bSelectBox) {
			input = $("<select></select>")
			.attr("id", "prompt_"+fieldLC)
			.prop('disabled', bFixedValue);
			
			// build the options to select 
			for (var j=0; j<aValues[i].length; j++) {
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
		
		// checkbox field type
		
		else if (bCheckBox) {
			input = $("<input></input>")
			.attr("id", "prompt_"+fieldLC)
			.attr("type", "checkbox" )
			.val(aValues[i])
			.prop("checked", aValues[i])
			.change(function(){ 
				$(this).val( $(this).prop("checked") ); 
				// beware: the checked attribute is string typed somehow
			});
		}
		
		// text field type
		
		else {
			var sInputType = (bTextarea || bOneTextarea) ? "textarea" : "input";
			input = $("<"+sInputType+"></"+sInputType+">")
				.attr("type", "text" )
				.attr("name", fieldLC)
				.attr("id", "prompt_"+fieldLC)
				.prop('disabled', bFixedValue);
			
			// preset the input value, if available
			if ((bTextarea || bOneTextarea)) {
				input.text(aValues!=null ? aValues[i]: ""); // textarea
			}
			else {
				input.val(aValues!=null ? aValues[i]: "");  // input
				input.css("width", "95%");					// prevent small fields
			}
			
			// if cols and rows are given, set them!			
			if ((bTextarea || bOneTextarea) && aColsAndRows!= null && aColsAndRows.length ==2){
				input.attr("cols", aColsAndRows[0]);
				input.attr("rows", aColsAndRows[1]);
			}

			// add datepicker is needed
			if (bDatePicker) {
				aDatePickersIds.push( "prompt_"+fieldLC );
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
	
	// array of buttons
	var aButtons = [];
	
	// Put a OK button only if we have a callback function, even an empty one
	if (fnFunction != null){
		aButtons.push({
       	 text: lang.ok,
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
     		fnFunction(aPromptResponse); 
    		              		
    	},
    	id: 'dialog_accept_button'
       });
	}
	
	// A cancel button is always needed
	aButtons.push({
    	text: lang.cancel,
    	click: function() {
    		$( this ).dialog( "close" );
    		// call callback upon Cancel
    		if (fnCancelFunction != null)
    			fnCancelFunction(); 
            
        }
	});
	
	
	// Open dialog	
	// Important detail: Pressing enter should trigger click on OK button
	// cross-browser implementation: http://stackoverflow.com/questions/868889/submit-jquery-ui-dialog-on-enter
	// only change is use of keyup instead of keypress, otherwise it doesn't work in some cases
	$( "#"+promptDivId ).dialog({
		autoOpen: false,
		height: "auto",
		maxHeight: $(window).height(),
        width: "auto",
        modal: true,
        open: function( event, ui ){
			// remove close button (cancel is enough)
			$(".ui-dialog-titlebar-close").hide();
			// add shadows
        	$(".ui-dialog").addClass("ui-dialog-shadow");
        	$( this ).closest(".ui-dialog").putInFront();
        },
        close: function(event, ui){
        	$( this ).remove();        	
        },
        position: fn._computeDialogPosition(),
        buttons: aButtons
	}) 
	.keyup(function() {		 
		if (	kf.isPressed("enter") && 
				// enter when selecting from autocomplete mustn't trigger closing dialog
				// (in case an autocomplete has been set for this prompt)
				!$(".ui-autocomplete-input").elementExists() 
				) {		
			$( "#dialog_accept_button" ).click();
			return false;
		}
	});
	
	$( "#"+promptDivId ).dialog( "open" );

	// activate the datepickers
	setTimeout(function(){
		for (var i=0; i<aDatePickersIds.length; i++){
			$( "#" + aDatePickersIds[i] ).datepicker({
				dateFormat: "dd-mm-yy"
			});
		}
	}, 1000);

	if ( $.inArray( $(':focus').attr("id"), aDatePickersIds ) == 0)
		$(':focus').blur();
	
};



/**
 * Generate a prompt pop-up, requesting the user to make a selection out of a list of items.
 * 
 * @param {String|Array} sTitle - Title of the message window (if array: sTitle as element #1, sMessage as element #2)
 * @param {String[]} aAllOptions - List of items to choose from (to add space between twee items or groups of item, just add an item with NULL value)
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
	if ( $.isArray(sTitle) ) {
		sMessage = sTitle[1];
		sTitle = sTitle[0];
	}
	var sMessageP = $("<p></p>").html(sMessage);
	
	var promptDiv = $("<div></div>")
		.attr("id", promptDivId)
		.attr("title", sTitle)
		.css("font-size", "12px")
		.append(sMessageP);
	
	

	// if there are more options than the screen can show at once, 
	// add a filter box on top 

	var iNumberOfPixelOccupedByOptions = (749.0/23.0); // real life example: 749px taken by 23 options
	var iPercentOfHeightTakenByFullDialog = 0.78; // real life example: 749px (dialog) vs 952px (window)
	var iWindowHeight = $(window).height();
	var iComputedHeight = aAllOptions.length * iNumberOfPixelOccupedByOptions;


	// if ratio of height-of-all-options to window height is too heigh, add a filter box
	if (iComputedHeight / iWindowHeight > iPercentOfHeightTakenByFullDialog)
	{
	var sFilter = $("<p></p>")
		.append(
			$("<span></span>")
				.text(lang.filter+ ": ")
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
						var aAllOptionsFiltered = aAllOptions.filter(function(value){
							return value.toLowerCase().match(sFilter.toLowerCase());
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
		var sP = $("<p></p>").html(lang.hold_ctrl_for_multiple_choice+ ":");	
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
		
	// array of buttons
	var aButtons = [];
	
	// Put a OK button only if we have a callback function, even an empty one
	if (fnFunction != null){
		aButtons.push({
      	  text: lang.ok,
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
      });
	}
	
	// A cancel button is always needed
	aButtons.push({
	  text: lang.cancel,
	  click: function() {
		  // call close function
          $( this ).dialog( "close" );
          
		  // call callback upon Cancel
          if (fnCancelFunction != null)
        	  fnCancelFunction();
  		  
      }
	});
	
	
	// Open dialog	
	// Important detail: Pressing enter should trigger click on OK button
	// cross-browser implementation: http://stackoverflow.com/questions/868889/submit-jquery-ui-dialog-on-enter
	// only change is use of keyup instead of keypress, otherwise it doesn't work in some cases
	$( "#"+promptDivId ).dialog({
		autoOpen: false,
		height: "auto",
		maxHeight: $(window).height(),
        width: 600,  // 'auto' setting caused dialog to get to small, very ugly and not readable
        modal: true,
        open: function( event, ui ){
			// remove close button (cancel is enough)
			$(".ui-dialog-titlebar-close").hide();
			// add shadows
        	$(".ui-dialog").addClass("ui-dialog-shadow");
        	$( this ).closest(".ui-dialog").putInFront();
        },
        close: function(event, ui){
        	
        	$( this ).remove();            
            // remove 'selectableselected' event
            $( "#"+selectableId ).off();
        },
        position: fn._computeDialogPosition(),
        buttons: aButtons
	});
	
	$( "#"+promptDivId ).dialog( "open" );
	
	fn._activeEnterForThisDialog(promptDivId);
	
	$( function() {		
		
		$( "#"+selectableId ).selectable();
		
		if (mSelectionMode != false)
		{
			$( "#"+selectableId ).on( "selectableselected", function( event, ui ) {
				
				// if some function was set, execute it and give the selected text as an argument
				if (typeof mSelectionMode == 'function') {
					mSelectionMode(ui.selected.innerText);
				}
				
				// if only one choice is allowed, dialog must be closed upon selection
				else {
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
	
	for (var i=0; i<aAllOptions.length; i++) {
		var sOption = aAllOptions[i];
		
		// null represent an empty space, which can be used to put room between groups of options not belonging together
		if (sOption == null) {
			selectableUl.append($("<br/>"));
		}
		
		// normal case: build option
		else {
			// one element 		
			var liElement = $("<li></li>")
				.addClass( "ui-widget-content" )
				.css("margin", "3px")
				.css("padding", "0.4em")
				.css("font-size", "12px")
				.css("min-height", "18px");	
			
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
};




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
	if ( $.isArray(sTitle) ) {
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
			.css("min-height", "18px");		
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
	
	
	// array of buttons
	var aButtons = [];

	// Put a OK button only if we have a callback function, even an empty one
	if (fnFunction != null){
		aButtons.push({
      	  text: lang.ok,
    	  click: function(){
    		  
    		for (var i=0; i<aFieldNames.length; i++) {
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
      });
	}

	// A cancel button is always needed
	
	aButtons.push({
  	  text: lang.cancel,
	  click: function() {
		  $( this ).dialog( "close" );
		  // call callback upon Cancel
		  if (fnCancelFunction != null)
			  fnCancelFunction(); 
          
      }
	});
	
	
	
	// Open dialog	
	// Important detail: Pressing enter should trigger click on OK button
	// cross-browser implementation: http://stackoverflow.com/questions/868889/submit-jquery-ui-dialog-on-enter
	// only change is use of keyup instead of keypress, otherwise it doesn't work in some cases
	$( "#"+promptDivId ).dialog({
		autoOpen: false,
		height: "auto",
		maxHeight: $(window).height(),
        width: 600,  // 'auto' setting caused dialog to get to small, very ugly and not readable
        modal: true,
        open: function( event, ui ){
			// remove close button (cancel is enough)
			$(".ui-dialog-titlebar-close").hide();
			// add shadows
        	$(".ui-dialog").addClass("ui-dialog-shadow");
        	$( this ).closest(".ui-dialog").putInFront();
        },
        close: function(event, ui){
        	$( this ).remove();
        },
        position: fn._computeDialogPosition(),
        buttons: aButtons
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
	
	if (aPromptBoxOrder.length != aArrayToResort.length) {
		fn.message(lang.error, 
			lang.error_when_calling+ " fn.processPromptBoxOrder().<BR>" + lang.error_function_called_with_illegal_value+ ": array length");
	}
	else {
		var aNewArray = new Array();
		
		for (var i=0; i<aPromptBoxOrder.length; i++) {
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
};



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
	
	for (sOneSetting in aTableSettings) {
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
};


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
 * @see fn.setFilters
 * @see fn.putDataIntoGlobalFilterBox
 */
fn.putDataIntoFilterBox = function(sSomeTable, sCellName, sSomeData){
	
	if (typeof sSomeTable == 'object')
		sSomeTable = fn.getTableName(sSomeTable);
	var sSomeTableName = fn.getTableName(sSomeTable);
	var iColNr = fn.getVisibleColumnNumberOf(sSomeTable, sCellName);
	
	// carry on only if the search box exists (is visible column) 
	if (iColNr>-1) {
		
		// determine right selector for searchbox (input or select type)
		
		var searchBoxSelector = $("#"+sSomeTableName+"_searchbox_"+sCellName);		
			
		if (searchBoxSelector.attr("disabled") != "disabled") {		

			// put value
			searchBoxSelector.val( sSomeData );

			// special cases:

			// if we have a checkbox, we also need to (un)check it			
			if (searchBoxSelector.attr("type")=="checkbox" && sf.isCheckboxTrueValue(sSomeData)) {
				searchBoxSelector.prop("checked", "checked");
			}

			// if we have a select box, we also need to set the right value
			if (searchBoxSelector.find("option").length > 0) {
				// https://stackoverflow.com/questions/314636/how-do-you-select-a-particular-option-in-a-select-element-in-jquery
				searchBoxSelector.find("option").filter(function(i, e) {
					return e.text == sSomeData
				}).attr("selected", "selected");
			}
		}
	}
};


/**
 * Put some data into a GLOBAL search filter box in the GUI
 * (beware: no effect on the filters variables as long as 'enter' wasn't pressed)
 * 
 * @param {(String|API-object-instance)} sSomeTable - A table name or object 
 * @param {String} sSomeData - Search value to put in the search box 
 * 
 * @see fn.putDataIntoFilterBox
 */
fn.putDataIntoGlobalFilterBox = function(sSomeTable, sSomeData){

	if (typeof sSomeTable == 'object')
		sSomeTable = fn.getTableName(sSomeTable);
	var sSomeTableName = fn.getTableName(sSomeTable);

	var searchBoxSelector = $("#"+sSomeTableName+"_dynamic #"+sSomeTableName+"_filter.dataTables_filter").find("input");

	// put value
	searchBoxSelector.val( sSomeData );
}


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
	if (iColNr>-1) {
		
		// determine right selector for searchbox (input or select type)
		var searchDivSelector = $("#"+sSomeTableName+"_searchboxes td:eq("+iColNr+")");
		var searchBoxSelector = (searchDivSelector.find("option").length > 0) ? 
				searchDivSelector.find("select").find(":selected") : searchDivSelector.find("input").eq(0);

		return ( 
			$.trim(searchBoxSelector.val()) 
			).replaceAll("\\", ""); // remove escaped regex chars (which were added by sf.enableSearchFields() )
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
 * @see fn.putDataIntoFilterBox
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
 * @see fn.getValueOfFilterBox
 */
fn.getFilters = function(sSomeTable){
	
	if (typeof sSomeTable == 'string')
		sSomeTable = mt.getDataTableObjectOf(sSomeTable);
	
	return sSomeTable.getSearchFilters();
};


/**
 * Get the filters values for a given table upon call (t.i.: as part of the fn.callTable() call).
 * @param {(String|API-object-instance)} sSomeTable - A table name or object
 */
fn.getFiltersUponCall = function(sSomeTable){
	
	if (typeof sSomeTable == 'object')
		sSomeTable = fn.getTableName(sSomeTable);
		
	return mt.getFilterValues(sSomeTable);
}

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
	for (var i=0; i<mt.getListOfColumnsOf(sSomeTablename).length; i++) {
		var aColumnConfig = conf.getColumnConfig(oTableConfig, mt.getListOfColumnsOf(sSomeTablename)[i]);		
		var keepfilter = conf.getKeepFilterSetting(aColumnConfig);
		if (keepfilter) {
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
	if ( $.isArray(aaIndexes) ){
		if ( !$.isArray( aaIndexes[0]) ){
			fn.message(lang.error, lang.error_highlight);
			return sString;
		}			
	}
	
	// make sure the indexes are sorted correctly
	aaIndexes = sortArrayOfArray(aaIndexes);
	
	var sPreTag = "<span style='background: "+sColor+"'>";
	var sPostTag = "</span>";
	var iTotalIndexCorrection = 0;
	var iIndexCorrectionForEachStep = (sPreTag+sPostTag).length;
	
	for (var i=0; i<aaIndexes.length; i++){
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

	var sNewString = sString.replace(/\<span[^\>]+?\>/gi, "");
	sNewString = sNewString.replace(/\<.span\>/gi, "");
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
 * @param {Array} [oExtraParams=null] - additional ajax parameters, if needed (like any jquery ajax parameter). 
 * Additional custom parameter: boolean 'useLexitService', which forces use of the Lex'it service as a proxy. 
 * @param {Function} [fnErrorHandler=null] - Some function to call when an error occurs
 * 
 */
fn.callService = function(sUrl, aParameters, sMethod, sResponseDataType, fnCallback, oExtraParams, fnErrorHandler){
	
	if (sMethod == undefined)
		sMethod = "GET";
	
	if (sResponseDataType == undefined)
		sResponseDataType = "xml";

	if (oExtraParams == undefined)
		oExtraParams = {};

	var bAimedServiceIsOnSameHost = sUrl.indexOf(document.domain)>-1;
	
	// crossDomain parameter (part of the jquery ajax API)
	//
	// Beware: in Lex'it the default value is true, be in jQuery that is false instead. We keep it that way for backwards compatibility.  
	var bCrossDomainValueIsSet = ( typeof oExtraParams["crossDomain"] !== 'undefined' );
	
	// if the called url is NOT on the same server as Lex'it,
	// we run the risk to get 'strict-origin-when-cross-origin' errors
	//
	// so we have 2 possibilities:
	// [1] if crossDomain is enabled, we'll just call the service directly
	// [2] if crossDomain is NOT enabled, we'll use the Lex'it-webservice as a proxy,
	//     so as to avoid 'strict-origin-when-cross-origin' errors
	//
	// In previous Lex'it versions, Lex'it would detect if the Lex'it host
	// and the aimed service host were NOT the same and automatically
	// set oExtraParams["crossDomain"] = true  (t.i. crossDomain enabled)
	//
	// For sake of backwards compatibility, we keep it that way,
	// EXCEPT when oExtraParams["crossDomain"] was explicitly set to 'false'
	// in the fn.callService(). In that case, that will overrule the 
	// old default behavior of the function. 	
	 
	
	// Kind of brutal force parameter: 'true' means force use the Lex'it service as a proxy, so as to avoid 'strict-origin-when-cross-origin' errors 
	var bUseLexitServiceIsSet = ( typeof oExtraParams["useLexitService"] !== 'undefined' );	
	
	
	// final decision on which service to use:
	//
	var bUseTheLexitServiceAsProxy = 
		(!bAimedServiceIsOnSameHost && bCrossDomainValueIsSet && oExtraParams["crossDomain"] == false)
		 ||
		 ( bUseLexitServiceIsSet && oExtraParams["useLexitService"] == true);

	
	
	// Detect that the aimed service is not on the same host
	// and the "crossDomain" parameter given is explicitly set to 'false'
	// (or if 'useLexitService' is set to 'true', we use the lex'it service anyhow) 

	if ( bUseTheLexitServiceAsProxy ){

		var sData = getAssociativeArrayAsString(aParameters);
		
		var ajaxParams = {
			url: WEBSERV_URL+"/api/call_external_service",
			method: "GET",
			data: {
				"url": sUrl,
				"type": sMethod,
				"data": sData,
				"dataType": sResponseDataType
			}			
		};

		// if some extra parameters were given, add them to the ajax call
		
		for (oneParam in oExtraParams) {
			ajaxParams[oneParam] = oExtraParams[oneParam];
		}
		
		$.ajax( ajaxParams )
			.done(function( xml ) {
				
				if (sResponseDataType == 'json')  
					xml = JSON.parse(xml);
	
				// callback if it is set
				if (fnCallback!=null)
						fnCallback(xml);
	    
			})
			.fail(function( jqXHR, textStatus ) {
	
				if (fnErrorHandler!=null)
					fnErrorHandler({
						"jqXHR": jqXHR, "textStatus": textStatus, 
						"lexit_function": "fn.callService",
						"sUrl": sUrl, "aParameters": aParameters, "sMethod": sMethod,
						});
				else
					fn.message(lang.error,
						lang.error_when_calling+" fn.callService(): " +	
						textStatus+"; "+getJqXHRInfo(jqXHR));
			});		

	}


	// Other cases:
	//
	// - the aimed service is at the same host as Lex'it (no problem at all!)
	// or
	// - the aimed service is NOT at the same host, but since fn.callService was NOT called with ["crossDomain":false], crossDomain will be automatically enabled
	//
	// So.... 
	//     NO proxy needed at all, we can call the aimed service directly
	
	else {

		if ( !bAimedServiceIsOnSameHost ){
			oExtraParams["crossDomain"] = true; // for backwards compatibility (with projects built in earlier Lex'it versions)
		}		

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
					fn.message(lang.error,
					lang.error_when_calling+" fn.callService(): " +				
					textStatus+" "+errorThrown+"; "+getJqXHRInfo(jqXHR));
			}
		}
		
		if (sResponseDataType != null) {
			ajaxParams["dataType"] = sResponseDataType;
		}
		
		// if some extra parameters were given, add them to the ajax call
		
		for (oneParam in oExtraParams){
			ajaxParams[oneParam] = oExtraParams[oneParam];
		}
		
		$.ajax( ajaxParams );

	}	
	
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
 * Get the session-ID of the Tomcat user which has logged in.
 * This only workt when 'send_tomcat_username_to_db=true'
 * was set in the project.database configuration file
 * 
 * @returns {String} A session-ID
 * 
 * @see fn.getCurrentUser
 */
fn.getCurrentSessionId = function(){
	return SESSION_ID;
};


/**
 * Open a Lex'it login dialog
 */
fn.startLexitLogin = function(){
	startLexitLogin();
};



/**
 * Get the page_id, t.a. the ID assigned to the tab
 * currently being viewed. Just like the tomcat username
 * and the session-ID, this is saved in the Lex'it
 * temporary table 'active_user', allowing database
 * functions to take this into account, to simulate a kind
 * of per-tab-session-ID
 */
fn.getCurrentTabId = function(){
	return fn.getCurrentProject() + "_" + $("#page_id").attr("name");
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
 * Get the list of columns of a table
 * and convert each column names to its nice name (if any is set in the configuration)
 * @param {(String|API-object-instance)} sSomeTablename - A table name or object 
 */
fn.getListOfColumnsNiceNames = function(sSomeTable){

	var sTableName = (typeof sSomeTable == 'object') ? fn.getTableName(sSomeTable) : sSomeTable;
	var oTableConfig = conf.getTableConfig(sTableName);
	var aColsList = mt.getListOfVisibleColumnsOf(sTableName);
	
	var aColsNiceNames = [];
	for (var i=0; i<aColsList.length; i++){
		var aColumnConfig =	conf.getColumnConfig(oTableConfig, aColsList[i]);
		var sNiceName = conf.getColumnNiceName(aColumnConfig);
		aColsNiceNames[i] = (sNiceName == null ? aColsList[i] : sNiceName);
	}
	return aColsNiceNames;
}


/**
 * Set the user name (the name of the user who has logged in is normally got from webservice
 * at initialisation time, but it is possible to set it here by giving a string, if needed that way)
 *  
 * @param {String} sName - A user name
 * @param {Function} [fnCallback=null] - Some function to call upon success
 * @param {Function} [fnErrorHandler=null] - Some function to call when an error occurs
 * 
 * @see fn.getCurrentUser
 */
fn.setCurrentUser = function(sName, fnCallback, fnErrorHandler){
	
	if (sName != null)
		USERNAME = sName;
	
	var url = WEBSERV_URL+"/api/get_username"; 
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
			var aUsernameAndSessionId = ( fn.getDbResponse(xml) ).split(ARG_INTERNAL_SEPARATOR);
			USERNAME = aUsernameAndSessionId[0];
			SESSION_ID = aUsernameAndSessionId[1];
			if (fnCallback != null)
				fnCallback();
	 	},
	 	"error": function(jqXHR, textStatus, errorThrown){
	 		
	 		if (fnErrorHandler!=null)
				fnErrorHandler({
					"jqXHR": jqXHR, "textStatus": textStatus, "errorThrown": errorThrown, 
					"lexit_function": "fn.setCurrentUser",
					"sName": sName
					});
			else
				fn.message(lang.error, lang.error_when_calling+ " fn.setCurrentUser('"+sName+"'): "+
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
};



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
	
	if (fx.isApiInstance(oArgument)){
		// give info in console
		console.log("sFunctionName:"+sFunctionName);
		console.log("oArgument:"+oArgument);

		fn.message(lang.error, sFunctionName + "('"+fx.getTableName(oArgument)+"') "+lang.error_function_called_with_api_instance+".");
		return;
	}
	
};


fn._checkjQueryObject = function(sFunctionName, oArgument){
	
	if (oArgument instanceof jQuery){
		// give info in console
		console.log("sFunctionName:"+sFunctionName);
		console.log("oArgument:"+oArgument);

		// get(0) makes sure we get the node out of the jQuery object
		fn.message(lang.error, sFunctionName + "('"+fn.getTableName(oArgument.get(0))+"') "+lang.error_function_called_with_jquery_object+".");
		return;
	}
};
