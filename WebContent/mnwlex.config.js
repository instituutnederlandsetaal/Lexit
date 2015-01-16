// list of tables that must be hidden or visible (don't use both, it's a matter of what's the most convenient)
oHiddenTablesList = [];
oShowOnlyTables = [];

// table general settings
oTableSettingsList = {
		
		token_attestations: {
			
			callback: function(t){
				highlightAllQuotes(t);
			},
			repeat_callback: true
		}
		
};


// configuration at column level
oTableConfigurationList = {

		
		lemmata_and_paradigma: {
			
			modern_lemma: {
				"colsort": "asc" // sort #1
			},
			persistent_id: {
				"colsort": "asc", // sort #2
				"cell_tooltip": "Open MNW",
				"click": function(t,n){
					
					var iPersistentId = fn.getDataFromCellNode(t, n);
					window.open("http://gtb.inl.nl/iWDB/search?actie=article&wdb=MNW&id="+iPersistentId);
					
				}
			},
			
			analyzed_wordform_id: {
				"cell_tooltip": "Toon citaten",
				"click": function(t,n){
					
					var iAwfId = fn.getDataFromCellNode(t, n);
					fn.callDatabase("token_attestations", {"analyzed_wordform_id": iAwfId});
				}
			},
			group_id: {
				"colsort": "asc", // sort #3
				"cell_tooltip": "Totaal citaten bijbehorend bij groep",
				"click": function(t,n){
					
					var iGroupId = fn.getDataFromCellNode(t, n);
					fn.callDatabase("token_attestations", {"group_id": iGroupId});
				}
			}
		},
		
		token_attestations: {
			
			quotation_section_id: {
				"colsort": "asc"
			}
		}
};


// start with the main table

fn.callDatabase("lemmata_and_paradigma");



// needed functions for highlight

function highlightAllQuotes(confTable){
	
	fn.showProcessingMsg(confTable); 
	
	var aAllRowIds = fn.getAllRows(confTable);	
	
	aAllRowIds.each(function(){
		
		putHighlightOnOneRow(confTable, this);
		
	});
	
	fn.removeProcessingMsg(confTable);
	
};


function putHighlightOnOneRow(confTable, confNode) {
	
	var sQuote = fn.getDataFromCellInRowNode(confTable, confNode, "quote");
	
	var iStartIndex = fn.getDataFromCellInRowNode(confTable, confNode, "start_pos");
	var iEndIndex   = fn.getDataFromCellInRowNode(confTable, confNode, "end_pos");
	
	var aNewPairsArray = new Array();
	aNewPairsArray.push([iStartIndex, iEndIndex]);
	
	// call the highlight function with the whole array of position pairs
	if (aNewPairsArray.length>0)
		sQuote = fn.getHighlight(sQuote, aNewPairsArray, "yellow");
		
	// put the string back into the table
	fn.putDataIntoCell(confTable, confNode, "quote", sQuote);
};
