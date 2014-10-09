/**
 * 
 */

var un = {};



// reactivate crossbrowser tooltips upon mouseenter in the table header.
// this is needed for the undo button tooltips 
// since tipTip does not operates on elements created after its activation,
// so changing tooltips of the undo button in the header needs reactivation of tipTip
// on time, t.i. before the user reaches the undo button, when entering the table header.
$(document).on("mouseenter", ".top", function(){$(".tooltip").tipTip(oTiptipConfig);});


// clean or generate the undo stack of a table
un.cleanUndoStack = function(sSomeTableName){
	
	var undoStack    = new Array(); 
	var tooltipStack = new Array();
	var sEmptyTooltip = "Er is niets te herstellen.";
	tooltipStack.push(sEmptyTooltip);
	
	mt.undoStacksPut(sSomeTableName, undoStack);
	mt.undoTooltipsPut(sSomeTableName, tooltipStack);
	
	// change the color of the button since it won't work anymore now (because stack is empty)
	$("#"+sSomeTableName+"_wrapper #"+sSomeTableName+"_undo_button")
		.css("background-color", "#D5DAE4");

	// tooltip
	$("#"+sSomeTableName+"_wrapper #"+sSomeTableName+"_undo_button")
		.attr("title", sEmptyTooltip).addClass("tooltip");
	
	// update the tooltips
	$(".tooltip").tipTip(oTiptipConfig);
};


// add old values onto the undo stack
un.addEvent = function(sSomeTableName, sRowId, iColumnNr, sOldValue){
	
	var thisStack = mt.undoStacksGet(sSomeTableName);	
	
	// first check if the stack is not already having the same undo event
	// on its top: it can happen in IE (since addEvent is called upon 'click'
	// in IE because it doesn't recognize 'change' like other browsers!!)
	
	if (thisStack.length>0)
		{
		var copyOfStack = cloneArray(thisStack);
		var oDataOnTop = copyOfStack.pop();	
		
		var sRowIdOnTop = 			oDataOnTop.rowId;	
		var iColumnNumberOnTop = 	oDataOnTop.columnIndex;
		var sOldValueOnTop = 		oDataOnTop.oldValue;
			
		if (	sRowIdOnTop == sRowId &&
				iColumnNumberOnTop == iColumnNr &&
				sOldValueOnTop == sOldValue)
			return; // undo event is already on top of stack
		}
	
	// add recovery data onto the undo stack	
	
	thisStack.push( {
		"rowId": sRowId,
		"columnIndex": iColumnNr,
		"oldValue": sOldValue
		} );	
	mt.undoStacksPut(sSomeTableName, thisStack);
	
	
	// add button tooltips explaining recovery consequences
	
	// we must add a new tooltip to the stack and show it	
	
	// define a new tooltip
	var nNodeOnStack =	fn.getNodeWhereIdIs(sSomeTableName, sRowId);
	var sNewTooltip = "'"+sOldValue+"' herstellen " +
			"in rij "+ (fn.getRowIndex(sSomeTableName, nNodeOnStack)+1) + // human users count 1-based instead of 0-based
			" van kolom '"+ mt.getListOfVisibleColumnsOf(sSomeTableName)[iColumnNr] +"'.";
	
	// put the new tooltip onto the stack of previous tooltips
	var thisTooltipsStack = mt.undoTooltipsGet(sSomeTableName);
	thisTooltipsStack.push(sNewTooltip);
	mt.undoTooltipsPut(sSomeTableName, thisTooltipsStack);
	
	// put tooltip in the DOM		
	$("#"+sSomeTableName+"_wrapper #"+sSomeTableName+"_undo_button")
		.attr("title", sNewTooltip).addClass("tooltip");
	
	// update the tooltips
	$(".tooltip").tipTip(oTiptipConfig);
	
	// change color of button since the undo button will work now
	$("#"+sSomeTableName+"_wrapper #"+sSomeTableName+"_undo_button")
		.css("background-color", "#8591A0");
	
	
};




// get old values from the top of the undo stack and restore those
un.undoEvent = function(sSomeTableName){
	
	var thisStack = mt.undoStacksGet(sSomeTableName);
	var thisTooltipsStack = mt.undoTooltipsGet(sSomeTableName);
	
	// do we have any data to restore?
	if (thisStack.length==0)
		return;
	
	// get needed data from the stack
	var oDataToRestore = thisStack.pop();	
	// remove the tooltip of the action we are now undoing, and get the new relevant tooltip
	thisTooltipsStack.pop();
	var sCurrentTooltip = thisTooltipsStack[thisTooltipsStack.length-1];
	
	// update the stacks after the removals of the tops
	mt.undoStacksPut(sSomeTableName, thisStack);
	mt.undoTooltipsPut(sSomeTableName, thisTooltipsStack);
	
	// retrieve the data to restore
	var sRowId = 			oDataToRestore.rowId;	
	var iColumnNumber =		oDataToRestore.columnIndex;
	var sOldValue = 		oDataToRestore.oldValue;
	var nNodeToRestore =	fn.getNodeWhereIdIs(sSomeTableName, sRowId);
	
	// update the tooltip, t.i. show the previous action that can be undone next.
	$("#"+sSomeTableName+"_wrapper #"+sSomeTableName+"_undo_button")
	.attr("title", sCurrentTooltip).addClass("tooltip");
	$(".tooltip").tipTip(oTiptipConfig);
	
	// if we have no data to restore, leave right away
	if (typeof oDataToRestore == 'undefined')
		return true;
	
	if (thisStack.length==0)
		un.cleanUndoStack(sSomeTableName);
	
	
	// get the right node to modify on screen, given the id of the node on top of the stack
	// (we work with ids instead of row numbers, because deletion of some record would
	//  make the row number obsolete)
	var nNode = (nNodeToRestore!=null) ?
			nNodeToRestore.childNodes[iColumnNumber] : null;
	
	// do we have a custom edit function for the node to restore?	
	var oTableConfig = conf.getTableConfig(sSomeTableName);	
	var sColumnName = mt.getListOfVisibleColumnsOf(sSomeTableName)[iColumnNumber];
	var oColumnConfig = conf.getColumnConfig(oTableConfig, sColumnName);
	var fnEditFunction = conf.getEditFunction(oColumnConfig);

	
	// if we have a custom edit function, 
	// restore the node according to this custom function
	if ( fnEditFunction != null )
		{
		// if can only update the screen cell if the node is still in sight
		if (nNode != null)
			{
			var aPos = mt.getDataTableObjectOf(sSomeTableName).fnGetPosition( nNode );
			conf.getEditFunction(oColumnConfig)(mt.getDataTableObjectOf(sSomeTableName), nNode, sOldValue);
			conf.refreshTables(oColumnConfig);
			}		
		}
	// otherwise, just restore the node the normal way
	else
		{
		gui.showProcessingMsg(sSomeTableName);		
		var url = "../lexit/lexit/table/setvalue";
		$.ajax( {
			"type": "GET",
			"async": false,
			"url": url,
			"data": {
				"row_id": sRowId,
				"db_name": getHttpParams().get("db"),
				"table_name": sSomeTableName,
				"column_name": sColumnName,
				"new_value": sOldValue,				
				"dummy": getUniqueNumber()
				},
		 	"dataType": "xml", // get response as xml
		 	"success": function(xml) {
		 		gui.removeProcessingMsg(sSomeTableName);
		 		if (gui.getDbResponse(xml))
		 			{
		 			// if can only update the screen cell if the node is still in sight
		 			if (nNode != null)
		 				{
		 				var aPos = mt.getDataTableObjectOf(sSomeTableName).fnGetPosition( nNode );
			 			mt.getDataTableObjectOf(sSomeTableName).fnUpdate( sOldValue, aPos[0], aPos[2], false );
			 			// refresh the tables that config file requires to be refreshed upon editing of current cell
			 			conf.refreshTables(oColumnConfig);
		 				}
		 			}
		 		else
		 			{
		 			fn.message("Fout in tabel '"+sSomeTableName+"'", "Er is een fout opgetreden ["+gui.getDbResponse(xml)+"]");
		 			}
		 		},
			"error": function(jqXHR, textStatus, errorThrown){
				gui.refreshTable(sSomeTableName);
				mt.getDataTableObjectOf(sSomeTableName).fnDraw();
				fn.message("Fout in tabel '"+sSomeTableName+"'", "Er is een fout opgetreden: "+
					textStatus+" "+errorThrown);
				}
			} );
		}
	
	
};
