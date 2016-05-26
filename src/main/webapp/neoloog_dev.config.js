// list of tables that must be hidden or visible (don't use both, it's a matter of what's the most convenient)
oHiddenTablesList = [];
oShowOnlyTables = ["neologismen"]; 


// default document choice
// this has to have a 'silly' default value, to make sure that the
// default display shows no document at all
var sDefaultDocumentWaarde = "even_een_onzin_waarde";

var anwBewerking = false;

oTableSettingsList = {
		
	concordanties : {
		
		"header_height": "70px", // this height needed for googlesearch button!
		
		"callback": function(t){
			
			var oRows = fx.getAllRows(t);
			
			oRows.every(function(){
				
				var oCurrentRow = this;
				
				var sConc = fx.getDataFromCellInRow(oCurrentRow, "concordanties");
				var sWord = fx.getDataFromCellInRow(oCurrentRow, "woord");
				
				// put highlights
				
				var aQuote = sConc.split("^");
				
				for (var i=0; i<aQuote.length; i++)
					{
					var sQuote = aQuote[i];
					
					// We have to highlight the word in the middle of the quote:
					//
					//     bla bla bla bla  <relevant word> bla bla bla  [bron] 
					//
					// But since the quote might contain the same word in the front part,
					// we have to exclude the front part in the 'indexOf' call.
					
					// We do that by getting the true quote length, dividing that by 2
					// so as to get the middle, and subtract the length of the word
					// we have to highlight. This gives a reliable position to start
					// searching the word from.
					// The true quote length can be obtained by getting the index
					// of '[bron]' as this was appended to the quote. 
					
					var iSearchFromPos =	(sQuote.indexOf("[")/2)-sWord.length;
					
					var iStartIndex =		sQuote.toLowerCase().indexOf( sWord.toLowerCase(), iSearchFromPos );
					
					// in some rare cases, the word to be highlight is not located in the middle
					// of the quote, but in the front part (!). In those cases we have to recompute
					// iStartIndex from there
					if (iStartIndex<0)
						iStartIndex = sQuote.toLowerCase().indexOf( sWord.toLowerCase() );
					
					var iEndIndex =			iStartIndex + sWord.length;
					var aNewPairsArray =	new Array();
					
					aNewPairsArray.push([iStartIndex, iEndIndex]);
					
					aQuote[i] = fn.getHighlight(sQuote, aNewPairsArray, "yellow");
					
					}
				
					
				sConc = aQuote.join("^");
				
				// split into separate lines					
				var sConc = sConc.replace("^", "<BR><BR>", "g");
				
				fx.putDataIntoCell(oCurrentRow, "concordanties", sConc);
				
				
			});
		},
		"repeat_callback": true,
		
		"reset_button": false,
		"columns_button": false,
		"viewtype_button": false,
		"refresh_button": false,
		"replace_button": false,
		"selection_button": false,
		"undo_button": false,
		"goto_button": false,
		"help_button": false,
		
		"button_0": {
			"name": "Zoek het op in Google",
			"click": function(t){
				
				var oSelectedRow =	fx.getFirstSelectedRowFrom("neologismen");
				var woord =			fx.getDataFromCellInRow(oSelectedRow, "woord");
				
				// query example
				// https://www.google.nl/?gws_rd=ssl#cr=countryNL&tbs=ctr:countryNL&q=hoi				
				window.open("https://www.google.nl/#q="+woord+"&cr=countryNL&tbs=ctr:countryNL,lr:lang_1nl&lr=lang_nl");
			}
		}
	},
		
		
	neologismen : {
		
		"viewtype_button": false,
		
		"callback": function(t){
			
				buildDocumentSelector(t);
				showStatus(t);
				
				var oRows = fx.getAllRows(t);
				
				oRows.every(function(){
					
					var sWoord =		fx.getDataFromCellInRow(this, "woord");
					var sWoordOrig =	fx.getDataFromCellInRow(this, "woord_orig");
					var sLemma =		fx.getDataFromCellInRow(this, "lemma");
					var sLemmaOrig =	fx.getDataFromCellInRow(this, "lemma_orig");
					
					
					if (sWoord != sWoordOrig)
						$( fx.getCellNode(this, "woord") ).css("color", "red");
					if (sLemma != sLemmaOrig)
						$( fx.getCellNode(this, "lemma") ).css("color", "red");
				});
			},
		"repeat_callback": true,
		
		"prereset_callback": function(t){
			
			anwBewerking = false;
			
			fn.setCustomButtonCss(t, 0, "background-color", (anwBewerking ? "yellow" : "blue") );
			fn.setCustomButtonCss(t, 0, "color", (anwBewerking ? "black" : "white") );
			fn.setCustomButtonName(t, 0, "ANW voorbewerking ["+
					(anwBewerking ? "AAN" : "UIT") + "]");
			
			conf.changeTableConfigValue( fn.getTableName(t), "datum", "keepfilter", false);
			
			fn.addFilters(t, {"datum": sDefaultDocumentWaarde} );				
		},
		
		"width": "80%",
		
		"button_0": {
			"name": "ANW voorbewerking [UIT]",
			"click": function(t){
				
				anwBewerking = !anwBewerking;
				$("#neologismen_tableclosebutton button").click();
				$("#concordanties_tableclosebutton button").click();
				
				conf.changeTableConfigValue("neologismen", "woordsoort", "visible", anwBewerking);
				conf.changeTableConfigValue("neologismen", "minidefinitie", "visible", anwBewerking);	
				
				var oFilters = (anwBewerking ? {"anw": true} : {});
				
				fn.callDatabase("neologismen", oFilters, function(){
					fn.setCustomButtonCss("neologismen", 0, "background-color", (anwBewerking ? "yellow" : "blue") );
					fn.setCustomButtonCss("neologismen", 0, "color", (anwBewerking ? "black" : "white") );
					fn.setCustomButtonName("neologismen", 0, "ANW voorbewerking ["+
							(anwBewerking ? "AAN" : "UIT") + "]");
				},
				{"width": (anwBewerking ? "90%" : "80%") });		
				
				
				
			}
		},
		
		"button_1": {
			"name": "Ik ben klaar!",
			"textcolor": "black",
			"bgcolor": "red",
			"click": function(t){
				
				fn.confirm("Zeker weten?", "Weet u zeker dat u klaar bent?", 
					function(){					
						var sDate = fn.getFilters(t)["datum"];
						fn.callFunction("set_status", [sDate, true], function(){
							fn.refreshTable(t, function(){
								setTimeout(function(){
									fn.message("Klaar", "Deze dataset staat nu te boek als: KLAAR");
								}, 500);
								
							});
							
						});
					}, 
					function(){
						fn.message("OK", "Geannuleerd. U kunt doorgaan met het bewerken van deze dataset.");
				});
				
				
			}
		}
	}
		
};



oTableConfigurationList = {
		
	concordanties: {
			
		id: {
			"visible": false
		},
		woord: {
			"visible": false
		} 
	},
	
	neologismen : {
		
		id: {
			"visible": false
		},
		
		datum: {
			"filter": sDefaultDocumentWaarde,
			"choosefrom":[],
			"visible": false
		},
		
		woord: {
			"colsort": "asc",
			"editable": true,
			"editcallback": function(t, n, value){
				fn.refreshTable(t);
			}
		},
		woord_orig: {
			"visible": false
		},
		lemma: {
			"colsort": "asc",
			"editable": true,
			"editcallback": function(t, n, value){
				fn.refreshTable(t);
			}
		},
		lemma_orig: {
			"visible": false
		},
		
		 
		
		knop:{
			"button": "Voorbeelden",
			"click": function(t, n){
				
				var sId = fn.getDataFromSiblingNode(n, "id");	
				fn.callDatabase("concordanties", {"id": sId});				
			}
		},
		
		
		neo:{
			"bgcolor": "#E0F8E0",
			"editable": true,
			"editcallback": function(t, n, value){	
				n = fn.getRowNode(n);
				fn.callRecord(n, ["neo", "anw", "niet_neo", "twijfel"]);
			}
		},
		anw:{
			"bgcolor": "#A9F5BC",
			"editable": true,
			"editcallback": function(t, n, value){
				n = fn.getRowNode(n);
				fn.callRecord(n, ["neo", "anw", "niet_neo", "twijfel"]);
			}
		},
		niet_neo:{
			"bgcolor": "#E0F8E0",
			"editable": true,
			"editcallback": function(t, n, value){
				n = fn.getRowNode(n);
				fn.callRecord(n, ["neo", "anw", "niet_neo", "twijfel"]);
			}
		},
		twijfel:{
			"bgcolor": "#A9F5BC",
			"editable": true,
			"editcallback": function(t, n, value){
				n = fn.getRowNode(n);
				fn.callRecord(n, ["neo", "anw", "niet_neo", "twijfel"]);
			}
		},			
		
		comment: {
			"editable": true
		},
		
				
		minidefinitie: {
			"bgcolor": "#E0F8E0",
			"editable": true,
			"visible": false
		},
		woordsoort: {
			"bgcolor": "#E0F8E0",
			"editable": true,
			"visible": false
		}
	
	}
};








// *******************************************
// DOCUMENT SELECTOR
// *******************************************

function buildDocumentSelector(t){

	// get the current document filter setting (which doc was already chosen?)
	var sTableName = 		fn.getTableName(t);
	var sSelectedDocument =	fn.getFilters(t)["datum"];
	
	
	// (re)build the document selector
	$("#document_selector").remove();
	$("#neologismen_length")
	.append(
		$("<div></div>").attr("id", "document_selector")
		.css("position", "relative")			
		.css("top", "-105px")
		);
	
	var oTableConfig =		conf.getTableConfig(sTableName);
	var oColumnConfig =		conf.getColumnConfig(oTableConfig, "datum");
	
	var aListOfOptions =	conf.getSelectionBox(oColumnConfig);
	
	var inputTag =  $("<select/>");
	
	inputTag.append(
		$("<option></option>")
			.attr("value", sDefaultDocumentWaarde )
			.text( "Datum kiezen" )
	);
	for (var j=1; j<aListOfOptions.length; j++)
	{
	inputTag.append(
			$("<option></option>")							
				.attr("value", aListOfOptions[j] )
				.text( aListOfOptions[j] )
		);
	}
	
	// when a choice is made, load the chosen table
	inputTag.change(function(){
		
		sSelectedDocument = $(this).val();	
		fn.addFilters(sTableName, {"datum": "exact:"+sSelectedDocument});
		conf.changeTableConfigValue(sTableName, "datum", "filter", sSelectedDocument);
		conf.changeTableConfigValue(sTableName, "datum", "keepfilter", true);
		fn.refreshTable(t);
	});
	
	$("#document_selector").append(inputTag);
	
	$("#document_selector select").val(sSelectedDocument);

};


/**
 * Status
 * 
 */

function showStatus(t){
	
	// Get the date
	// But do that only if some date was already chosen. If no choice was made, show a warning instead
	var sDocumentChoice = fn.getFilters(t)["datum"];
	
	if (sDocumentChoice == sDefaultDocumentWaarde || sDocumentChoice == null)
		{
		showStatusInHeader("Kies een datum in menu boven links", true);
		}
	else
		{
		var oFirstRow =	fx.getFirstRowFrom(t);
		var datum =		(oFirstRow.count()>0) ? fx.getDataFromCellInRow(oFirstRow, "datum") : '';
		
		if (datum != '')
			fn.callFunction("get_status", [datum], 
					function(){
				
				showStatusInHeader( fn.getFunctionOutput("get_status"), false);
							
				});
		}
};


function showStatusInHeader(sStatus, sWarning){
	
	var sColor = 			"black";
	var sTextDecoration =	"none";
	var sTop = 				"-10px";
	var sLeft = 			"290px";
	var sTextAlign =		"center";
	var sBorder = 			"1px dotted black";

	
	// if the message is a warning, change style accordingly
	if (typeof sWarning != 'undefined' && sWarning == true)
		{
		sColor = 			"red";
		sTextDecoration =	"blink";
		sTop = 				"69px";
		sBorder = 			"none";
		}
	
	$("#neologismen_wrapper .top").find("#neologismen_status").remove();
	$("#neologismen_wrapper .top").append(
			$("<div></div>")
			.attr("id", "neologismen_status")
			.css("width", "400px")	
			.css("text-align", sTextAlign)			
			.css("color", sColor)
			.append($("p").css("text-decoration", sTextDecoration)
					)
			
			);
	$("#neologismen_wrapper .top #neologismen_status").append(
			$("<span></span>")
			.html(sStatus)
			.css("font-size", "120%")
			);
	$("#neologismen_wrapper .top #neologismen_status")
	.css("border", sBorder)
	.css("position", "relative")
	.css("top", sTop)
	.css("left", sLeft);	
};


