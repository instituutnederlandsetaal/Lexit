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
 

function createLinkFromCellNode(cell_node, link_template) {
        var cell = fx.getCell(cell_node)
        var row = fx.getRowFromCell(cell);
        var row_as_function = field => fx.getDataFromCellInRow(row, field);
        var link_url = link_template(row_as_function)
        return link_url
}

function createLinkFromRow(row, link_template) {
        var row_as_function = field => fx.getDataFromCellInRow(row, field);
        var link_url = link_template(row_as_function)
        return link_url
}

function createLinkFromRowNode(row_node, link_template) {
        //alert(JSON.stringify(row_node)  + " " + link_template.toString())
        var row_as_function = field => fn.getDataFromCellInRowNode(row_node, field);
        var link_url = link_template(row_as_function)
        return link_url
}

function createLinkFromAssociative(object, link_template) {
        var row_as_function = field => object[field]
        var link_url = link_template(row_as_function)
        return link_url
}

// dit werkt niet lekker, andere oplossing via override van preDrawCallback in buildTable.js
function preprocessing(tableName, fieldName, searchFieldName) {
       // alert(`${fieldName} --> ${searchFieldName}`)
        return function(value){ 
               // alert(`${value} ${searchFieldName} ${fieldName}`)
                fn.setFilters(tableName, {searchFieldName: value, fieldName: ""}, false);
                // fn.refreshTable(tableName);
      } }

function addLinkingActions()
{

        for (tableName in oTableConfigurationList) 
          for (fieldName in oTableConfigurationList[tableName]) {
             if ("link" in oTableConfigurationList[tableName][fieldName])
             {
                const link_template = oTableConfigurationList[tableName][fieldName]["link"]
                const hasTarget = "link_target" in  oTableConfigurationList[tableName][fieldName]
                const target = oTableConfigurationList[tableName][fieldName]["link_target"]
                
                const click_handler = function(t, cellNode) { 
                        
                        var linkje = createLinkFromCellNode(cellNode, link_template)
                        // alert("hasTarget: " + target)
                        if (hasTarget)
                        {
                                document.getElementById(target).setAttribute("src", linkje)
                        } else
                                window.open(linkje) 
                }
                //alert(`creating click handler, ${hasTarget} for ${tableName} ${fieldName} with template ${link_template.toString()}: ${click_handler.toString()}`)
                oTableConfigurationList[tableName][fieldName]["click"] = click_handler;
             }
             if ("complete" in oTableConfigurationList[tableName][fieldName]) {
                const completion = oTableConfigurationList[tableName][fieldName]["complete"].split(">")

                //alert(JSON.stringify(completion))
                
                const foreignTableName = completion[0]
                const foreignKeyName = completion[1]
                const foreignFieldName = completion[2] 
                setAutoCompleter(tableName, fieldName, foreignTableName, foreignKeyName, foreignFieldName)
              }
              /*
	      if ("search_instead_x" in oTableConfigurationList[tableName][fieldName]) {
                oTableConfigurationList[tableName][fieldName]["searchpreprocess"]  = preprocessing(tableName, fieldName,  oTableConfigurationList[tableName][fieldName]["search_instead"])
              }
              */
        }
}

function zi(e) {
        return parseInt($(e).css('z-index'))||1 ;
}

function getAllAutoCompletes() {
        const selector = ".ui-autocomplete-input"
        const elementsArray = Array.from($(selector));
        return elementsArray.map(getStartTag)
}

function getHighestZindexOffAll(){
        const notSoTipTop = ':not(div#tiptip_holder,div#tiptip_content,div#tiptip_arrow)'
        // var selector = absoluteMax ? "body" : ':not(div#tiptip_holder,div#tiptip_content,div#tiptip_arrow)';
        const selector = "*" // notSoTipTop // "*"
        var highest = Math.max.apply(null, $.map($(selector), function(e, n){
        if($(e).css('position')=='absolute')
             return parseInt($(e).css('z-index'))||1 ;
        })
        );

        var argMax = null;
        var highest = -Infinity;

        $(selector).each(function(index, element)   {
          var value = zi(element); 
          if (value > highest && value < 9999999) {
            highest = value;
            argMax = element;
          }
        });
       
        return [argMax, highest];
}

function getStartTag(element) {
        if (!(element instanceof Element)) {
          throw new Error("Argument must be a DOM element.");
        }
        
        const tagName = element.tagName.toLowerCase();
        const attributes = Array.from(element.attributes)
          .map(attr => `${attr.name}="${attr.value}"`)
          .join(" ");
        
        return `<${tagName}${attributes ? " " + attributes : ""}>`;
      }

// TODO vervang postgres functie return door JSON object net als bij setAutoCompleterX 
function setAutoCompleter(tableName, fieldName, foreignTableName, foreignKeyName,  foreignFieldName)
{
 var selector = `#${tableName} .${fieldName}`
 var apiFunction = "get_completions"
 $(document).on(
      "focus",
      selector,
      function(event) {
       $(event.target).autocomplete({

            delay: 200,    //  even kijken wat prettig voelt 
            minLength: 1,    // vanaf 2 letters invoer pas autocomplete
               source: function(request, response){
                    fn.callFunction('api.'  + apiFunction, [ foreignTableName, foreignKeyName, foreignFieldName, fn.quote(request.term ) ],
                           function(func_resp){
                         
                           var aSuggestionsArr =
                                  (func_resp[apiFunction]).split("|");

                           response($.map(aSuggestionsArr, function (item) {
                               return {
                                   label: item.split(":::")[0],
                                   value: item.split(":::")[1]
                               };
                           }));
                   });
                   },
                   open: function(event, ui){
                        console.log(`Opening autocomplete for ${tableName}/${fieldName}`)
                        setTimeout(function(){
                                $(event.target).putInFront(); 
                                const myZ = zi(event.target)
                                const [argMax, max] = getHighestZindexOffAll();
                                console.log("Logging event en target")
                                console.log(event)
                                console.log(event.target)
                                console.log(getAllAutoCompletes())
                                console.log(`Autocomplete for ${selector}, ${event} ${ui} zIndex=${myZ}, highest=${max}, argmax=${getStartTag(argMax)}`)
                                // dit lijkt NIET voldoende ... tabel wint het soms toch?
                                // check toevoegen of putInFront wel "gelukt is"??
                        }, 100);

                }
          });

      }
  );
}

