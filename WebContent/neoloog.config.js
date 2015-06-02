// list of tables that must be hidden or visible (don't use both, it's a matter of what's the most convenient)
oHiddenTablesList = [];
oShowOnlyTables = ["neologismen_201501"];

// table general settings
oTableSettingsList = {
		
		concordanties_201501:{
			
			"callback": function(t){
				
				var aRows = fn.getAllRows(t);
				
				aRows.each(function(){
					
					var nCurrentRow = this;
					
					var sConc = fn.getDataFromCellNamed(t, nCurrentRow, "concordanties");
					var sWord = fn.getDataFromCellNamed(t, nCurrentRow, "woord");
					
					// put highlights
					
					var aQuote = sConc.split("^");
					
					for (var i=0; i<aQuote.length; i++)
						{
						var sQuote = aQuote[i];
						
						var iStartIndex = sQuote.indexOf(sWord);
						var iEndIndex = iStartIndex + sWord.length;
						var aNewPairsArray = new Array();
						aNewPairsArray.push([iStartIndex, iEndIndex]);
						
						aQuote[i] = fn.getHighlight(sQuote, aNewPairsArray, "yellow");
						
						}
					
						
					sConc = aQuote.join("^");
					
					// split into separate lines					
					var sConc = sConc.replace("^", "<BR><BR>", "g");
					
					fn.putDataIntoCell(t, nCurrentRow, "concordanties", sConc);
					
					
				});
			},
			"repeat_callback": true
		},
		neologismen_201501:{
			
			"column_order": ["id", "woord", "freq", 
			                 "neo", "niet_neo", "twijfel", "fout",
			                 "knop_concordanties", "anw", "werk_definitie"],
			"size": "80%"
		}
};


// configuration at column level
oTableConfigurationList = {
		
		concordanties_201501:{
			id: {
				"visible": false
			},
			woord: {
				"visible": false
			} 
		},
		neologismen_201501:{
			
			id: {
				"visible": false
			},
			anw: {
				"visible": false
			},
			knop_concordanties:{
				"button": "Voorbeelden",
				"click": function(t, n){
					
					var sId = fn.getDataFromCellNamed(t, n, "id");
					fn.callDatabase("concordanties_201501", {"id": sId});
				}
			},
			neo:{
				"bgcolor": "#E0F8E0",
				"editable": true,
				"editcallback": function(t, n, value){
					
					uncheckOtherBoxes(t, n, ["niet_neo", "twijfel", "fout"]);
					}
			},
			niet_neo:{
				"bgcolor": "#A9F5BC",
				"editable": true,
				"editcallback": function(t, n, value){
					
					uncheckOtherBoxes(t, n, ["neo", "twijfel", "fout"]);
					}
			},
			twijfel:{
				"bgcolor": "#E0F8E0",
				"editable": true,
				"editcallback": function(t, n, value){
					
					uncheckOtherBoxes(t, n, ["neo", "niet_neo", "fout"]);
					}
			},
			fout:{
				"bgcolor": "#A9F5BC",
				"editable": true,
				"editcallback": function(t, n, value){
					
					uncheckOtherBoxes(t, n, ["neo", "niet_neo", "twijfel"]);
					}
			},
			werk_definitie: {
				"bgcolor": "#E0F8E0",
				"editable": true
			}
		}

};








// *******************************************
// CHECKBOXES HANDLER
// *******************************************

var bPreventEditCallbackLoop = false;

function uncheckOtherBoxes(oTable, nNode, aBoxesToUncheck){

	// when unchecking the checkboxes automatically (simulating a manual click),
	// we don't want the normal editcallback to be triggerd
	// as this would cause an infinite loop
	//(click -> editcallback -> uncheckboxes -> click -> editcallback -> uncheckboxes -> ... )
	if (bPreventEditCallbackLoop)
		return true;
	
	bPreventEditCallbackLoop = true;	
	
	fn.uncheckCheckboxes(oTable, nNode, aBoxesToUncheck, 
		function(){
		bPreventEditCallbackLoop = false;
		});

}