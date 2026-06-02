
var molexlogs = {};

molexlogs.settings = {
	
	
	modified_lemmata_view: {
			
		"group": "Logs",
		
		"columns_sorting": {"modification_date": "desc", "modification_time": "desc"},
		
		"button_0":{
			"name": "Lemma en paradigma herstellen",
			"click": function(t){
				
				fn.confirm("Zeker weten?", "Weet u het zeker? Als de log groot is, kan deze operatie enige tijd kosten.", 
						function(){
					
					var oRowSelection = fx.getSelectedRowsFrom(t);
					
					oRowSelection.every(function(){
						
						var oCurrentRow =	this;
						var sLemmaId =		fx.getDataFromCellInRow(oCurrentRow, "lemma_id");
						
						fn.callFunction(sApiSchema+".restore_lemma_and_paradigm_and_ids", [sLemmaId],  
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
		
		"group": "Logs",
		
		"columns_sorting": {"modification_date": "desc", "modification_time": "desc"},
		
		"button_0":{
			"name": "Woordvorm herstellen",
			"click": function(t){
				
				fn.confirm("Zeker weten?", "Weet u het zeker?", 
						function(){
					
					var oRowSelection =	fx.getSelectedRowsFrom(t);
					
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
	}
	
};

molexlogs.config = {
	
	
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
		"wordform_afbr": {
			"nice_name": "wf_afbr"
		},
		"wordform_pos": {
			"nice_name": "wf_pos"
		}
	}	
};