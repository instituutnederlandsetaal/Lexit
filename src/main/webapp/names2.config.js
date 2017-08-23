// list of tables that must be hidden or visible (don't use both, it's a matter of what's the most convenient)
oHiddenTablesList = [];
oShowOnlyTables = [];

// table general settings
oTableSettingsList = {
		
		standaard_fn : {
			
			"group": "werktabellen" 
		},
		
		standaard_vn : {
			
			"group": "werktabellen"
			
		}
		
};


// configuration at column level
oTableConfigurationList = {
		
		
		standaard_fn : {
		
			
			stf_id: {
				"visible": false,
				"colsort": "asc"   // sort #1
			},
			
			standaard: {
				"colsort": "asc",   // sort #2
				"click": function(t, n){
					
					var sId = fn.getDataFromSiblingNode(n, "stf_id");
					fn.callDatabase("namen_stand_fn", {"stf_id": sId});
					
				}
			},
			
			s_2011: {
				"click": function(t, n){
					
					var sId = fn.getDataFromSiblingNode(n, "stf_id");
					fn.callDatabase("namen_stand_fn", {"stf_id": sId});
					
				}
			},
			n_stand : {
				"click": function(t, n){
					
					var sId = fn.getDataFromSiblingNode(n, "stf_id");
					fn.callDatabase("namen_stand_fn", {"stf_id": sId});
					
				}
			},
			winkler : {
				"click": function(t, n){
					
					var sId = fn.getDataFromSiblingNode(n, "stf_id");
					fn.callDatabase("namen_stand_fn", {"stf_id": sId});
					
				}
			},
			grondnaam : {
				"click": function(t, n){
					
					var sId = fn.getDataFromSiblingNode(n, "stf_id");
					fn.callDatabase("namen_stand_fn", {"stf_id": sId});
					
				}
			},
			fonstand : {
				"click": function(t, n){
					
					var sId = fn.getDataFromSiblingNode(n, "stf_id");
					fn.callDatabase("namen_stand_fn", {"stf_id": sId});
					
				}
			},
			aantal_gba : {
				"click": function(t, n){
					
					var sId = fn.getDataFromSiblingNode(n, "stf_id");
					fn.callDatabase("namen_stand_fn", {"stf_id": sId});
					
				}
			},
			n_vvoegsels : {
				"click": function(t, n){
					
					var sId = fn.getDataFromSiblingNode(n, "stf_id");
					fn.callDatabase("namen_stand_fn", {"stf_id": sId});
					
				}
			},
			meest_frq_gba : {
				"click": function(t, n){
					
					var sId = fn.getDataFromSiblingNode(n, "stf_id");
					fn.callDatabase("namen_stand_fn", {"stf_id": sId});
					
				}
			},
			
			correctie_gerrit: {
				"editable": true,
				"bgcolor": "#E0F8EC"
			},
			
			correctie_tanneke: {
				"editable": true,
				"bgcolor": "#E0F8EC"
			},
			
			opmerking: {
				"editable": true,
				"bgcolor": "#E0F8EC"
			}
			
		},
		
		
		standaard_vn : {
			
			stv_id: {
				"visible": false,
				"colsort": "asc"   // sort #1
			},
			
			standaard: {
				"colsort": "asc",   // sort #2
				"click": function(t, n){
					
					var sId = fn.getDataFromSiblingNode(n, "stv_id");
					fn.callDatabase("namen_stand_vn2", {"stv_id": sId}, function(){
						var oRow = fx.getFirstRowFrom("namen_stand_vn2");
						var nRow = fx.getNode(oRow);
						var sGnvId = fn.getDataFromCellInRowNode(nRow, "gnv_id");
						fn.callDatabase("grondnaam_vn", {"gnv_id": sGnvId});
					});

					
				}
			},
			
			
			sexe : {
				"click": function(t, n){
					
					var sId = fn.getDataFromSiblingNode(n, "stv_id");
					fn.callDatabase("namen_stand_vn2", {"stv_id": sId}, function(){
						var oRow = fx.getFirstRowFrom("namen_stand_vn2");
						var nRow = fx.getNode(oRow);
						var sGnvId = fn.getDataFromCellInRowNode(nRow, "gnv_id");
						fn.callDatabase("grondnaam_vn", {"gnv_id": sGnvId});
					});
					
				}
			},
			
			s_2011: {
				"click": function(t, n){
					
					var sId = fn.getDataFromSiblingNode(n, "stv_id");
					fn.callDatabase("namen_stand_vn2", {"stv_id": sId}, function(){
						var oRow = fx.getFirstRowFrom("namen_stand_vn2");
						var nRow = fx.getNode(oRow);
						var sGnvId = fn.getDataFromCellInRowNode(nRow, "gnv_id");
						fn.callDatabase("grondnaam_vn", {"gnv_id": sGnvId});
					});
					
				}
			},
			
			n_stand: {
				"click": function(t, n){
					
					var sId = fn.getDataFromSiblingNode(n, "stv_id");
					fn.callDatabase("namen_stand_vn2", {"stv_id": sId}, function(){
						var oRow = fx.getFirstRowFrom("namen_stand_vn2");
						var nRow = fx.getNode(oRow);
						var sGnvId = fn.getDataFromCellInRowNode(nRow, "gnv_id");
						fn.callDatabase("grondnaam_vn", {"gnv_id": sGnvId});
					});
					
				}
			},
			
			schaar: {
				"click": function(t, n){
					
					var sId = fn.getDataFromSiblingNode(n, "stv_id");
					fn.callDatabase("namen_stand_vn2", {"stv_id": sId}, function(){
						var oRow = fx.getFirstRowFrom("namen_stand_vn2");
						var nRow = fx.getNode(oRow);
						var sGnvId = fn.getDataFromCellInRowNode(nRow, "gnv_id");
						fn.callDatabase("grondnaam_vn", {"gnv_id": sGnvId});
					});
					
				}
			},
			grondnaam: {
				"click": function(t, n){
					
					var sId = fn.getDataFromSiblingNode(n, "stv_id");
					fn.callDatabase("namen_stand_vn2", {"stv_id": sId}, function(){
						var oRow = fx.getFirstRowFrom("namen_stand_vn2");
						var nRow = fx.getNode(oRow);
						var sGnvId = fn.getDataFromCellInRowNode(nRow, "gnv_id");
						fn.callDatabase("grondnaam_vn", {"gnv_id": sGnvId});
					});
					
				}
			},
			aantal_gba_v: {
				"click": function(t, n){
					
					var sId = fn.getDataFromSiblingNode(n, "stv_id");
					fn.callDatabase("namen_stand_vn2", {"stv_id": sId}, function(){
						var oRow = fx.getFirstRowFrom("namen_stand_vn2");
						var nRow = fx.getNode(oRow);
						var sGnvId = fn.getDataFromCellInRowNode(nRow, "gnv_id");
						fn.callDatabase("grondnaam_vn", {"gnv_id": sGnvId});
					});
					
				}
			},
			aantal_gba_m : {
				"click": function(t, n){
					
					var sId = fn.getDataFromSiblingNode(n, "stv_id");
					fn.callDatabase("namen_stand_vn2", {"stv_id": sId}, function(){
						var oRow = fx.getFirstRowFrom("namen_stand_vn2");
						var nRow = fx.getNode(oRow);
						var sGnvId = fn.getDataFromCellInRowNode(nRow, "gnv_id");
						fn.callDatabase("grondnaam_vn", {"gnv_id": sGnvId});
					});
					
				}
			},
			meest_frq_gba : {
				"click": function(t, n){
					
					var sId = fn.getDataFromSiblingNode(n, "stv_id");
					fn.callDatabase("namen_stand_vn2", {"stv_id": sId}, function(){
						var oRow = fx.getFirstRowFrom("namen_stand_vn2");
						var nRow = fx.getNode(oRow);
						var sGnvId = fn.getDataFromCellInRowNode(nRow, "gnv_id");
						fn.callDatabase("grondnaam_vn", {"gnv_id": sGnvId});
					});
					
				}
			},
			
			correctie_gerrit: {
				"editable": true,
				"bgcolor": "#E0F8EC"
			},
			
			correctie_tanneke: {
				"editable": true,
				"bgcolor": "#E0F8EC"
			},
			
			opmerking: {
				"editable": true,
				"bgcolor": "#E0F8EC"
			}
			
		},
		
		"namen_stand_vn2": {
			
			"standaard_tanneke": {
				"editable": true,
				"bgcolor": "#E0F8EC"
			},
			
			"grondnaam_tanneke": {
				"editable": true,
				"bgcolor": "#E0F8EC"
			},
			
			"opmerking": {
				"editable": true,
				"bgcolor": "#E0F8EC"
			}
		}

};