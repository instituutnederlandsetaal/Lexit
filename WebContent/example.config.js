// list of tables that must be hidden or visible (don't use both, it's a matter of what's the most convenient)
oHiddenTablesList = [];
oShowOnlyTables = [];

// table general settings
oTableSettingsList = {};


// configuration at column level
oTableConfigurationList = {

};


//warning, so as make sure the user won't work in a development project
var sCurrentProjectName = paramsHash.get("db");
if ($.endsWith(sCurrentProjectName, '_dev'))
	fn.message("Let op", "Dit is een ontwikkelversie. Hier moet u niet in werken.");