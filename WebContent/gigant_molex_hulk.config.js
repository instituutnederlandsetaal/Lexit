// list of tables that must be hidden or visible (don't use both, it's a matter of what's the most convenient)
oHiddenTablesList = [];
oShowOnlyTables = ["lemmata_view", "paradigma_view", "inputtable", 
                   "hulk_test_view", "hulkfunction_view", "wrong_to_correct_view",
                   "wordforms"];







// remember chosen parent

var sChosenParentId = null;

// table general settings
oTableSettingsList = {
		
		wrong_to_correct_view : {
			
			"size": "60%",
			
			"button_0": {
				
				"name": "Voer koppeling in",
				"click": function(t){
					
					var aRows = fn.getAllRows(t);
					
					var sSpellingVersion = ( $.isEmptyObject(aRows) ) ?
							fn.getDataFromCellNamed(t, aRows[0], "spelling_version_id") : 1;
					
					
					fn.prompt("Voer koppeling in", 
							["wrong_wordform", "correct_wordform"], 
							["", ""], 
							function(){
						
						var sWrong = fn.getPromptUserInput("wrong_wordform");
						var sCorrect = fn.getPromptUserInput("correct_wordform");
						
						
						fn.callFunction("insert_wrong_to_correct", 
								[fn.quote(sWrong), fn.quote(sCorrect), sSpellingVersion], null, null, null, null, 
								function(){
							fn.refreshTable(t);
						});
					});
				}
			},
			"button_1": {
				"name": "Verwijder koppeling",
				"click": function(t){
					
					var answer = confirm("Weet u het zeker?");
					
					if (answer)
						{
						var aRows = fn.getSelectedRowsFrom(t);
						aRows.each(function(){
							
							var bLastRow = fn.isLastNodeOf(this, aRows);
							var sWrongId = fn.getDataFromCellNamed(t, this, "wrong_wordform_id");
							var sCorrectId = fn.getDataFromCellNamed(t, this, "correct_wordform_id");
							var sSpellingVersion = fn.getDataFromCellNamed(t, this, "spelling_version_id");
							fn.removeFromDatabaseGivenFieldValues("corrected_wordforms", 
									{
									"wrong_wordform_id": sWrongId,
									"correct_wordform_id": sCorrectId,
									"spelling_version_id": sSpellingVersion
									}, false, function(){
										
										if (bLastRow)
											fn.refreshTable(t);
									});
							});
						}
					
					
				}
			}
			
		},
		
		wordforms:{
			
			"button_0": {
				
				"name": "Voeg woordvorm toe",
				"click": function(t){
					
					fn.prompt("Nieuwe woordvorm", ["woordvorm"], [""], 
							function(){
						
						var sWordform = fn.getPromptUserInput("woordvorm");
						fn.insertIntoDatabase(t, 
								{
								"wordform": sWordform,
								"wordform_lowercase": sWordform.toLowerCase()
								}, 
								null, false, function(){fn.refreshTable(t);});
					});
					
				}
			}
			
		},
		
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
				"name": "ALLES UIT",
				"click": function(t){
					
					fn.showProcessingMsg(t);
					fn.updateDatabaseGivenFieldValues("lemmata", {"doet_mee": true}, {"doet_mee": false}, false, function(){
						
						fn.showProcessingMsg(t);
						fn.showProcessingMsg("paradigma_view");
						fn.updateDatabaseGivenFieldValues("analyzed_wordforms", {"doet_mee": true}, {"doet_mee": false}, false, function(){
							fn.refreshTable("paradigma_view");
							fn.refreshTable(t);
							alert("Alle lemmata zijn nu uitgevinkt. U kunt weer lemmata uitkiezen voor de test.");
							fn.removeProcessingMsg("paradigma_view");
							fn.removeProcessingMsg(t);
						});
					});
				}
			},
			"button_1":{
				"name": "ALLES AAN",
				"click": function(t){
					
					fn.showProcessingMsg(t);
					fn.updateDatabaseGivenFieldValues("lemmata", {"doet_mee": false}, {"doet_mee": true}, false, function(){
												
						fn.showProcessingMsg(t);
						fn.showProcessingMsg("paradigma_view");
						fn.updateDatabaseGivenFieldValues("analyzed_wordforms", {"doet_mee": false}, {"doet_mee": true}, false, function(){
							fn.refreshTable("paradigma_view");
							fn.refreshTable(t);
							alert("Alle lemmata doen nu mee.");
							fn.removeProcessingMsg("paradigma_view");
							fn.removeProcessingMsg(t);
						});
					});
				}
			}

			
		},
		paradigma_view: {
			
			"size": "90%",
			"button_0":{
				"name": "Voeg woordvorm toe",
				"click": function(confTable){
					
					var wordform = fn.prompt("Geef een woordvorm", 
							["woordvorm", "wordform_gigpos"], 
							["", ""], 
							function(){
						
						var sWordform = fn.getPromptUserInput("woordvorm");
						var sWordformPos = fn.getPromptUserInput("wordform_gigpos");

						var aAllRows;
						var sLemmaId;
						
						// is there is no paradigm yet, get the lemma id from the lemma table
						if (fn.tableIsEmpty(confTable))
							{
							aAllRows = fn.getSelectedRowsFrom("lemmata_view");
							sLemmaId = fn.getDataFromCellNamed("lemmata_view", aAllRows[0], "pkid");
							
							}
						// otherwise just read it from the current table
						else
							{
							aAllRows = fn.getAllRows(confTable);
							sLemmaId = fn.getDataFromCellNamed(confTable, aAllRows[0], "lemma_id");
							
							}
						
						
						
						fn.callFunction("insert_wordform", 
								[sLemmaId, sWordform, sWordformPos], 
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
							var sAnalyzedWfId = fn.getDataFromCellNamed(confTable, this, "pkid");
							
							fn.removeFromDatabaseGivenFieldValues("analyzed_wordforms", 
									{"analyzed_wordform_id": sAnalyzedWfId}, 
									false,
									function(){
										if (bLastRow) fn.refreshTable(confTable);
									});
							
						});
					}
					
				}
			}

		}
};


// configuration at column level
oTableConfigurationList = {
		
		wrong_to_correct_view:{
			
			pkid: {
				"visible": false
			},
			spelling_version_id:{
				"visible": false
			},
			spellingname: {
				"editable": true
			},
			
			judgement: {
				"editable": true
			},
			wrong_wordform: {
				"editable": true
			},
			correct_wordform: {
				"editable": true
			},
			wrong_wordform_id:{
				"visible": false
			},
			correct_wordform_id:{
				"visible": false
			}
		},
		
		
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
			
			"doet_mee":{
				"editable": true,
				"editcallback": function(t, n, value){
					var sLemmaId = fn.getDataFromSiblingNode(t, n, "pkid");
					fn.updateDatabaseGivenFieldValues("analyzed_wordforms", {"lemma_id": sLemmaId}, {"doet_mee": true});
				}
			},
			
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
				"editable": true
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
			"doet_mee":{
				"editable": true
			},
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
				"editable": true
			},
			"comment": {
				
			}
			
		}
};



fn.callDatabase("lemmata_view", null, function(){
	fn.callDatabase("paradigma_view", null, function(){
		fn.callDatabase("inputtable", null, function(){
			fn.callDatabase("wrong_to_correct_view", null, function(){
				fn.alignTables("inputtable", "wrong_to_correct_view", function(){
					fn.callDatabase("hulkfunction_view", null, function(){
						fn.pileupTables("inputtable", "hulkfunction_view");
					});
					
				});
			});
		});
	});
});