// list of tables that must be hidden or visible (don't use both, it's a matter of what's the most convenient)
oHiddenTablesList = [];
oShowOnlyTables = ["parseer_worktable"];


// https://stackoverflow.com/questions/19863402/convert-a-sentence-to-initcap-camel-case-proper-case
String.prototype.initCap = function () {
	   return this.toLowerCase().replace(/(?:^|\s|-)[a-z]/g, function (m) {
	      return m.toUpperCase();
	   });
	};
	
	
	

// table general settings
oTableSettingsList = {
		
		parseer_worktable:{
			
			"button_0": {
				"name": "leeg maken",
				"click": function(t){
					
					var oSelection = fx.getSelectedRowsFrom(t);
					
					if (oSelection.any())
						{
						oSelection.every(function(){
							
							var bLastRow = fx.isLastRowOf(this, oSelection);
							
							fx.updateDatabaseGivenACellOrRow(this, {
									"first_name": "",
									"first_name_full": "",
									"infixes": "",
									"last_name": ""
									}, function(){
										if (bLastRow) fn.refreshTable(t);
									});
							
							});
						}
					else
						{
						fn.message("Let op", "Er is niets geselecteerd op leeg te maken");
						}
					
					
				}
			}
		}
		
};



function doTheJob(t, nCell, sWholeString, iStartPos, iEndPos){
		
	// end position of selected string corresponds
	// to the end position of the whole string:
	// that probably means we have a last name
	if (iEndPos == sWholeString.length)
		{
		var firstname = sWholeString.substring(0, iStartPos).trim();
		var infixes = "";
		var lastname = sWholeString.substring(iStartPos).trim();
		}
	
	// otherwise, the selected string must be an infix
	else
		{
		var firstname = sWholeString.substring(0, iStartPos).trim();
		var infixes = sWholeString.substring(iStartPos, iEndPos).trim();
		var lastname = sWholeString.substring(iEndPos).trim();
		}
	
	// update table
	fn.updateDatabaseGivenANode(nCell, 
			{
			"first_name": firstname.initCap(),
			"first_name_full": firstname.initCap(),
			"infixes": infixes.toLowerCase(),
			"last_name": lastname.initCap(),
			"personname_id": null, // modifying a name means getting a new name variant, so this personNameID is meaningless
			"naam_aangepast": true
			}, 
			function(){
				fn.refreshTable(t);
			});

};


// configuration at column level
oTableConfigurationList = {
		
		parseer_worktable:{
			
			"unique_id": {
				"visible": false
			},
            
            "prefix_title": {
				"editable": true
			},
            
            "additonal_title": {
				"editable": true
			},
            
            
            
			
			"opmerking": {
				"editable": true
			},
			
			"first_name": {
				"editable": true,
				
				// we need to know of the name was modified
				"editcallback": function(t, n, value){
					fn.updateDatabaseGivenANode(n, {"naam_aangepast": true}, function(){
						fn.refreshTable(t);
					});
				}
			},
			"first_name_full": {
				"editable": true,
				
				// we need to know of the name was modified
				"editcallback": function(t, n, value){
					fn.updateDatabaseGivenANode(n, {"naam_aangepast": true}, function(){
						fn.refreshTable(t);
					});
				}
			},
			"infixes": {
				"editable": true,
				
				// we need to know of the name was modified
				"editcallback": function(t, n, value){
					fn.updateDatabaseGivenANode(n, {"naam_aangepast": true}, function(){
						fn.refreshTable(t);
					});
				}
			},
			"last_name": {
				"editable": true,
				
				// we need to know of the name was modified
				"editcallback": function(t, n, value){
					fn.updateDatabaseGivenANode(n, {"naam_aangepast": true}, function(){
						fn.refreshTable(t);
					});
				}
			},
			
			"birth": {
				"editable": true,
				
				// we need to know of the date was modified
				"editcallback": function(t, n, value){
					fn.updateDatabaseGivenANode(n, {"datum_aangepast": true}, function(){
						fn.refreshTable(t);
					});
				}
			},
			
			"death": {
				"editable": true,
				
				// we need to know of the date was modified
				"editcallback": function(t, n, value){
					fn.updateDatabaseGivenANode(n, {"datum_aangepast": true}, function(){
						fn.refreshTable(t);
					});
				}
			},
			
			"personname_id": {
				"visible": false
			},
			
			"naam_aangepast": {
				"visible": false
			}, 
			
			"datum_aangepast": {
				"visible": false
			},
			
			"platte_naam": {
				
				"bgcolor": "#CECEF6",
				
				"cell_tooltip": "Klik op infix indien aanwezig. Zo niet, klik anders op achternaam. Dan wordt de naam automatisch geparseerd.",
				
				"click": function(t, nCell){					
					
					var sWholeString = fn.getDataFromCellNode(nCell);
					
					var oInfo;
					var oInfo1 = fn.getWordClickedUponInNode(nCell);
					var oInfo2 = fn.getSelectedTextInNode(nCell);
					
					// what is the biggest selection? Choose the biggest.
					if ( (oInfo1.end-oInfo1.start) < (oInfo2.end-oInfo2.start) )
						oInfo = oInfo2;
					else
						oInfo = oInfo1;				
					
					// get data
					var sWord = oInfo.text;
					var iStartPos = oInfo.start;
					var iEndPos = oInfo.end;
					var bReliable = oInfo.reliable;
					
					var sPersonId = fn.getDataFromSiblingNode(nCell, "person_id");
					
					if (bReliable)
						{
						
						// are we overwriting a thesaurus person name?
						
						if (sPersonId != "")
							{
							fn.confirm("Let op", 
									"U gaat nu een naam uit de thesaurus aanpassen. U introduceert dus een nieuwe naamvariant. Wilt u dat zeker?",
									
									// positive user response to confirmation message
									function(){
								
										doTheJob(t, nCell, sWholeString, iStartPos, iEndPos);
								
									}, 
									
									// negative user response to confirmation message
									function(){
										fn.message("Bewerking geannuleerd", "Bewerking geannuleerd")
									});
							}
						
						// if we are NOT overwriting a thesaurus person name
						else 
							{
							doTheJob(t, nCell, sWholeString, iStartPos, iEndPos);
							}
						}
					
					
						
					
					
					
					
				}
			}
			
		}

};