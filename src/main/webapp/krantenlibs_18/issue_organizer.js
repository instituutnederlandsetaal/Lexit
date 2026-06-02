


// *****************************************************************
// color codes for the metadata groups
// *****************************************************************

var aColorCodes = ["#F6D8CE", "#A9D0F5", "#A9F5A9", "#F78181", "#9F81F7", "#58FAD0", "#F6D8CE", "#A9D0F5", "#A9F5A9", "#F78181", "#9F81F7", "#58FAD0"];




// Show the Issue organizer
//
var showIssue = function(t, nCell, bIssueHandled) {

	// get issue and group label [=subissue]
	// (we need the label, because the issue might have been split into subissues)

	const date = 		fn.getDataFromSiblingNode(nCell, "datum_issue");
	const id = 			fn.getDataFromSiblingNode(nCell, "issue_id");
	const subissue =	fn.getDataFromSiblingNode(nCell, "subissue"); 
  
	// get the images of that issue/subissue

	fn.callFunction('api.pages_for_issue_and_subissue', [id, subissue], function(resp){

		var jsonResp = (resp["pages_for_issue_and_subissue"]);		
		var aParsedResp = JSON.parse(jsonResp);

		// now build the work interface
		buildToyBox(date, aParsedResp, bIssueHandled);
		
	});

};

// --------------------------------------------------------------------------------------------------------

// Get the URL to the images
//
var buildImageRef = function(sPageId, sSize){

  if ( !$.isString(sSize))
    sSize = ","+sSize;  // set image size, give y-size, keeping aspect ratio 

  //  return `${IMAGE_BASE}${sPageId}_access.jp2/full/${sSize}/0/default.gif`;
  return `${IMAGE_BASE}${sPageId}_master.jpg/full/${sSize}/0/default.jpg`;
  //return "http://images.ivdnt.org/iiif/3/17de-eeuwse-kranten%2f"+sPageId+"_access.jp2/full/"+sSize+"/0/default.gif";
}


// --------------------------------------------------------------------------------------------------------

// Build the metadata field in the Issue Organizer,
// allowing to enter date etc.
//
var buildMetadataFields = function(issueDate, iIndexOfGroupBorder){

	var iIndexOfMetadataGroup = ( iIndexOfGroupBorder == null ? 0 : iIndexOfGroupBorder+1)

	setTimeout(function(){

		// determine how many metadata groups we have 
		var nrOrGroups = $(".datepicker_class").length;
		// determine how many borders we have
		var nrOfBorders = $("#smallview").find("li.groupsborder").length; 


		// (Knowing that 1 border means 2 metadata groups)
		// when entering this function, the number of borders
		// must be equal the number of metadata groups,
		// because this function is called as soon as a border
		// was built, to trigger building of a new metadata group.
		// 
		// So, if the the number of borders is instead smaller
		// than the number of metadata groups,
		// we safely conclude that the border creation was canceled
		// so we should cancel the metadata group creation too!

		if (nrOfBorders < nrOrGroups
			&& 
			nrOrGroups!=0) // exception: at initialisation, create a first metadata group
			return;


		var sGroupRandomId = "group_"+getUniqueNumber();

		// id the fields must be attached to
		var fieldsviewId = "fieldsview";

		var groupDiv = $("<div></div>")
			.attr("id", sGroupRandomId)
			.addClass("datepicker_class")
			//.css("border", "1px solid grey")
			.css("margin", "15px");

		var fieldSet = $("<fieldset>");

		// group id field

		var sGroupLabel = $("<label></label>")
			.attr("for", sGroupRandomId+"_label")
			.text("Group #");
		var sGroupField = $("<input></input>")
			.attr("type", "text")
			.attr("name", sGroupRandomId+"_label")
			.attr("id", sGroupRandomId)
			.addClass("groupinput")
			.prop("disabled", true)
			.val(iIndexOfMetadataGroup);


		// group date input

		var sIssueDateLabel = $("<label></label>")
			.attr("for", "date_"+sGroupRandomId+"_label")
			.text("Issue date");
		var sIssueDataField = $("<input></input>")
			.attr("type", "text")
			.attr("name", "date_"+sGroupRandomId+"_label")
			.attr("id", "date_"+sGroupRandomId)
			.val(issueDate);

		fieldSet.append(sGroupLabel);
		fieldSet.append($("<br/>"));
		fieldSet.append(sGroupField);
		fieldSet.append($("<br/>"));

		fieldSet.append(sIssueDateLabel);
		fieldSet.append($("<br/>"));
		fieldSet.append(sIssueDataField);
		fieldSet.append($("<br/>"));

		$(groupDiv).append(fieldSet);

		// at initialisation: append to main DIV
		if (nrOrGroups == 0){

			console.log("at initialisation: append to main DIV");
			$("#"+fieldsviewId).append(groupDiv);
		} 			
		// after initialisation
		else if (nrOrGroups>0){

			// if the group being added is to become the last one
			// just append it
			if (iIndexOfMetadataGroup == nrOrGroups){
				$("#"+fieldsviewId).append(groupDiv);
			}
			// otherwise that means the group being added is to be inserted between others
			// t.i. before the pre-existing group with the same index 
			else {
				var eTargetGroup = $(".datepicker_class").eq(iIndexOfMetadataGroup);
				eTargetGroup.before(groupDiv);
			}

		}
		
		
		setTimeout(function(){

			$( "#" + "date_"+sGroupRandomId ).datepicker({
				dateFormat: "yy-mm-dd"
			});

			// finally renumber the groups, given the fact that one was added!
			$("div#fieldsview .groupinput").each(function(i){
				$(this).val(i);
			});

			// assign colors to groups
			setGroupColors();
			
		}, 100);

	}, 100); // duration upon start must be at least equal to revertDuration of draggable!

};



// --------------------------------------------------------------------------------------------------------

// assign colors to groups
var setGroupColors = function(){
	
	$("div#fieldsview fieldset").each(function(i){
		$(this).css("background-color", aColorCodes[i]);
	});

	var iGroupNr = 0;
	$("#smallview li").each(function(i){
		
		if ($(this).hasClass("groupsborder"))
			iGroupNr++
		else
			$(this).css("border", "10px solid "+aColorCodes[iGroupNr]);
	});
}

// --------------------------------------------------------------------------------------------------------

// global
var iBigSize = 150*3.5;
var iBigSizeExtra = 0;
// our custom size for thumbnails
var iSize = 150; 


var buildToyBox = function(issueDate, aParsedResp, bIssueHandled){

	var sTitle = "Issue organizer";	
	
  	// build all the needed divs

	var promptDivId = "dialog-message"+getUniqueNumber();
	var sortableId = "sortable"+getUniqueNumber();
	var sortableLimitId = "sortableLimit"+getUniqueNumber();
  
	// big view for large image view
	var biggerviewId = "biggerview";
		
	// small view for thumbnails
	var smallviewId = "smallview";

	// div voor draggable group border
	var limitviewId = "limitview";
	// div for metadata fields for groups
	var fieldsviewId = "fieldsview";
	
	// deal with title/message input
	var sMessage = "";
	var sMessageP = $("<p></p>").html(sMessage);
	
	var promptDiv = $("<div></div>")
		.attr("id", promptDivId)
		.attr("title", sTitle)
		.css("font-size", "12px")
		.css("position", "relative")
		.append(sMessageP);
	var biggerviewDiv = $("<div></div>")
		.attr("id", biggerviewId)
		.css("display", "inline-block")
		.css("vertical-align", "top")
		.css("float", "left")
		.css("min-height", "100px") // make sure the div has at lease a minimal height, preventing it to collapse between loading of images 
		.css("width", iBigSize + iBigSizeExtra);
	
	var smallviewDiv = $("<div></div>")
		.attr("id", smallviewId)
		.css("display", "inline-block")
		.css("width", 250)
		.css("height", $(window).height()*.85)
		.css("vertical-align", "top")
		.css("overflow-y", "auto");
	var fieldsviewDiv = $("<div></div>")
		.attr("id", fieldsviewId);
	var limitviewDiv = $("<div></div>")
		.attr("id", limitviewId)
		.css("display", "inline-block")
		.css("width", 250)
		.css("height", $(window).height()*.85)
		.css("vertical-align", "top")
		.css("overflow", "hidden");
	var sortableLimitUl = $("<ul></ul>")
		.attr("id", sortableLimitId)
		.css("list-style-type", "none")
		.css("margin", "0")
		.css("padding", "0")
		.css("width", iSize*1.4);

	var sortableUl = $("<ul></ul>")
		.attr("id", sortableId)
		.css("list-style-type", "none")
		.css("margin", "0")
		.css("padding", "0")
		.css("width", iSize*1.4);

	promptDiv.append(biggerviewDiv);
	
	promptDiv.append(smallviewDiv);
	promptDiv.append(limitviewDiv);
	limitviewDiv.append(fieldsviewDiv);
	limitviewDiv.append(sortableLimitUl);
	
	smallviewDiv.append(sortableUl);	
	$(document.body).append(promptDiv);
	
	var aOriginalOrder = new Array();
	var aFieldNames =  new Array();

	var liElement = $("<li></li>")
			.addClass( "ui-state-default" )
			.addClass( "groupsborder" )
			.css("margin", "0 3px 3px 3px")
			.css("padding", "0.4em")
			.css("padding-left", "1.5em")
			.css("font-size", "12px")
			.css("font-weight", "bold")
			.css("min-height", "18px")
			.css("background-color", "yellow")
			.text("Limit between groups");

	sortableLimitUl.append(liElement);
  

  // now loop through the images to be shown as thumbnails

	for (var i=0; i<aParsedResp.length; i++){

		// get image id
		var sPageId = aParsedResp[i]["page_id"];
		aFieldNames.push(sPageId);
		
    // note the original order
		var fieldLC = sPageId;
		aOriginalOrder.push(fieldLC);
    
    // add image as an LI element
    // with events attached:
    //
    // - mouseover triggers rendering of large view of thumbnail
    // - double click is excluding (or re-including)
    // - click+ctrl is opening image viewer

		var liElement = $("<li></li>")
			.addClass( "ui-state-default" )
			.attr("id", fieldLC)
			.css("margin", "0 3px 3px 3px")
			.css("padding", "0.4em")
			.css("padding-left", "1.5em")
			.css("font-size", "12px")
			.css("min-height", "18px")
			.mouseover(function(){

				$(this).siblings().css("background", "#e6e6e6");
				$(this).css("background", "#BDBDBD");

				var sImgId = $(this).attr("id");
				var bigImgElement = $("<img></img>")
					.attr("src", buildImageRef(sImgId, iBigSize + iBigSizeExtra) )
					.attr("id", sImgId)
					.css("width", iBigSize + iBigSizeExtra);
					
				$(biggerviewDiv).empty().append(bigImgElement);
			})
			.dblclick(function(){

				// double click to exclude (or re-include)
				if ($(this).hasClass("delete")){
					$(this).css("opacity", "1.0").removeClass("delete");	// this one is allowed back to be part of a group
				}
				else {
					$(this).css("opacity", "0.4").addClass("delete");		// this one must be excluded (to the bin!)
				}
				
			})
			.click(function(){
				
				// show image viewer
				if (kf.isPressed("ctrl")){
					var sImgId = $(this).attr("id");
					var sUrl = buildImageRef(sImgId, "max");
					window.open(sUrl, '_blank');
				}
				
			});		
		
		var imgElement = $("<img></img>")
			.attr("src", buildImageRef(sPageId, iSize) )			
			.css("width", iSize)
			.attr("title", "<span style='color: #FFD700'>[Click]</span> Drag & Drop<BR><span style='color: #FFD700'>[Ctrl+Click]</span> Open Viewer<BR><span style='color: #FFD700'>[Doubleclick]</span> Include/Exclude").addClass("tooltip");
	  liElement.append(imgElement);
    sortableUl.append(liElement);
		

		// load first image in big view
		if (i==0){	
    
			liElement.css("background", "#BDBDBD");

			var bigImgElement = $("<img></img>")
				.attr("id", sPageId)
				.attr("src", buildImageRef(sPageId, iBigSize + iBigSizeExtra) )
				.css("width", iBigSize + iBigSizeExtra);
				
			$(biggerviewDiv).empty().append(bigImgElement);

		} 
	}	
	
  
  // Now add the buttons of the Issue organizer
  
	// array of buttons
	var aButtons = [];

  // Add OK button and its processing callback 
  // (except if issue is handled already)

  if ( !bIssueHandled){

    aButtons.push({

      text: "OK",
      click: function(){

        var nSelectedRow = fn.getFirstSelectedRowNodeFrom(sIssueTable);
        var sIssueId = fn.getDataFromCellInRowNode(nSelectedRow, "issue_id");
        
        var aLIs = $("#"+sortableId).find("li");

        var iGroupNr = 0;
        var aToProcess = []; // to be sent to the database for storage

        // loop through the sortable LI elements

        aLIs.each(function(){

          // get the date of current group
          var sDate = $("div#fieldsview fieldset:eq("+iGroupNr+") input.hasDatepicker").val();
          
          var thisElement = this;
          var sId = $(thisElement).attr("id"); 
          
          // if the current LI has nog id, it means it's a border: increase group nr and skip to next round
          if (sId == null) {
            iGroupNr++;
          }
          // otherwise we have a genuine page
          else {

            var aPair = {};
            var bDelete = $(thisElement).hasClass("delete");
            if ( !bDelete ){
              aPair[sId] = String.fromCharCode(97  +iGroupNr); // letter 'a' or above
            }
            else {
              aPair[sId] = "x"; // throw away: 'x' group [= code for exclusion]
            }

            // build input for database
            aToProcess.push( sId +"###"+ aPair[sId] +"###"+ sDate );
          }				
        });
          
        $( this ).dialog( "close" );

        
        // update the pages in the database now

        fn.callFunction("api.update_pages", [fn.quote(aToProcess.join("@@@")), fn.quote(issueDate)], function(){

          fn.refreshTable(sIssueTable, function(){

            setTimeout(function(){
              var aRows = fn.getAllRowNodesWhere(sIssueTable, {"issue_id": sIssueId});
              $(aRows).each(function(){
                fn.selectRowNode(this);
              })
            }, 200);
          });
        });

        },
      id: 'dialog_accept_button'
    });

  }
	

	// Add a cancel button 
	
	aButtons.push({

  	text: "Annuleren",
	  click: function() {
		  $( this ).dialog( "close" );
      }
	});
	
	
	
  	// Ready to open the dialog!	

	$( "#"+promptDivId ).dialog({
		autoOpen: false,
		resizable: false,
		height: $(window).height(),
        width: 1100, 
		modal: true,
		width:'auto',
        open: function( event, ui ){
			// remove close button (cancel is enough)
			$(".ui-dialog-titlebar-close").hide();
			// add shadows
        	$(".ui-dialog").addClass("ui-dialog-shadow");
        	$( this ).closest(".ui-dialog").putInFront();
        },
        close: function(event, ui){
        	$( this ).remove();
        },
        buttons: aButtons
  	});
  
	$( "#"+promptDivId ).dialog( "open" );

	// activate tooltip on thumbnails
	$(".tooltip").tipTip( gui.getTiptipConfig() );

	// make sure Enter works as ok-click
	fn._activeEnterForThisDialog(promptDivId);

	setTimeout(function(){

		$(".ui-dialog-title")
			.mouseenter(function(){
				$(this).closest(".ui-dialog").css("opacity", "0.25");

			})
			.mouseleave(function(){
				$(this).closest(".ui-dialog").css("opacity", "1.0");
			});;


		var space = $("<span></span>").html("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;");
		var minButton = $("<button></button>")
			.addClass("ui-button ui-widget ui-corner-all")
			.text("-")
			.click(function(){
				var sPageId = $("div#biggerview").find("img").attr("id");
				
				if(iBigSizeExtra>0)
					iBigSizeExtra -= 100; 

				$("div#biggerview").find("img")
					.css("width", iBigSize + iBigSizeExtra)
					.attr("src", buildImageRef(sPageId, iBigSize + iBigSizeExtra) )
					.css("width", iBigSize + iBigSizeExtra);
				$("div#biggerview")
					.css("width", iBigSize + iBigSizeExtra);

				setTimeout(function(){
					var iDialogWidth = parseInt($("div.ui-dialog").css("width"));
					var iScreenWidth = $(window).width();

					$("div.ui-dialog")
						.css("left", (iScreenWidth-iDialogWidth)/2);

				}, 50);
				
			});
		var plusButton = $("<button></button>")
			.addClass("ui-button ui-widget ui-corner-all")
			.text("+")
			.click(function(){
				if(iBigSizeExtra<1000)
					iBigSizeExtra += 100;

				$("div#biggerview").find("img")
					.css("width", iBigSize + iBigSizeExtra)
					.attr("src", buildImageRef(sPageId, iBigSize + iBigSizeExtra) )
					.css("width", iBigSize + iBigSizeExtra);
				$("div#biggerview")
					.css("width", iBigSize + iBigSizeExtra);
				
				setTimeout(function(){
					var iDialogWidth = parseInt($("div.ui-dialog").css("width"));
					var iScreenWidth = $(window).width();

					$("div.ui-dialog")
						.css("left", (iScreenWidth-iDialogWidth)/2);

				}, 50);

			});
		$("div.ui-dialog-buttonpane div.ui-dialog-buttonset").prepend(space);
		$("div.ui-dialog-buttonpane div.ui-dialog-buttonset").prepend(minButton);
		$("div.ui-dialog-buttonpane div.ui-dialog-buttonset").prepend(plusButton);
	}, 500);
	
	

	// this part of the dialog config is about
	// enabling the specific drag & drop functionality of the Issue organizer:
	//
	// very nice example adapted for this application:
	// https://jqueryui.com/draggable/#sortable  
  
	$( "#"+sortableId ).sortable({
		revert: true,
		receive: function(e, ui){	// as soon as border mark was dropped here, do the following: 

			// get the item and its index in the list of sortables
			var newBorder = $(this).data("ui-sortable").currentItem;
			//var newIndex = newBorder.index();
			var iIndexOfGroupBorder = $("#smallview").find("li.groupsborder").index( $(newBorder).find("li").eq(0) );

			// build a new group of metadata fields, at the right vertical place between all existing groups
			// (given the border index in the list or sortable items)
			buildMetadataFields(issueDate, iIndexOfGroupBorder);


			$("#smallview").find("li.groupsborder").attr("title", "<span style='color: #FFD700'>[Click]</span> Drag & Drop<BR><span style='color: #FFD700'>[Doubleclick]</span> Remove").addClass("tooltip");
			$(".tooltip").tipTip( gui.getTiptipConfig() );
		},
		stop: function(e, ui){
			// assign colors to groups
			setGroupColors();
		}
  });


	$( "#"+sortableLimitId ).draggable({
      connectToSortable: "#"+sortableId,
      helper: "clone",
      revert: "invalid",
      revertDuration: 50,
      stop: function(e, ui){ // as soon as the helper is dropped, do the following:		

      // attach the dblclick event to it, allowing to throw it away
      $(ui.helper.get(0)).dblclick(function(){

        // this one needs to be recomputed when this element is triggered, otherwise we won't get the right index
        var thisOne = this;
        var iIndexOfGroupBorder = $("#smallview").find("li.groupsborder").index( $(thisOne).find("li").eq(0) );

        // remove metadata
        $(".datepicker_class").eq(iIndexOfGroupBorder+1).remove();
        // remove border
        $(thisOne).remove();

        // finally renumber the groups, given the fact that one was removed!
        $("div#fieldsview .groupinput").each(function(i){
          $(this).val(i);
        });
        // assign colors to groups
        setGroupColors();
      });

      
      }
	})
	.attr("title", "Drag & drop!").addClass("tooltip");
	
	$( "ul, li" ).disableSelection();

  // the metadata fields of the first group  
  // must be available right from the start
	buildMetadataFields(issueDate, null);

	// remove scrollbar from dialog
	$( "#"+promptDivId ).css("overflow", "hidden");


	// activate tooltip everywhere
	$(".tooltip").tipTip( gui.getTiptipConfig() );

}


// make sure that Ctrl key will be released, when one has done Ctrl+click to see page, and then come back to this app

fn.doAtFocusGain(function(){
	$(document).trigger("keyup");
});
