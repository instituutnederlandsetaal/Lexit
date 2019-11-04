
//*******************************************************
// SPINNER (Internet Explorer proof)!
//*******************************************************

// this IE proof spinner is needed because IE can't show animated gifs during Ajax calls in some circumstances
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
function removeSpinner(target){
	
	if (target == null)
		target = '';	
	$(target+" .spinner").remove();
};

// added for user within jQuery
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
	
	
	
//*******************************************************
// Events 
//*******************************************************
	
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

//*******************************************************
// Elements
//*******************************************************

//Checks if a jQuery object exists in the DOM, by checking the length of its child elements. 
//(extracted from js libraries jquery.extensions.js, jquery.form-extensions.js and such) 
$.fn.elementExists = function()
{
	return $(this).length > 0;
};

//returns true if any portion of the element is visible in the viewport 
//see: http://upshots.org/javascript/jquery-test-if-element-is-in-viewport-visible-on-screen
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

//scroll smoothly to a given anchor within a given div
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
	var yToGo = (yTtarget-currentYPos);
	var xToGo = (xTtarget-currentXPos);
	
	// Go to the anchor by resetting the scrollbar position
	$(div).animate({scrollTop:yToGo, scrollLeft:xToGo}, 800);
}


//*******************************************************
// Text selection
//*******************************************************

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

//clear screen selections
function clearSelection() {
    if ( document.selection ) {
        document.selection.empty();
    } else if ( window.getSelection ) {
        window.getSelection().removeAllRanges();
    }
}


//*******************************************************
// Colors
//*******************************************************

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

// Change luminance
//  lum=0.2 means 20% lighter
//  lum=-0.5 means 50% darker
//
// see: https://www.sitepoint.com/javascript-generate-lighter-darker-color/
function ColorLuminance(hex, lum) {

	// validate hex string
	hex = String(hex).replace(/[^0-9a-f]/gi, '');
	if (hex.length < 6) {
		hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
	}
	lum = lum || 0;

	// convert to decimal and change luminosity
	var rgb = "#", c, i;
	for (i = 0; i < 3; i++) {
		c = parseInt(hex.substr(i*2,2), 16);
		c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
		rgb += ("00"+c).substr(c.length);
	}

	return rgb;
}

// programmatically detect if a color is light or dark
// returns: light / dark
//
// see: https://awik.io/determine-color-bright-dark-using-javascript/
function lightOrDark(color) {

    // Variables for red, green, blue values
    var r, g, b, hsp;
    
    // Check the format of the color, HEX or RGB?
    if (color.match(/^rgb/)) {

        // If HEX --> store the red, green, blue values in separate variables
        color = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/);
        
        r = color[1];
        g = color[2];
        b = color[3];
    } 
    else {
        
        // If RGB --> Convert it to HEX: http://gist.github.com/983661
        color = +("0x" + color.slice(1).replace( 
        color.length < 5 && /./g, '$&$&'));

        r = color >> 16;
        g = color >> 8 & 255;
        b = color & 255;
    }
    
    // HSP (Highly Sensitive Poo) equation from http://alienryderflex.com/hsp.html
    hsp = Math.sqrt(
    0.299 * (r * r) +
    0.587 * (g * g) +
    0.114 * (b * b)
    );

    // Using the HSP value, determine whether the color is light or dark
    if (hsp>127.5) {

        return 'light';
    } 
    else {

        return 'dark';
    }
}


// convert any string into a color
// https://stackoverflow.com/questions/3426404/create-a-hexadecimal-colour-based-on-a-string-with-javascript
function stringToColour(str) {
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  var colour = '#';
  for (var i = 0; i < 3; i++) {
    var value = (hash >> (i * 8)) & 0xFF;
    colour += ('00' + value.toString(16)).substr(-2);
  }
  return colour;
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



//*******************************************************
// XML
//*******************************************************

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



//*******************************************************
// String functions
//*******************************************************


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


// replaceAll (non regex!)
// NB: regex version elsewhere in this file

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

//remove html tags from a string
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

//(extracted from js libraries jquery.extensions.js, jquery.form-extensions.js and such)
$.isString = function(o)
{
	return (typeof o === "string");
}

//(extracted from js libraries jquery.extensions.js, jquery.form-extensions.js and such)
$.emptyString = function(str)
{
	if ($.isNullOrUndefined(str))
		return true;
	else if (!$.isString(str))
		throw "isEmpty: the object is not a string";
	else if (str.length === 0)
		return true;
		
	return false;
}

//(extracted from js libraries jquery.extensions.js, jquery.form-extensions.js and such)
$.startsWith = function(str,search)
{
	if ($.isString(str))
		return (str.indexOf(search) === 0);
		
	return false;
}

//(extracted from js libraries jquery.extensions.js, jquery.form-extensions.js and such)
$.endsWith = function(str,search)
{
	if (!$.isString(str) || !$.isString(search) || $.emptyString(str) || $.emptyString(search))
		return false;
	else if (search.length > str.length)
		return false;
	else if (str.length - search.length === str.lastIndexOf(search))
		return true;
	
	return false;
}


//*******************************************************
// Numeric functions
//*******************************************************

//get unique number to be added as an arg to http-requests
//to make sure IE will never use its cache
function getUniqueNumber(){
	return new Date().getTime();
}

//Determines whether the object is a Javascript Number object (int or float)
//@param The object to compare.
//(extracted from js libraries jquery.extensions.js, jquery.form-extensions.js and such)
$.isNumber = function(o)
{
	if (typeof o == "object" && o !== null)
		return (typeof o.valueOf() === "number")
	else
		return (typeof o === "number");
}

//get the smallest value of an array
//see: http://www.javascriptkit.com/javatutors/arraysort.shtml
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

function generateSeries(iStartValue, iEndValue, bAscending){
	
	// determine the max string length, because we want to generate values with the same length
	// like '01', '02', .... '31', '32', etc.
	//   or '001', '002' ... '145', '146', etc.
	
	var sStartValue = String(iStartValue);
	var sEndValue = String(iEndValue);
	var iMaxStringLength;
	
	if (sStartValue.length > sStartValue.length)
		iMaxStringLength = sStartValue.length;
	else
		iMaxStringLength = sEndValue.length;
	
	// build build the series
	var series = [];
	
	if (bAscending)
		{
		for (var i = iStartValue; i <= iEndValue; i++)
			{
			var sValue = right("0000000000"+String(i), iMaxStringLength);
			series.push(sValue)
			}
		}
	else
		{
		for (var i = iEndValue; i >= iStartValue; i--)
			{
			var sValue = right("0000000000"+String(i), iMaxStringLength);
			series.push(sValue)
			}
		}
	
	
	return series;	
};


//*******************************************************
// ARRAY FUNCTIONS
//*******************************************************


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
// USE: var newObj = NEW cloneObject(oldObj)
//                   ===
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
 * USE:
 * var myArray = [
 *        [1, 'alfred', '...'],
 *        [23, 'berta', '...'],
 *        [2, 'zimmermann', '...'],
 *        [4, 'albert', '...']
 *        ];
 * myArray = myArray.sort(Comparator);
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


// inArray function supporting regex
// (improved version of: 
// http://stackoverflow.com/questions/23447021/can-i-use-a-regular-expression-within-jquery-inarray)

$.inArrayRegEx = function(value, array, start) {
 if (!array) return -1;
 start = start || 0;
 for (var i = start; i < array.length; i++) {
 	
 	// if the array element is a regex
 	if ( !isRegex(value) && isRegex(array[i]) )
 		{
 		if ( new RegExp(array[i]).test(value)) 
             return i;
 		}
 	// or if the value argument is a regex
 	else if ( isRegex(value) && !isRegex(array[i]) )
 		{
 		if ( new RegExp(value).test(array[i])) 
             return i;
 		}
 	// otherwise do strict equality test
 	else
 		{
 		if (value == array[i])
 			return i;
 		}        
 }
 return -1;
};



//*******************************************************
// ESCAPE CHARS functions
//*******************************************************

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



//*******************************************************
// Regex
//*******************************************************

// check whether a string is a regex or not
function isRegex(str){
	if (str.indexOf("^")>-1 || str.indexOf("$")>-1)
		return true;
	return (str != escapeRegexChars(str));
}


// replaceAll (regex version)
// https://stackoverflow.com/questions/1144783/how-to-replace-all-occurrences-of-a-string-in-javascript

// beware: for IE compatibility, the search argument must be a string, and not a regex literal
// (t.i.  "^(...)$" instead of /^(...)$/
// https://stackoverflow.com/questions/40629314/javascript-regexp-not-working-in-ie11-and-working-in-chrome

String.prototype.regexReplaceAll = function(search, replacement) {
 var target = this;
 return target.replace(new RegExp(search, 'g'), replacement);
};



//*******************************************************
// NULL or undefined
//*******************************************************

// Make sure an array contains no null values or convert those into strings 'NULL'.
// We need this function in our ajax calls, as we otherwise can't use 'join' to 
// concat arguments values into one string (sent by ajax),
// so such values need to be converted into strings (the webservice will
// those back into true NULL values afterwards)
// NB: this type of conversion is not needed for true/false, as join can deal with those values as wished.
function convertNullToString(arr){
	
	if (arr == null)
		return arr;
	
	for (var i=0; i<arr.length; i++)
		{
		if (arr[i] == null)
			arr[i] = 'NULL'; // beware: it must be uppercase, as the webservice expects that!
		}
	return arr;
}


//(extracted from js libraries jquery.extensions.js, jquery.form-extensions.js and such)
$.isNull = function(o)
{
	return (o === null);
}

// Determines whether the object is undefined, that is no value has been set for it. This will return false for variables with null value.
//	@param The object to compare.
// (extracted from js libraries jquery.extensions.js, jquery.form-extensions.js and such)
$.isUndefined = function(o)
{
	return (typeof o === "undefined");
}

// Determines whether the object provided is null, or undefined.
//	@param The object to compare.
//(extracted from js libraries jquery.extensions.js, jquery.form-extensions.js and such)
$.isNullOrUndefined = function(o)
{
	return $.isNull(o) || $.isUndefined(o);
}


//*******************************************************
// HTML entities
//*******************************************************

// check if a given HTML entity is a common one
// if the input contains a custom IvdNT entity, the function should return false
function isCommonEntity(sStr){	
	
	var regex = /(&)(ldquor|rdquo|mdash|quot|apos|amp|lt|gt|nbsp|iexcl|cent|pound|curren|yen|brvbar|sect|uml|copy|ordf|laquo|not|shy|reg|macr|deg|plusmn|sup2|sup3|acute|micro|para|middot|cedil|sup1|ordm|raquo|frac14|frac12|frac34|iquest|times|divide|thorn|szlig|agrave|aacute|acirc|aelig|atilde|auml|aring|aelig|ccedil|egrave|eacute|ecirc|euml|igrave|iacute|icirc|iuml|eth|ntilde|ograve|oacute|ocirc|oelig|otilde|ouml|oslash|ugrave|uacute|ucirc|uuml|yacute|thorn|yuml|rdquo|ldquo)(;)/gi;
	return sStr.match(regex);
}


// translate entities to chars and back! 
var aFnChar = "⊇|„|”|—|\"|'|&|<|>| |¡|¢|£|¤|¥|¦|§|¨|©|ª|«|¬|­|®|¯|°|±|²|³|´|µ|¶|·|¸|¹|º|»|¼|½|¾|¿|×|÷|þ|ß|à|á|â|æ|ã|ä|å|æ|ç|è|é|ê|ë|ì|í|î|ï|ð|ñ|ò|ó|ô|œ|õ|ö|ø|ù|ú|û|ü|ý|þ|ÿ|”|“".split("|");
var aFnEntities = "supe|ldquor|rdquo|mdash|quot|apos|amp|lt|gt|nbsp|iexcl|cent|pound|curren|yen|brvbar|sect|uml|copy|ordf|laquo|not|shy|reg|macr|deg|plusmn|sup2|sup3|acute|micro|para|middot|cedil|sup1|ordm|raquo|frac14|frac12|frac34|iquest|times|divide|thorn|szlig|agrave|aacute|acirc|aelig|atilde|auml|aring|aelig|ccedil|egrave|eacute|ecirc|euml|igrave|iacute|icirc|iuml|eth|ntilde|ograve|oacute|ocirc|oelig|otilde|ouml|oslash|ugrave|uacute|ucirc|uuml|yacute|thorn|yuml|rdquo|ldquo".split("|");

function translateCharToEntity(sChar){
	var iIndex = $.inArray(sChar, aFnChar);
	if (iIndex>-1)
		return "&"+aFnEntities[iIndex]+";";
	return sChar;
}
function translateEntityToChar(sEntity){
	var sEntityMain = sEntity.replace(/&/, '').replace(/;/, '');
	var iIndex = $.inArray(sEntityMain, aFnEntities);
	if (iIndex>-1)
		return aFnChar[iIndex];
	return sChar;
}



//*******************************************************
// Compute / get INDEXES
//*******************************************************

//js-implementation of indexOf(regex, start) and lastIndexOf(regex, start)
//---------------------     -------------------------
//http://stackoverflow.com/questions/273789/is-there-a-version-of-javascripts-string-indexof-that-allows-for-regular-expr

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





// Given a main string in which a substring was found at a given index
// compute the true start and end indexes in the same string containing html entities
//
function getTrueIndexes(sRangeStringDecodedEntities, sNodeStringEncodedEntities, sSelectionDecodedEntities, selectionStartIndex, bPushWordBoundaries){
	
	// debug!
	var debug = false;
	
	if (debug)
		{
		console.log("-----------------------------------------------------------");
		console.log("sRangeStringDecodedEntities = "+sRangeStringDecodedEntities);
		console.log("sNodeStringEncodedEntities = "+sNodeStringEncodedEntities);
		console.log("sSelectionDecodedEntities = "+sSelectionDecodedEntities);
		console.log("selectionStartIndex = "+selectionStartIndex);
		}
	
	// [1] We need to restore the ENcoded entities, since calling range.toString() cause those to be DEcoded,
	//     in such a way that indexes might not fit the table data. 
	
	// get quote with ENcoded entities 
	var mainStringAndCorrection = 				reEncodeEntities( sNodeStringEncodedEntities, sRangeStringDecodedEntities );
	var mainString = 							mainStringAndCorrection["restored_entities"];
	
	if (debug)
		{
		console.log("mainString = "+mainString);
		}
	
	
	// compute new start position given the corrected quote string
	var sPrefixDecodedEntities =				sRangeStringDecodedEntities.substring( 0, selectionStartIndex );	
	var sPrefixEncodedEntitiesAndCorrection = 	reEncodeEntities( sNodeStringEncodedEntities, sPrefixDecodedEntities );
	var sPrefixEncodedEntities = 				sPrefixEncodedEntitiesAndCorrection["restored_entities"];
	
	var iCorrection = 							sPrefixEncodedEntitiesAndCorrection["index_correction"]; //(sPrefixEncodedEntities.length - sPrefixDecodedEntities.length);
	// from now on, selectionStartIndex must be applied to strings with ENcoded entities, instead of range.toString()
	selectionStartIndex = 						selectionStartIndex + iCorrection;
	
	if (debug)
		{
		console.log("sPrefixDecodedEntities = "+sPrefixDecodedEntities);
		console.log("sPrefixEncodedEntities = "+sPrefixEncodedEntities);
		console.log("selectionStartIndex (herberekend) = "+selectionStartIndex);
		}
	
	
	// do the same with the selection
	
	var sSelectionPartEncodedEntities = sNodeStringEncodedEntities.substring( selectionStartIndex );
	var selection = (reEncodeEntities( sSelectionPartEncodedEntities, sSelectionDecodedEntities ))["restored_entities"];	
	
	if (debug)
		{
		console.log("selection = "+selection);
		}

	
	// [2] change all html-entitie names into tags, so we will only have to deal with taglike things
	//
	// This changes  Hij heet Napol&eacute;on
	//         into  hij heet napolD<~~~~~>on
	// so each character keeps its original position in the string
	//
	// This will allow us to find the true word bounderies, where characters as '&' or ';' can be found. 
	// If we wouldn't convert DEcoded html entities into tags, we would probably interpret the ';' part of an entity as a word border, which it isn't.
	
	mainString = mainString.toLowerCase().replace( /(&)([^;]+)(;)/gi, 
			function ($0, $1, $2, $3) {
	    return "D<" + (new Array($2.length).join("~")) + ">" ;
	}); // D for dummy char, replacing the entity char
	
	
	// [3] Now do the job
	
	var newSelectionStartIndex = selectionStartIndex;
	var newSelectionEndIndex   = selectionStartIndex + (selection.length); 
	
	if (debug)
		{
		console.log("newSelectionStartIndex = "+newSelectionStartIndex);
		console.log("newSelectionEndIndex = "+newSelectionEndIndex);
		}
		
	// if required (it is when a word has been clicked upon, so we search for its boundaries automatically)
	// check if the word is truely surrounded by spaces or such. If not, look for the true boundaries of the word.
	// (this is needed, because the selection was obtained by checking the node what was clicked upon; but sometimes
	//  a word can be spread among several nodes, because of in-between tags for style etc).
	if (bPushWordBoundaries)
		{
		newSelectionStartIndex = getIndexOfPreviousSpace(mainString, newSelectionStartIndex) + 1;
		newSelectionEndIndex   = getIndexOfFollowingSpace(mainString, newSelectionEndIndex);
		
		if (debug)
			{
			console.log("after PushWordBoundaries:");
			console.log("newSelectionStartIndex = "+newSelectionStartIndex);
			console.log("newSelectionEndIndex = "+newSelectionEndIndex);
			}
		}
	
	// finally make sure the start index is not a closing tag
	while ( $.startsWith(mainString.substring(newSelectionStartIndex), "<\/") )
		{
		newSelectionStartIndex = mainString.indexOf(">", newSelectionStartIndex) + 1;
		}
	
	return {
		"start": newSelectionStartIndex,
		"end": newSelectionEndIndex
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
				// that is: when the mainString begins with a tag 
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

// yet another subfunction of getTrueIndexes(...)
//
// This function is used to solve the following problem:
//
// When functions like fn.getWordClickedUponInNode() are called, we get
// some text selection with DEcoded html entities [typically: range.toString()]
// and some [start, end] indexes for the text selection within this string 
// with DEcoded entities. But this is not suitable, since TABLE DATA might contain 
// ENcoded entities [typically: fn.getDataFromCell()], so the [start, end] indexes 
// computed by fn.getWordClickedUponInNode() might not fit the table data at all!
// So, this function takes the original table data with ENcoded html entities
// and some (sub)string representing (a part of) the original table data, 
// but now with DEcoded entities in it because of the call of range.toString().
// The function re-ENcoded the entities that were originally ENcoded and leave
// the rest untouched.
// This allows the getTrueIndexes() function to work correctly, and compute 
// text selection indexes that fit the original table data!
//
// input:  [1] full original table data with ENcoded entities
//         [2] substring with DEcoded entities, in which we want to restore the ENcoded entities
// output: [a] string as in [2] where the DEcoded (but originally ENcoded) entities are re-ENcoded
//         [b] the numeric correction to apply to indexes, since [a] might be larger than [2].
function reEncodeEntities(sEncodedEntities, sDecodedEntities){
	
	var indexesToEntities = new Hashtable();
	var indexesToTags = new Hashtable();
	var iLength = sDecodedEntities.length;
	var iCorrectionToApply = 0;
	
	for (var i=0; i<iLength; i++)
		{
	
		// we found a tag
		if ( sEncodedEntities.charAt(i) == "<" && 
			 sDecodedEntities.charAt(i) != sEncodedEntities.charAt(i) )
			{			
			// get tag and its end position
			var iPositionAfterTag =	i + (sEncodedEntities.substring(i)).regexIndexOf("\>([^\<]|$)")+1
			var sTag = 				sEncodedEntities.substring(i, iPositionAfterTag);
			// register the tag so we'll be able to put it back at its original position in the output
			indexesToTags.put(i, sTag); 
			// remove the tag 
			sEncodedEntities = sDecodedEntities.substring(0, i) + sEncodedEntities.substring(iPositionAfterTag);
			}
		
		// we found a decoded entity
		if ( sEncodedEntities.charAt(i) == "&" && 
			 sDecodedEntities.charAt(i) != sEncodedEntities.charAt(i) )
			{
			// Translate the ENcoded entity back into a DEcoded entity in the sEncodedEntities string
			// That way, we can keep comparing chars at the same position in both strings 
			// instead of keeping different cursor positions in each string... easier to work with!
			
			// get ENcoded entity and its end position
			// (detect ';' from the cursor position i, otherwise we would possibly catch previous entities)
			var iPositionAfterEntity =	i + (sEncodedEntities.substring(i)).indexOf(";")+1
			var sEntity = 				sEncodedEntities.substring(i, iPositionAfterEntity);
			// register the ENcoded entity so we'll be able to put it back at its original position in the output
			indexesToEntities.put(i, sEntity); 
			// do the translation, as explained here above
			// (end-pos + 1, so we catch prefix plus the entity)
			sEncodedEntities = sDecodedEntities.substring(0, i+1) + sEncodedEntities.substring(iPositionAfterEntity);
			}
		}
	
	// Now we are ready to insert the DEcoded entities at their right positions
	// (begin at the end, of course, since inserting substrings changes indexes at the right side of the cursor)
	
	for (var i=iLength; i>=0; i--)
		{	
		var sEntity =	indexesToEntities.get(i);
		var sTag = 		indexesToTags.get(i);
		
		if (sEntity != null)
			{
			// (end-pos + 1 to skip the DEcoded entity, which is replaced by sEntity
			sDecodedEntities = sDecodedEntities.substring(0, i) + sEntity + sDecodedEntities.substring(i+1);
			// (length-1, because we replace a DEcoded entity [1 char] by its ENcoded entity [n chars] -> n-1
			iCorrectionToApply += (sEntity.length-1); 
			}
		if (sTag != null)
			{
			// (end-pos without +1, because there's nothing to skip here, instead we just insert sTag)
			sDecodedEntities = sDecodedEntities.substring(0, i) + sTag + sDecodedEntities.substring(i);
			iCorrectionToApply += sTag.length;
			}
		}
	
	// return the substring in which we restored the DEcoded entities of the original table data
	return {"restored_entities": sDecodedEntities, "index_correction": iCorrectionToApply};
}



// Find the first preceding space before a given index.
// We need this function to solve a particular flow of the fn.getSelectedTextInNode function:
// Getting the selected text works given a node that has been clicked upon. In most cases,
// this is good enough. Sadly, in some cases, this method doesn't give the right text boundaries,
// because a word happens to be broken up in several nodes due to tags assigning style etc.
// So, to be able to get the true word boundaries, we try to find the surrounding true spaces,
// meaning that we exclude space within a tag, of course.
function getIndexOfPreviousSpace(mainString, startIndex){
	
	var withinTag = false;
	
	for (var i=startIndex; i>=0; i--)
		{
		var currentChar = mainString.charAt(i);
		if (currentChar==">") 
			withinTag = true;
		
		if (currentChar.match(/[\^\$\(\)\[\]\{\}\\\|\.\*\+\?\s'"!:;,&@#%=]/) && !withinTag)
			return i;
		
		if (currentChar=="<") withinTag = false;
		}
	
	// We reach this point when the string part in range [0, startIndex]  
	// contains no space at all (outside the tags).
	// In that particular case, strictly speaking, the space preceeding
	// the first letter of the string is at index -1.
	return -1;
}


// Find the first following space after a given index.
// See explanation at previous function getIndexOfPreviousSpace()
function getIndexOfFollowingSpace(mainString, endIndex){
	
	var withinTag = false;
	
	for (var i=endIndex; i<mainString.length; i++)
		{
		var currentChar = mainString.charAt(i);
		if (currentChar=="<") 
			withinTag = true;
		
		if (currentChar.match(/[\^\$\(\)\[\]\{\}\\\|\.\*\+\?\s'"!:;,&@#%=]/) && !withinTag)
			return i;
		
		if (currentChar==">") withinTag = false;
		}
	
	// We reach this point when the string part in range [endIndex, string-length]
	// contains no space at all (outside the tags).
	// In that particular case, the string length value is the index at which
	// the following space would occur
	return mainString.length;
}




// *******************************************************
// z-index computations
// *******************************************************

// https://stackoverflow.com/questions/1768150/how-to-add-a-function-to-jquery

jQuery.fn.putInFront = function() {
	
	// get highest z-index on page
	// but exclude some divs, which have their own z-index, and which must keep their z-index the highest (like tiptip_holder)
	var iHighestZindex = Math.max.apply(null, $.map($('div:not(#tiptip_holder,#tiptip_content,#tiptip_arrow)'), function(e, n){
        if($(e).css('position')=='absolute')
             return parseInt($(e).css('z-index'))||1 ;
        })
	);
	// see: https://www.sitepoint.com/jquery-find-highest-z-index-page/
	
	
	var o = $(this[0]); // This is the selector element
	o.css("z-index", iHighestZindex + 1 );
}

function getZindexOfTableInFrond(){
	
	// get highest z-index of all visible tables
	var aTables = mt.getListOfLoadedTables();
	var iHighestZindex = 0;
	for (var i=0; i<aTables.length; i++)
		{
		var iCurrentZindex = $("#"+aTables[i]+"_dynamic").css("z-index");
		iCurrentZindex = (iCurrentZindex == 'auto' ? 0 : iCurrentZindex); 
		if (iCurrentZindex > iHighestZindex)
			iHighestZindex = iCurrentZindex;		
		}
	
	return iHighestZindex;
}



//*******************************************************
// Http parameters 
// ******************************************************

// put http params into a hashtable object
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


//*******************************************************


function getJqXHRInfo(jqXHR){
	
	// get http parameters
	var paramsHash = getHttpParams();
	
	// are we in test mode?
	var bTest = (paramsHash!=null &&
			paramsHash.get("test")!=null && 
			paramsHash.get("test")=='true');
	
	// if Lex'it is running on home address or is in test mode, give jqXHR info
		
	if ( document.URL.regexIndexOf( INL_HOMEURL )>-1 || bTest)
		{
		if ( jqXHR != null )
			{
			if ( $.isNullOrUndefined(jqXHR["responseText"]) )
				{
				return JSON.stringify(jqXHR);
				}
			else
				{
				var regex = /\<style.+?\<\/style\>/gi
				return '<div style="overflow: auto; height:400px">'+(jqXHR["responseText"]).replace(regex, '')+'</div>';
				}
			}	
		return "no jqXHR info";	
		}
	
	// otherwise we will not
	
	return "";		
}



//*******************************************************

function translateBoolean(mSomeValue){
	
	if (mSomeValue==1 || mSomeValue=='1' || mSomeValue==true || mSomeValue=='t' || mSomeValue=='true')
		return true;
	if (mSomeValue==0 || mSomeValue=='0' || mSomeValue==false || mSomeValue=='f' || mSomeValue=='false')	
		return false;
}


//*******************************************************