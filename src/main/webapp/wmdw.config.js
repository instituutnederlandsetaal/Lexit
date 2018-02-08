// list of tables that must be hidden or visible (don't use both, it's a matter of what's the most convenient)
oHiddenTablesList = ["submissions", "votes"];
oShowOnlyTables = [];



function classify(t, field){
	
	var sTableName = fx.getTableName(t);
	var sLastRowId = "";
	
	(fx.getAllRows(t)).every(function(){
		
		var oCurrentRow = this;
		var sCurrentRowId = fx.getDataFromCellInRow(oCurrentRow, field);
		
		if (sCurrentRowId.trim().toLowerCase() != sLastRowId.trim().toLowerCase() 
				&& sLastRowId != "")
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
};


function showWordInSubmissions(t, n){
	
	var sWoord = fn.getDataFromCellNode(n);
	fn.callDatabase("submissions", {"woord": "exact:"+sWoord});
	
};

var sBasicData = "Ruwe data van website";
var sNaamFase1 = "Views bij inzendingen (submissions)";
var sNaamFase2 = "Views bij genomineerden (votes)";



// table general settings
oTableSettingsList = {
		
		// ======
		// basic
		// ======
		
		all_submissions : {
			
			"group": sBasicData, 
			"displaylength": 50
		},
		
		all_votes : {
			
			"group": sBasicData, 
			"displaylength": 50
		},
		
		
		
		// ======
		// fase 1
		// ======
		
		inzendingen_met_motivering: {
			
			"group": sNaamFase1,
			
			"size": "60%",
			
			"columns_sorting": {"woord": "asc"},
			
			"displaylength": 50
			
		},
		
		inzendingen_met_aantallen: {
			
			"group": sNaamFase1,
			
			"size": "60%",
			
			"columns_sorting": {"aantal": "desc"},
			
			"displaylength": 50
			
		},
		
		inzendingen_met_aantallen_per_geslacht: {
			
			"group": sNaamFase1,
			
			"size": "60%",
			
			"columns_sorting": {"woord": "asc"},
			
			"callback": function(t){ classify(t, "woord") }, 
			
			"repeat_callback": true,
			
			"displaylength": 50
			
		},
		
		inzendingen_met_aantallen_per_leeftijdscategorie: {
			
			"group": sNaamFase1,
			
			"size": "60%",
			
			"columns_sorting": {"woord": "asc", "leeftijd": "asc"},
			
			"callback": function(t){ classify(t, "woord") }, 
			
			"repeat_callback": true,
			
			"displaylength": 50
		},
		
		inzendingen_met_aantallen_per_taalgebied: {
			
			"group": sNaamFase1,
			
			"size": "60%",
			
			"columns_sorting": {"woord": "asc", "taalgebied": "asc"},
			
			"callback": function(t){ classify(t, "woord") }, 
			
			"repeat_callback": true,
			
			"displaylength": 50
		},
		
		aantallen_per_leeftijdscategorie: {
			
			"group": sNaamFase1,
			
			"size": "60%",
			
			"columns_sorting": {"leeftijd": "asc"},
			
			"displaylength": 50
		},
		
		aantallen_per_geslacht:{
			
			"group": sNaamFase1,
			
			"size": "60%",
			
			"columns_sorting": {"geslacht": "asc"},
			
			"displaylength": 50
			
		},
		
		aantallen_per_taalgebied: {
			
			"group": sNaamFase1,
			
			"size": "60%",
			
			"columns_sorting": {"taalgebied": "asc"},
			
			"displaylength": 50
			
		}, 
		
		totaaloverzicht: {
			
			"group": sNaamFase1,
			
			"displaylength": 50
		},
		
	
		// ======
		// fase 2
		// ======

		
		aantal_per_woord_in_NL_lijst: {
			
			"group": sNaamFase2,
			
			"size": "60%",
			
			"columns_sorting": {"aantal": "desc"},
			
			"displaylength": 50
			
		},
		
		aantal_per_woord_in_VL_lijst: {
			
			"group": sNaamFase2,
			
			"size": "60%",
			
			"columns_sorting": {"aantal": "desc"},
			
			"displaylength": 50
			
		}
		
};


// configuration at column level
oTableConfigurationList = {
		
		
		// basic tables
		
		"all_submissions": {
			"submission_id": {
				"visible": false
				},
			"email": {
				"visible": false
				},
			"ip": {
				"visible": false
				},
			"datum": {
				"visible": false
				}
		},
		
		"all_votes": {
			"vote_id": {
				"visible": false
				},
			"ip": {
				"visible": false
				},
			"datum": {
				"visible": false
				}
		},
		
		
		// ======
		// fase 1
		// ======
		
		inzendingen_met_motivering: {
			
			"taalgebied": {
				"choosefrom": []
			},
			
			"woord": {
				"click": function(t, n){showWordInSubmissions(t, n);}
			}

		},
		
		inzendingen_met_aantallen: {
			
			"taalgebied": {
				"choosefrom": []
			},
			
			"woord": {
				"click": function(t, n){showWordInSubmissions(t, n);}
			}
			
		},
		
		inzendingen_met_aantallen_per_geslacht: {
			"woord": {
				"click": function(t, n){showWordInSubmissions(t, n);}
			}
		},
		
		inzendingen_met_aantallen_per_leeftijdscategorie: {
			"woord": {
				"click": function(t, n){showWordInSubmissions(t, n);}
			}
		},
		
		inzendingen_met_aantallen_per_taalgebied: {
			"woord": {
				"click": function(t, n){showWordInSubmissions(t, n);}
			}
		}
		
		
		// ======
		// fase 2
		// ======
		

};


// RUN on load:


// put nice title

fn.setProjectTitle("Weg met dat woord!", "red");


// bring ip-2-country codes translation up to date right on start up

fn.callFunction("api.translate_ip_2_countrycode", [], function(){
//	fn.message("Welkom!", "Alle IP-adressen van stemmen zijn in de database nu omgezet naar taalgebied-codes.<BR>" +
//			"U kunt dus sorteren of zoeken op taalgebied.");
});


// make sure the function is called again at regular intervals, to make sure all data is translated

var iSec = 60;   // every 60 sec
setInterval(function(){
	fn.callFunction("api.translate_ip_2_countrycode", []);
}, (1000 * iSec) );

