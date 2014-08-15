// list of tables that must be hidden or visible (don't use both, it's a matter of what's the most convenient)
oHiddenTablesList = [];
oShowOnlyTables = [ "verwijslem_view", "entry"];

// table general settings
oTableSettingsList = {
		
		"spelling_view":{
			
			"nice_name": "Noor-tabel"
		},
		
		spelling_metverwijzingen_werktabel: {
			
			"keyup": {
				
				"spacebar": function(t){
					
					var rowActive = fn.getActiveRowNode(t);
					var cellWeWant = fn.getCellElement(t, rowActive, "ref_corrected_modern_lemma");
					cellWeWant.click();
				}
			},
			
			"column_order": [
			                 "unique_id",
			                 "id",
			                 "hist_lemma",
			                 "hist_lemma_id",
							 "modern_lemma",
							 "corrected_modern_lemma",
							 "gewijzigd",
							 "correctie", // same as corrected_modern_lemma, but sometimes empty instead!
							 "corrected_modern_lemma_backup_of_original",
							 
							 "ref_hist_lemma_id",
							 "ref_hist_lemma",
							 "ref_modern_lemma",	
							 "ref_corrected_modern_lemma",
							 "ref_correctie", // same as ref_corrected_modern_lemma, but sometimes empty instead!
							 "ref_corrected_modern_lemma_backup_of_original",
							 
							 "nagekeken",
							 
							 "portie_nr",
							 "is_verwijslemma",
							 "verw_klopt",
							 "comment",
							 "opmerking"
							 ]
			
		},
		
		
		spelling_splitup: {
			
			"nice_name": "Spelling, één lemma per regel",
			
			"size": "80%",
			
			"column_order": [
			                 "id",
			                 "hist_lemma_id",
			                 "correctie",
			                 "comment",
			                 "unsplit_hist_lemma",
			                 "hist_lemma",
			                 "modern_lemma",			                 
			                 "positie",			                 		                 
			                 "nagekeken",
			                 "opmerking",
			                 "portie_nr",
			                 "unique_id"
			                 ]			
			
		}
};


// configuration at column level
oTableConfigurationList = {
		
		spelling_view : {
			portie_nr : {
				"visible": true,
				"filter" : "0", // value upon initialization
				"choosefrom": ["", // default value 
				               "0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
				               "10", "11", "12", "13", "14", "15", "16", "17", "18", "19",
				               "20", "21", "22", "23", "24", "25", "26", "27", "28", "29",
				               "30", "31"]
				},
			pkid : {"visible": false, "flexible_visibility": false},
			correctie: {
				"bgcolor": ["#CECEF6", "#F2EFFB"]
				},
			comment: {
				"textstyle": "oblique"
			},
			copy: {
				
			},
			dic : {
				"button": "WDB",
				"button_tooltip": "Open woordenboek",
				"sortable": false,
				"click": function(confTable, confNode){
					var id = fn.getDataFromSiblingNode(confTable, confNode, "hist_lemma_id");
					var dicAndId = getDicAndId(id);
					var dic = dicAndId[0];
					var id = dicAndId[1];
					var url = "http://gtb.inl.nl/iWDB/search?actie=article&wdb="+dic+"&id="+id+"&content-type=text/html; charset=utf-8";
					window.open(url);
				}
			},
			modern_lemma : {},
			hist_lemma : {"colsort": "asc"},
			hist_lemma_id : {"visible": false, "flexible_visibility": false},
			nagekeken: {},
			opmerking : {				
				"bgcolor": ["#CECEF6", "#F2EFFB"]
			}
		},
		
		spelling_splitup: {
			
			"hist_lemma_id":{
            	"colsort": "asc",
            	"click": function(confTable, confNode){
					
            		var id = fn.getDataFromCellNode(confTable, confNode);					
					var dicAndId = getDicAndId(id);
					var dic = dicAndId[0];
					var id = dicAndId[1];
					var url = "http://gtb.inl.nl/iWDB/search?actie=article&wdb="+dic+"&id="+id+"&content-type=text/html; charset=utf-8";
					window.open(url);
				}
            },
            "positie":{
            	"colsort": "asc"
            },
			
			"id":{
				"visible": false
			},
            "correctie":{
            	"visible": false
            },
            "comment":{
            	"visible": false
            },
            "modern_lemma":{
            	"editable": true
            },
            "hist_lemma":{
            	"bgcolor": "#D8F6CE",
            	"editable": true
            },
            "unsplit_hist_lemma":{},
            
            "nagekeken":{},
            "opmerking":{
            	"editable": true
            },
            "portie_nr":{
            	"visible": false
            },
            "unique_id": {
            	"visible": false
            }
            
		},
		
		verwijslem_view: {
			
			corrected_modern_lemma: {
				"bgcolor": "#D8F6CE",
				"editable": true,
				"editfunc": function(confTable, confNode, value){
					
					var rowId = fn.getDataFromCellInRowNode(confTable, confNode, "pkid");
					fn.updateDatabaseGivenFieldValues("spelling_metverwijzingen_werktabel", 
							{"unique_id": rowId}, 
							{
							"gewijzigd": true,
							"corrected_modern_lemma": value
							}, 
							false, function(){
								fn.refreshTable(confTable);
							});
				}
			},
			
			pkid: {
				"visible": false
			},
			
			ref_hist_lemma: {
				
				"bgcolor": "#F5BCA9",
				"click": function(t, n){
					
					var histLemId = fn.getDataFromCellNamed(t, n, "ref_hist_lemma_id");
					fn.callDatabase("entry", {"id": histLemId} );
				}
			}
				
		},
		
		entry: {
			
			id: {
				"cell_tooltip": "Klik om als verwijslemma te koppelen",
				"bgcolor": "#F5BCA9",
				"click": function(t, n){
					
					if (fn.tableExists("verwijslem_view"))
						{
						var aRows = fn.getSelectedRowsFrom("verwijslem_view");
						if (aRows.length==1)
							{
							var answer = confirm("Weet u het zeker?");
							
							if (answer)
								{
								var nSelectedRow = fn.getFirstSelectedRowFrom("verwijslem_view");
								var rowId = fn.getDataFromCellNamed("verwijslem_view", nSelectedRow, "pkid");
								
								var idToAssign = fn.getDataFromCellNode(t, n);
								fn.updateDatabaseGivenFieldValues("spelling_metverwijzingen_werktabel", 
										{"unique_id": rowId}, 
										{"ref_hist_lemma_id": idToAssign}, 
										false, function(){
											fn.refreshTable("verwijslem_view");
										});
								}
							}
						}
				}
			}
		},
		
		
		spelling_metverwijzingen_werktabel: {
			
			unique_id: {
				"visible": false
			},
			
			id: {
				"visible": false
				
			},
			portie_nr: {
				"visible": false
			},
			
			
			
			
			hist_lemma : {
				"colsort": "asc",
				"bgcolor": "#F5BCA9",
				"cell_tooltip": "Open woordenboek",				
				"click": function(confTable, confNode){
					
					var id = fn.getDataFromSiblingNode(confTable, confNode, "hist_lemma_id");					
					var dicAndId = getDicAndId(id);
					var dic = dicAndId[0];
					var id = dicAndId[1];
					var url = "http://gtb.inl.nl/iWDB/search?actie=article&wdb="+dic+"&id="+id+"&content-type=text/html; charset=utf-8";
					window.open(url);
				}
			},
			
			modern_lemma: {
				"colsort": "asc"
			},
			
			hist_lemma_id : {
				"visible": false
			},
			ref_hist_lemma_id:{
				"visible": false
			},
			ref_hist_lemma : {
				"bgcolor": "#F5BCA9",
				"cell_tooltip": "Open woordenboek",				
				"click": function(confTable, confNode){
					
					var id = fn.getDataFromSiblingNode(confTable, confNode, "ref_hist_lemma_id");
					var url = "http://gtb.inl.nl/iWDB/search?actie=article&wdb=WNT&id="+id+"&content-type=text/html; charset=utf-8";
					if (id !='')
						window.open(url);
					else
						alert("Lege cel: niets te tonen!");
				}
				
			},
			
			corrected_modern_lemma: {
				"bgcolor": "#D8F6CE",
				"editable": true,
				"editcallback": function(t, n, value){
					fn.updateDatabaseGivenANode(t, n, ["gewijzigd"], [true], true);
				}
			},
			gewijzigd: {
				
			},
			corrected_modern_lemma_backup_of_original: {
				"visible": false
			},
			correctie: {
				"visible": false
			},
			ref_correctie: {
				"visible": false
			},
			
			
			ref_corrected_modern_lemma: {
			},
			ref_corrected_modern_lemma_backup_of_original: {
				"visible": false
			}
			
			
		}

};



function getDicAndId(id){
	
	var aDicAndId = new Array();
	var dics = ["VMNW", "ONW", "MNW", "WNT"];
	for (var i=0; i<dics.length; i++)
		{
		if ($.startsWith(id, dics[i]))
			{
			aDicAndId.push(dics[i]);
			aDicAndId.push( (dics[i]=="VMNW"?"ID":"")+id.substring(dics[i].length));
			return aDicAndId;
			}
		}
	
};

