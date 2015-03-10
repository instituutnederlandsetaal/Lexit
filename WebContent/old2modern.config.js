// list of tables that must be hidden or visible (don't use both, it's a matter of what's the most convenient)
oHiddenTablesList = [];
oShowOnlyTables = [];


// table general settings
oTableSettingsList = {
		
		mnw_wnt_differences:{
			
			"callback": function(t){
				
				var aN = fn.getAllRows(t);
				aN.each(function(){
					
					var nNode = this;
					var bRemove = fn.getDataFromCellNamed(t, nNode, "verwijder");
					
//					var noorMnw = fn.getDataFromCellNamed(t, nNode, "noor_modlem_mnw");
//					var noorWnt = fn.getDataFromCellNamed(t, nNode, "noor_modlem_wnt");
//					
//					if (noorMnw != noorWnt)
//						{
//						fn.getCellElement(t, nNode, "noor_modlem_mnw").css("color", "red");
//						fn.getCellElement(t, nNode, "noor_modlem_wnt").css("color", "red");
//						}
					
//					var wdbMnw = fn.getDataFromCellNamed(t, nNode, "wdb_modlem_mnw");
//					var wdbWnt = fn.getDataFromCellNamed(t, nNode, "wdb_modlem_wnt");
//					
//					if (wdbMnw != wdbWnt)
//						{
//						fn.getCellElement(t, nNode, "wdb_modlem_mnw").css("color", "red");
//						fn.getCellElement(t, nNode, "wdb_modlem_wnt").css("color", "red");
//						}
					
					if (bRemove == 't')
						{
						var aColumnNames = mt.getListOfVisibleColumnsOf( fn.getTableName(t) );
						for (var i=0; i<aColumnNames.length; i++)
							{
							fn.getCellElement(t, nNode, aColumnNames[i]).css("opacity", "0.2");
							}
						}
					
				});
			},
			
			"repeat_callback": true,
			
			"button_0":{
				"name": "Kloon regel",
				"bgcolor": "black",
				"click": function(t){
					
					var aN = fn.getSelectedRowsFrom(t);	
					
					aN.each(function(){
						var nNode = this;							
						var bLast = fn.isLastNodeOf(nNode, aN);
												
						var id = fn.getRowId(nNode);
						
						// first add 1 to all following ids					
						fn.callFunction("add_1_to_ids", [id], function(){
							
							fn.getRecord(t, id, function(r){
								
								fn.insertIntoDatabase(t, 
										{
										"mnw_id": r["mnw_id"],
										"wnt_id": r["wnt_id"],
										"original_mnw_id": r["original_mnw_id"],
										"original_wnt_id": r["original_wnt_id"],
										"histlem_mnw": r["histlem_mnw"],
										"histlem_wnt": r["histlem_wnt"],
										"noor_modlem_mnw": r["noor_modlem_mnw"],
										"noor_modlem_wnt": r["noor_modlem_wnt"],
//										"wdb_modlem_mnw": r["wdb_modlem_mnw"],
//										"wdb_modlem_wnt": r["wdb_modlem_wnt"],
										"pos_mnw": r["pos_mnw"],
										"pos_wnt": r["pos_wnt"],
										"unique_id": (parseInt(id)+1)
										}, 
										null, bLast);
								
							});
							
						});
						
						
					});
					
					
					
				}
			},
			"button_1":{
				"name": "Verwijder regel",
				"click": function(t){
					
					fn.confirm("Let op", "Weet u dit zeker?", function(){
						var aN = fn.getSelectedRowsFrom(t);
						aN.each(function(){
							var nNode = this;							
							var bLast = fn.isLastNodeOf(nNode, aN);
							
							fn.updateDatabaseGivenANode(t, nNode, ["verwijder"], [true], bLast);
						});
					});
				}
			},
			"button_2":{
				"name": "Herstel regel",
				"click": function(t){
					
					var aN = fn.getSelectedRowsFrom(t);
					aN.each(function(){
						var nNode = this;							
						var bLast = fn.isLastNodeOf(nNode, aN);
						
						fn.updateDatabaseGivenANode(t, nNode, ["verwijder"], [false], bLast);
					});
				}
			},
			"button_3":{
				"name": "Herstel MNW-id",
				"bgcolor": "grey",
				"click": function(t){
					
					fn.confirm("Let op", "Weet u het zeker?", function(){
						
						fn.showProcessingMsg(t);
						var nNode = fn.getSelectedRowsFrom(t)[0];
						var mnwId = fn.getDataFromCellNamed(t, nNode, "original_mnw_id");
						fn.updateDatabaseGivenANode(t, nNode, ["mnw_id"], [mnwId], false, function(){
							
							fn.getIdFromDatabase("marijke_spelling", {"hist_lemma_id": "^MNW"+mnwId}, function(id){
								
								fn.getRecord("marijke_spelling", id, function(r){
									
									fn.updateDatabaseGivenANode(t, nNode, 
											["noor_modlem_mnw", "histlem_mnw", "pos_mnw", "pos_wnt"], 
											[ r["modern_lemma_final"], r["hist_lemma"], "", "" ], 
											true);
									});								
							});
							
						});
						
					});
					
				}
			},
			"button_4":{
				"name": "Herstel WNT-id",
				"bgcolor": "grey",
				"click": function(t){
					
					fn.confirm("Let op", "Weet u het zeker?", function(){
					
						fn.showProcessingMsg(t);
						var nNode = fn.getSelectedRowsFrom(t)[0];
						var wntId = fn.getDataFromCellNamed(t, nNode, "original_wnt_id");
						fn.updateDatabaseGivenANode(t, nNode, ["wnt_id"], [wntId], false, function(){
							
							fn.getIdFromDatabase("marijke_spelling", {"hist_lemma_id": "^WNT"+wntId}, function(id){
								
								fn.getRecord("marijke_spelling", id, function(r){
									
									fn.updateDatabaseGivenANode(t, nNode, 
											["noor_modlem_wnt", "histlem_wnt", "pos_wnt", "pos_mnw"], 
											[ r["modern_lemma_final"], r["hist_lemma"], "", "" ], 
											true);
									});
								
							});		
						});
						
						
					});
				}
			}
		}
};



function openBothWntAndMnw(t, n){
	
	if ($('#mnw_frame').length == 0)
		{
		$("#mnw_wnt_differences_wrapper").append(
				$('<iframe></iframe>')
				.attr("id", "mnw_frame")
				.css("position", "relative")
				.css("top", "0px")
				.css("left", "0px")
				.css("height", "380px")
				.css("width", ($( window ).width()/2)+"px")
			);
		$("#mnw_wnt_differences_wrapper").append(
				$('<iframe></iframe>')
				.attr("id", "wnt_frame")
				.css("position", "relative")
				.css("top", "-380px")
				.css("left", (($( window ).width()/2)+30)+"px")
				.css("height", "380px")
				.css("width", ($( window ).width()/2)+"px")
			);
		
		}
	
	var mnwId = fn.getDataFromCellNamed(t, n, "mnw_id");
	var wntId = fn.getDataFromCellNamed(t, n, "wnt_id");
	
	$("#mnw_frame").attr("src", "http://gtb.inl.nl/iWDB/search?actie=article&wdb=MNW&id="+mnwId);
	$("#wnt_frame").attr("src", "http://gtb.inl.nl/iWDB/search?actie=article&wdb=WNT&id="+wntId);
	
	
	if(kf.isPressed('ctrl'))
		{
		window.open("http://gtb.inl.nl/iWDB/search?actie=article&wdb=MNW&id="+mnwId);
		window.open("http://gtb.inl.nl/iWDB/search?actie=article&wdb=WNT&id="+wntId);
		kf._setPressedKey("");
		}
	
}

// configuration at column level
oTableConfigurationList = {
		
		mnw_wnt_differences:{
			
			original_mnw_id:{
				"visible": false
			},
			
			original_wnt_id:{
				"visible": false
			},
			
			mnw_id:{
				
				"editable": true,
				"editcallback": function( t, n, value){
					
					fn.showProcessingMsg(t);
					
					fn.updateDatabaseGivenANode(t, n, ["aangepast"], [true], false, function(){
						
						fn.getIdFromDatabase("marijke_spelling", {"hist_lemma_id": "MNW"+value}, function(id){
							
							if (id != '')
								{
								fn.getRecord("marijke_spelling", id, function(r){
									
									fn.updateDatabaseGivenANode(t, n, 
											["noor_modlem_mnw", "histlem_mnw", "pos_mnw", "pos_wnt"], 
											[ r["modern_lemma_final"], r["hist_lemma"], "", "" ], 
											true);
									});
								}
							else
								{
								fn.removeProcessingMsg(t);
								fn.message("Let op", "Deze ID is onbekend");
								}
							
						});
					});
					
				}
			},
			wnt_id:{
				
				"editable": true,
				"editcallback": function( t, n, value){
					
					fn.showProcessingMsg(t);
					
					fn.updateDatabaseGivenANode(t, n, ["aangepast"], [true], false, function(){
						
						fn.getIdFromDatabase("marijke_spelling", {"hist_lemma_id": "WNT"+value}, function(id){
							
							if (id != '')
								{
								fn.getRecord("marijke_spelling", id, function(r){
									
									fn.updateDatabaseGivenANode(t, n, 
											["noor_modlem_wnt", "histlem_wnt", "pos_wnt", "pos_mnw"], 
											[ r["modern_lemma_final"], r["hist_lemma"], "", "" ], 
											true);
									});
								}	
							else
								{
								fn.removeProcessingMsg(t);
								fn.message("Let op", "Deze ID is onbekend");
								}
							
						});						
						
					});
					
				}
			},
			histlem_mnw:{
				"bgcolor": "#CEECF5"				
			},
			histlem_wnt:{
				"bgcolor": "#CEECF5"
			},
			noor_modlem_mnw:{
				"bgcolor": "#F3E2A9",
				"editable": true,
				"editcallback": function( t, n, value){
					fn.updateDatabaseGivenANode(t, n, ["aangepast"], [true]);
				}
			},
			noor_modlem_wnt:{
				"bgcolor": "#F3E2A9",
				"editable": true,
				"editcallback": function( t, n, value){
					fn.updateDatabaseGivenANode(t, n, ["aangepast"], [true]);
				}
			},
			pos_mnw:{
				
			},
			pos_wnt:{
				
			},
			wdb:{
				"button": "WDB",
				"cell_tooltip": "Open woordenboeken (+CTRL voor andere tab)",
				"click": function(t,n){	openBothWntAndMnw(t, n); }
			},
			unique_id:{
				"colsort": "asc", // sort #1
				"visible": false
			},
			verwijder: {
				"visible": false
			}
			
		},
		
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