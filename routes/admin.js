var express = require("express");
const {
  loginPage,
  loginController,
  userManagment,
  userBlock,
  userUnBlock,
  adminLogout,
  dash,
  dashboard,
  chartData,
} = require("../controllers/adminController");

const {
  productMg,
  addProductPage,
  categoryMg,
  addCategory,
  addProduct,
  categoryDeactivate,
  categoryActivate,
  blockUser,
  categoryEdit,
  editCategory,
  updateCategory,
  EditProductPage,
  deleteProduct,
  updateProduct,
  deleteCategory,
  categoryDelete,
  addCategoryOffer,
} = require("../controllers/productController");
var router = express.Router();
const multer = require("multer");
const path = require("path");

const { adminsessionLogin, adminsessionLogout } = require("../middlewares/middleware");
const { couponManage, addCoupon, addCouponPage, generateCoupon, deleteCoupon } = require("../controllers/couponController");

const nocache = require("nocache");
const { orderManagement, viewdetails, updateOrderStatus, changeOrderStatus, changeOrderItemStatus, returnApprovel, orderPagination } = require("../controllers/orderController");
const { bannerList, addBannerPage, addBanner, deleteBanner } = require("../controllers/bannerController");
const { salesReportPage, salesReport } = require("../controllers/salesController");
router.use(nocache());


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/uploads");
  },
  filename: (req, file, cb) => {
    let ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + Date.now() + ext);
  },
});

const upload = multer({
  storage: storage,
});

const storage1 = multer.diskStorage({
  destination: function (req, file, cb) { 
    cb(null, './public/banner'); 
  },
  filename: function (req, file, cb) { 
    cb(null, file.originalname); 
  }
});

const upload1 = multer({ 
  storage: storage1 
});


router.get("/",loginPage);

router.post("/verify-login", loginController);

 router.get('/dashboard',dashboard)

router.get("/product-mg", adminsessionLogin, productMg);

router.get("/edit-product/:id", adminsessionLogin, EditProductPage);

router.post("/update-product/:id", upload.any(), updateProduct);

router.get("/delete-product/:id", adminsessionLogin, deleteProduct);

router.get("/add-product-page", adminsessionLogin, addProductPage);

router.post("/add-product", upload.array("image", 5), addProduct);

router.get("/category-mg", adminsessionLogin, categoryMg);

router.get("/deactivate-category/:id", adminsessionLogin, categoryDeactivate);

router.get("/activate-category/:id", adminsessionLogin, categoryActivate);

router.post("/add-category", addCategory);

router.get("/edit-category/:id", adminsessionLogin, editCategory);

router.post("/update-category/:id", updateCategory);

router.get("/user-mg", adminsessionLogin, userManagment);

router.get("/user-block/:id", adminsessionLogin, userBlock);

router.get("/user-unblock/:id", adminsessionLogin, userUnBlock);

router.get("/admin-logout", adminLogout);

router.get('/orderManagement',orderManagement);

router.get('/orderPagination',orderPagination)

// router.post('/view-order-details-admin',changeOrderStatus)

router.patch('/change_Order_Status',changeOrderItemStatus)

 router.get('/return-approvel/:id',returnApprovel)

router.get('/view-order-details-admin/:orderId',viewdetails)

router.get("/delete-category/:id", categoryDelete);

router.post('/updateOrderStatus',updateOrderStatus)

// router.get('/add-coupon',authenticateAdmin,getCouponPage)

// router.post('/add-coupon',authenticateAdmin,addingCoupon)

router.get('/coupon-mg', couponManage)

router.get('/delete-coupon/:id', deleteCoupon)

router.get('/add-coupon', addCouponPage)

router.post('/generate-coupon', generateCoupon)

router.post('/add-coupon', addCoupon);

router.get('/banner-mg', bannerList);

router.get('/getChartData',chartData)

router.get('/sales-report',salesReportPage)

router.post('/salesreport',salesReport);

router.get('/add-banner-page', addBannerPage);

router.post('/add-banner', upload1.single('image'), addBanner);

router.get('/delete-banner/:id', deleteBanner);

router.post("/add-category-offer", addCategoryOffer)

router.get("/logout", adminLogout)
module.exports = router;
