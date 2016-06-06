// list of tables that must be hidden or visible (don't use both, it's a matter of what's the most convenient)
oHiddenTablesList = ["Licenties", "Contactpersonen_details"];
oShowOnlyTables = [];





fn.setProjectTitle("Beheer klantenlicenties", "#b75c00");

// table general settings
oTableSettingsList = {
		
		"Contactpersonen": {
			
			"button_0":{
				"name": "Toon organisatie",
				"click": function(t){
					
					var oSelectedRow = fx.getFirstSelectedRowFrom(t);
					var sKlantcode = fx.getDataFromCellInRow(oSelectedRow, "Klantcode");
					
					fn.callDatabase("Klanten", {"Klantcode": sKlantcode}, function(){
						fn.scrollToTable("Klanten");
					});
				}
				
			},
			"button_1":{
				"name": "Toon details",
				"click": function(t){
					
					var oSelectedRow = fx.getFirstSelectedRowFrom(t);
					var id = fx.getDataFromCellInRow(oSelectedRow, "pkid");
					
					fn.callDatabase("Contactpersonen_details", {"id": id}, function(){
						fn.scrollToTable("Contactpersonen_details");
					}, {"viewtype": "form"});
					
				}
			}
		},
		
		"Klanten": {
			
			"button_0":{
				"name": "Nieuwe klant",
				"textcolor": "yellow",
				"click": function(t){
					
					var aFields = ["Naam", "Klanttype", 
									 "Adresregel1", "Adresregel2", "Adresregel3", 
									 "Postcode", "Stad", "Landcode", "Email",
									 "Tel"];
					
					fn.prompt("Voer gegevens in", 
							aFields, null, function(){
						
						
						// create new client id
						
						fn.callFunction("api.get_available_clientcode", [], function(response){
							
							var KlantCode = response["get_available_clientcode"];
							
							var aUserInput = fn.getPromptBoxInput();
							
							// add client id to the other client info
							
							aFields.unshift("Klantcode");
							aUserInput.unshift(KlantCode);
							
							// send it all to the database
							
							var aSearchValues = new Array();
							for (var i=0; i<aFields.length; i++)
								{
								aSearchValues[aFields[i]] = aUserInput[i];
								}
							
							fn.insertIntoDatabase(t, aSearchValues, null, function(resp){
								
								fn.callDatabase(t, {"Klantcode": KlantCode});
								
							});							
							
						});						
						
					});
					
				}
			},
			"button_1": {
								
				"name": "Verwijder selectie",
				"textcolor": "red",
				"bgcolor": "yellow",
				"click": function(t){
					
					
					fn.confirm("Zeker weten?", "Weet u het zeker?", function(){
						
						if (fx.getNumberOfSelectedRows(t) == 0)
							{
							fn.message("Let op!", "U moet minstens één regel selecteren!");
							}
						else
							{
							var oRows = fx.getSelectedRowsFrom(t);
							
							oRows.every(function(){
								
								var oRow = this;
								var KlantCode = fx.getDataFromCellInRow(oRow, "Klantcode");
								
								fn.removeFromDatabaseGivenFieldValues(t, {"Klantcode": KlantCode}, function(){
									
									fn.refreshTable(t);							
									});
								});
							
							
							}
					});
				}
			},
			
			"button_2": {
				
				"name": "Toon licenties",
				"tooltip": "Toon alle licenties van de gekozen klant",
				"click": function(t){
					
					if (fx.getNumberOfSelectedRows(t) == 0)
					{
					fn.message("Let op!", "U moet wel een klant selecteren!");
					}
				else
					{
					
					var oKlant = fx.getFirstSelectedRowFrom(t);
					var sKlantcode = fx.getDataFromCellInRow(oKlant, "Klantcode");
					
					fn.callDatabase("Klanten_en_licenties", {"Klantcode": sKlantcode}, function(){
						
						fn.scrollToTable("Klanten_en_licenties");
						
						});
					
					}
				}
			}
			
			
			
		},
		
		
		"Klanten_en_licenties":{
			
			"button_0":{				
				"name": "Open productenlijst",
				"tooltip": "Ga naar de productenlijst",
				"click": function(t){
					
					fn.callDatabase("Producten", null, function(){
						
						fn.scrollToTable("Producten");
					});
				}
				
			},
			"button_1": {				
				"name": "Verwijder selectie",
				"textcolor": "red",
				"bgcolor": "yellow",
				"tooltip": "Verwijder de geselecteerde licenties",
				"click": function(t){
					
					
					fn.confirm("Zeker weten?", "Weet u het zeker?", function(){
						
						if (fx.getNumberOfSelectedRows(t) == 0)
							{
							fn.message("Let op!", "U moet minstens één regel selecteren!");
							}
						else
							{
							var oRows = fx.getSelectedRowsFrom(t);
							
							oRows.every(function(){
								
								var oRow = 		this;
								var bLastOne =	fx.isLastRowOf(oRow, oRows);								
								var sRowId = 	fx.getDataFromCellInRow(oRow, "licentie_id");
								
								fn.removeFromDatabaseGivenFieldValues("Licenties", // true table
										{"unique_id": sRowId}, 
										function(){
									
											if (bLastOne)
												fn.refreshTable(t);	
										});								
								
								});							
							
							}
					});
				}
			},
			
		},
		
		"Producten":{
			
			
			"button_0": {
				
				"name": "Maak licentie aan",
				"tooltip": "Maak een licentie aan voor de gekozen klant en product",
				"click": function(t){
					
					if (fx.getNumberOfSelectedRows(t)==0)
						{
						fn.message("Let op!", "U moet minstens één product kiezen");
						}
					else if ( !fn.tableExists("Klanten"))
						{
						fn.message("Let op!", "Voor dat u een licentie kunt aanmaken, " +
								"moet u eerst een klant hebben gekozen. " +
								"Open daartoe eerst de klanten tabel.");
						}
					else if (fx.getNumberOfSelectedRows("Klanten")!=1)
						{
						fn.message("Let op!", "U moet wel een klant kiezen");
						}
					else
						{
						
						var oKlant = fx.getFirstSelectedRowFrom("Klanten");
						var oProducten = fx.getSelectedRowsFrom(t);
						
						var sKlantcode = fx.getDataFromCellInRow(oKlant, "Klantcode");
						var sKlantnaam = fx.getDataFromCellInRow(oKlant, "Naam");
						var sKlanttype = fx.getDataFromCellInRow(oKlant, "Klanttype");
						var sDatum = fn.getCurrentTimestamp("YYYY-MM-DD");
						
						fn.confirm("Let op", 
								"Zo meteen worden er voor de gekozen producten licenties aangemaakt voor klant " + sKlantnaam +
								" met code "+sKlantcode+"<br>" +
								"Is dat wat u wilt?", 
								function(){
							
									oProducten.every(function(){
										
										var oCurrentProduct = this;
										
										var sProductcode = fx.getDataFromCellInRow(oCurrentProduct, "Productcode");
										
										fn.callFunction("api.create_license_for_client_and_product", 
												[fn.quote(sKlantcode), fn.quote(sProductcode), fn.quote(sKlanttype), fn.quote(sDatum)], function(){
											
											if (fx.isLastRowOf(oCurrentProduct, oProducten))
												{
												fn.refreshTable("Klanten_en_licenties", function(){
													fn.scrollToTable("Klanten_en_licenties");
													});
												}
												
											});
										
										});
								}, 
								function(){
									fn.message("OK", "Bewerkint geannuleerd!");
								});
						
						}
					
					
				}
					
			},
			"button_1":{
				"name": "Nieuw product",
				"textcolor": "yellow",
				"tooltip": "Maak een nieuw product aan",
				"click": function(t){
					
					
					fn.prompt("Geef eerst een productcode", ["Productcode"], null, function(){
						
						var prodCode = fn.getPromptBoxInput("Productcode");
						fn.insertIntoDatabase(t, {"Productcode": prodCode}, null, function(){
							
							var aFields = ["Beschrijving", "Beschrijving2", "Beschrijving3"];
							
							fn.prompt("Vul productinfo in", aFields, null, function(){
								
								var aUserInput = fn.getPromptBoxInput();
								var aProductinfo = new Array();
								for (var i=0; i<aFields.length; i++)
									{
									aProductinfo[aFields[i]] = aUserInput[i];
									}
								
								fn.updateDatabaseGivenFieldValues(t, 
										{"Productcode": prodCode}, 
										aProductinfo, 
										function(){
											fn.message("Gelukt", "Product toegevoegd", function(){
												
												fn.goToTheRightPage(t, "Productcode", prodCode);
											});
										});
								
							});
							
						});
						
					});
					
				}
			},
			"button_2": {
								
				"name": "Verwijder selectie",
				"textcolor": "red",
				"bgcolor": "yellow",
				"tooltip": "Verwijder de geselecteerde producten",
				"click": function(t){
					
					
					fn.confirm("Zeker weten?", "Weet u het zeker?", function(){
						
						if (fx.getNumberOfSelectedRows(t) == 0)
							{
							fn.message("Let op!", "U moet minstens één product selecteren!");
							}
						else
							{
							var oRows = fx.getSelectedRowsFrom(t);
							
							oRows.every(function(){
								
								var oRow = this;
								var ProductCode = fx.getDataFromCellInRow(oRow, "Productcode");
								
								fn.removeFromDatabaseGivenFieldValues(t, {"Productcode": ProductCode}, function(){
									
									fn.refreshTable(t);							
									});
								});
							
							
							}
					});
				}
			}
			
		}
		
};


// configuration at column level
oTableConfigurationList = {
		
		"Contactpersonen": {
			
			"pkid": {
				"visible": false
			},
			
			"Klantcode":{
				"bgcolor": ["#66cdaa"],
				"textcolor": "red"

			},
			
			"Voornaam":{
				"editable": true
			},
			"Tussennaam":{
				"editable": true
			},
			"Achternaam":{
				"editable": true
			},
			"Email":{
				"editable": true
			}
			
			
		},
		
		"Klanten": {
			
			"Klantcode":{
				"bgcolor": ["#66cdaa"],
				"textcolor": "red"

			},
			
			"Naam": {
				"colsort": "asc",
				"editable": true
			},
			"Klanttype":{
				"editable": true
			},
			"Adresregel1":{
				"editable": true
			}, 
			"Adresregel2":{
				"editable": true
			}, 
			"Adresregel3":{
				"editable": true
			}, 
			"Postcode":{
				"editable": true
			}, 
			"Stad":{
				"editable": true
			}, 
			"Provinciecode":{
				"editable": true
			}, 
			"Landcode":{
				"editable": true,
				"choosefrom": []
			}, 
			"Email":{
				"editable": true
			}, 
			"WWW":{
				"editable": true
			}, 
			"Fax":{
				"editable": true
			}, 
			"Tel":{
				"editable": true
			}, 
			"Notitie":{
				"editable": true
			}, 
			"Afdeling":{
				"editable": true
			}, 
			"Debiteurnr":{
				"editable": true
			}, 
			"Crediteurnr":{
				"editable": true
			}, 
			"Debiteurcode":{
				"editable": true
			}, 
			"Crediteurcode":{
				"editable": true
			}
		},
		
		"Klanten_en_licenties":{
			
			"licentie_id":{
				"visible": false
			},
			
			"Naam":{
				
			},
			"Beschrijving":{
				
			},
			"Productcode":{
				
			},
			"Attachment":{
				"editable": true
			},
			"Datum": {
				
			},
			"Klantcode	": {
				
			}
		},
		
		"Producten":{
			
			"Productcode":{
				"bgcolor": ["#66cdaa"],
				"textcolor": "red"
			},
			
			"Beschrijving": {
				"colsort": "asc",
				"editable": true
			},
			"Beschrijving2": {
				"editable": true
			},
			"Beschrijving3": {
				"editable": true
			}
		}

};

fn.callDatabase("Klanten");