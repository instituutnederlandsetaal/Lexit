// list of tables that must be hidden or visible (don't use both, it's a matter of what's the most convenient)
oHiddenTablesList = [];
oShowOnlyTables = ["databases_doc"];

// table general settings
oTableSettingsList = {
		databases_doc: {
			
			"button_0":{
				"name": "Tabel toevoegen",
				"click": function(t){
					
					var wordform = fn.prompt("Geef een host, een database, en een tabelnaam", 
							["host", "database_name", "table_name"], 
							["", "", ""], 
							function(){
						
						var sHost = fn.getPromptBoxInput("host");
						var sDatabaseName = fn.getPromptBoxInput("database_name");
						var sTableName = fn.getPromptBoxInput("table_name");
						
						
						fn.callFunction("insert_database_record", 
								[sHost, sDatabaseName, sTableName], 
								null, null, null, null, 
								function(){
							
							fn.refreshTable(t);
							//var sId = fn.getFunctionOutput();							
							//fn.goToTheRightPage(t, "id", sId);
						});
					});
				}
			},
			
			"button_1": {
				"name": "Verwijder selectie",
				"click": function(t){
					
					var answer = confirm("Weet u het zeker?");
					
					if (answer){
						
						var aRows = fn.getSelectedRowsFrom(t);
						aRows.each(function(){
							
							var bLastRow = fn.isLastNodeOf(this, aRows);
							var sId = fn.getDataFromCellNamed(t, this, "id");
							
							fn.removeFromDatabaseGivenFieldValues("databases_doc", 
									{"id": sId}, 
									false,
									function(){
										if (bLastRow) fn.refreshTable(t);
									});
							
						});
					}
					
				}
			},
			
			"column_order": [
			                 "id",
			                 "host",
			                 "database_name",
			                 "schema_name",
			                 "table_name",
			                 "description",			                 
			                 "descr_date",
			                 "status",
			                 "owner",
			                 "open_doc",
			                 "documentation"
			                 ]
		}
};


// configuration at column level
oTableConfigurationList = {
		
		databases_doc:{
			"id": {
				"visible": false
			},
			"host": {
				"choosefrom": [],
				"colsort": "asc",
				"editable": true,
				"editcallback": function(t, n, value){
					fn.updateDatabaseGivenANode(fn.getRowNode(n), 
							{"descr_date": fn.getCurrentTimestamp("YYYY-MM-DD HH:MI:SS")}, 
							function(){
						fn.refreshTable(t);
					});
				}
			},
			"database_name": {
				"choosefrom": [],
				"colsort": "asc",
				"editable": true,
				"editcallback": function(t, n, value){
					fn.updateDatabaseGivenANode(fn.getRowNode(n), 
							{"descr_date": fn.getCurrentTimestamp("YYYY-MM-DD HH:MI:SS")}, 
							function(){
						fn.refreshTable(t);
					});
				}
			},
			"schema_name": {
				"colsort": "asc",
				"editable": true,
				"editcallback": function(t, n, value){
					fn.updateDatabaseGivenANode(fn.getRowNode(n), 
							{"descr_date": fn.getCurrentTimestamp("YYYY-MM-DD HH:MI:SS")}, 
							function(){
						fn.refreshTable(t);
					});
				}
			},
			"table_name": {
				"colsort": "asc",
				"editable": true,
				"editcallback": function(t, n, value){
					fn.updateDatabaseGivenANode(fn.getRowNode(n), 
							{"descr_date": fn.getCurrentTimestamp("YYYY-MM-DD HH:MI:SS")}, 
							function(){
						fn.refreshTable(t);
					});
				}
			},
			"description": {
				"editable": true,
				"editcallback": function(t, n, value){
					fn.updateDatabaseGivenANode(fn.getRowNode(n), 
							{"descr_date": fn.getCurrentTimestamp("YYYY-MM-DD HH:MI:SS")}, 
							function(){
						fn.refreshTable(t);
					});
				}
			},
			"documentation": {
				"editable": true,
				"editcallback": function(t, n, value){
					fn.updateDatabaseGivenANode(fn.getRowNode(n), 
							{"descr_date": fn.getCurrentTimestamp("YYYY-MM-DD HH:MI:SS")}, 
							function(){
						fn.refreshTable(t);
					});
				}
			},
			"descr_date": {
				"editable": true
				// no callback for update of the date here
			},
			"status": {
				"editable": true,
				"editcallback": function(t, n, value){
					fn.updateDatabaseGivenANode(fn.getRowNode(n), 
							{"descr_date": fn.getCurrentTimestamp("YYYY-MM-DD HH:MI:SS")}, 
							function(){
						fn.refreshTable(t);
					});
				}
			},
			"owner": {
				"choosefrom": [],
				"editable": true,
				"editcallback": function(t, n, value){
					fn.updateDatabaseGivenANode(fn.getRowNode(n), 
							{"descr_date": fn.getCurrentTimestamp("YYYY-MM-DD HH:MI:SS")}, 
							function(){
						fn.refreshTable(t);
					});
				}
			},
			"open_doc": {
				"button": "Open doc",
				"click": function(t, n){
					var sDoc = fn.getDataFromSiblingNode(t, n, "documentation");
					window.open(sDoc);
				}
			}
		}

};