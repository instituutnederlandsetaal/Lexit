/**
 * The lists namespace contains functions to build tables as part of a form.
 * 
 * A list is filled with the content of a table matching some values.
 * 
 * @namespace
 */
var lists = {};


// ----------------------------------------------
//
// API at the botton of this file !!!
//
// ----------------------------------------------



// -----------------------------------------------
// 			IMPORTANT 
//
// for the moment, it is not possible to give 
// different lists belonging to different tables
// the same label: that would cause impredictable
// results
//
// Needs to be solved in the future
//
// -----------------------------------------------






// ------------------------------------------
// 					CACHE
// ------------------------------------------

// Cache of the lists.getDataTableObjectOf() function
// This contains DataTable objects of the form's lists
hFormAndList2DataTable = new Hashtable();

// Cache of the lists.getAllColumns() function 
// This contains the columns of the form's lists, their nice_names, their types, and their custom values (enum) if available
hListTable2Cols = new Hashtable();
hListTable2NiceCols = new Hashtable();
hListTable2ColTypes = new Hashtable();
hListTable2CustomVals = new Hashtable();

// from [form list label] To [form ID] 
hFormListLabel2formId = new Hashtable();

// from [form list label] To [feeding table]
hFormListLabel2tableName = new Hashtable();

// from [form list label] To [list height]
hFormListLabel2DisplayHeight = new Hashtable();

// from [form list label] To [list sort settings]
hFormListLabel2SortSettings = new Hashtable();

// from [form list label] To [list order settings]
hFormListLabel2OrderSettings = new Hashtable();





// Remember which form is the parent of a list etc
lists.register = function(sFormListLabel, sFormContainerId, sTableToFeedListWith, sDisplayHeight, oSortSettings, aOrderSettings){
		
	hFormListLabel2formId.put( sFormListLabel, sFormContainerId );
	hFormListLabel2tableName.put( sFormListLabel, sTableToFeedListWith );
	hFormListLabel2DisplayHeight.put( sFormListLabel, sDisplayHeight );
	hFormListLabel2SortSettings.put( sFormListLabel, oSortSettings );	
	hFormListLabel2OrderSettings.put( sFormListLabel, aOrderSettings );
};


// -----------------------------------------------------------------------------------



// build a list as an HTML table
//
lists.buildLists = function(sFormTable, iListNr){

	if (iListNr == null) iListNr = 0;

	var aAllLists = lists.getListOfListLabels(sFormTable);

	// if the form has no lists, leave straight away
	if (aAllLists.length == 0)
		return;
	
	// one list label at the time
	var sFormListLabel = 	aAllLists[iListNr];

	var oTableSettings =    conf.getTableSettings(sFormTable);
	var oFormGrid =         conf.getFormGrid(oTableSettings);
	var oLists = 			oFormGrid["lists"];
	var oThisList = 		oLists[sFormListLabel];
	var oButtons = 			oThisList["buttons"];

	var aColumnsToDisplay =	lists.getColumnsToDisplay(oLists, sFormListLabel);
	var aColumnsToInAddForm =lists.getColumnsToDisplayInAddForm(oLists, sFormListLabel);
	var sTableNameOfList =	lists.getFeedingTable(sFormListLabel);	
	var sDisplayHeight = 	lists.getDisplayHeight(sFormListLabel);
	var oSortSettings =		lists.getSortSettings(sFormListLabel);
	var aOrderSettings =	lists.getColumnOrder(sFormListLabel);	



	lists.getAllColumns(sTableNameOfList, function(aAllColumns){
		
		// compute the nice names of the columns
		// and store them in cache
		lists._computeListsNiceNames(oFormGrid, sFormListLabel);
		

		// get visible columns indexes for DataTable settings

		var aIndexesOfVisibleColumns = new Array();
		for (var i=0; i<aColumnsToDisplay.length; i++){
			
			var iColIndex = $.inArray(aColumnsToDisplay[i], aAllColumns);
			aIndexesOfVisibleColumns.push(iColIndex);
		}
		

		// build the table HTML

		var sFormContainerId =	sFormTable +"_form";
		var sFormAndList = 		lists.buildTableId(sFormContainerId, sFormListLabel);
		var eTable = $("<table></table>")
			.attr("id", sFormAndList)
			.addClass("display");

		// THEAD
		var eThead = $("<thead></thead>");
		var eTheadTr = $("<tr></tr>");		
		for (var i=0; i<aAllColumns.length; i++){	
			eTheadTr.append(
				$("<th></th>").text(aAllColumns[i])
			);
		}

		// TBODY
		var eTbody = $("<tbody></tbody>");
		var eTbodyTr = $("<tr></tr>");
		for (var i=0; i<aAllColumns.length; i++){	
			eTbodyTr.append(
				$("<td></td>")
			);
		}
		

		// if row buttons are set in the config, 
		// add column for these
		if (oButtons != null) {

			// build the button if needed
			var eElem = lists.addButtonToListHeader(oButtons, aColumnsToInAddForm);

			// add the buttons column
			eTheadTr.append(
				$("<th></th>").append(eElem) 
			);
			eTbodyTr.append(
				$("<td></td>") 
			);

			// add buttons column to list of visible columns
			aIndexesOfVisibleColumns.push(aAllColumns.length);
		}
		

		// assemble all parts of the table

		eThead.append(eTheadTr);
		eTbody.append(eTbodyTr);
		eTable.append(eThead);
		eTable.append(eTbody);

		// append the table to some container
		// (a div in a formgrid)
		$("#"+lists.buildTableContainerId(sFormContainerId, sFormListLabel))			
			.append(eTable);

		// instantiate a Datatable
		//     WITHOUT header, searching, page length changing, 
		// but WITH sorting and paging
		// (example https://datatables.net/examples/basic_init/filter_only.html)
		// 

		var aColumnDefs = [
			{ targets: aIndexesOfVisibleColumns, visible: true },
			{ targets: '_all', visible: false }				   
		];

		// if row buttons are set in the config, add column config for these 
		if (oButtons != null) {
			aColumnDefs.push({ targets: [aAllColumns.length], width: "30px", sortable: false});
		}

		// add other settings
		for (var i=0; i<aColumnsToDisplay.length; i++){

			var iWidth = lists.getColumnsWidth(oLists, sFormListLabel, aColumnsToDisplay[i]);
			if (iWidth != null){
				var iColIndex = $.inArray(aColumnsToDisplay[i], aAllColumns);
				aColumnDefs.push({ targets: [iColIndex], width: iWidth});
			}
		}

		

		var oDataTablesConfig = {
			info: false,
			searching: false,
			scrollY: (parseInt(sDisplayHeight) - 30)+"px",
			scrollCollapse: true,
			paging: false,
			order: lists.getDataTableOrder(aAllColumns, oSortSettings),
			autoWidth: false, 
			columnDefs: aColumnDefs,
			language: {
				"thousands": ".",
				"search": lang.header_main_search,
				"infoEmpty": lang.header_info_empty,
				"emptyTable": "", // we don't want to show 'No results or so', but just an empty table
				"info": lang.header_x_rows_found,
				"zeroRecords": "", // we don't want to show 'No results or so', but just an empty table
				"infoFiltered": lang.header_info_filtered,
				"paginate": {
					"first": lang.paginate_first,
					"previous": lang.paginate_previous,
					"next": lang.paginate_next,
					"last": lang.paginate_last
				},
				"loadingRecords": lang.loading_records,
				"processing": "" // no processing message, we have a spinner
			},
			drawCallback: function( settings ) {
				
				// get list config
				var oListConfig = lists.getConfig(this);
				var sFormListLabel = lists.getLabelFromNode(this);
				var sFeedingTable = lists.getFeedingTable(sFormListLabel);
				
				var oTable = $(this).DataTable();
				var aVisibleColumnNames = lists.getVisibleColumns(sFormListLabel);
				
				// get columns config 
				var oColumnsConfig = oListConfig["table"]["columns"];
				
				// if the table columns info is not yet available, allow some time for it to be filled in cache
				// (it is filled asynchronously when the list is built), before trying to apply render functions and so on
				
				var iWait = (hListTable2Cols.get(sFeedingTable) != null) ? 0 : 1000;
				setTimeout(function(){
					
					oTable.rows().every(function(iRowIndex){
						
						var oCurrentRow = this;
						for (var iColNr= 0; iColNr<aVisibleColumnNames.length; iColNr++){
							
							var sColName = aVisibleColumnNames[iColNr];
							var oCellConfig = oColumnsConfig[sColName];
							
							if (oCellConfig != null) {
								
								var fnRender = oCellConfig["render"];
								if (fnRender != null){
									var sCellValue = lists.getDataFromCell(sFormListLabel, iRowIndex, sColName)
									var sFormattedValue = fnRender(sCellValue, oCurrentRow.node());
									// update cell value with formatted value
									if (lexutil.hasTags(sFormattedValue)) {
										$("td:eq("+iColNr+")", oCurrentRow.node()).html(sFormattedValue);
									}
									else {
										$("td:eq("+iColNr+")", oCurrentRow.node()).text(sFormattedValue);
									}
								}
							}
								
						}
						
					});
					
				}, iWait);
				
				
				// is there a callback to call?
				// NB: the callback can be set at list level or at table level
				var fnCallback = oListConfig["callback"];
				if (fnCallback == null) {
					fnCallback = oListConfig["table"]["callback"];
				}
				// if a callback is indeed found, call it
				if (fnCallback != null) {
					fnCallback( oListConfig["table"]["name"] );
				}
			}
		};
		

		var oTable = $("#"+sFormAndList).DataTable( oDataTablesConfig );
		// save DataTable object in cache
		hFormAndList2DataTable.put(sFormAndList, oTable);
		
		
		// set nice names for the columns
		oTable.columns().every(function(index) {			
			var $thisHeader = $(this.header());
			var sCurrentColumnName = $thisHeader.text();
			
			if (oThisList["table"]["columns"][sCurrentColumnName] != null) {
				var sNiceName = oThisList["table"]["columns"][sCurrentColumnName]["nice_name"];				
				if (sNiceName != null){
					$thisHeader.text(sNiceName);
				}
			}			
	    });
		

		// build following list
		if (iListNr+1 < aAllLists.length){
			lists.buildLists(sFormTable, iListNr+1);
		}

	}, aOrderSettings);
	
};


/**
 * Refresh a list, given its label.
 * By default a hard refresh is done (t.i. force reloading of data from the database), 
 * but a soft refresh can be requested [t.i. just redraw the list with the data in memory].
 * @param {String} the label of the list to refresh
 * @param {Function} a callback function to call after the list has been refreshed
 * @param {Boolean} [bHardRefresh=true] a flag to force a hard refresh (true) or a soft refresh (false)
 * @see form.refresh
 */
lists.refresh = function(sListLabel, fnCallback, bHardRefresh){
	
	bHardRefresh = (bHardRefresh == null ? true : bHardRefresh);
	
	if (bHardRefresh){
		
		var sFormContainerId = 	lists.getFormContainerId(sListLabel);
		var sFormTable = 		form.getFeedingTable(sFormContainerId);
		
		var oTableSettings =    conf.getTableSettings(sFormTable);
		var oFormGrid =         conf.getFormGrid(oTableSettings);
		var oCells = 			oFormGrid["cells"];
		var oThisList = 		oFormGrid["lists"][sListLabel];
		
		// var for storing the name of the form cell which we need to feed the list (some ID)
		var sFormCellFeedingTheList; 
		
		// var for storing the fieldname in the table feeding the list
		// which will be filtered by the value of the form cell (some ID)
		// so as to fill the list with matching records having this value only
		var sTargetedFieldInList; 
		
		// filter to be applied to the list, built with the values of sFormCellFeedingTheList and sTargetedFieldInList
		var aListFilters = {};
		
		// find relevant feeding info for this list	
		
		for (var sCellName in oCells){
			
			// find out if this cell feeds a list
			var oSynch = oCells[sCellName]["synchronize_with"];
			if (oSynch != null){
			
				// is it feeding our list? [t.i.: sListLabel]
				
				for (var sSomeListLabel in oSynch){
					if (sSomeListLabel == sListLabel){
						sFormCellFeedingTheList = sCellName;		
						sTargetedFieldInList = oSynch[sListLabel];
						break; 
					}
				}
			}
			// stop if we found what we were looking for
			if (sTargetedFieldInList != null) break;
		}
		
		var sSomeID = form.getDataFromCell(sFormTable, sFormCellFeedingTheList);
		
		// in case the form is not rendered yet (or any more), read from table directly
		// as a kind of rescue...
		if (sSomeID == null){
			var nActiveRow = fn.getFirstSelectedRowNodeFrom(sFormTable);
			if (nActiveRow == null && fn.getCurrentDisplayLength(sFormTable) == 1){
				nActiveRow = fn.getFirstRowNodeFrom(t);
			}
			sSomeID = fn.getDataFromCellInRowNode(nActiveRow, sFormCellFeedingTheList);
		}
		
		// set the filters to be applied
		
		aListFilters[sTargetedFieldInList] = sSomeID;
				
		lists.feed(sListLabel, aListFilters, function(){	
			
			const queue = new FunctionQueue();
			queue.enQueue(function(){
				
				// make the list editable									
				form.makeListEditable(sListLabel, oThisList["table"]["name"]);
			});
			queue.enQueue(function(){
				if (fnCallback != null) fnCallback();
			});
	
		});
	}
	
	// soft refresh
	else {
		
		var sFormContainerId = 	lists.getFormContainerId(sListLabel);
		var sTableId =	lists.buildTableId(sFormContainerId, sListLabel);
		var oTable = 	lists.getDataTableObjectOf(sTableId);
	
		const queue = new FunctionQueue();
		queue.enQueue(function(){
			oTable.clear().draw(false);
		});
		queue.enQueue(function(){
			if (fnCallback != null) fnCallback();
		});
	}
	
	
	
}


/**
 * Show a processing message in a list, given its label
 * @param {String} the label of the list to show the processing message in
 */
lists.showProcessingMsg = function(sListLabel, bAccordion){
	
	var sFormContainerId = 	lists.getFormContainerId(sListLabel);
	var selector = bAccordion ? "#"+sFormContainerId+"_cellblock_"+sListLabel+"_label div.formview_listlabel_container" : "#formview_listlabel_"+sListLabel;
	
	// make sure the list is visible and some content (width) before showing the spinner
	var fnShowSpinner = function(selector, iCounter){
		
		if ($(selector).width() > 0) {
			lexutil.showSpinner(selector);
		}
		else {
			setTimeout(function(){
				fnShowSpinner(selector, iCounter++);
			}, 100);
		}
	};
	fnShowSpinner(selector, 0);
};

/**
 * Remove the processing message from a list, given its label
 * @param {String} the label of the list to remove the processing message from
 */
lists.removeProcessingMsg = function(sListLabel, bAccordion){
	
	var sFormContainerId = 	lists.getFormContainerId(sListLabel);	
	var selector = bAccordion ? "#"+sFormContainerId+"_cellblock_"+sListLabel+"_label div.formview_listlabel_container" : "#formview_listlabel_"+sListLabel;
	
	// remove the spinner, but it this function was called too fast if won't work so: check if it hasn't work and if so, recall the function
	var fnRemoveSpinner = function(selector, iCounter){
		
		lexutil.removeSpinner(selector);
		
		setTimeout(function(){
			if (iCounter<10 && $(selector).length > 0) {
				fnRemoveSpinner(selector, iCounter++);
			}
		}, 100);
	};
	fnRemoveSpinner(selector, 0);
};




/**
 * feed a list (= load data from database), given a table name and some values to match
 * @param {String} the label of the list to feed
 * @param {Array} an associative array of field names and values to match
 * @param {Function} a callback function to call after the list has been fed
 */
lists.feed = function(sListLabel, aFieldsAndValuesToMatch, fnCallback){
	

	var sFormContainerId = 	lists.getFormContainerId(sListLabel);
	var sTableName = 		lists.getFeedingTable(sListLabel);

	var sFormTable = 		form.getFeedingTable(sFormContainerId);
	var oTableSettings =    conf.getTableSettings(sFormTable);
	var oFormGrid =         conf.getFormGrid(oTableSettings);
	var oThisList = 		oFormGrid["lists"][sListLabel];
	var oButtons = 			oThisList["buttons"];

	// read the database given a table name and some values to match

	// (don't try if we have no values to match, which can happen when a search returned no results = NO ID to match)
	if (Reflect.ownKeys(aFieldsAndValuesToMatch).length > 0){

		lists.getAllColumns(sTableName, function(aAllColumns){

			fn.getRecordsGivenFieldValues(sTableName, aFieldsAndValuesToMatch, 

				function(records){

					// get table object
					
					var sTableId =	lists.buildTableId(sFormContainerId, sListLabel);
					var oTable = 	lists.getDataTableObjectOf(sTableId);

					// make table empty (remove rows of previous draw)
					oTable.clear().draw(false);


					// now fill table with the rows just loaded from database
					//
					// (see https://datatables.net/examples/api/add_row.html)
					for (var sRowId in records){

						var aRecord = [];
						for (var i=0; i<aAllColumns.length; i++){	
							
							aRecord.push( records[sRowId][aAllColumns[i]] );
						}

						// add column for 'show' and 'delete' buttons
						lists.addButtonsToRow(oButtons, aRecord);

						// add a row and assign it its database ID
						oTable.row.add(aRecord).node().id = sRowId;
						// draw it
						oTable.draw(false);
					}

					// assign functions to 'show' and 'delete' icons
					lists.assignShowAndDeleteFunction(oTable);

					// callback if needed
					if (fnCallback != null)
						fnCallback();
				},
				function(err){

					fn.message(lang.error, (lang.formlist_synchronize_forgotten).replace("TABLENAME", sTableName));

				}
			);

		});			
	}
};



// add the 'show' and 'delete' icons to a row record,
// if required
lists.addButtonsToRow = function(oButtons, aRecord){

	// icons: 
	// * https://icons-for-free.com/eye-1325051849887064555/
	// * https://icons-for-free.com/cross+exit+remove+icon-1320161389317562876/
	
	var aButtonContent = [];
	if (oButtons != null){

		if (oButtons["delete"]!=null){
			aButtonContent.push("<img src='images/formlist_cross.png' class='delete'>");
		}
		if (oButtons["show"]!=null){
			aButtonContent.push("<img src='images/formlist_show.png' class='open'>");
		}
		
		var sButtonContent = "<center style='white-space: nowrap'>" + aButtonContent.join("<span>&nbsp;&nbsp;</span>") + "</center>";
		aRecord.push(sButtonContent);
		
	}
}



lists.addButtonToListHeader = function(oButtons, aColumnsToDisplay){
	
	var eElem = $("<span>&nbsp;</span>");

	if (oButtons["add"] != null){

		var oAdd = oButtons["add"];

		// buttons:	https://icons-for-free.com/add+to+photos+48px-131985225754447532/   
		//			https://icons-for-free.com/add+character+increase+math+plus+sign+icon-1320184998988139546/
		eElem = $("<img>")
			.attr("src", "images/formlist_add.png") 
			.addClass("add")
			.click(function(){

				var sThisFormTable = 		form.getFeedingTable(this);
				var sListTableId = 			lists.getTableIdFromNode(this);
				var oTable = 				lists.getDataTableObjectOf(sListTableId);
				var sThisListLabel = 		lists.getLabelFromNode(this);
				var sThisListTableName =	lists.getFeedingTable(sThisListLabel);
				var aAllColumns = 			lists.getAllColumns(sThisListTableName);
				

				// if some values of the record to be added
				// have to be copied according to config, do that
				//
				// config must look like:
				// 	"add": {
				//		"copy": { "column_to_feed": {"list_to_get_value_from": "column_to_get_value_from"} } 
				//	}

				var oToBeCopied = {};

				if (oAdd["copy"] != null){
					var oCopy = oAdd["copy"];

					
					for (var sOneColumnToFeed in oCopy){

						// if a value must be copied, oCopyFrom will contain an array {listlabel: column}
						
						var oCopyFrom = oCopy[sOneColumnToFeed];

						// special case:
						//  if a column must be skipped (t.i. not fed but skipped), oCopyFrom will have a null value
						//  NB: typically, a column is skipped because it is a serial type, and will get its value from the database
						if (oCopyFrom == null){

							oToBeCopied[sOneColumnToFeed] = null;
						}
						// normal case: 
						// get value from specified source columns
						else {

							// this must contain only one pair actually!
							for (var sListToRead in oCopyFrom){ 

								// read from a LIST cell
								if (sListToRead != "form"){
									// get the selected row to copy the values from
									var oSelectedRow = lists.getSelectedRows(sListToRead, true);
									var iRowNumber = $(oSelectedRow.nodes()).index();
									// read value from that row
									if (iRowNumber < 0){
										fn.message(lang.beware, (lang.formlist_select_a_row_first).replace(/LISTNAME/, sListToRead));
										return true;
									}
									oToBeCopied[sOneColumnToFeed] = lists.getDataFromCell(sListToRead, iRowNumber, oCopyFrom[sListToRead]);
								}	

								// or read from a FORM cell
								else {
									oToBeCopied[sOneColumnToFeed] = form.getDataFromCell(sThisFormTable, oCopyFrom[sListToRead], true);
								}
									
							}
						}
											
					}
				}



				// special: callback declared
				if (oAdd["do"] != null){

					// call custom function
					oAdd["do"]( sThisListLabel, sThisListTableName );
				}
				// general: default behaviour
				else {

					// values that must be copied, don't need to be part of the form requesting values!
					
					var aToBeCopied = (oAdd["copy"] != null ? oAdd["copy"] : {});
					var aColumnsForGUI = aColumnsToDisplay.filter(
						sColName => !aToBeCopied.hasOwnProperty(sColName) 
					);
					
					
					// now build a list of pre-filled in values
					
					var aPreFilledInValues = new Array();					
					var oThisListTableConfig = conf.getTableConfig(sThisListTableName);	
						
					for (const sColNameForGUI of aColumnsForGUI) {	
						
						
						
						// [1] select values from 'choosefrom' in list definition
						var oCellConfig = lists.getCellConfig(sThisListLabel, sColNameForGUI);
						var aAllowedValues = oCellConfig != null ? oCellConfig["choosefrom"] : null;
						
						// [2] select values from 'choosefrom' in config.js
						if (aAllowedValues == null){
							var oColumnConfig =	conf.getColumnConfig(oThisListTableConfig, sColNameForGUI);
							aAllowedValues = conf.getSelectionBox(oColumnConfig);
						}
						// [3] ELSE  select values from Postgres ENUM type
						if (aAllowedValues == null){
							var iColNameIndex = 	$.inArray(sColNameForGUI, mt.getListOfColumnsOf(sThisListTableName));
							aAllowedValues = mt.getListOfAllowedValuesInVisibleColumnsOf(sThisListTableName)[iColNameIndex];
						}				
						
						
						// select
						if ( aAllowedValues != null && aAllowedValues.length > 1){
							aPreFilledInValues.push( aAllowedValues );
						}
						// text
						else {
							aPreFilledInValues.push( "" );
						}
					}
					

					// set the title of the dialog
					var sAddRowTitle = (oAdd["title"] != null ? oAdd["title"] : lang.formlist_add_row);
					
					// get nice names for the dialog
					var aNiceColumnsForGUI = aColumnsForGUI.map( sColName => lists.getNiceColumnName(sThisListLabel, sColName) );
					
					// open the dialog
					fn.prompt(sAddRowTitle, aNiceColumnsForGUI, aPreFilledInValues, function(resp){
						
						// First: if we have a list of values to be copied, add those to the record.
						// (in theory, this might replace some values typed in the dialog)
						for (var sOneColumn in oToBeCopied){
							var sKeyInResp = lists.getNiceColumnName(sThisListLabel, sOneColumn);
							resp[sKeyInResp] = oToBeCopied[sOneColumn];
						}

						// build record to insert
						var aRecord = new Array();
						for (var j=0; j<aAllColumns.length; j++){

							var sColumnName = aAllColumns[j];
							var sKeyInResp = lists.getNiceColumnName(sThisListLabel, sColumnName);
							var valToAssign = resp[sKeyInResp];
							aRecord.push( valToAssign != null ? valToAssign : "<NULL>"); // this tells form.addNewRows() to assign no value to this cell
						}
						
						

						// add column for 'show' and 'delete' buttons
						lists.addButtonsToRow(oButtons, aRecord);

						// add record
						var nNewNode = oTable.row.add(aRecord).node();
						// mark it as 'added'
						$(nNewNode).addClass("added");
						// draw it
						oTable.draw(false);

						// editability
						form.makeListEditable(sThisListLabel, sThisListTableName);

						// assign functions to 'show' and 'delete' icons
						lists.assignShowAndDeleteFunction(oTable);

						// attract attention from user to send button, which must be pressed 
						// since some content was modified,
						// and show that reset is possible now
															
						var sFormTable = lists.getFormContainerId(sThisListLabel);
						sFormTable = form.getFeedingTable(sFormTable);
						form.setSendButtonToSetting(sFormTable, "payattention");
						form.setResetButtonToSetting(sFormTable, "active");
					});

				}				
			})
	}

	return eElem;
}


/**
 * Add a new row to a list, given an associative array of columns and values.
 * 
 * @param {String} sThisListLabel the label of the list to which to add the row
 * @param {Object} oColumnsAndValues associative array of columns and values
 * @param {Function} fnCallback a callback function to call after the row has been added
 */
lists.addRowToList = function(sThisListLabel, oColumnsAndValues, fnCallback){
		
	// get the list config
	var sFormContainerId = 	hFormListLabel2formId.get( sThisListLabel );
	var sFormTable = 		form.getFeedingTable(sFormContainerId);
	var oTableSettings =	conf.getTableSettings(sFormTable);
	var oFormGrid = 		conf.getFormGrid(oTableSettings);
	var oLists = 			oFormGrid["lists"];
	var oThisList = 		oLists[sThisListLabel];
	
	// get datatables object of the list
	var oTable = 			lists.getDataTableObjectOf(sThisListLabel);
	
	// get columns of the list
	var sThisListTableName =	lists.getFeedingTable(sThisListLabel);
	var aAllColumns = 			lists.getAllColumns(sThisListTableName);
	
	
	// get the buttons config	
	var oButtons = 	oThisList["buttons"];
	var oAdd = oButtons["add"];
	
	// if some values have to be copied given the config
	var oToBeCopied = {};
	if (oAdd["copy"] != null){
		
		var oCopy = oAdd["copy"];	
		
		for (var sOneColumnToFeed in oCopy){
	
			// if a value must be copied, oCopyFrom will contain an array {listlabel: column}
			
			var oCopyFrom = oCopy[sOneColumnToFeed];
	
			// special case:
			//  if a column must be skipped (t.i. not fed but skipped), oCopyFrom will have a null value
			//  NB: typically, a column is skipped because it is a serial type, and will get its value from the database
			if (oCopyFrom == null){
	
				oToBeCopied[sOneColumnToFeed] = null;
			}
			// normal case: 
			// get value from specified source columns
			else {
	
				// this must contain only one pair actually!
				for (var sListToRead in oCopyFrom){ 
	
					// read from a LIST cell
					if (sListToRead != "form"){
						// get the selected row to copy the values from
						var oSelectedRow = lists.getSelectedRows(sListToRead, true);
						var iRowNumber = $(oSelectedRow.nodes()).index();
						// read value from that row
						if (iRowNumber < 0){
							fn.message(lang.beware, (lang.formlist_select_a_row_first).replace(/LISTNAME/, sListToRead));
							return true;
						}
						oToBeCopied[sOneColumnToFeed] = lists.getDataFromCell(sListToRead, iRowNumber, oCopyFrom[sListToRead]);
					}	
	
					// or read from a FORM cell
					else {
						oToBeCopied[sOneColumnToFeed] = form.getDataFromCell(sFormTable, oCopyFrom[sListToRead], true);
					}
						
				}
			}
								
		}
	}
	
	
	// First: if we have a list of values to be copied, add those to the record.
	// (in theory, this might replace some values typed in the dialog)
	for (var sOneColumn in oToBeCopied){
		var sKeyInResp = lists.getNiceColumnName(sThisListLabel, sOneColumn);
		oColumnsAndValues[sKeyInResp] = oToBeCopied[sOneColumn];
	}
	
	// build record to insert
	var aRecord = new Array();
	for (var j=0; j<aAllColumns.length; j++){

		var sColumnName = aAllColumns[j];
		var sKeyInResp = lists.getNiceColumnName(sThisListLabel, sColumnName);
		var valToAssign = oColumnsAndValues[sKeyInResp];
		aRecord.push( valToAssign != null ? valToAssign : "<NULL>"); // this tells form.addNewRows() to assign no value to this cell
	}
	
	
	// add column for 'show' and 'delete' buttons
	lists.addButtonsToRow(oButtons, aRecord);

	// add record
	var nNewNode = oTable.row.add(aRecord).node();
	// mark it as 'added'
	$(nNewNode).addClass("added");
	// draw it
	oTable.draw(false);

	// editability
	form.makeListEditable(sThisListLabel, sThisListTableName);

	// assign functions to 'show' and 'delete' icons
	lists.assignShowAndDeleteFunction(oTable);

	// attract attention from user to send button, which must be pressed 
	// since some content was modified,
	// and show that reset is possible now
										
	var sFormTable = lists.getFormContainerId(sThisListLabel);
	sFormTable = form.getFeedingTable(sFormTable);
	form.setSendButtonToSetting(sFormTable, "payattention");
	form.setResetButtonToSetting(sFormTable, "active");
	
	// finally callback if any
	if (fnCallback != null) fnCallback();
};


/**
 * Remove a row from a list
 * 
 * @param {String} sThisListLabel the label of the list to which to add the row
 * @param {Node} nRow rode of a row
 * @param {Function} fnCallback a callback function to call after the row has been added
 */
lists.removeRowFromList = function(sThisListLabel, nRow, fnCallback){
	
	// keep array of rowId to delete
	var nRowId = nRow.id;

	var sThisFormListDivId = $(nRow).closest('div.formview_list')[0].id;					
	var sListToRemove = $("#"+sThisFormListDivId).attr("remove_ids");
	sListToRemove = (sListToRemove!=null ? sListToRemove : "");
	sListToRemove += (sListToRemove == "" ? "": ",")+nRowId;
	$("#"+sThisFormListDivId).attr("remove_ids", sListToRemove);
	$("#"+sThisFormListDivId).addClass("rows_to_be_deleted");

	// remove row from view
	oTable.row( $(nRow)).remove().draw();

	// attract attention from user to send button, which must be pressed 
	// since some content was modified,
	// and show that reset is possible now
										
	var sFormTable = lists.getFormContainerId(sThisListLabel);
	sFormTable = form.getFeedingTable(sFormTable);
	form.setSendButtonToSetting(sFormTable, "payattention");
	form.setResetButtonToSetting(sFormTable, "active");
	
	// finally callback if any
	if (fnCallback != null) fnCallback();
};


// assign the 'show' and 'delete' functions  
// to the row buttons
lists.assignShowAndDeleteFunction = function(oTable){

	$("#"+ lists.getTableIdFromDataTableObject(oTable) ).find(".open,.delete").off();
	$("#"+ lists.getTableIdFromDataTableObject(oTable) ).find(".open,.delete").click(function(){

		var thisCell = this;

		// remember previously selected row, so as to be able to restore it if needed
		var previouslySelected = $( $(thisCell).closest("table")[0] ).find("tr.selected");

		// remove previous row selection
		// and select the row we just clicked
		$( previouslySelected ).removeClass("selected");
		$( $(thisCell).closest("tr")[0] ).addClass("selected");

		
		var sThisTable = 		form.getFeedingTable(this);
		var sThisListLabel = 	lists.getLabelFromNode(this);
		var oTableSettings =    conf.getTableSettings(sThisTable);
		var oFormGrid =         conf.getFormGrid(oTableSettings);
		var oThisList = 		oFormGrid["lists"][sThisListLabel];
		var oButtons = 			oThisList["buttons"];
		

		// read buttons config

		if (oButtons != null){

			// get the row id
			var nRow = $(thisCell).parents("tr")[0];
			var sRowId = nRow.id;


			// 'show' button was clicked upon
			
			if ($(thisCell).hasClass("open")){
				
				// read 'show' button config
				var oShow = oButtons["show"];
				var oDo = oShow["do"]; 

				// special: callback declared
				if (typeof oDo === "function"){

					// call custom function
					oDo(sThisListLabel, nRow);
				}
				// general: default behaviour
				else {

					// check if some lists have been modified, before those get overwritten!
					var aModifiedLists = new Array();
					for (var sListToCall in oDo){
						var sTableId =		lists.buildTableId(sThisTable+"_form", sListToCall);
						var sContainerId = 	lists.buildTableContainerId(sThisTable+"_form", sListToCall);

						if ($("#"+sTableId).find(".modified,.added").length>0 || $("div#"+sContainerId).hasClass("rows_to_be_deleted"))
							aModifiedLists.push(sListToCall);
					}

					// if the row has an empty id, we've nothing to look up in other lists or so
					// so, the user needs to save first, which will trigger data-reload and row id retrieval!
					if (sRowId == null || sRowId == ''){

						fn.message(lang.beware, lang.formlist_save_first_after_row_creation);
						// restore original row selection
						$( $(thisCell).closest("table")[0] ).find("tr.selected").each(function(){
							$(this).removeClass("selected");
						});
						$( previouslySelected ).addClass("selected");

						return true;
					}
					// if the list contains modified rows etc, the use must save first or that will be lost
					else if (aModifiedLists.length>0){
						var sModifiedLists = aModifiedLists.join(", ");
						fn.message(lang.beware, (lang.formlist_save_first_before_overwriting).replace(/LISTSNAMES/, sModifiedLists));

						// restore original row selection
						$( $(thisCell).closest("table")[0] ).find("tr.selected").each(function(){
							$(this).removeClass("selected");
						});
						$( previouslySelected ).addClass("selected");

						return true;
					}
					else {

						for (var sListToCall in oDo){
							var aColsAndVals = new Array();
							aColsAndVals[ oDo[sListToCall] ] = sRowId;
							
							// fill the table
							lists.feed(sListToCall,  aColsAndVals);

							// make it editable
							setTimeout(function(){
								form.makeListEditable(sListToCall, lists.getFeedingTable(sListToCall));
							}, 500);
						}
					}
					
				}
			}

			
			// 'delete' button was clicked upon
			
			if ($(thisCell).hasClass("delete")){

				// read 'delete' button config
				var oDelete = oButtons["delete"];
				var oDo = oDelete["do"];
				
				// special: callback declared
				if (typeof oDo === "function"){

					// call custom function
					oDo(sThisListLabel, nRow);
				}
				// general: default behaviour
				else {
					// keep array of rowId to delete
					var nRowId = nRow.id;

					var sThisFormListDivId = $(nRow).closest('div.formview_list')[0].id;					
					var sListToRemove = $("#"+sThisFormListDivId).attr("remove_ids");
					sListToRemove = (sListToRemove!=null ? sListToRemove : "");
					sListToRemove += (sListToRemove == "" ? "": ",")+nRowId;
					$("#"+sThisFormListDivId).attr("remove_ids", sListToRemove);
					$("#"+sThisFormListDivId).addClass("rows_to_be_deleted");

					// remove row from view
					oTable.row( $(nRow)).remove().draw();

					// attract attention from user to send button, which must be pressed 
					// since some content was modified,
					// and show that reset is possible now
														
					var sFormTable = lists.getFormContainerId(sThisListLabel);
					sFormTable = form.getFeedingTable(sFormTable);
					form.setSendButtonToSetting(sFormTable, "payattention");
					form.setResetButtonToSetting(sFormTable, "active");
				}
			}
		}						
	});
};


// get the table sorting order in the DataTable way
// given an associative array like {col1: asc/desc, ...}
lists.getDataTableOrder = function(aColumns, oSortSettings){

	var aDataTableOrder = 	new Array();	
	
	for (var i=0; i<aColumns.length; i++){

		// get column index, given the column name
		var sColName = aColumns[i];		
		var iColIndex = $.inArray(sColName, aColumns);
		
		if (oSortSettings[sColName] != null){
			aDataTableOrder.push([ iColIndex, oSortSettings[sColName] ]);
		}
	}	
	return aDataTableOrder;
}






// --------------------------------------------------------------------
//
// API
//
// --------------------------------------------------------------------




// --------------------------------------------
// retrieve the configuration 
// --------------------------------------------



/**
 * Get the list of all list labels, as declared in the configuraton
 * @returns {Array} an array of list labels
 */
lists.getListOfListLabels = function(sTableName){

	// the keys of the hFormListLabel2formId hash are the names of the list labels
	// but we only want the ones that correspond to a value matching the container ID of the form feeding table ( = tablename + '_form'-suffix)
	var aListOfLists = hFormListLabel2formId.keys();
	var aListForThisForm = aListOfLists.filter(sListLabel => hFormListLabel2formId.get(sListLabel) == (sTableName+"_form"));	
	return aListForThisForm;
};

/**
 * Get the configuration of a list, given any node inside it
 * @param {Node} a node in the list
 * @returns {Array} an associative array, specifying the configuration of the list 
 */
lists.getConfig = function(elem){

	// get the form table
	// and retrieve its config
	var sTableOfFrom = 		form.getFeedingTable(elem);
	var oTableSettings =	conf.getTableSettings(sTableOfFrom);
	var oFormGrid = 		conf.getFormGrid(oTableSettings);
	
	// get the list label
	// and retrieve its config in the form config
	var sListLabel =	lists.getLabelFromNode(elem);	
	var aList = 		oFormGrid["lists"];
	return aList[sListLabel];
};


// list label => list height
/**
 * Get the height of a list, as set in the configuration
 * @param {String} the label of a list
 * @returns {String} the list height to be rendered 
 */
lists.getDisplayHeight = function(sFormListLabel){
	return hFormListLabel2DisplayHeight.get(sFormListLabel);
};
/**
 * Get the sort settings of a list, as set in the configuration
 * @param {String} the label of a list
 * @returns {Array} the sort settings (as an associative array) to be applied 
 */
lists.getSortSettings = function(sFormListLabel){
	return hFormListLabel2SortSettings.get(sFormListLabel);
};


/**
 * Get the column order of a list, as set in the configuration
 * @param {String} the label of a list
 * @returns {Array} the columns in a specified order
 */
lists.getColumnOrder = function(sFormListLabel){
	return hFormListLabel2OrderSettings.get(sFormListLabel);
}


// --------------------------------------------
// retrieve the FEEDING TABLE NAME 
// --------------------------------------------

lists.getFeedingTable = function(sFormListLabel){
	return hFormListLabel2tableName.get(sFormListLabel);
};


// --------------------------------------------
// retrieve the FEEDING TABLE OBJECT
// --------------------------------------------


/**
 * Get the DataTable object underlying a list
 * @param {String} label of a list   OR    table ID of the table underlying the list
 * @returns {API-object-instance} DataTable object underlying a list
 */
lists.getDataTableObjectOf = function(mixed){
	
	// if the input is a list label, build a table ID 
	if (mixed.indexOf("___") == -1){
		mixed = lists.getFormContainerId(mixed) + "___" + mixed;
	}
	
	var oTable = hFormAndList2DataTable.get(mixed);
	return oTable;
};

// --------------------------------------------
// retrieve the FEEDING TABLE ID
// --------------------------------------------

/**
 * Get the ID representing both form and list label of a list, given any node inside it
 * @param {Node} any node in a list  
 * @returns {String} the id of the list's table
 */
lists.getTableIdFromNode = function(nNode){
	var sListContainerId = $(nNode).closest('div.formview_list')[0].id;
	return sListContainerId.replace(/_container$/, "");
};


/**
 * Get the ID representing both form and list label of a list, given the list's container ID
 * @param {String} the list container ID  
 * @returns {String} the id of the list's table
 */
lists.getTableIdFromContainerId = function(sContainerId){
	return sContainerId.replace(/_container$/, "");
};


/**
 * Get the id of the table a DataTable object is about
 * @param {API-object-instance} DataTable object underlying a list
 * @returns {String} the id of the list's table
 */
lists.getTableIdFromDataTableObject = function(oTable){
	
	return oTable.table().node().id;
};


// --------------------------------------------
// retrieve the feeding table CONTAINER ID
// --------------------------------------------

/**
 * Get the ID of the container of a list table, given any node inside it
 * @param {Node} any node in a list 
 * @returns {String}
 */
lists.getContainerIdFromNode = function(nNode){
	var sThisContainerId = $(nNode).closest('div.formview_list')[0].id;
	return sThisContainerId;
};


// --------------------------------------------
// retrieve the form CONTAINER ID
// --------------------------------------------


/**
 * Get the form container ID, given the label of any list in the form
 * @param {String|Node} the label of a form list or any node in the form 
 * @returns {String} ID of the form (that should have the form [feeding-table] + ['_form'-suffix])
 */
lists.getFormContainerId = function(mixed){
	
	if (typeof mixed == 'string'){	
		return hFormListLabel2formId.get(mixed);
	}
	else {
		return $(mixed).closest('div.formgrid')[0].id;
	}
}


// --------------------------------------------
// retrieve the LABEL of a list
// --------------------------------------------

/**
 * Get the list label the a DataTable object is about
 * @param {API-object-instance} DataTable object underlying a list
 * @returns {String} the label of the list
 */
lists.getLabelFromDataTableObject = function(oTable){
	
	return (lists.getTableIdFromDataTableObject(oTable)).split("___")[1];
}

/**
 * Get the label of a list, given a node inside it
 * @param {Node} any node in a list
 * @returns {String} the label of the list  
 */
lists.getLabelFromNode = function(nNode){
	var sContainerId = lists.getContainerIdFromNode(nNode);
	return lists.getLabelFromContainerId(sContainerId);
};

/**
 * Get the label of a list, given its container ID
 * @param {String} sContainerId 
 * @returns {String} the label of the list
 */
lists.getLabelFromContainerId = function(sContainerId){
	var sThisListLabel = sContainerId.split("___");
	return (sThisListLabel[1]).replace(/_container$/, "");
};





// --------------------------------------------
// COLUMNS functions
// --------------------------------------------


/**
 * Get the list of columns that are set to be visible in the list config.
 * Being part of the list depends on visibility setting of the column/cell only.
 * 
 * @param {Array} the lists object, an associative array associating list labels to list configurations
 * @param {String} the label of the list we want to get the columns' list of
 * @returns {Array} a list of column names 
 * 
 * @see lists.getVisibleColumns
 */
lists.getColumnsToDisplay = function(oLists, sListLabel){

	var aTableColumnsConfig = oLists[sListLabel]["table"]["columns"];

	// columns
	var aColumnsToDisplay = new Array();
	for (var sColumnName in aTableColumnsConfig){
		var bVisible = aTableColumnsConfig[sColumnName]["visible"];
		if (bVisible != false)
			aColumnsToDisplay.push(sColumnName);
	}
	return aColumnsToDisplay;
};



// this function is called only once, at the very beginning of the lists rendering
// BEWARE it must be called after the getColumns() function has been called at least once (to fill hListTable2Cols)
lists._computeListsNiceNames = function(oFormGrid, sListLabel){
	
	var oLists = oFormGrid["lists"];
	var aTableColumnsConfig = oLists[sListLabel]["table"]["columns"];
	var sSomeTableName = lists.getFeedingTable(sListLabel);
	
	var aColumns = hListTable2Cols.get(sSomeTableName);
	var aNiceColumns = new Array();
	
	for (var i=0; i<aColumns.length; i++){
		var sColumnName = aColumns[i];
		var sNiceName = (aTableColumnsConfig[sColumnName] != null ? aTableColumnsConfig[sColumnName]["nice_name"] : sColumnName);
		aNiceColumns.push( sNiceName ?? sColumnName );
	}
	
	hListTable2NiceCols.put(sSomeTableName, aNiceColumns);	
};


/**
 * Given a list label and a nice name, get the corresponding true column name
 * @param {String} the label of the list  
 * @param {String} the nice name of the column
 * @returns {String} the true column name
 */
lists.getTrueColumnName = function(sFormListLabel, sNiceName){
	
	var sSomeTableName = lists.getFeedingTable(sFormListLabel);	
	var aColumns = hListTable2Cols.get(sSomeTableName);
	var aNiceColumns = hListTable2NiceCols.get(sSomeTableName);
	
	var iIndex = $.inArray(sNiceName, aNiceColumns);
	return aColumns[iIndex];
};

/**
 * Given a list label and a column name, get the corresponding nice name
 * @param {String} the label of the list
 * @param {String} the column name
 * @returns {String} the nice name of the column
 */
lists.getNiceColumnName = function(sFormListLabel, sColName){
	
	var sSomeTableName = lists.getFeedingTable(sFormListLabel);	
	var aColumns = hListTable2Cols.get(sSomeTableName);
	var aNiceColumns = hListTable2NiceCols.get(sSomeTableName);	
	
	var iIndex = $.inArray(sColName, aColumns);
	return aNiceColumns[iIndex];
};



/**
 * Get the list of columns that are set to be visible in the list config.
 * Being part of the list depends on visibility setting of the column/cell only.
 * 
 * @param {String} the label of the list we want to get the columns' list of
 * @returns {Array} a list of column names 
 * 
 * @see lists.getColumnsToDisplay
 */
lists.getVisibleColumns = function(sListLabel){
	
	// get the form config this list is part of
	var sFormContainerId = lists.getFormContainerId(sListLabel);
	var sFormTable = form.getFeedingTable(sFormContainerId);
	var oTableSettings = conf.getTableSettings(sFormTable);
	var oFormGrid = conf.getFormGrid(oTableSettings);
	var oLists = oFormGrid["lists"];
		
	return lists.getColumnsToDisplay(oLists, sListLabel);	
};


/**
 * Get the list of columns that are to be filled in, in the add form of the list.
 * Being part of the list depends here both on visibility and editability settings of the column/cell.
 * 
 * @param {Array} the lists object, an associative array associating list labels to list configurations
 * @param {String} the label of the list we want to get the columns' list of
 * @returns {Array} a list of column names 
 */
lists.getColumnsToDisplayInAddForm = function(oLists, sListLabel){

	var aTableColumnsConfig = oLists[sListLabel]["table"]["columns"];

	// columns
	var aColumnsToDisplay = new Array();
	for (var sColumnName in aTableColumnsConfig){
		var bVisible = aTableColumnsConfig[sColumnName]["visible"];
		var bEditable = aTableColumnsConfig[sColumnName]["editable"];
		if (bVisible != false && bEditable != false)
			aColumnsToDisplay.push(sColumnName);
	}
	return aColumnsToDisplay;
};



/**
 * Get the columns with to be applied, if declared in the config
 * @param {Array} the lists object, an associative array associating list labels to list configurations 
 * @param {String} the label of the list we want to get the columns' list of 
 * @param {String} name of the column 
 * @returns {String} value if available, otherwise null
 */
lists.getColumnsWidth = function(oLists, sListLabel, sColumnName){

	var aTableColumnsConfig = oLists[sListLabel]["table"]["columns"];
	var iWidth = aTableColumnsConfig[sColumnName]["width"];
	return iWidth;
}


/**
 * Get the list of columns named in the form config
 * @param {Array} the lists object, an associative array associating list labels to list configurations 
 * @param {String} the label of the list we want to get the columns' list of 
 * @returns {Array} a list of column names
 */
lists.getColumnsToUse = function(oLists, sListLabel){

	var aTableColumnsConfig = oLists[sListLabel]["table"]["columns"];

	// columns
	var aColumnsToDisplay = new Array();
	for (var sColumnName in aTableColumnsConfig){
		aColumnsToDisplay.push(sColumnName); 
	}
	return aColumnsToDisplay;
};


/**
 * Get the list of (both visible and invisible) columns of a list 
 * (from the database at first call; and from call at following calls)
 * @param {String} name of the table underlying the list 
 * @param {Function} a callback function which processed the response 
 * 
 * @see fn.getAllColumns
 */
lists.getAllColumns = function(sSomeTableName, fnCallback, aOrderSettings){

	if (hListTable2Cols.get(sSomeTableName) != null){

		if (fnCallback != null){
			fnCallback(hListTable2Cols.get(sSomeTableName));
		}
		else {
			return hListTable2Cols.get(sSomeTableName);
		}
		
	}
	else {

		var url = WEBSERV_URL+"/api/getcolumns";	
		$.ajax({
			type: "GET",
			url: url,
			data: {
				"table": sSomeTableName, 
				"db_name": lexutil.getHttpParams().get("db") 
				},
			dataType: "xml",
			//contentType: "application/x-www-form-urlencoded;charset=UTF-8",
			success: function(xml) {
				
				var aColumns = new Array();
				var aColumnTypes = new Array();
				var aColumnCustomVals = new Array();
				$(xml).find("column").each(function(){
					aColumns.push( $(this).find("column_name").text() );
					aColumnTypes.push( $(this).find("column_type").text() );
					aColumnCustomVals.push( $(this).find("customtype_values").text() );
				});
				
				// do we have an order settings to apply?
				
				if (aOrderSettings != null && aOrderSettings.length > 0){
					
					// check if the order settings are compatible with the columns we got from the database
					var aDiff = lexutil.symmetricDifference(aColumns, aOrderSettings);
					if (aDiff.length > 0){
						
						var sCompare = lang.columns_list_to_compare + ": {" + aDiff.join(", ") + "}";
						fn.message(lang.error_occurred_in_table+ " '"+sSomeTableName+"'", sCompare+".");
					}
					else {
						
						aColumns = aOrderSettings.map(name => aColumns[aColumns.indexOf(name)]);
						aColumnTypes = aOrderSettings.map(name => aColumnTypes[aColumns.indexOf(name)]);
						aColumnCustomVals = aOrderSettings.map(name => aColumnCustomVals[aColumns.indexOf(name)]);						
					}
					
										
				}
				
				// store the columns and types now

				hListTable2Cols.put(sSomeTableName, aColumns);
				hListTable2ColTypes.put(sSomeTableName, aColumnTypes);
				hListTable2CustomVals.put(sSomeTableName, aColumnCustomVals);

				if (fnCallback != null){
					fnCallback(aColumns);
				}
				else {
					return aColumns;
				}
			}
		});
	}	
};


/**
 * Get the type of a column, given the feeding table name and the column name
 * @param {String} name of the table underlying the list
 * @param {String} type of the column
 */
lists.getColumnType = function(sTableName, sColumnName){
	
	var aCols = hListTable2Cols.get(sTableName);
	var idx = $.inArray(sColumnName, aCols);
	var aColTypes = hListTable2ColTypes.get(sTableName);
	return aColTypes[idx];	
};

/**
 * Get the allowed values of a column, given the feeding table name and the column name
 * (this is about ENUM types)
 * @param {String} name of the table underlying the list
 * @param {String} name of the column
 * 
 * @see fn.getAllowedValuesOfColumn()
 */
lists.getAllowedValuesOfColumn = function(sTableName, sColumnName){
	
	var aCols = hListTable2Cols.get(sTableName);
	var idx = $.inArray(sColumnName, aCols);
	var aColVals = hListTable2CustomVals.get(sTableName);
	var sTheseVals = aColVals[idx];
	if (sTheseVals == null || sTheseVals == "")
		return null;
	else
		return sTheseVals.split("|");
};



/**
 * Get the content of a whole column, given its name
 * 
 * @param {String} sListLabel -label of the list
 * @param {String} sColumnName - Name of a column 
 * @returns {String[]} Content of the cells of the column
 */
lists.getDataFromColumn = function(sListLabel, sColumnName){	
	
	var oTable = lists.getDataTableObjectOf(sListLabel);
	
	// Get column names
	var aAllColumns = oTable.columns().header().toArray().map(function(header) {
	    return lists.getTrueColumnName(sListLabel, $(header).text());
	});
	
	var aRows = oTable.rows().data();
	var aColumnData = [];
	
	for (var i = 0; i < aRows.length; i++) {
		
		var iColIndex = $.inArray(sColumnName, aAllColumns);
		aColumnData.push(aRows[i][iColIndex]);
	}

	return aColumnData;
};



// --------------------------------------------
// CELLS functions
// --------------------------------------------

/**
 * Read the value of a cell in a list
 * @param {String} label of the list
 * @param {(Integer|Node)} node of a cell, or row node / row number (in this case, a column name must be provided)
 * @param {String} [sColName=null] column name of the cell (only needed when second parameter is a Node)
 * @returns {String} value of the cell
 */
lists.getDataFromCell = function(sListLabel, mMixed, sColName){

	// get the DataTable object of the list
	var sFormContainerId = 	lists.getFormContainerId(sListLabel);
	var sThisListTableId = 	lists.buildTableId(sFormContainerId, sListLabel);
	var oTable = 			lists.getDataTableObjectOf(sThisListTableId);

	// we have these possible inputs: 
	// 1. a row-number + a cell name
	// 2/ a row node   + a cell name
	// 3. a cell node
	
	// 1: row number
	if (typeof mMixed == 'number'){

		var iRowNumber = mMixed;
		var sListTableName = 	lists.getFeedingTable(sListLabel);
		var aAllColumns = 		lists.getAllColumns(sListTableName)

		var colNr = $.inArray(sColName, aAllColumns);
		var oRowData = oTable.row( iRowNumber ).data();
		return oRowData[colNr];
	}
	// 2: row node
	else if (typeof mMixed == 'object'){

		var iRowNumber = oTable.row( mMixed ).index();
		var sListTableName = 	lists.getFeedingTable(sListLabel);
		var aAllColumns = 		lists.getAllColumns(sListTableName)

		var colNr = $.inArray(sColName, aAllColumns);
		var oRowData = oTable.row( iRowNumber ).data();
		return oRowData[colNr];
	}
	// 3: cell node
	else {
		var oRowData = oTable.cell( mMixed ).data();
		return oRowData;
	}

	// otherwise
	return null;
};


/**
 * Get the config of a cell in a list, given its label
 * @param {String} label of the list
 * @param {String} [sColName] column name of the cell
 * @returns {Array} associative array
 */
lists.getCellConfig = function(sListLabel, sCellName){
	
	var sFormContainerId = lists.getFormContainerId(sListLabel);
	var sFormTable = form.getFeedingTable(sFormContainerId);
	var oTableSettings = conf.getTableSettings(sFormTable);
	var oFormGrid = conf.getFormGrid(oTableSettings);
	var oLists = oFormGrid["lists"];	
	var oListConfig = oLists[sListLabel];	
	var oColumnsConfig = oListConfig["table"]["columns"];	
	var oCellConfig = oColumnsConfig[sCellName];
	
	return oCellConfig;
};




/**
 * Get a cell in a list
 * @param {String} label of the list
 * @param {(Integer|Node)} row node / row number
 * @param {String} [sColName=null] column name of the cell
 * @returns {Node} a cell node
 * 
 * @see lists.getSiblingCell
 */
lists.getCell = function(sListLabel, mMixed, sColName){

	// get the DataTable object of the list
	var sFormContainerId = 	lists.getFormContainerId(sListLabel);
	var sThisListTableId = 	lists.buildTableId(sFormContainerId, sListLabel);
	var oTable = 			lists.getDataTableObjectOf(sThisListTableId);

	// we have 2 possible inputs: 
	// 1. a row-number + a cell name
	// 2/ a row node   + a cell name
	
	// 1: row number
	if (typeof mMixed == 'number'){

		var iRowNumber = mMixed;
		var sListTableName = 	lists.getFeedingTable(sListLabel);
		var aAllColumns = 		lists.getAllColumns(sListTableName)

		var colNumber = $.inArray(sColName, aAllColumns);
		var cell = oTable.cell( iRowNumber, colNumber ).node();
		return cell;
	}
	// 2: row node
	else if (typeof mMixed == 'object'){

		var iRowNumber = 		oTable.row( mMixed ).index();
		var sListTableName = 	lists.getFeedingTable(sListLabel);
		var aAllColumns = 		lists.getAllColumns(sListTableName)

		var colNumber = $.inArray(sColName, aAllColumns);		
		var cell = oTable.cell( iRowNumber, colNumber ).node();
		return cell;
	}
	// 3: of course no cell node procedure here (compare lists.getDataFromCell )  
	//    because a cell node can be provided, as we are retrieving it!

	// otherwise
	return null;
};


/**
 * Get the sibling cell of a cell in a list
 * @param {String} label of the list
 * @param {Node} node of a cell
 * @param {String} name of the column of the sibling cell
 * @returns {Node} a cell node of the sibling
 * 
 * @see lists.getCell
 */
lists.getSiblingCell = function(sListLabel, nCell, sColName){
	
	var oTable = lists.getDataTableObjectOf(sListLabel);
	var nRow = oTable.row(nCell).node();
	var iColIndex = $.inArray(sColName, oTable.columns().header().toArray().map(function(header) {
		return lists.getTrueColumnName(sListLabel, $(header).text());
	}));
	return oTable.cell(nRow, iColIndex).node();
}



/**
 * Set the value of a cell in a list
 * @param {String} label of the list 
 * @param {Node} node of a cell 
 * @param {String} value to assign to the cell 
 */
lists.setDataInCell = function(sListLabel, nCell, sValue){

	// get the DataTable object of the list
	var sFormContainerId =	lists.getFormContainerId(sListLabel);
	var sFormTable =		form.getFeedingTable(sFormContainerId);
	var sThisListTableId =	lists.buildTableId(sFormContainerId, sListLabel);
	var oTable = 			lists.getDataTableObjectOf(sThisListTableId);
	
	// assign value
	oTable.cell(nCell).data(sValue);
	
	// mark cell as modified
	$(nCell).addClass("modified");

	// attract attention from user to send button, which must be pressed 
	// since some content was modified,
	// and show that reset is possible now									
	
	form.setSendButtonToSetting(sFormTable, "payattention");
	form.setResetButtonToSetting(sFormTable, "active");
};





// --------------------------------------------
// ROWS functions
// --------------------------------------------


/**
 * Get the selected rows in a list
 * @param {String} label of the list
 * @returns {API-object-instance} DataTable object representing the rows 
 */
lists.getSelectedRows = function(sListLabel, bGetDataTableObject){

	// get the DataTable object of the list
	var sFormContainerId =	lists.getFormContainerId(sListLabel);
	var sThisListTableId =	lists.buildTableId(sFormContainerId, sListLabel);
	var oTable = 			lists.getDataTableObjectOf(sThisListTableId);

	// return a DataTable object if required
    if (bGetDataTableObject != null && bGetDataTableObject == true) 
    	return oTable.rows(".selected");
    	
    // default: return row nodes
	return oTable.rows(".selected").nodes();
};


/**
 * Select a particular row in a list, given its id
 * @param {String} label of the list 
 * @param {Array|String} associative array of column names and values OR id of the row (primary key in database terms) 
 */
lists.selectRow = function(sListLabel, mMixed){

	var eRow = lists.getRow(sListLabel, mMixed);
	if ( eRow!= null && !$(eRow).hasClass("selected"))
		$(eRow).addClass("selected");
};

/**
 * Unselect a particular row in a list, given its id
 * @param {String} label of the list 
 * @param {Array|String} associative array of column names and values OR id of the row (primary key in database terms) 
 */
lists.unselectRow = function(sListLabel, mMixed){

	var eRow = lists.getRow(sListLabel, mMixed);
	if ( eRow!= null && $(eRow).hasClass("selected"))
		$(eRow).removeClass("selected");
};

/**
 * Get a particular row in a list, given its id
 * @param {String} label of the list 
 * @param {Array|String} associative array of column names and values OR id of the row (primary key in database terms) 
 */
lists.getRow = function(sListLabel, mMixed) {
	
	// input is array of fields and values
	
	if (typeof mMixed === 'object') {
		
		var oFieldsAndValuesToMatch = mMixed;

		// get the DataTable object of the list
		var sFormContainerId = 		lists.getFormContainerId(sListLabel);
		var sThisListLabelId = 		lists.buildTableId(sFormContainerId, sListLabel);
		var oTable = 				$("#"+sThisListLabelId).DataTable();
		
		var sThisListLabel = 		lists.getLabelFromDataTableObject(oTable);
		var sThisListTableName =	lists.getFeedingTable(sThisListLabel);
		var aAllColumns = 			lists.getAllColumns(sThisListTableName);

		// get the row id
		var sRowId = null;
		var aRows = oTable.rows().data();
		for (var i = 0; i < aRows.length; i++) {
			var bMatch = true;
			for (var sColName in oFieldsAndValuesToMatch) {
				var iColIndex = $.inArray(sColName, aAllColumns);
				if (aRows[i][iColIndex] != oFieldsAndValuesToMatch[sColName]) {
					bMatch = false;
					break;
				}
			}
			if (bMatch) {
				sRowId = oTable.row(i).node().id;
				break;
			}
		}
		
		if (sRowId == null) return null;
		return $("#" + sThisListLabelId).find("tr#" + sRowId).get(0);
	}
	
	// input is row ID
	
	else {
		
		var sRowId = mMixed;

		// get the DataTable object of the list
		var sFormContainerId = lists.getFormContainerId(sListLabel);
		var sThisListLabelId = lists.buildTableId(sFormContainerId, sListLabel);
		return $("#" + sThisListLabelId).find("tr#" + sRowId).get(0);
	}
}


/**
 * get the number of rows of a list, given its label
 * @param {String} label of the list 
 * @see fn.getNumberOfVisibleRows()
 */
lists.getNumberOfVisibleRows = function(sListLabel){
	
	var oTable = lists.getDataTableObjectOf(sListLabel);
	return (oTable != null ? oTable.rows().count() : 0);
};



/**
 * Programmatically click on the 'open' icon in the currently selected row of a list
 * @param {String} label of the list 
 */
lists.clickOpenInSelectedRow = function(sListLabel){

	// get the DataTable object of the list
	var sFormContainerId = lists.getFormContainerId(sListLabel);
	var sFormAndListLabelId = lists.buildTableId(sFormContainerId, sListLabel);
	var eRow = $("#"+sFormAndListLabelId).find("tr.selected").find("img.open").click();
} 


// --------------------------------------------------------------------
// the table of a list has an id like:
//
// 			'<FORM_ID>___<LISTLABEL>'
//

/**
 * Build the id of a list container (DIV), given the form id and the list label.
 * The id to be built is like 'FORM_ID___LISTLABEL_container'
 * (where FORM_ID is the name of the table underlying the form, to which the string '_form' is appended).
 * @param {String} id of the form container 
 * @param {String} label of the list 
 * @returns {String} the DIV id 
 */
lists.buildTableContainerId = function(sFormContainerId, sListLabel ){
	lists.checkLabelForm(sListLabel);
	return lists.buildTableId(sFormContainerId, sListLabel) + "_container";
}


/**
 * Build the id of a list table, given the form id and the list label.
 * The id to be built is like 'FORM_ID___LISTLABEL'
 * (where FORM_ID is the name of the table underlying the form, to which the string '_form' is appended).
 * @param {String} id of the form container 
 * @param {String} label of the list 
 * @returns {String} the DIV id 
 */
lists.buildTableId = function(sFormContainerId, sListLabel ){
	lists.checkLabelForm(sListLabel);
	return sFormContainerId+"___"+sListLabel.toLowerCase().replace(/ /g, "_");
}


/**
 * Check if the label of a list is valid
 * @param {String} label of the list 
 */
lists.checkLabelForm = function(sListLabel) {
	if (sListLabel != (sListLabel.toLowerCase().replace(/ /g, "_")) )
	    fn.message(lang.beware, lang.formlist_label_must_be_lowercase_and_no_spaces.replace(/LISTNAME/, sListLabel));
}










