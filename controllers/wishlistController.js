const { Cart } = require("../models/cartSchema");
const { Category } = require("../models/categorySchema");
const { Product } = require("../models/productSchema");
const { Wishlist } = require("../models/wishlistSchema");


const getCategory = async function () {
  try {
    const categories = await Category.find({active: true});
    if (categories.length > 0) {
      return categories;
    } else {
      throw new Error("Couldn't find categories");
    }
  } catch (error) {
    console.log(error.message);
  }
};

//////////////////////////////////////////////////////////////////user side///////////////////////////////////////
module.exports.productAddToWishlist = async (req, res) => {
    try {
      const prodId = req.params.id;
      const userId = req.session.user._id;
  
      const wishlist = await Wishlist.findOne({ userId: userId });
      const existingProduct = wishlist
        ? wishlist.items.find((item) => item.product == prodId)
        : null;
  
      if (existingProduct) {
        console.log("Product already exists in the wishlist");
      } else {
        if (wishlist) {
          wishlist.items.push({
            product: prodId,
          });
  
          await wishlist.save();
        } else {
          const newWishlist = new Wishlist({
            userId: userId,
            items: [
              {
                product: prodId,
              },
            ],
          });
  
          await newWishlist.save();
        }
  
        console.log("Product saved to wishlist ");
      }
  
      res.redirect("/product-detail?id="+ prodId);
    } catch (error) {
      console.log("Try catch error in productAddToWishlist ");
      console.log(error.message);
      res.status(500).send("Internal Server Error"); // Add a proper error response
    }
};
  
module.exports.wishlistPage = async (req, res) => {
    try {
      const id = req.session.user._id;
      const user = req.session.user
  
      const wishlist = await Wishlist.findOne({ userId: id }).populate(
        "items.product"
      );
  
      const category = await getCategory();

      console.log(wishlist);
  
      res.render("user/wishlist", { product: wishlist, user: user, category});
    } catch (error) {
      console.log("Try catch error in wishlistPage ");
      console.log(error.message);
    }
};
  
module.exports.removeWishlistProduct = async (req, res) => {
    try {
      const id = req.session.user._id;
      const user = req.session.user;
  
      const wishlist = await Wishlist.findOne({ userId: id }).populate(
        "items.product"
      );
  
      if (wishlist) {
        var productIndex = wishlist.items.findIndex((item) => item.product._id);
      }
  
      wishlist.items.splice(productIndex, 1);
  
      await wishlist.save();
  
      res.redirect("/user/wishlist");
    } catch (error) {
      console.log("Try catch error in removeWishlistProduct ");
      console.log(error.message);
    }
};
 
module.exports.wishlistToCart = async (req, res) => {
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

    res.redirect("/wishlist");
  } catch (error) {
    console.log("Try catch error in ProductAddToCart 🤷‍♂📀🤷‍♀");
    console.log(error.message);
  }
};


module.exports.removeWishlistItem = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = req.session.user._id;

    const wishlist = await Wishlist.findOne({ userId: userId }).populate('items.product');

    let productIndex = -1; // Declare productIndex outside the if statement

    if (wishlist) {
      productIndex = wishlist.items.findIndex((item) => item.product._id.toString() === id);
    }

    if (productIndex !== -1) {
      wishlist.items.splice(productIndex, 1);
      await wishlist.save();
      return res.redirect('/wishlist'); 
    } else {
      console.log("Product not found in the wishlist.");
      return res.send("Product not found in the wishlist.");
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).send("Internal Server Error");
  }
}
  