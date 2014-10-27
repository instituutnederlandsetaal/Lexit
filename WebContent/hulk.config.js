


// *******************************************
//             HulK specific
// *******************************************


// this url will be called for the generation of the 'customer result file'
var sHulKUrlServer = "http://svowhu02.inl.loc/ws/kick-result/";

// this url will be called to export the data to the Gigant-spelling database
var sHulKExportUrl = "http://svowhu02.inl.loc/ws/kick-export/";

// this url will deliver us autocomplete information
var sAutoCompleteUrl = "http://svowhu02.inl.loc/ws/autocomplete-lemmata/";

fn.setProjectTitle("HulK", "#088A08");


// default document choice
// this has to have a 'silly' default value, to make sure that the
// default display shows no document at all
var sDefaultDocumentWaarde = "even_een_onzin_waarde";

// *******************************************
//          TABLE CONFIGURATION
// *******************************************

oShowOnlyTables = ["hulk_worktable"];



// Autocomplete configuration
// see: http://stackoverflow.com/questions/5077409/what-does-autocomplete-request-server-response-look-like
//      http://stackoverflow.com/questions/18677536/jeditable-and-jquery-ui-autocomplete
var sAutoCompleteSelector = ".correction";

$(document).on(
        "focus", 
        sAutoCompleteSelector, 
        function(event) {
        	
        	$(event.target).autocomplete({
            	
                source: function(request, response){
                	
                	$.ajax({
                        "type": "GET",
                        "crossDomain": true,
                        "url": sAutoCompleteUrl + request.term,
                        "dataType": "json",
                        "success": function (data){
                        	response($.map(data, function (item) {
                                return {
                                    label: item,
                                    value: item
                                };
                            }));
                        },
                        "error": function(jqXHR, textStatus, errorThrown){
        					fn.message("Fout", "Er is een fout opgetreden: "+
        						textStatus+" "+errorThrown);
        					}
                    });
                }
            });
            
        }
    );



// get user name for logging
var sUser = fn.getCurrentUser();


// global button setting 

// default start setting is we don't show all HulK oordelen
var bToonAlleHulkOordelen = false;




// table general settings
oTableSettingsList = {
		
		hulk_worktable:{
			
			"callback": function(t){
				buildDocumentSelector(t);
				showStatistics(t);
				putExportToGigantButton(t);
				putRightHulkOordeelButton(t);
				alterColorOfRowsGeneratedByUser(t);
			},
			"repeat_callback": true,
			
			"prereset_callback": function(t){
								
				conf.changeTableConfigValue(fn.getTableName(t), "document", "keepfilter", false);
				
				fn.addFilters(t, 
						{"hulk_oordeel": (bToonAlleHulkOordelen ? "" : "!^OK"),
						 "document": sDefaultDocumentWaarde
						 }
						);				
			},
			
			"column_order": ["pkid", "hulkable_word_id", "spelling_version_id", 
			                 "judgement_id", "document_id", "document", "wordform_id", "lemma", 
			                 "correction",  
			                 "wv", "en", "afke", "ok", 
			                 "gloss", "remarks",
			                 "hulk_oordeel", "uploader_part_of_speech", 
			                 "uploader_gloss", "name", "verified_date", "added_by_editor"],
			
			
			"button_0":{
				"name": "Genereer resultaatbestand",
				"bgcolor": "lightblue",
				"click": function(t){
					
					var sDocumentChoice = fn.getFilters(t)["document"];
					
					if (sDocumentChoice == sDefaultDocumentWaarde || sDocumentChoice == null)
						{
						fn.message("Let op", "Kies een document!");
						}
					else
						{
						fn.addFilters(t, {"hulk_oordeel": ""});
						
						fn.refreshTable(t, function(){
							
							var sDocumentId = fn.getDataFromCellNamed(t, fn.getAllRows(t)[0], "document_id");

							fn.showProcessingMsg(t);
							var sOriginalColor = fn.getCustomButtonCss(t, 0, "background-color");
							fn.setCustomButtonCss(t, 0, "background-color", "red");
							
							$.ajax({
								
								"type": "GET",
								"url": sHulKUrlServer + ($.endsWith(sHulKUrlServer, "/") ? "":"/") + sDocumentId,
								
								"crossDomain": true,
							 	"dataType": "json",
							 	"success": function(data) {
							 		
							 		// commented out, because the windows downlaod dialog causes strange behaviour  
							 		//fn.message("Resultaatbestand", data.message);
							 		
							 		fn.removeProcessingMsg(t);
							 		fn.setCustomButtonCss(t, 0, "background-color", sOriginalColor);
							 		fn.refreshTable(t, function(){window.open(data.link);});
							 		
							 		},
								"error": function(jqXHR, textStatus, errorThrown){
									fn.removeProcessingMsg(t);
									fn.setCustomButtonCss(t, 0, "background-color", sOriginalColor);
									fn.message("Resultaatbestand", "Er is een fout opgetreden: "+
										textStatus+" "+errorThrown);
									}
								
							});
						});
						}
					
					
				}
			},
			"button_1":{
				"name": "Toon alle HulK-oordelen",
				"bgcolor": "lightblue",
				"click": function(t){
					bToonAlleHulkOordelen = !bToonAlleHulkOordelen;
					
					var hulkOordeelToLookFor = bToonAlleHulkOordelen ? "" : "!^OK";
					
					fn.addFilters(t, {"hulk_oordeel": hulkOordeelToLookFor});
					fn.putDataIntoFilterBox(t, "hulk_oordeel", hulkOordeelToLookFor);
					
					putRightHulkOordeelButton(t);
					fn.refreshTable(t);
				}
			},
			"button_2":{
				"name": "Rij dupliceren",
				"bgcolor": "lightgrey",
				"textcolor": "black",
				"click": function(t){
					
					var aRow = fn.getSelectedRowsFrom(t);					
					
					if (typeof aRow == 'undefined' || aRow == null || fn.getNumberOfSelectedRows(t)>1)
						{
						fn.message("Let op", "U moet exact één rij selecteren, niet meer, niet minder!");
						}
					else
						{
						var nRow = aRow[0];
						var sHulkableWordId = fn.getDataFromCellNamed(t, nRow, "hulkable_word_id");
						var spellingVersionId = fn.getDataFromCellNamed(t, nRow, "spelling_version_id");
												
						fn.callFunction("duplicateRow", 
								[sHulkableWordId, spellingVersionId], 
								null, null, null, null, 
								function(){ 
									fn.refreshTable(t);
								});
						}
					 
				}
			},
			"button_3":{
				"name": "Rij verwijderen",
				"bgcolor": "lightgrey",
				"textcolor": "black",
				"click": function(t){
					
					fn.confirm("Let op", "Weet u het zeker? Dit kan niet ongedaan worden gemaakt.",
							function(answer){
						
						var aRows = fn.getSelectedRowsFrom(t);
						if (answer)
							{
							
							var bRemoveIsAllowed = true;
							aRows.each(function(){
								
								var nCurrentRow = this;
								
								var bAddedByUser = fn.getDataFromCellNamed(t, nCurrentRow, "added_by_editor");
								if (bAddedByUser == 'f' || bAddedByUser == false)
									bRemoveIsAllowed = false;
								
							});
							
							if ( !bRemoveIsAllowed)
								{
								fn.message("Let op", "U kunt alleen rijen verwijderen die u zelf aangemaakt heeft.");
								}
							else
								{
								aRows.each(function(){
									
									var nCurrentRow = this;
									
									var sJudgementId = fn.getDataFromCellNamed(t, nCurrentRow, "judgement_id");
																	
									fn.removeFromDatabaseGivenFieldValues(
											"judgements", 
											{
												"judgement_id": sJudgementId
											}, 
											false, 
											function(){									
												fn.refreshTable(t);											
											});

									});
								}
							
							}
						
					});
					
				}
			}
		}
};




// configuration at column level
oTableConfigurationList = {
		
		hulk_worktable: {
						
			pkid: {
				"sortable": false,				
				"visible": false
				},		
			
			document: {
				"sortable": false,			
				"filter": sDefaultDocumentWaarde,
				"choosefrom":[],
				"visible": false
			},
			document_id: {
				"visible": false
				},
			spelling_version_id: {
				"visible": false
				},
			hulk_oordeel: {
				"filter": "!^OK", // default start setting				
				"sortable": false
				},
			correction: {
				"sortable": false,
				"editable": true,
				"bgcolor": "#CECEF6",
				"textcolor": "blue",
				"editfunc": function(t, n, value){
					fn.updateDatabaseGivenANode(t, n, 
							["correction", "name", "verified_date"], 
							[value, sUser, fn.getCurrentTimestamp("YYYY-MM-DD HH:MI:SS")], false,
							function(){fn.refreshTable(t);});
					if (value != '')
						{
						fn.uncheckCheckboxes(t, n, ["wv", "en", "afke", "ok"]);
						var sHulkableWordId = fn.getDataFromSiblingNode(t, n, "hulkable_word_id");
						fn.updateDatabaseGivenFieldValues("judgements", 
								{"hulkable_word_id": sHulkableWordId}, 
								{"judgement": "NOK"});
						}
				}
			},
			uploader_gloss: {
				"sortable": false
			},
			gloss: {
				"editable": true,
				"sortable": false,
				"textstyle": "oblique",
				"editfunc": function(t, n, value){
					fn.updateDatabaseGivenANode(t, n, 
							["gloss", "name", "verified_date"], 
							[value, sUser, fn.getCurrentTimestamp("YYYY-MM-DD HH:MI:SS")]);					
				}
			},
			lemma: {
				"textstyle": "oblique",
				"textcolor": "brown",
				"sortable": false,
				"colsort": "asc",				// sort #1
				"click": function(t, n){
					var sLemma = fn.getDataFromCellNode(t, n);
					fn.putDataIntoCell(t, fn.getRowNode(n), "correction", sLemma);
				},
				"cell_tooltip": "Klik om te kopiëren naar 'correction'"
			},
			judgement_id: {
				"sortable": false,
				"colsort": "asc",				// sort #2
				"visible": false
				},
			hulkable_word_id: {
				"sortable": false,				
				"visible": false
			},
				
			uploader_part_of_speech: {
				"sortable": false,
				"editfunc": function(t, n, value){
					fn.updateDatabaseGivenANode(t, n, 
							["part_of_speech", "name", "verified_date"], 
							[value, sUser, fn.getCurrentTimestamp("YYYY-MM-DD HH:MI:SS")]);					
				}
			},
			remarks: {
				"sortable": false,
				"editable": true,
				"bgcolor": "#CECEF6",
				"editfunc": function(t, n, value){
					fn.updateDatabaseGivenANode(t, n, 
							["remarks", "name", "verified_date"], 
							[value, sUser, fn.getCurrentTimestamp("YYYY-MM-DD HH:MI:SS")], false,
							function(){fn.refreshTable(t);});					
				}
			},
			wordform_id: {
				"sortable": false,
				"visible": false				
			},
			wv: {
				"sortable": false,
				"editable": true,				
				"bgcolor": "#E0F8E0",
				"editfunc": function(t, n, value){
					uncheckOtherBoxes(t, n, ["en", "afke", "ok"]);
					fn.updateDatabaseGivenANode(t, n, 
							["wv", "name", "verified_date"], 
							[value, sUser, fn.getCurrentTimestamp("YYYY-MM-DD HH:MI:SS")]);
					}
				},
			en: {
				"sortable": false,
				"editable": true,
				"bgcolor": "#A9F5BC",
				"editfunc": function(t, n, value){
					uncheckOtherBoxes(t, n, ["wv", "afke", "ok"]);
					fn.updateDatabaseGivenANode(t, n, 
							["en", "name", "verified_date"], 
							[value, sUser, fn.getCurrentTimestamp("YYYY-MM-DD HH:MI:SS")]);
					
					}
				},
			afke: {
				"sortable": false,
				"editable": true,
				"bgcolor": "#E0F8E0",
				"editfunc": function(t, n, value){
					uncheckOtherBoxes(t, n, ["wv", "en", "ok"]);
					fn.updateDatabaseGivenANode(t, n, 
							["afke", "name", "verified_date"], 
							[value, sUser, fn.getCurrentTimestamp("YYYY-MM-DD HH:MI:SS")]);
					}
				},
			ok: {
				"sortable": false,
				"editable": true,
				"bgcolor": "#A9F5BC",
				"editfunc": function(t, n, value){
					uncheckOtherBoxes(t, n, ["wv", "en", "afke"]);
					fn.updateDatabaseGivenANode(t, n, 
							["ok", "name", "verified_date"], 
							[value, sUser, fn.getCurrentTimestamp("YYYY-MM-DD HH:MI:SS")]);
					}
				},
			name: {
				"visible": false
			},
			verified_date: {
				"visible": false
			},
			added_by_editor: {
				
				"visible": false
			}
			
		}

};

// *************************************************
//   ALTER COLOR OF ROWS GENERATED BY EDITOR
// *************************************************


function alterColorOfRowsGeneratedByUser(t){

	// get manually created row, and give those a different color
	
	var aRows = fn.getAllNodesWhere(t, {"added_by_editor": 't'});
		
	aRows.each(function(){
		
		var nNode = this;
		aCellsSelector = $(nNode).find("td");
		
		var aColumns = mt.getListOfVisibleColumnsOf(fn.getTableName(t));
		for (var i=0; i<aColumns.length; i++)
			{
			var eCell = fn.getCellElement(t, nNode, aColumns[i]);
			eCell.css("opacity", "0.5");
			}
		
	});	
};





// *******************************************
//               STATISTICS
// *******************************************

function showStatistics(t){
	
	// Get the documentId
	// But do that only if some document was chosen. If no choice was made, show a warning instead
	var sDocumentChoice = fn.getFilters(t)["document"];
	
	if (sDocumentChoice == sDefaultDocumentWaarde || sDocumentChoice == null)
		{
		showStatisticsInHeader("Kies een document!", true);
		}
	else
		{
		var documentId = fn.getDataFromCellNamed(t, fn.getAllRows(t)[0], "document_id");
		
		if (documentId != '')
			fn.callFunction("getStatistics", [documentId], null, null, null, null, 
					function(){
				
				showStatisticsInHeader(fn.getFunctionOutput()[0]);
							
				});
		}
};

function showStatisticsInHeader(sStats, sWarning){
	
	var sColor = "black";
	var sTextDecoration = "none";
	var sTop = "-10px";
	var sLeft = "410px";
	var sTextAlign = "center";
	var sBorder = "1px dotted black";

	
	// if the message is a warning, change style accordingly
	if (typeof sWarning != 'undefined' && sWarning == true)
		{
		sColor = "red";
		sTextDecoration = "blink";
		sTop = "69px";
		sBorder = "none";
		}
	
	$("#hulk_worktable_wrapper .top").find("#hulk_stats").remove();
	$("#hulk_worktable_wrapper .top").append(
			$("<div></div>")
			.attr("id", "hulk_stats")
			.css("width", "400px")	
			.css("text-align", sTextAlign)			
			.css("color", sColor)
			.append($("p").css("text-decoration", sTextDecoration)
					)
			
			);
	$("#hulk_worktable_wrapper .top #hulk_stats").append(
			$("<span></span>")
			.html(sStats)
			.css("font-size", "120%")
			);
	$("#hulk_worktable_wrapper .top #hulk_stats")
	.css("border", sBorder)
	.css("position", "relative")
	.css("top", sTop)
	.css("left", sLeft);	
}



// *******************************************
//                   EXPORT
// *******************************************

var bExportToGigantExists = false;

function putExportToGigantButton(t){
	
	if (bExportToGigantExists)
		return true;
	
	bExportToGigantExists = true;
	$("#hulk_worktable_dynamic").append(
			$("<div></div>")			
			.attr("id", "export_to_gigant_div")
			.append(
					$("<button></button>")
					.attr("type", "button")
					.html("Exporteer naar Gigant-lexicon")
					.bind("click", function(){
						
						$("#export_to_gigant_div button").prop("disabled", true);
						
						doExport(t);
						})
					)
			);
}

function doExport(t){
	
	// Get the documentId
	// But do that only if some document was chosen. If no choice was made, show a warning instead
	
	var sDocumentChoice = fn.getFilters(t)["document"];
	
	if (sDocumentChoice == sDefaultDocumentWaarde || sDocumentChoice == null)
		{
		fn.message("Let op", "Kies een document!");
		$("#export_to_gigant_div button").removeAttr("disabled");
		}
	else
		{
		fn.addFilters(t, {"hulk_oordeel": ""});
		
		fn.refreshTable(t, function(){
			
			var sDocumentId = fn.getDataFromCellNamed(t, fn.getAllRows(t)[0], "document_id");
			fn.showProcessingMsg(t);
			
			$.ajax({
				
				"type": "GET",
				"url": sHulKExportUrl + ($.endsWith(sHulKExportUrl, "/") ? "":"/") + sDocumentId,
				
				"crossDomain": true,
			 	"dataType": "json",
			 	"success": function(data) {			 		
			 		fn.removeProcessingMsg(t);
			 		$("#export_to_gigant_div button").removeAttr("disabled");
			 		setTimeout(function(){fn.message("Gelukt!", data.message);}, 500);
			 		},
				"error": function(jqXHR, textStatus, errorThrown){
					fn.removeProcessingMsg(t);
					$("#export_to_gigant_div button").removeAttr("disabled");
					setTimeout(function(){fn.message("Fout", "Er is een fout opgetreden: "+
							textStatus+" "+errorThrown);}, 500);
					}
				
			});
		});
		
		
		}
}



// *******************************************
//        DOCUMENT SELECTOR
// *******************************************

function buildDocumentSelector(t){
	
	// get the current document filter setting (which doc was already chosen?)
	var sTableName = fn.getTableName(t);
	var sSelectedDocument = fn.getFilters(t)["document"];
	
	
	// (re)build the document selector
	$("#document_selector").remove();
	$("#hulk_worktable_length")
	.append(
			$("<div></div>").attr("id", "document_selector")
			.css("position", "relative")			
			.css("top", "-105px")
			);
	
	var sTableName = fn.getTableName(t);
	var oTableConfig = conf.getTableConfig(sTableName);
	var oColumnConfig = conf.getColumnConfig(oTableConfig, "document");
	
	var aListOfOptions = conf.getSelectionBox(oColumnConfig);

	var inputTag =  $("<select/>");
	
	inputTag.append(
			$("<option></option>")
				.attr("value", sDefaultDocumentWaarde )
				.text( "Document kiezen" )
		);
	for (var j=1; j<aListOfOptions.length; j++)
		{
		inputTag.append(
				$("<option></option>")							
					.attr("value", aListOfOptions[j] )
					.text( aListOfOptions[j] )
			);
		}
	
	// when a choice is made, load the chosen table
	inputTag.change(function(){
		sSelectedDocument = $(this).val();	
		fn.addFilters(sTableName, {"document": "exact:"+sSelectedDocument});
		conf.changeTableConfigValue(sTableName, "document", "filter", sSelectedDocument);
		conf.changeTableConfigValue(sTableName, "document", "keepfilter", true);
		fn.refreshTable(t);
	});
	
	$("#document_selector").append(inputTag);
	
	$("#document_selector select").val(sSelectedDocument);
	
}


// *******************************************
//     HulK oordeel button
// *******************************************

// the button shows a different text,
// depending on the current value of bToonAlleHulkOordelen
function putRightHulkOordeelButton(t){
	fn.setCustomButtonName(t, 1, (bToonAlleHulkOordelen ? "Verberg HulK-geaccepteerd" : "Toon alle HulK-oordelen") );
}



// *******************************************
//             CHECKBOXES HANDLER
// *******************************************

var bPreventEditFuncLoop = false;

function uncheckOtherBoxes(oTable, nNode, aBoxesToUncheck){
	
	// when unchecking the checkboxes automatically (simulating a manual click),
	// we don't want the normal editfunc to be triggerd
	// as this would cause an infinite loop
	//(click -> editfunc -> uncheckboxes -> click -> editfunc -> uncheckboxes -> ... )
	if (bPreventEditFuncLoop)
		return true;
	
	bPreventEditFuncLoop = true;	
	
	fn.uncheckCheckboxes(oTable, nNode, aBoxesToUncheck, 
			function(){
		bPreventEditFuncLoop = false;
		});
	
}