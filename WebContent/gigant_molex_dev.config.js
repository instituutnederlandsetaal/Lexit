// list of tables that must be hidden or visible (don't use both, it's a matter of what's the most convenient)
oHiddenTablesList = [];
oShowOnlyTables = ["lemmata_view", "modified_lemmata_view"];




// remember chosen parent

var sChosenParentId = null;

// table general settings
oTableSettingsList = {
		
		
		modified_lemmata_view: {
			
			"button_0":{
				"name": "Lemma en paradigma herstellen",
				"click": function(confTable){
					
					fn.confirm("Zeker weten?", "Weet u het zeker? Als de log groot is, kan deze operatie enige tijd kosten.", 
							function(){
						
						var aRowSelection = fn.getSelectedRowsFrom(confTable);
						
						aRowSelection.each(function(){
							
							var nCurrentNode = this;
							var sLemmaId = fn.getDataFromCellNamed(confTable, nCurrentNode, "lemma_id");
							fn.callFunction("restore_lemma_and_paradigm_and_ids", [sLemmaId], null, null, null, null, 
									function(){
										if (fn.isLastNodeOf(nCurrentNode, aRowSelection))
											fn.refreshTable(confTable);
							});
						});
					});
				}
			}
		},
		

		
		lemmata_view: {
			
			"callback": function(t){
				
				// we need to disable the checkbox of 
				var aRows = fn.getAllRows(t);
				aRows.each(function(){
					var bSourceContainsTelwoorden = (fn.getDataFromCellNamed(t, this, "source")).indexOf("TELWOORDEN")>-1;
					
					if (bSourceContainsTelwoorden)
						{				
						(fn.getCellElement(t, this, "gedrukt")).find("input").attr("disabled", true);						
						}
				});
			},
			"repeat_callback": true,
			
			"size": "90%",
			
			// we need buttons to choose the sources we are interested in
			"button_0":{
				"name": "GB05",
				"bgcolor":"#FBEFEF",
				"textcolor": "black",
				"click": function(t){
					
					var sTableName = fn.getTableName(t);
					
					var filterValues = mt.getDataTableObjectOf(sTableName).fnFilterGet();					
					filterValues["source_gb05"] = (!filterValues["source_gb05"]==false) ? "":true;
					mt.getDataTableObjectOf(sTableName).fnFilterSet(filterValues);
					
					fn.refreshTable(t);
					fn.setCustomButtonCss(t, 0, "background-color", (filterValues["source_gb05"]?"#F5A9A9":"#FBEFEF"));
				}
			},
			"button_1":{
				"name": "MoLex homoniemen",
				"bgcolor":"#FBEFEF",
				"textcolor": "black",
				"click": function(t){
					
					var sTableName = fn.getTableName(t);
					
					var filterValues = mt.getDataTableObjectOf(sTableName).fnFilterGet();					
					filterValues["source_molex_hom"] = (!filterValues["source_molex_hom"]==false) ? "":true;
					mt.getDataTableObjectOf(sTableName).fnFilterSet(filterValues);
					
					fn.refreshTable(t);
					fn.setCustomButtonCss(t, 1, "background-color", (filterValues["source_molex_hom"]?"#F5A9A9":"#FBEFEF"));
				}
			},
			"button_2":{
				"name": "Logfiles",
				"bgcolor":"#FBEFEF",
				"textcolor": "black",
				"click": function(t){
					
					var sTableName = fn.getTableName(t);
					
					var filterValues = mt.getDataTableObjectOf(sTableName).fnFilterGet();					
					filterValues["source_logfiles"] = (!filterValues["source_logfiles"]==false) ? "":true;
					mt.getDataTableObjectOf(sTableName).fnFilterSet(filterValues);
					
					fn.refreshTable(t);
					fn.setCustomButtonCss(t, 2, "background-color", (filterValues["source_logfiles"]?"#F5A9A9":"#FBEFEF"));
				}
			},
			"button_3":{
				"name": "MoLex nieuwe lemmata",
				"bgcolor":"#FBEFEF",
				"textcolor": "black",
				"click": function(t){
					
					var sTableName = fn.getTableName(t);
					
					var filterValues = mt.getDataTableObjectOf(sTableName).fnFilterGet();					
					filterValues["source_molex_nw_lem"] = (!filterValues["source_molex_nw_lem"]==false) ? "":true;
					mt.getDataTableObjectOf(sTableName).fnFilterSet(filterValues);
					
					fn.refreshTable(t);
					fn.setCustomButtonCss(t, 3, "background-color", (filterValues["source_molex_nw_lem"]?"#F5A9A9":"#FBEFEF"));
				}
			},
			"button_4":{
				"name": "MoLex niet-homoniemen",
				"bgcolor":"#FBEFEF",
				"textcolor": "black",
				"click": function(t){
					
					var sTableName = fn.getTableName(t);
					
					var filterValues = mt.getDataTableObjectOf(sTableName).fnFilterGet();					
					filterValues["source_molex_niet_hom"] = (!filterValues["source_molex_niet_hom"]==false) ? "":true;
					mt.getDataTableObjectOf(sTableName).fnFilterSet(filterValues);
					
					fn.refreshTable(t);
					fn.setCustomButtonCss(t, 4, "background-color", (filterValues["source_molex_niet_hom"]?"#F5A9A9":"#FBEFEF"));
				}
			},
			"button_5":{
				"name": "ANW",
				"bgcolor":"#FBEFEF",
				"textcolor": "black",
				"click": function(t){
					
					var sTableName = fn.getTableName(t);
					
					var filterValues = mt.getDataTableObjectOf(sTableName).fnFilterGet();					
					filterValues["source_anw"] = (!filterValues["source_anw"]==false) ? "":true;
					mt.getDataTableObjectOf(sTableName).fnFilterSet(filterValues);
					
					fn.refreshTable(t);
					fn.setCustomButtonCss(t, 5, "background-color", (filterValues["source_anw"]?"#F5A9A9":"#FBEFEF"));
				}
			},
			"button_6":{
				"name": "Telwoord",
				"bgcolor":"#FBEFEF",
				"textcolor": "black",
				"click": function(t){
					
					var sTableName = fn.getTableName(t);
					
					var filterValues = mt.getDataTableObjectOf(sTableName).fnFilterGet();					
					filterValues["source_telw"] = (!filterValues["source_telw"]==false) ? "":true;
					mt.getDataTableObjectOf(sTableName).fnFilterSet(filterValues);
					
					fn.refreshTable(t);
					fn.setCustomButtonCss(t, 6, "background-color", (filterValues["source_telw"]?"#F5A9A9":"#FBEFEF"));
				}
			},
			"button_7":{
				"name": "CHN++",
				"bgcolor":"#FBEFEF",
				"textcolor": "black",
				"click": function(t){
					
					var sTableName = fn.getTableName(t);
					
					var filterValues = mt.getDataTableObjectOf(sTableName).fnFilterGet();					
					filterValues["source_chn"] = (!filterValues["source_chn"]==false) ? "":true;
					mt.getDataTableObjectOf(sTableName).fnFilterSet(filterValues);
					
					fn.refreshTable(t);
					fn.setCustomButtonCss(t, 7, "background-color", (filterValues["source_chn"]?"#F5A9A9":"#FBEFEF"));
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
			
			"source_molex_hom": { "visible": false },			
			"source_molex_nw_lem": { "visible": false },
			"source_molex_niet_hom": { "visible": false },
			"source_logfiles": { "visible": false },
			"source_anw": { "visible": false },
			"source_telw": { "visible": false },
			"source_chn": { "visible": false },
			"source_gb05": { "visible": false },
			
			"pkid":{				
				"visible": false
			},
			"parent_id":{				
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
			"gedrukt":{
				"editable": true
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