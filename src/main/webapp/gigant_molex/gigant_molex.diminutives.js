
var molexdims = {};


// variables for the diminutive creation process

// input lemma
molexdims.sLemma = "";
molexdims.sLemmaPos = "";
molexdims.sLemmaId = 0;
molexdims.bHasDim = false;

// diminutive to be built
molexdims.sDimLemId = null;
molexdims.sDimLemma = "";
molexdims.sDimPos = "";
molexdims.sDimGloss = "";
molexdims.sDimAfbr = "";
molexdims.sZelfst = "L";

molexdims.bTonen = false;


// initialize variables

molexdims.initializeGivenSelectedLem = function(t) {
	
	// get the row of the lemma we want to build a diminutive for
	var nRow = fn.getSelectedRowNodesFrom(t);
	
	// input lemma
	molexdims.sLemma = fn.getDataFromCellInRowNode(nRow, "modern_lemma");
	molexdims.sLemmaPos = fn.getDataFromCellInRowNode(nRow, "lemma_pos");
	molexdims.sLemmaId = fn.getDataFromCellInRowNode(nRow, "lemma_id");
	molexdims.bHasDim = lexutil.translateBoolean( fn.getDataFromCellInRowNode(nRow, "has_dim") );
	
	// diminutive to be built
	molexdims.sDimLemId = null;
	molexdims.sDimLemma = "";
	molexdims.sDimPos = molexdims.sLemmaPos;
	molexdims.sDimGloss = '';
	molexdims.sDimAfbr = "";
	molexdims.sZelfst = "L";
	
	molexdims.bTonen = false;
};


				
	



// function for building new diminutive after user input

molexdims.enterNewDimAndLinkToIt = function(){

	fn.prompt(["Maak Verkleinwoord", "Voer in"], 
		["verkleinwoord", "lemma_pos", "gloss", "afbreking", "ook zelfstandig", "toon resultaat"], 
		[molexdims.sDimLemma, molexdims.sDimPos, molexdims.sDimGloss, molexdims.sDimAfbr, false, false], 
		function(resp){

			molexdims.sDimLemma =	resp["verkleinwoord"];
			molexdims.sDimPos =		resp["lemma_pos"];
			molexdims.sDimGloss =	resp["gloss"];
			molexdims.sDimAfbr = 	resp["afbreking"];
			molexdims.sZelfst = 	(resp["ook zelfstandig"] == 'true' ? "ZL" : molexdims.sZelfst);
			molexdims.bTonen =		(resp["toon resultaat"] == 'true');
			
			
			// create diminutive and link to it
			
			molexdims.buildDimAndLinkToId();
		
	});
};




// build a diminutive, its paradigm, and then link with it

molexdims.buildDimAndLinkToId = function(){
	
	fn.callFunction(sApiSchema+".insert_diminutive_build_paradigm_and_get_id", 
			[molexdims.sDimLemma, molexdims.sDimPos, molexdims.sDimGloss, molexdims.sDimAfbr], 
			function(resp){
		
				// get diminutive id and link with it
		
				molexdims.sDimLemId = resp["insert_diminutive_build_paradigm_and_get_id"];						
				molexdims.linkDiminutive();					
				
	});
};



// function for linking with existing diminutive

molexdims.linkDiminutive = function(){
	
	fn.callFunction(sApiSchema+".link_verkleinwoord", [molexdims.sDimLemId, molexdims.sLemmaId, molexdims.sZelfst, false], function(){

		if (molexdims.bTonen){
			fn.callDatabaseInNewTab("lemmata_and_paradigm_view", {"lemma_id": "{"+molexdims.sDimLemId+","+molexdims.sLemmaId+"}"}, null, paramsHash.get("db"));
			fn.refreshTable("lemmata");
		}
		else {
			fn.message("OK", "Gekoppeld met verkleinwoord '"+molexdims.sDimLemma+"' (lemma_id "+molexdims.sDimLemId+")");
	
			setTimeout(function(){
				fn.closeDialog();
				fn.refreshTable("lemmata");
			}, 2000);
		}
		
	});
};


			
// function for checking for existing SIMILAR diminutive
//
// which means: 
//   the stam looks the same (modlem and pos)
//   but it has another lemma_id,
//   so we're dealing with kind of a HOMONYM

molexdims.findDimWithOtherStamOrBuildIt = function(){
	
	fn.callFunction(sApiSchema+".find_similar_diminutive_lemma", 
		[molexdims.sLemmaId], 
		function(resp){
			
			// resp is a record
			
			// any similar diminutive found?
			
			if (resp["dim_lemma_id"] != '') {
			
				var aDimLemmaId =	resp["dim_lemma_id"].split(ARG_INTERNAL_SEPARATOR);
				var aDimLemma =		resp["dim_lemma"].split(ARG_INTERNAL_SEPARATOR);
				var aDimGloss = 	resp["dim_gloss"].split(ARG_INTERNAL_SEPARATOR);
				
				var aMainLemmaId =	resp["main_lemma_id"].split(ARG_INTERNAL_SEPARATOR);
				var aMainLemma = 	resp["main_lemma"].split(ARG_INTERNAL_SEPARATOR);
				var aMainGloss = 	resp["main_gloos"].split(ARG_INTERNAL_SEPARATOR);
	
	            var sTellThereIsASimilarDiminitive = 
	            	"Er bestaat al een geschikt verkleinwoord om mee te linken.<BR><BR>"+
	            	"Wilt u het huidige lemma linken met:<BR>(of klik met ALT ingedrukt voor meer info)";
	            
	            			
	            // build options for the user to choose from:
	            var oOptions = new Array();
	            
	            // first: a list of similar diminutives to link with
	            for (var i = 0; i<aDimLemmaId.length; i++){
					oOptions.push("<B>"+aDimLemma[i]+"</B> (id "+aDimLemmaId[i]+")"+(aDimGloss[i]!='' ? " ("+aDimGloss[i]+")":"")+", verkleinwoord van <B>"+aMainLemma[i]+"</B> (id "+aMainLemmaId[i]+")"+(aMainGloss[i]!='' ? " ("+aMainGloss[i]+")":""));									
				};
				
				// separator before last option
				oOptions.push(null); 
				
				// last option: create a new diminutive instead
				var newDimOption = "Toch een nieuw verkleinwoord maken";
				oOptions.push(newDimOption);

				
				
			    // ask the user to choose what to do
			    
				fn.promptSelect( ["Let op!", sTellThereIsASimilarDiminitive], oOptions, [], 
					null,
					function() {
						fn.message("OK", "Operatie door gebruiker geannuleerd");
					},
					function(sUsersChoice) {
						
						// the user wants to link with an existing diminutive
						
						if (sUsersChoice != newDimOption) {

							// get rid of html tags in options, so as to be able find the chosen option with indexOf 
							oOptions = oOptions.map( (x) => lexutil.removeTags(x) );
							
							// find the index of the chosen option
							var iIdx = oOptions.indexOf(sUsersChoice);
							molexdims.sDimLemId = aDimLemmaId[iIdx];
							
														
							// get the key that was pressed when clicking the option
							var toets = kf._getPressedKey();							
							
							// getting extra info through shift key
							if (toets == 'alt') {
								
								// make sure the key is released (otherwise it might interfere with other dialogs)
								kf._setPressedKey('released');
								
								// show info about the diminutive and its parts
								molexdims.showDimInfo();
							}
							// or link directly
							else {																
								molexdims.linkDiminutive();
								
							}
							
						}
						
						// the user wants to create a new diminutive
						else {
							//molexdims.findDimWithThisStamOrBuildIt();
							molexdims.enterNewDimAndLinkToIt();
						}										

					}
				);
			}
			
			
			else {
				// no similar diminutive found, 
				// so check if the exact diminutive exists
				
				molexdims.findDimWithThisStamOrBuildIt();
			}
		}
	);
	
};



// check if this diminutive FORM already exists
// t.i. given modlem and pos

molexdims.findSameDimFormOrBuildIt = function(){					
							
	fn.callFunction(sApiSchema+".find_lemma", [molexdims.sDimLemma, molexdims.sDimPos], function(resp){
		
		// there exists diminutive(s) with the expected form, 
		// so: should we link with one of those
		//     or make a new one diminutive instead?
		
		if (resp["lemma_id"] != '') {
			// ask the user to select what he/she wants to do...
			
			var aExistingLemId = 	resp["lemma_id"].split(ARG_INTERNAL_SEPARATOR);
			var aExistingLemma = 	resp["modern_lemma"].split(ARG_INTERNAL_SEPARATOR);
			var aExistingGloss = 	resp["gloss"].split(ARG_INTERNAL_SEPARATOR);
			var aExistingPos = 		resp["lemma_pos"].split(ARG_INTERNAL_SEPARATOR);
			
			var sTellThereAreDiminitives = 
	            	"Er bestaat al een geschikt verkleinwoord om mee te linken.<BR><BR>"+
	            	"Wilt u het huidige lemma linken met:<BR>(of klik met ALT ingedrukt voor meer info)";
	            	
	            	
            // build options for the user to choose from:
            var oOptions = new Array();
            
            // first: a list of similar diminutives to link with
            for (var i = 0; i<aExistingLemId.length; i++){
				oOptions.push( "<B>"+aExistingLemma[i]+"</B>, "+aExistingPos[i]+" (id "+aExistingLemId[i]+")"+(aExistingGloss[i]!='' ? " ("+aExistingGloss[i]+")":" zonder gloss") );									
			};
			
			// separator before last option
			oOptions.push(null); 
			
			// last option: create a new diminutive instead
			var newDimOption = "Toch een nieuw verkleinwoord maken";
			oOptions.push(newDimOption);
			
			
			
			 // ask the user to choose what to do
			    
			fn.promptSelect( ["Let op!", sTellThereAreDiminitives], oOptions, [], 
				null,
				function() {
					fn.message("OK", "Operatie door gebruiker geannuleerd");
				},
				function(sUsersChoice) {
					
					// the user wants to link with an existing diminutive
					
					if (sUsersChoice != newDimOption) {

						// get rid of html tags in options, so as to be able find the chosen option with indexOf 
						oOptions = oOptions.map( (x) => lexutil.removeTags(x) );
						
						// find the index of the chosen option
						var iIdx = oOptions.indexOf(sUsersChoice);
						molexdims.sDimLemId = aExistingLemId[iIdx];
						molexdims.sDimLemma = aExistingLemma[iIdx];
													
						// get the key that was pressed when clicking the option
						var toets = kf._getPressedKey();							
						
						// getting extra info through shift key
						if (toets == 'alt') {
							
							// make sure the key is released (otherwise it might interfere with other dialogs)
							kf._setPressedKey('released');
							
							// show info about the diminutive and its parts
							molexdims.showDimInfo();
						}
						// or link directly
						else {																
							molexdims.linkDiminutive();
						}
						
					}
					
					// the user wants to create a new diminutive
					else {
						//molexdims.findDimWithThisStamOrBuildIt();
						molexdims.enterNewDimAndLinkToIt();
					}										

				}
			);

		}
		
		// only possibility is to build a new diminutive
		else {
			
			fn.callFunction(sApiSchema+".insert_diminutive_build_paradigm_and_get_id", 
				[molexdims.sDimLemma, molexdims.sDimPos, molexdims.sDimGloss, molexdims.sDimAfbr], 
				function(resp){
			
					// get diminutive id and link with it
			
					molexdims.sDimLemId = resp["insert_diminutive_build_paradigm_and_get_id"];
					molexdims.linkDiminutive();								
				});
		}
		
	});
};



// check if there already exists one or more lemma-diminutive-links
// with the stam having this lemma_id

molexdims.findDimWithThisStamOrBuildIt = function(){
	
	fn.callFunction(sApiSchema+".find_diminutive_lemma", [molexdims.sLemmaId], function(resp){
		
		// resp is a record
		
		// any diminutive found?
		
		if (resp["verkleinwoord_lemma_id"] != '') { 
		
			var aDimLemId = resp["verkleinwoord_lemma_id"].split(ARG_INTERNAL_SEPARATOR);
			var aDimLem = resp["verkleinwoord_lemma"].split(ARG_INTERNAL_SEPARATOR);
			var aDimLemPos = resp["verkleinwoord_lemma_pos"].split(ARG_INTERNAL_SEPARATOR);
			var aDimLemGloss = resp["verkleinwoord_gloss"].split(ARG_INTERNAL_SEPARATOR);
			
			var iNumberOfDims = aDimLem.length; 
			var sFoundDims = "";
			for (var i=0; i<iNumberOfDims; i++){
				sFoundDims += "<BR>";
				sFoundDims += "&bull; <B>" + aDimLem[i] + "</B> " +
					aDimLemPos[i] + " " +					
					"(id " + aDimLemId[i] + ") "+
					(aDimLemGloss[i] != '' ? "(" + aDimLemGloss[i] + ") " : "zonder gloss");
			}
			
			fn.confirm(
					"Let op", 
					"Dit lemma heeft al een eigen verkleinwoord:<BR>" + 
					sFoundDims +"<BR><BR>" +
					"Wilt u nog een verkleinwoord aanmaken?", 
					function(){
						molexdims.enterNewDimAndLinkToIt();												
					}, 
					function(){
						fn.message("OK", "Operatie door gebruiker geannuleerd");
					});
		}
		
		// if there isn't any lemma-diminutive-link yet
		else {
			// ask the user to input a suitable diminutive
			
			fn.prompt(["Maak Verkleinwoord", "Voer in"], 
					["verkleinwoord", "lemma_pos", "gloss", "afbreking", "ook zelfstandig", "toon resultaat"], 
					[molexdims.sDimLemma, molexdims.sDimPos, molexdims.sDimGloss, molexdims.sDimAfbr, false, false], 
					function(resp){
						
						// get the data possibly edited by the user
				
						molexdims.sDimLemma =	resp["verkleinwoord"];
						molexdims.sDimPos =		resp["lemma_pos"];
						molexdims.sDimGloss =	resp["gloss"];
						molexdims.sDimAfbr = 	resp["afbreking"];
						molexdims.sZelfst = 	(resp["ook zelfstandig"] == 'true' ? "ZL" : molexdims.sZelfst);
						molexdims.bTonen = 		(resp["toon resultaat"] == 'true');
						
						// check if this diminutive already exists
						
						molexdims.findSameDimFormOrBuildIt();
						
					}, 
					function(){
						fn.message("OK", "Operatie door gebruiker geannuleerd");
					}
					
				); // end of diminutive input dialog										
			
		}; // end of 'there is no diminutive link yet' 
		
	}); // end of function call
	
};




// function for syllabifying a lemma and building a diminutive out of it

molexdims.syllabifyAndCreateDim = function(){
					
	// syllabify the lemma

	fn.callService(sSpellingServiceURL, {"action": "syllabify", "w": molexdims.sLemma}, "GET", "json", function(json){
		
		var response = json["analyses"][0];
		var sSyllabifiedParts = response["parts"];
		
		
		// build a diminutive out of the lemma
		// and syllabify it 
		
		molexdims.sDimLemma = molexlib.buildDiminutive(sSyllabifiedParts);
		
		fn.callService(sSpellingServiceURL, {"action": "syllabify", "w": molexdims.sDimLemma}, "GET", "json", function(json){
			
			var response = json["analyses"][0];
			molexdims.sDimAfbr = response["printForm"];
			
			// change gender feature into neutral
			var iPosParenthesis = molexdims.sDimPos.indexOf("(");
			if (iPosParenthesis>-1) 
				molexdims.sDimPos = molexdims.sDimPos.substring(0, iPosParenthesis);
			molexdims.sDimPos = molexdims.sDimPos+"(gender=n,number=sg)";
			
						
			// start the job
			
			// if the lemma already has a diminutive (which we know from the initialization), look that up and show it to the user		
			if (molexdims.bHasDim){
				molexdims.findDimWithThisStamOrBuildIt();
			}
			// else, check for similar diminutives first, which we could be linked to
			else {
				molexdims.findDimWithOtherStamOrBuildIt();				
			}
			
		}, 
		{"useLexitService": bUseLexitService});

	}, {"useLexitService": bUseLexitService});
};




/**
 * Function for showing for info about diminutive and its parts
 */
molexdims.showDimInfo = function(){
	
	// show info in new tab
	fn.callTableInNewTab("morphological_view", {"main_lemma_id": molexdims.sDimLemId}, null, paramsHash.get("db"));	
};



// start the diminutive creation process

molexdims.start = function(t){
	
	// initialize variables
	molexdims.initializeGivenSelectedLem(t);
	
	// syllabify the lemma and build a diminutive out of it
	molexdims.syllabifyAndCreateDim();
};

