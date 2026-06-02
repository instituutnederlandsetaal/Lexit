
termlist = {};


termlist.settings = {
	
	"top": sTableTopPosition,
	"left": "20px",
	"width": sTableTermBankWidth,
	
	"class": "largetermbank", // apply special border styling for cells etc.
	
	"exact_count": true,
	"main_search": false,
	"export_buttons": true,
	"full_export_button": {
		"position": "last"
	},
	"pagination_on_top": false,
	
	"columns_button": bLexitButtonTest, 
	"goto_button": bLexitButtonTest,
	"refresh_button": bLexitButtonTest,
	"replace_button": bLexitButtonTest,
	"reset_button": bLexitButtonTest,
	"selection_button": bLexitButtonTest,
	"undo_button": bLexitButtonTest,
	"help_button": bLexitButtonTest,
	"viewtype_button": bLexitButtonTest,
	
	"columns_order": [
		"id", "termlist_id", // hidden		
		"btn_zoek", "selectie",  // selection and search button
		"aanwezig", // already in termbank
		
		"corpuslink",		
		"kandidaatterm", "taal", "frequentie", "score", 
		"lemmatisering", "bewerkingsstatus", "pos_patroon", "upos_features", "hoofd", "hoofd_pos",
		"termlabel" ,"rel_freq_pm", "frequentie_referentiecorpus", "rel_freq_pm_refcorpus", 
		"uitsluiten" // blacklisted or so
	],
	
	"resize_callback": function(t, ui){
		form.updateLayout(t, true, false);
	},
	
	"callback": function(t){	
		
		// hide the export buttons
		$(".dt-button").css("opacity", 0).css("left", "-1000px").css("position", "absolute"); // beautiful trick
		
		// put the custom buttons in the middle of the header
		util.putFreeButtons(t);
		
		
		// hide the length selector in form view
		if (fn.getViewType(t) == "form") {
			$("#"+fn.getTableName(t)+"_wrapper").find("#"+fn.getTableName(t)+"_length").hide();
			$("#"+fn.getTableName(t)+"_wrapper").find(".dataTables_info").hide();
		}
		else {			
			$("#"+fn.getTableName(t)+"_wrapper").find("#"+fn.getTableName(t)+"_length").show();
			$("#"+fn.getTableName(t)+"_wrapper").find(".dataTables_info").show();
			
			// remove the total number of row of the table with all termlists!
			var sInfo = $("#"+fn.getTableName(t)+"_wrapper").find(".dataTables_info").text();
			var iTotalIndex =  sInfo.indexOf("(uit");
			if (iTotalIndex>=0)
				$("#"+fn.getTableName(t)+"_wrapper").find(".dataTables_info").text(sInfo.substring(0, iTotalIndex));
		}
		
		
		// disable selection checkbox for terms that are already in the termbank
		var aRows = fn.getAllRowNodes(t);
		$(aRows).each(function(){
			
			var nThisRow = this;
			var sAanwezig = fn.getDataFromCellInRowNode(nThisRow, "aanwezig");
			var bAanwezig = (sAanwezig == true || sAanwezig == "t");
			
			if (bAanwezig) {
				$(fn.getCellInRowNode(nThisRow, "selectie")).find("input").prop("disabled", true);
			}
		}); 
		
		
	},
	"repeat_callback": true,
	
	"buttons": {
		
		"Voeg selectie toe aan termenbank": {
			
			"class": "table_header_button bitlarger3 nopadding",
			"click": function(t){
				
				
				var fnAddSelectionToTermbank = function(bAddConcepts){
					
					var sTermListId = fn.getDataFromCellInRowNode(util.getBestRow(t), "termlist_id");
				
					fn.callFunction(util.getProjectId()+".add_termselection_2_termbank", [fn.getCurrentUser(), sTermListId, bAddConcepts], 
						function(resp){
							
							fn.confirm("Selectie toegevoegd", "De selectie is toegevoegd aan de termenbank.<BR><BR>Wilt u nu de termenbank openen?", 
								function(){
									
									// open the termbank section!
									$("#my_termbank_div").click();
									
									// wait a bit and then click the button to show the terms
									// but do this ONLY IF the termbank is set correctly (t.i. is must at least have a name)
									setTimeout(function() {
										
										var sTermbankName = form.getDataFromCell("termbank_samenvatting", "naam_termbank");
										
										if (sTermbankName != null && sTermbankName != ""){
											$("#termbank_samenvatting_freebutton_toon_overzicht_termen button").click();	
										}
										else {
											fn.message("Let op", 
												"De termenbank is nog niet correct ingesteld: vul in ieder geval een naam in.<BR><BR>"+
												"U kunt de termen vervolgens openen via de knop 'toon overzicht termen'.");
										}
									}, 500);
								},
								function(){
									// cancelled: nothing to do
								}
							);
						},
						function(err){
							fn.message("Fout!", "Er ging iets mis bij het toevoegen van de selectie aan de termenbank. Zie console voor details.");
							console.log(err);
						}
					);
					
				};
				
				fn.confirm("Let op", "De geselecteerde termen zullen nu aan de termenbank worden toegevoegd.<BR><BR>"+
					"<B>Wilt u iedere term alvast aan een concept koppelen?</B><BR><BR>"+
					"<B>N.B.</B>: Dit is niet verplicht. U kunt concepten ook later, tijdens uw<BR>"+
					"werkzaamheden in de termenbank, aanmaken en aan termen koppelen.", 
					function(){						
						fnAddSelectionToTermbank(true);
					},
					function(){						
						fnAddSelectionToTermbank(false);
					}
				);
				
				
			}
		},
		
		"Kolommen-selectie": {
			
			"class": "table_header_button nopadding",
			"click": function(t){
				var sTablename = fn.getTableName(t);
				td.selectColumns(sTablename);
			}
		},
		
		"Exporteer": {
			"class": "table_header_button nopadding",
			"click": function(t){
				var iNumberOfRows = t.page.info().recordsDisplay;
				fn.confirm("Let op", "U staat op het punt om "+iNumberOfRows+" termen te exporteren.<BR><BR>Wilt u doorgaan?",
					function(){
						$(".buttons-excel:has(span:contains('Excel full Export'))").click();	
					},
					function(){
						// cancelled: nothing to do
					}
				);
				
			}
		}
	}
	
	
};

termlist.config = {
	
	
	"id": {
		"flexible_visibility": false,
		"visible": false
	},
	"termlist_id": {
		"flexible_visibility": false,
		"visible": false
	},
		
	"btn_zoek": {
		"flexible_visibility": false,
		"nice_name": "zoek",
		"button": "zoek",
		"class": "cell_button",
		"click": function(t, n){
			
			var sTerm = fn.getDataFromSiblingNode(n, "kandidaatterm");
			
			// read the corpus name (if relevant)			
			var sBlacklabCorpusName = $("#termenlijst_wrapper").attr("data-herkomst");
			// rescue if the corpus name is somehow not available yet/anymore?
			if (sBlacklabCorpusName == null || sBlacklabCorpusName == "") {
				var nSelectedTermlistRow = util.getBestRow("termenlijst_meta");
				var sBronType = fn.getDataFromCellInRowNode(nSelectedTermlistRow, "brontype");
				if (sBronType == "Extracted")
					sBlacklabCorpusName = fn.getDataFromCellInRowNode(nSelectedTermlistRow, "herkomst");
			}
			
			// no corpus name available? show explanation to user
			if (sBlacklabCorpusName == null || sBlacklabCorpusName == "") {
				fn.message("Let op", 
					"Deze termenlijst werd geïmporteerd en is dus niet gekoppeld aan een corpus.<BR><BR>"+
					"Zoeken in een corpus is daarom niet mogelijk.");
			}
			// we have a corpus name, so build a search query and open the corpus search page
			else {
				var aTerms = sTerm.split(" ");
				var sPatt = '';
				for (var t=0; t<aTerms.length; t++){
					sPatt += '[word="'+ aTerms[t] + '"]';
				}
				
				var sUrl = "/corpus-frontend/" + sBlacklabCorpusName + "/search/hits?";
				var aParams = {
					"first": 0,
					"number": 20,
					"adjusthits": "yes",
					"patt": encodeURIComponent(sPatt),
					"interface": encodeURIComponent('{"form":"search","patternMode":"simple"}')					
				};
				// Convert aParams to a query string
				var queryString = Object.keys(aParams)
				  .map(key => key + '=' + aParams[key])
				  .join('&');
				  
				// finally add the params to the url
				sUrl += queryString;
				
				window.open(sUrl, "Kandidaat-term '"+sTerm+"' in corpus zoeken");	
			}
			
		}
	}, 
	"corpuslink": {			// source for btn_zoek button
		"visible": false
	},
	
	
	"selectie": {
		"flexible_visibility": false,
		"editable": true
	},
	"aanwezig": {
		
	},	
	
	"kandidaatterm": {
		"nice_name": "kandidaat-term"
	},
	"taal": {
		
	}, 
	"frequentie": {
		"nice_name": "freq"
	}, 
	"score": {
		
	}, 
	"lemmatisering": {
		"editable": true
	},
	"bewerkingsstatus": {
		"editable": true
		
	},  
	"pos_patroon": {
		"nice_name": "POS-patroon"
	}, 
	 
	"upos_features": {
		"nice_name": "UPOS-features"
	},
	"hoofd": {
		"visible": false
	}, 
	"hoofd_pos": {
		"nice_name": "hoofd-POS",
		"editable": true
	},
	"termlabel": {
		"visible": false
	},
	"rel_freq_pm": {
		"nice_name": "relFreqPM"
	}, 
	"frequentie_referentiecorpus": {
		"visible": false,
		"nice_name": "freqRefCorpus"
	},
	"rel_freq_pm_refcorpus": {
		"nice_name": "relFreqPM Referentiecorpus"
	},
	
	"uitsluiten": {
		"editable": true,
		"filter": "nee"
	}
};