// list of tables that must be hidden
oHiddenTablesList = [];

oTableSettingsList = {
		
		
};


// container object for the configuration of each table
oTableConfigurationList = {
		
		wordforms : {
			
			wordform: {
				"editable": true,
				"editcallback": function(t, n, value){
					
					fn.updateDatabaseGivenFieldValues(t, 
							{"wordform": value}, {"wordform_lowercase": value.toLowerCase()}, 
							true);
				}
			}
			
		}

};