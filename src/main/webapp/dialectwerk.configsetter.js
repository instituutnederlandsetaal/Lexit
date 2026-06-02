

var dialectconfig = {};


// ------------------
// Config setter
// ------------------


dialectconfig.aDialectSource = ["", "HS Deventer", "HS Kuinder", "Fien 2000 Kampers", "Manual"];
dialectconfig.aNederlandsSource = ["", "HS", "HS Deventer", "HS Kuinder", "NL", "Manual"];


dialectconfig.getConfigFor = function(sTableName, bLinkingTool){
	
	
	if (bLinkingTool){
		
		if (sTableName == 'spellingconflicts_worktable'){
			
			return {
				
				"row_id": {
					"visible": false
				},
				
				"ned_id": {	
					"bgcolor": "#F8E0E0"
				},
				
				"modern_lemma": {	
					"bgcolor": "#ECF8E0"
				},
				
				"dialect_id": {					
					"bgcolor": "#F8E0E0"
				},
				
				"dialect_lemma": {				
					"bgcolor": "#ECF8E0"
				},
				
				"TB": {
					"editable": true
				},
				
				"hoofdvariant": {
					"editable": true,
					"editcallback": function(t, n, e){
						fn.refreshTable(t);	// this is needed as setting one row causes the other rows to be modified as well (t.i. set back to false)
					}
				},
				
				"dialect_norm": {				
					"editable": true,
					"editcallback": function(t, n, e){
						fn.refreshTable(t);	// this is needed as setting one row causes the other rows to be modified as well (t.i. get the same string value)
					}
				},
				
			}
		}
		
		
		if (sTableName == 'modern_lemma_in_dialect_glos'){
			
			return {
				
				"ned_id": {	
					"bgcolor": "#F8E0E0"
				},
				
				"modern_lemma": {	
					"bgcolor": "#ECF8E0"
				},
				
				"dialect_id": {					
					"bgcolor": "#F8E0E0"
				},
				
				"dialect_lemma": {				
					"bgcolor": "#ECF8E0"
				}
				
			}
		}
		
		if (sTableName == 'dialect'){		

			return {
	
				"koppeling": {
					"visible": false
				},
	
				"dialect_id": {
					"bgcolor": "#F8E0E0"
				},
				
				"trefwoord": {
					
					"bgcolor": "#ECF8F0",
					
					"cell_tooltip": "Klik om op te zoeken in Nederlandse tabel",
	
					"click": function( t, nCell ){
		
						var sValue = fn.getDataFromCellNode( nCell );
						
						// look up in cross table
						
						var oLookUp = new Array();
						var sTrefwoord = fn.escapeRegexChars(sValue);
						oLookUp[ "trefwoord" ] = "^"+sTrefwoord;
						
						fn.callDatabase( sCrossViewName, oLookUp );
						fn.callDatabase( sNederlandsTableName, {"modern_lemma": "^"+sTrefwoord} );
					
					}
				},
	
	
				"dialect_lemma": {
				
					"bgcolor": "#ECF8E0",
					
					"cell_tooltip": "Klik om op te zoeken in Links tabel",
	
					"click": function( t, nCell ){
		
						var sValue = fn.getDataFromCellNode( nCell );
						
						// look up in cross table
						
						var oLookUp = new Array();
						var sDialectLemma = fn.escapeRegexChars(sValue);
						oLookUp[ sDialectLookUpColumn_in_CrossView ] = "^"+sDialectLemma;
						
						fn.callDatabase( sCrossViewName, oLookUp );
					
					}
				},
				
				"dialect_norm": {
					
					"editable": true,
					"editcallback": function(t, n, e){
						fn.refreshTable(t);	// this is needed as setting one row causes the other rows to be modified as well (t.i. get the same string value)
					}
				},
	
				"dialect_pos": {
					
					"click": function( t, n ){
						
						// get current selection
						var sCurrentPosValue = fn.getDataFromCellNode(n);
						var aAlreadyChosen = sCurrentPosValue != null ? sCurrentPosValue.split(", ") : [];

						// values to choose from
						var aValuesToChooseFrom = ["", "aanwijzend voornaamwoord", "bezittelijk voornaamwoord", "bijvoeglijk naamwoord", 
							"bijwoord", "persoonlijk voornaamwoord", "telwoord", "tussenwerpsel", "voegwoord", "voornaamwoord", "voorzetsel", 
							"vragend voornaamwoord", "werkwoord", "zelfstandig naamwoord"];

						fn.promptSelect("Kies een part-of-speech", aValuesToChooseFrom, aAlreadyChosen, 
							function(aChosenValues){
								var sNewPosValue = aChosenValues.join(", ");
								fn.updateTableGivenANode(n, {"dialect_pos": sNewPosValue}, 
									function(){
										fn.refreshRow(n);
									}
								);
							}, 
							function(){
								// do nothing
							}, 
							false);
					}
				},
				
				"dialect_glos": {
					//"editable": true,
					"ellipsis": true
				},	
				
				"opmerking": {
					"editable": true,
					"bgcolor": "#CED8F6"
				},
				
				"bron": {
					"choosefrom": dialectconfig.aDialectSource
				}		
			}
	
		}
		
		if (sTableName == 'nederlands'){
	
			return {
				
				"ned_id": {
	
					"bgcolor": "#F8E0E0"
				},
	
				"opmerking": {
					"editable": true,
					"bgcolor": "#CED8F6"
				},
	
				"lemma_pos": {
					"width": "60px",
					"click": function( t, n ){
						
						// get current selection
						var sCurrentPosValue = fn.getDataFromCellNode(n);
						var aAlreadyChosen = sCurrentPosValue != null ? sCurrentPosValue.split(", ") : [];

						// values to choose from
						var aValuesToChooseFrom = ["", "aanwijzend voornaamwoord", "bezittelijk voornaamwoord", "bijvoeglijk naamwoord", 
							"bijwoord", "persoonlijk voornaamwoord", "telwoord", "tussenwerpsel", "voegwoord", "voornaamwoord", "voorzetsel", 
							"vragend voornaamwoord", "werkwoord", "zelfstandig naamwoord"];

						fn.promptSelect("Kies een part-of-speech", aValuesToChooseFrom, aAlreadyChosen, 
							function(aChosenValues){
								var sNewPosValue = aChosenValues.join(", ");
								fn.updateTableGivenANode(n, {"lemma_pos": sNewPosValue}, 
									function(){
										fn.refreshRow(n);
									}
								);
							}, 
							function(){
								// do nothing
							}, 
							false);
					}
				},
				
				"nederglos": {
					"editable": true,
				},
	
				"modern_lemma": {
	
					"bgcolor": "#ECF8E0",
					
					"cell_tooltip": "Klik om op te zoeken in Links tabel én in Dialect tabel",
	
					"click": function( t, nCell ){
			
						var sValue = fn.getDataFromCellNode( nCell );
						
						// look up in cross table
						
						var oLookUp = new Array();
						var sModLem = fn.escapeRegexChars(sValue);
						oLookUp[ sNederlandsLookUpColumn_in_CrossView ] = "^"+sModLem;
						
						fn.callDatabase( sCrossViewName, oLookUp );
						fn.callDatabase( sDialectTableName, {"trefwoord": "^"+sModLem} );
						
					}
				},
				
				"bron": {
					"choosefrom": dialectconfig.aNederlandsSource
				}
		
			}
	
		}
	
		if (sTableName == 'neder_dialect_links'){
	
			return {
	
				"dialect_id": {
					"bgcolor": "#F8E0E0"
				},
				"ned_id": {
					"bgcolor": "#F8E0E0"
				},
				
				"trefwoord": {					
					"bgcolor": "#ECF8F0"
				},
				"dialect_lemma": {
					"bgcolor": "#ECF8E0"
				},
				"dialect_pos": {
				},
				
				"dialect_glos": {
					"ellipsis": true
				},
				
				"modern_lemma": {
					"bgcolor": "#ECF8E0"
				},		
				"neder_bron": {
					"choosefrom": dialectconfig.aNederlandsSource
				},
				"dialect_bron": {
					"choosefrom": dialectconfig.aDialectSource
				},
				"method": {
					"choosefrom": ["",  "Automatic", "Manual"]
				},
				"row_id": {
					"visible": false
				}
			}
		}
		
		
	}
};
