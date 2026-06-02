
var molexjobs = {};


molexjobs.settings = {
	
	pronouns_lem_id_par: {
		"group": "Jesse's lijstjes"
	},
	
	ghost_wordforms: {
		"group": "Overzichten"
	},
	
	source_match: {
		"group": "Overzichten"
	},
	
	subset_statistics: {
		"group": "Jesse's lijstjes"
	},
	
	lemma_id_to_anw_pid: {
		"group": "Onder de motorkap"
	},
	
	technische_handleiding: {
		"group": "Overzichten"
	},
	
	online_or_not_per_subset: {
		"group": "Overzichten"
	},
	
	verdacht_anw_lems_ugly_foei: {
		"group": "Checklijstjes"
	},
	
	th_conversion: {
		"group": "Overzichten"
	},
	
	surinaams_and_antilliaans_archived_2022: {
		"group": "Overzichten"
	},
	
	er_is_een_voltooid_deelwoord_maar_er_is_geen_hulpwerkwoord: {
		"group": "Jesse's lijstjes"
	},
	
	voor_katrien: {
		"group": "Jesse's lijstjes"
	},
	
	removed_lemmata: {
		"group": "Overzichten"
	},
	
	rbn_lems_placeholders_for_vertaalwoordenschat_lems: {
		"group": "Overzichten"
	},
	
	lemma_frequency: {
		"group": "Overzichten"
	},
	
	collectedlinks : {
		
		"group": "Jesse's lijstjes"
	},
	
	check_homofonen_enzo: {
	
		"group": "Checklijstjes",
		
		"width": "50%",
		"exact_count": true
	},	
	
	ghost_analyzed_wordform_ids: {
		"group": "Jesse's lijstjes"
	},
	

	spatielemmata: {
		"group": "Checklijstjes",
		"width": "80%"
	},

	
	banstaltigheden: {
        "group": "Jesse's lijstjes"
    },
    
    mwe_to_link: {
		"group": "Checklijstjes",
		"size": "70%",
		"columns_sorting": {"modern_lemma": "asc"}
	},
	
	
};



molexjobs.config = {
	
	check_homofonen_enzo: {
		"id": {
			"visible": false
		},
		"opmerking": {
			"editable": true
		},
		"checked": {
			"editable": true
		},
		"paren": {
			"click": function(t, n){
				var aVal = (fn.getDataFromCellNode(n)).split(", ");
				
							
				fn.callTable("lemmata", { "modern_lemma": "^("+aVal.join("|")+ ")$"});
			}
		}
		
	},

	

	spatielemmata: {

		"lemma_id": {
			"click": function(t, n){
				var sLemId = fn.getDataFromCellNode(n);
				fn.callDatabase("lemmata", {"lemma_id": sLemId}, function(){
					fn.callDatabase("lemmata_and_paradigm_view",  {"lemma_id": sLemId});
				});
			},
			"bgcolor": "#E0F8EC"
		}, 
		"molex_lemma": {}, 
		"molex_lemma_id": {
			"nice_name": "molex_id",
			"click": function(t, n){
				var sParentId = fn.getDataFromCellNode(n);
				fn.callDatabase("lemmata", {"molex_lemma_id": sParentId});
			},
			"bgcolor": "#E0F8EC"
		}, 
		"modern_lemma": {}, 
		"lemma_pos": {
			"editable": true,
			"bgcolor": "#E0F8EC",
			"editcallback": function(t, n, value){
				var sLemId = fn.getDataFromSiblingNode(n, "lemma_id");
				fn.updateDatabaseGivenFieldValues("lemmata", {"lemma_id": sLemId}, {"lemma_pos": value}, 
				function(){
					fn.refreshTable(t, function(){fn.refreshTable("lemmata")});
				},
				function(){
					fn.message("LET OP!", "De waarde '"+value+"' is hier niet toegestaan!");
				});
			}
		}, 
		"gedaan": {
			"editable": true,
			"bgcolor": "#E0F8EC"
		}, 
		"opmerking_intern": {
			"editable": true,
			"bgcolor": "#E0F8EC"
		},
		"keurmerk": {}, 
		"entry_type": {
			"editable": true,
			"bgcolor": "#E0F8EC",
			"editcallback": function(t, n, value){
				var sLemId = fn.getDataFromSiblingNode(n, "lemma_id");
				fn.updateDatabaseGivenFieldValues("lemmata", {"lemma_id": sLemId}, {"entry_type": value},
					function(){
						fn.refreshTable(t, function(){fn.refreshTable("lemmata")});
					},
					function(){
						fn.message("LET OP!", "Oei-oei!");
					}
				);
			}
		}, 
		"gloss": {}
	},
	
	mwe_to_link: {

		"pkid": {
			"visible": false
		},
		
		"lemma_id": {
			"bgcolor": "lightgreen",
			"click": function(t, n){
				var sLemId = fn.getDataFromCellNode(n);
				fn.callDatabase("lemmata", {"lemma_id": sLemId}, function(){
					fn.callDatabase("related_lemmata", {"one_lemma_id": sLemId});
				});
				
			}
		},

		"opmerking_intern": {
			"editable": true
		}
	}
	
};