/**
 * form view
 */



var form = {};


// ##################################################

var iWait = 500;  // need to fix that to init of view, just quick and dirty now

// ##################################################






// icons/colors of buttons

form.reset_button_color_active = "#F5BCA9";
form.reset_button_color_neutral = "#DDDDDD";
form.send_button_color_neutral = "#DDDDDD";
form.send_button_color_payattention = "red";
form.send_button_color_alliswel = "#D8F781";

form.reset_button_icon_active = "ui-icon ui-icon-arrowreturnthick-1-w";
form.reset_button_icon_neutral = "ui-icon ui-icon-close";
form.send_button_icon_neutral = "ui-icon ui-icon-disk";
form.send_button_icon_payattention = "ui-icon ui-icon-alert";
form.send_button_icon_alliswel = "ui-icon ui-icon-check";



// give the undo/reset-button a special background-color etc. 
// given a given status (parameter: sSetting)
//
form.setResetButtonToSetting = function(sTableName, sSetting){

	// default is neutral
	var sColor = "#000000";
	var sBgColor = form.reset_button_color_neutral;
	var sIcon = form.reset_button_icon_neutral;

	// otherwise
	if (sSetting == 'active'){
		sBgColor = form.reset_button_color_active;	
		sIcon = form.reset_button_icon_active;
	}

	$("#"+sTableName+"_formsbuttons #reset_button")
		.css("background-color", sBgColor);
	$("#"+sTableName+"_formsbuttons #reset_button")
		.find("span:eq(0)")
		.css("color", sColor);

	$("#"+sTableName+"_formsbuttons #reset_button")
		.find("span:eq(1)")
		.remove();
	$("#"+sTableName+"_formsbuttons #reset_button")
		.append( 
			$("<span></span>").addClass(sIcon) 
		);
}



// set the save/send-button a special background-color etc. 
// given a given status (parameter: sSetting)
//
form.setSendButtonToSetting = function(sTableName, sSetting){

	// default is neutral
	var sColor = "#000000";
	var sBgColor = form.send_button_color_neutral;
	var sIcon = form.send_button_icon_neutral;
	

	// otherwise
	if (sSetting == 'payattention'){
		sColor = "white";
		sBgColor = form.send_button_color_payattention;	
		sIcon = form.send_button_icon_payattention;

		if ( !$("#"+sTableName+"_formsbuttons #send_button").hasClass("payattention")){

			// add blink function for send_button
			var blink = function(elem) {

				$(elem).animate({
						opacity: '0'
					}, function(){			
						$(this).animate({
							opacity: '1'
						}, function(){
							if ( $(elem).hasClass("payattention") )
								blink(elem);
						});
					});		
			};

			blink( $("#"+sTableName+"_formsbuttons #send_button").get(0) );
		}

		$("#"+sTableName+"_formsbuttons #send_button").addClass("payattention");
	}
	else if (sSetting == 'alliswel'){
		sBgColor = form.send_button_color_alliswel;
		sIcon = form.send_button_icon_alliswel;
		
		if ( $("#"+sTableName+"_formsbuttons #send_button").hasClass("payattention")){
			$("#"+sTableName+"_formsbuttons #send_button").removeClass("payattention");
		}
	}
	else {
		if ( $("#"+sTableName+"_formsbuttons #send_button").hasClass("payattention")){
			$("#"+sTableName+"_formsbuttons #send_button").removeClass("payattention");
		}
	}

	$("#"+sTableName+"_formsbuttons #send_button")
		.css("background-color", sBgColor);
	$("#"+sTableName+"_formsbuttons #send_button")
		.find("span:eq(0)")
		.css("color", sColor);

	$("#"+sTableName+"_formsbuttons #send_button")
		.find("span:eq(1)")
		.remove();
	$("#"+sTableName+"_formsbuttons #send_button")
		.append( 
			$("<span></span>").addClass(sIcon) 
		);


	
}



// build the searchboxes for the form
//
form.buildSearchAndSortBar = function(eSearchDiv, sTableName, oFormGrid, iGridWidthUnit){

	// ------------------------------------------
	// add search/sort div 
	// ------------------------------------------

	eSearchDiv.append(
		$("<table></table>")
			.attr("id", sTableName+"_search_and_sort_table")
			.css("margin", "auto")
			.css("min-width", "50%")
	);

	$("#"+sTableName+"_search_and_sort_table")
		.append("<tr></tr>")  // #1 : sort row
		.append("<tr></tr>"); // #2 : search row


	// ------------------------------------------
	// add the search/sort cells 
	// ------------------------------------------

	// get visible columns
	var aSearchFields = 			mt.getListOfVisibleColumnsOf(sTableName);
	var aSearchFieldsNiceNames = 	fn.getListOfColumnsNiceNames(sTableName);

	var aTinySearchFields = [];
	var aTinySearchFieldsNiceNames = [];



	// --------------------------------------
	// cells loop
	// --------------------------------------

	var oCells =  oFormGrid["cells"];
	for (var sCellName in oCells){

		var iNameIndex = $.inArray(sCellName, aSearchFields);
		if (iNameIndex<0) continue;
		aTinySearchFields.push(sCellName);
		var sNiceName = aSearchFieldsNiceNames[iNameIndex];
		aTinySearchFieldsNiceNames.push( sNiceName );

		// --------------------------------------
		// add sort button
		// --------------------------------------

		$("#"+sTableName+"_search_and_sort_table tr:eq(0)")
			.append(
				$("<td></td>")
					.css("width", iGridWidthUnit+"px")
					.css("text-align", "center")
					.append(
						$("<span></span>")
							.css("font-weight", "bold")
							.css("padding-right", "18px")
							.text(sNiceName)
							.addClass( form.getSortingModeOfTableColumn(sTableName, sCellName) )
							.attr("id", sCellName)
							.click(function(e){

								var eFormSortCol = $(this);
								var bShiftClicked = e.shiftKey;
								var sThisCellName = eFormSortCol.attr("id");
								var eSortTh = $("#"+sTableName+"_wrapper div.dataTables_scrollHeadInner table.display.dataTable thead tr:eq(0)").find("th."+sTableName+"."+sThisCellName);

								// add callback to update the sort classes after sorting was triggered
								fn.addDrawCallback(sTableName, function(){

									setTimeout(function(){
										form.synchronizeSorting(sTableName);
									}, 500);
									

								});

								// click sort column to trigger new sorting
								// and take shift press into account (for secondary sort)
								//
								// trick: https://stackoverflow.com/questions/28895866/shift-mouse-click-trigger
								var shiftClick = jQuery.Event("click");
								shiftClick.shiftKey = bShiftClicked;
								eSortTh.trigger(shiftClick);
								
							})
					)
			);


		// --------------------------------------
		// add searchboxes
		// --------------------------------------

		// build a new cell ...
		$("#"+sTableName+"_search_and_sort_table tr:eq(1)")
			.append( $("<td></td>") );

		// ... and copy the original Lex'it searchsearch to this new cell
		$("#"+sTableName+"_wrapper div.dataTables_scrollHeadInner table#"+sTableName+"_searchboxes tr:eq(0) td")
			.find("#"+sTableName+"_searchbox_"+sCellName)
			.clone()
			.appendTo("#"+sTableName+"_search_and_sort_table tr:eq(1) td:last");

		// if we have a checkbox, add default background color
		if ($("#"+sTableName+"_search_and_sort_table tr:eq(1) td:last").find("input").attr("cycle_value") != null){
			$("#"+sTableName+"_search_and_sort_table tr:eq(1) td:last").css("background-color", "#DDDDDD").css("border", "1px solid #FFFFFF");
		}


		// assign it the grid width unit (same width for each)
		var factor = oFormGrid["searchbox_width_factor"] != null ? parseInt( oFormGrid["searchbox_width_factor"] ) : 1;
		$("#"+sTableName+"_search_and_sort_table tr:eq(1) td:last")
			.css("width", (factor * iGridWidthUnit) +"px")
			.css("text-align", "center");



		// --------------------------------------
		// add handlers for searchboxes
		// --------------------------------------

		// input KEYUP handler
		
		$("#"+sTableName+"_search_and_sort_table tr:eq(1) td input")
			.keyup(function(e){
				var sId = $(this).attr("id");
				var sVal = $(this).val();
				kf.registerPressedKey(e);

				// trigger search when enter was pressed
				if (kf.isPressed("enter")) {
					sf.startMultiColumnSearch(sTableName);					
				}
				// otherwise just update the text value
				else {
					$("#"+sTableName+"_wrapper div.dataTables_scrollHeadInner table#"+sTableName+"_searchboxes tr:eq(0) td")
						.find("input#"+sId)
						.val(sVal);
				}
			});

		// checkbox handler

		$("#"+sTableName+"_search_and_sort_table tr:eq(1) td")
			.click(function(e){

				var thisCell = $(this);
				var thisCheckBox = thisCell.find("input");
				if ( thisCheckBox.attr("cycle_value") == null)
					return;

				var sId = thisCheckBox.attr("id");

				// add callback for updating color and checked attributes after table search
				fn.addDrawCallback(sTableName, function(){
					setTimeout(function(){

						var eSelector = $("#"+sTableName+"_wrapper div.dataTables_scrollHeadInner table#"+sTableName+"_searchboxes tr:eq(0) td")
							.find("input#"+sId);
						var iCycleVal = eSelector.attr("cycle_value");
						var bChecked = eSelector.prop("checked");
						var sBackground = iCycleVal != 0 ? eSelector.parent().css("background-color") : "#DDDDDD";

						thisCheckBox
							.attr("cycle_value", iCycleVal)							
							.prop("checked", bChecked);
						
						thisCell
							.css("background-color", sBackground);

					}, 500);
				});
				
				// trigger search by clicking the checkbox
				$("#"+sTableName+"_wrapper div.dataTables_scrollHeadInner table#"+sTableName+"_searchboxes tr:eq(0) td")
					.find("input#"+sId)
					.click();

			});

		// select handler

		$("#"+sTableName+"_search_and_sort_table tr:eq(1) td select")
			.change(function(e){
				var sVal = $(this).find(":selected").val();				
				var sId = $(this).attr("id");
				
				// trigger search by setting new selected value
				$("#"+sTableName+"_wrapper div.dataTables_scrollHeadInner table#"+sTableName+"_searchboxes tr:eq(0) td")
						.find("select#"+sId)
						.val(sVal)
						.trigger("change");
			});
		
	}

};



// Build a form view
//
// The expected configuration in the config.js file:
//
//   tablename: {
//        formgrid: {
//				  bgcolor: "#......",				
//                size: [600, 250],		// size in pixels
//                definition: [x, y],	// definition of the grid : [number of columns] X [number of rows]
//                cells: {
//                        col1: {
//                              position: [1, 1],	// position of the cell in the grid : [column number, row number]
//                              definition: [1, 3]	// definition of the cell : [number of columns] X [number of rows]
//                        },
//                        col2: {
//								...
//                        }
//                }
//        }
//   }
//
form.buildViewGrid = function(sTableName){

	// get configuration
	var oTableConfig = 		conf.getTableConfig(sTableName);
	var oTableSettings =    conf.getTableSettings(sTableName);
	var oFormGrid =         conf.getFormGrid(oTableSettings);
	if (oFormGrid == null) return;

	// set 1-row mode at current table row position
	var iNowIndex = fn.getCurrentDisplayStart(sTableName);
	mt.getDataTableObjectOf(sTableName).page.len(1);
	mt.getDataTableObjectOf(sTableName).displayRow(iNowIndex);

	// get column names
	var aSearchFields = form.getListOfVisibleColumnsOf(sTableName);
	var aSearchFieldsNiceNames = form.getListOfColumnsNiceNames(sTableName);

	// ------------------------------------------
	// form layout
	// ------------------------------------------

	// get pixel size
	var aSize =             oFormGrid["size"];
	var iFormWidth = 		parseInt(aSize[0]);
	var iFormHeight = 		parseInt(aSize[1]);
	

	// get table size (the form grid pixel size must fit into it)	
	var iTableWidth = parseInt( $( "#"+sTableName+"_dynamic" ).css("width") );
	var iTableHeight = parseInt( $( "#"+sTableName+"_dynamic" ).css("height") );
	if (iFormWidth > iTableWidth ) iFormWidth = iTableWidth;
	if (iFormHeight > iTableHeight ) iFormWidth = iTableHeight;

	var sFormPositionSetting = oFormGrid["align"];
	var sFormPosPix = (iTableWidth - iFormWidth)/2; //default: center
	if (sFormPositionSetting == null ||  sFormPositionSetting == "left"){
		sFormPosPix = 10;
	}
	else if (sFormPositionSetting == "right"){
		sFormPosPix = (iTableWidth - iFormWidth) - 10;
	}

	
	var iSearchBarHeight = 40;
	var iHeaderHeight = parseInt( $( "#"+sTableName+"_wrapper .top" ).css("height") );

	// search div on top of form
	var eSearchDiv = $("<div></div>")
		.attr("id", sTableName+"_search_and_sort")
		.css("margin", 0)
		.css("position", "relative")
		.css("top", "10px")
		.css("left", sFormPosPix + "px")
		.css("width", iFormWidth +"px")
		.css("height", iSearchBarHeight+"px");
	$( "#"+sTableName+"_wrapper" ).append(eSearchDiv);	
	
	
	// parent element to build form into	
	var sFormId = sTableName+"_form";
	var eFormParent = $("<div></div>")
		.attr("id", sFormId)
		.addClass("formgrid")
		.css("margin", 0)
		.css("position", "relative")
		.css("top", (iSearchBarHeight)+"px")
		.css("left", sFormPosPix + "px")
		.css("width", iFormWidth +"px")	
		.css("height", iFormHeight +"px");
	$( "#"+sTableName+"_wrapper" ).append(eFormParent);
	

	// set form background color
	var sBgColor = oFormGrid["bgcolor"] != null ? oFormGrid["bgcolor"] : "#E6E6E6";
	eFormParent.css("background-color", sBgColor);

	// get definition size
	var aDefinition =       oFormGrid["definition"];
	var iDefWidth = 		aDefinition[0];
	var iDefHeight = 		aDefinition[1];

	// compute cell pixel size
	var iGridWidthUnit = 	iFormWidth / iDefWidth;
	var iGridHeightUnit = 	iFormHeight / iDefHeight;

	// ------------------------------------------
	// add search and sort bar
	// ------------------------------------------

	form.buildSearchAndSortBar(eSearchDiv, sTableName, oFormGrid, iGridWidthUnit);


	// ------------------------------------------
	// keep the normal table view hidden
	// ------------------------------------------

	$("#"+sTableName+"_wrapper > .dataTables_scroll").css("display", "none"); // direct child (otherwise form lists will be hidden too)
	$("#"+sTableName+"_dynamic .bottom_pane").hide();
	$("#"+sTableName+"_dynamic .export_pane").hide();	
	


	// ------------------------------------------
	// cells loop
	// ------------------------------------------

	var oCells =  oFormGrid["cells"];
	for (var sCellName in oCells){

		var oCell = 	oCells[sCellName];
		var aPosition = oCell["position"];
		var aCellSize = oCell["definition"];

		// ------------------------------------------
		// build a label and its content cell attached
		// ------------------------------------------

		var iNameIndex = $.inArray(sCellName, aSearchFields);
		var sNiceName = aSearchFieldsNiceNames[iNameIndex];
		var eCell = $("<div></div>")
				.attr("id", "form_cell_"+sCellName)
				.append(
					$("<span></span>").css("font-weight", "bold").text(sNiceName)
				);
		var eCellField = $("<div></div>")
				.attr("id", "form_cellvalue_"+sCellName);
		$(eFormParent).append(eCell);
		$(eCell).append(eCellField);

		// ------------------------------------------
		// append the correct type of field, given 
		// config, data type, etc.
		// ------------------------------------------

		var oColumnConfig = conf.getColumnConfig(oTableConfig, sCellName);
		var iColumnIndex = $.inArray(sCellName, mt.getListOfColumnsOf(sTableName));
		var sColumnType = mt.getListOfColumnTypesOf(sTableName)[iColumnIndex];

		// Do we have a select box?
		var bCheckBoxType = $.inArray(sColumnType, ["bit varying(1)", "boolean"])>=0;
		// Or do we have a select box?		
		var aSelectBoxValues = conf.getSelectionBox(oColumnConfig);
		if (aSelectBoxValues == null) aSelectBoxValues = mt.getListOfAllowedValuesInColumnsOf(sTableName)[iColumnIndex];
		

		// checkbox

		if (bCheckBoxType){
			eCellField.append(
				$("<input></input>")
					.attr("type", "checkbox")
					.css("padding", "5px")
			);
		}

		// selectbox

		else if (aSelectBoxValues != null && aSelectBoxValues.length>1){			

			var aNewSelectBoxValues = aSelectBoxValues.map((x) => x);
			aNewSelectBoxValues.splice($.inArray("^$", aNewSelectBoxValues), 1);
			var eSelectBox = $("<select></select>")
				.css("padding", "5px");
			for (var i=0; i<aNewSelectBoxValues.length; i++){
				eSelectBox.append(
					$("<option></option>")
						.attr("value", aNewSelectBoxValues[i])
						.text(aNewSelectBoxValues[i])
				)
			}
			eCellField.append(eSelectBox);
		}

		// textbox

		else {
			eCellField.append(
				$("<textarea></textarea>")
					.css("padding", "5px")
			);
		}
		
		

		// ------------------------------------------
		// put the labels/cells at the right positions
		// ------------------------------------------
		$("#"+sTableName+"_wrapper #form_cell_"+sCellName)
				.css("position", "absolute")
				.css("left", (parseFloat(aPosition[0]) * iGridWidthUnit) +"px")
				.css("top", (parseFloat(aPosition[1]) * iGridHeightUnit) +"px");
		$("#"+sTableName+"_wrapper #form_cellvalue_"+sCellName+" textarea")
				.css("width", (parseFloat(aCellSize[0]) * iGridWidthUnit) +"px")
				.css("height", (parseFloat(aCellSize[1]) *iGridHeightUnit) +"px")
				.addClass("formview_textarea");
		
	}


	// =============
	//   Lists
	// =============

	// ------------------------------------------
	// lists loop
	// ------------------------------------------

	var oLists =  oFormGrid["lists"];
	for (var sListLabel in oLists){

		var sListId = 			lists.buildListTableId(sFormId, sListLabel);
		var aListPosition = 	oLists[sListLabel]["position"];
		var aListDefinition =	oLists[sListLabel]["definition"];

		// table to build

		var sTableFeedingList = oLists[sListLabel]["table"]["name"];
		var oSortSettings = 	oLists[sListLabel]["table"]["columns_sorting"];
		var iDisplayLength = 	oLists[sListLabel]["table"]["displaylength"];

		// columns
		var aColumnsToDisplay = form.getListColumnsToDisplay(oLists, sListLabel)

		// build the list div

		var sBgColor = oFormGrid["lists"][sListLabel]["bgcolor"];
		if (sBgColor == null) sBgColor = "#FFFFFF";

		var mainListDiv = $("<div></div>").append(	$("<span></span>").css("font-weight", "bold").text(sListLabel) );
		var listDiv = $("<div></div>")
			.addClass("formview_list")
			.css("background-color", sBgColor)
			.attr("id", sListId+"_div");
		eFormParent.append(mainListDiv);
		mainListDiv.append(listDiv);
		

		// put the list div at right position

		mainListDiv
			.css("position", "absolute")
			.css("left", (parseFloat(aListPosition[0]) * iGridWidthUnit) +"px")
			.css("top", (parseFloat(aListPosition[1]) * iGridHeightUnit) +"px");
		listDiv
			.css("width", (parseFloat(aListDefinition[0]) * iGridWidthUnit) +"px")
			.css("height", (parseFloat(aListDefinition[1]) * iGridHeightUnit) +"px");

		// build the HTML table for the list,
		// attach it to the div,
		// and instantiate it as a Datatable
		lists.register(sListLabel, sFormId, sTableFeedingList, aColumnsToDisplay, (parseFloat(aListDefinition[1]) *iGridHeightUnit) +"px", oSortSettings);
	}

	// now build all lists
	lists.buildLists();


	// =============
	//   BUTTONS
	// =============


	// ------------------------------------------
	// custom buttons loop
	// ------------------------------------------

	var oCustomButtons =  oFormGrid["buttons"];
	for (var sButtonName in oCustomButtons){

		var sButtonId = 		sButtonName.toLowerCase().replace(/ /g, "_");
		var sButtonColor =		oCustomButtons[sButtonName]["color"];
		var sButtonBgColor = 	oCustomButtons[sButtonName]["bgcolor"];
		var aButtonPosition = 	oCustomButtons[sButtonName]["position"];
		var aButtonDefinition =	oCustomButtons[sButtonName]["definition"];
		if (aButtonDefinition == null) aButtonDefinition = [1, 0.5]; // default

		// build button

		var customButton = $("<button>")
			.addClass("formview_button")
			.append( 
				$("<span></span>").css("color", (sButtonColor!=null ? sButtonColor : "white") ).text(sButtonName) 
			)
			.css("background-color", (sButtonBgColor!=null ? sButtonBgColor : "blue") )
			.attr("id", "form_button_"+sButtonId)
			.attr("name", sButtonName)
			.click(function(){

				// retrieve button config by its name
				var sThisButtonName = $(this).attr("name");
				var fnCallback = oCustomButtons[sThisButtonName]["click"]; 
				fnCallback(mt.getDataTableObjectOf(sTableName));
			});
		eFormParent.append(
			$("<div></div>")
				.attr("id", "form_buttondiv_"+sButtonId)
				.append(customButton)
		);

		// put button at right position

		$("#"+sTableName+"_wrapper div#form_buttondiv_"+sButtonId)
			.css("position", "absolute")
			.css("left", (parseFloat(aButtonPosition[0]) * iGridWidthUnit) +"px")
			.css("top", (parseFloat(aButtonPosition[1]) * iGridHeightUnit) +"px");
		$("#"+sTableName+"_wrapper button#form_button_"+sButtonId)
			.css("width", (parseFloat(aButtonDefinition[0]) * iGridWidthUnit) +"px")
			.css("height", (parseFloat(aButtonDefinition[1]) *iGridHeightUnit) +"px");
	}


	// ------------------------------------------
	// buttons for reset or validation
	// ------------------------------------------

	var iButtonDivLeft = iGridWidthUnit;
	var iButtonDivTop = (iFormHeight - iGridHeightUnit);
	if (oFormGrid["buttonsbar_position"] != null){
		iButtonDivLeft = oFormGrid["buttonsbar_position"][0] * iGridWidthUnit;
		iButtonDivTop = oFormGrid["buttonsbar_position"][1] * iGridHeightUnit;
	}  
	var buttondsDiv = $("<div></div>")
		.attr("id", sTableName+"_formsbuttons")
		.css("position", "absolute")
		.css("left", iButtonDivLeft +"px")
		.css("top", iButtonDivTop +"px");

	// ------------------------------------
	// build a RESET button
	// ------------------------------------

	var formResetButton = $("<button>")
		.addClass("formview_button")
		.append( 
			$("<span></span>").css("color", "#000000").text(lang.undo) 
		)
		.append( 
			$("<span></span>").addClass(form.reset_button_icon_neutral) 
		)
		.css("background-color", form.reset_button_color_neutral)
		.attr("id", "reset_button")
		.click(function(){

			// remove list of rows to be deleted, if any
			$("#"+sTableName+"_form").find(".formview_list").removeAttr("remove_ids"); 
			$("#"+sTableName+"_form").find(".modified,.added,.rows_to_be_deleted").each(function(){
				$(this).removeClass("modified");
				$(this).removeClass("added");
				$(this).removeClass("rows_to_be_deleted");
			});

			fn.refreshTable(sTableName, function(){

				// set the send-button color back into default mode
				form.setSendButtonToSetting(sTableName, "neutral");
			});
		});
	buttondsDiv.append(formResetButton);
	
	// ------------------------------------
	// build a SEND/VALIDATE button
	// ------------------------------------

	var formSendButton = $("<button>")
		.addClass("formview_button")
		.append( 
			$("<span></span>").css("color", "#000000").text(lang.save) 
		)
		.append( 
			$("<span></span>").addClass(form.send_button_icon_neutral) 
		)
		.css("background-color", form.send_button_color_neutral)
		.attr("id", "send_button")		
		.click(function(){

			
			// first get some config

			var oColumnNamesAndValues = {};

			var sTableName = 		form.getTableOfForm(this);
			var oTableSettings =    conf.getTableSettings(sTableName);
			var oFormGrid =         conf.getFormGrid(oTableSettings);
			var oCells =  			oFormGrid["cells"];
			var oLists =			oFormGrid["lists"];


			// Register the selected rows in lists
			// (so we'll be able to restore selection after saving)
			var aSelectedRowsInLists = {};
			for (var sListLabel in oLists){
				var aRows = (lists.getSelectedRowsFromList(sListLabel)).nodes();
				var nRow = aRows[0];
				if (nRow != null && nRow.id != null){
					aSelectedRowsInLists[sListLabel] = nRow.id;
				}
			}
			


			// We'll need to build some promises, with all the jobs to be carried on 
			
			// trick: https://dev.to/doctolib/using-promises-as-a-queue-co5
			class PromiseQueue {

				queue = Promise.resolve(true);

				addJob(operation) {
					return new Promise((resolve, reject) => {
						this.queue = this.queue
							.then(operation)
							.then(resolve)
							.catch((err) => {
								fn.message("Oups", "SOMETHING WENT WRONG!");
								console.log(err);
							});
					});
				};
			};

			// instantiate the jobs list

			const fnDoAllUpdates = new PromiseQueue();


			// part #1 ----------------------------------------------------------------------------------------------------------------------------------------
			//
			// form cells

			var fnUpdateFormCells = function(){

				var nRow = fn.getActiveRowNode(sTableName);				

				for (var sCellName in oCells){
					var cellSelector = $("#"+sTableName+"_wrapper #form_cellvalue_"+sCellName);
					if ( cellSelector.hasClass("modified") ){

						// special case: read value of checkbox
						if (cellSelector.find("input").length>0){
							oColumnNamesAndValues[sCellName] = cellSelector.find("input").prop("checked");
						}
						// general case
						else {
							oColumnNamesAndValues[sCellName] = cellSelector.children().first().val();
						}

					}
				}

				// if we DO have modified content in the cells, send that to the database
				
				if (Reflect.ownKeys(oColumnNamesAndValues).length > 0){
					
					fn.updateDatabaseGivenANode(nRow, oColumnNamesAndValues);
				}

			};

			// add this job to the jobs list
			fnDoAllUpdates.addJob(fnUpdateFormCells);
			
			

			// 
			// process the lists too
			//


			// part #2 ----------------------------------------------------------------------------------------------------------------------------------------
			//
			// form lists with deleted rows

			var fnDeleteRows = function(){

				// get array of the lists having rows to be DELETED
				//                                          =======

				var aListsToProcessForDeletion = $("div#"+sTableName+"_form div.formview_list.rows_to_be_deleted");	

				// process each of the lists
				$(aListsToProcessForDeletion).each(function(){

					var eThisList = $(this);
					form.removeRows(eThisList);
				});
			};

			// add this job to the jobs list
			fnDoAllUpdates.addJob(fnDeleteRows);
				
				


			// part #3 ----------------------------------------------------------------------------------------------------------------------------------------
			//
			// form lists with added rows

			var fnAddNewRows = function(){

				var aListsToProcessForInserts = $("div#"+sTableName+"_form div.formview_list").find(".added").parents("div.formview_list");

				$(aListsToProcessForInserts).each(function(){

					var eThisList = $(this);					
					form.addNewRows(eThisList);
				});
			};

			// add this job to the jobs list
			fnDoAllUpdates.addJob(fnAddNewRows);



			// part #4 ----------------------------------------------------------------------------------------------------------------------------------------
			//
			// form lists with modified rows

			var fnUpdateModifiedRows = function(){

				// get array of the lists to process for UPDATES/INSERTS
				//                                       ===============

				var aListsToProcessForUpdates = $("div#"+sTableName+"_form div.formview_list").find(".modified").parents("div.formview_list");				

				// process each of the lists
				$(aListsToProcessForUpdates).each(function(){

					var eThisList = $(this);						
					form.updateModifiedRows(eThisList);			
				});
			};

			// add this job to the jobs list
			fnDoAllUpdates.addJob(fnUpdateModifiedRows);


			

			// last part ----------------------------------------------------------------------------------------------------------------------------------------
			//
			// the 'all went well' confirmation feedback

			var fnAllWentWell = function(){

				fn.addDrawCallback(sTableName, function(){	
					
					// set a draw callback to make sure that the send-button's color will be set back into default mode 
					// as soon as one browses etc.

					fn.addDrawCallback(sTableName, function(){
						form.setSendButtonToSetting(sTableName, "neutral");
					});

				});

				// click the form reset the button to load current data (with new IDs etc)
				$("div#"+sTableName+"_form button#reset_button").click();

				// give the send-button a new color to show update was performed
				// and show that reset is NOT possible anymore 
				form.setSendButtonToSetting(sTableName, "alliswel");
				form.setResetButtonToSetting(sTableName, "off");


				// make sure that the tables underlying the form's lists
				// are refreshed, in case those are loaded in the GUI already
				for (var sListLabel in oLists){
					var sTableToRefresh = lists.getTableNameFromListLabel(sListLabel);
					if (fn.tableExists(sTableToRefresh))
						fn.refreshTable(sTableToRefresh);
				}


				// restore row selection in lists		

				setTimeout(function(){
					for (var sListLabel in aSelectedRowsInLists){
						var sRowId = aSelectedRowsInLists[sListLabel];
						lists.setRowInList(sListLabel, sRowId);						
						lists.clickOpenInList(sListLabel);
					}
				}, 500);				
				
			};

			// add this job to the jobs list
			fnDoAllUpdates.addJob(fnAllWentWell);



			// Start! ----------------------------------------------------------------------------------------------------------------------------------------

			return fnDoAllUpdates;


		});
	buttondsDiv.append(formSendButton);
	
	// append the buttons
	$(eFormParent).append(buttondsDiv);	



	// ------------------------------------------------------------------------
	// force tooltip to fade, otherwise it sometimes keep in sight
	// ------------------------------------------------------------------------

	$("#tiptip_holder").fadeOut();
	setTimeout(function(){
		$("#tiptip_holder").fadeOut();
	}, 500);

};



// Manage the form grid:
//
// both construction at first call 
// and 
// updating view at each draw
//
form.manageViewGrid = function(sTableName){

	// get configuration
	var oTableConfig = 		conf.getTableConfig(sTableName);
	var oTableSettings =    conf.getTableSettings(sTableName);
	var oFormGrid =         conf.getFormGrid(oTableSettings);
	if (oFormGrid == null) return;

	// if form view is not built yet, build it!
	if ( !$("#"+sTableName+"_form").elementExists() ){
		form.buildViewGrid(sTableName);
	}

	// keep the normal table view hidden
	$("#"+sTableName+"_wrapper > .dataTables_scroll").css("display", "none"); // direct child (otherwise form lists will be hidden too)
	$("#"+sTableName+"_dynamic .bottom_pane").hide();
	$("#"+sTableName+"_dynamic .export_pane").hide();

	// hide some buttons that don't work (or don't make sense) in formview
	$("#"+sTableName+"_dynamic .top div#"+sTableName+"_undo_button_div").css("display", "none");
	$("#"+sTableName+"_dynamic .top div#"+sTableName+"_goto_button").css("display", "none");
	$("#"+sTableName+"_dynamic .top div#"+sTableName+"_colselect_button").css("display", "none");
	$("#"+sTableName+"_dynamic .top div#"+sTableName+"_searchandreplacebutton").css("display", "none");
	$("#"+sTableName+"_dynamic .top button#selectionbutton").parent().css("display", "none");
	$("#"+sTableName+"_dynamic .top button#"+sTableName+"_selectionbutton").parent().css("display", "none");


	// restore the buttons default settings (needed when browsing table etc)
	form.setSendButtonToSetting(sTableName, "neutral");
	form.setResetButtonToSetting(sTableName, "off");


	// prepare lists update
	var oLists = 	oFormGrid["lists"];
	var oListLabel2Filters = {};
	if (oLists != null){
		for (var sOneList in oLists){
			oListLabel2Filters[sOneList] = {}; // instantiate filters to apply to this list
		}
	}

	// cells loop
	
	var oCells = 	oFormGrid["cells"];
	for (var sCellName in oCells){

		var sBgColor = oFormGrid["cells"][sCellName]["bgcolor"];
		if (sBgColor == null) sBgColor = "#FFFFFF";

		// get the current row content
		var nRow = fn.getActiveRowNode(sTableName);

		// if there are no results, the row might be null
		if (nRow != null){

			// get the data
			var sData = fn.getDataFromCellInRowNode(nRow, sCellName);

			// do we have to synchronize a list with this cells?
			var oSynch = oCells[sCellName]["synchronize_with"];
			// if so, gather the filters to apply to each list
			if (oSynch!=null){
				
				// loop through list labels
				for (var sListLabel in oSynch){
					// get known filters till now for this label
					var aFilters = oListLabel2Filters[sListLabel];
					
					if (aFilters != null){						
						// read the list column name to feed with the current cell value (t.i.: as a filter)
						var sColNameInList = oSynch[sListLabel];

						// add this column name and the value as a filter (exact match)
						aFilters[sColNameInList] = sData;

						// add this to the list of filter for this list
						oListLabel2Filters[sListLabel] = aFilters;
					}

				}
			}

			// check column type
			var oColumnConfig = conf.getColumnConfig(oTableConfig, sCellName);
			var iColumnIndex = $.inArray(sCellName, mt.getListOfColumnsOf(sTableName));
			var sColumnType = mt.getListOfColumnTypesOf(sTableName)[iColumnIndex];
			// Do we have a select box?
			var bCheckBoxType = $.inArray(sColumnType, ["bit varying(1)", "boolean"])>=0;
			// Or do we have a select box?		
			var aSelectBoxValues = conf.getSelectionBox(oColumnConfig);
			if (aSelectBoxValues == null) aSelectBoxValues = mt.getListOfAllowedValuesInColumnsOf(sTableName)[iColumnIndex];


			// is the cell editable?
			//
			// NB: formgrid config (if set!) wins from default config
			//
			var bEditable = oFormGrid["cells"][sCellName]["editable"] != null ?
				oFormGrid["cells"][sCellName]["editable"]	 
				:
				conf.getEditability(oColumnConfig);



			// show the data the proper way, given column data type

			if (bCheckBoxType){

				var bIsBooleanType = (mt.getListOfColumnTypesOf(sTableName)[i] == "boolean");
				var trueValue = bIsBooleanType ? true : "\"1\"";
				var falseValue = bIsBooleanType ? false : "\"\"";

				if (sf.isCheckboxTrueValue(sData)){

					$("#"+sTableName+"_wrapper #form_cellvalue_"+sCellName+" input")
						.prop("checked", true)
						.val(trueValue)
						.attr("disabled", !bEditable);
				}
				else {
					$("#"+sTableName+"_wrapper #form_cellvalue_"+sCellName+" input")
						.prop("checked", false)
						.val(falseValue)
						.attr("disabled", !bEditable);
				}
				$("#"+sTableName+"_wrapper #form_cellvalue_"+sCellName)
					.css("background-color", sBgColor)
					.removeClass("modified");
			}
			else if (aSelectBoxValues != null && aSelectBoxValues.length>1){

					$("#"+sTableName+"_wrapper #form_cellvalue_"+sCellName+" select")					
						.val(sData)
						.attr("disabled", !bEditable);
					$("#"+sTableName+"_wrapper #form_cellvalue_"+sCellName)
						.css("background-color", sBgColor)
						.removeClass("modified");
			}
			else {
				$("#"+sTableName+"_wrapper #form_cellvalue_"+sCellName+" textarea")
					.val(sData)
					.css("pointer-events", bEditable ? "auto" : "none"); // trick to allow click event, which 'disabled' doesn't
				$("#"+sTableName+"_wrapper #form_cellvalue_"+sCellName)
					.css("background-color", sBgColor)
					.removeClass("modified");
			}



			// is the cell clickable?

			if (oFormGrid["cells"][sCellName]["click"] != null){

				$("#"+sTableName+"_wrapper #form_cellvalue_"+sCellName).off("click");
				$("#"+sTableName+"_wrapper #form_cellvalue_"+sCellName).on("click", function(){

					var nFormCell = this;

					var sCellId = 			$(nFormCell).closest("div[id^='form_cellvalue_'")[0].id;
					var sCellName = 		sCellId.replace(/^form_cellvalue_/, "");
					var sFormTable = 		form.getTableOfForm(nFormCell);
					var aTableSettings = 	conf.getTableSettings(sFormTable);
					var oFormGrid = 		conf.getFormGrid(aTableSettings);
					var fnFunction =  		oFormGrid["cells"][sCellName]["click"];				

					// call function
					fnFunction( mt.getDataTableObjectOf(sFormTable), nFormCell );
				});


			}
			

			// ----------------------------------
			// keep track of modified fields
			// ----------------------------------

			if (bEditable){

				//console.log("set keyup "+sTableName+"_wrapper #form_cellvalue_"+sCellName+" textarea");
				$("#"+sTableName+"_wrapper #form_cellvalue_"+sCellName+" textarea").keyup(function(){

					$(this).parent().addClass("modified");

					// attract attention from user to send button, which must be pressed 
					// since some content was modified,
					// and show that reset is possible now
														
					form.setSendButtonToSetting(sTableName, "payattention");
					form.setResetButtonToSetting(sTableName, "active");

				});

				$("#"+sTableName+"_wrapper #form_cellvalue_"+sCellName+" select").change(function(){

					$(this).parent().addClass("modified");

					// attract attention from user to send button, which must be pressed 
					// since some content was modified,
					// and show that reset is possible now
														
					form.setSendButtonToSetting(sTableName, "payattention");
					form.setResetButtonToSetting(sTableName, "active");

				});

				$("#"+sTableName+"_wrapper #form_cellvalue_"+sCellName+" input").click(function(){

					$(this).parent().addClass("modified");

					// attract attention from user to send button, which must be pressed 
					// since some content was modified,
					// and show that reset is possible now
														
					form.setSendButtonToSetting(sTableName, "payattention");
					form.setResetButtonToSetting(sTableName, "active");

				});

			}
		}
		

	} // end of cell loop


	setTimeout(function(){

		// now update the lists
		for (var sListLabel in oListLabel2Filters){

			var sTableToFeedTheListWith = 	oLists[sListLabel]["table"]["name"];

			// feed the lists
			lists.feedList(sListLabel,  oListLabel2Filters[sListLabel], function(){

				// make the list editable
				form.makeListEditable(sListLabel, sTableToFeedTheListWith);
			});
		}

	}, iWait);
	iWait = 0; // after first call
	
};


// determine how the underlying table is sorted for a given column
// (used as subroutine for form.synchronizeSorting )
//
form.getSortingModeOfTableColumn = function(sTableName, sCellName){
	
	var eSortTh = $("#"+sTableName+"_wrapper div.dataTables_scrollHeadInner table.display.dataTable thead tr:eq(0)").find("th."+sTableName+"."+sCellName);
	var sClasses = eSortTh.attr("class");	
	if (sClasses == null) sClasses = "";									
	var aClasses = sClasses.split(" ").filter(classname => $.startsWith(classname, "sorting"));										
	return aClasses[0];
};


// determine how the form is sorted
//
form.getSortingModeOfFormColumn = function(sTableName, sCellName){

	var eSortSpan = $("#"+sTableName+"_search_and_sort_table tr:eq(0) td span#"+sCellName);
	var sClasses = eSortSpan.attr("class");	
	if (sClasses == null) sClasses = "";									
	var aClasses = sClasses.split(" ").filter(classname => $.startsWith(classname, "sorting"));										
	return aClasses[0];

};



// determine how the underlying table is sorted (for all columns at once)
//
form.synchronizeSorting = function(sTableName){

	if (mt.getViewType(sTableName) == 'table') 
		return;

	$("#"+sTableName+"_search_and_sort_table tr:eq(0) td span").each(function(){

		var thisOne = $(this);

		// read the column name
		var sThisFormCol = thisOne.attr("id");
		// get the sort setting for this column in the table
		var sThisColSortSetting = form.getSortingModeOfTableColumn(sTableName, sThisFormCol);

		// now find the current sorting setting in the form for the same column
		// and get rid of it
		var sFormClasses = thisOne.attr("class");
		if (sFormClasses == null) sFormClasses = "";
		var aFormClasses = sFormClasses.split(" ").filter(classname => $.startsWith(classname, "sorting"));										
		var sCurrentSortClass = aFormClasses[0];
		thisOne.removeClass(sCurrentSortClass);

		// finally, give the form column the same setting as the table column
		thisOne.addClass(sThisColSortSetting);

	});
}

// empty/reset the searchbox of the form
//
form.resetSearchFields = function(sTableName){

	if (mt.getViewType(sTableName) == 'table') 
		return;

	// get configuration
	var oTableConfig = 		conf.getTableConfig(sTableName);
	var oTableSettings =    conf.getTableSettings(sTableName);
	var oFormGrid =         conf.getFormGrid(oTableSettings);
	if (oFormGrid == null) return;

	// cells loop
	var oCells = 			oFormGrid["cells"];
	var iFormColIndex =		0;
	for (var sCellName in oCells){

		// get selector of current search field in underlying table
		var aVisibleCols = form.getListOfVisibleColumnsOf(sTableName);
		var iTableColIndex = $.inArray(sCellName, aVisibleCols);
		var eThisTableSearchBox = $("#"+sTableName+"_searchboxes td:eq("+ iTableColIndex +")");
		var eThisFormSearchBox = $("#"+sTableName+"_search_and_sort_table tr:eq(1) td:eq("+ iFormColIndex +")");

		// check column type 
		// (needed to be able to read AND set the search value correctly)
		var oColumnConfig = conf.getColumnConfig(oTableConfig, sCellName);
		var iColumnIndex = $.inArray(sCellName, mt.getListOfColumnsOf(sTableName));
		var sColumnType = mt.getListOfColumnTypesOf(sTableName)[iColumnIndex];
		// Do we have a select box?
		var bCheckBoxType = $.inArray(sColumnType, ["bit varying(1)", "boolean"])>=0;
		// Or do we have a select box?		
		var aSelectBoxValues = conf.getSelectionBox(oColumnConfig);
		if (aSelectBoxValues == null) aSelectBoxValues = mt.getListOfAllowedValuesInColumnsOf(sTableName)[iColumnIndex];


		// now read AND set searchboxes the proper way, given column data type

		if (bCheckBoxType){

			var bIsBooleanType = (sColumnType == "boolean");
			var trueValue = bIsBooleanType ? true : "\"1\"";
			var falseValue = bIsBooleanType ? false : "\"\"";
			var inputTag = eThisTableSearchBox.find("input").eq(0);

			eThisFormSearchBox.find("input").eq(0)
				.attr("cycle_value", inputTag.attr("cycle_value"))
				.prop("checked", inputTag.prop("checked"))
				.val( sf.isCheckboxTrueValue(inputTag.val()) ? trueValue : falseValue);

			eThisFormSearchBox
				.css("background-color", eThisTableSearchBox.css("background-color"));
		}
		else if (aSelectBoxValues != null && aSelectBoxValues.length>1){

			var inputTag =  eThisTableSearchBox.find("select").eq(0);
	
			eThisFormSearchBox.find("select").eq(0)							
				.val(inputTag.val());
		}
		else {

			var inputTag =  eThisTableSearchBox.find("input").eq(0);

			eThisFormSearchBox.find("input").eq(0)
				.val(inputTag.val());			
		}
			
		
		// increase current form column index
		iFormColIndex++;
	}

}



// get list of columns
// set to be visible in the form config
form.getListColumnsToDisplay = function(oLists, sListLabel){

	var aTableColumnsConfig = oLists[sListLabel]["table"]["columns"];

	// columns
	var aColumnsToDisplay = new Array();
	for (var sColumnName in aTableColumnsConfig){
		var bVisible = aTableColumnsConfig[sColumnName]["visible"];
		if (bVisible != false) aColumnsToDisplay.push(sColumnName);
	}
	return aColumnsToDisplay;
}


// get list of columns
// named in the form config
form.getListColumnsToUse = function(oLists, sListLabel){

	var aTableColumnsConfig = oLists[sListLabel]["table"]["columns"];

	// columns
	var aColumnsToDisplay = new Array();
	for (var sColumnName in aTableColumnsConfig){
		aColumnsToDisplay.push(sColumnName); 
	}
	return aColumnsToDisplay;
}




// make a form list editable
//
form.makeListEditable = function(sListLabel, sTableToFeedTheListWith){	

	// get Datatable object of this list
	var sFormId =	lists.getFormIdFromListLabel(sListLabel);
	var sFormTable = sFormId.replace(/_form$/, "");
	var sTableId = 	lists.buildListTableId(sFormId, sListLabel);	
	var oTable = 	lists.getListObjectOf(sTableId);

	var aTableSettings = conf.getTableSettings(sFormTable);
	var oForm = conf.getFormGrid(aTableSettings);
	var oColumnsConfig = oForm["lists"][sListLabel]["table"]["columns"];

	var oTableConfig = conf.getTableConfig(sTableToFeedTheListWith);

	$("#"+sTableId+" thead th").each(function(i){

		var eThisCol = this;
		var sColName = $(eThisCol).text();
		var oColumnConfig = conf.getColumnConfig(oTableConfig, sColName);
		var bEditable = conf.getEditability(oColumnConfig);
		var bClickable = false; // in this case, we don't use the table config, since it mostly doesn't meet the form logic

		var iColIndex = $("#"+sTableId+" thead").find("th").index(eThisCol);

		// formgrid config overwrites the table config
		if (oColumnsConfig[sColName] != null){

			if (oColumnsConfig[sColName]["editable"] != null)
				bEditable = oColumnsConfig[sColName]["editable"];

			if (oColumnsConfig[sColName]["click"] != null)
				bClickable = true;
		}
			

		// if column must be editable:
		if (bEditable){

			$("#"+sTableId+" tbody tr").each(function(){
				$(this).find("td").eq(iColIndex).addClass("editable");
			});
		}

		// if column must be clickable:
		if (bClickable){

			$('table#'+sTableId+' tbody tr').off("click", 'td:eq('+iColIndex+')');
			$('table#'+sTableId+' tbody tr').on("click", 'td:eq('+iColIndex+')', function(event){

				var nCell = this;

				var sListLabel = lists.getLabelOfList(nCell);
				var sFormId =	lists.getFormIdFromListLabel(sListLabel);
				var sFormTable = sFormId.replace(/_form$/, "");
				var aTableSettings = conf.getTableSettings(sFormTable);
				var oFormGrid = conf.getFormGrid(aTableSettings);

				// get function and call it with the needed arguments
				var fnFunction = oFormGrid["lists"][sListLabel]["table"]["columns"][sColName]["click"];
				fnFunction(sListLabel, nCell);


			});

		}
	});


	$(oTable.cells('td.editable').nodes()).off();
	
	$(oTable.cells('td.editable').nodes()).editable(
		function(value, settings){

			$(this).addClass("modified");

			// redraw table
			var sThisTable = $(this).closest('table')[0].id;
			var oTable = lists.getListObjectOf(sThisTable);
			oTable.draw(false);

			return(value);
		},
		{
			"onblur": function(value){

				this.reset(value);
			},
			"callback": function(value, settings){
				
				var sThisTable = $(this).closest('table')[0].id;
				var oTable = lists.getListObjectOf(sThisTable);

				// assign value
				oTable.cell(this).data(value);				
			},
			"width": "100%",
			"type": "textarea", // this gives more room than the default 'input' field of jEditable
			"placeholder" : "" // prevents filling empty cells with default msg 'Click to edit'
		}

	).click(function(event) {

		var nThis = this;

		// get configured key from config
		var oListConfig =	form.getConfigOfList(nThis);
		var oKeys = 		oListConfig["keys"];
		var fnCallBack = 	(oKeys != null ? oKeys[ kf._getPressedKey() ] : null);

		// special case: a configured key was pressed
		if (fnCallBack != null){

			event.preventDefault();

			// execute key function 
			fnCallBack(nThis);				
		}

		// normal case: edit
		else {
			
			// we must use keydown to prevent default behaviour
			$(this).find('textarea')
				.css("overflow", "hidden") // no scrollbars!
				.keydown(function(event) { 
					
					// auto-adapt the size of the textarea
					// (http://stackoverflow.com/questions/995168/textarea-to-resize-based-on-content-length)
					$(this).css("height", "1px");
					$(this).css("height", (this.scrollHeight)+"px");	    	
					
					if (event.which == 13) {
						$(this).closest('form').submit();

						// attract attention from user to send button, which must be pressed 
						// since some content was modified,
						// and show that reset is possible now
															
						form.setSendButtonToSetting(sFormTable, "payattention");
						form.setResetButtonToSetting(sFormTable, "active");
					}					
				});
		}
	});
}



// process added rows in a list
//
form.addNewRows = function(oThisList, fnCallback){
	
	var sListDiv = oThisList.attr("id");
	var sListId = sListDiv.replace(/_div$/, "");
	var sFormListLabel = (sListId.split("___")[1]);
	var sTableToUpdate = lists.getTableNameFromListLabel(sFormListLabel)
	
	var oTable = lists.getListObjectOf(sListId);

	var aAllColumns = formListsTableCols.get(sTableToUpdate);

	var iTotalNumberToBeAdded = $("#"+sListId).find("tr.added").length;
	var iTotalNumberOfProcessed = 0;

	if (iTotalNumberToBeAdded>0){

		// rows loop

		oTable.rows(".added").every(function(iRowNr){

			$(this).removeClass("added");

			// gather values of all cells

			var aColNamesToAdd = new Array();
			var aValuesToAdd = new Array();

			var oRowData = oTable.row( iRowNr ).data();		
			for (var iColNr=0; iColNr<aAllColumns.length; iColNr++){

				var sColName = aAllColumns[iColNr];
				var sColValue = oRowData[iColNr];

				// cell which a not marked to be skipped
				// (this mark is added in function lists.addButtonToListHeader)
				// must be added to the record
				if (sColValue != "_NULL_"){
					aColNamesToAdd.push(sColName);
					aValuesToAdd.push(sColValue);
				}			
			}
			
			// insert record into the database
			var url = WEBSERV_URL+"/table/insertvalue"; 
			
			// make sure we send no null values, as join can't deal with it
			aValuesToAdd = convertNullToString(aValuesToAdd);
			
			$.ajax( {
				"type": "GET",
				"async": false,
				"url": url,
				"data": {
					"db_name": getHttpParams().get("db"),
					"table_name": sTableToUpdate,
					"column_name": aColNamesToAdd.join(ARG_INTERNAL_SEPARATOR),
					"value": aValuesToAdd.join(ARG_INTERNAL_SEPARATOR),
					"dummy": getUniqueNumber()
					},
				"dataType": "xml", // get response as xml
				"success": function(xml) {

					iTotalNumberOfProcessed += 1;
						
					// when done, do callback
					if (iTotalNumberOfProcessed == iTotalNumberToBeAdded){
						
						oTable.draw(false);
						
						if (fnCallback!=null)
							fnCallback();
					}
				},
				"error": function(jqXHR, textStatus, errorThrown){	
					
					fn.message(lang.error, 
						lang.error_when_calling+ " form.addNewRows("+sTableToUpdate+"): "+
						textStatus+" "+errorThrown+"; "+getJqXHRInfo(jqXHR));
					
				}
			});

		});

	}
	else {
		oTable.draw(false);
		if (fnCallback!=null)
			fnCallback();
	}
	
};

// process modified rows in a list
//
form.updateModifiedRows = function(oThisList, fnCallback){

	var sListDiv = oThisList.attr("id");
	var sListId = sListDiv.replace(/_div$/, "");
	var sFormListLabel = (sListId.split("___")[1]);
	var sTableToUpdate = lists.getTableNameFromListLabel(sFormListLabel)
	
	var oTable = lists.getListObjectOf(sListId); 

	var iTotalNumberOfModified = $("#"+sListId).find("td.modified").length;
	var iTotalNumberOfProcessed = 0;

	
	if (iTotalNumberOfModified >0){

		// rows loop
		// (exclude added rows)

		oTable.rows(":not(.added)").every(function(rowNr){

			var thisRow = this.node();
			var rowId = $(thisRow).attr("id");
					
			// is there any modified value in this row?

			var aModified = $(thisRow).find("td.modified");

			if (aModified.length>0){

				var aColumnNames = new Array();
				var aColumnValues = new Array();

				// gather for modified values for this row
				$(aModified).each(function(){
					
					var thisCell = this;
					var iColIndex = $(thisRow).find("td").index(thisCell);
					var sColName = $("#"+sListId+" thead th").eq(iColIndex).text();				
					var sColValue = $(thisCell).text();

					aColumnNames.push(sColName);
					aColumnValues.push(sColValue);
				});

				
				// update the database
				var url = WEBSERV_URL+"/table/setvalue"; 

				// make sure we send no null values, as join can't deal with it
				aColumnValues = convertNullToString(aColumnValues);

				$.ajax( {
					"type": "GET",
					"url": url,
					"data": {
						"db_name": getHttpParams().get("db"),
						"row_id": rowId,
						"table_name": sTableToUpdate,
						"column_name": aColumnNames.join(ARG_INTERNAL_SEPARATOR),
						"new_value": aColumnValues.join(ARG_INTERNAL_SEPARATOR), 
						"dummy": getUniqueNumber()
						},
					"dataType": "xml", // get response as xml
					"success": function(xml) {

						iTotalNumberOfProcessed += (aColumnValues.length);
							
						// when done, do callback
						if (iTotalNumberOfProcessed == iTotalNumberOfModified){

							oTable.draw(false);

							if (fnCallback!=null)
								fnCallback();
						}
						
					},
					"error": function(jqXHR, textStatus, errorThrown){
						fn.message(lang.error, 
							lang.error_when_calling+ " form.updateRow("+sTableToUpdate+"): "+
							textStatus+" "+errorThrown+"; "+getJqXHRInfo(jqXHR));
					}
				});


			} // end of modified row processing

			else {
				oTable.draw(false);
				if (fnCallback!=null)
					fnCallback();
			}

		});

	}
	else {
		oTable.draw(false);
		if (fnCallback!=null)
			fnCallback();
	}
	
			

};


// process rows to be deleted from a list
//
form.removeRows = function(oThisList, fnCallback){

	var sListDiv = oThisList.attr("id");
	var sListId = sListDiv.replace(/_div$/, "");
	var oTable = lists.getListObjectOf(sListId);
	var sFormListLabel = (sListId.split("___")[1]);
	var sTableToUpdate = lists.getTableNameFromListLabel(sFormListLabel);

	var sIdsToRemove = $("#"+sListDiv).attr("remove_ids"); 

	if (sIdsToRemove != null){

		var aIdsToRemove = sIdsToRemove.split(",");
		
		for (var i=0; i<aIdsToRemove.length; i++){

			var sNodeId = aIdsToRemove[i];

			var url = WEBSERV_URL+"/table/delete_row"; 
			$.ajax( {
				"type": "GET",
				"url": url,
				"data": {
					"row_id": sNodeId,
					"db_name": getHttpParams().get("db"),
					"table_name": sTableToUpdate,
					"dummy": getUniqueNumber()
					},
				"dataType": "xml", // get response as xml
				"success": function(xml) {

					if ( i >= (aIdsToRemove.length-1) ){

						oTable.draw(false);

						if (fnCallback!=null)
							fnCallback();
					}
				},
				"error": function(jqXHR, textStatus, errorThrown){

					fn.message(lang.error, 
						lang.error_when_calling+" form.removeRows("+sTableToUpdate+"): "+
						textStatus+" "+errorThrown+"; "+getJqXHRInfo(jqXHR));
				}
			});
		}

	}
	else {

		oTable.draw(false);
		if (fnCallback!=null)
			fnCallback();
	}
	
	
}


// --------------------------------------------------------------------

// find the table of the current form
//   ( t.i. NOT the tables feeding the lists)

form.getTableOfForm = function(elem){

	var sThisElemId = $(elem).closest('div.formgrid')[0].id;
	var sThisTable = sThisElemId.replace(/_form$/g, "");
	return sThisTable;
};





// list div has ID like 'formview_list_<LISTNAME>'
//
form.getConfigOfList = function(elem){

	// get the form table
	// and retrieve its config
	var sTableOfFrom = 		form.getTableOfForm(elem);
	var oTableSettings =	conf.getTableSettings(sTableOfFrom);
	var oFormGrid = 		conf.getFormGrid(oTableSettings);

	// get the list id
	// and retrieve its config in the form config
	var sListDivId = 	lists.getDivIdOfList(elem);	
	var sListId = 		(sListDivId.split("___")[1]).replace(/_div$/g, "");
	var aList = 		oFormGrid["lists"];
	return aList[sListId];
};

// --------------------------------------------------------------------


// compute list of visible columns
// given the table config AND the form config
//
form.getListOfVisibleColumnsOf = function(sTableName){

	// get visibility according to table config

	var aVisibleColumns = cloneArray( mt.getListOfVisibleColumnsOf(sTableName) );

	// then get the form config:
	// visibility settings there will overwrite the table config

	var aTableSettings = conf.getTableSettings(sTableName);
	var oGrid = conf.getFormGrid(aTableSettings);
	for (var sCell in oGrid["cells"]){

		var bVisibility = oGrid["cells"][sCell]["visible"];
		var iIndex = $.inArray(sCell, aVisibleColumns);

		// form cell must be visible, but is hidden according to table config: 
		// add it to list of visible cells
		if (bVisibility == true && iIndex < 0){
			aVisibleColumns.push(sCell);
		}
		// form cell must be hidden, but is visible according to table config: 
		// remove it from the list of visible cells
		else if (bVisibility == false && iIndex >= 0) {
			aVisibleColumns.splice(iIndex, 1);
		}
		
	}

	return aVisibleColumns;
}

// compute list of nice names of columns
// given the table config AND the form config
//
form.getListOfColumnsNiceNames = function(sSomeTable){

	var sTableName = (typeof sSomeTable == 'object') ? fn.getTableName(sSomeTable) : sSomeTable;
	var oTableConfig = conf.getTableConfig(sTableName);
	var aTableSettings = conf.getTableSettings(sTableName);
	var oGrid = conf.getFormGrid(aTableSettings);
	
	var aColsList = form.getListOfVisibleColumnsOf(sTableName);
	
	var aColsNiceNames = [];
	for (var i=0; i<aColsList.length; i++){
		var sColName = aColsList[i];
		var aColumnConfig =	conf.getColumnConfig(oTableConfig, sColName);
		
		var sNiceNameInTable = conf.getColumnNiceName(aColumnConfig);
		var sNiceNameInForm = (oGrid["cells"][sColName] != null ? oGrid["cells"][sColName]["nice_name"] : null);
		
		aColsNiceNames[i] = sColName;
		if (sNiceNameInTable != null)
			aColsNiceNames[i] = sNiceNameInTable;
		if (sNiceNameInForm != null)
			aColsNiceNames[i] = sNiceNameInForm;
	}
	return aColsNiceNames;
}


form.getVisibleColumns = function(elem){

	var aColumnList = new Array();

	var sTableId =$(elem).closest('table')[0].id;			
	$("#"+sTableId+" thead th").each(function(i){
		aColumnList.push( $(this).text() );
	});
	return aColumnList;
};

form.getIndexOfVisibleCell = function(elem){

	var nRow =$(elem).closest('tr')[0];
	var iColIndex = $(nRow).find("td").index(elem);			
	return iColIndex;
};


form.getIndexOfColumnName = function(elem, sColumnName){

	var aColumns = form.getVisibleColumnsOfList(elem);			
	var iColIndex = $.inArray(sColumnName, aColumns);
	return iColIndex;
};


// read/set value of a cell in the form
form.getDataFromCell = function(sFormTable, sCellName, bUnderlying){

	// if we want the current value IN THE UNDERLYING TABLE 
	// represented by the form (which is not necessarily the value
	// shown in the form, since that might be being edited)
	if (bUnderlying != null && bUnderlying == true){

		var sData;
		// get the current row content
		var nRow = fn.getActiveRowNode(sFormTable);
		// if there are no results, the row might be null
		if (nRow != null){
			sData = fn.getDataFromCellInRowNode(nRow, sCellName);
		}

		return sData;
	}

	// if we want to get the current value IN THE FORM

	else {
		//console.log($("div#"+sFormTable+"_form div#form_cellvalue_"+sCellName).children().first().get(0));
		return $("div#"+sFormTable+"_form div#form_cellvalue_"+sCellName).children().first().val();
	}
}

form.setDataInCell = function(sFormTable, sCellName, sValue){

	$("div#"+sFormTable+"_form div#form_cellvalue_"+sCellName)
		.addClass("modified")
		.children().first().val(sValue);
	
	// attract attention from user to send button, which must be pressed 
	// since some content was modified,
	// and show that reset is possible now									
	
	form.setSendButtonToSetting(sFormTable, "payattention");
	form.setResetButtonToSetting(sFormTable, "active");
}


form.getNameOfCell = function(nCellValueNode){
	return (nCellValueNode.id).replace(/^form_cellvalue_/, "");
}



// is form in 'unsaved' state?
form.isUnsaved = function(sTableName){
	var eFormButtons = $("#"+sTableName+"_formsbuttons");
	return ( eFormButtons.length>0 && 
			eFormButtons.find("#send_button").length>0 && 
			eFormButtons.find("#send_button").hasClass("payattention")
	);
}