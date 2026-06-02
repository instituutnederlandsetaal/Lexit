
var hilexparadigm = {};

hilexparadigm.settings = {
	
	analysed_wordforms: {
		
		"group": "Onder de motorkap",
		"exact_count": true
	},
	wordforms: {
		
		"group": "Onder de motorkap",
		"exact_count": true
	},
	
	lemmata_and_paradigm_view: {

		"width":"98%",			
		"exact_count": true,
		"columns_order": [
		                  	"hilex_lemma_id",
							"hilex_lemma",
							"hilex_lemma_group",
							"source_id",
							"lemma_id",
							"multiple_lemmata_analysis_id",
							"persistent_id",
							"modern_lemma",
							"lemma_variants",
							"online",
							"full_analysis",
							"lemma_pos",
							"group_id",
							"analysed_wordform_id",
							"wordform_id",
							"wordform",
							"wordform_pos",
							"unique_id",
							"opmerking",
							"wf_online",
							"verified"
							],
							
		"columns_sorting": {
			"hilex_lemma_id": "asc", 
			"modern_lemma": "asc", 
			"persistent_id": "asc", 
			"group_id": "asc",
			"wordform": "asc" },
		
		"callback": function(t){
			
			// groups must be easily recognizable
			hilexlib.highlightGroups(t);
			
			
			// lemmata locks
			
			var sTableName = fn.getTableName(t);
			
			// build the UNlock button if it doesn't exist yet
			// (for superusers only)
			if ( hilexlib.superUser() && fn.getIndexOfButtonNamed(sTableName, "(Un)lock")<0) {
										
				fn.addCustomButton(sTableName, {
					"name": "(Un)lock",
					"bgcolor": "#F5D0A9",
					"click": function(t){
						
						var oSelectedRows = fx.getSelectedRowsFrom(t);
						
						oSelectedRows.every(function(){
							
							var sLemmaId = 		fx.getDataFromCellInRow(this, "lemma_id");
							var sMultilemmaId =	fx.getDataFromCellInRow(this, "multiple_lemmata_analysis_id");
							var bLastRow = 		fx.isLastRowOf(this, oSelectedRows);
							
							if ($.inArray( hilexlib.comma(sLemmaId, sMultilemmaId), aCurrentParadigmaViewLocks ) >-1) {
								
								fn.callFunction(sApiSchema+".unlock_lemma", 
									[hilexlib.deEmpty(sLemmaId), hilexlib.deEmpty(sMultilemmaId)], 
									function(){
										if(bLastRow) fn.refreshTable(t);
									}
								);
							}
							else {
								fn.callFunction(sApiSchema+".lock_lemma", 
									[hilexlib.deEmpty(sLemmaId), hilexlib.deEmpty(sMultilemmaId)], 
									function(){
										if(bLastRow) fn.refreshTable(t);
									}
								);
							}
							
						}); // end of rows loop
						
					}
				});
			}
			
			
			// apply locks
			
			var aLemmaIdsArr =	new Array();
			var oRows =			fx.getAllRows(t);
			
			oRows.every(function(){				
				
				var sLemmaId = 		fx.getDataFromCellInRow(this, "lemma_id");
				var sMultiLemmaId =	fx.getDataFromCellInRow(this, "multiple_lemmata_analysis_id");
				
				aLemmaIdsArr.push( hilexlib.comma(sLemmaId, sMultiLemmaId) );
			});
			
			// get the list of locked lemmata
			// and modify the rows accordingly
			fn.callFunction(sApiSchema+".get_locks_of_lemmata", [ fn.quote(aLemmaIdsArr.join("|")) ], function(){
				
				aCurrentParadigmaViewLocks = (fn.getFunctionOutput()[0]).split("|");
				
				oRows.every(function(i){
					
					var oRow = 		this;
					var sLemmaId = 		fx.getDataFromCellInRow(oRow, "lemma_id");
					var sMultiLemmaId =	fx.getDataFromCellInRow(oRow, "multiple_lemmata_analysis_id");
					
					
					if ( $.inArray( hilexlib.comma(sLemmaId, sMultiLemmaId), aCurrentParadigmaViewLocks ) >-1 ) {
						
						var aVisibleCells = mt.getListOfVisibleColumnsOf(fn.getTableName(t));
						
						for (var j=0; j<aVisibleCells.length; j++) {
							
							var sCurrentColumnName = aVisibleCells[j];
							
							// we mustn't lock the comment field
							if (sCurrentColumnName == 'opmerking')
								continue;
							
							
							// make sure we can't edit the locked lemmata
							var sCellType =	fx.getCellType(oRow, sCurrentColumnName);								
							var eCell =		fx.getCellNode(oRow, sCurrentColumnName);
							
							if (sCellType == 'text') {									
								$(eCell).editable('disable');
								$(eCell).css("opacity", "0.5");
							}
							else if (sCellType == 'checkbox') {
								$(eCell).find("input").attr("disabled", "disabled");
								$(eCell).css("opacity", "0.5");
							}
							else if (sCellType == 'selectbox') {
								$(eCell).editable('disable');
								$(eCell).css("opacity", "0.5");
							}
						}					
						
					} // end of if						
					
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
						["modern_lemma", "wordform_pos", "persistent_id", "source_id"], 
						["", "", sDefaultPersistentId, aAllowedSourceIdsForNewLemmata], function(resp){
					
							var sLemma =		resp["modern_lemma"];
							var sPos =			resp["wordform_pos"];
							var sPersistentId =	resp["persistent_id"];
							var sWdb =			resp["source_id"];

							if (sWdb == 'WNT' && (
								!$.startsWith(sPersistentId, "M") &&
								!$.startsWith(sPersistentId, "A") &&
								!$.startsWith(sPersistentId, "S")
							)){
								fn.message("Let op", sPersistentId+" is geen toegestane PID.<BR><BR>WNT PIDs beginnen met M, A of S");
							}
							else {

								fn.callFunction(sApiSchema+".create_new_lemma", 
									[fn.quote(sLemma), fn.quote(sPos), fn.quote(sPersistentId), fn.quote(sWdb)], 
									function(){
								
										// the lemma was created in the lemmata table 
										// and copied by a trigger to the current table, so make
										// the result visible
										fn.callDatabase(t, {"modern_lemma": "^"+sLemma+"$", "source_id": sWdb});
								
								});
							}
				});
			}
			
		},
		
		"button_1":{
			
			"name": "Verwijder selectie",
			"click": function(t){
				
				fn.confirm("Verwijder selectie", "Weet u zeker dat u deze woordvorm(en) wilt verwijderen?", function(){
					
					var oRows = fx.getSelectedRowsFrom(t);
					
					oRows.every(function(){
						
						var oRow = this;							
						var sAwfId = fx.getDataFromCellInRow(oRow, "analysed_wordform_id");
						var bLastRow = fx.isLastRowOf(oRow, oRows);
						
						// if the wordform is empty, we need to delete the row
						if (sAwfId == '' || sAwfId == null) {
							fx.removeFromDatabaseGivenARow(oRow, function(){	
								if (bLastRow) 
									fn.refreshTable(t);
								});
						}
						// if we have a true wordform, process it as such
						else {
							fn.callFunction(sApiSchema+".delete_analysed_wordform", [sAwfId], function(){	
								if (bLastRow) 
									fn.refreshTable(t);
								});
						}
													
						
					});	// end of loop
					
				});	// end of confirm					
				
			}
		}, // end of button 1
		
		"button_2": {
			
			"name": "Maak HiLex-lemma aan",
			"tooltip": "Ken dit lemma een nieuw HiLex-lemma-id toe.",
			"bgcolor": "green",
			"click": function(t){
					
				var oRow = fx.getFirstSelectedRowFrom(t);
				
				if ( oRow.count()!=1 ) {
					fn.message("Let op!", "Kies één lemma!" +
							"Dan pas kan daar een nieuw HiLex-lemma aan toegekend worden");
				}
				else {
					var sLemmaId = fx.getDataFromCellInRow(oRow, "lemma_id");
					var sModlem = fx.getDataFromCellInRow(oRow, "modern_lemma");
					
					fn.confirm("Maak HiLex-lemma aan", "Er zal een nieuw HiLex-lemma-id worden aangemaakt, " +
							"en daar zal het lemma '"+sModlem+"' onder komen te hangen. " +
							"Weet u zeker dat u dat wilt?", function(){
						
						fn.callFunction(sApiSchema+".create_new_super_lem", [sLemmaId], function(){							
							fn.refreshTable(t);							
							});
					});
				}
			}
		},
		"button_3": {
			
			"name": "Gekozen HiLex-lemma:",
			"tooltip": "Klik om het (in de tabel) geselecteerde lemma te kiezen als HiLex-lemma.",
			"bgcolor":"yellow",
			"textcolor": "red",
			"click": function(t){
				
				var oRow = fx.getFirstSelectedRowFrom(t);
									
				if ( oRow.any() ) {
					// remember chosen HiLex-lemma, and show it on the screen
					var sSuperLemId = fx.getDataFromCellInRow(oRow, "hilex_lemma_id");
					var sSuperLemma = fx.getDataFromCellInRow(oRow, "hilex_lemma");
					
					fn.setCustomButtonName(t, 3, "Gekozen HiLex-lemma:<b>"+sSuperLemma+"</b>");
					sChosenSuperLemId = sSuperLemId;
				}
				
				// press shift + click to cancel parent selection 
				if (kf._getPressedKey() == 'shift') {
					fn.setCustomButtonName(t, 3, "Gekozen HiLex-lemma:");
					sChosenSuperLemId = null;
				}
			}
		},
		"button_4":{
			"name": "Link HiLex-lemma",
			"tooltip": "Koppel het (in de tabel) geselecteerde lemma met het gekozen HiLex-lemma.",
			"bgcolor":"red",
			"textcolor": "yellow",
			"click": function(t){
				
				fn.confirm("Lemma en HiLex-lemma linken", "Weet u het zeker?", function(){
					
					if (sChosenSuperLemId != null) {
						
						var oRows = fx.getSelectedRowsFrom(t);
						if (oRows.any()) {
							
							oRows.every(function(){
								
								var sLemId = 	fx.getDataFromCellInRow(this, "lemma_id");
								var bLastNode =	fx.isLastRowOf(this, oRows);
								
								fn.updateDatabaseGivenFieldValues("lemmata", 
										{"lemma_id": sLemId}, 
										{"hilex_lemma_id": sChosenSuperLemId}, 
										
										function(){
											
											if (bLastNode) {												
												fn.refreshTable(t);
											}
										});
								});			
							
						}
						else {
							fn.message("Let op", "Kies een of meerdere lemmata!");							
						}
					}
					else {
						fn.message("Let op", "Kies eerst een HiLex-lemma!");
					}
					
				});					
				
			}
		},
		"button_5": {
			
			"name": "Unlink HiLex-lemma",
			"tooltip": "Koppel het (in de tabel) geselecteerde lemma los van zijn HiLex-lemma. Daardoor krijgt dit lemma een nieuw HiLex-lemma-id.",
			"bgcolor":"red",
			"textcolor": "yellow",
			"click": function(t){
				
				
				fn.confirm("Lemma en HiLex-lemma unlinken", "Weet u het zeker?", function(){
					
					var oRows = fx.getSelectedRowsFrom(t);
					if (oRows.any()) {
						
						oRows.every(function(){
							
							var sLemId = 	fx.getDataFromCellInRow(this, "lemma_id");
							var bLastNode =	fx.isLastRowOf(this, oRows);
							
							fn.callFunction(sApiSchema+".create_new_super_lem", [sLemId], function(){
								
								if (bLastNode) {
									fn.refreshTable(t);
								}
								
							});
						
						}); // end of rows loop
					}
					else {
						fn.message("Let op", "Kies een of meerdere lemmata!");
					}
					
				});
				
			}				
		},
		
		"button_6":{
			
			"name": "CLITICS",
			"tooltip": "Toon alle records onderdeel van een multiple lemmata analysis",
			"bgcolor": "pink",
			"textcolor": "black",
			"click": function(t){
				
				fn.clearAllFilters(t);
				fn.setFilters(t, {"multiple_lemmata_analysis_id": "."}, true);
				fn.refreshTable(t);
				
			}
		},
		
		"button_7": {
			"name": "Toon alle attestaties",
			"tooltip": "Toon alle attestaties van de nu zichtbare analysed wordform in deze tabel",
			"click": function(t){
				var aAllIds = fn.getDataFromColumn(t, "analysed_wordform_id");
				fn.callDatabase("token_attestations_worktable", {"analysed_wordform_ids": "{"+aAllIds.join(",")+"}"});
			}
		}
				
	}
	
};

hilexparadigm.config = {
	
	analysed_wordforms: {
		
	},
	
	lemmata_and_paradigm_view: {
			
		"hilex_lemma_id" :{
			"nice_name": "hilex_id",
			"width": "30px"
		},
		
		"hilex_lemma_group": {
			"nice_name": "hilex_group"
		},
		
		"source_id": {
			//"nice_name": "src",
			"choosefrom": ["", "ONW", "ONWn", "ONW|ONWn", "VMNW", "VMNWn", "VMNW|VMNWn", "MNW", "MNWn", "MNW|MNWn", "WNT", "WNTn", "WNT|WNTn"]
		},
		
		"full_analysis": {
			"width": "30px"
		},
		"modern_lemma": {
			"width": "30px",		
			"editable": true,
			"editcallback": function(t, n, value){

				var sLemmaId = fn.getDataFromSiblingNode(n, "lemma_id");

				// check if we had multiple (comma separated) variants first, 
				// but only one after edition
				var oldValue = n.revert.trim();

				if (oldValue.indexOf(",")>0	// old value contained commas
					&&
					value.indexOf(",")<0	// commas are gone
					){	
										
					fn.updateDatabaseGivenFieldValues("lemma_variants", {"lemma_id": sLemmaId, "lemma_variant": "^"+value.trim()+"$"}, {"main_variant": true}, function(){

						setTimeout(function(){
							fn.removeFromDatabaseGivenFieldValues("lemma_variants", {"lemma_id": sLemmaId, "main_variant": false}, function(){
																			
								if (fn.tableExists("lemma_variants")){
									fn.refreshTable("lemma_variants");
								}																		
								
							});

						}, 100);	
							
					});
				}
				else {
					// we need a refresh to make the change visible in rest of paradigm
					// where the lemmaform is repeated
					fn.refreshTable(t);
				}
				
				// Katrien's request:
				if (fn.tableExists("token_attestations_worktable"))
					fn.refreshTable("token_attestations_worktable");
			}

		},

		"lemma_variants": {
			
			"width": "30px",
			"click": function(t, nCell){

				var fnVariantMenu = function(){

					// get the lemma-id
					// and ask the database to give all available variants

					var iLemmaId = fn.getDataFromSiblingNode(nCell, "lemma_id");
					var sWdb = fn.getDataFromSiblingNode(nCell, "source_id");

					fn.callFunction(sApiSchema+".get_variants_of_lemma", [iLemmaId], function(resp){

						// parse response
						var sLemAndVariants = resp["get_variants_of_lemma"];
						var aLemAndVariants = sLemAndVariants.split("###");
						
						// main lemma string
						var sLemma = aLemAndVariants[0];
						// variants
						var aVariants = aLemAndVariants.length > 1 ?
							(aLemAndVariants[1]).split(", ")
							:
							(fn.getDataFromSiblingNode(nCell, "modern_lemma")).split(", ");

						// if lemma contains no commas, we do a chosen main lemma already
						// otherwise consider we have none 
						var aAlreadyChosen = sLemma.indexOf(",")>-1 ? [] : [sLemma];

						// add options for adding variants
						var sAddVariantLabel = "Voeg een variant toe";
						var aAllOptions = aVariants.concat( [null, sAddVariantLabel] );


						// gather the main lemma (modern_lemma) and the variant lemma strings
						// and show those in a list, allowing the user to choose the main variant out of those.
						
						fn.promptSelect(["Kies de hoofdvariant", "Kies de hoofdvariant (of SHIFT+Klik om variant te verwijderen):"], aAllOptions, aAlreadyChosen, 
							function(aChosen){

								var toets = kf._getPressedKey();

								if (aChosen.length != 1){
									fn.message("Let op", "U moet één hoofdvariant kiezen uit de lijst!");
								}
								else {
									fn.message("Even geduld", "HiLex werkt nu alle verwijzingen naar dit lemma bij. Een ogenblikje...");

									if (toets == "shift"){
										
										fn.removeFromDatabaseGivenFieldValues("lemma_variants", {"lemma_id": iLemmaId, "lemma_variant": aChosen[0]},
											function(){
												fn.callRecord(fn.getRowNode(nCell), ["modern_lemma", "lemma_variants"], function(){
													fn.closeDialog();
													if (fn.tableExists("lemmata_and_paradigm_view")){
														fn.refreshTable("lemmata_and_paradigm_view");
													}
													if (fn.tableExists("lemma_variants")){
														fn.refreshTable("lemma_variants");
													}
											});
										});

									}
									else {

										fn.updateDatabaseGivenFieldValues("lemma_variants", 
											{"lemma_id": iLemmaId, "lemma_variant": "^"+aChosen[0]+"$"}, 
											{"main_variant": true}, 
											function(){
												fn.callRecord(fn.getRowNode(nCell), ["modern_lemma", "lemma_variants"], function(){
													fn.closeDialog();
													if (fn.tableExists("lemmata_and_paradigm_view")){
														fn.refreshTable("lemmata_and_paradigm_view");
													}
													if (fn.tableExists("lemma_variants")){
														fn.refreshTable("lemma_variants");
													}
												});
											}
										);

									}									
									
								}
							}, 
							function(){
								// cancel
								fn.refreshTable(t);
							},
							function(sChosenItem){

								// user chooses to add variant
								if (sChosenItem == sAddVariantLabel){
									
									fn.closeDialog();
									fn.prompt(
										["Voeg nieuwe variant toe", "Voer één of meer nieuwe varianten. Indien nodig, gebruik een komma als scheidingsteken"], 
										["Varianten"], 
										[sLemma], 
										function(resp){
											
											fn.showProcessingMsg(t);
											var aNewVariants = (hilexutils.setCommasRight(resp["Varianten"])).split(", ");

											for (var i=0; i<aNewVariants.length; i++){

												fn.insertIntoTable("lemma_variants", 
													{"lemma_id": iLemmaId, "source_id": sWdb, "modern_lemma": sLemma, "lemma_variant": aNewVariants[i]},
													null, // not return field 
													function(){
														// return to the variant main menu 
														if (i == aNewVariants.length-1){

															fn.removeProcessingMsg(t);
															// recall the menu
															setTimeout(function(){fnVariantMenu();}, 500);
														}
														
													}
												); // end of insert
											}

										} // end of prompt callback
									);										
								}
								// user has chosen a pre-existing variant to be the main one
								else {
									// trigger click on OK
									$( "#dialog_accept_button" ).click();
								}									

							}
							
						); // end of function
					});

				};

				fnVariantMenu();

			} // end of click event	

		},

		"persistent_id": {		
			"width": "30px",
			"cell_tooltip": "Open WDB",
			"click": function(t, n){
				
				var oCell = 		fx.getCell(n);
				var sWdb = 			fx.getDataFromSiblingCell(oCell, "source_id");
				var iPersistentId =	fx.getDataFromCell(oCell);
				
				// remove illegal string parts, which would cause an error in the GTB 
				sWdb = sWdb.replace("_DIM", "");
				
				window.open("http://gtb.inl.nl/iWDB/search?actie=article&wdb="+sWdb+"&id="+iPersistentId);					
			}
		},
		
		"multiple_lemmata_analysis_id": {
			"nice_name": "mla_id",
			"width": "30px",				
			"cell_tooltip": "Toon details",
			"click": function(t, n){
				
				var oCell = 	fx.getCell(n);
				var iMlaId =	fx.getDataFromCell(oCell);
				
				fn.callDatabase("multiple_lemmata_analyses_view", {"multiple_lemmata_analysis_id": iMlaId},
						function(){
					fn.scrollToTable("multiple_lemmata_analyses_view");
				});
				
			},
			"contextmenu": {
				"items": {
					"rebuild_multilem": { "name": "Verbouw multilemma" }
				},
				"callback": function(t, n, key, options){
					if (key == "rebuild_multilem"){

						var sMultilemId = fn.getDataFromCellNode(n);
						var sMultilem = fn.getDataFromSiblingNode(n, "modern_lemma");
						var sMultiWdb = fn.getDataFromSiblingNode(n, "source_id");

						fn.callFunction(sApiSchema+".get_part_lemmata_of", [sMultilemId], function(resp){

							var aResp = (resp["get_part_lemmata_of"]).split("@@@");
							var hLemmaToId = new Hashtable();
							var aLemmaList = [];
							for (var di=0; di<aResp.length; di++){
								var sLem = aResp[di].split(':::')[0];
								var sLemId = aResp[di].split(':::')[1];

								aLemmaList.push(sLem);
								hLemmaToId.put(sLem, sLemId);
							}


							// autocomplete for lemma to replace with
							$(document).on(
								"focus", 
								"#prompt_tevervangendoor", 
								function(event) {
									
									$(event.target).autocomplete({
										
										delay: 750,
										minLength: 2,
										source: function(request, response){
											
											fn.callFunction(sApiSchema+".get_lemmata_from_prefix", [fn.quote(request.term), fn.quote(sMultiWdb)], 
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
											$(this).autocomplete('widget').putInFront();
											return false;
										},
										select: function( event, ui ) {
											
											// nothing for now
										}
									});
									
								}
							);


							fn.prompt(["Multilemma verbouwen", "Let op! U wilt '"+sMultilem+"' verbouwen:<BR>dit multiple-lemma zal OVERAL in het lexicon worden aangepast.<BR><BR>Kies:"], 
								["te vervangen deellemma", "te vervangen door"], 
								[aLemmaList, ""], 
								function(resp){

									// get rid of autocomplete
									$(document).off("focus", "#prompt_tevervangendeellemma");

									// get id of lemma to replace
									var sLemmaToReplace = resp["te vervangen deellemma"];
									var iLemmaIdToReplace = hLemmaToId.get(sLemmaToReplace);

									// get id of lemmat to use instead
									var sLemmaToUseInstead = resp["te vervangen door"];
									var iLemmaIdToUseInstead = sLemmaToUseInstead.replace(/.+, id:(.+)\)$/, '$1');

									// now do the trick!!!
									//alert("replace "+iLemmaIdToReplace+" by "+iLemmaIdToUseInstead);
									fn.closeDialog();
									fn.message("Bezig...", "Bezig met bijwerken van het lexicon.<BR><BR>Even wachten a.u.b...");
									setTimeout(function(){

										fn.callFunction(sApiSchema+".replace_part_of_multilemma", [sMultilemId, iLemmaIdToReplace, iLemmaIdToUseInstead], function(resp){
											
											fn.closeDialog();
											fn.callDatabase(t, {"multiple_lemmata_analysis_id": resp["replace_part_of_multilemma"]});
										});
									}, 200);
									
								},
								function(){
									fn.closeDialog();
									fn.message("Ok", "Operatie door gebruiker geannuleerd.");
								}
							);

						});


					}
				} // end of callback
			}
		},
		
		"analysed_wordform_id": {
			
			"width": "30px",
			"nice_name": "awf_id",
			"bgcolor": "#F8E0E6",
			"cell_tooltip": "Toon citaten",
			"click": function(t, n){
				
				var oCell = 	fx.getCell(n);
				var iAwfId = 	fx.getDataFromCell(oCell);
				var iLemmaId =	fx.getDataFromSiblingCell(oCell, "lemma_id");
				
				fn.callDatabase("token_attestations_worktable", 
					{"analysed_wordform_ids_arr": "{"+iAwfId+"}", "lemma_id": iLemmaId},
					function(){
						fn.scrollToTable("token_attestations_worktable");
					});
			}
		},
		"group_id": {	
			"width": "30px",			
			"cell_tooltip": "Totaal citaten bijbehorend bij groep",
			"click": function(t, n){
				
				var oCell =		fx.getCell(n);
				var iGroupId =	fx.getDataFromCell(oCell);
				var iLemmaId =	fx.getDataFromSiblingCell(oCell, "lemma_id");
				
				fn.callDatabase("token_attestations_worktable", 
					{"group_id": iGroupId, "lemma_id": iLemmaId},
					function(){
						fn.scrollToTable("token_attestations_worktable");
					});
			}
		},
		"wordform": {

		},
		
		"lemma_pos": {
			
			"width": "30px",

			"editable": true,
			"editcallback": function(t, n){
				
				// we need a refresh to make the change visible in rest of paradigm
				// where the lemmaform is repeated
				fn.refreshTable(t); 
			}

		},
		"wordform_pos": {
			"nice_name": "wf_pos",
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
		
		/*
		"notes":{
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
					if ( !currentVal.match("\\b"+notesKey+"\\b") )
						currentVal += " "+notesKey;						
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
		
		"unique_id":{
			"visible": false
		},
		"hilex_lemma": {
			"width": "30px"
		},
		"lemma_id": {
			"width": "30px"
		},
		"wordform_id": {
			"nice_name": "wf_id",
			"width": "30px"
		},
		"wordform": {
			"width": "30px"
		},
		"wf_online": {
			"width": "30px"
		},
		"verified": {
			"editable": true,
			"width": "30px"
		}
	},
	
	wordforms: {
		
	},
	
};