


/**
 * 
 * !!! IMPORTANT !!!!
 * 
 * This class is about table properties registration:
 * 
 * It has no internal logic (which is organized in the other name spaces)
 * The only purpose of this mt name space is to
 * allow clean and safe registration of properties of all tables 
 * without creating a mess!
 */

var mt = {};

// DATATABLES data part

// hash mapping table name to its Datatable object (oTable)
var hoTable = new Hashtable();

// base table of view ?
var hsTableType = new Hashtable();

// hash mapping table name to its view type (table vs. form)
var hsViewType = new Hashtable();

// hash mapping table name to its list of Datatables columns properties
var hsaDatatablesProps = new Hashtable();

// hash mapping table name to some filter function to be called upon initialization
var hsfTableFilterFunction = new Hashtable();
var hsfTableFilterValues = new Hashtable();


// hash mapping table name to boolean saying wether the table setting callback was already called 
var hbTableCallbackWasCalledAlready = new Hashtable();

// hash mapping table name to boolean saying wether the table was called already
var hbTableWasCalledAlready = new Hashtable(); 

//hash mapping table name to boolean saying wether the table must be optimal or not
var hbTableMustBeOptimal = new Hashtable(); 

// tables part

var dbTableNames = new Array();		// array of table names
var sTableID = new Array();			// array of tags IDs to which tables are attached

// hash mapping table name to its list of columns
var hsaListOfColumns = new Hashtable();

// hash mapping table name to its list of column types
var hsaListOfColumnTypes = new Hashtable();

// hash mapping table name to a list of allowed values (in case of user-defined types)
var hsaListOfAllowedValuesPerColumn  = new Hashtable();

// hash mapping table name to its list of columns truly visible in GUI
var hsaListOfVisibleColumns = new Hashtable();

// hash mapping table name to a list of allowed values (user-defined types) for columns truly visible in GUI
var hsaListOfAllowedValuesPerVisibleColumn = new Hashtable();

// hash mapping table name to its list of column types for columns truly visible in GUI
var hsaListOfTypesOfVisibleColumns = new Hashtable();


// remember search box that has focus, for each table
// needed to differentiate the GoTo-value (from box that has focus)
// from other filters (no focus)
var hSearchBoxThatHasFocus = new Hashtable();

// undo memory stacks 
var undoStacks = new Hashtable();
var undoTooltips = new Hashtable();

// form view:
// max width of a column in form view
var hMaxColumnTitleWidth = new Hashtable();
// dimension of the form table
var hFormViewDimensionHash = new Hashtable();

// columns highlight
var hNodeColorsMap = new Hashtable();
var hNodeHighlightColorsMap = new Hashtable();
var hSortingColumnForColorMap = new Hashtable();



// search and replace  input memory 
var hPreviousOldString = new Hashtable();
var hPreviousNewString = new Hashtable();
var hPreviousColumnToAlter = new Hashtable();
var hPreviousActionToPerform = new Hashtable();

// row selection allowed or not
var hbSelectionAllowed = new Hashtable();



// details of all available tables
// this consists of description, type (table/view), comment
var haAvailableTableDetails = new Hashtable();

mt.addAvailableTableDetails = function(sTableName, aDetails){
	haAvailableTableDetails.put(sTableName, aDetails);
};

mt.getAvailableTableDetails = function(sTableName){
	return haAvailableTableDetails.get(sTableName);
};



// view type (table view vs. form view)

mt.toggleViewType = function(sTableName){
	var viewType = ( mt.getViewType(sTableName) == 'table') ? 'form' : 'table';
	mt.setViewType(sTableName, viewType);
};

mt.getViewType = function(sTableName){
	return hsViewType.get(sTableName);
};

mt.setViewType = function(sTableName, sViewType){
	hsViewType.put(sTableName, sViewType);
};


// get/set if table callback was called already or not

mt.setCallbackWasCalledAlready = function(sTableName){
	hbTableCallbackWasCalledAlready.put(sTableName, true);
};
mt.getCallbackWasCalledAlready = function(sTableName){
	var calledAlready = hbTableCallbackWasCalledAlready.get(sTableName);
	return calledAlready == null ? false : calledAlready;
};


//get/set if table was called already or not

mt.setTableWasCalledAlready = function(sTableName, bValue){
	if (typeof bValue == 'undefined') bValue = true;
	hbTableWasCalledAlready.put(sTableName, bValue);
};
mt.getTableWasCalledAlready = function(sTableName){
	var calledAlready = hbTableWasCalledAlready.get(sTableName);
	return calledAlready == null ? false : calledAlready;
};


//get/set if table is in optimal mode or not

mt.setTableMustBeOptimal = function(sTableName, bOptimal){
	
	head.setColorOfColumnSelectionButton(sTableName, bOptimal);
	hbTableMustBeOptimal.put(sTableName, bOptimal);
	
	// when this is being reset, we must clean some cache depending of this
	mt.formviewCleanDimensions(sTableName);
	mt.formviewCleanColumnTitleWidth(sTableName);
};
mt.getTableMustBeOptimal = function(sTableName){
	var bOptimal = hbTableMustBeOptimal.get(sTableName);
	return bOptimal == null ? false : bOptimal;
};



// get number of tables loaded

mt.getNumberOfLoadedTables = function(){
	return dbTableNames.length;
};


// get list of loaded tables

mt.getListOfLoadedTables = function(){
	return dbTableNames;
};


// check if a table is the main loaded table (that is: the first loaded table) 

mt.isMainTable = function(sTableName){
	return ( mt.getListOfLoadedTables()[0] == sTableName );
};

// clean all hashed and such

mt.removeAllTableRecords = function(){
	
	hoTable = new Hashtable();
	hsTableType = new Hashtable();
	hsViewType = new Hashtable();
	hsaDatatablesProps = new Hashtable();
	hsfTableFilterFunction = new Hashtable();
	hsfTableFilterValues = new Hashtable();
	dbTableNames = new Array();
	sTableID = new Array();
	hsaListOfColumns = new Hashtable();
	hsaListOfColumnTypes = new Hashtable();
	hsaListOfVisibleColumns = new Hashtable();
	hsaListOfTypesOfVisibleColumns = new Hashtable();
	hsaListOfAllowedValuesPerColumn = new Hashtable();
	hsaListOfAllowedValuesPerVisibleColumn = new Hashtable();
	hSearchBoxThatHasFocus = new Hashtable();
	undoStacks = new Hashtable();
	undoTooltips = new Hashtable();
	hMaxColumnTitleWidth = new Hashtable();
	hFormViewDimensionHash = new Hashtable();
	hNodeColorsMap = new Hashtable();
	hNodeHighlightColorsMap = new Hashtable();
	hSortingColumnForColorMap = new Hashtable();
	
};



// create a table

// create a table records and give it a list of filters to apply to it upon initialization
// This is needed when a table is called by another one (upon click on an id or such)
// Upon the first call, the table is created with filters
// Upon later calls, the filters are modified by the fnCallTableWithFilter function
mt.createTableRecordWithFilter = function(sSomeTablename, fnCallTableWithFilter, aCallTableWithFilterValues){
	
	dbTableNames.push(sSomeTablename);
	hsViewType.put(sSomeTablename, 'table');
	hsfTableFilterFunction.put(sSomeTablename, fnCallTableWithFilter );
	hsfTableFilterValues.put(sSomeTablename, aCallTableWithFilterValues);
};



// get the filter values

mt.getFilterValues = function(sSomeTablename){
	
	// we return the second element since the value return by hsfTableFilterValues
	// is [ sTabelName, {field: value, ...} ]
	if (hsfTableFilterValues.get(sSomeTablename) != null)
		return hsfTableFilterValues.get(sSomeTablename)[1];
	
	return null;
};


// remove a table and all its registered properties

mt.removeTableRecord = function(sSomeTablename){
	
	hoTable.remove(sSomeTablename);
	hsTableType.remove(sSomeTablename);
	hsViewType.remove(sSomeTablename);
	hsaDatatablesProps.remove(sSomeTablename);
	hsfTableFilterFunction.remove(sSomeTablename);
	hsfTableFilterValues.remove(sSomeTablename);
	hsaListOfColumns.remove(sSomeTablename);
	hsaListOfColumnTypes.remove(sSomeTablename);
	hsaListOfVisibleColumns.remove(sSomeTablename);
	hsaListOfTypesOfVisibleColumns.remove(sSomeTablename);
	hsaListOfAllowedValuesPerColumn.remove(sSomeTablename);
	hsaListOfAllowedValuesPerVisibleColumn.remove(sSomeTablename);
	hSearchBoxThatHasFocus.remove(sSomeTablename);
	undoStacks.remove(sSomeTablename);
	undoTooltips.remove(sSomeTablename);
	hMaxColumnTitleWidth.remove(sSomeTablename);
	hFormViewDimensionHash.remove(sSomeTablename);
	hNodeColorsMap.remove(sSomeTablename);
	hNodeHighlightColorsMap.remove(sSomeTablename);
	hSortingColumnForColorMap.remove(sSomeTablename);
	
	
	dbTableNames = jQuery.grep(dbTableNames, function(value) {
		  return value != sSomeTablename;
		});
	sTableID = jQuery.grep(sTableID, function(value) {
		  return value != sSomeTablename;
		});
	
};


// check table existence

mt.tableExists = function(sSomeTablename){
	
	if ( $.inArray(sSomeTablename, dbTableNames)>-1 && hoTable.get(sSomeTablename) != null )
		return true;
	
	return false;
};



	
// functions for list of columns of a table
	
mt.getListOfColumnsOf = function(sSomeTablename){
	
	var aSomeList = hsaListOfColumns.get(sSomeTablename);
	return (aSomeList == null) ? new Array() : aSomeList;
};
	

mt.setListOfColumnsOf = function(sSomeTablename, aSomeList){
	
	hsaListOfColumns.put(sSomeTablename, aSomeList);
};




// functions for lists of column types of a table

mt.getListOfColumnTypesOf = function(sSomeTablename){
	
	var aSomeList = hsaListOfColumnTypes.get(sSomeTablename);
	return (aSomeList == null) ? new Array() : aSomeList;
};
	
mt.setListOfColumnTypesOf = function(sSomeTablename, aSomeList){
	
	hsaListOfColumnTypes.put(sSomeTablename, aSomeList);
};


// Postgres ENUM types:
// the allowed values is an array of arrays,
// mapping a column index to its allowed values (when it's a custom type)

mt.getListOfAllowedValuesInColumnsOf = function(sSomeTablename){
	
	var aSomeList = hsaListOfAllowedValuesPerColumn.get(sSomeTablename);
	return (aSomeList == null) ? new Array() : aSomeList;
};
	
mt.setListOfAllowedValuesInColumnsOf = function(sSomeTablename, aSomeList){
	
	hsaListOfAllowedValuesPerColumn.put(sSomeTablename, aSomeList);
};


// -----------

// functions for lists of visible columns of a table
// and also for types of those columns

mt.getListOfVisibleColumnsOf = function(sSomeTablename){
	
	var aSomeList = hsaListOfVisibleColumns.get(sSomeTablename);
	return (aSomeList == null) ? new Array() : aSomeList;
};
	
mt.setListOfVisibleColumnsOf = function(sSomeTablename, aSomeList){
	
	hsaListOfVisibleColumns.put(sSomeTablename, aSomeList);
};


// Postgres ENUM types, for visible columns

mt.getListOfAllowedValuesInVisibleColumnsOf = function(sSomeTablename){
	
	var aSomeList = hsaListOfAllowedValuesPerVisibleColumn.get(sSomeTablename);	
	return (aSomeList == null) ? new Array() : aSomeList;
};
	
mt.setListOfAllowedValuesInVisibleColumnsOf = function(sSomeTablename, aSomeList){
	
	hsaListOfAllowedValuesPerVisibleColumn.put(sSomeTablename, aSomeList);
};




mt.getListOfTypesOfVisibleColumnsOf = function(sSomeTableName){
	
	var aSomeList = hsaListOfTypesOfVisibleColumns.get(sSomeTableName);
	return (aSomeList == null) ? new Array() : aSomeList;
};

mt.setListOfTypesOfVisibleColumnsOf = function(sSomeTableName, aSomeList){
	hsaListOfTypesOfVisibleColumns.put(sSomeTableName, aSomeList);
};


// functions for lists of datatables properties of a table

mt.getDatatablesPropsOf = function(sSomeTablename){
	
	var aSomeList = hsaDatatablesProps.get(sSomeTablename);
	return (aSomeList == null) ? new Array() : aSomeList;
};
	

mt.setDatatablesPropsOf = function(sSomeTablename, aSomeList){
	
	hsaDatatablesProps.put(sSomeTablename, aSomeList);
};





// functions for lists of oTables objects

mt.getDataTableObjectOf = function(sSomeTablename){
	
	var oSomeOTable = hoTable.get(sSomeTablename);
	return (oSomeOTable == null) ? null : oSomeOTable;
};
	

mt.setDataTableObjectOf = function(sSomeTablename, oSomeOTable){
	
	hoTable.put(sSomeTablename, oSomeOTable);
};


// table type

mt.getTableType = function(sSomeTablename){
	return hsTableType.get(sSomeTablename);
};

mt.setTableType = function(sSomeTablename, sTableType){
	hsTableType.put(sSomeTablename, sTableType.toLowerCase());
};




// Functions for filter on table function
// This is meant for executing some per-column filter upon initialization
// of a table. The filter function is stored in the hash hsfTableFilterFunction
// and the corresponding entry in this hash is called after
// initialization of the table, when the
// column filter input fields are built (in sf.enableSearchFields).

mt.callTableFilterFunction = function(sSomeTablename){
	
	// this value is [ sTablename, {field: value, ...} ]
	var aCallTableWithFilterValue = hsfTableFilterValues.get(sSomeTablename);
	
	if (aCallTableWithFilterValue != null)
		{		
		var func = hsfTableFilterFunction.get(sSomeTablename);
		func.apply(new Object(), aCallTableWithFilterValue);
		}
};




// *** search function memory ***

// remember the last search box that was clicked upon (this one has focus)
mt.rememberLastSearchBoxClickUpon = function(sTableName, iIndex){
	
	sSearchBoxThatHasFocus = fn.getNameOfColumnForThisVisibleIndex(sTableName, iIndex);
	
	hSearchBoxThatHasFocus.put(sTableName, sSearchBoxThatHasFocus);
};
// get the name of the last searchbox that was clicked upon
mt.getSearchBoxNameThatHasFocus = function(sTableName){
	
	return hSearchBoxThatHasFocus.get(sTableName);
};

// *** undo function ***

// store/get the data to restore (undo) and the corresponding tooltips (telling what will be restored)
mt.undoStacksPut = function(sSomeTableName, undoStack){
	undoStacks.put(sSomeTableName, undoStack);
};
mt.undoTooltipsPut = function(sSomeTableName, tooltipStack){
	undoTooltips.put(sSomeTableName, tooltipStack);
};

mt.undoStacksGet = function(sSomeTableName){
	return undoStacks.get(sSomeTableName);
};
mt.undoTooltipsGet = function(sSomeTableName){
	return undoTooltips.get(sSomeTableName);
};


// *** form view ***

// store/get/clean the max column width per table
mt.formviewGetColumnTitleWidth = function(sSomeTablename){
	return hMaxColumnTitleWidth.get(sSomeTablename);
};
mt.formviewPutColumnTitleWidth = function(sSomeTablename, iMaxColumnTitleWidth){
	hMaxColumnTitleWidth.put(sSomeTablename, iMaxColumnTitleWidth);
};
mt.formviewCleanColumnTitleWidth = function(sSomeTablename){
	hMaxColumnTitleWidth.remove(sSomeTablename);
};

// store/get/clean the form table dimensions
mt.formviewGetDimensions = function(sSomeTablename){
	return hFormViewDimensionHash.get(sSomeTablename);
};
mt.formviewPutDimensions = function(sSomeTablename, aDimensions){
	hFormViewDimensionHash.put(sSomeTablename, aDimensions);
};
mt.formviewCleanDimensions = function(sSomeTablename){
	hFormViewDimensionHash.remove(sSomeTablename);
};


// *** columns highlight ***

mt.columnsHighlight_getNodeColors = function(sSomeTableName){
	return hNodeColorsMap.get(sSomeTableName);
};
mt.columnsHighlight_putNodeColors = function(sSomeTableName, aNodeColorsMap){
	hNodeColorsMap.put(sSomeTableName, aNodeColorsMap);
};

mt.columnsHighlight_getNodeHighlightColors = function(sSomeTableName){
	return hNodeHighlightColorsMap.get(sSomeTableName);
};
mt.columnsHighlight_putNodeHighlightColors = function(sSomeTableName, aNodeHighlightColorsMap){
	hNodeHighlightColorsMap.put(sSomeTableName, aNodeHighlightColorsMap);
};

mt.columnsHighlight_getSortingColumnForColor = function(sSomeTableName){
	return hSortingColumnForColorMap.get(sSomeTableName);
};
mt.columnsHighlight_putSortingColumnForColor = function(sSomeTableName, iDefaultSortColNr){
	hSortingColumnForColorMap.put(sSomeTableName, iDefaultSortColNr);
};





// *** search and replace input memory ***

var hPreviousOldString = new Hashtable();
var hPreviousNewString = new Hashtable();
var hPreviousColumnToAlter = new Hashtable();
var hPreviousActionToPerform = new Hashtable();

mt.getPreviousOldString = function(sSomeTableName){
	return hPreviousOldString.get(sSomeTableName);
};
mt.putPreviousOldString = function(sSomeTableName, sPreviousOldString){
	hPreviousOldString.put(sSomeTableName, sPreviousOldString);
};

mt.getPreviousNewString = function(sSomeTableName){
	return hPreviousNewString.get(sSomeTableName);
};
mt.putPreviousNewString = function(sSomeTableName, sPreviousNewString){
	hPreviousNewString.put(sSomeTableName, sPreviousNewString);
};

mt.getPreviousColumnToAlter = function(sSomeTableName){
	return hPreviousColumnToAlter.get(sSomeTableName);
};
mt.putPreviousColumnToAlter = function(sSomeTableName, sPreviousColumnToAlter){
	hPreviousColumnToAlter.put(sSomeTableName, sPreviousColumnToAlter);
};

mt.getPreviousActionToPerform = function(sSomeTableName){
	return hPreviousActionToPerform.get(sSomeTableName);
};
mt.putPreviousActionToPerform = function(sSomeTableName, sPreviousActionToPerform){
	hPreviousActionToPerform.put(sSomeTableName, sPreviousActionToPerform);
};



// ** row selection allowed or not **
mt.putRowSelectionIsAllowed = function(sSomeTablename, bTrueOrNot){
	hbSelectionAllowed.put(sSomeTablename, bTrueOrNot);
};

mt.rowSelectionIsAllowed = function(sSomeTablename){	
	return hbSelectionAllowed.get(sSomeTablename);
};