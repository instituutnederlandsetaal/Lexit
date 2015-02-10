// list of tables that must be hidden or visible (don't use both, it's a matter of what's the most convenient)
oHiddenTablesList = [];
oShowOnlyTables = [];

// table general settings
oTableSettingsList = {};


// configuration at column level
oTableConfigurationList = {
		
		grouped_data: {
			
			spelling_klus_id: {
				"visible": false
			},
			modern_lemma_final: {
				"colsort": "asc"
			},
			spelling_klus_opmerking: {
				"visible": false
			},
			onw_id:{
				"click": function(t,n){
					
					var id = fn.getDataFromCellNode(t, n);
					window.open("http://gtb.inl.nl/iWDB/search?actie=article&wdb=ONW&id=ID"+id);
					
				}
			},
			vmnw_id:{
				"click": function(t,n){
					
					var id = fn.getDataFromCellNode(t, n);
					window.open("http://gtb.inl.nl/iWDB/search?actie=article&wdb=VMNW&id=ID"+id);
					
				}
			},
			mnw_id:{
				"click": function(t,n){
					
					var id = fn.getDataFromCellNode(t, n);
					window.open("http://gtb.inl.nl/iWDB/search?actie=article&wdb=MNW&id="+id);
					
				}
			},
			wnt_id:{
				"click": function(t,n){
					
					var id = fn.getDataFromCellNode(t, n);
					window.open("http://gtb.inl.nl/iWDB/search?actie=article&wdb=WNT&id="+id);
					
				}
			},
			gigmol_id:{
				"click": function(t,n){
					
					var id = fn.getDataFromCellNode(t, n);
					fn.callDatabaseInNewTab("lemmata_view", {"pkid": "^("+id+")$"}, {}, "gigant_molex");
					
				}
			}
			
		}

};


fn.callDatabase("grouped_data");