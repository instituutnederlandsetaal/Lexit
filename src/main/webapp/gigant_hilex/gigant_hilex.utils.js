
var hilexutils = {};


// make sure commas are set right, like a space after, but no space before
hilexutils.setCommasRight = function(x){
	return x.replace(/,([^ ])/g, ", $1").replace(/([ ]+),/g, ",").replace(/,([ ]+)/g, ", ");
}


