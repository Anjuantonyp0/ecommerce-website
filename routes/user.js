var express = require('express');
const { signupPage,
     signup,
     verifyOtp,
     loginPage,
     loginVerify,
     home,
     logout,
     otpPage,
     profile,
     editProfile,
     addAddress,
     addressAdd,
     updateProfile,
     changePassword,
     changePasswordPage, 
     editAddressPage,
     updateAddress,
     shop,
     deleteAddress,
     sortSearchFilterPagination,
     getWishlistPage,
     checkWishlist,
     addToWishlist,
     removeFromWishlist } =
     require('../controllers/userController');

const { userSessionCheck,
      blockChecker } =
      require('../middlewares/middleware');

const { categoryList,
     productDetail,
     filterProductAjax,
     searchProducts, 
     productSearch,
     productPaginate,
     productSort} = 
     require('../controllers/productController');

var router = express.Router();
const nocache = require('nocache');

const { productAddToCart,
     cartPage,
     updateQuantity,
     removeCartItem,
     checkout, 
     addressChange,
     changeAddress,
     updateAddressChange} = 
     require('../controllers/cartController');

const { checkoutAjaxAddress,
     vieworderdetails,
     orderCancel,
     PaymentCheckout,
     placeorder,
     verifyPayment,
     returnOrder,
     productReturn,
     SingleOrderDetail,
     allowReturn,
     returnRequest,
     walletPage,
     walletUsage, 
     invoiceDownload,
     paymentfailure,
     paymentfailed} = 
     require('../controllers/orderController');

const { useCoupon, coupons } = require("../controllers/couponController");

const app = express()

const { wishlistPage, 
     productAddToWishlist,
     removeWishlistProduct,
     wishlistToCart, 
     removeWishlistItem} = require("../controllers/wishlistController");
   

router.use(nocache())



router.get('/', signupPage);

router.post('/', signup)

router.get('/login', loginPage)

router.get('/loadOtpPage', otpPage)

router.post("/verify/:userId", userSessionCheck, verifyOtp);


router.post('/loginVerify', loginVerify);

router.use(blockChecker);
router.get('/home', home);

router.get('/shop', shop);

router.get('/product-detail', productDetail)

router.get('/category-list', categoryList);

router.get('/logout', logout)

router.get('/profile', profile)

router.get('/edit-profile/:id', editProfile)

router.post('/update-profile/:id', updateProfile)

router.get('/add-address', addressAdd) // Assuming you have set up EJS as your view engine

router.post('/add-address', addAddress)

router.get('/edit-address/:id', editAddressPage)

router.post("/update-address/:id", updateAddress)

router.get('/change-password/:id', changePasswordPage);

router.post('/change-password/:id', changePassword)

router.get('/cart', cartPage);

router.post('/filter-products', filterProductAjax)

router.get('/addToCart/:id', productAddToCart);

router.get('/cart-remove/:id', removeCartItem)

router.post('/updateQuantity', updateQuantity)

router.get('/cart-remove/:id', removeCartItem);

router.get('/checkout', checkout);

router.get('/change-address', addressChange) // Assuming you have set up EJS as your view engine

router.post('/change-address',changeAddress )

router.post("/update-addressChange/:id", updateAddressChange)

router.get('/place-order/:id', placeorder)

router.get('/vieworderdetails', vieworderdetails);

router.get('/view-order-details/:id', SingleOrderDetail);

router.get('/cancel-order/:id', orderCancel)

router.post("/order-invoice", invoiceDownload);

router.get('/return-order/:id',returnRequest)

router.post('/updateQuantity',updateQuantity)

router.get('/delete-address/:id',deleteAddress);

// router.get("/search", searchProducts);

router.post('/product-search', productSearch)

router.post('/pagination',productPaginate)


router.get('/product-sort',productSort)

router.post('/address-checkout', checkoutAjaxAddress)

router.post('/checkout-payment',PaymentCheckout);

router.post('/verify-payment', verifyPayment)

router.get("/walletPage", walletPage)

router.post("/wallet-pay", walletUsage)

router.get("/coupons", coupons);

router.post("/use-coupon", useCoupon);

router.get("/wishlist",  wishlistPage); 

router.get("/add-wishlist/:id",  productAddToWishlist);

router.get("/remove-wishlist/:id",  removeWishlistItem); 

router.get("/whishlist-to-cart/:id", wishlistToCart ); 

router.get("/payment-failed/:id", paymentfailed ); 








module.exports = router;
