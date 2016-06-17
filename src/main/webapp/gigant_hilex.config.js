// list of tables that must be hidden or visible (don't use both, it's a matter of what's the most convenient)
oHiddenTablesList = [];
oShowOnlyTables = ["analyzed_wordforms", "documents", "lemmata", "lemmata_and_paradigma", "multilemmata",
                   "multiple_lemmata_analyses", "multiple_lemmata_analyses_view", "multiple_lemmata_analysis_parts",
                   "token_attestations", "token_attestations_worktable", "wordforms", 
                   "modified_lemmata_view", "modified_paradigm_view", "mnw_fix_multiple_ws",
                   "fix_multiple_lemmata_analyses"];



// Array's to store the locked lemmata of the current view
// Those array's get updated at each table draw
var aCurrentLemmaViewLocks = 		new Array();
var aCurrentParadigmaViewLocks =	new Array();


// chose super lemma storage
var sChosenSuperLemId;

// create a unique multibuilder_id
// (needed so the table used for building multiple lemmata can't be used by more than one user at the time:
//  we create a unique table and remove it afterwards)
var sMultiBuilderId = Math.floor(1000000*Math.random());
var sMultiBuilderTable = 'temp_multilemmata_builder_'+sMultiBuilderId;

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



// Autocomplete configuration
// see: http://stackoverflow.com/questions/5077409/what-does-autocomplete-request-server-response-look-like
// http://stackoverflow.com/questions/18677536/jeditable-and-jquery-ui-autocomplete
var sAutoCompleteSelector = "#prompt_lemma1, #prompt_lemma2, #prompt_lemma3, #prompt_lemma4, #prompt_lemma5";

$(document).on(
   "focus", 
   sAutoCompleteSelector, 
   function(event) {
   	
   	$(event.target).autocomplete({
       	
   		delay: 750,
   		minLength: 2,
   		source: function(request, response){
	    	
	    	fn.callFunction("api.get_lemmata_from_prefix", ["'"+request.term+"'"], 
	    			function(func_resp){  
	    		
	    		var aSuggestionsArr = 
	    			(func_resp["get_lemmata_from_prefix"]).split("|");
	    		
	    		response($.map(aSuggestionsArr, function (item) {
	                return {
	                    label: item,
	                    value: item
	                };
	            }));
	    	});
	    },
	    open: function( event, ui ) {
	    	$(this).autocomplete('widget').css('z-index', 100000);
	        return false;
	    }
	});
       
   }
);





// table general settings
oTableSettingsList = {
		
		
		multilemmata: {
			
			"button_0":{
				"name": "Verwijder multilemma",
				"click": function(t){
					
					if (fn.getNumberOfSelectedRowNodes(t) == 0)
						{
						fn.message("Let op", "Kies een multilemma om te verwijderen.");
						}
					else
						{
						fn.confirm("Zeker weten?", "Alle geselecteerde multilemmata zullen nu verwijderd worden," +
								"en ook de daaraan gekoppelde paradigmata", function(){							
							
							var oSelection = fx.getSelectedRowsFrom(t);
							
							oSelection.every(function(){	
								
								var oThisRow = this;
								var sMultiLemId = 	fx.getDataFromCellInRow(oThisRow, "multiple_lemmata_analysis_id");
								var bLastRow =		fx.isLastRowOf(oThisRow, oSelection);
																
								fn.callFunction("api.delete_multiple_lemma", [sMultiLemId], function(){								
									if (bLastRow) 
										fn.refreshTable(t);									
									});
							
								});							
							
							});
						
						
						
						}
					
					
				}
			}
			
		},

		
		
		fix_multiple_lemmata_analyses:{
			
			"callback": function(t){
				highlightMultiLemmataAnalyses(t);
			},
			
			"repeat_callback": true,
			
			"size": "80%",
			
			"column_order": ["multi_id",
			                  "multi_part_id", 
			                  "modern_lemma", 
			                  "full_analysis",
			                  "lemma_id", 
			                  "lemma_part", 
			                  "lemma_part_pos",
			                  "knop"]
		},
		
		modified_lemmata_view: {
			
			"button_0":{
				"name": "Lemma en paradigma herstellen",
				"click": function(t){
					
					fn.confirm("Zeker weten?", 
							"Weet u het zeker? Als de log groot is, kan deze operatie enige tijd kosten.", 
							function(){
						
						var oRowSelection = fx.getSelectedRowsFrom(t);
						
						oRowSelection.every(function(){
							
							var oCurrentRow =	this;
							var sLemmaId = 		fx.getDataFromCellInRow(oCurrentRow, "lemma_id");
							
							fn.callFunction("api.restore_lemma_and_paradigm_and_ids", [sLemmaId],  
									function(){
								
										if (fx.isLastRowOf(oCurrentRow, oRowSelection))
											fn.refreshTable(t);
							});
						});
					});
				}
			}
		},
		
		modified_paradigm_view:{
			
			"button_0":{
				"name": "Woordvorm herstellen",
				"click": function(t){
					
					fn.confirm("Zeker weten?", "Weet u het zeker?", 
							function(){
						
						var oRowSelection =  fx.getSelectedRowsFrom(t);
						
						oRowSelection.every(function(){
							
							var oCurrentRow =	this;							
							var sAwfId =		fx.getDataFromCellInRow(oCurrentRow, "analyzed_wordform_id");
							fn.callFunction("api.restore_wordform", [sAwfId],  
									function(){
										if (fx.isLastRowOf(oCurrentRow, oRowSelection))
											fn.refreshTable(t);
							});
						});
					});
				}
			}
		},

		
		
		lemmata: {
			
			"keyup" : {
				
				"@": function(t){
					
					var oRow = fx.getFirstSelectedRowFrom(t);
					$(fx.getCellNode(oRow, "lemma_part_of_speech")).click();
				},
				
				"insert": function(t){
					
					var oRow = fx.getFirstSelectedRowFrom(t);					
					$(fx.getCellNode(oRow, "lemma_part_of_speech")).click();
				},
				
				"f9": function(t){
					
					var oRow = 			fx.getFirstSelectedRowFrom(t);					
					var sWdb = 			fx.getDataFromCellInRow(oRow, "wdb");
					var iPersistentId =	fx.getDataFromCellInRow(oRow, "persistent_id");
					
					window.open("http://gtb.inl.nl/iWDB/search?actie=article&wdb="+sWdb+"&id="+iPersistentId);
				},
				
				
				"uparrow": function(t){
					
					// small delay otherwise it won't work
					$("#"+t).delay(500).queue(function(){

						var oRow = 		fx.getFirstSelectedRowFrom(t);
						var sLemmaId =	fx.getDataFromCellInRow(oRow, "lemma_id");
						
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

						var oRow = 		fx.getFirstSelectedRowFrom(t);
						var sLemmaId =	fx.getDataFromCellInRow(oRow, "lemma_id");
						
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
						
						fn.setActiveTable("lemmata");
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
							
							var oSelectedRows = fx.getSelectedRowsFrom(t);
							
							oSelectedRows.every(function(){
								
								var sLemmaId = 		fx.getRowId(this);
								var sMultilemmaId =	null;
								var bLastRow = 		fx.isLastRowOf(this, oSelectedRows);
								
								if ($.inArray( comma(sLemmaId, sMultilemmaId), aCurrentLemmaViewLocks ) >-1)
									{
									fn.callFunction(
											"api.unlock_lemma", 
											[deEmpty(sLemmaId), deEmpty(sMultilemmaId)], 
											function(){
												if(bLastRow) fn.refreshTable(t);
												}
										);
									}
								else
									{
									fn.callFunction(
											"api.lock_lemma", 
											[deEmpty(sLemmaId), deEmpty(sMultilemmaId)], 
											function(){
												if(bLastRow) fn.refreshTable(t);
											}
										);
									}
								
								});
							
							}
						});
					}
			
				
				// apply locks
				
				var aLemmaIdsArr =	new Array();
				var oRows = 		fx.getAllRows(t);
				
				oRows.every(function(i){
					
					var sLemmaId =		fx.getRowId(this);
					var sMultilemmaId =	null;
					
					aLemmaIdsArr.push( comma(sLemmaId, sMultilemmaId) );
				});
				
				// get the list of locked lemmata
				// and modify the rows accordingly
				fn.callFunction("api.get_locks_of_lemmata", [ fn.quote( aLemmaIdsArr.join("|") ) ], function(){
					
					aCurrentLemmaViewLocks = (fn.getFunctionOutput()[0]).split("|");
					
					oRows.every(function(i){
						
						var oThisRow = 		this;
						var sLemmaId = 		fx.getRowId(oThisRow);
						var sMultilemmaId =	null;
						
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
								var sCellType =	fx.getCellType(oThisRow, sCurrentColumnName);								
								var eCell =		fx.getCellNode(oThisRow, sCurrentColumnName);
								
								if (sCellType == 'text')
									{									
									$(eCell).editable('disable');
									$(eCell).css("opacity", "0.5");
									}
								else if (sCellType == 'checkbox')
									{
									$(eCell).find("input").attr("disabled", "disabled");
									$(eCell).css("opacity", "0.5");
									}
								else if (sCellType == 'selectbox')
									{
									$(eCell).editable('disable');
									$(eCell).css("opacity", "0.5");
									}
								}					
							
							}						
						
					});
					
				}); // end of function call
			},
			"repeat_callback": true,
			
			"button_0": {
				
				"name": "Multilemmata_builder",
				"bgcolor": "yellow",
				"textcolor": "green", 
				"click": function(t){
					
					// make sure that row selection is activated
					var bRowSelectionActivated = fn.rowsSelectionIsAllowed(t);
					if ( !bRowSelectionActivated)
						fn.clickOnButton(t, "selectionbutton");
					
					// open the multilemmata_builder view
					fn.closeTable("token_attestations_worktable", function(){
						
						fn.callFunction("api.create_multilemmata_builder", [fn.quote(sMultiBuilderTable)], function(){
							fn.callDatabase(sMultiBuilderTable, {}, function(){
								
								fn.callDatabase("lemmata", {}, function(){
									
									fn.alignTables(sMultiBuilderTable, "lemmata", function(){
										
										fn.clickOnButton("lemmata", "selectionbutton");
									});
								})
							});
							
						});
						
					});
					
					
				}
			},
			"button_1":{
				"name": "Verwijder lemma",
				"click": function(t){
					
					if (fn.getNumberOfSelectedRowNodes(t) == 0)
						{
						fn.message("Let op", "Kies een lemma om te verwijderen.");
						}
					else
						{
						fn.confirm("Zeker weten?", "Alle geselecteerde lemmata zullen nu verwijderd worden," +
								"en ook de daaraan gekoppelde paradigmata", function(){							
							
							var oSelection = fx.getSelectedRowsFrom(t);
							
							oSelection.every(function(){	
								
								var sLemId = 	fx.getDataFromCellInRow(this, "lemma_id");
								var bLastRow =	fx.isLastRowOf(this, oSelection);
								
								fn.callFunction("api.delete_lemma", [sLemId], function(){									
									if (bLastRow) 
										fn.refreshTable(t);									
									});
							
								});							
							
							});
						
						
						
						}
					
					
				}
			}
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
					
					if (	fx.getNumberOfSelectedRows("lemmata_and_paradigma") == 1
							&&
							fx.getNumberOfSelectedRows(t) == 1 )
						{
						
						var oSelectedLemma =	fx.getFirstSelectedRowFrom("lemmata_and_paradigma");
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
												{"attestation_ids": aAttestationIdsToProcess[i]}, 
												{"lemma_id": sLemId, "multiple_lemmata_analysis_id": sMultiLemId}, 
												 
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
					else if (	fx.getNumberOfSelectedRows("multilemmata") == 1
							&&
							fx.getNumberOfSelectedRows(t) == 1 )
						{
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
												{"attestation_ids": aAttestationIdsToProcess[i]}, 
												{"lemma_id": sLemId, "multiple_lemmata_analysis_id": sMultiLemId}, 
												 
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
					else
						{
						fn.message("Let op", "U moet wel een attestatie én een lemma kiezen!");
						}
				}
				
			},
			
			
			"button_1":{
				
				"name": "Schoonvegen",
				"tooltip": "Verwijder alle attestaties uit de citaat",
				"click": function(t){
					
					fn.confirm("Citaat schoonvegen", "Weet u het zeker?", function(){
						
						var oRow = fx.getFirstSelectedRowFrom(t);
						
						// remove indexes
						fx.updateDatabaseGivenACellOrRow(oRow, 
								{ "onsetoffset": "none" }, 
								function(){
									fn.refreshTable(t);
								});
						
					});					
				}
				
			},
			
			"button_2":{
				
				"name": "Verwijder selectie",
				"click": function(t){
					
					var oSelection = fx.getSelectedRowsFrom(t);
					
					if (oSelection.count()==0)
						{
						fn.message("Let op", "U moet attestaties selecteren!");
						}
					else
						{
						oSelection.every(function(){
							
							var oRow = this;
							var bLastOne = fx.isLastRowOf(oRow, oSelection);
							
							fx.removeFromDatabaseGivenARow(oRow, function(){
								
								if (bLastOne)
									{
									fn.refreshTable(t);
									fn.refreshTable("lemmata_and_paradigma");
									}
								
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
						
						fn.showProcessingMsg(t);
						
						var oRows = fx.getSelectedRowsFrom(t);
						
						oRows.every(function(){
							
							var oCurrentRow = this;
							
							// This function doesn't try to assign a new lemma_id
							// to prevent conflicting ids, as we assume that ids of newly
							// added lemmata come on top of the existing id-values.
							// So when some lemma is removed, its id won't be re-used
							// so it is safe to reload the old lemma with its original id.
							
							var sLemId = fx.getDataFromCellInRow(oCurrentRow, "lemma_id");
							
							fn.callFunction("api.restore_lemma", [sLemId], function(){
								
								if (fx.isLastRowOf(oCurrentRow, oRows))
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
						
						var oRows = fx.getSelectedRowsFrom(t);
						oRows.every(function(){
							var oRow = this;
							
							// This function doesn't try to assign a new analyzed_wordform_id
							// to prevent conflicting ids, as we assume that ids of newly
							// added analyzed_wordforms come on top of the existing id-values.
							// So when some analyzed_wordform is removed, its id won't be re-used
							// so it is safe to reload the old analyzed_wordform with its original id.
							
							var sAwfId = fx.getDataFromCellInRow(oRow, "analyzed_wordform_id");
							fn.callFunction("api.restore_paradigm", [sAwfId], function(){
								
								if (fx.isLastRowOf(oRow, oRows))
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
			
			"columns_order": [
			                  	"super_lem_id",
								"superlem",
								"wdb",
								"lemma_id",
								"multiple_lemmata_analysis_id",
								"persistent_id",
								"modern_lemma",
								"full_analysis",
								"lemma_part_of_speech",
								"group_id",
								"analyzed_wordform_id",
								"wordform_id",
								"wordform",
								"part_of_speech",
								"unique_id",
								"opmerking",
								"online"
								],
			
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
							
							var oSelectedRows = fx.getSelectedRowsFrom(t);
							
							oSelectedRows.every(function(){
								
								var sLemmaId = 		fx.getDataFromCellInRow(this, "lemma_id");
								var sMultilemmaId =	fx.getDataFromCellInRow(this, "multiple_lemmata_analysis_id");
								var bLastRow = 		fx.isLastRowOf(this, oSelectedRows);
								
								if ($.inArray( comma(sLemmaId, sMultilemmaId), aCurrentParadigmaViewLocks ) >-1)
									{
									fn.callFunction("api.unlock_lemma", 
											[deEmpty(sLemmaId), deEmpty(sMultilemmaId)], 
											function(){
												if(bLastRow) fn.refreshTable(t);
											}
										);
									}
								else
									{
									fn.callFunction("api.lock_lemma", 
											[deEmpty(sLemmaId), deEmpty(sMultilemmaId)], 
											function(){
												if(bLastRow) fn.refreshTable(t);
											}
										);
									}
								
								});
							
							}
						});
					}
				
				
				// apply locks
				
				var aLemmaIdsArr =	new Array();
				var oRows =			fx.getAllRows(t);
				
				oRows.every(function(){				
					
					var sLemmaId = 		fx.getDataFromCellInRow(this, "lemma_id");
					var sMultiLemmaId =	fx.getDataFromCellInRow(this, "multiple_lemmata_analysis_id");
					
					aLemmaIdsArr.push( comma(sLemmaId, sMultiLemmaId) );
				});
				
				// get the list of locked lemmata
				// and modify the rows accordingly
				fn.callFunction("api.get_locks_of_lemmata", [ fn.quote(aLemmaIdsArr.join("|")) ], function(){
					
					aCurrentParadigmaViewLocks = (fn.getFunctionOutput()[0]).split("|");
					
					oRows.every(function(i){
						
						var oRow = 		this;
						var sLemmaId = 		fx.getDataFromCellInRow(oRow, "lemma_id");
						var sMultiLemmaId =	fx.getDataFromCellInRow(oRow, "multiple_lemmata_analysis_id");
						
						
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
								var sCellType =	fx.getCellType(oRow, sCurrentColumnName);								
								var eCell =		fx.getCellNode(oRow, sCurrentColumnName);
								
								if (sCellType == 'text')
									{									
									$(eCell).editable('disable');
									$(eCell).css("opacity", "0.5");
									}
								else if (sCellType == 'checkbox')
									{
									$(eCell).find("input").attr("disabled", "disabled");
									$(eCell).css("opacity", "0.5");
									}
								else if (sCellType == 'selectbox')
									{
									$(eCell).editable('disable');
									$(eCell).css("opacity", "0.5");
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
					
					// default persistent id is: GH + date + dot + random number in range [0-999]
					// (eg. GH20160401144225.432)
					var sDefaultPersistentId = 
						"GH"+ fn.getCurrentTimestamp("YYYYMMDD.HHMISS") + 
						"." + Math.floor(Math.random() * 1000);
					
					fn.prompt("Nieuw lemma", 
							["modern_lemma", "part_of_speech", "persistent_id"], 
							["", "", sDefaultPersistentId], function(){
						
								var sLemma =		fn.quote( fn.getPromptBoxInput("modern_lemma") );
								var sPos =			fn.quote( fn.getPromptBoxInput("part_of_speech") );
								var sPersistentId =	fn.quote( fn.getPromptBoxInput("persistent_id") );
						
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
						
						var oRows = fx.getSelectedRowsFrom(t);
						
						oRows.every(function(){
							
							var oRow = this;							
							var bLastRow = fx.isLastRowOf(oRow, oRows);
							
							fx.removeFromDatabaseGivenARow(oRow, function(){	
								if (bLastRow) 
									fn.refreshTable(t);
							});
							
							
						});	// end of loop
						
					});	// end of confirm					
					
				}
			}, // end of button 1
			
			"button_2": {
				
				"name": "Maak superlem aan",
				"tooltip": "Ken dit lemma een nieuw super_lemma_id toe.",
				"bgcolor": "green",
				"click": function(t){
						
					var oRow = fx.getFirstSelectedRowFrom(t);
					
					if ( oRow.count()!=1 )
						{
						fn.message("Let op!", "Kies één lemma!" +
								"Dan pas kan daar een nieuw superlemma aan toegekend worden");
						}
					else
						{
						var sLemmaId = fx.getDataFromCellInRow(oRow, "lemma_id");
						var sModlem = fx.getDataFromCellInRow(oRow, "modern_lemma");
						
						fn.confirm("Maak superlemma aan", "Er zal een nieuw super_lemma_id worden aangemaakt, " +
								"en daar zal aan het lemma '"+sModlem+"' onder komen te hangen. " +
								"Weet u zeker dat u dat wilt?", function(){
							
							fn.callFunction("api.create_new_super_lem", [sLemmaId], function(){
								
								var oRows = fx.getAllRowsWhere(t, {"lemma_id": sLemmaId});
								
								oRows.every(function(){
									fx.callRecord(this, ["superlem", "super_lem_id"]);									
									});
								
								});
							
						});
						
						
						}
						
					
				}				
				
			},
			"button_3": {
				
				"name": "Gekozen superlem:",
				"bgcolor":"yellow",
				"textcolor": "red",
				"click": function(t){
					
					var oRow = fx.getFirstSelectedRowFrom(t);
										
					if ( oRow.any() )
						{
						// remember chosen superlemma, and show it on the screen
						var sSuperLemId = fx.getDataFromCellInRow(oRow, "super_lem_id");
						var sSuperLemma = fx.getDataFromCellInRow(oRow, "superlem");
						
						fn.setCustomButtonName(t, 3, "Gekozen superlem:<b>"+sSuperLemma+"</b>");
						sChosenSuperLemId = sSuperLemId;
						}
					
					// press shift + click to cancel parent selection 
					if (kf._getPressedKey() == 'shift')
					{
						fn.setCustomButtonName(t, 3, "Gekozen superlem:");
						sChosenSuperLemId = null;
					}
				}
			},
			"button_4":{
				"name": "Link lem & superlem",
				"bgcolor":"red",
				"textcolor": "yellow",
				"click": function(t){
					
					fn.confirm("Zeker weten?", "Weet u het zeker?", function(){
						
						if (sChosenSuperLemId != null)
						{
						var oRows = fx.getSelectedRowsFrom(t);
						if (oRows.any())
							{
							
							oRows.every(function(){
								
								var sLemId = 	fx.getDataFromCellInRow(this, "lemma_id");
								var bLastNode =	fx.isLastRowOf(this, oRows);
								
								fn.updateDatabaseGivenFieldValues("lemmata", 
										{"lemma_id": sLemId}, 
										{"super_lem_id": sChosenSuperLemId}, 
										
										function(){
											
											if (bLastNode)
												{												
												fn.refreshTable(t);
												}
										});
								});			
							
							}
						else
							{
							fn.message("Let op", "Kies een of meerdere lemmata!");							
							}
						
						
						}
					else
						{
						fn.message("Let op", "Kies eerst een superlemma!");
						}
						
					});					
					
				}
			},
			"button_5": {
				
				"name": "Multilemmata_builder",
				"bgcolor": "yellow",
				"textcolor": "green", 
				"click": function(t){
					
					fn.callFunction("api.create_multilemmata_builder", [fn.quote(sMultiBuilderTable)], function(){
						fn.callDatabase(sMultiBuilderTable, {}, function(){
							
							fn.callDatabase("lemmata", {}, function(){
								
								fn.alignTables(sMultiBuilderTable, "lemmata", function(){
									
									fn.clickOnButton("lemmata", "selectionbutton");
								});
							})
						});
					});					
					
				}
			}
			
		}
		
};


// configuration at column level
oTableConfigurationList = {
		
		
		fix_multiple_lemmata_analyses:{
			
			"multi_id":{
				"colsort": "asc"
			},
			"lemma_id": {
				"bgcolor": "#CEE3F6",
				"click": function(t, n){
					
					var nCell = 	fx.getCell(n);					
					var sLemmaId =	fx.getDataFromCell(nCell);
					
					fn.callDatabase("lemmata", {"lemma_id": sLemmaId});
				}
			},
			"knop": {
				"button": "Bijwerken",
				"click": function(t, n){
					
					var oCell = 	fx.getCell(n);					
					var sLemmaId =	fx.getDataFromSiblingCell(oCell, "lemma_id");
					
					fn.callFunction("api.propagate_lemma_modif", [sLemmaId], function(){
						fn.refreshTable(t);
					});
				}
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
		
		lemmata: {
			
			"modern_lemma": {
				"colsort": "asc",
				"editable": true,
				"editcallback": function(t, n, value){
					
					fn.refreshTable(t, function(){
						
						// small delay otherwise it won't work
						$("#"+fn.getTableName(t)).delay(500).queue(function(){

							var oRow = 		fx.getFirstSelectedRowFrom(t);							
							var sLemmaId =	fx.getDataFromCellInRow(oRow, "lemma_id");
							
							if ( !isNaN(sLemmaId) )
								{
								fn.callDatabase("token_attestations_worktable", {"lemma_id": sLemmaId});
								
								if (fn.tableExists("fix_multiple_lemmata_analyses"))
									fn.refreshTable("fix_multiple_lemmata_analyses");
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

							var oRow = 		fx.getFirstSelectedRowFrom(t);
							var sLemmaId =	fx.getDataFromCellInRow(oRow, "lemma_id");
							
							if ( !isNaN(sLemmaId) )
								{
								fn.callDatabase("token_attestations_worktable", {"lemma_id": sLemmaId});
								
								if (fn.tableExists("fix_multiple_lemmata_analyses"))
									fn.refreshTable("fix_multiple_lemmata_analyses");
								}						

							$(this).dequeue();
						});
					});
				}
			},
			"persistent_id": {
				"click": function(t, n){
					
					var oCell = 		fx.getCell(n);
					var sWdb = 			fx.getDataFromSiblingCell(oCell, "wdb");
					var iPersistentId =	fx.getDataFromCell(oCell);
					
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
				"click": function(t, n){
					
					var oCell = 		fx.getCell(n);
					var sWdb = 			fx.getDataFromSiblingCell(oCell, "wdb");
					var iPersistentId =	fx.getDataFromCell(oCell);
					
					window.open("http://gtb.inl.nl/iWDB/search?actie=article&wdb="+sWdb+"&id="+iPersistentId);
					
				}
			},
			
			"multiple_lemmata_analysis_id": {				
				"cell_tooltip": "Toon details",
				"click": function(t, n){
					
					var oCell = 	fx.getCell(n);
					var iMlaId =	fx.getDataFromCell(oCell);
					
					fn.callDatabase("multiple_lemmata_analyses_view", {"multiple_lemmata_analysis_id": iMlaId});
					
				}
			},
			
			"analyzed_wordform_id": {
				"bgcolor": "#F8E0E6",
				"cell_tooltip": "Toon citaten",
				"click": function(t, n){
					
					var oCell = 	fx.getCell(n);
					var iAwfId = 	fx.getDataFromCell(oCell);
					var iLemmaId =	fx.getDataFromSiblingCell(oCell, "lemma_id");
					
					fn.callDatabase("token_attestations_worktable", 
							{"analyzed_wordform_ids_arr": "{"+iAwfId+"}", "lemma_id": iLemmaId});
				}
			},
			"group_id": {
				"colsort": "asc", // sort #4
				"cell_tooltip": "Totaal citaten bijbehorend bij groep",
				"click": function(t, n){
					
					var oCell =		fx.getCell(n);
					var iGroupId =	fx.getDataFromCell(oCell);
					var iLemmaId =	fx.getDataFromSiblingCell(oCell, "lemma_id");
					
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
					
					var oCell =			fx.getCell(n);
					var iDocumentId =	fx.getDataFromCell(oCell);
					
					fn.callDatabase("documents", {"document_id": iDocumentId}, null, {"viewtype": "form"});
				}
			}
		},
		
		token_attestations_worktable: {
			
			"lemma_id": {
				"click": function(t, n){
					var sLemmaId = fn.getDataFromCellNode(n);
					fn.callDatabase("lemmata_and_paradigma", {"lemma_id": sLemmaId});
				}
			},
			
			"multiple_lemmata_analysis_id": {
				"click": function(t, n){
					var sMultilemId = fn.getDataFromCellNode(n);
					fn.callDatabase("lemmata_and_paradigma", {"multiple_lemmata_analysis_id": sMultilemId});
				}
			},
			
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
				"click": function(t, n){
					
					var oCell =			fx.getCell(n);
					var iDocumentId =	fx.getDataFromCell(oCell);
					
					fn.callDatabase("documents", {"document_id": iDocumentId}, null, {"viewtype": "form"});
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
							
							var oRow = fx.getRow(n);
							
							fx.putDataIntoCell(oRow, "wordform", sNewWordform);
							fx.putDataIntoCell(oRow, "onsetoffset", sNewIndexes);
							
							fx.updateDatabaseGivenACellOrRow(oRow, 
									{"wordform": sNewWordform, "onsetoffset": sNewIndexes}, 
									function(){
								
								// the function call will cause a trigger to be activated
								// so the following steps will happen:
								
								// [2] analyzed_wordforms for those words will be looked up
								//     (or will be created if they don't exist yet) and
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
					var oCell = 		fx.getCell(n);
					var oSelectedText =	fx.getSelectedTextInCell(oCell);
					
					
					// if selection is empty, that means that we've clicked on a word
					// without selecting it manually.
					// In this case, try to select the word that was clicked upon
					if (oSelectedText.text == '' && oSelectedText.reliable)
						{						
						oSelectedText = fx.getWordClickedUponInCell(oCell);						
						}
					
					// if we have a selection now, process it
					if (oSelectedText.text!='' && oSelectedText.reliable)
						{
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
						if (sTokenIndexesIds == '') 
							sTokenIndexesIds = "none";
						
						fn.showProcessingMsg(t);
						
						fx.updateDatabaseGivenACellOrRow(
								oCell, 
								{"onsetoffset": sTokenIndexesIds}, 
								function(){
									fn.showProcessingMsg(t);
									
									var oRow = fx.getRowFromCell(oCell);
									fx.callRecord(oRow, ["quote", "onsetoffset"], function(){
										putHighlightOnOneRow(oRow);
										fn.removeProcessingMsg(t);
									});
									
								});
						
						
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
	
	var oCell = 		fx.getCell(n);
	var aIndexesArray =	( fx.getDataFromSiblingCell(oCell, "onsetoffset") ).split("\|");
	var sQuote = 		fn.removeHighlight(fx.getDataFromSiblingCell(oCell, "quote"));
	
	// Now, gather the string parts from the quote
	// corresponding to the indexes (start - end) of the words the user clicked on.
	// Put these parts into a two-dimensional array [i -> [sWordform, sIndexes] ]
	
	for (var i=0; i<aIndexesArray.length; i++)
		{
		var sIndexes = 		aIndexesArray[i];
		var iStartIndex =	sIndexes.split(",")[0];
		var iEndIndex   =	sIndexes.split(",")[1];
		var sWordform = 	(sQuote.substring(iStartIndex, iEndIndex)).toLowerCase();
		
		aWordAndIndexesArray.push( [sWordform, sIndexes] );
		}
	
	// As words and their indexes are now grouped as single objects
	// We can easily sort the words by their index
	
	aWordAndIndexesArray.sort( function(a, b){
		if (a[1] > b[1]) return 1;
		if (a[1] < b[1]) return -1;
		return 0;
	});
	var aWordArray = 	new Array();
	var aIndexesArray =	new Array();
	
	// now put wordforms and indexes back into separate arrays
	
	for (var i=0; i<aWordAndIndexesArray.length; i++)
	{
		aWordArray[i] = 	aWordAndIndexesArray[i][0];
		aIndexesArray[i] =	aWordAndIndexesArray[i][1];
	}
	var sNewWordform = 	aWordArray.join(",");
	var sNewIndexes =	aIndexesArray.join("|");
	
	// return result
	return [sNewWordform, sNewIndexes];
}



function getArgumentsForFindingOrCreatingAnalyzedWordform(t, n){
	
	var oCell = 	fx.getCell(n);
	var iLemmaId =	fx.getDataFromSiblingCell(oCell, "lemma_id");
	iLemmaId = 		(iLemmaId == '') ? "NULL" : iLemmaId;
	
	var iMultiLemAnalysisId =	fx.getDataFromSiblingCell(oCell, "multiple_lemmata_analysis_id");
	iMultiLemAnalysisId = 		(iMultiLemAnalysisId == '') ? "NULL" : iMultiLemAnalysisId;
	
	var sNewWordform =	fx.getDataFromSiblingCell(oCell, "wordform");
	var sNewIndexes = 	fx.getDataFromSiblingCell(oCell, "onsetoffset");
	
	return [iLemmaId, 
			 iMultiLemAnalysisId, 
			 fn.quote(sNewWordform),
			 fn.quote(sNewIndexes)];
}





// needed functions for highlight
// (2 versions available)

// [1] highlight in 'token_attestations' table

function _highlightAllQuotes(t){
	
	fn.showProcessingMsg(t); 
	
	var aAllRowIds = fx.getAllRows(t);	
	
	aAllRowIds.every(function(){		
		_putHighlightOnOneRow(this);		
	});
	
	fn.removeProcessingMsg(t);
	
};


function _putHighlightOnOneRow(oRow) {
	
	var sQuote =		fx.getDataFromCellInRow(oRow, "quote");
	var iStartIndex = 	fx.getDataFromCellInRow(oRow, "start_pos");
	var iEndIndex   = 	fx.getDataFromCellInRow(oRow, "end_pos");
	
	var aNewPairsArray = new Array();
	aNewPairsArray.push( [iStartIndex, iEndIndex] );
	
	// call the highlight function with the whole array of position pairs
	if (aNewPairsArray.length>0)
		sQuote = fn.getHighlight(sQuote, aNewPairsArray, "yellow");
		
	// put the string back into the table
	fx.putDataIntoCell(oRow, "quote", sQuote);
};


// [2] highlight in 'token_attestations_worktable' table

function highlightAllQuotes(t){
	
	fn.showProcessingMsg(t); 
	
	var aAllRowIds = fx.getAllRows(t);
	
	aAllRowIds.every(function(){		
		putHighlightOnOneRow(this);		
	});
	
	fn.removeProcessingMsg(t);
	
};


function putHighlightOnOneRow(oRow) {
	
	var sQuote =	fx.getDataFromCellInRow(oRow, "quote");
	sQuote = 		fn.removeHighlight(sQuote);
	
	// get the position pairs (x,y|x,y|...)
	var sAllPositionPairs = fx.getDataFromCellInRow(oRow, "onsetoffset");
	
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
				aNewPairsArray.push( [iStartIndex, iEndIndex] );
			}
		
		// call the highlight function with the whole array of position pairs
		if (aNewPairsArray.length>0)
			sQuote = fn.getHighlight(sQuote, aNewPairsArray, "yellow");
		}
		
	// put the string back into the table
	fx.putDataIntoCell(oRow, "quote", sQuote);
};


function highlightGroups(t){
	
	var oRows =		fx.getAllRows(t);
	var hGroup = 	new Array();
	
	oRows.every(function(){
		
		var oRow = 		this;
		var iGroupId =	fx.getDataFromCellInRow(oRow, "group_id");
		
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
	var sColor =	new Array();
	sColor[1] = 	"#8181F7";
	sColor[2] = 	"#688A08";
	iColor = 		1;
	
	oRows.every(function(){
		
		var nNode = 	fx.getNode(this);		
		var iGroupId =	fx.getDataFromCellInRow(this, "group_id");
		
		// put a line after the last row of a group
		// to show where the group ends
		if (iGroupId != iLastGroupId && 
				iGroupIdRowAbove == iLastGroupId)
			{
			$(fn.getCellInRowNode(nLastGroupNode, "group_id")).css("border-bottom", "solid 1px black");
			$(fn.getCellInRowNode(nLastGroupNode, "analyzed_wordform_id")).css("border-bottom", "solid 1px black");
			$(fn.getCellInRowNode(nLastGroupNode, "wordform_id")).css("border-bottom", "solid 1px black");
			$(fn.getCellInRowNode(nLastGroupNode, "wordform")).css("border-bottom", "solid 1px black");
			$(fn.getCellInRowNode(nLastGroupNode, "part_of_speech")).css("border-bottom", "solid 1px black");
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
					
					$(fn.getCellInRowNode(nNode, "group_id")).css("border-top", "solid 1px black");
					$(fn.getCellInRowNode(nNode, "analyzed_wordform_id")).css("border-top", "solid 1px black");
					$(fn.getCellInRowNode(nNode, "wordform_id")).css("border-top", "solid 1px black");
					$(fn.getCellInRowNode(nNode, "wordform")).css("border-top", "solid 1px black");
					$(fn.getCellInRowNode(nNode, "part_of_speech")).css("border-top", "solid 1px black");					
					}			
				}
	
			
			// give the row a color, as the current row is part of a group
			$(fn.getCellInRowNode(nNode, "group_id")).css("color", sColor[iColor]);
			$(fn.getCellInRowNode(nNode, "analyzed_wordform_id")).css("color", sColor[iColor]);
			$(fn.getCellInRowNode(nNode, "wordform_id")).css("color", sColor[iColor]);
			$(fn.getCellInRowNode(nNode, "wordform")).css("color", sColor[iColor]);
			$(fn.getCellInRowNode(nNode, "part_of_speech")).css("color", sColor[iColor]);
			
			nLastGroupNode = nNode;
			iLastGroupId = iGroupId;
			}	
		
		iGroupIdRowAbove = iGroupId;
	});
	
};

function highlightMultiLemmataAnalyses(t){
	
	var oRows = 	fx.getAllRows(t);	
	var hGroup =	new Array();
	
	oRows.every(function(){
		
		var oRow = this;		
		var iMultiLemAnalysisId = fx.getDataFromCellInRow(oRow, "multi_id");
		
		if (iMultiLemAnalysisId != '')
			{
			if (typeof hGroup[iMultiLemAnalysisId] == 'undefined')
				hGroup[iMultiLemAnalysisId] = 0;
			hGroup[iMultiLemAnalysisId] = hGroup[iMultiLemAnalysisId] + 1;			
			}
	});
	
	var iLastMultiLemAnalysisId;
	var nLastMultiLemAnalysis;
	var iMultiLemAnalysisIdRowAbove = -1;
	var sColor =	new Array();
	sColor[1] = 	"#0B0B3B";
	sColor[2] = 	"#0B610B";
	iColor = 		1;
	
	oRows.every(function(){
		
		var nRow = 					fx.getNode(this);		
		var iMultiLemAnalysisId =	fx.getDataFromCellInRow(this, "multi_id");
		
		// put a line after the last row of a group
		// to show where the group ends
		if (iMultiLemAnalysisId != iLastMultiLemAnalysisId && 
				iMultiLemAnalysisIdRowAbove == iLastMultiLemAnalysisId)
			{
			$(fn.getCellInRowNode(nLastMultiLemAnalysis, "modern_lemma")).css("border-bottom", "solid 1px black");
			$(fn.getCellInRowNode(nLastMultiLemAnalysis, "full_analysis")).css("border-bottom", "solid 1px black");
			$(fn.getCellInRowNode(nLastMultiLemAnalysis, "lemma_id")).css("border-bottom", "solid 1px black");
			$(fn.getCellInRowNode(nLastMultiLemAnalysis, "lemma_part")).css("border-bottom", "solid 1px black");
			$(fn.getCellInRowNode(nLastMultiLemAnalysis, "lemma_part_pos")).css("border-bottom", "solid 1px black");			
			}
		
		if (hGroup[iMultiLemAnalysisId]>0) // more than 0 is a group!
			{
			// is this the first row of a new group?
			// if so, choose a new color			
			if (iMultiLemAnalysisId != iLastMultiLemAnalysisId)
				{
				iColor = 1 + (iColor!=2);
				// also put a line before the group, to show where the group starts
				// but don't do that if we just added a line in the previous row 
				// as this would give a thick line as a result
				if ( !(iMultiLemAnalysisId != iLastMultiLemAnalysisId && 
						iMultiLemAnalysisIdRowAbove == iLastMultiLemAnalysisId))
					{
					$(fn.getCellInRowNode(nRow, "modern_lemma")).css("border-top", "solid 1px black");
					$(fn.getCellInRowNode(nRow, "full_analysis")).css("border-top", "solid 1px black");
					$(fn.getCellInRowNode(nRow, "lemma_id")).css("border-top", "solid 1px black");
					$(fn.getCellInRowNode(nRow, "lemma_part")).css("border-top", "solid 1px black");
					$(fn.getCellInRowNode(nRow, "lemma_part_pos")).css("border-top", "solid 1px black");				
					}			
				}
	
			
			// give the row a color, as the current row is part of a group
			$(fn.getCellInRowNode(nRow, "modern_lemma")).css("color", sColor[iColor]);
			$(fn.getCellInRowNode(nRow, "full_analysis")).css("color", sColor[iColor]);
			$(fn.getCellInRowNode(nRow, "lemma_id")).css("color", sColor[iColor]);
			$(fn.getCellInRowNode(nRow, "lemma_part")).css("color", sColor[iColor]);
			$(fn.getCellInRowNode(nRow, "lemma_part_pos")).css("color", sColor[iColor]);
			
			nLastMultiLemAnalysis = nRow;
			iLastMultiLemAnalysisId = iMultiLemAnalysisId;
			}	
		
		iMultiLemAnalysisIdRowAbove = iMultiLemAnalysisId;
	});
	
};



// build the unique multilemmata builder
// (as the table has a unique, random generated name/id, its configuration has to be linked
// to it dynamically after the multilemmata builder name creation.

setTimeout(function(){
	
	// register each table details
	asTableNames.push( sMultiBuilderTable );
	asTableDescriptions.push( '' );
	asTableComments.push( '' );
	asTableTypes.push( 'base table' );
	abTableVisible.push( false );
	
	mt.addAvailableTableDetails( sMultiBuilderTable, 
			[ '', 'base table', '' ]
	);
	
	
	oTableConfigurationList[sMultiBuilderTable] = {
		
		"part_number": {
			"colsort": "asc"
		}
	},
	
	oTableSettingsList[sMultiBuilderTable] = {
		
		"size": "60%",
		
		"header_height": "90px",
		
		"nice_name": 'Multilemmata Builder',
		
		"button_0": {
			"name": "Voeg lemma toe (uit tabel)",
			"tooltip": "Voeg een in de 'lemmata'-tabel gekozen lemma in deze tabel toe",
			"click": function(t){
				
				if ( !fn.tableExists("lemmata"))
					{
					fn.message("Let op!", "U moest een lemmata in de 'lemmata' tabel selecteren!")
					}
				else
					{
					var oLemRow = fx.getFirstSelectedRowFrom("lemmata");
					
					if ( oLemRow.any() )
						{
						var sLemId = 	fx.getDataFromCellInRow(oLemRow, "lemma_id");
						var sModLem =	fx.getDataFromCellInRow(oLemRow, "modern_lemma");
						var sPos = 		fx.getDataFromCellInRow(oLemRow, "lemma_part_of_speech");
						
						fn.insertIntoDatabase(t, 
							{
							"lemma_id": sLemId,
							"modern_lemma": sModLem,
							"lemma_part_of_speech": sPos
							}, 
							null, 
							function(){
								fn.refreshTable(t);
							});
						}
					else
						{
						fn.message("Let op", "Kies één lemma om toe te voegen!");
						}
					}
				
			}
		},
		"button_1":{
			"name": "Voeg lemma toe (autocomplete)",
			"tooltip": "Voeg lemmata in deze tabel toe d.m.v. een autocomplete",
			"click": function(t){
				
				fn.prompt("Tik lemmata in", 
						["lemma 1", "lemma 2", "lemma 3", "lemma 4", "lemma 5"], 
						null, 
						function(){
					
					
					var aInput = fn.getPromptBoxInput();
					
					var insertParts = function(i){
						
						// keep going if next part is not empty
						if (aInput[i]!="")
							{
							var sLemmaId =	(aInput[i]).replace(/.+, id:(\d+)\)$/, '$1');
							var sModlem =	(aInput[i]).replace(/^([^,]+), .+$/, '$1');
							var sPos = 		(aInput[i]).replace(/.+, (.+) \(.+$/, '$1');
							
							fn.insertIntoDatabase(t, 
								{
									"part_number": i+1,
									"lemma_id": sLemmaId,
									"modern_lemma": sModlem,
									"lemma_part_of_speech": sPos
								}, 
								null, 
								function(){
									insertParts(i+1);
								});								
							}
						// we are done
						else
							{
							fn.refreshTable(t);
							}
					};
					
					insertParts(0);
					
				});
			}
		},
		"button_2": {
			"name": "Schoonvegen",
			"bgcolor": "yellow",
			"textcolor": "green",
			"tooltip": "Maak de tabel leeg",
			"click": function(t){
				
				fn.callFunction("api.reset_multilemmata_builder", [ fn.quote(sMultiBuilderTable)], function(){
					fn.refreshTable(t);
				});
			}
		},
		"button_3": {
			
			"name": "Wijzig volgorde",
			"tooltip": "Pas de volgorde van de delen aan",
			"click": function(t){
				
				var aFieldNames = new Array();
				
				(fx.getAllRows(t)).every(function(){
					
					var sLemId =	fx.getDataFromCellInRow(this, "lemma_id");
					var sModlem =	fx.getDataFromCellInRow(this, "modern_lemma");
					var sLemPos =	fx.getDataFromCellInRow(this, "lemma_part_of_speech");
					aFieldNames.push(sLemId+" : "+sModlem+", "+sLemPos);
				});
				
				fn.promptReorder("Volgorde veranderen", aFieldNames, function(){
					
					// get the new order set by user
					var aNewOrder = fn.getPromptBoxOrder();
					
					// function for re-defining of the parts numbers
					// (each update is a callback of the previous run)
					var insertPart = function(i){
						
						var aPart = 	aFieldNames[i];
						var aPart1 = 	aPart.split(" : ");
						var sLemId = 	aPart1[0];
						
						// get the new index (it must be 1-based)
						var iIndexToAssign = fn.getNewPositionOfElementAt(i) + 1;
						
						fn.updateDatabaseGivenFieldValues(t, 
								{"lemma_id": sLemId}, 
								{"part_number": iIndexToAssign}, 
								 
								function(){
									
									// compute next part
									if (i+1<aNewOrder.length)
										insertPart(i+1);
									
									// if we're done, refresh the view
									else
										fn.refreshTable(t);
								});

					};

					// start inserting parts
					insertPart(0);
					
				});
				
			}
		},
		"button_4": {
			
			"name": "Bouw multi-lem",
			"bgcolor": "yellow",
			"textcolor": "red",
			"tooltip": "Bouw een multiple-lemma met de in deze tabel opgeslagen lemmata",
			"click": function(t){
				
				fn.confirm("Zeker weten?", "Zijn alle delen correct gekozen en in de goede volgorde?", function(){
					
					// make sure that row selection in lemmata table is deactivated
					var bRowSelectionActivated = fn.rowsSelectionIsAllowed(t);
					if ( bRowSelectionActivated)
						fn.clickOnButton(t, "selectionbutton");
					
					// we will close the current table, and if the lemmata_and_paradigma
					// is not yet loaded, we will put it at the same place. But if it is already
					// loaded, we won't move it. Save the right position settings now.
					var aPosition = fn.getTablePosition(t);
					if (fn.tableExists("lemmata_and_paradigma"))
						aPosition = fn.getTablePosition("lemmata_and_paradigma");
					
					// create the multiple lem and get its id
					fn.callFunction("api.create_multiple_lemmata", [fn.quote(sMultiBuilderTable)], function(response){
						
						var iMultiLemId = response["create_multiple_lemmata"];
						
						// close this table, and show the created multiple lemma
						fn.closeTable(t, function(){
							
							fn.callDatabase("lemmata_and_paradigma", 
									{"multiple_lemmata_analysis_id": iMultiLemId},
									null,
									aPosition);
						});
						
					});
					
				});
									
			}
		}
		
		
	}
	
}, 500);

