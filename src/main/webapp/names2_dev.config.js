// list of tables that must be hidden or visible (don't use both, it's a matter of what's the most convenient)
oHiddenTablesList = [];
oShowOnlyTables = [];



//name of the column in which we need autocomplete
//(preceeded by a dot, as the column name is used a class name for the column)
var sAutoCompleteSelectorGrondNaam =	"#namen_stand_vn2 .grondnaam_tanneke";
var sAutoCompleteSelectorSuffix = 		"#namen_stand_vn2 .suffix_tanneke";

$(document).on(
     "focus",
     sAutoCompleteSelectorGrondNaam,
     function(event) {

         $(event.target).autocomplete({

             delay: 750,
             minLength: 1,
             source: function(request, response){

                 fn.callFunction("api.get_grondnaam", ["'"+request.term+"'"],
                         function(func_resp){ 

                     var aSuggestionsArr =
                         (func_resp["get_grondnaam"]).split("|");  // suggestions are pipe separated

                     response($.map(aSuggestionsArr, function (item) {
                         return {
                             label: item,
                             value: item
                         };
                     }));
                 });
             }
         });           
     }
 );


$(document).on(
	     "focus",
	     sAutoCompleteSelectorSuffix,
	     function(event) {

	         $(event.target).autocomplete({

	             delay: 750,
	             minLength: 1,
	             source: function(request, response){

	                 fn.callFunction("api.get_suffix", ["'"+request.term+"'"],
	                         function(func_resp){ 

	                     var aSuggestionsArr =
	                         (func_resp["get_suffix"]).split("|");  // suggestions are pipe separated

	                     response($.map(aSuggestionsArr, function (item) {
	                         return {
	                             label: item,
	                             value: item
	                         };
	                     }));
	                 });
	             }
	         });           
	     }
	 );





// table general settings
oTableSettingsList = {
		
		standaard_fn : {
			
			"group": "werktabellen" 
		},
		
		standaard_vn : {
			
			"group": "werktabellen"
			
		},
		
		namen_stand_vn2: {
			
			"columns_order": 
				["vn_id",
				  "vnaam",
				  "sexe",
				  "cluster",
				  "orig_standaard",
				  "standaard",
				  "standaard_tanneke",
				  "stv_id",
				  "grondnaam",
				  "grondnaam_tanneke",
				  "suffix_tanneke",
				  "gnv_id",
				  "opmerking",
				  "n_genl_1",
				  "n_genl_v",
				  "n_genl_e",
				  "n_gba_1",
				  "n_gba_v",
				  "n_gba_e",
				  "fonnaam",
				  "stappen",
				  "fase",
				  "n_varparen"]
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
			
			"suffix_tanneke": {
				"editable": true,
				"bgcolor": "#E0F8EC"
			},
			
			"opmerking": {
				"editable": true,
				"bgcolor": "#E0F8EC"
			}
		}

};