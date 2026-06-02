
var tagset = {};


// the validation rules can be used to evaluate a tag, without having a fully detailed list of tags at one's disposal 
tagset.aTagValidationRules = {

	"default": 	[
				"pos=AA => degree, position=free;prenom;postnom;uncl",

				"pos=NOU-C => number",

				"pos=ADV => type",

				"pos=VRB => finiteness",
				"pos=VRB, finiteness=fin => tense",
				"pos=VRB, finiteness=uncl => tense=uncl",

				"pos=NUM => type,position=free;prenom;postnom;uncl,representation",

				"pos=PD => type=d-p;excl;indef;pers;poss;recip;refl;w-p;uncl, position=free;prenom;postnom;uncl",
				"pos=PD,subtype=art => position=prenom",
				"pos=PD,type=pers => position=free",
				"pos=PD,type=refl =>  position=free",
				"pos=PD,type=recip =>  position=free",
				"pos=PD,type=rel => position=free",
				
				"pos=PD,position=prenom,type=indef => subtype",
				"pos=PD,position=prenom,type=uncl => subtype",
				"pos=PD,position=prenom,type=d-p => subtype",
				"pos=PD,position=uncl,type=indef => subtype",
				"pos=PD,position=uncl,type=uncl => subtype",
				"pos=PD,position=uncl,type=d-p => subtype",

				"pos=ADP => type",

				"pos=CONJ => type",

				"pos=RES => type"
				]
};


// full list of allowed tags with features

tagset.aFullTagsAndFeatures = {
	"default":	[]					// BEWARE:	kind of deprecated, as this is done in the database now
									// 			but we keep this just in case!!
};


// this is to be built by tagset.parseValidationRules()
tagset.aValidationRegex = new Hashtable();
tagset.aValidationList = new Hashtable();
tagset.aDeclaration = new Hashtable();
tagset.aMainPos = new Hashtable();


// parse one set out of the aTagValidationRules
// and convert it into a set of regexes to be used for checking users' input 
tagset.parseValidationRules = function(sSetName){

	console.log("Parsing validation rules");

	// if no tag set was required to be used, or the given name is unknown, use the default tag set
	if (sSetName == null || typeof tagset.aTagValidationRules[sSetName] == 'undefined') 
		sSetName = "default";

	// take the set of rules to parse
	var aValidationRules = tagset.aTagValidationRules[sSetName];
	
	// loop through the validation rules to parse
	for (var i=0; i<aValidationRules.length; i++){

		var aKeyValue = (aValidationRules[i]).split(" => ");
		var sKey = 	aKeyValue[0];
		var sValue = aKeyValue[1].replace(/ /gi, '');

		// Extract main pos
		var sMainPos = sKey.replace(/^pos=/, '');
		// remove features
		var iEndOfMainPos = sMainPos.indexOf("(");
		if (iEndOfMainPos<0) iEndOfMainPos = sMainPos.length;
		sMainPos = sMainPos.substring(0, iEndOfMainPos);
		// remove part after comma
		var iComma = sMainPos.indexOf(",");
		if (iComma<0) iComma = sMainPos.length;
		sMainPos = sMainPos.substring(0, iComma);
		tagset.aMainPos.put(sMainPos.toLowerCase(), sMainPos);


		// convert tag into regex
		sKey = sKey.replace(/(pos=[A-Z]+?)(,)/, '$1\\(');
		// and remove the 'pos=' in front part, which of course isn't part of a tag
		sKey = sKey.replace(/^pos=/, '');

		// now the value part: get each feature
		var aFeatures = sValue.split(",");
		for (var j=0; j<aFeatures.length; j++){

			var sFeature = aFeatures[j];

			// if the feature contains both the feature name and value
			if (sFeature.indexOf("=")>-1){
				var aFeatureNameAndValue = sFeature.split("=");
				
				// put brackets around the possible values
				// and change ';' into pipes
				aFeatureNameAndValue[1] = "\("+(aFeatureNameAndValue[1]).replace(/;/g, '|')+"\)";
				
				sFeature = aFeatureNameAndValue.join("=");
			}

			// put regex back into array
			aFeatures[j] = sFeature;
		}

		// now save the regex (which we'll use to test user input)
		tagset.aValidationRegex.put(sKey, aFeatures.join(",") );
		// and save the original declaration as well, which we will use to give feedback, in case of illegal user input
		tagset.aDeclaration.put(sKey, (aValidationRules[i]).replace(/^pos=/, ''));
	}


	// loop throught the list of allowed tags and features
	// and make sure we also get feature-less tags added to the list

	var aFullList = tagset.aFullTagsAndFeatures[sSetName];

	for (var i=0; i<aFullList.length; i++){

		var sFullTag = aFullList[i];
		var sMainTag = sFullTag.indexOf("(")>-1 ? sFullTag.substring(0, sFullTag.indexOf("(")) : sFullTag;

		// save two things to the hash:
		// the main tag AND the full tag as KEY => both giving the main tag as a value (we'll use the value in the tagset.getClosestString function)
		if ( !tagset.aValidationList.containsKey(sFullTag))
			tagset.aValidationList.put(sFullTag, sMainTag);
		if ( !tagset.aValidationList.containsKey(sMainTag))
			tagset.aValidationList.put(sMainTag, sMainTag);
	}

	// debug
	// console.log(tagset.aValidationRegex.entries());
	// console.log(tagset.aValidationList.entries());
	// console.log(tagset.aDeclaration.entries());
	// console.log(tagset.aMainPos.entries());
}





// Validate some tag with features or so
tagset.evaluate = function(sInputTag){

	// first thing to do in any case:
	// if the validation rules haven't been read yet, read them!
	if (tagset.aValidationRegex.isEmpty()){
		tagset.parseValidationRules();
	}


	// if the input contains a lemma and a pos tag, remove the lemma
	// as we only want to evaluate the pos	
	var lemmaAndTagRe = new RegExp("^.+, [A-Z]+");
	if (lemmaAndTagRe.test(sInputTag))
		sInputTag = sInputTag.substring(sInputTag.indexOf(", ") + ", ".length);


	// we have two possibilities:
	// [1] if we have a non-empty list of allowed tags-and-features, we'll use that to evaluate
	// [2] otherwise we'll use the general validation rules


	// [1] use the full list

	if ( !tagset.aValidationList.isEmpty()){

		console.log("Evaluate by using the full tag list");

		// do we have a match?
		if (tagset.aValidationList.containsKey(sInputTag))
			return true;


		// if there is no match, try to give the user feedback

		// [a] first strategy: compare input with list
		//     and get the string with lowest edit distance
		//
		//     if it has a small edit distance (max 10)
		//     than return this analysis as a suggestion
		var aClosestAnalysisAndDistance = tagset.getClosestString(sInputTag);
		if (aClosestAnalysisAndDistance[1]<10)
			return aClosestAnalysisAndDistance[0];
		
		// [b] next strategy if the previous one failed
		//
		//     get the matching rule corresponding to the input, 
		//     so as to be able to give feedback to the user

		// get the main tags to compare with
		var aMainTags = tagset.aValidationRegex.keys();
		for (var i=0; i<aMainTags.length; i++){

			var sMainTag = aMainTags[i];
			var mainTagRe = new RegExp(sMainTag);

			// we have found a matching main tag
			if (mainTagRe.test(sInputTag)){

				// return the use as feedback
				return tagset.aDeclaration.get(sInputTag);
			}
		}

	}

	// [2] use the evaluation rules

	else {

		console.log("Evaluate by using the evluation rules");

		// if no features were given, stop right away (nothing to check...)
		if (sInputTag.indexOf("(")<0)
			return true;

		var sMatchingMainTag = '';

		// get the main tags to compare with
		var aMainTags = tagset.aValidationRegex.keys();
		for (var i=0; i<aMainTags.length; i++){

			var sMainTag = aMainTags[i];
			var mainTagRe = new RegExp(sMainTag);

			// we have found a matching main tag
			if (mainTagRe.test(sInputTag)){

				// remember which main tag was matching
				// (we'll use that in the feedback to the user, if the evaluation fails)
				sMatchingMainTag = sMainTag;

				// get the features
				var sFeatures = tagset.aValidationRegex.get(sMainTag);
				var featuresRe = new RegExp(sFeatures);

				// features are matching too
				if (featuresRe.test(sInputTag))
					return true;
			}
		}

		return tagset.aDeclaration.get(sMatchingMainTag);

	}
	
}


// given an input analysis,
// compare it to the items of the list of allowed analyses
// and give the closest equivalent in terms of edit distance
tagset.getClosestString = function(sInputTag){

	// get main tag part of input tag
	var sMainTag = sInputTag.indexOf("(")>-1 ? sInputTag.substring(0, sInputTag.indexOf("(")) : sInputTag;

	// here we'll store the closest match 
	var aAnalysesAndDistances = new Array();

	// get the list to compare with now
	var aList = tagset.aValidationList.keys();

	for (var i=0; i<aList.length; i++){
		
		// if the current allowed tag to be compared doesn't have the same main tag, skip to the next right away
		if (tagset.aValidationList.get(aList[i]) != sMainTag)
			continue;

		// if the current allowed tag being compared has the smallest edit distance to the input, store this solution
		var iThisDistance = cobutil.levenshteinDistance(aList[i], sInputTag);
		aAnalysesAndDistances.push([aList[i], iThisDistance]);
	}

	// if no match was found, return a bad result right away
	if (aAnalysesAndDistances.length == 0){
		return ["", 99999]
	}


	// sort the results, in such a way that the best matches are put on top
	aAnalysesAndDistances.sort(function(a, b){
		if (a[1] < b[1]) return -1;
		if (a[1] > b[1]) return 1;
		return 0;
	});

	// return best matches, with the smallest computed distance
	var iMinDistance = aAnalysesAndDistances[0][1];
	var aClosestAnalyses = new Array();
	for (var i=0; i<5; i++){
		aClosestAnalyses.push(aAnalysesAndDistances[i][0]);
	}
	var sClosestAnalyses = aClosestAnalyses.join("<BR>");	

	return [sClosestAnalyses, iMinDistance];
}


// Convert a possible wrongly cased main pos into proper case
tagset.setMainPosRight = function(sMainPos){

	// first thing to do in any case:
	// if the validation rules haven't been read yet, read them!
	if (tagset.aMainPos.isEmpty()){
		tagset.parseValidationRules();
	}

	var sCorrectedMainPos = tagset.aMainPos.get(sMainPos.toLowerCase());
	if (sCorrectedMainPos == null) 
		sCorrectedMainPos = sMainPos;
	return sCorrectedMainPos;
}

