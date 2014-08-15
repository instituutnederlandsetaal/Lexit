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
		
		flexievormen_molex2gigp_vrb_a: oKeySettings,
		
		flexievormen_molex2gigp_type_a: oKeySettings,
		
		flexievormen_molex2gigp_toevoegingen_a : oKeySettings,
		
		flexievormen_molex2gigp_rest_a : oKeySettings,
		
		flexievormen_molex2gigp_gender_a : oKeySettings
		
};


// configuration at column level
oTableConfigurationList = {
		
		flexievormen_molex2gigp_vrb_a: {},
		
		flexievormen_molex2gigp_type_a: {},
		
		flexievormen_molex2gigp_toevoegingen_a : {},
		
		flexievormen_molex2gigp_rest_a : {},
		
		flexievormen_molex2gigp_gender_a : {}

};