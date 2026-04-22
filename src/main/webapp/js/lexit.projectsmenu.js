
var lexitmenu = {};


	
/**
 * Generate a welcome page with a project overview
 */
lexitmenu.showListOfProjects = function(){
		
	var sCurrentURL = document.URL;
	
	// keep this list private to internal environment
	if ( sCurrentURL.regexIndexOf( INL_HOMEURL )>-1 || bTest) {

        // Don't display table selector.
		$("#indicator").empty();
		
        const productionSection = $(`<section id="production"><h2>${lang.production}</h2></section>`);
        const productionTable = $("<table></table>");
        productionSection.append(productionTable);

        const goodiesSection = $(`<section id="goodies"><h2>${lang.goodies}</h2></section>`);
        const goodiesTable = $("<table></table>");
        goodiesSection.append(goodiesTable);

        const developmentSection = $(`<section id="development"><h2>${lang.in_development}</h2></section>`);
        const developmentTable = $("<table></table>");
        developmentSection.append(developmentTable);

        const closedSection = $(`<section id="closed"><h2>${lang.project_closed}</h2></section>`);
        const closedTable = $("<table></table>");
        closedSection.append(closedTable);

        const unknownSection = $(`<section id="unknown"><h2>${lang.project_unknown}</h2></section>`);
        const unknownTable = $("<table></table>");
        unknownSection.append(unknownTable);
		
		// process list of all config files
		var aKnownConfigFilesList = new Array();
		
		// get list of known projects in projects overview
		for (var i=0; i<aProjectList.length; i++) {
			aKnownConfigFilesList.push(aProjectList[i]["config_filename"]);				
		}
		
		// now, if some configfile is no part of the projects overview list, 
		// it will be added to it as part of the 'unknown projects' category
		// (so it will appear as such in the menu)
		for (var i=0; i<aFullConfigFilesList.length; i++) {

			var sOneConfigFile = aFullConfigFilesList[i];
			
			// if server return some description/message, set it

			var aOneConfigFile = sOneConfigFile.split(":::");
			var sOneDescription = lang.unknown;	// default: 'unknown'
			if (aOneConfigFile.length>1){
				sOneConfigFile  = aOneConfigFile[0];
				sOneDescription = aOneConfigFile[1];
			}

			// add unknown project

			if (aKnownConfigFilesList.indexOf(sOneConfigFile) < 0) {
				aProjectList.push({
					"name": sOneConfigFile,
					"config_filename": sOneConfigFile,
					"description": sOneDescription,
					"unknown": true
			 	});
			}
		}
		
		
		// build menu now!
		for (var i=0; i<aProjectList.length; i++){

			// set project name to be rendered and a project link to be clicked upon

			var sProjectLinkPart = aProjectList[i]["config_filename"];
			var sProjectLink = sCurrentURL.substring(0, sCurrentURL.indexOf("/lexit2"))+"/lexit2/?db="+sProjectLinkPart+( sCurrentURL.indexOf("test=true")>-1 ? "&test=true":"")+
				( sCurrentURL.indexOf("lang=")>-1 ? "&lang="+sCurrentURL.substring(sCurrentURL.indexOf("lang=")+"lang=".length, sCurrentURL.indexOf("lang=")+"lang=".length+2):"");
			var sProjectName = (typeof aProjectList[i]["name"] != 'undefined' ? aProjectList[i]["name"] : sProjectLinkPart);

            const sProjectTitleCell = `<td><a href="${sProjectLink}">${sProjectName}</a></td>`
            let sProjectInfoCell = `<td><a title="${sProjectName}" onclick="lexitmenu.showDatabaseInfo('${sProjectLinkPart}');"><span class='ui-icon ui-icon-info'></span></a>`;
            // no project info for goodies
            if (aProjectList[i]["goody"] !== undefined) {
                sProjectInfoCell = "<td></td>"
            }
            const sProjectDescriptionCell = `<td>${aProjectList[i]["description"]}</td>`
			
			const eProjectDiv = $("<tr></tr>").html(sProjectTitleCell + sProjectInfoCell + sProjectDescriptionCell);
			
			// Put the project in the right category:
			
			if (typeof aProjectList[i]["goody"] != 'undefined' && aProjectList[i]["goody"]) {
				goodiesTable.append(eProjectDiv)
			}
				
			// project is closed
			else if (typeof aProjectList[i]["closed"] != 'undefined' && aProjectList[i]["closed"]) {
				closedTable.append(eProjectDiv)
			}
			
			// project is unknown
			else if (typeof aProjectList[i]["unknown"] != 'undefined' && aProjectList[i]["unknown"]) {
				unknownTable.append(eProjectDiv);
			}
			
			// project is open
			else {
				// production
				if (typeof aProjectList[i]["production"] != 'undefined' && aProjectList[i]["production"])
					productionTable.append(eProjectDiv);
				// development
				else
					developmentTable.append(eProjectDiv);
			}
		}
		
		// add each table
		$("#page")
			.append(productionSection)
			.append(goodiesSection)
            .append(developmentSection)
            .append(closedSection)
            .append(unknownSection);
		
	}
	else {
		
		fn.message(lang.error, lang.access_denied);
	}
	
};



	
/**
 * Get full list of projects config files from server.
 * 
 * This function is called when the projects_overview.js file was found and the list of declared projects was read out of it.
 * This function then calls the webservice to generate a list of all projects, as some might not have been declared.
 * The resulting projects list will lack descriptions here and there (for the projects which are not declared in projects_overview.js), 
 * but at least all the projects will be shown and will be clickable!
 * 
 * @param fnInitCallback the function to be called once the list of config files is retrieved and ready to be used
 * @see lexitmenu.getProjectOverviewFromWebservice
 */
lexitmenu.startProjectOrGetConfigFilesList = function(fnInitCallback){

	// if some project was selected already, 
	// no need to retrieve the list of config files from the SERVER, 
	// initialize straight away!
	
	if (paramsHash!=null &&	paramsHash.get("db")!=null){
		fnInitCallback();
	}
	else {
		
		// within this function, the aProjectList variable is supposed to be filled already
		// so if it isn't, something is wrong
		if (aProjectList == null || aProjectList.length == 0){	
			
			fn.message(lang.error, lang.loading_projects_list_failed);
			return;
		}
			

		// this might take a while, so put spinner
		lexutil.showSpinner("#dynamic", true);
		
		var url = WEBSERV_URL+"/api/get_configfiles_list";
		
		$.ajax({
			"type": "GET",
			"url": url,
			"dataType": "xml", // get response as xml
			"data": {
				"dummy": getUniqueNumber()
			},
			"success": function(xml){
				
				var sList = fn.getDbResponse(xml);
				aFullConfigFilesList = sList.split(ARG_INTERNAL_SEPARATOR);

				// remove spinner
				lexutil.removeSpinner("#dynamic");
				
				// go!
				fnInitCallback();
			},
			"error": function(jqxhr, settings, exception){
				
				fn.message(lang.error, lang.reading_the_list_of_config_files_failed+ "<br><br>" +lang.error+ ": ["+exception+"]");
			}
		});

	}

};
	
	

/**
 * Get the full project overview from webservice  (alternative to the projects_overview.js file)
 * 
 * This function is called when the projects_overview.js file was NOT found, so the project overview list has not been filled yet.
 * In such a case, we expect the list of projects to have been declared in the Admin part of the Lex'it app. 
 * So, this function calls the webservice to generate a list of all projects, with their descriptions, status, etc.
 * 
 * @param fnInitCallback the function to be called once the project overview is retrieved and ready to be used
 * @see lexitmenu.startProjectOrGetConfigFilesList
 */
lexitmenu.getProjectOverviewFromWebservice = function(fnInitCallback){
		
	lexutil.showSpinner("#dynamic", true);
	
	var url = WEBSERV_URL+"/api/get_list_of_existing_projects";
	
	$.ajax({
		"type": "GET",
		"url": url,
		"dataType": "xml", // get response as xml
		"data": {
			"fullinfo": true,
			"dummy": getUniqueNumber()
		},
		"success": function(xml){
			
			var sList = fn.getDbResponse(xml);
			aProjectInfo = sList.split(ARG_INTERNAL_SEPARATOR);
			
			// build project overview list
			aProjectList = [];					
			for (var i=0; i<aProjectInfo.length; i++){
				
				// [0] projectname (=configfile name), [1] name (=human readable name), [2] description, [3] status, [4] order_in_menu, [5] message, [6] redirect
				var aOneProjectInfo = aProjectInfo[i].split(":::");
									
				var oProject = {};
				oProject["config_filename"] = aOneProjectInfo[0];
				oProject["name"] = ( aOneProjectInfo[1] != '' ? aOneProjectInfo[1] : aOneProjectInfo[0]);
				oProject["description"] = aOneProjectInfo[2];
				
				if (aOneProjectInfo[5] != null && aOneProjectInfo[5] != ''){
					oProject["message"] = aOneProjectInfo[5];
				}
				if (aOneProjectInfo[6] != null && aOneProjectInfo[6] != ''){
					oProject["redirect"] = aOneProjectInfo[6];
				}
				
				var sStatus = aOneProjectInfo[3];
				if ($.inArray(sStatus, ['production', 'closed', 'goody', 'unknown']) > -1) {
					oProject[sStatus] = true; 
				}						
				
				// add to list
				aProjectList.push(oProject);
				
			}

			// remove spinner
			lexutil.removeSpinner("#dynamic");
			
			// go!
			fnInitCallback();
		},
		"error": function(jqxhr, settings, exception){
			
			fn.message(lang.error, lang.getting_projectslist_from_service_failed+ "<br><br>" +lang.error+ ": ["+exception+"]");
		}
	});

};



/**
 * Retrieve all the properties belonging to the description of a project
 * from the list of projects (aProjectList) and return them as an object.
 * 
 * @param sDbName the name of the project (= config file name without extension)
 */
lexitmenu.getProjectObject = function(sDbName){
		
	var oObjectToReturn;
	
	for (var i=0; i<aProjectList.length; i++) {
		if (aProjectList[i]["config_filename"] != sDbName) {
			continue;
		}
		else {
			oObjectToReturn = new lexutil.cloneObject(aProjectList[i]);
			break;
		}
	}
	return oObjectToReturn;
}


/**
 * Get technical database info and show it in a pop-up
 * (this called upon clicking the info icon next to the project name in the projects overview page)
 */ 
lexitmenu.showDatabaseInfo = function(sDbName){
		
	var url = WEBSERV_URL+"/api/get_dbinfo";
	
	$.ajax({
		"type": "GET",
		"url": url,
		"data": {
			"db": sDbName,
			"dummy": getUniqueNumber()
		},
		"dataType": "xml", // get response as xml
		"success": function(xml) {
			var sResp = fn.getDbResponse(xml);
	 		fn.message(lang.database_info, sResp);
	 	},
		"error": function(jqXHR, textStatus, errorThrown){
			
			fn.message(lang.error, "'"+sDbName+"' " +lang.file_is_missing+ ": " + textStatus+" "+errorThrown);
		}
	});
	
}