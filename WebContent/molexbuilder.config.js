// list of tables that must be hidden
oShowOnlyTables = ["jvklex_union_gb"];


var bAssignmentAllowed = true;
var bUserSaysMainTableShouldFollow = true;

oTableSettingsList = {
		
		
		jvklex_union_gb: {
			
			"refresh_upon_focus": false,
			
			"nice_name": "Molex",
			
			"column_order": ["id", "lemma_id", "gb05_id", "lemma", "lk", "wordform", "wordform_id", "wk", "wordform_pos",
			                 "keurmerk", "gb_pos", "znwlid", "comment"],
			
			"selection_button_active": true,
			
			"keyup": {
				
				"m": function(t){
					var aRow = fn.getSelectedRowsFrom("gb_candidates");
					if (aRow.length>0)
						{
						var n = fn.getCellNode("gb_candidates", aRow[0], "wordform");
						assignToMainTable("gb_candidates", n);
						}
					else
						{
						alert("Er is geen wordform geselecteerd in de GB-lijst");
						}
				},
				"x": function(t){
					var aRow = fn.getSelectedRowsFrom(t);
					if (aRow.length>0)
						{
						var gbId = fn.getDataFromCellNamed(t, aRow[0], "gb05_id");
						fn.callDatabaseInNewTab("GB05_2013", {"id": gbId}, null, "spellinglexicon");					
						}
					else
						{
						alert("Er is geen rij geselecteerd in de Molex-lijst");
						}
				}
			},
			
			"button_0": {
				
				"name": "Nieuw lemma",
				"click": function(confTable){
					
					fn.prompt("Voeg een LEMMA in:", ["Lemma"], "", function(){
						var sLemma = fn.getPromptUserInput("Lemma");
						if (sLemma){
							// first generate a new jvk id for this new lemma
							var d = new Date();
							var sNewJvkId = "newjvk"+d.getTime();
							
							// now insert the new lemma with its id
							fn.insertIntoDatabase(confTable, 
									{
									"lemma_id": sNewJvkId,
									"lemma": sLemma,
									"wordform": ""
									}, 
									null, 
									false,
									function(){
										fn.refreshTable(confTable, function(){											
											selectRowOfNewLemma(confTable, sNewJvkId, sLemma);
										});										
									});	
						}
						
					});
				}
			},
			"button_1": {
				
				"name": "Verwijder selectie",
				"click": function(confTable){
					
					var aSelection = fn.getSelectedRowsFrom(confTable);
					var answer = confirm("Weet u zeker dat u deze "+aSelection.length+" rij(en) wilt verwijderen?");
					if (answer)
						{
						
						aSelection.each(function(){
							var bCurrentNodeIsLastOne = fn.isLastNodeOf(this, aSelection);
							fn.removeFromDatabaseGivenANode(confTable, this, bCurrentNodeIsLastOne);							
							});
						}
				}
			},
			
			"button_2": {
				"name": "Meeloop aan/uit",
				"bgcolor": "grey",
				"click": function(confTable){
					if (bUserSaysMainTableShouldFollow)
						{
						alert("Meelopen wordt nu UITgezet");
						bUserSaysMainTableShouldFollow = false;
						}
					else
						{
						alert("Meelopen wordt nu AANgezet");
						bUserSaysMainTableShouldFollow = true;
						}
				}
			},
			
			"size": "55%",
			
			"callback": function(t){
				
				// generate tooltip for long tags
				var aAllRows = fn.getAllRows(t);
				aAllRows.each(function(){
					var n = fn.getCellElement(t, this, "wordform_pos");
					var sOldText = $(n).text();
					// add space to allow the tag to be split up automatically if it is too long
					var sNewText = sOldText.replace(/,/g, ', ');
					$(n).attr("title", sNewText);
				});
				
				// open the candidates table and align it the this table
				if ( !fn.tableExists("gb_candidates") )
					{
					
					fn.callDatabase("gb_candidates", null, function(){						
						fn.alignTables("jvklex_union_gb", "gb_candidates");
						});
					}
				
			},
			"repeat_callback": true
			
		},
		
		gb_candidates: {
			
			"refresh_upon_focus": false,
			
			"keyup": {
				
				"z": function(t){
					var n = fn.getActiveRowNode(t);
					var sFirstLemma = fn.getDataFromCellInRowNode(t, n, "lemma");					
					fn.goToTheRightPage("jvklex_union_gb", "lemma", sFirstLemma);
				},
				"m": function(t){
					var nRow = fn.getActiveRowNode(t);
					var n = fn.getCellNode(t, nRow, "wordform");
					assignToMainTable(t, n);
				}
			},
			
			"nice_name": "Groen Boekje-vormen",
			
			"size": "45%",
			
			"button_0": {
				
				"name": "Verwijder selectie",
				"click": function(confTable){
					
					var aSelection = fn.getSelectedRowsFrom(confTable);
					var answer = confirm("Weet u zeker dat u deze "+aSelection.length+" rij(en) wilt verwijderen?");
					if (answer)
						{
						
						aSelection.each(function(){
							var bCurrentNodeIsLastOne = fn.isLastNodeOf(this, aSelection);
							fn.removeFromDatabaseGivenANode(confTable, this, bCurrentNodeIsLastOne);							
							});
						}
				}
			},
			
			"callback": function(t){
				
				//console.log(mainTableShouldFollow);
				
				// the main table must follow this table (t.i. show relevent lemmata)
				// but this callback must only be called when the user is browsing the
				// table
				if (mainTableShouldFollow && bUserSaysMainTableShouldFollow)
					{
					var nFirstRow = fn.getActiveRowNode(t);
					var sFirstLemma = fn.getDataFromCellInRowNode(t, nFirstRow, "lemma");
					
					fn.goToTheRightPage("jvklex_union_gb", "lemma", sFirstLemma);
					}
				mainTableShouldFollow = true;
				
			},
			"repeat_callback": true
		}
};

var mainTableShouldFollow = true;


// container object for the configuration of each table
oTableConfigurationList = {

		jvklex_union_gb: {
			
			id:  {"visible": false},
			gb05_id: {"visible": false},
			lemma_id: {"visible": false},
			
			// lemma mustn't be editable, since it is connected to an id
			// so modifying the lemma implies doing some "id administration"
			// (unnecessary complication!)
			lemma: {"colsort": "asc"},
			
			wordform: {"editable": true},
			wordform_id: {"visible": false},
			wordform_pos: {"editable": true},
			
			keurmerk: {"visible": false},
			
			gb_pos: {"visible": false},
			znwlid: {"visible": false},
			comment: {"visible": false}
			
		},
		
		gb_candidates: {
			gb05_id: {"visible": false},
			lemma: {
				"colsort": "asc",
				"cell_tooltip": "Zoek dit lemma op in de JVK-tabel [toets: Z]",
				
				// clicking a lemma in the GB-table should look up the same lemma in the main table 
				"click": function(t, n){
					
					var sFirstLemma = fn.getDataFromCellInRowNode(t, n, "lemma");					
					fn.goToTheRightPage("jvklex_union_gb", "lemma", sFirstLemma);
				}
			},
			wordform_id: {"visible": false},
			wordform: {
				
				"bgcolor": "#CEF6D8",
				"cell_tooltip": "Voeg deze woordvorm toe aan de JVK-tabel [toets: M]",
				
				// clicking a wordform in the GB-table should assign this wordform to 
				// the selected lemma in the main table
				"click": function(t, n){
					
					assignToMainTable(t, n);
					
				}
			}
		}
};

function assignToMainTable(t, n){
	
	var aSelection = fn.getSelectedRowsFrom("jvklex_union_gb");
	
	var sClosestLemma = "";
	var iRowNumberOfClosestLemma = -1;
	var iSmallestDistance = 999999;
	
	// if no selection was made in main table, get the main table lemma closest to the gb lemma
	if (aSelection.length==0)
		{	
		
		var nRow = fn.getRowNode(n);
		var sGbLemma = fn.getDataFromCellInRowNode(t, nRow, "lemma");
		
		var aAllRows = fn.getAllRows(t);
		aAllRows.each(function(i){
			var sLemmaInMainTable = fn.getDataFromCellInRowNode("jvklex_union_gb", this, "lemma");
			var iDist = levenshtein(sGbLemma, sLemmaInMainTable );
			if (iDist<iSmallestDistance)
				{
				iRowNumberOfClosestLemma = i;
				sClosestLemma = sLemmaInMainTable;
				iSmallestDistance = iDist;
				}
			});		
		
		
		fn.selectRow("jvklex_union_gb", iRowNumberOfClosestLemma);
		
		aSelection = fn.getSelectedRowsFrom("jvklex_union_gb");
		}
	
	// do we have a selection ?
	if (aSelection.length>0)
		{		
		
		var nSelectedNodesInMainTable = aSelection[0];
		
		// get the selected lemma information (from the main table)
		var sSelectedLemmaInMainTable = fn.getDataFromCellInRowNode("jvklex_union_gb", nSelectedNodesInMainTable, "lemma");
		var sSelectedLemmaIdInMainTable = fn.getDataFromCellInRowNode("jvklex_union_gb", nSelectedNodesInMainTable, "lemma_id");
		var sSelectedWordformInMainTable = fn.getDataFromCellInRowNode("jvklex_union_gb", nSelectedNodesInMainTable, "wordform");
		var sSelectedGbIdInMainTable = fn.getDataFromCellInRowNode("jvklex_union_gb", nSelectedNodesInMainTable, "gb05_id");
		
		// get the selected wordform from the GB table
		var sWordform = fn.getDataFromCellNode(t, n);
		var answer = confirm("Wilt u wordform \""+sWordform.toUpperCase()+
				"\" \n toevoegen bij lemma \""+sSelectedLemmaInMainTable.toUpperCase()+"\" ?");
		
		// if assigning this wordform to the selected lemma is what the user wants
		if (answer)
			{
			// make sure the table will update without
			// adapting the shown lemma to the GB-table
			// at the following round, as this would make
			// the new inserted entry disappear from view
			mainTableShouldFollow = false;
			
			
			nRow = fn.getRowNode(n);
			var sGb05id = fn.getDataFromCellInRowNode(t, nRow, "gb05_id");
			var sGbPos = fn.getDataFromCellInRowNode(t, nRow, "wrdcat");
			var sZnwlid = fn.getDataFromCellInRowNode(t, nRow, "znwlid");
			var sComment = fn.getDataFromCellInRowNode(t, nRow, "comment");
			
			// remove the GB-entry
			fn.removeFromDatabaseGivenANode(t, nRow, true, function(){
				
				// prepare the function for adding the new lemma
				// (we do it that way to be able to re-use this function
				//  in the following)
				var func = function(){
					
					
					var wordformAlreadyInMainTable = 
						findLemmaAndWordformInMainTable(sSelectedLemmaIdInMainTable, sSelectedLemmaInMainTable, sWordform);
					
					// if the wordform is already in the main table
					// just add the GB information and don't change the gigant tag
					if (wordformAlreadyInMainTable)
						{
						// make sure that previously assigned gb ids (originating from 
						// identical gb wordforms with different gb lemmaforms than what we are assigning now)
						// won't be overwritten, but that new gb ids will be added, comma separated.
						// That way we keep track of all gb lemma ids some form might have belong to in gb
						// ex: GB-woordvorm groentelaatje GB-lemma groentela and 
						//     GB-woordvorm groentelaatje GB-lemma groentelade 
						//     will be assigned to JVK-lex groentelaatje
						//     and we want to keep the gb id of GB-lemma groentela and GB-lemma groentelade 
						var sGb05idForUpdate = sGb05id;
						if (sSelectedGbIdInMainTable != '')
							{
							if ($.inArray(sGb05id, sSelectedGbIdInMainTable.split(","))<0 )
								sGb05idForUpdate = sSelectedGbIdInMainTable + "," + sGb05id;
							else
								sGb05idForUpdate = sSelectedGbIdInMainTable;
							}
							
							
						fn.updateDatabaseGivenFieldValues("jvklex_union_gb", 
								{
									"lemma_id": "^"+sSelectedLemmaIdInMainTable+"$",
									"lemma": "^"+sSelectedLemmaInMainTable+"$",
									"wordform": "^"+sWordform+"$"
								}, 
								{	
									"gb05_id": sGb05idForUpdate,
									"gb_pos": sGbPos,
									"znwlid": sZnwlid,
									"comment": sComment,
									"keurmerk": "KEURMERK",
									"lk": true,
									"wk": true							
								}, true);
						}
					// if the wordform is not yet in the main table
					// add it
					else
						{
						fn.insertIntoDatabase("jvklex_union_gb", 
								{
								"lemma_id": sSelectedLemmaIdInMainTable,
								"lemma": sSelectedLemmaInMainTable,
								"wordform": sWordform,
								"gb05_id": sGb05id,
								"gb_pos": sGbPos,
								"znwlid": sZnwlid,
								"comment": sComment,
								"keurmerk": "KEURMERK",
								"lk": true,
								"wk": true							
								}, 
								null, true);
						}
					
					
				};
				
				// if the lemma the GB-wordform will be added to is only a lemma without 
				// wordform, it is first removed as adding the wordform will also add the
				// lemma, so here we are preventing doubling!
				if(sSelectedWordformInMainTable =='')
					{
					fn.removeFromDatabaseGivenFieldValues("jvklex_union_gb", 
							{
							"lemma": "^"+sSelectedLemmaInMainTable+"$",
							"wordform": ""										
							},
							false,
							func); // callback: add the entry to the main table
					}
				
				// add the entry to the main table
				else
					{
					func();
					}
					
				
				});
			
			}
		}
	
	// if no lemma was selected in the main table, ask the user for it
	else
		{
		alert("Selecteer eerst een lemma in de JVK-tabel");
		}
}


function findLemmaAndWordformInMainTable(lemmaId, lemma, wordform){
	
	var found = false;
	
	var aAllRows = fn.getAllRows("jvklex_union_gb");
	aAllRows.each(function(){
		
		var sCurrentLemma = fn.getDataFromCellInRowNode("jvklex_union_gb", this, "lemma");
		var sCurrentLemmaId = fn.getDataFromCellInRowNode("jvklex_union_gb", this, "lemma_id");
		var sCurrentWordform = fn.getDataFromCellInRowNode("jvklex_union_gb", this, "wordform");
		
		if (sCurrentLemma == lemma && 
				sCurrentLemmaId == lemmaId &&
				sCurrentWordform == wordform)
			{
			found = true;
			return false; // break
			}		
	});
	
	return found;
}

function selectRowOfNewLemma(sTable, lemmaId, lemma){
	
	//console.log("try to find: "+lemmaId+" : "+lemma);
	
	fn.unselectAllRows(sTable);
	
	var foundNode = null;
	
	var aAllRows = fn.getAllRows("jvklex_union_gb");
	aAllRows.each(function(iRowNumber){
		var sCurrentLemma = fn.getDataFromCellInRowNode("jvklex_union_gb", this, "lemma");
		var sCurrentLemmaId = fn.getDataFromCellInRowNode("jvklex_union_gb", this, "lemma_id");
		
		//console.log("checking: "+sCurrentLemmaId+" : "+sCurrentLemma);
		
		if (sCurrentLemma == lemma && 
				sCurrentLemmaId == lemmaId)
			{
			//console.log(iRowNumber);			
			kf.setActiveRowNumber(iRowNumber);
			return false; // break
			}			
	});
}



function levenshtein (s1, s2) {
	  // http://kevin.vanzonneveld.net
	  // +            original by: Carlos R. L. Rodrigues (http://www.jsfromhell.com)
	  // +            bugfixed by: Onno Marsman
	  // +             revised by: Andrea Giammarchi (http://webreflection.blogspot.com)
	  // + reimplemented by: Brett Zamir (http://brett-zamir.me)
	  // + reimplemented by: Alexander M Beedie
	  // *                example 1: levenshtein('Kevin van Zonneveld', 'Kevin van Sommeveld');
	  // *                returns 1: 3
	  if (s1 == s2) {
	    return 0;
	  }

	  var s1_len = s1.length;
	  var s2_len = s2.length;
	  if (s1_len === 0) {
	    return s2_len;
	  }
	  if (s2_len === 0) {
	    return s1_len;
	  }

	  // BEGIN STATIC
	  var split = false;
	  try {
	    split = !('0')[0];
	  } catch (e) {
	    split = true; // Earlier IE may not support access by string index
	  }
	  // END STATIC
	  if (split) {
	    s1 = s1.split('');
	    s2 = s2.split('');
	  }

	  var v0 = new Array(s1_len + 1);
	  var v1 = new Array(s1_len + 1);

	  var s1_idx = 0,
	    s2_idx = 0,
	    cost = 0;
	  for (s1_idx = 0; s1_idx < s1_len + 1; s1_idx++) {
	    v0[s1_idx] = s1_idx;
	  }
	  var char_s1 = '',
	    char_s2 = '';
	  for (s2_idx = 1; s2_idx <= s2_len; s2_idx++) {
	    v1[0] = s2_idx;
	    char_s2 = s2[s2_idx - 1];

	    for (s1_idx = 0; s1_idx < s1_len; s1_idx++) {
	      char_s1 = s1[s1_idx];
	      cost = (char_s1 == char_s2) ? 0 : 1;
	      var m_min = v0[s1_idx + 1] + 1;
	      var b = v1[s1_idx] + 1;
	      var c = v0[s1_idx] + cost;
	      if (b < m_min) {
	        m_min = b;
	      }
	      if (c < m_min) {
	        m_min = c;
	      }
	      v1[s1_idx + 1] = m_min;
	    }
	    var v_tmp = v0;
	    v0 = v1;
	    v1 = v_tmp;
	  }
	  return v0[s1_len];
	}
