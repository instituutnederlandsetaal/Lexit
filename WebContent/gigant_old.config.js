/**
 * Client configuration file
 */


// list of tables that must be hidden
oHiddenTablesList = ["alternate_modern_lemmata", 
                     "analyzed_wordforms",
                     "analyzed_wordforms_parts",
                     "analyzed_wordforms_and_wordforms", 
                     "analyzed_wordforms_to_delete",
                     "conversion_rules", 
                     "corpora", 
                     "corpusId_x_documentId",
                     "derivations", 
                     "documents",
                     "documents_view",
                     "documents_and_frequencies", 
                     "dont_show", 
                     "inflaction_classes", 
                     "inflection_classes",
                     "languages",
                     "lemma_feature_assignments", 
                     "lemma_features", 
                     "lemma_feature_values",
                     "lemma_inflection_class", 
                     "lemmata",
                     "lemmata_and_wordforms", 
                     "lemmata_selectie_view",
                     "lexica", 
                     "lexical_source_lemma", 
                     "lexical_source_wordform",
                     "morphological_analyses", 
                     "morphological_operations", 
                     "multiple_lemmata_analyses",
                     "multiple_lemmata_analysis_parts", 
                     "multiword_analyses", "multiword_operations",
                     "paradigm_positions", "paradigms", 
                     "part_morphological_analysis", 
                     "part_multiword_analysis",
                     "pattern_applications", 
                     "patterns", 
                     "simple_analyzed_wordforms",
                     "stems", 
                     "stem_types", 
                     "text_attestations",                     
                     "text_attestation_verifications",
                     "token_attestation_verifications",
                     "token_attestations",
                     //"token_attestations_view",
                     "token_indexes",
                     "transcategorizations", 
                     "transcategorization_types", 
                     "transformsets",
                     "type_frequencies",
                     "users",
                     "wordforms",
                     "wordform_groups",
                     "wordform_transform_instance"
                     ];



oTableSettingsList = {
		
		documents :{
			"replace_button": false,
			"selection_button": false,
			"undo_button": false,
			"goto_button": false
		},
		
		lemmata : {
			"size": "55%",
			"callback" : function(){
				$(document.body)
				.queue(function(){fn.callDatabase("analyzed_wordforms_and_wordforms", {"lemma_id": "1"}, null, "i"); $(this).dequeue();})
				.delay(500)
				.queue(function(){fn.breakTableLine(); fn.callDatabase("token_attestations_view", {"analyzed_wordform_id": "0"}, null, "i"); $(this).dequeue();})
				.delay(500)
				.queue(function(){fn.callDatabase("documents", {"document_id": "1"}, null, "i"); $(this).dequeue();});			
			}
		},
	
		analyzed_wordforms_and_wordforms : {
			"size": "40%"
			
		},
		
		
		
		
		
		// top view at the beginning, where one can browse lemmata and their wordforms
		
		lemmata_and_wordforms_view : {
			"callback": function(confTable){
				
				fn.showProcessingMsg(confTable);
				
				var allRows = fn.getAllRows(confTable);
				
				allRows.each(function(){
					var id = fn.getDataFromCellNamed(confTable, this, "lemma_id");					
					fn.callFunction("concatenate_wordforms", [fn.quote(id)], 
							confTable, this, "wordforms");
				});
				
				fn.removeProcessingMsg(confTable);
			},
			"repeat_callback": true
		},
		
		
		
		// left window : all wordforms of a lemma in a column
		
		lemmata_and_wordforms : {
			"main_search": false,
			"replace_button": false,
			"undo_button": false,
			"size": "50%",
			"selection_button_active": true,
			
			"button_0": {
				"name": "Verwijder",
				"tooltip": "Verwijder de geselecteerde analyse (klik een rij aan)",
				"click": function(confTable){
					
					var answer = confirm("Weet u het zeker?");
					if (answer)
						{						
						if ( fn.getNumberOfSelectedRows(confTable)>0)
							{
							var aSelectedRows = fn.getSelectedRowsFrom(confTable);
							aSelectedRows.each(function(){
								
								var sAwfId = fn.getDataFromCellInRowNode(confTable, this, "analyzed_wordform_id");
								fn.removeFromDatabaseGivenFieldValues("analyzed_wordforms", 
										{"analyzed_wordform_id": sAwfId}, false,
										function(){fn.refreshTable(confTable);});
								});
							}
						else
							{
							alert("Er is geen analyse geselecteerd.");
							}
						
						}			
					
				}
			},
			
			"callback": function(confTable){
				
				fn.showProcessingMsg(confTable);
				
				var allRows = fn.getAllRows(confTable);
				
				allRows.each(function(){
					
					var id = fn.getDataFromCellInRowNode(confTable, this, "analyzed_wordform_parts_id");
					fn.callFunction("get_awf_parts", [fn.quote(id)], 
							confTable, this, "parts");					
					
				});
				fn.removeProcessingMsg(confTable);
			},
			"repeat_callback": true
		},
		
		
		
		// right window : the table to choose a lemma from
		
		lemmata_selectie_view : {
			"size": "48%",		
			"main_search": false,
			"replace_button": false,
			"undo_button": false,
			"refresh_upon_focus": false,
			"selection_button_active": true,
			
			"button_0": {
				"name": "Nieuw lemma",
				"bgcolor": "green",
				"tooltip": "Maak een nieuw lemma aan",
				"click": function(confTable){
					
					fn.prompt("Nieuw lemma", ["Lemma", "Woordsoort"], null,
							function(){
						
						var sLemma = fn.getPromptUserInput("Lemma");
						var sPos   = fn.getPromptUserInput("Woordsoort");
						if (sLemma != "" && sPos != "")
							{
							fn.insertIntoDatabase("lemmata", 
									{"modern_lemma": sLemma, "lemma_part_of_speech": sPos}, 
									null, false, 
									function(){
										fn.callDatabase(confTable, {"modern_lemma": "^"+sLemma});
									});
							}
					});
				} 
			},
			
			"button_1": {
				"name": "Bewerk lemma",
				"tooltip": "Bewerk de lemmavorm en de woordvorm",
				"bgcolor": "#CECEF6",
				"click": function(confTable){					
					
					if (fn.getNumberOfSelectedRows(confTable) != 1)
						alert("Kies één lemma om te bewerken, niet meer, niet minder");
					else
						{
						var aSelectedRows = fn.getSelectedRowsFrom(confTable);
						
						aSelectedRows.each(function(){
							var nCurrentNode = this;
							var sLemmaId = fn.getDataFromCellInRowNode(confTable, nCurrentNode, "lemma_id");
							var sLemmaForm = fn.getDataFromCellInRowNode(confTable, nCurrentNode, "modern_lemma");
							var sPos = fn.getDataFromCellInRowNode(confTable, nCurrentNode, "pos");
							
							fn.prompt("Pas lemma- en woordvorm aan", 
									["Lemma", "Woordvorm"], [sLemmaForm, sPos], 
									function(){
								
								
								
								fn.updateDatabaseGivenFieldValues("lemmata", 
										{"lemma_id": sLemmaId}, 
										{"modern_lemma": fn.getPromptUserInput("Lemma"),
										 "lemma_part_of_speech": fn.getPromptUserInput("Woordvorm")}, 
										 false, function(){
											 fn.callRecord(confTable, nCurrentNode, sLemmaId, 
													 ["modern_lemma", "pos"]);
										 });
								
							});
						});
						
						}
					
				}
			},
			
			"button_2": {
				"name": "Verwijder Lemma",
				"tooltip": "Verwijder het geselecteerde lemma (klik een rij aan)",
				"click": function(confTable){
					
					var answer = confirm("Weet u het zeker?");
					if (answer)
						{
						if ( fn.getNumberOfSelectedRows(confTable)>0)
							{
							var aSelectedRows = fn.getSelectedRowsFrom(confTable);
							aSelectedRows.each(function(){
								
								var sAwfId = fn.getDataFromCellInRowNode(confTable, this, "lemma_id");
								fn.removeFromDatabaseGivenFieldValues("lemmata", 
										{"lemma_id": sAwfId}, false, 
										function(){fn.refreshTable(confTable);});
								});
							}
						else
							{
							alert("Er is geen lemma geselecteerd.");
							}				
						
						}				
					
				}
			},
			
			"callback": function(confTable){
				
				var allRows = fn.getAllRows(confTable);
				
				allRows.each(function(){
					var id = fn.getDataFromCellNamed(confTable, this, "lemma_id");					
					fn.callFunction("concatenate_wordforms", [id], 
							confTable, this, "wordforms");
				});
			},
			"repeat_callback": true
		},
		
		
		
		
		// view accessed through 'citaat' button
		
		token_attestations_view : {
			
			"header_height": "75px",
			"refresh_upon_focus": false,
			
			"button_0":
				{
				"name": "Tokens valideren",
				"click": function(confTable){
					putPartsAndTokensEquality(confTable);
					}
				},
			
			"callback": function(confTable){
				
				highlightAllQuotes(confTable);
				putPartformsAndPos(confTable);
				
			},
			"repeat_callback": true
		},
		
		// view accessed through 'document' button
		
		documents_view : {
			"size": "50%",
			"replace_button": false,
			"selection_button": false,
			"undo_button": false,
			"goto_button": false
		}
		
		
},

// container object for the configuration of each table
oTableConfigurationList = {
		
		analyzed_wordforms_and_wordforms : {
			
			analyzed_wordform_id: {
				"click": function(confTable, confNode){
					var content = confTable.fnGetData(confNode);
					fn.callDatabase("token_attestations_view", {"analyzed_wordform_id": content},  
							function(){fn.scrollToTable("token_attestations_view");});
				}
			},
			lemma_id: {"visible": false},
			wordform_id: {"visible": false}
		},
		lemmata : {
			lemma_id: {
				"click": function(confTable, confNode){
					var content = confTable.fnGetData(confNode);
					fn.callDatabase("analyzed_wordforms_and_wordforms", {"lemma_id": content},  
							function(){					
						
						var allIds = new Array();
						fn.getAllRows("analyzed_wordforms_and_wordforms").each(function(){
							allIds.push(fn.getDataFromCellNamed("analyzed_wordforms_and_wordforms", this, "analyzed_wordform_id"));						
						});
						
						if (allIds.length>0)
							fn.callDatabase("token_attestations_view", 
								{"analyzed_wordform_id": "^("+allIds.join("|")+")$"},  
								function(){fn.scrollToTable("token_attestations_view");});
						
					});
					
					
				} 
				
			},
			modern_lemma: {},
			gloss: {},
			persistent_id: {
				"click": function(confTable, confNode){
				var id = fn.getDataFromCellNode(confTable, confNode);				
				var url = "http://gtb.inl.nl/iWDB/search?actie=article&wdb=WNT&id="+id+"&content-type=text/html; charset=utf-8";
				window.open(url);
				}
			},
			lemma_part_of_speech: {},
			ne_label: {"visible": false},
			portmanteau_lemma_id: {"visible": false},
			language_id: {"visible": false}
		},
		
		documents_view : {
			
			document_id: {
				"visible": false
			}
		},
		
		documents_and_frequencies : {
			wordform: {"colsort": "asc"}
		},
	
		wordforms : {
			
			wordform_id			: {
				"colsort": "asc",
				"click": function(confTable, confNode){
							var content = confTable.fnGetData(confNode);
							fn.callDatabase("analyzed_wordforms", {"wordform_id": content},  
									function(){fn.scrollToTable("analyzed_wordforms");});
						} 
				},
			wordform			: {
				
				"editable": true,
				"edittrigger": "\\|",
				"editfunc" : function(confTable, confNode, value){					
										
					var wordforms = value.split("\|");
					
					if (wordforms.length==1)
						{
						fn.updateDatabaseGivenANode(confTable, confNode, null, value, true, null);
						}
					else
						{
						for (var i =0; i<wordforms.length; i++)
							{
							// redraw the table after last insert only
							var redrawTable = (i+1 == wordforms.length);
							fn.insertIntoDatabase(confTable, 
									{
										"wordform": wordforms[i], 
										"has_analysis": 0,
										"wordform_lowercase": wordforms[i].toLowerCase()
									}, 
									null, redrawTable);						
							}
						}
					
					
					}
				},
			has_analysis		: {"visible": false},
			wordform_lowercase	: {
				"editable": true,				
				"editfunc" : function(confTable, confNode, value){					
					console.log("test functie2");		
					fn.updateDatabaseGivenANode(confTable, fn.getRowNode(confNode), 
							"wordform_lowercase", value, true, null);
					
					
					}
			}
			
		},
		
		
		
		// top view at the beginning, where one can browse lemmata and their wordforms
		
		lemmata_and_wordforms_view : {
			
			pkid				: {"visible": false},
			lemma_id			: {"visible": false},
			modern_lemma		: {
				"cell_tooltip": "Toon GTB",
				"colsort": "asc", 
				"editable": false,
				"cell_tooltip": "Toon GTB",
				"click": function(confTable, confNode){
					var id = fn.getDataFromSiblingNode(confTable, confNode, "persistent_id");
					var url = "http://gtb.inl.nl/iWDB/search?actie=article&wdb=WNT&id="+id+"&content-type=text/html; charset=utf-8";
					window.open(url);
				}
			},
			gloss				: {"visible": false},
			persistent_id		: {"visible": false},
			ne_label			: {"visible": false},
			portmanteau_lemma_id: {"visible": false},
			language_id			: {"visible": false},
			pos			: {"visible": false},
			wordforms: {
				"cell_tooltip": "Toon woordvormen in nieuwe tabel",
				"searchable": false,
				"click": function(confTable, confNode){
					var lemmaId = fn.getDataFromSiblingNode(confTable, confNode, "lemma_id");
					fn.hideTable(confTable);
					fn.callDatabase("lemmata_and_wordforms", {"lemma_id": lemmaId}, 
							function(){
								if (!fn.tableExists("lemmata_selectie_view")) 
									fn.callDatabase("lemmata_selectie_view", {}, null);
					});			
					
				}
			}
			
		},
		
		
		// left window : all wordforms of a lemma in a column
		
		lemmata_and_wordforms : {
			
			pkid				: {"visible": false},
			analyzed_wordform_parts_id : {"visible": false},
			lemma_id			: {"visible": false},
			modern_lemma		: {				
				"cell_tooltip": "Toon GTB",
				"click": function(confTable, confNode){
					var id = fn.getDataFromSiblingNode(confTable, confNode, "persistent_id");			
					var url = "http://gtb.inl.nl/iWDB/search?actie=article&wdb=WNT&id="+id+"&content-type=text/html; charset=utf-8";
					window.open(url);
				}
			},
			gloss				: {"visible": false},
			persistent_id		: {"visible": false},
			analyzed_wordform_id: {
				"visible": false,
				"click": function(confTable, confNode){
					var awfId = fn.getDataFromCellNode(confTable, confNode);
					fn.callDatabase("analyzed_wordforms", {"analyzed_wordform_id": awfId});
					}
				},
			wordform_id: {"colsort": "asc", "visible": false},
			has_analysis		: {"visible": false},
			tooncitaat			: {
				"button": "Citaat",
				"button_tooltip": "Toon citaten",
				"click": function(confTable, confNode){
					var content = fn.getDataFromSiblingNode(confTable, confNode, "analyzed_wordform_id");
					fn.callDatabaseInNewTab("token_attestations_view", {"analyzed_wordform_id": content});
				}
			},
			toonfreq			: {"visible": false},
			wordform_part_of_speech : {"visible": false},
			ne_label			: {"visible": false},
			portmanteau_lemma_id: {"visible": false},
			language_id			: {"visible": false},
			wordform: {
				"textcolor": "blue",
				"click": function(confTable, confNode){					
					
					var sWordformId = fn.getDataFromSiblingNode(confTable, confNode, "wordform_id");
					var awfId = fn.getDataFromSiblingNode(confTable, confNode, "analyzed_wordform_id");
					var awfpId = fn.getDataFromSiblingNode(confTable, confNode, "analyzed_wordform_parts_id");
					
					// get the analyzed_wordform_parts
					fn.callFunction("get_wordforms", [fn.quote(sWordformId)], 
							null, null, null, null, function(){
						
						var aWordforms = fn.getFunctionOutput();
						
						if (aWordforms.length > 1)
							{
							// ask the user for the right order of the wordparts
							fn.promptReorder("Volgorde aanpassen", aWordforms, 
									function(){
								
								var aUserInputOrder = fn.getPromptUserInputOrder();
								var aWordformsInNewOrder = new Array();
								// update each wordpart for its partnumber
								for (var i=0; i<aUserInputOrder.length; i++)
									{
									aWordformsInNewOrder[i] = aWordforms[ aUserInputOrder[i] ];
									
									if (awfpId != '')
										fn.updateDatabaseGivenFieldValues("analyzed_wordforms_parts", 
												{"analyzed_wordform_parts_id": awfpId, "partform": aWordforms[i]}, 
												{"part_number": aUserInputOrder[i]}, false, 											
												null 
											);
									}
								// rebuild the wordform
								fn.callFunction("rebuild_wordform", [quote( aWordformsInNewOrder.join("|") )], 
										null, null, null, null, function(){

										fn.callFunction("concatenate_one_wordform", [fn.quote(awfId)], 
												confTable, fn.getRowNode(confNode), 
												"wordform");
									
											});
								
								});
							}
				}

				);}
			},
			wordform_lowercase	: {"visible": false},
			wf_link	: {"visible": false,
				"button": "Link",
				"click": function(confTable, confNode){
					
					if (fn.tableExists("wordforms"))
						{
						var lemmaId = fn.getDataFromSiblingNode(confTable, confNode, "lemma_id");
						var lemmaPos = fn.getDataFromSiblingNode(confTable, confNode, "lemma_part_of_speech");
						
						var selectedRows = fn.getSelectedRowsFrom("wordforms");
						selectedRows.each(function(){
							
							var wordformId = fn.getDataFromCellNamed("wordforms", this, "wordform_id");
							var refreshTheTable = fn.isLastNodeOf(this, selectedRows);
							fn.insertIntoDatabase("analyzed_wordforms", 
									{"wordform_id": wordformId, "lemma_id": lemmaId, "part_of_speech": lemmaPos}, 
									null, false, (refreshTheTable ? function(){fn.refreshTable(confTable);} : null));							
							});
						
						}
					else
						alert("Om te linken, moet u eerst de wordforms tabel openen!");
					
					
				}
			},
			wf_remove : {"visible": false,
				"button": "Unlink",
				"click": function(confTable, confNode){
					var answer = confirm("Wilt u het lemma en de woordvorm in deze rij echt ontkoppelen?");
					if (answer)
						fn.removeFromDatabaseGivenARow(confTable, fn.getRowNode(confNode), true, null);
				}
			},
			parts : {
				"click": function(){
					
				}
			}
			
		},
		
		
		
		// right window : the table to choose a lemma from
		
		lemmata_selectie_view : {
			
			pkid : {"visible": false},
			persistent_id : {"visible": false},
			lemma_id		: {"visible": false},
			modern_lemma: {
				"cell_tooltip": "Toon GTB",
				"colsort": "asc",
				"textcolor": "blue",
				"click": function(confTable, confNode){
					var id = fn.getDataFromSiblingNode(confTable, confNode, "persistent_id");			
					var url = "http://gtb.inl.nl/iWDB/search?actie=article&wdb=WNT&id="+id+"&content-type=text/html; charset=utf-8";
					window.open(url);
				}
			},
			gloss: {"visible": false},
			pos: {},
			wordforms: {"searchable": false},
			koppelen: {
				"button": "Koppelen",
				"button_tooltip": "Koppel dit lemma aan geselecteerde woordvorm",
				"click": function(confTable, confNode){
					var sIdOfLemmaToLink = fn.getDataFromSiblingNode(confTable, confNode, "lemma_id");
					
					var aSelectedRow = fn.getSelectedRowsFrom("lemmata_and_wordforms");
					if (aSelectedRow.length==0)
						alert("U moet eerst een woordvorm selecteren in 'lemmata_and_wordforms'.");
					else
						aSelectedRow.each(function(){
							var sAwfIdToLink = fn.getDataFromCellNamed("lemmata_and_wordforms", this, "analyzed_wordform_id");
							var bRefreshTablesNow = fn.isLastNodeOf(this, aSelectedRow);
							fn.updateDatabaseGivenFieldValues("analyzed_wordforms", 
									{"analyzed_wordform_id": sAwfIdToLink}, 
									{"lemma_id": sIdOfLemmaToLink}, 
									false, 
									function(){
										if (bRefreshTablesNow)
											{
											fn.refreshTable("lemmata_and_wordforms");
											fn.refreshTable("lemmata_selectie_view");
											fn.refreshTable("lemmata_and_wordforms_view");
											}										
										}	
									);						
						});						
					
					}
				},
			ne_label: {"visible": false},
			portmanteau_lemma_id: {"visible": false},
			language_id: {"visible": false}
		},
		
		
		
		token_attestations_view : {
			quote: {
				"colsort": "asc",
				"cell_tooltip": "Klik om woorden te (de)highlighten",
				"mouseup": function(confTable, confNode){
					
					// do we have a text selection?
					var oSelectedText = fn.getSelectedTextInNode(confTable, confNode);
					
					// if selection is empty, that means that we've clicked on a word
					// without selecting it manually.
					// In this case, try to select the word that was clicked upon
					if (oSelectedText.text == '' && oSelectedText.reliable)
						{						
						oSelectedText = fn.getWordClickedUponInNode(confTable, confNode);						
						}
					
					// if we have a selection now, process it
					if (oSelectedText.text!='' && oSelectedText.reliable)
						{
						var sTokenIndexesId = fn.getDataFromSiblingNode(confTable, confNode, "token_indexes_id");
						var iStart = oSelectedText.start;
						var iEnd = oSelectedText.end;
						
						// delete token (selection + escaped pressed on)
						if ( kf.isPressed("escape") )
							{					
							// delete
							fn.callFunction("delete_token", [sTokenIndexesId, iStart, iEnd],
									null, null, null, null,
									function(){
								
										// update highlight after deletion
										fn.callFunction("get_token_positions", [sTokenIndexesId], 
												confTable, fn.getRowNode(confNode), "positions", null, 											
											function(){												
												putHighlightOnOneRow(confTable, fn.getRowNode(confNode));
											});								
								});							
							
							}
						// process the selected token
						else
							{
							// add or remove token (removal happens if token was already marked as token)
							fn.callFunction("update_tokens", 
									[sTokenIndexesId, iStart, iEnd, fn.quote(oSelectedText.text) ], 
									null, null, null, null, 
									function(){
								
									// update highlight after database update
									fn.callFunction("get_token_positions", [sTokenIndexesId], 
											confTable, fn.getRowNode(confNode), "positions", null, 											
										function(){											
											putHighlightOnOneRow(confTable, fn.getRowNode(confNode));
											
										});
								
								
								});
							}
						
						}					
				}		
			},
			pkid : {"visible": false},
			token_indexes_id: {"visible": false},
			analyzed_wordform_id: {
				"cell_tooltip": "Toon gekoppelde lemma",
				"visible": false,
				"click": function(confTable, confNode){
					var iAwfId = fn.getDataFromCellNode(confTable, confNode);
					fn.callDatabase("lemmata_and_wordforms", {"analyzed_wordform_id": iAwfId});					
				}
			},
			analyzed_wordform_id_str: {"visible": false},
			document_id: {"visible": false},
			attestation_id: {"visible": false},
			positions: {"visible": false},
			document_id			: {"visible": false},
			document			: {
				"button_tooltip": "Toon metadata van oorspronkelijk document",
				"button": "Document",
				"click": function(confTable, confNode){
					var content = fn.getDataFromSiblingNode(confTable, confNode, "document_id");
					fn.callDatabase("documents_view", {"document_id": content}, function(){fn.scrollToTable("documents_view");});
				}
			},
			add_attestation : {
				"button_tooltip": "Maak kopie van citaat",
				"button": "Voeg attestatie toe",
				"click": function(confTable, confNode){
					
					fn.showProcessingMsg(confTable);
					
					var sQuote = fn.removeHighlight(fn.getDataFromSiblingNode(confTable, confNode, "quote"));
					var iAwfId = fn.getDataFromSiblingNode(confTable, confNode, "analyzed_wordform_id");
					var iDocId = fn.getDataFromSiblingNode(confTable, confNode, "document_id");
					
					fn.callFunction("build_new_attestation_record", 
							[ fn.quote(sQuote), iAwfId, "-1", iDocId ], 
							null, null, null, null, function(){fn.refreshTable(confTable);});
					
					fn.removeProcessingMsg(confTable);
				}
			},
			del_attestation : {
				"button_tooltip": "Verwijder deze attestatie",
				"tooltip": "Verwijder de geselecteerde attestatie (klik een rij aan)",
				"button": "Verwijder attestatie",
				"click": function(confTable, confNode){
					var answer = confirm("Weet u zeker dat u deze attestatie wilt verwijderen?");
					if (answer)
					{
						fn.showProcessingMsg(confTable);
						
						var iTokIndId = fn.getDataFromSiblingNode(confTable, confNode, "token_indexes_id");
						fn.removeFromDatabaseGivenFieldValues("token_attestations", {"token_indexes_id":iTokIndId}, false, 
								function(){
							fn.removeFromDatabaseGivenFieldValues("token_indexes", {"token_indexes_id":iTokIndId}, false,
									fn.refreshTable(confTable));
						});
						
						fn.removeProcessingMsg(confTable);
					}
				}
				
			},
			form_pos : {
				"cell_tooltip": "Klik hier om parts of speech aan de delen toe te kennen.",
				"click": function(confTable, confNode){
					
					var sTokenIndexId = fn.getDataFromSiblingNode(confTable, confNode, "token_indexes_id");
					var sAwfId = fn.getDataFromSiblingNode(confTable, confNode, "analyzed_wordform_id");
					var sAttestationId = fn.getDataFromSiblingNode(confTable, confNode, "attestation_id");
					
					fn.callFunction("get_token_list", [fn.quote(sTokenIndexId)], 
							null, null, null, null, 
							function(){
						
						// only one token 
						if (fn.getFunctionOutput().length == 1)
							{
							
							alert("Er zijn hier geen gescheiden delen met eigen parts of speech om te bewerken.")
							// in this case we only need to update the awf table
//							fn.prompt("Vormen en woordsoorten", fn.getFunctionOutput(), null,
//									function(){
//								row.clearRowSelection(fn.getTableName(confTable));
//								var sPos = fn.getPromptUserInput( fn.getFunctionOutput()[0] );
//								
//								fn.updateDatabaseGivenFieldValues("analyzed_wordforms", 
//										{"analyzed_wordform_id": sAwfId}, 
//										{"part_of_speech": sPos}, false, 
//										function(){fn.refreshTable(confTable);});
//							});
							}
						// we have more tokens
						else
							{
							// in that case we need to update th awf_parts table
							fn.prompt("Vormen en woordsoorten", fn.getFunctionOutput(), null,
									function(){
								row.clearRowSelection(fn.getTableName(confTable));
								
								var aAllFields = fn.getFunctionOutput();
								var aAllPartsOfSpeech = new Array();
								
								for (var i=0; i<fn.getFunctionOutput().length; i++)
									{
									aAllPartsOfSpeech.push( fn.getPromptUserInput( fn.getFunctionOutput()[i] ) );
									}
								
								var sListOfTokens = aAllFields.join("|").toLowerCase();
								var slistOfPos    = aAllPartsOfSpeech.join("|");
								
								fn.callFunction("alter_analyzed_wordform", 
										[fn.quote(sListOfTokens), 
										 fn.quote(slistOfPos), 
										 fn.quote(sAwfId),
										 fn.quote(sAttestationId)], 
										null, null, null, null, 
										function(){fn.refreshTable(confTable);});
								});
							}
						
						
					});
					
					
				}
			}
		}
};


// EXTRA FUNCTIONS



// put the partforms and their pos in the token attestations view	
function putPartformsAndPos(confTable){
	
	fn.showProcessingMsg(confTable); 
	
	var aAllRows = fn.getAllRows(confTable);
	
	aAllRows.each(function(){
		
		var awfId = fn.getDataFromCellNamed(confTable, this, "analyzed_wordform_id");
				
		fn.callFunction("get_parts_and_pos", [fn.quote(awfId)], 
				confTable, this, "form_pos");		
	});
	
	fn.removeProcessingMsg(confTable);
	
};




function putPartsAndTokensEquality(confTable){
	
	fn.showProcessingMsg(confTable);
	
	var aAllRows = fn.getAllRows(confTable);
	
	aAllRows.each(function(){
		
		var nCurrentNode = this;
		var iTokenIndexesId = fn.getDataFromCellNamed(confTable, nCurrentNode, "token_indexes_id");
				
		fn.callFunction("get_parts_and_tokens_equality", [fn.quote(iTokenIndexesId)], 
				confTable, nCurrentNode, "equality", null, function(){			
			
			var eCellElement = fn.getCellElement(confTable, nCurrentNode, "equality");
			var sColor = (fn.getFunctionOutput() == 't' ? "green":"red");
			eCellElement.css("background", sColor);
		});
		
	});
	
	fn.removeProcessingMsg(confTable);
	
};

function highlightAllQuotes(confTable){
	
	fn.showProcessingMsg(confTable); 
	
	// collect all needed token_indexes_id's of all rows into an array
	var aAllRowIds = fn.getDataFromColumn(confTable, "token_indexes_id");	
	
	if (aAllRowIds.length>0)
		{
		// call function to get all token positions for the collected token_indexes_id's
		fn.callFunction("get_group_of_token_positions", [ fn.quote(aAllRowIds.join("|")) ], 
				confTable, null, "positions", null, 
				// when the token positions are returned by the function, highlight the quote in each row
				function(){
					var allRows = fn.getAllRows(confTable);
					allRows.each(function(){
						putHighlightOnOneRow(confTable, this);
					});						
				}
			);
		}
	
	fn.removeProcessingMsg(confTable);
	
};


function putHighlightOnOneRow(confTable, confNode) {
	
	var sQuote = fn.getDataFromCellInRowNode(confTable, confNode, "quote");
	
	sQuote = fn.removeHighlight(sQuote);
	
	// get the position pairs (x,y|x,y|...)
	var sAllPositionPairs = fn.getDataFromCellInRowNode(confTable, confNode, "positions");
	
	if (sAllPositionPairs != "-")
		{
		// remove the brackets
		sAllPositionPairs = sAllPositionPairs.replace(/(\()(.+)(\))/i ,"$2");
		
		// build array of position pairs
		var aAllPairs = sAllPositionPairs.split("\|");		
		
		var aNewPairsArray = new Array();
		for (var i=0; i<aAllPairs.length; i++)
			{			
			var onePair = aAllPairs[i].split(",");
			//if (onePair.length==1) continue;
			
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






