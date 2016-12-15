// list of tables that must be hidden or visible (don't use both, it's a matter of what's the most convenient)
oHiddenTablesList = [];
oShowOnlyTables = ["hulk_comparison",
                   "hulk_comparison_nw_lemmata",
                   "hulk_jobs"];

// table general settings
oTableSettingsList = {
		
		hulk_jobs: {
			
			"keyup":{
				
				"`": function(t){
					var oRow = fx.getFirstSelectedRowFrom(t);
					fx.toggleCheckbox(oRow, "ok_2015");
				}
			},
			
			"size": "70%",
			
			"column_order": [			                 
				"lemma_id",
				"sectie",
				"modern_lemma",
				"lemma_gigpos",
				"gedrukt",
				"online",
				"oudste_hulk",
				"oudste_hulk_corr",
				"michel_hulk",
				"michel_hulk_corr",
				"nieuw",
				"ok_2015",
				"correctie",
				"opmerking",
				"unique_id"
				
				]
			
		}
		
		
};


// configuration at column level
oTableConfigurationList = {
		
		hulk_comparison:{
			
			lemma_id:{
				
				"cell_tooltip": "Zoek dit op in gigant_molex (op basis van ID)",
				"click": function(t, n){
					var oCell =	fx.getCell(n);					
					var lemId =	fx.getDataFromCell(oCell);
					fn.callDatabaseInNewTab("lemmata_view", {"pkid": lemId}, {}, "gigant_molex");
				}				
				
			},
			modern_lemma:{
				"colsort": "asc",
				"cell_tooltip": "Zoek dit op in gigant_molex (op basis van string)",
				"click": function(t, n){					
					var oCell =	fx.getCell(n);
					var lem = 	fx.getDataFromCell(oCell);
					fn.callDatabaseInNewTab("lemmata_view", {"modern_lemma": "^"+lem+"$"}, {}, "gigant_molex");
					
				}
			},
			oudste_hulk: {
				
				"cell_tooltip": "Zoek 'modern_lemma' op in oude hulk (op basis van string)",
				"click": function(t, n){
					var oCell = 	fx.getCell(n);
					var oordeel =	fx.getDataFromCell(oCell);
					var lem = 		fx.getDataFromSiblingCell(oCell, "modern_lemma");
					
					var tabel;
					if (oordeel == 'OK')
						tabel = "valid_words";
					else if (oordeel == 'NOK')
						tabel = "known_errors";
					else
						tabel = "ambigue_words";
					
					fn.callDatabaseInNewTab(tabel, {"key": "^"+lem+"$"}, {}, "oudehulk");
				},
				"choosefrom":["", "-", "OK", "NOK", "AMBI", "^(OK|NOK|AMBI)$"]
			},
			oudste_hulk_corr: {
				
				"cell_tooltip": "Zoek dit op in gigant_molex (op basis van string)",
				"click": function(t, n){	
					var oCell =	fx.getCell(n);					
					var lem =	fx.getDataFromCell(oCell);
					fn.callDatabaseInNewTab("lemmata_view", {"modern_lemma": "^"+lem+"$"}, {}, "gigant_molex");
				}
				
			},
			michel_hulk: {
				
				"cell_tooltip": "Zoek 'modern_lemma' op in Michel-hulk (op basis van string)",
				"click": function(t, n){
					var oCell =	fx.getCell(n);
					var lem = 	fx.getDataFromSiblingCell(oCell, "modern_lemma");
					fn.callDatabaseInNewTab("words", {"word": "^"+lem+"$"}, {}, "nieuwehulk");
				},
				"choosefrom":["", "-", "OK", "NOK", "AMBI", "^(OK|NOK|AMBI)$"]
			},
			michel_hulk_corr:{
				
				"cell_tooltip": "Zoek dit op in gigant_molex (op basis van string)",
				"click": function(t, n){
					var oCell =	fx.getCell(n);					
					var lem =	fx.getDataFromCell(oCell);
					fn.callDatabaseInNewTab("lemmata_view", {"modern_lemma": "^"+lem+"$"}, {}, "gigant_molex");
				}
				
			}
		},
		

		
		
		hulk_comparison_nw_lemmata:{
			
			lemma_id:{
				
				"cell_tooltip": "Zoek dit op in gigant_molex (op basis van ID)",
				"click": function(t, n){
					var oCell =	fx.getCell(n);
					var lemId = fx.getDataFromCell(oCell);
					fn.callDatabaseInNewTab("lemmata_view", {"pkid": lemId}, {}, "gigant_molex");
				}				
				
			},
			modern_lemma:{
				"colsort": "asc",
				"cell_tooltip": "Zoek dit op in gigant_molex (op basis van string)",
				"click": function(t, n){					
					var oCell =	fx.getCell(n);
					var lem = 	fx.getDataFromCell(oCell);
					fn.callDatabaseInNewTab("lemmata_view", {"modern_lemma": "^"+lem+"$"}, {}, "gigant_molex");
					
				}
			},
			oudste_hulk: {
				
				"cell_tooltip": "Zoek 'modern_lemma' op in oude hulk (op basis van string)",
				"click": function(t, n){
					var oCell =		fx.getCell(n);
					var oordeel =	fx.getDataFromCell(oCell);					
					var lem = 		fx.getDataFromSiblingCell(oCell, "modern_lemma");
					
					var tabel;
					if (oordeel == 'OK')
						tabel = "valid_words";
					else if (oordeel == 'NOK')
						tabel = "known_errors";
					else
						tabel = "ambigue_words";
					
					fn.callDatabaseInNewTab(tabel, {"key": "^"+lem+"$"}, {}, "oudehulk");
				},
				"choosefrom":["", "-", "OK", "NOK", "AMBI", "^(OK|NOK|AMBI)$"]
			},
			oudste_hulk_corr: {
				
				"cell_tooltip": "Zoek dit op in gigant_molex (op basis van string)",
				"click": function(t, n){	
					var oCell =		fx.getCell(n);					
					var lem = 		fx.getDataFromCell(oCell);
					fn.callDatabaseInNewTab("lemmata_view", {"modern_lemma": "^"+lem+"$"}, {}, "gigant_molex");
				}
				
			},
			michel_hulk: {
				
				"cell_tooltip": "Zoek 'modern_lemma' op in Michel-hulk (op basis van string)",
				"click": function(t, n){
					var oCell =		fx.getCell(n);
					var lem = 		fx.getDataFromSiblingCell(oCell, "modern_lemma");
					fn.callDatabaseInNewTab("words", {"word": "^"+lem+"$"}, {}, "nieuwehulk");
				},
				"choosefrom":["", "-", "OK", "NOK", "AMBI", "^(OK|NOK|AMBI)$"]
			},
			michel_hulk_corr:{
				
				"cell_tooltip": "Zoek dit op in gigant_molex (op basis van string)",
				"click": function(t, n){
					var oCell =		fx.getCell(n);
					var lem = 		fx.getDataFromCell(oCell);
					fn.callDatabaseInNewTab("lemmata_view", {"modern_lemma": "^"+lem+"$"}, {}, "gigant_molex");
				}
				
			},
			"ok_2015": {
				"bgcolor": "#BCF5A9",
				"editable": true
			},
			"correctie": {
				"bgcolor": "#BCF5A9",
				"editable": true
			},
			"opmerking": {
				"bgcolor": "#BCF5A9",
				"editable": true
			},
			"unique_id": {
				"visible": false
			}
		},
		
		
		
		
		hulk_jobs :{
			
			
			"lemma_id": {
				"visible": false
			},
			"sectie": {
				"choosefrom": [],
				"filter": "1"				
			},
			"modern_lemma": {
				"colsort": "asc"
			},
			"lemma_gigpos": {
				"visible": false
			},
			"gedrukt": {
				"visible": false
			},
			"online": {
				"visible": false
			},
			"oudste_hulk": {
				 
			},
			"oudste_hulk_corr": {
				"visible": false
			},
			"michel_hulk": {
				
			},
			"michel_hulk_corr": {
				"visible": false
			},
			"nieuw": {
				"visible": false
			},
			"ok_2015": {
				"bgcolor": "#BCF5A9",
				"editable": true
			},
			"correctie": {
				"bgcolor": "#BCF5A9",
				"editable": true
			},
			"opmerking": {
				"bgcolor": "#BCF5A9",
				"editable": true
			},
			"unique_id": {
				"visible": false
			}
			
		}

};

