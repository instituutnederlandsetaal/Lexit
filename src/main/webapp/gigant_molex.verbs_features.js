
var molex_verbs = {};



molex_verbs.settings = {
	
	werkwoord_features: {
			
		"size": "60%",
		"column_sorting": {"modern_lemma": "asc"},
		
		"button_0": {
			"name": "Unlock",
			"click": function(t){
				
				// add temp class to table to tell the callback not to apply disabled css
				$("#"+fn.getTableName(t)+"_wrapper").addClass('unlocked');
				
				// refresh to apply unlocking (see callback)
				fn.refreshTable(t);
				
			}
		},
		
		"callback": function(t){
			
			var tSelector = $("#"+fn.getTableName(t)+"_wrapper");
			
			// special class means don't apply disabled css
			var unlocked = tSelector.hasClass('unlocked');
			
			if ( !unlocked )
			{
				var oRows = fx.getAllRows(t);
				oRows.every(function(){
					
					var oThisRow = this;
					
					var nCellSelector = $( fx.getNode(oThisRow) ).find("td");
					 nCellSelector.editable('disable');
					 nCellSelector.css("opacity", "0.5");
					 nCellSelector.find("input").attr("disabled", "disabled");
					 nCellSelector.find("input").css("opacity", "0.5");
				});
			}
			// upon refresh, the unlocked class must be removed
			else
			{
				// give button default state
				tSelector.removeClass('unlocked');							
			}
			
		},
		
		"repeat_callback": true
		
	}
	
};

molex_verbs.config = {
	
	werkwoord_features: {
		
		"lemma_id": {
			"click": function(t, n){
				var sLemId = fn.getDataFromCellNode(n);
				fn.callDatabase("lemmata", {"lemma_id": sLemId});
			}
		},
		
		"hulpww_zijn": {
			"editable": true, 
			"bgcolor": "#CBF3D5",
			"editcallback": function(t, n, value){					
				var nRow = fn.getRowNode(n);
				fn.callRecord(nRow, ["hulpww_zijn", "hulpww_hebben", "hulpww_beide", "refl", "trans", "intrans", "onpers", "summary", "beoordeeld"]);
				fn.refreshTable("lemmata");
			}
		},
		"hulpww_hebben": {
			"editable": true, 
			"bgcolor": "#CFF1B8",
			"editcallback": function(t, n, value){
				var nRow = fn.getRowNode(n);
				fn.callRecord(nRow, ["hulpww_zijn", "hulpww_hebben", "hulpww_beide", "refl", "trans", "intrans", "onpers", "summary", "beoordeeld"]);
				fn.refreshTable("lemmata");
			}
		},
		"hulpww_beide": {
			"editable": true, 
			"bgcolor": "#CBF3D5",
			"editcallback": function(t, n, value){
				var nRow = fn.getRowNode(n);
				fn.callRecord(nRow, ["hulpww_zijn", "hulpww_hebben", "hulpww_beide", "refl", "trans", "intrans", "onpers", "summary", "beoordeeld"]);
				fn.refreshTable("lemmata");
			}
		},
		
		"refl": {
			"editable": true, 
			"bgcolor": "#F3E4C4",
			"editcallback": function(t, n, value){
				var nRow = fn.getRowNode(n);
				fn.callRecord(nRow, ["hulpww_zijn", "hulpww_hebben", "hulpww_beide", "refl", "trans", "intrans", "onpers", "summary", "beoordeeld"]);
				fn.refreshTable("lemmata");
			}
		},
		"trans": {
			"editable": true, 
			"bgcolor": "#F1DFB8",
			"editcallback": function(t, n, value){
				var nRow = fn.getRowNode(n);
				fn.callRecord(nRow, ["hulpww_zijn", "hulpww_hebben", "hulpww_beide", "refl", "trans", "intrans", "onpers", "summary", "beoordeeld"]);
				fn.refreshTable("lemmata");
			}
		},
		"intrans": {
			"editable": true, 
			"bgcolor": "#F3E4C4",
			"editcallback": function(t, n, value){
				var nRow = fn.getRowNode(n);
				fn.callRecord(nRow, ["hulpww_zijn", "hulpww_hebben", "hulpww_beide", "refl", "trans", "intrans", "onpers", "summary", "beoordeeld"]);
				fn.refreshTable("lemmata");
			}
		},
		"onpers": {
			"editable": true, 
			"bgcolor": "#F1DFB8",
			"editcallback": function(t, n, value){
				var nRow = fn.getRowNode(n);
				fn.callRecord(nRow, ["hulpww_zijn", "hulpww_hebben", "hulpww_beide", "refl", "trans", "intrans", "onpers", "summary", "beoordeeld"]);
				fn.refreshTable("lemmata");
			}
		},
		
		"summary": {
			"visible": false
		},
		
		"beoordeeld": {
			"editable": true, 
			"bgcolor": "#F27858",
			"editcallback": function(t, n, value){
				var nRow = fn.getRowNode(n);
				fn.callRecord(nRow, ["hulpww_zijn", "hulpww_hebben", "hulpww_beide", "refl", "trans", "intrans", "onpers", "summary", "beoordeeld"]);
				fn.refreshTable("lemmata");
			}
		}
		
	}
	
};