/**
 * 
 */

oHiddenTablesList = [ "buki_di_oro", "buki_x_matematika", "bukitemp", "matematika_backup", "buki_backup"];

oTableSettingsList = {
};

oTableConfigurationList = {
		buki : {
			id: {"visible": false},
			entrada: {"editable": true, "colsort": "asc"},
			kontabel : {"choosefrom": [], "editable": true},
			kategoria : {"choosefrom": [], "editable": true},
			opzoeken: {
				"button": "Opzoeken",
				"click": function(oTable, nNode){					
					var wordToLookUp = "\\y"+fn.getDataFromSiblingNode(oTable, nNode, "entrada")+"\\y";
					fn.callDatabase("matematika", {"papiamentu": wordToLookUp});
				}
			}//,
			//in_matematika: {"filter": 't'}
		},
		
		matematika: {
			
			papiamentu: {"editable": true, "colsort": "asc"},
			nederlands: {"editable": true},
			tema: {"editable": true},
			definishon: {"editable": true},
			id : {"visible": false},
			paa : {"visible": false, "editable": true},
			es : {"visible": false, "editable": true},
			en : {"visible": false, "editable": true},
			pt : {"visible": false, "editable": true},
			la : {"visible": false, "editable": true},
			ilus : {"visible": false, "editable": true}
		}
};