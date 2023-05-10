/**
 * lists for form view
 * 
 * A list is filled with the content of a table matching some values
 */



var lists = {};


// form [form list] To [DataTable object]
formListsDataTables = new Hashtable();

// form [form list] To [table column list]
formListsTableCols = new Hashtable();

// form [form list] To [form ID]
formListLabel2formId = new Hashtable();
formListLabel2tableName = new Hashtable();
formListLabel2ColumnsToDisplay = new Hashtable();
formListLabel2DisplayHeight = new Hashtable();
formListLabel2SortSettings = new Hashtable();


// remember which form is the parent of a list
lists.register = function(sFormListLabel, sFormId, sTableToFeedListWith, aColumnsToDisplay, sDisplayHeight, oSortSettings){
	
	formListLabel2formId.put( sFormListLabel, sFormId );
	formListLabel2tableName.put( sFormListLabel, sTableToFeedListWith );
	formListLabel2ColumnsToDisplay.put( sFormListLabel, aColumnsToDisplay );
	formListLabel2DisplayHeight.put( sFormListLabel, sDisplayHeight );
	formListLabel2SortSettings.put( sFormListLabel, oSortSettings );	
}
// read the id of the form of a list is part of
// given the list label
lists.getFormIdFormListLabel = function(sFormListLabel){
	return formListLabel2formId.get(sFormListLabel);
}
lists.getTableNameFormListLabel = function(sFormListLabel){
	return formListLabel2tableName.get(sFormListLabel);
}
lists.getTableNameFormListLabel = function(sFormListLabel){
	return formListLabel2tableName.get(sFormListLabel);
}
lists.getColumnsToDisplay = function(sFormListLabel){
	return formListLabel2ColumnsToDisplay.get(sFormListLabel);
}
lists.getDisplayHeight = function(sFormListLabel){
	return formListLabel2DisplayHeight.get(sFormListLabel);
}
lists.getSortSettings = function(sFormListLabel){
	return formListLabel2SortSettings.get(sFormListLabel);
}
lists.getListOfLists = function(){
	return formListLabel2formId.keys();
}



// build a list as an HTML table
//
lists.buildLists = function(iListNr){

	if (iListNr == null) iListNr = 0;

	var aAllLists = lists.getListOfLists();
	var sFormListLabel = aAllLists[iListNr];


	var sFormId =			lists.getFormIdFormListLabel(sFormListLabel);
	var sFormTable = 		sFormId.replace(/_form$/, ""); // table of the form
	var oTableSettings =    conf.getTableSettings(sFormTable);
	var oFormGrid =         conf.getFormGrid(oTableSettings);
	var oThisList = 		oFormGrid["lists"][sFormListLabel];
	var oButtons = 			oThisList["buttons"];

	var sTableNameOfList =	lists.getTableNameFormListLabel(sFormListLabel);
	var aColumnsToDisplay =	lists.getColumnsToDisplay(sFormListLabel);
	var sDisplayHeight = 	lists.getDisplayHeight(sFormListLabel);
	var oSortSettings =		lists.getSortSettings(sFormListLabel);



	lists.getAllColumns(sTableNameOfList, function(aAllColumns){

		// get visible columns indexes for DataTable settings

		var aIndexesOfVisibleColumns = new Array();
		for (var i=0; i<aColumnsToDisplay.length; i++){
			
			var iColIndex = $.inArray(aColumnsToDisplay[i], aAllColumns);
			aIndexesOfVisibleColumns.push(iColIndex);
		}
		

		// build the table HTML

		var sTableId = form.buildListTableId(sFormId, sFormListLabel);
		var eTable = $("<table></table>")
			.attr("id", sTableId)
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
			var eElem = lists.addButtonToListHeader(oButtons, aColumnsToDisplay);

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

		// append the table to some div
		// (usually in a div in a formgrid)
		$("#"+sTableId+"_div").append(eTable);

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
			order: lists.getDataTableOrder(aColumnsToDisplay, oSortSettings),
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
		

		var oTable = $("#"+sTableId).DataTable( oDataTablesConfig );
		//console.log("set "+sTableId);
		formListsDataTables.put(sTableId, oTable);


		// build following list
		if (iListNr+1 < aAllLists.length){
			lists.buildLists(iListNr+1);
		}

	});
	
}



// feed a list (= load data from datbase)
// given a table name and some values to match
//
lists.feedList = function(sListLabel, aFieldsAndValuesToMatch, fnCallback){

	

	var sFormId = 		lists.getFormIdFormListLabel(sListLabel);
	var sTableName = 	lists.getTableNameFormListLabel(sListLabel);

	var sFormTable = sFormId.replace(/_form$/, ""); // table of the form
	var oTableSettings =    conf.getTableSettings(sFormTable);
	var oFormGrid =         conf.getFormGrid(oTableSettings);
	var oThisList = 		oFormGrid["lists"][sListLabel];
	var oButtons = 			oThisList["buttons"];

	// read the database given a table name and some values to

	// (don't try if we have no values to match, which can happen when a search returned no results = NO ID to match)
	if (Reflect.ownKeys(aFieldsAndValuesToMatch).length > 0){

		lists.getAllColumns(sTableName, function(aAllColumns){

			fn.getRecordsGivenFieldValues(sTableName, aFieldsAndValuesToMatch, 

				function(records){

					//console.log(records);

					// get table object
					//console.log("lists.feedList");
					
					var sTableId = form.buildListTableId(sFormId, sListLabel);
					var oTable = lists.getListObjectOf(sTableId);

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

				var sThisForm = ($(this).closest('div.formgrid')[0].id).replace(/_form$/, "");
				var sThisListLabelId = ($(this).closest('div.formview_list')[0].id).replace(/_div$/, "");
				var oTable = formListsDataTables.get(sThisListLabelId);
				var sThisListLabel = sThisListLabelId.split("___")[1];
				var sThisListTableName = 	lists.getTableNameFormListLabel(sThisListLabel);
				var aAllColumns = formListsTableCols.get(sThisListTableName);


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
						// but if a column must be skipped instead (t.i. not fed but skipped), oCopyFrom will have s null value
						var oCopyFrom = oCopy[sOneColumnToFeed];

						if (oCopyFrom == null){

							oToBeCopied[sOneColumnToFeed] = null;
						}
						else {

							// this must contain only one pair actually!
							for (var sListToRead in oCopyFrom){ 

								// read from a list cell
								if (sListToRead != "form"){
									// get the selected row to copy the values from
									var oSelectedRow = lists.getSelectedRowsFromList(sListToRead);
									var iRowNumber = $(oSelectedRow.nodes()).index();
									// read value from that row
									oToBeCopied[sOneColumnToFeed] = lists.getDataFromCellInList(sListToRead, iRowNumber, oCopyFrom[sListToRead]);
								}									
								// or read from a form cell
								else {
									oToBeCopied[sOneColumnToFeed] = form.getDataFromCell(sThisForm, oCopyFrom[sListToRead]);
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
						lists.addButtonsToRow(oButtons, aRecord);

						// add record
						var nNewNode = oTable.row.add(aRecord).node();
						// mark it as 'added'
						$(nNewNode).addClass("added");
						// draw it
						oTable.draw(false);

						// editability
						form.makeListEditable(sThisListLabel, sThisListTableName)

						// assign functions to 'show' and 'delete' icons
						lists.assignShowAndDeleteFunction(oTable);

						// attract attention from user to send button, which must be pressed 
						// since some content was modified,
						// and show that reset is possible now
															
						var sFormTable = lists.getFormIdFormListLabel(sThisListLabel);
						sFormTable = sFormTable.replace(/_form$/, "");
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
lists.assignShowAndDeleteFunction = function(oTable){

	$("#"+ lists.getDataTableId(oTable) ).find(".open,.delete").off();
	$("#"+ lists.getDataTableId(oTable) ).find(".open,.delete").click(function(){

		var thisCell = this;

		// remove previous row selection
		// and select the row we just clicked
		$( $(thisCell).closest("table")[0] ).find("tr").removeClass("selected");
		$( $(thisCell).closest("tr")[0] ).addClass("selected");

		
		var sThisTable = ($(this).closest('div.formgrid')[0].id).replace(/_form$/, "");
		var sThisListLabel = (($(this).closest('div.formview_list')[0].id).split("___")[1]).replace(/_div$/, "");
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

					// if the row has an empty id, we've nothing to look up in other lists or so
					if (sRowId == null || sRowId == ''){

						fn.message(lang.beware, lang.formlist_save_first_after_row_creation);
					}
					else {

						for (var sListToCall in oDo){
							var aColsAndVals = new Array();
							aColsAndVals[ oDo[sListToCall] ] = sRowId;
							
							lists.feedList(sListToCall,  aColsAndVals);
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
														
					var sFormTable = lists.getFormIdFormListLabel(sThisListLabel);
					sFormTable = sFormTable.replace(/_form$/, "");
					form.setSendButtonToSetting(sFormTable, "payattention");
					form.setResetButtonToSetting(sFormTable, "active");
				}
			}
		}						
	});
};


// set table order the DataTable way
// given an associative array like {col1: asc/desc, ...}
lists.getDataTableOrder = function(aColumnsToDisplay, oSortSettings){

	var aDataTableOrder = 	new Array();	
	
	for (var i=0; i<aColumnsToDisplay.length; i++){

		// get column index, given the column name
		var sColName = aColumnsToDisplay[i];		
		var iColIndex = $.inArray(sColName, aColumnsToDisplay);
		
		if (oSortSettings[sColName] != null){
			aDataTableOrder.push([ iColIndex, oSortSettings[sColName] ]);
		}
	}	
	return aDataTableOrder;
}


// get columns of a list from the database
lists.getAllColumns = function(sSomeTableName, fnCallback){

	if (formListsTableCols.get(sSomeTableName) != null){

		if (fnCallback != null){
			fnCallback(formListsTableCols.get(sSomeTableName));
		}
		else {
			return formListsTableCols.get(sSomeTableName);
		}
		
	}
	else {

		var url = WEBSERV_URL+"/table/getcolumns";	
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

				formListsTableCols.put(sSomeTableName, aColumns);

				if (fnCallback != null){
					fnCallback(aColumns);
				}
				else {
					return aColumns;
				}
			}
		});
	}	
}


lists.getListObjectOf = function(sTableId){

	//if ( !$.startsWith(sTableId, "formview_list_"))
	//	sTableId = "formview_list_"+sTableId;
	
	var oTable = formListsDataTables.get(sTableId);
	//console.log("read "+sTableId);
	//console.log("oTable = "+oTable);
	return oTable;
}

lists.getDataTableId = function(oTable){
	return oTable.table().node().id;
}


// read value of a cell in a list
//
lists.getDataFromCellInList = function(sListLabel, iRowNumber, sColName){

	// get the DataTable object of the list
	var sFormId = lists.getFormIdFormListLabel(sListLabel);
	var sThisListLabelId = form.buildListTableId(sFormId, sListLabel);
	var oTable = formListsDataTables.get(sThisListLabelId);

	var sListTableName = 	lists.getTableNameFormListLabel(sListLabel);
	var aAllColumns = formListsTableCols.get(sListTableName)


	var colNr = $.inArray(sColName, aAllColumns);
	var oRowData = oTable.row( iRowNumber ).data();
	var sOutput = oRowData[colNr];

	return sOutput;
}

lists.getSelectedRowsFromList = function(sListLabel){

	// get the DataTable object of the list
	var sFormId = lists.getFormIdFormListLabel(sListLabel);
	var sThisListLabelId = form.buildListTableId(sFormId, sListLabel);
	var oTable = formListsDataTables.get(sThisListLabelId);

	return oTable.rows(".selected");
}


