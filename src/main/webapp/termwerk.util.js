

var util = {};


/**
 * Do all that is neede to close a project, locally 
 * (no need to do anything in webservice, except setting the schema back to 'public' [t.i. default schema instead of project schema], 
 *  which is the first step in this function)
 */
util.closeSchema = function(sSchemaId, fnCallback){
	
	fn.setSchema("public", function(){
		
		// since we have closed a project, we disable the buttons
		$("#my_corpora").addClass("disabled");
		$("#my_termlists").addClass("disabled");
		$("#my_termbank").addClass("disabled");
		//$("#current_project_div").removeClass("active");
		
		// project label 
		$("#my_projects_div").removeClass("active");
		util.setProjectLabel(null, null);
		
		// projects overview button
		$("#my_projects").addClass("active");
		
		if (fnCallback != null)
			fnCallback();
	});
}


/**
 * Set the project label at the right location in the page
 * when chosen
 */
util.setProjectLabel = function(sProjectId, sProjectName){
	
	if (sProjectName != null && sProjectName != ""){
		$("#current_project_div").attr("data-project_id", sProjectId);
		$("#current_project_div").data("project_name", sProjectName);
		$("#current_project_div").addClass("active")
		$("#current_project").text($("#current_project_div").data("project_name"));			
		
		concepts.setAutocompleteForConcept();
		concepts.setAutocompleteForVerwantConcept();
		conceptlinks.setAutocomplete();
		
		concepts.setImageViewer();
		
		util.setAutocompleteFor('#termbank_concepten_inbetween_div #form_cellvalue_domein textarea', 'termbank_concepten', 'domein');
		util.setAutocompleteFor('#termbank_concepten_inbetween_div #form_cellvalue_bron_van_de_definitie textarea', 'termbank_concepten', 'bron_van_de_definitie');
		util.setAutocompleteFor('#termbank_concepten_inbetween_div #form_cellvalue_projectsubset textarea', 'termbank_concepten', 'projectsubset');
		util.setAutocompleteFor('#termbank_concepten_inbetween_div #form_cellvalue_klantensubset textarea', 'termbank_concepten', 'klantensubset');
		util.setAutocompleteFor('#termbank_concepten_inbetween_div #form_cellvalue_bron_concept textarea', 'termbank_concepten', 'bron_concept');
		
		util.setAutocompleteFor('#termbank_talen_inbetween_div #form_cellvalue_bron_van_de_definitie textarea', 'termbank_talen', 'bron_van_de_definitie');
		util.setAutocompleteFor('#termbank_talen_inbetween_div #form_cellvalue_bron_taalspecifiek textarea', 'termbank_talen', 'bron_taalspecifiek');
		util.setAutocompleteFor('#termbank_talen_inbetween_div #form_cellvalue_projectsubset textarea', 'termbank_talen', 'projectsubset');
		
		util.setAutocompleteFor('#termbank_termen_inbetween_div #form_cellvalue_projectsubset textarea', 'termbank_termen', 'projectsubset');
		util.setAutocompleteFor('#termbank_termen_inbetween_div #form_cellvalue_klantensubset textarea', 'termbank_termen', 'klantensubset');
		
	}
	else {
		$("#current_project_div").removeData("project_id");
		$("#current_project_div").removeData("project_name");
		$("#current_project_div").removeClass("active");
		$("#current_project").html("");
		
		concepts.removeAutocompleteForConcept();
		concepts.removeAutocompleteForVerwantConcept();
		conceptlinks.removeAutocomplete();
		
		util.removeAutocompleteFrom('#termbank_concepten_inbetween_div #form_cellvalue_domein textarea');
		util.removeAutocompleteFrom('#termbank_concepten_inbetween_div #form_cellvalue_bron_van_de_definitie textarea');
		util.removeAutocompleteFrom('#termbank_concepten_inbetween_div #form_cellvalue_projectsubset textarea');
		util.removeAutocompleteFrom('#termbank_concepten_inbetween_div #form_cellvalue_klantensubset textarea');
		util.removeAutocompleteFrom('#termbank_concepten_inbetween_div #form_cellvalue_bron_concept textarea');
		
		util.removeAutocompleteFrom('#termbank_talen_inbetween_div #form_cellvalue_bron_van_de_definitie textarea');
		util.removeAutocompleteFrom('#termbank_talen_inbetween_div #form_cellvalue_bron_taalspecifiek textarea');
		util.removeAutocompleteFrom('#termbank_talen_inbetween_div #form_cellvalue_projectsubset textarea');
		
		util.removeAutocompleteFrom('#termbank_termen_inbetween_div #form_cellvalue_projectsubset textarea');
		util.removeAutocompleteFrom('#termbank_termen_inbetween_div #form_cellvalue_klantensubset textarea');
		
		concepts.removeImageViewer();
	}	
}


/**
 * Read the current project ID
 */
util.getProjectId = function(){
	return $("#current_project_div").attr("data-project_id");
};




/**
 * This function is about updating users rights after those were set in the project GUI
 */
util.updateUsersHavingAccess = function(fnCallback){
	
	$.ajax({
		
		url: uTermServeInstanceUrl + "webservice/api/update_users_having_access",
		type: 'GET',
		data: { 
			"project_id": util.getProjectId(),			
			"username": fn.getCurrentUser(),
			"dummy": getUniqueNumber(),
			"test": bTest // lexit global var
		},
		success: function(xml) {
	        console.log("User rights updated");	
	        
	        if (fnCallback != null){
				
				setTimeout(function(){
					fnCallback();
				}, 500);
			}

		},
		error: function(xhr, status, error) {			
			console.error('Updating user rights failed: ' + error);
		}
		
	});
}




util.updateTermPresenceMark = function(sTermlistID, fnCallback){
	
	// data to be sent to the server
	var formData = new FormData();
	
	formData.append('project_id', util.getProjectId());
	formData.append('username', fn.getCurrentUser());
	formData.append('dummy', getUniqueNumber());
	formData.append('termlist_id', sTermlistID);
	
	$.ajax({
		
		url: uTermServeInstanceUrl + "webservice/api/update_term_presence_mark",
		type: 'POST',
		data: formData,		
		contentType: false, // Required for correct boundary string
		processData: false, // Necessary to prevent jQuery from transforming the data
		success: function(resp) {
	        console.log("Terms presence mark updated: " + resp);	
	        
	        if (fnCallback != null){
				
				setTimeout(function(){
					fnCallback();
				}, 500);
			}

		},
		error: function(xhr, status, error) {			
			console.error('Updating terms presence mark failed: ' + error);
		}
		
	});
}




/**
 * Function for file upload
 */
util.uploadFile = function(sProjectId, sFileName, bIsTermlist) {

	// read data from form before closing it!
    var sProjectId = (sProjectId!=null ? sProjectId : util.getProjectId() );
    var sUploadNaam = $('#uploadname')[0].value;
	var file = (sFileName!=null ? sFileName : $('#fileChooser')[0].files[0]); // get the file from the form
	
	if (sUploadNaam == null || sUploadNaam == ""){
		fn.message("Let op", "Geef uw termenlijst een naam!");
		return;
	}
	
	// make sure a file was chosen, or give an error message!
	if (typeof file == 'undefined') {
		fn.message("Let op", "Kies een bestand!");
		return;
	}
	
	// make sure the chosen file has the right extension
	var sExtension = file.name.split('.').pop().toLowerCase();
	if (sExtension != 'csv' && sExtension != 'xls' && sExtension != 'xlsx') {
		fn.message("Let op", "Kies een bestand met extensie .csv, .xls of .xlsx!");
		return;
	}
	
	sUploadNaam = (sUploadNaam!=null ? sUploadNaam : file.toLowerCase()+"_"+fn.getCurrentDate());
	bIsTermlist = (bIsTermlist!=null ? bIsTermlist : false);
	

	

	// data to be sent to the server
	var formData = new FormData();

	formData.append('file', file);
	formData.append('project_id', sProjectId);
	formData.append('uploadname', sUploadNaam);
	formData.append('username', fn.getCurrentUser());
	formData.append('is_termlist', bIsTermlist);

	// this might take a while, so put spinner
	showSpinner("#dynamic", true);

	setTimeout(function() {
		var url = uTermServeInstanceUrl + "webservice/api/upload_file";

		$.ajax({
			url: url,
			type: 'POST',
			data: formData,
			contentType: false, // Required for correct boundary string
			processData: false, // Necessary to prevent jQuery from transforming the data
			success: function(xml) {

				// remove spinner
				removeSpinner("#dynamic");
				
				// remove upload dialog
				fn.closeDialog();
				
				
				if (bIsTermlist){
					
					var aTermlistIdAndStatusInfo = (fn.getDbResponse(xml)).split("::");
					var sTermlistId = aTermlistIdAndStatusInfo[0];
					var sStatusInfo = aTermlistIdAndStatusInfo[1];	
					
					// is there a corpus name and ID set?			
					var sSelectedCorpusnaam = $("#termenlijst_meta_wrapper").find("span#termenlijst_meta_tablename").data("name");
					var sSelectedCorpusId = $("#termenlijst_meta_wrapper").find("span#termenlijst_meta_tablename").data("corpus_id");
					
					 
					// register the termlist ID in the corpus table
					if (sSelectedCorpusnaam != null) {
						fn.updateTableGivenFieldValues("corpora", {"corpus_id": sSelectedCorpusId}, {"termlist_id": sTermlistId});
					}
					
					// and refresh the overview, if visible
					if (fn.tableIsOpen("termenlijst_meta")) {
						fn.callTable("termenlijst_meta", {}, function(){
							
							// if we have status info, show it (mostly parse errors!)
							if (sStatusInfo != null && sStatusInfo != '') {
								fn.message("Upload mislukt", 
									"<span class='server_response'>"+sStatusInfo +"</span>"+
									"<BR><BR>" +
									"<B>Voldoet uw bestand aan de eisen?</B>"+
									"<BR><BR>"+
									"De toegestane bestandsinhoud is: "+
									"<div class='upload_info'>" +
									"	<table><tr>" +
											aTermlistUploadAcceptedColumns.join("</tr><tr>") +
									"	</tr></table>"+
									"</div>");
								sStatusInfo = "";
							}
						});
					}
					
				}
				else {
					
					// now we will reload lex'it with the table holding the uploaded file
					var sLoadedSheet = fn.getDbResponse(xml);			
					
					const queue = new FunctionQueue();
				
					queue.enQueue(function(){
						fn.registerNewTable(sLoadedSheet, sLoadedSheet, "table", "", {}, {"top": sTableTopPosition});	
					});
					queue.enQueue(function(){
						
						// remove the buttons
						$("#termbank_buttons_div").remove();
						
						// close termenlijst table if it's there, because it needs to be closed to be able to change its name
						// as we will set its name to be the name of the loaded termlist
						if (fn.tableExists(sLoadedSheet)){						
							fn.closeTable(sLoadedSheet);
						}
						
						// change the name of the termlist table
						conf.changeTableSettingValue(sLoadedSheet, "nice_name", sUploadNaam);
						
						// show the table
						fn.callTable(sLoadedSheet);
						
					});
					
				}
				
			},
			error: function(xhr, status, error) {
				
				console.error('Upload failed: ' + error);
				
				// remove spinner
				removeSpinner("#dynamic");
				
				fn.message(
					"Upload mislukt", 
					
					"Uploaden is mislukt! <BR><BR>"+
					"<span class='server_response'>"+error +"</span>"+
					"<B>Voldoet uw bestand aan de eisen?</B>"+
					"<BR><BR>"+
					"De toegestane bestandsinhoud is: "+
					"<div class='upload_info'>" +
					"	<table><tr>" +
							aTermlistUploadAcceptedColumns.join("</tr><tr>") +
					"	</tr></table>"+
					"</div>");
			}
		});
	}, 100);

}





/**
 * Function for corpus upload
 */
util.uploadCorpus = function() {
	
	if (sCurrentRole == 'Kijker'){
		fn.message("Let op", "U heeft geen rechten om een corpus te uploaden.");
		return;
	}
	
	// read data from form before closing it!
	var sProjectId = util.getProjectId();
    var sDisplaydNaam = $('#uploadname')[0].value;
    var aFiles = $('#fileChooser')[0].files; // get the files from the form
    
    
    // DEBUG 
	//var aFiles = $('#fileChooser')[0].files[0]; // get the files from the form	
	
	if (sDisplaydNaam == null || sDisplaydNaam == ""){
		fn.message("Let op", "Geef uw corpus een naam!");
		return;
	}

	// make sure a file was chosen, or give an error message!
	if (typeof aFiles == 'undefined') {
		fn.message("Let op", "Kies een bestand!");
		return;
	}
	
	// the form is read, now we can close it!
	fn.closeDialog();
	fn.message("Corpusupload", "Corpus wordt nu geüpload...");

	// data to be sent to the server
	var formData = new FormData();
	
	// loop through each file and append it to the FormData object
	for (var i = 0; i < aFiles.length; i++) {
    	formData.append("files", aFiles[i], aFiles[i].name); // "files" is the form field name
    	//formData.append("files", aFiles[i]); // "files" is the form field name
	}

	//formData.append('files', aFiles);
	formData.append('project_id', sProjectId);  // TermServe needs this!
	formData.append('display_name', sDisplaydNaam);
	formData.append('username', fn.getCurrentUser());
	
	

	// this might take a while, so put spinner
	showSpinner("#dynamic", true);
	

	// corpus upload 
	
	var sCorpusUploadUrl = uTermServeInstanceUrl + "webservice/api/upload_corpus";
	
	$.ajax({		
		url: sCorpusUploadUrl,
		type: 'POST',
		data: formData,
		contentType: false, // Required for correct boundary string
		processData: false, // Necessary to prevent jQuery from transforming the data
		success: function(xml) {
			
			// remove spinner
			removeSpinner("#dynamic");
			
			var resp = JSON.parse( fn.getDbResponse(xml) );			
			var sJobId = resp["job_id"];
			var sStatus = resp["status"];
			
			fn.closeDialog();
			
			
			fn.insertIntoTable("corpora", 
				{
					"name": sDisplaydNaam, 
					"creator": fn.getCurrentUser(), 
					"last_editor": fn.getCurrentUser(), 
					"documents": aFiles.length, 
					"job_id": sJobId, 
					"status": sStatus 
					//"source": aFiles[0].name
				}, 
				null, function(){
				
					fn.message("Corpusupload", "Corpus is geüpload.");
					
					// refresh the table
					// and make sure that status is updated after a short while, and again if it's still running
					util.updateStatusPeriodically("corpora");
				}
			);
			
			
			
		},
		error: function(xhr, status, error) {
			console.error('Corpusupload failed: ' + error);
		}
	});

}


/**
 * Function for updating corpus upload status (subroutine of util.uploadCorpus)
 */
util.updateStatusPeriodically = function(sTableName){
	
	if ( !fn.tableExists(sTableName)) 
		return;
	
	fn.refreshTable(sTableName, // this will cause the status to be updated
	
	    function(){
			
			var aRows = fn.getAllRowNodes(sTableName);
			var bRefreshNeeded = false;
		
			// is there any job still running?
			$(aRows).each(function() {
				var nRow = this;
				
				var sCurrentStatus = fn.getDataFromCellInRowNode(nRow, "status");
				if (sCurrentStatus != "failed" && sCurrentStatus != "finished"){
					
					bRefreshNeeded = true;
					return false;
				}
			});
			
			// if so, check again after 10 seconds
			if (bRefreshNeeded){
				setTimeout(function(){						
					util.updateStatusPeriodically(sTableName);
				}, 10000); // wait 10 seconds before new check
			}
			
		} // end of callback
	);	
	
}



/**
 * TBX upload
 */
util.uploadTbxFile = function() {
	
	// read data from form before closing it!
	var sProjectId = util.getProjectId();
	var sTermbankName = $('#uploadname')[0].value;
    var aFiles = $('#fileChooser')[0].files; // get the files from the form

	
	// the form is read, now we can close it!
	fn.closeDialog();
	fn.message("TBX upload", "TBX file wordt nu geüpload...");
	

	// make sure a file was chosen, or give an error message!
	if (typeof aFiles == 'undefined') {
		fn.message("Let op", "Kies een TBX bestand!");
		return;
	}
	// make sure the chosen file has the right extension
	var sExtension = aFiles[0].name.split('.').pop().toLowerCase();
	if (sExtension != 'tbx' && sExtension != 'xml') {
		fn.message("Let op", "Kies een bestand met extensie .tbx of .xml!");
		return;
	} 

	// data to be sent to the server
	var formData = new FormData();
	
	// loop through each file and append it to the FormData object
	for (var i = 0; i < aFiles.length; i++) {
    	formData.append("files", aFiles[i], aFiles[i].name); // "files" is the form field name
    	//formData.append("files", aFiles[i]); // "files" is the form field name
	}

	formData.append('project_id', sProjectId);  // TermServe needs this!
	formData.append('username', fn.getCurrentUser());
	formData.append('termbank_name', sTermbankName);
	formData.append('test', bTest); // lexit global var
	
	

	// this might take a while, so put spinner
	showSpinner("#dynamic", true);

	// TBX upload 
	
	var sTbxUploadUrl = uTermServeInstanceUrl + "webservice/api/upload_tbx";
	
	$.ajax({		
		url: sTbxUploadUrl,
		type: 'POST',
		data: formData,
		contentType: false, // Required for correct boundary string
		processData: false, // Necessary to prevent jQuery from transforming the data
		success: function(xml) {
			
			// remove spinner
			removeSpinner("#dynamic");
			fn.closeDialog();
			
			var resp =  fn.getDbResponse(xml) ;
			
			if (resp.indexOf("Error:") == 0){
				resp = resp.replace(/^Error: /, '');
				
				if (resp.indexOf("Het TBX-bestand bevat ongeldige data") >= 0){
					resp = resp.replace(/Controleer dit gedeelte: /, 'Controleer dit gedeelte:<BR><BR>');
					resp = resp.replace(/{/, '{<BR>');
					resp = resp.replace(/",[\n\r\s]*"/g, '",<BR>"');
					resp = resp.replace(/}$/, '<BR>}');
					fn.message("TBX upload", resp);
				}
			}
			
			fn.closeTable("termbank_samenvatting");
			setTimeout(function(){
				// re-open the termbank section!
				$("#my_termbank_div").click();
			}, 500);
			
		},
		error: function(xhr, status, error) {
			
			// remove spinner
			removeSpinner("#dynamic");
			fn.closeDialog();
			
			fn.closeTable("termbank_samenvatting");
			setTimeout(function(){
				// re-open the termbank section!
				$("#my_termbank_div").click();
				setTimeout(function(){	
					fn.closeDialog();
					fn.message("TBX upload", "TBX uploaden is mislukt! <BR><BR>"+error);
				}, 200);
			}, 500);

		}
	});

}



/*
* Get the status of a job
*/
util.getJobStatus = function(sJobId, fnCallback){
	
	var sProjectId = util.getProjectId();
	
	
	// get status of any job 
	
	var sUrl = uTermServeInstanceUrl + "webservice/api/get_status";
	var aParameters = {
		"username": fn.getCurrentUser(),
		"job_id": sJobId,
		"project_id": sProjectId,
		"dummy": getUniqueNumber()
	};
	fn.callService(sUrl, aParameters, "GET", null, function(xml){
		var resp;
		try {
			resp = JSON.parse( fn.getDbResponse(xml) )
		}
		catch (e){
			resp = {"error": "util.getJobStatus() could not parse JSON response."};
		}						
		fnCallback(resp);	
	});
	
}



/**
 * Set the metadata of the documents in a corpus
 */
util.setDocumentMetadata = function(sCorpusName, sJobId, fnCallback){
	
	if (sCorpusName == null || sJobId == null) return;
	
	var sHostUrl = document.URL;
	if (sHostUrl.indexOf("/lexit2") > 0)
		sHostUrl = sHostUrl.substring(0, sHostUrl.indexOf("/lexit2"));
		
	// Create FormData object
    var formData = new FormData();
    formData.append("project_id", util.getProjectId());
    formData.append("corpus_name", sCorpusName);
    formData.append("job_id", sJobId);
    formData.append("username", fn.getCurrentUser());
    formData.append("host_url", sHostUrl);
    formData.append("dummy", getUniqueNumber());
    formData.append("test", bTest); // lexit global var	
	
	$.ajax({
		
		url: uTermServeInstanceUrl + "webservice/api/set_document_metadata",
		type: 'POST',
		data: formData,
		processData: false, // Prevent jQuery from processing the FormData object
        contentType: false, // Let the browser set the Content-Type including the boundary
		success: function(xml) {
			if (fnCallback != null){
				fnCallback(xml);
			}
		},
		error: function(xhr, status, error) {
			console.error('Setting corpus documents metadata failed: ' + error);
		}
		
	});
	
}



/**
 * Delete a BlackLab corpus
 */
util.deleteBlackLabCorpus = function(sCorpusName, fnCallback){
	
	if (sCorpusName == null) return;
	
	var sHostUrl = document.URL;
	if (sHostUrl.indexOf("/lexit2") > 0)
		sHostUrl = sHostUrl.substring(0, sHostUrl.indexOf("/lexit2"));
		
	// Create FormData object
    var formData = new FormData();
    formData.append("project_id", util.getProjectId());
    formData.append("corpus_name", sCorpusName);
    formData.append("username", fn.getCurrentUser());
    formData.append("host_url", sHostUrl);
    formData.append("dummy", getUniqueNumber());
    formData.append("test", bTest); // lexit global var	
	
	$.ajax({
		
		url: uTermServeInstanceUrl + "webservice/api/remove_corpus",
		type: 'POST',
		data: formData,
		processData: false, // Prevent jQuery from processing the FormData object
        contentType: false, // Let the browser set the Content-Type including the boundary
		success: function(xml) {
			if (fnCallback != null){
				fnCallback(xml);
			}
		},
		error: function(xhr, status, error) {
			console.error('Deleting corpus failed: ' + error);
		}
		
	});
	
}






/**
 * Make sure that long Postgres date notation is converted to something readable
 */
util.shortDateFormat = function(sDate){
	if (sDate != null && sDate != ''){
		return sDate.replace(/^(\d+)(-)(\d+)(-)(\d+)( )(\d+)(:)(\d+)(:)(\d+)(\.)(.+)$/, '$1$2$3$4$5$6$7$8$9');
	}					
	return sDate;
}





/**
 * Make sure one gets a row to process, whatever the circumstances are
 */
util.getBestRow = function(t) {

	var nRow = null;
	
	if (fn.getViewType(t) == "form"){
		nRow =  fn.getFirstRowNodeFrom(t);
	}
	else {
		nRow = fn.getFirstSelectedRowNodeFrom(t);
		if (nRow == null) nRow = fn.getFirstRowNodeFrom(t);
	}
	return nRow;
};


/**
 * Set the name of the button in the header, depending on the view mode
 */
util.setButtonNameGivenViewMode = function(t, iButtonIndex){
	
	
	// when toggling to detail view
	if (fn.getViewType(t) == "form"){
		fn.setCustomButtonName(t, iButtonIndex, "<span class='ui-icon ui-icon-image' style='background-color: yellow''></span> Overzicht");
	}
	
	// when toggling to table view
	else {
		
		fn.setCustomButtonName(t, iButtonIndex, "<span class='ui-icon ui-icon-image' style='background-color: yellow''></span> Details");
	}
}


/**
 * Move the Lex'it custom buttons to a separate div in the center of the header
 */
util.putCustomButtons = function(t){
	
	if ( $("#"+fn.getTableName(t)+"_wrapper div.top").find(".table_header_button_div").length == 0){
		
		// add a div to contain the buttons
		var buttonDiv = 
			$("<div></div>")
				.addClass("table_header_button_div")
				.appendTo(
					$("#"+fn.getTableName(t)+"_wrapper div.top")
				);
		
		// move the buttons to the buttonDiv
		$("#"+fn.getTableName(t)+"_wrapper div.top")
			.find("div[id*='_custombutton_']")
			.appendTo(buttonDiv);
		
		$("#"+fn.getTableName(t)+"_wrapper div.top")
			.find("div.clear")
			.remove();
		
		// finally, make sure that we have a number of buttons which is a multiple of 3
		// (since the div is 3 columns wide, and has justify-content: space-between)
		
		var nButtons = $("#"+fn.getTableName(t)+"_wrapper div.top").find(".table_header_button_div").children().length;
		var nEmptyButtons = 3 - (nButtons % 3);
		
		for (var i=0; i<nEmptyButtons; i++){
		 
			$("<div></div>")
				.append(
					$("<button></button>").addClass("table_header_button_empty")
				)
				.css("opacity", 0) // invisible
				.appendTo(buttonDiv);		
			
		}
	}
}



/**
 * Move the Lex'it free buttons to a separate div in the center of the header
 */
util.putFreeButtons = function(t){
	
	if ( $("#"+fn.getTableName(t)+"_wrapper div.top").find(".table_header_button_div").length == 0){
		
		// add a div to contain the buttons
		var buttonDiv = 
			$("<div></div>")
				.addClass("table_header_button_div")
				.appendTo(
					$("#"+fn.getTableName(t)+"_wrapper div.top")
				);
		
		// move the buttons to the buttonDiv
		$("#"+fn.getTableName(t)+"_wrapper div.top")
			.find("div[id*='_freebutton_']")
			.appendTo(buttonDiv);
		
		$("#"+fn.getTableName(t)+"_wrapper div.top")
			.find("div.clear")
			.remove();
		
		// finally, make sure that we have a number of buttons which is a multiple of 3
		// (since the div is 3 columns wide, and has justify-content: space-between)
		
		var nButtons = $("#"+fn.getTableName(t)+"_wrapper div.top").find(".table_header_button_div").children().length;
		var nEmptyButtons = 3 - nButtons;
		
		for (var i=0; i<nEmptyButtons; i++){
		 
			$("<div></div>")
				.append(
					$("<button></button>").addClass("table_header_button_empty")
				)
				.css("opacity", 0) // invisible
				.appendTo(buttonDiv);		
			
		}
	}
}



/**
 * Show a free header button, given its table and name
 */
util.showButton = function(t, sButtonName){
	$( fn.getFreeButtomElementByName(t, sButtonName) )
		.css("opacity", 1 )								
		.prop("disabled", false);
};

/**
 * Hide a free header button, given its table and name
 */
util.hideButton = function(t, sButtonName){
	$( fn.getFreeButtomElementByName(t, sButtonName) )
		.css("opacity", 0 )								
		.prop("disabled", true);
};

util.disableButton = function(t, sButtonName){
	$( fn.getFreeButtomElementByName(t, sButtonName) )
		.css("opacity", 0.3 )		// still show the button					
		.prop("disabled", true);
};


/**
 * For a selectbox, Lex'it requires a neutral value
 */
util.addNeutralValueToSelectOptions = function(aValues){
	
	var sNeutralValue = "";
	if ($.inArray(sNeutralValue, aValues) < 0)
		aValues.unshift(sNeutralValue);
	
	return aValues;
};


/**
 * Single command to keep all table neatly aligned
 */
util.pileUpTermbankTables = function(iDelay){
	if (fn.tableIsOpen("termbank_concepten") && fn.tableIsOpen("termbank_termen") ){
		
		if (iDelay == null) iDelay = 0;
		
		setTimeout(function(){
			fn.pileupTables("termbank_concepten", "termbank_talen", function(){
				fn.pileupTables("termbank_talen", "termbank_termen");
			});
		}, iDelay);
		
	}
};

/**
 * Read and insert the blacklab contexts into the contexts table
 */
util.getContextForTermId = function(sCorpusName, iTermId, sSearchTerm){
	
	var sHostUrl = document.URL;
	if (sHostUrl.indexOf("/lexit2") > 0)
		sHostUrl = sHostUrl.substring(0, sHostUrl.indexOf("/lexit2"));
		
		
	lists.showProcessingMsg("contexten", true);
	
	// start search
		
	$.ajax({
		
		url: uTermServeInstanceUrl + "webservice/api/get_contexts",
		type: 'GET',
		data: { 
			"project_id": util.getProjectId(),
			"full_corpus_name": sCorpusName,
			"term_id": iTermId,
			"query_word": sSearchTerm,
			"username": fn.getCurrentUser(),
			"host_url": sHostUrl,
			"dummy": getUniqueNumber(),
			"test": bTest // lexit global var
		},
		success: function(xml) {

	        setTimeout(function(){
				
				lists.refresh("contexten", function(){					
					lists.removeProcessingMsg("contexten", true);					
				});
				
			}, 500);			

		},
		error: function(xhr, status, error) {
			lists.removeProcessingMsg("contexten", true);
			console.error('Getting context failed: ' + error);
		}
		
	});
};



/**
 * Update the corpus statistics
 */
util.updateCorpusStatistics = function(sCorpusName, fnCallback){
	
	if (sCorpusName == null) return;
	
	var sHostUrl = document.URL;
	if (sHostUrl.indexOf("/lexit2") > 0)
		sHostUrl = sHostUrl.substring(0, sHostUrl.indexOf("/lexit2"));
		
	// Create FormData object
    var formData = new FormData();
    formData.append("project_id", util.getProjectId());
    formData.append("corpus_name", sCorpusName);
    formData.append("username", fn.getCurrentUser());
    formData.append("host_url", sHostUrl);
    formData.append("dummy", getUniqueNumber());
    formData.append("test", bTest); // lexit global var
	
	$.ajax({
		
		url: uTermServeInstanceUrl + "webservice/api/update_corpus_statistics",
		type: 'POST',
		data: formData,
		processData: false, // Prevent jQuery from processing the FormData object
        contentType: false, // Let the browser set the Content-Type including the boundary
		success: function(xml) {
			if (fnCallback != null){
				fnCallback(xml);
			}
		},
		error: function(xhr, status, error) {
			console.error('Setting corpus stats failed: ' + error);
		}
		
	});
	
};


// ------------------------------------------------------------------------------------------


/**
 * Function to start a term bank publication (or update)
 */
util.startTermBankPublication = function(sSiteName, fnCallback){
					
	var sUrl = uTermServeInstanceUrl + "webservice/api/"+ "start_publication";
	
	
	var formData = new FormData();
    formData.append("project_id", util.getProjectId());
    formData.append("username", fn.getCurrentUser());
    formData.append("sitename", sSiteName);
    	
	
	// fn.callService gave some problem somehow
	// so we use ajax() for now
	
	$.ajax({		
		url: sUrl,
		type: 'POST',
		data: formData,
		processData: false, // Prevent jQuery from processing the FormData object
        contentType: false, // Let the browser set the Content-Type including the boundary
		success: function(xml) {			
			var resp = {};
			try {
				resp = JSON.parse( fn.getDbResponse(xml) )
			}
			catch (e){
				resp = {"error": "util.startTermBankPublication() could not parse JSON response."};
			}
			
			if (resp["error"] != null){
				fn.message("Publicatie", "Het publiceren kon niet worden gestart:<BR><BR>"+resp["error"]);
			}
			else {
				fn.message("Publicatie gestart", "Publicatie gestart.");
				if (fnCallback!=null) fnCallback(resp);	
			}
						
		},
		error: function(xhr, status, error) {			
			fn.message("Publicatie mislukt", "Publicatie mislukt:<BR><BR>"+error);			
		}
	});
};


/**
 * Activate or deactivate the term bank publication
 */
util.setTermBankStatus = function(sSiteName, sStatus, fnCallback){
					
	var sUrl = uTermServeInstanceUrl + "webservice/api/"+ "set_publication_status";	
	
	var formData = new FormData();
    formData.append("project_id", util.getProjectId());
    formData.append("username", fn.getCurrentUser());
    formData.append("sitename", sSiteName);
    formData.append("status", sStatus);
    	
	
	// fn.callService gave some problem somehow
	// so we use ajax() for now
	
	$.ajax({
		url: sUrl,
		type: 'POST',
		data: formData,
		processData: false, // Prevent jQuery from processing the FormData object
        contentType: false, // Let the browser set the Content-Type including the boundary
		success: function(xml) {			
			fn.message("Publicatiestatus", "Publicatiestatus is nu: " + sStatus );
			if (fnCallback!=null) fnCallback();			
		},
		error: function(xhr, status, error) {
			fn.message("Publicatiestatus", "Het wijzigen van de status is mislukt:<BR><BR>"+error);			
		}
	});
};


/**
 * Remove the term bank publication
 */
util.removeTermBankPublication = function(sSiteName, fnCallback){
					
	var sUrl = uTermServeInstanceUrl + "webservice/api/"+ "remove_publication";
	
	var aParams = {
		"project_id": util.getProjectId(), 
		"username": fn.getCurrentUser(),		
		"sitename": sSiteName
		};	
	
	// fn.callService gave some problem somehow
	// so we use ajax() for now
	
	$.ajax({		
		url: sUrl,
		type: 'GET',
		data: aParams,
		success: function(xml) {	
			
			var resp = {};
			try {
				resp = JSON.parse( fn.getDbResponse(xml) )
			}
			catch (e){
				resp = {"error": "util.removeTermBankPublication() could not parse JSON response."};
			}
			
			if (resp["error"] != null){
				fn.message("Publicatie", "Verwijderen van publicatie mislukt:<BR><BR>"+resp["error"]);
			}
			else {
				fn.message("Publicatie gestart", "Publicatie verwijderd.");
				if (fnCallback!=null) fnCallback();
			}
						
		},
		error: function(xhr, status, error) {
			fn.message("Verwijderen mislukt", "Verwijderen van publicatie mislukt:<BR><BR>"+error);			
		}
	});
};





// ------------------------------------------------------------------------------------------

/**
 * Display an image at a certain position
 * used for displaying images in the termbank editor (given some URL of the image)
 */
util.displayImageAtPosition = function(imageUrl, x, y, iWidth) {
	
    // Create an img element dynamically
    const $img = $('<img>', {
        src: imageUrl,
        id: "imageviewer",
        css: {			
            position: 'absolute',
            top: y + 'px',
            left: x + 'px',
            width: iWidth + 'px',
            display: 'none', // Hide initially for smooth entry
            zIndex: 1000 // Ensure it appears above other elements
        }
    });

    // Append the image to the body
    $('body').append($img);

    // Fade in the image for a smooth effect
    $img.fadeIn(500);
};




/**
 * Check if a url is valid
 * To be used in the term bank editor, before trying to display an image
 */
util.isValidUrl = function(string) {
    try {
        new URL(string);
        return true;
    } catch (error) {
        return false;
    }
};



/***
 * Generic function for setting an autocomplete for
 * 
 * example of input: '#form_cellvalue_domein textarea', 'termbank_concepten', 'domein'
 */
util.setAutocompleteFor = function(selector, sTermbankTable, sFieldName){
	
	$(document).on(
		"focus", 
		selector, 
		function(event){
			
			$(event.target).autocomplete({
				
				delay: 750,
				minLength: 2, 
				source: function(request, response){
					
					fn.callFunction(util.getProjectId() + ".search_for", [sTermbankTable, sFieldName, fn.quote( request.term ) ], 
							function(func_resp){  
						
								var aSuggestionsArr = (func_resp["search_for"]).split("^^^");
									
								response($.map(aSuggestionsArr, function (item) {
									return {
										label: item,
										value: item
									};
								}));
							});
				},
				
				open: function(event, ui){
	
					setTimeout(function(){
						$(event.target).putInFront();
					}, 100);
				}				
			});
		
		}
	);
};

/**
 * Generic function to remove a autocomplete for a certain selector
 */
util.removeAutocompleteFrom = function(selector){
	
	$(document).off("focus", selector);

};
