

// list of tables that must be hidden
oHiddenTablesList = [];

oTableSettingsList = {
		
		words:
			{
			"button_0": {
				"name": "Nieuwe record",
				"click": function(t){
					fn.prompt("Nieuwe record", ["word"], null, function(){
						var sWord = fn.getPromptUserInput("word");
						fn.insertIntoDatabase(t, {"word": sWord}, null, true);
						});
					}
				}
			}
		
};


// container object for the configuration of each table
oTableConfigurationList = {

		correctietabel: {
			"copy": {
				"button": "Overnemen",
				"click": function(t, n){
					var sWordToCopy = fn.getDataFromSiblingNode(t, n, "word");
					fn.updateDatabaseGivenANode(t, n, ["correctie"], [sWordToCopy], true);
				}
			},
			"kan_weg": {
				"editable": true
			},
			"correctie": {"editable": true},
			"klaar": {
				"searchable": false, 
				"editable": true, 
				"filter": false, 
				"keepfilter": true,
				"editcallback": function(t, n, value){ fn.refreshTable(t);}}
		},
		
		words: {
			spelling05_status: { "choosefrom": [], "editable": true },
			word: { "editable": true },
			source: { "choosefrom": [], "editable": true },
			group_id: {"editable": true}
			
		},
		
		words_copy : {
			spelling05_status: {"editable": true}
		}
};