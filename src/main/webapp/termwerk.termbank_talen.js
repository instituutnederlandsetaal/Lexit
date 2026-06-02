
termbank_languages = {}



termbank_languages.getLanguagesList = function(sProjectId, fnCallback){
	
	var sUrl = uTermServeInstanceUrl + "webservice/api/"+ "get_unique_values";
	
	var aParameters = (sProjectId == null) ?
	{
		"project_id": "public",				 // public
		"username": fn.getCurrentUser(),
		"table_name": "taalsmaken",
		"column_name": "taal",
		"sort_by": "prio"
	}
	:
	 {
		"project_id": sProjectId,			// project specific
		"username": fn.getCurrentUser(),
		"table_name": "termbank_taalselectie",
		"column_name": "taal",
	};
	
	fn.callService(sUrl, aParameters, "GET", null, fnCallback);	
};



termbank_languages.settings = {
	
	"nice_name": "Talen",
	
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
	
	
	"columns_order": ["btn_details",
		"concept_id", "taal", "definitie", "definitie_id", "opmerking_bij_de_definitie", 
		"bron_van_de_definitie", "projectsubset", "bewerkingsstatus", "online_publicatie", "url_online_publicatie",
		"bron_taalspecifiek", "aangemaakt_op", "aangemaakt_door", "gewijzigd_op", "gewijzigd_door", "taal_record_id"
	],
	
	"resizable": false,
	"draggable": false,
	
	"preinit_callback": function(t){
		
		// hide the term bank buttons, because we are now opening a table
		//termheader.hideTermBankButtons();
		
		// set the position and visibility of fields dynamically 
		// (needed because of the dynamic form structure, defined by the user in the fields selector dialog)
		
		
		termfieldselector.updateFieldsVisibility();
		termfieldselector.recomputePositionsHorizontalGroups(termfieldselector.set2table["talen"]);
		
			
	},
	
	"close_callback": function(t){
		//termheader.showTermBankButtons();		
	},
	
	"resize_callback": function(t, ui){
		form.updateLayout(t, true, false);
	},
	
	"callback": function(t){
		
		// put the custom buttons in the middle of the header
		util.putFreeButtons(t);
		
		// if in form view, put the form sections into an accordion view
		form.activateAccordion(t);
				
		// hide the length selector in any case, since there will never be more than a few rows in here
		$("#"+fn.getTableName(t)+"_wrapper").find("#"+fn.getTableName(t)+"_length").hide();
		$("#"+fn.getTableName(t)+"_wrapper .top").find(".dataTables_info").text("");
		
		// hide the length info in form view
		// show or hide buttons depending on the view
		if (fn.getViewType(t) == "form") {			
			$("#"+fn.getTableName(t)+"_wrapper").find(".dataTables_info").hide();
			util.showButton(t, "Terug naar lijst talen");
			
			// and show the current language in the header
			var nCurrentRow = util.getBestRow(t);
			var sTaal = fn.getDataFromCellInRowNode(nCurrentRow, "taal");
			$("#"+fn.getTableName(t)+"_wrapper .top").find("#termbank_talen_tablename").text("Taal: "+sTaal);
		}
		else {			
			$("#"+fn.getTableName(t)+"_wrapper").find(".dataTables_info").show();
			util.hideButton(t, "Terug naar lijst talen");			
			
			// restore table name in the header (in case we were in form view before)
			$("#"+fn.getTableName(t)+"_wrapper .top").find("#termbank_talen_tablename").text("Talen");
		}
		
		// make sure that table keep piled up in any case
		util.pileUpTermbankTables(500);
		util.pileUpTermbankTables(1000);
		
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
		"buttonsbar_position": [20.3, -2.25],
		
		"cells": {
			
			// automatically generated, except:
			
			"concept_id": {
				"definition": [1, 0.85]
			},
			
			"definitie": {
				"definition": [1, 2]
			},
			
			"gewijzigd_op": {
				"render": function(sValue){
					return util.shortDateFormat(sValue);			
				}
			},
			"aangemaakt_op": {				
				"render": function(sValue){
					return util.shortDateFormat(sValue);			
				}
			},
		}
	},
	
	
	
	"buttons": {
		
		
		"Terug naar lijst talen": {
			
			"class": "table_header_button nopadding",
			"click": function(t) {
				
				var aLangParams = {};
				
				// get number of rows in the table
				var iCount = t.rows().count();
				
				    // default
				    aLangParams = {"taal_record_id": ""};
					
					// if we have a row left, get the concept ID and use it as a filter
					if (iCount>0) {
						var sConceptId = fn.getDataFromCellInRowNode(util.getBestRow(t), "concept_id");
						aLangParams = {"taal_record_id": "", "concept_id": sConceptId};
					}	
					
					
					fn.toggleViewType(t, function(){
						setTimeout(function(){
							fn.callTable(t, aLangParams, function(){
								// make sure that table keep piled up in any case
								util.pileUpTermbankTables(500);
							});	
						}, 500);					
					});
				
			}
			
		}
	}
	
};


termbank_languages.config = {
	
	"btn_details": {
		"nice_name": "_",
		"button": "details",
		"class": "cell_button",
		"width": "100px",
		"click": function(t, n){
			
			// make sure that the row of the clicked 'details' button gets selected
			fn.selectRowNode(n);
			
			setTimeout(function(){
				fn.toggleViewType(t);
			}, 100);
			
		}
	},	
	"taal_record_id": {
		"visible": false,
		"nice_name": "Taal (record ID)"
	}, 
	"projectsubset": {
		"editable": true,
		"visible": false
	}, 
	"bron_taalspecifiek": {
		"editable": true,
		"visible": false,
		"nice_name": "Taal (bron)"
	}, 	
	
	"concept_id": {
		"visible": true,
		"nice_name": "Concept (ID)"	
	},
	"taal": {
		"visible": true,
		//"editable": true,
		"nice_name": "Taal",
		"width": "100px"
	},
	"definitie": {
		"visible": true,
		"editable": true,
		"nice_name": "Definitie"
	},
	"definitie_id": {
		"visible": false,
		"nice_name": "Definitie (ID)"
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
	},
	"aangemaakt_op": {
		"visible": true,
		"nice_name": "Aangemaakt",
		"render": function(sValue){
			return util.shortDateFormat(sValue);			
		}
	},
	"aangemaakt_door": {
		"visible": true,
		"nice_name": "Aanmaker"
	},
	"bewerkingsstatus": {
		"visible": true,
		"editable": true
	},
	"opmerking_bij_de_definitie": {
		"editable": true,
		"visible": true,
		"nice_name": "Definitie (opmerking)"
	},
	"bron_van_de_definitie": {
		"editable": true,
		"visible": true,
		"nice_name": "Definitie (bron)"
	},
	"online_publicatie": {
		"editable": true,
		"visible": false,
		"nice_name": "Online publicatie"
	},
	"url_online_publicatie": {
		"editable": true,
		"visible": false,
		"nice_name": "Online publicatie (URL)"
	}
			
	
};