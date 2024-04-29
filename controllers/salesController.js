const Sales = require('../models/salesSchema');
const { Category } = require("../models/categorySchema");
const Order= require('../models/orderSchema'); 
const Product = require('../models/productSchema');


// ---------------------------------------------------------------------------------------------------------------------------------------
// =========================================================== ADMIN  SIDE===============================================================>
// ---------------------------------------------------------------------------------------------------------------------------------------



// ------------------------------------------------------------RENDER SALES REPORT PAGE------------------------------------------------>

module.exports.salesReportPage = async (req, res) => {
  try {
    const category = await Category.find({ active: true });
    const orders = await Order.find().populate('items.product');
    // console.log(orders);
    res.render('admin/salesreport', { category, order: orders });
  } catch (error) {
    console.log(error.message);
    console.log('try catch error in salesreportpage');
  }
};


// ------------------------------------------------------------SALES REPORT------------------------------------------------------------->

module.exports.salesReport = async (req, res) => {
  try {
    const startDateString = req.body.startDate;
    const endDateString = req.body.endDate;

    const startDate = new Date(startDateString);
    const endDate = new Date(endDateString);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).send('Invalid date format. Please provide valid dates.');
    }

    const orders = await Order.find({
      createdAt: { $gte: startDate, $lte: endDate },
      status: 'Delivered',
    }).populate('items.product');

    let totalSales = 0;
    let totalOrders = orders.length;

// console.log(orders + '💕💕💕😁😁😁😁😁😁😁')
    orders.forEach((order) => {
      totalSales += order.totalAmount;
    });

    
// Assuming 'orders' is an array of order objects
const items = [];

orders.forEach((order) => {
  order.items.forEach((item) => {
    items.push(item.product);
  });
});

    const averageOrderValue = totalOrders > 0 ? Math.ceil(totalSales / totalOrders) : 0;

    const salesReport = {
      totalSales,
      totalOrders,
      averageOrderValue,
      orders: orders.map((order) => ({
        orderId: order._id.toString(),
        totalAmount: order.totalAmount,
        orderStatus: order.status,
        address: order.address
      }))
   
    };
console.log(salesReport)

    res.json(salesReport);
  } catch (error) {
    console.log(error.message);
    res.status(500).send('Internal Server Error');
  }
};


