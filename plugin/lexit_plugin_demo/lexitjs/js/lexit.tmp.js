// Factory 

// global object to store intermediate products of the factory
// etc
var oFactoryStorage = {}; // content: {sButtonName: oProduct, ...}
var sFactoryActiveButton; // name of the currently active button (last clicked upon)

var sFactoryTitle;
var oFactoryOptions;

var fnFactoryProcessor;  // function for building product by means of content of storage
var fnFactoryCancelFunction;

/**
 * Generate/initialize a factory, consisting of a storage and functions to be called to fill that storage, and finally a function to build the final product.
 * 
 * @param {String|Array} sTitle - Title of the message window (if array: sTitle as element #1, sMessage as element #2)
 * @param {Array} oOptions - Associative array of options names (keys) and functions (values) to execute when a given option was clicked upon. 
 * Each function must store its result by calling fn.putInFactoryStorage(oResult)
 * @param {Function} fnProcessor - Function (called after the user clicked on 'OK') to be called for building a product using the content of the factory storage
 * @param {Function} [fnCancelFunction=null] - Function called after the user clicked on 'Cancel'
 * 
 * As part of the process: show a prompt pop-up, requesting the user to perform different operations (linked to some buttons),
 * so as to build something out of that in the end (which is why the whole thing is called a factory).
 */
fn.buildFactory = function(sTitle, oOptions, fnProcessor, fnCancelFunction){
	
	// factory globals
	oFactoryStorage = {};
	sFactoryActiveButton = "";
	
	// dialog options
	sFactoryTitle = sTitle;	
	oFactoryOptions = oOptions;
	
	// set the processor
	fnFactoryProcessor = fnProcessor;
	fnFactoryCancelFunction = fnCancelFunction;
};


/**
 * Build or rebuild the factory dialog.
 * Since displaying a new dialog (asking the user to take some action) causes the main factory dialog to be removed from screen,
 * one can call this function to put the main factory dialog back on screen. 
 * 
 * @see fn.prompt
 * @see fn.promptSelect
 * @see fn.promptReorder
 */
fn.promptFactory = function(){
	
	if (typeof fnFactoryProcessor != 'function' || typeof fnFactoryProcessor == 'undefined')
		{
		fn.message("Let op", "fn.promptFactory() is aangeroepen terwijl er nog geen factory is. Tip: roep eerst fn.buildFactory() aan.");
		return;
		}	
	
	var promptDivId = "dialog-message"+getUniqueNumber();
	
	// deal with title/message input
	var sTitle = "", sMessage = "";
	if ( $.isArray(sFactoryTitle) )
		{
		sMessage = sFactoryTitle[1];
		sTitle = sFactoryTitle[0];
		}
	var sMessageP = $("<p></p>").html(sMessage);
	
	var promptDiv = $("<div></div>")
		.attr("id", promptDivId)
		.attr("title", sTitle)
		.css("font-size", "12px")
		.append(sMessageP);
	
	$(document.body).append(promptDiv);
	
	
	
	// SOMETHING LIKE THE FOLLOWING,
	// but for like fn._promptSelect_AppendOptions()
	
	fn._buildFactory_AppendOptions(selectableUl, aAllOptions, aAlreadyChosen);
	
	
	var promptHeight = (200 + 30 * oButtons.length);		
	
	$( "#"+promptDiv ).dialog({
		modal: true,
		autoOpen: false,
		height: promptHeight,
		width: "auto",
		open: function(event, ui){
			$(".ui-dialog").addClass("ui-dialog-shadow");
        	$( this ).closest(".ui-dialog").putInFront();
		},
		close: function(event, ui){
			$( "#"+promptDiv ).remove();
		},
        buttons: [
                  {
                	  text: "OK",
                	  click: function(){
                		  
						// NOG MEER ????
                		  
                		// call close function
                  		$( this ).dialog( "close" );
                		  
                		// call callback
                		fnFactoryProcessor( oFactoryStorage );
                		
                	},
                	id: 'dialog_accept_button'
                  },
                  {
                	  text: "Annuleren",
                	  click: function() {
                		  // call close function
                          $( this ).dialog( "close" );
                          
                		  // call callback upon Cancel, if available
                  		  if (fnCancelFunction != null)
                  			  fnCancelFunction();
                  		  
                  		  
                          
                      }
                  }
        ]
	});
	
	// remove focus from buttons, 
	// to make sure OK won't be triggered 
	// when Enter was pressed just before 
	// in another context (like validating input in cell)
	$('.ui-dialog :button').blur();
	
};

// register which button was clicked upon:
// as soon as an intermediate product to send to the factory 
fn._setFactoryButtonClickedUponWas = function( sButtonName ){
	sFactoryActiveButton = sButtonName;
};

/**
 * Store data in the factory storage.
 * This function is to be called by functions associated to factory buttons, which are set in fn.promptFactory(... oOptions ...)
 * 
 * @param {Object} oResult - object to store in factory storage
 */
fn.putInFactoryStorage = function(oResult){
	oFactoryStorage[ sFactoryActiveButton ] = oResult;
}




//subroutine for building the options to choose from in fn.buildFactory
fn._buildFactory_AppendOptions = function(selectableUl, oOptions, aHighlight){
	
	selectableUl.empty();
	
	// https://stackoverflow.com/questions/7113865/how-to-copy-clone-a-hash-object-in-jquery
	Object.keys(oOptions).forEach(function(sOption){
		
		// one element 		
		var liElement = $("<li></li>")
			.addClass( "ui-widget-content" )
			.css("margin", "3px")
			.css("padding", "0.4em")
			.css("font-size", "12px")
			.css("height", "18px");	
		
		// if some item was pre-selected, assign it the selected class
		if (aHighlight != null && aHighlight.indexOf(sOption)>-1)
			{
			liElement.addClass("ui-selected");
			}
		
		var spanElement = $("<span></span>")
			.text( $.trim(sOption) );
		liElement.append(spanElement);
		selectableUl.append(liElement);
		
		// wrap!
		oOptions[ sOption ] = function(){
			
			// register which button was clicked upon,
			fn._setFactoryButtonClickedUponWas( sOption );
			
			// call the function assigned (within configuration) to the chosen option 
			var fnFunction = oOptions[ sOption ];
			fnFunction();
		}
	});
}