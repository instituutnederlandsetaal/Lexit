

conceptlinks = {};



conceptlinks.settings = {};


conceptlinks.config = {
	
};




conceptlinks.setAutocomplete = function(){
	
	$(document).on(
      "focus", 
      "#prompt_verwant_concept,div#termbank_concepten_form___conceptrelaties_container .dataTables_scrollBody tbody td.editable textarea",
      function(event) {
		
		// we need to know if we are adding a new concept or editing an existing one
		var bNewRelatedConcept; 		
		      	
      	$(event.target).autocomplete({
          	
      		delay: 750,
			minLength: 1, // we need the autocomplete to react on the first character because of concept_ids which are single numbers sometimes
			source: function(request, response){
				
				fn.callFunction(util.getProjectId() + ".search_for_concept", [ fn.quote( request.term ) ], 
						function(func_resp){  
					
					var aSuggestionsArr = 
						(func_resp["search_for_concept"]).split("^^^");
						
					// build a list linking concept to their IDs
					concepts.concept2conceptID = new Hashtable();
					for (var i=0; i<aSuggestionsArr.length; i++){
						
						var sConceptId = aSuggestionsArr[i].split("###")[0];
						var sConceptNaam = aSuggestionsArr[i].split("###")[1];
						concepts.concept2conceptID.put(sConceptNaam, sConceptId);
					}
					
					response($.map(aSuggestionsArr, function (item) {
						return {
							label: item.split("###")[1], 
							value: item.split("###")[1]  
						};
					}));
				});
			},
			
			open: function(event, ui){
				
				// set the flag to indicate that we are adding a new related concept
				bNewRelatedConcept = $(this).attr("id") == "prompt_verwant_concept";

				setTimeout(function(){
					$(event.target).putInFront();
				}, 100);
			},
			
			select: function(event, ui){
				
				// get the concept ID of the selected concept
				var sConceptIdOfSelectedConcept = concepts.concept2conceptID.get(ui.item.value);
				
				// set the concept name by removing the concept ID from the full string
				var aConceptNameOfSelectedConcept = ui.item.value.split(":");
				ui.item.value = ( (aConceptNameOfSelectedConcept.length > 1) ? aConceptNameOfSelectedConcept[1] : ui.item.value ).trim();
				
				// in the new concept dialog, fill in the fields
				if (bNewRelatedConcept){
					$("#prompt_verwant_concept").val(ui.item.value);
					$("#prompt_verwant_concept_id").val(sConceptIdOfSelectedConcept);
				}
				// or if editing the list table, fill in the cells
				else {
				    // get the index of the column containing the concept name
				    //var nHeaders = $(event.target).closest("div.dataTables_scroll").find("div.dataTables_scrollHead").find("thead");
				    //var iIdCellIdx = nHeaders.find("th").filter(function() {
					//	return $(this).text().trim() == 'verwant_concept_id';
					//}).index();
					var nConceptCell = $(event.target).closest("td").get(0);
									
					//var nConceptIdCell = $(event.target).closest("tr").find("td").eq(iIdCellIdx).get(0);
					var nConceptIdCell  = lists.getSiblingCell("conceptrelaties", nConceptCell, "verwant_concept_id");
					
					setTimeout(function(){
						lists.setDataInCell("conceptrelaties", nConceptCell, ui.item.value);
						lists.setDataInCell("conceptrelaties", nConceptIdCell, sConceptIdOfSelectedConcept);
					}, 100);
				}
				
				
			}
			
          });
          
      }
	);
};

conceptlinks.removeAutocomplete = function(){
	
	$(document).off("focus", "#prompt_verwant_concept");

};