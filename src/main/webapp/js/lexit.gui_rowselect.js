/**
 * Graphic user interface - row selection part
 */

var row = {};

// assign functions for row selection
row.addRowSelectionFunctions = function(sSomeTablename){
	
	$('#'+sSomeTablename+'_dynamic').off('click', "#"+sSomeTablename+" tbody tr:not('.group')");
	$('#'+sSomeTablename+'_dynamic').on('click', "#"+sSomeTablename+" tbody tr:not('.group')", function() {
		
		row._rowSelectionHandler(sSomeTablename, this);
	} );
};


row._rowSelectionHandler = function(sSomeTablename, nRow){
	
	// store the row that was clicked on, to enable arrow keys
    kf.setActiveTable(sSomeTablename);
	kf.setActiveRowNumber( $("#"+sSomeTablename+" tbody tr:not('.group')").index(nRow) );
	
	// if row selection is not allowed, 
	// we remove highlight and leave right now
	if ( !mt.rowSelectionIsAllowed(sSomeTablename) ) 
		{
		row.clearRowSelection(sSomeTablename);    
		$(nRow).toggleClass('selected');
		return;
		}
	
	
    // if nor control nor shift are pressed, a broad selection must be cancelled 
 
    if ( !kf.isPressed("ctrl") && !kf.isPressed("shift") )
    	{
    	row.clearRowSelection(sSomeTablename);
    	}
    
    
    // toggle row selection marking
    $(nRow).toggleClass('selected');
    
    
    // pressing shift causes selection of some second row to select
    // all rows in between the two selected rows
    if ( kf.isPressed("shift") ){
    	
    	var firstSelectedRow=999;
    	var lastSelectedRow=-1;
    	
    	// find the first and last selected rows
    	// so everything inbetween can be selected as a whole
    	row.getSelectedRowsFrom( mt.getDataTableObjectOf(sSomeTablename) ).every(function(){    		
			var iPos = this.index();
			if (iPos < firstSelectedRow) firstSelectedRow = iPos;
			if (iPos > lastSelectedRow) lastSelectedRow = iPos;
			
		});
    	
    	// select everything in between two selected rows 
    	mt.getDataTableObjectOf(sSomeTablename).rows().every(function(){
    		var iPos = mt.getDataTableObjectOf(sSomeTablename).row( this ).index();
    		if (iPos >= firstSelectedRow && iPos <= lastSelectedRow)
    			{
    			
    			if ( !$(this.node()).hasClass("selected") )
    				{
    				$(this.node()).toggleClass('selected');
    				
    				}
    			}  
    	});
    }  

};



// remove any row selection from table
row.clearRowSelection = function(sSomeTablename){
	
	mt.getDataTableObjectOf(sSomeTablename).rows().every(function(){
		
		$(this.node()).removeClass("selected");		
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
// returns:
// - Datatables API instance with the selected rows
row.getSelectedRowsFrom = function(someTable){
	
	if (typeof someTable == 'string')
		someTable = mt.getDataTableObjectOf(someTable);
		
	return someTable.rows(".selected");
};