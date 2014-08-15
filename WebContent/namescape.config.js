oHiddenTablesList = ["examples", "named_entities"];

oTableSettingsList = {
		
		"named_entity_work" : {
			"keyup" : {
				
				// delete all tags
				"f2": function(confTable){
					var nNode = fn.getFirstSelectedRowFrom(confTable);
					var nm = fn.getDataFromCellNamed(confTable, nNode, "name_editable");
					nm = removeTags(nm);
					fn.putDataIntoCell("named_entity_work", nNode, "name_editable", nm);
					fn.updateDatabaseGivenANode("named_entity_work", nNode, "name_editable", nm, false, null);
					},
				// request example
				"f9": function(confTable){
					var nNode = fn.getFirstSelectedRowFrom(confTable);
					var content = fn.getDataFromCellNamed(confTable, nNode, "name_id");
			        fn.callDatabase("examples",  
			        		{"name_id": content}, 
			        		function() { fn.scrollToTable("examples"); } , 
			        		{"pane": "iflp"});
				},
				// add v-tag (z key)    [= Voornaam]
				"z": function(confTable){
					var nNode = fn.getFirstSelectedRowFrom(confTable);
					var nm = fn.getDataFromCellNamed(confTable, nNode, "name_editable");
					nm = tagName(nm, "v");
					fn.putDataIntoCell("named_entity_work", nNode, "name_editable", nm);
					fn.updateDatabaseGivenANode("named_entity_work", nNode, "name_editable", nm, false, null);
				},
				// add a-tag (x key)   [= Achternaam]
				"x": function(confTable){
					var nNode = fn.getFirstSelectedRowFrom(confTable);
					var nm = fn.getDataFromCellNamed(confTable, nNode, "name_editable");
					nm = tagName(nm, "a");
					fn.putDataIntoCell("named_entity_work", nNode, "name_editable", nm);
					fn.updateDatabaseGivenANode("named_entity_work", nNode, "name_editable", nm, false, null);
				},
				// add b-tag (c key)  [= Bijnaam ]
				"c": function(confTable){
					var nNode = fn.getFirstSelectedRowFrom(confTable);
					var nm = fn.getDataFromCellNamed(confTable, nNode, "name_editable");
					nm = tagName(nm, "b");
					fn.putDataIntoCell("named_entity_work", nNode, "name_editable", nm);
					fn.updateDatabaseGivenANode("named_entity_work", nNode, "name_editable", nm, false, null);
				}
			}
				
		}
		
};

function tagName(str,  tag)
{
  var a = str.split(/\s+/);
  for (var i=0; i < a.length; i++)
  {
     var j = a[i].indexOf("_");
     if (j > 0)
     {
     } else
     {
       a[i] += "_" + tag;
       break;
     }
  }   
  return a.join(" ");
};

function removeTags(str){
	var a = str.split(/\s+/);
	for (var i=0; i < a.length; i++)
	  {
		a[i] = a[i].split(/_/)[0];
	  }
	return a.join(" ");
}



// container object for the configuration of each table
oTableConfigurationList = 
{
  "named_entity_work" : 
   {
   "name_id": {"colsort": "asc"},
   "type" : { editable: true, choosefrom: [] },
   "name_editable" : { bgcolor: "#dfffdf", editable:true},
  
   "voorbeelden" : {
     "button":"Voorbeelden",
     "click": function(confTable,confNode) {
        var content = fn.getDataFromSiblingNode(confTable, confNode, "name_id");
        fn.callDatabase("examples",  
        		{"name_id": content}, 
        		function() { fn.scrollToTable("examples"); } , 
        		{"pane": "iflp"});
      }
    },
    "v" : { 
       "button":"v",
       "button_tooltip": "Voornaam",
       "click": function(confTable, confNode) {
	       var nm = fn.getDataFromSiblingNode(confTable, confNode, "name_editable");
	       nm = tagName(nm,"v");
	       fn.updateDatabaseGivenANode(confTable, confNode, "name_editable", nm, true, null);
      }
    },
    "a" : { 
       "button":"a",
       "button_tooltip": "Achternaam",
       "click": function(confTable, confNode) {
	       var nm = fn.getDataFromSiblingNode(confTable, confNode, "name_editable");
	       nm = tagName(nm,"a");
	       fn.updateDatabaseGivenANode(confTable, confNode, "name_editable", nm, true, null);
      }
    },
    "b" : { 
       "button":"b", 
       "button_tooltip": "Bijnaam",
       "click": function(confTable, confNode) {
	       var nm = fn.getDataFromSiblingNode(confTable, confNode, "name_editable");
	       nm = tagName(nm,"b");
	       fn.updateDatabaseGivenANode(confTable, confNode, "name_editable", nm, true, null);
      }
    }
  }
};






