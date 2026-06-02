
var cobutil = {};


/**
 * Join an array, remove double spaces and trim the string
 * 
 * @param aStr
 * @param sSeparator
 * @returns
 */
cobutil.joinTrim = function(aStr, sSeparator){
	
	if (sSeparator == null)
		sSeparator = " ";

	if (typeof aStr.length == 'undefined'){
		var aNewStr = new Array();
		for (var key in aStr) {			
			if (aStr[key] != null)
				aNewStr.push(aStr[key])
		}
		
		return aNewStr.join(sSeparator).replace(/ +/g, " ").trim();
	}
	
	return aStr.join(sSeparator).replace(/ +/g, " ").trim();	
}

cobutil.slice = function(aStr, begin, end){

	var aNewStr = new Array();
	for (var key in aStr) {
		if (key>=begin && ( key<end || end == null))
			aNewStr.push(aStr[key])
	}
	return aNewStr;
}


/**
 * Remove null from array
 * 
 * @param aStr
 * @returns
 */
cobutil.noNull = function(aStr){
	return aStr.filter(function (el) {
	  return el != null;
	});
}



/**
 * Make sure an array only contains unique values
 * 
 * @param value
 * @param index
 * @param self
 * @returns {Boolean}
 */
cobutil._onlyUnique = function(value, index, self) { 
    return self.indexOf(value) === index;
}

/**
 * Remove doubles from an array
 * 
 * @param array
 * @returns
 */
cobutil.getOnlyUniqueValues = function(array){
	return array.filter( cobutil._onlyUnique );
}



/**
 * Build an associative array
 * given a string and separators
 * 
 * @param sString
 * @param sPrimarySeparator		(separates the pairs)
 * @param sSecundarySeparator	(separates the key and value within a pair)
 * @returns {___anonymous1207_1208}
 */
cobutil.buildAssociativeArray = function(sString, sPrimarySeparator, sSecundarySeparator){
	
	var oArr = {};
	
	var aArr = sString.split(sPrimarySeparator);
	for (var i=0; i<aArr.length; i++)
		{
		var aKeyAndValue = (aArr[i]).split(sSecundarySeparator);
		var sKey =		aKeyAndValue[0];
		var sValue =	aKeyAndValue[1];
		
		oArr[sKey] = sValue;
		}
	
	return oArr;
}


/**
 * Escape chars in blacklab query argument
 */
cobutil.escapeQueryChars = function(str){
	var specials = new RegExp("[\^\$#\<\".*+?|()\\[\\]{}\\\\]", "g"); // ".*+?|()[]{}\
	return str.replace(specials, "\\$&");
};





/**
 * Split version for database array types gotten from Database
 */
$.fn.splitCellArray = function(sSeparator){
	
	return this.replaceAll("[{}]", "").split(sSeparator);
}


cobutil.messageInHeader = function(sTableName, sMessage){
	
	$("#"+sTableName+"_wrapper .top").find("#msgdiv").remove();
	$("#"+sTableName+"_wrapper .top").append(
			$("<div></div>")
			.attr("id", "msgdiv")
			.css("width", "200px")	
			.css("text-align", "center")			
			.css("color", "black")
			.append($("p").css("text-decoration", "none")
				)
			);
	
	$("#"+sTableName+"_wrapper .top #msgdiv").append(
			$("<span></span>")
			.html(sMessage)
			.css("font-size", "120%")
			);
	
	$("#"+sTableName+"_wrapper .top #msgdiv")
	.css("border", "1px dotted black")
	.css("position", "relative")
	.css("top", "10px")
	.css("left", "210px");
}



//get an array of row ids of selected rows
cobutil.getIdsOfSelectedRows = function(sTableName){
	
	var aSelectedRows = fn.getSelectedRowNodesFrom(sTableName);
	var aRowIds = new Array();	
	
	$(aSelectedRows).each(function(){										
		var thisRow = this;										
		aRowIds.push( fn.getRowNodeId(thisRow) );	// gather row id's										
	});
	
	return aRowIds;
}

// create a array with a give size, in which each element has the same given value (or null)
cobutil.createArrayWithSize = function(iSize, value){

	var aArr = new Array();
	for (var i=0; i<iSize; i++){
		aArr.push(value);
	}
	return aArr;
}


// get levenshtein distance between two string
//
// adapted from https://www.tutorialspoint.com/levenshtein-distance-in-javascript
cobutil.levenshteinDistance = function(str1, str2){

   const track = Array(str2.length + 1).fill(null).map(() =>
   Array(str1.length + 1).fill(null));
   for (let i = 0; i <= str1.length; i += 1) {
      track[0][i] = i;
   }
   for (let j = 0; j <= str2.length; j += 1) {
      track[j][0] = j;
   }
   for (let j = 1; j <= str2.length; j += 1) {
      for (let i = 1; i <= str1.length; i += 1) {
         const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
         track[j][i] = Math.min(
            track[j][i - 1] + 1, // deletion
            track[j - 1][i] + 1, // insertion
            track[j - 1][i - 1] + indicator // substitution
         );
      }
   }
   return track[str2.length][str1.length];
};


// easy conversion of duration into human readable format
cobutil.msToTime = function(duration) {

	var years = Math.floor((duration / (1000 * 60 * 60 * 24 * 365)));	
	if (years>0) return years + " year"+ (years>1 ? "s" : "" );

	var months = Math.floor((duration / (1000 * 60 * 60 * 24 * 31)) % 12);
	if (months>0) return months + " month"+ (months>1 ? "s" : "" );
	
	var days = Math.floor((duration / (1000 * 60 * 60 * 24)) % 31);
	if (days>0) return days + " day"+ (days>1 ? "s" : "" );
	
	var hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
	if (hours>0) return hours + " hour"+ (hours>1 ? "s" : "" );
	
	var minutes = Math.floor((duration / (1000 * 60)) % 60);
	if (minutes>0) return minutes + " minute"+ (minutes>1 ? "s" : "" );
	
	var seconds = Math.floor((duration / 1000 ) % 60);
	if (seconds>0) return seconds + " second"+ (seconds>1 ? "s" : "" );	
	
	return null;
};



