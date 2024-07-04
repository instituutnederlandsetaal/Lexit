class Lists {

	sFormContainerId;

	constructor(sFormId){

		this.sFormContainerId  = sFormId;
	}




	// ------------------------------------------
	// 					CACHE
	// ------------------------------------------

	// Cache of the lists.getDataTableObjectOf() function
	// This contains DataTable objects of the form's lists
	hFormAndList2DataTable = new Hashtable();

	// Cache of the lists.getAllColumns() function 
	// This contains the columns of the form's lists
	hListTable2Cols = new Hashtable();

	// from [form list label] To [form ID] 
	hFormListLabel2formId = new Hashtable();

	// from [form list label] To [feeding table]
	hFormListLabel2tableName = new Hashtable();

	// from [form list label] To [list height]
	hFormListLabel2DisplayHeight = new Hashtable();

	// from [form list label] To [list sort settings]
	hFormListLabel2SortSettings = new Hashtable();


	// Remember which form is the parent of a list etc
	register = function(sFormListLabel, sTableToFeedListWith, sDisplayHeight, oSortSettings){
	
		//hFormListLabel2formId.put( sFormListLabel, sFormContainerId );
		hFormListLabel2tableName.put( sFormListLabel, sTableToFeedListWith );
		hFormListLabel2DisplayHeight.put( sFormListLabel, sDisplayHeight );
		hFormListLabel2SortSettings.put( sFormListLabel, oSortSettings );	
	};


	
	// -----------------------------------------------------------------------------------



	// build a list as an HTML table
	//
	buildLists = function(iListNr){

		if (iListNr == null) iListNr = 0;

		var sFormTable = (this.sFormContainerId).replace(/_form$/, "");
		var aAllLists = getListOfListLabels();

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

		var aColumnsToDisplay =	getColumnsToDisplay(oLists, sFormListLabel);
		var sTableNameOfList =	getFeedingTable(sFormListLabel);	
		var sDisplayHeight = 	getDisplayHeight(sFormListLabel);
		var oSortSettings =		getSortSettings(sFormListLabel);



		lists.getAllColumns(sTableNameOfList, function(aAllColumns){

			// get visible columns indexes for DataTable settings

			var aIndexesOfVisibleColumns = new Array();
			for (var i=0; i<aColumnsToDisplay.length; i++){
				
				var iColIndex = $.inArray(aColumnsToDisplay[i], aAllColumns);
				aIndexesOfVisibleColumns.push(iColIndex);
			}
			

			// build the table HTML

			var sFormAndList = 	buildTableId( this.sFormContainerId, sFormListLabel );
			var eTable = $("<table></table>")
				.attr("id", sFormAndList)
				.addClass("display")
				.css("width", "100%");

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
				var eElem = addButtonToListHeader(oButtons, aColumnsToDisplay);

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
			$("#"+buildTableContainerId(sFormContainerId, sFormListLabel))			
				.append(eTable);

			// instantiate a Datatable
			//   WITHOUT header, searching, page length changing, but WITH sorting and paging
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

			

			var oDataTablesConfig = {
				info: false,
				searching: false,
				scrollY: (parseInt(sDisplayHeight) - 30)+"px",
				scrollCollapse: true,
				paging: false,
				order: getDataTableOrder(aAllColumns, oSortSettings),
				autoWidth: false, 
				columnDefs: aColumnDefs,
				"language": {
					"thousands": ".",
					"search": lang.header_main_search,
					"infoEmpty": lang.header_info_empty,
					"emptyTable": lang.empty_table,
					"info": lang.header_x_rows_found,
					"zeroRecords": lang.no_results_modify_your_query,
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
			};
			

			var oTable = $("#"+sFormAndList).DataTable( oDataTablesConfig );
			// save DT object in cache
			hFormAndList2DataTable.put(sFormAndList, oTable);


			// build following list
			if (iListNr+1 < aAllLists.length){
				buildLists(iListNr+1);
			}

		});
		
	};



	// feed a list (= load data from datbase)
	// given a table name and some values to match
	//
	feed = function(sListLabel, aFieldsAndValuesToMatch, fnCallback){

		//var sFormContainerId = 	getFormContainerId(sListLabel);
		var sTableName = 		getFeedingTable(sListLabel);

		var sFormTable = 		form.getFeedingTable(this.sFormContainerId);
		var oTableSettings =    conf.getTableSettings(sFormTable);
		var oFormGrid =         conf.getFormGrid(oTableSettings);
		var oThisList = 		oFormGrid["lists"][sListLabel];
		var oButtons = 			oThisList["buttons"];

		// read the database given a table name and some values to

		// (don't try if we have no values to match, which can happen when a search returned no results = NO ID to match)
		if (Reflect.ownKeys(aFieldsAndValuesToMatch).length > 0){

			getAllColumns(sTableName, function(aAllColumns){

				fn.getRecordsGivenFieldValues(sTableName, aFieldsAndValuesToMatch, 

					function(records){

						// get table object
						
						var sTableId =	buildTableId(this.sFormContainerId, sListLabel);
						var oTable = 	getDataTableObjectOf(sTableId);

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
							addButtonsToRow(oButtons, aRecord);

							// add a row and assign it its database ID
							oTable.row.add(aRecord).node().id = sRowId;
							// draw it
							oTable.draw(false);
						}

						// assign functions to 'show' and 'delete' icons
						assignShowAndDeleteFunction(oTable);

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
	addButtonsToRow = function(oButtons, aRecord){

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



	addButtonToListHeader = function(oButtons, aColumnsToDisplay){
		
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
					var sListTableId = 			getTableIdFromNode(this);
					var oTable = 				getDataTableObjectOf(sListTableId);
					var sThisListLabel = 		getLabelFromNode(this);
					var sThisListTableName =	getFeedingTable(sThisListLabel);
					var aAllColumns = 			getAllColumns(sThisListTableName);


					// if some values of the record to be added
					// have to be copied according to config, do that
					//
					// config must look like:
					// 	"add": {
					//		"copy": { "column_to_feed": {"list_to_get_value_from": "column_to_get_value_from"} } 
					//	}
					if (oAdd["copy"] != null){
						var oCopy = oAdd["copy"];

						var oToBeCopied = {};
						for (var sOneColumnToFeed in oCopy){

							// if a value must be copied, oCopyFrom will contain an array {listlabel: column}
							// but if a column must be skipped instead (t.i. not fed but skipped), oCopyFrom will have a null value
							var oCopyFrom = oCopy[sOneColumnToFeed];

							if (oCopyFrom == null){

								oToBeCopied[sOneColumnToFeed] = null;
							}
							else {

								// this must contain only one pair actually!
								for (var sListToRead in oCopyFrom){ 

									// read from a LIST cell
									if (sListToRead != "form"){
										// get the selected row to copy the values from
										var oSelectedRow = getSelectedRows(sListToRead);
										var iRowNumber = $(oSelectedRow.nodes()).index();
										// read value from that row
										if (iRowNumber < 0){
											fn.message(lang.beware, (lang.formlist_select_a_row_first).replace(/LISTNAME/, sListToRead));
											return true;
										}
										oToBeCopied[sOneColumnToFeed] = getDataFromCell(sListToRead, iRowNumber, oCopyFrom[sListToRead]);
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

						fn.prompt("Add row", aColumnsToDisplay, [], function(resp){

							// First: if we have a list of values to be copied, add those to the record.
							// (in theory, this might replace some values typed in the dialog)
							for (var sOneColumn in oToBeCopied){
								resp[sOneColumn] = oToBeCopied[sOneColumn];
							}

							// build record to insert
							var aRecord = new Array();
							for (var j=0; j<aAllColumns.length; j++){

								var sColumnName = aAllColumns[j];
								var valToAssign = resp[sColumnName];
								aRecord.push( valToAssign != null ? valToAssign : "_NULL_");
							}
							

							// add column for 'show' and 'delete' buttons
							addButtonsToRow(oButtons, aRecord);

							// add record
							var nNewNode = oTable.row.add(aRecord).node();
							// mark it as 'added'
							$(nNewNode).addClass("added");
							// draw it
							oTable.draw(false);

							// editability
							form.makeListEditable(sThisListLabel, sThisListTableName);

							// assign functions to 'show' and 'delete' icons
							assignShowAndDeleteFunction(oTable);

							// attract attention from user to send button, which must be pressed 
							// since some content was modified,
							// and show that reset is possible now
																
							//var sFormTable = lists.getFormContainerId(sThisListLabel);
							
							var sFormTable = form.getFeedingTable(this.sFormContainerId);
							form.setSendButtonToSetting(sFormTable, "payattention");
							form.setResetButtonToSetting(sFormTable, "active");
						});

					}				
				})
		}

		return eElem;
	}


	// assign the 'show' and 'delete' functions  
	// to the row buttons
	assignShowAndDeleteFunction = function(oTable){

		$("#"+ getTableIdFromDataTableObject(oTable) ).find(".open,.delete").off();
		$("#"+ getTableIdFromDataTableObject(oTable) ).find(".open,.delete").click(function(){

			var thisCell = this;

			// remember previously selected row, so as to be able to restore it if needed
			var previouslySelected = $( $(thisCell).closest("table")[0] ).find("tr.selected");

			// remove previous row selection
			// and select the row we just clicked
			$( previouslySelected ).removeClass("selected");
			$( $(thisCell).closest("tr")[0] ).addClass("selected");

			
			var sThisTable = 		form.getFeedingTable(thisCell);
			var sThisListLabel = 	getLabelFromNode(thisCell);
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
							var sTableId =		buildTableId(sThisTable+"_form", sListToCall);
							var sContainerId = 	buildTableContainerId(sThisTable+"_form", sListToCall);

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
								feed(sListToCall,  aColsAndVals);

								// make it editable
								setTimeout(function(){
									form.makeListEditable(sListToCall, getFeedingTable(sListToCall));
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
															
						var sFormTable = getFormContainerId(sThisListLabel);
						sFormTable = form.getFeedingTable(sFormTable);
						form.setSendButtonToSetting(sFormTable, "payattention");
						form.setResetButtonToSetting(sFormTable, "active");
					}
				}
			}						
		});
	};


	// set table order the DataTable way
	// given an associative array like {col1: asc/desc, ...}
	getDataTableOrder = function(aColumns, oSortSettings){

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
	getListOfListLabels = function(){

		var aListOfLists = hFormListLabel2formId.keys();
		return aListOfLists;
	};

	/**
	 * Get the configuration of a list, given any node inside it
	 * @param {Node} a node in the list
	 * @returns {Array} an associative array, specifying the configuration of the list 
	 */
	getConfig = function(elem){

		// list div has ID like 'formview_list_<LISTNAME>'

		// get the form table
		// and retrieve its config
		var sTableOfFrom = 		form.getFeedingTable(elem);
		var oTableSettings =	conf.getTableSettings(sTableOfFrom);
		var oFormGrid = 		conf.getFormGrid(oTableSettings);

		// get the list label
		// and retrieve its config in the form config
		var sListLabel =	getLabelFromNode(elem);
		var aList = 		oFormGrid["lists"];
		return aList[sListLabel];
	};


	// list label => list height
	/**
	 * Get the height of a list, as set in the configuration
	 * @param {String} the label of a list
	 * @returns {String} the list height to be rendered 
	 */
	getDisplayHeight = function(sFormListLabel){
		return hFormListLabel2DisplayHeight.get(sFormListLabel);
	};
	/**
	 * Get the sort settings of a list, as set in the configuration
	 * @param {String} the label of a list
	 * @returns {String} the sort settings to be applied 
	 */
	getSortSettings = function(sFormListLabel){
		return hFormListLabel2SortSettings.get(sFormListLabel);
	};



	// --------------------------------------------
	// retrieve the FEEDING TABLE NAME 
	// --------------------------------------------

	getFeedingTable = function(sFormListLabel){
		return hFormListLabel2tableName.get(sFormListLabel);
	};


	// --------------------------------------------
	// retrieve the FEEDING TABLE OBJECT
	// --------------------------------------------


	/**
	 * Get the DataTable object underlying a list
	 * @param {String} name of the table underlying the list
	 * @returns {API-object-instance} DataTable object underlying a list
	 */
	getDataTableObjectOf = function(sTableId){
		
		var oTable = hFormAndList2DataTable.get(sTableId);
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
	getTableIdFromNode = function(nNode){
		var sListContainerId = $(nNode).closest('div.formview_list')[0].id;
		return sListContainerId.replace(/_container$/, "");
	};


	/**
	 * Get the ID representing both form and list label of a list, given the list's container ID
	 * @param {String} the list container ID  
	 * @returns {String} the id of the list's table
	 */
	getTableIdFromContainerId = function(sContainerId){
		return sContainerId.replace(/_container$/, "");
	};


	/**
	 * Get the id of the table a DataTable object is about
	 * @param {API-object-instance} DataTable object underlying a list
	 * @returns {String} the id of the list's table
	 */
	getTableIdFromDataTableObject = function(oTable){
		
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
	getContainerIdFromNode = function(nNode){
		var sThisContainerId = $(nNode).closest('div.formview_list')[0].id;
		return sThisContainerId;
	};


	// --------------------------------------------
	// retrieve the form CONTAINER ID
	// --------------------------------------------


	/**
	 * Get the form container ID, given the label of any list in the form
	 * @param {String} sFormListLabel 
	 * @returns {String} ID of the form (that should have the form [feeding-table] + ['_form'-suffix])
	 */
	getFormContainerId = function(sFormListLabel){
		return hFormListLabel2formId.get(sFormListLabel);
	}


	// --------------------------------------------
	// retrieve the LABEL of a list
	// --------------------------------------------

	/**
	 * Get the list label the a DataTable object is about
	 * @param {API-object-instance} DataTable object underlying a list
	 * @returns {String} the label of the list
	 */
	getLabelFromDataTableObject = function(oTable){
		
		return (getTableIdFromDataTableObject(oTable)).split("___")[1];
	}

	/**
	 * Get the label of a list, given a node inside it
	 * @param {Node} any node in a list
	 * @returns {String} the label of the list  
	 */
	getLabelFromNode = function(nNode){
		var sContainerId = getContainerIdFromNode(nNode);
		return getLabelFromContainerId(sContainerId);
	};

	/**
	 * Get the label of a list, given its container ID
	 * @param {String} sContainerId 
	 * @returns {String} the label of the list
	 */
	getLabelFromContainerId = function(sContainerId){
		var sThisListLabel = sContainerId.split("___");
		return (sThisListLabel[1]).replace(/_container$/, "");
	};





	// --------------------------------------------
	// COLUMNS functions
	// --------------------------------------------


	/**
	 * Get the list of columns that are set to be visible in the form config
	 * @param {Array} the lists object, an associative array associating list labels to list configurations
	 * @param {String} the label of the list we want to get the columns' list of
	 * @returns {Array} a list of column names 
	 */
	getColumnsToDisplay = function(oLists, sListLabel){

		var aTableColumnsConfig = oLists[sListLabel]["table"]["columns"];

		// columns
		var aColumnsToDisplay = new Array();
		for (var sColumnName in aTableColumnsConfig){
			var bVisible = aTableColumnsConfig[sColumnName]["visible"];
			if (bVisible != false) aColumnsToDisplay.push(sColumnName);
		}
		return aColumnsToDisplay;
	};


	/**
	 * Get the list of columns named in the form config
	 * @param {Array} the lists object, an associative array associating list labels to list configurations 
	 * @param {String} the label of the list we want to get the columns' list of 
	 * @returns {Array} a list of column names
	 */
	getColumnsToUse = function(oLists, sListLabel){

		var aTableColumnsConfig = oLists[sListLabel]["table"]["columns"];

		// columns
		var aColumnsToDisplay = new Array();
		for (var sColumnName in aTableColumnsConfig){
			aColumnsToDisplay.push(sColumnName); 
		}
		return aColumnsToDisplay;
	};


	/**
	 * Get the list of (both visible and unvisible) columns of a list 
	 * (from the database at first call; and from call at following calls)
	 * @param {String} name of the table underlying the list 
	 * @param {Function} a callback function which processed the response 
	 */
	getAllColumns = function(sSomeTableName, fnCallback){

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
					"db_name": getHttpParams().get("db") 
					},
				dataType: "xml",
				contentType: "application/x-www-form-urlencoded;charset=UTF-8",
				success: function(xml) {
					
					var aColumns = new Array();
					$(xml).find("column").each(function(){
						aColumns.push( $(this).find("column_name").text() );
					});

					hListTable2Cols.put(sSomeTableName, aColumns);

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



	// --------------------------------------------
	// CELLS functions
	// --------------------------------------------

	/**
	 * Read the value of a cell in a list
	 * @param {String} label of the list
	 * @param {(Integer|Node)} node of a cell, or row number where it is to be found in the list (in this casem a column name must be provided)
	 * @param {String} [sColName=null] column name of the cell (only needed when second parameter is a Node)
	 * @returns {String} value of the cell
	 */
	getDataFromCell = function(sListLabel, mMixed, sColName){

		// get the DataTable object of the list
		var sFormContainerId = 	getFormContainerId(sListLabel);
		var sThisListTableId = 	buildTableId(sFormContainerId, sListLabel);
		var oTable = 			getDataTableObjectOf(sThisListTableId);

		// we have 2 possible inputs: 
		// 1. a row-number + a cell name
		// or
		// 2. a cell node
		
		// 1: row number
		if (typeof mMixed == 'number'){

			var iRowNumber = mMixed;
			var sListTableName = 	getFeedingTable(sListLabel);
			var aAllColumns = 		getAllColumns(sListTableName)

			var colNr = $.inArray(sColName, aAllColumns);
			var oRowData = oTable.row( iRowNumber ).data();
			return oRowData[colNr];
		}
		// 2: cell node
		else {
			var oRowData = oTable.cell( mMixed ).data();
			return oRowData;
		}

		// otherwise
		return null;
	};


	/**
	 * Set the value of a cell in a list
	 * @param {String} label of the list 
	 * @param {Node} node of a cell 
	 * @param {String} value to assign to the cell 
	 */
	setDataInCell = function(sListLabel, nCell, sValue){

		// get the DataTable object of the list
		//var sFormContainerId =	lists.getFormContainerId(sListLabel);
		var sFormTable =		form.getFeedingTable(this.sFormContainerId);
		var sThisListTableId =	buildTableId(this.sFormContainerId, sListLabel);
		var oTable = 			getDataTableObjectOf(sThisListTableId);
		
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
	getSelectedRows = function(sListLabel){

		// get the DataTable object of the list
		var sFormContainerId =	getFormContainerId(sListLabel);
		var sThisListTableId =	buildTableId(sFormContainerId, sListLabel);
		var oTable = 			getDataTableObjectOf(sThisListTableId);

		return oTable.rows(".selected");
	};


	/**
	 * Select a particular row in a list, given its id
	 * @param {String} label of the list 
	 * @param {String} id of the row (primary key in database terms) 
	 */
	selectRow = function(sListLabel, sRowId){

		// get the DataTable object of the list
		var sFormContainerId = getFormContainerId(sListLabel);
		var sThisListLabelId = buildTableId(sFormContainerId, sListLabel);
		var eRow = $("#"+sThisListLabelId).find("tr#"+sRowId);
		if ( !eRow.hasClass("selected"))
			eRow.addClass("selected");
	};

	/**
	 * Programmatically click on the 'open' icon in the currently selected row of a list
	 * @param {String} label of the list 
	 */
	clickOpenInSelectedRow = function(sListLabel){

		// get the DataTable object of the list
		//var sFormContainerId = lists.getFormContainerId(sListLabel);
		var sFormAndListLabelId = lists.buildTableId(this.sFormContainerId, sListLabel);
		$("#"+this.sFormAndListLabelId).find("tr.selected").find("img.open").click();
	};


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
	buildTableContainerId = function(sListLabel ){
		return buildTableId(this.sFormContainerId, sListLabel) + "_container";
	};


	/**
	 * Build the id of a list table, given the form id and the list label.
	 * The id to be built is like 'FORM_ID___LISTLABEL'
	 * (where FORM_ID is the name of the table underlying the form, to which the string '_form' is appended).
	 * @param {String} id of the form container 
	 * @param {String} label of the list 
	 * @returns {String} the DIV id 
	 */
	buildTableId = function(sFormContainerId, sListLabel ){
		return sFormContainerId+"___"+sListLabel.toLowerCase().replace(/ /g, "_");
	};

};