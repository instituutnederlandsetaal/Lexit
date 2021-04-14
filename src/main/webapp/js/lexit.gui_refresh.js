/**
 * Graphic user interface - page refresh part
 */


var refr = {};


//refresh all tables upon:
//- resizing of the window
//- coming back to the window by closing a tab

var lastLayoutUpdateTime = null; // seconds
var layoutUpdateLatency = 0; // seconds

$(window).resize(function(){
	refr.updateLayout(false);
});


//Check loss or gain of focus


//needed to detect true loss of focus on window
//see: http://stackoverflow.com/questions/1060008/is-there-a-way-to-detect-if-a-browser-window-is-not-currently-active

(function() {
var hidden, change, vis = {
      hidden: "visibilitychange",
      mozHidden: "mozvisibilitychange",
      webkitHidden: "webkitvisibilitychange",
      msHidden: "msvisibilitychange",
      oHidden: "ovisibilitychange" /* not currently supported */
  };             
for (hidden in vis) {
  if (vis.hasOwnProperty(hidden) && hidden in document) {
      change = vis[hidden];
      break;
  }
}
if (change)
  document.addEventListener(change, onchange);
else if (/*@cc_on!@*/false) // IE 9 and lower
	 document.onfocusin = document.onfocusout = onchange;
else
  window.onfocus = window.onblur = onchange;

function onchange (evt) {
	 
	 var idOfThisInstance = $("#page_id").attr("name");
	 var idInCookie = $.cookie('active_lexit_window'); 
	 
  evt = evt || window.event;
  
  var sWindowVisibility = "";

  if (evt.type == "focus" || evt.type == "focusin")
  	{        	
 	 sWindowVisibility = "visible";            
  	}
  else if (evt.type == "blur" || evt.type == "focusout")
  	{
 	 sWindowVisibility = "hidden";
  	}
  else  
  	{
 	 sWindowVisibility = this[hidden] ? "hidden" : "visible";        	
  	}
  
  // activate the page layout trigger only when
  // the window gets visible for the first time 
  // (that is: when the current page id is different from the
  //  active page id registered in the cookie; from now, the current
  //  page id will be saved into the cookie, so in the next round
  //  we will know for sure that the window doesn't get visible
  //  for the first time = parasite blur/focus events)
  if ( sWindowVisibility=="visible")
 	 {    	 
 	 refr.fireUpdateAtFocusGain();
 	 }
  
  if ( sWindowVisibility=="hidden")
 	 {    	 
 	 refr.fireUpdateAtFocusLoss();
 	 }
  
  // save currently visible window in the cookie, for the next round
  if ( sWindowVisibility=="visible" )
 	 {
	  $.cookie('active_lexit_window', idOfThisInstance);
	  // and tell the webservice which tab the user is working in
	  sendActiveTabIdToService(idOfThisInstance);
 	 }
  
}
})();

// These functions rely silently on the onchange function 
// to detect if focus or blur had genuinely occured 

refr.fireUpdateAtFocusGain = function(){	

	// gain of focus might trigger a custom function
	if (typeof fnDoAtFocusGain === "function")
		fnDoAtFocusGain();
	
	// update the layout upon focus
	refr.updateLayout(true);	
};


refr.fireUpdateAtFocusLoss = function(){

	// loss of focus might trigger a custom function
	if (typeof fnDoAtFocusLoss === "function")
		fnDoAtFocusLoss();
};


// subroutine for job upon focus
refr.updateLayout = function(bRefreshTable){

	var currentUpdateAttemptTime = Math.floor($.now()/1000);
	
	if ( lastLayoutUpdateTime == null || 
			(currentUpdateAttemptTime - lastLayoutUpdateTime) >layoutUpdateLatency){

		lastLayoutUpdateTime = currentUpdateAttemptTime;
		
		for (var i=0; i<mt.getListOfLoadedTables().length; i++){			
			var sTableName = mt.getListOfLoadedTables()[i];
			var aTbableSettings = conf.getTableSettings(sTableName);
			
			$("#"+sTableName).css("width", "100%");
						
			// adapt search boxes if available
			if ( $("#"+sTableName+"_searchboxes").elementExists())
				setTimeout("gui.setSearchboxesCss('"+sTableName+"')", 100);

			
			// refresh table content if required
			// (table should be visible and refresh upon focus must be allowed)
			if (bRefreshTable && !fn.tableIsHidden(sTableName) && conf.getRefreshUponFocus(aTbableSettings) ){
				fn.refreshTable(sTableName);				
			}
			
			gui.setPositionOfPaginationPane(sTableName);
		}
	}
	
};