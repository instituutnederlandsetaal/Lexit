// list of tables that must be hidden or visible (don't use both, it's a matter of what's the most convenient)
oHiddenTablesList = ["nominees", "votes"];
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


function showWordInNominees(t, n){
	
	var sWoord = fn.getDataFromCellNode(n);
	fn.callDatabase("nominees", {"woord": "exact:"+sWoord});
	
};

var sBasicData = "Ruwe data van website";
var sNaamFase1 = "Views bij inzendingen";
var sNaamFase2 = "Views bij genomineerden";

// table general settings
oTableSettingsList = {
		
		// ======
		// basic
		// ======
		
		all_nominees : {
			
			"group": sBasicData
		},
		
		all_votes : {
			
			"group": sBasicData
		},
		
		
		
		// ======
		// fase 1
		// ======
		
		inzendingen_met_motivering: {
			
			"group": sNaamFase1,
			
			"size": "60%",
			
			"columns_sorting": {"woord": "asc"}
			
		},
		
		inzendingen_met_aantallen: {
			
			"group": sNaamFase1,
			
			"size": "60%",
			
			"columns_sorting": {"aantal": "asc"}
			
		},
		
		inzendingen_met_aantallen_per_geslacht: {
			
			"group": sNaamFase1,
			
			"size": "60%",
			
			"columns_sorting": {"woord": "asc"},
			
			"callback": function(t){ classify(t, "woord") }, 
			
			"repeat_callback": true
			
		},
		
		inzendingen_met_aantallen_per_leeftijdscategorie: {
			
			"group": sNaamFase1,
			
			"size": "60%",
			
			"columns_sorting": {"woord": "asc", "leeftijd": "asc"},
			
			"callback": function(t){ classify(t, "woord") }, 
			
			"repeat_callback": true
		},
		
		inzendingen_met_aantallen_per_taalgebied: {
			
			"group": sNaamFase1,
			
			"size": "60%",
			
			"columns_sorting": {"woord": "asc", "taalgebied": "asc"},
			
			"callback": function(t){ classify(t, "woord") }, 
			
			"repeat_callback": true
		},
		
		aantallen_per_leeftijdscategorie: {
			
			"group": sNaamFase1,
			
			"size": "60%",
			
			"columns_sorting": {"leeftijd": "asc"}
		},
		
		aantallen_per_geslacht:{
			
			"group": sNaamFase1,
			
			"size": "60%",
			
			"columns_sorting": {"geslacht": "asc"}
			
		},
		
		aantallen_per_taalgebied: {
			
			"group": sNaamFase1,
			
			"size": "60%",
			
			"columns_sorting": {"taalgebied": "asc"}
			
		}, 
		
		totaaloverzicht: {
			
			"group": sNaamFase1
		},
		
	
		// ======
		// fase 2
		// ======

		
		aantal_per_woord_in_nl: {
			
			"group": sNaamFase2,
			
			"size": "60%",
			
			"columns_sorting": {"aantal": "desc"}
			
		},
		
		aantal_per_woord_in_vl: {
			
			"group": sNaamFase2,
			
			"size": "60%",
			
			"columns_sorting": {"aantal": "desc"}
			
		}
		
};


// configuration at column level
oTableConfigurationList = {
		
		
		// ======
		// fase 1
		// ======
		
		inzendingen_met_motivering: {
			
			"taalgebied": {
				"choosefrom": []
			},
			
			"woord": {
				"click": function(t, n){showWordInNominees(t, n);}
			}

		},
		
		inzendingen_met_aantallen: {
			
			"taalgebied": {
				"choosefrom": []
			},
			
			"woord": {
				"click": function(t, n){showWordInNominees(t, n);}
			}
			
		},
		
		inzendingen_met_aantallen_per_geslacht: {
			"woord": {
				"click": function(t, n){showWordInNominees(t, n);}
			}
		},
		
		inzendingen_met_aantallen_per_leeftijdscategorie: {
			"woord": {
				"click": function(t, n){showWordInNominees(t, n);}
			}
		},
		
		inzendingen_met_aantallen_per_taalgebied: {
			"woord": {
				"click": function(t, n){showWordInNominees(t, n);}
			}
		}
		
		
		// ======
		// fase 2
		// ======
		

};


fn.setProjectTitle("Weg met dat woord!", "red");