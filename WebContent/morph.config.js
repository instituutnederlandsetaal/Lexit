// list of tables that must be hidden or visible (don't use both, it's a matter of what's the most convenient)
oHiddenTablesList = [];
oShowOnlyTables = ["morph"];

// table general settings
oTableSettingsList = {
		
		morph: {
			"size": "80%"
		}
};


// configuration at column level
oTableConfigurationList = {

		morph: {
			word: {
				"colsort": "asc"   // sort #1
			},
			cat:{
				"choosefrom": []
			},
			hidden_id: {
				"visible": false,
				"colsort": "asc"   // sort #2
			},
			celexie_id: {
				"visible": false
			},
			celexieklus_unique_id: {
				"visible": false
			}
		}
};