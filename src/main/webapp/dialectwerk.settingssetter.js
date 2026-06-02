
var dialectsettings = {};


sSearchColumnInDialectTable = "trefwoord";
sSearchColumnInDutchTable = "modern_lemma";


// Key function to be assigned to 'keyup' event in all tables,
// enabling the user to build a link between selected records.

dialectsettings.oKeyForBuildingLinks = {
	
	"enter": function( t ){
		dialectlinking.buildLink();
	}
};

// ------------------
// settings getter
// ------------------

dialectsettings.getSettingFor = function(sTableName, bLinkingTool){
	
	if (bLinkingTool){
		
		if (sTableName == 'spellingconflicts_worktable'){
			
			return {
				
				"exact_count": true,
				
				"columns_sorting": {"ned_id": "asc", "dialect_id": "asc"},
				
				"button_0": {
					
					"name": "Opnieuw genenreren",
					"click": function(t){
						
						fn.confirm("Let op", "Weet u zeker dat u de tabel opnieuw wilt genereren?<BR><BR>Dit kan niet ongedaan worden gemaakt.",
							function(){
								fn.callFunction("data.build_spellingconflicts_worktable", [], function(){
									
									fn.refreshTable(t);
								});
							},
							function(){
								fn.message("OK", "Operatie geannuleerd door gebruiker");
							});
					}
					
				},
				
				"callback": function(t){
					
					// keep track of ned_id,
					// so as to be able to show borders between ned_id groups
					var iLastNedId = null; 
					
					var oRows = fn.getAllRowNodes(t);
					$(oRows).each(function(){
						
						var nRow = this;
						var iCurrentNedId = fn.getDataFromCellInRowNode(nRow, "ned_id");
						if (iCurrentNedId != iLastNedId){
							$(nRow).find("td").css("border-top", "1px solid black");
						}
						iLastNedId = iCurrentNedId;
						
					});
				},
				"repeat_callback": true
				
			}
		}
		
		if (sTableName == 'modern_lemma_in_dialect_glos'){
			
			return {
				
				"full_export_button": {
					"nice_name": "Volledige Excel Export"
				},
			
				"exact_count": true,
				"main_search": false,
				"draggable": false,
				"viewtype_button": false,
				"replace_button": false,
				"selection_button": false,
				"columns_button": true,
				"export_buttons": true,
				"header_height": sHeaderHeight,
				"columns_sorting": 	{"modern_lemma": "asc", "ned_id": "asc"}
	
			}
		}
		
		if (sTableName == 'dialect'){
			
			return {

				"exact_count": true,
				"main_search": false,
				"draggable": false,
				"main_search": false,
				"viewtype_button": false,
				"replace_button": false,
				"selection_button": false,
				"columns_button": true,
				"export_buttons": false,
				"header_height": sHeaderHeight,

				"exact_count": true,
				"columns_sorting": {"dialect_lemma": "asc", "dialect_id": "asc"},
				"columns_order": [	"dialect_id", "trefwoord", "molex_pos", "dialect_lemma", "dialect_norm", "dialect_pos", "dialect_glos",
									"opmerking", "bron", "linked"],
				

				"keyup": dialectsettings.oKeyForBuildingLinks,
				"viewtype": "table",
				"width": "50%",

				"close_callback": function(t){

					// close other tables

					fn.closeTable("nederlands");
					fn.closeTable("neder_dialect_links");

					// restore default config upon close

					oTableSettingsList["dialect"] = getSettingFor("dialect", false);
					oTableSettingsList["nederlands"] = getSettingFor("nederlands", false);
					oTableSettingsList["neder_dialect_links"] = getSettingFor("neder_dialect_links", false);

					oTableConfigurationList["dialect"] = getConfigFor("dialect", false);
					oTableConfigurationList["nederlands"] = getConfigFor("nederlands", false);
					oTableConfigurationList["neder_dialect_links"] = getConfigFor("neder_dialect_links", false);
				},

				"button_0": {

					"name": "Nieuw dialectlemma",
					"click": function(t){ dialectfn.addNewDialectLemma(t); }
				},
				"button_1": {
					"name": "Verwijder dialectlemma",
					"click": function(t){ dialectfn.removeDialectLemma(t); }
				},
				"button_2": {
					"name": "Zoekkolom",
					"bgcolor": "brown",
					"click": function(t){
						
						// get the list of columns in the other table
						var aListOfColumns = mt.getListOfVisibleColumnsOf( sNederlandsTableName );
						
						// add the string '::selected' to the item of the list that has value sSearchColumnInDutchTable
						if (sSearchColumnInDutchTable != null && sSearchColumnInDutchTable != ""){
							aListOfColumns = aListOfColumns.map(function(item){
								if (item == sSearchColumnInDutchTable){
									return item + "::selected";
								} 
								else {
									return item;
								}
							});
						}
										
						// show the prompt to select the column
						fn.prompt(["Kolom selecteren", "Kies de kolom van '"+sNederlandsTableName+"' waarin u wilt zoeken"], ["Zoekkolom"], [aListOfColumns], function(resp){
							
							sSearchColumnInDutchTable = resp["Zoekkolom"];
						});
						
					}
				},
				"button_3": {
					"name": "Propagate POS",
					"bgcolor": "black",
					"click": function(t){
						
						// get the selected row in this table
						var nSelectedRow = fn.getFirstSelectedRowNodeFrom(t);
						
						
						// if no row is selected, or the selected row has no part-of-speech, show a message and return
						if (nSelectedRow == null || nSelectedRow == undefined){
							fn.message("Let op", "Selecteer eerst een rij met een part-of-speech om deze in de andere rijen te propageren.");
							return;
						}
					
						// read the part-of-speech from the selected row, and assign it to all rows where this field is empty
						var sPos = fn.getDataFromCellInRowNode(nSelectedRow, "dialect_pos");
						if (sPos == null || sPos.trim() == ''){
							fn.message("Let op", "Selecteer eerst een rij met een part-of-speech om deze in de andere rijen te propageren.");
							return;
						}
						
						// last check!
						
						fn.confirm("Propagate part-of-speech", 
							"Weet u zeker dat u de part-of-speech '"+sPos+"' wilt propageren naar alle dialectlemmata zonder part-of-speech in deze view?", 
							function() {
								
								// get all rows in the table
								var aAllRows = fn.getAllRowNodes(t);
		
								// loop through all rows and update the empty ones						
								$(aAllRows).each(function() {
									
									nRow = this;
									var sCurrentPos = fn.getDataFromCellInRowNode(nRow, "dialect_pos");
									var bLastRow = fn.isLastNodeOf(nRow, aAllRows);
									if (sCurrentPos == null || sCurrentPos == "") {										
										fn.updateTableGivenANode(nRow, { "dialect_pos": sPos });
										if (bLastRow) {
											setTimeout(function(){fn.refreshTable(t);}, 500);											
										}										
									}							
								});
								
							}, 
							function() {
								fn.message("OK", "Geannuleerd");
							}
						);
						
						
						
						
						
							
					}
				}

			}
		}
		
		if (sTableName == 'nederlands'){

			return {
	
				"main_search": false,
				"draggable": false,
				"main_search": false,
				"viewtype_button": false,
				"replace_button": false,
				"selection_button": false,
				"columns_button": true,
				"export_buttons": false,
				"header_height": sHeaderHeight,
	
				"exact_count": true,
				"columns_sorting": 	{"modern_lemma": "asc", "ned_id": "asc"},
				"keyup": 			dialectsettings.oKeyForBuildingLinks,
				"width": "47%",			
	
				"button_0": {	
					"name": "Nieuw lemma",
					"click": function(t){ dialectfn.addNewNederlandsLem(t); }
				},
				"button_1": {
					"name": "Verwijder lemma",
					"click": function(t){ dialectfn.removeNederlandsLem(t); }
				},
				"button_2": {
					"name": "Zoekkolom",
					"bgcolor": "brown",
					"click": function(t){
						
						// get the list of columns in the other table
						var aListOfColumns = mt.getListOfVisibleColumnsOf( sDialectTableName );
						
						// add the string '::selected' to the item of the list that has value sSearchColumnInDialectTable
						if (sSearchColumnInDialectTable != null && sSearchColumnInDialectTable != ""){
							aListOfColumns = aListOfColumns.map(function(item){
								if (item == sSearchColumnInDialectTable){
									return item + "::selected";
								} 
								else {
									return item;
								}
							});
						}
										
						// show the prompt to select the column						
						fn.prompt(["Kolom selecteren", "Kies de kolom van '"+sDialectTableName+"' waarin u wilt zoeken"], ["Zoekkolom"], [aListOfColumns], function(resp){
							
							sSearchColumnInDialectTable = resp["Zoekkolom"];
						});
						
					}
				},
				"button_3": {
					"name": "Propagate POS",
					"bgcolor": "black",
					"click": function(t){
						
						// get the selected row in this table
						var nSelectedRow = fn.getFirstSelectedRowNodeFrom(t);
						
						
						// if no row is selected, or the selected row has no part-of-speech, show a message and return
						if (nSelectedRow == null || nSelectedRow == undefined){
							fn.message("Let op", "Selecteer eerst een rij met een part-of-speech om deze in de andere rijen te propageren.");
							return;
						}
					
						// read the part-of-speech from the selected row, and assign it to all rows where this field is empty
						var sPos = fn.getDataFromCellInRowNode(nSelectedRow, "lemma_pos");
						if (sPos == null || sPos.trim() == ''){
							fn.message("Let op", "Selecteer eerst een rij met een part-of-speech om deze in de andere rijen te propageren.");
							return;
						}
						
						
						
						// last check!
						
						fn.confirm("Propagate part-of-speech", 
							"Weet u zeker dat u de part-of-speech '"+sPos+"' wilt propageren naar alle Nederlandse lemmata zonder part-of-speech in deze view?", 
							function() {
								
								// get all rows in the table
								var aAllRows = fn.getAllRowNodes(t);
		
								// loop through all rows and update the empty ones
								
								$(aAllRows).each(function() {
									
									nRow = this;
									var sCurrentPos = fn.getDataFromCellInRowNode(nRow, "lemma_pos");
									var bLastRow = fn.isLastNodeOf(nRow, aAllRows);
									if (sCurrentPos == null || sCurrentPos == "") {
										
										fn.updateTableGivenANode(nRow, { "lemma_pos": sPos });
										if (bLastRow) {
											setTimeout(function(){fn.refreshTable(t);}, 500);											
										}
										
									}							
								});
								
							}, 
							function() {
								fn.message("OK", "Geannuleerd");
							}
						);
							
					}
				}
			}
			
		}

		
		if (sTableName == 'neder_dialect_links'){

			return {
				
				"full_export_button": {
					"nice_name": "Volledige Excel Export"
				},

				"main_search": false,
				"draggable": false,
				"main_search": false,
				"viewtype_button": false,
				"replace_button": false,
				"selection_button": false,
				"columns_button": true,
                "export_buttons": true,
                "header_height": sHeaderHeight,

				"exact_count": true,
				"columns_sorting": 	{"dialect_lemma": "asc", "dialect_id": "asc"},
				"keyup": 			dialectsettings.oKeyForBuildingLinks,
				"width": "97%",

				"button_0": {
					"name": "Link ongedaan maken",
					"click": function(t){
						dialectlinking.undoLink();
					}
				},
				
				"button_1": {
					"name": "Toon modern lemma in dialect glos",
					"bgcolor": "brown",
					"click": function(t){
						if (fn.tableExists("dubbele_nl_lemmata")){fn.closeTable("dubbele_nl_lemmata");}
						fn.callTable("modern_lemma_in_dialect_glos", {}, function(){
							fn.pileupTables("neder_dialect_links", "modern_lemma_in_dialect_glos");
							fn.scrollToTable("modern_lemma_in_dialect_glos");
						});					
					}
				},
				"button_2": {
					"name": "Toon dubbele lemmata",
					"bgcolor": "brown",
					"click": function(t){
						if (fn.tableExists("modern_lemma_in_dialect_glos")){fn.closeTable("modern_lemma_in_dialect_glos");}
						fn.callTable("dubbele_nl_lemmata", {}, function(){
							fn.pileupTables("neder_dialect_links", "dubbele_nl_lemmata");
							fn.scrollToTable("dubbele_nl_lemmata");
						});					
					}
				},
				"button_3": {
					"name": "Spelling conflicten",
					"bgcolor": "brown",
					"click": function(t){
						
						fn.callTable("spellingconflicts_worktable", {}, function(){
							fn.scrollToTable("spellingconflicts_worktable");
						});
						
						
					}
				}
			}	
		}
		
	
	}
};
