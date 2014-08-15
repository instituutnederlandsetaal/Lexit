// list of tables that must be hidden or visible (don't use both, it's a matter of what's the most convenient)
oHiddenTablesList = [];
oShowOnlyTables = ["ambiguplus1",
                   "ambiguplus2",
                   "ambiguplus3",
                   "ambiguplus4",
                   "ambiguplus5",
                   "ambiguplus6",
                   "ambiguplus7",
                   "ambiguplus8",
                   "ambiguplus9",
                   "ambiguplus10",
                   "ambiguplus11",
                   "ambiguplus12",
                   "ambiguplus13",
                   "ambiguplus14",
                   "ambiguplus15",
                   "ambiguplus16",
                   "ambiguplus17",
                   "ambiguplus18",
                   "ambiguplus19",
                   "ambiguplus20",
                   "ambiguplus21",
                   "ambiguplus22",
                   "ambiguplus23",
                   "ambiguplus24",
                   "ambiguplus25",
                   "ambiguplus26",
                   "ambiguplus27",
                   "ambiguplus28",
                   "ambiguplus29",
                   "ambiguplus30",
                   "ambiguplus31",
                   "ambiguplus32",
                   "ambiguplus33",
                   "ambiguplus34",
                   "ambiguplus35",
                   "ambiguplus36",
                   "ambiguplus37",
                   "ambiguplus38",
                   "ambiguplus39",
                   "ambiguplus40",
                   "ambiguplus41",
                   "ambiguplus42",
                   "ambiguplus43",
                   "ambiguplus44",
                   "ambiguplus45",
                   "ambiguplus46",
                   "ambiguplus47",
                   "ambiguplus48",
                   "ambiguplus49",
                   "ambiguplus50",
                   "ambiguplus51",
                   "ambiguplus52",
                   "ambiguplus53",
                   "ambiguplus54",
                   "ambiguplus55",
                   "ambiguplus56"
];

var oAmbiguPlusConfig = {
		
		"column_order": [
			"id",
			"wordform",
			"modern_lem",
			"modern_lem_corr",
			"lemma_pos",
			"lemma_pos_corr",
			"persistent_id",
			"problem",
			"opmerkingen",
			"example",
			"onset",
			"offset"
			],
		
		"keyup" : {
			"z": function(confTable){
				$(":focus").blur();
				var nSelectedRow = fn.getActiveRowNode(confTable);
				var bChecked = fn.getDataFromCellInRowNode(confTable, nSelectedRow, "problem");
				if (bChecked == 'f' ) bChecked = false;					
				if (bChecked == 't' ) bChecked = true;
				fn.updateDatabaseGivenANode(confTable, nSelectedRow, "problem", !bChecked, false,
						function(){fn.putDataIntoCell(confTable, nSelectedRow, "problem", !bChecked);});
			}
//			,
//			"enter" : function(confTable){
//				$(":focus").blur();
//				var nSelectedRow = fn.getFirstSelectedRowFrom(confTable);
//				var id = fn.getDataFromCellInRowNode(confTable, nSelectedRow, "persistent_id");
//				var url = "http://gtb.inl.nl/iWDB/search?actie=article&wdb=wnt&id="+id+"&content-type=text/html; charset=utf-8";
//				window.open(url);
//				
//			}
		},
		
		"callback": function(confTable){
			
			var aRows = fn.getAllRows(confTable);
			aRows.each(function(){
				var nCurrentNode = this;
				var sQuote = fn.getDataFromCellInRowNode(confTable, nCurrentNode, "example");
				var iStart = parseInt(fn.getDataFromCellInRowNode(confTable, nCurrentNode, "onset"));
				var iEnd   = parseInt(fn.getDataFromCellInRowNode(confTable, nCurrentNode, "offset"));
				var sHighlightedQuote = fn.getHighlight(sQuote, [[iStart, iEnd]], "yellow");
				fn.putDataIntoCell(confTable, nCurrentNode, "example", sHighlightedQuote);
			});
		},
		"repeat_callback": true
	};


oConfigAmbiguPlus = {
		
		
		modern_lem_corr: {
			"editable": true,
			"bgcolor": "#CEF6E3"
		},
		lemma_pos_corr: {
			"editable": true,
			"bgcolor": "#CEF6E3"
		},
		opmerkingen: {
			"editable": true,
			"bgcolor": "#CEF6E3"
		},
		
		onset: {"visible": false},
		offset: {"visible": false},
		id: {"visible": false},
		persistent_id: {
			"cell_tooltip": "Open de WNT",
			"bgcolor": "#F2F2F2",
			"click": function(someTable, nNode){
				var id = fn.getDataFromCellNode(someTable, nNode);					
				var url = "http://gtb.inl.nl/iWDB/search?actie=article&wdb=wnt&id="+id+"&content-type=text/html; charset=utf-8";
				window.open(url);
			}
		},
		problem: {
			"editable": true,
			"click": function(confTable, confNode){
				var nSelectedRow = fn.getRowNode(confNode);
				var bChecked = fn.getDataFromCellInRowNode(confTable, nSelectedRow, "problem");
				if (bChecked == 'f' ) bChecked = false;					
				if (bChecked == 't' ) bChecked = true;
				fn.updateDatabaseGivenANode(confTable, nSelectedRow, "problem", !bChecked, false,
						function(){fn.putDataIntoCell(confTable, nSelectedRow, "problem", !bChecked);});
				}
			},
		wordform: {"colsort": "asc"}
	};

// ------------------------------------------------------------------------------------





// table general settings
oTableSettingsList = {
		
		ambiguplus1: oAmbiguPlusConfig,
		ambiguplus2: oAmbiguPlusConfig,
		ambiguplus3: oAmbiguPlusConfig,
		ambiguplus4: oAmbiguPlusConfig,
		ambiguplus5: oAmbiguPlusConfig,
		ambiguplus6: oAmbiguPlusConfig,
		ambiguplus7: oAmbiguPlusConfig,
		ambiguplus8: oAmbiguPlusConfig,
		ambiguplus9: oAmbiguPlusConfig,
		ambiguplus10: oAmbiguPlusConfig,
		ambiguplus11: oAmbiguPlusConfig,
		ambiguplus12: oAmbiguPlusConfig,
		ambiguplus13: oAmbiguPlusConfig,
		ambiguplus14: oAmbiguPlusConfig,
		ambiguplus15: oAmbiguPlusConfig,
		ambiguplus16: oAmbiguPlusConfig,
		ambiguplus17: oAmbiguPlusConfig,
		ambiguplus18: oAmbiguPlusConfig,
		ambiguplus19: oAmbiguPlusConfig,
		ambiguplus20: oAmbiguPlusConfig,
		ambiguplus21: oAmbiguPlusConfig,
		ambiguplus22: oAmbiguPlusConfig,
		ambiguplus23: oAmbiguPlusConfig,
		ambiguplus24: oAmbiguPlusConfig,
		ambiguplus25: oAmbiguPlusConfig,
		ambiguplus26: oAmbiguPlusConfig,
		ambiguplus27: oAmbiguPlusConfig,
		ambiguplus28: oAmbiguPlusConfig,
		ambiguplus29: oAmbiguPlusConfig,
		ambiguplus30: oAmbiguPlusConfig,
		ambiguplus31: oAmbiguPlusConfig,
		ambiguplus32: oAmbiguPlusConfig,
		ambiguplus33: oAmbiguPlusConfig,
		ambiguplus34: oAmbiguPlusConfig,
		ambiguplus35: oAmbiguPlusConfig,
		ambiguplus36: oAmbiguPlusConfig,
		ambiguplus37: oAmbiguPlusConfig,
		ambiguplus38: oAmbiguPlusConfig,
		ambiguplus39: oAmbiguPlusConfig,
		ambiguplus40: oAmbiguPlusConfig,
		ambiguplus41: oAmbiguPlusConfig,
		ambiguplus42: oAmbiguPlusConfig,
		ambiguplus43: oAmbiguPlusConfig,
		ambiguplus44: oAmbiguPlusConfig,
		ambiguplus45: oAmbiguPlusConfig,
		ambiguplus46: oAmbiguPlusConfig,
		ambiguplus47: oAmbiguPlusConfig,
		ambiguplus48: oAmbiguPlusConfig,
		ambiguplus49: oAmbiguPlusConfig,
		ambiguplus50: oAmbiguPlusConfig,
		ambiguplus51: oAmbiguPlusConfig,
		ambiguplus52: oAmbiguPlusConfig,
		ambiguplus53: oAmbiguPlusConfig,
		ambiguplus54: oAmbiguPlusConfig,
		ambiguplus55: oAmbiguPlusConfig,
		ambiguplus56: oAmbiguPlusConfig
		
};








// ------------------------------------------------------------------------

// configuration at column level
oTableConfigurationList = {
		
		
		ambiguplus1: oConfigAmbiguPlus,
		ambiguplus2: oConfigAmbiguPlus,
		ambiguplus3: oConfigAmbiguPlus,
		ambiguplus4: oConfigAmbiguPlus,
		ambiguplus5: oConfigAmbiguPlus,
		ambiguplus6: oConfigAmbiguPlus,
		ambiguplus7: oConfigAmbiguPlus,
		ambiguplus8: oConfigAmbiguPlus,
		ambiguplus9: oConfigAmbiguPlus,
		ambiguplus10: oConfigAmbiguPlus,
		ambiguplus11: oConfigAmbiguPlus,
		ambiguplus12: oConfigAmbiguPlus,
		ambiguplus13: oConfigAmbiguPlus,
		ambiguplus14: oConfigAmbiguPlus,
		ambiguplus15: oConfigAmbiguPlus,
		ambiguplus16: oConfigAmbiguPlus,
		ambiguplus17: oConfigAmbiguPlus,
		ambiguplus18: oConfigAmbiguPlus,
		ambiguplus19: oConfigAmbiguPlus,
		ambiguplus20: oConfigAmbiguPlus,
		ambiguplus21: oConfigAmbiguPlus,
		ambiguplus22: oConfigAmbiguPlus,
		ambiguplus23: oConfigAmbiguPlus,
		ambiguplus24: oConfigAmbiguPlus,
		ambiguplus25: oConfigAmbiguPlus,
		ambiguplus26: oConfigAmbiguPlus,
		ambiguplus27: oConfigAmbiguPlus,
		ambiguplus28: oConfigAmbiguPlus,
		ambiguplus29: oConfigAmbiguPlus,
		ambiguplus30: oConfigAmbiguPlus,
		ambiguplus31: oConfigAmbiguPlus,
		ambiguplus32: oConfigAmbiguPlus,
		ambiguplus33: oConfigAmbiguPlus,
		ambiguplus34: oConfigAmbiguPlus,
		ambiguplus35: oConfigAmbiguPlus,
		ambiguplus36: oConfigAmbiguPlus,
		ambiguplus37: oConfigAmbiguPlus,
		ambiguplus38: oConfigAmbiguPlus,
		ambiguplus39: oConfigAmbiguPlus,
		ambiguplus40: oConfigAmbiguPlus,
		ambiguplus41: oConfigAmbiguPlus,
		ambiguplus42: oConfigAmbiguPlus,
		ambiguplus43: oConfigAmbiguPlus,
		ambiguplus44: oConfigAmbiguPlus,
		ambiguplus45: oConfigAmbiguPlus,
		ambiguplus46: oConfigAmbiguPlus,
		ambiguplus47: oConfigAmbiguPlus,
		ambiguplus48: oConfigAmbiguPlus,
		ambiguplus49: oConfigAmbiguPlus,
		ambiguplus50: oConfigAmbiguPlus,
		ambiguplus51: oConfigAmbiguPlus,
		ambiguplus52: oConfigAmbiguPlus,
		ambiguplus53: oConfigAmbiguPlus,
		ambiguplus54: oConfigAmbiguPlus,
		ambiguplus55: oConfigAmbiguPlus,
		ambiguplus56: oConfigAmbiguPlus

};

