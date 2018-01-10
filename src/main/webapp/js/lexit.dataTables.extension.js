/**
 * 
 */



// new functions


// when rendering a large amount of text in a cell, limit the output to a certain number of characters
// see: https://datatables.net/blog/2016-02-26

$.fn.dataTable.render.ellipsis = function ( cutoff ) {
    return function ( data, type, row ) {
        return type === 'display' && data.length > cutoff ?
            data.substr( 0, cutoff ) +'…' :
            data;
    }
};


// get the table context of the selected table 
// (this way, we can access the settings of this particular table)

$.fn.dataTable.Api.register('getTableContext()', function() {
	
	var oTable = this;
	var sTableName =	fx.getTableName(oTable);
	var oSettings = 	oTable.settings();
	var oContext = 		oSettings.context;
	var currentContext;
	
	for (currentContext in oContext)
	{
	if (oContext[currentContext].sTableId == sTableName)
		{
		// found it, leave the loop
		break;
		}
	}
	
	return oContext[currentContext];
});



// add a drawcallback if needed
$.fn.dataTable.Api.register('addDrawCallback()', function(sCallbackName, fnFunction) {
	
	// get table context
	var oContext = 			this.table().getTableContext();
	
	// get the array of callbacks of the table 
	var aDrawCallbacks =	oContext.aoDrawCallback;
	
	// now find the callback if it was already created earlier
	for (var i=0; i<aDrawCallbacks.length; i++)
		{
		var oneDrawCallbackSet = aDrawCallbacks[i];
		
		// not found? loop further
		if (typeof oneDrawCallbackSet["sName"]=='undefined')
			continue;
		
		// found ? replace the function
		if (oneDrawCallbackSet["sName"] == sCallbackName)
			{
			oContext.aoDrawCallback[i]["fn"] = fnFunction;			
			// done, leave here
			return;
			}
		}
	
	// otherwise (if callback with this name doesn't exist yet), add it
	oContext.aoDrawCallback.push( {
		"fn": 		fnFunction,
		"sName":	sCallbackName
	} );
});



// clear filters (and remove initialisation filters)
$.fn.dataTable.Api.register('clearSearchFilters()', function() {
	
	var oTable = 		this.table();
	var sTableName =	fx.getTableName(oTable);
	
	/* Empty global filter */
	oTable.search("");
	
	/* Empty the column filters */	
	for ( var i=0, iLen=mt.getListOfColumnsOf(sTableName).length ; i<iLen ; i++ )
		{
		oTable.columns(i).search("");
		}
});

// reset filters (that is: set those to the filter value from the config file)
$.fn.dataTable.Api.register('resetSearchFilters()', function(bUpdateSearchBoxesValues) {
	
	if ( typeof bUpdateSearchBoxesValues == 'undefined' )
    {
		bUpdateSearchBoxesValues = true;
    }
	
	var oTable = 		this.table();
	var sTableName =	fx.getTableName(oTable);
	
	/* Empty global filter */
	oTable.search("");
	
	var oTableConfig =	conf.getTableConfig(sTableName);
	
	/* Empty the column filters */
	for ( var i=0, iLen=mt.getListOfColumnsOf(sTableName).length ; i<iLen ; i++ )
		{
		var sColumnName = 		mt.getListOfColumnsOf(sTableName)[i];
		var aColumnConfig =		conf.getColumnConfig(oTableConfig, sColumnName);
		var keepfilter = 		conf.getKeepFilterSetting(aColumnConfig);
		
		var sValue = 			keepfilter ? conf.getFilter(aColumnConfig) : null;
		sValue = 				(sValue == null) ? "" : sValue;
		
		oTable.columns(i).search(sValue);
				
		if (bUpdateSearchBoxesValues)
			fn.putDataIntoFilterBox(sTableName, sColumnName, sValue);
		}

});


//set one per-column filter without sending a request
$.fn.dataTable.Api.register('setOneFilter()', function( sSearchString, i ){
	
	var oTable = this.table();
	oTable.column(i).search(sSearchString);
});


// Set filters to some values, given array of filters
// BEWARE: this function erases previous settings,
//         so to be able to keep filter values in other columns, use addSearchFilters instead
$.fn.dataTable.Api.register('setSearchFilters()', function(oFilters, bUpdateSearchBoxesValues) {
	
	if ( typeof bUpdateSearchBoxesValues == 'undefined' )
    {
		bUpdateSearchBoxesValues = true;
    }
	
	var oTable = 		this.table();
	var sTableName =	fx.getTableName(oTable);
	
	/* Remove global filter */
	oTable.search("");
	
	/* Empty the column filters */
	for ( var i=0, iLen=mt.getListOfColumnsOf(sTableName).length ; i<iLen ; i++ )
		{
		oTable.columns(i).search("");
		}
	
	/* Set the search text for the column filters */
	for (var sColumnName in oFilters)
		{		
		var sValue = oFilters[sColumnName];
		if (sValue == null) 
			sValue = "";
		
		var iColIndex = $.inArray(sColumnName, mt.getListOfColumnsOf(sTableName));
		oTable.columns(iColIndex).search(sValue);
		
		if (bUpdateSearchBoxesValues)
			fn.putDataIntoFilterBox(sTableName, sColumnName, sValue);
		}
	
});




// returns: associative array
$.fn.dataTable.Api.register('getSearchFilters()', function() {
	
	var oTable = 		this.table();
	var sTableName =	fx.getTableName(oTable);
	
	var filterList = {};

	/* Get the search text for the column filters */
	for ( var i=0, iLen=mt.getListOfColumnsOf(sTableName).length ; i<iLen ; i++ )
	{
		var sColumnName =	mt.getListOfColumnsOf(sTableName)[i];
		var sValue = 		oTable.column(i).search();
		
		// remove the 'exact:' prefix belonging to search values of select boxes
		if (typeof sValue == 'string')
			sValue = sValue.replace("exact:", "");
		
		filterList[sColumnName] = sValue;
	}
	return filterList;
});



// Add some filters to existing filters (see setSearchFilters)
// BEWARE: this function keeps the values of other columns,
// so to set a filter and automatically remove filters in other columns, use fnFilterSet instead
$.fn.dataTable.Api.register('addSearchFilters()', function(oFilters) {
	
	var oTable = 		this.table();
	var sTableName =	fx.getTableName(oTable);
	
	for (var sColumnName in oFilters)
		{		
		var sValue = oFilters[sColumnName];
		if (sValue == null) 
			continue;
		
		var iColIndex = $.inArray(sColumnName, mt.getListOfColumnsOf(sTableName));
		oTable.columns(iColIndex).search(sValue);
		}
	
});



// abort a Datatable draw
// This is useful when loading a table in certain circumstances is too slow and
// one wants to abort the database call and carry on with another call

$.fn.dataTable.Api.register('abortCall()', function() {
	
	var oContext = this.table().getTableContext();	
	oContext.jqXHR.abort();	
		
});



// Jump to a specific table row
// adapted from https://www.datatables.net/plug-ins/api/row%28%29.show%28%29

$.fn.dataTable.Api.register('displayRow()', function(iPos) {
	
    var page_info = this.page.info();
   
   // Already on right page ?
    if( iPos >= page_info.start && iPos < page_info.end ) {
        // Return row object
        return this;
    }
    // Find page number
    var page_to_display = Math.floor( iPos / this.page.len() );
    // Go to that page
    this.page( page_to_display );
    
    // Return row object
    return this;
});


// Special function to set sorting back to neutral
// https://www.datatables.net/plug-ins/api/order.neutral%28%29
$.fn.dataTable.Api.register( 'order.neutral()', function () {
	
    return this.iterator( 'table', function ( s ) {
        s.aaSorting.length = 0;
        s.aiDisplay.sort( function (a,b) {
            return a-b;
        } );
        s.aiDisplayMaster.sort( function (a,b) {
            return a-b;
        } );
    } );
} );
