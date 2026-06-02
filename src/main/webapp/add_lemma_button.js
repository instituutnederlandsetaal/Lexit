const addLemmaButton = {
	
		"name": "Add lemma",
		"click": function (t) {
			fn.prompt("Add lemma",
				["lemma", "part of speech", "gloss"],
				["", "", ""],
				function () {

					var sLemma = fn.getPromptBoxInput("lemma");
					var sLemmaPos = fn.getPromptBoxInput("part of speech"); // moet meelopende lijst krijgen ....
					var sGloss = fn.getPromptBoxInput("gloss");

					// check first if this lemma existed in the past and was removed

					fn.showProcessingMsg(t);

					fn.callFunction("api.insert_lemma_returning_id",
						[sLemma, sLemmaPos, sGloss],
						function (r) {
							var new_lemma_id = r["insert_lemma_returning_id"]
							fn.goToTheRightPage(t, "lemma_id", new_lemma_id);
							fn.refreshTable(t);
							
						},
						function (err) {
							fn.removeProcessingMsg(t);
							console.log("Error creating lemma:" + err);
							get_last_error(x => fn.message('Fout bij toevoegen lemma', x))
						    // fn.message("Let op", "Deze pos-tag is niet toegestaan of iets anders is mislukt. Het lemma is daarom NIET aangemaakt: "  + JSON.stringify(err));
						}
					);
				})
		}
	
};

const addBasiswoordButton = {
	
	"name": "Add word",
	"click": function (t) {
		fn.prompt("Add word",
			["lemma", "part of speech", "level"],
			["", "", ""],
			function () {

				var sLemma = fn.getPromptBoxInput("lemma");
				var sLemmaPos = fn.getPromptBoxInput("part of speech"); // moet meelopende lijst krijgen ....
				var sLevel = fn.getPromptBoxInput("level");

				// check first if this lemma existed in the past and was removed

				fn.showProcessingMsg(t);

				fn.callFunction("api.insert_basiswoord_returning_id", // dit is heel weinig generiek; TODO probeer die zonder specifieke functies te doen (maar toch veilig)
					[sLemma, sLemmaPos, sLevel],
					function (r) {
						var new_lemma_id = r["insert_basiswoord_returning_id"]
						
						fn.refreshTable(t);
						fn.goToTheRightPage(t, "lemma_id", new_lemma_id);
					},
					function (err) {
						fn.removeProcessingMsg(t);
						console.log("Error creating lemma:" + err);
						fn.message("Let op", "Deze pos-tag is niet toegestaan of iets anders is mislukt. Het lemma is daarom NIET aangemaakt: "  + err);
					}
				);
			})
	}

};

const addWordformButton = {
	
		"name": "Add wordform",
		"click": function (t) {

			var aFirstRow;
			var sLemmaId;
			var sLemma = null;

			// if there is no paradigm yet, get the lemma id from the lemma table
			if (fn.tableIsEmpty(t)) {
					aFirstRow = fx.getFirstSelectedRowFrom("lemmata");
					sLemmaId =      fx.getDataFromCellInRow(aFirstRow, "lemma_id");
					sLemma =        fx.getDataFromCellInRow(aFirstRow, "modern_lemma");
			}
			// otherwise just read it from the current table
			else {

					aFirstRow =     (fx.getSelectedRowsFrom(t)).any() ?
									fx.getFirstSelectedRowFrom(t) : fx.getFirstRowFrom(t);
					sLemmaId =      fx.getDataFromCellInRow(aFirstRow, "lemma_id");
					// in this particular case, sLemma will be
					// requested by following fn.getRecord call
			}

			fn.prompt("Add wordform",
				["wordform", "wordform part of speech"],
				["", ""],
				function () {

					var sWordform = fn.getPromptBoxInput("wordform");
					var sWordformPos = fn.getPromptBoxInput("wordform part of speech"); // moet meelopende lijst krijgen ....
					
					// check first if this lemma existed in the past and was removed

					fn.showProcessingMsg(t);

					fn.callFunction("api.insert_wordform",
						[sLemmaId, sWordform, sWordformPos],
						function () {
							fn.refreshTable(t);
						},
						function (err) {
							fn.removeProcessingMsg(t);
							fn.message("Let op", "Deze pos-tag is niet toegestaan of iets anders is mislukt. Het lemma is daarom NIET aangemaakt:"  + JSON.stringify(err));
						}
					);
				})
		}
	
};

function deleteButton(label) {
	return  {
		"name": label,
		"click": function(t){

				fn.confirm("Let op", "Weet u het zeker dat U dit lemma wilt verwijderen?",
				function(resp){
						var nRow = fn.getFirstSelectedRowNodeFrom(t);
						fn.removeFromDatabaseGivenANode(nRow, function(){
								fn.refreshTable(t);
						})
				},
				function(){
						fn.message("OK", "Operatie geannuleerd door gebruiker");
				})
		}
}

}



function lockButton(label, table_name, key_name) {
	return  {
		"name": "🔒",
		"click": function(t){
			aFirstRow =     (fx.getSelectedRowsFrom(t)).any() ? fx.getFirstSelectedRowFrom(t) : fx.getFirstRowFrom(t);
            sRowId = fx.getDataFromCellInRow(aFirstRow, key_name);  
			sRole = getCurrentUserRole()
			if (sRole != "all") {
				alert("Not allowed to lock with role " + sRole)
				return
			}
			call_function("lock_row", ["fase1",  table_name, sRowId], x => { 
				// alert(`${sRowId} locked ${JSON.stringify(x)}`)
				fn.refreshTable(t)
			})	
		}
    }
}

function unlockButton(label, table_name, key_name) {
	return  {
		"name": "🔓",
		"click": function(t){
			aFirstRow =     (fx.getSelectedRowsFrom(t)).any() ? fx.getFirstSelectedRowFrom(t) : fx.getFirstRowFrom(t);
            sRowId = fx.getDataFromCellInRow(aFirstRow, key_name);  
			sRole = getCurrentUserRole()
			if (sRole != "all") {
				alert("Not allowed to unlock with role" + sRole)
				return
			}
			call_function("unlock_row", ["fase1",  table_name, sRowId], x => { 
				// alert(`${sRowId} unlocked ${JSON.stringify(x)}`)
				fn.refreshTable(t)
		    })	
		}
    }
}


function setAutoCompleterFromSelector(selector, foreignTableName, foreignKeyName,  foreignFieldName) // wordt deze nog gebruikt?
{
 var apiFunction = "get_completions_match"
 $(document).on(
      "focus",
      selector,
      function(event) {
       $(event.target).autocomplete({

            delay: 200,    //  even kijken wat prettig voelt 
            minLength: 1,    // vanaf 2 letters invoer pas autocomplete
            source: function(request, response) {
				  // console.log(response)
				  const r = JSON.stringify({"response":  response, "request" : request});
                  call_function(apiFunction, [ foreignTableName, foreignKeyName, foreignFieldName, fn.quote(request.term ) ],
                    function(resp){
                          
						   // console.log(resp)

                           var aSuggestionsArr = resp;
                                  //(func_resp[apiFunction]).split("|");

                           response($.map(aSuggestionsArr, function (item) {
							   
                               return {
                                   label: item[foreignFieldName],
                                   value: item[foreignKeyName]
                               };
                           }));
                   }, function(e) {
					   // alert('Bummer..... '  + e  + " "  + r)
				   });
                   }, 
				   open: function(event, ui){

					setTimeout(function(){
							$(event.target).putInFront();
					}, 100);

			}
           },
		);

      }
  );
}

function addInsertLemmaButton(config) {
	setAutoCompleterFromSelector("#prompt_partofspeech", "fase1.part_of_speech", "part_of_speech", "part_of_speech")
	Object.keys(add_lemma_button).forEach(k => config[k] = add_lemma_button[k])
}


function addInsertWordformButton(config) {
	
	setAutoCompleterFromSelector("#prompt_wordformpartofspeech", "fase1.wordform_part_of_speech", "part_of_speech", "part_of_speech")
	Object.keys(add_wordform_button).forEach(k => config[k] = add_wordform_button[k])
	config["button_1"] = deleteButton("Remove selected wordform");
}

function approvePage(t) {
	const all = fn.getAllRowNodes(t);
	all.forEach(n =>  fn.updateDatabaseGivenANode(n, 
		                    {"ok": true}, 
	                        () => { fn.refreshTable(t) }, 
	                        () => { console.log('Failed to update node')} ))
}

function approvePageButton(t) { return {
  "click" : () => approvePage(t),
  "name": `mark ${t} on current page as OK`
  }
}


