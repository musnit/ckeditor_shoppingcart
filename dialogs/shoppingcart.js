CKEDITOR.dialog.add( 'shoppingcart', function( editor ) {
    return {
        title: 'Edit Shopping Cart',
        minWidth: 200,
        minHeight: 100,
        contents: [
            {
                id: 'info',
                elements: [
                    // Dialog window UI elements.
                    {
                        id: 'theme',
                        type: 'select',
                        label: 'Theme',
                        items: [
                            [ 'Light', 'light-theme' ],
                            [ 'Dark', 'dark-theme' ],
                            [ 'Blue', 'blue-theme' ],
                            [ 'Red', 'red-theme' ],
                            [ 'Pink', 'pink-theme' ]
                        ],
                        setup: function( widget ) {
                            this.setValue( ShoppingCartPlugin.theme );
                        },
                        commit: function( widget ) {
                            ShoppingCartPlugin.theme = this.getValue();
                            widget.setData( 'theme', this.getValue() );
                        }
                    }
                ]
            }
        ]
    };
} );