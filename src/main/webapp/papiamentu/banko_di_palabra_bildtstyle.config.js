// list of tables that must be hidden or visible (don't use both, it's a matter of what's the most convenient)
oHiddenTablesList = ["buwalda_2_nije_lijst", "nije_lijst"];
oShowOnlyTables = [];




// -------------------------------------------------------------------------------------------------------------------------------

// variables for linking tool


// --------------------------------------------------------------------------------------
// We have 3 tables: a left table, a right table and a cross table.
// The user clicks on a word in the left table, which will be automatically looked up in the right table (working the other way round is allowed as well).
// If some match is found between the left table and the right table, the user presses 'Enter' to build a link between both records.
// The linkes are automatically stored in the cross table.
// --------------------------------------------------------------------------------------


// -----------------
// Entries table
// -----------------

// general 

var sEntriesTableName =				"entries";			// Entries table name in Postgres
// fields
var sIdColumn_in_EntriesTable = 		"entry_id";				// ID to store in the cross table 
var sLookUpColumn_in_EntriesTable =	"orth";				// clicking this field triggers a lookup in:
															//     - [sNijeLijstLookUpColumn] in NijeLijst table
															// and - [sCrossNijeLijstLookUpColumn] in cross table view

// -----------------
// NijeLijst table
// -----------------

// general 

var sNijeLijstTableName =				"nije_lijst";			// NijeLijst table name in Postgres
// fields
var sIdColumn_in_NijeLijstTable =		"nije_id";				// ID to store in the cross table 
var sLookUpColumn_in_NijeLijstTable = 	"nije_lijst_lem";			// clicking this field triggers a lookup in:  
															//     - [sEntriesLookUpColumn] in Entries table
															// and - [sCrossEntriesLookUpColumn] in cross table view
// -----------------
// Cross table
// -----------------

// general 

var sCrossViewName =				"buwalda_2_nije_lijst";	// view name in Postgres
// fields
var sEntriesIdColumn_in_CrossView =	"entry_id";				// ID, matching [sEntriesIdColumn] in Entries table
var sNijeLijstIdColumn_in_CrossView = 	"nije_id";				// ID, matching [sNijeLijstIdColumn] in NijeLijst table
var sEntriesLookUpColumn_in_CrossView =	"orth";			// This column is searched when the user clicks on [sLookUpColumn_in_EntriesTable]
var sNijeLijstLookUpColumn_in_CrossView =	"nije_lijst_lem";			// This column is searched when the user clicks on [sLookUpColumn_in_NijeLijstTable]



// -------------------------------------------------------------------------------------------------------------------------------


// Form configuration


var oEntriesFormConfig = {

	"size": [1600, 400],
	"definition": [30, 14],

	"searchbox_width_factor": 3,
	"align": "center",
	"buttonsbar_position": [12, 13],

	"cells": {

		"entry_id": {
			"bgcolor": "#ffeeee",
			"position": [0.5, 0.5],
			"definition": [3, 1],
			"synchronize_with": {"paradigma": "entry_id", "betekenissen": "entry_id", "voorbeelden": "entry_id"}

		},
		"gram": {
			"position": [0.5, 3],
			"definition": [3, 1],
			"click": function(t, n){

				var sTableName = fn.getTableName(t);
				var sCellName = form.getNameOfCell(n);

				var aAlreadyChosen = (form.getDataFromCell(sTableName, sCellName)).split("; ");
				var aValuesToChooseFrom = ["adj", "adp", "adv", "cconj", "det", "intj", "noun", "num", "prefix", "pron", "prontype.art", "propn", "suffix", "verb"];
				fn.promptSelect("Kies een gram", aValuesToChooseFrom, aAlreadyChosen, function(aNewChosen){

					var sNewValue = aNewChosen.join("; ");
					form.setDataInCell(sTableName, sCellName, sNewValue);
				});

			},
			"editable": false	// in formgrid only!
		},


		"orth": {
			"position": [4, 0.5],
			"definition": [3, 1],
			"editable": true	// in formgrid only!
		},
		"translation": {
			"position": [4, 3],
			"definition": [3, 1],
			"editable": true	// in formgrid only!
		},
		
		"stress": {
			"position": [4, 5.5],
			"definition": [3, 1],
			"visible": true,
			"editable": true	// in formgrid only!
		},
		"pron": {
			"position": [0.5, 5.5],
			"definition": [3, 1],
			"visible": true,
			"editable": true	// in formgrid only!
		},
		"article": {
			"position": [0.5, 8],
			"definition": [3, 1],
			"editable": true
		},
		"opmerking": {
			"position": [0.5, 10.5],
			"definition": [6.5, 1.75]
		},
		"af": {
			"position": [4, 8.5],
			"definition": [1, 1],
			"visible": true,
			"editable": true	// in formgrid only!
		}

	},
	"buttons": {

	},

	"lists": {

		"paradigma": {
			

			"position": [8, 6.5],
			"definition": [8, 5],

			"buttons": {
				"add": {
					"copy": { 
						"entry_id": {"form": "entry_id"} // get the value from the form cell 'entry_id'						
					}
				},
				"delete": true
			},


			"table": {
				"name": "paradigm",
				"displaylength": 10,
				"columns_sorting": {"gram": "asc", "orth": "asc"},

				"columns": {
					"entry_id": {
						"visible": false
					},
					"orth": {},
					"stress": {
						"visible": false
					},
					"gram": {
						"editable": false,
						"click": function(l, n){

							// get current selection
							var sCurrentGramValue = lists.getDataFromCell(l, n);
							var aAlreadyChosen = sCurrentGramValue.split("; ");

							// values to choose from
							var aValuesToChooseFrom = ["", "tense.past", "verbform.part"];

							fn.promptSelect("Kies een gram", aValuesToChooseFrom, aAlreadyChosen, 
								function(aChosenValues){
									var sNewGramValue = aChosenValues.join("; ");
									lists.setDataInCell(l, n, sNewGramValue);
								}, 
								function(){
									// do nothing
								}, 
								false);

						}
					}
				}
			}
		},


		"betekenissen": {

			"position": [8, 0.5],
			"definition": [8, 5],

			"buttons": {
				"add": {
					"copy": { 
						"entry_id": {"form": "entry_id"}, // get the value from the form cell 'entry_id'
						"sense_id": null   // sense_id is a serial type, so we keep this empty
					}
				},
				"show": {"do": {"voorbeelden": "sense_id"}}, 
				// "show": {
				// 	"do": function(l, n){
				// 		var sRowId = n.id
				// 		lists.feed("voorbeelden",  {"sense_id": sRowId} );
				// 	}
				// }, 
				"delete": true
				// "delete": {
				// 	"do": function(l, n){
				// 		console.log(l, n);
				// 	}
				// }
			},

			"table": {

				"name": "senses",
				"displaylength": 10,
				"columns_sorting": {"sense_id": "asc", "sense": "asc"},

				"columns": {
					"entry_id": {
						"visible": false
					},
					"sense_id": {
						"width": "30px"
					},
					"sense": {

					}
				}
			}

			
		},

		"voorbeelden": {

			"position": [17, 0.5],
			"definition": [12, 11],

			"buttons": {
				"add": {
					"copy": { 
						"entry_id": {"form": "entry_id"}, // get the value from the form cell 'entry_id'
						"sense_id": {"betekenissen": "sense_id"}, // get the value from the list 'betekenissen'
						"example_id": null   // example_id is a serial type, so we keep this empty
					}
				},
				"delete": true
			},

			"table": {

				"name": "examples",
				"displaylength": 10,
				"columns_sorting": {"sense_id": "asc", "quote": "asc"},

				"columns": {
					"entry_id": {
						"visible": false
					},
					"sense_id": {
						"width": "30px"
						//"visible": false
					},
					"example_id": {
						"visible": false
					},
					"quote": {

					},
					"translation_id": {
						"visible": false
					},
					"translation": {

					}
				}
			}			

		}
	}
};


// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
//
// Table config or setting SETTERS
//
// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


// first some re-usable functions


// for adding/deleting entries lemmata  
//
fnNewEntry = function(t){

		// make sure focus is gone from buttons, otherwise striking Enter will have confusing effect!
		var $focused = $(':focus');
		$focused.blur();

		fn.prompt("Nieuw lemma aanmaken", ["lemma", "lemma_pos"], [], function(resp){ 

			var args = [ 	resp["lemma"], 
							resp["lemma_pos"] 
						];
			fn.callFunction("data.add_entry", args, 
				function(){

					fn.addDrawCallback(t, function(){
						setTimeout(function(){

							if (fn.getViewType(t) == 'table'){

								fn.unselectAllRowNodes(t);
								var nRow = fn.getRowNodeWhere(t, {"orth": resp["lemma"]});
								fn.selectRowNode(nRow);

								if (fn.tableExists("senses")){
									setTimeout(function(){

										var entryId = fn.getDataFromCellInRowNode(nRow, "entry_id");
							
										fn.callTable("senses", {"entry_id": entryId}, function(){
											fn.callTable("examples", {"entry_id": entryId}, function(){
												
												if ( fn.tableExists("paradigm")){
													fn.callTable("paradigm", {"entry_id": entryId}, function(){
														fn.pileupTables("senses", "paradigm");													
													});
												}
											});
										});
									}, 500);
								}
							}
							
						}, 500);
					});

					if (fn.getViewType(t) == 'table'){
						fn.goToTheRightPage(t, "orth", "^"+resp["lemma"]);
					}
					else { 
						fn.callTable(t, {"orth": "^"+resp["lemma"]+"$"});
					}
					
				},
				function(err){
					fn.message("Fout", "Er ging iets mis!", function(){fn.refreshTable(t);});
				});

		});
};

fnRemoveEntry = function(t){

	var sTableName = fn.getTableName(t);
	var sViewType = fn.getViewType(t);
	var iNumberSelected = fn.getNumberOfSelectedRowNodes(t);

	if (sViewType == 'form' && iNumberSelected!= 1){
		fn.selectRowNode(t, 0);
	}
	var nRow = fn.getFirstSelectedRowNodeFrom(t);


	if (sViewType == 'table' && (nRow == null || iNumberSelected!=1) ){
		fn.message("Fout", "Selecteer één rij om te verwijderen!");
	}
	else {

		var sOrth = fn.getDataFromCellInRowNode(nRow, "orth");

		fn.confirm("Let op!", "De geselecteerde entry '"+sOrth+"' zal worden verwijderd.<BR><BR>Weet u het zeker?", function(t){

			var sEntryId = fn.getRowNodeId(nRow);
			fn.callFunction("data.remove_entry", [sEntryId], 
				function(){
					setTimeout(function(){
						fn.refreshTable(sTableName);
					}, 200);
				});

		},
		function(){
			fn.message("Ok", "Operatie door gebruiker geannuleerd.");
		});

	}						
};


// for adding/deleting Nije Lemmata 
//
fnNewNijeLem = function(t){

	// make sure focus is gone from buttons, otherwise striking Enter will have confusing effect!
	var $focused = $(':focus');
	$focused.blur();

	fn.prompt("Nieuw lemma aanmaken", ["lemma", "part-of-speech"], [], function(resp){

		var args = [ resp["lemma"], resp["part-of-speech"] ];
		fn.callFunction("data.add_nije_lem", args, 
			function(){

				fn.addDrawCallback(t, function(){
					setTimeout(function(){
						fn.unselectAllRowNodes(t);
						var nRow = fn.getRowNodeWhere(t, {"nije_lijst_lem": resp["lemma"]});
						fn.selectRowNode(nRow);
					}, 500);
				});
				fn.goToTheRightPage(t, "nije_lijst_lem", resp["lemma"]);
				
			},
			function(err){
				fn.message("Fout", "Er ging iets mis!", function(){fn.refreshTable(t);});
			});

	});
};

fnRemoveNijeLem = function(t){

	var sTableName = fn.getTableName(t);
	var iNumberSelected = fn.getNumberOfSelectedRowNodes(t);
	var nRow = fn.getFirstSelectedRowNodeFrom(t);

	if ( nRow == null || iNumberSelected!=1 ){
		fn.message("Fout", "Selecteer één rij om te verwijderen!");
	}
	else {

		var sNijeLem = fn.getDataFromCellInRowNode(nRow, "nije_lijst_lem");

		fn.confirm("Let op!", "Het geselecteerde lemma '"+sNijeLem+"' zal worden verwijderd.<BR><BR>Weet u het zeker?", function(t){

			var sNijeLemId = fn.getRowNodeId(nRow);
			fn.callFunction("data.remove_nije_lem", [sNijeLemId], 
				function(){
					setTimeout(function(){
						fn.refreshTable(sTableName);
					}, 200);
				}, 
				function(err){
					fn.message("Fout", "Als een lemma gelinkt is, kan het niet verwijderd worden!", function(){fn.refreshTable(t);});
				});

		},
		function(){
			fn.message("Ok", "Operatie door gebruiker geannuleerd.");
		});

	}
};


// for adding/deleting paradigm form (in normal mode only) 
//
fnNewParadigm = function(t){

	// make sure focus is gone from buttons, otherwise striking Enter will have confusing effect!
	var $focused = $(':focus');
	$focused.blur();

	var oRow = fx.getFirstSelectedRowFrom("entries");

	if (oRow.count()!=1){
		fn.message("Let op!", "Om een nieuwe vorm aan een lemma toe te voegen,<BR><BR>moet u eerst een lemmata in de 'entries' tabel selecteren.");
	}
	else {

		var sEntryId = fx.getDataFromCellInRow(oRow, "entry_id");

		fn.prompt("Nieuw vorm aanmaken", ["form", "form_pos"], [], function(resp){ 

			var args = [ 	sEntryId,
							resp["form"], 
							resp["form_pos"] 
						];
			fn.callFunction("data.add_paradigm_to", args, 
				function(){
					fn.refreshTable(t);					
				},
				function(err){
					fn.message("Fout", "Er ging iets mis!", function(){fn.refreshTable(t);});
				});

		});

	}	
};

fnRemoveParadigm = function(t){

	var sTableName = fn.getTableName(t);
	var iNumberSelected = fn.getNumberOfSelectedRowNodes(t);
	var nRow = fn.getFirstSelectedRowNodeFrom(t);

	if ( nRow == null || iNumberSelected!=1 ){
		fn.message("Fout", "Selecteer één rij om te verwijderen!");
	}
	else {

		var sParadigmForm = fn.getDataFromCellInRowNode(nRow, "orth");

		fn.confirm("Let op!", "De geselecteerde vorm '"+sParadigmForm+"' zal worden verwijderd.<BR><BR>Weet u het zeker?", function(t){

			var sParadigmId = fn.getRowNodeId(nRow);
			fn.callFunction("data.remove_paradigm", [sParadigmId], 
				function(){
					setTimeout(function(){
						fn.refreshTable(sTableName);
					}, 200);
				});

		},
		function(){
			fn.message("Ok", "Operatie door gebruiker geannuleerd.");
		});

	}
};



// for adding/deleting senses (in normal mode only) 
//
fnNewSense = function(t){

	// make sure focus is gone from buttons, otherwise striking Enter will have confusing effect!
	var $focused = $(':focus');
	$focused.blur();

	var oRow = fx.getFirstSelectedRowFrom("entries");

	if (oRow.count()!=1){
		fn.message("Let op!", "Om een nieuwe betekenis aan een lemma toe te voegen,<BR><BR>moet u eerst een lemmata in de 'entries' tabel selecteren.");
	}
	else {

		var sEntryId = fx.getDataFromCellInRow(oRow, "entry_id");

		fn.prompt("Nieuwe betekenis aanmaken", ["sense"], [], function(resp){ 

			var args = [ 	sEntryId,
							resp["sense"] 
						];
			fn.callFunction("data.add_sense_to", args, 
				function(){
					fn.refreshTable(t);					
				},
				function(err){
					fn.message("Fout", "Er ging iets mis!", function(){fn.refreshTable(t);});
				});

		});

	}	
};

fnRemoveSense = function(t){

	var sTableName = fn.getTableName(t);
	var iNumberSelected = fn.getNumberOfSelectedRowNodes(t);
	var nRow = fn.getFirstSelectedRowNodeFrom(t);

	if ( nRow == null || iNumberSelected!=1 ){
		fn.message("Fout", "Selecteer één rij om te verwijderen!");
	}
	else {

		var sSense = fn.getDataFromCellInRowNode(nRow, "sense");

		fn.confirm("Let op!", "De geselecteerde betekenis '"+sSense+"' zal worden verwijderd.<BR><BR>Weet u het zeker?", function(t){

			var sSenseId = fn.getRowNodeId(nRow);
			fn.callFunction("data.remove_sense", [sSenseId], 
				function(){
					setTimeout(function(){
						fn.refreshTable(sTableName);
					}, 200);
				});

		},
		function(){
			fn.message("Ok", "Operatie door gebruiker geannuleerd.");
		});

	}
};



// for adding/deleting examples (in normal mode only) 
//
fnNewExample = function(t){

	// make sure focus is gone from buttons, otherwise striking Enter will have confusing effect!
	var $focused = $(':focus');
	$focused.blur();

	var oRow = fx.getFirstSelectedRowFrom("senses");

	if (oRow.count()!=1){
		fn.message("Let op!", "Om een nieuwe voorbeeld bij een betekenis toe te voegen,<BR><BR>moet u eerst een 'sense_id' in de 'senses' tabel selecteren.");
	}
	else {

		var sEntryId = fx.getDataFromCellInRow(oRow, "entry_id");
		var sSenseId = fx.getDataFromCellInRow(oRow, "sense_id");

		fn.prompt("Nieuw voorbeeld aanmaken", ["example"], [], function(resp){ 

			var args = [ 	sEntryId,
							sSenseId,
							resp["example"] 
						];
			fn.callFunction("data.add_example_to", args, 
				function(){
					fn.refreshTable(t);					
				},
				function(err){
					fn.message("Fout", "Er ging iets mis!", function(){fn.refreshTable(t);});
				});

		});

	}	
};

fnRemoveExample = function(t){

	var sTableName = fn.getTableName(t);
	var iNumberSelected = fn.getNumberOfSelectedRowNodes(t);
	var nRow = fn.getFirstSelectedRowNodeFrom(t);

	if ( nRow == null || iNumberSelected!=1 ){
		fn.message("Fout", "Selecteer één rij om te verwijderen!");
	}
	else {

		var sExample = fn.getDataFromCellInRowNode(nRow, "quote");

		fn.confirm("Let op!", "Het geselecteerd voorbeeld '"+sExample+"' zal worden verwijderd.<BR><BR>Weet u het zeker?", function(t){

			var sExampleId = fn.getRowNodeId(nRow);
			fn.callFunction("data.remove_example", [sExampleId], 
				function(){
					setTimeout(function(){
						fn.refreshTable(sTableName);
					}, 200);
				});

		},
		function(){
			fn.message("Ok", "Operatie door gebruiker geannuleerd.");
		});

	}
};




// ------------------
// settings getter
// ------------------

getSettingFor = function(sTableName, bLinkingTool){


	if (sTableName == 'entries'){

		// linking tool mode

		if (bLinkingTool){

			return {

				"exact_count": true,
				"main_search": false,
				"draggable": false,
				"main_search": false,
				"replace_button": false,
				"selection_button": false,
				"columns_button": false,

				"exact_count": true,
				"columns_sorting": {"orth": "asc", "entry_id": "asc"},
				"columns_order": ["file_id", "entry_id", "orth", "translation", "gram", "article", "opmerking", "linked",  "orig", "type",  "stress", "pron", "koppeling", "af"],
				"formgrid": oEntriesFormConfig,

				"keyup": oKeyForBuildingLinks,
				"viewtype": "table",
				"width": "50%",

				"close_callback": function(t){

					// close other tables

					fn.closeTable("nije_lijst");
					fn.closeTable("buwalda_2_nije_lijst");

					// restore default config upon close

					oTableSettingsList["entries"] = getSettingFor("entries", false);
					oTableSettingsList["nije_lijst"] = getSettingFor("nije_lijst", false);
					oTableSettingsList["buwalda_2_nije_lijst"] = getSettingFor("buwalda_2_nije_lijst", false);

					oTableConfigurationList["entries"] = getConfigFor("entries", false);
					oTableConfigurationList["nije_lijst"] = getConfigFor("nije_lijst", false);
					oTableConfigurationList["buwalda_2_nije_lijst"] = getConfigFor("buwalda_2_nije_lijst", false);
				},

				"button_0": {

					"name": "Nieuwe entry",
					"click": function(t){ fnNewEntry(t); }
				},
				"button_1": {
					"name": "Verwijder entry",
					"click": function(t){ fnRemoveEntry(t); }
				}

			}
		}

		// normal mode

		else {

			return {
				
				"exact_count": true,
				"draggable": false,
				"main_search": false,
				"replace_button": false,
				"selection_button": false,
				"columns_button": false,

				"columns_sorting": {"orth": "asc", "entry_id": "asc"},
				"columns_order": ["file_id", "entry_id", "orig", "type", "orth", "article", "translation", "gram", "stress", "pron", "koppeling", "opmerking", "linked", "af"],
				"formgrid": oEntriesFormConfig,

				"keyup": {},
				"viewtype": "table",	
				"width": "100%",

				"button_0": {

					"name": "Nieuwe entry",
					"click": function(t){ fnNewEntry(t); }
				},
				"button_1": {
					"name": "Verwijder entry",
					"click": function(t){ fnRemoveEntry(t); }
				},
				"button_2": {
					"name": "Toon paradigma",
					"bgcolor": "#47AA42",
					"click": function(t){
						var n = fn.getActiveRowNode(t);
						var entryId = fn.getDataFromCellInRowNode(n, "entry_id");	
						fn.callTable("paradigm", {"entry_id": entryId}, function(){
							fn.pileupTables("senses", "paradigm");
						});
					}
				},

				"callback": function(t){
					fn.addCss("td.entry_id  {text-align: center;}"); 
					fn.addCss("td.entry_id button {background-color: #005AA6; color: #FFD204;}"); // bildts flag blue and yellow
				},
				"repeat_callback": true,

				"keyup": {
					"uparrow": function(t){

						var iLength = fn.getCurrentDisplayLength(t);
						var iPos = kf.getActiveRowNumber();

						if (iPos==iLength-1){
							fn.addDrawCallback(t, function(){
								fnSynchronizeTables(fn.getTableName(t));
							});
						}
						else {
							fnSynchronizeTables(t);
						}
					},
					"downarrow": function(t){

						var iPos = kf.getActiveRowNumber();
						if (iPos==0){
							fn.addDrawCallback(t, function(){
								fnSynchronizeTables(fn.getTableName(t));
							})
						}
						else {
							fnSynchronizeTables(t);
						}
							
					}
				}
			}
		}
	}
	
	if (sTableName == 'nije_lijst'){

		// linking tool mode

		if (bLinkingTool){

			return {

				"nice_name": "nije_list",

				"viewtype_button": false,
				"main_search": false,
				"draggable": false,
				"main_search": false,
				"viewtype_button": false,
				"replace_button": false,
				"selection_button": false,
				"columns_button": false,
	
				"exact_count": true,
				"columns_sorting": 	{"nije_lijst_lem": "asc"},
				"keyup": 			oKeyForBuildingLinks,
				"width": "47%",

				"columns_order": [
					"nije_id", "nije_lijst_lem", "nije_lijst_pos", "lemma_gigpos", "opmerking", "linked" 
				],

				"button_0": {

					"name": "Nieuw lemma",
					"click": function(t){ fnNewNijeLem(t); }
				},
				"button_1": {
					"name": "Verwijder lemma",
					"click": function(t){ fnRemoveNijeLem(t); }
				}
			}
		}

		// normal mode

		else {

			return {

				"nice_name": "nije_list",
		
				"draggable": false,
				"main_search": false,
				"exact_count": true,
				"viewtype_button": false,
				"replace_button": false,
				"selection_button": false,
				"columns_button": false,

				"columns_order": [
					"nije_id", "nije_lijst_lem", "nije_lijst_pos", "lemma_gigpos", "opmerking", "linked" 
				]
			}

		}
	}

	if (sTableName == 'buwalda_2_nije_lijst'){

		// linking tool mode

		if (bLinkingTool){

			return {

				"nice_name": "buwalda_2_nije_list",

				"main_search": false,
				"draggable": false,
				"main_search": false,
				"viewtype_button": false,
				"replace_button": false,
				"selection_button": false,
				"columns_button": false,

				"exact_count": true,
				"columns_sorting": 	{"orth": "asc"},
				"columns_order": ["nije_id", "nije_lijst_lem", "file_id", "entry_id", "orth", "gram", "link_type"],
				"keyup": 			oKeyForBuildingLinks,
				"width": "97%",

				"button_0": {
					
					"name": "Link ongedaan maken",
					"click": function(t){
						undoLink();
					}
				}		
			}
		}

		// normal mode

		else {

			return {

				"nice_name": "buwalda_2_nije_list",

				"exact_count": true,
				"draggable": false,
				"main_search": false,
				"viewtype_button": false,
				"replace_button": false,
				"selection_button": false,
				"columns_button": false,
				"columns_order": ["nije_id", "nije_lijst_lem", "file_id", "entry_id", "orth", "gram", "link_type"],
			}

		}
	}
};



// ------------------
// Config setter
// ------------------


getConfigFor = function(sTableName, bLinkingTool){


	if (sTableName == 'entries'){

		// linking tool mode

		if (bLinkingTool){

			return {

				"koppeling": {
					"visible": false
				},

				"entry_id": {
					"bgcolor": "#F8E0E0"
				},

				"file_id": {
					"visible": false
				},

				"type": {
					"visible": false
				},

				"orth": {
				
					"bgcolor": "#ECF8E0",
					"nice_name": "lemma",

					"click": function( t, nCell ){
		
						var sValue = fn.getDataFromCellNode( nCell );
						
						// look up in cross table
						
						var oLookUp = new Array();
						oLookUp[ sEntriesLookUpColumn_in_CrossView ] = "^"+sValue;
						
						fn.callDatabase( sCrossViewName, oLookUp );
						
						
						// and look up in WNT table
						
						// we need to build a callback function to be able to select a matching row automatically 
						// just after the following fn.goToTheRightPage has been called
						// fn.addDrawCallback( sNijeLijstTableName, function(){
							
						// 	// small delay, because in some rare cases, the callback is called so fast that 
						// 	// fn.getAllRowNodesWhere malfunction because the needed data is not loaded yet!
							
						// 	var oLookUpArr = new Array();
						// 	oLookUpArr[ sLookUpColumn_in_NijeLijstTable ] = sValue;
							
						// 	var nRow = fn.getAllRowNodesWhere( sNijeLijstTableName, oLookUpArr, true );
							
						// 	// if there is some exact match, select the right row straight away
						// 	if (nRow != null && nRow.length > 0) {
						// 		var iRowNumber = fn.getRowNodeNumberOnScreen( nRow[0] );
						// 		fn.selectRowNode( sNijeLijstTableName, iRowNumber );
						// 	}
						// });
						
						// go to the right page (the callback will be triggered by that)
						
						// fn.goToTheRightPage( sNijeLijstTableName, sLookUpColumn_in_NijeLijstTable, "^"+sValue );
					}
				},

				"gram": {
					"nice_name": "lemma_pos"
				},

				"translation": {
					"nice_name": "Dutch"
				},

				"orig": {
					"choosefrom": ["", "Buwalda", "WBA"] // WBA is a label for new own lemmata
				},

				"stress": {
					"visible": false
				},
				"pron": {
					"visible": false
				},
				"opmerking": {
					"editable": true,
					"bgcolor": "#CED8F6"
				},
				"af": {
					"visible": false,
					"editable": true
				}
		
			}

		}

		// normal mode

		else {

			return {

				"article": {
					"editable": true
                },

				"koppeling": {
					"nice_name": "nije_lijst_koppeling",
					"visible": true
				},
				"type": {
					"visible": false
				},

				"file_id": {
					"visible": false,
					"click": function(t, n){
						var fileId = fn.getDataFromCellNode(n);
						fn.callTable("metadata", {"file_id": fileId });
					}
				},

				"entry_id": {

					"width": "50px",
					//"button_tooltip": "Klik om corresponderende senses, examples enz. op te zoeken",
					//"button": "Toon betekenissen + paradigma",
					"bgcolor": "#FFD204", // bildts flag yellow
					"click": function(t, n){
					 	var entryId = fn.getDataFromCellNode(n);
						
					 	fn.callTable("senses", {"entry_id": entryId}, function(){
					 		fn.callTable("examples", {"entry_id": entryId}, function(){
								
								fn.alignTables("senses", "examples");

								if (fn.tableExists("paradigm")){
									 fn.callTable("paradigm", {"entry_id": entryId}, function(){										 
										 fn.pileupTables("senses", "paradigm");
									});
								}
					 			
					 		});
					 	});
					},
					
				},

				"gram": {
					"nice_name": "lemma_pos",
					"click": function(t, n){
						
						var aAlreadyChosen = ( fn.getDataFromCellNode(n) ).split("; ");
						var aValuesToChooseFrom = ["adj", "adp", "adv", "cconj", "det", "intj", "noun", "num", "prefix", "pron", "prontype.art", "propn", "suffix", "verb"];
						fn.promptSelect("Kies een gram", aValuesToChooseFrom, aAlreadyChosen, function(aNewChosen){

							var sNewValue = aNewChosen.join("; ");
							fn.updateTableGivenANode(n, {"gram": sNewValue}, 
								function(){
									fn.refreshTable("entries");
								},
								function(err){
									fn.message("Let op", "Originele Buwalda informatie mag niet gewijzigd worden.", function(){fn.refreshTable("entries");});
								}
							);
						});
					}
				},
				"orth": {
					"nice_name": "lemma",
					"editable": true,
					"editerrorhandler": function(err){
						fn.message("Let op", "Originele Buwalda informatie mag niet gewijzigd worden.", function(){fn.refreshTable("entries");});
					}
				},
				"translation": {
					"nice_name": "Nederlands",
					"bgcolor": "#F8E0E0",
					"editable": true,
					"editerrorhandler": function(err){
						fn.message("Let op", "Originele Buwalda informatie mag niet gewijzigd worden.", function(){fn.refreshTable("entries");});
					}
				},
				"stress": {
					"editable": true,
					"editerrorhandler": function(err){
						fn.message("Let op", "Originele Buwalda informatie mag niet gewijzigd worden.", function(){fn.refreshTable("entries");});
					}
				},
				"pron": {
					"editable": true,
					"editerrorhandler": function(err){
						fn.message("Let op", "Originele Buwalda informatie mag niet gewijzigd worden.", function(){fn.refreshTable("entries");});
					}
				},
				"opmerking": {
					"editable": true,
					"bgcolor": "#CED8F6"
				},
				"af": {
					"editable": true
				},
				"orig": {
					"choosefrom": []
				}
			}
		}

	}
	
	if (sTableName == 'nije_lijst'){

		// linking tool mode

		if (bLinkingTool){

			return {

				"nije_id": {

					"bgcolor": "#F8E0E0"
				},

				"opmerking": {
					"editable": true
				},

				"nije_lijst_pos": {
					"nice_name": "nije_list_pos",
					"editable": true
				},

				"nije_lijst_lem": {

					"bgcolor": "#ECF8E0",

					"nice_name": "nije_list_lem",
					"click": function( t, nCell ){
			
						var sValue = fn.getDataFromCellNode( nCell );
						
						// look up in cross table
						
						var oLookUp = new Array();
						oLookUp[ sNijeLijstLookUpColumn_in_CrossView ] = "^"+sValue;
						
						fn.callDatabase( sCrossViewName, oLookUp );
						
						
						// and look up in MNW table
						
						// we need to build a callback function to be able to select a matching row automatically 
						// just after the following fn.goToTheRightPage has been called
						
						// fn.addDrawCallback( sEntriesTableName, function(){
							
						// 	// small delay, because in some rare cases, the callback is called so fast that 
						// 	// fn.getAllRowNodesWhere malfunction because the needed data is not loaded yet!
							
						// 	setTimeout(function(){}, 100);
							
						// 	var oLookUpArr = new Array();
						// 	oLookUpArr[ sLookUpColumn_in_EntriesTable ] = sValue;
							
						// 	var nRow = fn.getAllRowNodesWhere( sEntriesTableName, oLookUpArr, true );

							
						// 	// if there is some exact match, select the right row straight away
						// 	if (nRow != null && nRow.length > 0)
						// 		{
						// 		var iRowNumber = fn.getRowNodeNumberOnScreen( nRow[0] );
						// 		fn.selectRowNode( sEntriesTableName, iRowNumber );
						// 		}
						// });

						// go to the right page (the callback will be triggered by that)
						
						// fn.goToTheRightPage( sEntriesTableName, sLookUpColumn_in_EntriesTable, "^"+sValue );
						
					}
				}
		
			}


		}

		// normal mode

		else {

			return {
		
			}

		}

	}

	if (sTableName == 'buwalda_2_nije_lijst'){

		// linking tool mode

		if (bLinkingTool){

			return {

				"file_id": {
					"visible": false
				},

				"entry_id": {
					"bgcolor": "#F8E0E0"
				},

				"nije_id": {
					"bgcolor": "#F8E0E0"
				},

				"orth": {
					"nice_name": "lemma",
					"bgcolor": "#ECF8E0"
				},

				"gram": {
					"nice_name": "lemma_pos"
				},

				"nije_lijst_lem": {
					"nice_name": "nije_list_lem",
					"bgcolor": "#ECF8E0"
				},

				"link_type": {
					"choosefrom": ["", "Automatic: lem & pos match", "Automatic: lem unique", "Manual"]
				}
			}

		}

		// normal mode

		else {

			return {

				"file_id": {
					"visible": false
				}
		
			}

		
		}
	}


};

// ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// table general settings

oTableSettingsList = {

	"log": {
		"draggable": false,
		"replace_button": false,
		"selection_button": false,
		"columns_button": false,
		"exact_count": true,

		"columns_sorting": {"modification_time": "desc"}
	},


	// link app config part 

	"start_linking": {

		"group": "Linking app",

		"callback": function(t){

			oTableSettingsList["entries"] = getSettingFor("entries", true);
			oTableSettingsList["nije_lijst"] = getSettingFor("nije_lijst", true);
			oTableSettingsList["buwalda_2_nije_lijst"] = getSettingFor("buwalda_2_nije_lijst", true);

			oTableConfigurationList["entries"] = getConfigFor("entries", true);
			oTableConfigurationList["nije_lijst"] = getConfigFor("nije_lijst", true);
			oTableConfigurationList["buwalda_2_nije_lijst"] = getConfigFor("buwalda_2_nije_lijst", true);


			var aPos = fn.getTablePosition("start_linking");

			setTimeout(function(){

				$("div#start_linking_dynamic").css("display", "none");


				// build linking GUI

				fn.callTable("nije_lijst", {}, function(){
					fn.callTable("entries", {}, function(){
						fn.alignTables("nije_lijst", "entries", function(){
							fn.callTable("buwalda_2_nije_lijst", {}, function(){
								fn.pileupTables("nije_lijst", "buwalda_2_nije_lijst", function(){

									// get rid of close buttons
									$("#buwalda_2_nije_lijst_tableclosebutton").find("button").css("display", "none");
									$("#buwalda_2_nije_lijst_tableclosebutton").append($("<span></span>").html("&nbsp;&nbsp;"));
									$("#nije_lijst_tableclosebutton").find("button").css("display", "none");
									$("#nije_lijst_tableclosebutton").append($("<span></span>").html("&nbsp;&nbsp;"));

								});
								fn.closeTable("start_linking");

								// make sure we always know which cell was the last clicked upon
								$("td").click(function(){
									lastClicked = this;
								});
							});
						});
					});
				}, aPos);

			}, 500);
		}
	},


	// Entries table

	"entries": getSettingFor("entries", false),

	// NijeLijst table

	"nije_lijst": getSettingFor("nije_lijst", false),


	// cross table

	"buwalda_2_nije_lijst": getSettingFor("buwalda_2_nije_lijst", false), 
	
	// {

	// 	"columns_sorting": 	{"orth": "asc"},
	// 	"keyup": 			oKeyForBuildingLinks,
	// 	"width": "97%",

	// 	"button_0": {
			
	// 		"name": "Link ongedaan maken",
	// 		"click": function(t){
	// 			undoLink();
	// 		}
	// 	}		
	// },


	// --------------------------------------------------------------------------------------------------------

	"metadata": {
		"exact_count": true,
		"draggable": false,
		"main_search": false,
		"viewtype_button": false,
		"replace_button": false,
		"selection_button": false,
		"columns_button": false,

		"columns_sorting": {"file_id": "asc"},
	},
	

	"senses": {
		
		"exact_count": true,
		"draggable": false,
		"main_search": false,
		"viewtype_button": false,
		"replace_button": false,
		"selection_button": false,
		"columns_button": false,

		"size": "50%",
		"columns_sorting": {"sense": "asc", "sense_id": "asc"},

		"button_0": {

			"name": "Nieuwe betekenis",
			"click": function(t){
				fnNewSense(t);
			}
		},
		"button_1": {

			"name": "Verwijder betekenis",
			"click": function(t){
				fnRemoveSense(t);
			}
		},

		"callback": function(t){
			fn.addCss("td.button  {text-align: center;}"); 
			fn.addCss("td.button button {background-color: #005AA6; color: #FFD204;}"); // bildts flag blue and yellow

			// set the table height
			$("#senses_dynamic").css("min-height", "300px");
		},
		"repeat_callback": true

	},

	"examples": {
		
		"exact_count": true,
		"draggable": false,
		"main_search": false,
		"viewtype_button": false,
		"replace_button": false,
		"selection_button": false,
		"columns_button": false,
		"columns_sorting": {"sense_id": "asc", "example_id": "asc"},

		"size": "50%",
		

		"button_0": {

			"name": "Nieuw voorbeeld",
			"click": function(t){
				fnNewExample(t);
			}
		},
		"button_1": {

			"name": "Verwijder voorbeeld",
			"click": function(t){
				fnRemoveExample(t);
			}
		},

		"callback": function(t){

			// set the table height
			$("#examples_dynamic").css("min-height", "300px");

			// put border between different senses
			var oRows = fx.getAllRows(t);

			var sLastSenseId = "";
			oRows.every(function(){
				var oThisRow = this;
				var sThisSenseId = fx.getDataFromCellInRow(oThisRow, "sense_id");

				if (sLastSenseId != '' && sLastSenseId != sThisSenseId){
					var aCols = mt.getListOfVisibleColumnsOf("examples");
					for (var i=0; i<aCols.length; i++){
						var sColumnName = aCols[i];
						var nCell = fx.getCellNode(oThisRow, sColumnName);
						$(nCell).css("border-top", "1px solid black");
					}
				}

				sLastSenseId = sThisSenseId; 
			});
		},
		"repeat_callback": true

	},

	"paradigm": {
		
		"exact_count": true,
		"draggable": false,
		"main_search": false,
		"viewtype_button": false,
		"replace_button": false,
		"selection_button": false,
		"columns_button": false,
		
		"size": "50%",
		"columns_sorting": {"orth": "asc", "entry_id": "asc"},

		"button_0": {

			"name": "Nieuwe vorm",
			"click": function(t){
				fnNewParadigm(t);
			}
		},
		"button_1": {

			"name": "Verwijder vorm",
			"click": function(t){
				fnRemoveParadigm(t);
			}
		}

	}

};




// configuration at column level


oTableConfigurationList = {

	"entries": getConfigFor("entries", false),

	"nije_lijst": getConfigFor("nije_lijst", false),

	"buwalda_2_nije_lijst": getConfigFor("buwalda_2_nije_lijst", false),

	"metadata": {
		"file_id": {
			"bgcolor": "lightgrey",
			"click": function(t, n){
				var fileId = fn.getDataFromCellNode(n);

				var bAllReadyLoaded = fn.tableExists("entries");

				if (bAllReadyLoaded){
					fn.addDrawCallback("entries", function(){

						fn.unselectAllRowNodes("entries");
						setTimeout(function(){
							var nRow = fn.getRowNodeWhere("entries", {"file_id": fileId} );	
							
							fn.selectRowNode( nRow );
						}, 1000);
					});
					
					fn.goToTheRightPage("entries", "file_id", fileId);

				}
				else {

					fn.callTable("entries", null, function(){
					
						setTimeout(function(){
						
							fn.addDrawCallback("entries", function(){

								fn.unselectAllRowNodes("entries");
								setTimeout(function(){
									var nRow = fn.getRowNodeWhere("entries", {"file_id": fileId} );	
								
									fn.selectRowNode( nRow );
								}, 1000);
							});
					
							fn.goToTheRightPage("entries", "file_id", fileId);

						}, 500);
					});
				}
			}
		}
	},	

	"senses": {

		"button": {
			"width": "250px",
			"button_tooltip": "Klik om corresponderende voorbeelden op te zoeken",
			"button": "Toon voorbeelden voor deze betekenis",
			//"bgcolor": "#FFD204", // bildts flag yellow
			"click": function(t, n){
				var senseId = fn.getDataFromSiblingNode(n, "sense_id");				
				fn.callTable("examples", {"sense_id": senseId}, function(){
					//fn.scrollToTable("examples");
				});					
			}
		},

		"entry_id": {
			"visible": false,
			"cell_tooltip": "Klik om corresponderende entry op te zoeken",
			"bgcolor": "lightgrey",
			"click": function(t, n){
				var entryId = fn.getDataFromCellNode(n);
				fn.callTable("entries", {"entry_id": entryId}, function(){
					fn.scrollToTable("entries");
				});					
			}
		},

		"sense_id": {
			
		},

		"sense": {
			"editable": true
		}

	},

	"examples": {

		"entry_id": {
			"visible": false,
			"cell_tooltip": "Klik om corresponderende entry op te zoeken",
			"bgcolor": "lightgrey",
			"click": function(t, n){
				var entryId = fn.getDataFromCellNode(n);
				fn.callTable("entries", {"entry_id": entryId}, function(){
					//fn.scrollToTable("entries");
				});	
				
			}
		},
		"quote": {
			"nice_name": "example",
			"editable": true
		},
		"translation": {
			"editable": true
		},
		"example_id": {
			"visible": false
		}

	},

	"paradigm": {

		"entry_id": {
			"visible": false,
			"cell_tooltip": "Klik om corresponderende entry op te zoeken",
			"bgcolor": "lightgrey",
			"click": function(t, n){
				var entryId = fn.getDataFromCellNode(n);
				fn.callTable("entries", {"entry_id": entryId}, function(){
					//fn.scrollToTable("entries");
				});	
				
			}
		},

		"gram": {
			"nice_name": "form_pos",
			"editable": true
		},
		"orth": {
			"nice_name": "form",
			"editable": true
		},
		"stress": {
			"editable": true
		}

	}
};




// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------



// function for linking tool


// -----------------
// Global 
// -----------------

// Key function to be assigned to 'keyup' event in all tables,
// enabling the user to build a link between selected records.

var oKeyForBuildingLinks = {
	
	"enter": function( t ){
		buildLink();
	}
};



// --------------------------------------------------------------------------------------
// FUNCTIONS (AS GENERIC AS POSSIBLE)
// --------------------------------------------------------------------------------------

// Build a link, given some selected row(s) in the Entries table 
//               and some selected row(s) in the NijeLijst table.

function buildLink(){

	// editable cell was just clicked (edited): Enter was probably stricken after edition, so linking is not intended here
	if ($(lastClicked).hasClass("opmerking") || $(lastClicked).hasClass("nije_lijst_pos"))
		return true;
	
	// get the selected rows on both sides
	
	var oSelectedRowsEntries = 	fx.getSelectedRowsFrom( sEntriesTableName );
	var oSelectedRowsNijeLijst =	fx.getSelectedRowsFrom( sNijeLijstTableName );
	
	
	// loop through selected rows on Entries side
	
	oSelectedRowsEntries.every(function(){
		
		var oEntriesRow = this;		
		var sEntriesId = 		fx.getDataFromCellInRow( oEntriesRow, sIdColumn_in_EntriesTable );
		var sEntriesFileId = 	fx.getDataFromCellInRow( oEntriesRow, "file_id" );
		var sEntriesLem = 		fx.getDataFromCellInRow( oEntriesRow, "orth" );
		var sEntriesGram = 	fx.getDataFromCellInRow( oEntriesRow, "gram" );		
		var bLastEntriesRow =	fx.isLastRowOf( oEntriesRow, oSelectedRowsEntries );

		fx.updateDatabaseGivenACellOrRow(oEntriesRow, {"linked": true});
		
		// loop through selected rows on NijeLijst side
		
		oSelectedRowsNijeLijst.every( function(){
			
			var oNijeLijstRow = this;		
			var sNijeLijstId = 		fx.getDataFromCellInRow( oNijeLijstRow, sIdColumn_in_NijeLijstTable );
			var sNijeLijstLem = 	fx.getDataFromCellInRow( oNijeLijstRow, "nije_lijst_lem" );
			var bLastNijeLijstRow =	fx.isLastRowOf( oNijeLijstRow, oSelectedRowsNijeLijst );

			fx.updateDatabaseGivenACellOrRow(oNijeLijstRow, {"linked": true});
			
			// add link between selected Entries and NijeLijst rows
			
			(function(){
				
				var aArr = new Array();
				aArr[ sEntriesIdColumn_in_CrossView ] = 	sEntriesId;
				aArr[ sNijeLijstIdColumn_in_CrossView ] =	sNijeLijstId;
				aArr[ "link_type"] = 'Manual';
				if (sEntriesFileId != null && sEntriesFileId != '') 
					aArr[ "file_id"] = sEntriesFileId;
				aArr[ "orth"] = sEntriesLem;
				aArr[ "gram"] = sEntriesGram;
				aArr[ "nije_lijst_lem"] = sNijeLijstLem;				
				
				fn.insertIntoDatabase( sCrossViewName, aArr, null, function(){
					
					// Last rows combination reached? 
					// We are done, so refresh the tables!
					
					if ( bLastEntriesRow && bLastNijeLijstRow ){
						console.log("Refresh tables");
						setTimeout(function(){

							//fn.refreshTable( sCrossViewName );
							fn.callTable(sCrossViewName, {"orth": sEntriesLem, "nije_lijst_lem": sNijeLijstLem});
							fn.refreshTable( sEntriesTableName, function(){

								setTimeout(function(){
									fx.selectRow(oEntriesRow);
								}, 500);
								
							} );
							fn.refreshTable( sNijeLijstTableName, function(){

								setTimeout(function(){
									fx.selectRow(oNijeLijstRow );
								}, 500);
								
							} );
							

						}, 500);
						
					}
				});
				
			})();	
			
			
		});
		
	});
}


// Undo a link, given a selected row in the cross table view

function undoLink(){
	
	fn.confirm("Let op", "Weet u zeker dat u de geselecteerde links ongedaan wilt maken?", 
			
		function(){
		
			// get selected link pair
		
			var oSelectedLinkRow = fx.getSelectedRowsFrom( sCrossViewName );
		
			// loop through selected rows 
		
			oSelectedLinkRow.every( function(){
				
				var oCurrentRow = this;		
				var sEntriesId = 	fx.getDataFromCellInRow( oCurrentRow, sEntriesIdColumn_in_CrossView );
				var sNijeLijstId = 	fx.getDataFromCellInRow( oCurrentRow, sNijeLijstIdColumn_in_CrossView );
				
				// remove link between selected Entries and NijeLijst rows

				var aArr = new Array();
				aArr[ sEntriesIdColumn_in_CrossView ] = sEntriesId;
				aArr[ sNijeLijstIdColumn_in_CrossView ] = sNijeLijstId;
				
				fn.removeFromDatabaseGivenFieldValues( sCrossViewName, aArr, function(){

					fn.callFunction("data.set_unlinked", [sEntriesId, sNijeLijstId]);
					
					// Last rows combination reached? 
					// We are done, so refresh the tables!
					
					var bLastRow = fx.isLastRowOf( oCurrentRow, oSelectedLinkRow );
					
					if (bLastRow){
						fn.refreshTable( sCrossViewName );
						fn.refreshTable( sEntriesTableName );
						fn.refreshTable( sNijeLijstTableName );
					}
				});
				
			});
		}, 
		function(){
			fn.message("OK", "Operatie door gebruiker geannuleerd.");
		}
	);
	
};

//generic function to open the GTB

function openGTB( sWdb, nPidCell ){
	
	var sPersistentId = fn.getDataFromCellNode( nPidCell );
	window.open( "http://gtb.inl.nl/iWDB/search?actie=article&wdb=" + sWdb + "&id=" + sPersistentId );
}



function fnSynchronizeTables(t){
	var n = fn.getActiveRowNode(t);
	var entryId = fn.getDataFromCellInRowNode(n, "entry_id");
	
	fn.callTable("senses", {"entry_id": entryId}, function(){
		fn.callTable("examples", {"entry_id": entryId});
		
		if (fn.tableExists("paradigm")){
				fn.callTable("paradigm", {"entry_id": entryId}, function(){										 
					fn.pileupTables("senses", "paradigm");
			});
		}
	});	
};


// --------------------------------------------------------------------------------------
//
// Lexicon mode startup
//
// --------------------------------------------------------------------------------------

function fnStartLexicon(){

	fn.callTable("entries", {}, function(){

		setTimeout(function(){

			var nRow = fn.getFirstRowNodeFrom("entries");
			fn.selectRowNode(nRow);

			var sEntryId = fn.getDataFromCellInRowNode(nRow, "entry_id");

			fn.callTable("senses", {"entry_id": sEntryId}, function(){
				fn.callTable("examples", {"entry_id": sEntryId}, function(){		
						
					fn.alignTables("senses", "examples", function(){

						$("#entries_dynamic").mouseenter(function(){					
							fn.setActiveTable("entries");
						});
						$("#senses_dynamic").mouseenter(function(){					
							fn.setActiveTable("senses");
						});
						$("#examples_dynamic").mouseenter(function(){					
							fn.setActiveTable("examples");
						});
						$("#paradigm_dynamic").mouseenter(function(){					
							fn.setActiveTable("paradigm");
						});

						fn.setActiveTable("entries");								
					});
					
				});
			});

		}, 1000);
		
	});	
}

// --------------------------------------------------------------------------------------
//
// MENU STARTUP
//
// --------------------------------------------------------------------------------------

// instance URL
var uLexitInstanceUrl = document.URL;
if (uLexitInstanceUrl.indexOf("?"))
	uLexitInstanceUrl = uLexitInstanceUrl.substring(0, uLexitInstanceUrl.indexOf("?"));
if (uLexitInstanceUrl.lastIndexOf("/") != uLexitInstanceUrl.length-1)
	uLexitInstanceUrl += "/";

addBackButton = function(){

	$("#partners_logos").remove();

	// add go back button
	if ($("#clickback").length==0){
		$("div#indicators").prepend("<button id='clickback' type='button' style='font-size: 14px 'onclick='reloadMenu()'><B>Back to Start screen</B></button>")
			.css({position: 'relative', top: '-25px'});
	}
}

removeBackButton = function(){
	if ($("#clickback").length>0){
		$("#clickback").remove();
	}
}


buildMenu = function(){

	// temporarily turn off the Chrome fix (see index.html)
	// this is needed to allow a redirect to a project, without triggering a dialog in Chrome preventing it!
	$(window).off('beforeunload');

	// dispose of unneeded table selection functionality (prevents default Lex'it behavior)
	$("div#indicators div#indicator").hide();
	$("div#indicators div#tablechoice").hide();	

	removeBackButton();

	// add logo's of partners


	var sPrefix = (paramsHash.get("test")=='true') ? "" : "../lexit2_config/";

	$("#temporary_stuff").append(
		$("<div></div>")
			.attr("id", "partners_logos")
			.css("background-color", "#FFFFFF").css("opacity", "0.7")
			//.css("width", "700px")
			.css("position", "absolute")
			.css("bottom", "20px")
			.css("right", "10px")
			.css("padding", "10px")
	);
	
	$("#partners_logos").append(
		$("<img>")
			.attr("src", sPrefix+"taalunie_logo_cmyk.gif")
			.css("height", "60px")
			.css("padding-left", "20px")
			.css("padding-right", "30px")
	);
	$("#partners_logos").append(
		$("<img>")
			.attr("src", sPrefix+"logo_fryslan_kleur_rgb_300.gif")
			.css("height", "60px")
	);
	$("#partners_logos").append(
		$("<img>")
			.attr("src", sPrefix+"logo_FA_2022_printwurk.gif")
			.css("height", "70px")
	);
	

	$("#home_logo img").css("width", "160px").css("height", "70px");
	
	
	
	
  
    const image = "https://smartwheelscuracao.com/wp-content/uploads/2022/02/%E2%80%98Mester-balora-papiamento-como-simbolo-di-identidad-Arubiano-300x223.jpg"
	const bildtsImage = 	"https://bildtsaigene.nl/wp-content/uploads/2020/11/logoBA.png"
	fn.closeDialog();
	fn.message("Menu", 
		`<CENTER><IMG src='${image}' width=115px height=50px/>`+
		"<TABLE>"+
		"<TR><TD>&nbsp;</TD></TR>"+
		"<TR><TD><BUTTON type='button' style='min-width: 200px; width: auto; font-size: 14px;' onclick='fn.closeDialog(); addBackButton(); fnStartLexicon();'>Lexicon bewerken</BUTTON></TD></TR>"+
		"<TR><TD><BUTTON type='button' style='min-width: 200px; width: auto; font-size: 14px;' onclick='fn.closeDialog(); addBackButton(); fn.callTable(\"start_linking\");'>Koppelen</BUTTON></TD></TR>"+
		"<TR><TD>&nbsp;</TD></TR>"+
		"<TR><TD><BUTTON type='button' style='min-width: 200px; width: auto; font-size: 14px;' onclick='fn.closeDialog(); addBackButton(); fn.callTable(\"log\");'>Log</BUTTON></TD></TR>"
		+"</TABLE></CENTER>", 
		function(){
			buildMenu(); // rebuild the menu if it was clicked away
		}
	);

	$(".ui-dialog-titlebar").hide();
};


reloadMenu = function(){

	// test mode?
	var bTestMode = getHttpParams().get("test")=='true';

	// temporarily turn off the Chrome fix (see index.html)
	// this is needed to allow a redirect to a project, without triggering a dialog in Chrome preventing it!
	$(window).off('beforeunload');

	window.location.replace(uLexitInstanceUrl + "?db=" + getHttpParams().get("db") + ( bTestMode ? "&test=true":""));	
};

const image = "https://www.commonwealthunion.com/wp-content/uploads/2023/08/Untitled-1-96.jpg"
const bImage = 'https://bildtsaigene.nl/wp-content/uploads/2021/01/hero-lbl_lsp_df021.jpg'
// add background image
fn.addCss("html {height: 100%}");
fn.addCss(`body {background-image: url(${image}); background-repeat: no-repeat; background-size: 100% 100%; background-attachment: fixed}`);

// start up!
buildMenu();

fn.setProjectTitle("Banko di Palabra", "yellow");
fn.addCss("#projectname {text-shadow: 2px 2px 5px grey; font-family: Cabin,sans-serif }");

// store last clicked element (needed to prevent buildLink from being executed after Enter in editable cell)
var lastClicked;


