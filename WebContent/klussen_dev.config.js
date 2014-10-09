// list of tables that must be hidden or visible (don't use both, it's a matter of what's the most convenient)
oHiddenTablesList = [];
oShowOnlyTables = [];




// table general settings

function callCandidatesTable(t){
	var nNode = fn.getViewType(t) == 'table' ?
			fn.getFirstSelectedRowFrom(t) :
				fn.getAllRows(t)[0];
	var id = fn.getDataFromCellNamed(t, nNode, "lem_id");
	var sCandidatesTableName = fn.getTableName(t);
	sCandidatesTableName = sCandidatesTableName.substring(0, sCandidatesTableName.length-1)+"b";
	fn.callDatabase(sCandidatesTableName, {"lem_id": id});
};

var oKeySettings = {
		
		"displaylength": 5,		
		
		"keyup" : {
			"uparrow": function(confTable){
				
				// small delay otherwise it won't work
				$("#"+confTable).delay(500).queue(function(){
					callCandidatesTable(confTable);
					$(this).dequeue();
				});
				
			},
			"downarrow": function(confTable){
				
				// small delay otherwise it won't work
				$("#"+confTable).delay(500).queue(function(){
					callCandidatesTable(confTable);
					$(this).dequeue();
				});
					
				
			},
			"enter": function(confTable){
				
				callCandidatesTable(confTable);
				
			}
		}
		
};

oTableSettingsList = {
		
		lemmata_en_afbreking: {
			"size": "80%"
		},
		
		flexievormen_molex2gigp_vrb_a: oKeySettings,
		
		flexievormen_molex2gigp_type_a: oKeySettings,
		
		flexievormen_molex2gigp_toevoegingen_a : oKeySettings,
		
		flexievormen_molex2gigp_rest_a : oKeySettings,
		
		flexievormen_molex2gigp_gender_a : oKeySettings
		
};


// configuration at column level
oTableConfigurationList = {
		
		lemmata_en_afbreking: {
			
			"unique_id":{
				"visible": false
			},
			"lemma_id":{
				"visible": false
			},
			"lemma": {
				"cell_tooltip": "Klik om te kopiëren naar 'afbreking_corr'",
				"click": function(t, n){
					var sLemma = fn.getDataFromCellNode(t, n);
					fn.putDataIntoCell(t, fn.getRowNode(n), "afbreking_corr", sLemma);
				}
			},
			"afbreking": {
				"cell_tooltip": "Klik om te kopiëren naar 'afbreking_corr'",
				"click": function(t, n){
					var sAfbreking = fn.getDataFromCellNode(t, n);
					fn.putDataIntoCell(t, fn.getRowNode(n), "afbreking_corr", sAfbreking);
				}
			},
			"afbreking_corr": {
				"bgcolor": "#D8D8D8",
				"editable": true
			},
			"opmerkingen": {
				"bgcolor": "#F2F2F2",
				"editable": true
			}
			
			
		},
		
		antilliaans: {
			
			id: {"visible": false},
			lemma: {"colsort": "asc"},
			corrected_lemma: {"editable": true, "bgcolor": "#D8F6CE"},
			pos: {},
			corrected_pos: { "editable": true, "bgcolor": "#D8F6CE"},
			opmerkingen: {"editable": true, "bgcolor": "#D8D8D8"},
			frequentie: {},
			an_score: {},
			typisch_an: {"editable": true, "bgcolor": "#D8F6CE"},
			weg: {"editable": true, "bgcolor": "#D8D8D8"}
		},
		
		flexievormen_molex2gigp_vrb_a: {},
		
		flexievormen_molex2gigp_type_a: {},
		
		flexievormen_molex2gigp_toevoegingen_a : {},
		
		flexievormen_molex2gigp_rest_a : {},
		
		flexievormen_molex2gigp_gender_a : {}

};