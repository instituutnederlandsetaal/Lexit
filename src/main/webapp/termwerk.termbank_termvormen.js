

var termbank_termforms = {};


// ------------------------------------------------------------------------------------------------------------------
// BEWARE: 
// since the term forms are now managed in a form list (embedded in the terms form),
// it looks like this table configuration is not used anymore. But since it is not certain yet, it is kept here.
// ------------------------------------------------------------------------------------------------------------------



termbank_termforms.settings = {
	
	"nice_name": "Termvormen",
	
	"class": "largetermbank", // apply special border styling for cells etc.
	
	"left": "20px",
	"top": sTableTopPosition,
	"width": "60%",
	
	"main_search": false,
	"export_buttons": false,
	"pagination_on_top": false,
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
	
	"resize_callback": function(t, ui){
		form.updateLayout(t, true, false);
	},
	
	"buttons": {
		
		"Voeg termvorm toe": {
			"class": "table_header_button nopadding",
			"click": function(t) {
				
				var nSelectedRow = util.getBestRow(t);
				
				if (nSelectedRow == null) {
					nSelectedRow = util.getBestRow("termbank_termen");
				}			
				var sTermId = fn.getDataFromCellInRowNode(nSelectedRow, "term_id");
				
				fn.insertIntoTable("termbank_termvormen", {"term_id": sTermId}, null, function(){
					fn.refreshTable(t);
				});
				
			}
		},
		"Verwijder termvorm": {
			"class": "table_header_button nopadding danger",
			"click": function(t) {
				
				var nSelectedRows = fn.getSelectedRowNodesFrom(t);
				if (nSelectedRows.length == 0){
					
					fn.message("Let op!", "U moet minstens één vorm selecteren.");
				}
				else {
					fn.confirm("Let op", "Weet u zeker dat u de geselecteerde vorm wilt verwijderen?", 
						function(){
							
							$(nSelectedRows).each(function(){
								var nThisRow = this; 
								var bLastRow = fn.isLastNodeOf(nThisRow, nSelectedRows);
								fn.removeFromTableGivenANode(nThisRow, function(){
									if (bLastRow){
										fn.refreshTable(t);
									}
								});
							});
							
						}, 
						function(){
							// cancelled
						});
					
				}
				
			}
		}
		
	},
	
	
	
	"callback": function(t){
		
		// put the free buttons in the middle of the header
		util.putFreeButtons(t);
	},
	"repeat_callback": true
	
};


termbank_termforms.config = {
	
	
	"term_id": {
		"visible": false,
		"nice_name": "term ID"
	},
	"termvorm_id": {
		//"visible": false		// if hidden, added empty column have no height!
		"nice_name": "termvorm ID"
	},
	"termvorm": {
		"editable": true
	},
	"upos": {
		"editable": true
	},
	"bron_van_de_termvorm": {
	}
	
};