// list of tables that must be hidden or visible (don't use both, it's a matter of what's the most convenient)
oHiddenTablesList = [];
oShowOnlyTables = [];



// corpus URL

var sCorpusUrl = "http://surinaams.corpus.taalbanknederlands.inl.nl/searchsurinaams/page/search";


// table general settings
oTableSettingsList = {
		
		antilliaans: {
			size: "80%",
			
			"button_0":{
 				"name": "Voeg lemma toe",
 				"click": function(confTable){
 					
 					var wordform = fn.prompt("Geef een lemma", 
 							["lemma", "pos"], 
 							["", ""], 
 							function(){
 						
		 						var sLemma = fn.getPromptUserInput("lemma");
		 						var sLemmaPos = fn.getPromptUserInput("pos");
		 						
		 						fn.insertIntoDatabase(confTable, 
		 								{
		 								"lemma": sLemma, 
		 								"pos":sLemmaPos,
		 								"corrected_lemma": sLemma, 
		 								"corrected_pos":sLemmaPos
		 								}, 
		 								"id", // return id 
		 								false,
		 								function(){
		 									
		 									// Now we will show the new lemma.
		 									// First refresh the table,
		 									// and than, if the id is not to be found
		 									// on the refreshed page, that means the lemma
		 									// belongs to some other page: in that
		 									// case, write the new record on the first
		 									// row, temporarily	
		 									
		 									fn.refreshTable(confTable, function(){
		 										
		 										var id = fn.getLastDbResponse();
		 										
		 										// check if the id of the new lemma is to be found 
		 										// on the current page
		 										var found = false;
		 										var aAllRows = fn.getAllRows(confTable);
		 										aAllRows.each(function(){
		 											
		 											var sRowId = fn.getRowId(this);		 											
		 											// id found?
		 											if (sRowId == id)
		 												{
		 												found = true;
		 												
		 												// select the added lemma row, so it's visible to user
		 												var aNodes = fn.getAllNodesWhere(confTable, {"id": id});		 												
		 												if (aNodes != null)
		 													{
		 													var iRowNumber = fn.getRowNumberOnScreen(confTable, aNodes[0]);
		 													fn.selectRow(confTable, iRowNumber);
		 													}
		 												}
		 										});
		 										
		 										// Lemma is not on the page
		 										// Put it at the first row, so it is visible to the user
		 										if ( !found )
		 											{
		 											
		 											// add callback, in such a way that the added lemma row
		 											// is selected after we accessed the page where it is
		 											// to be found (so it's visible to user)
		 											fn.addDrawCallback(confTable, function(){
		 												
		 												
		 												var aNodes = fn.getAllNodesWhere(confTable, {"id": id});		 												
		 												if (aNodes != null)
		 													{
		 													var iRowNumber = fn.getRowNumberOnScreen(confTable, aNodes[0]);
		 													fn.selectRow(confTable, iRowNumber);
		 													}
		 													
		 											});
		 											
		 											// after this function call, the callback hereabove
		 											// will be called automically
		 											fn.goToTheRightPage(confTable, "lemma", "^"+sLemma);
		 											
		 											}
		 										
		 									});
		 									
		 								});
		 						
		 						
		 					});
 				}
 			}
		}
};


// configuration at column level
oTableConfigurationList = {
		
		
		antilliaans: {
			
			id: {"visible": false},
			lemma: {
				"colsort": "asc",
				
            	"cell_tooltip": "Klik hier om het Corpus Antilliaans te openen",
				"click": function(someTable, nNode){
					
					var lemma = fn.getDataFromCellNode(someTable, nNode);
					window.open(sCorpusUrl + "?lemma=" + lemma);
				}
			},
			corrected_lemma: {"editable": true, "bgcolor": "#D8F6CE"},
			pos: {},
			corrected_pos: { "editable": true, "bgcolor": "#D8F6CE"},
			opmerkingen: {"editable": true, "bgcolor": "#D8D8D8"},
			frequentie: {},
			an_score: {},
			typisch_an: {"editable": true, "bgcolor": "#D8F6CE"},
			weg: {"editable": true, "bgcolor": "#D8D8D8"}
		}

};