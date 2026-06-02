

var molexadmin = {};



molexadmin.settings = {
	
	commission_report: {
			
		"group": "Spellingcommissie",
		
		"columns_sorting": {
			"verwerkt__online": "asc",
			"modern_lemma": "asc"
		},
		
		"button_0": {
			
			"name": "Rapport aanmaken",
			"click": function(t){
				
				var aDeliveryDates = {};
				var aDeliveryFullDate = [];
				
				fn.callFunction(sApiSchema+".get_delivery_data", [], function(resp){
					
					var aAllDeliveries = (resp["get_delivery_data"]).split("@@@");
					
					// parse each delivery
					for (var i=0; i<aAllDeliveries.length; i++) {
						
						var aOneDeliveryDate = ( aAllDeliveries[i] ).split("###");
						var sDeliveryName = aOneDeliveryDate[0];
						var sDeliveryFullDate = aOneDeliveryDate[1];
						
						var sDeliveryKey = sDeliveryName + " (opgeleverd: " + sDeliveryFullDate + ")";
						
						// store date
						aDeliveryFullDate.push(sDeliveryKey);
						aDeliveryDates[sDeliveryKey] = sDeliveryFullDate;
						}
					
				});
				
				fn.prompt(["Commissie-rapport", "Kies een oplevering (zoals gedefinieerd in tabel 'export_versions').<BR><BR>Het rapport zal worden opgemaakt vanaf de datum van deze oplevering:<BR>"], 
						["Oplevering"], 
						[aDeliveryFullDate], 
						function(resp){
					
							var sNewDate = aDeliveryDates[ resp["Oplevering"] ];
					
							fn.message("OK", "Het rapport wordt nu gegenereerd met alle gegevens vanaf "+sNewDate+". Even geduld...");
							
							fn.showProcessingMsg(t);
							
							setTimeout(function(){								
								fn.callFunction(sApiSchema+".build_commission_report", [sNewDate], function(){
										fn.closeDialog();
										fn.refreshTable(t);
								});	
							}, 500);
					
						}, 
						function(){							
							fn.message("OK", "Operatie geannuleerd door gebruiker");							
						});
								
			}	
		}
		
	},
	
	subsets: {
		
		"group": "Spellingcommissie",
		
		"columns_sorting": {"subset": "asc"},
		
		"size": "80%",
		
		"button_0":{
			
			"name": "Voeg subset toe",
			"click": function(t){
				
				fn.prompt("Voer gegevens in", ["subset", "omschrijving"], ["<geef de subset een naam>", ""], 

						function(){
							
							var sSubset = 		fn.getPromptBoxInput("subset");
							var sDescription =	fn.getPromptBoxInput("omschrijving");
							
							// first show the new subset in the table
							
							fn.callFunction(sApiSchema+".register_subset", [sSubset, sDescription], function(){
								
								fn.goToTheRightPage(t, "subset", sSubset);								
								
								// then update the pulldown values for the 'lemmata view'								
								//updateSubsets();
								
							});
					
				});
				
			}
		},
		
		"button_1":{
			
			"name": "Verwijder selectie",
			"click": function(t){
				
				if (fx.getNumberOfSelectedRows(t) > 0) {
					
					fn.confirm("Let op", "Weet u zeker dat u deze rijen wilt verwijderen?", 
							
						// yes we're sure
							
						function(){
						
							var oSelection = fx.getSelectedRowsFrom(t);
							oSelection.every(function(){
								var oCurrentRow = this;
								var bLastRow = fx.isLastRowOf(oCurrentRow, oSelection);
								fx.removeFromDatabaseGivenARow(this, 
									function(){
										if (bLastRow) {
											fn.refreshTable(t);
											
											// update the subsets available to the lemmata view
											//updateSubsets();
										}
									},
									function(err){
										fn.message("Let op", "Verwijderen is niet toegestaan.");
									});
								
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
			"name": "HTML export van subset", 
			"click" : function(t) {
				
				// only superuser are allowed
				if (superUser() && fn.getCurrentUser() == 'jesse') {
					
					if (fx.getNumberOfSelectedRows(t) > 0) {
						var oSelection = fx.getSelectedRowsFrom(t);
						oSelection.every(function(){
							var subset = fx.getDataFromCellInRow(this, "subset"); 
							var url = exportBase + subset; window.open(url); 
						});
					}
				}
				else {
					fn.message("Let op", "Deze actie is alleen toegestaan voor superuser Jesse.");
				}
				
			}
		}
	},
	
	nuancerende_opmerkingen: {
			
		"size": "80%",
		
		"button_0":{
			"name": "Voeg opmerking toe",
			"click": function(t){
				
				fn.prompt("Voer opmerking in", 
						["short_code", "nuancerende_opmerking"], 
						["", ""],
						function(){
							var sShortCode =	fn.getPromptBoxInput("short_code");
							var sNuanceOpm =	fn.getPromptBoxInput("nuancerende_opmerking");
							
							fn.insertIntoDatabase(t, 
									{
									"short_code": sShortCode,
									"nuancerende_opmerking": sNuanceOpm
									}, 
									null, 
									function(){
										fn.refreshTable(t);
									});
						}, 
						null, // no callback upon Cancel
						true, 
						[35,3]);
			}
		},
		"button_1":{
			"name": "Verwijder selectie",
			"click": function(t){
				
				fn.confirm("Let op", "Weet u het zeker?", function(){
					
					
					var oRows = fx.getSelectedRowsFrom(t);						
					
					oRows.every(function(){
						var aCurrentRow = this;
						
						var bLastRow = fx.isLastRowOf(aCurrentRow, oRows);
						
						fx.removeFromDatabaseGivenARow(aCurrentRow, 
							function(){
								if (bLastRow)
									fn.refreshTable(t);
							},
							function(err){
								fn.message("Let op", "Verwijderen is niet toegestaan.");
							});	
						});
				});
				
			}
		}
		
	},
		
	export_versions: {
		
		"group": "Spellingcommissie",
		
		"size": "80%",
		
		"button_0":{
			"name": "Voeg oplevering toe",
			"click": function(t){
				
				fn.prompt("Nieuwe oplevering", 
						["Naam van de oplevering"], 
						[""], 
						function(resp){
							
							fn.insertIntoDatabase(t, 
								{ "naam_oplevering": resp["Naam van de oplevering"] }, 
								null, 
								function(){
									fn.refreshTable(t);
								});
				});
			}
		},
		"button_1":{
			"name": "Verwijder selectie",
			"click": function(t){
				
				fn.confirm("Let op", "Weet u het zeker?", function(){
					
					var oRows = fx.getSelectedRowsFrom(t);
					
					oRows.every(function(){
						var aCurrentRow = this;
						
						var bLastRow = fx.isLastRowOf(aCurrentRow, oRows);
						
						fx.removeFromDatabaseGivenARow(aCurrentRow, 
							function(){
								if (bLastRow)
									fn.refreshTable(t);
							},
							function(err){
								fn.message("Let op", "Verwijderen is niet toegestaan.");
							});	
					});
				});
				
				
				
			}
		}
	}
	
};

molexadmin.config = {
	
	commission_report: {
			
		"unique_id": {
			"visible": false
		},
		
		"aandrager": {
			"editable": true,
			"bgcolor": "#E0F8EC"
		},
		
		"omschrijving": {
			"editable": true,
			"bgcolor": "#E0F8EC"
		},
		
		"besluit_cie": {
			"editable": true,
			"bgcolor": "#E0F8EC"
		}
	},
	
	subsets: {
		
		"subset": {
			"editable": true,				
			"editcallback": function(t, n, value){
				//updateSubsets();
			}
		},
		
		"geplande_uitleverdatum": {
			"editable": true
		},
		
		"uitgeleverd": {
			"editable": true
		},
		
		"omschrijving": {
			"editable": true
		}
	},
	
	
	nuancerende_opmerkingen:{
		
		short_code:{
			"colsort": "asc",
			"editable": true
		},
		nuancerende_opmerking:{
			"editable": true
			
		},
		opmerking:{
			"editable": true
		}
	},
	
	export_versions:{
		
		"id":{
			"colsort": "desc"
		},
		"naam_oplevering": {
			"editable": true
		},
		"opmerking": {
			"editable": true
		},
		"datum_oplevering":{
			"click": function(t, n){
				
				// is there some date already filled in?
				var sPreFilled = fn.getDataFromCellNode(n);
				var sDay = null, sMonth = null, sYear = null;
				
				// generate select values for date
				var aDays = 		generateSeries(1, 31, true);
				var aMonths = 		generateSeries(1, 12, true);
				var iCurrentYear =	new Date().getFullYear();
				var aYears = 		generateSeries(iCurrentYear-10, iCurrentYear, false);
				
				// pre-select the values that were already filled in, if any
				if (sPreFilled != '')
					{
					var aPrefilled = sPreFilled.split("-");
					sYear = 	aPrefilled[0];
					sMonth =	aPrefilled[1];
					sDay = 		aPrefilled[2];
					
					aYears[ aYears.indexOf(sYear) ] =		sYear+"::selected";
					aMonths[ aMonths.indexOf(sMonth) ] =	sMonth+"::selected";
					aDays[ aDays.indexOf(sDay) ] = 			sDay+"::selected";						
					}
				
				fn.prompt(["Datum oplevering", "Kies de datum van de oplevering"], 
						["Dag", "Maand", "Jaar"], 
						[aDays, aMonths, aYears], 
						function(resp){
					
							var aNewDate = [ resp["Jaar"], resp["Maand"], resp["Dag"] ];
							var sNewDate = aNewDate.join("-");
					
							fn.updateDatabaseGivenANode(n, {"datum_oplevering": sNewDate}, function(){
								fn.refreshTable(t);
							});
					
						}, 
						function(){
							
							fn.message("OK", "Operatie geannuleerd door gebruiker");
							
						});
								
			}
		},
		"datum_online":{
			"click": function(t, n){
				
				// is there some date already filled in?
				var sPreFilled = fn.getDataFromCellNode(n);
				var sDay = null, sMonth = null, sYear = null;
				
				// generate select values for date
				var aDays = 		generateSeries(1, 31, true);
				var aMonths = 		generateSeries(1, 12, true);
				var iCurrentYear =	new Date().getFullYear();
				var aYears = 		generateSeries(iCurrentYear-10, iCurrentYear, false);
				
				// pre-select the values that were already filled in, if any
				if (sPreFilled != '')
					{
					var aPrefilled = sPreFilled.split("-");
					sYear = 	aPrefilled[0];
					sMonth =	aPrefilled[1];
					sDay = 		aPrefilled[2];
					
					aYears[ aYears.indexOf(sYear) ] =		sYear+"::selected";
					aMonths[ aMonths.indexOf(sMonth) ] =	sMonth+"::selected";
					aDays[ aDays.indexOf(sDay) ] = 			sDay+"::selected";						
					}
				
				fn.prompt(["Datum online", "Kies de online-datum"], 
						["Dag", "Maand", "Jaar"], 
						[aDays, aMonths, aYears], 
						function(resp){
					
							var aNewDate = [ resp["Jaar"], resp["Maand"], resp["Dag"] ];
							var sNewDate = aNewDate.join("-");
					
							fn.updateDatabaseGivenANode(n, {"datum_online": sNewDate}, function(){
								fn.refreshTable(t);
							});
					
						}, 
						function(){
							
							fn.message("OK", "Operatie geannuleerd door gebruiker");
							
						});
								
			}
		}
		
	}
	
};