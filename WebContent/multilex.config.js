
oHiddenTablesList = ["anw_lemmata", "anw_wordforms",
                     "john_lemmata", "john_wordforms",
                     "spelling_lemmata", "spelling_wordforms",
                     "biglex"
                     ];

oTableSettingsList = {
		biglex: {
			
			"header_height": "70px",
			"selection_button_active": true,
			
			"button_0": {
				"name": "Verwijder rij",
				"click": function(confTable){
					var aSelectedRows = fn.getSelectedRowsFrom(confTable);
					if (aSelectedRows.length==0)
						alert("Kies eerst of meer rijen die u wilt verwijderen");
					else
						{
						var answer = confirm("Weet u het zeker?");
						if (answer)
							{
							aSelectedRows.each(function(){
								fn.removeFromDatabaseGivenANode(confTable, this, true);
								});
							}						
						}
						
				}
			}
		},
		
		compact_biglex: {
			
			"header_height": "70px",
			"selection_button_active": true,
			
			"button_0": {
				"name": "Verwijder rij",
				"click": function(confTable){
					var aSelectedRows = fn.getSelectedRowsFrom(confTable);
					if (aSelectedRows.length==0)
						alert("Kies eerst of meer rijen die u wilt verwijderen");
					else
						{
						var answer = confirm("Weet u het zeker?");
						if (answer)
							{
							aSelectedRows.each(function(){
								fn.removeFromDatabaseGivenANode(confTable, this, true);
								});
							}						
						}
						
				}
			}
		},
		
		wordform_pos: {
			"size": "45%",
			"selection_button": false,
			"refresh_button": false,
			"replace_button": false,
			"undo_button": false,
			"goto_button": false
		},
		lemma_pos: {
			"size": "45%",
			"selection_button": false,
			"refresh_button": false,
			"replace_button": false,
			"undo_button": false,
			"goto_button": false
		}
};

// container object for the configuration of each table
oTableConfigurationList = {
		biglex: {
			source:{"choosefrom": ["", "SpellingDb", "jvkLex"]},
			id: {"visible": false},
			lemma: {"editable": true, "colsort": "asc"},
			lemmapos: {"editable": true},
			wordform: {"editable": true},
			wordformpos: {"editable": true}
		},
		
		compact_biglex: {
			source:{"choosefrom": ["", "SpellingDb", "jvkLex"]},
			id: {"visible": false},
			lemma: {"editable": true, "colsort": "asc"},
			lemmapos: {"editable": true},
			wordforms: {"editable": false}
		},
		
		wordform_pos: {
			wordformpos: {
				"cell_tooltip": "Klik om rijen met deze waarden te tonen",
				"click": function(confTable, confNode){
					var chosenPos = fn.escapeRegexChars(fn.getDataFromCellNode(confTable, confNode));
					fn.callDatabaseInNewTab("compact_biglex", {"wordforms": ".*"+chosenPos+".*"});
				}
			}
		},
		lemma_pos: {
			lemmapos: {
				"cell_tooltip": "Klik om rijen met deze waarden te tonen",
				"click": function(confTable, confNode){
					var chosenPos = fn.escapeRegexChars(fn.getDataFromCellNode(confTable, confNode));					
					fn.callDatabaseInNewTab("compact_biglex", {"lemmapos": chosenPos});
				}
			},
			change: {
				"button": "Wijzig tag",
				"click": function(confTable, confNode){
					
					var sCurrentTag = fn.getDataFromSiblingNode(confTable, confNode, "lemmapos");
					fn.prompt("Nieuwe tag", ["POS van lemma"], [sCurrentTag], 
							function(){
						var sNewTag = fn.getPromptUserInput("POS van lemma");
						fn.updateDatabaseGivenFieldValues(
								"compact_biglex", 
								{"lemmapos": "^"+fn.escapeRegexChars(sCurrentTag)+"$"}, 
								{"lemmapos": sNewTag}, 
								false, 
								function(){
									fn.refreshTable(confTable);
								});
					});
					
				}
			}
		}
};
