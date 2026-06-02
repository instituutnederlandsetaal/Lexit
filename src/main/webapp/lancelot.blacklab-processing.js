

// ---------------------------------------------
// Give more context in pop-up
// ---------------------------------------------


/**
 * Give more context for a quote, t.i.
 * show the lemma/pos-tag for each single word of it.
 * 
 * @param {*} sCorpusURL : corpus URL to get context from
 * @param {*} docId : doc pid of the quote
 * @param {*} iWordsAroundHit : amount of context to retrieve
 */
blacklab.giveMoreContext = function(sCorpusURL, docId, iWordsAroundHit){

	if (worktable.queryRunning){
		setTimeout(function(){fn.closeDialog();}, 1000);
		menus.message("OK", "Please wait till all attestations are loaded before requesting more context...");
		return true;
	}

	// tooltips must be hidden when showing more context
	bTooltipsAllowedInTable = false;

	// get row information

	var n = fn.getRowNodeWhere("worktable", {"doc_pid": docId})
	
	// since the worktable might contain better information (t.i. the correction of the user)
	// we need to read the content of the row, and apply that to the blacklab response

	var aAnalysis = (fn.getDataFromCellInRowNode(n, "analyses")).split(" | ");
	var sAnalysis = (aAnalysis.length>0) ? aAnalysis[0] : "";
	var aWordnrsOfAnalysis = (fn.getDataFromCellInRowNode(n, "corpus_word_nrs")).split("|");
	var wgId = docId.split("|")[1];
	var docPid = docId.split("|")[0];
	var iLeftEdgeOfMatch = fn.getDataFromCellInRowNode(n, "start_pos");
	var iRightEdgeOfMatch = fn.getDataFromCellInRowNode(n, "end_pos");
	

	// get all possible corrections for the left en right context from the worktable_shadow table!

	fn.callFunction(sProjectName+".get_more_context_from_shadow", 
		[docPid, parseInt(iLeftEdgeOfMatch)-iWordsAroundHit, parseInt(iRightEdgeOfMatch)+iWordsAroundHit], 
		function(resp){


			// parse results from worktable_shadow

			resp = resp["get_more_context_from_shadow"];

			var aArrayOfCorrectionsToApply = {};
			var aFoundAnalysesWithinContext = resp.split("@@@");
			for (var i=0; i<aFoundAnalysesWithinContext.length; i++){

				var aAnalysisAndIndex = (aFoundAnalysesWithinContext[i]).split("###");
				var sLemmaAndPos = aAnalysisAndIndex[0];
				sLemmaAndPos = sLemmaAndPos.replace(/(\+.+)$/gi, "+ ...");
				var aLemmaAndPos = sLemmaAndPos.split(", ");
				var iPosition = parseInt( aAnalysisAndIndex[1] );
				aArrayOfCorrectionsToApply[iPosition] = aLemmaAndPos;
			}


			// get context info now	

			var sServiceUrl = sCorpusURL + "/docs/"+docPid+"/snippet/";
			var aParams = {
				"hitstart": iLeftEdgeOfMatch,
				"hitend": iRightEdgeOfMatch,
				"wordsaroundhit": iWordsAroundHit
			};			

			fn.callService(sServiceUrl, 
							aParams, 
							"GET", "json", 
							function(resp){

								var aLeftPunct = resp["left"]["punct"];
								var aLeftWord = resp["left"]["word"];
								var aLeftLem = resp["left"]["lemma"];
								var aLeftPos = resp["left"]["pos"];
								var aLeftGroupId = Array.apply(null, {length: aLeftWord.length}).map(x => "");

								var aMatchPunct = resp["match"]["punct"];
								var aMatchWord = resp["match"]["word"];
								var aMatchLem = resp["match"]["lemma"];
								var aMatchPos = resp["match"]["pos"];
								var aMatchGroupId = Array.apply(null, {length: aMatchWord.length}).map(x => "");

								var aRightPunct = resp["right"]["punct"];
								var aRightWord = resp["right"]["word"];
								var aRightLem = resp["right"]["lemma"];
								var aRightPos = resp["right"]["pos"];
								var aRightGroupId = Array.apply(null, {length: aRightWord.length}).map(x => "");

								// apply punctuation
								// BEWARE: weight thing in BlackLab, is the fact that punctuation of a token is stored at the index of the NEXT token!

								for (var i=0; i<aLeftWord.length-1; i++){
									aLeftWord[i] += aLeftPunct[i+1];
								}
								aLeftWord[aLeftWord.length-1] += aMatchPunct[0]; 
								if (aRightPunct.length>0)
									aMatchWord[0] += aRightPunct[0];
								for (var i=0; i<aRightWord.length-1; i++){
									aRightWord[i] += aRightPunct[i+1];
								}


								// now apply the (possible corrected) info from the worktable to the BlackLab input

								var iMatchPos = parseInt(iLeftEdgeOfMatch);

								// [1] FIRST LEFT & RIGHT CONTEXT
								//
								// apply info gotten from worktable_shadow 
								// (especially meant for correction in left and right context - the match will be dealt with in the next part...)

								for (var i = parseInt(iLeftEdgeOfMatch)-iWordsAroundHit+1; i<parseInt(iRightEdgeOfMatch)+iWordsAroundHit-1; i++){

									var aAnalysisAtIndex = aArrayOfCorrectionsToApply[i];									

									if (aAnalysisAtIndex != null){

										var sAnalysisLem = (aAnalysisAtIndex.length == 2) ? aAnalysisAtIndex[0] : "";
										var sAnalysisPos = (aAnalysisAtIndex.length == 2) ? aAnalysisAtIndex[1].replace(/\([^\)]+\)/gi, "") : "";

										// left context
										if (i < iMatchPos){
											var iIndex = aLeftGroupId.length - (iMatchPos - i);
											aLeftLem[iIndex] = sAnalysisLem;
											aLeftPos[iIndex] = sAnalysisPos;
										}
										// right context
										if (i > iMatchPos){
											var iIndex = i - iMatchPos - 1;
											aRightLem[iIndex] = sAnalysisLem;
											aRightPos[iIndex] = sAnalysisPos;
										}
									}

								}


								// [2] MATCHER (which might include a part in the context, in case of wordgroup analysis)
								//								

								// first get the correction to apply, if any

								var aAnalysisAtIndex = aArrayOfCorrectionsToApply[iMatchPos];
								var aAnalysisLemAndPos = (aAnalysisAtIndex != null) ? aAnalysisAtIndex : sAnalysis.split(", ");
								var sAnalysisLem = (aAnalysisLemAndPos.length == 2) ? aAnalysisLemAndPos[0] : "";
								var sAnalysisPos = (aAnalysisLemAndPos.length == 2) ? aAnalysisLemAndPos[1].replace(/\([^\)]+\)/gi, "") : "";


								// now process the match info (we do this as last correction step, to allow it to 
								// erase previous correction steps, in case of contradiction... ... well, contradiction is not supposed to happen!)
								//
								// of course not only to the match, but possibly also to some words of the context, in case of wordgroup analysis!

								for (var i=0; i<aWordnrsOfAnalysis.length; i++){

									var iWordNr = parseInt(aWordnrsOfAnalysis[i]);									

									// match part in left context
									if (iWordNr < iMatchPos){
										var iIndex = aLeftGroupId.length - (iMatchPos - iWordNr);
										aLeftGroupId[iIndex] = wgId;
										aLeftLem[iIndex] = sAnalysisLem;
										aLeftPos[iIndex] = sAnalysisPos;
									}
									// the match
									if (iWordNr == iMatchPos){
										aMatchGroupId[0] = wgId;
										aMatchLem[0] = sAnalysisLem;
										aMatchPos[0] = sAnalysisPos;
									}
									// match part in right context
									if (iWordNr > iMatchPos){
										var iIndex = iWordNr - iMatchPos - 1;
										aRightGroupId[iIndex] = wgId;
										aRightLem[iIndex] = sAnalysisLem;
										aRightPos[iIndex] = sAnalysisPos;
									}
								}

								
								// merge match all context to a single list

								var aFullWord = aLeftWord.concat(aMatchWord, aRightWord);
								var aFullLem = aLeftLem.concat(aMatchLem, aRightLem);
								var aFullPos = aLeftPos.concat(aMatchPos, aRightPos);
								var aFullGroupId = aLeftGroupId.concat(aMatchGroupId, aRightGroupId);

								var htmlStr = "";

								// add highlight to left and right context if necessary
								// (put highlight to tokens sharing the same group-id as the match)

								var sMatchGroupId = aMatchGroupId[0];
								if (sMatchGroupId != ''){
									
									for (var i=0; i<aLeftGroupId.length; i++){
										if (aLeftGroupId[i] == sMatchGroupId) {
											aLeftWord[i] = "<B>" +aLeftWord[i]+ "</B>";
										}
									}							
									for (var i=0; i<aRightGroupId.length; i++){
										if (aRightGroupId[i] == sMatchGroupId) {
											aRightWord[i] = "<B>" +aRightWord[i]+ "</B>";
										}
									}
								}
								

								// now build the full sentence and add highlight on match (parts) too

								htmlStr += "<span class='inlfont10pt'>";
								htmlStr += aLeftWord.join(" ") + " <B>" + aMatchWord.join(" ") + "</B> " + aRightWord.join(" ");
								htmlStr += "</span>";


								// add GUI on top for more/less context
								var iLessWordsAroundHit = iWordsAroundHit, iMoreWordsAroundHit = iWordsAroundHit;
								var lessDisabled = "", moreDisabled = "";

								if (iWordsAroundHit > blacklab.iWordsAroundMinValue)
									iLessWordsAroundHit = iWordsAroundHit - blacklab.iWordsAroundHitStep;
								else
									lessDisabled = "disabled";
								iMoreWordsAroundHit = iWordsAroundHit + blacklab.iWordsAroundHitStep;


								htmlStr += "<CENTER>";

								htmlStr += "<BR><BR><TABLE>";
								htmlStr += "<TR class='inlfont10pt'>";
								htmlStr += "<TD><BUTTON type='button' "+lessDisabled+" onclick='blacklab._giveMoreContext(\""+ sCorpusURL + "\", \""+ docId +"\", " + iLessWordsAroundHit + ")'>Less context</button></TD>";
								htmlStr += "<TD></TD>";
								htmlStr += "<TD><BUTTON type='button' "+moreDisabled+" onclick='blacklab._giveMoreContext(\""+ sCorpusURL + "\", \""+ docId +"\", " + iMoreWordsAroundHit + ")'>More context</button></TD></TD>";
								htmlStr += "<TD></TD>";
								htmlStr += "<TD><BUTTON type='button' onclick='blacklab._closeMoreContext()'>Close</button></TD></TD>";
								htmlStr += "</TR>";
								htmlStr += "</TABLE>";
								

								

								// wrapper
								htmlStr += "<DIV id='full_analyses_wrapper'>";

								var startBold = "",  endBold = "";
								
								// we want a given number of columns
								var iNumberOfCols = 3;
								// this is the number of analyses to show per column 
								var iNumberOfAnalysesPerCol = Math.ceil( aFullPos.length / iNumberOfCols);

								// open first column
								// and build a table with [wordform] -> [lemma/pos] overview
								htmlStr += "<DIV style='display: inline-block; vertical-align: top;'><TABLE>";
								
				
								for (i = 0; i < aFullPos.length; i++)
								{
									// if we have reached the max number of analyses to show per column
									// close the column and open a new one 
									if (i % iNumberOfAnalysesPerCol == 0)
									{
										htmlStr += "</TABLE></DIV>";
										htmlStr += "<DIV style='display: table-cell; vertical-align: top; margin-left: 25px;'><TABLE>";
									}

									startBold = "", endBold = "";

									// add BOLD for match (part)
									
									if ((sMatchGroupId == '' && i == aLeftWord.length) // main match 
										|| 
										(sMatchGroupId != '' && aFullGroupId[i] == sMatchGroupId)   // match part in left/right context
										){
										startBold = "<B>", endBold = "</B>";;
									}
									

									htmlStr += "<TR class='inlfont10pt'>";

									htmlStr += "<TD>"+ startBold + aFullWord[i] + endBold + "</TD>" ;
									htmlStr += "<TD>"+ startBold + "<span style='color: #045FB4'>" + aFullLem[i]+"/"+aFullPos[i] +"" + endBold + "</span></TD>";
				
									htmlStr += "</TR>";
								}

								// end of last column
								htmlStr += "</TABLE></DIV>"; 

								// end of wrapper
								htmlStr += "</DIV>"; 


								// add GUI at bottom for more/less context
			
								htmlStr += "<BR><BR><TABLE>";	
								htmlStr += "<TR class='inlfont10pt'>";
								htmlStr += "<TD><BUTTON type='button' "+lessDisabled+" onclick='blacklab._giveMoreContext(\""+ sCorpusURL + "\", \""+ docId +"\", " + iLessWordsAroundHit + ")'>Less context</button></TD>";
								htmlStr += "<TD></TD>";
								htmlStr += "<TD><BUTTON type='button' "+moreDisabled+" onclick='blacklab._giveMoreContext(\""+ sCorpusURL + "\", \""+ docId +"\", " + iMoreWordsAroundHit + ")'>More context</button></TD></TD>";
								htmlStr += "<TD></TD>";
								htmlStr += "<TD><BUTTON type='button' onclick='blacklab._closeMoreContext()'>Close</button></TD></TD>";
								htmlStr += "</TR>";
								htmlStr += "</TABLE>";

								htmlStr += "</CENTER>";

								// hide tooltip
								$("#tiptip_holder").hide();
								setTimeout(function(){
									$("#tiptip_holder").hide();

									// when clicking outside the dialog, close it right away
									$(".ui-widget-overlay").on("click", function(){
										fn.closeDialog();
										// closing this dialog should restore tooltips
										bTooltipsAllowedInTable = true;
										$(".tooltip").tipTip( gui.getTiptipConfig() );
										fn.refreshTable("worktable");
									});
								}, 200);

								// make sure any pre-existing dialog is closed
								fn.closeDialog();

								// now show 'More context' dialog
								menus.message("More context", htmlStr, function(){

									// closing this dialog should restore tooltips
									bTooltipsAllowedInTable = true;
									$(".tooltip").tipTip( gui.getTiptipConfig() );
									fn.refreshTable("worktable");
								});
								
								
								// fix width
								$( "div[id^='dialog-message']" ).dialog( "option", "width", "auto" );
								
									
			},
			{"useLexitService": true}); // for indirect access

		});

	
	
	
}


/**
 * Same as blacklab.giveMoreContext(), but this function closes any
 * existing dialog before! 
 * 
 * @param {*} sCorpusURL : corpus URL to get context from
 * @param {*} docId : doc pid of the quote
 * @param {*} iWordsAroundHit : amount of context to retrieve
 */
blacklab._giveMoreContext = function(sCorpusURL, sDocId, iWordsAroundHit){
	
	fn.closeDialog();
	blacklab.giveMoreContext(sCorpusURL, sDocId, iWordsAroundHit);
};



/**
 * Close the 'More context' dialog
 */
blacklab._closeMoreContext = function(){

	fn.closeDialog();
	
	// restore tooltips
	bTooltipsAllowedInTable = true;
	$(".tooltip").tipTip( gui.getTiptipConfig() );
	fn.refreshTable("worktable");
}




// ------------------------------------------------------------------------------------------

/**
 * Get the word index (in terms of Blacklab) of a word in a given context in a given document
 * 
 * @param {*} sDocId : doc pid of quote
 * @param {*} sContextName : context at stake (left, match, right)
 * @param {*} sWordNumberOfTheMatch : word index (in terms of Blacklab) of the match of the quote
 * @param {*} iOnsetOfWord : onset of the word/token
 * @returns a word index in terms of BlackLab
 */
blacklab.getWordIndexOf = function(sDocId, sContextName, sWordNumberOfTheMatch, iOnsetOfWord){

	var n = fn.getRowNodeWhere("worktable", {"doc_pid": sDocId});

	var iWordNumberOfTheMatch = parseInt(sWordNumberOfTheMatch);
	var sContextShort = sContextName.replace(/_context/, "");
	var aOnsetOffset = (fn.getDataFromCellInRowNode(n, sContextShort+"_all_onsetoffsets")).split("|");
	
	var i=0;
	while (i<aOnsetOffset.length){
		if ( $.startsWith(aOnsetOffset[i], iOnsetOfWord+",") ){
			break;
		}
		i++;
	}

	// match context (default value)
	var iWordIndex = iWordNumberOfTheMatch;

	// left context
	if (sContextShort == 'left'){
		iWordIndex = iWordNumberOfTheMatch - aOnsetOffset.length + i;
	}

	// right context
	if (sContextShort == 'right'){
		iWordIndex = iWordNumberOfTheMatch + 1 + i;
	}
	
	return iWordIndex;
}


/**
 * Compute the word index corresponding of some quote string position.
 * This works whenever the specified position is inside of a word or on its border (eg. its onset).
 * 
 * @param {String} sDocPid : doc pid of quote
 * @param {String} sContext : context at stake (left, match, right)
 * @param {Integer} iQuotePosition : onset of the word/token
 * @returns a word index in terms of BlackLab
 */
blacklab.getWordIndexAtPosition = function(sDocPid, sContext, iQuotePosition){	

	var n = fn.getRowNodeWhere("worktable", {"doc_pid": sDocPid});
	var iMatchStart = parseInt(fn.getDataFromCellInRowNode(n, "start_pos"));

	var sContextColumn = sContext + (sContext!='match' ? "_context":"");
	var sQuote = removeTags(fn.getDataFromCellInRowNode(n, sContextColumn));
	var sQuoteTillPosition = sQuote.substring(0, iQuotePosition);
	var iWordIndex = sQuoteTillPosition.split(" ").length - 1;

	if (sContext == 'left'){
		iWordIndex = iMatchStart - (sQuote.split(" ").length - iWordIndex );
	}
	if (sContext == 'match'){
		iWordIndex = iMatchStart;
	}
	if  (sContext == 'right'){
		iWordIndex = iMatchStart + iWordIndex + 1;
	}
	
	return iWordIndex;
}





/**
 * Reverse version of blacklab.getWordIndexOf()
 * 
 * Get the 0-based onset/offset [comma separated] of a word in the specific context string [left_context/match/right_context]
 * (so, it's NOT in BlackLab terms, which uses word indexes instead)
 * 
 * @param {*} sDocPid : doc pid of quote
 * @param {*} sPrefix : context at stake (left, match, right)
 * @param {*} iWordIndex : word index in term of BlackLab
 * @returns [onset, offset] of the word as a array
 */
blacklab.getWordOnsetOffsetOf = function(sDocPid, sPrefix, iWordIndex){
	
	var n = fn.getRowNodeWhere("worktable", {"doc_pid": sDocPid});

	var aOnsetOffsets = (fn.getDataFromCellInRowNode(n, sPrefix+"_all_onsetoffsets")).split("|");
	var aOnsetOffsetPair =  (aOnsetOffsets[iWordIndex] ).split(","); 

	return [ parseInt(aOnsetOffsetPair[0]), parseInt(aOnsetOffsetPair[1]) ];
}



