
var users = {};



var oUsers = null;


// build dialog for user management
// t.i. adding and removing users, or update their roles
users.projectsUsersPrompt = function(sProjectName){
	
	oUsers = {}; // reset
	
	var sDbName = getHttpParams().get("db");
	
	// container
	var dialogMain = $("<div></div>")
		.attr("id", "users_management_dialog");
	
	// top is for adding users (typing and autocomplete)
	var addUserBox = $("<textarea></textarea>")
		.attr("id", "add_user_box")
		.attr("placeholder", "Add a user...");
		
		
	var usersHavingAccessAlreadyLabel = $("<p></p>")
		.attr("id", "users_with_access_label")
		.text("Users with access");
		
	// central part is for editing/delete users
	var usersHavingAccessAlready = $("<div></div>")
		.attr("id", "users_with_access");
	
	
	// build the whole thing
	dialogMain.append(addUserBox);
	dialogMain.append(usersHavingAccessAlreadyLabel);
	dialogMain.append(usersHavingAccessAlready);
	
	$.ajax({
		"type": "GET",
		"url": uCobaltInstanceUrl + "webservice/api/get_users_having_access/",
		"data": {
			"db_name": sDbName,
			"schema_name": sProjectName,
			"dummy": getUniqueNumber()
			},
		"dataType": "xml", // get response as xml
		"success": function(xml) {
			
			var aUsersRoles = $(xml).find("response").text().split(" ::: ");
			
			// build the table with all users
			
			var usersTable = $("<table></table>")
				.attr("id", "users_roles_table");
			
			for (var r=0; r<aUsersRoles.length; r++){
				
				var oneUserRole = aUsersRoles[r];				
				
				// parse one set of user and role
				var aUserRole = oneUserRole.split(" | ");
				var usernameForThisRow = aUserRole[0];
				var roleForThisRow = aUserRole[1];
				
				users.addRowToUsersTable(usersTable, usernameForThisRow, roleForThisRow);
									
			}
			
			// append the table
			$(usersHavingAccessAlready).append(usersTable);
			
			
			
			// open the dialog
			
			menus.customPrompt("User management", dialogMain, 
			
				// OK button: add/update users' roles
				function(){
					
					var sUsersConcat = "", separator = "";
					
					for (var user in oUsers){
						sUsersConcat +=  (separator + (user+" ::: "+oUsers[user]));
						separator = " ### "; 
					}
					
					$.ajax({
						"type": "GET",
						"url": uCobaltInstanceUrl + "webservice/api/update_users_having_access/",
						"data": {
							"users_and_roles": sUsersConcat,
							"schema_name": sProjectName,
							"username": fn.getCurrentUser(), // the user who is updating the roles"
							"dummy": getUniqueNumber()
							},
						"dataType": "xml", // get response as xml
						"success": function(xml) {
							
						},
						"error": function(jqXHR, textStatus, errorThrown){
							
							alert( "Something went wrong when updating users' roles: "+textStatus+" "+errorThrown );
						}
					});
				}, 
				function(){
					// do nothing (dilogs are closed by default when clicking on Cancel)
				},
				["auto", 410]
				);
	
			
			
			// set autocomplete to the Add users box
			
			setTimeout(function(){
				
				$(document).off("focus", "#add_user_box");
	
				$(document).on(
			      "focus", 
			      "#add_user_box", 
			      function(event) {
			      	
			      	$(event.target).autocomplete({
			          	
			      		delay: 250, 
			            minLength: 2,
						autoFocus: true, // the first matching element automatically gets focus 

				        source: function(request, response){
				            	
				           	fn.callFunction("api.get_related_users", [ fn.getCurrentUser(), request.term ], 
				          		function(func_resp){
				            		
									// parse the output
				           			var aSuggestionsArr = (func_resp["get_related_users"]).split("###");

									// if the autocomplete outputs one option only:
									if (aSuggestionsArr.length == 1){
										
										var sSuggestion = aSuggestionsArr[0];
										
										// if the suggestion is empty, use the input string as suggestion (this allows us to enter an unknown user) 
										if (sSuggestion == '')
											aSuggestionsArr[0] = $("#add_user_box").val();
									}										 
				            		
				            		response($.map(aSuggestionsArr, function (item) {
				                        return {
				                            label: item,
				                            value: item
				                        };
				                    }));
				            	},
				            	function(err){
									// do nothing
								});
						},
						
						
						select: function(event, ui){
							
							if (event.keyCode === 13) {
						
								// prevent the dialog from being closed upon ENTER		
								event.stopPropagation();
								
								// add the user to the table
								users.addRowToUsersTable($("#users_roles_table"), ui.item.value, sContributorRole, true);
							
								// make box empty again	
								setTimeout(function(){
									$("#add_user_box").val("");
								}, 100);
								
								
							}
						},
						
						open: function(event, ui){
	
							// make sure that the autocomplete won't disappear behind the table (it did happen in the past...)
							setTimeout(function(){
								$(".ui-front").css("z-index", getHighestZindex()+1);
							}, 100);
						}
			        });
			          
			      }
			  );
	
	
				// put focus onto the Add users box
				setTimeout(function(){
					$("#add_user_box").focus();
				}, 100);				
				
			}, 100);
			
			

		},
		"error": function(jqXHR, textStatus, errorThrown){
			
			alert( "Something went wrong when building the user management dialog: "+textStatus+" "+errorThrown );
		}
	});
	
	
}


// add a row to the list of users in the GUI
// this function is both used 
// - when generating the dialog 
// - when adding users in the dialog

users.addRowToUsersTable = function(usersTable, usernameForThisRow, roleForThisRow, bMarkNew){
	
	// save user/role in memory
	oUsers[usernameForThisRow] = roleForThisRow;
	
	if (bMarkNew == null)
		bMarkNew = false;
	
	// we display each user on one single row
	var oneRow = $("<tr></tr>");
	if (bMarkNew)
		$(oneRow).addClass("new_user");
	
	
	// first column contain the user name		
	
	var thisUsernameCell = $("<td></td>")
		.addClass("username_column")
		.text(usernameForThisRow);
	$(oneRow).append(thisUsernameCell);
		
		
	// second column is about selecting a role
	
	var thisRoleCell = $("<td></td>");
	$(oneRow).append(thisRoleCell);
	var thisRoleSelector = $("<select></select>");
	
	var aRoles = [sOwnerRole, sContributorRole, sViewerRole]; 
	for (var i=0; i<aRoles.length; i++ ){
		var sOneRoleType = aRoles[i];
		var bSelected = (roleForThisRow == sOneRoleType);
		
		var thisOption = $("<option></option>").val(sOneRoleType).text(sOneRoleType);
		if (bSelected) {
			// mark the selected role
			$(thisOption).attr("selected", "selected");
			
			// the contributor mustn't be able to change his own role, otherwise there might be no owner anymore
			if (roleForThisRow == sOwnerRole)
				$(thisRoleSelector).prop("disabled", true);
		}
		
		// attach non-owner roles to the selector of non-owners
		if (roleForThisRow != sOwnerRole && sOneRoleType != sOwnerRole)
			$(thisRoleSelector).append( thisOption );
		else if (roleForThisRow == sOwnerRole)
			$(thisRoleSelector).append( thisOption );
	}
		
	// append the selector to the cell
	$(thisRoleCell).append(thisRoleSelector);
	$(thisRoleSelector).change(function(){
		
		// update user/role in memory
		var sUserAtThisRow = $(this).closest("tr").find("td").eq(0).text();
		oUsers[sUserAtThisRow] = $(this).val();
	})
	
	
	// third column is a red cross for withdrawal
	
	var crossImg = (roleForThisRow != sOwnerRole) ? "images/formlist_cross.png" : "images/formlist_cross_disabled.png";
	var withdrawalCross = $("<td></td>")
		.addClass("cross_column")
		.html("<img src='"+crossImg+"' class='delete'>");
		
	if (roleForThisRow != sOwnerRole)
		$(withdrawalCross).click(function(){
			
			// delete user/role from memory
			var sUserAtThisRow = $(this).closest("tr").find("td").eq(0).text();
			oUsers.hasOwnProperty(sUserAtThisRow);
			delete oUsers[sUserAtThisRow];
			
			$(this).closest("tr").remove();
		});
	$(oneRow).append(withdrawalCross);

	// now append the row to the table
	$(usersTable).append(oneRow);
}