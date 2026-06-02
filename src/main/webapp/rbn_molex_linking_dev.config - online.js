// list of tables that must be hidden or visible (don't use both, it's a matter of what's the most convenient)
oHiddenTablesList = [];
oShowOnlyTables = [];

//configuration at column level
oTableConfigurationList = {};

//table general settings
oTableSettingsList = {};


var local = (document.URL).includes("localhost");

// --------------------------------------------------------------------------------------
// We have 3 tables: a left table, a right table and a cross table.
// The user clicks on a word in the left table, which will be automatically looked up in the right table (working the other way round is allowed as well).
// If some match is found between the left table and the right table, the user presses 'Enter' to build a link between both records.
// The linkes are automatically stored in the cross table.
// --------------------------------------------------------------------------------------


// -----------------
// Right table
// -----------------

var sRightLastSearch = "";

// general 
var sRightTableName_inGUI = 		"GigMol lemmata";		// user-friendly table name to show in the GUI
var sRightTableName =				"molex_full";			// right table name in Postgres
var sRightTableWidth =				"50%";					// right table should occupy about right half of screen

// fields
var sIdColumn_in_RightTable = 		"lemma_id";				// ID to store in the cross table 
var sLookUpColumn_in_RightTable =	"modern_lemma";			// clicking this field triggers a lookup in:
															//     - [sLeftLookUpColumn] in left table
															// and - [sCrossLeftLookUpColumn] in cross table view
var sPosColumn_in_RightTable = 		"lemma_gigpos";
var sGlossColumn_in_RightTable = 	"gloss";
// sort
var oSortingColumns_in_RightTable =	{"modern_lemma": "asc", "lemma_id": "asc"};// order by

// -----------------
// Left table
// -----------------

var sLeftLastSearch = "";

// general 
var sLeftTableName_inGUI = 			"RBN en Vertaalwoordenschat";			// user-friendly table name to show in the GUI
var sLeftTableName =				"rbn_full";				// left table name in Postgres
var sLeftTableWidth =				"50%";					// left table should occupy about left half of screen

// fields
var sIdColumn_in_LeftTable =		"pid";					// ID to store in the cross table 
var sLookUpColumn_in_LeftTable = 	"modern_lemma";			// clicking this field triggers a lookup in:  
															//     - [sRightLookUpColumn] in right table
															// and - [sCrossRightLookUpColumn] in cross table view
var sPosColumn_in_LeftTable = 		"pos";
var sGlossColumn_in_LeftTable = 	"gloss";
var sSourceColumn_in_LeftTable =	"source";
// sort
var oSortingColumns_in_LeftTable =	{"modern_lemma": "asc", "pid": "asc"}; // order by

// -----------------
// Cross table
// -----------------

// general 
var sCrossViewName_inGUI = 			"RBN/Vertaalwoordenschat-GigMol-links";		// user-friendly table name to show in the GUI
var sCrossViewName =				"molex_rbn_links";		// view name in Postgres
var sCrossViewWidth =				"100%";					// cross table should occupy the entire lower part of the screen

// fields
var sRightIdColumn_in_CrossView =	"lemma_id";				// ID, matching [sLeftIdColumn] in right table
var sLeftIdColumn_in_CrossView = 	"pid";					// ID, matching [sRightIdColumn] in left table
var sRightLookUpColumn_in_CrossView =	"molex_lemma";		// This column is searched when the user clicks on [sLookUpColumn_in_RightTable]
var sLeftLookUpColumn_in_CrossView =	"rbn_lemma";		// This column is searched when the user clicks on [sLookUpColumn_in_LeftTable]

// sort
var oSortingColumns_in_CrossView =	{"molex_lemma": "asc", "lemma_id": "asc"};		// order by


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
// TABLE SETTINGS (TABLE LEVEL)
// --------------------------------------------------------------------------------------

// right table

oTableSettingsList[ sRightTableName ] = {
		
	"nice_name": 		sRightTableName_inGUI,
	"width": 			sRightTableWidth,
	"columns_sorting":	oSortingColumns_in_RightTable,
	"keyup": 			oKeyForBuildingLinks
	
};

// left table

oTableSettingsList[ sLeftTableName ] = {
		
	"nice_name": 		sLeftTableName_inGUI,
	"width": 			sLeftTableWidth,
	"columns_sorting": 	oSortingColumns_in_LeftTable,
	"keyup": 			oKeyForBuildingLinks,
	"columns_order": ["has_ex",
					  "betekenis_id", 	// OLD
					  "pid",
	                  "modern_lemma",
	                  "gloss",
	                  "extra_form",
	                  "pos",
	                  "linked",
	                  "vindbaar",
					  "countable",
					  "info",			// OLD
					  "source",			// source of the original records
					  "orig_ids",		// IDs    of the original records
					  "orig_ids_json"	// IDs    of the original records
	                  ],
	
	"callback":	function(t){
		
		var oRows = fx.getAllRows(t);
		
		// get examples of visible rows
		// and make those available in a tooltip

		if (oRows.count() != 0) {
			
			oRows.every(function(){
				
				var nThisRow = 	fx.getNode(this);
				var iPid =	fn.getDataFromCellInRowNode(nThisRow, "pid");
				
				fn.callFunction("rbn.get_example", [iPid], function(resp){
					
					var output = "<B>Voorbeelden:</B><BR>"+resp["get_example"];
					$( fn.getCellInRowNode(nThisRow, "has_ex") ).attr("title", output);
					$( fn.getCellInRowNode(nThisRow, "pid") ).attr("title", output);
				});	
				
			});
			
			// activate tooltip
			setTimeout(
				function(){
					$(".tooltip").tipTip( gui.getTiptipConfig() );
				}, 
				200);
		};
		
	},
	
	"repeat_callback":	true

};

// cross table view

oTableSettingsList[ sCrossViewName ] = {
		
	"nice_name": 		sCrossViewName_inGUI,
	"width": 			sCrossViewWidth,
	"columns_sorting": 	oSortingColumns_in_CrossView,
	"keyup": 			oKeyForBuildingLinks,
	
	"columns_order": [
						"betekenis_id",
						"source",
						"pid",
						"rbn_lemma",
						"rbn_pos",
						"rbn_gloss",
						"lemma_id",
						"molex_lemma",
						"molex_pos",
						"molex_gloss",
						"match_method"
	                  ],
	
	"button_0": {
		
		"name": "Link ongedaan maken",
		"click": function(t){
			undoLink();
		}
	}
};



// --------------------------------------------------------------------------------------
// TABLE SETTINGS (COLUMNS LEVEL)
// --------------------------------------------------------------------------------------

oTableConfigurationList[ sRightTableName ] = {};
oTableConfigurationList[ sLeftTableName ] = {};
oTableConfigurationList[ sCrossViewName ] = {};

// right table   


oTableConfigurationList[ sRightTableName ][ sIdColumn_in_RightTable ] = {
		
	"bgcolor": "#F8E0E0",
	
	"click": function( t, nCell ){
		
		var sLemId = fn.getDataFromCellNode(nCell);
		fn.callDatabaseInNewTab("lemmata_en_paradigma_view", {"lemma_id": sLemId}, {}, "gig_pro")
		
	}	
};

oTableConfigurationList[ sRightTableName ][ "countable" ] = {
		"visible": false
};
oTableConfigurationList[ sRightTableName ][ "info" ] = {
		"visible": false
};



oTableConfigurationList[ sRightTableName ][ sLookUpColumn_in_RightTable ] = {
	
	"bgcolor": "#ECF8E0",
		
	// look up upon click!
	
	"click": function( t, nCell ){
		
		var sValue = fn.getDataFromCellNode( nCell );
		
		// prevent new search upon clicking the same cell again
		if (sValue == sRightLastSearch)
			return;
		else
			sRightLastSearch = sValue;
		
		// look up in cross table
		
		var oLookUp = new Array();
		oLookUp[ sRightLookUpColumn_in_CrossView ] = "^"+sValue;
		oLookUp[ sLeftLookUpColumn_in_CrossView ] = "";	// avoid empty results because this filter was filled in previous query 
		
		fn.callDatabase( sCrossViewName, oLookUp );
		
		var oLeftLookUp = new Array();
		oLeftLookUp[ sLookUpColumn_in_LeftTable ] = "^"+sValue;
		
		fn.callDatabase( sLeftTableName, oLeftLookUp, function(){
			
			setTimeout(function(){
				
				oLeftLookUp[ sLookUpColumn_in_LeftTable ] = sValue;
				var nRow = fn.getAllRowNodesWhere( sLeftTableName, oLeftLookUp, true );
				
				// if there is some exact match, select the right row straight away
				if (nRow != null && nRow.length > 0) {
					var iRowNumber = fn.getRowNodeNumberOnScreen( nRow[0] );
					fn.selectRowNode( sLeftTableName, iRowNumber );
				}
				
			}, 100);
		});
		
	}
};


// left table

oTableConfigurationList[ sLeftTableName ][ "countable" ] = {
	"visible": false
},
oTableConfigurationList[ sLeftTableName ][ "betekenis_id" ] = {
	"visible": false
},
oTableConfigurationList[ sLeftTableName ][ "orig_ids" ] = {
	"visible": false
},
oTableConfigurationList[ sLeftTableName ][ "orig_ids_json" ] = {
	"visible": false
},
oTableConfigurationList[ sLeftTableName ][ "info" ] = {
	"visible": false
},

oTableConfigurationList[ sLeftTableName ][ sIdColumn_in_LeftTable ] = {
		
	"bgcolor": "#F8E0E0",
	
	"click": function(t, n){

		var source = fn.getDataFromSiblingNode(n, "source");
		var pid = fn.quote(fn.getDataFromCellNode(n));

		if (source == 'RBN'){

			fn.callFunction("rbn.get_rbn_from_pid", [pid], function(resp){

				var oLookUp = {};
				var aPosAndId = (resp["get_rbn_from_pid"]).split(":");
				var sPos = 		aPosAndId[0];
				var sBetekenisId =	aPosAndId[1];

				if (local)
					oLookUp["test"] = true;
			
				if ($.startsWith(sPos, "verb")) {
					sTableName = "Werkwoorden";
					oLookUp["id-betekenisId"] = sBetekenisId;
				}
				if ($.startsWith(sPos, "noun")) {
					sTableName = "Zelfstandige_naamwoorden";
					oLookUp["id-betekenisId"] = sBetekenisId;
				}
				if ($.startsWith(sPos, "adj")) {
					sTableName = "Bijvoeglijke_naamwoorden";
					oLookUp["id-betekenisId"] = sBetekenisId;
				}
				if (typeof sTableName == 'undefined') {
					sTableName = "Functiewoorden_en_bijwoorden";
					oLookUp["idnr-functiewrd"] = sBetekenisId;
				}
				
				fn.callDatabaseInNewTab(sTableName, oLookUp, null, "rbn");

			});
		}

		else {	// source ==  [some Vertaalwoordschat dictionary]

			fn.callFunction("rbn.get_vertaalw_from_pid", [pid], function(resp){

				var oLookUp = {};
				var aFileFormIdAndLexUnitId =	(resp["get_vertaalw_from_pid"]).split(":");
				var sFilename =				aFileFormIdAndLexUnitId[0];
				var iFormId = 				aFileFormIdAndLexUnitId[1];
				//var ilexicalUnitId = 		aFileFormIdAndLexUnitId[2];

				if (local)
					oLookUp["test"] = true;

				oLookUp["filename"] = oLookUp["filename"] = (escapeRegexChars(sFilename)).replace(/"/g, '');
				oLookUp["form_id"] = iFormId;

				fn.callDatabaseInNewTab("forms", oLookUp, null, "vertaalwoordenschat_dev");

			});
		}

	}
		
};

oTableConfigurationList[ sLeftTableName ][ sLookUpColumn_in_LeftTable ] = {
		
	"bgcolor": "#ECF8E0",
		
	// look up upon click!
	
	"click": function( t, nCell ){
		
		var sValue = fn.getDataFromCellNode( nCell );
		
		// prevent new search upon clicking the same cell again 
		if (sValue == sLeftLastSearch)
			return;
		else
			sLeftLastSearch = sValue;
		
		// look up in cross table
		
		var oLookUp = new Array();
		oLookUp[ sLeftLookUpColumn_in_CrossView ] = "^"+sValue;
		oLookUp[ sRightLookUpColumn_in_CrossView ] = "";	// added 20200514 to avoid empty results because this filter was filled in previous query
		
		fn.callDatabase( sCrossViewName, oLookUp );
		
		var oRightLookUp = new Array();
		oRightLookUp[ sLookUpColumn_in_RightTable ] = "^"+sValue;
		
		fn.callDatabase( sRightTableName, oRightLookUp, function(){
			
			setTimeout(function(){
				
				oRightLookUp[ sLookUpColumn_in_RightTable ] = sValue;
				
				var nRow = fn.getAllRowNodesWhere( sRightTableName, oRightLookUp, true );
				
				// if there is some exact match, select the right row straight away
				if (nRow != null)
					{
					var iRowNumber = fn.getRowNodeNumberOnScreen( nRow );
					fn.selectRowNode( sRightTableName, iRowNumber );
					}
				
			}, 100);
		});
		
	}
};

// cross table 

oTableConfigurationList[ sCrossViewName ] = {
		
		"match_method": {
			"choosefrom": []
		},
		
		"rbn_pos": {
			"nice_name": "pos"
		},
		
		"rbn_gloss": {
			"nice_name": "gloss"
		},
		
		"rbn_lemma": {
			"nice_name": "lemma",
			"click": function(t, n){
				var sLem = fn.getDataFromCellNode(n);
				var oLeftLookUp = {};
				oLeftLookUp[sLookUpColumn_in_LeftTable] = "^" + sLem;
				fn.callDatabase(sLeftTableName, oLeftLookUp);
				var oRightLookUp = {};
				oRightLookUp[sLookUpColumn_in_RightTable] = "^" + sLem;
				fn.callDatabase(sRightTableName, oRightLookUp);
			}
		},
		
		"molex_lemma": {
			"click": function(t, n){
				var sLem = fn.getDataFromCellNode(n);
				var oLeftLookUp = {};
				oLeftLookUp[sLookUpColumn_in_LeftTable] = "^" + sLem;
				fn.callDatabase(sLeftTableName, oLeftLookUp);
				var oRightLookUp = {};
				oRightLookUp[sLookUpColumn_in_RightTable] = "^" + sLem;
				fn.callDatabase(sRightTableName, oRightLookUp);
			}
		},

		"pid": {

			"bgcolor": "#F8E0E0",

			"click": function(t, n){

				var source = fn.getDataFromSiblingNode(n, "source");
				var pid = fn.quote(fn.getDataFromCellNode(n));

				if (source == 'RBN'){

					fn.callFunction("rbn.get_rbn_from_pid", [pid], function(resp){

						var oLookUp = {};
						var aPosAndId = (resp["get_rbn_from_pid"]).split(":");
						var sPos = 		aPosAndId[0];
						var sBetekenisId =	aPosAndId[1];

						if (local)
							oLookUp["test"] = true;
					
						if ($.startsWith(sPos, "verb")) {
							sTableName = "Werkwoorden";
							oLookUp["id-betekenisId"] = sBetekenisId;
						}
						if ($.startsWith(sPos, "noun")) {
							sTableName = "Zelfstandige_naamwoorden";
							oLookUp["id-betekenisId"] = sBetekenisId;
						}
						if ($.startsWith(sPos, "adj")) {
							sTableName = "Bijvoeglijke_naamwoorden";
							oLookUp["id-betekenisId"] = sBetekenisId;
						}
						if (typeof sTableName == 'undefined') {
							sTableName = "Functiewoorden_en_bijwoorden";
							oLookUp["idnr-functiewrd"] = sBetekenisId;
						}
						
						fn.callDatabaseInNewTab(sTableName, oLookUp, null, "rbn");

					});
				}
				else { // source ==  [some Vertaalwoordschat dictionary]

					fn.callFunction("rbn.get_vertaalw_from_pid", [pid], function(resp){

						var oLookUp = {};
						var aFileFormIdAndLexUnitId =	(resp["get_vertaalw_from_pid"]).split(":");
						var sFilename =				aFileFormIdAndLexUnitId[0];
						var iFormId = 				aFileFormIdAndLexUnitId[1];
						//var ilexicalUnitId = 		aFileFormIdAndLexUnitId[2];

						if (local)
							oLookUp["test"] = true;

						oLookUp["filename"] = (escapeRegexChars(sFilename)).replace(/"/g, '');
						oLookUp["form_id"] = iFormId;

						fn.callDatabaseInNewTab("forms", oLookUp, null, "vertaalwoordenschat_dev");

					});
				}
					
			}
		},
		
		"betekenis_id": {

			"visible": false
				
		},
		
		"lemma_id": {
			"bgcolor": "#F8E0E0",
			
			"click": function( t, nCell ){
				
				var sLemId = fn.getDataFromCellNode(nCell);
				fn.callDatabaseInNewTab("lemmata_en_paradigma_view", {"lemma_id": sLemId}, {}, "gig_pro")
				
			}	
		}
		
};




// --------------------------------------------------------------------------------------
// START UP
// --------------------------------------------------------------------------------------


// 1. call the left and right tables, align them

fn.message("Welkom", "RBN/Vertaalwoordenschat-Molex wordt bijgewerkt met de nieuwe Molex-lemmata.<BR><BR>Dit venster sluit automatisch als dit gereed is...<BR><BR>Een ogenblik geduld a.u.b.");

setTimeout(function(){

	fn.callFunction("rbn.add_new_lemma_from_molex", [], function(){

		fn.closeDialog(); // remove the warning

		fn.callDatabase(sLeftTableName, {}, function(){
		
			fn.callDatabase(sRightTableName, {}, function(){
				
				fn.alignTables(sLeftTableName, sRightTableName, function(){
					
					// 2. then call the cross table view, and put it at the bottom of the screen
					
					fn.callDatabase(sCrossViewName, null, function(){
						
						fn.pileupTables(sLeftTableName, sCrossViewName);
					});
				});
			});
		});

	});

}, 200);






// --------------------------------------------------------------------------------------
// FUNCTIONS (AS GENERIC AS POSSIBLE)
// --------------------------------------------------------------------------------------

// Build a link, given some selected row(s) in the left table 
//               and some selected row(s) in the right table.

function buildLink(){
	
	
	// get the selected rows on both sides
	
	var oSelectedRowsLeft = 	fx.getSelectedRowsFrom( sLeftTableName );
	var oSelectedRowsRight =	fx.getSelectedRowsFrom( sRightTableName );
	
	if (oSelectedRowsLeft == null || oSelectedRowsLeft.count() == 0)
		fn.message("Let op", "Kies een RBN/Vertaalwoordenschat betekenis!");
	if (oSelectedRowsRight == null || oSelectedRowsRight.count() == 0)
		fn.message("Let op", "Kies een Molex lemma!");
	
	
	// loop through selected rows on left side
	
	oSelectedRowsLeft.every(function(){
		
		var oLeftRow = this;		
		var sLeftId = 		fx.getDataFromCellInRow( oLeftRow, sIdColumn_in_LeftTable  );
		var bLastLeftRow =	fx.isLastRowOf( oLeftRow, oSelectedRowsLeft );
		var sLeftLemma = 	fx.getDataFromCellInRow( oLeftRow, sLookUpColumn_in_LeftTable );
		var sLeftPos = 	fx.getDataFromCellInRow( oLeftRow, sPosColumn_in_LeftTable );
		var sLeftGloss = 	fx.getDataFromCellInRow( oLeftRow, sGlossColumn_in_LeftTable );
		var sLeftSource = 	fx.getDataFromCellInRow( oLeftRow, sSourceColumn_in_LeftTable );
		
		// set row to be linked
		fx.updateDatabaseGivenACellOrRow(oLeftRow, {"linked": true});
		
		// loop through selected rows on right side
		
		oSelectedRowsRight.every( function(){
			
			var oRightRow = this;		
			var sRightId = 		fx.getDataFromCellInRow( oRightRow, sIdColumn_in_RightTable );
			var bLastRightRow =	fx.isLastRowOf( oRightRow, oSelectedRowsRight );
			var sRightLemma = 	fx.getDataFromCellInRow( oRightRow, sLookUpColumn_in_RightTable );
			var sRightPos = 	fx.getDataFromCellInRow( oRightRow, sPosColumn_in_RightTable );
			var sRightGloss = 	fx.getDataFromCellInRow( oRightRow, sGlossColumn_in_RightTable );
			
			// add link between selected left and right rows
			
			(function(){
				
				var aArr = new Array();
				aArr[ sLeftIdColumn_in_CrossView ] =	sLeftId;
				aArr[ sRightIdColumn_in_CrossView ] = 	sRightId;				
				
				aArr[ "rbn_lemma" ] =		sLeftLemma;
				aArr[ "rbn_gloss" ] =		sLeftGloss;
				aArr[ "rbn_pos" ] =			sLeftPos;
				aArr[ "source" ] =			sLeftSource;
				
				aArr[ "molex_lemma" ] = 	sRightLemma;
				aArr[ "molex_gloss" ] = 	sRightGloss;
				aArr[ "molex_pos" ] =		sRightPos;
				
				
				
				fn.insertIntoDatabase( sCrossViewName, aArr, null, function(){
					
					// Last rows combination reached? 
					// We are done, so refresh the tables!
					
					if ( bLastLeftRow && bLastRightRow ) {
						fn.refreshTable( sLeftTableName );
						fn.refreshTable( sCrossViewName );
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
				var sRightId = 	fx.getDataFromCellInRow( oCurrentRow, sRightIdColumn_in_CrossView );
				var sLeftId = 	fx.getDataFromCellInRow( oCurrentRow, sLeftIdColumn_in_CrossView );
				
				var bLastRow = fx.isLastRowOf( oCurrentRow, oSelectedLinkRow );
				
				// remove link between selected left and right rows
				
				var aArr = new Array();
				aArr[ sLeftIdColumn_in_CrossView ] = sLeftId;
				aArr[ sRightIdColumn_in_CrossView ] = sRightId;
				
				fn.removeFromDatabaseGivenFieldValues( sCrossViewName, aArr, function(){
					
					fn.callFunction("rbn.set_unlinked", [ parseInt(sLeftId) ] );
					
					// Last rows combination reached? 
					// We are done, so refresh the tables!
					
					var bLastRow = fx.isLastRowOf( oCurrentRow, oSelectedLinkRow );
					
					if (bLastRow) {
						fn.refreshTable( sLeftTableName );
						fn.refreshTable( sCrossViewName );
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


// Boukje's job

oTableConfigurationList['molex_rbn_links_checked'] = {
	
	"throw_away": {
		"click": function(t, n){

			var lemmaId = fn.getDataFromSiblingNode(n, "lemma_id");
			var betekId = fn.getDataFromSiblingNode(n, "betekenis_id");fn.removeFromDatabaseGivenFieldValues("molex_rbn_links", {"lemma_id": lemmaId, "betekenis_id": betekId}, function(){
				fn.refreshTable("molex_rbn_links");
				fn.refreshTable(t);
			});

			fn.removeFromDatabaseGivenFieldValues("molex_rbn_links", {"lemma_id": lemmaId, "betekenis_id": betekId}, function(){
				fn.refreshTable("molex_rbn_links");
				fn.refreshTable(t);
			});

			fn.updateDatabaseGivenFieldValues(sLeftTableName, {"betekenis_id": betekId}, {"linked": false}, function(){
				fn.refreshTable(sLeftTableName);
			});

		}
	},

	"id": {
		"visible": false
	}
	
};

oTableSettingsList['molex_rbn_links_checked'] = {
	"group": "Boukje special job",
	
	"columns_sorting": {"molex_lemma": "asc", "lemma_id": "asc"}
};



// --------------------------------------------------------------------------------------