


// ***********************************************
// **                                           **
// **   Lex'it plugin v2021.11.15 - (c) IvdNT   **
// **                                           **
// ***********************************************

var lexit = {};

// URL of the Lex'it webservice
// BEWARE: make sure the webservice matches [at least closely] the plugin version,
//         otherwise you might end up with compatibility issues
var BASE_URL = "http://lexit.inl.loc:8080/lexit2";	

// URL where this code is located
var thisURL = "lexitjs/";

// *********************************************************************************************************

// CONSTANTS

var neutralValue = "Kies een tabel";
var neutralColumnValue = "Alles";

// INL Home url, as a regex like: /(...)/
// current value should catch both 'inl' as 'ivdnt' domains
var INL_HOMEURL = /(inl\.loc|ivdnt\.loc|localhost)/;	

// base url for all http requests
var WEBSERV_URL = BASE_URL + "/webservice";

// Argument separator within single string 
// this will be loaded from webservice (so we're sure the same value is used both in client and server)
// It will be set by setInternalSeparator() at initialization time
var ARG_INTERNAL_SEPARATOR = null;

// Data type returned by database when a field type is user-defined
var USER_DEFINED = "USER-DEFINED";

// Name of user that has logged in, and its session-ID. This is set by fn.setCurrentUser() at initialization time
var USERNAME = null;
var SESSION_ID = null;

// configuration file variables
var oTableSettingsList;
var oHiddenTablesList;
var oTableConfigurationList;
var aFullConfigFilesList = 	new Array(); 	// list of projects config files on server

// about the database
var asTableNames = 			new Array();
var asTableDescriptions =	new Array();
var asTableComments = 		new Array();
var asTableTypes = 			new Array();
var abTableVisible = 		new Array();

// state variables
var originalBgColor;

// tooltips in table allowed by user or not (default is true)
var bTooltipsAllowedInTable = true;

// Should we compute quick estimates (for sake of speed) ?
// Yes we do, so the value is 'false', 
// but this might be temporarily manually set to 'true' by user (for a table refresh)
var bForceExactCount = false;

// In case only one single table is available to the user to choose from,
// this table will be opened automatically (default value 'true')
// This behaviour can be switched off by calling fn.preventAutomaticStartup() in config.js file
var bOpenSingleTableAtStartup = true;

// If some action needs to be performed (eg. to restore a given situation)
// as soon as a tab regains or looses focus, some function can be declared to do so,
// by calling fn.doAtFocusGain(). The function will be store in this variable.
// (default is null)
var fnDoAtFocusGain;
var fnDoAtFocusLoss;

// http parameters	
var paramsHash;

// go-to funtion parameter (all info at Database.getRowNumberOfRecord)
var aGoToRowIds = {};

// booleans: 
// are we on Mac or PC?
var isMac = navigator.platform.toUpperCase().indexOf('MAC')>=0;
// tell IE won't work
var msie = /MSIE|Trident/.test(window.navigator.userAgent);
if (msie > 0){		
	alert("Internet Explorer is not supported in Lex'it plugin.");
}	

// *********************************************************************************************************
// Load libraries and so on
//

// load the CSS

$('head').append('<link rel="stylesheet" href="'+thisURL+'css/lexit_table.css" type="text/css" />');
$('head').append('<link rel="stylesheet" href="'+thisURL+'css/jquery-ui.css" type="text/css" />');
$('head').append('<link rel="stylesheet" href="'+thisURL+'css/jquery-ui.structure.css" type="text/css" />');
$('head').append('<link rel="stylesheet" href="'+thisURL+'css/jquery-ui.theme.css" type="text/css" />');
$('head').append('<link rel="stylesheet" href="'+thisURL+'css/tipTip.css" type="text/css" />');
$('head').append('<link rel="stylesheet" href="'+thisURL+'css/jquery.contextMenu.css" type="text/css" />');
$('head').append('<link rel="stylesheet" href="'+thisURL+'css/buttons.dataTables.css" />');



lexit.aLibrariesList = [
	thisURL+"js/jquery.dataTables.js",	// datatables (BEWARE: not default, but with a few modifications)

	// load Export facilities
	"https://cdnjs.cloudflare.com/ajax/libs/jszip/2.5.0/jszip.min.js",
	"https://cdn.rawgit.com/bpampuch/pdfmake/0.1.18/build/pdfmake.min.js",
	"https://cdn.rawgit.com/bpampuch/pdfmake/0.1.18/build/vfs_fonts.js",
	thisURL+"js/dataTables.buttons.js",
	thisURL+"js/buttons.html5.js",
	thisURL+"js/buttons.print.js",

	// JS Extensions
	thisURL+"js/jshashtable.js",
	thisURL+"js/util.js",
	thisURL+"js/jquery.jeditable.1.7.3.js",
	thisURL+"js/jquery.cookie.js",
	thisURL+"js/jquery-ui.js",
	thisURL+"js/jquery.tipTip.js",
	thisURL+"js/jquery.contextMenu.js",
	thisURL+"js/jquery.ui.position.js",
	thisURL+"js/spin.js",
	thisURL+"js/browserdetection.js",

	// Lex'it code
	thisURL+"js/lexit.searchFunctions.js",
	thisURL+"js/lexit.tableDetails.js",
	thisURL+"js/lexit.simpleSearchAndReplace.js",
	thisURL+"js/lexit.gui.js",
	thisURL+"js/lexit.gui_header.js",
	thisURL+"js/lexit.gui_refresh.js",
	thisURL+"js/lexit.gui_rowselect.js",
	thisURL+"js/lexit.keys.js",
	thisURL+"js/lexit.tableSelection.js",
	thisURL+"js/lexit.multitables.js",

	thisURL+"js/lexit.dataTables.extension.js",
	thisURL+"js/lexit.configurator.js",
	thisURL+"js/lexit.configfunctions_fn.js",
	thisURL+"js/lexit.configfunctions_fx.js",
	thisURL+"js/lexit.tableBuilder.js",
	thisURL+"js/lexit.undo.js",
	thisURL+"js/lexit.contextMenus.js"
];
		


// *********************************************************************************************************


// initialisation function

// we've got two possible loading modes: 
// - dynamic (using $.getScript) 
// - static (using <head><script .../>)  [DEFAULT]

lexit.init = function(sConfigFileName, bUseDynamicLoading, fnCallback){
		
	// start up!
	lexit._loadLibraries(bUseDynamicLoading, function(){
		lexit._initialize(sConfigFileName, fnCallback);
	});	
	
//	$.ajax({
//		"type": "GET",
//		"url": WEBSERV_URL+"/table/get_projects_overview",
//		"dataType": "script",
//		"data": {
//			"dummy": new Date().getTime()
//		},
//		"success": function(){			
//			lexit._initialize(fnCallback);
//		},
//		"error": function(jqxhr, settings, exception){
//			fn.message("Fout", "Het projectenoverzicht 'projects_overview.js' bestaat niet of het bevat fouten.<br><br>Fout: ["+exception+"]<BR><BR>");
//		}
//	});	
}



lexit._initialize = function(sConfigFileName, fnCallback){
	
	// Normally the http parameters hash is set by the Lex'it index.html file,
	// but we don't use that file now to allow import of the Lex'it API in other apps
	// and moreover we won't set http params here either,
	// so the hash need to be filled programmatically like this:
	paramsHash = new Hashtable();
	paramsHash.put("db", sConfigFileName);
	
	// override the Lex'it getHttpParams, which tries to read http parameters (which are not used in the Lex'it plugin)
	getHttpParams =  function(){	
		return paramsHash;
	};	

	// set neutral internal separator
	setInternalSeparator();	

	// set current user name
	fn.setCurrentUser();	
	
	// add DOM tree nodes needed for Lex'it cache
	$(document.body).append(
	'<div id="page">'+
	'	<div style="text-align:center;" id="projectname"></div>'+
	'	<div id="indicators">'+
	'		<div style="visibility: inline" id="indicator"></div>'+
	'		<div style="visibility: hidden" id="tablechoice"></div>'+
	'	</div>'+
	'	<div id="container">'+
	'		<div id="dynamic"></div>'+		// this is the table container
	'		<div id="temporary_stuff"></div>'+	// this is some container for temporary stuff
	'	</div>'+
	'</div>'+
	'<div id="page_id" style="visibility: hidden"></div>'
);
	
	// generate unique id for the page
	// we will need this to detect page focus/blur in a reliable way	
	var sPageId = new Date().getTime();
	$("#page_id").attr("name", sPageId);
	$.cookie('active_lexit_window', sPageId);
	sendActiveTabIdToService(sPageId);		
	
	// Assign key functions
	// This needs to be called here because it has global scope
	// and recalling it at each new table creation will alter other key functions 
	// which then malfunction (because of unbinds)
	kf.addKeyFunctions();			
	
	// load the specific client configuration file for the required database
	// and get the list of tables (getScript never reads this file from cache)
	$.ajax({
		"type": "GET",
		"url": WEBSERV_URL+"/table/get_configfile",
		"dataType": "script",
		"data": {
			"db_name": paramsHash.get("db"),
			"dummy": new Date().getTime()
		},
		"success": function(){
			
			ts.getListOfTables( paramsHash.get("table"), new Array(), new Array() );
			
			// prevent Chrome bug (sometimes pressing backslash causes navigating away)
			if (bowser.chrome)
				$(window).bind('beforeunload', function(){   
					return false;
				});
				
			setTimeout(function(){
				fnCallback();
			}, 200);
		},
		"error": function(jqxhr, settings, exception){
			fn.message("Fout", "Het configuratiebestand '<i>"+paramsHash.get("db")+"</i>' bestaat niet of het bevat fouten.<br><br>Fout: ["+exception+"]<BR><BR>");
		}
	});
};



// load libraries function
lexit._loadLibraries = function(bUseDynamicLoading, fnCallback, i){
	
	// can be set, if needed between load steps
	var iTimeout = 0;
	
	// first call...
	if (i == null) 
		i=0;
	
	// show progress
	var iLoaded = 100*(i / (lexit.aLibrariesList).length);
	var progressDiv = $("<div></div>")
		.attr("id", "lexitloadingbar")
		.css("margin", "auto")
		.css("width", "30%")
		.css("border", "3px solid grey")
		.css("padding", "10px")
		.append( "Loading Lex'it <progress value=\""+iLoaded+"\" max=\"100\"></progress>" );
	$("body").append(progressDiv);
	
	
	// process library at index 'i'
	if (lexit.aLibrariesList[i] != null) {	
		
		if (bUseDynamicLoading){
			
			// load library
			$.getScript(lexit.aLibrariesList[i])
			.done(function(){
				
				// goto next round			
				setTimeout(function(){
					$("#lexitloadingbar").remove();
					lexit._loadLibraries(bUseDynamicLoading, fnCallback, i+1);
				}, iTimeout);
				
			})
			.fail(function(jqXHR, textStatus, errorThrown){				
				alert("Lex'it libraries loading failed:<BR>"+textStatus+" "+errorThrown);
			});	
		}
		else {
			// load library
			$('head').append('<script type="text/javascript" language="javascript" src="'+lexit.aLibrariesList[i]+'"></script>');
			
			// goto next round
			setTimeout(function(){
				$("#lexitloadingbar").remove();
				lexit._loadLibraries(bUseDynamicLoading, fnCallback, i+1);
			}, iTimeout);
		}		
	}
	else {
		$("#lexitloadingbar").remove();
		fnCallback();
	}
};

	 
// get internal separator in use in webservice  
// and set the same separator in this client

function setInternalSeparator(){
	
	$.ajax({
		"async": false, 
		"type": "GET",
		"url": WEBSERV_URL+"/table/get_neutral_separator",
		"dataType": "xml",
		"data": {
			"dummy": new Date().getTime()
		},
		"success": function(xml){
			ARG_INTERNAL_SEPARATOR = fn.getDbResponse(xml);
		},
		"error": function(jqxhr, settings, exception){
			fn.message("Fout", "Het ophalen van de Interne separator string is mislukt.<br><br>Fout: ["+exception+"]");
		}
	});
}

// tell the webservice which tab is currently active
// in the current session
function sendActiveTabIdToService(sPageId){

	$.ajax({
		"async": false, 
		"type": "GET",
		"url": WEBSERV_URL+"/table/set_active_tab_id",
		"dataType": "xml", 
		"data": {
			"db_name": paramsHash.get("db"),
			"active_tab_id": sPageId,
			"dummy": new Date().getTime()
		},
		"success": function(xml){
			// nothing to do
		},
		"error": function(jqxhr, settings, exception){
			fn.message("Fout", "Het registeren van de active tab is mislukt.<br><br>Fout: ["+exception+"]");
		}
	});
}
