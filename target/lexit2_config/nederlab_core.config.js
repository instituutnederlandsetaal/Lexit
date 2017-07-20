// list of tables that must be hidden or visible (don't use both, it's a matter of what's the most convenient)
oHiddenTablesList = [];
oShowOnlyTables = [];

// table general settings
oTableSettingsList = {
		
		
		auteurs_view: {
			
			"callback": function(t){
				
				var oRows = fx.getAllRows(t);
				oRows.every(function(){
					
					var oRow = this;
					
					var oCell = fx.getCell(oRow, "has_publications");
					var sData = fx.getDataFromCell(oCell);
					
					if (sData == 'f')
						{
						$(fx.getCellNode(oRow, "get_titles")).editable('disable');
						$(fx.getCellNode(oRow, "get_titles")).css("opacity", "0.5");
						}
				});
			},
			"repeat_callback": true
			
		},
		
		titels_view: {
			
			"callback": function(t){
				
				var oRows = fx.getAllRows(t);
				oRows.every(function(){
					
					var oRow = this;
					
					var oCell = fx.getCell(oRow, "has_authors");
					var sData = fx.getDataFromCell(oCell);
					
					if (sData == 'f')
						{
						$(fx.getCellNode(oRow, "get_authors")).editable('disable');
						$(fx.getCellNode(oRow, "get_authors")).css("opacity", "0.5");
						}
				});
			},
			"repeat_callback": true
			
		},
		
		titels_levels_view: {
			
			"callback": function(t){
				
				var oRows = fx.getAllRows(t);
				oRows.every(function(){
					
					var oRow = this;
					
					var oCell = fx.getCell(oRow, "has_authors");
					var sData = fx.getDataFromCell(oCell);
					
					if (sData == 'f')
						{
						$(fx.getCellNode(oRow, "get_authors")).editable('disable');
						$(fx.getCellNode(oRow, "get_authors")).css("opacity", "0.5");
						}
				});
			},
			"repeat_callback": true
			
		},
		
		titels_with_text_view: {
			
			"callback": function(t){
				
				var oRows = fx.getAllRows(t);
				oRows.every(function(){
					
					var oRow = this;
					
					var oCell = fx.getCell(oRow, "has_authors");
					var sData = fx.getDataFromCell(oCell);
					
					if (sData == 'f')
						{
						$(fx.getCellNode(oRow, "get_authors")).editable('disable');
						$(fx.getCellNode(oRow, "get_authors")).css("opacity", "0.5");
						}
				});
			},
			"repeat_callback": true
			
		},
		
		levels_view: {
			
			"callback": function(t){
				
				var oRows = fx.getAllRows(t);
				oRows.every(function(){
					
					var oRow = this;
					
					var oCell = fx.getCell(oRow, "has_authors");
					var sData = fx.getDataFromCell(oCell);
					
					if (sData == 'f')
						{
						$(fx.getCellNode(oRow, "get_authors")).editable('disable');
						$(fx.getCellNode(oRow, "get_authors")).css("opacity", "0.5");
						}
				});
			},
			"repeat_callback": true
			
		}
		
};


// configuration at column level
oTableConfigurationList = {
		
		auteurs_view: {
			
			"nederlabID": {
				"visible": false
			},
			
			"titles_arr": {
				"visible": false
			},
			
			"ext_referentie": {
				
				"button": "Externe referentie",
				"click": function(t, n){
					
					var oCell = fx.getCell(n);
					var sAuteurId = fx.getDataFromSiblingCell(oCell, "nederlabID");
					
					fn.callDatabase("externe_referentie_view", {"personID": sAuteurId}, function(){
						
						fn.scrollToTable("externe_referentie_view");
					});
					
				}
				
			},
			
			"get_titles": {
				
				"button": "Publicaties",
				"click": function(t, n){
					
					var oCell = fx.getCell(n);					
					var sAuteurId = fx.getDataFromSiblingCell(oCell, "nederlabID");
					
					fn.callDatabase("titels_view", {"authors_arr": sAuteurId}, function(){
						
						fn.scrollToTable("titels_view");
					});
					
				}
				
			},
			
			"resourceURI": {
				
				"click": function(t, n){
					
					var oCell = fx.getCell(n);		
					var sUrl = fx.getDataFromCell(oCell);
					
					window.open(sUrl);
					
				}
				
			}
			
		},
		
		
		
		
		
		
		titels_view: {
			
			"nederlabID": {
				"visible": false
			},
			
			"authors_arr": {
				"visible": false
			},
			
			"Categorie": {
				
				"choosefrom": ["", "werk", "uitgave", "herdruk", "audio", "video"]
				
			},
			
			"personen": {
				
				"button": "Personen",
				"click": function(t, n){
					
					var oCell = fx.getCell(n);
					var sId = fx.getDataFromSiblingCell(oCell, "nederlabID");
					
					fn.callDatabase("personen_view", {"titleID": sId}, function(){
						
						fn.scrollToTable("personen_view");
					});
					
				}
			},
			
			"get_authors": {
				
				"button": "Auteurs",
				"click": function(t, n){
					
					var oCell = fx.getCell(n);					
					var sTitelId = fx.getDataFromSiblingCell(oCell, "nederlabID");
					
					fn.callDatabase("auteurs_view", {"titles_arr": sTitelId}, function(){
						
						fn.scrollToTable("auteurs_view");
					});
					
				}
				
			},
			
			"resourceURI": {
				
				"click": function(t, n){
					
					var oCell = fx.getCell(n);		
					var sUrl = fx.getDataFromCell(oCell);
					
					window.open(sUrl);
					
				}
				
			}
		
		
		},
		
		
		
		titels_levels_view: {
			
			"nederlabID": {
				"visible": false
			},
			
			"authors_arr": {
				"visible": false
			},
			
			"Categorie": {
				
				"choosefrom": ["", "werk", "uitgave", "herdruk", "audio", "video"]
				
			},
			
			"title_level": {
				
				"choosefrom": ["", "level 1", "level 2"]
				
			},
			
			"personen": {
				
				"button": "Personen",
				"click": function(t, n){
					
					var oCell = fx.getCell(n);
					var sId = fx.getDataFromSiblingCell(oCell, "nederlabID");
					
					fn.callDatabase("personen_view", {"titleID": sId}, function(){
						
						fn.scrollToTable("personen_view");
					});
					
				}
			},
			
			"get_authors": {
				
				"button": "Auteurs",
				"click": function(t, n){
					
					var oCell = fx.getCell(n);					
					var sTitelId = fx.getDataFromSiblingCell(oCell, "nederlabID");
					
					fn.callDatabase("auteurs_view", {"titles_arr": sTitelId}, function(){
						
						fn.scrollToTable("auteurs_view");
					});
					
				}
				
			},
			
			"resourceURI": {
				
				"click": function(t, n){
					
					var oCell = fx.getCell(n);		
					var sUrl = fx.getDataFromCell(oCell);
					
					window.open(sUrl);
					
				}
				
			}
		
		
		},
		
		
		
		titels_with_text_view: {
			
			"nederlabID": {
				"visible": false
			},
			
			"authors_arr": {
				"visible": false
			},
			
			"Categorie": {
				
				"choosefrom": ["", "werk", "uitgave", "herdruk", "audio", "video"]
				
			},
			
			"title_level": {
				
				"choosefrom": ["", "level 1", "level 2"]
				
			},
			
			"personen": {
				
				"button": "Personen",
				"click": function(t, n){
					
					var oCell = fx.getCell(n);
					var sId = fx.getDataFromSiblingCell(oCell, "nederlabID");
					
					fn.callDatabase("personen_view", {"titleID": sId}, function(){
						
						fn.scrollToTable("personen_view");
					});
					
				}
			},
			
			"get_authors": {
				
				"button": "Auteurs",
				"click": function(t, n){
					
					var oCell = fx.getCell(n);					
					var sTitelId = fx.getDataFromSiblingCell(oCell, "nederlabID");
					
					fn.callDatabase("auteurs_view", {"titles_arr": sTitelId}, function(){
						
						fn.scrollToTable("auteurs_view");
					});
					
				}
				
			},
			
			"resourceURI": {
				
				"click": function(t, n){
					
					var oCell = fx.getCell(n);		
					var sUrl = fx.getDataFromCell(oCell);
					
					window.open(sUrl);
					
				}
				
			}
		
		
		},
		
		
	levels_view: {
			
			"nederlabID": {
				"visible": false
			},
			
			"authors_arr": {
				"visible": false
			},
			
			"Categorie": {
				
				"choosefrom": ["", "werk", "uitgave", "herdruk", "audio", "video"]
				
			},
			
			"personen": {
				
				"button": "Personen",
				"click": function(t, n){
					
					var oCell = fx.getCell(n);
					var sId = fx.getDataFromSiblingCell(oCell, "nederlabID");
					
					fn.callDatabase("personen_view", {"titleID": sId}, function(){
						
						fn.scrollToTable("personen_view");
					});
					
				}
			},
			
			"get_authors": {
				
				"button": "Auteurs",
				"click": function(t, n){
					
					var oCell = fx.getCell(n);					
					var sTitelId = fx.getDataFromSiblingCell(oCell, "nederlabID");
					
					fn.callDatabase("auteurs_view", {"titles_arr": sTitelId}, function(){
						
						fn.scrollToTable("auteurs_view");
					});
					
				}
				
			},
			
			"resourceURI": {
				
				"click": function(t, n){
					
					var oCell = fx.getCell(n);		
					var sUrl = fx.getDataFromCell(oCell);
					
					window.open(sUrl);
					
				}
				
			}
		
		
		}

};