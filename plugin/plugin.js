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

      template: '<div class="shoppingcart">' + Handlebars.templates.cart() + '</div>',

      button: 'Add shopping cart',

      upcast: function( element ) {
        return element.name == 'div' && element.hasClass( 'shoppingcart' );
      }
    } );
  }
} );