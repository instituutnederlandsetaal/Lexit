

// SPINNER (Internet Explorer proof)!
// this is needed because IE can't show animated gifs during Ajax calls in some circumstances
// see: http://fgnass.github.com/spin.js/

function showSpinner(target){
	var opts = {
			  lines: 13, // The number of lines to draw
			  length: 7, // The length of each line
			  width: 4, // The line thickness
			  radius: 10, // The radius of the inner circle
			  corners: 1, // Corner roundness (0..1)
			  rotate: 0, // The rotation offset
			  color: '#000', // #rgb or #rrggbb
			  speed: 1, // Rounds per second
			  trail: 60, // Afterglow percentage
			  shadow: false, // Whether to render a shadow
			  hwaccel: false, // Whether to use hardware acceleration
			  className: 'spinner', // The CSS class to assign to the spinner
			  zIndex: 2e9, // The z-index (defaults to 2000000000)
			  top: 'auto', // Top position relative to parent in px
			  left: 'auto' // Left position relative to parent in px
			};
	
	$(target).spin(opts);
};
function removeSpinner(){
	$(".spinner").remove();
};

// added for user withing jQuery
$.fn.spin = function(opts) {
	  this.each(function() {
	    var $this = $(this),
	        data = $this.data();

	    if (data.spinner) {
	      data.spinner.stop();
	      delete data.spinner;
	    }
	    if (opts !== false) {
	      data.spinner = new Spinner($.extend({color: $this.css('color')}, opts)).spin(this);
	    }
	  });
	  return this;
	};
	
// END OF SPINNER
	
	
// Pre-bind function: bind a handler to some event, before all other handlers of the same event
// (see: http://stackoverflow.com/questions/6029251/jquery-bind-event-listener-before-another)
//
// usage: $('#button').preBind('click', function() {
//	  console.log('hello');
//  });
	
$.fn.preBind = function (type, data, fn) {
    this.each(function () {
        var thisSelector = $(this);

        thisSelector.bind(type, data, fn);

        var currentBindings = thisSelector.data('events')[type];
        if ($.isArray(currentBindings)) {
            currentBindings.unshift(currentBindings.pop());
        }
    });
    return this;
};




// prevent or allow text selection
jQuery.fn.extend({ 
        disableSelection : function() {
        	$(this).attr('unselectable', 'on').css('MozUserSelect', 'none'); 
        } 
}); 

jQuery.fn.extend({ 
		enableSelection : function() { 
			$(this).attr('unselectable', 'off').css('MozUserSelect', 'auto'); 
    }	 
}); 


// Get a different (eg. darker) shade, given a hex color code
// usage: var newColor = shadeColor("#AA2222", -10);
// see: http://stackoverflow.com/questions/3403882/javascript-one-shade-darker
function shadeColor(color, shade) {
    var colorInt = parseInt(color.substring(1),16);

    var R = (colorInt & 0xFF0000) >> 16;
    var G = (colorInt & 0x00FF00) >> 8;
    var B = (colorInt & 0x0000FF) >> 0;

    R = R + Math.floor((shade/255)*R);
    G = G + Math.floor((shade/255)*G);
    B = B + Math.floor((shade/255)*B);

    var newColorInt = (R<<16) + (G<<8) + (B);
    var newColorStr = "#"+newColorInt.toString(16);

    return newColorStr;
}





// convert RGB color to HEX and back
// see: http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}
function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}
function rgbStrToHex(rgb) {
	rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (rgb == null)
    	return "#ffffff";
    function hex(x) {
        return ("0" + parseInt(x).toString(16)).slice(-2);
    }
    return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
}




// Name: createXMLDocument
// Input: String
// Output: XML Document
jQuery.createXMLDocument = function(string)
{
var browserName = navigator.appName;
var doc;
if (browserName == 'Microsoft Internet Explorer')
	{
	doc = new ActiveXObject('Microsoft.XMLDOM');
	doc.async = 'false';
	doc.loadXML(string);
	} 
else 
	{
	doc = (new DOMParser()).parseFromString(string, 'text/xml');
	}
return doc;
};



// clear screen selections
function clearSelection() {
    if ( document.selection ) {
        document.selection.empty();
    } else if ( window.getSelection ) {
        window.getSelection().removeAllRanges();
    }
}


// js-implementation of indexOf(regex, start) and lastIndexOf(regex, start)
//                      ---------------------     -------------------------
// http://stackoverflow.com/questions/273789/is-there-a-version-of-javascripts-string-indexof-that-allows-for-regular-expr
String.prototype.regexIndexOf = function(regex, startpos) {
    var indexOf = this.substring(startpos || 0).search(regex);
    return (indexOf >= 0) ? (indexOf + (startpos || 0)) : indexOf;
};

String.prototype.regexLastIndexOf = function(regex, startpos) {
    regex = (regex.global) ? regex : new RegExp(regex.source, "g" + (regex.ignoreCase ? "i" : "") + (regex.multiLine ? "m" : ""));
    if(typeof (startpos) == "undefined") {
        startpos = this.length;
    } else if(startpos < 0) {
        startpos = 0;
    }
    var stringToWorkWith = this.substring(0, startpos + 1);
    var lastIndexOf = -1;
    var nextStop = 0;
    while((result = regex.exec(stringToWorkWith)) != null) {
        lastIndexOf = result.index;
        regex.lastIndex = ++nextStop;
    }
    return lastIndexOf;
};


// string functions 'left' and 'right'
function left(str, n){
	if (n <= 0)
	    return "";
	else if (n > String(str).length)
	    return str;
	else
	    return String(str).substring(0,n);
}
function right(str, n){
    if (n <= 0)
       return "";
    else if (n > String(str).length)
       return str;
    else {
       var iLen = String(str).length;
       return String(str).substring(iLen, iLen - n);
    }
}




// get the smallest value of an array
// see: http://www.javascriptkit.com/javatutors/arraysort.shtml
function getTheLowestPositive(arr){
	
	var positiveArr = new Array();
	// gather the positive values only
	for (var i=0; i<arr.length; i++)
		{
		if (arr[i]>=0)
			positiveArr.push(arr[i]);
		}
	// sort the positive values in numerical order
	positiveArr.sort(function(a,b){return a - b;});
	
	// return the lowers value
	return positiveArr[0];
}



//*******************************************************

/*
 * ARRAY FUNCTIONS
 */


// check array equality
function arrays_equal(a,b) { 
	return !(a<b || b<a); 
}

// get a clone of an array
// http://stackoverflow.com/questions/565430/deep-copying-an-array-using-jquery
function cloneArray(arr){
	return $.extend(true, new Array(), arr);
}

// clone an object
// USE: var newObj = new cloneObject(oldObj)
//                ===
function cloneObject(source) {
 for (i in source) {
     if (typeof source[i] == 'source') {
         this[i] = new cloneObject(source[i]);
     }
     else{
         this[i] = source[i];
     }
 }
}

// count the number of members of an object
// see: http://stackoverflow.com/questions/956719/number-of-elements-in-a-javascript-object
function countProperties(obj) {
    var count = 0;

    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            ++count;
    }

    return count;
}

/*
 * RELIABLE ARRAY DETECTION 
 * 
 * source: http://stackoverflow.com/questions/1058427/how-to-detect-if-a-variable-is-an-array
 */

// check if an object is an array 
// (since typeof .. == 'array') is not reliable
function isArray(obj){
        return Object.prototype.toString.call(obj) === '[object Array]';
};

// recognize iterable (ie non-empty) array-like objects
function isNonEmptyArrayLike(obj) {
    try { // don't bother with 'typeof' - just access 'length' and 'catch'
        return obj.length > 0 && '0' in Object(obj);
    }
    catch(e) {
        return false;
    }
};


/*
 * sort array of array
 * 
 * see: http://stackoverflow.com/questions/5435228/sort-an-array-with-arrays-in-it-by-string
 */

function Comparator(a,b){
	if (a[0] < b[0]) return -1;
	if (a[0] > b[0]) return 1;
	return 0;
};

function sortArrayOfArray(myArray){

	myArray = myArray.sort(Comparator);
	return myArray;
};



// make sure an array only contains unique values
function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
}

function getOnlyUniqueValues(array){
	return array.filter( onlyUnique );
}



//*******************************************************



// ESCAPE CHARS functions

function getEscape(str){
	if (str.indexOf("'")>-1 )
		return str.replace(/\'/g, "\\'");
	return str.replace(/\"/g, "\\\"");
};

function quote(str){
	return "'"+getEscape(str)+"'";
};

// Escape regular expression characters in a string 
// see: http://snipplr.com/view/9649/
//      http://stackoverflow.com/questions/280793/case-insensitive-string-replacement-in-javascript
function escapeRegexChars(str){
	var specials = new RegExp("[.*+?|()\\[\\]{}\\\\]", "g"); // .*+?|()[]{}\
	return str.replace(specials, "\\$&");
};




// given a main string in which a substring was found at a given index
// compute the true start and end indexes in the same string containing html entitie 
function getTrueIndexes(mainString, selection, selectionStartIndex){
	
	// First change all html-entitie names into tags, so we will only have to deal with taglike things
	
	// This changes  Hij heet Napol&eacute;on
	//         into  hij heet napolD<~~~~~>on
	// so each character keeps its original position in the string
	
	mainString = mainString.toLowerCase().replace( /(&)(ldquor|rdquo|mdash|quot|apos|amp|lt|gt|nbsp|iexcl|cent|pound|curren|yen|brvbar|sect|uml|copy|ordf|laquo|not|shy|reg|macr|deg|plusmn|sup2|sup3|acute|micro|para|middot|cedil|sup1|ordm|raquo|frac14|frac12|frac34|iquest|times|divide|thorn|szlig|agrave|aacute|acirc|aelig|atilde|auml|aring|aelig|ccedil|egrave|eacute|ecirc|euml|igrave|iacute|icirc|iuml|eth|ntilde|ograve|oacute|ocirc|oelig|otilde|ouml|oslash|ugrave|uacute|ucirc|uuml|yacute|thorn|yuml|rdquo|ldquo)(;)/gi, 
			function ($0, $1, $2, $3) {
	    return "D<" + (new Array($2.length).join("~")) + ">" ;
	}); // D for dummy char, replacing the entity char
	
	var newSelectionStartIndex = computeTrueIndex(mainString, selectionStartIndex);
	var newSelectionEndIndex   = computeTrueIndex(mainString, selectionStartIndex + (selection.length-1));
	
	return {
		"start": newSelectionStartIndex,
		"end": newSelectionEndIndex+1
	};
}

// subfunction of getTrueIndexes(...)
function computeTrueIndex(mainString, incorrectIndex){
	
	var indexCorrection = 0;
	var indexWithoutTags = -1;
	var withinTag = false;
	
	for (var i=0; i<mainString.length; i++)
		{		
		var currentChar = mainString.charAt(i);
		if (currentChar=="<") 
			withinTag = true;
		
		if (withinTag) indexCorrection++;
		else indexWithoutTags++;
		
		// if we have reached the expected index, we are finished
		if (indexWithoutTags >= incorrectIndex &&
				// withinTag=true can happen when incorrectIndex=0,
				// that is: when the mainString begint with a tag 
				// and the selection starts right after this tag.
				!withinTag && 
				// we can't break when we encounter a Dummy
				// since the following characters are its code (in the original string)
				currentChar!='D')
			break;		
			
		if (currentChar==">") withinTag = false;	
		}
	
	return incorrectIndex + indexCorrection;
}



// scroll smoothly to a given anchor within a given div
function smoothScroll(div, anchor)
{
	
	// get the offset (currentPos) and the number of pixels  
	// to add or subtract from the offset 
	// (in case we need to subtract, the value to add will
	//  be negative) 
	var currentYPos = $(div).scrollTop();
	var currentXPos = $(div).scrollLeft();
	var yTtarget = $(anchor).position().top;	
	var xTtarget = $(anchor).position().left;
	var yToGo = currentYPos+(yTtarget-currentYPos);
	var xToGo = currentXPos+(xTtarget-currentXPos);
	
	// Go to the anchor by resetting the scrollbar position
	// But we will scroll horizontally only if the anchor is also horizontally outside the screen
	// (t.i. not only vertically)
	if ((xTtarget-currentXPos) > 0 && (xTtarget-currentXPos) < screen.width)
		$(div).animate({scrollTop:yToGo}, 800);
	else
		$(div).animate({scrollTop:yToGo, scrollLeft:xToGo}, 800);
}


// get unique number to be added as an arg to http-requests
// to make sure IE will never use its cache
function getUniqueNumber(){
	return new Date().getTime();
}


// remove html tags from a string
function removeTags(text){
	if (typeof text == 'string')
		return text.replace(/<\/?[^>]+(>|$)/g, "");
	return text;
	
}

// remove all characters that are no letters nor digits
function keepOnlyLettersAndDigits(str){
	return str.replace(/([^\w\d])/gi, "");
}

// remove spaces from a file name and replace it by an underscore
function processFileName(text){
	if (typeof text == 'string')
		return text.replace(/\s/g, "_");
	return text;
}


// get http parameters into a hashtable object
function getHttpParams(){
	
	var paramsHash = new Hashtable();
	
	// check if we have parameters
	var origURL = decodeURI(document.URL);
	var startPosOfParameters = origURL.indexOf("?");
	if (startPosOfParameters<0)
		return null;
	
	// get the parameters pairs
	var allParams = origURL.substring(startPosOfParameters+1, origURL.length);
	var paramsPairs = allParams.split("&");
	
	
	if (paramsPairs == null || paramsPairs.length==0)
		return null;
	
	// put the parameters pairs in a hashmap
	for (var i=0; i<paramsPairs.length; i++)
		{
		var paramName  = paramsPairs[i].split("=")[0];
		var paramValue = paramsPairs[i].split("=")[1];

		paramsHash.put(paramName, paramValue);
		}
	
	return paramsHash;
};



// reduced version of the patched jquery plugin jquery-fieldselection
// that places the cursor at the end of the text (by default)
// BEWARE: somehow the full plugin is not compatible with this piece of software
//         so it is better to stick to this reduced version, which works well
// see: http://stackoverflow.com/questions/794583/deselect-contents-of-a-textbox-with-javascript
(function() {
	var fieldSelection = {
	    setSelection: function() {
	        var e = (this.jquery) ? this[0] : this, len = this.val().length ;
	        var args = arguments[0] || {"start":len, "end":len};
	        /* mozilla / dom 3.0 */
	        if ('selectionStart' in e) {
	            if (args.start != undefined) {
	                e.selectionStart = args.start;
	            }
	            if (args.end != undefined) {
	                e.selectionEnd = args.end;
	            }
	            e.focus();
	        }
	        /* exploder */
	        else if (document.selection) {
	            e.focus();
	            var range = document.selection.createRange();
	            if (args.start != undefined) {
	                range.moveStart('character', args.start);
	                range.collapse();
	            }
	            if (args.end != undefined) {
	                range.moveEnd('character', args.end);
	            }
	            range.select();
	        }
	        return this;
	    }
	};
	jQuery.each(fieldSelection, function(i) { jQuery.fn[i] = this; });
	})();


// returns true if any portion of the element is visible in the viewport 
// see: http://upshots.org/javascript/jquery-test-if-element-is-in-viewport-visible-on-screen
$.fn.isOnScreen = function(){
    
    var win = $(window);
     
    var viewport = {
        top : win.scrollTop(),
        left : win.scrollLeft()
    };
    viewport.right = viewport.left + win.width();
    viewport.bottom = viewport.top + win.height();
     
    var bounds = this.offset();
    bounds.right = bounds.left + this.outerWidth();
    bounds.bottom = bounds.top + this.outerHeight();
     
    return (!(viewport.right < bounds.left || viewport.left > bounds.right || viewport.bottom < bounds.top || viewport.top > bounds.bottom));
     
};

