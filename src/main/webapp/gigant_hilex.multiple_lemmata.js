
var hilexmultilem = {};



hilexmultilem.settings = {
	
	multiple_lemmata_analyses_view: {		
		
		"exact_count": true,
		"columns_sorting": {"multiple_lemmata_analysis_id": "asc", "part_number": "asc"},
		"width": "60%",
		
		"callback": function(t){
			
			var iPreviousLemId = null;			
			var aRows = fn.getAllRowNodes(t);
			
			// make sure the user can easily distinguish groups in the view
			// by adding lines between groups, and adding color to groups with more than one member
			
			var iIdx = 0;
			var aColor = ["#0404B4", "#61210B"];
			
			$(aRows).each(function(i){
				
				var thisRow = this;

				var iLem = fn.getDataFromCellInRowNode(thisRow, "multiple_lemmata_analysis_id");				
				var bNewGroup = (iLem != iPreviousLemId);
				
				// have we got a new group of parts?
				// add a top border on the first row of the group
				if (i>0 && bNewGroup){
					$(thisRow).find("td").css("border-top", "1px solid black");	
				}

				// compute next group rendering idx 
				// if we're in a new group
				if (bNewGroup){
					iIdx++;	
					if (iIdx > 1) iIdx = 0;
				}

				// apply appropriate style
				$(thisRow).find("td").css("color", aColor[iIdx]);

				
				// we need to remember this lemma-id for next round
				// so as to detect when we're dealing with another group
				iPreviousLemId = iLem;

			});
			
		},
		"repeat_callback": true
	},
	
	
	multiple_lemmata_analyses: {
		"group": "Onder de motorkap",
		"exact_count": true
	},
		
	multiple_lemmata_analysis_parts: {
		"group": "Onder de motorkap",
		"exact_count": true
	}
	
};


hilexmultilem.config = {
	
	multiple_lemmata_analyses_view: {
		
		"multiple_lemmata_analysis_id": {
			//"width": "150px"
		},
		
		"multiple_lemmata_analysis_part_id": {
			//"width": "150px"
		},
		
		"lemma_id": {
			"click": function(t, n){
				var sLemId = fn.getDataFromCellNode(n);
				fn.callTable("lemmata", {"lemma_id": sLemId});
			}
		},
		
	},
	
	multiple_lemmata_analyses: {
		
	},
	
	multiple_lemmata_analysis_parts: {
		
	}
};