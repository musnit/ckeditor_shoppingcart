ShoppingCartPlugin = {
    currentPage: 1,
    productsPerPage: 9,
    initialize: function(AI, divID, successCallback){
      this.getProductsXML(AI, divInserter);
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
    }
};