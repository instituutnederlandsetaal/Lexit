// list of tables that must be hidden or visible (don't use both, it's a matter of what's the most convenient)
oHiddenTablesList = [];
oShowOnlyTables = [
                   // authors
                   "AllPersons", "NLPerson",
                   
                   // titles
                   "quickview_seriestitles", "quickview_titles", "quickview_dependent_titles",
                   
                   // log
                   "PersonName_removed",
                   
                   // vergelijking
                   "tmp_uitgave_werk",
                   "tmp_werk_werk",
                   "tmp_herdruk_uitgave",
                   "tmp_uitgave_uitgave",
                   "tmp_herdruk_herdruk",
                   "tmp_uitgave_herdruk",
                   "tmp_werk_uitgave",
                   "tmp_werk_herdruk",
                   "tmp_audio_werk",
                   "tmp_video_werk",
                   
                   
                   // klussen
                   "klus__werken_geen_1ste_druk",
                   "klus__herdruk_jonger_dan_tekst",
                   "klus__herdruk_werk__restje_geen_1ste_druk"
                   
                   ];


// functions

function updateYearOfBirthLabel(t, n, yearOfBirthMin, yearOfBirthMax, yearOfBirthApprox){
	
	if ( yearOfBirthMin != '' && yearOfBirthMax != '' )
		{
		if (yearOfBirthMin != yearOfBirthMax)
			{
			fn.updateDatabaseGivenANode(n, {"yearOfBirthApprox": "1", "yearOfBirthLabel": "ca. "+yearOfBirthMin+"-"+yearOfBirthMax},
					function(){fn.refreshTable(t);} );	
			}
		else
			{
			fn.updateDatabaseGivenANode(n, {"yearOfBirthLabel": (yearOfBirthApprox =='1'?"ca. ":"") + yearOfBirthMin},
					function(){fn.refreshTable(t);} );	
			}
		
		}
}


function updateYearOfDeathLabel(t, n, yearOfDeathMin, yearOfDeathMax, yearOfDeathApprox){
	
	if ( yearOfDeathMin != '' && yearOfDeathMax != '' )
		{
			
		if (yearOfDeathMin != yearOfDeathMax)
			{
			
			fn.updateDatabaseGivenANode(n, {"yearOfDeathApprox": "1", "yearOfDeathLabel": "ca. "+yearOfDeathMin+"-"+yearOfDeathMax},
					function(){fn.refreshTable(t);} );	
			}
		else
			{
			
			fn.updateDatabaseGivenANode(n, {"yearOfDeathLabel": (yearOfDeathApprox =='1'?"ca. ":"") + yearOfDeathMin},
					function(){fn.refreshTable(t);} );	
			}
		
		}
}


var pairs_comparison = {
		
		"group": "Vergelijking",
		
		"columns_sorting": {"combi_id": "asc", "cat": "asc"},
		
		"callback": function(t){
			
			var sTableName = fx.getTableName(t);
			var sLastRowId = "";
			var oLastRow = null;
			var sBackGroundColor = "red";
			
			(fx.getAllRows(t)).every(function(){
				
				var oCurrentRow = 	this;
				var sCurrentRowId =	fx.getDataFromCellInRow(oCurrentRow, "combi_id");
				
				// row id is different from previous one, meaning we entered a new group
				
				if (sCurrentRowId != sLastRowId && sLastRowId != "")
					{
					
					// change backgroup color for new group
					if (sBackGroundColor == "red")
						sBackGroundColor = "blue";
					else
						sBackGroundColor = "red";
					
					// add thick line the show limit of group
					for (var i=0; i<mt.getListOfVisibleColumnsOf(sTableName).length; i++)
						{
						var sColumnName = mt.getListOfVisibleColumnsOf(sTableName)[i];
						$(fx.getCellNode(oCurrentRow, sColumnName)) 
							.css("border-top", "black solid 2px");
						
						}
					}
				
				// row id is same as previous one, so we are inside a group
				
				else if (oLastRow != null && sCurrentRowId == sLastRowId)
					{
					
					for (var i=0; i<mt.getListOfVisibleColumnsOf(sTableName).length; i++)
						{
						var sColumnName = mt.getListOfVisibleColumnsOf(sTableName)[i];
						var sCurrentValue =		fx.getDataFromCellInRow(oCurrentRow, sColumnName);
						var sPreviousValue =	fx.getDataFromCellInRow(oLastRow, sColumnName);

						if (sCurrentValue != sPreviousValue)
							{
							$(fx.getCellNode(oCurrentRow, sColumnName))
							.css("font-weight", "bold")
							.css("color", sBackGroundColor);
							$(fx.getCellNode(oLastRow, sColumnName))
							.css("font-weight", "bold")
							.css("color", sBackGroundColor);
							}
						}
					}
				
				sLastRowId = 	sCurrentRowId;
				oLastRow = 		this;
			});
			
		},
		
		"repeat_callback": true
	};



var pairs_comparisonConfig = {
		
		"opmerking": {
			"editable": true,
			"bgcolor": "#E0F8EC"
		},
		
		"sourceCollection": {
			"click": function(t, n){
				
				var sCombiId = fn.getDataFromSiblingNode(n, "combi_id");
				
				var oRows = fx.getAllRowsWhere(t, {"combi_id": sCombiId});
				
				oRows.every(function(){
					
					var sNederlabId = fx.getDataFromCellInRow(this, "nederlabID");
					fn.callFunction("api.get_dbnl_url", [sNederlabId], function(response){
						
						window.open(response["get_dbnl_url"]);
					});
					
				});
				
			}
		},
		
		"nederlabID": {
			"click": function(t, n){
				var sId = fn.getDataFromCellNode(n);
				fn.callDatabase("quickview_titles", {"nederlabID": sId}, function(){
					fn.scrollToTable("quickview_titles");
				});
			}
		}
};


// table general settings
oTableSettingsList = {
		
		"quickview_seriestitles": {
			"group": "Publicaties"
		}, 
		
		"quickview_titles": {
			"group": "Publicaties"
		}, 
		
		"quickview_dependent_titles": {
			"group": "Publicaties"
		},
			
		"NLPerson": {
			"group": "Auteurs"
		},
		
		"AllPersons": {
			
			"group": "Auteurs",
		
			"columns_sorting": {
				"personID": "asc",
				"lastName":"asc",
				"firstName":"asc",
				"personNameID":"asc"
			},
			
			"button_0":{
				"name": "Voeg naamvariant toe",
				"click": function(t){
					
					var oCurrentRow =	fx.getFirstSelectedRowFrom(t);
					
					if (oCurrentRow == null)
						{
						fn.message("Let op", "U moet de persoon aanklikken, voor wie u een nieuwe naamvariant wilt aanmaken");
						}
					else
						{
						var sPersonId = fx.getDataFromCellInRow(oCurrentRow, "personID");
						
						fn.callFunction("api.add_name_variant", [sPersonId], function(){
							fn.refreshTable(t);
							});
						}
					
				}
			},
			
			"button_1":{
				"name": "Verwijder selectie",
				"click": function(t){
					
					var oRows = fx.getSelectedRowsFrom(t);
					 
					fn.confirm("Let op!", 
							"Weet u zeker dat u deze "+
							(oRows.count()==1 ? "rij " : oRows.count()+" rijen " ) +
							"wilt verwijderen?", 
							function(){
								if (oRows.count()==0)
									{
									fn.message("Let op", "Selecteer minstens één rij om te verwijderen");
									}
								else
									{
									oRows.every(function(){
										
										var oCurrentRow =	this;
										var bIsLastRow = 	fx.isLastRowOf(oCurrentRow, oRows);
										
										var sPersonId =		fx.getDataFromCellInRow(oCurrentRow, "personID");
										var sPersonNameId =	fx.getDataFromCellInRow(oCurrentRow, "personNameID");
										
										fn.callFunction("api.delete_name_variant", [sPersonId, sPersonNameId], function(){
											if (bIsLastRow)
												fn.refreshTable(t);
											});									
										
										});
									}
								
							}, 
							function(){
								fn.message("OK", "Bewerking geannuleerd!");
							}
					);
					
				}
			},
			
			"callback": function(t){
				
				var sTableName = fx.getTableName(t);
				var sLastRowId = "";
				
				(fx.getAllRows(t)).every(function(){
					
					var oCurrentRow = this;
					var sCurrentRowId = fx.getDataFromCellInRow(oCurrentRow, "personID");
					
					if (sCurrentRowId != sLastRowId && sLastRowId != "")
						{
						for (var i=0; i<mt.getListOfVisibleColumnsOf(sTableName).length; i++)
							{
							var sColumnName = mt.getListOfVisibleColumnsOf(sTableName)[i];
							$(fx.getCellNode(oCurrentRow, sColumnName)) 
								.css("border-top", "black solid 2px");
							}
						}
					
					sLastRowId = sCurrentRowId;
				});
			},
			
			"repeat_callback": true
		},
		
		
		"PersonName_removed": {
			"group": "Logje"
		},
		
		
		// klussen
		
		"klus__werken_geen_1ste_druk": {
			
			"group": "Klussen"
		}		,
		"klus__herdruk_jonger_dan_tekst": {
			
			"group": "Klussen"
		},
		
		"klus__herdruk_werk__restje_geen_1ste_druk": {
			
			"group": "Klussen"
		},
		
		
		// vergelijkingen
		
		"tmp_uitgave_werk": pairs_comparison,
		
		"tmp_werk_werk": pairs_comparison,
		
		"tmp_herdruk_uitgave": pairs_comparison,
		
		"tmp_herdruk_herdruk": pairs_comparison,
		
		"tmp_uitgave_uitgave": pairs_comparison,
		
		"tmp_uitgave_herdruk": pairs_comparison,
		
		"tmp_werk_uitgave": pairs_comparison,
		
		"tmp_werk_herdruk": pairs_comparison,
		
		"tmp_audio_werk": pairs_comparison,
		
		"tmp_video_werk": pairs_comparison
};


// configuration at column level
oTableConfigurationList = {
		
		// vergelijkingen
		
		"tmp_uitgave_werk": pairs_comparisonConfig,
		
		"tmp_werk_werk": pairs_comparisonConfig,
		
		"tmp_herdruk_uitgave": pairs_comparisonConfig,
		
		"tmp_herdruk_herdruk": pairs_comparisonConfig,
		
		"tmp_uitgave_herdruk": pairs_comparisonConfig,
		
		"tmp_werk_uitgave": pairs_comparisonConfig,
		
		"tmp_werk_herdruk": pairs_comparisonConfig,
		
		"tmp_audio_werk": pairs_comparisonConfig,
		
		"tmp_video_werk": pairs_comparisonConfig,
		
		// klussen
		
		
		"klus__werken_geen_1ste_druk": {
			
			"nederlabID":{ 
				"click": function(t, n){
					
					var sId = fn.getDataFromCellNode(n);
					fn.callDatabase("quickview_titles", {"nederlabID": sId}, function(){
						fn.scrollToTable("quickview_titles");
					});
				}
			},
			
			"sourceCollection": {
				"click": function(t, n){
					
					var sNederlabId = fn.getDataFromSiblingNode(n, "nederlabID");
					
					fn.callFunction("api.get_dbnl_url", [sNederlabId], function(response){
						
						window.open(response["get_dbnl_url"]);
					});
					
				}
			},
			
			 "yearOfPublicationMin": {
				 "bgcolor": "#E0F8EC",
				 "editable": true
			 }, 
			 "yearOfPublicationMax": {
				 "bgcolor": "#E0F8EC",
				 "editable": true
			 }, 
			 "edition": {
				 "editable": true
			 }, 
			 "witnessYearMin": {
				 "bgcolor": "#E0F8EC",
				 "editable": true
			 }, 
			 "witnessYearMax": {
				 "bgcolor": "#E0F8EC",
				 "editable": true
			 }, 
			 "textYearMin": {
				 "bgcolor": "#E0F8EC",
				 "editable": true
			 }, 
			 "textYearMax": {
				 "bgcolor": "#E0F8EC",
				 "editable": true
			 }, 
			 
			 "opmerking": {
				 "bgcolor": "#E0F8EC",
				 "editable": true
			 }
		},
		
		"klus__herdruk_jonger_dan_tekst": {
			
			"titlesource": {
				"click": function(t, n){
					
					var sNederlabId1 = fn.getDataFromSiblingNode(n, "work_id");
					var sNederlabId2 = fn.getDataFromSiblingNode(n, "herdruk_id");
					
					fn.callFunction("api.get_dbnl_url", [sNederlabId1], function(response){
						
						window.open(response["get_dbnl_url"]);
					});
					
					fn.callFunction("api.get_dbnl_url", [sNederlabId2], function(response){
						
						window.open(response["get_dbnl_url"]);
					});
					
				}
			},
			
			"herdruksource": {
				"click": function(t, n){
					
					var sNederlabId1 = fn.getDataFromSiblingNode(n, "work_id");
					var sNederlabId2 = fn.getDataFromSiblingNode(n, "herdruk_id");
					
					fn.callFunction("api.get_dbnl_url", [sNederlabId1], function(response){
						
						window.open(response["get_dbnl_url"]);
					});
					
					fn.callFunction("api.get_dbnl_url", [sNederlabId2], function(response){
						
						window.open(response["get_dbnl_url"]);
					});
					
				}
			},
			
			"work_id":{ 
				"click": function(t, n){
					
					var sId = fn.getDataFromCellNode(n);
					fn.callDatabase("quickview_titles", {"nederlabID": sId}, function(){
						fn.scrollToTable("quickview_titles");
					});
				}
			},
			
			"herdruk_id":{ 
				"click": function(t, n){
					
					var sId = fn.getDataFromCellNode(n);
					fn.callDatabase("quickview_titles", {"nederlabID": sId}, function(){
						fn.scrollToTable("quickview_titles");
					});
				}
			},
			
			"unique_id": {
				"bgcolor": "#E0F8EC",
				"visible": false
			},
			
			"title_pubmin": {
				"bgcolor": "#E0F8EC",
				 "editable": true
			 },
			 
			"title_pubmax": {
				"bgcolor": "#E0F8EC",
				 "editable": true
			 },
			 
			"herdruk_pubmin": {
				"bgcolor": "#E0F8EC",
				 "editable": true
			 },
			
			"herdruk_pubmax": {
				"bgcolor": "#E0F8EC",
				 "editable": true
			 }, 
			 
			 "opmerking": {
				 "bgcolor": "#E0F8EC",
				 "editable": true
			 }
			
		},		
		
		
		"klus__herdruk_werk__restje_geen_1ste_druk": {
			
			"titlesource": {
				"click": function(t, n){
					
					var sNederlabId1 = fn.getDataFromSiblingNode(n, "work_id");
					var sNederlabId2 = fn.getDataFromSiblingNode(n, "herdruk_id");
					
					fn.callFunction("api.get_dbnl_url", [sNederlabId1], function(response){
						
						window.open(response["get_dbnl_url"]);
					});
					
					fn.callFunction("api.get_dbnl_url", [sNederlabId2], function(response){
						
						window.open(response["get_dbnl_url"]);
					});
					
				}
			},
			
			"herdruksource": {
				"click": function(t, n){
					
					var sNederlabId1 = fn.getDataFromSiblingNode(n, "work_id");
					var sNederlabId2 = fn.getDataFromSiblingNode(n, "herdruk_id");
					
					fn.callFunction("api.get_dbnl_url", [sNederlabId1], function(response){
						
						window.open(response["get_dbnl_url"]);
					});
					
					fn.callFunction("api.get_dbnl_url", [sNederlabId2], function(response){
						
						window.open(response["get_dbnl_url"]);
					});
					
				}
			},
			
			"title_pubmin": {
				 "bgcolor": "#E0F8EC",
				 "editable": true
			 },
			 
			 "title_pubmax": {
				 "bgcolor": "#E0F8EC",
				 "editable": true
			 },
			 
			 "herdruk_pubmin": {
				 "bgcolor": "#E0F8EC",
				 "editable": true
			 },
			 
			 "herdruk_pubmax": {
				 "bgcolor": "#E0F8EC",
				 "editable": true
			 },
			 
			 "opmerking": {
				 "bgcolor": "#E0F8EC",
				 "editable": true
			 }
			 
		},
		
		
		// titles
		
		"quickview_titles": {
			
			"nederlabID": {
				"click": function(t, n){
					
					var sId = fn.getDataFromCellNode(n);
					fn.callFunction("api.show_contains_relations", [sId], function(response){
						
						var sOutput = response["show_contains_relations"];
						fn.message("Bevat-relaties", sOutput);
					});					
				}
			},
			
			"parent_title_id": {
				"bgcolor": "#E0F8EC",
				"cell_tooltip": "Klik op parent te openen",
				
				"click": function(t, n){
					var oCell = 			fx.getCell(n);
					var sParentTitleId =	fx.getDataFromCell(oCell);
					fn.callDatabase("quickview_seriestitles", {"nederlabID": sParentTitleId},
							function(){fn.scrollToTable("quickview_seriestitles");});
				}
			}
		}, 
		
		"quickview_dependent_titles": {
			
			"parent_title_id": {
				
				"bgcolor": "#E0F8EC",
				"cell_tooltip": "Klik op parent te openen",
				
				"click": function(t, n){
					var oCell = 			fx.getCell(n);
					var sParentTitleId =	fx.getDataFromCell(oCell);
					fn.callDatabase("quickview_titles", {"nederlabID": sParentTitleId},
							function(){fn.scrollToTable("quickview_titles");});
				}
			}
		},
		
		
		"AllPersons": {
			
			"pkid": {
				"visible": false
			},
			
			 
			
			"lastName": {
				"editable": true,
				"bgcolor": "#E0F8EC"
			},
			
			"firstName": {
				"editable": true,
				"bgcolor": "#E0F8EC"
			}, 
			"personNameID": {
				"visible": false
			}, 
			
			
			
			"personID": {
				"cell_tooltip": "Klik hier om de persoonsdetails op te zoeken", 
				"click": function(t, n){
					var sId = fn.getDataFromCellNode(n);
					fn.callDatabase("NLPerson", 
							{"nederlabID": sId}, 
							function(){fn.scrollToTable("NLPerson");}, 
							{"viewtype": "form"});
					
				}
			}, 
			
			"prefixTitle": {
				"editable": true,
				"bgcolor": "#E0F8EC"
			},
			
			
			
			"firstNameFull": {
				"editable": true,
				"bgcolor": "#E0F8EC"
			}, 
			"infixes": {
				"editable": true,
				"bgcolor": "#E0F8EC"
			}, 
			 
			"additionalTitle": {
				"editable": true,
				"bgcolor": "#E0F8EC"
			}, 
			
			"authorDescription": {
				"editable": true,
				"bgcolor": "#E0F8EC"
			},
			
			"organisationName": {
				"editable": true,
				"bgcolor": "#E0F8EC"
			},
			"yearOfBirthLabel": {
				// modif happens in NLPerson table
			}, 
			"yearOfDeathLabel" : {
				// modif happens in NLPerson table
			}
			
		},
		
		
		"NLPerson": {
			
			"nederlabID": {
				"visible": false
			},
			"editorialCode": {
				// ?
			},
			"versionID": {
				// ?
			},
			"sourceRef" : {
				// ?
			},
			"sourceCollection" : {
				// ?
			},
			"preferredNameID" : {
				// don't modify that!
			},
			"dateOfBirthDayMonth" : {
				"editable": true,
				"bgcolor": "#E0F8EC"
			},
			"yearOfBirthMin" : {
				"editable": true,
				"bgcolor": "#E0F8EC",
	    		"editcallback": function(t, n, value){
	    			
	    			var yearOfBirthMin = value;
	    			var yearOfBirthMax = fn.getDataFromSiblingNode(n, "yearOfBirthMax");
	    			var yearOfBirthApprox = fn.getDataFromSiblingNode(n, "yearOfBirthApprox");
	    			
	    			// update the year of birth label if necessary
	    			updateYearOfBirthLabel(t, n, yearOfBirthMin, yearOfBirthMax, yearOfBirthApprox);
	    		}
			},
			"yearOfBirthMax": {
				"editable": true,
				"bgcolor": "#E0F8EC",
	    		"editcallback": function(t, n, value){
	    			
	    			var yearOfBirthMin = fn.getDataFromSiblingNode(n, "yearOfBirthMin");
	    			var yearOfBirthMax = value;
	    			var yearOfBirthApprox = fn.getDataFromSiblingNode(n, "yearOfBirthApprox");
	    			
	    			// update the year of death label if necessary
	    			updateYearOfBirthLabel(t, n, yearOfBirthMin, yearOfBirthMax, yearOfBirthApprox);
	    			
	    		}
			},
			"yearOfBirthApprox" : {
				"editable": true,
				"bgcolor": "#E0F8EC",
	    		"editfunc": function(t, n, value){
	    			
	    			var yearOfBirthMin = fn.getDataFromSiblingNode(n, "yearOfBirthMin");
	    			var yearOfBirthMax = fn.getDataFromSiblingNode(n, "yearOfBirthMax");
	    			var yearOfBirthApprox = value;
	    			
	    			// if the value is illegal, tell the user
	    			if (value != '' && value != '0' && value != '1')
	    				{
	    				fn.message("Let op!", "U mag hier alleen een 1 (=waar) of een 0 (=onwaar) invullen");
	    				}
	    			// otherwise, update the table as required
	    			else
	    				{
	    				// update the year of death label if necessary
		    			updateYearOfBirthLabel(t, n, yearOfBirthMin, yearOfBirthMax, yearOfBirthApprox);
		    			
	    				fn.updateDatabaseGivenANode( n, {"yearOfBirthApprox": value}, function(){
    						fn.refreshTable(t);
    						});
	    				}
	    		}
			},
			"yearOfBirthLabel" : {
				// automatic
			},
			"placeOfBirthID" : {
				// ?
			},
			"placeOfBirth" : {
				"editable": true,
				"bgcolor": "#E0F8EC"
			},
			"dateOfDeathDayMonth" : {
				"editable": true,
				"bgcolor": "#E0F8EC"
			},
			"yearOfDeathMin" : {
				"editable": true,
				"bgcolor": "#E0F8EC",
	    		"editcallback": function(t, n, value){
	    			
	    			var yearOfDeathMin = value;
	    			var yearOfDeathMax = fn.getDataFromSiblingNode(n, "yearOfDeathMax");
	    			var yearOfDeathApprox = fn.getDataFromSiblingNode(n, "yearOfDeathApprox");
	    			
	    			// update the year of birth label if necessary
	    			updateYearOfDeathLabel(t, n, yearOfDeathMin, yearOfDeathMax, yearOfDeathApprox);
	    		}
			},
			"yearOfDeathMax" : {
				"editable": true,
				"bgcolor": "#E0F8EC",
	    		"editcallback": function(t, n, value){
	    			
	    			var yearOfDeathMin = fn.getDataFromSiblingNode(n, "yearOfDeathMin");
	    			var yearOfDeathMax = value;
	    			var yearOfDeathApprox = fn.getDataFromSiblingNode(n, "yearOfDeathApprox");
	    			
	    			// update the year of death label if necessary
	    			updateYearOfDeathLabel(t, n, yearOfDeathMin, yearOfDeathMax, yearOfDeathApprox);
	    			
	    		}
			},
			"yearOfDeathApprox" : {
				"editable": true,
				"bgcolor": "#E0F8EC",
	    		"editfunc": function(t, n, value){
	    			
	    			var yearOfDeathMin = fn.getDataFromSiblingNode(n, "yearOfDeathMin");
	    			var yearOfDeathMax = fn.getDataFromSiblingNode(n, "yearOfDeathMax");
	    			var yearOfDeathApprox = value;
	    			
	    			// if the value is illegal, tell the user
	    			if (value != '' && value != '0' && value != '1')
	    				{
	    				fn.message("Let op!", "U mag hier alleen een 1 (=waar) of een 0 (=onwaar) invullen");
	    				}
	    			// otherwise, update the table as required
	    			else
	    				{
	    				// update the year of birth label if necessary
		    			updateYearOfDeathLabel(t, n, yearOfDeathMin, yearOfDeathMax, yearOfDeathApprox);
		    			
	    				fn.updateDatabaseGivenANode( n, {"yearOfDeathApprox": value}, function(){
    						fn.refreshTable(t);
    						});
	    				}
	    		}
			},
			"yearOfDeathLabel" : {
				// automatic
			},
			"placeOfDeathID" : {
				"visible": false
			},
			"placeOfDeath" : {
				"editable": true,
				"bgcolor": "#E0F8EC"
			},
			"gender" : {
				"editable": true,
				"bgcolor": "#E0F8EC"
			},
			
		}

};


// start up!

fn.callDatabase("AllPersons", null, function(){
	fn.callDatabase("NLPerson", 
			null, 
			function(){
				fn.setActiveTable("AllPersons");
			},	
			{"viewtype": "form"});
});