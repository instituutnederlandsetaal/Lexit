/**
 * 
 */

var un = {};



// Reactivate crossbrowser tooltips upon mouseenter event in the table header.
// this is needed for the undo button tooltips 
// Since tipTip does not operates on elements created after its activation,
// changing tooltips of the undo button in the header needs reactivation of tipTip
// on time, t.i. before the user reaches the undo button, when entering the table header.
$(document).on("mouseenter", "div.top", function(){
	$(".tooltip").tipTip( gui.getTiptipConfig() );
	});


// clean or generate the undo stack of a table
un.cleanUndoStack = function(sSomeTableName){
	
	var undoStack    = new Array(); 
	var tooltipStack = new Array();
	var sEmptyTooltip = lang.undo_button;
	tooltipStack.push(sEmptyTooltip);
	
	mt.putUndoStacks(sSomeTableName, undoStack);
	mt.putUndoTooltips(sSomeTableName, tooltipStack);
	
	// change the color of the button since it won't work anymore now (because stack is empty)
	$("#"+sSomeTableName+"_wrapper #"+sSomeTableName+"_undo_button")
		.css("background-color", "#D5DAE4");

	// tooltip
	$("#"+sSomeTableName+"_wrapper #"+sSomeTableName+"_undo_button")
		.attr("title", sEmptyTooltip).addClass("tooltip");
	
	// update the tooltips
	$(".tooltip").tipTip( gui.getTiptipConfig() );
};


// add old values onto the undo stack
un.addEvent = function(sSomeTableName, sRowId, iColumnNr, sOldValue){
	
	var thisStack = mt.getUndoStacks(sSomeTableName);	
	
	// first check if the stack is not already having the same undo event
	// on its top: it can happen in IE (since addEvent is called upon 'click'
	// in IE because it doesn't recognize 'change' like other browsers!!)
	
	if (thisStack.length>0) {
		var copyOfStack = lexutil.cloneArray(thisStack);
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
	mt.putUndoStacks(sSomeTableName, thisStack);
	
	
	// add button tooltips explaining recovery consequences
	
	// we must add a new tooltip to the stack and show it	
	
	// define a new tooltip
	
	var oRowOnStack =	fx.getRowWhereIdIs(sSomeTableName, sRowId);
	// human users count 1-based instead of 0-based, so we add 1 to the row index
	var iRowNumber = 	fx.getRowIndex(oRowOnStack)+1;
	var sColName = 		mt.getListOfVisibleColumnsOf(sSomeTableName)[iColumnNr];
	var sNewTooltip =   lang.undo_restore_msg1+ " '" +sOldValue+ "' "+ lang.undo_restore_msg2 +" "+ iRowNumber + " " +lang.undo_restore_msg3+ " '"+ sColName +"'.";
	
	// put the new tooltip onto the stack of previous tooltips
	var thisTooltipsStack = mt.getUndoTooltips(sSomeTableName);
	thisTooltipsStack.push(sNewTooltip);
	mt.putUndoTooltips(sSomeTableName, thisTooltipsStack);
	
	// put tooltip in the DOM		
	$("#"+sSomeTableName+"_wrapper #"+sSomeTableName+"_undo_button")
		.attr("title", sNewTooltip).addClass("tooltip");
	
	// update the tooltips
	$(".tooltip").tipTip( gui.getTiptipConfig() );
	
	// change color of button since the undo button will work now
	$("#"+sSomeTableName+"_wrapper #"+sSomeTableName+"_undo_button")
		.css("background-color", "#8591A0");
	
	
};




// get old values from the top of the undo stack and restore those
un.undoEvent = function(sSomeTableName){
	
	var thisStack = mt.getUndoStacks(sSomeTableName);
	var thisTooltipsStack = mt.getUndoTooltips(sSomeTableName);
	
	// do we have any data to restore?
	if (thisStack.length==0)
		return;
	
	// get needed data from the stack
	var oDataToRestore = thisStack.pop();	
	
	// remove the tooltip of the action we are now undoing, and get the new relevant tooltip
	thisTooltipsStack.pop();
	var sCurrentTooltip = thisTooltipsStack[thisTooltipsStack.length-1];
	
	// update the stacks after the removals of the tops
	mt.putUndoStacks(sSomeTableName, thisStack);
	mt.putUndoTooltips(sSomeTableName, thisTooltipsStack);
	
	// retrieve the data to restore
	var sRowId = 			oDataToRestore.rowId;	
	var iColumnNumber =		oDataToRestore.columnIndex;
	var sOldValue = 		oDataToRestore.oldValue;
	var nNodeToRestore =	fx.getRowWhereIdIs(sSomeTableName, sRowId).node();
	
	// update the tooltip, t.i. show the previous action that can be undone next.
	$("#"+sSomeTableName+"_wrapper #"+sSomeTableName+"_undo_button")
		.attr("title", sCurrentTooltip).addClass("tooltip");
	$(".tooltip").tipTip( gui.getTiptipConfig() );
	
	// if we have no data to restore, leave right away
	if (typeof oDataToRestore == 'undefined')
		return true;
	
	if (thisStack.length==0)
		un.cleanUndoStack(sSomeTableName);
	
	
	// get the right node to modify on screen, given the id of the node on top of the stack
	// (we work with ids instead of row numbers, because deletion of some record would
	//  make the row number obsolete)
	
	var nNode = (nNodeToRestore!=null) ?
			mt.getDataTableObjectOf(sSomeTableName).cell(nNodeToRestore, iColumnNumber) : null;
	
	// do we have a custom edit function for the node to restore?	
	var oTableConfig = conf.getTableConfig(sSomeTableName);	
	var sColumnName = mt.getListOfVisibleColumnsOf(sSomeTableName)[iColumnNumber];
	var oColumnConfig = conf.getColumnConfig(oTableConfig, sColumnName);
	var fnEditFunction = conf.getEditFunction(oColumnConfig);

	
	// if we have a custom edit function, 
	// restore the node according to this custom function
	if ( fnEditFunction != null ) {		
		// we can only update the screen cell if the node is still in sight
		if (nNode != null) {
			conf.getEditFunction(oColumnConfig)(mt.getDataTableObjectOf(sSomeTableName), nNode, sOldValue);
			conf.refreshTables(oColumnConfig);
		}		
	}
	// otherwise, just restore the node the normal way
	else {
		gui.showProcessingMsg(sSomeTableName);		
		var url = WEBSERV_URL+"/api/setvalue";
		$.ajax( {
			"type": "GET",
			"async": false,
			"url": url,
			"data": {
				"row_id": sRowId,
				"db_name": lexutil.getHttpParams().get("db"),
				"table_name": sSomeTableName,
				"column_name": sColumnName,
				"new_value": sOldValue,				
				"dummy": lexutil.getUniqueNumber()
				},
		 	"dataType": "xml", // get response as xml
		 	"success": function(xml) {
		 		gui.removeProcessingMsg(sSomeTableName);
		 		if (gui.getDbResponse(xml)) {
		 			// it can only update the screen cell if the node is still in sight
		 			if (nNode != null) {
		 				fn.putDataIntoCellNode(nNodeToRestore, sColumnName, sOldValue);
			 			// refresh the tables that config file requires 
		 				// to be refreshed upon editing of current cell
			 			conf.refreshTables(oColumnConfig);
		 			}
		 		}
		 		else {
		 			fn.message(lang.error_occurred_in_table+ " '"+sSomeTableName+"'", 
		 					lang.some_error_has_occurred+ " ["+gui.getDbResponse(xml)+"]");
		 		}
		 	},
			"error": function(jqXHR, textStatus, errorThrown){
				
				fn.message(lang.error_occurred_in_table+ " '"+sSomeTableName+"'", 
					lang.some_error_has_occurred+ ": "+textStatus+" "+errorThrown,
					function(){
						gui.refreshTable(sSomeTableName);
					}
				); 
			}
		 		
		});
	}	
};