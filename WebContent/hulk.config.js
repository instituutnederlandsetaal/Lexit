


// *******************************************
//             HulK specific
// *******************************************

// this url will be called for the generation of the 'customer result file'
var sHulKUrlServer = "http://svowhu02.inl.loc/ws/kick-result/";

// this url will be called to export the data to the Gigant-spelling database
var sHulKExportUrl = "http://svowhu02.inl.loc/ws/kick-export/";



// *******************************************
//          TABLE CONFIGURATION
// *******************************************

oShowOnlyTables = ["hulk_worktable"];


var bToonHulkGeaccepteerd = true;

// table general settings
oTableSettingsList = {
		
		hulk_worktable:{
			
			"callback": function(t){
				showStatistics(t);
				putExportToGigantButton(t);
			},
			"repeat_callback": true,
			
			"button_0":{
				"name": "Genereer resultaatbestand",
				"click": function(t){
					
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
					 		alert(data.message);
					 		fn.removeProcessingMsg(t);
					 		fn.setCustomButtonCss(t, 0, "background-color", sOriginalColor);
					 		fn.refreshTable(t);
					 		},
						"error": function(jqXHR, textStatus, errorThrown){
							alert("Er is een fout opgetreden: "+
								textStatus+" "+errorThrown);
							}
						
					});
					
				}
			},
			"button_1":{
				"name": "Toon HulK-geaccepteerd",
				"click": function(t){
					bToonHulkGeaccepteerd = !bToonHulkGeaccepteerd;
					var hulkOordeelToLookFor = bToonHulkGeaccepteerd ? "" : "!^OK";
					fn.putDataIntoFilterBox(t, "hulk_oordeel", hulkOordeelToLookFor);
					//t.fnFilterSet({"hulk_oordeel": hulkOordeelToLookFor});
					t.fnFilterAdd({"hulk_oordeel": hulkOordeelToLookFor});
					fn.setCustomButtonName(t, 1, (bToonHulkGeaccepteerd ? "Toon" : "Verberg") + " HulK-geaccepteerd");
					fn.refreshTable(t);
				}
			},
			"button_2":{
				"name": "Rij dupliceren",
				"click": function(t){
					
					var aRow = fn.getSelectedRowsFrom(t);					
					
					if (typeof aRow == 'undefined' || aRow == null || fn.getNumberOfSelectedRows(t)>1)
						{
						alert("U moet exact één rij selecteren, niet meer, niet minder!");
						}
					else
						{
						var nRow = aRow[0];
						var wordformId = fn.getDataFromCellNamed(t, nRow, "wordform_id");
						var spellingVersionId = fn.getDataFromCellNamed(t, nRow, "spelling_version_id");
						var documentId = fn.getDataFromCellNamed(t, nRow, "document_id");
						
						fn.callFunction("duplicateRow", 
								[wordformId, spellingVersionId, documentId], 
								null, null, null, null, 
								function(){ fn.refreshTable(t);});
						}
					 
				}
			},
			"button_3":{
				"name": "Rij verwijderen",
				"click": function(t){
					
					var answer = confirm("Weet u het zeker? Dit kan niet ongedaan worden gemaakt.");
					var aRows = fn.getSelectedRowsFrom(t);
					if (answer)
						{
						aRows.each(function(){
							
							var nCurrentRow = this;
							
							var sHulkableWordId = fn.getRowId(nCurrentRow);
							var sDocumentId = fn.getDataFromCellNamed(t, nCurrentRow, "document_id");
							
							fn.removeFromDatabaseGivenFieldValues(
									"judgements", 
									{
										"hulkable_word_id": sHulkableWordId
									}, 
									false, 
									function(){
								
										fn.removeFromDatabaseGivenFieldValues(
												"hulkable_words", 
												{
													"hulkable_word_id": sHulkableWordId,
													"document_id": sDocumentId
												},
												false, 
												function(){
													if (fn.isLastNodeOf(nCurrentRow, aRows))
														fn.refreshTable(t);
													});
									});

							});
						}					
				}
			}
		}
};




// configuration at column level
oTableConfigurationList = {
		
		hulk_worktable: {
						
			judgement_id: {
				"sortable": false,
				"visible": false
				},
			document: {
				"sortable": false,
				"choosefrom":[]
			},
			document_id: {
				"visible": false
				},
			spelling_version_id: {
				"visible": false
				},
			hulk_oordeel: {
					"sortable": false
				},
			correction: {
				"sortable": false,
				"editable": true,
				"bgcolor": "#CECEF6",
				"textcolor": "blue",
				"editcallback": function(t, n, value){
					logUser(t, n);
					
				}
			},
			gloss: {
				"sortable": false,
				"textstyle": "oblique"				
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
			pkid: {
				"sortable": false,
				"colsort": "asc",				// sort #2
				"visible": false
				},			
			part_of_speech:{
				"sortable": false
			},
			remarks: {
				"sortable": false,
				"editable": true,
				"bgcolor": "#CECEF6",
				"editcallback": function(t, n, value){
					logUser(t, n);					
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
				"editcallback": function(t, n, value){
					uncheckOtherBoxes(t, n, ["en", "afke", "ok"]);
					logUser(t, n);
					}
				},
			en: {
				"sortable": false,
				"editable": true,
				"bgcolor": "#A9F5BC",
				"editcallback": function(t, n, value){
					uncheckOtherBoxes(t, n, ["wv", "afke", "ok"]);
					logUser(t, n);
					}
				},
			afke: {
				"sortable": false,
				"editable": true,
				"bgcolor": "#E0F8E0",
				"editcallback": function(t, n, value){
					uncheckOtherBoxes(t, n, ["wv", "en", "ok"]);
					logUser(t, n);
					}
				},
			ok: {
				"sortable": false,
				"editable": true,
				"bgcolor": "#A9F5BC",
				"editcallback": function(t, n, value){
					uncheckOtherBoxes(t, n, ["wv", "en", "afke"]);
					logUser(t, n);
					}
				},
			name: {				
				"visible": false
			},
			verified_date: {
				"visible": false
			}
			
		}

};



// *******************************************
//              LOGGING
// *******************************************

function logUser(t, n){
	
	var sUser = "'"+fn.getCurrentUser()+"'";
	var sDate = "'"+fn.getCurrentTimestamp("YYYY-MM-DD HH:MI:SS")+"'";
	var sId = fn.getRowId(n);
	
	fn.callFunction("logUser", [sUser, sDate, sId]);

};


// *******************************************
//               STATISTICS
// *******************************************

function showStatistics(t){
	
	// Get the documentId
	// But do that only if some document was chosen. If no choice was made, show a warning instead
	var sDocumentChoice = fn.getValueOfFilterBox(t, "document");
	
	if (sDocumentChoice == '')
		{
		showStatisticsInHeader("Kies een document in de linker kolom!");
		}
	else
		{
		var documentId = fn.getDataFromCellNamed(t, fn.getAllRows(t)[0], "document_id");
		
		fn.callFunction("getStatistics", [documentId], null, null, null, null, 
				function(){
			
			showStatisticsInHeader(fn.getFunctionOutput()[0]);
						
			});
		}
};

function showStatisticsInHeader(sStats){
	
	$("#hulk_worktable_wrapper .top").find("#hulk_stats").remove();
	$("#hulk_worktable_wrapper .top").append(
			$("<div></div>")
			.attr("id", "hulk_stats")
			.css("border", "1px black dotted")
			.css("width", "450px")
			.css("text-align", "center")
			);
	$("#hulk_worktable_wrapper .top #hulk_stats").append(
			$("<span></span>")
			.html(sStats)
			.css("font-size", "120%")
			);
	$("#hulk_worktable_wrapper .top #hulk_stats")
	.css("position", "relative")
	.css("top", "60px")
	.css("left", "250px");	
}



// *******************************************
//                   EXPORT
// *******************************************

var bExportToGigantExists = false;

function putExportToGigantButton(t){
	
	if (bExportToGigantExists)
		return true;
	
	bExportToGigantExists = true;
	$("#dynamic").append(
			$("<div></div>")
			.css("position", "relative")
			.css("top", $("#hulk_worktable_dynamic").css("height"))			
			.attr("id", "export_to_gigant_div")
			.append(
					$("<button></button>")
					.attr("type", "button")
					.html("Exporteer naar Gigant-lexicon")
					.bind("click", function(){
						
						doExport(t);
						})
					)
			);
}

function doExport(t){
	
	// Get the documentId
	// But do that only if some document was chosen. If no choice was made, show a warning instead
	var sDocumentChoice = fn.getValueOfFilterBox(t, "document");
	
	if (sDocumentChoice == '')
		{
		alert("Kies een document in de linker kolom!");
		}
	else
		{
		var documentId = fn.getDataFromCellNamed(t, fn.getAllRows(t)[0], "document_id");
		
		alert("Exporteer document_id = "+documentId);
		
		// Ajax call with:   sHulKExportUrl
		// to be built @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
		}
}


// *******************************************
//             CHECKBOXES HANDLER
// *******************************************

var bPreventCallback = false;

function uncheckOtherBoxes(oTable, nNode, aBoxesToUncheck){
	
	if (bPreventCallback)
		return true;
	
	bPreventCallback = true;	
	fn.uncheckCheckboxes(oTable, nNode, aBoxesToUncheck);
	bPreventCallback = false;
}