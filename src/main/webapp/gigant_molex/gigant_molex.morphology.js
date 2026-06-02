
var molexmorph = {};


molexmorph.settings = {
	
	
	morphological_operations: {
		"group": "Onder de motorkap"
	},
	morphological_analyses: {
		"group": "Onder de motorkap"
	},
	morphological_analysis_parts: {
		"group": "Onder de motorkap"
	},
	
	morphological_view: {
		
		"columns_sorting": {"main_lemma": "asc", "morphological_analysis_id": "asc", "part_number": "asc"},

		"button_0": {
			"name": "Remove analysis",
			"click": function(t){

				fn.confirm("Let op", "De geselecteerde analyse zal worden verwijderd.<BR><BR>Weet u zeker dat u dit wilt?", 
					function(resp){

						var oRow = fx.getFirstSelectedRowFrom(t);
						if (oRow.count() != 1){
							fn.message("Let op", "Kies één (en slechts één) rij om een analyse te verwijderen!");
						}
						else {
							var sMorphAnalysisId = fx.getDataFromCellInRow(oRow, "morphological_analysis_id");
							fn.callFunction(sApiSchema+".remove_morphological_analysis", [sMorphAnalysisId], function(){
								fn.refreshTable(t);
							});
						}
						
					},
					function(err){
						fn.message("OK", "Operatie door gebruiker geannuleerd");

					}
				)
				
			}
		},

		"callback": function(t){

			var oRows = fx.getAllRows(t);
			var sPreviousMorphAnalysisId = null;
			oRows.every(function(){
				var oThisRow = this;
				var sThisMorphAnalysisId = fx.getDataFromCellInRow(oThisRow, "morphological_analysis_id");

				if (sPreviousMorphAnalysisId!= null && sThisMorphAnalysisId != sPreviousMorphAnalysisId){
					$( fx.getNode(oThisRow) ).find("td").css("border-top", "1px solid black")
				}
				// remember id for next round
				sPreviousMorphAnalysisId = sThisMorphAnalysisId;

			});
		},
		"repeat_callback": true

	}
	
};

molexmorph.config = {
	
	morphological_view: {
			
		morphological_analysis_id: {
			"visible": false
		},
		main_lemma_id: {
			"bgcolor": "#F5A9BC",
			"click": function(t, n){
				var sLemmId = fn.getDataFromCellNode(n);
				fn.callTable("lemmata", {"lemma_id": sLemmId});
			}
		},
		main_lemma: {
			"bgcolor": "#F8E0E6"
		},
		main_pos: {
			"bgcolor": "#F8E0E6"
		},
		main_gloss: {
			"bgcolor": "#F8E0E6"
		},
		main_keurmerk: {
			"bgcolor": "#F8E0E6",
			"nice_name": "main keurmerk"
		},
		main_online: {
			"bgcolor": "#F8E0E6",
			"nice_name": "main online"
		},
		part_morphological_analysis_id: {
			"visible": false
		},
		part_lemma_id: {
			"bgcolor": "#A9F5BC",
			"click": function(t, n){
				var sLemmId = fn.getDataFromCellNode(n);
				fn.callTable("lemmata", {"lemma_id": sLemmId});
			}
		},
		part_lemma: {
			"bgcolor": "#E0F8E0"
		},
		part_pos: {
			"bgcolor": "#E0F8E0"
		},
		part_gloss: {
			"bgcolor": "#E0F8E0"
		},
		part_keurmerk: {
			"bgcolor": "#E0F8E0",
			"nice_name": "part keurmerk"
		},
		part_online: {
			"bgcolor": "#E0F8E0",
			"nice_name": "part online"
		},
		description:{
			"click": function(t, n){

				var sCurrentValue = fn.getDataFromCellNode(n);
				var sCurrentMorphAnalysisId = fn.getDataFromSiblingNode(n, "morphological_analysis_id");

				var sMakeNewOperationText = "Maak nieuw morfologische operatie-type aan";

				fn.callFunction(sApiSchema+".get_morphological_operations", [], function(resp){

					var aDescriptions = (resp["descr"]).split(ARG_INTERNAL_SEPARATOR);
					var aMorphOperationIds = (resp["morph_operation_id"]).split(ARG_INTERNAL_SEPARATOR);

					// operations list
					var aAllOptions = cloneArray(aDescriptions);
					// add room under the list
					aAllOptions.push(null); 
					// add final option: make new one!
					aAllOptions.push(sMakeNewOperationText);

					fn.promptSelect(["Kies operatie-type", "Kies morfologische operatie-type, of annuleer"], aAllOptions, [sCurrentValue], 
						function(aNewChosen){

							var sChoice = aNewChosen[0];
							var iSelectedItem = aDescriptions.indexOf(sChoice);

							// if a new operation type must be assign

							if (sChoice == sMakeNewOperationText){

								fn.prompt(["Nieuw operatie-type aanmaken", "Declareer een nieuw morfologische operatie-type"], 
									["description", "resulting_part_of_speech"], 
									["", ""],
									function(resp){

										var sNewDescription = resp["description"];
										var sNewPartOfSpeech = resp["resulting_part_of_speech"];

										// insert the new operation type and get its id back, so as to be able to assign it to the current analaysis
										fn.insertIntoTable("morphological_operations", 
											{"description": sNewDescription, "resulting_part_of_speech": sNewPartOfSpeech}, 
											"morphological_operation_id", // return field
											function(sNewMorphOpId){

												// assigh this morphological_analysis_id to the current analysis
												fn.updateTableGivenFieldValues("morphological_analyses", 
													{"morphological_analysis_id": sCurrentMorphAnalysisId}, 
													{"morphological_operation_id": sNewMorphOpId},
													function(resp){
														// refresh table to show the result in the GUI
														fn.refreshTable(t);
													}
												);

											},
											function(){
												fn.message("OK", "Operatie door gebruiker geannuleerd");
											}
										);

									} 
								); 
								
							}

							// else normal case: assign a ready-made operation type

							else {

								// get the morphological_analysis_id, given the selected operation type
								var sNewMorphOpId = aMorphOperationIds[ iSelectedItem ];

								// assigh this morphological_analysis_id to the current analysis
								fn.updateTableGivenFieldValues("morphological_analyses", 
									{"morphological_analysis_id": sCurrentMorphAnalysisId}, 
									{"morphological_operation_id": sNewMorphOpId},
									function(resp){
										// refresh table to show the result in the GUI
										fn.refreshTable(t);
									}
								);

							}

						},
						function(){
							fn.message("OK", "Operatie door gebruiker geannuleerd");
						},
						true
					);
				});

			}
		},
		originalsource_id: {
			"visible": false
		},
		source_name: {
			"nice_name": "link_provenance"
		},
		resulting_part_of_speech: {
			"visible": false
		}
	}
	
};