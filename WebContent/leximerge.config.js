


// list of tables that must be hidden
oHiddenTablesList = [];

oTableSettingsList = {
		
		// original sources
		"GB05_004": {"nice_name": "Groen boekje 2005"},
		"GB05_004_lemmata_and_wordforms": {"nice_name": "Groen boekje - lemmata & woordvormen"},
		"lemmata": {"nice_name": "WNT lemmata"},
		"simple_analyzed_wordforms_with_dateranges": {"nice_name": "WNT analyzed_wordforms"},
		"words": {"nice_name": "HulK lemmata"},
		"jvklex_lemmata": {"nice_name": "JvkLex lemmata"},
		
		// comparison tables
		"jvklex_vs_gb05": {"nice_name": "Jvklex vs. Groen boekje"},
		"hulk_vs_gb05": {"nice_name": "HulK vs. Groen boekje"},
		"lemmata_after_1900": {"nice_name": "WNT lemmata na 1900"},
		"jvklex_vs_gb05_vs_wnt": {"nice_name": "Jvklex vs. Groen boekje vs. WNT"}
};


// container object for the configuration of each table
oTableConfigurationList = {
		
		"GB05_004_lemmata_and_wordforms" :{
			"gb05_id":{
				"colsort": "asc"
			},
			"wrdcat": {"choosefrom": []},
			"comment": {"choosefrom": []}
		},
		
		"jvklex_vs_gb05": {
			"jvk_lemma": {"bgcolor": "#CED8F6"},
			"jvk_pos": {"bgcolor": "#CED8F6"},
			"gb_lemma": {"bgcolor": "#CEF6D8"},
			"gb_pos": {"bgcolor": "#CEF6D8"}
		},
		
		"hulk_vs_gb05": {
			"hulk_lemma": {"bgcolor": "#CED8F6"},
			"hulk_pos": {"bgcolor": "#CED8F6"},
			"gb_lemma": {"bgcolor": "#CEF6D8"},
			"gb_pos": {"bgcolor": "#CEF6D8"}
		},
		
		"jvklex_vs_gb05_vs_wnt": {
			"jvk_lemma": {"bgcolor": "#CED8F6"},
			"jvk_pos": {"bgcolor": "#CED8F6"},
			"gb_lemma": {"bgcolor": "#CEF6D8"},
			"gb_pos": {"bgcolor": "#CEF6D8"},
			"wnt_lemma": {"bgcolor": "#F8E0F7"},
			"wnt_pos": {"bgcolor": "#F8E0F7"}
		}

			
};