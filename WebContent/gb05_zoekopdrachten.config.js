


// list of tables that must be hidden
oHiddenTablesList = [];

oTableSettingsList = {
		gb05_zoekopdrachten:{
			column_order:["q", "zoekvorm", "timestamp", "ip", "from", "found"]
		},
		gb05_zoekopdrachten_bu_tem_2011_08_31: {
			column_order:["q", "zoekvorm", "timestamp", "ip", "from", "found"]
		}
};


// container object for the configuration of each table
oTableConfigurationList = {

		gb05_zoekopdrachten: {
			timestamp: {colsort: "asc"},
			from: {choosefrom: ["", "W", "T", "B"]},
			found: {choosefrom: ["", "0", "1", "2", "3"]}
		},
		gb05_zoekopdrachten_bu_tem_2011_08_31: {
			timestamp: {colsort: "asc"},
			from: {choosefrom: ["", "W", "T", "B"]},
			found: {choosefrom: ["", "0", "1", "2", "3"]}
		}
};