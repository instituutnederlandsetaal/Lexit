// list of tables that must be hidden or visible (don't use both, it's a matter of what's the most convenient)
oHiddenTablesList = [];
oShowOnlyTables = ["AllPersons", "NLPerson"];


// functions

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



// table general settings
oTableSettingsList = {};


// configuration at column level
oTableConfigurationList = {
		
		
		"AllPersons": {
			
			"pkid": {
				"visible": false
			},
			
			 
			
			"lastName": {
				"editable": true,
				"bgcolor": "#E0F8EC",
				"colsort": "asc"   // sort #1
			},
			
			"firstName": {
				"editable": true,
				"bgcolor": "#E0F8EC",
				"colsort": "asc"   // sort #2
			}, 
			"personNameID": {
				"visible": false,
				"colsort": "asc"   // sort #3
			}, 
			
			
			
			"personID": {
				"cell_tooltip": "Klik hier om de persoonsdetails op te zoeken", 
				"click": function(t, n){
					var sId = fn.getDataFromCellNode(n);
					fn.callDatabase("NLPerson", 
							{"nederlabID": sId}, 
							function(){fn.scrollToTable("NLPerson");}, 
							{"viewtype": "form"});
					
				}
			}, 
			
			"prefixTitle": {
				"editable": true,
				"bgcolor": "#E0F8EC"
			},
			
			
			
			"firstNameFull": {
				"editable": true,
				"bgcolor": "#E0F8EC"
			}, 
			"infixes": {
				"editable": true,
				"bgcolor": "#E0F8EC"
			}, 
			 
			"additonalTitle": {
				"editable": true,
				"bgcolor": "#E0F8EC"
			}, 
			"organisationName": {
				"editable": true,
				"bgcolor": "#E0F8EC"
			},
			"yearOfBirthLabel": {
				// modif happens in NLPerson table
			}, 
			"yearOfDeathLabel" : {
				// modif happens in NLPerson table
			}
			
		},
		
		
		"NLPerson": {
			
			"nederlabID": {
				"visible": false
			},
			"editorialCode": {
				// ?
			},
			"versionID": {
				// ?
			},
			"sourceRef" : {
				// ?
			},
			"sourceCollection" : {
				// ?
			},
			"preferredNameID" : {
				// don't modify that!
			},
			"dateOfBirthDayMonth" : {
				"editable": true,
				"bgcolor": "#E0F8EC"
			},
			"yearOfBirthMin" : {
				"editable": true,
				"bgcolor": "#E0F8EC",
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
				"bgcolor": "#E0F8EC",
	    		"editcallback": function(t, n, value){
	    			
	    			var yearOfBirthMin = fn.getDataFromSiblingNode(n, "yearOfBirthMin");
	    			var yearOfBirthMax = value;
	    			var yearOfBirthApprox = fn.getDataFromSiblingNode(n, "yearOfBirthApprox");
	    			
	    			// update the year of death label if necessary
	    			updateYearOfBirthLabel(t, n, yearOfBirthMin, yearOfBirthMax, yearOfBirthApprox);
	    			
	    		}
			},
			"yearOfBirthApprox" : {
				"editable": true,
				"bgcolor": "#E0F8EC",
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
			"yearOfBirthLabel" : {
				// automatic
			},
			"placeOfBirthID" : {
				// ?
			},
			"placeOfBirth" : {
				"editable": true,
				"bgcolor": "#E0F8EC"
			},
			"dateOfDeathDayMonth" : {
				"editable": true,
				"bgcolor": "#E0F8EC"
			},
			"yearOfDeathMin" : {
				"editable": true,
				"bgcolor": "#E0F8EC",
	    		"editcallback": function(t, n, value){
	    			
	    			var yearOfDeathMin = value;
	    			var yearOfDeathMax = fn.getDataFromSiblingNode(n, "yearOfDeathMax");
	    			var yearOfDeathApprox = fn.getDataFromSiblingNode(n, "yearOfDeathApprox");
	    			
	    			// update the year of birth label if necessary
	    			updateYearOfDeathLabel(t, n, yearOfDeathMin, yearOfDeathMax, yearOfDeathApprox);
	    		}
			},
			"yearOfDeathMax" : {
				"editable": true,
				"bgcolor": "#E0F8EC",
	    		"editcallback": function(t, n, value){
	    			
	    			var yearOfDeathMin = fn.getDataFromSiblingNode(n, "yearOfDeathMin");
	    			var yearOfDeathMax = value;
	    			var yearOfDeathApprox = fn.getDataFromSiblingNode(n, "yearOfDeathApprox");
	    			
	    			// update the year of death label if necessary
	    			updateYearOfDeathLabel(t, n, yearOfDeathMin, yearOfDeathMax, yearOfDeathApprox);
	    			
	    		}
			},
			"yearOfDeathApprox" : {
				"editable": true,
				"bgcolor": "#E0F8EC",
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
			},
			"yearOfDeathLabel" : {
				// automatic
			},
			"placeOfDeathID" : {
				"visible": false
			},
			"placeOfDeath" : {
				"editable": true,
				"bgcolor": "#E0F8EC"
			},
			"gender" : {
				"editable": true,
				"bgcolor": "#E0F8EC"
			},
			
		}

};


// start up!

fn.callDatabase("AllPersons", null, function(){
	fn.callDatabase("NLPerson", 
			null, 
			function(){
				fn.setActiveTable("AllPersons");
			},	
			{"viewtype": "form"});
});