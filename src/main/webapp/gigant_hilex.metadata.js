
var hilexdocs = {};


hilexdocs.settings = {
	
	source: {
		
		"exact_count": true,
		"width": "95%",
		"columns_order": ["source_id", "source", "description", "start_year", "end_year", "may_be_linked_to", "attestation_reference_type"],
	},
	
	metadata: {
		"group": "Onder de motorkap",
		"keep_small": true,
		"exact_count": true
	},
	
	metadata_sources: {
		"group": "Onder de motorkap",
		"keep_small": true,
		"exact_count": true,
		"width": "60%"
	}
};

hilexdocs.config = {
	
	source: {
		
		"attestation_reference_type": {
			"editable": true
		},
		"description": {
			"editable": true
		},
		"source_id": {
			//"nice_name": "src"
		}
		
	},
	
	metadata: {
		
		"metadata_source_id": {
			
			"click": function(t, n){
				
				var sMetadataSourceId = fn.getDataFromCellNode(n);
				fn.callTable("metadata_sources", {"metadata_source_id": sMetadataSourceId});
			}
		}
		
	},
	
	metadata_sources: {
		
	}
};