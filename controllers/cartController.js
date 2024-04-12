const { Product } = require("../models/productSchema");
const { Cart } = require('../models/cartSchema');
const { Category } = require("../models/categorySchema");
const { User } = require("../models/userSchema");
const { Address } = require("../models/addressSchema");
const { userSessionCheck } = require("../middlewares/middleware");
const Wallet = require("../models/walletSchema");

// -------------------------------------------------------------
// =========================== USER  SIDE======================>
// -------------------------------------------------------------


// -----------PRODUCT ADD TO CART ----------------->
module.exports.productAddToCart = async (req, res) => {
  try {
    const prodId = req.params.id;
    const userId = req.session.user._id;
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({
        userId: userId,
        items: [],
        totalPrice: 0,
      });
      await cart.save();
    }
    const product = await Cart.findOne({ userId }).populate(
      "items.product"
    );
    let total = 0;
    let subtotals = [];
    if (product) {
      console.log(product);
      subtotals = product.items.map((item) => {
    if (item.product) {
          return {
            productId: item.product._id,
            subtotal: item.product.price * item.quantity,
          };
    } else {
          console.log("Invalid product in cart item:", item);
          return null;
           }
      });
    } else {
      console.log("No items in the cart");
    }
    const validSubtotals = subtotals.filter((subtotal) => subtotal !== null);
    const subtotalPrices = validSubtotals.map((item) => item.subtotal);
    total = subtotalPrices.reduce((acc, item) => acc + item, 0);
    // Check if the product is already in the cart
    const existingCartItem = cart.items.find((item) =>
      item.product.equals(prodId)
    );
    // Calculate the price of the newly added item
    const newProduct = await Product.findById(prodId);
  if (existingCartItem) {
      existingCartItem.quantity += 1;
      existingCartItem.subtotal += newProduct.price;
  } else {
      cart.items.push({
        product: prodId,
        quantity: 1,
        subtotal: newProduct.price,
                      });
         }
    cart.totalPrice = total + newProduct.price;
    await cart.save();
    res.redirect("/product-detail?id=" + prodId);
  } catch (error) {
    console.log("Try catch error in ProductAddToCart 🤷‍♂📀🤷‍♀");
    console.log(error.message);
  }
};


// -----------CART PAGE RENDERING ----------------->
module.exports.cartPage = async (req, res) => {
  try {
    const userId = req.session.user._id;
    // Fetch all categories
    const category = await Category.find({ active: true });
    const cart = await Cart.findOne({ userId: userId }).populate('items.product');
    const productId = req.query.productId;
    // const cartId = cart._id;
    console.log('userId:', userId);
    console.log('category:', category);
    console.log('cart:', cart);
    res.render('user/shopCart', { category: category, user: userId, cart: cart });
  } catch (error) {
    console.error('Error in cartPage:', error);
    res.status(500).send('Internal Server Error');
  }
};


// -----------DELETE CART ITEM ----------------->
module.exports.removeCartItem = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.session.user._id;
    const cart = await Cart.findOne({ userId: userId }).populate('items.product');
    let productIndex = -1; // Declare productIndex outside the if statement
     if (cart) {
      productIndex = cart.items.findIndex((item) => item.product._id.toString() === id);
    }
     if (productIndex !== -1) {
      cart.items.splice(productIndex, 1);
      await cart.save();
      return res.redirect('/cart'); // Return the response after redirect
    } else {
      console.log("Product not found in the cart.");
      return res.send("Product not found in the cart.");
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).send("Internal Server Error");
  }
}


// -----------CHECKOUT PAGE RENDERING ----------------->
module.exports.checkout = async (req, res) => {
  try {
    const userId = req.session.user._id;
    const user = await User.findById(userId).populate('address'); // Use findById instead of find
    const addresses = await Address.find({ userId: userId });
    const wallet = await Wallet.findOne({userId: userId})
    const category = await Category.find({ active: true });
    const cart = await Cart.findOne({ userId: userId }).populate({path: 'items.product', model: 'Product',});
    console.log('Address', addresses);
    // Render the checkout page with user's addresses
    res.render('user/checkout', { cart: cart, addresses: addresses, category: category, user, wallet: wallet });
  } catch (error) {
    console.error('Error in cartPage:', error);
    res.status(500).send('Internal Server Error');
  }
}


// -----------DASHBOARD PAGE RENDERING ----------------->
module.exports.changeAddress = async (req, res) => {
  try {
      // Assuming you have a middleware to parse the request body, like body-parser or express.json
      const { name, houseName, postOffice, district, pin } = req.body;
      const userId = req.session.user._id;
       const address = await Address.findOne({ userId: userId })
      if (address) {
           const addressChange = {
              name: req.body.name,
              houseName: req.body.houseName,
              postOffice: req.body.postOffice,
              district: req.body.district,
              pin: req.body.pin
          }
          address.addresses.push(addressChange);
            const save = await address.save();
          if (save) {
              console.log("address pushed sucessfully");
              res.redirect('/checkout'); // Redirect to the user profile page or any other desired page
             } else {
              console.log('error pushing address')
             }
      }
      else {
          const newAddress = new Address({
              userId: userId,
              addresses: [{
                  name: req.body.name,
                  houseName: req.body.houseName,
                  postOffice: req.body.postOffice,
                  district: req.body.district,
                  pin: req.body.pin
              }]
            });

          const saveAddress = await newAddress.save();
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
  }
};


// -----------ADDRESS CHANGE RENDERING ----------------->
module.exports.addressChange = async (req, res) => {
  const category = await Category.find({ active: true });
  res.render('user/changeAddress',{category});
}


// -----------CHECKOUT ADDRESS CHANGE RENDERING ----------------->
module.exports.updateAddressChange = async (req, res) => {
  try {
      const id = req.session.user._id;
      const userAddress = await Address.findOne({ userId: id });
      const addressId = req.params.id
      if (userAddress) {
          //update the existing address information
      const editAddressChange = await Address.updateOne({ "addresses._id": addressId }, {
              $set: {
                  "addresses.$.name": req.body.name,
                  "addresses.$.houseName": req.body.houseName,
                  "addresses.$.postOffice": req.body.postOffice,
                  "addresses.$.district": req.body.district,
                  "addresses.$.pin": req.body.pin
              }
          })
          //Redirect to a page indicating succesful updtae or render the address page
          if (editAddressChange) {
              res.redirect('/checkout');
          } else {
              console.log('error editing &  saving address');
          }
      }
  } catch (error) {
      console.error(error.message);
      res.status(500).send("internal server error")
  }
}


// -----------QUANTITY UPDATE ----------------->
module.exports.updateQuantity = async (req, res) => {
  try {
    const userId = req.session.user._id;
    const { productId, quantity, totalPrice } = req.body;
    const cart = await Cart.findOneAndUpdate(
      { userId: userId, "items.product": productId },
      { $set: { "items.$.quantity": quantity, totalPrice: totalPrice },}, );
    const prodId = await Product.findOne({ _id: productId });
    const stock = prodId.stock;
    await prodId.save();
    const user = req.session.user;
    const product = await Cart.findOne({ userId: user._id }).populate(
      "items.product"
    );
    const subtotals = product.items.map((item) => {
      return {
        productId: item.product._id,
        subtotal: item.product.price * item.quantity,
      };
    });
     if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Product not found in the cart",
      });
    }
    const quantityrsp = parseInt(quantity);
    res.json({
      success: true,
      message: "Cart updated successfully",
      subtotal: subtotals,
      stock: stock,
      quantity: quantityrsp,
      prodId: productId,
    });
  } catch (error) {
    console.log("Try catch error in updateQuantity");
    console.log(error.message);
  }
};




