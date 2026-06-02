

class AdvancedSearch {
  
  books = {"TitleShort": "", "Year": "", "Place": "", "Edition": "", "language": ""}
  books_ext = {"TitleLong": "", "Subject": ""}
  authors = {'relation' : "", "name" : "", "gender": ['', 'F', 'M'], "nationality": "", "birthplace": "", "sector": ""};
  related_books = { "language1": "", "relation": "", "language2": ""}


  books_values = deleteValues(this.books)
  books_ext_values = deleteValues(this.books_ext)
  authors_values = deleteValues(this.authors)
  related_books_values = deleteValues(this.related_books)

  initialized = false

  tabjes = {
   "Book properties (basic)" : `<div id="book_form"><i>Book properties</i></div>`,
   "Book properties (extended)" : `<div id="book_form_ext"><i>Book properties</i></div>`,
   "Author properties" :  `<div id="author_form"><i>Involved person properties</i></div>`,
   "Book relations" : `<div id="related_book_form"><i>Relations to other books</i></div>`
  }

  clearAdvancedBookSearch() {
	this.books_values = deleteValues(this.books_values)
	this.books_ext_values = deleteValues(this.books_ext_values)
	this.authors_values = deleteValues(this.authors_values)
	this.related_books_values = deleteValues(this.related_books_values)
  }


  getExistingValues(table_name, column_name, callback) {
	fn.callFunction(
		"get_value_frequencies", [table_name, column_name],
		function(resp) {		
			const r0 = resp["get_value_frequencies"];
			// console.log('Response for callback: ' + r0)
			const response = JSON.parse(r0)
		    // console.log(response)
			if (callback) callback(response)
		}
	);	
  }

  initializeValueLists() {
	 const self = this;
	 
	 console.log('init');

     function getValues(table_name, column_name, callback) {
		self.getExistingValues(table_name, column_name, response => {
			var values = response.map(o => o[0])
			values.sort()
			if (!(values.includes(""))) values = [""].concat(values)
			// alert(JSON.stringify(values))
			callback(values)
		} )
	 }
      	
	 getValues("RelPeopleBk", "TypeRel", r => self.authors['relation'] = r)
	 getValues('RelBetwBks', 'TypeRel', r => self.related_books['relation']  = r)
	 getValues('People', 'Place_of_birth', r => self.authors['birthplace'] = r)
	 getValues('Book', 'Place', r => self.books['Place'] = r)
	 getValues('Book', 'Edition', r => self.books['Edition'] = r)
	 getValues('People', 'Sector', r => self.authors['sector'] = r)
	 getValues('People', 'Nationality',r => self.authors['nationality'] = r )
	 getValues('People', 'Name',r => self.authors['name'] = r )
	 getValues('Language', 'Language', r =>  { self.related_books['language1'] = r; self.related_books['language2'] = r; self.books['language'] = r }  )
  }
 
  launchBookSearchForm() {
	// testje = this.getExistingValues("Book", "language")
	if (!this.initialized)  { 
		this.initializeValueLists()
		this.initialized = true
	}

	const self = this; // beetje sneu altijd dit  
	advancedSearchForm('advanced_search',
	 [this.books, this.books_ext, this.authors, this.related_books],
	 [this.books_values, this.books_ext_values, this.authors_values, this.related_books_values],
	 clone(this.tabjes),
	 function() {  
		  // alert("OK!!! "  + JSON.stringify(self.authors_values))
		  // set the filters for the "authors" json column
		  var filters = {};
		  // author properties
		  {
		    promptResp = clone(self.authors_values)
		    Object.keys(promptResp).forEach(k => { if (!promptResp[k]) delete promptResp[k]})

		    const value = JSON.stringify(promptResp).replace(/^{/, "").replace(/}$/,"").replace(/ *: */g, ": ").replace(/ *, */g, ", ") // deze replaces worden later vermoedelijk onnodig
            filters["authors"]  = value
		    // fn.setFilters("Book", {"authors": value }, true) // does not work for invisible columns?
          }
		  // related book properties
		  {
		    promptResp = clone(self.related_books_values)
		    Object.keys(promptResp).forEach(k => { if (!promptResp[k]) delete promptResp[k]})

		    const value = JSON.stringify(promptResp).replace(/^{/, "").replace(/}$/,"").replace(/ *: */g, ": ").replace(/ *, */g, ", ") // deze replaces worden later vermoedelijk onnodig
			filters["related_books"] = value
		    //fn.setFilters("Book", {"related_books": value }, true) // does not work for invisible columns?
		  }
		  // book properties
		  {
			var promptResp = clone({ ...self.books_values, ...self.books_ext_values });
			Object.keys(promptResp).forEach(k => { if (!promptResp[k]) delete promptResp[k]})
			Object.keys(promptResp).forEach(k => filters[k] = promptResp[k])
		    	
		  }
		  
		  console.log("HOI PIET", filters)

		  fn.setFilters("Book", filters, true)	
		  window.setTimeout(
		  () => fn.refreshTable("Book"), 500);  // dit werkt niet altijd?
		},
		function () {self.clearAdvancedBookSearch()} // clear form callback
	 )
	// alert(JSON.stringify(books_values))
}
} 

