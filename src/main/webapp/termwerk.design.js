
// Set the special balk 

fn.setBalk(true);


$("#square_logo").append(
	$("<img>").attr("src", "taalunie_logo_cmyk.jpg").css("height", "60px").css("position", "relative")
);

$("#page").append(
	$("<div></div>")
		.attr("id", "border_and_buttons_div")
);	


$("#headerlinks #about_link").text("Over TermWerk");



// change contribute link into user icon

$("#headerlinks #contribute_link").prependTo('#headerlinks');

$("#headerlinks #contribute_link").html(`
			<svg
			  width="24"
			  height="24"
			  viewBox="0 0 24 24"
			  fill="none"
			  xmlns="http://www.w3.org/2000/svg"
			>
			  <path
			    fill-rule="evenodd"
			    clip-rule="evenodd"
			    d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7ZM14 7C14 8.10457 13.1046 9 12 9C10.8954 9 10 8.10457 10 7C10 5.89543 10.8954 5 12 5C13.1046 5 14 5.89543 14 7Z"
			    fill="currentColor"
			  />
			  <path
			    d="M16 15C16 14.4477 15.5523 14 15 14H9C8.44772 14 8 14.4477 8 15V21H6V15C6 13.3431 7.34315 12 9 12H15C16.6569 12 18 13.3431 18 15V21H16V15Z"
			    fill="currentColor"
			  />
			</svg>
`)
.css("position", "relative")
.css("top", "3px");



fn.addCss(`

	/* prevent accidental text selection on links */

	a, span {
		user-select: none;
    	-webkit-user-select: none; /* Safari */
    	-ms-user-select: none; /* IE 10+ */
	}


	/* table style in pop up about TwAPI of TermeServe operation status */
	table.status_info {
		margin: 10px;
	}

	span.tooltip_intens {
		font-weight: bold;
		color: #359FF0;
	}
	
	/* custom color for the autocomplete select */
	
	.ui-menu .ui-menu-item-wrapper.ui-state-active {
	    background-color: #359FF0 !important;
	    color: white !important;
	}



	/* get rid of round corners of tables */
	
	.top {
		border-top-left-radius: 0 !important;
		border-top-right-radius: 0 !important;
	}
	.table_div {
		border-top-left-radius: 0 !important;
		border-top-right-radius: 0 !important;
		border-bottom-left-radius: 0 !important;
		border-bottom-right-radius: 0 !important;
	}
	
	/* relocate table close button and table name */
	
	.tableclosebutton {
		position: relative;
		left: 6px !important;
		top: -3px  !important;
		margin-right: 10px;		
	}
	.tableclosebutton button {
		-webkit-border-radius: 4px !important;
		-moz-border-radius: 4px !important;
		border-radius: 4px !important;
	}
	.table_name {
		position: relative;
		left: 4px !important;
		top: 6px !important;
	} 


    /***********************************************
	 ** dialogs
	 ***********************************************/

	/* change default colors */
	
	.ui-widget-header {
		background: #359FF0 !important;
		color: white !important;
	}



	/*********************************************** 
	 ** page header in top balk 
	 ***********************************************/
	
	
	#indicators #tablechoice {
		display: none;
		/*
		position: absolute;
		top: 100px !important;
		right: 30px !important;
		*/
	}
	
	#headergroup {
		height: 70px;
		border-bottom: none !important;
		-webkit-box-shadow: none !important;
		box-shadow: none !important;
	}
	
	#headerlinks {
		position: absolute;
		top: 30px !important;
		text-transform: lowercase;
	}
	
	#headerlinks.huisstijl span {
	    padding-left: 40px;
	    padding-right: 0 !important;
	    font-size: 22px;		
	}
	
	/* prevent default underline on hover at contribute_link */
	#headerlinks span#contribute_link:hover {
		text-decoration: none;
	}
	#headerlinks span#contribute_link svg {
		border: 1px #ffffff solid;
	}
	#headerlinks span#contribute_link:hover svg {
		border: 1px black solid;
	}
	
	
	#border_and_buttons_div {
		position: absolute;
		top: 80px;
		background-color: #359FF0;
		height: 60px;
		width: 100%;
		
	}
	
	#home_logo {		
		left: 110px !important;
	}
	#square_logo {
		border: 0 !important;
	}
	#square_logo img {
		border-right: 1px dotted #000000 !important;
	}
	
	#projectname.huisstijl {
		top: 30px !important;
		left: 120px !important;
	}
	
	#projectname.huisstijl span {
		color: #000000 !important;
		text-transform: lowercase;
	}
	
	
	
	/*********************************************** 
	 ** top balk 
	 ***********************************************/	
	
	
	/* project label */	
	
	#border_and_buttons_div #current_project_div {		
		position: absolute;
		top: 11px;
		left: 220px;		
		height: 38px;
		width: 430px;		
		display: flex;
		justify-content: center;
		align-items: center;
		cursor: pointer;	
	}	
	#border_and_buttons_div #current_project_div span {
		font-size: 20px;		
		font-weight: bold;
		color: white;		
	}
	#border_and_buttons_div #current_project_div.active {
		border: 2px solid #1188E4;
	}
	#border_and_buttons_div #current_project_div.active:hover {
		border: 1px solid white;
	}
	
	
	
	
	/* button */
	
	div#page div.termwerk_balk_buttons {
		background-color: #0070C0;
		border: 2px solid #359FF0;
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 40px; 
		width: 140px;
		cursor: pointer;
	}
	div#page div.termwerk_balk_buttons span {
		color: white;
		font-size: 15px;
		text-decoration: none;
		cursor: pointer;
	}
	
	div#page div.termwerk_balk_buttons:hover {
		background-color: #F5F5F5 !important;
		border: 2px solid #0070C0;
	}
	div#page div.termwerk_balk_buttons:hover span {
		color: #0070C0;
	}
	
	
	div#page div.termwerk_balk_buttons.active {
		background-color: white !important; 
	}
	div#page div.termwerk_balk_buttons.active span {
		color: #0070C0 !important;
	}
	
	div#page div.termwerk_balk_buttons.active:hover {
		background-color: #F5F5F5 !important;
		border: 2px solid #0070C0; 
	}
	div#page div.termwerk_balk_buttons.active:hover span {
		color: #0070C0 !important;
	}
	
		
	div#page div.termwerk_balk_buttons span.disabled {
		color: #bebebe !important; 
	}
	
	
	
	
	#border_and_buttons_div #my_projects_div {
		position: absolute;
		top: 10px;
		left: 20px;
		height: 25px;
	}
	
	#border_and_buttons_div #my_corpora_div {
		position: absolute;
		top: 10px;
		right: 420px;
		height: 25px;
	}	
	#border_and_buttons_div #my_termlists_div {
		position: absolute;
		top: 10px;
		right: 240px;
		height: 25px;
	}	
	#border_and_buttons_div #my_termbank_div {
		position: absolute;
		top: 10px;
		right: 60px;
		height: 25px;
	}
	
	
	/***********************************************	
	/* termbank panel */
	
	
	div#page div.termbank_buttons_panel {
		
		border: 2px solid #595959;
		border-radius: 12px;
		background-color: #EEEEEE;
		height: 70px;
		width: 560px;
		display: flex;
		flex-direction: row;		
		justify-content: space-around;
		align-items: center;
	}
	
	div#page div#termbank_panel_message {
		
		position: absolute;
		left: 50px;
		top: 180px;
		font-family: Verdana, sans-serif, gtb;
		font-weight: bold;
	}
	
	div#page div.termbank_buttons_panel {
		position: absolute;
		left: 45px;
		top: 220px;
	}
	
	div#page div.termbank_buttons_panel button {
		
		height: 30px;
		border: none;
        background-color: #0070C0;
        color: white;
        padding: 5px 32px;
        text-align: center;
        text-decoration: none;
        display: inline-block;
        font-size: 16px;
        border-radius: 5px;
        cursor: pointer;
        
	}


    
    /*********************************************** 
	 ** tables 
	 ***********************************************/
	
	/*
	.dataTables_paginate.paging_full_numbers {
		position: relative;
		top: -15px;
	}
	*/
	
	/* special border style for the large Termbank tables */
	
    table.display.largetermbank {
		border-collapse: collapse;
	}
    
    
    table.display.largetermbank td:not(:has(button)) {		
		border: 1px solid #0070C0;
	}
    
    
    
    /* table footer  */
    
    /* prevent large paging pane to break up into two lines */
    div.dataTables_wrapper div.bottom_pane div.dataTables_paginate.paging_full_numbers {
		width: 40vw !important;
    	left: 55vw !important;
	}
	
	
    
    /* table header */
    
    /* modify some Lex'it defaults to allow buttons to be position in a central div */
    
    .dataTables_paginate.paging_full_numbers {
		width: 25vw !important;
   		left: 70vw  !important;
	}
	.dataTables_filter {
		width: 25vw !important;
   		left: 70vw  !important;
	}
	
	/* special case */
	#termbank_termvormen_wrapper .dataTables_paginate.paging_full_numbers {
		width: 25vw !important;
   		left: 35vw  !important;
   		top: 10px !important;
	}
	
    
    /* table header buttons */
    
    div.table_header_button_div {		
    	position: absolute;
    	top: 20px;
    	left: 25vw;
    	width: 36vw;	/* width adapted to screen width = bit more than the room taken by 3 buttons in width */
    	min-width: 600px;    /* width lower this size, the buttons will be misplaced */
    	height: 70px;
    	display: flex;
    	flex-direction: row;
    	flex-wrap: nowrap; /* prevents the flex items from wrapping to the next line */
    	justify-content: space-between;
	}
    
    button.table_header_button {				
		border-radius: 6px;
		background-color: #0070C0 !important;
		color: white  !important;
		padding: 5px 32px;
		font-family: Verdana, sans-serif;
		font-weight: bold;
		font-size: 12px;
		width: 195px;    /* button width adapted to screen width */
		height: 28px;	
		cursor: pointer !important;
	}
	button.table_header_button_empty {
		width: 11vw;    /* button width adapted to screen width */
		height: 28px;
		opacity: 1;
	}
	
	button.table_header_button.lighter {
		background-color: #359FF0 !important;
	}
	
	button.table_header_button.danger {
		background-color: #DA0012 !important;
	}
	
	
	/* suppress padding for long words to fit in the button */
	
	button.table_header_button.nopadding { 
		padding: 5px 0px !important;
	}
	
	button.table_header_button.smaller1 {
		width: 150px !important;
	}
	button.table_header_button.smaller2 {
		width: 100px !important;
	}
	button.table_header_button.smaller3 {
		width: 50px !important;
	}
	
	button.table_header_button.bitlarger1 {
		width: 215px !important;
	}
	button.table_header_button.bitlarger2 {
		width: 235px !important;
	}
	button.table_header_button.bitlarger3 {
		width: 255px !important;
	}
	
	button.table_header_button.verylarge {
		width: 325px !important;
	}
	button.table_header_button.high {
		height: 40px !important;
	}
	
	button.table_header_button.invisible {
		opacity: 0;
		cursor: default !important;		
	}
	
	
	/* in case we want more buttons side to side */
	
	/*
	button.table_header_button.half {
		position: absolute;
		left: -330px;
	}
	button.table_header_button.one {
		position: absolute;
		left: -220px;
	}
	button.table_header_button.oneandhalf {
		position: absolute;
		left: -110px;
	}
	button.table_header_button.two {
		position: absolute;
		left: 0px;
	}
	button.table_header_button.twoandhalf {
		position: absolute;
		left: 110px;
	}
	button.table_header_button.three {
		position: absolute;
		left: 220px;
	}
	button.table_header_button.threeandhalf {
		position: absolute;
		left: 330px;
	}
	button.table_header_button.four {
		position: absolute;
		left: 440px;
	}
	button.table_header_button.nextrow {
		position: absolute;
		top: 50px;
	}
	*/
	
	
	
	

	
    
    /* column headers */
    
    div.dataTables_scrollHead table.display.dataTable thead tr {
		height: 50px; 
		background-color: #359FF0;
		font-size: 16px;
	}
	
	.formview_list div.dataTables_scrollHead table.display.dataTable thead tr {
		height: 35px !important;
		font-size: 14px !important;
	}
    
    
    /* buttons in rows */    
    
    td.cell_button button {
		  background-color: #0070C0;
		  border: none;
		  color: white;
		  padding: 5px 32px;
		  text-align: center;
		  text-decoration: none;
		  display: inline-block;
		  font-family: Verdana, sans-serif;
		  font-size: 12px;
		  border-radius: 6px;
	}
	
	
	/***********************************************
	 ** file upload
	 ***********************************************/
	
	input#fileChooser,
	input#uploadname {
		
		height: 26px !important;
		border: none;
        background-color: #EEEEEE;
        color: black;
        width: 300px;
        
        text-decoration: none;        
        display: flex;
        flex-direction: row;
        align-items: center;
        
        font-family: Verdana, sans-serif;
        font-size: 12px;
        border-radius: 5px;
        cursor: pointer;
	}
	
	input#fileChooser {
		padding-left: 3px;
		padding-top: 5px;
	}
	
	span.server_response {
		color: red;
		font-style: italic;
	}
	div.upload_info {
		border: none;
        background-color: #EEEEEE;
        color: black;
        min-width: 400px;
        font-family: Verdana, sans-serif;
        font-size: 12px;
        border-radius: 5px;
        padding: 5px;
	}
	div.upload_info table {
		border: 1px black solid;
		border-spacing: 0;
	}
	div.upload_info table td {
		border: 1px black dotted;
		padding-right: 5px;
		padding-left: 5px;
	}
	div.upload_info span.column_info {
		font-size: 11px;
		color: red;
		font-style: italic;
	}
	
	button#upload_start_button,
	button#upload_cancel_button {
		background-color: #0070C0;
		border: none;
		color: white;
		padding: 5px 32px;
		text-align: center;
		text-decoration: none;
		display: inline-block;
		font-family: Verdana, sans-serif;
		font-size: 12px;
		border-radius: 6px;
	}
	
	
	
	/***********************************************
	 ** Fields selector 
	 ***********************************************/
	
	
	#fieldsselector {
		width: 650px;
		height: 500px; 
		display: flex;
        flex-direction: row;
	}
	#fieldsselector.single {
		height: 320px !important;
	}
	
	#fieldsselector .leftside,
	#fieldsselector .rightside {
		border: 1px dotted #000000;
		width: 300px;
		height: 100px;
		overflow-y: scroll;
		overflow-x: hidden;
		cursor: pointer;
		flex: 1;
    }
    
    #fieldsselector.single .leftside,
	#fieldsselector.single .rightside {
		height: 300px !important;
	}
    
    #fieldsselector .leftside ul,
	#fieldsselector .rightside ul {
		padding-inline-start: 5px;
		width: 300px;
    }
	
	#fieldsselector .leftside li,
	#fieldsselector .rightside li {
		list-style-type: none;		/* list bare style (no dot in front etc.) */
    	padding-left: 5px;
    	width: 200px;
	}	
	
    
    #fieldsselector .leftside li:hover,
    #fieldsselector .rightside li:hover {
		list-style-type: none;		/* list bare style (no dot in front etc.) */
    	padding-left: 5px;	
		background-color: #0070C0;
		color: white;
		width: 200px;
	}
	#fieldsselector .leftside li.selected,
	#fieldsselector .rightside li.selected {
		list-style-type: none;		/* list bare style (no dot in front etc.) */
    	padding-left: 5px;	
		background-color: #E0E0E0;
		color: black;
		width: 200px;
	}
    
    #fieldsselector #arrows {
		flex: 1;
		position: sticky;
        top: 200px;
		width: 50px;
		height: 64px; /* important for stick property to work as expected */
    }
    #fieldsselector.single #arrows {
		top: 30px !important;
	}
    #fieldsselector #arrows button {
		
		background-color: #EEEEEE;
		cursor: pointer;
        width: 32x;
        height: 32px;
        margin: 10px;
        border: 1px solid #C1C1C1;
        border-radius: 5px;
	}  
    #fieldsselector #arrows button:hover {
		background-color: #359FF0;
	}
	
	
	.fields_table {
		border: 1px solid #C1C1C1;
		background-color: #FFFFFF;
		overflow: auto;
		padding: 3px;
		font-size: 14px;
	}
	.fields_table:hover {
		cursor: pointer;
		border: 2px solid #1188E4;
	}
	
	
	
	
	
	/*********************************************** 
	 ** Form grid - general
	 ***********************************************/
	
	.formview_textarea:hover {
		background-color: #E2E4FF !important;
	}
	
	
	/*********************************************** 
	 ** Form grid in projecten table
	 ***********************************************/
	
	button.formview_button {		
		border-radius: 6px;
		padding-bottom: 3px;
		min-width: 150px;			/* work around the formview default */
	}
	button.formview_button span {
		font-size: 16px !important;
		font-weight: bold;
	}
		
	button.formview_button.termwerk_button {
		border-radius: 6px;
		background-color: #0070C0 !important;
		padding-bottom: 3px;
		height: 25px !important;
	}
	button.formview_button.termwerk_button.large {
		border-radius: 6px;
		background-color: #0070C0 !important;
		padding-bottom: 3px;
		width: 250px !important;
		height: 50px !important;
	}
	button.formview_button.termwerk_button:disabled {
		opacity: .5;
	}
	button.formview_button.termwerk_button.large {
		width: 150% !important;
	}
	button.formview_button.termwerk_button.danger {
		border-radius: 6px;
		background-color: #DA0012 !important;
		padding-bottom: 3px;
		height: 25px !important;
	}
	
	button.formview_button.termwerk_button span {
		font-size: 16px !important;
		font-weight: bold;
	}
	
	.horizontaal_cell {
		display: flex;
		flex-direction: row;
	}
	
	.horizontaal_cell_in_accordion {      /* concept form etc. */
		margin-right: 1%;
		margin-bottom: 1%;
	}
	.horizontaal_cell_in_accordion .form_celllabel {
		width: 90%;
	}
	.horizontaal_cell_in_accordion .form_cellvalue select,textarea {
		box-sizing: border-box;
	}
	
	
	
	.horizontaal_cell .form_celllabel {
		background-color: #1188E4; /*#B4A7D6;*/
		color: white;
		border: 2px solid #626262;
		font-size: 12px;
		padding-top: 5px;
		padding-left: 10px;
		padding-right: 20px;
		width: 10vw; 					 /* 10% of the view port */
		font-weight: normal !important;
	}
	
	.horizontaal_cell .form_cellvalue {
		font-size: 12px;
		border: 2px solid #626262;
		border-left: 0px;
	}
	.horizontaal_cell .form_cellvalue > * {
		-webkit-box-shadow: none;
		-moz-box-shadow: none;
		box-shadow: none;
	}
	
	.formview_list {
		border: 2px solid #ABABAB;
		-webkit-box-shadow: none;
		-moz-box-shadow: none;
		box-shadow: none;
	}
	
	
	
	/***********************************************
	 * Publication popup 
	 ***********************************************/
	
	.horizontaal_cell.inpopup {
		border: 1px solid #626262;
		margin-bottom: -1px;
	}
	.horizontaal_cell.inpopup .form_celllabel {
		border: 1px solid #626262;
		height: calc(1.5*(var(--termbank_samenvatting_form_cellheight)));;
	}
	.horizontaal_cell.inpopup .form_cellvalue.noteditable {
		width: 20vw;
		padding-top: 5px;
		padding-left: 5px;
		border: 1px solid #626262;
		min-height: calc(-5 + 1.5*(var(--termbank_samenvatting_form_cellheight)));	
		word-wrap: break-word; /* prevent long words to break out of the cell */	
	}
	
	.horizontaal_cell.inpopup .form_cellvalue.editable {
		width: calc(5px + 20vw);
		min-height: calc(1.5*(var(--termbank_samenvatting_form_cellheight)));
	}
	
	/* https://stackoverflow.com/questions/9911122/disabling-textarea-from-css */
	.horizontaal_cell.inpopup .form_cellvalue.editable.disabled {
		opacity: 0.3;
	}
	.horizontaal_cell.inpopup .form_cellvalue.editable.disabled textarea {
		pointer-events: none;
	}
	.horizontaal_cell.inpopup .form_cellvalue.editable.disabled:after {
	    width: 100%;
	    height: 100%;
	    position: absolute; 
	}
		
	
	.horizontaal_cell.inpopup .form_cellvalue textarea {
		border: none !important;
		padding-top: 5px;
		padding-left: 5px;
		padding-right: 5px;
		height: 100%;
        width: 100%;
        box-sizing: border-box;
	}
	
	
	
	.buttonbar.inpopup {
		display:flex;
		flex-direction:row;
		justify-content:space-around;
	}
	
	button.inpopup {
		background-color: #0070C0;
		border: none;
		color: white;
		padding: 5px 32px;
		text-align: center;
		text-decoration: none;
		display: inline-block;
		font-family: Verdana, sans-serif;
		font-size: 12px;
		border-radius: 6px;
	}
	button.danger.inpopup {
		background-color: #DA0012 !important;
	}
	button.inpopup:disabled {
		opacity: .5;
	}
	
	
	
	/*********************************************** 
	 ** Form grid accordion
	 ***********************************************/
	
	
	/* accordion fix */
	
	.ui-accordion .ui-accordion-header, 
	.ui-accordion .ui-accordion-content {
  		width: 100%;
  		box-sizing: border-box; /* Ensure padding and borders are included in the width */
	}	
	
	/* bold in title please! */
	.ui-accordion-header {
		font-weight: bold !important;	
	}
	
	
	/*********************************************** 
	 ** Form grid list editable cells
	 ***********************************************/
	
	.formview_listlabel_container .formview_list .dataTables_scrollBody tbody td.editable  {
		height: 22.5px !important;
	}
	
	
	
	/*********************************************** 
	 ** Form grid in concepts table
	 ***********************************************/
	
	#termbank_concepten_inbetween_div, 
	#termbank_talen_inbetween_div {
		display: flex !important;
		flex-direction: column;
		justify-content: flex-start; 
		flex-wrap: nowrap;
		
		height: auto;
		padding: 20px !important;
    	}
	
	.form_section {
		position: static !important;
		font-size: 20px;
		width: 100% !important;
	}
	
	.form_section_cells {
		position: static !important;
		width: 100% !important;
		
		display: flex;
        flex-direction: column;
        flex-wrap: wrap;
        align-content: flex-start; /* this one makes sure that we always have a 3 columns layout, even when we only have 2 columns to display! */
        gap: 5px;
        align-items: flex-start;
        min-height: 200px; 
        max-height: 420px;
	}
	
	.green_balk {
		font-weight: bold;
		color: white;
		background-color: #02B587;
		padding-top: 5px;
		padding-left: 5px;		
	}
	
	
	.form_overlay {
		background-color: #000000 !important;
		opacity: 0.3;
	}
	
`);
