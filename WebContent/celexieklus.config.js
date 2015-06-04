// list of tables that must be hidden or visible (don't use both, it's a matter of what's the most convenient)
oHiddenTablesList = [];
oShowOnlyTables = ["celexieklus"];




$(document).on(
        "focus", 
        "#selection_box", 
        function(event) {
        	
        	$(event.target).autocomplete({ 
        		
        		delay: 500,
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
			
			"size": "70%"
		}
		
};


// globals:
// iStart-iEnd are the indexes of the old lemma part in the analysis
// which has to be replaced by the new lemma selected in 'selectionbox'
var iStart = 0;
var iEnd = 0;


// configuration at column level
oTableConfigurationList = {
		
		celexieklus:{
			
			opmerking: {
				"bgcolor": "#E0F8E0",
				"editable": true
			},	
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
				
				// the user can click on a (faulty) part of the analysis
				// so as to be able to choose another lemma for that part.
				// Choosing happens within a pulldown list in the 'selectionbox' column
				
				"mouseup": function(t, n){
					
					// first make sure highlight is removed from each line
					removeHighlightEveryWhere(t);
					
					
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
						
						// get the selection start and end indexes
						iStart = parseInt(oSelectedText.start);
						iEnd = parseInt(oSelectedText.end);
						
						
						// highlight the chosen word						
						var sAnalysis = fn.getDataFromCellNode(t, n);						
						fn.putDataIntoCell(t, fn.getRowNode(n), 
								"analysis", fn.getHighlight(sAnalysis, [[iStart, iEnd]], "yellow"));
						
						
						// the word is the part preceeding the slash
						sWord = (oSelectedText.text).substring(0, (oSelectedText.text).indexOf("/"));
						
						// take only the first letters of the word, to allow a broader list of choose from
						var iPrefixLength = 2*(sWord.length/3);
						if (iPrefixLength<2) iPrefixLength = 2;
						var sSmallerWordForSearch = sWord.substring(0, iPrefixLength);
						
						
						createSelectionBox(t, n, sSmallerWordForSearch);
						
						
						}
				}
			},
			analysis_ids:{
				//"visible": false
			},
			selectionbox: {
				"visible": false
//				"editable": true,
//				"editfunc": function(t, n, value){
//					
//					// if no part was clicked on in analysis
//					if (iEnd == 0)
//						{
//						fn.message("Illegale handeling", 
//								"Kies eerst het deel van een analyse dat u wilt wijzigen. Dan pas hoort u hier een lemma te kiezen!", 
//								function(){									
//									fn.putDataIntoCell(t, fn.getRowNode(n), "selectionbox", "");
//								}
//							);
//						}
//					else
//						{
//						removeHighlightEveryWhere(t);
//						
//						var sWord = value.split(":")[0];
//						var iLemmaId = value.split(":")[1];
//						
//						// Replace the old lemma part by the newly selected lemma.
//						// The new lemma is 'sWord' (extracted from value) and this has to be put between
//						// the start and end positions of the old lemma (iStart-iEnd)
//						var sAnalysis =  fn.getDataFromCellNamed(t, n, "analysis");
//						
//						
//						var sNewAnalysis = sAnalysis.substring(0, iStart) + sWord + sAnalysis.substring(iEnd);
//						
//						// compute the index of the modified part 
//						// (t.i. part number in array of parts)
//						var str = (sAnalysis.substring(0, iStart));
//						var iIndex = ( str.match(/\+/g) || []).length;
//						
//						// now we'll change the id of the corresponding part
//						// in the array of id's
//						var sAnalysisIds = fn.getDataFromCellNamed(t, n, "analysis_ids");
//						var aIds = sAnalysisIds.split("+");
//						aIds[iIndex] = iLemmaId;
//						var sNewAnalysisIds = aIds.join("+");
//						
//						// reset the globals right away
//						iStart = 0;
//						iEnd = 0;
//						
//						// update the modified analysis (and corresponding id's)
//						// in the database, and refresh the view to show the result
//						
//						fn.updateDatabaseGivenANode(t, n, 
//								["analysis", "analysis_ids"], 
//								[sNewAnalysis, sNewAnalysisIds], 
//								false, function(){
//							
//									fn.refreshTable(t);
//								}
//							);
//						
//						//fn.putDataIntoCell(t, fn.getRowNode(n), "analysis", sNewAnalysis);						
//						//setTimeout( function(){
//						//	fn.putDataIntoCell(t, fn.getRowNode(n), "selectionbox", "");
//						//	}, 100);
//						}
//					
//						
//				}
			}
			
		}

};



function createSelectionBox(t, n, sSmallerWordForSearch ){
	
	var eSelectionBox = $("<div></div>")
		.css("position", "relative")
		.css("top", "20px")
		.css("left", "100px")
		.attr("id", "selection_box");
	var eTextArea = $("<textarea></textarea>")
		.css("width", "200px")
		.css("height", "20px")
		.keydown( function(e){
			
			
			if (e.which == 13)
				{
				
				removeHighlightEveryWhere(t);
				
				// get the selected value
				var value = $(this).val();				
				
				$("#selection_box").remove();
				
				var sWord = value.split(":")[0];
				var iLemmaId = value.split(":")[1];
				
				// Replace the old lemma part by the newly selected lemma.
				// The new lemma is 'sWord' (extracted from value) and this has to be put between
				// the start and end positions of the old lemma (iStart-iEnd)
				var sAnalysis =  fn.getDataFromCellNamed(t, n, "analysis");
				
				
				var sNewAnalysis = sAnalysis.substring(0, iStart) + sWord + sAnalysis.substring(iEnd);
				
				// compute the index of the modified part 
				// (t.i. part number in array of parts)
				var str = (sAnalysis.substring(0, iStart));
				var iIndex = ( str.match(/\+/g) || []).length;
				
				// now we'll change the id of the corresponding part
				// in the array of id's
				var sAnalysisIds = fn.getDataFromCellNamed(t, n, "analysis_ids");
				var aIds = sAnalysisIds.split("+");
				aIds[iIndex] = iLemmaId;
				var sNewAnalysisIds = aIds.join("+");
				
				// reset the globals right away
				iStart = 0;
				iEnd = 0;
				
				// update the modified analysis (and corresponding id's)
				// in the database, and refresh the view to show the result
				
				fn.updateDatabaseGivenANode(t, n, 
						["analysis", "analysis_ids"], 
						[sNewAnalysis, sNewAnalysisIds], 
						false, function(){
					
							fn.refreshTable(t);
						}
					);
				
				
				}
			
		});
	
	eSelectionBox.append(eTextArea);
	
	fn.getCellElement(t, n, "analysis").append(eSelectionBox);
	
	eSelectionBox.find("textarea").click();
	eSelectionBox.find("textarea").focus();
	eSelectionBox.find("textarea").val(sSmallerWordForSearch);
	
	// open autocomplete by triggering key strike
	var e = $.Event('keydown');
	e.which = 35;
	eSelectionBox.find("textarea").trigger(e);
	
}


// make sure we can leave the autocomplete with ESC
$(document).keydown(function(e){
	
	if (e.which == 27)
		{
		removeHighlightEveryWhere("celexieklus");
		
		$("#selection_box").remove();
		}
});


function removeHighlightEveryWhere(t){
	
	(fn.getAllRows(t)).each(function(){
		
		var sAnalysis = fn.getDataFromCellNamed(t, this, "analysis");
		
		if (sAnalysis.indexOf("background")>-1)
			fn.putDataIntoCell(t, fn.getRowNode(this), "analysis", fn.removeHighlight(sAnalysis));
		
	});
	
}
