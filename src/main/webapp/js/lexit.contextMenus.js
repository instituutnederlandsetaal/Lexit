/**
 * context menus
 */

var cm = {};


/**
 * CONTEXTMENU relies on the jQuery plugin 'jQuery-contextMenu'
 * 
 * see:
 * http://swisnl.github.io/jQuery-contextMenu/index.html
 * https://github.com/swisnl/jQuery-contextMenu
 */




// set a context menu for a given cell (or row if sColumnName is null)
cm.setContextMenu = function(sSomeTable, sColumnName, oItems, sClass = 'lexit-context-menu', fnCallback){
	
	// build content menu
	 $.contextMenu({
		 
	        selector: cm._getSelectorForColumn(sSomeTable, sColumnName),
	        
	        className: sClass,
	        
	        callback: function(key, options){
	        	
	        	var oTable = mt.getDataTableObjectOf(sSomeTable);
	        	
	        	// trigger element
	        	var eTriggerElement = (options.$trigger.get())[0];
	        	
	        	var nRow = fn.getRowNode(eTriggerElement);
	        	
	        	// if no column name is set, use row nodes
	        	// (actually with a column name, we're supposed to be getting the trigger element)
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