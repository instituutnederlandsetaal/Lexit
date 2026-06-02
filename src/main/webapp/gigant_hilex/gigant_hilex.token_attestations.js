
var hilexattestations = {};

hilexattestations.settings = {
	
	token_attestations: {
		
		"group": "Onder de motorkap",
		"exact_count": true,
			
		"callback": function(t){
			hilexlib._highlightAllQuotes(t);
		},
		"repeat_callback": true
	},
		
		
		
	
	token_attestations_worktable: {

		"width":"98%",
		"exact_count": true,

		"prereset_callback": function(t){
			fn.setCustomButtonName(t, 7, "L: ");
			fn.setCustomButtonName(t, 8, "R: ");
		},
		
		"callback": function(t){
			hilexlib.highlightAllQuotes(t);
			
			// happiness counter
			
			var aFilters = fn.getFilters(t);			
			if (typeof aFilters["opmerking"] != 'undefined' && aFilters["opmerking"] == 'clitic') {
				hilexlib.buildHappinessCounter(t, "get_clitics_yet_to_be_processed", "tok_att_work_clitics");
			}
		},
		"repeat_callback": true,
		
		"columns_order": [
			"attestation_ids",
			"quotation",
			"quote_vector",
			"attestation_location",
			"analysed_wordform_ids",
			"lemma_id",
			"multiple_lemmata_analysis_id",
			"modern_lemma",
			"metadata_id",
			"doorvoeren",
			"onsetoffset",
			"wordform",
			"wordform_alphabetic",
			"group_id",	  
			"source_id",
			"online",
			"opmerking",
			"analysed_wordform_ids_arr",
			"process_now",
			"token_previous",
			"token_next"
		],
		
		// ordering by lemma_id, quote and onset, is needed when one wants to process a list of quotes string in the worktable,
		// without accessing the lemma/paradigm table 
		// (t.i. one wants to process quotes just like in the Impact Attestation tool)
		
		"columns_sorting": {
			"modern_lemma": "asc",
			"quotation": "asc"
		},
		
		
		"button_0": {
			
			"name": "Koppel aan lemma",
			"tooltip": "Koppel de geselecteerde attestatie aan het in 'lemmata_and_paradigm_view' geselecteerde lemma",
			"click": function(t){
				
				// get the selected lemma from the lemmata and paradigma table
				
				if (	fx.getNumberOfSelectedRows("lemmata_and_paradigm_view") == 1
						&&
						fx.getNumberOfSelectedRows(t) == 1 ) {
					
					var oSelectedLemma =	fx.getFirstSelectedRowFrom("lemmata_and_paradigm_view");
					var sLemma = 			fx.getDataFromCellInRow(oSelectedLemma, "modern_lemma");
					var sLemId = 			fx.getDataFromCellInRow(oSelectedLemma, "lemma_id");
					var sMultiLemId = 		fx.getDataFromCellInRow(oSelectedLemma, "multiple_lemmata_analysis_id");
					
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
								if (sLemId == '') 		sLemId = 'NULL';
								if (sMultiLemId == '')	sMultiLemId = 'NULL';
									
								
								// We will process each attestation one at the time
								// So we must call a function which will call
								// itself again as a callback, but with the
								// following id to process, till all ids are processed
								
								// get list of ids of attestations to process									
								
								var aAttestationIdsToProcess = new Array();	
								
								var oSelectedAtts = fx.getSelectedRowsFrom(t);
								oSelectedAtts.every(function(){
									aAttestationIdsToProcess.push( fx.getRowId(this) );
								});
								
								
								// process each selected attestation now
																	
								var functionToRepeat = function(i){										
									
									fn.updateDatabaseGivenFieldValues(t, 
											{"attestation_ids": "^"+aAttestationIdsToProcess[i]+"$"}, 
											{"lemma_id": sLemId, "multiple_lemmata_analysis_id": sMultiLemId}, 
											 
											function(){
												
												if ( (i+1) < aAttestationIdsToProcess.length )
													{
													functionToRepeat(i+1);
													}
												else
													{
													// refresh to see the results!
													fn.refreshTable("lemmata_and_paradigm_view");
													fn.refreshTable(t);
													}
											});
									
								};
								
								// start the function now
								// it will increment its own argument till all ids are processed
								//
								// NB: this function call will cause
								// a function to be triggered that will copy
								// the analysed wordforms to the new lemma
								// and remove the original analysed wordforms
								// if there is no attestation left attached to it
								
								functionToRepeat(0);
								
										
						});
				}

				// or... get the selected lemma from the lemmata table

				else if (	fx.getNumberOfSelectedRows("lemmata") == 1
						&&
						fx.getNumberOfSelectedRows(t) == 1 ) {
					
					var oSelectedLemma =	fx.getFirstSelectedRowFrom("lemmata");
					var sLemma = 			fx.getDataFromCellInRow(oSelectedLemma, "modern_lemma");
					var sLemId = 			fx.getDataFromCellInRow(oSelectedLemma, "lemma_id");
					var sMultiLemId = 		'NULL';
					
					// warn the user he/she is about to assign some attestations
					// to another lemma 
					
					fn.confirm("Let op", 
							"De geselecteerde attestaties zullen gekoppeld worden aan " +
							"lemma '"+sLemma+"' met ID " + sLemId + ".<br>" +
							"Weet u zeker dat u dat wilt?", 
							function(){
						
								fn.showProcessingMsg(t);
						
								// make sure we have null values where needed
								if (sLemId == '') 		sLemId = 'NULL';										
								
								// We will process each attestation one at the time
								// So we must call a function which will call
								// itself again as a callback, but with the
								// following id to process, till all ids are processed
								
								// get list of ids of attestations to process									
								
								var aAttestationIdsToProcess = new Array();	
								
								var oSelectedAtts = fx.getSelectedRowsFrom(t);
								oSelectedAtts.every(function(){
									aAttestationIdsToProcess.push( fx.getRowId(this) );
								});
								
								
								// process each selected attestation now
																	
								var functionToRepeat = function(i){										
									
									fn.updateDatabaseGivenFieldValues(t, 
											{"attestation_ids": "^"+aAttestationIdsToProcess[i]+"$"}, 
											{"lemma_id": sLemId, "multiple_lemmata_analysis_id": sMultiLemId}, 
											 
											function(){
												
												if ( (i+1) < aAttestationIdsToProcess.length )
													{
													functionToRepeat(i+1);
													}
												else
													{
													// refresh to see the results!
													fn.refreshTable("lemmata_and_paradigm_view");
													fn.refreshTable(t);
													}
											});
									
								};
								
								// start the function now
								// it will increment its own argument till all ids are processed
								//
								// NB: this function call will cause
								// a function to be triggered that will copy
								// the analysed wordforms to the new lemma
								// and remove the original analysed wordforms
								// if there is no attestation left attached to it
								
								functionToRepeat(0);
								
										
						});
				}

				// or... get the selected lemma from the multilemmata table


				/*
				else if (	fx.getNumberOfSelectedRows("multilemmata") == 1
						&&
						fx.getNumberOfSelectedRows(t) == 1 ) {
							
					var oSelectedLemma =	fx.getFirstSelectedRowFrom("multilemmata");						
					var sLemma = 			fx.getDataFromCellInRow(oSelectedLemma, "modern_lemma");
					var sLemId = 'NULL';
					var sMultiLemId = 		fx.getDataFromCellInRow(oSelectedLemma, "multiple_lemmata_analysis_id");
					
					// warn the user he/she is about to assign some attestations
					// to another lemma 
					
					fn.confirm("Let op", 
							"De geselecteerde attestaties zullen gekoppeld worden aan " +
							"multiple lemma '"+sLemma+"' " +
							"met ID " + sMultiLemId + ".<br>" +
							"Weet u zeker dat u dat wilt?", 
							function(){
						
								fn.showProcessingMsg(t);
								
								// We will process each attestation one at the time
								// So we must call a function which will call
								// itself again as a callback, but with the
								// following id to process, till all ids are processed
								
								// get list of ids of attestations to process									
								
								var aAttestationIdsToProcess = new Array();	
								
								var oSelectedAtts = fx.getSelectedRowsFrom(t);
								oSelectedAtts.every(function(){
									aAttestationIdsToProcess.push( fx.getRowId(this) );
								});
								
								
								// process each selected attestation now
																	
								var functionToRepeat = function(i){										
									
									fn.updateDatabaseGivenFieldValues(t, 
											{"attestation_ids": "^"+aAttestationIdsToProcess[i]+"$"}, 
											{"lemma_id": sLemId, "multiple_lemmata_analysis_id": sMultiLemId}, 
											 
											function(){
												
												if ( (i+1) < aAttestationIdsToProcess.length ) {
													functionToRepeat(i+1);
												}
												else {
													// refresh to see the results!
													fn.refreshTable("lemmata_and_paradigm_view");
													fn.refreshTable(t);
												}
											});
									
								};
								
								// start the function now
								// it will increment its own argument till all ids are processed
								//
								// NB: this function call will cause
								// a function to be triggered that will copy
								// the analysed wordforms to the new lemma
								// and remove the original analysed wordforms
								// if there is no attestation left attached to it
								
								functionToRepeat(0);
								
										
						});
					
				}
				*/
				else {
					fn.message("Let op", "U moet wel een attestatie én een lemma kiezen!");
					
				}
			}
			
		},
		
		
		"button_1":{
			
			"name": "Zoek ander lemma",
			"click": function(t){
				
				var n = fn.getFirstSelectedRowNodeFrom(t);
				
				var sAttestationIds =	fn.getDataFromCellInRowNode(n, "attestation_ids");
				var sWordform =			removeTags(fn.getDataFromCellInRowNode(n, "wordform"));
				var sWdb = 				fn.getDataFromCellInRowNode(n, "source_id");
				var sLemmaId =			fn.getDataFromCellInRowNode(n, "lemma_id");
				var sMultiLemmaId =		fn.getDataFromCellInRowNode(n, "multiple_lemmata_analysis_id");
				var sOpmerking =		fn.getDataFromCellInRowNode(n, "opmerking");
				
				fn.prompt( ["Zoek ander lemma", "Tik hier de gewenste lemmavorm in"], ["Vorm"], [sWordform],
						
						function(resp){

							var sWordform = resp["Vorm"];
							sWordform = sWordform.replace(/ *\+ */g, '+').trim();

							var bAllowAmbiguity = sWordform.indexOf("|")>=0;

							// do we have to deal with ambiguity?
							if (bAllowAmbiguity) {

								hilexlib.fnBuildAmbiguousLemmaAndLinkIt(sAttestationIds, sWordform, sWdb, sOpmerking);
							}

							// no ambiguity to deal with
							else {

								fn.callFunction(sApiSchema+".search_for_other_lemma", 
										[fn.quote(sWordform), (sLemmaId == ''?'NULL':sLemmaId), fn.quote(sWdb), (sMultiLemmaId == ''?'NULL':sMultiLemmaId)], 
										function(response){
									
									// found lemmata are given in a ^^^-separated string
									
									var foundLemmata = response["search_for_other_lemma"];
									var foundLemmataArr = foundLemmata.split("^^^");
									

									// no lemma was found, build a new one?

									if (foundLemmata == '') {
										fn.confirm("Lemma ontbreekt", "Er is geen ander lemma met deze vorm in het "+sWdb+".<br><br>Wilt u '"+sWordform+"' aanmaken?", 
											function(){

												// ready to link:
												
												// we were searching for a lemma
												if (sWordform.indexOf("+")<0) {
													hilexlib.fnBuildLemmaAndLinkIt(sAttestationIds, sWordform, sWdb, sOpmerking);
												}
												// we were searching for a multiple lemma
												else {
													hilexlib.fnBuildMultiLemmaAndLinkIt(sAttestationIds, sWordform, sWdb, sOpmerking);
												}
											},
											function(){
												fn.message("OK", "Bewerking door gebruiker geannuleerd");
											}
										);
										
									}
									

									// a (multi)lemma matching the input was found,
									//
									// now allow the user
									//    - to choose it 
									// or - to build a new one

									else {
										var aAllOptions = new Array();
										
										hilexlib.fnBuildOptionsForOneLemma( aAllOptions, foundLemmataArr );
										
										aAllOptions.push("Maak een ander lemma aan");		
										
										fn.promptSelect(["Kies het juiste lemma", "Kies het juiste lemma (Houd SHIFT ingedrukt bij klikken om meer info te tonen):"], 
												aAllOptions, [], 
												function(response){
													// do nothing
												}, 
												function(){
													fn.message("OK", "Geannuleerd");
												}, 
												function(selectedText){
													
													var toets = kf._getPressedKey();
													
													// need information the lemma ?

													if (toets == 'shift') {
														hilexlib.fnShowLemmaInfo(selectedText, sWdb);
													}

													// assign lemma_id!

													else {
														// if we have a lemma_id, make a link with that lemma
														if (selectedText.indexOf("(lem_id:")>-1){

															var iBegin = selectedText.indexOf("lem_id:") + "lem_id:".length;
															var iEnd = selectedText.indexOf(")", iBegin);
															var sLemId = selectedText.substring(iBegin, iEnd);

															
															// ready to link:

															fn.updateDatabaseGivenFieldValues(t, 
																	{"attestation_ids": "^"+sAttestationIds+"$"}, 
																	{"lemma_id": sLemId, "multiple_lemmata_analysis_id": null},
																	function(){
																		
																		fn.updateDatabaseGivenFieldValues(t, 
																				{"attestation_ids": "^"+sAttestationIds+"$"}, 
																				{"opmerking": sOpmerking.replace(/nieuw +lemma/, "lemma verwerkt")},
																				function(){
																					fn.closeDialog();
																					fn.callDatabase("lemmata_and_paradigm_view", {"lemma_id": sLemId});
																					fn.refreshTable(t);
																					
																				});
																		
															});
														}

														// if we have a multi-lem_id, make a link with that multiple lemma
														else if (selectedText.indexOf("(multi_lem_id:")>-1) {

															var iBegin = selectedText.indexOf("multi_lem_id:") + "multi_lem_id:".length;
															var iEnd = selectedText.indexOf(")", iBegin);
															var sMultiLemId = selectedText.substring(iBegin, iEnd);

															
															// ready to link:
															
															fn.updateDatabaseGivenFieldValues(t, 
																	{"attestation_ids": "^"+sAttestationIds+"$"}, 
																	{"lemma_id": null, "multiple_lemmata_analysis_id": sMultiLemId},
																	function(){
																		
																		fn.updateDatabaseGivenFieldValues(t, 
																				{"attestation_ids": "^"+sAttestationIds+"$"}, 
																				{"opmerking": sOpmerking.replace(/nieuw +lemma/, "lemma verwerkt")},
																				function(){
																					fn.closeDialog();
																					fn.callDatabase("lemmata_and_paradigm_view", {"multiple_lemmata_analysis_id": sMultiLemId});
																					fn.refreshTable(t);
																					
																				});
																		
																	});
														}
														// if the selectedText contains NO lemma_id, we have to build a new lemma and so on
														else {
															// we were searching for a lemma
															if (sWordform.indexOf("+")<0) {
																hilexlib.fnBuildLemmaAndLinkIt(sAttestationIds, sWordform, sWdb, sOpmerking);
															}
															// we were searching for a multiple lemma
															else {
																hilexlib.fnBuildMultiLemmaAndLinkIt(sAttestationIds, sWordform, sWdb, sOpmerking);															
															}
														}
														
													} // end of choice handling
													
												});
										
										}
									
								});
							}
							
						}, 
						function(){
							fn.message("Geannuleerd", "Operatie door gebruiker geannuleerd.");
						});
				
			}
			
		},
		
		
		"button_2":{
			
			"name": "Schoonvegen",
			"tooltip": "Verwijder alle attestaties uit de citaat",
			"click": function(t){
				
				fn.confirm("Geselecteerde citaten schoonvegen", "Weet u het zeker?", function(){
					
					var oRows = fx.getSelectedRowsFrom(t);
					oRows.every(function(){
						
						var oRow = this;
						var bLastRow = fx.isLastRowOf(oRow, oRows);
						
						// remove indexes
						fx.updateDatabaseGivenACellOrRow(oRow, 
								{ "onsetoffset": "none" }, 
								function(){
									if (bLastRow) {
										if (oRows.count()>1) {
											fn.refreshTable(t);
										}
										else {
											var sRecordId = fx.getRowId( fx.getFirstSelectedRowFrom(t) );
											fn.getRecord(t, sRecordId, function(record){													
												fx.putDataIntoCell(oRow, "onsetoffset", record["onsetoffset"]);
												fx.putDataIntoCell(oRow, "quotation", record["quotation"]);
												});
											}
									}
										
						});
					}); // end or rows loop
										
				});					
			}
			
		},
		
		"button_3":{
			
			"name": "Verwijder selectie",
			"click": function(t){
				
				var oSelection = fx.getSelectedRowsFrom(t);
				
				if (oSelection.count()==0) {
					fn.message("Let op", "U moet attestaties selecteren!");
				}
				else {
					
					fn.confirm("Verwijder selectie", "Weet u zeker dat u deze attestatie(s) wilt verwijderen?", function(){							
						
						oSelection.every(function(){
							
							var oRow = this;
							var bLastOne = fx.isLastRowOf(oRow, oSelection);

							var attIds = fx.getDataFromCellInRow(oRow, "attestation_ids");

							fn.callFunction(sApiSchema+'.set_lemma_string_for_attestation_worktable', [fn.quote(attIds), true], function(){

								fx.removeFromDatabaseGivenARow(oRow, 
									function(){

										if (bLastOne){
											fn.refreshTable(t);
											fn.refreshTable("lemmata_and_paradigm_view");
										}																	
									}
								);
							});
							
						});
						
					});
					
				}
				
			}
		},
		
		"button_4":{
			
			"name": "Dupliceer",
			"click": function(t){
				
				var oRow = fx.getFirstSelectedRowFrom(t);
				
				if ( oRow.any() ) {
					fn.confirm("Dupliceer citaat", "Weet u het zeker?", function(){
						
						fn.showProcessingMsg(t);
						
						var sAttIds = fx.getDataFromCellInRow(oRow, "attestation_ids");
						fn.callFunction(sApiSchema+'.copy_attestation', [sAttIds], function(){							
							fn.refreshTable(t);
							fn.removeProcessingMsg(t);
						});
					});
					
				}				
			}
		},
		
		"button_5": {
			
			"name": "Supersonisch!",
			"bgcolor": "yellow",
			"textcolor": "black",
			"click": function(t){
				
				var sQuoteSearchString = fn.getValueOfFilterBox(t, "quotation");
				
				if (sQuoteSearchString == '') {
					fn.message("Let op", "Deze functie zoekt in het quotation-veld. Tik eerst een zoekwaarde in de zoekbox.");
				}
				else {
					var aQuoteVectorSearch = sQuoteSearchString.split(" ");
					for (var i=0; i<aQuoteVectorSearch.length; i++) {
						aQuoteVectorSearch[i] = aQuoteVectorSearch[i]+":*";
					}
					var sQuoteVectorSearch = aQuoteVectorSearch.join(" & ");
					fn.addFilters(t, {"quote_vector": sQuoteVectorSearch})
					
					fn.callDatabase(t, {"quotation": sQuoteSearchString, "quote_vector": sQuoteVectorSearch});
					
				}
				
			}
		},
		
		"button_6": {
			
			"name": "Ongeattesteerd",
			"click": function(t){
				fn.clearAllFilters(t);
				fn.callDatabase(t, {"onsetoffset": "\\y(none|0,0)\\y"});
			}
		},

		/*
		"button_7": {
			
			"name": "Notes",
			"click": function(t){
				
				fn.prompt("Notes config", ["Notes code"], [taNotesKey], 
					function(){
						taNotesKey = fn.getPromptBoxInput("Notes code");
					}, 
					function(){
						fn.message("OK", "Operatie door gebruiker geannuleerd");
					});
			}
		},
		*/

		"button_7": {
			"name": "L:",
			"tooltip": "Klik om op linker-context te sorteren; herhaal klik voor andere volgorde",
			"bgcolor": "lightblue",
			"click": function(t, n){

				var sSortDir = fn.getSortingDirectionOf(t, "token_previous");
				var aSortingDirs = ["asc", "desc", "asc_reverse", "desc_reverse"];

				var iCurrentSortingDir = $.inArray(sSortDir, aSortingDirs);
				iCurrentSortingDir++;
				if (iCurrentSortingDir == aSortingDirs.length) iCurrentSortingDir = 0;
				sSortDir = aSortingDirs[iCurrentSortingDir];
				fn.setCustomButtonName(t, 7, "L: "+sSortDir);
				fn.setCustomButtonName(t, 8, "R: "); // cancelled

				fn.setSorting(t, {"token_previous": sSortDir});
				fn.refreshTable(t);
			}
		},

		"button_8": {
			"name": "R: ",
			"tooltip": "Klik om op rechter-context te sorteren; herhaal klik voor andere volgorde",
			"bgcolor": "lightblue",
			"click": function(t, n){
				var sSortDir = fn.getSortingDirectionOf(t, "token_next");
				var aSortingDirs = ["asc", "desc", "asc_reverse", "desc_reverse"];

				var iCurrentSortingDir = $.inArray(sSortDir, aSortingDirs);
				iCurrentSortingDir++;
				if (iCurrentSortingDir == aSortingDirs.length) iCurrentSortingDir = 0;
				sSortDir = aSortingDirs[iCurrentSortingDir];
				fn.setCustomButtonName(t, 8, "R: "+sSortDir);
				fn.setCustomButtonName(t, 7, "L: "); // cancelled

				fn.setSorting(t, {"token_next": sSortDir});
				fn.refreshTable(t);

			}
		}
		
	}
	
	
};


hilexattestations.config = {
	
	
	token_attestations_worktable: {

        /*
		"notes":{
			"width": "30px",
			"cell_tooltip": "Toevoegen: Klik / Verwijder: Alt+Klik",
			"click": function(t, n){
				
				var currentVal = fn.getDataFromCellNode(n);
				var nCurrentRow = fn.getRowNode(n);
				var sRecordId = fn.getRowNodeId(n);
				
				// alt pressed = remove notes
				if (kf._getPressedKey() == "alt") {
					// if there is only one note, just remove it
					if (currentVal.trim().split(" ").length == 1) {
						currentVal = ""
					}
					// but if there are more than one notes, check which one was clicked upon
					else {
						var clickedUpon = fn.getWordClickedUponInNode(nCurrentRow, "notes");
						currentVal = (currentVal.regexReplaceAll("(\\b"+clickedUpon.text+"\\b)", "").regexReplaceAll(" +", " ")).trim();
					}						
				}
				// no key pressed means: add note
				else {
					// add note only if it isn't there yet, otherwise we'll get doubles
					if ( !currentVal.match("\\b"+taNotesKey+"\\b") )
						currentVal += " "+taNotesKey;						
				}
				
				// update database with new notes, and update cell on screen
				fn.updateDatabaseGivenANode(n, {"notes": currentVal.trim()}, function(){
					
					fn.getRecord(t, sRecordId, function(resp){				
						fn.putDataIntoCellNode(nCurrentRow, "notes", resp["notes"]);
					})
				});
			}				
		},
		*/
		
		"process_now": {
			"visible": false
		},
		
		"job_page": {
			
		},

		"token_previous": {
			"visible": false
		},
		"token_next": {
			"visible": false
		},
		
		"opmerking": {
			"editable": true
		},
		
		"online": {
			"editable": true
		},
       
       "source_id": {
		    //"nice_name": "src",
			"choosefrom": ["", "ONW", "ONWn", "ONW|ONWn", "VMNW", "VMNWn", "VMNW|VMNWn", "MNW", "MNWn", "MNW|MNWn", "WNT", "WNTn", "WNT|WNTn"]
		},
		
		"attestation_location": {
			
			"click": function(t, n){
				
				var sQuoteSectionId =	fn.getDataFromCellNode(n);
				var sWdb = 				fn.getDataFromSiblingNode(n, "source_id");
				//var sWords = 			removeTags( fn.removeHighlight(fn.getDataFromSiblingNode(n, "wordform")) );
				
				
				if (kf.isPressed("shift")) {
					
					fn.callDatabaseInNewTab(t, {"attestation_location": "\"exact:"+sQuoteSectionId+"\""});
				}
				else {
					// look up the right lemma PID given the current attestation_location
					
					fn.callFunction(sApiSchema+".get_online_pid_for_quote_id", [sQuoteSectionId], function(response){
						
						setTimeout(function(){
							
							var sLemmaPid = response["get_online_pid_for_quote_id"];
							
							// if we didn't manage to get a PID, extract a (very likely) valid one from the attestation_location
							
							if (sLemmaPid == '' || sLemmaPid == null) {
								
								if ( $.startsWith(sWdb, "MNW") ) {
									// MNW quotes ids are like c49737_0000
									sLemmaPid = sQuoteSectionId.substring(1, sQuoteSectionId.indexOf("_"));
								}
								else if ( $.startsWith(sWdb, "WNT") ) {
									// WNT quotes ids are like M062741.eg.11762
									sLemmaPid = sQuoteSectionId.substring(0, sQuoteSectionId.indexOf("."));
								}
							}
							
							// function for opening GTB quotes
							// http://gtb.inl.nl/iWDB/search?actie=article&wdb=WNT&id=M000145&Citaat_id=S000095.eg.257&citaat=werken&domein=2
							
							//window.open("http://gtb.inl.nl/iWDB/search?actie=article&wdb="+sWdb+"&id="+sLemmaPid+"&Citaat_id="+sQuoteSectionId+"&citaat="+sWords+"&domein=2");
							window.open("http://gtb.inl.nl/iWDB/search?actie=article&wdb="+sWdb+"&id="+sLemmaPid+"&Citaat_id="+sQuoteSectionId+"&domein=2");
							
						}, 200);
						
					});
				}
				
			}
		},
		

		
		"lemma_id": {
			"click": function(t, n){
				var sLemmaId = fn.getDataFromCellNode(n);
				fn.callDatabase("lemmata_and_paradigm_view", {"lemma_id": sLemmaId},
					function(){
						fn.scrollToTable("lemmata_and_paradigm_view");
					});
			}
		},
		
		"multiple_lemmata_analysis_id": {
			"nice_name": "mla_id",
			"width": "30px",
			"click": function(t, n){
				var sMultilemId = fn.getDataFromCellNode(n);
				fn.callDatabase("lemmata_and_paradigm_view", {"multiple_lemmata_analysis_id": sMultilemId},
					function(){
						fn.scrollToTable("lemmata_and_paradigm_view");
					});
			}
		},
		
		"modern_lemma": {
			"cell_tooltip": "Toon citaten die ambiguïteit delen<BR>[Shift] String bijwerken",
			"click": function(t, n){

				if (kf.isPressed("shift")){
					var sAttId = fn.getDataFromSiblingNode(n, "attestation_ids");
					fn.callFunction(sApiSchema+".set_lemma_string_for_attestation_worktable", [sAttId, false], function(){

						var sOnsetoffset = fn.getDataFromSiblingNode(n, "onsetoffset");
						var sQuotSectId = removeTags(fn.getDataFromSiblingNode(n, "attestation_location"));
						fn.clearAllFilters(t);
						fn.callDatabase(t, {"onsetoffset": "^"+sOnsetoffset+"$", "quotation_section_id": "^"+sQuotSectId+"$"});
					});
				}
				else {
					var sOnsetoffset = fn.getDataFromSiblingNode(n, "onsetoffset");
					var sQuotSectId = removeTags(fn.getDataFromSiblingNode(n, "attestation_location"));
					fn.clearAllFilters(t);
					fn.callDatabase(t, {"onsetoffset": "^"+sOnsetoffset+"$", "attestation_location": "^"+sQuotSectId+"$"});
				}

				
			}
		},
		
		"attestation_ids": {
			"nice_name": "att_ids",
			"class": "linebrk",
			"render": function(text){
				return text.replace(/([^,]+,[^,]+,[^,]+,)/g, '$1 ');
			},
			"visible": false
		},

		"onsetoffset": {
			"visible": false
		},
		"wordform": {
			"class": "linebrk_wf",
			"render": function(text){
				return text.replace(/([^,]+,[^,]+,[^,]+,)/g, '$1 ');
			},
			"visible": false
		},
		// column wordform_alphabetic is used by a database for comparing a newly manually built attestation
		// with pre-existing attestation of the same lemma, so as to be able to decide wether a new set of
		// analysed wordforms needs to be constructed or not.
		"wordform_alphabetic": {
			"visible": false
		},
		"analysed_wordform_ids": {
			"visible": false
		},
		"analysed_wordform_ids_arr": {
			"visible": false
		},
		"group_id": {
			"visible": false
		},
		
		"metadata_id": {
			"cell_tooltip": "Toon metadata",
			"click": function(t, n){
				
				var oCell =			fx.getCell(n);
				var iDocumentId =	fx.getDataFromCell(oCell);
				
				fn.callDatabase("metadata", {"metadata_id": iDocumentId}, 
						function(){
							fn.scrollToTable("metadata");
						});
			}
		},
		"doorvoeren": {
			
			"sortable": false,
			"button": "Doorvoeren",
			"button_tooltip": "Gewijzigde attestatie verwerken in het lexicon",
			"click": function(t, n){
				
				fn.confirm("Attestatie verwerken", 
						"Weet u zeker dat u de gewijzigde attestatie nu in het lexicon wilt verwerken? "+
						"<br><br>" +
						"(Doe dit pas als in de citaat de correcte tokens geselecteerd zijn)", 
				
					function(){
					
						$(n).find("button").hide();
				
						fn.showProcessingMsg(t);
				
				
						// Some words have been selected manually in the quote, causing new
						// onsets and offsets to be saved into the onsetoffset column.
						//
						// Now the 'Doorvoeren' button has been clicked on,
						// we need to rebuild the other fields content accordingly:
											
						// [1] in a first step we gather the highlight wordforms
						//     and put those in the same order as the their onsets (=keep relation!) 
												
						var sNewWordform_sNewIndexes = hilexlib.computeWordsFromIndexes(t, n);
						
						var sNewWordform = sNewWordform_sNewIndexes[0];
						var sNewIndexes =  sNewWordform_sNewIndexes[1];
						
						// Write these into the right columns (both onto screen as into database)
						
						var oRow = fx.getRow(n);
						
						fx.putDataIntoCell(oRow, "wordform", sNewWordform);
						fx.putDataIntoCell(oRow, "onsetoffset", sNewIndexes);
						
						fx.updateDatabaseGivenACellOrRow(oRow, 
								{"wordform": removeTags(sNewWordform), "onsetoffset": sNewIndexes, "process_now": true}, 
								function(){
							
							// the function call will cause a trigger to be activated
							// so the following steps will happen:
							
							// [2] analysed_wordforms for those words will be looked up
							//     (or will be created if they don't exist yet) and
							//     those analysed_wordforms will be put in the same order as the wordforms  
							//   
							// N.B.: Sorting both wordform and analysed_wordforms by onsets
							//       is needed to keep the relation between those three components, 
							//       since later on these data is processed back into the native 
							//       token_attestations table: this consists of separate records for each 
							//       analysed_wordform, which of course need to refer to the
							//       correct wordform and onset (word position) in the quote.
							//       (see final step of trigger, calling api.process_new_token_attestations)								
							//
							// [3] as we're done with the worktable, we will need to update
							//     the native token_attestations table and clean up the paradigm 
							
							
							// when all this is done, this callback is called so:
							// refresh to see the results!
							
							fn.refreshTable("lemmata_and_paradigm_view");
							fn.refreshTable(t);
							
						});
							
					}); // end of function
							
				
			} // end of click event
		},
		"quotation": {
			"colsort": "asc",
			"cell_tooltip": "Klik om woorden te (de)highlighten",
			"mouseup": function(t, n){
				
				// do we have a text selection?
				var oCell = 		fx.getCell(n);
				var oSelectedText =	fx.getSelectedTextInCell(oCell);
				
				
				// if selection is empty, that means that we've clicked on a word
				// without selecting it manually.
				// In this case, try to select the word that was clicked upon
				if (oSelectedText.text == '' && oSelectedText.reliable) {						
					oSelectedText = fx.getWordClickedUponInCell(oCell);						
				}
				
				// if we have a selection now, process it
				if (oSelectedText.text!='' && oSelectedText.reliable) {
					
					// check if the selected text contains commas, which is not allowed since it is used as a separator
					if (oSelectedText.text.indexOf(",")>-1) {
						fn.message("Let op", "De gekozen tekst bevat komma's. Dat is niet toegestaan!");
					}
					
					else {
						// get the registered onsets and offsets
						
						// put the token indexes string into an array
						
						var sTokenIndexesIds = 		fx.getDataFromSiblingCell(oCell, "onsetoffset");
						var sOldTokenIndexesIds =	sTokenIndexesIds;
						var aTokenIndexesIds = 		(sTokenIndexesIds!='' && sTokenIndexesIds!= 'none') ?
													sTokenIndexesIds.split("\|") : new Array();
												
						// get the current screen selection
						var iStart =	parseInt(oSelectedText.start);
						var iEnd = 		parseInt(oSelectedText.end);
						
						
						// is this selection already part of the registered onsets and offsets?
						var iIndexOfThisPair = $.inArray(iStart+","+iEnd, aTokenIndexesIds);					
						
						// if token was already marked as token, remove it
						if (iIndexOfThisPair>-1) {
							aTokenIndexesIds.splice(iIndexOfThisPair, 1);							
						}
						// otherwise add the selected token(s)
						else {
							// remove the tokens that are within the selection (=overlap)
							// and add the selection as a whole after that
							
							var bAddSelection = true;
							for (var i=aTokenIndexesIds.length-1; i>=0; i--) {
								
								var sOnePair = aTokenIndexesIds[i];
								var iOneStart = parseInt(sOnePair.split(",")[0]);
								var iOneEnd = parseInt(sOnePair.split(",")[1]);
								
								// if token is within the selection, remove it
								if (iStart<=iOneStart && iOneEnd<=iEnd) {
									aTokenIndexesIds.splice(i, 1);
								}
								// if selection is within/overlapping an existing token, do nothing
								else if ( ( iOneStart<=iStart && iStart<=iOneEnd ) ||
										  ( iOneStart<=iEnd   && iEnd<=iOneEnd   ) ) {
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
						if (sTokenIndexesIds == '') 
							sTokenIndexesIds = "none";
						
						fn.showProcessingMsg(t);
						
						fx.updateDatabaseGivenACellOrRow(
								oCell, 
								{"onsetoffset": sTokenIndexesIds}, 
								function(){
									fn.showProcessingMsg(t);
									
									var oRow = fx.getRowFromCell(oCell);
									fx.callRecord(oRow, ["quotation", "onsetoffset"], function(){
										hilexlib.putHighlightOnOneRow(oRow);
										fn.removeProcessingMsg(t);
										
										// attract attention from user to this button, which must be pressed 
										// as soon as the quotation was modified
										
										var blink = function(elem) {
										    $(elem).find("button").animate({
										        opacity: '0'
										    }, function(){
										        $(this).animate({
										            opacity: '1'
										        }, blink(elem));
										    });
										};										
										var nDoorvoeren = fn.getCellInRowNode(fn.getRowNode(n), "doorvoeren");
										$(nDoorvoeren).find("button")
											.css("background-color", "red")
											.css("color", "white");
										blink( nDoorvoeren );
									});
									
								});
						
						}
					}					
			}
		},
		"quote_vector": {
			"visible": false
		}
	}
	
};