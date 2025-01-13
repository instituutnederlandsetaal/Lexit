/**
 * The form namespace contains functions to build forms with.
 * 
 * Basic forms contain cells (corresponding to the columns of a table row).
 * More complex forms might contain inbedded tables, which we call lists.
 * Lists can be dealt with using functions from the lists namespace.
 * 
 * @namespace
 */
var form = {};


// ----------------------------------------------
//
// API at the botton of this file !!!
//
// ----------------------------------------------




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
			var blink = function(elem, iCount) {
				
				if (iCount == null) iCount = 0;

				$(elem).animate({
						opacity: '0'
					}, function(){			
						$(this).animate({
							opacity: '1'
						}, function(){
							if ( $(elem).hasClass("payattention") && iCount < 3) // blink 3 times (is enough, more is irritating)
								blink(elem, iCount+1);
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
	var aSearchFields = 			form.getVisibleColumnsOf(sTableName);
	var aSearchFieldsNiceNames = 	form.getColumnsNiceNames(sTableName); 


	// --------------------------------------
	// cells loop
	// --------------------------------------

	var oCells =  oFormGrid["cells"];
	
	for (var sCellName in oCells){
		
		// if the cell is not visible in current config, skip it
		if ($.inArray(sCellName, aSearchFields) < 0) continue;
		
		var iNameIndex = $.inArray(sCellName, aSearchFields);
		var sNiceName = aSearchFieldsNiceNames[iNameIndex];

		// --------------------------------------
		// add sort button
		// --------------------------------------

		var iPercentage = (parseInt( $( "#"+sTableName+"_dynamic" ).css("width") ) / parseInt( $(window).width() ) );
		$("#"+sTableName+"_search_and_sort_table tr:eq(0)")
			.append(
				$("<td></td>")
					.css("width", "calc("+iPercentage+" * (var(--"+sTableName+"_form_cellwidth)))")
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

		// ... and copy the original Lex'it searchbox to this new cell
		$("#"+sTableName+"_wrapper div.dataTables_scrollHeadInner table#"+sTableName+"_searchboxes tr:eq(0) td")
			.find("#"+sTableName+"_searchbox_"+sCellName)
			.clone()
			.appendTo("#"+sTableName+"_search_and_sort_table tr:eq(1) td:last");

		// if we have a checkbox, add default background color
		if ($("#"+sTableName+"_search_and_sort_table tr:eq(1) td:last").find("input").attr("cycle_value") != null){
			$("#"+sTableName+"_search_and_sort_table tr:eq(1) td:last").css("background-color", "#DDDDDD").css("border", "1px solid #FFFFFF");
		}
		
		//console.log("--" +sCellName, $("#"+sTableName+"_search_and_sort_table tr:eq(1) td:last").get(0));

		// if we have a selectbox, select the selected value
		if ($("#"+sTableName+"_search_and_sort_table tr:eq(1) td:last").find("select").length > 0){
			
			var searchBoxInUnderlyingTable = $("#"+sTableName+"_wrapper div.dataTables_scrollHeadInner table#"+sTableName+"_searchboxes tr:eq(0) td")
					.find("#"+sTableName+"_searchbox_"+sCellName);				
			var sSelectedValueInUnderlyingTable = searchBoxInUnderlyingTable.val();
			
			//console.log("-------+");
			//console.log(sTableName);
			//console.log($("#"+sTableName+"_search_and_sort_table tr:eq(1) td:last select").get(0));
			//console.log($("#"+sTableName+"_search_and_sort_table tr:eq(1) td:last select").length);
			//console.log(searchBoxInUnderlyingTable.get(0));
			//console.log(sSelectedValueInUnderlyingTable);
			
			// small pauze needed in some cases, or it will crash 
			setTimeout(function(){
	
				// https://stackoverflow.com/questions/314636/how-do-you-select-a-particular-option-in-a-select-element-in-jquery
				$("#"+sTableName+"_search_and_sort_table tr:eq(1) td:last select").find("option").filter(function(i, e) {
	
					return e.text 
						== 
						sSelectedValueInUnderlyingTable.replaceAll("\\", ""); // remove escaped regex chars (which were added by sf.enableSearchFields() )
	
				}).attr("selected", "selected");
				
			}, 100);
			
		}

		// assign it the grid width unit (same width for each)
		var factor = oFormGrid["searchbox_width_factor"] != null ? 
			parseInt( oFormGrid["searchbox_width_factor"] ) 
			: 
			iPercentage;
			
		$("#"+sTableName+"_search_and_sort_table tr:eq(1) td:last")
			.css("width", "calc("+factor+" * (var(--"+sTableName+"_form_cellwidth)))")
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
		

	}; // end of cell loop

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
	mt.getDataTableObjectOf(sTableName).page.len(1);
	
	// now we can query the current row index
	// NB: if we call that function before setting the 1-row mode, it will return -1,
	//     seemingly because the table is not yet fully initialized
	var iNowIndex = fn.getCurrentDisplayStart(sTableName);	
	mt.getDataTableObjectOf(sTableName).displayRow(iNowIndex);

	// get column names
	var aSearchFields = form.getVisibleColumnsOf(sTableName);
	var aSearchFieldsNiceNames = form.getColumnsNiceNames(sTableName);

	// ------------------------------------------
	// form layout
	// ------------------------------------------

	// get pixel size
	var aSize =             oFormGrid["size"];
	if (aSize == null){
		aSize = [0, 0] // default
	}
	var iFormWidth = 		parseInt(aSize[0]);
	var iFormHeight = 		parseInt(aSize[1]);
	

	// get table size (the form grid pixel size must fit into it)	
	var iTableWidth = parseInt( $( "#"+sTableName+"_dynamic" ).css("width") );
	var iTableHeight = parseInt( $( "#"+sTableName+"_dynamic" ).css("height") ) - parseInt( $( "#"+sTableName+"_dynamic .top" ).css("height") );
	
	// if the given height and/or width is larger than the table, or it has a 0 value, set it to the table size	
	if (iFormWidth == 0 || iFormWidth > iTableWidth ) iFormWidth = iTableWidth;
	if (iFormHeight == 0 || iFormHeight > iTableHeight ) iFormHeight = iTableHeight;

	var sFormPositionSetting = oFormGrid["align"];
	var sFormPosPix = (iTableWidth - iFormWidth)/2; //default: center
	if (sFormPositionSetting == null ||  sFormPositionSetting == "left"){
		sFormPosPix = 10;
	}
	else if (sFormPositionSetting == "right"){
		sFormPosPix = (iTableWidth - iFormWidth) - 10;
	}

	// do we need a search bar?
	var bSearchBar = oFormGrid["searchbar"] != null ? oFormGrid["searchbar"] : true;
	
	var iSearchBarHeight = bSearchBar ? 40 : 0;
	var iSearchOpacity = bSearchBar ? 1 : 0;
	var iHeaderHeight = parseInt( $( "#"+sTableName+"_wrapper .top" ).css("height") );

	// search div on top of form
	var eSearchDiv = $("<div></div>")
		.attr("id", sTableName+"_search_and_sort")
		.css("margin", 0)
		.css("position", "relative")
		.css("top", "10px")
		.css("left", sFormPosPix + "px")
		.css("width", iFormWidth +"px")
		.css("height", iSearchBarHeight+"px")
		.css("opacity", iSearchOpacity);
	$( "#"+sTableName+"_wrapper" ).append(eSearchDiv);	
	
	
	// parent element to build form into	
	var sFormContainerId = sTableName+"_form";
	var eFormParent = $("<div></div>")
		.attr("id", sFormContainerId)
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
	
	// set css variables for scaling
	fn.setCssVariable(sFormContainerId+"_cellwidth", iGridWidthUnit+"px");
	fn.setCssVariable(sFormContainerId+"_cellheight", iGridHeightUnit+"px");

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
	// text blocks loop
	// ------------------------------------------
	
	var oTextBlocks =  oFormGrid["textblocks"];
	for (var sTextBlockName in oTextBlocks){

		var oTextBlock = 	oTextBlocks[sTextBlockName];
		var aPosition = 	oTextBlock["position"];
		var aBlockSize = 	oTextBlock["definition"];
		var sBlockClass = 	oTextBlock["class"];
		var sBlockText = 	oTextBlock["text"];
		var fnBlockClick = 	oTextBlock["click"];
		
		if (aPosition == null){
			fn.message(lang.error, (lang.formlist_missing_parameter).replace(/TABLENAME/g, sTableName).replace(/PARAM/g, "textblocks:{"+sTextBlockName+":{position}}"));
			return;
		}
		if (aBlockSize == null){
			fn.message(lang.error, (lang.formlist_missing_parameter).replace(/TABLENAME/g, sTableName).replace(/PARAM/g, "textblocks:{"+sTextBlockName+":{definition}}"));
			return;
		}
		
		var eTextBlock = $("<div></div>")
				.attr("id", sTableName+"_form_textblock_"+sTextBlockName.replace(/ /g, "_"))
				.addClass(sBlockClass)
				.append(
					$("<span></span>").text(sBlockText)
				);		
		$(eFormParent).append(eTextBlock);
		
		$("#"+sTableName+"_wrapper #"+sTableName+"_form_textblock_"+sTextBlockName.replace(/ /g, "_"))
					.css("position", "absolute")
					.css("left", "calc("+aPosition[0]+" * (var(--"+sFormContainerId+"_cellwidth)))")
					.css("top", "calc("+aPosition[1]+" * (var(--"+sFormContainerId+"_cellheight)))")		
					.css("width", "calc("+aBlockSize[0]+" * (var(--"+sFormContainerId+"_cellwidth)))")
					.css("height", "calc("+aBlockSize[1]+" * (var(--"+sFormContainerId+"_cellheight)))");
					//.css("left", (parseFloat(aPosition[0]) * iGridWidthUnit) +"px")
					//.css("top", (parseFloat(aPosition[1]) * iGridHeightUnit) +"px")		
					//.css("width", (parseFloat(aBlockSize[0]) * iGridWidthUnit) +"px")
					//.css("height", (parseFloat(aBlockSize[1]) *iGridHeightUnit) +"px");
	
	
		// click events if declared
		
		if (fnBlockClick != null){
			$("#"+sTableName+"_form_textblock_"+sTextBlockName.replace(/ /g, "_"))
				.click(function(){
					
					// get config given this node
					var sTableName = 		form.getFeedingTable(this);
					var sTextBlockName = 	$(this).attr("id").replace(/^.+_form_textblock_/g, "");
					
					var oTableSettings =    conf.getTableSettings(sTableName);
					var oFormGrid =         conf.getFormGrid(oTableSettings);
					var oTextBlocks = 		oFormGrid["textblocks"];
					var fnBlockClick = 		oTextBlocks[sTextBlockName]["click"];
					
					// call function with table object as parameter
					fnBlockClick( mt.getDataTableObjectOf(sTableName) );
				});
		}
	}
	
	
	// ------------------------------------------
	// cell groups blocks loop
	// ------------------------------------------
	
	
	
	var oCellBlocks =  oFormGrid["cellgroups"];
	for (var sCellBlockName in oCellBlocks){

		var oCellBlock = 	oCellBlocks[sCellBlockName];
		var aPosition = 	oCellBlock["position"];
		var aBlockSize = 	oCellBlock["definition"];
		var sBlockClass = 	oCellBlock["class"];
		
		var sBlockText = 	oCellBlock["text"];
		var sBlockTextClass = oCellBlock["textclass"];
		var sBlockTextHtmlTag = oCellBlock["htmltag"] ?? "h3"; // h3 is jquery UI default
		
		
		if (aPosition == null){
			fn.message(lang.error, (lang.formlist_missing_parameter).replace(/TABLENAME/g, sTableName).replace(/PARAM/g, "cellgroups:{"+sCellBlockName+":{position}}"));
			return;
		}
		if (aBlockSize == null){
			fn.message(lang.error, (lang.formlist_missing_parameter).replace(/TABLENAME/g, sTableName).replace(/PARAM/g, "cellgroups:{"+sCellBlockName+":{definition}}"));
			return;
		}
		
		// if some text is given, prepend a text block to the cell block
		if (sBlockText != null){
			
			var eTextBlock;
			if (sBlockTextHtmlTag != null){
				eTextBlock = $("<"+sBlockTextHtmlTag+"></"+sBlockTextHtmlTag+">")
					.text(sBlockText)
			}
			else {
				eTextBlock = $("<div></div>")
					.attr("id", sTableName+"_form_cellblock_text_"+sCellBlockName.replace(/ /g, "_"))
					.addClass(sBlockTextClass != null ? sBlockTextClass : sBlockClass)
					.append(
						$("<span></span>").text(sBlockText)
					);				
			}
			
			// if the cellblock contains a list,
			// add a click event to the cell block to redraw the list
			// (this is needed to allows the list's headers to adapt in the container)
			
			eTextBlock.bind("click", function(){
				
				// read the aria-controls attribute of the clicked element: this is the id of the div container it opens
				// (this will only be available if the accordion function is used)
				var sDivId = $(this).attr("aria-controls");				
				if (sDivId != null){
					
					// user the id of the container, find a list container inside
					var sContainerId = $("#"+sDivId).find("div.formview_list").attr("id");
					if (sContainerId != null){
						
						// if the list and its ID was found, use that to retrieve the list label
						var sListLabel = lists.getLabelFromContainerId(sContainerId);						
						setTimeout(function(){
							
							// use the list label to retrieve the list DataTable object and redraw it
							(lists.getDataTableObjectOf(sListLabel)).draw();
						}, 200);
					}	
				}				
			});
			
			$(eFormParent).append(eTextBlock);
			
			$("#"+sTableName+"_wrapper #"+sTableName+"_form_cellblock_text_"+sCellBlockName.replace(/ /g, "_"))
					.css("position", "absolute")
					.css("left", "calc("+aPosition[0]+" * (var(--"+sFormContainerId+"_cellwidth)))")
					.css("top", "calc("+aPosition[1]+" * (var(--"+sFormContainerId+"_cellheight)))")  		
					.css("width", "calc("+aBlockSize[0]+" * (var(--"+sFormContainerId+"_cellwidth)))")
					.css("min-height", "calc("+aBlockSize[1]+" * (var(--"+sFormContainerId+"_cellheight)))");	// min-height to prevent overlapping in flex mode
					//.css("left", (parseFloat(aPosition[0]) * iGridWidthUnit) +"px")
					//.css("top", (parseFloat(aPosition[1]) * iGridHeightUnit) +"px")  		
					//.css("width", (parseFloat(aBlockSize[0]) * iGridWidthUnit) +"px")
					//.css("min-height", (parseFloat(aBlockSize[1]) *iGridHeightUnit) +"px");	// min-height to prevent overlapping in flex mode
		}
		
		// now add the cell block
		var eCellBlock = $("<div></div>")
				.attr("id", sTableName+"_form_cellblock_"+sCellBlockName.replace(/ /g, "_"))
				.addClass(sBlockClass);		
		$(eFormParent).append(eCellBlock);
		
		
		$("#"+sTableName+"_wrapper #"+sTableName+"_form_cellblock_"+sCellBlockName.replace(/ /g, "_"))
					.css("position", "absolute")
					.css("left", "calc("+aPosition[0]+" * (var(--"+sFormContainerId+"_cellwidth)))")
					.css("top", "calc("+(aPosition[1]+ (sBlockText != null ? 1:0)) + " * (var(--"+sFormContainerId+"_cellheight)))") // if text is given, add one iGridHeightUnit
					.css("width", "calc("+aBlockSize[0]+" * (var(--"+sFormContainerId+"_cellwidth)))")
					.css("min-height", "calc("+aBlockSize[1]+" * (var(--"+sFormContainerId+"_cellheight)))");	// min-height to prevent overlapping in flex mode
					// .css("left", (parseFloat(aPosition[0]) * iGridWidthUnit) +"px")
					//.css("top", (parseFloat(aPosition[1] + (sBlockText != null ? 1:0)) * iGridHeightUnit) +"px") // if text is given, add one iGridHeightUnit
					//.css("width", (parseFloat(aBlockSize[0]) * iGridWidthUnit) +"px")
					//.css("min-height", (parseFloat(aBlockSize[1]) *iGridHeightUnit) +"px");	// min-height to prevent overlapping in flex mode
					
	}

	// ------------------------------------------
	// cells loop
	// ------------------------------------------

	var oCells =  oFormGrid["cells"];
	for (var sCellName in oCells){
		
		// if the cell is not visible in current config, skip it
		if ($.inArray(sCellName, aSearchFields) < 0) continue;

		var oCell = 	oCells[sCellName];
		var sCellBlockName = oCell["cellgroup"];
		var aPosition = oCell["position"];
		var sOrder = oCell["order"];
		var aCellSize = oCell["definition"];
		var sCellClass = oCell["class"];
		var sPlaceholder = oCell["tooltip"];
		
		
		if (aPosition == null && sCellBlockName == null){
			fn.message(lang.error, (lang.formlist_missing_parameter).replace(/TABLENAME/g, sTableName).replace(/PARAM/g, "cells:{"+sCellName+":{position}}"));
			return;
		}
		if (aCellSize == null && aPosition != "hidden"){
			fn.message(lang.error, (lang.formlist_missing_parameter).replace(/TABLENAME/g, sTableName).replace(/PARAM/g, "cells:{"+sCellName+":{definition}}"));
			return;
		}
		

		// ------------------------------------------
		// build a label and its content cell attached
		// ------------------------------------------

		var iNameIndex = $.inArray(sCellName, aSearchFields);
		var sNiceName = aSearchFieldsNiceNames[iNameIndex];
		
		
		var eCell = $("<div></div>")
				.attr("id", sTableName+"_form_cell_"+sCellName);
		var eCellLabel = $("<div></div>")
				.addClass("form_celllabel")
				.attr("id", "form_celllabel_"+sCellName)
				.css("font-weight", "bold")
				.text(sNiceName)
		var eCellField = $("<div></div>")
				.addClass("form_cellvalue")
				.attr("id", "form_cellvalue_"+sCellName);
			
		
		// for flex support, apply order if available	
		if (sOrder != null){
			eCell.css("order", parseInt(sOrder));
		}
		
		
		// a cell can be attached to a group (div container!)
		// or just to the form parent
		if (sCellBlockName == null){
			$(eFormParent).append(eCell);
		}
		else {
			$("#"+sTableName+"_form_cellblock_"+sCellBlockName.replace(/ /g, "_")).append(eCell);
		}
		
		$(eCell)
			.append(eCellLabel)
			.append(eCellField);
		
		// custom class if configured
		if (sCellClass != null){
			eCell.addClass(sCellClass);
		}

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
			
			// remove the ^$ regex option if it is present 
			var iIndexOfEmptyRegex = $.inArray("^$", aNewSelectBoxValues);
			if (iIndexOfEmptyRegex>0) aNewSelectBoxValues.splice(iIndexOfEmptyRegex, 1);			
			
			var eSelectBox = $("<select></select>")
				.css("width", "calc("+aCellSize[0]+" * (var(--"+sFormContainerId+"_cellwidth)))")
				//.css("width", (parseFloat(aCellSize[0]) * iGridWidthUnit) +"px") // prevent large string values from making selectbox too large!
				.css("padding", "5px");
			for (var i=0; i<aNewSelectBoxValues.length; i++){
				eSelectBox.append(
					$("<option></option>")
						.attr("value", aNewSelectBoxValues[i])
						.text(aNewSelectBoxValues[i])
				);
			}
			eCellField.append(eSelectBox);
		}

		// textbox

		else {
			eCellField.append(
				$("<textarea></textarea>")
					.css("padding", "5px")
					.attr("placeholder", sPlaceholder ?? "")
			);
		}
		
		

		// ------------------------------------------
		// put the labels/cells at the right positions
		// ------------------------------------------
		
		if (aPosition != "hidden"){
			
			if (aPosition != null){
				$("#"+sTableName+"_wrapper #"+sTableName+"_form_cell_"+sCellName)
					.css("position", "absolute")
					.css("left", "calc("+aPosition[0]+" * (var(--"+sFormContainerId+"_cellwidth)))")
					.css("top", "calc("+aPosition[1]+" * (var(--"+sFormContainerId+"_cellheight)))");
					//.css("left", (parseFloat(aPosition[0]) * iGridWidthUnit) +"px")
					//.css("top", (parseFloat(aPosition[1]) * iGridHeightUnit) +"px");
			}
					
			// text area size
			$("#"+sTableName+"_wrapper #form_cellvalue_"+sCellName+" textarea")
				.css("width", "calc("+aCellSize[0]+" * (var(--"+sFormContainerId+"_cellwidth)))")
				.css("min-height", "calc("+aCellSize[1]+" * (var(--"+sFormContainerId+"_cellheight)))")
				//.css("width", (parseFloat(aCellSize[0]) * iGridWidthUnit) +"px")
				//.css("height", (parseFloat(aCellSize[1]) *iGridHeightUnit) +"px")
				.addClass("formview_textarea");			
		}
		else {
			$("#" + sTableName + "_wrapper #"+sTableName+"_form_cell_"+sCellName).hide();
		}
		
	}


	// =============
	//   Lists
	// =============

	// ------------------------------------------
	// lists loop
	// ------------------------------------------

	var oLists =  oFormGrid["lists"];
	for (var sListLabel in oLists){

		var aListPosition = 	oLists[sListLabel]["position"];
		var aListDefinition =	oLists[sListLabel]["definition"];
		var sListLabelInGUI =	oLists[sListLabel]["nice_name"];

		// a list can be assigned to a cellgroup too
		var sCellBlockName = 	oLists[sListLabel]["cellgroup"];
		
		
		// table to build

		var sTableFeedingList = oLists[sListLabel]["table"]["name"];
		var oSortSettings = 	oLists[sListLabel]["table"]["columns_sorting"];


		// build the list div

		var sBgColor = oFormGrid["lists"][sListLabel]["bgcolor"];
		if (sBgColor == null) sBgColor = "#FFFFFF";

		var listAndLabelContainer = 
			$("<div></div>")
				.addClass("formview_listlabel_container")
				.append(
					$("<div></div>")
						.addClass("formview_listlabel")
						.attr("id", "formview_listlabel_"+sListLabel)
						.css("font-weight", "bold")
						.text(sListLabelInGUI != null ? sListLabelInGUI : sListLabel) 
				);
		var listContainer = $("<div></div>")
			.addClass("formview_list")
			.css("background-color", sBgColor)
			.attr("id", lists.buildTableContainerId(sFormContainerId, sListLabel));
		
		listAndLabelContainer.append(listContainer);
		
		// a list can be attached to a group (div container!)
		// or just to the form parent
		if (sCellBlockName == null){
			eFormParent.append(listAndLabelContainer);
		}
		else {
			var sCellBlockId = sTableName+"_form_cellblock_"+sCellBlockName.replace(/ /g, "_");
			$("#"+sCellBlockId).append(listAndLabelContainer);
			
			// add a click event to the cell block to redraw the list
			// (this is needed to allows the list's headers to adapt in the container)
			/*
			setTimeout(function(){
				$('h3[aria-controls="'+sCellBlockId+'"]').bind("click", function(){
					(lists.getDataTableObjectOf(sListLabel)).draw();
				});
			}, 500);
			*/


		}
		
		
		

		// put the list div at right position

		if (aListPosition != null){
			listAndLabelContainer
				.css("position", "absolute")
				.css("left", "calc("+aListPosition[0]+" * (var(--"+sFormContainerId+"_cellwidth)))")
				.css("top", "calc("+aListPosition[1]+" * (var(--"+sFormContainerId+"_cellheight)))");
				//.css("left", (parseFloat(aListPosition[0]) * iGridWidthUnit) +"px")
				//.css("top", (parseFloat(aListPosition[1]) * iGridHeightUnit) +"px");
		}
		listContainer
			.css("width", "calc("+aListDefinition[0]+" * (var(--"+sFormContainerId+"_cellwidth)))")
			.css("height", "calc("+aListDefinition[1]+" * (var(--"+sFormContainerId+"_cellheight)))");
			//.css("width", (parseFloat(aListDefinition[0]) * iGridWidthUnit) +"px")
			//.css("height", (parseFloat(aListDefinition[1]) * iGridHeightUnit) +"px");

		// build the HTML table for the list,
		// attach it to the div,
		// and instantiate it as a Datatable
		lists.register(sListLabel, sFormContainerId, sTableFeedingList, (parseFloat(aListDefinition[1]) *iGridHeightUnit) +"px", oSortSettings);
	}

	// now build all lists
	lists.buildLists(sTableName);


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
		var sButtonClass =	 	oCustomButtons[sButtonName]["class"];
		var sButtonNiceName = 	oCustomButtons[sButtonName]["nice_name"];
		if (aButtonPosition == null) {
			fn.message(lang.error, (lang.formlist_missing_parameter).replace(/TABLENAME/g, sTableName).replace(/PARAM/g, "buttons:{position}"));
		}
		var aButtonDefinition =	oCustomButtons[sButtonName]["definition"];
		if (aButtonDefinition == null) aButtonDefinition = [1, 0.5]; // default

		// build button

		var customButton = $("<button>")
			.addClass("formview_button")
			.append( 
				$("<span></span>").css("color", (sButtonColor!=null ? sButtonColor : "white") ).html(sButtonNiceName ?? sButtonName) 
			)
			.css("background-color", (sButtonBgColor!=null ? sButtonBgColor : "blue") )
			.attr("id", "form_button_"+sButtonId)
			.attr("name", sButtonName)
			.click(function(){
				
				// get config given this node
				var sTableName = 		form.getFeedingTable(this);
				var oTableSettings =    conf.getTableSettings(sTableName);
				var oFormGrid =         conf.getFormGrid(oTableSettings);

				// retrieve button config by its name
				var sThisButtonName = $(this).attr("name");
				var oCustomButtons = oFormGrid["buttons"]
				var fnCallback = oCustomButtons[sThisButtonName]["click"]; 
				fnCallback(mt.getDataTableObjectOf(sTableName));
			});
		eFormParent.append(
			$("<div></div>")
				.attr("id", sTableName+"_form_button_"+sButtonId)
				.append(customButton)
		);
		
		// custom class if configured
		if (sButtonClass != null){
			customButton.addClass(sButtonClass);
		}

		// put button at right position

		$("#"+sTableName+"_wrapper div#"+sTableName+"_form_button_"+sButtonId)
			.css("position", "absolute")
			.css("left", "calc("+aButtonPosition[0]+" * (var(--"+sFormContainerId+"_cellwidth)))")
			.css("top", "calc("+aButtonPosition[1]+" * (var(--"+sFormContainerId+"_cellheight)))");
			//.css("left", (parseFloat(aButtonPosition[0]) * iGridWidthUnit) +"px")
			//.css("top", (parseFloat(aButtonPosition[1]) * iGridHeightUnit) +"px");
		$("#"+sTableName+"_wrapper button#form_button_"+sButtonId)
			.css("width", "calc("+aButtonDefinition[0]+" * (var(--"+sFormContainerId+"_cellwidth)))")
			.css("height", "calc("+aButtonDefinition[1]+" * (var(--"+sFormContainerId+"_cellheight)))");
			//.css("width", (parseFloat(aButtonDefinition[0]) * iGridWidthUnit) +"px")
			//.css("height", (parseFloat(aButtonDefinition[1]) *iGridHeightUnit) +"px");
	}


	// ------------------------------------------
	// buttons for reset or validation
	// ------------------------------------------

	var iButtonDivLeft = "(var(--"+sFormContainerId+"_cellwidth))";
	var iButtonDivTop = "calc("+ iFormHeight +" - (var(--"+sFormContainerId+"_cellheight)))";//(iFormHeight - iGridHeightUnit);
	if (oFormGrid["buttonsbar_position"] != null){
		//iButtonDivLeft = oFormGrid["buttonsbar_position"][0] * iGridWidthUnit;
		//iButtonDivTop = oFormGrid["buttonsbar_position"][1] * iGridHeightUnit;
		iButtonDivLeft = "calc("+ oFormGrid["buttonsbar_position"][0] +" * (var(--"+sFormContainerId+"_cellwidth)))";
		iButtonDivTop = "calc("+ oFormGrid["buttonsbar_position"][1] +" * (var(--"+sFormContainerId+"_cellheight)))";
	}  
	var buttondsDiv = $("<div></div>")
		.attr("id", sTableName+"_formsbuttons")
		.css("position", "absolute")
		.css("left", iButtonDivLeft )
		.css("top", iButtonDivTop );

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

			var sTableName = 		form.getFeedingTable(this);
			var oTableSettings =    conf.getTableSettings(sTableName);
			var oFormGrid =         conf.getFormGrid(oTableSettings);
			var oCells =  			oFormGrid["cells"];
			var oLists =			oFormGrid["lists"];
			var fnSaveCallback = 	oFormGrid["save_callback"];


			// Register the selected rows in lists
			// (so we'll be able to restore selection after saving)
			var aSelectedRowsInLists = {};
			for (var sListLabel in oLists){
				var aRows = lists.getSelectedRows(sListLabel);
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

				// click the form reset button to load current form data (with new IDs etc)
				setTimeout(function(){
					$("div#"+sTableName+"_form button#reset_button").click();
				}, 500);

				// give the send-button a new color to show update was performed
				// and show that reset is NOT possible anymore 
				form.setSendButtonToSetting(sTableName, "alliswel");
				form.setResetButtonToSetting(sTableName, "off");


				// make sure that the tables underlying the form's lists
				// are refreshed, in case those are loaded in the GUI already
				for (var sListLabel in oLists){
					
					lists.refresh(sListLabel, null, false);
					
					var sTableToRefresh = lists.getFeedingTable(sListLabel);
					if (fn.tableExists(sTableToRefresh)){
						fn.refreshTable(sTableToRefresh);
					}
						
				}


				// restore row selection in lists		

				setTimeout(function(){
					for (var sListLabel in aSelectedRowsInLists){
						var sRowId = aSelectedRowsInLists[sListLabel];
						lists.selectRow(sListLabel, sRowId);						
						lists.clickOpenInSelectedRow(sListLabel);
					}
				}, 500);				
				
			};

			// add this job to the jobs list
			fnDoAllUpdates.addJob(fnAllWentWell);
			
			
			
			// if there is a save callback set, 
			// add that as a job too
			if (fnSaveCallback != null){
				
				var fnCallbackWhenSaving = function(){
					fnSaveCallback( mt.getDataTableObjectOf(sTableName) );
				};				
				fnDoAllUpdates.addJob(fnCallbackWhenSaving);				
			}

			

			// Start! ----------------------------------------------------------------------------------------------------------------------------------------

			return fnDoAllUpdates;


		});
	buttondsDiv.append(formSendButton);
	
	// append the buttons
	$(eFormParent).append(buttondsDiv);	



	// ------------------------------------------------------------------------
	// force tooltip to fade, otherwise it sometimes keeps in sight
	// ------------------------------------------------------------------------

	$("#tiptip_holder").fadeOut();
	setTimeout(function(){
		$("#tiptip_holder").fadeOut();
	}, 500);
	
	
	$("#"+sFormContainerId).css("width", iFormWidth +"px");

};


/**
 * Update the form layout
 * This can be called (e.g. in 'resize_callback') to make sure that the form keeps looking how it should after resizing etc.
 * @param {String} table name of form container to update
 * @param {Boolean} [bHorizontalScaling=true] perform horizontal scaling
 * @param {Boolean} [bVerticalScaling=true] perform vertical scaling
 */
form.updateLayout = function(sTableName, bHorizontalScaling, bVerticalScaling){
	
	sTableName = fn.getTableName(sTableName);
	
	// default values
	bHorizontalScaling = bHorizontalScaling ?? true;
	bVerticalScaling = bVerticalScaling ?? true;
	
	var sFormContainerId = sTableName+"_form";
	
	var oTableSettings =    conf.getTableSettings(sTableName);
	var oFormGrid =         conf.getFormGrid(oTableSettings);
	
	var aSize =             oFormGrid["size"];
	if (aSize == null){
		aSize = [0, 0] // default
	}
	var iFormWidth = 		parseInt(aSize[0]);
	var iFormHeight = 		parseInt(aSize[1]);
	
	// get definition size
	var aDefinition =       oFormGrid["definition"];
	var iDefWidth = 		aDefinition[0];
	var iDefHeight = 		aDefinition[1];
	

	// get table size (the form grid pixel size must fit into it)	
	var iTableWidth = parseInt( $( "#"+sTableName+"_dynamic" ).css("width") );
	var iTableHeight = parseInt( $( "#"+sTableName+"_dynamic" ).css("height") ) - parseInt( $( "#"+sTableName+"_dynamic .top" ).css("height") );
	
	// if the given height and/or width is larger than the table, or it has a 0 value, set it to the table size	
	if (iFormWidth == 0 || iFormWidth > iTableWidth ) iFormWidth = iTableWidth;
	if (iFormHeight == 0 || iFormHeight > iTableHeight ) iFormHeight = iTableHeight;
	
	// compute cell pixel size
	var iGridWidthUnit = 	iFormWidth / iDefWidth;
	var iGridHeightUnit = 	iFormHeight / iDefHeight;
	
	
	// set css variables for rescaling
	if (bHorizontalScaling) {
		fn.setCssVariable(sFormContainerId+"_cellwidth", iGridWidthUnit+"px");
	}
	if (bVerticalScaling) {
		fn.setCssVariable(sFormContainerId+"_cellheight", iGridHeightUnit+"px");
	}
	
	var sFormPositionSetting = oFormGrid["align"];
	var sFormPosPix = (iTableWidth - iFormWidth)/2; //default: center
	if (sFormPositionSetting == null ||  sFormPositionSetting == "left"){
		sFormPosPix = 10;
	}
	else if (sFormPositionSetting == "right"){
		sFormPosPix = (iTableWidth - iFormWidth) - 10;
	}
	
	// set search fields width
	$("#"+sTableName+"_search_and_sort").css("width", iFormWidth +"px");
	
	// set the container width
	$("#"+sFormContainerId).css("width", iFormWidth +"px");
	
	// set the search fields width
	var iPercentage = (parseInt( $( "#"+sTableName+"_dynamic" ).css("width") ) / parseInt( $(window).width() ) );
	$("#"+sTableName+"_search_and_sort_table tr td").css("width", "calc("+iPercentage+" * (var(--"+sTableName+"_form_cellwidth)))");
}



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
	

	
	// get the current row content
	// fore looping through the cells
	
	var nRow = fn.getActiveRowNode(sTableName);
	if (nRow == null){
		console.log("The active row of table "+sTableName+" is null, so editable view mode is not possible.");
	}
	
	
	// cells loop
	
	var oCells = 	oFormGrid["cells"];
	
	for (var sCellName in oCells){

		var sBgColor = oFormGrid["cells"][sCellName]["bgcolor"];
		if (sBgColor == null) sBgColor = "#FFFFFF";		

		// if there are no results, the row might be null
		if (nRow != null){
			
			// remove disabled color in case it was put there in previous round
			$("#"+sTableName+"_wrapper #"+sTableName+"_form").removeClass("form_overlay");
			if ($("#"+sTableName+"_wrapper #"+sTableName+"_form #"+sTableName+"_inbetween_div").elementExists()){
				$("#"+sTableName+"_wrapper #"+sTableName+"_form #"+sTableName+"_inbetween_div")
					.removeClass("form_overlay");
			}

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

			// checkbox
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
			// selectbox
			else if (aSelectBoxValues != null && aSelectBoxValues.length>1){

					$("#"+sTableName+"_wrapper #form_cellvalue_"+sCellName+" select")					
						.val(sData)
						.attr("disabled", !bEditable);
					$("#"+sTableName+"_wrapper #form_cellvalue_"+sCellName)
						.css("background-color", sBgColor)
						.removeClass("modified");
			}
			// textbox
			else {
				var fnRender = oFormGrid["cells"][sCellName]["render"];
				var sTextData = (fnRender != null ? fnRender(sData) : sData); 
				
				$("#"+sTableName+"_wrapper #form_cellvalue_"+sCellName+" textarea")
					.val(sTextData)
					.css("background-color", sBgColor)
					.css("pointer-events", bEditable ? "auto" : "none"); // trick to allow click event, which 'disabled' doesn't
				$("#"+sTableName+"_wrapper #form_cellvalue_"+sCellName)
					.removeClass("modified");
			}



			// is the cell clickable?

			if (oFormGrid["cells"][sCellName]["click"] != null){

				$("#"+sTableName+"_wrapper #form_cellvalue_"+sCellName).off("click");
				$("#"+sTableName+"_wrapper #form_cellvalue_"+sCellName).on("click", function(){

					var nFormCell = this;

					var sCellId = 			$(nFormCell).closest("div[id^='form_cellvalue_'")[0].id;
					var sCellName = 		sCellId.replace(/^form_cellvalue_/, "");
					var sFormTable = 		form.getFeedingTable(nFormCell);
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

				// textarea
				$("#"+sTableName+"_wrapper #form_cellvalue_"+sCellName+" textarea").keyup(function(){

					// some keys are not to be considered as 'content modification'
					var sPressedKey = kf._getPressedKey();
					var aNonCharKeys = ["uparrow", "downarrow", "leftarrow", "rightarrow", "shift", "ctrl", "alt", "home", "end", "pageup", "pagedown", "insert"];
					if ($.inArray(sPressedKey, aNonCharKeys)>=0) return;
					 
					// past this point, we do have a content modification
					$(this).parent().addClass("modified");

					// attract attention from user to send button, which must be pressed 
					// since some content was modified,
					// and show that reset is possible now
														
					form.setSendButtonToSetting(sTableName, "payattention");
					form.setResetButtonToSetting(sTableName, "active");

				});

				// selectbox
				$("#"+sTableName+"_wrapper #form_cellvalue_"+sCellName+" select").change(function(){

					$(this).parent().addClass("modified");

					// attract attention from user to send button, which must be pressed 
					// since some content was modified,
					// and show that reset is possible now
														
					form.setSendButtonToSetting(sTableName, "payattention");
					form.setResetButtonToSetting(sTableName, "active");

				});

                // checkbox
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
		
		// if the row is empty, show the form is disabled
		else {			
			$("#"+sTableName+"_wrapper #"+sTableName+"_form")
				.addClass("form_overlay");
			setTimeout(function(){				
				if ($("#"+sTableName+"_wrapper #"+sTableName+"_form #"+sTableName+"_inbetween_div").elementExists()){
					$("#"+sTableName+"_wrapper #"+sTableName+"_form #"+sTableName+"_inbetween_div")
						.addClass("form_overlay");
				}
			}, 500);
			
		}	

	} // end of cell loop


	// now update the lists
	
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

	// instantiate the jobs 
	// for lists updates to perform

	const fnDoListsUpdates = new PromiseQueue();

	for (var sListLabel in oListLabel2Filters){
		
		// one list job
		var fnUpdateOneFormList = function(sListLabel){
			
			var sFormContainerId = 	lists.getFormContainerId(sListLabel);
			var sTableId =			lists.buildTableId(sFormContainerId, sListLabel);
			var oTable = 			null; // null on purpose, value will be read later on
			var iWait =				100;
			
			// function to execute as soon as list is built and ready to be fed
			var fnFeedTheList = function(sListLabel){
				
				// feed the lists
				lists.feed(sListLabel, oListLabel2Filters[sListLabel], function(){

					// make the list editable
					var sTableToFeedTheListWith = 	oLists[sListLabel]["table"]["name"];
					form.makeListEditable(sListLabel, sTableToFeedTheListWith);
				});
			};
			
			// wait till the Datatable object of the list is built (at first call only)
				
			var iInterval = setInterval(function(){

				oTable = lists.getDataTableObjectOf(sTableId);
				
				// Datatable object available, so we can feed it now!
				if (oTable != null){
					clearInterval(iInterval);
					fnFeedTheList(sListLabel);
				}					
			}, iWait);						
		};

		// add this job to the lists updates to perform
		fnDoListsUpdates.addJob( fnUpdateOneFormList(sListLabel) );
	};
	
	// Start! ----------------------------------------------------------------------------------------------------------------------------------------

	return fnDoListsUpdates;
	
};

/**
 * Activate the jquery UI accordion function
 * onto a form containing "cellgroups" sections
 */
form.activateAccordion = function(sTableName){
	
	if (typeof sTableName == 'object')
		sTableName = fn.getTableName(sTableName);
	
	if (fn.getViewType(sTableName) == "form") {
			
		// add a dedicated div for the accordion view
		// because we don't want some parts like the reset/save buttons to be in the accordion view as well
		
		if ($("#"+sTableName+"_inbetween_div").length == 0) {
			
			$( "#"+sTableName+"_form" ).append(
				$("<div></div>")
					.attr("id", sTableName+"_inbetween_div")
			);
			
			// copy the form sections into the accordion div
			// except the reset/save buttons!
			
			$("#"+sTableName+"_form").children()
				.not("#"+sTableName+"_formsbuttons")		// exclude the reset/save buttons
				//.not(".formview_listlabel_container")		// exclude the lists
				.appendTo("#"+sTableName+"_inbetween_div");
		
		    // make the accordion now
			$( "#"+sTableName+"_inbetween_div" ).accordion({
				animate: 100
			});
		}
	}
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
};




// make a form list editable
//
form.makeListEditable = function(sListLabel, sTableToFeedTheListWith){	

	// get Datatable object of this list
	var sFormContainerId =	lists.getFormContainerId(sListLabel);
	var sFormTable = 		form.getFeedingTable(sFormContainerId);
	var sFormAndListLabel =	lists.buildTableId(sFormContainerId, sListLabel);	
	var oTable = 			lists.getDataTableObjectOf(sFormAndListLabel);

	var aTableSettings = conf.getTableSettings(sFormTable);
	var oForm = conf.getFormGrid(aTableSettings);
	var oColumnsConfig = oForm["lists"][sListLabel]["table"]["columns"];

	var oTableConfig = conf.getTableConfig(sTableToFeedTheListWith);

	$("#"+sFormAndListLabel+" thead th").each(function(i){

		var eThisCol = this;
		var sColName = $(eThisCol).text();
		var oColumnConfig = conf.getColumnConfig(oTableConfig, sColName);
		var bEditable = conf.getEditability(oColumnConfig);
		var bClickable = false; // in this case, we don't use the table config, since it mostly doesn't meet the form logic
		
		// we will need the column index
		var iColIndex = $("#"+sFormAndListLabel+" thead").find("th").index(eThisCol);
		var iColNameIndex = $.inArray(sColName, mt.getListOfColumnsOf(sTableToFeedTheListWith));
		
		// formgrid config overrides the table config
		if (oColumnsConfig[sColName] != null){

			if (oColumnsConfig[sColName]["editable"] != null)
				bEditable = oColumnsConfig[sColName]["editable"];

			if (oColumnsConfig[sColName]["click"] != null)
				bClickable = true;
		}
		
		
		// take care of select boxes
		// [1] select values from 'choosefrom' in config.js
		var aAllowedValues = 	conf.getSelectionBox(oColumnConfig);
		var aValuesToLabels = 	conf.getSelectionBoxLabels(oColumnConfig);		
		// [2] ELSE  select values from Postgres ENUM type
		if (aAllowedValues == null)
			aAllowedValues = mt.getListOfAllowedValuesInVisibleColumnsOf(sTableToFeedTheListWith)[iColNameIndex];
			


		// make column editable if required:
		if (bEditable){
            // as a text field
            if (aAllowedValues == null || aAllowedValues.length <= 1){
				$("#"+sFormAndListLabel+" tbody tr").each(function(){
					$(this).find("td").eq(iColIndex).addClass("editable");					
				});
			}
			// as a select box
			if (aAllowedValues != null && aAllowedValues.length > 1){
				$("#"+sFormAndListLabel+" tbody tr").each(function(){
					$(this).find("td").eq(iColIndex).addClass("editable_selectbox");
				});
			}
		}

		// if column must be clickable:
		if (bClickable){

			$('table#'+sFormAndListLabel+' tbody tr').off("click", 'td:eq('+iColIndex+')');
			$('table#'+sFormAndListLabel+' tbody tr').on("click", 'td:eq('+iColIndex+')', function(event){

				var nCell = this;

				var sListLabel = 		lists.getLabelFromNode(nCell);
				var sFormContainerId =	lists.getFormContainerId(sListLabel);
				var sFormTable = 		form.getFeedingTable(sFormContainerId);
				var aTableSettings = 	conf.getTableSettings(sFormTable);
				var oFormGrid = 		conf.getFormGrid(aTableSettings);

				// get function and call it with the needed arguments
				var fnFunction = oFormGrid["lists"][sListLabel]["table"]["columns"][sColName]["click"];
				fnFunction(sListLabel, nCell);


			});

		}
	});


	$(oTable.cells('td.editable').nodes()).off();
	
	$(oTable.cells('td.editable').nodes()).editable(
		
		function(value, settings){				// submit function

			$(this).addClass("modified");

			// redraw table
			var sThisTable =	$(this).closest('table')[0].id;
			var oTable = 		lists.getDataTableObjectOf(sThisTable);
			oTable.draw(false);

			return(value);
		},
		{
			
			"onblur": function(value){
				
				var sListLabel = 	lists.getLabelFromNode(this);
				var sFormTable = 	form.getFeedingTable(this);
				var sListTable = 	lists.getFeedingTable(sListLabel);
				var sThisTable =	$(this).closest('table')[0].id;
				var oTable = 		lists.getDataTableObjectOf(sThisTable);
				
				var oGrid = lists.getConfig(this);
				var bEnterValidation = oGrid["enter_validation"] ?? true;
				
				
				// if Enter validation is required, blur triggers reset
				
				if (bEnterValidation){
					
					this.reset(value);
				}
				
				// but if no validation is needed, submit right away
				//
				// BUGGY BUGGY BUGGY BUGGY BUGGY
				//
				// BUGGY FOR NOW because click event gets detached, which is unwished for!
				//
				// BUGGY BUGGY BUGGY BUGGY BUGGY
				else {
					
					// mark modification
					$(this).addClass("modified");
					
					// submit
					$(this).closest('form').submit();
					
					// attract attention
					form.setSendButtonToSetting(sFormTable, "payattention");
					form.setResetButtonToSetting(sFormTable, "active");
					
					// assign value											
					oTable.cell(this).data(value);
					
					// the previous statement kills jeditable, so restore it
					//setTimeout(function(){ form.makeListEditable(sListLabel, sListTable);}, 500);
					
				}
			},
			"callback": function(value, settings){ 	// callback is called after submit function
				
				var sThisTable =	$(this).closest('table')[0].id;
				var oTable = 		lists.getDataTableObjectOf(sThisTable);

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
		var oListConfig =	lists.getConfig(nThis);
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
			
			var sFormTable = form.getFeedingTable(this);
			
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
	
	
	// make selectboxes editable

	$(oTable.rows().nodes()).each(function(){
		
		var nRow = this;
		
		$(nRow).find("td.editable_selectbox").each(function(){		
		
			var nCell = this;
			
			// we will need the column index
			var iColIndex = $(nRow).find("td").index(nCell);
			
			var aVisibleColumns =   lists.getColumnsToDisplay(oForm["lists"], sListLabel);
			var sCellName = 		aVisibleColumns[iColIndex];			
			var iColNameIndex = 	$.inArray(sCellName, mt.getListOfColumnsOf(sTableToFeedTheListWith));
			
			// we need to know which value is currently assigned to the cell, in order to show it as 'selected' in the selectbox
			var sValueOfThisCell = 	lists.getDataFromCell(sListLabel, nCell);
			
			// get the values to select from
			var oTableConfig = 		conf.getTableConfig(sTableToFeedTheListWith);
			var oColumnConfig = 	conf.getColumnConfig(oTableConfig, sCellName);
			
			// [1] select values from 'choosefrom' in config.js
			var aAllowedValues = 	conf.getSelectionBox(oColumnConfig);
			var aValuesToLabels = 	conf.getSelectionBoxLabels(oColumnConfig);		
			// [2] ELSE  select values from Postgres ENUM type
			if (aAllowedValues == null)
				aAllowedValues = mt.getListOfAllowedValuesInVisibleColumnsOf(sTableToFeedTheListWith)[iColNameIndex];		
			
			
			
			// we will implement a function timeout, in such a way that the selectbox only appears when the user stays on the cells a little bit
			// that prevents selectboxes to appear everywhere the mouse goes!
			let mouseoverTimeout;
			
			
			$(nCell)
				.data("tablename", sTableToFeedTheListWith)
				.data("cellname", sCellName)
				.data("allowed_values", aAllowedValues)
				.on("mouseover", function(){
			
					const cell = $(this); // Store a reference to the current cell
					mouseoverTimeout = setTimeout(() => {
						
						cell.editable( 
					
							// this comes into action only once some value was chosen in the select-menu
							function(value, settings){
								
								// current node 
								var nCurrentNode = this;
								
								// instead of submitting an url (default in jEditable)
								// we submit an own function which makes an Ajaxcall
								// (so we control everything!)
								var aPos = lists.getDataTableObjectOf(sListLabel).cell( nCurrentNode ).index();
								
								// check if we have a custom editing function from config file
								// if available, it must overrule the normal (following) function
								var oTableConfig = 		conf.getTableConfig(sTableToFeedTheListWith);
								var sColumnName = 		mt.getListOfColumnsOf(sTableToFeedTheListWith)[aPos.column];
								var sColumnType = 		mt.getListOfColumnTypesOf(sTableToFeedTheListWith)[aPos.column];
								var oColumnConfig = 	conf.getColumnConfig(oTableConfig, sColumnName);
								var fnEditCallback = 	conf.getEditCallback(oColumnConfig);
								var fnEditErrorHandler = conf.getEditErrorHandler(oColumnConfig);
		
												
								
								// default behaviour is saving the value client-side,
								// but sending it to the server only happens when the user clicks on the Save button
								// (default: false)
										
								var bSendToServer = false;
																
								if (bSendToServer){
												
									lists.showProcessingMsg(sListLabel, true);
									
									var rowId = this.parentNode.getAttribute('id');
									var url = WEBSERV_URL+"/api/setvalue";
									$.ajax( {
										"type": "GET",
										"async": false,
										"url": url,
										"data": {
											"row_id": rowId,
											"db_name": getHttpParams().get("db"),
											"table_name": sTableToFeedTheListWith,
											"column_name": sColumnName,
											"new_value": value,
											"value_type": sColumnType,
											"dummy": getUniqueNumber()
											},
										"dataType": "xml", // get response as xml
										"success": function(xml) {
											lists.removeProcessingMsg(sListLabel, true);
											if (gui.getDbResponse(xml)) {
												
												// put the new value into the Datatable object 							 			
												lists.getDataTableObjectOf(sListLabel).cell(nCurrentNode).data(value);
												
												// callcack function, if it is set in configuration
												if (fnEditCallback!=null)
													fnEditCallback(lists.getDataTableObjectOf(sListLabel), nCurrentNode, value);
											}
											else {
												fn.message(lang.error_occurred_in_table+ " '"+sTableToFeedTheListWith+"'", 
														lang.some_error_has_occurred+ " ["+gui.getDbResponse(xml)+"]",
														function(){
															lists.refresh(sListLabel);
														}
												);
											}
										},
										"error": function(jqXHR, textStatus, errorThrown){
											
											if (fnEditErrorHandler != null) {
												lists.removeProcessingMsg(sListLabel, true);
												fnEditErrorHandler({
													"jqXHR": jqXHR, "textStatus": textStatus, "errorThrown": errorThrown, 
													"listLabel": sListLabel,
													"tableName": sTableToFeedTheListWith, "columnName": sColumnName, "columnValue": value
													});
											}
											else {
												fn.message(lang.error_occurred_in_table+ " '"+sTableToFeedTheListWith+"'", 
														lang.some_error_has_occurred+ ": "+textStatus+" "+errorThrown+"; "+getJqXHRInfo(jqXHR),
														function(){
															lists.refresh(sListLabel);															
														}
												);
											}
											
										}
											
									} );
											
								}
								
								// default action
								else {
									
									// put the new value into the Datatable object 							 			
									lists.getDataTableObjectOf(sListLabel).cell(nCurrentNode).data(value);
									
									// mark modification
									$(nCurrentNode).addClass("modified");
									
									// attract attention from user to send button, which must be pressed 
									// since some content was modified,
									// and show that reset is possible now
																		
									form.setSendButtonToSetting(sFormTable, "payattention");
									form.setResetButtonToSetting(sFormTable, "active");
									
									// callcack function, if it is set in configuration
									if (fnEditCallback!=null)
										fnEditCallback(lists.getDataTableObjectOf(sListLabel), nCurrentNode, value);
								}
								
							},
							
								
							// parameters
							// NOTE:
							// we added a callback as we need to put the chosen value into the jeditable internal settings
							// in such a way, that jeditable knows that value should be shown as 'selected'
							{
							    "data": gui._buildDataArrayForJEditable( sTableToFeedTheListWith, $(this).closest("td").data("allowed_values"), sValueOfThisCell, aValuesToLabels ),
							    "type": "select",
							    "event": "dblclick",
							    "onblur": "cancel", 							
								"callback": function(value, settings) {
									value = value.replace("&amp;", "&"); // prevent mismatch of value, as jeditable converts & into &amp;
									settings.data.selected = value;
							     },
								"height": "14px",
						        "width": "100%",
						        "tooltip": lang.click_to_edit,
						        "placeholder" : "" // prevents filling empty cells with default msg 'Click to edit'
							}
						); // end of jEditable for select boxes
						
						// Trigger the editable manually
						cell.trigger("dblclick");
						
					}, 250);
					
				})
				.on("mouseout blur", function(){
					clearTimeout(mouseoverTimeout);
				});
				
			});
	});
};



// process added rows in a list
//
form.addNewRows = function(eListContainer, fnCallback){
	
	var sListContainerId =	eListContainer.attr("id");

	var sListTableId =		lists.getTableIdFromContainerId(sListContainerId);
	var oTable = 			lists.getDataTableObjectOf(sListTableId);

	var sListLabel = 		lists.getLabelFromContainerId(sListContainerId);
	var sTableToUpdate = 	lists.getFeedingTable(sListLabel);	
	var aAllColumns = 		lists.getAllColumns(sTableToUpdate);

	var iTotalNumberToBeAdded = $("#"+sListTableId).find("tr.added").length;
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
				if (sColValue != "<NULL>"){
					aColNamesToAdd.push(sColName);
					aValuesToAdd.push(sColValue);
				}			
			}
			
			// insert record into the database
			var url = WEBSERV_URL+"/api/insertvalue"; 
			
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
form.updateModifiedRows = function(eListContainer, fnCallback){

	var sListContainerId =	eListContainer.attr("id");

	var sListTableId =		lists.getTableIdFromContainerId(sListContainerId);
	var oTable = 			lists.getDataTableObjectOf(sListTableId);

	var sListLabel = 		lists.getLabelFromContainerId(sListContainerId);
	var sTableToUpdate = 	lists.getFeedingTable(sListLabel);	
	 

	var iTotalNumberOfModified = $("#"+sListTableId).find("td.modified").length;
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
					var sColName = $("#"+sListTableId+" thead th").eq(iColIndex).text();				
					var sColValue = $(thisCell).text();

					aColumnNames.push(sColName);
					aColumnValues.push(sColValue);
				});

				
				// update the database
				var url = WEBSERV_URL+"/api/setvalue"; 

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
form.removeRows = function(eListContainer, fnCallback){

	var sListContainerId =	eListContainer.attr("id");

	var sListTableId =		lists.getTableIdFromContainerId(sListContainerId);		
	var oTable = 			lists.getDataTableObjectOf(sListTableId);	

	var sListLabel = 		lists.getLabelFromContainerId(sListContainerId);
	var sTableToUpdate = 	lists.getFeedingTable(sListLabel);

	var sIdsToRemove = $("#"+sListContainerId).attr("remove_ids"); 

	if (sIdsToRemove != null){

		var aIdsToRemove = sIdsToRemove.split(",");
		
		for (var i=0; i<aIdsToRemove.length; i++){

			var sNodeId = aIdsToRemove[i];

			var url = WEBSERV_URL+"/api/delete_row"; 
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
//
// API
//
// --------------------------------------------------------------------


/**
 * Empty/reset the searchbox of the form
 * @param {String} name of the table underlying the form
 */
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
		var aVisibleCols = form.getVisibleColumnsOf(sTableName);
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

};




/**
 * Find the name of the table underlying the current form 
 * (t.i. NOT the tables feeding the lists)
 * @param {(String|Node)} the string id of the form; or any node in the form
 * @returns {String} the name of the table
 */
form.getFeedingTable = function(mixed){

	var sThisTable;

	// based on element ID string
	if (typeof mixed == 'string'){
		sThisTable = mixed.replace(/_form$/g, "");
	}

	// based on node
	else {
		var sThisElemId = $(mixed).closest('div.formgrid')[0].id;
		sThisTable = sThisElemId.replace(/_form$/g, "");
	}	
	return sThisTable;
};



// --------------------------------------------------------------------


/**
 * Compute list of visible form columns, given the underlying table config AND the form config combined
 * (if the visibility parameter is set in both, the form config parameter setting wins)
 * @param {String} name of the table underlying the form
 * @returns {Array} list of visible columns in the form 
 */
form.getVisibleColumnsOf = function(sTableName){

	// get visibility according to table config
	var aVisibleColumns = cloneArray( mt.getListOfVisibleColumnsOf(sTableName) );

	// then get the form config:
	// the form visibility settings there will overwrite the table config
	// (at least if some formgrid was defined!)

	var aTableSettings = conf.getTableSettings(sTableName);
	var oGrid = conf.getFormGrid(aTableSettings);
	
	if (oGrid != null && oGrid["cells"] != null){
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
	}	

	return aVisibleColumns;
}


/**
 * Compute the list of nice names of form columns, given the table config AND the form config
 * (if the nice name parameter is set in both, the form config parameter setting wins)
 * @param {String} name of the table underlying the form
 * @returns {Array} list of columns of the form, with names replaced by nice names [if available] 
 */
form.getColumnsNiceNames = function(sSomeTable){

	var sTableName = (typeof sSomeTable == 'object') ? fn.getTableName(sSomeTable) : sSomeTable;
	var oTableConfig = conf.getTableConfig(sTableName);
	var aTableSettings = conf.getTableSettings(sTableName);
	var oGrid = conf.getFormGrid(aTableSettings);
	
	var aColsList = form.getVisibleColumnsOf(sTableName);
	
	if (oGrid["cells"] == null){		
		//fn.message(lang.error, (lang.formlist_missing_parameter).replace(/TABLENAME/g, sTableName).replace(/PARAM/g, param));
		return [];
	}
	
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



/**
 * Read the value of a cell in the form
 * @param {String} name of the table underlying the form 
 * @param {String} name of the cell/column 
 * @param {Boolean} true: get value out of the underlying table - false: get value currently visible in the form (even if not saved yet)
 */
form.getDataFromCell = function(sFormTable, sCellName, bUnderlying){
	
	// we need the table name
	if (typeof sFormTable == 'object')
		sFormTable = fn.getTableName(sFormTable);

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
		return $("div#"+sFormTable+"_form div#form_cellvalue_"+sCellName).children().first().val();
	}
}

/**
 * Set the value of a cell in the form
 * @param {String} name of the table underlying the form 
 * @param {String} name of the cell/column 
 * @param {String} value to assign to the cell (beware: in the GUI, so it's not saved yet in the underlying table) 
 * @param {Boolean} [bAttractAttention=true] attract attention of user by blinking the send button, and show that reset is possible now 
 */
form.setDataInCell = function(sFormTable, sCellName, sValue, bAttractAttention){

	$("div#"+sFormTable+"_form div#form_cellvalue_"+sCellName)
		.addClass("modified")
		.children().first().val(sValue);
	
	// attract attention from user to send button, which must be pressed 
	// since some content was modified, and show that reset is possible now
	//
	// (one can preven this by setting bAttractAttention to false)									
	
	if (bAttractAttention == null || bAttractAttention == true){
		form.setSendButtonToSetting(sFormTable, "payattention");
		form.setResetButtonToSetting(sFormTable, "active");		
	}
	
}


/**
 * Get the name of a cell, given its node
 * @param {Node} node of a cell in the form
 * @returns {String} name/label of the cell 
 */
form.getNameOfCell = function(nCellValueNode){
	return (nCellValueNode.id).replace(/^form_cellvalue_/, "");
}



/**
 * Determine whether the form is in 'unsaved' state or not
 * @param {String} name of the table underlying the form
 * @returns {Boolean} true if the form is not saved yet, otherwise false 
 */
form.isUnsaved = function(sTableName){
	var eFormButtons = $("#"+sTableName+"_formsbuttons");
	return ( eFormButtons.length>0 && 
			eFormButtons.find("#send_button").length>0 && 
			eFormButtons.find("#send_button").hasClass("payattention")
	);
};






