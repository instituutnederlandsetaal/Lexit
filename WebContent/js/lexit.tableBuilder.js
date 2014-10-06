/**
 * 
 */

var tb = {};


// Load the table column names and types.
// From now on, the table "frame" will be build

tb.loadTable = function(sSomeTableName, fnFunction, oExtraTableSettings){
	
	// NB: at this point the table record is already created in the multitables namespace
	//     but beware: it has no column list yet
	
	// make sure oExtraTableSettings can't cause a crash because of null value
	if (oExtraTableSettings == null) 
		oExtraTableSettings = {};
					
	td.getColumnsOfTable(sSomeTableName, fnFunction, oExtraTableSettings);	
};


// Build the table html "frame" and the Datatable object (oTable)
// It will be maintained at each new table draw (click on buttons etc)

tb.buildTable = function(sSomeTableName, fnFunction, oExtraTableSettings){
	
	// NB: at this point the table record is already created in the multitables namespace
	
	// retrieve table client configuration and settings
	var oTableConfig = conf.getTableConfig(sSomeTableName);
	var aTableSettings = conf.getTableSettings(sSomeTableName);
	var bTableIsaView = (asTableTypes[$.inArray(sSomeTableName, asTableNames)] == "view");
	var bIgnoreInitialisationFilters = false;
	
	
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
	
	// 3 possibilities:
	
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
	// [3] else just make the default position absolute	
	else
		{		
		var iCurrentLeft = $("#"+sSomeTableName+"_dynamic").offset().left;
		var iCurrentTop = $("#"+sSomeTableName+"_dynamic").offset().top;
		$("#"+sSomeTableName+"_dynamic")
			.css("position", "absolute")
			.css("top", iCurrentTop)
			.css("left", iCurrentLeft);
		}
	
	$("#"+sSomeTableName+"_dynamic")
		.resizable(); // a table container should be resizable
	
	
	// recompute the size (% becomes px)
	sTableWidth = $("#"+sSomeTableName+"_dynamic").css("width");
			
	
	var table = $("<table></table>")
		.attr("cellpadding", "0")
		.attr("cellspacing", "0")
		.attr("border", "0")
		.attr("class", "display")
		.css("width", sTableWidth)
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
		.text("Data wordt van de server geladen");
	tbody_tr_tag.append(tbody_tr_td_tag);
	tbody_tag.append(tbody_tr_tag);
	
	table.append(thead_tag);
	table.append(tbody_tag);
	table.append(tfoot_tag);
	
	
	
	// append the table html to the page
	$("#"+sSomeTableName+"_dynamic").append(table);
	// append extra div for pagination pane under the table
	$("#"+sSomeTableName+"_dynamic").append( 
			$("<div></div>")
			.attr("class", sSomeTableName+"_bottom_pane")
			.css("margin-bottom", "50px")
			.css("width", sTableWidth)
			);
	
	
	// pagination setting
	var sPane = oExtraTableSettings["pane"];
	var bPaginationPaneRequired = (sPane == null || (sPane != null && sPane.indexOf("p")>-1));

	
	// table declaration
	
	tb.setColumnProperties(sSomeTableName, bIgnoreInitialisationFilters);
	
	
	// what is required in the top pane?	
	
	// default values
	var sTopPaneSettings = '<"top"iflp<"clear">>rt<"'+sSomeTableName+'_bottom_pane"p>';
	
	
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
			sTopPaneSettings += '<"'+sSomeTableName+'_bottom_pane"p>';
			}			
		}
	
	sTopPaneSettings += 'T'; // TableTools
	
	
	// datatables object building
	
	var oTable = $('#'+sSomeTableName).dataTable( {			
		"aoSearchCols": aoSearchColsArray,
		//"bStateSave": true,
		"bAutoWidth": false,  
		"bDestroy": true, // remove previously build datatable with same table name
		"aaSorting": conf.getDefaultSortingSettings(sSomeTableName),
		"iDisplayLength": (typeof oExtraTableSettings["displaylength"]!="undefined" ?
				oExtraTableSettings["displaylength"] : 
			( aTableSettings!=null ? conf.getDisplayLength(aTableSettings) : 10 )),
		"oLanguage": {
			"sInfoThousands": ".",
			"sSearch": "ZOEK in gehele tabel:",
			"sInfoEmpty": "Geen resultaten",
			"sEmptyTable": "Geen resultaten",
			"sInfo": "_PLUSMN__TOTAL_ rij(en) gevonden",
			"sZeroRecords": "Geen resultaten. Probeer een ander zoekwoord.",
			"sInfoFiltered": " (uit _TOTALPLUSMN__MAX_ rijen)",
			"oPaginate": {
				"sFirst": "Eerste",
				"sPrevious": "Vorige",
				"sNext": "Volgende",
				"sLast": "Laatste"
			},
			"sLengthMenu": 'Toon <select>'+
			   '<option value="1">1</option>'+
			   '<option value="5">5</option>'+
	           '<option value="10">10</option>'+
	           '<option value="20">20</option>'+
	           '<option value="50">50</option>'+
	           '<option value="100">100</option>'+
	           '<option value="500">500</option>'+
	           '<option value="1000">1000</option>'+
	           '<option value="-1">alle</option>'+
	           '</select> rijen',
			"sLoadingRecords": "Data laden uit de database...",
			"sProcessing": "" // no processing message, we have a spinner
		},
		"bScrollInfinite": bPaginationPaneRequired ? false : true, // infinite scoll when pagination is off
		//"bScrollCollapse": bPaginationPaneRequired ? false : true, // keeps table as narrow as possible when pagination is off
		"sScrollY": bPaginationPaneRequired ? "" : "280px",        // height of table when pagination is off
				
		"sDom": sTopPaneSettings,
		//"sDom": '<"top"iflp<"clear">>rt<"bottom"iflp<"clear">>',
		"bProcessing": true,
		"bServerSide": true,
		//"bUseRendered": true,
		"sAjaxSource": "../lexit/lexit/table/gettable",				
		"sServerMethod": "POST",
		
		"fnServerParams": function ( aoData ) {		
			
			aoData.push( { "name": "sDbName", "value": getHttpParams().get("db") } );
			aoData.push( { "name": "sTableName", "value": sSomeTableName } );
			aoData.push( { "name": "sAllColumns", "value": mt.getListOfColumnsOf(sSomeTableName).join(ARG_INTERNAL_SEPARATOR) } );
			
		},
		
		// Trick to be able to read extra data from the server response.
		// Normally, Datatables expects only a few params to be returned, like:
		//  iTotalRecords, iTotalDisplayRecords and aaData.
		// Since jQuery accepts an array of functions in the success callback of ajax,
		// we first call 'fnCallback' which is the built-in Datatables callback
		// but we also call 'tb.processExtraParamsFromServerResponse' to which the json response is passed
		// so we can read the extra server params from there!
		// (see: http://www.datatables.net/forums/discussion/4968/accessing-the-ajax-json-response-from-within-fndrawcallback/p1)
		"fnServerData" : function(sSource, aoData, fnCallback, oSettings ){
			
			// hide the 'ugly' string with table info, in which some items still
			// need to be filled in at this stage
			
			$("#"+sSomeTableName+"_info").hide();
			
			oSettings.jqXHR = $.ajax({
		        'dataType': 'json',
		        'type': 'POST',
		        'url': sSource,
		        'data': aoData,
		        'success': [fnCallback, function(json){
		        	
		        	// now we have a response from the server, show the
		        	// table info again
		        	$("#"+sSomeTableName+"_info").show();
		        	
		        	// now put in the info we got from the server
		        	tb.processExtraParamsFromServerResponse(json, sSomeTableName);
		        	
		        	}]
		    });
		},
		
		// ** Function upon initialisation **
		// (this is called when the table has fully initialised with the data loaded)
		"fnInitComplete": function(){
			
			// user callback and such
			if (fnFunction!=null) 
				fnFunction();
			// when showing an infinite list, we show no search boxes
			if (bPaginationPaneRequired) 
				gui.setSearchboxesCss(sSomeTableName);
		},
		
		
		// ** Functions called just BEFORE a table update ** 
		"fnPreDrawCallback": function( oSettings ) {
			
			// show 'in progess' before table draw starts
			$("html, body").css("cursor", "progress");
			
			// make sure the config filters which should be kept, are kept
			var oTableConfig = conf.getTableConfig(sSomeTableName);
			for ( var i=0, iLen=oSettings.aoPreSearchCols.length ; i<iLen ; i++ )
			{
				var sColumnName = mt.getListOfColumnsOf(sSomeTableName)[i];
				var aColumnConfig = conf.getColumnConfig(oTableConfig, sColumnName);
				var keepfilter = conf.getKeepFilterSetting(aColumnConfig);
				if (keepfilter)
					oSettings.aoPreSearchCols[i].sSearch = ( conf.getFilter(aColumnConfig) );			
				
				// ensure the proper formatting of search values
				// (as select boxes need special format)
				oSettings.aoPreSearchCols[i].sSearch =
					sf.giveRightShapeToSearchValue(sSomeTableName, sColumnName, oSettings.aoPreSearchCols[i].sSearch);
			}
			
		},
		
		// ** Functions upon table update **
		// (this is called after the row callback)
		"fnDrawCallback": function() {
			
			// generate row tooltips showing the row numbers and such
			// (only if that is allowed)
			if (mt.tableExists(sSomeTableName) && bTooltipsAllowedInTable ) {
				
		        $.each(mt.getDataTableObjectOf(sSomeTableName).fnGetNodes(), function(){
		        	
		        	var iRowNumber = fn.getRowIndex(sSomeTableName, this);
		        	
		        	$(this).find("td").each(function(iColNumber){		        		
		        		
		        		var currentColumnName = mt.getListOfVisibleColumnsOf(sSomeTableName)[iColNumber]; 
		        		var oColumnConfig = conf.getColumnConfig(oTableConfig, currentColumnName);
		        		var sCellToolTip = conf.getCellTooltip(oColumnConfig);
		        		var currentTooltip = sCellToolTip!=null && sCellToolTip!="" ? sCellToolTip+"<BR>" : "";		        		
		        		$(this).attr("title", currentTooltip+"Rij "+ (iRowNumber+1) +" in '"+currentColumnName+"'").addClass("tooltip");
		        		});		            
		            });
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
			gui.deHighlightDiv(sSomeTableName);
			gui.putTooltipsOfColumnButtons(sSomeTableName);
			gui.setPositionOfPaginationPane(sSomeTableName);
			gui.removeProcessingMsg(sSomeTableName);
			
			// table setting callback
			if (aTableSettings!=null && conf.getCallback(aTableSettings) != null)
				{
				// if the initialisation callback must be repeated upon each draw, call it again
				// (t.i. we always call the callback, except if repeating is forbidden
				//                                    and the callback was called already)
				if ( !( conf.getRepeatCallback(aTableSettings) == false && 
						mt.getCallbackWasCalledAlready(sSomeTableName) == true))
					{
					conf.getCallback(aTableSettings)(mt.getDataTableObjectOf(sSomeTableName));
					mt.setCallbackWasCalledAlready(sSomeTableName);
					}
									
				}			
			
			// when showing an infinite list, we show no search boxes
			if (bPaginationPaneRequired) gui.setSearchboxesCss(sSomeTableName);
			
			// destroy the user callback so it will be called only once
			$(document.body).delay(500).queue(
					function(){
						// this replaces the callback added in fn.refreshTable() by an empty one
						mt.getDataTableObjectOf(sSomeTableName).addDrawCallback("userCallBack", function(){});
						$(this).dequeue();
					});	
			
			// activate tipTip jquery plugin for nice cross-browser tooltips
			// (needs to be reactivated at each draw, so it seeems)
			$(".tooltip").tipTip(oTiptipConfig);
			
			// highlight whole column at mouseover
			// (needs to be reactivated at each draw, so it seeems)
			gui.setColumnHighlight(sSomeTableName);
			
			// clear the undo stack, since the page is changed of refreshed 
			// (so content doesn't match the old situation anymore)
			un.cleanUndoStack(sSomeTableName);
			
			// if the current table is the arrow keys active table
			// then we should highlight the active row
			if (kf.getActiveTable() == sSomeTableName && mt.getViewType(sSomeTableName) == 'table')
				{
				var nActiveRowNode = fn.getActiveRowNode(sSomeTableName);
				$(nActiveRowNode).toggleClass('row_selected');				
				}
			
			
		},
		
		// ** Functions upon row update **
		// (this is called before the draw callback)
		// set the background or text colors etc.
		"fnRowCallback": function( nRow, aData, iDisplayIndex, iDisplayIndexFull ){
			
			var aListOfColumns = mt.getListOfVisibleColumnsOf(sSomeTableName);
			for (var i=0; i<aListOfColumns.length; i++)
				{
				// retrieve column client configuration
				var oColumnConfig = conf.getColumnConfig(oTableConfig, aListOfColumns[i]);
				// if the config requires some background or text color, set it here
				var mBgColor = conf.getBackgroundColor(oColumnConfig);
				var sTextColor = conf.getTextColor(oColumnConfig);
				var sTextWeight = conf.getTextWeight(oColumnConfig);
				var sTextStyle = conf.getTextStyle(oColumnConfig);
				var sTextFont = conf.getTextFont(oColumnConfig);
				var sTextSize = conf.getTextSize(oColumnConfig);
				
				// background color can be the same for both odd and even rows, of different for odd and even rows
				if (mBgColor!=null)
					{
					var colorIndex = (iDisplayIndex%2);
					if (typeof mBgColor=='string')
						$('td:eq('+i+')', nRow).css( "background", mBgColor );
					else
						$('td:eq('+i+')', nRow).css( "background", mBgColor[colorIndex] );
					};		
				// other settings
				if (sTextColor!=null) $('td:eq('+i+')', nRow).css( "color",  sTextColor);
				if (sTextWeight!=null) $('td:eq('+i+')', nRow).css( "font-weight", sTextWeight );
				if (sTextStyle!=null) $('td:eq('+i+')', nRow).css( "font-style", sTextStyle );
				if (sTextFont!=null) $('td:eq('+i+')', nRow).css( "font-family", sTextFont );
				if (sTextSize!=null) $('td:eq('+i+')', nRow).css( "font-size", sTextSize );				
				}  
		    },
		
		"sAjaxDataProp": "aaData",
		"bPaginate"  : bPaginationPaneRequired,
		"sPaginationType": bPaginationPaneRequired ? "full_numbers" : "",
		"aoColumnDefs": mt.getDatatablesPropsOf(sSomeTableName),
		
		// Table tools configuration
		"oTableTools": {
			"sSwfPath": "swf/copy_csv_xls_pdf.swf",
			// for each column: export only visible columns
			"aButtons": [
			             {
			            	 "sExtends": "copy", 
			            	 "mColumns": "visible",
			            	 "fnCellRender": function ( sValue, iColumn, nTr, iDataIndex ) {
			            		 return tb._rightExportValue(sValue);
			            	 }
			             },
			             {
			            	 "sExtends": "csv",
			            	 "sFileName": "*.csv",
			            	 "mColumns": "visible",
			            	 "fnCellRender": function ( sValue, iColumn, nTr, iDataIndex ) {
			            		 return tb._rightExportValue(sValue);
			            	 }
			             },
			             {
			            	 "sExtends": "xls",
			            	 "sFileName": "*.csv", // xls format not supported in TableTools
			            	 "mColumns": "visible",
			            	 "fnCellRender": function ( sValue, iColumn, nTr, iDataIndex ) {
			            		 return tb._rightExportValue(sValue);
			            	 }
			             },
			             {
			            	 "sExtends": "pdf", 
			            	 "sFileName": "*.pdf",
			            	 "mColumns": "visible",
			            	 "fnCellRender": function ( sValue, iColumn, nTr, iDataIndex ) {
			            		 return tb._rightExportValue(sValue);
			            	 }
			             },
			             {
			            	 "sExtends": "print", 
			            	 "mColumns": "visible",
			            	 "fnCellRender": function ( sValue, iColumn, nTr, iDataIndex ) {
			            		 return tb._rightExportValue(sValue);
			            	 }
			             }
			            ]
		}
		
	} ); //end of datatable definition

	
	// add the name of the table in its top div
	head.showNameOfTheTable(sSomeTableName);
	
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
	
	// activate all the column functions set in the client configuration file			
	conf.activateConfigFunctions(sSomeTableName);
	
	// active rightclick context menus
	conf.activeContextMenusForColumns(sSomeTableName);
	conf.activeContextMenusForRows(sSomeTableName);
	
	// set the header height
	head.setHeaderHeight(sSomeTableName);
	
	// enable search fields and give them their custom behavior
	// that is:
	// 1. disable automatic search on keypress
	//    and start search only after pressing enter
	// 2. empty main search field when clicking on per-column search field
	//    and empty per-column search field when clicking on main search field			
	sf.enableSearchFields(sSomeTableName); 
	
	// make sure the pagination pane at the bottom keeps correctly aligned with the top pagination pane			
	gui.setPositionOfPaginationPane(sSomeTableName);
	
	
	// generate undo stack for this table
	un.cleanUndoStack(sSomeTableName);
	
	// when the table is sorted by a new column, we need to rebuild the map of cell colors
	gui.setColumnHighlightResetter(sSomeTableName);
	
	// initialize arrow keys for this table
	kf.setActiveTable(sSomeTableName);
	kf.setActiveRowNumber( 0 );
	
	
	// set general header behaviour for some mouse events
	head.setHeaderSensitivity(sSomeTableName);
	
	
	
};


// subroutine for TableTools:
// converts the checkboxes into visible output for export 
// (show a cross for checked, and nothing for unchecked)
tb._rightExportValue = function(sValue){
	if (sValue.match(".*type=[\"']checkbox[\"'].*") )
		{
		if (sValue.match("true"))
			return "X";
		else
			return "";			            			 
		}
	else
		return sValue;
};


// read custom param from server response and process them
tb.processExtraParamsFromServerResponse = function(json, sSomeTableName){
	
	// ** count quality **
	
	// change count rendering according to count quality
	var sSubTotal = $("#"+sSomeTableName+"_info").text();
	
	// pre-processing: if no query was send (so result is whole table), Datatables
	// actually shows the whole count as if it was an query count. But the
	// relevent count quality is in this case the total count quality, not the query
	// count quality. To make sure we will get just that, we replace _PLUSMN_ in the
	// string by _TOTALPLUSMN_	
	if (sSubTotal.indexOf("_TOTALPLUSMN_")<0)
		sSubTotal = sSubTotal.replace("_PLUSMN_", "_TOTALPLUSMN_");
	
		
	// query count part (size of resultset)
	sSubTotal = sSubTotal.replace("_PLUSMN_", (json.bQueryCountIsExact ? "" : "±"));
	// total table count (size of whole table)
	sSubTotal = sSubTotal.replace("_TOTALPLUSMN_", (json.bTotalCountIsExact ? "" : "±"));
	// put the count string back into place
	$("#"+sSomeTableName+"_info").text(sSubTotal);
	
	
	
	// **   reset relevant/visible columns    **
	// ** (when the table is in optimal mode) **
	
	if ( mt.getTableMustBeOptimal(sSomeTableName)
			// if there are no results, there are no relevant columns
			// so the searchboxes will disappear, prevent that by requiring a non-empty result set
			&& json.iTotalDisplayRecords>0 ) 
		{		
		
		// now make the relevant columns visible, and hide the others
		var aRelevantColumns = tb._getRelevantColumnsStraightFromJson(sSomeTableName, json);
		var aVisibleColumns = new Array();	
		var aVisibleColumnsTypes = new Array();
		var oaVisibleColumnsAllowedTypes = new Array();
		
		for (var i=0; i<mt.getListOfColumnsOf(sSomeTableName).length; i++)
			{
			var sCurrentColumnName = mt.getListOfColumnsOf(sSomeTableName)[i];
			var bColumnShouldBeVisible = $.inArray(sCurrentColumnName, aRelevantColumns)>-1;
			if (bColumnShouldBeVisible) 
				{						
				aVisibleColumnsTypes.push(mt.getListOfColumnTypesOf(sSomeTableName)[i]);
				oaVisibleColumnsAllowedTypes.push(mt.getListOfAllowedValuesInColumnsOf(sSomeTableName)[i]);
				conf.changeTableConfigValue(sSomeTableName, sCurrentColumnName, "visible", bColumnShouldBeVisible);
				}
			
			var iColumnIndex = fn.getColumnNumberOf(sSomeTableName, sCurrentColumnName);
			mt.getDataTableObjectOf(sSomeTableName).fnSetColumnVis(iColumnIndex, bColumnShouldBeVisible, false);
			}
		
		mt.setListOfVisibleColumnsOf(sSomeTableName, aRelevantColumns);
		mt.setListOfTypesOfVisibleColumnsOf(sSomeTableName, aVisibleColumnsTypes);
		mt.setListOfAllowedValuesInVisibleColumnsOf(sSomeTableName, oaVisibleColumnsAllowedTypes);
		
		// enable searchboxes		
		sf.enableSearchFields(sSomeTableName);
		gui.setSearchboxesCss(sSomeTableName);
		
		// highlight (resetter must be called first)
		gui.setColumnHighlightResetter(sSomeTableName);
		gui.setColumnHighlight(sSomeTableName);
		
		}
	
	
	// if form view type is chosen, show a form
	// (this has to happen quite late in the process, to make sure the form dimensions
	//  can be computed based on the very last table dimensions, which
	//  were set in the code here above)
	gui.buildFormViewIfRequired(sSomeTableName);
	
	
};


// read the relevant columns from the Json output of the server
// before rendering has begun
tb._getRelevantColumnsStraightFromJson = function(sSomeTablename, json){
	
	var oTableConfig = conf.getTableConfig(sSomeTablename);
	
	var aRelevantColumnsUnsorted = new Array();
	var aaTableData = json.aaData;
	
	for (var i=0; i<aaTableData.length; i++)
		{
		for (sColumnName in aaTableData[i])
			{
			// skip non column data ("DT_...")
			if ($.inArray(sColumnName, mt.getListOfColumnsOf(sSomeTablename))<0)
				continue;
			
			// Since some columns contains buttons, we will have to consider those ones 
			// as 'significantly filled' to make sure those keep in sight!
			var aColumnConfig = conf.getColumnConfig(oTableConfig, sColumnName);
			var sButtonHere = conf.getButtonSetting(aColumnConfig);
			
			// not visible column with not-flexible visibility must keep hidden
			var bMustKeepHidden = 
				( !conf.getVisibility(aColumnConfig) &
						!conf.getFlexibleVisibility(aColumnConfig) );
			
			// if a column is non-empty, it is relevant (except when it should keep hidden)
			if ( !bMustKeepHidden && 
					(aaTableData[i][sColumnName] != "" || sButtonHere != null) )
				{
				if ($.inArray(sColumnName, aRelevantColumnsUnsorted)<0)
					aRelevantColumnsUnsorted.push(sColumnName);
				}
			}
		}
	
	// now sort the list, as its order must match the table header order
	var aRelevantColumns = new Array();
	for (var i=0; i<mt.getListOfColumnsOf(sSomeTablename).length; i++)
		{
		if ($.inArray(mt.getListOfColumnsOf(sSomeTablename)[i], aRelevantColumnsUnsorted)>-1)
			aRelevantColumns.push(mt.getListOfColumnsOf(sSomeTablename)[i]);
		}
	
	return aRelevantColumns;
};


// assign properties to the different table columns
tb.setColumnProperties = function(sSomeTableName, bIgnoreInitialisationFilters){
				
	
	// retrieve table client configuration
	var oTableConfig = conf.getTableConfig(sSomeTableName);
	
	// the data that will be set here
	var aVisibleColumns = new Array();	
	var aVisibleColumnsTypes = new Array();
	var oaVisibleColumnsAllowedTypes = new Array();
	var aColProps = new Array();
	
	// properties for column filters upon initialization
	aoSearchColsArray = new Array();
	
	for (var i=0; i<mt.getListOfColumnsOf(sSomeTableName).length; i++)
	{	
		
		// column name
		var sNameOfCurrentColumn = mt.getListOfColumnsOf(sSomeTableName)[i];
		
		// column filters upon initialization
		// (null is default, we will set it further on)
		aoSearchColsArray.push(null);
		
		// retrieve column client configuration
		var oColumnConfig = conf.getColumnConfig(oTableConfig, sNameOfCurrentColumn);
		
		
		
		// retrieve each configuration parameter
		var columnVisible = conf.getVisibility(oColumnConfig);
		var columnSearchable = conf.getSearchability(oColumnConfig);
		var columnSortable = conf.getSortability(oColumnConfig);
		var columnEditable = conf.getEditability(oColumnConfig);
		var columnFilter = conf.getFilter(oColumnConfig);
		var columnKeepFilter = conf.getKeepFilterSetting(oColumnConfig);
		var columnButton = conf.getButtonSetting(oColumnConfig);		
		var columnHasDataType = mt.getListOfColumnTypesOf(sSomeTableName)[i] != 'unknown';
		
		// build array of visible columns (we need to distinguish them from complete column list)
		if (columnVisible) 
			{
			aVisibleColumns.push(sNameOfCurrentColumn);
			aVisibleColumnsTypes.push(mt.getListOfColumnTypesOf(sSomeTableName)[i]);
			oaVisibleColumnsAllowedTypes.push(mt.getListOfAllowedValuesInColumnsOf(sSomeTableName)[i]);
			
			}
		
		// set column filters upon initialization 
		// - First check if we have an array of filters values: this is what we
		//   have when the table being built was called by another table (upon click on an id or such)
		// - Then check if we have a filter given by the config file
		//   If this filter had setting keepfilter=true, it will overwrite the previous filter setting
		if (mt.getFilterValues(sSomeTableName) != null)
			{
			var sColumnFilterValue = mt.getFilterValues(sSomeTableName)[sNameOfCurrentColumn];
			if (typeof sColumnFilterValue != 'undefined')
				aoSearchColsArray[i] = {"sSearch": sColumnFilterValue};
			}		
		// we have a preset filter from the config file
		if (columnFilter != null &&
				// - at initialisation time:
				//   if we're not required to ignore the filter from the config file, set it!
				// - at a later draw:
				//   if the config says the filter must be kept, keep it!				 
				( columnKeepFilter || !bIgnoreInitialisationFilters) )
			{
			aoSearchColsArray[i] = {"sSearch": columnFilter};
			}
			
		
		// now set the columns
		
		// each column classname must have its number and name in it
		var sClassPrefix = i+" "+sNameOfCurrentColumn+" ";
		
		// do we have a checkbox, and with which datatype?
		var iCheckBoxType = $.inArray(mt.getListOfColumnTypesOf(sSomeTableName)[i], ["bit varying(1)", "boolean"]);
		
		// or do we have a select box (user-defined types) ?
		var aSelectBoxValues = (mt.getListOfAllowedValuesInColumnsOf(sSomeTableName)[i]);
			
		// checkbox cell
		if (iCheckBoxType>=0)
			{				
			var bIsBooleanType = (mt.getListOfColumnTypesOf(sSomeTableName)[i] == "boolean");
			var trueValue = bIsBooleanType ? true : "\"1\"";
			var falseValue = bIsBooleanType ? false : "\"\"";
			
			aColProps.push( { 
				"mData": sNameOfCurrentColumn, 
				"bSearchable": false, 
				"aTargets": [ i ],
				"mRender": function ( data, type, full ) {
					
					// NOTE: it is not possible to set
					// the 'disabled' attribute here, as the
					// 'editable' property can't be accessed from here!
					// So the 'disabled' attribute is set in gui.makeTableEditable().
					
					// checkbox must be checked
					if (sf.isCheckboxTrueValue(data))
						{
						return "<center>"+
						"<input type=\"checkbox\" checked=\"checked\" value="+trueValue+" "+
						" />"+
						"</center>";
						}
					// checkbox must be UNchecked
					else
						{
						return "<center>"+
						"<input type=\"checkbox\" value="+falseValue+" "+
						" />"+
						"</center>";
						}
			        },
				"sClass": columnEditable ? 
						sClassPrefix + "editable_checkbox"
						: sClassPrefix + "not_editable_checkbox",
				"bVisible": columnVisible,
				"bSortable": columnVisible && columnHasDataType ? columnSortable : false
				} );
			
			}
		// select box cell
		else if (aSelectBoxValues.length>1)
			{			
			aColProps.push( { 
				"mData": sNameOfCurrentColumn, 
				"bSearchable": columnVisible ? columnSearchable : false, 
				"aTargets": [ i ],
				"sClass": columnEditable ? 
						sClassPrefix + "editable_selectbox"
						: sClassPrefix + "not_editable_selectbox",
				"bVisible": columnVisible,
				"bSortable": columnVisible && columnHasDataType ? columnSortable : false
				} );
			}
		// text cell
		else
			{
			if (columnButton == null)
				{
				aColProps.push( {
					"mData": sNameOfCurrentColumn, 
					"bSearchable": columnVisible ? columnSearchable : false, 
					"aTargets": [ i ],
					"sClass": columnEditable ?
							sClassPrefix + "editable_text" 
							: sClassPrefix + "not_editable",
					"bVisible": columnVisible,
					"bSortable": columnVisible && columnHasDataType ? columnSortable : false
						} 
					);
				}
			// text cell with a button
			else
				{
				aColProps.push( { 
					"mData": sNameOfCurrentColumn, 
					"bSearchable": columnVisible ? columnSearchable : false, 
					"aTargets": [ i ],
					"sClass": columnEditable ?
							sClassPrefix + "editable_text" 
							: sClassPrefix + "not_editable",
					"bVisible": columnVisible,
					"bSortable": false,
					"mRender": function ( data, type, full ){		
							
							return "<span class='colbutton'>" +
									"<button type='button' " +
									"style='margin-left: 10px' class='tooltip'"+
									">"+
									data+
									"</button>" +
									"</span>";
							}
						} 
					);
				}
			
			}
		
					
	}
	
	// set the lists for the visible columns now 
	// (this was set for ALL columns in 'tableDetails')
	mt.setListOfVisibleColumnsOf(sSomeTableName, aVisibleColumns);
	mt.setListOfTypesOfVisibleColumnsOf(sSomeTableName, aVisibleColumnsTypes);
	mt.setListOfAllowedValuesInVisibleColumnsOf(sSomeTableName, oaVisibleColumnsAllowedTypes);
	
	// properties for Datatable object (will be set as soon as this function ends)
	mt.setDatatablesPropsOf(sSomeTableName, aColProps);
	
};


// remove a table completely
// (that is: remove html element, datatables object, buttons, everything)
tb.destroyTable = function(sSomeTablename, fnFunction, bRemoveContainerDiv){
	
	// remove config functions
	// (since they are assigned with jQuery "live", they would keep alive otherwise)
	conf.deactivateConfigFunctions(sSomeTablename);
	
	// resizable needed to be destroyed, otherwise it won't work when table is re-created
	$("#"+sSomeTablename+"_dynamic")
		.resizable("destroy");
	
	// order is important: 
	// first remove html object 
	// and eventually the mt-record
	
	// 1. remove table container (parent div) if the table must be completely removed
	// OR
	// 2. keep the container if we want to be able to rebuild the table at the same place
	// (this might be needed when changing the table config dynamically and call the table again:
	//  by keeping the container, the newly configurated table will appear at the same place)
	if (bRemoveContainerDiv == true)
		$("#"+sSomeTablename+"_dynamic").remove();
	else
		$("#"+sSomeTablename+"_dynamic").children().remove();
	
	// remove record
	mt.removeTableRecord(sSomeTablename);		
	
	// finally, callback function if required
	if (fnFunction!=null)
		{
		fnFunction();		
		}
};


