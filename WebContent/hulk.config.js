// list of tables that must be hidden or visible (don't use both, it's a matter of what's the most convenient)
oHiddenTablesList = [];
oShowOnlyTables = ["hulk_worktable"];

// table general settings
oTableSettingsList = {
		
		hulk_worktable:{
			"button_0":{
				"name": "Verstuur bestand"
			},
			"button_1":{
				"name": "Rij dupliceren"
			}
		}
};


// configuration at column level
oTableConfigurationList = {
		
		hulk_worktable: {
			
			pkid: {"visible": false},
			judgement_id: {"visible": false},
			document: {"choosefrom":[]},
			correction: {
				"editable": true,
				"bgcolor": "#CECEF6",
				"textcolor": "blue"
					},
			gloss: {
				"textstyle": "oblique"				
			},
			lemma: {
				"textstyle": "oblique",
				"textcolor": "brown"
			},
			part_of_speech:{
				
			},
			remarks: {
				"editable": true,
				"bgcolor": "#CECEF6"
				},
			wv: {
				"editable": true,
				"bgcolor": "#E0F8E0",
				"editcallback": function(t, n, value){
					fn.refreshTable(t);
					}
				},
			en: {"editable": true,
				"bgcolor": "#A9F5BC",
				"editcallback": function(t, n, value){
					fn.refreshTable(t);
					}
				},
			afke: {"editable": true,
				"bgcolor": "#E0F8E0",
				"editcallback": function(t, n, value){
					fn.refreshTable(t);
					}
				},
			ok: {"editable": true,
				"bgcolor": "#A9F5BC",
				"editcallback": function(t, n, value){
					fn.refreshTable(t);
					}
				}
		}

};