// list of tables that must be hidden or visible (don't use both, it's a matter of what's the most convenient)
oHiddenTablesList = [];
oShowOnlyTables = [];

// table general settings
oTableSettingsList = {
		
		toc_entry_namen_totaal:{
			
			"size": "50%",
			
			"button_0": {
				"name": "Opsplitsen per brief",
				"tooltip": "Wanneer het toekennen van de juist auteur niet 'per deel' maar 'per brief' moet geschieden, " +
						"klik dan hier om de record per brief op te splitsen",
				"click": function(t){
					
					var oSelectedRows = fx.getSelectedRowsFrom(t);
					
					if ( oSelectedRows. any() )
						{
						
						fn.confirm("Let op", "De geselecteerde toc-entry zal nu per brief worden opgesplitst, zodat " +
								"u de juist auteur per brief zult kunnen toekennen. Weet u het zeker?", 
								function(){
							
									oSelectedRows.every(function(){
										
										var oRow = 			this;
										var sId = 			fx.getRowId(oRow);
										var bIsLastRow =	fx.isLastRowOf(oRow, oSelectedRows);
										
										fn.callFunction("splitup_toc_entry", [sId], function(){
											
											if (bIsLastRow)
												fn.refreshTable(t);
											});
										
										});
							
								}, 
								function(){								
									fn.message("OK", "Opsplitsen geannuleerd");								
								});
						
						}
					else
						{
						fn.message("Let op!", "U heeft niets geselecteerd!")
						}
					
					
				}
			},
			
			"button_1":{
				"name": "Samenvoegen",
				"tooltip": "Voeg brieven samen in één record",
				"click": function(t){
					
					var oSelectedRows = fx.getSelectedRowsFrom(t);
					
					if ( oSelectedRows. any() )
						{
						
						fn.confirm("Let op", "De geselecteerde toc-entries zullen nu worden samengevoegd, omdat zij allemaal door " +
								"dezelfde auteur zijn geschreven. Weet u het zeker?", 
								function(){

									// Gather info about first selected row.
									// The other rows will have to match this one in terms of toc-entry name and partnumber,
									// otherwise it won't be allowed to concatenate those rows
							
									var oFirstSelectedRow =	fx.getFirstSelectedRowFrom(t);
									var	sFirstId = 			fx.getRowId(oFirstSelectedRow);
									var sFirstDeelNr = 		fx.getDataFromCellInRow(oFirstSelectedRow, "deelnr");
									var sFirstTocEntry = 	fx.getDataFromCellInRow(oFirstSelectedRow, "toc_entry_name");
									var sFirstLongName = 	fx.getDataFromCellInRow(oFirstSelectedRow, "longname");
									var sFirstMatchesInIndex = fx.getDataFromCellInRow(oFirstSelectedRow, "matches_in_index");
									
									// Now go through list of selected rows
									
									var aBriefnummerArr = new Array();
									
									oSelectedRows.every(function(){
										
										var oRow = 			this;
										var sId = 			fx.getRowId(oRow);
										var sDeelNr = 		fx.getDataFromCellInRow(oRow, "deelnr");
										var sbriefNr =		fx.getDataFromCellInRow(oRow, "briefnummer");
										var sTocEntry = 	fx.getDataFromCellInRow(oRow, "toc_entry_name");
										var sLongName = 	fx.getDataFromCellInRow(oRow, "longname");
										var bIsLastRow =	fx.isLastRowOf(oRow, oSelectedRows);
										
										aBriefnummerArr.push(sbriefNr);
										
										if (	sDeelNr != sFirstDeelNr ||
												sTocEntry != sFirstTocEntry ||
												sLongName != sFirstLongName)
											{
											aBriefnummerArr = new Array();
											fn.message("Fout", "De geselecteerde records horen niet samen en mogen " +
													"dus niet worden samengevoegd.");
											return false;
											}
										
									});
									
									
									// do the job, or was it disallowed?
									
									if (aBriefnummerArr.length > 0)
										{
										// if the selected rows are allowed to be concatenated, 
										// remove the single rows and ...
										
										oSelectedRows.every(function(){										
											fx.removeFromDatabaseGivenARow(this);
											});
										
										// ...  build a single concatenated one
										
										fn.insertIntoDatabase(t, {
											"deelnr": sFirstDeelNr,
											"toc_entry_name": sFirstTocEntry,
											"briefnummer": aBriefnummerArr.join(", "),
											"matches_in_index": sFirstMatchesInIndex,
											"longname": sFirstLongName
											}, null,
											function(){
												fn.refreshTable(t);
											});
										
										}
									
									
									
								}, 
								function(){
									fn.message("OK", "Samenvoegen geannuleerd");
								});
						
						}
					else
						{
						fn.message("Let op!", "U heeft niets geselecteerd!")
						}
					
				}
			}
		},
		
		matchlijst:{
			"size": "50%"
		}
		
		
};


// configuration at column level
oTableConfigurationList = {
		
		
		toc_entry_namen_totaal:{
	
			"deelnr":{
				"colsort": "asc"  // sort #1
				//visible: false
			},
			"toc_entry_name":{
				"colsort": "asc"  // sort #2
			},
			"briefnummer": {
				"visible": false
			},
			
			"id":{
				"visible": false
			},
			
			"index_id": {
				//"visible": false
			},
			"matches_in_index":{
				"filter": "!1"
			},
			
			"zoek": { 
				"button": "Zoek",
				"click": function(t, n){
					
					var sName = (fn.getDataFromSiblingNode(n, "toc_entry_name")).toLowerCase();
					var sDeelNr = (fn.getDataFromSiblingNode(n, "deelnr")).toLowerCase();
					fn.callDatabase("matchlijst", {"details": sName, "deelnr": sDeelNr});
					
				}
			}
			
		},
		
		
		matchlijst: {
			
			"deelnr":{
				"colsort": "asc"  // sort #1
				//"visible": false
			},
			"longname":{
				"colsort": "asc"  // sort #2
			},
			"shortname":{
				"visible": false
			},
			"id":{
				"visible": false
			},
			"ok": {
				
				"button": "OK",
				"click": function(t, n){
					
					// which person was selected in current table?
					
					var oCell =			fx.getCell(n);
					var sId = 			fx.getDataFromSiblingCell(oCell, "id");
					var sLongName =		fx.getDataFromSiblingCell(oCell, "longname");
					var sDeelNr = 		fx.getDataFromSiblingCell(oCell, "deelnr");
					
					// assign this person's id to all selected records in toc_entry_namen_totaal
					
					var oSelectedRows = fx.getSelectedRowsFrom("toc_entry_namen_totaal");
					
					if ( oSelectedRows.any() )
						{					
						
						oSelectedRows.every(function(){
							
							var oRow = 				this;
							var sOtherTableDeelNr =	fx.getDataFromCellInRow(oRow, "deelnr");
							
							// 'deel-nr' must match because
							// if persons in the matchlijst table (which are the original book index)
							// are supposed to be referring to persons out of the toc_entry_namen table
							// 
							if (sDeelNr == sOtherTableDeelNr)
								{
									fx.updateDatabaseGivenACellOrRow(oRow, 
											
									{
										"longname": sLongName,
										"index_id": sId
									}, 
									
									function(){
										
										// Link was just built.
										// Now refresh the toc_entry_namen table
										// and make sure the selected rows are still selected
										
										fn.refreshTable("toc_entry_namen_totaal", function(){	
											
											oSelectedRows.every(function(){
												
												var iRowNumber = fx.getRowNumberOnScreen(this);
												fx.selectRow("toc_entry_namen_totaal", iRowNumber);
												
											});
										});
									});
								}
							
							// 'deel-nr' mismatch
							else
								{
								fn.message("Fout!", "Dit kan niet. Deze auteur komt niet voor in deel "+sDeelNr);
								}
							
							});
						
						
						}
					
					// we need at least one selected record...
					else
						{
						fn.message("Fout!", "In de tabel 'toc_entry_namen_totaal' heeft U niets geselecteerd!");
						}
						
					
				}
				
			}
		}

};



// call needed tables at start up and align them

fn.callDatabase("toc_entry_namen_totaal", null, function(){
	
	fn.callDatabase("matchlijst", null, function(){
		
		fn.alignTables("toc_entry_namen_totaal", "matchlijst");
		
	});
});