Handlebars.registerHelper('first', function(items, options) {
  return items[0];
});

Handlebars.registerHelper('currentPage', function(items, options) {
  currentPage = ShoppingCartPlugin.currentPage;
  productsPerPage = ShoppingCartPlugin.productsPerPage;
  numOnPreviousPages = (currentPage-1)*productsPerPage;
  return items.slice(numOnPreviousPages, numOnPreviousPages+productsPerPage);
});

Handlebars.registerHelper("each_with_index", function(array, options) {
  var buffer = "";
  for (var i = 0, j = array.length; i < j; i++) {
    var item = array[i];
 
    // stick an index property onto the item, starting with 1, may make configurable later
    item.index = i+1;
 
    // show the inside of the block
    buffer += options.fn(item);
  }
 
  // return the finished buffer
  return buffer;
 
});

Handlebars.registerHelper("each_on_current_page", function(array, options) {
  var buffer = "";
  currentPage = ShoppingCartPlugin.currentPage;
  productsPerPage = ShoppingCartPlugin.productsPerPage;
  startIndex = (currentPage-1)*productsPerPage;
  endIndex = startIndex + productsPerPage;
  for (var i = 0, j = array.length; i < j; i++) {
    var item = array[i];
    
    if (startIndex <= i && i < endIndex) {
      buffer += options.fn(item);
    }
  }
 
  // return the finished buffer
  return buffer;
 
});