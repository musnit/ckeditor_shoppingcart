ShoppingCartPlugin = {
  currentPage: 1,
  productsPerPage: 8,
  initialize: function(AI, divToInsert){
    this.AI = AI;
    this.divToInsert = divToInsert;
    this.getProductsXML(AI);
    this.getCategoriesXML(AI);
  },
  productsCallback: function(data){
    this.productsJSON = jQuery.xml2json(data);
    this.products = this.productsJSON.products.Product;
  },
  categoriesCallback: function(data){
    this.categoriesJSON = jQuery.xml2json(data);
    this.categories = this.categoriesJSON.data.Categories.Category;
    this.currentCategory = this.categories[0];
    this.currentCategory.isCurrentCategory = true;
  },
  getProductsXML: function(AI){
    shoppingCart = this;
    $.ajax({
        type: 'POST',
        url: 'http://www.awesomedemosite.com/virtualoffice/menuEngine/getproductsgeneral.asp',
        processData: false,
        contentType: 'application/x-www-form-urlencoded',
        async: false,
        data: 'AI=' + AI,
        success: function(data) {
          shoppingCart.productsCallback(data);
          shoppingCart.insertIntoDiv();
        },
        error:function (xhr, ajaxOptions, thrownError){
            alert(xhr.status);
            alert(thrownError);
        }
    });
  },
  getCategoriesXML: function(AI, successCallback){
    shoppingCart = this;
    $.ajax({
        type: 'POST',
        url: 'http://www.awesomedemosite.com/virtualoffice/menuEngine/getproductcatsgeneral.asp',
        processData: false,
        contentType: 'application/x-www-form-urlencoded',
        async: false,
        data: 'AI=' + AI,
        success: function(data) {
          shoppingCart.categoriesCallback(data);
          shoppingCart.insertIntoDiv();
        },
        error:function (xhr, ajaxOptions, thrownError){
            alert(xhr.status);
            alert(thrownError);
        }
    });
  },
  getProductsForCategory: function(category){
    return this.products.filter(function(product){
      if (product.Categories.CategoryID === ShoppingCartPlugin.currentCategory.ProdCatID){
        return true;
      }
      return false;
    });
  },
  dataIsLoaded: function(){
    return this.categories && this.products;
  },
  insertIntoDiv: function() {
    if(this.dataIsLoaded()){
      this.currentProducts = this.getProductsForCategory(this.currentCategory);
      this.divToInsert.html(Handlebars.templates.cart(this));
    }
  },
  changePage: function(pageNumber){
    this.currentPage = pageNumber;
    this.insertIntoDiv();
  },
  changeCategory: function(select){
    this.currentCategory.isCurrentCategory = false;
    this.currentCategory = this.categories.filter(function(category){
      if (select.value === category.ProdCatID){
        return true;
      }
      return false;
    })[0];
    this.currentCategory.isCurrentCategory = true;
    this.currentPage = 1;

    this.insertIntoDiv();
  }
};