oHiddenTablesList = [];

oTableSettingsList = {
		
		token_attestations_quickview : {
			"callback": function(confTable){
				
				highlightAllQuotes(confTable);
			},
			"repeat_callback": true
		}
		
};




function highlightAllQuotes(confTable){
	
	fn.showProcessingMsg(confTable); 
	
	// collect all needed token_indexes_id's of all rows into an array
	var aAllRowIds = fn.getDataFromColumn(confTable, "token_indexes_id");	
	
	// call function to get all token positions for the collected token_indexes_id's
	fn.callFunction("get_group_of_token_positions", [ "'"+aAllRowIds.join("|")+"'" ], 
			confTable, null, "positions", null, 
			// when the token positions are returned by the function, highlight the quote in each row
			function(){
				var allRows = fn.getAllRows(confTable);
				allRows.each(function(){
					putHighlightOnOneRow(confTable, this);
				});						
			}
	);
	
	fn.removeProcessingMsg(confTable);
	
};

function putHighlightOnOneRow(confTable, confNode) {
	
	var sQuote = fn.getDataFromCellInRowNode(confTable, confNode, "quote");
	
	sQuote = fn.removeHighlight(sQuote);
	
	// get the position pairs (x,y|x,y|...)
	var sAllPositionPairs = fn.getDataFromCellInRowNode(confTable, confNode, "positions");
	
	// remove the brackets
	sAllPositionPairs = sAllPositionPairs.replace(/(\()(.+)(\))/i ,"$2");
	
	// build array of position pairs
	var aAllPairs = sAllPositionPairs.split("\|");		
	
	var aNewPairsArray = new Array();
	for (var i=0; i<aAllPairs.length; i++)
		{			
		var onePair = aAllPairs[i].split(",");
		//if (onePair.length==1) continue;
		
		var iStartIndex = parseInt(onePair[0]);
		var iEndIndex   = parseInt(onePair[1]);			
		
		aNewPairsArray.push([iStartIndex, iEndIndex]);
		}
	
	// call the highlight function with the whole array of position pairs
	sQuote = fn.getHighlight(sQuote, aNewPairsArray, "yellow");
		
	// put the modified string back into the table
	fn.putDataIntoCell(confTable, confNode, "quote", sQuote);
		
};

// transform a string before sending it to the database
// put single quotes around it, an escade single quotes in it.
function getLegalString(str){
	return "'" + str.replace(/'/g, '\'') + "'";
}

oTableConfigurationList = {
		
		token_attestations : {
			quote: {"editable": true}
		},
		
		token_attestations_quickview : {
			
			pkid: {"visible": true},
			quote: {
				
				"mouseup": function(confTable, confNode){
					
					var oSelectedText = fn.getSelectedTextInNode(confTable, confNode);
					
					if (oSelectedText.text == '' && oSelectedText.reliable)
						{						
						oSelectedText = fn.getWordClickedUponInNode(confTable, confNode);						
						}
					
					if (oSelectedText.text!='' && oSelectedText.reliable)
						{
						var sTokenIndexesId = fn.getDataFromSiblingNode(confTable, confNode, "token_indexes_id");
						var iStart = oSelectedText.start;
						var iEnd = oSelectedText.end;
						
						if ( kf.isPressed("escape") )
							{					
							
							fn.callFunction("delete_token", [sTokenIndexesId, iStart, iEnd],
									null, null, null, null,
									function(){
								
										fn.callFunction("get_token_positions", [sTokenIndexesId], 
												confTable, fn.getRowNode(confNode), "positions", null, 											
											function(){
												putHighlightOnOneRow(confTable, fn.getRowNode(confNode));
											});								
								});							
							
							}
						else
							{
							fn.callFunction("update_tokens", 
									[sTokenIndexesId, iStart, iEnd, getLegalString(oSelectedText.text)], 
									null, null, null, null, 
									function(){
								
									fn.callFunction("get_token_positions", [sTokenIndexesId], 
											confTable, fn.getRowNode(confNode), "positions", null, 											
										function(){
											putHighlightOnOneRow(confTable, fn.getRowNode(confNode));
											
										});
								
								
								});
							}
						
						}					
				}		
			},
			token_indexes_id: {"visible": true},
			positions: {"visible": false},
			wissen : {"visible": false},
			toevoegen : {"visible": false}
			
		}
		
};