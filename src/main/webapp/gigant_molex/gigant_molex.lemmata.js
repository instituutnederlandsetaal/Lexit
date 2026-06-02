
var molexlem = {};



// remember chosen brother lemma
molexlem.sBrotherLemmaId = null;

molexlem.settings = {
	
	parents: {
		"group": "Onder de motorkap"
	},
	
	
	gigant_superlemmata : {
		
		"exact_count": true,
		"width": "60%"
	},
	
	
	lemmata: {
	
		"columns_order": [
			  "locked",
			  "gigant_superlemma_id",
			  "molex_lemma_id", 
	          "molex_lemma", 	           
			  "gb_superid",
			  "lemma_id",  
			  "modern_lemma", 
			  "lemma_pos",
			  "opmerking_intern", 
			  "gb_wrdcat",  
			  "gb_znwlid",  
			  "lidw", 
			  "tags", 
			  "geslacht",  
			  "keurmerk",
			  "online", 
			  "gedrukt",
			  "has_dim",
			  "has_el",
			  "has_fonet",
			  "has_morph",
			  "uitspraak",
			  "entry_type", 
	          "sublemma_type", 
	          "gloss", 
			  "gloss_intern",
			  "subset",
			  "source_id", 
	          "ww_feat",
	          "kapstok", 
			  "creation_date", 
			  "creation_time", 
	          "taalvariant", 
	          "herkomst", 
	          "opmerking_extern",
	          "taaladvies", 
	          "th_lemma", 
	          "nuanc_opm", 
	          "gb_id", 
	          "toon_paradigma", 
	          "trademark", 
	          "toon_morfologie", 
	          "verkleinwoord"
		],
	          
		"prereset_callback": function(t){
			
			molexlem.sBrotherLemmaId = null;
			fn.setCustomButtonName(t, 2, "Kies broeder:");
			
			fn.addFilters(t, {"gedrukt": "", "tmp_f_total_rel": ""});
							
		},
				
		"repeat_callback": true,
				
		"callback": function(t){			
			
			var sTableName = fn.getTableName(t);
			
			// build the UNlock button if it doesn't exist yet
			if ( superUser() && fn.getIndexOfButtonNamed(sTableName, "(Un)lock")<0) {				
										
				fn.addCustomButton(sTableName, {
					"name": "(Un)lock",
					"bgcolor": "#F5D0A9",
					"click": function(t){
						
						var oSelectedRows = fx.getSelectedRowsFrom(t);
						
						oSelectedRows.every(function(){
							
							var thisRow = this;
							
							var sLemmaId = 		fx.getDataFromCellInRow(thisRow, "lemma_id");
							var bLemmaLocked =	fx.getDataFromCellInRow(thisRow, "locked");
							var bLastRow = 		fx.isLastRowOf(thisRow, oSelectedRows);
							
							var lockedNewValue = ( lexutil.translateBoolean(bLemmaLocked) ? false : true );
							
							
							
							fn.updateDatabaseGivenFieldValues("lemmata", {"lemma_id": parseInt(sLemmaId)}, {"locked": lockedNewValue}, function(){
								if(bLastRow) 
									fn.refreshTable(t);
								});
															
							});
						
					}
				});
			}
			
			
			
			
			// apply locks and add colors
						
			fn.showProcessingMsg(t);
			
			var oRows = fx.getAllRows(t);
			
			oRows.every(function(i){
				
				var oThisRow = this;
	
				// apply locks
				var bLemmaLock = fx.getDataFromCellInRow(oThisRow, "locked");
				if ( lexutil.translateBoolean(bLemmaLock) ) {
	
					var nCellSelector = $( fx.getNode(oThisRow) ).find("td:not(.gloss_intern, .opmerking_intern, .uitspraak, .sublemma_type)");
					nCellSelector.css("color", "green");
					nCellSelector.editable('disable');
					nCellSelector.find("input").attr("disabled", "disabled");
								
				}						
				
			});
			
			
			fn.removeProcessingMsg(t);
	
	
			// DISABLE THE Morphology buttons when no morph-analysis is available 
	
			// gather the lemma ids of the current view
			var aLemmaIdsToCheck = fn.getDataFromColumn(t, "lemma_id")
	
			// And call a function to check if those have a morphological analysis.
			// Output will be the list of lemma ids that indeed have such an anlysis.
			fn.callFunction(sApiSchema+".check_existence_morph_analyses", [ aLemmaIdsToCheck.join(",") ], function(output){
	
				var aListHavingMorphAnalyses = (output["check_existence_morph_analyses"]).split(",");
	
				oRows.every(function(i){
	
					var oThisRow = this;
					var bHasMorph = fx.getDataFromCellInRow(oThisRow, "has_morph");
					var sLemmaId = fx.getRowId(oThisRow);
					// if current row is part of the function output
	
					//if ( $.inArray(sLemmaId, aListHavingMorphAnalyses)<0){
					if (bHasMorph == false || bHasMorph == 'f') {
						$( fx.getCellNode(oThisRow, "toon_morfologie") ).find("button").css("display", "none");
					}
	
				});
	
			});
			
			
		},			
				
		
		"keyup": {				
			
			"f9": function(t){
				
				var oRow =		fx.getFirstSelectedRowFrom(t);
				var sLemmaId =	fx.getDataFromCellInRow(oRow, "lemma_id");
				fn.callDatabase(
						"lemmata_and_paradigm_view", 
						{"lemma_id": sLemmaId}, 
						null, 
						{ignore_initialisation_filters: true}
						);
			},
	
			"pause": function(t){
				var oThisRow =		fx.getFirstSelectedRowFrom(t);
				$( fx.getCellNode(oThisRow, "toon_morfologie") ).click();
			},
	
			"f4": function(t){
				// this must trigger the '(Un)lock' button functionality
	
				var iIdx = fn.getIndexOfButtonNamed(t, "(Un)lock");
				var sTable = fn.getTableName(t);
				$("button[id='"+sTable+"_button_"+iIdx+"']").click();
			}
		},
		
				
		"button_0": {
			"name": "Voeg lemma toe",
			"click": function(t){
				
				fn.prompt("Geef een lemma", 
						["modern_lemma", "lemma_pos", "gloss_intern", "bouw paradigma"], 
						["", "", "", false], 
						function(resp){
					
					var sLemma =	resp["modern_lemma"];
					var sLemmaPos =	resp["lemma_pos"];
					var sGloss =	resp["gloss_intern"];
					var bBuildParadigm = lexutil.translateBoolean( resp["bouw paradigma"] );
					
					
					// check first if this lemma existed in the past and was removed
					
					fn.showProcessingMsg(t);
					
					// slight delay to allow processing message to appear 
					setTimeout(function(){
						
						fn.callFunction(sApiSchema+".find_removed_lemma", 
								[sLemma, sLemmaPos], 
								function(){
							
							fn.removeProcessingMsg(t);
							
							var aColumns = fn.getFunctionOutput();
							
							// If some identical lemma existed in the past,
							// give the user the possibility to restore it
							
							if (aColumns["lemma_id"] != '') {
								
								fn.confirm("Let op!", 
										"Op "+aColumns["modification_date"]+ " is het lemma "+
										aColumns["modern_lemma"]+"/"+aColumns["lemma_pos"]+ " " +
										(aColumns["gloss_intern"]!='' ? "("+aColumns["gloss_intern"]+") ":"") +
										"met ID "+aColumns["lemma_id"]+ " verwijderd. "+
										"<br><br>Wilt u dit lemma herstellen?", 
										function(){
									
											fn.showProcessingMsg(t);
											
											// slight delay to allow processing message to appear 
											setTimeout(function(){
									
												// user chosed to re-use the id
												fn.callFunction(sApiSchema+".restore_lemma_and_paradigm_and_ids", 
													[parseInt(aColumns["lemma_id"])], 
													function(){
														fn.refreshTable(t);
													});
													
											}, 100);
											
										},
										function(){
											
											fn.showProcessingMsg(t);
											
											// slight delay to allow processing message to appear 
											setTimeout(function(){
											
												// user chosed to create a new lemma 
												fn.callFunction(sApiSchema+".insert_lemma_and_get_id", 
													[sLemma, sLemmaPos, sGloss], 
													function(resp){
														var sLemId = resp["insert_lemma_and_get_id"];
														
														fn.refreshTable(t);
														
														// insert paradigm if required
														if (bBuildParadigm) {														
															molexparadigm.addMissingParadigm("lemmata_and_paradigm_view", sLemId, null);
														}
													},
													function(){
									            		fn.removeProcessingMsg(t);
										            	fn.message("Let op", "Deze pos-tag is niet toegestaan. Het lemma is daarom NIET aangemaakt.");
										            });
										            
										     }, 100);
											
										}
								);
							}
							
							// default behaviour: 
							// no such lemma was removed before: lemma must be new
							else {
								
								fn.showProcessingMsg(t);
								
								// slight delay to allow processing message to appear 
								setTimeout(function(){
								
									// check first if the lemma exist already
									
									fn.callFunction(sApiSchema+".find_existing_lemma", 
											[sLemma, sLemmaPos], 
											function(response){
												
												resp = response["find_existing_lemma"];
												
												// lemma exists! What now?
												if (resp != null && resp != '') {
													fn.confirm("Let op!", "In de database bestaat het volgende: "+resp+"<BR>Weet u zeker dat u dit lemma wilt aanmaken?", 
															function(){
														
																fn.showProcessingMsg(t);
																
																// slight delay to allow processing message to appear 
																setTimeout(function(){
																
																	fn.callFunction(sApiSchema+".insert_lemma_and_get_id", 
																			[sLemma, sLemmaPos, sGloss], 
																			function(resp){
																				
																		var sLemId = resp["insert_lemma_and_get_id"];
																				
																		fn.refreshTable(t);
																		
																		// insert paradigm if required
																		if (bBuildParadigm) {														
																			molexparadigm.addMissingParadigm("lemmata_and_paradigm_view", sLemId, null);
																		}
																	});
																	
																}, 100); // slight delay
														
															}, 
															function(){
																
																fn.message("OK", "Operatie door gebruiker geannuleerd.");
																
															});
												}
										
												// normal behaviour: lemma doesn't exist, just make it!
												else {
													
													fn.showProcessingMsg(t);													

													// slight delay to allow processing message to appear 
													setTimeout(function(){
													
														fn.callFunction(sApiSchema+".insert_lemma_and_get_id", 
																[sLemma, sLemmaPos, sGloss], 
																function(resp){
																	
																	var sLemId = resp["insert_lemma_and_get_id"];
																	
																	fn.refreshTable(t);
																	
																	// insert paradigm if required
																	if (bBuildParadigm) {														
																		molexparadigm.addMissingParadigm("lemmata_and_paradigm_view", sLemId, null);
																	}
																},
																function(err){
												            		fn.removeProcessingMsg(t);
													            	fn.message("Let op", "Deze pos-tag is niet toegestaan. Het lemma is daarom NIET aangemaakt.");
																}
														);
														
													}, 100); // slight delay
													
												} // end of normal behaviour
										
										
									});
								
								}, 100); // slight delay
								
							}
						}
					);}, 100); // slight delay to allow processing message to appear
					
					
				});
			}
		},
		"button_1":{
			"name": "Verwijder selectie",
			"click": function(t){
	
				// there must be a selection!
	
				var oRows = fx.getSelectedRowsFrom(t);
				if (oRows == null && oRows.count() == 0){
	
					fn.message("Let op", "Kies op z'n minst één lemma om te verwijderen");
					return false;
				}
	
				// gather the lemma-id's of the current selection
	
				var aLemmaIds = new Array();
				var sWarningAboutLinksToExternalResources = "";
				oRows.every(function(){
					var sLemmaId = fx.getDataFromCellInRow(this, "lemma_id");
					aLemmaIds.push(sLemmaId);
				});
	
				// pre-check if the selection has external links (with EXTERNAL resource)
				
				fn.callFunction(sApiSchema+".check_if_lem_has_external_links", [fn.quote(aLemmaIds.join(","))], function(linkresp){
	
					var sLinkResp = linkresp["check_if_lem_has_external_links"];
					if ( lexutil.translateBoolean(sLinkResp) ){
						sWarningAboutLinksToExternalResources = "<B>De selectie bevat "+(aLemmaIds.length>1?"lemmata die gekoppeld zijn":"een lemma dat gekoppeld is")+" aan een externe bron.</B><BR><BR>"
					}
	
					fn.confirm("Let op!", sWarningAboutLinksToExternalResources + "Weet u zeker dat u "+(oRows.count()>1 ? "deze "+oRows.count()+" lemmata":"dit lemma")+" wilt verwijderen?", 
						function(resp){
	
							// check if the selection contains lemmata that are locked
	
							var iLockedLemmata = 0;
							oRows.every(function(){
								var locked = fx.getDataFromCellInRow(this, "locked");
								if ( lexutil.translateBoolean(locked) )
									iLockedLemmata++;
							});
							if (iLockedLemmata>0) {
								fn.message("Helaas", iLockedLemmata + " lemma"+(iLockedLemmata>1?"ta":"")+ " in de selectie "+(iLockedLemmata>1?"zijn":"is")+" gelocked. <BR><BR>Verwijderen kan niet doorgaan.");
								return false;
							}
	
	
							// now loop through the list of lemmata to be deleted
	
							oRows.every(function(){
	
								var oRow = this;
								var bLastRow = fx.isLastRowOf(oRow, oRows);
	
								// check if the selection contains lemmata linked to ANW or so
								
								var sLemmaId = fx.getDataFromCellInRow(oRow, "lemma_id");
								var sLemma = fx.getDataFromCellInRow(oRow, "modern_lemma");
	
								fn.callService(sLinksToMolexApiURL+"/links/"+sLemmaId, {}, "GET", "json", 
									function(resp){
	
										// check the status: it must be OK, otherwise cancel it all
	
										var oStatus = resp.status;
	
										if (oStatus.ok != true) {
											fn.message("Helaas", "De links-to-molex service heeft status '"+oStatus.ok+"'.<BR><BR>Verwijderen kan niet doorgaan.");
											return false;
										}
	
										// check if some ANW links exist
	
										var oLinks = (bLinksToMolexCheck ? resp.links : []);
										var sInfoForUser = "";
	
										if (oLinks.length > 0){
	
											var aSources = new Array();
											for (var i=0; i<oLinks.length; i++){
	
												var sSrcResource = oLinks[i].srcResource;
												var sArticleLemma = oLinks[i].articleLemma;
												var sSrcType = oLinks[i].srcPidType;
												if (aSources.indexOf(sSrcResource)<0)
													aSources.push(sSrcResource);
	
												sInfoForUser += "<ul>";
												sInfoForUser += "<li>Gelinkt met <B>"+sSrcResource+"-lemma</B> '"+sArticleLemma+"' "+
													(sSrcType == 'artikel' ? "" : ", "+"<B>"+sSrcType+"</B> " + oLinks[i].srcPidDescription+"</li>");																										
												sInfoForUser += "</ul>";
											}
											
											fn.message("Helaas", 
												"Lemma '"+sLemma+"' (id "+sLemmaId+") is gelinkt met "+aSources.join("/").toUpperCase()+".<BR><BR>Het mag dus niet worden verwijderd."+
												"<BR><BR><u>Extra informatie</u>:"+sInfoForUser);
											return false;
										}
										
										fn.showProcessingMsg(t);
										
										// slight delay to allow processing message to appear 
										setTimeout(function(){		
										
											// ready for full job now:
											
											// first: if this lemma is a diminutive
											// we need to delete the diminutive analysis as well, 
											// so check if it exists.
										
											fn.callFunction(sApiSchema+".unlink_verkleinwoord", [sLemmaId], 
												function(){								
													// done													
												}, 
												function(err){
													fn.removeProcessingMsg(t);
													fn.message("Let op", "Het verwijderen van de morfologische analyse van '"+sLemma+"' (id "+sLemmaId+") is door de database verhinderd.");
													return false;
												});
										
											fn.callFunction(sApiSchema+".find_diminutive_lemma", 
													[sLemmaId], 
													function(aColumns){					
												
												// second: if some other lemma happens to be a diminutive
												// constructed with this lemma, delete this diminutive analysis 
												
												var sMorphAnalysisId = 		aColumns["morphological_analysis_id"];
												var sVerkleinwoordLemId =	aColumns["verkleinwoord_lemma_id"];
												
												if (sMorphAnalysisId != '') {
													
													// remove diminutive from morphological analysis
													// do target the exact diminutive analysis [dim <-> part-lemma]
													
													fn.callFunction(sApiSchema+".unlink_verkleinwoord", [sVerkleinwoordLemId, sLemmaId], 
														function(){										
															// done
														}, 
														function(err){
															fn.message("Let op", "Het vewijderen van de morfologische analyse van lemma-id "+sVerkleinwoordLemId+", waarvan '"+sLemma+"' (id "+sLemmaId+") een deel-lemma is, is door de database verhinderd.");
															fn.removeProcessingMsg(t);
															return false;
														});												
												}
												
											});
										
										
											// main job: remove the lemma
											
											fn.removeFromDatabaseGivenFieldValues("lemmata", 
												{"lemma_id": sLemmaId}, 
												function(){
													if (bLastRow)
														fn.refreshTable(t);
												},
												function(err){
													fn.message("Let op", "Het verwijderen van '"+sLemma+"' (id "+sLemmaId+") is door de database verhinderd (is het lemma gelokt?)");
													fn.removeProcessingMsg(t);
													return false;
												}
											);
										
										}, 100); // slight delay
											
	
	
									}, // end of service response processing
									
									{}, // extra params to service
								
									function(){ // service error handler
	
										fn.message("Helaas", "Het opvragen van informatie over gelinkte lemmata is mislukt.<BR><BR>Zonder deze controle kan verwijderen niet doorgaan.");
										return false;
	
									}
	
								); // end of service call
	
							});
	
						}, 
						function(){
							fn.message("OK", "Operatie door gebruiker geannuleerd");
	
						}
					);
	
				});
	
			} // end of click event processing
			
		},
		
		"button_2": {
			"name": "Kies broeder:",
			"bgcolor":"yellow",
			"textcolor": "red",
			"click": function(t){
				
				var oRow = fx.getFirstSelectedRowFrom(t);
				
				if (oRow.any())
					{
					// remember chosen brother, and show it on the screen
					var sLemId = fx.getDataFromCellInRow(oRow, "lemma_id");
					var sLemma = fx.getDataFromCellInRow(oRow, "modern_lemma");
					
					fn.setCustomButtonName(t, 2, "Gekozen broeder:<b>"+sLemma+"</b>");
					molexlem.sBrotherLemmaId = sLemId;
					}
				
				// press shift + click to cancel parent selection 
				if (kf._getPressedKey() == 'shift')
				{
				fn.setCustomButtonName(t, 2, "Kies broeder:");
				molexlem.sBrotherLemmaId = null;
				}
	
			}
		},
		
		"button_3": {
			"name": "Link broeders",
			"bgcolor":"red",
			"textcolor": "yellow",
			"click": function(t){
				
				if (molexlem.sBrotherLemmaId != null)
					{
					var oNodes = fx.getSelectedRowsFrom(t);
					if (oNodes.any())
						{
						
						oNodes.every(function(){
							
							var sLemId =	fx.getDataFromCellInRow(this, "lemma_id");
							var bLastNode =	fx.isLastRowOf(this, oNodes);
							
							
							fn.callFunction(sApiSchema+".link_lemmata_as_brothers", [sLemId, molexlem.sBrotherLemmaId], 
									
									function(){
										if (bLastNode)
											fn.refreshTable(t);										
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
					alert("Kies eerst een broer-lemma om mee te linken!");
					}
			}
		},
		
		"button_4": {
			
			"name": "Unlink broeder",
			"bgcolor":"red",
			"textcolor": "yellow",
			"click": function(t){
				
				var oNodes = fx.getSelectedRowsFrom(t);
				if (oNodes.any())
					{
					oNodes.every(function(){
						
						var sLemId =	fx.getDataFromCellInRow(this, "lemma_id");
						var bLastNode =	fx.isLastRowOf(this, oNodes);
						
						
						fn.callFunction(sApiSchema+".unlink_lemma", [sLemId], 
								
								function(){
									if (bLastNode)
										{
										fn.refreshTable(t);
										// reset: no chosen parent
										fn.setCustomButtonName(t, 2, "Kies broeder:");
										molexlem.sBrotherLemmaId = null;		
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
		
		"button_5": {
			
			"name": "Paradigma_view",
			"bgcolor": "yellow",
			"textcolor": "black",
			"click": function(t){
				
				molexparadigm.bReadableParadigmMode = true;		
				
				var xPos = $("#lemmata_en_paradigma_view_dynamic").css("left");
				var yPos = $("#lemmata_en_paradigma_view_dynamic").css("top");
				
				tb.destroyTable("lemmata_and_paradigm_view", function(){
					
					var sLemmaId = fx.getDataFromCellInRow(fx.getFirstSelectedRowFrom(t), "lemma_id");
					
					conf.changeTableConfigValue("lemmata_and_paradigm_view", "modern_lemma", "visible", false);
					conf.changeTableConfigValue("lemmata_and_paradigm_view", "lemma_pos", "visible", false);
					conf.changeTableConfigValue("lemmata_and_paradigm_view", "lem_keurmerk", "visible", false);
					conf.changeTableConfigValue("lemmata_and_paradigm_view", "gedrukt", "visible", false);
					conf.changeTableConfigValue("lemmata_and_paradigm_view", "online", "visible", false);
					
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
			
		},
				
		"button_6": {
			
			// molex  knop 'verkleinwoord' aanmaken bij geselecteerd lemma
	        // webservice van jesse wordt aangeroepen voor afbreking
	        // dan dialog tonen met vooraf ingevoerde maar editeerbaar verkleinwoord
	        //  en vooraf ingevoerde maar editeerbare afbreking,   en ook vooraf ingevoerde pos NOU-C(gender=n)
	        //  link tussen lemma en verkleinwoord wordt automatisch aangemaakt,  en paradigma wordt gegenereerd  �. +s
	
			"name": "Maak verkleinwoord",
			"bgcolor": "white",
			"textcolor": "black",
			"click": function(t){
				
				// start diminutive construction
				molexdims.start(t);
			}
			
		},
				
		"button_7": {
			
			"name": "MWE verbinden",
			"bgcolor": "lightgreen",
			"textcolor": "black",
			"click": function(t){
				
				// get the selected lemma
				var oRow = fx.getFirstSelectedRowFrom(t);
				var sMweLem = fx.getDataFromCellInRow(oRow, "modern_lemma");
				var sMweEntryType = fx.getDataFromCellInRow(oRow, "entry_type");
				var sMweLemId = fx.getDataFromCellInRow(oRow, "lemma_id");
	
				
				if ($.startsWith(sMweEntryType, "MWE")) {
					fn.showProcessingMsg(t);
					setTimeout(function(){
						molexlib.fnBuildMweLemmaLinks(sMweLemId, sMweLem);
					}, 100);
					
				}
				else {
					fn.message("Let op", "Deze functie werkt alleen met MWEs");
				}					
				
			}
		},
				
				
		"contextmenu": {
					
			// here the structure of the contextmenu is given
	        "items": {                    
	            "unlink": {"name": "<b>Unlink verkleinwoord</b>", "isHtmlName": true}
	        },
	        // callback function called after the user has chosen an option in the context menu
			"callback": function(t, n, key, options) {
				
				var oRow = fx.getRow(fn.getRowNode(n));
				var sVerkleinwoordId = fx.getDataFromCellInRow(oRow, "lemma_id");
	                	
				// key indicates the option the user has chosen
				if (key == 'unlink') {
					
					fn.confirm("Let op", "Elke koppeling met dit verkleinwoord zal worden verwijderd.<BR><BR>Weet u zeker dat u dit wilt?",
					
						function(){
							fn.callFunction(sApiSchema+".unlink_verkleinwoord", [sVerkleinwoordId], function(){	                    		
			            		fn.refreshTable(t);
			        		});
						},
						function(){
							fn.message("OK", "Operatie door gebruiker geannuleerd");
						} 
					);
	                
				}
			}
		}
	},
	
	
	related_lemmata: {

		"group": "Checklijstjes",
		
		"button_0": {
			"name": "Remove related group",
			"click": function(t, n){
				
				var nRow = fn.getFirstSelectedRowNodeFrom(t);
				
				if (nRow == null) {
					fn.message("Let op" , "Selecteer eerst een rij waarvan de groep weg moet!");
				}
				else {
					var sGrId = fn.getDataFromCellInRowNode(nRow, "relation_group_id");
					
					fn.confirm("Verwijderen?", "Wilt u echt groep "+sGrId+" verwijderen?", 
						function(){
							fn.removeFromDatabaseGivenFieldValues("related_lemmata", {"relation_group_id": sGrId}, 
									function(){
										fn.refreshTable(t);
									});
						}, 
						function(){
							fn.message("OK", "Operatie geannuleerd door gebruikers");
						})						
				}
			}
		}
		
	}
	
};

molexlem.config = {
	
	lemmata: {
	
		"locked": {
				"visible": false
		},
		
		"gigant_superlemma_id": {
			"nice_name": "gigant_id"
		},
		
		"ww_feat": {
			"click": function(t, n){
				var  sLemmaId = fn.getDataFromSiblingNode(n, "lemma_id");
				fn.callDatabase("werkwoord_features", {"lemma_id": sLemmaId}, function(){fn.scrollToTable("werkwoord_features");});
			}
		},

		"entry_type": {
			"editable": true
		},
		
		"gb_superid": {"visible": false},
		"gb_wrdcat": {"visible": false},
		"gb_znwlid": {"visible": false},
		"lidw": {"visible": false},
		"geslacht": {"visible": false},
		"creation_date": {"visible": false},
		"creation_time": {"visible": false},
		
		
        "source_id": {
            //"editable": superUser()
            //"nice_name": "src",
        	"click": function(t, n){
        		if (superUser()) { 
        			var sContent = fn.getDataFromCellNode(n);
        			var sAnders = "Anders";
        			var aSourcesToChooseFrom = ["ANW-koppeling", sAnders];
        			
        			fn.promptSelect(["Kies source", "Kies source"], aSourcesToChooseFrom, [],
    						
    						function(aChoice){
        				
        						var sChoice = aChoice[0];
        						
        						if (sChoice == sAnders) {
        							fn.prompt("Vul in", ["source"], [sContent], 
        								function(sourceRep){
        									fn.updateDatabaseGivenANode(n, {"source_id": sourceRep["source"]}, function(){
        										fn.refreshTable(t);
        									});
        								}, 
        								function(){
            								fn.message("OK", "Operatie door gebruiker geannuleerd");
            							},
    									true,
    									[30,5]);
        						}
        						else {
        							fn.updateDatabaseGivenANode(n, {"source_id": sContent + (sContent == ""?"":"; ") + sChoice}, 
        								function(){
    										fn.refreshTable(t);
        								});
        						}
    							
    						}, 
    						function(){
    							fn.message("OK", "Operatie door gebruiker geannuleerd");
    						}, 
    						true); // only one choice allowed
    			}
        	}
        },
			
        "subset": {
        	
        	"click": function(t, n){
        		if (superUser() ) {
        			var aSubsetsToChooseFrom;
        			var aAlreadyChosen = fn.getDataFromCellNode(n);
        			fn.callFunction(sApiSchema+".get_not_yet_released_subsets", [], function(resp){
        				
        				aSubsetsToChooseFrom = (resp["get_not_yet_released_subsets"]).split("\|");
        				fn.promptSelect(["Lijst van nog niet uitgevoerde releases", "Kies subset"], aSubsetsToChooseFrom, aAlreadyChosen,
        						
        						function(aChoice){
        							fn.updateDatabaseGivenANode(n, {"subset": aChoice[0]}, function(){
        									fn.refreshTable(t);
        							});
        						}, 
        						function(){
        							fn.message("OK", "Operatie door gebruiker geannuleerd");
        						}, 
        						true); // only one choice allowed
        				
        			});
        		}
        	},
//                "editcallback": function(t, n, value){
//                	fn.callFunction(sApiSchema+".check_subset_is_already_released", [value], function(response){
//                		
//                		if (response["check_subset_is_already_released"] == 't')
//                			{
//                			fn.message("Let op!", "Release '"+value+"' kan niet gekozen worden: deze is al uitgevoerd.");
//                			fn.updateDatabaseGivenANode(n, {"subset": n.revert}, function(){
//                				fn.refreshTable(t);
//                				});
//                			}
//                	});
//                }
        },
			
		// lemma_id
		"lemma_id":{				
			"visible": true
		},
		"gb_id":{		
			"visible": false		
			//"editable": superUser()
		},
		
		
		// parent
		
		"molex_lemma": {
			"cell_tooltip": "Toon alle lemmata behorend bij dit molex_lemma",
			"click": function(t, n){
				
				var sLemma = fn.getDataFromCellNode(n);
				
				if (sLemma!='')
					fn.callDatabase(t, {"molex_lemma": sLemma});
			},
			"visible": true
		},
		"molex_lemma_id": {
			"nice_name": "molex_id"
		},
		
		// lemma part
		"modern_lemma": {		
			
			"colsort": "asc",
			"editable": true,
			"editfunc": function( t, n, value){
				
				var lemId = fn.getRowNodeId(n);
				
				fn.callFunction(sApiSchema+".find_existing_lemma", 
						[value, null], 
						function(response){
							resp = response["find_existing_lemma"];
							
							// lemma exists! What now?
							if (resp != null && resp != '')
								{
								fn.confirm("Let op!", "U heeft de spelling van het lemma veranderd naar '"+value+"'.<BR><BR>" +
										"In de database bestaat echter al het volgende: "+resp+"<BR>" +
										"Weet u zeker dat u dit lemma zo wilt aanpassen?", 
										function(){
									
											fn.updateDatabaseGivenANode(n, {"modern_lemma": value});
									
										}, 
										function(){
											
											fn.message("OK", "Operatie door gebruiker geannuleerd.");
											fn.refreshTable(t);
											
										});
								}
					
							// normal behaviour
							else
								{
								fn.updateDatabaseGivenANode(n, {"modern_lemma": value});										
								}						
					
				});
			}
		},

		"tags": {

			"visible": false,
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
							fn.updateDatabaseGivenANode(n, {"tags": sChosenItems}, function(){
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
		
		"lemma_pos": {				
			"editable": true,
			"editerrorhandler": function(jqXHR, textStatus, errorThrown){
				fn.message("Foute boel!", "alert: ongeldige waarde voor veld lemma_pos!", function(){fn.refreshTable("lemmata");});
				},


//				"click": function(t, n){
//					
//					var oCell = fx.getCell(n, "modern_lemma");
//					var lemmaform = fx.getDataFromCell(oCell);
//					
//					fn.showProcessingMsg(t);
//					
//					fn.callFunction(sApiSchema+".get_biggest_final_matcher", [lemmaform], function(output){
//						
//						fn.removeProcessingMsg(t);
//						fn.message("Resultaat", output["get_biggest_final_matcher"]);
//					});
//					
//				},
			"editcallback": function(t, n, value){

				var iLemmaId = fn.getDataFromSiblingNode(n, "lemma_id");

				// synchronize with spatielemmata
				fn.updateDatabaseGivenFieldValues("spatielemmata", {"lemma_id": iLemmaId}, {"lemma_pos": value});
				
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
			"visible": (document.URL.indexOf( "ivdnt.loc" )>-1),
			// ------------------------------
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
			},
			"editerrorhandler": function(jqXHR, textStatus, errorThrown){
				fn.message("Let op!", "U probeert in veld 'nuanc_opm' een ongeldige waarde in te voeren!<BR><BR>Gebruik de waarden aangeboden door de autocomplete-functie!", function(){fn.refreshTable("lemmata");});
				}
		},
		"kapstok": {
			"visible": false,
			"editable": true
		},
		"trademark": {
			"editable": true,
			"visible": false
		},
		"taaladvies": {
			"class": "inlfont10pt nobreak",
			"editable": true,
			"editfunc": function(t, n, value){
				value = value.replace(/https:\/\/taaladvies.net/, '');
				fn.updateTableGivenANode(n, {"taaladvies": value }, function(){
					fn.refreshTable(t);
				});
			}
		},
		"uitspraak": {
			"class": "nobreak",
			"ellipsis": true,
			//"render": function(value) {
			//	// remove '; ' in front
			//	if (value.startsWith("; "))	value = value.substring(2);
			//	return value;
			//},
			"visible": false,
			"searchpreprocess": function(value){ 
				// automatically translate the generic 'g' into a phonetic 'g'
				return value.replace(/g/g, "ɡ");
			}
			// mustn't be editable, since it's automatically filled with content from uitspraak table
		},
		"status": {
			"editable": true
		},
			
					
		
		// buttons
		"toon_paradigma":{
			"visible": false,
			"button": "Paradigma",
			"click": function(t, n){	
				
				var lemma_id = fn.getDataFromSiblingNode(n, "lemma_id");
				
				fn.callDatabase("lemmata_and_paradigm_view", 
						{"lemma_id": lemma_id}, 
						function(){
							fn.scrollToTable("lemmata_and_paradigm_view");
						}, 
						{ignore_initialisation_filters: true});
			}
		},
		"toon_morfologie":{
			"visible": false,
			"button": "Morfologie",
			"button_tooltip": "Toon hoofdlemma<BR>[+Shift] Toon constructies met dit lemma",
			"click": function(t, n){	
				
				var lemma_id = fn.getDataFromSiblingNode(n, "lemma_id");
				if (kf.isPressed("shift")){
					fn.callDatabase("morphological_view", 
						{"part_lemma_id": lemma_id}, 
						function(){
							fn.scrollToTable("morphological_view");
						});
				}
				else {
					fn.callDatabase("morphological_view", 
						{"main_lemma_id": lemma_id}, 
						function(){
							fn.scrollToTable("morphological_view");
						});

				}
				
			}
		},
		
					
		
		// origin
		"taalvariant": {
			"editable": true
		},
		"herkomst": {
			"editable": true,
			"visible": false
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
		
		"has_fonet": {
			"visible": false
		},
		
		"verkleinwoord": {
			"editable": true
		}
			
	},
	
	
	parents: {
		
	}
};