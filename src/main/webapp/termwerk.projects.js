


termproj = {};




termproj.settings = {
		
	"nice_name": "Mijn projecten",
	
	"top": sTableTopPosition,
	"left": "20px",
	"main_search": false,
	
	"viewtype_button": false,
	"export_buttons": false,
	"pagination_on_top": false,
	"width": sTableTermBankWidth,
	
	"columns_button": bLexitButtonTest,
	"goto_button": bLexitButtonTest,
	"refresh_button": bLexitButtonTest,
	"replace_button": bLexitButtonTest,
	"reset_button": bLexitButtonTest,
	"selection_button": bLexitButtonTest,
	"undo_button": bLexitButtonTest,
	"help_button": bLexitButtonTest,
	
	"exact_count": true,
	
	"resizable": false,
	
	"formgrid": {
		"definition": [30, 20],
		"bgcolor": "#EFEFEF",
		
		"searchbar": false,
		
		// form horizontal alignment
		"align": "center",
		
		// buttons bar undo/save
		"buttonsbar_position": [iProjectFormBaseX+4, iProjectFormBaseY +7*iProjectFormHeight],
		
		// update the user rights after saving the project
		"save_callback": function(t){
			util.updateUsersHavingAccess();
		},
		
		
		// static text			
		"textblocks": {
			
			"form title": {
				"text": "Details van geopend project",
				"position": [iProjectFormBaseX+1, iProjectFormBaseY -1*iProjectFormTotalHeight],
				"definition": [iProjectFormWidth, iProjectFormHeight]
			}
		},
		
		// cells
		"cells": {
			"project_id": {
				"position": "hidden",
				"synchronize_with": {"medewerkers": "project_id"}
			},
			
			
			"projectname": {
				"class": "horizontaal_cell", // display label and value as a row
				"nice_name": "projectnaam",
				//"bgcolor": "#EEFF41",
				"editable": true,
				"position": [iProjectFormBaseX, iProjectFormBaseY],
				"definition": [iProjectFormWidth, iProjectFormTotalHeight]
			},
			"description": {
				"class": "horizontaal_cell", // display label and value as a row
				//"bgcolor": "#EEFF41",
				"nice_name": "beschrijving",
				"editable": true,
				"position": [iProjectFormBaseX, iProjectFormBaseY +1*iProjectFormTotalHeight],
				"definition": [iProjectFormWidth, iProjectFormTotalHeight]
			},
			"creation_date": {
				"visible": true,  // override table setting
				"class": "horizontaal_cell", // display label and value as a row
				"nice_name": "aangemaakt",
				"position": [iProjectFormBaseX, iProjectFormBaseY +2*iProjectFormTotalHeight],
				"definition": [iProjectFormWidth, iProjectFormTotalHeight],
				"render": function(sValue) {
					return util.shortDateFormat(sValue);
				}
			},
			"last_modification": {
				"class": "horizontaal_cell", // display label and value as a row
				"nice_name": "laatste wijziging",
				"position": [iProjectFormBaseX, iProjectFormBaseY +3*iProjectFormTotalHeight],
				"definition": [iProjectFormWidth, iProjectFormTotalHeight],
				"render": function(sValue) {
					return util.shortDateFormat(sValue);
				}
			},
			"license": {
				"visible": true,  // override table setting
				"class": "horizontaal_cell", // display label and value as a row
				"nice_name": "licentie",
				//"bgcolor": "#D9EAD3",
				"editable": true,
				"position": [iProjectFormBaseX, iProjectFormBaseY +4*iProjectFormTotalHeight],
				"definition": [iProjectFormWidth, iProjectFormTotalHeight]
			},
			
			
			
			"corpora": {
				"class": "horizontaal_cell", // display label and value as a row
				"nice_name": "corpora",
				"position": [iProjectFormBaseX +12, iProjectFormBaseY],
				"definition": [iProjectFormWidth, iProjectFormTotalHeight]
			},
			"terms_lists": {
				"class": "horizontaal_cell", // display label and value as a row
				"nice_name": "termenlijsten",
				"position": [iProjectFormBaseX +12, iProjectFormBaseY +1*iProjectFormTotalHeight],
				"definition": [iProjectFormWidth, iProjectFormTotalHeight]
			},
			"terms_in_termsbank": {
				"class": "horizontaal_cell", // display label and value as a row
				"nice_name": "termen in termenbank",
				"position": [iProjectFormBaseX +12, iProjectFormBaseY +2*iProjectFormTotalHeight],
				"definition": [iProjectFormWidth, iProjectFormTotalHeight]
			}
		},
		
		"buttons": {
						
		},
		
		"lists": {
				
			"medewerkers": {
				
				"position": [iProjectFormBaseX +12, iProjectFormBaseY +3.5*iProjectFormTotalHeight],
				"definition": [10, 8],				
				
				"buttons": {
					"add": {
						"title": "Voeg medewerker toe",
						"copy": {
							"project_id": {"form": "project_id"}
						}
					},
					"delete": true
				},
				
				"table": {
					
					"name": "medewerkers",
					
					"callback": function(t){
					
						// make sure that the owner is not deletable
						var nOwnRow = lists.getRow(t, {"role": "Eigenaar"});
						if (nOwnRow != null) {						
							$(nOwnRow).find("td:last").empty(); // remove the 'delete' button in the last column
						}
					},
					
					"columns_sorting": {"naam": "asc"},
					"columns": {
						"user_id": {
							"visible": false
						},
						"username": {
							"nice_name": "gebruikersnaam"
						},
						"project_id": {
							"visible": false
						},
						"role": {
							"nice_name": "rol",
							"choosefrom": ["Eigenaar", "Bewerker", "Kijker"],
							
						},
						"e_mail": {
							"visible": false
						}
						
					}					
				}
				
			} // end of collaborators list
		} // end of lists
		
	}, // end of formgrid declaration
	
	
	"columns_sorting": {"projectname": "asc"},
	
	"columns_order": ["pkid", "btn_open", 
					"project_id", "projectname", "role", 
					"description", "status", 
					"creation_date", "last_modification", 
					"license", 
					"corpora", "terms_lists", "terms_in_termsbank"],
	
	
	"buttons": {
		
		"Nieuw project": {
			
			"class": "table_header_button",
			"click": function(t){
				
				fn.prompt("Nieuw project", ["Projectnaam"], [""], function(resp){
					
					var sNewProjectName = resp["Projectnaam"];
					
					// Create unique schema name to put the project into
					var sCleanProjectName = sNewProjectName.replace(/[^a-zA-Z]+/g, "").toLowerCase();													
					var sNewProjectNameUnique = sCleanProjectName.substring(0, 3) + getUniqueNumber();
					
					
					// Reset the field selection
					// (otherwise we will inhered the selection of the project that was opened just before!)
					for (var sLevelName in termfieldselector.user_settings){
						termfieldselector.user_settings[sLevelName]["selection"] = cloneArray(termfieldselector.defaults[sLevelName]["default_selection"])	
					}					
					
					// Set up project
					$.ajax({
											
						"type": "GET",
						"url": uTermServeInstanceUrl + "webservice/api/setup",
						"data": {
							"username": fn.getCurrentUser(),
							"project_id": sNewProjectNameUnique,
							"project_name": sNewProjectName,
							"dummy": getUniqueNumber()
						},
						"dataType": "xml", // get response as xml
						"success": function(xml) {
							
							fn.message("Project aangemaakt", "Het project '" + sNewProjectName + "' is aangemaakt.", function(){
								
								fn.addDrawCallback(t, function(){
									
									// first hide the open button (it will be visible again after the callback is executed)
									$("tr#"+sNewProjectNameUnique).find("td.btn_open").find("button").css("opacity", 0);
									
									console.log("goto callback");
									
									setTimeout(function(){
										
										fn.addDrawCallback(t, function(){
											console.log("select callback");
											
											// Lex'it will highlight the first active row, so wait a bit, unselect all rows, and then select the new one 
											setTimeout(function(){
												fn.unselectAllRowNodes(t);
												
												var nRow = fn.getRowNodeWhere(fn.getTableName(t), {"project_id": sNewProjectNameUnique});											
												fn.selectRowNode(nRow);	
												
												// now make the open button visible again
												$("tr#"+sNewProjectNameUnique).find("td.btn_open").find("button").css("opacity", 1);
											}, 100);
											
										});
										
										fn.goToTheRightPage(fn.getTableName(t), "project_id", sNewProjectNameUnique);										
										
									}, 1000); // allow the project creation to complete before querying its row location
								});
								
								
								// it is needed to go back to the table view, 
								// as a project has to be opened with the "open" to behave as expected (setSchema etc.)
								if (fn.getViewType(t) == "form"){
									fn.toggleViewType(t);
								}
								else {
									console.log("no toggle but refresh");
									fn.refreshTable(t);
								}
							});
							
						},
						"error": function(jqXHR, textStatus, errorThrown){
				
							alert("Project setup went wrong!");
						}
				
					});
					
				});
				
			}
			
		},
		
		"Verwijderen": {
			
			"class": "table_header_button danger",
			"click": function(t){
				
				termproj.removeProject(t);
				
			}
			
		},
		
		"Archiveren": {
				"class": "table_header_button",				
				"click": function(t) {
					
					var nRow = util.getBestRow(t);
					
					if (nRow == null || sCurrentRole != "Eigenaar"){
						fn.message("Let op", "Archiveren/heractiveren kan alleen door de eigenaar van het project.");
						return;
					}
					else {
						
						var sProjectName = fn.getDataFromCellInRowNode(nRow, "projectname");	
						
						if (sProjectStatus == "gearchiv.") {
							
							fn.confirm("Heractiveer project", "Weet u zeker dat u project '"+sProjectName+"' wilt heractiveren?", 
								function(){	
									
									fn.updateTableGivenANode(nRow, {"status": "actief"}, 
										function(){
											fn.message("Project heractiveerd", 
												"Het project '" + sProjectName + "' is heractiveerd."+
												"<BR><BR>"+
												"De projectlijst zal nu worden ververst.", function(){
												
												fn.closeTable(t, function(){
													util.closeSchema(null, function(){
														fn.callTable(t, {}, function(){}, { "viewtype": "table" });														
													});
													
												});
											});
										}, 
										function(err){
											alert("Het heractiveren van het project ging mis!");
										});
															
								}, 
								function(){
									// cancel
									
								}
							);// end of confirm dialog
							
						}
						else {
							
							fn.confirm("Archiveer project", "Weet u zeker dat u project '"+sProjectName+"' wilt archiveren?", 
								function(){	
									
									fn.updateTableGivenANode(nRow, {"status": "gearchiv."}, 
										function(){
											fn.message("Project gearchiveerd", 
												"Het project '" + sProjectName + "' is gearchiveerd."+
												"<BR><BR>"+
												"De projectlijst zal nu worden ververst.", function(){
												
												fn.closeTable(t, function(){
													util.closeSchema(null, function(){
														fn.callTable(t, {}, function(){}, { "viewtype": "table" });														
													});
													
												});
											});
										}, 
										function(err){
											alert("Het archiveren van het project ging mis!");
										});
															
								}, 
								function(){
									// cancel
									
								}
							);// end of confirm dialog
							
						}							
												
						
					}
					
				}
			}
	},
	
	
		
	
					
	"close_callback": function(t){
		
		// if we are closing the table FORM view, 
		// we should automatically get back to the TABLE view 
		
		var sViewType = fn.getViewType(t);		
		var bActiveInsideProject = $("#current_project_div").hasClass("active");
		
		setTimeout(function(){
					
			// 1. if we come from the project details (form) view, we should go back to the table view 
			// but
			// 2. if we are active within a project, closing the projects table should do nothing
			if ( sViewType == "form" && !bActiveInsideProject ) {
				
				util.closeSchema(null, function(){
					fn.callTable(t, {}, function(){}, { "viewtype": "table" });
				});				
			}				
						
		}, 500);
		
		
	},
	
	"resize_callback": function(t, ui){
		form.updateLayout(t, true, false);
	},
	
	"callback": function(t){
		
		// put the free buttons in the middle of the header
		util.putFreeButtons(t);
		
		// remove unneeded elements like rows counting etc.
		// and
		// show or hide buttons depending on the view
		if (fn.getViewType(t) == "form") {
			$("#"+fn.getTableName(t)+"_wrapper .top").find(".dataTables_info").text("");
			$("#"+fn.getTableName(t)+"_wrapper .top").find(".dataTables_length").hide();
			$("#"+fn.getTableName(t)+"_wrapper").find(".paging_full_numbers").hide();
			
			util.disableButton(t, "Nieuw project");
			util.showButton(t, "Verwijderen");
			util.showButton(t, "Archiveren");
			
			// set the right label for the "Archiveren" button, given the current project status
			// and disable the form if the project is archived
			if (sProjectStatus == "gearchiv.") {
				fn.setFreeButtonName("projecten", "Archiveren", "Heractiveren");
				$("div#projecten_form").css({
					'pointer-events': 'none', 
					'opacity': '0.5' // Optional visual feedback
				});
			}
			else {
				fn.setFreeButtonName("projecten", "Archiveren", "Archiveren");
				$("div#projecten_form").css({
					'pointer-events': 'auto', 
					'opacity': '1'
				});
			}
			
		}
		else {			
			util.showButton(t, "Nieuw project");
			util.hideButton(t, "Verwijderen");
			util.hideButton(t, "Archiveren");
		}
		
		// set visibility of header buttons in view form
		if (fn.getViewType(t) == "form") {
			$("#"+fn.getTableName(t)+"_wrapper").find("#"+fn.getTableName(t)+"_custombutton_1").hide();
		}
		else {
			$("#"+fn.getTableName(t)+"_wrapper").find("#"+fn.getTableName(t)+"_custombutton_1").show();
		}
	},
	"repeat_callback": true
	
	
}; // end of projecten table settings
	
	
	
termproj.config = {
	
	"*": {
		"bgcolor": "#ffffff"
	},
	
	"pkid": {
		"visible": false
	},
	
	"btn_open": {
		"nice_name": "",
		"class": "cell_button",
		"button": "Open",
		"click": function(t, n){
			
			// which project is this?
			var sProjectId = fn.getDataFromSiblingNode(n, "project_id");
			
			var sProjectName = fn.getDataFromSiblingNode(n, "projectname");
			
			// send info to the plausible analytics
			var aPlausibleInfo = new Array();
			aPlausibleInfo.push("project_id: " + sProjectId);
			aPlausibleInfo.push("project_name: " + sProjectName);
			plausible( 'TermWerk', {props: aPlausibleInfo} );
			
			
			// set current role, as that determines if fields need to be editable or not
			// (this is a global variable, and its correct value in a particular project can be read in the table view op 'Mijn projecten')
			// so... no 'var' because global 
			sCurrentRole = fn.getDataFromSiblingNode(n, "role");
			
			// project status is a global var as well 
			sProjectStatus = fn.getDataFromSiblingNode(n, "status");
			
			
			
			if (sProjectStatus == "gearchiv.") {
				
				if (sCurrentRole == "Eigenaar") {
					fn.message("Let op", "Dit project is gearchiveerd.<BR><BR>Indien gewenst, kunt u het project heractiveren.");
				}
				
				// collaborators and viewers can't do anything 
				else {
					fn.message("Let op", "Dit project is gearchiveerd. U kunt het project niet openen.");
					// stop right away (= don't open the project, leave the function)
					return;
				}
				
			}
			
			
			util.setProjectLabel(sProjectId, sProjectName); 
			
			// the form must be editable if the role is "Eigenaar",
			// otherwise it must be read-only
			
			var sTableName = fn.getTableName(t);				
			var bEditable = (sCurrentRole == "Eigenaar");
			oTableSettingsList[sTableName]["formgrid"]["lists"]["medewerkers"]["table"]["columns"]["role"]["editable"] = bEditable;
			oTableSettingsList[sTableName]["formgrid"]["cells"]["projectname"]["editable"] = bEditable;
			oTableSettingsList[sTableName]["formgrid"]["cells"]["description"]["editable"] = bEditable;
			oTableSettingsList[sTableName]["formgrid"]["cells"]["license"]["editable"] = bEditable;				
			oTableSettingsList[sTableName]["formgrid"]["lists"]["medewerkers"]["buttons"] = 
				(bEditable ? 
				 	{
						"add": {
							"title": "Voeg medewerker toe",
							"copy": {
								"project_id": {"form": "project_id"}
							}
						},
						"delete": true
					}
					:
					{}
				);
			
			// update project functions
			var sFnUpdateUrl = uTermServeInstanceUrl + "webservice/api/"+ "update_project_functions";
			fn.callService(sFnUpdateUrl, {"project_id": sProjectId, "username": fn.getCurrentUser()}, "GET", null, function(xml){
				
				// update the project stats
				var sProjStatsUrl = uTermServeInstanceUrl + "webservice/api/"+ "get_project_stats";
				fn.callService(sProjStatsUrl, {"project_id": sProjectId, "username": fn.getCurrentUser()}, "GET", null, function(xml){
					
					setTimeout(function(){
					
						fn.closeTable(t, function(){
							
							// set schema
							fn.setSchema(sProjectId, 
							
								function(){
									
									// load tables silently: this is needed 
									// for the form views, which need to know the table columns etc
									// before those tables are loaded.
									 
									for (sOneTable in oTableSettingsList){								
										// skip current table
										if (sOneTable == "projecten") continue;
										// load silently				
										fn.callTableSilently(sOneTable);										
									}
									
									// set visibility defaults
									termfieldselector.updateFieldsVisibility();
									
									// since we have opened a project now, we can enable the buttons
									// (of course only if the project is not archived!)
									if (sProjectStatus != "gearchiv."){								
										$("#my_corpora").removeClass("disabled");
										$("#my_termlists").removeClass("disabled");
										$("#my_termbank").removeClass("disabled");
									}
									
									$("#my_projects").removeClass("active");								
									$("#current_project_div").addClass("active");
									
									// set language selector (global)
									conf.changeTableConfigValue("termbank_taalselectie", "taal", "choosefrom", aLanguageNames);
									
									// open project table							
									fn.callTable(t, {"project_id": sProjectId}, function(){}, {"viewtype": "form"});							
								},
								function(err){
									fn.message("Oei oei!", "Het project kon niet worden geopend.");
								}
							);		
							
						});
						
					}, 500);
					
				});
				
				
			});
			
			
			
			 
			
		}
	},
    "project_id": {
		
		"visible": false
	},
    "projectname": {
		"nice_name": "projectnaam"
	},
    "role": {
		"nice_name": "mijn rol"
	},
    "description": {
		"nice_name": "beschrijving"
	},
    "status": {},
    "creation_date": {
		"visible": false
	},
    "last_modification": {
		"nice_name": "laatste wijziging",
		"render": function(sValue) {
			return util.shortDateFormat(sValue);
		}
	},
    "license": {
		"visible": false
	},
    "corpora": {},
    "terms_lists": {
		"nice_name": "termenlijsten"
	},
    "terms_in_termsbank": {
		"nice_name": "termen in termenbank"
	}
	
}; // end of projecten table configuration


termproj.removeProject = function(t){
	
	var nRow = fn.getFirstSelectedRowNodeFrom(t) ?? fn.getFirstRowNodeFrom(t);
					
	if (nRow == null || fn.getDataFromCellInRowNode(nRow, "role") != "Eigenaar"){
		fn.message("Let op", "Verwijderen kan alleen door de eigenaar van het project.");
		return;
	}
	else {
		
		var sProjectId = fn.getDataFromCellInRowNode(nRow, "project_id");
		var sProjectName = fn.getDataFromCellInRowNode(nRow, "projectname");
								
		fn.confirm("Verwijder project", "Weet u zeker dat u project '"+sProjectName+"' wilt verwijderen?", 
			function(){	
				
				// get rid of the project cookies
				//termfieldselector.deleteSelectionToCookie();  // NOT NEEDED ANYMORE 

	            // remove the project from the database
				$.ajax({
							
					"type": "GET",
					"url": uTermServeInstanceUrl + "webservice/api/remove",
					"data": {
						"username": fn.getCurrentUser(),
						"project_id": sProjectId,
						"dummy": getUniqueNumber()
					},
					"dataType": "xml", // get response as xml
					"success": function(xml) {
						
						fn.message("Project verwijderd", 
							"Het project '" + sProjectName + "' is verwijderd."+
							"<BR><BR>"+
							"De projectlijst zal nu worden ververst.", function(){							
								util.closeSchema(null, function(){
									fn.closeAllTables(function(){
										fn.callTable("projecten", {}, function(){}, { "viewtype": "table"});	
									});
									
								});
							}
						);
						
					},
					"error": function(jqXHR, textStatus, errorThrown){
			
						alert("Het verwijderen van het project ging mis!");
					}
			
				});		
										
			}, 
			function(){
				// cancel				
			}
			
		);
		// end of confirm dialog
			
	}
};