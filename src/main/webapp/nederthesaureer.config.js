// list of tables that must be hidden or visible (don't use both, it's a matter of what's the most convenient)
oHiddenTablesList = [];
oShowOnlyTables = ["indexauteurs", "thesauteurs"];

// table general settings
oTableSettingsList = {
		
		indexauteurs:{
			
			"size": "50%",
			
			"button_0": {
				
				"name": "Ongedaan maken",
				
				"click": function(t){
					
					var oSelectedRows = fx.getSelectedRowsFrom(t);
					
					if ( oSelectedRows. any() )
						{
						
						oSelectedRows.every(function(){
							
							var oRow = 			this;
							var bIsLastRow =	fx.isLastRowOf(oRow, oSelectedRows);
							
							fx.updateDatabaseGivenACellOrRow(oRow,
								
								{
								"person_id": null,
								"personname_id": null
								}, 
								function(){								
									if (bIsLastRow) fn.refreshTable(t);
								})
							
							});
						
						}
				}
			}
			
		}, 

		thesauteurs:{
			
			"size": "50%",
			
		}
};


// configuration at column level
oTableConfigurationList = {
		
		
		indexauteurs: {
			
			"id": {
				"visible": false
			},
			
			"opmerking": {
				"editable": true
			},
	
			"zoek": { 
				
				"button": "Zoek",				
				"click": function(t, n){
					
					var sName = (fn.getDataFromSiblingNode(n, "longname")).toLowerCase();
					fn.callDatabase("thesauteurs", {"longname": "\\y"+sName+"\\y"});
					
				}
			}
			
		},
		
		
		thesauteurs: {
			
			"longname": {				
				//"visible": false
			},
			
			"person_id":{
				"visible": false
			},
			
			"personname_id":{
				"visible": false
			},
			
			"ok": {
				
				"button": "OK",
				"click": function(t, n){
					
					// which person was selected in current table?
					
					var oCell =			fx.getCell(n);
					var sPersonId =		fx.getDataFromSiblingCell(oCell, "person_id");
					var sPersonNameId = fx.getDataFromSiblingCell(oCell, "personname_id");
					
					// assign this person's id to all selected records in indexauteurs
					
					var oSelectedRows = fx.getSelectedRowsFrom("indexauteurs");
					
					if ( oSelectedRows.any() )
						{					
						
						oSelectedRows.every(function(){
							
							var oRow = 	this;
							
							fx.updateDatabaseGivenACellOrRow(oRow, 
									
									{
										"person_id": sPersonId,
										"personname_id": sPersonNameId
									}, 
									
									function(){										
										fn.refreshTable("indexauteurs", function(){	
											
											oSelectedRows.every(function(){
												
												var iRowNumber = fx.getRowNumberOnScreen(this);
												fx.selectRow("indexauteurs", iRowNumber);
												
											});
										});
									});
							
							});
						
						
						}
					
					// we need at least one selected record...
					else
						{
						fn.message("Fout!", "In de tabel 'indexauteurs' heeft U niets geselecteerd!");
						}
						
					
				}
				
			}
		}

};



// call needed tables at start up and align them

fn.callDatabase("indexauteurs", null, function(){
	
	fn.callDatabase("thesauteurs", null, function(){
		
		fn.alignTables("indexauteurs", "thesauteurs");
		
	});
});