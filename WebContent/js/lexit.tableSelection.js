/**
 * 
 */


var ts = {};

// Request list of available tables and views from the database
// Normally, both input variables are null
// We use those variable if we are supposed to open a table upon startup and apply some filters to it 
ts.getListOfTables = function(sTableToCallUponStartUp, oContentToMatchUponStartUp, oTableSettings){			
			
	var url = "/lexit/lexit/table/gettables";
	
	$.ajax(
			{
				type: "GET",
				url: url,
				data: {"db_name": getHttpParams().get("db") },
				dataType: "xml",
				contentType: "application/x-www-form-urlencoded;charset=UTF-8",
				success: function(xml) {ts.processTableListResponse(sTableToCallUponStartUp, oContentToMatchUponStartUp, oTableSettings, xml);},
				error: function(jqXHR, textStatus, errorThrown){alert("XML laden mislukt: "+textStatus+" "+errorThrown);}
			});
	
};


// process list of tables and views obtained from the database

var asTableNames = new Array();
var asTableDescriptions = new Array();
var asTableComments = new Array();
var asTableTypes = new Array();
var abTableVisible = new Array();

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
		asTableComments.push(sTableComment);
		asTableTypes.push( sTableType.toLowerCase() );
		abTableVisible.push( bTableVisible );
		
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
	// load that table automatically
	if (iNumberOfVisibleTables==1)
		{
		var iIndexOfFirstVisibleTable = $.inArray(true, abTableVisible, 1);
		$("#selected_source").val(asTableNames[iIndexOfFirstVisibleTable]).change();
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
		
		// append visible table names
		selectTagToAdd.append(
				$("<option></option>")
					.attr("value", asTableNames[i] )
					.text( asTableDescriptions[i] )	
					.css("background", (asTableTypes[i] == "view" ? "#E8E8E8" : "white" ))
					.attr("title", asTableComments[i])
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
			alert("Deze tabel is al geladen");
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


