// list of tables that must be hidden or visible (don't use both, it's a matter of what's the most convenient)
oHiddenTablesList = [];
oShowOnlyTables = []; //["quickview_titles", "quickview_dependent_titles", "quickview_persons", "metadata"];



//Autocomplete configuration
//see: http://stackoverflow.com/questions/5077409/what-does-autocomplete-request-server-response-look-like
//http://stackoverflow.com/questions/18677536/jeditable-and-jquery-ui-autocomplete
var sAutoCompleteSelectorTitlesPersonName = "#quickview_titles .personName";
var sAutoCompleteSelectorDependentTitlesPersonName = "#quickview_dependent_titles .personName";

$(document).on(
   "focus", 
   sAutoCompleteSelectorTitlesPersonName, 
   function(event) {
   	
   	$(event.target).autocomplete({
       	
   		delay: 750,
         minLength: 2,
	        source: function(request, response){
	            	
	           	fn.callFunction("get_authors", [ fn.quote( request.term ) ], 
	          		function(func_resp){  
	            		
	            		var aSuggestionsArr = 
	            			(func_resp["get_authors"]).split("|");
	            		
	            		response($.map(aSuggestionsArr, function (item) {
	                        return {
	                            label: item.split(":::")[0],
	                            value: item.split(":::")[1]
	                        };
	                    }));
	            	});
	            }
       });
       
   }
);

$(document).on(
		   "focus", 
		   sAutoCompleteSelectorDependentTitlesPersonName, 
		   function(event) {
		   	
		   	$(event.target).autocomplete({
		       	
		   		delay: 750,
		         minLength: 2,
			        source: function(request, response){
			            	
			           	fn.callFunction("get_authors", [ fn.quote( request.term ) ], 
			          		function(func_resp){  
			            		
			            		var aSuggestionsArr = 
			            			(func_resp["get_authors"]).split("|");
			            		
			            		response($.map(aSuggestionsArr, function (item) {
			                        return {
			                            label: item.split(":::")[0],
			                            value: item.split(":::")[1]
			                        };
			                    }));
			            	});
			            }
		       });
		       
		   }
		);


var sAutoCompleteSelectorPersonName_searchbox_firstName = "#quickview_persons_searchbox_firstName";
var sAutoCompleteSelectorPersonName_searchbox_lastName = "#quickview_persons_searchbox_lastName";

$(document).on(
		   "focus", 
		   sAutoCompleteSelectorPersonName_searchbox_firstName, 
		   function(event) {
		   	
		   	$(event.target).autocomplete({
		       	
		   		delay: 750,
		         minLength: 2,
			        source: function(request, response){
			        	
			        	var lastName = $(sAutoCompleteSelectorPersonName_searchbox_lastName).val();
			            	
			           	fn.callFunction("get_firstname", [ fn.quote( request.term ), fn.quote( lastName ) ], 
			          		function(func_resp){  
			            		
			            		var aSuggestionsArr = 
			            			(func_resp["get_firstname"]).split("|");
			            		
			            		response($.map(aSuggestionsArr, function (item) {
			                        return {
			                            label: item,
			                            value: item
			                        };
			                    }));
			            	});
			            }
		       });
		       
		   }
		);






$(document).on(
		   "focus", 
		   sAutoCompleteSelectorPersonName_searchbox_lastName, 
		   function(event) {
		   	
		   	$(event.target).autocomplete({
		       	
		   		delay: 750,
		         minLength: 2,
			        source: function(request, response){
			        	
			        	var firstName = $(sAutoCompleteSelectorPersonName_searchbox_firstName).val();
			            	
			           	fn.callFunction("get_lastname", [ fn.quote( request.term ), fn.quote( firstName ) ], 
			          		function(func_resp){  
			            		
			            		var aSuggestionsArr = 
			            			(func_resp["get_lastname"]).split("|");
			            		
			            		response($.map(aSuggestionsArr, function (item) {
			                        return {
			                            label: item,
			                            value: item
			                        };
			                    }));
			            	});
			            }
		       });
		       
		   }
		);



// table general settings
oTableSettingsList = {
    
    "quickview_titles": {
        "group": "views"
    },
    
    "quickview_dependent_titles": {
        "group": "views"
    },
    
    "metadata": {
        "group": "views"
    },
    
    "quickview_persons": {
    	"group": "views"
    }
    
};

function updateYearOfBirthLabel(t, n, yearOfBirthMin, yearOfBirthMax, yearOfBirthApprox){
	
	if ( yearOfBirthMin != '' && yearOfBirthMax != '' )
	{
	if (yearOfBirthMin != yearOfBirthMax)
		{
		fn.updateDatabaseGivenANode(n, {"yearOfBirthApprox": "1", "yearOfBirthLabel": "ca. "+yearOfBirthMin+"-"+yearOfBirthMax},
				function(){fn.refreshTable(t);} );	
		}
	else
		{
		fn.updateDatabaseGivenANode(n, {"yearOfBirthLabel": (yearOfBirthApprox =='1'?"ca. ":"") + yearOfBirthMin},
				function(){fn.refreshTable(t);} );	
		}
	
	}
}


function updateYearOfDeathLabel(t, n, yearOfDeathMin, yearOfDeathMax, yearOfDeathApprox){
	
	if ( yearOfDeathMin != '' && yearOfDeathMax != '' )
	{
		
	if (yearOfDeathMin != yearOfDeathMax)
		{
		
		fn.updateDatabaseGivenANode(n, {"yearOfDeathApprox": "1", "yearOfDeathLabel": "ca. "+yearOfDeathMin+"-"+yearOfDeathMax},
				function(){fn.refreshTable(t);} );	
		}
	else
		{
		
		fn.updateDatabaseGivenANode(n, {"yearOfDeathLabel": (yearOfDeathApprox =='1'?"ca. ":"") + yearOfDeathMin},
				function(){fn.refreshTable(t);} );	
		}
	
	}
}


// configuration at column level
oTableConfigurationList = {
		
		
		"":{},
		
		"quickview_persons": {
			
			"personNameID": {
				"visible": false
			},
			
			"persoonmetadata": {
				
				"button": "Persoonsgegeven",
				"click": function(t, n){
					
					var personNameId = fn.getDataFromSiblingNode(n, "personNameID");
					var personId = fn.getDataFromSiblingNode(n, "personID");
					
					
					fn.callFunction("get_person_details", [personId, personNameId], 
	    					function(){
	    				
	    				var bTableAlreadyExists = fn.tableExists("NLPerson");
	    				
	    				fn.callDatabase("NLPerson", { "nederlabID": personId }, 
	    						function(){
	    					
	    							setTimeout(function(){fn.scrollToTable("NLPerson");}, 200);
	    							
									if ( !bTableAlreadyExists )
										setTimeout(function(){fn.refreshTable("NLPerson");}, 200);
								},
	    						{"viewtype": "form"});
	    			});
				}
				
			},
			
			"personID": {
				"visible": false
			},
			
			"titels": {
				
				"button": "Publicaties",
				"click": function(t, n){
					
					var personId = fn.getDataFromSiblingNode(n, "personID");
					
					fn.callFunction("get_title_of_person", [personId], function(output){
	    				
	    				fn.callDatabase("NLTitle", {"nederlabID": output["get_title_of_person"]}, function(){
	    					
	    					setTimeout(function(){fn.scrollToTable("NLTitle");}, 200);
	    					
	    					fn.callFunction("get_dependenttitle_of_person", [personId], function(output){
	    						
	    						fn.callDatabase("NLDependentTitle", {"nederlabID": output["get_dependenttitle_of_person"]});
	    						
	    					});
		    			});
	    				
	    			});
				}
				
			},
			
			"firstName": {
				"editable": true
			},
			"infixes": {
				"editable": true
			},
			"lastName": {
				"editable": true
			}
		},
		
		
		
		
		
		"quickview_titles": {
	        
			"personName": {
				"editable": true,
				"editfunc": function(t, n, value){
					
					var personId = value.split(" _ ")[1];
					
					fn.updateDatabaseGivenANode( n, {"personID": personId}, function(){
						
						fn.refreshTable(t);
					});
					
//					fn.callFunction("get_person_name", [personId], function(output){
//						
//						
//						var titleId = fn.getDataFromSiblingNode(n, "nederlabID"); 
//						
//						fn.updateDatabaseGivenFieldValues(t, {"nederlabID": titleId}, {"personName": output["get_person_name"]}, 
//								function(){ setTimeout(function(){fn.refreshTable(t);}, 200); });
//						
//						fn.updateDatabaseGivenFieldValues("st_NLTitle_NLPerson", {"titleID": titleId}, {"personID": personId});
//					});
					
				}
			},
			
			
			"personID": {
				"cell_tooltip": "Toon auteur",
				"click": function(t, n){
					
					var personId = fn.getDataFromCellNode(n);
					fn.callDatabase("quickview_persons", {"personID": personId}, function(){
						fn.scrollToTable("quickview_persons");
					});
				}
			}
			
			
	    },
	    
	    
	    
	    
		"quickview_dependent_titles": {
	        
			"personName": {
				"editable": true,
				"editfunc": function(t, n, value){
					
					var personId = value.split(" _ ")[1];
					
					fn.updateDatabaseGivenANode( n, {"personID": personId}, function(){
						
						fn.refreshTable(t);
					});
					
				}
			},
			
			
			"personID": {
				"cell_tooltip": "Toon auteur",
				"click": function(t, n){
					
					var personId = fn.getDataFromCellNode(n);
					fn.callDatabase("quickview_persons", {"personID": personId}, function(){
						fn.scrollToTable("quickview_persons");
					});
				}
			}
			
			
	    },
	    
	    
	    
	    
	    
	    "NLPerson": {
	    	
	    	"nederlabID": {
	    		
	    		"click": function(t, n){
	    			
	    			var nederlabId = fn.getDataFromCellNode(n);
	    			fn.callDatabase("PersonName", {"personID": nederlabId});
	    			
	    		}
	    		
	    	},
	    	
	    	"yearOfBirthMin": {
	    		"editable": true,
	    		"editcallback": function(t, n, value){
	    			
	    			var yearOfBirthMin = value;
	    			var yearOfBirthMax = fn.getDataFromSiblingNode(n, "yearOfBirthMax");
	    			var yearOfBirthApprox = fn.getDataFromSiblingNode(n, "yearOfBirthApprox");
	    			
	    			// update the year of birth label if necessary
	    			updateYearOfBirthLabel(t, n, yearOfBirthMin, yearOfBirthMax, yearOfBirthApprox);
	    		}
	    	},
	    	"yearOfBirthMax": {
	    		"editable": true,
	    		"editcallback": function(t, n, value){
	    			
	    			var yearOfBirthMin = fn.getDataFromSiblingNode(n, "yearOfBirthMin");
	    			var yearOfBirthMax = value;
	    			var yearOfBirthApprox = fn.getDataFromSiblingNode(n, "yearOfBirthApprox");
	    			
	    			// update the year of death label if necessary
	    			updateYearOfBirthLabel(t, n, yearOfBirthMin, yearOfBirthMax, yearOfBirthApprox);
	    			
	    		}
	    	},
	    	"yearOfBirthApprox": {
	    		"editable": true,
	    		"editfunc": function(t, n, value){
	    			
	    			var yearOfBirthMin = fn.getDataFromSiblingNode(n, "yearOfBirthMin");
	    			var yearOfBirthMax = fn.getDataFromSiblingNode(n, "yearOfBirthMax");
	    			var yearOfBirthApprox = value;
	    			
	    			// if the value is illegal, tell the user
	    			if (value != '' && value != '0' && value != '1')
	    				{
	    				fn.message("Let op!", "U mag hier alleen een 1 (=waar) of een 0 (=onwaar) invullen");
	    				}
	    			// otherwise, update the table as required
	    			else
	    				{
	    				// update the year of death label if necessary
		    			updateYearOfBirthLabel(t, n, yearOfBirthMin, yearOfBirthMax, yearOfBirthApprox);
		    			
	    				fn.updateDatabaseGivenANode( n, {"yearOfBirthApprox": value}, function(){
    						fn.refreshTable(t);
    						});
	    				}
	    		}
	    	},
	    	
	    	
	    	
	    	"yearOfDeathMin": {
	    		"editable": true,
	    		"editcallback": function(t, n, value){
	    			
	    			var yearOfDeathMin = value;
	    			var yearOfDeathMax = fn.getDataFromSiblingNode(n, "yearOfDeathMax");
	    			var yearOfDeathApprox = fn.getDataFromSiblingNode(n, "yearOfDeathApprox");
	    			
	    			// update the year of birth label if necessary
	    			updateYearOfDeathLabel(t, n, yearOfDeathMin, yearOfDeathMax, yearOfDeathApprox);
	    		}
	    	},
	    	"yearOfDeathMax": {
	    		"editable": true,
	    		"editcallback": function(t, n, value){
	    			
	    			var yearOfDeathMin = fn.getDataFromSiblingNode(n, "yearOfDeathMin");
	    			var yearOfDeathMax = value;
	    			var yearOfDeathApprox = fn.getDataFromSiblingNode(n, "yearOfDeathApprox");
	    			
	    			// update the year of death label if necessary
	    			updateYearOfDeathLabel(t, n, yearOfDeathMin, yearOfDeathMax, yearOfDeathApprox);
	    			
	    		}
	    	},
	    	"yearOfDeathApprox": {
	    		"editable": true,
	    		"editfunc": function(t, n, value){
	    			
	    			var yearOfDeathMin = fn.getDataFromSiblingNode(n, "yearOfDeathMin");
	    			var yearOfDeathMax = fn.getDataFromSiblingNode(n, "yearOfDeathMax");
	    			var yearOfDeathApprox = value;
	    			
	    			// if the value is illegal, tell the user
	    			if (value != '' && value != '0' && value != '1')
	    				{
	    				fn.message("Let op!", "U mag hier alleen een 1 (=waar) of een 0 (=onwaar) invullen");
	    				}
	    			// otherwise, update the table as required
	    			else
	    				{
	    				// update the year of birth label if necessary
		    			updateYearOfDeathLabel(t, n, yearOfDeathMin, yearOfDeathMax, yearOfDeathApprox);
		    			
	    				fn.updateDatabaseGivenANode( n, {"yearOfDeathApprox": value}, function(){
    						fn.refreshTable(t);
    						});
	    				}
	    		}
	    	}
	    	
	    },
	    
	    "PersonName": {
	    	
	    	"personID": {
	    		"click": function(t, n){
	    			
	    			var nederlabId = fn.getDataFromCellNode(n);
	    			fn.callDatabase("NLPerson", {"nederlabID": nederlabId});
	    			
	    		}
	    		
	    	},
	    	
	    	"firstName": {
	    		"editable": true
	    	},
	    	
	    	"infixes": {
	    		"editable": true
	    	},
	    	
	    	"lastName": {
	    		"editable": true
	    	},
	    	
	    	"firstNameFull": {
	    		"editable": true
	    	},
	    	
	    	"prefixTitle": {
	    		"editable": true
	    	},
	    	
	    	"additonalTitle": {
	    		"editable": true
	    	},
	    	
	    	"organisationName": {
	    		"editable": true
	    	}
	    	
	    	
	    },
	    
	    
//	    "PersonName": {
//	    	
//	    
//	    	"personNameID": {
//	    		
//	    		"cell_tooltip": "Toon persoon-metadata",
//	    		
//	    		"click": function(t, n){
//	    			
//	    			var personNameId = fn.getDataFromCellNode(n);
//	    			
//	    			fn.callFunction("get_person_details", [personNameId], 
//	    					function(output){
//	    				
//	    				var nederlabId = output["get_person_details"]; 
//	    				
//	    				var bTableAlreadyExists = fn.tableExists("NLPerson");
//	    				
//	    				fn.callDatabase("NLPerson", {"nederlabID": nederlabId}, 
//	    						function(){
//	    					
//	    							setTimeout(function(){fn.scrollToTable("NLPerson");}, 200);
//	    							
//									if ( !bTableAlreadyExists )
//										setTimeout(function(){fn.refreshTable("NLPerson");}, 200);
//								},
//	    						{"viewtype": "form"});
//	    			});
//	    			
//	    		}
//	    	},
//	    	
//	    	"personID": {
//	    		
//	    		"cell_tooltip": "Toon publicaties",
//	    		
//	    		"click": function(t, n){
//	    			
//	    			var personId = fn.getDataFromCellNode(n);
//	    			
//	    			fn.callFunction("get_title_of_person", [personId], function(output){
//	    				
//	    				fn.callDatabase("NLTitle", {"nederlabID": output["get_title_of_person"]}, function(){
//	    					
//	    					setTimeout(function(){fn.scrollToTable("NLTitle");}, 200);
//	    					
//	    					fn.callFunction("get_dependenttitle_of_person", [personId], function(output){
//	    						
//	    						fn.callDatabase("NLDependentTitle", {"nederlabID": output["get_dependenttitle_of_person"]});
//	    						
//	    					});
//		    			});
//	    				
//	    			});
//	    			
//	    			
//	    		}
//	    		
//	    	}
//	    		
//	    		
//	    }
	    	
		
};