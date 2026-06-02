
var menus = {};


// ---------------------------------------
// +    Change this to true             +
// +    if the home environment must    +
// +    behave like production          +
// +                                    +
// ---------------------------------------
//
menus.productionSimulation = true; 

// default host for BlackLab
// (this might be set deferently as soon as the 22 endpoint was called)
menus.defaultHost = `${window.location.origin}/lancelot/blacklab-server/`;

// location of the PDF of the manual
menus.manualLocation = (document.URL.indexOf("localhost")<0 ? "../lexit2_config/lancelot/" : "") + sAppManualFileName;

// debug
menus.debugParams = false;

// fixed window size
menus.winsize = [600, 550];

// are we home?
menus.home = ( (document.URL).regexIndexOf( INL_HOMEURL )>=0 && (!menus.productionSimulation) );

// container for tagset to send to CobaltServe etc
menus.aTagSetToUpload = [];
menus.aTagSetName;
menus.aProjectsList = [];
menus.aProjectsListUserFriendly = [];
menus.aAllProjectsListInDatabase = [];

menus.aForbiddenTagSetToUpload = [];

// list of roles per project for current user
menus.aUserRoles = {};


// corpus name field ID depends on running mode (home or not)
menus.prompt_corpusname_id = (menus.home ? "prompt_corpusname" : "prompt_yourcorpora");


menus.reloadApplication = function(){

	// temporarily turn off the Chrome fix (see index.html)
	// this is needed to allow a redirect to a project, without triggering a dialog in Chrome preventing it!
	$(window).off('beforeunload');

	window.location.replace(uLexitInstanceUrl + "?db=" + getHttpParams().get("db") + ( bTestMode ? "&test=true":""));	
}



// ***************************************************************************
// **
// ** BUILD MAIN MENU
// **
// ***************************************************************************


menus.manualText = '<div><embed src="'+menus.manualLocation+'" width="'+0.9*document.documentElement.clientWidth+'px" height="'+0.7*document.documentElement.clientHeight+'px" /></div>';

menus.helpText = 
	"Welcome to LAnCeLoT, an online tool (service) to manually verify and correct<BR>"+
	"corpora that are linguistically annotated with part of speech and lemma. <BR>"+
	"Lancelot is meant to help you clean the linguistic annotations of your corpus,<BR>"+
	"hence the name Linguistic Annotation Corpus Laundry Tool. <BR>"+
	"LAnCeLoT offers both an environment to query your corpus (LAnCeLoT Search)<BR>"+
	"and a place to inspect and correct the annotations. To use LAnCeLoT, <BR>"+
	"you have to start a project. "+
	"<BR><BR>"+
	"LAnCeLoT was designed in combination with GaLAHaD (Generating Linguistic<BR>"+
	"Annotations for Historical Dutch), an environment where you can linguistically<BR>"+
	"annotate diachronic corpus material and evaluate the linguistic annotations. There<BR>"+
	"are several tagger/lemmatizers to choose from, and your corpus can be<BR>"+
	"exported in several formats."+
	"<BR><BR>"+
	"For now, LAnCeLoT handles TEI encoded documents only, the format of which is<BR>"+
	"described here. If you use GaLAHaD for the linguistic annotation of your <BR>"+
	"corpus, simply choose TEI as export format. For people who want to run LAnCeLoT<BR>"+
	"on their own systems, the open source code will be made available on GitHub."+
	"<BR><BR>";
	
menus.aboutText = 
	"LAnCeLoT is created by the <i><a href='https://ivdnt.org/' target='_BLANK'>Dutch Language Institute</a></i>.<BR>"+
	"For this work, funding was received from NWO (Clariah Plus project 184.034.023).<BR>"+
	"<BR>" +
	"<BR>" +
	"<IMG src='images/INT-logo-3regel.png' style='height:110px'><IMG src='"+(document.URL.indexOf("localhost")<0 ? "../lexit2_config/lancelot/" : "")+"clariah.png' style='height:60px; padding-bottom: 20px;'>"+
	"<BR>" +
	"<BR>" +
	"<h2>Version "+ sAppVersion +"</h2>";
	
menus.showHelp = function(fnCallback){
	menus.message(sAppName, menus.helpText, fnCallback);
};

menus.showManual = function(fnCallback){
	menus.message(sAppName+" manual", menus.manualText, fnCallback, true);
	setTimeout(function(){
		$(".ui-dialog-titlebar-close").show()
			.click(function(){
				$(".ui-dialog-titlebar-close").hide();
			});;
		$("div[id^='dialog-message']:visible:last")
			.closest(".ui-dialog")
			.css("top", "100px");
		
			
	}, 100);
};


menus.showAbout = function(fnCallback){
	menus.message("About "+sAppName, menus.aboutText, fnCallback);
	setTimeout(function(){
		$("#dialog_accept_button").focus();
	}, 100);
};




/**
 * Get the URL of Blacklab to be used by default
 */
menus.getBlacklabUrlFromConfig = function(){
	
	
	$.ajax( {
		"type": "GET",
		"url": uCobaltInstanceUrl + "webservice/api/get_blacklab_url/",
		"data": {
			"username": fn.getCurrentUser()
		},
		"success": function(xml) {
			
			var resp = $(xml).find("response").text();
			
			// set the value only if it is not empty (that way, we can still use the JS default value, which might be useful in home mode etc.)
			if (resp != "" && resp != null){
				menus.defaultHost = resp + ( (resp.endsWith("/")||resp.endsWith("\\")) ? "" : "/"); // ensure that the URL ends with a slash 
			}			

		},
		"error": function(jqXHR, textStatus, errorThrown){
			
			menus.message("Error", "Something went wrong when reading the BlackLab URL from the configuration: "+textStatus+" "+errorThrown, 
				function(){
					menus.reloadApplication();
				} );
		}
	
	} );

};




/**
 * Build the start screen
 */
menus.buildStartScreen = function(){
	
	// reset
	menus.aUserRoles = {};

	// get the roles per project (so as to be able to determine right of user per project)
	$.ajax( {
		"type": "GET",
		"url": uCobaltInstanceUrl + "webservice/api/get_list_of_projects_for_user/",
		"data": {
			"username": fn.getCurrentUser()
		},
		"success": function(xml) {
			
			var aProjList = $(xml).find("response").text().split("|");
			for (var i=0; i<aProjList.length; i++){
			    var aOneProj = (aProjList[i]).split(":::");
				menus.aProjectsList.push( aOneProj[0] );	
				menus.aProjectsListUserFriendly.push( aOneProj[1] );
			};	
			
			$.ajax( {
				"type": "GET",
				"url": uCobaltInstanceUrl + "webservice/api/get_users_all_roles",
				"data": {
					"username": fn.getCurrentUser(),
					"dummy": getUniqueNumber()
					},
				"dataType": "xml", // get response as xml
				"success": function(xml) {
					
					// set the current user's role
					var asUserRoles = $(xml).find("response").text().split("|");
					for (var i=0; i<asUserRoles.length; i++){
						var oneProject = asUserRoles[i].split(":::")[0];
						var oneRole = asUserRoles[i].split(":::")[1];
						menus.aUserRoles[oneProject] = oneRole;
					}		
					
					//console.log(menus.aProjectsList);
					//console.log(menus.aProjectsListUserFriendly);
					
					// ready to build the screen
					menus.buildStartPrompt();
					
				},
				"error": function(jqXHR, textStatus, errorThrown){
		
					menus.message("Error", "Getting the user's role went wrong!", 
						function(){
							menus.reloadApplication();
						});
				}
			} );

			

		},
		"error": function(jqXHR, textStatus, errorThrown){
			
			menus.message("Error", "Something went wrong when building the start screen: "+textStatus+" "+errorThrown, 
					function(){
						menus.reloadApplication();
					} );
		}
	
	} );

};


menus.buildStartPrompt = function(){

	
	var aProjectsList = menus.aProjectsList;
	var aProjectsListUserFriendly = menus.aProjectsListUserFriendly;

	// temporarily turn off the Chrome fix (see index.html)
	// this is needed to allow a redirect to a project, without triggering a dialog in Chrome preventing it!
	$(window).off('beforeunload');


	var sHtml = (aProjectsList.length == 1 && (aProjectsList[0] == "" || aProjectsList[i] == null)) ? "" : "Choose a project to work with:<BR><BR>";

	sHtml += "<DIV style='height: "+($(window).height()*.5)+"px; overflow-y: auto'>";

	sHtml += "<DIV style='display: table-cell; vertical-align: top; margin-left: 25px;'>";
	sHtml += "<TABLE style='min-width: 450px;'>";

	for (var i=0; i<aProjectsList.length; i++){
		
		if (aProjectsList[i] == "" || aProjectsList[i] == null)
		    continue;

		sHtml += "<TR>";
		
		sHtml += "<TD>";
		sHtml += "<button type='button' style='min-width: 200px; width: 300px; color:"+sCobaltWhite+"' class='cobaltbutton cobaltgreen' "+
				"onclick='menus.startProjectFromMenu(\"" + aProjectsList[i] + "\");'><B>" + aProjectsListUserFriendly[i] + "</B></button>";
		sHtml += "</TD>";
		
		sHtml += "<TD>&nbsp;</TD>";

		//sHtml += "<TD>";
		//sHtml += "<button type='button' style='border: 0; padding: 4px; padding-right: 10px; color:"+sCobaltWhite+"' class='cobaltbutton cobaltlightblue' "+
				"><span class=\"ui-icon ui-icon-plusthick\"></span>Contribute</button>";
		//sHtml += "</TD>";

		//sHtml += "<TD>&nbsp;</TD>";
		
		// export function is only for owners
		
		if (menus.aUserRoles[aProjectsList[i]] != sViewerRole){
		
			sHtml += "<TD>";
			sHtml += "<button type='button' style='border: 0; padding: 4px; padding-right: 10px; color:"+sCobaltWhite+"' class='cobaltbutton cobaltorange' "+
					"onclick='menus.exportProjectFromMenu(\"" + aProjectsList[i] + "\");'><span class=\"ui-icon ui-icon-circle-arrow-e\"></span>Export</button>";
			sHtml += "</TD>";
	
			sHtml += "<TD>&nbsp;</TD>";
		}

		// delete function is only for owners
		
		if (menus.aUserRoles[aProjectsList[i]] == sOwnerRole){
			sHtml += "<TD>";
			sHtml += "<button type='button' style='border: 0; padding: 4px; padding-right: 10px; color:"+sCobaltWhite+"' class='cobaltbutton cobaltred' "+
					"onclick='menus.deleteProjectFromMenu(\"" + aProjectsList[i] + "\");'><span class=\"ui-icon ui-icon-closethick\"></span>Delete</button>";
			sHtml += "</TD>";
			
			sHtml += "<TD>&nbsp;</TD>";
		}

		// users management function is only for owners
		
		if (menus.aUserRoles[aProjectsList[i]] == sOwnerRole){
			sHtml += "<TD>";
			sHtml += "<button type='button' style='border: 0; padding: 4px; padding-right: 10px; color:"+sCobaltWhite+"' class='cobaltbutton cobaltdarkblue' "+
					"onclick='users.projectsUsersPrompt(\"" + aProjectsList[i] + "\");'><span class=\"ui-icon ui-icon-info\"></span>Contributors</button>";
			sHtml += "</TD>";
	
			sHtml += "<TD>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</TD>";
		}

		sHtml += "</TR>";

		if ((i+1) % 15 ==0){
			sHtml += "</TABLE></DIV>";
			sHtml += "<DIV style='display: table-cell; vertical-align: top; margin-left: 25px;'><TABLE>";
		}
	}

	sHtml += "<TR>"
	sHtml += "<TD></TD>";
	sHtml += "<TD>&nbsp;</TD>";
	sHtml += "<TD></TD>";
	sHtml += "</TR>";

	sHtml += "<TR>"
	sHtml += "<TD>";
	sHtml += "<button type='button' style='width: 200px; padding: 15px;' onclick='menus.setupProjectFromMenu();'><span class=\"ui-icon ui-icon-wrench\"></span>Set up a new project</button>";
	sHtml += "</TD>";
	sHtml += "<TD>&nbsp;</TD>";
	sHtml += "<TD></TD>";
	sHtml += "</TR>";
	
	sHtml += "</TABLE>";
	sHtml += "</DIV>";
	sHtml += "</DIV>";

	// nice trick: https://stackoverflow.com/questions/1202079/prevent-jquery-ui-dialog-from-setting-focus-to-first-textbox
	sHtml += "<input type='hidden' autofocus='autofocus' />";

	// show projects list
	menus.message("Welcome to "+sAppName, sHtml, 
		function(){
			menus.buildStartPrompt();
		}, false);	
};



// ***************************************************************************
// **
// ** START PROJECT GUI (after clicking project name in menu)
// **
// ***************************************************************************

menus.startProjectFromMenu = function(sProjectName){

	var sDbName = getHttpParams().get("db");
	
	
	// first check if the BlackLab corpus still exists
	
	$.ajax( {
		"type": "GET",
		"url": uCobaltInstanceUrl + "webservice/api/check_if_blacklab_corpus_still_exists",
		"data": {
			"project_name": sProjectName,
			"dummy": getUniqueNumber()
		},
		"dataType": "xml", // get response as xml
		"success": function(xml) {
			
			var bExists = $(xml).find("response").text() == 'true';
			
			// if the corpus was removed, we cannot start the project anymore
			if (!bExists ) {
				
				menus.message("Error", "Your corpus has been removed from LAnCeLoT Search.<BR><BR>Please delete the project.");
				
			}
			
			// carry on with project start up
			
			else {
				
				// force Lex'it webservice to clean its counter cache etc
				// update the database
				
				$.ajax( {
					"type": "GET",
					"url": WEBSERV_URL+"/api/set_schema",
					"data": {
						"db_name": sDbName,
						"schema_name": sProjectName,
						"dummy": getUniqueNumber()
						},
					"dataType": "xml", // get response as xml
					"success": function(xml) {
						
						
						// update the current project functions
						// (so any update in sql-config files is taken into account this project)
						
						$.ajax({
							
							"type": "GET",
							"url": uCobaltInstanceUrl+"webservice/api/update_project_functions",
							"data": {
								"username": fn.getCurrentUser(),
								"project_name": sProjectName,
								"dummy": getUniqueNumber()
								},
							"dataType": "xml", // get response as xml
							"success": function(xml) {
								
								// now start the project, i.e. redirect to the project URL
								
								window.location.replace(uLexitInstanceUrl + "?db=" + sDbName + "&proj=" + sProjectName + ( bTestMode ? "&test=true":""));
							},
							
							"error": function(jqXHR, textStatus, errorThrown){
			
								menus.message("Error", "Updating the project's functions went wrong!", 
									function(){
										menus.reloadApplication();
									});
							}
							
						});
						
						
						
						
						
					},
					"error": function(jqXHR, textStatus, errorThrown){
			
						menus.message("Error", "Starting the project went wrong!", 
							function(){
								menus.reloadApplication();
							});
					}
				} );	
				
			}	
			
					
						
		},
		"error": function(jqXHR, textStatus, errorThrown){

			menus.message("Error", "Checking the list of BlackLab corpora went wrong!", 
				function(){
					menus.reloadApplication();
				});
		}
	} );
	
};



// ***************************************************************************
// **
// ** SET UP MENU (for user to fill in)
// **
// ***************************************************************************



/**
 * Help function:
 * Get the list of corpora of a given BlackLab instance
 * If an ID was given, replace the current DOM element having that ID by a selectbox with the same ID
 */
menus.getListOfCorporaInBlackLabInstance = function(sHostId, sCorpusId){
	
	// read the host chosen by user, if in home mode 
	var sHost = $("#"+sHostId).val();	
	
	$("#"+sCorpusId).val(" ... loading list of corpora ... please wait ... ").prop('disabled', true);
	
	$.ajax( {
		"type": "GET",
		"url": uCobaltInstanceUrl + "webservice/api/get_list_of_blacklab_corpora",
		"data": {
			"url": (sHost != null ? sHost : menus.defaultHost),
			"username": fn.getCurrentUser()
		},
		"dataType": "xml", // get response as xml
		"success": function(xml) {
			
			var aCorpora = $(xml).find("response").text().split("|");
			
			if (sCorpusId == null){
				return aCorpora;				
			}
			else {
				var sSelect = "<select id='"+sCorpusId+"'>";
				for (var i=0; i<aCorpora.length; i++){
					sSelect += "<option value='"+aCorpora[i]+"'>"+aCorpora[i]+"</option>";
				}
				sSelect += "</select>";
				
				// replace
				$("#"+sCorpusId).prop('disabled', false).replaceWith( sSelect );
			}			
		},
		"error": function(jqXHR, textStatus, errorThrown){

			menus.message("Error", "Reading the list of BlackLab corpora went wrong!", 
					function(){
						menus.reloadApplication();
					});
		}
	} );
};




menus.setupProjectFromMenu = function(){
	
	// get the list of projects in the database (no distinction in ownership)
	menus.readListOfAllProjectsInDatabase();
	
	// first read the list of available lexica
	// to choose from when building a project
	
	var url = uCobaltInstanceUrl + "webservice/api/get_list_of_default_lexica"; 
	$.ajax( {
		"type": "GET",
		"url": url,
		"dataType": "xml", // get response as xml
		"success": function(xml) {
			
			// we have a list of lexica, 
			// add the 'Other lexicon' choice to the list to choose from 
			menus.aLexica = $(xml).find("response").text().split("|");
			
			// keep just in case!
			//menus.aLexica.push("Other (credentials needed)");
			
			
			var aParams = new Array();

			var defaults =
			{
				"Project name": "",
				"Corpus name": "",  // home style
				"Your corpora": "", // production style
				"Blacklab host": menus.aBlacklabHosts,
				"Use part-of-speech-tags": ["Basic part-of-speech", "Part-of-speech with full features::selected"],
				"Default lexicon": menus.aLexica,
				"Most recent version (beware: fetching newest version takes time)": ["No::selected", "Yes"],
				"Lexicon database name": "",
				"Lexicon host": "",
				"Lexicon schema": "",
				"Username": "",
				"Password": ""
			}
		
		
			// 1st step: 
			// Type in a project name
		
			var runStep1 = function(){	
				
				// delete previous selection if we got here by cancelling the next screen
				menus.deleteParameter(aParams, "project_name");
				menus.deleteParameter(aParams, "user_friendly_name");
				menus.deleteParameter(aParams, "transfer_validity_from");
				if (menus.debugParams) console.log(aParams);	
		
				var aProjectsToReuse = cloneArray(menus.aProjectsList); 
				aProjectsToReuse.unshift("-");				
		
				fn.closeDialog();
				menus.prompt(["(1/4) Set up your project", 
					"To set up a project you have to define:"+
					"<ul>"+
					"<li>A project name</li>"+
					"<li>A corpus</li>"+
					"<li>A tagset</li>"+
					"<li>A reference lexicon</li>"+
					"</ul>"+
					"Please fill in a project name"],					
					// field name
						["Project name"],
					// default value 
						[defaults["Project name"]],
					function(resp){
												
						var sNewProjectName = resp["Project name"];
						
						
						// check if project name is given
						
						if (sNewProjectName == ""){
							
							menus.message("Error", "No project name given!", function() {
								runStep1();
							});
						}
						
						else {
							
							// rewrite the project name: only letters are allowed in projectname
							// (prevent illegal schema names in the database)
							
							var sCleanProjectName = sNewProjectName.replace(/[^a-zA-Z]+/g, "").toLowerCase();
							//var sNewProjectName = sNewProjectName.replace(/[\^\*&\(\)]+/g, " ");						
							var sNewProjectNameUnique = sCleanProjectName.substring(0, 3)+getUniqueNumber();
							var bExistsAlready = ( menus.aAllProjectsListInDatabase.indexOf(sNewProjectNameUnique)>-1 );
							
							if (bExistsAlready){
								
								fn.closeDialog();
								menus.message("Beware!", "This project name is already in use!<BR><BR>Please choose another name!", function(){
									menus.reloadApplication();
								});
							}
			
							//if (aProjectsToReuse.indexOf((resp["Project name"]).replace(/[ \-]+/g, "_").toLowerCase())>-1){
							//
							//	fn.message("Error", "This project already exists!<BR><BR>Please choose another name.", function(){
							//		runStep1();
							//	});
							//}
							//else {
							//	aParams.push("project_name="+(resp["Project name"]).replace(/[ \-]+/g, "_")); // no spaces or '-' signs allowed in projectname
							//	aParams.push("transfer_validity_from="+(resp["(Optional) load validity info from project"]));
							//	runStep2();
							//}
													
							
							else {
								// set project name
								aParams.push("project_name="+sNewProjectNameUnique);
								aParams.push("user_friendly_name="+ encodeURIComponent(sNewProjectName));
								
								console.log(aParams);
								
								// validity (keep it here for setting default, although deprecated as a feature)
								aParams.push("transfer_validity_from=-"); // default value, meaning 'off'
								
								// OK? Go to next screen
								
								runStep2();
							}
							
						}				
		
					},
					function(){
						
						// Cancel at first screen? Go back to main menu (= restart the application)
						 
						menus.message("OK", "Operation canceled by user.", function(){menus.reloadApplication();});
						
					}, 
					null, null, menus.winsize
				);
				
				setTimeout(function(){
					$("label[for=projectname]").append( $("<BR>")); // add some space before the input field
				}, 100);
			}
			
		
			// 2nd step: 
			// BlackLab info
		
			var intervalID; // for interval, allowing corpus list refresh, as we might have been uploading a new corpus in Galahad search
			
			var runStep2 = function(){	
				
				// delete previous selection if we got here by cancelling the next screen
				menus.deleteParameter(aParams, "blacklab_corpusname");
				menus.deleteParameter(aParams, "blacklab_url");
				menus.deleteParameter(aParams, "full_pos_features");
				if (menus.debugParams) console.log(aParams);			
		
				fn.closeDialog();
				menus.prompt(["(2/4) Select a corpus or upload a new corpus in LAnCeLoT Search", 
						(menus.home ? "Please choose a corpus" : 
							"To be able to correct the linguistic annotation of your corpus, you first have to<BR>"+
							"upload it in LAnCeLoT Search, where you can already search your original corpus.<BR>"+
							"LAnCeLoT Search will appear in a separate tab in your browser.<BR>"+
							"<BR>"+
							"After that, go back to the  LAnCeLoT tab and you will see that the name of your<BR>"+
							"uploaded corpus is listed in \"your corpora\".<BR>"+
							"A corpus can be reused by simply linking it to another project (different project<BR>"+
							"name).<BR>"+
							"<BR>"+
							"Please select a corpus")+
						(menus.home ? "<BR>that is: the URL of the BlackLab instance you wish to use, and the name of a corpus" : "")], 
					// field names
						(menus.home ? ["Blacklab host", "Corpus name", "Use part-of-speech-tags"] : ["Your corpora"]),
					// default values 
						(menus.home ? [defaults["Blacklab host"], defaults["Corpus name"], defaults["Use part-of-speech-tags"]] : [defaults["Your corpora"]]), 
					function(resp){
						
						// now add the new selected parameters
						if (menus.home){
							aParams.push("blacklab_corpusname="+resp["Corpus name"]);
							aParams.push("blacklab_url="+resp["Blacklab host"] + ($.endsWith(resp["Blacklab host"], "/")?"":"/") + resp["Corpus name"]);
							aParams.push("full_pos_features="+(resp["Use part-of-speech-tags"]=='Part-of-speech with full features'));
						}
						else {
							aParams.push("blacklab_corpusname="+resp["Your corpora"]);
							aParams.push("blacklab_url=" + menus.defaultHost + resp["Your corpora"]);
							aParams.push("full_pos_features=true");
						}
						
						// OK? Go to next screen
						
						clearInterval(intervalID); // clear interval as we're leaving
						runStep3a();
					}, 
					function(){
						
						// Cancel? Go back to previous screen			
						
						clearInterval(intervalID); // clear interval as we're leaving			
						runStep1();
						
					}, 
					null, null, menus.winsize
				);
				
				
				// add upload button to the dialog
				// (this has to happen after fn.prompt call, as this is an addition to the default dialog)
				
				$("div[id^='dialog-message']").find("fieldset").append(
					$("<span></span>")
						.html("or<BR><BR>")
				);
				$("div[id^='dialog-message']").find("fieldset").append(
					$("<button/>")
						.text("Upload a new corpus")
						.click(function(e){
							e.preventDefault();
							intervalID = setInterval(function(){
								
								console.log("Reload the list of corpora");
																
								// reload the corpus list every 2 sec, except if the menu has focus (user busy choosing one!)
								if ( !$("#"+menus.prompt_corpusname_id).is(":focus") )
									menus.getListOfCorporaInBlackLabInstance("prompt_blacklabhost", menus.prompt_corpusname_id);									
																										 
							}, 2000);
							
							if (menus.home)
								window.open(menus.defaultHost.replace("blacklab-server", "corpus-frontend"));
							else
								window.open(window.location.origin + "/lancelot/search/");	
						})
				);
				
				
				
				// Start situation in this screen:
				// set default Corpus name, given first value in BlackLab host list
				
				setTimeout(function(){
					menus.getListOfCorporaInBlackLabInstance("prompt_blacklabhost", menus.prompt_corpusname_id);
				}, 100);
				
				
				// Allow choice of host 
				// OR manual input of custom URL 
				
				$("#prompt_blacklabhost").change(function(){
					
					// custom URL
					if ( $(this).val() == (cloneArray(menus.aBlacklabHosts)).slice(-1)[0] ){
						
						// change the [host names list] into a [field for manual input]
						$("#prompt_blacklabhost").replaceWith("<input type='text' name='blacklabhost' id='prompt_blacklabhost' style='width:95%' placeholder='Enter URL of your Blacklab host';>");
						
						// clicking in it should trigger reset (emptying) of the corpus name field 
						$("#prompt_blacklabhost").click(function(){
							$("#"+menus.prompt_corpusname_id).replaceWith("<input type='text' name='blacklabcorpusname' id='"+menus.prompt_corpusname_id+"' style='width:95%' placeholder='Enter Corpus name';>");								
							$("#"+menus.prompt_corpusname_id).click(function(){					
								if ($("#prompt_blacklabhost").val() != ''){
									menus.getListOfCorporaInBlackLabInstance("prompt_blacklabhost", menus.prompt_corpusname_id);
								}					
							});					
						});
	
	
						// change the [corpus names list] into a [field for manual input]
						$("#"+menus.prompt_corpusname_id).replaceWith("<input type='text' name='blacklabcorpusname' id='"+menus.prompt_corpusname_id+"' style='width:95%' placeholder='Enter Corpus name';>");
						
						// clicking in it will (if a host name has been typed in) trigger retrieval of the corpora of that host
						$("#"+menus.prompt_corpusname_id).click(function(){								
							if ($("#prompt_blacklabhost").val() != ''){
								menus.getListOfCorporaInBlackLabInstance("prompt_blacklabhost", menus.prompt_corpusname_id);
							}					
						});						
												
						// now put the cursor where the user should start!
						$("#prompt_blacklabhost").focus();
	
					}
					// pre-set host
					else {
						menus.getListOfCorporaInBlackLabInstance("prompt_blacklabhost", menus.prompt_corpusname_id);
					}
					
				});
				
			}
		
		
			// 3rd step: 
			// declare set of allowed parts-of-speech
		
			var bOtherTagSet;
		
			var runStep3a = function(){
				
				bOtherTagSet = false;
				
				// delete previous selection if we got here by cancelling the next screen
				menus.deleteParameter(aParams, "tagset_type");
				if (menus.debugParams) console.log(aParams);
		
				fn.closeDialog();
				menus.prompt(["(3/4) Define the tagset you want to use", 
					"By default, the tool uses the TDN core tagset.<BR>"+
					"If you only wish to use the TDN main part of speech information, choose TDN-bare.<BR>"+
					"If you wish to adapt the TDN core tagset, please choose TDN-adapted.<BR>"+
					"<BR>"+
					"If you wish to use a totally different tagset, it is also possible:<BR>"+
					"&nbsp;&nbsp;&nbsp;- Choose tagset 'other'<BR>"+
					"&nbsp;&nbsp;&nbsp;- <I>COPY & PASTE</I> your list in the tagset box.<BR><BR>"+
					"Warning: only one part-of-speech per line is allowed<BR><BR>"
					], 
				// field names
					["Tagset name", "Tagset"],
				// default values
					[["TDN-core", "TDN-bare", "TDN-adapted", "other"], (menus.defaultTagSets["TDN-core"]).join("\n")], 
					function(resp){
												
						// now add the new selected parameters		
						aParams.push("tagset_type="+resp["Tagset name"]);
						menus.aTagSetToUpload = resp["Tagset"].regexReplaceAll("[\n\r]", '<BR>').split("<BR>") ; 
		
						// if the chosen tagset has features, user must be allowed to specify forbidden features combinations
						if ( resp["Tagset name"] == 'TDN-core' || resp["Tagset name"] == 'TDN-adapted' || (resp["Tagset"]).indexOf("(")>0){
							runStep3b();	
						}
						// but if the chosen tagset hasn't features (t.i. only consists of heads), skip the forbidden features combinations screen
						else {
							menus.aForbiddenTagSetToUpload = [];
							runStep4a();	
						}
						
									
					},
					function(){
						
						// if the 'Other' tag set was chosen, clicking Cancel will bring back the default Tagset						
						if (bOtherTagSet){
							runStep3a();
						}
						// otherwise Cancel will bring back to the previous screen
						else {
							runStep2();
						}
					},
					true, 		// input field must be a text area
					[60, 10], 	// text area size
					menus.winsize
				); 
				
				// default setting of Tagset (TDF code is chosen)
				$("#prompt_tagset").prop('disabled', true);
				
				// Allow input of custom URL 
				
				$("#prompt_tagsetname").change(function(){
					
					if ( $.startsWith( $(this).val(), "TDN") ){
						
						bOtherTagSet = false;
						
						// set list of tag given the chosen tagset
						$("#prompt_tagset").val( (menus.defaultTagSets[$(this).val()]).join("\n") );
						
						// editing is only allowed when 'TDN-adapted' is chosen
						$("#prompt_tagset").prop('disabled', ($(this).val() != 'TDN-adapted'));
						
						$("#prompt_tagsetname").focus();
						
					}
					
					if ( $(this).val() == "other" ){
						
						bOtherTagSet = true;
	
						$("#prompt_tagsetname").replaceWith("<input type='text' name='tagsettype' id='prompt_tagsetname' placeholder='Enter Tagset name';>");
						
						// make tag box empty (no TDN here!)
						$("#prompt_tagset").val("");
						
						// editing is allowed for an 'other' Tagset
						$("#prompt_tagset").prop('disabled', false);
						
						$("#prompt_tagsetname").focus();
	
					}
					
				});
			}
		
			// declare set of forbidden parts-of-speech
		
			var runStep3b = function(){
				
				if (menus.debugParams) console.log(aParams);				
				
				//var bTdn = aParams.some(element => element.includes("tagset_type=TDN"));
				//var sLabel = (bTdn ? "Forbidden parts-of-speech (binary ambiguous values get the value 'uncl' for unclear)" : "Forbidden parts-of-speech")
		
				fn.closeDialog();
				menus.prompt(["(3/4) Define the forbidden parts-of-speech", 
					"You have chosen either the TDN-core tagset or the option to adapt the TDN-core tagset.<BR><BR>"+
					"In TDN, there are rules for indicating ambiguity : binary ambiguous values should be given the value “uncl”. The tags that are not allowed are listed below.<BR><BR>"+
					"If needed, the list can be adapted. Make sure that there is only one part of speech per line.<BR><BR>"					
					], 
				// field names
					["Forbidden parts-of-speech"],
				// default values
					[ menus.defaultForbiddenFeatCombSet.join("\n") ], 
					function(resp){
		
						menus.aForbiddenTagSetToUpload = resp["Forbidden parts-of-speech"].regexReplaceAll("[\n\r]", '<BR>').split("<BR>") ;
						
						// OK? Go to next screen 
						runStep4a();		
					},
					function(){						
						
						// Cancel? Go back to previous scrreen
						runStep3a();
					},
					true,		// input field must be a text area
					[60, 10], 	// text area size
					menus.winsize	// fixed window size
				);
			}
		
		
			// 4th step: 
			// IvdNT lexicon database info
		
			var runStep4a = function(){
				
				// delete previous selection if we got here by cancelling the next screen
				menus.deleteParameter(aParams, "lexicon_name");
				menus.deleteParameter(aParams, "lexicon_host");
				menus.deleteParameter(aParams, "lexicon_schema");
				menus.deleteParameter(aParams, "lexicon_user");
				menus.deleteParameter(aParams, "lexicon_pass");
				menus.deleteParameter(aParams, "lexicon_freshcopy");
				if (menus.debugParams) console.log(aParams);
		
				fn.closeDialog();
				menus.prompt(["(4/4) Select the desired reference lexicon", 
					"To help you with correcting the part of speech tagging and lemmatisation of your corpus, LAnCeLoT provides per type suggestions coming from the INT GiGaNT lexicon. You can either choose the complete lexicon or a more restricted selection.<BR><BR>"+
					"Choose:"],
				// field names
					(menus.home ? ["Default lexicon", "Most recent version (beware: fetching newest version takes time)"] : ["Default lexicon"] ),
				// default values 
					(menus.home ? [defaults["Default lexicon"], defaults["Most recent version (beware: fetching newest version takes time)"]] : [defaults["Default lexicon"]]),
					function(resp){
								
						//// Custom lexicon (last choice)
						//if ( resp["Default lexicon"] == (defaults["Default lexicon"]).slice(-1)[0] ){
		                //
						//	// Custom choice requires yet another screen!
						//	
						//	runStep4b();
						//
						//}
						// Default lexicon chosen
						//else {							
							
							var bMostRecent = resp["Most recent version (beware: fetching newest version takes time)"];
							if (bMostRecent == null) bMostRecent = "No";
		
							aParams.push("lexicon_name="+resp["Default lexicon"]);
							aParams.push("lexicon_host=@");
							aParams.push("lexicon_schema=@");
							aParams.push("lexicon_user=@");
							aParams.push("lexicon_pass=@");
							aParams.push("lexicon_freshcopy="+bMostRecent);
		
							fn.closeDialog();
							
							// very last step: add username of project maker to the params
							aParams.push("username="+fn.getCurrentUser());
							
							// We're ready: start building the project now!
							menus.runSetUp(aParams);
						//}				
					},
					function(){
		
						// Cancel? Go back to previous screen
							
						if (menus.aForbiddenTagSetToUpload.length == 0) // go back to bare-Tagset			
							runStep3a();
						else 
							runStep3b();						// general case
						
					}, 
					null, null, menus.winsize
				);
			}
		
			var runStep4b = function(){
				
				// delete previous selection if we got here by cancelling the next screen
				menus.deleteParameter(aParams, "lexicon_name");
				menus.deleteParameter(aParams, "lexicon_host");
				menus.deleteParameter(aParams, "lexicon_schema");
				menus.deleteParameter(aParams, "lexicon_user");
				menus.deleteParameter(aParams, "lexicon_pass");
				menus.deleteParameter(aParams, "lexicon_freshcopy");
				if (menus.debugParams) console.log(aParams);
		
				fn.closeDialog();
				menus.prompt(["(4/4) Custom lexicon", 
					"This is the last set of needed data. Fill in your lexicon credentials:"],
				// field names
					["Lexicon database name", "Lexicon host", "Lexicon schema", "Username", "Password"],
				// default values
					[defaults["Lexicon database name"], defaults["Lexicon host"], defaults["Lexicon schema"], defaults["Username"], defaults["Password"]],
					function(resp){
					
						// now add chosen parameters
						aParams.push("lexicon_name="+resp["Lexicon database name"]);
						aParams.push("lexicon_host="+resp["Lexicon host"]);
						aParams.push("lexicon_schema="+resp["Lexicon schema"]);
						aParams.push("lexicon_user="+resp["Username"]);
						aParams.push("lexicon_pass="+resp["Password"]);
		
						fn.closeDialog();
						
						// very last step: add username of project maker to the params
						aParams.push("username="+fn.getCurrentUser());
						
						// We're ready: start building the project now!						
						menus.runSetUp(aParams);
		
					},
					function(){
						
						// Cancel? Go back to previous screen
						runStep4a();
						
					}, 
					null, null, menus.winsize
				);
			}
			
			runStep1();
		
		},
		"error": function(jqXHR, textStatus, errorThrown){

			menus.message("Error", "Reading the list of default lexica went wrong!", 
					function(){
						menus.reloadApplication();
					});
		}
	} );
	
};



// ***************************************************************************
// **
// ** AUTOMATIC SET UP (fired after Set up menu was filled in by user)
// **
// ***************************************************************************

menus.myDialogProgress = null;
menus.dStartDate;
menus.distance, menus.iMinutes, menus.iSeconds;
menus.bSetUpCancelled = false;

menus.runSetUp = function(aParams, stepNr){
	
	if (menus.bSetUpCancelled){
		var sThisProjectName = (aParams.find((element) => $.startsWith(element, "project_name="))).replace("project_name=", "");
		setTimeout(function(){
			$.ajax( {
				"type": "GET",
				"data": {
					"username": fn.getCurrentUser(),
					"project_name": sThisProjectName
				},
				"url": uCobaltInstanceUrl + "webservice/api/remove/",
				"success": function(xml) {					
					menus.reloadApplication();											
				},
				"error": function(jqXHR, textStatus, errorThrown){
					menus.message("Error", "Something went wrong: "+textStatus+" "+errorThrown, 
					function(){
						menus.reloadApplication();
					} );
				}
			} );
		}, 100);
		
		return; // done here!
	}
	
	// debug mode
	if (menus.debugParams){
		console.log(aParams);
		return;
	}

	var step = (stepNr==null ? 0 : parseInt(stepNr));

	// initialisation step
	if (step == 0) {

		// start measuring time of whole process
		menus.dStartDate = new Date();
		
		showSpinner('#indicators');
		menus.message("Busy...", 
			"The project is being set up now.<BR><BR>Depending on the amount of data, the process can take a few seconds up to several minutes.<BR><BR>"+
			"Please leave this window open until loading is finished...<BR><BR>"+
			"<center><button type='button' class='cobaltred cobaltbutton ui-button ui-corner-all ui-widget' style='color: #ffffff;' id='cancel_setup''>Cancel</button></center><BR><BR>", 
			null, false);
		

	    setTimeout(function(){
			
			$("div[id^='dialog-message']").find("p").append("<div style='border:1px solid lightgrey; width=100%'><div id='dialog_progressbar'><BR><BR></div></div>");
			$("#cancel_setup").click(function(){
				
				menus.confirm("Cancel setup", "Are you sure you want to cancel the setup of this project?", 
					function(){
						fn.closeDialog();
						menus.message("OK", "Cancelling operation... Please wait a second...", null, false);
						menus.bSetUpCancelled = true; // this will cause the process to stop as soon as the following step is reached
					},
					function(){
						// do nothing
					}
				);
					
										
			});
		}, 100);
		

		menus.runSetUp(aParams, 1);
	}

	// now the set up has really begun

	else {

		// set the 'allowed_tagset' and 'forbidden_tags' parameters 
		// (default null)
		var aAllowedTagParam = null;
		var aForbiddenTagParam = null;



		// Special cases: 
		// if we are at step 4 (loading allowed parts-of-speech)
		// we have to keep at this step till all parts-of-speech have been loaded
		// (since we have to do that in pieces...)

		// the runSetUp function is called with a higher step value at each round, so
		// as to go to the next step, but we are not finished with the previous step, 
		// so: step back!

		if (step > 4 && menus.aTagSetToUpload.length >0){
			step = 4;
			stepNr = 4;
		}

		if (step == 4){

			var iNumberToSendAtOnce = 30;
			var aTagsToSend = menus.aTagSetToUpload.splice(0, iNumberToSendAtOnce);
			if (aTagsToSend.length>0){				
				aAllowedTagParam = [ "allowed_tagset="+ aTagsToSend.join("@") ];
			}
		}


		if (step > 5 && menus.aForbiddenTagSetToUpload.length >0){
			step = 5;
			stepNr = 5;
		}

		if (step == 5){

			var iNumberToSendAtOnce = 30;
			var aForbiddenTagsToSend = menus.aForbiddenTagSetToUpload.splice(0, iNumberToSendAtOnce);
			if (aForbiddenTagsToSend.length>0){				
				// we need to transform '|' into '!!!' because Tomcat won't allow pipes in paramaters (we transform back into pipe in CobaltServe)
				aForbiddenTagParam = [ "forbidden_tags="+ aForbiddenTagsToSend.join("@").replace(/\|/g, '!!!') ]; 
			}
		}


		// General case 
		
		// set the 'step' parameter
		var aStepParam = ["step="+step];

		// gaths all params
		var aAllParams = aParams.concat(aStepParam);
		if (aAllowedTagParam != null)
			aAllParams = aAllParams.concat(aAllowedTagParam);
		if (aForbiddenTagParam != null)
			aAllParams = aAllParams.concat(aForbiddenTagParam);
			

		$.ajax( {
			"type": "GET",
			"url": uCobaltInstanceUrl + "webservice/api/setup/" + "?" + aAllParams.join("&"),
			"success": function(xml) {

				var response = $(xml).find("response").text()
				var aResponse = response.split(":::");
				var sCurrentStep = aResponse[0];
				var sTotalNumberOfSteps = aResponse[1]; 
				var sMessage = aResponse[2];

				// beware: 		iStartTime = 		start time of one single step 
				// 				menus.dStartDate =	global start time for whole process
				// 
				var iStartTime = new Date().getTime();		// millisec
				var iEstimatedTotalTime = 5 * 60 * 1000;	// min x sec x millisec

				clearInterval(menus.myDialogProgress);
				menus.myDialogProgress = setInterval(function(){

					// our progress bar show a progress indication at the beginning of each new step
					// like ( [current step] / [total nr of steps to be done] ) * 100 = percent
					//
					// this can leave the progress bar in the same state for some time, so
					// to be able to show progress in-between, we compute a value in the 
					// range [0.00 - 0.99] to be added the the step number, yielding
					// a value between the current step number and the next one
					//
					// this in-between value in the range [0.00 - 0.99] is computed
					// based on the elapsed time within a range of 5 minutes.
					// But if the steps takes more than that amount of time,
					// we in-between value won't be allowed to climb above 1.0
					// (otherwise we'll end up with a progress bar moving backwards
					//  as soon as the next step starts)
					var iActualTime = new Date().getTime();	// millisec
					var iCurrentStepLoaded = ((iActualTime - iStartTime) / iEstimatedTotalTime);
					if (iCurrentStepLoaded>1.0) iCurrentStepLoaded = 1.0;

					menus.distance = new Date().getTime() - menus.dStartDate.getTime();
					menus.iMinutes = Math.floor((menus.distance % (1000 * 60 * 60)) / (1000 * 60));
					menus.iSeconds = Math.floor((menus.distance % (1000 * 60)) / 1000);


					var iLoaded = ((parseInt(aResponse[0])+iCurrentStepLoaded) /parseInt(aResponse[1]) ) * 100; // progress in percent
					$("div[id='dialog_progressbar']").html("<BR><CENTER>"+
					"Elapsed time "+right("0"+menus.iMinutes, 2)+":"+right("0"+menus.iSeconds, 2)+"<BR><BR>"+
					"Progress: <progress value=\""+iLoaded+"\" max=\"100\"></progress><BR><BR>Step "+sCurrentStep+"/"+sTotalNumberOfSteps+" : "+sMessage+
					"</CENTER><BR><BR>");
				}, 
				1000); // update program every second
				
				
				if (sMessage == 'Done' && !menus.bSetUpCancelled){
					clearInterval(menus.myDialogProgress);
					fn.closeDialog();
					removeSpinner('#indicators');
					menus.message("OK", 
					"<B>Your project is now ready for use.</B><BR><BR>"+
					"Loading time was "+right("0"+menus.iMinutes, 2)+" min "+right("0"+menus.iSeconds, 2)+" sec<BR><BR>"+
					"Click OK and you can start working!", function(){
						
						var sThisProjectName = (aAllParams.find((element) => $.startsWith(element, "project_name="))).replace("project_name=", "");							
						window.location.replace(uLexitInstanceUrl + "?db=" + getHttpParams().get("db") + "&proj=" + sThisProjectName + ( bTestMode ? "&test=true":""));
					});
				}
				else {
					menus.runSetUp(aParams, stepNr+1);
				}					
			},
			"error": function(jqXHR, textStatus, errorThrown){
				clearInterval(menus.myDialogProgress);
				removeSpinner('#indicators');						
				menus.message("Error", "Something went wrong: "+textStatus+" "+errorThrown, 
					function(){
						menus.reloadApplication();
					} );
			}
		} );

	}
};

		
		
		
// ***************************************************************************
// **
// ** EXPORT MENU
// **
// ***************************************************************************				


menus.exportProgress = null;

menus.exportProjectFromMenu = function(sProjectName){
	
	var doExport = function(bMode){
		
		menus.message("Please wait...",
			"Corpus '"+sProjectName+"' is being exported now.<div id='timediv'></div>");
			//"Corpus '"+sProjectName+"' is being downloaded now.<div id='progressdiv' style='height:50px'></div><div id='timediv'></div>");

		var iStartTime = new Date().getTime();		// millisec
		var iMinutes = 0, iSeconds = 0;

		clearInterval(menus.exportProgress);
		menus.exportProgress = setInterval(function(){

			$.ajax({
				"type": "GET",
				"url": uCobaltInstanceUrl + "webservice/api/export_status/" + "?project_name="+sProjectName,
				"success": function(xml) {

					var progress = $(xml).find("response").text();
					
					var elapsedTime = new Date().getTime() - iStartTime;
					iMinutes = Math.floor((elapsedTime % (1000 * 60 * 60)) / (1000 * 60));
					iSeconds = Math.floor((elapsedTime % (1000 * 60)) / 1000);

					$("div[id='timediv']").html("<BR><CENTER><progress value=\""+progress+"\" max=\"100\"></progress><BR>"+
					"Elapsed time "+right("0"+iMinutes, 2)+":"+right("0"+iSeconds, 2)+
					"</CENTER>");											
				},
				"error": function(jqXHR, textStatus, errorThrown){
					menus.message("Error", "Something went wrong when reading the export progress status: "+textStatus+" "+errorThrown, 
					function(){
						menus.reloadApplication();
					} );
				}
			});

		}, 
		1000); // update every second


		// remove OK  button from dialog (because clicking it would cause the progress indicator to disappear!)
		setTimeout(function(){
			$("#dialog_accept_button").hide();
		}, 100);

		// Start download
		// Wait till it's finished before asking the user where to save the file

		// https://codepen.io/chrisdpratt/pen/RKxJNo
		$.ajax({
			url: uCobaltInstanceUrl + "webservice/api/export/?project_name="+sProjectName + "&only_validated="+bMode,
			method: 'GET',
			xhrFields: {
				responseType: 'blob'
			},
			success: function (data) {

				// When download is finished,
				// The user can save the file 
				
				var a = document.createElement('a');
				var url = window.URL.createObjectURL(data);
				a.href = url;
				a.download = 'lancelot_export.'+sProjectName+'.zip';
				document.body.append(a);
				a.click();
				a.remove();
				window.URL.revokeObjectURL(url);

				//removeSpinner("div[id^='dialog-message']");
				fn.closeDialog();
				
				menus.message("OK", "Corpus '"+sProjectName+"' was exported to your harddisk.<BR><BR>"+
					"<CENTER>(Job finished in "+ (right("0"+iMinutes, 2)+" min").replace("00 min", "") +" "+right("0"+iSeconds, 2)+" sec)</CENTER>", 
					function(){
						menus.reloadApplication();
					}
				);
			},
			error: function(jqXHR, textStatus, errorThrown ){

				//removeSpinner("div[id^='dialog-message']");

				fn.closeDialog();
				menus.message("ERROR", "The export of '"+sProjectName+"' failed!<BR><BR>"+
					"Check the console for details.", 
					function(){
						menus.reloadApplication();
				});

			}
		});	
	};
	
	
	// in home mode, we have the choice what to import
	if (menus.home){
		
		menus.prompt(["Export", "Choose a suitable export mode."], ["Update the original documents with:"], [["all the records::selected", "only the validated records"]], function(resp){

			var bMode = ( resp["Update the original documents with:"] == "only the validated records" ? true : false );
	
			// close menu and show progress indicator
	
			fn.closeDialog();
			
			doExport(bMode);		
	
		});	
		
	}
	
	// in non-home mode, we can only export all records
	else {
		doExport(false);
	}

	

};


// ***************************************************************************
// **
// ** DELETE
// **
// ***************************************************************************

menus.deleteProjectFromMenu = function(sProjectName){
	
	
	var fnDelete = function(sProjectName){
		
		$.ajax( {
			"type": "GET",
			"data": {
				"username": fn.getCurrentUser(),
				"project_name": sProjectName
			},
			"url": uCobaltInstanceUrl + "webservice/api/remove/",
			"success": function(xml) {
				
				var response = $(xml).find("response").text()
				
				menus.message("OK", response, function(){
					menus.reloadApplication();
				});											
			},
			"error": function(jqXHR, textStatus, errorThrown){
				menus.message("Error", "Something went wrong: "+textStatus+" "+errorThrown, 
					function(){
						menus.reloadApplication();
					} );
			}
		} );
	};
	

	fn.callFunction(sProjectName+".number_of_corrections", [], function(resp){

		var iNumberOfCorrections = parseInt(resp["number_of_corrections"]);

		if (iNumberOfCorrections > 0){
			
			menus.confirm("Beware", 
				"Work has been done on this project.<BR><BR>Deleting will cause work to be lost.<BR><BR>Are you sure this is what you want?",
					function(){
						fnDelete(sProjectName);	
					}, 
					function(){
						menus.message("OK", "Operation canceled by user.");
					}
			);
		}
		else {
			menus.confirm("Beware", "You are about to remove this project from the database.<BR><BR>Are you sure this is what you want?",
				function(){
						fnDelete(sProjectName);	
					}, 
					function(){
						menus.message("OK", "Operation canceled by user.");
					}
			);	
		}

	},
	
	// Error handler: if the 'number_of_corrections' function does not exist yet, we can safely remove the project
	// (the fact that the function does not exist indicates that the project generation went wrong)
	function(){	
				
		$.ajax( {
			"type": "GET",
			"url": uCobaltInstanceUrl + "webservice/api/remove/" + "?project_name="+sProjectName,
			"success": function(xml) {
				menus.message("OK", "The project has been successfully removed.", function(){
					menus.reloadApplication();
				});											
			},
			"error": function(jqXHR, textStatus, errorThrown){
				menus.message("Error", "Something went wrong: "+textStatus+" "+errorThrown, 
					function(){
						menus.reloadApplication();
					} );
			}
		} );
	});

	
};


// delete a paramter from the parameter list
menus.deleteParameter = function(aParams, sParam){
	
	var sFoundParameter = aParams.find((element) => $.startsWith(element, sParam));
	var iFoundParameterIndex = aParams.indexOf(sFoundParameter);	
	if (iFoundParameterIndex>=0) { aParams.splice(iFoundParameterIndex, 1); }		
};




menus.readListOfAllProjectsInDatabase = function(){
	
	// check if a project name already exists
	$.ajax( {
		"type": "GET",
		"url": uCobaltInstanceUrl + "webservice/api/get_list_of_all_projects",
		"success": function(xml) {
			
			menus.aAllProjectsListInDatabase = $(xml).find("response").text().split("|");		
			

		},
		"error": function(jqXHR, textStatus, errorThrown){
			
			menus.message("Error",  "Something went wrong when checking the list of existing projects: "+textStatus+" "+errorThrown, 
					function(){
						menus.reloadApplication();
					} );
		}
	
	} );

}


// ***************************************************************************
// **
// ** DEFAULT VALUES IN SET UP
// **
// ***************************************************************************


// default Blacklab hosts
// to choose from when setting up a project

menus.aBlacklabHosts = [
			menus.defaultHost,
			"http://svotmc10.ivdnt.loc/blacklab-server/", 
			"http://pcob67.inl.loc:8080/blacklab-server/",
			"http://svprkc02.ivdnt.loc/blacklab-server/",
			"Custom URL"
		];


menus.aLexica = [];

menus.defaultTagSets = {
	
	"TDN-bare": [
		"AA",
		"ADP",
		"ADV",
		"CONJ",
		"INT",
		"NOU-C",
		"NOU-P",
		"NUM",
		"PD",
		"RES",
		"VRB"
	],
	 
	"TDN-core": [
		"AA",
		"AA(degree=comp,position=free)",
		"AA(degree=comp,position=free,WF=abbr)",
		"AA(degree=comp,position=free,WF=mis)",
		"AA(degree=comp,position=free,WF=trunc)",
		"AA(degree=comp,position=postnom)",
		"AA(degree=comp,position=postnom,WF=abbr)",
		"AA(degree=comp,position=postnom,WF=mis)",
		"AA(degree=comp,position=postnom,WF=trunc)",
		"AA(degree=comp,position=prenom)",
		"AA(degree=comp,position=prenom,WF=abbr)",
		"AA(degree=comp,position=prenom,WF=mis)",
		"AA(degree=comp,position=prenom,WF=trunc)",
		"AA(degree=comp,position=uncl)",
		"AA(degree=comp,position=uncl,WF=abbr)",
		"AA(degree=comp,position=uncl,WF=mis)",
		"AA(degree=comp,position=uncl,WF=trunc)",
		"AA(degree=pos,position=free)",
		"AA(degree=pos,position=free,WF=abbr)",
		"AA(degree=pos,position=free,WF=mis)",
		"AA(degree=pos,position=free,WF=trunc)",
		"AA(degree=pos,position=postnom)",
		"AA(degree=pos,position=postnom,WF=abbr)",
		"AA(degree=pos,position=postnom,WF=mis)",
		"AA(degree=pos,position=postnom,WF=trunc)",
		"AA(degree=pos,position=prenom)",
		"AA(degree=pos,position=prenom,WF=abbr)",
		"AA(degree=pos,position=prenom,WF=mis)",
		"AA(degree=pos,position=prenom,WF=trunc)",
		"AA(degree=pos,position=uncl)",
		"AA(degree=pos,position=uncl,WF=abbr)",
		"AA(degree=pos,position=uncl,WF=mis)",
		"AA(degree=pos,position=uncl,WF=trunc)",
		"AA(degree=sup,position=free)",
		"AA(degree=sup,position=free,WF=abbr)",
		"AA(degree=sup,position=free,WF=mis)",
		"AA(degree=sup,position=free,WF=trunc)",
		"AA(degree=sup,position=postnom)",
		"AA(degree=sup,position=postnom,WF=abbr)",
		"AA(degree=sup,position=postnom,WF=mis)",
		"AA(degree=sup,position=postnom,WF=trunc)",
		"AA(degree=sup,position=prenom)",
		"AA(degree=sup,position=prenom,WF=abbr)",
		"AA(degree=sup,position=prenom,WF=mis)",
		"AA(degree=sup,position=prenom,WF=trunc)",
		"AA(degree=sup,position=uncl)",
		"AA(degree=sup,position=uncl,WF=abbr)",
		"AA(degree=sup,position=uncl,WF=mis)",
		"AA(degree=sup,position=uncl,WF=trunc)",
		"AA(degree=uncl,position=free)",
		"AA(degree=uncl,position=free,WF=abbr)",
		"AA(degree=uncl,position=free,WF=mis)",
		"AA(degree=uncl,position=free,WF=trunc)",
		"AA(degree=uncl,position=postnom)",
		"AA(degree=uncl,position=postnom,WF=abbr)",
		"AA(degree=uncl,position=postnom,WF=mis)",
		"AA(degree=uncl,position=postnom,WF=trunc)",
		"AA(degree=uncl,position=prenom)",
		"AA(degree=uncl,position=prenom,WF=abbr)",
		"AA(degree=uncl,position=prenom,WF=mis)",
		"AA(degree=uncl,position=prenom,WF=trunc)",
		"AA(degree=uncl,position=uncl)",
		"AA(degree=uncl,position=uncl,WF=abbr)",
		"AA(degree=uncl,position=uncl,WF=mis)",
		"AA(degree=uncl,position=uncl,WF=trunc)",
		"ADP",
		"ADP(type=circ)",
		"ADP(type=circ,WF=abbr)",
		"ADP(type=circ,WF=mis)",
		"ADP(type=circ,WF=trunc)",
		"ADP(type=post)",
		"ADP(type=post,WF=abbr)",
		"ADP(type=post,WF=mis)",
		"ADP(type=post,WF=trunc)",
		"ADP(type=pre)",
		"ADP(type=pre,WF=abbr)",
		"ADP(type=pre,WF=mis)",
		"ADP(type=pre,WF=trunc)",
		"ADP(type=uncl)",
		"ADP(type=uncl,WF=abbr)",
		"ADP(type=uncl,WF=mis)",
		"ADP(type=uncl,WF=trunc)",
		"ADV",
		"ADV(type=pron)",
		"ADV(type=pron,WF=abbr)",
		"ADV(type=pron,WF=mis)",
		"ADV(type=pron,WF=trunc)",
		"ADV(type=reg)",
		"ADV(type=reg,WF=abbr)",
		"ADV(type=reg,WF=mis)",
		"ADV(type=reg,WF=trunc)",
		"ADV(type=uncl)",
		"ADV(type=uncl,WF=abbr)",
		"ADV(type=uncl,WF=mis)",
		"ADV(type=uncl,WF=trunc)",
		"CONJ",
		"CONJ(type=coor)",
		"CONJ(type=coor,WF=abbr)",
		"CONJ(type=coor,WF=mis)",
		"CONJ(type=coor,WF=trunc)",
		"CONJ(type=sub)",
		"CONJ(type=sub,WF=abbr)",
		"CONJ(type=sub,WF=mis)",
		"CONJ(type=sub,WF=trunc)",
		"CONJ(type=uncl)",
		"CONJ(type=uncl,WF=abbr)",
		"CONJ(type=uncl,WF=mis)",
		"CONJ(type=uncl,WF=trunc)",
		"INT",
		"INT(WF=abbr)",
		"INT(WF=mis)",
		"INT(WF=trunc)",
		"NOU-C",
		"NOU-C(number=pl)",
		"NOU-C(number=pl,WF=abbr)",
		"NOU-C(number=pl,WF=mis)",
		"NOU-C(number=pl,WF=trunc)",
		"NOU-C(number=sg)",
		"NOU-C(number=sg,WF=abbr)",
		"NOU-C(number=sg,WF=mis)",
		"NOU-C(number=sg,WF=trunc)",
		"NOU-C(number=uncl)",
		"NOU-C(number=uncl,WF=abbr)",
		"NOU-C(number=uncl,WF=mis)",
		"NOU-C(number=uncl,WF=trunc)",
		"NOU-P",
		"NOU-P(WF=abbr)",
		"NOU-P(WF=mis)",
		"NOU-P(WF=trunc)",
		"NUM",
		"NUM(type=card,position=free,representation=dig)",
		"NUM(type=card,position=free,representation=dig,WF=abbr)",
		"NUM(type=card,position=free,representation=dig,WF=mis)",
		"NUM(type=card,position=free,representation=dig,WF=trunc)",
		"NUM(type=card,position=free,representation=let)",
		"NUM(type=card,position=free,representation=let,WF=abbr)",
		"NUM(type=card,position=free,representation=let,WF=mis)",
		"NUM(type=card,position=free,representation=let,WF=trunc)",
		"NUM(type=card,position=free,representation=mix-dig)",
		"NUM(type=card,position=free,representation=mix-dig,WF=abbr)",
		"NUM(type=card,position=free,representation=mix-dig,WF=mis)",
		"NUM(type=card,position=free,representation=mix-dig,WF=trunc)",
		"NUM(type=card,position=free,representation=mix-rom)",
		"NUM(type=card,position=free,representation=mix-rom,WF=abbr)",
		"NUM(type=card,position=free,representation=mix-rom,WF=mis)",
		"NUM(type=card,position=free,representation=mix-rom,WF=trunc)",
		"NUM(type=card,position=free,representation=rom)",
		"NUM(type=card,position=free,representation=rom,WF=abbr)",
		"NUM(type=card,position=free,representation=rom,WF=mis)",
		"NUM(type=card,position=free,representation=rom,WF=trunc)",
		"NUM(type=card,position=free,representation=uncl)",
		"NUM(type=card,position=free,representation=uncl,WF=abbr)",
		"NUM(type=card,position=free,representation=uncl,WF=mis)",
		"NUM(type=card,position=free,representation=uncl,WF=trunc)",
		"NUM(type=card,position=postnom,representation=dig)",
		"NUM(type=card,position=postnom,representation=dig,WF=abbr)",
		"NUM(type=card,position=postnom,representation=dig,WF=mis)",
		"NUM(type=card,position=postnom,representation=dig,WF=trunc)",
		"NUM(type=card,position=postnom,representation=let)",
		"NUM(type=card,position=postnom,representation=let,WF=abbr)",
		"NUM(type=card,position=postnom,representation=let,WF=mis)",
		"NUM(type=card,position=postnom,representation=let,WF=trunc)",
		"NUM(type=card,position=postnom,representation=mix-dig)",
		"NUM(type=card,position=postnom,representation=mix-dig,WF=abbr)",
		"NUM(type=card,position=postnom,representation=mix-dig,WF=mis)",
		"NUM(type=card,position=postnom,representation=mix-dig,WF=trunc)",
		"NUM(type=card,position=postnom,representation=mix-rom)",
		"NUM(type=card,position=postnom,representation=mix-rom,WF=abbr)",
		"NUM(type=card,position=postnom,representation=mix-rom,WF=mis)",
		"NUM(type=card,position=postnom,representation=mix-rom,WF=trunc)",
		"NUM(type=card,position=postnom,representation=rom)",
		"NUM(type=card,position=postnom,representation=rom,WF=abbr)",
		"NUM(type=card,position=postnom,representation=rom,WF=mis)",
		"NUM(type=card,position=postnom,representation=rom,WF=trunc)",
		"NUM(type=card,position=postnom,representation=uncl)",
		"NUM(type=card,position=postnom,representation=uncl,WF=abbr)",
		"NUM(type=card,position=postnom,representation=uncl,WF=mis)",
		"NUM(type=card,position=postnom,representation=uncl,WF=trunc)",
		"NUM(type=card,position=prenom,representation=dig)",
		"NUM(type=card,position=prenom,representation=dig,WF=abbr)",
		"NUM(type=card,position=prenom,representation=dig,WF=mis)",
		"NUM(type=card,position=prenom,representation=dig,WF=trunc)",
		"NUM(type=card,position=prenom,representation=let)",
		"NUM(type=card,position=prenom,representation=let,WF=abbr)",
		"NUM(type=card,position=prenom,representation=let,WF=mis)",
		"NUM(type=card,position=prenom,representation=let,WF=trunc)",
		"NUM(type=card,position=prenom,representation=mix-dig)",
		"NUM(type=card,position=prenom,representation=mix-dig,WF=abbr)",
		"NUM(type=card,position=prenom,representation=mix-dig,WF=mis)",
		"NUM(type=card,position=prenom,representation=mix-dig,WF=trunc)",
		"NUM(type=card,position=prenom,representation=mix-rom)",
		"NUM(type=card,position=prenom,representation=mix-rom,WF=abbr)",
		"NUM(type=card,position=prenom,representation=mix-rom,WF=mis)",
		"NUM(type=card,position=prenom,representation=mix-rom,WF=trunc)",
		"NUM(type=card,position=prenom,representation=rom)",
		"NUM(type=card,position=prenom,representation=rom,WF=abbr)",
		"NUM(type=card,position=prenom,representation=rom,WF=mis)",
		"NUM(type=card,position=prenom,representation=rom,WF=trunc)",
		"NUM(type=card,position=prenom,representation=uncl)",
		"NUM(type=card,position=prenom,representation=uncl,WF=abbr)",
		"NUM(type=card,position=prenom,representation=uncl,WF=mis)",
		"NUM(type=card,position=prenom,representation=uncl,WF=trunc)",
		"NUM(type=card,position=uncl,representation=dig)",
		"NUM(type=card,position=uncl,representation=dig,WF=abbr)",
		"NUM(type=card,position=uncl,representation=dig,WF=mis)",
		"NUM(type=card,position=uncl,representation=dig,WF=trunc)",
		"NUM(type=card,position=uncl,representation=let)",
		"NUM(type=card,position=uncl,representation=let,WF=abbr)",
		"NUM(type=card,position=uncl,representation=let,WF=mis)",
		"NUM(type=card,position=uncl,representation=let,WF=trunc)",
		"NUM(type=card,position=uncl,representation=mix-dig)",
		"NUM(type=card,position=uncl,representation=mix-dig,WF=abbr)",
		"NUM(type=card,position=uncl,representation=mix-dig,WF=mis)",
		"NUM(type=card,position=uncl,representation=mix-dig,WF=trunc)",
		"NUM(type=card,position=uncl,representation=mix-rom)",
		"NUM(type=card,position=uncl,representation=mix-rom,WF=abbr)",
		"NUM(type=card,position=uncl,representation=mix-rom,WF=mis)",
		"NUM(type=card,position=uncl,representation=mix-rom,WF=trunc)",
		"NUM(type=card,position=uncl,representation=rom)",
		"NUM(type=card,position=uncl,representation=rom,WF=abbr)",
		"NUM(type=card,position=uncl,representation=rom,WF=mis)",
		"NUM(type=card,position=uncl,representation=rom,WF=trunc)",
		"NUM(type=card,position=uncl,representation=uncl)",
		"NUM(type=card,position=uncl,representation=uncl,WF=abbr)",
		"NUM(type=card,position=uncl,representation=uncl,WF=mis)",
		"NUM(type=card,position=uncl,representation=uncl,WF=trunc)",
		"NUM(type=ord,position=free,representation=dig)",
		"NUM(type=ord,position=free,representation=dig,WF=abbr)",
		"NUM(type=ord,position=free,representation=dig,WF=mis)",
		"NUM(type=ord,position=free,representation=dig,WF=trunc)",
		"NUM(type=ord,position=free,representation=let)",
		"NUM(type=ord,position=free,representation=let,WF=abbr)",
		"NUM(type=ord,position=free,representation=let,WF=mis)",
		"NUM(type=ord,position=free,representation=let,WF=trunc)",
		"NUM(type=ord,position=free,representation=mix-dig)",
		"NUM(type=ord,position=free,representation=mix-dig,WF=abbr)",
		"NUM(type=ord,position=free,representation=mix-dig,WF=mis)",
		"NUM(type=ord,position=free,representation=mix-dig,WF=trunc)",
		"NUM(type=ord,position=free,representation=mix-rom)",
		"NUM(type=ord,position=free,representation=mix-rom,WF=abbr)",
		"NUM(type=ord,position=free,representation=mix-rom,WF=mis)",
		"NUM(type=ord,position=free,representation=mix-rom,WF=trunc)",
		"NUM(type=ord,position=free,representation=rom)",
		"NUM(type=ord,position=free,representation=rom,WF=abbr)",
		"NUM(type=ord,position=free,representation=rom,WF=mis)",
		"NUM(type=ord,position=free,representation=rom,WF=trunc)",
		"NUM(type=ord,position=free,representation=uncl)",
		"NUM(type=ord,position=free,representation=uncl,WF=abbr)",
		"NUM(type=ord,position=free,representation=uncl,WF=mis)",
		"NUM(type=ord,position=free,representation=uncl,WF=trunc)",
		"NUM(type=ord,position=postnom,representation=dig)",
		"NUM(type=ord,position=postnom,representation=dig,WF=abbr)",
		"NUM(type=ord,position=postnom,representation=dig,WF=mis)",
		"NUM(type=ord,position=postnom,representation=dig,WF=trunc)",
		"NUM(type=ord,position=postnom,representation=let)",
		"NUM(type=ord,position=postnom,representation=let,WF=abbr)",
		"NUM(type=ord,position=postnom,representation=let,WF=mis)",
		"NUM(type=ord,position=postnom,representation=let,WF=trunc)",
		"NUM(type=ord,position=postnom,representation=mix-dig)",
		"NUM(type=ord,position=postnom,representation=mix-dig,WF=abbr)",
		"NUM(type=ord,position=postnom,representation=mix-dig,WF=mis)",
		"NUM(type=ord,position=postnom,representation=mix-dig,WF=trunc)",
		"NUM(type=ord,position=postnom,representation=mix-rom)",
		"NUM(type=ord,position=postnom,representation=mix-rom,WF=abbr)",
		"NUM(type=ord,position=postnom,representation=mix-rom,WF=mis)",
		"NUM(type=ord,position=postnom,representation=mix-rom,WF=trunc)",
		"NUM(type=ord,position=postnom,representation=rom)",
		"NUM(type=ord,position=postnom,representation=rom,WF=abbr)",
		"NUM(type=ord,position=postnom,representation=rom,WF=mis)",
		"NUM(type=ord,position=postnom,representation=rom,WF=trunc)",
		"NUM(type=ord,position=postnom,representation=uncl)",
		"NUM(type=ord,position=postnom,representation=uncl,WF=abbr)",
		"NUM(type=ord,position=postnom,representation=uncl,WF=mis)",
		"NUM(type=ord,position=postnom,representation=uncl,WF=trunc)",
		"NUM(type=ord,position=prenom,representation=dig)",
		"NUM(type=ord,position=prenom,representation=dig,WF=abbr)",
		"NUM(type=ord,position=prenom,representation=dig,WF=mis)",
		"NUM(type=ord,position=prenom,representation=dig,WF=trunc)",
		"NUM(type=ord,position=prenom,representation=let)",
		"NUM(type=ord,position=prenom,representation=let,WF=abbr)",
		"NUM(type=ord,position=prenom,representation=let,WF=mis)",
		"NUM(type=ord,position=prenom,representation=let,WF=trunc)",
		"NUM(type=ord,position=prenom,representation=mix-dig)",
		"NUM(type=ord,position=prenom,representation=mix-dig,WF=abbr)",
		"NUM(type=ord,position=prenom,representation=mix-dig,WF=mis)",
		"NUM(type=ord,position=prenom,representation=mix-dig,WF=trunc)",
		"NUM(type=ord,position=prenom,representation=mix-rom)",
		"NUM(type=ord,position=prenom,representation=mix-rom,WF=abbr)",
		"NUM(type=ord,position=prenom,representation=mix-rom,WF=mis)",
		"NUM(type=ord,position=prenom,representation=mix-rom,WF=trunc)",
		"NUM(type=ord,position=prenom,representation=rom)",
		"NUM(type=ord,position=prenom,representation=rom,WF=abbr)",
		"NUM(type=ord,position=prenom,representation=rom,WF=mis)",
		"NUM(type=ord,position=prenom,representation=rom,WF=trunc)",
		"NUM(type=ord,position=prenom,representation=uncl)",
		"NUM(type=ord,position=prenom,representation=uncl,WF=abbr)",
		"NUM(type=ord,position=prenom,representation=uncl,WF=mis)",
		"NUM(type=ord,position=prenom,representation=uncl,WF=trunc)",
		"NUM(type=ord,position=uncl,representation=dig)",
		"NUM(type=ord,position=uncl,representation=dig,WF=abbr)",
		"NUM(type=ord,position=uncl,representation=dig,WF=mis)",
		"NUM(type=ord,position=uncl,representation=dig,WF=trunc)",
		"NUM(type=ord,position=uncl,representation=let)",
		"NUM(type=ord,position=uncl,representation=let,WF=abbr)",
		"NUM(type=ord,position=uncl,representation=let,WF=mis)",
		"NUM(type=ord,position=uncl,representation=let,WF=trunc)",
		"NUM(type=ord,position=uncl,representation=mix-dig)",
		"NUM(type=ord,position=uncl,representation=mix-dig,WF=abbr)",
		"NUM(type=ord,position=uncl,representation=mix-dig,WF=mis)",
		"NUM(type=ord,position=uncl,representation=mix-dig,WF=trunc)",
		"NUM(type=ord,position=uncl,representation=mix-rom)",
		"NUM(type=ord,position=uncl,representation=mix-rom,WF=abbr)",
		"NUM(type=ord,position=uncl,representation=mix-rom,WF=mis)",
		"NUM(type=ord,position=uncl,representation=mix-rom,WF=trunc)",
		"NUM(type=ord,position=uncl,representation=rom)",
		"NUM(type=ord,position=uncl,representation=rom,WF=abbr)",
		"NUM(type=ord,position=uncl,representation=rom,WF=mis)",
		"NUM(type=ord,position=uncl,representation=rom,WF=trunc)",
		"NUM(type=ord,position=uncl,representation=uncl)",
		"NUM(type=ord,position=uncl,representation=uncl,WF=abbr)",
		"NUM(type=ord,position=uncl,representation=uncl,WF=mis)",
		"NUM(type=ord,position=uncl,representation=uncl,WF=trunc)",
		"NUM(type=uncl,position=free,representation=dig)",
		"NUM(type=uncl,position=free,representation=dig,WF=abbr)",
		"NUM(type=uncl,position=free,representation=dig,WF=mis)",
		"NUM(type=uncl,position=free,representation=dig,WF=trunc)",
		"NUM(type=uncl,position=free,representation=let)",
		"NUM(type=uncl,position=free,representation=let,WF=abbr)",
		"NUM(type=uncl,position=free,representation=let,WF=mis)",
		"NUM(type=uncl,position=free,representation=let,WF=trunc)",
		"NUM(type=uncl,position=free,representation=mix-dig)",
		"NUM(type=uncl,position=free,representation=mix-dig,WF=abbr)",
		"NUM(type=uncl,position=free,representation=mix-dig,WF=mis)",
		"NUM(type=uncl,position=free,representation=mix-dig,WF=trunc)",
		"NUM(type=uncl,position=free,representation=mix-rom)",
		"NUM(type=uncl,position=free,representation=mix-rom,WF=abbr)",
		"NUM(type=uncl,position=free,representation=mix-rom,WF=mis)",
		"NUM(type=uncl,position=free,representation=mix-rom,WF=trunc)",
		"NUM(type=uncl,position=free,representation=rom)",
		"NUM(type=uncl,position=free,representation=rom,WF=abbr)",
		"NUM(type=uncl,position=free,representation=rom,WF=mis)",
		"NUM(type=uncl,position=free,representation=rom,WF=trunc)",
		"NUM(type=uncl,position=free,representation=uncl)",
		"NUM(type=uncl,position=free,representation=uncl,WF=abbr)",
		"NUM(type=uncl,position=free,representation=uncl,WF=mis)",
		"NUM(type=uncl,position=free,representation=uncl,WF=trunc)",
		"NUM(type=uncl,position=postnom,representation=dig)",
		"NUM(type=uncl,position=postnom,representation=dig,WF=abbr)",
		"NUM(type=uncl,position=postnom,representation=dig,WF=mis)",
		"NUM(type=uncl,position=postnom,representation=dig,WF=trunc)",
		"NUM(type=uncl,position=postnom,representation=let)",
		"NUM(type=uncl,position=postnom,representation=let,WF=abbr)",
		"NUM(type=uncl,position=postnom,representation=let,WF=mis)",
		"NUM(type=uncl,position=postnom,representation=let,WF=trunc)",
		"NUM(type=uncl,position=postnom,representation=mix-dig)",
		"NUM(type=uncl,position=postnom,representation=mix-dig,WF=abbr)",
		"NUM(type=uncl,position=postnom,representation=mix-dig,WF=mis)",
		"NUM(type=uncl,position=postnom,representation=mix-dig,WF=trunc)",
		"NUM(type=uncl,position=postnom,representation=mix-rom)",
		"NUM(type=uncl,position=postnom,representation=mix-rom,WF=abbr)",
		"NUM(type=uncl,position=postnom,representation=mix-rom,WF=mis)",
		"NUM(type=uncl,position=postnom,representation=mix-rom,WF=trunc)",
		"NUM(type=uncl,position=postnom,representation=rom)",
		"NUM(type=uncl,position=postnom,representation=rom,WF=abbr)",
		"NUM(type=uncl,position=postnom,representation=rom,WF=mis)",
		"NUM(type=uncl,position=postnom,representation=rom,WF=trunc)",
		"NUM(type=uncl,position=postnom,representation=uncl)",
		"NUM(type=uncl,position=postnom,representation=uncl,WF=abbr)",
		"NUM(type=uncl,position=postnom,representation=uncl,WF=mis)",
		"NUM(type=uncl,position=postnom,representation=uncl,WF=trunc)",
		"NUM(type=uncl,position=prenom,representation=dig)",
		"NUM(type=uncl,position=prenom,representation=dig,WF=abbr)",
		"NUM(type=uncl,position=prenom,representation=dig,WF=mis)",
		"NUM(type=uncl,position=prenom,representation=dig,WF=trunc)",
		"NUM(type=uncl,position=prenom,representation=let)",
		"NUM(type=uncl,position=prenom,representation=let,WF=abbr)",
		"NUM(type=uncl,position=prenom,representation=let,WF=mis)",
		"NUM(type=uncl,position=prenom,representation=let,WF=trunc)",
		"NUM(type=uncl,position=prenom,representation=mix-dig)",
		"NUM(type=uncl,position=prenom,representation=mix-dig,WF=abbr)",
		"NUM(type=uncl,position=prenom,representation=mix-dig,WF=mis)",
		"NUM(type=uncl,position=prenom,representation=mix-dig,WF=trunc)",
		"NUM(type=uncl,position=prenom,representation=mix-rom)",
		"NUM(type=uncl,position=prenom,representation=mix-rom,WF=abbr)",
		"NUM(type=uncl,position=prenom,representation=mix-rom,WF=mis)",
		"NUM(type=uncl,position=prenom,representation=mix-rom,WF=trunc)",
		"NUM(type=uncl,position=prenom,representation=rom)",
		"NUM(type=uncl,position=prenom,representation=rom,WF=abbr)",
		"NUM(type=uncl,position=prenom,representation=rom,WF=mis)",
		"NUM(type=uncl,position=prenom,representation=rom,WF=trunc)",
		"NUM(type=uncl,position=prenom,representation=uncl)",
		"NUM(type=uncl,position=prenom,representation=uncl,WF=abbr)",
		"NUM(type=uncl,position=prenom,representation=uncl,WF=mis)",
		"NUM(type=uncl,position=prenom,representation=uncl,WF=trunc)",
		"NUM(type=uncl,position=uncl,representation=dig)",
		"NUM(type=uncl,position=uncl,representation=dig,WF=abbr)",
		"NUM(type=uncl,position=uncl,representation=dig,WF=mis)",
		"NUM(type=uncl,position=uncl,representation=dig,WF=trunc)",
		"NUM(type=uncl,position=uncl,representation=let)",
		"NUM(type=uncl,position=uncl,representation=let,WF=abbr)",
		"NUM(type=uncl,position=uncl,representation=let,WF=mis)",
		"NUM(type=uncl,position=uncl,representation=let,WF=trunc)",
		"NUM(type=uncl,position=uncl,representation=mix-dig)",
		"NUM(type=uncl,position=uncl,representation=mix-dig,WF=abbr)",
		"NUM(type=uncl,position=uncl,representation=mix-dig,WF=mis)",
		"NUM(type=uncl,position=uncl,representation=mix-dig,WF=trunc)",
		"NUM(type=uncl,position=uncl,representation=mix-rom)",
		"NUM(type=uncl,position=uncl,representation=mix-rom,WF=abbr)",
		"NUM(type=uncl,position=uncl,representation=mix-rom,WF=mis)",
		"NUM(type=uncl,position=uncl,representation=mix-rom,WF=trunc)",
		"NUM(type=uncl,position=uncl,representation=rom)",
		"NUM(type=uncl,position=uncl,representation=rom,WF=abbr)",
		"NUM(type=uncl,position=uncl,representation=rom,WF=mis)",
		"NUM(type=uncl,position=uncl,representation=rom,WF=trunc)",
		"NUM(type=uncl,position=uncl,representation=uncl)",
		"NUM(type=uncl,position=uncl,representation=uncl,WF=abbr)",
		"NUM(type=uncl,position=uncl,representation=uncl,WF=mis)",
		"NUM(type=uncl,position=uncl,representation=uncl,WF=trunc)",
		"PD",
		"PD(type=d-p,position=free)",
		"PD(type=d-p,position=free,WF=abbr)",
		"PD(type=d-p,position=free,WF=mis)",
		"PD(type=d-p,position=free,WF=trunc)",
		"PD(type=d-p,position=postnom)",
		"PD(type=d-p,position=postnom,WF=abbr)",
		"PD(type=d-p,position=postnom,WF=mis)",
		"PD(type=d-p,position=postnom,WF=trunc)",
		"PD(type=d-p,subtype=art,position=prenom)",
		"PD(type=d-p,subtype=art,position=prenom,WF=abbr)",
		"PD(type=d-p,subtype=art,position=prenom,WF=mis)",
		"PD(type=d-p,subtype=art,position=prenom,WF=trunc)",
		"PD(type=d-p,subtype=oth,position=prenom)",
		"PD(type=d-p,subtype=oth,position=prenom,WF=abbr)",
		"PD(type=d-p,subtype=oth,position=prenom,WF=mis)",
		"PD(type=d-p,subtype=oth,position=prenom,WF=trunc)",
		"PD(type=d-p,subtype=oth,position=uncl)",
		"PD(type=d-p,subtype=oth,position=uncl,WF=abbr)",
		"PD(type=d-p,subtype=oth,position=uncl,WF=mis)",
		"PD(type=d-p,subtype=oth,position=uncl,WF=trunc)",
		"PD(type=d-p,subtype=uncl,position=prenom)",
		"PD(type=d-p,subtype=uncl,position=prenom,WF=abbr)",
		"PD(type=d-p,subtype=uncl,position=prenom,WF=mis)",
		"PD(type=d-p,subtype=uncl,position=prenom,WF=trunc)",
		"PD(type=d-p,subtype=uncl,position=uncl)",
		"PD(type=d-p,subtype=uncl,position=uncl,WF=abbr)",
		"PD(type=d-p,subtype=uncl,position=uncl,WF=mis)",
		"PD(type=d-p,subtype=uncl,position=uncl,WF=trunc)",
		"PD(type=excl,position=free)",
		"PD(type=excl,position=free,WF=abbr)",
		"PD(type=excl,position=free,WF=mis)",
		"PD(type=excl,position=free,WF=trunc)",
		"PD(type=excl,position=postnom)",
		"PD(type=excl,position=postnom,WF=abbr)",
		"PD(type=excl,position=postnom,WF=mis)",
		"PD(type=excl,position=postnom,WF=trunc)",
		"PD(type=excl,position=prenom)",
		"PD(type=excl,position=prenom,WF=abbr)",
		"PD(type=excl,position=prenom,WF=mis)",
		"PD(type=excl,position=prenom,WF=trunc)",
		"PD(type=excl,position=uncl)",
		"PD(type=excl,position=uncl,WF=abbr)",
		"PD(type=excl,position=uncl,WF=mis)",
		"PD(type=excl,position=uncl,WF=trunc)",
		"PD(type=indef,position=free)",
		"PD(type=indef,position=free,WF=abbr)",
		"PD(type=indef,position=free,WF=mis)",
		"PD(type=indef,position=free,WF=trunc)",
		"PD(type=indef,position=postnom)",
		"PD(type=indef,position=postnom,WF=abbr)",
		"PD(type=indef,position=postnom,WF=mis)",
		"PD(type=indef,position=postnom,WF=trunc)",
		"PD(type=indef,subtype=art,position=prenom)",
		"PD(type=indef,subtype=art,position=prenom,WF=abbr)",
		"PD(type=indef,subtype=art,position=prenom,WF=mis)",
		"PD(type=indef,subtype=art,position=prenom,WF=trunc)",
		"PD(type=indef,subtype=oth,position=prenom)",
		"PD(type=indef,subtype=oth,position=prenom,WF=abbr)",
		"PD(type=indef,subtype=oth,position=prenom,WF=mis)",
		"PD(type=indef,subtype=oth,position=prenom,WF=trunc)",
		"PD(type=indef,subtype=oth,position=uncl)",
		"PD(type=indef,subtype=oth,position=uncl,WF=abbr)",
		"PD(type=indef,subtype=oth,position=uncl,WF=mis)",
		"PD(type=indef,subtype=oth,position=uncl,WF=trunc)",
		"PD(type=indef,subtype=uncl,position=prenom)",
		"PD(type=indef,subtype=uncl,position=prenom,WF=abbr)",
		"PD(type=indef,subtype=uncl,position=prenom,WF=mis)",
		"PD(type=indef,subtype=uncl,position=prenom,WF=trunc)",
		"PD(type=indef,subtype=uncl,position=uncl)",
		"PD(type=indef,subtype=uncl,position=uncl,WF=abbr)",
		"PD(type=indef,subtype=uncl,position=uncl,WF=mis)",
		"PD(type=indef,subtype=uncl,position=uncl,WF=trunc)",
		"PD(type=pers,position=free)",
		"PD(type=pers,position=free,WF=abbr)",
		"PD(type=pers,position=free,WF=mis)",
		"PD(type=pers,position=free,WF=trunc)",
		"PD(type=poss,position=free)",
		"PD(type=poss,position=free,WF=abbr)",
		"PD(type=poss,position=free,WF=mis)",
		"PD(type=poss,position=free,WF=trunc)",
		"PD(type=poss,position=postnom)",
		"PD(type=poss,position=postnom,WF=abbr)",
		"PD(type=poss,position=postnom,WF=mis)",
		"PD(type=poss,position=postnom,WF=trunc)",
		"PD(type=poss,position=prenom)",
		"PD(type=poss,position=prenom,WF=abbr)",
		"PD(type=poss,position=prenom,WF=mis)",
		"PD(type=poss,position=prenom,WF=trunc)",
		"PD(type=poss,position=uncl)",
		"PD(type=poss,position=uncl,WF=abbr)",
		"PD(type=poss,position=uncl,WF=mis)",
		"PD(type=poss,position=uncl,WF=trunc)",
		"PD(type=recip,position=free)",
		"PD(type=recip,position=free,WF=abbr)",
		"PD(type=recip,position=free,WF=mis)",
		"PD(type=recip,position=free,WF=trunc)",
		"PD(type=refl,position=free)",
		"PD(type=refl,position=free,WF=abbr)",
		"PD(type=refl,position=free,WF=mis)",
		"PD(type=refl,position=free,WF=trunc)",
		"PD(type=uncl,position=free)",
		"PD(type=uncl,position=free,WF=abbr)",
		"PD(type=uncl,position=free,WF=mis)",
		"PD(type=uncl,position=free,WF=trunc)",
		"PD(type=uncl,position=postnom)",
		"PD(type=uncl,position=postnom,WF=abbr)",
		"PD(type=uncl,position=postnom,WF=mis)",
		"PD(type=uncl,position=postnom,WF=trunc)",
		"PD(type=uncl,subtype=art,position=prenom)",
		"PD(type=uncl,subtype=art,position=prenom,WF=abbr)",
		"PD(type=uncl,subtype=art,position=prenom,WF=mis)",
		"PD(type=uncl,subtype=art,position=prenom,WF=trunc)",
		"PD(type=uncl,subtype=oth,position=prenom)",
		"PD(type=uncl,subtype=oth,position=prenom,WF=abbr)",
		"PD(type=uncl,subtype=oth,position=prenom,WF=mis)",
		"PD(type=uncl,subtype=oth,position=prenom,WF=trunc)",
		"PD(type=uncl,subtype=oth,position=uncl)",
		"PD(type=uncl,subtype=oth,position=uncl,WF=abbr)",
		"PD(type=uncl,subtype=oth,position=uncl,WF=mis)",
		"PD(type=uncl,subtype=oth,position=uncl,WF=trunc)",
		"PD(type=uncl,subtype=uncl,position=prenom)",
		"PD(type=uncl,subtype=uncl,position=prenom,WF=abbr)",
		"PD(type=uncl,subtype=uncl,position=prenom,WF=mis)",
		"PD(type=uncl,subtype=uncl,position=prenom,WF=trunc)",
		"PD(type=uncl,subtype=uncl,position=uncl)",
		"PD(type=uncl,subtype=uncl,position=uncl,WF=abbr)",
		"PD(type=uncl,subtype=uncl,position=uncl,WF=mis)",
		"PD(type=uncl,subtype=uncl,position=uncl,WF=trunc)",
		"PD(type=w-p,position=free)",
		"PD(type=w-p,position=free,WF=abbr)",
		"PD(type=w-p,position=free,WF=mis)",
		"PD(type=w-p,position=free,WF=trunc)",
		"PD(type=w-p,position=postnom)",
		"PD(type=w-p,position=postnom,WF=abbr)",
		"PD(type=w-p,position=postnom,WF=mis)",
		"PD(type=w-p,position=postnom,WF=trunc)",
		"PD(type=w-p,position=prenom)",
		"PD(type=w-p,position=prenom,WF=abbr)",
		"PD(type=w-p,position=prenom,WF=mis)",
		"PD(type=w-p,position=prenom,WF=trunc)",
		"PD(type=w-p,position=uncl)",
		"PD(type=w-p,position=uncl,WF=abbr)",
		"PD(type=w-p,position=uncl,WF=mis)",
		"PD(type=w-p,position=uncl,WF=trunc)",
		"RES",
		"RES(type=aff)",
		"RES(type=aff,WF=abbr)",
		"RES(type=aff,WF=mis)",
		"RES(type=aff,WF=trunc)",
		"RES(type=bre)",
		"RES(type=bre,WF=abbr)",
		"RES(type=bre,WF=mis)",
		"RES(type=bre,WF=trunc)",
		"RES(type=for)",
		"RES(type=for,WF=abbr)",
		"RES(type=for,WF=mis)",
		"RES(type=for,WF=trunc)",
		"RES(type=form)",
		"RES(type=form,WF=abbr)",
		"RES(type=form,WF=mis)",
		"RES(type=form,WF=trunc)",
		"RES(type=meta)",
		"RES(type=meta,WF=abbr)",
		"RES(type=meta,WF=mis)",
		"RES(type=meta,WF=trunc)",
		"RES(type=oth)",
		"RES(type=oth,WF=abbr)",
		"RES(type=oth,WF=mis)",
		"RES(type=oth,WF=trunc)",
		"RES(type=symb)",
		"RES(type=symb,WF=abbr)",
		"RES(type=symb,WF=mis)",
		"RES(type=symb,WF=trunc)",
		"RES(type=uncl)",
		"RES(type=uncl,WF=abbr)",
		"RES(type=uncl,WF=mis)",
		"RES(type=uncl,WF=trunc)",
		"VRB",
		"VRB(finiteness=fin,tense=past)",
		"VRB(finiteness=fin,tense=past,WF=abbr)",
		"VRB(finiteness=fin,tense=past,WF=mis)",
		"VRB(finiteness=fin,tense=past,WF=trunc)",
		"VRB(finiteness=fin,tense=pres)",
		"VRB(finiteness=fin,tense=pres,WF=abbr)",
		"VRB(finiteness=fin,tense=pres,WF=mis)",
		"VRB(finiteness=fin,tense=pres,WF=trunc)",
		"VRB(finiteness=fin,tense=uncl)",
		"VRB(finiteness=fin,tense=uncl,WF=abbr)",
		"VRB(finiteness=fin,tense=uncl,WF=mis)",
		"VRB(finiteness=fin,tense=uncl,WF=trunc)",
		"VRB(finiteness=inf)",
		"VRB(finiteness=inf,WF=abbr)",
		"VRB(finiteness=inf,WF=mis)",
		"VRB(finiteness=inf,WF=trunc)",
		"VRB(finiteness=pastpart)",
		"VRB(finiteness=pastpart,WF=abbr)",
		"VRB(finiteness=pastpart,WF=mis)",
		"VRB(finiteness=pastpart,WF=trunc)",
		"VRB(finiteness=prespart)",
		"VRB(finiteness=prespart,WF=abbr)",
		"VRB(finiteness=prespart,WF=mis)",
		"VRB(finiteness=prespart,WF=trunc)",
		"VRB(finiteness=uncl,tense=uncl)",
		"VRB(finiteness=uncl,tense=uncl,WF=abbr)",
		"VRB(finiteness=uncl,tense=uncl,WF=mis)",
		"VRB(finiteness=uncl,tense=uncl,WF=trunc)"
	]
};

menus.defaultTagSets["TDN-adapted"] = cloneArray(menus.defaultTagSets["TDN-core"]);


menus.defaultForbiddenFeatCombSet = 
				[
				"NOU-C(number=sg|pl)",
				"NOU-C(number=pl|sg)",
				"ADV(type=reg|pron)",
				"ADV(type=pron|reg)",
				"CONJ(type=coor|sub)",
				"CONJ(type=sub|coor)",
				"NUM(type=card|ord)",
				"NUM(type=ord|card)",
				"PD(type=d-p,subtype=art|oth)",
				"PD(type=d-p,subtype=oth|art)",
				"PD(type=indef,subtype=art|oth)",
				"PD(type=indef,subtype=oth|art)",
				"VRB(finiteness=fin,tense=pres|part)",
				"VRB(finiteness=fin,tense=part|pres)",
				"VRB(finiteness=fin|inf,tense=uncl)"
				];
				
				
				


// ***************************************************************************
// **
// ** DIALOGS FUNCTIONS (based on Lex'it function, but modified a bit!)
// **
// ***************************************************************************			

menus.prompt = function(sTitle, aFieldNames, aValues, fnFunction, fnCancelFunction, bTextarea, aColsAndRows, aDim){
	
	fn._clearUserInput();

	// list of datepickers to be activated when diolog is opened
	var aDatePickersIds = [];

	// deal with title/message input
	var sMessage = "";
	if ( $.isArray(sTitle) ) {
		sMessage = sTitle[1];
		sTitle = sTitle[0];
	}
	var sMessageP = $("<p></p>").html(sMessage);	

	if (bTextarea == null) 
		bTextarea = false;
	
	var promptDivId = "dialog-message"+getUniqueNumber();
	
	var promptDiv = $("<div></div>") 
		.attr("id", promptDivId)
		.attr("title", sTitle)
		.css("font-size", "12px")
		.append(sMessageP);
	
	var promptForm = $("<form></form>");
	var promptFieldSet = $("<fieldset></fieldset>");
	for (var i=0; i<aFieldNames.length; i++) {
		// should the input field be editable?
		var bFixedValue = false;
		// datepicker?
		var bDatePicker = false;
		// textarea type
		var bOneTextarea = false;

		if (aValues != null && 
				(aValues[i] instanceof String || typeof aValues[i] === "string") ) { // make sure we have a string, or this will crash!
			bFixedValue = (aValues[i]).indexOf("::disabled")>-1;
			bDatePicker = (aValues[i]).indexOf("::datepicker")>-1;
			bOneTextarea = (aValues[i]).indexOf("::textarea")>-1;
			aValues[i] = (aValues[i]).split("::")[0];
		}

		
		// should the input field be an select box?
		// (in that case we expect the value at the current index i to contain an array of values to select from)
		var bSelectBox = (aValues != null && typeof aValues[i] === 'object');
		// or a checkbox?
		var bCheckBox = (aValues != null && typeof aValues[i] === 'boolean');
		
		var fieldLC = $.trim( keepOnlyLettersAndDigits(aFieldNames[i].toLowerCase()) );
		var label = $("<label></label>")
			.attr("for", fieldLC)
			.text($.trim(aFieldNames[i]));
		
		
		// now build the input field
		
		var input;
		
		// select box type
		
		if (bSelectBox) {
			input = $("<select></select>")
			.attr("id", "prompt_"+fieldLC)
			.prop('disabled', bFixedValue);
			
			// build the options to select 
			for (var j=0; j<aValues[i].length; j++) {
				var sThisValue = aValues[i][j];
				var bSelected = sThisValue.indexOf("::selected")>-1; // pre-selection!
				sThisValue = sThisValue.replace("::selected", "");
				var thisOption = $("<option></option>")
					.attr("value", sThisValue)
					.text(sThisValue);
				if (bSelected)
					thisOption.attr('selected','selected');
				$(input).append(thisOption);
			}
		}
		
		// checkbox field type
		
		else if (bCheckBox) {
			input = $("<input></input>")
			.attr("id", "prompt_"+fieldLC)
			.attr("type", "checkbox" )
			.val(aValues[i])
			.prop("checked", aValues[i])
			.change(function(){ 
				$(this).val( $(this).prop("checked") ); 
				// beware: the checked attribute is string typed somehow
			});
		}
		
		// text field type
		
		else {
			var sInputType = (bTextarea || bOneTextarea) ? "textarea" : "input";
			input = $("<"+sInputType+"></"+sInputType+">")
				.attr("type", "text" )
				.attr("name", fieldLC)
				.attr("id", "prompt_"+fieldLC)
				.prop('disabled', bFixedValue);
			
			// preset the input value, if available
			if ((bTextarea || bOneTextarea)) {
				input.text(aValues!=null ? aValues[i]: ""); // textarea
			}
			else {
				input.val(aValues!=null ? aValues[i]: "");  // input
				input.css("width", "95%");					// prevent small fields
			}
			
			// if cols and rows are given, set them!			
			if ((bTextarea || bOneTextarea) && aColsAndRows!= null && aColsAndRows.length ==2){
				input.attr("cols", aColsAndRows[0]);
				input.attr("rows", aColsAndRows[1]);
			}

			// add datepicker is needed
			if (bDatePicker) {
				aDatePickersIds.push( "prompt_"+fieldLC );
			}
			
		}				
		
		// append the current field
		
		promptFieldSet.append(label);
		promptFieldSet.append($("<br/>"));
		promptFieldSet.append(input);
		promptFieldSet.append($("<br/>"));
		promptFieldSet.append($("<br/>"));
	}
	promptForm.append(promptFieldSet);
	promptDiv.append(promptForm);
	
	$(document.body).append(promptDiv);
	
	// array of buttons
	var aButtons = [];
	
	// Put a OK button only if we have a callback function, even an empty one
	if (fnFunction != null){
		aButtons.push({
       	 text: lang.ok,
		 class: "cobaltgreen cobaltbutton",
    	 click: function(){
    		 
    		var aPromptResponse = {}; 
     		for (var i=0; i<aFieldNames.length; i++)
    		{
     			// fieldname
     			var thisFieldName = $.trim(aFieldNames[i]);
     			
     			// value for this field, entered by the user
    			var fieldLC = $.trim( keepOnlyLettersAndDigits(aFieldNames[i].toLowerCase()) );
    			// read value for this field
    			// first try special case (select box), and then the normal case (text)
    			var thisValue = $("#"+promptDivId+" #prompt_"+fieldLC).children("option:selected").val();
    			if (thisValue == null) { thisValue = $("#"+promptDivId+" #prompt_"+fieldLC).val(); }
    			
    			
    			// compute output for fn.getPromptBoxInput
    			// (we keep this mainly for backwards compatibility, since we had no response in callback in the past)
    			fn._registerUserInput(                					
    					thisFieldName,                					
    					thisValue, 
    					// index of this field/value 
    					i
    					);
    			// compute response as well, to be easily used in callback
    			aPromptResponse[thisFieldName] = thisValue;
    			
    		}
     		$( this ).dialog( "close" );  
    		// call callback
     		fnFunction(aPromptResponse); 
    		              		
    	},
    	id: 'dialog_accept_button'
       });
	}
	
	// A cancel button is always needed
	aButtons.push({
    	text: lang.cancel,
		class: "cobaltred cobaltbutton",
    	click: function() {
    		$( this ).dialog( "close" );
    		// call callback upon Cancel
    		if (fnCancelFunction != null)
    			fnCancelFunction(); 
            
        }
	});
	
	
	// Open dialog	
	// Important detail: Pressing enter should trigger click on OK button
	// cross-browser implementation: http://stackoverflow.com/questions/868889/submit-jquery-ui-dialog-on-enter
	// only change is use of keyup instead of keypress, otherwise it doesn't work in some cases
	$( "#"+promptDivId ).dialog({
		autoOpen: false,
		height: "auto",
		maxHeight: $(window).height(),
        width: (aDim != null ? aDim[0]: "auto"), // 600
		height: (aDim != null ? aDim[1]: "auto"),// 500,
        modal: false,
        open: function( event, ui ){
			// remove close button (cancel is enough)
			$(".ui-dialog-titlebar-close").hide();
			// add shadows
        	$(".ui-dialog").addClass("ui-dialog-shadow");
        	$( this ).closest(".ui-dialog").putInFront();

			$(".ui-dialog-titlebar").addClass("cobaltbalkcolor").css("color", "#FFFFFF");
        },
        close: function(event, ui){
        	$( this ).remove();        	
        },
        position: fn._computeDialogPosition(),
        buttons: aButtons
	}) 
	.keyup(function() {		 
		if (	kf.isPressed("enter") && 
				// enter when selecting from autocomplete mustn't trigger closing dialog
				// (in case an autocomplete has been set for this prompt)
				!$(".ui-autocomplete-input").elementExists() 
				) {		
			$( "#dialog_accept_button" ).click();
			return false;
		}
	});
	
	$( "#"+promptDivId ).dialog( "open" );

	// activate the datepickers
	setTimeout(function(){
		for (var i=0; i<aDatePickersIds.length; i++){
			$( "#" + aDatePickersIds[i] ).datepicker({
				dateFormat: "dd-mm-yy"
			});
		}
	}, 1000);

	if ( $.inArray( $(':focus').attr("id"), aDatePickersIds ) == 0)
		$(':focus').blur();
	
};



menus.confirm = function(sTitle, sMessage, fnFunction, fnCancelFunction){
	
	if (fnFunction == null) {
		fn.message(lang.error, 
			lang.error_when_calling+" menus.confirm().<BR>"+
			lang.error_function_called_with_illegal_value+". "+
			lang.error_function_called_with_illegal_value_expected+ ":  callback (fnFunction=null).");
	}
	else {
		var sP = $("<p></p>").html(sMessage);
		var dialogDivId = "dialog-message"+getUniqueNumber();
		var sDiv = $("<div></div>").attr("id",dialogDivId).attr("title", sTitle).append(sP);
		
		$(document.body).append(sDiv);
		
		$( "#"+dialogDivId ).dialog({
			modal: true,
			width: "auto",
			open: function(event, ui){
				// remove close button (cancel is enough)
				$(".ui-dialog-titlebar-close").hide();
				// add shadows
				$(".ui-dialog").addClass("ui-dialog-shadow");
	        	$( this ).closest(".ui-dialog").putInFront();

				$(".ui-dialog-titlebar").addClass("cobaltbalkcolor").css("color", "#FFFFFF");
			},
			close: function(event, ui){
				$( this ).remove();
			},
			position: fn._computeDialogPosition(),
			buttons: [
			          {
			        	 text: lang.yes,
						class: "cobaltgreen cobaltbutton",
			        	 click: function() {
								$( this ).dialog( "close" );					
								fnFunction();
						},
					    id: 'dialog_accept_button'
			          },
			          {
			        	  text: lang.no,
						  class: "cobaltred cobaltbutton",
			        	  click: function() {
								$( this ).dialog( "close" );
								if (fnCancelFunction!=null)
									fnCancelFunction();
								}
			          }
			]		
		});
		
		fn._activeEnterForThisDialog(dialogDivId);
	}
	
};




menus.message = function(sTitle, sMessage, fnFunction, bOkButton, bCloseButton){
	
	if (bCloseButton == null) bCloseButton = false;
	
	var sP = $("<p></p>").html(sMessage);
	var dialogDivId = "dialog-message"+getUniqueNumber();
	var sDiv = $("<div></div>").attr("id", dialogDivId).attr("title", sTitle).append(sP);
	
	$(document.body).append(sDiv);
	
	var aButtons = [];
	if (bOkButton != false){
		aButtons.push({			
		        	  text: lang.ok,
					  class: "cobaltgreen cobaltbutton",
		        	  click: function() {
						$( this ).dialog( "close" );
						
						if (fnFunction != null) {
							fnFunction();
						}
		        	  },
		        	  id: 'dialog_accept_button'
		          });
	}
	
	$( "#"+dialogDivId ).dialog({
		modal: false,
		width: "auto",
		open: function(event, ui){
			// remove close button (cancel is enough)
			$(".ui-dialog-titlebar-close").hide();
			// add shadows
			$(".ui-dialog").addClass("ui-dialog-shadow");
        	$( this ).closest(".ui-dialog").putInFront();

			$(".ui-dialog-titlebar").addClass("cobaltbalkcolor").css("color", "#FFFFFF");
		},
		close: function(event, ui){
			$( this ).remove();
		},
		position: fn._computeDialogPosition(),
		buttons: aButtons
	});
	
	if (!bOkButton)
		fn._activeEnterForThisDialog(dialogDivId);
};



menus.customPrompt = function(sTitle, sHtml, fnFunction, fnCancelFunction, aDim){
	
	var promptDivId = "dialog-message"+getUniqueNumber();
	
	var promptDiv = $("<div></div>") 
		.attr("id", promptDivId)
		.attr("title", sTitle)
		.css("font-size", "12px")
		.append(sHtml);
	
	$(document.body).append(promptDiv);
	
	// array of buttons
	var aButtons = [];
	
	// Put a OK button only if we have a callback function, even an empty one
	if (fnFunction != null){
		aButtons.push({
       	 text: lang.ok,
		 class: "cobaltgreen cobaltbutton",
    	 click: function(){
    		
     		$( this ).dialog( "close" );
  
    		// call callback
     		fnFunction(); 
    		              		
    	},
    	id: 'dialog_accept_button'
       });
	}
	
	// A cancel button is always needed
	aButtons.push({
    	text: lang.cancel,
		class: "cobaltred cobaltbutton",
    	click: function() {
    		$( this ).dialog( "close" );

    		// call callback upon Cancel
    		if (fnCancelFunction != null)
    			fnCancelFunction(); 
            
        }
	});
	
	
	// Open dialog	
	// Important detail: Pressing enter should trigger click on OK button
	// cross-browser implementation: http://stackoverflow.com/questions/868889/submit-jquery-ui-dialog-on-enter
	// only change is use of keyup instead of keypress, otherwise it doesn't work in some cases
	$( "#"+promptDivId ).dialog({
		autoOpen: false,
		height: "auto",
		maxHeight: $(window).height(),
        width: (aDim != null ? aDim[0]: "auto"), 
		height: (aDim != null ? aDim[1]: "auto"),
        modal: false,
        open: function( event, ui ){
			// remove close button (cancel is enough)
			$(".ui-dialog-titlebar-close").hide();
			// add shadows
        	$(".ui-dialog").addClass("ui-dialog-shadow");
        	$( this ).closest(".ui-dialog").putInFront();

			$(".ui-dialog-titlebar").addClass("cobaltbalkcolor").css("color", "#FFFFFF");
        },
        close: function(event, ui){
        	$( this ).remove();        	
        },
        position: fn._computeDialogPosition(),
        buttons: aButtons
	}) 
	.keyup(function() {		 
		
	});
	
	$( "#"+promptDivId ).dialog( "open" );

	
};

