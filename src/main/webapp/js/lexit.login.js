
var lexitlogin = {};

	
/**
 * Login function must be accessible from anywhere, to be able to call it programmatically if needed
 * ( synonym: fn.startLexitLogin() )
 */
lexitlogin.startLexitLogin = function(){
		
	fn.prompt("LOGIN", ["Username", "Password"], ["::username", "::password"], 
			function(resp){
		
				var url = WEBSERV_URL+"/api/login"; 
		
				$.ajax({
					"type": "POST",
					headers: {'Content-Type': 'application/x-www-form-urlencoded'},
		            contentType: 'application/x-www-form-urlencoded; charset=utf-8',

					"url": url,
					"data": {
						"username": resp["Username"],
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
				 			setTimeout(function(){lexitinit.lexitReload();}, 500);
				 		}
				 	},
					"error": function(jqXHR, textStatus, errorThrown){
						
						fn.message(lang.error, lang.failed+": " +	textStatus+" "+errorThrown);
					}
				});
		
			},
			function(){
				// if cancel then reload
				lexitinit.lexitReload();
				
			}
	);
	
	// set focus etc
	setTimeout(	function(){
		$("div[id^='dialog-message']").find("form").attr("id", "loginForm");		
		fn._activeEnterForThisDialog( $("div[id^='dialog-message']").attr("id") );		
		$("div[id^='dialog-message']").find("input#prompt_username").focus();
		
	}, 100); 
	
};
	
	 
	
/**
 * Logout function must be accessible from anywhere, to be able to call it programmatically if needed
 * ( synonym: fn.startLexitLogout() )
 * 
 * @param fnCallback optional callback function to be called after successful logout. If not set, a default message will be shown and the page will be reloaded.
 */
lexitlogin.startLexitLogout = function(fnCallback){
		
	if (fn.getCurrentUser() == null){
		console.log("Username is already empty, which means that log out was performed already.");
		return;
	}		
	
	var url = WEBSERV_URL+"/api/logout";
	
	$.ajax({
		"type": "POST",
		"url": url,
		"data": {
			"username": fn.getCurrentUser(),
			"dummy": getUniqueNumber()
		},
		"dataType": "xml", // get response as xml
		"success": function(xml) {
			
			// reset!
			USERNAME = null;
			SESSION_ID = null;
			
			// if a callback was set, call it
			if (fnCallback != null){
				fnCallback();
			}
			else {
				fn.closeDialog();
	 			fn.message("Log out", fn.getDbResponse(xml), function(){
	 				lexitinit.lexitReload();
	 			});
			}
			
	 	},
		"error": function(jqXHR, textStatus, errorThrown){
			
			fn.message(lang.error, lang.failed+": " +	textStatus+" "+errorThrown);
		}
	});
	
};
