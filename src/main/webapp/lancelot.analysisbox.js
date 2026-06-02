

// default size of the selection box to be displayed upon click
analysisbox.iBoxWidth = 400; // px
analysisbox.iBoxHeight = 20; // px

// required minimum length of string for triggering autocomplete (1 proved to be OK)
analysisbox.iMinimalStringLengthForAutocomplete = 1;

// buffer when editing multiple lemmata analyses
analysisbox.buffer = null;

analysisbox.fnUponBlur = null;
analysisbox.enterWasStriken = false;


// ------------------------------------------------
// pulldown list with autocomplete function
// ------------------------------------------------

analysisbox.createSelectionBox = function(oCell, sSmallerWordForSearch ){

	// initialize validation detection
	analysisbox.enterWasStriken = false;

	console.log("Analysis box creation");

	// remove previous selection box if it's still there
	if ( $("#selection_box").length ){
		$("#selection_box").remove();
		$("#selection_boxAnalysis").remove();
		$("#selection_boxID").remove();
	}
	
	// which row was clicked?
	var oRow = fx.getRowFromCell(oCell);
	
	
	// build selection box (textarea) with autocomplete
	
	var eHiddenSelectionBoxIdStorage = $("<div></div>")
		.attr("id", "selection_boxID");
	var eHiddenSelectionBoxAnalysisStorage = $("<div></div>")
		.attr("id", "selection_boxAnalysis");
	
	var eSelectionBox = $("<div></div>")
		.css("position", "relative")
		.css("top", "20px")
		.css("left", "100px")
		.attr("id", "selection_box");
	var eTextArea = $("<textarea></textarea>")
		.css("width", analysisbox.iBoxWidth + "px")
		.css("height", analysisbox.iBoxHeight + "px")
		.keydown( function(e){

			// if the input string is very long (for example because of a multiple analysis)
			// make sure the box will resize accordingly

			var x = e.target.scrollWidth;
			var y = e.target.scrollHeight;
			var factor = parseInt( y / analysisbox.iBoxHeight );

			if (factor > 1){
				x =  x*factor;
				y = analysisbox.iBoxHeight;
				$(this).css("width", x + "px").css("height", y + "px");
			}

			// prevent illegal use of pipe
			// (pipe is only allowed to declare ambiguity in a features list, but not to add alternative full analyses [t.i. tags(features)])
			if (e.which == 220 
				&& 
				(	
					(
						$(this).val().lastIndexOf(")") >-1 // some features list is finished
						&&
						( $(this).val().lastIndexOf("(") < $(this).val().lastIndexOf(")") )  // the current features list is finished too!
					) 
					|| 
					(
						!( $(this).val().lastIndexOf(")") < $(this).val().lastIndexOf("(") )  // we're not inside a features list!
						&&
						right($(this).val(), 1) != right($(this).val(), 1).toLowerCase() // case diff: we are dealing with featureless main tags 
					)
				)
				
				){
					e.which = 13;  // this will trigger an Enter
			}
			
			
			// user typed a '+' sign:
			// we're dealing with a multiple lemmata string, consisting of two or more lemmata
			
			if (
				(	e.which == 61 ||    // '+' sign on the '=' key 
					e.which == 107||	// '+' sign on the number block
					e.which == 187		// '=' on sign
				)
				&&
				!( $(this).val().lastIndexOf(")") < $(this).val().lastIndexOf("(") )  // analysis with features must be completed
			)
			{
				// make sure the '+' sign won't be shown
				// since that would prevent the autocomplete from working
				e.preventDefault();
				
				var sTableName =	fx.getTableName(oCell);
				var t =				mt.getDataTableObjectOf(sTableName);				
				
				
				// get the entered value 
				var sAnalysis = 	analysisbox.getRightAnalysisFormat( $(this).val() );
				
				// get the last selected value in autocomplete list
				// (this might be different from the entered value, since one can type something that is unknown to the autocomplete!)
				var sAnalysisCheck =$("#selection_boxAnalysis").val();
				
				// get the ID of the last selected value in autocomplete list
				// // (format: source:corpus_id:lemma_id)
				// (in case one has typed something that is unknown to the autocomplete, this will be empty
				var sAnalysisId =	$("#selection_boxID").val();	



				// validate the analysis

				var sAnalysisCheckResult = tagset.evaluate(sAnalysis);

				// analysis is ill-formed

				if (bTagSetEvaluationInClient && sAnalysisCheckResult != true){
					var sCheckMessage = "This part-of-speech doesn't meet the requirements of the tag set.";
					if (sAnalysisCheckResult != null)
						sCheckMessage += "<BR><BR>Hint: <BR><BR><B>"+sAnalysisCheckResult+"</B>";
					menus.message("Beware!", sCheckMessage, function(){
						return false;
					});

				}

				// analysis looks good

				else {

					// show in the header all the parts entered till now...
					if (sTableName == 'worktable'){

						// There are two specific situations, in which a NEW lemma has to be built:
						//
						// [1] In the 1st phase of autocomlete (t.i. lemma auto-completiong):
						//     When the entered lemma is different from the last selected lemma from the autocomplete
						//     This occurs when a lemma of the autocomplete was editted in the box, or when one entered a completely new lemma
						// [2] In the 2nd phase of autocomlete (t.i. when not lemma matches, so the part-of-speech is auto-completed)
						//     In such case, the autocomplete returns an empty analysis-id

						// BEWARE: it might turn out that the entered value is unknown to the autocomplete (because of wrong case etc.), but is actually an
						// an existing lemma. In that case, the create_lemma function will return the analysis-id of the existing lemma. 
						
						if ( sAnalysisCheck != sAnalysis	// case [1] 
							|| 
							sAnalysisId == '' 				// case [2]
							){
							fn.callFunction( sProjectName+".create_lemma", [sAnalysis], 
									function(resp){
								
										sAnalysisId =  resp["create_lemma"];
										
										worktable.showAnalysisPart( [sAnalysis, sAnalysisId] );
								
									}, 
									function(err){

										// save input to clipboard, for easy edition
										tfn.saveToClipboard(sAnalysis);

										console.log(err);
										sAnalysisCheckResult = (sAnalysisCheckResult != null && sAnalysisCheckResult != true) ? 
											"<BR><BR>Hint: <BR><BR><B>"+sAnalysisCheckResult+"</B>" : "";
										menus.message("Error", "Lemma creation failed. The given part-of-speech might not be allowed."+sAnalysisCheckResultt+
											"<BR><BR><span style='color:red'><B>NOTE</B></span> that the denied input can be restored (CTRL+V) for edition!", 
										function(){
											return false;
										});
									});
						}
						// default
						else {
							worktable.showAnalysisPart( [sAnalysis, sAnalysisId] );
						}
						
					}
					else {
						menus.message("Beware", "Using '+' for building multiple lemmata is not supported in this table. Go to the worktable instead.")
					}
				}	
				
				// ready to enter new lemma part
				// (but if we have some analysis part in the buffer, put that!)
				
				var tempVal = "";
				if (analysisbox.buffer != null && analysisbox.buffer.length>0){
					tempVal = ((analysisbox.buffer).shift()).trim();
				}
				$(this).val(tempVal);
				
			}
			
			// user typed enter:
			// analysis is validated
			
			if (e.which == 13) {
				
				// make buffer empty
				analysisbox.buffer = null;

				// let algorithm know Enter was pressed
				analysisbox.enterWasStriken = true;

				var sTableName =	fx.getTableName(oCell);
				var t =				mt.getDataTableObjectOf(sTableName);
				
				// get the selected value				
				var sAnalysis = 	analysisbox.getRightAnalysisFormat( $(this).val() );
				
				// get the last selected value in autocomplete list
				// (this might be different from the entered value, since one can type something that is unknown to the autocomplete!)
				var sAnalysisCheck =$("#selection_boxAnalysis").val();
				
				// get the ID of the last selected value in autocomplete list
				// // (format: source:corpus_id:lemma_id)
				// (in case one has typed something that is unknown to the autocomplete, this will be empty
				var sAnalysisId =	$("#selection_boxID").val();	// (format: source:corpus_id:lemma_id)

				
				
				// There are two specific situations, in which a NEW lemma has to be built:
				//
				// [1] In the 1st phase of autocomlete (t.i. lemma auto-completion):
				//     When the entered lemma is different from the last selected lemma from the autocomplete
				//     This occurs when a lemma of the autocomplete was editted in the box, or when one entered a completely new lemma
				// [2] In the 2nd phase of autocomlete (t.i. when no lemma matches, so the part-of-speech is auto-completed)
				//     In such case, the autocomplete returns an empty analysis-id

				// BEWARE: it might turn out that the entered value is unknown to the autocomplete (because of wrong case etc.), but is actually an
				// an existing lemma. In that case, the create_lemma function will return the analysis-id of the existing lemma. 
				
				if ( 
					sAnalysisCheck != sAnalysis		// case [1] 
					|| 
					sAnalysisId == '' 				// case [2]
					) {

					// validate the analysis

					var sAnalysisCheckResult = tagset.evaluate(sAnalysis);

					// analysis is ill-formed

					if (bTagSetEvaluationInClient && sAnalysisCheckResult != true){
						var sCheckMessage = "This part-of-speech doesn't meet the requirements of the tag set.";
						if (sAnalysisCheckResult != null)
							sCheckMessage += "<BR><BR>Hint: <BR><BR><B>"+sAnalysisCheckResult+"</B>";
						menus.message("Beware!", sCheckMessage, function(){
								return false;
						});

					}

					// analysis looks good

					else {

						fn.callFunction( sProjectName+".create_lemma", [sAnalysis], 
						function(resp){
					
							sAnalysisId =  resp["create_lemma"];
							$(this).val(""); // empty box, looks confusing otherwise 
							
							analysisbox.processBoxInput(oCell, sSmallerWordForSearch, sAnalysis, sAnalysisId);
					
						}, 
						function(err){

							// save input to clipboard, for easy edition
							tfn.saveToClipboard(sAnalysis);

							console.log(err);
							sAnalysisCheckResult = (sAnalysisCheckResult != null && sAnalysisCheckResult != true) ? 
								"<BR><BR>Hint: <BR><BR><B>"+sAnalysisCheckResult+"</B>" : "";
							menus.message("Error", "Lemma creation failed. The given part-of-speech might not be allowed."+sAnalysisCheckResult+
								"<BR><BR><span style='color:red'><B>NOTE</B></span> that the denied input can be restored (CTRL+V) for edition!", 
							function(){
								return false;
							});
						});
					}
	
				}
				
				// otherwise, process the entered value (known lemma in this case) right away
				else {
					$(this).val(""); // empty box, looks confusing otherwise
					analysisbox.processBoxInput(oCell, sSmallerWordForSearch, sAnalysis, sAnalysisId);
				}
				
			}
			
		});
	
	// append the selection box to the current cell
	eSelectionBox.append(eTextArea);
	var sCellName = fx.getNameOfColumnForThisCell(oCell);
	
	var oCellPos = $(fx.getCellNode(oRow, sCellName)).offset();
	var oTablePos = $("#"+fx.getTableName(oCell)).offset();	
	
	// put the box a bit lower than the cell clicked upon (so it won't be hidding the cell)
	$(document.body).append(eSelectionBox);
	eSelectionBox
		.css("position", "absolute")
		.css("left", (oCellPos.left+ 25)+"px")
		.css("top", (oCellPos.top + 25)+"px");
	

	$("#temporary_stuff").append(eHiddenSelectionBoxIdStorage);
	$("#temporary_stuff").append(eHiddenSelectionBoxAnalysisStorage);
	
	// and make sure it has focus or so
	eSelectionBox.find("textarea").click();
	eSelectionBox.find("textarea").focus();
	eSelectionBox.find("textarea").val(sSmallerWordForSearch);
	
	eSelectionBox.putInFront();
	
	// open autocomplete by triggering key strike
	fn.triggerKeyStrikeOnElement(35, eSelectionBox, "textarea");
	
}




/**
 * Function (only used at startup) for getting a list of allowed parts-of-speech.
 * That will be used by analysisbox.getMatchingAllowedPartOfSpeech()
 */
analysisbox.buildListOfAllowedPartsOfSpeech = function(){

	fn.callFunction( sProjectName+".get_allowed_parts_of_speech", [], function(resp){
		var aAllowedPos = (resp["get_allowed_parts_of_speech"]).split("@@@");

		// build a quick lookup h
		for (var i=0; i<aAllowedPos.length; i++)
		{
			analysisbox.hAllowedPos.put(aAllowedPos[i].toLowerCase(), aAllowedPos[i])
		}
	});

}


/**
 * Make sure that an analysis typed by hand is wellformed
 * that is: space after the comma, and allowed part-of-speech in correct case  
 * 
 * @param {String} lemma and pos, in a comma separated string  
 * @returns a wellforned string
 */
analysisbox.getRightAnalysisFormat = function(sAnalysis){

	// make sure we have only one comma!
	sAnalysis = sAnalysis.replace(/([,]{2,})/gi, ",");

	// make sure we have a space between the comma and the part-of-speech
	// (of course only between lemma and pos, exclude the commas between features!)
	sAnalysis = sAnalysis.replace(/^([^,]+),([a-zA-Z])/, ", $1");

	// make sure the part-of-speech, if it is an allowed one, is written in the right case
	sAnalysis = analysisbox.setRightPartOfSpeech(sAnalysis);

	return sAnalysis;
}



/**
 * Subroutine of analysisbox.getRightAnalysisFormat()
 * 
 * Checks if a part-of-speech exists and get its legal notation
 * (that is, case-irregularities are allowed in input, but is set right by this function)
 * 
 * @param {String} lemma and pos, in a comma separated string
 * @returns a wellforned string  
 */
analysisbox.setRightPartOfSpeech = function(sWordAndPos){

	var sWord = sWordAndPos.substring(0, sWordAndPos.indexOf(", "));
	var sPos = sWordAndPos.substring(sWordAndPos.indexOf(", ") + ", ".length);

	// get main pos, as we want to make sure it is set in the right case
	var iEndOfMainPos = sPos.indexOf("(");
	if (iEndOfMainPos<0) iEndOfMainPos = sPos.length;
	var sMainPos = sPos.substring(0, iEndOfMainPos);
	var sFeatures = sPos.substring(iEndOfMainPos);

	// if the part-of-speech is known to be allowed (lowercase match)
	// get its allowed notation and return the full analysis 
	// in which the part-of-speech is replaced by this allowed notation.
	// So for example, if one makes a case-mistake, the right case will be set.
	// (of course, it the pos was already written correctly, 
	// one will see no difference at all)
	var sCorrectedMainPos = tagset.setMainPosRight(sMainPos);

	return sWord+", "+sCorrectedMainPos + sFeatures;
}




/**
 * Subroutine of analysisbox.createSelectionBox()
 * 
 * This function is called when ENTER has been pressed, so the box input must be processed 
 */
analysisbox.processBoxInput = function(oCell, sSmallerWordForSearch, sAnalysis, sAnalysisId){

	console.log("Analysis box prossessing");
	
	var sTableName =	fx.getTableName(oCell);
	
	// in case of complex/multipart analysis, we end up with a '+' separated string
	var sFullAnalysis = 	analysisbox.sAnalysisPartInHeader + (analysisbox.sAnalysisPartInHeader == "" ? "" : " + ") + sAnalysis;
	var sFullAnalysisIds = 	analysisbox.sAnalysisIDsInHeader + (analysisbox.sAnalysisIDsInHeader == "" ? "" : " + ") + sAnalysisId;
					
	
	// process input when box was activated 
	// in worktable
	//
	// processing is here about ADDING an analysis, which was chosen in the inputbox
	
	if (sTableName == 'worktable') {
		// assign value to analyses in worktable

		var nRowSelectionIds = worktable.getCurrentSelection();
		
		// apply to each selected row

		for (var iNode=0; iNode<nRowSelectionIds.length; iNode++){

			var bLastRow = (iNode == nRowSelectionIds.length-1);
			var iRowId = nRowSelectionIds[iNode];

			fn.callFunction( sProjectName+".add_analysis_id_to_worktable", [iRowId, sFullAnalysisIds], function(){
				
				if (bLastRow){
					// reset!
					analysisbox.sAnalysisPartInHeader = "";
					analysisbox.sAnalysisIDsInHeader = "";	// (format: source:corpus_id:lemma_id)
					
					worktable.showAnalysisPart( [sAnalysis, sAnalysisId], true);
					worktable.reloadButtons();

					// make sure the box is removed for the GUI
					$("#selection_box").blur();

					// remove selection 
					worktable.clearSelection(true);
				}
				
				// refresh record only, to prevent view from changing because of filters/sorting state
				fn.callRecord( fn.getRowNodeWhereIdIs("worktable", iRowId), ["analyses", "analyses_id_arr", "valid"] );				
			});
		}
			
		
		// assign value to analyses in table 'wordforms'
		// (get it from match, and remove SPAN tags from markings)
		
		var sWordform = wordforms.sSelectedWordform;
		fn.callFunction( sProjectName+".add_analysis_string_and_id_to_wordforms", [fn.quote(sInstanceUserName), fn.quote(sWordform)], function(){
			if (fn.tableExists("wordforms")) 
				setTimeout(function(){
					fn.refreshTable("wordforms");
				}, 200); // needed latency
		});
	}
	
	
	// process input when box was activated 
	// in wordforms
	//
	// processing is here about REPLACING an analysis (since it was editted in the inputbox)
	
	else if (sTableName == 'wordforms') {
		// update wordforms
		// and worktable too
							
		var sWordform = fx.getDataFromSiblingCell(oCell, "wordform");
		// beware: we must remove tags from corpus_analyses, as this contains divs because of ellipsis
		var aAnalyses = removeTags(fx.getDataFromSiblingCell(oCell, "corpus_analyses")).split(sAnalysesSeparator);	
		var iAnalysis = aAnalyses.indexOf( sSmallerWordForSearch ) + 1; // postgres indexes are 1-based
		
		if (iAnalysis < 1)
			menus.message("Error", "analysisbox.processBoxInput wasn't able to find the chosen form in the list of analyses. The analyses string might contains unpredicted things.")
		
		
		
		fn.callFunction( sProjectName+".replace_analysis_id_in_wordforms_and_in_worktable", [sWordform, iAnalysis, sFullAnalysisIds], 
				function(){
					// make sure the box is removed for the GUI
					$("#selection_box").blur();
			
					setTimeout(function(){
						fn.refreshTable("wordforms");
					}, 200); // needed latency
					
					console.log("Refresh worktable after replacing some analysis");
					fn.refreshTable("worktable", function(){
						// update the buttons
						worktable.reloadButtons();
					});
				
				}
		);
	}
};



// ------------------------------------------------

/**
 * Autocomplete in selection box
 * 
 * Custom rendering is set here
 */

$.widget( "custom.catcomplete", $.ui.autocomplete, {
	
	_resizeMenu: function() {
		  this.menu.element.outerWidth( "auto" ); // otherwise the menu might be too narrow, when displaying multiple lemmata analyses
	},

	_renderItem: function( ul, item ) {
		
		// The get_lemmata database function, triggered by autocomplete
		// returns lemmata matching the input. 
		
		// In the ORIGINAL version of this piece of code,
		// lexicon lemmata were shown bold, and corpus lemmata were shown in normal case.
		// We disabled that BUT we keep the code allowing to show differences again,
		// as that might be convenient to show other difference between lemmata, like frequency, 
		// or whatever (in the future!!!)
		//
		// the item value ends with  'source:corpus_id:lemma_id', in which source=lexicon|corpus
		if (item.label.indexOf("lexicon:")>=0) {
			return $( "<li>" )
			.append( $( "<div>" )
				.text( item.label.split("###")[0] )
				.css( "font-weight", "bold" )
				.css("border-bottom", "1px solid lightgrey") 
				)		
		    .appendTo( ul );
		}
		else {
			return $( "<li>" )			
			.append( $( "<div>" )
				.text( item.label.split("###")[0] )
				.css( "font-weight", "bold" )
				.css("border-bottom", "1px solid lightgrey") 
				)
		    .appendTo( ul );
		}
	}
});



/**
 * Upon focus event:
 * the autocomplete function must be attached to the selection box
 */

$(document).on(
        "focus", 
        "#selection_box", 
        function(event) {
        	
        	$(event.target).catcomplete({
        		
        		delay: (navigator.userAgent.toLowerCase().indexOf('firefox') > -1 ? 750 : 500),  // 250 is too low for FireFox (gets very slow then!)
                minLength: analysisbox.iMinimalStringLengthForAutocomplete, 
                
                // Solution for dialog disappearing behind table!
                // https://stackoverflow.com/questions/8685558/jqueryui-autocomplete-not-working-with-dialog-and-zindex/8685638
                open: function(event, ui){
                    var box = $("#selection_box");
                    if(box.length > 0){
                        $('.ui-autocomplete.ui-front').css("z-index", parseInt(box.css("z-index"))+1);                        
                    }
                },
                appendTo: function(){
                	return "#selection_box";
                },
                close: function (event, ui){
                    $(this).catcomplete("option", "appendTo", "#selection_box");  
                },
                
                source: function(request, response){
                	
                	fn.callFunction( sProjectName+".get_lemmata_for_autocomplete", [request.term, analysisbox.iMinimalStringLengthForAutocomplete], 
                			function(func_resp){  
                		
                		var aSuggestionsArr = 
                			(func_resp["get_lemmata_for_autocomplete"]).split("@@@");
                		
                		response($.map(aSuggestionsArr, function (item) {
                            return {
                            	label: item,
                                value: item.split("###")[0]
                            };
                        }));
                	});
                },
				focus: function (event, ui) { // triggered when moving to another item in the autocomplete results
                	
                	// https://stackoverflow.com/questions/4815330/jquery-ui-autocomplete-with-item-and-id
                    $("#selection_box").val(ui.item.label.split("###")[0]); // display the selected text
                    $("#selection_boxAnalysis").val(ui.item.label.split("###")[0]); // save selected text
                    $("#selection_boxID").val(ui.item.label.split("###")[1]); // save selected id to hidden input
                },
                select: function (event, ui) { // triggered upon selection (click on item)
                	
                	// https://stackoverflow.com/questions/4815330/jquery-ui-autocomplete-with-item-and-id
                    $("#selection_box").val(ui.item.label.split("###")[0]); // display the selected text
                    $("#selection_boxAnalysis").val(ui.item.label.split("###")[0]); // save selected text
                    $("#selection_boxID").val(ui.item.label.split("###")[1]); // save selected id to hidden input
                }
            });      
        	
        }
    );


/**
 * Upon blur event:
 * remove the selection box,
 * get rid of unfinished analysis in construction,
 * and re-initialize variables
 */

$(document).on(
	"blur",
	"#selection_box",
	function(){

		// if some function was set to be executed at blur, do it
		// (especially needed to restore analysis, when edition was
		// started but eventually aborted...)
		if (analysisbox.fnUponBlur != null){
			analysisbox.fnUponBlur();
		}
		
		setTimeout(function(){
			if ( $("#selection_box").length ){
				$("#selection_box").remove();
				$("#selection_boxID").remove();
				$("#selection_boxAnalysis").remove();
			}
			if ( $("button#analysis_part").length ){
				// remove analysis part, if some
				// complex analysis wasn't finished properly!
				$("button#analysis_part").remove();
				
				// reset global variables!
				analysisbox.sAnalysisPartInHeader = "";
				analysisbox.sAnalysisIDsInHeader = "";	// (format: source:corpus_id:lemma_id)
			}

			// reset
			analysisbox.fnUponBlur = null;

			console.log("Analysis box closed");
			
		}, 500); // sometimes needed
});



/**
 * Make sure we can leave the autocomplete with ESC
 * 
 * (the element will be removed as soon as a new box is called to be built)
 */
$(document).keydown(function(e){
	
	if (e.which == 27){
		$("#selection_box").hide();		
	}
});


// ------------------------------------------------
