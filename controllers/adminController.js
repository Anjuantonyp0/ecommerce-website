const Order = require("../models/orderSchema");
const Product = require("../models/productSchema");
const { User } = require("../models/userSchema");


// -----------LOGIN PAGE RENDERING --------------------->
module.exports.loginPage = (req, res) => {
    try {
      res.render("admin/login");
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error");
    }
};


// -----------DASHBOARD PAGE RENDERING ----------------->
module.exports.loginController = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email: req.body.email, password: req.body.password });
        if (user && user.verify && user.is_admin) {
            req.session.admin_id = user._id; 
            console.log(req.session);
            res.redirect("/admin/dashboard");
        } else {
            res.redirect("/admin");
        }
    } catch (error) {
        console.log(error.message);
    }
};


// -----------DASHBOARD PAGE RENDERING ----------------->
module.exports.dashboard = async(req, res) => {
    try {
        const returnedOrders = await Order.find({ returned: true }).countDocuments();
        const deliveredOrders = await Order.find({ status: 'Delivered' }).countDocuments();
        const canceledOrders = await Order.find({ canceled: true }).countDocuments();

        const codPayment = await Order.find({ payment: 'COD' }).countDocuments();
        const onlinePayment = await Order.find({ payment: 'Razorpay' }).countDocuments();
        const totalOrder  = await Order.find({}).countDocuments()
        const totalAmountPayment = await Order.aggregate([
            { $group: { _id: null,totalAmount: { $sum: '$totalAmount' }}}
        ]);
       const codTotal = await Order.aggregate([
          { $match: { payment: "COD" }},
          { $group: { _id: null,totalAmount: { $sum: '$totalAmount' }} }
        ]);
      const razorpayTotal = await Order.aggregate([
        { $match: { payment: "Razorpay" }},{ $group: { _id: null,totalAmount: { $sum: '$totalAmount' }}}
        ]);

        const delivy = await Order.find().populate('items.product');
        console.log(delivy.produ + "👍👍👍😁😁😘😘😘")


        console.log(returnedOrders)
        console.log(deliveredOrders)
        console.log(codPayment)
        console.log(onlinePayment)
        console.log(totalAmountPayment)
        res.render('admin/dash', {
            returnedOrders,
            deliveredOrders,
            codTotal,
            razorpayTotal,
            canceledOrders,
            codPayment,
            totalOrder,
            onlinePayment,
            totalAmountPayment: totalAmountPayment.length > 0 ? totalAmountPayment[0].totalAmount : 0
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};


// -----------DASHBOARD PAGE RENDERING ----------------->

module.exports.deactivatedUser = async (req, res) => {
    const userId = req.params.id;
  try {
      const deactivatedUser = await User.findByIdAndUpdate(
        userId,
        { status: "Inactive" },{ new: true });
      res.render("deactivatedUser");
    } catch (error) {
      console.error(error.message);
    }
};

module.exports.userManagment = async (req, res) => {
    try {
      const user = await User.find({});
      console.log(user);
      res.render("admin/user-mg", { user: user });
    } catch (error) {
      console.log(error.message);
    }
};

module.exports.userBlock = async (req, res) => {
    try {
      const id = req.params.id;

      const blockUser = await User.findOneAndUpdate(
        { _id: id },{ $set: { blocked: true,},});
      if (blockUser) {
        res.redirect("/admin/user-mg");
      }
    } catch (error) {
      console.log(error.message);
    }
};

module.exports.userUnBlock = async (req, res) => {
    try {
      const id = req.params.id;
      const unblockUser = await User.findOneAndUpdate(
        { _id: id },{ $set: {blocked: false,},});
      if (unblockUser) {
        res.redirect("/admin/user-mg");
      }
    } catch (error) {
      console.log(error.message);
    }
};

module.exports.adminLogout = async (req, res) => {
    try {
      req.session.admin_id = null; 
      res.redirect("/admin");
    } catch (error) {
      console.log(error.message);
    }
};

module.exports.chartData = async (req, res) => {
    try {
    const orderData = await Order.aggregate([
        { $group: { _id: { year: { $year: '$dateOrdered' },month: { $month: '$dateOrdered' } }, orderCount: { $sum: 1 }}},
        { $project: {_id: 0, year: '$_id.year', month: '$_id.month',orderCount: 1}},
        { $sort: { year: 1, month: 1 }}
      ]);
    const canceledOrderData = await Order.aggregate([
        { $match: { canceled: true,},},
        { $group: {_id: { year: { $year: '$dateOrdered' }, },canceledOrderCount: { $sum: 1 },},},
        { $project: { _id: 0, year: '$_id.year', canceledOrderCount: 1,},},
        { $sort: { year: 1,},},
      ]);  
    const weeklyOrderData = await Order.aggregate([
        { $group: { _id: { week: { $week: '$dateOrdered' },},weeklyOrderCount: { $sum: 1 },},},
        { $project: {_id: 0, week: '$_id.week',nweeklyOrderCount: 1,},},
        { $sort: { week: 1,},},
      ]);


        const deliveredOrders = await Order.find({ status: 'Delivered',  }).countDocuments();
        const delivy = await Order.find({ }).populate('product');
        console.log(delivy)


    res.json({orderData,canceledOrderData, weeklyOrderData,});
      } catch (error) {
      console.error('Error fetching chart data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
};


  