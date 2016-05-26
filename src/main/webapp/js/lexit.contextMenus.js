/**
 * context menus
 */

var cm = {};


/**
 * CONTEXTMENU relies on the jQuery plugin 'jQuery-contextMenu'
 * 
 * see:
 * http://medialize.github.com/jQuery-contextMenu/
 * https://github.com/medialize/jQuery-contextMenu
 */




// set a context menu for a given cell (or row if sColumnName is null)
cm.setContextMenu = function(sSomeTable, sColumnName, oItems, fnCallback){
	
	// build content menu
	 $.contextMenu({
	        selector: cm._getSelectorForColumn(sSomeTable, sColumnName),
	        callback: function(key, options){
	        	
	        	var oTable = mt.getDataTableObjectOf(sSomeTable);
	        	
	        	var oTrParentOfTd = options.$trigger.parent();
	        	var sTrId = oTrParentOfTd.id;
	        	var nRow = fn.getRowNodeWhereIdIs(sSomeTable, sTrId);	        	
	            
	            // if no column name is set, use row nodes
	            var nMixed = sColumnName != null ?
	            		fn.getCellInRowNode(nRow, sColumnName) : nRow;	            
	            
	            // call the user callback with the right table/node and context menu keys/options info
	        	fnCallback(oTable, nMixed, key, options);
	        },
	        items: oItems
	    }); 
};


//get the right jquery selector for a given column
//trick: each column has its name as a class name
cm._getSelectorForColumn = function(sTableName, sColumnName){
	
	if (sColumnName == null)
		return "#"+sTableName+" tbody td";
	
	return "#"+sTableName+" tbody td."+sColumnName;
};