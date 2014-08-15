// list of tables that must be hidden
oHiddenTablesList = ["spelling", "spelling_alles", "opzoek_view", "spelling_view", "log"];

oTableSettingsList = {
		spelling_view: {
			"columns_button": true
			},
			
		karlingtabel: {
			"size": "60%"
		}
		
};

// container object for the configuration of each table

var fnKarlingFunction = function(confTable, confNode){
	var id = fn.getDataFromCellNamed(confTable, confNode, "onw_id");
	var url = "http://gtb.inl.nl/iWDB/search?actie=article&wdb=ONW&id="+id+"&content-type=text/html; charset=utf-8";
	window.open(url);
};

oTableConfigurationList = {
		
		karlingtabel:{
			
			"onw_id": {
				
				"click": function(confTable, confNode){ fnKarlingFunction(confTable, confNode); }
			},
			"modern_lemma": {
				
				"click": function(confTable, confNode){ fnKarlingFunction(confTable, confNode); }
			},
			"historisch_lemma": {
				
				"click": function(confTable, confNode){ fnKarlingFunction(confTable, confNode); }
			}
		},
		
		log : {
			id : {"colsort": "desc"},
			operatie : {},
			details : {},
			datum : {}
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
			pkid : {"visible": false, "flexible_visibility": false},
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
				"button": "",
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
			nagekeken: {"editable": true},
			opmerking : {
				"editable": true,
				"bgcolor": ["#CECEF6", "#F2EFFB"]
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