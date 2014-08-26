Handlebars.registerHelper('first', function(items, options) {
  return items[0];
});

Handlebars.registerHelper('currentCategoryName', function(options) {
  return ShoppingCartPlugin.currentCategory.CatName;
});

Handlebars.registerHelper('theme', function(options) {
  return ShoppingCartPlugin.theme;
});

Handlebars.registerHelper('currentMainImageURL', function(options) {
  return ShoppingCartPlugin.currentMainImageURL;
});

Handlebars.registerHelper("each_next_three", function(array, options) {
  var buffer = "";
  product = ShoppingCartPlugin.currentContext;
  images = product.Images.Image;
  mainImage = ShoppingCartPlugin.currentMainImageURL;
  otherImages = images.filter(function(image){
    if(image === mainImage || image === ""){
      return false;
    }
    return true;
  });
  length = Math.min(otherImages.length, 3);
  for (var i = 0, j = length; i < j; i++) {
    var item = otherImages[i];
    buffer += options.fn(item);
  }
  // return the finished buffer
  return buffer;
});

Handlebars.registerHelper('currentPageProducts', function(items, options) {
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

Handlebars.registerHelper("each_on_current_page_top", function(array, options) {
  var buffer = "";
  currentPage = ShoppingCartPlugin.currentPage;
  productsPerPage = ShoppingCartPlugin.productsPerPage;
  startIndex = (currentPage-1)*productsPerPage;
  endIndex = startIndex + Math.ceil(productsPerPage/2);
  for (var i = 0, j = array.length; i < j; i++) {
    var item = array[i];
    
    if (startIndex <= i && i < endIndex) {
      buffer += options.fn(item);
    }
  }
 
  // return the finished buffer
  return buffer;
 
});
Handlebars.registerHelper("each_on_current_page_bottom", function(array, options) {
  var buffer = "";
  currentPage = ShoppingCartPlugin.currentPage;
  productsPerPage = ShoppingCartPlugin.productsPerPage;
  startIndex = (currentPage-1)*productsPerPage + Math.ceil(productsPerPage/2);
  endIndex = startIndex + Math.floor(productsPerPage/2);
  for (var i = 0, j = array.length; i < j; i++) {
    var item = array[i];
    
    if (startIndex <= i && i < endIndex) {
      buffer += options.fn(item);
    }
  }
 
  // return the finished buffer
  return buffer;
 
});

Handlebars.registerHelper("each_page", function(array, options) {
  var buffer = "";
  currentPage = ShoppingCartPlugin.currentPage;
  productsPerPage = ShoppingCartPlugin.productsPerPage;
  numPages = Math.ceil(array.length/productsPerPage);
  startIndex = (currentPage-1)*productsPerPage + Math.ceil(productsPerPage/2);
  endIndex = startIndex + Math.floor(productsPerPage/2);
  for (var i = 1, j = numPages; i <= j; i++) {
    var item = {pageNumber: i, currentPage: (currentPage === i)};
    buffer += options.fn(item);
  }
 
  // return the finished buffer
  return buffer;
 
});

Handlebars.registerHelper("currency_symbol", function(options) {
  return typeof Build !== 'undefined'? Build.cartPrefix || '$' : '$';
});
