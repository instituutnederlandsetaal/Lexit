/**
 * Graphic user interface - header of the table
 */



var head = {}; 


// set Header sensitivity
// takes care of general header behaviour at mouse entering/leaving, click etc.

head.setHeaderSensitivity = function(sSomeTableName){
	
	// clicking in head activate arrow keys of that table (t.i. get focus on this table!)
	$("#"+sSomeTableName+"_wrapper div.top").mousedown(function(){
		
		// select a row in the table having focus
		// t.i. set the currently selected row active, and
		// if was none, select the very first visible row
		var nActiveRow = 		fn.getActiveRowNode(sSomeTableName);
		
		if ( nActiveRow != null)
			{			
			var iRowToSetActive = 	fn.getRowNodeNumberOnScreen(nActiveRow);			
			
			kf.setActiveTable( sSomeTableName );
			kf.setActiveRowNumber( iRowToSetActive );
			
			// put table in front
			$("#"+sSomeTableName+"_dynamic").putInFront();
			
			}
			
		// BEWARE: we only select a row if none is selected yet.
		// We do so to prevent a given rows selection from getting corrupted (as some new row 
		// would be unpredictably added to the selection than)
		if (fn.getNumberOfSelectedRowNodes(sSomeTableName) == 0 && iRowToSetActive>-1)
			fn.selectRowNode(sSomeTableName, iRowToSetActive);
				
	});
	
	
	
	// make table draggable when the mouse pointer is in the header
	var bDraggingNow = false; 
	$("#"+sSomeTableName+"_wrapper div.top").mouseenter(function(){
		if ( !$("#"+sSomeTableName+"_dynamic").hasClass("draggable") )
			{
			$("#"+sSomeTableName+"_dynamic").addClass("draggable");
			$("#"+sSomeTableName+"_dynamic").draggable({
				
				// solution to prevent slow dragging: make use of an helper
				// see: http://mycreativedesign.co.uk/2013/06/07/optimizing-jquery-draggables/
				// and  http://jsfiddle.net/Nwwv9/
				    helper: function() {
				    	
				    	bDraggingNow = true;
				    	return ($("<div>")
				    			.css("height", $(this).height()) 
				    			.css("width", $(this).width()) 
				    			.addClass('draggableHelper')
				    			.css("z-index", 9999999) // always in front
				    			); 
				    }, 
				    // dragging is finished: put the table at the chosen place
				    stop: function( event, ui ) { 
				    	bDraggingNow = false;
				        var iLeft = ui.offset.left + 'px'; // offset works better than position in Chrome
				        var iTop = ui.offset.top + 'px';
				        $(this)
					        .css("position", "absolute")
							.css("top", iTop)
							.css("left", iLeft); 
				        
				        // somehow the highlight of columns get slow after dragging,
				        // but refreshing all tables seems to help
				        // NB: as a consequence the undo stack of each table will be emptied
				        var aAllTables = mt.getListOfLoadedTables();
				        for (var i=0; i<aAllTables.length; i++)
				        	{
				        	fn.refreshTable(aAllTables[i]);				        	
				        	}
				    }
				});
			}
	});
	
	$("#"+sSomeTableName+"_wrapper div.top").mouseleave(function(){
		// if table is draggable, but the user is not dragging at the moment,
		// and we are leaving the header, make the table NOT draggable
		if ( $("#"+sSomeTableName+"_dynamic").hasClass("draggable")
				&& !bDraggingNow )
			{			
			$("#"+sSomeTableName+"_dynamic").draggable("destroy");
			$("#"+sSomeTableName+"_dynamic").removeClass("draggable");
			}
	});	
	
	// prevent table length selection from keeping focus, 
	// to prevent sudden unpredictable table length changes
	$(".dataTables_length label select option").click(function(){
		$(".dataTables_length label select").blur();
	});
	
	
};


// set the height of the table header
head.setHeaderHeight = function(sSomeTableName){
	
	// read the settings
	var aTableSettings = conf.getTableSettings(sSomeTableName);
	
	// if no header height was set, but the configuration contains some buttons, 
	// we must force a greater height to give room to the buttons
	var iNewHeight = conf.getHeaderHeight(aTableSettings);
	var iNumberOfButtons = conf.getNumberOfHeaderButtons(aTableSettings);
	if (iNumberOfButtons>0 && iNewHeight == conf._defaultHeight())
		{
		iNewHeight = 80;
		}
	
	$("#"+sSomeTableName+"_wrapper").find("div.top").css("height", iNewHeight);	
	$("#"+sSomeTableName+"_wrapper").find("div."+sSomeTableName+"_bottom_pane").css("height", "30px");
	
};

// keep standard main search input field, or remove it if required
head.setMainSearch = function(sSomeTableName){
	
	// read the settings
	var aTableSettings = conf.getTableSettings(sSomeTableName);
	
	if (aTableSettings!=null && !conf.getMainSearch(aTableSettings))
		$("#"+sSomeTableName+"_filter").find("label").remove();
	else
		$("#"+sSomeTableName+"_filter").append($("<br/>"));
};


// put name of a table in its information block

head.showNameOfTheTable = function(sSomeTablename){
	
	// if some 'nice table name' was defined in the project configuration
	// replace the standard table description by this 'nice_name'
	var oTableSettings = conf.getTableSettings(sSomeTablename);
	var sNiceName = conf.getNiceName(oTableSettings);
	var sNameToShow = (sNiceName != null) ? sNiceName : sSomeTablename;
	
	// if some header background color was declared, set it
	var sHeaderColor = conf.getHeaderColor(oTableSettings);
	if (sHeaderColor != null)
		{
		$("div#"+sSomeTablename+"_dynamic").find("div#"+sSomeTablename+"_wrapper").find("div.top").css("background-color", sHeaderColor);
		}
	
	var tableName = $("<span></span>")
		.text(sNameToShow+":")
		.css("font-weight", "bold")
		.css("color", "#A4A4A4")
		.attr("id", sSomeTablename+"_tablename")
		.attr("title", ( (document.URL).regexIndexOf( INL_HOMEURL )>-1 ) ? "Klik om notitie toe te voegen":"" )
		.addClass( ( (document.URL).regexIndexOf( INL_HOMEURL )>-1 ) ? "tooltip":"" )
		.click(function(){
			
			// clicking on the table name gives the possibility to
			// add notes or comments to a table

			// keep this list private to internal environment
			if ( (document.URL).regexIndexOf( INL_HOMEURL )>-1 )
				{
				
				$.ajax( {
					"type": "GET",
					"url": WEBSERV_URL+"/table/get_comment",
					"data": {
						"db_name": getHttpParams().get("db"),						
						"table_name": sSomeTablename,
						"table_type": mt.getAvailableTableDetails(sSomeTablename)[1],
						"dummy": getUniqueNumber()
						},
				 	"dataType": "xml", // get response as xml
				 	"success": function(xml) {

				 		var sOldTableComment = fn.getDbResponse(xml);
				 		
				 		fn.prompt("Tabelnotities", ["Notities"], [sOldTableComment], 
				 				
				 			function(){
							
				 				var sNewTableComment = fn.getPromptBoxInput("Notities");
							
								// update the database							 
								$.ajax( {
									"type": "GET",
									"url": WEBSERV_URL+"/table/setcomment",
									"data": {
										"db_name": getHttpParams().get("db"),
										"table_name": sSomeTablename,
										"table_type": (mt.getAvailableTableDetails(sSomeTablename)[1] == "view" ? "VIEW" : "TABLE"),
										"new_comment": sNewTableComment,
										"dummy": getUniqueNumber()
										},
								 	"dataType": "xml", // get response as xml
								 	"success": function(xml) {
								 		fn.message("Gelukt!", "De notitie is toegevoegd.");
								 		
								 		// update table details
								 		var aTableDetails = mt.getAvailableTableDetails(sSomeTablename);
								 		aTableDetails = [aTableDetails[0], aTableDetails[1], sNewTableComment];
								 		mt.addAvailableTableDetails(sSomeTablename, aTableDetails);
	
								 		},
									"error": function(jqXHR, textStatus, errorThrown){
										fn.refreshTable(sSomeTablename);
										fn.message("Fout bij het instellen van een notitie bij tabel '"+sSomeTablename+"'", "Er is een fout opgetreden: "+
											textStatus+" "+errorThrown);
										}
								} );
				 			},
				 			function(){
				 				
				 				fn.message("Geannuleerd", "Geen notitie opgeslagen");
				 			}, 
				 			true,  // textarea
				 			[35,7] // set minimal size of prompt
				 			
				 		);
				 		
				 		},
					"error": function(jqXHR, textStatus, errorThrown){
						fn.message("Fout bij het opvragen van de notitie bij tabel '"+sSomeTablename+"'", 
								"Er is een fout opgetreden: "+textStatus+" "+errorThrown);
						}
					} );
				
				}
			
			
		});
	
	$("#"+sSomeTablename+"_info").before(
			$("<div></div>")
			.attr("id", sSomeTablename+"_table_name")
			.css("margin-right", "10px")
			.css("position", "absolute")
			.css("top", "2px")
			.css("left", "2px")
			.css("heigth", "30%")
			.css("text-align", "left")			
			.append(tableName)
			);
};



head.putExactCountEvent = function(sSomeTableName){
	
	// add click event to trigger exact count
	$("#"+sSomeTableName+"_info").click(function(){
		// force exact count!
		// this will be set back to false (default value) in function tb.processExtraParamsFromServerResponse
		bForceExactCount = true; 
		// but for now, do a refresh with an exact count
		fn.refreshTable(sSomeTableName);
	});
}



/********************************
 *            BUTTONS           *
 ********************************/

// put user custom header buttons
// These buttons are defined in the configuration file (user defined)
head.putCustomHeaderButtons = function(sSomeTableName){
	
	var aTableSettings = 			conf.getTableSettings(sSomeTableName);	
	var iNumberOfCustomButtons = 	conf.getNumberOfHeaderButtons(aTableSettings);
	
	// put line break between application buttons and the following custom buttons
	if (iNumberOfCustomButtons>0)
		$("#"+sSomeTableName+"_filter").append(
				$("<div></div>")
				.attr("id", sSomeTableName+"_room_between_buttons")
				.css("display", "inline")
				.append($("<br/>"))
				);
	
	// loop through all custom defined buttons and add those into the interface 
	for (var i=0; i<iNumberOfCustomButtons; i++)
		{
		var aButtonSettings = 	conf.getHeaderButtonSettings(aTableSettings, i);
		var sButtonName = 		conf.getHeaderButtonName(aButtonSettings);
		var aButtonMenu = 		conf.getHeaderButtonMenu(aButtonSettings);
		var sButtonBgColor = 	conf.getHeaderButtonBgColor(aButtonSettings);
		var sButtonTextColor = 	conf.getHeaderButtonTextColor(aButtonSettings);
		var sToolTip = 			conf.getHeaderButtonToolTip(aButtonSettings);
		
		var customButton;
		
		// normal button
		if (aButtonMenu == null)
			{
			customButton = $("<button/>")
			.attr("id", sSomeTableName+"_button_"+i)
			.attr("type", "button")
			.css("background-color", sButtonBgColor)
			.css("color", sButtonTextColor)
			.addClass("header_button")
			.attr("name", i) // give button its number as name attribute
			.html(sButtonName)
			.bind("click", function(){
				// retrieve button function by its button number
				var aButtonSettings = 	conf.getHeaderButtonSettings(aTableSettings, $(this).attr("name"));
				var fnButtonFunction = 	conf.getHeaderButtonFunction(aButtonSettings);
				// execute the function
				fnButtonFunction( mt.getDataTableObjectOf(sSomeTableName) );
				});
			}
		// menu button
		else {
			customButton = $("<select/>")
			.attr("id", sSomeTableName+"_button_"+i)
			.css("background-color", sButtonBgColor)
			.css("color", sButtonTextColor)			
			.attr("name", i) // give button its number as name attribute
			.addClass("header_button");
			
			customButton.append(
					$("<option></option>")							
						.attr("value", sButtonName )
						.text( sButtonName )
				);
			
			// append all the options
			for (sOneOption in aButtonMenu)
			{
				customButton.append(
					$("<option></option>")							
						.attr("value", sOneOption )
						.text( sOneOption )
				);
			}
			// button behaviour
			customButton.bind("change", function(){
				
				var aButtonSettings = conf.getHeaderButtonSettings(aTableSettings, $(this).attr("name"));
				var sChosenOption = $(this).val();
				
				// menu option has been clicked upon (as it's not the button name, which is visible by default)
				if (sChosenOption != sButtonName) 
					{
					// retrieve menu option function 					
					var aButtonMenu = conf.getHeaderButtonMenu(aButtonSettings);
					// bind callback to be called for this particular option
					aButtonMenu[sChosenOption](mt.getDataTableObjectOf(sSomeTableName));
					}				
				$(this).blur();				
				
				// button name must keep visible after a choice was name
				var sButtonName = conf.getHeaderButtonName(aButtonSettings);
				$(this).val(sButtonName);
			});
		}
		
		
		// add tooltip
		if (sToolTip != null)
			customButton.attr("title", sToolTip).addClass("tooltip");
	
		$("#"+sSomeTableName+"_filter").append(
			$("<div></div>").attr("id", sSomeTableName+"_custombutton_"+i).css("display", "inline").append(customButton)
			);
		}
	
};



// put a reset button on the user interface
// this will clear all filters easily after a search through the database
head.putResetButton = function(sSomeTablename){
	
	// is this button allowed according to configuration?
	var aTableSettings = conf.getTableSettings(sSomeTablename);
	if ( !conf.getResetButton(aTableSettings)) return true;
			
	var resetButton = $("<button/>")
		.attr("type", "button")
		.css("background-color", "#DBB8FF")
		.append($("<span></span>").addClass("ui-icon ui-icon-home"))
		.attr("title", "Reset").addClass("tooltip")
		.addClass("header_button")
		.bind("click", function(){
			
			// abort the running database draw
			mt.getDataTableObjectOf(sSomeTablename).abortCall();
			
			// clean the go-to stack
			mt.rememberOccurenceNr( sSomeTablename, 0 );
			mt.rememberLastGoToCommand( sSomeTablename, "" );
			
			// clean the undo stack
			un.cleanUndoStack(sSomeTablename);
			
			// clear highlighted rows
			row.clearRowSelection(sSomeTablename);
			
			// clear search fields
			sf.clearPerColumnSearchFields(sSomeTablename);					
			sf.clearSearchField(sSomeTablename);
			
			// cancel optimal mode in any case
			mt.setTableMustBeOptimal(sSomeTablename, false);
			
			// force webservice to clean its counter cache etc
			fn.cleanTableCache(sSomeTablename, 
				function(){
				
					// send empty search request			
					mt.getDataTableObjectOf(sSomeTablename).resetSearchFilters();
					
					// call the pre-reset callback before the table is actually reset
					if (conf.getPreResetCallback( conf.getTableSettings(sSomeTablename)) != null)
						conf.getPreResetCallback( conf.getTableSettings(sSomeTablename))(mt.getDataTableObjectOf(sSomeTablename));
					
					// this one does the table refresh!
					var aSorting = conf.getDefaultSortingSettings(sSomeTablename);
					
					// see https://www.datatables.net/plug-ins/api/order.neutral%28%29
					if (aSorting.length==0) 
						mt.getDataTableObjectOf(sSomeTablename).order.neutral();
					else
						mt.getDataTableObjectOf(sSomeTablename).order(aSorting);
					
					mt.getDataTableObjectOf(sSomeTablename).draw();
				
					// put the current search filters values into the search boxes
					sf.putCurrentValueInAllSearchBoxes(sSomeTablename);					
			});
			
			
		});
	
	$("#"+sSomeTablename+"_filter").append(
			$("<div></div>").attr("id", sSomeTablename+"_resetbutton").css("display", "inline").append(resetButton)
			);
	
};




head.putColumnSelectionButton = function(sSomeTablename){
	
	// is this button allowed according to configuration?
	var aTableSettings = conf.getTableSettings(sSomeTablename);
	if ( !conf.getColumnsSelectionButton(aTableSettings)) return true;
	
	var bOptimal = mt.getTableMustBeOptimal(sSomeTablename);
			
	var colSelectButton = $("<button/>")
		.attr("type", "button")		
		.append($("<span></span>").addClass("ui-icon ui-icon-wrench"))
		.attr("title", "Kolommenselectie").addClass("tooltip")
		.addClass("header_button")
		.bind("click", function(){
			
			td.selectColumns(sSomeTablename);
		});
	
	$("#"+sSomeTablename+"_filter").append(
			$("<div></div>").attr("id", sSomeTablename+"_colselect_button").css("display", "inline").append(colSelectButton)
			);
	
	// if the 'optimal' mode is turned on, it must be visible (colored button)
	head.setColorOfColumnSelectionButton(sSomeTablename, bOptimal);	
};



//set the right color for the column selection button
//if in optimal mode, the column setting button should look a bit darker
head.setColorOfColumnSelectionButton = function(sTableName, bOptimal){
	
	$("#"+sTableName+"_colselect_button button")
		.css("background-color", bOptimal ? "#00A2E0" : "#B2DEF7")
		.attr("title", bOptimal ? 
				"Kolommenselectie (Optimale modus staat AAN: kolommen zonder inhoud worden automatisch verborgen)" : 
				"Kolommenselectie");
};





head.putViewTypeButton = function(sSomeTablename){
	
	// is this button allowed according to configuration?
	var aTableSettings = conf.getTableSettings(sSomeTablename);
	if ( !conf.getViewTypeButton(aTableSettings)) return true;
			
	var viewtypeButton = $("<button/>")
		.attr("type", "button")
		.css("background-color", "#F4FA58")
		.append($("<span></span>").addClass("ui-icon ui-icon-image"))
		.attr("title", "Formulier/tabel view").addClass("tooltip")
		.addClass("header_button")
		.bind("click", function(){
			
			// change view type
			mt.toggleViewType(sSomeTablename);
						
			// set the right display length for the view type:
			
			// 1: switch from form to table view
			if (mt.getViewType(sSomeTablename) == 'table')
				{				
				// reset position or pagination pane
				$("#"+sSomeTablename+"_wrapper").css("height", "auto");
				// remove cell labels of form view
				$("#"+sSomeTablename+"_wrapper div#"+sSomeTablename+"_cell_label").remove();
				
				// get the current display start: we will show the corresponding page 
				// once we get into the table view mode
				var iNowIndex = fn.getCurrentDisplayStart(sSomeTablename);
				
				// set display length back to default
				mt.getDataTableObjectOf(sSomeTablename).page.len(10);				
				// set the right page (is calculated with row index)
				mt.getDataTableObjectOf(sSomeTablename).displayRow(iNowIndex).draw(false);
				
				// disable display length selection (since form view must allow only 1 record length)
				$("#"+sSomeTablename+"_length select").removeAttr('disabled');				
				}
			// 2: switch from table to form view
			else
				{
				// get the selected row: we will show exactly that row once we get into the form view.
				// if no row was selected, take the first screen row
				var oRow = fx.getFirstSelectedRowFrom(sSomeTablename);				
				var iRowNumber = (oRow!=null) ?
						fx.getRowNumberOnScreen(oRow) : 0;
				var iNowIndex = fn.getCurrentDisplayStart(sSomeTablename) + iRowNumber;				
				
				// set display length to '1' record (default for forms)
				mt.getDataTableObjectOf(sSomeTablename).page.len(1);
				
				// set the right page to show in the form view mode
				// this is now the same as the row index, since the display length is set to '1'
				mt.getDataTableObjectOf(sSomeTablename).displayRow(iNowIndex).draw(false);
				
				// display length selection re-enabled
				$("#"+sSomeTablename+"_length select").attr("disabled","disabled");
				}
			
			// clean the undo stack
			un.cleanUndoStack(sSomeTablename);
			
			// clear highlighted rows
			row.clearRowSelection(sSomeTablename);			

		});
	
	$("#"+sSomeTablename+"_filter").append(
			$("<div></div>").attr("id", sSomeTablename+"_viewtypebutton").css("display", "inline").append(viewtypeButton)
			);	
};


head.putRefreshButton = function(sSomeTablename){
	
	// is this button allowed according to configuration?
	var aTableSettings = conf.getTableSettings(sSomeTablename);
	if ( !conf.getRefreshButton(aTableSettings)) return true;
			
	var refreshButton = $("<button/>")
		.attr("type", "button")
		.css("background-color", "#99CCFF")
		.append($("<span></span>").addClass("ui-icon ui-icon-refresh"))
		.attr("title", "Ververs [F5]").addClass("tooltip")
		.addClass("header_button")
		.bind("click", function(){
			
			// abort the running database draw
			mt.getDataTableObjectOf(sSomeTablename).abortCall();
			
			// clean the undo stack
			un.cleanUndoStack(sSomeTablename);
			
			// force webservice to clean its counter cache etc
			fn.cleanTableCache(sSomeTablename, 
					function(){
						fn.refreshTable(sSomeTablename);
						}
			);

		});
	
	$("#"+sSomeTablename+"_filter").append(
			$("<div></div>").attr("id", sSomeTablename+"_refreshbutton").css("display", "inline").append(refreshButton)
			);
	
};


head.putUndoButton = function(sSomeTablename){
	
	// is this button allowed according to configuration?
	var aTableSettings = conf.getTableSettings(sSomeTablename);
	if ( !conf.getUndoButton(aTableSettings)) return true;
	
	// has this button any sense? 
	// That is: if it is not allowed to edit any field
	// than this button won't be needed
	if (!conf.tableHasSomeEditableTextFields(sSomeTablename)) return true;
	
	// make sure undo stack is cleaned when leaving a page
	$("#"+sSomeTablename+"_dynamic").on('click', "#"+sSomeTablename+"_wrapper .dataTables_paginate",
			function(){
		un.cleanUndoStack(sSomeTablename);
	});
	
	var undoButton = $("<button/>")
		.attr("type", "button")
		.attr("id", sSomeTablename+"_undo_button")
		.css("background-color", "#D5DAE4")		
		.addClass("header_button")
		.bind("click", function(){
			
			fn.confirm("Let op", "Weet u zeker dat u de laatste bewerking ongedaan wilt maken?", function(){
				
				// clear highlighted rows
				row.clearRowSelection(sSomeTablename);
				// undo last change
				un.undoEvent(sSomeTablename);
			});			
			
		})
		// button text and counter
		.append( $("<span></span>")
					.attr("id", sSomeTablename+"_undo_button_text")
					.addClass("ui-icon ui-icon-arrowreturnthick-1-w")
				);
	
	$("#"+sSomeTablename+"_filter").append(
			$("<div></div>").attr("id", sSomeTablename+"_undo_button_div").css("display", "inline").append(undoButton)
			);
	
};




//put a Go To button 
head.putGoToButton = function(sSomeTablename){
	
	// is this button allowed according to configuration?
	var aTableSettings = conf.getTableSettings(sSomeTablename);
	if ( !conf.getGoToButton(aTableSettings)) return true;
	
	var goToButton = $("<button/>")
		.attr("type", "button")
		.css("background-color", "#FF8585")
		.append($("<span></span>").addClass("ui-icon ui-icon-circle-arrow-e"))
		.attr("title", "Ga naar woord<BR>[+Shift: naar pagina]").addClass("tooltip")
		.addClass("header_button")
		.bind("click", function(){
			
			// special case: shift was pressed
			if (kf._getPressedKey() == 'shift')
				{
				fn.prompt("Ga naar (vul één waarde in):", ["Rijnummer", "Paginanummer"], ["", ""], 
						function(){
					
							var sRowNumber = fn.getPromptBoxInput("Rijnummer");
							var sPageNumber = fn.getPromptBoxInput("Paginanummer");
							var iRowNumber, iPageNumber;
							
							try {
								iRowNumber = (sRowNumber != "") ? parseInt(sRowNumber) : null;
								iPageNumber = (sPageNumber != "") ? parseInt(sPageNumber) : null;
								
								// compute row number when input was page number
								if (iPageNumber != null)
									iRowNumber = (iPageNumber-1) * (fn.getCurrentDisplayLength(sSomeTablename));
								
								// now go to the right row
								if (iPageNumber != null || iRowNumber != null)
									mt.getDataTableObjectOf(sSomeTablename).displayRow(iRowNumber).draw(false);								
							}
							catch(err)
							{
								fn.message("Let op!", "U moet wel een rijnummer of paginanummer invullen! "+
										"["+err.message+"]");
							}
							
						});
				}
			else
				{
				// default behaviour
				sf.goTo(sSomeTablename);
				}
			
			
		});	
	
	$("#"+sSomeTablename+"_filter").append(
			$("<div></div>").attr("id", sSomeTablename+"_goto_button").css("display", "inline").append(goToButton)
			);
};


// put a search and replace button
// and build the needed interface behind it

head.putSearchAndReplaceButton = function(sSomeTablename){
	
	// is this button allowed according to configuration?
	var aTableSettings = conf.getTableSettings(sSomeTablename);
	if ( !conf.getReplaceButton(aTableSettings)) return true;
	
	// has this button any sense? 
	// That is: if it is not allowed to edit any field
	// than this button won't be needed
	if (!conf.tableHasSomeEditableTextFields(sSomeTablename)) return true;
	
	var searchAndReplaceButton = $("<button/>")
		.attr("type", "button")
		.css("background-color", "#D8F781")
		.append($("<span></span>").addClass("ui-icon ui-icon-search"))
		.attr("title", "Zoek & bewerk").addClass("tooltip")
		//.addClass("functions_are_asleep")
		.addClass("header_button")
		.bind("click", function(){			
			
			$("#"+sSomeTablename+"_search_and_replace").remove();
			// clear highlighted rows
			row.clearRowSelection(sSomeTablename);
			
			$("#"+sSomeTablename+"_wrapper div.top").hide("slow");
			$("#"+sSomeTablename+"_wrapper div.top").before( ssr.buildSearchAndReplaceDiv(sSomeTablename) );
			$("#"+sSomeTablename+"_search_and_replace").show("slow")
			.queue(
					function(){
						// set the previous values back into the fields in such a way that editing gets faster
						if (mt.getPreviousOldString(sSomeTablename) != null)
							$("#"+sSomeTablename+"_old_string").val(mt.getPreviousOldString(sSomeTablename));
						if (mt.getPreviousNewString(sSomeTablename) != null)
							$("#"+sSomeTablename+"_new_string").val(mt.getPreviousNewString(sSomeTablename));
						var sPreviousColumnToAlter = mt.getPreviousColumnToAlter(sSomeTablename);
						if (sPreviousColumnToAlter != '' && sPreviousColumnToAlter != null)
							$("#"+sSomeTablename+"_selected_column option[value='"+sPreviousColumnToAlter+"']").attr('selected','selected');
						var sPreviousActionToPerform = mt.getPreviousActionToPerform(sSomeTablename);
						if (sPreviousActionToPerform != '' && sPreviousActionToPerform != null)
							$("#"+sSomeTablename+"_selected_action option[value='"+sPreviousActionToPerform+"']").attr('selected','selected');
						$(this).dequeue();
						}
					);
			
		});
	
	$("#"+sSomeTablename+"_filter").append(
			$("<div></div>").attr("id", sSomeTablename+"_searchandreplacebutton").css("display", "inline").append(searchAndReplaceButton)
			);
	
};




// selection button and its behaviour
// clicking on the button deactivate the table call functions since we want te be able to select
// a row without triggering something
// re-clicking on the button reactivate the table call functions but deactivate row selection
head.putSelectionButton = function(sSomeTablename){
	
	// is this button allowed according to configuration?
	var aTableSettings = conf.getTableSettings(sSomeTablename);
	if ( !conf.getSelectionButton(aTableSettings)) return true;
	
	// what is the current setting of the button?
	var bRowSelectionAllowed = mt.rowSelectionIsAllowed(sSomeTablename);	
	var sButtonMsg = bRowSelectionAllowed ? "Zet rijselectie UIT [F2]" : "Zet rijselectie AAN [F2]";
	var sBackgroundColor = bRowSelectionAllowed ? "#EE0000" : "#99CCFF";
	var sFunctionAwakeOrAsleep = bRowSelectionAllowed ? "functions_are_asleep" : "functions_are_awake";
		
	
	// button to activate/deactivate selection mode
	var makeSelectionButton = $("<button/>")
		.attr("type", "button")
		.attr("id", "selectionbutton")
		.css("background-color", sBackgroundColor)
		.addClass(sFunctionAwakeOrAsleep)
		.addClass("header_button")
		.append($("<span></span>").addClass("ui-icon ui-icon-pin-s"))
		.attr("title", sButtonMsg).addClass("tooltip");
	
//	$("#"+sSomeTablename+"_filter").append(
//			$("<div></div>").css("display", "inline").prepend(makeSelectionButton)
//			);
	
	$("#"+sSomeTablename+"_filter").append(
			$("<div></div>").css("display", "inline").append(makeSelectionButton)
			);
	
	$(".tooltip").tipTip( gui.getTiptipConfig() );
	
	// functions activation and deactivation, depending on elements clicked on
	$("#"+sSomeTablename+"_dynamic").on("click", "#"+sSomeTablename+"_wrapper button.functions_are_awake", 
			function(){	
		
		mt.putRowSelectionIsAllowed(sSomeTablename, true);
		
		// disable the checkboxes to make sure those won't be (un)checked during row selection 
		$('#'+sSomeTablename+' td.editable_checkbox input').attr("disabled", true);
				
		// give button the right settings
		$("#"+sSomeTablename+"_wrapper #selectionbutton")
			.css("background-color", "#EE0000")
			.attr("title", "Zet rijselectie UIT [F2]").addClass("tooltip");
		$("#"+sSomeTablename+"_wrapper #selectionbutton")
			.delay(500).removeClass("functions_are_awake").addClass("functions_are_asleep");
		
		$(".tooltip").tipTip( gui.getTiptipConfig() );
		
	});
	$("#"+sSomeTablename+"_dynamic").on("click", "#"+sSomeTablename+"_wrapper button.functions_are_asleep", 
			function(){		
		
		mt.putRowSelectionIsAllowed(sSomeTablename, false);
		
		// re-enable checkboxes after those have been disabled when selection modus was put on
		$('#'+sSomeTablename+' td.editable_checkbox input').attr("disabled", false);		
		
		// give button the right settings
		$("#"+sSomeTablename+"_wrapper #selectionbutton")
			.css("background-color", "#99CCFF")
			.attr("title", "Zet rijselectie AAN [F2]").addClass("tooltip");
		$("#"+sSomeTablename+"_wrapper #selectionbutton")
			.delay(500).removeClass("functions_are_asleep").addClass("functions_are_awake");
		
		$(".tooltip").tipTip( gui.getTiptipConfig() );
		
		// remove row selection
		fx.unselectAllRows(sSomeTablename);
	});
	
	// if the selection button is supposed to be turned on upon creation of a table
	// click the button on automatically
	if (conf.getSelectionButtonActive(aTableSettings))
		$("#"+sSomeTablename+"_wrapper").find("#selectionbutton").click();
};


// add a help button
head.putHelpButton = function(sSomeTablename){
	
	// is this button allowed according to configuration?
	var aTableSettings = conf.getTableSettings(sSomeTablename);
	if ( !conf.getHelpButton(aTableSettings)) return true;
			
	var helpButton = $("<button/>")
		.attr("type", "button")
		.css("background-color", "#B4F0D2")
		.append($("<span></span>").addClass("ui-icon ui-icon-help"))
		.attr("title", "Hulp").addClass("tooltip")
		.addClass("header_button")
		.bind("click", function(){
			
			
			// we'll be combining jquerui tabs and dialog
			// see: http://stackoverflow.com/questions/15472048/jquery-ui-tabs-and-dialog
			
			var helpDivId = "dialog"+getUniqueNumber();
			
			var helpDiv = $("<div></div>")
				.attr("id", helpDivId)
				.attr("title", "Hulp")
				.css("font-size", "12px");
			
			var helpText = 
				
				"<ul>"+
				"<li><a href='#tabs-1'>Overzicht van de knoppen</a></li>"+
				"<li><a href='#tabs-2'>Zoeken</a></li>"+
				"<li><a href='#tabs-5'>Sorteren</a></li>"+
				"<li><a href='#tabs-3'>Bewerken</a></li>"+
				"<li><a href='#tabs-4'>Sneltoetsen</a></li>"+				
				"<li><a href='#tabs-info'>Info</a></li>"+
				"</ul>" +
				
				"<div id='tabs-1'>" +
				"<TABLE>"+
				"<TR>"+
				"<TD><span class='ui-icon ui-icon-home'></span></TD>"+
				"<TD>&nbsp;&nbsp;</TD>"+
				"<TD><B>Reset</B></TD>"+
				"</TR>" +
				"<TR>"+
				"<TD></TD>" +
				"<TD></TD>" +
				"<TD>" +
				"Ga terug naar de beginstand van de tabel." +
				"<BR><BR></TD>"+
				"</TR>"+
				
				"<TR>"+
				"<TD><span class='ui-icon ui-icon-refresh'></span></TD>"+
				"<TD>&nbsp;&nbsp;</TD>"+
				"<TD><B>Ververs</B></TD>"+
				"</TR>" +
				"<TR>"+
				"<TD></TD>" +
				"<TD></TD>" +
				"<TD>" +
				"Ververs de tabel. Dit is handig als u zich ervan wilt " +
				"verzekeren dat de getoonde inhoud echt up-to-date is (bijv. omdat iemand anders " +
				"tegelijkertijd aan dezelfde gegevens werkt)." +
				"<BR><BR></TD>"+
				"</TR>"+
				
				"<TR>"+
				"<TD><span class='ui-icon ui-icon-search'></span></TD>"+
				"<TD>&nbsp;&nbsp;</TD>"+
				"<TD><B>Zoeken en bewerken</B></TD>"+
				"</TR>" +
				"<TR>"+
				"<TD></TD>" +
				"<TD></TD>" +
				"<TD>" +
				"Deze functie maakt het mogelijk om een reeks tekens in meerdere rijen tegelijk te vervangen " +
				"door een andere reeks tekens.<BR>" +
				"Als u deze knop aanklikt, gaat er een nieuw venster open. " +
				"Daarin kunt u het woord(deel) opgeven dat moet worden bewerkt, " +
				"en door welk nieuw woord(deel) het vervangen moet worden." +
				"<BR><BR></TD>" +
				"</TR>"+
				
				"<TR>"+
				"<TD><span class='ui-icon ui-icon-circle-arrow-e'></span></TD>"+
				"<TD>&nbsp;&nbsp;</TD>"+
				"<TD><B>Ga naar</B></TD>"+
				"</TR>" +
				"<TR>"+
				"<TD></TD>" +
				"<TD></TD>" +
				"<TD>" +
				"Met deze functie kunt u in &eacute;&eacute;n klik een bepaald " +
				"punt in een tabel opzoeken. " +
				"Deze functie is anders dan gewoon zoeken, want er wordt " +
				"niets weggefilterd. Het is dus geen filterfunctie, maar een navigatiefunctie.<BR><BR>" +
				"Er bestaan twee werkwijzen:<BR>" +
				"[1] Tik een woord in een zoekvakje " +
				"boven een kolom en klik dan op de knop 'Ga naar': het eerste gedeelte van de tabel " +
				"waarin dit woord voorkomt wordt dan onmiddellijk opgezocht en getoond. " +
				"Om te zoeken waar in de tabel dit woord verder voorkomt, klik nog eens op 'Ga naar'.<BR>" +
				"[2] Druk bij het aanklikken van deze knop ook op 'shift'. Dan krijgt u de mogelijkheid " +
				"om een paginanummer of rijnummer in te vullen waar u naartoe wilt. " +
				"<BR><BR></TD>"+
				"</TR>"+
				
				"<TR>"+
				"<TD><span class='ui-icon ui-icon-pin-s'></span></TD>"+
				"<TD>&nbsp;&nbsp;</TD>"+
				"<TD><B>Rijselectie</B></TD>"+
				"</TR>" +
				"<TR>"+
				"<TD></TD>" +
				"<TD></TD>" +
				"<TD>" +
				"Klik op deze knop als u rijen wilt selecteren: " +
				"de functies die normaal gesproken bij het aanklikken van " +
				"cellen of rijen worden aangeroepen, worden dan tijdelijk uitgeschakeld, zodat die " +
				"het selecteren niet verstoren. " +
				"Klik nogmaals op deze knop om betreffende functies weer aan te zetten.<BR>" +
				"(Shortcut: F2)" +
				"<BR><BR></TD>"+
				"</TR>"+
				
				"<TR>"+
				"<TD><span class='ui-icon ui-icon-arrowreturnthick-1-w'></span></TD>"+
				"<TD>&nbsp;&nbsp;</TD>"+
				"<TD><B>Undo</B></TD>"+
				"</TR>" +
				"<TR>"+
				"<TD></TD>" +
				"<TD></TD>" +
				"<TD>" +
				"Met deze functie maakt u uw laatste bewerkingen ongedaan.<BR>"+
				"Let wel: dit kan zolang u op dezelfde pagina blijft. Zodra u naar een andere pagina gaat, " +
				"kunnen bewerkingen niet meer ongedaan worden gemaakt." +
				"<BR><BR></TD>"+
				"</TR>"+
				
				"<TR>"+
				"<TD><span class='ui-icon ui-icon-wrench'></span></TD>"+
				"<TD>&nbsp;&nbsp;</TD>"+
				"<TD><B>Kolommenselectie</B></TD>"+
				"</TR>" +
				"<TR>"+
				"<TD></TD>" +
				"<TD></TD>" +
				"<TD>" +
				"Met deze functie kiest u welke kolommen van een tabel u wilt zien en in welke volgorde.<BR>" +
				"Als u deze knop aanklikt, gaat er een nieuw venster open. " +
				"Aldaar kunt u ook gebruik maken van de knop 'Optimaal': hiermee wordt automatisch de best " +
				"mogelijke weergave berekend zodat de tabel overzichtelijker wordt." +
				"<BR><BR></TD>"+
				"</TR>"+
				
				"<TR>"+
				"<TD><span class='ui-icon ui-icon-image'></span></TD>"+
				"<TD>&nbsp;&nbsp;</TD>"+
				"<TD><B>Weergavemodus</B></TD>"+
				"</TR>" +
				"<TR>"+
				"<TD></TD>" +
				"<TD></TD>" +
				"<TD>" +
				"Toon de tabel als formulier, of als tabel. In het eerste geval wordt " +
				"slechts &eacute;&eacute;n rij getoond, maar de velden staan dan boven elkaar, net als op een " +
				"formulier." +
				"<BR><BR></TD>"+
				"</TR>"+
				"</TABLE>" +
				"</div>"+
				
				"<div id='tabs-2'>" +
				"<B>Normaal zoeken</B>" +
				"<BR><BR>" +
				"Om te zoeken naar een woord in een bepaalde kolom, gaat u naar het tekstvakje boven betreffende kolom, " +
				"tikt u daar het gezocht woord in, en drukt u vervolgens op 'Enter'. Dit kan ook met meerdere kolommen tegelijk." +
				"<BR><BR><BR>" +
				"<B>Geavanceerd zoeken</B>" +
				"<BR><BR>" +
				"U kunt heel krachtig en doelgericht zoeken door gebruik te maken van reguliere expressies. Deze bedienen zich van de volgende symbolen:" +
				"<BR><BR>" +
				"<TABLE>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD>Symbool</TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>Betekenis</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD></TD>" +				
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><CENTER><I>^</I></CENTER></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>begin van een woord</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><CENTER><I>$</I></CENTER></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>einde van een woord</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD></TD>" +				
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><CENTER><I>\\m</I></CENTER></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>begin van een woord middenin een woordgroep</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><CENTER><I>\\M</I></CENTER></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>einde van een woord middenin een woordgroep</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><CENTER><I>\\y</I></CENTER></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>grens (begin &oacute;f einde) van een woord middenin een woordgroep</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD></TD>" +				
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><CENTER><I>.</I></CENTER></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>een willekeurig teken</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><CENTER><I>\\w</I></CENTER></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>een willekeurige letter</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><CENTER><I>\\d</I></CENTER></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>een willekeurig cijfer</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><CENTER><I>\\s</I></CENTER></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>een spatie</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD></TD>" +				
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><CENTER><I>+</I></CENTER></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>&eacute;&eacute;n of meer keer het voorgaande (teken)</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><CENTER><I>*</I></CENTER></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>nul of meer keer het voorgaande (teken)</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><CENTER><I>?</I></CENTER></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>het voorafgaande teken is optioneel</TD>" +
				"</TR>" +
				"</TABLE>" +
				"<BR>" +
				"Hier volgen een paar voorbeelden:" +
				"<BR><BR>" +
				"<TABLE>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>^hoofd</I></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>zoek naar woorden die met '<I>hoofd</I>' beginnen</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>^hoofd.+</I></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>zoek naar woorden die met '<I>hoofd</I>' beginnen, " +
				"gevolgd door een willekeurige tekenreeks</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>hoofd$</I></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>zoek naar woorden die op '<I>hoofd</I>' eindigen</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>^hoofd$</I></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD> zoek exact naar '<I>hoofd</I>'</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>^hoofd\\y</I></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD> zoek exact naar '<I>hoofd</I>' als begin van een woordgroep, zoals in '<I>hoofd van de school</I>'</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>\\yvan\\y</I></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD> zoek exact naar '<I>van</I>' als onderdeel van een woordgroep, zoals in '<I>hoofd van de school</I>'</TD>" +
				"</TR>" +
				"</TABLE>" +
				"<BR>" +
				"Er kunnen ook combinaties van zoekopdrachten worden opgegeven, zoals: <I>zoek alle woorden met 'kop' of 'hoofd' in zich</I>. " +
				"De verschillende alternatieven moeten dan tussen '(' en ')' worden opgegeven, gescheiden door een '|'." +
				"<BR><BR>" +
				"<TABLE>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>(hoofd|kop)</I></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>zoek naar woorden met '<I>hoofd</I>' of '<I>kop</I>' in zich</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>^(hoofd|kop)$</I></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>zoek exact naar '<I>hoofd</I>' of '<I>kop</I>'</TD>" +
				"</TR>" +
				"</TABLE>" +
				"<BR>" +
				"Wanneer de verschillende alternatieven geen woorden, maar losse letters betreffen (bijv. <I>zoek naar 'hoofd' eindigend op 'd' of 't'</I>), dan kunnen " +
				"de verschillende alternatieven tussen '[' en ']' en zonder scheiding worden opgegeven. " +
				"Geheel equivalent zijn:" +
				"<BR><BR>" +
				"<TABLE>" +				
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>hoof(d|t)</I></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>zoek naar '<I>hoofd</I>' of '<I>hooft</I>'</TD>"+
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>hoof[dt]</I></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>zoek naar '<I>hoofd</I>' of '<I>hooft</I>'</TD>"+
				"</TR>" +
				"</TABLE>" +
				"<BR>" +
				"Andere voorbeelden:"+
				"<BR><BR>" +
				"<TABLE>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>mooie?$</I></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>zoek naar '<I>mooi</I>' of '<I>mooie</I>'. 'e?' betekent dus 'e' of niets.</TD>"+
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD></TD>" +				
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>mooi.$</I></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>zoek naar '<I>mooi</I>' gevolgd door &eacute;&eacute;n willekeurig teken (waarachter het woord eindigt)</TD>"+
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>mooi\\w$</I></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>zoek naar '<I>mooi</I>' gevolgd door &eacute;&eacute;n letter</TD>"+
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>mooi\\w{2}$</I></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>zoek naar '<I>mooi</I>' gevolgd door twee letters</TD>"+
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>mooi\\w{2,4}$</I></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>zoek naar '<I>mooi</I>' gevolgd door twee tot vier letters</TD>"+
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD></TD>" +				
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>mooi\\w*</I></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>zoek naar '<I>mooi</I>' gevolgd door nul of meer letters</TD>"+
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>mooi\\w+</I></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>zoek naar '<I>mooi</I>' gevolgd door &eacute;&eacute;n of meer letters</TD>"+
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD></TD>" +				
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>\\s</I></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>zoek naar een spatie (dit levert woordgroepen op, aangezien woorden door spaties gescheiden zijn)</TD>"+
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD></TD>" +	
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>\\d+</I></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>zoek naar een nummer bestaand uit &eacute;&eacute;n of meer cijfers</TD>"+
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>\\d{4}</I></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD>zoek naar een nummer bestaand uit 4 cijfers</TD>"+
				"</TR>" +
				"</TABLE>" +
				"<BR>" +
				"Zoals hierboven bleek, hebben bepaalde tekens een betekenis, zoals '(', ')', '|', of '.'<BR>" +
				"Om toch te kunnen zoeken naar woorden waar zulke tekens in staan, moet u deze laten voorafgaan " +
				"door een backslash (\\):"+
				"<BR><BR>" +
				"<TABLE>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>panne\\(n\\)koek</I></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD> zoek naar 'panne(n)koek'</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>N\\.B\\.</I></TD>" +
				"<TD>&nbsp;&nbsp;</TD><TD> zoek naar 'N.B.'</TD>" +
				"</TR>" +
				"</TABLE>" +				
				"<BR><BR><BR>" +
				"<B>Exact zoeken</B>" +
				"<BR><BR>" +
				"U kunt exact zoeken door aanhalingstekens te gebruiken. Voorbeelden:" +
				"<BR><BR>" +
				"Zoeken gebeurt normaal gesproken <I>case <U>in</U>sensitive</I>. "+
				"Als u echter aanhalingstekens om het gezochte woord heen zet, zoekt u <I>case sensitive</I>:" +
				"<BR><BR>" +
				"<TABLE>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>Af</I></TD>" +			
				"<TD>&nbsp;&nbsp;</TD><TD> zoek naar woorden die 'af' of 'Af' bevatten.</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>\"Af\"</I></TD>" +			
				"<TD>&nbsp;&nbsp;</TD><TD> zoek alleen naar woorden die 'Af' bevatten met een hoofdletter 'A'.</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>\"^Af\"</I></TD>" +			
				"<TD>&nbsp;&nbsp;</TD><TD> zoek alleen naar woorden die met 'Af' beginnen met een hoofdletter 'A'.</TD>" +
				"</TR>" +
				"</TABLE>" +
				"<BR>" +
				"Aanhalingstekens kunnen ook op andere manieren ingezet worden. Als u bijvoorbeeld zoekt naar " +
				"uitdrukkingen met het woord 'van', kunt u zoeken naar \" van \", d.w.z. 'van' met spaties eromheen. " +
				"Op die manier dwingt u af dat 'van' middenin een reeks woorden staat:" +
				"<BR><BR>" +
				"<TABLE>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>van</I></TD>" +			
				"<TD>&nbsp;&nbsp;</TD><TD> vindt bijv. 'caravan', 'vandalisme', 'rad van fortuin'.</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>\" van \"</I></TD>" +			
				"<TD>&nbsp;&nbsp;</TD><TD> vindt alleen 'rad van fortuin'.</TD>" +
				"</TR>" +
				"</TABLE>" +	
				"<BR>" +
				"Als u aangeeft dat u exact een bepaald woord zoekt, zonder iets ervoor of erna, kan dat het zoeken behoorlijk versnellen. " +
				"Gebruik daartoe deze schrijfwijze: " +				
				"<BR><BR>" +
				"<TABLE>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>exact:lopen</I></TD>" +			
				"<TD>&nbsp;&nbsp;</TD><TD> vindt exact het woord 'lopen'.</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>//lopen</I></TD>" +			
				"<TD>&nbsp;&nbsp;</TD><TD> idem.</TD>" +
				"</TR>" +
				"</TABLE>" +				
				"<BR><BR><BR>" +
				"<B>Zoeken met operatoren</B>" +
				"<BR><BR>" +
				"Normaal zoekt Lex'it met een operator voor gelijkheid, maar het is ook mogelijk om " +
				"met een operator voor ongelijkheid te zoeken, of zelfs met relationele operatoren (groter/kleiner dan). " +
				"Hiertoe moet de betreffende operator expliciet worden opgegeven aan het begin van de zoekstring.<BR>" +
				"Een paar voorbeelden:" +
				"<BR><BR>" +
				"<TABLE>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>\<^E</I></TD>" +			
				"<TD>&nbsp;&nbsp;</TD><TD> zoek naar woorden die met A, B, C of D beginnen (een letter vóór de letter E)</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I></I></TD>" +			
				"<TD>&nbsp;&nbsp;</TD><TD> <B>NB</B>: om te zoeken tussen twee letters, voldoet het om een reguliere expressie te gebruiken:<BR>" +
				"<I>^[A-D]</I> zoekt naar alle woorden die met A, B, C of D beginnen</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>\>=20</I></TD>" +			
				"<TD>&nbsp;&nbsp;</TD><TD> zoek naar getallen groter dan of gelijk aan 20</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>!lopen</I></TD>" +			
				"<TD>&nbsp;&nbsp;</TD><TD> zoek naar woorden die de vorm 'lopen' NIET bevatten</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>!(ing|heid)$</I></TD>" +			
				"<TD>&nbsp;&nbsp;</TD><TD> zoek naar woorden die NIET op '-ing' of '-heid' eindigen</TD>" +
				"</TR>" +
				"</TABLE>" +				
				"<BR><BR><BR>" +
				"<B>Nog een paar trucjes</B>" +
				"<BR><BR>" +
				"Met behulp van bovengenoemde symbolen is nog meer mogelijk. Een paar voorbeelden:" +
				"<BR><BR>" +
				"<TABLE>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>^$</I></TD>" +			
				"<TD>&nbsp;&nbsp;</TD><TD> zoek naar lege cellen</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>.</I></TD>" +			
				"<TD>&nbsp;&nbsp;</TD><TD> zoek een willekeurig karakter: dit is een manier om te kijken of een kolom minstens &eacute;&eacute;n gevulde cel heeft.</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>&nbsp;&nbsp;</TD><TD><I>NULL</I></TD>" +			
				"<TD>&nbsp;&nbsp;</TD><TD> zoek naar cellen die een NULL-waarde bevatten</TD>" +
				"</TR>" +
				"</TABLE>" +				
				"<BR><BR><BR>" +
				"<B>Query-builder / Selectiehulp</B>" +
				"<BR><BR>" +
				"Zoekvragen kunnen deels automatisch worden samengesteld d.m.v. een tooltje. " +
				"Om dit tooltje te openen, houdt u bij het aanklikken van een zoekveld de CTRL-toets ingedrukt. " +
				"Het tooltje toont de meest frequente waardes uit betreffende kolom, zodat een keuze daaruit kan worden gemaakt: Lex'it formuleert " +
				"dan een zoekopdracht om op de gekozen waardes te zoeken. Ook is het mogelijk om een negatieve selectie te maken, d.w.z. alles " +
				"behalve de gekozen waardes." +
				"</div>" +
				"<div id='tabs-5'>" +
				"<B>Sorteren op &eacute;&eacute;n kolom</B><BR>"+
				"<BR>"+
				"Om een tabel op een bepaalde kolom te sorteren, klik op de naam van de betreffende kolom.<BR>" +
				"Het pijltje naast de kolomnaam geeft dan aan hoe er wordt gesorteerd:<BR>" +				
				"<UL>"+
				"<LI>oplopend (pijltje omhoog)</LI>" +
				"<LI>aflopend (pijltje omlaag)</LI>" +
				"</UL>"+
				"Om de sorteerrichting te wijzigen, moet u nogmaals op de kolomnaam klikken.<BR>" +
				"<BR>" +
				"<BR>" +
				"<B>Sorteren opheffen</B><BR>"+
				"<BR>" +
				"Als u het sorteren op een kolom wilt opheffen, moet u de SHIFT-toets ingedrukt houden. <BR>" +
				"Door herhaaldelijk op de kolomnaam te klikken, gaat u dan door drie standen heen, totdat de " +
				"sortering opgeheven wordt:<BR>" +				
				"<UL>"+
				"<LI>oplopend sorteren</LI>" +
				"<LI>aflopend sorteren</LI>" +
				"<LI>neutraal (= niet sorteren)</LI>" +
				"</UL>"+				
				"<BR>"+
				"<B>Sorteren op meerdere kolommen tegelijk</B><BR>"+
				"<BR>"+
				"Het is ook mogelijk om op verschillende kolommen tegelijkertijd te sorteren. Daartoe moet u " +
				"bij het aanklikken van de kolommen waarop gesorteerd moet worden, ook de SHIFT-toets ingedrukt " +
				"houden.<BR>" +
				"Zo geeft u aan dat de andere sorteerkolommen behouden moeten worden: zonder SHIFT " +
				"zouden de andere sorteerkolommen namelijk vervallen.<BR>"+
				"<BR><BR>"+
				"</div>" +
				
				"<div id='tabs-3'>" +
				"<B>Tabel bewerken</B>"+
				"<BR><BR>"+
				"Om de inhoud van een tabel te bewerken, klik op de te bewerken cel.<BR>" +
				"Afhankelijk van de type cel verandert deze dan in een tekstvak, een checkbox " +
				"of een dropdown. U kunt dan een stuk tekst intikken, " +
				"de checkbox aanvinken, enz. enz.<BR>" +
				"<BR>"+
				"LET WEL: als u een stuk tekst hebt ingetikt, moet u uw invoer bevestigen door op 'Enter' te drukken. " +
				"Als u niet op 'Enter' drukt en met de muis buiten de cel klikt, wordt uw bewerking geannuleerd.<BR>"+
				"<BR><BR>"+
				"</div>" +
				
				"<div id='tabs-4'>" +
				"<B>Sneltoetsen</B>"+
				"<BR><BR>"+
				"<TABLE>" +
				"<TR>" +
				"<TD>Pijl omhoog/omlaag</TD><TD>&nbsp;&nbsp;</TD><TD>Ga een rij omhoog/omlaag in de tabel.</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>Page up/down</TD><TD>&nbsp;&nbsp;</TD><TD>Ga naar de vorige/volgende pagina.</TD>" +
				"</TR>" +
				"<TR>" +
				"<TD>CTRL + pijl naar links/rechts</TD><TD>&nbsp;&nbsp;</TD><TD>Scroll naar links of naar rechts</TD>" +				
				"</TR>" +
				"<TR>" +
				"<TD>ESC</TD><TD>&nbsp;&nbsp;</TD><TD>Afhankelijk van de context: selectie ongedaan maken, venster sluiten, enz.</TD>" +				
				"</TR>" +
				"<TR>" +
				"<TD>Tab</TD><TD>&nbsp;&nbsp;</TD><TD>Switch tussen de tabellen: geef de eerst volgende tabel focus.</TD>" +				
				"</TR>" +
				"<TR>" +
				"<TD>F5</TD><TD>&nbsp;&nbsp;</TD><TD>Ververs de actieve tabel.</TD>" +	
				"<TR>" +
				"<TD>Pause/Break</TD><TD>&nbsp;&nbsp;</TD><TD>Ververs de actieve tabel en vraag exacte telling op (trager).</TD>" +	
				"</TR>" +
				"<TR>" +
				"<TD>F8</TD><TD>&nbsp;&nbsp;</TD><TD>Toon of verberg de tooltips in de tabellen.</TD>" +				
				"</TR>" +
				"</TABLE>" +
				"</div>" +
				
				"<div id='tabs-info'>" +
				"<BR><BR>"+
				"<TABLE>"+
				"<TR>"+
				"<TD></TD>"+
				"<TD><H1>Lex'it</H1></TD>"+
				"</TR>"+
				"<TR>"+
				"<TD></TD>"+
				"<TD><B>Lex</B><I>icon</I> <B>I</B><I>nteractive</I> <B>T</B><I>ool</I></TD>"+
				"</TR>"+
				"<TR><TD></TD><TD>&nbsp;</TD></TR>"+
				"<TR>"+
				"<TD>&copy;</TD>"+
				"<TD>"+
				"<img src='"+BASE_URL+"/images/INT-logo.png' height='60px' width='136px'>"+
				"</TD>"+
				"</TR>"+				
				"<TR>"+
				"<TD></TD>"+
				"<TD></TD>"+
				"</TR>"+
				"<TR><TD></TD><TD>&nbsp;</TD></TR>"+
				"<TR>"+
				"<TD></TD>"+
				"<TD>"+
				"www.ivdnt.org"+
				"</TD>"+
				"</TR>"+
				"</TABLE>"+
				"</div>"
				;
			
			
			helpDiv.append(helpText);			
			$(document.body).append(helpDiv);
			
			$("#"+helpDivId).dialog({
				open: function( event, ui ){
					$(".ui-dialog").addClass("ui-dialog-shadow");
		        	$( this ).closest(".ui-dialog").putInFront();
		        },
		        close: function(event, ui){
		        	$( this ).remove();
		        },
				width: 800, 
				height: 600
				}
			);
			
			$("#"+helpDivId).tabs();
			
		});
	
	$("#"+sSomeTablename+"_filter").append(
			$("<div></div>").attr("id", sSomeTablename+"_helpbutton").css("display", "inline").append(helpButton)
			);
	
};



// put table-close button

head.putTableCloseButton = function(sSomeTablename){
	
	var tableCloseButton = $("<button/>")
		.attr("type", "button")
		.css("background-color", "#DF3A01")		
		.css("font-weight", "bold")
		.css("font-size", "7pt")
		.css("margin-right", "10px")
		.append($("<span></span>").addClass("ui-icon ui-icon-closethick"))
		.bind("click", function(){
			
			// callback upon close, if set in the configuration
			var aTableSettings = conf.getTableSettings(sSomeTablename);
			var fnCallback = conf.getCloseCallback(aTableSettings);
			if ( fnCallback != null )
				{
				fnCallback(mt.getDataTableObjectOf(sSomeTablename));
				}
			
			// remove table
			$("#"+sSomeTablename+"_wrapper").hide("slow");
			tb.destroyTable(sSomeTablename, null, true);
		});
	
	$("#"+sSomeTablename+"_table_name").prepend(
			$("<div></div>").attr("id", sSomeTablename+"_tableclosebutton").css("display", "inline").append(tableCloseButton)
			);
	
};



