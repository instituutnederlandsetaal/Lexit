// list of tables that must be hidden or visible (don't use both, it's a matter of what's the most convenient)
oHiddenTablesList = [];
oShowOnlyTables = ["celexieklus"];




$(document).on(
        "focus", 
        ".selectionbox", 
        function(event) {
        	
        	$(event.target).autocomplete({ 
        		
                minLength: 2,
                source: function(request, response){
                	
                	fn.callFunction("api.get_lemmata", ["'"+request.term+"'"], 
                			function(func_resp){  
                		
                		var aSuggestionsArr = 
                			(func_resp["get_lemmata"]).split("|");
                		
                		response($.map(aSuggestionsArr, function (item) {
                            return {
                                label: item.split(":")[0],
                                value: item
                            };
                        }));
                	});
                }
            });            
        }
    );






// table general settings
oTableSettingsList = {
		
		celexieklus:{
			
		}
		
};



var iStart;
var iEnd;
var sWord;
var sSmallerWordForSearch;


// configuration at column level
oTableConfigurationList = {
		
		celexieklus:{
			
			gb: {
				"visible": false
			},
			hidden_id:{
				"visible": false
			},
			unique_id:{
				"visible": false
			},
			celexie_id:{
				"visible": false
			},
			analysis:{
				
				"mouseup": function(t, n){
					
					// do we have a text selection?
					var oSelectedText = fn.getSelectedTextInNode(t, n);
					
					// if selection is empty, that means that we've clicked on a word
					// without selecting it manually.
					// In this case, try to select the word that was clicked upon
					if (oSelectedText.text == '' && oSelectedText.reliable)
						{						
						oSelectedText = fn.getWordClickedUponInNode(t, n);						
						}
					
					// if we have a selection now, process it
					if (oSelectedText.text!='' && oSelectedText.reliable)
						{
						
						// get the current screen selection
						iStart = parseInt(oSelectedText.start);
						iEnd = parseInt(oSelectedText.end);
						sWord = (oSelectedText.text).substring(0, (oSelectedText.text).indexOf("/"));
						sSmallerWordForSearch = sWord.substring(0, 2*(sWord.length/3));
						
						
						// trigger cell click and fill that with a selected word
						var eSelectionBox = fn.getCellElement(t, n, "selectionbox");
						
						eSelectionBox.click();
						eSelectionBox.focus();
						eSelectionBox.find("textarea").val(sSmallerWordForSearch);
						
						// open autocomplete by triggering key strike
						var e = $.Event('keydown');
						e.which = 35;
						eSelectionBox.find("textarea").trigger(e);
						
						
						
						}
				}
			},
			analysis_ids:{
				"visible": false
			},
			selectionbox: {
				"editable": true,
				"editfunc": function(t, n, value){
					
					var sWord = value.split(":")[0];
					var iLemmaId = value.split(":")[1];
					
					var sAnalysis = fn.getDataFromCellNamed(t, n, "analysis");
					var sNewAnalysis = sAnalysis.substring(0, iStart) + sWord + sAnalysis.substring(iEnd);
					
					fn.putDataIntoCell(t, fn.getRowNode(n), "analysis", sNewAnalysis);
					setTimeout( function(){fn.putDataIntoCell(t, fn.getRowNode(n), "selectionbox", "");}, 100); 	
				}
			}
			
		}

};