// list of tables that must be hidden or visible (don't use both, it's a matter of what's the most convenient)
oHiddenTablesList = [];
oShowOnlyTables = (
					fn.getCurrentUser() == 'boukje' ||
					fn.getCurrentUser() == 'marjolijn' ||
					fn.getCurrentUser() == 'wil'
					) ?
		["lemmata_view", "modified_lemmata_view", "modified_paradigm_view", 
         "keurmerk_checklist", "gemiste_paradigma_correcties", "lemmata_en_paradigma_view",
         "paradigma_telling_check", "missende_afbrekingen", "paradigma_telling_check_overzicht",
         "lemmatawithgender",
         "raredubbelvormen", "sterke_werkwoorden",
         "surinaams_and_antilliaans_commissions_selections",
         "export_versions", "homonyms_to_check", "nuancerende_opmerkingen"]
	:
		["lemmata_view", "modified_lemmata_view", "modified_paradigm_view", "lemmata_en_paradigma_view",
		 "paradigma_telling_check", "missende_afbrekingen", "paradigma_telling_check_overzicht", "separabilityglosses",
		 "lemmatawithgender",
		 "raredubbelvormen",
		 "surinaams_and_antilliaans_commissions_selections",
		 "export_versions", "homonyms_to_check",
		 "gb05_not_in_gigmol", "gb05_not_in_gigmol_lemmaforms",
		 "gb05_not_in_gigmol_v2", "nuancerende_opmerkingen"];


fn.setProjectTitle("GigantMolex Productie Intern");


//remember chosen parent
var sChosenParentId = null;


// default mode is: neutral
// modes: 0: neutral
//        1: show only gedrukt 
//        2: sort by freq
var bGedruktModeOfLemmata = 0;
var bGedruktModeOfParadigm = 0; 



// Autocomplete configuration
// see: http://stackoverflow.com/questions/5077409/what-does-autocomplete-request-server-response-look-like
// http://stackoverflow.com/questions/18677536/jeditable-and-jquery-ui-autocomplete
var sAutoCompleteSelector = "#lemmata_view .nuanc_opm";

$(document).on(
      "focus", 
      sAutoCompleteSelector, 
      function(event) {
      	
      	$(event.target).autocomplete({
          	
      		delay: 750,
              minLength: 2,
	        	source: function(request, response){
	            	
	            	fn.callFunction("get_nuance_opm", ["'"+request.term+"'"], 
	            			function(func_resp){  
	            		
	            		var aSuggestionsArr = 
	            			(func_resp["get_nuance_opm"]).split("|");
	            		
	            		response($.map(aSuggestionsArr, function (item) {
	                        return {
	                            label: item.split(":::")[0],
	                            value: item.split(":::")[1]
	                        };
	                    }));
	            	});
	            }
          });
          
      }
  );



// function needed in 'keurmerk_checklist' table
var fnArrowFunction = function(t){
	
	var oRow = fx.getFirstSelectedRowFrom(t);
	
	var iLemmaId =	fx.getDataFromCellInRow(oRow, "lemma_id");
	
	fn.callDatabase("paradigma_view", {"lemma_id": iLemmaId});
};


// Array's to store the locked lemmata of the current view
// Those array's get updated at each table draw
var aCurrentLemmaViewLocks = 		new Array();
var aCurrentParadigmaViewLocks =	new Array();



// function returns true if current user is a superuser
function superUser(){
	return (fn.getCurrentUser() == 'katrien' || 
			fn.getCurrentUser() == 'katrienvp' ||
			fn.getCurrentUser() == 'mathieu' ||
			fn.getCurrentUser() == 'jesse');
};


// link with diminutives ***************************************************************************

var sVerkleinwoord = 	"";
var sPartLemma = 		"";
var sVerkleinwoordId =	"";
var sPartLemmaId = 		"";

function getVerkleinwoord(){
	return "<b>Kies&nbsp;verkleinwoord</b>" +
	( sVerkleinwoord != "" ? 
			"<br>&nbsp;&nbsp;&nbsp;&nbsp;(<i>Gekozen:"+sVerkleinwoord+"/"+sVerkleinwoordId+"</i>)" : 
				"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+
				"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+
				"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;");
}
function  getPartLemma(){
	return "<b>Kies&nbsp;deeltje</b>" +
	( sPartLemma != "" ? 
			"<br>&nbsp;&nbsp;&nbsp;&nbsp;(<i>Gekozen:"+sPartLemma+"/"+sPartLemmaId+"</i>)" : 
				"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+
				"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"+
				"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;");
}
function setContextMenuOptions(key, options){
	
	$("ul.context-menu-list li:eq(0)").html('<span>'+getVerkleinwoord()+'</span>');
	options.items[key].name = getVerkleinwoord();
	$("ul.context-menu-list li:eq(1)").html('<span>'+getPartLemma()+'</span>');
	options.items[key].name = getPartLemma();

}


// table general settings *****************************************************************************

oTableSettingsList = {
		
		nuancerende_opmerkingen:{
			
			"size": "80%" 
			
		},
		
		export_versions:{
			
			"size": "80%",
			
			"button_0":{
				"name": "Voeg export-record toe",
				"click": function(t){
					
					fn.prompt("Geef record-info", 
							["major", "minor", "recipient", "comment"], 
							[0, 0, "", ""],
							
							function(){
						
								var iMajor = 		fn.getPromptBoxInput("major");
								var iMinor = 		fn.getPromptBoxInput("minor");
								var sRecipient =	fn.getPromptBoxInput("recipient");
								var sComment = 		fn.getPromptBoxInput("comment");
								
								fn.insertIntoDatabase(t, 
										{
										"major": iMajor,
										"minor": iMinor,
										"recipient": sRecipient,
										"comment": sComment
										}, 
										null, 
										function(){
											fn.refreshTable(t);
										});
					});
				}
			},
			"button_1":{
				"name": "Verwijder selectie",
				"click": function(t){
					
					fn.confirm("Let op", "Weet u het zeker?", function(){
						
						var oRows = fx.getSelectedRowsFrom(t);
						
						oRows.every(function(){
							
							var oCurrentRow =	this;							
							var bLastRow = 		fx.isLastRowOf(oCurrentRow, oRows);
							
							fx.removeFromDatabaseGivenARow(oCurrentRow, function(){
								if (bLastRow)
									fn.refreshTable(t);
								});	
							});
					});
					
					
					
				}
			}
		},
		
		lemmatawithgender:{
			
			"column_order": ["lemma_id",
			                 "modern_lemma",
			                 "lemma_gigpos",
			                 "gb_znwlid",
			                 "gender",
			                 "gender_corr",
			                 "ok",
			                 "gedrukt",
			                 "opmerking"
			                  ]
		},
		
		
		paradigma_telling_check_overzicht:{
			"size": "60%"
		},
		
		paradigma_telling_check: {
			"size": "60%",
			"column_order": ["lemma_id", "modern_lemma", "gigpos", "count", "gedrukt", "gecontroleerd"]
		},
		
		
		lemmata_en_paradigma_view:{
			
			"prereset_callback": function(t){
				
				bGedruktModeOfParadigm = 0;
				fn.addFilters(t, {"gedrukt": "", "f_total_rel": ""});
				putRightSortButtonName(t, 2, bGedruktModeOfParadigm);				
			},
			
			"repeat_callback": true,
			
			"callback": function(t){
				
				var sTableName = fn.getTableName(t);
				
				// build the UNlock button if it doesn't exist yet
				if ( superUser() && fn.getIndexOfButtonNamed(sTableName, "(Un)lock")<0)
					{
					fn.addCustomButton(t, {
						"name": "(Un)lock",
						"bgcolor": "#F5D0A9",
						"click": function(t){
							
							var oSelectedRows = fx.getSelectedRowsFrom(t);
							
							oSelectedRows.every(function(){
								
								var sLemmaId = fx.getDataFromCellInRow(this, "lemma_id");
								var bLastRow = fx.isLastRowOf(this, oSelectedRows);
								
								if ($.inArray( sLemmaId, aCurrentParadigmaViewLocks ) >-1)
									{
									fn.callFunction("unlock_lemma", [sLemmaId], function(){
											if(bLastRow) 
												fn.refreshTable(t);
											}
										);
									}
								else
									{
									fn.callFunction("lock_lemma", [sLemmaId], function(){
											if(bLastRow) 
												fn.refreshTable(t);
											}
										);
									}
								
							});
							
						}
					});
					}
				
				var oRows = fx.getAllRows(t);
				
				oRows.every(function(){
					
					var oCurrentRow = this;
					
					// make records with an empty wordform unclickable
					
					var sAwfId = fx.getDataFromCellInRow(oCurrentRow, "analyzed_wordform_id");
					
					if (sAwfId == '' || sAwfId == null)
						{
						
						$(fx.getCellNode(oCurrentRow, "wordform")).editable('disable');
						$(fx.getCellNode(oCurrentRow, "wordform")).css("opacity", "0.5");
						
						$(fx.getCellNode(oCurrentRow, "afbr_auto")).find("input").attr("disabled", "disabled");
						$(fx.getCellNode(oCurrentRow, "afbr_auto")).css("opacity", "0.5");
						
						$(fx.getCellNode(oCurrentRow, "wordform_gigpos")).editable('disable');
						$(fx.getCellNode(oCurrentRow, "wordform_gigpos")).css("opacity", "0.5");
						
						$(fx.getCellNode(oCurrentRow, "wf_keurmerk")).find("input").attr("disabled", "disabled");
						$(fx.getCellNode(oCurrentRow, "wf_keurmerk")).css("opacity", "0.5");
						
						$(fx.getCellNode(oCurrentRow, "comment")).editable('disable');
						$(fx.getCellNode(oCurrentRow, "comment")).css("opacity", "0.5");
						
						$(fx.getCellNode(oCurrentRow, "f_total_rel")).editable('disable');
						$(fx.getCellNode(oCurrentRow, "f_total_rel")).css("opacity", "0.5");
						}
					
					
					// gedrukt must be blue
					var bIsGedrukt = fx.getDataFromCellInRow(oCurrentRow, "gedrukt");
					
					if (bIsGedrukt == 't')
						{
						var aColList = mt.getListOfVisibleColumnsOf(sTableName);
						
						for (var i=0; i<aColList.length; i++)
							{
							var sColName = aColList[i];
							$(fx.getCellNode(oCurrentRow, sColName)).css("color", "blue");						
							}
						}
					
					// diminutives must be green
					var sVerkleinwoord = fx.getDataFromCellInRow(oCurrentRow, "verkleinwoord");
					
					if (sVerkleinwoord != '-')
						{
						var aColList = mt.getListOfVisibleColumnsOf(sTableName);
						for (var i=0; i<aColList.length; i++)
							{
							var sColName = aColList[i];
							$(fx.getCellNode(oCurrentRow, sColName)).css("color", "green");						
							}
						}
				});
				
				// apply locks
				
				var aLemmaIdsArr = new Array();
				
				oRows.every(function(i){
					
					aLemmaIdsArr[i] = fx.getDataFromCellInRow(this, "lemma_id");			
				});
				aLemmaIdsArr = getOnlyUniqueValues(aLemmaIdsArr);
				
				// get the list of locked lemmata
				// and modify the rows accordingly
				fn.callFunction("get_locks_of_lemmata", [ fn.quote(aLemmaIdsArr.join("|")) ], function(){
					
										
					aCurrentParadigmaViewLocks = (fn.getFunctionOutput()[0]).split("|");
					
					oRows.every(function(i){
						
						var oThisRow = this;
						var sLemmaId = fx.getDataFromCellInRow(oThisRow, "lemma_id");	
						
						
						if ( $.inArray( sLemmaId, aCurrentParadigmaViewLocks ) >-1 )
							{
							var aVisibleCells = mt.getListOfVisibleColumnsOf(fn.getTableName(t));
							
							for (var j=0; j<aVisibleCells.length; j++)
								{
								var sCurrentColumnName = aVisibleCells[j];
								
								// we mustn't lock the comment field
								if (sCurrentColumnName == 'comment_intern')
									continue;
								
								// make sure we can't edit the locked lemmata
								var sCellType =	fx.getCellType(oThisRow, sCurrentColumnName);								
								var eCell = 	fx.getCellNode(oThisRow, sCurrentColumnName);
								
								if (sCellType == 'text')
									{									
									$(eCell).editable('disable');
									$(eCell).css("opacity", "0.5");
									}
								else if (sCellType == 'checkbox')
									{
									$(eCell).find("input").attr("disabled", "disabled");
									$(eCell).css("opacity", "0.5");
									}
								else if (sCellType == 'selectbox')
									{
									$(eCell).editable('disable');
									$(eCell).css("opacity", "0.5");
									}
								}					
							
							}						
						
					});						
					
				}); // end of function call
				
			},			
			"button_0":{
				"name": "Voeg woordvorm toe",
				"click": function(confTable){
					
					var oFirstRow;
					var sLemmaId;
					var sLemma = null;
					
					// if there is no paradigm yet, get the lemma id from the lemma table
					if (fn.tableIsEmpty(confTable))
						{
						oFirstRow =		fx.getFirstSelectedRowFrom("lemmata_view");						
						sLemmaId =		fx.getDataFromCellInRow(oFirstRow, "pkid");
						sLemma =		fx.getDataFromCellInRow(oFirstRow, "modern_lemma");
						}
					// otherwise just read it from the current table
					else
						{
						var oFirstRow =	fx.getFirstSelectedRowFrom(confTable);						
						if (oFirstRow.count()==0)
							oFirstRow =	fx.getFirstRowFrom(oSomeTable);
						
						sLemmaId = fx.getDataFromCellInRow(oFirstRow, "lemma_id");
						// in this particular case, sLemma will be
						// requested by following fn.getRecord call
						}
					
					
					if (sLemmaId == null || sLemmaId == '')
						{
						fn.message("Kies een lemma", "Selecteer het lemma waar een woordvorm aan moet worden toegevoegd.");
						}
					else
						{
						fn.getRecord("lemmata", sLemmaId, function(response){
							
							// if we don't have a modern_lemma to show, get it
							
							if (sLemma == null)
								sLemma =  response["modern_lemma"];						
							
							fn.prompt("Geef woordvorm voor '"+sLemma+"'", 
									["woordvorm", "wordform_gigpos", "aantal"], 
									["", "", "1"], 
									function(){
								
									var sWordform = 		fn.getPromptBoxInput("woordvorm");
									var sWordformPos = 		fn.getPromptBoxInput("wordform_gigpos");
									var sNumberToBeAdded =	fn.getPromptBoxInput("aantal");
									
									var iNumberToBeAdded =	parseInt(sNumberToBeAdded);
									
									for (var wi = 0; wi<iNumberToBeAdded; wi++)
										{
										
										// when adding multiple wordforms, add an index to the pos,
										// to prevent doubling (which is not allowed by table definition)
										var sWordformPosToAdd = (iNumberToBeAdded>1) ? 
												(sWordformPos + wi) : sWordformPos;
										
										fn.callFunction("insert_wordform", 
												[sLemmaId, sWordform, sWordformPosToAdd], 
												function(){
											
											// when the end of the list of wordforms to add
											// has be reached, refresh the table to make those
											// visible
											if ( wi == (iNumberToBeAdded-1) )
												{			
												// clean cache to make sure
												// newly added forms at tail of the wordform list
												// won't be hidden because of a old table count
												// having a too little number of rows
												fn.cleanTableCache(fn.getTableName(confTable), function(){
													fn.refreshTable(confTable);
														}
													);												
												}
											
											});
										
										}
								});
								
							});	
						}
					
					
									
					
				}
			},
			
			"button_1":{
				
				"name": "Verwijder selectie",
				"click": function(t){
					
					fn.confirm("Verwijder selectie", "Weet u het zeker?", function(){
						
						var oRows = fx.getSelectedRowsFrom(t);
						
						oRows.every(function(){
							
							var bLastRow = fx.isLastRowOf(this, aRows);							
							fx.removeFromDatabaseGivenARow(this, function(){
								if (bLastRow) 
									fn.refreshTable(t);
							});							
							
						});
						
					});
					
					
				}
			},
			"button_2":{
				
				"name": "Nu: neutraal",
				"bgcolor": "white",
                "textcolor": "blue",
				"click": function(t){
					
					// switch
					bGedruktModeOfParadigm++;
					if (bGedruktModeOfParadigm == 3)
						bGedruktModeOfParadigm = 0;
					
					var bGedrukt = "";
					if (bGedruktModeOfParadigm == 1)
						bGedrukt = true;
					else if (bGedruktModeOfParadigm == 2)
						bGedrukt = false;
					
					fn.addFilters(t, {"gedrukt": bGedrukt});
					
					// change the button text accordingly
					putRightSortButtonName(t, 2, bGedruktModeOfParadigm);
					
					if (bGedruktModeOfParadigm == 0)
						{
						fn.addFilters(t, {"f_total_rel": ""});						
						fn.setSorting(t, {"modern_lemma": "asc", "rank": "asc"});
						}
					else if (bGedruktModeOfParadigm == 1)
						{
						fn.addFilters(t, {"f_total_rel": ""});
						fn.setSorting(t, {"modern_lemma": "asc", "rank": "asc"});
						}
					else if (bGedruktModeOfParadigm == 2)
						{
						fn.addFilters(t, {"f_total_rel": "."});
						fn.setSorting(t, {"f_total_rel": "desc", "modern_lemma": "asc", "rank": "asc"});
						}
					// keep search values visible in the search boxes
					sf.putCurrentValueInAllSearchBoxes(fn.getTableName(t));
					
				}
			},
			
			"button_3":{
				
				"name": "AA opblazen",
				"click": function(t){
					
					var oFirstRow =	fx.getFirstSelectedRowFrom(t);
					
					var pos = fx.getDataFromCellInRow(oFirstRow, "wordform_gigpos")
					
					if ( pos != 'AA(degree=pos)' )
						{
						fn.message("Niet toegestaan!", "Let op: AA's opblazen is alleen mogelijk op basis van AA(degree=pos)");
						}
					else
						{
						var sAwfId = fx.getDataFromCellInRow(oFirstRow, "analyzed_wordform_id");
						
						fn.callFunction("add_missing_comps_and_sups", [sAwfId], function(){
							fn.refreshTable(t);
							});
						}					
					
				}
			}
		},
		
		
		gemiste_paradigma_correcties: {
			
			"callback": function(t){
				
				conf.changeTableConfigValue("paradigma_view", "source", "visible", false);
				conf.changeTableConfigValue("paradigma_view", "flex", "visible", false);
				fn.callDatabase("paradigma_view", {}, null, {"displaylength": "50"});
			}
			
		},
		
		keurmerk_checklist: {
			"size": "80%",
			
			"keyup" : {				
				
				"uparrow": function(t){
					fnArrowFunction(t);
				},
				"downarrow": function(t){
					fnArrowFunction(t);
				}
			}
		},
		
		modified_lemmata_view: {
			
			"button_0":{
				"name": "Lemma en paradigma herstellen",
				"click": function(confTable){
					
					fn.confirm("Zeker weten?", "Weet u het zeker? Als de log groot is, kan deze operatie enige tijd kosten.", 
							function(){
						
						var oRowSelection = fx.getSelectedRowsFrom(confTable);
						
						oRowSelection.every(function(){
							
							var oCurrentRow =	this;							
							var sLemmaId = 		fx.getDataFromCellInRow(oCurrentRow, "lemma_id");
							
							fn.callFunction("restore_lemma_and_paradigm_and_ids", [sLemmaId],  
									function(){
								
										if (fx.isLastRowOf(oCurrentRow, oRowSelection))
											fn.refreshTable(confTable);
							});
						});
					});
				}
			}
		},
		
		modified_paradigm_view:{
			
			"button_0":{
				"name": "Woordvorm herstellen",
				"click": function(confTable){
					
					fn.confirm("Zeker weten?", "Weet u het zeker?", 
							function(){
						
						var oRowSelection = fx.getSelectedRowsFrom(confTable);
						
						oRowSelection.every(function(){
							
							var oCurrentRow =	this;
							var sAwfId = 		fx.getDataFromCellInRow(oCurrentRow, "analyzed_wordform_id");
							
							fn.callFunction("restore_wordform", [sAwfId],  
									function(){
										if (fx.isLastRowOf(oCurrentRow, oRowSelection))
											fn.refreshTable(confTable);
							});
						});
					});
				}
			}
		},
		

		lemmata_view: {
			
			"prereset_callback": function(t){
								
				sChosenParentId = null;
				fn.setCustomButtonName(t, 2, "Gekozen ouder:");
				
				
				bGedruktModeOfLemmata = 0;
				fn.addFilters(t, {"gedrukt": "", "tmp_f_total_rel": ""});
				putRightSortButtonName(t, 5, bGedruktModeOfLemmata);	
				
			},
			
			"repeat_callback": true,
			
			"callback": function(t){				
				
				
				var sTableName = fn.getTableName(t);
				
				// build the UNlock button if it doesn't exist yet
				if ( superUser() && fn.getIndexOfButtonNamed(sTableName, "(Un)lock")<0)
					{										
					fn.addCustomButton(sTableName, {
						"name": "(Un)lock",
						"bgcolor": "#F5D0A9",
						"click": function(t){
							
							var oSelectedRows = fx.getSelectedRowsFrom(t);
							
							oSelectedRows.every(function(){
								
								var sLemmaId =	fx.getRowId(this);
								var bLastRow =	fx.isLastRowOf(this, oSelectedRows);
								
								if ($.inArray( sLemmaId, aCurrentLemmaViewLocks ) >-1)
									{
									fn.callFunction("unlock_lemma", [sLemmaId], function(){
											if(bLastRow) 
												fn.refreshTable(t);
											}
										);
									}
								else
									{
									fn.callFunction("lock_lemma", [sLemmaId], function(){
											if(bLastRow) 
												fn.refreshTable(t);
											}
										);
									}
								
							});
							
						}
					});
					}
				
				var oRows = fx.getAllRows(t);
				
				oRows.every(function(){
					
					var oCurrentRow = this;
					
					// gedrukt must be blue
					var bIsGedrukt = fx.getDataFromCellInRow(oCurrentRow, "gedrukt");
					
					if (bIsGedrukt == 't')
						{
						var aColList = mt.getListOfVisibleColumnsOf(sTableName);
						for (var i=0; i<aColList.length; i++)
							{
							var sColName = aColList[i];							
							$(fx.getCellNode(oCurrentRow, sColName)).css("color", "blue");						
							}
						}
					
					// give parent other color (so they are recognizable)
					var bIsParent = fx.getDataFromCellInRow(oCurrentRow, "is_parent");					
					if (bIsParent == 't')
						{
						var aColList = mt.getListOfVisibleColumnsOf(sTableName);
						for (var i=0; i<aColList.length; i++)
							{
							var sColName = aColList[i];
							$(fx.getCellNode(oCurrentRow, sColName)).css("color", "salmon");						
							}
						}								
					
					// diminutives must be green
					var sVerkleinwoord = fx.getDataFromCellInRow(oCurrentRow, "verkleinwoord");
					if (sVerkleinwoord != '-')
						{
						var aColList = mt.getListOfVisibleColumnsOf(sTableName);
						for (var i=0; i<aColList.length; i++)
							{
							var sColName = aColList[i];
							$(fx.getCellNode(oCurrentRow, sColName)).css("color", "green");						
							}
						}
					
					
					});
				
				
				// apply locks
				
				var aLemmaIdsArr = new Array();
				
				oRows.every(function(i){
					
					aLemmaIdsArr[i] = fx.getRowId(this);					
				});
				
				// get the list of locked lemmata
				// and modify the rows accordingly
				fn.callFunction("get_locks_of_lemmata", [ fn.quote(aLemmaIdsArr.join("|")) ], function(){
					
					aCurrentLemmaViewLocks = (fn.getFunctionOutput()[0]).split("|");
					
					oRows.every(function(i){
						
						var oThisRow = this;
						
						if ( $.inArray( fx.getRowId(oThisRow), aCurrentLemmaViewLocks ) >-1 )
							{
							var aVisibleCells = mt.getListOfVisibleColumnsOf(fn.getTableName(t));
							
							for (var j=0; j<aVisibleCells.length; j++)
								{
								var sCurrentColumnName = aVisibleCells[j];
								
								// we mustn't lock the comment field
								if (sCurrentColumnName == 'opmerking_intern')
									continue;
								
								
								// make sure we can't edit the locked lemmata
								var sCellType =	fx.getCellType(oThisRow, sCurrentColumnName);								
								var eCell = 	fx.getCellNode(oThisRow, sCurrentColumnName);
								
								if (sCellType == 'text')
									{									
									$(eCell).editable('disable');
									$(eCell).css("opacity", "0.5");
									}
								else if (sCellType == 'checkbox')
									{
									$(eCell).find("input").attr("disabled", "disabled");
									$(eCell).css("opacity", "0.5");
									}
								else if (sCellType == 'selectbox')
									{
									$(eCell).editable('disable');
									$(eCell).css("opacity", "0.5");
									}
								}					
							
							}						
						
					});
					

						
					
				}); // end of function call
				
				
			},			
			
	
			"keyup" : {				
				
				"f9": function(confTable){
					
					var oRow =		fx.getFirstSelectedRowFrom(confTable);
					var sLemmaId =	fx.getDataFromCellInRow(oRow, "pkid");
					fn.callDatabase("lemmata_en_paradigma_view", 
							{"lemma_id": sLemmaId}, 
							null, 
							{ignore_initialisation_filters: true});
				}
			},
			
			"size": "90%",
			"button_0":{
				"name": "Voeg lemma toe",
				"click": function(confTable){
					
					var wordform = fn.prompt("Geef een lemma", 
							["modern_lemma", "lemma_gigpos"], 
							["", ""], 
							function(){
						
						var sLemma = 	fn.getPromptBoxInput("modern_lemma");
						var sLemmaPos =	fn.getPromptBoxInput("lemma_gigpos");
						
						fn.callFunction("insert_lemma", 
								[sLemma, sLemmaPos], 
								function(){
									fn.refreshTable(confTable);
						});
					});
				}
			},
			"button_1":{
				"name": "Verwijder selectie",
				"click": function(confTable){
					
					fn.confirm("Zeker weten?", "Weet u het zeker?", function(){
						
						var oRows = fx.getSelectedRowsFrom(confTable);
						oRows.every(function(){
							
							var bLastRow =	fx.isLastRowOf(this, oRows);
							var sLemmaId =	fx.getDataFromCellInRow(this, "pkid");
							
							fn.removeFromDatabaseGivenFieldValues("lemmata", 
									{"lemma_id": sLemmaId}, 
									function(){
										if (bLastRow) 
											fn.refreshTable(confTable);
									});
							
						});
					});
					
					
				}
			},
			"button_2":{
				"name": "Gekozen ouder:",
				"bgcolor":"yellow",
				"textcolor": "red",
				"click": function(confTable){
					
					var oRow = fx.getFirstSelectedRowFrom(confTable);
					
					if ( oRow.any() )
						{
						// remember chosen parent, and show it on the screen
						var sLemId = fx.getDataFromCellInRow(oRow, "pkid");
						var sLemma = fx.getDataFromCellInRow(oRow, "modern_lemma");
						
						fn.setCustomButtonName(confTable, 2, "Gekozen ouder:<b>"+sLemma+"</b>");
						sChosenParentId = sLemId;
						}
					
					// press shift + click to cancel parent selection 
					if (kf._getPressedKey() == 'shift')
					{
					fn.setCustomButtonName(confTable, 2, "Gekozen ouder:");
					sChosenParentId = null;
					}

				}
			},
			"button_3":{
				"name": "Link ouder & kind",
				"bgcolor":"red",
				"textcolor": "yellow",
				"click": function(confTable){
					
					if (sChosenParentId != null)
						{
						var oRows = fx.getSelectedRowsFrom(confTable);
						if (oRows.any())
							{
							
							oRows.every(function(){
								
								var sLemId = 	fx.getDataFromCellInRow(this, "pkid");
								var bLastNode =	fx.isLastRowOf(this, oRows);
								
								fn.updateDatabaseGivenFieldValues("lemmata", 
										{"lemma_id": sLemId}, 
										{"parent_id": sChosenParentId}, 
										false,
										function(){
											
											if (bLastNode)
												{
												
												// reset: no chosen parent, to prevent accidental linking
												// [commented out, because Katrien doesn't like this]
												//fn.setCustomButtonName(confTable, 2, "Gekozen ouder:");
												//sChosenParentId = null;
												
												fn.updateDatabaseGivenFieldValues("lemmata", 
														{"lemma_id": sChosenParentId}, 
														{"is_parent": true}, 
														false, 
														function(){fn.refreshTable(confTable);});
												}
										});
							});
							
							
							}
						else
							{
							fn.message("Let op", "Kies een of meerdere sublemmata!");							
							}
						
						
						}
					else
						{
						fn.message("Let op", "Kies eerst een parent lemma!");
						}
				}
			},
			"button_4": {
				
				"name": "Unlink ouder",
				"bgcolor":"red",
				"textcolor": "yellow",
				"click": function(confTable){
					
					
					var oRows = fx.getSelectedRowsFrom(confTable);
					
					if (oRows.any())
						{
						oRows.every(function(){
							
							var sLemId = 	fx.getDataFromCellInRow(this, "pkid");
							var sParentId =	fx.getDataFromCellInRow(this, "parent_id");
							var bLastNode =	fx.isLastRowOf(this, oRows);
							
							fn.updateDatabaseGivenFieldValues("lemmata", 
									{"lemma_id": sLemId}, 
									{"parent_id": 'NULL'}, 
									false,
									function(){
										if (bLastNode)
											{
											
											fn.callFunction("set_parent_to_false", [sParentId],
													function(){
												
												fn.refreshTable(confTable);
												// reset: no chosen parent
												fn.setCustomButtonName(confTable, 2, "Gekozen ouder:");
												sChosenParentId = null;
												});
											
											}
									});
							});
						}
					else
						{
						fn.message("Let op", "Kies een of meerdere sublemmata!");
						}
					
					
				}
			},

			"button_5":{
				
				"name": "Nu: neutraal",
				"bgcolor": "white",
                "textcolor": "blue",
				"click": function(t){
					
					// switch
					bGedruktModeOfLemmata++;
					if (bGedruktModeOfLemmata == 3)
						bGedruktModeOfLemmata = 0;
					
					var bGedrukt = "";
					if (bGedruktModeOfLemmata == 1)
						bGedrukt = true;
					else if (bGedruktModeOfLemmata == 2)
						bGedrukt = false;
					
					fn.addFilters(t, {"gedrukt": bGedrukt});
					
					// change the button text accordingly
					putRightSortButtonName(t, 5, bGedruktModeOfLemmata);
					
					if (bGedruktModeOfLemmata == 0)
						{
						fn.addFilters(t, {"tmp_f_total_rel": ""});
						fn.setSorting(t, {"modern_lemma": "asc"});
						}
					else if (bGedruktModeOfLemmata == 1)
						{
						fn.addFilters(t, {"tmp_f_total_rel": ""});
						fn.setSorting(t, {"modern_lemma": "asc"});
						}
					else if (bGedruktModeOfLemmata == 2)
						{
						fn.addFilters(t, {"tmp_f_total_rel": "."});
						fn.setSorting(t, {"tmp_f_total_rel": "desc", "modern_lemma": "asc"});
						}
					// keep search values visible in the search boxes
					sf.putCurrentValueInAllSearchBoxes(fn.getTableName(t));
					
				}
			},
			
			
			"contextmenu": {
				
                // here the structure of the contextmenu is given
                "items": {
                    "verkleinwoord": {"name": getVerkleinwoord()},
                    "partlemma": {"name": getPartLemma()},
                    "link": {"name": "<b>Maak link aan</b>"},
                    "unlink": {"name": "<b>Unlink</b>"}
                },
                // callback function called after the user has chosen an option in the context menu
                "callback": function(confTable, confNode, key, options) {
 
                	var oRow = fx.getRow(confNode);
                	
                    // key indicates the option the user has chosen
                    if (key == 'verkleinwoord')
                        {                    	
                    	sVerkleinwoord =	fx.getDataFromCellInRow(oRow, "modern_lemma");
                    	sVerkleinwoordId =	fx.getDataFromCellInRow(oRow, "pkid");

                    	setContextMenuOptions(key, options);
                        }
                    else if (key == 'partlemma')
                        {                       
                    	sPartLemma  = 	fx.getDataFromCellInRow(oRow, "modern_lemma");
                    	sPartLemmaId = 	fx.getDataFromCellInRow(oRow, "pkid");
                    	
                    	setContextMenuOptions(key, options);
                        }
                    else if (key == 'link')
                    {
                    	if (sVerkleinwoordId == "" || sPartLemmaId == "")
                		{
                		fn.message("Let op", "Kies eerst een verkleinwoord én een deeltje");
			}
                	else
                		{
                		fn.callFunction("link_verkleinwoord", [sVerkleinwoordId, sPartLemmaId], function(){
                    		
                    		sVerkleinwoord = "";
                    		sPartLemma = "";
                    		sVerkleinwoordId = "";
                    		sPartLemmaId = "";
                    		
                    		setContextMenuOptions(key, options);
                    		
                    		fn.refreshTable(confTable);
                    		});
                		}
                    	
                    }
                    else if (key == 'unlink')
                    {
                    	if (sVerkleinwoordId == "")
                    		{
                    		fn.message("Let op", "Kies eerst een verkleinwoord");
                    		}
                    	else
                    		{
                    		fn.callFunction("unlink_verkleinwoord", [sVerkleinwoordId], function(){
                        		
                        		sVerkleinwoord = "";
                        		sPartLemma = "";
                        		sVerkleinwoordId = "";
                        		sPartLemmaId = "";
                        		
                        		setContextMenuOptions(key, options);
                        		
                        		fn.refreshTable(confTable);
                        		});
                    		}
                    	
                    }
                }
            }
			
			
		},
		paradigma_view: {
			
			"repeat_callback": true,
			
			"callback": function(t){
				
				var oRows = 		fx.getAllRows(t);
				var sTableName =	fn.getTableName(t);
				
				// If the LM'er is working with the keurmerk_checklist
				// we need to highlight some lines (= show relevant lines).
				// Otherwise, we don't need to.
				if (fn.tableExists("keurmerk_checklist"))
					{
					
					oRows.every(function(){
						
						var oThisRow = this;
						var sSource = fx.getDataFromCellInRow(oThisRow, "source");
						
						if (sSource == 'niet-homoniemen Molex')
							{
							var aColList = mt.getListOfVisibleColumnsOf(sTableName);
							for (var i=0; i<aColList.length; i++)
								{
								var sColName = aColList[i];
								
								$(fx.getCellNode(oThisRow, sColName)).css("color", "red");
								
								}
							
							
							}
						
						});
					}
				
			},
			
			"keyup" : {	
				
				"ctrl": function(t){
					
					// if the LM'er is working with the keurmerk_checklist
					// we need him/her to be able to toggle keurmerk checkbox
					// in paradigma view with the ctrl button.
					// Otherwise, we don't need this.
					if (fn.tableExists("keurmerk_checklist"))
					{
						var oFirstRow = fx.getFirstSelectedRowFrom(t);
						
						// Lex'it engine not updated yet, so use 
						// fn.toggleCheckbox function code instead of true function
						$(fx.getCellNode(oFirstRow, "keurmerk")).find("input").eq(0).focus();
						$(fx.getCellNode(oFirstRow, "keurmerk")).find("input").eq(0).click();
						$(fx.getCellNode(oFirstRow, "keurmerk")).find("input").eq(0).blur();
					}
					
					
				}
			},
			
			"size": "90%",
			"button_0":{
				"name": "Voeg woordvorm toe",
				"click": function(confTable){
					
					var aFirstRow;
					var sLemmaId;
					var sLemma = null;
					
					// is there is no paradigm yet, get the lemma id from the lemma table
					if (fn.tableIsEmpty(confTable))
						{
						aFirstRow =		fx.getFirstSelectedRowFrom("lemmata_view");
						sLemmaId = 		fx.getDataFromCellInRow(aFirstRow, "pkid");
						sLemma =  		fx.getDataFromCellInRow(aFirstRow, "modern_lemma");
						
						}
					// otherwise just read it from the current table
					else
						{
						aFirstRow =		fx.getFirstSelectedRowFrom(confTable);						
						if (aFirstRow.count()==0)
							aFirstRow = fx.getFirstRowFrom(confTable);
						
						sLemmaId = 		fx.getDataFromCellInRow(aFirstRow, "lemma_id");
						// in this particular case, sLemma will be
						// requested by following fn.getRecord call
						}
					
					
					
					fn.getRecord("lemmata", sLemmaId, function(response){
					
						// if we don't have a modern_lemma to show, get it
						
						if (sLemma == null)
							sLemma =  response["modern_lemma"];						
						
						fn.prompt("Geef woordvorm voor '"+sLemma+"'", 
								["woordvorm", "wordform_gigpos"], 
								["", ""], 
								function(){
							
								var sWordform = 	fn.getPromptBoxInput("woordvorm");
								var sWordformPos =	fn.getPromptBoxInput("wordform_gigpos");
							
								fn.callFunction("insert_wordform", 
										[sLemmaId, sWordform, sWordformPos], 
										function(){
											fn.refreshTable(confTable);
								});
							});
							
						});					
					
				}
			},
			"button_1":{
				
				"name": "Verwijder selectie",
				"click": function(confTable){
					
					fn.confirm("Zeker weten?", "Weet u het zeker?", function(){
						
						var oRows = fx.getSelectedRowsFrom(confTable);
						oRows.every(function(){
							
							var bLastRow = 		fx.isLastRowOf(this, oRow);
							var sAnalyzedWfId =	fx.getDataFromCellInRow(this, "pkid");
							
							fn.removeFromDatabaseGivenFieldValues("analyzed_wordforms", 
									{"analyzed_wordform_id": sAnalyzedWfId}, 
									function(){
										if (bLastRow) 
											fn.refreshTable(confTable);
									});
							
						});
						
					});
					
					
				}
			}
		}
		
};


function putRightSortButtonName(t, iButtonNumber, bGedruktMode){
	var sText;
	if (bGedruktMode == 0)
		sText = "Nu: neutraal";
	else if (bGedruktMode == 1)
		sText = "Nu: alleen gedrukt";
	else if (bGedruktMode == 2)
		sText = "Nu: gesorteerd naar freq";
	fn.setCustomButtonName(t, iButtonNumber, sText );
}


// configuration at column level
oTableConfigurationList = {
		
		nuancerende_opmerkingen:{
			
			short_code:{
				"colsort": "asc",
				"editable": false //true
			},
			nuancerende_opmerking:{
				"editable": false //true
				
			}	
		},
		
		lemmata_en_paradigma_view: {
			
			unique_id:{
				"visible": false
			},
			analyzed_wordform_id:{
				"visible": false
			}, 
			lemma_id:{
				"visible": false,
				"click": function(t, n){
					
					var sLemmaId = fn.getDataFromCellNode(n);
					fn.callDatabase("lemmata_view", {"pkid": sLemmaId});
				}
			}, 
			wordform_id:{
				"visible": false
			},
			modern_lemma:{
				
				"colsort": "asc",    // sort #1
				"click": function(t, n){					
					var sLemmaId = fn.getDataFromSiblingNode(n, "lemma_id");
					fn.callDatabase("lemmata_view", {"pkid": sLemmaId});
				}
			}, 
			lemma_gigpos:{
				"click": function(t, n){
					var sLemmaId = fn.getDataFromSiblingNode(n, "lemma_id");
					fn.callDatabase("lemmata_view", {"pkid": sLemmaId});
				}
			}, 
			lem_keurmerk:{
				"click": function(t, n){
					var sLemmaId = fn.getDataFromSiblingNode(n, "lemma_id");
					fn.callDatabase("lemmata_view", {"pkid": sLemmaId});
				}
			},
			lem_source:{
				"visible": false,
				"click": function(t, n){
					var sLemmaId = fn.getDataFromSiblingNode(n, "lemma_id");
					fn.callDatabase("lemmata_view", {"pkid": sLemmaId});
				}
			},
			wordform:{
				"editable": true,
				"editcallback": function(t, n, value){
					
					fn.refreshTable(t);					
				}
			}, 
			wordform_gigpos:{
				"editable": true,
				"editcallback": function(t, nRow, value){
					
					var oRow = fx.getRow(nRow);
					
					// get the rank corresponding to this pos
					// (we need to escape the parenthesis, as Lex'it cannot know those are no
					//  part of any regex)
					
					fn.getRecordGivenFieldValues("pos_to_rang", {"pos": fn.escapeRegexChars(value)}, 
							function(record){
							
								var sRangvalue = record["rang"];								
								var iRankvalue = (typeof sRangvalue != 'undefined') ? parseInt(sRangvalue) : 0;
								
								fx.updateDatabaseGivenACellOrRow(oRow, 
									{"rank": iRankvalue}, 
									function(){
									
										// update rank in the analyzed_wordforms too
										var sAwfId =	fx.getDataFromCellInRow(oRow, "analyzed_wordform_id");
										
										fn.updateDatabaseGivenFieldValues("analyzed_wordforms", 
												{"analyzed_wordform_id": sAwfId}, 
												{"rank": iRankvalue},
												false,
												function(){
													// refresh to make sorting according to 
													// paradigm position visible 
													fn.refreshTable(t, function(){
														
														fn.callFunction("check_analyzedwordforms", [sAwfId], function(response){
															
															processAwfCheck(sAwfId, response);
														});
													});
													
												}
										);
									
									});							
								
						});					
					
				}
			}, 
			wordform_afbr:{				
				"editable": true
			},
			afbr_auto:{
				"editable": true
			},
			online: {
				
			},
			publiceren: {
				"bgcolor": "#E0F8EC",
				"editable": true
			},
			wf_keurmerk:{
				"bgcolor": "#E0F8EC",
				"editable": true
			}, 
			rank:{
				"colsort": "asc",    // sort #2
				"visible": false
			},
			
			comment:{
				"bgcolor": "#E0F8EC",
				"editable": true
			},
			comment_intern: {
				
				// BEWARE, DON'T REMOVE THIS PART
				// ------------------------------
				"flexible_visibility": false,
				"visible": (document.URL.indexOf( "inl.loc" )>-1),
				// ------------------------------
				
				"bgcolor": "#E0F8EC",
				"editable": true
			},
			wf_source:{
				"visible": false
			}, 
			autom_wf:{
				"visible": false
			}, 
			gedrukt:{
				
			},
			vk_status:{
				"visible": false
			},
			th_wordform_afbr:{
				"bgcolor": "#E0F8EC",
				"editable": true
			},
			th_wordform:{
				"bgcolor": "#E0F8EC",
				"editable": true
			}
			
		},
		
		
		
		
		modified_lemmata_view: {
			"modification_date":{
				"colsort": "desc" // sort #1
			},
			"modification_time": {
				"colsort": "desc" // sort #2
			}
		},
		
		modified_paradigm_view: {
			"modification_date":{
				"colsort": "desc" // sort #1
			},
			"modification_time": {
				"colsort": "desc" // sort #2
			}
		},
		
		
		morphological_view: {
			
			morphological_analysis_id: {
				"visible": false
			},
			main_lemma_id: {
				"visible": false
			},
			part_morphological_analysis_id: {
				"visible": false
			},
			part_lemma_id: {
				"visible": false
			}
		},
		

		

		lemmata_view: {
			
			"pkid":{				
//				"visible": false
			},
			"is_parent":{				
				"visible": false
			},
			"parent":{
				"cell_tooltip": "Toon alle lemmata behorend bij dit superlemma",
				"click": function(t, n){
					
					var sLemma = fn.getDataFromCellNode(n);
					if (sLemma!='')
						fn.callDatabase(t, {"parent": sLemma});
				}
			},
			"modern_lemma": {		
				"colsort": "asc",
				"editable": true
			},
			"online": {
				"bgcolor": "#E0F8EC",
				"editable": true
			},
			"publiceren": {
				
			},
			"th_lemma": {				
				"editable": true				
			},
			"keurmerk": {				
				"editable": true				
			},
			"sublemma_type": {				
				"editable": true				
			},
			"opmerking": {				
				"visible": false // this column is only for transit of opmerking_extern
			},
			"opmerking_extern": {				
				"editable": true
			},
			"notitie": {				
				"editable": true
			},
			"opmerking_intern": {
				// BEWARE, DON'T REMOVE THIS PART
				// ------------------------------
				"flexible_visibility": false,
				"visible": (document.URL.indexOf( "inl.loc" )>-1),
				// ------------------------------
				"editable": true
			},
			"gloss": {				
				"editable": true				
			},
			"kapstok": {				
				"editable": true
			},
			"lemma_gigpos": {				
				"editable": true				
			},	
			"gb_id":{				
				"visible": false,
				"editable": superUser()
			},
			"gb_wrdcat": {
				"editable": true
			},
			"gb_znwlid": {
				"editable": true
			},
			"lidw": {
				"editable": true,
				"visible": false
			},
			"geslacht": {
				"editable": true,
				"visible": false
			},
			"toon_paradigma":{				
				"button": "Paradigma",
				"click": function( confTable, confNode){					
					var lemma_id = fn.getDataFromSiblingNode(confNode, "pkid");
					fn.callDatabase("lemmata_en_paradigma_view", 
							{"lemma_id": lemma_id}, 
							null, 
							{ignore_initialisation_filters: true});
				}
			},
			"toon_morfologie":{				
				"button": "Morfologie",
				"click": function( confTable, confNode){					
					var lemma_id = fn.getDataFromSiblingNode(confNode, "pkid");
					fn.callDatabase("morphological_view", {"main_lemma_id": lemma_id});
				}
			},
			"trademark": {
				"editable": true,
				"visible": false
			},
			"homo":{
				
			},
			"weg": {
				"visible": false,
				"editable": true
			},
			"verdacht": {
				"visible": false,
				"editable": true
			},
			"taaladvies": {
				"editable": true
			},
			"uitspraak": {
				"editable": true
			},
			"status": {
				"editable": true
			},
			"nuanc_opm": {
				"editable": true,
				"dblclick": function(t, n){					
					var sNuancOpm = fn.getDataFromCellNode(n);
					fn.callDatabase("nuancerende_opmerkingen", {"short_code": "exact:"+sNuancOpm});
				}
			},
			"taalvariant": {
				"editable": true
			},
			"herkomst": {
				"editable": true
			},
			"gedrukt": {
				"editable": (fn.getCurrentUser()=='katrien' || fn.getCurrentUser()=='katrienvp'),
				"editcallback": function(t, n, value){
					// setting gedrukt=true automatically means online=true
					if (value == true)
						{				
						fn.updateDatabaseGivenANode(fn.getRowNode(n), {"online": value}, function(){
								fn.refreshTable(t);
							});
						}
				}
			},
			"verkleinwoord": {
				"editable": true
			},
			"anc":{
				"editable": fn.getCurrentUser()=='katrien', // only Katrien is entitled to change that
				"editcallback": function(t, n, value){					
					var sLemmaId = fn.getDataFromSiblingNode(n, "pkid");
					fn.updateDatabaseGivenFieldValues(
							"surinaams_and_antilliaans_commissions_selections", 
							{"lemma_id": sLemmaId}, 
							{"anc": value});
				}
			},
			"snc":{
				"editable": fn.getCurrentUser()=='katrien', // only Katrien is entitled to change that
				"editcallback": function(t, n, value){
					var sLemmaId = fn.getDataFromSiblingNode(n, "pkid");
					fn.updateDatabaseGivenFieldValues(
							"surinaams_and_antilliaans_commissions_selections", 
							{"lemma_id": sLemmaId}, 
							{"snc": value});
				}
			}
			
		},
		
		paradigma_view: {
			"pkid":{				
				"visible": false
			},
			"lemma_id":{				
				"visible": false
			},
			"wordform_id":{				
				"visible": false
			},
			"pkid":{				
				"visible": false
			},
			"wordform":{	
				"editable": true
			},
			"wordform_afbr":{				
				"editable": true
			},
			"th_wordform": {				
				"visible": false				
			},
			"th_wordform_afbr": {				
				"visible": false				
			},
			"wordform_gigpos":{				
				"editable": true
			},
			"flex":{				
				"editable": true
			},
			"keurmerk":{				
				"editable": true
			},
			"comment": {
				"editable": true
			},
			
			"rang":{			
				"colsort": "asc",
				"visible": false
			}
			
		},
		
		
		gemiste_paradigma_correcties: {
			
			unique_id: {
				"visible": false
			},
			lemma_id: {
				"click": function(t, n){
					
					var sLemmaId = fn.getDataFromCellInRowNode(n, "lemma_id");
					fn.callDatabase("paradigma_view", 
							{"lemma_id": sLemmaId});
				}
			},
			modern_lemma: {
				"colsort": "asc" // sort #1
			}, 
			analyzed_wordform_id: {
				"visible": false
			}, 
			wordform_gigpos: {
				"colsort": "asc", // sort #2
				"click": function(t, n){
					
					var sLemmaId =	fn.getDataFromCellInRowNode(n, "lemma_id");
					var sAwfId = 	fn.getDataFromCellInRowNode(n, "analyzed_wordform_id");

					fn.callDatabase("paradigma_view", 
							{"lemma_id": sLemmaId},
							function(){
								
								var nRow = fn.getRowNodeWhere("paradigma_view", 
										{"pkid": sAwfId});		
								
								var iRowNumber = fn.getRowNodeNumberOnScreen(nRow);
								if (iRowNumber>-1)
									fn.selectRowNode("paradigma_view", iRowNumber);
							});
					
				}
			}, 
			vermoedelijk_fout: {
				"bgcolor": "#F5D0A9"
			}, 
			correctie: {
				"bgcolor": "#BCF5A9"
			}, 
			ok: {
				"button": "OK",
				"click": function( t, n ){
					
					var sLemmaId =		fn.getDataFromCellInRowNode(n, "lemma_id");
					var sAwfId = 		fn.getDataFromCellInRowNode(n, "analyzed_wordform_id");
					var sCorrection = 	fn.getDataFromCellInRowNode(n, "correctie");
					
					fn.updateDatabaseGivenFieldValues("paradigma_view", 
							{"pkid": sAwfId}, 
							{"wordform": sCorrection}, 
							false, 
							function(){
								
								fn.removeFromDatabaseGivenANode(n, function(){
									fn.refreshTable(t);
								});
								fn.callDatabase("paradigma_view", 
										{"lemma_id": sLemmaId},
										function(){
											
											var nRow = fn.getRowNodeWhere("paradigma_view", 
													{"pkid": sAwfId});								
											var iRowNumber = fn.getRowNodeNumberOnScreen(nRow);
											if (iRowNumber>-1)
												fn.selectRowNode("paradigma_view", iRowNumber);
										});
								
							});
				}
			}, 
			gooiweg: {
				"button": "Weg ermee!",
				"click": function( t, n ){
					
					var sLemmaId =	fn.getDataFromCellInRowNode(n, "lemma_id");
					var sAwfId =	fn.getDataFromCellInRowNode(n, "analyzed_wordform_id");
					
					fn.removeFromDatabaseGivenANode(n, function(){
						fn.refreshTable(t);
					});	
					fn.callDatabase("paradigma_view", 
							{"lemma_id": sLemmaId});
				}
			}
			
		},
		
		keurmerk_checklist:{
			
			lemma_id: {
				"colsort": "asc"
			}, 
			modern_lemma: {
				
			}, 
			analyzed_wordform_id: {
				
			}, 
			wordform: {
				"bgcolor": "#E0F8EC",
				"click": function( t, n ){
					
					var iAwfId =	fn.getDataFromCellInRowNode(n, "analyzed_wordform_id");
					var iLemmaId =	fn.getDataFromCellInRowNode(n, "lemma_id");
					
					fn.callDatabase("paradigma_view", {"lemma_id": iLemmaId});
					
					
				}
			}, 
			keurmerk: {
				"visible": false 
			}
			
			
		},
		
		paradigma_telling_check: {
			
			gigpos: {
				"choosefrom":[]
			},
			lemma_id :{
				
				"click": function(t, n){
					var lemId = fn.getDataFromCellNode(n);
					fn.callDatabase("lemmata_en_paradigma_view", {"lemma_id": lemId});
				}
			},
			modern_lemma :{
				
				"click": function(t, n){					
					var lemId = fn.getDataFromSiblingNode(n, "lemma_id");
					fn.callDatabase("lemmata_en_paradigma_view", {"lemma_id": lemId});
				}
			},
			gecontroleerd: {
				"editable": true
			}
			
		},
		missende_afbrekingen:{
			lemma_id: {
				"colsort": "asc",
				"click": function(t, n){
					var lemId = fn.getDataFromCellNode(n);
					fn.callDatabase("lemmata_en_paradigma_view", {"lemma_id": lemId});
				}
			},
			lemma_gigpos: {
				"choosefrom": []
			}
		},
		
		
		"lemmatawithgender": {
			
			gender_corr : {
				"bgcolor": "#E0F8EC",
				"editable": true
			},
			opmerking : {
				"bgcolor": "#E0F8EC",
				"editable": true
			}
			
		},
		
		export_versions:{
			"id":{
				"colsort": "desc"
			},
			"recipient": {
				"editable": true
			},
			"comment": {
				"editable": true
			},
			"major":{
				"editable": true
			},
			"minor":{
				"editable": true
			}
			
		},
		
		gb05_not_in_gigmol_v2: {
			
			lemma_id: {
				"bgcolor": "#CECEF6"
			},
			modern_lemma: {
				"bgcolor": "#CECEF6"
			},
			lemma_gigpos: {
				"bgcolor": "#CECEF6"
			},
			gb_id: {
				"bgcolor": "#CECEF6"
			},
			opmerking: {
				"bgcolor": "#CEF6D8",
				"editable": true
			},
			unique_id: {
				"colsort": "asc",
				"visible": false
			},
			id: {
				"visible": false
			}
		}
};


// give an error message, if the comparison between the analyzed_wordforms record
// and the lemma_and_paradigma_view record gives a mismatch
function processAwfCheck(sAwfId, response){
	
	var bGeslaagd = (response["check_analyzedwordforms"] == 't');
	
	if (!bGeslaagd)
		fn.message("Fout", 
				"Het verwerken van analyzed_wordform_id "+sAwfId+" "+
				"is niet goed verlopen. Kopieer de tekst van deze foutmelding en " +
				"geef die door aan de ontwikkelaar.");
};