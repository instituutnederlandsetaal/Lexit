
termbank_summary = {};

termbank_summary.formbaseX = 3;
termbank_summary.formbaseY = 3;

termbank_summary.formWidth = 7;
termbank_summary.formHeight = 1.5;
termbank_summary.formTotalHeight = termbank_summary.formHeight * 1.3;

termbank_summary.settings = {
	
	"nice_name": "Termenbank instellingen",
	
	"width": "90%",
	"left": "20px",
	"top": sTableTopPosition,
	"header_height": "60px",
	"main_search": false,
	"export_buttons": false,
	"viewtype": "form",
	"pagination_on_top": false,
	"pagination_at_bottom": false,
	
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
	
	"close_callback": function(t){
		
		// when the table is closed, make sure the current fields selection is saved to a cookie
		termfieldselector.saveSelectionToCookie();		
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
		"buttonsbar_position": [termbank_summary.formbaseX+6, termbank_summary.formbaseY +4*termbank_summary.formTotalHeight], 
		//[16, termbank_summary.formbaseY + 1],
		
		
		"textblocks": {
			
			"form_title": {
				"text": "Details van de termenbank",
				"position": [termbank_summary.formbaseX-0.5, termbank_summary.formbaseY - 2.2],
				"definition": [termbank_summary.formWidth, termbank_summary.formHeight]
			},
			
			"fields_conceptlevel": {
				"text": "Velden op conceptniveau",
				"position": [termbank_summary.formbaseX-0.5, termbank_summary.formbaseY +5*termbank_summary.formTotalHeight],
				"definition": [termbank_summary.formWidth, termbank_summary.formHeight]
			},
			"fields_conceptlevel_table": {
				"text": "",
				"class": "fields_table",
				"position": [termbank_summary.formbaseX, termbank_summary.formbaseY +5.5*termbank_summary.formTotalHeight],
				"definition": [(2/3)*termbank_summary.formWidth, termbank_summary.formHeight*3],
				"click": function(t){
					
					var sTableName = fn.getTableName(t);
					var sNameTermbank = form.getDataFromCell(sTableName, "naam_termbank");
					if (sNameTermbank == null || sNameTermbank == "") {
						fn.message("Let op!", "Vul eerst de naam van de termenbank in.");
						return;
					}
					
					termfieldselector.showDialog("concepten", function(){
						
						// Show the current field selection in the termbank definition form
						termfieldselector.showSelectionInForm(t);						
						
						// Update the columns/cells visibility settings given user's selection
						termfieldselector.updateFieldsVisibility();
						
						// recompute the accordion cells groups
						termfieldselector.recomputePositionsHorizontalGroups(termfieldselector.set2table["concepten"]);
						
						// save to database
						termfieldselector.saveSelectionToCookie("concepten");	
						
					});
				}
			},
			
			
			
			"fields_languagelevel": {
				"text": "Velden op taalniveau",
				"position": [termbank_summary.formbaseX+5.5, termbank_summary.formbaseY +5*termbank_summary.formTotalHeight],
				"definition": [termbank_summary.formWidth, termbank_summary.formHeight]
			},
			"fields_languagelevel_table": {
				"text": "",
				"class": "fields_table",
				"position": [termbank_summary.formbaseX+6, termbank_summary.formbaseY +5.5*termbank_summary.formTotalHeight],
				"definition": [(2/3)*termbank_summary.formWidth, termbank_summary.formHeight*3],
				"click": function(t){
					
					var sTableName = fn.getTableName(t);
					var sNameTermbank = form.getDataFromCell(sTableName, "naam_termbank");
					if (sNameTermbank == null || sNameTermbank == "") {
						fn.message("Let op!", "Vul eerst de naam van de termenbank in.");
						return;
					}
					
					termfieldselector.showDialog("talen", function(){
						
						// Show the current field selection in the termbank definition form
						termfieldselector.showSelectionInForm(t);						
						
						// Update the columns/cells visibility settings given user's selection
						termfieldselector.updateFieldsVisibility();
						
						// recompute the accordion cells groups
						termfieldselector.recomputePositionsHorizontalGroups(termfieldselector.set2table["talen"]);						
						
						// save to database
						termfieldselector.saveSelectionToCookie("talen");
					});
				}
			},
			
			
			"fields_termlevel": {
				"text": "Velden op termniveau",
				"position": [14+0.5, termbank_summary.formbaseY +5*termbank_summary.formTotalHeight],
				"definition": [termbank_summary.formWidth, termbank_summary.formHeight]
			},
			"fields_termlevel_table": {
				"text": "",
				"class": "fields_table",
				"position": [14+1, termbank_summary.formbaseY +5.5*termbank_summary.formTotalHeight],
				"definition": [(2/3)*termbank_summary.formWidth, termbank_summary.formHeight*3],
				"click": function(t){
					
					var sTableName = fn.getTableName(t);
					var sNameTermbank = form.getDataFromCell(sTableName, "naam_termbank");
					if (sNameTermbank == null || sNameTermbank == "") {
						fn.message("Let op!", "Vul eerst de naam van de termenbank in.");
						return;
					}
					
					termfieldselector.showDialog("termen", function(){
						
						// Show the current field selection in the termbank definition form
						termfieldselector.showSelectionInForm(t);
									
						// Update the columns/cells visibility settings given user's selection			
						termfieldselector.updateFieldsVisibility();
						
						// recompute the accordion cells groups
						termfieldselector.recomputePositionsHorizontalGroups(termfieldselector.set2table["termen"]);
						
						// save to database
						termfieldselector.saveSelectionToCookie("termen");
					});
				}
			}
			
		},
		
		"cells": {
			
			"termbank_id": {
				"synchronize_with": {"talen": "termbank_id"} // ensure that the talen list is filled
			},
			
			"naam_termbank": {
				"class": "horizontaal_cell",
				"position": [termbank_summary.formbaseX, 0.8 + termbank_summary.formbaseY -1*termbank_summary.formTotalHeight],
				"definition": [termbank_summary.formWidth +1, termbank_summary.formHeight],
				"tooltip": "Vul in..."
			},
			"beschrijving": {
				"class": "horizontaal_cell",
				"position": [termbank_summary.formbaseX, 0.8 + termbank_summary.formbaseY ],
				"definition": [termbank_summary.formWidth +1, termbank_summary.formHeight]
			},
			"aangemaakt_op": {
				"class": "horizontaal_cell",
				"position": [termbank_summary.formbaseX, 0.8 + termbank_summary.formbaseY +1*termbank_summary.formTotalHeight],
				"definition": [termbank_summary.formWidth +1, termbank_summary.formHeight],
				"render": function(sValue){
					return util.shortDateFormat(sValue);			
				}
			},		
			"laatste_wijziging": {
				"class": "horizontaal_cell",
				"position": [termbank_summary.formbaseX, 0.8 + termbank_summary.formbaseY +2*termbank_summary.formTotalHeight],
				"definition": [termbank_summary.formWidth +1, termbank_summary.formHeight],
				"render": function(sValue){
					return util.shortDateFormat(sValue);			
				}
			},
			
			"concepten": {
				"class": "horizontaal_cell",
				"nice_name": "concepten in termenbank",
				"position": [14+2, 0.8 + termbank_summary.formbaseY +termbank_summary.formTotalHeight],
				"definition": [termbank_summary.formWidth +1, termbank_summary.formHeight]
				
			},
			"termfiches": {
				"class": "horizontaal_cell",
				"nice_name": "termen in termenbank",
				"position": [14+2, 0.8 + termbank_summary.formbaseY +2*termbank_summary.formTotalHeight],
				"definition": [termbank_summary.formWidth +1, termbank_summary.formHeight]
				
			}
		},
		
		
		
		
		"buttons": {
			
			"Publicatiebeheer": {
				
				"class": "termwerk_button",
				"position": [16, termbank_summary.formbaseY - 1],
				"definition": [3, 1],
				"click": function(t){
					
					var nTermBankRecord = util.getBestRow(t);
					var sPublicationSiteName = fn.getDataFromCellInRowNode(nTermBankRecord, "site_name");
					var sPublicationStatus = fn.getDataFromCellInRowNode(nTermBankRecord, "publicatie_status"); // possible values: "Gepubliceerd", "Niet gepubliceerd", "Publicatie gedeactiveerd"
					var sFirstPublished = fn.getDataFromCellInRowNode(nTermBankRecord, "eerste_online_publicatie");
					var sLastPublished = fn.getDataFromCellInRowNode(nTermBankRecord, "laatste_online_publicatie");
					
					// for test
					//sPublicationStatus = "Publicatie gedeactiveerd";
					
					if (sCurrentRole == "Eigenaar"){
						
						var sPublicationNameCells = 
							"<DIV class='horizontaal_cell inpopup'>"+
							"	<div class='form_celllabel inpopup'>Naam van de publicatie</div>"+
							"	<div class='form_cellvalue inpopup editable' id='publication_name_cell'><textarea class='formview_textarea' id='sitename'>"+sPublicationSiteName+"</textarea></div>"+
							"</DIV>";
						var sPublicationUrlCells = 
							"<DIV class='horizontaal_cell inpopup'>"+
							"	<div class='form_celllabel inpopup'>Link naar de publicatie</div>"+
							"	<div class='form_cellvalue inpopup noteditable' id='publication_link_cell'></div>"+
							"</DIV>";
						var sPublicationStatusCells = 
							"<DIV class='horizontaal_cell inpopup'>"+
							"	<div class='form_celllabel inpopup'>Status</div>"+
							"	<div class='form_cellvalue inpopup noteditable' id='publication_status_cell'>"+sPublicationStatus+"</div>"+
							"</DIV>";
						var sPublicationDateCells = 
							"<DIV class='horizontaal_cell inpopup'>"+
							"	<div class='form_celllabel inpopup'>Eerste publicatiedatum</div>"+
							"	<div class='form_cellvalue inpopup noteditable' id='first_publication_date'>"+util.shortDateFormat(sFirstPublished)+"</div>"+
							"</DIV>";
						var sUpdateDateCells = 
							"<DIV class='horizontaal_cell inpopup'>"+
							"	<div class='form_celllabel inpopup'>Laatste publicatiedatum</div>"+
							"	<div class='form_cellvalue inpopup noteditable' id='last_publication_date'>"+util.shortDateFormat(sLastPublished)+"</div>"+
							"</DIV>";
							
						var sPublicationButton = "<button type='button' class='inpopup tooltip' id='publication_button' disabled title='Publiceren of bijwerken'>Publiceren</button>";
						var sActivationButton = "<button type='button' class='inpopup tooltip' id='activation_button' disabled title='Online of offline halen'>Deactiveren</button>";
						var sRemoveButton = "<button type='button' class='inpopup danger tooltip' id='remove_button' disabled title='Geheel verwijderen'>Verwijderen</button>";
						var sCloseButton = "<button type='button' class='inpopup tooltip' id='close_button' title='Sluit publicatiebeheer'>Sluiten</button>";
						
						var sButtonDiv = 
							"<DIV class='buttonbar inpopup'>"+
								"<div>"+sPublicationButton +"</div>"+
								"<div>"+ sActivationButton +"</div>"+
								"<div>"+ sRemoveButton+"</div>"+
								"<div style='width:3vw'></div>"+
								"<div>"+ sCloseButton+"</div>"+
							"</DIV>";
							
						var sManagerBody = 
							sPublicationNameCells +
							sPublicationUrlCells +
							sPublicationStatusCells +
							sPublicationDateCells +
							sUpdateDateCells + 
							"<BR><BR>" + 
							sButtonDiv;
							
						fn.message("Publicatiebeheer", sManagerBody);
						
						// get rid of the OK button
						setTimeout(function(){							
							$("div[id^='dialog-message']").parent().find("button#dialog_accept_button").hide();							
						}, 100);
						
						
						
						
						// set alle the buttons on the dialog
						setTimeout(function(){
							
							// get rid of the OK button (in case the first call was too soon)
							$("div[id^='dialog-message']").parent().find("button#dialog_accept_button").hide();						
							
							
							// make buttons active or inactive depending on the publication status							
							termbank_summary.setButtonsGivenStatus();
							
							
							// Set functionality for the buttons
							
							// publication button							
							$("div[id^='dialog-message']").parent().find("#publication_button").bind("click", function(){
								
								var nTermBankRecord = util.getBestRow("termbank_samenvatting");
								var sPublicationDate = fn.getDataFromCellInRowNode(nTermBankRecord, "eerste_online_publicatie");
								var sSiteName = $("div[id^='dialog-message']").find("#sitename").val();
								
								if (sSiteName == null || sSiteName == "") {
									fn.message("Publiceren van de Termenbank", "Vul eerst de naam van de publicatie in.");
								}
								else {
									fn.confirm("Publiceren van de Termenbank", "Weet u zeker dat u "+
										(sPublicationDate != null && sPublicationDate != '' ? "de publicatie nu wilt bijwerken" : "de termenbank nu wilt publiceren") + "?",
										function(){
											
											util.startTermBankPublication(sSiteName, function(jsonResponse){
												
												var sUrl = jsonResponse["url"] ?? "";
												
												fn.updateTableGivenANode(util.getBestRow("termbank_samenvatting"), {"site_name": sSiteName, "publicatie_status": "Gepubliceerd", "url": sUrl}, function(){
													fn.callRecord(util.getBestRow("termbank_samenvatting"), null, function(){
														termbank_summary.setButtonsGivenStatus();
													});
												});
												
											});
																					
											
										},
										function(){
											// don't want to publish after all
										}
									);
								}								
								
							});
							
							
							
							// activation button
							
							$("div[id^='dialog-message']").parent().find("#activation_button").bind("click", function(){
								
								if ($(this).text() == "Deactiveren") {
									
									fn.confirm("Deactiveren", "Weet u zeker dat u de publicatie wilt deactiveren?",
										function() {
											
											var nTermBankRecord = util.getBestRow("termbank_samenvatting");
											var sUrl = fn.getDataFromCellInRowNode(nTermBankRecord, "url");
											util.setTermBankStatus(sUrl, "inactive", function(){
												
												fn.updateTableGivenANode(util.getBestRow("termbank_samenvatting"), {"publicatie_status": "Publicatie gedeactiveerd"}, function(){
													fn.callRecord(util.getBestRow("termbank_samenvatting"), null, function(){
														termbank_summary.setButtonsGivenStatus();
													});
												});
													
											});
											
											
										},
										function() {
											// don't want to deactivate after all
										}
									);
								}
								
								if ($(this).text() == "Heractiveren") {
									
									fn.confirm("Heractiveren", "Weet u zeker dat u de publicatie wilt heractiveren?",
									
										function() {		
											
											var nTermBankRecord = util.getBestRow("termbank_samenvatting");
											var sUrl = fn.getDataFromCellInRowNode(nTermBankRecord, "url");
											util.setTermBankStatus(sUrl, "active", function(){
												
												fn.updateTableGivenANode(util.getBestRow("termbank_samenvatting"), {"publicatie_status": "Gepubliceerd"}, function(){
													fn.callRecord(util.getBestRow("termbank_samenvatting"), null, function(){
														termbank_summary.setButtonsGivenStatus();
													});
												});
												
											});									
											

										},
										function() {
											// don't want to reactivate after all
										}
									);
								}
								
							});
							
							// remove button
							
							$("div[id^='dialog-message']").parent().find("#remove_button").bind("click", function(){
								
								fn.confirm("Verwijderen", "Weet u zeker dat u de publicatie wilt verwijderen?",
									function() {
										
										var sSiteName = $("div[id^='dialog-message']").find("#sitename").val();
										util.removeTermBankPublication(sSiteName, function(){
											
											fn.updateTableGivenANode(util.getBestRow("termbank_samenvatting"), {"site_name": "", "publicatie_status": "Niet gepubliceerd"}, function(){
												fn.callRecord(util.getBestRow("termbank_samenvatting"), null, function(){
													termbank_summary.setButtonsGivenStatus();
												});
											});
											
										});
										
										

									},
									function() {
										// don't want to remove after all
									}
								);
								
							});
							
							// Cancel button should act as OK button
							
							$("div[id^='dialog-message']").parent().find("#close_button").bind("click", function(){
								
								// make sure tooltip gets out of sight
								$("#tiptip_holder").fadeOut();
								setTimeout(function(){ $("#tiptip_holder").fadeOut(); }, 500); // extra safe
								
								// close the dialog
								$("div[id^='dialog-message']").parent().find("button#dialog_accept_button").click();
							});	
										
						}, 500);
						
						
					}
					else {
						fn.message("Publiceren", "U heeft niet de juiste rechten om de termenbank te publiceren.");
					}	
				}
			},
			
			"Verwijder": {
				
				"class": "termwerk_button danger",
				"position": [20, termbank_summary.formbaseY - 1],
				"definition": [3, 1],
				"click": function(t){
					
					termbank_summary.removeTermbank(t);
				}
			},
			
			"TBX_importexport": {
				
				"nice_name": "Importeer&nbsp;TBX",
				"class": "termwerk_button",
				"position": [24, termbank_summary.formbaseY - 1],
				"definition": [3, 1],
				"click": function(t) {
					
					var buttonType = $("button#form_button_tbx_importexport").data("type");
					
					if (buttonType == "import") {
						
						var sUploadForm =
							"    <form id=\"fileUploadForm\">" +
							
							"        Kies een TBX-bestand:<BR>" +
							"        <input type=\"file\" id=\"fileChooser\" name=\"file\"  />" +
							
							"        <BR>"+
							
							"		 Naam:<BR>"+
							"        <input type=\"text\" id=\"uploadname\" name=\"uploadname\" />" +
							
							"        <BR><BR>" +
							"        <button type=\"button\" id=\"upload_start_button\" onclick=\"util.uploadTbxFile()\">Start upload</button>" +
							"    </form>";
						
					
						const queue = new FunctionQueue();
						
						queue.enQueue(function(){
						
							// show dialog	
							fn.message("TBX bestand uploaden", sUploadForm);
							
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
					
					else if (buttonType == "export") {
						
						fn.confirm("Exporteren", "De termenbank zal nu worden geëxporteerd naar een TBX bestand<BR><BR>"+
							"Weet u zeker dat u door wilt gaan?",
							function(){
								
								var sUrl = uTermServeInstanceUrl + "webservice/api/start_export_data?";
								var aParams = {
									"username": fn.getCurrentUser(),
									"project_id": fn.getCurrentSchema(),
									"outputformat ": "TBX",
									"dummy": getUniqueNumber()
								};							
								
								// build URL query
								
								var queryString = Object.entries(aParams)
								    .map(([key, value]) => `${encodeURIComponent(key.trim())}=${encodeURIComponent(value)}`)
								    .join('&');
	
							    
								// trick: add hidden button to the header, click it and remove it afterwards
								
								$(".table_header_button_div").append(
									$("<div></div>").addClass("table_header_button_empty")
									)
								
								$('.table_header_button_empty').bind('click', function () {
									
										var a = document.createElement('a');								
										a.href = sUrl + queryString;            
										a.target = '_blank';
										a.download = 'myfile.pdf';            
										document.body.append(a);          
										a.click();
										a.remove();
										
										$('.table_header_button_empty').unbind('click');
									}
								);
								
								$('.table_header_button_empty').click();
								
							},
							function(){
								fn.message("Exporteren", "Exporteren geannuleerd");
							}
						);
					}
					
				}
				
			}
			
		},
		
		"lists": {
			
			"talen": {
				
				"nice_name": "talen (min. 1 - max. 4)",
				
				//"position": [14+1, termbank_summary.formbaseY +2.5*termbank_summary.formTotalHeight],
				//"definition": [termbank_summary.formWidth, termbank_summary.formHeight*3],
				"position": [termbank_summary.formbaseX+17.5, termbank_summary.formbaseY +3*termbank_summary.formTotalHeight + termbank_summary.formHeight],
				"definition": [termbank_summary.formWidth+0.5, termbank_summary.formHeight*5],
				
				"table": {
					
					"name": "termbank_taalselectie",
					
					"columns_sorting": {"iso_code": "asc", "taal_id": "asc"},
					
					"columns": {
						
						"taal_id": {
							"visible": false
						},
						"iso_code": {		
							"nice_name": "ISO code",					
							"visible": true,
							"editable": false						
						},						
						"taal": {							
							"visible": true				
						}
					}
					
				},
				
				"buttons": {
					
					"add": {
						"title": "Voeg taal toe"						
					},
					
					"delete": true
				}
				
			}
			
		},
		
		
		"save_callback": function(t){


			termheader.checkIfTermbankExists(
				function(){
					$("button#form_button_tbx_importexport").find("span").html("Exporteren&nbsp;als&nbsp;TBX");
					$("button#form_button_tbx_importexport").data("type", "export");
				},
				function(){
					$("button#form_button_tbx_importexport").find("span").html("Importeer&nbsp;TBX");
					$("button#form_button_tbx_importexport").data("type", "import");
				}
			)
			
		}
		
		
	},
	
	
	
	
	"preinit_callback": function(t){
		
		// restore the previous fields selection, t.i. the selection defined during a previous session
		
		termfieldselector.restoreSelectionFromCookie();		
		
		// this table is called to create a new termbank, so insert a new row before opening the table
		
		var sActiveSchema = fn.getCurrentSchema();
		fn.callFunction(sActiveSchema+".get_number_of_termbanks", [], function(resp){
			
			var iNumberOfTermbanks = resp["get_number_of_termbanks"];
			
			// if a termbank is declared already, do nothing here
			if (iNumberOfTermbanks !=null && parseInt(iNumberOfTermbanks)>0){
				// nothing to do
			}
			
			// otherwise insert a new termbank row
			else {
				
				var sTableName = fn.getTableName(t);
		
				fn.insertIntoTable(sTableName, 
					{"naam_termbank": "", "beschrijving": ""}, 
					null, 
					function(){
						
						// insert the default language new row in the termbank_taalselectie table
						// (a trigger will take care of the rest of the language record, like id's)
						fn.insertIntoTable("termbank_taalselectie", {"taal": "Nederlands"});
					}, 
					function(err){
						console.log("Couldn't insert a new termbank row: " + err);
					}
				);
						
			}
		});
		
		
	},
	
	"resize_callback": function(t, ui){
		form.updateLayout(t, true, false);
	},
	
	"callback": function(t){
		
		// put the custom buttons in the middle of the header
		util.putFreeButtons(t);
		
		
		termheader.checkIfTermbankExists(
			function(){
				$("button#form_button_tbx_importexport").find("span").html("Exporteren&nbsp;als&nbsp;TBX");
				$("button#form_button_tbx_importexport").data("type", "export");
			},
			function(){
				$("button#form_button_tbx_importexport").find("span").html("Importeer&nbsp;TBX");
				$("button#form_button_tbx_importexport").data("type", "import");
			}
		);
		
		
		// if we have already 4 languages, disable the ADD button
		var iNumberOfLanguages = lists.getNumberOfVisibleRows("talen");
		var iconForAdding = $("div#termbank_samenvatting_form___talen_wrapper thead th").find("img.add");		
		if (iNumberOfLanguages >=4) {
			iconForAdding.hide();
		}
		else {
			iconForAdding.show();
		}
		
		
		// update the columns/cells visibility settings of the fields
		termfieldselector.updateFieldsVisibility();
				
		// get active row
		var sTableName = fn.getTableName(t); 
		var nActiveRow = fn.getFirstRowNodeFrom(t);
		var sActiveSchema = fn.getCurrentSchema();
		
		// function for getting stats
		if (nActiveRow != null){
			
			fn.callFunction(sActiveSchema+".get_number_of_languages", [], function(resp){
				if (fn.getViewType(t) == "form"){
					// do nothing in form 
				}
				else {
					fn.putDataIntoCellNode(nActiveRow, "talen", resp["get_number_of_languages"]);
				}
			});
			fn.callFunction(sActiveSchema+".get_number_of_concepts", [], function(resp){
				
				// we always subtract 1 because the default concept must not be included
				var iNumberOfConcepts = parseInt(resp["get_number_of_concepts"])-1;
				if (fn.getViewType(t) == "form"){
					form.setDataInCell(sTableName, "concepten", iNumberOfConcepts, false);
				}
				else {
					fn.putDataIntoCellNode(nActiveRow, "concepten", iNumberOfConcepts);	
				}
				
			});
			fn.callFunction(sActiveSchema+".get_number_of_terms", [], function(resp){
				if (fn.getViewType(t) == "form"){
					form.setDataInCell(sTableName, "termfiches", resp["get_number_of_terms"], false);
				}
				else {
					fn.putDataIntoCellNode(nActiveRow, "termfiches", resp["get_number_of_terms"]);
				}
			});
			
		}
		
		// remove unneeded elements like rows counting etc.
		$("#termbank_samenvatting_wrapper .top").find(".dataTables_info").text("");
		$("#termbank_samenvatting_wrapper .top").find(".dataTables_length").hide();
		//$("#termbank_samenvatting_wrapper").find(".paging_full_numbers").hide();
		
		// move the table name a bit
		//$("#termbank_samenvatting_tablename").css("position", "relative").css("top", "35px").css("left", "-20px");
		
		
		// in form view, show current field selection
		if (fn.getViewType(t) == "form") {
			termfieldselector.showSelectionInForm(t);
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
		
		// make sure that any change in the language selection list
		// is taken into account for language selection in termbank
		if (fn.getViewType(t) == "form") {
			
			setTimeout(function(){
				var aChosenIsoCodes = lists.getDataFromColumn("talen", "iso_code");
				aChosenIsoCodes = util.addNeutralValueToSelectOptions(aChosenIsoCodes);
				conf.changeTableConfigValue("termbank_termen", "taal", "choosefrom", aChosenIsoCodes);
				conf.changeTableConfigValue("termbank_talen", "taal", "choosefrom", aChosenIsoCodes);
			}, 500);
		
		}
	},
	"repeat_callback": true,
	
	
	"buttons": {
		
		"dummy_first": {
			"class": "table_header_button invisible smaller1"
			// this one is just meant to occupy the space normally used by a button
		},
		
		"toon overzicht termen": {
				"class": "table_header_button verylarge high",
				"click": function(t) {	
					
					// make sure that the selected languages will be used in the language selection lists
					var aChosenIsoCodes = lists.getDataFromColumn("talen", "iso_code");
					aChosenIsoCodes = util.addNeutralValueToSelectOptions(aChosenIsoCodes);
					conf.changeTableConfigValue("termbank_termen", "taal", "choosefrom", aChosenIsoCodes);
					conf.changeTableConfigValue("termbank_talen", "taal", "choosefrom", aChosenIsoCodes);
								
					fn.closeAllTables(function(){
						
						termbank_terms.setTermsMode(true);
						fn.callTable("termbank_termen");
					});
					
				}
			},
			
			"dummy_last": {
				"class": "table_header_button invisible smaller2"
				// this one is just meant to occupy the space normally used by a button
			}
			
		
		/*
		"TBX bestand uploaden": {
			
			"class": "table_header_button nopadding ligher",
			"click": function(t) {
				
				
				var sUploadForm =
					"    <form id=\"fileUploadForm\">" +
					
					"        Kies een bestand:<BR>" +
					"        <input type=\"file\" id=\"fileChooser\" name=\"file\" />" +
					
					"        <BR><BR>" +
					"        <button type=\"button\" id=\"upload_start_button\" onclick=\"util.uploadTbxFile()\">Start upload</button>" +
					"    </form>";
			
				const queue = new FunctionQueue();
				
				queue.enQueue(function(){
				
					// show dialog	
					fn.message("XTBX bestand uploaden", sUploadForm);
					
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
		}*/
		
	},
	
	
};

termbank_summary.config = {
	
	"termbank_id": {
		"visible": false
	},
	
	"naam_termbank": {
		"nice_name": "naam termenbank",
		"editable": true	
	},
	
	"beschrijving": {
		"editable": true
	},
	
	"laatste_wijziging": {
		"nice_name": "laatste wijziging",
		"render": function(sValue){
			return util.shortDateFormat(sValue);			
		}
	},
	
	"aangemaakt_op": {
		"nice_name": "aangemaakt op",
		"render": function(sValue) {
			return util.shortDateFormat(sValue);
		}
	},
	
	"talen": {
		
	},
	"concepten": {
		
	},
	"termfiches": {
		"nice_name": "termen"
	},
	
	
	
	"site_name": {
		
	},
	"url": {
		
	},
	"publicatie_status": {
		
	},
	"eerste_online_publicatie": {
		"render": function(sValue) {
			return util.shortDateFormat(sValue);
		}
	},
	"laatste_online_publicatie": {
		"render": function(sValue) {
			return util.shortDateFormat(sValue);
		}
	}
	
	
};




termbank_summary.removeTermbank = function(t){
	
	var sProjectId = util.getProjectId();
	
	fn.confirm("Verwijder termbank", "Weet u zeker dat u de termenbank wilt verwijderen?", 
		function(){	

            // remove the project from the database
			$.ajax({
						
				"type": "GET",
				"url": uTermServeInstanceUrl + "webservice/api/remove_termbank",
				"data": {
					"username": fn.getCurrentUser(),
					"project_id": sProjectId,
					"dummy": getUniqueNumber()
				},
				"dataType": "xml", // get response as xml
				"success": function(xml) {
					
					fn.message("Termenbank verwijderd", 
						"De termenbank is verwijderd.", function(){							
							fn.closeTable(t);
							setTimeout(function(){
								// re-open the termbank section!
								$("#my_termbank_div").click();
							}, 500);
						}
					);
					
				},
				"error": function(jqXHR, textStatus, errorThrown){
		
					alert("Het verwijderen van de termbank ging mis!");
				}
		
			});		
									
		}, 
		function(){
			fn.message("Verwijderen", "Verwijderen geannuleerd");		
		}
		
	);
};



// we need a function to set the buttons of the Public
termbank_summary.setButtonsGivenStatus = function(){
							
	// activate tipTip jquery plugin for nice cross-browser tooltips
	// (needs to be reactivated at each draw, so it seems)
	$(".tooltip").tipTip( gui.getTiptipConfig() );
	
	
	// update the publication status and dates
	
	var nTermBankRecord = util.getBestRow("termbank_samenvatting");
	var sPublicationStatus = fn.getDataFromCellInRowNode(nTermBankRecord, "publicatie_status"); // possible values: "Gepubliceerd", "Niet gepubliceerd", "Publicatie gedeactiveerd"
	$("div[id^='dialog-message']").parent().find("#publication_status_cell").text(sPublicationStatus);
	
	var sPublicationDate = fn.getDataFromCellInRowNode(nTermBankRecord, "eerste_online_publicatie");
	$("div[id^='dialog-message']").parent().find("#first_publication_date").text(util.shortDateFormat(sPublicationDate));
	
	var sUpdateDate = fn.getDataFromCellInRowNode(nTermBankRecord, "laatste_online_publicatie");
	$("div[id^='dialog-message']").parent().find("#last_publication_date").text(util.shortDateFormat(sUpdateDate));
	
	var sUrl = fn.getDataFromCellInRowNode(nTermBankRecord, "url");
	var sLink = document.URL.split("lexit2")[0] + "sites/" + sUrl;
	
	// if the termbank not yet published
	
	if (sPublicationStatus == 'Niet gepubliceerd'){
		$("div[id^='dialog-message']").parent().find("#publication_button").prop("disabled", false);
		$("div[id^='dialog-message']").parent().find("#activation_button").prop("disabled", true).text("Deactiveren");
		$("div[id^='dialog-message']").parent().find("#remove_button").prop("disabled", true);
		$("#first_publication_date,#last_publication_date").css("opacity", 0.5);
		
		// if not published, editting the name is allowed 
		$("div[id^='dialog-message']").find("#publication_name_cell").removeClass("disabled");
		
		// remove link
		$("div[id^='dialog-message']").find("#publication_link_cell").empty();
	}
	// if the termbank is published and active
	if (sPublicationStatus == 'Gepubliceerd'){
		$("div[id^='dialog-message']").parent().find("#publication_button").prop("disabled", false);
		$("div[id^='dialog-message']").parent().find("#activation_button").prop("disabled", false).text("Deactiveren");
		$("div[id^='dialog-message']").parent().find("#remove_button").prop("disabled", false);
		$("#first_publication_date,#last_publication_date").css("opacity", 1);
		
		// if already published, editting the name is NOT allowed 
		$("div[id^='dialog-message']").find("#publication_name_cell").addClass("disabled");
		$("div[id^='dialog-message']").parent().find("button#close_button").focus();
		
		// show link		
		$("div[id^='dialog-message']").find("#publication_link_cell").empty().append(
			$("<a></a>").attr("href", sLink).attr("target", "_blank").text(sLink)
		);
	}
	// if the termbank is published but deactivated (offline)
	if (sPublicationStatus == 'Publicatie gedeactiveerd'){
		$("div[id^='dialog-message']").parent().find("#publication_button").prop("disabled", false);
		$("div[id^='dialog-message']").parent().find("#activation_button").prop("disabled", false).text("Heractiveren");
		$("div[id^='dialog-message']").parent().find("#remove_button").prop("disabled", false);
		$("#first_publication_date,#last_publication_date").css("opacity", 0.5);
		
		// if already published, editting the name is NOT allowed 
		$("div[id^='dialog-message']").find("#publication_name_cell").addClass("disabled");
		$("div[id^='dialog-message']").parent().find("button#close_button").focus();
		
		// show link		
		$("div[id^='dialog-message']").find("#publication_link_cell").empty().append(
			$("<a></a>").attr("href", sLink).attr("target", "_blank").text(sLink)
		);
	}
};