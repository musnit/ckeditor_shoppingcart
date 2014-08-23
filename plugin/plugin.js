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

      template: '<div class="shopping-cart"></div>',

      upcast: function( element ) {
        return element.name == 'div' && element.hasClass( 'shopping-cart' );
      },
      init: function(){
        divToInsert = $(this.element.$);
        ShoppingCartPlugin.CKEditorWidget = this;
        ShoppingCartPlugin.initialize(SCVOAccountID, divToInsert);
      },
      editables: {
        category: {
            selector: '.shopping-cart-categories'
        }
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

    //stubs for local testing
    if(typeof Build === 'undefined'){
      CreateCartAnimations = function(){ console.log('creating cart animations...');};
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
    }

    editor.addCommand('openEcommerceSettingsModal', {
      exec: function(editor) {
        $("#buildModal").buildModal({action: "show", contentURL: "../../../../Content/includes/buildmodal-include-ecommercesettings.html"});
      }
    });
    editor.addCommand('openCategoriesModal', {
      exec: function(editor) {
      $("#buildModal").buildModal({action: "show", contentURL: "../../../../Content/includes/buildmodal-include-ecommercecategories.html"});
      }
    });
    editor.addCommand('openProductsModal', {
      exec: function(editor) {
      $("#buildModal").buildModal({action: "show", contentURL: "../../../../Content/includes/buildmodal-include-ecommerceproducts.html"});
      }
    });
    editor.addCommand('openShippingModal', {
      exec: function(editor) {
      $("#buildModal").buildModal({action: "show", contentURL: "../../../../Content/includes/buildmodal-include-ecommerce-shipping.html"});
      }
    });

    if (editor.addMenuItem) {
      editor.addMenuGroup('shoppingcart');

      editor.addMenuItem('openEcommerceSettingsModalitem', {
        label: 'Ecommerce Settings',
        command: 'openEcommerceSettingsModal',
        group: 'shoppingcart'
      });
      editor.addMenuItem('openCategoriesModalitem', {
        label: 'Categories',
        command: 'openCategoriesModal',
        group: 'shoppingcart'
      });
      editor.addMenuItem('openProductsModalitem', {
        label: 'Products',
        command: 'openProductsModal',
        group: 'shoppingcart'
      });
      editor.addMenuItem('openShippingModalitem', {
        label: 'Shipping',
        command: 'openShippingModal',
        group: 'shoppingcart'
      });
    }

    if (editor.contextMenu) {
      editor.contextMenu.addListener(function(element, selection) {
        if (element && element.$ && element.$.firstChild && element.$.firstChild.getAttribute && element.$.firstChild.getAttribute('data-widget') === 'shoppingcart'){
          return {
            openCategoriesModalitem: CKEDITOR.TRISTATE_ON,
            openProductsModalitem: CKEDITOR.TRISTATE_ON,
            openEcommerceSettingsModalitem: CKEDITOR.TRISTATE_ON,
            openShippingModalitem: CKEDITOR.TRISTATE_ON
          };
        }
        else{
          return null;
        }
      });
    }

  }
} );