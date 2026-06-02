
jQuery.fn.putInFrontX = function(absoluteMax) {

        if (absoluteMax == null)
                absoluteMax = false;

        // get highest z-index on page
        // but exclude some divs, which have their own z-index, and which must keep their z-index the highest (like tiptip_holder)
        var iHighestZindex = getHighestZindexX();

	console.log(`Highest index now: ${iHighestZindex}`);
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

// https://stackoverflow.com/questions/1118198/how-can-you-figure-out-the-highest-z-index-in-your-document
// https://www.sitepoint.com/jquery-find-highest-z-index-page/

function getHighestZindexX(absoluteMax) {

        var selector = absoluteMax ? "body" : ':not(div#tiptip_holder,div#tiptip_content,div#tiptip_arrow,.menu-item)';
        var highest = Math.max.apply(null, $.map($(selector), function(e, n){
        if($(e).css('position')=='absolute')
             return parseInt($(e).css('z-index'))||1 ;
        })
        );
        return parseInt(highest);
}
