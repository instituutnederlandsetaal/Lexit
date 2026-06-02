

var molexlib = {};

// subroutine of generateParadigmView()

molexlib.extractFeature = function(tag, pattern){
	var re = new RegExp(pattern);
	var m = re.exec(tag);
	if (m == null) {
		return "";
	}
	else {
		return m.join("");
	}
};



//this function will be called when we need to generate a neat and readable paradigm view
molexlib.generateParadigmView = function(){
	
	$("#lemmata_en_paradigma_view_dynamic").css("height", "765px");
	
	// draw the table
	// in such a way that the paradigm is split up in a few parts
	var oRows = fx.getAllRows("lemmata_and_paradigm_view");
	
	var sPreviousVerbFiniteness;
	var sPreviousVerbNumber;
	var sPreviousVerbTense;
	var sPreviousAdjectiveDegree;
	
	oRows.every(function(j){
		
		var aCurrentRow = this;
		var sWordformGigpos = fx.getDataFromCellInRow(aCurrentRow, "wordform_pos");
		
		// extract features so we can detect if one of them has changed
		// (if it is the case, we need to put a mark in the paradigm)
		
		var sVerbFiniteness = molexlib.extractFeature(sWordformGigpos, 'finiteness=[a-z]+');
		var sVerbNumber = molexlib.extractFeature(sWordformGigpos, 'NA=[a-z]+');
		var sVerbTense = molexlib.extractFeature(sWordformGigpos, 'tense=[a-z]+');
		var sAdjectiveDegree = molexlib.extractFeature(sWordformGigpos, 'degree=[a-z]+');
		
		// verb
		
		if ($.startsWith(sWordformGigpos, "VRB")) {
			var sBgColor;
			for (var i=0; i<mt.getListOfVisibleColumnsOf("lemmata_and_paradigm_view").length; i++) {
				var sColumnName = mt.getListOfVisibleColumnsOf("lemmata_and_paradigm_view")[i];
				
				if ( (sVerbFiniteness == 'finiteness=fin' && sVerbTense == 'tense=pres') ||
						sVerbFiniteness == 'finiteness=part')
					sBgColor = "#08088A";
				else
					sBgColor = "#8A084B";
				
				$(fx.getCellNode(aCurrentRow, sColumnName)).css("color", sBgColor);
			}
		}				
		
		if ($.startsWith(sWordformGigpos, "VRB")
				&&
				(sPreviousVerbFiniteness != sVerbFiniteness	||
						sPreviousVerbNumber != sVerbNumber ||
				 		(sPreviousVerbTense != sVerbTense && !sVerbFiniteness == 'finiteness=part'))
			) {
				
			for (var i=0; i<mt.getListOfVisibleColumnsOf("lemmata_and_paradigm_view").length; i++) {
				var sColumnName = mt.getListOfVisibleColumnsOf("lemmata_and_paradigm_view")[i];
				
				var sBorderStyle;				
				if (sPreviousVerbFiniteness != sVerbFiniteness || sPreviousVerbTense != sVerbTense)
					sBorderStyle = "solid";
				else if (sPreviousVerbNumber != sVerbNumber) 
					sBorderStyle = "dotted";
				
				$(fx.getCellNode(aCurrentRow, sColumnName)) 
					.css("border-top", "black "+sBorderStyle+" 1px")
					.css("padding-top", "15px");
				
			}
				
		}
		
		// adjective
		
		else if ($.startsWith(sWordformGigpos, "AA")
				&&
				(sPreviousAdjectiveDegree != sAdjectiveDegree)
				) {
					
			for (var i=0; i<mt.getListOfVisibleColumnsOf("lemmata_and_paradigm_view").length; i++) {
				var sColumnName = mt.getListOfVisibleColumnsOf("lemmata_and_paradigm_view")[i];
				
				// soft division when lots parts belonging together can somehow be split into smaller groups
				var sBorderStyle = "dotted";	
				
				$(fx.getCellNode(aCurrentRow, sColumnName)) 
					.css("border-top", "black "+sBorderStyle+" 1px")
					.css("padding-top", "15px");
				
			}
		}
		
		sPreviousVerbFiniteness = sVerbFiniteness;
		sPreviousVerbNumber = sVerbNumber;
		sPreviousVerbTense = sVerbTense;
		sPreviousAdjectiveDegree = sAdjectiveDegree;
			
	});
	
	
	fn.setCustomButtonName("lemmata_and_paradigm_view", 4, "Paradigma_view AAN");
	fn.setCustomButtonCss("lemmata_and_paradigm_view", 4, "textcolor", "red");
	
};




// link with diminutives

molexlib.sVerkleinwoord = "";
molexlib.sPartLemma = "";
molexlib.sVerkleinwoordId = "";
molexlib.sPartLemmaId = "";

molexlib.getVerkleinwoord = function(){
	return "<b>Kies&nbsp;verkleinwoord</b>" +
	( molexlib.sVerkleinwoord != "" ? 
			"<br>&nbsp;&nbsp;&nbsp;&nbsp;(<i>Gekozen:"+ molexlib.sVerkleinwoord +"/"+ molexlib.sVerkleinwoordId +"</i>)" : 
				"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+
				"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+
				"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;");
};
molexlib.getPartLemma = function(){
	return "<b>Kies&nbsp;deeltje</b>" +
	( molexlib.sPartLemma != "" ? 
			"<br>&nbsp;&nbsp;&nbsp;&nbsp;(<i>Gekozen:"+ molexlib.sPartLemma +"/"+ molexlib.sPartLemmaId +"</i>)" : 
				"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+
				"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+
				"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;");
};
molexlib.setContextMenuOptions = function(key, options){
	
	$("ul.context-menu-list li:eq(0)").html('<span>'+ molexlib.getVerkleinwoord() +'</span>');
	options.items[key].name = molexlib.getVerkleinwoord();
	$("ul.context-menu-list li:eq(1)").html('<span>'+ molexlib.getPartLemma() +'</span>');
	options.items[key].name = molexlib.getPartLemma();

};


/**
 * Quick & dirty diminutive builder
 * @param aLem some lemma
 * @returns a diminutive form of the lemma
 */
molexlib.buildDiminutive = function(aLem){
	
	var sLem = aLem.join("");
	var sEnd = aLem[aLem.length-1];
	
	// type gummetje, kinnetje, gangetje, balletje
	if (sEnd.match(".*aeiou(l|m|n|ng)$") && !sEnd.match(".*(aa|ee|ie|oo|uu)(l|m|n|ng)$"))
		return sLem.replace(/(.*)(l|m|n|)/, '$1$2$2') + "etje";
	
	// type leerlingetje, oefeningetje
	if (aLem.length>1 && sEnd.match(".+ing$"))
		return sLem + "etje";
	
	// type karretje
	if (aLem.length == 1 && sEnd.match(".+r$"))
		return sLem + "retje";
	
	// type bezempje, filmpje, wormpje
	if (sEnd.match(".+m$"))
		return sLem + "pje";
	
	// type puddinkje
	if (aLem.length>1 && sEnd.match(".+ing$"))
		return sLem.replace(/g$/, 'kje');
	
	// type streepje, taartje, hoekje, eendje, baasje, boefje
	if (sEnd.match(".+ptkdsf$"))
		return sLem + "je";
	
	return sLem + "je";	
};




//give an error message, if the comparison between the analysed_wordforms record
//and the lemma_and_paradigma_view record gives a mismatch
molexlib.processAwfCheck = function(sAwfId, response){
	var sResp = response["check_analysedwordforms"];
	var bGeslaagd = (lexutil.translateBoolean(sResp));
	if (!bGeslaagd)
		fn.message("Fout", 
				"Het verwerken van analysed_wordform_id "+sAwfId+" "+
				"is niet goed verlopen. Kopieer de tekst van deze foutmelding en " +
				"geef die door aan de ontwikkelaar.");
};



// make sure have read the subset names
//
// BEWARE: SEEMS TO BE UNUSED

molexlib.updateSubsets = function(){
	
	// get the subsets names from the database
	
	fn.callFunction(sApiSchema+".get_subsets", [], function(response){
		
		var aSuggestionsArr = (response["get_subsets"]).split("|");
		
		// first array value is the empty, default value
		var aDefaultChoicePlusSuggestionsArr = ([""]).concat(aSuggestionsArr);
		
		// update 'choosefrom' list
		conf.changeTableConfigValue("lemmata", "subset", "choosefrom", aDefaultChoicePlusSuggestionsArr);
		
		
		// update the lemmata-view if it's already loaded,
		// so the subsets values are available straight away
		
		if (fn.tableExists("lemmata")) {
			fn.refreshTable("lemmata");
		}
		
	});
};




//----- LINK MWE LEMMA HELP FUNCTIONS -------------------------------------------------------------------------

molexlib.sBuildNewLemMsg = 	"Maak een nieuw lemma aan: ";
molexlib.sSelfSearchForLemMsg = "Kies ander lemma";
molexlib.sBuildLinkToLemsLabel = "Link MWE aan deze lemmata";


// build part lemma for multiple lemma

molexlib.fnBuildPartLemma = function(sMweLemId, aAllOptions, selectedTextAndIdx){
	
	// ask the user to compose a new lemma
		
	// extract lemmaform
	var sSelectedText = selectedTextAndIdx[0];
	var sWordform = sSelectedText.substring( molexlib.sBuildNewLemMsg.length ).trim();
	
	fn.closeDialog();
	fn.prompt("Nieuw lemma", 
			["modern_lemma", "part_of_speech", "gloss_intern"], 
			[sWordform, "", ""], 
			function(resp){
		
				var sLemma =	resp["modern_lemma"];
				var sPos =		resp["part_of_speech"];
				var sGloss =	resp["gloss_intern"];
				
				// build the new lemma
				
				fn.callFunction(sApiSchema+".insert_lemma_and_get_id", 
						[sLemma, sPos, sGloss, "koppeling MWE"], 
						function(response){
					
							var sLemId = response["insert_lemma_and_get_id"];
					
							var iLabelPos = selectedTextAndIdx[1];
							var sNewLabel = sLemma+", "+sPos + (sGloss==''?'':' ['+sGloss+"]") + " (lem_id:"+sLemId+")";
							aAllOptions[iLabelPos] = sNewLabel;
							
							molexlib.fnRemoveSiblings(aAllOptions, iLabelPos);
							molexlib.fnShowPromptSelect(sMweLemId, aAllOptions);
							
				});
			},

			// canceled, show main popup back
			function(){
				molexlib.fnShowPromptSelect(sMweLemId, aAllOptions);
			}
	);
	
};



molexlib.fnSelfSearchForPartlemma = function(sMweLemId, aAllOptions, selectedTextAndIdx){

	fn.closeDialog();
	fn.prompt("Kies zelf ander lemma",
		["tik lemma in"],
		[],
		function(resp){

			var sNewSearchLemma = resp["tik lemma in"];
			var iReplaceAtPosition = selectedTextAndIdx[1];

			molexlib.fnReplacePartsLemmata(aAllOptions, iReplaceAtPosition, sNewSearchLemma, function(){
				molexlib.fnShowPromptSelect(sMweLemId, aAllOptions);
			});
		},

		// canceled, show main popup back
		function(){
			molexlib.fnShowPromptSelect(sMweLemId, aAllOptions);
		}
	);

};

// given an option in a list, remove its siblings (enclosed between null values OR array edges)

molexlib.fnRemoveSiblings = function(aAllOptions, i){
	
	// remove siblings the way down
	var iNull = aAllOptions.indexOf(null, i);
	if (iNull<0) iNull = aAllOptions.length; // this should never happen, since we have a last option for building
	aAllOptions.splice(i+1, iNull-(i+1));
	
	// remove siblings the way up
	var iLastNull = (aAllOptions.slice(0, i)).lastIndexOf(null);
	aAllOptions.splice(iLastNull+1, i-(iLastNull+1));
};


// build the main dialog for building multiple lemmata

molexlib.fnBuildMweLemmaLinks = function(sMweLemId, sWordform){
	
	// Add space after dots that are not followed by space
	// and trim the result.
	// This allows to split 'a.u.b.' into parts
	// in the same way as we split 'aan den lijve'. 

	sWordform = sWordform.replace(/\.(?!\s)/g, '. ').trim();

	// split by space or slash  ('24/7' -> '24', '7')
	var aWordlist = sWordform.split(/,?[\s\/]+/); 
	var aAllOptions = new Array();
	
	// build list of lemmata to choose from
	
	molexlib.fnBuildAllPartsLemmata(aAllOptions, aWordlist, 0, function(){
		
		// show prompt select 
		
		fn.removeProcessingMsg("lemmata")
		
		molexlib.fnShowPromptSelect(sMweLemId, aAllOptions);							
	});						
};

// we need a function to build the select dialog,
// which is able to call itself when needed

molexlib.fnShowPromptSelect = function(sMweLemId, aAllOptions){
	
	fn.closeDialog();
	
	var message =	"&bull; Kies in elk groepje het juiste deellemma (Houd SHIFT ingedrukt bij klikken voor meer info):<BR>" +
					"&bull; Klik daarna op '"+ molexlib.sBuildLinkToLemsLabel +"' (of anders op 'Annuleren').<BR>";
	
	fn.promptSelect(
			["MWE verbinden", message], 
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
					molexlib.fnShowLemmaInfo(selectedText);
				}
				// selecting a lemma part or so
				else  {
					fn.closeDialog();
					
					// selection = make new lemma part
					if ( selectedText.indexOf( molexlib.sBuildNewLemMsg )> -1 ) {
						// build a new lemma
						molexlib.fnBuildPartLemma(sMweLemId, aAllOptions, [selectedText, iSelectedItem]);
					}
					// selection = pre-existing lemma
					else if ( selectedText.indexOf("lem_id:")> -1 ) {
						molexlib.fnRemoveSiblings(aAllOptions, iSelectedItem);
						molexlib.fnShowPromptSelect(sMweLemId, aAllOptions);
					}
					else if ( selectedText.indexOf( molexlib.sSelfSearchForLemMsg )> -1 ){
						// user will search for right lemma on his/her own
						molexlib.fnSelfSearchForPartlemma(sMweLemId, aAllOptions, [selectedText, iSelectedItem]);
					}
					else if ( selectedText == molexlib.sBuildLinkToLemsLabel) {
						var ready = molexlib.fnCheckIfLinksToLemsReadyToBeBuilt(aAllOptions);
						
						// check if we're ready to build a multiple lemma
						if (!ready) {
							fn.message("Let op", "De MWE kan nog niet gelinkt worden.<BR><BR>Maak voor elk deellemma eerst een keuze.", function(){
								molexlib.fnShowPromptSelect(sMweLemId, aAllOptions);
							});
						}
						
						// ready, go!
						else {
							// get all lemmata ONLY (t.i. remove the build-label)
							var aCleanOtions = cloneArray(aAllOptions);
							aCleanOtions.splice( aAllOptions.indexOf( molexlib.sBuildLinkToLemsLabel ), 1 );
							
							// gather the lemma ids
							var aLemmaIds = new Array();
							for (var i=0; i< aCleanOtions.length; i++ )
								{
								if (aCleanOtions[i] != null)
									{
									var iBegin = aCleanOtions[i].indexOf("lem_id:") + "lem_id:".length;
									var iEnd = aCleanOtions[i].indexOf(")", iBegin);
									var sLemId = aCleanOtions[i].substring(iBegin, iEnd);
									aLemmaIds.push(sLemId);
									}
								}
							
							fn.closeDialog();

							// get the selected morphological analysis (if any is)
							var sMorphAnalysisId = null;
							if (fn.tableExists("morphological_view")){

								var oMorphRow = fx.getFirstSelectedRowFrom("morphological_view");
								var sMorphAnalysisId = (oMorphRow.count() == 1 ? fx.getDataFromCellInRow(oMorphRow, "morphological_analysis_id") : null);
							}
							
							// build the links
							fn.callFunction(sApiSchema+".link_mwe_to_lemmata", [ sMweLemId, aLemmaIds.join(","), sMorphAnalysisId ], function(){
								
								fn.refreshTable("lemmata");	
								if (fn.tableExists("related_lemmata"))
									fn.refreshTable("related_lemmata");
								if (fn.tableExists("mwe_to_link"))
									fn.refreshTable("mwe_to_link");
								// show analysis we just built
								fn.callTable("morphological_view", {"main_lemma_id": sMweLemId, "description": "combination"});
							});
							
						}
						
					}
					
				}
				
		});
};



// check if we are ready to link our MWE
//
// The array contains nulls which separate the different groups of lemmata 
// to choose from.
// If each groups has been solved (that is reduced to one single chosen lemma),
// the number of nulls must be the same as the number of choices
// (t.i. not counting the final choice, which is 'build links')

molexlib.fnCheckIfLinksToLemsReadyToBeBuilt = function(aAllOptions){
	
	var aCleanOtions = cloneArray(aAllOptions);
	aCleanOtions.splice( aAllOptions.indexOf( molexlib.sBuildLinkToLemsLabel ), 1 );
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

molexlib.fnBuildAllPartsLemmata = function(aAllOptions, aWordlist, i, fnCallback){
	
	fn.callFunction(sApiSchema+".search_for_lemma", [ fn.quote( aWordlist[i] ) ], function(response){
		
		// found lemmata are given in a ^^^-separated string
		
		var foundLemmata = response["search_for_lemma"];
		var foundLemmataArr = foundLemmata.split("^^^");
		
		
		// add 'cutting mark' to separate previous groups from the current one
		if (aAllOptions.length>0) {
			aAllOptions.push(null);
		}
		
		// first add the general option: 'make new (named) lemma'						
		aAllOptions.push( molexlib.sBuildNewLemMsg + aWordlist[i] );
		
		// then add all other options: existing lemmata to choose from							
		molexlib.fnBuildOptionsForOneLemma( aAllOptions, foundLemmataArr );

		// last option: self search for the right lemma
		aAllOptions.push( molexlib.sSelfSearchForLemMsg );
		
		// if we still have sublemmata to create groups for, call this function again for the next sublemma
		if (i+1<aWordlist.length) {
			molexlib.fnBuildAllPartsLemmata(aAllOptions, aWordlist, i+1, fnCallback);
		}
		
		// if we are done, just add the final option: 'build multilemma' 
		else {
			aAllOptions.push(null);
			aAllOptions.push( molexlib.sBuildLinkToLemsLabel );
			fnCallback();
		}
	
	});
	
};


molexlib.fnReplacePartsLemmata = function(aAllOptions, iReplaceAtPosition, sNewSearchLemma, fnCallback){
	
	fn.callFunction(sApiSchema+".search_for_lemma", [ fn.quote( sNewSearchLemma ) ], function(response){
		
		// found lemmata are given in a ^^^-separated string
		
		var foundLemmata = response["search_for_lemma"];


		// if no lemma was found

		if (foundLemmata == null || foundLemmata == ''){

			fn.message("Let op", "Lemma "+sNewSearchLemma+" is niet gevonden!", 
				function(){ fnCallback(); }
			);
		}

		// if some lemma matches indeed

		else {

			var foundLemmataArr = foundLemmata.split("^^^");

			// Remove the previous options for this lemma part

			var iStartPos = (aAllOptions.slice(0, iReplaceAtPosition)).lastIndexOf(null) + 1; // index of first option 
			var iEndPos = iReplaceAtPosition; // index of last option
			aAllOptions.splice(iStartPos, iEndPos - iStartPos + 1);

			
			// Now rebuild the options for this lemma part, given the new chosen lemma
			
			var aNewOptions = new Array();

			// first add the general option: 'make new (named) lemma'
			aNewOptions.push( molexlib.sBuildNewLemMsg + sNewSearchLemma );
			
			// then add all other options: existing lemmata to choose from
			molexlib.fnBuildOptionsForOneLemma( aNewOptions, foundLemmataArr );
			
			// last option: self search for the right lemma
			aNewOptions.push( molexlib.sSelfSearchForLemMsg );

			// all is built,
			// so noew insert the new options
			aAllOptions.splice(iStartPos, 0, ...aNewOptions);

			// go back to the main popup
			fnCallback();
		}	
	});
	
};



// function to build a list of possible options, given a lemma string

molexlib.fnBuildOptionsForOneLemma = function( aAllOptions, foundLemmataArr ){
	
	// options are existing lemmata to choose from
	
	for (var i=0; i<foundLemmataArr.length; i++) {
		// input structure (### separated):
		// [0] lemma_id
		// [1] modern_lemma
		// [2] lemma_pos
		// [3] gloss
		
		var oneLemmaData = foundLemmataArr[i].split("###");
		
		if (oneLemmaData.length == 1)
			continue;
		
		aAllOptions.push(
			oneLemmaData[1]+", "+oneLemmaData[2] + 				// lemma form + pos
			(oneLemmaData[3]==''?'':' ['+oneLemmaData[3]+"]")+	// gloss
			" (lem_id:"+oneLemmaData[0]+")"						// lemma-id
		);						
	}						
};


// show lemma info given selected lemmatext

molexlib.fnShowLemmaInfo = function(selectedText){
	
	if (selectedText == 'Maak een ander lemma aan') {
		// do nothing! (wrong choice in this context!)
	}
	// if a lemma is selected
	else {
		var iBegin = selectedText.indexOf(" (lem_id:") + " (lem_id:".length;
		var iEnd = selectedText.indexOf(")", iBegin);
		var sLemId = selectedText.substring(iBegin, iEnd);
		
		fn.callFunction(sApiSchema+".get_lemma_info", [sLemId], function(resp){
			
			var sLemInfo = resp["get_lemma_info"];
			fn.message("Lemma info", sLemInfo);
			
		});
		
	}
};
