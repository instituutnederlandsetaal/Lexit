
var hilexlem = {};


hilexlem.settings = {
	
	"gigant_superlemmata" : {
		
		"exact_count": true,
		"width": "60%"
	},

	"lemma_variants": {

		"columns_sorting": {"modern_lemma": "asc", "lemma_id": "asc", "lemma_variant": "asc"},

		"width": "80%",
		"exact_count": true,

		"button_0": {
			"name": "Voeg variant toe",
			"click": function(t){

				var nRow = fn.getFirstSelectedRowNodeFrom(t);

				if (nRow == null || nRow.length == 0){

					fn.message("Let op", "Kies één lemma waaraan een variant toegekend moet worden");
				}
				else {

					var iLemmaId = fn.getDataFromCellInRowNode(nRow, "lemma_id");
					var sLemma = fn.getDataFromCellInRowNode(nRow, "modern_lemma");
					var sWdb = fn.getDataFromCellInRowNode(nRow, "source_id");

					fn.prompt(
						["Voeg nieuwe variant toe", "Voer één of meer nieuwe varianten. Indien nodig, gebruik een komma als scheidingsteken"], 
						["Varianten"],
						[sLemma], 
						function(resp){
							
							fn.closeDialog();

							fn.callFunction(sApiSchema+".get_variants_of_lemma", [iLemmaId], function(varResp){

								// parse response
								var sLemAndVariants = varResp["get_variants_of_lemma"];

								var aLemAndVariants = sLemAndVariants.split("###");
								var aVariantsAlreadyThere = aLemAndVariants.length > 1 ?
									(aLemAndVariants[1]).split(", ")
									:
									[];


								fn.showProcessingMsg(t);
								var aNewVariants = (hilexutils.setCommasRight(resp["Varianten"])).split(", ");


								// remove known variants from input
								aNewVariants = aNewVariants.filter(function(x){
									return aVariantsAlreadyThere.indexOf(x) < 0;
								});


								// process variants to be inserted
								for (var i=0; i<aNewVariants.length; i++){

									fn.insertIntoTable(t, 
										{"lemma_id": iLemmaId, "modern_lemma": sLemma, "source_id": sWdb, "lemma_variant": aNewVariants[i]}, 
										null, // not return field 
										function(){ 
											if (i == aNewVariants.length-1){
												setTimeout(function(){fn.refreshTable(t);}, 500);
											}											
										}
									); 
								}

								// but if there are none (probably because of filtering of pre-existing variants) then do refresh only
								if (aNewVariants.length == 0)
									fn.refreshTable(t);

							});

							

						} 
					); // end of prompt

				}
			}
		},

		"button_1": {
			"name": "Verwijder variant",
			"click": function(t){

				var aRows = fn.getSelectedRowNodesFrom(t);
				$(aRows).each(function(){
					var nRow = this;
					fn.removeFromDatabaseGivenANode(nRow, function(){
						if (fn.isLastNodeOf(nRow, aRows))
							setTimeout(function(){fn.refreshTable(t);}, 500);
					});
				});

			}
		},

		"callback": function(t){
			
			var iPreviousLemId = null;
			var bPreviousMultiple = false;
			var aRows = fn.getAllRowNodes(t);
			
			// make sure the user can easily distinguish groups in the view
			// by adding lines between groups, and adding color to groups with more than one member
			
			var iIdx = 0;
			var aColor = ["#0404B4", "#61210B"];
			var aBold = ["bold", "normal"];
			
			$(aRows).each(function(i){
				
				var thisRow = this;

				var iLem = fn.getDataFromCellInRowNode(thisRow, "lemma_id");
				var bMultiple = lexutil.translateBoolean( fn.getDataFromCellInRowNode(thisRow, "multiple") );
				var bNewGroup = (iLem != iPreviousLemId);
				
				// have we got a new group of variants?
				// add a top border on the first row of the group
				if (i>0 && bNewGroup){
					$(thisRow).find("td").css("border-top", "1px solid black");	
				}

				// compute next group rendering idx 
				// if we're in a new group
				if (bMultiple && bNewGroup){
					if (bPreviousMultiple) iIdx++;	
					if (iIdx > 1) iIdx = 0;
				}

				// apply appropriate style
				// if we have multiples, make groups visible with another color
				$(thisRow).find("td")
					.css("font-weight", (bMultiple ? aBold[iIdx]:"normal"))
					.css("color", (bMultiple ? aColor[iIdx] : "#000000"));

				
				// we need to remember this lemma-id for next round
				// so as to detect when we're dealing with another group
				iPreviousLemId = iLem;
				bPreviousMultiple = bMultiple;

			});
		},

		"repeat_callback": true
	},
	
	
	lemmata: {

		"width": "95%",
		"exact_count": true,

		"columns_order": [
			"gigant_superlemma_id",
			"hilex_lemma_id",
			"hilex_lemma",			
			"lemma_id",
			"modern_lemma",
			"entry_type",
			"lemma_variants",
			"gloss",
			"persistent_id",
			"lemma_pos",
			"source_id",			
			"opmerking",
			"online",
			"multi_part",
			"citations"
		],
		
		"keyup" : {
			
			"@": function(t){
				
				var oRow = fx.getFirstSelectedRowFrom(t);
				$(fx.getCellNode(oRow, "lemma_pos")).click();
			},
			
			"insert": function(t){
				
				var oRow = fx.getFirstSelectedRowFrom(t);					
				$(fx.getCellNode(oRow, "lemma_pos")).click();
			},
			
			"f9": function(t){
				
				var oRow = 			fx.getFirstSelectedRowFrom(t);					
				var sWdb = 			fx.getDataFromCellInRow(oRow, "source_id");
				var iPersistentId =	fx.getDataFromCellInRow(oRow, "persistent_id");
				
				// remove illegal string parts, which would cause an error in the GTB 
				sWdb = sWdb.replace("_DIM", "");
				
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
			
			// lemmata locks
			
			var sTableName = fn.getTableName(t);
			
			// build the UNlock button if it doesn't exist yet
			// (superuser only)
			if ( hilexlib.superUser() && fn.getIndexOfButtonNamed(sTableName, "(Un)lock")<0){
				fn.addCustomButton(sTableName, {
					"name": "(Un)lock",
					"bgcolor": "#F5D0A9",
					"click": function(t){
						
						var oSelectedRows = fx.getSelectedRowsFrom(t);
						
						oSelectedRows.every(function(){
							
							var sLemmaId = 		fx.getRowId(this);
							var sMultilemmaId =	null;
							var bLastRow = 		fx.isLastRowOf(this, oSelectedRows);
							
							if ($.inArray( hilexlib.comma(sLemmaId, sMultilemmaId), aCurrentLemmaViewLocks ) >-1){
								fn.callFunction(
									sApiSchema+".unlock_lemma", 
									[hilexlib.deEmpty(sLemmaId), hilexlib.deEmpty(sMultilemmaId)], 
									function(){
										if(bLastRow) fn.refreshTable(t);
									}
								);
							}
							else {
								fn.callFunction(
									sApiSchema+".lock_lemma", 
									[hilexlib.deEmpty(sLemmaId), hilexlib.deEmpty(sMultilemmaId)], 
									function(){
										if(bLastRow) fn.refreshTable(t);
									}
								);
							}
							
						});
						
					}
				});

			}

			var aLemmaIds = (fn.getDataFromColumn(t, "lemma_id"));				
			var sLemmaIds = aLemmaIds.join(", ");

			// make sure the value of 'multi_part' is up to date,
			// and render the current values (normally a table refresh would be good enough
			// but not here, in the callback, as this would trigger an infinite loop)
		
			fn.callFunction(sApiSchema+".update_multi_lem_window", [sLemmaIds], function(resp){

				resp = resp["update_multi_lem_window"];

				var aLemIdsAndMultiLem = resp.split('###');
				for (var i=0; i<aLemIdsAndMultiLem.length; i++){

					var aLemIdAndMultiLem = (aLemIdsAndMultiLem[i]).split(":");
					var iLem = parseInt( aLemIdAndMultiLem[0] );
					var bMultiLem = aLemIdAndMultiLem[1] == 'true';
					var nRow = fn.getRowNodeWhere(t, {"lemma_id": iLem});
					$(nRow).find("td.multi_part").find("input").eq(0).prop("checked", bMultiLem);
				}


				// Apply lemmata locks
		
				var aLemmaIdsArr =	new Array();
				var oRows = 		fx.getAllRows(t);
				
				oRows.every(function(i){
					
					var sLemmaId =		fx.getRowId(this);
					var sMultilemmaId =	null;
					
					aLemmaIdsArr.push( hilexlib.comma(sLemmaId, sMultilemmaId) );
				});
				
				
				// get the list of locked lemmata
				// and modify the rows accordingly
				fn.callFunction(sApiSchema+".get_locks_of_lemmata", [ fn.quote( aLemmaIdsArr.join("|") ) ], function(){
					
					aCurrentLemmaViewLocks = (fn.getFunctionOutput()[0]).split("|");
					
					oRows.every(function(i){
						
						var oThisRow = 		this;
						var sLemmaId = 		fx.getRowId(oThisRow);
						var sMultilemmaId =	null;
						
						if ( $.inArray( hilexlib.comma(sLemmaId, sMultilemmaId), aCurrentLemmaViewLocks ) >-1 )
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
				
			});
			
		},
		"repeat_callback": true,
		
		
		"button_0":{
			"name": "Verwijder lemma",
			"click": function(t){
				
				if (fn.getNumberOfSelectedRowNodes(t) == 0) {
					fn.message("Let op", "Kies een lemma om te verwijderen.");
				}
				else {
					fn.confirm("Zeker weten?", "Alle geselecteerde lemmata zullen nu verwijderd worden," +
							"en ook de daaraan gekoppelde paradigmata", function(){							
						
						var oSelection = fx.getSelectedRowsFrom(t);
						
						oSelection.every(function(){	
							
							var sLemId = 	fx.getDataFromCellInRow(this, "lemma_id");
							var bLastRow =	fx.isLastRowOf(this, oSelection);
							
							fn.callFunction(sApiSchema+".delete_lemma", [sLemId], function(){									
								if (bLastRow) 
									fn.refreshTable(t);									
								});
						
							});							
						
						});
					
					
					
					}
				
				
			}
		},
		"button_1": {
			
			"name": "Maak HiLex-lemma aan",
			"tooltip": "Ken dit lemma een nieuw HiLex-lemma-id toe.",
			"bgcolor": "green",
			"click": function(t){
					
				var oRow = fx.getFirstSelectedRowFrom(t);
				
				if ( oRow.count()!=1 )
					{
					fn.message("Let op!", "Kies één lemma!" +
							"Dan pas kan daar een nieuw HiLex-lemma aan toegekend worden");
					}
				else
					{
					var sLemmaId = fx.getDataFromCellInRow(oRow, "lemma_id");
					var sModlem = fx.getDataFromCellInRow(oRow, "modern_lemma");
					
					fn.confirm("Maak HiLex-lemma aan", "Er zal een nieuw HiLex-lemma-id worden aangemaakt, " +
							"en daar zal het lemma '"+sModlem+"' onder komen te hangen. " +
							"Weet u zeker dat u dat wilt?", function(){
						
						fn.callFunction(sApiSchema+".create_new_super_lem", [sLemmaId], function(){
							
							fn.refreshTable(t, function(){
								if (fn.tableExists("lemmata_and_paradigm_view"))
									fn.refreshTable("lemmata_and_paradigm_view");
							});
							
						});
						
					});
					
					
					}						
				
			}				
			
		},
		"button_2": {
			
			"name": "Gekozen HiLex-lemma:",
			"tooltip": "Klik om het (in de tabel) geselecteerde lemma te kiezen als HiLex-lemma.",
			"bgcolor":"yellow",
			"textcolor": "red",
			"click": function(t){
				
				var oRow = fx.getFirstSelectedRowFrom(t);
									
				if ( oRow.any() ){
					// remember chosen HiLex-lemma, and show it on the screen
					var sSuperLemId = fx.getDataFromCellInRow(oRow, "hilex_lemma_id");
					
					fn.callFunction(sApiSchema+".get_hilex_lemma", [sSuperLemId], function(resp){
						var sSuperLemma = resp["get_hilex_lemma"];
						fn.setCustomButtonName(t, 2, "Gekozen HiLex-lemma:<b>"+sSuperLemma+"</b>");
						sChosenSuperLemId = sSuperLemId;
					});						
					
				}
				
				// press shift + click to cancel parent selection 
				if (kf._getPressedKey() == 'shift'){
					fn.setCustomButtonName(t, 2, "Gekozen HiLex-lemma:");
					sChosenSuperLemId = null;
				}
			}
		},
		"button_3":{
			"name": "Link HiLex-lemma",
			"tooltip": "Koppel het (in de tabel) geselecteerde lemma met het gekozen HiLex-lemma.",
			"bgcolor":"red",
			"textcolor": "yellow",
			"click": function(t){
				
				fn.confirm("Lemma en HiLex-lemma linken", "Weet u het zeker?", function(){
					
					if (sChosenSuperLemId != null) {

						var oRows = fx.getSelectedRowsFrom(t);
						if (oRows.any()){
							
							oRows.every(function(){
								
								var sLemId = 	fx.getDataFromCellInRow(this, "lemma_id");
								var bLastNode =	fx.isLastRowOf(this, oRows);
								
								fn.updateDatabaseGivenFieldValues("lemmata", 
										{"lemma_id": sLemId}, 
										{"hilex_lemma_id": sChosenSuperLemId}, 
										
										function(){
											
											if (bLastNode){												
												fn.refreshTable(t, function(){
													if (fn.tableExists("lemmata_and_paradigm_view"))
														fn.refreshTable("lemmata_and_paradigm_view");
												});
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
		"button_4": {
			
			"name": "Unlink HiLex-lemma",
			"tooltip": "Koppel het (in de tabel) geselecteerde lemma los van zijn HiLex-lemma. Daardoor krijgt dit lemma een nieuw HiLex-lemma-id.",
			"bgcolor":"red",
			"textcolor": "yellow",
			"click": function(t){
				
				
				fn.confirm("Lemma en HiLex-lemma unlinken", "Weet u het zeker?", function(){
					
					var oRows = fx.getSelectedRowsFrom(t);
					if (oRows.any()){
						
						oRows.every(function(){
							
							var sLemId = 	fx.getDataFromCellInRow(this, "lemma_id");
							var bLastNode =	fx.isLastRowOf(this, oRows);
							
							fn.callFunction(sApiSchema+".create_new_super_lem", [sLemId], function(){
								
								if (bLastNode){												
									fn.refreshTable(t, function(){
										if (fn.tableExists("lemmata_and_paradigm_view"))
											fn.refreshTable("lemmata_and_paradigm_view");
									});
								}
								
							});
						
						});
					}
					else {
							fn.message("Let op", "Kies een of meerdere lemmata!");
					}
					
				});
				
			}				
		}
	},
	
};


hilexlem.config = {
	
	lemma_variants: {

		"lemma_id": {
			"click": function(t, nCell){
				var iLemId = fn.getDataFromCellNode(nCell);
				fn.callDatabase("lemmata", {"lemma_id": iLemId}, function(){
					fn.callDatabase("lemmata_and_paradigm_view", {"lemma_id": iLemId});
				});
			}
		},

		"lemma_variant": {
			"editable": true,
			"editcallback": function(t, n){
				fn.refreshTable(t);
			}
		},
		"main_variant": {
			"editable": true,
			"editcallback": function(t, n){
				var iLemmaId = fn.getDataFromSiblingNode(n, "lemma_id");
				var aRow = fn.getAllRowNodesWhere(t, {"lemma_id": iLemmaId});
				$(aRow).each(function(){
					var nRow = this;
					fn.callRecord(nRow, ["modern_lemma", "lemma_variant", "main_variant", "multiple"], function(){
						
						$(nRow).find("td").eq( fn.getVisibleColumnNumberOf(t, "multiple") ).find("input").attr("disabled", "disabled");
					});
				});
			}
		},
		"opmerking": {
			"editable": true,
			"editcallback": function(t, n){
				fn.refreshTable(t);
			}
		},
		"lemma_variant_id": {
			"visible": false
		}
	},
	
	
	lemmata: {
		
		"gigant_superlemma_id": {
			"nice_name": "gigant_id"
		},
			
		"lemma_id": {
			"width": "30px",
			"click": function(t, nCell){
				var sLemId = fn.getDataFromCellNode(nCell);
				fn.callDatabase("lemmata_and_paradigm_view", {"lemma_id": sLemId});
			}
		},
		
		"source_id": {
		    //"nice_name": "src"
		},

		"lemma_variants": {

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

								

							});
					});

				};

				fnVariantMenu();

			} // end of click event	

		},
		
		"entry_type": {
			"editable": true
		},
		
		"gloss": {
			"editable": true
		},
		
		"citations": {
			
		},
		
		"modern_lemma": {
			"colsort": "asc",
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
					fn.refreshTable(t, function(){
					
						// small delay otherwise it won't work
						$("#"+fn.getTableName(t)).delay(500).queue(function(){

							if ( !isNaN(sLemmaId) ) {
								fn.callDatabase("token_attestations_worktable", {"lemma_id": sLemmaId});
							}

							$(this).dequeue();
						});						
					});

				}
				
			}
		},
		"lemma_pos": {
			"width": "30px",
			"nice_name": "lemma_pos",
			"editable": true,
			"editcallback": function(t, n, value){

				var oRow = 		fx.getFirstSelectedRowFrom(t);
				var sLemmaId =	fx.getDataFromCellInRow(oRow, "lemma_id");
				
				fn.refreshTable(t, function(){
					
					// small delay otherwise it won't work
					$("#"+fn.getTableName(t)).delay(500).queue(function(){

						if ( !isNaN(sLemmaId) ) {
							fn.callDatabase("token_attestations_worktable", {"lemma_id": sLemmaId});
						}

						$(this).dequeue();
					});
				});
			}
		},
		"persistent_id": {
			"click": function(t, n){
				
				var oCell = 		fx.getCell(n);
				var sWdb = 			fx.getDataFromSiblingCell(oCell, "source_id");
				var iPersistentId =	fx.getDataFromCell(oCell);
				
				// remove illegal string parts, which would cause an error in the GTB 
				sWdb = sWdb.replace("_DIM", "");
				
				window.open("http://gtb.inl.nl/iWDB/search?actie=article&wdb="+sWdb+"&id="+iPersistentId);
				
			}
		},
		
		"opmerking":{
			"editable": true
		},
		
		"online": {
			"editable": true				
		},
		"hilex_lemma_id": {
			"nice_name": "hilex_id",
			"width": "30px"
		},
		"hilex_lemma": {
			
		},
		"multi_part":{
			"width": "30px"
		}

	},
		
};
