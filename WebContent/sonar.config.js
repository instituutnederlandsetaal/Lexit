oHiddenTablesList = [];

oTableSettingsList = {};

oTableConfigurationList = {
		
		"sonar": {
			
			"openbestand" : {
				"button" : "Toon bestand",
				"click": function(confTable, confNode){
					var content = fn.getDataFromSiblingNode(confTable, confNode, "id");	
					fn.callDatabaseInNewTab("filecontent", {"id": content});
					
					}
			},
			"projectname" : {"colsort": "asc"},
			"collectionname" : {
				"choosefrom": ["", //default
				               "Auto cues",
				               "Blogs",
				               "Books",
				               "Brochures",
				               "Chats",
				               "Discussion lists",
				               "E-magazines",
				               "Guides & manuals",
				               "Legal texts",
				               "Newsletters",
				               "Newspapers",
				               "Periodicals & magazines",
				               "Policy documents",
				               "Press releases",
				               "Proceedings",
				               "Reports",
				               "SMS",
				               "Subtitles",
				               "Teletext",
				               "Texts for the visually impaired",
				               "Tweets",
				               "Web sites",
				               "Wikipedia",
				               "Written assignments"]
			},
			"collectioncode" : {},
			"collectiondescription" : {},
			"texttitle" : {},
			"textsubtitle" : {},
			"textintro" : {},
			"textdescription" : {},
			"texttype" : {},
			"textclass" : {},
			"textkeyword" : {},
			"totalsize" : {},
			"language" : {},
			"license" : {},
			"sourcename" : {},
			"continent" : {},
			"country" : {
				"choosefrom": ["", //default
				               "B",
				               "Belgium",
				               "Netherlands",
				               "NL",
				               "NL/B"
]
			},
			"outputtextcat" : {},
			"sourcelanguageidentifications" : {},
			"originalfilename" : {},
			"originalfiledate" : {},
			"originalfileacquisitiondate" : {},
			"publication" : {},
			"broadcastpublication" : {},
			"author" : {},
			"translation" : {},
			"annotationtypes" : {},
			"path_to_file": {},
			"id" : {},
			"openfile" : {
				
				/*
				"button": "Delete",
				"click": function(confTable, confNode){					
					
					var aSelectedRows = fn.getSelectedRowsFrom(confTable);
					
					aSelectedRows.each(function(){
						
						var idOfRow = fn.getDataFromCellNamed(confTable, this, "id");
						//alert(idOfRow);
						var thisRowIsTheLastOne = fn.isLastNodeOf(this, aSelectedRows);
						fn.removeFromDatabaseGivenFieldValues(confTable, {"id": idOfRow}, 
								thisRowIsTheLastOne, null);
						
					});
					
				
				}*/				
				
				"button" : "Tel woorden",
				"click": function(confTable, confNode){
					var aSelectedRows = fn.getSelectedRowsFrom(confTable);
					var iSum = 0;
					var sSum = "";
					aSelectedRows.each(function(){
						
						var sContent = fn.getDataFromCellNamed(confTable, this, "totalsize");
						var iContent = parseInt(sContent);
						iSum += iContent;
						sSum += ((sSum!='') ? " + ":"") + iContent;
					});
					
					alert(sSum+" = "+iSum);
					
					}			
				
			}
		},
		
		"filecontent" : {
			"id" : {},
			"content" : {},
			"metadata" : {
				"button" : "Toon metadata",
				"click": function(confTable, confNode){
					var content = fn.getDataFromSiblingNode(confTable, confNode, "id");	
					fn.callDatabase("sonar", {"id": content},
							function(){fn.scrollToTable("sonar");});
					
					}	
			}
		}
		
};