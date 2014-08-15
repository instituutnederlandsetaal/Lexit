// list of tables that must be hidden or visible (don't use both, it's a matter of what's the must convenient)
oHiddenTablesList = ["mnw_to_modned"];
oShowOnlyTables = [];

// table general settings

var oStandardTableSettings = {
		
		column_order: ["hidden_id",
		               "rownr",
		               "extern_lem_id",
		               "unfortunate",
		               "group_id",
		               "lemma", 
		               "lemmatiseren",			               
		               "quotation_id",
		               "quotation",
		               "lemma_id",
		               "attestation_modified",
		               "onsetoffset"],
		callback: function(t){
			highlightAllQuotes(t);
		},
		repeat_callback: true
	};

oTableSettingsList = {
		
		mnw2013_deel_1:oStandardTableSettings,
		
		mnw2013_deel_2:oStandardTableSettings,
		
		mnw2013_deel_3:oStandardTableSettings,
		
		mnw2013_deel_4:oStandardTableSettings,
		
		mnw2013_deel_5:oStandardTableSettings,
		
		mnw2013_deel_6:oStandardTableSettings,
		
		mnw2013_deel_7:oStandardTableSettings,
		
		mnw2013_deel_8:oStandardTableSettings,
		
		mnw2013_deel_9:oStandardTableSettings,
		
		mnw2013_deel_9_test:oStandardTableSettings
		
};


// configuration at column level

var oStandardConfigurationForMnwTables = {
		
		hidden_id: {
			visible: false
			},
		lemmatiseren: {
			sortable: false,
			editable: true,
			bgcolor: "#D8CEF6"
			},
		unfortunate: {
			visible: false,
			//filter: '1',
			keepfilter: true				
		},
		lemma: {
			sortable: false,
			cell_tooltip: "Klik om MNW te openen",
			click: function(t,n){openMnw(t,n);}
		},
		extern_lem_id: {
			sortable: false,
			cell_tooltip: "Klik om MNW te openen",
			click: function(t,n){openMnw(t,n);}
			},
		group_id:{
			visible: false
		},
		attestation_modified:{
			visible: false
		},
		quotation: {
			sortable: false,
			"cell_tooltip": "Klik om woorden te (de)highlighten",
			"mouseup": function(t, n){
				
				// do we have a text selection?
				var oSelectedText = fn.getSelectedTextInNode(t, n);
				
				// if selection is empty, that means that we've clicked on a word
				// without selecting it manually.
				// In this case, try to select the word that was clicked upon
				if (oSelectedText.text == '' && oSelectedText.reliable)
					{						
					oSelectedText = fn.getWordClickedUponInNode(t, n);						
					}
				
				// if we have a selection now, process it
				if (oSelectedText.text!='' && oSelectedText.reliable)
					{
					// get the registered onsets and offsets
					
					// put the token indexes string into an array
					var sTokenIndexesIds = fn.getDataFromSiblingNode(t, n, "onsetoffset");
					var sOldTokenIndexesIds =  sTokenIndexesIds;
					var aTokenIndexesIds = (sTokenIndexesIds!='' && sTokenIndexesIds!= 'none') ?
							sTokenIndexesIds.split("\|") : new Array();
					// was it modified before? (we will keep this setting)
					var bAttestationModified = fn.getDataFromSiblingNode(t, n, "attestation_modified") == 't';
					
					
					// get the current screen selection
					var iStart = parseInt(oSelectedText.start);
					var iEnd = parseInt(oSelectedText.end);
					
					
					// is this selection already part of the registered onsets and offsets?
					var iIndexOfThisPair = $.inArray(iStart+","+iEnd, aTokenIndexesIds);					
					
					// if token was already marked as token, remove it
					if (iIndexOfThisPair>-1)
						{
						aTokenIndexesIds.splice(iIndexOfThisPair, 1);							
						}
					// otherwise add the selected token(s)
					else
						{
						// remove the tokens that are within the selection
						// and add the selection as a whole after that
						
						var bAddSelection = true;
						for (var i=aTokenIndexesIds.length-1; i>=0; i--)
							{								
							var sOnePair = aTokenIndexesIds[i];
							var iOneStart = parseInt(sOnePair.split(",")[0]);
							var iOneEnd = parseInt(sOnePair.split(",")[1]);
							
							// if token is within the selection, remove it
							if (iStart<=iOneStart && iOneEnd<=iEnd)
								{
								aTokenIndexesIds.splice(i, 1);
								}
							// if selection is within/overlapping an existing token, do nothing
							else if ( ( iOneStart<=iStart && iStart<=iOneEnd ) ||
									  ( iOneStart<=iEnd   && iEnd<=iOneEnd   ) )
								{
								bAddSelection = false;
								}
								
							}
						// add the selection
						if (bAddSelection)
							aTokenIndexesIds.push(iStart+","+iEnd);
						}
					
					// update the database and the screen table
					
					// rebuild the token indexes string from the current array
					sTokenIndexesIds = aTokenIndexesIds.join("|");
					if (sTokenIndexesIds == '') sTokenIndexesIds = "none";
					// if the attestation was modified now, register it, and
					// if the attestation was modified before, it remains registered as such
					bAttestationModified = (sTokenIndexesIds != sOldTokenIndexesIds || bAttestationModified);
					fn.updateDatabaseGivenANode(t, fn.getRowNode(n), ["onsetoffset", "attestation_modified"], [ sTokenIndexesIds, bAttestationModified ], true);
					
					
					}					
			}
		},
		quotation_id: {
			visible: false
			},
		lemma_id: {
			visible: false
			},
		onsetoffset: {
			visible: false
			},
		rownr :{
			colsort: "asc",
			visible: false
		}
		
	};

oTableConfigurationList = {
		
		dirks_pretje2:{
			
			lemma: {
				
				"click": function(t,n){
					
					var word = fn.getDataFromCellNode(t, n);
					window.open("http://gtb.inl.nl/iWDB/search?actie=results&wdb=MNW&lemmodern="+word);
				}
			},
			quotation_section_ids: {
				"click": function(t,n){
					var ids = fn.getDataFromCellNode(t, n);
					fn.callDatabase("quotes_uit_alle_mnw_delen", 
							{"quotation_section_id": ids});
				}
			},
			opmerking: { "editable": true, "bgcolor": "#CEE3F6" },
			mnw_persistent_id: {"visible": false},
			unique_id: {"visible": false},
			apenstaart: {"visible": false}
			
			
		},
		
		dirks_pretje3:{
			
			lemma: {
				
				"click": function(t,n){
					
					var word = fn.getDataFromCellNode(t, n);
					window.open("http://gtb.inl.nl/iWDB/search?actie=results&wdb=MNW&lemmodern="+word);
				}
			},
			quotation_section_ids: {
				"click": function(t,n){
					var ids = fn.getDataFromCellNode(t, n);
					fn.callDatabase("quotes_uit_alle_mnw_delen", 
							{"quotation_section_id": ids});
				}
			},
			opmerking: { "editable": true, "bgcolor": "#CEE3F6" },
			mnw_persistent_id: {"visible": false},
			unique_id: {"visible": false},
			apenstaart: {"visible": false}
			
			
		},
		
		quotes_uit_alle_mnw_delen:{
			opmerking: { "editable": true, "bgcolor": "#CEE3F6" },
			hidden_id: {"visible": false},
			quotation_id: {"visible": false},
			unfortunate: {"visible": false},
			group_id: {"visible": false},
			lemma_id: {"visible": false},
			onsetoffset: {"visible": false},
			attestation_modified: {"visible": false},
			rownr: {"visible": false},
			mnw_deel: {"visible": false},
			multiple_lemmata_analysis_id: {"visible": false},
			unique_id: {"visible": false}
		},
		
		mnw2013_deel_1: oStandardConfigurationForMnwTables,
		
		mnw2013_deel_2: oStandardConfigurationForMnwTables,
		
		mnw2013_deel_3: oStandardConfigurationForMnwTables,
		
		mnw2013_deel_4: oStandardConfigurationForMnwTables,
		
		mnw2013_deel_5: oStandardConfigurationForMnwTables,
		
		mnw2013_deel_6: oStandardConfigurationForMnwTables,
		
		mnw2013_deel_7: oStandardConfigurationForMnwTables,
		
		mnw2013_deel_8: oStandardConfigurationForMnwTables,
		
		mnw2013_deel_9: oStandardConfigurationForMnwTables,
		
		mnw2013_deel_9_test: oStandardConfigurationForMnwTables
			

};



function highlightAllQuotes(confTable){
	
	fn.showProcessingMsg(confTable); 
	
	var aAllRowIds = fn.getAllRows(confTable);	
	
	aAllRowIds.each(function(){
		
		putHighlightOnOneRow(confTable, this);
		
	});
	
	fn.removeProcessingMsg(confTable);
	
};


function putHighlightOnOneRow(confTable, confNode) {
	
	var sQuote = fn.getDataFromCellInRowNode(confTable, confNode, "quotation");
	
	sQuote = fn.removeHighlight(sQuote);
	
	// get the position pairs (x,y|x,y|...)
	var sAllPositionPairs = fn.getDataFromCellInRowNode(confTable, confNode, "onsetoffset");
	
	if (sAllPositionPairs != "-")
		{
				
		// build array of position pairs
		var aAllPairs = sAllPositionPairs.split("\|");		
		
		var aNewPairsArray = new Array();
		for (var i=0; i<aAllPairs.length; i++)
			{			
			var onePair = aAllPairs[i].split(",");
			
			var iStartIndex = parseInt(onePair[0]);
			var iEndIndex   = parseInt(onePair[1]);
			
			if (iStartIndex<iEndIndex)
				aNewPairsArray.push([iStartIndex, iEndIndex]);
			}
		
		// call the highlight function with the whole array of position pairs
		if (aNewPairsArray.length>0)
			sQuote = fn.getHighlight(sQuote, aNewPairsArray, "yellow");
		}
		
	// put the string back into the table
	fn.putDataIntoCell(confTable, confNode, "quotation", sQuote);
};


function openMnw(t,n){
	var id = fn.getDataFromCellNamed(t, n, "extern_lem_id");
	window.open("http://gtb.inl.nl/iWDB/search?actie=article&wdb=MNW&id="+id);
};

