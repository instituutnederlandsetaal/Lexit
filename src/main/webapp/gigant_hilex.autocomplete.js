


var hilexcomplete = {};


// Autocomplete configuration for Multilemmata Builder
// see: http://stackoverflow.com/questions/5077409/what-does-autocomplete-request-server-response-look-like
// http://stackoverflow.com/questions/18677536/jeditable-and-jquery-ui-autocomplete
hilexcomplete.sAutoCompleteSelector = "#prompt_lemma1, #prompt_lemma2, #prompt_lemma3, #prompt_lemma4, #prompt_lemma5";


// set autocompletes for  MNW pos translation  job

fn.setAutoComplete("mnw_lemma_parts_of_speech", "correction_pos", false, "get_wnt_lemma_pos_for_select", "|", ":::");

fn.setAutoComplete("mnw_wordforms_parts_of_speech", "correction_pos", false, "get_wnt_wordform_pos_for_select", "|", ":::");



$(document).on(
   "focus", 
   hilexcomplete.sAutoCompleteSelector, 
   function(event) {
   	
	   	$(event.target).autocomplete({
	       	
	   		delay: 750,
	   		minLength: 2,
	   		source: function(request, response){
		    	
		    	fn.callFunction(sApiSchema+".get_lemmata_from_prefix", [fn.quote(request.term), fn.quote(sWdbForMultilemBuilder)], 
		    			function(func_resp){  
		    		
		    		var aSuggestionsArr = 
		    			(func_resp["get_lemmata_from_prefix"]).split("|");
		    		
		    		response($.map(aSuggestionsArr, function (item) {
		                return {
		                    label: item,
		                    value: item
		                };
		            }));
		    	});
		    },
		    open: function( event, ui ) {
		    	$(this).autocomplete('widget').putInFront();
		        return false;
		    },
		    select: function( event, ui ) {
		    	
		    	// read the dictionary the chosen lemma belongs to
		    	var sSuggestionWdb = (ui.item["label"]).replace(/.+, .+ \(([A-Za-z]+) .+, id:.+$/, '$1');
		    	// remove 'n' (new) extension for comparison with other parts
		    	sSuggestionWdb = sSuggestionWdb.replace(/n$/, '');
		    	
		    	// if no sWdbForMultilemBuilder-filter was set yet (because multilemmata builder is empty)
		    	// set it now!
		    	if (sWdbForMultilemBuilder == '')
		    		sWdbForMultilemBuilder = sSuggestionWdb;
		    	
		    	// check if lemma selection meets the dictionary requirement 
		    	// (must be the same dictionary as previously chosen lemmata)
		    	if (sSuggestionWdb != sWdbForMultilemBuilder){
		    		fn.message("Let op!", "Alle gekozen delen moeten '"+sWdbForMultilemBuilder+"'-lemmata zijn!");
		    	}
		    }
		});
       
   }
);