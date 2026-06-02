
var molexdistincts = {};


molexdistincts.settings = {
	
	distinct_sources: {
		
		"group": "Normatieve tabellen"
	},
	
	distinct_lemma_pos: {

		"group": "Normatieve tabellen",

		"size": "60%",

		"column_sorting": {"lemma_pos": "asc"},

		"button_0": {
			"name": "Voeg POS toe",
			"click": function(t){

				var nRow = fn.getFirstSelectedRowNodeFrom(t);
				var sGigPos = "";
				if (nRow != null)
					sGigPos = fn.getDataFromCellInRowNode(nRow, "lemma_pos");

				fn.prompt(["POS toevoegen", "Voeg in"], ["lemma_pos"], [sGigPos], function(resp){

					var sNewGigPos = resp["lemma_pos"];

					fn.insertIntoDatabase(t, 
						{"lemma_pos": sNewGigPos}, 
						null, 
						function(resp){
							fn.refreshTable(t);						
						}						
					);
				});

			}
		},
		"button_1": {
			"name": "Verwijder POS",
			"click": function(t){
				
				fn.confirm("Let op", "Weet u het zeker?", 
				function(resp){
					var nRow = fn.getFirstSelectedRowNodeFrom(t);
					fn.removeFromDatabaseGivenANode(nRow, function(){
						fn.refreshTable(t);
					})
				},
				function(){
					fn.message("OK", "Operatie geannuleerd door gebruiker");
				})
			}
		}
	}, 
	distinct_wordform_pos: {

		"group": "Normatieve tabellen",

		"size": "80%",

		"column_sorting": {"wordform_pos": "asc"},

		"button_0": {
			"name": "Voeg POS toe",
			"click": function(t){

				var nRow = fn.getFirstSelectedRowNodeFrom(t);
				var sGigPos = "";
				if (nRow != null)
					sGigPos = fn.getDataFromCellInRowNode(nRow, "wordform_pos");

				fn.prompt(["POS toevoegen", "Voeg in"], ["wordform_pos"], [sGigPos], function(resp){

					var sNewGigPos = resp["wordform_pos"];

					fn.insertIntoDatabase(t, 
						{"wordform_pos": sNewGigPos}, 
						null,  // no return field
						function(resp){
							fn.refreshTable(t);						
						}
					);
				});

			}
		},
		"button_1": {
			"name": "Verwijder POS",
			"click": function(t){
				
				fn.confirm("Let op", "Weet u het zeker?", 
				function(resp){
					var nRow = fn.getFirstSelectedRowNodeFrom(t);
					fn.removeFromDatabaseGivenANode(nRow, function(){
						fn.refreshTable(t);
					})
				},
				function(){
					fn.message("OK", "Operatie geannuleerd door gebruiker");
				})
			}
		},
		"button_2": {
			"name": "Update rank in paradigma-view",
			"bgcolor": "red",
			"click": function(t){

				fn.message("Even geduld...", "Deze update kan tot 5 minuten duren.<BR><BR>Even geduld a.u.b.");
				
				setTimeout(function(){
					fn.callFunction(sApiSchema+".update_paradigms_ranks", [null], function(){
						fn.closeDialog();
						fn.message("OK", "De ranking is overal bijgewerkt.")
					});
				}, 500);
				
			}
		}
	}
	
	
};

molexdistincts.config = {
	
	distinct_lemma_pos: {

		"lemma_pos": {
			"editable": true
		},
		"label_voor_entry_type_woord": {
			"editable": true
		},
		"label_voor_entry_type_mwe": {
			"editable": true
		},
		"opmerking": {
			"editable": true,
			"bgcolor": "#F8E0E6"
		}

	},

	distinct_wordform_pos: {
	
		"wordform_pos": {
			"nice_name": "wf_pos",
			"editable": true
		},

		"rank": {
			"editable": true
		},
		"label_voor_entry_type_woord": {
			"visible": false
		},
		"label_voor_entry_type_mwe": {
                            "visible": false
                    },

		"entry_type_woord_groepslabel": {
			"bgcolor": "#F5ECCE",
			"editable": true
		},
		"entry_type_woord_positielabel": {
			"bgcolor": "#F5ECCE",
			"editable": true
		},
		"entry_type_mwe_groepslabel": {
			"bgcolor": "#E0ECF8",
			"editable": true
		},
		"entry_type_mwe_positielabel": {
			"bgcolor": "#E0ECF8",
			"editable": true
		},
		"opmerking": {
			"editable": true,
                            "bgcolor": "#F8E0E6"
		}
	}	
};