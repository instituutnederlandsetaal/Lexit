


// list of tables that must be hidden
oHiddenTablesList = [];



oTableSettingsList = {
		
		celexiewerk: {
			"column_order": ["hidden_id",
			          "celexie_id",
			          "gb",
			          "rbn",
			          "lemma",
			          "lemma_reverse",
			          "analyse",
			          "correctie",
			          "celex_analyse",
			          "regel",
			          "regel_reverse",
			          "goed",
			          "opmerking",

			          ]
		},
		
//		molex_homonyms_2014:{
//			size: "90%",
//			column_order: ["lemma_id", "lemma", "gigant_tag", "opmerkingen", "gloss", "wordforms"]
//		},
		
		logf_hulk: {
			size: "70%"
		},
		
		lemmalijsthulkgbchn: {
			size: "70%",
			nice_name: "lemmalijst HulkGbCHN+"
		},
		
		
		jvk_lex_grouped:{
			"column_order": ["part_of_speech", "string_agg"]
		},
		
		gb_splitup_v3:{
			column_order: ["id", "gb05_id", "gb05_superid", "lem05", 
			               "volgnr05", "comment", "wrdcat05", "gigant_tag", "th-wrdcat05", 
			               "znwlid05", "th-znwlid05", "betek05", "th-betek05", 
			               "zook05", "th-zook05", "wordform_id", "orig_wordform", 
			               "orig_afbr", "wordform", "wordform_afbr", "th-wordform", 
			               "th-wordform_afbr", "phrasal_verb", 
			               "phrasal_form", "orig_gb_field", "element_nr",
			               "verkleinwoord"]
		},
		
		celexiewerk_regeloverzicht: {
			size: "50%"
			
		},
		
		voorbereiden: {
			
			"button_0":
				{
				"name": "Nieuwe regel",
				"click": function(confTable){
					var sLemmaAndPos = fn.prompt("Voeg waardes in", 
							["wrdcat", "znwlid", "comment", "gigant_tag"], 
							["-", "-", "-", "-"],
							function(confTable){
						
						var wrdcat = fn.getPromptUserInput("wrdcat");
						var znwlid = fn.getPromptUserInput("znwlid");
						var comment = fn.getPromptUserInput("comment");
						var gigant_tag = fn.getPromptUserInput("gigant_tag");
						fn.insertIntoDatabase("voorbereiden", 
								{
								"gb_wrdcat": wrdcat,
								"gb_znwlid": znwlid,
								"comment": comment,
								"gigant_tag": gigant_tag
								}, null, true);
						});
					
					}
				},
			"button_1":
				{
				"name": "Verdubbel",
				"click": function(confTable){
					
					var nNode = fn.getSelectedRowsFrom(confTable);
					nNode.each(function(){
						
						var wrdcat = fn.getDataFromCellInRowNode(confTable, this, "gb_wrdcat");
						var znwlid = fn.getDataFromCellInRowNode(confTable, this, "gb_znwlid");
						var comment = fn.getDataFromCellInRowNode(confTable, this, "comment");
						var gigant_tag = fn.getDataFromCellInRowNode(confTable, this, "gigant_tag");
						
						fn.insertIntoDatabase("voorbereiden", 
								{
								"gb_wrdcat": wrdcat,
								"gb_znwlid": znwlid,
								"comment": comment,
								"gigant_tag": gigant_tag
								}, null, true);
						});					
					
					}
				},
				
			"button_2":
				{
				
				"name": "Verwijder",
				"click": function(confTable){
					
					var answer = confirm("Weet u het zeker?");
					if (answer)
						{		
						var nNode = fn.getSelectedRowsFrom(confTable);
						nNode.each(function(){
							
							var id = fn.getDataFromCellInRowNode(confTable, this, "id");						
							fn.removeFromDatabaseGivenANode(confTable, this);
							});
						fn.refreshTable(confTable);
						}
					
					}
				}
		}
};


// container object for the configuration of each table
oTableConfigurationList = {
		
//		molex_homonyms_2014: {
//			"lemma_id": {
//				"visible": true,
//				"cell_tooltip": "Klik hier om GB te openen",
//				"click": function(t, n){					
//					var lemma = "^"+fn.getDataFromSiblingNode(t, n, "lemma")+"$";
//					
//					if ( !$("#newDiv_dynamic").elementExists() )
//						{
//						var sWindowsWidth = $(window).width();
//						$("#dynamic").append(
//								$("<div></div>")
//								.attr("id", "newDiv_dynamic")
//								.html("<iframe width='"+sWindowsWidth+"' height='1024' src='http://gtb.dev.inl.loc/lexit/?db=gigp_spelling&table=lemmata_view&modern_lemma="+lemma+"'></iframe>")
//								);
//						fn.pileupTables("molex_homonyms_2014", "newDiv");
//						$("#dynamic").find("#molex_homonyms_2014_dynamic table").focus();
//						}
//					else
//						{
//						var sWindowsWidth = $(window).width();;
//						$("#dynamic").find("#newDiv_dynamic:first").html("<iframe width='"+sWindowsWidth+"' height='1024' src='http://gtb.dev.inl.loc/lexit/?db=gigp_spelling&table=lemmata_view&modern_lemma="+lemma+"'></iframe>");
//						$("#dynamic").find("#molex_homonyms_2014_dynamic table").focus();
//						}
//					
//				}
//			},
//			"lemma": {
//				"editable": true,
//				"colsort": "asc"
//				
//			},
//			"gloss": {
//				"bgcolor": "#D8D8D8",
//				"editable": true
//			},
//			"opmerkingen": {				
//				"editable": true
//			}
//		},
		
		logf_hulk: {
			"bron": {
				"colsort": "desc"
			},
			"freq_logf": {
				"colsort": "desc"
			},
			"freq_chn": {
				"colsort": "desc"
			}
			
		},
		
		lemmalijsthulkgbchn: {
			"freq_chn": {
				"colsort": "desc"
			}
		},
		
		
		conversie_gb_naar_gigant: {
			gigant_tag:{
				"editable": true
			}
		},
		
		
		gb_splitup_v3: {
			
			// this column is meant for wordforms from which the lemma should change (for KatrienD)
			verkleinwoord: {
				"editable": true
			}		
			
		},
		
		gb_splitup_v3_empty_giganttag:{
			gigant_tag:{
				"editable": true
			},
			id: {
				"click": function(t, n){
					var wrdcat = "^"+fn.getDataFromCellNamed(t, n, "wrdcat05");
					var znwlid = "^"+escapeRegexChars(fn.getDataFromCellNamed(t, n, "znwlid05"))+"$";
					var comment = "^"+fn.getDataFromCellNamed(t, n, "comment");
					fn.callDatabase("gb_splitup_v3", 
							{wrdcat05: wrdcat, znwlid05: znwlid, comment: comment});
				}
			},
			wrdcat05: {
				"click": function(t, n){
					var wrdcat = "^"+fn.getDataFromCellNamed(t, n, "wrdcat05");
					var znwlid = "^"+escapeRegexChars(fn.getDataFromCellNamed(t, n, "znwlid05"))+"$";
					var comment = "^"+fn.getDataFromCellNamed(t, n, "comment");
					fn.callDatabase("gb_splitup_v3", 
							{wrdcat05: wrdcat, znwlid05: znwlid, comment: comment});
				}
			},
			znwlid05: {
				"click": function(t, n){
					var wrdcat = "^"+fn.getDataFromCellNamed(t, n, "wrdcat05");
					var znwlid = "^"+escapeRegexChars(fn.getDataFromCellNamed(t, n, "znwlid05"))+"$";
					var comment = "^"+fn.getDataFromCellNamed(t, n, "comment");
					fn.callDatabase("gb_splitup_v3", 
							{wrdcat05: wrdcat, znwlid05: znwlid, comment: comment});
				}
			},
			comment: {
				"click": function(t, n){
					var wrdcat = "^"+fn.getDataFromCellNamed(t, n, "wrdcat05");
					var znwlid = "^"+escapeRegexChars(fn.getDataFromCellNamed(t, n, "znwlid05"))+"$";
					var comment = "^"+fn.getDataFromCellNamed(t, n, "comment");
					fn.callDatabase("gb_splitup_v3", 
							{wrdcat05: wrdcat, znwlid05: znwlid, comment: comment});
				}
			}
		},
		
		gb_splitup_v3_gbtag_to_giganttag:{
			
			wrdcat05: {
				"click": function(t, n){
					var wrdcat = "^"+fn.getDataFromCellNamed(t, n, "wrdcat05");
					var znwlid = "^"+escapeRegexChars(fn.getDataFromCellNamed(t, n, "znwlid05"))+"$";					
					var comment = "^"+fn.getDataFromCellNamed(t, n, "comment");
					var gigtag = "^"+escapeRegexChars(fn.getDataFromCellNamed(t, n, "gigant_tag"))+"$";
					if (gigtag=='^$') gigtag = null;
					fn.callDatabase("gb_splitup_v3", 
							{wrdcat05: wrdcat, znwlid05: znwlid, comment: comment, gigant_tag: gigtag});
				}
			},
			znwlid05: {
				"click": function(t, n){
					var wrdcat = "^"+fn.getDataFromCellNamed(t, n, "wrdcat05");
					var znwlid = "^"+escapeRegexChars(fn.getDataFromCellNamed(t, n, "znwlid05"))+"$";
					var comment = "^"+fn.getDataFromCellNamed(t, n, "comment");
					var gigtag = "^"+escapeRegexChars(fn.getDataFromCellNamed(t, n, "gigant_tag"))+"$";
					if (gigtag=='^$') gigtag = null;
					fn.callDatabase("gb_splitup_v3", 
							{wrdcat05: wrdcat, znwlid05: znwlid, comment: comment, gigant_tag: gigtag});
				}
			},
			comment: {
				"click": function(t, n){
					var wrdcat = "^"+fn.getDataFromCellNamed(t, n, "wrdcat05");
					var znwlid = "^"+escapeRegexChars(fn.getDataFromCellNamed(t, n, "znwlid05"))+"$";
					var comment = "^"+fn.getDataFromCellNamed(t, n, "comment");
					var gigtag = "^"+escapeRegexChars(fn.getDataFromCellNamed(t, n, "gigant_tag"))+"$";
					if (gigtag=='^$') gigtag = null;
					fn.callDatabase("gb_splitup_v3", 
							{wrdcat05: wrdcat, znwlid05: znwlid, comment: comment, gigant_tag: gigtag});
				}
			},
			gigant_tag: {
				"click": function(t, n){
					var wrdcat = "^"+fn.getDataFromCellNamed(t, n, "wrdcat05");
					var znwlid = "^"+escapeRegexChars(fn.getDataFromCellNamed(t, n, "znwlid05"))+"$";
					var comment = "^"+fn.getDataFromCellNamed(t, n, "comment");
					var gigtag = "^"+escapeRegexChars(fn.getDataFromCellNamed(t, n, "gigant_tag"))+"$";
					if (gigtag=='^$') gigtag = null;
					fn.callDatabase("gb_splitup_v3", 
							{wrdcat05: wrdcat, znwlid05: znwlid, comment: comment, gigant_tag: gigtag});
				}
			}
			
		},
		
		celexiewerk_regeloverzicht: {
			
			regel: {
				"click": function(someTable, nNode){
					
					var regel = "^"+fn.getDataFromCellNode(someTable, nNode)+"$";
					regel = regel.replace(/\+/g, "\\+");
					regel = regel.replace("=", ".");
					fn.callDatabaseInNewTab("celexiewerk", {regel: regel, rbn: "."});
				}
			}
			
		},
		
		celexiewerk: {
			
			hidden_id: {
				"visible": false
			},
			celexie_id: {
				"visible": false
			},
			gb: {
				"cell_tooltip": "Open Groen Boekje",
				"click": function(someTable, nNode){
					var gbId = fn.getDataFromCellNode(someTable, nNode);
					fn.callDatabaseInNewTab("GB05_2013", {id: gbId}, {viewtype: "form"}, "lexicalsources");
				}
			},
			rbn: {
				"cell_tooltip": "Open RBN20",
				"click": function(someTable, nNode){
					var rbnId = fn.getDataFromCellNode(someTable, nNode);
					var aRbnId = rbnId.split("_");
					var tableName = "rbn20_"+aRbnId[0];
					var word = aRbnId[1];
					fn.callDatabaseInNewTab(tableName, {id_form: word}, {viewtype: "form"}, "lexicalsources");
				}
			},
			lemma: {
				"colsort": "asc",
				"editable": false
			},
			lemma_reverse: {
				"visible": false
			},
			analyse: {
				"editable": false,
				"cell_tooltip": "Klik om dit te kopiëren naar de correctie-kolom",
				"click": function(t, n){
					
					if (kf.isPressed("ctrl"))
						{
						var inhoud = fn.getDataFromCellNode(t, n);
						fn.updateDatabaseGivenANode(t, fn.getRowNode(n), 
								["correctie"], [inhoud], 
								false, function(){fn.refreshTable(t);});
						//fn.putDataIntoCell(t, fn.getRowNode(n), "correctie", inhoud);
						}		
					
				}
			},
			correctie: {
				"bgcolor": "#F8E0EC",
				"editable": true
			},
			celex_analyse: {
				"editable": false
			},
			regel: {
				"editable": false
			},
			regel_reverse: {
				"visible": false
			},
			goed: {
				"editable": true
			},
			opmerking: {
				"editable": true
			}
		},
		
		jvk_ambigu: {
			lemma: {"colsort": "asc"},
			janee: {"editable": true},
			comment: {"editable": true}
		},
		gb_ambigu: {
			lem05: {"colsort": "asc"},
			janee: {"editable": true},
			comment: {"editable": true}
		},
		
		
		voorbereiden: {
			
			gb_wrdcat: {"editable": true},
			gb_znwlid: {"editable": true},
			comment: {"editable": true},
			gigant_tag: {"editable": true},
			extra_info: {"editable": true}
		},
		
		
		molex: {
			"id": {"visible": false},
			"lemma_id": {"editable": false},
			"lemma": {"editable": false, "colsort": "asc"},
			"wordform": {"editable": false},
			"jvk_lex_tag": {"visible": false}
			
		},

		werktabel:{
			"copy": {
				"button": "Tag overnemen",
				"click": function(t, n){
					var value = fn.getDataFromSiblingNode(t, n, "gigant_tag");
					fn.updateDatabaseGivenANode(t, n, ["gigant_tag_correctie"], [value], true);
				}
			},
			
			"jvk_lex_tag": {
				"cell_tooltip": "Klik hier om de groepen te zien met deze tag",
				"click": function(t,n){
					var tag = fn.getDataFromCellNode(t, n);
					fn.callDatabase("jvk_lex_werktabel", {"jvklex_tag": escapeRegexChars(tag)});
				}
			},
			"gigant_tag": {
				"cell_tooltip": "Klik hier om de groepen te zien met deze tag",
				"click": function(t,n){
					var tag = fn.getDataFromCellNode(t, n);
					fn.callDatabase("jvk_lex_werktabel", {"gigant_tag": escapeRegexChars(tag)});
				}
			},
			
			"lemma_id": {
				"visible": false
			},
			"id": {
				"visible": false,
				"colsort": "asc"
			},
			"gigant_tag_correctie":{
				"editable": true
			},
			"opmerkingen":{
				"editable": true
			}
		},
		
		jvk_lex_werktabel:{
			"copy": {
				"button": "Tag overnemen",
				"click": function(t, n){
					var value = fn.getDataFromSiblingNode(t, n, "gigant_tag");
					fn.updateDatabaseGivenANode(t, n, ["gigant_tag_correctie"], [value], true);
				}
			},
			"jvklex_tag": {
				"cell_tooltip": "Klik hier om de woorden te zien met deze tag",
				"click": function(t,n){
					var tag = fn.getDataFromCellNode(t, n);
					fn.callDatabase("werktabel", {"jvk_lex_tag": escapeRegexChars(tag)});
				}
			},
			"gigant_tag": {
				"cell_tooltip": "Klik hier om de woorden te zien met deze tag",
				"click": function(t,n){
					var tag = fn.getDataFromCellNode(t, n);
					fn.callDatabase("werktabel", {"gigant_tag": escapeRegexChars(tag)});
				}
			},
			"id": {
				"visible": false,
				"colsort": "asc"
			},
			"gigant_tag_correctie":{
				"editable": true
			},
			"opmerkingen":{
				"editable": true
			},
			"datawerk":{
				//"filter": ".+",
				//"keepfilter": true,
				"editable": true
			}
		}
		
};

function escapeRegexChars(str){
	var specials = new RegExp("[.*+?|()\\[\\]{}\\\\]", "g"); // .*+?|()[]{}\
	return str.replace(specials, "\\$&");
};