// list of tables that must be hidden or visible (don't use both, it's a matter of what's the most convenient)
oHiddenTablesList = [];
oShowOnlyTables = (fn.getCurrentUser() == 'boukje') ?
		["lemmata_view", "modified_lemmata_view", "modified_paradigm_view", 
                   "keurmerk_checklist", "gemiste_paradigma_correcties"]
	:
		[
		 //"lemmata_view_intern", 
		 "modified_lemmata_view", "modified_paradigm_view",
		 "lemmata_view", 
		 "lemmata_en_paradigma_view", "paradigma_view", "analyzed_wordforms", "lemmata"
		 ];


		
// warn if some accesses this by mistakes
if ( document.URL.indexOf( INL_HOMEURL )>-1 ){

	fn.message("Let op", "Dit is een testversie");
}


// remember chosen parent

var sChosenParentId = null;




// function needed in 'keurmerk_checklist' table
var fnArrowFunction = function(t){
	
	var n = fn.getFirstSelectedRowFrom(t);
	
	var iAwfId = fn.getDataFromCellNamed(t, n, "analyzed_wordform_id");
	var iLemmaId = fn.getDataFromCellNamed(t, n, "lemma_id");
	
	fn.callDatabase("paradigma_view", {"lemma_id": iLemmaId});
};

// table general settings
oTableSettingsList = {
		
		
		lemmata_en_paradigma_view:{
			
			"repeat_callback": true,
			
			"callback": function(t){
				
				(fn.getAllRows(t)).each(function(){
					
					var sAwfId = fn.getDataFromCellNamed(t, this, "analyzed_wordform_id");
					if (sAwfId == '')
						{
						fn.getCellElement(t, this, "wordform").hide();
						fn.getCellElement(t, this, "wordform_gigpos").hide();
						fn.getCellElement(t, this, "wf_keurmerk").hide();
						fn.getCellElement(t, this, "comment").hide();
						}
				});
			},
			
			"button_0":{
				"name": "Voeg woordvorm toe",
				"click": function(t){
					
					var aAllRows = fn.getSelectedRowsFrom(t);
					
					if (aAllRows.length>0)
						{
						
						var sLemmaId = fn.getDataFromCellNamed(t, aAllRows[0], "lemma_id");
						var sModLemma = fn.getDataFromCellNamed(t, aAllRows[0], "modern_lemma");
						
						fn.prompt("Geef woordvorm voor '"+sModLemma+"'", 
								["woordvorm", "wordform_gigpos"], 
								["", ""], 
								function(){
							
									var sWordform = fn.getPromptUserInput("woordvorm");
									var sWordformPos = fn.getPromptUserInput("wordform_gigpos");
									
									// wordform is being added to the wordforms and analyzed_wordforms tables
									// and the view is refreshed
									fn.callFunction("insert_wordform", 
											[sLemmaId, sWordform, sWordformPos], 
											null, null, null, null, function(){
										fn.refreshTable(t);
									});
								});
						}
					else
						{
						fn.message("Kies een lemma", "Selecteer het lemma waar een woordvorm aan moet worden toegevoegd.");
						}
				}
			},
			"button_1":{
				
				"name": "Verwijder selectie",
				"click": function(t){
					
					fn.confirm("Verwijder selectie", "Weet u het zeker?", function(){
						
						var aRows = fn.getSelectedRowsFrom(t);
						
						aRows.each(function(){
							
							var bLastRow = fn.isLastNodeOf(this, aRows);
							
							fn.removeFromDatabaseGivenANode(t, this, false, function(){
								if (bLastRow) fn.refreshTable(t);
							});							
							
						});
						
					});
					
					
				}
			}
		},
		
		gemiste_paradigma_correcties: {
			
			"callback": function(t){
				
				conf.changeTableConfigValue("paradigma_view", "source", "visible", false);
				conf.changeTableConfigValue("paradigma_view", "flex", "visible", false);
				fn.callDatabase("paradigma_view", {}, null, {"displaylength": "50"});
			}
			
		},
		
		keurmerk_checklist: {
			"size": "80%",
			
			"keyup" : {				
				
				"uparrow": function(t){
					fnArrowFunction(t);
				},
				"downarrow": function(t){
					fnArrowFunction(t);
				}
			}
		},
		
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
			
			"prereset_callback": function(confTable){
				
				//fn.addFilters(confTable, {"homo": ""});
				
				sChosenParentId = null;
				fn.setCustomButtonName(confTable, 2, "Gekozen ouder:");
				
			},
			
			"repeat_callback": true,
			
			"callback": function(t){
				
				// give parent other color (so they are recognizable)
				var sTableName = fn.getTableName(t);
				
				var aRows = fn.getAllRows(t);
				aRows.each(function(){
					
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
					});
				
			},
	
			"keyup" : {
				
				
				"f9": function(confTable){
					
					var nNode = fn.getFirstSelectedRowFrom(confTable);
					var sLemmaId = fn.getDataFromCellNamed(confTable, nNode, "pkid");
					fn.callDatabase("lemmata_en_paradigma_view", {"lemma_id": sLemmaId});
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
					
					if (kf._getPressedKey() == 'shift')
						{
						fn.setCustomButtonName(confTable, 2, "Gekozen ouder:");
						sChosenParentId = null;
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
												// reset: no chosen parent, to prevent accidental linking
												// [commented out, because Katrien doesn't like this]
												//fn.setCustomButtonName(confTable, 2, "Gekozen ouder:");
												//sChosenParentId = null;
												
												fn.updateDatabaseGivenFieldValues("lemmata", 
														{"lemma_id": sChosenParentId}, 
														{"is_parent": true}, 
														false, 
														function(){fn.refreshTable(confTable);});
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
			
			"repeat_callback": true,
			
			"callback": function(t){
				
				var aRows = fn.getAllRows(t);
				var sTableName = fn.getTableName(t);
				
				// if the LM'er is working with the keurmerk_checklist
				// we need to highlight some lines (show relevant lines)
				// otherwise, we don't need to.
				if (fn.tableExists("keurmerk_checklist"))
					{
					
					aRows.each(function(){
						
						var sSource = fn.getDataFromCellNamed(t, this, "source");
						
						if (sSource == 'niet-homoniemen Molex')
							{
							var aColList = mt.getListOfVisibleColumnsOf(sTableName);
							for (var i=0; i<aColList.length; i++)
								{
								var sColName = aColList[i];
								(fn.getCellElement(t, this, sColName)).css("color", "red");
								
								}
							
							
							}
						
						});
					}
				
			},
			
			"keyup" : {	
				
				"ctrl": function(t){
					
					// if the LM'er is working with the keurmerk_checklist
					// we need him/her to be able to toggle keurmerk checkbox
					// in paradigma view with the ctrl button.
					// Otherwise, we don't need this.
					if (fn.tableExists("keurmerk_checklist"))
					{
						var n = fn.getFirstSelectedRowFrom(t);
						
						//fn.toggleCheckbox(t, n, "keurmerk");
						
						// Lex'it engine not updated yet, so use 
						// fn.toggleCheckbox function code instead of true function
						(fn.getCellElement(t, n, "keurmerk")).find("input").eq(0).focus();
						(fn.getCellElement(t, n, "keurmerk")).find("input").eq(0).click();
						(fn.getCellElement(t, n, "keurmerk")).find("input").eq(0).blur();
					}
					
					
				}
			},
			
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
				"editable": true,
				"editcallback": function(t, n, value){
					
					var sAwfId = fn.getDataFromCellNamed(t, n, "analyzed_wordform_id");
					fn.callFunction("modify_wordform", [sAwfId, value]);
					
				}
			}, 
			wordform_gigpos:{
				"editable": true,
				"editcallback": function(t, n, value){					
					
					var value = fn.escapeRegexChars(value);
					
					fn.getRecordGivenFieldValues("pos_to_rang", {"pos": value}, 
							function(record){
							
								var sRangvalue = record["rang"];								
								var iRankvalue = (typeof sRangvalue != 'undefined') ? parseInt(sRangvalue) : 0;
								
								fn.updateDatabaseGivenANode(t, n, ["rank"], [iRankvalue], false, function(){
									
									// update the analyzed_wordforms
									var sAwfId = fn.getDataFromCellNamed(t, n, "analyzed_wordform_id");
									fn.updateDatabaseGivenFieldValues("analyzed_wordforms", 
											{"analyzed_wordform_id": sAwfId}, 
											{"wordform_gigpos": value, "rank": iRankvalue},
											false,
											function(){
												fn.refreshTable(t);
											});
									
								});								
								
						});					
					
				}
			}, 
			wf_keurmerk:{
				"bgcolor": "#E0F8EC",
				"editable": true,
				
				// update the analyzed_wordforms
				"editcallback": function(t, n, value){
					var sAwfId = fn.getDataFromCellNamed(t, n, "analyzed_wordform_id");
					fn.updateDatabaseGivenFieldValues("analyzed_wordforms", 
							{"analyzed_wordform_id": sAwfId}, 
							{"keurmerk": value});
				}
			}, 
			rank:{
				"colsort": "asc",    // sort #2
				"visible": false
			},
			
			comment:{
				"bgcolor": "#E0F8EC",
				"editable": true,
				"editcallback": function(t, n, value){
					
					// update the analyzed_wordforms
					var sAwfId = fn.getDataFromCellNamed(t, n, "analyzed_wordform_id");
					fn.updateDatabaseGivenFieldValues("analyzed_wordforms", 
							{"analyzed_wordform_id": sAwfId}, 
							{"comment": value});
				}
			},
			comment_intern: {
				
				// BEWARE, DON'T REMOVE THIS PART
				// ------------------------------
				"flexible_visibility": false,
				"visible": (document.URL.indexOf( "gtb.dev.inl.loc" )>-1),
				// ------------------------------
				
				"bgcolor": "#E0F8EC",
				"editable": true,
				"editcallback": function(t, n, value){
					
					// update the analyzed_wordforms
					var sAwfId = fn.getDataFromCellNamed(t, n, "analyzed_wordform_id");
					fn.updateDatabaseGivenFieldValues("analyzed_wordforms", 
							{"analyzed_wordform_id": sAwfId}, 
							{"comment_intern": value});
				}
			},
			wf_source:{
				"visible": false
			}, 
			autom_wf:{
				"visible": false
			}
			
		},
		
		
		
		
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
//				"visible": false
			},
			"is_parent":{				
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
			"opmerking_extern": {				
				"editable": true
			},
			"notitie": {				
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
			"kapstok": {				
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
					fn.callDatabase("lemmata_en_paradigma_view", {"lemma_id": lemma_id});
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
				"editable": false //true
			},
			"wordform_afbr":{				
				"editable": false //true
			},
			"th_wordform": {				
				"visible": false				
			},
			"th_wordform_afbr": {				
				"visible": false				
			},
			"wordform_gigpos":{				
				"editable": false //true
			},
			"flex":{				
				"editable": false //true
			},
			"keurmerk":{				
				"editable": false //true
			},
			"comment": {
				"editable": false //true
			},
			
			"rang":{			
				"colsort": "asc",
				"visible": false
			}
			
		},
		
		gemiste_paradigma_correcties: {
			
			unique_id: {
				"visible": false
			},
			lemma_id: {
				"click": function(t, n){
					
					var sLemmaId = fn.getDataFromCellNamed(t, n, "lemma_id");
					fn.callDatabase("paradigma_view", 
							{"lemma_id": sLemmaId});
				}
			},
			modern_lemma: {
				"colsort": "asc" // sort #1
			}, 
			analyzed_wordform_id: {
				"visible": false
			}, 
			wordform_gigpos: {
				"colsort": "asc", // sort #2
				"click": function(t, n){
					
					var sLemmaId = fn.getDataFromCellNamed(t, n, "lemma_id");
					var sAwfId = fn.getDataFromCellNamed(t, n, "analyzed_wordform_id");

					fn.callDatabase("paradigma_view", 
							{"lemma_id": sLemmaId},
							function(){
								
								var nRow = fn.getNodeWhere("paradigma_view", 
										{"pkid": sAwfId});								
								var iRowNumber = fn.getRowNumberOnScreen("paradigma_view", nRow);
								if (iRowNumber>-1)
									fn.selectRow("paradigma_view", iRowNumber);
							});
					
				}
			}, 
			vermoedelijk_fout: {
				"bgcolor": "#F5D0A9"
			}, 
			correctie: {
				"bgcolor": "#BCF5A9"
			}, 
			ok: {
				"button": "OK",
				"click": function( t, n ){
					
					var sLemmaId = fn.getDataFromCellNamed(t, n, "lemma_id");
					var sAwfId = fn.getDataFromCellNamed(t, n, "analyzed_wordform_id");
					var sCorrection = fn.getDataFromCellNamed(t, n, "correctie");
					
					fn.updateDatabaseGivenFieldValues("paradigma_view", 
							{"pkid": sAwfId}, 
							{"wordform": sCorrection}, false, function(){
								
								fn.removeFromDatabaseGivenANode(t, n, true);
								fn.callDatabase("paradigma_view", 
										{"lemma_id": sLemmaId},
										function(){
											
											var nRow = fn.getNodeWhere("paradigma_view", 
													{"pkid": sAwfId});								
											var iRowNumber = fn.getRowNumberOnScreen("paradigma_view", nRow);
											if (iRowNumber>-1)
												fn.selectRow("paradigma_view", iRowNumber);
										});
								
							});
				}
			}, 
			gooiweg: {
				"button": "Weg ermee!",
				"click": function( t, n ){
					
					var sLemmaId = fn.getDataFromCellNamed(t, n, "lemma_id");
					var sAwfId = fn.getDataFromCellNamed(t, n, "analyzed_wordform_id");
					
					fn.removeFromDatabaseGivenANode(t, n, true);	
					fn.callDatabase("paradigma_view", 
							{"lemma_id": sLemmaId});
				}
			}
			
		},
		
		keurmerk_checklist:{
			
			lemma_id: {
				"colsort": "asc"
			}, 
			modern_lemma: {
				
			}, 
			analyzed_wordform_id: {
				
			}, 
			wordform: {
				"bgcolor": "#E0F8EC",
				"click": function( t, n ){
					
					var iAwfId = fn.getDataFromCellNamed(t, n, "analyzed_wordform_id");
					var iLemmaId = fn.getDataFromCellNamed(t, n, "lemma_id");
					
					fn.callDatabase("paradigma_view", {"lemma_id": iLemmaId});
					
					
				}
			}, 
			keurmerk: {
				"visible": false 
			}
			
			
		}
};