var lexitusers = {}



// menu uptions

lexitusers.oMenuOptions = {
	"Add/update a user" : function(){
		lexitusers.createNewUser();
	},
	"Delete a user": function () {
		lexitusers.deleteUser();
	},
	"Add/update roles": function(){
		lexitusers.addRoleInProject();
	},
	"null": null, // separator
	"Change admin password": function(){
		lexitusers.changeAdminPassword();
	}
};


// kind of global store for overview of users and roles
lexitusers.overviewOfUsersAndRoles;						 	


/**
 * Delete a project role for a user (after confirmation)
 */
lexitusers.dropProjectRoleForUser = function(project, username){	
	
	fn.confirm("Delete project role", "Do you really want to delete the role of '"+username+"' in project '"+project+"'?",
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
						fn.message("OK", "The project/role was deleted!<BR><BR>"+lexitusers.overviewOfUsersAndRoles, function(){
							lexitusers.showMenu();
						});				
					});
				},
				"error": function (jqXHR, textStatus, errorThrown) {
						fn.message(lang.error, "Deleting the user role went wrong: " + textStatus + " " + errorThrown);
					}
				}
			);			
		},
		function(){
			
			fn.closeDialog();
			lexitusers.refreshUserRight(function(){
				fn.message("OK", "The user was not deleted!<BR><BR>"+lexitusers.overviewOfUsersAndRoles, function(){
					lexitusers.showMenu();
				});				
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
			
			fn.message(lang.error, "Setting user right went wrong: " + textStatus+" "+errorThrown);
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
				fn.message(lang.error, "Resetting users rights went wrong: " + textStatus + " " + errorThrown);
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
				fn.message(lang.error, "Reading the default role went wrong: " + textStatus + " " + errorThrown);
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
			
			fn.prompt(["Delete user", lexitusers.overviewOfUsersAndRoles +"<BR><DIV>Delete user:</DIV>"], 
 					["username"], 
 					[aListOfUsers], 
 					function(resp){
				
						fn.confirm("Delete user", "Do you really want to delete user '"+resp["username"]+"'?",
							function(){
							
								$.ajax({
									"type": "GET",
									"url": WEBSERV_URL+"/api/delete_user",
									"data": {
										"username": resp["username"],
										"dummy": lexutil.getUniqueNumber()
									},
									"dataType": "xml", // get response as xml
									"success": function(xml) {
										
										fn.closeDialog();										
										lexitusers.refreshUserRight(function(){
											fn.message("OK", "The user was deleted!<BR><BR>"+lexitusers.overviewOfUsersAndRoles, function(){
												lexitusers.showMenu();
											});				
										});
										
									},
									"error": function(jqXHR, textStatus, errorThrown){
										
										fn.message(lang.error, "Deleting the user went wrong: " + textStatus+" "+errorThrown);
									}
				 				});
							},
							function(){
								
								fn.closeDialog();
								lexitusers.refreshUserRight(function(){
									fn.message("OK", "No user was deleted!<BR><BR>"+lexitusers.overviewOfUsersAndRoles, function(){
										lexitusers.showMenu();
									});				
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
			
			fn.message(lang.error, "Setting user role went wrong: " + textStatus+" "+errorThrown);
		}
	});

	
};


/**
 * Add or update a user
 */
lexitusers.createNewUser = function(){
	
	fn.prompt(["Create/update user", 
			lexitusers.overviewOfUsersAndRoles +"<BR><DIV>Create or update a user:<BR><BR>If 'password' needs no update, leave it empty!</DIV>"], 
			["username", "password", "default access role"], 
			["", "", ["-::selected", "superuser", "superreader"]], 
			function(resp){
		
 				$.ajax({
					"type": "GET",
					"url": WEBSERV_URL+"/api/set_user_with_role",
					"data": {
						"username": resp["username"],
						"password": resp["password"],
						"default_role": resp["default access role"],
						"dummy": lexutil.getUniqueNumber()
					},
					"dataType": "xml", // get response as xml
					"success": function(xml) {
						
						fn.closeDialog();
						lexitusers.refreshUserRight(function(){
							fn.message("OK", "The user was set!<BR><BR>"+lexitusers.overviewOfUsersAndRoles, function(){
								lexitusers.showMenu();
							});				
						});
 						
					},
					"error": function(jqXHR, textStatus, errorThrown){
						
						fn.message(lang.error, "Setting user right went wrong: " + textStatus+" "+errorThrown);
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
			
			fn.prompt(["Create/update roles", 
				lexitusers.overviewOfUsersAndRoles +"<BR><DIV>Create/update roles:</DIV>"], 
 					["username", "default access role", "project (db)", "role in project (db)"], 
 					[aListOfUsers, ["NO CHANGE::selected", "-", "superuser", "superreader"], "", ["all::selected", "write", "read"]], 
 					function(resp){
 				
		 				$.ajax({
							"type": "GET",
							"url": WEBSERV_URL+"/api/set_user_with_role",
							"data": {
								"username": resp["username"],
								"default_role": ( resp["default access role"] == 'NO CHANGE' ? null : resp["default access role"]),
								"db_name": resp["project (db)"],
								"role": resp["role in project (db)"],
								"dummy": lexutil.getUniqueNumber()
							},
							"dataType": "xml", // get response as xml
							"success": function(xml) {
								
								fn.closeDialog();
								lexitusers.refreshUserRight(function(){
									fn.message("OK", "The user role was set!<BR><BR>"+lexitusers.overviewOfUsersAndRoles, function(){
										lexitusers.showMenu();
									});				
								});
								
							},
							"error": function(jqXHR, textStatus, errorThrown){
								
								fn.message(lang.error, "Setting user right went wrong: " + textStatus+" "+errorThrown);
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
			
			fn.message(lang.error, "Setting user role went wrong: " + textStatus+" "+errorThrown);
		}
	});
											
};


/**
 * Change the admin password (after confirmation)
 */
lexitusers.changeAdminPassword = function(){
	
	fn.prompt("Change admin password", ["current password", "new password"], null,
	
		function(resp){
			
			$.ajax({
					"type": "GET",
					"url": WEBSERV_URL+"/api/change_admin_password",
					"data": {
						"old_password": resp["current password"],
						"new_password": resp["new password"],
						"dummy": lexutil.getUniqueNumber()
					},
					"dataType": "xml", // get response as xml
					"success": function(xml) {
						
						fn.closeDialog();
						lexitusers.refreshUserRight(function(){
							fn.message("OK", "The new admin password was set!", function(){
								lexitusers.showMenu();
							});				
						});
 						
					},
					"error": function(jqXHR, textStatus, errorThrown){
						
						fn.message(lang.error, "Setting the new admin password went wrong: " + textStatus+" "+errorThrown);
						
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
 * Ask the admin to choose what to do
 */ 
lexitusers._showMenu = function(){
	lexitusers.refreshUserRight(function(){
        fn.askToChoose("User management", "Would you like to:", lexitusers.oMenuOptions);
    });
};


/**
 * Show the main menu
 */
lexitusers.showMenu = function(){
	
	// build options, replacing "null" with the separator value (for empty line to separate groups)
	var options = Object.keys(lexitusers.oMenuOptions).map(item => item === "null" ? null : item);;	
	
	// first refresh user rights and overview
	lexitusers.refreshUserRight(function(){
		
		// show menu
        fn.promptSelect(["User management", "Would you like to:"], 
        options,
        null, 
        function(resp){
			
			// get callback function associated with the chosen option and call it
			var fnCallBack = lexitusers.oMenuOptions[resp[0]];			
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
	
	$("#prompt_projectdb").attr("placeholder", "Start typing to get project name...")
	
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