// Register the plugin within the editor.
CKEDITOR.plugins.add( 'shoppingcart', {
  // This plugin requires the Widgets System defined in the 'widget' plugin.
  requires: 'widget',

  // Register the icon used for the toolbar button. It must be the same
  // as the name of the widget.
  icons: 'shoppingcart',

  // The plugin initialization logic goes inside this method.
  init: function( editor ) {
    // Register the shoppingcart widget.
    editor.widgets.add( 'shoppingcart', {
      // Minimum HTML which is required by this widget to work.
      requiredContent: 'div(shoppingcart)',
      allowedContent: 'div(shoppingcart)',

      template: '<div id="shoppingcart">' + 'loadingGif' + '</div>',

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

        //test

        widget = this;
        divInserter = function(data){
          $(widget.element.$).html(Handlebars.templates.cart(jQuery.xml2json(data)));
        };

        ShoppingCartPlugin.getProductsXML = function(AI, successCallback){
          data = Handlebars.templates.productsxml();
          successCallback(data);
        };
        AI = 'D4874F13-9422-4C3B-B734-E117495A9BAE';
        //endtest

        divID = 'shoppingcart';

        ShoppingCartPlugin.initialize(AI, divID, divInserter);
      }
    });
  }
} );