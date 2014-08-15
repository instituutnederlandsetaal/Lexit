oHiddenTablesList = [];

oTableSettingsList = {
		corpora : {
			"size": "600px",
			"replace_button": false,
			"selection_button": false,
			"goto_button": false,
			"undo_button": false
			
			},
		metadata: {
			"keyup" : {
				"uparrow": function(confTable){
					
					// when the display length is only 1
					// we need to put the milestone table call into a callback
					// that will be called only after the metadata table will be redraw (after scrolling to new row)
					// because only then can the right id be read from the metadata table
					if (fn.getCurrentDisplayLength(confTable) == 1)
						fn.addDrawCallback(confTable, function(){
							
							// small delay otherwise it won't work
							$("#"+confTable).delay(500).queue(function(){
								callMileStones();
								$(this).dequeue();
							});
						});
					else callMileStones();
					
				},
				"downarrow": function(confTable){
					
					// when the display length is only 1
					// we need to put the milestone table call into a callback
					// that will be called only after the metadata table will be redraw (after scrolling to new row)
					// because only then can the right id be read from the metadata table
					if (fn.getCurrentDisplayLength(confTable) == 1)
						fn.addDrawCallback(confTable, function(){
							
							// small delay otherwise it won't work
							$("#"+confTable).delay(500).queue(function(){
								callMileStones();
								$(this).dequeue();
							});
						});
					else callMileStones();
						
					
				},
				"enter": function(confTable){						
					callMileStones();
					
				}
			}
			
		}
};


function callMileStones(){
	var nNode = fn.getViewType("metadata") == 'table' ?
			fn.getFirstSelectedRowFrom("metadata") :
				fn.getAllRows("metadata")[0];
	var id = fn.getDataFromCellNamed("metadata", nNode, "id");
	fn.callDatabase("milestones", {"metadata_id": id});
};

// container object for the configuration of each table

oTableConfigurationList = {
		
		auteurs : {
			
			author_level1: {
				
				"click": function(confTable, confNode){ 
					var content = fn.getDataFromCellNode(confTable, confNode);			
				      fn.callDatabase("metadata", {"author_level1": content});
				}
				
			},
			author_level2: {
				
				"click": function(confTable, confNode){ 
					var content = fn.getDataFromCellNode(confTable, confNode);			
				      fn.callDatabase("metadata", {"author_level2": content});
				}
				
			},
			author_level3: {
				
				"click": function(confTable, confNode){ 
					var content = fn.getDataFromCellNode(confTable, confNode);			
				      fn.callDatabase("metadata", {"author_level3": content});
				}
				
			}
		},
		
		corpora : {
			corpus_provenance : {
				"click": function(confTable, confNode){            		
					  var content = fn.getDataFromCellNode(confTable, confNode);			
				      fn.callDatabaseInNewTab("metadata", {"corpus_provenance": content});				
		 		}
			}
		},
		metadata: {
			id: {
				"click": function(someTable, nNode){
					var content = fn.getDataFromCellNode(someTable, nNode);
					fn.callDatabaseInNewTab("files_processed", {"id_of_file": content});
				}
			},
			topic : {},
			corpus_provenance : {"choosefrom": []},
			medium : {"choosefrom": []}
		}
};