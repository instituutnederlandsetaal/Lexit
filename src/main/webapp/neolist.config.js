// list of tables that must be hidden or visible (don't use both, it's a matter of what's the most convenient)
oHiddenTablesList = [];
oShowOnlyTables = ["neologismen"];

// table general settings
oTableSettingsList = {
		
		concordanties : {
			
			"callback": function(t){
				
				var oRows = fx.getAllRows(t);
				
				oRows.every(function(){
					
					var oCurrentRow = this;
					
					var sConc = fx.getDataFromCellInRow(oCurrentRow, "concordanties");
					var sWord = fx.getDataFromCellInRow(oCurrentRow, "woord");
					
					// put highlights
					
					var aQuote = sConc.split("^");
					
					for (var i=0; i<aQuote.length; i++)
						{
						var sQuote = aQuote[i];
						
						// We have to highlight the word in the middle of the quote:
						//
						//     bla bla bla bla  <relevant word> bla bla bla  [bron] 
						//
						// But since the quote might contain the same word in the front part,
						// we have to exclude the front part in the 'indexOf' call.
						
						// We do that by getting the true quote length, dividing that by 2
						// so as to get the middle, and subtract the length of the word
						// we have to highlight. This gives a reliable position to start
						// searching the word from.
						// The true quote length can be obtained by getting the index
						// of '[bron]' as this was appended to the quote. 
						
						var iSearchFromPos =	(sQuote.indexOf("[")/2)-sWord.length;
						
						var iStartIndex =		sQuote.toLowerCase().indexOf( sWord.toLowerCase(), iSearchFromPos );
						
						// in some rare cases, the word to be highlight is not located in the middle
						// of the quote, but in the front part (!). In those cases we have to recompute
						// iStartIndex from there
						if (iStartIndex<0)
							iStartIndex = sQuote.toLowerCase().indexOf( sWord.toLowerCase() );
						
						var iEndIndex =			iStartIndex + sWord.length;
						var aNewPairsArray =	new Array();
						
						aNewPairsArray.push([iStartIndex, iEndIndex]);
						
						aQuote[i] = fn.getHighlight(sQuote, aNewPairsArray, "yellow");
						
						}
					
						
					sConc = aQuote.join("^");
					
					// split into separate lines					
					var sConc = sConc.replace("^", "<BR><BR>", "g");
					
					fx.putDataIntoCell(oCurrentRow, "concordanties", sConc);
					
					
				});
			},
			"repeat_callback": true,
			
			"reset_button": false,
			"columns_button": false,
			"viewtype_button": false,
			"refresh_button": false,
			"replace_button": false,
			"selection_button": false,
			"undo_button": false,
			"goto_button": false,
			"help_button": false
		}
		
		
		
};


// configuration at column level
oTableConfigurationList = {

		
		neologismen : {
			
			knop:{
				"button": "Voorbeelden",
				"click": function(t, n){
					
					var sId = fn.getDataFromSiblingNode(n, "id");	
					fn.callDatabase("concordanties", {"id": sId});				
				}
			}
			
		}
};