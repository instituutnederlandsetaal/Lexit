/**
 * Client configuration file
 * 
 * This files contains some lists of settings:
 * - oHiddenTablesList		:	list of tables from the database which should not be shown in the GUI
 * - oTableConfiguationList	:	list of tables and their configuration in the GUI
 * 
 * AVAILABLE SETTINGS for the oTableConfiguationList:
 * -------------------------------------------------
 * For each column, the following binary properties can be set:
 * 
 * PARAMETER		TYPE		DEFAULT VALUE
 * ---------        ----		-------------
 * button		:	string		-		(put at button in the current column with the name given as a string)
 * button_tooltip:	string		""		(set a tooltip for the button in the current column)
 * colsort		: 	string		null	(default sorting direction 'asc' or 'desc')
 * visible		:	boolean		true
 * searchable	:	boolean		true
 * sortable		:	boolean		true
 * editable		:	boolean		false
 * editfunc		:	function	-		(custom action to perform upon edit; the default action
 * 										 is to update the current cell content)
 * edittrigger	:	string		null	(a regex the content of a cell has to match with to
 * 										 trigger the customized edit function in 'editfunc';
 * 										 if edittrigger is null, the customized edit function is always called)
 * editrefresh	:	array		null	(list of other tables that must be refreshed upon editing of
 * 										 current cell content)
 * action		:	function	-		(action to perform upon click on content)
 * filter		:	string		null	(filter upon initialization of table)
 * keepfilter	:	boolean		false	(if true, the initialization filter will be re-applied 
 * 										 when clicking on the reset button; to be prevent the user
 * 										 from setting the filter otherwise, searchable must be set to false)
 * searchform	:	function	-		(when sending a search request from the search box of this column,
 * 										 apply this function, if available)
 * 
 * USAGE:
 * -----
 * So for example, if you want column 'book' in table 'books_list' to be hidden,
 * just put:
 * 
 * 	books_list : {
 * 		book : ["visible":false, ...]
 * 		}
 * 
 * When defining a function, always refer to the Datatables tables objects or nodes
 * with 'confTable' or 'confNode'. This is to prevent use of other variable names
 * being already in use elsewhere. Ex:
 * 
 * 		book : ["click": function(confTable, confNode){
							var content = confTable.fnGetData(confNode);
							...
							} ]
 */


// list of tables that must be hidden
oHiddenTablesList = [];

oTableSettingsList = [];


// container object for the configuration of each table
oTableConfigurationList = {
		
		hulk_bewerkingen : {},
		hulk_uploads : {},
		hulk_users : {},
		lemma_oordelen : {},
		lemmas : {},
		lemmasources : {},
		redacteuren : {},
		sources : {},
		wordform_feature_assignments : {},
		wordform_feature_values : {},
		wordform_features : {},
		wordform_oordelen : {},
		wordforms : {},
		wordformsources : {}

};