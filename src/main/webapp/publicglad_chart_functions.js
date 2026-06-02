let googly = [0,1];
let googol = () => googly[0];
let toDataTable = d => v[1].arrayToDataTable(d)

function createStatsPopup(id, style_parameters) {
    
		var languageChartHtml = "<div class='chart_container' style='background-color: white; width: 800px; height: 600px'>"+
				   				"<canvas style='background-color: white; width: 800px; height: 600px' id='language_chart'></canvas>"+
								   "</div>";
								   
		var borrowingChartHtml = "<div class='chart_container' style='vertical-align: bottom; align-self: flex-end; background-color: white; width: 400px; height: 600px'>"+
				   				"<canvas style='background-color: white; width: 400px; height: 600px' id='borrowing_chart'></canvas>"+
								   "</div>";
								   
		var languageBorrowingChartHtml = "<div class='chart_container' style='background-color: white; width: 800px; height: 600px'>"+
				   "<canvas style='background-color: white; width: 800px; height: 600px' id='language_borrowing_chart'></canvas>"+
				   "</div>";


		var posChartHtml = "<div class='chart_container' style='background-color: white; width: 800px; height: 600px'>"+
				   "<canvas style='background-color: white; width: 800px; height: 600px' id='pos_chart'></canvas>"+
				   "</div>";

		var oTitles2HtmlContent = {
			"Language Chart": languageChartHtml,
			"Borrowing Chart": borrowingChartHtml,
			"Language Borrowing Chart": languageBorrowingChartHtml,
			"Pos Chart": posChartHtml
		};

		// build the tabs dialog
		fn.showTabs("Statistics", "", oTitles2HtmlContent, null, {"width": "50%"});

		// set the position after it's displayed
		setTimeout(function(){
			var dialogWidth = parseInt( $("div[aria-describedby^='dialog-message']").css("width") );
			var dialogHeight = parseInt( $("div[aria-describedby^='dialog-message']").css("height") );
			$("div[aria-describedby^='dialog-message']").css("position", "absolute").css("top", "50%").css("left", "50%").css("margin", "-"+(dialogHeight/2)+"px 0 0 -"+(dialogWidth/2)+"px");
		}, 300);
		
}


		 
function setDivFocusActions() {
			
	const table_divjes = find_divjes();

	for (i in table_divjes) {
		const div_id = table_divjes[i]
		const divje = document.getElementById(div_id)
		// console.log (`set focus function for ${div_id}: ${divje}`)
		$(divje).click(function(){
				console.log(`Focus function called for ${div_id}`)
				for (j in table_divjes)
				{
						const did = table_divjes[j]
						const d = document.getElementById(did)
						if (d != null)
							d.style["z-index"] = 100
				}
				divje.style["z-index"] = 1000
		});
	}
}

function find_divjes() {

	const all_divs = document.getElementsByTagName("div");
	dinges = [];
	for (di in all_divs) {
		const d = all_divs[di]
		//fn.message("OK", d)
		console.log("d=" + d)
		if (d.getAttribute != null) {
		const id = d.getAttribute('id')
		
		if (id != '' && id != null)  {
			// console.log("id=" + id)
			dinges.push(id)
		   }
		 }
	}
	return dinges;
}



// call a Psql function
//
 function call_function(function_name, args, callback) {

	const a0 = args.map(x => fn.quote(x));
	
    fn.callFunction("api." + function_name, a0,
      function (func_resp) {
	
		var para = (func_resp[function_name])
	
        callback(JSON.parse(para))
    });
}


function maxbutton(div_id) {
	const divje = document.getElementById(div_id)
	const knopdiv = document.createElement("div")
	knopdiv.innerHTML = `<span style='color: white'>Statistics</span>`
	knopdiv.setAttribute('style', 'text-align: right; background-color: darkblue')
	knopdiv.style.textAlign = right
	divje.prepend(knopdiv)


	const knopje = document.createElement("span")


	knopje.innerHTML = `<span style='border-style: outset; background-color: pink'>&nbsp;+/-&nbsp;</span>`
	//fn.message("OK", knopje.innerHTML)
	knopje.onclick = x => {
		if (divje.style.width == '100%') {
		  minimize()
		} else maximize()
	}
	
	knopdiv.appendChild(knopje)

	const knopje1 = document.createElement("span")


	knopje1.innerHTML = `<span style='border-style: outset; background-color: red'>&nbsp;x&nbsp;</span>`
	//fn.message("OK", knopje.innerHTML)
	knopje1.onclick = x => {
		hide_info_div()
	}
	
	knopdiv.appendChild(knopje1)
}

const d0 = [
	['Opening Move', 'Percentage'],
	["King's pawn (e4)", 44],
	["Queen's pawn (d4)", 31],
	["Knight to King 3 (Nf3)", 12],
	["Queen's bishop pawn (c4)", 10],
	['Other', 3]
];


const _labels = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
  ];

const _datasets =  [{
	label: 'My First dataset',
	backgroundColor: 'rgb(255, 99, 132)',
	borderColor: 'rgb(255, 99, 132)',
	data: [0, 10, 5, 2, 20, 30, 45],
  }]

  const setBg = () => {
	const randomColor = Math.floor(Math.random()*16777215).toString(16);
	document.body.style.backgroundColor = "#" + randomColor;
	color.innerHTML = "#" + randomColor;
  }

function randColor() {
	const randomColor = Math.floor(Math.random()*16777215).toString(16);
	return "#" + randomColor;
}

function pickColors(a)  {
  const r =  a.map(x => {
	const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16);
	return randomColor
  })
 
  return r
}
function drawStuff(labels, datasets, canvas_id, stacked=false) {

	  const data = {
		labels: labels,
		datasets: datasets
	  };
	  const config = {
		type: 'bar',
		data: data,

		options: {
			responsive: true,
			maintainAspectRatio: true
		}
	  };
	  if (stacked) {
		  config.options['scales'] = {
			  x : { stacked : true},
			  y : { stacked : true },
			  xAxes: [{ // dit werkt niet zo te zien...
				categoryPercentage: 1.0,
				barPercentage: 1.0
			}]
		  }
	  }

	  canvas = document.getElementById(canvas_id)
	  canvas_parent = canvas.parentNode
	  html = canvas_parent.innerHTML
	  $(canvas_parent).empty()
	  canvas_parent.innerHTML = html
	  const context = canvas.getContext('2d');
      context.clearRect(0, 0, canvas.width, canvas.height);
	  $(canvas).empty()
	  canvas.innerHTML=''
	  const myChart = new Chart(
		document.getElementById(canvas_id),
		config
	  );
      // alert(JSON.stringify($(canvas).children()))
	  canvas.style.width = '1000px'
	  canvas.style.height = '600px'
}




function loadCharts() {
  $.getScript("https://cdn.jsdelivr.net/npm/chart.js", () => {
	 //drawStuff(_labels, _datasets);
  })  
}

function simpleBarChart(data, labelField, canvas_id) {
  
  const labels = data.map(d => d[labelField])
  const dataset = { label: labelField, backgroundColor : pickColors(data), data: data.map(d => d['count'])}
  $.getScript("https://cdn.jsdelivr.net/npm/chart.js", () => {
	drawStuff(labels, [dataset], canvas_id);
 })  
}

var charts_loaded = false;

function stackedBarChart(data, labelField, otherField, canvas_id) {

	const values = Array.from(new Set(data.map(d => d[otherField])))
	const labels = Array.from(new Set(data.map(d => d[labelField])))
	const colors = pickColors(values)
    console.log(JSON.stringify(data))
    const datasets = values.map(
		v =>  { 
			const color = randColor()
			const d = {
				backgroundColor: color,
				label: v,
			   	data: labels.map(l => {
					const relevantCells = data
						.filter(d => d[labelField] == l && d[otherField] == v)
						.map(x => x['count'])
					const count = relevantCells.length > 0? relevantCells[0] : 0
					return count
			   })
		   } 
		return d
	})

	datasets.forEach(d => console.log(JSON.stringify(d)))
	//var data1 = data.map(d => [d[labelField],d['count']])
	//var header = labelFields.push('count')
	//data1.unshift(header) 
	// alert(JSON.stringify(data1))
    if (charts_loaded) {
		drawStuff(labels, datasets, canvas_id,true);
	} else
	$.getScript("https://cdn.jsdelivr.net/npm/chart.js", () => {
	  //charts_loaded = true;
	  drawStuff(labels, datasets, canvas_id, true);
   })  
  }
