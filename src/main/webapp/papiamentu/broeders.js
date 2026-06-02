

function call_function(function_name, args, callback, error_callback) {
    console.log(`calling ${function_name}(${args})`)
    fn.callFunction("api." + function_name, args, // 
      function (func_resp) {
        var data = (func_resp[function_name])
        if (data == '') {
		  console.log("FAILED: " + `${function_name}(${args}), response:` + JSON.stringify(func_resp))
          if (error_callback) error_callback();
		} else
		try {
			// console.log(`${function_name} ${data}`)
			const parsed = JSON.parse(data)
			callback(parsed)
		  } catch (e) {
			console.log(`bad JSON for ${function_name}: ${data}`)
			console.log(e); // Logs the error
		  }
    });
}


function get_last_error(callback, error_callback) {
	function_name = 'get_last_error'
	
    fn.callFunction("api." + function_name, [], // 
      function (func_resp) {
        var data = (func_resp[function_name])
        if (data == '') {
		  console.log("FAILED: " + `${function_name}(${args}), response:` + JSON.stringify(func_resp))
          if (error_callback) error_callback();
		} else
		{
		   callback(data)
		}
    });
}

function call_function_nojson(function_name, args, callback, error_callback) {
    console.log(`calling ${function_name}(${args})`)
    fn.callFunction("api." + function_name, args, // 
      function (func_resp) {
        var data = (func_resp[function_name])
        if (data == '') {
		  console.log("FAILED: " + `${function_name}(${args}), response:` + JSON.stringify(func_resp))
          if (error_callback) error_callback();
		} else
		{
			callback(data)
		}
    });
}



function ping_backend() {
    function ping_ok() {
      // console.log("Yep, pingable......")
	}

	function ping_failed() {
		alert("U bent uitgelogd - log opnieuw in om verder te kunnen werken")
		window.clearInterval();
		window.location.reload();
	}

	fn.callFunction("api."+ "ping", [], // 
      ping_ok, ping_failed);
}

function setupPing() {
	window.setInterval(ping_backend, 60000) // prevent logout (rather silly)
}


setupPing();

function getLinkedLemmata(self, lemma_id) {
	
	call_function(
		"linked_lemmata", [lemma_id],

		function (response) {
				console.log("Linked lemmata: " + JSON.stringify(response))
			
				const items = response
				function gloss(x)  { return  x.gloss?x.gloss:'' }
				const selectionList = self.select('linked_lemmata').get(0)

				const options = items.map(x => `<option value='${x.lemma_id}'>${x.lemma}: ${x.part_of_speech} ${x.language_id} ${gloss(x)}</option>`).join("")
				
				selectionList.innerHTML = options
				selectionList.size = items.length
			},
		function() {
			console.log('Sadly, no linked lemmata found')
			const selectionList = self.select('linked_lemmata').get(0)
			selectionList.innerHTML = ""
		}			
	);
}

/// Variant linkink dialog

class DialogWrapper {

	constructor(title, content) {
		this.title = title;
		this.id = Math.random().toString(36).substr(2, 9)
		this.dialogId = 'dialog-' + this.id ;
		this.content = content.replace(/DID/g,  this.id);
		
        this.variantSearchId = "variant_search_" + this.id 
	
		this.previousFocus = document.activeElement;
		this.insertDialogIntoDOM();
		this.initializeDialog();
	}

    select(unqualified_id) {
		const selector = `#${unqualified_id}_${this.id}`
		const r =  $(selector)
		if (r.length < 1) {
			console.log(`No match for selector: ${selector} in ${this.content}??`)
		}
		return r
	}

	initializeDialog() {
		const self = this;
		$(`#${this.dialogId}`).dialog({
			autoOpen: false,
			modal: true,
			buttons: {
				"Close": () => {
					this.close();
				}
			},
			close: () => self.close(),
			position: { my: "left bottom", at: "left+20% bottom+40%", of: window } // https://api.jqueryui.com/position/
		});
	}

	insertDialogIntoDOM() {
		const dialogDiv = `<div  id="${this.dialogId}" class="dialog-content" title="${this.title}">
							${this.content}
						   </div>`;
		
		$('body').append(dialogDiv);
        
		const self = this

		self.select('actually_link_them').click(function() {
			const id_to_link_to = self.currentLemmaId()
			const items_to_link = self.selectedItems();
			
			items_to_link.forEach(id => {
				fn.callFunction("api.link_lemmata_as_brothers", [id_to_link_to, id],  // deze functie uit molex kopieren
				function () {
						fn.refreshTable('lemmata');
						
						getLinkedLemmata(self,id_to_link_to); // ietsje te vaak...
				});
			})
			
			
		});


		self.select('unlink_linked_lemmata').click(function() {
		
			const id_to_link_to = self.currentLemmaId();
			const items_to_link = self.selectedLinkedItems();
			
			items_to_link.forEach(id => {
				// fn.callFunction("api.unlink_lemmata", [id, self.getLemmaIdOfLemmaToLink()],  // deze functie uit molex kopieren
				fn.callFunction("api.unlink_lemma", [id],
				function () {
						fn.refreshTable('lemmata');
						getLinkedLemmata(self,id_to_link_to); // ietsje te vaak aangeroepen ...
				});
			})
			
			
		});

		function z(item)  { myDialog.autocompleteChosen(item) } // waarom gebeurt dit niet in insertToDom

		setTimeout(() => { 
			// const zz = self.select('variant_search'); console.log("zz=" + zz.get(0).outerHTML)

			setAutoCompleterFromSelectorX(`#${self.variantSearchId}`, `#variant_lemma_id_${self.dialogId}`, 'fase1.lemmata', 'lemma_id', 'lemma',
				item => item['lemma'] + ' ' + item['part_of_speech'] + ' ' + item['spelsys_id'],
				item => z(item), self.getLemmaIdOfLemmaToLink()); 
		}, 200)
	}



	open() {
		this.previousFocus = document.activeElement;
		$(`#${this.dialogId}`).dialog("open");
		const self = this
	
		var dialogDiv = $(`#${this.dialogId}`)[0].parentElement

		$(dialogDiv).putInFront();
	
		dialogDiv.style.setProperty('width', '60%')
		this.suggestVariants()
		self.select("variant_search").val("")
		self.select("variant_lemma_id").val("")

		//self.select("variant_lemma_id").focus() // ahem.... totaal lelijke oplossing om focus events te forceren...
		

		myDialog.suggestVariants()
		 // Dit werkt niet...........
	}

	close() { 
		console.log("calling close...")
		$(`#${this.dialogId}`).dialog("close");
	
		this.previousFocus.focus();
		console.log("Trying to remove " + this.dialogId)
		$( "#"+this.dialogId ).remove();
		$( ".ui-dialog" ).remove();
	}

	destroy() {
		console.log("Destroy event called....")
		$(`#${this.dialogId}`).dialog("close");
		$( "#"+this.dialogId ).remove();
		$( ".ui-dialog" ).remove();
	}


	autocompleteChosen(item) {
		
		const items = [item]
		const select = this.select('variant_suggestions').get(0)
		function gloss(x)  { return  x.gloss?x.gloss:'' }
		const options = items.map(x => `<option value='${x.lemma_id}'>${x.lemma}: ${x.part_of_speech} ${x.spelsys_id} ${gloss(x)}</option>`).join("")
		// alert(options)
		select.innerHTML = options + select.innerHTML
		select.size = select.size + 1
	}


       getLemmaIdOfLemmaToLink() {
		var lemma_id;
		var oNodes = fx.getSelectedRowsFrom('lemmata');
		oNodes.every(function () {
			lemma_id = fx.getDataFromCellInRow(this, "lemma_id")
		})
	        //alert("Lemma id: " + lemma_id);
		return lemma_id;
	}

	suggestVariants() {
	
		const self = this
		var oNodes = fx.getSelectedRowsFrom('lemmata');
		if (!oNodes.any()) {
			alert("No rows selected, now what can I do???")
			return
		}
		var sLemma = '';
		
		const meself = $(`#${this.dialogId}`)

		oNodes.every(function () {
			var lemma = fx.getDataFromCellInRow(this, "lemma");
			var lemma_id = fx.getDataFromCellInRow(this, "lemma_id");
			sLemma = lemma
			self.select('lemma_to_link').get(0).innerHTML = (lemma_id + ': ' + lemma)
			self.select('variant_lemma_id').val(lemma_id)
			getLinkedLemmata(self,lemma_id)
		})

		var threshold = Math.ceil(sLemma.length / 4)
		var args = [sLemma, threshold]
		
		
		
		call_function(
			"approximate_lemma_search", args,

			// function callback
			function (response) {
				   
			
					const items = response
					function gloss(x)  { return  x.gloss?x.gloss:'' }
					const selectionList = self.select('variant_suggestions').get(0)

					const options = items.map(x => `<option value='${x.lemma_id}'>${x.lemma}: ${x.part_of_speech} ${x.language_id} ${gloss(x)}</option>`).join("")
					// alert(options)
					selectionList.innerHTML = options
					selectionList.size = items.length
				
				},
			function() {
				
				const selectionList = self.select('variant_suggestions').get(0) // dit hoeft niet meer....
				selectionList.innerHTML = ""
			}			
		);
	}

	currentLemmaId() {
		return this.select('variant_lemma_id').val()
	}

	selectedItems() {
		return  this.select('variant_suggestions').val();
	}

	selectedLinkedItems() {
		return  this.select('linked_lemmata').val();
	}
}

// ToDo: maak het mogelijk om bij het zoeken naar een variant voor X X zelf NIET terug te geven

function setAutoCompleterFromSelectorX(selector, valueSelector, foreignTableName, foreignKeyName, foreignFieldName, displayLabelFunction, callback, for_lemma_id) {
	var apiFunction = "get_completions_match"

	console.log(`Setting up autocomplete for variant search field for lemma ${for_lemma_id}, selector=${selector}, ${$(selector).get(0).outerHTML} `)

	function addComplete(x) {
		x.autocomplete({

			delay: 200,    //  even kijken wat prettig voelt 
			minLength: 1,    // vanaf 2 letters invoer pas autocomplete
			source: function (request, response) {

				console.log(`Suggestion source: ${apiFunction} ${foreignTableName}, ${foreignKeyName}, ${foreignFieldName} term=${request.term}`)
				call_function(apiFunction, [foreignTableName, foreignKeyName, foreignFieldName, fn.quote(request.term), fn.quote(`${for_lemma_id}`)],
					function (resp) {

						// console.log(resp)

						var aSuggestionsArr = resp;
						//(func_resp[apiFunction]).split("|");
						console.log("Completions: " + aSuggestionsArr)
						response($.map(aSuggestionsArr, function (item) {

							return {
								label: displayLabelFunction(item),
								value: item
							};
						}));
					});
			}, // open toegevoegd om zeker te zijn dat de lijst boven komt drijven,  Lijkt niet altijd te werken???
			open: function (event, ui) {
				console.log(`Open suggestion list: ${$(event.target).html()} ${apiFunction} ${foreignTableName}, ${foreignKeyName}, ${foreignFieldName}`)
				setTimeout(function () {
					console.log(`Put in front: ${apiFunction} ${foreignTableName}, ${foreignKeyName}, ${foreignFieldName}`)
					$(event.target).putInFront();
				}, 100);

			},
			select: function (event, ui) {
				$(selector).val(ui.item.label);
				$(valueSelector).val(ui.item.value[foreignKeyName]);
				callback(ui.item.value);
				return false; // Prevent the default behavior of setting the input value
			}
		}
		);
	}

	if (true) addComplete($(selector))
	else $(document).on(
		"focus",
		selector,
		function (event) {
			console.log(`focus event for ${selector}`)
			addComplete($(event.target))
		}
	);
}

var myDialog; 

function initDialog() {
	$( ".ui-dialog" ).remove();
	myDialog = new DialogWrapper("Variant linking",
`<table>
   <td>Current lemma: <td id='lemma_to_link_DID' style='font-weight:bold'></td></tr> 
   <tr>
      <td>Search 
	  <td colspan="3"> <input type='text' size=30 id='variant_search_DID'/> (lemma id:<input type='text' size=7 id='variant_lemma_id_DID'>)
  </tr>
   <tr style='vertical-align:top; padding-top:2em'>
     <td style="padding-top: 2em">Similar lemmata: 
	 <td style="padding-top: 2em" > <select id='variant_suggestions_DID' length='17' size='1' multiple="multiple"></select>
     <td style="padding-top: 2em">Linked lemmata: 
	 <td style="padding-top: 2em"> <select id='linked_lemmata_DID' length='17' size='1' multiple="multiple"></select>
  </tr>
  <tr>
     <td><button id='actually_link_them_DID' value='link selected'>Link selected</button><td>
	 <td>
	 <td><button id='unlink_linked_lemmata_DID' value='link selected'>Unlink selected</button>
	 <td>
  </tr>
</table>
`);
  myDialog.open()
}

function  similaritySearchButton() {
   return {
		"name": "Variant linking",
		"click": function () {
			initDialog();
		}
	}
}
