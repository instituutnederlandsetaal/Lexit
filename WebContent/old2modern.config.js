// list of tables that must be hidden or visible (don't use both, it's a matter of what's the most convenient)
oHiddenTablesList = [];
oShowOnlyTables = [];


// database generation:
// N:\databaseproject\Koppelingdatabase_IKEA\2015_database


// table general settings
oTableSettingsList = {
		
		mnw_wnt_differences:{
			
			//"size": "110%",
			
			"column_order": ["aangepast",
			                 "mnw_id",
			                 "wnt_id",
			                 "histlem_mnw",
			                 "histlem_wnt",
			                 "noor_modlem_mnw",
			                 "noor_modlem_wnt",
			                 "noor_modlem_onw",
			                 "noor_modlem_vmnw",
			                 "wdb",
			                 "pos_mnw",
			                 "pos_wnt",
			                 "clone",
			                 "verwijder",
			                 "unique_id",
			                 "original_mnw_id",
			                 "original_wnt_id",
			                 "niet_in_lex"],
			
			"callback": function(t){
				
				var aN = fn.getAllRows(t);
				aN.each(function(){
					
					var nNode = this;
					var bRemove = fn.getDataFromCellNamed(t, nNode, "verwijder");
					
//					var noorMnw = fn.getDataFromCellNamed(t, nNode, "noor_modlem_mnw");
//					var noorWnt = fn.getDataFromCellNamed(t, nNode, "noor_modlem_wnt");
//					
//					if (noorMnw != noorWnt)
//						{
//						fn.getCellElement(t, nNode, "noor_modlem_mnw").css("color", "red");
//						fn.getCellElement(t, nNode, "noor_modlem_wnt").css("color", "red");
//						}
					
//					var wdbMnw = fn.getDataFromCellNamed(t, nNode, "wdb_modlem_mnw");
//					var wdbWnt = fn.getDataFromCellNamed(t, nNode, "wdb_modlem_wnt");
//					
//					if (wdbMnw != wdbWnt)
//						{
//						fn.getCellElement(t, nNode, "wdb_modlem_mnw").css("color", "red");
//						fn.getCellElement(t, nNode, "wdb_modlem_wnt").css("color", "red");
//						}
					
					if (bRemove == 't')
						{
						var aColumnNames = mt.getListOfVisibleColumnsOf( fn.getTableName(t) );
						for (var i=0; i<aColumnNames.length; i++)
							{
							fn.getCellElement(t, nNode, aColumnNames[i]).css("opacity", "0.2");
							}
						}
					
					// add tooltip on lemmaforms
					var sTooltip1 = fn.getDataFromCellNamed(t, nNode, "noor_modlem_onw");
					var sTooltip2 = fn.getDataFromCellNamed(t, nNode, "noor_modlem_vmnw");
					var sTooltip3 = fn.getDataFromCellNamed(t, nNode, "noor_modlem_mnw");
					var sTooltip4 = fn.getDataFromCellNamed(t, nNode, "noor_modlem_wnt");
					var sTooltip = 	"<span style='font-family:Courier'>" +
					"ONW : " + sTooltip1.replace(" ", "&nbsp;") + "<br>" +
					"VMNW: " + sTooltip2.replace(" ", "&nbsp;") + "<br>" +
					"MNW : " + sTooltip3.replace(" ", "&nbsp;") + "<br>" +
					"WNT : " + sTooltip4.replace(" ", "&nbsp;") +
					"</span>";
					var eLem1 = fn.getCellElement(t, nNode, "histlem_mnw");
					var eLem2 = fn.getCellElement(t, nNode, "histlem_wnt");
					var eLem3 = fn.getCellElement(t, nNode, "noor_modlem_mnw");
					var eLem4 = fn.getCellElement(t, nNode, "noor_modlem_wnt");
					$(eLem1).attr("title", sTooltip);
					$(eLem2).attr("title", sTooltip);
					$(eLem3).attr("title", sTooltip);
					$(eLem4).attr("title", sTooltip);
					
				});
			},
			
			"repeat_callback": true,
			
			"button_0":{
				"name": "Kloon regel",
				"bgcolor": "black",
				"click": function(t){
					
					var aN = fn.getSelectedRowsFrom(t);	
					
					aN.each(function(){
						var nNode = this;							
						var bLast = fn.isLastNodeOf(nNode, aN);
												
						var id = fn.getRowId(nNode);
						
						// first add 1 to all following ids					
						fn.callFunction("add_1_to_ids", [id], function(){
							
							fn.getRecord(t, id, function(r){
								
								fn.insertIntoDatabase(t, 
										{
										"mnw_id": r["mnw_id"],
										"wnt_id": r["wnt_id"],
										"original_mnw_id": r["original_mnw_id"],
										"original_wnt_id": r["original_wnt_id"],
										"histlem_mnw": r["histlem_mnw"],
										"histlem_wnt": r["histlem_wnt"],
										"noor_modlem_mnw": r["noor_modlem_mnw"],
										"noor_modlem_wnt": r["noor_modlem_wnt"],
//										"wdb_modlem_mnw": r["wdb_modlem_mnw"],
//										"wdb_modlem_wnt": r["wdb_modlem_wnt"],
										"pos_mnw": r["pos_mnw"],
										"pos_wnt": r["pos_wnt"],
										"unique_id": (parseInt(id)+1),
										"clone": true
										}, 
										null, bLast);
								
							});
							
						});
						
						
					});
					
					
					
				}
			},
			"button_1":{
				"name": "Verwijder kloon",
				"bgcolor": "black",
				"click": function(t){
					
					fn.confirm("Let op", "Weet u dit zeker?", function(){
						var aN = fn.getSelectedRowsFrom(t);
						aN.each(function(){
							var nNode = this;
							var bClone = fn.getDataFromCellNamed(t, nNode, "clone") == 't';
							var bLast = fn.isLastNodeOf(nNode, aN);
																					
							if (bClone)
								{
								fn.removeFromDatabaseGivenANode(t, nNode, bLast);
								}
							else if (!bClone)
								{
								fn.message("Niet toegestaan", "U kunt alleen klonen verwijderen!");
								
								if (bLast)
									fn.refreshTable(t);
								}
						});
					});
				}
			},
			"button_2":{
				"name": "Verwijder link",
				"click": function(t){
					
					fn.confirm("Let op", "Weet u dit zeker?", function(){
						var aN = fn.getSelectedRowsFrom(t);
						aN.each(function(){
							var nNode = this;							
							var bLast = fn.isLastNodeOf(nNode, aN);
							
							fn.updateDatabaseGivenANode(t, nNode, ["verwijder"], [true], bLast);
						});
					});
				}
			},
			"button_3":{
				"name": "Herstel link",
				"click": function(t){
					
					var aN = fn.getSelectedRowsFrom(t);
					aN.each(function(){
						var nNode = this;							
						var bLast = fn.isLastNodeOf(nNode, aN);
						
						fn.updateDatabaseGivenANode(t, nNode, ["verwijder"], [false], bLast);
					});
				}
			},
			"button_4":{
				"name": "Herstel MNW-id",
				"bgcolor": "grey",
				"click": function(t){
					
					fn.confirm("Let op", "Weet u zeker dat u het MNW-id wilt herstellen?", function(){
						
						fn.showProcessingMsg(t);
						var nNode = fn.getSelectedRowsFrom(t)[0];
						var mnwId = fn.getDataFromCellNamed(t, nNode, "original_mnw_id");
						fn.updateDatabaseGivenANode(t, nNode, ["mnw_id"], [mnwId], false, function(){
							
							fn.getIdFromDatabase("marijke_spelling", {"hist_lemma_id": "^MNW"+mnwId+"$"}, function(id){
								
								fn.getRecord("marijke_spelling", id, function(r){
									
									fn.updateDatabaseGivenANode(t, nNode, 
											["noor_modlem_mnw", "histlem_mnw", "pos_mnw", "pos_wnt"], 
											[ r["modern_lemma_final"], r["hist_lemma"], "", "" ], 
											true);
									});								
							});
							
						});
						
					});
					
				}
			},
			"button_5":{
				"name": "Herstel WNT-id",
				"bgcolor": "grey",
				"click": function(t){
					
					fn.confirm("Let op", "Weet u zeker dat u het WNT-id wilt herstellen?", function(){
					
						fn.showProcessingMsg(t);
						var nNode = fn.getSelectedRowsFrom(t)[0];
						var wntId = fn.getDataFromCellNamed(t, nNode, "original_wnt_id");
						fn.updateDatabaseGivenANode(t, nNode, ["wnt_id"], [wntId], false, function(){
							
							fn.getIdFromDatabase("marijke_spelling", {"hist_lemma_id": "^WNT"+wntId+"$"}, function(id){
								
								fn.getRecord("marijke_spelling", id, function(r){
									
									fn.updateDatabaseGivenANode(t, nNode, 
											["noor_modlem_wnt", "histlem_wnt", "pos_wnt", "pos_mnw"], 
											[ r["modern_lemma_final"], r["hist_lemma"], "", "" ], 
											true);
									});
								
							});		
						});
						
						
					});
				}
			},
			"button_6":{
				"name": "GTB Search",
				"click": function(t){
					putSearchInterface();
				}
			}
		}
};


function putSearchInterface(){
	
	$('#wnt_frame').remove();
	$('#mnw_frame').remove();

	
	$("#mnw_wnt_differences_dynamic").append(
			$("<div></div>").html(
					'<form id="gtb_form" name="gtb_form" onsubmit="search();return false">'+
					'ID: <input title="Tik het GTB ID in dat u wilt opzoeken (gebruik wel ONW of VMNW als prefix voor deze 2 woordenboeken; niet nodig voor MNW of WNT)" type="text" id="id_query" name="id_query">'+					
					'Modern lemma: <input type="text" title="Tik het moderne lemma in dat u wilt opzoeken" id="word_query" name="word_query">'+ 
					'Historisch lemma: <input type="text" title="Tik het historische lemma in dat u wilt opzoeken" id="oldword_query" name="oldword_query">'+
					'<input type="button" title="Klik hier om te zoeken in de GTB" value="Zoeken" onclick="search()">'+
					'</form>'		
			)
			.css("position", "relative")
			.css("top", "5px")
			.css("left", "0px")
			.attr("id", "gtb_input_fields")
	);
	
	$("#mnw_wnt_differences_dynamic").append(
			$("<div></div>")
			.attr("id", "list_of_senses")
			.css("position", "relative")
			.css("top", "20px")
			.css("left", "0px")
			.css("width", "370px")
			.css("height", "300px")
	);
	
	$("#mnw_wnt_differences_dynamic").append(
			$("<div></div>")
			.attr("id", "gtb_location")
			.css("position", "relative")
			.css("top", "-295px")
			.css("left", "430px")
	);
	
	$("#mnw_wnt_differences_dynamic").append(
			$("<div></div>")
			.attr("id", "gtb_content")
			.css("position", "relative")
			.css("top", "-280px")
			.css("left", "430px")
			.html('<IFRAME id="gtb_windows" style="height: 380px; width: 800px;"></IFRAME>')
	);

	$(document).on("keydown", function(e){
		
		if (e.which == 13 &&
				($("#id_query").is(":focus") ||
				 $("#word_query").is(":focus") ||
				 $("#oldword_query").is(":focus"))
			)
		{
			search();
		}
		
	});
	
	$("#id_query").on("click", function(){
		$("#word_query").val("");
		$("#oldword_query").val("");
	});
	$("#word_query").on("click", function(){
		$("#id_query").val("");
		$("#oldword_query").val("");
	});
	$("#oldword_query").on("click", function(){
		$("#id_query").val("");
		$("#word_query").val("");
	});
	
}



function openBothWntAndMnw(t, n){
	
	$('#wnt_frame').remove();
	$('#mnw_frame').remove();
	
	$('#gtb_location').remove();
	$('#gtb_content').remove();
	$('#list_of_senses').remove();
	$('#gtb_input_fields').remove();
	
	$("#mnw_wnt_differences_dynamic").append(
			$('<iframe></iframe>')
			.attr("id", "mnw_frame")
			.css("position", "relative")
			.css("top", "5px")
			.css("left", "0px")
			.css("height", "380px")
			.css("width", ($( window ).width()/2)+"px")
		);
	$("#mnw_wnt_differences_dynamic").append(
			$('<iframe></iframe>')
			.attr("id", "wnt_frame")
			.css("position", "relative")
			.css("top", "-380px")
			.css("left", (($( window ).width()/2)+30)+"px")
			.css("height", "380px")
			.css("width", ($( window ).width()/2)+"px")
		);
	
	var mnwId = fn.getDataFromCellNamed(t, n, "mnw_id");
	var wntId = fn.getDataFromCellNamed(t, n, "wnt_id");
	
	$("#mnw_frame").attr("src", "http://gtb.inl.nl/iWDB/search?actie=article&wdb=MNW&id="+mnwId);
	$("#wnt_frame").attr("src", "http://gtb.inl.nl/iWDB/search?actie=article&wdb=WNT&id="+wntId);
	
	
	if(kf.isPressed('ctrl'))
		{
		window.open("http://gtb.inl.nl/iWDB/search?actie=article&wdb=MNW&id="+mnwId);
		window.open("http://gtb.inl.nl/iWDB/search?actie=article&wdb=WNT&id="+wntId);
		kf._setPressedKey("");
		}
	
}

// configuration at column level
oTableConfigurationList = {
		
		mnw_wnt_differences:{
			
			niet_in_lex: {
				"editable": true
			},
			
			clone: {
				"visible": false
			},
			
			original_mnw_id:{
				"visible": false
			},
			
			original_wnt_id:{
				"visible": false
			},
			
			mnw_id:{
				
				"editable": true,
				"editcallback": function( t, n, value){
					
					fn.showProcessingMsg(t);
					
					// mark this records as 'processed'!
					fn.updateDatabaseGivenANode(t, n, ["aangepast"], [true], false, function(){
						
						// take the id the user has given in,
						// and look up the corresponding record in marijke-spelling
						fn.getIdFromDatabase("marijke_spelling", {"hist_lemma_id": "^MNW"+escapeRegexChars(value)+"$"}, function(id){
							
							if (id != '')
								{
								fn.getRecord("marijke_spelling", id, function(r){
									
									// get the modern and historical spelling from the marijke-spelling-record
									// and put this into the table, in the row in which the user
									// has given in a new id
									fn.updateDatabaseGivenANode(t, n, 
											["noor_modlem_mnw", "histlem_mnw", "pos_mnw", "pos_wnt"], 
											[ r["modern_lemma_final"], r["hist_lemma"], "", "" ], 
											true);
									});
								}
							else
								{
								fn.removeProcessingMsg(t);
								fn.message("Let op", "Dit MNW-ID is onbekend");
								}
							
						});
					});
					
				}
			},
			wnt_id:{
				
				"editable": true,
				"editcallback": function( t, n, value){
					
					fn.showProcessingMsg(t);
					
					// mark this records as 'processed'!
					fn.updateDatabaseGivenANode(t, n, ["aangepast"], [true], false, function(){
						
						// take the id the user has given in,
						// and look up the corresponding record in marijke-spelling
						fn.getIdFromDatabase("marijke_spelling", {"hist_lemma_id": "^WNT"+escapeRegexChars(value)+"$"}, function(id){
							
							if (id != '')
								{
								fn.getRecord("marijke_spelling", id, function(r){
									
									// get the modern and historical spelling from the marijke-spelling-record
									// and put this into the table, in the row in which the user
									// has given in a new id
									fn.updateDatabaseGivenANode(t, n, 
											["noor_modlem_wnt", "histlem_wnt", "pos_wnt", "pos_mnw"], 
											[ r["modern_lemma_final"], r["hist_lemma"], "", "" ], 
											true);
									});
								}	
							else
								{
								fn.removeProcessingMsg(t);
								fn.message("Let op", "Dit WNT-ID is onbekend");
								}
							
						});						
						
					});
					
				}
			},
			histlem_mnw:{
				"bgcolor": "#CEECF5"				
			},
			histlem_wnt:{
				"bgcolor": "#CEECF5"
			},
			noor_modlem_onw: {
				"editable": true
				//"visible": false
			},
			noor_modlem_vmnw: {
				"editable": true
				//"visible": false
			},
			noor_modlem_mnw:{
				"bgcolor": "#F3E2A9",
				"editable": true,
				"editcallback": function( t, n, value){
					fn.updateDatabaseGivenANode(t, n, ["aangepast"], [true], true);

				}
			},
			noor_modlem_wnt:{
				"bgcolor": "#F3E2A9",
				"editable": true,
				"editcallback": function( t, n, value){
					fn.updateDatabaseGivenANode(t, n, ["aangepast"], [true], true);
				}
			},
			pos_mnw:{
				
			},
			pos_wnt:{
				
			},
			wdb:{
				"button": "WDB",
				"cell_tooltip": "Open woordenboeken (+CTRL voor andere tab)",
				"click": function(t,n){	openBothWntAndMnw(t, n); }
			},
			unique_id:{
				"colsort": "asc", // sort #1
				"visible": false
			},
			verwijder: {
				"visible": false
			}
			
		},
		
		grouped_data: {
			
			spelling_klus_id: {
				"visible": false
			},
			modern_lemma_final: {
				"colsort": "asc"
			},
			spelling_klus_opmerking: {
				"visible": false
			},
			onw_id:{
				"click": function(t,n){
					
					var id = fn.getDataFromCellNode(t, n);
					window.open("http://gtb.inl.nl/iWDB/search?actie=article&wdb=ONW&id=ID"+id);
					
				}
			},
			vmnw_id:{
				"click": function(t,n){
					
					var id = fn.getDataFromCellNode(t, n);
					window.open("http://gtb.inl.nl/iWDB/search?actie=article&wdb=VMNW&id=ID"+id);
					
				}
			},
			mnw_id:{
				"click": function(t,n){
					
					var id = fn.getDataFromCellNode(t, n);
					window.open("http://gtb.inl.nl/iWDB/search?actie=article&wdb=MNW&id="+id);
					
				}
			},
			wnt_id:{
				"click": function(t,n){
					
					var id = fn.getDataFromCellNode(t, n);
					window.open("http://gtb.inl.nl/iWDB/search?actie=article&wdb=WNT&id="+id);
					
				}
			},
			gigmol_id:{
				"click": function(t,n){
					
					var id = fn.getDataFromCellNode(t, n);
					fn.callDatabaseInNewTab("lemmata_view", {"pkid": "^("+id+")$"}, {}, "gigant_molex");
					
				}
			}
			
		}

};


fn.callDatabase("mnw_wnt_differences", {}, function(){putSearchInterface();});






function search(){
	
	
	var idString = $('#id_query').val();
	var wordString = $('#word_query').val();
	var oldwordString = $('#oldword_query').val();
	
	if (wordString != '')
		{
		GetGTBlist(wordString, false);
		}
	else if (oldwordString != '')
		{
		GetGTBlist(oldwordString, true);
		}
	else if (idString != '')
		{
		OpenRightGTBpage(idString);
		}
}
	




	
// =======================================================================================
	
function cleanGTBwindow(){
	
	$("#id_query").val("");
	$("#word_query").val("");
	$("#oldword_query").val("");
	$("#list_of_senses").empty();
	OpenUrlInFrame("", "");
	
	// NB about emptying search fields #id_query & #word_query
	// that also helps preventing a new search from starting automatically, because e.g. when having to
	//  confirm replacement of an id in a cell, the enter-press event is caught too fast.
	
}



	

// =======================================================================================
	
// open an article in the GTB, given a dictionary and an article id
function OpenRightGTBpage(idString){
	
	var special_wdb = "";
	if (idString.match("^VMNWID"))
		{
		special_wdb = "VMNW";
		idString = idString.replace(/^VMNWID/, "ID");
		}
	else if (idString.match("^ONWID"))
		{
		special_wdb = "ONW";
		idString = idString.replace(/^ONWID/, "ID");
		}
	
	var wdb = idString.match("^[A-Z].+") ? ( idString.match("^ID") ? special_wdb : "WNT" ) : "MNW";
	
	var url = encodeURI("http://gtb.inl.nl/iWDB/search?actie=article&wdb="+wdb+"&id=" + idString);
	
	
	// get the right article
	if (idString != '-' && idString != '')
		{
		OpenUrlInFrame(url, wdb);
		}
	else
		{
		OpenUrlInFrame("", "");
		}
}


// opens a URL in a frame.
// It binds a (anti)scroll event to prevent scrolling
// of the screen when opening a URL in the frame, since
// some automatic scroll event in the frame can cause
// the whole page to scroll and not only the frame.
// We keep track of the time ellapsed since the last
// call of this function, so as to know when to UNBIND
// the (anti)scroll event.

var lastTimeFrameWasAddressed = new Date();
var timeToWaitBeforeUnbindingScrollEvent = 1000;


function OpenUrlInFrame(url, name){	
	
	if ( itsBeenAWhileSinceFrameWasAddressed() )
		$(this).bind('scroll', scrollEvent);

	lastTimeFrameWasAddressed = new Date();
	
	setTimeout("PutUrlInFrame('"+url+"', '"+name+"')",300);
}

function itsBeenAWhileSinceFrameWasAddressed(){
	
	return ( (new Date()-lastTimeFrameWasAddressed) > timeToWaitBeforeUnbindingScrollEvent);
}

function PutUrlInFrame(url, name){
	
	$("#gtb_windows").attr("src", url);
	$("#gtb_location").text( (name!='' ? "Wordt nu getoond: "+name : "") );
}

function scrollEvent() {
	//$('html').scrollTop(0); 
	//$('html').scrollLeft(0); 
}


//=======================================================================================

// look up the sense of a word in the GTB, given a dictionary (list) and a word
function GetGTBlist(wordString, isAnOldword){
	var url = "http://gtb.dev.inl.loc/ikea/rest/consult/search";
	
	$.ajax(
			{
				type: "GET",
				url: url,
				data: {
					"word": wordString, 
					"wdb": "ONW,VMNW,MNW,WNT", 
					"isold": isAnOldword,
					"dummy": getUniqueNumber()
					},
				dataType: "xml",
				contentType: "application/x-www-form-urlencoded;charset=UTF-8",
				success: function(xml) {ProcessGTBResponse(xml, wordString);},
				error: function(jqXHR, textStatus, errorThrown){alert("XML laden mislukt: "+textStatus+" "+errorThrown);}
			});
}

// process response from GTB after word search
function ProcessGTBResponse(xml, word){
	
	$("#list_of_senses").empty();
	$("#list_of_senses").append(
			$("<span></span>").text("Klik om te tonen")
			);
	OpenUrlInFrame("", "");
	
	// build select form for choosing a definition
	var formTagToAdd1 = $("<form></form>")
		.attr("action", "")
		.attr("id", "sense_form");
	var selectTagToAdd1 = $("<select></select>")
		.attr("id", "selected_sense")
		.attr("size", "10")
		.keyup(function(){showOption(this);})
		.click(function(){showOption(this);});
	
	// parse xml with definitions from GTB
	
	var nrOfResults = $(xml).find("results").length;
	
	if (nrOfResults == 0)
		{
		$("#id_query").val("-");
		OpenUrlInFrame("", "");
		}
	
	if (nrOfResults == 1)
		{
		var result = $(xml).find("results").slice(0,1);
		var wdbIdAndLemma = result.find("id").text();
		var wdb = wdbIdAndLemma.split(",")[0];
		var id = wdbIdAndLemma.split(",")[1];		
		
		$("#id_query").val(id);
		OpenUrlInFrame("http://gtb.inl.nl/iWDB/search?actie=article&wdb="+wdb+"&id="+id+"&lemmodern="+word, wdb);
		
		}


	// if there are more definitions, show no definition in gtb preview by default
	if (nrOfResults > 1)
		{
		OpenUrlInFrame("", "");
		}
	
	// build the selection list
	
	$(xml).find("results").each(function(){
		
		var wdbIdAndLemma = $(this).find("id").text();
		var wdb = wdbIdAndLemma.split(",")[0];
		var id = wdbIdAndLemma.split(",")[1];
		var modLemma = wdbIdAndLemma.split(",")[2];
		var sense = removeTags($(this).find("sense").text()).substring(0,60)+"...";
		
		selectTagToAdd1.append(
				$("<option></option>")
					.attr("value", id+","+wdb+","+modLemma+",http://gtb.inl.nl/iWDB/search?actie=article&wdb="+wdb+"&id="+id+"&lemmodern="+word)
					.text(sense)
					.css("width", $("#list_of_senses").css("width"))
		);
	});
	
	
	formTagToAdd1.append(selectTagToAdd1);
	
	$("#list_of_senses").append(formTagToAdd1);
	
	// focus on first option of select list
	$("#selected_sense").focus();	
	$("#selected_sense").val($("#selected_sense option:first").val());
	
	showOption($("#selected_sense"));



}

// callback function for keyup- en click-events on senses options 
// when surfing the list of senses of a word, change the GTB window immediately
// (that is: show the article straight away)
function showOption(node){
	
	var optionValue = $(node).find(":selected").val().split(",");
	$("#id_query").val(optionValue[0]);
	$("#word_query").val(optionValue[2]);
	OpenUrlInFrame(optionValue[3], optionValue[1]);
	
	}

//=======================================================================================

