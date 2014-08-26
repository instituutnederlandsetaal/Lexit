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
					
					/*
					$.getJSON( "http://svowhu02.inl.loc/?callback=?", function( data ){
						
						alert("Het bestand is geladen");
				 		fn.refreshTable(t);
					});
					*/

					
					$.ajax({
						
						"type": "GET",
						"url": "http://svowhu02.inl.loc/ws/kick-result/1",
						
						"crossDomain": true,
					 	"dataType": "json",
					 	"success": function(data) {
					 		alert(data.message);
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
			correction: {
				"editable": true,
				"bgcolor": "#CECEF6",
				"textcolor": "blue"
					},
			gloss: {
				"textstyle": "oblique"				
			},
			lemma: {
				"textstyle": "oblique",
				"textcolor": "brown"
			},
			part_of_speech:{
				
			},
			remarks: {
				"editable": true,
				"bgcolor": "#CECEF6"
				},
			wv: {
				"editable": true,
				"bgcolor": "#E0F8E0",
				"editcallback": function(t, n, value){
					uncheckOtherBoxes(t, n, ["en", "afke", "ok"]);
					//fn.refreshTable(t);
					}
				},
			en: {"editable": true,
				"bgcolor": "#A9F5BC",
				"editcallback": function(t, n, value){
					uncheckOtherBoxes(t, n, ["wv", "afke", "ok"]);
					//fn.refreshTable(t);
					}
				},
			afke: {"editable": true,
				"bgcolor": "#E0F8E0",
				"editcallback": function(t, n, value){
					uncheckOtherBoxes(t, n, ["wv", "en", "ok"]);
					//fn.refreshTable(t);
					}
				},
			ok: {"editable": true,
				"bgcolor": "#A9F5BC",
				"editcallback": function(t, n, value){
					uncheckOtherBoxes(t, n, ["wv", "en", "afke"]);
					//fn.refreshTable(t);
					}
				}
		}

};

var bPreventCallback = false;

function uncheckOtherBoxes(oTable, nNode, aBoxesToUncheck){
	
	if (bPreventCallback)
		return true;
	
	bPreventCallback = true;	
	fn.uncheckCheckboxes(oTable, nNode, aBoxesToUncheck);
	bPreventCallback = false;
}