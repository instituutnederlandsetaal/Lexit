var lexitusers = {}



// kind of global storage for overview of users and roles
lexitusers.overviewOfUsersAndRoles;	




/**
 * Delete a project role for a user (after confirmation)
 * This function is called when clicking a red cross next to a project role in the overview
 */
lexitusers.dropProjectRoleForUser = function(project, username){	
	
	fn.confirm(lang.admingui_drop_projectrole_title, (lang.admingui_drop_projectrole_msg).replace(/USERNAME/g, username).replace(/PROJECTNAME/g, project),
		function(){
			
			$.ajax({
				"type": "GET",
				"url": WEBSERV_URL+"/api/delete_projectrole_for_user",
				"data": {
					"username": username,
					"db_name": project,
					"dummy": lexutil.getUniqueNumber()
				},
				"dataType": "xml", // get response as xml
				"success": function(xml) {
					fn.closeDialog();
					lexitusers.refreshUserRight(function(){
						fn.message(lang.ok, lang.admingui_drop_projectrole_success+"<BR><BR>"+lexitusers.overviewOfUsersAndRoles, function(){
							lexitusers.showMenu();
						});	
						setTimeout(function(){
							lexitusers.smoothScroll("#usersoverview", "#user_"+username.toLowerCase());
						}, 100);			
					});
				},
				"error": function (jqXHR, textStatus, errorThrown) {
						fn.message(lang.error, lang.admingui_drop_projectrole_error+" " + textStatus + " " + errorThrown);
					}
				}
			);			
		},
		function(){
			
			fn.closeDialog();
			lexitusers.refreshUserRight(function(){
				fn.message(lang.ok, lang.admingui_drop_projectrole_cancel+"<BR><BR>"+lexitusers.overviewOfUsersAndRoles, function(){
					lexitusers.showMenu();
				});	
				setTimeout(function(){
					lexitusers.smoothScroll("#usersoverview", "#user_"+username.toLowerCase());
				}, 100);			
			});
		}
	);
	
};


/**
 * Update the overview of users and roles (store globally in lexitusers.overviewOfUsersAndRoles)
 */
lexitusers.updateOverviewOfUsersAndRoles = function(fnCallback){
										
	$.ajax({
		"type": "GET",
		"url": WEBSERV_URL+"/api/get_list_of_users_and_roles",
		"data": {
			"dummy": lexutil.getUniqueNumber()
		},
		"dataType": "xml", // get response as xml
		"success": function(xml) {
			
			var aUsersAndRoles = $(xml).find("response").text().split(ARG_INTERNAL_SEPARATOR).sort();
			var sOutPut = "<TABLE style='min-width: 400px; border: 1px dotted black'>";
			sOutPut += "<TR><TD style='border-top: 1px dotted black; padding: 2px;'>USERNAME</TD><TD style='border-top: 1px dotted black; padding: 2px;'>&nbsp;&nbsp;</TD><TD style='border-top: 1px dotted black; padding: 2px;'>USER ROLES</TD></TR>";
			for (var u=0; u<aUsersAndRoles.length; u++){
				var aOneUserRole = aUsersAndRoles[u].split(":::");
				
				var thisUser = aOneUserRole[0];
				if (thisUser == "admin") continue;
				
				var aTheseRoles = (aOneUserRole[1]).split(",");
				for (var j=0; j<aTheseRoles.length; j++){
					
					if (aTheseRoles[j].split("_").length > 1){
						var iLastIndexOfUnderscore = (aTheseRoles[j].lastIndexOf("_") + 1);
						var sThisProject = (aTheseRoles[j]).substring(0, iLastIndexOfUnderscore - 1);
						var sThisRole = (aTheseRoles[j]).substring(iLastIndexOfUnderscore);
						aTheseRoles[j] =
							"<span onclick='lexitusers.dropProjectRoleForUser(\"" + sThisProject + "\", \"" + thisUser + "\")'>"+
							"<img src='images/formlist_cross.png'>&nbsp;"+
							"</span>"+	
							sThisProject + " [" + sThisRole + "]";
							
					}
					else {
						
						aTheseRoles[j] = 
							"<span><img src='images/formlist_cross_disabled.png'>&nbsp;</span>"+ aTheseRoles[j];
					}
					
				}
				sOutPut += "<TR id='user_"+thisUser.toLowerCase()+"'><TD style='border-top: 1px dotted black; padding: 2px;'>&nbsp;"+thisUser+"</TD><TD style='border-top: 1px dotted black; padding: 2px;'>&nbsp;&nbsp;</TD><TD style='border-top: 1px dotted black; padding: 2px;'>"+aTheseRoles.join('<BR>')+"</TD></TR>";
			}
			sOutPut += "</TABLE>";												
			lexitusers.overviewOfUsersAndRoles = 
				"<DIV style='max-height: 200px; overflow-x: hidden; overflow-y: scroll; margin-bottom: 30px;' id='usersoverview'>"+sOutPut+"</DIV>"+
				"<HR style= 'border-top: 2px dotted #bbb;''>";
			
			if (fnCallback != null){
				fnCallback();
			}
									 						
		},
		"error": function(jqXHR, textStatus, errorThrown){
			
			fn.message(lang.error, lang.admingui_get_users_roles_error+" " + textStatus+" "+errorThrown);
		}
	});			 				

};


/**
 * Refresh user rights and update overview of users and roles
 */
lexitusers.refreshUserRight = function(fnCallback){
						 				
	$.ajax({
		"type": "GET",
		"url": WEBSERV_URL+"/api/reset_user_rights",
		"data": {
			"dummy": lexutil.getUniqueNumber()
		},
		"dataType": "xml", // get response as xml
		"success": function(xml) {
			lexitusers.updateOverviewOfUsersAndRoles( function(){fnCallback();} );			
		},
		"error": function (jqXHR, textStatus, errorThrown) {
				fn.message(lang.error, lang.admingui_refresh_users_rights_error+" " + textStatus + " " + errorThrown);
			}
		}
	);
};



/**
 * Get the default role for a user and pass it to the callback function
 */
lexitusers.getDefaultRole = function(someUser, fnCallback){
	
	$.ajax({
		"type": "GET",
		"url": WEBSERV_URL+"/api/get_user_default_role",
		"data": {
			"username": someUser,
			"dummy": lexutil.getUniqueNumber()
		},
		"dataType": "xml", // get response as xml
		"success": function(xml) {
			fnCallback( $(xml).find("response").text() );
		},
		"error": function (jqXHR, textStatus, errorThrown) {
				fn.message(lang.error, lang.admingui_get_users_default_role_error+" " + textStatus + " " + errorThrown);
			}
		}
	);
	
};


/**
 * Delete a user (after confirmation)
 */
lexitusers.deleteUser = function(){
	
	$.ajax({
		"type": "GET",
		"url": WEBSERV_URL+"/api/get_list_of_users",
		"data": {
			"dummy": lexutil.getUniqueNumber()
		},
		"dataType": "xml", // get response as xml
		"success": function(xml) {
			
			var aListOfUsers = $(xml).find("response").text().split(ARG_INTERNAL_SEPARATOR).sort();
			aListOfUsers = aListOfUsers.filter(someUser => someUser != "admin");
			
			fn.prompt([lang.admingui_deleteuser_title, lexitusers.overviewOfUsersAndRoles +"<BR><DIV>"+lang.admingui_deleteuser_selector_msg+"</DIV>"], 
 					["username"], 
 					[aListOfUsers], 
 					function(resp){
						
						var username = resp["username"];
				
						fn.confirm(lang.admingui_deleteuser_title, (lang.admingui_deleteuser_confirm_msg).replace(/USERNAME/g, username),
							function(){
							
								$.ajax({
									"type": "GET",
									"url": WEBSERV_URL+"/api/delete_user",
									"data": {
										"username": username,
										"dummy": lexutil.getUniqueNumber()
									},
									"dataType": "xml", // get response as xml
									"success": function(xml) {
										
										fn.closeDialog();										
										lexitusers.refreshUserRight(function(){
											fn.message(lang.ok, lang.admingui_deleteuser_success+"<BR><BR>"+lexitusers.overviewOfUsersAndRoles, function(){
												lexitusers.showMenu();
											});	
											setTimeout(function(){
												lexitusers.smoothScroll("#usersoverview", "#user_"+username.toLowerCase());
											}, 100);
										});
										
									},
									"error": function(jqXHR, textStatus, errorThrown){
										
										fn.message(lang.error, lang.admingui_deleteuser_error+" " + textStatus+" "+errorThrown);
									}
				 				});
							},
							function(){
								
								fn.closeDialog();
								lexitusers.refreshUserRight(function(){
									fn.message(lang.ok, lang.admingui_deleteuser_cancel+"<BR><BR>"+lexitusers.overviewOfUsersAndRoles, function(){
										lexitusers.showMenu();
									});
									setTimeout(function(){
										lexitusers.smoothScroll("#usersoverview", "#user_"+username.toLowerCase());
									}, 100);	
								});
								
							}
						);
 				
		 				
 					},
 					function(){
 						fn.closeDialog();
						lexitusers.showMenu();
 					}
 			);
			
			
			// allow the prompt to be built before manipulating it
			setTimeout(function(){
				// insert empty row after the default access role selector
				$("<br>").insertAfter( $("#prompt_defaultaccessrole").next("br") );
				
				// make sure that when a user is selected, the overview scrolls to that user
				$("#prompt_username").on("change", function(){					
					lexitusers.smoothScroll("#usersoverview", "#user_"+($(this).val()).toLowerCase());
				});
			}, 100);
			
		},
		"error": function(jqXHR, textStatus, errorThrown){
			
			fn.message(lang.error, lang.admingui_get_users_roles_error+" " + textStatus+" "+errorThrown);
		}
	});

	
};


/**
 * Add or update a user
 */
lexitusers.createNewUser = function(){
	
	fn.prompt([lang.admingui_adduser_title, 
			lexitusers.overviewOfUsersAndRoles +"<BR><DIV>"+lang.admingui_adduser_msg+"</DIV>"], 
			["username", "password", "default access role"], 
			["", "", ["-::selected", "superuser", "superreader"]], 
			function(resp){
				
				var username = resp["username"];
				var password = resp["password"];
		
 				$.ajax({
					"type": "GET",
					"url": WEBSERV_URL+"/api/set_user_with_role",
					"data": {
						"username": username,
						"password": password,
						"default_role": resp["default access role"],
						"dummy": lexutil.getUniqueNumber()
					},
					"dataType": "xml", // get response as xml
					"success": function(xml) {
						
						fn.closeDialog();
						lexitusers.refreshUserRight(function(){
							fn.message("OK", lang.admingui_adduser_success+"<BR><BR>"+lexitusers.overviewOfUsersAndRoles, function(){
								lexitusers.showMenu();
							});
							setTimeout(function(){
								lexitusers.smoothScroll("#usersoverview", "#user_"+username.toLowerCase());
							}, 100);				
						});
 						
					},
					"error": function(jqXHR, textStatus, errorThrown){
						
						fn.message(lang.error, lang.admingui_adduser_error+" " + textStatus+" "+errorThrown);
					}
 				});
			},
			function(){
				fn.closeDialog();
				lexitusers.showMenu();
			}
	);
	
};
	

/**
 * Add or update a role for a user in a project (db)
 */
lexitusers.addRoleInProject = function(){
	
	$.ajax({
		"type": "GET",
		"url": WEBSERV_URL+"/api/get_list_of_users",
		"data": {
			"dummy": lexutil.getUniqueNumber()
		},
		"dataType": "xml", // get response as xml
		"success": function(xml) {
			
			var aListOfUsers = $(xml).find("response").text().split(ARG_INTERNAL_SEPARATOR);
			aListOfUsers = aListOfUsers.filter(someUser => someUser != "admin").sort();
			
			fn.prompt([lang.admingui_addrole_title, 
				lexitusers.overviewOfUsersAndRoles +"<BR><DIV>"+lang.admingui_addrole_msg+"</DIV>"], 
 					["username", "default access role", "project (db)", "role in project (db)"], 
 					[aListOfUsers, ["NO CHANGE::selected", "-", "superuser", "superreader"], "", ["all::selected", "write", "read"]], 
 					function(resp){
						
						var username = resp["username"];
 				
		 				$.ajax({
							"type": "GET",
							"url": WEBSERV_URL+"/api/set_user_with_role",
							"data": {
								"username": username,
								"default_role": ( resp["default access role"] == 'NO CHANGE' ? null : resp["default access role"]),
								"db_name": resp["project (db)"],
								"role": resp["role in project (db)"],
								"dummy": lexutil.getUniqueNumber()
							},
							"dataType": "xml", // get response as xml
							"success": function(xml) {
								
								fn.closeDialog();
								lexitusers.refreshUserRight(function(){
									fn.message(lang.ok, lang.admingui_addrole_success+"<BR><BR>"+lexitusers.overviewOfUsersAndRoles, function(){
										lexitusers.showMenu();
									});
									setTimeout(function(){
										lexitusers.smoothScroll("#usersoverview", "#user_"+username.toLowerCase());
									}, 100);				
								});
								
							},
							"error": function(jqXHR, textStatus, errorThrown){
								
								fn.message(lang.error, lang.admingui_addrole_error+" " + textStatus+" "+errorThrown);
							}
		 				});
 					},
 					function(){
 						fn.closeDialog();
 						lexitusers.showMenu();
 					}
 			);
			
			
			// allow the prompt to be built before manipulating it
			setTimeout(function(){
				
				// insert empty row after the default access role selector
				$("<br>").insertAfter( $("#prompt_defaultaccessrole").next("br") );
				
				// make sure that when a user is selected, the overview scrolls to that user
				$("#prompt_username").on("change", function(){					
					lexitusers.smoothScroll("#usersoverview", "#user_"+($(this).val()).toLowerCase());
				});
				
				// add autocomplete to project (db) field
				lexitusers.setProjectAutoComplete();
				
			}, 100);
			
		},
		"error": function(jqXHR, textStatus, errorThrown){
			
			fn.message(lang.error, lang.admingui_get_users_roles_error+" " + textStatus+" "+errorThrown);
		}
	});
											
};



/**
 * Show an editable list of projects, to be shown in the projects menu
 */
lexitusers.setListOfProjects = function(){
	
	
	$.ajax({
		"type": "GET",
		"url": WEBSERV_URL+"/api/get_list_of_existing_projects",
		"data": {
			"fullinfo": true, 
			"dummy": lexutil.getUniqueNumber()
		},
		"dataType": "xml", // get response as xml
		"success": function(xml) {
			
			// we'll show a sortable list of projects
			
			var promptDivId = "dialog-message"+lexutil.getUniqueNumber();
			var someExplanatoryText = $("<p></p>").html(lang.admingui_projectmenu_msg);
			
			var sortableId = "sortable"+lexutil.getUniqueNumber();
			
			var promptDiv = $("<div></div>")
				.attr("id", promptDivId)
				.attr("title", lang.admingui_projectmenu_title)
				.css("font-size", "12px");
			
			
			var sortableUl = $("<ul></ul>")
				.attr("id", sortableId)
				.css("list-style-type", "none")
				.css("margin", "0")
				.css("padding", "0")
				.css("width", "100%");
					
			var aListOfProjects = $(xml).find("response").text().split(ARG_INTERNAL_SEPARATOR);
						
			var aSectionsLabels = {
				"production": lang.production, 
				"goody": lang.goodies, 
				"development": lang.in_development, 
				"closed": lang.project_closed,
				"unknown": lang.project_unknown
			};
			var aListOfSections = Object.keys(aSectionsLabels);
			
			
			// first append the sections
			for (var s=0; s<aListOfSections.length; s++){
				
				var sThisStatus = aListOfSections[s];
				
				// get label of this section
				var sSeparatorLabel = aSectionsLabels[sThisStatus];
					
				// create label
					
				var liElement = $("<li></li>")
				    .addClass( "separator" )
				    .addClass( "ui-state-default")
					.addClass( "ui-state-disabled")
					.css("color", "black")
					.css("opacity", "0.6")					
					.css("border", "0px")
                    .css("margin", "0 3px 3px -25px")
                    .css("padding", "0.4em")
                    .css("padding-left", "1.5em")
                    .css("margin-top", "15px")
                    .css("font-size", "1.1em")
                    .css("font-weight", "bold")
                    .css("height", "18px")
                    .attr("id", sThisStatus);
                var spanElement = $("<span></span>")
                	.text( sSeparatorLabel ); // show status as separator
                        
                // add elements to list
                liElement.append(spanElement);
                sortableUl.append(liElement);
            }
            
            
            // then append the projects, under their sections			
			
			for (var p = 0; p < aListOfProjects.length; p++) {
				
				// part the project's info  (projectname, name, description, status, order_in_menu, message, redirect)
				var aProjectInfo = (aListOfProjects[p]).split(":::");
				var sProjectConfigFileName = aProjectInfo[0];
				var sHumanReadableName = aProjectInfo[1];
				var sHumanReadableDescription = aProjectInfo[2];
				var sStatus = aProjectInfo[3];
				var sMessage = aProjectInfo[5];
				var sRedirect = aProjectInfo[6];
				
				// show project info			
					
				var liElement = $("<li></li>")
					.addClass( "ui-state-default")
					.attr("id", sProjectConfigFileName)
					.css("margin", "0 3px 3px 3px")
					.css("padding", "0.4em")
					.css("padding-left", "1.5em")
					.css("font-size", "1.0em")
					.css("width", "95%")
					.css("height", "18px")
					.data("status", sStatus); // remember the status				
				var spanElement1 = $("<span></span>")
					.addClass( "ui-icon ui-icon-arrowthick-2-n-s" )	
					.css("margin-left", "-18px");
				var spanElement2 = $("<span></span>")
					.text( sProjectConfigFileName ); // show project project config filename
				var spanElement3 = $("<span></span>")
					.addClass( "ui-icon ui-icon-circle-plus" )
					.css("position", "absolute")
					.css("left", "740px")
					.css("margin-top", "3px")
					.click( function(){
						
						// get parent li element
						var $li = $(this).closest("li");
						
						if ($(this).hasClass("ui-icon-circle-plus")) {
							// change to minus
							$(this).removeClass("ui-icon-circle-plus").addClass("ui-icon-circle-minus");
							// animate height to double height
							$li.animate({ height: "70px" }, 300, function(){
								$li.find(".prompt_extra_field").css("visibility", "visible"); // show extra fields after animation
							});
							
						}
						else if ($(this).hasClass("ui-icon-circle-minus")) {
							// change to plus
							$(this).removeClass("ui-icon-circle-minus").addClass("ui-icon-circle-plus");
							$li.find(".prompt_extra_field").css("visibility", "hidden"); // hide extra fields before animation
							// animate height to double height
							$li.animate({ height: "18px" }, 300);
						}
					});
				var spanElement4 = $("<span></span>")
					.addClass( "ui-icon ui-icon-closethick" )	
					.addClass("prompt_extra_field")
					.css("visibility", "hidden")
					.css("position", "absolute")
					.css("left", "740px")
					.css("margin-top", "28px")
					.attr("id", "delete_project_"+sProjectConfigFileName)
					.click( function(){
						
						var sThisProject = $(this).attr("id").replace("delete_project_","");
						
						fn.confirm(lang.admingui_projectmenu_delete_project, (lang.admingui_projectmenu_delete_project_warning).replace(/PROJECTNAME/g, sThisProject),
							function(){
	                            $.ajax({
									"type": "GET",
									"url": WEBSERV_URL+"/api/remove_project",
									"data": {
										"db_name": sThisProject, 
										"dummy": lexutil.getUniqueNumber()
									},
									"dataType": "xml", // get response as xml
									"success": function(xml) {
										fn.message(lang.ok, (lang.admingui_projectmenu_delete_project_success).replace(/PROJECTNAME/g, sThisProject), function(){
											// close the dialog
						      				fn.closeDialog();
						      				
						      				// go back to menu 
				 							lexitusers.showMenu();
										});
									},
									"error": function(jqXHR, textStatus, errorThrown){
									
										fn.message(lang.error, (lang.admingui_projectmenu_delete_project_error).replace(/PROJECTNAME/g, sThisProject)+" " + textStatus+" "+errorThrown);
									}
								});
	                        },
	                        function(){
	                            fn.message(lang.ok, lang.admingui_projectmenu_delete_project_cancel);
	                        }
						);
				});
					
				// input fields for name and description
					
				var inputDiv = $("<div></div>")
					.css("position", "relative")
					.css("left", "280px")
					.css("top", "-17px")
					.css("width", "425px")
					.css("border", "0px")
					.css("display", "flex")
					.css("flex-direction", "row")
					.css("flex-wrap", "wrap");
					
				var inputName = $("<input></input>")
					.attr("type", "text")
					.css("width", "150px")
					.css("margin", "2px")
					.attr("placeholder", lang.admingui_projectmenu_placeholder_projectname)
					.attr("name", "prompt_name_"+sProjectConfigFileName)			
					.attr("id", "prompt_name_"+sProjectConfigFileName)
					.val(sHumanReadableName); 
				var inputDescription = $("<input></input>")
					.attr("type", "text")					
					.css("width", "250px")
					.css("margin", "2px")
					.attr("placeholder", lang.admingui_projectmenu_placeholder_projectdescription)
					.attr("name", "prompt_desc_"+sProjectConfigFileName)			
					.attr("id", "prompt_desc_"+sProjectConfigFileName)
					.val(sHumanReadableDescription); 	
					
				// these extra input fields are hidden by default		
					
				var inputMessage = $("<input></input>")
					.addClass("prompt_extra_field")
					.attr("type", "text")			
					.css("width", "410px")
					.css("margin", "2px")
					.css("visibility", "hidden")
					.attr("placeholder", lang.admingui_projectmenu_placeholder_message_to_users)
					.attr("name", "prompt_msg_"+sProjectConfigFileName)			
					.attr("id", "prompt_msg_"+sProjectConfigFileName)
					.val(sMessage); 
				var inputRedirect = $("<input></input>")
					.addClass("prompt_extra_field")
					.attr("type", "text")			
					.css("width", "410px")
					.css("margin", "2px")
					.css("visibility", "hidden")
					.attr("placeholder", lang.admingui_projectmenu_placeholder_redirect_url)
					.attr("name", "prompt_redirect_"+sProjectConfigFileName)			
					.attr("id", "prompt_redirect_"+sProjectConfigFileName)
					.val(sRedirect); 
				
				// add elements to list
				liElement.append(spanElement1);
				liElement.append(spanElement2);
				liElement.append(spanElement3);
				liElement.append(spanElement4);
				
				inputDiv.append(inputName);
				inputDiv.append(inputDescription);
				inputDiv.append(inputMessage);
				inputDiv.append(inputRedirect);
				
				liElement.append(inputDiv);
				
				// goody projects cannot be moved nor edited
				if (sStatus == "goody"){
					inputName.prop("disabled", true);
					inputDescription.prop("disabled", true);
					liElement.addClass("ui-state-disabled");
				}	
				
				
				// append it to the right section
				
				// find the section separator having id value equal to sStatus
				var $targetSeparator = sortableUl.find("li.separator#"+sStatus);
				// find the last li having this status
				var $lastLi = sortableUl.find("li").filter(function () {
					return $(this).data("status") === sStatus;
				}).last();
				
				// insert after last li with this status, or after the separator if none yet
				if ($lastLi.length > 0){
					$lastLi.after(liElement);
				}
				else {
					$targetSeparator.after(liElement);
				}
								
			} // end of for-loop throught all projects
			
				                            
			// build the content
			
			promptDiv.append(someExplanatoryText);
			promptDiv.append(sortableUl);
			
			promptDiv.append($("<br><br><br><br>"));
		
			$(document.body).append(promptDiv);
			
			
			
			// build the dialog
			
			// array of buttons
			var aButtons = [];
			
			// Put a OK button only if we have a callback function, even an empty one
			
			aButtons.push({
				
				text: lang.ok,
		    	click: function(){
		    		  
		    		// gather the new order and info of the projects
		    		var aProjectsInNewOrder = [];
		    		$("#"+sortableId).children("li.ui-state-default:not(.separator)").each(function(iOrderInMenu){
						var sProjectConfigFileName = $(this).attr("id");
						var sProjectName = $("#prompt_name_"+sProjectConfigFileName).val();
						var sProjectDescription = $("#prompt_desc_"+sProjectConfigFileName).val();
						var sStatus = $(this).data("status");
						var sMessage = $("#prompt_msg_"+sProjectConfigFileName).val();
						var sRedirect = $("#prompt_redirect_"+sProjectConfigFileName).val();
						var aAll = [sProjectConfigFileName, sProjectName, sProjectDescription, sStatus, iOrderInMenu, sMessage, sRedirect];
						aProjectsInNewOrder.push( aAll.join(":::") );
					});
					
					$.ajax({
						"type": "POST",
						"url": WEBSERV_URL+"/api/set_list_of_existing_projects",
						"data": {
							"projectlist": aProjectsInNewOrder.join(ARG_INTERNAL_SEPARATOR),
							"dummy": lexutil.getUniqueNumber()
						},
						"dataType": "xml", // get response as xml
						"success": function(xml) {
							
							fn.message(lang.ok, lang.admingui_projectmenu_update_success, 
								function(){
									// close the dialog
				      				fn.closeDialog();
				      				
				      				// go back to menu 
		 							lexitusers.showMenu();
								}
							);
						},
						"error": function(jqXHR, textStatus, errorThrown){
							
							fn.message(lang.error, lang.admingui_projectmenu_update_error+" " + textStatus+" "+errorThrown, 
								function(){
									// close the dialog
				      				fn.closeDialog();
				      				
				      				// go back to menu 
		 							lexitusers.showMenu();
								}
							);
						}
	 				});						                		
						                			
		      		
		    		           		 
		    	},
		    	id: 'dialog_accept_button'
			});
			
		
			// A cancel button is always needed
			
			aButtons.push({
		  	  text: lang.cancel,
			  click: function() {
				  // close the dialog
      				fn.closeDialog();
      				
      				// go back to menu 
					lexitusers.showMenu();				
		      }
			});
			
			
			$( "#"+promptDivId ).dialog({
				autoOpen: false,
		        height: 650,
		        width: 800,
		        modal: true,
		        buttons: aButtons,
		        close: function(event, ui){
		        	$( this ).remove();
		        },
		        open: function(event, ui){
		        	// style
		            $(".ui-dialog").addClass("ui-dialog-shadow");
		            $( this ).closest(".ui-dialog").putInFront();
		        }
			})
			.keyup(function(e) {
				if (kf.isPressed("enter")){			
					$( "#dialog_accept_button" ).click();
					return false;
				}
			});
			
			$( "#"+promptDivId ).dialog( "open" );
	
			$( "#"+sortableId ).sortable({
				start: function (event, ui) {
			        // remember original position
			        ui.item.data("oldIndex", ui.item.index());
			    },
				cancel: ".ui-state-disabled",	// cannot move disabled items
				update: function( event, ui ) {
					
					// when an item was moved, make sure it get the status label of the section it's been dragged to
					
					// so first get old and new index
					const oldIndex = ui.item.data("oldIndex");
        			const newIndex = ui.item.index();
        			
					// get the separator preceeding this item (its id is the status name)
					var sIdOfPrecedingSeparator = ui.item.prevAll("li.separator").first().attr("id");	
					
					// if the item was moved to the goodies, UNDO the change since this move is verbidden
					if (sIdOfPrecedingSeparator == "goody"){
						// Move item back to original position
			            const $item = ui.item;
			            const $parent = $item.parent();
			            
			            // Remove & reinsert at old position
			            if (oldIndex === 0) {
			                $parent.prepend($item);
			            } 
			            else {
			                $parent.children().eq(oldIndex).before($item);
			            }
					}
					// else just assign the status name to the item's data
					else {
						$(ui.item).data("status", sIdOfPrecedingSeparator);						
					}
					
				}
			});

		    $( "#"+sortableId ).disableSelection();
		    
		    // make sure that clicking an input field focuses it
		    $( "#"+sortableId ).find( "input").click(function( event ) {
				$(this).focus();
			});
			
		}
	});
	
};





/**
 * Change the admin password (after confirmation)
 */
lexitusers.changeAdminPassword = function(){
	
	fn.prompt(lang.admingui_changeadminpassword_title, [lang.admingui_changeadminpassword_old_password, lang.admingui_changeadminpassword_new_password], null,
	
		function(resp){
			
			$.ajax({
					"type": "GET",
					"url": WEBSERV_URL+"/api/change_admin_password",
					"data": {
						"old_password": resp[lang.admingui_changeadminpassword_old_password],
						"new_password": resp[lang.admingui_changeadminpassword_new_password],
						"dummy": lexutil.getUniqueNumber()
					},
					"dataType": "xml", // get response as xml
					"success": function(xml) {
						
						fn.closeDialog();
						lexitusers.refreshUserRight(function(){
							fn.message(lang.ok, lang.admingui_changeadminpassword_success, function(){
								lexitusers.showMenu();
							});				
						});
 						
					},
					"error": function(jqXHR, textStatus, errorThrown){
						
						fn.message(lang.error, lang.admingui_changeadminpassword_error+" " + textStatus+" "+errorThrown);
						
						setTimeout(function(){							
							fn.closeDialog();
							lexitusers.showMenu();
						}, 2000);
					}
 				});
			
		},
		function(){
			// if cancelled reload,
			fn.closeDialog();
			lexitusers.showMenu();
		}
	);
	
};





/**
 * Show the main menu
 */
lexitusers.showMenu = function(){
	
	var oMenuOptions = {};
	
	// menu options in current language, with associated callback functions
	oMenuOptions[lang.admingui_main_dialog_add_user] = 			function(){lexitusers.createNewUser();};
	oMenuOptions[lang.admingui_main_dialog_delete_user] =		function(){lexitusers.deleteUser();};
	oMenuOptions[lang.admingui_main_dialog_add_role] = 			function(){lexitusers.addRoleInProject();};
	oMenuOptions["separator1"] = 								null;
	oMenuOptions[lang.admingui_main_dialog_projectmenu] =		function(){lexitusers.setListOfProjects();};	
	oMenuOptions["separator2"] = 								null;	
	oMenuOptions[lang.admingui_main_dialog_admin_password] =	function(){lexitusers.changeAdminPassword();};
	
	// build options, replacing "null" with the separator value (for empty line to separate groups)
	var options = Object.keys(oMenuOptions).map(item => $.startsWith(item, "separator") ? null : item);
	
	// first refresh user rights and overview
	lexitusers.refreshUserRight(function(){
		
		// show menu
        fn.promptSelect([lang.admingui_main_dialog_title, lang.admingui_main_dialog_msg], 
        options,
        null, 
        function(resp){
			
			// get callback function associated with the chosen option and call it
			var fnCallBack = oMenuOptions[resp[0]];			
			fnCallBack();			
		},
		function(){
			
			// if cancelled reload,
			fn.closeDialog();
			lexitusers.showMenu();
		},
		true);
    });
};



/**
 * Smoothly scroll a scrollable div to an anchor inside that div
 */
lexitusers.smoothScroll = function(div, anchor) {
	
  var $div = $(div);
  var $anchor = $(anchor);
  if (!$div.length || !$anchor.length) return;

  // Compute absolute target scroll positions relative to the scrollable div
  var targetTop  = $anchor.offset().top  - $div.offset().top  + $div.scrollTop();
  var targetLeft = $div.scrollLeft();

  // Stop any ongoing scroll animations and jump to the correct absolute values
  $div.stop(true).animate({ scrollTop: targetTop, scrollLeft: targetLeft }, 800);
};



/**
 * set autocomplete for project (db) field in addRoleInProject
 */
lexitusers.setProjectAutoComplete = function(){
	
	$("#prompt_projectdb").attr("placeholder", lang.admingui_addrole_projectname_autocomplete);
	
	// gist list of existing projects from entry point  
	
	$.ajax({
		
		"type": "GET",
		"url": WEBSERV_URL+"/api/get_list_of_existing_projects",
		"data": {
			"dummy": lexutil.getUniqueNumber()
		},
		"dataType": "xml", // get response as xml
		"success": function(xml) {
			
			// set the autocomplete for the project (db) field
			
			var aListOfExistingProjects = $(xml).find("response").text().split(ARG_INTERNAL_SEPARATOR);			
			
			// remove any previous binding to prevent double bindings
			$(document).off("focus", "#prompt_projectdb");
	
	        // when the project (db) field is focused, attach the autocomplete	
			$(document).on(
			      "focus", 
			      "#prompt_projectdb", 
			      function(event) {
			      	
			      	$(event.target).autocomplete({
			          	
			      		delay: 0,
			            minLength: 1,
				        source: aListOfExistingProjects,
				        source: function(request, response) {
							var results = $.ui.autocomplete.filter(
								aListOfExistingProjects,
								request.term
							);
						    // Filter again to only match from the start
						    var matcher = new RegExp("^" + $.ui.autocomplete.escapeRegex(request.term), "i");
						    response($.grep(results, function(item) {
								return matcher.test(item);
						    }));
						},
						open: function(event, ui){
	
							// make sure that the autocomplete won't disappear behind the dialog 
							setTimeout(function(){
								$(".ui-front").putInFront();
							}, 100);
						}
			        });
			          
			      }
			);
		}
	});
	
	
}