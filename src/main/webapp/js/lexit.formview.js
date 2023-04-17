/**
 * form view
 */



var form = {};


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
	}
	else if (sSetting == 'alliswel'){
		sBgColor = form.send_button_color_alliswel;
		sIcon = form.send_button_icon_alliswel;
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




form.buildSearchAndSortBar = function(eSearchDiv, sTableName, oFormGrid, iGridWidthUnit){

	// ------------------------------------------
	// add search/sort div 
	// ------------------------------------------

	eSearchDiv.append(
		$("<table></table>")
			.attr("id", sTableName+"_search_and_sort_table")
			.css("margin", "auto")
			.css("width", "50p%")
	);

	$("#"+sTableName+"_search_and_sort_table")
		.append("<tr></tr>")  // #1 : sort row
		.append("<tr></tr>"); // #2 : search row


	// ------------------------------------------
	// add the search/sort cells 
	// ------------------------------------------

	var aSearchFields = mt.getListOfVisibleColumnsOf(sTableName);
	var aSearchFieldsNiceNames = fn.getListOfColumnsNiceNames(sTableName);

	var aTinySearchFields = [];
	var aTinySearchFieldsNiceNames = [];



	// --------------------------------------
	// cells loop
	// --------------------------------------

	var oCells =  oFormGrid["cells"];
	for (var sCellName in oCells){

		aTinySearchFields.push(sCellName);
		var iNameIndex = $.inArray(sCellName, aSearchFields);
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
										form.synchronizeSorting(sTableName)
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
		$("#"+sTableName+"_search_and_sort_table tr:eq(1) td:last")
			.css("width", iGridWidthUnit+"px")
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

		

		

		//$("#"+sTableName+"_wrapper div.dataTables_scrollHeadInner table.display.dataTable thead tr:eq(0)").find("th."+sTableName+"."+sCellName).clone().appendTo("#"+sTableName+"_search_and_sort_table tr:eq(0)");
		//$("#"+sTableName+"_search_and_sort_table tr:eq(0)").css("width", iGridWidthUnit+"px");
		//
		//$("#"+sTableName+"_wrapper div.dataTables_scrollHeadInner table#"+sTableName+"_searchboxes tr:eq(0) td").find("input#"+sTableName+"_searchbox_"+sCellName).clone().appendTo("#"+sTableName+"_search_and_sort_table tr:eq(1)");


		
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
	var aSearchFields = mt.getListOfVisibleColumnsOf(sTableName);
	var aSearchFieldsNiceNames = fn.getListOfColumnsNiceNames(sTableName);

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
	var eFormParent = $("<div></div>")
		.attr("id", sTableName+"_form")
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

	$("#"+sTableName+"_dynamic .dataTables_scroll").css("display", "none");
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

			var aNewSelectBoxValues = [...aSelectBoxValues];
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

			var oColumnNamesAndValues = {};

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

			// if we DO have modified content, send it to the database
			
			if (Reflect.ownKeys(oColumnNamesAndValues).length > 0){
				
				fn.updateDatabaseGivenANode(nRow, oColumnNamesAndValues, function(){

					// give the send-button a new color to show update was performed
					// and show that reset is NOT possible anymore 
					form.setSendButtonToSetting(sTableName, "alliswel");
					form.setResetButtonToSetting(sTableName, "off");


					// set a draw callback to make sure that the send-button's color will be set back into default mode 
					// as soon as one browses etc.

					fn.addDrawCallback(sTableName, function(){

						form.setSendButtonToSetting(sTableName, "neutral");

					});
				});
			}

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



// manage the view grid
// both construction at first call and updating view at each draw
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
	$("#"+sTableName+"_dynamic .dataTables_scroll").css("display", "none");
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


	// cells loop
	var oCells = 			oFormGrid["cells"];
	for (var sCellName in oCells){

		// get the current row content
		var nRow = fn.getActiveRowNode(sTableName);

		// if there are no results, the row might be null
		if (nRow != null){

			// get the data
			var sData = fn.getDataFromCellInRowNode(nRow, sCellName);

			// check column type
			var oColumnConfig = conf.getColumnConfig(oTableConfig, sCellName);
			var iColumnIndex = $.inArray(sCellName, mt.getListOfColumnsOf(sTableName));
			var sColumnType = mt.getListOfColumnTypesOf(sTableName)[iColumnIndex];
			// Do we have a select box?
			var bCheckBoxType = $.inArray(sColumnType, ["bit varying(1)", "boolean"])>=0;
			// Or do we have a select box?		
			var aSelectBoxValues = conf.getSelectionBox(oColumnConfig);
			if (aSelectBoxValues == null) aSelectBoxValues = mt.getListOfAllowedValuesInColumnsOf(sTableName)[iColumnIndex];

			var bEditable = conf.getEditability(oColumnConfig);



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
					.css("background-color", "white")
					.removeClass("modified");
			}
			else if (aSelectBoxValues != null && aSelectBoxValues.length>1){

					$("#"+sTableName+"_wrapper #form_cellvalue_"+sCellName+" select")					
						.val(sData)
						.attr("disabled", !bEditable);
					$("#"+sTableName+"_wrapper #form_cellvalue_"+sCellName)
						.css("background-color", "white")
						.removeClass("modified");
			}
			else {
				$("#"+sTableName+"_wrapper #form_cellvalue_"+sCellName+" textarea")
					.val(sData)
					.attr("disabled", !bEditable);
				$("#"+sTableName+"_wrapper #form_cellvalue_"+sCellName)
					.css("background-color", "white")
					.removeClass("modified");
			}
			

			// ----------------------------------
			// keep track of modified fields
			// ----------------------------------

			if (bEditable){

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
		

	}
};



form.getSortingModeOfTableColumn = function(sTableName, sCellName){
	
	var eSortTh = $("#"+sTableName+"_wrapper div.dataTables_scrollHeadInner table.display.dataTable thead tr:eq(0)").find("th."+sTableName+"."+sCellName);
	var sClasses = eSortTh.attr("class");	
	if (sClasses == null) sClasses = "";									
	var aClasses = sClasses.split(" ").filter(classname => $.startsWith(classname, "sorting"));										
	return aClasses[0];
};


form.getSortingModeOfFormColumn = function(sTableName, sCellName){

	var eSortSpan = $("#"+sTableName+"_search_and_sort_table tr:eq(0) td span#"+sCellName);
	var sClasses = eSortSpan.attr("class");	
	if (sClasses == null) sClasses = "";									
	var aClasses = sClasses.split(" ").filter(classname => $.startsWith(classname, "sorting"));										
	return aClasses[0];

};

form.resetFormSorting = function(sTableName){

	$("#"+sTableName+"_search_and_sort_table tr:eq(0) td span").each(function(){

		var thisOne = $(this);
		var sFormClasses = thisOne.attr("class");
		if (sFormClasses == null) sFormClasses = "";
		var aFormClasses = sFormClasses.split(" ").filter(classname => $.startsWith(classname, "sorting"));										
		var sCurrentSortClass = aFormClasses[0];
		thisOne.removeClass(sCurrentSortClass);
		thisOne.addClass("sorting");

	});
}

form.synchronizeSorting = function(sTableName){

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
		var aVisibleCols = mt.getListOfVisibleColumnsOf(sTableName);
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