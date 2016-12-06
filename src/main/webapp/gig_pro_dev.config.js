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
		 "export_versions", "nuancerende_opmerkingen", "pos_to_rank", "test2"];






function extractFeature(tag, pattern){
	var re = new RegExp(pattern);
	var m = re.exec(tag);
	if (m == null) {
		return "";
	}
	else {
		return m.join("");
	}
};


//remember chosen parent
var sChosenParentId = null;

// should the paradigm be shown in readable mode (= split up into parts)
var bReadableParadigmMode = false;


// this function will be called when we need to generate a neat and readable paradigm view
function generateParadigmView(){
	
	$("#lemmata_en_paradigma_view_dynamic").css("height", "765px");
	
	// draw the table
	// in such a way that the paradigm is split up in a few parts
	var oRows = fx.getAllRows("lemmata_en_paradigma_view");
	
	var sPreviousVerbFiniteness;
	var sPreviousVerbNumber;
	var sPreviousVerbTense;
	var sPreviousAdjectiveDegree;
	
	oRows.every(function(j){
		
		var aCurrentRow = this;
		var sWordformGigpos = fx.getDataFromCellInRow(aCurrentRow, "wordform_gigpos");
		
		// extract features so we can detect if one of them has changed
		// (if it is the case, we need to put a mark in the paradigm)
		
		var sVerbFiniteness = extractFeature(sWordformGigpos, 'finiteness=[a-z]+');
		var sVerbNumber = extractFeature(sWordformGigpos, 'NA=[a-z]+');
		var sVerbTense = extractFeature(sWordformGigpos, 'tense=[a-z]+');
		var sAdjectiveDegree = extractFeature(sWordformGigpos, 'degree=[a-z]+');
		
		// verb
		
		if ($.startsWith(sWordformGigpos, "VRB"))
			{
			var sBgColor;
			for (var i=0; i<mt.getListOfVisibleColumnsOf("lemmata_en_paradigma_view").length; i++)
				{
				var sColumnName = mt.getListOfVisibleColumnsOf("lemmata_en_paradigma_view")[i];
				
				if ( (sVerbFiniteness == 'finiteness=fin' && sVerbTense == 'tense=pres') ||
						sVerbFiniteness == 'finiteness=part')
					sBgColor = "#08088A";
				else
					sBgColor = "#8A084B";
				
				$(fx.getCellNode(aCurrentRow, sColumnName)).css("color", sBgColor);
				}
			}				
		
		if ($.startsWith(sWordformGigpos, "VRB")
				&&
				(sPreviousVerbFiniteness != sVerbFiniteness	||
						sPreviousVerbNumber != sVerbNumber ||
				 		(sPreviousVerbTense != sVerbTense && !sVerbFiniteness == 'finiteness=part'))
			)
			{
			for (var i=0; i<mt.getListOfVisibleColumnsOf("lemmata_en_paradigma_view").length; i++)
				{
				var sColumnName = mt.getListOfVisibleColumnsOf("lemmata_en_paradigma_view")[i];
				
				var sBorderStyle;				
				if (sPreviousVerbFiniteness != sVerbFiniteness || sPreviousVerbTense != sVerbTense)
					sBorderStyle = "solid";
				else if (sPreviousVerbNumber != sVerbNumber) 
					sBorderStyle = "dotted";
				
				$(fx.getCellNode(aCurrentRow, sColumnName)) 
					.css("border-top", "black "+sBorderStyle+" 1px")
					.css("padding-top", "15px");
				
				}
				
			}
		
		// adjective
		
		else if ($.startsWith(sWordformGigpos, "AA")
				&&
				(sPreviousAdjectiveDegree != sAdjectiveDegree)
				)
			{
			for (var i=0; i<mt.getListOfVisibleColumnsOf("lemmata_en_paradigma_view").length; i++)
				{
				var sColumnName = mt.getListOfVisibleColumnsOf("lemmata_en_paradigma_view")[i];
				
				// soft division when lots parts belonging together can somehow be split into smaller groups
				var sBorderStyle = "dotted";	
				
				$(fx.getCellNode(aCurrentRow, sColumnName)) 
					.css("border-top", "black "+sBorderStyle+" 1px")
					.css("padding-top", "15px");
				
				}
			}
		
		sPreviousVerbFiniteness = sVerbFiniteness;
		sPreviousVerbNumber = sVerbNumber;
		sPreviousVerbTense = sVerbTense;
		sPreviousAdjectiveDegree = sAdjectiveDegree;
			
	});
	
	
	fn.setCustomButtonName("lemmata_en_paradigma_view", 4, "Paradigma_view AAN");
	fn.setCustomButtonCss("lemmata_en_paradigma_view", 4, "textcolor", "red");
	
}



//Autocomplete configuration
//see: http://stackoverflow.com/questions/5077409/what-does-autocomplete-request-server-response-look-like
// http://stackoverflow.com/questions/18677536/jeditable-and-jquery-ui-autocomplete
var sAutoCompleteSelector = "#lemmata_view .nuanc_opm";

var sAutoCompleteSelector2 = "#lemmata_view .lemma_gigpos";

$(document).on(
      "focus", 
      sAutoCompleteSelector, 
      function(event) {
      	
      	$(event.target).autocomplete({
          	
      		delay: 750,
              minLength: 2,
	        	source: function(request, response){
	            	
	           	fn.callFunction("api.get_nuance_opm", [ fn.quote( request.term ) ], 
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

$(document).on(
	      "focus", 
	      sAutoCompleteSelector2, 
	      function(event) {
	      	
	      	$(event.target).autocomplete({
	          	
	      		delay: 750,
	              minLength: 2,
		        	source: function(request, response){
		            	
		            	fn.callFunction("api.get_lemma_gigpos", [ fn.quote( request.term ) ], 
		            			function(func_resp){  
		            		
		            		var aSuggestionsArr = 
		            			(func_resp["get_lemma_gigpos"]).split("|");
		            		
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
								var sShortCode =	fn.getPromptBoxInput("short_code");
								var sNuanceOpm =	fn.getPromptBoxInput("nuancerende_opmerking");
								
								fn.insertIntoDatabase(t, 
										{
										"short_code": sShortCode,
										"nuancerende_opmerking": sNuanceOpm
										}, 
										null, 
										function(){
											fn.refreshTable(t);
										});
							}, 
							true, 
							[35,3]);
				}
			},
			"button_1":{
				"name": "Verwijder selectie",
				"click": function(t){
					
					fn.confirm("Let op", "Weet u het zeker?", function(){
						
						
						var oRows = fx.getSelectedRowsFrom(t);						
						
						oRows.every(function(){
							var aCurrentRow = this;
							
							var bLastRow = fx.isLastRowOf(aCurrentRow, oRows);
							fx.removeFromDatabaseGivenARow(aCurrentRow, function(){
								if (bLastRow)
									fn.refreshTable(t);
								});
							//fn.removeFromDatabaseGivenANode(nCurrentNode, bLastRow);	
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
								var iMajor = 		fn.getPromptBoxInput("major");
								var iMinor = 		fn.getPromptBoxInput("minor");
								var sRecipient =	fn.getPromptBoxInput("recipient");
								var sComment = 		fn.getPromptBoxInput("comment");
								
								fn.insertIntoDatabase(t, 
										{
										"major": iMajor,
										"minor": iMinor,
										"recipient": sRecipient,
										"comment": sComment
										}, 
										null, 
										function(){
											fn.refreshTable(t);
										});
					});
				}
			},
			"button_1":{
				"name": "Verwijder selectie",
				"click": function(t){
					
					fn.confirm("Let op", "Weet u het zeker?", function(){
						
						var oRows = fx.getSelectedRowsFrom(t);
							//fn.getSelectedRowsFrom(t);
						
						oRows.every(function(){
							var aCurrentRow = this;
							
							var bLastRow = fx.isLastRowOf(aCurrentRow, oRows);
							fx.removeFromDatabaseGivenARow(aCurrentRow, function(){
								if (bLastRow)
									fn.refreshTable(t);
							});
							//fn.removeFromDatabaseGivenANode(nCurrentNode, bLastRow);	
						});
					});
					
					
					
				}
			},
			"button_2":{
				"name": "Syllabify",
				"click": function(t){
					
					fn.callService("/Spelling/SpellingServices", 
							{"action": "syllabify", "w": "pannenkoekenfestijn"}, 
							"GET", "json", function(xml){
								
								fn.message("Response", xml);
							});
					
				}
			},
			"button_3":{
				"name": "Morphology",
				"click": function(t){
					
					fn.callService("/Spelling/SpellingServices", 
							{"action": "morphology", "w": "pannenkoekenfestijn"}, 
							"GET", "json", function(xml){
								
								fn.message("Response", xml);
							});
					
				}
			},
			"button_4":{
				"name": "Test records",
				"click": function(t){
					
					fn.getRecords("lemmata_en_paradigma_view", 
							[170109, 98903, 199368, 170110, 194435, 170107], function(records){
						
						console.log(records);
						
					});
					
				}
			}
		},
		
		
		
		lemmata_en_paradigma_view:{
			
			"prereset_callback": function(t){
				
				fn.addFilters(t, {"gedrukt": "", "f_total_rel": ""});
				
				// reset means paradigm view is turned off
				bReadableParadigmMode = false;
				fn.setCustomButtonName(t, 4, "Paradigma_view UIT");
				fn.setCustomButtonCss(t, 4, "textcolor", "black");
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
							
							var aSelectedRows = fx.getSelectedRowsFrom(t);
								//fn.getSelectedRowsFrom(t);
							
							aSelectedRows.every(function(){								
								
								var sLemmaId = fx.getDataFromCellInRow(this, "lemma_id"); 
									//fn.getDataFromCellNamed(t, this, "lemma_id");
								var bLastRow = fx.isLastRowOf(this, aSelectedRows);
									//fn.isLastNodeOf(this, aSelectedRows);
								
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
				
				var oRows = fx.getAllRows(t);
				
				
				// apply locks and add colors
				
				var aLemmaIdsArr = new Array();
				oRows.every(function(i){
					
					aLemmaIdsArr[i] = fx.getDataFromCellInRow(this, "lemma_id");			
				});
				aLemmaIdsArr = getOnlyUniqueValues(aLemmaIdsArr);
				
				fn.showProcessingMsg(t);
				
				// get the list of locked lemmata
				// and modify the rows accordingly
				fn.callFunction("api.get_locks_of_lemmata", [ fn.quote( aLemmaIdsArr.join("|") ) ], function(){
					
					aCurrentParadigmaViewLocks = (fn.getFunctionOutput()[0]).split("|");
					
					oRows.every(function(i){
						
						var oThisRow = this;	
						
						// make records with an empty wordform unclickable
						
						var sAwfId = fx.getDataFromCellInRow(this, "analyzed_wordform_id");
						if (sAwfId == '' || sAwfId == null)
							{
							
							$(fx.getCellNode(oThisRow, "wordform")).editable('disable');
							$(fx.getCellNode(oThisRow, "wordform")).css("opacity", "0.5");
							
							$(fx.getCellNode(oThisRow, "afbr_auto")).find("input").attr("disabled", "disabled");
							$(fx.getCellNode(oThisRow, "afbr_auto")).css("opacity", "0.5");
							
							$(fx.getCellNode(oThisRow, "wordform_gigpos")).editable('disable');
							$(fx.getCellNode(oThisRow, "wordform_gigpos")).css("opacity", "0.5");
							
							$(fx.getCellNode(oThisRow, "wf_keurmerk")).find("input").attr("disabled", "disabled");
							$(fx.getCellNode(oThisRow, "wf_keurmerk")).css("opacity", "0.5");
							
							$(fx.getCellNode(oThisRow, "opmerking_intern")).editable('disable');
							$(fx.getCellNode(oThisRow, "opmerking_intern")).css("opacity", "0.5");
							
							$(fx.getCellNode(oThisRow, "opmerking_extern")).editable('disable');
							$(fx.getCellNode(oThisRow, "opmerking_extern")).css("opacity", "0.5");
							}
						
						
						
						// gedrukt must be blue
						var bIsGedrukt =  fx.getDataFromCellInRow(oThisRow, "gedrukt");					
						if (bIsGedrukt == 't')
							{
							var nCellSelector = $( fx.getNode(oThisRow) ).find("td");
							nCellSelector.css("color", "blue");
							}
						
						// diminutives must be green
						var sVerkleinwoord = fx.getDataFromCellInRow(oThisRow, "verkleinwoord");
						if (sVerkleinwoord != '-')
							{
							var nCellSelector = $( fx.getNode(oThisRow) ).find("td");
							nCellSelector.css("color", "green");
							}
						
						
						// apply locks
						var sLemmaId = fx.getDataFromCellInRow(oThisRow, "lemma_id");	
						if ( $.inArray( sLemmaId, aCurrentParadigmaViewLocks ) >-1 )
							{
							var nCellSelector = $( fx.getNode(oThisRow) ).find("td:not(.opmerking_intern)");
							nCellSelector.editable('disable');
							nCellSelector.css("opacity", "0.5");
							nCellSelector.find("input").attr("disabled", "disabled")
							nCellSelector.find("input").css("opacity", "0.5");							
							
							}						
						
					});						
					
				}); // end of row loop
				
				
				// finish with thie paradigm view, as it should overrule 
				// some things done by the previous loop (like font color)
				
				if (bReadableParadigmMode)
					generateParadigmView();
				
				fn.removeProcessingMsg(t);
				
			},			
			"button_0":{
				"name": "Voeg woordvorm toe",
				"click": function(confTable){
					
					var aFirstRow;
					var sLemmaId;
					var sLemma = null;
					
					// if there is no paradigm yet, get the lemma id from the lemma table
					if (fn.tableIsEmpty(confTable))
						{
						aFirstRow = fx.getFirstSelectedRowFrom("lemmata_view");						
						sLemmaId =	fx.getDataFromCellInRow(aFirstRow, "pkid");
						sLemma =	fx.getDataFromCellInRow(aFirstRow, "modern_lemma");
						}
					// otherwise just read it from the current table
					else
						{
						
						aFirstRow =	(fx.getSelectedRowsFrom(confTable)).any() ?
								fx.getFirstSelectedRowFrom(confTable) : fx.getFirstRowFrom(confTable);
						sLemmaId =	fx.getDataFromCellInRow(aFirstRow, "lemma_id");
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
								
									var sWordform =			fn.getPromptBoxInput("woordvorm");
									var sWordformPos =		fn.getPromptBoxInput("wordform_gigpos");
									var sNumberToBeAdded =	fn.getPromptBoxInput("aantal");
									
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
				"bgcolor": "salmon",
				"click": function(t){
					
					fn.confirm("Verwijder selectie", "Weet u het zeker?", function(){
						
						var oRows = fx.getSelectedRowsFrom(t);
						
						oRows.every(function(){
							
							var bLastRow = fx.isLastRowOf(this, oRows);
							
							fx.removeFromDatabaseGivenARow(this, function(){
								if (bLastRow) 
									fn.refreshTable(t);
							});														
							
						});
						
					});
					
					
				}
			},
			
			"button_2":{
				"name": "Rij dupliceren",
				"bgcolor": "lightblue",
				"click": function(t){
					
					fn.confirm("Rij dupliceren", "Weet u het zeker?", function(){
						
						var oRows = fx.getSelectedRowsFrom(t);
						
						if ( oRows.any() )
							{
							var oRow =		fx.getFirstSelectedRowFrom(t);
							var iAwfId =	fx.getDataFromCellInRow(oRow, "analyzed_wordform_id");
							fn.callFunction("api.clone_analyzed_wordform", [iAwfId], function(){
								fn.refreshTable(t);
								});
							}
						else
							{
							fn.message("Let op", "Kies de rij die gedupliceerd moet worden");
							}
						
					});					
					
				}
			},
			
			
			"button_3":{
				
				"name": "Bouw Paradigma",
				"click": function(t){
					
					// get the selected row, so we can define which paradigm we will extend
					var oAwfNode = fx.getFirstSelectedRowFrom(t);
					var oLemNode = fn.tableExists("lemmata_view") ? 
							fx.getFirstSelectedRowFrom("lemmata_view") : null;
					
					// we must have at least one row to get an id from 
					if (    ((oLemNode != null && oLemNode.count() == 0) || oLemNode == null)
							&& 
							oAwfNode.count() == 0 )
						{
						fn.message("Let op!", "Kies een lemma of een woordvorm!");
						}
					else
						{
						var sAwfId = null, sLemId = null;
						
						// do we have a lemma or a wordform?
						if (oAwfNode.count() == 0)
							{
							sLemId = fx.getDataFromCellInRow(oLemNode, "pkid");
							}
						else 
							{
							sAwfId = fx.getDataFromCellInRow(oAwfNode, "analyzed_wordform_id");
							}
						
						// if we have some selection to work with,
						// call the paradigm extension function
						if (sLemId != null || sAwfId != null)
							{
							fn.callFunction("api.add_missing_paradigm", [sLemId, sAwfId], function(){
								
								fn.refreshTable(t, function(){
									
									
									// gather wordforms to look up
									// in syllabificator werbservice
									
									var aWordformsToLookup = new Array();
									
									var oRows = fx.getAllRows(t);
									
									oRows.every(function(){
										
										var oCurrentRow = this;
										
										var sWordform =		fx.getDataFromCellInRow(oCurrentRow, "wordform");
										var sWordformAfbr =	fx.getDataFromCellInRow(oCurrentRow, "wordform_afbr");
										
										// we have a wordform but no abbreviation
										// so we'll have to look up this word
										
										if (sWordform != '' && sWordformAfbr == ''
											&& 
											$.inArray(sWordform, aWordformsToLookup)<0 
											&& 
											sWordform != '[VULIN]'
											)
											{
											aWordformsToLookup.push(sWordform);
											}											
									});
									
									
									// do the look up now!
									fn.callService("/Spelling/SpellingServices", 
													{"action": "syllabify", "w": aWordformsToLookup.join(" ")}, 
													"GET", "json", function(json){
											
														var response = json["analyses"][0];
														var aWordForms =		(response["word"]).split(" ");
														var aAbbreviations =	(response["printForm"]).split(" ");
														
														oRows.every(function(){
															
															var oCurrentRow = this;
															
															var sWordform =		fx.getDataFromCellInRow(oCurrentRow, "wordform");
															var sWordformAfbr =	fx.getDataFromCellInRow(oCurrentRow, "wordform_afbr");
															
															if (sWordform != '' && sWordformAfbr == '')
																{
																var indexOfAbbreviation = $.inArray(sWordform, aWordForms);
																var sNewAbbreviation = aAbbreviations[indexOfAbbreviation];
																if (sNewAbbreviation!=null)
																	{
																	fx.updateDatabaseGivenACellOrRow(oCurrentRow, {"wordform_afbr": sNewAbbreviation});
																	fx.putDataIntoCell(oCurrentRow, "wordform_afbr", sNewAbbreviation);
																	}
																
																}
														});
														
													}); // end of service call
									
									
									}); // end of refreshTable
								
								
								}); // end of add_missing_paradigm
							}
						
						}					
					
				}
			},
			
			
			"button_4":{
				
				"name": "Paradigma_view UIT",
				"bgcolor": "yellow",
				"textcolor": "black",
				"click": function(t){
					
					bReadableParadigmMode = !bReadableParadigmMode;			
					
					var xPos = $("#lemmata_en_paradigma_view_dynamic").css("left");
					var yPos = $("#lemmata_en_paradigma_view_dynamic").css("top");
										
					if (bReadableParadigmMode)
						{						
						var oFirstRow =	fx.getFirstRowFrom(t);
						var sLemmaId =	fx.getDataFromCellInRow(oFirstRow, "lemma_id");
						
						tb.destroyTable("lemmata_en_paradigma_view", function(){
							
							conf.changeTableConfigValue("lemmata_en_paradigma_view", "modern_lemma", "visible", false);
							conf.changeTableConfigValue("lemmata_en_paradigma_view", "lemma_gigpos", "visible", false);
							conf.changeTableConfigValue("lemmata_en_paradigma_view", "lem_keurmerk", "visible", false);
							conf.changeTableConfigValue("lemmata_en_paradigma_view", "gedrukt", "visible", false);
							conf.changeTableConfigValue("lemmata_en_paradigma_view", "online", "visible", false);
							
							fn.callDatabase(
									"lemmata_en_paradigma_view", 
									{"lemma_id": sLemmaId}, 
									function(){
										generateParadigmView();										
									}, 
									{"displaylength":"50", "top": yPos, "left": xPos}
									);
							});
						}
					else
						{
						fn.setCustomButtonName(t, 4, "Paradigma_view UIT");
						fn.setCustomButtonCss(t, 4, "textcolor", "black");

						fn.refreshTable(t);
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
						
						var oRowSelection = fx.getSelectedRowsFrom(confTable);
						
						oRowSelection.every(function(){
							
							var oCurrentRow =	this;
							var sLemmaId =		fx.getDataFromCellInRow(oCurrentRow, "lemma_id");
							
							fn.callFunction("api.restore_lemma_and_paradigm_and_ids", [sLemmaId],  
									function(){
										if (fx.isLastRowOf(oCurrentRow, oRowSelection))
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
						
						var oRowSelection =	fx.getSelectedRowsFrom(confTable);
						
						oRowSelection.every(function(){
							
							var oCurrentRow =	this;
							var sAwfId =		fx.getDataFromCellInRow(oCurrentRow, "analyzed_wordform_id");
							
							fn.callFunction("api.restore_wordform", [sAwfId],  
									function(){
										if (fx.isLastRowOf(oCurrentRow, oRowSelection))
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
							
							var oSelectedRows = fx.getSelectedRowsFrom(t);
							
							oSelectedRows.every(function(){
								
								var sLemmaId = fx.getRowId(this);
								var bLastRow = fx.isLastRowOf(this, oSelectedRows);
								
								if ($.inArray( sLemmaId, aCurrentLemmaViewLocks ) >-1)
									{
									fn.callFunction("api.unlock_lemma", [sLemmaId], function(){
											if(bLastRow) 
												fn.refreshTable(t);
											}
										);
									}
								else
									{
									fn.callFunction("api.lock_lemma", [sLemmaId], function(){
											if(bLastRow) 
												fn.refreshTable(t);
											}
										);
									}
								
							});
							
						}
					});
					}
				
				var oRows = fx.getAllRows(t);
				

				// apply locks and add colors
				
				var aLemmaIdsArr = new Array();
				oRows.every(function(i){
					
					aLemmaIdsArr[i] = fx.getRowId(this);
				});
				
				
				fn.showProcessingMsg(t);
				
				// get the list of locked lemmata
				// and modify the rows accordingly
				fn.callFunction("api.get_locks_of_lemmata", [ fn.quote( aLemmaIdsArr.join("|") ) ], function(){
					
					aCurrentLemmaViewLocks = (fn.getFunctionOutput()[0]).split("|");
					
					oRows.every(function(i){
						
						var oThisRow = this;
						
						var nCellSelector = $( fx.getNode(oThisRow) ).find("td");
						
						// gedrukt must be blue
						
						var bIsGedrukt = fx.getDataFromCellInRow(this, "gedrukt");
						if (bIsGedrukt == 't')
							{
							nCellSelector.css("color", "blue");	
							}
						
						// give parent other color (so they are recognizable)
						var bIsParent = fx.getDataFromCellInRow(this, "is_parent");					
						if (bIsParent == 't')
							{
							nCellSelector.css("color", "salmon");
							}								
						
						// diminutives must be green
						var sVerkleinwoord = fx.getDataFromCellInRow(this, "verkleinwoord");
						if (sVerkleinwoord != '-')
							{
							nCellSelector.css("color", "green");
							}
						
						// apply locks
						if ( $.inArray( fx.getRowId(oThisRow), aCurrentLemmaViewLocks ) >-1 )
							{
							var nCellSelector = $( fx.getNode(oThisRow) ).find("td:not(.opmerking_intern)");
							nCellSelector.editable('disable');
							nCellSelector.css("opacity", "0.5");
							nCellSelector.find("input").attr("disabled", "disabled")
							nCellSelector.find("input").css("opacity", "0.5");
							}						
						
					});
					
					
					fn.removeProcessingMsg(t);
					
				}); // end of function call
				
				
			},			
			
	
			"keyup" : {				
				
				"f9": function(confTable){
					
					var oRow =		fx.getFirstSelectedRowFrom(confTable);
					var sLemmaId =	fx.getDataFromCellInRow(oRow, "pkid");
					fn.callDatabase(
							"lemmata_en_paradigma_view", 
							{"lemma_id": sLemmaId}, 
							null, 
							{ignore_initialisation_filters: true}
							);
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
						
						var sLemma =	fn.getPromptBoxInput("modern_lemma");
						var sLemmaPos =	fn.getPromptBoxInput("lemma_gigpos");
						
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
						
						fn.showProcessingMsg(confTable);
						
						var oRows = fx.getSelectedRowsFrom(confTable);
						oRows.every(function(){
							
							var bLastRow = fx.isLastRowOf(this, oRows);
							var sLemmaId = fx.getDataFromCellInRow(this, "pkid");
							
							// extra job:
							
							// if this lemma has a diminutive derived from it,
							// we need to delete the diminutive as well, so check
							// if it exists.
							
							fn.callFunction("api.find_diminutive_lemma", 
									[sLemmaId], 
									function(){								
								
								var aColumns = fn.getFunctionOutput();					
								
								// we found a morphological analysis of a diminutives
								// constructed with this lemma
								
								var sMorphAnalysisId = 		aColumns["morphological_analysis_id"];
								var sVerkleinwoordLemId =	aColumns["verkleinwoord_lemma_id"];
								
								if (sMorphAnalysisId != '')
								{
									
									// remove diminutive from lemmata table
									// and associated morphological analysis 
									
									fn.removeFromDatabaseGivenFieldValues("morphological_analyses", 
											{"morphological_analysis_id": sMorphAnalysisId}, 
											function(){
												
												fn.removeFromDatabaseGivenFieldValues("lemmata", 
														{"lemma_id": sVerkleinwoordLemId});
											});
								
								}
								
							});
							
							
							// main job: remove the lemma
							
							fn.removeFromDatabaseGivenFieldValues("lemmata", 
									{"lemma_id": sLemmaId}, 
									function(){
										if (bLastRow) 
											fn.refreshTable(confTable);
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
					
					var oRow = fx.getFirstSelectedRowFrom(confTable);
					
					if (oRow.any())
						{
						// remember chosen parent, and show it on the screen
						var sLemId = fx.getDataFromCellInRow(oRow, "pkid");
						var sLemma = fx.getDataFromCellInRow(oRow, "modern_lemma");
						
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
						var oNodes = fx.getSelectedRowsFrom(confTable);
						if (oNodes.any())
							{
							
							oNodes.every(function(){
								
								var sLemId =	fx.getDataFromCellInRow(this, "pkid");
								var bLastNode =	fx.isLastRowOf(this, oNodes);
								
								fn.updateDatabaseGivenFieldValues("lemmata", 
										{"lemma_id": sLemId}, 
										{"parent_id": sChosenParentId}, 
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
					
					var oNodes = fx.getSelectedRowsFrom(confTable);
					if (oNodes.any())
						{
						oNodes.every(function(){
							
							var sLemId =	fx.getDataFromCellInRow(this, "pkid");
							var sParentId =	fx.getDataFromCellInRow(this, "parent_id");
							var bLastNode =	fx.isLastRowOf(this, oNodes);
							
							fn.updateDatabaseGivenFieldValues("lemmata", 
									{"lemma_id": sLemId}, 
									{"parent_id": null}, 
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
			"button_5":{
				
				"name": "Paradigma_view",
				"bgcolor": "yellow",
				"textcolor": "black",
				"click": function(t){
					
					bReadableParadigmMode = true;		
					
					var xPos = $("#lemmata_en_paradigma_view_dynamic").css("left");
					var yPos = $("#lemmata_en_paradigma_view_dynamic").css("top");
					
					tb.destroyTable("lemmata_en_paradigma_view", function(){
						
						var sLemmaId = fx.getDataFromCellInRow(fx.getFirstSelectedRowFrom(t), "pkid");
						
						conf.changeTableConfigValue("lemmata_en_paradigma_view", "modern_lemma", "visible", false);
						conf.changeTableConfigValue("lemmata_en_paradigma_view", "lemma_gigpos", "visible", false);
						conf.changeTableConfigValue("lemmata_en_paradigma_view", "lem_keurmerk", "visible", false);
						conf.changeTableConfigValue("lemmata_en_paradigma_view", "gedrukt", "visible", false);
						conf.changeTableConfigValue("lemmata_en_paradigma_view", "online", "visible", false);
						
						fn.callDatabase(
								"lemmata_en_paradigma_view", 
								{"lemma_id": sLemmaId}, 
								function(){
									generateParadigmView();									
								}, 
								{"displaylength":"50", "top": yPos, "left": xPos}
								);
						});
					
				}
				
			},
			
			"button_6": {
			
			"name": "deel-paradigma",
			"bgcolor": "white",
			"textcolor": "black",
			"menu": {
				
				"VRB tegen. tijd": function(t){
					
					var oCurrentRow =	fx.getFirstSelectedRowFrom(t);
					var sLemmaId =		fx.getDataFromCellInRow(oCurrentRow, "pkid");
					
					fn.callDatabase("lemmata_en_paradigma_view", 
							{"lemma_id": sLemmaId, "wordform_gigpos": "VRB.+finiteness=fin.+tense=pres"},
							function(){
								fn.scrollToTable("lemmata_en_paradigma_view");
								});
				},
				"VRB verl.tijd": function(t){
					var oCurrentRow =	fx.getFirstSelectedRowFrom(t);
					var sLemmaId =		fx.getDataFromCellInRow(oCurrentRow, "pkid");
					
					fn.callDatabase("lemmata_en_paradigma_view", 
							{"lemma_id": sLemmaId, "wordform_gigpos": "VRB.+finiteness=fin.+tense=past"},
							function(){
								fn.scrollToTable("lemmata_en_paradigma_view");
								});
				},
				"VRB inf en part": function(t){
					var oCurrentRow =	fx.getFirstSelectedRowFrom(t);
					var sLemmaId =		fx.getDataFromCellInRow(oCurrentRow, "pkid");
					
					fn.callDatabase("lemmata_en_paradigma_view", 
							{"lemma_id": sLemmaId, "wordform_gigpos": "VRB.+finiteness=(inf|part)"},
							function(){
								fn.scrollToTable("lemmata_en_paradigma_view");
								});
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
 
                	var oRow = fx.getRow(fn.getRowNode(confNode));
                	
                    // key indicates the option the user has chosen
                    if (key == 'verkleinwoord')
                        {
                    	
                    	sVerkleinwoord =	fx.getDataFromCellInRow(oRow, "modern_lemma");
                    	sVerkleinwoordId =	fx.getDataFromCellInRow(oRow, "pkid");

                    	setContextMenuOptions(key, options);
                        }
                    else if (key == 'partlemma')
                        {                       
                    	sPartLemma  =		fx.getDataFromCellInRow(oRow, "modern_lemma");
                    	sPartLemmaId =		fx.getDataFromCellInRow(oRow, "pkid");
                    	
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
					
					var sLemmaId = fn.getDataFromCellNode(n);
					fn.callDatabase("lemmata_view", {"pkid": sLemmaId});
				}
			},
			modern_lemma:{
				
				"colsort": "asc",    // sort #1
				"click": function(t, n){
					
					var sLemmaId = fn.getDataFromSiblingNode(n, "lemma_id");
					fn.callDatabase("lemmata_view", {"pkid": sLemmaId});
				}
			}, 
			lemma_gigpos:{
				"click": function(t, n){
					var sLemmaId = fn.getDataFromSiblingNode(n, "lemma_id");
					fn.callDatabase("lemmata_view", {"pkid": sLemmaId});
				}
			}, 
			lem_keurmerk:{
				"click": function(t, n){
					var sLemmaId = fn.getDataFromSiblingNode(n, "lemma_id");
					fn.callDatabase("lemmata_view", {"pkid": sLemmaId});
				}
			},
			lem_source:{
				"visible": false,
				"click": function(t, n){
					var sLemmaId = fn.getDataFromSiblingNode(n, "lemma_id");
					fn.callDatabase("lemmata_view", {"pkid": sLemmaId});
				}
			},
			
			
			// wordform part
			wordform:{
				"editable": true,
				"editcallback": function(t, n, value){
					
					// if normal mode, just refresh
					if ( !bReadableParadigmMode )
						{
						fn.refreshTable(t);
						}
					
					// but if in 'readable paradigm mode',
					// call the paradigm building function automatically
					// (this will fill in automatically the missing wordforms where they can
					//  be derived from the wordform just entered by the user) 
					else
						{
						
						var sAwfId = fn.getDataFromSiblingNode(n, "analyzed_wordform_id");

						fn.callFunction("api.add_missing_paradigm", 
								[null, sAwfId], 
								function(){
							
									var aRecordIds = fn.getDataFromColumn(t, "unique_id");
							
									fn.getRecords(t, aRecordIds, function(records){
										
										var oRows = fx.getAllRows(t);
										
										oRows.every(function(){
											
											var oCurrentRow = this;
											var sRecordId = fx.getRowId(oCurrentRow);											
											fx.putDataIntoCell(oCurrentRow, "wordform", records[sRecordId]["wordform"]);										
											
										});
										
										
										// gather wordforms to look up
										// in syllabificator werbservice
										
										var aWordformsToLookup = new Array();
										
										oRows.every(function(){
											
											var oCurrentRow = this;
											
											var sWordform =		fx.getDataFromCellInRow(oCurrentRow, "wordform");
											var sWordformAfbr =	fx.getDataFromCellInRow(oCurrentRow, "wordform_afbr");
											
											// we have a wordform but no abbreviation
											// so we'll have to look up this word
											
											if (sWordform != '' && sWordformAfbr == ''
												&& 
												$.inArray(sWordform, aWordformsToLookup)<0 
												&& 
												sWordform != '[VULIN]'
												)
												{
												aWordformsToLookup.push(sWordform);
												}											
										});
										
										
										// do the look up now!
										fn.callService("/Spelling/SpellingServices", 
														{"action": "syllabify", "w": aWordformsToLookup.join(" ")}, 
														"GET", "json", function(json){
												
															var response = json["analyses"][0];
															var aWordForms =	(response["word"]).split(" ");
															var aAbbreviations = (response["printForm"]).split(" ");
															
															oRows.every(function(){
																
																var oCurrentRow = this;
																
																var sWordform =		fx.getDataFromCellInRow(oCurrentRow, "wordform");
																var sWordformAfbr =	fx.getDataFromCellInRow(oCurrentRow, "wordform_afbr");
																
																if (sWordform != '' && sWordformAfbr == '')
																	{
																	var indexOfAbbreviation = $.inArray(sWordform, aWordForms);
																	var sNewAbbreviation = aAbbreviations[indexOfAbbreviation];
																	if (sNewAbbreviation!=null)
																		{
																		fx.updateDatabaseGivenACellOrRow(oCurrentRow, {"wordform_afbr": sNewAbbreviation});
																		fx.putDataIntoCell(oCurrentRow, "wordform_afbr", sNewAbbreviation);
																		}
																	
																	}
															});
															
														}); // end of service call
										
										}); // end of get records for wordforms		
									
									}); // end of add_missing_paradigm call
						
						} // end of paradigm view part			
					
				} // end of edit callback 
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
				"editable": true,
				"editcallback": function(t, n, value){
					
					// if normal mode, just refresh
					if ( !bReadableParadigmMode )
						{
						fn.refreshTable(t);
						}
					
					// but if in 'readable paradigm mode',
					// call the paradigm building function automatically
					// (this will fill in automatically the missing wordforms abbreviation where they can
					//  be derived from the abbreviation just entered by the user)
					else
						{
						
						var sAwfId = fn.getDataFromSiblingNode(n, "analyzed_wordform_id");

						fn.callFunction("api.add_missing_paradigm", 
								[null, sAwfId], 
								function(){
							
									
											
									
									}); // end of add_missing_paradigm-call
						
						} // end of paradigm-view mode part 			
					
				} // end of edit callback

			},		
			th_wordform_afbr:{
				"bgcolor": "#E0F8EC",
				"editable": true
			},
			wordform_gigpos:{
				"editable": true,
				"editcallback": function(t, n, value){
					
					var oCell = fx.getCell(n);
					
					// get the rank corresponding to this pos
					// (we need to escape the parenthesis, as Lex'it cannot know those are no
					//  part of any regex)
					fn.getRecordGivenFieldValues("pos_to_rank", {"pos": fn.escapeRegexChars(value)}, 
							function(record){
							
								var sRankvalue = record["rank"];								
								var iRankvalue = (typeof sRankvalue != 'undefined') ? parseInt(sRankvalue) : 0;
								
								
								fx.updateDatabaseGivenACellOrRow(oCell, {"rank": iRankvalue}, function(){
									
									// update rank in the analyzed_wordforms too
									
									var sAwfId = fx.getDataFromSiblingCell(oCell, "analyzed_wordform_id");
									
									fn.updateDatabaseGivenFieldValues("analyzed_wordforms", 
											{"analyzed_wordform_id": sAwfId}, 
											{"rank": iRankvalue},
											function(){
												// refresh to make sorting according to 
												// paradigm position visible 
												fn.refreshTable(t, function(){
													
													fn.callFunction("api.check_analyzedwordforms", 
															[sAwfId],
															function(response){
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
			
			flex: {
				
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
			opmerking_extern:{
				"bgcolor": "#E0F8EC",
				"editable": true

			},
			opmerking_intern: {
				
				// BEWARE, DON'T REMOVE THIS PART
				// ------------------------------
				"flexible_visibility": false,
				"visible": (document.URL.indexOf( "inl.loc" )>-1),
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
					
					var sLemma = fn.getDataFromCellNode(n);
					
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
				"editable": true,
				"click": function(t, n){
					
					var oCell = fx.getCell(n, "modern_lemma");
					var lemmaform = fx.getDataFromCell(oCell);
					
					fn.showProcessingMsg(t);
					
					fn.callFunction("api.get_biggest_final_matcher", [lemmaform], function(output){
						
						fn.removeProcessingMsg(t);
						fn.message("Resultaat", output["get_biggest_final_matcher"]);
					});
					
				},
				"editcallback": function(t, n, value){
					
					// make sure the menu disappear in IE
					$(".ui-menu-item").hide();
				}
			},
			"sublemma_type": {				
				"editable": true,
				"validator": "shift"
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
				"visible": (document.URL.indexOf( "inl.loc" )>-1),
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
			"gloss_intern": {				
				"editable": true				
			},
			"nuanc_opm": {
				"editable": true,
				"dblclick": function(t, n){
					
					var sNuancOpm = fn.getDataFromCellNode(n);
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
				"click": function(t, n){	
					
					var lemma_id = fn.getDataFromSiblingNode(n, "pkid");
					
					fn.callDatabase("lemmata_en_paradigma_view", 
							{"lemma_id": lemma_id}, 
							null, 
							{ignore_initialisation_filters: true});
				}
			},
			"toon_morfologie":{				
				"button": "Morfologie",
				"click": function(t, n){	
					
					var lemma_id = fn.getDataFromSiblingNode(n, "pkid");
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
				"editable": (fn.getCurrentUser()=='katrien'  
							|| fn.getCurrentUser()=='katrienvp' 
							|| fn.getCurrentUser()=='mathieu'  // temporarily
					), // only Katrien is entitled to change that
				"editcallback": function(t, n, value){
					// setting gedrukt=true automatically means online=true
					if (value == true)
						{					
						fn.updateDatabaseGivenANode(n, {"online":value}, function(){
								fn.refreshTable(t);
							});
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
			},
			"anc":{
				"editable": fn.getCurrentUser()=='katrien', // only Katrien is entitled to change that
				"editcallback": function(t, n, value){
					
					var sLemmaId = fn.getDataFromSiblingNode(n, "pkid");
					
					fn.updateDatabaseGivenFieldValues(
							"surinaams_and_antilliaans_commissions_selections", 
							{"lemma_id": sLemmaId}, 
							{"anc": value});
				}
			},
			"snc":{
				"editable": fn.getCurrentUser()=='katrien', // only Katrien is entitled to change that
				"editcallback": function(t, n, value){
					
					var sLemmaId = fn.getDataFromSiblingNode(n, "pkid");
					
					fn.updateDatabaseGivenFieldValues(
							"surinaams_and_antilliaans_commissions_selections", 
							{"lemma_id": sLemmaId}, 
							{"snc": value});
				}
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