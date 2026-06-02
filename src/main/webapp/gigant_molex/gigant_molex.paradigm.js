
var molexparadigm = {};


molexparadigm.settings = {
	
	wordforms: {

		"group": "Onder de motorkap",
		"width": "50%"
	},	
	
	analysed_wordforms: {

		"group": "Onder de motorkap"
	},
	
	lemmata_and_paradigm_view: {
		
		"prereset_callback": function(t){
			
			fn.addFilters(t, {"gedrukt": "", "f_total_rel": ""});
			
			// reset means paradigm view is turned off
			molexparadigm.bReadableParadigmMode = false;
			/*
			fn.setCustomButtonName(t, 4, "Paradigma_view UIT");
			fn.setCustomButtonCss(t, 4, "textcolor", "black");
			*/
		},

		"columns_order": [
			"molex_lemma",
			"molex_lemma_id",
			"molex_lemma_group",
			"analysed_wordform_id",
			"lemma_id",
			"wordform_id",
			"modern_lemma",
			"lemma_pos",
			"entry_type",
			"lem_keurmerk",
			"lem_source_id",
			"gedrukt",
			"tags",
			"wordform",
			"wordform_afbr",
			"wordform_pos",
			"wf_keurmerk",
			"arch",
			"rank",
			"opmerking_extern",
			"opmerking_intern",
			"wf_source_id",
			"verkleinwoord",
			"vk_status",
			"unique_id",
			"online",
			"publiceren",
			"th_wordform_afbr",
			"th_wordform",
			"lem_subset",
			"locked"				 
		],
		
		"repeat_callback": true,
		
		"callback": function(t){
			
			var sTableName = fn.getTableName(t);
			
			// build the UNlock button if it doesn't exist yet
			if ( superUser() && fn.getIndexOfButtonNamed(sTableName, "(Un)lock")<0) {
				fn.addCustomButton(t, {
					"name": "(Un)lock",
					"bgcolor": "#F5D0A9",
					"click": function(t){
						
						var aSelectedRows = fx.getSelectedRowsFrom(t);
						
						aSelectedRows.every(function(){		
							
							var thisRow = this;
							
							var sLemmaId = 		fx.getDataFromCellInRow(thisRow, "lemma_id");
							var bLemmaLocked =	fx.getDataFromCellInRow(thisRow, "locked");
							var bLastRow = 		fx.isLastRowOf(thisRow, aSelectedRows);								
							
							var lockedNewValue = ( lexutil.translateBoolean(bLemmaLocked) ? false : true);
							fn.updateDatabaseGivenFieldValues("lemmata", {"lemma_id": parseInt(sLemmaId)}, {"locked": lockedNewValue}, function(){
								if(bLastRow) 
									fn.refreshTable(t);
								});							
							
						});
						
					}
				});
			}
			
			var oRows = fx.getAllRows(t);
			
			
			// apply locks and add colors
						
			fn.showProcessingMsg(t);
			
			// get the list of locked lemmata
			// and modify the rows accordingly
			oRows.every(function(i){
				
				var oThisRow = this;	
				
				// make records with an empty wordform unclickable
				
				var sAwfId = fx.getDataFromCellInRow(this, "analysed_wordform_id");
				if (sAwfId == '' || sAwfId == null) {
					
					$(fx.getCellNode(oThisRow, "wordform")).editable('disable');
					$(fx.getCellNode(oThisRow, "wordform")).css("opacity", "0.5");
					
					$(fx.getCellNode(oThisRow, "afbr_auto")).find("input").attr("disabled", "disabled");
					$(fx.getCellNode(oThisRow, "afbr_auto")).css("opacity", "0.5");
					
					$(fx.getCellNode(oThisRow, "wordform_pos")).editable('disable');
					$(fx.getCellNode(oThisRow, "wordform_pos")).css("opacity", "0.5");
					
					$(fx.getCellNode(oThisRow, "wf_keurmerk")).find("input").attr("disabled", "disabled");
					$(fx.getCellNode(oThisRow, "wf_keurmerk")).css("opacity", "0.5");
					
					$(fx.getCellNode(oThisRow, "opmerking_intern")).editable('disable');
					$(fx.getCellNode(oThisRow, "opmerking_intern")).css("opacity", "0.5");
					
					$(fx.getCellNode(oThisRow, "opmerking_extern")).editable('disable');
					$(fx.getCellNode(oThisRow, "opmerking_extern")).css("opacity", "0.5");
				}
				
				
				
				// gedrukt must be blue [NOT ANYMORE]
				// var bIsGedrukt =  fx.getDataFromCellInRow(oThisRow, "gedrukt");					
				// if (bIsGedrukt == 't') {
				// 	var nCellSelector = $( fx.getNode(oThisRow) ).find("td");
				// 	nCellSelector.css("color", "blue");
				// }
				
				// diminutives must be green [NOT ANYMORE]
				// var sVerkleinwoord = fx.getDataFromCellInRow(oThisRow, "verkleinwoord");
				// if (sVerkleinwoord != '-') {
				// 	var nCellSelector = $( fx.getNode(oThisRow) ).find("td");
				// 	nCellSelector.css("color", "green");
				// }
					
				
				// apply locks
				var bLemmaLock = fx.getDataFromCellInRow(oThisRow, "locked");
				if ( lexutil.translateBoolean(bLemmaLock) ) {
					var nCellSelector = $( fx.getNode(oThisRow) ).find("td:not(.opmerking_intern)");

					nCellSelector.css("color", "green");
					nCellSelector.editable('disable');
					nCellSelector.find("input").attr("disabled", "disabled");
					// nCellSelector.editable('disable');
					// nCellSelector.css("opacity", "0.5");
					// nCellSelector.find("input").attr("disabled", "disabled")
					// nCellSelector.find("input").css("opacity", "0.5");				
					
				}						
				
			});
			
			
			// finish with the paradigm view, as it should overrule 
			// some things done by the previous loop (like font color)
			
			if (molexparadigm.bReadableParadigmMode)
				molexlib.generateParadigmView();
			
			fn.removeProcessingMsg(t);
			
		},			
		"button_0":{
			"name": "Voeg woordvorm toe",
			"click": function(t){
				
				var aFirstRow;
				var sLemmaId;
				var sLemma = null;
				
				// if there is no paradigm yet, get the lemma id from the lemma table
				if (fn.tableIsEmpty(t)) {
					aFirstRow = fx.getFirstSelectedRowFrom("lemmata");						
					sLemmaId =	fx.getDataFromCellInRow(aFirstRow, "lemma_id");
					sLemma =	fx.getDataFromCellInRow(aFirstRow, "modern_lemma");
				}
				// otherwise just read it from the current table
				else {
					
					aFirstRow =	(fx.getSelectedRowsFrom(t)).any() ?
							fx.getFirstSelectedRowFrom(t) : fx.getFirstRowFrom(t);
					sLemmaId =	fx.getDataFromCellInRow(aFirstRow, "lemma_id");
					// in this particular case, sLemma will be
					// requested by following fn.getRecord call
				}
				
				
				if (sLemmaId == null || sLemmaId == '') {
					fn.message("Kies een lemma", "Selecteer het lemma waar een woordvorm aan moet worden toegevoegd.");
				}
				else {
					fn.getRecord("lemmata", sLemmaId, function(response){
						
						// if we don't have a modern_lemma to show, get it
						
						if (sLemma == null)
							sLemma =  response["modern_lemma"];						
						
						fn.prompt("Geef woordvorm voor '"+sLemma+"'", 
								["woordvorm", "wordform_pos", "aantal"], 
								["", "", "1"], 
								function(){
							
								var sWordform =			fn.getPromptBoxInput("woordvorm");
								var sWordformPos =		fn.getPromptBoxInput("wordform_pos");
								var sNumberToBeAdded =	fn.getPromptBoxInput("aantal");
								
								var iNumberToBeAdded = parseInt(sNumberToBeAdded);
								for (var wi = 0; wi<iNumberToBeAdded; wi++)
									{
									
									// when adding multiple wordforms, add an index to the pos,
									// to prevent doubling (which is not allowed by table definition)
									var sWordformPosToAdd = (iNumberToBeAdded>1) ? 
											(sWordformPos + wi) : sWordformPos;
									
									fn.callFunction(sApiSchema+".insert_wordform", 
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
												fn.cleanTableCache(fn.getTableName(t), function(){
													fn.refreshTable(t);
														}
													);												
												}
											
											},
											function(err){
												fn.message("Let op", "Er ging iets mis. Is de gekozen part-of-speech wel toegestaan? ("+sWordformPos+")");
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
						
						fx.removeFromDatabaseGivenARow(this, 
							function(){
								if (bLastRow) 
									fn.refreshTable(t);
							},
							function(err){
								fn.message("Let op", "Verwijderen is niet toegestaan.");
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
					
					if ( oRows.any() ) {
						var oRow =		fx.getFirstSelectedRowFrom(t);
						var iAwfId =	fx.getDataFromCellInRow(oRow, "analysed_wordform_id");
						var bLocked =	lexutil.translateBoolean( fx.getDataFromCellInRow(oRow, "locked") );
						if (iAwfId == '' || iAwfId == null) {
							fn.message("Let op", "De rij die u probeert te dupliceren is een dummy rij, t.i. zonder analysed_wordform_id. Deze kan niet gedupliceerd worden.");
						}
						else if (bLocked) {
							fn.message("Let op", "Dit lemma is gelocked. Deze rij kan dan niet gedupliceerd worden.");
						}
						else {
							fn.callFunction(sApiSchema+".clone_analysed_wordform", [iAwfId], 
								function(){
									fn.refreshTable(t);
								}
							);
						}						
					}
					else {
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
				if (oAwfNode == null || oAwfNode.count()==0)
					oAwfNode = fx.getFirstRowFrom(t);
				var oLemNode = fn.tableExists("lemmata") ? 
						fx.getFirstSelectedRowFrom("lemmata") : null;
						
						
				// we must have at least one row to get an id from 
						
				if (    ((oLemNode != null && oLemNode.count() == 0) || oLemNode == null)
						&& 
						(oAwfNode == null || oAwfNode.count() == 0) ) {
					fn.message("Let op!", "Kies een lemma of een woordvorm!");
				}
				
				else {
					var sAwfId = null, sLemId = null;
					
					// do we have a lemma, or a wordform?						
					
					// wordform is a dummy one, t.i. the one that is just meant to make verb visible (in which case awfid is empty),
					// but of course, this allows us to read the lemma_id from the paradigm view at least
					if (	oAwfNode != null && 
							oAwfNode.count() > 0 && 
							fx.getDataFromCellInRow(oAwfNode, "analysed_wordform_id") == '') {	
						sLemId = fx.getDataFromCellInRow(oAwfNode, "lemma_id");
					}
					
					// if paradigm is completely empty, 
					// reading lemma_id can only happen in the lemma table
					else if ((oAwfNode == null || oAwfNode.count() == 0) && (oLemNode != null && oLemNode.count() > 0)) {
						sLemId = fx.getDataFromCellInRow(oLemNode, "lemma_id");
					}
					
					// remaining case: we have a genuine wordform, use it!
					else {
						sAwfId = fx.getDataFromCellInRow(oAwfNode, "analysed_wordform_id");
					}						
					
					// if we have some selection to work with,
					// call the paradigm extension function
					if (sLemId != null || sAwfId != null) {
						
						molexparadigm.addMissingParadigm(t, sLemId, sAwfId);
					}
					
				}					
				
			}
		},
		
		/*
		"button_4":{
			
			"name": "Paradigma_view UIT",
			"bgcolor": "yellow",
			"textcolor": "black",
			"click": function(t){
				
				molexparadigm.bReadableParadigmMode = !molexparadigm.bReadableParadigmMode;			
				
				var xPos = $("#lemmata_en_paradigma_view_dynamic").css("left");
				var yPos = $("#lemmata_en_paradigma_view_dynamic").css("top");
									
				if (molexparadigm.bReadableParadigmMode)
					{						
					var oFirstRow =	fx.getFirstRowFrom(t);
					var sLemmaId =	fx.getDataFromCellInRow(oFirstRow, "lemma_id");
					
					tb.destroyTable("lemmata_and_paradigm_view", function(){
						
						conf.changeTableConfigValue("lemmata_and_paradigm_view", "modern_lemma", "visible", false);
						conf.changeTableConfigValue("lemmata_and_paradigm_view", "lemma_pos", "visible", false);
						conf.changeTableConfigValue("lemmata_and_paradigm_view", "lem_keurmerk", "visible", false);
						conf.changeTableConfigValue("lemmata_and_paradigm_view", "gedrukt", "visible", false);
						conf.changeTableConfigValue("lemmata_and_paradigm_view", "online", "visible", false);
						conf.changeTableConfigValue("lemmata_and_paradigm_view", "opmerking_intern", "visible", false);
						conf.changeTableConfigValue("lemmata_and_paradigm_view", "opmerking_extern", "visible", false);
						conf.changeTableConfigValue("lemmata_and_paradigm_view", "verkleinwoord", "visible", false);
						conf.changeTableConfigValue("lemmata_and_paradigm_view", "th_wordform", "visible", false);
						conf.changeTableConfigValue("lemmata_and_paradigm_view", "th_wordform_afbr", "visible", false);
						conf.changeTableConfigValue("lemmata_and_paradigm_view", "lem_subset", "visible", false);
						
						fn.callDatabase(
								"lemmata_and_paradigm_view", 
								{"lemma_id": sLemmaId}, 
								function(){
									molexlib.generateParadigmView();										
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
			
		},*/
		
		
		"button_4":{
			
			"name": "нельзя",
			"bgcolor": "white",
			"textcolor": "red",
			"click": function(t){
				
				// trick: https://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript
				
				var tmpTextArea = $("<textarea></textarea>").attr("id", "russischWoordje").text("нельзя");
				$("#temporary_stuff").append(tmpTextArea);
				
				var copyChar = $('#russischWoordje');
				copyChar.select();
				
				try {
					// now copy it to clipboard
					
				    document.execCommand('copy');					    
				    
				    // confirm to user which chars he/she has chosen
				    fn.message("In clipboard", "нельзя");
				    
				    // remove temporary textarea
				    
				    $("#russischWoordje").remove();
				    
				  } catch (err) {
					  
				  }
			}
			
		},
		
		"button_5": {
			
			"name": "Afbrekingen",
			"tooltip": "Voeg ontbrekende afbrekingen toe",
			"click": function(t){
				
				fn.confirm(
						"Voeg afbrekingen toe", 
						"Dit zal de ontbrekende afbrekingen toevoegen. Weet u zeker dat u dit wilt?", 
						
						function(){
					
							// gather the rows whose afbr is not filled in
							
							var oRowsWithoutAfbr = fx.getAllRowsWhere(t, {"wordform_afbr": ""});
							var aRowsToProcess = new Array();					
							oRowsWithoutAfbr.every(function(){ aRowsToProcess.push(this); });
							
							// function for assigning a syllabified wordform to afbr
							
							var assignAfbrToEachRow = function(aRowsToProcess, i){
								
								// if we're done, refresh the table to show the results
								if (i == aRowsToProcess.length) {
									fn.refreshTable(t);
								}
								
								// 
								else {
									var oThisRow = aRowsToProcess[i];
									var sRowId = fx.getDataFromCellInRow(oThisRow, "analysed_wordform_id");
									var sWordForm = fx.getDataFromCellInRow(oThisRow, "wordform");
									
									// if the current row is a dummy, skip to the next row
									if (sRowId == '') {
										i++;
										assignAfbrToEachRow(aRowsToProcess, i);
									}
									// otherwise carry on with our job
									else {
										// call the SpellingServices for syllabifying the wordform
										
										fn.callService(sSpellingServiceURL, {"action": "syllabify", "w": sWordForm}, "GET", "json", function(json){
											
											var response = json["analyses"][0];
											var sAfbr = response["printForm"];
											
											// update the database with the syllabified wordform 
											// and call the function recursively till we're finished
											
											fx.updateDatabaseGivenACellOrRow(oThisRow, {"wordform_afbr": sAfbr}, function(){
												
												i++;
												assignAfbrToEachRow(aRowsToProcess, i);
											});
											
										}, {"useLexitService": bUseLexitService});
									}
									
								}
								
							};
							
							// start the job
							assignAfbrToEachRow(aRowsToProcess, 0);
							
						}, 
						function(){
							fn.message("OK", "Operatie door gebruiker geannuleerd");
						});
				
			}
			
		},
		
		

		"keyup": {

			"f4": function(t){
				// this must trigger the '(Un)lock' button functionality

				var iIdx = fn.getIndexOfButtonNamed(t, "(Un)lock");
				var sTable = fn.getTableName(t);
				$("button[id='"+sTable+"_button_"+iIdx+"']").click();
			}
		}
	}
	
};

molexparadigm.config = {
	
	lemmata_and_paradigm_view: {
		
		"locked": {
			"visible": false
		},
		
		"tags": {

			"click": function(t, n){

				var sLemmaId = fn.getDataFromSiblingNode(n, "lemma_id");

				var fnTag = function(){

					var sCell = fn.getDataFromCellNode(n);
					var aAlreadyChosen = sCell.split("; ");
					if (aAlreadyChosen.indexOf("")>=0)
						aAlreadyChosen.splice( aAlreadyChosen.indexOf(""), 1 );

					var sNewTagLabel = "Nieuwe tag";
					var aItems = aAvailableTags.concat( [null, sNewTagLabel] );

					fn.promptSelect(["Maak een keuze", "Houd CTRL ingedrukt voor meervoudige keuze:"], aItems, aAlreadyChosen, 
						function(response){

							fn.closeDialog();

							// remove the empty choice, if other options were chosen as well
							if (response.length>1 && response.indexOf("")>-1)
								response.splice( response.indexOf(""), 1 );
							if (response.length>1 && response.indexOf(sNewTagLabel)>-1)
								response.splice( response.indexOf(sNewTagLabel), 1 );
						
							var sChosenItems = response.join('; ');
							fn.updateDatabaseGivenFieldValues("lemmata", {"lemma_id": sLemmaId}, {"tags": sChosenItems}, function(){
								fn.refreshTable(t);
							});								
						}, 
						function(){
							// Canceled by user
							// do nothing
						},
						function(sChosenItem){

							// user chooses to add variant
							if (sChosenItem == sNewTagLabel){

								fn.closeDialog();
								fn.prompt(["Nieuwe tag", "Voeg nieuwe tag toe"], ["Tag"], [""], 
									function(resp){
										
										aAvailableTags.push(resp["Tag"]);
										aAvailableTags.sort();

										// reopen this dialog
										fnTag();
									},
									function(){
										// reopen this dialog
										fnTag();
									}
								);
							}
						});

				};

				fnTag();

				
			}

		},

		// record id
		// NB: when a lemma has no paradigm attached, it has an empty rule instead, causing
		//     it to have an empty analysed_wordform_id, which is why we need a separate non null unique_id
		"unique_id": {
			"visible": false
		},
		"analysed_wordform_id": {
			"nice_name": "awf_id",
			"visible": false
		}, 
		
		"lem_subset": {
			"nice_name": "subset"
		},
		 
		// lemma part
		"lemma_id": {
			"visible": false,
			"click": function(t, n){
				
				var sLemmaId = fn.getDataFromCellNode(n);
				fn.callDatabase("lemmata", {"lemma_id": sLemmaId});
			}
		},
		"molex_lemma_id": {
			"nice_name": "molex_id"
		},
		"molex_lemma_group": {
			"nice_name": "molex_group"
		},
		"modern_lemma": {
			
			"colsort": "asc",    // sort #1
			"click": function(t, n){
				
				var sLemmaId = fn.getDataFromSiblingNode(n, "lemma_id");
				fn.callDatabase("lemmata", {"lemma_id": sLemmaId});
			}
		}, 
		"lemma_pos": {
			"click": function(t, n){
				var sLemmaId = fn.getDataFromSiblingNode(n, "lemma_id");
				fn.callDatabase("lemmata", {"lemma_id": sLemmaId});
			}
		}, 
		"lem_keurmerk": {
			"click": function(t, n){
				var sLemmaId = fn.getDataFromSiblingNode(n, "lemma_id");
				fn.callDatabase("lemmata", {"lemma_id": sLemmaId});
			}
		},
		"lem_source_id": {
			"visible": false,
			"click": function(t, n){
				var sLemmaId = fn.getDataFromSiblingNode(n, "lemma_id");
				fn.callDatabase("lemmata", {"lemma_id": sLemmaId});
			}
		},
		
		
		// wordform part
		"wordform": {
			"editable": true,
			"editcallback": function(t, n, value){
				
				// if normal mode, just refresh
				if ( !molexparadigm.bReadableParadigmMode ) {
					fn.refreshTable(t);
				}
				
				// but if in 'readable paradigm mode',
				// call the paradigm building function automatically
				// (this will fill in automatically the missing wordforms where they can
				//  be derived from the wordform just entered by the user) 
				else {
					
					var sAwfId = fn.getDataFromSiblingNode(n, "analysed_wordform_id");

					fn.callFunction(sApiSchema+".add_missing_paradigm", 
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
											) {
												aWordformsToLookup.push(sWordform);
											}			
									});
									
									
									// do the look up now!
									fn.callService(sSpellingServiceURL, 
													{"action": "syllabify", "w": aWordformsToLookup.join(" ")}, 
													"GET", "json", function(json){
											
														var response = json["analyses"][0];
														var aWordForms =	(response["word"]).split(" ");
														var aAbbreviations = (response["printForm"]).split(" ");
														
														oRows.every(function(){
															
															var oCurrentRow = this;
				
															var sWordform =		fx.getDataFromCellInRow(oCurrentRow, "wordform");
															var sWordformAfbr =	fx.getDataFromCellInRow(oCurrentRow, "wordform_afbr");
															
															if (sWordform != '' && sWordformAfbr == '') {
																var indexOfAbbreviation = $.inArray(sWordform, aWordForms);
																var sNewAbbreviation = aAbbreviations[indexOfAbbreviation];
																if (sNewAbbreviation!=null) {
																fx.updateDatabaseGivenACellOrRow(oCurrentRow, {"wordform_afbr": sNewAbbreviation});
																fx.putDataIntoCell(oCurrentRow, "wordform_afbr", sNewAbbreviation);
			}
																
															}
														});
														
													}, {"useLexitService": bUseLexitService}); // end of service call
									
									}); // end of get records for wordforms		
								
								}); // end of add_missing_paradigm call
					
				} // end of paradigm view part			
				
			} // end of edit callback 
		},
		"th_wordform": {
			"bgcolor": "#E0F8EC",
			"editable": true
		},
		"wordform_id": {
			"nice_name": "wf_id",
			"visible": false
		},
		"wf_source_id": {
			"visible": false
		},
		"wordform_afbr": {				
			"editable": true,
			"editcallback": function(t, n, value){
				
				// if normal mode, just refresh
				if ( !molexparadigm.bReadableParadigmMode ) {
					fn.refreshTable(t);
				}
				
				// but if in 'readable paradigm mode',
				// call the paradigm building function automatically
				// (this will fill in automatically the missing wordforms abbreviation where they can
				//  be derived from the abbreviation just entered by the user)
				else {
					
					var sAwfId = fn.getDataFromSiblingNode(n, "analysed_wordform_id");

					fn.callFunction(sApiSchema+".add_missing_paradigm", 
							[null, sAwfId], 
							function(){
								
									
										
									
								}); // end of add_missing_paradigm-call
								
					} // end of paradigm-view mode part 			
				
			} // end of edit callback

		},		
		"th_wordform_afbr": {
			"bgcolor": "#E0F8EC",
			"editable": true
		},
		"wordform_pos": {
			"nice_name": "wf_pos",
			"editable": true,
                            "editerrorhandler": function(jqXHR, textStatus, errorThrown){
                               fn.message("Foute boel!", "alert: ongeldige waarde voor veld wordform_pos!", function(){fn.refreshTable("lemmata_and_paradigm_view");});
                             },

			"editcallback": function(t, n, value){
				
				var oCell = fx.getCell(n);
				
				// get the rank corresponding to this pos
				// (we need to escape the parenthesis, as Lex'it cannot know those are no
				//  part of any regex)
				fn.getRecordGivenFieldValues("distinct_wordform_pos", {"wordform_pos": fn.escapeRegexChars(value)}, 
						function(record){
						
							var sRankvalue = record["rank"];								
							var iRankvalue = (typeof sRankvalue != 'undefined') ? parseInt(sRankvalue) : 0;
							
							
							fx.updateDatabaseGivenACellOrRow(oCell, {"rank": iRankvalue}, function(){
								
								// update rank in the analysed_wordforms too
								
								var sAwfId = fx.getDataFromSiblingCell(oCell, "analysed_wordform_id");
								
								fn.updateDatabaseGivenFieldValues("analysed_wordforms", 
										{"analysed_wordform_id": sAwfId}, 
										{"rank": iRankvalue},
										function(){
											// refresh to make sorting according to 
											// paradigm position visible 
											fn.refreshTable(t, function(){
												
												fn.callFunction(sApiSchema+".check_analysedwordforms", 
														[sAwfId],
														function(response){
															molexlib.processAwfCheck(sAwfId, response);
															});
													});
											
												}
											);
								
							});								
							
					});					
				
			}
		},
		"rank": {
			"colsort": "asc",    // sort #2
			"visible": false
		},
		
		"flex": {
			
		},
					
		// quality status
		"gedrukt": {
			
		},
		"online": {
			
		},
		"publiceren": {
			"bgcolor": "#E0F8EC",
			"editable": true
		},
		"wf_keurmerk": {
			"bgcolor": "#E0F8EC",
			"editable": true

		}, 

		"arch": {
			"bgcolor": "#E0F8EC",
			"editable": true

		}, 
		
		// comments
		"opmerking_extern": {
			"bgcolor": "#E0F8EC",
			"editable": true

		},
		"opmerking_intern": {
			
			// BEWARE, DON'T REMOVE THIS PART
			// ------------------------------
			"flexible_visibility": false,
			"visible": (document.URL.indexOf( "inl.loc" )>-1),
			// ------------------------------
			
			"bgcolor": "#E0F8EC",
			"editable": true

		},
		
		
		"vk_status": {
			"visible": false
		}
	}
	
};




/**
 * Function to add the missing paradigm
 */
molexparadigm.addMissingParadigm = function(t, sLemId, sAwfId){
	
	var fnAddMissingParadigm = function(t, sLemId, sAwfId){
		
		// call the paradigm extension database function	
			fn.callFunction(sApiSchema+".add_missing_paradigm", [sLemId, sAwfId], function(){
									
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
								) {
								aWordformsToLookup.push(sWordform);
							}											
						});
						
						
						// do the look up now!
						fn.callService(sSpellingServiceURL, 
								{"action": "syllabify", "w": aWordformsToLookup.join(" ")}, 
								"GET", "json", function(json){
						
									var response = json["analyses"][0];
									var aWordForms =		(response["word"]).split(" ");
									var aAbbreviations =	(response["printForm"]).split(" ");
									
									oRows.every(function(){
										
										var oCurrentRow = this;
										
										var sWordform =		fx.getDataFromCellInRow(oCurrentRow, "wordform");
										var sWordformAfbr =	fx.getDataFromCellInRow(oCurrentRow, "wordform_afbr");
										
										if (sWordform != '' && sWordformAfbr == '') {
											var indexOfAbbreviation = $.inArray(sWordform, aWordForms);
											var sNewAbbreviation = aAbbreviations[indexOfAbbreviation];
											if (sNewAbbreviation!=null) {
												fx.updateDatabaseGivenACellOrRow(oCurrentRow, {"wordform_afbr": sNewAbbreviation});
												fx.putDataIntoCell(oCurrentRow, "wordform_afbr", sNewAbbreviation);
											}
											
										}
									}); // rows loop
									
								}, 
								{"useLexitService": bUseLexitService}
						); // end of service call
						
						
					}); // end of refreshTable
					
				}
			); // end of add_missing_paradigm
	};
	
	
	// make sure that the paradigm table is open
	// and do the job
	
	if (fn.tableIsOpen(t)){
		
		fnAddMissingParadigm(t, sLemId, sAwfId);
	}
	else {
		fn.callTable(t, {"lemma_id": sLemId}, function(){
			
			// allow table to open
			setTimeout(function(){	
				fnAddMissingParadigm(t, sLemId, sAwfId);		
			}, 500);
		
		});	
	}
	
	
};