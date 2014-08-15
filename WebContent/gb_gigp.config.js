// list of tables that must be hidden or visible (don't use both, it's a matter of what's the must convenient)
oHiddenTablesList = [];
oShowOnlyTables = [];

// table general settings
oTableSettingsList = {
		
		portmanteau_woorden: {
			"size": "60%"
		}

		
};


// configuration at column level
oTableConfigurationList = {
		
		verkleinwoorden_bewerk: {
			
			modern_lemma: {
				"colsort": "asc"
				},
			
			gloss: {
				"editable": true
				}
			
		},
		
		alles: {
			
			modern_lemma: {
				
				"cell_tooltip": "Toon alle vormen bij dit lemma",
				"click": function(t, n){
					var val = fn.getDataFromSiblingNode(t, n, "lemma_id");
					fn.callFunction("get_records_with_lemma_id", [val], null , null , null , null , function(){
						
						var aFunctionOutput = fn.getFunctionOutput();
						fn.callDatabaseInNewTab(t, {"lemma_id": "^("+aFunctionOutput.join("|")+")$"});
					});
				}
				
			},
			
			gb_superid: {
				"colsort": "asc",
				"cell_tooltip": "Toon origineel Groen boekje bij dit 'superid'",
				"click": function(t, n){
					var val = fn.getDataFromCellNode(t, n);
					fn.callDatabaseInNewTab("GB05_004", {"superid": val}, {"viewtype": "form"}, "lexicalsources");
				}
			},
			gb_id: {
				"colsort": "asc",
				"cell_tooltip": "Toon origineel Groen boekje bij dit 'id'",
				"click": function(t, n){
					var val = fn.getDataFromCellNode(t, n);
					fn.callDatabaseInNewTab("GB05_004", {"id": val}, {"viewtype": "form"}, "lexicalsources");
				}
			},
			parent_id : {
				
				"click": function(t, n){
					var val = fn.getDataFromCellNode(t, n);
					fn.callDatabaseInNewTab(t, {"lemma_id": val});
				}
			}
			
		},
		
		portmanteau_woorden: {
			id: {"visible": false},
			gb_click: {
				"button": "Toon GB_GiGp",
				"click": function(t, n){
					var val = fn.getDataFromSiblingNode(t, n, "gb05_superid")
					fn.callDatabase("alles", {"portmanteau_lemma_id": val});
				}
			},
			gb05_superid: {
				
			},
			aandacht: {"editable": true}
		}			

};