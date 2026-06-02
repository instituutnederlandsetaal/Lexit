
var tfn = {};


/**
 * Save some content to the clipboard
 * @param {*} someText 
 */
tfn.saveToClipboard = function(someText){

	// put text into an invisible textarea
	var tmpTextArea = $("<textarea></textarea>").attr("id", "save_to_clipboard").text(someText);
	$("#temporary_stuff").append(tmpTextArea); // exists by default in lexit 

	// and select it!

	var copyChar = $('#save_to_clipboard');
	copyChar.select();

	try {

		// now copy it to clipboard
		document.execCommand('copy');

		// remove temporary textarea
		$("#save_to_clipboard").remove();
	}
	catch (err) {
		console.log("Saving input into clipboard failed.");
	}
};


/**
 * Refresh all tables
 * This function is typically called after a search operation
 * 
 * This make sure that all tables are refreshed (meaning: ensure that the content loaded by a database function is shown at last)
 * and also sets the worktable back to page 1.

 * @param {*} fnCallback 
 */
tfn.refreshAllTables = function(fnCallback){
	
	console.log("Refresh all tables");

	// before refreshing: make sure we always get exact count (otherwise some results might be hidden)
	fn.forceExactCount();
	
	// show loaded content (t.i. search results) at page 1
	mt.getDataTableObjectOf("worktable").page( 0 );
	fn.refreshTable("worktable");
	fn.refreshTable("wordforms", function(){
		if (fnCallback != null) fnCallback();
	});
};


/**
 * Keep the worktable visible, t.i. compute if it's gotten out of sight, 
 * and if it is, scroll to it. 
 */
tfn.keepWorktableInSight = function(){

	// if the worktable is out of sight, scroll to it 

	var iPositionOfBottomOfScreen = parseInt( $(window).height() + window.scrollY ); 
	var iPositionOfWorktable = parseInt( $("#worktable_dynamic").css("top") ) + parseInt( $("#worktable_dynamic div.top").css("height") );
	if ( iPositionOfBottomOfScreen < iPositionOfWorktable )
		fn.scrollToTable("worktable");
}


/**
 * Change the width of a table.
 * We need this when switching between [wordforms view] and [wordforms + lemmata view] in the GUI
 * 
 * @param {*} sTableName 
 * @param {*} sWidth 
 * @param {*} fnFunction : callback to be applied afterwards 
 */
tfn.changeTableWidth = function(sTableName, sWidth, fnFunction){
	
	if (typeof sTableName == 'object')
		sTableName = fn.getTableName(sTableName);
	
	//read current filters so we can re-apply those
	var oFilterSettings = mt.getDataTableObjectOf(sTableName).getSearchFilters();
	var iCurrentLeft =		$("#"+sTableName+"_dynamic").offset().left;
	var iCurrentTop = 		$("#"+sTableName+"_dynamic").offset().top;
	var iDisplayLength =	fn.getCurrentDisplayLength(sTableName);
	var iRecordNumberToStartAt = parseInt(fn.getCurrentDisplayStart(sTableName));	
	var aSortingSettings = 	mt.getDataTableObjectOf(sTableName).order();

	// we want to be able to put the table back at the very same place
	var oExtraSettings = {
			"top": iCurrentTop, 
			"left": iCurrentLeft,
			"width": sWidth,
			"displaylength": iDisplayLength
	};	

	tb.destroyTable(sTableName, function(){
		
		fn.callDatabase(sTableName, 
				oFilterSettings,		// re-apply the filters 
				function(){
			
					// small delay needed otherwise this will be fired too early and the following won't work
					$("#"+sTableName).delay(200).queue(function(){
						
						// restore sorting settings
						if (aSortingSettings.length==0) 
							mt.getDataTableObjectOf(sTableName).order.neutral();
						else
							mt.getDataTableObjectOf(sTableName).order(aSortingSettings);
						
						// put table back at same page
						mt.getDataTableObjectOf(sTableName)
							.displayRow(iRecordNumberToStartAt)
							.draw(false);
						
						// callback if available
						if (fnFunction!= null)
							fnFunction();
						
					});					
					
				}, 
				oExtraSettings
		);
	});
};



/**
 * Extract the analysis the user has clicked upon, within a string with pipe separated analyses
 * 
 * @param {*} n : cell node clicked upon
 */
tfn.getAnalysisClickedUpon = function(n){
	
	var sAllAnalyses = fn.getDataFromCellNode(n); // don't remove tags here, otherwise the function won't work properly
	var oAnalysis = fn.getWordClickedUponInNode(n);
	
	var iLastSeparatorBefore = sAllAnalyses.substring(0, oAnalysis.start).lastIndexOf(sAnalysesSeparator);
	var iRealStart = iLastSeparatorBefore + ( iLastSeparatorBefore < 0 ? 1 : sAnalysesSeparator.length );
	
	var iRealEnd = sAllAnalyses.indexOf(sAnalysesSeparator, oAnalysis.end);
	if (iRealEnd<0) iRealEnd = sAllAnalyses.length;
	
	return removeTags( sAllAnalyses.substring(iRealStart, iRealEnd) );
	
};


//
// 
// 
// 
//
/**
 * Parse the output of the cobalt database function which gives the most frequent
 * analyses in the worktable, into a 2-dimensional array
 * 
 * @param {*} sAnalyses : database output
 * @returns [ [analysis-string, analysis-IDs ], [analysis-string, analysis-IDs], ... ]
 */
tfn.parseFrequentAnalyses = function(sAnalyses){

	// split into single analyses
	var aAllAnalyses = sAnalyses.split("@@@");
	
	var aaAllAnalyses = new Array();
	for (var i=0; i<aAllAnalyses.length; i++)
		{
		// parse and check integrity of output (we expect: analysis + its ID)
		var aAnalysisAndId = aAllAnalyses[i].split("###");
		if (aAnalysisAndId == null || aAnalysisAndId.length < 2)
			break;
		
		var sOneAnalysis = 		aAnalysisAndId[0];
		var sOneAnalysisID = 	aAnalysisAndId[1];
		aaAllAnalyses.push( [sOneAnalysis, sOneAnalysisID] );
		}
	
	return aaAllAnalyses;
};

