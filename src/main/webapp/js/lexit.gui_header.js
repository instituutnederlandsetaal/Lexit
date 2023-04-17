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
					
		var iRowToSetActive = ( nActiveRow != null ? fn.getRowNodeNumberOnScreen(nActiveRow) : 0 );			
		
		kf.setActiveTable( sSomeTableName );
		kf.setActiveRowNumber( iRowToSetActive );
		
		// put table in front
		$("#"+sSomeTableName+"_dynamic").putInFront();
		
			
			
		// BEWARE: we only select a row if none is selected yet.
		// We do so to prevent a given rows selection from getting corrupted (as some new row 
		// would be unpredictably added to the selection than)
		if (fn.getNumberOfSelectedRowNodes(sSomeTableName) == 0 && iRowToSetActive>-1)
			fn.selectRowNode(sSomeTableName, iRowToSetActive);
				
	});
	
	
	
	// make table draggable when the mouse pointer is in the header
	var bDraggingNow = false; 
	$("#"+sSomeTableName+"_wrapper div.top").mouseenter(function(){
		
		if ( conf.getTableDraggable(conf.getTableSettings(sSomeTableName)) 
			&& !$("#"+sSomeTableName+"_dynamic").hasClass("draggable") )
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
				    			.css("z-index", getHighestZindex()+1 ) // always in front
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
				        for (var i=0; i<aAllTables.length; i++){
				        	fn.refreshTable(aAllTables[i]);				        	
				        }
				    }
				});
			}
	});
	
	$("#"+sSomeTableName+"_wrapper div.top").mouseleave(function(){
		// if table is draggable, but the user is not dragging at the moment,
		// and we are leaving the header, make the table NOT draggable
		if ( conf.getTableDraggable(conf.getTableSettings(sSomeTableName)) 
				&& $("#"+sSomeTableName+"_dynamic").hasClass("draggable")
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
	if (iNumberOfButtons>0 && iNewHeight == conf._defaultHeight()) {
		iNewHeight = 80;
	}
	
	$("#"+sSomeTableName+"_wrapper").find("div.top").css("min-height", iNewHeight);		
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
	if (sHeaderColor != null) {
		$("div#"+sSomeTablename+"_dynamic").find("div#"+sSomeTablename+"_wrapper").find("div.top").css("background-color", sHeaderColor);
	}
	
	var tableName = $("<span></span>")
		.text(sNameToShow+":")
		.css("font-weight", "bold")
		.css("color", "#A4A4A4")
		.attr("id", sSomeTablename+"_tablename")
		.attr("title", ( (document.URL).regexIndexOf( INL_HOMEURL )>-1 ) ? lang.click_to_add_a_note:"" )
		.addClass( ( (document.URL).regexIndexOf( INL_HOMEURL )>-1 ) ? "tooltip":"" )
		.click(function(){
			
			// clicking on the table name gives the possibility to
			// add notes or comments to a table

			// keep this list private to internal environment
			if ( (document.URL).regexIndexOf( INL_HOMEURL )>-1 ) {
				
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

						 var oTableComments = head._parseTableNotes( fn.getDbResponse(xml) ) ;
						 
						 var sCreated = oTableComments["created"];
						 var sFinished = oTableComments["finished"];
						 var sProcessed = oTableComments["processed"];
						 var sNotes = oTableComments["notes"];
				 		
						 fn.prompt(lang.table_notes, 
							 [lang.job_started_on, lang.job_finished_on, lang.job_processed_on, lang.job_notes], 
							 [sCreated+":::datepicker", sFinished+":::datepicker", sProcessed+":::datepicker", sNotes+":::textarea"], 
				 				
				 			function(noteResp){
							
								var sCreated = noteResp[ lang.job_started_on ];
								var sFinished = noteResp[ lang.job_finished_on ];
								var sProcessed = noteResp[ lang.job_processed_on ];
								var sNotes = noteResp[ lang.job_notes ];

				 				var sNewTableComment = [sCreated, sFinished, sProcessed, sNotes].join("|||||");
							
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
								 		fn.message( lang.succeeded+"!", lang.note_was_added);
								 		
								 		// update table details
								 		var aTableDetails = mt.getAvailableTableDetails(sSomeTablename);
								 		aTableDetails = [aTableDetails[0], aTableDetails[1], sNewTableComment];
								 		mt.addAvailableTableDetails(sSomeTablename, aTableDetails);
	
								 		},
									"error": function(jqXHR, textStatus, errorThrown){
										fn.refreshTable(sSomeTablename);
										fn.message(lang.error_at_saving_note, lang.some_error_has_occurred+ ": "+textStatus+" "+errorThrown);
										}
								} );
				 			},
				 			function(){
				 				
				 				fn.message(lang.cancelled, lang.no_note_was_saved);
				 			});
				 		
				 		},
					"error": function(jqXHR, textStatus, errorThrown){
						fn.message(lang.error_at_reading_note, lang.some_error_has_occurred+ ": "+textStatus+" "+errorThrown);
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

// subroutines of head.showNameOfTheTable()
//
// create a table comment containing created/finished/processed + notes
head._packinTableNotes = function(sCreated, sFinished, sProcessed, sNotes){
	return [sCreated, sFinished, sProcessed, sNotes].join("|||||");;
};
// parse the table comment containing created/finished/processed + notes
head._parseTableNotes = function(sNotes){

	// split the table comment into its parts (with our own separator)
	var aNotes = sNotes.split("|||||");

	// backwards compatibility: single note will be put a 4th position, as 1 to 3 as reserved for created/finished/processed
	if (aNotes.length == 1){
		aNotes = ["", "", "", aNotes[0]];
	};

	// if we can't make sense of the table comment response, create an empty one
	if (aNotes.length !=1 && aNotes.length != 4){
		aNotes = ["", "", "", ""];
	};

	return {
		"created": aNotes[0],
		"finished": aNotes[1],
		"processed": aNotes[2],
		"notes": aNotes[3]
	};
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

	// put table in front
	$("#"+sSomeTableName+"_info").putInFront();
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
		var sSelectedItem = 	conf.getHeaderButtonMenuSelected(aButtonSettings);
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
			
			// append all the options
			for (sOneOption in aButtonMenu)
			{
				if (sSelectedItem == sOneOption)	// option to be selected by default
					customButton.append(
						$("<option></option>")							
							.attr("value", sOneOption )
							.text( sOneOption )
							.prop('selected', true)			
					);
				else
					customButton.append(			// other options
							$("<option></option>")							
								.attr("value", sOneOption )
								.text( sOneOption )
						);
			}
			// button behaviour
			customButton.bind("change", function(){
				
				var aButtonSettings = conf.getHeaderButtonSettings(aTableSettings, $(this).attr("name"));
				var sChosenOption = $(this).val();
				
				var aButtonMenu = conf.getHeaderButtonMenu(aButtonSettings);
				// bind callback to be called for this particular option
				aButtonMenu[sChosenOption](mt.getDataTableObjectOf(sSomeTableName));
				$(this).blur();				
				
			});
		}
		
		
		// append div for button
		$("#"+sSomeTableName+"_filter").append(
			$("<div></div>").attr("id", sSomeTableName+"_custombutton_"+i).css("display", "inline")
			);
		
		// add tooltip
		if (sToolTip != null)
			customButton.attr("title", sToolTip).addClass("tooltip");
		
		// add label (for select buttons) 
		if (aButtonMenu != null)
			$("#"+sSomeTableName+"_custombutton_"+i).append("<label></label>").attr("for", i).text(sButtonName)  // give label/button its number as name attribute
			
		// add button (had its own label)
		$("#"+sSomeTableName+"_custombutton_"+i).append(customButton);
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
		.css("background-color", "#F5BCA9")
		.append($("<span></span>").addClass("ui-icon ui-icon-home"))
		.attr("title", lang.reset_button).addClass("tooltip")
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
					
					// finally set the form searchbox too (if needed)
					form.resetSearchFields(sSomeTablename);
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
		.attr("title", lang.columns_selection).addClass("tooltip")
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
				lang.columns_selection_optimal_mode : 
				lang.columns_selection);
};





head.putViewTypeButton = function(sSomeTablename){
	
	// is this button allowed according to configuration?
	var aTableSettings = conf.getTableSettings(sSomeTablename);
	if ( !conf.getViewTypeButton(aTableSettings)) return true;
			
	var viewtypeButton = $("<button/>")
		.attr("type", "button")
		.css("background-color", "#F4FA58")
		.append($("<span></span>").addClass("ui-icon ui-icon-image"))
		.attr("title", lang.view_type_button).addClass("tooltip")
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
				$("#"+sSomeTablename+"_wrapper div."+sSomeTablename+"_cell_label").remove();
				$("#"+sSomeTablename+"_wrapper div."+sSomeTablename+"_cell_value").remove();
				
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
		.attr("title", lang.refresh_button).addClass("tooltip")
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
			
			if (kf._getPressedKey() == 'shift')
				{
				fn.restoreTableState(sSomeTablename);
				}
			else
				{
				fn.confirm(lang.beware, lang.undo_are_you_sure+"?", function(){
					
					// clear highlighted rows
					row.clearRowSelection(sSomeTablename);
					// undo last change
					un.undoEvent(sSomeTablename);
				});
				}			
			
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
		.attr("title", lang.goto_button).addClass("tooltip")
		.addClass("header_button")
		.bind("click", function(){
			
			// special case: shift was pressed
			if (kf._getPressedKey() == 'shift')
				{
				fn.prompt([lang.goto, lang.goto_enter], [lang.goto_rownumber, lang.goto_pagenumber], ["", ""], 
						function(gotoResp){
					
							var sRowNumber = gotoResp[ lang.goto_rownumber ];
							var sPageNumber = gotoResp[ lang.goto_pagenumber ];
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
								fn.message(lang.beware +"!", 
									lang.goto_you_must_enter_a_number +" ["+err.message+"]");
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
		.attr("title", lang.header_search_and_replace_button).addClass("tooltip")
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
	var sButtonMsg = bRowSelectionAllowed ? lang.turn_row_selection_off : lang.turn_row_selection_on;
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
			.attr("title", lang.turn_row_selection_off).addClass("tooltip");
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
			.attr("title", lang.turn_row_selection_on).addClass("tooltip");
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
		.attr("title", lang.help_button).addClass("tooltip")
		.addClass("header_button")
		.bind("click", function(){
			
			
			// we'll be combining jquerui tabs and dialog
			// see: http://stackoverflow.com/questions/15472048/jquery-ui-tabs-and-dialog
			
			var helpDivId = "dialog"+getUniqueNumber();
			
			var helpDiv = $("<div></div>")
				.attr("id", helpDivId)
				.attr("title", lang.help_button)
				.css("font-size", "12px");			
			
			helpDiv.append(lang.helpText);			
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



