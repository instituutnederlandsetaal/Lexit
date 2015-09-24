// list of tables that must be hidden or visible (don't use both, it's a matter of what's the most convenient)
oHiddenTablesList = [];
oShowOnlyTables = (
					fn.getCurrentUser() == 'boukje' ||
					fn.getCurrentUser() == 'marjolijn' ||
					fn.getCurrentUser() == 'wil'
					) ?
		["lemmata_view", "modified_lemmata_view", "modified_paradigm_view", 
         "lemmata_en_paradigma_view", "nuancerende_opmerkingen"]
	:
		["lemmata", "lemmata_view", "modified_lemmata_view", "modified_paradigm_view", "lemmata_en_paradigma_view",
		 "surinaams_and_antilliaans_commissions_selections",
		 "export_versions", "nuancerende_opmerkingen", "pos_to_rank"];


fn.setProjectTitle("Gig-pro!!!!!!!!");


//remember chosen parent
var sChosenParentId = null;





//Autocomplete configuration
//see: http://stackoverflow.com/questions/5077409/what-does-autocomplete-request-server-response-look-like
// http://stackoverflow.com/questions/18677536/jeditable-and-jquery-ui-autocomplete
var sAutoCompleteSelector = "#lemmata_view .nuanc_opm";

$(document).on(
      "focus", 
      sAutoCompleteSelector, 
      function(event) {
      	
      	$(event.target).autocomplete({
          	
      		delay: 750,
              minLength: 2,
	        	source: function(request, response){
	            	
	            	fn.callFunction("api.get_nuance_opm", ["'"+request.term+"'"], 
	            			function(func_resp){  
	            		
	            		var aSuggestionsArr = 
	            			(func_resp["get_nuance_opm"]).split("|");
	            		
	            		response($.map(aSuggestionsArr, function (item) {
	                        return {
	                            label: item.split(":::")[0],
	                            value: item.split(":::")[1]
	                        };
	                    }));
	            	});
	            }
          });
          
      }
  );



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


// link with diminutives

var sVerkleinwoord = "";
var sPartLemma = "";
var sVerkleinwoordId = "";
var sPartLemmaId = "";
function getVerkleinwoord(){
	return "<b>Kies&nbsp;verkleinwoord</b>" +
	( sVerkleinwoord != "" ? 
			"<br>&nbsp;&nbsp;&nbsp;&nbsp;(<i>Gekozen:"+sVerkleinwoord+"/"+sVerkleinwoordId+"</i>)" : 
				"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+
				"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+
				"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;");
}
function  getPartLemma(){
	return "<b>Kies&nbsp;deeltje</b>" +
	( sPartLemma != "" ? 
			"<br>&nbsp;&nbsp;&nbsp;&nbsp;(<i>Gekozen:"+sPartLemma+"/"+sPartLemmaId+"</i>)" : 
				"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+
				"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+
				"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;");
}
function setContextMenuOptions(key, options){
	
	$("ul.context-menu-list li:eq(0)").html('<span>'+getVerkleinwoord()+'</span>');
	options.items[key].name = getVerkleinwoord();
	$("ul.context-menu-list li:eq(1)").html('<span>'+getPartLemma()+'</span>');
	options.items[key].name = getPartLemma();

}


// table general settings
oTableSettingsList = {
		
		nuancerende_opmerkingen:{
			
			"size": "80%",
							
			"button_0":{
				"name": "Voeg opmerking toe",
				"click": function(t){
					
					fn.prompt("Voer opmerking in", 
							["short_code", "nuancerende_opmerking"], 
							["", ""],
							function(){
								var sShortCode = fn.getPromptUserInput("short_code");
								var sNuanceOpm = fn.getPromptUserInput("nuancerende_opmerking");
								
								fn.insertIntoDatabase(t, 
										{
										"short_code": sShortCode,
										"nuancerende_opmerking": sNuanceOpm
										}, null, true);
							}, 
							true, 
							[35,3]);
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
		
		
		
		lemmata_en_paradigma_view:{
			
			"prereset_callback": function(t){
				
				fn.addFilters(t, {"gedrukt": "", "f_total_rel": ""});				
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
									fn.callFunction("api.unlock_lemma", [sLemmaId], function(){
											if(bLastRow) fn.refreshTable(t);
											}
										);
									}
								else
									{
									fn.callFunction("api.lock_lemma", [sLemmaId], function(){
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
				fn.callFunction("api.get_locks_of_lemmata", [ "'"+aLemmaIdsArr.join("|")+"'" ], function(){
					
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
										
										fn.callFunction("api.insert_wordform", 
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
						
						fn.callFunction("api.add_missing_comps_and_sups", [sAwfId], function(){
							fn.refreshTable(t);
							});
						}					
					
				}
			},
			
			"button_3":{
				
				"name": "VRB uitbr.",
				"click": function(t){
					
					var aRows = fn.getSelectedRowsFrom(t);
					
					var nNode = aRows[0];
					
					var pos = fn.getDataFromCellNamed(t,nNode, "wordform_gigpos");
					
					if ( !($.startsWith(pos, 'VRB')) )
						{
						fn.message("Let op!", "Let op: selecteer een werkwoord!");
						}
					else
						{
						var sAwfId = fn.getDataFromCellNamed(t, nNode, "analyzed_wordform_id");
						
						fn.callFunction("api.add_missing_verb_paradigm", [sAwfId], function(){
							fn.refreshTable(t);
							});	
						}
					
									
					
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
		

		lemmata_view: {
			
			"prereset_callback": function(confTable){
				
				//fn.addFilters(confTable, {"homo": ""});
				
				sChosenParentId = null;
				fn.setCustomButtonName(confTable, 2, "Gekozen ouder:");
				
				fn.addFilters(confTable, {"gedrukt": "", "tmp_f_total_rel": ""});
					
				
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
									fn.callFunction("api.unlock_lemma", [sLemmaId], function(){
											if(bLastRow) fn.refreshTable(t);
											}
										);
									}
								else
									{
									fn.callFunction("api.lock_lemma", [sLemmaId], function(){
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
				fn.callFunction("api.get_locks_of_lemmata", [ "'"+aLemmaIdsArr.join("|")+"'" ], function(){
					
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
						
						// check first if this lemma existed in the past and was removed
						
						fn.showProcessingMsg(confTable);
						
						fn.callFunction("api.find_removed_lemma", 
								[sLemma, sLemmaPos], 
								function(){
							
							fn.removeProcessingMsg(confTable);
							
							var aColumns = fn.getFunctionOutput();
							
							// If some identical lemma existed in the past,
							// give the user the possibility to restore it
							if (aColumns["lemma_id"] != '')
								{
								fn.confirm("Let op!", 
										"Op "+aColumns["modification_date"]+ " is het lemma "+
										aColumns["modern_lemma"]+"/"+aColumns["lemma_gigpos"]+ " " +
										(aColumns["gloss"]!='' ? "("+aColumns["gloss"]+") ":"") +
										"met ID "+aColumns["lemma_id"]+ " verwijderd. "+
										"<br><br>Wilt u dit lemma herstellen?", 
										function(){
									
											fn.showProcessingMsg(confTable);
									
											// user chosed to re-use the id
											fn.callFunction("api.restore_lemma_and_paradigm_and_ids", 
													[parseInt(aColumns["lemma_id"])], 
													function(){
														fn.refreshTable(confTable);
													});
											
										},
										function(){
											
											fn.showProcessingMsg(confTable);
											
											// user chosed to create a new lemma 
											fn.callFunction("api.insert_lemma", 
													[sLemma, sLemmaPos], 
													function(){
												fn.refreshTable(confTable);
											});
											
										});
								}
							
							// default behaviour: 
							// no such lemma was removed before: lemma must be new
							else
								{
								
								fn.showProcessingMsg(confTable);
								
								fn.callFunction("api.insert_lemma", 
										[sLemma, sLemmaPos], 
										function(){
									fn.refreshTable(confTable);
								});
							}
						});
						
						
					});
				}
			},
			"button_1":{
				"name": "Verwijder selectie",
				"click": function(confTable){
					
					fn.confirm("Let op", "Weet u het zeker?", function(){
						
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
						
					});
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
												fn.refreshTable(confTable);												
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
									{"parent_id": null}, 
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
		
			
			"contextmenu": {
				
                // here the structure of the contextmenu is given
                "items": {
                    "verkleinwoord": {"name": getVerkleinwoord()},
                    "partlemma": {"name": getPartLemma()},
                    "link": {"name": "<b>Maak link aan</b>"},
                    "unlink": {"name": "<b>Unlink</b>"}
                },
                // callback function called after the user has chosen an option in the context menu
                "callback": function(confTable, confNode, key, options) {
 
                    // key indicates the option the user has chosen
                    if (key == 'verkleinwoord')
                        {
                    	sVerkleinwoord = fn.getDataFromCellNamed(confTable, confNode, "modern_lemma");
                    	sVerkleinwoordId = fn.getDataFromCellNamed(confTable, confNode, "pkid");

                    	setContextMenuOptions(key, options);
                        }
                    else if (key == 'partlemma')
                        {                       
                    	sPartLemma  = fn.getDataFromCellNamed(confTable, confNode, "modern_lemma");
                    	sPartLemmaId = fn.getDataFromCellNamed(confTable, confNode, "pkid");
                    	
                    	setContextMenuOptions(key, options);
                        }
                    else if (key == 'link')
                    {
                    	if (sVerkleinwoordId == "" || sPartLemmaId == "")
                		{
                		fn.message("Let op", "Kies eerst een verkleinwoord én een deeltje");
			}
                	else
                		{
                		fn.callFunction("api.link_verkleinwoord", [sVerkleinwoordId, sPartLemmaId], function(){
                    		
                    		sVerkleinwoord = "";
                    		sPartLemma = "";
                    		sVerkleinwoordId = "";
                    		sPartLemmaId = "";
                    		
                    		setContextMenuOptions(key, options);
                    		
                    		fn.refreshTable(confTable);
                    		});
                		}
                    	
                    }
                    else if (key == 'unlink')
                    {
                    	if (sVerkleinwoordId == "")
                    		{
                    		fn.message("Let op", "Kies eerst een verkleinwoord");
                    		}
                    	else
                    		{
                    		fn.callFunction("api.unlink_verkleinwoord", [sVerkleinwoordId], function(){
                        		
                        		sVerkleinwoord = "";
                        		sPartLemma = "";
                        		sVerkleinwoordId = "";
                        		sPartLemmaId = "";
                        		
                        		setContextMenuOptions(key, options);
                        		
                        		fn.refreshTable(confTable);
                        		});
                    		}
                    	
                    }
                }
            }
			
			
		},
		
		pos_to_rank:{
			"size": "60%"
		}
		
};




// configuration at column level
oTableConfigurationList = {
		
		pos_to_rank:{
			id: {
				"visible": false,
				"editable": false
			},
			pos: {				
				"editable": true
			},
			rank: {
				"editable": true
			}
		},
		
		nuancerende_opmerkingen:{
			
			short_code:{
				"colsort": "asc",
				"editable": true
			},
			nuancerende_opmerking:{
				"editable": true
				
			}	
		},
		
		lemmata_en_paradigma_view: {
			
			// record id
			// NB: when a lemma has no paradigm attached, it has an empty rule instead, causing
			//     it to have an empty analyzed_wordform_id, which is why we need a separate non null unique_id
			unique_id:{
				"visible": false
			},
			analyzed_wordform_id:{
				"visible": false
			}, 
			 
			// lemma part
			lemma_id:{
				"visible": false,
				"click": function(t, n){
					var sLemmaId = fn.getDataFromCellNode(t, n);
					fn.callDatabase("lemmata_view", {"pkid": sLemmaId});
				}
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
			
			
			// wordform part
			wordform:{
				"editable": true,
				"editcallback": function(t, n, value){
					
					fn.refreshTable(t);
					
				}
			},
			th_wordform:{
				"bgcolor": "#E0F8EC",
				"editable": true
			},
			wordform_id:{
				"visible": false
			},
			wf_source:{
				"visible": false
			},
			wordform_afbr:{				
				"editable": true

			},		
			th_wordform_afbr:{
				"bgcolor": "#E0F8EC",
				"editable": true
			},
			wordform_gigpos:{
				"editable": true,
				"editcallback": function(t, n, value){					
					
					// get the rank corresponding to this pos
					// (we need to escape the parenthesis, as Lex'it cannot know those are no
					//  part of any regex)
					fn.getRecordGivenFieldValues("pos_to_rank", {"pos": fn.escapeRegexChars(value)}, 
							function(record){
							
								var sRankvalue = record["rank"];								
								var iRankvalue = (typeof sRankvalue != 'undefined') ? parseInt(sRankvalue) : 0;
								
								fn.updateDatabaseGivenANode(t, n, ["rank"], [iRankvalue], false, function(){
									
									// update rank in the analyzed_wordforms too
									var sAwfId = fn.getDataFromCellNamed(t, n, "analyzed_wordform_id");
									fn.updateDatabaseGivenFieldValues("analyzed_wordforms", 
											{"analyzed_wordform_id": sAwfId}, 
											{"rank": iRankvalue},
											false,
											function(){
												// refresh to make sorting according to 
												// paradigm position visible 
												fn.refreshTable(t, function(){
													
													fn.callFunction("api.check_analyzedwordforms", [sAwfId], function(response){
														
														processAwfCheck(sAwfId, response);
														});
													});
												
													}
												);
									
								});								
								
						});					
					
				}
			},
			rank:{
				"colsort": "asc",    // sort #2
				"visible": false
			},
			
						
			// quality status
			gedrukt:{
				
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

			}, 
			
			// comments
			comment:{
				"bgcolor": "#E0F8EC",
				"editable": true

			},
			comment_intern: {
				
				// BEWARE, DON'T REMOVE THIS PART
				// ------------------------------
				"flexible_visibility": false,
				"visible": (document.URL.indexOf( "gtb.dev.inl.loc" )>-1),
				// ------------------------------
				
				"bgcolor": "#E0F8EC",
				"editable": true

			},
			
			
			vk_status:{
				"visible": false
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
			
			// lemma_id
			"pkid":{				
				"visible": (fn.getCurrentUser() == 'katrien')
			},
			"gb_id":{				
				"visible": false,
				"editable": superUser()
			},
			
			
			// parent
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
			
			// lemma part
			"modern_lemma": {		
				"colsort": "asc",
				"editable": true
			},
			"lemma_gigpos": {				
				"editable": true				
			},
			"sublemma_type": {				
				"editable": true				
			},	
			"th_lemma": {				
				"editable": true				
			},
			
			
			// comments
			"opmerking": {				
				"visible": false // this column is only for transit of opmerking_extern
			},
			"opmerking_extern": {				
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
			"notitie": {				
				"editable": true
			},
			
			
			// gloss etc
			"gloss": {				
				"editable": true				
			},
			"nuanc_opm": {
				"editable": true,
				"dblclick": function(t, n){
					
					var sNuancOpm = fn.getDataFromCellNode(t, n);
					fn.callDatabase("nuancerende_opmerkingen", {"short_code": "exact:"+sNuancOpm});
				}
			},
			"kapstok": {				
				"editable": true
			},
			"trademark": {
				"editable": true,
				"visible": false
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
				
			
			
			
			// buttons
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
			
						
			
			// origin
			"taalvariant": {
				"editable": true
			},
			"herkomst": {
				"editable": true
			},
			
			
			// quality status
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
			"online": {
				"bgcolor": "#E0F8EC",
				"editable": true 

			},
			"keurmerk": {				
				"editable": true				
			},
			
			
			"verkleinwoord": {
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