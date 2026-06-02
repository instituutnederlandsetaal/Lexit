
var molexutils = {};

/**
 * Compute the remaining time of a process, given the start time (iStartTimeInMillisec), 
 * and the number of steps already done (iLoaded) 
 * and the total number of steps to be done (iToBeLoaded).
 */
molexutils.getTimeLeft = function(iStartTimeInMillisec, iLoaded, iToBeLoaded){

	var iCurrentTime = new Date().getTime();
	var iElapsedTime = iCurrentTime - iStartTimeInMillisec;

	var iTotalTime = iToBeLoaded * (iElapsedTime / iLoaded);
	var iRemainingTime = iTotalTime - iElapsedTime;

	var iMinutes = Math.floor((iRemainingTime % (1000 * 60 * 60)) / (1000 * 60));
	var iSeconds = Math.floor((iRemainingTime % (1000 * 60)) / 1000);
	var sRemainingTime = right("0"+iMinutes, 2)+":"+right("0"+iSeconds, 2);

	return (iRemainingTime > 0 ? sRemainingTime : "unknown");
};





 molexutils.readAvailableTags = function(){

	var url = WEBSERV_URL+"/api/get_unique_values";
	$.ajax( {
		"type": "GET",
		"async": false, // needed to block code execution while awaiting the server response
		"url": url,
		"data": {
			"db_name": getHttpParams().get("db"),
			"table_name": "lemmata",
			"column_name": "tags",
			"dummy": getUniqueNumber()
			},
		"dataType": "xml", // get response as xml
		"success": function(xml) {		

			var aUniqueTags = td._getUniqueValues(xml);
			aAvailableTags = new Array();

			// remove empty values from array
			if (aUniqueTags.indexOf("^$")>=0)
				aUniqueTags.splice(aUniqueTags.indexOf("^$"), 1);

			for (var i=0; i<aUniqueTags.length; i++){

				// push multiple values as single values
				if (aUniqueTags[i].indexOf("; ")>=0){

					var mulitpleTags = (aUniqueTags[i]).split("; ");
					aAvailableTags.push(...mulitpleTags);
				}
				// push single value
				else {
					aAvailableTags.push(aUniqueTags[i]);
				}

			}

			aAvailableTags = getOnlyUniqueValues(aAvailableTags);
			aAvailableTags.sort();

			},
		"error": function(jqXHR, textStatus, errorThrown){
			fn.message("Fout in readAvailableTags()", "Er is een fout opgetreden op het inlezen van de beschikbare tags: "+
				textStatus+" "+errorThrown);
			}
	} );
};
