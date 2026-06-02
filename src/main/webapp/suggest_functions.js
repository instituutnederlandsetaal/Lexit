function call_function(function_name, args, callback) {
    const a0 = args.map(x => fn.quote(x))
        // fn.message("OK", function_name + ": " + JSON.stringify(a0))
    fn.callFunction("api." + function_name, a0,
    function (func_resp) {
            // fn.message("OK", 'Good for ' + JSON.stringify(a0) + ': ' + JSON.stringify(func_resp))
                var para = (func_resp[function_name])
                console.log("OK", 'para=' + para)

        callback(JSON.parse(para))
    });
}

function select_query(query, callback) {
  call_function('select_query', [query], callback)
}


function setAutoCompleterX(sAutoCompleteSelector, createQuery, result2suggestion)
{
  console.log("Selector: " + sAutoCompleteSelector + " Query: "  + createQuery("$TERM"))
  $(document).on(
      "focus",
      sAutoCompleteSelector,
      function(event) {
       
       $(event.target).autocomplete({

            delay: 200,    //  even kijken wat prettig voelt 
            minLength: 0,    // vanaf 1 letter invoer pas autocomplete
            source: function(request, response){
                    select_query(createQuery(request.term),
                           function(result) {
                           //alert(func_resp[apiFunction]); 
                           //var aSuggestionsArr = (func_resp[apiFunction]).split("|");

                           const x = result.map(result2suggestion);
                           // console.log("x=" + JSON.stringify(x))
                           response(x);
                   });
                   }
          });

      }
  );
}

// //setAutoCompleter("#reiger .matching_lemma","get_concept");
function setSuggestions(tableName, fieldName, foreignTable, foreignKey, foreignField) {
  const selector = `#${tableName} .${fieldName}`
  
  const createQuery = t => `select ${foreignKey}, ${foreignField} from ${foreignTable} where ${foreignField} ~ '^${t}' or ${foreignKey} ~ '^${t}' order by ${foreignField} limit 30`
  const result2suggestion = r => { return { "label": r[foreignField] , "value" : r[foreignKey]}}
  setAutoCompleterX(selector, createQuery, result2suggestion)
}

function addSuggesters()
{
        for (tableName in oTableConfigurationList)
          for (fieldName in oTableConfigurationList[tableName])
             if ("suggest" in oTableConfigurationList[tableName][fieldName])
             { 
                const s = oTableConfigurationList[tableName][fieldName]["suggest"]
                setSuggestions(tableName, fieldName, s.foreignTable, s.foreignKey, s.foreignField)
             }
}

