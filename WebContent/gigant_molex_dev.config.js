// list of tables that must be hidden or visible (don't use both, it's a matter of what's the most convenient)
oHiddenTablesList = [];
oShowOnlyTables = ["non_homonyms_worktable_verbs", 
                   "non_homonyms_worktable_nouns", 
                   "non_homonyms_worktable_rest",
                   
                   "logfiles_worktable_verbs", 
                   "logfiles_worktable_nouns", 
                   "logfiles_worktable_rest", 
                   
                   "lemmata_view"];



// remember chosen parent

var sChosenParentId = null;


// template 

var oLogfilesWorktableSettings = {
		
		button_0: {
			
			"name": "Voeg woordvorm toe voor het geselecteerde lemma",
			"click": function(t){					
				
				// log the user 
				var sUserName = fn.getCurrentUser();					
				
				// get all needed data to copy
				// NB: we don't copy analyzed_wordform_id, as new wordforms will get an awf_id
				//     of their own as we export this job back into the main gigant-molex-database
				var nSelectedNode = fn.getFirstSelectedRowFrom(t);
				var sLemmaId = fn.getDataFromCellInRowNode(t, nSelectedNode, "lemma_id");
				var sModernLemma = fn.getDataFromCellInRowNode(t, nSelectedNode, "modern_lemma");
				var sGloss = fn.getDataFromCellInRowNode(t, nSelectedNode, "gloss");
				var sGbId = fn.getDataFromCellInRowNode(t, nSelectedNode, "gb_id");
				var sLemmaGigpos = fn.getDataFromCellInRowNode(t, nSelectedNode, "lemma_gigpos");
				 
									
				fn.insertIntoDatabase(t, 
						{
					"lemma_id": sLemmaId,						
					"modern_lemma": sModernLemma,
					"gloss": sGloss,
					"gb_id": sGbId,
					"lemma_gigpos": sLemmaGigpos,
					"wordform": "-",
					"wordform_corr": "-",
					"wordform_gigpos": "-",
					"wordform_afbr": "-",
					"flex": "-",
					"verified_by": sUserName,
					"keurmerk": false,
					"autom_wf": false,
					"comment": "-",
					"source": "Nieuwe vorm logfilesklus",
					"nieuw": true
						}, 
						"unique_id", 
						false, 
						function(){
							
							// make sure the row that has been added gets selected
							fn.refreshTable(t,
									function(){
								
								var sIdOfInsertedRecord = fn.getLastDbResponse();
								var nNodeOfAddedRecord = fn.getNodeWhereIdIs(t, sIdOfInsertedRecord);
								var iIndexOfAddedRecord = fn.getRowNumberOnScreen(t, nNodeOfAddedRecord);									
								
								fn.unselectAllRows(t);									
								kf.setActiveRowNumber(iIndexOfAddedRecord);
							});
						});
				
				
			}
			
		},
		
		column_order: [
		              "unique_id",
		              
		              "lemma_id",
					  "modern_lemma",
					  "gloss",
					  "gb_id",
					  "lemma_gigpos",
					  
					  "analyzed_wordform_id",
					  "wordform",
					  "wordform_corr",
					  
					  "wordform_gigpos",
					  "wordform_afbr",
					  "flex",
					  "verified_by",
					  "keurmerk",
					  "autom_wf",
					  "comment",
					  "source",
					
					  "wordform_id",
					  
					  "rang",
					  
					  
					  "verwijderen",
					  "nieuw"
					]
	};

var oNonHomonymsWorktableSettings = {
		
		button_0: {
			
			"name": "Voeg woordvorm toe voor het geselecteerde lemma",
			"click": function(t){					
				
				// log the user 
				var sUserName = fn.getCurrentUser();					
				
				// get all needed data to copy
				// NB: we don't copy analyzed_wordform_id, as new wordforms will get an awf_id
				//     of their own as we export this job back into the main gigant-molex-database
				var nSelectedNode = fn.getFirstSelectedRowFrom(t);
				var sLemmaId = fn.getDataFromCellInRowNode(t, nSelectedNode, "lemma_id");
				var sModernLemma = fn.getDataFromCellInRowNode(t, nSelectedNode, "modern_lemma");
				var sGloss = fn.getDataFromCellInRowNode(t, nSelectedNode, "gloss");
				var sGbId = fn.getDataFromCellInRowNode(t, nSelectedNode, "gb_id");
				var sLemmaGigpos = fn.getDataFromCellInRowNode(t, nSelectedNode, "lemma_gigpos");
				 
									
				fn.insertIntoDatabase(t, 
						{
					"lemma_id": sLemmaId,						
					"modern_lemma": sModernLemma,
					"gloss": sGloss,
					"gb_id": sGbId,
					"lemma_gigpos": sLemmaGigpos,
					"wordform": "-",
					"wordform_corr": "-",
					"wordform_gigpos": "-",
					"wordform_afbr": "-",
					"flex": "-",
					"verified_by": sUserName,
					"keurmerk": false,
					"autom_wf": false,
					"comment": "-",
					"source": "Nieuwe vorm niet-homoniemenklus",
					"nieuw": true
						}, 
						"unique_id", 
						false, 
						function(){
							
							// make sure the row that has been added gets selected
							fn.refreshTable(t,
									function(){
								
								var sIdOfInsertedRecord = fn.getLastDbResponse();
								var nNodeOfAddedRecord = fn.getNodeWhereIdIs(t, sIdOfInsertedRecord);
								var iIndexOfAddedRecord = fn.getRowNumberOnScreen(t, nNodeOfAddedRecord);									
								
								fn.unselectAllRows(t);									
								kf.setActiveRowNumber(iIndexOfAddedRecord);
							});
						});
				
				
			}
			
		},
		
		column_order: [
		              "unique_id",
		              
		              "lemma_id",
					  "modern_lemma",
					  "gloss",
					  "gb_id",
					  "lemma_gigpos",
					  
					  "analyzed_wordform_id",
					  "wordform",
					  "wordform_corr",
					  
					  "wordform_gigpos",
					  "wordform_afbr",
					  "flex",
					  "verified_by",
					  "keurmerk",
					  "autom_wf",
					  "comment",
					  "source",
					
					  "wordform_id",
					  
					  "rang",
					  
					  
					  "verwijderen",
					  "nieuw"
					]
	};

// table general settings
oTableSettingsList = {
		
		non_homonyms_worktable_verbs: oNonHomonymsWorktableSettings,
		
		non_homonyms_worktable_nouns: oNonHomonymsWorktableSettings,
		
		non_homonyms_worktable_rest: oNonHomonymsWorktableSettings,
		
		logfiles_worktable_verbs: oLogfilesWorktableSettings, 
		
        logfiles_worktable_nouns: oLogfilesWorktableSettings, 
        
        logfiles_worktable_rest: oLogfilesWorktableSettings, 
		
		spelling_view: {
			
			"button_0":{
				"name": "Verbind woordvorm en lemma",
				"click": function(confTable){
						
					var nNode = fn.getFirstSelectedRowFrom(confTable);
					var iLemmaId = fn.getDataFromCellNamed(confTable, nNode, "lemma_id");
					
					var nNodeInUnknownWord = fn.getFirstSelectedRowFrom("woorden_zonder_oordeel");
					var sWordform = fn.getDataFromCellNamed("woorden_zonder_oordeel", nNodeInUnknownWord, "word");
					
					fn.callFunction("add_analyzed_wordform_for_lemma_id_and_wordform", 
							[iLemmaId, sWordform], null, null, null, null, 
							function(){
						var id = fn.getFunctionOutput()[0];
						

						fn.refreshTable(confTable);
					});
					
			
				}
			}
			
		},
		
		woorden_zonder_oordeel: {
			"size": "50%",
			"button_0": {
				"name": "Afkeuren",
				"click": function( t ){
					var nNode = fn.getFirstSelectedRowFrom(t);
					var sWord = fn.getDataFromCellNode(t, nNode);
					fn.removeFromDatabaseGivenFieldValues(t, {"word": sWord}, null, 
							function(){
						fn.refreshTable(t);
					});
				}
			}
		},
		
		lemmata_view: {
			
			"size": "90%",
			"button_0":{
				"name": "Voeg lemma toe",
				"click": function(confTable){
					
					var wordform = fn.prompt("Geef een lemma", 
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
			},
			"button_2":{
				"name": "Gekozen ouder:",
				"bgcolor":"yellow",
				"textcolor": "red",
				"click": function(confTable){
					
					var nNode = fn.getFirstSelectedRowFrom(confTable);
					
					if (nNode != null)
						{
						// remember chosen parent, and show it on the screen
						var sLemId = fn.getDataFromCellNamed(confTable, nNode, "pkid");
						var sLemma = fn.getDataFromCellNamed(confTable, nNode, "modern_lemma");
						
						fn.setCustomButtonName(confTable, 2, "Gekozen ouder:<b>"+sLemma+"</b>");
						sChosenParentId = sLemId;
						}

				}
			},
			"button_3":{
				"name": "Link ouder & kind",
				"bgcolor":"red",
				"textcolor": "yellow",
				"click": function(confTable){
					
					if (sChosenParentId != null)
						{
						var oNodes = fn.getSelectedRowsFrom(confTable);
						if (oNodes != null)
							{
							
							oNodes.each(function(){
								
								var sLemId = fn.getDataFromCellNamed(confTable, this, "pkid");
								var bLastNode = fn.isLastNodeOf(this, oNodes);
								fn.updateDatabaseGivenFieldValues("lemmata", 
										{"lemma_id": sLemId}, 
										{"parent_id": sChosenParentId}, 
										false,
										function(){
											if (bLastNode)
												{
												fn.refreshTable(confTable);
												// reset: no chosen parent
												fn.setCustomButtonName(confTable, 2, "Gekozen ouder:");
												sChosenParentId = null;
												}
										});
							});
							
							
							}
						else
							{
							alert("Kies een of meerdere sublemmata!");
							}
						
						
						}
					else
						{
						alert("Kies eerst een parent lemma!");
						}
				}
			},
			"button_4": {
				
				"name": "Unlink ouder",
				"bgcolor":"red",
				"textcolor": "yellow",
				"click": function(confTable){
					
					var oNodes = fn.getSelectedRowsFrom(confTable);
					if (oNodes != null)
						{
						oNodes.each(function(){
							var sLemId = fn.getDataFromCellNamed(confTable, this, "pkid");
							var bLastNode = fn.isLastNodeOf(this, oNodes);
							fn.updateDatabaseGivenFieldValues("lemmata", 
									{"lemma_id": sLemId}, 
									{"parent_id": 0}, 
									false,
									function(){
										if (bLastNode)
											{
											fn.refreshTable(confTable);
											// reset: no chosen parent
											fn.setCustomButtonName(confTable, 2, "Gekozen ouder:");
											sChosenParentId = null;
											}
									});
							});
						}
					else
						{
						alert("Kies een of meerdere sublemmata!");
						}
					
					
				}
			},
			"button_5": {
			
				"name": "Homo's only",
				"bgcolor":"green",
				"textcolor": "white",
				"click": function(confTable){
					
					fn.callDatabase(confTable, {"homo": true});
					
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




// template 

var oLogfilesWorkTableConfig = {
		
		"unique_id": {
			"visible": false
		},
		"lemma_id": {
			"visible": false
		},
		"modern_lemma": {
			"colsort": "asc" // [sort field #1]
		},
		"gloss": {
			"visible": false
		},
		"gb_id": {
			"visible": false
		},
		"lemma_gigpos": {
			"colsort": "asc" // [sort field #2]
		},
		  
		"analyzed_wordform_id": {
			"visible": false
		},
		"wordform_gigpos": {
			"bgcolor": "#E0F8EC",
			"editable": true,
			"editcallback": function(t, n, value){
				
				// log the user 
				var sUserName = fn.getCurrentUser();
				fn.updateDatabaseGivenANode(t, n, ["verified_by"], [sUserName]);
				
			}
		},
		"wordform_afbr": {
		
		},
		"flex": {
			"visible": false
		},
		"verified_by": {
			"visible": false
		},
		"keurmerk": {
			"visible": false
		},
		"autom_wf": {
			"visible": false
		},
		"comment": {
			"visible": false
		},
		"source": {
			"visible": false
		},
		
		"wordform_id": {
			"visible": false
		},
		"wordform": {
			"cell_tooltip": "Klik om woordvorm te kopiëren",
			"click": function(t, n){
				var sWordformToCopy = fn.getDataFromCellNode(t, n);
				fn.putDataIntoCell(t, fn.getRowNode(n), "wordform_corr", sWordformToCopy);
			}
		},
		"rang": {
			"visible": false,
			"colsort": "asc" // [sort field #3]
		},
		"wordform_corr": {
			"bgcolor": "#E0F8EC",
			"editable": true,
			"editcallback": function(t, n, value){
				
				// log the user 
				var sUserName = fn.getCurrentUser();
				fn.updateDatabaseGivenANode(t, n, ["verified_by"], [sUserName]);
			}
		},
		 
		"verwijderen": {
			"bgcolor": "#E0F8EC",
			"cell_tooltip": "Vink aan als deze woordvorm weg moet",
			"editable": true,
			"editcallback": function(t, n, value){
				
				// log the user 
				var sUserName = fn.getCurrentUser();
				fn.updateDatabaseGivenANode(t, n, ["verified_by"], [sUserName]);
			}
		},
		"nieuw": {
			"visible": false
		}
		
	};

var oNonHomonymsWorkTableConfig = {
	
	"unique_id": {
		"visible": false
	},
	"lemma_id": {
		"visible": false
	},
	"modern_lemma": {
		"colsort": "asc" // [sort field #1]
	},
	"gloss": {
		"visible": false
	},
	"gb_id": {
		"visible": false
	},
	"lemma_gigpos": {
		"colsort": "asc" // [sort field #2]
	},
	  
	"analyzed_wordform_id": {
		"visible": false
	},
	"wordform_gigpos": {
		"bgcolor": "#E0F8EC",
		"editable": true,
		"editcallback": function(t, n, value){
			
			// log the user 
			var sUserName = fn.getCurrentUser();
			fn.updateDatabaseGivenANode(t, n, ["verified_by"], [sUserName]);
			
		}
	},
	"wordform_afbr": {
	
	},
	"flex": {
		"visible": false
	},
	"verified_by": {
		"visible": false
	},
	"keurmerk": {
		"visible": false
	},
	"autom_wf": {
		"visible": false
	},
	"comment": {
		"visible": false
	},
	"source": {
		"visible": false
	},
	
	"wordform_id": {
		"visible": false
	},
	"wordform": {
		"cell_tooltip": "Klik om woordvorm te kopiëren",
		"click": function(t, n){
			var sWordformToCopy = fn.getDataFromCellNode(t, n);
			fn.putDataIntoCell(t, fn.getRowNode(n), "wordform_corr", sWordformToCopy);
		}
	},
	"rang": {
		"visible": false,
		"colsort": "asc" // [sort field #3]
	},
	"wordform_corr": {
		"bgcolor": "#E0F8EC",
		"editable": true,
		"editcallback": function(t, n, value){
			
			// log the user 
			var sUserName = fn.getCurrentUser();
			fn.updateDatabaseGivenANode(t, n, ["verified_by"], [sUserName]);
		}
	},
	 
	"verwijderen": {
		"bgcolor": "#E0F8EC",
		"cell_tooltip": "Vink aan als deze woordvorm weg moet",
		"editable": true,
		"editcallback": function(t, n, value){
			
			// log the user 
			var sUserName = fn.getCurrentUser();
			fn.updateDatabaseGivenANode(t, n, ["verified_by"], [sUserName]);
		}
	},
	"nieuw": {
		"visible": false
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
		
		non_homonyms_worktable_verbs: oNonHomonymsWorkTableConfig,
		
		non_homonyms_worktable_nouns: oNonHomonymsWorkTableConfig,
		
		non_homonyms_worktable_rest: oNonHomonymsWorkTableConfig,
		
		logfiles_worktable_verbs: oLogfilesWorkTableConfig,
		
		logfiles_worktable_nouns: oLogfilesWorkTableConfig,
		
		logfiles_worktable_rest: oLogfilesWorkTableConfig,
		
		
		woorden_zonder_oordeel: {
			"word": {
				"colsort": "asc",
				"click": function(t, n){
					
					var word = fn.getDataFromCellNode(t, n);
					var lemmaPrefixToLookUp = word.substring(0, word.length/3);
					fn.callDatabase("spelling_view", 
							{"modern_lemma": "^"+lemmaPrefixToLookUp});
				}
			}
		},
		
		

		lemmata_view: {
			
			"pkid":{				
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
				"colsort": "asc",
				"editable": true				
			},
			"th_lemma": {				
				"editable": true				
			},
			"keurmerk": {				
				"editable": true				
			},
			"sublemma_type": {				
				"editable": true				
			},
			"opmerking": {
				"editable": true
			},
			"gloss": {				
				"editable": true				
			},
			"lemma_gigpos": {				
				"editable": true				
			},	
			"gb_id":{				
				"visible": false
			},
			"gb_wrdcat": {
				"editable": true
			},
			"gb_znwlid": {
				"editable": true
			},
			"lidw": {
				"editable": true,
				"visible": false
			},
			"geslacht": {
				"editable": true,
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
				"editable": true,
				"visible": false
			},
			"homo":{
				"visible": false
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
				"cell_tooltip": "Klik om woordvorm te kopiëren",
				"click": function(t, n){
					var wf = fn.getDataFromCellNode(t, n);
					fn.putDataIntoCell(t, fn.getRowNode(n), "wordform_corr", wf);
				}
			},
			"wordform_corr":{	
				"bgcolor": "#E0F8EC",
				"editable": true
			},
			"wordform_afbr":{				
				"editable": true
			},
			"th_wordform": {				
				"visible": false				
			},
			"th_wordform_afbr": {				
				"visible": false				
			},
			"wordform_gigpos":{				
				"editable": true
			},
			"flex":{				
				"editable": true
			},
			"keurmerk":{				
				"editable": true
			},
			"comment": {
				"editable": true
			},
			
			"rang":{			
				"colsort": "asc",
				"visible": false
			}
			
		},
		
		spelling_view: {	
			
			"lemma_id": {
				"visible": false
			},
			"parent_id": {
				"visible": false
			},
			"toon_hoofdlemma": {
				"visible": false
			},
			
			"gb_id": {
				"visible": false
			},
			"analyzed_wordform_id": {
				"visible": false
			},
			"toon_hoofdlemma": {
				"visible": false
			},
			"flex": {
				"visible": false
			}
			
			
		}
};