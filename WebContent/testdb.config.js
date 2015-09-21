// list of tables that must be hidden or visible (don't use both, it's a matter of what's the most convenient)
oHiddenTablesList = [];
oShowOnlyTables = [];



var aForenames = ["Frank", "Bart", "Mathieu", "Katrien", "Rob", "Carole", "Adrienne", 
                  "Dirk", "Hans", "Marijke"];
var aFamilyNames = ["Jansen", "Vanvoren", "Vanachter", "Naaktgeboren", "Sjiekgeboren",
                    "Van der Trommel", "Rookteveel", "Ruiktvanver", "Stinktkrachtig"];
var aLief = [true, false];	


// table general settings
oTableSettingsList = {
		
		
		tabel1: {
			
			button_0:{
				
				"name": "updateDbGivenANode",
				"click": function(t){
					
					fn.message("Job", "Ken de selectie leeftijd=NULL en lief=false toe", function(){
						
						var aRows = fn.getSelectedRowsFrom(t);
						
						aRows.each(function(){
							
							var nCurrentNode = this;
							
							fn.updateDatabaseGivenANode(t, nCurrentNode, 
									["leeftijd", "lief"], [null, false], 
									false, function(){
								fn.refreshTable(t);
							});
							
						});
						
					});
				}
				
			},
			button_1:{
				
				"name": "updateDbGivenFieldVals",
				"click": function(t){
					
					var iRandomNr = Math.floor(Math.random()*(aForenames.length));
					var sRandomName = aForenames[iRandomNr];
					var iLeeftijd = Math.floor(Math.random()*80);
					
					fn.message("Job", "Als iemand '"+sRandomName+"' heet en zijn leeftijd=NULL, " +
							"kennen we hem leeftijd="+iLeeftijd+" en achternaam=NULL toe", 
							function(){
						
						fn.updateDatabaseGivenFieldValues(t, 
								{"voornaam": sRandomName, "leeftijd": null}, 
								{"leeftijd": iLeeftijd, "achternaam": null}, false, function(){
									fn.refreshTable(t);
								});
						
					});
					
					
					
					
				}
			},
			button_2:{
				"name": "insertIntoDb",
				"click": function(t){
					
					fn.message("Job", "Voeg een willekeurig aantal (1-10) nieuwe individuen toe", function(){
						
						var nrOfNewRows = Math.floor(Math.random()*5);
						
						for (var i=0; i<nrOfNewRows; i++)
							{
							
							var sRandomForename = aForenames[Math.floor(Math.random()*(aForenames.length))];
							var sRandomFamilyName = aFamilyNames[Math.floor(Math.random()*(aFamilyNames.length))];
							var bLief = aLief[Math.floor(Math.random()*(aLief.length))];
							var iLeeftijd = Math.floor(Math.random()*80);
							
							fn.insertIntoDatabase(t, 
									{
									"voornaam": sRandomForename,
									"achternaam": sRandomFamilyName,
									"lief": bLief,
									"leeftijd": iLeeftijd
									}, 
									null, false, function(){
										if (i==nrOfNewRows-1) fn.refreshTable(t);
									});
							}
						
					});
					
				}
			},
			button_3:{
				"name": "getIdFromDb",
				"click": function(t){
					
					var iRandomNr = Math.floor(Math.random()*(aForenames.length));
					var sRandomName = aForenames[iRandomNr];
					
					fn.message("Job", "Verkrijg ID van mensen die '"+sRandomName+"' heten en leeftijd=NULL hebben", function(){
						
						fn.getIdFromDatabase(t, {"voornaam": sRandomName, "leeftijd": null}, function(id){
							
							fn.message("Hier is het ID", "ID:"+id);
							
						});
						
					});
					
				}
			},
			button_4:{
				"name": "rmFromDnGivenFieldVals",
				"click": function(t){
					
					fn.message("Job", "wat doen we hier?", function(){
						
						var aRows = fn.getSelectedRowsFrom(t);
						
					});
					
				}
			},
			button_5:{
				"name": "getRecordGivenFieldVals",
				"click": function(t){
					
					fn.message("Job", "wat doen we hier?", function(){
						
						var aRows = fn.getSelectedRowsFrom(t);
						
					});
					
					
				}
			},
			button_6:{
				"name": "callFunction",
				"click": function(t){
					
					fn.message("Job", "Zet de selectie om tot voornaam=NULL, achternaam=NULL, lief=false, leeftijd=NULL", function(){
						
						var aRows = fn.getSelectedRowsFrom(t);
						
						aRows.each(function(){
							
							var nCurrentRow = this;
							
							var id = fn.getRowId(nCurrentRow);
							
							fn.callFunction("dowat", [id, null, null, null, false], 
									function(){
								
								if (fn.isLastNodeOf(nCurrentRow, aRows))
									fn.refreshTable(t);
							});
							
						});
						
					});
					
				}
			}
			
		}
		
		
};


// configuration at column level
oTableConfigurationList = {
		
		tabel1: {
			
			id:{
				
			},
			voornaam: {
				"editable": true
			},
			achternaam: {
				"editable": true
			},
			leeftijd:{
				"editable": true
			},
			lief:{
				"editable": true
			}
		}

};