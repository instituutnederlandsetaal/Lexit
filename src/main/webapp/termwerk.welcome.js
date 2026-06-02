

// display table at this top position (to avoid the header)
var sTableTopPosition = 160+"px";
var sTableTermBankWidth = "98%";
var sTableHeaderHeight = "45px";

// some defaults for the form grid
var iProjectFormBaseY = 3;
var iProjectFormBaseX = 3;
var iProjectFormHeight = 1.5;
var iProjectFormTotalHeight = iProjectFormHeight*1.3;
var iProjectFormWidth = 7;

// lexit button testsetting
var bLexitButtonTest = false;

$("body").hide(); // hide the page until everything is ready

// instances URLs
var uLexitInstanceUrl = document.URL;
if (uLexitInstanceUrl.indexOf("?"))
	uLexitInstanceUrl = uLexitInstanceUrl.substring(0, uLexitInstanceUrl.indexOf("?"));
if (uLexitInstanceUrl.lastIndexOf("/") != uLexitInstanceUrl.length-1)
	uLexitInstanceUrl += "/";
	
	
	
var aLibrariesList = [
	
	// GENERAL PARTS
	"termwerk.header.js",			// page header buttons
	"termwerk.projects.js",			// projecten table configuration
	"termwerk.design.js",			// CSS etc
	
	// UTILITIES
	"termwerk.util.js"  			// utility functions
	];


// function for loading libraries sequentially
function loadLibraries(aLibrariesList, i, fnCallback){
	
	var bForceLocal = (paramsHash!=null && paramsHash.get("test")!=null && paramsHash.get("test")=="true");
	
	if (aLibrariesList[i] != null) {
		var sPrefix = (bForceLocal ? "" : "../lexit2_config/termwerk/");
		fn.getLibrary(sPrefix + aLibrariesList[i], function(){
			loadLibraries(aLibrariesList, i+1, fnCallback);
		});
	}
	else {
		fnCallback();
	}
};
	
	
$(document).ready(function(){
	
	loadLibraries(aLibrariesList, 0, function(){
		
		$("#projectname").append(
			$("<span></span>").text("Termwerk")
		);
		
		// buttons in the header	
		termheader.addButtonsInTopBalk();
		termheader.addButtonsBelowTopBalk();
		
		// show page, since everything is ready now
		$("body").show(500);
		
		// call the login procedure
		fn.startLexitLogin();
		
		
		// if ESC is pressed, call the login procedure again 
		$(document).bind('keydown', function(e) {
			
			if (e.which == 27) {				
				
				/// call the login procedure
				setTimeout(function(){
					fn.startLexitLogin();
				}, 100);
			}
		});
	});	
});




