/**
 * The lexutil namespace contains all kinds of utility functions, dealing with other objects than tables.
 * 
 * @namespace
 */
var lexutil = {};


//*******************************************************
// SPINNER (Internet Explorer proof)!
//*******************************************************

// this IE proof spinner is needed because IE can't show animated gifs during Ajax calls in some circumstances
// see: http://fgnass.github.com/spin.js/

/**
 * Show a spinner (a rotating circle) in a given target
 * @param {String} target - Selector of the target element to show the spinner in
 * @param {Boolean} bRefreshing - If true, the spinner will be shown with a different color and size, indicating a refresh
 */
lexutil.showSpinner = function(target, bRefreshing){

	// default setting indicating Lex'it is working
	var sColorCode = '#000';
	var iRadius = 10;
	var iWidth = 4;

	// other setting, indication Lex'it is refreshing the view
	if (bRefreshing != null && bRefreshing == true){
		sColorCode = '#0099ff';
		iRadius = 20;
		iWidth = 8;
	} 

	var opts = {
			  lines: 13, // The number of lines to draw
			  length: 7, // The length of each line
			  width: iWidth, // The line thickness
			  radius: iRadius, // The radius of the inner circle
			  corners: 1, // Corner roundness (0..1)
			  rotate: 0, // The rotation offset
			  color: sColorCode, // #rgb or #rrggbb
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

/**
 * Remove the spinner from a given target
 * @param {String} target - Selector of the target element to remove the spinner from]
 */
lexutil.removeSpinner = function(target=""){
	$(target+" .spinner").remove();
};


// HELP FUNCTION OF lexutil.showSpinner()
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


/**
 * Pre-bind function: bind a handler to some event, before all other handlers of the same event
 * (see: http://stackoverflow.com/questions/6029251/jquery-bind-event-listener-before-another)
 * 
 * Usage: $('#button').preBind('click', function() {
 *   console.log('hello');
 * });
 */
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


/**
 * Copy events from one element to another
 * (source: https://stackoverflow.com/questions/2337521/copy-events-from-one-element-to-other-using-jquery)
 * @param {Object} source - The source element
 * @param {Object} destination - The destination element
 */
lexutil.copyEvents = function(source, destination) {
    // Get source events
    var events = source.data('events');

    // Iterate through all event types
    $.each(events, function(eventType, eventArray) {
        // Iterate through every bound handler
        $.each(eventArray, function(index, event) {
            // Take event namespaces into account
            var eventToBind = event.namespace.length > 0
                ? (event.type + '.' + event.namespace)
                : (event.type);

            // Bind event
            destination.bind(eventToBind, event.data, event.handler);
        });
    });
}



//*******************************************************
// Elements
//*******************************************************

/**
 * Checks if a jQuery object exists in the DOM, by checking the length of its child elements.
* (extracted from js libraries jquery.extensions.js, jquery.form-extensions.js and such)
 * @returns {Boolean} true if the element exists,  
 */
$.fn.elementExists = function() {
	return $(this).length > 0;
};

/**
 * Check if an element is visible on the screen
 * (see: http://upshots.org/javascript/jquery-test-if-element-is-in-viewport-visible-on-screen)
 * @returns {String} true if any portion of the element is visible in the viewport
 * 
 * Usage: var bOnScreen = $(selector).isOnScreen();
 */
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

/**
 * Scroll smoothly to a given anchor within a given div
 * @param {String} div - The div within scroll must be performed
 * @param {String} anchor - the anchor to scroll to
 * @param {Boolean} bVerticalOnly - if true, only scroll vertically; otherwise scroll both horizontally and vertically
 */
lexutil.smoothScroll = function(div, anchor, bVerticalOnly=false) {
	
	// get the offset (currentPos) and the number of pixels  
	// to add or subtract from the offset 
	// (in case we need to subtract, the value to add will
	//  be negative) 
	var currentYPos = $(div).scrollTop();
	var currentXPos = $(div).scrollLeft();
	var yTtarget = $(anchor).position().top;	
	var xTtarget = $(anchor).position().left;
	var yToGo = (yTtarget-currentYPos);
	var xToGo = bVerticalOnly ? 0 : (xTtarget-currentXPos);
	
	// Go to the anchor by resetting the scrollbar position
	$(div).animate({scrollTop:yToGo, scrollLeft:xToGo}, 800);
}


//*******************************************************
// Text selection
//*******************************************************

/**
 * Disable text selection
 * Usage: $(selector).disableSelection();
 */
jQuery.fn.extend({ 
    disableSelection : function() {
    	$(this).attr('unselectable', 'on').css('MozUserSelect', 'none'); 
    } 
}); 

/**
 * Enable text selection
 * Usage: $(selector).enableSelection();
 */
jQuery.fn.extend({ 
	enableSelection : function() { 
		$(this).attr('unselectable', 'off').css('MozUserSelect', 'auto'); 
    }	 
}); 

/**
 * Clear screen selection
 * (prevent browser from selecting the whole page upon clicking on a button)
 */
lexutil.clearSelection = function() {
    if ( document.selection ) {
        document.selection.empty();
    } else if ( window.getSelection ) {
        window.getSelection().removeAllRanges();
    }
}


//*******************************************************
// Colors
//******************************************************* 

/**
 * Get a different (t.i. lighter or darker) shade, given a HEX color code
 * Usage: var newColor = lexutil.shadeColor("#AA2222", -10);
 * (see: http://stackoverflow.com/questions/3403882/javascript-one-shade-darker)
 * 
 * @param {String} color - The HEX color to shade
 * @param {Integer} shade - The shade to apply (positive for lighter, negative for darker)
 * @returns {String} reshaded HEX color code
 */
lexutil.shadeColor = function(color, shade) {
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



/**
 * Change luminance
 * Usage: var newColor = lexutil.colorLuminance("#AA2222", -0.5);
 * (see: https://www.sitepoint.com/javascript-generate-lighter-darker-color/)
 * 
 * @param {String} hex - The HEX color to change
 * @param {Real} lum - The luminance to apply (lum=0.2 means 20% lighter, lum=-0.5 means 50% darker)
 * @returns {String} the new HEX color code
 */
lexutil.colorLuminance =  function(hex, lum) {

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

 

/**
 * Programmatically detect if a color is light or dark
 * (see: https://awik.io/determine-color-bright-dark-using-javascript/)
 * 
 * @param {String} color - The color to check
 * @returns {String} 'light' if the color is light, 'dark' otherwise
 */
lexutil.lightOrDark = function(color) {

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


/**
 * Convert any string into a color
 * (see https://stackoverflow.com/questions/3426404/create-a-hexadecimal-colour-based-on-a-string-with-javascript)
 * 
 * @param {String} str - The string to convert
 * @returns {String} a HEX color code
 */
lexutil.stringToColor = function(str) {
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


/**
 * Convert RGB color to HEX
 * (see: http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb)
 * 
 * @param {Integer} r - The red component
 * @param {Integer} g - The green component
 * @param {Integer} b - The blue component
 * @returns {String} the HEX color code	
 * @see lexutil.rgbStrToHex
 * @see lexutil.hexToRgb
 */
lexutil.rgbToHex = function(r, g, b) {
	var componentToHex = function(c) {
	    var hex = c.toString(16);
	    return hex.length == 1 ? "0" + hex : hex;
	}
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

/**
 * Convert HEX color to RGB
 * (see: http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb)
 * 
 * @param {String} hex - The HEX color code
 * @returns {Object} an object with the red, green and blue components: {r:..., g:..., b:...}
 * @see lexutil.rgbToHex
 * @see lexutil.rgbStrToHex
 */
lexutil.hexToRgb = function(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

/**
 * Convert RGB color string 'rgb(r,g,b)' to HEX
 * (see: http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb)
 * 
 * @param {String} rgb - The RGB color code (as a string like 'rgb(r,g,b)')
 * @returns {String} the HEX color code
 * @see lexutil.rgbToHex
 * @see lexutil.hexToRgb
 */
lexutil.rgbStrToHex = function(rgb) {
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

/**
 * Create an XML document from a string containing XML
 * @param string The XML string
 * @returns an XML document
 */
jQuery.createXMLDocument = function(string){
	var browserName = navigator.appName;
	var doc;
	if (browserName == 'Microsoft Internet Explorer') {
		doc = new ActiveXObject('Microsoft.XMLDOM');
		doc.async = 'false';
		doc.loadXML(string);
	} 
	else  {
		doc = (new DOMParser()).parseFromString(string, 'text/xml');
	}
	return doc;
};



//*******************************************************
// String functions
//*******************************************************


/**
 * Classic 'left' string function
 * @param {String} str - The string to process
 * @param {Integer} n - The number of characters to keep on the left
 * @returns {String} the left part of the string
 */
lexutil.left = function(str, n){
	if (n <= 0)
	    return "";
	else if (n > String(str).length)
	    return str;
	else
	    return String(str).substring(0,n);
}

/**
 * Classic 'right' string function
 * @param {String} str - The string to process
 * @param {Integer} n - The number of characters to keep on the right
 * @returns {String} the right part of the string
 */
lexutil.right = function(str, n){
    if (n <= 0)
       return "";
    else if (n > String(str).length)
       return str;
    else {
       var iLen = String(str).length;
       return String(str).substring(iLen, iLen - n);
    }
}


/**
 * Replace all occurrences of a literal string (t.i. no regular expression)
 * @param {String} search - The string to search for
 * @param {String} replacement - The string to replace with
 * @returns {String} the string with all occurrences of search replaced by replacement
 * @see String.prototype.regexReplaceAll
 */
String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};



/**
 * Check if a string contains (html) tags
* (see: https://stackoverflow.com/questions/15458876/check-if-a-string-is-html-or-not)
 * @param {String} text - The string to check
 * @returns {Boolean} true if the string contains tags, false otherwise
 */
lexutil.hasTags = function(text){
	return /<\/?[a-z][\s\S]*>/i.test(text);
}

/**
 * Remove all (html) tags from a string
 * @param {String} text - The string to process
 * @returns {String} the string with all tags removed
 */
lexutil.removeTags = function(text){
	if (typeof text == 'string')
		return text.replace(/<\/?[^>]+(>|$)/g, "");
	return text;
	
}

/**
 * Remove all characters that are no letters nor digits from a string
 * @param {String} str - The string to process
 * @returns {String} the string with all characters that are no letters nor digits removed
 */
lexutil.keepOnlyLettersAndDigits = function(str){
	return str.replace(/([^\w\d])/gi, "");
}




/**
 * Check if the input is of type string
 * (extracted from js libraries jquery.extensions.js, jquery.form-extensions.js and such)
 * @param {Object} o - The object to check (might not be a string)
 * @returns true if the object is a string, false otherwise
 */
$.isString = function(o){
	return (typeof o === "string");
}

/**
 * Check if the input is an empty string
 * (extracted from js libraries jquery.extensions.js, jquery.form-extensions.js and such)
 * @param {String} str - The string to check
 * @returns {Boolean} true if the string is empty, false otherwise
 */
$.emptyString = function(str){
	if ($.isNullOrUndefined(str))
		return true;
	else if (!$.isString(str))
		throw "isEmpty: the object is not a string";
	else if (str.length === 0)
		return true;
		
	return false;
}

/**
 * Check if a string starts with a given substring
 * (extracted from js libraries jquery.extensions.js, jquery.form-extensions.js and such)
 * 
 * @param {String} str - The string to check
 * @param {String} search - The substring to search for
 * @returns {Boolean} true if the string starts with the substring, false otherwise
 */
$.startsWith = function(str, search){
	if ($.isString(str))
		return (str.indexOf(search) === 0);
		
	return false;
}

/**
 * Check if a string ends with a given substring
 * (extracted from js libraries jquery.extensions.js, jquery.form-extensions.js and such)
 * 
 * @param {String} str - The string to check
 * @param {String} search - The substring to search for
 * @returns {Boolean} true if the string ends with the substring, false otherwise
 */
$.endsWith = function(str, search){
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

/**
 * Check if the input is of type number (int or float)
 * (extracted from js libraries jquery.extensions.js, jquery.form-extensions.js and such)
 * 
 * @param {Object} o - The object to check
 * @returns {Boolean} true if the object is a number, false otherwise
 */
$.isNumber = function(o){
	if (typeof o == "object" && o !== null)
		return (typeof o.valueOf() === "number")
	else
		return (typeof o === "number");
}

/**
 * Get unique number. We generally use this function for adding a (dummy) unique parameter value to http-requests, 
 * so as to make sure browsers won't use their cache
 * @returns {Number} a unique number
 */
lexutil.getUniqueNumber = function(){
	return new Date().getTime();
}


/**
 * Get the smallest value of an array 
 * (see: http://www.javascriptkit.com/javatutors/arraysort.shtml)
 * 
 * @param {Array} arr - The array of numbers to process
 * @returns {Number} the smallest value of the array}
 */
lexutil.getTheLowestPositive = function(arr){
	
	var positiveArr = new Array();
	// gather the positive values only
	for (var i=0; i<arr.length; i++) {
		if (arr[i]>=0)
			positiveArr.push(arr[i]);
	}
	// sort the positive values in numerical order
	positiveArr.sort(function(a, b){return a - b;});
	
	// return the lowers value
	return positiveArr[0];
}

/**
 * Generate an array of numbers from a given range
 * @param {Integer} iStartValue - The start value of the range
 * @param {Integer} iEndValue - The end value of the range
 * @param {Boolean} bAscending - If true, the array will be in ascending order; otherwise, it will be in descending order
 */
lexutil.generateSeries = function(iStartValue, iEndValue, bAscending){
	
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
	
	if (bAscending) {
		for (var i = iStartValue; i <= iEndValue; i++) {
			var sValue = lexutil.right("0000000000"+String(i), iMaxStringLength);
			series.push(sValue)
		}
	}
	else {
		for (var i = iEndValue; i >= iStartValue; i--) {
			var sValue = lexutil.right("0000000000"+String(i), iMaxStringLength);
			series.push(sValue)
		}
	}	
	
	return series;	
};


//*******************************************************
// ARRAY FUNCTIONS
//*******************************************************

/**
 * Convert an associative array into a parameters string (like in a URL)
 * @param {Array} aArr - The associative array to process
 * @returns {String} the parameters string 
 */
lexutil.getAssociativeArrayAsString = function(aArr){
	var aOutput = [];

	for (oneKey in aArr){
		aOutput.push( oneKey+"="+aArr[oneKey] );
	}
	return aOutput.join("&");
}


/**
 * Check for array equality, this means same length, same order and same elements!
 * @param {Array} a - The first array to compare
 * @param {Array} b - The second array to compare
 * @returns {Boolean} true if the arrays are equal, false otherwise
 */
lexutil.arraysAreEqual = function(a, b) { 
	return !(a<b || b<a); 
}

/**
 * Get a clone of an array.
 * (see http://stackoverflow.com/questions/565430/deep-copying-an-array-using-jquery)
 * 
 * @param {Array} arr - The array to clone
 * @returns {Array} a clone of the array
 * @see lexutil.cloneObject
 */
lexutil.cloneArray = function(arr){
	return $.extend(true, new Array(), arr);
}

/**
 * Clone an object
 * Usage: var newObj = NEW lexutil.cloneObject(oldObj)
 * 
 * @param {Object} source - The object to clone
 * @returns {Object} a clone of the object
 * @see clexutil.cloneArray
 */
lexutil.cloneObject = function(source) {
 for (i in source) {
     if (typeof source[i] == 'source') {
         this[i] = new lexutil.cloneObject(source[i]);
     }
     else{
         this[i] = source[i];
     }
 }
}

/**
 * Count the number of members of an object 
 * (see: http://stackoverflow.com/questions/956719/number-of-elements-in-a-javascript-object)
 * 
 * @param {Object} obj - The object to process
 * @returns {Number} the number of properties of the object
 */
lexutil.countProperties = function(obj) {
    var count = 0;
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            ++count;
    }
    return count;
}


/**
 * Recognize iterable (ie non-empty) array-like objects
 * @param {Object} obj - The object to check
 * @returns {Boolean} true if the object is an iterable array
 */
lexutil.isNonEmptyArrayLike = function(obj) {
    try { // don't bother with 'typeof' - just access 'length' and 'catch'
        return obj.length > 0 && '0' in Object(obj);
    }
    catch(e) {
        return false;
    }
};




/**
 * Sort an array of array's (2 dimensional array only) by the first element of each array)
 * (see: http://stackoverflow.com/questions/5435228/sort-an-array-with-arrays-in-it-by-string)
 * 
 * @param {Array} arr - array of array's
 * @returns {Array} sorted array of array's
 */
lexutil.sortArrayOfArray = function(myArray){

	myArray = myArray.sort(function(a, b){
		if (a[0] < b[0]) return -1;
		if (a[0] > b[0]) return 1;
		return 0;
	});
	return myArray;
};



/**
 * Make sure an array only contains unique values
 * @param {Array} array - The array to process
 * @returns {Array} the array with only unique values
 */
lexutil.getOnlyUniqueValues = function(array){
	
	var onlyUnique = function(value, index, self) { 
	    return self.indexOf(value) === index;
	}
	return array.filter( onlyUnique );
}


/**
 * jQuery.inArray function supporting regular expressions
 * (improved version of: http://stackoverflow.com/questions/23447021/can-i-use-a-regular-expression-within-jquery-inarray)
 * 
 * @param {String} value - The RegEx value to search for
 * @param {Array} array - The array to search in
 * @param {Integer} start - The starting index
 * @returns {Integer} the index of the value in the array, -1 if not found
 */
$.inArrayRegEx = function(value, array, start) {
 if (!array) return -1;
 start = start || 0;
 for (var i = start; i < array.length; i++) {
 	
 	// if the array element is a regex
 	if ( !lexutil.isRegex(value) && lexutil.isRegex(array[i]) ) {
 		if ( new RegExp(array[i]).test(value)) 
             return i;
 	}
 	// or if the value argument is a regex
 	else if ( lexutil.isRegex(value) && !lexutil.isRegex(array[i]) ) {
 		if ( new RegExp(value).test(array[i])) 
             return i;
 	}
 	// otherwise do strict equality test
 	else {
 		if (value == array[i])
 			return i;
 	}        
 }
 return -1;
};


/**
 * Get the values that are not common (symmetric difference) between two arrays
 * @param {Array} arr1 - The first array
 * @param {Array} arr2 - The second array
 * @returns {Array} the values that are not common between the two arrays
 */
lexutil.symmetricDifference = function(arr1, arr2) {
    return arr1.filter(val => !arr2.includes(val))
           .concat(arr2.filter(val => !arr1.includes(val)));
}




//*******************************************************
// ESCAPE CHARS functions
//*******************************************************

/**
 * Escape quotes in a string
 * @param {String} str - The string to process\
 * @returns {String} the string with quotes escaped
 */
lexutil.getEscape = function(str){
	if (str.indexOf("'")>-1 )
		return str.replace(/\'/g, "\\'");
	return str.replace(/\"/g, "\\\"");
};

/**
 * Put quotes around a string and escape the string
 * @param {String} str - The string to quote and escape
 * @returns {String} the quoted escaped string
 */
lexutil.quote = function(str){
	return "'"+lexutil.getEscape(str)+"'";
};


/**
 * Escape regular expression characters in a string
 * (see: http://snipplr.com/view/9649/)
 * (see: http://stackoverflow.com/questions/280793/case-insensitive-string-replacement-in-javascript) 
 * 
 * @param {String} str - The string to process
 * @returns {String} the string with all RegEx characters escaped
 */
lexutil.escapeRegexChars = function(str){
	var specials = new RegExp("[.*+?|()\\[\\]{}\\\\]", "g"); // .*+?|()[]{}\
	return str.replace(specials, "\\$&");
};



//*******************************************************
// Regular expressions
//*******************************************************

/**
 * Check whether a string is a RegEx or not
 * @param {String} str - The string to check
 * @returns {Boolean} true if the string is a RegEx, false otherwise
 */ 
lexutil.isRegex = function(str){
	if (str.indexOf("^")>-1 || str.indexOf("$")>-1)
		return true;
	return (str != lexutil.escapeRegexChars(str));
}


/**
 * Replace all occurrences of a RegEx string.
 * (see: https://stackoverflow.com/questions/1144783/how-to-replace-all-occurrences-of-a-string-in-javascript)
 * 
 * beware: for IE compatibility, the search argument must be a string, and not a RegEx literal
 * (t.i.  "^(...)$" instead of /^(...)$/
 * (see: https://stackoverflow.com/questions/40629314/javascript-regexp-not-working-in-ie11-and-working-in-chrome)
 * 
 * @param {String} search - The RegEx string to search for
 * @param {String} replacement - The string to replace with
 * @returns {String} the string with all occurrences of search replaced by replacement
 * @see String.prototype.replaceAll
 */
String.prototype.regexReplaceAll = function(search, replacement) {
 var target = this;
 return target.replace(new RegExp(search, 'g'), replacement);
};


/**
 * jquery RegEx selector
 * Usage:	$(':regex(id,^[aeiou])');
 * 			$('div:regex(class,[0-9])');
 * 			$('script:regex(src,jQuery)');
 * 
 * (source: https://j11y.io/javascript/regex-selector-for-jquery/) 
 */
jQuery.expr[':'].regex = function(elem, index, match) {
    var matchParams = match[3].split(','),
        validLabels = /^(data|css):/,
        attr = {
            method: matchParams[0].match(validLabels) ? 
                        matchParams[0].split(':')[0] : 'attr',
            property: matchParams.shift().replace(validLabels,'')
        },
        regexFlags = 'ig',
        regex = new RegExp(matchParams.join('').replace(/^\s+|\s+$/g,''), regexFlags);
    return regex.test(jQuery(elem)[attr.method](attr.property));
}


//*******************************************************
// NULL or undefined
//*******************************************************


/**
 * Check if an object is null
 * @param {Object} o - The object to check
 * @returns {Boolean} true if the object is null
 */
$.isNull = function(o){
	return (o === null);
}

/**
 * Check if the object is undefined, that is no value has been set for it. This will return false for variables with null value.
 * @param {Object} o - The object to check
 * @returns {Boolean} true if the object is undefined
 */
$.isUndefined = function(o) {
	return (typeof o === "undefined");
}

/**
 * Check if the object provided is null, or undefined.
 * @param {Object} o - The object to check
 * @returns {Boolean} true if the object is null or undefined
 */
$.isNullOrUndefined = function(o){
	return $.isNull(o) || $.isUndefined(o);
}



/**
 * Make sure an array contains no null values, by converting those into 'NULL' strings.
 * 
 * We need this function in some ajax calls, as we otherwise can't use 'join' to
 * concat arguments values into one string (sent by ajax),
 * so such values need to be converted into strings (the webservice will
 * convert those back into true NULL values afterwards)
 * NB: this type of conversion is not needed for true/false, as join can deal with those values as wished.
 * 
 * @param {Array} arr - The array to process
 * @returns {Array} the array with all null values converted into 'NULL' strings
 */
lexutil.convertNullToString = function(arr){
	
	if (arr == null)
		return arr;
	
	for (var i=0; i<arr.length; i++) {
		if (arr[i] == null)
			arr[i] = 'NULL'; // beware: it must be uppercase, as the webservice expects that!
	}
	return arr;
}





//*******************************************************
// HTML entities
//*******************************************************

/**
 * Check if a given HTML entity is a common one. 
 * If the input contains a custom IvdNT entity, the function should return false.
 * @param {String} sStr - An HTML entity as a string
 * @return {Boolean} true if the entity is a common one, false otherwise
 */
lexutil.isCommonEntity = function(sStr){	
	
	var regex = /(&)(ldquor|rdquo|mdash|quot|apos|amp|lt|gt|nbsp|iexcl|cent|pound|curren|yen|brvbar|sect|uml|copy|ordf|laquo|not|shy|reg|macr|deg|plusmn|sup2|sup3|acute|micro|para|middot|cedil|sup1|ordm|raquo|frac14|frac12|frac34|iquest|times|divide|thorn|szlig|agrave|aacute|acirc|aelig|atilde|auml|aring|aelig|ccedil|egrave|eacute|ecirc|euml|igrave|iacute|icirc|iuml|eth|ntilde|ograve|oacute|ocirc|oelig|otilde|ouml|oslash|ugrave|uacute|ucirc|uuml|yacute|thorn|yuml|rdquo|ldquo)(;)/gi;
	return sStr.match(regex);
}


// globals for the translation of characters into HTML entities
lexutil.aFnChar = "⊇|„|”|—|\"|'|&|<|>| |¡|¢|£|¤|¥|¦|§|¨|©|ª|«|¬|­|®|¯|°|±|²|³|´|µ|¶|·|¸|¹|º|»|¼|½|¾|¿|×|÷|þ|ß|à|á|â|æ|ã|ä|å|æ|ç|è|é|ê|ë|ì|í|î|ï|ð|ñ|ò|ó|ô|œ|õ|ö|ø|ù|ú|û|ü|ý|þ|ÿ|”|“".split("|");
lexutil.aFnEntities = "supe|ldquor|rdquo|mdash|quot|apos|amp|lt|gt|nbsp|iexcl|cent|pound|curren|yen|brvbar|sect|uml|copy|ordf|laquo|not|shy|reg|macr|deg|plusmn|sup2|sup3|acute|micro|para|middot|cedil|sup1|ordm|raquo|frac14|frac12|frac34|iquest|times|divide|thorn|szlig|agrave|aacute|acirc|aelig|atilde|auml|aring|aelig|ccedil|egrave|eacute|ecirc|euml|igrave|iacute|icirc|iuml|eth|ntilde|ograve|oacute|ocirc|oelig|otilde|ouml|oslash|ugrave|uacute|ucirc|uuml|yacute|thorn|yuml|rdquo|ldquo".split("|");

/**
 * Translate a character into an HTML entity.
 * @param {String} sChar - The character to translate
 * @return {String} the HTML entity corresponding to the character
 */
lexutil.translateCharToEntity = function(sChar){
	var iIndex = $.inArray(sChar, lexutil.aFnChar);
	if (iIndex>-1)
		return "&"+ lexutil.aFnEntities[iIndex]+";";
	return sChar;
}

/**
 * Translate an HTML entity into a character.
 * @param {String} sEntity - The HTML entity to translate
 * @return {String} the character corresponding to the HTML entity
 */
lexutil.translateEntityToChar = function(sEntity){
	var sEntityMain = sEntity.replace(/&/, '').replace(/;/, '');
	var iIndex = $.inArray(sEntityMain, lexutil.aFnEntities);
	if (iIndex>-1)
		return lexutil.aFnChar[iIndex];
	return sChar;
}



//*******************************************************
// Compute / get INDEXES
//*******************************************************


/**
 * JavaScript implementation of indexOf(RegEx, start)
 * (see: http://stackoverflow.com/questions/273789/is-there-a-version-of-javascripts-string-indexof-that-allows-for-regular-expr)
 * 
 * @param {String} regex - The regular expression to search for
 * @param {Integer} startpos - The starting position
 * @returns {Integer} the index of the regular expression in the string, -1 if not found
 */
String.prototype.regexIndexOf = function(regex, startpos) {
	var indexOf = this.substring(startpos || 0).search(regex);
	return (indexOf >= 0) ? (indexOf + (startpos || 0)) : indexOf;
};



/**
 * JavaScript implementation of lastIndexOf(regex, start)
 * (see: http://stackoverflow.com/questions/273789/is-there-a-version-of-javascripts-string-indexof-that-allows-for-regular-expr)
 * 
 * @param {String} regex - The regular expression to search for
 * @param {Integer} startpos - The starting position
 * @returns {Integer} the last index of the regular expression in the string, -1 if not found
 */
String.prototype.regexLastIndexOf = function(regex, startpos) {
	regex = (regex.global) ? regex : new RegExp(regex.source, "g" + (regex.ignoreCase ? "i" : "") + (regex.multiLine ? "m" : ""));
	if (typeof (startpos) == "undefined") {
		startpos = this.length;
	} 
	else if(startpos < 0) {
		startpos = 0;
	}
	var stringToWorkWith = this.substring(0, startpos + 1);
	var lastIndexOf = -1;
	var nextStop = 0;
	while ((result = regex.exec(stringToWorkWith)) != null) {
		lastIndexOf = result.index;
		regex.lastIndex = ++nextStop;
	}
	return lastIndexOf;
};




// ******************************************
// THIS FUNCTION ISN'T PART OF PUBLIC API
// ******************************************
// HELP FUNCTION OF fn.getSelectedTextInNode() and fn.getWordClickedUponInNode()
//
// Given a main string in which a substring was found at a given index
// compute the true start and end indexes in the same string containing html entities
//
lexutil.getTrueIndexes = function(sRangeStringDecodedEntities, sNodeStringEncodedEntities, sSelectionDecodedEntities, selectionStartIndex, bPushWordBoundaries){
	
	// debug!
	var debug = false;
	
	if (debug)
		{
		console.log("-----------------------------------------------------------");
		console.log("bPushWordBoundaries="+bPushWordBoundaries);
		console.log("sRangeStringDecodedEntities = "+sRangeStringDecodedEntities);
		console.log("sNodeStringEncodedEntities = "+sNodeStringEncodedEntities);
		console.log("sSelectionDecodedEntities = "+sSelectionDecodedEntities);
		console.log("selectionStartIndex = "+selectionStartIndex);
		}
	
	// [1] We need to restore the ENcoded entities, since calling range.toString() cause those to be DEcoded,
	//     in such a way that indexes might not fit the table data. 
	
	// get quote with ENcoded entities 
	var mainStringAndCorrection = 				lexutil.reEncodeEntities( sNodeStringEncodedEntities, sRangeStringDecodedEntities );
	var mainString = 							mainStringAndCorrection["restored_entities"];
	
	if (debug) {
		console.log("mainString = "+mainString);
	}
	
	
	// compute new start position given the corrected quote string
	var sPrefixDecodedEntities =				sRangeStringDecodedEntities.substring( 0, selectionStartIndex );	
	var sPrefixEncodedEntitiesAndCorrection = 	lexutil.reEncodeEntities( sNodeStringEncodedEntities, sPrefixDecodedEntities );
	var sPrefixEncodedEntities = 				sPrefixEncodedEntitiesAndCorrection["restored_entities"];
	
	var iCorrection = 							sPrefixEncodedEntitiesAndCorrection["index_correction"]; //(sPrefixEncodedEntities.length - sPrefixDecodedEntities.length);
	// from now on, selectionStartIndex must be applied to strings with ENcoded entities, instead of range.toString()
	// 
	selectionStartIndex = 						lexutil.getIndexOfTrueStart(sNodeStringEncodedEntities, selectionStartIndex + iCorrection);
	
	if (debug) {
		console.log("sPrefixDecodedEntities = "+sPrefixDecodedEntities);
		console.log("sPrefixEncodedEntities = "+sPrefixEncodedEntities);
		console.log("selectionStartIndex (herberekend) = "+selectionStartIndex);
	}
	
	
	// do the same with the selection
	
	var sSelectionPartEncodedEntities = sNodeStringEncodedEntities.substring( selectionStartIndex );
	var selection = (lexutil.reEncodeEntities( sSelectionPartEncodedEntities, sSelectionDecodedEntities ))["restored_entities"];	
	
	if (debug) {
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
	
	if (debug) {
		console.log("newSelectionStartIndex = "+newSelectionStartIndex);
		console.log("newSelectionEndIndex = "+newSelectionEndIndex);
	}
		
	// if required (it is when a word has been clicked upon, so we search for its boundaries automatically)
	// check if the word is truely surrounded by spaces or such. If not, look for the true boundaries of the word.
	// (this is needed, because the selection was obtained by checking the node what was clicked upon; but sometimes
	//  a word can be spread among several nodes, because of in-between tags for style etc).
	if (bPushWordBoundaries) {
		newSelectionStartIndex = lexutil.getIndexOfPreviousSpace(mainString, newSelectionStartIndex) + 1;
		newSelectionEndIndex   = lexutil.getIndexOfFollowingSpace(mainString, newSelectionEndIndex);
		
		if (debug) {
			console.log("after PushWordBoundaries:");
			console.log("newSelectionStartIndex = "+newSelectionStartIndex);
			console.log("newSelectionEndIndex = "+newSelectionEndIndex);
		}
	}
	
	// finally make sure the start index is not a closing tag
	while ( $.startsWith(mainString.substring(newSelectionStartIndex), "<\/") ) {
		newSelectionStartIndex = mainString.indexOf(">", newSelectionStartIndex) + 1;
	}

	// if (debug)
	// 	{
	// 	console.log(mainString);
	// 	console.log(mainString.indexOf(selection.toLowerCase()));
	// 	console.log(mainString.indexOf(selection.toLowerCase(), newSelectionStartIndex));
	// 	}

	return {
		"start": newSelectionStartIndex,
		"end": newSelectionEndIndex
	};
}

// subfunction of lexutil.getTrueIndexes(...)
lexutil.computeTrueIndex = function(mainString, incorrectIndex){
	
	var indexCorrection = 0;
	var indexWithoutTags = -1;
	var withinTag = false;
	
	for (var i=0; i<mainString.length; i++) {		
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

// yet another subfunction of lexutil.getTrueIndexes(...)
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
// This allows the lexutil.getTrueIndexes() function to work correctly, and compute 
// text selection indexes that fit the original table data!
//
// input:  [1] full original table data with ENcoded entities
//         [2] substring with DEcoded entities, in which we want to restore the ENcoded entities
// output: [a] string as in [2] where the DEcoded (but originally ENcoded) entities are re-ENcoded
//         [b] the numeric correction to apply to indexes, since [a] might be larger than [2].
lexutil.reEncodeEntities = function(sEncodedEntities, sDecodedEntities){
	
	var indexesToEntities = new Hashtable();
	var indexesToTags = new Hashtable();
	var iLength = sDecodedEntities.length;
	var iCorrectionToApply = 0;
	
	// IMPORTANT:
	// In the following, we loop through the DEcoded string and compare the current character position (at index i)
	//    with the very same position in the ENcoded string.
	// As soon as we encounter a MISmatch, that means we have an DEcoded char on the one side, and an ENcoded char on the other.
	// So, in such a case:
	//  * we first extract the encountered CODE (tag or entity) and store it with its positon in a hash;
	//  * as a second step, we replace the CODE by its DEcoded char in the encoded string, so as to be able to keep comparing both strings
	//    at the same index i: if we wouldn't replace the codes by the chars, we wouldn't be able to compare the strings further on, because
	//    a code obviously occupies a different number of chars positions that the single decoded char!  
	for (var i=0; i<iLength; i++) {
	
		// we found a tag
		if ( sEncodedEntities.charAt(i) == "<" && 
			 sDecodedEntities.charAt(i) != sEncodedEntities.charAt(i) ) {			
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
			 (	sDecodedEntities.charAt(i) != sEncodedEntities.charAt(i) // expected mismatch between char and corresponding entity
				||
				( // small exception: condition hereabove won't work with '&', because it starts the same as '&amp;'
				sDecodedEntities.substring(i, i+"&amp;".length) != "&amp;"
				&&
				sEncodedEntities.substring(i, i+"&amp;".length) == "&amp;"
				)
			 )
			 ) {
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
	
	for (var i=iLength; i>=0; i--) {	
		var sEntity =	indexesToEntities.get(i);
		var sTag = 		indexesToTags.get(i);
		
		if (sEntity != null) {
			// (end-pos + 1 to skip the DEcoded entity, which is replaced by sEntity
			sDecodedEntities = sDecodedEntities.substring(0, i) + sEntity + sDecodedEntities.substring(i+1);
			// (length-1, because we replace a DEcoded entity [1 char] by its ENcoded entity [n chars] -> n-1
			iCorrectionToApply += (sEntity.length-1); 
		}
		if (sTag != null) {
			// (end-pos without +1, because there's nothing to skip here, instead we just insert sTag)
			sDecodedEntities = sDecodedEntities.substring(0, i) + sTag + sDecodedEntities.substring(i);
			iCorrectionToApply += sTag.length;
		}
	}
	
	// return the substring in which we restored the DEcoded entities of the original table data
	return {"restored_entities": sDecodedEntities, "index_correction": iCorrectionToApply};
}



// Find the first preceding space before a given index.
// We need this function to solve a particular flaw of the fn.getSelectedTextInNode function:
// Getting the selected text works given a node that has been clicked upon. In most cases,
// this is good enough. Sadly, in some cases, this method doesn't give the right text boundaries,
// because a word happens to be broken up in several nodes due to tags assigning style etc.
// So, to be able to get the true word boundaries, we try to find the surrounding true spaces,
// meaning that we exclude space within a tag, of course.
lexutil.getIndexOfPreviousSpace = function(mainString, startIndex){
	
	var withinTag = false;
	
	for (var i=startIndex; i>=0; i--) {
		var currentChar = mainString.charAt(i);
		if (currentChar==">") 
			withinTag = true;
		
		if (currentChar.match(/[\^\$\(\)\[\]\{\}\\\|\.\*\+\?\s'"!:;,&@#%=]/) && !withinTag){
			return i;						
		}
		
		if (currentChar=="<") withinTag = false;
	}
	
	// We reach this point when the string part in range [0, startIndex]  
	// contains no space at all (outside the tags).
	// In that particular case, strictly speaking, the space preceeding
	// the first letter of the string is at index -1.
	return -1;
}


// Find the first following space after a given index.
// See explanation at previous function lexutil.getIndexOfPreviousSpace()
lexutil.getIndexOfFollowingSpace = function(mainString, endIndex){
	
	var withinTag = false;
	
	for (var i=endIndex; i<mainString.length; i++) {
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


// if a word starts with some tags, compute the start-index skipping the front tags
lexutil.getIndexOfTrueStart = function(fullString, startIndex){

	if (fullString.charAt(startIndex) != '<')
		return startIndex;

	var sFrontTag = fullString.substring(startIndex).replace(/^((\<[^\>]+?\>)+)([^\<])(.+)$/, '$1');
	
	return startIndex + sFrontTag.length;
}





// *******************************************************
// z-index computations
// *******************************************************

/**
 * Put the element in front of all other elements on the page
 * 
 * (see: https://stackoverflow.com/questions/1768150/how-to-add-a-function-to-jquery)
 * @param {Boolean} absoluteMax - If true, put in front of anything in the page, otherwise exclude some divs which must keep their z-index the highest (like tiptip_holder)
 */
jQuery.fn.putInFront = function(absoluteMax) {

	if (absoluteMax == null)
		absoluteMax = false;
	
	// get highest z-index on page
	// but exclude some divs, which have their own z-index, and which must keep their z-index the highest (like tiptip_holder)
	var iHighestZindex = lexutil.getHighestZindex();	
	
	var o = $(this[0]); // This is the selector element
	// remember this one in case of visibility issues:
	// https://stackoverflow.com/questions/6762174/jquery-uis-autocomplete-not-display-well-z-index-issue
	// => o.css("z-index", (iHighestZindex + 1) );
	
	// PROBLEM of previous command caused by jQuery not understanding the !important attribute in css function
	// (https://stackoverflow.com/questions/2655925/how-to-apply-important-using-css)
	// so, we do it this way:
	//o.attr('style', function(i,s) { return (s||'') + 'z-index: '+(iHighestZindex + 1)+ ' !important;' });
	o[0].style.setProperty('z-index', (iHighestZindex + 1), 'important');	
}


/**
 * Get the highest z-index in the page
 * 
 * (see https://stackoverflow.com/questions/1118198/how-can-you-figure-out-the-highest-z-index-in-your-document)
 * (see: https://www.sitepoint.com/jquery-find-highest-z-index-page/)
 * @param {Boolean} absoluteMax - If true, get the highest z-index of all elements in the page, otherwise exclude some divs
 * @returns {Integer} the highest z-index
 */
lexutil.getHighestZindex = function(absoluteMax){

	var selector = absoluteMax ? "body" : ':not(div#tiptip_holder,div#tiptip_content,div#tiptip_arrow)';
	var highest = Math.max.apply(null, $.map($(selector), function(e, n){
        if($(e).css('position')=='absolute')
             return parseInt($(e).css('z-index'))||1 ;
        })
	);
	return parseInt(highest);
}


/**
 * Get the z-index of the table in front of all other tables
 * @returns {Integer} the z-index of the table in front
 */
lexutil.getZindexOfTableInFront = function(){
	
	// get highest z-index of all visible tables
	var aTables = mt.getListOfLoadedTables();
	var iHighestZindex = 0;
	for (var i=0; i<aTables.length; i++) {
		var iCurrentZindex = $("#"+aTables[i]+"_dynamic").css("z-index");
		iCurrentZindex = (iCurrentZindex == 'auto' ? 0 : parseInt(iCurrentZindex) ); 
		if (iCurrentZindex > iHighestZindex)
			iHighestZindex = iCurrentZindex;		
	}	
	return iHighestZindex;
}



//*******************************************************
// Http parameters 
// ******************************************************

/**
 * Get the current http params into a hashtable object (or the value of a given key, if given)
 * @param {String} sKey - The key to search for (optional)
 * @returns {Hashtable|String} the http parameters as a Hashtable of parameters and values, or the value of the given parameter
 */
lexutil.getHttpParams = function(sParameter){
	
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
	
	
	// if no paramter name is given, return all parameters in a Hashtable
	if (sParameter == null){
		// put the parameters pairs in a hashmap
		for (var i=0; i<paramsPairs.length; i++) {
			var paramName  = paramsPairs[i].split("=")[0];
			var paramValue = paramsPairs[i].split("=")[1];
	
			paramsHash.put(paramName, paramValue);
		}
		
		return paramsHash;
	}
	// otherwise, return the value of the given sarameter
	else {
		for (var i=0; i<paramsPairs.length; i++) {
			var paramName  = paramsPairs[i].split("=")[0];
			if (paramName != sParameter)
				continue;			
			return paramsPairs[i].split("=")[1];
		}
	}
	
	// if we reach this point, the key was not found
	return null;	
};


//*******************************************************

/**
 * Set the statistics for the current page
 * @param {String} sDomain - The domain to set (optional, default is "lex-it.ivdnt.org")
 */
lexutil.setStatistics = function(sDomain = "lex-it.ivdnt.org"){
	// we use vanilla javascript instead of jquery, because jquery intercepts appending script tags 
	// and only executes the src, thus ignoring the data-domain attribute.
	const script = document.createElement("script");
	script.defer = true;
	script.setAttribute("data-domain", sDomain);
	script.src = "https://statistiek.ivdnt.org/js/script.js";
	document.head.appendChild(script);
};


//*******************************************************

// ******************************************
// THIS FUNCTION ISN'T PART OF PUBLIC API
// ******************************************
// get info from a jqXHR object
//
lexutil.getJqXHRInfo = function(jqXHR){
	
	// get http parameters
	var paramsHash = lexutil.getHttpParams();
	
	// are we in test mode?
	var bTest = (paramsHash!=null &&
			paramsHash.get("test")!=null && 
			paramsHash.get("test")=='true');
	
	// if Lex'it is running on home address or is in test mode, give jqXHR info
		
	if ( document.URL.regexIndexOf( INL_HOMEURL )>-1 || bTest) {

		if ( jqXHR != null ) {
			if ( $.isNullOrUndefined(jqXHR["responseText"]) ) {				
				return JSON.stringify(jqXHR);
			}
			else {
				// get tomcat text response 
				var message = lexutil.parseServiceResponseText(jqXHR["responseText"]);
				// get ride of style
				message = message.replace(/\<style.+?\<\/style\>/gi, '');
				// put that in a dialog
				return '<div style="overflow: auto; max-height:400px">'+ message +'</div>';
			}
		}	
		return "no jqXHR info";	
	}
	
	// otherwise we will not	
	return "";		
}



//*******************************************************

/**
 * Translate a boolean-like value (like 0/1 or t/f) into a true/false boolean
 * @param {Mixed} mSomeValue - The value to translate
 * @returns {Boolean} the translated value
 */
lexutil.translateBoolean = function(mSomeValue){
	
	if (mSomeValue==1 || mSomeValue=='1' || mSomeValue==true || mSomeValue=='t' || mSomeValue=='true')
		return true;
	if (mSomeValue==0 || mSomeValue=='0' || mSomeValue==false || mSomeValue=='f' || mSomeValue=='false')	
		return false;
}




//*******************************************************


// ******************************************
// THIS FUNCTION ISN'T PART OF PUBLIC API
// ******************************************
// HELP FUNCTION OF lexutil.getJqXHRInfo()
//
// If we got some message when accessing the webservice,
// see if it contains a custom message between <lexit> tags.
// If it does, return only that!
// Otherwise return the message as is.
//
lexutil.parseServiceResponseText = function(sErrormessage){

	var iMessageStart = sErrormessage.regexIndexOf("(\<|&lt;)lexit(\>|&gt;)");
	var iMessageEnd = sErrormessage.regexIndexOf("(\<|&lt;)(/|&#47;)lexit(\>|&gt;)");

	if (iMessageStart < iMessageEnd){
		return "<BR><B>" + sErrormessage.substring(iMessageStart, iMessageEnd).replace(/(\<|&lt;)lexit(\>|&gt;)/, "") + "</B>"; // allow custom message to stand out 
	}
	else {
		return sErrormessage;
	}
}




//*******************************************************

// ******************************************
// THIS FUNCTION ISN'T PART OF PUBLIC API
// ******************************************
// Upload a file and convert it into a database table (from a dialog)
//
lexutil.uploadFile = function(sFileName) {

	var file = (sFileName!=null ? sFileName : $('#fileChooser')[0].files[0]); // get the file from the form

	// make sure a file was chosen, or give an error message!
	if (typeof file == 'undefined') {
		fn.message(lang.error, lang.import_dialog_msg+"!");
		return;
	}

	// data to be sent to the server
	var dbName = fn.getCurrentProject();
	var formData = new FormData();

	formData.append('file', file);
	formData.append('db', dbName);
	
	// show the file is now being loaded
	fn.closeDialog();
	fn.message(lang.import_dialog_title, lang.loading_file + " ...");

	// this might take a while, so put spinner
	lexutil.showSpinner("#dynamic", true);

	setTimeout(function() {
		var url = WEBSERV_URL+"/api/upload_file";

		$.ajax({
			url: url,
			type: 'POST',
			data: formData,
			contentType: false, // Required for correct boundary string
			processData: false, // Necessary to prevent jQuery from transforming the data
			success: function(xml) {

				// remove spinner
				lexutil.removeSpinner("#dynamic");
				
				// remove upload dialog
				fn.closeDialog();

				// now we will reload lex'it with the table holding the uploaded file
				var sLoadedSheet = fn.getDbResponse(xml);

				// keep test mode if it was on
				var bTestMode = (paramsHash!=null &&
					paramsHash.get("test")!=null &&
					paramsHash.get("test")=='true');

				// temporarily turn off the Chrome fix (see index.html)
				// this is needed to allow a redirect, without triggering a dialog in Chrome preventing it!
				$(window).off('beforeunload');

				// reload!
				//var redirectUrl = document.URL.substring(0, document.URL.indexOf("?"));
				//window.location.replace(redirectUrl + "?db=" + lexutil.getHttpParams().get("db") + "&table=" + sLoadedSheet + ( bTestMode ? "&test=true":""));
				fn.callTable(sLoadedSheet);

				// ALTERNATIVE implementation
				//
				// fn.declareNewTable(...);

			},
			error: function(xhr, status, error) {
				
				lexutil.removeSpinner("#dynamic");
				fn.closeDialog();
				
				fn.message(lang.error, lang.loading_file_failed);
			}
		});
	}, 100);

}


//******************************************************* 