
var molexcomplete = {};



// Autocomplete configuration

// see: http://stackoverflow.com/questions/5077409/what-does-autocomplete-request-server-response-look-like
// http://stackoverflow.com/questions/18677536/jeditable-and-jquery-ui-autocomplete
molexcomplete.sAutoCompleteSelector = "#lemmata .nuanc_opm";

molexcomplete.sAutoCompleteLemmaGigpos = "#lemmata .lemma_pos, #prompt_lemma_pos";

molexcomplete.sAutoCompleteWordformGigpos = "#prompt_wordform_pos";

molexcomplete.sAutoCompleteTypInLemma = "#prompt_tiklemmain";

$(document).on(
      "focus", 
      molexcomplete.sAutoCompleteSelector, 
      function(event) {
      	
      	$(event.target).autocomplete({
          	
      		delay: 750,
            minLength: 2,
	        source: function(request, response){
	            	
	           	fn.callFunction(sApiSchema+".get_nuance_opm", [ fn.quote( request.term ) ], 
	          		function(func_resp){  
	            		
	            		var aSuggestionsArr = 
	            			(func_resp["get_nuance_opm"]).split("|");
	            		
	            		response($.map(aSuggestionsArr, function (item) {
	                        return {
	                            label: item.split(":::")[0],
	                            value: item.split(":::")[1]
	                        };
	                    }));
					}
				);
			},
			open: function(event, ui){

				setTimeout(function(){
					$(event.target).putInFront();
				}, 100);

			}
		});
          
      }
  );

$(document).on(
	"focus", 
	molexcomplete.sAutoCompleteLemmaGigpos, 
	function(event) {
	
		$(event.target).autocomplete({
			
			delay: 750,
			minLength: 2,
			source: function(request, response){
				
				fn.callFunction(sApiSchema+".get_lemma_pos", [ fn.quote( request.term ) ], 
						function(func_resp){  
					
					var aSuggestionsArr = 
						(func_resp["get_lemma_pos"]).split("###");
					
					response($.map(aSuggestionsArr, function (item) {
						return {
							label: item.split(":::")[0],
							value: item.split(":::")[1]
						};
					}));
				});
			},
			open: function(event, ui){

				setTimeout(function(){
					$(event.target).putInFront();
				}, 100);

			}
		});
		
	}
);


$(document).on(
      "focus", 
      molexcomplete.sAutoCompleteWordformGigpos, 
      function(event) {
      	
      	$(event.target).autocomplete({
          	
      		delay: 750,
			minLength: 2,
			source: function(request, response){
				
				fn.callFunction(sApiSchema+".get_wordform_pos", [ fn.quote( request.term ) ], 
						function(func_resp){  
					
					var aSuggestionsArr = 
						(func_resp["get_wordform_pos"]).split("###");
					
					response($.map(aSuggestionsArr, function (item) {
						return {
							label: item.split(":::")[0],
							value: item.split(":::")[1]
						};
					}));
				});
			},
			open: function(event, ui){

				setTimeout(function(){
					$(event.target).putInFront();
				}, 100);
			}
          });
          
      }
);


fn.setAutoComplete("lemmata_and_paradigm_view", "wordform_pos", false, sApiSchema+".get_wordform_pos", "###", ":::", 1, 200);


$(document).on(
      "focus", 
      molexcomplete.sAutoCompleteTypInLemma, 
      function(event) {
      	
      	$(event.target).autocomplete({
          	
      		delay: 750,
			minLength: 2,
			source: function(request, response){
				
				fn.callFunction(sApiSchema+".search_for_lemma_stringonly", [ fn.quote( request.term ) ], 
						function(func_resp){  
					
					var aSuggestionsArr = 
						(func_resp["search_for_lemma_stringonly"]).split("^^^");
					
					response($.map(aSuggestionsArr, function (item) {
						return {
							label: item,
							value: item
						};
					}));
				});
			},
			open: function(event, ui){

				setTimeout(function(){
					$(event.target).putInFront();
				}, 100);
			}
          });
          
      }
);


