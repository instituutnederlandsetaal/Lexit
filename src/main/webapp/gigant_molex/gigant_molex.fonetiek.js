

var molexfon = {};

// container var for the chars in the karakterskiezer
molexfon.aShortcutList = [];

molexfon.oUitspraakContextMenu = {
	"items": {
		"to_fonet1": {"name": "Kopieer naar <b>fonet1</b>", "isHtmlName": true},
		"to_fonet2": {"name": "Kopieer naar <b>fonet2</b>", "isHtmlName": true},
		"to_fonet3": {"name": "Kopieer naar <b>fonet3</b>", "isHtmlName": true},
		"to_fonet4": {"name": "Kopieer naar <b>fonet4</b>", "isHtmlName": true},
		"to_fonet5": {"name": "Kopieer naar <b>fonet5</b>", "isHtmlName": true},
		"to_fonet6": {"name": "Kopieer naar <b>fonet6</b>", "isHtmlName": true},
		"to_fonet7": {"name": "Kopieer naar <b>fonet7</b>", "isHtmlName": true},
		"to_fonet8": {"name": "Kopieer naar <b>fonet8</b>", "isHtmlName": true},
		"to_fonet9": {"name": "Kopieer naar <b>fonet9</b>", "isHtmlName": true},
		"to_fonet10": {"name": "Kopieer naar <b>fonet10</b>", "isHtmlName": true},
		"to_fonetNL1": {"name": "Kopieer naar <b>fonetNL1</b>", "isHtmlName": true},
		"to_fonetNL2": {"name": "Kopieer naar <b>fonetNL2</b>", "isHtmlName": true},
		"to_fonetNL3": {"name": "Kopieer naar <b>fonetNL3</b>", "isHtmlName": true},
		"to_fonetNL4": {"name": "Kopieer naar <b>fonetNL4</b>", "isHtmlName": true},
		"to_fonetNL5": {"name": "Kopieer naar <b>fonetNL5</b>", "isHtmlName": true},
		"to_fonetNL6": {"name": "Kopieer naar <b>fonetNL6</b>", "isHtmlName": true},
		"to_fonetNL7": {"name": "Kopieer naar <b>fonetNL7</b>", "isHtmlName": true},
		"to_fonetNL8": {"name": "Kopieer naar <b>fonetNL8</b>", "isHtmlName": true},
		"to_fonetNL9": {"name": "Kopieer naar <b>fonetNL9</b>", "isHtmlName": true},
		"to_fonetNL10": {"name": "Kopieer naar <b>fonetNL10</b>", "isHtmlName": true},
		"to_fonetB1": {"name": "Kopieer naar <b>fonetB1</b>", "isHtmlName": true},
		"to_fonetB2": {"name": "Kopieer naar <b>fonetB2</b>", "isHtmlName": true},
		"to_fonetB3": {"name": "Kopieer naar <b>fonetB3</b>", "isHtmlName": true},
		"to_fonetB4": {"name": "Kopieer naar <b>fonetB4</b>", "isHtmlName": true},
		"to_fonetB5": {"name": "Kopieer naar <b>fonetB5</b>", "isHtmlName": true},
		"to_fonetB6": {"name": "Kopieer naar <b>fonetB6</b>", "isHtmlName": true},
		"to_fonetB7": {"name": "Kopieer naar <b>fonetB7</b>", "isHtmlName": true},
		"to_fonetB8": {"name": "Kopieer naar <b>fonetB8</b>", "isHtmlName": true},
		"to_fonetB9": {"name": "Kopieer naar <b>fonetB9</b>", "isHtmlName": true},
		"to_fonetB10": {"name": "Kopieer naar <b>fonetB10</b>", "isHtmlName": true}
	},
	// callback function called after the user has chosen an option in the context menu
	"callback": function(t, n, key, options) {

		var nRow = fn.getRowNode(n);
		var sString = fn.getDataFromCellNode(n);
		var sDestination = (key.split("_"))[1];	
		var oColVal = {};
		oColVal[sDestination] = sString;
		setTimeout(function(){
			$(fn.getCellInRowNode(nRow, sDestination)).click() // trigger jeditable
			setTimeout(function(){
				$(':focus').val(sString); // pre-fill value for edition (if not edited, it will be removed on blur!)
				
			}, 100);
			
		}, 100);
	}
};





molexfon.fonetConfig1 = {
	
	"editable": true,
	"bgcolor": "#A9BCF5",
	"class": "nobreak",
	"contextmenu": molexfon.oUitspraakContextMenu,
	"searchpreprocess": function(value){ 
		return value.replace(/g/g, "ɡ"); // automatically translate the generic 'g' into a phonetic 'g'
	},
	"editpreprocess": function(value){
		return value.replace(/g/g, "ɡ"); // automatically translate the generic 'g' into a phonetic 'g'
	}
};
molexfon.fonetConfig2 = {

	"visible": false,
	"bgcolor": "#A9BCF5",
	"editable": true,
	"class": "nobreak",
	"contextmenu": molexfon.oUitspraakContextMenu,
	"searchpreprocess": function(value){ 
		return value.replace(/g/g, "ɡ"); // automatically translate the generic 'g' into a phonetic 'g'
	},
	"editpreprocess": function(value){
		return value.replace(/g/g, "ɡ"); // automatically translate the generic 'g' into a phonetic 'g'
	}
};


molexfon.fonetConfigNL1 = {
	
	"editable": true,
	"bgcolor": "#F6E3CE",
	"class": "nobreak",
	"contextmenu": molexfon.oUitspraakContextMenu,
	"searchpreprocess": function(value){ 
		return value.replace(/g/g, "ɡ"); // automatically translate the generic 'g' into a phonetic 'g'
	},
	"editpreprocess": function(value){
		return value.replace(/g/g, "ɡ"); // automatically translate the generic 'g' into a phonetic 'g'
	}
};
molexfon.fonetConfigBE1 = {
	
	"editable": true,
	"bgcolor": "#F6CED8",
	// "editcallback": function(t, n, value){
	// 	fonetCallback(t, n, value);
	// },
	"class": "nobreak",
	"contextmenu": molexfon.oUitspraakContextMenu,
	"searchpreprocess": function(value){ 
		return value.replace(/g/g, "ɡ"); // automatically translate the generic 'g' into a phonetic 'g'
	},
	"editpreprocess": function(value){
		return value.replace(/g/g, "ɡ"); // automatically translate the generic 'g' into a phonetic 'g'
	}
};

molexfon.fonetConfigNL2 = {

	"visible": false,
	"bgcolor": "#F6E3CE",
	"editable": true,
	"class": "nobreak",
	"contextmenu": molexfon.oUitspraakContextMenu,
	"searchpreprocess": function(value){ 
		return value.replace(/g/g, "ɡ"); // automatically translate the generic 'g' into a phonetic 'g'
	},
	"editpreprocess": function(value){
		return value.replace(/g/g, "ɡ"); // automatically translate the generic 'g' into a phonetic 'g'
	}
};
molexfon.fonetConfigBE2 = {

	"visible": false,
	"bgcolor": "#F6CED8",
	"editable": true,
	"class": "nobreak",
	"contextmenu": molexfon.oUitspraakContextMenu,
	"searchpreprocess": function(value){ 
		return value.replace(/g/g, "ɡ"); // automatically translate the generic 'g' into a phonetic 'g'
	},
	"editpreprocess": function(value){
		return value.replace(/g/g, "ɡ"); // automatically translate the generic 'g' into a phonetic 'g'
	}
};



molexfon.settings = {
	
	uitspraak: {
		
		"preinit_callback": function(t){
			molexfon.aShortcutList = [];
		},

		"button_0": {

			"name": "Toon karakterskiezer",
			"click": function(t){
				fn.callDatabase("karakterskiezer");
			}
		},
		
		"button_1": {
			
			"name": "Vind dubbelen",
			click: function(t){
				
				fn.showProcessingMsg(t);
				
				setTimeout(function(){
					
					fn.callFunction( sApiSchema+".check_fonets", [], function(resp){
						
						fn.removeProcessingMsg(t);
						
						var output = resp["check_fonets"];
						
						output = "<div style='height: 300px; overflow-y:scroll;'><table>"+
							"<tr><td>lemma_id |</td><td>modern_lemma</td></tr>"+
							"<tr><td></td><td></td></tr>"+
							"<tr><td>" + 
							output.replace(/:::/g, "</td><td>").replace(/###/g, "</td></tr><tr><td>") + 
							"</td></tr>"+
							"</table></div>";
					
						fn.message("Gevonden dubbelen", output);
					});
					
				}, 100);
				
				
				
			}
		},

		"columns_sorting": {"modern_lemma": "asc", "lemma_id": "asc"},

		"columns_order": [
			"id",
			"lemma_id",
			"molex_lemma",
			"modern_lemma",
			"lemma_pos",
			"keurmerk",
			"online",
			"gloss",
			"homograaf",
			"beoordeeld",
			"subset",
			"source_id",
			"fonet1", "fonet2", "fonet3", "fonet4", "fonet5", "fonet6", "fonet7", "fonet8", "fonet9", "fonet10",
			"fonetNL1", "fonetNL2", "fonetNL3", "fonetNL4", "fonetNL5", "fonetNL6", "fonetNL7", "fonetNL8", "fonetNL9", "fonetNL10",
			"fonetB1", "fonetB2", "fonetB3", "fonetB4", "fonetB5", "fonetB6", "fonetB7", "fonetB8", "fonetB9", "fonetB10",
			"opmerking",				
			"provenance"
		],

		"callback": function(t){
			if (!fn.tableExists("karakterskiezer")){
				fn.callDatabase("karakterskiezer");
			}
			setTimeout(function(){
				fn.pileupTables("uitspraak", "karakterskiezer");
			}, 100);
		},
		"repeat_callback": true,
		
		"destroy_callback": function(t){
			
			molexfon.unbind(t);
			
		}
		
		
	},

	karakterskiezer: {

		"main_search": false,
		"reset_button": false,
		"columns_button": false,
		"viewtype_button": false,
		"refresh_button": false,
		"replace_button": false,
		"selection_button": false,
		"selection_button_active": false,
		"undo_button": false,
		"goto_button": false,
		"help_button": false,

		"size": "80%",
		"header_height": "0px",
		"export_buttons": false,
		"pagination_at_bottom": false,
		"pagination_on_top": false,

		"button_0": {

			"name": "Ververs karakterskiezer",
			"click": function(t){
				fn.message("Eén tel...", "Aan het verversen...");

				setTimeout(function(){
						fn.callFunction(sApiSchema+".rebuild_char_selector", [], function(resp){
						fn.closeDialog();
						setTimeout(function(){
							fn.refreshTable(t);
						}, 500);
						
					});
				}, 100);
				
			}
		},

		"callback": function(t){
			
			// get rid of unnecessary elements
			setTimeout(function() {
				$("#"+fn.getTableName(t)+"_wrapper").find("#"+fn.getTableName(t)+"_length").hide();
				$("#"+fn.getTableName(t)+"_wrapper").find(".dataTables_info").hide();
				}, 100);

			// get the list of all chars in the chars selector
			var aRows = fn.getAllRowNodes(t);
			if (aRows.length>0){
				var nRow = aRows[0];
				var aKeyBoard = 'qwertyuiopasdfghjklzxcvbnm'.split("");
				var aSpecialChars = (fn.getDataFromCellInRowNode(nRow, "karakterskiezer")).replace(/[ a-z0-9\?@&:]/g, '').split("");

				if ($("#shortcuts").elementExists())
					$("#shortcuts").remove();
				var shortcutsTable = $("<div></div>").attr("id", "shortcuts").css("background-color", "lightgrey").css("height", "100px").css("display", "flex").css("flex-direction", "column").css("flex-wrap", "wrap");
				$("#karakterskiezer_dynamic").append(shortcutsTable);

				var oneChar, sShortCut;
				for (var i=0; i<aSpecialChars.length; i++){
					oneChar = aSpecialChars[i];
					sShortCut = "shift+"+aKeyBoard[i];
					$("#shortcuts").append( $("<div></div>").html("&nbsp;&nbsp;&nbsp;&nbsp;"+oneChar+"&nbsp;&nbsp;&nbsp;shortcut:"+sShortCut+""));
					molexfon.aShortcutList.push(sShortCut);

					Mousetrap.bindGlobal(sShortCut, function(e){

						e.preventDefault();

						// get the current cursor position (at which we will be inserting a char)
						var iCursorPos = e.target.selectionStart;

						// get the pressed key of the shortcut
						var sPressed = String.fromCharCode(e.which).toLowerCase();
						var iIndex = 'qwertyuiopasdfghjklzxcvbnm'.indexOf(sPressed);

						// get the phonetic chars corresponding to the shortcut
						var aSpecialChars = (fn.getDataFromCellInRowNode(nRow, "karakterskiezer")).replace(/[ a-z0-9\?@&:]/g, '').split("");														
						
						// get the focussed input
						var $focused = $(':focus');
						$focused.trigger($.Event("keypress", {which: (aSpecialChars[iIndex]).charCodeAt(0), keyCode: (aSpecialChars[iIndex]).charCodeAt(0)}));
						
						// insert the value at the cursor position
						var sBeforeCursor = $focused.val().substring(0, iCursorPos);
						var sAfterCursor = $focused.val().substring(iCursorPos);
						$focused.val( sBeforeCursor + aSpecialChars[iIndex] + sAfterCursor);

						// keep the cursor at the original position
						e.target.selectionStart = iCursorPos+1;
						e.target.selectionEnd = iCursorPos+1;

						return false;
					});
				}

				// ε̃
				// (karakter gekopieerd van https://e-ans.ivdnt.org/topics/pid/topic-16043935841609440)

				var char = "ε̃";
				$("#shortcuts").append( $("<div></div>").html("&nbsp;&nbsp;&nbsp;&nbsp;"+char+"&nbsp;&nbsp;&nbsp;shortcut:shift+2"));

				molexfon.aShortcutList.push("shift+2");
				Mousetrap.bindGlobal("shift+2", function(e){ 

					e.preventDefault();

					// get the current cursor position (at which we will be inserting a char)
					var iCursorPos = e.target.selectionStart;

					// get the focussed input
					var char = "ε̃";
					var $focused = $(':focus');
					var value = char.charCodeAt(0);
					$focused.trigger($.Event("keypress", { which: value, keyCode: value }) );

					// insert the value at the cursor position
					var sBeforeCursor = $focused.val().substring(0, iCursorPos);
					var sAfterCursor = $focused.val().substring(iCursorPos);
					$focused.val( sBeforeCursor + char + sAfterCursor);

					// keep the cursor at the original position
					e.target.selectionStart = iCursorPos+1;
					e.target.selectionEnd = iCursorPos+1;

					return false;
				});

				// œ̃
				// (karakter gekopieerd van https://e-ans.ivdnt.org/topics/pid/topic-16043935841609440)

				var char = "œ̃";
				$("#shortcuts").append( $("<div></div>").html("&nbsp;&nbsp;&nbsp;&nbsp;"+char+"&nbsp;&nbsp;&nbsp;shortcut:shift+3"));

	            molexfon.aShortcutList.push("shift+3");
				Mousetrap.bindGlobal("shift+3", function(e){ 

					e.preventDefault();

					// get the current cursor position (at which we will be inserting a char)
					var iCursorPos = e.target.selectionStart;

					// get the focussed input
					var char = "œ̃";
					var $focused = $(':focus');
					var value = char.charCodeAt(0);
					$focused.trigger($.Event("keypress", { which: value, keyCode: value }) );

					// insert the value at the cursor position
					var sBeforeCursor = $focused.val().substring(0, iCursorPos);
					var sAfterCursor = $focused.val().substring(iCursorPos);
					$focused.val( sBeforeCursor + char + sAfterCursor);

					// keep the cursor at the original position
					e.target.selectionStart = iCursorPos+1;
					e.target.selectionEnd = iCursorPos+1;

					return false;
				});

				// ɑ͂
				// (karakter gekopieerd van https://e-ans.ivdnt.org/topics/pid/topic-16043935841609440)

				var char = "ɑ͂";
				$("#shortcuts").append( $("<div></div>").html("&nbsp;&nbsp;&nbsp;&nbsp;"+char+"&nbsp;&nbsp;&nbsp;shortcut:shift+5"));

	            molexfon.aShortcutList.push("shift+5");
				Mousetrap.bindGlobal("shift+5", function(e){ 

					e.preventDefault();

					// get the current cursor position (at which we will be inserting a char)
					var iCursorPos = e.target.selectionStart;

					// get the focussed input
					var char = "ɑ͂";
					var $focused = $(':focus');
					var value = char.charCodeAt(0);
					$focused.trigger($.Event("keypress", { which: value, keyCode: value }) );

					// insert the value at the cursor position
					var sBeforeCursor = $focused.val().substring(0, iCursorPos);
					var sAfterCursor = $focused.val().substring(iCursorPos);
					$focused.val( sBeforeCursor + char + sAfterCursor);

					// keep the cursor at the original position
					e.target.selectionStart = iCursorPos+1;
					e.target.selectionEnd = iCursorPos+1;

					return false;
				});

				// ɔ͂
				// (karakter gekopieerd van https://e-ans.ivdnt.org/topics/pid/topic-16043935841609440)

				var char = "ɔ͂";
				$("#shortcuts").append( $("<div></div>").html("&nbsp;&nbsp;&nbsp;&nbsp;"+char+"&nbsp;&nbsp;&nbsp;shortcut:shift+7"));

                molexfon.aShortcutList.push("shift+7");
				Mousetrap.bindGlobal("shift+7", function(e){ 

					e.preventDefault();

					// get the current cursor position (at which we will be inserting a char)
					var iCursorPos = e.target.selectionStart;

					// get the focussed input
					var char = "ɔ͂";
					var $focused = $(':focus');
					var value = char.charCodeAt(0);
					$focused.trigger($.Event("keypress", { which: value, keyCode: value }) );

					// insert the value at the cursor position
					var sBeforeCursor = $focused.val().substring(0, iCursorPos);
					var sAfterCursor = $focused.val().substring(iCursorPos);
					$focused.val( sBeforeCursor + char + sAfterCursor);

					// keep the cursor at the original position
					e.target.selectionStart = iCursorPos+1;
					e.target.selectionEnd = iCursorPos+1;

					return false;
				});
				
			}
			
		},
		"repeat_callback": true
	}	
};


// get rid of the mousetrap bindings 
molexfon.unbind = function(t){
	
	// remove all mousetrap bindings for the karakterskiezer
	// otherwise one will still have this behaviour on other tables, which is not desired!
	
	for (var i=0; i<molexfon.aShortcutList.length; i++){
		Mousetrap.unbind(molexfon.aShortcutList[i]);
	}
}


molexfon.config = {
	
	uitspraak: {

		"id": {
			"visible": false
		},
		"lemma_id": {

		},
		"molex_lemma": {
			"visible": false
		},

		"modern_lemma": {
			// copy of same field in lemmata table
			"cell_tooltip": "Klik om naar de lemmata-tabel te gaan",
			"click": function(t, n){
				var sLemId = fn.getDataFromSiblingNode(n, "lemma_id");
				fn.callDatabase("lemmata", {"lemma_id": sLemId}, function(){
					fn.scrollToTable("lemmata");
				});
			},
			"bgcolor": "#E6F8E0"
		},
		"lemma_pos": {
			// copy of same field in lemmata table
		},
		"keurmerk": {
			// copy of same field in lemmata table
		},
		"online": {
			// copy of same field in lemmata table
		},
		"gloss": {
			// copy of same field in lemmata table
		},
		"homograaf": {
			// this shows if there are homonyms
		},
		"subset": {
			"visible": false
			// copy of same field in lemmata table
		},
		"source_id": {
			"visible": false
			// copy of same field in lemmata table
		},

		"fonet1": molexfon.fonetConfig1,	// visible by default
		"fonet2": molexfon.fonetConfig1,
		"fonet3": molexfon.fonetConfig1,
		"fonet4": molexfon.fonetConfig1,
		"fonet5": molexfon.fonetConfig1,
		"fonet6": molexfon.fonetConfig2,	// NOT visible by default
		"fonet7": molexfon.fonetConfig2,
		"fonet8": molexfon.fonetConfig2,
		"fonet9": molexfon.fonetConfig2,
		"fonet10": molexfon.fonetConfig2,

		"fonetNL1": molexfon.fonetConfigNL1,	// visible by default
		"fonetNL2": molexfon.fonetConfigNL1,
		"fonetNL3": molexfon.fonetConfigNL2,	// NOT visible by default
		"fonetNL4": molexfon.fonetConfigNL2,
		"fonetNL5": molexfon.fonetConfigNL2,
		"fonetNL6": molexfon.fonetConfigNL2,
		"fonetNL7": molexfon.fonetConfigNL2,
		"fonetNL8": molexfon.fonetConfigNL2,
		"fonetNL9": molexfon.fonetConfigNL2,
		"fonetNL10": molexfon.fonetConfigNL2,

		"fonetB1": molexfon.fonetConfigBE1,	// visible by default
		"fonetB2": molexfon.fonetConfigBE1,
		"fonetB3": molexfon.fonetConfigBE2,	// NOT visible by default
		"fonetB4": molexfon.fonetConfigBE2,
		"fonetB5": molexfon.fonetConfigBE2,
		"fonetB6": molexfon.fonetConfigBE2,
		"fonetB7": molexfon.fonetConfigBE2,
		"fonetB8": molexfon.fonetConfigBE2,
		"fonetB9": molexfon.fonetConfigBE2,
		"fonetB10": molexfon.fonetConfigBE2,

		"opmerking": {
			"editable": true
		},
		"beoordeeld": {
			"editable": true
		},
		"provenance": {
			// kind of source field, to tell where fonet were imported from
		}


	},

	karakterskiezer: {

		"karakterskiezer": {
			
			"textsize": "20pt",
			
			"click": function( t, n ){
				
				// trick: https://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript
				
				
				// copy chars clicked upon
				
				var oCell = fx.getCell(n, "karakterskiezer");
				var oClickedUpon = fx.getWordClickedUponInCell(oCell);
				var sClickedUpon = oClickedUpon.text;
				
				// put the chars into an invisible textarea
				
				var tmpTextArea = $("<textarea></textarea>").attr("id", "aangeklikt_karakter").text(sClickedUpon);
				$("#temporary_stuff").append(tmpTextArea);
				
				// and select it!
				
				var copyChar = $('#aangeklikt_karakter');
				copyChar.select();
				
				try {
					// now copy it to clipboard
					
				    document.execCommand('copy');					    
				    
				    // confirm to user which chars he/she has chosen
				    fn.message("Gekozen karakter", "Gekozen karakter:<BR><BR>"+sClickedUpon);
				    
				    // remove temporary textarea
				    
				    $("#aangeklikt_karakter").remove();
				    
				    
				    setTimeout(function(){
				    	
				    	// remove message
				    	
						fn.closeDialog();
						
						// put focus onto the main table
					    // this will call a header function, which will make this table active
						
						$("#uitspraak_wrapper div.top").mousedown();	
						
					}, 1000);

				    
				  } catch (err) {
					  // tell user if something went wrong
					  
					  fn.message("Selectie mislukt. Klik nog een keer!");
				  }
				
				
			}
		}
	}
};
