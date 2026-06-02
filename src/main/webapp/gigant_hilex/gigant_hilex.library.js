

var hilexlib = {};

// function returns true if current user is a superuser
hilexlib.superUser = function(){
	return (fn.getCurrentUser() == 'katrien' || 
			fn.getCurrentUser() == 'mathieu' ||
			fn.getCurrentUser() == 'jesse');
};

// transform an empty string into a string 'NULL'
hilexlib.deEmpty = function(a){
	if (a == null || a == '') 
		return "NULL";
	return a;
}

// join two strings comma-separated
hilexlib.comma = function(a, b){
	return hilexlib.deEmpty(a)+","+hilexlib.deEmpty(b);
}





// generic vreugde-meter

hilexlib.buildHappinessCounter = function(t, sDatabaseFunctionName, sStatusDivId){
	
	fn.callFunction(sDatabaseFunctionName, [], function(resp){
		
		var sTableName = fn.getTableName(t);
		
		$("#"+sTableName+"_wrapper .top").find("#"+sStatusDivId).remove();
		$("#"+sTableName+"_wrapper .top").append(
				$("<div></div>")
				.attr("id", sStatusDivId)
				.css("width", "200px")	
				.css("text-align", "center")			
				.css("color", "black")
				.append($("p").css("text-decoration", "none")
					)
				);
		
		$("#"+sTableName+"_wrapper .top #"+sStatusDivId).append(
				$("<span></span>")
				.html("Vreugdemeter: "+resp[sDatabaseFunctionName])
				.css("font-size", "120%")
				);
		
		$("#"+sTableName+"_wrapper .top #"+sStatusDivId)
		.css("border", "1px dotted black")
		.css("position", "relative")
		.css("top", "40px")
		.css("left", "210px");
		
	});
}








// ----- AMBIGUITY LEMMA HELP FUNCTIONS -------------------------------------------------------------------------

hilexlib.sBuildNewAmbiLemMsg = 	"Maak een nieuw lemma aan: ";
hilexlib.sBuildAmbiMultilemLabel = "Bouw analyses";

// functions for parsing ambiguous input

// We need to be able to compute the ambiguity borders (like in a clause with coordination)
//  - Border might be explicitly indicated with square brackets
//  - Or, if no borders are indicated, we'll just put the borders around the two words around the pipe: [word1|word2]
hilexlib._fnComputeAmbiguityBorders = function(sThisVariant){

	// if square brackets are missing, we'll assume that only the two words around the pipe [a|b] are to be alternated
				
	var iLastPipe = 		sThisVariant.lastIndexOf("|");
	var sBeforeThePipe = 	sThisVariant.substring(0, iLastPipe);
	var iAmbiguityStart =	sBeforeThePipe.lastIndexOf("[");
	if (iAmbiguityStart >=0 && sThisVariant.substring(iAmbiguityStart, iLastPipe).indexOf("]")>=0)
		iAmbiguityStart = -1;

	// Left part: 
	if (iAmbiguityStart<0){
	
		// [case 1] use the '+' as left border
		if (sBeforeThePipe.lastIndexOf("+")>0){
			iAmbiguityStart =	sBeforeThePipe.lastIndexOf("+")+1;
			sThisVariant =		sThisVariant.substring(0, iAmbiguityStart) + "[" + sThisVariant.substring(iAmbiguityStart);
		}
		// [case 2] no '+' available, so begin of string is left border
		else {
			iAmbiguityStart = 0;
			sThisVariant = 		"[" + sThisVariant;
		}					
	}

	iLastPipe = 			sThisVariant.lastIndexOf("|"); // this might have changed inbetween
	var iAmbiguityEnd =		sThisVariant.indexOf("]", iLastPipe);

	// Right part: 
	if (iAmbiguityEnd<0){
		// [case 1] use the '+' as right border
		if (sThisVariant.indexOf("+", iLastPipe)>0){
			iAmbiguityEnd =		sThisVariant.indexOf("+", iLastPipe);
			sThisVariant =		sThisVariant.substring(0, iAmbiguityEnd) + "]" + sThisVariant.substring(iAmbiguityEnd);
		}
		// [case 2] no '+' available, so end of string is right border
		else {
			iAmbiguityEnd = sThisVariant.length;
			sThisVariant = 		sThisVariant + "]";
		}
		
	}
	
	return [sThisVariant, iAmbiguityStart, iAmbiguityEnd];
};


// When we have computed the borders of ambiguity (like ..... [word1|word2] ...... )
// We have to generate the simplex equivalents:   ..... word1 .......   
//                                            vs. ..... word2 ....... 
hilexlib._fnComputeAmbiguityVariants = function(aNewInputVariants, sThisVariant, iAmbiguityStart, iAmbiguityEnd){

	var bProcessAmbiguity = false;
	var sPrefix = 			sThisVariant.substring(0, iAmbiguityStart);
	var sAmbiguityString =	sThisVariant.substring(iAmbiguityStart+1, iAmbiguityEnd);
	var sSuffix =			sThisVariant.substring(iAmbiguityEnd+1);
	
	var aAmbiguityAlternatives = sAmbiguityString.split("|");
	

	// Apply each alternative to variant being processed
	// t.i. generate a new variant with that alternative

	for (var i=0; i<aAmbiguityAlternatives.length; i++){
		
		var sAlternative = aAmbiguityAlternatives[i];					

		var sNewVariant = sPrefix + sAlternative + sSuffix;
		if (aNewInputVariants.indexOf(sNewVariant)<0)
			aNewInputVariants.push(sNewVariant);
		
		// Is there still some ambiguity to be processed?
		if (sNewVariant.indexOf("|")>=0)
			bProcessAmbiguity = true;
	}
	
	return [bProcessAmbiguity, aNewInputVariants];
};


// main function for parsing ambiguous input
//
// Given some string containing ambiguities, like ..... [word1|word2] ........
// This function will return an array with the simplex equivalents (....word1.... / ....word2.....)
// and also an array, in which the words of the simplex equivalents are replaced by their indexes [=word numbers] in the original ambiguous string
// (which is needed to be able to relate the words in the simplex sentences to the right words/lemma-ids of the original/input ambiguous string)
//
hilexlib.fnParseAmbiguousLemmaInput = function(sInput){

	// get rid of unneeded spaces
	// (spaces between two words a considered part of a [multiword]lemma, except when there is a '+' next to the space, indicating a lemma border)
	sInput = sInput.replace(/ *\+ */g, '+').trim();
	
	
	// We need a copy of the input, in which words are replaced by the word INDEX in the string
	// Because we want to be able to relate words to their index afterwards...
	// this is because deriving simplexes from ambiguous input will cause indexes to change:
	//
	//		complex   	becomes 	simplex 1 	and 	simplex 2
	//		A+[B+C|D]+E 	-> 		A+B+C+E 	and 	A+D+E 
	//		1+[2+3|4]+5    			1+2+3+5     		1+4+5
	//
	// but in the end, when processing simplexes, we need to be able to use the lemma-ids of the words,
	// which are available in the order of the ambiguous string, and not in the order of the simplex string,
	// because manual desambiguation happened in the ambiguous string (which is economical, since that way
	// one need to desambiguate only once, instead of for each simplex all over again)


	// we first need to get a list of the words and their onsets in the input string
	// to be able to process that further on

	var aOrderedWordsList = new Array();	// words array
	var aOrderedOnsetsList = new Array();	// words onsets array
	var re = /[^\|\+\[\] ]+/g;
	while ((match = re.exec(sInput)) != null) { // as long as one can find a string consisting of something else than [,],+  =>  we have a word

		var sWord = match[0];
		var iPosition = match.index;

		aOrderedWordsList.push(sWord);					// add word
		aOrderedOnsetsList.push(parseInt(iPosition));	// add onset of word
	}


	// now create a new string representing the input, in which words are replaced by their indexes
	// like
	//	 	A+[B+C|D]+E ->	1+[2+3|4]+5

	var sIndexedInput = sInput;
	for (var i=aOrderedWordsList.length-1; i>=0; i--){
		var sPrefix = sIndexedInput.substring(0, aOrderedOnsetsList[i]);
		var sInBetween = i;
		var sSuffix = sIndexedInput.substring(aOrderedOnsetsList[i] + aOrderedWordsList[i].length);

		sIndexedInput = sPrefix + sInBetween + sSuffix;
	}
	
	// we've reach the point at which the ambiguous string
	// will be converted into all the simplexes it represents. So just like above:
	//
	//	A+[B+C|D]+E 	-> 		A+B+C+E 	and 	A+D+E 

	var aInputVariants = new Array(), aIndexesVariants = new Array();
	aInputVariants.push(sInput);
	aIndexesVariants.push(sIndexedInput);
	

	var bProcessAmbiguity = sInput.indexOf("|")>=0;

	if ( bProcessAmbiguity ){

		while (bProcessAmbiguity){

			var aNewInputVariants = new Array();
			var aNewIndexesVariants = new Array();
			bProcessAmbiguity = false;

			// process each variant, as long as it still contains ambiguity (meaning parse each ambiguity, in a cycle, one at the time!)
			for (var j=0; j<aInputVariants.length; j++){

				// isolate the part of the string which is ambiguous
				// t.i.: define its borders
				var aVariantAndBorders = hilexlib._fnComputeAmbiguityBorders(aInputVariants[j]);
				var sThisVariant = aVariantAndBorders[0], 
					iAmbiguityStart = aVariantAndBorders[1], 
					iAmbiguityEnd = aVariantAndBorders[2];
				
				// given the ambiguity borders, compute the simplex, UNambiguous strings representing the original input
				var aContinueAndVariants = hilexlib._fnComputeAmbiguityVariants(aNewInputVariants, sThisVariant, iAmbiguityStart, iAmbiguityEnd);
				// as part of the result, we get an indicator telling if their still ambiguity to process or not (if so, do another cycle!)
				bProcessAmbiguity = aContinueAndVariants[0]; 
				aNewInputVariants = aContinueAndVariants[1];
				
				// do exact the same operation to the strings in which the words were replaced by their word numbers/indexes
				// That way, we can relate words in simplex to the original input and its lemma-ids

				var aIndexesVariantAndBorders = hilexlib._fnComputeAmbiguityBorders(aIndexesVariants[j]);
				var sThisIndexesVariant = aIndexesVariantAndBorders[0], 
					iIndexesAmbiguityStart = aIndexesVariantAndBorders[1], 
					iIndexesAmbiguityEnd = aIndexesVariantAndBorders[2];

				var aContinueAndIndexesVariants = hilexlib._fnComputeAmbiguityVariants(aNewIndexesVariants, sThisIndexesVariant, iIndexesAmbiguityStart, iIndexesAmbiguityEnd);
				aNewIndexesVariants = aContinueAndIndexesVariants[1];				

			} // end of variants loop


			// copy result to output variables
			aInputVariants = aNewInputVariants.map((x) => x);
			aIndexesVariants = aNewIndexesVariants.map((x) => x);


		} // end of main ambiguity loop (carries on as long as there's some ambiguity to process)
	}

	return [aInputVariants, aIndexesVariants];

};


// build list of all options for all part-lemmata

hilexlib.fnBuildAllPartsLemmataForAmbiguity = function(sInputAnalysis, aAllOptions, aWordlist, sWdb, i, fnCallback){
	
	fn.callFunction(sApiSchema+".search_for_single_lemma", [fn.quote(aWordlist[i]), fn.quote(sWdb)], function(response){
		
		// found lemmata are given in a ^^^-separated string
		
		var foundLemmata = response["search_for_single_lemma"];
		var foundLemmataArr = foundLemmata.split("^^^");
		
		
		// add 'cutting mark' to separate previous groups from the current one
		if (aAllOptions.length>0){
			aAllOptions.push(null);
		}
		
		// first add the general option: 'make new (named) lemma'						
		aAllOptions.push(hilexlib.sBuildNewAmbiLemMsg + aWordlist[i]);
		
		// then add all other options: existing lemmata to choose from							
		hilexlib.fnBuildOptionsForOneLemma( aAllOptions, foundLemmataArr );
		
		// if we still have sublemmata to create groups for, call this function again for the next sublemma
		if (i+1<aWordlist.length){
			hilexlib.fnBuildAllPartsLemmataForAmbiguity(sInputAnalysis, aAllOptions, aWordlist, sWdb, i+1, fnCallback);
		}
		
		// if we are done, just add the final option: 'build!' 
		else {
			aAllOptions.push(null);
			aAllOptions.push(hilexlib.sBuildAmbiMultilemLabel);
			fnCallback();
		}
	
	});
	
};


// build the main dialog for building multiple lemmata

hilexlib.fnBuildAmbiguousLemmaAndLinkIt = function(sAttestationIds, sInputAnalysis, sWdb, sOpmerking){

	var aWordlist = new Array();
	var re = /[^\|\+\[\] ]+/g;
	while ((match = re.exec(sInputAnalysis)) != null) {

		var sWord = match[0];
		aWordlist.push(sWord);
	}

	var aAllOptions = new Array();
	
	// build list of lemmata to choose from
	
	hilexlib.fnBuildAllPartsLemmataForAmbiguity(sInputAnalysis, aAllOptions, aWordlist, sWdb, 0, function(){
		
		// show prompt select 
		
		hilexlib.fnShowPromptSelectForAmbiguity(sInputAnalysis, sAttestationIds, aAllOptions, sWdb, sOpmerking);							
	});						
};


// we need a function to build the ambiguity select dialog,
// which is able to call itself when needed

hilexlib.fnShowPromptSelectForAmbiguity = function(sInputAnalysis, sAttestationIds, aAllOptions, sWdb, sOpmerking ){
	
	fn.closeDialog();
	
	var message =	"U wilt de ambigue analyse <B>"+sInputAnalysis+"</B> verwerken. Deze is hieronder in blokjes opgesplitst:<BR>"+
					"&bull; Kies in elk groepje het juiste deellemma (Houd SHIFT ingedrukt bij klikken voor meer info):<BR>" +
					"&bull; Klik daarna op '"+hilexlib.sBuildAmbiMultilemLabel+"' (of anders op 'Annuleren').<BR>";
	
	fn.promptSelect(
			["Ambigue analyses toekennen", message], 
			aAllOptions, 
			[], 
			null, 
			function(){
				fn.message("OK", "Operatie geannuleerd door gebruiker");
			}, 
			function(selectedText){
				
				// get index of selected item
				var iSelectedItem = $(".ui-selected").index();
				// the above is more reliable than aAllOptions.indexOf(selectedText), because their can be doubles in array!
				
				var toets = kf._getPressedKey();
				
				// getting extra info through shirt key
				if (toets == 'shift') {
					hilexlib.fnShowLemmaInfo(selectedText, sWdb);
				}

				// selecting a lemma part or start building
				else {
					fn.closeDialog();
					
					// selection = make new lemma part
					if ( selectedText.indexOf(hilexlib.sBuildNewAmbiLemMsg)> -1 ) {
						// build a new lemma
						hilexlib.fnBuildAmbiPartLemma(sInputAnalysis, sAttestationIds, aAllOptions, sWdb, [selectedText, iSelectedItem], sOpmerking);
					}

					// selection = pre-existing lemma

					else if ( selectedText.indexOf("lem_id:")>=0 ) {
						hilexlib.fnRemoveSiblings(aAllOptions, iSelectedItem);
						hilexlib.fnShowPromptSelectForAmbiguity(sInputAnalysis, sAttestationIds, aAllOptions, sWdb, sOpmerking);
					}

					// start building!
					
					else if ( selectedText == hilexlib.sBuildAmbiMultilemLabel) {
						var ready = hilexlib.fnCheckIfMultilemReadyToBeBuilt(aAllOptions);
						
						// check if we're ready to build 
						if (!ready) {
							fn.message("Let op", "U bent nog niet klaar.<BR><BR>Maak voor elk deellemma een keuze.", function(){
								hilexlib.fnShowPromptSelectForAmbiguity(sInputAnalysis, sAttestationIds, aAllOptions, sWdb, sOpmerking);
							});
						}
						
						// ready to build? Go!!

						else {

							fn.closeDialog();
							fn.showProcessingMsg("token_attestations_worktable");
							
							// get all lemmata ONLY (t.i. remove the 'build' label)
							var aCleanOtions = cloneArray(aAllOptions);
							aCleanOtions.splice( aAllOptions.indexOf(hilexlib.sBuildAmbiMultilemLabel), 1 );
							
							// gather the lemma ids
							var aLemmaIds = new Array();
							for (var i=0; i< aCleanOtions.length; i++ ) {
								if (aCleanOtions[i] != null) {
									var iBegin = aCleanOtions[i].indexOf("lem_id:") + "lem_id:".length;
									var iEnd = aCleanOtions[i].indexOf(")", iBegin);
									var sLemId = aCleanOtions[i].substring(iBegin, iEnd);
									aLemmaIds.push(sLemId);
								}
							}
														

							// now fully parse the ambiguous input into simplex clauses

							var aInputVariantsAndIndexes = hilexlib.fnParseAmbiguousLemmaInput(sInputAnalysis);
							var aInputVariants = aInputVariantsAndIndexes[0];
							var aIndexesVariants = aInputVariantsAndIndexes[1];


							// Function allowing us to find a chosen lemma part, given the INDEX indicated in aIndexesVariants
							// This function returns the sorted list of lemmata needed to build a multiple lmma 
							var fnGetLemmaIdsForVariant = function(aLemmaIds, aIndexesVariants, iVariantNr){

								var aLemmataOfCurrentVariant = new Array();
								var aIndexes = aIndexesVariants[iVariantNr].split("+");
								for (var j=0; j<aIndexes.length; j++){
									var iIndex = parseInt(aIndexes[j]);
									aLemmataOfCurrentVariant.push(aLemmaIds[iIndex]);
								}
								return aLemmataOfCurrentVariant;
							}

							
							// first make sure that all needed analyses to be assigned exist
							// (only needed for multilem, as simplex lem were already build in earlier stage)
							// 
							// this function will be called below

							var aIdsToAssign = new Array(aInputVariants.length);

							var fnPreparedEachLemOfMultiLemToBeAssigned = function(iVariantNr){

								// if we are done, start assigning analyses to quotes 

								if (iVariantNr == aInputVariants.length){

									// get the quotation section id AND onsetoffset of our current attestation, which is needed 
									// to check (later on in function fnAssignOneVariant) if there exists some attestation with a given lem/multilem_id
									// already or not.
									fn.callFunction(sApiSchema+".get_quotation_section_id_and_onsetoffset_of", [sAttestationIds], function(resp){

										var sQuotationSectionIdAndOnsetOffset = resp["get_quotation_section_id_and_onsetoffset_of"];

										// start assigning analyses
										fnAssignOneVariant(aIdsToAssign, 0, sQuotationSectionIdAndOnsetOffset);
									});
									
								}
								
								else {

									// simplex lemmata

									if (aInputVariants[iVariantNr].indexOf("+")<0){

										// collect id and process next variant

										aIdsToAssign[iVariantNr] = "lem_id:"+ (fnGetLemmaIdsForVariant(aLemmaIds, aIndexesVariants, iVariantNr))[0];

										fnPreparedEachLemOfMultiLemToBeAssigned(iVariantNr+1);
									}

									// multilemma

									else {

										// get the proper part lemma-ids for the current variant

										var aLemmaIdsForVariant = fnGetLemmaIdsForVariant(aLemmaIds, aIndexesVariants, iVariantNr);

										// build multi lem and get it's id
										
										// create multiple lemma
										fn.callFunction(sApiSchema+".create_multiple_lemmata", [aLemmaIdsForVariant.join(",")], function(response){
											
											var iMultiLemId = response["create_multiple_lemmata"];

											
											// collect id and process next variant

											aIdsToAssign[iVariantNr] = "multilem_id:"+iMultiLemId;

											fnPreparedEachLemOfMultiLemToBeAssigned(iVariantNr+1);
											
										});
										
										
										
										/*
										fn.callFunction(sApiSchema+".create_multilemmata_builder", [sMultiBuilderTable], function(){
									
											// sent lemma ids to builder
											fn.callFunction(sApiSchema+".fill_multilemmata_builder", [sMultiBuilderTable, aLemmaIdsForVariant.join(",")], function(){
												
												// create multiple lemma
												fn.callFunction(sApiSchema+".create_multiple_lemmata", [sMultiBuilderTable], function(response){
													
													var iMultiLemId = response["create_multiple_lemmata"];

													
													// collect id and process next variant

													aIdsToAssign[iVariantNr] = "multilem_id:"+iMultiLemId;

													fnPreparedEachLemOfMultiLemToBeAssigned(iVariantNr+1);
													
												});
											});
											
										});
										*/
										
										
										
										
									}

								} // end of lemma or multilemma preparation
	
							} // end of fnPreparedEachLemOfMultiLemToBeAssigned()


							// For each analysis:
							// check if it is currently assigned to a quote with the current attestation id
							//   if it is, do nothing and skip to the next
							//   and otherwise:
							//    * copy the current quote 
							//    * assign the analysis to it
							

							var fnAssignOneVariant = function(aIdsToAssign, iVariantNr, sQuotationSectionIdAndOnsetOffset){

								if (iVariantNr == aIdsToAssign.length){

									// DONE
									fn.refreshTable("token_attestations_worktable");

								}
								else {

									// read id to assign and its type (simplex or multi)

									var aParsedId = (aIdsToAssign[iVariantNr]).split(":");
									var sIdType = aParsedId[0]; //  lem_id / mutlilem_id
									var iIdToAssign = parseInt(aParsedId[1]);
									
									
									// read quote section id and onset/offset to deal with

									var aQuotationSectionIdAndOnsetOffset = sQuotationSectionIdAndOnsetOffset.split(":");
									var sQuotationSectionId = aQuotationSectionIdAndOnsetOffset[0];
									var sOnsetOffset = aQuotationSectionIdAndOnsetOffset[1];

									// check if token_attestation_table has attestation_location, AND onsetoffset  AND (multi)lem_id
									// and if not: copy attestation having this attestation_location AND onsetoffset
									//             and assign it the needed id 

									fn.callFunction(sApiSchema+".check_or_build_attestation_with_analysis", [sAttestationIds, sQuotationSectionId, sOnsetOffset, sIdType, iIdToAssign], function(resp){

										// process next veriant

										fnAssignOneVariant(aIdsToAssign, iVariantNr+1, sQuotationSectionId);
									});

								}

							};


							// start the job!
							fnPreparedEachLemOfMultiLemToBeAssigned(0);


						} // end of building part after test if ready to do so
						
					} // end of 'Build' button processing part
					
				}
				
		});
};


// build part lemma for multiple lemma

hilexlib.fnBuildAmbiPartLemma = function(sInputAnalysis, sAttestationIds, aAllOptions, sWdb, selectedTextAndIdx, sOpmerking){
	
	// default persistent id is: GH + date + dot + random number in range [0-999]
	// (eg. GH20160401144225.432)
	var sDefaultPersistentId = 
		"GH"+ fn.getCurrentTimestamp("YYYYMMDD.HHMISS") + 
		"." + Math.floor(Math.random() * 1000);
	
	// ask the user to compose a new lemma
	
	// new lemma!
	if ( !$.endsWith(sWdb, 'n'))
		sWdb = sWdb + "n";
	
	// extract lemmaform
	var sSelectedText = selectedTextAndIdx[0];
	var sWordform = sSelectedText.substring( hilexlib.sBuildNewLemMsg.length ).trim();
	
	fn.closeDialog();
	fn.prompt("Nieuw lemma", 
			["modern_lemma", "wordform_pos", "persistent_id", "source_id"], 
			[sWordform, "NOU-C", sDefaultPersistentId, aAllowedSourceIdsForNewLemmata], function(resp){
		
				var sLemma =		resp["modern_lemma"];
				var sPos =			resp["wordform_pos"];
				var sPersistentId =	resp["persistent_id"];
				var sWdb =			resp["source_id"];
				
				// build the new lemma
				
				fn.callFunction(sApiSchema+".create_new_lemma_and_get_id", 
						[sLemma, sPos, sPersistentId, sWdb, sLemma], 
						function(response){
					
							var sLemId = response["create_new_lemma_and_get_id"];
					
							var iLabelPos = selectedTextAndIdx[1];
							var sNewLabel = sLemma+" " + sWdb+" / PID " + sPersistentId + " (lem_id:"+sLemId+")";
							aAllOptions[iLabelPos] = sNewLabel;
							
							hilexlib.fnRemoveSiblings(aAllOptions, iLabelPos);
							hilexlib.fnShowPromptSelectForAmbiguity(sInputAnalysis, sAttestationIds, aAllOptions, sWdb, sOpmerking);
							
				});
		
	});
	
};



// ----- SEARCH OTHER LEMMA HELP FUNCTIONS -------------------------------------------------------------------------

hilexlib.sBuildNewLemMsg = 	"Maak een nieuw lemma aan: ";
hilexlib.sBuildMultilemLabel = "Bouw multiple lemma";

// function for building a new lemma and linking it to the current attestation

hilexlib.fnBuildLemmaAndLinkIt = function(sAttestationIds, sWordform, sWdb, sOpmerking){
	
	// default persistent id is: GH + date + dot + random number in range [0-999]
	// (eg. GH20160401144225.432)
	var sDefaultPersistentId = 
		"GH"+ fn.getCurrentTimestamp("YYYYMMDD.HHMISS") + 
		"." + Math.floor(Math.random() * 1000);
	
	// ask the user to compose a new lemma
	
	// new lemma!
	if ( !$.endsWith(sWdb, 'n'))
		sWdb = sWdb + "n";
	
	fn.prompt("Nieuw lemma", 
			["modern_lemma", "wordform_pos", "persistent_id", "source_id"], 
			[sWordform, "NOU-C", sDefaultPersistentId, sWdb+"::disabled"], function(resp){
		
				var sLemma =		resp["modern_lemma"];
				var sPos =			resp["wordform_pos"];
				var sPersistentId =	resp["persistent_id"];
				var sWdb =			resp["source_id"];
				
				// build the new lemma
				
				fn.callFunction(sApiSchema+".create_new_lemma_and_get_id", 
						[sLemma, sPos, sPersistentId, sWdb, sLemma], 
						function(response){
					
							var sLemId = response["create_new_lemma_and_get_id"];
							
							// as soon as the lemma is built, assign the attestation to it
							
							fn.updateDatabaseGivenFieldValues("token_attestations_worktable", 
									{"attestation_ids": "^"+sAttestationIds+"$"}, 
									{"lemma_id": sLemId, "multiple_lemmata_analysis_id": null},
									function(){
										
										fn.updateDatabaseGivenFieldValues("token_attestations_worktable", 
												{"attestation_ids": "^"+sAttestationIds+"$"}, 
												{"opmerking": sOpmerking.replace(/nieuw +lemma/, "lemma verwerkt")},
												function(){
													
													fn.callDatabase("lemmata_and_paradigm_view", {"lemma_id": sLemId});
													fn.refreshTable("token_attestations_worktable");
													
												});
										
									});		
							
				});
		
	});
	
};

// build part lemma for multiple lemma

hilexlib.fnBuildPartLemma = function(sAttestationIds, aAllOptions, sWdb, selectedTextAndIdx, sOpmerking){
	
	// default persistent id is: GH + date + dot + random number in range [0-999]
	// (eg. GH20160401144225.432)
	var sDefaultPersistentId = 
		"GH"+ fn.getCurrentTimestamp("YYYYMMDD.HHMISS") + 
		"." + Math.floor(Math.random() * 1000);
	
	// ask the user to compose a new lemma
	
	// new lemma!
	if ( !$.endsWith(sWdb, 'n'))
		sWdb = sWdb + "n";
	
	// extract lemmaform
	var sSelectedText = selectedTextAndIdx[0];
	var sWordform = sSelectedText.substring( hilexlib.sBuildNewLemMsg.length ).trim();
	
	fn.closeDialog();
	fn.prompt("Nieuw lemma", 
			["modern_lemma", "wordform_pos", "persistent_id", "source_id"], 
			[sWordform, "NOU-C", sDefaultPersistentId, aAllowedSourceIdsForNewLemmata], function(resp){
		
				var sLemma =		resp["modern_lemma"];
				var sPos =			resp["wordform_pos"];
				var sPersistentId =	resp["persistent_id"];
				var sWdb =			resp["source_id"];
				
				// build the new lemma
				
				fn.callFunction(sApiSchema+".create_new_lemma_and_get_id", 
						[sLemma, sPos, sPersistentId, sWdb, sLemma], 
						function(response){
					
							var sLemId = response["create_new_lemma_and_get_id"];
					
							var iLabelPos = selectedTextAndIdx[1];
							var sNewLabel = sLemma+" " + sWdb+" / PID " + sPersistentId + " (lem_id:"+sLemId+")";
							aAllOptions[iLabelPos] = sNewLabel;
							
							hilexlib.fnRemoveSiblings(aAllOptions, iLabelPos);
							hilexlib.fnShowPromptSelect(sAttestationIds, aAllOptions, sWdb, sOpmerking);
							
				});
		
	});
	
};

// given an option in a list, remove its siblings (enclosed between null values OR array edges)

hilexlib.fnRemoveSiblings = function(aAllOptions, i){
	
	// remove siblings the way up
	var iNull = aAllOptions.indexOf(null, i);
	if (iNull<0) iNull = aAllOptions.length;
	aAllOptions.splice(i+1, iNull-(i+1));
	
	// remove siblings the way down
	var iLastNull = (aAllOptions.slice(0, i)).lastIndexOf(null);
	aAllOptions.splice(iLastNull+1, i-(iLastNull+1));
};


// build the main dialog for building multiple lemmata

hilexlib.fnBuildMultiLemmaAndLinkIt = function(sAttestationIds, sWordform, sWdb, sOpmerking){
	
	var aWordlist = sWordform.split("+");
	var aAllOptions = new Array();
	
	// build list of lemmata to choose from
	
	hilexlib.fnBuildAllPartsLemmata(aAllOptions, aWordlist, sWdb, 0, function(){
		
		// show prompt select 
		
		hilexlib.fnShowPromptSelect(sAttestationIds, aAllOptions, sWdb, sOpmerking);							
	});						
};

// we need a function to build the select dialog,
// which is able to call itself when needed

hilexlib.fnShowPromptSelect = function(sAttestationIds, aAllOptions, sWdb, sOpmerking ){
	
	fn.closeDialog();
	
	var message =	"&bull; Kies in elk groepje het juiste deellemma (Houd SHIFT ingedrukt bij klikken voor meer info):<BR>" +
					"&bull; Klik daarna op '"+hilexlib.sBuildMultilemLabel+"' (of anders op 'Annuleren').<BR>";
	
	fn.promptSelect(
			["Multilemma bouwen", message], 
			aAllOptions, 
			[], 
			null, 
			function(){
				fn.message("OK", "Operatie geannuleerd door gebruiker");
			}, 
			function(selectedText){
				
				// get index of selected item
				var iSelectedItem = $(".ui-selected").index();
				// the above is more reliable than aAllOptions.indexOf(selectedText), because their can be doubles in array!
				
				var toets = kf._getPressedKey();
				
				// getting extra info through shirt key
				if (toets == 'shift') {
					hilexlib.fnShowLemmaInfo(selectedText, sWdb);
				}
				// selecting a lemma part or so
				else {
					fn.closeDialog();
					
					// selection = make new lemma part
					if ( selectedText.indexOf(hilexlib.sBuildNewLemMsg)> -1 ) {
						// build a new lemma
						hilexlib.fnBuildPartLemma(sAttestationIds, aAllOptions, sWdb, [selectedText, iSelectedItem], sOpmerking);
					}
					// selection = pre-existing lemma
					else if ( selectedText.indexOf("lem_id:")> -1 ) {
						hilexlib.fnRemoveSiblings(aAllOptions, iSelectedItem);
						hilexlib.fnShowPromptSelect(sAttestationIds, aAllOptions, sWdb, sOpmerking);
					}
					else if ( selectedText == hilexlib.sBuildMultilemLabel) {
						
						var ready = hilexlib.fnCheckIfMultilemReadyToBeBuilt(aAllOptions);
						
						// check if we're ready to build a multiple lemma
						if (!ready) {
							fn.message("Let op", "Het multiple lemma kan niet gebouwd worden.<BR><BR>Maak voor elk deellemma een keuze.", function(){
								hilexlib.fnShowPromptSelect(sAttestationIds, aAllOptions, sWdb, sOpmerking);
							});
						}
						
						// ready, go!
						else {
							// get all lemmata ONLY (t.i. remove the 'build' label)
							var aCleanOtions = cloneArray(aAllOptions);
							aCleanOtions.splice( aAllOptions.indexOf(hilexlib.sBuildMultilemLabel), 1 );
							
							// gather the lemma ids
							var aLemmaIds = new Array();
							for (var i=0; i< aCleanOtions.length; i++ ) {
								if (aCleanOtions[i] != null) {
									var iBegin = aCleanOtions[i].indexOf("lem_id:") + "lem_id:".length;
									var iEnd = aCleanOtions[i].indexOf(")", iBegin);
									var sLemId = aCleanOtions[i].substring(iBegin, iEnd);
									aLemmaIds.push(sLemId);
								}
							}
							
							fn.closeDialog();
							
							fn.showProcessingMsg("token_attestations_worktable");

									
							// create multiple lemma
							fn.callFunction(sApiSchema+".create_multiple_lemmata", [aLemmaIds.join(",")], function(response){
								
								var iMultiLemId = response["create_multiple_lemmata"];
								
								// as soon as the multilem is built, assign the attestation to it
								
								fn.updateDatabaseGivenFieldValues("token_attestations_worktable", 
										{"attestation_ids": "^"+sAttestationIds+"$"}, 
										{"lemma_id": null, "multiple_lemmata_analysis_id": iMultiLemId},
										function(){
											
											fn.updateDatabaseGivenFieldValues("token_attestations_worktable", 
													{"attestation_ids": "^"+sAttestationIds+"$"}, 
													{"opmerking": sOpmerking.replace(/nieuw +lemma/, "lemma verwerkt")},
													function(){
														
														fn.callDatabase("lemmata_and_paradigm_view", {"multiple_lemmata_analysis_id": iMultiLemId});
														fn.refreshTable("token_attestations_worktable");
														
													});
											
										});	
								
							});

								

						}
						
					}
					
				}
				
		});
};



// check if we are ready to build a multilem
//
// The array contains nulls which separate the different groups of lemmata 
// to choose from.
// If each groups has been solved (that is reduced to one single chosen lemma),
// the number of nulls must be the same as the number of choices
// (t.i. not counting the final choice, which is 'build lemma')

hilexlib.fnCheckIfMultilemReadyToBeBuilt = function(aAllOptions){
	
	var aCleanOtions = cloneArray(aAllOptions);
	aCleanOtions.splice( aAllOptions.indexOf(hilexlib.sBuildMultilemLabel), 1 );
	var iNulls = 0, iNonNulls = 0;	
	
	// count!
	for (var i=0; i< aCleanOtions.length; i++ ) {
		if (aCleanOtions[i] != null)
			iNonNulls++
		else
			iNulls++;
	}
	
	return (iNonNulls == iNulls);
};



// build list of all options for all part-lemmata

hilexlib.fnBuildAllPartsLemmata = function(aAllOptions, aWordlist, sWdb, i, fnCallback){
	
	fn.callFunction(sApiSchema+".search_for_other_lemma", [fn.quote(aWordlist[i]), null, fn.quote(sWdb), null], function(response){
		
		// found lemmata are given in a ^^^-separated string
		
		var foundLemmata = response["search_for_other_lemma"];
		var foundLemmataArr = foundLemmata.split("^^^");
		
		
		// add 'cutting mark' to separate previous groups from the current one
		if (aAllOptions.length>0) {
			aAllOptions.push(null);
		}
		
		// first add the general option: 'make new (named) lemma'						
		aAllOptions.push(hilexlib.sBuildNewLemMsg + aWordlist[i]);
		
		// then add all other options: existing lemmata to choose from							
		hilexlib.fnBuildOptionsForOneLemma( aAllOptions, foundLemmataArr );
		
		// if we still have sublemmata to create groups for, call this function again for the next sublemma
		if (i+1<aWordlist.length) {
			hilexlib.fnBuildAllPartsLemmata(aAllOptions, aWordlist, sWdb, i+1, fnCallback);
		}
		
		// if we are done, just add the final option: 'build multilemma' 
		else {
			aAllOptions.push(null);
			aAllOptions.push(hilexlib.sBuildMultilemLabel);
			fnCallback();
		}
	
	});
	
};


// function to build a list of possible options, given a lemma string

hilexlib.fnBuildOptionsForOneLemma = function( aAllOptions, foundLemmataArr ){
	
	// options are existing lemmata to choose from
	
	for (var i=0; i<foundLemmataArr.length; i++) {
		// input structure (### separated):
		// [0] hilex_lemma_id		[3] gloss					[6] source_id
		// [1] lemma_id			[4] persistent_id			[7] multiple_lemmata_analysis_id
		// [2] modern_lemma		[5] lemma_pos
		
		var oneLemmaData = foundLemmataArr[i].split("###");
		
		if (oneLemmaData.length == 1)
			continue;
		
		// lemma
		if (oneLemmaData[1] != 'NULL') {
			aAllOptions.push(
					oneLemmaData[2]+" "+ 	// lemma form
					(oneLemmaData[3]==''?'':' ['+oneLemmaData[3]+"]")+	// gloss
					oneLemmaData[6]+" / PID "+oneLemmaData[4]+			// WDB + persistent id
					" (lem_id:"+oneLemmaData[1]+")"						// lemma-id
					);
		}
		// multiple lemmata
		else {
			aAllOptions.push(
					oneLemmaData[2]+" "+ 	// lemma form
					" (multi_lem_id:"+oneLemmaData[7]+")"	// multiple_lemmata_analysis_id
					);
		}							
	}						
};


// show lemma info given selected lemmatext

hilexlib.fnShowLemmaInfo = function(selectedText, sWdb){
	
	if (selectedText == 'Maak een ander lemma aan') {
		// do nothing! (wrong choice in this context!)
	}
	// if a multiple lemma is selected
	else if (selectedText.indexOf("(multi_lem_id:")>0) {
		var iBegin = selectedText.indexOf("multi_lem_id:") + "multi_lem_id:".length;
		var iEnd = selectedText.indexOf(")", iBegin);
		var sMultiLemId = selectedText.substring(iBegin, iEnd);
		
		fn.callDatabaseInNewTab("lemmata_and_paradigm_view", {"multiple_lemmata_analysis_id": sMultiLemId});
	}
	// if a new lemma is selected (string is like 'WNTn / PID ...')
	else if (selectedText.indexOf("n / PID")>=0) {
		var iBegin = selectedText.indexOf("lem_id:") + "lem_id:".length;
		var iEnd = selectedText.indexOf(")", iBegin);
		var sLemId = selectedText.substring(iBegin, iEnd);
		
		fn.callDatabaseInNewTab("lemmata_and_paradigm_view", {"lemma_id": sLemId});
	}
	// if an old GTB lemma is selected
	else {
		var iBegin = selectedText.indexOf("PID ") + "PID ".length;
		var iEnd = selectedText.indexOf(" (lem_id:", iBegin);
		var sPersistentId = selectedText.substring(iBegin, iEnd);
		
		window.open("http://gtb.inl.nl/iWDB/search?actie=article&wdb="+sWdb.replace(/n$/, "")+"&id="+sPersistentId);
	}
};

// ---------------------------------------------------------------------------------------------



// -------------------------------------------------------------------------------------------
// Subfunctions for token attestations visualisations
// -------------------------------------------------------------------------------------------

hilexlib.computeWordsFromIndexes = function(t, n){
	
	// first we need to set the wordform according to the clicked words
	// from the quote. Those clicked words are highlight.
	
	// remove the words highlights (which is html code nested into quote string)
	// so as to get the clean quote
		
	var aWordAndIndexesArray = new Array();
	
	var oCell = 		fx.getCell(n);
	var aIndexesArray =	( fx.getDataFromSiblingCell(oCell, "onsetoffset") ).split("\|");
	var sQuote = 		fn.removeHighlight(fx.getDataFromSiblingCell(oCell, "quotation"));
	
	// Now, gather the string parts from the quote
	// corresponding to the indexes (start - end) of the words the user clicked on.
	// Put these parts into a two-dimensional array [i -> [sWordform, sIndexes] ]
	
	for (var i=0; i<aIndexesArray.length; i++) {
		var sIndexes = 		aIndexesArray[i];
		var iStartIndex =	sIndexes.split(",")[0];
		var iEndIndex   =	sIndexes.split(",")[1];
		
		// Empty words should be thrown away!
		// (It is possible to have them, in the situation that
		//  some new quotes were added without attestations in them:
		//  since quotes without attestations not allowed, those quotes 
		//  were added with a kind of dummy attestation: 
		//  an empty word with index 0,0.
		//  When building a genuine attestation, this empty word must be
		//  removed. That's what happens here)
		
		if ( iStartIndex == iEndIndex )
			continue;
		
		var sWordform = 	(sQuote.substring(iStartIndex, iEndIndex)).toLowerCase();		
		aWordAndIndexesArray.push( [sWordform, sIndexes] );
	}
	
	// As words and their indexes are now grouped as single objects
	// We can easily sort the words by their index
	
	aWordAndIndexesArray.sort( function(a, b){
		
		var startPosA = right("000"+parseInt(a[1]), 3);
		var startPosB = right("000"+parseInt(b[1]), 3);
		
		if ( startPosA > startPosB ) return 1;
		if ( startPosA < startPosB ) return -1;
		return 0;
	});
	var aWordArray = 	new Array();
	var aIndexesArray =	new Array();
	
	// now put wordforms and indexes back into separate arrays
	
	for (var i=0; i<aWordAndIndexesArray.length; i++) {
		aWordArray[i] = 	aWordAndIndexesArray[i][0];
		aIndexesArray[i] =	aWordAndIndexesArray[i][1];
	}
	var sNewWordform = 	aWordArray.join(",");
	var sNewIndexes =	aIndexesArray.join("|");
	
	// return result
	return [sNewWordform, sNewIndexes];
}



hilexlib.getArgumentsForFindingOrCreatingAnalysedWordform = function(t, n){
	
	var oCell = 	fx.getCell(n);
	var iLemmaId =	fx.getDataFromSiblingCell(oCell, "lemma_id");
	iLemmaId = 		(iLemmaId == '') ? "NULL" : iLemmaId;
	
	var iMultiLemAnalysisId =	fx.getDataFromSiblingCell(oCell, "multiple_lemmata_analysis_id");
	iMultiLemAnalysisId = 		(iMultiLemAnalysisId == '') ? "NULL" : iMultiLemAnalysisId;
	
	var sNewWordform =	fx.getDataFromSiblingCell(oCell, "wordform");
	var sNewIndexes = 	fx.getDataFromSiblingCell(oCell, "onsetoffset");
	
	return [iLemmaId, 
			 iMultiLemAnalysisId, 
			 fn.quote(sNewWordform),
			 fn.quote(sNewIndexes)];
}





// needed functions for highlight
// (2 versions available)

// [1] highlight in 'token_attestations' table

hilexlib._highlightAllQuotes = function(t){
	
	fn.showProcessingMsg(t); 
	
	var aAllRowIds = fx.getAllRows(t);	
	
	aAllRowIds.every(function(){		
		hilexlib._putHighlightOnOneRow(this);		
	});
	
	fn.removeProcessingMsg(t);
	
};


hilexlib._putHighlightOnOneRow = function(oRow) {
	
	var sQuote =		fx.getDataFromCellInRow(oRow, "quotation");
	var iStartIndex = 	fx.getDataFromCellInRow(oRow, "locus_start_pos");
	var iEndIndex   = 	fx.getDataFromCellInRow(oRow, "locus_end_pos");
	
	var aNewPairsArray = new Array();
	aNewPairsArray.push( [iStartIndex, iEndIndex] );
	
	// call the highlight function with the whole array of position pairs
	if (aNewPairsArray.length>0)
		sQuote = fn.getHighlight(sQuote, aNewPairsArray, "yellow");
		
	// put the string back into the table
	fx.putDataIntoCell(oRow, "quotation", sQuote);
};


// [2] highlight in 'token_attestations_worktable' table

hilexlib.highlightAllQuotes = function(t){
	
	fn.showProcessingMsg(t); 
	
	var aAllRowIds = fx.getAllRows(t);
	
	aAllRowIds.every(function(){		
		hilexlib.putHighlightOnOneRow(this);		
	});
	
	fn.removeProcessingMsg(t);
	
};



// replace all occurence of WNT Entities by a dummy characters
// this is needed for the screen operations to be able to compute the correct word indexes upon clicking a part of the string
hilexlib.replaceWntEntitiesByX = function(sStr){
	var regex = "(&)(Ibreve|Nangb|Omacgra|Omacgrave|T|Ucaron|abar|acaron|aecirc|aemac|allabreve|bgothic|br|cmacr|cperiod|cvb|ddd|dddd|ddddd|dddddd|dgothic|dmacr|dots|ea|eaa|ebreve|ebreveacu|ebreveb|eced|edbmac|ehacek|emaccirc|emacgra|eo|eogonek|ering|et|etacb|etilde|eu|eumlbreve|firb|fm|gAasper|gAasperacu|gAlenis|gElenis|gYasper|gaasper|gaasperacu|galenis|galenisacu|gatilde|gcaron|geasper|geasperacu|gegra|gelenis|gelenisacu|ghasper|ghlenisacu|giasper|giasperacu|gilenis|gitilde|gmac|goasper|goasperacu|goaspergra|golenis|golenisacu|grasper|guacu|guasper|guasperacu|hand|hdot|ibreve|ibreveb|ic|icaron|icuml|ie|ieibreveb|iemacr|ihacek|imaccirc|inf|kangb|kdotb|kmacr|langb|lbbar|mangb|mf|mmacr|nangb|nat|ndotb|nmacr|ntb|oang|obreve|ocaron|odia|oeacute|oebreve|oemac|ohacek|omacacu|omacced|omacgra|opq|oring|oslashmacr|oudholspond|oumlb|oumlgra|oumlmac|pcnt|pt|ptilde|puml|qacute|r|remac|root3|sdia|sgate|sl|smacr|ssL|ssT|stilde|sub0|sub1|sub2|sub3|sub4|sub5|sub6|sub9|subM|suba|subm|subn|subo|subp|subr|subs|subspace|subv|subx|sup0|sup4|sup5|sup6|sup7|sup8|sup9|supC|supM|supa|supast|supb|supc|supd|suph|supi|supj|supk|supl|supm|supminus|supn|supo|supperiod|supr|sups|supspace|supt|supu|supv|supw|supx|supy|tacute|tri|ucaron|uhacek|uibreveb|umlcirc|ustrok|uumlcirc|uumlmac|uumlmaccirc|vr|vrs|wa|ybreve|ycaron|ymacr|zerothree)(;)";
	return sStr.replace(new RegExp(regex, 'g'), 'X');
}


hilexlib.putHighlightOnOneRow = function(oRow) {
	
	var sQuote =	fx.getDataFromCellInRow(oRow, "quotation");
	sQuote = 		fn.removeHighlight(sQuote);
	//sQuote = 		hilexlib.replaceWntEntitiesByX( fn.removeHighlight(sQuote) );
	
	// get the position pairs (x,y|x,y|...)
	var sAllPositionPairs = fx.getDataFromCellInRow(oRow, "onsetoffset");
	
	if (sAllPositionPairs != "-") {
				
		// build array of position pairs
		var aAllPairs = sAllPositionPairs.split("\|");		
		
		var aNewPairsArray = new Array();
		for (var i=0; i<aAllPairs.length; i++) {			
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
	fx.putDataIntoCell(oRow, "quotation", sQuote);
};


// [3] highlight in 'token_attestations_comparison' table

// SEEMS TO BE NOT USED ANYMORE

hilexlib.highlightAllQuotesInComparison = function(t){
	
	fn.showProcessingMsg(t); 
	
	var aAllRowIds = fx.getAllRows(t);
	
	aAllRowIds.every(function(){		
		hilexlib.putHighlightOnOneRowInComparison(this);		
	});
	
	fn.removeProcessingMsg(t);
	
};


hilexlib.putHighlightOnOneRowInComparison = function(oRow) {
	
	var sSummerQuote =	fx.getDataFromCellInRow(oRow, "summer_quote");
	sSummerQuote =	fn.removeHighlight(sSummerQuote);
	
	var sQuote =		fx.getDataFromCellInRow(oRow, "quote");
	sQuote = 		fn.removeHighlight(sQuote);	
	
	
	// get the position pairs (x,y|x,y|...)
	var sAllPositionPairsOfSummer =	fx.getDataFromCellInRow(oRow, "summer_onsetoffset");
	var sAllPositionPairs = 		fx.getDataFromCellInRow(oRow, "onsetoffset");
	
	if (sAllPositionPairsOfSummer != "-") {
				
		// build array of position pairs
		var aAllPairs = sAllPositionPairsOfSummer.split("\|");		
		
		var aNewPairsArray = new Array();
		for (var i=0; i<aAllPairs.length; i++) {
						
			var onePair = aAllPairs[i].split(",");
			
			var iStartIndex = parseInt(onePair[0]);
			var iEndIndex   = parseInt(onePair[1]);
			
			if (iStartIndex<iEndIndex)
				aNewPairsArray.push( [iStartIndex, iEndIndex] );
		}
		
		// call the highlight function with the whole array of position pairs
		if (aNewPairsArray.length>0)
			sSummerQuote = fn.getHighlight(sSummerQuote, aNewPairsArray, "yellow");
	}
	
	if (sAllPositionPairs != "-") {
				
		// build array of position pairs
		var aAllPairs = sAllPositionPairs.split("\|");		
		
		var aNewPairsArray = new Array();
		for (var i=0; i<aAllPairs.length; i++) {			
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
	fx.putDataIntoCell(oRow, "summer_quote", sSummerQuote);
	fx.putDataIntoCell(oRow, "quote", sQuote);
};




// ----

hilexlib.highlightGroups = function(t){
	
	var oRows =		fx.getAllRows(t);
	var hGroup = 	new Array();
	
	oRows.every(function(){
		
		var oRow = 		this;
		var iGroupId =	fx.getDataFromCellInRow(oRow, "group_id");
		
		if (iGroupId != '') {
			if (typeof hGroup[iGroupId] == 'undefined')
				hGroup[iGroupId] = 0;
			hGroup[iGroupId] = hGroup[iGroupId] + 1;			
		}
	});
	
	var iLastGroupId;
	var nLastGroupNode;
	var iGroupIdRowAbove = -1;
	var sColor =	new Array();
	sColor[1] = 	"#8181F7";
	sColor[2] = 	"#688A08";
	iColor = 		1;
	
	oRows.every(function(){
		
		var nNode = 	fx.getNode(this);		
		var iGroupId =	fx.getDataFromCellInRow(this, "group_id");
		
		// put a line after the last row of a group
		// to show where the group ends
		if (iGroupId != iLastGroupId && 
				iGroupIdRowAbove == iLastGroupId) {
			$(fn.getCellInRowNode(nLastGroupNode, "group_id")).css("border-bottom", "solid 1px black");
			$(fn.getCellInRowNode(nLastGroupNode, "analysed_wordform_id")).css("border-bottom", "solid 1px black");
			$(fn.getCellInRowNode(nLastGroupNode, "wordform_id")).css("border-bottom", "solid 1px black");
			$(fn.getCellInRowNode(nLastGroupNode, "wordform")).css("border-bottom", "solid 1px black");
			$(fn.getCellInRowNode(nLastGroupNode, "wordform_pos")).css("border-bottom", "solid 1px black");
			}
		
		if (hGroup[iGroupId]>0) // more than 0 is a group!
			{
			// is this the first row of a new group?
			// if so, choose a new color			
			if (iGroupId != iLastGroupId)
				{
				iColor = 1 + (iColor!=2);
				// also put a line before the group, to show where the group starts
				// but don't do that if we just added a line in the previous row 
				// as this would give a thick line as a result
				if ( !(iGroupId != iLastGroupId && 
						iGroupIdRowAbove == iLastGroupId))
					{
					
					$(fn.getCellInRowNode(nNode, "group_id")).css("border-top", "solid 1px black");
					$(fn.getCellInRowNode(nNode, "analysed_wordform_id")).css("border-top", "solid 1px black");
					$(fn.getCellInRowNode(nNode, "wordform_id")).css("border-top", "solid 1px black");
					$(fn.getCellInRowNode(nNode, "wordform")).css("border-top", "solid 1px black");
					$(fn.getCellInRowNode(nNode, "wordform_pos")).css("border-top", "solid 1px black");					
					}			
				}
	
			
			// give the row a color, as the current row is part of a group
			$(fn.getCellInRowNode(nNode, "group_id")).css("color", sColor[iColor]);
			$(fn.getCellInRowNode(nNode, "analysed_wordform_id")).css("color", sColor[iColor]);
			$(fn.getCellInRowNode(nNode, "wordform_id")).css("color", sColor[iColor]);
			$(fn.getCellInRowNode(nNode, "wordform")).css("color", sColor[iColor]);
			$(fn.getCellInRowNode(nNode, "wordform_pos")).css("color", sColor[iColor]);
			
			nLastGroupNode = nNode;
			iLastGroupId = iGroupId;
			}	
		
		iGroupIdRowAbove = iGroupId;
	});
	
};


// SEEMS TO BE NOT USED ANYMORE

hilexlib.highlightMultiLemmataAnalyses = function(t){
	
	var oRows = 	fx.getAllRows(t);	
	var hGroup =	new Array();
	
	oRows.every(function(){
		
		var oRow = this;		
		var iMultiLemAnalysisId = fx.getDataFromCellInRow(oRow, "multi_id");
		
		if (iMultiLemAnalysisId != '') {
			if (typeof hGroup[iMultiLemAnalysisId] == 'undefined')
				hGroup[iMultiLemAnalysisId] = 0;
			hGroup[iMultiLemAnalysisId] = hGroup[iMultiLemAnalysisId] + 1;			
		}
	});
	
	var iLastMultiLemAnalysisId;
	var nLastMultiLemAnalysis;
	var iMultiLemAnalysisIdRowAbove = -1;
	var sColor =	new Array();
	sColor[1] = 	"#0B0B3B";
	sColor[2] = 	"#0B610B";
	iColor = 		1;
	
	oRows.every(function(){
		
		var nRow = 					fx.getNode(this);		
		var iMultiLemAnalysisId =	fx.getDataFromCellInRow(this, "multi_id");
		
		// put a line after the last row of a group
		// to show where the group ends
		if (iMultiLemAnalysisId != iLastMultiLemAnalysisId && 
				iMultiLemAnalysisIdRowAbove == iLastMultiLemAnalysisId) {
					
			$(fn.getCellInRowNode(nLastMultiLemAnalysis, "modern_lemma")).css("border-bottom", "solid 1px black");
			$(fn.getCellInRowNode(nLastMultiLemAnalysis, "full_analysis")).css("border-bottom", "solid 1px black");
			$(fn.getCellInRowNode(nLastMultiLemAnalysis, "lemma_id")).css("border-bottom", "solid 1px black");
			$(fn.getCellInRowNode(nLastMultiLemAnalysis, "lemma_part")).css("border-bottom", "solid 1px black");
			$(fn.getCellInRowNode(nLastMultiLemAnalysis, "lemma_part_pos")).css("border-bottom", "solid 1px black");			
		}
		
		if (hGroup[iMultiLemAnalysisId]>0) { // more than 0 is a group!
			
			// is this the first row of a new group?
			// if so, choose a new color			
			if (iMultiLemAnalysisId != iLastMultiLemAnalysisId) {
				iColor = 1 + (iColor!=2);
				// also put a line before the group, to show where the group starts
				// but don't do that if we just added a line in the previous row 
				// as this would give a thick line as a result
				if ( !(iMultiLemAnalysisId != iLastMultiLemAnalysisId && 
						iMultiLemAnalysisIdRowAbove == iLastMultiLemAnalysisId))
					{
					$(fn.getCellInRowNode(nRow, "modern_lemma")).css("border-top", "solid 1px black");
					$(fn.getCellInRowNode(nRow, "full_analysis")).css("border-top", "solid 1px black");
					$(fn.getCellInRowNode(nRow, "lemma_id")).css("border-top", "solid 1px black");
					$(fn.getCellInRowNode(nRow, "lemma_part")).css("border-top", "solid 1px black");
					$(fn.getCellInRowNode(nRow, "lemma_part_pos")).css("border-top", "solid 1px black");				
					}			
			}
	
			
			// give the row a color, as the current row is part of a group
			$(fn.getCellInRowNode(nRow, "modern_lemma")).css("color", sColor[iColor]);
			$(fn.getCellInRowNode(nRow, "full_analysis")).css("color", sColor[iColor]);
			$(fn.getCellInRowNode(nRow, "lemma_id")).css("color", sColor[iColor]);
			$(fn.getCellInRowNode(nRow, "lemma_part")).css("color", sColor[iColor]);
			$(fn.getCellInRowNode(nRow, "lemma_part_pos")).css("color", sColor[iColor]);
			
			nLastMultiLemAnalysis = nRow;
			iLastMultiLemAnalysisId = iMultiLemAnalysisId;
		}	
		
		iMultiLemAnalysisIdRowAbove = iMultiLemAnalysisId;
	});
	
};

