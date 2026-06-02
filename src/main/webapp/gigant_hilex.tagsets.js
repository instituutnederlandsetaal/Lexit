
var hilextagsets = {};


hilextagsets.settings = {
	
	tagsets: {
		
		"width": "60%",
		
		"exact_count": true,
		
		"buttons": {
			
			"Voeg tagset toe": {
				
				"position": ["300px", "50px"],
				"class": "header_freebutton",
				
				"click": function(t){					
					
					fn.prompt("Voeg tagset toe", 
						["description"], [""], 
						function(resp){
							fn.insertIntoTable(t, {"description": resp["description"]}, null, function(){
								fn.refreshTable(t);
							});
						},
						function(){
							fn.message("Annuleren", "De actie is geannuleerd.");
						},
						true,
						[50, 5]
					);
					
				}
			},
			"Verwijder tagset": {
				
				"position": ["470px", "50px"],
				"class": "header_freebutton",
				
				"click": function(t){
					
					var nSelectedNode = fn.getFirstSelectedRowNodeFrom(t);
					var sId = fn.getDataFromCellInRowNode(nSelectedNode, "tagset_id");
					
					fn.confirm("Let op", "Weet u zeker dat u tagset ID "+sId+" wilt verwijderen?",
						function(){
							fn.removeFromTableGivenANode(nSelectedNode,
								function(){
									fn.refreshTable(t);
								} 
							);
						},
						function(){
							fn.message("Annuleren", "De actie is geannuleerd.");
						}
					)
					
				}
			}
		}
	}
	
};


hilextagsets.config = {
	
	tagsets: {
		
		"tagset_id": {
			"width": "15%"
		},
		"description": {
			"editable": true
		}
	}
	
};
