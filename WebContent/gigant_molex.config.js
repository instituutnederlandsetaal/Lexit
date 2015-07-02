// list of tables that must be hidden or visible (don't use both, it's a matter of what's the most convenient)
oHiddenTablesList = [];
oShowOnlyTables = (
					fn.getCurrentUser() == 'boukje' ||
					fn.getCurrentUser() == 'marjolijn' ||
					fn.getCurrentUser() == 'wil'
					) ?
		["lemmata_view", "modified_lemmata_view", "modified_paradigm_view", 
         "keurmerk_checklist", "gemiste_paradigma_correcties", "lemmata_en_paradigma_view",
         "paradigma_telling_check", "missende_afbrekingen", "paradigma_telling_check_overzicht",
         "lemmatawithgender",
         "raredubbelvormen", "sterke_werkwoorden",
         "surinaams_and_antilliaans_commissions_selections",
         "export_versions", "homonyms_to_check"]
	:
		["lemmata_view", "modified_lemmata_view", "modified_paradigm_view", "lemmata_en_paradigma_view",
		 "paradigma_telling_check", "missende_afbrekingen", "paradigma_telling_check_overzicht", "separabilityglosses",
		 "lemmatawithgender",
		 "raredubbelvormen",
		 "surinaams_and_antilliaans_commissions_selections",
		 "export_versions", "homonyms_to_check",
		 "gb05_not_in_gigmol", "gb05_not_in_gigmol_lemmaforms",
		 "gb05_not_in_gigmol_v2"];


fn.setProjectTitle("GigantMolex Productie Intern");


//remember chosen parent
var sChosenParentId = null;


// default mode is: neutral
// modes: 0: neutral
//        1: show only gedrukt 
//        2: sort by freq
var bGedruktModeOfLemmata = 0;
var bGedruktModeOfParadigm = 0; 



// function needed in 'keurmerk_checklist' table
var fnArrowFunction = function(t){
	
	var n = fn.getFirstSelectedRowFrom(t);
	
	var iAwfId = fn.getDataFromCellNamed(t, n, "analyzed_wordform_id");
	var iLemmaId = fn.getDataFromCellNamed(t, n, "lemma_id");
	
	fn.callDatabase("paradigma_view", {"lemma_id": iLemmaId});
};


// Array's to store the locked lemmata of the current view
// Those array's get updated at each table draw
var aCurrentLemmaViewLocks = new Array();
var aCurrentParadigmaViewLocks = new Array();



// function returns true if current user is a superuser
function superUser(){
	return (fn.getCurrentUser() == 'katrien' || 
			fn.getCurrentUser() == 'katrienvp' ||
			fn.getCurrentUser() == 'mathieu' ||
			fn.getCurrentUser() == 'jesse');
};


// table general settings
oTableSettingsList = {
		
export_versions:{
			
			"size": "80%",
			
			"button_0":{
				"name": "Voeg export-record toe",
				"click": function(t){
					
					fn.prompt("Geef record-info", 
							["major", "minor", "recipient", "comment"], 
							[0, 0, "", ""], 
							function(){
								var iMajor = fn.getPromptUserInput("major");
								var iMinor = fn.getPromptUserInput("minor");
								var sRecipient = fn.getPromptUserInput("recipient");
								var sComment = fn.getPromptUserInput("comment");
								
								fn.insertIntoDatabase(t, 
										{
										"major": iMajor,
										"minor": iMinor,
										"recipient": sRecipient,
										"comment": sComment
										}, null, true);
					});
				}
			},
			"button_1":{
				"name": "Verwijder selectie",
				"click": function(t){
					
					fn.confirm("Let op", "Weet u het zeker?", function(){
						
						var aNodes = fn.getSelectedRowsFrom(t);
						
						aNodes.each(function(){
							var nCurrentNode = this;
							
							var bLastRow = fn.isLastNodeOf(nCurrentNode, aNodes);
							fn.removeFromDatabaseGivenANode(t, nCurrentNode, bLastRow);	
							});
					});
					
					
					
				}
			}
		},
		
		lemmatawithgender:{
			
			"column_order": ["lemma_id",
			                 "modern_lemma",
			                 "lemma_gigpos",
			                 "gb_znwlid",
			                 "gender",
			                 "gender_corr",
			                 "ok",
			                 "gedrukt",
			                 "opmerking"
			                  ]
		},
		
		
		paradigma_telling_check_overzicht:{
			"size": "60%"
		},
		
		paradigma_telling_check: {
			"size": "60%",
			"column_order": ["lemma_id", "modern_lemma", "gigpos", "count", "gedrukt", "gecontroleerd"]
		},
		
		
		lemmata_en_paradigma_view:{
			
			"prereset_callback": function(t){
				
				bGedruktModeOfParadigm = 0;
				fn.addFilters(t, {"gedrukt": "", "f_total_rel": ""});
				putRightSortButtonName(t, 2, bGedruktModeOfParadigm);				
			},
			
			"repeat_callback": true,
			
			"callback": function(t){
				
				var sTableName = fn.getTableName(t);
				
				// build the UNlock button if it doesn't exist yet
				if ( superUser() && fn.getIndexOfButtonNamed(sTableName, "(Un)lock")<0)
					{
					fn.addCustomButton(t, {
						"name": "(Un)lock",
						"bgcolor": "#F5D0A9",
						"click": function(t){
							
							var aSelectedRows = fn.getSelectedRowsFrom(t);
							
							aSelectedRows.each(function(){
								
								var sLemmaId = fn.getDataFromCellNamed(t, this, "lemma_id");
								var bLastRow = fn.isLastNodeOf(this, aSelectedRows);
								
								if ($.inArray( sLemmaId, aCurrentParadigmaViewLocks ) >-1)
									{
									fn.callFunction("unlock_lemma", [sLemmaId], function(){
											if(bLastRow) fn.refreshTable(t);
											}
										);
									}
								else
									{
									fn.callFunction("lock_lemma", [sLemmaId], function(){
											if(bLastRow) fn.refreshTable(t);
											}
										);
									}
								
							});
							
						}
					});
					}
				
				var aRows = fn.getAllRows(t);
				
				aRows.each(function(){
					
					// make records with an empty wordform unclickable
					var sAwfId = fn.getDataFromCellNamed(t, this, "analyzed_wordform_id");
					if (sAwfId == '' || sAwfId == null)
						{
						
						fn.getCellElement(t, this, "wordform").editable('disable');
						fn.getCellElement(t, this, "wordform").css("opacity", "0.5");
						
						fn.getCellElement(t, this, "afbr_auto").find("input").attr("disabled", "disabled");
						fn.getCellElement(t, this, "afbr_auto").css("opacity", "0.5");
						
						fn.getCellElement(t, this, "wordform_gigpos").editable('disable');
						fn.getCellElement(t, this, "wordform_gigpos").css("opacity", "0.5");
						
						fn.getCellElement(t, this, "wf_keurmerk").find("input").attr("disabled", "disabled");
						fn.getCellElement(t, this, "wf_keurmerk").css("opacity", "0.5");
						
						fn.getCellElement(t, this, "comment").editable('disable');
						fn.getCellElement(t, this, "comment").css("opacity", "0.5");
						
						fn.getCellElement(t, this, "f_total_rel").editable('disable');
						fn.getCellElement(t, this, "f_total_rel").css("opacity", "0.5");
						}
					
					
					// gedrukt must be blue
					var bIsGedrukt = fn.getDataFromCellNamed(t, this, "gedrukt");
					if (bIsGedrukt == 't')
						{
						var aColList = mt.getListOfVisibleColumnsOf(sTableName);
						for (var i=0; i<aColList.length; i++)
							{
							var sColName = aColList[i];
							(fn.getCellElement(t, this, sColName)).css("color", "blue");						
							}
						}
					
					// diminutives must be green
					var sVerkleinwoord = fn.getDataFromCellNamed(t, this, "verkleinwoord");
					if (sVerkleinwoord != '-')
						{
						var aColList = mt.getListOfVisibleColumnsOf(sTableName);
						for (var i=0; i<aColList.length; i++)
							{
							var sColName = aColList[i];
							(fn.getCellElement(t, this, sColName)).css("color", "green");						
							}
						}
				});
				
				// apply locks
				
				var aLemmaIdsArr = new Array();
				aRows.each(function(i){
					
					aLemmaIdsArr[i] = fn.getDataFromCellNamed(t, this, "lemma_id");			
				});
				aLemmaIdsArr = getOnlyUniqueValues(aLemmaIdsArr);
				
				// get the list of locked lemmata
				// and modify the rows accordingly
				fn.callFunction("get_locks_of_lemmata", [ "'"+aLemmaIdsArr.join("|")+"'" ], function(){
					
					aCurrentParadigmaViewLocks = (fn.getFunctionOutput()[0]).split("|");
					
					aRows.each(function(i){
						
						var nThisRow = this;
						var sLemmaId = fn.getDataFromCellNamed(t, nThisRow, "lemma_id");	
						
						if ( $.inArray( sLemmaId, aCurrentParadigmaViewLocks ) >-1 )
							{
							var aVisibleCells = mt.getListOfVisibleColumnsOf(fn.getTableName(t));
							
							for (var j=0; j<aVisibleCells.length; j++)
								{
								var sCurrentColumnName = aVisibleCells[j];
								
								// we mustn't lock the comment field
								if (sCurrentColumnName == 'comment_intern')
									continue;
								
								// make sure we can't edit the locked lemmata
								var sCellType = fn.getCellType(t, nThisRow, sCurrentColumnName);								
								var eCell = fn.getCellElement(t, nThisRow, sCurrentColumnName);
								
								if (sCellType == 'text')
									{									
									eCell.editable('disable');
									eCell.css("opacity", "0.5");
									}
								else if (sCellType == 'checkbox')
									{
									eCell.find("input").attr("disabled", "disabled");
									eCell.css("opacity", "0.5");
									}
								else if (sCellType == 'selectbox')
									{
									eCell.editable('disable');
									eCell.css("opacity", "0.5");
									}
								}					
							
							}						
						
					});						
					
				}); // end of function call
				
			},			
			"button_0":{
				"name": "Voeg woordvorm toe",
				"click": function(confTable){
					
					var aAllRows;
					var sLemmaId;
					var sLemma = null;
					
					// is there is no paradigm yet, get the lemma id from the lemma table
					if (fn.tableIsEmpty(confTable))
						{
						aAllRows = fn.getSelectedRowsFrom("lemmata_view");
						sLemmaId = fn.getDataFromCellNamed("lemmata_view", aAllRows[0], "pkid");
						sLemma =  fn.getDataFromCellNamed("lemmata_view", aAllRows[0], "modern_lemma");
						}
					// otherwise just read it from the current table
					else
						{
						aAllRows = ( (fn.getSelectedRowsFrom(confTable)).length >0 ) ?
								fn.getSelectedRowsFrom(confTable) : fn.getAllRows(confTable);
						sLemmaId = fn.getDataFromCellNamed(confTable, aAllRows[0], "lemma_id");
						// in this particular case, sLemma will be
						// requested by following fn.getRecord call
						}
					
					
					if (sLemmaId == null || sLemmaId == '')
						{
						fn.message("Kies een lemma", "Selecteer het lemma waar een woordvorm aan moet worden toegevoegd.");
						}
					else
						{
						fn.getRecord("lemmata", sLemmaId, function(response){
							
							// if we don't have a modern_lemma to show, get it
							
							if (sLemma == null)
								sLemma =  response["modern_lemma"];						
							
							fn.prompt("Geef woordvorm voor '"+sLemma+"'", 
									["woordvorm", "wordform_gigpos", "aantal"], 
									["", "", "1"], 
									function(){
								
									var sWordform = fn.getPromptUserInput("woordvorm");
									var sWordformPos = fn.getPromptUserInput("wordform_gigpos");
									var sNumberToBeAdded = fn.getPromptUserInput("aantal");
									
									var iNumberToBeAdded = parseInt(sNumberToBeAdded);
									for (var wi = 0; wi<iNumberToBeAdded; wi++)
										{
										
										// when adding multiple wordforms, add an index to the pos,
										// to prevent doubling (which is not allowed by table definition)
										var sWordformPosToAdd = (iNumberToBeAdded>1) ? 
												(sWordformPos + wi) : sWordformPos;
										
										fn.callFunction("insert_wordform", 
												[sLemmaId, sWordform, sWordformPosToAdd], 
												function(){
											
											// when the end of the list of wordforms to add
											// has be reached, refresh the table to make those
											// visible
											if ( wi == (iNumberToBeAdded-1) )
												{			
												// clean cache to make sure
												// newly added forms at tail of the wordform list
												// won't be hidden because of a old table count
												// having a too little number of rows
												fn.cleanTableCache(fn.getTableName(confTable), function(){
													fn.refreshTable(confTable);
														}
													);												
												}
											
											});
										
										}
								});
								
							});	
						}
					
					
									
					
				}
			},
			
			"button_1":{
				
				"name": "Verwijder selectie",
				"click": function(t){
					
					fn.confirm("Verwijder selectie", "Weet u het zeker?", function(){
						
						var aRows = fn.getSelectedRowsFrom(t);
						
						aRows.each(function(){
							
							var bLastRow = fn.isLastNodeOf(this, aRows);
							
							fn.removeFromDatabaseGivenANode(t, this, false, function(){
								if (bLastRow) fn.refreshTable(t);
							});							
							
						});
						
					});
					
					
				}
			},
			"button_2":{
				
				"name": "Nu: neutraal",
				"bgcolor": "white",
                "textcolor": "blue",
				"click": function(t){
					
					// switch
					bGedruktModeOfParadigm++;
					if (bGedruktModeOfParadigm == 3)
						bGedruktModeOfParadigm = 0;
					
					var bGedrukt = "";
					if (bGedruktModeOfParadigm == 1)
						bGedrukt = true;
					else if (bGedruktModeOfParadigm == 2)
						bGedrukt = false;
					
					fn.addFilters(t, {"gedrukt": bGedrukt});
					
					// change the button text accordingly
					putRightSortButtonName(t, 2, bGedruktModeOfParadigm);
					
					if (bGedruktModeOfParadigm == 0)
						{
						fn.addFilters(t, {"f_total_rel": ""});
						fn.setSorting(t, {"modern_lemma": "asc", "rank": "asc"});
						}
					else if (bGedruktModeOfParadigm == 1)
						{
						fn.addFilters(t, {"f_total_rel": ""});
						fn.setSorting(t, {"modern_lemma": "asc", "rank": "asc"});
						}
					else if (bGedruktModeOfParadigm == 2)
						{
						fn.addFilters(t, {"f_total_rel": "."});
						fn.setSorting(t, {"f_total_rel": "desc", "modern_lemma": "asc", "rank": "asc"});
						}
					// keep search values visible in the search boxes
					sf.putCurrentValueInAllSearchBoxes(fn.getTableName(t));
					
				}
			},
			
			"button_3":{
				
				"name": "AA opblazen",
				"click": function(t){
					
					var aRows = fn.getSelectedRowsFrom(t);
					
					var nNode = aRows[0];
					
					var pos = fn.getDataFromCellNamed(t,nNode, "wordform_gigpos");
					
					if ( pos != 'AA(degree=pos)' )
						{
						fn.message("Niet toegestaan!", "Let op: AA's opblazen is alleen mogelijk op basis van AA(degree=pos)");
						}
					else
						{
						var sAwfId = fn.getDataFromCellNamed(t, nNode, "analyzed_wordform_id");
						
						fn.callFunction("add_missing_comps_and_sups", [sAwfId], function(){
							fn.refreshTable(t);
							});
						}					
					
				}
			}
		},
		
		
		gemiste_paradigma_correcties: {
			
			"callback": function(t){
				
				conf.changeTableConfigValue("paradigma_view", "source", "visible", false);
				conf.changeTableConfigValue("paradigma_view", "flex", "visible", false);
				fn.callDatabase("paradigma_view", {}, null, {"displaylength": "50"});
			}
			
		},
		
		keurmerk_checklist: {
			"size": "80%",
			
			"keyup" : {				
				
				"uparrow": function(t){
					fnArrowFunction(t);
				},
				"downarrow": function(t){
					fnArrowFunction(t);
				}
			}
		},
		
		modified_lemmata_view: {
			
			"button_0":{
				"name": "Lemma en paradigma herstellen",
				"click": function(confTable){
					
					fn.confirm("Zeker weten?", "Weet u het zeker? Als de log groot is, kan deze operatie enige tijd kosten.", 
							function(){
						
						var aRowSelection = fn.getSelectedRowsFrom(confTable);
						
						aRowSelection.each(function(){
							
							var nCurrentNode = this;
							var sLemmaId = fn.getDataFromCellNamed(confTable, nCurrentNode, "lemma_id");
							fn.callFunction("restore_lemma_and_paradigm_and_ids", [sLemmaId],  
									function(){
										if (fn.isLastNodeOf(nCurrentNode, aRowSelection))
											fn.refreshTable(confTable);
							});
						});
					});
				}
			}
		},
		
		modified_paradigm_view:{
			
			"button_0":{
				"name": "Woordvorm herstellen",
				"click": function(confTable){
					
					fn.confirm("Zeker weten?", "Weet u het zeker?", 
							function(){
						
						var aRowSelection = fn.getSelectedRowsFrom(confTable);
						
						aRowSelection.each(function(){
							
							var nCurrentNode = this;
							var sAwfId = fn.getDataFromCellNamed(confTable, nCurrentNode, "analyzed_wordform_id");
							fn.callFunction("restore_wordform", [sAwfId],  
									function(){
										if (fn.isLastNodeOf(nCurrentNode, aRowSelection))
											fn.refreshTable(confTable);
							});
						});
					});
				}
			}
		},
		

		lemmata_view: {
			
			"prereset_callback": function(confTable){
				
				//fn.addFilters(confTable, {"homo": ""});
				
				sChosenParentId = null;
				fn.setCustomButtonName(confTable, 2, "Gekozen ouder:");
				
				
				bGedruktModeOfLemmata = 0;
				fn.addFilters(confTable, {"gedrukt": "", "tmp_f_total_rel": ""});
				putRightSortButtonName(confTable, 5, bGedruktModeOfLemmata);	
				
			},
			
			"repeat_callback": true,
			
			"callback": function(t){				
				
				
				var sTableName = fn.getTableName(t);
				
				// build the UNlock button if it doesn't exist yet
				if ( superUser() && fn.getIndexOfButtonNamed(sTableName, "(Un)lock")<0)
					{										
					fn.addCustomButton(sTableName, {
						"name": "(Un)lock",
						"bgcolor": "#F5D0A9",
						"click": function(t){
							
							var aSelectedRows = fn.getSelectedRowsFrom(t);
							
							aSelectedRows.each(function(){
								
								var sLemmaId = fn.getRowId(this);
								var bLastRow = fn.isLastNodeOf(this, aSelectedRows);
								
								if ($.inArray( sLemmaId, aCurrentLemmaViewLocks ) >-1)
									{
									fn.callFunction("unlock_lemma", [sLemmaId], function(){
											if(bLastRow) fn.refreshTable(t);
											}
										);
									}
								else
									{
									fn.callFunction("lock_lemma", [sLemmaId], function(){
											if(bLastRow) fn.refreshTable(t);
											}
										);
									}
								
							});
							
						}
					});
					}
				
				var aRows = fn.getAllRows(t);
				
				aRows.each(function(){
					
					// gedrukt must be blue
					var bIsGedrukt = fn.getDataFromCellNamed(t, this, "gedrukt");
					if (bIsGedrukt == 't')
						{
						var aColList = mt.getListOfVisibleColumnsOf(sTableName);
						for (var i=0; i<aColList.length; i++)
							{
							var sColName = aColList[i];
							(fn.getCellElement(t, this, sColName)).css("color", "blue");						
							}
						}
					
					// give parent other color (so they are recognizable)
					var bIsParent = fn.getDataFromCellNamed(t, this, "is_parent");					
					if (bIsParent == 't')
						{
						var aColList = mt.getListOfVisibleColumnsOf(sTableName);
						for (var i=0; i<aColList.length; i++)
							{
							var sColName = aColList[i];
							(fn.getCellElement(t, this, sColName)).css("color", "salmon");						
							}
						}								
					
					// diminutives must be green
					var sVerkleinwoord = fn.getDataFromCellNamed(t, this, "verkleinwoord");
					if (sVerkleinwoord != '-')
						{
						var aColList = mt.getListOfVisibleColumnsOf(sTableName);
						for (var i=0; i<aColList.length; i++)
							{
							var sColName = aColList[i];
							(fn.getCellElement(t, this, sColName)).css("color", "green");						
							}
						}
					
					
					});
				
				
				// apply locks
				
				var aLemmaIdsArr = new Array();
				aRows.each(function(i){
					
					aLemmaIdsArr[i] = fn.getRowId(this);					
				});
				
				// get the list of locked lemmata
				// and modify the rows accordingly
				fn.callFunction("get_locks_of_lemmata", [ "'"+aLemmaIdsArr.join("|")+"'" ], function(){
					
					aCurrentLemmaViewLocks = (fn.getFunctionOutput()[0]).split("|");
					
					aRows.each(function(i){
						
						var nThisRow = this;
						
						if ( $.inArray( fn.getRowId(nThisRow), aCurrentLemmaViewLocks ) >-1 )
							{
							var aVisibleCells = mt.getListOfVisibleColumnsOf(fn.getTableName(t));
							
							for (var j=0; j<aVisibleCells.length; j++)
								{
								var sCurrentColumnName = aVisibleCells[j];
								
								// we mustn't lock the comment field
								if (sCurrentColumnName == 'opmerking_intern')
									continue;
								
								
								// make sure we can't edit the locked lemmata
								var sCellType = fn.getCellType(t, nThisRow, sCurrentColumnName);								
								var eCell = fn.getCellElement(t, nThisRow, sCurrentColumnName);
								
								if (sCellType == 'text')
									{									
									eCell.editable('disable');
									eCell.css("opacity", "0.5");
									}
								else if (sCellType == 'checkbox')
									{
									eCell.find("input").attr("disabled", "disabled");
									eCell.css("opacity", "0.5");
									}
								else if (sCellType == 'selectbox')
									{
									eCell.editable('disable');
									eCell.css("opacity", "0.5");
									}
								}					
							
							}						
						
					});
					

						
					
				}); // end of function call
				
				
			},			
			
	
			"keyup" : {				
				
				"f9": function(confTable){
					
					var nNode = fn.getFirstSelectedRowFrom(confTable);
					var sLemmaId = fn.getDataFromCellNamed(confTable, nNode, "pkid");
					fn.callDatabase("lemmata_en_paradigma_view", {"lemma_id": sLemmaId}, null, {ignore_initialisation_filters: true});
				}
			},
			
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
								function(){
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
					
					// press shift + click to cancel parent selection 
					if (kf._getPressedKey() == 'shift')
					{
					fn.setCustomButtonName(confTable, 2, "Gekozen ouder:");
					sChosenParentId = null;
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
												
												// reset: no chosen parent, to prevent accidental linking
												// [commented out, because Katrien doesn't like this]
												//fn.setCustomButtonName(confTable, 2, "Gekozen ouder:");
												//sChosenParentId = null;
												
												fn.updateDatabaseGivenFieldValues("lemmata", 
														{"lemma_id": sChosenParentId}, 
														{"is_parent": true}, 
														false, 
														function(){fn.refreshTable(confTable);});
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
							var sParentId = fn.getDataFromCellNamed(confTable, this, "parent_id");
							var bLastNode = fn.isLastNodeOf(this, oNodes);
							fn.updateDatabaseGivenFieldValues("lemmata", 
									{"lemma_id": sLemId}, 
									{"parent_id": 'NULL'}, 
									false,
									function(){
										if (bLastNode)
											{
											
											fn.callFunction("set_parent_to_false", [sParentId],
													function(){
												
												fn.refreshTable(confTable);
												// reset: no chosen parent
												fn.setCustomButtonName(confTable, 2, "Gekozen ouder:");
												sChosenParentId = null;
												});
											
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
//			"button_5": {
//			
//				"name": "Homo's only",
//				"bgcolor":"green",
//				"textcolor": "white",
//				"click": function(confTable){
//					
//					fn.addFilters(confTable, {"homo": true});
//					fn.refreshTable(confTable);
//					//fn.callDatabase(confTable, {"homo": true});
//					
//				}
//				
//			},
			"button_5":{
				
				"name": "Nu: neutraal",
				"bgcolor": "white",
                "textcolor": "blue",
				"click": function(t){
					
					// switch
					bGedruktModeOfLemmata++;
					if (bGedruktModeOfLemmata == 3)
						bGedruktModeOfLemmata = 0;
					
					var bGedrukt = "";
					if (bGedruktModeOfLemmata == 1)
						bGedrukt = true;
					else if (bGedruktModeOfLemmata == 2)
						bGedrukt = false;
					
					fn.addFilters(t, {"gedrukt": bGedrukt});
					
					// change the button text accordingly
					putRightSortButtonName(t, 5, bGedruktModeOfLemmata);
					
					if (bGedruktModeOfLemmata == 0)
						{
						fn.addFilters(t, {"tmp_f_total_rel": ""});
						fn.setSorting(t, {"modern_lemma": "asc"});
						}
					else if (bGedruktModeOfLemmata == 1)
						{
						fn.addFilters(t, {"tmp_f_total_rel": ""});
						fn.setSorting(t, {"modern_lemma": "asc"});
						}
					else if (bGedruktModeOfLemmata == 2)
						{
						fn.addFilters(t, {"tmp_f_total_rel": "."});
						fn.setSorting(t, {"tmp_f_total_rel": "desc", "modern_lemma": "asc"});
						}
					// keep search values visible in the search boxes
					sf.putCurrentValueInAllSearchBoxes(fn.getTableName(t));
					
				}
			}
			
		},
		paradigma_view: {
			
			"repeat_callback": true,
			
			"callback": function(t){
				
				var aRows = fn.getAllRows(t);
				var sTableName = fn.getTableName(t);
				
				// If the LM'er is working with the keurmerk_checklist
				// we need to highlight some lines (= show relevant lines).
				// Otherwise, we don't need to.
				if (fn.tableExists("keurmerk_checklist"))
					{
					
					aRows.each(function(){
						
						var sSource = fn.getDataFromCellNamed(t, this, "source");
						
						if (sSource == 'niet-homoniemen Molex')
							{
							var aColList = mt.getListOfVisibleColumnsOf(sTableName);
							for (var i=0; i<aColList.length; i++)
								{
								var sColName = aColList[i];
								(fn.getCellElement(t, this, sColName)).css("color", "red");
								
								}
							
							
							}
						
						});
					}
				
			},
			
			"keyup" : {	
				
				"ctrl": function(t){
					
					// if the LM'er is working with the keurmerk_checklist
					// we need him/her to be able to toggle keurmerk checkbox
					// in paradigma view with the ctrl button.
					// Otherwise, we don't need this.
					if (fn.tableExists("keurmerk_checklist"))
					{
						var n = fn.getFirstSelectedRowFrom(t);
						
						//fn.toggleCheckbox(t, n, "keurmerk");
						
						// Lex'it engine not updated yet, so use 
						// fn.toggleCheckbox function code instead of true function
						(fn.getCellElement(t, n, "keurmerk")).find("input").eq(0).focus();
						(fn.getCellElement(t, n, "keurmerk")).find("input").eq(0).click();
						(fn.getCellElement(t, n, "keurmerk")).find("input").eq(0).blur();
					}
					
					
				}
			},
			
			"size": "90%",
			"button_0":{
				"name": "Voeg woordvorm toe",
				"click": function(confTable){
					
					var aAllRows;
					var sLemmaId;
					var sLemma = null;
					
					// is there is no paradigm yet, get the lemma id from the lemma table
					if (fn.tableIsEmpty(confTable))
						{
						aAllRows = fn.getSelectedRowsFrom("lemmata_view");
						sLemmaId = fn.getDataFromCellNamed("lemmata_view", aAllRows[0], "pkid");
						sLemma =  fn.getDataFromCellNamed("lemmata_view", aAllRows[0], "modern_lemma");
						}
					// otherwise just read it from the current table
					else
						{
						aAllRows = ( (fn.getSelectedRowsFrom(confTable)).length >0 ) ?
								fn.getSelectedRowsFrom(confTable) : fn.getAllRows(confTable);
						sLemmaId = fn.getDataFromCellNamed(confTable, aAllRows[0], "lemma_id");
						// in this particular case, sLemma will be
						// requested by following fn.getRecord call
						}
					
					
					
					fn.getRecord("lemmata", sLemmaId, function(response){
					
						// if we don't have a modern_lemma to show, get it
						
						if (sLemma == null)
							sLemma =  response["modern_lemma"];						
						
						fn.prompt("Geef woordvorm voor '"+sLemma+"'", 
								["woordvorm", "wordform_gigpos"], 
								["", ""], 
								function(){
							
								var sWordform = fn.getPromptUserInput("woordvorm");
								var sWordformPos = fn.getPromptUserInput("wordform_gigpos");
							
								fn.callFunction("insert_wordform", 
										[sLemmaId, sWordform, sWordformPos], 
										function(){
									fn.refreshTable(confTable);
								});
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


function putRightSortButtonName(t, iButtonNumber, bGedruktMode){
	var sText;
	if (bGedruktMode == 0)
		sText = "Nu: neutraal";
	else if (bGedruktMode == 1)
		sText = "Nu: alleen gedrukt";
	else if (bGedruktMode == 2)
		sText = "Nu: gesorteerd naar freq";
	fn.setCustomButtonName(t, iButtonNumber, sText );
}


// configuration at column level
oTableConfigurationList = {
		
		lemmata_en_paradigma_view: {
			
			unique_id:{
				"visible": false
			},
			analyzed_wordform_id:{
				"visible": false
			}, 
			lemma_id:{
				"visible": false,
				"click": function(t, n){
					var sLemmaId = fn.getDataFromCellNode(t, n);
					fn.callDatabase("lemmata_view", {"pkid": sLemmaId});
				}
			}, 
			wordform_id:{
				"visible": false
			},
			modern_lemma:{
				
				"colsort": "asc",    // sort #1
				"click": function(t, n){
					var sLemmaId = fn.getDataFromSiblingNode(t, n, "lemma_id");
					fn.callDatabase("lemmata_view", {"pkid": sLemmaId});
				}
			}, 
			lemma_gigpos:{
				"click": function(t, n){
					var sLemmaId = fn.getDataFromSiblingNode(t, n, "lemma_id");
					fn.callDatabase("lemmata_view", {"pkid": sLemmaId});
				}
			}, 
			lem_keurmerk:{
				"click": function(t, n){
					var sLemmaId = fn.getDataFromSiblingNode(t, n, "lemma_id");
					fn.callDatabase("lemmata_view", {"pkid": sLemmaId});
				}
			},
			lem_source:{
				"visible": false,
				"click": function(t, n){
					var sLemmaId = fn.getDataFromSiblingNode(t, n, "lemma_id");
					fn.callDatabase("lemmata_view", {"pkid": sLemmaId});
				}
			},
			wordform:{
				"editable": true,
				"editcallback": function(t, n, value){
					
					fn.refreshTable(t);
						
//					var sAwfId = fn.getDataFromCellNamed(t, n, "analyzed_wordform_id");
						
//					fn.callFunction("modify_wordform_and_get_id", [sAwfId, value], function(response){						
//						// add the wordform_id in the current table too (as it must synchronize)
//						var sWordformId = parseInt(response["modify_wordform_and_get_id"]);
//						fn.updateDatabaseGivenANode(t, n, ["wordform_id"], [sWordformId], false, function(){
//							
//							fn.callFunction("check_analyzedwordforms", [sAwfId], function(response){
//								
//								processAwfCheck(sAwfId, response);
//							});
//							
//						});
//						
//						
//					});
					
				}
			}, 
			wordform_gigpos:{
				"editable": true,
				"editcallback": function(t, n, value){					
					
					// get the rank corresponding to this pos
					// (we need to escape the parenthesis, as Lex'it cannot know those are no
					//  part of any regex)
					fn.getRecordGivenFieldValues("pos_to_rang", {"pos": fn.escapeRegexChars(value)}, 
							function(record){
							
								var sRangvalue = record["rang"];								
								var iRankvalue = (typeof sRangvalue != 'undefined') ? parseInt(sRangvalue) : 0;
								
								fn.updateDatabaseGivenANode(t, n, ["rank"], [iRankvalue], false, function(){
									
									// update rank in the analyzed_wordforms too
									var sAwfId = fn.getDataFromCellNamed(t, n, "analyzed_wordform_id");
									fn.updateDatabaseGivenFieldValues("analyzed_wordforms", 
											{"analyzed_wordform_id": sAwfId}, 
											{//"wordform_gigpos": value, 
												"rank": iRankvalue},
											false,
											function(){
												// refresh to make sorting according to 
												// paradigm position visible 
												fn.refreshTable(t, function(){
													
													fn.callFunction("check_analyzedwordforms", [sAwfId], function(response){
														
														processAwfCheck(sAwfId, response);
													});
												});
												
												}
												);
									
								});								
								
						});					
					
				}
			}, 
			wordform_afbr:{				
				"editable": true
//				,
//				
//				// update the analyzed_wordforms too
//				"editcallback": function(t, n, value){
//					var sAwfId = fn.getDataFromCellNamed(t, n, "analyzed_wordform_id");
//					fn.updateDatabaseGivenFieldValues("analyzed_wordforms", 
//							{"analyzed_wordform_id": sAwfId}, 
//							{"wordform_afbr": value},
//							false, 
//							function(){
//								
//								fn.callFunction("check_analyzedwordforms", [sAwfId], function(response){
//									
//									processAwfCheck(sAwfId, response);
//								});
//							});
//				}
			},
			afbr_auto:{
				"editable": true
			},
			online: {
				
			},
			publiceren: {
				"bgcolor": "#E0F8EC",
				"editable": true
			},
			wf_keurmerk:{
				"bgcolor": "#E0F8EC",
				"editable": true
//				,
//				
//				// update the analyzed_wordforms too
//				"editcallback": function(t, n, value){
//					
//					var sAwfId = fn.getDataFromCellNamed(t, n, "analyzed_wordform_id");
//					
//					fn.updateDatabaseGivenFieldValues("analyzed_wordforms", 
//							{"analyzed_wordform_id": sAwfId}, 
//							{"keurmerk": value}, 
//							false, 
//							function(){
//								
//								fn.callFunction("check_analyzedwordforms", [sAwfId], function(response){
//									
//									processAwfCheck(sAwfId, response);
//								});
//							});
//				}
			}, 
			rank:{
				"colsort": "asc",    // sort #2
				"visible": false
			},
			
			comment:{
				"bgcolor": "#E0F8EC",
				"editable": true
//				,
//				"editcallback": function(t, n, value){
//					
//					// update the analyzed_wordforms too
//					var sAwfId = fn.getDataFromCellNamed(t, n, "analyzed_wordform_id");
//					fn.updateDatabaseGivenFieldValues("analyzed_wordforms", 
//							{"analyzed_wordform_id": sAwfId}, 
//							{"comment": value}, 
//							false, 
//							function(){
//								
//								fn.callFunction("check_analyzedwordforms", [sAwfId], function(response){
//									
//									processAwfCheck(sAwfId, response);
//								});
//							});
//				}
			},
			comment_intern: {
				
				// BEWARE, DON'T REMOVE THIS PART
				// ------------------------------
				"flexible_visibility": false,
				"visible": (document.URL.indexOf( "gtb.dev.inl.loc" )>-1),
				// ------------------------------
				
				"bgcolor": "#E0F8EC",
				"editable": true
//				,
//				"editcallback": function(t, n, value){
//					
//					// update the analyzed_wordforms too
//					var sAwfId = fn.getDataFromCellNamed(t, n, "analyzed_wordform_id");
//					fn.updateDatabaseGivenFieldValues("analyzed_wordforms", 
//							{"analyzed_wordform_id": sAwfId}, 
//							{"comment_intern": value}, 
//							false, 
//							function(){
//								
//								fn.callFunction("check_analyzedwordforms", [sAwfId], function(response){
//									
//									processAwfCheck(sAwfId, response);
//								});
//							});
//				}
			},
			wf_source:{
				"visible": false
			}, 
			autom_wf:{
				"visible": false
			}, 
			gedrukt:{
				
				//"filter": true
			},
			vk_status:{
				"visible": false
			},
			th_wordform_afbr:{
				"bgcolor": "#E0F8EC",
				"editable": true
			}
			
		},
		
		
		
		
		modified_lemmata_view: {
			"modification_date":{
				"colsort": "desc" // sort #1
			},
			"modification_time": {
				"colsort": "desc" // sort #2
			}
		},
		
		modified_paradigm_view: {
			"modification_date":{
				"colsort": "desc" // sort #1
			},
			"modification_time": {
				"colsort": "desc" // sort #2
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
			
			"pkid":{				
//				"visible": false
			},
			"is_parent":{				
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
			"online": {
				"bgcolor": "#E0F8EC",
				"editable": true //,
//				"editcallback": function(t, n, value){
//					// setting online=false automatically means gedrukt=false
//					if (value == false)
//						{						
//						fn.updateDatabaseGivenANode(t, fn.getRowNode(n), ["gedrukt"], [value], true);
//						}
//				} 
			},
			"publiceren": {
				
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
				"visible": false // this column is only for transit of opmerking_extern
			},
			"opmerking_extern": {				
				"editable": true
			},
			"notitie": {				
				"editable": true
			},
			"opmerking_intern": {
				// BEWARE, DON'T REMOVE THIS PART
				// ------------------------------
				"flexible_visibility": false,
				"visible": (document.URL.indexOf( "gtb.dev.inl.loc" )>-1),
				// ------------------------------
				"editable": true
			},
			"gloss": {				
				"editable": true				
			},
			"kapstok": {				
				"editable": true
			},
			"lemma_gigpos": {				
				"editable": true				
			},	
			"gb_id":{				
				"visible": false,
				"editable": superUser()
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
					fn.callDatabase("lemmata_en_paradigma_view", {"lemma_id": lemma_id}, null, {ignore_initialisation_filters: true});
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
				
			},
			"weg": {
				"visible": false,
				"editable": true
			},
			"verdacht": {
				"visible": false,
				"editable": true
			},
			"taaladvies": {
				"editable": true
			},
			"uitspraak": {
				"editable": true
			},
			"status": {
				"editable": true
			},
			"nuanc_opm": {
				"editable": true
			},
			"taalvariant": {
				"editable": true
			},
			"herkomst": {
				"editable": true
			},
			"gedrukt": {
				"editable": (fn.getCurrentUser()=='katrien' || fn.getCurrentUser()=='katrienvp'), // only Katrien is entitled to change that
				"editcallback": function(t, n, value){
					// setting gedrukt=true automatically means online=true
					if (value == true)
						{						
						fn.updateDatabaseGivenANode(t, fn.getRowNode(n), ["online"], [value], true);
						}
				}
			},
			"verkleinwoord": {
				"editable": true
			},
			"anc":{
				"editable": fn.getCurrentUser()=='katrien', // only Katrien is entitled to change that
				"editcallback": function(t, n, value){
					var sLemmaId = fn.getDataFromSiblingNode(t, n, "pkid");
					fn.updateDatabaseGivenFieldValues(
							"surinaams_and_antilliaans_commissions_selections", 
							{"lemma_id": sLemmaId}, 
							{"anc": value});
				}
			},
			"snc":{
				"editable": fn.getCurrentUser()=='katrien', // only Katrien is entitled to change that
				"editcallback": function(t, n, value){
					var sLemmaId = fn.getDataFromSiblingNode(t, n, "pkid");
					fn.updateDatabaseGivenFieldValues(
							"surinaams_and_antilliaans_commissions_selections", 
							{"lemma_id": sLemmaId}, 
							{"snc": value});
				}
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
		
		
		gemiste_paradigma_correcties: {
			
			unique_id: {
				"visible": false
			},
			lemma_id: {
				"click": function(t, n){
					
					var sLemmaId = fn.getDataFromCellNamed(t, n, "lemma_id");
					fn.callDatabase("paradigma_view", 
							{"lemma_id": sLemmaId});
				}
			},
			modern_lemma: {
				"colsort": "asc" // sort #1
			}, 
			analyzed_wordform_id: {
				"visible": false
			}, 
			wordform_gigpos: {
				"colsort": "asc", // sort #2
				"click": function(t, n){
					
					var sLemmaId = fn.getDataFromCellNamed(t, n, "lemma_id");
					var sAwfId = fn.getDataFromCellNamed(t, n, "analyzed_wordform_id");

					fn.callDatabase("paradigma_view", 
							{"lemma_id": sLemmaId},
							function(){
								
								var nRow = fn.getNodeWhere("paradigma_view", 
										{"pkid": sAwfId});								
								var iRowNumber = fn.getRowNumberOnScreen("paradigma_view", nRow);
								if (iRowNumber>-1)
									fn.selectRow("paradigma_view", iRowNumber);
							});
					
				}
			}, 
			vermoedelijk_fout: {
				"bgcolor": "#F5D0A9"
			}, 
			correctie: {
				"bgcolor": "#BCF5A9"
			}, 
			ok: {
				"button": "OK",
				"click": function( t, n ){
					
					var sLemmaId = fn.getDataFromCellNamed(t, n, "lemma_id");
					var sAwfId = fn.getDataFromCellNamed(t, n, "analyzed_wordform_id");
					var sCorrection = fn.getDataFromCellNamed(t, n, "correctie");
					
					fn.updateDatabaseGivenFieldValues("paradigma_view", 
							{"pkid": sAwfId}, 
							{"wordform": sCorrection}, 
							false, 
							function(){
								
								fn.removeFromDatabaseGivenANode(t, n, true);
								fn.callDatabase("paradigma_view", 
										{"lemma_id": sLemmaId},
										function(){
											
											var nRow = fn.getNodeWhere("paradigma_view", 
													{"pkid": sAwfId});								
											var iRowNumber = fn.getRowNumberOnScreen("paradigma_view", nRow);
											if (iRowNumber>-1)
												fn.selectRow("paradigma_view", iRowNumber);
										});
								
							});
				}
			}, 
			gooiweg: {
				"button": "Weg ermee!",
				"click": function( t, n ){
					
					var sLemmaId = fn.getDataFromCellNamed(t, n, "lemma_id");
					var sAwfId = fn.getDataFromCellNamed(t, n, "analyzed_wordform_id");
					
					fn.removeFromDatabaseGivenANode(t, n, true);	
					fn.callDatabase("paradigma_view", 
							{"lemma_id": sLemmaId});
				}
			}
			
		},
		
		keurmerk_checklist:{
			
			lemma_id: {
				"colsort": "asc"
			}, 
			modern_lemma: {
				
			}, 
			analyzed_wordform_id: {
				
			}, 
			wordform: {
				"bgcolor": "#E0F8EC",
				"click": function( t, n ){
					
					var iAwfId = fn.getDataFromCellNamed(t, n, "analyzed_wordform_id");
					var iLemmaId = fn.getDataFromCellNamed(t, n, "lemma_id");
					
					fn.callDatabase("paradigma_view", {"lemma_id": iLemmaId});
					
					
				}
			}, 
			keurmerk: {
				"visible": false 
			}
			
			
		},
		
		paradigma_telling_check: {
			
			gigpos: {
				"choosefrom":[]
			},
			lemma_id :{
				
				"click": function(t, n){
					var lemId = fn.getDataFromCellNode(t, n);
					fn.callDatabase("lemmata_en_paradigma_view", {"lemma_id": lemId});
				}
			},
			modern_lemma :{
				
				"click": function(t, n){
					var lemId = fn.getDataFromSiblingNode(t, n, "lemma_id");
					fn.callDatabase("lemmata_en_paradigma_view", {"lemma_id": lemId});
				}
			},
			gecontroleerd: {
				"editable": true
			}
			
		},
		missende_afbrekingen:{
			lemma_id: {
				"colsort": "asc",
				"click": function(t, n){
					var lemId = fn.getDataFromCellNode(t, n);
					fn.callDatabase("lemmata_en_paradigma_view", {"lemma_id": lemId});
				}
			},
			lemma_gigpos: {
				"choosefrom": []
			}
		},
		
		
		"lemmatawithgender": {
			
			gender_corr : {
				"bgcolor": "#E0F8EC",
				"editable": true
			},
			opmerking : {
				"bgcolor": "#E0F8EC",
				"editable": true
			}
			
		},
		
		export_versions:{
			"id":{
				"colsort": "desc"
			},
			"recipient": {
				"editable": true
			},
			"comment": {
				"editable": true
			},
			"major":{
				"editable": true
			},
			"minor":{
				"editable": true
			}
			
		},
		
		gb05_not_in_gigmol_v2: {
			
			lemma_id: {
				"bgcolor": "#CECEF6"
			},
			modern_lemma: {
				"bgcolor": "#CECEF6"
			},
			lemma_gigpos: {
				"bgcolor": "#CECEF6"
			},
			gb_id: {
				"bgcolor": "#CECEF6"
			},
			opmerking: {
				"bgcolor": "#CEF6D8",
				"editable": true
			},
			unique_id: {
				"colsort": "asc",
				"visible": false
			},
			id: {
				"visible": false
			}
		}
};


// give an error message, if the comparison between the analyzed_wordforms record
// and the lemma_and_paradigma_view record gives a mismatch
function processAwfCheck(sAwfId, response){
	var bGeslaagd = (response["check_analyzedwordforms"] == 't');
	if (!bGeslaagd)
		fn.message("Fout", 
				"Het verwerken van analyzed_wordform_id "+sAwfId+" "+
				"is niet goed verlopen. Kopieer de tekst van deze foutmelding en " +
				"geef die door aan de ontwikkelaar.");
};