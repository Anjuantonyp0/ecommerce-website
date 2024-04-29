const {Category} = require("../models/categorySchema");
const { Coupon } = require("../models/couponSchema");
var couponCode = require("coupon-code");

const getCategory = async (req, res) => {
    try {
        const categories = await Category.find({ active: true });
        if (categories.length > 0) {
            return categories;
        } else {
            console.log("category not available");
        }
    } catch (error) {
        console.log(error.message);
    }
};

const checkAndUpdateExpiredCoupons = async () => {
    try {
        const currentDate = new Date();
        const coupons = await Coupon.find({ expirationDate: { $lte: currentDate }, expired: false });
        if (coupons.length > 0) {
            const expiredCoupons = await Coupon.updateMany(
                { _id: { $in: coupons.map(coupon => coupon._id) } },{ $set: { expired: true } });
        if (expiredCoupons) {
                console.log("Coupons expired:", expiredCoupons.nModified);
            }
        } else {
            console.log("No coupons found that have expired.");
        }
    } catch (error) {
        console.error("Error checking and updating expired coupons:", error);
    }
};
// ---------------------------------------------------------------------------------------------------------------------------------------
// =========================================================== USER  SIDE===============================================================>
// ---------------------------------------------------------------------------------------------------------------------------------------







// --------------------------------------------------------------USE COUPON -------------------------------------------------------------->
module.exports.useCoupon = async (req, res) => {
    try {
        console.log(req.body.code)
        const newCode = await Coupon.findOne({ couponCode: req.body.code });
        checkAndUpdateExpiredCoupons()
        const total = parseInt(req.body.total);
        console.log(total)
        console.log(newCode)
        let newTotal = 0;
        let exp = false;
        let discount = 0;
        if(!newCode){
            return  res.send({invalid: true})
         }
        if (newCode.active !== false) {
            newTotal = (total * newCode.discountPercentage) / 100;
            discount = total - newTotal
        } else {
            exp = true
        }
        if (newTotal > newCode.maxDiscount) {
            newTotal = newCode.maxDiscount;
         discount = newCode.maxDiscount;

        };
        newCode.active = false;
      
        await newCode.save();
        res.send({ newTotal: newTotal, expired: exp, couponDiscound: discount});
    } catch (error) {
        console.error('Error in useCoupon:', error.message);
        res.status(500).send({ error: 'Internal Server Error' });
    }
};


// -------------------------------------------------------------COUPON PAGE RENDERING ---------------------------------------------------->
module.exports.coupons = async (req, res) => {
    try {
        const user = req.session.user
        const coupons = await Coupon.find({});
        checkAndUpdateExpiredCoupons();
        const category = await getCategory();
        //const categories = await Category.find({});
        res.render('user/coupons', { coupons: coupons, user: user, category: category })
    } catch (error) {
        console.log('Try catch error in coupons');
        console.log(error.message);
    }
};





// ---------------------------------------------------------------------------------------------------------------------------------------
// =========================================================== ADMIN  SIDE===============================================================>
// ---------------------------------------------------------------------------------------------------------------------------------------






// --------------------------------------------------------COUPON MANAGEMENT RENDERING --------------------------------------------------->
module.exports.couponManage = async (req, res) => {
    try {
        const coupon = await Coupon.find({}).sort({ _id: -1 });
        checkAndUpdateExpiredCoupons();
        res.render("admin/couponManagement", { offer: coupon })
    } catch (error) {
        console.log(error.message);
    }
};


// ---------------------------------------------------------COUPON ADD RENDERING --------------------------------------------------------->
module.exports.addCouponPage = async (req, res) => {
    try {
        checkAndUpdateExpiredCoupons();
        res.render('admin/addCoupons')
    } catch (error) {
        console.log('Try catch error in addCouponPage');
        console.log(error.message);
    }
};


// ----------------------------------------------------------COUPON GENERATING ----------------------------------------------------------->
module.exports.generateCoupon = async (req, res) => {
    try {
        let codeC = couponCode.generate({ parts: 2 });
        res.send({ coupon: codeC })
    } catch (error) {
        console.log('Try catch error in generateCoupon');
        console.log(error.message);
    }
};


// --------------------------------------------------------COUPON ADD ADMIN -------------------------------------------------------------->
module.exports.addCoupon = async (req, res) => {
    try {
        const newCoupon = new Coupon({
            couponCode: req.body.code,
            discountPercentage: req.body.discountPercentage,
            maxDiscount: req.body.maxDiscount,
            expires: req.body.expiryDate,
        });
        console.log(newCoupon)
        const savedCoupon = await newCoupon.save();
        if (savedCoupon) {
            res.redirect("/admin/coupon-mg");
        } else {
            console.log("Coupon not saved");
        }
    } catch (error) {
        console.log('Try catch error in addCoupon ');
        console.log(error.message);
    }
};


// -----------------------------------------------------------COUPON DELETE -------------------------------------------------------------->
module.exports.deleteCoupon = async (req, res) => {
    try {
        let id = req.params.id;
        let deleteCoupon = await Coupon.deleteOne({ _id: id });
        if (deleteCoupon) {
            res.redirect('/admin/coupon-mg')
        } else {
            console.log("coupon not found ")
        }
    } catch (error) {
        console.log('Try catch error in deleteCoupon');
        console.log(error.message);
    }
};