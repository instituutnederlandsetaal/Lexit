

termcorpora = {};


termcorpora.settings = {
	
	
	"top": sTableTopPosition,
	"left": "20px",
	
	"class": "largetermbank", // apply special border styling for cells etc.
	
	"nice_name": "Overzicht van corpora",
	
	"width": sTableTermBankWidth,
	
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
	
	"resizable": false,
	
	"columns_order": [
		"corpus_id",
		"btn_toon",
		"btn_doorzoeken", 
		"name", "blacklab_corpusname", "description", 
		"creation_date", "creator", "last_modification", "last_editor", "documents", "termlists", 
		"tokens", "termlist_id", "termlist_ids", 
		"btn_nieuwetermbank", "status", "job_id", "source", "is_public", "license", "btn_nieuwetermenlijst", "btn_bewerken"
	],
	
	"buttons": {
		
		
		"Nieuw corpus": {
			
			"class": "table_header_button",
			"click": function(t){
				
				var sUploadForm =
					"    <form id=\"fileUploadForm\">" +
					
					"        Kies een bestand:<BR>" +
					//"        <input type=\"file\" id=\"fileChooser\" name=\"file\" multiple  />" +
					"        <input type=\"file\" id=\"fileChooser\" name=\"file\"  />" +
					
					"        <BR>"+
					
					"		 Naam:<BR>"+
					"        <input type=\"text\" id=\"uploadname\" name=\"uploadname\" />" +
					
					"        <BR><BR>" +
					"        <button type=\"button\" id=\"upload_start_button\" onclick=\"util.uploadCorpus()\">Start upload</button>" +
					"    </form>";
	
				const queue = new FunctionQueue();
				
				queue.enQueue(function(){
				
					// show dialog	
					fn.message("Corpusupload", sUploadForm);
					
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
		
		
		"Verwijderen": {
			"class": "table_header_button danger",
			"click": function(t){
				
				var nSelectedRow = fn.getFirstSelectedRowNodeFrom(t);
				
				if (nSelectedRow == null) {
					fn.message("Let op", "Selecteer eerst een corpus om te verwijderen");
					return;
				}
				else {
					var sCorpusID = fn.getDataFromCellInRowNode(nSelectedRow, "corpus_id");
					var sCorpusName = fn.getDataFromCellInRowNode(nSelectedRow, "name");
					var sFullorpusName = fn.getDataFromCellInRowNode(nSelectedRow, "blacklab_corpusname");
							
					fn.confirm("Let op", "Weet u zeker dat u corpus '"+sCorpusName+"' wilt verwijderen?", 
						function(){
							
							util.deleteBlackLabCorpus(sFullorpusName, function(){
								
								fn.removeFromDatabaseGivenFieldValues("corpora", {"corpus_id": sCorpusID}, function(){
								
									fn.clearAllFilters("corpora");
									fn.callTable("corpora", {}, function(){								
										setTimeout(function(){
											// go back to table view
											fn.toggleViewType("corpora");
										}, 1000);									
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
		},
		
		"Doorzoeken": {
				
				"class": "table_header_button ",
				"click": function(t) {
					
					var nSelectedRow = util.getBestRow(t);
					var sBlackLabCorpusName = fn.getDataFromCellInRowNode(nSelectedRow, "blacklab_corpusname");
					
					if (sBlackLabCorpusName == null || sBlackLabCorpusName == "") {
						$("#corpora_freebutton_doorzoeken").addClass("invisible");
					}
					else {
						var sUrl = "/corpus-frontend/" + sBlackLabCorpusName + "/search/";
						window.open(sUrl, "Corpus doorzoeken");	
					}				
						
				}
			},
			
		
	},
	
	
	
	"resize_callback": function(t, ui){
		form.updateLayout(t, true, false);
	},
	
	
	"callback": function(t){
		
		// put the custom buttons in the middle of the header
		util.putFreeButtons(t);
		
		
		// remove unneeded elements like rows counting etc.
		if (fn.getViewType(t) == "form") {
			$("#"+fn.getTableName(t)+"_wrapper .top").find(".dataTables_info").text("");
			$("#"+fn.getTableName(t)+"_wrapper .top").find(".dataTables_length").hide();
			$("#"+fn.getTableName(t)+"_wrapper").find(".paging_full_numbers").hide();
		}
		
		
		// set visibility of header buttons in view form
		if (fn.getViewType(t) == "form") {
			$("#corpora_wrapper").find("#corpora_custombutton_1").hide();
		}
		else {
			$("#corpora_wrapper").find("#corpora_custombutton_1").show();
		}
		
		// set title in view form
		if (fn.getViewType(t) == "form") {
			var sCorpusName = form.getDataFromCell("corpora", "name", true);
			fn.setTableNameInHeader("corpora", "Details van '"+sCorpusName+"'");
			
			util.disableButton(t, "Nieuw corpus");			
			util.showButton(t, "Verwijderen");
			util.showButton(t, "Doorzoeken");
		}
		else {
			fn.setTableNameInHeader("corpora", "Overzicht van corpora");
			
			util.showButton(t, "Nieuw corpus");
			util.hideButton(t, "Verwijderen");
			util.hideButton(t, "Doorzoeken");
		}
		
		// hide the length selector in form view
		if (fn.getViewType(t) == "form") {
			$("#"+fn.getTableName(t)+"_wrapper").find("#"+fn.getTableName(t)+"_length").hide();
			$("#"+fn.getTableName(t)+"_wrapper").find(".dataTables_info").hide();
		}
		else {			
			$("#"+fn.getTableName(t)+"_wrapper").find("#"+fn.getTableName(t)+"_length").show();
			$("#"+fn.getTableName(t)+"_wrapper").find(".dataTables_info").show();
		}
		
		
		
		// if in table view, get the job IDs and show their status
		if (fn.getViewType(t) == "table") {
			
			var aRows = fn.getAllRowNodes(t);
			$(aRows).each(function(){
				
				var nRow = this;
				var sJobId = fn.getDataFromCellInRowNode(nRow, "job_id");
				var sCurrentStatus = fn.getDataFromCellInRowNode(nRow, "status");
				
				// yet to be filled
				var sFullCorpusName; 
				var sNewStatus;

				// do we have a job ID 
				// and
				// is the current (not updated) status nor finished nor failed?
				
				if ( (sJobId != null && sJobId != "") && (sCurrentStatus != "failed" && sCurrentStatus != "finished") ) {


					// get the status of the job in the TwAPI
					
					util.getJobStatus(sJobId, function(TwApiResp) {
						
						if (TwApiResp != null) {
							
							// read status and full corpus name from the response
							
							sNewStatus = TwApiResp["status"];
							sFullCorpusName = (TwApiResp["full_corpus_name"] == null ? "unknown" : TwApiResp["full_corpus_name"]);
							
							
							// prepare status update in the corpus overview table
							 
							var sUpdatedStatus = (sNewStatus == null ? "unknown" : sNewStatus);
							var aToUpdate = {"status": sUpdatedStatus};
				
				            // if the NEW status is 'finished' 
				            // register the corpus name in blacklab corpus table
				            // and register the documents metadata in the documents table 
				            
							if (sUpdatedStatus == "finished"){
								
								// register corpus name in blacklab corpus table
								aToUpdate["blacklab_corpusname"] = sFullCorpusName;
							}
							
							
							// if the NEW status is 'unknown' and the current status is 'finished' or 'failed', 
							// keep the current status
							
							if (sUpdatedStatus == "unknown" && (sCurrentStatus == "finished" || sCurrentStatus == "failed")){
								aToUpdate["status"] = sCurrentStatus; 			
							}
							

	
							// set the status in the table
							
							fn.updateTableGivenFieldValues(t, { "job_id": sJobId }, aToUpdate, function(){
									
								setTimeout(function(){
									
									if (sUpdatedStatus == "finished"){
										
										// share corpus with other users
										util.updateUsersHavingAccess();		
										
										// set the number of docs and tokens the table too
										util.updateCorpusStatistics(sFullCorpusName);
										
										// register the documents metadata in the documents table								
										util.setDocumentMetadata(sFullCorpusName, sJobId);										
									}
									
									
									// update rows only (t.i. prevent table refresh, which would re-start this callback = infinite loop)
									
									setTimeout(function(){
										
										fn.getRecordGivenFieldValues(t, { "job_id": sJobId }, function(aRecord){
										
											var sStatus = (aRecord["status"] == null ? "unknown" : aRecord["status"]);
											var sCorpusName = (aRecord["blacklab_corpusname"] == null ? "unknown" : aRecord["blacklab_corpusname"]);
											
											fn.putDataIntoCellNode(nRow, "status", sStatus);
											fn.putDataIntoCellNode(nRow, "blacklab_corpusname", sCorpusName);										
											fn.putDataIntoCellNode(nRow, "tokens", aRecord["tokens"]);
											
										}); // end of last row update with all corpus info	
									
									}, 500); // small delay to allow data to be written to the database before reading it again
									
									
								}, 250); // small delay before firing fn.updateTableGivenFieldValues() callback 
								
									
							}); // end of the row update
							
						} // end of status check (response non empty)
						
					});

				}; // end of job ID and 'finished'/'failed' status check
				
				
			});
		}
	},
	
	"repeat_callback": true,
	
	"preinit_callback": function(){
		
		// share all corpora with other users
		util.updateUsersHavingAccess();	
	},	
	
	
	"formgrid": {
		
		"definition": [30, 20],
		"top": sTableTopPosition,
		"bgcolor": "#EFEFEF",
		
		// form horizontal alignment
		"align": "center",
		
		// no search bar
		"searchbar": false,

		// buttons bar undo/save
		"buttonsbar_position": [iProjectFormBaseX +10, iProjectFormBaseY +6.5*iProjectFormTotalHeight],
		
		
		"textblocks": {
			
			"title": {
				"position": [iProjectFormBaseX +1, iProjectFormBaseY -2 ],
				"definition": [5, 1],
				"text": "Details van corpus"
			}
			
		},
		
		
		"buttons": {
			
			"extraheer nieuwe termenlijst": {
				
				"position": [iProjectFormBaseX +18, iProjectFormBaseY +6*iProjectFormTotalHeight ],
				"definition": [3, 1],
				"class": "termwerk_button large",
				"click": function(t) {
					
					var nRow = util.getBestRow(t);
					
					var sStatus =  fn.getDataFromCellInRowNode(nRow, "status");					
					var sSelectedCorpusnaam = fn.getDataFromCellInRowNode(nRow, "name");					
					var sSelectedBlacklabCorpusnaam = fn.getDataFromCellInRowNode(nRow, "blacklab_corpusname");
					var sExtractor = "termsearchud";
					var sProjectId = util.getProjectId();
					
					
					// if the loading failed, we can't extract anything
					
					if (sStatus != "finished"){
						fn.message("Let op", "Het corpus aanmaken heeft nu status '"+sStatus+"'.<BR><BR>U kunt dus nog geen termenlijst extraheren.");
						return;
					}
					
					// start extraction
					
					var sUrl = uTermServeInstanceUrl + "webservice/api/"+ "start_extraction";
					
					var aParams = {
						"project_id": sProjectId, 
						"username": fn.getCurrentUser(),
						"extractor": sExtractor,
						"corpus_name": sSelectedBlacklabCorpusnaam,
						"bronnaam": sSelectedCorpusnaam
						};
					
					
					// fn.callService gave some problem somehow
					// so we use ajax() for now
					
					$.ajax({		
						url: sUrl,
						type: 'POST',
						data: aParams,
						//contentType: false, // Required for correct boundary string
						//processData: false, // Necessary to prevent jQuery from transforming the data
						success: function(xml) {
							
							fn.refreshTable("corpora");
							fn.message("Termenlijst extractie", "Termenlijst extractie gestart.");
							
						},
						error: function(xhr, status, error) {
							// now open the termlist metadata table
							fn.closeAllTables(function(){
								fn.callTable("termenlijst_meta");
							});	
						}
					});
					
				}
			},
			
			"toon documenten": {
				
				"position": [iProjectFormBaseX +19.3, iProjectFormBaseY +2.2*iProjectFormTotalHeight],
				"definition": [3, 1],
				"class": "termwerk_button",
				"click": function(t) {
					
					var nSelectedRow = util.getBestRow(t);
					var sCorpusId = fn.getDataFromCellInRowNode(nSelectedRow, "corpus_id");
					var sCorpusName = fn.getDataFromCellInRowNode(nSelectedRow, "name");
					
					// open the document metadata table
					fn.callTable("documenten_meta", 
						{"corpus_id": sCorpusId}, 
						function(){
							fn.putTableInFront("documenten_meta");
							fn.setTableNameInHeader("documenten_meta", "Documenten in corpus '"+sCorpusName+"'");
						}, 
						{"left": "50px", "top": "270px"}
					);
					
					
				}
				
			},			
			"toon termenlijsten": {
				
				"position": [iProjectFormBaseX +19.3, iProjectFormBaseY +4.2*iProjectFormTotalHeight],
				"definition": [3, 1],
				"class": "termwerk_button",
				"click": function(t) {
					
					var nSelectedRow = util.getBestRow(t);
					var sTermListId = fn.getDataFromCellInRowNode(nSelectedRow, "termlist_id");
					fn.callTable("termenlijst_meta", 
						{"termlist_id": sTermListId}, 
						function(){
							fn.putTableInFront("termenlijst_meta");
						}, 
						{"left": "50px", "top": "270px"}
					);

				}
				
			}
		},

		"cells": {
			
			"name": {
				"nice_name": "corpusnaam",
				"class": "horizontaal_cell",
				"visible": true,
				"editable": true,
				"position": [iProjectFormBaseX, iProjectFormBaseY +0*iProjectFormTotalHeight],
				"definition": [iProjectFormWidth, iProjectFormTotalHeight]
			},
			"description": {
				"nice_name": "beschrijving",
				"class": "horizontaal_cell",
				"visible": true,
				"editable": true,
				"position": [iProjectFormBaseX, iProjectFormBaseY +1*iProjectFormTotalHeight],
				"definition": [iProjectFormWidth, iProjectFormTotalHeight]
			},
			"license": {
				"nice_name": "licentie",
				"class": "horizontaal_cell",
				"visible": true,
				"editable": true,
				"position": [iProjectFormBaseX, iProjectFormBaseY +3*iProjectFormTotalHeight],
				"definition": [iProjectFormWidth, iProjectFormTotalHeight]
			},
			"source": {
				"nice_name": "referentie",
				"class": "horizontaal_cell",
				"visible": true,
				"editable": true,
				"position": [iProjectFormBaseX, iProjectFormBaseY +4*iProjectFormTotalHeight],
				"definition": [iProjectFormWidth, iProjectFormTotalHeight]
			},
			
			
			"creation_date": {
				"nice_name": "aangemaakt",
				"class": "horizontaal_cell",
				"visible": true,				
				"position": [iProjectFormBaseX +12, iProjectFormBaseY  +0*iProjectFormTotalHeight],
				"definition": [iProjectFormWidth, iProjectFormTotalHeight],
				"render": function(sValue) {
					return util.shortDateFormat(sValue);
				}
			},
			"last_modification": {
				"nice_name": "laatste wijziging",
				"class": "horizontaal_cell",	
				"visible": true,			
				"position": [iProjectFormBaseX +12, iProjectFormBaseY +1*iProjectFormTotalHeight],
				"definition": [iProjectFormWidth, iProjectFormTotalHeight],
				"render": function(sValue) {
					return util.shortDateFormat(sValue);
				}
			},
			
			"documents": {
				"class": "horizontaal_cell",	
				"visible": true,			
				"position": [iProjectFormBaseX +12, iProjectFormBaseY +2*iProjectFormTotalHeight],
				"definition": [iProjectFormWidth, iProjectFormTotalHeight]
			},
			"tokens": {
				"class": "horizontaal_cell",
				"visible": true,				
				"position": [iProjectFormBaseX +12, iProjectFormBaseY  +3*iProjectFormTotalHeight],
				"definition": [iProjectFormWidth, iProjectFormTotalHeight]
			},
			"termlists": {
				"class": "horizontaal_cell",	
				"nice_name": "termenlijsten",
				"visible": true,			
				"position": [iProjectFormBaseX +12, iProjectFormBaseY +4*iProjectFormTotalHeight],
				"definition": [iProjectFormWidth, iProjectFormTotalHeight]
			}
			
		
		}
		
	}
		
};


termcorpora.config = {
	
	"btn_toon": {
		"nice_name": "_",
		"button": "details",
		"class": "cell_button",
		"click": function(t, n) {
			
			var sCorpusID = fn.getDataFromSiblingNode(n, "corpus_id");
			var sBronNaam = fn.getDataFromSiblingNode(n, "name"); 
			
			// share corpus with other users
			util.updateUsersHavingAccess();
			
			// make sure any termist belonging to the corpus is added to it
			fn.callFunction(util.getProjectId()+".add_termist_to_corpus", [sBronNaam], function(){
				
				// show corpus in form view			
				fn.callTable(t, { "corpus_id": sCorpusID }, function(){
					if (fn.getViewType(t) != "form"){
						setTimeout(function(){
							fn.toggleViewType(t);
						}, 500);
					}
				});
				
			});			

		}
	},
	
	"corpus_id": {
		"visible": false
	},
	
	"name": {
		"nice_name": "corpusnaam"
	},
	"blacklab_corpusname": {
		"visible": false
	},	
	"description": {
		"nice_name": "beschrijving"
	},
	
	"btn_doorzoeken": {
		
		"visible": false,
		
		"class": "cell_button",
		"button": "doorzoeken",
		"click": function(t, n){
			
			// /corpus-frontend/CORPUSNAAM/search/
			
			window.open(sUrl, "Corpus doorzoeken");
		}
	},
	
	"btn_nieuwetermenlijst": {
		
		"visible": false,
		
		"class": "cell_button",
		"button": "Nieuwe&nbsp;termenlijst", 	// &nbsp; to prevent line break
		"click": function(t, n){
			
			var sTermListId = fn.getDataFromSiblingNode(n, "termlist_id");
			fn.callTable("termenlijst_meta", {"termlist_id": sTermListId});	
		}
	},
	
	"btn_nieuwetermbank": {
		"visible": false
	},
	
	"creation_date": {
		"nice_name": "aangemaakt",
		"render": function(sValue) {
			return util.shortDateFormat(sValue);
		}
	},
	"creator": {
		"visible": false
	},
	
	"last_modification": {
		"nice_name": "laatste wijziging",
		"render": function(sValue) {
			return util.shortDateFormat(sValue);
		}
	},
	
	"last_editor": {
		"nice_name": "door",
	},
	
	"documents": {
		"nice_name": "documenten",
	},
	
	"status": {
		"visible": true
	},
	"job_id": {
		"visible": false
	},
	"license": {
		"visible": false
	},
	
	"btn_bewerken": {
		"visible": false
	},
	
	"source": {
		"visible": false
	},
	"is_public": {
		"visible": false
	},
	
	"termlist_id": {
		"nice_name": "termlist ID",
		"visible": true
	},
	"termlist_ids": {
		"nice_name": "termlist IDs",
		"visible": false
	},
	"termlists": {
		"visible": false
	}
	
};