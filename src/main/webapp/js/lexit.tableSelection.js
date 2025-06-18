/**
 * table selection
 */


var ts = {};


ts.reinit = function(){
	asTableNames = 			new Array();	// list of database tables names	
	asTableDescriptions =	new Array();	// list of database tables descriptions (visible to user)
	asTableComments = 		new Array();    // list of database tables comments (in the GUI called 'notities'),
												// that can be typed in by clicking onto the table name (in the table header) in the GUI, 
												// and which are also visible through html 'title' attribute
	asTableTypes = 			new Array();	// list of database tables types ('base table', 'view')
	abTableVisible = 		new Array();	// list of database tables visibility (available to user)	
};

// Request list of available tables and views from the database
// In most cases, all input variables are null
// But those variables can be set so as to be able to open a table upon startup and apply some filters to it 
ts.getListOfTables = function(sTableToCallUponStartUp, oContentToMatchUponStartUp, oTableSettings){
	
	lexutil.showSpinner('#indicators');
				
	var url = WEBSERV_URL+"/api/gettables";
	
	$.ajax({
		type: "GET",
		url: url,
		data: {
			"db_name": lexutil.getHttpParams().get("db"),
			"dummy": lexutil.getUniqueNumber()
		},
		dataType: "xml",
		//contentType: "application/x-www-form-urlencoded;charset=UTF-8",
		success: function(xml) {
			
			lexutil.removeSpinner('#indicators');					
			ts.processTableListResponse(sTableToCallUponStartUp, oContentToMatchUponStartUp, oTableSettings, xml);
		},
		error: function(jqXHR, textStatus, errorThrown){
			
			lexutil.removeSpinner('#indicators');
			fn.message(lang.error, lang.loading_xml_failed+ ": "+textStatus+" "+errorThrown);
		}
	});
	
};



// process list of tables and views obtained from the database
// (this is called by the previous function ts.getListOfTables)

ts.processTableListResponse = function(sTableToCallUponStartUp, oContentToMatchUponStartUp, oTableSettings, xml){
	
	var iNumberOfVisibleTables = 0;
	
	// filters or settings to apply to a table being opened upon startup (url parameter table=...)
	var haTableFilters = 	new Hashtable();
	var haTableSettings =	new Hashtable();
	
	// lists of tables groups
	// (the array will contain the names of the groups, sorted in order of creation;
	//  and we will make sure that the group containing the neutral value 'Kies een tabel' is created first!)
	// (the hash will map a group name to a list of tables belonging to it)
	var aTableGroups = 		new Array();
	var haTableGroups =		new Hashtable();
	
	// create a neutral nameless group, with the neutral value as its first option
	if (aTableGroups[""] == null){ // prevent adding the neutral value multiple times (which can happen if fn.rebuildTablesMenu() was called)
		aTableGroups.push( "" );
		haTableGroups.put( "", [lang.choose_a_table_default_value] );
	
		// list of table names and description for the list to choose from
		asTableNames.push( lang.choose_a_table_default_value );
		asTableDescriptions.push( lang.choose_a_table_default_value );
		asTableComments.push( "" );	// comments (in the GUI called 'notities'), that can be typed in by clicking onto the table name (in the table header),
									// and which are also visible through html 'title' attribute
		asTableTypes.push( "none" );
		abTableVisible.push( true );
	
	}
	
	// show error message if configuration tries to call a table that is set to be hidden
	if ( sTableToCallUponStartUp != null && conf.isHiddenTable(sTableToCallUponStartUp) ) {
		fn.message(lang.error, 
			"'"+sTableToCallUponStartUp+"': " +lang.error_opening_hidden_table+	" "+lexutil.getHttpParams().get("db")+".config.js");
	}
	
		
	// process the xml table list
	$(xml).find("oneTable").each(function(){
		
		var tableItems = 		$(this).find("item");
		var sTableName = 		tableItems.eq(0).text();
		var sTableDescription =	tableItems.eq(1).text();
		var sTableComment = 	tableItems.eq(2).text();
		var sTableType = 		tableItems.eq(3).text();
		var bTableVisible =		!conf.isHiddenTable(sTableName);
		
		// THIS needs to be done here, for the following code to work properly
		// if the table is an uploaded table, create base config on the fly
		if (sTableComment.indexOf("_UPLOADED_")>-1) {
			
			conf.changeTableSettingValue(sTableName, "group", lang.import_tablelist_uploadlabel);
			conf.changeTableSettingValue(sTableName, "exact_count", true);
			
			// of course, an uploaded table must be visible too!
			bTableVisible = true;
		}
		
		// get configuration info
		var aTableSettings = conf.getTableSettings(sTableName);
		
		// get the name of the group the table belongs to
		// (or 'default' if the configuration file assigns no group to this table)
		var sTableGroup = conf.getTableGroup(aTableSettings);
		
		
		// get the list of tables belonging to this group and add the current table to it
		var aTablesInGroup = haTableGroups.get(sTableGroup);
		// if this group is not yet defined, create it now
		if (aTablesInGroup == null) {
			aTableGroups.push(sTableGroup);
			aTablesInGroup = new Array();
		}
		aTablesInGroup.push(sTableName);
		haTableGroups.put(sTableGroup, aTablesInGroup);
		
		
		// if some 'nice table name' was defined in the project configuration
		// replace the standard table description by this 'nice_name'
		var sNiceName = conf.getNiceName(aTableSettings);
		if (sNiceName != null)
			sTableDescription = sNiceName;


		// parse the table comments into created/finished/processed + notes
		var oTableComments = head._parseTableNotes(sTableComment);
		

		// if some extra user info is available in the configuration (like job of table description, creation date)
		// add it to the table description
		var aFullDescription = new Array();
				
		var sCreationDate = oTableComments["created"];
		var sFinishedDate = oTableComments["finished"];
		var sProcessedDate = oTableComments["processed"];
		
		// the else if statements are in order of importance
		if (sProcessedDate != null && sProcessedDate != '')
			aFullDescription.push(lang.job_short_processed_on+" "+sProcessedDate);
		else if (sFinishedDate != null && sFinishedDate != '')
			aFullDescription.push(lang.job_short_finished_on+" "+sFinishedDate);
		else if (sCreationDate != null && sCreationDate != '')
			aFullDescription.push(lang.job_short_started_on+" "+sCreationDate);		
		
		
		
		var sTableInfo = conf.getTableInfo(aTableSettings);
		if (sTableInfo != null)
			aFullDescription.push(sTableInfo);
		
		if (aFullDescription.length>0) {
			// remove '(VIEW)' or '(BASE TABLE)'
			// and add extra info
			sTableDescription = sTableDescription.replace(/\([A-Z\s]+\)/, "");
			sTableDescription += " ("+aFullDescription.join(" - ")+")";
		}
		
		
		
		// add table to lists
		
		asTableNames.push( sTableName );
		asTableDescriptions.push( sTableDescription );
		asTableComments.push( oTableComments["notes"] );
		asTableTypes.push( sTableType.toLowerCase() );
		abTableVisible.push( bTableVisible );


		
		// register table details
		// (this must happen here, as later on we'll only deal with visible
		//  tables, whereas we need details about all tables, since some might
		//  not be called from the dropdown menu, but with the fn.callDatabase function
		//  which doesn't require a table to be visible in the dropdown menu)
		mt.addAvailableTableDetails( sTableName, 
				[ sTableDescription, sTableType.toLowerCase(), oTableComments["notes"] ]
		);
		
		
		// if a table must be hidden (as stated in config file) then we skip it
		if ( !bTableVisible )
			return; // continue;
		else
			iNumberOfVisibleTables++;
		
		// set the filters of the table to be called upon startup
		if (tableItems.eq(0).text() == sTableToCallUponStartUp) {
			haTableFilters.put( sTableName, oContentToMatchUponStartUp );
			haTableSettings.put( sTableName, oTableSettings );
		}			
		else {
			haTableFilters.put( sTableName, {} );
			haTableSettings.put( sTableName, {} );
		}
	});	
	
	
	// make sure that groups are sorted alphabetically, except the empty name "" and the "Default" names, which must come first
	aTableGroups.sort((a, b) => {
	    if (a === "") return -1; // Empty string comes first
	    if (b === "") return 1;
	    if (a === "Default") return -1; // "Default" comes second     NB: Default is returned by function conf.getTableGroup()
	    if (b === "Default") return 1;
	    return a.localeCompare(b); // Alphabetical order for the rest
	});

	
	// build a selection list now
	ts.buildListOfTables(haTableFilters, haTableSettings, aTableGroups, haTableGroups);
	
	// if we have only one table to choose from
	// load that table automatically (at least if default behaviour,
	// as stated in bOpenSingleTableAtStartup variable, wasn't turned off in config.js file)
	if (iNumberOfVisibleTables==1 && bOpenSingleTableAtStartup) {
		
		var iIndexOfFirstVisibleTable = $.inArray(true, abTableVisible, 1);
		$("#selected_source").val(asTableNames[iIndexOfFirstVisibleTable]).change();
		
		// if we have only one table available, let's hide the table selector (which is meaningless now)
		$("#selected_source").hide();
		$("#indicator").find("span").eq(0).hide();
	}
	// else if we are required to open a given table at start up, do it
	else if (sTableToCallUponStartUp != null) {
		$("#selected_source").val(sTableToCallUponStartUp).change();
	}
};
		

// build and show list of tables/views

ts.buildListOfTables = function(haTableFilters, haTableSettings, aTablesGroups, haTableGroups){
			
	$("#tablechoice").empty();
	
	var formTagToAdd = $("<form></form>")
		.attr("action", "#");
	
	var labelTagToAdd = $("<label></label>")
		.attr("for", "source_form");

	// action on choosing a table
	
	var selectTagToAdd = $("<select></select>")
		.attr("id", "selected_source")
		.attr("name", "selected_source")
		.change(function(){
			
			// wrapping needed otherwise IE won't show the spinner
			$(this).queue( function(){
				lexutil.showSpinner('#indicators');
				$(this).dequeue();
			} ).delay(10).queue(function(){
				ts.callTable(haTableFilters, haTableSettings);
				$(this).dequeue();
			});		
			
			return;

		});

	for (var j=0; j<aTablesGroups.length; j++) {
		
		// get the name of the group
		var sOneGroupName = aTablesGroups[j];
		
		// add an html element for current group 
		var groupTagToAdd = $("<optgroup></optgroup>")
			.attr("label", sOneGroupName);
		
		// get the list of tables belonging to current groupname
		var aCurrentGroupOfTables = haTableGroups.get(sOneGroupName);
		
		// append the table names to the menu to choose from
		for (var i=0; i<asTableNames.length; i++) {
			
			// skip invisible tables (hidden for user)
			if ( !abTableVisible[i] )
				continue;
			
			// skip table that doesn't belong to current group
			if ($.inArray(asTableNames[i], aCurrentGroupOfTables)<0)
				continue;
			
			// outside home environment, showing table comments is not allowed
			var bShowTableComments = ( (document.URL).regexIndexOf( INL_HOMEURL )>-1 );
			
			
			// append visible table names
			var optionTagToAdd = $("<option></option>")
					.attr("value", asTableNames[i] )
					.html( asTableDescriptions[i] )	
					.css("background", (asTableTypes[i] == "view" ? "#E8E8E8" : "white" ))
					.attr("title", bShowTableComments ? asTableComments[i] : "")
					.attr("disabled", (asTableComments[i] == "separator"));
			
			// if the table some label, disable it 
			if (asTableNames[i] == lang.choose_a_table_default_value)
				optionTagToAdd.attr("disabled", "").attr("selected", "");
			
			// ready to append to current group
			groupTagToAdd.append(
				optionTagToAdd
			);
		}
		
		// add the group we just built, to the select tag
		selectTagToAdd.append(groupTagToAdd);	
	}
	
	
	// add the select tag to the form tag	
	formTagToAdd.append(selectTagToAdd);
	
	$("#tablechoice").append(formTagToAdd);
	
	// generate select menu
	$("#source_form").selectmenu();
	
};

ts.callTable = function(haTableFilters, haTableSettings){
	
	// read the name of the chosen table
	var sTableName = $("#selected_source").find(":selected").val();
	
	// and put the selector back into neutral position
	$("#selected_source").val(lang.choose_a_table_default_value);
	
	// no choice means do nothing
	if (sTableName == lang.choose_a_table_default_value) {
		lexutil.removeSpinner();
		return true;
	}
	
	// special case, ctrl pressed means adding a table to the screen
	if ( kf.isPressed("ctrl") ) {
		
		if ($.inArray(sTableName, mt.getListOfLoadedTables())<0 )			
			fn.callDatabase(sTableName, {} );
		else {
			lexutil.removeSpinner();
			fn.message(lang.beware, lang.already_loaded);
			return true;
		}
			
	}
	// special case, shift pressed means opening a table in a new tab
	else if ( kf.isPressed("shift") ) {
		lexutil.removeSpinner();
		kf.registerReleasedKey();
		fn.callDatabaseInNewTab(sTableName, {} );
	}
	// normal case, selection of a table causes removal of all others
	else {
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


