// list of tables that must be hidden or visible (don't use both, it's a matter of what's the most convenient)
oHiddenTablesList = [];
oShowOnlyTables = (
					fn.getCurrentUser() == 'marjolijn' 
					) 
	?
		["collocations_to_link", "related_lemmata", "int_requests", "lemmata", "modified_lemmata_view", "modified_paradigm_view", 
         "lemmata_en_paradigma_view", "nuancerende_opmerkingen", "subsets", "werkwoord_features"]
	:
		
		["uitspraak", "collocations_to_link", "related_lemmata", "int_requests", "lemmata", "modified_lemmata_view", "modified_paradigm_view", "lemmata_en_paradigma_view",
			 "surinaams_and_antilliaans_commissions_selections", "parents", "commission_report",
			 "export_versions", "nuancerende_opmerkingen", "anw_online", "subsets", "werkwoord_features", "nieuwe_lemmata_door_derden",
			"distinct_lemma_gigpos", "distinct_wordform_gigpos", "external_links", "banstaltigheden", "morphological_view", 
			"sources_view", "verledentijd_op_de_en_ook_op_te", "los_vast", "meervouden_van_woorden_op_e",  "meervouden_van_um", "spatielemmata", "parents_children_pos_mismatch",
			"banlijst_doubles"];

var exportBase = "http://pcob67.inl.loc:8080/SpellingExport/SpellingExport?action=HTML&subset=";

//remember chosen brother lemma
var sBrotherLemmaId = null;

// should the paradigm be shown in readable mode (= split up into parts)
var bReadableParadigmMode = false;


// links APIs

// API for getting all links at once (and preferably also only once!)
// for 'woordcombinatie'
var sCombiApiURL = "http://combi-api.ivdnt.loc";
// for ANW
var sAnwApiURL = "http://anw-api.ivdnt.loc";

// API for incremental links update
// and checks-on-the-fly
var sLinksToMolexApiURL = "http://links-to-molex.ivdnt.loc";

//************************************************************************

// get libraries

fn.getLibrary();

fn.getLibrary("https://cdn.jsdelivr.net/npm/mousetrap@1.6.5/mousetrap.min.js", function(){
	(function(a){var c={},d=a.prototype.stopCallback;a.prototype.stopCallback=function(e,b,a,f){return this.paused?!0:c[a]||c[f]?!1:d.call(this,e,b,a)};a.prototype.bindGlobal=function(a,b,d){this.bind(a,b,d);if(a instanceof Array)for(b=0;b<a.length;b++)c[a[b]]=!0;else c[a]=!0};a.init()})(Mousetrap);
	Mousetrap.prototype.stopCallback = function (){return false;} //https://stackoverflow.com/questions/21013866/mousetrap-bind-is-not-working-when-field-is-in-focus
});


// class to prevent taaladvies to be broken
fn.addCss(".nobreak {white-space: nowrap;}");

fn.setProjectFont("Verdana, sans-serif, gtb", "10pt");


//************************************************************************

var aAvailableTags = [];

function readAvailableTags(){

	var url = WEBSERV_URL+"/api/get_unique_values";
	$.ajax( {
		"type": "GET",
		"async": false, // needed to block code execution while awaiting the server response
		"url": url,
		"data": {
			"db_name": getHttpParams().get("db"),
			"table_name": "lemmata",
			"column_name": "tags",
			"dummy": getUniqueNumber()
			},
		"dataType": "xml", // get response as xml
		"success": function(xml) {		

			var aUniqueTags = td._getUniqueValues(xml);
			aAvailableTags = new Array();

			// remove empty values from array
			if (aUniqueTags.indexOf("^$")>=0)
				aUniqueTags.splice(aUniqueTags.indexOf("^$"), 1);

			for (var i=0; i<aUniqueTags.length; i++){

				// push multiple values as single values
				if (aUniqueTags[i].indexOf("; ")>=0){

					var mulitpleTags = (aUniqueTags[i]).split("; ");
					aAvailableTags.push(...mulitpleTags);
				}
				// push single value
				else {
					aAvailableTags.push(aUniqueTags[i]);
				}

			}

			aAvailableTags = getOnlyUniqueValues(aAvailableTags);
			aAvailableTags.sort();

			},
		"error": function(jqXHR, textStatus, errorThrown){
			fn.message("Fout in readAvailableTags()", "Er is een fout opgetreden op het inlezen van de beschikbare tags: "+
				textStatus+" "+errorThrown);
			}
		} );

};

readAvailableTags();


// ==============================================================================
// april 1 module
var oneAprilTestDate = new Date();
var oneAprilMonth = oneAprilTestDate.getUTCMonth() + 1; //months from 1-12
var oneAprilDay = oneAprilTestDate.getUTCDate();
var oneAprilYear = oneAprilTestDate.getUTCFullYear();

var bAprilTest = false;

var aListOfAprilMessages = [
	"Vandaag is het voor alle vliegende insecten verboden om langer dan 1 uur rond te vliegen.<BR><BR>Bent u het eens met deze maatregel?",
	"Dank voor uw bestelling! Uw BigMac wordt over enkele minuten bezorgd.<BR><BR>Wilt u er ook frietjes bij?",
	"Lex'it houdt heel erg van zingen. Dat is goed voor het humeur!<BR><BR>Wilt u zelf het liedje kiezen?",
	"Lex'it heeft geprobeerd vast te lopen, maar het is niet gelukt.<BR><BR>Wilt u dat Lex'it dit nu nog eens probeert?",
	"Om de werkzaamheden wat leuker te maken, wil Lex'it nu de database door elkaar schudden.<BR><BR>Bent u klaar om het schudden op te starten?",
	"Vandaag zijn aan het gebruik van Lex'it helaas kosten verbonden.<BR><BR>Betaalt u liever contant of via telebankieren?"
];

var iWait10Minutes = bAprilTest ? 0 : 10 * 60 * 1000; // 10 min x 60 sec x 1000 millisec

var iChosenAprilMessage = Math.floor( Math.random() * aListOfAprilMessages.length );

if (bAprilTest || (oneAprilDay == 1 && oneAprilMonth ==4)) {
	setTimeout(function(){
		fn.confirm("LET OP", aListOfAprilMessages[ iChosenAprilMessage ], 
		function(){
			window.open("https://nl.wikipedia.org/wiki/1_april");
		},
		function(){
			window.open("https://nl.wikipedia.org/wiki/1_april");
		});
	}, iWait10Minutes);
}
// ==============================================================================


//************************************************************************

//function returns true if current user is a superuser

function superUser(){
	return (fn.getCurrentUser() == 'katrien' || 
			fn.getCurrentUser() == 'thomas' ||
			fn.getCurrentUser() == 'boukje' ||
			fn.getCurrentUser() == 'katrienvp' ||
			fn.getCurrentUser() == 'mathieu' ||
			fn.getCurrentUser() == 'jesse');
};

//************************************************************************



// Autocomplete configuration

// see: http://stackoverflow.com/questions/5077409/what-does-autocomplete-request-server-response-look-like
// http://stackoverflow.com/questions/18677536/jeditable-and-jquery-ui-autocomplete
var sAutoCompleteSelector = "#lemmata .nuanc_opm";

var sAutoCompleteSelector2 = "#lemmata .lemma_gigpos, #prompt_lemma_gigpos";

var sAutoCompleteSelector3 = "#prompt_wordform_gigpos";

var sAutoCompleteSelector4 = "#prompt_tiklemmain";

$(document).on(
      "focus", 
      sAutoCompleteSelector, 
      function(event) {
      	
      	$(event.target).autocomplete({
          	
      		delay: 750,
            minLength: 2,
	        source: function(request, response){
	            	
	           	fn.callFunction("api.get_nuance_opm", [ fn.quote( request.term ) ], 
	          		function(func_resp){  
	            		
	            		var aSuggestionsArr = 
	            			(func_resp["get_nuance_opm"]).split("|");
	            		
	            		response($.map(aSuggestionsArr, function (item) {
	                        return {
	                            label: item.split(":::")[0],
	                            value: item.split(":::")[1]
	                        };
	                    }));
					}
				);
			},
			open: function(event, ui){

				setTimeout(function(){
					$(event.target).putInFront();
				}, 100);

			}
		});
          
      }
  );

$(document).on(
	"focus", 
	sAutoCompleteSelector2, 
	function(event) {
	
		$(event.target).autocomplete({
			
			delay: 750,
			minLength: 2,
			source: function(request, response){
				
				fn.callFunction("api.get_lemma_gigpos", [ fn.quote( request.term ) ], 
						function(func_resp){  
					
					var aSuggestionsArr = 
						(func_resp["get_lemma_gigpos"]).split("###");
					
					response($.map(aSuggestionsArr, function (item) {
						return {
							label: item.split(":::")[0],
							value: item.split(":::")[1]
						};
					}));
				});
			},
			open: function(event, ui){

				setTimeout(function(){
					$(event.target).putInFront();
				}, 100);

			}
		});
		
	}
);


$(document).on(
	      "focus", 
	      sAutoCompleteSelector3, 
	      function(event) {
	      	
	      	$(event.target).autocomplete({
	          	
	      		delay: 750,
				minLength: 2,
				source: function(request, response){
					
					fn.callFunction("api.get_wordform_gigpos", [ fn.quote( request.term ) ], 
							function(func_resp){  
						
						var aSuggestionsArr = 
							(func_resp["get_wordform_gigpos"]).split("###");
						
						response($.map(aSuggestionsArr, function (item) {
							return {
								label: item.split(":::")[0],
								value: item.split(":::")[1]
							};
						}));
					});
				},
				open: function(event, ui){

					setTimeout(function(){
						$(event.target).putInFront();
					}, 100);
				}
	          });
	          
	      }
);


fn.setAutoComplete("lemmata_en_paradigma_view", "wordform_gigpos", false, "api.get_wordform_gigpos", "###", ":::", 1, 200);


$(document).on(
	      "focus", 
	      sAutoCompleteSelector4, 
	      function(event) {
	      	
	      	$(event.target).autocomplete({
	          	
	      		delay: 750,
				minLength: 2,
				source: function(request, response){
					
					fn.callFunction("api.search_for_lemma_stringonly", [ fn.quote( request.term ) ], 
							function(func_resp){  
						
						var aSuggestionsArr = 
							(func_resp["search_for_lemma_stringonly"]).split("^^^");
						
						response($.map(aSuggestionsArr, function (item) {
							return {
								label: item,
								value: item
							};
						}));
					});
				},
				open: function(event, ui){

					setTimeout(function(){
						$(event.target).putInFront();
					}, 100);
				}
	          });
	          
	      }
);





//************************************************************************
// Uitspraak config

var oUitspraakContextMenu = {
	"items": {
		"to_fonet1": {"name": "Kopieer naar <b>fonet1</b>", "isHtmlName": true},
		"to_fonet2": {"name": "Kopieer naar <b>fonet2</b>", "isHtmlName": true},
		"to_fonet3": {"name": "Kopieer naar <b>fonet3</b>", "isHtmlName": true},
		"to_fonet4": {"name": "Kopieer naar <b>fonet4</b>", "isHtmlName": true},
		"to_fonet5": {"name": "Kopieer naar <b>fonet5</b>", "isHtmlName": true},
		"to_fonet6": {"name": "Kopieer naar <b>fonet6</b>", "isHtmlName": true},
		"to_fonet7": {"name": "Kopieer naar <b>fonet7</b>", "isHtmlName": true},
		"to_fonet8": {"name": "Kopieer naar <b>fonet8</b>", "isHtmlName": true},
		"to_fonet9": {"name": "Kopieer naar <b>fonet9</b>", "isHtmlName": true},
		"to_fonet10": {"name": "Kopieer naar <b>fonet10</b>", "isHtmlName": true},
		"to_fonetNL1": {"name": "Kopieer naar <b>fonetNL1</b>", "isHtmlName": true},
		"to_fonetNL2": {"name": "Kopieer naar <b>fonetNL2</b>", "isHtmlName": true},
		"to_fonetNL3": {"name": "Kopieer naar <b>fonetNL3</b>", "isHtmlName": true},
		"to_fonetNL4": {"name": "Kopieer naar <b>fonetNL4</b>", "isHtmlName": true},
		"to_fonetNL5": {"name": "Kopieer naar <b>fonetNL5</b>", "isHtmlName": true},
		"to_fonetNL6": {"name": "Kopieer naar <b>fonetNL6</b>", "isHtmlName": true},
		"to_fonetNL7": {"name": "Kopieer naar <b>fonetNL7</b>", "isHtmlName": true},
		"to_fonetNL8": {"name": "Kopieer naar <b>fonetNL8</b>", "isHtmlName": true},
		"to_fonetNL9": {"name": "Kopieer naar <b>fonetNL9</b>", "isHtmlName": true},
		"to_fonetNL10": {"name": "Kopieer naar <b>fonetNL10</b>", "isHtmlName": true},
		"to_fonetB1": {"name": "Kopieer naar <b>fonetB1</b>", "isHtmlName": true},
		"to_fonetB2": {"name": "Kopieer naar <b>fonetB2</b>", "isHtmlName": true},
		"to_fonetB3": {"name": "Kopieer naar <b>fonetB3</b>", "isHtmlName": true},
		"to_fonetB4": {"name": "Kopieer naar <b>fonetB4</b>", "isHtmlName": true},
		"to_fonetB5": {"name": "Kopieer naar <b>fonetB5</b>", "isHtmlName": true},
		"to_fonetB6": {"name": "Kopieer naar <b>fonetB6</b>", "isHtmlName": true},
		"to_fonetB7": {"name": "Kopieer naar <b>fonetB7</b>", "isHtmlName": true},
		"to_fonetB8": {"name": "Kopieer naar <b>fonetB8</b>", "isHtmlName": true},
		"to_fonetB9": {"name": "Kopieer naar <b>fonetB9</b>", "isHtmlName": true},
		"to_fonetB10": {"name": "Kopieer naar <b>fonetB10</b>", "isHtmlName": true}
	},
	// callback function called after the user has chosen an option in the context menu
	"callback": function(t, n, key, options) {

		console.log("key: "+key);
		var nRow = fn.getRowNode(n);
		var sString = fn.getDataFromCellNode(n);
		var sDestination = (key.split("_"))[1];	
		var oColVal = {};
		oColVal[sDestination] = sString;
		setTimeout(function(){
			$(fn.getCellInRowNode(nRow, sDestination)).click() // trigger jeditable
			setTimeout(function(){
				$(':focus').val(sString); // pre-fill value for edition (if not edited, it will be removed on blur!)
				
			}, 100);
			
		}, 100);
	}
};



var aCharsSelectorContent = [];

// var fonetCallback = function(t, n, value){

// 	fn.refreshTable(t, function(){

// 		var aSpecialCharsInInput = (value.split("")).filter(function(ch){
// 			return !ch.match("^[ a-zA-Z]$"); //  \\|\\<\\>-\\.;:'\\[\\]\\*
// 		});

// 		var aNewCharts = aSpecialCharsInInput.filter(item => !aCharsSelectorContent.includes(item));

// 		// if the input contains chars unknown to chars selector
// 		// refresh it!
// 		if (aNewCharts.length>0){
			
// 			fn.callFunction("api.rebuild_char_selector", [], function(resp){
// 				if (fn.tableExists("karakterskiezer"))
// 					fn.refreshTable("karakterskiezer");
// 				else
// 					fn.callDatabase("karakterskiezer");
// 			});
// 		}
		
// 	});

	
// };

var fonetConfig1 = {
	
	"editable": true,
	"bgcolor": "#A9BCF5",
	"class": "nobreak",
	"contextmenu": oUitspraakContextMenu,
	"searchform": function(value){ 
		return value.replace(/g/g, "ɡ"); // automatically translate the generic 'g' into a phonetic 'g'
	},
	"editpreprocess": function(value){
		return value.replace(/g/g, "ɡ"); // automatically translate the generic 'g' into a phonetic 'g'
	}
};
var fonetConfig2 = {

	"visible": false,
	"editable": true,
	"bgcolor": "#A9BCF5",	
	"class": "nobreak",
	"contextmenu": oUitspraakContextMenu,
	"searchform": function(value){ 
		return value.replace(/g/g, "ɡ"); // automatically translate the generic 'g' into a phonetic 'g'
	},
	"editpreprocess": function(value){
		return value.replace(/g/g, "ɡ"); // automatically translate the generic 'g' into a phonetic 'g'
	}
};


var fonetConfigNL1 = {
	
	"editable": true,
	"bgcolor": "#F6E3CE",
	"class": "nobreak",
	"contextmenu": oUitspraakContextMenu,
	"searchform": function(value){ 
		return value.replace(/g/g, "ɡ"); // automatically translate the generic 'g' into a phonetic 'g'
	},
	"editpreprocess": function(value){
		return value.replace(/g/g, "ɡ"); // automatically translate the generic 'g' into a phonetic 'g'
	}
};
var fonetConfigNL2 = {

	"visible": false,
	"editable": true,
	"bgcolor": "#F6E3CE",
	"class": "nobreak",
	"contextmenu": oUitspraakContextMenu,
	"searchform": function(value){ 
		return value.replace(/g/g, "ɡ"); // automatically translate the generic 'g' into a phonetic 'g'
	},
	"editpreprocess": function(value){
		return value.replace(/g/g, "ɡ"); // automatically translate the generic 'g' into a phonetic 'g'
	}
};


var fonetConfigBE1 = {
	
	"editable": true,
	"bgcolor": "#F6CED8",
	"class": "nobreak",
	"contextmenu": oUitspraakContextMenu,
	"searchform": function(value){ 
		return value.replace(/g/g, "ɡ"); // automatically translate the generic 'g' into a phonetic 'g'
	},
	"editpreprocess": function(value){
		return value.replace(/g/g, "ɡ"); // automatically translate the generic 'g' into a phonetic 'g'
	}
};
var fonetConfigBE2 = {

	"visible": false,
	"editable": true,
	"bgcolor": "#F6CED8",
	"class": "nobreak",
	"contextmenu": oUitspraakContextMenu,
	"searchform": function(value){ 
		return value.replace(/g/g, "ɡ"); // automatically translate the generic 'g' into a phonetic 'g'
	},
	"editpreprocess": function(value){
		return value.replace(/g/g, "ɡ"); // automatically translate the generic 'g' into a phonetic 'g'
	}
};



//************************************************************************

function getTimeLeft(iStartTimeInMillisec, iLoaded, iToBeLoaded){

	var iCurrentTime = new Date().getTime();
	var iElapsedTime = iCurrentTime - iStartTimeInMillisec;

	var iTotalTime = iToBeLoaded * (iElapsedTime / iLoaded);
	var iRemainingTime = iTotalTime - iElapsedTime;

	var iMinutes = Math.floor((iRemainingTime % (1000 * 60 * 60)) / (1000 * 60));
	var iSeconds = Math.floor((iRemainingTime % (1000 * 60)) / 1000);
	var sRemainingTime = right("0"+iMinutes, 2)+":"+right("0"+iSeconds, 2);

	return (iRemainingTime > 0 ? sRemainingTime : "unknown");
}

// table general settings
oTableSettingsList = {

		morphological_view: {

			"columns_sorting": {"main_lemma": "asc", "morphological_analysis_id": "asc", "part_number": "asc"},

			"button_0": {
				"name": "Remove analysis",
				"click": function(t){

					fn.confirm("Let op", "De geselecteerde analyse zal worden verwijderd.<BR><BR>Weet u zeker dat u dit wilt?", 
						function(resp){

							var oRow = fx.getFirstSelectedRowFrom(t);
							if (oRow.count() != 1){
								fn.message("Let op", "Kies één (en slechts één) rij om een analyse te verwijderen!");
							}
							else {
								var sMorphAnalysisId = fx.getDataFromCellInRow(oRow, "morphological_analysis_id");
								fn.callFunction("api.remove_morphological_analysis", [sMorphAnalysisId], function(){
									fn.refreshTable(t);
								});
							}
							
						},
						function(err){
							fn.message("OK", "Operatie door gebruiker geannuleerd");

						}
					)
					
				}
			},

			"callback": function(t){

				var oRows = fx.getAllRows(t);
				var sPreviousMorphAnalysisId = null;
				oRows.every(function(){
					var oThisRow = this;
					var sThisMorphAnalysisId = fx.getDataFromCellInRow(oThisRow, "morphological_analysis_id");

					if (sPreviousMorphAnalysisId!= null && sThisMorphAnalysisId != sPreviousMorphAnalysisId){
						$( fx.getNode(oThisRow) ).find("td").css("border-top", "1px solid black")
					}
					// remember id for next round
					sPreviousMorphAnalysisId = sThisMorphAnalysisId;

				});
			},
			"repeat_callback": true

		},


		test_lemmata_for_katrien: {
			"width": "60%",

			"group": "Information",

			"columns_sorting": {"main_gigpos": "asc", "cnt": "desc"}
		},


		parents_children_pos_mismatch: {

			"group": "Information",

			"columns_sorting": {"parent_id": "asc"},

			"callback": function(t){
				// mark the border between pages

				var lastParentId = null;
		
				var aRows = fn.getAllRowNodes(t);
				
				$(aRows).each(function(i){
					var nRow = this;
					var parentId = fn.getDataFromCellInRowNode(nRow, "parent_id");

					if (i>0 && parentId != lastParentId ){
							$(nRow).find("td").css("border-top", "2px solid red");
					}
			
						lastParentId = parentId ;
					});

			},
			"repeat_callback": true
		},

		spatielemmata: {
			"group": "Playtime",
			"width": "80%"
		},
	
		verledentijd_op_de_en_ook_op_te: { "group" : "Information" },	
		los_vast: { "group" : "Information" },
		meervouden_van_um : { "group" : "Information" },	
       	meervouden_van_woorden_op_e: { "group" : "Information" },	
	   	sources_view: { "group" : "Information" },
	   
		banstaltigheden: {
            "group": "Uitdagingen"
        },

		uitspraak: {

			"button_0": {

				"name": "Toon karakterskiezer",
				"click": function(t){
					fn.callDatabase("karakterskiezer");
				}

			},
			
			"button_1": {
				
				"name": "Vind dubbelen",
				click: function(t){
					
					fn.showProcessingMsg(t);
					
					setTimeout(function(){
						
						fn.callFunction( "api.check_fonets", [], function(resp){
							
							fn.removeProcessingMsg(t);
							
							var output = resp["check_fonets"];
							
							output = "<div style='height: 300px; overflow-y:scroll;'><table>"+
								"<tr><td>lemma_id |</td><td>modern_lemma</td></tr>"+
								"<tr><td></td><td></td></tr>"+
								"<tr><td>" + 
								output.replace(/:::/g, "</td><td>").replace(/###/g, "</td></tr><tr><td>") + 
								"</td></tr>"+
								"</table></div>";
						
							fn.message("Gevonden dubbelen", output);
						});
						
					}, 100);
					
					
					
				}
			},

			"columns_sorting": {"modern_lemma": "asc", "lemma_id": "asc"},

			"columns_order": [
				"id",
				"lemma_id",
				"parent",
				"modern_lemma",
				"lemma_gigpos",
				"keurmerk",
				"online",
				"gloss",
				"homograaf",
				"beoordeeld",
				"fonet1",
				"fonet2",
				"fonet3",
				"fonet4",
				"fonet5",
				"fonet6",
				"fonet7",
				"fonet8",
				"fonet9",
				"fonet10",
				"fonetNL1",
				"fonetNL2",
				"fonetNL3",
				"fonetNL4",
				"fonetNL5",
				"fonetNL6",
				"fonetNL7",
				"fonetNL8",
				"fonetNL9",
				"fonetNL10",
				"fonetB1",
				"fonetB2",
				"fonetB3",
				"fonetB4",
				"fonetB5",
				"fonetB6",
				"fonetB7",
				"fonetB8",
				"fonetB9",
				"fonetB10",
				"opmerking",				
				"provenance"
			],

			"callback": function(t){
				if (!fn.tableExists("karakterskiezer")){
					fn.callDatabase("karakterskiezer");
				}
				setTimeout(function(){
					fn.pileupTables("uitspraak", "karakterskiezer");
				}, 100);
			},
			"repeat_callback": true
			
			
		},

		karakterskiezer: {

			"main_search": false,
			"reset_button": false,
			"columns_button": false,
			"viewtype_button": false,
			"refresh_button": false,
			"replace_button": false,
			"selection_button": false,
			"selection_button_active": false,
			"undo_button": false,
			"goto_button": false,
			"help_button": false,

			"size": "80%",

			"button_0": {

				"name": "Ververs karakterskiezer",
				"click": function(t){
					fn.message("Eén tel...", "Aan het verversen...");

					setTimeout(function(){
							fn.callFunction("api.rebuild_char_selector", [], function(resp){
							fn.closeDialog();
							setTimeout(function(){
								fn.refreshTable(t);
							}, 500);
							
						});
					}, 100);
					
				}
			},

			"callback": function(t){

				// get the list of all chars in the chars selector
				var aRows = fn.getAllRowNodes(t);
				if (aRows.length>0){
					var nRow = aRows[0];
					var aKeyBoard = 'qwertyuiopasdfghjklzxcvbnm'.split("");
					var aSpecialChars = (fn.getDataFromCellInRowNode(nRow, "karakterskiezer")).replace(/[ a-z0-9\?@&:]/g, '').split("");
					//console.log(aSpecialChars);

					aCharsSelectorContent = (fn.getDataFromCellInRowNode(nRow, "karakterskiezer")).split("");


					if ($("#shortcuts").elementExists())
						$("#shortcuts").remove();
					var shortcutsTable = $("<div></div>").attr("id", "shortcuts").css("background-color", "lightgrey").css("height", "100px").css("display", "flex").css("flex-direction", "column").css("flex-wrap", "wrap");
					$("#karakterskiezer_dynamic").append(shortcutsTable);

					var oneChar, sShortCut;
					for (var i=0; i<aSpecialChars.length; i++){
						oneChar = aSpecialChars[i];
						sShortCut = "shift+"+aKeyBoard[i];
						$("#shortcuts").append( $("<div></div>").html("&nbsp;&nbsp;&nbsp;&nbsp;"+oneChar+"&nbsp;&nbsp;&nbsp;shortcut:"+sShortCut+""));

						Mousetrap.bindGlobal("shift+"+aKeyBoard[i], function(e){

							e.preventDefault();

							// get the current cursor position (at which we will be inserting a char)
							var iCursorPos = e.target.selectionStart;

							// get the pressed key of the shortcut
							var sPressed = String.fromCharCode(e.which).toLowerCase();
							var iIndex = 'qwertyuiopasdfghjklzxcvbnm'.indexOf(sPressed);

							// get the phonetic chars corresponding to the shortcut
							var aSpecialChars = (fn.getDataFromCellInRowNode(nRow, "karakterskiezer")).replace(/[ a-z0-9\?@&:]/g, '').split("");														
							
							// get the focussed input
							var $focused = $(':focus');
							$focused.trigger($.Event("keypress", {which: (aSpecialChars[iIndex]).charCodeAt(0), keyCode: (aSpecialChars[iIndex]).charCodeAt(0)}));
							
							// insert the value at the cursor position
							var sBeforeCursor = $focused.val().substring(0, iCursorPos);
							var sAfterCursor = $focused.val().substring(iCursorPos);
							$focused.val( sBeforeCursor + aSpecialChars[iIndex] + sAfterCursor);

							// keep the cursor at the original position
							e.target.selectionStart = iCursorPos+1;
							e.target.selectionEnd = iCursorPos+1;

							return false;
						});
					}

					// ε̃
					// (karakter gekopieerd van https://e-ans.ivdnt.org/topics/pid/topic-16043935841609440)

					var char = "ε̃";
					$("#shortcuts").append( $("<div></div>").html("&nbsp;&nbsp;&nbsp;&nbsp;"+char+"&nbsp;&nbsp;&nbsp;shortcut:shift+2"));

					Mousetrap.bindGlobal("shift+2", function(e){ 

						e.preventDefault();

						// get the current cursor position (at which we will be inserting a char)
						var iCursorPos = e.target.selectionStart;

						// get the focussed input
						var char = "ε̃";
						var $focused = $(':focus');
						var value = char.charCodeAt(0);
						$focused.trigger($.Event("keypress", { which: value, keyCode: value }) );

						// insert the value at the cursor position
						var sBeforeCursor = $focused.val().substring(0, iCursorPos);
						var sAfterCursor = $focused.val().substring(iCursorPos);
						$focused.val( sBeforeCursor + char + sAfterCursor);

						// keep the cursor at the original position
						e.target.selectionStart = iCursorPos+1;
						e.target.selectionEnd = iCursorPos+1;

						return false;
					});

					// œ̃
					// (karakter gekopieerd van https://e-ans.ivdnt.org/topics/pid/topic-16043935841609440)

					var char = "œ̃";
					$("#shortcuts").append( $("<div></div>").html("&nbsp;&nbsp;&nbsp;&nbsp;"+char+"&nbsp;&nbsp;&nbsp;shortcut:shift+3"));

					Mousetrap.bindGlobal("shift+3", function(e){ 

						e.preventDefault();

						// get the current cursor position (at which we will be inserting a char)
						var iCursorPos = e.target.selectionStart;

						// get the focussed input
						var char = "œ̃";
						var $focused = $(':focus');
						var value = char.charCodeAt(0);
						$focused.trigger($.Event("keypress", { which: value, keyCode: value }) );

						// insert the value at the cursor position
						var sBeforeCursor = $focused.val().substring(0, iCursorPos);
						var sAfterCursor = $focused.val().substring(iCursorPos);
						$focused.val( sBeforeCursor + char + sAfterCursor);

						// keep the cursor at the original position
						e.target.selectionStart = iCursorPos+1;
						e.target.selectionEnd = iCursorPos+1;

						return false;
					});

					// ɑ͂
					// (karakter gekopieerd van https://e-ans.ivdnt.org/topics/pid/topic-16043935841609440)

					var char = "ɑ͂";
					$("#shortcuts").append( $("<div></div>").html("&nbsp;&nbsp;&nbsp;&nbsp;"+char+"&nbsp;&nbsp;&nbsp;shortcut:shift+5"));

					Mousetrap.bindGlobal("shift+5", function(e){ 

						e.preventDefault();

						// get the current cursor position (at which we will be inserting a char)
						var iCursorPos = e.target.selectionStart;

						// get the focussed input
						var char = "ɑ͂";
						var $focused = $(':focus');
						var value = char.charCodeAt(0);
						$focused.trigger($.Event("keypress", { which: value, keyCode: value }) );

						// insert the value at the cursor position
						var sBeforeCursor = $focused.val().substring(0, iCursorPos);
						var sAfterCursor = $focused.val().substring(iCursorPos);
						$focused.val( sBeforeCursor + char + sAfterCursor);

						// keep the cursor at the original position
						e.target.selectionStart = iCursorPos+1;
						e.target.selectionEnd = iCursorPos+1;

						return false;
					});

					// ɔ͂
					// (karakter gekopieerd van https://e-ans.ivdnt.org/topics/pid/topic-16043935841609440)

					var char = "ɔ͂";
					$("#shortcuts").append( $("<div></div>").html("&nbsp;&nbsp;&nbsp;&nbsp;"+char+"&nbsp;&nbsp;&nbsp;shortcut:shift+7"));

					Mousetrap.bindGlobal("shift+7", function(e){ 

						e.preventDefault();

						// get the current cursor position (at which we will be inserting a char)
						var iCursorPos = e.target.selectionStart;

						// get the focussed input
						var char = "ɔ͂";
						var $focused = $(':focus');
						var value = char.charCodeAt(0);
						$focused.trigger($.Event("keypress", { which: value, keyCode: value }) );

						// insert the value at the cursor position
						var sBeforeCursor = $focused.val().substring(0, iCursorPos);
						var sAfterCursor = $focused.val().substring(iCursorPos);
						$focused.val( sBeforeCursor + char + sAfterCursor);

						// keep the cursor at the original position
						e.target.selectionStart = iCursorPos+1;
						e.target.selectionEnd = iCursorPos+1;

						return false;
					});
					
				}
				
			},
			"repeat_callback": true


		},


		external_links: {

			"button_0": {

				"name": "Full refresh",
				"click": function(t, n){

					fn.confirm("Zeker weten?", "Alle hier geregistreerde links zullen worden gewist en vervolgens opnieuw geladen.<BR><BR>"+
						"Dit kan een paar tientallen minuten duren.<BR><BR>"+
						"Weet u zeker dat u verder wilt? (incrementeel verversen is veel sneller)", 
					function(){

						// Get the total number of rows:
						// We will use this number (as rough max value) to render a progress indicator
						var iToBeLoaded = 0;

						fn.callFunction("api.external_links_get_total", [], function(resp){

							iToBeLoaded = parseInt(resp["external_links_get_total"]);

						});

						fn.prompt(["Veiligheidscode", "Tik de veiligheidscode"], ["Code"], [""], function(resp){

							if (resp["Code"] == (new Date().getDate() + new Date().getHours())){ // code is day number (1-31) + hours (0-23)

								var iLoaded = 0;
								var iStep = 100;
								var iStartTime = new Date().getTime();

								fn.message("OK", "Eerst tabel leegmaken...");
								setTimeout(function(){
										
										fn.closeDialog();

										// truncate table before reloading
										//
										fn.callFunction("api.external_links_truncate", [], function(){


											var sStartParameters = "/dws/api/external-links/molex?limit="+iStep;

											// declare 1st function to run : for loading Combi links
											//         ===
											var fnCombiLoad = function(sParams){

												fn.callService(sCombiApiURL + sParams, [], "GET", "xml", function(xmlDoc){

													var s = new XMLSerializer();
													var newXmlStr = s.serializeToString(xmlDoc);
													newXmlStr = newXmlStr.regexReplaceAll("\<srcPid\>.+?\</srcPid\>", "")
																.regexReplaceAll("\<srcPidType\>.+?\</srcPidType\>", "")
																.regexReplaceAll("\<srcPidDescription\>.+?\</srcPidDescription\>", "")
																.regexReplaceAll("\<dstResource\>.+?\</dstResource\>", "")
																.regexReplaceAll("\<status\>.+?\</status\>", "");

													setTimeout(function(){

														iLoaded += iStep;
														fn.closeDialog();
														fn.message("Een ogenblik aub", "(1/5) Combi-links bijwerken...<BR><BR><BR>"+
															"<center>Loaded:"+iLoaded+"<BR>"+
															"<progress value=\""+(iLoaded>iToBeLoaded?iToBeLoaded:iLoaded)+"\" max=\""+iToBeLoaded+"\"></progress><BR><BR>"+
															"Remaining (estimated) time: "+getTimeLeft(iStartTime, iLoaded, iToBeLoaded)+
															"</center>");


														// parse the service response in the database, so as to add links to the list
														//
														fn.callFunction("api.external_links_process_xml", ['Combi', newXmlStr], function(funcResp){

															var sNewParams = funcResp["external_links_process_xml"];
															
															if (sNewParams != ''){
																fnCombiLoad(sNewParams.replace(/&amp;/g, '&'));
															}
															else {
																fn.closeDialog();

																// start next 'thread'
																fnAnwLoad(sStartParameters);
															}

														});

													}, 100);

												});
											};

											


											// declare 2nd function to run : for loading ANW links
											//         ===
											var fnAnwLoad = function(sParams){

												fn.callService(sAnwApiURL + sParams, [], "GET", "xml", function(xmlDoc){

													var s = new XMLSerializer();
													var newXmlStr = s.serializeToString(xmlDoc);
													newXmlStr = newXmlStr.regexReplaceAll("\<srcPid\>.+?\</srcPid\>", "")
																.regexReplaceAll("\<srcPidType\>.+?\</srcPidType\>", "")
																.regexReplaceAll("\<srcPidDescription\>.+?\</srcPidDescription\>", "")
																.regexReplaceAll("\<dstResource\>.+?\</dstResource\>", "")
																.regexReplaceAll("\<status\>.+?\</status\>", "");

													setTimeout(function(){

														iLoaded += iStep;
														fn.closeDialog();
														fn.message("Een ogenblik aub", "(2/5) ANW-links bijwerken...<BR><BR><BR>"+
															"<center>Loaded:"+iLoaded+"<BR>"+
															"<progress value=\""+(iLoaded>iToBeLoaded?iToBeLoaded:iLoaded)+"\" max=\""+iToBeLoaded+"\"></progress><BR><BR>"+
															"Remaining (estimated) time: "+getTimeLeft(iStartTime, iLoaded, iToBeLoaded)+
															"</center>");

														// parse the service response in the database, so as to add links to the list
														//
														fn.callFunction("api.external_links_process_xml", ['ANW', newXmlStr], function(funcResp){

															var sNewParams = funcResp["external_links_process_xml"];
															
															if (sNewParams != ''){
																fnAnwLoad(sNewParams.replace(/&amp;/g, '&'));
															}
															else {
																
																fnAddAndCleanUpLemmata();
															}

														});

													}, 100);
													

												});
												
											};


											// declare 3rd function to run : for updating and cleaning up lemmata list 
											//         ===
											var fnAddAndCleanUpLemmata = function(){

												fn.closeDialog();
												fn.message("Een ogenblik aub", "(3/5) Molex lemmatalijst bijwerken...");

												setTimeout(function(){
												
													// add new standholders for new not-yet-linked lemmata
													// and remove unnecessary standholders for lemmata that are now linked
													//       
													fn.callFunction("api.external_links_add_missing_lemmata", [], function(){

														// add RBN

														fn.closeDialog();
														fn.message("Een ogenblik aub", "(4/5) RBN/Vertaalwoordenschat-links bijwerken...");

														setTimeout(function(){
															fn.callFunction("api.external_links_load_rbn", [], function(){

																// add Banlijst

																fn.closeDialog();
																fn.message("Een ogenblik aub", "(5/5) Banlijst toevoegen...");

																setTimeout(function(){
																	fn.callFunction("api.external_links_load_banlijst", [], function(){

																		// we are finished:
																		// as a final step, register the refresh date
																		// 
																		fn.closeDialog();
																		fn.message("Een ogenblik aub", "Afronden...");

																		setTimeout(function(){

																			fn.callFunction("api.external_links_update_has_el", [], function(){

																				var sLastRefreshDate = fn.getCurrentTimestamp("YYYY-MM-DD HH:MI");
																				fn.callFunction("api.external_links_set_full_refresh_date", [sLastRefreshDate], function(){

																						fn.closeDialog();
																						fn.refreshTable(t, function(){																							
																							fn.setCustomButtonName(t, 0, "Full refresh [last:"+sLastRefreshDate+"]");
																						});

																				});
																					
																				
																			});

																		}, 100);
																		
																	});

																}, 100);

															});

														}, 100);

													});

												}, 100);

											};
											

											// Start loading!!!

											setTimeout(function(){
												
												// this will call the other functions, nested in each other!
												fnCombiLoad(sStartParameters);

											}, 100);

										});

								}, 100);

								

							}
							else {
								fn.message("OK", "Helaas pindakaas");
							}

						});

					},
					function(){
						fn.message("OK", "Operatie door gebruiker geannuleerd.")
					}); // end of confirm

				}

			},

			"button_1": {

				"name": "Incremental refresh",
				"bgcolor": "red",
				"click": function(t, n){


					setTimeout(function(){

							// Get the number of days since the previous incremental refresh
							//
							fn.callFunction("api.get_number_of_day_since_previous_incremental_refresh", [fn.getCurrentTimestamp("YYYY-MM-DD HH:MI")], function(daysResp){

								var iLastEdit = parseInt(daysResp["get_number_of_day_since_previous_incremental_refresh"]) + 1;

								fn.closeDialog();
								fn.message("Een ogenblik aub", "(1/3) ANW/Combi-links van afgelopen "+
									(iLastEdit>1 ? iLastEdit+" dagen" : "dag")+" bijwerken...");

								// Part 1/3 of the incremental refresh:
								// -----------------------------------

								// get the new links since the last update
								// and insert those in the external links table
								//
								// (since this incremental, NO deletion in the Combi/ANW update!)

								fn.callService(sLinksToMolexApiURL + "/links", {"lastedit": iLastEdit}, "GET", "json", function(jsonDoc){

									var aLinks = jsonDoc["links"];	


									// now we have all the new links, process them all!

									var fnProcessJson = function(oOneLink){

										var errorMsg = oOneLink["ERROR"];

										if (errorMsg == null){
											// process the link
											var sSrcResource = oOneLink["srcResource"];
											sSrcResource = (sSrcResource.toLowerCase() != 'anw' ? sSrcResource.charAt(0).toUpperCase() + sSrcResource.slice(1).toLowerCase() : sSrcResource.toUpperCase()); // capital first letter
											var sArticleLemma = oOneLink["articleLemma"];
											var sArticlePid = oOneLink["articlePid"];
											var sDstId = oOneLink["dstId"];

											// insert the link
											fn.callFunction("api.external_links_update", [sSrcResource, sArticleLemma, sArticlePid, sDstId]);
										}
										else {
											fn.message("Error", errorMsg);
											setTimeout(function(){
												// do nothing
											},
											5000);
										}
									};

									// loop the previous function till we're done!
									while ( (oOneLink = aLinks.shift()) != null){
										fnProcessJson(oOneLink);
									}



									// Part 2/3 of the incremental refresh:
									// -----------------------------------
									//
									// add RBN
									// (this update is not incremental: we delete all the links, and copy all the data [-]including possibly new data] from the RBN schema)

									fn.closeDialog();
									fn.message("Een ogenblik aub", "(2/3) RBN/Vertaalwoordenschat-links bijwerken...");

									setTimeout(function(){
										fn.callFunction("api.external_links_load_rbn", [], function(){

											fn.closeDialog();
											fn.message("Een ogenblik aub", "(3/3) Molex lemmatalijst bijwerken...");


											// Part 3/3: fill the gaps: 
											//
											// add new standholders for new not-yet-linked lemmata
											// and remove unnecessary standholders for lemmata that are now linked
											//
											fn.callFunction("api.external_links_add_missing_lemmata", [], function(){

												fn.closeDialog();
												fn.message("Een ogenblik aub", "Afronden...");

												setTimeout(function(){

													fn.callFunction("api.external_links_update_has_el", [], function(){

														var sNewIncrementalDate = fn.getCurrentTimestamp("YYYY-MM-DD HH:MI");
														fn.callFunction("api.external_links_set_incremental_refresh_date", [sNewIncrementalDate], function(){

															fn.closeDialog();
															fn.refreshTable(t, function(){
																fn.setCustomButtonName(t, 1, "Incremental refresh [last:"+sNewIncrementalDate+"]");
															});
															
														});
													});
												}, 100);
																								
											});	

										},
										function(){
											fn.closeDialog();
											fn.message("Fout", "Fout bij RBN links ");
										});

									}, 100);


								}); // end of service call

							}); // end of get nr of days call

						

					});

				}			
			},

			"callback": function(t, n){

				// get and display the last refresh date of the table data

				fn.callFunction("api.external_links_get_full_refresh_date", [], function(resp){

					var sLastFullRefreshDate = resp["external_links_get_full_refresh_date"];
					fn.setCustomButtonName(t, 0, "Full refresh [last:"+sLastFullRefreshDate+"]");
				});


				fn.callFunction("api.external_links_get_incremental_refresh_date", [], function(resp){

					var sLastIncrementalRefreshDate = resp["external_links_get_incremental_refresh_date"];
					fn.setCustomButtonName(t, 1, "Incremental refresh [last:"+sLastIncrementalRefreshDate+"]");
				});
			}

		},


		distinct_lemma_gigpos: {

			"group": "Normatieve tabellen",

			"size": "60%",

			"column_sorting": {"lemma_gigpos": "asc"},

			"button_0": {
				"name": "Voeg POS toe",
				"click": function(t){

					var nRow = fn.getFirstSelectedRowNodeFrom(t);
					var sGigPos = "";
					if (nRow != null)
						sGigPos = fn.getDataFromCellInRowNode(nRow, "lemma_gigpos");

					fn.prompt(["POS toevoegen", "Voeg in"], ["lemma_gigpos"], [sGigPos], function(resp){

						var sNewGigPos = resp["lemma_gigpos"];

						fn.insertIntoDatabase(t, {"lemma_gigpos": sNewGigPos}, null, function(resp){
							fn.refreshTable(t);						
						});
					});

				}
			},
			"button_1": {
				"name": "Verwijder POS",
				"click": function(t){
					
					fn.confirm("Let op", "Weet u het zeker?", 
					function(resp){
						var nRow = fn.getFirstSelectedRowNodeFrom(t);
						fn.removeFromDatabaseGivenANode(nRow, function(){
							fn.refreshTable(t);
						})
					},
					function(){
						fn.message("OK", "Operatie geannuleerd door gebruiker");
					})
				}
			}
		}, 
		distinct_wordform_gigpos: {

			"group": "Normatieve tabellen",

			"size": "80%",

			"column_sorting": {"wordform_gigpos": "asc"},

			"button_0": {
				"name": "Voeg POS toe",
				"click": function(t){

					var nRow = fn.getFirstSelectedRowNodeFrom(t);
					var sGigPos = "";
					if (nRow != null)
						sGigPos = fn.getDataFromCellInRowNode(nRow, "wordform_gigpos");

					fn.prompt(["POS toevoegen", "Voeg in"], ["wordform_gigpos"], [sGigPos], function(resp){

						var sNewGigPos = resp["wordform_gigpos"];

						fn.insertIntoDatabase(t, {"wordform_gigpos": sNewGigPos}, null, function(resp){
							fn.refreshTable(t);
							
						});
					});

				}
			},
			"button_1": {
				"name": "Verwijder POS",
				"click": function(t){
					
					fn.confirm("Let op", "Weet u het zeker?", 
					function(resp){
						var nRow = fn.getFirstSelectedRowNodeFrom(t);
						fn.removeFromDatabaseGivenANode(nRow, function(){
							fn.refreshTable(t);
						})
					},
					function(){
						fn.message("OK", "Operatie geannuleerd door gebruiker");
					})
				}
			},
			"button_2": {
				"name": "Update rank in paradigma-view",
				"bgcolor": "red",
				"click": function(t){

					fn.message("Even geduld...", "Deze update kan tot 5 minuten duren.<BR><BR>Even geduld a.u.b.");
					
					setTimeout(function(){
						fn.callFunction("api.update_paradigms_ranks", [null], function(){
							fn.closeDialog();
							fn.message("OK", "De ranking is overal bijgewerkt.")
						});
					}, 500);
					
				}
			}
		},
		


		related_lemmata: {

			"group": "Archived / to be deleted",
			
			"button_0": {
				"name": "Remove related group",
				"click": function(t, n){
					
					var nRow = fn.getFirstSelectedRowNodeFrom(t);
					
					if (nRow == null) {
						fn.message("Let op" , "Selecteer eerst een rij waarvan de groep weg moet!");
					}
					else {
						var sGrId = fn.getDataFromCellInRowNode(nRow, "relation_group_id");
						
						fn.confirm("Verwijderen?", "Wilt u echt groep "+sGrId+" verwijderen?", 
							function(){
								fn.removeFromDatabaseGivenFieldValues("related_lemmata", {"relation_group_id": sGrId}, 
										function(){
											fn.refreshTable(t);
										});
							}, 
							function(){
								fn.message("OK", "Operatie geannuleerd door gebruikers");
							})						
					}
				}
			}
			
		},
		
		
		werkwoord_features: {
			
			"size": "60%",
			
			"column_sorting": {"modern_lemma": "asc"},
			
			"button_0": {
				"name": "Unlock",
				"click": function(t){
					
					// add temp class to table to tell the callback not to apply disabled css
					$("#"+fn.getTableName(t)+"_wrapper").addClass('unlocked');
					
					// refresh to apply unlocking (see callback)
					fn.refreshTable(t);
					
				}
			},
			
			"callback": function(t){
				
				var tSelector = $("#"+fn.getTableName(t)+"_wrapper");
				
				// special class means don't apply disabled css
				var unlocked = tSelector.hasClass('unlocked');
				
				if ( !unlocked )
				{
					var oRows = fx.getAllRows(t);
					oRows.every(function(){
						
						var oThisRow = this;
						
						var nCellSelector = $( fx.getNode(oThisRow) ).find("td");
						 nCellSelector.editable('disable');
						 nCellSelector.css("opacity", "0.5");
						 nCellSelector.find("input").attr("disabled", "disabled");
						 nCellSelector.find("input").css("opacity", "0.5");
					});
				}
				// upon refresh, the unlocked class must be removed
				else
				{
					// give button default state
					tSelector.removeClass('unlocked');							
				}
				
			},
			
			"repeat_callback": true
			
		},
		
		commission_report: {
			
			"columns_sorting": {
				"verwerkt__online": "asc",
				"modern_lemma": "asc"
			},
			
			"button_0": {
				
				"name": "Rapport aanmaken",
				"click": function(t){
					
					var aDeliveryDates = {};
					var aDeliveryFullDate = [];
					
					fn.callFunction("api.get_delivery_data", [], function(resp){
						
						var aAllDeliveries = (resp["get_delivery_data"]).split("@@@");
						
						// parse each delivery
						for (var i=0; i<aAllDeliveries.length; i++)
							{
							var aOneDeliveryDate = ( aAllDeliveries[i] ).split("###");
							var sDeliveryName = aOneDeliveryDate[0];
							var sDeliveryFullDate = aOneDeliveryDate[1];
							
							var sDeliveryKey = sDeliveryName + " (opgeleverd: " + sDeliveryFullDate + ")";
							
							// store date
							aDeliveryFullDate.push(sDeliveryKey);
							aDeliveryDates[sDeliveryKey] = sDeliveryFullDate;
							}
						
					});
					
					fn.prompt(["Commissie-rapport", "Kies een oplevering (zoals gedefinieerd in tabel 'export_versions').<BR><BR>Het rapport zal worden opgemaakt vanaf de datum van deze oplevering:<BR>"], 
							["Oplevering"], 
							[aDeliveryFullDate], 
							function(resp){
						
								var sNewDate = aDeliveryDates[ resp["Oplevering"] ];
						
								fn.message("OK", "Het rapport wordt nu gegenereerd met alle gegevens vanaf "+sNewDate+". Even geduld...");
								
								fn.showProcessingMsg(t);
								
								setTimeout(function(){
									
									fn.callFunction("api.build_commission_report", [sNewDate], function(){
											fn.closeDialog();
											fn.refreshTable(t);
									});						
										
									
								}, 500);
						
							}, 
							function(){
								
								fn.message("OK", "Operatie geannuleerd door gebruiker");
								
							});
									
				}	
			}
			
		},
		
		subsets: {
			
			"columns_sorting": {"subset": "asc"},
			
			"size": "80%",
			
			"button_0":{
				
				"name": "Voeg subset toe",
				"click": function(t){
					
					fn.prompt("Voer gegevens in", ["subset", "omschrijving"], ["<geef de subset een naam>", ""], 

							function(){
								
								var sSubset = 		fn.getPromptBoxInput("subset");
								var sDescription =	fn.getPromptBoxInput("omschrijving");
								
								// first show the new subset in the table
								
								fn.callFunction("api.register_subset", [sSubset, sDescription], function(){
									
									fn.goToTheRightPage(t, "subset", sSubset);
									
									
									// then update the pulldown values for the 'lemmata view'
									
									//updateSubsets();
									
								});
						
					});
					
				}
			},
			
			"button_1":{
				
				"name": "Verwijder selectie",
				"click": function(t){
					
					if (fx.getNumberOfSelectedRows(t) > 0)
						{
						fn.confirm("Let op", "Weet u zeker dat u deze rijen wilt verwijderen?", 
								
							// yes we're sure
								
							function(){
							
								var oSelection = fx.getSelectedRowsFrom(t);
								oSelection.every(function(){
									var oCurrentRow = this;
									var bLastRow = fx.isLastRowOf(oCurrentRow, oSelection);
									fx.removeFromDatabaseGivenARow(this, 
										function(){
											if (bLastRow) {
												fn.refreshTable(t);
												
												// update the subsets available to the lemmata view
												//updateSubsets();
											}
										},
										function(err){
											fn.message("Let op", "Verwijderen is niet toegestaan.");
										});
									
								});
							}, 
							
							// no, cancel!
							
							function(){
								fn.message("OK", "Operatie door gebruiker geannuleerd");
							})
						}
					
				}
			}
//			,
//                        "button_2": { 
//                                       "name": "HTML export van subset", 
//                                       "click" : function(t) {  
//                                         if (fx.getNumberOfSelectedRows(t) > 0) {
//                                           var oSelection = fx.getSelectedRowsFrom(t);
//                                           oSelection.every(function(){var subset = fx.getDataFromCellInRow(this, "subset"); var url = exportBase + subset; window.open(url); });
//                                         }
//                                      }
//                                 }

		},
		
		nuancerende_opmerkingen:{
			
			"size": "80%",
			
			"button_0":{
				"name": "Voeg opmerking toe",
				"click": function(t){
					
					fn.prompt("Voer opmerking in", 
							["short_code", "nuancerende_opmerking"], 
							["", ""],
							function(){
								var sShortCode =	fn.getPromptBoxInput("short_code");
								var sNuanceOpm =	fn.getPromptBoxInput("nuancerende_opmerking");
								
								fn.insertIntoDatabase(t, 
										{
										"short_code": sShortCode,
										"nuancerende_opmerking": sNuanceOpm
										}, 
										null, 
										function(){
											fn.refreshTable(t);
										});
							}, 
							null, // no callback upon Cancel
							true, 
							[35,3]);
				}
			},
			"button_1":{
				"name": "Verwijder selectie",
				"click": function(t){
					
					fn.confirm("Let op", "Weet u het zeker?", function(){
						
						
						var oRows = fx.getSelectedRowsFrom(t);						
						
						oRows.every(function(){
							var aCurrentRow = this;
							
							var bLastRow = fx.isLastRowOf(aCurrentRow, oRows);
							
							fx.removeFromDatabaseGivenARow(aCurrentRow, 
								function(){
									if (bLastRow)
										fn.refreshTable(t);
								},
								function(err){
									fn.message("Let op", "Verwijderen is niet toegestaan.");
								});	
							});
					});
					
					
					
				}
			}
			
		},
		
		export_versions:{
			
			"size": "80%",
			
			"button_0":{
				"name": "Voeg oplevering toe",
				"click": function(t){
					
					fn.prompt("Nieuwe oplevering", 
							["Naam van de oplevering"], 
							[""], 
							function(resp){
								
								fn.insertIntoDatabase(t, 
										{
										"naam_oplevering": resp["Naam van de oplevering"]
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
							var aCurrentRow = this;
							
							var bLastRow = fx.isLastRowOf(aCurrentRow, oRows);
							
							fx.removeFromDatabaseGivenARow(aCurrentRow, 
								function(){
									if (bLastRow)
										fn.refreshTable(t);
								},
								function(err){
									fn.message("Let op", "Verwijderen is niet toegestaan.");
								});	
						});
					});
					
					
					
				}
			}
		},
		
		
		
		lemmata_en_paradigma_view:{
			
			"prereset_callback": function(t){
				
				fn.addFilters(t, {"gedrukt": "", "f_total_rel": ""});
				
				// reset means paradigm view is turned off
				bReadableParadigmMode = false;
				fn.setCustomButtonName(t, 4, "Paradigma_view UIT");
				fn.setCustomButtonCss(t, 4, "textcolor", "black");
			},

			"columns_order": [
				"analyzed_wordform_id",
				"lemma_id",
				"wordform_id",
				"modern_lemma",
				"lemma_gigpos",
				"entry_type",
				"lem_keurmerk",
				"lem_source",
				"gedrukt",
				"tags",
				"wordform",
				"wordform_afbr",
				"wordform_gigpos",
				"wf_keurmerk",
				"arch",
				"rank",
				"opmerking_extern",
				"opmerking_intern",
				"wf_source",
				"verkleinwoord",
				"vk_status",
				"unique_id",
				"online",
				"publiceren",
				"th_wordform_afbr",
				"th_wordform",
				"lem_subset",
				"locked"				 
			],
			
			"repeat_callback": true,
			
			"callback": function(t){
				
				var sTableName = fn.getTableName(t);
				
				// build the UNlock button if it doesn't exist yet
				if ( superUser() && fn.getIndexOfButtonNamed(sTableName, "(Un)lock")<0) {
					fn.addCustomButton(t, {
						"name": "(Un)lock",
						"bgcolor": "#F5D0A9",
						"click": function(t){
							
							var aSelectedRows = fx.getSelectedRowsFrom(t);
							
							aSelectedRows.every(function(){		
								
								var thisRow = this;
								
								var sLemmaId = 		fx.getDataFromCellInRow(thisRow, "lemma_id");
								var bLemmaLocked =	fx.getDataFromCellInRow(thisRow, "locked");
								var bLastRow = 		fx.isLastRowOf(thisRow, aSelectedRows);								
								
								var lockedNewValue = (bLemmaLocked == 't' ? false : true);
								fn.updateDatabaseGivenFieldValues("lemmata", {"lemma_id": parseInt(sLemmaId)}, {"locked": lockedNewValue}, function(){
									if(bLastRow) 
										fn.refreshTable(t);
									});							
								
							});
							
						}
					});
				}
				
				var oRows = fx.getAllRows(t);
				
				
				// apply locks and add colors
				
				var aLemmaIdsArr = new Array();
				oRows.every(function(i){
					
					aLemmaIdsArr[i] = fx.getDataFromCellInRow(this, "lemma_id");			
				});
				aLemmaIdsArr = getOnlyUniqueValues(aLemmaIdsArr);
				
				fn.showProcessingMsg(t);
				
				// get the list of locked lemmata
				// and modify the rows accordingly
				oRows.every(function(i){
					
					var oThisRow = this;	
					
					// make records with an empty wordform unclickable
					
					var sAwfId = fx.getDataFromCellInRow(this, "analyzed_wordform_id");
					if (sAwfId == '' || sAwfId == null) {
						
						$(fx.getCellNode(oThisRow, "wordform")).editable('disable');
						$(fx.getCellNode(oThisRow, "wordform")).css("opacity", "0.5");
						
						$(fx.getCellNode(oThisRow, "afbr_auto")).find("input").attr("disabled", "disabled");
						$(fx.getCellNode(oThisRow, "afbr_auto")).css("opacity", "0.5");
						
						$(fx.getCellNode(oThisRow, "wordform_gigpos")).editable('disable');
						$(fx.getCellNode(oThisRow, "wordform_gigpos")).css("opacity", "0.5");
						
						$(fx.getCellNode(oThisRow, "wf_keurmerk")).find("input").attr("disabled", "disabled");
						$(fx.getCellNode(oThisRow, "wf_keurmerk")).css("opacity", "0.5");
						
						$(fx.getCellNode(oThisRow, "opmerking_intern")).editable('disable');
						$(fx.getCellNode(oThisRow, "opmerking_intern")).css("opacity", "0.5");
						
						$(fx.getCellNode(oThisRow, "opmerking_extern")).editable('disable');
						$(fx.getCellNode(oThisRow, "opmerking_extern")).css("opacity", "0.5");
					}
					
					
					
					// gedrukt must be blue [NOT ANYMORE]
					// var bIsGedrukt =  fx.getDataFromCellInRow(oThisRow, "gedrukt");					
					// if (bIsGedrukt == 't') {
					// 	var nCellSelector = $( fx.getNode(oThisRow) ).find("td");
					// 	nCellSelector.css("color", "blue");
					// }
					
					// diminutives must be green [NOT ANYMORE]
					// var sVerkleinwoord = fx.getDataFromCellInRow(oThisRow, "verkleinwoord");
					// if (sVerkleinwoord != '-') {
					// 	var nCellSelector = $( fx.getNode(oThisRow) ).find("td");
					// 	nCellSelector.css("color", "green");
					// }
						
					
					// apply locks
					var bLemmaLock = fx.getDataFromCellInRow(oThisRow, "locked");
					if ( bLemmaLock == 't' ) {
						var nCellSelector = $( fx.getNode(oThisRow) ).find("td:not(.opmerking_intern)");

						nCellSelector.css("color", "green");
						nCellSelector.editable('disable');
						nCellSelector.find("input").attr("disabled", "disabled");
						// nCellSelector.editable('disable');
						// nCellSelector.css("opacity", "0.5");
						// nCellSelector.find("input").attr("disabled", "disabled")
						// nCellSelector.find("input").css("opacity", "0.5");				
						
					}						
					
				});
				
				
				// finish with the paradigm view, as it should overrule 
				// some things done by the previous loop (like font color)
				
				if (bReadableParadigmMode)
					generateParadigmView();
				
				fn.removeProcessingMsg(t);
				
			},			
			"button_0":{
				"name": "Voeg woordvorm toe",
				"click": function(t){
					
					var aFirstRow;
					var sLemmaId;
					var sLemma = null;
					
					// if there is no paradigm yet, get the lemma id from the lemma table
					if (fn.tableIsEmpty(t)) {
						aFirstRow = fx.getFirstSelectedRowFrom("lemmata");						
						sLemmaId =	fx.getDataFromCellInRow(aFirstRow, "lemma_id");
						sLemma =	fx.getDataFromCellInRow(aFirstRow, "modern_lemma");
					}
					// otherwise just read it from the current table
					else {
						
						aFirstRow =	(fx.getSelectedRowsFrom(t)).any() ?
								fx.getFirstSelectedRowFrom(t) : fx.getFirstRowFrom(t);
						sLemmaId =	fx.getDataFromCellInRow(aFirstRow, "lemma_id");
						// in this particular case, sLemma will be
						// requested by following fn.getRecord call
					}
					
					
					if (sLemmaId == null || sLemmaId == '') {
						fn.message("Kies een lemma", "Selecteer het lemma waar een woordvorm aan moet worden toegevoegd.");
					}
					else {
						fn.getRecord("lemmata", sLemmaId, function(response){
							
							// if we don't have a modern_lemma to show, get it
							
							if (sLemma == null)
								sLemma =  response["modern_lemma"];						
							
							fn.prompt("Geef woordvorm voor '"+sLemma+"'", 
									["woordvorm", "wordform_gigpos", "aantal"], 
									["", "", "1"], 
									function(){
								
									var sWordform =			fn.getPromptBoxInput("woordvorm");
									var sWordformPos =		fn.getPromptBoxInput("wordform_gigpos");
									var sNumberToBeAdded =	fn.getPromptBoxInput("aantal");
									
									var iNumberToBeAdded = parseInt(sNumberToBeAdded);
									for (var wi = 0; wi<iNumberToBeAdded; wi++)
										{
										
										// when adding multiple wordforms, add an index to the pos,
										// to prevent doubling (which is not allowed by table definition)
										var sWordformPosToAdd = (iNumberToBeAdded>1) ? 
												(sWordformPos + wi) : sWordformPos;
										
										fn.callFunction("api.insert_wordform", 
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
													fn.cleanTableCache(fn.getTableName(t), function(){
														fn.refreshTable(t);
															}
														);												
													}
												
												},
												function(err){
													fn.message("Let op", "Er ging iets mis. Is de gekozen part-of-speech wel toegestaan? ("+sWordformPos+")");
												});
										
										}
								});
								
							});	
					}
					
					
									
					
				}
			},
			
			"button_1":{
				
				"name": "Verwijder selectie",
				"bgcolor": "salmon",
				"click": function(t){
					
					fn.confirm("Verwijder selectie", "Weet u het zeker?", function(){
						
						var oRows = fx.getSelectedRowsFrom(t);
						
						oRows.every(function(){
							
							var bLastRow = fx.isLastRowOf(this, oRows);
							
							fx.removeFromDatabaseGivenARow(this, 
								function(){
									if (bLastRow) 
										fn.refreshTable(t);
								},
								function(err){
									fn.message("Let op", "Verwijderen is niet toegestaan.");
								});														
							
						});
						
					});
					
					
				}
			},
			
			"button_2":{
				"name": "Rij dupliceren",
				"bgcolor": "lightblue",
				"click": function(t){
					
					fn.confirm("Rij dupliceren", "Weet u het zeker?", function(){
						
						var oRows = fx.getSelectedRowsFrom(t);
						
						if ( oRows.any() )
							{
							var oRow =		fx.getFirstSelectedRowFrom(t);
							var iAwfId =	fx.getDataFromCellInRow(oRow, "analyzed_wordform_id");
							fn.callFunction("api.clone_analyzed_wordform", [iAwfId], function(){
								fn.refreshTable(t);
								});
							}
						else
							{
							fn.message("Let op", "Kies de rij die gedupliceerd moet worden");
							}
						
					});					
					
				}
			},
			
			
			"button_3":{
				
				"name": "Bouw Paradigma",
				"click": function(t){
					
					// get the selected row, so we can define which paradigm we will extend
					var oAwfNode = fx.getFirstSelectedRowFrom(t);
					if (oAwfNode == null || oAwfNode.count()==0)
						oAwfNode = fx.getFirstRowFrom(t);
					var oLemNode = fn.tableExists("lemmata") ? 
							fx.getFirstSelectedRowFrom("lemmata") : null;
							
							
					// we must have at least one row to get an id from 
							
					if (    ((oLemNode != null && oLemNode.count() == 0) || oLemNode == null)
							&& 
							(oAwfNode == null || oAwfNode.count() == 0) ) {
						fn.message("Let op!", "Kies een lemma of een woordvorm!");
					}
					
					else {
						var sAwfId = null, sLemId = null;
						
						// do we have a lemma, or a wordform?						
						
						// wordform is a dummy one, t.i. the one that is just meant to make verb visible (in which case awfid is empty),
						// but of course, this allows us to read the lemma_id from the paradigm view at least
						if (	oAwfNode != null && 
								oAwfNode.count() > 0 && 
								fx.getDataFromCellInRow(oAwfNode, "analyzed_wordform_id") == '') {	
							sLemId = fx.getDataFromCellInRow(oAwfNode, "lemma_id");
						}
						
						// if paradigm is completely empty, 
						// reading lemma_id can only happen in the lemma table
						else if ((oAwfNode == null || oAwfNode.count() == 0) && (oLemNode != null && oLemNode.count() > 0)) {
							sLemId = fx.getDataFromCellInRow(oLemNode, "lemma_id");
						}
						
						// remaining case: we have a genuine wordfrom, use it!
						else {
							sAwfId = fx.getDataFromCellInRow(oAwfNode, "analyzed_wordform_id");
						}						
						
						// if we have some selection to work with,
						// call the paradigm extension function
						if (sLemId != null || sAwfId != null) {
							fn.callFunction("api.add_missing_paradigm", [sLemId, sAwfId], function(){
								
								fn.refreshTable(t, function(){
									
									
									// gather wordforms to look up
									// in syllabificator werbservice
									
									var aWordformsToLookup = new Array();
									
									var oRows = fx.getAllRows(t);
									
									oRows.every(function(){
										
										var oCurrentRow = this;
										
										var sWordform =		fx.getDataFromCellInRow(oCurrentRow, "wordform");
										var sWordformAfbr =	fx.getDataFromCellInRow(oCurrentRow, "wordform_afbr");
										
										// we have a wordform but no abbreviation
										// so we'll have to look up this word
										
										if (sWordform != '' && sWordformAfbr == ''
											&& 
											$.inArray(sWordform, aWordformsToLookup)<0 
											&& 
											sWordform != '[VULIN]'
											)
											{
											aWordformsToLookup.push(sWordform);
											}											
									});
									
									
									// do the look up now!
									fn.callService("/Spelling/SpellingServices", 
													{"action": "syllabify", "w": aWordformsToLookup.join(" ")}, 
													"GET", "json", function(json){
											
														var response = json["analyses"][0];
														var aWordForms =		(response["word"]).split(" ");
														var aAbbreviations =	(response["printForm"]).split(" ");
														
														oRows.every(function(){
															
															var oCurrentRow = this;
															
															var sWordform =		fx.getDataFromCellInRow(oCurrentRow, "wordform");
															var sWordformAfbr =	fx.getDataFromCellInRow(oCurrentRow, "wordform_afbr");
															
															if (sWordform != '' && sWordformAfbr == '') {
																var indexOfAbbreviation = $.inArray(sWordform, aWordForms);
																var sNewAbbreviation = aAbbreviations[indexOfAbbreviation];
																if (sNewAbbreviation!=null) {
																	fx.updateDatabaseGivenACellOrRow(oCurrentRow, {"wordform_afbr": sNewAbbreviation});
																	fx.putDataIntoCell(oCurrentRow, "wordform_afbr", sNewAbbreviation);
																}
																
															}
														}); // rows loop
														
													}); // end of service call
									
									
									}); // end of refreshTable
								
								
								}); // end of add_missing_paradigm
						}
						
					}					
					
				}
			},
			
			
			"button_4":{
				
				"name": "Paradigma_view UIT",
				"bgcolor": "yellow",
				"textcolor": "black",
				"click": function(t){
					
					bReadableParadigmMode = !bReadableParadigmMode;			
					
					var xPos = $("#lemmata_en_paradigma_view_dynamic").css("left");
					var yPos = $("#lemmata_en_paradigma_view_dynamic").css("top");
										
					if (bReadableParadigmMode)
						{						
						var oFirstRow =	fx.getFirstRowFrom(t);
						var sLemmaId =	fx.getDataFromCellInRow(oFirstRow, "lemma_id");
						
						tb.destroyTable("lemmata_en_paradigma_view", function(){
							
							conf.changeTableConfigValue("lemmata_en_paradigma_view", "modern_lemma", "visible", false);
							conf.changeTableConfigValue("lemmata_en_paradigma_view", "lemma_gigpos", "visible", false);
							conf.changeTableConfigValue("lemmata_en_paradigma_view", "lem_keurmerk", "visible", false);
							conf.changeTableConfigValue("lemmata_en_paradigma_view", "gedrukt", "visible", false);
							conf.changeTableConfigValue("lemmata_en_paradigma_view", "online", "visible", false);
							conf.changeTableConfigValue("lemmata_en_paradigma_view", "opmerking_intern", "visible", false);
							conf.changeTableConfigValue("lemmata_en_paradigma_view", "opmerking_extern", "visible", false);
							conf.changeTableConfigValue("lemmata_en_paradigma_view", "verkleinwoord", "visible", false);
							conf.changeTableConfigValue("lemmata_en_paradigma_view", "th_wordform", "visible", false);
							conf.changeTableConfigValue("lemmata_en_paradigma_view", "th_wordform_afbr", "visible", false);
							conf.changeTableConfigValue("lemmata_en_paradigma_view", "lem_subset", "visible", false);
							
							fn.callDatabase(
									"lemmata_en_paradigma_view", 
									{"lemma_id": sLemmaId}, 
									function(){
										generateParadigmView();										
									}, 
									{"displaylength":"50", "top": yPos, "left": xPos}
									);
							});
						}
					else
						{
						fn.setCustomButtonName(t, 4, "Paradigma_view UIT");
						fn.setCustomButtonCss(t, 4, "textcolor", "black");

						fn.refreshTable(t);
						}
					
										
					
				}
				
			},
			
			"button_5":{
				
				"name": "нельзя",
				"bgcolor": "white",
				"textcolor": "red",
				"click": function(t){
					
					// trick: https://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript
					
					var tmpTextArea = $("<textarea></textarea>").attr("id", "russischWoordje").text("нельзя");
					$("#temporary_stuff").append(tmpTextArea);
					
					var copyChar = $('#russischWoordje');
					copyChar.select();
					
					try {
						// now copy it to clipboard
						
					    document.execCommand('copy');					    
					    
					    // confirm to user which chars he/she has chosen
					    fn.message("In clipboard", "нельзя");
					    
					    // remove temporary textarea
					    
					    $("#russischWoordje").remove();
					    
					  } catch (err) {
						  
					  }
				}
				
			},
			
			"button_6": {
				
				"name": "Afbrekingen",
				"tooltip": "Voeg ontbrekende afbrekingen toe",
				"click": function(t){
					
					fn.confirm(
							"Voeg afbrekingen toe", 
							"Dit zal de ontbrekende afbrekingen toevoegen. Weet u zeker dat u dit wilt?", 
							
							function(){
						
								// gather the rows whose afbr is not filled in
								
								var oRowsWithoutAfbr = fx.getAllRowsWhere(t, {"wordform_afbr": ""});
								var aRowsToProcess = new Array();					
								oRowsWithoutAfbr.every(function(){ aRowsToProcess.push(this); });
								
								// function for assigning a syllabified wordform to afbr
								
								var assignAfbrToEachRow = function(aRowsToProcess, i){
									
									// if we're done, refresh the table to show the results
									if (i == aRowsToProcess.length)
										{
										fn.refreshTable(t);
										}
									
									// 
									else
										{
										var oThisRow = aRowsToProcess[i];
										var sRowId = fx.getDataFromCellInRow(oThisRow, "analyzed_wordform_id");
										var sWordForm = fx.getDataFromCellInRow(oThisRow, "wordform");
										
										// if the current row is a dummy, skip to the next row
										if (sRowId == '')
											{
											i++;
											assignAfbrToEachRow(aRowsToProcess, i);
											}
										// otherwise carry on with our job
										else
											{
											// call the SpellingServices for syllabifying the wordform
											
											fn.callService("/Spelling/SpellingServices", {"action": "syllabify", "w": sWordForm}, "GET", "json", function(json){
												
												var response = json["analyses"][0];
												var sAfbr = response["printForm"];
												
												// update the database with the syllabified wordform 
												// and call the function recursively till we're finished
												
												fx.updateDatabaseGivenACellOrRow(oThisRow, {"wordform_afbr": sAfbr}, function(){
													
													i++;
													assignAfbrToEachRow(aRowsToProcess, i);
													});
												});
											}
										
										}
									
								};
								
								// start the job
								assignAfbrToEachRow(aRowsToProcess, 0);
								
							}, 
							function(){
								fn.message("OK", "Operatie door gebruiker geannuleerd");
							});
					
				}
				
			},

			"keyup": {

				"f4": function(t){
					// this must trigger the '(Un)lock' button functionality

					var iIdx = fn.getIndexOfButtonNamed(t, "(Un)lock");
					var sTable = fn.getTableName(t);
					$("button[id='"+sTable+"_button_"+iIdx+"']").click();
				}
			}
		},
		
		
		
		modified_lemmata_view: {
			
			"group": "log",
			
			"button_0":{
				"name": "Lemma en paradigma herstellen",
				"click": function(t){
					
					fn.confirm("Zeker weten?", "Weet u het zeker? Als de log groot is, kan deze operatie enige tijd kosten.", 
							function(){
						
						var oRowSelection = fx.getSelectedRowsFrom(t);
						
						oRowSelection.every(function(){
							
							var oCurrentRow =	this;
							var sLemmaId =		fx.getDataFromCellInRow(oCurrentRow, "lemma_id");
							
							fn.callFunction("api.restore_lemma_and_paradigm_and_ids", [sLemmaId],  
									function(){
										if (fx.isLastRowOf(oCurrentRow, oRowSelection))
											fn.refreshTable(t);
										
							});
						});
					});
				}
			}
		},
		
		modified_paradigm_view:{
			
			"group": "log",
			
			"button_0":{
				"name": "Woordvorm herstellen",
				"click": function(t){
					
					fn.confirm("Zeker weten?", "Weet u het zeker?", 
							function(){
						
						var oRowSelection =	fx.getSelectedRowsFrom(t);
						
						oRowSelection.every(function(){
							
							var oCurrentRow =	this;
							var sAwfId =		fx.getDataFromCellInRow(oCurrentRow, "analyzed_wordform_id");
							
							fn.callFunction("api.restore_wordform", [sAwfId],  
									function(){
										if (fx.isLastRowOf(oCurrentRow, oRowSelection))
											fn.refreshTable(t);
							});
						});
					});
				}
			}
		},
		

		lemmata: {
			
			"columns_order": [
							  "locked",
							  "lemma_id", 
			                  "parent", 
			                  "parent_id", 
							  "gb_superid",  
							  "modern_lemma", 
							  "lemma_gigpos",
							  "opmerking_intern", 
							  "gb_wrdcat",  
							  "gb_znwlid",  
							  "lidw", 
							  "tags", 
							  "geslacht",  
							  "keurmerk",
							  "online", 
							  "gedrukt",
							  "has_dim",
							  "has_el",
							  "has_fonet",
							  "has_morph",
							  "uitspraak",
							  "entry_type", 
			                  "sublemma_type", 
			                  "gloss", 
							  "gloss_intern",
							  "subset",
							  "source", 
			                  "ww_feat",
			                  "kapstok", 
							  "creation_date", 
							  "creation_time", 
			                  "taalvariant", 
			                  "herkomst", 
			                  "opmerking_extern",
			                  "taaladvies", 
			                  "th_lemma", 
			                  "nuanc_opm", 
			                  "gb_id", 
			                  "toon_paradigma", 
			                  "trademark", 
			                  "toon_morfologie", 
			                  "verkleinwoord", 
							  "vorig_gedrukt", 
							  "vorig_online" 
			                  ],
			
			"prereset_callback": function(t){
				
				
				
				sBrotherLemmaId = null;
				fn.setCustomButtonName(t, 2, "Kies broeder:");
				
				fn.addFilters(t, {"gedrukt": "", "tmp_f_total_rel": ""});
								
			},
			
			"repeat_callback": true,
			
			"callback": function(t){				
				
				
				var sTableName = fn.getTableName(t);
				
				// build the UNlock button if it doesn't exist yet
				if ( superUser() && fn.getIndexOfButtonNamed(sTableName, "(Un)lock")<0) {										
					fn.addCustomButton(sTableName, {
						"name": "(Un)lock",
						"bgcolor": "#F5D0A9",
						"click": function(t){
							
							var oSelectedRows = fx.getSelectedRowsFrom(t);
							
							oSelectedRows.every(function(){
								
								var thisRow = this;
								
								var sLemmaId = 		fx.getDataFromCellInRow(thisRow, "lemma_id");
								var bLemmaLocked =	fx.getDataFromCellInRow(thisRow, "locked");
								var bLastRow = 		fx.isLastRowOf(thisRow, oSelectedRows);
								
								var lockedNewValue = (bLemmaLocked == 't' ? false : true);
								fn.updateDatabaseGivenFieldValues("lemmata", {"lemma_id": parseInt(sLemmaId)}, {"locked": lockedNewValue}, function(){
									if(bLastRow) 
										fn.refreshTable(t);
									});
																
								});
							
						}
					});
				}
				
				var oRows = fx.getAllRows(t);
				
				
				// apply locks and add colors
				
				var aLemmaIdsArr = new Array();
				oRows.every(function(i){
					
					aLemmaIdsArr[i] = fx.getRowId(this);
				});
				
				
				fn.showProcessingMsg(t);
				
				oRows.every(function(i){
					
					var oThisRow = this;
					
					//var nCellSelector = $( fx.getNode(oThisRow) ).find("td");
					
					// gedrukt must be blue  [NOT ANYMORE]					
					// var bIsGedrukt = fx.getDataFromCellInRow(this, "gedrukt");
					// if (bIsGedrukt == 't') {
					// 	nCellSelector.css("color", "blue");	
					// }
					
					
					// diminutives must be green  [NOT ANYMORE]
					// var sVerkleinwoord = fx.getDataFromCellInRow(this, "verkleinwoord");
					// if (sVerkleinwoord != '-') {
					// 	nCellSelector.css("color", "green");
					// }
					


					// apply locks
					var bLemmaLock = fx.getDataFromCellInRow(oThisRow, "locked");
					if ( bLemmaLock == 't' ) {

						var nCellSelector = $( fx.getNode(oThisRow) ).find("td:not(.gloss_intern, .opmerking_intern, .uitspraak, .sublemma_type)");
						nCellSelector.css("color", "green");
						nCellSelector.editable('disable');
						nCellSelector.find("input").attr("disabled", "disabled");

						//nCellSelector.css("opacity", "0.5");
						//nCellSelector.find("input").css("opacity", "0.5");							
					}						
					
				});
				
				
				fn.removeProcessingMsg(t);


				// DISABLE THE Morphology buttons when no morph-analysis is available 

				// gather the lemma ids of the current view
				var aLemmaIdsToCheck = fn.getDataFromColumn(t, "lemma_id")

				// And call a function to check if those have a morphological analysis.
				// Output will be the list of lemma ids that indeed have such an anlysis.
				fn.callFunction("api.check_existence_morph_analyses", [ aLemmaIdsToCheck.join(",") ], function(output){

					var aListHavingMorphAnalyses = (output["check_existence_morph_analyses"]).split(",");

					oRows.every(function(i){
					
						var oThisRow = this;
						var bHasMorph = fx.getDataFromCellInRow(oThisRow, "has_morph");
						var sLemmaId = fx.getRowId(oThisRow);
						// if current row is part of the function output

						//if ( $.inArray(sLemmaId, aListHavingMorphAnalyses)<0){
						if (bHasMorph == false || bHasMorph == 'f') {
							$( fx.getCellNode(oThisRow, "toon_morfologie") ).find("button").css("display", "none");
						}

					});

				});
				
				
			},			
			
	
			"keyup": {				
				
				"f9": function(t){
					
					var oRow =		fx.getFirstSelectedRowFrom(t);
					var sLemmaId =	fx.getDataFromCellInRow(oRow, "lemma_id");
					fn.callDatabase(
							"lemmata_en_paradigma_view", 
							{"lemma_id": sLemmaId}, 
							null, 
							{ignore_initialisation_filters: true}
							);
				},

				"pause": function(t){
					var oThisRow =		fx.getFirstSelectedRowFrom(t);
					$( fx.getCellNode(oThisRow, "toon_morfologie") ).click();
				},

				"f4": function(t){
					// this must trigger the '(Un)lock' button functionality

					var iIdx = fn.getIndexOfButtonNamed(t, "(Un)lock");
					var sTable = fn.getTableName(t);
					$("button[id='"+sTable+"_button_"+iIdx+"']").click();
				}
			},
			
			//"size": "90%",
			
			"button_0":{
				"name": "Voeg lemma toe",
				"click": function(t){
					
					fn.prompt("Geef een lemma", 
							["modern_lemma", "lemma_gigpos", "gloss_intern"], 
							["", "", ""], 
							function(){
						
						var sLemma =	fn.getPromptBoxInput("modern_lemma");
						var sLemmaPos =	fn.getPromptBoxInput("lemma_gigpos");
						var sGloss =	fn.getPromptBoxInput("gloss_intern");
						
						// check first if this lemma existed in the past and was removed
						
						fn.showProcessingMsg(t);
						
						fn.callFunction("api.find_removed_lemma", 
								[sLemma, sLemmaPos], 
								function(){
							
							fn.removeProcessingMsg(t);
							
							var aColumns = fn.getFunctionOutput();
							
							// If some identical lemma existed in the past,
							// give the user the possibility to restore it
							if (aColumns["lemma_id"] != '') {
								fn.confirm("Let op!", 
										"Op "+aColumns["modification_date"]+ " is het lemma "+
										aColumns["modern_lemma"]+"/"+aColumns["lemma_gigpos"]+ " " +
										(aColumns["gloss_intern"]!='' ? "("+aColumns["gloss_intern"]+") ":"") +
										"met ID "+aColumns["lemma_id"]+ " verwijderd. "+
										"<br><br>Wilt u dit lemma herstellen?", 
										function(){
									
											fn.showProcessingMsg(t);
									
											// user chosed to re-use the id
											fn.callFunction("api.restore_lemma_and_paradigm_and_ids", 
													[parseInt(aColumns["lemma_id"])], 
													function(){
														fn.refreshTable(t);
													});
											
										},
										function(){
											
											fn.showProcessingMsg(t);
											
											// user chosed to create a new lemma 
											fn.callFunction("api.insert_lemma", 
													[sLemma, sLemmaPos, sGloss], 
													function(){
														fn.refreshTable(t);
													},
													function(){
									            		fn.removeProcessingMsg(t);
										            	fn.message("Let op", "Deze pos-tag is niet toegestaan. Het lemma is daarom NIET aangemaakt.");
										            });
											
										}
								);
							}
							
							// default behaviour: 
							// no such lemma was removed before: lemma must be new
							else {
								
								// check first if the lemma exist already
								
								fn.callFunction("api.find_existing_lemma", 
										[sLemma, sLemmaPos], 
										function(response){
											resp = response["find_existing_lemma"];
											
											// lemma exists! What now?
											if (resp != null && resp != '') {
												fn.confirm("Let op!", "In de database bestaat het volgende: "+resp+"<BR>Weet u zeker dat u dit lemma wilt aanmaken?", 
														function(){
													
															fn.showProcessingMsg(t);
															
															fn.callFunction("api.insert_lemma", 
																	[sLemma, sLemmaPos, sGloss], 
																	function(){
																fn.refreshTable(t);
															});
													
														}, 
														function(){
															
															fn.message("OK", "Operatie door gebruiker geannuleerd.");
															
														});
											}
									
											// normal behaviour: lemma doesn't exist, just make it!
											else {
												fn.showProcessingMsg(t);
												
												fn.callFunction("api.insert_lemma", 
														[sLemma, sLemmaPos, sGloss], 
														function(){
															fn.refreshTable(t);
														},
														function(err){
										            		fn.removeProcessingMsg(t);
											            	fn.message("Let op", "Deze pos-tag is niet toegestaan. Het lemma is daarom NIET aangemaakt.");
														}
												);
											}
									
									
								});
								
							}
						});
						
						
					});
				}
			},
			"button_1":{
				"name": "Verwijder selectie",
				"click": function(t){

					// there must be a selection!

					var oRows = fx.getSelectedRowsFrom(t);
					if (oRows == null && oRows.count() == 0){

						fn.message("Let op", "Kies op z'n minst één lemma om te verwijderen");
						return false;
					}

					// gather the lemma-id's of the current selection

					var aLemmaIds = new Array();
					var sWarningAboutLinksToExternalResources = "";
					oRows.every(function(){
						var sLemmaId = fx.getDataFromCellInRow(this, "lemma_id");
						aLemmaIds.push(sLemmaId);
					});

					// pre-check if the selection has external links (with EXTERNAL resource)
					
					fn.callFunction("api.check_if_lem_has_external_links", [fn.quote(aLemmaIds.join(","))], function(linkresp){

						if (linkresp["check_if_lem_has_external_links"]=='t'){
							sWarningAboutLinksToExternalResources = "<B>De selectie bevat "+(aLemmaIds.length>1?"lemmata die gekoppeld zijn":"een lemma dat gekoppeld is")+" aan een externe bron.</B><BR><BR>"
						}

						fn.confirm("Let op!", sWarningAboutLinksToExternalResources + "Weet u zeker dat u "+(oRows.count()>1 ? "deze "+oRows.count()+" lemmata":"dit lemma")+" wilt verwijderen?", 
							function(resp){

								// check if the selection contains lemmata that are locked

								var iLockedLemmata = 0;
								oRows.every(function(){
									var locked = fx.getDataFromCellInRow(this, "locked");
									if (locked == 't' || locked == true)
										iLockedLemmata++;
								});
								if (iLockedLemmata>0) {
									fn.message("Helaas", iLockedLemmata + " lemma"+(iLockedLemmata>1?"ta":"")+ " in de selectie "+(iLockedLemmata>1?"zijn":"is")+" gelocked. <BR><BR>Verwijderen kan niet doorgaan.");
									return false;
								}


								// now loop through the list of lemmata to be deleted

								oRows.every(function(){

									var oRow = this;
									var bLastRow = fx.isLastRowOf(oRow, oRows);

									// check if the selection contains lemmata linked to ANW or so
									
									var sLemmaId = fx.getDataFromCellInRow(oRow, "lemma_id");
									var sLemma = fx.getDataFromCellInRow(oRow, "modern_lemma");

									fn.callService(sLinksToMolexApiURL+"/links/"+sLemmaId, {}, "GET", "json", 
										function(resp){

											// check the status: it must be OK, otherwise cancel it all

											var oStatus = resp.status;

											if (oStatus.ok != true) {
												fn.message("Helaas", "De links-to-molex service heeft status '"+oStatus.ok+"'.<BR><BR>Verwijderen kan niet doorgaan.");
												return false;
											}

											// check if some ANW links exist

											var oLinks = resp.links;
											var sInfoForUser = "";

											if (oLinks.length > 0){

												var aSources = new Array();
												for (var i=0; i<oLinks.length; i++){

													var sSrcResource = oLinks[i].srcResource;
													var sArticleLemma = oLinks[i].articleLemma;
													var sSrcType = oLinks[i].srcPidType;
													if (aSources.indexOf(sSrcResource)<0)
														aSources.push(sSrcResource);

													sInfoForUser += "<ul>";
													sInfoForUser += "<li>Gelinkt met <B>"+sSrcResource+"-lemma</B> '"+sArticleLemma+"' "+
														(sSrcType == 'artikel' ? "" : ", "+"<B>"+sSrcType+"</B> " + oLinks[i].srcPidDescription+"</li>");																										
													sInfoForUser += "</ul>";
												}
												
												fn.message("Helaas", 
													"Lemma '"+sLemma+"' (id "+sLemmaId+") is gelinkt met "+aSources.join("/").toUpperCase()+".<BR><BR>Het mag dus niet worden verwijderd."+
													"<BR><BR><u>Extra informatie</u>:"+sInfoForUser);
												return false;
											}
											
											fn.showProcessingMsg(t);			
											
											// ready for full job now:
											
											// first: if this lemma is a diminutive
											// we need to delete the diminutive analysis as well, 
											// so check if it exists.
											
											fn.callFunction("api.unlink_verkleinwoord", [sLemmaId], 
													function(){								
														// done													
													}, 
													function(err){
														fn.removeProcessingMsg(t);
														fn.message("Let op", "Het verwijderen van de morfologische analyse van '"+sLemma+"' (id "+sLemmaId+") is door de database verhinderd.");
														return false;
													});
											
											fn.callFunction("api.find_diminutive_lemma", 
													[sLemmaId], 
													function(aColumns){					
												
												// second: if some other lemma happens to be a diminutive
												// constructed with this lemma, delete this diminutive analysis as well
												
												var sMorphAnalysisId = 		aColumns["morphological_analysis_id"];
												var sVerkleinwoordLemId =	aColumns["verkleinwoord_lemma_id"];
												
												if (sMorphAnalysisId != '') {
													
													// remove diminutive from morphological analysis 
													
													fn.callFunction("api.unlink_verkleinwoord", [sVerkleinwoordLemId], 
														function(){										
															// done
														}, 
														function(err){
															fn.message("Let op", "Het vewijderen van de morfologische analyse van lemma-id "+sVerkleinwoordLemId+", waarvan '"+sLemma+"' (id "+sLemmaId+") een deel-lemma is, is door de database verhinderd.");
															fn.removeProcessingMsg(t);
															return false;
														});												
												}
												
											});
											
											
											// main job: remove the lemma
											
											fn.removeFromDatabaseGivenFieldValues("lemmata", 
												{"lemma_id": sLemmaId}, 
												function(){
													if (bLastRow)
														fn.refreshTable(t);
												},
												function(err){
													fn.message("Let op", "Het verwijderen van '"+sLemma+"' (id "+sLemmaId+") is door de database verhinderd (is het lemma gelokt?)");
													fn.removeProcessingMsg(t);
													return false;
												}
											);
												


										}, // end of service response processing
										
										{}, // extra params to service
									
										function(){ // service error handler

											fn.message("Helaas", "Het opvragen van informatie over gelinkte lemmata is mislukt.<BR><BR>Zonder deze controle kan verwijderen niet doorgaan.");
											return false;

										}

									); // end of service call

								});

							}, 
							function(){
								fn.message("OK", "Operatie door gebruiker geannuleerd");

							}
						);

					});

				} // end of click event processing
				
			},
			"button_2":{
				"name": "Kies broeder:",
				"bgcolor":"yellow",
				"textcolor": "red",
				"click": function(t){
					
					var oRow = fx.getFirstSelectedRowFrom(t);
					
					if (oRow.any())
						{
						// remember chosen brother, and show it on the screen
						var sLemId = fx.getDataFromCellInRow(oRow, "lemma_id");
						var sLemma = fx.getDataFromCellInRow(oRow, "modern_lemma");
						
						fn.setCustomButtonName(t, 2, "Gekozen broeder:<b>"+sLemma+"</b>");
						sBrotherLemmaId = sLemId;
						}
					
					// press shift + click to cancel parent selection 
					if (kf._getPressedKey() == 'shift')
					{
					fn.setCustomButtonName(t, 2, "Kies broeder:");
					sBrotherLemmaId = null;
					}

				}
			},
			"button_3":{
				"name": "Link broeders",
				"bgcolor":"red",
				"textcolor": "yellow",
				"click": function(t){
					
					if (sBrotherLemmaId != null)
						{
						var oNodes = fx.getSelectedRowsFrom(t);
						if (oNodes.any())
							{
							
							oNodes.every(function(){
								
								var sLemId =	fx.getDataFromCellInRow(this, "lemma_id");
								var bLastNode =	fx.isLastRowOf(this, oNodes);
								
								
								fn.callFunction("api.link_lemmata_as_brothers", [sLemId, sBrotherLemmaId], 
										
										function(){
											if (bLastNode)
												fn.refreshTable(t);										
										});
								
							});
							
							
							}
						else
							{
							alert("Kies een of meerdere sublemmata!");
							}
						
						
						}
					else
						{
						alert("Kies eerst een broer-lemma om mee te linken!");
						}
				}
			},
			"button_4": {
				
				"name": "Unlink broeder",
				"bgcolor":"red",
				"textcolor": "yellow",
				"click": function(t){
					
					var oNodes = fx.getSelectedRowsFrom(t);
					if (oNodes.any())
						{
						oNodes.every(function(){
							
							var sLemId =	fx.getDataFromCellInRow(this, "lemma_id");
							var bLastNode =	fx.isLastRowOf(this, oNodes);
							
							
							fn.callFunction("api.unlink_lemma", [sLemId], 
									
									function(){
										if (bLastNode)
											{
											fn.refreshTable(t);
											// reset: no chosen parent
											fn.setCustomButtonName(t, 2, "Kies broeder:");
											sBrotherLemmaId = null;		
											}
									});
							});
						}
					else
						{
						alert("Kies een of meerdere sublemmata!");
						}
					
					
				}
			},
			"button_5":{
				
				"name": "Paradigma_view",
				"bgcolor": "yellow",
				"textcolor": "black",
				"click": function(t){
					
					bReadableParadigmMode = true;		
					
					var xPos = $("#lemmata_en_paradigma_view_dynamic").css("left");
					var yPos = $("#lemmata_en_paradigma_view_dynamic").css("top");
					
					tb.destroyTable("lemmata_en_paradigma_view", function(){
						
						var sLemmaId = fx.getDataFromCellInRow(fx.getFirstSelectedRowFrom(t), "lemma_id");
						
						conf.changeTableConfigValue("lemmata_en_paradigma_view", "modern_lemma", "visible", false);
						conf.changeTableConfigValue("lemmata_en_paradigma_view", "lemma_gigpos", "visible", false);
						conf.changeTableConfigValue("lemmata_en_paradigma_view", "lem_keurmerk", "visible", false);
						conf.changeTableConfigValue("lemmata_en_paradigma_view", "gedrukt", "visible", false);
						conf.changeTableConfigValue("lemmata_en_paradigma_view", "online", "visible", false);
						
						fn.callDatabase(
								"lemmata_en_paradigma_view", 
								{"lemma_id": sLemmaId}, 
								function(){
									generateParadigmView();									
								}, 
								{"displaylength":"50", "top": yPos, "left": xPos}
								);
						});
					
				}
				
			},
			
			"button_6": {
				
				// molex  knop �verkleinwoord� aanmaken bij geselecteerd lemma
                // webservice van jesse wordt aangeroepen voor afbreking
                // dan dialog tonen met vooraf ingevoerde maar editeerbaar verkleinwoord
                //  en vooraf ingevoerde maar editeerbare afbreking,   en ook vooraf ingevoerde pos NOU-C(gender=n)
                //  link tussen lemma en verkleinwoord wordt automatisch aangemaakt,  en paradigma wordt gegenereerd  �. +s

				"name": "Maak verkleinwoord",
				"bgcolor": "white",
				"textcolor": "black",
				"click": function(t){
					
					var nRow = fn.getSelectedRowNodesFrom(t);
					var sLemma = fn.getDataFromCellInRowNode(nRow, "modern_lemma");
					var sLemmaPos = fn.getDataFromCellInRowNode(nRow, "lemma_gigpos");
					var sGloss = '';
					var sLemmaId = fn.getDataFromCellInRowNode(nRow, "lemma_id");
					var sZelfst = "L";
					
					
					// function for building new diminutive after user input
					
					var buildNewDiminutive = function(sPartLemmaId, sDimLemma, sLemmaPos, sGloss, sAfbr){

						fn.prompt(["Maak Verkleinwoord", "Voer in"], 
								["verkleinwoord", "lemma_gigpos", "gloss", "afbreking", "ook zelfstandig", "toon resultaat"], 
								[sDimLemma, sLemmaPos, sGloss, sAfbr, false, false], 
								function(resp){

									sDimLemma =	resp["verkleinwoord"];
									sLemmaPos =	resp["lemma_gigpos"];
									sGloss =	resp["gloss"];
									sAfbr = 	resp["afbreking"];
									sZelfst = 	(resp["ook zelfstandig"] == 'true' ? "ZL" : sZelfst);
									bTonen = 	(resp["toon resultaat"] == 'true');
									
									// create diminutive and paradigm
									
									fn.callFunction("api.insert_diminutive_build_paradigm_and_get_id", 
											[sDimLemma, sLemmaPos, sGloss, sAfbr], 
											function(resp){
										
												// get diminutive id and link with it
										
												var sDimLemId = resp["insert_diminutive_build_paradigm_and_get_id"];
										
												
													fn.callFunction("api.link_verkleinwoord", [sDimLemId, sPartLemmaId, sZelfst], function(){
													
														if (bTonen){
															//fn.callDatabase(t, {"lemma_id": "^("+sDimLemId+"|"+sPartLemmaId+")$"});
															fn.callDatabaseInNewTab("lemmata_en_paradigma_view", {"lemma_id": "^("+sDimLemId+"|"+sPartLemmaId+")$"}, null, paramsHash.get("db"));
															fn.refreshTable(t);
														}
														else{
															fn.message("OK", "Verkleinwoord '"+sDimLemma+"' (id "+sDimLemId+") aangemaakt");

															setTimeout(function(){
																fn.closeDialog();
																fn.refreshTable(t);
															}, 1000);
														}
														
													});										
												
										
									});
							
						});
					};
					
					// syllabify the lemma
					
					fn.callService("/Spelling/SpellingServices", {"action": "syllabify", "w": sLemma}, "GET", "json", function(json){
						
						var response = json["analyses"][0];
						var sSyllabifiedLemma = response["printForm"];
						var sSyllabifiedParts = response["parts"];
						
						// build a diminutive version and syllabify it 
						
						var sDimLemma = buildDiminutive(sSyllabifiedParts);
						
						fn.callService("/Spelling/SpellingServices", {"action": "syllabify", "w": sDimLemma}, "GET", "json", function(json){
							
							var response = json["analyses"][0];
							var sAfbr = response["printForm"];
							
							// change gender feature into neutral
							var iPosParenthesis = sLemmaPos.indexOf("(");
							if (iPosParenthesis>-1) 
								sLemmaPos = sLemmaPos.substring(0, iPosParenthesis);
							sLemmaPos = sLemmaPos+"(gender=n,number=sg)";
							
							
							// check if there already exists a lemma-diminutive-link
							
							fn.callFunction("api.find_diminutive_lemma", [sLemmaId], function(resp){
								
								var sDimLemId = resp["verkleinwoord_lemma_id"];
								
								if (sDimLemId != '')
									{
									
									fn.confirm(
											"Let op", 
											"Dit lemma heeft al een verkleinwoord (lemma_id "+sDimLemId+").<BR><BR>" +
												"Wilt u nog een verkleinwoord aanmaken?", 
											function(){										
												
												buildNewDiminutive(sLemmaId, sDimLemma, sLemmaPos, sGloss, sAfbr);												
											}, 
											function(){
												fn.message("OK", "Operatie door gebruiker geannuleerd");
											});
									}
								
								// if there isn't any lemma-diminutive-link yet
								else
									{
									// ask the user to input a suitable diminutive
									
									fn.prompt(["Maak Verkleinwoord", "Voer in"], 
											["verkleinwoord", "lemma_gigpos", "gloss", "afbreking", "ook zelfstandig", "toon resultaat"], 
											[sDimLemma, sLemmaPos, sGloss, sAfbr, false, false], 
											function(resp){
												
												// get the data possibly edited by the user
										
												sDimLemma =	resp["verkleinwoord"];
												sLemmaPos =	resp["lemma_gigpos"];
												sGloss =	resp["gloss"];
												sAfbr = 	resp["afbreking"];
												sZelfst = 	(resp["ook zelfstandig"] == 'true' ? "ZL" : sZelfst);
												bTonen = 	(resp["toon resultaat"] == 'true');
												
												// check if this diminutive already exists
												
												fn.callFunction("api.find_lemma", [sDimLemma, sLemmaPos], function(resp){
													
													var sExistingLemId = resp["lemma_id"];
													var sExistingLemma = resp["modern_lemma"];
													var sExistingGloss = resp["gloss"];
													var sExistingPos = resp["lemma_gigpos"];
													
													// there exists one, 
													// so: should we link with it
													//     or make a new one diminutive instead?
													
													if (sExistingLemId != '')
														{														
														// ask the user to select what he/she wants to do...
														
														var aOptions = [
																		 "Met deze diminutief koppelen?", 
																		 "Een andere diminutief aanmaken en daarmee koppelen?"
																		 ];
														
														fn.promptSelect(
																["OK", 
																 "Er bestaat een diminutief '"+sExistingLemma+"' <BR>" +
																 sExistingPos + " " + ( sExistingGloss != '' ? "(" + sExistingGloss + ") " : "" ) + "<BR>" +
																 "met lemma_id "+sExistingLemId +"<BR><BR>Wat wilt u doen?"], 
																aOptions, 
																null, 
																function(resp){																	
																	
																	// link with this pre-existing diminutive
																	
																	if (resp == aOptions[0] ){
																		fn.callFunction("api.link_verkleinwoord", [sExistingLemId, sLemmaId, sZelfst], function(){

																			if (bTonen){
																				//fn.callDatabase(t, {"lemma_id": "^("+sExistingLemId+"|"+sLemmaId+")$"});
																				fn.callDatabaseInNewTab("lemmata_en_paradigma_view", {"lemma_id": "^("+sExistingLemId+"|"+sLemmaId+")$"}, null, paramsHash.get("db"));
																				fn.refreshTable(t);
																			}
																			else{
																				fn.message("OK", "Gekoppeld met verkleinwoord '"+sExistingLemma+"' (id "+sExistingLemId+")");

																				setTimeout(function(){
																					fn.closeDialog();
																					fn.refreshTable(t);
																				}, 1000);
																			}
																			
																			});
																		}
																	
																	// create the diminutive we just entered and link with it 
																	
																	else if (resp == aOptions[1] )
																		{
																		// create diminutive and paradigm
																		
																		buildNewDiminutive(sLemmaId, sDimLemma, sLemmaPos, sGloss, sAfbr);
																		}
																	
																}, 
																function(){
																	fn.message("OK", "Operatie door gebruiker geannuleerd");
																}, 
																true);
														}
													
													// only possibility is to build a new diminutive
													else
														{
														fn.callFunction("api.insert_diminutive_build_paradigm_and_get_id", 
																[sDimLemma, sLemmaPos, sGloss, sAfbr], 
																function(resp){
															
																	// get diminutive id and link with it
															
																	var sDimLemId = resp["insert_diminutive_build_paradigm_and_get_id"];
															
																	fn.callFunction("api.link_verkleinwoord", [sDimLemId, sLemmaId, sZelfst], function(){

																		if (bTonen){
																			//fn.callDatabase(t, {"lemma_id": "^("+sDimLemId+"|"+sLemmaId+")$"});
																			fn.callDatabaseInNewTab("lemmata_en_paradigma_view", {"lemma_id": "^("+sDimLemId+"|"+sLemmaId+")$"}, null, paramsHash.get("db"));
																			fn.refreshTable(t);
																		}
																		else {
																			fn.message("OK", "Verkleinwoord '"+sDimLemma+"' (id "+sDimLemId+") aangemaakt");

																			setTimeout(function(){
																				fn.closeDialog();
																				fn.refreshTable(t);
																			}, 1000);
																		}
																		
																	});
															
																});
														}
													
													});	// end of search of pre-existing diminutive	
												
											}, 
											function(){
												fn.message("OK", "Operatie door gebruiker geannuleerd");
											}
											
										); // end of diminutive input dialog
												
									
									} // end of 'there is no diminutive link yet' 
								
							});
							
							
						});

					});
					
				}
				
			},
			
			"button_7": {
				
				"name": "MWE verbinden",
				"bgcolor": "lightgreen",
				"textcolor": "black",
				"click": function(t){
					
					// get the selected lemma
					var oRow = fx.getFirstSelectedRowFrom(t);
					var sMweLem = fx.getDataFromCellInRow(oRow, "modern_lemma");
					var sMweEntryType = fx.getDataFromCellInRow(oRow, "entry_type");
					var sMweLemId = fx.getDataFromCellInRow(oRow, "lemma_id");

					
					if ($.startsWith(sMweEntryType, "MWE")) {
						fnBuildMweLemmaLinks(sMweLemId, sMweLem);
					}
					else {
						fn.message("Let op", "Deze functie werkt alleen met MWEs");
					}					
					
				}
			},
			
//			"button_6": {
//			
//			"name": "deel-paradigma",
//			"bgcolor": "white",
//			"textcolor": "black",
//			"menu": {
//				
//				"VRB tegen. tijd": function(t){
//					
//					var oCurrentRow =	fx.getFirstSelectedRowFrom(t);
//					var sLemmaId =		fx.getDataFromCellInRow(oCurrentRow, "lemma_id");
//					
//					fn.callDatabase("lemmata_en_paradigma_view", 
//							{"lemma_id": sLemmaId, "wordform_gigpos": "VRB.+finiteness=fin.+tense=pres"},
//							function(){
//								fn.scrollToTable("lemmata_en_paradigma_view");
//								});
//				},
//				"VRB verl.tijd": function(t){
//					var oCurrentRow =	fx.getFirstSelectedRowFrom(t);
//					var sLemmaId =		fx.getDataFromCellInRow(oCurrentRow, "lemma_id");
//					
//					fn.callDatabase("lemmata_en_paradigma_view", 
//							{"lemma_id": sLemmaId, "wordform_gigpos": "VRB.+finiteness=fin.+tense=past"},
//							function(){
//								fn.scrollToTable("lemmata_en_paradigma_view");
//								});
//				},
//				"VRB inf en part": function(t){
//					var oCurrentRow =	fx.getFirstSelectedRowFrom(t);
//					var sLemmaId =		fx.getDataFromCellInRow(oCurrentRow, "lemma_id");
//					
//					fn.callDatabase("lemmata_en_paradigma_view", 
//							{"lemma_id": sLemmaId, "wordform_gigpos": "VRB.+finiteness=(inf|part)"},
//							function(){
//								fn.scrollToTable("lemmata_en_paradigma_view");
//								});
//				}
//			}
//		},
			
			"contextmenu": {
				
                // here the structure of the contextmenu is given
                "items": {                    
                    "unlink": {"name": "<b>Unlink verkleinwoord</b>", "isHtmlName": true}
                },
                // callback function called after the user has chosen an option in the context menu
                "callback": function(t, n, key, options) {
 
                	var oRow = fx.getRow(fn.getRowNode(n));
                	var sVerkleinwoordId = fx.getDataFromCellInRow(oRow, "lemma_id");
                	
                    // key indicates the option the user has chosen
                    if (key == 'unlink')
                    	{
                    	fn.callFunction("api.unlink_verkleinwoord", [sVerkleinwoordId], function(){
                    		
                    		fn.refreshTable(t);
                    		});
                    	}
                }
            }
			
			
		},
		
		mwe_to_link: {
			"size": "70%",
			"columns_sorting": {"modern_lemma": "asc"}
		}
		
};




// configuration at column level
oTableConfigurationList = {

		"*": {
			"*": {
				"class": "inlfont10pt",
			},
		},

		parents_children_pos_mismatch: {

			"parent_id": {
				"bgcolor": "green",
				"click": function(t, n){
					var sVal = fn.getDataFromCellNode(n);
					fn.callDatabase("lemmata", {"parent_id": sVal });
				}
			},
			"lemma_gigpos": {
				"editable": true
			},
			"pkid": {
				"visible": false
			}

		},

		spatielemmata: {

			"lemma_id": {
				"click": function(t, n){
					var sLemId = fn.getDataFromCellNode(n);
					fn.callDatabase("lemmata", {"lemma_id": sLemId}, function(){
						fn.callDatabase("lemmata_en_paradigma_view",  {"lemma_id": sLemId});
					});
				},
				"bgcolor": "#E0F8EC"
			}, 
			"parent": {}, 
			"parent_id": {
				"click": function(t, n){
					var sParentId = fn.getDataFromCellNode(n);
					fn.callDatabase("lemmata", {"parent_id": sParentId});
				},
				"bgcolor": "#E0F8EC"
			}, 
			"modern_lemma": {}, 
			"lemma_gigpos": {
				"editable": true,
				"bgcolor": "#E0F8EC",
				"editcallback": function(t, n, value){
					var sLemId = fn.getDataFromSiblingNode(n, "lemma_id");
					fn.updateDatabaseGivenFieldValues("lemmata", {"lemma_id": sLemId}, {"lemma_gigpos": value}, 
					function(){
						fn.refreshTable(t, function(){fn.refreshTable("lemmata")});
					},
					function(){
						fn.message("LET OP!", "De waarde '"+value+"' is hier niet toegestaan!");
					});
				}
			}, 
			"gedaan": {
				"editable": true,
				"bgcolor": "#E0F8EC"
			}, 
			"opmerking_intern": {
				"editable": true,
				"bgcolor": "#E0F8EC"
			},
			"keurmerk": {}, 
			"entry_type": {
				"editable": true,
				"bgcolor": "#E0F8EC",
				"editcallback": function(t, n, value){
					var sLemId = fn.getDataFromSiblingNode(n, "lemma_id");
					fn.updateDatabaseGivenFieldValues("lemmata", {"lemma_id": sLemId}, {"entry_type": value},
						function(){
							fn.refreshTable(t, function(){fn.refreshTable("lemmata")});
						},
						function(){
							fn.message("LET OP!", "Oei-oei!");
						}
					);
				}
			}, 
			"gloss": {}
		},


		uitspraak: {

			"id": {
				"visible": false
			},
			"lemma_id": {

			},
			"parent": {
				"visible": false
			},

			"modern_lemma": {
				// copy of same field in lemmata table
				"cell_tooltip": "Klik om naar de lemmata-tabel te gaan",
				"click": function(t, n){
					var sLemId = fn.getDataFromSiblingNode(n, "lemma_id");
					fn.callDatabase("lemmata", {"lemma_id": sLemId}, function(){
						fn.scrollToTable("lemmata");
					});
				},
				"bgcolor": "#E6F8E0"
			},
			"lemma_gigpos": {
				// copy of same field in lemmata table
			},
			"keurmerk": {
				// copy of same field in lemmata table
			},
			"online": {
				// copy of same field in lemmata table
			},
			"gloss": {
				// copy of same field in lemmata table
			},
			"homograaf": {
				// this shows if there are homonyms
			},

			"fonet1": fonetConfig1,	// visible by default
			"fonet2": fonetConfig1,
			"fonet3": fonetConfig1,
			"fonet4": fonetConfig1,
			"fonet5": fonetConfig1,
			"fonet6": fonetConfig2,	// NOT visible by default
			"fonet7": fonetConfig2,
			"fonet8": fonetConfig2,
			"fonet9": fonetConfig2,
			"fonet10": fonetConfig2,

			"fonetNL1": fonetConfigNL1,	// visible by default
			"fonetNL2": fonetConfigNL1,
			"fonetNL3": fonetConfigNL2,	// NOT visible by default
			"fonetNL4": fonetConfigNL2,
			"fonetNL5": fonetConfigNL2,
			"fonetNL6": fonetConfigNL2,
			"fonetNL7": fonetConfigNL2,
			"fonetNL8": fonetConfigNL2,
			"fonetNL9": fonetConfigNL2,
			"fonetNL10": fonetConfigNL2,

			"fonetB1": fonetConfigBE1,	// visible by default
			"fonetB2": fonetConfigBE1,
			"fonetB3": fonetConfigBE2,	// NOT visible by default
			"fonetB4": fonetConfigBE2,
			"fonetB5": fonetConfigBE2,
			"fonetB6": fonetConfigBE2,
			"fonetB7": fonetConfigBE2,
			"fonetB8": fonetConfigBE2,
			"fonetB9": fonetConfigBE2,
			"fonetB10": fonetConfigBE2,

			"opmerking": {
				"editable": true
			},
			"beoordeeld": {
				"editable": true
			},
			"provenance": {
				// kind of source field, to tell where fonet were imported from
			}


		},

		karakterskiezer: {

			"karakterskiezer": {
				
				"textsize": "20pt",
				
				"click": function( t, n ){
					
					// trick: https://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript
					
					
					// copy chars clicked upon
					
					var oCell = fx.getCell(n, "karakterskiezer");
					var oClickedUpon = fx.getWordClickedUponInCell(oCell);
					var sClickedUpon = oClickedUpon.text;
					
					// put the chars into an invisible textarea
					
					var tmpTextArea = $("<textarea></textarea>").attr("id", "aangeklikt_karakter").text(sClickedUpon);
					$("#temporary_stuff").append(tmpTextArea);
					
					// and select it!
					
					var copyChar = $('#aangeklikt_karakter');
					copyChar.select();
					
					try {
						// now copy it to clipboard
						
					    document.execCommand('copy');					    
					    
					    // confirm to user which chars he/she has chosen
					    fn.message("Gekozen karakter", "Gekozen karakter:<BR><BR>"+sClickedUpon);
					    
					    // remove temporary textarea
					    
					    $("#aangeklikt_karakter").remove();
					    
					    
					    setTimeout(function(){
					    	
					    	// remove message
					    	
							fn.closeDialog();
							
							// put focus onto the main table
						    // this will call a header function, which will make this table active
							
							$("#uitspraak_wrapper div.top").mousedown();	
							
						}, 1000);

					    
					  } catch (err) {
						  // tell user if something went wrong
						  
						  fn.message("Selectie mislukt. Klik nog een keer!");
					  }
					
					
				}
			}
		},


		external_links: {

			"linked": {
				"filter": true
			},

			"resource_type": {
				"choosefrom": []
			}
		},

			
		distinct_lemma_gigpos: {

			"lemma_gigpos": {
				"editable": true
			},
			"label_voor_entry_type_woord": {
				"editable": true
			},
			"label_voor_entry_type_mwe": {
				"editable": true
			},
			"opmerking": {
				"editable": true,
				"bgcolor": "#F8E0E6"
			}

		},

		distinct_wordform_gigpos: {
		
			"wordform_gigpos": {
				"editable": true
			},

			"rank": {
				"editable": true
			},
			"label_voor_entry_type_woord": {
				"visible": false
			},
			"label_voor_entry_type_mwe": {
                                "visible": false
                        },

			"entry_type_woord_groepslabel": {
				"bgcolor": "#F5ECCE",
				"editable": true
			},
			"entry_type_woord_positielabel": {
				"bgcolor": "#F5ECCE",
				"editable": true
			},
			"entry_type_mwe_groepslabel": {
				"bgcolor": "#E0ECF8",
				"editable": true
			},
			"entry_type_mwe_positielabel": {
				"bgcolor": "#E0ECF8",
				"editable": true
			},
			"opmerking": {
				"editable": true,
                                "bgcolor": "#F8E0E6"
			}
		},
		
		commission_report: {
			
			"unique_id": {
				"visible": false
			},
			
			"aandrager": {
				"editable": true,
				"bgcolor": "#E0F8EC"
			},
			
			"omschrijving": {
				"editable": true,
				"bgcolor": "#E0F8EC"
			},
			
			"besluit_cie": {
				"editable": true,
				"bgcolor": "#E0F8EC"
			}
		},
		
		subsets: {
			
			"subset": {
				"editable": true,				
				"editcallback": function(t, n, value){
					//updateSubsets();
				}
			},
			
			"geplande_uitleverdatum": {
				"editable": true
			},
			
			"uitgeleverd": {
				"editable": true
			},
			
			"omschrijving": {
				"editable": true
			}
		},
		
		
		nuancerende_opmerkingen:{
			
			short_code:{
				"colsort": "asc",
				"editable": true
			},
			nuancerende_opmerking:{
				"editable": true
				
			},
			opmerking:{
				"editable": true
			}
		},
		
		lemmata_en_paradigma_view: {
			
			"locked": {
				"visible": false
			},
			
			"tags": {

				"click": function(t, n){

					var sLemmaId = fn.getDataFromSiblingNode(n, "lemma_id");

					var fnTag = function(){

						var sCell = fn.getDataFromCellNode(n);
						var aAlreadyChosen = sCell.split("; ");
						if (aAlreadyChosen.indexOf("")>=0)
							aAlreadyChosen.splice( aAlreadyChosen.indexOf(""), 1 );

						var sNewTagLabel = "Nieuwe tag";
						var aItems = aAvailableTags.concat( [null, sNewTagLabel] );

						fn.promptSelect(["Maak een keuze", "Houd CTRL ingedrukt voor meervoudige keuze:"], aItems, aAlreadyChosen, 
							function(response){

								fn.closeDialog();

								// remove the empty choice, if other options were chosen as well
								if (response.length>1 && response.indexOf("")>-1)
									response.splice( response.indexOf(""), 1 );
								if (response.length>1 && response.indexOf(sNewTagLabel)>-1)
									response.splice( response.indexOf(sNewTagLabel), 1 );
							
								var sChosenItems = response.join('; ');
								fn.updateDatabaseGivenFieldValues("lemmata", {"lemma_id": sLemmaId}, {"tags": sChosenItems}, function(){
									fn.refreshTable(t);
								});								
							}, 
							function(){
								// Canceled by user
								// do nothing
							},
							function(sChosenItem){

								// user chooses to add variant
								if (sChosenItem == sNewTagLabel){

									fn.closeDialog();
									fn.prompt(["Nieuwe tag", "Voeg nieuwe tag toe"], ["Tag"], [""], 
										function(resp){
											
											aAvailableTags.push(resp["Tag"]);
											aAvailableTags.sort();

											// reopen this dialog
											fnTag();
										},
										function(){
											// reopen this dialog
											fnTag();
										}
									);
								}
							});

					};

					fnTag();

					
				}

			},

			// record id
			// NB: when a lemma has no paradigm attached, it has an empty rule instead, causing
			//     it to have an empty analyzed_wordform_id, which is why we need a separate non null unique_id
			unique_id:{
				"visible": false
			},
			analyzed_wordform_id:{
				"visible": false
			}, 
			 
			// lemma part
			lemma_id:{
				"visible": false,
				"click": function(t, n){
					
					var sLemmaId = fn.getDataFromCellNode(n);
					fn.callDatabase("lemmata", {"lemma_id": sLemmaId});
				}
			},
			modern_lemma:{
				
				"colsort": "asc",    // sort #1
				"click": function(t, n){
					
					var sLemmaId = fn.getDataFromSiblingNode(n, "lemma_id");
					fn.callDatabase("lemmata", {"lemma_id": sLemmaId});
				}
			}, 
			lemma_gigpos:{
				"click": function(t, n){
					var sLemmaId = fn.getDataFromSiblingNode(n, "lemma_id");
					fn.callDatabase("lemmata", {"lemma_id": sLemmaId});
				}
			}, 
			lem_keurmerk:{
				"click": function(t, n){
					var sLemmaId = fn.getDataFromSiblingNode(n, "lemma_id");
					fn.callDatabase("lemmata", {"lemma_id": sLemmaId});
				}
			},
			lem_source:{
				"visible": false,
				"click": function(t, n){
					var sLemmaId = fn.getDataFromSiblingNode(n, "lemma_id");
					fn.callDatabase("lemmata", {"lemma_id": sLemmaId});
				}
			},
			
			
			// wordform part
			wordform:{
				"editable": true,
				"editcallback": function(t, n, value){
					
					// if normal mode, just refresh
					if ( !bReadableParadigmMode )
						{
						fn.refreshTable(t);
						}
					
					// but if in 'readable paradigm mode',
					// call the paradigm building function automatically
					// (this will fill in automatically the missing wordforms where they can
					//  be derived from the wordform just entered by the user) 
					else
						{
						
						var sAwfId = fn.getDataFromSiblingNode(n, "analyzed_wordform_id");

						fn.callFunction("api.add_missing_paradigm", 
								[null, sAwfId], 
								function(){
									
									var aRecordIds = fn.getDataFromColumn(t, "unique_id");
							
									fn.getRecords(t, aRecordIds, function(records){
										
									var oRows = fx.getAllRows(t);
										
									oRows.every(function(){
										
										var oCurrentRow = this;
										var sRecordId = fx.getRowId(oCurrentRow);										
											fx.putDataIntoCell(oCurrentRow, "wordform", records[sRecordId]["wordform"]);										
										
										});
									
										
										// gather wordforms to look up
										// in syllabificator werbservice
										
										var aWordformsToLookup = new Array();
										
										oRows.every(function(){
											
											var oCurrentRow = this;
											
											var sWordform =		fx.getDataFromCellInRow(oCurrentRow, "wordform");
											var sWordformAfbr =	fx.getDataFromCellInRow(oCurrentRow, "wordform_afbr");
											
											// we have a wordform but no abbreviation
											// so we'll have to look up this word
											
											if (sWordform != '' && sWordformAfbr == ''
												&& 
												$.inArray(sWordform, aWordformsToLookup)<0 
												&& 
												sWordform != '[VULIN]'
												)
												{
												aWordformsToLookup.push(sWordform);
												}			
										});
										
										
										// do the look up now!
										fn.callService("/Spelling/SpellingServices", 
														{"action": "syllabify", "w": aWordformsToLookup.join(" ")}, 
														"GET", "json", function(json){
												
															var response = json["analyses"][0];
															var aWordForms =	(response["word"]).split(" ");
															var aAbbreviations = (response["printForm"]).split(" ");
															
															oRows.every(function(){
																
																var oCurrentRow = this;
					
																var sWordform =		fx.getDataFromCellInRow(oCurrentRow, "wordform");
																var sWordformAfbr =	fx.getDataFromCellInRow(oCurrentRow, "wordform_afbr");
																
																if (sWordform != '' && sWordformAfbr == '')
																	{
																	var indexOfAbbreviation = $.inArray(sWordform, aWordForms);
																	var sNewAbbreviation = aAbbreviations[indexOfAbbreviation];
																	if (sNewAbbreviation!=null)
																		{
																	fx.updateDatabaseGivenACellOrRow(oCurrentRow, {"wordform_afbr": sNewAbbreviation});
																	fx.putDataIntoCell(oCurrentRow, "wordform_afbr", sNewAbbreviation);
				}
																	
																	}
															});
															
														}); // end of service call
										
										}); // end of get records for wordforms		
									
									}); // end of add_missing_paradigm call
						
						} // end of paradigm view part			
					
				} // end of edit callback 
			},
			th_wordform:{
				"bgcolor": "#E0F8EC",
				"editable": true
			},
			wordform_id:{
				"visible": false
			},
			wf_source:{
				"visible": false
			},
			wordform_afbr:{				
				"editable": true,
				"editcallback": function(t, n, value){
					
					// if normal mode, just refresh
					if ( !bReadableParadigmMode )
						{
						fn.refreshTable(t);
						}
					
					// but if in 'readable paradigm mode',
					// call the paradigm building function automatically
					// (this will fill in automatically the missing wordforms abbreviation where they can
					//  be derived from the abbreviation just entered by the user)
					else
						{
						
						var sAwfId = fn.getDataFromSiblingNode(n, "analyzed_wordform_id");

						fn.callFunction("api.add_missing_paradigm", 
								[null, sAwfId], 
								function(){
									
										
											
										
									}); // end of add_missing_paradigm-call
									
						} // end of paradigm-view mode part 			
					
				} // end of edit callback

			},		
			th_wordform_afbr:{
				"bgcolor": "#E0F8EC",
				"editable": true
			},
			wordform_gigpos:{
				"editable": true,
                                "editerrorhandler": function(jqXHR, textStatus, errorThrown){
                                   fn.message("Foute boel!", "alert: ongeldige waarde voor veld wordform_gigpos!", function(){fn.refreshTable("lemmata_en_paradigma_view");});
                                 },

				"editcallback": function(t, n, value){
					
					var oCell = fx.getCell(n);
					
					// get the rank corresponding to this pos
					// (we need to escape the parenthesis, as Lex'it cannot know those are no
					//  part of any regex)
					fn.getRecordGivenFieldValues("distinct_wordform_gigpos", {"wordform_gigpos": fn.escapeRegexChars(value)}, 
							function(record){
							
								var sRankvalue = record["rank"];								
								var iRankvalue = (typeof sRankvalue != 'undefined') ? parseInt(sRankvalue) : 0;
								
								
								fx.updateDatabaseGivenACellOrRow(oCell, {"rank": iRankvalue}, function(){
									
									// update rank in the analyzed_wordforms too
									
									var sAwfId = fx.getDataFromSiblingCell(oCell, "analyzed_wordform_id");
									
									fn.updateDatabaseGivenFieldValues("analyzed_wordforms", 
											{"analyzed_wordform_id": sAwfId}, 
											{"rank": iRankvalue},
											function(){
												// refresh to make sorting according to 
												// paradigm position visible 
												fn.refreshTable(t, function(){
													
													fn.callFunction("api.check_analyzedwordforms", 
															[sAwfId],
															function(response){
																processAwfCheck(sAwfId, response);
																});
														});
												
													}
												);
									
								});								
								
						});					
					
				}
			},
			rank:{
				"colsort": "asc",    // sort #2
				"visible": false
			},
			
			flex: {
				
			},
						
			// quality status
			gedrukt:{
				
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

			arch:{
				"bgcolor": "#E0F8EC",
				"editable": true

			}, 
			
			// comments
			opmerking_extern:{
				"bgcolor": "#E0F8EC",
				"editable": true

			},
			opmerking_intern: {
				
				// BEWARE, DON'T REMOVE THIS PART
				// ------------------------------
				"flexible_visibility": false,
				"visible": (document.URL.indexOf( "inl.loc" )>-1),
				// ------------------------------
				
				"bgcolor": "#E0F8EC",
				"editable": true

			},
			
			
			vk_status:{
				"visible": false
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
				"bgcolor": "#F5A9BC",
				"click": function(t, n){
					var sLemmId = fn.getDataFromCellNode(n);
					fn.callTable("lemmata", {"lemma_id": sLemmId});
				}
			},
			main_lemma: {
				"bgcolor": "#F8E0E6"
			},
			main_gigpos: {
				"bgcolor": "#F8E0E6"
			},
			main_gloss: {
				"bgcolor": "#F8E0E6"
			},
			main_keurmerk: {
				"bgcolor": "#F8E0E6",
				"nice_name": "main keurmerk"
			},
			main_online: {
				"bgcolor": "#F8E0E6",
				"nice_name": "main online"
			},
			part_morphological_analysis_id: {
				"visible": false
			},
			part_lemma_id: {
				"bgcolor": "#A9F5BC",
				"click": function(t, n){
					var sLemmId = fn.getDataFromCellNode(n);
					fn.callTable("lemmata", {"lemma_id": sLemmId});
				}
			},
			part_lemma: {
				"bgcolor": "#E0F8E0"
			},
			part_gigpos: {
				"bgcolor": "#E0F8E0"
			},
			part_gloss: {
				"bgcolor": "#E0F8E0"
			},
			part_keurmerk: {
				"bgcolor": "#E0F8E0",
				"nice_name": "part keurmerk"
			},
			part_online: {
				"bgcolor": "#E0F8E0",
				"nice_name": "part online"
			},
			description:{
				"click": function(t, n){

					var sCurrentValue = fn.getDataFromCellNode(n);
					var sCurrentMorphAnalysisId = fn.getDataFromSiblingNode(n, "morphological_analysis_id");

					var sMakeNewOperationText = "Maak nieuw morfologische operatie-type aan";

					fn.callFunction("api.get_morphological_operations", [], function(resp){

						var aDescriptions = (resp["descr"]).split(ARG_INTERNAL_SEPARATOR);
						var aMorphOperationIds = (resp["morph_operation_id"]).split(ARG_INTERNAL_SEPARATOR);

						// operations list
						var aAllOptions = cloneArray(aDescriptions);
						// add room under the list
						aAllOptions.push(null); 
						// add final option: make new one!
						aAllOptions.push(sMakeNewOperationText);

						fn.promptSelect(["Kies operatie-type", "Kies morfologische operatie-type, of annuleer"], aAllOptions, [sCurrentValue], 
							function(aNewChosen){

								var sChoice = aNewChosen[0];
								var iSelectedItem = aDescriptions.indexOf(sChoice);

								// if a new operation type must be assign

								if (sChoice == sMakeNewOperationText){

									fn.prompt(["Nieuw operatie-type aanmaken", "Declareer een nieuw morfologische operatie-type"], 
										["description", "resulting_part_of_speech"], 
										["", ""],
										function(resp){

											var sNewDescription = resp["description"];
											var sNewPartOfSpeech = resp["resulting_part_of_speech"];

											// insert the new operation type and get its id back, so as to be able to assign it to the current analaysis
											fn.insertIntoTable("morphological_operations", {"description": sNewDescription, "resulting_part_of_speech": sNewPartOfSpeech}, "morphological_operation_id",
												function(sNewMorphOpId){

													// assigh this morphological_analysis_id to the current analysis
													fn.updateTableGivenFieldValues("morphological_analyses", 
														{"morphological_analysis_id": sCurrentMorphAnalysisId}, 
														{"morphological_operation_id": sNewMorphOpId},
														function(resp){
															// refresh table to show the result in the GUI
															fn.refreshTable(t);
														}
													);

												},
												function(){
													fn.message("OK", "Operatie door gebruiker geannuleerd");
												}
											);

										} 
									); 
									
								}

								// else normal case: assign a ready-made operation type

								else {

									// get the morphological_analysis_id, given the selected operation type
									var sNewMorphOpId = aMorphOperationIds[ iSelectedItem ];

									// assigh this morphological_analysis_id to the current analysis
									fn.updateTableGivenFieldValues("morphological_analyses", 
										{"morphological_analysis_id": sCurrentMorphAnalysisId}, 
										{"morphological_operation_id": sNewMorphOpId},
										function(resp){
											// refresh table to show the result in the GUI
											fn.refreshTable(t);
										}
									);

								}

							},
							function(){
								fn.message("OK", "Operatie door gebruiker geannuleerd");
							},
							true
						);
					});

				}
			},
			originalsource_id: {
				"visible": false
			},
			source_name: {
				"nice_name": "link_provenance"
			},
			resulting_part_of_speech: {
				"visible": false
			}
		},
		
		
		werkwoord_features: {
			
			"lemma_id": {
				"click": function(t, n){
					var sLemId = fn.getDataFromCellNode(n);
					fn.callDatabase("lemmata", {"lemma_id": sLemId});
				}
			},
			
			"hulpww_zijn": {
				"editable": true, 
				"bgcolor": "#CBF3D5",
				"editcallback": function(t, n, value){					
					var nRow = fn.getRowNode(n);
					fn.callRecord(nRow, ["hulpww_zijn", "hulpww_hebben", "hulpww_beide", "refl", "trans", "intrans", "onpers", "summary", "beoordeeld"]);
					fn.refreshTable("lemmata");
				}
			},
			"hulpww_hebben": {
				"editable": true, 
				"bgcolor": "#CFF1B8",
				"editcallback": function(t, n, value){
					var nRow = fn.getRowNode(n);
					fn.callRecord(nRow, ["hulpww_zijn", "hulpww_hebben", "hulpww_beide", "refl", "trans", "intrans", "onpers", "summary", "beoordeeld"]);
					fn.refreshTable("lemmata");
				}
			},
			"hulpww_beide": {
				"editable": true, 
				"bgcolor": "#CBF3D5",
				"editcallback": function(t, n, value){
					var nRow = fn.getRowNode(n);
					fn.callRecord(nRow, ["hulpww_zijn", "hulpww_hebben", "hulpww_beide", "refl", "trans", "intrans", "onpers", "summary", "beoordeeld"]);
					fn.refreshTable("lemmata");
				}
			},
			
			"refl": {
				"editable": true, 
				"bgcolor": "#F3E4C4",
				"editcallback": function(t, n, value){
					var nRow = fn.getRowNode(n);
					fn.callRecord(nRow, ["hulpww_zijn", "hulpww_hebben", "hulpww_beide", "refl", "trans", "intrans", "onpers", "summary", "beoordeeld"]);
					fn.refreshTable("lemmata");
				}
			},
			"trans": {
				"editable": true, 
				"bgcolor": "#F1DFB8",
				"editcallback": function(t, n, value){
					var nRow = fn.getRowNode(n);
					fn.callRecord(nRow, ["hulpww_zijn", "hulpww_hebben", "hulpww_beide", "refl", "trans", "intrans", "onpers", "summary", "beoordeeld"]);
					fn.refreshTable("lemmata");
				}
			},
			"intrans": {
				"editable": true, 
				"bgcolor": "#F3E4C4",
				"editcallback": function(t, n, value){
					var nRow = fn.getRowNode(n);
					fn.callRecord(nRow, ["hulpww_zijn", "hulpww_hebben", "hulpww_beide", "refl", "trans", "intrans", "onpers", "summary", "beoordeeld"]);
					fn.refreshTable("lemmata");
				}
			},
			"onpers": {
				"editable": true, 
				"bgcolor": "#F1DFB8",
				"editcallback": function(t, n, value){
					var nRow = fn.getRowNode(n);
					fn.callRecord(nRow, ["hulpww_zijn", "hulpww_hebben", "hulpww_beide", "refl", "trans", "intrans", "onpers", "summary", "beoordeeld"]);
					fn.refreshTable("lemmata");
				}
			},
			
			"summary": {
				"visible": false
			},
			
			"beoordeeld": {
				"editable": true, 
				"bgcolor": "#F27858",
				"editcallback": function(t, n, value){
					var nRow = fn.getRowNode(n);
					fn.callRecord(nRow, ["hulpww_zijn", "hulpww_hebben", "hulpww_beide", "refl", "trans", "intrans", "onpers", "summary", "beoordeeld"]);
					fn.refreshTable("lemmata");
				}
			}
			
		},	

		

		lemmata: {

			"locked": {
				"visible": false
			},
			
			"ww_feat": {
				"click": function(t, n){
					var  sLemmaId = fn.getDataFromSiblingNode(n, "lemma_id");
					fn.callDatabase("werkwoord_features", {"lemma_id": sLemmaId}, function(){fn.scrollToTable("werkwoord_features");});
				}
			},

			"entry_type": {
				"editable": true
			},
			
			"gb_superid": {"visible": false},
			"gb_wrdcat": {"visible": false},
			"gb_znwlid": {"visible": false},
			"lidw": {"visible": false},
			"geslacht": {"visible": false},
			"creation_date": {"visible": false},
			"creation_time": {"visible": false},
			"vorig_gedrukt": {"visible": false},
			"vorig_online": {"visible": false},
			
            "source": {
                //"editable": superUser()
            	"click": function(t, n){
            		if (superUser()) { 
            			var sContent = fn.getDataFromCellNode(n);
            			var sAnders = "Anders";
            			var aSourcesToChooseFrom = ["ANW-koppeling", sAnders];
            			
            			fn.promptSelect(["Kies source", "Kies source"], aSourcesToChooseFrom, [],
        						
        						function(aChoice){
            				
            						var sChoice = aChoice[0];
            						
            						if (sChoice == sAnders) {
            							fn.prompt("Vul in", ["source"], [sContent], 
            								function(sourceRep){
            									fn.updateDatabaseGivenANode(n, {"source": sourceRep["source"]}, function(){
            										fn.refreshTable(t);
            									});
            								}, 
            								function(){
                								fn.message("OK", "Operatie door gebruiker geannuleerd");
                							},
        									true,
        									[30,5]);
            						}
            						else {
            							fn.updateDatabaseGivenANode(n, {"source": sContent + (sContent == ""?"":"; ") + sChoice}, 
            								function(){
        										fn.refreshTable(t);
            								});
            						}
        							
        						}, 
        						function(){
        							fn.message("OK", "Operatie door gebruiker geannuleerd");
        						}, 
        						true); // only one choice allowed
        			}
            	}
            },
			
            "subset": {
            	//"choosefrom": [],@@@@
                //"editable": superUser(),
            	"click": function(t, n){
            		if (superUser() || fn.getCurrentUser() == 'marjolijn') {
            			var aSubsetsToChooseFrom;
            			var aAlreadyChosen = fn.getDataFromCellNode(n);
            			fn.callFunction("api.get_not_yet_released_subsets", [], function(resp){
            				
            				aSubsetsToChooseFrom = (resp["get_not_yet_released_subsets"]).split("\|");
            				fn.promptSelect(["Lijst van nog niet uitgevoerde releases", "Kies subset"], aSubsetsToChooseFrom, aAlreadyChosen,
            						
            						function(aChoice){
            							fn.updateDatabaseGivenANode(n, {"subset": aChoice[0]}, function(){
            									fn.refreshTable(t);
            							});
            						}, 
            						function(){
            							fn.message("OK", "Operatie door gebruiker geannuleerd");
            						}, 
            						true); // only one choice allowed
            				
            			});
            		}
            	},
//                "editcallback": function(t, n, value){
//                	fn.callFunction("api.check_subset_is_already_released", [value], function(response){
//                		
//                		if (response["check_subset_is_already_released"] == 't')
//                			{
//                			fn.message("Let op!", "Release '"+value+"' kan niet gekozen worden: deze is al uitgevoerd.");
//                			fn.updateDatabaseGivenANode(n, {"subset": n.revert}, function(){
//                				fn.refreshTable(t);
//                				});
//                			}
//                	});
//                }
            },
			
			// lemma_id
			"lemma_id":{				
				"visible": true
			},
			"gb_id":{		
				"visible": false		
				//"editable": superUser()
			},
			
			
			// parent
			
			"parent": {
				"cell_tooltip": "Toon alle lemmata behorend bij dit superlemma",
				"click": function(t, n){
					
					var sLemma = fn.getDataFromCellNode(n);
					
					if (sLemma!='')
						fn.callDatabase(t, {"parent": sLemma});
				},
				"visible": true
			},
			"parent_id": {
				"visible": false
			},
			
			// lemma part
			"modern_lemma": {		
				
				"colsort": "asc",
				"editable": true,
				"editfunc": function( t, n, value){
					
					var lemId = fn.getRowNodeId(n);
					
					fn.callFunction("api.find_existing_lemma", 
							[value, null], 
							function(response){
								resp = response["find_existing_lemma"];
								
								// lemma exists! What now?
								if (resp != null && resp != '')
									{
									fn.confirm("Let op!", "U heeft de spelling van het lemma veranderd naar '"+value+"'.<BR><BR>" +
											"In de database bestaat echter al het volgende: "+resp+"<BR>" +
											"Weet u zeker dat u dit lemma zo wilt aanpassen?", 
											function(){
										
												fn.updateDatabaseGivenANode(n, {"modern_lemma": value});
										
											}, 
											function(){
												
												fn.message("OK", "Operatie door gebruiker geannuleerd.");
												fn.refreshTable(t);
												
											});
									}
						
								// normal behaviour
								else
									{
									fn.updateDatabaseGivenANode(n, {"modern_lemma": value});										
									}						
						
					});
				}
			},

			"tags": {

				"visible": false,
				"click": function(t, n){

					var sLemmaId = fn.getDataFromSiblingNode(n, "lemma_id");

					var fnTag = function(){

						var sCell = fn.getDataFromCellNode(n);						
						var aAlreadyChosen = sCell.split("; ");
						if (aAlreadyChosen.indexOf("")>=0)
							aAlreadyChosen.splice( aAlreadyChosen.indexOf(""), 1 );

						var sNewTagLabel = "Nieuwe tag";
						var aItems = aAvailableTags.concat( [null, sNewTagLabel] );

						fn.promptSelect(["Maak een keuze", "Houd CTRL ingedrukt voor meervoudige keuze:"], aItems, aAlreadyChosen, 
							function(response){

								fn.closeDialog();

								// remove the empty choice, if other options were chosen as well
								if (response.length>1 && response.indexOf("")>-1)
									response.splice( response.indexOf(""), 1 );
								if (response.length>1 && response.indexOf(sNewTagLabel)>-1)
									response.splice( response.indexOf(sNewTagLabel), 1 );
							
								var sChosenItems = response.join('; ');
								fn.updateDatabaseGivenANode(n, {"tags": sChosenItems}, function(){
									fn.refreshTable(t);
								});
								
							}, 
							function(){
								// Canceled by user
								// do nothing
							},
							function(sChosenItem){

								// user chooses to add variant
								if (sChosenItem == sNewTagLabel){

									fn.closeDialog();
									fn.prompt(["Nieuwe tag", "Voeg nieuwe tag toe"], ["Tag"], [""], 
										function(resp){
											
											aAvailableTags.push(resp["Tag"]);
											aAvailableTags.sort();

											// reopen this dialog
											fnTag();
										},
										function(){
											// reopen this dialog
											fnTag();
										}
									);
								}
							});

					};

					fnTag();

					
				}

			},
			
			"lemma_gigpos": {				
				"editable": true,
				"editerrorhandler": function(jqXHR, textStatus, errorThrown){
					fn.message("Foute boel!", "alert: ongeldige waarde voor veld lemma_gigpos!", function(){fn.refreshTable("lemmata");});
					},


//				"click": function(t, n){
//					
//					var oCell = fx.getCell(n, "modern_lemma");
//					var lemmaform = fx.getDataFromCell(oCell);
//					
//					fn.showProcessingMsg(t);
//					
//					fn.callFunction("api.get_biggest_final_matcher", [lemmaform], function(output){
//						
//						fn.removeProcessingMsg(t);
//						fn.message("Resultaat", output["get_biggest_final_matcher"]);
//					});
//					
//				},
				"editcallback": function(t, n, value){

					var iLemmaId = fn.getDataFromSiblingNode(n, "lemma_id");

					// synchronize with spatielemmata
					fn.updateDatabaseGivenFieldValues("spatielemmata", {"lemma_id": iLemmaId}, {"lemma_gigpos": value});
					
					// make sure the menu disappear in IE
					$(".ui-menu-item").hide();
				}
			},
			"sublemma_type": {				
				"editable": true,
				"validator": "shift"
			},	
			"th_lemma": {				
				"editable": true				
			},
			
			
			// comments
			"opmerking": {				
				"visible": false // this column is only for transit of opmerking_extern
				
				
			},
			"opmerking_extern": {				
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
			
			
			
			// gloss etc
			"gloss": {				
				"editable": true				
			},
			"gloss_intern": {				
				"editable": true				
			},
			"nuanc_opm": {
				"editable": true,
				"dblclick": function(t, n){
					
					var sNuancOpm = fn.getDataFromCellNode(n);
					fn.callDatabase("nuancerende_opmerkingen", {"short_code": "exact:"+sNuancOpm});
				},
				"editerrorhandler": function(jqXHR, textStatus, errorThrown){
					fn.message("Let op!", "U probeert in veld 'nuanc_opm' een ongeldige waarde in te voeren!<BR><BR>Gebruik de waarden aangeboden door de autocomplete-functie!", function(){fn.refreshTable("lemmata");});
					}
			},
			"kapstok": {
				"visible": false,
				"editable": true
			},
			"trademark": {
				"editable": true,
				"visible": false
			},
			"taaladvies": {
				"class": "inlfont10pt nobreak",
				"editable": true,
				"editfunc": function(t, n, value){
					value = value.replace(/https:\/\/taaladvies.net/, '');
					fn.updateTableGivenANode(n, {"taaladvies": value }, function(){
						fn.refreshTable(t);
					});
				}
			},
			"uitspraak": {
				"class": "nobreak",
				"visible": false,
				"searchform": function(value){ 
					return value.replace(/g/g, "ɡ"); // automatically translate the generic 'g' into a phonetic 'g'
				}
				// mustn't be editable, since it's automatically filled with content from uitspraak table
			},
			"status": {
				"editable": true
			},
				
						
			
			// buttons
			"toon_paradigma":{
				"visible": false,
				"button": "Paradigma",
				"click": function(t, n){	
					
					var lemma_id = fn.getDataFromSiblingNode(n, "lemma_id");
					
					fn.callDatabase("lemmata_en_paradigma_view", 
							{"lemma_id": lemma_id}, 
							function(){
								fn.scrollToTable("lemmata_en_paradigma_view");
							}, 
							{ignore_initialisation_filters: true});
				}
			},
			"toon_morfologie":{
				"visible": false,
				"button": "Morfologie",
				"button_tooltip": "Toon hoofdlemma<BR>[+Shift] Toon constructies met dit lemma",
				"click": function(t, n){	
					
					var lemma_id = fn.getDataFromSiblingNode(n, "lemma_id");
					if (kf.isPressed("shift")){
						fn.callDatabase("morphological_view", 
							{"part_lemma_id": lemma_id}, 
							function(){
								fn.scrollToTable("morphological_view");
							});
					}
					else {
						fn.callDatabase("morphological_view", 
							{"main_lemma_id": lemma_id}, 
							function(){
								fn.scrollToTable("morphological_view");
							});

					}
					
				}
			},
			
						
			
			// origin
			"taalvariant": {
				"editable": true
			},
			"herkomst": {
				"editable": true,
				"visible": false
			},
			
			
			// quality status
			"gedrukt": {
				"editable": (fn.getCurrentUser()=='katrien'  
							|| fn.getCurrentUser()=='katrienvp' 
							|| fn.getCurrentUser()=='mathieu'  // temporarily
					), // only Katrien is entitled to change that
				"editcallback": function(t, n, value){
					// setting gedrukt=true automatically means online=true
					if (value == true)
						{					
						fn.updateDatabaseGivenANode(n, {"online":value}, function(){
								fn.refreshTable(t);
							});
						}
				}
			},
			"online": {
				"bgcolor": "#E0F8EC",
				"editable": true 

			},
			"keurmerk": {				
				"editable": true				
			},
			
			"has_fonet": {
				"visible": false
			},
			
			"verkleinwoord": {
				"editable": true
			}
			
			// "anc":{
			// 	"editable": fn.getCurrentUser()=='katrien', // only Katrien is entitled to change that
			// 	"editcallback": function(t, n, value){
					
			// 		var sLemmaId = fn.getDataFromSiblingNode(n, "lemma_id");
					
			// 		fn.updateDatabaseGivenFieldValues(
			// 				"surinaams_and_antilliaans_commissions_selections", 
			// 				{"lemma_id": sLemmaId}, 
			// 				{"anc": value});
			// 	}
			// },
			// "snc":{
			// 	"editable": fn.getCurrentUser()=='katrien', // only Katrien is entitled to change that
			// 	"editcallback": function(t, n, value){
					
			// 		var sLemmaId = fn.getDataFromSiblingNode(n, "lemma_id");
					
			// 		fn.updateDatabaseGivenFieldValues(
			// 				"surinaams_and_antilliaans_commissions_selections", 
			// 				{"lemma_id": sLemmaId}, 
			// 				{"snc": value});
			// 	}
			// }
			
		},
		


		
		export_versions:{
			"id":{
				"colsort": "desc"
			},
			"naam_oplevering": {
				"editable": true
			},
			"opmerking": {
				"editable": true
			},
			"datum_oplevering":{
				"click": function(t, n){
					
					// is there some date already filled in?
					var sPreFilled = fn.getDataFromCellNode(n);
					var sDay = null, sMonth = null, sYear = null;
					
					// generate select values for date
					var aDays = 		generateSeries(1, 31, true);
					var aMonths = 		generateSeries(1, 12, true);
					var iCurrentYear =	new Date().getFullYear();
					var aYears = 		generateSeries(iCurrentYear-10, iCurrentYear, false);
					
					// pre-select the values that were already filled in, if any
					if (sPreFilled != '')
						{
						var aPrefilled = sPreFilled.split("-");
						sYear = 	aPrefilled[0];
						sMonth =	aPrefilled[1];
						sDay = 		aPrefilled[2];
						
						aYears[ aYears.indexOf(sYear) ] =		sYear+"::selected";
						aMonths[ aMonths.indexOf(sMonth) ] =	sMonth+"::selected";
						aDays[ aDays.indexOf(sDay) ] = 			sDay+"::selected";						
						}
					
					fn.prompt(["Datum oplevering", "Kies de datum van de oplevering"], 
							["Dag", "Maand", "Jaar"], 
							[aDays, aMonths, aYears], 
							function(resp){
						
								var aNewDate = [ resp["Jaar"], resp["Maand"], resp["Dag"] ];
								var sNewDate = aNewDate.join("-");
						
								fn.updateDatabaseGivenANode(n, {"datum_oplevering": sNewDate}, function(){
									fn.refreshTable(t);
								});
						
							}, 
							function(){
								
								fn.message("OK", "Operatie geannuleerd door gebruiker");
								
							});
									
				}
			},
			"datum_online":{
				"click": function(t, n){
					
					// is there some date already filled in?
					var sPreFilled = fn.getDataFromCellNode(n);
					var sDay = null, sMonth = null, sYear = null;
					
					// generate select values for date
					var aDays = 		generateSeries(1, 31, true);
					var aMonths = 		generateSeries(1, 12, true);
					var iCurrentYear =	new Date().getFullYear();
					var aYears = 		generateSeries(iCurrentYear-10, iCurrentYear, false);
					
					// pre-select the values that were already filled in, if any
					if (sPreFilled != '')
						{
						var aPrefilled = sPreFilled.split("-");
						sYear = 	aPrefilled[0];
						sMonth =	aPrefilled[1];
						sDay = 		aPrefilled[2];
						
						aYears[ aYears.indexOf(sYear) ] =		sYear+"::selected";
						aMonths[ aMonths.indexOf(sMonth) ] =	sMonth+"::selected";
						aDays[ aDays.indexOf(sDay) ] = 			sDay+"::selected";						
						}
					
					fn.prompt(["Datum online", "Kies de online-datum"], 
							["Dag", "Maand", "Jaar"], 
							[aDays, aMonths, aYears], 
							function(resp){
						
								var aNewDate = [ resp["Jaar"], resp["Maand"], resp["Dag"] ];
								var sNewDate = aNewDate.join("-");
						
								fn.updateDatabaseGivenANode(n, {"datum_online": sNewDate}, function(){
									fn.refreshTable(t);
								});
						
							}, 
							function(){
								
								fn.message("OK", "Operatie geannuleerd door gebruiker");
								
							});
									
				}
			}
			
		},
		
		mwe_to_link: {

			"pkid": {
				"visible": false
			},
			
			"lemma_id": {
				"bgcolor": "lightgreen",
				"click": function(t, n){
					var sLemId = fn.getDataFromCellNode(n);
					fn.callDatabase("lemmata", {"lemma_id": sLemId}, function(){
						fn.callDatabase("related_lemmata", {"one_lemma_id": sLemId});
					});
					
				}
			},

			"opmerking_intern": {
				"editable": true
			}
		}
		
		
};




$(document).ready(function() {
	
	// if gig-pro is accessed the normal way (not with parameters), update the counts
	if (getHttpParams() != null){

		fn.callFunction("api.update_count_in_distinct_lemma_gigpos", [], 

			// callback when done with distinct_lemma_gigpos
			function(){

				fn.callFunction("api.update_count_in_distinct_wordform_gigpos", [],

					// callback when done with distinct_wordform_gigpos
					function(){
						// we're done
					},
				
					// error handler for distinct_wordform_gigpos
					function(){					
						fn.message("Let op", "Het updaten van distinct_wordform_gigpos is mislukt.");
					}
				);
			},

			// error handler for distinct_lemma_gigpos
			function(){
				fn.message("Let op", "Het updaten van distinct_lemma_gigpos is mislukt.");
			}
		);
	}

});

