/**
 * 
 */

var fn = {};



/* 
 
List of sections of functions:
-----------------------------

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
READ A SINGLE RECORD FROM THE DATABASE

INTERACTION

FILTER BOXES FUNCTIONS
GOTO FUNCTION
STRING FUNCTIONS
EXTRA FUNCTIONS

 */



// set the project title on the screen
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




/*****************************************************************
 *     GET GENERAL TABLE INFORMATION                             *
 *****************************************************************/

// get the view type of a table
// output: 'table' / 'form'
fn.getViewType = function(sSomeTablename){
	
	if (typeof sSomeTablename == 'object')
		sSomeTablename = fn.getTableName(sSomeTablename);
	return mt.getViewType(sSomeTablename);
};

// check if a table exists
fn.tableExists = function(sSomeTablename){

	if (typeof sSomeTablename == 'object')
		sSomeTablename = fn.getTableName(sSomeTablename);
	
	return $("#"+sSomeTablename+" tbody tr").length>0;
		
};


// get the state of the row selection button
fn.rowsSelectionIsAllowed = function(sSomeTablename){
	
	if (typeof sSomeTablename == 'object')
		sSomeTablename = fn.getTableName(sSomeTablename);
	
	// if assigned class says functions should be asleep, 
	// that means that the multiple rows selection is turned on.
	return $("#"+sSomeTablename+"_wrapper #selectionbutton").hasClass("functions_sleep");
};


// check if a table is empty
fn.tableIsEmpty = function(sSomeTablename){
	
	if (typeof sSomeTablename == 'object')
		sSomeTablename = fn.getTableName(sSomeTablename);
	return $("#"+sSomeTablename+" tbody tr:eq(0)").find("td:eq(0)").hasClass("dataTables_empty");
};

// check if a table is hidden
fn.tableIsHidden = function(sSomeTable){
	if (typeof sSomeTable == 'object')
		sSomeTable = fn.getTableName(sSomeTable);
	return $("#"+sSomeTable+"_wrapper:visible").length==0;
};

// get the name of a table, given its datatable object
// input	: table object
// returns	: table name
fn.getTableName = function(confTable){
	
	return $.trim($(confTable).selector.replace("#",""));
};


// get the number of visible rows
// input  : table name
// output : number of visible rows
fn.getNumberOfVisibleRows = function(someTable){
	if (typeof someTable == 'object')
		someTable = fn.getTableName(someTable);
	
	return $("#"+someTable+" tbody tr").length;
};


// get the current sorting column of a table
// output is a string, t.i. the column name (or null if no sorting column was set)
fn.getSortingColumn = function(sSomeTablename){
	if (typeof sSomeTablename == 'object')
		sSomeTablename = fn.getTableName(sSomeTablename);
	
	var oSettings = mt.getDataTableObjectOf(sSomeTablename).fnSettings();
	var aSortingSettings = oSettings.aaSorting;
	
	if (aSortingSettings.length==0) return null;
	var iSortingColumn = aSortingSettings[0][0];
	var sSortColumn = mt.getListOfColumnsOf(sSomeTablename)[iSortingColumn];
	return sSortColumn;
};

// same as above, but output is an array, in cases we have multiple sorting columns
fn.getSortingColumns = function(sSomeTablename){
	if (typeof sSomeTablename == 'object')
		sSomeTablename = fn.getTableName(sSomeTablename);
	
	var oSettings = mt.getDataTableObjectOf(sSomeTablename).fnSettings();
	var aSortingSettings = oSettings.aaSorting;
	
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

// get the current sorting direction (of the active sorting column) of a table
// output is a string, t.i. the sorting direction 'ASC' or 'DESC' 
// (or 'ASC' the default sorting direction, if not sorting column was set)
fn.getSortingDirection = function(sSomeTablename){
	if (typeof sSomeTablename == 'object')
		sSomeTablename = fn.getTableName(sSomeTablename);
	
	var oSettings = mt.getDataTableObjectOf(sSomeTablename).fnSettings();
	var aSortingSettings = oSettings.aaSorting;
	var sSortDirection = (aSortingSettings.length==0) ? "asc" : aSortingSettings[0][1];
	return sSortDirection;
};

//same as above, but output is an array, in cases we have multiple sorting columns

fn.getSortingDirections = function(sSomeTablename){
	if (typeof sSomeTablename == 'object')
		sSomeTablename = fn.getTableName(sSomeTablename);
	
	var oSettings = mt.getDataTableObjectOf(sSomeTablename).fnSettings();
	var aSortingSettings = oSettings.aaSorting;
	
	var aSortingDirs = new Array();
	for (var i=0; i<aSortingSettings.length; i++)
		{
		var iSortingDir = aSortingSettings[i][1];		
		iSortingDir.push(sSortColumn);
		}
	
	return aSortingDirs;
};


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
	mt.getDataTableObjectOf(sSomeTablename).fnSort( aNewSettings );
};


// get the current number of rows allowed to be shown at once in the table
fn.getCurrentDisplayLength = function(sSomeTablename){
	if (typeof sSomeTablename == 'object')
		sSomeTablename = fn.getTableName(sSomeTablename);
	var oSettings = mt.getDataTableObjectOf(sSomeTablename).fnSettings();
	return oSettings._iDisplayLength;
};
// get the current start index at which display of rows must start
fn.getCurrentDisplayStart = function(sSomeTablename){
	if (typeof sSomeTablename == 'object')
		sSomeTablename = fn.getTableName(sSomeTablename);
	var oSettings = mt.getDataTableObjectOf(sSomeTablename).fnSettings();
	return oSettings._iDisplayStart;
};


/*************************************************
 *  READ A TABLE FROM THE DATABASE               *
 *  load a table into the datatables interface   *
 *************************************************/

// call a table, given a table name, and some value to match with the content of a field/column name
// ex: 
//		callDatabase("wordforms", {"wordform": somevalue, "has_analysis": true});
//
// input	: table name or table object, an associative array of fields and values to match,
//			  fnFunction is a function to be called once the table has been loaded
// returns	: n.a., builds a datatable on the screen 
fn.callDatabase = function(sSomeTablename, aContentToMatch, fnFunction, oExtraSettings){
	
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
		var func = function(){fn._callTableWithFilter(sSomeTablename, aContentToMatch);};
		var args = [sSomeTablename, aContentToMatch];
		
		// very important: here is the table record created in the multitables namespace 
		// (which is where we always create a table by calling this function)
		mt.createTableRecordWithFilter(sSomeTablename, func, args);
		
		// and load the table into a html frame
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
	mt.getDataTableObjectOf(sSomeTablename).fnFilterSet(aContentToMatch);
	mt.getDataTableObjectOf(sSomeTablename).fnDraw();
	
	// if table is hidden, we call it back
	// (we do not trigger the click event on the table_awake_button because
	//  that would be refreshing the table, which we don't want since we are triggering
	//  a table (re)draw event now)
//	if ( $("#"+sSomeTablename+"_awake_button").is(":visible") )
//		{
//		$("#"+sSomeTablename+"_wrapper").show("slow");
//		$("#"+sSomeTablename+"_awake_button").hide("slow");
//		
//		// small delay needed, because search boxes css are to be adapted to fully opened table dimension
//		$("#"+sSomeTablename).delay(1000).queue(function(){
//			gui.setSearchboxesCss(sSomeTablename); $(this).dequeue();});
//		}
};

// call a table in a new tab
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

/*****************************************************************
 *             GENERAL TABLE FUNCTIONS                           *
 *****************************************************************/

// refresh a table
fn.refreshTable = function(sSomeTablename, fnCallback){
	
	if (typeof sSomeTablename == 'object')
		sSomeTablename = fn.getTableName(sSomeTablename);
	
	if (fnCallback != null) 
		mt.getDataTableObjectOf(sSomeTablename).addDrawCallback("userCallBack", fnCallback);

	// check if the table does exist, otherwise we get an error
	if ( fn.tableExists(sSomeTablename) )
		gui.refreshTable(sSomeTablename);
};

// reset a table
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

// request webservice to clean its counter cache etc for a given table
fn.cleanTableCache  = function(sSomeTablename, fnCallback){
	
	// force webservice to clean its counter cache etc
	// update the database
	var url = "../lexit/lexit/table/cleancache"; 
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
			fn.message("Fout",
				"Fout bij aanroep van fn.cleanTableCache('"+sSomeTablename+"'): " +				
				textStatus+" "+errorThrown);
			}
		} );
};

// define a table draw callback, if one is needed
// this callback will be called only once
fn.addDrawCallback = function(sSomeTablename, fnFunction){
	
	if (typeof sSomeTablename == 'object')
		sSomeTablename = fn.getTableName(sSomeTablename);
	mt.getDataTableObjectOf(sSomeTablename).addDrawCallback("userCallBack", fnFunction);
};


// scroll to a table if it happens to be outside the visible window
fn.scrollToTable = function(sSomeTablename){
	
	if (typeof sSomeTablename == 'object')
		sSomeTablename = fn.getTableName(sSomeTablename);
	
	smoothScroll("html,body", "#"+sSomeTablename+"_dynamic");
};



// put a table to the right side of another table (alignment)
fn.alignTables = function(sSomeTablename1, sSomeTablename2, fnCallback){
	
	var tableName1 = fn.getTableName(sSomeTablename1);
	var tableName2 = fn.getTableName(sSomeTablename2);
	
	// selectors
	var tableRef1 = $("#"+tableName1+"_dynamic");	
	var tableRef2 = $("#"+tableName2+"_dynamic");
	
	// we need to compute a new position, so get the current position data
	var tableWidth1 = tableRef1.width();
	var tableXpos1 = tableRef1.position().left;
	var tableYpos1 = tableRef1.position().top;	
	
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

// put a table right under another table
fn.pileupTables = function(sSomeTablename1, sSomeTablename2, fnCallback){
	
	var tableName1 = fn.getTableName(sSomeTablename1);
	var tableName2 = fn.getTableName(sSomeTablename2);
	
	// selectors
	var tableRef1 = $("#"+tableName1+"_dynamic");	
	var tableRef2 = $("#"+tableName2+"_dynamic");
	
	// we need to compute a new position, so get the current position data
	var tableHeight1 = tableRef1.height();
	var tableXpos1 = tableRef1.position().left;
	var tableYpos1 = tableRef1.position().top;
	
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


// Since table with a narrow width are put on the same line on the screen
// it can be convenient to prevent following table to line up!
// To do so, use fn.breakTableLine
fn.breakTableLine = function(){
	$("#dynamic").append($("<div></div>").css("clear", "both"));
};

// show/hide Processing... message
fn.showProcessingMsg = function(sSomeTablename){
	if (typeof sSomeTablename == 'object')
		sSomeTablename = fn.getTableName(sSomeTablename);
	gui.showProcessingMsg(sSomeTablename);
};

fn.removeProcessingMsg = function(sSomeTablename){
	if (typeof sSomeTablename == 'object')
		sSomeTablename = fn.getTableName(sSomeTablename);
	gui.removeProcessingMsg(sSomeTablename);
};


// hide a table
fn.hideTable = function(sSomeTablename){
	if (typeof sSomeTablename == 'object')
		sSomeTablename = fn.getTableName(sSomeTablename);
	$("#"+sSomeTablename+"_wrapper").hide("slow");
	//$("#"+sSomeTablename+"_awake_button").show("slow");
};

// show a table
fn.showTable = function(sSomeTablename){
	if (typeof sSomeTablename == 'object')
		sSomeTablename = fn.getTableName(sSomeTablename);
	$("#"+sSomeTablename+"_wrapper").show("slow");
	//$("#"+sSomeTablename+"_awake_button").hide("slow");
};

/*****************************************************************
 *     GENERAL ROW FUNCTIONS                                     *
 *****************************************************************/

// retrieve the row number of a node (0-based)
// t.i.: its index in the set of all retrieved database rows
fn.getRowIndex = function(sSomeTable, nRow){
	
	if (typeof sSomeTable == 'string')
		sSomeTable = mt.getDataTableObjectOf(sSomeTable);
	var currentTableSettings = sSomeTable.fnSettings();
	var currentStartIndex = currentTableSettings._iDisplayStart;
	var currentRowOnScreen = fn.getRowNumberOnScreen(sSomeTable, nRow);
 return ( currentStartIndex + currentRowOnScreen );
};


// retrieve the row number of a node (0-based) on the screen
// (so this number will be between 0 en the number of visible rows on the screen)
fn.getRowNumberOnScreen = function(sSomeTable, nRow){

	if (typeof sSomeTable == 'string')
		sSomeTable = mt.getDataTableObjectOf(sSomeTable);
	return $.inArray(nRow, sSomeTable.fnGetNodes());
};

// get all displayed rows from a table
fn.getAllRows = function(sSomeTable){

	if (typeof sSomeTable == 'string')
		sSomeTable = mt.getDataTableObjectOf(sSomeTable);
	
	// This might return an empty object
	// which is ok, since it allows a call like (fn.getAllRows(t)).each(function(){..});
	// to work properly. So we mustn't return null;
	return sSomeTable.$('tr');
};

// get the id of a row containing a given node
fn.getRowId = function(nNode){
	
	return fn.getNodeId(nNode);	
};


// get the node of the row which contains some values;
// if no node was found with these values, return null
fn.getNodeWhere = function(sSomeTable, aFieldsAndValues){
	
	var aAllRows = fn.getAllRows(sSomeTable);
	var nNodeToReturn = null;
	var sTableName = (typeof sSomeTable == 'object' ? fn.getTableName(sSomeTable) : sSomeTable);
	
	// pre-check: are the given fields correct?
	for (sFieldName in aFieldsAndValues)
	{
		
		if ($.inArray(sFieldName, mt.getListOfColumnsOf(sTableName)) < 0)
			{
			fn.message("Fout", 
					"Verkeerde aanroep van fn.getNodeWhere('"+sTableName+"'). " +
					"De opgegeven kolom '"+sFieldName+"' komt niet voor in tabel '"+sTableName+"'.");
			return nNodeToReturn;
			}
	}
	
	// check each row, and stop as soon as we have found a row containing field with the right values
	aAllRows.each(function(){
		
		var bAllValuesWhereFound = true;
		for (sFieldName in aFieldsAndValues)
			{
			// does the table content match the values we are looking for?
			var sFieldValueInTable = fn.getDataFromCellInRowNode(sSomeTable, this, sFieldName);
			if (aFieldsAndValues[sFieldName] == sFieldValueInTable)
				{
				// yes? then carry on and check the next value
				continue;
				}
			else
				{
				// no? stop right away and check the next row
				bAllValuesWhereFound = false;
				break;
				}
			}
		
		// if this row contained the right values, return its node
		if (bAllValuesWhereFound)
			{
			nNodeToReturn = this;
			return false; // break, we are ready
			}
	});
	
	
	return nNodeToReturn;
};


fn.getAllNodesWhere = function(sSomeTable, aFieldsAndValues){
	
	var aAllRows = fn.getAllRows(sSomeTable);
	var aNodesToReturn = new Array();
	
	// check each row, and stop as soon as we have found a row containing field with the right values
	aAllRows.each(function(){
		
		var bAllValuesWhereFound = true;
		for (sFieldName in aFieldsAndValues)
			{
			// does the table content match the values we are looking for?
			var sFieldValueInTable = fn.getDataFromCellInRowNode(sSomeTable, this, sFieldName);
			if (aFieldsAndValues[sFieldName] == sFieldValueInTable)
				{
				// yes? then carry on and check the next value
				continue;
				}
			else
				{
				// no? stop right away and check the next row
				bAllValuesWhereFound = false;
				break;
				}
			}
		
		// if this row contained the right values, return its node
		if (bAllValuesWhereFound)
			{
			aNodesToReturn.push(this);			
			}
	});	
	
	return $(aNodesToReturn);
};


// get the node of the row which has a given id;
// if no node was found with this id, return null
fn.getNodeWhereIdIs = function(sSomeTable, sId){
	
	var aAllRows = fn.getAllRows(sSomeTable);
	var nNodeToReturn = null;
	
	// check each row, and stop as soon as we have found a row containing field with the right values
	aAllRows.each(function(){		
		if (this.id == sId)
			{
			nNodeToReturn = this;
			return false; // break, we are ready
			}			
	});	
	
	return nNodeToReturn;
};

/*****************************************************************
 *     ROW SELECTION FUNCTIONS                                   *
 *****************************************************************/

// unselect all the rows in the table
fn.unselectAllRows = function(sSomeTable){
	
	if (typeof sSomeTable == 'object')
		sSomeTable = fn.getTableName(sSomeTable);
	
	$('#'+sSomeTable+' tbody').find("tr").removeClass('row_selected');
	
};

// select all the rows in the table
fn.selectAllRows = function(sSomeTable){
	
	if (typeof sSomeTable == 'object')
		sSomeTable = fn.getTableName(sSomeTable);
	
	$('#'+sSomeTable+' tbody tr').each(function(){
		if ( !$(this).hasClass("row_selected"))
			$(this).toggleClass('row_selected');
	});
};

fn.selectRow = function(sSomeTable, iRowNumber){
	
	if (typeof sSomeTable == 'object')
		sSomeTable = fn.getTableName(sSomeTable);
	
	var eRowSelector = $('#'+sSomeTable+' tbody tr:eq('+iRowNumber+')');
	if ( iRowNumber>=0 && !eRowSelector.hasClass("row_selected"))
		{
		eRowSelector.toggleClass('row_selected');
		}
	else if (iRowNumber<0)
		{
		fn.message("Fout", "fn.selectRow('"+sSomeTable+"') " +
				"is aangeroepen met een negatieve waarde voor iRowNumber: "+iRowNumber);
		};
};

fn.unselectRow = function(sSomeTable, iRowNumber){
	
	if (typeof sSomeTable == 'object')
		sSomeTable = fn.getTableName(sSomeTable);
	
	var eRowSelector = $('#'+sSomeTable+' tbody tr:eq('+iRowNumber+')');
	if ( eRowSelector.hasClass("row_selected"))
		eRowSelector.toggleClass('row_selected');
};

// get the nodes of the rows selected in a table
// input	: a table name or table object
// returns	: a node array
fn.getSelectedRowsFrom = function(someTable){
	
	if (typeof someTable == 'string')
		someTable = mt.getDataTableObjectOf(someTable);
		
	return row.fnGetSelected(someTable);
};


// get the first selected row from a selection
// returns	: a node
fn.getFirstSelectedRowFrom = function(someTable){
	
	if (typeof someTable == 'string')
		someTable = mt.getDataTableObjectOf(someTable);
	
	var aAllSelectedRows = fn.getSelectedRowsFrom(someTable);
	
	return aAllSelectedRows[0];
	
};
// same as above, but returns a row number instead of a row node
fn.getIndexOfFirstSelectedRowFrom = function(someTable){
	
	if (typeof someTable == 'string')
		someTable = mt.getDataTableObjectOf(someTable);
	
	var aRows = someTable.fnGetNodes();
	var i =0;
	while (i<aRows.length){
		if ( $(aRows[i]).hasClass('row_selected') )
			return i;
		i++;
	}
	return -1;
};

// get the node where the cursor is on (highlight row when scrolling up or down)
fn.getActiveRowNode = function(sSomeTable){
	
	if (typeof sSomeTable == 'object')
		sSomeTable = fn.getTableName(sSomeTable);
	
	// There is no active node in a table which hasn't focus!
	// So: pick the first selected row, 
	// else if there is no selected row, pick the top row
	// else if table is empty, return null
	if (kf.getActiveTable() != sSomeTable) 
		{
		var aSelection = fn.getSelectedRowsFrom(sSomeTable);
		var aAllRows = fn.getAllRows(sSomeTable);
		return (aSelection.length>0) ? aSelection[0] : ( (aAllRows.length>0) ? aAllRows[0] : null);
		}
	
	return fn.getAllRows(sSomeTable)[kf.getActiveRowNumber()];
};

// get the number of selected rows of a table
// return a integer
fn.getNumberOfSelectedRows = function(sSomeTable){
	
	if (typeof sSomeTable == 'string')
		sSomeTable = mt.getDataTableObjectOf(sSomeTable);
	
	var aRows = sSomeTable.fnGetNodes();
	var iNumberSelected = 0;
	var i =0;
	while (i<aRows.length){
		if ( $(aRows[i]).hasClass('row_selected') )
			iNumberSelected++;
		i++;
	}
	return iNumberSelected;
};


/*****************************************************************
 *     GENERAL CELL FUNCTIONS                                    *
 *****************************************************************/

// Get a cell node, given a row node (or another cell node in the same row) and a column name.
// This function is meant for reading data from cell or putting data into it.
// To modify the css of a given cell element, use fn.getCellElement() instead.
fn.getCellNode = function(someTable, nNode, sColumnName){
	
	if (typeof someTable == 'object')
		someTable = fn.getTableName(someTable);
	
	var iColIndex = fn.getVisibleColumnNumberOf(someTable, sColumnName);
	
	return fn.getRowNode(nNode).childNodes[iColIndex];
};

// Get a cell element, given a row node (or another cell node in the same row) and a column name.
// This function is meant to access an element so as to be able to modify its CSS and such.
// To read from or put data into a cell node, use fn.getCellNode() instead.
fn.getCellElement = function(someTable, nNode, sColumnName){
	
	if (typeof someTable == 'object')
		someTable = fn.getTableName(someTable);
	
	var iThisCellNumber = fn.getVisibleColumnNumberOf(someTable, sColumnName);
	
	return $('td:eq('+iThisCellNumber+')', fn.getRowNode(nNode));
};


//check of a node is an editable cell
fn.isEditableNode = function(sSomeTableName, nNode){
	
	var aPos = mt.getDataTableObjectOf(sSomeTableName).fnGetPosition( nNode );
	var oTableConfig = conf.getTableConfig(sSomeTableName);
	var sColumnName = mt.getListOfColumnsOf(sSomeTableName)[aPos[2]];
	var oColumnConfig = conf.getColumnConfig(oTableConfig, sColumnName);
	return conf.getEditability(oColumnConfig);
};


// uncheck a list of checkboxes
fn.uncheckCheckboxes = function(oTable, nNode, aListOfColumns, fnCallback){
	
	if (typeof oTable != 'object')
		oTable = mt.getDataTableObjectOf(oTable);
	
	var sTableName = fn.getTableName(oTable);
	// make sure we have a row node, and get its position on the screen
	nNode = fn.getRowNode(nNode);
	var iRowNumber = fn.getRowNumberOnScreen(oTable, nNode);
	
	for (var i=0; i<aListOfColumns.length; i++)
		{
		// get the the setting of the checkbox
		var sColumnName = aListOfColumns[i];			
		var iVisibleColumnNumber = fn.getVisibleColumnNumberOf(oTable, sColumnName);
		var eCellSelector = $("#"+sTableName+" tbody tr").eq(iRowNumber).find("td").eq(iVisibleColumnNumber).find("input").eq(0);
		// prop is the most reliable (http://jquery-howto.blogspot.nl/2013/02/jquery-test-check-if-checkbox-checked.html)
		var bSetting = (eCellSelector.prop("checked") == true);
		
		// if checkbox is checked, uncheck it! 
		if (bSetting)
			{			
			// focus is needed for the checkbox handler, which need to know
			// if the checkbox was clicked, or only the surrounding cell
			eCellSelector.focus();
			eCellSelector.click();
			eCellSelector.blur();	
			}
		}
	
	if (fnCallback!=null)
			fnCallback();
};


// simulate a click on a checkbox
fn.toggleCheckbox = function(someTable, nNode, sColumnName, fnCallback){
	
	if (typeof someTable == 'string')
		someTable = mt.getDataTableObjectOf(someTable);
	
	var eCellSelector = (fn.getCellElement(someTable, nNode, "keurmerk")).find("input").eq(0);
	
	// we need to get focus onto the checkbox, otherwise the click
	// action we be seen as cell click instead of checkbox click (and thus ignored!)
	eCellSelector.focus();
	eCellSelector.click();
	
	// release focus
	eCellSelector.blur();
	
	if (fnCallback!=null)
		fnCallback();
};


/*****************************************************************
 *     GENERAL COLUMN FUNCTIONS                                  *
 *****************************************************************/

// give the name of the column one has clicked on, given a cell node
fn.getNameOfColumnForThisNode = function(sSomeTable, nNode){
	
	if (typeof sSomeTable == 'object')
		sSomeTable = fn.getTableName(sSomeTable);
	
	var aPos = mt.getDataTableObjectOf(sSomeTable).fnGetPosition(nNode);
	var sColumnName = mt.getListOfColumnsOf(sSomeTable)[aPos[2]];
	return sColumnName;
};

// get the name of a column given its visible index
fn.getNameOfColumnForThisVisibleIndex = function( sSomeTable, iIndex){
	
	if (typeof sSomeTable == 'object')
		sSomeTable = fn.getTableName(sSomeTable);
	
	var sColumnName = mt.getListOfVisibleColumnsOf(sSomeTable)[iIndex];
	return sColumnName;
};

// get the column number of a cell (given all columns, visible or not)
fn.getColumnNumberOf = function(sSomeTable, sCellName){
	
	if (typeof sSomeTable == 'object')
		sSomeTable = fn.getTableName(sSomeTable);
	
	// here we use getListOfColumnsOf because this function is about all columns, not only the visible ones
	return $.inArray(sCellName, mt.getListOfColumnsOf(sSomeTable));
};
// get the visible column number of a cell
fn.getVisibleColumnNumberOf = function(sSomeTable, sCellName){
	
	if (typeof sSomeTable == 'object')
		sSomeTable = fn.getTableName(sSomeTable);
	
	return $.inArray(sCellName, mt.getListOfVisibleColumnsOf(sSomeTable));
};


/*****************************************************************
 *     GENERAL NODE FUNCTIONS                                    *
 *****************************************************************/

// Check if a node is a cell node
fn.isCellNode = function(nNode){
	
	// if a node isn't a TR element, it must be a cell node
	var bNodeIsNotATrElement = !$(nNode).is("tr");	
	return bNodeIsNotATrElement;
};

// Check if a node in the last one of an array of nodes
fn.isLastNodeOf = function(nNode, aSelection){
	var length = aSelection.length;
	return ($.inArray(nNode, aSelection) == length-1);
};

// Get the id of a node
// If the node is a cell, get the parent node of it (the row)
// and return its id
fn.getNodeId = function(nNode){	
	
	nNode = fn.getRowNode(nNode);	
	return nNode.id;
};

// Get the row node, given a node of some kind (row or cell)
// This is to make sure we have a row, instead of only a cell
fn.getRowNode = function(nNode){
	
	if (fn.isCellNode(nNode) && nNode != null)
		return nNode.parentNode;
	return nNode;
};


/*****************************************************************
 *     GET DATA FROM A CELL OR ROW                               *
 *****************************************************************/

// get the content of a cell which is a sibling of another cell node, given that node
//   and the name of that cell we want the content from
// input	: table name or table object, cell node, name of sibling cell node
// returns	: a string
fn.getDataFromSiblingNode = function(confTable, confNode, sOtherColumnName){
	
	var sTablename;
	if (typeof confTable == 'string')
		{
		sTablename = confTable+""; // trick to prevent copy by reference
		confTable = mt.getDataTableObjectOf(sTablename);
		}
	else
		{
		sTablename = fn.getTableName(confTable);
		}

	var rowNumber = confTable.fnGetPosition(confNode)[0];
	var colNr = $.inArray(sOtherColumnName, mt.getListOfColumnsOf(sTablename));
	
	if (colNr<0)
		{
		fn.message("Fout", "fn.getDataFromSiblingNode('"+sTablename+"') " +
				"is aangeroepen met een niet bestaande kolomnaam: '"+sOtherColumnName+"'.");
		return "";
		}
	else
		{
		return confTable.fnGetData(rowNumber, colNr);
		}	
};


// get the content of a cell, 
// given a table name or datatable object, and a cell node
// input	: table name or table object, cell node
// returns	: a string
fn.getDataFromCellNode = function(someTable, nNode){
	
	if (typeof someTable == 'string')
		someTable = mt.getDataTableObjectOf(someTable);
	
	return someTable.fnGetData(nNode);
};

// get the content of a cell, given a table name, a selected row (node) and a column name
// input	: table name or table object, row node, string
// returns	: a string
fn.getDataFromCellInRowNode = function(someTable, nNode, sColumnName){
	return fn.getDataFromCellNamed(someTable, nNode, sColumnName);
};
fn.getDataFromCellNamed = function(someTable, nNode, sColumnName){
	
	if (typeof someTable == 'object')
		someTable = fn.getTableName(someTable);
	
	// get column number given column name	
	var colNr = $.inArray(sColumnName, mt.getListOfColumnsOf(someTable));
	
	if (colNr<0)
		{
		fn.message("Fout", "fn.getDataFromCellNamed('"+someTable+"') " +
				"is aangeroepen met een niet bestaande kolomnaam: '"+sColumnName+"'.");
		
		return "";
		}
	else
		{
		// make sure we have a row node (if we got a cell node)
		var nNode = fn.getRowNode(nNode);
		
		return mt.getDataTableObjectOf(someTable).fnGetData(nNode, colNr);
		}	
	
};



// get the content of a whole column, given its name
fn.getDataFromColumn = function(someTable, sColumnName){
	
	// get all rows
    var aAllRows = fn.getAllRows(someTable);
    
    // collect all needed token_indexes_id's of all rows into an array
    var aAllRowData = new Array();
    aAllRows.each(function(){ 
        var sData = fn.getDataFromCellInRowNode(someTable, this, sColumnName);
        aAllRowData.push(sData);
    });
    
    return aAllRowData;
};



// Get selected text within a node, 
// and also get the start and end positions of the selected text.
//
// Adapted from: 
// http://stackoverflow.com/questions/7991474/calculate-position-of-selected-text-javascript-jquery
//
// Example of use:
//   var sel = fn.getSelectionWithin(node);
//   alert(sel.start + ": " + sel.end + " = " + sel.text);
fn.getSelectedTextInNode = function(someTable, nNode) {	
	
	var element = nNode;
	var start = 0, end = 0;
    var sel, range, priorRange;
    
    // all browsers, except IE before version 9
    if (typeof window.getSelection != "undefined") 
    {    	
        range = window.getSelection().getRangeAt(0);        
        priorRange = range.cloneRange();
        priorRange.selectNodeContents(element);
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
        priorRange.moveToElementText(element);
        priorRange.setEndPoint("EndToStart", range);
        start = priorRange.text.length;
        text = range.text;
    }
    
    // Compute the true indexes of the text selection
    // This is needed because detection of positions doesn't take into account the tags and 
    //  html entitie names within the original string. We will need to remove highlighting
    //  in advance, because highlighting tags are no part of the original string
    var oTrueIndexes = getTrueIndexes( 
    		fn.removeHighlight( fn.getDataFromCellNode(someTable, nNode) ), 
    		$.trim(text), start);
    
    // return an object with 4 parts: selection start/end indexes, selection text, and reliability
    return {
        start: oTrueIndexes.start,
        end: oTrueIndexes.end,
        text: $.trim(text),
        reliable: fn._selectionIsReliable(element, oTrueIndexes.start, oTrueIndexes.end, $.trim(text))
    };
};

// Select a word within a node just by clicking on it, 
// and also get the start and end positions of the selected word.
// [ adapted from fn.getSelectedTextInNode() ]
fn.getWordClickedUponInNode = function(someTable, nNode){
	
	var element = nNode;
	var start = 0, end = 0;
    var sel, range, priorRange, wholeRange;
    
    // all browsers, except IE before version 9
    if (typeof window.getSelection != "undefined") 
    {    	
        range = window.getSelection().getRangeAt(0);   
        wholeRange = range.cloneRange();
        wholeRange.selectNodeContents(element);
        priorRange = range.cloneRange();
        priorRange.selectNodeContents(element);
        priorRange.setEnd(range.startContainer, range.startOffset);
        start = priorRange.toString().regexLastIndexOf(/(\s|\.|,|;|:|\(|\[|'|"|„|”)/)+1;
        end   = wholeRange.toString().regexIndexOf(/(\s|\?|!|\.|,|;|:|\)|\]|'|"|„|”)/, start+1);
        text  = wholeRange.toString().substring(start, end);
    } 
    
    // IE before version 9
    else if (typeof document.selection != "undefined" &&
            (sel = document.selection).type != "Control") 
    {
        range = sel.createRange();
        wholeRange = document.body.createTextRange();
        wholeRange.moveToElementText(element);
        priorRange = document.body.createTextRange();
        priorRange.moveToElementText(element);
        priorRange.setEndPoint("EndToStart", range);
        start = priorRange.text.regexLastIndexOf(/\s|\.|,|;|:|\(|\[/)+1;
        end   = wholeRange.text.regexIndexOf(/(\s|\?|!|\.|,|;|:|\)|\])/, start+1);
        text  = wholeRange.text.substring(start, end);
    }
    
    // Compute the true indexes of the text selection
    // This is needed because detection of positions doesn't take into account the tags and 
    //  html entitie names within the original string. We will need to remove highlighting
    //  in advance, because highlighting tags are no part of the original string
    var oTrueIndexes = getTrueIndexes( 
    		fn.removeHighlight( fn.getDataFromCellNode(someTable, nNode) ), 
    		$.trim(text), start);
    
    // return an object with 4 parts: selection start/end indexes, selection text, and reliability
    return {
        start: oTrueIndexes.start,
        end: oTrueIndexes.end,
        text: $.trim(text),
        reliable: fn._selectionIsReliable(element, oTrueIndexes.start, oTrueIndexes.end, $.trim(text))
    };
};

// Get selected text within a node, 
// given a table, a node, and the name of the column in which the text is selected 
fn.getSelectedTextInSiblingNode = function(someTable, nNode, sColumnName) {
	
	if (typeof someTable == 'string')
		someTable = mt.getDataTableObjectOf(someTable);
	
	var nSiblingNode = fn.getCellNode(someTable, nNode, sColumnName);
	
	return fn.getSelectedTextInNode(someTable, nSiblingNode);
};

// subroutine of fn.getWordClickedUponInNode() and fn.getSelectedTextInNode()
// adapted from: http://help.dottoro.com/ljxgoxcb.php
fn._selectionIsReliable = function(nNode, iStart, iEnd, sText){
	
    var nCurrentNode = nNode;

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





/*****************************************************************
 *     PUT DATA INTO A CELL OR ROW                               * 
 *     (without database update)                                 *
 *****************************************************************/


// put some content into a cell, given a table name, a selected row (node) and a column name
// input	: table name or table object, node, column name as a string, content as a string, 
// return	: n.a.
fn.putDataIntoCell = function(sSomeTable, nNode, sColumnName, sContent){
	
	if (typeof sSomeTable == 'object')
		sSomeTable = fn.getTableName(sSomeTable);
	
	if ( fn.isCellNode(nNode) )
		{
		fn.message("Fout", 
				"Let op: fn.putDataIntoCell('"+sSomeTable+"') is aangeroepen met een cell node, " +
				"terwijl de functie een row node vereist.");
		return;
		}
	
	var sNodeId = fn.getNodeId(nNode);	
	if (typeof sNodeId == 'undefined' || $.trim(sNodeId) == '')
		{
		fn.message("Fout",
				"Fout bij aanroep van fn.putDataIntoCell('"+sSomeTable+"'). "+
				"Tabel '"+sSomeTable+"' heeft geen IDs. Rijen aanwijzen zonder IDs is onmogelijk. " +
				"[Het antwoord van de server bevat waarschijnlijk geen waarde voor DT_RowId " +
				"omdat de tabel geen primary key noch pkid-veld heeft]");
		return;
		}
	
	// put content into right cell, given column name
	// since we update the screen cells, we use the 'visible' column index here
	
	
	// PUT DATA INTO THE RIGHT CELL
	// the first two lines are commented out: the technique used was working
	// as it did put the content in the right cell, but it did not update
	// the table content in the working memory. This has a disadvantage
	// since trying to access the content of cells which were updated on the screen but not in momory
	// is impossible. To solve this, we make use of the native Datatables function
	// fnUpdate with the two last parameters set to false (no redraw, no predraw)
	
	// KEEP THIS just in case
	//var colNr = $.inArray(sColumnName, mt.getListOfVisibleColumnsOf(sSomeTable));
	//$( fn.getRowNode(nNode) ).find("td").eq(colNr).html(sContent);	
	
	var colNr = $.inArray(sColumnName, mt.getListOfColumnsOf(sSomeTable));
	
	mt.getDataTableObjectOf(sSomeTable).fnUpdate(sContent, nNode, colNr, false, false);
	
	// special for IE: prevents the text of the cell from getting selected when updating
	// the content of a cell;
	// The trick is: leaves the cursor at the left
	$(nNode).setSelection();

};


/************************************************************
 *       UPDATE THE DATABASE GIVEN A ROW/CELL               *
 ************************************************************/

// update a 'visible' database table (that is loaded into the datatables interface), 
// given a row/cell node, an array of columns names, an array of values to update the columns with
// or
// given a row/cell node, a column name, a value to update the column with
// 
// input	: table name or table object, node, array of column names
// returns	: n.a.
fn.updateDatabaseGivenANode = function(sSomeTablename, nNode, aColumnNames, aColumnValues, redrawTable, fnCallback){
	
	if (typeof sSomeTablename == 'object')
		sSomeTablename = fn.getTableName(sSomeTablename);
	
	if ( isArray(aColumnNames) && (aColumnNames.length != aColumnValues.length) )
		{
		fn.message("Fout", 
				"Fout: fn.updateDatabaseGivenANode('"+sSomeTablename+"') is aangeroepen met een " +
				"verschillend aantal kolomnamen en kolomwaarden " +
				"(de aantallen horen gelijk te zijn).");
		return;
		}
	
	var sNodeId = fn.getNodeId(nNode);	
	if (typeof sNodeId == 'undefined' || $.trim(sNodeId) == '')
		{
		fn.message("Fout",
				"Fout bij aanroep van fn.updateDatabaseGivenANode('"+sSomeTablename+"'). "+
				"Tabel '"+sSomeTablename+"' heeft geen IDs. Rijen aanwijzen zonder IDs is onmogelijk. " +
				"[Het antwoord van de server bevat waarschijnlijk geen waarde voor DT_RowId " +
				"omdat de tabel geen primary key noch pkid-veld heeft]");
		return;
		}
	
	
	// if the input is an array of column names
	if ( isArray(aColumnNames) ) // most reliable array test
		{	
		
		// if no values were given, compute them from the table
		if (aColumnValues == null)
		{
			var aColumnValues = new Array();
			for (var i=0; i<aColumnNames.length; i++)
			{
				var contentOfThisColumn = fn.isCellNode(nNode) ?
						fn.getDataFromSiblingNode(sSomeTablename, nNode, aColumnNames[i]):
							fn.getDataFromCellNamed(sSomeTablename, nNode, aColumnNames[i]);
				
				aColumnValues.push(contentOfThisColumn);
			}
		}
		
		// update the database
		var url = "../lexit/lexit/table/setvalue"; 
		$.ajax( {
			"type": "GET",
			"url": url,
			"data": {
				"db_name": getHttpParams().get("db"),
				"row_id": fn.getNodeId(nNode),
				"table_name": sSomeTablename,
				"column_name": aColumnNames.join(ARG_INTERNAL_SEPARATOR),
				"new_value": aColumnValues.join(ARG_INTERNAL_SEPARATOR), 
				"dummy": getUniqueNumber()
				},
		 	"dataType": "xml", // get response as xml
		 	"success": function(xml) {
		 		if (redrawTable)
		 			fn.refreshTable(sSomeTablename);
		 		if (fnCallback!=null)
		 			fnCallback();
		 		},
			"error": function(jqXHR, textStatus, errorThrown){
				fn.refreshTable(sSomeTablename);
				fn.message("Fout", 
					"Fout bij aanroep van fn.updateDatabaseGivenANode('"+sSomeTablename+"'): "+
					textStatus+" "+errorThrown);
				}
			} );		
		}
	
	// if the input is only one column name/value, or one cell node
	else if ( 
			// no cell names implies use of a cell node, otherwise we don't know on which cell to focus
			(aColumnNames == null && fn.isCellNode(nNode)) 
			|| 
			// a cell name but no value is good enough: we'll find the right node from the given node (and get its value)
			typeof aColumnNames == 'string'
			)
		{
		// if the column name was not given, compute it from the given cell node
		var sColumnName = (aColumnNames != null) ? 
				aColumnNames : fn.getNameOfColumnForThisNode(sSomeTablename, nNode);
		
		// if the column value was not given, compute it from the given cell node		
		var sColumnValue = (aColumnValues != null) ? aColumnValues : 
			fn.getDataFromCellNamed(sSomeTablename, fn.getRowNode(nNode), sColumnName);
		
		// update the database
		var url = "../lexit/lexit/table/setvalue"; 
		$.ajax( {
			"type": "GET",
			"url": url,
			"data": {
				"db_name": getHttpParams().get("db"),
				"row_id": fn.getNodeId( fn.getRowNode(nNode) ),				
				"table_name": sSomeTablename,
				"column_name": sColumnName,
				"new_value": sColumnValue, 
				"dummy": getUniqueNumber()
				},
		 	"dataType": "xml", // get response as xml
		 	"success": function(xml) {
		 		if (redrawTable)
		 			fn.refreshTable(sSomeTablename);
		 		if (fnCallback!=null)
		 			fnCallback();
		 		},
			"error": function(jqXHR, textStatus, errorThrown){
				fn.refreshTable(sSomeTablename);
				fn.message("Fout",
					"Fout bij aanroep van fn.updateDatabaseGivenANode('"+sSomeTablename+"'): "+
					textStatus+" "+errorThrown);
				}
			} );
		}
	else {
		fn.message("Fout", 
				"De argumenten bij fn.updateDatabaseGivenANode('"+sSomeTablename+"') " +
				"zijn niet correct opgegeven. " +
				"Controleer het configuratiebestand.");
	}
};


/***********************************************************************************
 *     UPDATE THE DATABASE GIVEN SOME FIELD VALUES (instead of row id = pk id)     *
 ***********************************************************************************/

// update a table which is not loaded into the datatables interface, so it is "hidden", 
// given an array of columns names and values to match
// and an array of columns names and values to update 
// input	: table name or table object, associative array of fields and values to match,
//			  associative array of fiels and values to update
// returns	: n.a.
fn.updateDatabaseGivenFieldValues = function(sSomeTablename, aFieldsAndValuesToMatch, 
		aFieldsAndValuesToUpdate, redrawTable, fnCallback){
	
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
	 		// if table is loaded, we update it on the screen
	 		if ( mt.tableExists(sSomeTablename) && redrawTable)
	 			fn.refreshTable(sSomeTablename);
	 		if (fnCallback!=null)
	 			fnCallback();
	 		},
	 	"error": function(jqXHR, textStatus, errorThrown){
			// if table is loaded, we update it on the screen
	 		if ( mt.tableExists(sSomeTablename))
	 			fn.refreshTable(sSomeTablename);
	 		fn.message("Fout", 
	 			"Fout bij aanroep van fn.updateDatabaseGivenFieldValues('"+sSomeTablename+"'): "+
				textStatus+" "+errorThrown);
			}
		} );
};


/*****************************************************************
 *     INSERT DATA INTO THE DATABASE                             *
 *****************************************************************/


// insert a record into a table
// given an array of columns names and values to add
// input	: table name or table object, an associative array of fields and values to add,
//			  field from which the value should be returned after insertion (eg. an ID, otherwise NULL),
//			  a boolean (true = redraw table upon success)
// returns	: id of the inserted record as a string
fn.insertIntoDatabase = function(sSomeTablename, aFieldsAndValuesToAdd, returnField, redrawTable, fnCallback){
	
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
	var url = "../lexit/lexit/table/insertvalue"; 
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
	 		// if table is loaded and redrawing is required, we update it on the screen
	 		if ( mt.tableExists(sSomeTablename) && redrawTable)
	 			fn.refreshTable(sSomeTablename);
	 		if (fnCallback!=null)
	 			fnCallback();
	 		// return the inserted row id
	 		return resp;
	 		},
	 	"error": function(jqXHR, textStatus, errorThrown){
			// if table is loaded, we update it on the screen
	 		if ( mt.tableExists(sSomeTablename))
	 			fn.refreshTable(sSomeTablename);
	 		fn.message("Fout", 
	 			"Fout bij aanroep van fn.insertIntoDatabase('"+sSomeTablename+"'): "+
				textStatus+" "+errorThrown);
			}
		} );
};

/*****************************************************************
 *      GET ID FROM A RECORD IN THE DATABASE                     *
 *****************************************************************/

// get the id of a record, given a table and some fields and values to match
// input	: table name or table object, an associative array of fields and values to match
// returns	: an id as a string
fn.getIdFromDatabase = function(sSomeTablename, aFieldsAndValues){
	
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
	var url = "../lexit/lexit/table/get_id_of_record"; 
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
	 		// return the returned id
	 		var resp = fn.getDbResponse(xml);
	 		return (resp == "null" ? null : resp);
	 		},
	 	"error": function(jqXHR, textStatus, errorThrown){
	 		fn.message("Fout", 
	 				"Fout bij aanroep van fn.getIdFromDatabase('"+sSomeTablename+"'): "+
				textStatus+" "+errorThrown);
			}
		} );
};


/*****************************************************************
 *     REMOVE DATA FROM THE DATABASE                             *
 *****************************************************************/

// remove a record from the database,
// given a row id
// input	: table name or table object, a row as a node
// returns	: n.a.
fn.removeFromDatabaseGivenANode = function(sSomeTablename, nNode, redrawTable, fnCallback){
	
	if (typeof sSomeTablename == 'object')
		sSomeTablename = fn.getTableName(sSomeTablename);
	
	var sNodeId = fn.getNodeId(nNode);	
	if (typeof sNodeId == 'undefined' || $.trim(sNodeId) == '')
		{
		fn.message("Fout",
				"Fout bij aanroep van fn.removeFromDatabaseGivenANode('"+sSomeTablename+"'). "+
				"Tabel '"+sSomeTablename+"' heeft geen IDs. Rijen aanwijzen zonder IDs is onmogelijk. " +
				"[Het antwoord van de server bevat waarschijnlijk geen waarde voor DT_RowId " +
				"omdat de tabel geen primary key noch pkid-veld heeft]");
		return;
		}
	
	
	nNode = fn.getRowNode(nNode);
	
	// update the database
	var url = "../lexit/lexit/table/delete_row"; 
	$.ajax( {
		"type": "GET",
		"url": url,
		"data": {
			"row_id": fn.getNodeId(nNode),
			"db_name": getHttpParams().get("db"),
			"table_name": sSomeTablename,
			"dummy": getUniqueNumber()
			},
	 	"dataType": "xml", // get response as xml
	 	"success": function(xml) {
	 	// if table is loaded, we update it on the screen
	 		if ( mt.tableExists(sSomeTablename) && redrawTable)
	 			fn.refreshTable(sSomeTablename);
	 		if (fnCallback!=null)
	 			fnCallback();
	 		},
	 	"error": function(jqXHR, textStatus, errorThrown){
			// if table is loaded, we update it on the screen
	 		if ( mt.tableExists(sSomeTablename))
	 			fn.refreshTable(sSomeTablename);
	 		fn.message("Fout", 
	 			"Fout bij aanroep van fn.removeFromDatabaseGivenANode('"+sSomeTablename+"'): "+
				textStatus+" "+errorThrown);
			}
		} );
	
	
};


// remove some records from the database,
// given an array of column names and values to match
// input	: table name or table object, an associative array of fields and values to match
// returns	: n.a.
fn.removeFromDatabaseGivenFieldValues = function(sSomeTablename, aFieldsAndValuesToMatch, redrawTable, fnCallback){
	
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
	var url = "../lexit/lexit/table/delete_row_without_id";
 
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
	 		// if table is loaded, we update it on the screen	 		
	 		if ( mt.tableExists(sSomeTablename) && redrawTable)
	 			fn.refreshTable(sSomeTablename);
	 		if (fnCallback!=null)
	 			fnCallback();
	 		},
	 	"error": function(jqXHR, textStatus, errorThrown){
			// if table is loaded, we update it on the screen
	 		if ( mt.tableExists(sSomeTablename))
	 			fn.refreshTable(sSomeTablename);
	 		fn.message("Fout",
	 			"Fout bij aanroep van fn.removeFromDatabaseGivenFieldValues('"+sSomeTablename+"'): "+
				textStatus+" "+errorThrown);
			}
		} );
};



/*************************************************
 *  READ A SINGLE RECORD FROM THE DATABASE       *
 *  and return it in an array                    *
 *************************************************/

fn.getRecord = function(sSomeTablename, sRecordId, fnCallback){
	
	if (typeof sSomeTablename == 'object')
		sSomeTablename = fn.getTableName(sSomeTablename);
	
	var url = "../lexit/lexit/table/get_record";
	
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
	 		fn.message("Fout", 
	 			"Fout bij aanroep van fn.getRecord('"+sSomeTablename+"'): "+
				textStatus+" "+errorThrown);
			}
		} );
	
};


fn.getRecordGivenFieldValues = function(sSomeTablename, aFieldsAndValuesToMatch, fnCallback){
	
	if (typeof sSomeTablename == 'object')
		sSomeTablename = fn.getTableName(sSomeTablename);
	
	var aColNamesToMatch = new Array();
	var aValuesToMatch = new Array();
	
	for (var sFieldName in aFieldsAndValuesToMatch)
		{
		aColNamesToMatch.push(sFieldName);
		aValuesToMatch.push(aFieldsAndValuesToMatch[sFieldName]);
		}
	
	var url = "../lexit/lexit/table/get_record_without_id";
	
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
	 		fn.message("Fout", 
	 			"Fout bij aanroep van fn.getRecord('"+sSomeTablename+"'): "+
				textStatus+" "+errorThrown);
			}
		} );
	
};



// this is a subroutine of fn.getRecord, fn.getRecordGivenFieldValues and fn.callFunction
// read the response from the database, and put the record value into an array
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


/******************************************************************
 *  CALL A FUNCTION FROM THE DATABASE THAT RETURNS A RECORD       *
 *  and update some record cells with it                          *
 ******************************************************************/

// usually, the database returns the function name as a column name,
// but in case it does not, the returned column name can be specified in sColumnName

// if no table name is given to put the function output into, the output will be sent to this array
var functionCallOuput = new Array();
// retrieve function output
fn.getFunctionOutput = function(){
	return functionCallOuput;
};

fn.callFunction = function(sSomeFunctionName, aFunctionArguments,
		sSomeTableName, nNode, sCellName, sResultColumnName, fnCallback){	
	
	// special case: if we call the function only with the 3 key parameters
	//   like fn.callFunction(sSomeFunctionName, aFunctionArguments, fnCallback)
	
	if (typeof sSomeTableName == 'function'
		&& nNode == null
		&& sCellName == null
		&& sResultColumnName == null
		&& fnCallback == null)
		{
		fn.callFunction(sSomeFunctionName, aFunctionArguments, null, null, null, null, sSomeTableName);
		}
	
	// normal case: each parameter if present or, at least, at its expected place
	//   and some of the final parameters might be left away
	
	else
		{
		
		var url = "../lexit/lexit/table/call_function";
		
		 
		$.ajax( {
			"type": "GET",
			"url": url,
			"async": false, // needed to block code execution while awaiting the server response
			"data": {
				"db_name": getHttpParams().get("db"),
				"function_name": sSomeFunctionName,
				"args": aFunctionArguments.join(ARG_INTERNAL_SEPARATOR),
				"dummy": getUniqueNumber() 
				},
		 	"dataType": "xml", // get response as xml
		 	"success": function(xml) {
		 		
		 		// get function output from xml
	 			var oFieldsAndValues = fn._getRecordFromXmlResponse(xml);
		 		// check what the return column name is: we will use it to access
		 		// the returned table value from the associative array.
	 			var sColumnNameToReadFrom = (sResultColumnName != null ? sResultColumnName : sSomeFunctionName.toLowerCase());
	 			
		 		// if some table name was given as an argument,
		 		// we will update that table with the output of the function
		 		if (sSomeTableName != null)
		 			{	 			
		 			// get the returned table value 
		 			var sValueForTable = oFieldsAndValues[sColumnNameToReadFrom];
		 			
		 			// if a node was given, update that node
		 			if (nNode != null)
		 				{	 					 		
				 		fn.putDataIntoCell(sSomeTableName, nNode, sCellName, sValueForTable);
		 				}
		 			// if no node was given, update each row
		 			else
		 				{
		 				var aValuesForTable = sValueForTable.split(ARG_INTERNAL_SEPARATOR);
		 				if (aValuesForTable.length != fn.getCurrentDisplayLength(sSomeTableName))
		 					{
		 					fn.message("Fout",
		 							"Fout bij aanroep van fn.callFunction('"+sSomeFunctionName+"', '"+sSomeTableName+"'). "+
		 							"Het aantal rijen dat de functie '"+sSomeFunctionName+"' teruggeeft, " +
		 							"komt niet overeen met het aantal getoonde rijen op het scherm.");
		 					}
		 				else
		 					{
		 					var aAllRows = fn.getAllRows(sSomeTableName);
			 				aAllRows.each(function(i){
			 					fn.putDataIntoCell(sSomeTableName, this, sCellName, aValuesForTable[i]);	 					
			 					});
		 					}	 				
		 				}		 		
		 			}
		 		
		 		// store the output for later retrieval 
		 		if (typeof oFieldsAndValues[sColumnNameToReadFrom] != 'undefined')
		 			functionCallOuput = oFieldsAndValues[sColumnNameToReadFrom].split(ARG_INTERNAL_SEPARATOR);
		 			 		
		 		// if some callback function is given, call it now		 		
		 		if (fnCallback!=null) 
		 			fnCallback(oFieldsAndValues);
		 		},
		 	"error": function(jqXHR, textStatus, errorThrown){
		 		fn.message("Fout", 
		 			"Fout bij aanroep van fn.callFunction('" + sSomeFunctionName + "')"+
		 			(sSomeTableName != null ? " met tabel '" + sSomeTableName + "'": "" )+
		 			": "+
					textStatus+" "+errorThrown);			
				}
			} );
		
		}
	
};





/*************************************************
 *  READ A SINGLE RECORD FROM THE DATABASE       *
 *  and load it into the datatables interface    *
 *************************************************/

fn.callRecord = function(sSomeTablename, nNode, sRecordId, aColumnsToUpdate, fnCallback){
	
	if (typeof sSomeTablename == 'object')
		sSomeTablename = fn.getTableName(sSomeTablename);		
	
	var url = "../lexit/lexit/table/get_record";
	
	$.ajax( {
		"type": "GET",
		"url": url,
		"data": {
			"db_name": getHttpParams().get("db"),
			"table_name": sSomeTablename,
			"id": sRecordId,
			"dummy": getUniqueNumber() 
			},
	 	"dataType": "xml", // get response as xml
	 	"success": function(xml) {
	 		// if table is loaded, we update it on the screen
	 		if ( mt.tableExists(sSomeTablename))
	 			fn._callRecord(sSomeTablename, nNode, aColumnsToUpdate, xml, fnCallback);
	 		},
	 	"error": function(jqXHR, textStatus, errorThrown){
			// if table is loaded, we update it on the screen
	 		if ( mt.tableExists(sSomeTablename))
	 			fn.refreshTable(sSomeTablename);
	 		fn.message("Fout",
	 			"Fout bij aanroep van fn.callRecord('"+sSomeTablename+"'): "+
				textStatus+" "+errorThrown);
			}
		} );
	
};

// this is a subroutine of fn.callRecord
// read the response from the database, and put the record value into the table on the screen
fn._callRecord = function(sSomeTablename, nNode, aColumnsToUpdate, xml, fnCallback){
	
	var oTableConfig = conf.getTableConfig(sSomeTablename);
	
	$(xml).find("oneColumn").each(function(){
		
		var columnItems = $(this).find("item");
		var columnName = columnItems.eq(0).text();
		var columnValue = columnItems.eq(1).text();
		var oColumnConfig = conf.getColumnConfig(oTableConfig, columnName);
		
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
		fn.putDataIntoCell(sSomeTablename, fn.getRowNode(nNode), columnName, columnValue);
		
	});	
	
	// if some callback function is given, call it now
	if (fnCallback!=null) fnCallback();
	
};




/***************************************
 *           INTERACTION               *
 ***************************************/


// equivalent of js native 'alert'

fn.message = function(sTitle, sMessage){
	
	var sP = $("<p></p>").html(sMessage);
	var dialogDivId = "dialog-message"+getUniqueNumber();
	var sDiv = $("<div></div>").attr("id",dialogDivId).attr("title", sTitle).append(sP);
	
	$(document.body).append(sDiv);
	
	$( "#"+dialogDivId ).dialog({
		modal: true,
		buttons: {
			Ok: function() {
				$( this ).dialog( "close" );
				$( this ).remove();
				}
		}
	});
};


// equivalent of js native 'confirm'

fn.confirm = function(sTitle, sMessage, fnFunction){
	
	if (fnFunction == null)
		{
		fn.message("Fout", "Illegale aanroep van fn.confirm(sTitle, sMessage, fnFunction). Parameter fnFunction is niet gedefinieerd.");
		}
	else
		{
		var sP = $("<p></p>").html(sMessage);
		var dialogDivId = "dialog-message"+getUniqueNumber();
		var sDiv = $("<div></div>").attr("id",dialogDivId).attr("title", sTitle).append(sP);
		
		$(document.body).append(sDiv);
		
		$( "#"+dialogDivId ).dialog({
			modal: true,
			buttons: {
				Ok: function() {
					$( this ).dialog( "close" );
					$( this ).remove();
					fnFunction();
					},
				Cancel: function() {
					$( this ).dialog( "close" );
					$( this ).remove();
					}
			}
		});
		}
	
	
};


// Generate a prompt pop-up, requesting some input from the user
// The output can be retrieved by using fn.getPromptUserInput()

fn.prompt = function(sTitle, aFieldNames, aValues, fnCallback, bTextarea, aColsAndRows){
	
	fn._clearUserInput();
	
	var promptDivId = "dialog-form"+getUniqueNumber();
	
	var promptDiv = $("<div></div>")
		// Keep the dialog in front, as elements with class dataTables_length are also brought in front
		// For some strange reason, the z-index needs to be pretty high, otherwise it doesn't work at all!
		.css("z-index", ($(".dataTables_length").eq(0).css("z-index"))+9999) 
		.attr("id", promptDivId)
		.attr("title", sTitle)
		.css("font-size", "12px");
	var promptForm = $("<form></form>");
	var promptFieldSet = $("<fieldset></fieldset>");
	for (var i=0; i<aFieldNames.length; i++)
		{
		var fieldLC = $.trim(keepOnlyLettersAndDigits(aFieldNames[i].toLowerCase()));
		var label = $("<label></label>")
			.attr("for", fieldLC)
			.text($.trim(aFieldNames[i]));
		
		var sInputType = bTextarea ? "textarea" : "input";
		var input = $("<"+sInputType+"></"+sInputType+">")
			.attr("type", "text" )
			.attr("name", fieldLC)
			.attr("id", "prompt_"+fieldLC);
		
		// preset the input value, if available
		if (bTextarea)
			input.text(aValues!=null ? aValues[i]: "");  // textarea
		else
			input.val(aValues!=null ? aValues[i]: "");   // input
		
		// if cols and rows are given, set them!
		if (bTextarea && aColsAndRows!= null && aColsAndRows.length ==2)
			{
			input.attr("cols", aColsAndRows[0]);
			input.attr("rows", aColsAndRows[1]);
			}
		
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
        width: 350,
        modal: true,
        buttons: [
                   {
                	 text: "OK",
                	 click: function(){
                 		for (var i=0; i<aFieldNames.length; i++)
                		{
                			var fieldLC = $.trim(keepOnlyLettersAndDigits(aFieldNames[i].toLowerCase()));
                			fn._registerUserInput(
                					// fieldname
                					$.trim(aFieldNames[i]),
                					// value for this field, entered by the user
                					$("#prompt_"+fieldLC).val(), 
                					// index of this field/value 
                					i
                					);
                		}
                		// call callback
                 		if (fnCallback != null)
                 			fnCallback(); 
                		$( this ).dialog( "close" );
                		$( this ).remove(); 
                	},
                	id: 'dialog_accept_button'
                   },
                   
                   {
                	text: "Annuleren",
                	click: function() {
                        $( this ).dialog( "close" );
                        $( this ).remove();
                    }
                   }
        ]
	}) 
	.keyup(function() {		 
		if (kf.isPressed("enter"))
			{		
			$( "#dialog_accept_button" ).click();
			return false;
			}
	});
	
	$( "#"+promptDivId ).dialog( "open" );
	
};


// Generate a prompt pop-up, requesting the user to reorder a set of data
// The output can be retrieved by using fn.getPromptUserInputOrder()

fn.promptReorder = function(sTitle, aFieldNames, fnCallback){
	
	fn._clearUserInput();
	
	var promptDivId = "dialog-form"+getUniqueNumber();
	var sortableId = "sortable"+getUniqueNumber();
	
	var promptDiv = $("<div></div>")
		// Keep the dialog in front, as elements with class dataTables_length are also brought in front
		// For some strange reason, the z-index needs to be pretty high, otherwise it doesn't work at all!
		.css("z-index", ($(".dataTables_length").eq(0).css("z-index"))+9999) 
		.attr("id", promptDivId)
		.attr("title", sTitle)
		.css("font-size", "12px");
	
	var sortableUl = $("<ul></ul>")
		.attr("id", sortableId)
		.css("list-style-type", "none")
		.css("margin", "0")
		.css("padding", "0")
		.css("width", "60%");
	
	var aOriginalOrder = new Array();
	
	for (var i=0; i<aFieldNames.length; i++)
		{
		var fieldLC = $.trim(keepOnlyLettersAndDigits(aFieldNames[i].toLowerCase()));
		aOriginalOrder.push(fieldLC);
		
		var liElement = $("<li></li>")
			.addClass( "ui-state-default" )
			.text( $.trim(aFieldNames[i]) )
			.attr("id", fieldLC)
			.css("margin", "0 3px 3px 3px")
			.css("padding", "0.4em")
			.css("padding-left", "1.5em")
			.css("font-size", "1.4em")
			.css("height", "18px");		
		var spanElement = $("<span></span>")
			.addClass( "ui-icon ui-icon-arrowthick-2-n-s" )	
			.css("position", "absolute")
			.css("margin-left", "-1.3em");
		liElement.append(spanElement);
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
        width: 350,
        modal: true,
        buttons: [
                  {
                	  text: "OK",
                	  click: function(){
                  		for (var i=0; i<aFieldNames.length; i++)
                		{
                			var fieldLC = $.trim(keepOnlyLettersAndDigits(aFieldNames[i].toLowerCase()));
                			
                			fn._registerUserInput(
                					// fieldname
                					$.trim(aFieldNames[i]),
                					// no value entered, since user only had to (re)order the set of data
                					"", 
                					// index of reordered fieldname
                					$.inArray($("#"+sortableId).find("li").eq(i).attr("id"), aOriginalOrder)
                					);
                		}
                		// call callback
                		fnCallback(); 
                		$( this ).dialog( "close" );
                		$( this ).remove(); 
                	},
                	id: 'dialog_accept_button'
                  },
                  {
                	  text: "Annuleren",
                	  click: function() {
                          $( this ).dialog( "close" );
                          $( this ).remove();
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
// get user whole input 
fn.getPromptUserInput = function(){
	return aPromptUserInputValues;
};
// get the order of the field and values, just in case the user changed the order
fn.getPromptUserInputOrder = function(){
	return aPromptUserInputFieldOrder;
};
// get user input for one given field name
fn.getPromptUserInput = function(sFieldName){
	var index = $.inArray(sFieldName, aPromptUserInputFields);
	return (index>-1) ? $.trim(aPromptUserInputValues[index]) : null;
};



// modify the custom buttons 

fn.setCustomButtonName = function(sTableName, iButtonNumber, sNewName){
	
	if (typeof sTableName == 'object')
		sTableName = fn.getTableName(sTableName);
	
	var oButton = $("div#"+sTableName+"_custombutton_"+iButtonNumber+" button#"+sTableName+"_button_"+iButtonNumber);
	oButton.html(sNewName);
};

fn.setCustomButtonCss = function(sTableName, iButtonNumber, sProperty, sNewValue){
	
	if (typeof sTableName == 'object')
		sTableName = fn.getTableName(sTableName);
	
	var oButton = $("div#"+sTableName+"_custombutton_"+iButtonNumber+" button#"+sTableName+"_button_"+iButtonNumber);
	oButton.css(sProperty, sNewValue);
};

fn.getCustomButtonCss = function(sTableName, iButtonNumber, sProperty){
	
	if (typeof sTableName == 'object')
		sTableName = fn.getTableName(sTableName);
	
	var oButton = $("div#"+sTableName+"_custombutton_"+iButtonNumber+" button#"+sTableName+"_button_"+iButtonNumber);
	return oButton.css(sProperty);
	
};




/**********************************************************
 *             FILTER BOXES FUNCTIONS                     *
 **********************************************************/

// PART 1
// ------
// BEWARE: The following functions affect the filter boxes in the user interface
//         but have no effect on the filters variables (this happens only when
//         the user presses 'enter'
//         If you want to access the filters of the engine, see 'PART 2'

// put some data into a search filter box
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

// get the content of a search filter box
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


// go to the right page of a table, given some column name and a value it should contain
fn.goToTheRightPage = function(sSomeTablename, sColumnName, sColumnValue){
	
	if (typeof sSomeTablename == 'object')
		sSomeTablename = fn.getTableName(sSomeTablename);
	
	mt.getDataTableObjectOf(sSomeTablename).fnFilterReset(false);
	
	// initialize compulsory filters arrays
	// (these are filters in addition to the "go to"-filter)
	var filterColumnNames = new Array();
	var filterValues = new Array();
	
	// find sorting column and direction	
	var sSortColumn = fn.getSortingColumn(sSomeTablename);
	var sSortDirection = fn.getSortingDirection(sSomeTablename);
	
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
	sf.getRowNumber(sSomeTablename, sColumnName, sColumnValue, sSortColumn, sSortDirection, filterColumnNames, filterValues);
	
};

// get the type of the filterbox:
// checkbox, select, text
fn.getTypeOfFilterBox = function(sSomeTablename, sColumnName){
	
	if (typeof sSomeTablename == 'object')
		sSomeTablename = fn.getTableName(sSomeTablename);
	
	var iColumnNameIndex = fn.getColumnNumberOf(sSomeTablename, sColumnName);
	
	// checkbox 
	var sColumnType = mt.getListOfColumnTypesOf(sSomeTablename)[iColumnNameIndex];
	if ( $.inArray(sColumnType, ["bit varying(1)", "boolean"]) >=0)
		return "checkbox";
	
	// select 
	var aSelectBoxValues = mt.getListOfAllowedValuesInColumnsOf(sSomeTablename)[iColumnNameIndex];
	if ( aSelectBoxValues.length>1 )
		return "select";
	
	// default: text
	return "text";
};



// PART 2
// ------
// BEWARE: The following functions affect the filters variables,
//         but have no effect on the filter boxes in the user interface
//         If you want to access the filter boxes, see 'PART 1'


// clear all the filters
 
fn.clearAllFilters = function(sSomeTable){
	
	if (typeof sSomeTable == 'string')
		sSomeTable = mt.getDataTableObjectOf(sSomeTable);
	
	sSomeTable.fnFilterClear();
};


// put the filters back into their state at initialisation time
// (this might have a quite different effect than fn.clearAllFilters
//  as this restore the initialisation values set by 'filter:'
//  in the config file; beware: only if 'keepfilter':true is set) 
fn.resetAllFilters = function(sSomeTable, bUpdateSearchBoxesValues){
	
	if (typeof sSomeTable == 'string')
		sSomeTable = mt.getDataTableObjectOf(sSomeTable);
	
	sSomeTable.fnFilterReset(bUpdateSearchBoxesValues);
};


// set some filter values for a given table
// Beware: this erases existing settings. If you want to keep the current
// search settings, use fn.addFilters instead.

fn.setFilters = function(sSomeTable, oFilters, bUpdateSearchBoxesValues){
	
	if (typeof sSomeTable == 'string')
		sSomeTable = mt.getDataTableObjectOf(sSomeTable);

	sSomeTable.fnFilterSet(oFilters, bUpdateSearchBoxesValues);
};


// get the filters values for a given table
fn.getFilters = function(sSomeTable){
	
	if (typeof sSomeTable == 'string')
		sSomeTable = mt.getDataTableObjectOf(sSomeTable);
	
	return sSomeTable.fnFilterGet();
};


// set the global filter for a given table

fn.setGlobalFilter = function(sSomeTable, sValue){

	if (typeof sSomeTable == 'string')
		sSomeTable = mt.getDataTableObjectOf(sSomeTable);
	
	sSomeTable.fnGlobalFilterSet(sValue);
};


// get the value of the global filter for a given table

fn.getGlobalFilter = function(sSomeTable){
	
	if (typeof sSomeTable == 'string')
		sSomeTable = mt.getDataTableObjectOf(sSomeTable);
	
	return sSomeTable.fnGlobalFilterGet();
};


// add some filters to the current filter settings
// (this is different from fn.setFilters, which erases existing settings)

fn.addFilters = function(sSomeTable, oFilters){
	if (typeof sSomeTable == 'string')
		sSomeTable = mt.getDataTableObjectOf(sSomeTable);
	
	sSomeTable.fnFilterAdd(oFilters);
};




/*************************************************************
 *                 STRING FUNCTIONS                          *
 *************************************************************/

// escape quotes and such
fn.escapeSingleQuotes = function(str){
	return str.replace(/\'/g, "\\'");
};
fn.escapeDoubleQuotes = function(str){
	return str.replace(/\"/g, '\\\"');
};
fn.quote = function(str){
	return "'"+fn.escapeSingleQuotes(str)+"'";
};
fn.escapeRegexChars = function(str){
	return str.replace(/[-[\]{}()*+?.,\\^$|#]/g, "\\$&");
	//return str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

//highlight some part of a string
fn.getHighlight = function(sString, aaIndexes, sColor){
	
	// make sure to remove highlight from input string, otherwise we might corrupt it
	// (by overlapping spans that bite each other)
	sString = fn.removeHighlight(sString);
	
	// check if indexes are given the right way:
	// when only one pair of positions needs to be given, it's easy to forget to put that array in an array
	// (that is: [] is wrong, [[]] is correct)
	if ( isArray(aaIndexes) )
		{
		if ( !isArray( aaIndexes[0]) )
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


// remove highlighting from a string
fn.removeHighlight = function(sString){

	var sNewString = sString.replace(/(\<span style='background: .+?\>)(.+?)(\<\/span\>)/gi, "$2");
	return sNewString;
};







/*******************************************
 *           EXTRA FUNCTIONS               *
 *******************************************/

// get the user name (of user which has logged in)
fn.getCurrentUser = function(){
	return USERNAME;
};


// get current project
fn.getCurrentProject = function(){
	return getHttpParams().get("db");
};

// set the user name (the name of the user who has logged in is normally got from webservice
// but it is possible to set it here by giving a string, if needed that way)
fn.setCurrentUser = function(sName){
	
	if (sName != null)
		USERNAME = sName;
	
	var url = "../lexit/lexit/table/get_username"; 
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
	 		fn.message("Fout", "Er is een fout opgetreden: "+
				textStatus+" "+errorThrown);
			}
		} );
};


// return the current time, with a special format
// if null, default is YYYY-MM-DD HH-MI-SS
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

// check if the inline edit function (jEditable) is active now
// (this might be needed to prevent key events when typing data in an input box)
fn.editFunctionIsActiveNow = function(){
	return $("input:focus").elementExists();
};


// this a subroutine, needed to parse database (server) response if needed
fn.getDbResponse = function(xml){
	
	lastDbResponse = $(xml).find("response").text();	
	return lastDbResponse;
};

// return the last db response (which was stored the last time fn.getDbResponse was called)
var lastDbResponse = null;
fn.getLastDbResponse = function(){
	return lastDbResponse;
};
