function clone(o)  { return JSON.parse(JSON.stringify(o))}





function createForm(dialog, form_id, container_id, template, formData) {
    x = $('#' + container_id)
    x = dialog.find('#'  + container_id)// .text('Modified sub-element text');
    // alert(x.html())
    
    x.append(template)

    form = x.find('#'  + form_id)

    x.on('input', '[data-model]', function() {
       const model = $(this).data('model');
       formData[model] = $(this).val();
       console.log(formData);  // Output formData to console for debugging
    });

    x.on('submit', function(e) {
      e.preventDefault();  // Prevent the form from refreshing the page
      alert('Form Submitted: ' + JSON.stringify(formData));
    });
}

function createTemplate(form_id, fieldNames, fieldValues) {
  
  const fields = Object.keys(fieldNames).map(f =>  {
     const possibleValues = fieldNames[f]
     const value = fieldValues[f]
     var inputElement =  `<input data-model="${f}" id="${f}" value="${value}"></input>`

     if (possibleValues instanceof Array) {
        options = possibleValues.map(o => `<option ${o == value?'selected="selected"':''} value="${o}">${o}</option>`).join("")
        inputElement = `<select data-model="${f}" id="${f}">${options}</select>`
     }
     return `
    
      <label for="${f}">${f}</label><br>
      ${inputElement}
      <br>`})

  const form = `<form  style="margin-top: 1em" id="${form_id}">${fields.join("")}<br></form>`
  return form;
}

function createFormAndTemplate(dialog, form_id, container_id, parameterSettings, parameterValues) {
   const t = createTemplate(form_id, parameterSettings, parameterValues)
   // alert(t)
   createForm(dialog, form_id, container_id, t, parameterValues)
}

function createDialog(container_id, title, beforeRender, okCallback, clearCallback) {
  // Create the dialog element
  
  const $dialog = $('<div style="background-color: white; border-style:solid; padding: 1em"></div>')
    .attr('id', 'dynamicDialog')
    .addClass('dialog-content')
    .html(`<div id="${container_id}">Advanced search</div>
       <div id="tabs_container"></div>
       `) // Default content
  
    // alert($dialog)
  // Apply the beforeRender callback to modify the contents
  
  if (typeof beforeRender === 'function') {
    beforeRender($dialog);
  }

  // Initialize the dialog
  $dialog.dialog({
    title: title,
    modal: true,
    width: "50%",
    buttons: {
      "OK": function() {
        if (okCallback) okCallback();
        $(this).dialog("close");
      },
      "Clear" :  function() { if (clearCallback) clearCallback(); $(this).dialog("close");  }
    },
    open: function(event, ui){
      // remove close button (cancel is enough)
     
      // add shadows
      // $(".ui-dialog").addClass("ui-dialog-shadow");
      $( this ).closest(".ui-dialog").putInFront();

      // $(".ui-dialog-titlebar").addClass("cobaltbalkcolor").css("color", "#FFFFFF");
   },

    close: function() {
      // Remove dialog element from the DOM after closing
      $(this).remove();
    }
  });
}

function createTabs(dialog, containerId, tabsData) {
  const $container = dialog.find(`#${containerId}`);
  
  // Create the tab navigation (list of tab names)
  const $tabList = $('<ul></ul>').addClass('ui-tabs-nav');;
  
  // Create the tab content div
  const $tabContentDiv = $('<div></div>').addClass('ui-tabs-content');;
  
  $.each(tabsData, function (tabName, content) {
    // Create a unique id for each tab content
    const tabId = `tab-${tabName.replace(/\s+/g, '-')}`;
    
    // Create the tab link
    const $tabLink = $('<a></a>')
      .attr('href', `#${tabId}`)
      .text(tabName);
    
    const $tabItem = $('<li></li>').append($tabLink);
    $tabList.append($tabItem);

    // Create the content div for the current tab
    const $tabContent = $('<div></div>')
      .attr('id', tabId)
      .addClass('ui-tabs-panel')
      .html(content); // Insert the content
    
    $tabContentDiv.append($tabContent);
  });
  
  // Append the tabs and content to the container
  $container.append($tabList);
  $container.append($tabContentDiv);

  // Initialize the tabs widget
  $container.tabs();
}


function advancedSearchForm(formId, parameterSettings, parameterValues, tabs, okCallback, clearCallback) {

  const ids = Object.keys(parameterSettings).map(i => formId + i)
  
  const tabs_with_ids = tabs
 
  var i = 0

  Object.keys(tabs).forEach(t => { 
    id = ids[i]
    tabs_with_ids[t]  = `<div id="${id}">${tabs[t]}</div>` 
    i++
  })

  console.log(JSON.stringify(parameterValues))

  createDialog('form_container', 'Advanced search', d => {
    
    createTabs(d, 'tabs_container', tabs_with_ids)

    Object.keys(ids).forEach(i => {
        const container_id = ids[i]
        const form_id = container_id + "_form"
        console.log(`${i} ${form_id} : ${container_id} ${JSON.stringify(parameterValues[i])}`)
        createFormAndTemplate(d, form_id, container_id, parameterSettings[i], parameterValues[i])
      }
    )
  }, okCallback, clearCallback)
}


function test2() {
  books = {"TitleShort": "", "Year": "", "Place": "", "Edition": "", "language": ""}
books_ext = {"TitleLong": "", "Subject": ""}
authors = {'relation' : "", "name" : "", "gender": ['F', 'M'], "nationality": "", "birthplace": "", "sector": ""};
related_books = { "language 1": "", "relation": "", "language 2": ""}


books_values = clone(books)
books_ext_values = clone(books_ext)
authors_values = clone(authors)
related_books_values = clone(related_books)

tabjes = {
  "Book properties (basic)" : `<div id="book_form"><i>Book properties</i></div>`,
  "Book properties (extended)" : `<div id="book_form_ext"><i>Book properties</i></div>`,
  "Author properties" :  `<div id="author_form"><i>Involved person properties</i></div>`, 
  "Book relations" : `<div id="related_book_form"><i>Relations to other books</i></div>` 
 }

   advancedSearchForm('advanced_search', 
    [books, books_ext, authors, related_books], 
    [books_values, books_ext_values, authors_values, related_books_values], 
    clone(tabjes),
    function() {  alert(JSON.stringify(books_values))  } )

   // alert(JSON.stringify(books_values))
}


