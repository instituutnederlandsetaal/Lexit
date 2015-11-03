// list of tables that must be hidden
oHiddenTablesList = ["spelling", "opzoek_view"];

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
		}
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
			correctie: {
				"bgcolor": ["#CECEF6", "#F2EFFB"],
				"editable": true
				},
			comment: {
				"textstyle": "oblique"
			},
			copy: {
				"button": "Overnemen",
				"sortable": false,
				"click": function(confTable, confNode){
					var modnedlemma = fn.getDataFromSiblingNode(confTable, confNode, "modern_lemma");
					var nRowNode = fn.getRowNode(confNode);
					fn.putDataIntoCell(confTable, nRowNode, "correctie", modnedlemma);
					fn.updateDatabaseGivenANode(confTable, nRowNode, "correctie", modnedlemma, false, null);
				}
			},
			dic : {
				"button": "WDB",
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
			hist_lemma_id : {"visible": false},
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
			correctie: {
				"bgcolor": ["#CECEF6", "#F2EFFB"],
				"editable": true
				},
			comment: {
				"textstyle": "oblique"
			},
			copy: {
				"button": "Overnemen",
				"sortable": false,
				"click": function(confTable, confNode){
					var modnedlemma = fn.getDataFromSiblingNode(confTable, confNode, "modern_lemma");
					var nRowNode = fn.getRowNode(confNode);
					fn.putDataIntoCell(confTable, nRowNode, "correctie", modnedlemma);
					fn.updateDatabaseGivenANode(confTable, nRowNode, "correctie", modnedlemma, false, null);
				}
			},
			dic : {
				"button": "WDB",
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
			hist_lemma_id : {"visible": false},
			nagekeken: {"editable": true},
			opmerking : {
				"editable": true,
				"bgcolor": ["#CECEF6", "#F2EFFB"]
			}
		},
		
		mnw_verwijslemmata:{
			
			"id": {
				"click": function(t, n){
					var id = fn.getDataFromCellNode(t, n);
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
					var id = fn.getDataFromCellNode(t, n);
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