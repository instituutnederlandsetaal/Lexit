// list of tables that must be hidden or visible (don't use both, it's a matter of what's the most convenient)
oHiddenTablesList = [];
oShowOnlyTables = ["celexieklus", "lemmata_view"];




$(document).on(
        "focus", 
        "#selection_box", 
        function(event) {
        	
        	$(event.target).autocomplete({ 
        		
        		delay: 750,
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


$(document).on(
		"blur",
		"#selection_box",
		function(){
	
			removeHighlightEveryWhere("celexieklus");
			
			$("#selection_box").remove();
			$(".ui-autocomplete").remove();
});


// table general settings
oTableSettingsList = {
		
		celexieklus:{
			
			"callback": function(t){
				
				var aRows = fn.getAllRows(t);
				
				aRows.each(function(){
					
					var nCurrentRecord = this;
					
					var sLemmaId = fn.getDataFromCellNamed(t, nCurrentRecord, "lemma_id");
					if (sLemmaId != '')
						{
						fn.getCellElement(t, nCurrentRecord, "lemma").editable('disable');
						fn.getCellElement(t, nCurrentRecord, "lemma").css("opacity", "0.5");
						}
				});
				
			},
			
			"repeat_callback": true,
			
			"button_0":{
				
				"name": "Is al goed!",
				"click": function(t){
					
					var aRows = fn.getSelectedRowsFrom(t);
					
					aRows.each(function(){
						
						var nCurrentRecord = this;
						
						var sIds = fn.getDataFromCellNamed(t, nCurrentRecord, "analysis_ids");
						
						// split the ids and, when we have a list of alternatives
						// for one single position, keep only the first alternative
						// (as the lemma in the 'analysis' field must correspond
						//  to the first id)
						var aIds = sIds.split(" + ");
						
						for (var i = 0; i < aIds.length; i++)
							{							
							if ( (aIds[i]).indexOf("/") > 0 )
								{
								aIds[i] = (aIds[i]).split("/")[0];   
								}							
							}
						sIds = aIds.join(" + "); 
						
						fn.updateDatabaseGivenANode(t, nCurrentRecord, 
								["analysis_ids"], [sIds], true);
						
					});
				}
			}
			
			
//			"button_0":{
//				"name": "Dupliceer selectie",
//				"click": function(t){
//					
//					var aRows = fn.getSelectedRowsFrom(t);
//					
//					aRows.each(function(){
//						
//						var nCurentNode = this;
//						
//						var iHiddenId = fn.getDataFromCellNamed(t, nCurentNode, "hidden_id");
//						var iCelexieId = fn.getDataFromCellNamed(t, nCurentNode, "celexie_id");
//						var iGb = fn.getDataFromCellNamed(t, nCurentNode, "gb");
//						var sLemma = fn.getDataFromCellNamed(t, nCurentNode, "lemma");
//						var iLemmaId = fn.getDataFromCellNamed(t, nCurentNode, "lemma_id");
//						
//						
//						fn.prompt("Geef een nieuwe analyse", ["Geef analyse"], [""], function(){
//							
//							var sAnalyse = fn.getPromptUserInput("Geef analyse");
//							
//							
//							
//							var aData = {
//									"hidden_id": iHiddenId,
//									"celexie_id": iCelexieId,
//									"gb": iGb,
//									"lemma": sLemma,								
//									"analysis": sAnalyse
//									};
//							
//							if (iLemmaId !='')
//								aData["lemma_id"] = iLemmaId;
//							
//							
//							
//							if (sAnalyse.indexOf("+")>=0 && sAnalyse.indexOf(" + ")<0)
//								{
//								sAnalyse = sAnalyse.replace(/\+/g, " + ");
//								}
//							
//							fn.insertIntoDatabase(t, 
//									aData, null, true);
//						});
//						
//						
//						
//					});
//
//				}
//			},
//			"button_1":{
//				"name": "Verwijder selectie",
//				"click": function(t){
//					
//					fn.confirm("Let op", "Weet u het zeker?", function(){
//						
//						var aNodes = fn.getSelectedRowsFrom(t);
//						
//						aNodes.each(function(){
//							var nCurrentNode = this;
//							
//							var bLastRow = fn.isLastNodeOf(nCurrentNode, aNodes);
//							fn.removeFromDatabaseGivenANode(t, nCurrentNode, bLastRow);	
//							});
//					});
//				}
//			}
		},
		
		
		lemmata_view: {
			"column_order": ["pkid", "is_parent", "parent", "parent_id", 
			                 "modern_lemma", "keurmerk", "sublemma_type", 
			                 "gloss", "lemma_gigpos", "kapstok", "taalvariant", 
			                 "herkomst", "status", "opmerking", "opmerking_extern",
			                 "notitie", "homo", "gedrukt", "online", "verdacht", 
			                 "weg", "taaladvies", "th_lemma", "nuanc_opm", 
			                 "gb_id", "gb_wrdcat", "gb_znwlid", "lidw", "geslacht", 
			                 "toon_paradigma", "trademark", "toon_morfologie", 
			                 "uitspraak", "source", "opmerking_intern", 
			                 "tmp_f_total_rel", "verkleinwoord", "anc", "snc", 
			                 "parent_attention"]
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
			
			lemma: {
				"bgcolor": "#E0F8E0",
				"editable": true,
				"colsort": "asc"    // sort #1
			},
			lemma_id: {
				"click": function(t, n){
					
					var iLemmaId = fn.getDataFromCellNode(t, n);
					if (iLemmaId != '')
						fn.callDatabase("lemmata_view", {"pkid": iLemmaId});
				}
			},
			opmerking: {
				"bgcolor": "#E0F8E0",
				"editable": true
			},	
			bespreken:{
				"editable": true				
			},
			
			gb: {
				"visible": false
			},
			hidden_id:{
				"visible": false,
				"colsort": "asc"   // sort #2
			},
			unique_id:{
				"visible": false
			},
			celexie_id:{
				"visible": false
			},
			original_analysis:{
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
					if (oSelectedText.text!='' && oSelectedText.reliable
							&& oSelectedText.text != '['
							&& oSelectedText.text != '+'
							&& oSelectedText.text != ']'
							&& oSelectedText.text.indexOf("]")<0 )
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

				"mouseup": function(t, n){
					
								
					
					// do we have a text selection?
					var oSelectedText = fn.getSelectedTextInNode(t, n);
					
					// if selection is empty, that means that we've clicked on an id
					// without selecting it manually.
					// In this case, try to select the id that was clicked upon
					if (oSelectedText.text == '' && oSelectedText.reliable)
						{						
						oSelectedText = fn.getWordClickedUponInNode(t, n);						
						}
					
					// if we have a selection now, process it
					if (oSelectedText.text!='' && oSelectedText.reliable)
						{						
						fn.callDatabase("lemmata_view", {"pkid": oSelectedText.text});
						}
				}
			},
			
			back:{
				"button": "Herstel",
				"click": function(t, n){
					
					
					fn.confirm("Zeker weten?", 
							"De oorspronkelijke analyse zal nu worden hersteld. " +
							"Weet u zeker dat u dat wilt?", 
							function(){
						
								var sAnalysisBak = fn.getDataFromSiblingNode(t, n, "analysis_bak");
								var sAnalysisIdsBak = fn.getDataFromSiblingNode(t, n, "analysis_ids_bak");
								
								fn.updateDatabaseGivenANode(t, 
										fn.getRowNode(n), 
										["analysis", "analysis_ids"], 
										[sAnalysisBak, sAnalysisIdsBak], 
										true);
						
					});					
					
				}
			},
			analysis_bak:{
				"visible": false
			},
			analysis_ids_bak:{
				"visible": false
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
			}, 
			"job":{
				"choosefrom": []
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
		.css("width", "400px")
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
				var aIds = sAnalysisIds.split(" + ");
				aIds[iIndex] = iLemmaId;
				var sNewAnalysisIds = aIds.join(" + ");
				
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
		$(".ui-autocomplete").remove();
		}
});


function removeHighlightEveryWhere(t){
	
	(fn.getAllRows(t)).each(function(){
		
		var sAnalysis = fn.getDataFromCellNamed(t, this, "analysis");
		
		if (sAnalysis.indexOf("background")>-1)
			fn.putDataIntoCell(t, fn.getRowNode(this), "analysis", fn.removeHighlight(sAnalysis));
		
	});
	
}
