
var dialectmenu = {};


dialectmenu.buildMenu = function(){

	// temporarily turn off the Chrome fix (see index.html)
	// this is needed to allow a redirect to a project, without triggering a dialog in Chrome preventing it!
	$(window).off('beforeunload');

	// dispose of unneeded table selection functionality (prevents default Lex'it behavior)
	$("div#indicators div#indicator").hide();
	$("div#indicators div#tablechoice").hide();	

	dialectmenu.removeBackButton();
	
	$("#home_logo img").css("width", "160px").css("height", "70px");
	
	
	
	

	
	fn.closeDialog();
	fn.message("Menu", 
		"<CENTER><IMG src='https://www.overijssel.nl/media/xt3dut1n/logo_provincie_overijssel.png?rmode=min&width=1400&v=1d9e49e92da0e30' height=50px/>"+
		"<TABLE>"+
		"<TR><TD>&nbsp;</TD></TR>"+
		"<TR><TD><BUTTON type='button' disabled style='min-width: 200px; width: auto; font-size: 14px;' onclick='fn.closeDialog(); dialectmenu.addBackButton(); fnStartLexicon();'>Lexicon bewerken</BUTTON></TD></TR>"+
		"<TR><TD><BUTTON type='button' style='min-width: 200px; width: auto; font-size: 14px;' onclick='fn.closeDialog(); dialectmenu.addBackButton(); fn.callTable(\"start_linking\");'>Koppelen</BUTTON></TD></TR>"+
		"<TR><TD>&nbsp;</TD></TR>"+
		"<TR><TD><BUTTON type='button' style='min-width: 200px; width: auto; font-size: 14px;' onclick='fn.closeDialog(); dialectmenu.addBackButton(); fn.callTable(\"log\");'>Log</BUTTON></TD></TR>"
		+"</TABLE></CENTER>", 
		function(){
			dialectmenu.buildMenu(); // rebuild the menu if it was clicked away
		}
	);

	// hide default parts of the dialog
	// and reposition it a bit downwards
	$(".ui-dialog-titlebar").hide();
	$("#dialog_accept_button").hide();
	fn.moveDialog(0, 190);
	
	
	$(".ui-dialog-buttonpane.ui-widget-content.ui-helper-clearfix").append(
		$("<img>")
			.attr("src", "https://deedmob-prod.imgix.net/o-prod/0/3216627_1720114755099%401418x533.png?fit=clip&fill=solid&auto=format")
			.css("height", "60px")
	)
	.css("display", "flex")
	.css("justify-content", "center");
	
	
};



dialectmenu.reloadMenu = function(){

	// test mode?
	var bTestMode = getHttpParams().get("test")=='true';

	// temporarily turn off the Chrome fix (see index.html)
	// this is needed to allow a redirect to a project, without triggering a dialog in Chrome preventing it!
	$(window).off('beforeunload');

	window.location.replace(uLexitInstanceUrl + "?db=" + getHttpParams().get("db") + ( bTestMode ? "&test=true":""));	
};



dialectmenu.addBackButton = function(){

	$("#partners_logos").remove();

	// add go back button
	if ($("#clickback").length==0){
		$("div#indicators").prepend("<button id='clickback' type='button' style='font-size: 14px 'onclick='dialectmenu.reloadMenu()'><B>Back to Start screen</B></button>")
			.css({position: 'relative', top: '-25px'});
	}
}

dialectmenu.removeBackButton = function(){
	if ($("#clickback").length>0){
		$("#clickback").remove();
	}
}

// keep the dialog in the middle of the screen
let resizeTimer;
$(window).resize(function(){
	
	clearTimeout(resizeTimer);
	
	// if we are in the opening screen, keep the dialog in the middle
	if ($("#clickback").length == 0){
		
		$("div[id^='dialog-message']").dialog("option", "position", {my: "center", at: "center", of: window} );
		fn.moveDialog(0, 190);
	}
	// if we are in the linking mode, keep all tables at the same position
	else {
		
		// we delay the executing of the rebuilding code till resizing is done
		resizeTimer = setTimeout(function(){
			
			fn.closeAllTables();
			
			// build linking GUI
			
			// restore the state of the tables
			// but get rid of the position out of the states
			
			const queue = new FunctionQueue();
			
			queue.enQueue(function(){ 
				fn.respawnTable("nederlands", ["width"]); 
			});
			
			queue.enQueue(function(){ 
				fn.respawnTable("dialect", ["width"], function(){fn.alignTables("nederlands", "dialect");}); 
			});
						
			queue.enQueue(function(){ 
				fn.respawnTable("neder_dialect_links", ["width"], function(){fn.pileupTables("nederlands", "neder_dialect_links"); }); 
			});
			
			
			
			queue.enQueue(function(){ 
				
				// get rid of close buttons
				$("#nederlands_tableclosebutton").find("button").css("display", "none");
				$("#nederlands_tableclosebutton").find("span").remove();
				$("#nederlands_tableclosebutton").append($("<span></span>").html("&nbsp;&nbsp;"));
				
				$("#dialect_tableclosebutton").find("button").css("display", "none");								
				$("#dialect_tableclosebutton").find("span").remove();
				$("#dialect_tableclosebutton").append($("<span></span>").html("&nbsp;&nbsp;"));
				
				$("#neder_dialect_links_tableclosebutton").find("button").css("display", "none");
				$("#neder_dialect_links_tableclosebutton").find("span").remove();
				$("#neder_dialect_links_tableclosebutton").append($("<span></span>").html("&nbsp;&nbsp;"));

				// make sure we always know which cell was the last clicked upon
				$("td").click(function(){
					lastClicked = this;
				});
				
			});
			
			
			/*
			fn.respawnTable("nederlands", ["width"], function(){
				
				fn.respawnTable("dialect", ["width"], function(){
					
					fn.alignTables("nederlands", "dialect", function(){
						
						fn.respawnTable("neder_dialect_links", ["width"], function(){
							
							fn.pileupTables("nederlands", "neder_dialect_links", function(){
	
								// get rid of close buttons
								$("#nederlands_tableclosebutton").find("button").css("display", "none");
								$("#nederlands_tableclosebutton").find("span").remove();
								$("#nederlands_tableclosebutton").append($("<span></span>").html("&nbsp;&nbsp;"));
								
								$("#dialect_tableclosebutton").find("button").css("display", "none");								
								$("#dialect_tableclosebutton").find("span").remove();
								$("#dialect_tableclosebutton").append($("<span></span>").html("&nbsp;&nbsp;"));
								
								$("#neder_dialect_links_tableclosebutton").find("button").css("display", "none");
								$("#neder_dialect_links_tableclosebutton").find("span").remove();
								$("#neder_dialect_links_tableclosebutton").append($("<span></span>").html("&nbsp;&nbsp;"));
	
								// make sure we always know which cell was the last clicked upon
								$("td").click(function(){
									lastClicked = this;
								});
							});
							
						}); 
					})
							
				})
			});
			*/
		
		}, 500); // Run this 200ms after resizing stops
	
	}
	
});

