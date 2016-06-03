// list of tables that must be hidden or visible (don't use both, it's a matter of what's the most convenient)
oHiddenTablesList = [];
oShowOnlyTables = [];

// table general settings
oTableSettingsList = {};


// configuration at column level
oTableConfigurationList = {

		
		worktable: {
			
			woordvormtekst: {
				"colsort": "asc"
				
			},
			
			probleem: {
				"editable": true
			},
			
			opmerking: {
				"editable": true
			},
			
			lemma:{
				
				"bgcolor": "#CED8F6",
				
				"click": function(t, n){
					
					
					var sCellValue = fn.getDataFromCellNode(n);
					var aCell = sCellValue.split("\+");
					
					var sWoordvorm = fn.getDataFromSiblingNode(n, "woordvormtekst");
					
					fn.promptReorder("Bepaal correcte volgorde", aCell, function(){
						
						var aNewOrder = fn.getPromptBoxOrder();
						
						for (var i=0; i<aNewOrder.length; i++)
							{
							aNewOrder[i] = aNewOrder[i]+1; // the database needs 1-based indexes 
							}
						
						fn.callFunction("resort_all_clitics", [sWoordvorm, sCellValue, aNewOrder.join("+")], function(){
							fn.refreshTable(t);
						});
						
						
					});
					
					
				}
				
			}
			
		}
		
};