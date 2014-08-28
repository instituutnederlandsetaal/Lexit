

// HulK specific

var sHulKUrlServer = "http://svowhu02.inl.loc/ws/kick-result/";


// list of tables that must be hidden or visible (don't use both, it's a matter of what's the most convenient)
oHiddenTablesList = [];
oShowOnlyTables = ["hulk_worktable"];


var bToonHulkGeaccepteerd = true;

// table general settings
oTableSettingsList = {
		
		hulk_worktable:{
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
					t.fnFilterSet({"hulk_oordeel": hulkOordeelToLookFor});
					fn.setCustomButtonName(t, 1, (bToonHulkGeaccepteerd ? "Toon" : "Verberg") + " HulK-geaccepteerd");
					fn.refreshTable(t);
				}
			},
			"button_2":{
				"name": "Rij dupliceren",
				"click": function(t){
					
					var nRow = fn.getActiveRowNode(t);
					
					
					if (typeof nRow == 'undefined' || nRow == null || fn.getNumberOfSelectedRows(t)>1)
						{
						alert("U moet exact één rij selecteren, niet meer, niet minder!");
						}
					else
						{
						var wordformId= fn.getDataFromCellNamed(t, nRow, "wordform_id");
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
				"name": "Update stats",
				"click": function(t){
					showStatistics(t);
				}
			}
		}
};

// callback function for jsonp call
// http://stackoverflow.com/questions/2067472/what-is-jsonp-all-about
mycallback = function(data){
	
};


// configuration at column level
oTableConfigurationList = {
		
		hulk_worktable: {
			
			pkid: {"visible": false},
			judgement_id: {"visible": false},
			document: {"choosefrom":[]},
			document_id: {
				"visible": false
				},
			spelling_version_id: {"visible": false},
			correction: {
				"editable": true,
				"bgcolor": "#CECEF6",
				"textcolor": "blue",
				"editcallback": function(t, n, value){
					logUser(t, n);
					
				}
			},
			gloss: {
				"textstyle": "oblique"				
			},
			lemma: {
				"textstyle": "oblique",
				"textcolor": "brown",
				"colsort": "asc"
			},
			part_of_speech:{
				
			},
			remarks: {
				"editable": true,
				"bgcolor": "#CECEF6",
				"editcallback": function(t, n, value){
					logUser(t, n);					
				}
			},
			wordform_id: {
				"visible": false				
			},
			wv: {
				"editable": true,
				"bgcolor": "#E0F8E0",
				"editcallback": function(t, n, value){
					uncheckOtherBoxes(t, n, ["en", "afke", "ok"]);
					logUser(t, n);
					}
				},
			en: {"editable": true,
				"bgcolor": "#A9F5BC",
				"editcallback": function(t, n, value){
					uncheckOtherBoxes(t, n, ["wv", "afke", "ok"]);
					logUser(t, n);
					}
				},
			afke: {"editable": true,
				"bgcolor": "#E0F8E0",
				"editcallback": function(t, n, value){
					uncheckOtherBoxes(t, n, ["wv", "en", "ok"]);
					logUser(t, n);
					}
				},
			ok: {"editable": true,
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

function logUser(t, n){
	
	var sUser = "'"+fn.getCurrentUser()+"'";
	var sDate = "'"+fn.getCurrentTimestamp("YYYY-MM-DD HH:MI:SS")+"'";
	var sId = fn.getRowId(n);
	
	fn.callFunction("logUser", [sUser, sDate, sId]);

};

function showStatistics(t){
	
	var documentId = fn.getDataFromCellNamed(t, fn.getAllRows(t)[0], "document_id");
	
	fn.callFunction("getStatistics", [documentId], null, null, null, null, 
			function(){
		var sStats = fn.getFunctionOutput()[0];
		
		$("#hulk_worktable_wrapper #hulk_worktable_info").find("span").remove();
		$("#hulk_worktable_wrapper #hulk_worktable_info").append(
				$("<span></span>")
				.html("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<B>"+sStats+"</B>")				
				);
	});
	
};



var bPreventCallback = false;

function uncheckOtherBoxes(oTable, nNode, aBoxesToUncheck){
	
	if (bPreventCallback)
		return true;
	
	bPreventCallback = true;	
	fn.uncheckCheckboxes(oTable, nNode, aBoxesToUncheck);
	bPreventCallback = false;
}