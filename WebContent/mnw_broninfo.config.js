// list of tables that must be hidden or visible (don't use both, it's a matter of what's the most convenient)
oHiddenTablesList = [];
oShowOnlyTables = [];

// table general settings
oTableSettingsList = {};


// configuration at column level
oTableConfigurationList = {
		
		mapping:{			
			id: {
				"colsort": "asc"
			},
		
			lokalisering_tekstgetuige_gtb : {
				"bgcolor": "#BCF5A9",
				"editable": true
			}
		},
		already_mapped: {
			lokalisering_tekstgetuige_gtb:{
			"editable": true
			}
		}

};