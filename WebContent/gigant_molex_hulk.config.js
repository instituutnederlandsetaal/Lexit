// list of tables that must be hidden or visible (don't use both, it's a matter of what's the most convenient)
oHiddenTablesList = [];
oShowOnlyTables = ["lemmata_view", "paradigma_view", "inputtable", "hulk_test_view", "hulkfunction_view"];







// remember chosen parent

var sChosenParentId = null;

// table general settings
oTableSettingsList = {
		
		hulk_test_view: {
			
			"size": "80%"
		},

		
		inputtable: {
			
			"size": "40%",
		
			"button_0": {
				
				"name": "Voeg woord toe",
				"click": function(t){
					
					fn.prompt("Geef een woord", 
							["word"], 
							[""], 
							function(){
						
						var sWoord = fn.getPromptUserInput("word");
						fn.insertIntoDatabase(t, 
								{"word": sWoord}, 
								null, false, 
								function(){ fn.refreshTable(t);}
								);
											
					});
				}
			},
			"button_1": {
				
				"name": "Verwijder woord",
				"click": function(t){
					
					var aRows = fn.getSelectedRowsFrom(t);
					aRows.each(function(){
						
						var bLastRow = fn.isLastNodeOf(this, aRows);
						var sWoord = fn.getDataFromCellNamed(t, this, "word");
						
						fn.removeFromDatabaseGivenFieldValues(t, 
								{"word": sWoord}, 
								false,
								function(){
									if (bLastRow) fn.refreshTable(t);
								});
						
					});
				}
			}
		},		

		
		lemmata_view: {
			
			"callback": function(t){
				
				// we need to disable the checkbox of 
				var aRows = fn.getAllRows(t);
				aRows.each(function(){
					var bSourceContainsTelwoorden = (fn.getDataFromCellNamed(t, this, "source")).indexOf("TELWOORDEN")>-1;
					
					if (bSourceContainsTelwoorden)
						{				
						(fn.getCellElement(t, this, "gedrukt")).find("input").attr("disabled", true);						
						}
				});
			},
			"repeat_callback": true,
			
			"size": "90%",
			
			"button_0":{
				"name": "Voeg lemma toe",
				"click": function(confTable){
					
					fn.prompt("Geef een lemma", 
							["modern_lemma", "lemma_gigpos"], 
							["", ""], 
							function(){
						
						var sLemma = fn.getPromptUserInput("modern_lemma");
						var sLemmaPos = fn.getPromptUserInput("lemma_gigpos");
						
						fn.callFunction("insert_lemma", 
								[sLemma, sLemmaPos], 
								null, null, null, null, function(){
							fn.refreshTable(confTable);
						});
					});
				}
			},
			"button_1":{
				"name": "Verwijder selectie",
				"click": function(confTable){
					
					var answer = confirm("Weet u het zeker?");
					
					if (answer){
						
						var aRows = fn.getSelectedRowsFrom(confTable);
						aRows.each(function(){
							
							var bLastRow = fn.isLastNodeOf(this, aRows);
							var sLemmaId = fn.getDataFromCellNamed(confTable, this, "pkid");
							
							fn.removeFromDatabaseGivenFieldValues("lemmata", 
									{"lemma_id": sLemmaId}, 
									false,
									function(){
										if (bLastRow) fn.refreshTable(confTable);
									});
							
						});
					}
					
				}
			}

			
		},
		paradigma_view: {
			
			"size": "90%"

		}
};


// configuration at column level
oTableConfigurationList = {
		
		
		morphological_view: {
			
			morphological_analysis_id: {
				"visible": false
			},
			main_lemma_id: {
				"visible": false
			},
			part_morphological_analysis_id: {
				"visible": false
			},
			part_lemma_id: {
				"visible": false
			}
		},
		

		

		
		

		lemmata_view: {
			
			"source_molex_hom": { "visible": false },			
			"source_molex_nw_lem": { "visible": false },
			"source_molex_niet_hom": { "visible": false },
			"source_logfiles": { "visible": false },
			"source_anw": { "visible": false },
			"source_telw": { "visible": false },
			"source_chn": { "visible": false },
			"source_gb05": { "visible": false },
			
			"pkid":{				
				"visible": false
			},
			"parent_id":{				
				"visible": false
			}, 
			"parent":{
				"cell_tooltip": "Toon alle lemmata behorend bij dit superlemma",
				"click": function(t, n){
					var sLemma = fn.getDataFromCellNode(t, n);
					if (sLemma!='')
						fn.callDatabase(t, {"parent": sLemma});
				}
			},
			"modern_lemma": {				
				"colsort": "asc"
			},
			"th_lemma": {			
			},
			"keurmerk": {				
				"visible": false,
				"flexible_visibility": false
			},
			"sublemma_type": {				
			},
			"opmerking": {
				"bgcolor": "#E0F8EC",
				"editable": true
			},
			"gloss": {				
			},
			"lemma_gigpos": {				
			},	
			"gb_id":{				
				"visible": false
			},
			"gb_wrdcat": {
			},
			"gb_znwlid": {
			},
			"lidw": {
				"visible": false
			},
			"geslacht": {
				"visible": false
			},
			"toon_paradigma":{				
				"button": "Paradigma",
				"click": function( confTable, confNode){					
					var lemma_id = fn.getDataFromSiblingNode(confTable, confNode, "pkid");
					fn.callDatabase("paradigma_view", {"lemma_id": lemma_id});
				}
			},
			"toon_morfologie":{				
				"button": "Morfologie",
				"click": function( confTable, confNode){					
					var lemma_id = fn.getDataFromSiblingNode(confTable, confNode, "pkid");
					fn.callDatabase("morphological_view", {"main_lemma_id": lemma_id});
				}
			},
			"trademark": {
				"visible": false
			},
			"gedrukt":{
				"editable": true
			}
			
		},
		
		inputtable: {
			word: {
				"colsort": "asc",
				"editable": true
			}
		
		},
		
		paradigma_view: {
			"pkid":{				
				"visible": false
			},
			"lemma_id":{				
				"visible": false
			},
			"wordform_id":{				
				"visible": false
			},
			"pkid":{				
				"visible": false
			},
			"wordform":{	
			},

			"wordform_afbr":{				
				
			},
			"th_wordform": {				
				"visible": false				
			},
			"th_wordform_afbr": {				
				"visible": false				
			},
			"wordform_gigpos":{				
				
			},
			"flex":{				
				
			},
			"keurmerk":{
			},
			"comment": {
				
			}
			
		}
};