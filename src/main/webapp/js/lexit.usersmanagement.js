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
	}
};


// kind of global store for overview of users and roles
lexitusers.overviewOfUsersAndRoles;						 	

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
				sOutPut += "<TR><TD style='border-top: 1px dotted black; padding: 2px;'>&nbsp;"+thisUser+"</TD><TD style='border-top: 1px dotted black; padding: 2px;'>&nbsp;&nbsp;</TD><TD style='border-top: 1px dotted black; padding: 2px;'>"+aTheseRoles.join('<BR>')+"</TD></TR>";
			}
			sOutPut += "</TABLE>";												
			lexitusers.overviewOfUsersAndRoles = "<DIV style='max-height: 200px; overflow-x: hidden; overflow-y: scroll;'>"+sOutPut+"</DIV>";
			
			if (fnCallback != null){
				fnCallback();
			}
									 						
		},
		"error": function(jqXHR, textStatus, errorThrown){
			
			fn.message(lang.error, "Setting user right went wrong: " + textStatus+" "+errorThrown);
		}
	});			 				

};



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
			
			// insert empty row after the default access role selector
			setTimeout(function(){
				$("<br>").insertAfter( $("#prompt_defaultaccessrole").next("br") );
			}, 100);
			
		},
		"error": function(jqXHR, textStatus, errorThrown){
			
			fn.message(lang.error, "Setting user role went wrong: " + textStatus+" "+errorThrown);
		}
	});

	
};

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
			
			// insert empty row after the default access role selector
			setTimeout(function(){
				$("<br>").insertAfter( $("#prompt_defaultaccessrole").next("br") );
			}, 100);
			
		},
		"error": function(jqXHR, textStatus, errorThrown){
			
			fn.message(lang.error, "Setting user role went wrong: " + textStatus+" "+errorThrown);
		}
	});
											
};



// ask the admin to choose 
lexitusers.showMenu = function(){
	lexitusers.refreshUserRight(function(){
        fn.askToChoose("User management", "Would you like to:", lexitusers.oMenuOptions);
    });
};
