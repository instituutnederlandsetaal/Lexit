function moveTableToDiv(table_name, div) {
   var wrapper = document.getElementById(table_name + '_wrapper')
   var parent = wrapper.parentElement
   parent.removeChild(wrapper)
   div.appendChild(wrapper)
   parent.parentElement.removeChild(parent)
}

function testMove() {
  setTimeout(function() {
     var header = document.getElementById('indicators')
     moveTableToDiv('lemmata', header)
  }, 1000)
}
