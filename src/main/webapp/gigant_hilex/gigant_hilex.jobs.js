
var hilexjobs = {};


hilexjobs.settings = {
	
	thomas_new_fabulous_table: {
		
		//"group": "Klus",
		"width": "50%",
		"column_sorting": {"complex": "asc", "simplex": "asc"}
	},

	thomas_new_fabulous_table_premium: {
		
		//"group": "Klus",
		"width": "50%",
		"column_sorting": {"complex": "asc", "simplex": "asc"}
	},

    ticket_179_possible_doubled_lemmata: {
			
		"creation_date": "20200305",		
		//"group": "Klus",		
		"width": "70%"
	},

	lemmata_without_paradigm: {
		
		//"group": "Klus",		
		"creation_date": "20190702",
				
		"callback": function(t){
			
			fn.callFunction("public.get_lem_without_paradigm_stats", [], function(resp){
				
				var sTableName = fn.getTableName(t);
				var sStatusDivId = "lem_stats";
				$("#"+sTableName+"_wrapper .top").find("#"+sStatusDivId).remove();
				$("#"+sTableName+"_wrapper .top").append(
						$("<div></div>")
						.attr("id", sStatusDivId)
						.css("width", "200px")	
						.css("text-align", "center")			
						.css("color", "black")
						.append($("p").css("text-decoration", "none")
							)
						);
				
				$("#"+sTableName+"_wrapper .top #"+sStatusDivId).append(
						$("<span></span>")
						.html("Vreugdemeter: "+resp["get_lem_without_paradigm_stats"])
						.css("font-size", "120%")
						);
				
				$("#"+sTableName+"_wrapper .top #"+sStatusDivId)
				.css("border", "1px dotted black")
				.css("position", "relative")
				.css("top", "10px")
				.css("left", "210px");
				
			});
			
		},
		
		"repeat_callback": true
		
	},
	
	possible_groups: {
		
		"creation_date": "20190710",		
		"column_sorting": {"diff": "desc"},		
		"columns_order": ["id", "attestation_ids", "quotation_section_id", "quote", "onsetoffset", "wordforms_arr", "wordform",
		                  "lemma_id", "multiple_lemmata_analysis_id", "modern_lemma", 
		                  "levenshtein_dist", "diff", "group_id", "true_count", "opmerking", "klaar"],
		
		//"group": "Klus",
		
		"callback": function(t){
			
			hilexlib.highlightAllQuotes(t);
			
			fn.callFunction("public.get_nr_of_possible_groups_yet_to_process", [], function(resp){
				
				var sTableName = fn.getTableName(t);
				var sStatusDivId = "lem_stats";
				$("#"+sTableName+"_wrapper .top").find("#"+sStatusDivId).remove();
				$("#"+sTableName+"_wrapper .top").append(
						$("<div></div>")
						.attr("id", sStatusDivId)
						.css("width", "200px")	
						.css("text-align", "center")			
						.css("color", "black")
						.append($("p").css("text-decoration", "none")
							)
						);
				
				$("#"+sTableName+"_wrapper .top #"+sStatusDivId).append(
						$("<span></span>")
						.html("Vreugdemeter: "+resp["get_nr_of_possible_groups_yet_to_process"])
						.css("font-size", "120%")
						);
				
				$("#"+sTableName+"_wrapper .top #"+sStatusDivId)
				.css("border", "1px dotted black")
				.css("position", "relative")
				.css("top", "10px")
				.css("left", "210px");
				
			});
		},
		"repeat_callback": true,
		
		"button_0": {
			
			"name": "Deze rijen zijn allemaal klaar",
			"click": function(t){
				
				var oRows = fx.getAllRows(t);
				oRows.every(function(){
					
					var oCurrentRow = this;
					var lastRow = fx.isLastRowOf(oCurrentRow, oRows);
					
					var checkboxvalue = fx.getDataFromCellInRow(oCurrentRow, "klaar");
					if (checkboxvalue == 'f')
						fx.toggleCheckbox(oCurrentRow, "klaar");
					fx.updateDatabaseGivenACellOrRow(oCurrentRow, {"klaar": true});
					
				});					
			}
			
		}
		
	},

	
	missing_mnw_quotes_in_hilex:{
		
		//"group": "Klus - MNW",		
		"creation_date": "20181116"
			
	},

	mnw_lemma_parts_of_speech:{
		
		//"group": "Klus - MNW",		
		"width": "60%",		
		"creation_date": "20181108"
	},
	
	mnw_wordforms_parts_of_speech:{
		
		//"group": "Klus - MNW",		
		"width": "60%",		
		"creation_date": "20181108"
	},

	double_quotations_id_to_check: {
		
		//"group": "Klus",		
		"creation_date": "2018 10 02", "finished_date": "no", "processed_date": "no",		
		"width": "60%"
			
	},
		
	ontbrekende_citaten: {
		
		//"group": "Checklijstjes",		
		"creation_date": "2018 09 20", "finished_date": "ca 2018 10 02", "processed_date": "2018 10 02",		
		"width": "60%"
	},
	
	wordforms_to_diminutives: {
		//"group": "Checklijstjes"
	},
	
	quotation_section_id_of_token_attestations_with_clitics: {
		//"group": "Checklijstjes"
	},
	
	fishy_wordforms: {
		//"group": "Checklijstjes"
	},
	
	marijke_spelling_giganthilex_differences: {
		//"group": "Checklijstjes"
	}


};


hilexjobs.config = {
	
	"thomas_new_fabulous_table": {
		
		"id": {
			"visible": false
		},
		"opmerking": {
			"editable": true
		},
		"opgelost": {
			"editable": true
		},

		"simplex": {
			"click": function(t, n){
				var sLemId = fn.getDataFromSiblingNode(n, "lemma_id")
				fn.callDatabase("lemmata_and_paradigm_view", {"lemma_id": sLemId});
			}
		},

		"complex": {
			"click": function(t, n){
				var sMultiLemId = fn.getDataFromSiblingNode(n, "multiple_lemmata_analysis_id");
				fn.callDatabase("lemmata_and_paradigm_view", {"multiple_lemmata_analysis_id": sMultiLemId});
			}
		},

		"lemma_id": {
			"click": function(t, n){
				var sLemId = fn.getDataFromCellNode(n);
				fn.callDatabase("lemmata_and_paradigm_view", {"lemma_id": sLemId});
			}
		},
		"multiple_lemmata_analysis_id": {
			"click": function(t, n){
				var sMultiLemId = fn.getDataFromCellNode(n);
				fn.callDatabase("lemmata_and_paradigm_view", {"multiple_lemmata_analysis_id": sMultiLemId});
			}
		}
	},

	"thomas_new_fabulous_table_premium": {
		
		"id": {
			"visible": false
		},
		"opmerking": {
			"editable": true
		},
		"opgelost": {
			"editable": true
		},

		"simplex": {
			"click": function(t, n){
				var sLemId = fn.getDataFromSiblingNode(n, "lemma_id")
				fn.callDatabase("lemmata_and_paradigm_view", {"lemma_id": sLemId});
			}
		},

		"complex": {
			"click": function(t, n){
				var sMultiLemId = fn.getDataFromSiblingNode(n, "multiple_lemmata_analysis_id");
				fn.callDatabase("lemmata_and_paradigm_view", {"multiple_lemmata_analysis_id": sMultiLemId});
			}
		},

		"lemma_id": {
			"click": function(t, n){
				var sLemId = fn.getDataFromCellNode(n);
				fn.callDatabase("lemmata_and_paradigm_view", {"lemma_id": sLemId});
			}
		},
		"multiple_lemmata_analysis_id": {
			"click": function(t, n){
				var sMultiLemId = fn.getDataFromCellNode(n);
				fn.callDatabase("lemmata_and_paradigm_view", {"multiple_lemmata_analysis_id": sMultiLemId});
			}
		}
	},
	
	ticket_179_possible_doubled_lemmata: {
			
		"modern_lemma": {
			"click": function(t, nCell){
				var nRow = fn.getRowNode(nCell);
				sIds = fn.getDataFromCellInRowNode(nRow, "pids");
				fn.callDatabase("lemmata", {"persistent_id": sIds});
			}
		},
		"lemma_pos": {
			"click": function(t, nCell){
				var nRow = fn.getRowNode(nCell);
				sIds = fn.getDataFromCellInRowNode(nRow, "pids");
				fn.callDatabase("lemmata", {"persistent_id": sIds});
			}
		},
		"source_id": {
			//"nice_name": "src",
			"click": function(t, nCell){
				var nRow = fn.getRowNode(nCell);
				sIds = fn.getDataFromCellInRowNode(nRow, "pids");
				fn.callDatabase("lemmata", {"persistent_id": sIds});

			}
		},
		"lemma_ids": {
			"visible": false
		},
		"pids": {
			"visible": false
		},
		"opgelost": {
			"bgcolor": "#F8E0E6",
			"editable": true
		},
		"opmerking": {
			"editable": true
		},
		"id": {
			"visible": false
		}
	},
	
	lemmata_without_paradigm: {
			
		"quotation_section_id": {
			"bgcolor": "#F8E0E6",
			"click": function(t, nCell){
				var sQuoteId = fn.getDataFromCellNode(nCell);
				fn.callDatabase("token_attestations_worktable", 
					// OLD{"quotation_section_id": "\"exact:"+sQuoteId+"\""}
					{"attestation_location": "\"exact:"+sQuoteId+"\""}
					);
			}
		},
		"persistent_id": {
			
			"bgcolor": "#F8E0E6",
			"click": function(t, nCell){
				var sPid = fn.getDataFromCellNode(nCell);
				var sWdb = fn.getDataFromSiblingNode(nCell, "source_id");				
				
				if ( $.startsWith(sPid, "GH") ) {
					fn.callDatabase("lemmata_and_paradigm_view", {"persistent_id": "^"+sPid+"$"});
				}
				else {
					window.open("http://gtb.inl.nl/iWDB/search?actie=article&wdb="+sWdb+"&id="+sPid);	
				}
				
			}
		},
		"opmerking": {
			"bgcolor": "#F8E0E6",
			"editable": true
		},
		
		"short_pid": {
			"visible": false
		},
		
		"multiple_lemmata_analysis_id": {
			"width": "30px",
			"nice_name": "mla_id",
			"bgcolor": "#F8E0E6",
			"click": function(t, nCell){
				var sMultiLemId = fn.getDataFromCellNode(nCell);
				fn.callDatabase("multiple_lemmata_analysis_parts", {"multiple_lemmata_analysis_id": "\"exact:"+sMultiLemId+"\""});
			}
		},
		
	},
	
	possible_groups: {
		
		"klaar": {
			"editable": true
		},
		
		"attestation_ids": {
			"visible": false
		},
		"onsetoffset": {
			"visible": false
		},
		"wordforms_arr": {
			"visible": false
		},
		"wordform": {
			"visible": false
		},
		"true_count": {
			"visible": false
		},
		"lemma_id": {
			"visible": false
		},
		"multiple_lemmata_analysis_id": {
			"visible": false
		},
		"levenshtein_dist": {
			"visible": false
		},
		
		"opmerking": {
			"editable": true
		},
		
		"quotation_section_id": {
			"click": function(t, n){
				var qId = fn.getDataFromCellNode(n);
				fn.callDatabase("token_attestations_worktable", {"quotation_section_id": "\"exact:"+qId+"\""});
			}
		},
		
		"group_id": {
			
			"click": function(t, n){
				
				var rowId = fn.getDataFromSiblingNode(n, "id");
				
				fn.confirm("Let op", "Aan deze citaat zal nu een group_id worden toegekend. Weet u het zeker?", 
					function(){
						fn.showProcessingMsg(t);
						fn.closeDialog();
						fn.message("OK", "Bezig...");
						
						setTimeout(function(){
							
							fn.callFunction("public.assign_group_id", [rowId], function(){
								fn.refreshTable(t, function(){				
									
									setTimeout(function(){
										var nRow = fn.getRowNodeWhere(t, {"id": rowId});
										var iGroupId = fn.getDataFromCellInRowNode(nRow, "group_id");
										fn.closeDialog();
										fn.removeProcessingMsg(t);
										
										fn.callDatabase("token_attestations_worktable", {"group_id": iGroupId});
									}, 500);
																		
									});
								
								});
							
						}, 200);
						
						
					}, 
					function(){
						// do nothing
					});
			} // end of click
		}
		
	}, // end of possible_groups
	
	missing_mnw_quotes_in_hilex: {
		
		"eg_id": {
			
			"click": function(t, n){
				
				var sQuoteId = fn.getDataFromCellNode(n);
				var sLemId = sQuoteId.replace(/^(c)(\d+)(_)(\d+)$/, '$2');
				
				window.open("http://gtb.inl.nl/iWDB/search?actie=article&wdb=MNW&id="+sLemId+"&Citaat_id="+sQuoteId);					
				
				fn.callDatabase("lemmata_and_paradigm_view", {"persistent_id": "^"+sLemId+"$"}, function(){
					fn.callDatabase("token_attestations_worktable", {"quotation_section_id": "^"+sQuoteId+"$"});
				});
			}
			
		},
		
		"opmerking": {
			"editable": true
		}
	},
	
	mnw_lemma_parts_of_speech:{
		
		"id": {
			"visible": false
		},
		"mnw_lemma_pos": {
			"click": function(t,n){
				var sPos = fn.escapeRegexChars( fn.getDataFromCellNode(n) );
				fn.callDatabase("lemmata", {"lemma_pos": "^"+sPos+"$"});
			}
		},
		"correction_pos": {
			"editable": true
		}
	},
	
	mnw_wordforms_parts_of_speech:{
		
		"id": {
			"visible": false
		},
		"mnw_wordform_pos": {
			"click": function(t,n){
				var sPos = fn.escapeRegexChars( fn.getDataFromCellNode(n) );
				fn.callDatabase("lemmata_and_paradigm_view", {"wordform_pos": "^"+sPos+"$"});
			}
		},
		"correction_pos": {
			"editable": true
		}
	},
	
	double_quotations_id_to_check: {
		
		"quotation_section_id": {
			"click": function(t, n){
				
				var sVal = fn.getDataFromCellNode(n);
				fn.callDatabase("token_attestations_worktable", {"quotation_section_id": "exact:"+sVal});
			}
		},
		"verwerkt": {
			"editable": true
		}
	},
	
	ontbrekende_citaten: {
		
		"opmerking": {			
			"editable": true
		}
	},
	
	wordforms_to_diminutives: {
		
	},
	
	quotation_section_id_of_token_attestations_with_clitics: {
		
	},
	
	fishy_wordforms: {
		
	},
	
	marijke_spelling_giganthilex_differences: {
		
	}

};