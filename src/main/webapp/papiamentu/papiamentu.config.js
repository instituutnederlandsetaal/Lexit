/**
 * 
 */

oHiddenTablesList = ["buki_x_matematika", "bukitemp", "matematika_backup", "buki_backup", "matematika"];

oTableSettingsList = {

	"buki_di_oro": {
		
		"size": "80%",
		
		"group": "worktable",
		
		"columns_sorting": {
			"lemma": "asc",
			"woordsoort": "asc"
		},
		
		"columns_order": ["id", "bron_id", "lemma", "woordsoort", "woordsoort_retro", "keurmerk", "bewaren", "opmerking", "locked"],
		
		"button_0":{
			
			"name": "Voeg lemma toe",
			"click": function(t){
				
				fn.prompt("Voer lemma in", ["lemma", "woordsoort"], ["", ""], 

						function(){
							
							var sLemma = 		fn.getPromptBoxInput("lemma");
							var sWoordsoort =	fn.getPromptBoxInput("woordsoort");
							
							// first show the new lemma in the table
							
							fn.insertIntoDatabase("buki_di_oro", {"lemma": sLemma, "woordsoort": sWoordsoort}, null, function(){
								
								fn.goToTheRightPage(t, "lemma", sLemma);
							});
							
				});
				
			}
		},
		
		"button_1":{
			
			"name": "Verwijder selectie",
			"click": function(t){
				
				if (fx.getNumberOfSelectedRows(t) > 0)
				{
				fn.confirm("Let op", "Weet u zeker dat u deze rijen wilt verwijderen?", 
						
					// yes we're sure
						
					function(){
					
						var oSelection = fx.getSelectedRowsFrom(t);
						
						oSelection.every(function(){
							
							var oCurrentRow = this;
							var bLemmaLocked =	fx.getDataFromCellInRow(oCurrentRow, "locked");
							var bLastRow = fx.isLastRowOf(oCurrentRow, oSelection);
							
							if (bLemmaLocked == 't')
								{
								fn.message("Let op", "Gelockte rijen kunnen niet worden verwijderd!");
								if (bLastRow) 
									{
									fn.refreshTable(t);
									}
								}
							else
								{
								fx.removeFromDatabaseGivenARow(this, 
										function(){
											if (bLastRow) 
												{
												fn.refreshTable(t);
												}
									});
								}
							
							
						});
					}, 
					
					// no, cancel!
					
					function(){
						fn.message("OK", "Operatie door gebruiker geannuleerd");
					})
				}
				
			}
		},
		
		"button_2": {
			"name": "(Un)lock",
			"bgcolor": "#F5D0A9",
			"click": function(t){
				
				var oSelectedRows = fx.getSelectedRowsFrom(t);
			
				oSelectedRows.every(function(){
					
					var thisRow = this;					
					var bLemmaLocked =	fx.getDataFromCellInRow(thisRow, "locked");
					var bLastRow = 		fx.isLastRowOf(thisRow, oSelectedRows);
					
					var lockedNewValue = (bLemmaLocked == 't' ? false : true);
					fx.updateDatabaseGivenACellOrRow(thisRow, {"locked": lockedNewValue}, function(){
						if(bLastRow) 
							fn.refreshTable(t);
					});	
					
				});
				
			}
		},
		
		"callback": function(t){
			
			var oRows = fx.getAllRows(t);
			
			oRows.every(function(i){
				
				var thisRow = this;
				var bLemmaLocked =	fx.getDataFromCellInRow(thisRow, "locked");
				
				if (bLemmaLocked == 't')
					{
					$(fx.getCellNode(thisRow, "lemma")).editable('disable');
					$(fx.getCellNode(thisRow, "lemma")).css("opacity", "0.5");
					
					$(fx.getCellNode(thisRow, "woordsoort")).editable('disable');
					$(fx.getCellNode(thisRow, "woordsoort")).css("opacity", "0.5");
					
					//$(fx.getCellNode(thisRow, "woordsoort_retro")).editable('disable');
					$(fx.getCellNode(thisRow, "woordsoort_retro")).css("opacity", "0.5");
					
					$(fx.getCellNode(thisRow, "keurmerk")).find("input").attr("disabled", "disabled");
					$(fx.getCellNode(thisRow, "keurmerk")).css("opacity", "0.5");
					
					$(fx.getCellNode(thisRow, "bewaren")).find("input").attr("disabled", "disabled");
					$(fx.getCellNode(thisRow, "bewaren")).css("opacity", "0.5");
					
					$(fx.getCellNode(thisRow, "opmerking")).editable('disable');
					$(fx.getCellNode(thisRow, "opmerking")).css("opacity", "0.5");
					}
				
				
			});
			
			
		},
		
		"repeat_callback": true
	}, 
	
	"buki": {
		"size": "80%"
	}

};

oTableConfigurationList = {
		
		"buki_di_oro": {
			
			"bron_id": {
				
			},
			
			"id": {
				
			},
			
			"lemma": {
				"editable": true
			},
			"woordsoort": {
				"editable": true
			},
			"woordsoort_retro": {
				
			},
			"keurmerk": {
				"bgcolor": "#E0F8EC",
				"width": "50px",
				"editable": true
			},
			"bewaren": {
				"bgcolor": "#E0F8EC",
				"width": "50px",
				"editable": true
			},
			"opmerking": {
				"editable": true
			},
			
			"locked": {
				"visible": false
			}
		},
		
		
		"buki" : {
			"id": {
				"visible": false
				},
			"entrada": {
				//"editable": true, 
				"colsort": "asc"
				},
			"kontabel": {
				"choosefrom": [] 
				//, "editable": true
			},
			"kategoria": {
				"choosefrom": []
				//, "editable": true
			},
			"opzoeken":{
				"visible": false
//				"button": "Opzoeken",
//				"click": function(oTable, nNode){					
//					var wordToLookUp = "\\y"+fn.getDataFromSiblingNode(nNode, "entrada")+"\\y";
//					fn.callDatabase("matematika", {"papiamentu": wordToLookUp});
//				}
			},
			"in_matematika": {
				"visible": false
				// "filter": 't'
			} 
		},
		
//		matematika: {
//			
//			papiamentu: {"editable": true, "colsort": "asc"},
//			nederlands: {"editable": true},
//			tema: {"editable": true},
//			definishon: {"editable": true},
//			id : {"visible": false},
//			paa : {"visible": false, "editable": true},
//			es : {"visible": false, "editable": true},
//			en : {"visible": false, "editable": true},
//			pt : {"visible": false, "editable": true},
//			la : {"visible": false, "editable": true},
//			ilus : {"visible": false, "editable": true}
//		}
};