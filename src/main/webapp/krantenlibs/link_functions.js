function setOnKeyUp(oTableSettings, table_name, key, callback) {
  if (!(table_name in oTableSettings))
     oTableSettings[table_name] = {}

   settings =  oTableSettings[table_name]
   
   if (!('keyup' in settings))
     settings['keyup']  = {}

   settings['keyup'][key] = t => setTimeout(
           () => {
                const iActiveRowInLeftTable = fn.getActiveRowNode(table_name)
                fn.selectRowNode(table_name, iActiveRowInLeftTable);

                var nSelectedRow = fn.getFirstSelectedRowNodeFrom(table_name)
                if (nSelectedRow != null) {
                     callback(nSelectedRow)
                }
           } , 
           250
           )

   console.log(JSON.stringify(oTableSettings))
}
 

/**
 * Create a link url by applying the given link template to the given cell node.
 * @param cell_node: a Lex'it cell node
 * @param fnLinkTemplate: a function that takes a row as argument, and returns a URL string built with some values from that row. 
 * @returns the created link url
 */
function createLinkFromCellNode(nCell, fnLinkTemplate) {
        
        var cell = fx.getCell(nCell)
        var row = fx.getRowFromCell(cell);
        
        var fnRow = field => fx.getDataFromCellInRow(row, field);
        var sLinkUrl = fnLinkTemplate(fnRow);        
        return sLinkUrl;
}

function createLinkFromRow(row, fnLinkTemplate) {
        var row_as_function = field => fx.getDataFromCellInRow(row, field);
        var link_url = fnLinkTemplate(row_as_function)
        return link_url
}

function createLinkFromRowNode(row_node, fnLinkTemplate) {
        
        var row_as_function = field => fn.getDataFromCellInRowNode(row_node, field);
        var link_url = fnLinkTemplate(row_as_function)
        return link_url
}

function createLinkFromAssociative(object, fnLinkTemplate) {
        var row_as_function = field => object[field]
        var link_url = fnLinkTemplate(row_as_function)
        return link_url
}


/**
 * Loop through the oTableConfigurationList and add click handlers for all fields that have a "link" property.
 */
function addLinkingActions() {
	
	// loop through tables of the config
	for (tableName in oTableConfigurationList) {
		
		// loop through fields of a table
		for (fieldName in oTableConfigurationList[tableName]){
          
			// check if the field has a "link" property in the config,
            if ("link" in oTableConfigurationList[tableName][fieldName]) {
				
				// get the link template from the Lex'it congiguration for this field and table,
				// (the table is a function that takes a row as argument, and returns a URL string built with some values from that row).
                const fnLinkTemplate = oTableConfigurationList[tableName][fieldName]["link"];
                
                // and check if there is a target for the link
                const bHasTarget = "link_target" in  oTableConfigurationList[tableName][fieldName];                
                
                // construct the click handler for this field and table, using the link template (and target if given),
                // (to be assigned as a Lex'it click function handler on a cell node of the table)
                
                const fnClickHandler = function(t, cellNode) { 
                        
                        // create the url
                        var sUrl = createLinkFromCellNode(cellNode, fnLinkTemplate);
                        
                        // and assign it to the target if given
                        if (bHasTarget) {
							const target = oTableConfigurationList[tableName][fieldName]["link_target"]
                            document.getElementById(target).setAttribute("src", sUrl)
                        } 
                        // or open it in a new window if not given
                        else {
							window.open(sUrl);
						} 
                }
                
                // add handler to the Lex'it table config for this link
                oTableConfigurationList[tableName][fieldName]["click"] = fnClickHandler;
             }
		}
	}
}


/**
 * Assign an autocomplete function to a given jQuery selector, and use the given Psql api function to get the autocomplete suggestions.
 * 
 * @param sAutoCompleteSelector: a jQuery selector to assign the autocomplete function to
 * @param  apiFunction: the name of a Psql api function.
 * The Psql api function takes a single string argument and returns a string with autocomplete suggestions.
 * The argument will be the current value of the input field for which the autocomplete is triggered.
 */
function setAutoCompleter(sAutoCompleteSelector, sApiFunctionName){
	
	 $(document).on(
	      "focus",
	      sAutoCompleteSelector,
	      function(event) {
	       	$(event.target).autocomplete({
	
	            delay: 200,    //  even kijken wat prettig voelt 
	            minLength: 1,    // vanaf X letters invoer pas autocomplete
	               source: function(request, response){
					
	                    fn.callFunction('api.'  + sApiFunctionName, [ fn.quote(request.term ) ],
	                           function(func_resp){
	                           
	                           var aSuggestionsArr = (func_resp[sApiFunctionName]).split("|");
	
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
}

