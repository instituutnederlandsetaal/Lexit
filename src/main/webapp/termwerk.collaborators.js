

termcollaborators = {};

// ------------------------------------------------------------------------------------------------------------------
// BEWARE: 
// since the collaborators are now managed in a form list (embedded in the projects form),
// it looks like this table configuration is not used anymore. But since it is not certain yet, it is kept here.
// ------------------------------------------------------------------------------------------------------------------


termcollaborators.settings = {
	
	"top": sTableTopPosition,
		
	"exact_count": true,
	
	"main_search": false,
	
	"columns_sorting": {"username": "asc"},
	
	
	"callback": function(t){
		// hide the length selector in form view
		if (fn.getViewType(t) == "form") {
			$("#"+fn.getTableName(t)+"_wrapper").find("#"+fn.getTableName(t)+"_length").hide();
			$("#"+fn.getTableName(t)+"_wrapper").find(".dataTables_info").hide();
		}
		else {			
			$("#"+fn.getTableName(t)+"_wrapper").find("#"+fn.getTableName(t)+"_length").show();
			$("#"+fn.getTableName(t)+"_wrapper").find(".dataTables_info").show();
		}
	},
	"repeat_callback": true
};


termcollaborators.config = {
	
		
	user_id: {
		visible: false
	},
	name: {},
	username: {
		"nice_name": "gebruikersnaam"
	},
	project_id: {},
	role: {
		"nice_name": "rol",  
		"choosefrom": ["Eigenaar", "Bewerker", "Kijker"]
	},
	e_mail: {}
};