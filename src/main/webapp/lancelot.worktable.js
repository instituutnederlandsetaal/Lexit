


// keep search query in memory
worktable.sLastSearchCorpusId, worktable.sLastSearchValue;

// query processor, which can be killed globally if needed
worktable.queryProcessor = null;
worktable.queryRunning = false;
worktable.queryProgressBar = null;
worktable.queryLastCallTime = 0;

// counter used to make http requests unique 
worktable.iQueryNr = 0;

// map from corpus ID to corpus URL
worktable.aCorpusId2CorpusUrl = {};

// map from wordform to corpus frequency (for use in loading progress bar)
worktable.aWordformCorpusFreq = {};


// ------------------------------------------------ 
// Search 
// ------------------------------------------------

/**
 * Start a search, display the results in the worktable
 * 
 * @param {String} id of the corpus to search
 * @param {String} search value, consisting of a context (lemma/wordform) and a search term
 * @param {Function} callback to be applied after the search
 */
worktable.startSearch = function(sCorpusId, sValue, fnFunction){

	// make sure any search opens the table at page 0
	// otherwise we might see nothing, although we DO have results!
	( mt.getDataTableObjectOf("worktable") ).page(0);

	worktable.iQueryNr++;
	console.log("Starting query nr "+worktable.iQueryNr);

	// any active progress indicator must be cleared
	clearInterval(worktable.queryProgressBar);
	
	// remember search
	worktable.sLastSearchCorpusId = sCorpusId, worktable.sLastSearchValue = sValue;
	
	// valid input?
	if (sCorpusId == '' || sCorpusId == null)
		{
		menus.message("Error", "No attestations (see freq)");
		return;
		}
	
	
	if (aSearchIn[sActiveSearchTable] == "corpus")
	{
		worktable.searchInCorpus(sCorpusId, sValue, fnFunction);				
	}
	else if (aSearchIn[sActiveSearchTable] == "lexicon")
	{
		worktable.searchInLexicon(sCorpusId, sValue, fnFunction);
		
	}
}

/**
 * Reload the search results.
 * This is typically needed when the users ask to display more or less context.
 * 
 * @param {Function} callback to be applied after results reloading
 */
worktable.reloadResults = function(fnCallback){

	console.log("Reload worktable");
	worktable.startSearch(worktable.sLastSearchCorpusId, worktable.sLastSearchValue, function(){
		fn.forceExactCount();
		fn.refreshTable("worktable", function(){
			if (fnCallback != null) fnCallback();
		});
	});
}


/**
 * Search subroutine: search in lexicon
 * 
 * @param {String} id of the corpus 
 * @param {String} search value, consisting of a context (lemma/wordform) and a search term
 * @param {Function} callback to be applied after the search
 */
worktable.searchInLexicon = function(sCorpusId, sValue, fnFunction){
	
	fn.showProcessingMsg("worktable");

	fn.callFunction( sProjectName+".truncate_worktable", [fn.quote(sInstanceUserName)], function(){

		setTimeout(function(){
		
			var sSearchField = sValue.split(":")[0]; // not in use in this function
			var sSearchValue = sValue.split(":").slice(1).join(":"); // allows forms to contain ':'
			
			// load the quotes into the worktable
			fn.callFunction( sProjectName+".insert_quote_from_lexicon", [sCorpusId, sSearchValue], 
				function(resp){
					
					var aaAllAnalyses  = tfn.parseFrequentAnalyses( resp["insert_quote_from_lexicon"] );
					
					// show the buttons, allowing the user to assign possible analyses
					worktable.buildButtons( aaAllAnalyses );
					
					// callback, if available
					if (fnFunction != null)
						fnFunction();
				},
				function(){
					// if lexion is not there, do nothing
					fn.refreshTable("worktable");
				}
			);
			
		}, 100);

	});
		
}




/**
 * Search subroutine: search in corpus
 * 
 * @param {String} id of the corpus
 * @param {String} search value, consisting of a context (lemma/wordform) and a search term
 * @param {Function} callback to be applied after the search
 */
worktable.searchInCorpus = function(sCorpusId, sValue, fnFunction){

	fn.showProcessingMsg("worktable");
	
	// the corpus URL is stored in the database
	// get it, given its ID 
	
	var fnSearchInCorpus = function(resp){

		worktable.queryRunning =  true;

		// The search value consists of a declaration of the search value TYPE (t.i. 'lemma'/'wordform')
		// followed by the search value. Both are separated by a ':'
		
		// DEBUG
        //sValue = "word:'ѳ'";
        //sValue = "word:^";
        //sValue = "word:<";
        //sValue = "word:als";
		
		var sSearchField = sValue.split(":")[0];
		var sSearchValue = sValue.split(":").slice(1).join(":"); // allows forms to contain ':'
        
		
		//  corpus frequency (for progress bar)
		var iExpectedNumberOfQuotes = worktable.aWordformCorpusFreq[sSearchValue];		
		
		var aCorpusEngineAndCorpusURL = resp["get_corpus_url"].split(sCorpusInfoSeparator);
		var sCorpusEngine =	aCorpusEngineAndCorpusURL[0];
		var sCorpusURL = 	aCorpusEngineAndCorpusURL[1];
		
		var sServiceUrl, aParams;

		var iNumberOfQuotesRetrieveAtOnce = 600;
		var iMaxDbInsertSize = 200 ; // default at server side is 200 
		
		
		// send query to CobaltServe
		//
		// URL/CobaltServe/webservice/api/corpus_query/?project_name=bab&corpus_id=1&query=word:al&first=1731&number=2000&wordsaroundhit=15&instance_username=testuser
		
		if (sCorpusEngine == 'blacklab') {
			sServiceUrl = uCobaltInstanceUrl + "webservice/api/corpus_query";			
						
			aParams = {
				"query": sValue,
				"project_name": sProjectName,
				"corpus_id": sCorpusId,
				"wordsaroundhit": blacklab.iWordsAroundHit,
				"first": 0,	// this one will be increased gradually by fnCallService()
				"number": iNumberOfQuotesRetrieveAtOnce,
				"instance_username": sInstanceUserName,
				"max_db_insert_size": iMaxDbInsertSize,
				"query_nr": worktable.iQueryNr
				};
		}
		else if (sCorpusEngine == 'whatever') {
			// put more code here to support other engines
		}

		
		
		// function for processing search results
		
		var fnFetchAndProcessResponse = function(){

			// We use a Promise to be able to cancel the process
			// see: https://medium.com/javascript-in-plain-english/canceling-promises-in-javascript-31f4b8524dcd

			// State for managing cleanup and cancelling
			let queryFinished = false;
			let stopRightAway = false;
			let cancel = () => queryFinished = true;			

			
			const promise = new Promise((resolve, reject) => {	

				cancel = () => {					
					// Cancel-path scenario
					console.log('Stopping the previous queryProcessor...');
					stopRightAway =  true;
					clearInterval(worktable.queryProgressBar);										
				};


				var fnCallService = function(iCursor){

					// remember what time the call started
					worktable.queryProgressBarCallNr = new Date().getMilliseconds();

					// show progress before call
					worktable.showProgress(iCursor, iExpectedNumberOfQuotes);					

					// set the cursor etc. for this search

					aParams["first"] = iCursor;		

					fn.callService(sServiceUrl, 
						aParams, 
						"GET", "json", 
						function(resp){

							// the server returns 2 possible values:
							//
							// * a positive value represents the value to assign to 'first' at the next webservice call, so a to insert the next set of quotes
							// * value '-1', tells we're done, because all quotes are inserted now
							var iResponse = parseInt(resp["response"]);

							// if the corpus wasn't declared properly, it won't give a response!
							if ( isNaN(iResponse) || iResponse == null ){								
								menus.message("Error", 
								"We're not getting any response.<BR><BR>Try another search term.<BR><BR>",
								//"Tip: The project might have been declared with the wrong type of part-of-speech tags."
								function(){
									worktable.queryRunning = false;
									// remove indicators
									setTimeout(function(){ fn.removeProcessingMsg("worktable"); }, 500);
									clearInterval(worktable.queryProgressBar);
									fn.refreshTable("worktable");
									reject();
								});
							}


							// the server tells it's done inserting quotes
							else if ( iResponse == -1 ) {						
								
								// if we are into a corpus wordform search, we can update the corpus wordforms with all analyses of the current search
								if (sSearchField == "word")	{
									
									// beware: we can't update the corpus wordform with the analyses sent by BlackLab
									// as those might be overwritten by the restore_worktable_record() trigger
									// (t.i. corrections performed by LM'er might replace incorrect BlackLab analyses
									//  so it would be wrong to put those BlackLab analyses in the wordforms table).
									//
									// So, we have to read the content of the worktable as it is after the
									// restore_worktable_record() trigger has done its job (as a BEFORE INSERT trigger)
									// and use that to update the corpus wordform analyses field.
									
									fn.callFunction( sProjectName+".add_analysis_string_and_id_to_wordforms", [fn.quote(sInstanceUserName), fn.quote(sSearchValue)]);
								}
								
								fn.callFunction( sProjectName+".get_most_frequent_analyses_from_worktable", [fn.quote(sInstanceUserName)], function(resp){
									
									var aaAnalysisFromTable = tfn.parseFrequentAnalyses( resp["get_most_frequent_analyses_from_worktable"] );
									
									// show the buttons, allowing the user to assign possible analyses
									worktable.buildButtons( aaAnalysisFromTable );

									// update wordform status
									// (because this might have to be updated when some wordform is part of a group, 
									//  and the group was edited in the view of another wordform-member of the group)
									fn.callFunction( sProjectName+".set_wordform_status", []);

									// callback, if available
									if (fnFunction != null)
										fnFunction();
								});
								
								console.log("Finished!");
								worktable.queryRunning = false;

								// remove indicators
								setTimeout(function(){ fn.removeProcessingMsg("worktable"); }, 500);
								clearInterval(worktable.queryProgressBar);

								resolve();
							}

							// general case:
							// we need a next call
							else {

								// if busy doing the very first call, update the GUI table to show the first new quotes to the user  
								if (iCursor == 0){
									console.log("Refresh worktable as first rows get in");
									fn.forceExactCount();
									
									fn.refreshTable("worktable", function(){
										console.log("Restore progress bar after table refresh");
										worktable.showProgress(iCursor, iExpectedNumberOfQuotes);
									});
								}
									
								worktable.showProgress(iCursor, iExpectedNumberOfQuotes);

								// set cursor for next query 
								// or cancel if required

								if (stopRightAway) {
									reject();
								}
								else {
									iCursor = iResponse;
									fnCallService(iCursor);									
								}
							}

						}, // end of webservice callback\
						
						null,
						function(err){
							console.log("QueryProcessor error: "+err);
						}
					);

				}; // end of fnCallService() declaration


				// start calling BlackLab
				fnCallService(0);

			})
			.then((resolvedValue) => {
				queryFinished = true;
				return resolvedValue;
			})
			.catch((err) => {
				queryFinished = true;
				return err;
			}); // end of promise

			
			return { promise, cancel };
			
		}; // end of fnProcessResponse() declaration
		
		
		
		// ready to call the BlackLab service now

		try {
			worktable.queryProcessor.cancel();
			console.log("Previous queryProcessor successfully stopped!");
		}
		catch(err) {
			console.log("Can't stop a queryProcessor that wasn't instantiated yet: "+err);
		};
		
		
		// GO!
		
		worktable.queryProcessor = fnFetchAndProcessResponse();
			
	}; // end of fnSearchInCorpus() declaration
	


	// get corpus freq of wordform searched for, and call BlackLab 
	var fnGetCorpusFreqAndStart = function(fnCallback){
		
		var sSearchValue = sValue.split(":").slice(1).join(":"); // allows forms to contain ':'

		if (worktable.aWordformCorpusFreq[sSearchValue] == null){
			fn.callFunction(sProjectName+".get_corpus_freq_of_wordform", [sSearchValue], function(resp){

				// cache
				worktable.aWordformCorpusFreq[sSearchValue] = parseInt( resp["get_corpus_freq_of_wordform"] );
				fnCallback();
				}); 
		}
		else {
				fnCallback();
		}
		
	};


	// HERE IT ALL STARTS!

	// if the corpus URL is not yet in memory, get it and start the search ([1])
	// otherwise get the URL from the cache and start the search right away ([2])	
	
	// [1]

	if (typeof worktable.aCorpusId2CorpusUrl[sCorpusId] == 'undefined'){
		fn.callFunction( sProjectName+".get_corpus_url", [sCorpusId], function(resp){

			// cache
			worktable.aCorpusId2CorpusUrl[sCorpusId] = cloneArray(resp);

			fnGetCorpusFreqAndStart(function(){
				fnSearchInCorpus(resp);
			});			
		});
	}		

	// [2]

	else {
		fnGetCorpusFreqAndStart(function(){
			fnSearchInCorpus(worktable.aCorpusId2CorpusUrl[sCorpusId]);
		});
	}
		
}



/**
 * Show a progress bar in the header of the worktable, during a search operation
 * 
 * @param {Integer} iCursor : search progress cursor
 * @param {Integer} iTotal : expected iterations
 */
worktable.showProgress = function(iCursor, iTotal){
	
	// compute how much is loaded
	var iLoaded = (iCursor/iTotal)*100;
	
	clearInterval(worktable.queryProgressBar);
	if (iLoaded<100){ // prevent progressbar from replacing the table count at end of loading process (which can happen because of interval delay)

		// show progress as a bar
		// (we use an interval to ensure that the progress bar is always shown till the end of the cyclic loading process, 
		//  even during the pause following the table-refresh after the first service search call (1ste cycle).
		//  Of course the table-refresh allows the first quotes to be visible, but it also causes the table to show a 
		//  misleading partial count and causes the progress bar and the spinner to be gone for a short while, which is disburting too)
		worktable.queryProgressBar = setInterval(function(){
			iLoaded = iLoaded + ((new Date().getMilliseconds() - worktable.queryLastCallTime)/1000);		
			$("div[id='worktable_info']").html("<progress value=\""+(iLoaded<0?100:iLoaded)+"\" max=\"100\"></progress>");
		}, 500);

		// make sure spinner is shown
		setTimeout(function(){
			fn.showProcessingMsg("worktable");			
		}, 500);
	}
};





/**
 * Determine if the currently loaded attestations
 * are the ones corresponding to the selected corpus wordform
 * 
 * @param {Node} clicked corpus analysis cell node
 * @returns true/false
 */
worktable.attestationsOfCurrentWorkformsAreLoaded = function( nCorpusAnalysisCell ){

	console.log("Check if quotes of current wordform are already loaded.");

	// if the table is empty, the attestation are obviously not loaded yet
	if (fn.tableIsEmpty("worktable")){
		return false;
	}

	// Is the id of the (previously) selected row  
	// the same as the id of the row of the cell just clicked upon?
	return (fn.getRowNodeId(wordforms.nSelectedWordform)) == (fn.getRowNodeId(fn.getRowNode(nCorpusAnalysisCell)));
}




//------------------------------------------------

// *******************************
// Buttons in the worktable header
// *******************************



/**
 * Build buttons in the worktable header, given a list of analyses labels.
 * This function is typically called straight after a search.
 * 
 * @param {Array} array of analyses to build buttons for: each member of the array is an array itself consisting of [analysis-label, analysis-id]
 */
worktable.buildButtons = function(aaAnalysesButtonLabelsAndValues){
	
	if (sUserRole == sViewerRole) return;
	
	console.log("buttons building starts");

	// We can't display more than a given number of buttons, otherwise the header will be full of it!
	var iMaxNumberOfButtons = 80;
	
	// reset
	analysisbox.sAnalysisPartInHeader = "";		// labels
	analysisbox.sAnalysisIDsInHeader =	"";		// ids	(format: source:corpus_id:lemma_id)
	
	// remove buttons DIV of a previous round
	var sButtonsDivId = "selection_buttons";
	$("#worktable_wrapper .top").find("#"+sButtonsDivId).remove();
	$("#worktable_wrapper").find("#"+sButtonsDivId+"_buttom").remove();
	
	// append a fresh buttons DIV
	$("#worktable_wrapper .top").append(
			$("<div></div>")
			.css("position", "relative")
			.attr("id", sButtonsDivId)
			.css("width", "60%")	
			.css("text-align", "center")			
			.css("color", "black")
			.css("overflow-y", "auto")
			.css("height", "80px")			
			.append(
					$("p").css("text-decoration", "none")
			)
	);
	
	// put validation button in header
	// before any other buttons
	worktable.addAttestationValidationButton(sButtonsDivId);


		
	// append the analyses buttons to the buttons DIV
	
	var aButtonColors = ["green", "blue", "red", "grey", "black"];
	
	var iTotal = aaAnalysesButtonLabelsAndValues.length;
	iTotal = (iTotal > iMaxNumberOfButtons ? iMaxNumberOfButtons : iTotal);
	
	for (var i=0; i<iTotal; i++)
		{
		var sButtonId = sButtonsDivId+"_"+i;
		var iColorIndex = (i % aButtonColors.length);
		
		var sLabel =	aaAnalysesButtonLabelsAndValues[i][0];
		var sIDs = 		aaAnalysesButtonLabelsAndValues[i][1]; // (format: source:corpus_id:lemma_id)
		
		var button = $("<button></button>")
			.attr("id", sButtonId)
			.attr("title", "<span style='color: #FFD700'>[Click]</span> assign analysis<BR><span style='color: #FFD700'>[Delete+Click]</span> remove analysis")
			.addClass("tooltip")	// needed to be recognized as such
			.addClass("analysis")
			.attr("type", "button")
			.text(sLabel)								// label
			.attr("source_corpus_id_lemma_id", sIDs);	// value 
		
		button = worktable.addButtonCss(button, aButtonColors[iColorIndex]);			
		
		button
			.click(function(){
				
				var sAnalysis = 	$(this).text();
				var sAnalysisIds =	$(this).attr("source_corpus_id_lemma_id");
				
				var bSomeRowsAreLocked = false;
				
				var bDelete = (kf.isPressed("delete") || kf.isPressed("backspace"));
				
				
				
				// assign the analysis to all selected rows
				
				if (fx.getNumberOfSelectedRows("worktable") > 0) {
					
					var oRows = fx.getSelectedRowsFrom("worktable");

					var fnCallbackIfFinalRow = function(oRow, oRows){
						
						if (fx.isLastRowOf(oRow, oRows)){

							console.log(bDelete ? "Refresh worktable after deletion of an analysis" : "Refresh worktable after adding an analysis");

							fn.refreshTable("worktable", function(){
								// update the buttons
								worktable.reloadButtons();
							});
							setTimeout(function(){
								fn.refreshTable("wordforms", function(){
									if (bSomeRowsAreLocked){
										setTimeout(function(){
											menus.message("Beware", "Part of the job could not be performed, since some tokens are locked because another user is working on these just now. "+ 
											"Try again in a moment.");
										}, 500);
										
									}
								});

							}, 200); // needed latency
								
						}
					};
					
					oRows.every(function(){
						
						var oRow = this;
						var sWordIndex = fx.getDataFromCellInRow(oRow, "start_pos");

						// check is token is locked
						worktable.checkIfTokenIsFree( fx.getNode(oRow), sWordIndex, 
							function(){

								var sRowId = fx.getRowId(oRow);

								if (bDelete){

									// remove value from analyses in table 'wordforms'

									var sWordform = wordforms.sSelectedWordform;
									
									fn.callFunction( sProjectName+".remove_analysis_from_worktable_and_update_wordforms", [sRowId, sAnalysis, null, sWordform], function(){
										fnCallbackIfFinalRow(oRow, oRows);								
									});	
									
								}
								else {									
									fn.callFunction( sProjectName+".add_analysis_id_to_worktable", [sRowId, sAnalysisIds], function(){
										
										// assign value to analyses in table 'wordforms'
										
										var sWordform = wordforms.sSelectedWordform;
										
										fn.callFunction( sProjectName+".add_analysis_string_and_id_to_wordforms", [fn.quote(sInstanceUserName), fn.quote(sWordform)], function(){								
											fnCallbackIfFinalRow(oRow, oRows);											
										});
									});										
								}
								
							},
							function(){
								bSomeRowsAreLocked = true;
								fnCallbackIfFinalRow(oRow, oRows);											
							}
						);

					});
					
				}
				else {
					menus.message("Beware", "First select rows to assign the analysis to!");
				}
			})
			.hover(function(){
				var iColorIndex = worktable.getButtonNr( this );
				iColorIndex = (iColorIndex % aButtonColors.length);
				$(this).css("background-color", aButtonColors[ iColorIndex ]).css("color", "white");
			})
			.mouseleave(function(){
				$(this).css("background-color", "white").css("color", "black")
			});
		
		$("#worktable_wrapper .top #"+sButtonsDivId)
			.append(button);
		}
	
	// if there are no buttons to be shown, that means that no attestations are validated yet
	if (iTotal == 0)
		{
		var warningButton = $("<button></button>")
		.attr("id", "warning")
		.addClass("analysis")
		.attr("type", "button")
		.text("...No validated attestation yet...")
		
		warningButton = worktable.addButtonCss(warningButton, aButtonColors[0]);
		
		$("#worktable_wrapper .top #"+sButtonsDivId)
			.append(warningButton);		
		}
	
	
	// make sure the header keeps its height (after appending the selection_buttons div)
	$("#worktable_wrapper .top").css("height", "80px");
	
	var iLeftCorrection = .80; // width to take into account (given the fact that we already have content in the header, like buttons etc)
	var sTop = (parseInt($("#worktable_wrapper .top").css("height"))/2 - parseInt($("#"+sButtonsDivId).css("height"))/2) - parseInt($("#"+sButtonsDivId).css("height")) +"px";
	var sLeft = ((parseInt($("#worktable_wrapper").css("width"))*iLeftCorrection)/2 - parseInt($("#"+sButtonsDivId).css("width"))/2)+"px";
	
	
	// add buttons to the header
	$("#"+sButtonsDivId).css("top", sTop).css("left", sLeft);	
	
};



/**
 * Reload the buttons.
 * This might be needed if some new analyses have been added to the worktable since the last table draw.
 * 
 * @param {Function} callback to be applied after button reloading.
 */ 
worktable.reloadButtons = function(fnFunction){
	
	console.log("Reload buttons");
	
	setTimeout(function(){
		
		fn.callFunction( sProjectName+".get_most_frequent_analyses_from_worktable", [fn.quote(sInstanceUserName)], function(resp){
			
			var aaAnalysisFromTable = tfn.parseFrequentAnalyses( resp["get_most_frequent_analyses_from_worktable"] );
			
			// show the buttons, allowing the user to assign possible analyses
			worktable.buildButtons( aaAnalysisFromTable );
			
			// callback, if available
			if (fnFunction != null)
				fnFunction();
			
		});
		
	}, 100); // small delay generally needed to allow database to process & retrieve updated data
	
	
}




// ------------------------------------------------------------------------------------------------
//
// Analysis under construction
//
// ------------------------------------------------------------------------------------------------

/**
 * Show an analysis under construction as a button,
 * t.i. show an NEW analysis in a NEW button label, when the selection box is active.
 * 
 * When called with [bFinished = false], the button label will show '...' at the end of the analysis string,
 * showing that the analysis is under construction/pending...
 * 
 * @param {Array} array with two members: analysis labels and analysis IDs 
 * @param {Boolean} bFinished : tell if the analysis is under construction JUST NOW (false) or the analysis is finished (true)
 */
worktable.showAnalysisPart = function( aAnalysisLabelsAndValues, bFinished){
	
	var sAnalysis =		aAnalysisLabelsAndValues[0];	// labels
	var sAnalysisIds =	aAnalysisLabelsAndValues[1];	// ids (format: source:corpus_id:lemma_id)

	if (bFinished == null)
		bFinished = false;
	
	var sButtonsDivId = "selection_buttons";
	var sButtonId = "analysis_part";	
	
	
	// clean
	worktable.removeAnalysisPart();
	
	// global!
	analysisbox.sAnalysisPartInHeader +=	(analysisbox.sAnalysisPartInHeader == "" ? "" : " + ") + 	sAnalysis;		// labels
	analysisbox.sAnalysisIDsInHeader +=		(analysisbox.sAnalysisIDsInHeader == "" ? "" : " + ") +		sAnalysisIds;	// ids 

	// build and add button
	var sAnalysisPartButton = $("<button></button>")
	.attr("id", sButtonId)
	.addClass("analysis")
	.attr("type", "button")
	.text(analysisbox.sAnalysisPartInHeader + (bFinished ? "":" + ...") )	// labels
	.attr("source_corpus_id_lemma_id", analysisbox.sAnalysisIDsInHeader);	// ids	(format: source:corpus_id:lemma_id)
	
	sAnalysisPartButton = worktable.addButtonCss( sAnalysisPartButton, "orange" );
	
	$("#worktable_wrapper .top #"+sButtonsDivId)
		.append(sAnalysisPartButton);

}



/**
 * Remove the temporary analysis part DIV of a previous round
 * (which is only necessary to show that a complex analysis is in construction)
 */
worktable.removeAnalysisPart = function(){	
	
	var sButtonId = "analysis_part"; 
	
	if ( $("#"+sButtonId).length )
		$("#"+sButtonId).remove();

}


//------------------------------------------------------------------------------------------------



/**
 * Give buttons a nice look
 * add css for shadows, color etc.
 * 
 * @param {Node} button : element 
 * @param {String} sColor : color to apply
 */
worktable.addButtonCss = function(button, sColor){
	
	return button
	.css("padding", "5px 10px")
	.css("margin", "3px")
	.css("text-align", "center")
	.css("text-decoration", "none")
	.css("display", "inline-block")
	.css("font-size", "12px")
	.css("border-radius", "10px")
	.css("box-shadow", "0 8px 10px 0 rgba(0,0,0,0.2), 0 6px 10px 0 rgba(0,0,0,0.19)")
	.css("background-color", "white")
	.css("color", "black")
	.css("border", "2px solid "+sColor)
	.css("transition-duration", "0.4s");
}




/**
 * Get the index of some analysis button in the header.
 * This index will be used e.g. for choosing a background color
 * in an array of pre-defined background colors
 
 * @param {Node} the button element 
 */
worktable.getButtonNr = function(nButton){
	
	var sThisButtonId = String( $(nButton).attr("id") );
	var sThisButtonNr = sThisButtonId.substring( sThisButtonId.lastIndexOf("_")+1 );
	var iButtonNumber = parseInt(sThisButtonNr);
	
	return iButtonNumber; 
}




// ------------------------------------------------

// *****************************
// attestation validation button
// *****************************

/**
 * Add a button to the worktable head, allowing validation of all rows at once
 * 
 * @param {String} sButtonsDivId : a DIV id to append the button to
 */
worktable.addAttestationValidationButton = function(sButtonsDivId){

	var sValidationButtonColor = "green";
	var sValidationButtonBgColor = sCobaltGreen;
	
	// remove previous button (in case of table refresh)
	$("#worktable_wrapper .top #"+sButtonsDivId+" #wt_validation_button").remove();
	
	// build button
	var validateButton = $("<button/>")
		.attr("id", "wt_validation_button")
		.attr("type", "button");

	validateButton
		.css("padding", "5px 10px")
		.css("margin", "3px")
		.css("text-align", "center")
		.css("text-decoration", "none")
		.css("display", "inline-block")
		.css("font-size", "12px")
		.css("border-radius", "10px")
		.css("box-shadow", "0 8px 10px 0 rgba(0,0,0,0.2), 0 6px 10px 0 rgba(0,0,0,0.19)")
		.css("background-color", sValidationButtonBgColor)
		.css("color", "black")
		.css("border", "2px solid "+sValidationButtonColor)
		.css("transition-duration", "0.4s")
		.css("width", "100px");

	validateButton
		.hover(function(){
			$(this).css("background-color", sValidationButtonColor).css("color", "white");
		})
		.mouseleave(function(){
			$(this).css("background-color", sValidationButtonBgColor).css("color", "black")
		});

	validateButton
		.attr("title", "Validate all visible rows").addClass("tooltip")
		.append(
				$("<span></span>")
				.addClass("ui-icon ui-icon-circle-check")
				.css("font-size:", "2em !important")
		)
		.click(function(){

			var oSelection = fx.getAllRows("worktable");

			fn.showProcessingMsg("worktable");
			menus.message("Busy...", "Checking "+ oSelection.count() +" rows for locking...");
			

			// first check if validating everything is allowed
			// (t.i. count number of locked rows)

			setTimeout(function(){

				var iNrOfLockedRecords = 0;
				oSelection.every(function(){

					var oRow = this;
					var sWordIndex = fx.getDataFromCellInRow(oRow, "start_pos");

					worktable.checkIfTokenIsFree( fx.getNode(oRow), sWordIndex, 
						function(){
							if (fx.isLastRowOf(oRow, oSelection)){
								fn.closeDialog();
								menus.message("Busy...", "Validating all rows...");
								setTimeout(function(){}, 50); // allow message to be shown
							}
						}, 
						function(){
							iNrOfLockedRecords++;
							return false; // stop right away
						}
					);

				});
				
				if (iNrOfLockedRecords == 0){	

					oSelection.every(function(){

						var oThisRow = this;
						fx.updateDatabaseGivenACellOrRow(oThisRow, {"valid": true}, function(){							
							
							if (fx.isLastRowOf(oThisRow, oSelection)){

								fn.closeDialog();

								console.log("Refresh worktable after clicking validation button")
								// update the buttons
								worktable.reloadButtons();

								setTimeout(function(){

									fn.callFunction(sProjectName+".set_wordform_status", [], function(){

										// show in wordforms, that the status was updated
										setTimeout(function(){
											fn.refreshTable("wordforms", function(){
												fn.refreshTable("worktable"); // triggered as final refresh, to make sure that all validations are shown (needed latency) 
											});									
										}, 200); // needed latency

									});

								}, 200);
								
								
								
									
							}
						});
					});

				} 
				else {
					fn.closeDialog();
					menus.message("Beware", "Some records are locked. Mass-validation is not allowed.", function(){
						fn.refreshTable("worktable");
					});
				}


			}, 100);

		});
	
	$("#worktable_wrapper .top #"+sButtonsDivId).append(validateButton);
	
}


//------------------------------------------------



/**
 * Get the context (left, match, or right) of the table cells clicked upon
 * 
 * @param {Node} n : clicked cell
 * @returns 'left', 'match' or 'right'
 */
worktable.getContextOfCell = function(n){
	
	var sColumnName = fn.getNameOfColumnForThisNode(n);
	var iIndexOfUnderscore = sColumnName.indexOf("_");
	
	// goal is: identify context to be able to re-use it: if the user clicked on 'LEFT_context', onsets/offsets will be saved in column 'LEFT_onsetoffset'
	var sPrefix = (iIndexOfUnderscore > 0 ? sColumnName.substring(0, iIndexOfUnderscore) : sColumnName);
	
	return sPrefix;
}




/**
 * Check for locking
 * 
 * Send the doc pid of a row, and a (list of) corpus word number(s) to the database,
 * so as to check if the corresponding tokens are already loaded or not in someone else's interface.
 * If that is the case, the tokens must be locked so the function will fire the fnCallbackIfLocked() callback;
 * otherwise the fnCallbackIfFree() callback. 
 * 
 * @param {Node} row node to check for locking 
 * @param {Array|String} mCorpusWordNumbers (one word number, of more in an array)
 * @param {Function} function to call if node is free 
 * @param {Function} function to call if node is locked 
 */
worktable.checkIfTokenIsFree = function(nWordtableRow, mCorpusWordNumbers, fnCallbackIfFree, fnCallbackIfLocked){

	nWordtableRow = fn.getRowNode(nWordtableRow);

	// which doc pid are we talking about?
	var sDocPidAndGroupId = fn.getDataFromCellInRowNode(nWordtableRow, "doc_pid");	

	// deal with BlackLab word numbers:
	var sCorpusWordNumbers = mCorpusWordNumbers;

	// if no word number was specified, read out the value in the worktable row 
	if (mCorpusWordNumbers == null)
		sCorpusWordNumbers = fn.getDataFromCellInRowNode(nWordtableRow, "corpus_word_nrs");

	// if an array of word numbers was given, join the values into a string 
	if (mCorpusWordNumbers != null && typeof mCorpusWordNumbers === 'object')
		sCorpusWordNumbers = mCorpusWordNumbers.join("|");
	
	// now ask the database if the token is in use by any other user
	fn.callFunction(sProjectName+".check_if_token_is_locked", [sDocPidAndGroupId, sCorpusWordNumbers], function(resp){

		var answer = resp["check_if_token_is_locked"];

		// call the right callback, given the result
		if (answer == false || answer == 'f' || answer == 'false'){
			console.log(fnCallbackIfFree);
			fnCallbackIfFree();
		}
		else {
			console.log(fnCallbackIfLocked);
			fnCallbackIfLocked();
		}
	});
};





/**
 * Process an array of tokens to be (de)attested as those were clicked upon in the worktable
 * in such a way that the array is saved properly in the database etc.
 * 
 * @param {Node} n : clicked context part (left_context, match, right_context)
 * @param {Array} aWordOnsetsOffset : array of comma separated onsets/offsets (of the attested tokens)
 */
worktable.processAttestations = function(n, aWordOnsetsOffset){	

	var fnDoProcessing = function(n, aWordOnsetsOffset){

		
		var sColumnName = fn.getNameOfColumnForThisNode(n);

		// get prefix: if the user clicked on 'left_context', onsets/offsets will be saved in column 'left_onsetoffset'
		var sPrefix = worktable.getContextOfCell(n);
		
		// get connected columns
		var sOnsetOffsetColumn = 	sPrefix + "_onsetoffset";
		var sAnnotationTypeColumn =	sPrefix + "_annotation_type";	
		
		
		// get the registered annotations onsets and offsets (this is the data we will be adding a word to, or removing a word from)
		
		// put the token indexes string into an array

		var oCell = fx.getCell(n);

		var sTokenOnsetsOffsets = 	fx.getDataFromSiblingCell(oCell, sOnsetOffsetColumn);
		var sTokenAnnotationTypes =	fx.getDataFromSiblingCell(oCell, sAnnotationTypeColumn);				
		var aTokenOnsetsOffsets = 	(sTokenOnsetsOffsets != '' && sTokenOnsetsOffsets != 'none') ?
									sTokenOnsetsOffsets.split(sOnsetOffsetSeparator) : new Array();
		var aTokenAnnotationTypes =	(sTokenAnnotationTypes != '' && sTokenAnnotationTypes != 'none') ?
									sTokenAnnotationTypes.split(sAnnotationsSeparator) : new Array();
		
		var sDocId = 				fx.getDataFromSiblingCell(oCell, "doc_pid");
		var sWordIndexes =			fx.getDataFromSiblingCell(oCell, "corpus_word_nrs");
		var aWordIndexes =			sWordIndexes == '' ? new Array() : sWordIndexes.split(sWordIndexesSeparator);
		var sWordAnnotations = 		fx.getDataFromSiblingCell(oCell, "corpus_word_pos");
		var aWordAnnotations =		sWordAnnotations == '' ? new Array() : sWordAnnotations.split(sAnnotationsSeparator);
		var sMatchStart =			fx.getDataFromSiblingCell(oCell, "start_pos");
		
		
		// first decide if we should attest or de-attest
		
		// if at least one of the tokens of the array is not attested yet, we will attest all tokens
		// (if such an absent token can't be found, the selection must be about de-attesting!)
		
		var bAttest = false;	
		for (var p=0; p<aWordOnsetsOffset.length; p++) {
			var sThisPair = aWordOnsetsOffset[p];
			
			var iIndexOfThisPair = $.inArray(sThisPair, aTokenOnsetsOffsets);
			if (iIndexOfThisPair<0) {
				bAttest = true;
				break;
			}
		}
		
		
		// loop through all words to (de)attest 
		
		for (var p=0; p<aWordOnsetsOffset.length; p++){

			var sThisPair = aWordOnsetsOffset[p];
			var iStart =	parseInt( sThisPair.split(",")[0] );
			var iEnd = 		parseInt( sThisPair.split(",")[1] );		
			
			
			// is this selection already part of the registered onsets and offsets?
			
			// De-attest
			//
			if ( !bAttest )
				{			
				var iIndexOfThisPair = $.inArray(sThisPair, aTokenOnsetsOffsets);			
				if (iIndexOfThisPair>-1)
					{
					aTokenOnsetsOffsets.splice(iIndexOfThisPair, 1);		
					aTokenAnnotationTypes.splice(iIndexOfThisPair, 1);
					
					// take care of blacklab word index too
					if (aSearchIn[sActiveSearchTable] == 'corpus')
						{
						var sWordIndexOfThisPair = (blacklab.getWordIndexOf(sDocId, sColumnName, sMatchStart, iStart)).toString();
						
						// If some annotation begins or ends within a word instead of on its borders, we won't find
						// any corresponding blacklab word index, because those are about whole words.						
						if (sWordIndexOfThisPair != null)
							{
							// blacklab word index
							var iIndexOfWordIndex = $.inArray(sWordIndexOfThisPair, aWordIndexes);
							
							aWordIndexes.splice(iIndexOfWordIndex, 1);
							aWordAnnotations.splice(iIndexOfWordIndex, 1);
							}
						
						}
					}
									
				}
			
			// otherwise add the selected token(s)
			else {
				// remove the tokens that are within the selection (=overlap)
				// and add the selection as a whole after that
				
				var bAddSelection = true;
				for (var i=aTokenOnsetsOffsets.length-1; i>=0; i--){						
					var sOnePair = aTokenOnsetsOffsets[i];
					var iOneStart = parseInt(sOnePair.split(",")[0]);
					var iOneEnd = parseInt(sOnePair.split(",")[1]);
					var sOneType = aTokenAnnotationTypes[i];
					
					// if token is within the selection, remove it
					if (iStart<=iOneStart && iOneEnd<=iEnd 
							&&
							// of course, a different type is another, distinct selection,
							// so we deal only with identical types here!
							worktable.sCurrentAnnotationType == sOneType) 
						{
						aTokenOnsetsOffsets.splice(i, 1);
						aTokenAnnotationTypes.splice(i, 1);
						
						// same for blacklab word index
						if (aSearchIn[sActiveSearchTable] == 'corpus')
							{
							var sWordIndexOfThisPair = (blacklab.getWordIndexOf(sDocId, sColumnName, sMatchStart, iOneStart)).toString();
							
							// If some annotation begins or ends within a word instead of on its borders, we won't find
							// any corresponding blacklab word index, because those are about whole words.
							if (sWordIndexOfThisPair != null)
								{
								var iIndexOfWordIndex = $.inArray(sWordIndexOfThisPair, aWordIndexes);

								aWordIndexes.splice(iIndexOfWordIndex, 1);
								aWordAnnotations.splice(iIndexOfWordIndex, 1);
								}
							
							}						
						
						}
					// if selection is within/overlapping an existing token, do nothing
					else if ( (( iOneStart<=iStart && iStart<=iOneEnd ) ||
							( iOneStart<=iEnd   && iEnd<=iOneEnd   ))
							&&
							worktable.sCurrentAnnotationType == sOneType)	{
						bAddSelection = false;
					}
						
				}
				
				// add the selection
				if (bAddSelection)	{
					// onset offset
					aTokenOnsetsOffsets.push(sThisPair);						
					aTokenAnnotationTypes.push(worktable.sCurrentAnnotationType);
					
					// blacklab word index
					if (aSearchIn[sActiveSearchTable] == 'corpus'){
						var sWordIndexOfThisPair = (blacklab.getWordIndexOf(sDocId, sColumnName, sMatchStart, iStart)).toString(); 
						
						// If some annotation begins or ends within a word instead of on its borders, we won't find
						// any corresponding blacklab word index, because those are about whole words.
						if (sWordIndexOfThisPair != null){
							aWordIndexes.push(sWordIndexOfThisPair);
							aWordAnnotations.push(worktable.sCurrentAnnotationType);
						}												
					}				
				}

			} // end of add-token 
			
			
		} // end of loop

		
		var t = fn.getTableName(n);
		fn.showProcessingMsg(t);
		
		
		// update the database and the screen table
		
		// rebuild the token indexes string from the current array
		sTokenOnsetsOffsets = aTokenOnsetsOffsets.join(sOnsetOffsetSeparator);
		if (sTokenOnsetsOffsets == '') 
			sTokenOnsetsOffsets = "none";
		sAnnotationTypes = aTokenAnnotationTypes.join(sOnsetOffsetSeparator);
		if (sAnnotationTypes == '') 
			sAnnotationTypes = "none";
		
		var oCellsToUpdate = {};
		// this part adapts itself to the right context (left/match/right)
		oCellsToUpdate[sOnsetOffsetColumn] =	sTokenOnsetsOffsets;
		oCellsToUpdate[sAnnotationTypeColumn] =	sAnnotationTypes;
		
		
		// data that has to be kept to integration in original source (lexicon/corpus)
		
		// current state in terms of Blacklab
		oCellsToUpdate["corpus_word_nrs"] = 	aWordIndexes.join(sWordIndexesSeparator);
		oCellsToUpdate["corpus_word_pos"] = 	aWordAnnotations.join(sAnnotationsSeparator);
		
		// current state in term of lexicon
		var aLexiconState = worktable.getFullLexiconState(n, sOnsetOffsetColumn, sTokenOnsetsOffsets, sAnnotationTypes);
		oCellsToUpdate["lexicon_word_indexes"] = 	aLexiconState[0];
		oCellsToUpdate["lexicon_word_pos"] = 		aLexiconState[1];
					
		
		// put onsets, blacklab word indexes and annotations in the table
		fx.updateDatabaseGivenACellOrRow(
			oCell, 
			oCellsToUpdate, 
			function(){
				fn.showProcessingMsg(t);
				
				// update the record (faster that whole table)
				var oRow = fx.getRowFromCell(oCell);
				fx.callRecord(oRow, [sColumnName, sOnsetOffsetColumn, sAnnotationTypeColumn, "corpus_word_nrs", "corpus_word_pos"], function(){
					
					highlight.putHighlightOnOneRow(oRow, sColumnName, sOnsetOffsetColumn, sAnnotationTypeColumn);
					fn.removeProcessingMsg(t);		
					
					var nRow = fx.getNode(oRow);
					worktable.addMoreContextIcon(nRow);

					// needed to show updated status (that might have changed when attestations were added or removed)
					setTimeout(function(){
						fn.refreshTable("wordforms");
					}, 200); // needed latency
					
				});
				
			}
		);

	};	


	// compare the selection size to the full context size
	// if the selection is large, issue a warning 

	var aWords = (fn.getDataFromCellNode(n)).split(" ");

	if (aWordOnsetsOffset.length > 5 && (aWordOnsetsOffset.length / aWords.length) > .5){
		menus.confirm("Beware", "The selection is quite large. We're not sure whether that's on purpose or not.<BR><BR>Do you want to carry on?",
			function(){
				fnDoProcessing(n, aWordOnsetsOffset);
			},
			function(){
				setTimeout(function(){
					fn.closeDialog();
				}, 1000);
				fn.refreshTable("worktable");
				menus.message("OK", "Selection canceled");
				
			})
	}
	else {
		fnDoProcessing(n, aWordOnsetsOffset);
	}
	
};



/**
 * Put a 'i'-icon linking to 'More Context' in the match cell
 * 
 * @param {Node} The cell node into which the icon must be put
 */
worktable.addMoreContextIcon = function(nRow){

	// read background color of row: this must be assigned to icon to allow it to merge with backgroubd
	var sBackgroundColor = $(nRow).css("background-color");

	// add some click symbol to the matcher, allowing access to 'More context'
	var nCell = fn.getCellInRowNode(nRow, "match");
	// of course only if it isn't there yet
	if ($(nCell).find("button.more_context_icon").length ==0)
		$(nCell).append(
			$("<button></button>")
			.addClass("more_context_icon")
			.addClass("ui-icon")
			.addClass("ui-icon-info")
			.css("background-color", sBackgroundColor)
			);
};




//------------------------------------------------

// ***************************************************************
// compute data so it can be easily integrated into Hilex later on
// ***************************************************************

/**
 * Compute the onsets/offsets of the full quote [t.i. of the 3 context concatenated back to one single string],
 * given the 3 contexts of the cobalt worktable (left, match, right).
 * 
 * This is needed because each context's character positions start at 0 on its left border,
 * whereas this is of course not the case when the 3 contexts are recombined to one single quote.
 * 
 * N.B.: the goal is to be able to process the data into our lexicon (eg. Hilex) afterwards, which is why
 *     the full quotes onsets/offsets need to be computed, as this is the lexicon way of storing things.
 * 
 * @param {Node} n : clicked context cell (left_context, match, right_context)
 * @param {String} sOnsetOffsetColumn : name of the 'onsetoffset' column of the context part (left, match, right) being processed
 * @param {String} sTokenOnsetsOffsets : onsets/offsets of the attested tokens 
 * @param {String} sAnnotationTypes : annotations types of the attested tokens 
 * @returns [ array of onsets/offsets + array of annotations ]
 */
worktable.getFullLexiconState = function(n, sOnsetOffsetColumn, sTokenOnsetsOffsets, sAnnotationTypes){
	
	var aAllTokenOnsetsOffsets = new Array();
	var aAllAnnotationTypes = new Array();
	
	var iLengthOfLeftContext = ( removeTags(fn.getDataFromSiblingNode(n, "left_context")) ).length + 1;
	var iLengthOfMatch = ( removeTags(fn.getDataFromSiblingNode(n, "match")) ).length + 1;
	
	var aContexts = ["left", "match", "right"];
	for (var i=0; i<aContexts.length; i++)
		{
		var sThisContext = aContexts[i];
		var sThisOnsetOffsetColumn = 	sThisContext + "_onsetoffset";
		var sThisAnnotationTypeColumn =	sThisContext + "_annotation_type";
		
		var aTheseOnsetOffsets, aTheseAnnotations;
		var aCorrectedOnsetOffsets = new Array(), aCorrectedAnnotations = new Array();
		
		// extract the right context data
		if (sOnsetOffsetColumn != sThisOnsetOffsetColumn)
			{
			aTheseOnsetOffsets = (fn.getDataFromSiblingNode(n, sThisOnsetOffsetColumn)).split(sOnsetOffsetSeparator);
			aTheseAnnotations = (fn.getDataFromSiblingNode(n, sThisAnnotationTypeColumn)).split(sAnnotationsSeparator);
			}
		else
			{
			aTheseOnsetOffsets = sTokenOnsetsOffsets.split(sOnsetOffsetSeparator);
			aTheseAnnotations = sAnnotationTypes.split(sAnnotationsSeparator);
			}
		
		// recompute the indexes in reunified unique context
		for (var j=0; j<aTheseOnsetOffsets.length; j++)
			{
			var aPairOfOnsetOffset = (aTheseOnsetOffsets[j]).split(",");
			
			if (aPairOfOnsetOffset.length == 2)
				{
				var iOnset =	parseInt(aPairOfOnsetOffset[0]);
				var iOffset = 	parseInt(aPairOfOnsetOffset[1]);
				
				if (sThisContext == 'match')
					{
					iOnset += iLengthOfLeftContext;
					iOffset += iLengthOfLeftContext;
					}
				else if (sThisContext == 'right')
					{
					iOnset += iLengthOfLeftContext + iLengthOfMatch;
					iOffset += iLengthOfLeftContext + iLengthOfMatch;
					} 
				
				aCorrectedOnsetOffsets.push( [iOnset, iOffset].join(",") );
				aCorrectedAnnotations.push( aTheseAnnotations[j] );
				}
			}
		
		
		aAllTokenOnsetsOffsets = 	[].concat(aAllTokenOnsetsOffsets, aCorrectedOnsetOffsets);
		aAllAnnotationTypes = 		[].concat(aAllAnnotationTypes, aCorrectedAnnotations);
		}
	
	return [ aAllTokenOnsetsOffsets.join("|"), aAllAnnotationTypes.join("|") ];
}




//------------------------------------------------


/**
 * Compute the word index corresponding of some quote string position.
 * This works whenever the specified position is inside of a word or on its border (eg. its onset).
 * 
 * BEWARE: the word index here is NOT THE SAME as the word number in terms of BlackLab
 * because the word index in this particular function is the index of a word in
 * a word array (and not the index of a word in a BlackLab document)
 * 
 * If needed, use blacklab.getWordIndexAtPosition() instead!
 * 
 * @param {String} sDocPid : doc pid of quote
 * @param {String} sContext : context at stake (left, match, right)
 * @param {Integer} iQuotePosition : onset of the word/token
 * @returns a word index (0-based)
 */
worktable.getWordIndexAtPosition = function(sDocPid, sPrefix, iQuotePosition){	

	var n = fn.getRowNodeWhere("worktable", {"doc_pid": sDocPid});

	var sContextColumn = sPrefix + (sPrefix!='match' ? "_context":"");
	var sQuote = removeTags(fn.getDataFromCellInRowNode(n, sContextColumn));
	var sQuoteTillPosition = sQuote.substring(0, iQuotePosition);
	var iWordIndex = sQuoteTillPosition.split(" ").length - 1;
	
	return iWordIndex;
}

/**
 * Compute the true onset/offset of a word: this is needed, because based a word selection upon click,
 * a wrong offset might be obtained, because of the natural exclusion of punctuation, which sometimes
 * excludes a dot which isn't punctuation, but part of an abbrevation
 * 
 * @param {*} sDocPid 
 * @param {*} sPrefix 
 * @param {*} iQuotePosition
 * @returns [onset, offset] 
 */
worktable.getTrueOnsetOffset = function(sDocPid, sPrefix, iQuotePosition){

	var iWordIndex = 			worktable.getWordIndexAtPosition(sDocPid, sPrefix, iQuotePosition);
	var aOnsetOffset = 			blacklab.getWordOnsetOffsetOf(sDocPid, sPrefix, iWordIndex);
	return aOnsetOffset;
}



// ***************************************************************
// compute rows selection in worktable
// ***************************************************************

/**
 * Get the ids of the selected worktable rows into an array
 * 
 * @param {Node} nNodeToCheck 
 * @returns an array of row-ids
 */
worktable.getCurrentSelection = function(nNodeToCheck){

	var bDebugRowSelection = false;
	//--------------------------------------
	if (bDebugRowSelection) {
		console.log("aSelectedNodesIds = "+worktable.aSelectedNodesIds + " " +(worktable.aSelectedNodesIds== null?"null":""));
		console.log("nNodeToCheck = " +( nNodeToCheck == null ?nNodeToCheck :fn.getRowNodeId(nNodeToCheck)));
	}
	//--------------------------------------
	

	var shiftOfCtrlPressed = (kf.isPressed("shift") || kf.isPressed("ctrl"));

	// the nNodeToCheck, if not empty, is the last clicked node
	// given as an argument to check the validity of the
	// last registered row selection 
	// t.i.: 
	// when SHIFT/CTRL is pressed, we're gathering rows, so
	// we expert to have different rows, 
	// but otherwise (=without SHIFT/CTRL) we expect only 
	// one row to be selected, so if the currently selected row 
	// doesn't match the row selection in memory, then we'll
	// dispose of the memory selection and take the selected
	// row (t.i. having the 'selected' class) instead

	var aRowIdsToOutput = new Array();

	// if it's not empty, we take the rows selection stored in memory
	if (worktable.aSelectedNodesIds != null && worktable.aSelectedNodesIds.length>0){
		
		aRowIdsToOutput = cloneArray(worktable.aSelectedNodesIds);	
	}
	// otherwise we take the rows selected on the screen
	else {

		var nCurrentlySelectedRow = fn.getFirstSelectedRowNodeFrom("worktable");
		
		if (nCurrentlySelectedRow != null){
			aRowIdsToOutput.push( fn.getRowNodeId(nCurrentlySelectedRow) );
		}		
	}

	//--------------------------------------
	if (bDebugRowSelection) {
		console.log("aRowIdsToOutput before check = "+aRowIdsToOutput);
	}
	//--------------------------------------

	// Check (described above) when we expect one row only to be selected
	// (t.i. SHIFT/CTRL isn't pressed):
	// if the node to check isn't part of the selection
	// that means that the selection if not relevant anymore
	if (!shiftOfCtrlPressed){

		if (nNodeToCheck != null && aRowIdsToOutput.length > 0 && aRowIdsToOutput.indexOf(fn.getRowNodeId(nNodeToCheck))<0 ){
			aRowIdsToOutput = new Array();
			aRowIdsToOutput.push( fn.getRowNodeId(nNodeToCheck) );
		}
	}

	// even if we end up with a 'corrected' selection
	// we won't change the content of the global
	// variable worktable.aSelectedNodesIds, because
	// that would lead to unexpected results elsewhere.	

	//--------------------------------------
	if (bDebugRowSelection) {
		console.log("output = "+aRowIdsToOutput);
		console.log("----");
	}
	//--------------------------------------

	return aRowIdsToOutput;
}


/**
 * Clear the current rows selection in memory
 * 
 * @param {Boolean} bUnselectRow : if true, do unselect all rows on the screen
 */
worktable.clearSelection = function(bUnselectRow){

	// empty global variable
	worktable.aSelectedNodesIds = [];
	if (bUnselectRow)
		fn.unselectAllRowNodes("worktable");
}



worktable.keepFilters = function(){
	var aVisibleCols = mt.getListOfVisibleColumnsOf("worktable");
	for (var i=0; i<aVisibleCols.length; i++){
		var sVal = fn.getValueOfFilterBox("worktable", aVisibleCols[i]);
		if (sVal != null && sVal != ''){
			conf.changeTableConfigValue("worktable", aVisibleCols[i], "filter", sVal);
			conf.changeTableConfigValue("worktable", aVisibleCols[i], "keepfilter", true);
		}		
	}
}

worktable.releaseFilters = function(){
	var aVisibleCols = mt.getListOfVisibleColumnsOf("worktable");
	for (var i=0; i<aVisibleCols.length; i++){
		conf.changeTableConfigValue("worktable", aVisibleCols[i], "keepfilter", false);
	}
}