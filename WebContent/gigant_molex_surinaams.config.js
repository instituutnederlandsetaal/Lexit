// list of tables that must be hidden or visible (don't use both, it's a matter of what's the most convenient)
oHiddenTablesList = [];
oShowOnlyTables = ["lemmata_view", "lemmata_en_paradigma_view"];



fn.setProjectTitle("GigantMolex SURINAAMS");


//remember chosen parent

var sChosenParentId = null;

// table general settings
oTableSettingsList = {
		
		lemmata_view: {
			
			"prereset_callback": function(confTable){
				
				fn.addFilters(confTable, {"homo": ""});
				
				sChosenParentId = null;
				fn.setCustomButtonName(confTable, 2, "Gekozen ouder:");
				
			},
	
			"keyup" : {
				
				
				"f9": function(confTable){
					
					var nNode = fn.getFirstSelectedRowFrom(confTable);
					var sLemmaId = fn.getDataFromCellNamed(confTable, nNode, "pkid");
					fn.callDatabase("paradigma_view", {"lemma_id": sLemmaId});
				}
			},
			
			"size": "90%",
			"button_0":{
				"name": "Voeg lemma toe",
				"click": function(confTable){
					
					var wordform = fn.prompt("Geef een lemma", 
							["modern_lemma", "lemma_gigpos"], 
							["", ""], 
							function(){
						
						var sLemma = fn.getPromptUserInput("modern_lemma");
						var sLemmaPos = fn.getPromptUserInput("lemma_gigpos");
						
						fn.callFunction("insert_lemma", 
								[sLemma, sLemmaPos], 
								null, null, null, null, function(){
							fn.refreshTable(confTable);
						});
					});
				}
			},
			"button_1":{
				"name": "Verwijder selectie",
				"click": function(confTable){
					
					var answer = confirm("Weet u het zeker?");
					
					if (answer){
						
						var aRows = fn.getSelectedRowsFrom(confTable);
						aRows.each(function(){
							
							var bLastRow = fn.isLastNodeOf(this, aRows);
							var sLemmaId = fn.getDataFromCellNamed(confTable, this, "pkid");
							
							fn.removeFromDatabaseGivenFieldValues("lemmata", 
									{"lemma_id": sLemmaId}, 
									false,
									function(){
										if (bLastRow) fn.refreshTable(confTable);
									});
							
						});
					}
					
				}
			},
			"button_2":{
				"name": "Gekozen ouder:",
				"bgcolor":"yellow",
				"textcolor": "red",
				"click": function(confTable){
					
					var nNode = fn.getFirstSelectedRowFrom(confTable);
					
					if (nNode != null)
						{
						// remember chosen parent, and show it on the screen
						var sLemId = fn.getDataFromCellNamed(confTable, nNode, "pkid");
						var sLemma = fn.getDataFromCellNamed(confTable, nNode, "modern_lemma");
						
						fn.setCustomButtonName(confTable, 2, "Gekozen ouder:<b>"+sLemma+"</b>");
						sChosenParentId = sLemId;
						}

				}
			},
			"button_3":{
				"name": "Link ouder & kind",
				"bgcolor":"red",
				"textcolor": "yellow",
				"click": function(confTable){
					
					if (sChosenParentId != null)
						{
						var oNodes = fn.getSelectedRowsFrom(confTable);
						if (oNodes != null)
							{
							
							oNodes.each(function(){
								
								var sLemId = fn.getDataFromCellNamed(confTable, this, "pkid");
								var bLastNode = fn.isLastNodeOf(this, oNodes);
								fn.updateDatabaseGivenFieldValues("lemmata", 
										{"lemma_id": sLemId}, 
										{"parent_id": sChosenParentId}, 
										false,
										function(){
											if (bLastNode)
												{
												fn.refreshTable(confTable);
												// reset: no chosen parent
												fn.setCustomButtonName(confTable, 2, "Gekozen ouder:");
												sChosenParentId = null;
												}
										});
							});
							
							
							}
						else
							{
							alert("Kies een of meerdere sublemmata!");
							}
						
						
						}
					else
						{
						alert("Kies eerst een parent lemma!");
						}
				}
			},
			"button_4": {
				
				"name": "Unlink ouder",
				"bgcolor":"red",
				"textcolor": "yellow",
				"click": function(confTable){
					
					var oNodes = fn.getSelectedRowsFrom(confTable);
					if (oNodes != null)
						{
						oNodes.each(function(){
							var sLemId = fn.getDataFromCellNamed(confTable, this, "pkid");
							var bLastNode = fn.isLastNodeOf(this, oNodes);
							fn.updateDatabaseGivenFieldValues("lemmata", 
									{"lemma_id": sLemId}, 
									{"parent_id": 0}, 
									false,
									function(){
										if (bLastNode)
											{
											fn.refreshTable(confTable);
											// reset: no chosen parent
											fn.setCustomButtonName(confTable, 2, "Gekozen ouder:");
											sChosenParentId = null;
											}
									});
							});
						}
					else
						{
						alert("Kies een of meerdere sublemmata!");
						}
					
					
				}
			},
			"button_5": {
			
				"name": "Homo's only",
				"bgcolor":"green",
				"textcolor": "white",
				"click": function(confTable){
					
					fn.addFilters(confTable, {"homo": true});
					fn.refreshTable(confTable);
					//fn.callDatabase(confTable, {"homo": true});
					
				}
				
			}
			
		},
		
		paradigma_view: {
			
			
			"size": "90%",
			"button_0":{
				"name": "Voeg woordvorm toe",
				"click": function(confTable){
					
					var aAllRows;
					var sLemmaId;
					var sLemma = null;
					
					// is there is no paradigm yet, get the lemma id from the lemma table
					if (fn.tableIsEmpty(confTable))
						{
						aAllRows = fn.getSelectedRowsFrom("lemmata_view");
						sLemmaId = fn.getDataFromCellNamed("lemmata_view", aAllRows[0], "pkid");
						sLemma =  fn.getDataFromCellNamed("lemmata_view", aAllRows[0], "modern_lemma");
						}
					// otherwise just read it from the current table
					else
						{
						aAllRows = fn.getAllRows(confTable);
						sLemmaId = fn.getDataFromCellNamed(confTable, aAllRows[0], "lemma_id");
						// in this particular case, sLemma will be
						// requested by following fn.getRecord call
						}
					
					
					
					fn.getRecord("lemmata", sLemmaId, function(response){
					
						// if we don't have a modern_lemma to show, get it
						
						if (sLemma == null)
							sLemma =  response["modern_lemma"];						
						
						fn.prompt("Geef woordvorm voor '"+sLemma+"'", 
								["woordvorm", "wordform_gigpos"], 
								["", ""], 
								function(){
							
								var sWordform = fn.getPromptUserInput("woordvorm");
								var sWordformPos = fn.getPromptUserInput("wordform_gigpos");
							
								fn.callFunction("insert_wordform", 
										[sLemmaId, sWordform, sWordformPos], 
										null, null, null, null, function(){
									fn.refreshTable(confTable);
								});
							});
							
						});					
					
				}
			},
			"button_1":{
				
				"name": "Verwijder selectie",
				"click": function(confTable){
					
					var answer = confirm("Weet u het zeker?");
					
					if (answer){
						
						var aRows = fn.getSelectedRowsFrom(confTable);
						aRows.each(function(){
							
							var bLastRow = fn.isLastNodeOf(this, aRows);
							var sAnalyzedWfId = fn.getDataFromCellNamed(confTable, this, "pkid");
							
							fn.removeFromDatabaseGivenFieldValues("analyzed_wordforms", 
									{"analyzed_wordform_id": sAnalyzedWfId}, 
									false,
									function(){
										if (bLastRow) fn.refreshTable(confTable);
									});
							
						});
					}
					
				}
			}
		}
	
		
};


// configuration at column level
oTableConfigurationList = {
		
		
		modified_lemmata_view: {
			"modification_date":{
				"colsort": "desc" // sort #1
			},
			"modification_time": {
				"colsort": "desc" // sort #2
			}
		},
		
		modified_paradigm_view: {
			"modification_date":{
				"colsort": "desc" // sort #1
			},
			"modification_time": {
				"colsort": "desc" // sort #2
			}
		},
		
		
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
				"colsort": "asc",
				"editable": true
			},
			"th_lemma": {				
				"editable": true				
			},
			"keurmerk": {				
				"editable": true				
			},
			"sublemma_type": {				
				"editable": true				
			},
			"opmerking": {				
				"editable": true
			},
			"opm_sn": {				
				"editable": true
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
				"editable": true
			},
			"opmerking_intern": {
				// BEWARE, DON'T REMOVE THIS PART
				// ------------------------------
				"flexible_visibility": false,
				"visible": (document.URL.indexOf( "gtb.dev.inl.loc" )>-1),
				// ------------------------------
				"editable": true
			},
			"gloss": {				
				"editable": true				
			},
			"lemma_gigpos": {				
				"editable": true				
			},	
			"gb_id":{				
				"visible": false
			},
			"gb_wrdcat": {
				"editable": true
			},
			"gb_znwlid": {
				"editable": true
			},
			"lidw": {
				"editable": true,
				"visible": false
			},
			"geslacht": {
				"editable": true,
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
				"editable": true,
				"visible": false
			},
			"homo":{
				
			},
			"weg": {
				"editable": true
			},
			"taaladvies": {
				"editable": true
			},
			"uitspraak": {
				"editable": true
			},
			"status": {
				"editable": true
			},
			"notitie": {
				"editable": true
			},
			"nuanc_opm": {
				"editable": true
			},
			"taalvariant": {
				"editable": true
			},
			"herkomst": {
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
				"editable": true
			},
			"typisch_sn":{
				"editable": true
			},
			"taalvariant":{
				"editable": true
			},
			"wordform_afbr":{				
				"editable": true
			},
			"th_wordform": {				
				"visible": false				
			},
			"th_wordform_afbr": {				
				"visible": false				
			},
			"wordform_gigpos":{				
				"editable": true
			},
			"flex":{				
				"editable": true
			},
			"keurmerk":{				
				"editable": true
			},
			"comment": {
				"editable": true
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
				"colsort": "asc"				
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
									fn.refreshTable(t);
									});
					else
						fn.refreshTable(t);
				}
			},
			"taalvariant":{
				"editable": true,
				"editfunc": function(t, n, value){
					
					var sAwfId = fn.getDataFromCellNamed(t, n, "analyzed_wordform_id");
					
					// if we have an awf-id
					// update this 'view' but also the analyzed_wordforms table
					if (sAwfId != null && sAwfId != '')
						fn.updateDatabaseGivenFieldValues(t, 
								{"analyzed_wordform_id": sAwfId}, 
								{"taalvariant": value}, 
								false, 
								function(){
									fn.updateDatabaseGivenFieldValues("analyzed_wordforms", 
											{"analyzed_wordform_id": sAwfId}, 
											{"taalvariant": value});
									fn.refreshTable(t);
									});
					else
						fn.refreshTable(t);
				}
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
			}
			
		}
};