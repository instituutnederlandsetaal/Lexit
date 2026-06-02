
// -----------------------------------------------------

//default values of globals
var sAppName = "LAnCeLoT";
var sApplicationName = "lancelot"; // beware: without capital is the right name

// set language
lang.setLanguage("en");

// set project font
var sProjectFonts = "Verdana, sans-serif, gtb";
var sProjectFontBigSize = "12pt";
var sProjectFontNormalSize = "10pt";
var sProjectFontSmallSize = "9pt";

// table headers
fn.addCss("table.display.dataTable thead th {font-family: "+sProjectFonts+" !important; font-size: "+sProjectFontNormalSize+" !important;}");
// row groups
fn.addCss("table.display.dataTable tbody tr.group {font-family: "+sProjectFonts+" !important; font-size: "+sProjectFontNormalSize+" !important;}");
// header
fn.addCss("div.top div:first-child span {font-family: "+sProjectFonts+" !important; font-size: "+sProjectFontNormalSize+" !important;}");
fn.addCss(".dataTables_length {font-family: "+sProjectFonts+" !important; font-size: "+sProjectFontNormalSize+" !important;}");
fn.addCss(".dataTables_info {font-family: "+sProjectFonts+" !important; font-size: "+sProjectFontSmallSize+" !important;}");
fn.addCss(".dataTables_filter > label {font-family: "+sProjectFonts+" !important; font-size: "+sProjectFontNormalSize+" !important;}");
fn.addCss("a.paginate_button {font-family: "+sProjectFonts+" !important; font-size: "+sProjectFontNormalSize+" !important;}");
// tooltips
fn.addCss("#tiptip_content {font-family: "+sProjectFonts+" !important; font-size: "+sProjectFontNormalSize+" !important;}");

// project font class for column config
fn.addCss(".projectfont {font-family: "+sProjectFonts+ " !important; font-size: "+sProjectFontNormalSize+" !important}");

// hide export buttons
fn.addCss(".export_pane {display: none !important;}");


// ******************* colors definition *******************

var sCobaltBlack = "#000000";
var sCobaltDarkBlue = "#1692FF";
var sCobaltBlue = "#50ADFF";
var sCobaltLightBlue = "#62B6FF";
var sCobaltLighterBlue = "#95CEFF";
var sCobaltSoftBlue = "#D3E3FD";
var sCobaltSofterBlue = "#edf4fe";
var sCobaltGreen = "#89C24B";
var sCobaltSoftGreen = "#d0e7b7";
var sCobaltSpecialGreen = "#EFFBEF";
var sCobaltOrange = "#FF8000";
var sCobaltRed = "#E8503D";
var sCobaltWhite = "#FFFFFF";
var sCobaltGrey = "#F3F3F3";


fn.addCss(".cobaltbalkcolor {background-color: "+sCobaltBlue+" !important;}}");
fn.addCss(".cobaltblack {background-color: "+sCobaltBlack+" !important; color: #000000;}");
fn.addCss(".cobaltdarkblue {background-color: "+sCobaltDarkBlue+" !important; color: #000000;}");
fn.addCss(".cobaltblue {background-color: "+sCobaltBlue+" !important; color: #000000;}");
fn.addCss(".cobaltlightblue {background-color: "+sCobaltLightBlue+" !important; color: #000000;}");
fn.addCss(".cobaltlighterblue {background-color: "+sCobaltLighterBlue+" !important; color: #000000;}");

fn.addCss(".cobaltgreen {background-color: "+sCobaltGreen+" !important; color: #000000;}");
fn.addCss(".cobaltorange {background-color: "+sCobaltOrange+" !important; color: #000000;}");
fn.addCss(".cobaltred {background-color: "+sCobaltRed+" !important; color: #000000;}");
fn.addCss(".cobaltwhite {background-color: "+sCobaltWhite+" !important; color: #000000;}");



fn.addCss(".cobaltbutton {"+
	"font-family: Verdana,Arial,sans-serif; color: "+sCobaltWhite+"; border: 0 !important; padding: 4px; padding-left: 10px; padding-right: 10px;"+
	"border-top-left-radius: 0px; "+
	"border-top-right-radius: 0px; "+
	"border-bottom-left-radius: 0px; "+
	"border-bottom-right-radius: 0px; "+
"}");

fn.addCss(".cobaltbutton:hover {"+
	"font-family: Verdana,Arial,sans-serif; color: "+sCobaltSoftBlue+" !important; border: 0 !important; padding: 4px; padding-left: 10px; padding-right: 10px;"+
	"border-top-left-radius: 0px; "+
	"border-top-right-radius: 0px; "+
	"border-bottom-left-radius: 0px; "+
	"border-bottom-right-radius: 0px; "+
	"cursor: pointer; "+
"}");

fn.addCss(".loginbutton {"+
	"display: inline-block; "+
	"border: none; "+
	"background-color: "+sCobaltDarkBlue+"; "+
	"padding: 10px; "+
	"font-family: Verdana,Arial,sans-serif; color: "+sCobaltWhite+"; "+
	"border-top-left-radius: 0px; "+
	"border-top-right-radius: 0px; "+
	"border-bottom-left-radius: 0px; "+
	"border-bottom-right-radius: 0px; "+
"}");


// set header style

fn.addCss("#headergroup.cobaltstijl {"+
	"width: 100%; "+
	"height: 65px; "+
	"margin: 0px; "+
	"padding: 0px; "+
	"border-bottom: 1px black solid; "+ 
	"-webkit-box-shadow: 0 5px 5px "+sCobaltDarkBlue+"; "+ 
	"-moz-box-shadow: 0 5px 5px "+sCobaltDarkBlue+"; "+
	"box-shadow: 0px 4px 5px 1px "+sCobaltDarkBlue+"; "+
"}");


// paging style

fn.addCss(".paging_full_numbers a.current {"+
	"background-color: "+sCobaltLightBlue+";"+
"}");
fn.addCss(".paging_full_numbers a.paginate_button:hover {"+
	"background-color: "+sCobaltDarkBlue+";"+
	"text-decoration: none !important;"+
"}");





// customizing default lex'it header

fn.addCss(".top {"+
	"position: relative; "+
	"padding: 2px; "+ // very small padding, but not too small
	"background-color: #F5F5F5; "+
	"border: 1px solid #CCCCCC; "+
	"border-top-left-radius: 15px; "+
	"border-top-right-radius: 15px; "+
"}");

fn.addCss(".dataTables_filter {"+
	"position: sticky;  /* fixed position in the top right corner */"+
	"width: 43vw;"+
	"top: 5px;"+
	"left: 52vw;"+
	"text-align: right;"+	
"}");


// scrollbar

fn.addCss("::-webkit-scrollbar {"+
	"width: 10px;"+
	"cursor: context-menu;"+ // arrow
"}");
fn.addCss("::-webkit-scrollbar-track {"+
	"box-shadow: inset 0 0 5px grey; "+
	"border-radius: 10px;"+
"}");
fn.addCss("::-webkit-scrollbar-thumb {"+
	"background: #848484;"+
	"border-radius: 5px;"+
"}");
fn.addCss("::-webkit-scrollbar-thumb:hover {"+
	"background: "+sCobaltBlack+";"+
	"border-radius: 5px;"+
	"cursor: context-menu;"+ // arrow
"}");


// user management dialog 

fn.addCss("#users_management_dialog {display: flex; flex-direction: column; width: 300px; height: 300px}");

fn.addCss("#users_management_dialog #add_user_box {padding: 5px;}");
fn.addCss("#users_management_dialog #users_with_access_label {font-weight: bold;}");
fn.addCss("#users_management_dialog #users_with_access {height: 250px; overflow-x: hidden; overflow-y: scroll}");

fn.addCss("#users_management_dialog #users_roles_table {width: 300px; overflow: hidden;}")

fn.addCss(".ui-menu-item {font-weight: bold !important; background-color: "+sCobaltSoftGreen+" !important;}");
fn.addCss(".ui-menu-item div.ui-state-active {font-weight: bold !important; background-color: "+sCobaltGreen+" !important;}");


// set balk and background colors

fn.addCss("#headergroup #headerbalk {"+
	"color: black;"+
	"background-color:"+ sCobaltBlue+";"+
	"padding-left: 45px;"+
	"display: flex;"+
	"justify-content: flex-start;"+
	"align-items: center; "+
	"-webkit-box-shadow: 0 3px 3px #888888;"+
	"-moz-box-shadow: 0 3px 3px #888888;"+
	"box-shadow: 0px 3px 3px 1px #888888;"+
	"height: 50px;"+
"}");

fn.addCss("#headergroup #headerbalk .header_balk_button {"+
	"padding-left: 20px;"+
	"padding-right: 20px;"+
	"padding-top: 15px;"+
	"padding-bottom: 15px;"+
	"cursor: pointer;"+
"}");
fn.addCss("#headergroup #headerbalk .header_balk_button:hover {"+
	"background-color:"+sCobaltDarkBlue+";"+
"}");

$("#headergroup")
	.css("background-color", sCobaltWhite+" !important");
	
$("#headergroup").append(
	$("<div></div>")
		.attr("id", "headerbalk")
		.append(
			$("<span></span>")
				.addClass("header_balk_button")
				.attr("id", "header_projects_button")			
				.text("Projects")
				.css("color", sCobaltSoftBlue)    // show it's disabled at this moment
		)
		.append(
			$("<span></span>")
				.addClass("header_balk_button")
				.attr("id", "header_lancelotsearch_button")			
				.text("LAnCeLoT Search")
				.click(function(){
					window.open("/lancelot/search/");
				})
		)
		.append(
			$("<span></span>")
				.addClass("header_balk_button")
				.attr("id", "header_username_button")
				.text( "USER" )
				.click(function(){
					fn.startLexitLogin();
				})
		)
);


fn.addCss("body.huisstijl {"+
	"font-family: Verdana, sans-serif, gtb; "+
	"margin: 0px; "+
	"background-color: "+sCobaltGrey+" !important; "+
"}");
fn.setBalk(true);


// show application name

fn.setProjectTitle(sApplicationName, "#000000");
$("#projectname").find("span").css('font-family', 'Schoolboek,Helvetica,sans-serif');


// metadata grouping style

fn.addCss("table.display tr.group td {"+
	"color: "+sCobaltBlack+" !important;"+
	"background-color: #c6d0e2 !important;"+
"}");
fn.addCss("table.display tr.group td a {"+
	"color: "+sCobaltBlack+" !important;"+
	"background-color: #c6d0e2 !important;"+
"}");


// set the app logo

$("#square_logo").css("position", "static").css("height", "100%").css("border", "none")
{
	const image_style = "height:75px; position: absolute; left: -1px; top: -1px;";
	const image_src = (document.URL.indexOf("localhost")<0 ? "../lexit2_config/"+sApplicationName.toLowerCase()+"/" : "") + "galahad.png";
	$("#square_logo.huisstijl").html(`<img style="${image_style}" src="${image_src}"/>`);
}
// the image is a bit wide, so move the titles
$("#projectname").css("left", "149px");
$("#home_logo").css("left", "140px");

$("#page #headergroup #home_logo").css("cursor", "pointer").click(function(){
	window.open("https://ivdnt.org");
});
$("#page #headergroup #projectname").css("cursor", "pointer");
$("#page #headergroup #square_logo").css("cursor", "pointer");


function showMessageBeforeLogin(sTitle, sMessage, fnFunction, bOkButton){
	
	var sP = $("<p></p>").html(sMessage);
	var dialogDivId = "dialog-message"+getUniqueNumber();
	var sDiv = $("<div></div>").attr("id", dialogDivId).attr("title", sTitle).append(sP);
	
	$(document.body).append(sDiv);
	
	var aButtons = [];
	if (bOkButton != false){
		aButtons.push({			
		        	  text: lang.ok,
					  class: "cobaltgreen cobaltbutton",
		        	  click: function() {
						$( this ).dialog( "close" );
						
						if (fnFunction != null) {
							fnFunction();
						}
		        	  },
		        	  id: 'dialog_accept_button'
		          });
	}
	
	$( "#"+dialogDivId ).dialog({
		modal: false,
		width: "auto",
		open: function(event, ui){
			// remove close button (cancel is enough)
			$(".ui-dialog-titlebar-close").hide();
			// add shadows
			$(".ui-dialog").addClass("ui-dialog-shadow");
        	$( this ).closest(".ui-dialog").putInFront();

			$(".ui-dialog-titlebar").addClass("cobaltbalkcolor").css("color", "#FFFFFF");
		},
		close: function(event, ui){
			$( this ).remove();
		},
		position: fn._computeDialogPosition(),
		buttons: aButtons
	});
	
	if (!bOkButton)
		fn._activeEnterForThisDialog(dialogDivId);
};

var sTextOpeningScreen = 
	"Welcome to LAnCeLoT, an online tool (service) to manually verify and correct<BR>"+
	"corpora that are linguistically annotated with part of speech and lemma. <BR>"+
	"Lancelot is meant to help you clean the linguistic annotations of your corpus,<BR>"+
	"hence the name Linguistic Annotation Corpus Laundry Tool. <BR>"+
	"LAnCeLoT offers both an environment to query your corpus (LAnCeLoT Search)<BR>"+
	"and a place to inspect and correct the annotations. To use LAnCeLoT, <BR>"+
	"you have to start a project. "+
	"<BR><BR>"+
	"LAnCeLoT was designed in combination with GaLAHaD (Generating Linguistic<BR>"+
	"Annotations for Historical Dutch), an environment where you can linguistically<BR>"+
	"annotate diachronic corpus material and evaluate the linguistic annotations. There<BR>"+
	"are several tagger/lemmatizers to choose from, and your corpus can be<BR>"+
	"exported in several formats."+
	"<BR><BR>"+
	"For now, LAnCeLoT handles TEI encoded documents only, the format of which is<BR>"+
	"described here. If you use GaLAHaD for the linguistic annotation of your <BR>"+
	"corpus, simply choose TEI as export format. For people who want to run LAnCeLoT<BR>"+
	"on their own systems, the open source code will be made available on GitHub."+
	"<BR><BR><BR>"+
	"<center><button onclick='fn.startLexitLogin();' class='loginbutton'>Login</button></center>"+
	"<BR>";
	


$(document).ready(function(){
	

	setTimeout(function(){
		showMessageBeforeLogin("Welcome", sTextOpeningScreen, null, false);
		
		// set favicon and title
		$("#favicon").attr("href","lancelot_favicon.ico");
		$('head title', window.parent.document).text(sAppName);
		
		setTimeout(function(){
			$("div#headerlinks").find("span#help_link")
				.off("click");
			$("div#headerlinks").find("span#help_link")
				.click(function(){
					// do nothing as long as the user is not logged in
				});
			}, 500); 
			
		$("div#headerlinks").find("span#about_link")
			.click(function(){
				// do nothing as long as the user is not logged in
			});
		$("div#headerlinks").find("span#contribute_link").text("GaLAHaD")
			.click(function(){
				window.open("https://portal.clarin.ivdnt.org/galahad");
			});
			
	}, 100);
	
	

});
