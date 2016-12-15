// list of tables that must be hidden
oHiddenTablesList = ["spelling", "opzoek_view"];

oButtonsConfig = {
		
		"button_0":{
			"name": "Rij dupliceren",
			"click": function(t){
				
				var oRow = fx.getFirstSelectedRowFrom(t);
				var sId = fx.getDataFromCellInRow(oRow, "pkid");
				
				fn.callFunction("marijke_spelling.duplicate_row", [sId], function(){
					fn.refreshTable(t);
				});
			}
		},
		"button_1":{
			"name": "Verwijderen",
			"click": function(t){
				fn.confirm("Zeker weten?", "Weet u zeker dat deze rij(en) verwijderd moet(en) worden?", 
						function(){
					
							var oRows = fx.getSelectedRowsFrom(t);						
							
							oRows.every(function(){
								
								var oCurrentRow = this;
								var sId = fx.getDataFromCellInRow(oCurrentRow, "pkid");
								
								var bLastRow = fx.isLastRowOf(oCurrentRow, oRows);
								
								fn.callFunction("marijke_spelling.delete_row", [sId], function(){
									
									if (bLastRow)
										fn.refreshTable(t, function(){
											fn.message("OK", "De geselecteerde rijen zijn verwijderd!");
										});
								});
								
							});
						}, 
						function(){
							
							fn.message("OK!", "Verwijderen geannuleerd!");
						});
			}
		}
		
}; 

oTableSettingsList = {
		
		mnw_verwijslemmata:{
			
			"column_order": ["id",
			                 "lemma",
			                 "modlem",			                 
			                 "status",
			                 "kopje",
			                 "verwijst_naar_id",
			                 "verwijst_naar_histlem",
			                 "verwijst_naar_modlem",			                 
			                 "opmerking",
			                 "auto_lem",
			                 "unique_id"]
		},
		
		spelling_view: oButtonsConfig,
		spelling_alles: oButtonsConfig
};

// container object for the configuration of each table
oTableConfigurationList = {
		
		log : {
			id : {"colsort": "desc"},
			operatie : {},
			details : {},
			datum : {}
		},
		
		spelling_alles : {
			portie_nr : {
				"visible": true,
				"choosefrom": ["", // default value 
				               "0", "1", "2", "3", "4", "5", "6", "7", "8", "9",
				               "10", "11", "12", "13", "14", "15", "16", "17", "18", "19",
				               "20", "21", "22", "23", "24", "25", "26", "27", "28", "29",
				               "30", "31"]
				},
			pkid : {"visible": false},
			
			comment: {
				"textstyle": "oblique"
			},
			
			dic : {
				"button": "WDB",
				"sortable": false,
				"click": function(confTable, confNode){
					var id = fn.getDataFromSiblingNode(confNode, "hist_lemma_id");
					var dicAndId = getDicAndId(id);
					var dic = dicAndId[0];
					var id = dicAndId[1];
					var url = "http://gtb.inl.nl/iWDB/search?actie=article&wdb="+dic+"&id="+id+"&content-type=text/html; charset=utf-8";
					window.open(url);
				}
			},
			modern_lemma : {
				"bgcolor": ["#CECEF6", "#F2EFFB"],
				"editable": true
			},
			hist_lemma : {
				"colsort": "asc",  // sort #1
				"editable": true
				},
			homonym_nr: {
				"colsort": "asc",  // sort #2
				"editable": true
			},
			hist_lemma_id : {
				"colsort": "asc",  // sort #3
				"visible": false
				},
			nagekeken: {"editable": true},
			opmerking : {
				"editable": true,
				"bgcolor": ["#CECEF6", "#F2EFFB"]
			}
		},
		
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
			pkid : {"visible": false},
			
			comment: {
				"textstyle": "oblique"
			},
			
			dic : {
				"button": "WDB",
				"sortable": false,
				"click": function(confTable, confNode){
					var id = fn.getDataFromSiblingNode(confNode, "hist_lemma_id");
					var dicAndId = getDicAndId(id);
					var dic = dicAndId[0];
					var id = dicAndId[1];
					var url = "http://gtb.inl.nl/iWDB/search?actie=article&wdb="+dic+"&id="+id+"&content-type=text/html; charset=utf-8";
					window.open(url);
				}
			},
			modern_lemma : {
				"bgcolor": ["#CECEF6", "#F2EFFB"],
				"editable": true
			},
			hist_lemma : {
				"colsort": "asc",  // sort #1
				"editable": true
				},
			homonym_nr: {
				"colsort": "asc",  // sort #2
				"editable": true
				},
			hist_lemma_id : {
				"colsort": "asc",  // sort #3
				"visible": false
				},
			nagekeken: {"editable": true},
			opmerking : {
				"editable": true,
				"bgcolor": ["#CECEF6", "#F2EFFB"]
			}
		},
		
		mnw_verwijslemmata:{
			
			"id": {
				"click": function(t, n){
					var id = fn.getDataFromCellNode(n);
					var url = "http://gtb.inl.nl/iWDB/search?actie=article&wdb=MNW&id="+id+"&content-type=text/html; charset=utf-8";
					window.open(url);
				}
			},
			"lemma" : {				
				"colsort": "asc"
			},
			"modlem": {
				"editable": true,
				"bgcolor": "#CECEF6"
			},               
			"status": {"choosefrom": []},
			"kopje": {
				"editable": true
			},
			"verwijst_naar_id": {
				"click": function(t, n){
					var id = fn.getDataFromCellNode(n); 
					var url = "http://gtb.inl.nl/iWDB/search?actie=article&wdb=MNW&id="+id+"&content-type=text/html; charset=utf-8";
					window.open(url);
				}
			},
			"verwijst_naar_histlem": {},
			"verwijst_naar_modlem": {},			                 
			"opmerking": {
				"editable": true,
				"bgcolor": "#CECEF6"
			},
			"auto_lem": {},
			"unique_id": {
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