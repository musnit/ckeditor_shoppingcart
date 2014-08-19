ShoppingCartPlugin = {
    currentPage: 1,
    productsPerPage: 8,
    initialize: function(AI, successCallback){
      this.AI = AI;
      this.successCallback = successCallback;
      this.getProductsXML(AI, successCallback);
    },
    getProductsXML: function(AI, successCallback){
      $.ajax({
          type: 'POST',
          url: 'http://www.awesomedemosite.com/virtualoffice/menuEngine/getproductsgeneral.asp',
          processData: false,
          contentType: 'application/x-www-form-urlencoded',
          async: false,
          data: 'AI=' + AI,
          success: function(data) {
            successCallback(data);
          },
          error:function (xhr, ajaxOptions, thrownError){
              alert(xhr.status);
              alert(thrownError);
          }
      });
    },
    getCategoriesXML: function(AI, successCallback){
      $.ajax({
          type: 'POST',
          url: 'http://www.awesomedemosite.com/virtualoffice/menuEngine/getproductcatsgeneral.asp',
          processData: false,
          contentType: 'application/x-www-form-urlencoded',
          async: false,
          data: 'AI=' + AI,
          success: function(data) {
            successCallback(data);
          },
          error:function (xhr, ajaxOptions, thrownError){
              alert(xhr.status);
              alert(thrownError);
          }
      });
    },
    changePage: function(pageNumber){
      this.currentPage = pageNumber;
      this.initialize(this.AI, this.successCallback);
    }
};