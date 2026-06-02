
var termfieldselector = {};



/**
 * Mapping of field sets to tables in the database
 * AS the fields specified in each set are part of those tables
 */
termfieldselector.set2table = {
	
	"concepten": 	"termbank_concepten",
	"talen":		"termbank_talen",
	"termen": 		"termbank_termen",
	"conceptLinks":	"", // not needed: subpart of form (list)
	"termContexten":"", // not needed: subpart of form (list)
	"termvormen": 	""  // not needed: subpart of form (list)
}

/**
 * All fields that can be selected in the fieldsselector dialog.
 */
termfieldselector.allFields = {
	
	"concepten": [	 "concept_id", "conceptaanduiding", "externe_verwijzing", "definitie", "uri_externe_verwijzing", "domein", "opmerking_bij_het_domein",  //"definitie_id", 
					"opmerking_bij_de_definitie", "bron_van_de_definitie", "externe_afbeelding", "uri_naar_externe_afbeelding", "projectsubset", 
					"bewerkingsstatus", "bron_concept", //, "online_publicatie", "url_online_publicatie" 
					"aangemaakt_op", "aangemaakt_door", "gewijzigd_op", "gewijzigd_door", "klantensubset", "opmerking_bij_concept"],
	"conceptLinks": ["concept_id", "verwant_concept", "type_van_verwantschap"],
	"talen": [		//"taal_record_id", 
					"concept_id", "taal", "definitie", //"definitie_id", 
					"opmerking_bij_de_definitie", "bron_van_de_definitie", "projectsubset", 
					"bewerkingsstatus", //"online_publicatie", "url_online_publicatie", 
					"bron_taalspecifiek", "aangemaakt_op", "aangemaakt_door", "gewijzigd_op", "gewijzigd_door"],
	"termen": [		"concept_id", "taal", "term_id", "term", "externe_verwijzing", "uri_externe_verwijzing", "termtype", "verwijzing", "toelichting_verwijzing", 
					"woordsoort", "geslacht", "gebruiksstatus", "geografisch_gebruik", "locatie_in_applicatie", "opmerking_bij_de_term", 
					"aangemaakt_op", "aangemaakt_door", "gewijzigd_op", "gewijzigd_door", "projectsubset", "bewerkingsstatus", //"online_publicatie", "url_online_publicatie",
					"bron_van_de_term", "klantensubset"],
	"termContexten": ["term_id", "context", "termcontext_id", "bron_van_de_context"],
	"termvormen": [	"term_id", "termvorm_id", "termvorm", "upos", "bron_van_de_termvorm"]
};


/**
 * Mapping of fields to groups
 * (grouping is done in the form view, using jquery ui accordeon feature)
 */
termfieldselector.table2groups = {
	
	"termbank_concepten": {
		
		"basisgegevens": {
			"order": 1,
			"members": [
				"definitie", "concept_id", "conceptaanduiding", 
				"domein", "opmerking_bij_het_domein", 
				//"definitie_id", 
				"bron_van_de_definitie", "opmerking_bij_de_definitie", 
				"opmerking_bij_concept"
			]
		},
		"extra gegevens": {
			"order": 2,
			"members": [
				"bron_concept", 
				"externe_verwijzing", "uri_externe_verwijzing", 
				"externe_afbeelding", "uri_naar_externe_afbeelding"
			]
		},
		"administratieve gegevens": {
			"order": 3,
			"members": [
				"bewerkingsstatus",  "projectsubset", "klantensubset",
				"aangemaakt_op", "aangemaakt_door", "gewijzigd_op", "gewijzigd_door"  
				//"online_publicatie", "url_online_publicatie"
			]
		}
		
	},
	
	"termbank_talen": {
		
		"basisgegevens": {
			"order": 1,
			"members": [
				//"taal_record_id", 
				"concept_id", "taal", //"definitie_id", 
				"definitie", "bron_van_de_definitie", "opmerking_bij_de_definitie"				
			]
		},
		"administratieve gegevens": {
			"order": 2,
			"members": [
				"bewerkingsstatus", "bron_taalspecifiek",  "projectsubset", "aangemaakt_op", "aangemaakt_door", "gewijzigd_op", "gewijzigd_door" //, "online_publicatie", "url_online_publicatie"
			]
		}
		
	},
	
	"termbank_termen": {
		
		"basisgegevens": {		
			"order": 1,
			"members": [
				"concept_id", "taal",
				"term_id", "term",
				"woordsoort", "geslacht", "termtype","gebruiksstatus"
			]
		},
		"extra gegevens": {
			"order": 2,
			"members": [
				"externe_verwijzing", "uri_externe_verwijzing", "verwijzing", "toelichting_verwijzing",
				"geografisch_gebruik", "locatie_in_applicatie", "opmerking_bij_de_term"
			]
		},
		"administratieve gegevens": {
			"order": 3,
			"members": [
				"bewerkingsstatus", "bron_van_de_term", "projectsubset", "klantensubset",
				"aangemaakt_op", "aangemaakt_door", "gewijzigd_op", "gewijzigd_door" //, "online_publicatie", "url_online_publicatie"
			]
		}
		
	}
	
};


/**
 * Default fields selection to be shown in the fieldsselector dialog
 * 
 * (this is by definition a subset of termfieldselector.allFields)
 */
termfieldselector.defaults = {
	
	"concepten": {
		
		"compulsory": [				// BEWARE: compulsory export fields must be declared in DataAccess.exportConceptsTables()	
			"concept_id"
		],
		"default_selection": [
			"definitie", "concept_id", "conceptaanduiding", "bron_van_de_definitie", "aangemaakt_op", "aangemaakt_door", 
			"domein", "gewijzigd_op", "gewijzigd_door"
	]
	},
	"talen": {
		"compulsory": [				// BEWARE: compulsory export fields must be declared in DataAccess.exportLanguagesTable()
			"taal"
		],
		"default_selection": [			
			"aangemaakt_op", "aangemaakt_door", "gewijzigd_op", "gewijzigd_door", "taal" 
		]
	},
	"termen": {
		
		"compulsory": [				// BEWARE: compulsory export fields must be declared in DataAccess.exportTermsTables()
			"term", "taal", "concept_id", "bewerkingsstatus"
		],
		"default_selection": [
			"term_id", "concept_id", "aangemaakt_op", "aangemaakt_door", "gewijzigd_op", "gewijzigd_door", "bewerkingsstatus",
			"gebruiksstatus", "taal", "term", "termtype", "woordsoort"
		]
		
	},
	
	
	"conceptLinks": {
		
		"default_selection": [] // not needed: subpart of form (list)
		
	},
	"termContexten": {
		"default_selection": [] // not needed: subpart of form (list)
		
	},
	"termvormen": {
		"default_selection": [] // not needed: subpart of form (list)
	}	
};


/**
 * User settings, to be modified by the user in the fieldsselector dialog.
 * 
 * The default value of those settings is the same as the termfieldselector.defaults array.
 */
termfieldselector.user_settings = {
	
	"concepten": {
		"selection": cloneArray(termfieldselector.defaults["concepten"]["default_selection"])
	},
	"talen": {
		"selection": cloneArray(termfieldselector.defaults["talen"]["default_selection"])
	},
	"termen": {
		"selection": cloneArray(termfieldselector.defaults["termen"]["default_selection"])
	},
	"conceptLinks": {
		"selection": cloneArray(termfieldselector.defaults["conceptLinks"]["default_selection"])
	},
	"termContexten": {
		"selection": cloneArray(termfieldselector.defaults["termContexten"]["default_selection"])
	},
	"termvormen": {
		"selection": cloneArray(termfieldselector.defaults["termvormen"]["default_selection"])
	}
};



// ***********************************************************************************************
	
	
/**
 * Get the nice names of the fields of a given set:
 * those are the names to be shown in the fieldsselector dialog, wheras the actual field names are used in the database only. 
 */ 
termfieldselector.getNiceNames = function(sSetName){
	
	// get all fields of the set
	var aFields = termfieldselector.allFields[sSetName];
	var aNiceNames = [];
	
	// get table name corresponding to the current field set
	var sTableName = termfieldselector.set2table[sSetName];
	
	// get config and settings
	var aTableSettings = conf.getTableSettings(sTableName);
	var aTableConfig = conf.getTableConfig(sTableName);
	var oGrid = conf.getFormGrid(aTableSettings);

    // get the nice names of the fields
	for (var i = 0; i < aFields.length; i++) {
		var sColName = aFields[i];
		var aTableColumnConfig = conf.getColumnConfig(aTableConfig, sColName);
		var aFormColumnConfig = oGrid["cells"][sColName];
		
		var sTableNiceName =	(aTableColumnConfig != null ? conf.getColumnNiceName(aTableColumnConfig) : null);
		var sFormNiceName =		(aFormColumnConfig != null ? aFormColumnConfig["nice_name"] : null);
		
		// by default the nice name should be the one declared in the form config
		// if not, it should be the one declared in the table config
		// if not, it should be the column name itself (with capital in front, and spaces instead of underscores)
		
		var sNiceName = (sFormNiceName != null ? sFormNiceName : sTableNiceName);
		if (sNiceName == null){
			sNiceName = sColName.replace(/_/g, " ");
			sNiceName = sNiceName.charAt(0).toUpperCase() + sNiceName.slice(1);
		}	
		
		aNiceNames.push(sNiceName);
	}

	return aNiceNames;	
};


/**
 * Translate a list of field names to a list of nice names
 */
termfieldselector.translateList = function(aList, sSetName){
	
	var aNewList = [];
	var aNiceNames = termfieldselector.getNiceNames(sSetName);
	for (var i=0; i<aList.length; i++) {
		var oneField = aList[i];
		var idx = termfieldselector.allFields[sSetName].indexOf(oneField);
		aNewList.push( aNiceNames[idx] );
	}
	
	return aNewList;
}




/**
 * Show the dialog for selecting fields
 */
termfieldselector.showDialog = function (sSetName, fnCallback) {	
	
	var aListOfFieldSets = {};
	
	
	// if no field set is given, use the default list of field sets
	// and otherwise, use the specified field set
	
	if (sSetName == null) {
		aListOfFieldSets = new cloneObject(termfieldselector.allFields);
	}
	else {
		aListOfFieldSets[sSetName] = termfieldselector.allFields[sSetName];
	}

	// sort the lists alphabetically (just in case the declaration is not)
	//for (oneCategory in aListOfFieldSets) {
	//	aListOfFieldSets[oneCategory] = aListOfFieldSets[oneCategory].sort();
	//}



	// build the fields selector dialog

	var sHtml =
		(sSetName == null ? 
			"<div id=\"fieldsselector\">" 					  // default layout
			: 
			"<div id=\"fieldsselector\" class=\"single\">"    // single list requires other layout  
		)+
		
		"  <div>";		
	for (oneCategory in aListOfFieldSets) {
		sHtml += 
			"    <span><b>Beschikbare velden voor '"+oneCategory+"'</b></span><BR>"+
			"    <div class=\"leftside\" id=\""+oneCategory.toLowerCase()+"\">"+
			"      <ul class=\"leftlist\" id=\""+oneCategory.toLowerCase()+"\"></ul>"+
			"    </div><BR>";
	}		
	sHtml +=
		"  </div>";
		
	sHtml +=
		"  <div id=\"arrows\">"+
		"    <button id=\"send\"><span class=\"ui-icon ui-icon-circle-triangle-e\"></span></button>"+		
		"    <button id=\"withdraw\"><span class=\"ui-icon ui-icon-circle-triangle-w\"></span></button>"+
		"  </div>"+
		
		"  <div>";
	for (oneCategory in aListOfFieldSets) {
		sHtml +=
			"    <span><b>Gekozen velden voor '"+oneCategory+"'</b></span><BR>"+
			"    <div class=\"rightside\" id=\""+oneCategory.toLowerCase()+"\">"+
			"      <ul class=\"rightlist\" id=\""+oneCategory.toLowerCase()+"\"></ul>"+
			"    </div><BR>";
	}
	sHtml +=
		"  </div>"+
		"</div>";
	
	
	
	
	const queue = new FunctionQueue();
			
	queue.enQueue(function(){
	
		// show dialog	
		fn.message("Veldkeuze", sHtml, function(){
			if (fnCallback != null) {
				fnCallback();
			}
		});
		
	});
	
	queue.enQueue(function(){
	
		// put values into boxes	
		
		for (oneCategory in aListOfFieldSets) {
			
			var aList = termfieldselector.allFields[oneCategory];
			var aListOfNiceNames = termfieldselector.getNiceNames(oneCategory);
			
			
			var id = oneCategory.toLowerCase();
			
			for (var i=0; i<aList.length; i++) {
				
				bSelected = ( termfieldselector.user_settings[oneCategory]["selection"] ).indexOf(aList[i]) != -1;
				
				// put the items that are chosen by default, into the right box
				if (bSelected){
					$("ul#"+id+".rightlist").append(
						$("<li></li>")
							.data('value', aList[i])
							.text(aListOfNiceNames[i])
					);
				}
				
				// put the other items, that are NOT chosen by default, into the left box
				else {
					$("ul#"+id+".leftlist").append(
						$("<li></li>")
							.data('value', aList[i])
							.text(aListOfNiceNames[i])
					);
				}
			}
			
			// now resort the lists alphabetically, since the rendered name are not necessarily in alphabetical order
			termfieldselector.resortList("ul#"+id+".rightlist");
			termfieldselector.resortList("ul#"+id+".leftlist");
		}
		
		
		
		
		
		
		// event handling
		
		// items selection
		
		$("#fieldsselector li").click(function(){
			$(this).toggleClass("selected");
		});
		
		
		// ------------------------------------
		// arrows for moving items
		
		// ADD item
		
		$("button#send").click(function(event){	
			
			var hUpdatedList = new Hashtable();
					
			$("ul.leftlist li.selected").each(function(){
				
				var sNiceText = $(this).text();
				var sText = $(this).data('value');
				var id = $(this).parent().attr("id");
				
				// move to right list
				$(this).removeClass("selected").appendTo("ul#"+id+".rightlist");					
				hUpdatedList.put("ul#"+id+".rightlist", true);
				
				// add to user settings
				(termfieldselector.user_settings[id]["selection"]).push(sText);
				(termfieldselector.user_settings[id]["selection"]).sort();
			});
			
			// resort the updated lists alphabetically
			var aUpdatedLists = hUpdatedList.keys();
			for (var j=0; j<aUpdatedLists.length; j++) {
				var oneList = aUpdatedLists[j];
				termfieldselector.resortList(oneList);
			}
			
		});
		
		// REMOVE item
				
		$("button#withdraw").click(function(){
			
			var hUpdatedList = new Hashtable();
			
			$("ul.rightlist li.selected").each(function(){
				
				var sNiceText = $(this).text();
				var sText = $(this).data('value');
				
				// BEWARE: remove only if the field is not compulsory!
				if (termfieldselector.defaults[oneCategory]["compulsory"].indexOf(sText) != -1) {
					fn.message("Veldkeuze", "Het veld '"+sNiceText+"' is verplicht. Het kan niet uit de selectie worden verwijderd.", function(){})
					return true; // skip to next item
				}
				
				// carry on
				var id = $(this).parent().attr("id");
				
				// move to left list
				$(this).removeClass("selected").appendTo("ul#"+id+".leftlist");
				hUpdatedList.put("ul#"+id+".leftlist", true);
				
				// remove from user settings
				var idx = (termfieldselector.user_settings[id]["selection"]).indexOf(sText);
				(termfieldselector.user_settings[id]["selection"]).splice(idx, 1);
				
			});
			
			// resort the updated lists alphabetically
			var aUpdatedLists = hUpdatedList.keys();
			for (var j=0; j<aUpdatedLists.length; j++) {
				var oneList = aUpdatedLists[j];
				termfieldselector.resortList(oneList);
			}
		});
		
		
		
		// Undo selection when clicked outside the list
		
		$(".leftside").click(function(event){
			var id = $(event.target).attr("id");
			if (!$(event.target).closest('li').length) {
				$("ul#"+id+".leftlist li").removeClass("selected");
			}			
		});
		$(".rightside").click(function(event){
			var id = $(event.target).attr("id");	
			if (!$(event.target).closest('li').length) {
				$("ul#"+id+".rightlist li").removeClass("selected");
			}			
		});
		
		// ------------------------------------
		
	});		
		
}


/**
 * Help function for sorting a list in the fieldsselector dialog.
 * This is needed to keep lists sorted after moving items from the one list to the other.
 */
termfieldselector.resortList = function(oneList){
	
	var listItems = $(oneList+" li").get();
	
	listItems.sort(function(a, b) {
        var textA = $(a).text().toUpperCase();
        var textB = $(b).text().toUpperCase();
        return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
    });
    
    $.each(listItems, function(idx, itm) {
        $(oneList).append(itm);
    });
}



/**
 * Show the current field selection in the termbank definition form.
 */
termfieldselector.showSelectionInForm = function(t){
	
	var sTableName = fn.getTableName(t);
	
	var aNiceNamesForConcepten = termfieldselector.translateList(termfieldselector.user_settings["concepten"]["selection"], "concepten");
	var aNiceNamesForTalen = termfieldselector.translateList(termfieldselector.user_settings["talen"]["selection"], "talen");
	var aNiceNamesForTermen = termfieldselector.translateList(termfieldselector.user_settings["termen"]["selection"], "termen");
	
	// empty the textblocks of the concept form, and fill them with current lists of selected fields
	
	$("#"+sTableName+"_form_textblock_fields_conceptlevel_table").empty().html(
		"<span>"+ aNiceNamesForConcepten.sort().join("<br>") + "</span>"
	);
	$("#"+sTableName+"_form_textblock_fields_languagelevel_table").empty().html(
		"<span>"+ aNiceNamesForTalen.sort().join("<br>") + "</span>"
	);
	$("#"+sTableName+"_form_textblock_fields_termlevel_table").empty().html(
		"<span>"+ aNiceNamesForTermen.sort().join("<br>") + "</span>"
	);		
}


/**
 * Save field selection to cookies, so as to keep it for later sessions
 */
termfieldselector.saveSelectionToCookie = function(sLevelName){
	
	var sProjectId = util.getProjectId();	
	var aLevels = sLevelName == null ? ["concepten", "talen", "termen"] : [sLevelName];
		
	for (var i=0; i<aLevels.length; i++) {
		var sLevelName = aLevels[i];		
		
		var sLevelSelection = (termfieldselector.user_settings[sLevelName]["selection"]).join(",");	
			
		var url = uTermServeInstanceUrl + "webservice/api/set_visible_fields_at_level";
		
		$.ajax({
			url: url,
			type: 'POST',
			data: {
				"project_id": sProjectId,
				"username": fn.getCurrentUser(),
				"level": sLevelName,
				"fieldnames": sLevelSelection
			},
			success: function(xml) {
				// keep silent
			},
			error: function(xhr, status, error) {
				console.error('Saving fields selection for '+sLevelName+'-level failed: ' + error);
			}
		});
	}	
}



/**
 * Restore the field selections from cookies (save at a previous session)
 */
termfieldselector.restoreSelectionFromCookie = function(){
	
	var sProjectId = util.getProjectId();	
	var url = uTermServeInstanceUrl + "webservice/api/get_visible_fields_at_all_levels";
	
	$.ajax({
			url: url,
			type: 'GET',
			data: {
				"project_id": sProjectId,
				"username": fn.getCurrentUser(),
				"dummy": getUniqueNumber()
			},
			success: function(xml) {
				
				var sAllLevelsSelections = fn.getDbResponse(xml);
				
				
				// if no selection is saved yet, save the default selection (we need that to be set right now)
				
				if (sAllLevelsSelections == null || sAllLevelsSelections == '') {
					
					termfieldselector.saveSelectionToCookie();
				}
				
				// normal case: get the saved selection and restore it
				else {					
									
					var aAllLevelsSelections = sAllLevelsSelections.split("###");
					
					for (var i=0; i < aAllLevelsSelections.length; i++) {
	
						var aLevelSelection = aAllLevelsSelections[i].split(":::");
						var sLevelName = aLevelSelection[0];
						var sLevelFieldsSelection = aLevelSelection[1];
	
						// restore the saved selection, if available 
						if (sLevelFieldsSelection != '' && sLevelFieldsSelection != null) {
							termfieldselector.user_settings[sLevelName]["selection"] = sLevelFieldsSelection.split(",");
						}
						// otherwise restore the default selection
						else {
							termfieldselector.user_settings[sLevelName]["selection"] = cloneArray(termfieldselector.defaults[sLevelName]["default_selection"])
						}
					}	
				}		
			},
			error: function(xhr, status, error) {
				console.error('Restoring fields selection for '+sLevelName+'-level failed: ' + error);
			}
		});
	
}


/**
 * Update the visibility of the fields in the tables
 * given the current user settings.
 */
termfieldselector.updateFieldsVisibility = function(){
	
	// iterate through the field sets 
	for (oneCategory in termfieldselector.allFields) {
		
		// get table name corresponding to the current field set
		var sTableName = termfieldselector.set2table[oneCategory];
				
		// get the formgrid object of the table
		var aTableSettings = conf.getTableSettings(sTableName);
		var oFormGrid = conf.getFormGrid(aTableSettings);
		
		// get the fiels of the set		
		var aFieldsList = termfieldselector.allFields[oneCategory];
		var aUserFieldsSelection = termfieldselector.user_settings[oneCategory]["selection"];
		
		// iterate through list of all available fields,
		// and if the field is part of the user selection, set the field to visible
		
		for (var i = 0; i < aFieldsList.length; i++) {
			
			var bVisible = aUserFieldsSelection.indexOf(aFieldsList[i]) != -1;
			
			// in table config 
			conf.changeTableConfigValue(sTableName, aFieldsList[i], "visible", bVisible);
			
			// in form config
			if (oFormGrid != null) {
				var oCells = oFormGrid["cells"];
				var oCell = oCells[aFieldsList[i]];
				if (oCell == null) {
					oCell = {};
				}				
				oCell["visible"] = bVisible;
				oCells[aFieldsList[i]] = oCell;
				oFormGrid["cells"] = oCells;
			}
			
		}
		
		// update the table settings for formgrid
		if (oFormGrid != null) {
			oTableSettingsList[sTableName]["formgrid"] = oFormGrid;	
		}
	}
	
}





/**
 * Recompute the positions of the cells of a form, but spread horizontally instead
 */
termfieldselector.recomputePositionsHorizontalGroups = function(sTableName){
	
	
	// get the fields groups of this table, and their members (the fields/cells)
	var aGroupsOfThisTable = termfieldselector.table2groups[sTableName];
	var aOrderedGroupsOfThisTable = Object.keys(aGroupsOfThisTable).sort((a, b) => { return aGroupsOfThisTable[a].order - aGroupsOfThisTable[b].order });
	
	
	// get the formgrid of the table
	var aTableSettings = conf.getTableSettings(sTableName);
	var aTableConfig = conf.getTableConfig(sTableName);
	var oFormGrid = conf.getFormGrid(aTableSettings);
	
	//console.log("--------------------");
	//console.log(oFormGrid);
	
	// make empty if it exists
	oFormGrid["textblocks"] = {};
	
	// make sure that cellgroups are there
	if (oFormGrid["cellgroups"] == null){
		oFormGrid["cellgroups"] = {};
	}
	
	// get the visible columns of a form
	var aCols = form.getVisibleColumnsOf(sTableName);
	
	
	// retrieve the definition of the form, in terms of columns and rows

	var iBaseX = 1;
	var iBaseY = 1;
	var iHeight = 1.25;
	
	
	var aDefinition =       oTableSettingsList[sTableName]["formgrid"]["definition"];
	var iDefWidth = 		aDefinition[0];
	var iDefHeight = 		aDefinition[1];
	
	
	// we will be spreading the cells across a number of rows / columns
	var iCellsPerRow = 	3;
	
	// compute sections width, given total width and number of columns
	var iFormColumnOuterWidth = Math.floor( (iDefWidth - 2*iBaseX) / iCellsPerRow);
	// computer the width of cells inside the column (must be small to keep cells distinct from each other)
	var iFormColumnInnerWidth = iFormColumnOuterWidth - 2*iBaseX;

	

	var iRow = -1;
	
	

	// loop over the groups
	
	for (var j=0; j<aOrderedGroupsOfThisTable.length; j++){
		
		var sThisGroup = aOrderedGroupsOfThisTable[j];
		var aCellsOfThisGroup = aGroupsOfThisTable[sThisGroup]["members"];
		
		//var sTextBlockLabel = sThisGroup.toLowerCase().replace(/ /g, "_");
		var sCellGroupLabel = sThisGroup.toLowerCase().replace(/ /g, "_");
		
		iRow++;
		
		
		// check if the group has any visible cell, otherwise skip the group
		
		const intersection = aCellsOfThisGroup.filter(element => aCols.includes(element));
		if (intersection.length == 0){
			console.log(">> no visible cells in group, skip");
			continue;
		}

		
		// generate a new text block for the group
		// at least if the group has a NON-EMPTY label
		
		if (sThisGroup != ''){
			
			oFormGrid["cellgroups"][sCellGroupLabel] = {
				"text": sThisGroup,
				"class": "form_section_cells",
				"position": [iBaseX, iBaseY + iRow*iHeight],
				"definition": [iDefWidth*.9, iCellHeight]
			};
			
			iRow++;			
		}
		
				
		
		// get the cells of the group
				
		// cells loop
		for (var i = 0; i < aCellsOfThisGroup.length; i++) {
	
			var sCellName = aCellsOfThisGroup[i];
			
			
			// if the current cell is not visible, 
			// make sure that the formgrid says that,
			// and skip to the next cell
			
			var idx = $.inArray(sCellName, aCols);
			if (idx < 0) {
				
				if (oFormGrid["cells"][sCellName] == null){
					oFormGrid["cells"][sCellName] = {};
				}
				
				oFormGrid["cells"][sCellName]["visible"] = false;
				oFormGrid["cells"][sCellName]["position"] = "hidden";
				
				continue;
			}
						
	
			// now, make sure we have a cell for the current cellname
			if (oFormGrid["cells"][sCellName] == null){
				oFormGrid["cells"][sCellName] = {};
			}
			
			
			
			// do we have some cell definition in config
			
			// first make sure we have a backup that won't be modified (since any computation now and in the future must be based on the original values) 
			
			if (oFormGrid["cells"][sCellName]["definition_orig"] == null){
				oFormGrid["cells"][sCellName]["definition_orig"] = cloneArray( oFormGrid["cells"][sCellName]["definition"] );
			}
			var aCellDef = oFormGrid["cells"][sCellName]["definition_orig"];
			var iCellHeight = (aCellDef != null && aCellDef[1]!=null ? iHeight*aCellDef[1] : iHeight);
			
			
			// set the position of the cell in the form
			
			oFormGrid["cells"][sCellName]["cellgroup"] = sCellGroupLabel;
			oFormGrid["cells"][sCellName]["position"] = null;	
			oFormGrid["cells"][sCellName]["definition"] = [iFormColumnInnerWidth-2, iCellHeight];
			oFormGrid["cells"][sCellName]["class"] = "horizontaal_cell horizontaal_cell_in_accordion";
			
			oFormGrid["cells"][sCellName]["order"] = (i+1);
						
			
			
			// add nice name if it's missing
			
			var sConfigNiceName = conf.getColumnNiceName(conf.getColumnConfig(aTableConfig, sCellName));
			var sFormNiceName = oFormGrid["cells"][sCellName]["nice_name"];
			if (sFormNiceName == null){
				var sNiceName = sCellName.replace(/_/g, " ");
				sNiceName = sNiceName.charAt(0).toUpperCase() + sNiceName.slice(1);
				
				oFormGrid["cells"][sCellName]["nice_name"] = (sConfigNiceName != null ? sConfigNiceName : sNiceName);
			}			
			
		}
		// end of cell loop
		
		
	}
	// end of group loop
	
	// **************************************
	
	// special: we need some custom cellgroups for termvormen etc., although those are lists and not groups of cells
	
	if (sTableName == "termbank_termen"){
		oFormGrid["cellgroups"]["termvormen_label"]= {
				"text": "termvormen",
				"class": "form_section_cells",
				"position": [0.5, 0.5],
				"definition": [0.5, 0.5]
		}
		
		oFormGrid["cellgroups"]["contexten_label"]= {
				"text": "contexten",
				"class": "form_section_cells",
				"position": [0.5, 0.5],
				"definition": [0.5, 0.5]
		}
	}
	
	if (sTableName == "termbank_concepten"){
		oFormGrid["cellgroups"]["conceptrelaties_label"]= {
				"text": "conceptrelaties",
				"class": "form_section_cells",
				"position": [0.5, 0.5],
				"definition": [0.5, 0.5]
		}
	}
	
	
	
	// **************************************
	
	// save the re-computation]	
	oTableSettingsList[sTableName]["formgrid"] = oFormGrid;
	
	//console.log(oFormGrid);
	
	
};


	