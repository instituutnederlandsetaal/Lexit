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
			repeat_callback: true
			
		},
		
		lemmata_and_paradigma: {
			
			callback: function(t){
				highlightGroups(t);
			},
			repeat_callback: true,
			
			"button_0":{
				
				"name": "Verwijder selectie",
				"click": function(t){
					
					fn.confirm("Verwijder selectie", "Weet u het zeker?", function(){
						
						var aRows = fn.getSelectedRowsFrom(t);
						aRows.each(function(){
							var n = this;
							
							var bLastRow = fn.isLastNodeOf(n, aRows);
							var iAwfId = fn.getDataFromCellNamed(t, n, "analyzed_wordform_id");
							
							fn.removeFromDatabaseGivenFieldValues("analyzed_wordforms", 
									{"analyzed_wordform_id": iAwfId}, 
									null, 
									function(){	
										fn.removeFromDatabaseGivenANode(t, n, false, function(){
											if (bLastRow) fn.refreshTable(t);
										});
									});
						});	
						
					});					
					
					
				}
			}
		}
		
};


// configuration at column level
oTableConfigurationList = {
		
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
				"colsort": "asc" // sort #1
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
					fn.callDatabase("token_attestations_worktable", {"analyzed_wordform_ids": "\\y"+iAwfId+"\\y"});
				}
			},
			group_id: {
				"colsort": "asc", // sort #3
				"cell_tooltip": "Totaal citaten bijbehorend bij groep",
				"click": function(t,n){
					
					var iGroupId = fn.getDataFromCellNode(t, n);
					fn.callDatabase("token_attestations_worktable", {"group_id": iGroupId});
				}
			},
			wordform: {
				"colsort": "asc" // sort #4
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
			
			attestation_id: {
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
				"click": function(t,n){
					
					fn.showProcessingMsg(t);
					
					// first we need to set the wordform according to the clicked words
					// from the quote
					
					// so remove the highlight (which is html code nested into quote string)
					// and only then, gather the string parts corresponding to the indexes (start - end)
					var aWordarray = new Array();
					var aIndexesArray = ( fn.getDataFromSiblingNode(t, n, "onsetoffset") ).split("\|");
					var sQuote = fn.removeHighlight(fn.getDataFromSiblingNode(t, n, "quote"));
					for (var i=0; i<aIndexesArray.length; i++)
						{
						var sIndexes = aIndexesArray[i];
						var iStartIndex = sIndexes.split(",")[0];
						var iEndIndex   = sIndexes.split(",")[1];
						aWordarray.push( (sQuote.substring(iStartIndex, iEndIndex)).toLowerCase() );
						}
					// parts need to be sorted (just as in the rest of the table)
					aWordarray.sort();
					var sNewWordform = aWordarray.join(",");
					
					// write this into the right column (both onto screen as into database)
					fn.updateDatabaseGivenANode(t, n, ["wordform"], [sNewWordform]);
					fn.putDataIntoCell(t, fn.getRowNode(n), "wordform", sNewWordform);
					
					
					// Now find other rows than the current one, having the
					// same wordform and lemma_id
					// If it exists, we can take over the analyzed_wordform_id and group_id
					// from such a row 
					var sWordformConcat = fn.getDataFromSiblingNode(t, n, "wordform");
					var iLemmaId = fn.getDataFromSiblingNode(t, n, "lemma_id");
					var iMultiLemAnalysisId = fn.getDataFromSiblingNode(t, n, "multiple_lemmata_analysis_id");
					var sCurrentRowId = fn.getDataFromSiblingNode(t, n, "attestation_ids");
					
					iLemmaId = (iLemmaId == '') ? "NULL" : iLemmaId;
					iMultiLemAnalysisId = (iMultiLemAnalysisId == '') ? "NULL" : iMultiLemAnalysisId;
		
					fn.getIdFromDatabase(t, 
							{
							"lemma_id": iLemmaId,
							"multiple_lemmata_analysis_id": iMultiLemAnalysisId,
							"wordform": sWordformConcat,
							"attestation_ids": "!"+"^"+sCurrentRowId+"$",
							"group_id": (sWordformConcat.indexOf(",")>-1) ? "!NULL" : "NULL"
							}, 
							function(id){								
								
								// there is no record with these wordform and lemma_id
								// so we have to create it ourself
								if (id == '')
									{
									var sOldAttIds = fn.getDataFromSiblingNode(t, n, "attestation_ids");
									
									fn.callFunction("create_analyzed_wordform", 
											[iLemmaId, iMultiLemAnalysisId, sNewWordform], 
											function(response){
										
												var aAwfIdsAndGroupId = (response["create_analyzed_wordform"]).split("\|");	
												
												// put the analyzed_wordform_ids and group_id
												// corresponding to the current token_attestation records
												// into this same record
												fn.updateDatabaseGivenANode(t, n, 
														["analyzed_wordform_ids", "group_id"], 
														aAwfIdsAndGroupId, 
														null, 
														function(){
													
															// we're done with the worktable, now we need to update
															// the true token_attestations table													
															
															fn.callFunction("insert_new_token_attestations", [sOldAttIds], 
																	
																	function(response){
																
																		// finally put the generated attestation_ids into the worktable
																		var sNewAttIds = response["insert_new_token_attestations"];
																		fn.updateDatabaseGivenANode(t, n, 
																				["attestation_ids"], 
																				[sNewAttIds], null, function(){
																			
																			// refresh to see result
																			fn.refreshTable(t);
																			// refresh paradigm view as well
																			// since we've created new wordform
																			fn.refreshTable("lemmata_and_paradigma");
																		});
																	});
															
															
														});
										});
									}
								
								
								// we have found a record with the same wordform and lemma_id
								else
									{
									
									var sOldAttIds = fn.getDataFromSiblingNode(t, n, "attestation_ids");
																		
									// retrieve the record given its id
									fn.getRecord(t, id, function(record){										
										
										var sAwfIds = record["analyzed_wordform_ids"];
										var sGroupId = record["group_id"];
										
										if (sGroupId.trim() == '')
											sGroupId = 'NULL';
										
										// put the analyzed_wordform_ids and group_id
										// corresponding to the current token_attestation records
										// into this same record
										fn.updateDatabaseGivenANode(t, n, 
												["analyzed_wordform_ids", "group_id"], 
												[sAwfIds, sGroupId], 
												null, 
												function(){													
											
													// we're done with the worktable, now we need to update
													// the true token_attestations table								
													
													fn.callFunction("insert_new_token_attestations", [sOldAttIds], 
															function(response){
														
																// finally put the generated attestation_ids into the worktable
																var sNewAttIds = response["insert_new_token_attestations"];
																fn.updateDatabaseGivenANode(t, n, 
																		["attestation_ids"], 
																		[sNewAttIds], null, function(){
																	
																	// refresh to see result
																	fn.refreshTable(t);
																});
															});
												});
										
										}); // end of getRecord
									
									}
								
								
								// get the record having the found id
								
								
								
							}); // end of get id from database
					
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
							// remove the tokens that are within the selection
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

