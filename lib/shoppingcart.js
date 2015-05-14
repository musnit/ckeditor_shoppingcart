ShoppingCartPlugin = {
  currentPage: 1,
  productsPerPage: 8,
  currentRoute: Handlebars.templates.cart,
  theme: "dark-theme",
  initialize: function(AI, divToInsert){
    this.AI = AI;
    this.divToInsert = divToInsert;
    this.currentContext = this;
    this.getProductsXML(AI);
    this.getCategoriesXML(AI);
    var widget = $('.shopping-cart-widget');
    var classes = widget.attr('class');
    if (classes && classes.includes('light')){
      this.theme = 'light-theme';
    }
  },
  makeCurrentRoute: function(){
    return this.currentRoute(this.currentContext);
  },
  productsCallback: function(data){
    this.productsJSON = jQuery.xml2json(data);
    this.products = this.productsJSON.products.Product;
    if (this.products === undefined){
      this.products = [];
      return;
    }
    if (this.products.constructor !== Array){
      this.products = [this.products];
    }
    this.products.forEach(function(product){
      if(product.ProductSizes && product.ProductSizes.Size){
        if(product.ProductSizes.Size.SizePrice){
          product.OneSizeOnly = true;
          product.lowestPrice = product.ProductSizes.Size.SizePrice;
          product.lowestWeight = product.ProductSizes.Size.SizeWeight;
        }
        else {
          product.ProductSizes.Size = product.ProductSizes.Size.sort(function(sizeA, sizeB){
            return sizeA.SizePrice > sizeB.SizePrice;
          });
          product.lowestPrice = product.ProductSizes.Size[0].SizePrice;
          product.lowestWeight = product.ProductSizes.Size[0].SizeWeight;
          product.lowestSizeName = product.ProductSizes.Size[0].SizeName;
        }
        product.ProductPrice = undefined;
      }
    });
  },
  categoriesCallback: function(data){
    this.categoriesJSON = jQuery.xml2json(data);
    this.categories = this.categoriesJSON.data.Categories.Category;
    if (this.categories === undefined){
      this.categories = [];
      return;
    }
    if (this.categories.constructor !== Array){
      this.categories = [this.categories];
    }
    this.currentCategory = this.categories[0];
    this.currentCategory.isCurrentCategory = true;
  },
  getProductsXML: function(AI){
    shoppingCart = this;
    $.ajax({
        type: 'POST',
        url: '/virtualoffice/menuEngine/getproductsgeneral.asp',
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
        url: '/virtualoffice/menuEngine/getproductcatsgeneral.asp',
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
    cart = this;
    divToFade = this.divToInsert;
    if (this.divToInsert.find('.products').length !== 0){
      divToFade = this.divToInsert.find('.products');
    }
    else if(this.imageChanging){
      divToFade = this.divToInsert.find('.main-photo');
      this.imageChanging = false;
    }
    divToFade.fadeOut(200, function(){
      cart.divToInsert.html(cart.makeCurrentRoute());
      if (cart.CKEditorWidget === undefined){
        CreateCartAnimations();
        insertMagnifier();
      }
      else if (cart.CKEditorWidget.isReady()){
        CreateCartAnimations();
        insertMagnifier();
      }
      else{
        cart.CKEditorWidget.on('ready',function(){
          CreateCartAnimations();
        insertMagnifier();
        });
      }
      cart.divToInsert.fadeIn(200);
    });


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
  },
  changeToProduct: function(product_id){
    this.currentRoute = Handlebars.templates.single_product;
    product = this.products.filter(function(product){
      if (product.id === product_id){
        return true;
      }
      return false;
    })[0];
    this.currentContext = product;
    this.currentMainImageURL = product.Images.Image[0];
    this.insertIntoDiv();
  },
  changeToMain: function(){
    this.currentRoute = Handlebars.templates.cart;
    this.currentContext = this;
    this.insertIntoDiv();
  },
  changeToImage: function(imageURL){
    this.currentMainImageURL = imageURL;
    this.imageChanging = true;
    this.insertIntoDiv();
  },
  selectProduct: function(size){
    var productHTML = size.parentElement.parentElement.parentElement;
    if (!productHTML.classList.contains('simpleCart_shelfItem')){
      productHTML = productHTML.parentElement.parentElement.parentElement;
    }
    sizeDetails = size.selectedOptions[0].text.split(' - ');
    productHTML.getElementsByClassName('chosen-size')[0].innerText = sizeDetails[0];
    productHTML.getElementsByClassName('product-price')[0].innerText = sizeDetails[1];
    var weightText = sizeDetails[2];
    var weight = weightText.substring(0, weightText.length-2);
    productHTML.getElementsByClassName('product-weight')[0].innerText = weight;
  },
  addToSimpleCart: function(clickHTML){

    var productHTML = clickHTML.parentElement.parentElement;
    if (!productHTML.classList.contains('simpleCart_shelfItem')){
      productHTML = productHTML.parentElement.parentElement;
    }
    var thumb = ("" + (productHTML.getElementsByClassName('item_thumb')[0] || {}).src).trim();
    var name = ("" + (productHTML.getElementsByClassName('item_name')[0] || {}).textContent).trim();
    var weight = parseFloat(("" + (productHTML.getElementsByClassName('item_weight')[0] || {}).textContent).trim());
    var size = ("" + (productHTML.getElementsByClassName('item_size')[0] || {}).textContent).trim();
    var price = ("" + (productHTML.getElementsByClassName('item_price')[0] || {}).textContent).trim();
    var quantity = ("" + (productHTML.getElementsByClassName('item_Quantity')[0] || {}).value).trim();

    if (size && size != 'undefined'){
      name = name.trim() + ' - ' + size.trim();
    }

    var id = name + thumb + weight + size + price.replace(/\D/g,'');
    id = id.replace(/ /g,'').replace(/_/g,'').replace(/\n/g,'');

    var oldItem = false;
    simpleCart.each(function(item,x){
      var loopItemID = item.get("name") + item.get("thumb") + item.get("weight") + item.get("size") + ("" + item.get("price")).replace(/\D/g,'');
      loopItemID = loopItemID.replace(/ /g,'').replace(/_/g,'').replace(/\n/g,'');

      if(loopItemID == id){
        oldItem = true;
        item.quantity(item.quantity() + parseInt(quantity));
        return;
      }
    });

    if(oldItem){
      simpleCart.update();
      return;
    }

    simpleCart.add({
        thumb: thumb ,
        name: name ,
        weight: weight ,
        size: size ,
        price: price ,
        quantity: quantity
    });
  }
};

$( document ).ready(function() {
  divToInsert = $('.shopping-cart');
  if(divToInsert.length !== 0){
    ShoppingCartPlugin.initialize(SCVOAccountID, divToInsert);
  }
});
