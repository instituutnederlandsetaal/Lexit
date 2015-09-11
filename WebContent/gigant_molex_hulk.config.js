// list of tables that must be hidden or visible (don't use both, it's a matter of what's the most convenient)
oHiddenTablesList = [];
oShowOnlyTables = ["lemmata_view"];



fn.setProjectTitle("GigantMolex voor HulK2");

// remember chosen parent

var sChosenParentId = null;

// table general settings
oTableSettingsList = {
		

		

		lemmata_view: {
			
			"prereset_callback": function(confTable){
				
				fn.addFilters(confTable, {"homo": ""});
				
			},
	
			"keyup" : {
				
				
				"f9": function(confTable){
					
					var nNode = fn.getFirstSelectedRowFrom(confTable);
					var sLemmaId = fn.getDataFromCellNamed(confTable, nNode, "pkid");
					fn.callDatabase("lemmata_en_paradigma_view", {"lemma_id": sLemmaId});
				}
			},
			
			"size": "90%"
			
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
				"colsort": "asc",
				"editable": false				
			},
			"th_lemma": {				
				"editable": false,
				"visible": false
			},
			"keurmerk": {				
				"editable": false				
			},
			"sublemma_type": {				
				"editable": false,
				"visible": false
			},
			"opmerking": {				
				"editable": false,
				"visible": false
			},
			"opmerking_intern": {
				"editable": false
			},
			"gloss": {				
				"editable": false				
			},
			"lemma_gigpos": {				
				"editable": false				
			},	
			"gb_id":{				
				"visible": false
			},
			"gb_wrdcat": {
				"editable": false,
				"visible": false
			},
			"gb_znwlid": {
				"editable": false,
				"visible": false
			},
			"lidw": {
				"editable": false,
				"visible": false
			},
			"geslacht": {
				"editable": false,
				"visible": false
			},
			"toon_paradigma":{				
				"button": "Paradigma",
				"click": function( confTable, confNode){					
					var lemma_id = fn.getDataFromSiblingNode(confTable, confNode, "pkid");
					fn.callDatabase("lemmata_en_paradigma_view", {"lemma_id": lemma_id});
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
				"editable": false,
				"visible": false
			},
			"homo":{
				"visible": false,
				"flexible_visibility": false
			},
			"weg": {
				"visible": false,
				"editable": false,
				"flexible_visibility": false
			},
			"taaladvies": {
				"visible": false,
				"editable": false
			},
			"uitspraak": {
				"visible": false,
				"editable": false
			},
			"status": {
				"visible": false,
				"editable": false
			},
			"nuanc_opm": {
				"visible": false,
				"editable": false,
				"flexible_visibility": false
			},
			"taalvariant": {
				"visible": false,
				"editable": false
			},
			"herkomst": {
				"visible": false,
				"editable": false
			},
			"gedrukt":{
				"visible": false
			},
			"verdacht":{
				"visible": false,
				"flexible_visibility": false
			},
			"source":{
				"visible": false,
				"flexible_visibility": false
			}
			
		
			
		},
		
		lemmata_en_paradigma_view: {
			
			unique_id:{
				"visible": false
			},
			analyzed_wordform_id:{
				"visible": false
			}, 
			lemma_id:{
				"visible": false,
				"click": function(t, n){
					var sLemmaId = fn.getDataFromCellNode(t, n);
					fn.callDatabase("lemmata_view", {"pkid": sLemmaId});
				}
			}, 
			wordform_id:{
				"visible": false
			},
			modern_lemma:{
				
				"colsort": "asc",    // sort #1
				"click": function(t, n){
					var sLemmaId = fn.getDataFromSiblingNode(t, n, "lemma_id");
					fn.callDatabase("lemmata_view", {"pkid": sLemmaId});
				}
			}, 
			lemma_gigpos:{
				"click": function(t, n){
					var sLemmaId = fn.getDataFromSiblingNode(t, n, "lemma_id");
					fn.callDatabase("lemmata_view", {"pkid": sLemmaId});
				}
			}, 
			lem_keurmerk:{
				"click": function(t, n){
					var sLemmaId = fn.getDataFromSiblingNode(t, n, "lemma_id");
					fn.callDatabase("lemmata_view", {"pkid": sLemmaId});
				}
			},
			lem_source:{
				"visible": false,
				"click": function(t, n){
					var sLemmaId = fn.getDataFromSiblingNode(t, n, "lemma_id");
					fn.callDatabase("lemmata_view", {"pkid": sLemmaId});
				}
			},
			wordform:{
				"editable": false
			}, 
			wordform_gigpos:{
				"editable": false
				
			}, 
			wordform_afbr:{				
				"editable": false

			},
			afbr_auto:{
				"editable": false
			},
			online: {
				
			},
			publiceren: {
				"bgcolor": "#E0F8EC",
				"editable": false
			},
			wf_keurmerk:{
				"bgcolor": "#E0F8EC",
				"editable": false

			}, 

			
			comment:{
				"bgcolor": "#E0F8EC",
				"editable": false

			},
			comment_intern: {
				
				"bgcolor": "#E0F8EC",
				"editable": false
			},
			wf_source:{
				"visible": false
			}, 
			autom_wf:{
				"visible": false
			}, 
			gedrukt:{
				
				//"filter": true
			},
			vk_status:{
				"visible": false
			},
			th_wordform_afbr:{
				"bgcolor": "#E0F8EC",
				"editable": false
			},
			th_wordform:{
				"bgcolor": "#E0F8EC",
				"editable": false
			}
			
		}
};