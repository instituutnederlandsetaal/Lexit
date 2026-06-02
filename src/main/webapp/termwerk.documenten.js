

var termdocs = {};

termdocs.settings = {
	
	"nice_name": "Documenten",
	
	"class": "largetermbank", // apply special border styling for cells etc.
	
	"width": "80%",
	
	"main_search": false,
	"export_buttons": false,
	"exact_count": true,
	"pagination_on_top": false,
	
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
	
	"buttons": {
		
		"Voeg document toe": {
		
			"class": "table_header_button nopadding",
			"click": function(t){
				
				fn.message("Beware", "Function not available yet");
			}
		},
		
		"Verwijder": {
			
			"class": "table_header_button danger",
			"click": function(t){
				
				var nSelectedRow = fn.getFirstSelectedRowNodeFrom(t);
				
				if (nSelectedRow == null) {
					fn.message("Let op", "Selecteer eerst een document om te verwijderen");
					return;
				}
				else {
					var sDocID = fn.getDataFromCellInRowNode(nSelectedRow, "doc_id");
					var sDocNaam = fn.getDataFromCellInRowNode(nSelectedRow, "orig_filename");
							
					fn.confirm("Let op", "Weet u zeker dat u document '"+sDocNaam+"' wilt verwijderen?", 
						function(){
							fn.removeFromDatabaseGivenFieldValues(t, {"doc_id": sDocID}, function(){
								fn.refreshTable(t);
							});						
						},
						function(){
							// cancelled
						}
					);
				}
				
			}
		}
		
	},
	
	
	
	"resize_callback": function(t, ui){
		form.updateLayout(t, true, false);
	},
	
	"callback": function(t){
		
		// put the free buttons in the middle of the header
		util.putFreeButtons(t);
		
		// remove unneeded elements like rows counting etc.	
		$("#"+fn.getTableName(t)+"_wrapper .top").find(".dataTables_info").text("");
		$("#"+fn.getTableName(t)+"_wrapper .top").find(".dataTables_length").hide();
		
	},
	
	"repeat_callback": true
	
};

termdocs.config = {
	
	"doc_id": {
		"visible": false
	},
	
	"corpus_id": {
		"visible": false
	},
	
	"btn_toon": {
		"nice_name": "_",
		"button": "toon",
		"visible": false,
		"class": "cell_button",
		"click": function(t, n){
			fn.message("Document", "DUMMY");   // NOT IN USE YET
		}
	},
	
	"orig_filename": {
		"nice_name": "oorspronkelijke bestandsnaam"
	},
	
	"references": {
		"editable": true,
		"nice_name": "referenties"	
	},
	"description": {
		"editable": true,
		"nice_name": "beschrijving"	
	},
	
	"aangemaakt_op": {
		"nice_name": "toegevoegd",
		"render": function(sValue) {
			return util.shortDateFormat(sValue);
		}
	},
	"aangemaakt_door": {
		"nice_name": "door"
	},
	"tokens": {
		//"visible": false
	},
	
	"blacklab_corpusname": {
		"visible": false
	},
	"blacklab_id": {
		"visible": false,
		"nice_name": "BlackLab ID"
	},
	"doc_pid": {
		"visible": false,
		"nice_name": "doc PID"
	}
	
};