/**
 * table builder
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
	var sTopPaneSettings = '<"top"iflp<"clear">>t<"'+sSomeTableName+'_bottom_pane"p>'+
							'<"'+sSomeTableName+'_export_pane">';
	
	
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
		
		sSomeTableName += '<"'+sSomeTableName+'_export_pane">'; 
		}
	
	
	
	// datatables object building
	
	var oTable = $('#'+sSomeTableName).DataTable( {			
		"searchCols":	aoSearchColsArray,
		"autoWidth": 	false,  
		"destroy": 		true, // remove previously build datatable with same table name
		"order": 		conf.getDefaultSortingSettings(sSomeTableName),
		"pageLength": 	(typeof oExtraTableSettings["displaylength"]!="undefined" ?
						parseInt(oExtraTableSettings["displaylength"]) : 
						( aTableSettings!=null ? conf.getDisplayLength(aTableSettings) : 10 )),
		"language": {
			"thousands": ".",
			"search": "ZOEK in gehele tabel:",
			"infoEmpty": "Geen resultaten",
			"emptyTable": "Geen resultaten",
			"info": "_PLUSMN__TOTAL_ rij(en) gevonden",
			"zeroRecords": "Geen resultaten. Probeer een ander zoekwoord.",
			"infoFiltered": " (uit _TOTALPLUSMN__MAX_ rijen)",
			"paginate": {
				"first": "Eerste",
				"previous": "Vorige",
				"next": "Volgende",
				"last": "Laatste"
			},
			"lengthMenu": 'Toon <select>'+
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
			"loadingRecords": "Data laden uit de database...",
			"processing": "" // no processing message, we have a spinner
		},
				
		"dom": sTopPaneSettings,
		
		"processing": true,
		"serverSide": true,
		//"deferRender": true,   // TO-DO: we should test if this gives performance gain without bugs!!!
		"ajax": {
			"url": WEBSERV_URL+"/table/gettable",
			"type": "POST",
			"data": function ( d ) {
				
				return $.extend( {}, d, {
			        "sDbName": 			getHttpParams().get("db"),
			        "sTableName": 		sSomeTableName,
			        "bForceExactCount":	bForceExactCount,
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
			
		},
		
		
		// ** Functions called just BEFORE a table update ** 
		"preDrawCallback": function( settings ) {
			
			// show 'in progress' before table draw starts
			gui.showProcessingMsg(sSomeTableName);
			
			var oTable = 		mt.getDataTableObjectOf(sSomeTableName);
			
			// make sure the config filters which should be kept, are kept
			var oTableConfig =	conf.getTableConfig(sSomeTableName);
			
			if (oTable != null)
				{
				oTable.columns().every( function (i){
					
					var thisCol = 		this;
					var sColumnName =	mt.getListOfColumnsOf(sSomeTableName)[i];
					var aColumnConfig =	conf.getColumnConfig(oTableConfig, sColumnName);
					var keepfilter =	conf.getKeepFilterSetting(aColumnConfig);
					if (keepfilter)
						thisCol.search( conf.getFilter(aColumnConfig) );			
					
					// ensure the proper formatting of search values
					// (as select boxes need special format)
					thisCol.search( 
						sf.giveRightShapeToSearchValue( sSomeTableName, sColumnName, thisCol.search() )
						);
					});
				}
			
			
		},
		
		// ** Functions upon table update **
		// (this is called after the row callback)
		"drawCallback": function( settings ) {
			
			// empty go-to function parameter 
			// (as this must happen after the tables was redrawn after a GoTo call, 
			//  otherwise we would keep requesting the same row ids)
			sGoToRowIds = "";
			
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
					
					for (var iColNumber=0; iColNumber<mt.getListOfVisibleColumnsOf(sSomeTableName).length; iColNumber++)
						{
						var currentColumnName =	mt.getListOfVisibleColumnsOf(sSomeTableName)[iColNumber]; 
		        		var oColumnConfig =		conf.getColumnConfig(oTableConfig, currentColumnName);
		        		var sCellToolTip =		conf.getCellTooltip(oColumnConfig);
		        		var currentTooltip =	sCellToolTip!=null && sCellToolTip!="" ? sCellToolTip+"<BR>" : "";
		        		
		        		$("td:eq("+iColNumber+")", oCurrentRow.node())
			        		.attr("title", currentTooltip+"Rij "+ (iRowNumber+1) +" in '"+currentColumnName+"'")
			        		.addClass("tooltip");
						}
				});				
		        
		    }
			
			// perform row grouping in table view, if required		
			var sGroupingColumn = conf.getGroupingColumn(aTableSettings);
			var iGroupingColumn = $.inArray(sGroupingColumn, mt.getListOfColumnsOf(sSomeTableName));
			
			if ( iGroupingColumn >=0 && mt.getViewType(sSomeTableName) =='table' )
				{
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
			if (kf.getActiveTable() == sSomeTableName && mt.getViewType(sSomeTableName) == 'table')
				{
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
				if (mBgColor!=null)
					{
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
	
	// make sure the pagination pane at the bottom keeps correctly aligned with the top pagination pane			
	gui.setPositionOfPaginationPane(sSomeTableName);
	
	
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



/***************************************
 *     construct the export buttons
 ***************************************/ 
tb.addExportButtons = function(sSomeTableName){
	
	var oTable = mt.getDataTableObjectOf(sSomeTableName);
	
	// Export options function
	// see: https://datatables.net/forums/discussion/29804
	//      https://github.com/DataTables/Buttons/blob/master/examples/html5/outputFormat-function.xml
	
	var exportCommonFunction = {
			
			exportOptions: {
				format: { // process checkboxes content before export
					body: function ( data, column, row ) {
						return tb._rightExportValue(data);
						} 
				},
				columns: ':visible' // export only visible columns
			}
	};
	
	// constructor
	// (see above)
	new $.fn.dataTable.Buttons( oTable, {
	    buttons: [
	            	$.extend(true, {}, exportCommonFunction, {
		            	extend: 'copyHtml5', text: 'Naar clipboard'
					}),
					$.extend(true, {}, exportCommonFunction, {
						extend: 'excelHtml5', text: 'Excel', action: tb.newExportAction 
					}),
					$.extend(true, {}, exportCommonFunction, {
						extend: 'pdfHtml5', text: 'PDF'
					}),
					$.extend(true, {}, exportCommonFunction, {
						extend: 'print', text: 'Afdrukken'
					})
	    ]
	} );	

	// attach the buttons to the bottom pane
	oTable.buttons().container()
    .appendTo( $('div.'+sSomeTableName+'_export_pane', oTable.table().container() ) );
	
	// put buttons on the right side
	$('div.'+sSomeTableName+'_export_pane div.dt-buttons').css("float", "right");
}

// --------------------------------------------------------------------------

//subroutine for export buttons

// do a FULL export of the selection, and not only the part of the selection shown on screen (which is default behaviour)
// https://stackoverflow.com/questions/32692618/how-to-export-all-rows-from-datatables-using-ajax

tb.oldExportAction = function (self, e, dt, button, config) {
	
	// print button
	if (button[0].className.indexOf('buttons-print') >= 0) 
	{
        $.fn.dataTable.ext.buttons.print.action(e, dt, button, config);
    }
	// xls button
	else 
	{
        if ($.fn.dataTable.ext.buttons.excelHtml5.available(dt, config)) {
            $.fn.dataTable.ext.buttons.excelHtml5.action.call(self, e, dt, button, config);
        }
        else {
            $.fn.dataTable.ext.buttons.excelFlash.action.call(self, e, dt, button, config);
        }
    }  
};

tb.newExportAction = function (e, dt, button, config) {
    var self = this;
    var oldStart = dt.settings()[0]._iDisplayStart;
    
    // DEFAULT EXPORT (t.i. only screen output)
    
    // Shift key is not pressed -> default export 
    if ( !kf.isPressed("shift"))
    	{
    	tb.oldExportAction(self, e, dt, button, config);
    	return true;
    	}
    
    
    // FULL export (t.i. all database content that meets the filters)

    // Now we will build a callback function which will tell the AJAX function to get all data, 
    // then do the export but cancel the actual draw so that all of that data isn't loading into the DOM. 
    // This callback will be effectively called at the very end of this piece of code
    
    dt.one('preXhr', function (e, s, data) {
    	// one() tells datatables to listen for a table event once and then to remove the listener.
        // 'preXhr' is an Ajax event, which is fired before an Ajax request is made
    	
        // Here is the trick: 
    	// [1] Usually, the export function reads the start & end position of the data shown on screen, and exports exactly
    	//     that part of the data. So, to be able to export everything, we set [data.start] to 0 and set [data.length] to such a high value, 
    	//     that the export function will have to load all data from the server.
    	//     As soon as we've done that, we call the default export function, which is fooled by the new values of [data.start, data.length],
    	//     and load all data into memory (only)!
    	// [2] Now the export is running, restore the original start position [data.start] so it corresponds again to the start position
    	//     of the data shown on screen. If we wouldn't do that, datatables and its screen output would be out of sync, causing malfunction!
    	// [3] Return false, to prevent datatables from loading the full data to the DOM.

    	
    	// step [1]
    	
        data.start = 0;	// get the selection from the beginning (because the start position on screen might not be page 1!)
        data.length = 2147483647; // set the length to a 'random' very high value, just to make sure that we load all data!

        // the following must happen before that table is redrawn
        dt.one('preDraw', function (e, settings) {
        	
            // Call the original export action function 
        	tb.oldExportAction(self, e, dt, button, config);

        	// step [2]
        	
        	// Since we've set data.start=0, DataTables thinks the first item displayed is index 0, but we don't want to render that.
            // So, we set that property back to what it was before exporting.
            dt.one('preXhr', function (e, s, data) {                
                settings._iDisplayStart = oldStart;
                data.start = oldStart;
            });

            // Now we are ready to trigger a new redraw:
            // data.start is set back correctly (see above), so we can reload the grid the way it was just before the export.
            // Otherwise, API functions like table.cell(this) won't work properly.
            setTimeout(dt.ajax.reload, 0);
            
            // step [3]

            // Prevent rendering of the full data to the DOM
            return false;
        });
    });

    // Re-query the server with the new one-time export settings
    // Calling this will trigger the event hereabove
    dt.ajax.reload();
};



// subroutine for export buttons:
// - converts the checkboxes into visible output for export 
//   (show a cross for checked, and nothing for unchecked)
// - converts buttons into empty strings
tb._rightExportValue = function(sValue){
	if (sValue.match(".*type=[\"']checkbox[\"'].*") )
		{
		if (sValue.match("true"))
			return "X";
		else
			return "";			            			 
		}
	else if (sValue.match(".*type=[\"']button[\"'].*") )
		{
		return "";
		}
	else
		return sValue;
};


/***************************************/

// keep in memory for which missing indexes we already gave a warning
var aMissingIndexes = new Array();

// read custom param from server response and process them
tb.processExtraParamsFromServerResponse = function(json, sSomeTableName){
	
	// ** count quality **
	
	// Change count rendering according to count quality
	//
	// NB: Since the info div is not filled immediately after the ajax call,
	//     we have to wait for the draw event to finish before
	//     processing the table info	

	
	$("#"+sSomeTableName).one("draw.dt", json, function(){
		
		var sSubTotal = $("#"+sSomeTableName+"_info").text();
		
		// slow speed because of missing sorting indexes is a bad thing
		if ( typeof json.sNeededIndexForSortColumns != 'undefined' 
				&& json.sNeededIndexForSortColumns != '' 
				&& aMissingIndexes.indexOf(sSomeTableName+json.sNeededIndexForSortColumns) <0 // warning wasn't given yet
				)
			{			
			fn.message("Let op!", "Let op: voor de huidige sorteerkolommen in tabel '"+sSomeTableName+"' " +
						"is geen index beschikbaar.<BR>" +
						"Dit vertraagt het werken met de database.<BR><BR>" +
						"Betroffen kolommen: "+json.sNeededIndexForSortColumns+"<BR><BR>" +
						"Geef dit door aan de administrator.");		
			
			// remember that the warning was already given, so the user won't see it again during the session
			aMissingIndexes.push(sSomeTableName+json.sNeededIndexForSortColumns);
			}
					
		
		// pre-processing: if no query was sent (so result is whole table), Datatables
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
		
		// counting is done, so give bForceExactCount its default value (false) back now
		// (as this might have been set to true by the user by pressing 'pause/break',
		//  to require an exact count)
		bForceExactCount = false;
		
		// now the table info is correctly set, make it visible again
    	$("#"+sSomeTableName+"_info").show();	
    	    	
	});
	
	
	
	// **   reset relevant/visible columns    **
	// ** (when the table is in optimal mode) **
	
	if ( mt.getTableMustBeOptimal(sSomeTableName)
			// if there are no results, there are no relevant columns
			// so the searchboxes will disappear, prevent that by requiring a non-empty result set
			&& json.recordsFiltered > 0 ) 
		{		
		
		// now make the relevant columns visible, and hide the others
		var aRelevantColumns = tb._getRelevantColumnsStraightFromJson(sSomeTableName, json);
		var aVisibleColumns = new Array();	
		var aVisibleColumnsTypes = new Array();
		var oaVisibleColumnsAllowedTypes = new Array();
		
		for (var i=0; i<mt.getListOfColumnsOf(sSomeTableName).length; i++)
			{
			var sCurrentColumnName =		mt.getListOfColumnsOf(sSomeTableName)[i];
			var bColumnShouldBeVisible =	$.inArray(sCurrentColumnName, aRelevantColumns)>-1;
			
			conf.changeTableConfigValue(sSomeTableName, sCurrentColumnName, "visible", bColumnShouldBeVisible);
			if (bColumnShouldBeVisible) 
				{						
				aVisibleColumnsTypes.push(mt.getListOfColumnTypesOf(sSomeTableName)[i]);				
				// Postgres ENUM values
				oaVisibleColumnsAllowedTypes.push(mt.getListOfAllowedValuesInColumnsOf(sSomeTableName)[i]);				
				}
			
			var iColumnIndex = fn.getColumnNumberOf(sSomeTableName, sCurrentColumnName);
			mt.getDataTableObjectOf(sSomeTableName).column(iColumnIndex).visible(bColumnShouldBeVisible, false);
			}
		
		mt.setListOfVisibleColumnsOf(sSomeTableName, aRelevantColumns);
		mt.setListOfTypesOfVisibleColumnsOf(sSomeTableName, aVisibleColumnsTypes);
		// Postgres ENUM values
		mt.setListOfAllowedValuesInVisibleColumnsOf(sSomeTableName, oaVisibleColumnsAllowedTypes);
		
		// enable searchboxes		
		sf.enableSearchFields(sSomeTableName);
		gui.setSearchboxesCss(sSomeTableName);
		
		// highlight (resetter must be called first)
		gui.setColumnHighlightResetter(sSomeTableName);
		gui.setColumnHighlight(sSomeTableName);
		
		}
	
	
};


// read the relevant columns from the Json output of the server
// before rendering has begun
tb._getRelevantColumnsStraightFromJson = function(sSomeTablename, json){
	
	var oTableConfig = conf.getTableConfig(sSomeTablename);
	
	var aRelevantColumnsUnsorted = new Array();
	var aaTableData = json.data;
	
	for (var i=0; i<aaTableData.length; i++)
		{
		for (sColumnName in aaTableData[i])
			{
			// skip non column data ("DT_...")
			if ($.inArray(sColumnName, mt.getListOfColumnsOf(sSomeTablename))<0)
				continue;
			
			// Since some columns contains buttons, we will have to consider those ones 
			// as 'significantly filled' to make sure those keep in sight!
			var aColumnConfig =	conf.getColumnConfig(oTableConfig, sColumnName);
			var sButtonHere = 	conf.getButtonSetting(aColumnConfig);
			
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
	var oTableConfig = 					conf.getTableConfig(sSomeTableName);
	var oWildcardTableConfig = 			conf.getTableConfig("*"); // wildcard
	
	if (oTableConfig == null) 
		oTableConfig = {};	
	
	
	// ---------------------------------------------------------------------
	// special: when available, merge '*' wildcard config (table level)
	//			with current table config
	
	if (oWildcardTableConfig != null)
		{
		for (var sColumnName in oWildcardTableConfig)
			{
			// the wildcard is only applied to columns not mentionned in wildcard 
			// (because explicit configuration wins over wildcard) 
			if (oTableConfig[sColumnName] == null)
				oTableConfig[sColumnName] = oWildcardTableConfig[sColumnName];
			
			// very special: 	we have a wildcard table with a wildcard column, 
			//					and the current table has a wildcard column as well...
			//					Merge!, but give current table config priority in case of propery clash
			if (sColumnName == "*" && oTableConfig[sColumnName] != null)
				{
				oTableConfig[sColumnName] = $.extend({}, oWildcardTableConfig[sColumnName], oTableConfig[sColumnName])
				}
			}
		}
	// ---------------------------------------------------------------------
	
	
	
	// the data that will be set here
	var aVisibleColumns = 				new Array();	
	var aVisibleColumnsTypes = 			new Array();
	var oaVisibleColumnsAllowedTypes =	new Array();
	var aColProps = 					new Array();
	
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
		var oColumnConfig = 		conf.getColumnConfig(oTableConfig, sNameOfCurrentColumn);
		var oWildcartColumnConfig = conf.getColumnConfig(oTableConfig, "*"); // wildcard
		
		// ---------------------------------------------------------------------
		// special: when available, merge '*' wildcard config (column level)
		//			with current column config		
		
		if (oWildcartColumnConfig != null)
			{			
			for (var sPropertyName in oWildcartColumnConfig)
				{
				// the wildcard is only applied to properties not mentionned in wildcard
				// (because explicit configuration wins over wildcard) 
				if (oColumnConfig[sPropertyName] == null)
					conf.changeTableConfigValue(sSomeTableName, sNameOfCurrentColumn, sPropertyName, oWildcartColumnConfig[sPropertyName])
				}
			}
		// ---------------------------------------------------------------------
		
		
		
		
		// retrieve each configuration parameter
		
		// BEWARE about width:
		// https://datatables.net/forums/discussion/41870/column-width-not-working
		
		var columnVisible = 	conf.getVisibility(oColumnConfig);
		var columnSearchable = 	conf.getSearchability(oColumnConfig);
		var columnSortable = 	conf.getSortability(oColumnConfig);
		var columnEditable = 	conf.getEditability(oColumnConfig);
		var columnFilter = 		conf.getFilter(oColumnConfig);
		var columnKeepFilter =	conf.getKeepFilterSetting(oColumnConfig);
		var columnButton = 		conf.getButtonSetting(oColumnConfig);
		var columnWidth = 		conf.getWidthSetting(oColumnConfig);
		var cellClass = 		conf.getCellClass(oColumnConfig);
		var columnType = 		mt.getListOfColumnTypesOf(sSomeTableName)[i];
		var columnHasDataType =	columnType != 'unknown';
		
		// build array of visible columns (we need to distinguish them from complete column list)
		if (columnVisible) 
			{
			aVisibleColumns.push(sNameOfCurrentColumn);
			aVisibleColumnsTypes.push(mt.getListOfColumnTypesOf(sSomeTableName)[i]);
			// Postgres ENUM types
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
				aoSearchColsArray[i] = {"search": sColumnFilterValue};
			}		
		// we have a preset filter from the config file
		if (columnFilter != null &&
				// - at initialisation time:
				//   if we're not required to ignore the filter from the config file, set it!
				// - at a later draw:
				//   if the config says the filter must be kept, keep it!				 
				( columnKeepFilter || !bIgnoreInitialisationFilters) )
			{
			aoSearchColsArray[i] = {"search": columnFilter};
			}
			
		
		// now set the columns
		
		// Each column classname must have its number and name in it
		var sClassPrefix = i+" "+sSomeTableName+" "+sNameOfCurrentColumn+" "+cellClass+" ";
		
		// Do we have a checkbox, and with which datatype?
		var iCheckBoxType = $.inArray(mt.getListOfColumnTypesOf(sSomeTableName)[i], ["bit varying(1)", "boolean"]);
		
		// Or do we have a select box?
		
		// [1] select values from 'choosefrom' in config.js
		var aSelectBoxValues = conf.getSelectionBox(oColumnConfig);
		
		// [2] select values from Postgres ENUM type
		if (aSelectBoxValues == null)
			aSelectBoxValues = mt.getListOfAllowedValuesInColumnsOf(sSomeTableName)[i];
			
		// checkbox cell
		if (iCheckBoxType>=0)
			{				
			var bIsBooleanType = (mt.getListOfColumnTypesOf(sSomeTableName)[i] == "boolean");
			var trueValue = bIsBooleanType ? true : "\"1\"";
			var falseValue = bIsBooleanType ? false : "\"\"";
			
			aColProps.push( { 
				"name": 		sNameOfCurrentColumn,
				"width":		columnWidth,
				"data": 		sNameOfCurrentColumn,				
				"searchable":	false, 
				"targets": 		[i],
				"render": 		function ( data, type, row  ) {
					
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
				"class": 	columnEditable ? 
							sClassPrefix + "editable_checkbox"
							: sClassPrefix + "not_editable_checkbox",
				"visible": 	columnVisible,
				"sortable":	columnVisible && columnHasDataType ? columnSortable : false,
				"orderSequence": columnVisible && columnHasDataType ? [ "asc", "desc" ] : []
				} );
			
			
			}
		// select box cell
		else if (aSelectBoxValues != null && aSelectBoxValues.length>1)
			{			
			aColProps.push( { 
				"name": 		sNameOfCurrentColumn, 
				"width":		columnWidth,
				"data": 		sNameOfCurrentColumn,				
				"searchable":	columnVisible ? columnSearchable : false, 
				"targets": 		[i],
				"class": 		columnEditable ? 
								sClassPrefix + "editable_selectbox"
								: sClassPrefix + "not_editable_selectbox",
				"visible": 		columnVisible,
				"sortable": 	columnVisible && columnHasDataType ? columnSortable : false,
				"orderSequence": columnVisible && columnHasDataType ? [ "asc", "desc" ] : []
				} );
			
		
			}
		// text cell
		else
			{
			// normal text cell (without button)
			if (columnButton == null)
				{
				aColProps.push( {
					"name": 		sNameOfCurrentColumn, 
					"width":		columnWidth,
					"data": 		sNameOfCurrentColumn,					
					"searchable":	columnVisible ? columnSearchable : false, 
					"targets": 		[i],					
					"class": 		columnEditable ?
									sClassPrefix + "editable_text" 
									: sClassPrefix + "not_editable_text",
					"visible": 		columnVisible,
					"sortable": 	columnVisible && columnHasDataType ? columnSortable : false,
					"orderSequence": columnVisible && columnHasDataType ? 
							( columnType.toLowerCase().match(/^(character varying|varchar|char|text)/) != null ? 
									[ "asc", "desc", "asc_reverse", "desc_reverse" ]	// text type 
									: 
									[ "asc", "desc" ] 	 								// other type
							)
							: []		
					} );
				
			
				}
			// text cell with a button
			else
				{
				aColProps.push( { 
					"name": 		sNameOfCurrentColumn, 
					"width":		columnWidth,
					"data": 		sNameOfCurrentColumn,					
					"searchable":	columnVisible ? columnSearchable : false, 
					"targets": 		[i],
					"class": 		columnEditable ?
									sClassPrefix + "editable_text" 
									: sClassPrefix + "not_editable_text",
					"visible": 		columnVisible,
					"sortable": 	false,
					"render": 		function ( data, type, row ){	
						
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
	// Postgres ENUM types
	mt.setListOfAllowedValuesInVisibleColumnsOf(sSomeTableName, oaVisibleColumnsAllowedTypes);
	
	// properties for Datatable object (will be set as soon as this function ends)
	mt.setDatatablesPropsOf(sSomeTableName, aColProps);
	
	
};


// remove a table completely
// (that is: remove html element, datatables object, buttons, everything)
tb.destroyTable = function(sSomeTablename, fnFunction, bRemoveContainerDiv){
	
	// Resizable etc. needs to be destroyed
	$("#"+sSomeTablename+"_dynamic").resizable("destroy");
	
	// If the table is draggable at the moment (that's only the case when the mouse
	// is in the header, as the draggable is destroyed at 'mouseleave'), destroy it as well
	if ( $("#"+sSomeTablename+"_dynamic").hasClass("draggable") )
		{
		$("#"+sSomeTablename+"_dynamic").draggable("destroy");
		$("#"+sSomeTablename+"_dynamic").removeClass("draggable");
		}
	
	// Remove config functions
	// (since they are assigned with jQuery "live", they would keep alive otherwise)
	// We use off() instead of conf.deactivateConfigFunctions()
	// since the last function appeared not to work properly in this case
	$('#'+sSomeTablename+'_dynamic *').off();
	
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


