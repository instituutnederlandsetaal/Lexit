


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


// for logging

var sUser = fn.getCurrentUser();


// global button setting 

var bToonHulkGeaccepteerd = true;
//var bDocumentVisible = true;



// table general settings
oTableSettingsList = {
		
		hulk_worktable:{
			
			"callback": function(t){
				buildDocumentSelector(t);
				showStatistics(t);
				putExportToGigantButton(t);
				//fn.setCustomButtonName(t, 4, (bDocumentVisible ? "Verberg":"Toon")+" Documentnaam-kolom");
			},
			"repeat_callback": true,
			
			"button_0":{
				"name": "Genereer resultaatbestand",
				"bgcolor": "lightblue",
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
				"bgcolor": "lightblue",
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
				"bgcolor": "lightgrey",
				"textcolor": "black",
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
				"bgcolor": "lightgrey",
				"textcolor": "black",
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
//			,
//			"button_4": {
//				"name": "Verberg documentnaam",
//				"bgcolor": "lightblue",
//				"click": function(t){
//					
//					bDocumentVisible = !bDocumentVisible;
//					var sDocumentName = fn.getValueOfFilterBox(t, "document");
//					
//					fn.setCustomButtonName(t, 4, (bDocumentVisible ? "Verberg":"Toon")+" Documentnaam-kolom");
//				
//					$("#hulk_worktable_wrapper").hide();
//					tb.destroyTable("hulk_worktable", null, true);
//					
//					conf.changeTableConfigValue("hulk_worktable", "document", "visible", bDocumentVisible);
//					
//					fn.callDatabase("hulk_worktable", {"document": sDocumentName});
//					
//				}
//			}
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
					if (value == 'NOK')
						{
						fn.uncheckCheckboxes(t, n, ["wv", "en", "afke", "ok"]);
						var sHulkableWordId = fn.getRowId(n);
						fn.updateDatabaseGivenFieldValues("judgements", 
								{"hulkable_word_id": sHulkableWordId}, 
								{"judgement": "NOK"});
						}
				}
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
			pkid: {
				"sortable": false,
				"colsort": "asc",				// sort #2
				"visible": false
				},			
			part_of_speech:{
				"editable": true,
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
			}
			
		}

};





// *******************************************
//               STATISTICS
// *******************************************

function showStatistics(t){
	
	// Get the documentId
	// But do that only if some document was chosen. If no choice was made, show a warning instead
	var sTableName = fn.getTableName(t);
	var sDocumentChoice = mt.getDataTableObjectOf(sTableName).fnFilterGet()["document"];
	
	if (sDocumentChoice == '')
		{
		showStatisticsInHeader("Kies een document!", true);
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

function showStatisticsInHeader(sStats, sWarning){
	
	var sColor = "black";
	var sTextDecoration = "none";
	
	// if the message is a warning, change style accordingly
	if (typeof sWarning != 'undefined' && sWarning == true)
		{
		sColor = "red";
		sTextDecoration = "blink";
		}
	
	$("#hulk_worktable_wrapper .top").find("#hulk_stats").remove();
	$("#hulk_worktable_wrapper .top").append(
			$("<div></div>")
			.attr("id", "hulk_stats")
			.css("border", "1px black dotted")
			.css("width", "450px")
			.css("text-align", "center")
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
	$("#hulk_worktable_dynamic").append(
			$("<div></div>")			
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
	var sTableName = fn.getTableName(t);
	var sDocumentChoice = mt.getDataTableObjectOf(sTableName).fnFilterGet()["document"];
	
	if (sDocumentChoice == '')
		{
		alert("Kies een document!");
		}
	else
		{
		var documentId = fn.getDataFromCellNamed(t, fn.getAllRows(t)[0], "document_id");
		
		// Ajax call with:   sHulKExportUrl
		// to be built 
		}
}



// *******************************************
//        DOCUMENT SELECTOR
// *******************************************

function buildDocumentSelector(t){
	
	// get the current document filter setting (which doc was already chosen?)
	var sTableName = fn.getTableName(t);
	var sSelectedDocument = mt.getDataTableObjectOf(sTableName).fnFilterGet()["document"];
	
	
	// (re)build the document selector
	$("#document_selector").remove();
	$("#hulk_worktable_length")
	.append(
			$("<div></div>").attr("id", "document_selector")
			.css("position", "relative")			
			.css("top", "5px")
			);
	
	var sTableName = fn.getTableName(t);
	var oTableConfig = conf.getTableConfig(sTableName);
	var oColumnConfig = conf.getColumnConfig(oTableConfig, "document");
	
	var aListOfOptions = conf.getSelectionBox(oColumnConfig);

	var inputTag =  $("<select/>");
	
	inputTag.append(
			$("<option></option>")
				.attr("value", aListOfOptions[0] )
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
		mt.getDataTableObjectOf(sTableName).fnFilterAdd({"document": sSelectedDocument});
		fn.refreshTable(t);
	});
	
	$("#document_selector").append(inputTag);
	
	$("#document_selector select").val(sSelectedDocument);
	
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