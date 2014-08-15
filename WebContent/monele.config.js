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
oHiddenTablesList = ["lemma", "lemma_mnl", "modnedlemma", "overzicht"];

oTableSettingsList = {};

// container object for the configuration of each table
oTableConfigurationList = {
		
		log : {
			id : {"colsort": "desc"},
			operatie : {},
			details : {},
			datum : {}
		},
	
		monele : {
			
			verwijderen			: {
				"button": "Ontkoppel",
				"button_tooltip": "Verwijder de link tussen dit moderne lemma en dit historische lemma",
				"sortable": false,
				"click": function(confTable, confNode){
					var answer = confirm("Wilt u het lemma en het moderne lemma van deze rij echt ontkoppelen?");
					if (answer){
						fn.showProcessingMsg(confTable);
						fn.removeFromDatabaseGivenANode(confTable, confNode, true, null);						
						}
					}			
			},
			woordenboek			: {
				"copy_upon_insert": true,
				"searchform": function(value){return value.toUpperCase();}
				},
			id					: {
				"copy_upon_insert": true,
				// clicking on id opens the GTB with the right ID and DIC
				"click": function(confTable, confNode){
					var id = fn.getDataFromCellNode(confTable, confNode);
					var dic = fn.getDataFromSiblingNode(confTable, confNode, "woordenboek");
					if (dic=='VMNW') id="ID"+id;
					var url = "http://gtb.inl.nl/iWDB/search?actie=article&wdb="+dic+"&id="+id+"&content-type=text/html; charset=utf-8";
					window.open(url);
				},
				"sortable": false
			},
			lemma				: {
				"copy_upon_insert": true,
				"colsort": "asc"
					},
			modnedlemma			: {
				"copy_upon_insert": true,
				"editable": true,
				"editfunc" : function(confTable, confNode, value){
					
					var id = fn.getDataFromSiblingNode(confTable, confNode, "id");
					var dic = fn.getDataFromSiblingNode(confTable, confNode, "woordenboek");
					
					fn.showProcessingMsg(confTable);
					var modnedlemmas = value.split("\|");
					if (modnedlemmas.length==1)
						{
						fn.updateDatabaseGivenANode(confTable, confNode, null, value, true, 
								function(){fn.refreshTable("overzicht");});
						}
					else
						{
						for (var i =0; i<modnedlemmas.length; i++)
							{
								// redraw the table after last insert only
								var redrawTable = (i+1 == modnedlemmas.length);
								var callback = redrawTable ? function(){fn.refreshTable("overzicht");}: null;
								fn.insertIntoDatabase(confTable, 
										{"modnedlemma": modnedlemmas[i], "lemma_id": dic+id}, null, 
										redrawTable, callback);						
							}
						}
					}
				},			
			woordsoort			: {
				"copy_upon_insert": true,
				"editable": true
				},
			status				: {"copy_upon_insert": true, "sortable": false},
			lemma_id			: {"visible": false},
			modnedlem_id		: {"visible": false},
			overzicht			: {
				"button": "Overzicht",
				"button_tooltip": "Toon alle historische lemmata gekoppeld aan dit moderne lemma",
				"sortable": false,
				"click": function(confTable, confNode){
					var content = fn.getDataFromSiblingNode(confTable, confNode, "modnedlem_id");	
					fn.callDatabase("overzicht", {"modnedlem_id": content},
							function(){fn.scrollToTable("overzicht");});
					
					}
			},
			pkid				: {"visible": false},
			lemmacheck			: {				
				"button": "Check",
				"button_tooltip": "Toon alle moderne lemmata gekoppeld aan dit historische lemma",
				"sortable": false,
				"click": function(confTable, confNode){
					var lemmaForm = fn.getDataFromSiblingNode(confTable, confNode, "lemma");	
					var id = fn.getDataFromSiblingNode(confTable, confNode, "id");
					var dic = fn.getDataFromSiblingNode(confTable, confNode, "woordenboek");
					fn.callDatabase("overzicht", {"id": "^"+id+"$", "woordenboek": "^"+dic+"$"},
							function(){fn.scrollToTable("overzicht");});
					
					}
			}
			
		},
		
		
		
		
		
		overzicht : {
			
			verwijderen			: {
				"button": "Ontkoppel",
				"button_tooltip": "Verwijder de link tussen dit moderne lemma en dit historische lemma",
				"sortable": false,
				"click": function(confTable, confNode){
					var answer = confirm("Wilt u het lemma en het moderne lemma van deze rij echt ontkoppelen?");
					if (answer){
						fn.removeFromDatabaseGivenANode(confTable, confNode, true, null);
						}
					}			
			},
			woordenboek			: {
				"copy_upon_insert": true,
				"searchform": function(value){return value.toUpperCase();} 
			},
			id					: {
				"copy_upon_insert": true,
				// clicking on id opens the GTB with the right ID and DIC
				"sortable": false,
				"click": function(confTable, confNode){
					var id = fn.getDataFromCellNode(confTable, confNode);
					var dic = fn.getDataFromSiblingNode(confTable, confNode, "woordenboek");
					if (dic=='VMNW') id="ID"+id;
					var url = "http://gtb.inl.nl/iWDB/search?actie=article&wdb="+dic+"&id="+id+"&content-type=text/html; charset=utf-8";
					window.open(url);
				}
			},
			lemma				: {
				"copy_upon_insert": true,
				"colsort": "asc"
					},
			modnedlemma			: {
				"copy_upon_insert": true,
				"editable": true,
				"editfunc" : function(confTable, confNode, value){
					
					var id = fn.getDataFromSiblingNode(confTable, confNode, "id");
					var dic = fn.getDataFromSiblingNode(confTable, confNode, "woordenboek");
										
					fn.showProcessingMsg(confTable);
					var modnedlemmas = value.split("\|");
					if (modnedlemmas.length==1)
						{
						fn.updateDatabaseGivenANode(confTable, confNode, null, value, true, 
								function(){fn.refreshTable("monele");});
						}
					else
						{
						for (var i =0; i<modnedlemmas.length; i++)
							{
								// redraw the table after last insert only
								var redrawTable = (i+1 == modnedlemmas.length);
								var callback = redrawTable ? function(){fn.refreshTable("monele");}: null;
								fn.insertIntoDatabase(confTable, 
										{"modnedlemma": modnedlemmas[i], "lemma_id": dic+id}, null, 
										redrawTable, callback);
							}	
						}
					}
				},
			woordsoort			: {
				"copy_upon_insert": true,
				"editable": true
				},
			status				: {
				"copy_upon_insert": true, 
				"sortable": false
				},
			lemma_id			: {"visible": false},
			modnedlem_id		: {"visible": false},
			overzicht			: {
				"sortable": false
			},
			lemmacheck			: {
				"sortable": false
			},
			pkid				: {"visible": false}
			
		}

};