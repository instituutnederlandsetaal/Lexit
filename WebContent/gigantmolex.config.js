// list of tables that must be hidden or visible (don't use both, it's a matter of what's the most convenient)
oHiddenTablesList = [];
oShowOnlyTables = ["lemmata_view"];





// ************************************************************
// **                                                        **
// **      Gigant Molex for Spellingcommission               **
// **                                                        **
// **      2014-06-25                                        **
// **                                                        **
// ************************************************************



// remember chosen parent

var sChosenParentId = null;

// table general settings
oTableSettingsList = {
		

		
		lemmata_view: {
			
			"size": "90%",
			
			// we need buttons to choose the sources we are interested in
			"button_0":{
				"name": "GB05",
				"bgcolor":"#FBEFEF",
				"textcolor": "black",
				"click": function(t){
					
					var sTableName = fn.getTableName(t);
					
					var filterValues = mt.getDataTableObjectOf(sTableName).fnFilterGet(sTableName);					
					filterValues["gb05"] = (!filterValues["gb05"]==false) ? "":true;
					mt.getDataTableObjectOf(sTableName).fnFilterSet(sTableName, filterValues);
					
					fn.refreshTable(t);
					fn.setCustomButtonCss(t, 0, "background-color", (filterValues["gb05"]?"#F5A9A9":"#FBEFEF"));
				}
			},
			"button_1":{
				"name": "MoLex homoniemen",
				"bgcolor":"#FBEFEF",
				"textcolor": "black",
				"click": function(t){
					
					var sTableName = fn.getTableName(t);
					
					var filterValues = mt.getDataTableObjectOf(sTableName).fnFilterGet(sTableName);					
					filterValues["molex_hom"] = (!filterValues["molex_hom"]==false) ? "":true;
					mt.getDataTableObjectOf(sTableName).fnFilterSet(sTableName, filterValues);
					
					fn.refreshTable(t);
					fn.setCustomButtonCss(t, 1, "background-color", (filterValues["molex_hom"]?"#F5A9A9":"#FBEFEF"));
				}
			},
			"button_2":{
				"name": "Logfiles paradigma-uitbreiding",
				"bgcolor":"#FBEFEF",
				"textcolor": "black",
				"click": function(t){
					
					var sTableName = fn.getTableName(t);
					
					var filterValues = mt.getDataTableObjectOf(sTableName).fnFilterGet(sTableName);					
					filterValues["prdgm_uitbr"] = (!filterValues["prdgm_uitbr"]==false) ? "":true;
					mt.getDataTableObjectOf(sTableName).fnFilterSet(sTableName, filterValues);
					
					fn.refreshTable(t);
					fn.setCustomButtonCss(t, 2, "background-color", (filterValues["prdgm_uitbr"]?"#F5A9A9":"#FBEFEF"));
				}
			},
			"button_3":{
				"name": "MoLex nieuwe lemmata",
				"bgcolor":"#FBEFEF",
				"textcolor": "black",
				"click": function(t){
					
					var sTableName = fn.getTableName(t);
					
					var filterValues = mt.getDataTableObjectOf(sTableName).fnFilterGet(sTableName);					
					filterValues["molex_nw_lem"] = (!filterValues["molex_nw_lem"]==false) ? "":true;
					mt.getDataTableObjectOf(sTableName).fnFilterSet(sTableName, filterValues);
					
					fn.refreshTable(t);
					fn.setCustomButtonCss(t, 3, "background-color", (filterValues["molex_nw_lem"]?"#F5A9A9":"#FBEFEF"));
				}
			},
			"button_4":{
				"name": "MoLex niet-homoniemen",
				"bgcolor":"#FBEFEF",
				"textcolor": "black",
				"click": function(t){
					
					var sTableName = fn.getTableName(t);
					
					var filterValues = mt.getDataTableObjectOf(sTableName).fnFilterGet(sTableName);					
					filterValues["molex_niet_hom"] = (!filterValues["molex_niet_hom"]==false) ? "":true;
					mt.getDataTableObjectOf(sTableName).fnFilterSet(sTableName, filterValues);
					
					fn.refreshTable(t);
					fn.setCustomButtonCss(t, 4, "background-color", (filterValues["molex_niet_hom"]?"#F5A9A9":"#FBEFEF"));
				}
			}

			
		},
		paradigma_view: {
			
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
			
			"molex_hom": { "visible": false },
			"prdgm_uitbr": { "visible": false },
			"molex_nw_lem": { "visible": false },
			"molex_niet_hom": { "visible": false },
			"gb05": { "visible": false },
			
			"pkid":{				
				"visible": false
			},
			"parent":{
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
				"visible": false,
				"flexible_visibility": false
			},
			"sublemma_type": {				
			},
			"opmerking": {
				"bgcolor": "#E0F8EC",
				"editable": true
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
				"button": "Morfologie",
				"click": function( confTable, confNode){					
					var lemma_id = fn.getDataFromSiblingNode(confTable, confNode, "pkid");
					fn.callDatabase("morphological_view", {"main_lemma_id": lemma_id});
				}
			},
			"trademark": {
				"visible": false
			},
			"homo":{
				"visible": false
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
				"visible": false,
				"flexible_visibility": false
			},
			"comment": {
				
			},
			
			"rang":{			
				"colsort": "asc",
				"visible": false
			}
			
		}
};