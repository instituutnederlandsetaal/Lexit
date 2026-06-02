
var molexinfo = {};


molexinfo.settings = {
	
	int_requests: {
		"group": "Overzichten"
	},
	nieuwe_lemmata_door_derden: {
		"group": "Overzichten"
	},
	anw_online: {
		"group": "Overzichten"		
	},
	surinaams_and_antilliaans_commissions_selections: {
		"group": "Overzichten"		
	},
	
	
	
	thomas_likes_de_te: {
		"group": "Checklijstjes"
	},
	
	test_lemmata_for_katrien: {
		
		"width": "60%",
		"group": "Checklijstjes",
		"columns_sorting": {"main_pos": "asc", "cnt": "desc"}
	},
	
	parents_children_pos_mismatch: {

		"group": "Checklijstjes",

		"columns_sorting": {"molex_lemma_id": "asc"},

		"callback": function(t){
			// mark the border between pages

			var lastParentId = null;
	
			var aRows = fn.getAllRowNodes(t);
			
			$(aRows).each(function(i){
				var nRow = this;
				var parentId = fn.getDataFromCellInRowNode(nRow, "molex_lemma_id");

				if (i>0 && parentId != lastParentId ){
					$(nRow).find("td").css("border-top", "2px solid red");
				}
		
				lastParentId = parentId ;
			});

		},
		"repeat_callback": true
	},
	
	verledentijd_op_de_en_ook_op_te: { 
		"group": "Jesse's lijstjes"
	},	
	los_vast: { 
		"group": "Jesse's lijstjes"
	},
	meervouden_van_um : { 
		"group" : "Checklijstjes"
	},	
   	meervouden_van_woorden_op_e: { 
		"group" : "Checklijstjes" 
	},	
   	sources_view: { 
		"group": "Jesse's lijstjes"
	},
	
	banlijst_doubles: {
		"width": "60%",
		"group": "Checklijstjes",
	}
	
};

molexinfo.config = {
	
	parents_children_pos_mismatch: {

		"molex_lemma_id": {
			"nice_name": "molex_id",
			"bgcolor": "green",
			"click": function(t, n){
				var sVal = fn.getDataFromCellNode(n);
				fn.callDatabase("lemmata", {"molex_lemma_id": sVal });
			}
		},
		"lemma_pos": {
			"editable": true
		},
		"pkid": {
			"visible": false
		}

	},
	
};