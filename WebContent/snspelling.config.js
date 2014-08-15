

oShowOnlyTables = [//"gb_en_dedonselaer", "sn_list", 
                   "sn_list_cat"];

oTableSettingsList = {
		
		
		sn_list_cat: {
			
			size: "70%",
			"column_order": ["id", 
			                 "gb05", 
			                 "lemma", 
			                 "lemma_new",
			                 "pos", 
			                 "pos_new",
			                 "themacode",
			                 "sn_score", 
			                 "sranan", 
			                 "english",
			                 "freq", 
			                 "opn_ja", 
			                 "opn_nee", 
			                 "weg",
			                 "opmerkingen",
			                 "sn",
			                 "typisch_sn"],
			                 
			                 
			                 
             "button_0":{
 				"name": "Voeg lemma toe",
 				"click": function(confTable){
 					
 					var wordform = fn.prompt("Geef een lemma", 
 							["lemma", "pos"], 
 							["", ""], 
 							function(){
 						
		 						var sLemma = fn.getPromptUserInput("lemma");
		 						var sLemmaPos = fn.getPromptUserInput("pos");
		 						
		 						fn.insertIntoDatabase(confTable, 
		 								{"lemma": sLemma, 
		 								"pos":sLemmaPos,
		 								"lemma_new": sLemma, 
		 								"pos_new":sLemmaPos,
		 								"opn_ja": true
		 								}, 
		 								"id", // return id 
		 								false,
		 								function(){
		 									
		 									// Now we will show the new lemma.
		 									// First refresh the table,
		 									// and than, if the id is not to be found
		 									// on the refreshed page, that means the lemma
		 									// belongs to some other page: in that
		 									// case, write the new record on the first
		 									// row, temporarily	
		 									
		 									fn.refreshTable(confTable, function(){
		 										
		 										var id = fn.getLastDbResponse();
		 										
		 										// check if the id of the new lemma is to be found 
		 										// on the current page
		 										var found = false;
		 										var aAllRows = fn.getAllRows(confTable);
		 										aAllRows.each(function(){
		 											var sRowId = fn.getRowId(this);
		 											
		 											// id found?
		 											if (sRowId == id)
		 												{
		 												found = true;
		 												}
		 										});
		 										
		 										// Lemma is not on the page
		 										// Put it at the first row, so it is visible to the user
		 										if ( !found )
		 											{
		 											var sTableName = fn.getTableName(confTable);
		 											// give the first row the id of the record we want to
		 											// display there, and then call this record
		 											$("#"+sTableName+"_wrapper table tbody tr:eq(0)").attr("id", id);
		 											fn.callRecord(confTable, aAllRows[0], id, null,
		 													function(){
		 														// make sure edit functions are active in new row
		 														// and select this row, so it is visible to the user
		 														fn.selectRow(sTableName, 0);
		 														conf.activateConfigFunctions(sTableName);												
		 												
		 													});
		 											}
		 										
		 									});
		 									
		 								});
		 						
		 						
		 					});
 				}
 			}
//			,
// 			"button_1":{
// 				"name": "Verwijder selectie",
// 				"click": function(confTable){
// 					
// 					var answer = confirm("Weet u het zeker?");
// 					
// 					if (answer){
// 						
// 						var aRows = fn.getSelectedRowsFrom(confTable);
// 												
// 						aRows.each(function(){
// 							
// 							var bLastRow = fn.isLastNodeOf(this, aRows);
// 							
//// 							var sId = fn.getDataFromCellNamed(confTable, aRows, "id");
// 							
// 							fn.removeFromDatabaseGivenANode(confTable, this, false, function(){
//								if (bLastRow) fn.refreshTable(confTable);
//							});
// 							
//// 							fn.removeFromDatabaseGivenFieldValues(confTable, {"id":sId}, false, function(){
////								if (bLastRow) fn.refreshTable(confTable);
////							});
// 				
// 							 							
// 						});
// 					}
// 					
// 				}
// 			}
			
			
		},
		
		gb_en_dedonselaer: {
			size: "70%",
			nice_name: "GB & Van Donselaar",
			"column_order": ["id", "lemma", "opn_ja", "opn_nee", "opmerkingen", "lemmafreq", "in_gb05",
			                 "opm_commissie"]
		},
		
		sn_list: {
			"column_order": ["id", "lemma", "pos", "sn_score", "sranan", 
			                 "english", "gb05", "freq", "opn_ja", "opn_nee", "opmerkingen"]
		},
		
		
		GB05_2013: {
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
			"repeat_callback": true,
			
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
			                 "isGB05_trefw", "lem15", "voluit", "uitspraak", "taalvariant", "herkomst",
			                 "type15-lem15", 
			                 "th-lem15", "lem15-afbr", "th-lem15-afbr", "zook15", "betek15", 
			                 "wrdcat15", "znwlid15", "flex115", "th-flex115", "flex115-afbr", 
			                 "th-flex115-afbr", "flex215", "th-flex215", "flex215-afbr", 
			                 "th-flex215-afbr", "flex315", "th-flex315", "flex315-afbr", 
			                 "th-flex315-afbr", "flex415", "th-flex415", "flex415-afbr", 
			                 "th-flex415-afbr", "flex515", "th-flex515", "flex515-afbr", 
			                 "th-flex515-afbr", "nuance_intern", "nuance_extern", "taaladvies", 
			                 "bespreken", "pas_in_2015", "gedrukt",
			                 "svink", "sn_opmerking", "wijzigdatum15"]
			  
		}
};

// container object for the configuration of each table
oTableConfigurationList = {
		
		sn_list_cat: {
			
			"id" : {
				"visible": false
				}, 
            "gb05": {}, 
            "lemma": {            	
            	"colsort": "asc",
            	"cell_tooltip": "Klik hier om het Corpus Surinaams te openen",
				"click": function(someTable, nNode){
					
					var lemma = fn.getDataFromCellNode(someTable, nNode);
					window.open("http://surinaams.corpus.taalbanknederlands.inl.nl/searchsurinaams/page/search?lemma="+lemma);
				}
            }, 
            "lemma_new": {
            	"editable": true, 
            	"bgcolor": "#E0ECF8"
            		},
            "pos": {}, 
            "pos_new": {
            	"editable": true, 
            	"bgcolor": "#E0ECF8"
            		},
            "themacode": {
            	"editable": true, 
            	"bgcolor": "#CEE3F6"
            		},
            "sn_score": {
            	"visible": false
            	}, 
            "sranan": {
            	"visible": false
            	}, 
            "english": {
            	"visible": false
            	},
            "freq": {
            	
            	}, 
            "opn_ja": {
            	"filter": true,
            	"keepfilter": true,
            	"visible": false
            	}, 
            "opn_nee": {
            	"searchable": false, // keepfilter does the same in opn_ja
            	"visible": false
            	}, 
            "opmerkingen": {
            	"editable": true, 
            	"bgcolor": "#E0ECF8"
            		},
            "weg": {
            	"editable": true
            },
            "sn": {
            	"visible": false
            },
            "typisch_sn": {
            	"editable": true
            }
			
		},
		
		
		gb_en_dedonselaer: {
			
			id: {
				"visible": false
			},
			lemma:{
				"colsort": "asc" 
			},			
			opmerkingen: {
				"editable": true
			},
			opn_ja: {
				"editable": true,
				"editcallback": function(t, n, valueChecked){					
					var siblingChecked = fn.getCellElement(t, n, "opn_nee").find("input").val() == 'true';
					if (siblingChecked && valueChecked)
						{
						fn.updateDatabaseGivenANode(t, n, ["opn_nee"], [false], true);						
						}		
					
				}
			},
			opn_nee: {
				"editable": true,
				"editcallback": function(t, n, valueChecked){
					
					var siblingChecked = fn.getCellElement(t, n, "opn_ja").find("input").val() == 'true';		
					if (siblingChecked && valueChecked)
						{
						fn.updateDatabaseGivenANode(t, n, ["opn_ja"], [false], true);
						}
					
				}
			},
			opm_commissie: {
				"editable": true
			}
		},
		
		sn_list: {
		
			id: {
				"visible": false
			},
			pos: {
				"visible": false
			},
			sn_score:{
				"colsort": "desc" // 1st colsort
			},
			lemma:{
				"colsort": "desc"
//					, // 2nd colsort
//				"cell_tooltip": "Klik hier om het Corpus Surinaams te openen",
//				"click": function(someTable, nNode){
//					
//					var lemma = fn.getDataFromCellNode(someTable, nNode);
//					window.open("http://svowmc01:8080/searchsurinaams/page/search?lemma="+lemma);
//				}
			},
			opn_ja: {
				"editable": true,
				"editcallback": function(t, n, valueChecked){					
					var siblingChecked = fn.getCellElement(t, n, "opn_nee").find("input").val() == 'true';
					if (siblingChecked && valueChecked)
						{
						fn.updateDatabaseGivenANode(t, n, ["opn_nee"], [false], true);						
						}		
					
				}
			},
			opn_nee: {
				"editable": true,
				"editcallback": function(t, n, valueChecked){
					
					var siblingChecked = fn.getCellElement(t, n, "opn_ja").find("input").val() == 'true';		
					if (siblingChecked && valueChecked)
						{
						fn.updateDatabaseGivenANode(t, n, ["opn_ja"], [false], true);
						}
					
				}
			},
			sranan: {
				"editable": true
			},
			english: {
				"editable": true
			},
			opmerkingen: {
				"editable": true
			}
			
		},
		
		GB05_2013 : {
			"id" : {"visible": false},
			"superid" : {"visible": false},
			"vormvariant05" : {"visible": false},
			"lem05" : {"visible": false},
			"volgnr05" : {"visible": false},
			"spelvar_afb_lem05" : {"visible": false},
			"arg-lem95" : {"visible": false},
			"type95-lem05" : {"visible": false},
			"type05-lem05" : {"visible": false},
			"th-lem05" : {"visible": false},
			"lem05-afbr" : {"visible": false},
			"arg-lem95-afbr" : {"visible": false},
			"isGB05_trefw": {"visible": false},
			
			"th-lem05-afbr" : {"visible": false},
			"zook05" : {"visible": false},
			
			"type95-zook05" : {"visible": false},
			"type05-zook05" : {"visible": false},
			"th-zook05" : {"visible": false},
			"betek05" : {"visible": false},
			"arg-betek95" : {"visible": false},
			"type95-betek05" : {"visible": false},
			"type05-betek05" : {"visible": false},
			"th-betek05" : {"visible": false},
			"wrdcat05" : {"visible": false},
			"arg-wrdcat95" : {"visible": false},
			"type95-wrdcat05" : {"visible": false},
			"type05-wrdcat05" : {"visible": false},
			"th-wrdcat05" : {"visible": false},
			"znwlid05" : {"visible": false},
			"arg-znwlid95" : {"visible": false},
			"type95-znwlid05" : {"visible": false},
			"type05-znwlid05" : {"visible": false},
			"th-znwlid05" : {"visible": false},
			"flex105" : {"visible": false},
			"arg-flex195" : {"visible": false},
			"type95-flex105" : {"visible": false},
			"type05-flex105" : {"visible": false},
			"th-flex105" : {"visible": false},
			"flex105-afbr" : {"visible": false},
			"arg-flex195-afbr" : {"visible": false},
			"type95-flex105-afbr" : {"visible": false},
			"type05-flex105-afbr" : {"visible": false},
			"th-flex105-afbr" : {"visible": false},
			"flex205" : {"visible": false},
			"arg-flex295" : {"visible": false},
			"type95-flex205" : {"visible": false},
			"type05-flex205" : {"visible": false},
			"th-flex205" : {"visible": false},
			"flex205-afbr" : {"visible": false},
			"arg-flex295-afbr" : {"visible": false},
			"type95-flex205-afbr" : {"visible": false},
			"type05-flex205-afbr" : {"visible": false},
			"th-flex205-afbr" : {"visible": false},
			"flex305" : {"visible": false},
			"arg-flex395" : {"visible": false},
			"type95-flex305" : {"visible": false},
			"type05-flex305" : {"visible": false},
			"th-flex305" : {"visible": false},
			"flex305-afbr" : {"visible": false},
			"arg-flex395-afbr" : {"visible": false},
			"type95-flex305-afbr" : {"visible": false},
			"type05-flex305-afbr" : {"visible": false},
			"th-flex305-afbr" : {"visible": false},
			"flex405" : {"visible": false},
			"arg-flex495" : {"visible": false},
			"type95-flex405" : {"visible": false},
			"type05-flex405" : {"visible": false},
			"th-flex405" : {"visible": false},
			"flex405-afbr" : {"visible": false},
			"arg-flex495-afbr" : {"visible": false},
			"type95-flex405-afbr" : {"visible": false},
			"type05-flex405-afbr" : {"visible": false},
			"th-flex405-afbr" : {"visible": false},
			"flex505" : {"visible": false},
			"arg-flex595" : {"visible": false},
			"type95-flex505" : {"visible": false},
			"type05-flex505" : {"visible": false},
			"th-flex505" : {"visible": false},
			"flex505-afbr" : {"visible": false},
			"arg-flex595-afbr" : {"visible": false},
			"type95-flex505-afbr" : {"visible": false},
			"type05-flex505-afbr" : {"visible": false},
			"th-flex505-afbr" : {"visible": false},
			"spelregel05" : {"visible": false},
			"corr-spel05" : {"visible": false},
			"spelprod05" : {"visible": false},
			"lexigraf05" : {"visible": false},
			"geen-SN05" : {"visible": false},
			"arg-geen-SN95" : {"visible": false},
			"type95-geen-SN05" : {"visible": false},
			"type05-geen-SN05" : {"visible": false},
			"th-geen-SN05" : {"visible": false},
			"wijzignaam15" : {"visible": false},
			"wijzigdatum15" : {"visible": false},
			"pas_in_2015" : {"visible": false},
			
			"lem15": {"filter": ".", "colsort": "asc", "visible": true}, 
			"taalvariant": {
				"visible": false, 
				"filter": "SN", 
				"keepfilter": true, 
				"searchable": false,
				"flexible_visibility": false},
			"uitspraak": {},
			"herkomst": {"visible": false},
			"type15-lem15": {"visible": false}, 
			"th-lem15": {"visible": false}, 
            "lem15-afbr": {"visible": false}, 
            "th-lem15-afbr": {"visible": false}, 
			"zook15": {"visible": true}, 
			"betek15": {"visible": true}, 
			"wrdcat15": {"visible": true},
            "znwlid15": {"visible": true}, 
			"flex115": {"visible": true}, 
			"th-flex115": {"visible": false}, 
			"flex115-afbr": {"visible": false}, 
            "th-flex115-afbr": {"visible": false}, 
			"flex215": {"visible": true}, 
			"th-flex215": {"visible": false}, 
			"flex215-afbr": {"visible": false}, 
            "th-flex215-afbr": {"visible": false}, 
			"flex315": {"visible": true}, 
			"th-flex315": {"visible": false}, 
			"flex315-afbr": {"visible": false},
            "th-flex315-afbr": {"visible": false}, 
			"flex415": {"visible": true}, 
			"th-flex415": {"visible": false}, 
			"flex415-afbr": {"visible": false}, 
            "th-flex415-afbr": {"visible": false}, 
            "flex515": {"visible": true}, 
            "th-flex515": {"visible": false}, 
            "flex515-afbr": {"visible": false}, 
            "th-flex515-afbr": {"visible": false},
            "nuance_intern": {"visible": false},
            "nuance_extern": {"visible": false},
            "taaladvies": {"visible": false},
            "gedrukt": {"visible": false},
            "bespreken": {"visible": false},
            "svink": {
            	"bgcolor": ["#D8F6CE"],
            	"editable": true,            
				"editcallback": function(oTable, nNode, sValue){
					editAndLog(oTable, nNode, sValue);
					}
            },
            "sn_opmerking": {
            	"bgcolor": ["#D8F6CE"],
            	"editable": true,            
				"editcallback": function(oTable, nNode, sValue){
					editAndLog(oTable, nNode, sValue);
					}
            }

		}
};

function editAndLog(oTable, nNode, sValue){
	
	fn.updateDatabaseGivenANode(oTable, nNode, 
			["wijzignaam15", "wijzigdatum15"], 
			[fn.getCurrentUser(), fn.getCurrentTimestamp("YYYY-MM-DD HH:MI:SS")], false);
}