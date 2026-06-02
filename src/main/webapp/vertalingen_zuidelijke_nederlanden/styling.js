
// -----------------------------------------------------

// app name and version

var sAppName = "Banko di Palabra";
var sAppVersion = "1.0"; 

var sAppManualFileName = "LAnCeLoT_manual_0.9.pdf";

// -----------------------------------------------------

// get http params
var params = getHttpParams();

// debug mode?
var bDebug = false;

// Compulsary Lex'it variables:
// list of tables that must be hidden or visible (don't use both, it's a matter of what's the most convenient)
oHiddenTablesList = [];


// default values of globals
var sApplicationName = "Database vertalingen zuidelijke Nederlanden"; // beware: without capital is the right name


// search mode: corpus or lexicon
// (and label and colors associated with chosen mode)
var aSearchIn = { "lemmata": "corpus", "wordforms": "corpus" };
var sActiveSearchTable = "wordforms";


// roles (variables allow other labels in futur)
var sOwnerRole = 'Owner';
var sContributorRole = 'Contributor';
var sViewerRole = 'Viewer';


// current user's role
var sUserRole = sViewerRole; // default


// instances URLs
var uLexitInstanceUrl = document.URL;
if (uLexitInstanceUrl.indexOf("?"))
	uLexitInstanceUrl = uLexitInstanceUrl.substring(0, uLexitInstanceUrl.indexOf("?"));
if (uLexitInstanceUrl.lastIndexOf("/") != uLexitInstanceUrl.length-1)
	uLexitInstanceUrl += "/";
var uCobaltInstanceUrl = uLexitInstanceUrl.replace("/lexit2/", "/CobaltServe/");


// the project name 
var sProjectName = params.get("proj");

// the corpus URL
var sBlackLabCorpusURL;	// this will be read from the database

// separator (CONSTANTS)
var sAnalysesSeparator = " | ";
var sLemAndPosSeparator = ", ";
var sOnsetOffsetSeparator = "|";
var sAnnotationsSeparator = "|";
var sWordIndexesSeparator = "|";
var sDocPidSeparator = "|";
var sCorpusInfoSeparator = ":::";
var sQuoteInsertionSeparator = "##";


// set language
lang.setLanguage("en");

// set project font
var sProjectFonts = "Verdana, sans-serif, gtb";
var sProjectFontBigSize = "12pt";
var sProjectFontNormalSize = "10pt";
var sProjectFontSmallSize = "9pt";

fn.addCss("#tablechoice", "{margin-left: 10em; background-color: pink}")

fn.addCss("div.table_div", "{top: 100px; background-color: pink}"); // hier luistert ie niet naar
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
var sCobaltSpecialDarkerGreen = shadeColor("#EFFBEF", -20);
var sCobaltOrange = "#FF8000";
var sCobaltRed = "#E8503D";
var sCobaltWhite = "#FFFFFF";
var sCobaltDarkGrey = "#E6E6E6";
var sCobaltGrey = "#F3F3F3";

var sCobaltEvenRowSelected = "#CCE7FF";
var sCobaltOddRowSelected =  "#CCE7FF";
var sCobaltEvenRowHover = "#d7ecff";
var sCobaltOddRowHover = "#d7ecff";


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


// tables rows

//fn.addCss("#worktable_wrapper table.display.dataTable tbody tr.odd {"+
//	"background-color: #E5E6E5 !important;"+
//"}");

fn.addCss("table.display tr.even.selected td { "+
"	background-color: "+sCobaltEvenRowSelected+" !important; "+
"}");
fn.addCss("table.display tr.odd.selected td { "+
"	background-color: "+sCobaltOddRowSelected+" !important; "+
"}");

fn.addCss("table.display tr.even:hover td { "+
"	background-color: "+sCobaltEvenRowHover+" !important; "+
"}");
fn.addCss("table.display tr.odd:hover td { "+
"	background-color: "+sCobaltOddRowHover+" !important; "+
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

fn.addCss("#users_management_dialog {display: flex; flex-direction: column; width: auto; height: 300px}");

fn.addCss("#users_management_dialog #add_user_box {padding: 5px;}");
fn.addCss("#users_management_dialog #users_with_access_label {font-weight: bold;}");
fn.addCss("#users_management_dialog #users_with_access {height: 250px; overflow-x: hidden; overflow-y: scroll}");

fn.addCss("#users_management_dialog #users_roles_table {min-width: 310px; overflow: hidden;}")
fn.addCss("#users_management_dialog #users_roles_table tr td.username_column {min-width: 180px; word-wrap: break-word;}");
fn.addCss("#users_management_dialog #users_roles_table tr td.cross_column {width: 20px; padding-right: 10px;}");
fn.addCss("#users_management_dialog #users_roles_table tr.new_user {background-color:"+ sCobaltSoftGreen+";}")

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
/*
		.append(
			$("<span></span>")
				.addClass("header_balk_button")
				.attr("id", "header_projects_button")			
				.text("Projects")
				.click(function(){menus.reloadApplication();})
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
				.text( fn.getCurrentUser() )
				.css("cursor", "auto")				
		)
		*/
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

var setLogo = true
var logo = (document.URL.indexOf("localhost")<0 ? "../lexit2_config/vertalingen_zuidelijke_nederlanden/logo.jpg": "logo.jpg");

if (setLogo) {
$("#square_logo").css("position", "static").css("height", "100%").css("border", "none").css("margin", "2px")
{
	const image_style = "height:65px; position: absolute; left: -1px; top: -1px;";
	const image_src = logo; 
	$("#square_logo.huisstijl").html(`<img style="${image_style}" src="${image_src}"/>`);
}
}
// the image is a bit wide, so move the titles
$("#projectname").css("left", "149px");
$("#home_logo").css("left", "140px");


$("#page #headergroup #home_logo").css("cursor", "pointer").click(function(){
	window.open("https://ivdnt.org");
});
$("#page #headergroup #projectname").css("cursor", "pointer").click(function(){
	reloadApplication();
});
$("#page #headergroup #square_logo").css("cursor", "pointer").click(function(){
	reloadApplication();
});

$(".table_div").css("border-radius", "0px");
$(".top").css("border-radius", "0px");

fn.addCss(".title1:hover { text-decoration : underline !important }");
fn.addCss(".title2:hover { text-decoration : underline !important }");
fn.addCss(".TitleShort:hover { text-decoration : underline !important }");


fn.addCss(".title1 { font-style: italic }");
fn.addCss(".title2 { font-style: italic }");
fn.addCss(".TitleShort { font-style: italic }");


fn.addCss("#Book_tableclosebutton { display: none !important }");
fn.addCss("#tablechoice { display: none !important }");

