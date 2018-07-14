var toggleDropdown = function(event) {
  var siblings = event.currentTarget.parentElement.children;
  var content = siblings[siblings.length-1];
  content.classList.toggle('show');
}
