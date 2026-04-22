
/**
 * This set of functions is an extension to the basic set of functions contained in the fn namespace.<BR>
 * The functions of the fx namespace make use of the 
 * {@link http://datatables.net/reference/api/|'new' Datatables API}, 
 * that offers the possibility to point at rows and cells by using API object instances of rows and cells, 
 * instead of using TD/TR nodes (which is taken care of in the fn namespace). 
 * @namespace */
var fx = {};




/**
 * Get the name of a table, given one of its cells or rows
 * 
 * @param {(String|API-object-instance)} oMixed - Table name, or API instance of a cell or row
 * @returns {String} The name of the table
 * 
 * @see fx.getTableNode
 */
fx.getTableName = function(oMixed){
	
	// if input is a string, it's probably already a table name
	if (typeof oMixed == 'string')
		return oMixed;
	
	fx._checkApiInstance("fx.getTableName", oMixed);
	
	// Depending on the state of the API instance
	// we have different functions at our disposal
	// allowing different strategies for getting the table name
	
	// If the table() function is now available,
	// extract the name from the table container
	
	if (typeof oMixed.table == 'function')	
		return oMixed.table().container().id.replace("_wrapper", "");
	
	// Otherwise we might have some nodes at our disposal
	return $( oMixed.node() ).closest('table')[0].id;
	
}


/**
 * Get the table wrapper, given one of its cells or rows
 * @param {(String|API-object-instance)} oMixed - Table name, or API instance of a cell or row
 * @returns {Node} The node of the table wrapper
 * 
 * @see fx.getTableName
 */
fx.getTableNode = function(oMixed){
	
	// if input is a string
	if (typeof oMixed == 'string')
		return $("#"+oMixed+"_wrapper")[0];
	
	fx._checkApiInstance("fx.getTableId", oMixed);
	
	// Depending on the state of the API instance
	// we have different functions at our disposal
	// allowing different strategies for getting the table name
	
	// If the table() function is now available,
	// extract the name from the table container
	
	if (typeof oMixed.table == 'function')	
		return $("#"+oMixed.table().container().id)[0];
	
	// Otherwise we might have some nodes at our disposal
	return $( oMixed.node() ).closest('div.dataTables_wrapper')[0];	
}


/**
 * Get the number of visible rows
 * 
 * @param {(String|API-object-instance)} someTable - Table name or object
 * @returns {Integer} The number of visible rows
 */
fx.getNumberOfVisibleRows = function(oSomeTable){
	
	if (typeof oSomeTable == 'string')
		oSomeTable = mt.getDataTableObjectOf(oSomeTable);	
	
	return oSomeTable.rows().count();
};




// *****************************************************************
// *     GENERAL ROW FUNCTIONS                                     *
// *****************************************************************

/**
 * Retrieve the number of a row node (0-based)
 * that is: its index within the set of all database rows
 * 
 * @param {API-object-instance} oRow - An API instance of a row 
 * @returns {Integer} The number of a row node
 */
fx.getRowIndex = function(oRow){
	
	fx._checkApiInstance("fx.getRowIndex", oRow);
	
	var sTableName =	fx.getTableName(oRow);
	var oTable = 		mt.getDataTableObjectOf(sTableName);
	
	var currentStartIndex = oTable.page.info().start;
	
	// this has a value within the current display range [0-9] or such
	var currentRowOnScreen = oRow.index();  
	return ( currentStartIndex + currentRowOnScreen );
};



/**
 * Retrieve the (0-based) number of a row node on the screen,
 * that is: the row number within current display range [eg. 0-9]
 * 
 * @param {API-object-instance} oRow - An API instance of a row 
 * @returns {Integer} Row number within current display range
 */
fx.getRowNumberOnScreen = function(oRow){
	
	fx._checkApiInstance("fx.getRowNumberOnScreen", oRow);
	
	if (oRow.count() ==0)
		return -1;
	
	var sTableName =	fx.getTableName(oRow);
	var oTable = 		mt.getDataTableObjectOf(sTableName);
	var nNode = 		oRow.node();
	
	return oTable.row(nNode).index(); 
};



/**
 * Get all displayed rows from a table
 * 
 * @param {(String|API-object-instance)} sSomeTablename - Table name or object
 * @returns {API-object-instance} An API instance with all rows, so functions like 'every' etc can be applied to it
 * 
 * @example
 * var oRows = fx.getAllRows(t);
 * oRows.every(function(){ ... });
 */
fx.getAllRows = function(oTable){
	
	if (typeof oTable === 'string')
		oTable = mt.getDataTableObjectOf(oTable);
	
	return oTable.rows();
};


/**
 * Get the id of a row 
 * 
 * @param {API-object-instance} oRow - An API instance of a row 
 * @returns {String} The id of the row
 */
fx.getRowId = function(oRow){
	
	if ( !fx.isApiInstance(oRow) ){
		fn.message(lang.error, 
				lang.error_when_calling+ " fx.getRowId().<BR>"+ 
				lang.error_function_called_with_illegal_value+". "+
				lang.error_function_called_with_illegal_value_expected+ ": API instance.");
		return;
	}
	
	if (oRow.count() == 0)
		return null;
	
	return oRow.id();	
};


/**
 * Get the first row which contain some given values
 * 
 * @param {(String|API-object-instance)} sSomeTable - Table name or object
 * @param {Array} aFieldsAndValues - An associative array of fields and search values
 * @returns {API-object-instance} An API instance with the row we searched for, or null if it wasn't found
 * 
 * @see fx.getAllRowsWhere
 */
fx.getRowWhere = function(sSomeTable, aFieldsAndValues){
	
	var sTableName = (typeof sSomeTable == 'object' ? fn.getTableName(sSomeTable) : sSomeTable);
	
	// pre-check: are the given fields correct?
	for (sFieldName in aFieldsAndValues)
	{		
		if ($.inArray(sFieldName, mt.getListOfColumnsOf(sTableName)) < 0){
			fn.message(lang.error, 
				lang.error_when_calling+" fx.getRowWhere("+sTableName+").<BR>"+ 
				lang.error_function_called_with_illegal_value+". "+
				lang.error_function_called_with_illegal_value_input+ ": " +sTableName+"."+sFieldName);			
			return null;
		}
	}
	
	// apply the filters to the Database API instance
	// and return the first row
	
	return fx.getAllRowsWhere(sSomeTable, aFieldsAndValues, true);	
};


/**
 * Get ALL the rows which contain some given values
 * 
 * @param {(String|API-object-instance)} sSomeTablename - Table name or object
 * @param {Array} aFieldsAndValues - An associative array of fields and search values
 * @param {Boolean} [bOnlyFirstRow=false] - true if we only want the first row, otherwise false (default)
 * @returns {API-object-instance} An API instance with the rows we searched for, or null if it wasn't found
 * 
 * @see fx.getRowWhere
 */
fx.getAllRowsWhere = function(sSomeTable, aFieldsAndValues, bOnlyFirstRow){
	
	if (bOnlyFirstRow == null)
		bOnlyFirstRow = false;
	
	var sTableName = (typeof sSomeTable == 'object' ? fn.getTableName(sSomeTable) : sSomeTable);
	
	// pre-check: are the given fields correct?
	for (sFieldName in aFieldsAndValues)
	{		
		if ($.inArray(sFieldName, mt.getListOfColumnsOf(sTableName)) < 0)
			{
			fn.message(lang.error, 
					lang.error_when_calling+" fx.getAllRowsWhere("+sTableName+").<BR>"+ 
					lang.error_function_called_with_illegal_value+". "+
					lang.error_function_called_with_illegal_value_input+ ": " +sTableName+"."+sFieldName);			
			return null;
			}
	}
	
	// apply the filters to the Database API instance
	
	var aNodes = new Array();
	
	(fx.getAllRows(sTableName)).every(function(i){
		
		var oCurrentRow = this;
		
		// search the row
		// (if one single required value is not found, the search fails)
		var bFound = true;
		for (sFieldName in aFieldsAndValues) {
			var sValueOfCell = fx.getDataFromCellInRow(oCurrentRow, sFieldName);
			
			if (sValueOfCell != aFieldsAndValues[sFieldName])
				bFound = false;						
		}
		
		// if we found all the required values in this row
		// add it to our result set
		if (bFound) {
			aNodes.push( oCurrentRow.row(i).node() ); 		
		}
		
	});
	
	// if we found nothing, select non existing row so as to return an empty set
	if (aNodes.length == 0)
		return mt.getDataTableObjectOf(sTableName).rows( "#doesntexist" );
	
	// return the matches
	if (bOnlyFirstRow)		
		return mt.getDataTableObjectOf(sTableName).row( aNodes[0] );
	
	return mt.getDataTableObjectOf(sTableName).rows( aNodes );
};


/**
 * Get the row which has a given id
 * 
 * @param {(String|API-object-instance)} sSomeTable - Table name or object
 * @param {String} sId - A row id
 * @returns {API-object-instance} An API instance with the row having the required id (if any)
 */
fx.getRowWhereIdIs = function(oSomeTable, sId){
	
	if (typeof oSomeTable == 'string')
		oSomeTable = mt.getDataTableObjectOf(oSomeTable);
	
	return oSomeTable.row('#'+sId);
};



// *****************************************************************
// *     ROW SELECTION FUNCTIONS                                   *
// *****************************************************************

/**
 * Manually unselect all the rows in the table
 * 
 * @param {(String|API-object-instance)} sSomeTable - Table name or object
 * 
 * @see fx.unselectRow
 * @see fx.selectAllRows
 */
fx.unselectAllRows = function(sSomeTable){
	
	fn.unselectAllRowNodes(sSomeTable);
	
};

/**
 * Manually select all the row nodes in the table
 * 
 * @param {(String|API-object-instance)} sSomeTable - Table name or object
 * 
 * @see fx.selectRow
 * @see fx.unselectAllRows
 */
fx.selectAllRows = function(sSomeTable){
	
	if (typeof sSomeTable == 'object')
		sSomeTable = fn.getTableName(sSomeTable);
	
	// NOTE the operation is performed onto the nodes
	$("#"+sSomeTable+" tbody tr:not('.group')").each(function(){
		if ( !$(this).hasClass("selected"))
			$(this).toggleClass('selected');
	});
};


/**
 * Manually select a row, given its row number on screen or its API-object-instance
 * 
 * @param {(String|API-object-instance)} sSomeTable - Table name or object
 * @param {Integer} iRowNumber - A row number within the current display range (0-9 or such); not needed if 1st parameter is API-object-instance of a row
 * 
 * @see fx.unselectRow
 * @see fx.selectAllRows
 */
fx.selectRow = function(sSomeTable, iRowNumber){

	if (iRowNumber == null && fx.isApiInstance(sSomeTable)){
		iRowNumber = fx.getRowNumberOnScreen(sSomeTable);
		sSomeTable = fx.getTableName(sSomeTable);
	}
	
	// otherwise Table name or object
	if (typeof sSomeTable == 'object')
		sSomeTable = fn.getTableName(sSomeTable);
	
	// NOTE the operation is performed onto the node
	var nRowSelector = $("#"+sSomeTable+" tbody tr:not('.group'):eq("+iRowNumber+")");
	if ( iRowNumber>=0 && !nRowSelector.hasClass("selected")){
		nRowSelector.toggleClass('selected');
	}
	else if (iRowNumber<0){
		fn.message(lang.error, lang.error_when_calling+" fx.selectRow("+sSomeTable+").<BR>"+ 
				lang.error_function_called_with_illegal_value+". "+
				lang.error_function_called_with_illegal_value_input+ ": " +iRowNumber);
	};
};


/**
 * Manually unselect a row, give its row number on screen or its API-object-instance
 * 
 * @param {(String|API-object-instance)} sSomeTable - Table name or object
 * @param {Integer} iRowNumber - A row number within the current display range (0-9 or such); not needed if 1st parameter is API-object-instance of a row
 * 
 * @see fx.selectRow
 */
fx.unselectRow = function(sSomeTable, iRowNumber){

	if (iRowNumber == null && fx.isApiInstance(sSomeTable))
	{
		iRowNumber = fx.getRowNumberOnScreen(sSomeTable);
		sSomeTable = fx.getTableName(sSomeTable);
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
 * @param {(String|API-object-instance)} oSomeTable - Table name or object
 * @returns {API-object-instance} An API instance containing an array of rows
 */
fx.getSelectedRowsFrom = function(oSomeTable){
	
	if (typeof oSomeTable == 'string')
		oSomeTable = mt.getDataTableObjectOf(oSomeTable);
		
	return oSomeTable.rows(".selected");
};


/**
 * Get the first selected row from a user rows selection
 * 
 * @param {(String|API-object-instance)} oSomeTable - Table name or object
 * @returns {API-object-instance} An API instance containing a row
 */
fx.getFirstSelectedRowFrom = function(oSomeTable){
	
	if (typeof oSomeTable == 'string')
		oSomeTable = mt.getDataTableObjectOf(oSomeTable);
	
	// using row() combined with eq(0) guarantees we get only one result
	return oSomeTable.row(".selected:eq(0)");
};


/**
 * Get the first row of a table
 * 
 * @param {(String|API-object-instance)} oSomeTable - Table name or object
 * @returns {API-object-instance} An API instance containing a row
 */
fx.getFirstRowFrom = function(oSomeTable){
	
	if (typeof oSomeTable == 'string')
		oSomeTable = mt.getDataTableObjectOf(oSomeTable);
	
	return oSomeTable.row(0);
}

/**
 * Get the row number of the first selected row
 * 
 * @param {(String|API-object-instance)} oSomeTable - Table name or object
 * @returns {Integer} row number, or -1 if no row was selected by the user
 */
fx.getIndexOfFirstSelectedRowFrom = function(oSomeTable){
	
	if (typeof oSomeTable == 'string')
		oSomeTable = mt.getDataTableObjectOf(oSomeTable);
	
	// using row() combined with eq(0) guarantees we get only one result
	var oRow = oSomeTable.row(".selected:eq(0)");
	if (oRow.count() == 0)
		return -1;
	
	// find id of first selected row in array of ids of all rows
	return $.inArray( oRow.node(), oSomeTable.rows().nodes() );
};


/**
 * Get the row where the cursor is at (= highlighted row when scrolling up or down)
 * 
 * @param {(String|API-object-instance)} sSomeTable - Table name or object
 * @returns {API-object-instance} An API instance of a row 
 */
fx.getActiveRow = function(sSomeTable){
	
	if (typeof sSomeTable == 'object')
		sSomeTable = fn.getTableName(sSomeTable);
		
	if (kf.getActiveTable() != sSomeTable) 
		{
		var oFirstSelectedRow = fx.getFirstSelectedRowFrom(sSomeTable);
		var aAllRows = fx.getAllRows(sSomeTable);
		
		// There is no active node in a table which hasn't focus!
		// So: pick the first selected row, 
		// else if there is no selected row, pick the top row
		// else if table is empty, return null
		
		if ( oFirstSelectedRow.any() )
			{
			return oFirstSelectedRow;
			}
		else if ( aAllRows.any() )
			{
			return mt.getDataTableObjectOf(sSomeTable).row(0);
			}
		else
			{
			return null;
			}
		}
	
	return mt.getDataTableObjectOf(sSomeTable).row( kf.getActiveRowNumber() );
};


/**
 * Get the number of selected rows of a table
 * 
 * @param {(String|API-object-instance)} someTable - Table name or object
 * @returns {Integer} Number of selected rows
 */
fx.getNumberOfSelectedRows = function(oSomeTable){
	
	if (typeof oSomeTable == 'string')
		oSomeTable = mt.getDataTableObjectOf(oSomeTable);
	
	return oSomeTable.rows(".selected").count();
};



// *****************************************************************
// *     GENERAL CELL FUNCTIONS                                    *
// *****************************************************************


/**
 * Get a cell, given two possible kinds of input:
 * [with 1 parameter] a cell node.
 * [with 2 parameters] some row-like argument (a row node, or an API instance of a row) and 
 * a column name which points to the desired cell.
 * 
 * @param {(Node|API-object-instance)} mixed - A cell/row node, or an API instance of a row
 * @param {String} [sColumnName=null] - A column name, when first argument contains a row
 * @returns {API-object-instance} an API instance containing the required cell
 */
fx.getCell = function(mixed, sColumnName){
	
	// input is an API instance
	if ( fx.isApiInstance(mixed) ){
		
		// in this case sColumnName is compulsory
		if (typeof sColumnName == 'undefined'){
			fn.message(lang.error, lang.error_when_calling+ " fx.getCell().<BR>" +
				lang.error_function_called_with_illegal_value+". "+
				lang.error_function_called_with_illegal_value_expected+ ": sColumnName.");
			return;
		}
		
		var sTableName =	fx.getTableName(mixed);
		var oTable = 		mt.getDataTableObjectOf(sTableName);
		
		var iRowIndex =		fx.getRowNumberOnScreen(mixed);
		var iColIndex = 	fn.getColumnNumberOf(sTableName, sColumnName);
		
		return oTable.cell( iRowIndex, iColIndex );		
	}
	
	// input is a node
	else {
		
		var sTableName =	fn.getTableName(mixed);
		var oTable = 		mt.getDataTableObjectOf(sTableName);
		
		// if no column name was specified,
		// we just want to get an API instance of a cell out of a cell node
		if (typeof sColumnName != 'undefined')
			{
			var iColIndex = fn.getColumnNumberOf(sTableName, sColumnName);		
			return oTable.cell( mixed, iColIndex );
			}
		
		// if some column name was specified,
		// we want to get an API instance of a named cell out of a row node
		else {
			return oTable.cell( mixed );
		}
			
	}
};



/**
 * Get the type of a cell (or of a named cell within a row)
 * 
 * @param {Node} oMixed - A cell or a row
 * @param {String} [sColumnName=null] - (in combination with a row) Name of a column
 * @returns {String} Value 'text', 'checkbox', 'selectbox' or 'unknown'
 */
fx.getCellType = function(oMixed, sColumnName){
	
	fx._checkApiInstance("fx.getCellType", oMixed);
	
	// column name only required when oMixed is a row
	return fn.getCellNodeType(oMixed.node(), sColumnName);
};


/**
 * Get the node of a cell, given an API instance of a row and a column name
 * 
 * @param {API-object-instance} oRow - An API instance of a row
 * @param {String} sColumnName - A column name
 * @returns {Node} The node of a cell
 */
fx.getCellNode = function( oRow, sColumnName ){
	
	fx._checkApiInstance("fx.getCellNode", oRow);
	
	return fx.getNode( fx.getCell(oRow, sColumnName) );
};


/**
 * Check if a cell is editable
 * 
 * @param {API-object-instance} oCell - An API instance of a cell 
 * @returns {Boolean} true if cell is editable, otherwise false
 */
fx.isEditableCell = function(oCell){
	
	fx._checkApiInstance("fx.isEditableCell", oCell);
	
	return fn.isEditableNode( oCell.node() );
};


/**
 * Manually uncheck a list of checkboxes
 * 
 * @param {API-object-instance} oRow - An API instance of a row
 * @param {String[]} aListOfColumns - A list of columns in which the checkboxes are to be found
 * @param {Function} fnCallback - Some function to call after the checkboxes have been unchecked
 */
fx.uncheckCheckboxes = function(oRow, aListOfColumns, fnCallback){
	
	fx._checkApiInstance("fx.uncheckCheckboxes", oRow);
	
	fn.uncheckCheckboxes(oRow.node(), aListOfColumns, fnCallback);
};


/**
 * Manually click on a checkbox, given the name of the column containing the checkbox, and a row node
 * 
 * @param {API-object-instance} oRow - An API instance of a row
 * @param {String} sColumnName - A column name
 * @param {Function} fnCallback - Some function to call after the checkbox has been clicked upon
 */
fx.toggleCheckbox = function(oRow, sColumnName, fnCallback){
	
	fx._checkApiInstance("fx.toggleCheckbox", oRow);
	
	fn.toggleCheckbox(oRow.node(), sColumnName, fnCallback);
};



// *****************************************************************
// *     GENERAL COLUMN FUNCTIONS                                  *
// *****************************************************************


/**
 * Give the name of the column a cell is part of
 * 
 * @param {API-object-instance} oCell - An API instance of a cell
 * @returns {String} Name of a column
 */
fx.getNameOfColumnForThisCell = function(oCell){
	
	fx._checkApiInstance("fx.getNameOfColumnForThisCell", oCell);
	
	var sTable = 		fx.getTableName(oCell);
	var aPos = 			oCell.index();
	var sColumnName =	mt.getListOfColumnsOf(sTable)[aPos.column];
	return sColumnName;
};





// *****************************************************************
// *     GENERAL CELL/ROW FUNCTIONS                                *
// *****************************************************************


/**
 * Check if an API instance contains a cell 
 * 
 * @param {API-object-instance} oMixed - An API instance
 * @returns {Boolean} true if object contains a cell, otherwise false
 */
fx.isCell = function(oMixed){	
	
	fx._checkApiInstance("fx.isCell", oMixed);
	
	// applied on a cell, index() should return an object
	return (typeof oMixed.index() == 'object');
};


/**
 * Check if an API instance contains a row 
 * 
 * @param {API-object-instance} oMixed - An API instance
 * @returns {Boolean} true if object contains a cell, otherwise false
 */
fx.isRow = function(oMixed){
	
	fx._checkApiInstance("fx.isRow", oMixed);
	
	// applied on a row, index() should return an number (beware: integer is not a JS type!)
	return (typeof oMixed.index() == 'number');
};


/**
 * Get an API instance of a row out of a row node
 * 
 * @param {Node} nRow - A row node
 * @returns {API-object-instance} An API instance of a row
 */
fx.getRow = function(nRow){
	
	fn._checkjQueryObject("fx.getRow", nRow);
	
	if ( fx.isApiInstance(nRow) )
		{
		fn.message(lang.error, lang.error_when_calling+" fx.getRow().<BR>"+ 
			lang.error_function_called_with_illegal_value+". "+
			lang.error_function_called_with_illegal_value_input+ ": API instance. " +
			lang.error_function_called_with_illegal_value_expected+ ": node.");
		return;
		}
	
	var sTableName =	fn.getTableName(nRow);
	var oTable = 		mt.getDataTableObjectOf(sTableName);
	
	return oTable.row(nRow);
}


/**
 * Get a node out of the API instance of a cell or row
 * 
 * @param {API-object-instance} oMixed - An API instance of a cell or row
 * @returns {Node} A TR- or TD-node
 */
fx.getNode = function(oMixed){
	
	fx._checkApiInstance("fx.getNode", oMixed);
	
	return oMixed.node();
};


/**
 * Check if a row (that is: an API instance of this row) is the last one of an array of rows
 * 
 * @param {API-object-instance} oRow - An API instance of a row 
 * @param {API-object-instance} oSelection - An API instance of a rows selections
 * @returns {Boolean} true if the row is the last one, otherwise false
 */
fx.isLastRowOf = function(oRow, oSelection){	
	
	fx._checkApiInstance("fx.isLastRowOf", oRow);
	
	// beware: we use nodes here instead of ids. This is because some
	// tables don't have id's, so using rows is more reliable!
	var length = 			oSelection.count();
	var nSingleRow =		oRow.node();
	var anRowsSelection = 	oSelection.nodes();
	
	return ($.inArray( nSingleRow, anRowsSelection) == length-1);
};




 
/**
 * Get an API instance of a row out of an API instance of a cell
 * (in case we happen to have an API instance of a cell while needing an instance of a row)
 * 
 * @param {API-object-instance} oCell - An API instance of a cell
 * @returns {API-object-instance} An API instance of a row
 */
fx.getRowFromCell = function(oCell){
	
	fx._checkApiInstance("fx.getRowFromCell", oCell);
	
	var sTableName =	fx.getTableName(oCell);
	var oTable = 		mt.getDataTableObjectOf(sTableName);
	var iRowIndex = 	oCell.index().row;
		
	return oTable.row(iRowIndex);
	
};



// *****************************************************************
// *     GET DATA FROM A CELL OR ROW                               *
// *****************************************************************

/**
 * Get the content of a cell which is a sibling of another cell, given an API instance of that cell
 * and the name of the cell we want the content from
 * 
 * @param {API-object-instance} oCell - An API instance of a cell 
 * @param {String} sOtherColumnName - Name of a column beside the cell
 * @returns {String} Cell content
 */
fx.getDataFromSiblingCell = function(oCell, sOtherColumnName){
	
	fx._checkApiInstance("fx.getDataFromSiblingCell", oCell);
	
	return fn.getDataFromSiblingNode(oCell.node(), sOtherColumnName);
};


/**
 * Get the content of a cell,
 * given a table name or datatable object, and a cell node
 * 
 * @param {API-object-instance} oCell - An API instance of a cell
 * @returns {String} Cell content
 * 
 * @see fx.getCheckboxValue
 */
fx.getDataFromCell = function(oCell){
	
	fx._checkApiInstance("fx.getDataFromCell", oCell);
	
	return fn.getDataFromCellNode(oCell.node());
};


/**
 * Get the content of a cell, given a row and a column name
 * 
 * @param {API-object-instance} oRow - An API instance of a row
 * @param {String} sColumnName - Name of a column 
 * @returns {String} Cell content
 */
fx.getDataFromCellInRow = function(oRow, sColumnName){
	
	fx._checkApiInstance("fx.getDataFromCellInRow", oRow);
	
	return fn.getDataFromCellInRowNode(oRow.node(), sColumnName);
	
};

/**
 * Get the content of a row, given a row
 * 
 * @param {API-object-instance} oRow - An API instance of a row
 * @returns {Array} An associative array of fields names and their values
 */
fx.getDataFromRow = function(oRow){
	
	fx._checkApiInstance("fx.getDataFromRow", oRow);
	
	return oRow.data();
};


/**
 * Get selected text within a cell,
 * and also get the start and end positions of the selected text.
 * 
 * @param {API-object-instance} oCell - An API instance of a cell/row
 * @param {String} [sColumnName=null] - a column name, when first argument contains the API instance of a row  
 * @returns {Object} Selected text, start and end position, reliability
 * 
 * @example
 * var sel = fx.getSelectedTextInCell(oCell);
 * alert(sel.start + ": " + sel.end + " = " + sel.text);
 * 
 * @see fx.getWordClickedUponInCell
 */
fx.getSelectedTextInCell = function(oMixed, sColumnName) {
	
	fx._checkApiInstance("fx.getSelectedTextInCell", oMixed);
	
	var oCell = (typeof sColumnName != 'undefined') ?
			fx.getCell(oMixed, sColumnName) : oMixed;
	
	return fn.getSelectedTextInNode(oCell.node());
};


/**
 * Select a word within a cell just by clicking on it, 
 * and also get the start and end positions of the selected word.
 * 
 * @param {API-object-instance} oCell - An API instance of a cell/row
 * @param {String} [sColumnName=null] - a column name, when first argument contains the API instance of a row 
 * @returns {Object} Selected text, start and end position, reliability
 * 
 * @see fx.getSelectedTextInCell
 */
fx.getWordClickedUponInCell = function(oMixed, sColumnName){
	
	fx._checkApiInstance("fx.getWordClickedUponInCell", oMixed);
	
	var oCell = (typeof sColumnName != 'undefined') ?
			fx.getCell(oMixed, sColumnName) : oMixed;
	
	return fn.getWordClickedUponInNode(oCell.node());
};


/**
 * Read the value of a checkbox cell in a reliable way
 * 
 * @param {API-object-instance} oCell - An API instance of a cell
 * @returns {Boolean} the checkbox value
 * 
 * @see fx.getDataFromCell
 * @see lexutil.translateBoolean
 */
fx.getCheckboxValue = function(oCell){
	
	fx._checkApiInstance("fx.getCheckboxValue", oCell);
	
	return fn.getCheckboxValue(oCell.node())
};


// *************************************************
// *  READ A SINGLE RECORD FROM THE DATABASE       *
// *  and load it into the datatables interface    *
// *************************************************

/**
 * Call a record.
 * This does a job similar to fn.callDatabase(), but limited to a single record
 * which will be updated in the current table view.
 * 
 * @param {API-object-instance} oRow - An API instance of a row
 * @param {String[]} aColumnsToUpdate - An array of names of the columns to update
 * @param {Function} fnCallback - A function to call after the record has been loaded
 * @param {Function} [fnErrorHandler=null] - Some function to call when an error occurs
 * 
 */
fx.callRecord = function(oRow, aColumnsToUpdate, fnCallback, fnErrorHandler){
	
	fx._checkApiInstance("fx.callRecord", oRow);
	
	fn.callRecord(oRow.node(), aColumnsToUpdate, fnCallback, fnErrorHandler);
}



// *****************************************************************
// *     PUT DATA INTO A CELL OR ROW                               * 
// *     (without database update)                                 *
// *****************************************************************


/**
 * Put some content into a cell, given a row and a column name.
 * 
 * @param {API-object-instance} oRow - An API instance of a row
 * @param {String} sColumnName - Name of a column 
 * @param {String} Content to put into the cell
 */
fx.putDataIntoCell = function(oRow, sColumnName, sContent){
	
	fx._checkApiInstance("fx.putDataIntoCell", oRow);
	
	fn.putDataIntoCellNode(oRow.node(), sColumnName, sContent);
	
};


// ************************************************************
// *       UPDATE THE DATABASE GIVEN A ROW/CELL               *
// ************************************************************

/**
 * Update a 'visible' database table (that is loaded into the GUI),
 * given an API instance of a cell/row, and an associative array of fields and values to update 
 * the corresponding row with.
 * 
 * @param {API-object-instance} oMixed - An API instance of a cell/row 
 * @param {Array} aColumnNamesAndValues - An associative array of fields and values to update in the row
 * @param {Function} fnCallback - Function called after the update
 * @param {Function} [fnErrorHandler=null] - Some function to call when an error occurs
 * 
 * @see fx.updateTableGivenACellOrRow
 */
fx.updateDatabaseGivenACellOrRow = function(oMixed, aColumnNamesAndValues, fnCallback, fnErrorHandler){
	
	fx._checkApiInstance("fx.updateDatabaseGivenACellOrRow", oMixed);
	
	fn.updateDatabaseGivenANode(oMixed.node(), aColumnNamesAndValues, fnCallback, fnErrorHandler);
};

/**
 * Synonym of fx.updateDatabaseGivenACellOrRow
 *  
 * @see  fx.updateDatabaseGivenACellOrRow
 */
fx.updateTableGivenACellOrRow = function(oMixed, aColumnNamesAndValues, fnCallback, fnErrorHandler){
	fx.updateDatabaseGivenACellOrRow(oMixed, aColumnNamesAndValues, fnCallback, fnErrorHandler);
};




// *****************************************************************
// *     REMOVE DATA FROM THE DATABASE                             *
// *****************************************************************

/**
 * Remove a record from the database given a row id
 * 
 * @param {API-object-instance} oRow -  An API instance of a row 
 * @param {Function} fnCallback - Function called after the operation
 * @param {Function} [fnErrorHandler=null] - Some function to call when an error occurs
 * 
 * @see fx.removeFromTableGivenARow
 */
fx.removeFromDatabaseGivenARow = function(oRow, fnCallback, fnErrorHandler){
	
	fx._checkApiInstance("fx.removeFromDatabaseGivenARow", oRow);
	
	fn.removeFromDatabaseGivenANode(oRow.node(), fnCallback, fnErrorHandler);	
};

/**
 * Synonym of fx.removeFromDatabaseGivenARow 
 * 
 * @see fx.removeFromDatabaseGivenARow
 */
fx.removeFromTableGivenARow = function(oRow, fnCallback, fnErrorHandler){
	fx.removeFromDatabaseGivenARow(oRow, fnCallback, fnErrorHandler);
};






// *******************************************
// *           EXTRA FUNCTIONS               *
// *******************************************

      
/**
 * check if an object is a Datatables API instance
 * 
 * @param {Object} obj - Some object
 * @returns {Boolean} true if the object is an API instance, otherwise false
 */
fx.isApiInstance = function(obj){

	try {
		return (obj instanceof $.fn.dataTable.Api);
	}
	catch (err){
	 	return false;
	}

	// // if the obj is NOT an API instance, calling a typical API function will cause an error,
	// // which we will catch so as to return false to the test!
	// try {
	// 	var test = obj.page.info();
	// }
	// catch (err){
	// 	return false;
	// }
	
	// return true;
}

/**
 * Check if some function was called with an API instance
 * and give an error if it wasn't!
 */
fx._checkApiInstance = function(sFunctionName, oArgument){
	
	if ( !fx.isApiInstance(oArgument))
		{
		// give info in console
		console.log("sFunctionName:"+sFunctionName);
		console.log("oArgument:"+oArgument);
		
		// try to compute name of table in which error occurs
		var sTableName = "";
		var sArgType = "";
		
		try {
			// oArgument is a jQuery object
			if (oArgument instanceof jQuery)
				{			
				sTableName = fn.getTableName(oArgument.get(0)); 
				sArgType = "jQuery object";
				}
			// oArgument is a table name
			else if (typeof oArgument == 'string' && mt.tableExists(oArgument))
				{
				sTableName = oArgument;
				sArgType = "table name";
				}
			// oArgument is a node
			else if ($(oArgument).elementExists())
				{
				sTableName = fn.getTableName(oArgument);
				sArgType = "node";
				}
			// oArgument is some other type
			else 
				{
				sArgType = typeof oArgument;
				}
		}
		catch (err){
			sTableName = "";
			sArgType = "onbekende type";
		}
		
		
		// give error information
		fn.message(lang.error, lang.error_when_calling+ " "+ sFunctionName + "("+sTableName+").<BR>"+ 
				lang.error_function_called_with_illegal_value+". "+
				lang.error_function_called_with_illegal_value_input+ ": "+sArgType+". " +
				lang.error_function_called_with_illegal_value_expected+ ": API instance.");
		return;
		}
}
