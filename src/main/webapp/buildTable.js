
function getColumnByName(table, columnName) {

	var columnIndex = -1;

	// Loop through each column
	table.columns().every(function (index) {
		var header = this.header();
		if ($(header).text() === columnName) {
			columnIndex = index;
			return false; // break the loop once the column is found
		}
	});

	if (columnIndex !== -1) {
		var column = table.column(columnIndex);
		return column;
	} else {
		console.log('Column not found');
		return null;
	}
}

tb.buildTable = function(sSomeTableName, fnFunction, oExtraTableSettings){
	
	// NB: at this point the table record is already created in the multitables namespace
	
	// retrieve table client configuration and settings
	// alert("Yes, i'm here!")
	var oTableConfig =					conf.getTableConfig(sSomeTableName);

	var aTableSettings =				conf.getTableSettings(sSomeTableName);
	var bIgnoreInitialisationFilters =	false;
	
	// table or view?
	var iIndexOfTable =					$.inArray(sSomeTableName, asTableNames);
	var bTableIsaView =					(asTableTypes[iIndexOfTable] == "view");
	
	
	// ********************************************************************************
	// In the following we always first check the oExtraTableSettings and apply those.
	// But if we lack oExtraTableSettings, we apply the project configuration (config.js file).
	// ********************************************************************************
	
	// view type
	var sViewtype = oExtraTableSettings["viewtype"] != null ? oExtraTableSettings["viewtype"] :
		(aTableSettings!=null ? conf.getViewtype(aTableSettings) : "table");
	mt.setViewType(sSomeTableName, sViewtype);
	
	
	if (oExtraTableSettings["ignore_initialisation_filters"] != null)
		bIgnoreInitialisationFilters = oExtraTableSettings["ignore_initialisation_filters"];
	
	
	// build the table HTML "frame"		

	// what should the table size be according to configuration?	
	var sTableWidth = oExtraTableSettings["width"] != null ?  oExtraTableSettings["width"] :
		(aTableSettings!=null ? conf.getSize(aTableSettings) : "100%");
	
	// add table container div (or update it if it exists already)
	if ( !$("#"+sSomeTableName+"_dynamic").elementExists() )
		{
		$("#dynamic").append(
				$("<div></div>")
				.attr("id", sSomeTableName+"_dynamic")
				.css("z-index", 0)
				);		
		}
	
	// give the table container its needed attributes
	$("#"+sSomeTableName+"_dynamic")
		.addClass("table_div") // table div recognizable as such
		.addClass("ui-widget-content") // needed for resizable, draggable etc
		.css("width", sTableWidth)
		.css("min-height", "500px") // div stretches automatically if contents makes it necessary
		.css("margin-right", "10px");
	
	
	// The table will be given an absolute position
	// (this is needed as otherwise the table, not having a fixed position, 
	//  will get suddenly repositioned when another table is being repositioned by the user)
	
	// 4 possibilities:

	var aConfigPresetPosition = conf.getTablePresetPosition(aTableSettings);
	
	// [1] if a specific table screen position is required, set it now
	if (oExtraTableSettings["left"] != null && oExtraTableSettings["top"] != null)
		{
		$("#"+sSomeTableName+"_dynamic")
			.css("position", "absolute")
			.css("top", oExtraTableSettings["top"])
			.css("left", oExtraTableSettings["left"]);
		}
	// [2] or if some tables are already loaded, pile the tables up
	else if (mt.getListOfLoadedTables().length>1)
		{
		var iPreviousTableIndex = $.inArray(sSomeTableName, mt.getListOfLoadedTables())-1;
		var sLastLoadedTable = mt.getListOfLoadedTables()[iPreviousTableIndex];		
		fn.pileupTables(sLastLoadedTable, sSomeTableName);
		}
	// [3] or if configuration has top/left declared
	else if (aConfigPresetPosition != null){
		var iCurrentLeft = aConfigPresetPosition[0];
		var iCurrentTop = aConfigPresetPosition[1];
		$("#"+sSomeTableName+"_dynamic")
			.css("position", "absolute")
			.css("top", iCurrentTop)
			.css("left", iCurrentLeft);
	}
	// [4] else just make the default position absolute	
	else {		
		var iCurrentLeft = $("#"+sSomeTableName+"_dynamic").offset().left;
		if (iCurrentLeft == 0) iCurrentLeft = $("#indicators").offset().left; // make sure the table is horizontally aligned with indicators div
		
		var iCurrentTop = $("#"+sSomeTableName+"_dynamic").offset().top + 10; // bit of room under the indicators
		$("#"+sSomeTableName+"_dynamic")
			.css("position", "absolute")
			.css("top", iCurrentTop)
			.css("left", iCurrentLeft);
		}
	
		

	// make table resizable or not
	if (conf.getTableResizable(aTableSettings)){

		$("#"+sSomeTableName+"_dynamic") // a table container should be resizable
		.resizable({
			"resize": function(event, ui){

				// resize is only for width
				// https://stackoverflow.com/questions/3628194/how-to-resize-only-horizontally-or-vertically-with-jquery-ui-resizable
				ui.size.height = ui.originalSize.height;

				// make sure the search field resize too
				gui.setSearchboxesCss(sSomeTableName); 
			}
		}); 
	}
	
			
	
	var table = $("<table></table>")
		.attr("cellpadding", "0")
		.attr("cellspacing", "0")
		.attr("border", "0")
		.attr("class", "display")
		.css("width", "100%")
		.attr("id", sSomeTableName);
	
	var thead_tag = $("<thead></thead>");
	var tfoot_tag = $("<tfoot></tfoot>");
	var thead_tr_tag = $("<tr></tr>");
	var tfoot_tr_tag = $("<tr></tr>");
	
	
	for (var i=0; i< mt.getListOfColumnsOf(sSomeTableName).length; i++)
		{
		thead_tr_tag.append($("<th></th>").text(mt.getListOfColumnsOf(sSomeTableName)[i]));
		tfoot_tr_tag.append($("<th></th>").text());
		}
	thead_tag.append(thead_tr_tag);
	tfoot_tag.append(tfoot_tr_tag);
	
	var tbody_tag = $("<tbody></tbody>");
	var tbody_tr_tag = $("<tr></tr>");
	var tbody_tr_td_tag = $("<td></td>")
		.attr("colspan", mt.getListOfColumnsOf(sSomeTableName).length+"")
		.text(lang.loading_from_server);
	tbody_tr_tag.append(tbody_tr_td_tag);
	tbody_tag.append(tbody_tr_tag);
	
	table.append(thead_tag);
	table.append(tbody_tag);
	table.append(tfoot_tag);
	
	
	
	// append the table html to the page
	$("#"+sSomeTableName+"_dynamic").append(table);
	
	
	// pagination settings
	var sPane = oExtraTableSettings["pane"];
	
	
	
	/*************************
	 **  table declaration  **
	 *************************/
	
	tb.setColumnProperties(sSomeTableName, bIgnoreInitialisationFilters);
	
	
	// what is required in the top pane?	
	
	// default values
	// l - length changing input control
	// f - filtering input
	// t - The table!
	// i - Table information summary
	// p - pagination control
	// r - processing display element
	var sTopPaneSettings = '<"top"iflp<"clear">>t<"bottom_pane"p>'+
							'<"export_pane">';
	
	
	// if some values where given as argument, build the appropriate sDom value
	if ( sPane != null)
		{
		// start of the sDom string
		sTopPaneSettings = '<"top"';
		
		// loop through the possible settings and check if they are part of the given argument
		var sAcceptedSettings = "iflp";
		for (var i=0; i<sAcceptedSettings.length; i++)
			{
			if (sPane.indexOf( sAcceptedSettings.charAt(i) )>-1)
				sTopPaneSettings+=sAcceptedSettings.charAt(i);
			}
		// next part of the string (rendering [t]able and p[r]ocessing message is default)
		sTopPaneSettings += '<"clear">>rt';
		// if pagination is required, we also need the bottom pagination pane
		if (sPane.indexOf("p")>-1)
			{
			sTopPaneSettings += '<"bottom_pane"p>';
			}			
		
		sSomeTableName += '<"export_pane">'; 
		}
	
	
	
	// datatables object building
	
	// global search at initialisation, if set
	var sGlobalSearch = (mt.getFilterValues(sSomeTableName) != null ? mt.getFilterValues(sSomeTableName)["anycolumn"] : "");
	var oGlobalSearch = (sGlobalSearch != null ? {"search": sGlobalSearch} : {});
	

	// DataTable object!

	var oTable = $('#'+sSomeTableName).DataTable( {	
		"scrollX": 		true,		
		"search": 		oGlobalSearch,
		"searchCols":	aoSearchColsArray,
		"autoWidth": 	false,  
		"destroy": 		true, // remove previously build datatable with same table name
		"order": 		conf.getDefaultSortingSettings(sSomeTableName),
		"pageLength": 	(typeof oExtraTableSettings["displaylength"]!="undefined" ?
						parseInt(oExtraTableSettings["displaylength"]) : 
						( aTableSettings!=null ? conf.getDisplayLength(aTableSettings) : 10 )),
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
			"lengthMenu": conf.getDisplayLengthMenu(aTableSettings),
			"loadingRecords": lang.loading_records,
			"processing": "" // no processing message, we have a spinner
		},
				
		"dom": sTopPaneSettings,
		
		"processing": true,
		"serverSide": true,
		//"deferRender": true,   // TO-DO: we should test if this gives performance gain without bugs!!!
		"ajax": {
			"url": WEBSERV_URL+"/api/gettable",
			"type": "POST",
			"data": function ( d ) {

				// needed for GoTo function (see comment in java code Database.getRowNumberOfRecord)
				var sGoToRowIds = ( aGoToRowIds[sSomeTableName] == null ) ? "" : aGoToRowIds[sSomeTableName];

				// count settings
				var oTableSettings = conf.getTableSettings(sSomeTableName);
				var bExactCountByConfig = conf.getExactCount(oTableSettings);
				
				return $.extend( {}, d, {
			        "sDbName": 			getHttpParams().get("db"),
			        "sTableName": 		sSomeTableName,
			        "bForceExactCount":	(bForceExactCount || bExactCountByConfig), // if one is true, it's enough
			        "sGoToRowIds":		sGoToRowIds      // needed for GoTo function, when working with row ids (all info at Database.getRowNumberOfRecord)
			      } );
			},
			
			// Trick to be able to read extra data from the server response.
			// Normally, Datatables expects only a few params to be returned, like:
			//  recordsTotal, recordsFiltered and data.
			// However by calling 'tb.processExtraParamsFromServerResponse', to which the json response is passed,
			// we can read the extra server params from there!
			// (see: http://www.datatables.net/forums/discussion/4968/accessing-the-ajax-json-response-from-within-fndrawcallback/p1)
			"dataSrc" : function(json){
				
				// hide the 'ugly' string with table info, in which some items still
				// need to be filled in at this stage
				
				$("#"+sSomeTableName+"_info").hide();
				
				// now put in the info we got from the server
				tb.processExtraParamsFromServerResponse(json, sSomeTableName);
	        				 
	        	// return the data sent by the server
	        	return json.data;
			}
		},	
		
		
		
		// ** Function upon initialisation **
		// (this is called when the table has fully initialised with the data loaded)
		"initComplete": function( settings, json ){
			
			// user callback and such
			if (fnFunction!=null) 
				fnFunction();
			
			// search boxes css
			gui.setSearchboxesCss(sSomeTableName);
			setTimeout(function(){
				gui.setSearchboxesCss(sSomeTableName);
			}, 500);
			
		},
		
		
		// ** Functions called just BEFORE a table update ** 
		"preDrawCallback": function( settings ) { // adapted for the use of shadow search fields, does not work well with boolean fields in the filters....
			
			// show 'in progress' before table draw starts
			gui.showProcessingMsg(sSomeTableName, true);
			
			var oTable = 		mt.getDataTableObjectOf(sSomeTableName);
			
			// make sure the config filters which should be kept, are kept
			var oTableConfig =	conf.getTableConfig(sSomeTableName);
			// console.log(`Got table config for ${sSomeTableName}: ` +  JSON.stringify(oTableConfig)) // hier gebeurt iets heel raars met logged_actions.....
			if (oTable != null){

				org2mapped = {}
				mapped2org = {}
				searchFields = {}

				oTable.columns().every( function (i){ 
					
					var thisCol = 		this;
					
					var sColumnName =	mt.getListOfColumnsOf(sSomeTableName)[i];
					
					if (oTableConfig && (sSomeTableName != 'logged_actions') && (sColumnName in oTableConfig) && ("search_instead" in oTableConfig[sColumnName])) {
						var instead = oTableConfig[sColumnName]["search_instead"]
						// alert(`${sColumnName} -> ${instead}`)
						
						//alert(`${instead}: ${thisCol.search()}`)
						mappedCol = getColumnByName(oTable, instead)
						var searchBoxValue = fn.getValueOfFilterBox(sSomeTableName, sColumnName);
						if ($.startsWith(searchBoxValue, "//"))
							searchBoxValue = "\""+searchBoxValue.replace(/^\/\//, 'exact:')+"\"";
	
						mappedCol.search(searchBoxValue) // thisCol.search()) // of je moet direct filter pakken? 


						org2mapped[sColumnName] = mappedCol
						mapped2org[instead] = thisCol
					}

				});

			

				
				oTable.columns().every(function (i) { 

					var thisCol = this;
				
					var sColumnName = mt.getListOfColumnsOf(sSomeTableName)[i];
					
					if (sColumnName in mapped2org) { // no special action requiered
					
					}
					if (sColumnName in org2mapped) { 
						thisCol.search("") // this column filter is delegated to another column, skip

					} else {
						var oColumnConfig = conf.getColumnConfig(oTableConfig, sColumnName);
						var keepfilter = conf.getKeepFilterSetting(oColumnConfig);
						if (keepfilter)
							thisCol.search(conf.getFilter(oColumnConfig));

						// ensure the proper formatting of search values
						// (as select boxes need special format)
						thisCol.search(
							sf.giveRightShapeToSearchValue(sSomeTableName, sColumnName, thisCol.search())
						);
					}
					searchFields[sColumnName]  = thisCol.search()
				});
				// console.log(JSON.stringify(searchFields))

			}	
			
		},
		
		// ** Functions upon table update **
		// (this is called after the row callback)
		"drawCallback": function( settings ) {
			
			// empty go-to function parameter 
			// (as this must happen after the tables was redrawn after a GoTo call, 
			//  otherwise we would keep requesting the same row ids)
			aGoToRowIds[sSomeTableName] = "";
			
			// if form view type is chosen, show a form
			// (this has to happen quite late in the process, to make sure the form dimensions
			//  can be computed based on the very last table dimensions, which
			//  were set in the code here above)
			gui.buildFormViewIfRequired(sSomeTableName);
			
			// generate row tooltips showing the row numbers and such
			// (only if that is allowed)
			if (mt.tableExists(sSomeTableName) && bTooltipsAllowedInTable ) {
				
				var oTable = 		mt.getDataTableObjectOf(sSomeTableName);
				
				oTable.rows().every(function(iRowIndex){
					
					var oCurrentRow = this;					
					var iRowNumber = oTable.page.info().start + iRowIndex;					
					
					for (var iColNumber=0; iColNumber<mt.getListOfVisibleColumnsOf(sSomeTableName).length; iColNumber++){
						var currentColumnName =	mt.getListOfVisibleColumnsOf(sSomeTableName)[iColNumber]; 
		        		var oColumnConfig =		conf.getColumnConfig(oTableConfig, currentColumnName);
		        		var sCellToolTip =		conf.getCellTooltip(oColumnConfig);
		        		var currentTooltip =	sCellToolTip!=null && sCellToolTip!="" ? sCellToolTip+"<BR>" : "";
		        		
		        		$("td:eq("+iColNumber+")", oCurrentRow.node())
			        		.attr("title", currentTooltip + "<span style='color: #00BFFF'>"+ lang.row +" "+ (iRowNumber+1) +" " +lang.in_column+ " '"+currentColumnName+"'</span>")
							.addClass("tooltip");
							
						// special rendering if required by config
						var textRendering = 	conf.getTextRendering(oColumnConfig);
						if (textRendering != null){
							var sTextVal = $("td:eq("+iColNumber+")", oCurrentRow.node()).text();
							sTextVal = textRendering(sTextVal);
							if (hasTags(sTextVal)) {
								$("td:eq("+iColNumber+")", oCurrentRow.node()).html(sTextVal);
							}
							else {
								$("td:eq("+iColNumber+")", oCurrentRow.node()).text(sTextVal);
							}
						}
					}

				});				
		        
		    }
			
			// perform row grouping in table view, if required		
			var sGroupingColumn = conf.getGroupingColumn(aTableSettings);
			var iGroupingColumn = $.inArray(sGroupingColumn, mt.getListOfColumnsOf(sSomeTableName));
			
			if ( iGroupingColumn >=0 && mt.getViewType(sSomeTableName) =='table' ){
				// https://datatables.net/examples/advanced_init/row_grouping.html
				var api = this.api();
	            var rows = api.rows( {page:'current'} ).nodes();
	            var last=null;
	            
	            api.column(iGroupingColumn, {page:'current'} ).data().each( function ( group, i ) {
	                if ( last !== group ) {
	                    $(rows).eq( i ).before(
	                        '<tr class="group"><td colspan="'+(mt.getListOfVisibleColumnsOf(sSomeTableName)).length+'"><B>'+group+'</B></td></tr>'
	                    );
	 
	                    last = group;
	                }
	            } );
			}
			
			// remove focus from table selector to prevent unpredictable events when using keys
			// (this is because the table selector might now have focus, so attempting to navigate the
			//  current table could cause the selection (and loading) of a new table, 
			//  which is quite frustrating)
			$("#selected_source").blur();
			
			// We need to attach a jeditable handler
			// each time some new page of the table is loaded.
			// Otherwise, the handler will only be attached to the
			// very first page, and will disappear when accessing the other pages.			
			gui.attachOnCellChangeEvent(sSomeTableName);			
			gui.makeTableEditable(sSomeTableName);
			
			// other things that need to be reapplied at redraw	
			gui.activateEllipsis(sSomeTableName);
			gui.deHighlightDiv(sSomeTableName);			
			gui.putTooltipsOfColumnButtons(sSomeTableName);					
			gui.removeProcessingMsg(sSomeTableName);
			

			// table setting callback
			if (aTableSettings!=null && conf.getCallback(aTableSettings) != null) {
				// if the initialisation callback must be repeated upon each draw, call it again
				// (t.i. we always call the callback, except if repeating is forbidden
				//                                    and the callback was called already)
				if ( !( conf.getRepeatCallback(aTableSettings) == false && 
						mt.getCallbackWasCalledAlready(sSomeTableName) == true)){
					conf.getCallback(aTableSettings)( mt.getDataTableObjectOf(sSomeTableName) );
					mt.setCallbackWasCalledAlready(sSomeTableName);
				}
									
			}			
			
			// search boxes css
			gui.setSearchboxesCss(sSomeTableName);
			
			// destroy the user callback so it will be called only once
			$(document.body).delay(500).queue(
					function(){
						// this replaces the callback added in fn.refreshTable() by an empty one
						mt.getDataTableObjectOf(sSomeTableName).addDrawCallback("userCallBack", function(){});
						gui.setSearchboxesCss(sSomeTableName); // just to be sure
						$(this).dequeue();
					});	
			
			// activate tipTip jquery plugin for nice cross-browser tooltips
			// (needs to be reactivated at each draw, so it seeems)
			$(".tooltip").tipTip( gui.getTiptipConfig() );
			
			// highlight whole column at mouseover
			// (needs to be reactivated at each draw, so it seeems)
			gui.setColumnHighlight(sSomeTableName);
			
			// clear the undo stack, since the page is changed of refreshed 
			// (so content doesn't match the old situation anymore)
			un.cleanUndoStack(sSomeTableName);
			
			// if the current table is the arrow keys active table
			// then we should highlight the active row
			if (kf.getActiveTable() == sSomeTableName && mt.getViewType(sSomeTableName) == 'table') {
				var nActiveRowNode = fn.getActiveRowNode(sSomeTableName);
				$(nActiveRowNode).toggleClass('selected');				
			}
			
			
		},
		
		// ** Functions upon row update **
		// (this is called before the draw callback)
		// set the background or text colors etc.
		"rowCallback": function( nRow, aData, iDisplayIndex ){
			
			var aListOfColumns = mt.getListOfVisibleColumnsOf(sSomeTableName);
			for (var i=0; i<aListOfColumns.length; i++)
				{
				// retrieve column client configuration
				var oColumnConfig =	conf.getColumnConfig(oTableConfig, aListOfColumns[i]);
				// if the config requires some background or text color, set it here
				var mBgColor = 		conf.getBackgroundColor(oColumnConfig);
				var sTextColor = 	conf.getTextColor(oColumnConfig);
				var sTextWeight =	conf.getTextWeight(oColumnConfig);
				var sTextStyle = 	conf.getTextStyle(oColumnConfig);
				var sTextFont = 	conf.getTextFont(oColumnConfig);
				var sTextSize = 	conf.getTextSize(oColumnConfig);
				
				// background color can be the same for both odd and even rows, of different for odd and even rows
				if (mBgColor!=null) {
					var colorIndex = (iDisplayIndex%2);
					if (typeof mBgColor=='string')
						$('td:eq('+i+')', nRow).css( "background", mBgColor );
					else
						$('td:eq('+i+')', nRow).css( "background", mBgColor[colorIndex] );
				};	
				
				// other settings
				if (sTextColor!=null)	$('td:eq('+i+')', nRow).css( "color",  sTextColor);
				if (sTextWeight!=null) 	$('td:eq('+i+')', nRow).css( "font-weight", sTextWeight );
				if (sTextStyle!=null) 	$('td:eq('+i+')', nRow).css( "font-style", sTextStyle );
				if (sTextFont!=null) 	$('td:eq('+i+')', nRow).css( "font-family", sTextFont );
				if (sTextSize!=null) 	$('td:eq('+i+')', nRow).css( "font-size", sTextSize );				
				}  
		    },

		"pagingType": "full_numbers",
		"columnDefs": mt.getDatatablesPropsOf(sSomeTableName) 
		

		
	} ); //end of datatable definition

	
	
	// apply row grouping, if required
	gui.applyRowGrouping(sSomeTableName);	
	
	// add the name of the table in its top div
	// and set background color too
	head.showNameOfTheTable(sSomeTableName);
	
	// add click event to row counter, to trigger exact count
	head.putExactCountEvent(sSomeTableName);
	
	// put the datatable object in multitable administration			
	mt.setDataTableObjectOf(sSomeTableName, oTable);
	mt.setTableType(sSomeTableName, asTableTypes[$.inArray(sSomeTableName, asTableNames)]);
	
	// keep or remove main search input field
	head.setMainSearch(sSomeTableName);	
	
	// add reset button to clear all search filters			
	head.putResetButton(sSomeTableName);	
	
	// add refresh button 		
	head.putRefreshButton(sSomeTableName);	
	
	// assign functions to keys			
	row.addRowSelectionFunctions(sSomeTableName);

	// add search and replace function			
	head.putSearchAndReplaceButton(sSomeTableName);
	
	// add selection button			
	head.putSelectionButton(sSomeTableName);	
	
	// add a Go To button
	head.putGoToButton(sSomeTableName);
	
	// add a Undo button
	head.putUndoButton(sSomeTableName);
	
	// add column selection button
	head.putColumnSelectionButton(sSomeTableName);
	
	// add a View type button
	head.putViewTypeButton(sSomeTableName);
	
	// add help button
	head.putHelpButton(sSomeTableName);
	
	// add custom user header buttons			
	head.putCustomHeaderButtons(sSomeTableName);
	
	// add table close button			
	head.putTableCloseButton(sSomeTableName);

	// add (optional) table erase button
	head.putTableEraseButton(sSomeTableName);
	
	// activate all the column functions set in the client configuration file			
	conf.activateConfigFunctions(sSomeTableName);
	
	// active rightclick context menus
	conf.activateContextMenusForColumns(sSomeTableName);
	conf.activateContextMenusForRows(sSomeTableName);
	
	// set the header height
	head.setHeaderHeight(sSomeTableName);
	
	// enable search fields and give them their custom behavior
	// that is:
	// 1. disable automatic search on keypress
	//    and start search only after pressing enter
	// 2. empty main search field when clicking on per-column search field
	//    and empty per-column search field when clicking on main search field			
	sf.enableSearchFields(sSomeTableName); 
	
	
	// generate undo stack for this table
	un.cleanUndoStack(sSomeTableName);
	
	// when the table is sorted by a new column, we need to rebuild the map of cell colors
	gui.setColumnHighlightResetter(sSomeTableName);
	
	// set the column nice names if available (those can be declared to replace user UNfriendly column names)
	gui.setColumnNiceNames(sSomeTableName);
	
	// initialize arrow keys for this table
	kf.setActiveTable(sSomeTableName);
	kf.setActiveRowNumber( 0 );
	
	
	// set general header behaviour for some mouse events
	head.setHeaderSensitivity(sSomeTableName);
	
	// add the export buttons
	tb.addExportButtons(sSomeTableName);
	
	// Force tooltip to fadeout 
	// This is sometimes needed when we choosed a new table to load from the pulldown menu
	// while another table was already in sight. The tooltip of some column might then
	// keep in sight and wouldn't go away.
	$("#tiptip_holder").fadeOut();	
	
};


