// list of tables that must be hidden
oHiddenTablesList = [];

oShowOnlyTables = ["jvk_alles"];

function bundelFeatures(feature1, feature2){
	if (feature1!=feature2)
		{
		if (feature1 != '' && feature2 != '')
			return feature1+","+feature2;
		else if (feature1 != '')
			return feature1;
		else return feature2;
		}
		
	return feature1;
}


var bWeAreInitializing = true;
oTableSettingsList = {
		
		jvk_gb_lemma_combined: {	
			
			"nice_name": "VERZAMELTABEL",
			
			"get_focus_on_tab": false,
			
			"selection_button_active": true,
			
			"button_0": {
				
				"name": "Ongedaan maken",
				"click": function(t){
					
					var aRows = fn.getSelectedRowsFrom(t);
					
					aRows.each(function(){
						
						var nCurrenNode = this;
						
						var id = fn.getDataFromCellInRowNode("jvk_gb_lemma_combined", nCurrenNode, "id");
						var gb05_id = fn.getDataFromCellInRowNode("jvk_gb_lemma_combined", nCurrenNode, "gb05_id");
						var gb05_superid = fn.getDataFromCellInRowNode("jvk_gb_lemma_combined", nCurrenNode, "gb05_superid");
						var lem05 = fn.getDataFromCellInRowNode("jvk_gb_lemma_combined", nCurrenNode, "lem05");
						var wrdcat05 = fn.getDataFromCellInRowNode("jvk_gb_lemma_combined", nCurrenNode, "wrdcat05");
						var znwlid05 = fn.getDataFromCellInRowNode("jvk_gb_lemma_combined", nCurrenNode, "znwlid05");
						var betek05 = fn.getDataFromCellInRowNode("jvk_gb_lemma_combined", nCurrenNode, "betek05");
						var gigantpos = fn.getDataFromCellInRowNode("jvk_gb_lemma_combined", nCurrenNode, "gigantpos");
						var simplepos = fn.getDataFromCellInRowNode("jvk_gb_lemma_combined", nCurrenNode, "simplepos");
						var gbParadigm = fn.getDataFromCellInRowNode("jvk_gb_lemma_combined", nCurrenNode, "gb_paradigm");
						var bIsUnique = fn.getDataFromCellInRowNode("jvk_gb_lemma_combined", nCurrenNode, "is_unique");
						
						fn.insertIntoDatabase("gb_ambigu", 
								{
								"gb05_id": gb05_id,
								"gb05_superid": gb05_superid,							  
								"lem05": lem05,
								"wrdcat05": wrdcat05,
								"znwlid05": znwlid05,
								"betek05": betek05,
								"gigant_pos": gigantpos,
								"simple_pos": simplepos,
								"paradigm": gbParadigm,
								"is_unique": (bIsUnique == 't')
							  }, 
								null, fn.isLastNodeOf(this, aRows), function(){
								  fn.updateDatabaseGivenFieldValues("jvk_alles", {"id": id}, {"hide": false}, true);
								  fn.removeFromDatabaseGivenANode("jvk_gb_lemma_combined", nCurrenNode, true);
						});
					});
					
					
				}
			}
			
		},
		
		jvk_alles: {
			
			"callback": function(t){
				
				if (bWeAreInitializing)
					{
					// at initialisation only
					fn.callDatabase("gb_ambigu", null, function(){					
						fn.alignTables("jvk_alles", "gb_ambigu", function(){
							
							fn.callDatabase("jvk_gb_lemma_combined", null, function(){
								fn.pileupTables("jvk_alles", "jvk_gb_lemma_combined");
							});
						});
						
					});
					bWeAreInitializing = false;
					}
				
				
				// generate tooltip showing the paradigm
				var aAllRows = fn.getAllRows(t);
				
				aAllRows.each(function(){
					
					var sParadigm = fn.getDataFromCellInRowNode(t, this, "paradigm");			
					for (var i=0; i<mt.getListOfVisibleColumnsOf(fn.getTableName(t)).length; i++)
						{
						if (mt.getListOfVisibleColumnsOf(fn.getTableName(t))[i] == 'lemma_id')
							continue;
						
						var eLem = fn.getCellElement(t, this, mt.getListOfVisibleColumnsOf(fn.getTableName(t))[i]);
						// add space to allow the tag to be split up automatically if it is too long					
						$(eLem).attr("title", sParadigm.replace(/,/g, ', '));
						}
					
				});
			},
			
			"repeat_callback": true,
			
			"selection_button_active": true,
			
			"size": "50%",
			
			"button_0": {
				
				"name": "Gooi definitief weg",
				"click": function(t){
					var answer = confirm("Zeker weten?");
					if (answer)
						{
						var aRows = fn.getSelectedRowsFrom(t);
						aRows.each(function(){
							fn.removeFromDatabaseGivenANode("jvk_alles", this, fn.isLastNodeOf(this, aRows)); 
						});
						}
					
				}
				
			},
			
			"button_1": {
				
				"name": "Maak nieuw lemma aan",
				"tooltip": "Maak een nieuw lemma aan in Jvk",
				"click": function(confTable){
					
					fn.prompt("Nieuw lemma aanmaken", ["lemma", "part of speech"], null, 
							function(){
						
						// first generate a new jvk id for this new lemma
						var d = new Date();
						var sNewJvkId = "newjvk"+d.getTime();
						var sNewId = d.getTime();
						
						// get lemma form and simple pos filled in by user
						var sLemma = fn.getPromptUserInput("lemma");
						var sPos = fn.getPromptUserInput("part of speech");
						
						// put it into the jvk table
						fn.insertIntoDatabase("jvk_alles", 
								{
								"id": sNewId,
								"lemma_id": sNewJvkId,
								"lemma": sLemma,
								"simple_pos": sPos
								}, 
								null, false, function(){
									
									// define a draw callback; that will be called after the
									// software has call the right page (see further)
									fn.addDrawCallback("jvk_alles", function(){
										
										fn.refreshTable("jvk_alles",
											function(){
											
											var nNode = fn.getNodeWhere("jvk_alles", 
													{
													"id": sNewId,
													"lemma_id": sNewJvkId,
													"lemma": sLemma,
													"simple_pos": sPos
													});
											
											var iRowNumber = fn.getRowNumberOnScreen("jvk_alles", nNode);									
											fn.selectRow("jvk_alles", iRowNumber);
											
										});								
										
									});
									
									fn.goToTheRightPage("jvk_alles", "lemma", sLemma);
								
									
										
							});
					});
				}
			},
			
//			"button_0": {
//				"name": "Bundelen",
//				"click": function(t){
//					var aRows = fn.getSelectedRowsFrom(t);
//					
//					if (aRows.length!=2)
//						{
//						alert("Selecteer twee lemmata");
//						}
//					else
//						{
//						var jvkRow1 = aRows[0];
//						var jvkRow2 = aRows[1];
//						
//						var id1 = fn.getDataFromCellInRowNode("jvk_alles", jvkRow1, "id");
//						var lemma_id1 = fn.getDataFromCellInRowNode("jvk_alles", jvkRow1, "lemma_id");
//						var lemma1 = fn.getDataFromCellInRowNode("jvk_alles", jvkRow1, "lemma");
//						var tmp1 = fn.getDataFromCellInRowNode("jvk_alles", jvkRow1, "tmp");
//						var orig_pos1 = fn.getDataFromCellInRowNode("jvk_alles", jvkRow1, "orig_pos");
//						var gigant_pos1 = fn.getDataFromCellInRowNode("jvk_alles", jvkRow1, "gigant_pos");
//						var simple_pos1 = fn.getDataFromCellInRowNode("jvk_alles", jvkRow1, "simple_pos");
//						var keurmerk1 = fn.getDataFromCellInRowNode("jvk_alles", jvkRow1, "keurmerk");
//						
//						var id2 = fn.getDataFromCellInRowNode("jvk_alles", jvkRow2, "id");
//						var lemma_id2 = fn.getDataFromCellInRowNode("jvk_alles", jvkRow2, "lemma_id");
//						var lemma2 = fn.getDataFromCellInRowNode("jvk_alles", jvkRow2, "lemma");
//						var tmp2 = fn.getDataFromCellInRowNode("jvk_alles", jvkRow2, "tmp");
//						var orig_pos2 = fn.getDataFromCellInRowNode("jvk_alles", jvkRow2, "orig_pos");
//						var gigant_pos2 = fn.getDataFromCellInRowNode("jvk_alles", jvkRow2, "gigant_pos");
//						var simple_pos2 = fn.getDataFromCellInRowNode("jvk_alles", jvkRow2, "simple_pos");
//						var keurmerk2 = fn.getDataFromCellInRowNode("jvk_alles", jvkRow2, "keurmerk");
//						
//						fn.updateDatabaseGivenANode("jvk_alles", jvkRow1, 
//								["id", "lemma_id", "lemma", "tmp", "orig_pos", "gigant_pos", "simple_pos", "keurmerk"], 
//								[
//								 bundelFeatures(id1, id2),
//								 bundelFeatures(lemma_id1, lemma_id2),
//								 bundelFeatures(lemma1, lemma2),
//								 bundelFeatures(tmp1, tmp2),
//								 bundelFeatures(orig_pos1, orig_pos2),
//								 bundelFeatures(gigant_pos1, gigant_pos2),
//								 bundelFeatures(simple_pos1, simple_pos2),
//								 bundelFeatures(keurmerk1, keurmerk2)
//								 ], false, function(){
//							
//								fn.removeFromDatabaseGivenANode("jvk_alles", jvkRow2, true);
//							
//							});
//						}					
//					
//				}
//			},
			
			"keyup": {
				"m": function(t){
					combineBoth();
				},
				"x": function(t){
					var jvkRow = fn.getActiveRowNode(t);
					var sLemma = fn.getDataFromCellInRowNode(t, jvkRow, "lemma");
					fn.callDatabase("gb_ambigu", {lem05: "^"+sLemma+"$"});
				}
			}
		},
		gb_ambigu: {
			
			
			"selection_button_active": true,
			
			"size": "50%",
			
			"button_0": {
				
				"name": "Voeg toe",
				"tooltip": "Voeg het geselecteerde lemma toe aan Jvk",
				"click": function(confTable){
					
					// first generate a new jvk id for this new lemma
					var d = new Date();
					var sNewJvkId = "newjvk"+d.getTime();
					var sNewId = d.getTime();
					
					// get lemma form and simple pos
					var aSelectedRows = fn.getSelectedRowsFrom(confTable);
					if (aSelectedRows.length==0)
						{
						alert("Er is geen lemma geselecteerd");
						return;
						}
					var sGbLemma = fn.getDataFromCellInRowNode(confTable, aSelectedRows[0], "lem05");
					var sSimplePos = fn.getDataFromCellInRowNode(confTable, aSelectedRows[0], "simple_pos");
					
					fn.insertIntoDatabase("jvk_alles", 
						{
						"id": sNewId,
						"lemma_id": sNewJvkId,
						"lemma": sGbLemma,
						"simple_pos": sSimplePos
						}, 
						null, false, function(){
							
							// define a draw callback; that will be called after the
							// software has call the right page (see further)
							fn.addDrawCallback("jvk_alles", function(){
								
								fn.refreshTable("jvk_alles",
									function(){
									
									var nNode = fn.getNodeWhere("jvk_alles", 
											{
											"id": sNewId,
											"lemma_id": sNewJvkId,
											"lemma": sGbLemma,
											"simple_pos": sSimplePos
											});
									
									var iRowNumber = fn.getRowNumberOnScreen("jvk_alles", nNode);									
									fn.selectRow("jvk_alles", iRowNumber);
									
								});								
								
							});
							
							fn.goToTheRightPage("jvk_alles", "lemma", sGbLemma);
						
							
								
					});
					
					
				}
			},
			
//			"button_0": {
//				"name": "Bundelen",
//				"click": function(t){
//					var aRows = fn.getSelectedRowsFrom(t);
//					
//					if (aRows.length!=2)
//						{
//						alert("Selecteer twee lemmata");
//						}
//					else
//						{
//						var gbRow1 = aRows[0];
//						var gbRow2 = aRows[1];
//						
//						var gb05_id1 = fn.getDataFromCellInRowNode("gb_ambigu", gbRow1, "gb05_id");
//						var gb05_superid1 = fn.getDataFromCellInRowNode("gb_ambigu", gbRow1, "gb05_superid");
//						var lem051 = fn.getDataFromCellInRowNode("gb_ambigu", gbRow1, "lem05");
//						var wrdcat051 = fn.getDataFromCellInRowNode("gb_ambigu", gbRow1, "wrdcat05");
//						var znwlid051 = fn.getDataFromCellInRowNode("gb_ambigu", gbRow1, "znwlid05");
//						var betek051 = fn.getDataFromCellInRowNode("gb_ambigu", gbRow1, "betek05");
//						var gigantpos1 = fn.getDataFromCellInRowNode("gb_ambigu", gbRow1, "gigant_pos");
//						var simplepos1 = fn.getDataFromCellInRowNode("gb_ambigu", gbRow1, "simple_pos");
//						
//						var gb05_id2 = fn.getDataFromCellInRowNode("gb_ambigu", gbRow2, "gb05_id");
//						var gb05_superid2 = fn.getDataFromCellInRowNode("gb_ambigu", gbRow2, "gb05_superid");
//						var lem052 = fn.getDataFromCellInRowNode("gb_ambigu", gbRow2, "lem05");
//						var wrdcat052 = fn.getDataFromCellInRowNode("gb_ambigu", gbRow2, "wrdcat05");
//						var znwlid052 = fn.getDataFromCellInRowNode("gb_ambigu", gbRow2, "znwlid05");
//						var betek052 = fn.getDataFromCellInRowNode("gb_ambigu", gbRow2, "betek05");
//						var gigantpos2 = fn.getDataFromCellInRowNode("gb_ambigu", gbRow2, "gigant_pos");
//						var simplepos2 = fn.getDataFromCellInRowNode("gb_ambigu", gbRow2, "simple_pos");
//						
//						fn.updateDatabaseGivenANode("gb_ambigu", gbRow1, 
//								["gb05_id", "gb05_superid", "lem05", "wrdcat05", 
//								 "znwlid05", "betek05", "gigant_pos", "simple_pos"], 
//								[
//								 bundelFeatures(gb05_id1, gb05_id2),
//								 bundelFeatures(gb05_superid1, gb05_superid2),
//								 bundelFeatures(lem051, lem052),
//								 bundelFeatures(wrdcat051, wrdcat052),
//								 bundelFeatures(znwlid051, znwlid052),
//								 bundelFeatures(betek051, betek052),
//								 bundelFeatures(gigantpos1, gigantpos2),
//								 bundelFeatures(simplepos1, simplepos2)
//								 ], false, function(){
//							
//								fn.removeFromDatabaseGivenANode("gb_ambigu", gbRow2, true);
//							
//							});
//						}					
//					
//				}
//			},
			
			"keyup": {
				"m": function(t){					
					combineBoth();
				},
				"x": function(t){
					var gbRow = fn.getActiveRowNode(t);
					var sLemma = fn.getDataFromCellInRowNode(t, gbRow, "lem05");
					fn.callDatabase("jvk_alles", {lemma: "^"+sLemma+"$"});
				}
			},
			
			"callback": function(t){
				
				// make unique rows visible
				
				// if special color class does not exist yet, create it
				if ( !$(".unique_row_class")[0])
					{
					$("html > head").append("<style type='text/css'>.unique_row_class {background-color: yellow !important}</style");
					}
				
				fn.getAllRows(t).each(function(){
					
					var bIsUnique = fn.getDataFromCellInRowNode(t, this, "is_unique");
					if (bIsUnique == 't')
						{						
						fn.getCellElement(t, this, "lem05").addClass("unique_row_class");
						}
				});
				
				
				// generate tooltip showing the paradigm
				var aAllRows = fn.getAllRows(t);
				aAllRows.each(function(){

					var sParadigm = fn.getDataFromCellInRowNode(t, this, "paradigm");					
					for (var i=0; i<mt.getListOfVisibleColumnsOf(fn.getTableName(t)).length; i++)
						{
						var sCellName = mt.getListOfVisibleColumnsOf(fn.getTableName(t))[i];
						if (sCellName == 'gb05_id' || sCellName == 'lem05')
							continue;
						var eLem = fn.getCellElement(t, this, sCellName);
						// add space to allow the tag to be split up automatically if it is too long					
						$(eLem).attr("title", sParadigm.replace(/,/g, ', '));
						}
				});
			},
			"repeat_callback": true
		}
};


function combineBoth(){
	
	// make sure no filter is applied to bottom table, because the result must be shown there
	fn.resetTable("jvk_gb_lemma_combined");	
	
	var aJvkRows = fn.getSelectedRowsFrom("jvk_alles");
	var aGbRows = fn.getSelectedRowsFrom("gb_ambigu");
	
	if (aJvkRows.length==0 || aGbRows.length==0)
		{
		alert("Selecteer lemmata zowel links als rechts");
		return;
		}
	
	var answer = confirm("Weet u zeker dat u\n\n'"+
			fn.getDataFromCellInRowNode("jvk_alles", aJvkRows[0], "lemma")+
			"' uit JVK\n\nwilt verbinden met\n\n'"+
			fn.getDataFromCellInRowNode("gb_ambigu", aGbRows[0], "lem05")+
			"' uit GB05?");
	if (!answer)
		return;
	
	// combine all selected rows in both tables
	aJvkRows.each(function(i){
		
		var jvkRow = this;	
		
		var id = fn.getDataFromCellInRowNode("jvk_alles", jvkRow, "id");
		var lemma_id = fn.getDataFromCellInRowNode("jvk_alles", jvkRow, "lemma_id");		
		var lemma = fn.getDataFromCellInRowNode("jvk_alles", jvkRow, "lemma");
		var tmp = fn.getDataFromCellInRowNode("jvk_alles", jvkRow, "tmp");
		var orig_pos = fn.getDataFromCellInRowNode("jvk_alles", jvkRow, "orig_pos");
		var gigant_pos = fn.getDataFromCellInRowNode("jvk_alles", jvkRow, "gigant_pos");
		var simple_pos = fn.getDataFromCellInRowNode("jvk_alles", jvkRow, "simple_pos");
		var keurmerk = fn.getDataFromCellInRowNode("jvk_alles", jvkRow, "keurmerk");
		var jvkParadigm = fn.getDataFromCellInRowNode("jvk_alles", jvkRow, "paradigm");
		
		aGbRows.each(function(j){
			
			var gbRow = this;
			
			var gb05_id = fn.getDataFromCellInRowNode("gb_ambigu", gbRow, "gb05_id");
			var gb05_superid = fn.getDataFromCellInRowNode("gb_ambigu", gbRow, "gb05_superid");
			var lem05 = fn.getDataFromCellInRowNode("gb_ambigu", gbRow, "lem05");
			var wrdcat05 = fn.getDataFromCellInRowNode("gb_ambigu", gbRow, "wrdcat05");
			var znwlid05 = fn.getDataFromCellInRowNode("gb_ambigu", gbRow, "znwlid05");
			var betek05 = fn.getDataFromCellInRowNode("gb_ambigu", gbRow, "betek05");
			var gigantpos = fn.getDataFromCellInRowNode("gb_ambigu", gbRow, "gigant_pos");
			var simplepos = fn.getDataFromCellInRowNode("gb_ambigu", gbRow, "simple_pos");
			var gbParadigm = fn.getDataFromCellInRowNode("gb_ambigu", gbRow, "paradigm");
			var bIsUnique = fn.getDataFromCellInRowNode("gb_ambigu", gbRow, "is_unique");
			
			
			
			fn.insertIntoDatabase("jvk_gb_lemma_combined", {
				id: id, 
				lemma_id: lemma_id,				
				lemma: lemma,
				tmp: tmp,
				orig_pos: orig_pos,
				gigant_pos: gigant_pos,
				simple_pos: simple_pos,
				keurmerk: keurmerk,
				jvk_paradigm: jvkParadigm,
				
				gb05_id: gb05_id,
				gb05_superid: gb05_superid,				
				lem05: lem05,
				wrdcat05: wrdcat05,
				znwlid05: znwlid05,
				betek05: betek05,
				gigantpos: gigantpos,
				simplepos: simplepos,
				gb_paradigm: gbParadigm,
				is_unique: (bIsUnique == 't')
				
			}, null, true, function(){
				fn.removeFromDatabaseGivenANode("gb_ambigu", gbRow, null, function(){

					// if we have reached the last round, update the views
					if (i==aJvkRows.length-1 && j==aGbRows.length-1)
						{
						fn.refreshTable("jvk_alles");
						fn.refreshTable("gb_ambigu");							
						}
				});
				
			});
			
			
		});
		
	});
	
	
}


// container object for the configuration of each table
oTableConfigurationList = {
		
		jvk_gb_lemma_combined: {
			"hidden_id": {
				"visible": false, 
				"colsort": "desc"
					}, // this makes sure the last combined lemmata are shown on top			
			"tmp": {"editable": true},
			"orig_pos": {"editable": true},
			"simple_pos": {"editable": true},
			"gigant_pos": {"editable": true},
			"keurmerk": {"editable": true}
		},
		
		jvk_alles: {
			orig_pos: {"editable": true},
			simple_pos: {"editable": true},
			id: {"visible": false},
			hide: {
				"filter": 'f', 
				"keepfilter": true, 
				"editable": true,
				"editcallback": function(t,n, value){fn.refreshTable(t);}
				},
			paradigm: {"visible": false},
			lemma_id: {
				"visible": true,
				"cell_tooltip": "Klik hier om dit lemma in de verzameltabel op te zoeken",
				"click": function(t,n){
					var lemma = fn.getDataFromSiblingNode(t, n, "lemma");					
					fn.callDatabase("jvk_gb_lemma_combined", {lemma: "^"+lemma+"$"});
					}
				},			
			
			gigant_pos: {"visible": false},
			lemma: {
				"colsort": "asc",
				"click": function(t, n){
					var lemma = fn.getDataFromCellInRowNode(t, n, "lemma");
					fn.callDatabase("gb_ambigu", {lem05: "^"+lemma+"$"});
				}
			}
		},
		gb_ambigu: {
			is_unique: {"visible": false},
			paradigm: {"visible": false},
			gb05_id: {
				"cell_tooltip": "Klik hier om het Groene Boekje te openen met dit record",
				"click": function(t, n){
					var gb05Id = fn.getDataFromCellNode(t, n);
					fn.callDatabaseInNewTab("GB05_004", {"id": gb05Id}, {"viewtype": "form"}, "lexicalsources");
				}
			},
			gb05_superid: {"visible": false},
			
			lem05: {
				"colsort": "asc",
				"cell_tooltip": "Klik hier om dit lemma in de andere twee tabellen te zoeken",
				"click": function(t, n){
					var lem05 = fn.getDataFromCellInRowNode(t, n, "lem05");
					fn.callDatabase("jvk_alles", {lemma: "^"+lem05+"$"});
					fn.goToTheRightPage("jvk_gb_lemma_combined", "lem05", "^"+lem05+"$");
					
				}
			}
		}

};