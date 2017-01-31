/**
 * table selection
 */


var ts = {};

// Request list of available tables and views from the database
// In most cases, all input variables are null
// But those variables can be set so as to be able to open a table upon startup and apply some filters to it 
ts.getListOfTables = function(sTableToCallUponStartUp, oContentToMatchUponStartUp, oTableSettings){		
	
	showSpinner('#indicators');
			
	var url = WEBSERV_URL+"/table/gettables";
	
	$.ajax(
			{
				type: "GET",
				url: url,
				data: {"db_name": getHttpParams().get("db") },
				dataType: "xml",
				contentType: "application/x-www-form-urlencoded;charset=UTF-8",
				success: function(xml) {
					
					removeSpinner('#indicators');
					
					ts.processTableListResponse(sTableToCallUponStartUp, oContentToMatchUponStartUp, oTableSettings, xml);
					},
				error: function(jqXHR, textStatus, errorThrown){
					fn.message("Fout", "XML laden mislukt: "+textStatus+" "+errorThrown);
					}
			});
	
};



// process list of tables and views obtained from the database
// (this is called by the previous function ts.getListOfTables)

ts.processTableListResponse = function(sTableToCallUponStartUp, oContentToMatchUponStartUp, oTableSettings , xml){
	
	var iNumberOfVisibleTables = 0;
	
	// filters or settings to apply to a table being opened upon startup (url parameter table=...)
	var haTableFilters = new Hashtable();
	var haTableSettings = new Hashtable();
	
	// list of table names and description for the list to choose from
	asTableNames.push(neutralValue);
	asTableDescriptions.push( neutralValue );
	asTableComments.push("");
	asTableTypes.push("none");
	abTableVisible.push(true);
	
	// show error message if configuration tries to call a table that is set to be hidden
	if ( sTableToCallUponStartUp != null && conf.isHiddenTable(sTableToCallUponStartUp) )
		{
		fn.message("Fout", "U probeert tabel '"+sTableToCallUponStartUp+"' te openen, " +
				"maar volgens de configuratie moet deze tabel verborgen blijven. " +
				"Zie oShowOnlyTables of oHiddenTablesList in " +
				"het "+getHttpParams().get("db")+".config.js-bestand.");
		}
	
	
	// process the xml table list
	$(xml).find("oneTable").each(function(){
		
		var tableItems = $(this).find("item");
		var sTableName = tableItems.eq(0).text();
		var sTableDescription = tableItems.eq(1).text();
		var sTableComment = tableItems.eq(2).text();
		var sTableType = tableItems.eq(3).text();
		var bTableVisible = !conf.isHiddenTable(sTableName);
		
		// register each table details
		asTableNames.push( sTableName );
		asTableDescriptions.push( sTableDescription );
		asTableComments.push( sTableComment );
		asTableTypes.push( sTableType.toLowerCase() );
		abTableVisible.push( bTableVisible );
		
		
		// register table details
		// (this must happen here, as later on we'll only deal with visible
		//  tables, whereas we need details about all tables, since some might
		//  not be called from the dropdown menu, but with the fn.callDatabase function
		//  which doesn't require a table to be visible in the dropdown menu)
		mt.addAvailableTableDetails( sTableName, 
				[ sTableDescription, sTableType.toLowerCase(), sTableComment ]
		);
		
		
		// if a table must be hidden (as stated in config file) then we skip it
		if ( !bTableVisible )
			return; // continue;
		else
			iNumberOfVisibleTables++;
		
		// set the filters of the table to be called upon startup
		if (tableItems.eq(0).text() == sTableToCallUponStartUp)
			{
			haTableFilters.put( sTableName, oContentToMatchUponStartUp );
			haTableSettings.put( sTableName, oTableSettings );
			}			
		else
			{
			haTableFilters.put( sTableName, {} );
			haTableSettings.put( sTableName, {} );
			}
	});	
	
	ts.buildListOfTables(haTableFilters, haTableSettings);
	
	// if we have only one table to choose from
	// load that table automatically (at least if default behaviour,
	// as stated in bOpenSingleTableAtStartup variable, wasn't turned off in config.js file)
	if (iNumberOfVisibleTables==1 && bOpenSingleTableAtStartup)
		{
		var iIndexOfFirstVisibleTable = $.inArray(true, abTableVisible, 1);
		$("#selected_source").val(asTableNames[iIndexOfFirstVisibleTable]).change();
		// if we have only one table available, let's hide the table selector (which is meaningless now)
		$("#selected_source").hide();
		$("#indicator").find("span").eq(0).hide();
		}
	// else if we are required to open a given table at start up, do it
	else if (sTableToCallUponStartUp != null)
		{
		$("#selected_source").val(sTableToCallUponStartUp).change();
		}
	
};
		

// build and show list of tables/views

ts.buildListOfTables = function(haTableFilters, haTableSettings){
			
	$("#tablechoice").empty();
	
	var formTagToAdd = $("<form></form>")
		.attr("action", "")
		.attr("id", "source_form");

	// action on choosing a table
	
	var selectTagToAdd = $("<select></select>")
		.attr("id", "selected_source")
		.change(function(){
			
			// wrapping needed otherwise IE won't show the spinner
			$(this).queue( function(){
				showSpinner('#indicators');
				$(this).dequeue();
			} ).delay(10).queue(function(){
				ts.callTable(haTableFilters, haTableSettings);
				$(this).dequeue();
			});		
			
			return;

		});

	// append the table names to the menu to choose from
	for (var i=0; i<asTableNames.length; i++)
		{
		
		// skip invisible tables (hidden for user)
		if ( !abTableVisible[i] )
			continue;
		
		// if some 'nice table name' was defined in the project configuration
		// replace the standard table description by this 'nice_name'
		var oTableSettings = conf.getTableSettings(asTableNames[i]);
		var sNiceName = conf.getNiceName(oTableSettings);
		if (sNiceName != null)
			asTableDescriptions[i] = sNiceName;
		
		// outside home environment, showing table comments is not allowed
		var bShowTableComments = ( (document.URL).regexIndexOf( INL_HOMEURL )>-1 );
		
		// append visible table names
		selectTagToAdd.append(
				$("<option></option>")
					.attr("value", asTableNames[i] )
					.text( asTableDescriptions[i] )	
					.css("background", (asTableTypes[i] == "view" ? "#E8E8E8" : "white" ))
					.attr("title", bShowTableComments ? asTableComments[i] : "")
			);
		}
	
	formTagToAdd.append(selectTagToAdd);
	
	$("#tablechoice").append(formTagToAdd);
	
	
	
};

ts.callTable = function(haTableFilters, haTableSettings){
	
	// read the name of the chosen table
	var sTableName = $("#selected_source").find(":selected").val();
	
	// and put the selector back into neutral position
	$("#selected_source").val(neutralValue);
	
	// no choice means do nothing
	if (sTableName == neutralValue) 
		{
		removeSpinner();
		return true;
		}
	
	// special case, ctrl pressed means adding a table to the screen
	if ( kf.isPressed("ctrl") )
		{
		if ($.inArray(sTableName, mt.getListOfLoadedTables())<0 )			
			fn.callDatabase(sTableName, {} );
		else
			{
			removeSpinner();
			fn.message("Let op", "De tabel '"+sTableName+"' is al geladen");
			return true;
			}
			
		}
	// special case, shift pressed means opening a table in a new tab
	else if ( kf.isPressed("shift") )
		{
		removeSpinner();
		kf.registerReleasedKey();
		fn.callDatabaseInNewTab(sTableName, {} );
		}
	// normal case, selection of a table causes removal of all others
	else
		{
		// we make a clean start:
		
		// remove all table properties records
		mt.removeAllTableRecords();
		// and remove all table html frames
		$("#dynamic").children().remove();
		// see:
		// http://forum.jquery.com/topic/jquery-empty-does-not-destroy-ui-widgets-whereas-jquery-remove-does-using-ui-1-8-4
		
		// load the chosen table:				
		fn.callDatabase(sTableName, haTableFilters.get(sTableName), null, haTableSettings.get(sTableName));
		}
};


