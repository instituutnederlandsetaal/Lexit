// list of tables that must be hidden or visible (don't use both, it's a matter of what's the most convenient)
oHiddenTablesList = [];
oShowOnlyTables = ["anw_postags_corrigeren",
                   
                   "lexiconexport1", 
                   "lexiconexport2", 
                   "lexiconexport3", 
                   "spelling_logfiles_boukje", 
                   "spelling_logfiles_marjolijn_en_wil",
                   "spelling_logfiles_differences",
                   "spelling_logfiles_all",
                   "spelling_logfiles_all_sections",
                   "spelling_logfiles_afbreking",
                   "nieuwe_lemmata",
                   "nieuwe_mnw_lemmata",
                   "mnw_quotations",
                   "molex_homonyms_2014",
                   "logfiles_090514_pos",
                   "logfiles_pos_and_afbr_together",
                   
                   "logfiles_worktable_verbs", 
                   "logfiles_worktable_nouns", 
                   "logfiles_worktable_rest",
                   
                   "paradigmauitbr_oktober_2014_verbs",
                   "paradigmauitbr_oktober_2014_nouns",
                   "paradigmauitbr_oktober_2014_rest",
                   
                   
                   "non_homonyms_worktable_verbs", 
                   "non_homonyms_worktable_nouns", 
                   "non_homonyms_worktable_rest",
                   "klus_verwijslemmata", 
                   "anw_nieuwe_correctieronde_sept_2014"];



// setting object for the logfiles and non-homonyms jobs

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
					  
					  "opmerkingen",
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
					  
					  "opmerkingen",
					  "verwijderen",
					  "nieuw"
					]
	};





// table general settings

var oParadigmaUitbreidingOkt2014Settings = {
		
		button_0: {
			
			"name": "Voeg woordvorm toe voor het geselecteerde lemma",
			"click": function(t){					
				
				// log the user 
				var sUserName = fn.getCurrentUser();					
				
				// get all needed data to copy
				var nSelectedNode = fn.getFirstSelectedRowFrom(t);
				var sLemmaId = fn.getDataFromCellInRowNode(t, nSelectedNode, "lemma_id");
				var sModernLemma = fn.getDataFromCellInRowNode(t, nSelectedNode, "modern_lemma");				
				var sLemmaGigpos = fn.getDataFromCellInRowNode(t, nSelectedNode, "lemma_gigpos");
				 
							
				fn.insertIntoDatabase(t, 
					{
					"lemma_id": sLemmaId,						
					"modern_lemma": sModernLemma,					
					"lemma_gigpos": sLemmaGigpos,
					"wordform": "-",
					"wordform_corr": "-",
					"wordform_gigpos": "-",
					"verified_by": sUserName,					
					"opmerkingen": "-"
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
		
		"size": "80%"
};

oTableSettingsList = {
		
		paradigmauitbr_oktober_2014_verbs: oParadigmaUitbreidingOkt2014Settings,
		
		paradigmauitbr_oktober_2014_nouns: oParadigmaUitbreidingOkt2014Settings,
		
		paradigmauitbr_oktober_2014_rest: oParadigmaUitbreidingOkt2014Settings,
		
		
		
		anw_nieuwe_correctieronde_sept_2014: {
			"size": "80%",
			"column_order": ["lemma_id",
			                 "lemma",
			                 "lemma_corr",
			                 "pos",
			                 "pos_corr",
			                 "opmerkingen",
			                 "hulk_oordeel",
			                 "hulk_corr"]
		},
		
		anw_postags_corrigeren:{
			"size": "60%"
		},
		
		logfiles_worktable_verbs: oLogfilesWorktableSettings, 
		
        logfiles_worktable_nouns: oLogfilesWorktableSettings, 
        
        logfiles_worktable_rest: oLogfilesWorktableSettings,
		
		non_homonyms_worktable_verbs: oNonHomonymsWorktableSettings,
		
		non_homonyms_worktable_nouns: oNonHomonymsWorktableSettings,
		
		non_homonyms_worktable_rest: oNonHomonymsWorktableSettings,
		
		
		logfiles_pos_and_afbr_together: {
			"size": "60%"
		},
		
		logfiles_090514_pos: {
			"size": "60%"
		},

               klus_verwijslemmata: {
                     "nice_name": "Check de verwijslemmata",
                     "column_order":  ["histlemma", "refhistlemma", "corrected_modlemma", "refmodlemma", "nagekeken", "comment", "hulkcomment", "resolved", "type",  "historicallemmaid", "referencedlemmaid", "modlemma", "id", "info", "rowid"]
                },
		
		nieuwe_mnw_lemmata: {
			
			"nice_name": "MNW nieuwe lemmata",
			"size": "80%",
			"keyup": {
				"uparrow": function(t){
					var nRow = fn.getFirstSelectedRowFrom(t);
					var lemmaId = fn.getDataFromCellNamed(t, nRow, "lemma_id");					
					var mnwDeel = fn.getDataFromCellNamed(t, nRow, "mnw_deel");
					fn.callDatabase("mnw_quotations", {"lemma_id": lemmaId, "mnw_deel": mnwDeel});
				},
				"downarrow": function(t){
					var nRow = fn.getFirstSelectedRowFrom(t);
					var lemmaId = fn.getDataFromCellNamed(t, nRow, "lemma_id");					
					var mnwDeel = fn.getDataFromCellNamed(t, nRow, "mnw_deel");
					fn.callDatabase("mnw_quotations", {"lemma_id": lemmaId, "mnw_deel": mnwDeel});
				}
			},
			"column_order": ["lemma_id",
			                 "pos",
			                 "hulk_comment",			                 
			                 "modern_lemma",
			                 "comment",
			                 "modlem_correct",			                 
			                 "persistent_id",
			                 "externallemmaid",
			                 "opmerkingen",
			                 "mnw_deel",
			                 "id"]
		},
		
		nieuwe_lemmata: {
			
			"nice_name": "WNT nieuwe lemmata",
			"size": "70%",
			"keyup": {
				"uparrow": function(t){
					var nRow = fn.getFirstSelectedRowFrom(t);
					var lemmaId = fn.getDataFromCellNamed(t, nRow, "lemma_id");					
					fn.callDatabase("quotes_of_nieuwe_lemmata", {"lemma_id": lemmaId});
				},
				"downarrow": function(t){
					var nRow = fn.getFirstSelectedRowFrom(t);
					var lemmaId = fn.getDataFromCellNamed(t, nRow, "lemma_id");
					fn.callDatabase("quotes_of_nieuwe_lemmata", {"lemma_id": lemmaId});
				}
			},
			"column_order": ["lemma_id",
			                 "pos",
			                 "hulk_comment",
			                 "modern_lemma",			                 
			                 "modlem_correct",			                 
			                 "persistent_id",
			                 "opmerkingen",
			                 "section",
			                 "id"]
		},
		
		
		
		spelling_logfiles_afbreking: {
			size: "70%"
		},
		
		molex_homonyms_2014:{
			size: "90%",
			column_order: ["lemma_id", "lemma", "gigant_tag", "opmerkingen", "gloss", "wordforms"]
		},
		
		spelling_logfiles_differences: {
			size: "80%"
		},
		
		spelling_logfiles_all: {
			size: "80%"
		},
		
		spelling_logfiles_3000: {
			size: "80%"
		},
		
		lexiconexport1:{
			"nice_name": "Juridisch-Economisch Lexicon - deel 1",
			"size": "60%"
			
			
		},
		lexiconexport2:{
			"nice_name": "Juridisch-Economisch Lexicon - deel 2",
			"size": "60%"
			
			
		},
		lexiconexport3:{
			"nice_name": "Juridisch-Economisch Lexicon - deel 3",
			"size": "60%"			
			
		},
		
		spelling_logfiles_boukje: {
			
			column_order : ["section", 
			                "zoekvorm", 
			                "correcte_vorm",
			                "bron",
			                "hulkoordeel",
			                "f_rik2",
			                "f_chn",
			                "opmerkingen",
			                "spellingsvarianten",
			                "opnemen",
			                "id",
			                "alphabetical_order"]
		},
		
		spelling_logfiles_marjolijn_en_wil : {
			
			column_order : ["section", 
			                "zoekvorm", 
			                "correcte_vorm",
			                "bron",
			                "hulkoordeel",
			                "f_rik2",
			                "f_chn",
			                "opmerkingen",
			                "spellingsvarianten",
			                "opnemen",
			                "id",
			                "alphabetical_order"]
		}
		
};


// config object for the logfiles and non-homonyms jobs

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
			"visible": false
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
		"rang": {
			"visible": false,
			"colsort": "asc" // [sort field #3]
		},
		"wordform": {
			"colsort": "asc", // [sort field #4]
			"cell_tooltip": "Klik om woordvorm te kopiëren",
			"click": function(t, n){
				var sWordformToCopy = fn.getDataFromCellNode(t, n);
				fn.putDataIntoCell(t, fn.getRowNode(n), "wordform_corr", sWordformToCopy);
			}
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
		
		"opmerkingen": {
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
			"colsort": "asc", // [sort field #1]
			"cell_tooltip": "Klik om lemma te kopiëren",
			"click": function(t, n){
				var sLemmaToCopy = fn.getDataFromCellNode(t, n);
				fn.putDataIntoCell(t, fn.getRowNode(n), "wordform_corr", sLemmaToCopy);
			}
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
			"visible": false
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
		
		"rang": {
			"visible": false,
			"colsort": "asc" // [sort field #3]
		},
		"wordform": {
			"colsort": "asc", // [sort field #4]
			"cell_tooltip": "Klik om woordvorm te kopiëren",
			"click": function(t, n){
				var sWordformToCopy = fn.getDataFromCellNode(t, n);
				fn.putDataIntoCell(t, fn.getRowNode(n), "wordform_corr", sWordformToCopy);
			}
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
		
		"opmerkingen": {
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



var oParadigmaUitbreidingOkt2014 = {

	unique_id: {				
		"visible": false
	},
	lemma_id: {				
		"visible": false
	},
	modern_lemma: {
		"colsort": "asc", // [sort field #1]
		"cell_tooltip": "Klik om lemma te kopiëren",
		"click": function(t, n){
			var sLemmaToCopy = fn.getDataFromCellNode(t, n);
			fn.putDataIntoCell(t, fn.getRowNode(n), "wordform_corr", sLemmaToCopy);
		}
	},
	lemma_gigpos: {
		"colsort": "asc" // [sort field #2]
	},
	rang: {
		"visible": false,
		"colsort": "asc" // [sort field #3]
	},
	"wordform": {
		"colsort": "asc", // [sort field #4]
		"cell_tooltip": "Klik om woordvorm te kopiëren",
		"click": function(t, n){
			var sWordformToCopy = fn.getDataFromCellNode(t, n);
			fn.putDataIntoCell(t, fn.getRowNode(n), "wordform_corr", sWordformToCopy);
		}
	},
	opmerkingen:{	
		"bgcolor": "#D8F6CE",
		"editable": true,
		"editcallback": function(t, n, value){
			
			// log the user 
			var sUserName = fn.getCurrentUser();
			fn.updateDatabaseGivenANode(t, n, ["verified_by"], [sUserName]);
		}
	},
	wordform_corr: {	
		"bgcolor": "#D8F6CE",
		"editable": true,
		"editcallback": function(t, n, value){
			
			// log the user 
			var sUserName = fn.getCurrentUser();
			fn.updateDatabaseGivenANode(t, n, ["verified_by"], [sUserName]);
		}
	},
	wordform_gigpos: {	
		"bgcolor": "#D8F6CE",
		"editable": true,
		"editcallback": function(t, n, value){
			
			// log the user 
			var sUserName = fn.getCurrentUser();
			fn.updateDatabaseGivenANode(t, n, ["verified_by"], [sUserName]);
		}
	},
	verwijderen: {	
		"cell_tooltip": "Vink aan als deze woordvorm weg moet",
		"bgcolor": "#D8F6CE",
		"editable": true,
		"editcallback": function(t, n, value){
			
			// log the user 
			var sUserName = fn.getCurrentUser();
			fn.updateDatabaseGivenANode(t, n, ["verified_by"], [sUserName]);
		}
	},
	verified_by: {
		"visible": false
	}
};



// configuration at column level
var oLexiconexportConfigurationObject =  {
	
	orid_id: {
		"visible": false
	},
	word: {
		
	},
	id: {
		"visible": false,
		"colsort": "asc"
	},
	opmerking: {
		"editable": true,
		"bgcolor": ["#F2F2F2"]
	},
	correctie: {
		"editable": true,
		"bgcolor": ["#E0ECF8"]
	}
	
};

var oSpellingKlusRik = {
		
		"section": {
			"filter": '1',
			"choosefrom": []			
		},
		"id": {
			"visible": false
		},
		"zoekvorm": {
			"colsort": "asc"
		},
		"correcte_vorm": {				
			"editable": true,
			"bgcolor": ["#F2F2F2"]
		},
		"hulkoordeel": {
			
		},
		"opmerkingen": {
			"editable": true,
			"bgcolor": ["#E0ECF8"]
		},
		"spellingsvarianten": {
			
		},
		"opnemen": {
			"editable": true,
			"bgcolor": ["#E0ECF8"]
		},
		"alphabetical_order": {
			"visible": false
		}
		
		
	};


var oSpellingKlusRik2 = {
		
		"section": {
			"filter": '1',
			"choosefrom": []			
		},
		"id": {
			"visible": false
		},
		"zoekvorm": {
			"colsort": "asc"
		},
		"correcte_vorm": {						
			"bgcolor": ["#F2F2F2"]
		},
		"hulkoordeel": {
			
		},
		"opmerkingen": {			
			"bgcolor": ["#E0ECF8"]
		},
		"spellingsvarianten": {
			
		},
		"opnemen": {
			"choosefrom": [],
			"bgcolor": ["#E0ECF8"]
		},
		"alphabetical_order": {
			"visible": false
		},
		"in_gb05": {}
		
		
	};

oTableConfigurationList = {
		
		logfiles_pos_and_afbr_together: {
			
			id: {
				"visible": false
			}, 
			new_unique_id: {
				"visible": false
			}, 
			opmerkingen: {
				"editable": true
			},
			lemma: {
				"editable": true,
				"colsort": "asc"
			},
			pos: {
				"editable": true
			},
			afbreking: {
				"editable": true
			}
			
		},
		
		logfiles_worktable_verbs: oLogfilesWorkTableConfig,
		
		logfiles_worktable_nouns: oLogfilesWorkTableConfig,
		
		logfiles_worktable_rest: oLogfilesWorkTableConfig,
		
		non_homonyms_worktable_verbs: oNonHomonymsWorkTableConfig,
		
		non_homonyms_worktable_nouns: oNonHomonymsWorkTableConfig,
		
		non_homonyms_worktable_rest: oNonHomonymsWorkTableConfig,
		
		logfiles_090514_pos: {
			pos: {
				"editable": true,
				"bgcolor": ["#F2F2F2"]
				}
		},
		
		nieuwe_lemmata:{
			modern_lemma: {
				"colsort": "asc",
				"click": function(t, n){
					var sLem = fn.getDataFromCellNode(t, n);
					fn.putDataIntoCell(t, fn.getRowNode(n), "modlem_correct", sLem.trim());
				}
			},
			lemma_id: {
				"visible": false
			},
			id: {
				"visible": false
			},
			section: {
				"choosefrom": []
			},
			modlem_correct:{
				"bgcolor": "#F8E0EC",
				"editable": true
			},
			persistent_id:{
				"cell_tooltip": "Klik hier om de citaten te zien",
				"click": function(t, n){
					
					var lemmaId = fn.getDataFromSiblingNode(t, n, "lemma_id");
					fn.callDatabase("quotes_of_nieuwe_lemmata", {"lemma_id": lemmaId});
					
				}
			},
			hulk_comment: {
				"choosefrom": []
			},
			opmerkingen: {
				"bgcolor": "#F8E0EC",
				"editable": true
			}
		},
		
		nieuwe_mnw_lemmata:{
			pos: {
				
			},
			modern_lemma: {
				"colsort": "asc",
				"click": function(t, n){
					var sLem = fn.getDataFromCellNode(t, n);
					fn.putDataIntoCell(t, fn.getRowNode(n), "modlem_correct", sLem.trim());
				}
			},
			lemma_id: {
				"visible": false
			},
			id: {
				"visible": false
			},
			mnw_deel: {
				"choosefrom": []
			},
			modlem_correct:{
				"bgcolor": "#F8E0EC",
				"editable": true
			},
			comment: {
				"visible": false
			},
			externallemmaid: {
				"visible": false
			},
			persistent_id:{
				"cell_tooltip": "Klik hier om de citaten te zien",
				"click": function(t, n){
					
					var lemmaId = fn.getDataFromSiblingNode(t, n, "lemma_id");
					var mnwDeel = fn.getDataFromSiblingNode(t, n, "mnw_deel");
					fn.callDatabase("mnw_quotations", {"lemma_id": lemmaId, "mnw_deel": mnwDeel});
					
				}
			},
			hulk_comment: {
				"choosefrom": []
			},
			opmerkingen: {
				"bgcolor": "#F8E0EC",
				"editable": true
			}
		},
		
		quotes_of_nieuwe_lemmata: {
			lemma_id: {
				"visible": false
			}
		},
		
		mnw_quotations: {
			qid: {
				"visible": false
			},
			quotationsectionid: {
				"visible": false
			},
			lemma_id: {
				"visible": false
			},
			mnw_deel: {
				"visible": false
			}
		},
		
		
		spelling_logfiles_afbreking: {
			
			id: {
				"visible": false
			},
			unique_id: {
				"visible": false
			},
			lemma: {
				"colsort": "asc"
			},
			// clicking on this column must trigger copying of the content to a correction column 'afbr_correctie'
			afbreking: {
				
				"cell_tooltip": "Klik om dit te kopiëren naar de correctie-kolom",
				"click": function(t, n){
					var inhoud = fn.getDataFromCellNode(t, n);
					fn.updateDatabaseGivenANode(t, fn.getRowNode(n), 
							["afbr_correctie"], [inhoud], 
							false, 
							function(){fn.refreshTable(t);});
				}
				
			},
			afbr_correctie: {
				"bgcolor": "#F8E0EC",
				"editable": true
			},
			opmerkingen: {
				"editable": true
			},
			// LM'ers need the work to be cut into small sections 
			section: {
				"choosefrom": []
			}
			
		},
		
		spelling_logfiles_3000: {
			
			opmerkingen_commissie: {
				"editable": true,
				"bgcolor": ["#F2F2F2"]
			},
			in_gb05:{
				"choosefrom":[],
				"colsort": "desc"   // first sort
			},
			correcte_vorm: {
				"colsort": "asc"   // second sort
			},
			id: {
				"visible": false
			}
				
		},
		
		lexiconexport1: oLexiconexportConfigurationObject,
		
		lexiconexport2: oLexiconexportConfigurationObject,
		
		lexiconexport3: oLexiconexportConfigurationObject,
		
		spelling_logfiles_boukje: oSpellingKlusRik,
		
		spelling_logfiles_marjolijn_en_wil: oSpellingKlusRik,
		
		spelling_logfiles_all_sections: oSpellingKlusRik2,
		
		spelling_logfiles_differences: {
			"pkid": {
				"visible": false
			},
			"id": {
				
			},
			"zoekvorm": {
				"colsort": "asc"
			},
			"correcte_vorm": {
				"editable": true,
				"bgcolor": ["#F2F2F2"]
			},
			"opnemen": {
				"choosefrom": [],
				"editable": true,
				"bgcolor": ["#E0ECF8"]
			},
			"opmerkingen":{
				"editable": true
			},
			"section": {
				"choosefrom": []
			}
		},
		
		spelling_logfiles_all: {
			"pkid": {
				"visible": false
			},
			"id": {
				
			},
			"zoekvorm": {
				"colsort": "asc"
			},
			"correcte_vorm": {				
				"bgcolor": ["#F2F2F2"]
			},
			"opnemen": {
				"choosefrom": [],
				"bgcolor": ["#E0ECF8"]
			},
			"opmerkingen":{				
			},
			"section": {
				"choosefrom": []
			}
			
		},
		
		
		molex_homonyms_2014: {
			"lemma_id": {
				"visible": true,
				"cell_tooltip": "Klik hier om GB te openen",
				"click": function(t, n){					
					var lemma = "^"+fn.getDataFromSiblingNode(t, n, "lemma")+"$";
					
					if ( !$("#newDiv_dynamic").elementExists() )
						{
						var sWindowsWidth = $(window).width();
						$("#dynamic").append(
								$("<div></div>")
								.attr("id", "newDiv_dynamic")
								.html("<iframe width='"+sWindowsWidth+"' height='1024' src='http://gtb.dev.inl.loc/lexit/?db=gigp_spelling&table=lemmata_view&modern_lemma="+lemma+"'></iframe>")
								);
						fn.pileupTables("molex_homonyms_2014", "newDiv");
						$("#dynamic").find("#molex_homonyms_2014_dynamic table").focus();
						}
					else
						{
						var sWindowsWidth = $(window).width();;
						$("#dynamic").find("#newDiv_dynamic:first").html("<iframe width='"+sWindowsWidth+"' height='1024' src='http://gtb.dev.inl.loc/lexit/?db=gigp_spelling&table=lemmata_view&modern_lemma="+lemma+"'></iframe>");
						$("#dynamic").find("#molex_homonyms_2014_dynamic table").focus();
						}
					
				}
			},
			"lemma": {
				"editable": true,
				"colsort": "asc"
				
			},
			"gloss": {
				"bgcolor": "#D8D8D8",
				"editable": true
			},
			"opmerkingen": {				
				"editable": true
			}
		},
		
		paradigmauitbr_oktober_2014_verbs: oParadigmaUitbreidingOkt2014,
		paradigmauitbr_oktober_2014_nouns: oParadigmaUitbreidingOkt2014,
		paradigmauitbr_oktober_2014_rest: oParadigmaUitbreidingOkt2014,

		antilliaans: {
			
			id: {"visible": false},
			lemma: {"colsort": "asc"},
			corrected_lemma: {"editable": true, "bgcolor": "#D8F6CE"},
			pos: {},
			corrected_pos: { "editable": true, "bgcolor": "#D8F6CE"},
			opmerkingen: {"editable": true, "bgcolor": "#D8D8D8"},
			frequentie: {},
			an_score: {},
			typisch_an: {"editable": true, "bgcolor": "#D8F6CE"},
			weg: {"editable": true, "bgcolor": "#D8D8D8"}
		},
		
		anw_nieuwe_correctieronde_sept_2014: {
			lemma: {
				"colsort": "asc",
				"cell_tooltip": "Klik hier om lemma naar lemma_corr te kopiëren",
				"click": function(t, n){
					var sLemma = fn.getDataFromCellNode(t, n);
					fn.putDataIntoCell(t, fn.getRowNode(n), "lemma_corr", sLemma);
				}
		},
			lemma_corr : {"editable": true, "bgcolor": "#D8F6CE"},
			
			pos_corr : {"editable": true, "bgcolor": "#D8F6CE"},
			opmerkingen : {"editable": true, "bgcolor": "#D8D8D8"}
		},

               klus_verwijslemmata:
               {
                  rowid: { visible: false},
                  id: { visible: false},
                  info:  { visible: false},
                  type: { visible: false},
                  resolved: { visible: false},
                  histlemma: { "textstyle" : "oblique" },
                  refhistlemma: { "textstyle" : "oblique" },
                  corrected_modlemma: { editable: true, "bgcolor": ["#9999FF", "#6666FF"], "font-style": "italic" },
                  comment: { editable: true },
                  refmodlemma: {
                      "bgcolor": ["#FF9999", "#FF6666"],
                      "click":   function(confTable,confNode)
                          {
                            var l = fn.getDataFromSiblingNode(confTable, confNode, "refmodlemma");
                            fn.updateDatabaseGivenANode(confTable, confNode, "corrected_modlemma", l, true,
                                          function(){fn.refreshTable("verwijslemma_nakijkklus");});
                          }
                   },
                   historicallemmaid : {
				"button": "Verwijslemma",
				"button_tooltip": "Open woordenboek",
				"sortable": false,
				"click": function(confTable, confNode){
					var id = fn.getDataFromSiblingNode(confTable, confNode, "historicallemmaid");
					var dic = "WNT";
					var url = "http://gtb.inl.nl/iWDB/search?actie=article&wdb="+dic+"&id="+id+"&content-type=text/html; charset=utf-8";
					window.open(url);
				}
			},
                   referencedlemmaid: {
				"button": "Verwijst naar",
				"button_tooltip": "Open woordenboek",
				"sortable": false,
				"click": function(confTable, confNode){
					var id = fn.getDataFromSiblingNode(confTable, confNode, "referencedlemmaid");
					var dic = "WNT";
					var url = "http://gtb.inl.nl/iWDB/search?actie=article&wdb="+dic+"&id="+id+"&content-type=text/html; charset=utf-8";
					window.open(url);
				}
			}
              }
};