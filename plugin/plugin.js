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
      allowedContent:
          'div(!shopping-cart); select(!shopping-cart-categories);',

      requiredContent: 'div(shopping-cart)',

      template: '<div class="shopping-cart">' + 'loadingGif' + '</div>',

      upcast: function( element ) {
        console.log(element.name);
        return element.name == 'div' && element.hasClass( 'shopping-cart' );
      },
      init: function(){
      //stubs for local testing
      ShoppingCartPlugin.getProductsXML = function(AI, successCallback){
        data = Handlebars.templates.productsxml();
        ShoppingCartPlugin.productsCallback(data);
        ShoppingCartPlugin.insertIntoDiv();
      };
      ShoppingCartPlugin.getCategoriesXML = function(AI, successCallback){
        data = Handlebars.templates.categoriesxml();
        ShoppingCartPlugin.categoriesCallback(data);
        ShoppingCartPlugin.insertIntoDiv();
      };
      SCVOAccountID = 'D4874F13-9422-4C3B-B734-E117495A9BAE';

      divToInsert = $(this.element.$);
      ShoppingCartPlugin.initialize(SCVOAccountID, divToInsert);

      }
    });

    editor.ui.addButton( 'ShoppingCart', {

      // The text part of the button (if available) and tooptip.
      label: 'Insert Shopping Cart',

      // The command to execute on click.
      command: 'shoppingcart',

      // The button placement in the toolbar (toolbar group name).
      toolbar: 'insert'
    });
  }
} );