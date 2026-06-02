///// detailed title 
// deze rendering functies in ander bestandje zetten

// dit is even een gruweltje

function parse_json(json) {
	json = json.replace(/<.*?>/g,"")
	o = JSON.parse(json)
	return o
}


function display_json(o) {

	allTables = ""
	o.forEach(x => {
	   rows = Object.keys(x).map(k => `<tr><td style="font-weight: bold">${k}</td><td>${x[k]}</td></tr>`).join(" ")
	   allTables = allTables + `<hr><table>${rows}</table>`
	})
	
	return allTables
}

// 

function display_relations(o) {
	allTables = ""
	o.forEach(x => {
	   rows = display_relation(x)
	   allTables = allTables + `<hr><div>${rows}</div>`
	})
	
	return allTables
}


function display_relation(x) {
	return `&lt;Current title&gt; (${x['language1']}) <b>&lt;${x['relation']}&gt;</b> <i>${x['title2']}</i>, ${x['year2']} (${x['language2']}) `;
}

function display_json_compact(o) {

	allTables = ""
	o.forEach(x => {
	   rows = Object.keys(x).map(k => `<span style="font-weight: bold">${k}</span>: ${x[k]}`).join(", ")
	   allTables = allTables + `<hr><div>${rows}</div>`
	})
	
	return allTables
}


/*
name: Marchant, gender: M, relation: Publisher, birthplace: , first_name: Lambert (II), nationality: Low Countries
name: Harrewijn, gender: M, relation: Engraver, birthplace: Amsterdam, first_name: Jacobus, nationality: Northern Netherlands
name: Bavaria, gender: M, relation: Addressee, birthplace: Vienna, first_name: Joseph Ferdinand Leopold, nationality: Holy Roman Empire
name: Fernández de Medrano, gender: M, relation: Translator, birthplace: Mora, first_name: Sebastián, nationality: Spain
name: Fernández de Medrano, gender: M, relation: Author, birthplace: Mora, first_name: Sebastián, nationality: Spain
*/

function display_author(x) {
	return `${x['name']}, ${x['first_name']}, <i>${x['birthplace']} (${x['nationality']})</i>`
}

function unique(arr) {
	return [...new Set(arr)];
  }

function display_authors_compact(o) {
	var relations  = unique(o.map(x =>  { 
		const z = x['relation']
		//console.log(z);
		return z }))
	// const relations = new Set(o.map(x => x['relation']))
	// console.log(JSON.stringify(relations))
	const grouplets = relations.map(r => {
		const o1 = o.filter(x => x['relation'] == r)
		const members = o1.map(display_author).map(m => `<div>${m}</div>`).join("")
		//console.log(JSON.stringify(members))
		return `<tr><td><b>${r}</b></td><td>${members}</td></tr>`
	}).join("")
	const x = `<table>${grouplets}</table>`
	return x;
}

function display_author_name(x) {
	return `${x['name']}, ${x['first_name']}`
}

function display_authors_and_translators(o) {
	var authors = o.filter(x => x['relation']  == "Author").map(display_author_name).join("; ")
	var translators = o.filter(x => x['relation']  == "Translator").map(display_author_name).join("; ")
	return `<div>Authors: ${authors}</div><div>Translators: ${translators}</div>`
}


function minBy(array, f) {
	return array.reduce((min, current) => f(current) < f(min) ? current : min);
  }
  
  // Use the function to find the person with the minimum age



/**
 * Converts JSON data from the get_net function into Cytoscape.js elements.
 * @param {Array} jsonData - The JSON array returned by the get_net function.
 * @returns {Array} - An array of Cytoscape.js elements (nodes and edges).
 */

function jsonToCytoscape(jsonData) {
	const elements = [];
	const nodesMap = new Map();
    const edgeMap = new Map();
	// Process each record in the JSON data

	const oldestNode2 = minBy(jsonData, r => r.year2)
	const oldestNode1 = minBy(jsonData, r => r.year1)
	var oldestNodeId; 
	 if (oldestNode1.year1 = oldestNode2.year2) {
		if (oldestNode2.TypeRel.includes('trans')) oldestNodeId = oldestNode2.IDBook2; else oldestNodeId = oldestNode1.IDBook1; 
	 } else  oldestNodeId = oldestNode2.year2 < oldestNode1.year1?oldestNode2.IDBook2:oldestNode1.IDBook1;

	jsonData.forEach(record => {
	  // Extract book IDs and other relevant data
	 
	  const idBook1 = record.IDBook1;
	  const idBook2 = record.IDBook2;
	  const title1 = record.title1 || `Book ${idBook1}`;
	  const title2 = record.title2 || `Book ${idBook2}`;
	  const authors1 = record.authors1 || '';
	  const authors2 = record.authors2 || '';
	  const year1 = record.year1 || '';
	  const year2 = record.year2 || '';
	  const lang1 = record['Lang1'] || '';
	  const lang2 = record['Langl2'] || '';
	  const typeRel = record.TypeRel || 'related';
  
	  // Add node for IDBook1 if not already added
	  if (!nodesMap.has(idBook1)) {
		nodesMap.set(idBook1, true);
		elements.push({
		  data: {
			id: `book${idBook1}`,
			label: `${title1} (${lang1}, ${year1})`,
			authors: authors1,
			originalId: idBook1
		  }
		});
	  }
  
	  // Add node for IDBook2 if not already added
	  if (!nodesMap.has(idBook2)) {
		nodesMap.set(idBook2, true);
		elements.push({
		  data: {
			id: `book${idBook2}`,
			label: `${title2} (${lang2}, ${year2})`,
			authors: authors2,
			originalId: idBook2
		  }
		});
	  }
  
	  // Add edge representing the relationship
	  if (!typeRel.includes("source")) { elements.push({
		data: {
		  id: `edge${idBook1}-${idBook2}`,
		  source: `book${idBook1}`,
		  target: `book${idBook2}`,
		  label: typeRel
		}
	  })
	   edgeMap.set(`edge${idBook1}-${idBook2}`, true) 
	  };
	});
  
	jsonData.forEach(record => {
		// Extract book IDs and other relevant data
	   
		const idBook1 = record.IDBook1;
		const idBook2 = record.IDBook2;
		const title1 = record.title1 || `Book ${idBook1}`;
		const title2 = record.title2 || `Book ${idBook2}`;
		const authors1 = record.authors1 || '';
		const authors2 = record.authors2 || '';
		const year1 = record.year1 || '';
		const year2 = record.year2 || '';
		const typeRel = record.TypeRel || 'related';
	
	
		// Add edge representing the relationship
		if (! (edgeMap.has(`edge${idBook1}-${idBook2}`) || edgeMap.has(`edge${idBook2}-${idBook1}`))) { elements.push({
		  data: {
			id: `edge${idBook1}-${idBook2}`,
			source: `book${idBook1}`,
			target: `book${idBook2}`,
			label: typeRel
		  }
		})
		 edgeMap.set(`edge${idBook1}-${idBook2}`, true) 
		};
	  });

	return [elements, oldestNodeId];
  }


  const nodeStyle0 = `{
	selector: 'node',
	style: {
	  'label': 'data(label)',
	  'background-color': '#0074D9'
	}
  }`

   const nodeStyle = `{
	"selector": "node",
	"style": {
	  "label": "data(label)",
	  "text-wrap": "wrap",
	  "text-max-width": "12em",  // Adjust this value to set the max width of the label
	  "text-valign": "center",
	  "text-halign": "center",
	  "text-margin-x": "5px",
	  "text-margin-y": "5px",
	  "text-outline-color": "#ffffff",
	  "text-outline-width": 1,
	  "text-justification": "left",
	  "shape": "ellipse",  // Or another shape depending on your preference
	  "background-color": "#6FB1FC",
	  "border-width": 2,
	  "border-color": "#1C3F95",
	  "padding": "5px",
	  "text-before-edge": "\u2022 "  // Adds a bullet point before the text
	}
  }`


  function  thisNodeStyle(id)  { return `  {
    selector: '#book${id}',
    style: {
	  'font-style' : 'italic',
	  'text-decoration': 'underline'        
    }
  }`
}

function  oldNodeStyle(id)  { return `  {
    selector: '#book${id}',
    style: {
      'background-color': '#00CC00' 
    }
  }`
}


  const style =  `{
	selector: 'edge',
	style: {
	  'label': 'data(label)',
	  'width': 2,
	  'text-rotation': 'autorotate',
	  'line-color': '#ccc',
	  'target-arrow-color': '#888',
	  'target-arrow-shape': 'triangle',
	  'curve-style': 'bezier',
	  'arrow-scale': 1.5 // Adjusts arrowhead size
	}
  }`

  const style0 = `{
	selector: 'edge',
	style: {
	  'label': 'data(label)',
	  'line-color': '#FF4136',
	  'target-arrow-color': '#FF4136',
	  'target-arrow-shape': 'triangle'
	}
  }`

function cytoCode(elements, nodeId, oldestID) {
	const template = `
	<div id="cy" style="width: 1000px; height: 700px;"></div>

<script>
 
    var cy = cytoscape({
      container: $('#cy'),

      elements: ${elements},
	  
      layout: {
		name: 'circle'
	  },

      style: [
        ${nodeStyle},
        ${style},
		${thisNodeStyle(nodeId)},
		${oldNodeStyle(oldestID)}
      ]
    });
  
</script>`
  return template
}


function display_detailed_info(口) {
	
	var shortTitle = 口("TitleShort");
	var longTitle = 口("TitleLong");
	var colophon = 口("ColophonTxt");
	var year = 口("Year")
	var place = 口("Place")
	var edition = 口("Edition")
	var authors = 口("authors")  // maar die zijn overschreven ...........
    var id =  口("IDBook")
	authors = authors instanceof Object? authors :  parse_json(authors.replace(/.*<div/, "<div").replace(":none", ":block"));

	authors_or_translators = authors.filter(x => x["relation"] == 'Author' || x["relation"] == 'Translator')
	authors_or_translators_compact = display_authors_and_translators(authors_or_translators)

	var related_books = 口("related_books")  // maar die zijn overschreven ...........
	related_books = related_books instanceof Object? related_books : parse_json(related_books.replace(/.*<div/, "<div").replace(":none", ":block"));


	var titleGroup = `
						                 <div style="width:50%"><div style="font-style:italic">${longTitle}</div>
										 <div style="margin-top:1em">${authors_or_translators_compact}</div></div>
										 <div style="margin-top:1em">${place}, ${year}</div></div>
						                
										 <div style="margin-top:1em">Edition: ${edition}</div>
										 <div  style="margin-top:1em">${colophon}</div>
										 <div  style="margin-top:1em">database id: ${id}</div>
										 `



	//console.log(authors)


	//console.log(related_books)


	function displayIt(resp) {
		console.log(`RESP(${id})=` + resp)
		var oTabNames_2_HtmlContent; 
		try {
		 var x = JSON.parse(resp["get_net"]) 
		 const y = x.map(JSON.stringify).join("<br>")
		 const cyto = jsonToCytoscape(x);
		 const cytodata = cyto[0];
		 const nNodes = cytodata.filter(x => !('target' in x["data"])).length
		 console.log("Cytodata:")
		 console.log(JSON.stringify(cytodata[0]))
		 const oldestID = cyto[1];
		 const cytospul = cytoCode(JSON.stringify(cytodata), id, oldestID) 
		 const t4 = `Network of titles (${nNodes} books)`
		 var oTabNames_2_HtmlContent = {
			"Title information": titleGroup,
			"Persons involved in creation": display_authors_compact(authors),
			"Directly related titles": display_relations(related_books),
			[t4] : cytospul
		};
		}
		 catch {
		
	
			oTabNames_2_HtmlContent = {
			   "Title information": titleGroup,
			   "Persons involved in creation": display_authors_compact(authors),
			   "Directly related titles": display_relations(related_books)
		   };
		 }

        

	
		fn.showTabs("Details", `detailed display for <i>${shortTitle}</i>`, oTabNames_2_HtmlContent);
	}

	fn.callFunction("get_net", [id], displayIt)
	
}