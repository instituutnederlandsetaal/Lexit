
var lexitinit = {};



/**
 * Compute operating mode
 * (admin, text, spy, reset_user_rights)
 */
lexitinit.computeOperatingMode = function(){
		
	// administrator mode		
	bAdmin = (paramsHash!=null && paramsHash.get("db")=='admin');

	// Are we in development (test) mode?
	// if so, we'll be loading the file from webcontent (with $.getScript)
	// if not, we'll be loading the file from the configuration directory (with ajax call to webservice, which is the normal mode)
	bTest = (paramsHash!=null && paramsHash.get("test")=='true');

	// are we getting a look into the active users list?
	bSpyMode = (paramsHash!=null && paramsHash.get("db")=='spy');

	// are we resetting the user rights?
	bResetUserRights = (paramsHash!=null && paramsHash.get("db")=='reset_user_rights');
};


/**
 * Start the lexit client in the right mode, depending 
 * on the computed operation mode (admin, text, spy, reset_user_rights)
 * and on the URL parameters (db, etc).
 */
lexitinit.startInRightMode = function(){
		
	
	// Load the welcome page of a project (if available)
	// or
	// Show a login dialog
	//
	// (NB: a welcome page is supposed to start the lexit login programmatically) 
	
	if (	// user tries to access a project other than the admin console
			!bAdmin && (paramsHash != null && paramsHash.get("db") != null) 
			&& 
			// and no user is logged in, or the user had proviously logged in as admin (which is the same, since that only allows access to admin console)
			(fn.getCurrentUser() == null || fn.getCurrentUser() == "null" || fn.getCurrentUser() == "admin")){
		
		// try to load a login page, if available / otherwise do normal login
		
		if (bTest) {
			
			$.ajax({
				"type": "GET",
				"url": paramsHash.get("db")+".welcome.js",
				"dataType": "text",
				"data": {
					"db_name": paramsHash.get("db"),
					"dummy": getUniqueNumber()
				},
				"success": function(response){						
					
					// do nothing, as the welcome page is supposed to start the lexit login programmatically						
					// get rid of default balk and title
					fn.setBalk(false);
					fn.setProjectTitle("");
					// execute the script manually
					$.globalEval(response);
				},
				"error": function(jqxhr, settings, exception){
					// if no welcome page is available, do normal login
					lexitlogin.startLexitLogin();
				}
			});
		}
		
		// normal mode (production)
		else {
			var url = WEBSERV_URL+"/api/get_welcome_page";
			
			$.ajax({
				"type": "GET",
				"url": url,
				"dataType": "text",
				"data": {
					"db_name": paramsHash.get("db"),
					"dummy": getUniqueNumber()
				},
				"success": function(response){						
					
					// if no welcome page available, do normal login
					if (response == 'NOT_AVAILABLE'){
						lexitlogin.startLexitLogin();
					}
					// otherwise do nothing, as the welcome page is supposed to start the lexit login programmatically
					else {												
						// get rid of default balk and title
						fn.setBalk(false);
						fn.setProjectTitle("");
						// execute the script manually
						$.globalEval(response);
					}
				},
				"error": function(jqxhr, settings, exception){
					// if no welcome page is available, do normal login
					lexitlogin.startLexitLogin();
				}
			});
		}
		
	}
	
	// admin mode (access to admin console only)
	
	else if (bAdmin) {
		
		fn.prompt("ADMIN LOGIN", ["Username", "Password"], ["admin::disabled", "::password"], 
				function(resp){
			
					// temporarily turn off the Chrome fix
					// this is needed to allow reloading, without triggering a dialog in Chrome preventing it!
					$(window).off('beforeunload'); 
			
					$.ajax({
						"type": "POST",
						"url": WEBSERV_URL+"/api/login",
						"data": {
							"username": "admin",
							"password": resp["Password"],
							"dummy": getUniqueNumber()
						},
						"dataType": "xml", // get response as xml
						"success": function(xml) {
							
							var sResp = fn.getDbResponse(xml);
					 		if (sResp == 'Access denied'){
					 			fn.closeDialog();
					 			fn.message(sResp, sResp, function(){
					 				lexitinit.lexitReload();
					 			});
					 		}
					 		else {						 			
					 			lexitusers.updateOverviewOfUsersAndRoles( function(){lexitusers.showMenu();} );						 																	 		
					 		}
					 	},
						"error": function(jqXHR, textStatus, errorThrown){
							fn.message(lang.error, lang.failed+": " +	textStatus+" "+errorThrown);
						}
					});
					
					
			
				},
				function(){
					lexitinit.lexitReload();
				}
		);
		
		// set focus
		setTimeout(	function(){	
			fn._activeEnterForThisDialog( $("div[id^='dialog-message']").attr("id") );
		}, 100);
	}


	// global spy mode (logging info)
	
	else if (bSpyMode) {
		
		lexitspy.buildUsersSpy();
		
		lexitspy.buildConnectionsSpy();

		// Make the container around the user and connections table flexy
		$("#dynamic").addClass("spy")
	}


	// reset user rights
	
	else if (bResetUserRights){
		var url = WEBSERV_URL+"/api/reset_user_rights";
		
		$.ajax({
			"type": "POST",
			"url": url,
			"data": {
				"dummy": getUniqueNumber()
			},
			"dataType": "xml", // get response as xml
			"success": function(xml) {
				var sResp = fn.getDbResponse(xml);
				fn.message(lang.reset, lang.response+ ": " + sResp);
			},
			"error": function(jqXHR, textStatus, errorThrown){
				fn.message(lang.error, lang.failed+": " +	textStatus+" "+errorThrown);
			}
		});
	}
	
	

	// last case: 
	// if 'db' parameter is NOT set, show the list of project
	// but if 'db' parameter is set, open that project
	
	// in test mode (development)
	
	else if (bTest) {
		$.getScript("projects_overview.js")
			.done(function(){

				// The ajax call gets the list of declared projects out of the projects overview file.
				// As a second step, we call a function which generates a list of all projects, as some might not have been declared.
				// In the end, this function will call initialize();
				lexitmenu.startProjectOrGetConfigFilesList( function(){lexitinit.initialize();} );

			})
			.fail(function(jqxhr, settings, exception){
				
				// the 'projects_overview.js' is missing
				// try to get the list of config files directly from server
				lexitmenu.getProjectOverviewFromWebservice( function(){lexitinit.initialize();} );
			});
	}

	// in normal mode (production)
	
	else {
		var url = WEBSERV_URL+"/api/get_projects_overview";

		$.ajax({
			"type": "GET",
			"url": url,
			"dataType": "script",
			"data": {
				"dummy": getUniqueNumber()
			},
			"success": function(){
				
				// The ajax call gets the list of declared projects out of the projects overview file.
				// As a second step, we call a function which generates a list of all projects, as some might not have been declared.
				// In the end, this function will call initialize();
				lexitmenu.startProjectOrGetConfigFilesList( function(){lexitinit.initialize();} );

			},
			"error": function(jqxhr, settings, exception){
				
				// the 'projects_overview.js' is missing
				// try to get the list of config files directly from server
				lexitmenu.getProjectOverviewFromWebservice( function(){lexitinit.initialize();} );
			}

		});

	}
};




/**
 * Initialize the application.
 * This happens once the libraries are fully loaded and we have a list of all projects 
 * ( which is why this function will be called by lexitmenu.startProjectOrGetConfigFilesList() )
 */
lexitinit.initialize = function(){	
		
	// generate unique id for this page
	// we will need this to detect page focus/blur in a reliable way
	var sPageId = getUniqueNumber();
	$("#page_id").attr("name", sPageId);
	$.cookie('active_lexit_window', sPageId);
	lexitinit.sendActiveTabIdToService(sPageId);
	
	// user instruction for accessing tables
	$("#indicator").empty().append(
			$("<span></span>")
			.html(lang.choose_a_table)
			);
	
	// get url parameters		
	if (paramsHash == null || paramsHash.get("db") == null) {
		
		// No project selected: show list of projects
		lexitmenu.showListOfProjects();
	}
	else {			
		// Normal case: start opening project
		
		// get rid of default huisstijl balk and title 
		fn.setBalk(false);
		fn.setProjectTitle("");
	
		// Assign key functions
		// This needs to be called here because it has global scope
		// and recalling it at each new table creation will alter other key functions 
		// which then malfunction (because of unbinds)
		kf.addKeyFunctions();
		
		
		// load the specific client configuration file for the required database
		// and get the list of tables (getScript never reads this file from cache)
		
		
		// test mode (development)
		if (bTest) {
			$.getScript(paramsHash.get("db")+".config.js")
			.done(function(){
				
				var oFiltersAndSettings = lexitinit.getTableFiltersAndSettings(paramsHash);
				ts.getListOfTables( paramsHash.get("table"), 
						oFiltersAndSettings.contentToMatch , oFiltersAndSettings.extraSettings  );
				
				// prevent Chrome bug (sometimes pressing backslash causes navigating away)
				if (bowser.chrome)
					$(window).bind('beforeunload', function(){   
						return false;
					});
			})
			.fail(function(jqxhr, settings, exception){
				
				fn.message(lang.error, lang.opening_config_file_failed+ "<br><br>" +lang.error+ ": ["+exception+"]<BR><BR>");
				throw new Error("Execution stopped: "+lang.opening_config_file_failed);
			});
		}
		
		// normal mode (production)
		else {
			var url = WEBSERV_URL+"/api/get_configfile";
			
			$.ajax({
				"type": "GET",
				"url": url,
				"dataType": "script",
				"data": {
					"db_name": paramsHash.get("db"),
					"dummy": getUniqueNumber()
				},
				"success": function(){
					
					var oFiltersAndSettings = lexitinit.getTableFiltersAndSettings(paramsHash);
					ts.getListOfTables( paramsHash.get("table"), 
							oFiltersAndSettings.contentToMatch , oFiltersAndSettings.extraSettings );
					
					// prevent Chrome bug (sometimes pressing backslash causes navigating away)
					if (bowser.chrome)
						$(window).bind('beforeunload', function(){   
							return false;
						});
				},
				"error": function(jqxhr, settings, exception){
					
					fn.message(lang.error, lang.opening_config_file_failed+ "<br><br>" +lang.error+ ": ["+exception+"]<BR><BR>");
					throw new Error("Execution stopped: "+lang.opening_config_file_failed);
				}
			});
		}
		
		
		
		// show message or warning for this project, if available
		
		var oProjectObject = lexitmenu.getProjectObject(paramsHash.get("db"));

		// set a default project name for display on screen (and set front character in uppercase)
		// this default name might be overwritten by configuration in projects_overview.js, if some project 'name' was set there
		var sProjectName = paramsHash.get("db").substring(0,1).toUpperCase()+paramsHash.get("db").substring(1);

		if (typeof oProjectObject != 'undefined') {
			
			// message
			if (typeof oProjectObject["message"] != 'undefined') {
				var sWarning = oProjectObject["message"];
				var bPrivate = (typeof oProjectObject["private"] != 'undefined') ?
					oProjectObject["private"] : false; // default is 'false'
				var fnMsgCallback = (typeof oProjectObject["message_callback"] != 'undefined') ?
							oProjectObject["message_callback"] : null;
					 
				// show warning message if available
				if (	sWarning != '' &&   
						// except if it should be kept private to home
						!(bPrivate && (document.URL).regexIndexOf( INL_HOMEURL )<0 ) 
					){
					fn.message(paramsHash.get("db"), sWarning, fnMsgCallback);
					console.log("warning for project '"+paramsHash.get("db")+"': "+sWarning);
					}
			}
			
			// redirect to other URL (rare, but it has been required in the past)
			if (typeof oProjectObject["redirect"] != 'undefined') {
				window.location.href = oProjectObject["redirect"];
			}

			// is some project name was set, overwrite the default one
			if (typeof oProjectObject["name"] != 'undefined') {
				sProjectName = oProjectObject["name"];
			}
		}


		// show the project name at the top of the screen
		fn.setProjectTitle(sProjectName);
		
		// if the public reader has logged in, keep it alive
		lexitusers.keepPublicReaderAlive();
		
		// statistics
		lexutil.setStatistics();
	}
	
};



/** 
 * Reload the app programmatically * 
 */
lexitinit.lexitReload = function(){
	// temporarily turn off the Chrome fix (= prevent pageback upon pressing the backspace key)
	// this is needed here to allow reloading, without triggering a dialog in Chrome preventing it!
	$(window).off('beforeunload');
	location.reload();
}


	

/**
 * Get internal separator in use in the webservice
 * and set the same separator in the client.
 * 
 * This allows the client to parse responses from
 * the webservice in a reliable way, even if the separator 
 * was changed in the webservice configuration file (resources.Constants.java)
 */
lexitinit.setInternalSeparator = function(fnCallback){
		
	var url = WEBSERV_URL+"/api/get_neutral_separator";
	
	$.ajax({
		"async": false, // needed to block code execution while awaiting the server response
		"type": "GET",
		"url": url,
		"dataType": "xml", // get response as xml
		"data": {
			"dummy": getUniqueNumber()
		},
		"success": function(xml){
			ARG_INTERNAL_SEPARATOR = fn.getDbResponse(xml);

			fnCallback();
		},
		"error": function(jqxhr, settings, exception){

			fn.message(lang.error, "<B>"+lang.some_error_has_occurred +"</B>" +"<br>" +
					"<br>"+
					"HTTP status code: "+ jqxhr.status +"<br>"+
					"Status text of the response: "+ jqxhr.statusText +"<br>"+
					"<br>"+
					"<B>"+lang.check_the_console+"</B>");
			
			console.log("jqxhr:", jqxhr);
			console.log("HTTP headers: ", jqxhr.getAllResponseHeaders());					
			console.log("Raw response: ", jqxhr.responseText);							}
	});
}




/**
 * Tell the webservice which tab is currently active in the current session.
 * (this function is called whenever the tab gets focus)
 * NB: when a session is inactive for too long, this function will get a 'Permission denied' response from the webservice,
 *     which will trigger an exception to force the user to log in again.
 * 
 * @param sPageId the id of the page which is currently active in the current session
 */
lexitinit.sendActiveTabIdToService = function(sPageId){
		
	if (	USERNAME == 'null' // this happens when the fn.setCurrentUser() function returned null username (as a string indeed)
			|| 
			paramsHash == null || paramsHash.get("db") == null || paramsHash.get("db") == 'spy'
		)
		return;

	var url = WEBSERV_URL+"/api/set_active_tab_id";

	$.ajax({
		"async": false, // needed to block code execution while awaiting the server response
		"type": "POST",
		"url": url,
		"dataType": "xml", // get response as xml
		"data": {
			"db_name": paramsHash.get("db"),
			"active_tab_id": sPageId,
			"dummy": getUniqueNumber()
		},
		"success": function(xml){
			// nothing to do
		},
		"error": function(jqxhr, settings, exception){
			
			// connection failed
			if (jqxhr.responseText.indexOf("Connection failed")>=0){
				
				// use timeout to allow all error messages to be shown:
				// we will then close all dialogs
				// and given one single USEFUL message to the user
				
				setTimeout(function(){
					
					fn.closeDialog();
					fn.message(lang.error, "<B>" + jqxhr.responseText + "</B>",
						function () {
							lexitinit.lexitReload();
						}
					);
					
				}, 1000);
				
			} 
			
			// if the database configuration file is missing
			else if (jqxhr.responseText.indexOf("Error while reading") >= 0 && jqxhr.responseText.indexOf(".database") >= 0) {
				
				// use timeout to allow all error messages to be shown:
				// we will then close all dialogs
				// and given one single USEFUL message to the user
				
				setTimeout(function(){
					
					fn.closeDialog();
					fn.message(lang.error, (lang.error_database_configfile_missing).replace(/FILENAME/g, paramsHash.get("db")),
						function () {
							lexitinit.lexitReload();
						}
					);
				}, 1000);
			}
			
			// if the user has logged into another account in another tab, this will cause the current tab to misbehave
			// so we throw an exception, which will trigger the user to log in again
			else if (jqxhr.responseText != "Permission denied to "+fn.getCurrentUser()){
				throw new Error("Execution stopped: "+lang.saving_active_tab_failed); // prevents infinite loop of page-reload!
			}
			
			// otherwise, an error in this function indicates a problem with the webservice
			// we we must tell the user about the error before reloading the page
			else {						
				fn.closeDialog();
				fn.message(lang.error, lang.saving_active_tab_failed+ "<br><br>" +jqxhr.responseText+ ": ["+exception+"]",
					function () {
						lexitinit.lexitReload();
					}
				);					
			}				 
		}
	});
};


	
	
	
/**
 * Get the table filters from URL if available (... &filter_a=... & filter_b=...)
 * @param paramsHash the URL parameters, as a hash
 */
lexitinit.getTableFiltersAndSettings = function(paramsHash){
		
	var oContentToMatch = new Array();
	var oExtraSettings = new Array();
	for (var i=0; i<paramsHash.keys().length; i++) {
		var sOneParam = paramsHash.keys()[i];
		// read all parameters, except 'db' and 'table', since we process those elsewhere
		if ( $.inArray(sOneParam, ["db", "table"])<0 ) {
			// table setting parameters
			if ($.startsWith(sOneParam, "setting.")) {
				var sTrueSettingName = sOneParam.replace("setting.", "");
				oExtraSettings[sTrueSettingName] = paramsHash.get(sOneParam);					
			}
			// table filters
			else {
				oContentToMatch[sOneParam] = paramsHash.get(sOneParam);
			}				
		}
	}
	
	return { 
		contentToMatch: oContentToMatch,
		extraSettings: oExtraSettings
	};
}