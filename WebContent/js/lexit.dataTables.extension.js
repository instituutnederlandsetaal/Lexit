/**
 * 
 */



// new functions


// set one per-column filter without sending a request
// (which happens when using fnFilter)
$.fn.dataTableExt.oApi.fnSetOneFilter  = function ( oSettings, searchString, i )
{
	oSettings.aoPreSearchCols[i].sSearch = searchString;
};

// add a drawcallback if needed
$.fn.dataTableExt.oApi.addDrawCallback = function ( oSettings, name, fnFunction )
{
	
	for (var i=0; i<oSettings.aoDrawCallback.length; i++)
		{
		oneDrawCallbackSet = oSettings.aoDrawCallback[i];
		
		// not found? loop further
		if (typeof oneDrawCallbackSet["sName"]=='undefined')
			continue;
		
		// found ? replace the function
		if (oneDrawCallbackSet["sName"] == name)
			{
			oSettings.aoDrawCallback[i]["fn"] = fnFunction;
			return;
			}
		}
	
	// otherwise add the function
	oSettings.aoDrawCallback.push( {
		"fn": fnFunction,
		"sName": name
	} );
};

// clear filters
$.fn.dataTableExt.oApi.fnFilterClear  = function ( oSettings )
{
	/* Remove global filter */
	oSettings.oPreviousSearch.sSearch = "";
	
	/* Remove the search text for the column filters */
	for ( var i=0, iLen=oSettings.aoPreSearchCols.length ; i<iLen ; i++ )
	{
		oSettings.aoPreSearchCols[i].sSearch = "";
	}
};

// reset filters (that is: set those to the filter value from the config file)
$.fn.dataTableExt.oApi.fnFilterReset  = function ( oSettings, sTableName )
{
	/* Remove global filter */
	oSettings.oPreviousSearch.sSearch = "";
	
	var oTableConfig = conf.getTableConfig(sTableName);
	
	/* Reset the search text for the column filters */
	for ( var i=0, iLen=oSettings.aoPreSearchCols.length ; i<iLen ; i++ )
	{
		var sColumnName = mt.getListOfColumnsOf(sTableName)[i];
		var aColumnConfig = conf.getColumnConfig(oTableConfig, sColumnName);
		var keepfilter = conf.getKeepFilterSetting(aColumnConfig);
		var sValue = keepfilter ? conf.getFilter(aColumnConfig) : null;
		sValue = (sValue == null) ? "" : sValue;		
		
		oSettings.aoPreSearchCols[i].sSearch = ( sValue );
	}
};

// set filters to some values, given array of filters
$.fn.dataTableExt.oApi.fnFilterSet  = function ( oSettings, sTableName, oFilters )
{
	/* Remove global filter */
	oSettings.oPreviousSearch.sSearch = "";
	
	/* Set the search text for the column filters */
	for ( var i=0, iLen=oSettings.aoPreSearchCols.length ; i<iLen ; i++ )
	{
		var sColumnName = mt.getListOfColumnsOf(sTableName)[i];
		var sValue = (oFilters[sColumnName] == null) ? "" : oFilters[sColumnName];
		
		oSettings.aoPreSearchCols[i].sSearch = ( sValue );
	}
};
$.fn.dataTableExt.oApi.fnFilterGet  = function ( oSettings, sTableName )
{
	var filterList = {};
	
	/* Set the search text for the column filters */
	for ( var i=0, iLen=oSettings.aoPreSearchCols.length ; i<iLen ; i++ )
	{
		var sColumnName = mt.getListOfColumnsOf(sTableName)[i];
		var sValue = oSettings.aoPreSearchCols[i].sSearch;

		// remove the 'exact:' prefix belonging to search values of select boxes
		if (typeof sValue == 'string')
			sValue = sValue.replace("exact:", "");		

		filterList[sColumnName] = sValue;
	}
	
	return filterList;
};

// set the global filter
$.fn.dataTableExt.oApi.fnGlobalFilterSet  = function ( oSettings, sValue)
{
	/* Set global filter */
	oSettings.oPreviousSearch.sSearch = sValue;
};
$.fn.dataTableExt.oApi.fnGlobalFilterGet  = function ( oSettings )
{
	/* Get global filter */
	return oSettings.oPreviousSearch.sSearch;
};


// add some filters to existing filters (see fnFilterSet)
$.fn.dataTableExt.oApi.fnFilterAdd  = function ( oSettings, sTableName, oFilters )
{	
	// Loop throught the columns and add the searched text for each column filter 
	for ( var i=0, iLen=oSettings.aoPreSearchCols.length ; i<iLen ; i++ )
	{
		var sColumnName = mt.getListOfColumnsOf(sTableName)[i];
		var sValue = oFilters[sColumnName];
		
		if (sValue == null) 
			continue;
		
		oSettings.aoPreSearchCols[i].sSearch = sValue;
	}
};

// When DataTables removes columns from the display (bVisible or fnSetColumnVis)
// it removes these elements from the DOM, effecting the index value for the column
// positions. This function converts the visible column index into a data column
// index (i.e. all columns regardless of visibility).
$.fn.dataTableExt.oApi.fnVisibleToColumnIndex = function ( oSettings, iMatch )
{
  return oSettings.oApi._fnVisibleToColumnIndex( oSettings, iMatch );
};


// abort a Datatable draw
// This is useful when loading a table in certain circumstances is too slow and
// one wants to abort the database call and carry on with another call
$.fn.dataTableExt.oApi.fnAbortCall = function ( oSettings ){
	
	oSettings.jqXHR.abort();	
};


// Jump to a specific table row
$.fn.dataTableExt.oApi.fnDisplayRow = function ( oSettings, iPos )
{
	// Account for the "display" all case - row is already displayed
    if ( oSettings._iDisplayLength == -1 )
    {
        return;
    };
      
    // Alter the start point of the paging display
    if( iPos >= 0 )
    {
        oSettings._iDisplayStart = ( Math.floor(iPos / oSettings._iDisplayLength) ) * oSettings._iDisplayLength;
        this.oApi._fnCalculateEnd( oSettings );
    }
      
    this.oApi._fnDraw( oSettings );
};

//Jump to a specific table row
$.fn.dataTableExt.oApi.fnDisplayStart = function ( oSettings, iStart, bRedraw )
{
    if ( typeof bRedraw == 'undefined' )
    {
        bRedraw = true;
    }
      
    oSettings._iDisplayStart = iStart;
    oSettings.oApi._fnCalculateEnd( oSettings );
      
    if ( bRedraw )
    {
        oSettings.oApi._fnDraw( oSettings );
    }
};


// Change the number of records that can be viewed on a single page in DataTables
$.fn.dataTableExt.oApi.fnLengthChange = function ( oSettings, iDisplay, bRedraw )
{
	if ( typeof bRedraw == 'undefined' )
    {
        bRedraw = true;
    }
	
    oSettings._iDisplayLength = iDisplay;
    oSettings.oApi._fnCalculateEnd( oSettings );
      
    /* If we have space to show extra rows (backing up from the end point - then do so */
    if ( oSettings._iDisplayEnd == oSettings.aiDisplay.length )
    {
        oSettings._iDisplayStart = oSettings._iDisplayEnd - oSettings._iDisplayLength;
        if ( oSettings._iDisplayStart < 0 )
        {
            oSettings._iDisplayStart = 0;
        }
    }
      
    if ( oSettings._iDisplayLength == -1 )
    {
        oSettings._iDisplayStart = 0;
    }
    
    if ( bRedraw )
    	{
    	oSettings.oApi._fnDraw( oSettings );
    	}    	
      
    if ( oSettings.aanFeatures.l )
    {
        $('select', oSettings.aanFeatures.l).val( iDisplay );
    }
};