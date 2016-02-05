// list of tables that must be hidden or visible (don't use both, it's a matter of what's the most convenient)
oHiddenTablesList = [];
oShowOnlyTables = ["analyzed_wordforms", "documents", "lemmata", "lemmata_and_paradigma", "multilemmata",
                   "multiple_lemmata_analyses", "multiple_lemmata_analyses_view", "multiple_lemmata_analysis_parts",
                   "token_attestations", "token_attestations_worktable", "wordforms",
                   "modified_lemmata_view", "modified_paradigm_view"];



// Array's to store the locked lemmata of the current view
// Those array's get updated at each table draw
var aCurrentLemmaViewLocks = new Array();
var aCurrentParadigmaViewLocks = new Array();


//function returns true if current user is a superuser
function superUser(){
	return (fn.getCurrentUser() == 'katrien' || 
			fn.getCurrentUser() == 'mathieu' ||
			fn.getCurrentUser() == 'jesse');
};

// transform an empty string into a string 'NULL'
function deEmpty(a){
	if (a == null || a == '') 
		return "NULL";
	return a;
}

// join two strings comma-separated
function comma(a, b){
	return deEmpty(a)+","+deEmpty(b);
}


// table general settings
oTableSettingsList = {
		
		
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
							fn.callFunction("api.restore_lemma_and_paradigm_and_ids", [sLemmaId],  
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
							fn.callFunction("api.restore_wordform", [sAwfId],  
									function(){
										if (fn.isLastNodeOf(nCurrentNode, aRowSelection))
											fn.refreshTable(confTable);
							});
						});
					});
				}
			}
		},

		
		
		lemmata: {
			
			"keyup" : {
				
				"@": function(t){
					
					var n = fn.getFirstSelectedRowFrom(t);
					(fn.getCellElement(t, n, "lemma_part_of_speech")).click();
				},
				
				"insert": function(t){
					
					var n = fn.getFirstSelectedRowFrom(t);
					(fn.getCellElement(t, n, "lemma_part_of_speech")).click();
				},
				
				"f9": function(t){
					
					var n = fn.getFirstSelectedRowFrom(t);
					var sWdb = fn.getDataFromCellNamed(t, n, "wdb");
					var iPersistentId = fn.getDataFromCellNamed(t, n, "persistent_id");
					window.open("http://gtb.inl.nl/iWDB/search?actie=article&wdb="+sWdb+"&id="+iPersistentId);
				},
				
				
				"uparrow": function(t){
					
					// small delay otherwise it won't work
					$("#"+t).delay(500).queue(function(){

						var n = fn.getFirstSelectedRowFrom(t);
						var sLemmaId = fn.getDataFromCellNamed(t, n, "lemma_id");
						
						if ( !isNaN(sLemmaId) )
							{
							fn.callDatabase("token_attestations_worktable", {"lemma_id": sLemmaId});
							}						

						$(this).dequeue();
					});					
					
				},
				"downarrow": function(t){
					
					// small delay otherwise it won't work
					$("#"+t).delay(500).queue(function(){

						var n = fn.getFirstSelectedRowFrom(t);
						var sLemmaId = fn.getDataFromCellNamed(t, n, "lemma_id");
						
						if ( !isNaN(sLemmaId) )
						{
						fn.callDatabase("token_attestations_worktable", {"lemma_id": sLemmaId});
						}

						$(this).dequeue();
					});
				}
			},
			
			"callback": function(t){
				
				// we need to open the token_attestations_worktable
				// but the lemma table must get back focus 
				
				// (probably temporary)
				if ( !fn.tableExists("token_attestations_worktable"))
					{
					fn.callDatabase("token_attestations_worktable", {}, function(){
						kf.setActiveTable("lemmata");
						});
					}
				
				
				// lemmata locks
				
				var sTableName = fn.getTableName(t);
				
				// build the UNlock button if it doesn't exist yet
				// (superuser only)
				if ( superUser() && fn.getIndexOfButtonNamed(sTableName, "(Un)lock")<0)
					{										
					fn.addCustomButton(sTableName, {
						"name": "(Un)lock",
						"bgcolor": "#F5D0A9",
						"click": function(t){
							
							var aSelectedRows = fn.getSelectedRowsFrom(t);
							
							aSelectedRows.each(function(){
								
								var sLemmaId = fn.getRowId(this);
								var sMultilemmaId = null;
								var bLastRow = fn.isLastNodeOf(this, aSelectedRows);
								
								if ($.inArray( comma(sLemmaId, sMultilemmaId), aCurrentLemmaViewLocks ) >-1)
									{
									fn.callFunction("api.unlock_lemma", [deEmpty(sLemmaId), deEmpty(sMultilemmaId)], function(){
											if(bLastRow) fn.refreshTable(t);
											}
										);
									}
								else
									{
									fn.callFunction("api.lock_lemma", [deEmpty(sLemmaId), deEmpty(sMultilemmaId)], function(){
											if(bLastRow) fn.refreshTable(t);
											}
										);
									}
								
								});
							
							}
						});
					}
			
				
				// apply locks
				
				var aLemmaIdsArr = new Array();
				var aRows = fn.getAllRows(t);
				
				aRows.each(function(i){					
					var sLemmaId = fn.getRowId(this);
					var sMultilemmaId = null;
					aLemmaIdsArr.push( comma(sLemmaId, sMultilemmaId) );
				});
				
				// get the list of locked lemmata
				// and modify the rows accordingly
				fn.callFunction("api.get_locks_of_lemmata", [ "'"+aLemmaIdsArr.join("|")+"'" ], function(){
					
					aCurrentLemmaViewLocks = (fn.getFunctionOutput()[0]).split("|");
					
					aRows.each(function(i){
						
						var nThisRow = this;
						var sLemmaId = fn.getRowId(nThisRow);
						var sMultilemmaId = null;
						
						if ( $.inArray( comma(sLemmaId, sMultilemmaId), aCurrentLemmaViewLocks ) >-1 )
							{
							var aVisibleCells = mt.getListOfVisibleColumnsOf(fn.getTableName(t));
							
							for (var j=0; j<aVisibleCells.length; j++)
								{
								var sCurrentColumnName = aVisibleCells[j];
								
								// we mustn't lock the comment field
								if (sCurrentColumnName == 'opmerking')
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
			"repeat_callback": true
		},
		


		
		token_attestations: {
			
			"callback": function(t){
				_highlightAllQuotes(t);
			},
			"repeat_callback": true
		},
		
		token_attestations_worktable: {
			
			"callback": function(t){
				highlightAllQuotes(t);
			},
			"repeat_callback": true,
			
			
			"button_0": {
				
				"name": "Koppel aan lemma",
				"tooltip": "Koppel de geselecteerde attestatie aan het in 'lemmata_and_paradigma' geselecteerde lemma",
				"click": function(t){
					
					// get the selected lemma from the lemmata and paradigma table
					
					if (	fn.getNumberOfSelectedRows("lemmata_and_paradigma") == 0 ||
							fn.getNumberOfSelectedRows(t) == 0)
						{
						fn.message("Let op", "U moet wel een attestatie én een lemma kiezen!");						
						}
					else
						{
						var nSelectedLemma = fn.getFirstSelectedRowFrom("lemmata_and_paradigma");
						var sLemma = fn.getDataFromCellNamed("lemmata_and_paradigma", nSelectedLemma, "modern_lemma");
						var sLemId = fn.getDataFromCellNamed("lemmata_and_paradigma", nSelectedLemma, "lemma_id");
						var sMultiLemId = fn.getDataFromCellNamed("lemmata_and_paradigma", nSelectedLemma, "multiple_lemmata_analysis_id");
						
						// warn the user he/she is about to assign some attestations
						// to another lemma 
						
						fn.confirm("Let op", 
								"De geselecteerde attestaties zullen gekoppeld worden aan " +
								(sLemId != '' ? "" : "multiple ") + "lemma '"+sLemma+"' " +
								"met ID " + (sLemId != '' ? sLemId : sMultiLemId) + ".<br>" +
								"Weet u zeker dat u dat wilt?", 
								function(){
							
									fn.showProcessingMsg(t);
							
									// make sure we have null values where needed
									if (sLemId == '') sLemId = 'NULL';
									if (sMultiLemId == '') sMultiLemId = 'NULL';
										
									
									// We will process each attestation one at the time
									// So we must call a function which will call
									// itself again as a callback, but with the
									// following id to process, till all ids are processed
									
									// get list of ids of attestations to process									
									
									var aAttestationIdsToProcess = new Array();	
									
									var aSelectedAtts = fn.getSelectedRowsFrom(t);
									aSelectedAtts.each(function(){
										aAttestationIdsToProcess.push(fn.getNodeId(this));
									});
									
									
									// process each selected attestation now
																		
									var functionToRepeat = function(i){										
										
										fn.updateDatabaseGivenFieldValues(t, 
												{"attestation_ids": aAttestationIdsToProcess[i]}, 
												{"lemma_id": sLemId, "multiple_lemmata_analysis_id": sMultiLemId}, 
												false, 
												function(){
													
													if ( (i+1) < aAttestationIdsToProcess.length )
														{
														functionToRepeat(i+1);
														}
													else
														{
														// refresh to see the results!
														fn.refreshTable("lemmata_and_paradigma");
														fn.refreshTable(t);
														}
												});
										
									};
									
									// start the function now
									// it will increment its own argument till all ids are processed
									//
									// NB: this function call will cause
									// a function to be triggered that will copy
									// the analyzed wordforms to the new lemma
									// and remove the original analyzed wordforms
									// if there is no attestation left attached to it
									
									functionToRepeat(0);
									
											
							});
						}
				}
				
			},
			
			
			"button_1":{
				
				"name": "Schoonvegen",
				"tooltip": "Verwijder alle attestaties uit de citaat",
				"click": function(t){
					
					fn.confirm("Citaat schoonvegen", "Weet u het zeker?", function(){
						
						var n = fn.getFirstSelectedRowFrom(t);
						
						// remove indexes
						fn.updateDatabaseGivenANode(
								t, 
								n, 
								[ "onsetoffset" ], 
								[ "none" ], 
								true);
						
					});					
				}
				
			}
			
		},
		
		lemmata_removed: {
			
			"button_0":{
				"name": "Hestel selectie",
				"click": function(t){
					
					fn.confirm("Hestel selectie", "Weet u het zeker?", function(){
						
						var aRows = fn.getSelectedRowsFrom(t);
						aRows.each(function(){
							var n = this;
							
							// This function doesn't try to assign a new lemma_id
							// to prevent conflicting ids, as we assume that ids of newly
							// added lemmata come on top of the existing id-values.
							// So when some lemma is removed, its id won't be re-used
							// so it is safe to reload the old lemma with its original id.
							
							var sLemId = fn.getDataFromCellNamed(t, n, "lemma_id");
							fn.callFunction("api.restore_lemma", [sLemId], function(){
								
								if (fn.isLastNodeOf(n, aRows))
									{
									fn.refreshTable(t);
									fn.refreshTable("lemmata_and_paradigma");
									}
							});
						});
						
					});
					
				}
			}
		},
		
		analyzed_wordforms_removed: {
			
			"button_0":{
				"name": "Hestel selectie",
				"click": function(t){
					
					fn.confirm("Hestel selectie", "Weet u het zeker?", function(){
						
						var aRows = fn.getSelectedRowsFrom(t);
						aRows.each(function(){
							var n = this;
							
							// This function doesn't try to assign a new analyzed_wordform_id
							// to prevent conflicting ids, as we assume that ids of newly
							// added analyzed_wordforms come on top of the existing id-values.
							// So when some analyzed_wordform is removed, its id won't be re-used
							// so it is safe to reload the old analyzed_wordform with its original id.
							
							var sAwfId = fn.getDataFromCellNamed(t, n, "analyzed_wordform_id");
							fn.callFunction("api.restore_paradigm", [sAwfId], function(){
								
								if (fn.isLastNodeOf(n, aRows))
									{
									fn.refreshTable(t);
									fn.refreshTable("lemmata_and_paradigma");
									}
							});
						});
						
					});
			
				}
			}
		},
		
		lemmata_and_paradigma: {
			
			"callback": function(t){
				
				// groups must be easily recognizable
				highlightGroups(t);
				
				
				// lemmata locks
				
				var sTableName = fn.getTableName(t);
				
				// build the UNlock button if it doesn't exist yet
				// (for superusers only)
				if ( superUser() && fn.getIndexOfButtonNamed(sTableName, "(Un)lock")<0)
					{										
					fn.addCustomButton(sTableName, {
						"name": "(Un)lock",
						"bgcolor": "#F5D0A9",
						"click": function(t){
							
							var aSelectedRows = fn.getSelectedRowsFrom(t);
							
							aSelectedRows.each(function(){
								
								var sLemmaId = fn.getDataFromCellNamed(t, this, "lemma_id");
								var sMultilemmaId = fn.getDataFromCellNamed(t, this, "multiple_lemmata_analysis_id");
								var bLastRow = fn.isLastNodeOf(this, aSelectedRows);
								
								if ($.inArray( comma(sLemmaId, sMultilemmaId), aCurrentParadigmaViewLocks ) >-1)
									{
									fn.callFunction("api.unlock_lemma", [deEmpty(sLemmaId), deEmpty(sMultilemmaId)], function(){
											if(bLastRow) fn.refreshTable(t);
											}
										);
									}
								else
									{
									fn.callFunction("api.lock_lemma", [deEmpty(sLemmaId), deEmpty(sMultilemmaId)], function(){
											if(bLastRow) fn.refreshTable(t);
											}
										);
									}
								
								});
							
							}
						});
					}
				
				
				// apply locks
				
				var aLemmaIdsArr = new Array();
				var aRows = fn.getAllRows(t);
				
				aRows.each(function(){					
					var sLemmaId = fn.getDataFromCellNamed(t, this, "lemma_id");
					var sMultiLemmaId = fn.getDataFromCellNamed(t, this, "multiple_lemmata_analysis_id");
					aLemmaIdsArr.push( comma(sLemmaId, sMultiLemmaId) );
				});
				
				// get the list of locked lemmata
				// and modify the rows accordingly
				fn.callFunction("api.get_locks_of_lemmata", [ "'"+aLemmaIdsArr.join("|")+"'" ], function(){
					
					aCurrentParadigmaViewLocks = (fn.getFunctionOutput()[0]).split("|");
					
					aRows.each(function(i){
						
						var nThisRow = this;
						var sLemmaId = fn.getDataFromCellNamed(t, nThisRow, "lemma_id");
						var sMultiLemmaId = fn.getDataFromCellNamed(t, nThisRow, "multiple_lemmata_analysis_id");
						
						
						if ( $.inArray( comma(sLemmaId, sMultiLemmaId), aCurrentParadigmaViewLocks ) >-1 )
							{
							var aVisibleCells = mt.getListOfVisibleColumnsOf(fn.getTableName(t));
							
							for (var j=0; j<aVisibleCells.length; j++)
								{
								var sCurrentColumnName = aVisibleCells[j];
								
								// we mustn't lock the comment field
								if (sCurrentColumnName == 'opmerking')
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
			"repeat_callback": true,
			
			"button_0":{
				
				"name": "Maak lemma aan",
				"click": function(t){
					
					fn.prompt("Nieuw lemma", 
							["modern_lemma", "part_of_speech", "persistent_id"], 
							["", "", ""], function(){
						
								var sLemma = fn.quote( fn.getPromptUserInput("modern_lemma") );
								var sPos = fn.quote( fn.getPromptUserInput("part_of_speech") );
								var sPersistentId = fn.quote( fn.getPromptUserInput("persistent_id") );
						
								fn.callFunction("api.create_new_lemma", 
										[sLemma, sPos, sPersistentId], 
										function(){
									
											// the lemma was created in the lemmata table 
											// and copied by a trigger to the current table, so make
											// the result visible
											fn.refreshTable(t);
									
								});
						
					});
				}
				
			},
			
			"button_1":{
				
				"name": "Verwijder selectie",
				"click": function(t){
					
					fn.confirm("Verwijder selectie", "Weet u het zeker?", function(){
						
						var aRows = fn.getSelectedRowsFrom(t);
						aRows.each(function(){
							var n = this;
							
							var bLastRow = fn.isLastNodeOf(n, aRows);
							
							fn.removeFromDatabaseGivenANode(t, n, false, function(){	
											if (bLastRow) 
												fn.refreshTable(t);
										});
							
						});	// end of loop
						
					});	// end of confirm					
					
				}
			} // end of button 1
			
		}
		
};


// configuration at column level
oTableConfigurationList = {
		
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
		
		lemmata: {
			
			"modern_lemma": {
				"colsort": "asc",
				"editable": true,
				"editcallback": function(t, n, value){
					fn.refreshTable(t, function(){
						
						// small delay otherwise it won't work
						$("#"+fn.getTableName(t)).delay(500).queue(function(){

							var n = fn.getFirstSelectedRowFrom(t);
							var sLemmaId = fn.getDataFromCellNamed(t, n, "lemma_id");
							
							if ( !isNaN(sLemmaId) )
								{
								fn.callDatabase("token_attestations_worktable", {"lemma_id": sLemmaId});
								}						

							$(this).dequeue();
						});						
					});
				}
			},
			"lemma_part_of_speech": {
				"editable": true,
				"editcallback": function(t, n, value){
					fn.refreshTable(t, function(){
						
						// small delay otherwise it won't work
						$("#"+fn.getTableName(t)).delay(500).queue(function(){

							var n = fn.getFirstSelectedRowFrom(t);
							var sLemmaId = fn.getDataFromCellNamed(t, n, "lemma_id");
							
							if ( !isNaN(sLemmaId) )
								{
								fn.callDatabase("token_attestations_worktable", {"lemma_id": sLemmaId});
								}						

							$(this).dequeue();
						});
					});
				}
			},
			"persistent_id": {
				"click": function(t,n){
					
					var sWdb = fn.getDataFromSiblingNode(t, n, "wdb");
					var iPersistentId = fn.getDataFromCellNode(t, n);
					window.open("http://gtb.inl.nl/iWDB/search?actie=article&wdb="+sWdb+"&id="+iPersistentId);
					
				}
			},
			
			"opmerking":{
				"editable": true
			},
			
			"online": {
				"editable": true				
			}
		},
		
		lemmata_removed: {
			
			"modification_date": {
				"colsort": "desc"  // sort #1
			},
			"modification_time": {
				"colsort": "desc"  // sort #2
			}
		},

		analyzed_wordforms_removed: {
			
			"modification_date": {
				"colsort": "desc"  // sort #1
			},
			"modification_time": {
				"colsort": "desc"  // sort #2
			}
		},
		



		
		lemmata_and_paradigma: {
			
			"super_lem_id" :{
				"colsort": "asc" // sort #1
			},
			
			"wdb": {
				"choosefrom": []
			},
			
			"modern_lemma": {
				"colsort": "asc", // sort #2
				"editable": true,
				"editcallback": function(t, n){
					
					// we need a refresh to make the change visible in rest of paradigm
					// where the lemmaform is repeated
					fn.refreshTable(t); 
				}

			},
			"persistent_id": {
				"colsort": "asc", // sort #3
				"cell_tooltip": "Open WDB",
				"click": function(t,n){
					
					var sWdb = fn.getDataFromSiblingNode(t, n, "wdb");
					var iPersistentId = fn.getDataFromCellNode(t, n);
					window.open("http://gtb.inl.nl/iWDB/search?actie=article&wdb="+sWdb+"&id="+iPersistentId);
					
				}
			},
			
			"multiple_lemmata_analysis_id": {				
				"cell_tooltip": "Toon details",
				"click": function(t,n){
					
					var iMlaId = fn.getDataFromCellNode(t, n);
					fn.callDatabase("multiple_lemmata_analyses_view", {"multiple_lemmata_analysis_id": iMlaId});
					
				}
			},
			
			"analyzed_wordform_id": {
				"cell_tooltip": "Toon citaten",
				"click": function(t,n){
					
					var iAwfId = fn.getDataFromCellNode(t, n);
					var iLemmaId = fn.getDataFromSiblingNode(t, n, "lemma_id");
					fn.callDatabase("token_attestations_worktable", 
							{"analyzed_wordform_ids_arr": "{"+iAwfId+"}", "lemma_id": iLemmaId});
				}
			},
			"group_id": {
				"colsort": "asc", // sort #4
				"cell_tooltip": "Totaal citaten bijbehorend bij groep",
				"click": function(t,n){
					
					var iGroupId = fn.getDataFromCellNode(t, n);
					var iLemmaId = fn.getDataFromSiblingNode(t, n, "lemma_id");
					fn.callDatabase("token_attestations_worktable", 
							{"group_id": iGroupId, "lemma_id": iLemmaId});
				}
			},
			"wordform": {
				"colsort": "asc" // sort #4

			},
			
			"lemma_part_of_speech": {
				
				"editable": true,
				"editcallback": function(t, n){
					
					// we need a refresh to make the change visible in rest of paradigm
					// where the lemmaform is repeated
					fn.refreshTable(t); 
				}

			},
			"part_of_speech": {
				
				"editable": true
				
			},
			
			"online": {
				"editable": true,
				"editcallback": function(t, n, value){
					fn.refreshTable(t);
				}
			},
			
			"opmerking":{
				"editable": true
			},
			
			"unique_id":{
				"visible": false
			}
		},
		
		token_attestations: {
			
			"document_id": {
				"cell_tooltip": "Toon bron",
				"click": function(t,n){
					
					var iDocumentId = fn.getDataFromCellNode(t, n);
					fn.callDatabase("documents", {"document_id": iDocumentId}, null, {"viewtype": "form"});
				}
			}
		},
		
		token_attestations_worktable: {
			
			"attestation_id": {
				"visible": false
			},

			"onsetoffset": {
				"visible": false
			},
			"wordform": {
				"visible": false
			},
			// column wordform_alphabetic is used by a database for comparing a newly manually built attestation
			// which pre-existing attestation of the same lemma, so as to be able to decide wether a new set of
			// analyzed wordforms needs to be constructed or not.
			"wordform_alphabetic": {
				"visible": false
			},
			"analyzed_wordform_ids": {
				"visible": false
			},
			"analyzed_wordform_ids_arr": {
				"visible": false
			},
			"group_id": {
				"visible": false
			},
			"derivation_ids": {
				"visible": false
			},
			"document_id": {
				"cell_tooltip": "Toon bron",
				"click": function(t,n){
					
					var iDocumentId = fn.getDataFromCellNode(t, n);
					fn.callDatabase("documents", {"document_id": iDocumentId}, null, {"viewtype": "form"});
				}
			},
			"doorvoeren": {
				
				"sortable": false,
				"button": "Doorvoeren",
				"button_tooltip": "Gewijzigde attestatie verwerken in het lexicon",
				"click": function(t,n){
					
					fn.confirm("Attestatie verwerken", 
							"Weet u zeker dat u de gewijzigde attestatie nu in het lexicon wilt verwerken? "+
							"<br><br>" +
							"(Doe dit pas als in de citaat de correcte tokens geselecteerd zijn)", 
					
						function(){
					
							fn.showProcessingMsg(t);
					
					
							// Some words have been selected manually in the quote, causing new
							// onsets and offsets to be saved into the onsetoffset column.
							//
							// Now the 'Doorvoeren' button has been clicked on,
							// we need to rebuild the other fields content accordingly:
												
							// [1] in a first step we gather the highlight wordforms
							//     and put those in the same order as the their onsets (=keep relation!) 
													
							var sNewWordform_sNewIndexes = computeWordsFromIndexes(t, n);
							
							var sNewWordform = sNewWordform_sNewIndexes[0];
							var sNewIndexes =  sNewWordform_sNewIndexes[1];
							
							// Write these into the right columns (both onto screen as into database)		
							
							fn.putDataIntoCell(t, fn.getRowNode(n), "wordform", sNewWordform);						
							fn.putDataIntoCell(t, fn.getRowNode(n), "onsetoffset", sNewIndexes);
							fn.updateDatabaseGivenANode(t, n, ["wordform", "onsetoffset"], [sNewWordform, sNewIndexes],
									false,
									function(){
								
								// the function call will cause a trigger to be activated
								// so the following steps will happen:
								
								// [2] analyzed_wordforms for those words will be looked up
								//     (or will be created them if they don't exist yet) and
								//     those analyzed_wordforms will be put in the same order as the wordforms  
								//   
								// N.B.: Sorting both wordform and analyzed_wordforms by onsets
								//       is needed to keep the relation between those three components, 
								//       since later on these data is processed back into the native 
								//       token_attestations table: this consists of separate records for each 
								//       analyzed_wordform, which of course need to refer to the
								//       correct wordform and onset (word position) in the quote.
								//       (see final step of trigger, calling api.process_new_token_attestations)								
								//
								// [3] as we're done with the worktable, we will need to update
								//     the native token_attestations table and clean up the paradigm 
								
								
								// when all this is done, this callback is called so:
								// refresh to see the results!
								
								fn.refreshTable("lemmata_and_paradigma");
								fn.refreshTable(t);
								
							});
								
						}); // end of function
								
					
				} // end of click event
			},
			"quote": {
				
				"colsort": "asc",
				"cell_tooltip": "Klik om woorden te (de)highlighten",
				"mouseup": function(t, n){
					
					// do we have a text selection?
					var oSelectedText = fn.getSelectedTextInNode(t, n);
					
					// if selection is empty, that means that we've clicked on a word
					// without selecting it manually.
					// In this case, try to select the word that was clicked upon
					if (oSelectedText.text == '' && oSelectedText.reliable)
						{						
						oSelectedText = fn.getWordClickedUponInNode(t, n);						
						}
					
					// if we have a selection now, process it
					if (oSelectedText.text!='' && oSelectedText.reliable)
						{
						// get the registered onsets and offsets
						
						// put the token indexes string into an array
						var sTokenIndexesIds = fn.getDataFromSiblingNode(t, n, "onsetoffset");
						var sOldTokenIndexesIds =  sTokenIndexesIds;
						var aTokenIndexesIds = (sTokenIndexesIds!='' && sTokenIndexesIds!= 'none') ?
								sTokenIndexesIds.split("\|") : new Array();
												
						// get the current screen selection
						var iStart = parseInt(oSelectedText.start);
						var iEnd = parseInt(oSelectedText.end);
						
						
						// is this selection already part of the registered onsets and offsets?
						var iIndexOfThisPair = $.inArray(iStart+","+iEnd, aTokenIndexesIds);					
						
						// if token was already marked as token, remove it
						if (iIndexOfThisPair>-1)
							{
							aTokenIndexesIds.splice(iIndexOfThisPair, 1);							
							}
						// otherwise add the selected token(s)
						else
							{
							// remove the tokens that are within the selection (=overlap)
							// and add the selection as a whole after that
							
							var bAddSelection = true;
							for (var i=aTokenIndexesIds.length-1; i>=0; i--)
								{								
								var sOnePair = aTokenIndexesIds[i];
								var iOneStart = parseInt(sOnePair.split(",")[0]);
								var iOneEnd = parseInt(sOnePair.split(",")[1]);
								
								// if token is within the selection, remove it
								if (iStart<=iOneStart && iOneEnd<=iEnd)
									{
									aTokenIndexesIds.splice(i, 1);
									}
								// if selection is within/overlapping an existing token, do nothing
								else if ( ( iOneStart<=iStart && iStart<=iOneEnd ) ||
										  ( iOneStart<=iEnd   && iEnd<=iOneEnd   ) )
									{
									bAddSelection = false;
									}
									
								}
							// add the selection
							if (bAddSelection)
								aTokenIndexesIds.push(iStart+","+iEnd);
							}
						
						// update the database and the screen table
						
						// rebuild the token indexes string from the current array
						sTokenIndexesIds = aTokenIndexesIds.join("|");
						if (sTokenIndexesIds == '') sTokenIndexesIds = "none";
						
						fn.updateDatabaseGivenANode(
								t, 
								fn.getRowNode(n), 
								["onsetoffset" ], 
								[ sTokenIndexesIds ], 
								true);
						
						
						}					
				}
			}
		}
};


// start with the main table

fn.callDatabase("lemmata_and_paradigma");






// -------------------------------------------------------------------------------------------
//   Subfunctions
//-------------------------------------------------------------------------------------------

function computeWordsFromIndexes(t, n){
	
	// first we need to set the wordform according to the clicked words
	// from the quote. Those clicked words are highlight.
	
	// remove the words highlights (which is html code nested into quote string)
	// so as to get the clean quote
		
	var aWordAndIndexesArray = new Array();
	var aIndexesArray = ( fn.getDataFromSiblingNode(t, n, "onsetoffset") ).split("\|");
	var sQuote = fn.removeHighlight(fn.getDataFromSiblingNode(t, n, "quote"));
	
	// Now, gather the string parts from the quote
	// corresponding to the indexes (start - end) of the words the user clicked on.
	// Put these parts into a two-dimensional array [i -> [sWordform, sIndexes] ]
	
	for (var i=0; i<aIndexesArray.length; i++)
		{
		var sIndexes = aIndexesArray[i];
		var iStartIndex = sIndexes.split(",")[0];
		var iEndIndex   = sIndexes.split(",")[1];
		var sWordform = (sQuote.substring(iStartIndex, iEndIndex)).toLowerCase();
		aWordAndIndexesArray.push( [sWordform, sIndexes] );
		}
	
	// As words and their indexes are now grouped as single objects
	// We can easily sort the words by their index
	
	aWordAndIndexesArray.sort( function(a, b){
		if (a[1] > b[1]) return 1;
		if (a[1] < b[1]) return -1;
		return 0;
	});
	var aWordArray = new Array();
	var aIndexesArray = new Array();
	
	// now put wordforms and indexes back into separate arrays
	
	for (var i=0; i<aWordAndIndexesArray.length; i++)
	{
		aWordArray[i] = aWordAndIndexesArray[i][0];
		aIndexesArray[i] = aWordAndIndexesArray[i][1];
	}
	var sNewWordform = aWordArray.join(",");
	var sNewIndexes = aIndexesArray.join("|");
	
	// return result
	return [sNewWordform, sNewIndexes];
}



function getArgumentsForFindingOrCreatingAnalyzedWordform(t, n){
	
	var iLemmaId = fn.getDataFromSiblingNode(t, n, "lemma_id");
	iLemmaId = (iLemmaId == '') ? "NULL" : iLemmaId;
	
	var iMultiLemAnalysisId = fn.getDataFromSiblingNode(t, n, "multiple_lemmata_analysis_id");
	iMultiLemAnalysisId = (iMultiLemAnalysisId == '') ? "NULL" : iMultiLemAnalysisId;
	
	var sNewWordform = fn.getDataFromSiblingNode(t, n, "wordform");
	var sNewIndexes = fn.getDataFromSiblingNode(t, n, "onsetoffset");
	
	return [iLemmaId, 
			 iMultiLemAnalysisId, 
			 fn.quote(sNewWordform),
			 fn.quote(sNewIndexes)];
}









// needed functions for highlight
// (2 versions available)

// [1] highlight in 'token_attestations' table

function _highlightAllQuotes(confTable){
	
	fn.showProcessingMsg(confTable); 
	
	var aAllRowIds = fn.getAllRows(confTable);	
	
	aAllRowIds.each(function(){
		
		_putHighlightOnOneRow(confTable, this);
		
	});
	
	fn.removeProcessingMsg(confTable);
	
};


function _putHighlightOnOneRow(confTable, confNode) {
	
	var sQuote = fn.getDataFromCellInRowNode(confTable, confNode, "quote");
	
	var iStartIndex = fn.getDataFromCellInRowNode(confTable, confNode, "start_pos");
	var iEndIndex   = fn.getDataFromCellInRowNode(confTable, confNode, "end_pos");
	
	var aNewPairsArray = new Array();
	aNewPairsArray.push([iStartIndex, iEndIndex]);
	
	// call the highlight function with the whole array of position pairs
	if (aNewPairsArray.length>0)
		sQuote = fn.getHighlight(sQuote, aNewPairsArray, "yellow");
		
	// put the string back into the table
	fn.putDataIntoCell(confTable, confNode, "quote", sQuote);
};


// [2] highlight in 'token_attestations_worktable' table

function highlightAllQuotes(confTable){
	
	fn.showProcessingMsg(confTable); 
	
	var aAllRowIds = fn.getAllRows(confTable);	
	
	aAllRowIds.each(function(){
		
		putHighlightOnOneRow(confTable, this);
		
	});
	
	fn.removeProcessingMsg(confTable);
	
};


function putHighlightOnOneRow(confTable, confNode) {
	
	var sQuote = fn.getDataFromCellInRowNode(confTable, confNode, "quote");
	
	sQuote = fn.removeHighlight(sQuote);
	
	// get the position pairs (x,y|x,y|...)
	var sAllPositionPairs = fn.getDataFromCellInRowNode(confTable, confNode, "onsetoffset");
	
	if (sAllPositionPairs != "-")
		{
				
		// build array of position pairs
		var aAllPairs = sAllPositionPairs.split("\|");		
		
		var aNewPairsArray = new Array();
		for (var i=0; i<aAllPairs.length; i++)
			{			
			var onePair = aAllPairs[i].split(",");
			
			var iStartIndex = parseInt(onePair[0]);
			var iEndIndex   = parseInt(onePair[1]);
			
			if (iStartIndex<iEndIndex)
				aNewPairsArray.push([iStartIndex, iEndIndex]);
			}
		
		// call the highlight function with the whole array of position pairs
		if (aNewPairsArray.length>0)
			sQuote = fn.getHighlight(sQuote, aNewPairsArray, "yellow");
		}
		
	// put the string back into the table
	fn.putDataIntoCell(confTable, confNode, "quote", sQuote);
};


function highlightGroups(t){
	
	var aRows = fn.getAllRows(t);
	
	var hGroup = new Array();
	
	aRows.each(function(){
		
		var n = this;		
		var iGroupId = fn.getDataFromCellNamed(t, n, "group_id");
		
		if (iGroupId != '')
			{
			if (typeof hGroup[iGroupId] == 'undefined')
				hGroup[iGroupId] = 0;
			hGroup[iGroupId] = hGroup[iGroupId] + 1;
			
			}
	});
	
	var iLastGroupId;
	var nLastGroupNode;
	var iGroupIdRowAbove = -1;
	var sColor = new Array();
	sColor[1] = "#8181F7";
	sColor[2] = "#688A08";
	iColor = 1;
	
	aRows.each(function(){
		
		var n = this;
		
		var iGroupId = fn.getDataFromCellNamed(t, n, "group_id");
		
		// put a line after the last row of a group
		// to show where the group ends
		if (iGroupId != iLastGroupId && 
				iGroupIdRowAbove == iLastGroupId)
			{
			fn.getCellElement(t, nLastGroupNode, "group_id").css("border-bottom", "solid 1px black");
			fn.getCellElement(t, nLastGroupNode, "analyzed_wordform_id").css("border-bottom", "solid 1px black");
			fn.getCellElement(t, nLastGroupNode, "wordform_id").css("border-bottom", "solid 1px black");
			fn.getCellElement(t, nLastGroupNode, "wordform").css("border-bottom", "solid 1px black");
			fn.getCellElement(t, nLastGroupNode, "part_of_speech").css("border-bottom", "solid 1px black");
			}
		
		if (hGroup[iGroupId]>0) // more than 0 is a group!
			{
			// is this the first row of a new group?
			// if so, choose a new color			
			if (iGroupId != iLastGroupId)
				{
				iColor = 1 + (iColor!=2);
				// also put a line before the group, to show where the group starts
				// but don't do that if we just added a line in the previous row 
				// as this would give a thick line as a result
				if ( !(iGroupId != iLastGroupId && 
						iGroupIdRowAbove == iLastGroupId))
					{
					fn.getCellElement(t, n, "group_id").css("border-top", "solid 1px black");
					fn.getCellElement(t, n, "analyzed_wordform_id").css("border-top", "solid 1px black");
					fn.getCellElement(t, n, "wordform_id").css("border-top", "solid 1px black");
					fn.getCellElement(t, n, "wordform").css("border-top", "solid 1px black");
					fn.getCellElement(t, n, "part_of_speech").css("border-top", "solid 1px black");					
					}			
				}
	
			
			// give the row a color, as the current row is part of a group
			fn.getCellElement(t, n, "group_id").css("color", sColor[iColor]);
			fn.getCellElement(t, n, "analyzed_wordform_id").css("color", sColor[iColor]);
			fn.getCellElement(t, n, "wordform_id").css("color", sColor[iColor]);
			fn.getCellElement(t, n, "wordform").css("color", sColor[iColor]);
			fn.getCellElement(t, n, "part_of_speech").css("color", sColor[iColor]);
			
			nLastGroupNode = n;
			iLastGroupId = iGroupId;
			}	
		
		iGroupIdRowAbove = iGroupId;
	});
	
};

// warning, so as make sure the user won't work in a development project

var sCurrentProjectName = paramsHash.get("db");
if ($.endsWith(sCurrentProjectName, '_dev'))
	fn.message("Let op", "Dit is een ontwikkelversie. Hier moet u niet in werken.");

