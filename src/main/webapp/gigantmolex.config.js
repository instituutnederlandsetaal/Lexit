// list of tables that must be hidden or visible (don't use both, it's a matter of what's the most convenient)
oHiddenTablesList = [];
oShowOnlyTables = ["lemmata_view", "lemmata_en_paradigma_view"];





// ************************************************************
// **                                                        **
// **      Gigant Molex for Spellingcommission               **
// **                                                        **
// **      2015-07-24                                        **
// **                                                        **
// ************************************************************



// remember chosen parent
var sChosenParentId = null;

// column not allowed in this installation
var sColumnCheck = "opmerking_intern";
var sColumnCheck2 = "comment_intern";



// table general settings
oTableSettingsList = {
		

		lemmata_en_paradigma_view: {
			
			"size": "80%",
			
			// column check
			"callback": function(t){
				
				var sTableName = fn.getTableName(t);
				
				(fn.getAllRows(t)).each(function(){					
					
					// diminutives must be green
					var sVerkleinwoord = fn.getDataFromCellNamed(t, this, "verkleinwoord");
					if (sVerkleinwoord != '-')
						{
						var aColList = mt.getListOfVisibleColumnsOf(sTableName);
						for (var i=0; i<aColList.length; i++)
							{
							var sColName = aColList[i];
							(fn.getCellElement(t, this, sColName)).css("color", "green");						
							}
						}
					
				});

				
				if (	$.inArray(sColumnCheck,  mt.getListOfColumnsOf("lemmata_en_paradigma_view"))>-1 ||
						$.inArray(sColumnCheck2, mt.getListOfColumnsOf("lemmata_en_paradigma_view"))>-1	
						)
					{
					$("#container").empty();
					fn.message("Let op", "Illegale kolom in deze installatie");
					}					
					
			},
			"repeat_callback": true

		},
		
		lemmata_view: {
			
			// when pressing the reset button, reset all custom buttons as well
			"prereset_callback": function(t){
				
				// set neutral values for filters
				/*
				var filterValues = t.getSearchFilters();
				filterValues["source_gb05"] = "";
				filterValues["source_molex_hom"] = "";
				filterValues["source_logfiles"] = "";
				filterValues["source_molex_nw_lem"] = "";
				filterValues["source_molex_niet_hom"] = "";
				filterValues["source_anw"] = "";
				filterValues["source_telw"] = "";
				filterValues["source_chn"] = "";
				t.setSearchFilters(filterValues);
				
				// give all buttons neutral color
				for (var i=0; i<=7; i++)
					{
					fn.setCustomButtonCss(t, i, "background-color", "#FBEFEF");
					}
				*/
				
			},
			
			"callback": function(t){
				
				// column check
				if ($.inArray(sColumnCheck, mt.getListOfColumnsOf("lemmata_view"))>-1)
					{
					$("#container").empty();
					fn.message("Let op", "Illegale kolom in deze installatie");
					}
				
				
				// keep color of all buttons uptodate
				/*
				var filterValues = t.getSearchFilters();
				fn.setCustomButtonCss(t, 0, "background-color", (filterValues["source_gb05"]?"#F5A9A9":"#FBEFEF"));
				fn.setCustomButtonCss(t, 1, "background-color", (filterValues["source_molex_hom"]?"#F5A9A9":"#FBEFEF"));
				fn.setCustomButtonCss(t, 2, "background-color", (filterValues["source_logfiles"]?"#F5A9A9":"#FBEFEF"));
				fn.setCustomButtonCss(t, 3, "background-color", (filterValues["source_molex_nw_lem"]?"#F5A9A9":"#FBEFEF"));
				fn.setCustomButtonCss(t, 4, "background-color", (filterValues["source_molex_niet_hom"]?"#F5A9A9":"#FBEFEF"));
				fn.setCustomButtonCss(t, 5, "background-color", (filterValues["source_anw"]?"#F5A9A9":"#FBEFEF"));
				fn.setCustomButtonCss(t, 6, "background-color", (filterValues["source_telw"]?"#F5A9A9":"#FBEFEF"));
				fn.setCustomButtonCss(t, 7, "background-color", (filterValues["source_chn"]?"#F5A9A9":"#FBEFEF"));
				*/
			
				// give parent other color (so they are recognizable)
				var sTableName = fn.getTableName(t);
				
				var aRows = fn.getAllRows(t);
				aRows.each(function(){
					
					// parents must be redish
					var bIsParent = fn.getDataFromCellNamed(t, this, "is_parent");
					if (bIsParent == 't')
						{
						var aColList = mt.getListOfVisibleColumnsOf(sTableName);
						for (var i=0; i<aColList.length; i++)
							{
							var sColName = aColList[i];
							(fn.getCellElement(t, this, sColName)).css("color", "salmon");						
							}
						}
					
					// diminutives must be green
					var sVerkleinwoord = fn.getDataFromCellNamed(t, this, "verkleinwoord");
					if (sVerkleinwoord != '-')
						{
						var aColList = mt.getListOfVisibleColumnsOf(sTableName);
						for (var i=0; i<aColList.length; i++)
							{
							var sColName = aColList[i];
							(fn.getCellElement(t, this, sColName)).css("color", "green");						
							}
						}
					
					});
			},
			"repeat_callback": true,
			
			"size": "90%" //,
			
			
			// we need buttons to choose the sources we are interested in
				
			/*
			"button_0":{
				"name": "GB05",
				"bgcolor":"#FBEFEF",
				"textcolor": "black",
				"click": function(t){
					
					var filterValues = t.getSearchFilters();					
					filterValues["source_gb05"] = (!filterValues["source_gb05"]==false) ? "":true;
					t.setSearchFilters(filterValues);
					
					fn.refreshTable(t);
					fn.setCustomButtonCss(t, 0, "background-color", (filterValues["source_gb05"]?"#F5A9A9":"#FBEFEF"));
				}
			},
			"button_1":{
				"name": "MoLex homoniemen",
				"bgcolor":"#FBEFEF",
				"textcolor": "black",
				"click": function(t){
					
					var filterValues = t.getSearchFilters();					
					filterValues["source_molex_hom"] = (!filterValues["source_molex_hom"]==false) ? "":true;
					t.setSearchFilters(filterValues);
					
					fn.refreshTable(t);
					fn.setCustomButtonCss(t, 1, "background-color", (filterValues["source_molex_hom"]?"#F5A9A9":"#FBEFEF"));
				}
			},
			"button_2":{
				"name": "Logfiles",
				"bgcolor":"#FBEFEF",
				"textcolor": "black",
				"click": function(t){
					
					var filterValues = t.getSearchFilters();					
					filterValues["source_logfiles"] = (!filterValues["source_logfiles"]==false) ? "":true;
					t.setSearchFilters(filterValues);
					
					fn.refreshTable(t);
					fn.setCustomButtonCss(t, 2, "background-color", (filterValues["source_logfiles"]?"#F5A9A9":"#FBEFEF"));
				}
			},
			"button_3":{
				"name": "MoLex nieuwe lemmata",
				"bgcolor":"#FBEFEF",
				"textcolor": "black",
				"click": function(t){
					
					var filterValues = t.getSearchFilters();					
					filterValues["source_molex_nw_lem"] = (!filterValues["source_molex_nw_lem"]==false) ? "":true;
					t.setSearchFilters(filterValues);
					
					fn.refreshTable(t);
					fn.setCustomButtonCss(t, 3, "background-color", (filterValues["source_molex_nw_lem"]?"#F5A9A9":"#FBEFEF"));
				}
			},
			"button_4":{
				"name": "MoLex niet-homoniemen",
				"bgcolor":"#FBEFEF",
				"textcolor": "black",
				"click": function(t){
					
					var filterValues = t.getSearchFilters();					
					filterValues["source_molex_niet_hom"] = (!filterValues["source_molex_niet_hom"]==false) ? "":true;
					t.setSearchFilters(filterValues);
					
					fn.refreshTable(t);
					fn.setCustomButtonCss(t, 4, "background-color", (filterValues["source_molex_niet_hom"]?"#F5A9A9":"#FBEFEF"));
				}
			},
			"button_5":{
				"name": "ANW",
				"bgcolor":"#FBEFEF",
				"textcolor": "black",
				"click": function(t){
					
					var filterValues = t.getSearchFilters();					
					filterValues["source_anw"] = (!filterValues["source_anw"]==false) ? "":true;
					t.setSearchFilters(filterValues);
					
					fn.refreshTable(t);
					fn.setCustomButtonCss(t, 5, "background-color", (filterValues["source_anw"]?"#F5A9A9":"#FBEFEF"));
				}
			},
			"button_6":{
				"name": "Telwoord",
				"bgcolor":"#FBEFEF",
				"textcolor": "black",
				"click": function(t){
					
					var filterValues = t.getSearchFilters();					
					filterValues["source_telw"] = (!filterValues["source_telw"]==false) ? "":true;
					t.setSearchFilters(filterValues);
					
					fn.refreshTable(t);
					fn.setCustomButtonCss(t, 6, "background-color", (filterValues["source_telw"]?"#F5A9A9":"#FBEFEF"));
				}
			},
			"button_7":{
				"name": "CHN++",
				"bgcolor":"#FBEFEF",
				"textcolor": "black",
				"click": function(t){
					
					var filterValues = t.getSearchFilters();					
					filterValues["source_chn"] = (!filterValues["source_chn"]==false) ? "":true;
					t.setSearchFilters(filterValues);
					
					fn.refreshTable(t);
					fn.setCustomButtonCss(t, 7, "background-color", (filterValues["source_chn"]?"#F5A9A9":"#FBEFEF"));
				}
			}
*/
			
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
			"is_parent": {				
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
				"visible": false
			},
			"keurmerk": {
				"visible": false
			},
			"sublemma_type": {				
			},
			"opmerking": {
				"bgcolor": "#E0F8EC",
				"visible": false,
				"editable": false //true
			},
			"opmerking_intern": {
				// BEWARE, DON'T REMOVE THIS PART
				// ------------------------------
				"flexible_visibility": false,
				"visible": (document.URL.indexOf( "inl.loc" )>-1),
				// ------------------------------
				"visible": false,
				"editable": false // true
			},
			"gloss": {				
			},
			"lemma_gigpos": {				
			},	
			"gb_id":{				
				"visible": false
			},
			"gb_wrdcat": {
				"visible": false
			},
			"gb_znwlid": {
				"visible": false
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
				"visible": false
			},
			"notitie":{
				"bgcolor": "#E0F8EC",
				"visible": false,
				"editable": false //true
				
			},
			"gedrukt":{

			},
			"verkleinwoord": {
				
			},
			"f_chn_rel":{
				"visible": false
			},
			"f_wdnlijst_rel":{
				"visible": false
			},
			"f_total_rel":{
				"visible": false
			},
			"source":{
				"visible": false
			},
			"uitspraak":{
				"visible": false
			}	
			
			
		},
		

		
		// *****************
		
		lemmata_en_paradigma_view: {
			
		
			"analyzed_wordform_id":{				
				"visible": false
			},
			
			"is_parent": {
				"visible": false
			},
			
			"verkleinwoord": {
				"visible": false
			},
			
			"modern_lemma": {				
				"colsort": "asc"				
			},
			"th_lemma": {
				"visible": false
			},
			"keurmerk": {
				"visible": false,
				"flexible_visibility": false
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
				"visible": false 
			},
			"gb_znwlid": {
				"visible": false 
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
				
			},

			"comment": {
				"bgcolor": "#E0F8EC",
				"editable": false, //true,
				"visible": false,
				"editfunc": function(t, n, value){
					
					var sAwfId = fn.getDataFromCellNamed(t, n, "analyzed_wordform_id");
					
					// BEWARE:
					// in external installation, the synchronizing function is removed
					// so we need this piece of code (even though it was removed
					// from the internal installation, where the synchronizing function
					// does the job)
					
					// if we have an awf-id
					// update this 'view' but also the analyzed_wordforms table
					// (but if we have no awf, write nothing here nor in awf table)
					if (sAwfId != null && sAwfId != '')
						fn.updateDatabaseGivenFieldValues(t, 
								{"analyzed_wordform_id": sAwfId}, 
								{"comment": value}, 
								function(){
									fn.updateDatabaseGivenFieldValues("analyzed_wordforms", 
											{"analyzed_wordform_id": sAwfId}, 
											{"comment": value});
									fn.refreshTable(t);
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
			},
			"unique_id": {
				"visible": false
			}
			
		}
		
		
		
};