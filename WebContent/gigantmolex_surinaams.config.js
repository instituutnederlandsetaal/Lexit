// list of tables that must be hidden or visible (don't use both, it's a matter of what's the most convenient)
oHiddenTablesList = [];
oShowOnlyTables = ["lemmata_view", "lemmata_en_paradigma_view"];



fn.setProjectTitle("GigantMolex SURINAAMS");


// table general settings
oTableSettingsList = {
		
		lemmata_view: {
			
			"keyup" : {
				
				
				"f9": function(confTable){
					
					var nNode = fn.getFirstSelectedRowFrom(confTable);
					var sLemmaId = fn.getDataFromCellNamed(confTable, nNode, "pkid");
					fn.callDatabase("paradigma_view", {"lemma_id": sLemmaId});
				}
			}
		}
		
};


// configuration at column level
oTableConfigurationList = {
		
		
		
		morphological_view: {
			
			morphological_analysis_id: {
				"visible": false
			},
			main_lemma_id: {
				"visible": false
			},
			part_morphological_analysis_id: {
				"visible": false
			},
			part_lemma_id: {
				"visible": false
			}
		},
		

		

		lemmata_view: {
			
			"pkid":{				
				"visible": false
			},
			"sn_lemma_id":{				
				"visible": false
			},
			"parent_id":{
				"visible": false
			},
			"parent":{
				"visible": false,
				"cell_tooltip": "Toon alle lemmata behorend bij dit superlemma",
				"click": function(t, n){
					var sLemma = fn.getDataFromCellNode(t, n);
					if (sLemma!='')
						fn.callDatabase(t, {"parent": sLemma});
				}
			},
			"modern_lemma": {		
				"colsort": "asc"				
			},
			"th_lemma": {				
								
			},
			"keurmerk": {				
								
			},
			"sublemma_type": {				
				"visible": false				
			},
			"opmerking": {				
				"editable": true
			},
			"opm_sn": {				
				
			},
			"english": {				
				"editable": true
			},
			"sranan": {				
				"editable": true
			},
			"typisch_sn": {				
				"editable": true
			},
			"themacode": {				
				
			},
			"opmerking_intern": {
				// BEWARE, DON'T REMOVE THIS PART
				// ------------------------------
				"flexible_visibility": false,
				"visible": (document.URL.indexOf( "gtb.dev.inl.loc" )>-1)
				// ------------------------------
				
			},
			"gloss": {				
								
			},
			"lemma_gigpos": {				
								
			},	
			"gb_id":{				
				"visible": false
			},
			"gb_wrdcat": {
				
			},
			"gb_znwlid": {
				
			},
			"lidw": {				
				"visible": false
			},
			"geslacht": {				
				"visible": false
			},
			"toon_paradigma":{				
				"button": "Paradigma",
				"click": function( confTable, confNode){					
					var lemma_id = fn.getDataFromSiblingNode(confTable, confNode, "pkid");
					fn.callDatabase("paradigma_view", {"lemma_id": lemma_id});
				}
			},
			"toon_morfologie":{			
				"visible": false,
				"button": "Morfologie",
				"click": function( confTable, confNode){					
					var lemma_id = fn.getDataFromSiblingNode(confTable, confNode, "pkid");
					fn.callDatabase("morphological_view", {"main_lemma_id": lemma_id});
				}
			},
			"trademark": {
				
				"visible": false
			},
			
			"weg": {
				"visible": false
			},
			"taaladvies": {
				"visible": false
			},
			"uitspraak": {
				"visible": false
			},
			"nuanc_opm": {
				"visible": false
			},
			"taalvariant": {
				
			},
			"gedrukt":{
				
			},
			"herkomst": {
				
			}
			
		},
		
		paradigma_view: {
			"pkid":{				
				"visible": false
			},
			"lemma_id":{				
				"visible": false
			},
			"wordform_id":{				
				"visible": false
			},
			"pkid":{				
				"visible": false
			},
			"wordform":{	
				
			},
			"typisch_sn":{
				"editable": true,
				"editcallback": function(t, n, value){
					
					var sAwfId = fn.getDataFromCellNamed(t, n, "pkid");
					
					// if we have an awf-id
					// update also the lemmata_en_paradigma_view table
					if (sAwfId != null && sAwfId != '')
						fn.updateDatabaseGivenFieldValues("lemmata_en_paradigma_view", 
								{"analyzed_wordform_id": sAwfId}, 
								{"typisch_sn": value}, 
								false);
				}
			},
			"taalvariant":{
				
			},
			"wordform_afbr":{				
				
			},
			"th_wordform": {				
				"visible": false				
			},
			"th_wordform_afbr": {				
				"visible": false				
			},
			"wordform_gigpos":{				
				
			},
			"flex":{				
				
			},
			"keurmerk":{				
				
			},
			"comment": {
				"editable": true,
				"editcallback": function(t, n, value){
					
					var sAwfId = fn.getDataFromCellNamed(t, n, "pkid");
					
					// if we have an awf-id
					// update also the lemmata_en_paradigma_view table
					if (sAwfId != null && sAwfId != '')
						fn.updateDatabaseGivenFieldValues("lemmata_en_paradigma_view", 
								{"analyzed_wordform_id": sAwfId}, 
								{"comment": value}, 
								false);
				}
			},			
			"rang":{			
				"colsort": "asc",
				"visible": false
			}
			
		},
		
		lemmata_en_paradigma_view: {
			
			
			"analyzed_wordform_id":{				
				"visible": false
			},
			
			"modern_lemma": {				
				"colsort": "asc"			// sort #1	
			},
			"th_lemma": {
				"visible": false
			},
			"keurmerk": {
				"visible": false,
				"flexible_visibility": false
			},
			"typisch_sn":{
				"editable": true,
				"editfunc": function(t, n, value){
					
					var sAwfId = fn.getDataFromCellNamed(t, n, "analyzed_wordform_id");
					
					// if we have an awf-id
					// update this 'view' but also the analyzed_wordforms table
					if (sAwfId != null && sAwfId != '')
						fn.updateDatabaseGivenFieldValues(t, 
								{"analyzed_wordform_id": sAwfId}, 
								{"typisch_sn": value}, 
								false, 
								function(){
									fn.updateDatabaseGivenFieldValues("analyzed_wordforms", 
											{"analyzed_wordform_id": sAwfId}, 
											{"typisch_sn": value});
									});
					else
						fn.refreshTable(t);
				}
			},
			"taalvariant":{
//				"editable": true,
//				"editfunc": function(t, n, value){
//					
//					var sAwfId = fn.getDataFromCellNamed(t, n, "analyzed_wordform_id");
//					
//					// if we have an awf-id
//					// update this 'view' but also the analyzed_wordforms table
//					if (sAwfId != null && sAwfId != '')
//						fn.updateDatabaseGivenFieldValues(t, 
//								{"analyzed_wordform_id": sAwfId}, 
//								{"taalvariant": value}, 
//								false, 
//								function(){
//									fn.updateDatabaseGivenFieldValues("analyzed_wordforms", 
//											{"analyzed_wordform_id": sAwfId}, 
//											{"taalvariant": value});
//									});
//					else
//						fn.refreshTable(t);
//				}
			},
			"sublemma_type": {		
				"visible": false 
			},
			"opmerking": {
				"visible": false
			},
			"gloss": {				
			},
			"lemma_gigpos": {				
			},	
			"gb_id":{				
				"visible": false
			},
			"gb_wrdcat": {
				"visible": false // ?
			},
			"gb_znwlid": {
				"visible": false // ?
			},
			"lidw": {
				"visible": false
			},
			"geslacht": {
				"visible": false
			},			
	
			
			"trademark": {
				"visible": false
			},
			"gedrukt":{
				"editable": true
			},
			
			"lemma_id":{				
				"visible": false
			},
			"wordform_id":{				
				"visible": false
			},
			"wordform":{	
			},

			"wordform_afbr":{				
				
			},
			"th_wordform": {				
				"visible": false				
			},
			"th_wordform_afbr": {				
				"visible": false				
			},
			"wordform_gigpos":{				
				"colsort": "asc"	// sort #2
			},

			"comment": {
				"bgcolor": "#E0F8EC",
				"editable": true,
				"editfunc": function(t, n, value){
					
					var sAwfId = fn.getDataFromCellNamed(t, n, "analyzed_wordform_id");
					
					// if we have an awf-id
					// update this 'view' but also the analyzed_wordforms table
					if (sAwfId != null && sAwfId != '')
						fn.updateDatabaseGivenFieldValues(t, 
								{"analyzed_wordform_id": sAwfId}, 
								{"comment": value}, 
								false, 
								function(){
									fn.updateDatabaseGivenFieldValues("analyzed_wordforms", 
											{"analyzed_wordform_id": sAwfId}, 
											{"comment": value});
									});
					else
						fn.refreshTable(t);
				}
			},
			
			"rang":{			
				"colsort": "asc",
				"visible": false
			},
			"autom_wf":{
				"visible": false
			},
			"wordform_source":{
				"visible": false
			}
			
		}
};
