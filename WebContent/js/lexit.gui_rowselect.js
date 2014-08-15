/**
 * 
 */

var row = {};

// assign functions for row selection
row.addRowSelectionFunctions = function(sSomeTablename){
	
	$('#'+sSomeTablename+'_dynamic').off('click', '#'+sSomeTablename+' tbody tr');
	$('#'+sSomeTablename+'_dynamic').on('click', '#'+sSomeTablename+' tbody tr', function() {
		
		row._rowSelectionHandler(sSomeTablename, this);
	} );
};


row._rowSelectionHandler = function(sSomeTablename, eSomeElement){
	
	// store the row that was clicked on, to enable arrow keys
    kf.setActiveTable(sSomeTablename);
	kf.setActiveRowNumber( $('#'+sSomeTablename+' tbody tr').index(eSomeElement) );
	
	// if row selection is not allowed, 
	// we remove highlight and leave right now
	if ( !mt.rowSelectionIsAllowed(sSomeTablename) ) 
		{
		row.clearRowSelection(sSomeTablename);    
		$(eSomeElement).toggleClass('row_selected');
		return;
		}
	
    
    // check if there is some function for this column
	var sColumnName = fn.getNameOfColumnForThisNode(sSomeTablename, eSomeElement);
	var oTableConfig = conf.getTableConfig(sSomeTablename);
	var aColumnConfig = conf.getColumnConfig(oTableConfig, sColumnName);
	var bFunctionHere = conf.someMouseActionIsAssigned(aColumnConfig);
	
    // if nor control nor shift are pressed, a broad selection must be cancelled
	// except if there is some function assigned to this column (see above): 
	// in that case we call the function and don't cancel the selection 
    if ( !kf.isPressed("ctrl") && !kf.isPressed("shift") )
    	{
    	if ( !bFunctionHere )
        	{
    		row.clearRowSelection(sSomeTablename);
        	}
    	else
    		{
    		// if function must be activated here, leave straight away
    		// (because the function may need to know what was selected)
    		return;
    		}
    	}
    
    
    // toggle row selection marking
    $(eSomeElement).toggleClass('row_selected');
    
    
    // pressing shift causes selection of some second row to select
    // all rows in between the two selected rows
    if ( kf.isPressed("shift") ){
    	var firstSelectedRow=999;
    	var lastSelectedRow=-1;
    	
    	// find the first and last selected rows
    	// so everything inbetween can be selected as a whole
    	row.fnGetSelected( mt.getDataTableObjectOf(sSomeTablename) ).each(function(){
			var iPos = mt.getDataTableObjectOf(sSomeTablename).fnGetPosition( this );
			if (iPos < firstSelectedRow) firstSelectedRow = iPos;
			if (iPos > lastSelectedRow) lastSelectedRow = iPos;
		});
    	        	
    	
    	
    	// select everything in between two selected rows 
    	mt.getDataTableObjectOf(sSomeTablename).$("tr").each(function(){
    		var iPos = mt.getDataTableObjectOf(sSomeTablename).fnGetPosition( this );
    		if (iPos >= firstSelectedRow && iPos <= lastSelectedRow)
    			{
    			
    			if ( !$(this).hasClass("row_selected") )
    				{
    				$(this).toggleClass('row_selected');
    				
    				}
    			}  
    	});
    }  

};



// remove any row selection from table
row.clearRowSelection = function(sSomeTablename){
	
	mt.getDataTableObjectOf(sSomeTablename).$("tr").each(function(){
		$(this).removeClass("row_selected");
		
	});
};

// remove any row selection from all the loaded tables
row.clearRowSelectionInAllTables = function(){
	
	for (var i=0; i<mt.getListOfLoadedTables().length; i++){
		var sTableName = mt.getListOfLoadedTables()[i];
		row.clearRowSelection(sTableName);
	}
	
};


// get the selected rows of a table
row.getSelectedRowsFrom = function(someTable){
	
	if (typeof someTable == 'string')
		someTable = mt.getDataTableObjectOf(someTable);
		
	return row.fnGetSelected(someTable);
};


// get the selected nodes
row.fnGetSelected = function( someOTable ){
	
	return someOTable.$('tr.row_selected');
};