// list of tables that must be hidden or visible (don't use both, it's a matter of what's the must convenient)
oShowOnlyTables = ["GB05_2013"];

// table general settings
oTableSettingsList = {
		
GB05_2013 : {
			
			"nice_name": "GB05_2013 - Productietabel",
			
			"header_height": "80px",
			
			"column_order": ["id", "superid", 
			                 "lem05", "volgnr05", 
			                 "th-lem05", 
			                 "lem05-afbr", "th-lem05-afbr", 
			                 "zook05", 
			                 "betek05",
			                 "wrdcat05", 
			                 "znwlid05", 
			                 "flex105", 
			                 "th-flex105", "flex105-afbr",
			                 "th-flex105-afbr", "flex205",  
			                 "th-flex205", "flex205-afbr", 
			                 "th-flex205-afbr", 
			                 "flex305", 
			                 "th-flex305", "flex305-afbr",  
			                 "th-flex305-afbr", "flex405",
			                 "th-flex405", "flex405-afbr", 
			                 "th-flex405-afbr", "flex505",	 
			                 "th-flex505", "flex505-afbr",  
			                 "th-flex505-afbr", 			                 
			                 "wijzignaam15",
			                 "isGB05_trefw", "lem15", "voluit", "taalvariant",
			                 "type15-lem15", 
			                 "th-lem15", "lem15-afbr", "th-lem15-afbr", "zook15", "betek15", 
			                 "wrdcat15", "znwlid15", "flex115", "th-flex115", "flex115-afbr", 
			                 "th-flex115-afbr", "flex215", "th-flex215", "flex215-afbr", 
			                 "th-flex215-afbr", "flex315", "th-flex315", "flex315-afbr", 
			                 "th-flex315-afbr", "flex415", "th-flex415", "flex415-afbr", 
			                 "th-flex415-afbr", "flex515", "th-flex515", "flex515-afbr", 
			                 "th-flex515-afbr", "nuance_intern", "nuance_extern", "taaladvies", 
			                 "bespreken", "pas_in_2015", "gedrukt",
			                 "svink", "sn_opmerking", "wijzigdatum15"],
			
			"button_0": {
				"name": "Maak nieuw lemma",
				"bgcolor": "green",
				"tooltip": "Maak een nieuw lemma aan",
				"click": function(confTable){
					
					fn.prompt("Nieuw lemma", ["Lemma"], null,
							function(){
						
						var sLemma = fn.getPromptUserInput("Lemma");
						if (sLemma != "")
							{
							fn.insertIntoDatabase("GB05_2013", 
									{"lem15": sLemma}, 
									null, false, 
									function(){
										fn.callDatabase(confTable, {"lem15": "^"+sLemma});
									});
							}
					});
				} 
			},
			
			"button_1": {
				"name": "Verwijder Lemma",
				"tooltip": "Verwijder het geselecteerde lemma (klik een rij aan)",
				"click": function(confTable){
					
					var answer = confirm("Weet u het zeker? Deze operatie kan niet ongedaan worden gemaakt.");
					if (answer)
						{
						if ( fn.getNumberOfSelectedRows(confTable)>0)
							{
							var aSelectedRows = fn.getSelectedRowsFrom(confTable);
							aSelectedRows.each(function(){
								
								var bIsLastRow = fn.isLastNodeOf(this, aSelectedRows);
								var sId = fn.getDataFromCellInRowNode(confTable, this, "id");
								fn.removeFromDatabaseGivenFieldValues("GB05_2013", 
										{"id": sId}, bIsLastRow);
								});
							}
						else
							{
							alert("Er is geen lemma geselecteerd.");
							}				
						
						}				
					
				}
			},
			
			
			
			"callback": function(t){
				
				// Give new lemmata cells a color, to make them visible
				// Rule: new lemmata are stored in lem15, and old lemmata stored in lem05 are logically 
				// empty, so we just check lem05 emptiness and assign a color to lem15 accordingly.
				
				// Normally, it would be enough to set a new background color to the cells in question,
				// but as soon as the user will move the mouse over the column the cells are in,
				// the background color will change for highlighting, and won't change back to its
				// original setting when the mouse is gone (but to the default cell background color).
				// So we use a trick: we dynamically create a new class containing a background color
				// set to '!important' and add it to the cells that needs a new color. That way
				// the 'important' background color will overrule the other background colors being set, 
				// and the class will of course never be removed, so it keeps in place.
				
				// if special color class does not exist yet, create it
				if ( !$(".new_lemma_class")[0])
					{
					$("html > head").append("<style type='text/css'>.new_lemma_class {background-color: yellow !important}</style");
					}
				
				fn.getAllRows(t).each(function(){
					
					var lem05 = fn.getDataFromCellInRowNode(t, this, "lem05");
					if (lem05 == '')
						{						
						fn.getCellElement(t, this, "lem15").addClass("new_lemma_class");
						}
				});
			},
			"repeat_callback": true
		}
		
};

function editAndLog(oTable, nNode, sValue){
	
	fn.updateDatabaseGivenANode(oTable, nNode, 
			["wijzignaam15", "wijzigdatum15"], 
			[fn.getCurrentUser(), fn.getCurrentTimestamp("YYYY-MM-DD HH:MI:SS")], false);
}


// configuration at column level
oTableConfigurationList = {
		
		
		GB05_2013 : {
			
			"lem15": {
				"colsort": "asc",
				"filter": ".",
				"editable": true, 
				"editcallback": function(oTable, nNode, sValue){
					editAndLog(oTable, nNode, sValue);
					}
			}, "voluit" : {
				"editable": true, 
				"editcallback": function(oTable, nNode, sValue){
					editAndLog(oTable, nNode, sValue);
					}
			},"taalvariant": {			
				"editable": true, 
				"editcallback": function(oTable, nNode, sValue){
					editAndLog(oTable, nNode, sValue);
					}
			}, "type15-lem15": {
				"editable": true, 
				"editcallback": function(oTable, nNode, sValue){
					editAndLog(oTable, nNode, sValue);
					}
			}, "th-lem15": {
				"editable": true, 
				"editcallback": function(oTable, nNode, sValue){
					editAndLog(oTable, nNode, sValue);
					}
			}, 
            "lem15-afbr": {
				"editable": true, 
				"editcallback": function(oTable, nNode, sValue){
					editAndLog(oTable, nNode, sValue);
					}
			}, "th-lem15-afbr": {
				"editable": true, 
				"editcallback": function(oTable, nNode, sValue){
					editAndLog(oTable, nNode, sValue);
					}
			}, "zook15": {
				"editable": true, 
				"editcallback": function(oTable, nNode, sValue){
					editAndLog(oTable, nNode, sValue);
					}
			}, "betek15": {
				"editable": true, 
				"editcallback": function(oTable, nNode, sValue){
					editAndLog(oTable, nNode, sValue);
					}
			}, "wrdcat15": {
				"editable": true, 
				"editcallback": function(oTable, nNode, sValue){
					editAndLog(oTable, nNode, sValue);
					}
			},
            "znwlid15": {
				"editable": true, 
				"editcallback": function(oTable, nNode, sValue){
					editAndLog(oTable, nNode, sValue);
					}
			}, "flex115": {
				"editable": true, 
				"editcallback": function(oTable, nNode, sValue){
					editAndLog(oTable, nNode, sValue);
					}
			}, "th-flex115": {
				"editable": true, 
				"editcallback": function(oTable, nNode, sValue){
					editAndLog(oTable, nNode, sValue);
					}
			}, "flex115-afbr": {
				"editable": true, 
				"editcallback": function(oTable, nNode, sValue){
					editAndLog(oTable, nNode, sValue);
					}
			}, 
            "th-flex115-afbr": {
				"editable": true, 
				"editcallback": function(oTable, nNode, sValue){
					editAndLog(oTable, nNode, sValue);
					}
			}, "flex215": {
				"editable": true, 
				"editcallback": function(oTable, nNode, sValue){
					editAndLog(oTable, nNode, sValue);
					}
			}, "th-flex215": {
				"editable": true, 
				"editcallback": function(oTable, nNode, sValue){
					editAndLog(oTable, nNode, sValue);
					}
			}, "flex215-afbr": {
				"editable": true, 
				"editcallback": function(oTable, nNode, sValue){
					editAndLog(oTable, nNode, sValue);
					}
			}, 
            "th-flex215-afbr": {
				"editable": true, 
				"editcallback": function(oTable, nNode, sValue){
					editAndLog(oTable, nNode, sValue);
					}
			}, "flex315": {
				"editable": true, 
				"editcallback": function(oTable, nNode, sValue){
					editAndLog(oTable, nNode, sValue);
					}
			}, "th-flex315": {
				"editable": true, 
				"editcallback": function(oTable, nNode, sValue){
					editAndLog(oTable, nNode, sValue);
					}
			}, "flex315-afbr": {
				"editable": true, 
				"editcallback": function(oTable, nNode, sValue){
					editAndLog(oTable, nNode, sValue);
					}
			},
            "th-flex315-afbr": {
				"editable": true, 
				"editcallback": function(oTable, nNode, sValue){
					editAndLog(oTable, nNode, sValue);
					}
			}, "flex415": {
				"editable": true, 
				"editcallback": function(oTable, nNode, sValue){
					editAndLog(oTable, nNode, sValue);
					}
			}, "th-flex415": {
				"editable": true, 
				"editcallback": function(oTable, nNode, sValue){
					editAndLog(oTable, nNode, sValue);
					}
			}, "flex415-afbr": {
				"editable": true, 
				"editcallback": function(oTable, nNode, sValue){
					editAndLog(oTable, nNode, sValue);
					}
			}, 
            "th-flex415-afbr": {
				"editable": true, 
				"editcallback": function(oTable, nNode, sValue){
					editAndLog(oTable, nNode, sValue);
					}
			}, "flex515": {
				"editable": true, 
				"editcallback": function(oTable, nNode, sValue){
					editAndLog(oTable, nNode, sValue);
					}
			}, "th-flex515": {
				"editable": true, 
				"editcallback": function(oTable, nNode, sValue){
					editAndLog(oTable, nNode, sValue);
					}
			}, "flex515-afbr": {
				"editable": true, 
				"editcallback": function(oTable, nNode, sValue){
					editAndLog(oTable, nNode, sValue);
					}
			}, 
            "th-flex515-afbr": {
				"editable": true, 
				"editcallback": function(oTable, nNode, sValue){
					editAndLog(oTable, nNode, sValue);
					}
			},
			
			"svink": {
				"editable": true, 
				"editcallback": function(oTable, nNode, sValue){
					editAndLog(oTable, nNode, sValue);
					}
			},
			
			"sn_opmerking": {
				"editable": true, 
				"editcallback": function(oTable, nNode, sValue){
					editAndLog(oTable, nNode, sValue);
					}
			},
            
            "lem05": {
            	"editable": false
			}, "volgnr05": {
				"editable": false
			}, "isGB05_trefw": {
				"editable": false
			}, "th-lem05": {
				"editable": false
			}, 
            "lem05-afbr": {
            	"visible": false,
            	"editable": false
			}, "th-lem05-afbr": {
				"editable": false
			}, "zook05": {
				"visible": false,
				"editable": false
			}, "betek05": {
				"visible": false,
				"editable": false
			}, "wrdcat05": {
				"visible": false,
				"editable": false
			}, 
            "znwlid05": {
            	"visible": false,
            	"editable": false
			}, "flex105": {
				"visible": false,
				"editable": false
			}, "th-flex105": {
				"editable": false
			}, "flex105-afbr": {
				"visible": false,
				"editable": false
			}, "th-flex105-afbr": {
				"editable": false
			}, 
            "flex205": {
            	"visible": false,
            	"editable": false
			}, "th-flex205": {
				"editable": false
			}, "flex205-afbr": {
				"visible": false,
				"editable": false
			}, "th-flex205-afbr": {
				"editable": false
			}, "flex305": {
				"visible": false,
				"editable": false
			}, 
            "th-flex305": {
            	"editable": false
			}, "flex305-afbr": {
				"visible": false,
				"editable": false
			}, "th-flex305-afbr": {
				"editable": false
			}, "flex405": {
				"visible": false,
				"editable": false
			}, "th-flex405": {
				"editable": false
			}, 
            "flex405-afbr": {
            	"visible": false,
            	"editable": false
			}, "th-flex405-afbr": {
				"editable": false
			}, "flex505": {
				"visible": false,
				"editable": false
			}, "th-flex505": {
				"editable": false
			}, "flex505-afbr": {
				"visible": false,
				"editable": false
			}, 
            "th-flex505-afbr": {
            	"editable": false
			}, 
            
            "pas_in_2015": {
            	"editable": true, 
				"editcallback": function(oTable, nNode, sValue){
					editAndLog(oTable, nNode, sValue);
					}
			},
            "nuance_intern": {
            	"editable": true, 
				"editcallback": function(oTable, nNode, sValue){
					editAndLog(oTable, nNode, sValue);
					}
			}, "nuance_extern": {
				"editable": true, 
				"editcallback": function(oTable, nNode, sValue){
					editAndLog(oTable, nNode, sValue);
					}
			}, "taaladvies": {
				"editable": true, 
				"editcallback": function(oTable, nNode, sValue){
					editAndLog(oTable, nNode, sValue);
					}
			}, 
            "gedrukt": {
            	"editable": true, 
				"editcallback": function(oTable, nNode, sValue){
					editAndLog(oTable, nNode, sValue);
					}
			}, "bespreken": {
				"editable": true, 
				"editcallback": function(oTable, nNode, sValue){
					editAndLog(oTable, nNode, sValue);
					}
			}
			

		}

};