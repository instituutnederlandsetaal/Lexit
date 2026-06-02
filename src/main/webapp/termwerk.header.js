
var termheader = {};



// *********************************************************************
//
// Buttons in the top balk
//
// *********************************************************************


termheader.addButtonsInTopBalk = function() {	
	
	// Help and About buttons in header
	
	$("#headerlinks #help_link")
		.click(function() {
			window.open( (document.URL.indexOf("localhost")<0 ? "../lexit2_config/termwerk/" : "")+"termwerk_handleiding_1.0.pdf", '_blank', 'noopener,noreferrer');
		});
	
	$("#headerlinks #about_link")
		.click(function() {
			fn.message("over termwerk", 
				"TermWerk is een samenwerking van het <a href='https://ivdnt.org/' target='_BLANK' style='color: #197E94'>Instituut voor de Nederlandse Taal</a> <BR>"+
				"en de <a href='https://taalunie.org/' target='_BLANK' style='color: #197E94'>Taalunie</a> en wordt ondersteund vanuit het "+
				"<a href='https://ivdnt.org/terminologie/expertisecentrum' target='_BLANK'>Expertisecentrum Nederlandstalige<BR>Terminologie</a>. <BR>"+
				"<BR>"+
				"Wanneer u verwijst naar TermWerk, gebruik dan de volgende referentie:<BR>"+
				"<BR>"+
				"TermWerk (Versie 1.0) (Februari 2025) [Online Service]. Toegankelijk gemaakt door <BR>"+
				"het Instituut voor de Nederlandse Taal<BR>"+
				"<BR>"+
				"<table><tr>"+
				"<td><img src='"+(document.URL.indexOf("localhost")<0 ? "../lexit2_config/termwerk/" : "")+"taalunie_logo_cmyk.jpg' style='height: 80px; border-right: 1px dotted #000000 !important;'></td>"+
				"<td><img src='"+(document.URL.indexOf("localhost")<0 ? "../lexit2_config/termwerk/" : "")+"ivdNt-logo-z-1regel-cmyk.png' height='38px'><BR><span style='font-size: 40px'>&nbsp;termwerk</span></td>"+
				"</tr></table>"+
				"<BR>"+
				"TermWerk (Versie 1.0)<BR>"+
				"Contact: <a href='mailto:servicedesk@ivdnt.org?subject=TermWerk'>servicedesk@ivdnt.org</a><BR>"
				);
			setTimeout(function() {
				$("#dialog_accept_button").focus();
			});	
		});
		
		
	$("#headerlinks #contribute_link")
		.click(function() {
			fn.message("Gebruiker", "Ingelogd als '"+fn.getCurrentUser()+"'");
		});
};




// *********************************************************************
//
// Buttons below the top balk (that is: in the blue border)
//
// *********************************************************************


termheader.addButtonsBelowTopBalk = function() {
    
    $("#border_and_buttons_div").append(
		
		$("<div></div>")
			.attr("id", "current_project_div")
			
			// clicking the label should re-open the main project table
			.click(function(){
				
				// buttons (deactivate)
				$("div.termwerk_balk_buttons").removeClass("active");
				
				console.log("active = "+$("#current_project_div").hasClass("active"));
				
				// close tables and reopen the main project table
				if ($("#current_project_div").hasClass("active")) {
					var sCurrentProjectId = util.getProjectId();
					
					
					// update the project stats
					var sUrl = uTermServeInstanceUrl + "webservice/api/"+ "get_project_stats";
					fn.callService(sUrl, {"project_id": sCurrentProjectId, "username": fn.getCurrentUser()}, "GET", null, function(xml){
						
						// now open the project table
						fn.closeAllTables(function(){
							fn.callTable("projecten", {"project_id": sCurrentProjectId}, function(){}, {"viewtype": "form"});
						});						
					});
					
				}				
			})
			
			// span for the label
			.append(
				$("<span></span>")
					.attr("id", "current_project")		
			)
	);	
	
	$("#border_and_buttons_div").append(
		
		$("<div></div>")
			.attr("id", "my_projects_div")
			.addClass("termwerk_balk_buttons")
			.addClass("active")
			.append(
				$("<span></span>")
					.attr("id", "my_projects")
					.html("mijn projecten")				
			)
	);	
		
	$("#border_and_buttons_div").append(
		
		$("<div></div>")
			.attr("id", "my_corpora_div")
			.addClass("termwerk_balk_buttons")
			.append(
				$("<span></span>")
					.attr("id", "my_corpora")
					.addClass("disabled")
					.text("corpora")				
			)
	);
	
	$("#border_and_buttons_div").append(
		
		$("<div></div>")
			.attr("id", "my_termlists_div")
			.addClass("termwerk_balk_buttons")
			.append(
				$("<span></span>")
					.attr("id", "my_termlists")
					.addClass("disabled")
					.text("termenlijsten")				
			)
	);
	
	$("#border_and_buttons_div").append(
		
		$("<div></div>")
			.attr("id", "my_termbank_div")
			.addClass("termwerk_balk_buttons")
			.append(
				$("<span></span>")
					.attr("id", "my_termbank")
					.addClass("disabled")
					.text("termenbank")				
			)
	);
	
	
	
	// add functions
	
	$("#my_projects_div").click(function() {
		
		//bActiveInsideProject = false;		
		
		// close any open table and open the project table
		
		//$(".termbank_panel").remove();
		
		fn.closeAllTables(function(){
			
			// project label
			$("div#current_project_div").removeClass("active");
			
			// buttons
			$("div.termwerk_balk_buttons").removeClass("active");			
			
			util.closeSchema(null, function(){
				$("#my_projects_div").addClass("active");
				
		        // open projects table, except if it is already open in table view
				if ( !fn.tableIsOpen("projecten"))
					fn.callTable("projecten", {}, function(){}, { "viewtype": "table" });
				
			});				
			
		});
			
	});
	
	$("#my_corpora_div").click(function() {
		if ( $(this).find("span").hasClass("disabled") == false){
			
			//bActiveInsideProject = true;
			
			// project label
			//$("div#current_project_div").removeClass("active");
			
			// buttons
			$("div.termwerk_balk_buttons").removeClass("active");			
			
			// close any open table and open the corpora table
			//$(".termbank_panel").remove();
			fn.closeAllTables(function(){
				$("#my_corpora_div").addClass("active");
				fn.callTable("corpora", {}, function(){}, { "viewtype": "table" });
			});
		}				
	});
	
	
	$("#my_termlists_div").click(function() {
		if ( $(this).find("span").hasClass("disabled") == false){
			
			//bActiveInsideProject = true;
			
			// project label
			//$("div#current_project_div").removeClass("active");
			
			// buttons
			$("div.termwerk_balk_buttons").removeClass("active");			
			
			// close any open table and open the termlists table
			//$(".termbank_panel").remove();
			fn.closeAllTables(function(){
				$("#my_termlists_div").addClass("active");
				fn.callTable("termenlijst_meta", {}, function(){}, { "viewtype": "table" });
			});
		}
	});
		
	$("#my_termbank_div").click(function() {
		
		if ( $(this).find("span").hasClass("disabled") == false){
			
			//bActiveInsideProject = true;
			
			// project label
			//$("div#current_project_div").removeClass("active");
			
			// buttons
			$("div.termwerk_balk_buttons").removeClass("active");
			
			// close any open table and open the termbanks table
			//$(".termbank_panel").remove();			
			fn.closeAllTables(function(){
				
				$("#my_termbank_div").addClass("active");
				//termheader.addButtonsBelowTermbankButton();	
				
				fn.callTable("termbank_samenvatting");
			});
		}
	})
	
	
	
};




termheader.checkIfTermbankExists = function(fnCallbackIfExists, fnCallbackIfNot) {
	
	$.ajax({
		
		"type": "GET",
		"url": uTermServeInstanceUrl + "webservice/api/check_if_termbank_exists",
		"data": {
			"username": fn.getCurrentUser(),
			"project_id": fn.getCurrentSchema(),
			"dummy": getUniqueNumber()
		},
		"dataType": "xml", // get response as xml
		"success": function(xml) {
			
			var bTermbankIsSet = ($(xml).find("response").text() == "true");
			
			if (bTermbankIsSet)
				fnCallbackIfExists();
			else
				fnCallbackIfNot();
			
		},
		"error": function(jqXHR, textStatus, errorThrown){

			console.log("Controle van de termbank ging mis!!");
		}
		
	});
};
