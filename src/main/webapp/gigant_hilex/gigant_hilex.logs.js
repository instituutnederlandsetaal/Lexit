

var hilexlogs = {};

hilexlogs.settings = {
	
	modified_lemmata_view: {
			
		"group": "log",
		"exact_count": true,
		
		"columns_sorting": {"modification_date": "desc", "modification_time": "desc"},
		
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
								
								fn.callFunction(sApiSchema+".restore_lemma_and_paradigm_and_ids", [sLemmaId],  
									function(){
								
										if (fx.isLastRowOf(oCurrentRow, oRowSelection))
											fn.refreshTable(t);
								});
								
							}); // end of rows loop
						}
				);
			}
		}
	},
	
	modified_paradigm_view: {
		
		"group": "log",
		"exact_count": true,
		
		"columns_sorting": {"modification_date": "desc", "modification_time": "desc"},
		
		"button_0":{
			"name": "Woordvorm herstellen",
			"click": function(t){
				
				fn.confirm("Zeker weten?", "Weet u het zeker?", 
						function(){
					
					var oRowSelection =  fx.getSelectedRowsFrom(t);
					
					oRowSelection.every(function(){
						
						var oCurrentRow =	this;							
						var sAwfId =		fx.getDataFromCellInRow(oCurrentRow, "analysed_wordform_id");
						fn.callFunction(sApiSchema+".restore_wordform", [sAwfId],  
								function(){
									if (fx.isLastRowOf(oCurrentRow, oRowSelection))
										fn.refreshTable(t);
						});
					});
				});
			}
		}
	},
	
	modified_attestations_view: {
		
		"group": "log",
		"exact_count": true,
		
		"columns_sorting": {"modification_date": "desc", "modification_time": "desc"},
		
		"button_0":{
			"name": "Attestatie herstellen",
			"click": function(t){
				
				fn.confirm("Zeker weten?", "Weet u het zeker?", 
					function(){
				
						var oRowSelection =  fx.getSelectedRowsFrom(t);	
												
						oRowSelection.every(function(){
							var oCurrentRow =	this;							
							var sAttId =		fx.getDataFromCellInRow(oCurrentRow, "attestation_id");
							fn.callFunction(sApiSchema+".restore_attestation", [sAttId],  
								function(){
									if (fx.isLastRowOf(oCurrentRow, oRowSelection))
										fn.refreshTable(t);
								}
							);
						}); // end of rows loop
					}
				);
			}
		}
		

	}
	
	
};

hilexlogs.config = {
	
	modified_lemmata_view: {
			
	}, 
	
	modified_paradigm_view: {
		
		"multiple_lemmata_analysis_id": {
			"nice_name": "mla_id"
		},
		"analysed_wordform_id": {
			"nice_name": "awf_id"
		},
		"wordform_id": {
			"nice_name": "wf_id"
		},
		"wordform_pos": {
			"nice_name": "wf_pos"
		}
	},
	
	modified_attestations_view: {
		
		"analysed_wordform_id": {
			"nice_name": "awf_id"
		}
	}
	
};