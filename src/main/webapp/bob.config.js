// list of tables that must be hidden or visible (don't use both, it's a matter of what's the most convenient)
oHiddenTablesList = [];
oShowOnlyTables = [];

// table general settings
oTableSettingsList = {
		
		"Klanten": {
			
			"button_0":{
				"name": "Nieuwe klant",
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
							
							fn.insertIntoDatabase(t, aSearchValues, null, function(){
								
								fn.goToTheRightPage(t, "Klantcode", KlantCode);
								
							});
							
							
						});
						
						
						
						
						
						
						
					});
					
				}
			}
			
			
		}
		
};


// configuration at column level
oTableConfigurationList = {

};