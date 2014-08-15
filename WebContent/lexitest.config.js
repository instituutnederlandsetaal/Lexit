/**
 * 
 */

oHiddenTablesList = [];

/*******************************
 * 
 *  table settings list 
 *  
 *******************************/

oAmbiguPlusConfig = {
		
		"keyup" : {
			"z": function(confTable){
				$(":focus").blur();
				var nSelectedRow = fn.getActiveRowNode(confTable);
				var bChecked = fn.getDataFromCellInRowNode(confTable, nSelectedRow, "problem");
				if (bChecked == 'f' ) bChecked = false;					
				if (bChecked == 't' ) bChecked = true;
				fn.updateDatabaseGivenANode(confTable, nSelectedRow, "problem", !bChecked, false,
						function(){fn.putDataIntoCell(confTable, nSelectedRow, "problem", !bChecked);});
			},
			"enter" : function(confTable){
				$(":focus").blur();
				var nSelectedRow = fn.getFirstSelectedRowFrom(confTable);
				var id = fn.getDataFromCellInRowNode(confTable, nSelectedRow, "persistent_id");
				var url = "http://gtb.inl.nl/iWDB/search?actie=article&wdb=wnt&id="+id+"&content-type=text/html; charset=utf-8";
				window.open(url);
				
			}
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


oTableSettingsList = {
		
		
		analyzed_wordforms_and_wordforms: {
			"size": "50%"
		},
		documents:{
			"size": "50%"
		},
		
		lemmata: {
			"column_order": ["lemma_id", "is_multiple", "modern_lemma", "gloss", 
			                 "persistent_id", "lemma_part_of_speech", "ne_label", 
			                 "portmanteau_lemma_id", "language_id" ],
			                 
			"contextmenu":{
				
				"items": {
		            "wordforms": {"name": "Toon woordvormen"},
		            "wnt": {"name": "Toon GTB-artikel"}	
		        },
		        "callback": function(t, n, key, options) {

		        	if (key == 'wordforms')
		        		{
		        		var sLemId = fn.getDataFromCellInRowNode(t, n, "lemma_id");
		        		fn.callDatabase("lemmata_and_wordforms", {"lemma_id": sLemId });
		        		}
		        	else if (key == 'wnt')
		        		{		        		
		        		var id = fn.getDataFromCellInRowNode(t, n, "persistent_id");
						var url = "http://gtb.inl.nl/iWDB/search?actie=article&wdb=wnt&id="+id+"&content-type=text/html; charset=utf-8";
						window.open(url);
		        		}
		        }
			}

		},
		
		lemma_list:{
			
			"callback": function(confTable){
				
				getListOfWordformsForAllRows(confTable);				
			},
			"repeat_callback": true
		},
		
		ambiguplus: oAmbiguPlusConfig,
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
		ambiguplus56: oAmbiguPlusConfig,
		
		
		
		groups_test: {
			"callback": function(confTable){
				
				var aRows = fn.getAllRows(confTable);
				aRows.each(function(){
					var nCurrentNode = this;
					var sQuote = fn.getDataFromCellInRowNode(confTable, nCurrentNode, "quote");
					var iStart = parseInt(fn.getDataFromCellInRowNode(confTable, nCurrentNode, "onset"));
					var iEnd   = parseInt(fn.getDataFromCellInRowNode(confTable, nCurrentNode, "offset"));
					var sHighlightedQuote = fn.getHighlight(sQuote, [[iStart, iEnd]], "yellow");
					fn.putDataIntoCell(confTable, nCurrentNode, "quote", sHighlightedQuote);
				});
			},
			"repeat_callback": true
		},
		
		lemmata_simple_and_multiple2: {
			"keyup" : {
				"uparrow": function(confTable){
					callOtherTable(confTable);
					
				},
				"downarrow": function(confTable){
					callOtherTable(confTable);				
						
				}
			}
		},
		multiple_comparison :{
			"keyup" : {
				"uparrow": function(confTable){
					callOtherTable2(confTable);
					
				},
				"downarrow": function(confTable){
					callOtherTable2(confTable);				
						
				}
			}
		},
		token_attestations_and_documents:{
			"callback": function(confTable){
				
				var aRows = fn.getAllRows(confTable);
				aRows.each(function(){
					var nCurrentNode = this;
					var sQuote = fn.getDataFromCellInRowNode(confTable, nCurrentNode, "quote");
					var iStart = parseInt(fn.getDataFromCellInRowNode(confTable, nCurrentNode, "start_pos"));
					var iEnd   = parseInt(fn.getDataFromCellInRowNode(confTable, nCurrentNode, "end_pos"));
					var sHighlightedQuote = fn.getHighlight(sQuote, [[iStart, iEnd]], "yellow");
					fn.putDataIntoCell(confTable, nCurrentNode, "quote", sHighlightedQuote);
				});
			},
			"repeat_callback": true
		}
		
};


/**********************************************
 * 
 * show list of wordforms for one single lemma
 * 
 **********************************************/

function getListOfWordforms(confTable){
	
	fn.showProcessingMsg(confTable);
	
	var aAllRows = fn.getAllRows(confTable);
	
	aAllRows.each(function(){
		
		var lemmaId = fn.getDataFromCellNamed(confTable, this, "lemma_id");	
		fn.callFunction("get_wordforms", [lemmaId],	confTable, this, "wordforms");		
	});
	
	fn.removeProcessingMsg(confTable);
	
}

function getListOfWordformsForAllRows(confTable){
	
	fn.showProcessingMsg(confTable);
	
	var aAllRows = fn.getAllRows(confTable);
	var aListOfIds = new Array();
	
	aAllRows.each(function(){
		var lemmaId = fn.getDataFromCellNamed(confTable, this, "lemma_id");
		aListOfIds.push(lemmaId);
	});
	
	fn.callFunction("get_all_wordforms", [aListOfIds.join("|")], confTable, null, "wordforms");
	
	fn.removeProcessingMsg(confTable);
	
}

//**********************************************

function callOtherTable(confTable){
	var nNode = fn.getFirstSelectedRowFrom(confTable);
	var sLemma = fn.getDataFromCellInRowNode(confTable, nNode, "modern_lemma");
	var sWordform = fn.getDataFromCellInRowNode(confTable, nNode, "wordform");
	fn.callDatabase("lemmata_simple_and_multiple", {
		"modern_lemma": "^"+sLemma+"$", "wordform": "^"+sWordform+"$"
	});
}

function callOtherTable2(confTable){
	var nNode = fn.getFirstSelectedRowFrom(confTable);
	//var sLemma = fn.getDataFromCellInRowNode(confTable, nNode, "multiple_lemma");
	var sWordform = fn.getDataFromCellInRowNode(confTable, nNode, "wordform");
	fn.callDatabase("lemmata_simple_and_multiple", {
		//"multiple_lemma": "^"+sLemma+"$", 
		"wordform": "^"+sWordform+"$"
	});
}




/*******************************
 * 
 *  table configuration list 
 *  
 *******************************/


oConfigAmbiguPlus = {
	onset: {"visible": false},
	offset: {"visible": false},
	id: {"visible": false},
	persistent_id: {
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


oTableConfigurationList = {
		
		lemma_list:{
			
			pkid: {"visible": false},
			lemma_id: {"visible": false},
			modern_lemma: {"colsort": "asc"},
			wordforms: {
				"click": function(confTable, confNode){
					var lemmaId = fn.getDataFromSiblingNode(confTable, confNode, "lemma_id");
					fn.callFunction("get_all_awf_ids", [lemmaId], null, null, null, null, function(){
						var aOutput = fn.getFunctionOutput();
						fn.callDatabaseInNewTab("analyzed_wordforms_and_wordforms", {"analyzed_wordform_id": aOutput[0]});
					});
				}
			}
		},
		
		ambiguplus: oConfigAmbiguPlus,
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
		ambiguplus56: oConfigAmbiguPlus,
				
		lemmata: {
			ne_label: {"editable": true}
				   
		},
		analyzed_wordforms: {
			part_of_speech: {"choosefrom": []}
		},
		lempostemp1: {
			pos: {"choosefrom": []}
		},
		lempostemp2: {
			pos: {"choosefrom": []}
		},
		lemmata_simple_and_multiple2: {
			wordform: {
				"click": function(t,n){
					var sLemma = fn.getDataFromSiblingNode(t,n, "modern_lemma");
					var sWordform = fn.getDataFromCellNode(t,n);
					fn.callDatabase("lemmata_simple_and_multiple", {
						"modern_lemma": "^"+sLemma+"$", "wordform": "^"+sWordform+"$"
					});
				}
			}
		},
		multiple_comparison:{
			wordform: {
				"click": function(t,n){
					//var sLemma = fn.getDataFromSiblingNode(t,n, "multiple_lemma");
					var sWordform = fn.getDataFromCellNode(t,n);
					fn.callDatabase("lemmata_simple_and_multiple", {
						//"multiple_lemma": "^"+sLemma+"$", 
						"wordform": "^"+sWordform+"$"
					});
				}
			}
		},
		token_attestations:{
			quote: {
				"click": function(confTable, confNode){
					
					var docId = fn.getDataFromSiblingNode(confTable, confNode, "document_id");
					fn.callDatabase("documents", {"document_id": docId});
				}
			},
			attestation_id: {"visible": false},
			token_id: {"visible": false},
			analyzed_wordform_id:  {"visible": false},
			document_id:  {"visible": false},
			start_pos: {"visible": false},
			end_pos: {"visible": false},
			derivation_id: {"visible": false}
		},
		documents:{
			document_id: {"visible": false},
			persistent_id: {"visible": false},
			word_count: {"visible": false},
			encoding: {"visible": false},
			pub_year: {"visible": false},
			text_type: {"visible": false},
			region: {"visible": false},
			language: {"visible": false},
			other_languages: {"visible": false},
			spelling: {"visible": false},
			publishing_location: {"visible": false},
			parent_document: {"visible": false}
		},
		analyzed_wordforms_and_wordforms: {
			pkid: {"visible": false},
			analyzed_wordform_id: {"visible": false},
			quotes: {
				"button": "Toon citaat",
				"click": function(confTable, confNode){
					var awfId = fn.getDataFromSiblingNode(confTable, confNode, "analyzed_wordform_id");
					fn.callDatabase("token_attestations_and_documents", {"analyzed_wordform_id": awfId});
					}
				}
		},
		token_attestations_and_documents: {
			pkid: {"visible": false},
			document_id: {"visible": false},
			analyzed_wordform_id: {"visible": false},
			start_pos: {"visible": false},
			end_pos: {"visible": false}
		}
		
};


