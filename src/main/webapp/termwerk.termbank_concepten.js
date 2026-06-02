
concepts = {};

concepts.formbaseX = 4;
concepts.formbaseY = 1.5;

concepts.formWidth = 7;
concepts.formHeight = 1.5;
concepts.formTotalHeight = concepts.formHeight * 1;


concepts.bSkipDeclaration = true;

concepts.settings = {
	
	"nice_name": "Concepten",
	
	"class": "largetermbank", // apply special border styling for cells etc.
	
	"left": "20px",
	"top": sTableTopPosition,
	"viewtype": "form",
	"width": sTableTermBankWidth,
	"header_height": sTableHeaderHeight,  // might need to be bigger if more than 1 row of buttons
	
	"main_search": false,
	"export_buttons": false,
	"pagination_on_top": false,
	"pagination_at_bottom": false,
	"exact_count": true,
	"keep_small": true,
	
	"columns_button": bLexitButtonTest,
	"goto_button": bLexitButtonTest,
	"refresh_button": bLexitButtonTest,
	"replace_button": bLexitButtonTest,
	"reset_button": bLexitButtonTest,
	"selection_button": bLexitButtonTest,
	"undo_button": bLexitButtonTest,
	"help_button": bLexitButtonTest,
	"viewtype_button": bLexitButtonTest,
	
	"resizable": false,
	"draggable": false,
	
	"resize_callback": function(t, ui){
		form.updateLayout(t, true, false);
	},
	
	"preinit_callback": function(t){
		
		// set the position and visibility of fields dynamically 
		// (needed because of the dynamic form structure, defined by the user in the fields selector dialog)
		
		termfieldselector.updateFieldsVisibility();
		termfieldselector.recomputePositionsHorizontalGroups(termfieldselector.set2table["concepten"]);
			
	},
	
	"close_callback": function(t){
		//termheader.showTermBankButtons();		
	},
	
	
	"buttons": {
		
		"Maak of zoek concept": {
		
			"class": "table_header_button bitlarger1",
			"tooltip": "[<span class='tooltip_intens'>Klik</span>] Maak concept aan<BR>[<span class='tooltip_intens'>CTRL+Klik</span>] zoek in bestaande concepten",
			"click": function(t) {
				
				// ctrl pressed means we search i
				
				if (kf.isPressed("ctrl")){
					
					fn.prompt("Zoek concept", ["zoek naar"], [""], 
					function(aValues){
						// processing is done in the autocomplete function
					},
					function(){
						// cancelled
					}, 
					true, [50, 2]);
					
				}
				else {
					
					// get the current term row
					var nTermNode = util.getBestRow("termbank_termen");
					var sTermNaam = fn.getDataFromCellInRowNode(nTermNode, "term");
					var sTermId =   fn.getDataFromCellInRowNode(nTermNode, "term_id");
					
					fn.confirm("Nieuw concept", 
						"Wilt u een nieuw concept aanmaken<BR><BR>"+"voor de geselecteerde term '"+sTermNaam+"'?",
						function(){
							
							console.log("Adding new concept to concepten table");
							
							// insert a new empty concept
							fn.insertIntoTable(t, 
								{"externe_afbeelding": "", "conceptaanduiding": "", "definitie": "", "bron_van_de_definitie": "", "opmerking_bij_concept": "", "uri_externe_verwijzing": "", "externe_verwijzing": ""}, 
								
								"concept_id", // returned field 
								
								function(sConceptId){
									
									console.log("Assigning concept_id "+sConceptId+" to term_id "+sTermId);
									
									// assign the term the new concept ID
									fn.updateTableGivenANode(nTermNode, {"concept_id": sConceptId}, function(){
										
										// set filter
										//conf.changeTableConfigValue("termbank_concepten", "concept_id", "filter", sConceptId);
										
										console.log("Calling table termbank_termen with term_id "+sTermId);
										
										// now open the concept form								
										fn.callTable("termbank_termen", {"term_id": sTermId}, function(){
											
											console.log("Calling table termbank_concepten with concept_id "+sConceptId);											
											fn.callTable("termbank_concepten", {"concept_id": sConceptId});
											
											console.log("Calling table termbank_talen with concept_id "+sConceptId);											
											fn.callTable("termbank_talen", {"concept_id": sConceptId});
										});
										
									});
									
								}, 
								function(err){
									fn.message("Fout", "Er ging iets mis bij het aanmaken van het concept " + err);
								}
							);
						},
						function(){
							// cancelled
						}
					);
					
				}
				
				
			}
			
		},
		
		
		
		"Verwijder concept": {
			
			"class": "table_header_button nopadding danger",
			"click": function(t){			
				
				// get the current term row
				var nTermNode = util.getBestRow("termbank_termen");
				var sTermNaam = fn.getDataFromCellInRowNode(nTermNode, "term");
				var sTermId =   fn.getDataFromCellInRowNode(nTermNode, "term_id");	
				
				// get the selected concept to be removed
				var nConceptRow = util.getBestRow(t);
				if (nConceptRow.length == 0){
					
					fn.message("Let op!", "Er is geen concept geselecteerd.");
				}
				else {
					
					var sConceptId = fn.getDataFromCellInRowNode(nConceptRow, "concept_id");
					
					fn.confirm("Let op", 
						"Als u dit concept verwijderd, krijgen alle daarmee verbonden termen weer een leeg concept.<BR><BR>"+
						"Is dat wat u wilt?", 
						function(){
							
							// assign the terms having the to-be-removed concept ID
                            // the default concept ID of 0
							fn.updateTableGivenFieldValues("termbank_termen", {"concept_id": sConceptId}, {"concept_id": 0}, function(){
								
								// remove the concept
								fn.removeFromTableGivenANode(nConceptRow, function(){
									
									// refresh the term table to show the new concept ID
									fn.callTable("termbank_termen", {"term_id": sTermId}, function(){
										
										// reopen the concept table with the default concept ID
										fn.callTable("termbank_concepten", {"concept_id": 0});
									});
									
								});
							});							
						}, 
						function(){
							fn.message("OK", "Verwijderen geannuleerd.");
						}
					);
					
				}
				
			}
		},
		
		
		"Overzicht termen": {
			
			"class": "table_header_button nopadding",
			"click": function(t) {
				fn.closeAllTables(function(){
					
					termbank_terms.setTermsMode(true);					
					fn.callTable("termbank_termen");
				});
			}
		}
		
	},
	
	
	
	
	
	"callback": function(t){
		
		// put the custom buttons in the middle of the header
		util.putFreeButtons(t);
		
		// if in form view, put the form sections into an accordion view
		form.activateAccordion(t);
		
		
		
		// hide the length selector in form view
		if (fn.getViewType(t) == "form") {
			$("#"+fn.getTableName(t)+"_wrapper").find("#"+fn.getTableName(t)+"_length").hide();
			
			// and show the current concept ID in the header
			var nCurrentRow = util.getBestRow(t);
			var sConceptId = fn.getDataFromCellInRowNode(nCurrentRow, "concept_id");
			var sConcept = fn.getDataFromCellInRowNode(nCurrentRow, "conceptaanduiding");
			$("#"+fn.getTableName(t)+"_wrapper .top").find("#termbank_concepten_tablename").text("Concept "+sConceptId+(sConcept.trim()!='' ? ": "+sConcept:""));
		}
		else {			
			$("#"+fn.getTableName(t)+"_wrapper").find("#"+fn.getTableName(t)+"_length").show();
		}
		
		$("#"+fn.getTableName(t)+"_wrapper .top").find(".dataTables_info").text("");
		
		// make sure that we have the 3 tables on top of each other:
		// - concepts
		// - languages
		// - terms
		
		if ( !fn.tableIsOpen("termbank_talen") || !fn.tableIsOpen("termbank_termen") ) {
			
			setTimeout(function(){
				
				var sConceptId = fn.getDataFromCellInRowNode(util.getBestRow(t), "concept_id");
			
				fn.callTable("termbank_talen", {"concept_id": sConceptId}, function(){
					
					termbank_terms.setTermsMode(false);
					
					fn.callTable("termbank_termen", {"concept_id": sConceptId}, function(){
						
						util.pileUpTermbankTables(500);
						
						// make sure that the tables are active when the mouse enters them
						// (that way: dialogs apperar in the right table, not in the wrong)
						$("#termbank_concepten_dynamic").mouseenter(function(){
							fn.setActiveTable("termbank_concepten");
						});
						$("#termbank_talen_dynamic").mouseenter(function(){
							fn.setActiveTable("termbank_talen");
						});
						$("#termbank_termen_dynamic").mouseenter(function(){
							fn.setActiveTable("termbank_termen");
						});
						
						// we start here
						fn.setActiveTable("termbank_concepten");
						
					});
				});
				
			});
		
		}
		else {
			util.pileUpTermbankTables(500);
		}
		
		
		
		// if the loaded concept is the default one, disable the form fields
		// (because the default concept is should keep the way it is, thus not edited
		
		var sConceptId = fn.getDataFromCellInRowNode(util.getBestRow(t), "concept_id");
		if (parseInt(sConceptId) == 0){
			var sTableName = fn.getTableName(t);
			$("#"+sTableName+"_formsbuttons").find("button")
				.css("opacity", 0.2)
				.prop("disabled", true);
				
			$("#"+sTableName+"_form").find("input, textarea, select")
				.prop("disabled", true);
			
			$("#termbank_concepten_freebutton_verwijder_concept").find("button")
				.css("opacity", 0.2)
				.prop("disabled", true);
		}
		else {
			var sTableName = fn.getTableName(t);
			$("#" + sTableName + "_formsbuttons").find("button")
				.css("opacity", 1)
				.prop("disabled", false)
				
			$("#"+sTableName+"_form").find("input, textarea, select")
				.prop("disabled", false);
			
			$("#termbank_concepten_freebutton_verwijder_concept").find("button")
				.css("opacity", 1)
				.prop("disabled", false);
		}
		
		
		
		if ( $(".form_cellvalue.twtexteditor").length == 0){
			
			console.log("Instantiate txtexteditor for concept definition");
			
			twtexteditor("#form_cellvalue_definitie", "#form_cellvalue_definitie textarea", 'https://jsonplaceholder.typicode.com/posts?title=', function(){
				
				// txtexteditor callback called upon user's key strike
								
				$("#form_cellvalue_definitie").addClass("modified");
				$('td.termbank_concepten.definitie').addClass("modified");
	
				form.setSendButtonToSetting(sTableName, "payattention");
				form.setResetButtonToSetting(sTableName, "active");
			});
			
		}
				
		
	},
	"repeat_callback": true,
	
	"formgrid": {
		
		"definition": [30, 20],
		
		"top": sTableTopPosition,
		"bgcolor": "#EFEFEF",

		// form horizontal alignment
		"align": "center",
		
		// no search bar
		"searchbar": false,

		// buttons bar undo/save
		"buttonsbar_position": [20.3, -2.40],

		"cells": {

			// automatically generated, except:
			
			
			"concept_id": {
				"definition": [1, 0.85],
				"synchronize_with": {"conceptrelaties": "concept_id"}  // ensure that the concept relations list is filled
			},
			
			"definitie": {
				"definition": [concepts.formWidth, 5],
				"editable": true
			},
			
			
			"opmerking_bij_concept": {
				"definition": [concepts.formWidth, 1],
				"editable": true
			},
			
			"aangemaakt_op": {
				"render": function(sValue){
					return util.shortDateFormat(sValue);			
				}
			}, 
			 
			"gewijzigd_op": {			
				"render": function(sValue){
					return util.shortDateFormat(sValue);			
				}
			}, 
			
		},
		
		"save_callback": function(t){
			
			// we need to reactive the autocomplete for domain, since it's not working after a save (because of the form rebuilding)
			setTimeout(function(){
				util.setAutocompleteFor('#form_cellvalue_domein textarea', 'termbank_concepten', 'domein');
			}, 1000);
		},
		
		"lists": {
			
			"conceptrelaties": {
				
				"nice_name": "Conceptrelaties",
				
				"cellgroup": "conceptrelaties_label",
				
				"definition": [termbank_summary.formWidth*2, termbank_summary.formHeight*5],
				
				"table": {
					
					"name": "termbank_conceptenlinks",
					
					"columns_sorting": {"verwant_concept": "asc", "type_van_verwantschap": "asc"},
					
					"columns": {
						
						"concept_link_id": {
							"visible": false
						},
						"concept_id": {											
							"visible": false
						},	
						"verwant_concept": {
							"nice_name": "Verwant concept",
							"visible": true,
							"editable": true
						},
						"verwant_concept_id": {
							"nice_name": "Verwant concept ID"
						},										
						"type_van_verwantschap": {	
							"nice_name": "Type verwantschap",
							"editable": true,
							"visible": true				
						}
					}
					
				},
				
				"buttons": {
					
					"add": {
						"title": "Voeg verwant concept toe",
						"copy": { 
							"concept_id": {"form": "concept_id"} // get the value from the form cell 'term_id'						
						}				
					},
					
					"delete": true
				}
				
			}
		}
		
	}
	
};

concepts.config = {
	
	
	"btn_details": {
		"nice_name": "_",
		"button": "details",
		"class": "cell_button",
		"width": "100px",
		"click": function(t){
			
			setTimeout(function(){				
				fn.toggleViewType(t, function(){					
					if (fn.getViewType(t) == "table") {
						setTimeout(function(){ fn.refreshTable(t); }, 100);
					}
				});				
			}, 100);
				
		}
	},
	
	"concept_id": {
		"visible": true,
		"nice_name": "Concept (ID)"
	}, 
	"externe_verwijzing": {
		"visible": false,
		"editable": true,
		"nice_name": "Externe verwijzing (bijschrift)"
	}, 
	"uri_externe_verwijzing": {
		"visible": false,
		"editable": true,
		"nice_name": "Externe verwijzing (URL)"
	}, 
	"domein": {
		"visible": false,
		"editable": true
	}, 
	"opmerking_bij_het_domein": {
		"visible": false,
		"editable": true,
		"nice_name": "Domein (opmerking)"
	}, 
	"definitie": {
		"visible": false,
		"editable": true
	}, 
	"definitie_id": {
		"nice_name": "Definitie (ID)",
		"visible": false
	}, 
	"opmerking_bij_de_definitie": {
		"visible": false,
		"editable": true,
		"nice_name": "Definitie (opmerking)"
	}, 
	"bron_van_de_definitie": {
		//"definition": [1, 13],
		"visible": false,
		"editable": true,
		"nice_name": "Definitie (bron)"
	}, 
	"externe_afbeelding": {
		"visible": false,
		"editable": true,
		"nice_name": "Externe afbeelding (bijschrift)"
	}, 
	"uri_naar_externe_afbeelding": {
		"visible": false,
		"editable": true,
		"nice_name": "Externe afbeelding (URL)"
	}, 
	"projectsubset": {
		"visible": false,
		"editable": true
	}, 
	"conceptaanduiding": {
		"visible": true,
		"nice_name": "Concept (naam)",
		"editable": true
	}, 
	"bewerkingsstatus": {
		"visible": true,
		"editable": true
	}, 
	"online_publicatie": {
		"editable": true,
		"visible": false		
	}, 
	"url_online_publicatie": {
		"visible": false,
		"editable": true,
		"nice_name": "Online publicatie (URL)"
	},
	"bron_concept": {
		"visible": false,
		"editable": true,
		"nice_name": "Concept (bron)"
	}, 
	"aangemaakt_op": {
		"visible": true,
		"nice_name": "Aangemaakt",
		"render": function(sValue){
			return util.shortDateFormat(sValue);			
		}
	}, 
	"aangemaakt_door": {
		"visible": true,
		"nice_name": "Aanmaker"
	}, 
	"gewijzigd_op": {
		"visible": true,
		"nice_name": "Laatste wijziging",
		"render": function(sValue){
			return util.shortDateFormat(sValue);			
		}
	}, 
	"gewijzigd_door": {
		"nice_name": "Laatste wijziging door",
		"visible": false
	}, 
	"klantensubset": {
		"visible": false,
		"editable": true
	}, 
	"opmerking_bij_concept": {
		"visible": false,
		"editable": true,
		"nice_name": "Concept (opmerking)"
	}
	
};




// set (or get rid of) the autocomplete functionality for the concept search


concepts.concept2conceptID = new Hashtable();

concepts.setAutocompleteForConcept = function(){
	
	$(document).on(
      "focus", 
      "#prompt_zoeknaar", 
      function(event) {
      	
      	$(event.target).autocomplete({
          	
      		delay: 750,
			minLength: 1, // we need the autocomplete to react on the first character because of concept_ids which are single numbers sometimes
			source: function(request, response){
				
				fn.callFunction(util.getProjectId() + ".search_for_concept_by_id_or_name", [ fn.quote( request.term ) ], 
						function(func_resp){  
					
					var aSuggestionsArr = (func_resp["search_for_concept_by_id_or_name"]).split("^^^");
						
					// build a list linking concept to their IDs
					concepts.concept2conceptID = new Hashtable();
					for (var i=0; i<aSuggestionsArr.length; i++){
						
						var sConceptId = aSuggestionsArr[i].split("###")[0];
						var sConceptNaam = aSuggestionsArr[i].split("###")[1];
						concepts.concept2conceptID.put(sConceptNaam, sConceptId);
					}
					
					response($.map(aSuggestionsArr, function (item) {
						return {
							label: item.split("###")[1],
							value: item.split("###")[1]
						};
					}));
				});
			},
			
			open: function(event, ui){

				setTimeout(function(){
					$(event.target).putInFront();
				}, 100);
			},
			
			select: function(event, ui){
				
				var nTermNode = util.getBestRow("termbank_termen");
				var sTermNaam = fn.getDataFromCellInRowNode(nTermNode, "term");
				var sTermId =   fn.getDataFromCellInRowNode(nTermNode, "term_id");
				
				fn.confirm("Let op", 
					"Het concept "+ui.item.value+"<BR><BR>"+
					"zal nu aan '"+sTermNaam+"' worden toegekend.<BR><BR>"+
					"Weet u het zeker?",
					
					function() {
						
						// proceed!
						
						// get the concept ID of the selected concept
						var sConceptIdOfSelectedConcept = concepts.concept2conceptID.get(ui.item.value);
						fn.closeDialog();
						
						// assign the concept ID to the term						
						fn.updateTableGivenANode(nTermNode, {"concept_id": sConceptIdOfSelectedConcept}, function(){
							
							// open this concept in the concept table
							fn.callTable("termbank_concepten", {"concept_id": sConceptIdOfSelectedConcept}, function(){
								
								// and show the update in the terms table too
								fn.callTable("termbank_termen", {"concept_id": "", "term_id": sTermId});	
							});
							
						});
					},
					function() {
						// cancelled
						fn.closeDialog();
						fn.message("OK", "Operatie geannuleerd door gebruiker.");
						setTimeout(function(){
							fn.closeDialog();
						}, 2000);
					}
				);
				
			}
			
          });
          
      }
	);
};




concepts.setAutocompleteForVerwantConcept = function(){
	
	$(document).on(
      "focus", 
      "#prompt_verwantconcept", 
      function(event) {
      	
      	$(event.target).autocomplete({
          	
      		delay: 750,
			minLength: 1, // we need the autocomplete to react on the first character because of concept_ids which are single numbers sometimes
			source: function(request, response){
				
				fn.callFunction(util.getProjectId() + ".search_for_concept_by_id_or_name", [ fn.quote( request.term ) ], 
						function(func_resp){  
					
					var aSuggestionsArr = (func_resp["search_for_concept_by_id_or_name"]).split("^^^");
						
					// build a list linking concept to their IDs
					concepts.concept2conceptID = new Hashtable();
					for (var i=0; i<aSuggestionsArr.length; i++){
						
						var sConceptId = aSuggestionsArr[i].split("###")[0];
						var sConceptNaam = aSuggestionsArr[i].split("###")[1];
						concepts.concept2conceptID.put(sConceptNaam, sConceptId);
					}
					
					response($.map(aSuggestionsArr, function (item) {
						return {
							label: item.split("###")[1],
							value: item.split("###")[1]
						};
					}));
				});
			},
			
			open: function(event, ui){

				setTimeout(function(){
					$(event.target).putInFront();
				}, 100);
			},
			
			select: function(event, ui){
				
				// get the concept ID of the selected concept
				var sConceptIdOfSelectedConcept = concepts.concept2conceptID.get(ui.item.value);
				
				if (sConceptIdOfSelectedConcept != null){
					
					// parse the concept name out of the long string
					var sSelectedConcept = ui.item.value.split(":")[1];
					
					// put concept and its ID in the corresponding fields
					setTimeout(function(){
						$("#prompt_verwantconcept").val(sSelectedConcept.trim());
						$("#prompt_verwantconceptid").val(sConceptIdOfSelectedConcept);
					}, 100);
					
				}
				
			}
			
          });
          
      }
	);
};




concepts.removeAutocompleteForConcept = function(){
	
	$(document).off("focus", "#prompt_zoeknaar");

};

concepts.removeAutocompleteForVerwantConcept = function(){

	$(document).off("focus", "#prompt_verwantconcept");

};








// image rendering

concepts.setImageViewer = function(){
	
	$(document).on(
		"mouseover", 
		"div#form_cellvalue_uri_naar_externe_afbeelding textarea",
		function(){
			
			var sValue = $(this).val();
			const offset = $(this).offset();
			var iWidth = $(this).width();
			
			if (util.isValidUrl(sValue)) {
				util.displayImageAtPosition(sValue, offset.left, offset.top + 50, iWidth);
			}		
		}
	);
	
	$(document).on(
		"mouseleave", 
		"div#form_cellvalue_uri_naar_externe_afbeelding textarea",
		function(){		
			$("#imageviewer").remove();
		}
	);
	
}


concepts.removeImageViewer = function(){
	
	$("div#form_cellvalue_uri_naar_externe_afbeelding textarea").off("mouseover");
	$("div#form_cellvalue_uri_naar_externe_afbeelding textarea").off("mouseleave");
}