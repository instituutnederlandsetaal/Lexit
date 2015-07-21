// list of tables that must be hidden or visible (don't use both, it's a matter of what's the most convenient)
oHiddenTablesList = [];
oShowOnlyTables = [];

// table general settings
oTableSettingsList = {
		
		token_attestations: {
			
			callback: function(t){
				_highlightAllQuotes(t);
			},
			repeat_callback: true
		},
		token_attestations_worktable: {
			
			callback: function(t){
				highlightAllQuotes(t);
			},
			repeat_callback: true,
			
			
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
								"De geselecteerde attestaties zullen gekoppeld worden aan lemma '"+sLemma+"' " +
								"met ID " + (sLemId != '' ? sLemId : sMultiLemId) + ".<br>" +
								"Weet u zeker dat u dat wilt?", function(){
							
									fn.showProcessingMsg(t);
							
									// make sure we have null values where needed
									if (sLemId == '')
										sLemId = 'NULL';
									if (sMultiLemId == '')
										sMultiLemId = 'NULL';
							
									
									var aOriginalAwfIdsAndGroupId = new Array();
									
									// process each selected attestation now
							
									var aSelectedAtts = fn.getSelectedRowsFrom(t);
									aSelectedAtts.each(function(){
										
										var nCurrentNode = this;
										
										// Remember the current analyzed_wordform_ids and group_id
										// as we will need to remove records having these ids
										// from analyzed_wordforms in case they is no corresponding
										// attestation left after the following process (as there mustn't be
										// wordforms without attestations)
										
										var sOriginalAwfIds = fn.getDataFromCellNamed(t, nCurrentNode, "analyzed_wordform_ids");
										var sOriginalGroupId = fn.getDataFromCellNamed(t, nCurrentNode, "group_id");
										aOriginalAwfIdsAndGroupId.push( [sOriginalAwfIds, sOriginalGroupId] );
										
										
										// get the ids of the analyzed_wordforms which 
										// must be assigned this lemma_id
										
										var sAnalyzedWordformIds = fn.getDataFromCellNamed(t, nCurrentNode, "analyzed_wordform_ids");
										
										
										// assign the lemma_id to each single analyzed_wordform
										
										fn.callFunction("api.copy_set_of_analyzed_wordforms_to_lemma", 
												[fn.quote(sAnalyzedWordformIds), fn.quote(sLemId), fn.quote(sMultiLemId)], 
												function(response){
											
													var aNewAwfIdsAndGroupId = (response["copy_set_of_analyzed_wordforms_to_lemma"]).split("\|");
													var sNewAwfIds =   aNewAwfIdsAndGroupId[0];
													var sNewGroupIds = aNewAwfIdsAndGroupId[1];
													
													// assign the lemma_id, awf_ids and group_id to each single attestation
													
													var bLastRow = fn.isLastNodeOf(nCurrentNode, aSelectedAtts);
													
													fn.updateDatabaseGivenANode(t, nCurrentNode, 
															["lemma_id", "multiple_lemmata_analysis_id", "analyzed_wordform_ids", "group_id"], 
															[sLemId, sMultiLemId, sNewAwfIds, sNewGroupIds], 
															false,
															function(){
																if (bLastRow)
																	{
																	
																	
																	// clean up paradigm and refresh it
																	aOriginalAwfIdsAndGroupId = getOnlyUniqueValues(aOriginalAwfIdsAndGroupId);
																	for (var i=0; i<aOriginalAwfIdsAndGroupId.length; i++)
																		{
																		sOriginalAwfIds  = aOriginalAwfIdsAndGroupId[i][0];
																		sOriginalGroupId = aOriginalAwfIdsAndGroupId[i][1];
																		
																		if (sOriginalGroupId == '')
																			sOriginalGroupId = "NULL";
																		
																		fn.callFunction("api.cleanup_paradigm",																		
																				[fn.quote(sOriginalAwfIds), fn.quote(sOriginalGroupId)],																		
																				function(){
																			
																					// refresh to see the results!
																					fn.refreshTable("lemmata_and_paradigma");
																					fn.refreshTable(t);
																			
																			});
																		}							
																	
																	}												
													});
											
										});									
										
										
									});
							
							});
						
						}
					
					
					
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
			
			callback: function(t){
				highlightGroups(t);
			},
			repeat_callback: true,
			
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
							var iAwfId = fn.getDataFromCellNamed(t, n, "analyzed_wordform_id");
							var iLemId = fn.getDataFromCellNamed(t, n, "lemma_id");
							
							// If we have a paradigm, remove the rows given their awf_id
							if (iAwfId != '')
								{
								fn.removeFromDatabaseGivenFieldValues("analyzed_wordforms", 
										{"analyzed_wordform_id": iAwfId}, 
										null, 
										function(){	
											if (bLastRow) 
												fn.refreshTable(t);
										});
								}
							// In some rare cases, we don't have any paradigm, but just a lemma
							// In such cases, we have no option but to delete the lemma
							else if (iLemId != '')
								{
								fn.removeFromDatabaseGivenFieldValues("lemmata", 
										{"lemma_id": iLemId}, 
										null, 
										function(){	
											if (bLastRow) 
												fn.refreshTable(t);
										});
								}
							
						});	
						
					});					
					
					
				}
			}
		}
		
};


// configuration at column level
oTableConfigurationList = {
		
		lemmata_removed: {
			
			modification_date: {
				"colsort": "desc"  // sort #1
			},
			modification_time: {
				"colsort": "desc"  // sort #2
			}
		},

		analyzed_wordforms_removed: {
			
			modification_date: {
				"colsort": "desc"  // sort #1
			},
			modification_time: {
				"colsort": "desc"  // sort #2
			}
		},
		
		bronnen_worktable:{
			
			unique_id: {
				"colsort": "asc",
				"visible": false
			},
			van: {
				"bgcolor": "#E0F8EC",
				"editable": true
			},
			tot: {
				"bgcolor": "#E0F8EC",
				"editable": true
			}
		},

		
		lemmata_and_paradigma: {
			
			modern_lemma: {
				"colsort": "asc", // sort #1
				"editable": true,
				"editfunc": function(t, n, value){
					
					var sLemmaId = fn.getDataFromSiblingNode(t, n, "lemma_id");
					fn.callFunction("api.alter_modern_lemma", 
							[sLemmaId, fn.quote(value)], 
							function(){
						
								fn.refreshTable(t);
						});
					
				}
			},
			persistent_id: {
				"colsort": "asc", // sort #2
				"cell_tooltip": "Open MNW",
				"click": function(t,n){
					
					var iPersistentId = fn.getDataFromCellNode(t, n);
					window.open("http://gtb.inl.nl/iWDB/search?actie=article&wdb=MNW&id="+iPersistentId);
					
				}
			},
			
			multiple_lemmata_analysis_id: {				
				"cell_tooltip": "Toon details",
				"click": function(t,n){
					
					var iMlaId = fn.getDataFromCellNode(t, n);
					fn.callDatabase("multiple_lemmata_analyses_view", {"multiple_lemmata_analysis_id": iMlaId});
					
				}
			},
			
			analyzed_wordform_id: {
				"cell_tooltip": "Toon citaten",
				"click": function(t,n){
					
					var iAwfId = fn.getDataFromCellNode(t, n);
					var iLemmaId = fn.getDataFromSiblingNode(t, n, "lemma_id");
					fn.callDatabase("token_attestations_worktable", 
							{"analyzed_wordform_ids_arr": "{"+iAwfId+"}", "lemma_id": iLemmaId});
				}
			},
			group_id: {
				"colsort": "asc", // sort #3
				"cell_tooltip": "Totaal citaten bijbehorend bij groep",
				"click": function(t,n){
					
					var iGroupId = fn.getDataFromCellNode(t, n);
					var iLemmaId = fn.getDataFromSiblingNode(t, n, "lemma_id");
					fn.callDatabase("token_attestations_worktable", 
							{"group_id": iGroupId, "lemma_id": iLemmaId});
				}
			},
			wordform: {
				"colsort": "asc" // sort #4
//				"editable": true,
//				"editfunc": function(t, n, value){
//					
//					var sAwfId = fn.getDataFromSiblingNode(t, n, "analyzed_wordform_id");
//					fn.callFunction("api.alter_wordform", [sAwfId, fn.quote(value)], 
//							function(){
//						
//								fn.refreshTable(t);
//						});
//					
//				}
			},
			
			lemma_part_of_speech: {
				
				"editable": true,
				"editfunc": function(t, n, value){
					
					var sLemmaId = fn.getDataFromSiblingNode(t, n, "lemma_id");
					fn.callFunction("api.alter_lemma_part_of_speech", 
							[sLemmaId, fn.quote(value)], 
							function(){
						
								fn.refreshTable(t);
						});
					
				}
			},
			part_of_speech: {
				
				"editable": true,
				"editfunc": function(t, n, value){
					
					var sAwfId = fn.getDataFromSiblingNode(t, n, "analyzed_wordform_id");
					fn.callFunction("api.alter_wordform_part_of_speech", 
							[sAwfId, fn.quote(value)], 
							function(){
						
								fn.refreshTable(t);
						});
					
				}
				
			},
			unique_id:{
				"visible": false
			}
		},
		
		token_attestations: {
			
			quotation_section_id: {
				"colsort": "asc"
			},
			document_id: {
				"cell_tooltip": "Toon bron",
				"click": function(t,n){
					
					var iDocumentId = fn.getDataFromCellNode(t, n);
					fn.callDatabase("documents", {"document_id": iDocumentId}, null, {"viewtype": "form"});
				}
			}
		},
		
		token_attestations_worktable: {
			
			attestation_ids: {
				"visible": false
			},
			quotation_section_id: {
				"colsort": "asc"
			},
			onsetoffset: {
				"visible": false
			},
			wordform: {
				"visible": false
			},
			// column wordform_alphabetic is used by a database for comparing a newly manually built attestation
			// which pre-existing attestation of the same lemma, so as to be able to decide wether a new set of
			// analyzed wordforms needs to be constructed or not.
			wordform_alphabetic: {
				"visible": false
			},
			analyzed_wordform_ids: {
				"visible": false
			},
			analyzed_wordform_ids_arr: {
				"visible": false
			},
			group_id: {
				"visible": false
			},
			derivation_ids: {
				"visible": false
			},
			document_id: {
				"cell_tooltip": "Toon bron",
				"click": function(t,n){
					
					var iDocumentId = fn.getDataFromCellNode(t, n);
					fn.callDatabase("documents", {"document_id": iDocumentId}, null, {"viewtype": "form"});
				}
			},
			doorvoeren: {
				
				sortable: false,
				"button": "Doorvoeren",
				"button_tooltip": "Gewijzigde attestatie verwerken in het lexicon",
				"click": function(t,n){
					
					fn.confirm("Attestatie verwerken", 
							"Weet u zeker dat u de gewijzigde attestatie nu in het lexicon wilt verwerken? "+
							"<br><br>" +
							"(Doe dit pas als in de citaat de correcte tokens geselecteerd zijn)", 
							
						function(){
						
							fn.showProcessingMsg(t);
							
							
							// First: remember the current analyzed_wordform_ids and group_id
							// as we will need to remove records having these ids
							// from analyzed_wordforms in case they is no corresponding
							// attestation left after the following process (as there mustn't be
							// wordforms without attestations)
							
							var sOriginalAwfIds = fn.getDataFromCellNamed(t, n, "analyzed_wordform_ids");
							var sOriginalGroupId = fn.getDataFromCellNamed(t, n, "group_id");
							
													
							// Some words have been selected manually in the quote, causing new
							// onsets and offsets to be saved into the onsetoffset column.
							//
							// Now the 'Doorvoeren' button has been clicked on,
							// we need to rebuild the other fields content accordingly:
							
							// [1] in a first step we gather the highlight wordforms
							//     and put those in the same order als the their onsets (=keep relation!) 

							computeWordsFromIndexes(t, n);
							
							
							// [2] in a second step, we will look up analyzed_wordforms for those
							//     words (or create them if they don't exist yet) and also put
							//     those analyzed_wordforms in the same order as the wordforms  
							//   
							// N.B.: Sorting both wordform and analyzed_wordforms by onsets
							//       is needed to keep the relation between those three components, 
							//       since we will later on process these data back into the native 
							//       token_attestations table: this consists of separate records for each 
							//       analyzed_wordform, which of course needs to refer to the
							//       correct wordform and onset (word position) in the quote.
							//       (see final step, calling api.process_new_token_attestations)
							
							
							
							// Look up or create (a) new analyzed_wordform(s) for the attestation words							
							
							var aDataForAnalyzedWordforms = getArgumentsForFindingOrCreatingAnalyzedWordform(t, n);
							
							fn.callFunction("api.create_analyzed_wordform_for_attestation", 
									
									aDataForAnalyzedWordforms, 
									 
									function(response){
								
										// Retrieve the analyzed_wordform_id(s)
										// plus group_id if available,
										// and put those back into the current record
								
										var aAwfIdsAndGroupId = (response["create_analyzed_wordform_for_attestation"]).split("\|");	
										
										fn.updateDatabaseGivenANode(t, n, 
												["analyzed_wordform_ids", "group_id"], 
												aAwfIdsAndGroupId, 
												null, 
												function(){
											
													// [3]
													// we're done with the worktable, we now need to update
													// the native token_attestations table
											
													var sOldAttIds = fn.getDataFromSiblingNode(t, n, "attestation_ids");
													
													fn.callFunction("api.process_new_token_attestations", 															
															[fn.quote(sOldAttIds)],															
															function(){
														
																// clean up paradigm and refresh it
																
																if (sOriginalGroupId == '')
																	sOriginalGroupId = "NULL";
																
																fn.callFunction("api.cleanup_paradigm",																		
																		[fn.quote(sOriginalAwfIds), fn.quote(sOriginalGroupId)],																		
																		function(){
																	
																			// refresh to see the results!
																			fn.refreshTable("lemmata_and_paradigma");
																			fn.refreshTable(t);
																	
																});
																
															});
													
													
												});
								});
							
							
						}); // end of function
					
					
				} // end of click event
			},
			quote: {
				
				sortable: false,
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
	
	
	// Write these into the right columns (both onto screen as into database)		
	
	fn.updateDatabaseGivenANode(t, n, ["wordform"], [sNewWordform]);
	fn.putDataIntoCell(t, fn.getRowNode(n), "wordform", sNewWordform);						
	fn.updateDatabaseGivenANode(t, n, ["onsetoffset"], [sNewIndexes]);
	fn.putDataIntoCell(t, fn.getRowNode(n), "onsetoffset", sNewIndexes);
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

// highlight in 'token_attestations' table

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


// highlight in 'token_attestations_worktable' table

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

