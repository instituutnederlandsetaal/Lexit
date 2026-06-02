
var highlight = {};

// styling for annotations

highlight.aAnnotationColors = ["", 		// #0
                      "",
                      "#FF9000", 	// #2	A-annotation: Oranje [Default]
                      "#0000FF",	// #3	B-annotation: Blauw	
                      "#A52A2A",	// #4	C-annotation: Bruin	
                      "#000000",	// #5	D-annotation: Zwart 
                      "#DC143C",	// #6	E-annotation: Rood	
                      "#8B0000",	// #7	F-annotation: Donkerrood	
                      "#8B008B",	// #8	G-annotation: Paars	
                      "#008000",	// #9	H-annotation: Groen	
                      "#0066CC",	// #10	I-annotation
                      "#008000",	// #11	J-annotation
                      "#FF9000"]    // #12	K-annotation 

// trick: https://stackoverflow.com/questions/524696/how-to-create-a-style-tag-with-javascript
var docHead = document.head || document.getElementsByTagName('head')[0];
var style = document.createElement('style');
var css = 	"td.worktable span {border-radius: 7px; border-width: 2px; border-style: solid; padding: 0px; margin: 0px;}"+
			"td.worktable button.more_context_icon {border-radius: 0px; border-width: 0px;}"+
			"td.worktable span.A_annotation {border-color: "+highlight.aAnnotationColors[2]+";}"+ 
			"td.worktable span.B_annotation {border-color: "+highlight.aAnnotationColors[3]+";}"+ 
			"td.worktable span.C_annotation {border-color: "+highlight.aAnnotationColors[4]+";}"+ 
			"td.worktable span.D_annotation {border-color: "+highlight.aAnnotationColors[5]+";}"+ 
			"td.worktable span.E_annotation {border-color: "+highlight.aAnnotationColors[6]+";}"+ 
			"td.worktable span.F_annotation {border-color: "+highlight.aAnnotationColors[7]+";}"+ 
			"td.worktable span.G_annotation {border-color: "+highlight.aAnnotationColors[8]+";}"+ 
			"td.worktable span.H_annotation {border-color: "+highlight.aAnnotationColors[9]+";}"+ 
			"td.worktable span.I_annotation {border-color: "+highlight.aAnnotationColors[10]+";}"+ 
			"td.worktable span.J_annotation {border-color: "+highlight.aAnnotationColors[11]+";}"+ 
			"td.worktable span.annotation_outer {z-index: 10; padding: 4px 0px;}"+
			"td.worktable span.annotation_begin {border-right:0px; border-top-right-radius: 0px; border-bottom-right-radius: 0px;}"+
			"td.worktable span.annotation_end {border-left: 0px; border-top-left-radius: 0px; border-bottom-left-radius: 0px;}"+
			"td.worktable span.annotation_begin_end {}"+ // single chart attestations
			"td.worktable span.annotation_overlap {border-left: 0px; border-top-left-radius: 0px; border-bottom-left-radius: 0px; border-right:0px; border-top-right-radius: 0px; border-bottom-right-radius: 0px;}"+
			"td.worktable span.annotation_spacing {border: 0px; word-spacing:-10px;}"+
			"";


// append styling to document

docHead.appendChild(style);
style.type = 'text/css';
if (style.styleSheet){
  // This is required for IE8 and below.
  style.styleSheet.cssText = css;
} else {
  style.appendChild(document.createTextNode(css));
}



// ------------------------------------------------
// highlighting functions 
// ------------------------------------------------


// tricks: 
// https://stackoverflow.com/questions/9377964/styling-overlapping-annotations-in-text-with-html-span-tags-and-css
// http://jsfiddle.net/Bb62u/297/
highlight.putHighlightOnOneRow = function(oRow, sColumnName, sOnsetOffsetColumn, sAnnotationTypeColumn) {
	
	var sQuote =	fx.getDataFromCellInRow(oRow, sColumnName);
	sQuote = 		fn.removeHighlight(sQuote);
	
	// get the position pairs (x,y|x,y|...)
	var sAllPositionPairs = fx.getDataFromCellInRow(oRow, sOnsetOffsetColumn);
	// get the annotation colors
	var sAllAnnotationColors = fx.getDataFromCellInRow(oRow, sAnnotationTypeColumn);
	
	if (sAllPositionPairs != "-" && sAllPositionPairs != ''){
				
		// ----------------------------------------------------------
		// parse out index data
		// ----------------------------------------------------------
		
		// build array of position pairs
		var aAllPairs = sAllPositionPairs.split(sOnsetOffsetSeparator);		
		// build array of colors
		var aAllColors = sAllAnnotationColors.split(sAnnotationsSeparator);
		
		var aNewPairsArray = new Array();
		var aNewAnnotationsArray = new Array();
		for (var i=0; i<aAllPairs.length; i++){			
			var onePair = aAllPairs[i].split(",");
			var oneColor = aAllColors[i];
			
			var iStartIndex = parseInt(onePair[0]);
			var iEndIndex   = parseInt(onePair[1]);
			
			if (iStartIndex<iEndIndex){
				aNewPairsArray.push( [iStartIndex, iEndIndex] );
				aNewAnnotationsArray.push( oneColor );
			}
		}
		
		
		// ----------------------------------------------------------
		// now build a grid of the full context, with all markings in it
		// ----------------------------------------------------------
		
		// first the empty grid
		var aaAnnotationsAtPosition = new Array();
		
		for (var i=0; i<sQuote.length; i++){
			aaAnnotationsAtPosition[i] = new Array();
		}
		
		// then loop through the index pairs and
		// add the color code of each pair at each position of the grid 
		for (var j=0; j<aNewPairsArray.length; j++){
			
			// get pair of start and end indexes
			// and the annotation between thoses indexes
			
			var startPos =	(typeof aNewPairsArray[j][0]=='number') ?	aNewPairsArray[j][0] : parseInt(aNewPairsArray[j][0]);
			var endPos = 	(typeof aNewPairsArray[j][1]=='number') ?	aNewPairsArray[j][1] : parseInt(aNewPairsArray[j][1]);
			var sAnnotation = aNewAnnotationsArray[j];
			
			// register the annotation at each position between those indexes
			
			// check if the range already contains some annotation
			var bOuter = false;

			for (var k = startPos; k < endPos; k++){
				if ((aaAnnotationsAtPosition[k]).length > 0 && 
						!(aaAnnotationsAtPosition[k])[0].includes("annotation_outer"))
					bOuter = true;
			}
			
			for (var k = startPos; k < endPos; k++) {
				var sFullAnnotation = "";
				// annotation on one single char, so it starts and ends immediately
				if (k == startPos && k == endPos-1)
					sFullAnnotation = "annotation_begin_end " + (bOuter ? "annotation_outer ":"") + sAnnotation;
				// annotation starts
				else if (k == startPos)
					sFullAnnotation = "annotation_begin " + (bOuter ? "annotation_outer ":"") + sAnnotation;
				// annotation end
				else if (k == endPos-1)
					sFullAnnotation = "annotation_end " + (bOuter ? "annotation_outer ":"") + sAnnotation;
				// annotation half way
				else
					sFullAnnotation = (bOuter ? "annotation_outer ":"") + sAnnotation;
				
				// add the annotation to the Array of all annotations at current position
				(aaAnnotationsAtPosition[k]).push(sFullAnnotation);
				(aaAnnotationsAtPosition[k]).sort();
			}
		}
		
		// ----------------------------------------------------------
		// now loop through the grid, and at each position where the annotations combination changes,
		// close the span, and open a new one with the new annotations combination
		// ----------------------------------------------------------
		
		var aSpansAtPosition = new Array();
		var iLastNumberOfOpeningSpans = 0;
		
		for (var positionInQuote=0; positionInQuote<sQuote.length; positionInQuote++){

			var sSpansAtCurrentPosition = "";
			var aFullAnnotationsAtCurrentPos = aaAnnotationsAtPosition[positionInQuote];
			
			
			// having a full annotation containing 'annotation_begin' or 'annotation_end'
			// means a change: 
			// we have to close the previous spans and open new ones
			
			var bChange = false;
			
			for (var annotationLayer = 0; annotationLayer < aFullAnnotationsAtCurrentPos.length; annotationLayer++){
				if (aFullAnnotationsAtCurrentPos[annotationLayer].match(".*annotation_(begin|end).*")){
					bChange = true;
				}
			}
			
			// other possible change: we have opened spans, but we reached a position 
			// with a smaller number of annotations, implicitly meaning that those spans should be closed now  
			
			if (iLastNumberOfOpeningSpans > 0 && aFullAnnotationsAtCurrentPos.length < iLastNumberOfOpeningSpans)
				bChange = true;
			
			// we have a change!
			
			if (bChange){				

				// close all opened spans
				for (var annotationLayer = 0; annotationLayer < iLastNumberOfOpeningSpans; annotationLayer++){
					sSpansAtCurrentPosition += "</span>";
				}
				
				// open new spans
				for (var annotationLayerNr = 0; annotationLayerNr < aFullAnnotationsAtCurrentPos.length; annotationLayerNr++){

					var sAnnotationAtCurrentPos = aFullAnnotationsAtCurrentPos[annotationLayerNr];
					
					if ( !sAnnotationAtCurrentPos.match(".*annotation_(begin|end).*") )
						sAnnotationAtCurrentPos = "annotation_overlap " + sAnnotationAtCurrentPos;
					
					sSpansAtCurrentPosition += "<span class='" + sAnnotationAtCurrentPos + "'>";
				}

				// remember the number of opened spans for the next round
				iLastNumberOfOpeningSpans = aFullAnnotationsAtCurrentPos.length;
			}
						
			
			aSpansAtPosition[positionInQuote] = sSpansAtCurrentPosition;
		}
		
		// when we're finished, close the remaining opened spans
		
		var sEndOfQuote = "";
		for (var j = 0; j < iLastNumberOfOpeningSpans; j++){
			sEndOfQuote += "</span>";
		}
		
		// ----------------------------------------------------------
		// put markings into string
		// ----------------------------------------------------------
		
		for (var charPositionInQuote=sQuote.length-1; charPositionInQuote>=0; charPositionInQuote--){
			sQuote = sQuote.substring(0, charPositionInQuote) + aSpansAtPosition[charPositionInQuote] + sQuote.substring(charPositionInQuote);
		}
		sQuote = sQuote + sEndOfQuote;

	}
		
	// ----------------------------------------------------------
	// put the string back into the table
	// ----------------------------------------------------------
	
	fx.putDataIntoCell(oRow, sColumnName, sQuote);
};


