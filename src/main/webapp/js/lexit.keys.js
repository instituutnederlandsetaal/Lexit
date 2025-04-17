
/** 
 * The kf namespace deals with key functions handling
 * @namespace */
var kf = {};


var sKeyPressed = "";
var sKeyReleased = "";
var bKeyDebug = false;


// keep track of active table...
var sActiveTableName = null;
// ... and of active row of each table
var aActiveRowNumber = {};


// get and set the active table (t.i. the table that has focus for arrow keys)
kf.setActiveTable = function(sTableName){
	
	var sPreviousActiveTable = kf.getActiveTable();
	if (sPreviousActiveTable != null)
		{
		// show focus is lost on current active table
		$("#"+sPreviousActiveTable+"_tablename").css("color", "#A4A4A4");
		}
	
	sActiveTableName = sTableName;
	// show focus is gained
	$("#"+sActiveTableName+"_tablename").css("color", "#000000");
};

kf.getActiveTable = function(){
	return sActiveTableName;
};


// get and set the active row (t.i. the table/row that has focus for arrow keys)
kf.setActiveRowNumber = function(iRowNumber){
	aActiveRowNumber[kf.getActiveTable()] = iRowNumber;
};

kf.getActiveRowNumber = function(){
	
	// if some process deleted some rows, in such a way that the current active row
	// number doesn't exist anymore, we should put it back to zero	
	var sTable = kf.getActiveTable();
	var iActiveRowNumber = aActiveRowNumber[sTable] || 0;
	
	var nTargettedNode = "#"+sTable+" tbody tr:not('.group'):eq("+iActiveRowNumber+")";
	if ( !$(nTargettedNode).elementExists() )
		aActiveRowNumber[sTable] = 0;
	
	// return value as requested
	return aActiveRowNumber[sTable];
};


/**
 * Check if the last pressed key is a given key name
 * @param {String} sKeyName - Name of a key (eg. 'f1', 'esc', 'a', 'b', ...)
 * @returns {Boolean} true if the given key was pressed
 */
kf.isPressed = function(sKeyName){
	return (kf._getPressedKey()==sKeyName);
};
// check if the last released key is a given key name
kf.wasPressed = function(sKeyName){
	return (kf._getReleasedKey()==sKeyName);
};


//register the name of the pressed key, given its code
kf.registerPressedKey = function(event){
	
	var iCode = (event != null) ? event.keyCode : -1;
	// Cmd (Mac) should be seen as CTRL
	if (event.metaKey) iCode = 17; 
	
	if (kf._getPressedKey() != kf._translateCode(iCode) )
		kf._setReleasedKey( kf._getPressedKey() );
	kf._setPressedKey( kf._translateCode(iCode) );
	
	if (kf._getPressedKey() == 'shift' || kf._getPressedKey() == 'ctrl')
		fn.setBackgroundColor("lightgrey");
	else
		fn.setBackgroundColor("white");
};

//register the name of the pressed key, given its code
kf.registerReleasedKey = function(){
	
	if (kf._getPressedKey() != "released")
		kf._setReleasedKey( kf._getPressedKey() );
	kf._setPressedKey("released");	
	
	if ((kf._getReleasedKey() == 'shift' || kf._getReleasedKey() == 'ctrl') && ((kf._getPressedKey() != 'shift' && kf._getPressedKey() != 'ctrl')))
		fn.setBackgroundColor("white");
};





/**
 * Get the name of the last pressed key
 * @returns {String} Name of a key (eg. 'f1', 'esc', 'a', 'b', ...)
 */
kf._getPressedKey = function(){
	return sKeyPressed;
};

/**
 * Set the name of the last pressed key
 * @param {String} sKeyName - Name of a key (eg. 'f1', 'esc', 'a', 'b', ...)
 */
kf._setPressedKey = function(sKeyName){
	
	sKeyPressed = sKeyName;
	
	
	if (sKeyPressed == "ctrl"){ // CTRL
		// deactivate mouse click functions, since CTRL is about selecting (prevents function triggering)
		conf.deactivateConfigFunctionsInAllTables();
	}
	else if (sKeyPressed == "shift") { // Shift    		
		// deactivate mouse click functions, since Shift is about selecting (prevents function triggering)
		conf.deactivateConfigFunctionsInAllTables();
		// disable highlighting of text when selecting rows with shift pressed
		$('html, body').disableSelection(); 
	}
	else if (sKeyPressed == "escape"){ // ESC
		row.clearRowSelectionInAllTables();
		
		// make sure the autocomplete dropdown menus disappear in IE
		$(".ui-menu-item").hide();
    }
};



// get the name of the last released key
kf._getReleasedKey = function(){
	return sKeyReleased;
};
// set the name of the last released key
kf._setReleasedKey = function(sKeyName){
	
	sKeyReleased = sKeyName;	
	
	if (sKeyReleased == "ctrl"){ // CTRL
		// reactivate mouse click functions, since CTRL pressed was about selecting 
		// (deactivation was about preventing trigger of function upon click during row selection)
		conf.activateConfigFunctionsInAllTables();
	}
	else if (sKeyReleased == "shift") { // Shift
		// reactivate mouse click functions, since Shift pressed was about selecting 
		// (deactivation was about preventing trigger of function upon click during row selection)
		conf.activateConfigFunctionsInAllTables();
		// re-enable selection of text, otherwise jeditable malfunctions
		$('html, body').enableSelection(); 
	}
};






kf._translateCode = function(iCode){
	
	var translation = "unknown";
	
	if ((iCode>=48 & iCode<=90) || (iCode>=96 & iCode<=105))
		{
		return String.fromCharCode(iCode).toLowerCase();
		}
	
	switch(iCode)
	{
	case -1:		
		translation = "released";
		break;
	case 8:
		translation = "backspace";
		break;
	case 9:
		translation = "tab";
		break;
	case 13:
		translation = "enter";
		break;
	case 16:
		translation = "shift";
		break;
	case 17:
		translation = "ctrl";
		break;
	case 18:
		translation = "alt";
		break;
	case 19:
		translation = "pause";
		break;
	case 20:
		translation = "capslock";
		break;
	case 27:
		translation = "escape";
		break;
	case 32:
		translation = "spacebar";
		break;
	case 33:
		translation = "pageup";
		break;
	case 34:
		translation = "pagedown";
		break;
	case 35:
		translation = "end";
		break;
	case 36:
		translation = "home";
		break;
	case 37:
		translation = "leftarrow";
		break;
	case 38:
		translation = "uparrow";
		break;
	case 39:
		translation = "rightarrow";
		break;
	case 40:
		translation = "downarrow";
		break;
	case 45:
		translation = "insert";
		break;
	case 46:
		translation = "delete";
		break;
	case 91:
		translation = "leftwindow";
		break;
	case 92:
		translation = "rightwindow";
		break;
	case 93:
		translation = "select";
		break;
	case 106:
		translation = "*";
		break;
	case 107:
		translation = "+";
		break;
	case 109:
		translation = "-";
		break;
	case 110:
		translation = ".";
		break;
	case 111:
		translation = "/";
		break;
	case 112:
		translation = "f1";
		break;
	case 113:
		translation = "f2";
		break;
	case 114:
		translation = "f3";
		break;
	case 115:
		translation = "f4";
		break;
	case 116:
		translation = "f5";
		break;
	case 117:
		translation = "f6";
		break;
	case 118:
		translation = "f7";
		break;
	case 119:
		translation = "f8";
		break;
	case 120:
		translation = "f9";
		break;
	case 121:
		translation = "f10";
		break;
	case 122:
		translation = "f11";
		break;
	case 123:
		translation = "f12";
		break;
	case 192:
		translation = "`";
		break;
	default:
		translation = "unknown";
	};
	
	return translation;
};



//add key detection
kf.addKeyFunctions = function(){
	
	// context menu key/button function
	
	// trick to get it to work, 
	// see: http://jsfiddle.net/W7DhD/ 
	// and  http://stackoverflow.com/questions/12437918/firefox-how-to-get-context-menu-for-button	
	
	$(document).on('contextmenu', function(event){

		var sActiveTable = kf.getActiveTable();
		var iActiveRow = kf.getActiveRowNumber();
		
		// triggers jQuery.contextMenu 
		// (see: http://medialize.github.com/jQuery-contextMenu/docs.html)
		$("#"+sActiveTable+" tbody tr:not('.group'):eq("+iActiveRow+") td").contextMenu();
		
		event.preventDefault();
	});
	
	
	// normal key functions
	
	$(document).unbind('keydown');	
	$(document).bind('keydown', function(e) {
		
		var bSearchboxOfActiveTableHasFocus = $("div.dataTables_wrapper div div input").is(":focus");
		
		// detect if some dialog box is open or some autocomplete pulldown
		// (as we need to prevent scrolling down the table rows when the
		//  user actually means to scroll within a box of pulldown menu)
		
		var bSomeDialogBoxIsOpen = 	$("div.ui-dialog").elementExists() ||
									$(".ui-autocomplete-input").elementExists();
		
		
		// register which key was pressed
		kf.registerPressedKey(e);
		
		// prevent default behaviour (eg.scrolling of screen) when pressing the up/down arrows etc
		if (
				kf.isPressed("f8") ||
				kf.isPressed("pageup") || kf.isPressed("pagedown") ||
				
				// one exception is when we are within a textarea, because we want
				// to be able to navigate in there!
				( (kf.isPressed("uparrow") || kf.isPressed("downarrow")) 
						&& !$("td form textarea").elementExists()
						&& !($(e.target).is('textarea')) // not in a form
					) ||
				
				// one another exception is when the cursor is in a searchbox of the active table,
				// or when the cursor is in a field of a dialog box:
				// switching to next searchbox by pressing tab must be possible then
				(kf.isPressed("tab") && !bSearchboxOfActiveTableHasFocus && !bSomeDialogBoxIsOpen ) ||
				
				// pressing enter mustn't submit the form of the dialog box
				// (which would cause page reload; strange enough this happens only with forms having only one field)
				// (see: http://stackoverflow.com/questions/15488411/why-does-my-jquery-dialog-reload-the-page-when-enter-is-pressed)
				(kf.isPressed("enter") && bSomeDialogBoxIsOpen) ||
				
				// f5 will be used to table refresh instead of page reload
				kf.isPressed("f5")
				
			) {
						
			e.preventDefault();
		}
		
		// call user key functions
    	kf._callCustomKeyFunctions('keydown');
    	
    	// F8 (toggle tooltips in table)
    	if (kf.isPressed("f8")){
    		bTooltipsAllowedInTable = !bTooltipsAllowedInTable;
    		// force tooltip to fadeout (otherwise it will keep in sight)
			$("#tiptip_holder").fadeOut();
			
			// now refresh the tables to activate the new setting
			var aTablesToRefresh = mt.getListOfLoadedTables();
			for (var i=0; i<aTablesToRefresh.length; i++){
				var sTable = aTablesToRefresh[i];
				if (fn.tableExists(sTable))	fn.refreshTable(sTable);
			}		
    		
    	}
    	
    	// refresh active table
    	if (kf.isPressed("f5")){
    		// make sure the dropdown menus disappear in IE
			$(".ui-menu-item").hide();
			
			// refresh the active table
    		var sActiveTable = kf.getActiveTable();
    		if (sActiveTable!=null)
    			fn.refreshTable(sActiveTable);
    	}
    	
    	// logout
    	if ( (kf.isPressed("l") && e.ctrlKey && e.shiftKey) ){
			startLexitLogout(function(){
				lexitReload();
			});
		}

		// upload file
		if (  (kf.isPressed("u") && e.ctrlKey && e.shiftKey) 
				&& !$("div#context-menu-layer").elementExists() // don't interfere with context menu, text area etc
				&& !$("td form textarea").elementExists()
				&& !($(e.target).is('textarea')) // not in a form
				&& !bSomeDialogBoxIsOpen
			){
				
			e.preventDefault();
			var sUploadForm =
				"	 <BR>" +
				"    <form id=\"fileUploadForm\">" +
				"        <input type=\"file\" id=\"fileChooser\" name=\"file\" />" +
				"        <BR><BR><BR>" +
				"        <button type=\"button\" id=\"start_upload_button\" onclick=\"lexutil.uploadFile()\">"+ lang.import_uploadbutton +"</button>" +
				"    </form>";

			fn.message(lang.import_dialog_title, lang.import_dialog_msg+":<BR><BR>"+sUploadForm);
			setTimeout(function(){
					$("#dialog_accept_button")
						.text(lang.cancel)
						.attr("id", "upload_cancel_button");
						//.removeClass("ui-button").removeClass("ui-corner-all").removeClass("ui-widget")						
						
					$("#upload_cancel_button").appendTo("#fileUploadForm");
					
					$("#start_upload_button").addClass("ui-button").addClass("ui-corner-all").addClass("ui-widget")
					
					$("input#fileChooser").focus();
				}, 100); 
			
		}

    	// refresh active table AND force exact count
    	if (kf.isPressed("pause")){
    		// force exact count!
    		// this will be set back to false (default value) in function tb.processExtraParamsFromServerResponse
    		bForceExactCount = true; 
    		// but for now, do a refresh with an exact count
    		var sActiveTable = kf.getActiveTable();
    		fn.refreshTable(sActiveTable);
    	}
    	
    	
    	// F2 (shortcut for rows selection button)
    	if (kf.isPressed("f2")){
    		var sActiveTable = kf.getActiveTable();
    		
    		// special case: search and replace panel is opened (and table header is hidden)
    		if ($("#"+sActiveTable+"_search_and_replace").elementExists() ){
    			$("#"+sActiveTable+"_wrapper #"+sActiveTable+"_search_and_replace #selectionbutton").click();
    		}
    		// normal case: table header is visible
    		else {
    			$("#"+sActiveTable+"_wrapper #selectionbutton").click();
    		}
		}
    	
    	
    	// pageup/down
    	if ( kf.isPressed("pageup") || kf.isPressed("pagedown") ){			
			var sActiveTable = kf.getActiveTable();
			
			// 1. there must be some table active 
			// 2. don't interfere with context menu
			// 3. pagination must be allowed (it may have been disabled by gui.showWarningWhenRefreshingIsRequired)
			if (sActiveTable != null 
					&& !$("div#context-menu-layer").elementExists()
					&& !$("#"+sActiveTable+"_wrapper .dataTables_paginate").hasClass("dont_paginate")
				){
				if (kf.isPressed("pageup")){
					mt.getDataTableObjectOf(sActiveTable).page("previous").draw("page");
				}
				else if (kf.isPressed("pagedown")){
					
					var iCurrentPage = 		mt.getDataTableObjectOf(sActiveTable).page.info().page+1;
					var iTotalNrOfPages =	mt.getDataTableObjectOf(sActiveTable).page.info().pages;
					
					// it might occur that the estimated total number of pages is lower than the true number of pages;
					// in such cases, one might get stuck on the last page, which is actually NOT the last page.
					// So, to solve that, Lex'it checks if we are on the last page, and if so, it forces a hard refresh
					// (so Lex'it gets the true number of pages) and only then, we will be able to go to the next page.
					
					if (bForceExactCount == false && iTotalNrOfPages == iCurrentPage){
						// force exact count!
			    		// this will be set back to false (default value) in function tb.processExtraParamsFromServerResponse
			    		bForceExactCount = true; 
			    		
						// we need a short time out, otherwise this won't work
						setTimeout(function(){
							mt.getDataTableObjectOf(sActiveTable).page("next").draw("page");
						}, 300);	
						
					}
					
					// if the exact count is already forced, and we are already at the last page
					// we don't need to refresh the table again
					else if (bForceExactCount == true && iTotalNrOfPages == iCurrentPage){
						 // do nothing!
					}
					// normal case: just go to the next page
					else {
						mt.getDataTableObjectOf(sActiveTable).page("next").draw("page");
					}
					
					
				}
			}
			// prevent scrolling of screen when pressing the up/down arrows
			// (needed as last command)
			return false;
		}
		
		
		
		// home/end keys
    	if ( kf.isPressed("home") || kf.isPressed("end")){		
			
			var sActiveTable = kf.getActiveTable();	
			
			// 1. there must be some table active 
			// 2. don't interfere with context menu
			// 3. don't interfere with textarea of jeditable
			// 4. don't interfere with dialog box
			if (sActiveTable != null 
					&& !$("div#context-menu-layer").elementExists()
					&& !$("td form textarea").elementExists()
					&& !($(e.target).is('textarea')) // not in a form
					&& !bSomeDialogBoxIsOpen					
					)
				{
					e.preventDefault();
					
					if (kf.isPressed("home")){
						mt.getDataTableObjectOf(sActiveTable).page("first").draw("page");
					}
					else if (kf.isPressed("end")){
						mt.getDataTableObjectOf(sActiveTable).page("last").draw("page");
					}
				}
				
		}
    	
		// arrow keys		
		if (kf.isPressed("uparrow") || kf.isPressed("downarrow")){	
			var sActiveTable = kf.getActiveTable();	
			var iNumberOfRows = fn.getNumberOfVisibleRows(sActiveTable);
			
			// 1. there must be some table active 
			// 2. don't interfere with context menu
			// 3. don't interfere with textarea of jeditable
			// 4. don't interfere with dialog box
			// 5. there must be some rows in the table
			if (sActiveTable != null 
					&& !$("div#context-menu-layer").elementExists()
					&& !$("td form textarea").elementExists()
					&& !($(e.target).is('textarea')) // not in a form
					&& !bSomeDialogBoxIsOpen
					&& iNumberOfRows>0
					)
				{
					
				
				
				var iActiveRow = kf.getActiveRowNumber();				
				var iMaximalIndex = fn.getNumberOfVisibleRows(sActiveTable) - 1;
				var nActiveRowNode = kf._getTrElement(sActiveTable, iActiveRow);
				
				if (kf.isPressed("uparrow") && iActiveRow > 0 ) {
					
					// remove highlight from current row
					// except in selection mode when shiftkey is pressed
					if ($(nActiveRowNode).hasClass('selected') && 
							!(mt.rowSelectionIsAllowed(sActiveTable) && e.shiftKey ) ){
								
						$(nActiveRowNode).toggleClass('selected');						
					}
					
					// decrease row index
					iActiveRow--;
					kf.setActiveRowNumber(iActiveRow);
					
					// put highlight on new row
					var newActiveRowNode = kf._getTrElement(sActiveTable, iActiveRow);
					$(newActiveRowNode).toggleClass('selected');
					
					
					// if row is out of viewport, scroll down
					if( !$(newActiveRowNode).isOnScreen() ) {
						
						var iPositionToGoTo = $(newActiveRowNode).position().top;
						$('html, body').animate({scrollTop: iPositionToGoTo}, 800);
					}
						
				}
				
				else if (kf.isPressed("downarrow") && iActiveRow < iMaximalIndex ) {
					// remove highlight from current row
					// except in selection mode when shiftkey is pressed
					if ($(nActiveRowNode).hasClass('selected') && 
							!(mt.rowSelectionIsAllowed(sActiveTable) && e.shiftKey ) ){
								
						$(nActiveRowNode).toggleClass('selected');
					}
					
					// increase row index
					iActiveRow++;
					kf.setActiveRowNumber(iActiveRow);
					
					// put highlight on new row
					var newActiveRowNode = kf._getTrElement(sActiveTable, iActiveRow);
					$(newActiveRowNode).toggleClass('selected');
					
					
					// if row is out of viewport, scroll up
					if( !$(newActiveRowNode).isOnScreen() ) {
						var iPositionToGoTo = $(newActiveRowNode).position().top;
						$('html, body').animate({scrollTop: iPositionToGoTo}, 800);
					}
				}
				
				else if (kf.isPressed("uparrow") && iActiveRow == 0 
						&& $("#"+sActiveTable+"_paginate a.paginate_active:eq(0)").text()!="1"	
						&& !$("#"+sActiveTable+"_wrapper .dataTables_paginate").hasClass("dont_paginate") // pagination must be allowed
						){
					row.clearRowSelection(sActiveTable);
					kf.setActiveRowNumber(iMaximalIndex);
					
					$('html, body').animate({scrollTop: mt.getDataTableObjectOf(sActiveTable).$("tr").last().position().top}, 800);
					mt.getDataTableObjectOf(sActiveTable).page("previous").draw("page");					
				}
				
				else if (kf.isPressed("downarrow") && iActiveRow == iMaximalIndex
						&& !$("#"+sActiveTable+"_wrapper .dataTables_paginate").hasClass("dont_paginate") // pagination must be allowed
						){
					row.clearRowSelection(sActiveTable);
					kf.setActiveRowNumber(0);
					
					$('html, body').animate({scrollTop: mt.getDataTableObjectOf(sActiveTable).$("tr").first().position().top}, 800);
					mt.getDataTableObjectOf(sActiveTable).page("next").draw("page");
				}
			}
			
			
			// prevent scrolling of screen when pressing the up/down arrows
			// (needed as last command)
			// exception: when we are inside a textarea, where default behaviour of
			//            arrow keys is needed for navigation in the textarea 
			if (	!$("td form textarea").elementExists() 
				&& 	!($(e.target).is('textarea')))
				return false;
		}

		// font size 
		if (kf.isPressed("+") && e.shiftKey){
			var iSize = parseInt($("td").css("font-size"));
			iFontSize = iSize*1.1;
			$("td").css("font-size", iFontSize);
			return false;
		}
		if (kf.isPressed("-") && e.shiftKey){
			var iSize = parseInt($("td").css("font-size"));
			iFontSize = iSize*0.9;
			$("td").css("font-size", iFontSize);
			return false;
		}
		if (kf.isPressed("/") && e.shiftKey){
			iFontSize = "100%";
			$("td").css("font-size", iFontSize);
			return false;
		}
		
		// if (kf.isPressed("leftarrow") && e.ctrlKey)
		// 	{
		// 	var iXposition = $('html, body').scrollLeft();
		// 	var iStep = $('html').width()/2;
		// 	$('html, body').animate({scrollLeft: iXposition-iStep}, 250);
		// 	e.preventDefault();
		// 	}
		
		// if (kf.isPressed("rightarrow") && e.ctrlKey)
		// 	{
		// 	var iXposition = $('html, body').scrollLeft();
		// 	var iStep = $('html').width()/2;
		// 	$('html, body').animate({scrollLeft: iXposition+iStep}, 250);
		// 	e.preventDefault();
		// 	}

		if (kf.isPressed("leftarrow") && e.ctrlKey){
			var sActiveTable = kf.getActiveTable();
			var nSelector = "#"+sActiveTable+"_wrapper div.dataTables_scrollBody";
			var iXposition = $(nSelector).scrollLeft();
			var iStep = $('html').width()/2;
			$(nSelector).animate({scrollLeft: iXposition-iStep}, 250);
			e.preventDefault();
		}
		
		if (kf.isPressed("rightarrow") && e.ctrlKey){
			var sActiveTable = kf.getActiveTable();
			var nSelector = "#"+sActiveTable+"_wrapper div.dataTables_scrollBody";
			var iXposition = $(nSelector).scrollLeft();
			var iStep = $('html').width()/2;
			$(nSelector).animate({scrollLeft: iXposition+iStep}, 250);
			e.preventDefault();
		}
		
		// call context menu
		// and don't interfere with inline edit (jeditable)
//		if (kf.isPressed("+") && !$("td form input").elementExists())
//			{			
//			var sActiveTable = kf.getActiveTable();
//			var iActiveRow = kf.getActiveRowNumber();
//			// triggers jQuery.contextMenu 
//			// (see: http://medialize.github.com/jQuery-contextMenu/docs.html)
//			$("#"+sActiveTable+" tbody tr:eq("+iActiveRow+") td").contextMenu();
//			
//			}
		
		// switch table
		if (kf.isPressed("tab") && !bSearchboxOfActiveTableHasFocus && !bSomeDialogBoxIsOpen)
			{	
			
			var sActiveTable = kf.getActiveTable();
			// look up the current table in the list of available tables
			// get its index and compute the index of the next table,
			// then switch!
			var aTableList = kf._getListOfTablesGettingFocusUponTab();
			var iIndexOfActiveTable = $.inArray(sActiveTable, aTableList);
			if (iIndexOfActiveTable + 1 < aTableList.length)
				iIndexOfActiveTable++;
			else
				iIndexOfActiveTable = 0;
			
			// this will call a header function, which will make this table active
			$("#" + aTableList[iIndexOfActiveTable] + "_wrapper div.top").mousedown();			
			}
    });
    
	$(document).unbind('keyup');
    $(document).bind('keyup', function() {
    	
    	// call user key functions
    	// (needs to be called before kf.registerReleasedKey)
    	kf._callCustomKeyFunctions('keyup'); 
    	
    	// register that all keys are released
    	kf.registerReleasedKey();  
    	  		
    });
	
};

// get the list of tables which are set to be sensitive to tab (get focus upon tab)
kf._getListOfTablesGettingFocusUponTab = function(){
	var aTableList = mt.getListOfLoadedTables();
	var aListOfTabSensitiveTables = new Array();
	for (var i=0; i<aTableList.length; i++)
		{
		var aTableSettings = conf.getTableSettings(aTableList[i]);
		var bTabSensitive = conf.getTabSetting(aTableSettings);
		if (bTabSensitive)
			aListOfTabSensitiveTables.push(aTableList[i]);
		}
	return aListOfTabSensitiveTables;
};

// call user key functions, if defined in the user configuration
kf._callCustomKeyFunctions = function(sKeyEventType){
	
	// prevents execution while editing a cell or typing a search query
	if ($("input:focus").elementExists()) return false;
	
	var sActiveTable = kf.getActiveTable();	
	var aTableSettings = conf.getTableSettings(sActiveTable);
	var aKeySettings = conf.getKeysSettings(aTableSettings, sKeyEventType);
	var sPressedKey = kf._getPressedKey();
	
	if (aKeySettings!= null && aKeySettings[sPressedKey] != null)
		{
		aKeySettings[sPressedKey](sActiveTable);
		}
};

kf._getTrElement = function(sTableName, iRowNumber){
	return "#"+sTableName+" tbody tr:not('.group'):eq("+iRowNumber+")";
};