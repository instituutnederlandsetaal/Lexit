

termbank_terms = {};

termbank_terms.aGeografischGebruikRich = true;
termbank_terms.aGeografischGebruik = 
	termbank_terms.aGeografischGebruikRich ?
	["EU - Europese Unie",
	"BE - België", "NL - Nederland", "SR - Suriname", "AW - Aruba", "BQ - Saba", "BQ - Bonaire", "BQ - Sint Eustatius", "CW - Curaçao", "SX - Sint Maarten (Nederlands deel)", 
	"AN - Nederlandse Antillen", "EU - Europese Unie", "AD - Andorra", "AE - Verenigde Arabische Emiraten", "AF - Afghanistan", "AG - Antigua en Barbuda", 
	"AI - Anguilla (Verenigd Koninkrijk)", "AL - Albanië", "AM - Armenië", "AO - Angola", "AQ - Antarctica", "AR - Argentinië", "AS - Amerikaans-Samoa (Verenigde Staten)", 
	"AT - Oostenrijk", "AU - Australië", "AX - Åland", "AZ - Azerbeidzjan", "BA - Bosnië en Herzegovina", "BB - Barbados", "BD - Bangladesh", 
	"BF - Burkina Faso", "BG - Bulgarije", "BH - Bahrein", "BI - Burundi", "BJ - Benin", "BL - Sint-Bartholomeus (Frankrijk)", "BM - Bermuda (Verenigd Koninkrijk)", 
	"BN - Brunei", "BO - Bolivia", "BR - Brazilië", "BS - Bahamas", "BT - Bhutan", "BV - Bouveteiland", "BW - Botswana", "BY - Wit-Rusland", "BZ - Belize", 
	"CA - Canada", "CC - Cocos- (Keeling-) eilanden", "CD - Congo (Democratische Republiek)", "CF - Centraal-Afrikaanse Republiek", "CG - Congo (Republiek)", 
	"CH - Zwitserland", "CI - Ivoorkust", "CK - Cookeilanden", "CL - Chili", "CM - Kameroen", "CN - China", "CO - Colombia", "CR - Costa Rica", "CU - Cuba", 
	"CV - Kaapverdische Eilanden", "CX - Christmaseiland", "CY - Cyprus", "CZ - Tsjechische Republiek", "DE - Duitsland (Bondsrepubliek)", "DJ - Djibouti", 
	"DK - Denemarken", "DM - Dominica", "DO - Dominicaanse Republiek", "DZ - Algerije", "EC - Ecuador", "EE - Estland", "EG - Egypte", "EH - Westelijke Sahara", 
	"ER - Eritrea", "ES - Spanje", "ET - Ethiopië", "FI - Finland", "FJ - Fiji", "FK - Falklandeilanden (Verenigd Koninkrijk)", "FM - Micronesia", "FO - Faeröereilanden", 
	"FR - Frankrijk", "GA - Gabon", "GB - Verenigd Koninkrijk", "GD - Grenada", "GE - Georgië", "GF - Guyane (Frankrijk)", "GG - Baljuwschap Guernsey (Verenigd Koninkrijk)", 
	"GH - Ghana", "GI - Gibraltar (Verenigd Koninkrijk)", "GL - Groenland (Denemarken)", "GM - Gambia", "GN - Guinee", "GP - Guadeloupe (Frankrijk)", 
	"GQ - Equatoriaal-Guinea", "GR - Griekenland", "GS - Zuid-Georgië en de Zuid-Sandwicheilanden", "GT - Guatemala", "GU - Guam (Verenigde Staten)", 
	"GW - Guinea-Bissau", "GY - Guyana", "HK - China (Hongkong SAR)", "HM - Heard- en McDonaldeilanden", "HN - Honduras", "HR - Kroatië", "HT - Haïti", 
	"HU - Hongarije", "ID - Indonesië", "IE - Ierland", "IL - Israël", "IM - Eiland Man (Verenigd Koninkrijk)", "IN - India", "IO - Brits Indische oceaan", 
	"IQ - Irak", "IR - Iran", "IS - IJsland", "IT - Italië", "JE - Baljuwschap Jersey (Verenigd Koninkrijk)", "JM - Jamaica", "JO - Jordanië", "JP - Japan", 
	"KE - Kenia", "KG - Kirgizië", "KH - Cambodja", "KI - Kiribati", "KM - Comoren", "KN - Saint Kitts en Nevis", "KP - Noord-Korea", "KR - Zuid-Korea", "KW - Koeweit", 
	"KY - Caymaneilanden (Verenigd Koninkrijk)", "KZ - Kazachstan", "LA - Laos", "LB - Libanon", "LC - Saint Lucia", "LI - Liechtenstein", "LK - Sri Lanka", 
	"LR - Liberia", "LS - Lesotho", "LT - Litouwen", "LU - Luxemburg", "LV - Letland", "LY - Libië", "MA - Marokko", "MC - Monaco", "MD - Moldavië", 
	"ME - Montenegro", "MF - Sint Maarten", "MG - Madagaskar", "MH - Marshalleilanden", "MK - Noord-Macedonië", "ML - Mali", "MM - Myanmar", "MN - Mongolië", 
	"MO - China (Macau SAR)", "MP - Noordelijke Marianen", "MQ - Martinique (Frankrijk)", "MR - Mauritanië", "MS - Montserrat (Verenigd Koninkrijk)", 
	"MT - Malta", "MU - Mauritius", "MV - Maldiven", "MW - Malawi", "MX - Mexico", "MY - Maleisië", "MZ - Mozambique", "NA - Namibië", "NC - Nieuw-Caledonië (Frankrijk)", 
	"NE - Niger", "NF - Norfolkeiland", "NG - Nigeria", "NI - Nicaragua", "NO - Noorwegen", "NP - Nepal", "NR - Nauru", "NU - Niue", "NZ - Nieuw-Zeeland", 
	"OM - Oman", "PA - Panama", "PC - Trustgebied van de Pacifische Eilanden", "PE - Peru", "PF - Frans-Polynesië (Frankrijk)", "PG - Papoea-Nieuw-Guinea", 
	"PH - Filipijnen", "PK - Pakistan", "PL - Polen", "PM - Saint-Pierre en Miquelon (Frankrijk)", "PN - Pitcairneilanden (Verenigd Koninkrijk)", 
	"PR - Puerto Rico (Verenigde Staten)", "PS - Palestina", "PS - Palestijns Gebied", "PT - Portugal", "PW - Palau", "PY - Paraguay", "QA - Qatar", 
	"RE - La Réunion (Frankrijk)", "RO - Roemenië", "RS - Servië", "RU - Rusland", "RW - Rwanda", "SA - Saoedi-Arabië", "SB - Salomonseilanden", 
	"SC - Seychellen", "SD - Soedan", "SE - Zweden", "SG - Singapore", "SH - Sint-Helena (Verenigd Koninkrijk)", "SH - Franse gebieden op Sint-Helena", 
	"SI - Slovenië", "SJ - Spitsbergen", "SK - Slowakije", "SL - Sierra Leone", "SM - San Marino", "SN - Senegal", "SO - Somalië", "SS - Zuid-Soedan", 
	"ST - Sao Tomé en Principe", "SV - El Salvador", "SY - Syrië", "SZ - Eswatini", "TC - Turks- en Caicoseilanden (Verenigd Koninkrijk)", "TD - Tsjaad", 
	"TF - Franse zuidelijke gebieden", "TG - Togo", "TH - Thailand", "TJ - Tadzjikistan ", "TK - Tokelau (Nieuw-Zeeland)", "TL - Oost-Timor", 
	"TM - Turkmenistan", "TN - Tunesië", "TO - Tonga", "TR - Turkije", "TT - Trinidad en Tobago", "TV - Tuvalu", "TW - Taiwan", "TZ - Tanzania", 
	"UA - Oekraïne", "UG - Oeganda", "UM - Kleine afgelegen eilanden van de Verenigde Staten", "US - Verenigde Staten van Amerika", "UY - Uruguay", 
	"UZ - Oezbekistan", "VA - Vaticaanstad", "VC - Saint Vincent en de Grenadines", "VE - Venezuela", "VG - Britse Maagdeneilanden (Verenigd Koninkrijk)", 
	"VI - Amerikaanse Maagdeneilanden (Verenigde Staten)", "VN - Vietnam", "VU - Vanuatu", "WF - Wallis en Futuna (Frankrijk)", "WS - Samoa", 
	"YE - Jemen", "YT - Mayotte", "ZA - Zuid-Afrika", "ZM - Zambia", "ZW - Zimbabwe"]
	:
	["BE", "NL", "SR", "AW", "BQ", "BQ", "BQ", "CW", "SX", "AN", "AD", "AE", "AF", "AG", "AI", "AL", "AM", "AO", "AQ", "AR", "AS", 
	"AT", "AU", "AX", "AZ", "BA", "BB", "BD", "BF", "BG", "BH", "BI", "BJ", "BL", "BM", "BN", "BO", "BR", "BS", "BT", "BV", "BW", "BY", "BZ", "CA", "CC", "CD", "CF", "CG", "CH", "CI", 
	"CK", "CL", "CM", "CN", "CO", "CR", "CU", "CV", "CX", "CY", "CZ", "DE", "DJ", "DK", "DM", "DO", "DZ", "EC", "EE", "EG", "EH", "ER", "ES", "ET", "FI", "FJ", "FK", "FM", "FO", "FR", 
	"GA", "GB", "GD", "GE", "GF", "GG", "GH", "GI", "GL", "GM", "GN", "GP", "GQ", "GR", "GS", "GT", "GU", "GW", "GY", "HK", "HM", "HN", "HR", "HT", "HU", "ID", "IE", "IL", "IM", "IN", 
	"IO", "IQ", "IR", "IS", "IT", "JE", "JM", "JO", "JP", "KE", "KG", "KH", "KI", "KM", "KN", "KP", "KR", "KW", "KY", "KZ", "LA", "LB", "LC", "LI", "LK", "LR", "LS", "LT", "LU", "LV", 
	"LY", "MA", "MC", "MD", "ME", "MF", "MG", "MH", "MK", "ML", "MM", "MN", "MO", "MP", "MQ", "MR", "MS", "MT", "MU", "MV", "MW", "MX", "MY", "MZ", "NA", "NC", "NE", "NF", "NG", "NI", 
	"NO", "NP", "NR", "NU", "NZ", "OM", "PA", "PC", "PE", "PF", "PG", "PH", "PK", "PL", "PM", "PN", "PR", "PS", "PS", "PT", "PW", "PY", "QA", "RE", "RO", "RS", "RU", "RW", "SA", "SB", 
	"SC", "SD", "SE", "SG", "SH", "SH", "SI", "SJ", "SK", "SL", "SM", "SN", "SO", "SS", "ST", "SV", "SY", "SZ", "TC", "TD", "TF", "TG", "TH", "TJ", "TK", "TL", "TM", "TN", "TO", "TR", 
	"TT", "TV", "TW", "TZ", "UA", "UG", "UM", "US", "UY", "UZ", "VA", "VC", "VE", "VG", "VI", "VN", "VU", "WF", "WS", "YE", "YT", "ZA", "ZM", "ZW"];

termbank_terms.setTermsMode = function(bTermFichesOnly){
	
	// depending on the mode, we show/don't show the details/concepts columns
	conf.changeTableConfigValue("termbank_termen", "btn_toon", "visible", bTermFichesOnly);
	conf.changeTableConfigValue("termbank_termen", "btn_details", "visible", !bTermFichesOnly);
	
	// register the current mode
	$("#my_termbank_div").data("termfiche_only", bTermFichesOnly);
	
	// in full termbank view, we need to have a large page height
	// so as to prevent the bottom from changing height when we switch between table and form view
	$("#dynamic").css("min-height", bTermFichesOnly ? "auto" : "200vh");
}

termbank_terms.getTermsMode = function(){
	return $("#my_termbank_div").data("termfiche_only");
}


termbank_terms.settings = {
	
	"nice_name": "Termen",
	
	"class": "largetermbank", // apply special border styling for cells etc.
	
	"left": "20px",
	"top": sTableTopPosition,
	"width": sTableTermBankWidth,
	"header_height": sTableHeaderHeight,   // might need to be bigger if more than 1 row of buttons
	
	"main_search": false,
	"export_buttons": false,
	"pagination_on_top": false,
	"exact_count": true,
	"keep_small": true,
	
	"columns_button": bLexitButtonTest,
	"goto_button": bLexitButtonTest,
	"refresh_button": bLexitButtonTest,
	"replace_button": bLexitButtonTest,
	"reset_button": bLexitButtonTest,
	"selection_button": bLexitButtonTest,
	"undo_button": bLexitButtonTest,
	"help_button": bLexitButtonTest,
	"viewtype_button": bLexitButtonTest,
	
	"resizable": false,
	"draggable": false,
	
	"resize_callback": function(t, ui){
		form.updateLayout(t, true, false);
	},
	
	"columns_sorting": {"concept_id": "asc"},
	
	
	"preinit_callback": function(t){
		
		// set the position and visibility of fields dynamically 
		// (needed because of the dynamic form structure, defined by the user in the fields selector dialog)		
		
		termfieldselector.updateFieldsVisibility();
		termfieldselector.recomputePositionsHorizontalGroups(termfieldselector.set2table["termen"]);
		
	},
	
	"callback": function(t){
		
		//var aTableSettings = conf.getTableSettings(fn.getTableName(t));
		//console.log(conf.getFormGrid(aTableSettings));
		
		// put the free buttons in the middle of the header
		util.putFreeButtons(t);		
		
		// if in form view, put the form sections into an accordion view
		form.activateAccordion(t);
		
		
		// are we in termfiches-only mode?		
		var bTermfichesOnly = termbank_terms.getTermsMode();
		
		// hide the length selector in form view
		// show or hide buttons depending on the view
		if (fn.getViewType(t) == "form") {
			$("#"+fn.getTableName(t)+"_wrapper").find("#"+fn.getTableName(t)+"_length").hide();
			$("#"+fn.getTableName(t)+"_wrapper").find(".dataTables_info").hide();		

			util.disableButton(t, "Voeg term toe");	
			util.showButton(t, "Terug naar lijst termen");		
			
			// and show the current term in the header
			var nCurrentRow = util.getBestRow(t);
			var sTerm = fn.getDataFromCellInRowNode(nCurrentRow, "term");
			$("#"+fn.getTableName(t)+"_wrapper .top").find("#termbank_termen_tablename").text("Term: "+sTerm);
		}
		else {
			$("#"+fn.getTableName(t)+"_wrapper").find("#"+fn.getTableName(t)+"_length").show();
			$("#"+fn.getTableName(t)+"_wrapper").find(".dataTables_info").show();
			
			util.showButton(t, "Voeg term toe");
			if (!bTermfichesOnly)
				util.hideButton(t, "Terug naar lijst termen");
			else
				util.showButton(t, "Terug naar lijst termen");			
				
			// restore table name in the header (in case we were in form view before)
			$("#"+fn.getTableName(t)+"_wrapper .top").find("#termbank_termen_tablename").text("Termen");
		}
		
		
		// make sure that table keep piled up in any case
		if (!bTermfichesOnly){
			util.pileUpTermbankTables(500);		
			util.pileUpTermbankTables(1000);	
		}
		
		
		// set the right button name given the view
		if (bTermfichesOnly){
			fn.setFreeButtonName("termbank_termen", "Voeg term toe", "Voeg concept toe");
			fn.setFreeButtonName("termbank_termen", "Terug naar lijst termen", "Kolommen-selectie");
		}
		else {
			fn.setFreeButtonName("termbank_termen", "Voeg term toe", "Voeg term toe");
			fn.setFreeButtonName("termbank_termen", "Terug naar lijst termen", "Terug naar lijst termen");
		}
		
		// row count is only expected in the termfile only mode
		if (!bTermfichesOnly){
			$("#"+fn.getTableName(t)+"_wrapper").find("#"+fn.getTableName(t)+"_length").hide();
			$("#"+fn.getTableName(t)+"_wrapper .top").find(".dataTables_info").text("");
		} 
		else {
			$("#"+fn.getTableName(t)+"_wrapper").find("#"+fn.getTableName(t)+"_length").show();
		}

		
	},
	"repeat_callback": true,
	
	
	
	"formgrid": {
		
		"definition": [30, 20],
		"top": sTableTopPosition,
		"bgcolor": "#EFEFEF",

		// form horizontal alignment
		"align": "center",
		
		// no search bar
		"searchbar": false,

		// buttons bar undo/save
		"buttonsbar_position": [20.3, -2.45],
		
		
		
		"cells": {
			
			// automatically generated, except:
			
			"term_id": {
				"synchronize_with": {"termvarianten": "term_id", "contexten": "term_id"}  // ensure that the termvormen list is filled
			},
			
			"concept_id": {
				"definition": [1, 0.85]
			},
			
			"aangemaakt_op": {
		
				"render": function(sValue){
					return util.shortDateFormat(sValue);			
				}
			}, 
			
			"gewijzigd_op": {
			
				"render": function(sValue){
					return util.shortDateFormat(sValue);			
				}
			}, 
			
		},
		
		"lists": {
			
			"termvarianten": {
				
				"nice_name": "Termvormen",
				
				"cellgroup": "termvormen_label",
				
				"definition": [termbank_summary.formWidth*2, termbank_summary.formHeight*5],
				
				"table": {
					
					"name": "termbank_termvormen",
					
					"columns_sorting": {"termvorm": "asc", "termvorm_id": "asc"},
					
					"columns": {
						
						"termvorm_id": {
							"visible": false
						},
						"termvorm": {											
							"visible": true,
							"editable": true
						},	
						"upos": {
							"nice_name": "UPOS",
							"visible": true,
							"editable": true
						},
						"upos_features": {
							"nice_name": "UPOS-features",
							"visible": true,
							"editable": true
						},				
						"bron_van_de_termvorm": {	
							"nice_name": "Bron",
							"editable": true,
							"visible": true				
						}
					}
					
				},
				
				"buttons": {
					
					"add": {
						"do": function(sListLabel, sFeedingTable){
							
							fn.prompt("Goedemorgen", ["termvorm", "upos", "bron_van_de_termvorm"], [], function(resp){
								lists.addRowToList(sListLabel, resp, function(){
									fn.message("Hoi!");
								});
							})
						},
						"title": "Voeg vorm toe",
						"copy": { 
							"term_id": {"form": "term_id"} // get the value from the form cell 'term_id'						
						}
										
					},
					
					"delete": true
				}
				
			},
			
			"contexten": {
				
				"nice_name": "Contexten",
				
				"cellgroup": "contexten_label",
				
				"definition": [termbank_summary.formWidth*3, termbank_summary.formHeight*5],
				
				"table": {
					
					"name": "termbank_termcontexten",
					
					"columns_sorting": {"termvorm": "asc", "termvorm_id": "asc"},
					
					"columns": {
						
						"term_id": {
							"visible": false
						},
						"context": {
							"editable": true
						},
						"termcontext_id": {
							"visible": false
						},
						"bron_van_de_context": {
							"nice_name": "Bron",
							"editable": true,
							"width": "350px"							
						}
					}
					
				},
				
				"buttons": {
					
					"add": {
						"title": "Voeg context toe",
						"copy": { 
							"term_id": {"form": "term_id"} // get the value from the form cell 'term_id'						
						}				
					},
					
					"delete": true
				}
				
			}
			
		}
	},
	
	
	"buttons": {
		
		"Voeg term toe": {
			
			"class": "table_header_button nopadding",
			"click": function(t){
				
				
				// are we in termfiches-only mode?
				// if so, this button is about adding a concept 
				var bTermfichesOnly = termbank_terms.getTermsMode();
				
				if (bTermfichesOnly){
					
					fn.insertIntoTable("termbank_concepten", 
						{"aangemaakt_door": fn.getCurrentUser()},
						"concept_id", // id field to be returned 

						function(sConceptId) {
							
							// insert a new language row for this concept
							// is NOT NEEDED here
							// because a trigger will automatically insert a language row
							
							fn.insertIntoTable("termbank_termen", 
								{"aangemaakt_door": fn.getCurrentUser(), "concept_id": sConceptId, "bewerkingsstatus": "aangemaakt"},
								null, // no id field to be returned
								function(){
									
									fn.closeAllTables(function() {
										setTimeout(function(){
											fn.callTable("termbank_concepten", {"concept_id": sConceptId});
										}, 500);
									});
									
								}
							);
							
							
						}
					);
							
				}
				
				// we are NOT in termfiches only mode,
				// this button is about adding a term fiche (which is default)
				else {
								
					// read  language name			 
					var nRow = util.getBestRow(t);
					if (nRow == null) nRow = util.getBestRow("termbank_talen");			
					var sTaal = fn.getDataFromCellInRowNode(nRow, "taal");
					
					// concept id
					// - if some concept is chosen, take its ID
					// - if not, take the default concept 0
					var sConceptId = "0"; 
					if (mt.getDataTableObjectOf("termbank_concepten").rows().count() > 0){
						var nConceptRow = util.getBestRow("termbank_concepten");
						sConceptId = fn.getDataFromCellInRowNode(nConceptRow, "concept_id");
					}
					
					
					// insert a new term row for this concept and language
					fn.insertIntoTable("termbank_termen", 
						{"taal": sTaal, "aangemaakt_door": fn.getCurrentUser(), "concept_id": sConceptId, "bewerkingsstatus": "aangemaakt"},
						"term_id", // id field to be returned 
						
						function(sTermId){
							
							// call term corresponding to this concept and language
							fn.callTable("termbank_termen", 
								{ "term_id": sTermId },    // we need to go to the newly created term!
								function() {									
									// make sure we are in form view
									if (fn.getViewType("termbank_termen") != "form"){
										setTimeout(function(){
											fn.toggleViewType("termbank_termen");
										}, 100);
									}
								});	
							
						}
					);
	
				}
			}
		},
		
		
		
		"Verwijder term": {
			"class": "table_header_button nopadding danger",
			"click": function(t) {
				
				var nSelectedRows = fn.getSelectedRowNodesFrom(t);
				if (nSelectedRows.length == 0){
					
					fn.message("Let op!", "U moet minstens één fiche selecteren.");
				}
				else {
					fn.confirm("Let op", "Weet u zeker dat u de geselecteerde term wilt verwijderen?", 
						function(){
							
							$(nSelectedRows).each(function(){
								var nThisRow = this; 
								var bLastRow = fn.isLastNodeOf(nThisRow, nSelectedRows);
								fn.removeFromTableGivenANode(nThisRow, function(){
									if (bLastRow){
										if (fn.getViewType(t) == "form") {
											
											var nConceptRow = util.getBestRow("termbank_concepten");
											sConceptId = fn.getDataFromCellInRowNode(nConceptRow, "concept_id");
						
											fn.callTable(t, {"concept_id": sConceptId, "term_id": ""}, function(){
												setTimeout(function(){
													// go back to table view
													fn.toggleViewType(t);
												}, 1000);
											});
										}
										else {
											fn.refreshTable(t);
										}
										
									}
								});
							});
							
						}, 
						function(){
							// cancelled
						});
					
				}
			}
			
		},
		
		
		"Terug naar lijst termen": {
			
			"class": "table_header_button nopadding",
			"click": function(t) {
				
				// are we in termfiches-only mode?		
				var bTermfichesOnly = termbank_terms.getTermsMode();
				
				if (bTermfichesOnly){
					
					// open the termbank overview
					$("#my_termbank_div").click();
				}
				else {
					
					// we need to know which term was just added (or at least: was shown in the form view)
					var nRow = util.getBestRow(t);
					var sTermId = fn.getDataFromCellInRowNode(nRow, "term_id");
					var sConceptId = fn.getDataFromCellInRowNode(nRow, "concept_id");
					
					// only filter by concept ID from now on
					fn.setFilters(t, {"concept_id": sConceptId}, true);
					
					// go back to the table view
					fn.toggleViewType(t, function(){
						setTimeout(function(){
							
							// make sure that table keep piled up in any case
							util.pileUpTermbankTables(500);
							
							// make newly added row visible by selecting it
							setTimeout(function(){
								// select the newly added row, which has term_id = sTermId
								var nRow = fn.getRowNodeWhere("termbank_termen", {"term_id": sTermId});
								fn.selectRowNode(nRow);
								
								// make sure the term_id filter is removed from searchbox as well
								fn.putDataIntoFilterBox(t, "term_id", "");
								
					
							}, 200);
								
						}, 500);					
					});
					
				}
				
			}
			
			
		}
		
	},
	
	
	
	
	
	
	/*
	"button_3": {
		"name": "<span class='ui-icon ui-icon-image' style='background-color: yellow''></span> Details",
		"class": "table_header_button one nopadding nextrow",
		"click": function(t){
			fn.toggleViewType(t, function(){
				
				// set Detail button label
				util.setButtonNameGivenViewMode(t, 3);
				
				if (fn.getViewType(t) == "table") {
					// refreshing might be needed, to make sure not only one row, but all the rows are shown					
					setTimeout(function(){
						//sf.startMultiColumnSearch(fn.getTableName(t));						
						// set display length back to default
						//t.page.len(10).draw(false);
					}, 1000);					
				}
			});	
		}
	},
	*/
	
	"columns_order": [
		"btn_toon", "btn_details",
		"concept_id", "taal", "term", "termtype", "bewerkingsstatus", "term_id",  
		"externe_verwijzing", "uri_externe_verwijzing",  "verwijzing", "toelichting_verwijzing", 
		"woordsoort", "geslacht", "gebruiksstatus", "geografisch_gebruik", "locatie_in_applicatie", 
		"opmerking_bij_de_term", "aangemaakt_op", "aangemaakt_door", "gewijzigd_op", "gewijzigd_door", 
		"projectsubset", "online_publicatie", "url_online_publicatie", "bron_van_de_term", "herkomst", "klantensubset"
		
	]
};

termbank_terms.config = {
	
	"btn_toon": {				// this one is to be used in the single Termfiches view (and otherwise HIDDEN)
		
		"nice_name": "__", 		// different from 'btn_details', because nice_names have to be unique too!
		"button": "concept",
		"class": "cell_button",
		"width": "100px",
		"click": function(t, n){
			
			var sConceptID = fn.getDataFromSiblingNode(n, "concept_id");
			
			fn.closeAllTables(function() {
				fn.callTable("termbank_concepten", {"concept_id": sConceptID});
			});
		}
		
		
	},
	
	"btn_details": {				// this one is to be used in the FULL Termbank view (and otherwise HIDDEN)
	
		"nice_name": "_",
		"button": "details",
		"class": "cell_button",
		"width": "100px",
		"click": function(t, n){
			
			// make sure that the row of the clicked 'details' button gets selected
			fn.selectRowNode(n);
			
			// get the term id and the blacklab corpus name
			// so as to read the blacklab context
			var sCorpusName = fn.getDataFromSiblingNode(n, "herkomst");
			var iTermId = fn.getDataFromSiblingNode(n, "term_id");
			var sSearchTerm = fn.getDataFromSiblingNode(n, "term");
			
			// now open the form view
			setTimeout(function(){
				
				fn.toggleViewType(t, function(){
					
					// read and insert the blacklab contexts into the contexts table
					if ((iTermId != null && iTermId != '') && (sSearchTerm != null && sSearchTerm != '')){
						util.getContextForTermId(sCorpusName, iTermId, sSearchTerm);	
					}					
					
				});
				
			}, 100);
			
		}	
	},
	
	"concept_id": {
		"visible": true,
		"nice_name": "Concept (ID)",	
		"width": "100px"
	},
	
	"taal": {
		"visible": true,
		"editable": true,
		"nice_name": "Taal",
		"width": "100px"
	}, 
	"term_id": {
		"visible": false,
		"nice_name": "Term (ID)"
	}, 
	"term": {
		"visible": true,
		"nice_name": "Term",
		"editable": true
	}, 
	"externe_verwijzing": {
		"visible": false,
		"editable": true,
		"nice_name": "Externe verwijzing (bijschrift)"
	}, 
	"uri_externe_verwijzing": {
		"visible": false,
		"editable": true,
		"nice_name": "Externe verwijzing (URL)"
	}, 
	"termtype": {
		"visible": true,
		"nice_name": "Termtype",
		"editable": true
	}, 
	"verwijzing": {
		"visible": false,
		"editable": true
	}, 
	"toelichting_verwijzing": {
		"visible": false,
		"editable": true,
		"nice_name": "Verwijzing (toelichting)"
	}, 
	"woordsoort": {
		"visible": false,
		"editable": true
	}, 
	"geslacht": {
		"visible": false,
		"editable": true
	}, 
	"gebruiksstatus": {
		"visible": false,
		"editable": true
	}, 
	"geografisch_gebruik": {
		"visible": false,
		"editable": true,
		"choosefrom": termbank_terms.aGeografischGebruik
	}, 
	"locatie_in_applicatie": {
		"visible": false,
		"editable": true
	},
	"opmerking_bij_de_term": {
		"visible": false,
		"editable": true,
		"nice_name": "Term (opmerking)"
	}, 
	"aangemaakt_op": {
		"visible": true,
		"width": "200px",
		"nice_name": "Aangemaakt",
		"render": function(sValue){
			return util.shortDateFormat(sValue);			
		}
	}, 
	"aangemaakt_door": {
		"visible": true,
		"nice_name": "Aanmaker"
	}, 
	"gewijzigd_op": {
		"visible": true,
		"nice_name": "Laatste wijziging",
		"render": function(sValue){
			return util.shortDateFormat(sValue);			
		}
	}, 
	"gewijzigd_door": {
		"nice_name": "Laatste wijziging door",
		"visible": false
	}, 
	"projectsubset": {
		"visible": false,
		"editable": true
	}, 
	"bewerkingsstatus": {
		"visible": true,
		"editable": true
	},
	"online_publicatie": {
		"editable": true,
		"visible": false,
		"nice_name": "Online publicatie (URL)"
	}, 
	"url_online_publicatie": {
		"visible": false,
		"editable": true,
		"nice_name": "Online publicatie (URL)"
	}, 
	"bron_van_de_term": {
		"visible": false,
		"editable": true,
		"nice_name": "Term (bron)"
	}, 
	"klantensubset": {
		"visible": false,
		"editable": true
	},
	"herkomst": {
		"visible": false,
	}
};