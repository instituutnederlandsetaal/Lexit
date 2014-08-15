// list of tables that must be hidden or visible (don't use both, it's a matter of what's the must convenient)
oShowOnlyTables = ["gb_splitup_v4_overview"];

// table general settings
oTableSettingsList = {
		
		gb_splitup_v4: {
			"column_order": ["id",
			                 "gb05_id",
			                 "gb05_superid",
			                 "lem05",
			                 "wordform",
			                 "wordform_afbr",
			                 "volgnr05",
			                 "wrdcat05",
			                 "th-wrdcat05",
			                 "znwlid05",
			                 "th-znwlid05",
			                 "betek05",
			                 "th-betek05",
			                 "zook05",
			                 "th-zook05",
			                 "wordform_id",
			                 "orig_wordform",
			                 "orig_afbr",
			                 "th-wordform",
			                 "th-wordform_afbr",
			                 "flex",
			                 "phrasal_verb",
			                 "phrasal_form",
			                 "orig_gb_field",
			                 "element_nr",
			                 "gigant_tag",
			                 "fout"]
		},
		gb_splitup_v4_overview: {
			
			"keyup" : {
				// call overview
				"f9": function(t){
					var n = fn.getFirstSelectedRowFrom(t);
					var wrdcat = "^"+fn.getDataFromCellNamed(t, n, "wrdcat05");
					var znwlid = "^"+escapeRegexChars(fn.getDataFromCellNamed(t, n, "znwlid05"))+"$";
					var flex = "^"+fn.getDataFromCellNamed(t, n, "flex");
					var gigantTag = "^"+fn.getDataFromCellNamed(t, n, "gigant_tag");
					fn.callDatabase("gb_splitup_v4", 
							{wrdcat05: wrdcat, znwlid05: znwlid, flex: flex, gigant_tag: gigantTag});
				},
				"f8": function(t){
					var n = fn.getFirstSelectedRowFrom(t);
					fn.getCellElement(t, n, "gigant_tag_extended").click();
				}
			},
			
			"callback": function(t){
				
				if ( !fn.tableExists("gb_splitup_v4") )
					{
					fn.callDatabase("gb_splitup_v4", {});
					}
			},
			"repeat_callback": false
		}
		
};


// configuration at column level
oTableConfigurationList = {

		gb_splitup_v4: {
			
			"id": {
				"visible": false
			},
			"gb05_id": {
				"visible": false
			},
			"gb05_superid": {
				"visible": false
			},
			"volgnr05": {
				"visible": false
			},
			"th-wrdcat05": {
				"visible": false
			},
			"th-znwlid05": {
				"visible": false
			},
			"betek05": {
				"visible": false
			},
			"th-betek05": {
				"visible": false
			},
			"zook05": {
				"visible": false
			},
			"th-zook05": {
				"visible": false
			},
			"wordform_id": {
				"visible": false
			},
			"orig_wordform": {
				"visible": false
			},
			"orig_afbr": {
				"visible": false
			},
			"wordform_afbr": {
				"visible": false
			},
			"th-wordform": {
				"visible": false
			},
			"th-wordform_afbr": {
				"visible": false
			},
			"phrasal_verb": {
				"visible": false
			},
			"phrasal_form": {
				"visible": false
			},
			"orig_gb_field": {
				"visible": false
			},
			"element_nr": {
				"visible": false
			},
			
			"fout": {
				"bgcolor": "#E3F6CE",
				"editable": true
			}
			
			
		},
		
		gb_splitup_v4_overview: {
			
			id: {
				"visible": false
			},
			
			wrdcat05: {
				"click": function(t, n){
					var wrdcat = "^"+fn.getDataFromCellNamed(t, n, "wrdcat05");
					var znwlid = "^"+escapeRegexChars(fn.getDataFromCellNamed(t, n, "znwlid05"))+"$";
					var flex = "^"+fn.getDataFromCellNamed(t, n, "flex");
					var gigantTag = "^"+fn.getDataFromCellNamed(t, n, "gigant_tag");
					fn.callDatabase("gb_splitup_v4", 
							{wrdcat05: wrdcat, znwlid05: znwlid, flex: flex, gigant_tag: gigantTag});
				}
			},
			znwlid05: {
				"click": function(t, n){
					var wrdcat = "^"+fn.getDataFromCellNamed(t, n, "wrdcat05");
					var znwlid = "^"+escapeRegexChars(fn.getDataFromCellNamed(t, n, "znwlid05"))+"$";
					var flex = "^"+fn.getDataFromCellNamed(t, n, "flex");
					var gigantTag = "^"+fn.getDataFromCellNamed(t, n, "gigant_tag");
					fn.callDatabase("gb_splitup_v4", 
							{wrdcat05: wrdcat, znwlid05: znwlid, flex: flex, gigant_tag: gigantTag});
				}
			},
			flex: {
				"click": function(t, n){
					var wrdcat = "^"+fn.getDataFromCellNamed(t, n, "wrdcat05");
					var znwlid = "^"+escapeRegexChars(fn.getDataFromCellNamed(t, n, "znwlid05"))+"$";
					var flex = "^"+fn.getDataFromCellNamed(t, n, "flex");
					var gigantTag = "^"+fn.getDataFromCellNamed(t, n, "gigant_tag");
					fn.callDatabase("gb_splitup_v4", 
							{wrdcat05: wrdcat, znwlid05: znwlid, flex: flex, gigant_tag: gigantTag});
				}
			},
			gigant_tag: {
				"click": function(t, n){
					var wrdcat = "^"+fn.getDataFromCellNamed(t, n, "wrdcat05");
					var znwlid = "^"+escapeRegexChars(fn.getDataFromCellNamed(t, n, "znwlid05"))+"$";
					var flex = "^"+fn.getDataFromCellNamed(t, n, "flex");
					var gigantTag = "^"+fn.getDataFromCellNamed(t, n, "gigant_tag");
					fn.callDatabase("gb_splitup_v4", 
							{wrdcat05: wrdcat, znwlid05: znwlid, flex: flex, gigant_tag: gigantTag});
				}
			},
			gigant_tag_extended: {
				"bgcolor": "#E3F6CE",
				"editable": true
			}
		}
};