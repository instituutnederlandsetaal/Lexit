// list of tables that must be hidden or visible (don't use both, it's a matter of what's the most convenient)
oHiddenTablesList = [];
oShowOnlyTables = [];

// table general settings
oTableSettingsList = {
		
		special_onw_lemmata_worktable: {
			"size": "60%"
		},
		
		token_attestations_worktable: {
			
			"callback": function(t){
				highlightAllQuotes(t);
			},
			
			"repeat_callback": true
		}
		
		
};


// configuration at column level
oTableConfigurationList = {
		
		
		
		special_onw_lemmata_worktable: {
			
			correctie: {
				"editable": true
			},
			opmerkingen: {
				"editable": true
			},
			lemma_id:{
				"cell_tooltip": "Toon citaten",
				"click": function(t, n){
					
					var sLemId = fn.getDataFromCellNode(n);
					fn.callDatabase("token_attestations_worktable", {"lemma_id": sLemId});
					
				}
				
			},
			overnemen: {
				"button": "Overnemen",
				"button_tooltip": "",
				"click": function(t, n){
					
					var sLem = fn.getDataFromSiblingNode(n, "modern_lemma");
					fn.updateDatabaseGivenANode(n, {"correctie": sLem}, function(){
						fn.showProcessingMsg(t);
						
						fn.callRecord( fn.getRowNode(n), null, function(){
							fn.removeProcessingMsg(t);
						} );
						
					});
				}
			},
			persistent_id: {
				
				"cell_tooltip": "Toon woordenboek-artikel",
				"colsort": "asc",
				"click": function(t, n){
					
					var oCell = 		fx.getCell(n);
					var iPersistentId =	fx.getDataFromCell(oCell);
					
					window.open("http://gtb.inl.nl/iWDB/search?actie=article&wdb=ONW&id="+iPersistentId);
					
				}
			},
			id:{
				"visible": false
			}
		},

		
		token_attestations_worktable: {
			
			"opmerking": {
				"visible": false
			},
			
			"wdb": {
				"visible": false
			},
			
			"lemma_id": {
				"visible": false
			},
			
			"multiple_lemmata_analysis_id": {
				"visible": false
			},
			
			"attestation_id": {
				"visible": false
			},

			"onsetoffset": {
				"visible": false
			},
			"wordform": {
				"visible": false
			},
			
			"wordform_alphabetic": {
				"visible": false
			},
			"analyzed_wordform_ids": {
				"visible": false
			},
			"analyzed_wordform_ids_arr": {
				"visible": false
			},
			"group_id": {
				"visible": false
			},
			"derivation_ids": {
				"visible": false
			},
			"document_id": {
				"visible": false
			},
			"doorvoeren": {
				"visible": false				
			},
			"quote": {
				
				"colsort": "asc",
				
			}
		}

};


function highlightAllQuotes(t){
	
	fn.showProcessingMsg(t); 
	
	var aAllRowIds = fx.getAllRows(t);
	
	aAllRowIds.every(function(){		
		putHighlightOnOneRow(this);		
	});
	
	fn.removeProcessingMsg(t);
	
};


function putHighlightOnOneRow(oRow) {
	
	var sQuote =	fx.getDataFromCellInRow(oRow, "quote");
	sQuote = 		fn.removeHighlight(sQuote);
	
	// get the position pairs (x,y|x,y|...)
	var sAllPositionPairs = fx.getDataFromCellInRow(oRow, "onsetoffset");
	
	if (sAllPositionPairs != "-")
		{
				
		// build array of position pairs
		var aAllPairs = sAllPositionPairs.split("\|");		
		
		var aNewPairsArray = new Array();
		for (var i=0; i<aAllPairs.length; i++)
			{			
			var onePair = aAllPairs[i].split(",");
			
			var iStartIndex = parseInt(onePair[0]);
			var iEndIndex   = parseInt(onePair[1]);
			
			if (iStartIndex<iEndIndex)
				aNewPairsArray.push( [iStartIndex, iEndIndex] );
			}
		
		// call the highlight function with the whole array of position pairs
		if (aNewPairsArray.length>0)
			sQuote = fn.getHighlight(sQuote, aNewPairsArray, "yellow");
		}
		
	// put the string back into the table
	fx.putDataIntoCell(oRow, "quote", sQuote);
};
