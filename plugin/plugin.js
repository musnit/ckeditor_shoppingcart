// Register the plugin within the editor.
CKEDITOR.plugins.add( 'shoppingcart', {
  // This plugin requires the Widgets System defined in the 'widget' plugin.
  requires: 'widget',

  // Register the icon used for the toolbar button. It must be the same
  // as the name of the widget.
  icons: 'shoppingcart',

  // The plugin initialization logic goes inside this method.
  init: function( editor ) {
    window.ShoppingCartPlugin = {};
    ShoppingCartPlugin.currentPage = 1;
    ShoppingCartPlugin.productsPerPage = 9;

    // Register the shoppingcart widget.
    editor.widgets.add( 'shoppingcart', {
      // Minimum HTML which is required by this widget to work.
      requiredContent: 'div(shoppingcart)',
      allowedContent: 'div(shoppingcart)',

      template: '<div class="shoppingcart">' + Handlebars.templates.cart(jQuery.xml2json(Handlebars.templates.productsxml())) + '</div>',

      button: 'Add shopping cart',

      upcast: function( element ) {
        return element.name == 'div' && element.hasClass( 'shoppingcart' );
      },

      init: function(){
        //resetFromXML
        //gotoPage...
        ///changedropdown
        //?

    //    loadXml(success {
    //      this.element.$ ... Handlebars.templates.cart(cartJSON); 
    //      this.data('xmlIsLoading', false);
    //    });
       // this.loadFromXML();
      },
      loadFromXML: function(){
        this.setData('xmlIsLoading', true);
        
        AI = 'D4874F13-9422-4C3B-B734-E117495A9BAE';

        log = function(data){
          console.log(data);
        };
        
        this.getCategories(AI, log);

      },
      getCategories: function(AI, successCallback){
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
      }
    } );
  }
} );