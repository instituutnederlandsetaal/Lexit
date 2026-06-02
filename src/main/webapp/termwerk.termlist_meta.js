

termlist_meta = {};


termlist_meta.settings = {
	
	"top": sTableTopPosition,
	"left": "20px",
	"nice_name": "Termenlijsten",
	
	"class": "largetermbank", // apply special border styling for cells etc.
	
	"main_search": false,
	"export_buttons": false,
	"exact_count": true,
	"pagination_on_top": false,
	
	"columns_button": bLexitButtonTest,
	"goto_button": bLexitButtonTest,
	"refresh_button": bLexitButtonTest,
	"replace_button": bLexitButtonTest,
	"reset_button": bLexitButtonTest,
	"selection_button": bLexitButtonTest,
	"undo_button": bLexitButtonTest,
	"help_button": bLexitButtonTest,
	"viewtype_button": bLexitButtonTest,
	
	"width": sTableTermBankWidth,
	
	"columns_order": [
		"btn_toon",
		"termlist_id",
		"job_id",
		"bronnaam",
		"description",
		"brontype",
		"herkomst",
		"status",		
		"genre",
		"aangemaakt_op",
		"aangemaakt_door",		
		"gewijzigd_op",
		"gewijzigd_door",
		"aantal"
	],
	
	"buttons": {
		
		"Termenlijst importeren": {
		
			"class": "table_header_button nopadding",
			"tooltip": "Importeer een termenlijst vanuit Excel of CSV",
			"click": function(t){
				
				var sUploadForm =
				
					"    <form id=\"fileUploadForm\">" +
					
					"        Kies een bestand:<BR>" +
					"        <input type=\"file\" id=\"fileChooser\" name=\"file\" />" +
					
					"        <BR>"+
					
					"		 Naam:<BR>"+
					"        <input type=\"text\" id=\"uploadname\" name=\"uploadname\" />" +
					
					
					"       <BR><BR>" +
					"       <button type=\"button\" id=\"upload_start_button\" onclick=\"util.uploadFile(null, null, true)\">Start upload</button>" +
					
					"    </form>" +
					
					"		<BR><BR>Let op! Toegestane bestandsinhoud:"+
					"		<div class='upload_info'>" +
					"			<table><tr>" +				
						aTermlistUploadAcceptedColumns.join("</tr><tr>") +
					"			</tr></table>"+
					"		</div>";
	
				const queue = new FunctionQueue();
				
				queue.enQueue(function(){
				
					// show dialog	
					fn.message("Excel of CSV bestand uploaden", sUploadForm);
					
				});	
				queue.enQueue(function(){
					
					// make sure that the OK button, which in this case acts as a cancel button, is labeled as such
					// and give it the proper styling
					$("#dialog_accept_button")
						.text("Annuleren")
						.removeClass("ui-button").removeClass("ui-corner-all").removeClass("ui-widget")
						.attr("id", "upload_cancel_button");
					$("#upload_cancel_button").appendTo("#fileUploadForm");
					
					$("input#fileChooser").focus();
				});
			}
			
		},
		"Termenlijst verwijderen": {
			
			"class": "table_header_button nopadding danger",
			"click": function(t){
				
				var nSelectedRow = fn.getFirstSelectedRowNodeFrom(t);
				
				if (nSelectedRow == null) {
					fn.message("Let op", "Selecteer eerst een termenlijst om te verwijderen");
					return;
				}
				else {
					var sTermlistID = fn.getDataFromCellInRowNode(nSelectedRow, "termlist_id");
					var sTermlistName = fn.getDataFromCellInRowNode(nSelectedRow, "bronnaam");
							
					fn.confirm("Let op", "Weet u zeker dat u termenlijst '"+sTermlistName+"' wilt verwijderen?", 
						function(){
							fn.removeFromDatabaseGivenFieldValues("termenlijst", {"termlist_id": sTermlistID}, function(){
								fn.removeFromDatabaseGivenFieldValues("termenlijst_meta", {"termlist_id": sTermlistID}, function(){
									fn.updateTableGivenFieldValues("corpora", {"termlist_id": sTermlistID}, {"termlist_id": null}, function(){
										fn.refreshTable("termenlijst");
										fn.refreshTable("termenlijst_meta");
										if (fn.tableIsOpen("corpora")) fn.refreshTable("corpora");	
									});
									
								});
							});
							
						},
						function(){
							// cancelled
						}
					);
				}
			}
		}
		
	},
	
	
	
	
	"resize_callback": function(t, ui){
		form.updateLayout(t, true, false);
	},
	
	
	"callback": function(t){
		
		
		// put the custom buttons in the middle of the header
		util.putFreeButtons(t);
		
		// hide the length selector in form view
		if (fn.getViewType(t) == "form") {
			$("#"+fn.getTableName(t)+"_wrapper").find("#"+fn.getTableName(t)+"_length").hide();
			$("#"+fn.getTableName(t)+"_wrapper").find(".dataTables_info").hide();
		}
		else {			
			$("#"+fn.getTableName(t)+"_wrapper").find("#"+fn.getTableName(t)+"_length").show();
			$("#"+fn.getTableName(t)+"_wrapper").find(".dataTables_info").show();
		}
		
		
		// get the job IDs and show their status
		if (fn.getViewType(t) == "table") {
			
			var bRefreshNeeded = false;
			
			// function to be called when all rows' statuses have been checked:
				// if we still have unfinished jobs, refresh the table in 10 seconds
			var fnSetRefreshIfNeeded = function(t){				
				if (bRefreshNeeded) {					
					setTimeout(function(){						
						fn.refreshTable(t);
					}, 10000); // wait 10 seconds before new check
				}
			};
			
			var aRows = fn.getAllRowNodes(t);
			$(aRows).each(function(){
				
				var nRow = this;
				var bLastRow = fn.isLastNodeOf(nRow, aRows);
				var sJobId = fn.getDataFromCellInRowNode(nRow, "job_id");
				var sCurrentStatus = fn.getDataFromCellInRowNode(nRow, "status");
				
				// if job ID is not null
				// and the status is not finished nor failed, check it now
				
				if ( (sJobId != null && sJobId != "" && sJobId != "none") && (sCurrentStatus != "failed" && sCurrentStatus != "finished") ) {
					
					util.getJobStatus(sJobId, function(TwApiResp) {
						
						if (TwApiResp != null) {
							
							var sNewStatus = TwApiResp["status"];
							
							if (sNewStatus != sCurrentStatus){
								fn.updateTableGivenFieldValues(t, { "job_id": sJobId }, {"status": sNewStatus}, function(){
									
									setTimeout(function(){
										fn.getRecordGivenFieldValues(t, { "job_id": sJobId }, function(aRecord){
											var sStatus = (aRecord["status"] == null ? "unknown" : aRecord["status"]);
											fn.putDataIntoCellNode(nRow, "status", sStatus);
											
											// some unfinished job still has the same status, so we'll need to refresh the table after a while
											bRefreshNeeded = (sStatus != "failed" && sStatus != "finished");
											if (bLastRow) fnSetRefreshIfNeeded(t);
										});
									}, 500);
									
								});
							}
							// some unfinished job still has the same status, so we'll need to refresh the table after a while
							else {
								bRefreshNeeded = true;
								if (bLastRow) fnSetRefreshIfNeeded(t);
							}
							
						} // end of status check (response non empty)
						
					});	// end of getJobStatus call
								
				} // end of job ID and 'finished'/'failed' status check in a row
				
				
			}); // end of loop through rows		

		}
		
	},
	"repeat_callback": true
};


termlist_meta.config = {
	
	
	"btn_toon": {
		"nice_name": "_",
		"button": "toon",
		"class": "cell_button",
		"click": function(t, n){
			
			var sMetaTable = fn.getTableName(t);
			gui.showProcessingMsg(sMetaTable);
			
			var sTermlistID = fn.getDataFromSiblingNode(n, "termlist_id");
			var sTermlistName = fn.getDataFromSiblingNode(n, "bronnaam");
			var sBronType = fn.getDataFromSiblingNode(n, "brontype");
			var sHerkomst = fn.getDataFromSiblingNode(n, "herkomst");
			
			// close termenlijst table if it's there, because it needs to be closed to be able to change its name
			// as we will set its name to be the name of the loaded termlist
			if (fn.tableExists("termenlijst")){						
				fn.closeTable("termenlijst");
			}
			
			util.updateTermPresenceMark(sTermlistID, function(){
				
				gui.removeProcessingMsg(sMetaTable);
				
				fn.callTable("termenlijst", 
					{"termlist_id": sTermlistID}, 
					function(){
						
						// put the termlist on front
						
						fn.putTableInFront("termenlijst");
						fn.scrollToTable("termenlijst", true);
						setTimeout(function(){
							
							// set readable name
							fn.setTableNameInHeader("termenlijst", "Termenlijst '"+sTermlistName+"'");
							
							// register the blacklab corpus name if available
							if (sBronType == "Extracted")
								$("#termenlijst_wrapper").attr("data-herkomst", sHerkomst);
							
							// make sure that the termenlijst table is put back in front if one clicks in it
							$("#termenlijst_wrapper").on("click", function(){
									if (kf.getActiveTable() == "termenlijst_meta" || fn.getTableInFront() == "termenlijst_meta"){
										fn.putTableInFront("termenlijst");
									}
							});
						}, 500);
					}, 
					{"viewtype": "table", "left": "35px", "top": "270px"}
				);
			});
			
		}
	},
	
	"job_id": {
		"nice_name": "Job ID",
		"visible": bTest,
	},
	
	"termlist_id": {
		"visible": false
	},
	
	"bronnaam": {
		"nice_name": "naam",
		"editable": true
	},
	"herkomst": {
		
	},
	"brontype": {
		"nice_name": "type"
	},	
	
	
	"description": {
		"nice_name": "beschrijving",
		"editable": true
	},
	"genre": {
		"visible": false,
		"editable": true
	},
	
	"aangemaakt_door": {
		"nice_name": "aanmaker"
	},
	"aangemaakt_op": {
		"nice_name": "aangemaakt",
		"render": function(sValue) {
			return util.shortDateFormat(sValue);
		}
	},
	
	"gewijzigd_door": {
		"nice_name": "door"
	},
	"gewijzigd_op": {
		"nice_name": "gewijzigd",
		"render": function(sValue) {
			return util.shortDateFormat(sValue);
		}
	},
	
	"aantal": {
		
	}
};