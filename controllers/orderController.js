const Order = require('../models/orderSchema'); // Import your Order schema
const User = require('../models/userSchema');
const { Cart } = require('../models/cartSchema');
const { Address } = require('../models/addressSchema');
const { Category } = require("../models/categorySchema");
const { Product } = require('../models/productSchema');
const Razorpay = require('razorpay');
const Wallet = require('../models/walletSchema');
const { Transaction } = require('../models/transaction');
var easyinvoice = require('easyinvoice');
const keyId = process.env.KEY_ID;
const secretRazo = process.env.SECRET_RAZO;
var instance = new Razorpay({ key_id: 'rzp_test_ewEoYdEGpdK0FQ',key_secret: 'rtJX2nv4XPVAZ9ZrY5Wrepyx',});


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



// -------------------------------------------------------------
// =========================== USER  SIDE======================>
// -------------------------------------------------------------





// -----------CHECKOUT----------------->
module.exports.checkoutAjaxAddress = async (req, res) => {
    try {
        const addressId = req.body.selectedAddress;
        const orderTotal = req.body.orderTotal;
        const payment = req.body.payment;
        const userId = req.session.user._id;
        const cart = await Cart.findOne({ userId: userId }).populate('items.product');
        const addressSchema = await Address.findOne({ userId: userId });
        if (!cart) {
            console.log('Cart is not available');
            return res.status(404).json({ error: 'Cart not found' });
        }
        const selectedAddress = addressSchema.addresses.find(address => address._id.toString() === addressId);
        const items = cart.items.map(item => ({
            product: item.product._id,
            quantity: item.quantity,
            subtotal: item.product.price * item.quantity
        }));
        const orderSave = new Order({
            userId: userId,
            items: items,
            address: selectedAddress,
            totalAmount: orderTotal,
            status: 'placed',
            payment: payment
        });
      await orderSave.save();
        if (payment === 'COD') {
            return res.status(200).json({ codSuccess: true, id: orderSave._id });
        } else if (payment === 'Razorpay') {
            console.log('Razorpay payment ');
            let ras = true
            return res.status(200).json({ id: orderSave._id , ras: ras});
        }
    } catch (error) {
        console.log('Error in checkoutAjaxAddress controller:');
        console.log(error.message);
        return res.status(500).json({ error: 'Internal server error' });
    }
};


// -----------VERIFY PAYMENT ----------------->
module.exports.verifyPayment = async (req, res) => {
  try {
      const details = req.body;
      const orderId = req.body.orderId;
      const secretKey = "rtJX2nv4XPVAZ9ZrY5Wrepyx"; 
      const crypto = require("crypto"); 
      const hmac = crypto.createHmac("sha256", secretKey);
      hmac.update(details.payment.razorpay_order_id  + "|" + details.payment.razorpay_payment_id);
      const calculatedHmac = hmac.digest("hex");
      console.log(calculatedHmac, "HMAC calculated");
      if (calculatedHmac === details.payment.razorpay_signature) {
          await Order.updateOne({ _id: orderId }, { $set: { paymentStatus: "placed" } });
          console.log("Payment is successful");
          res.json({ status: true });
      } else {
          await Order.updateOne({ _id: orderId }, { $set: { paymentStatus: "failed" } });
          console.log("Payment is failed");
          res.json({ status: false, errMsg: "Payment verification failed" });
      }
  } catch (error) {
      console.log('Try catch error in verifyPayment');
      console.log(error.message);
      res.status(500).json({ error: 'Internal server error' });
  }
};


// -----------PAYMENT CHECKOUT----------------->
module.exports.PaymentCheckout = async(req,res)=>{
  try {
      const orderId = req.body.orderId;
      const newOrder = await Order.findById(orderId);
      var options = {
        amount: newOrder.totalAmount * 100,  // amount in the smallest currency unit
        currency: "INR",
        receipt: "razorUser@gmail.com"
      };
      instance.orders.create(options, function(err, order) {
      res.send(order)
      });
    } catch (error) {
      console.log('Try catch error in PaymentCheckout ');
      console.log(error.message);
    }
}

// -----------PAYMENT CHECKOUT----------------->  
module.exports.paymentfailed = async(req,res)=>{
  try {
    const id = req.params.id;
   const order =  await Order.updateOne({ _id: id }, { $set: { paymentStatus: "failed" } });

  if(order){
    res.render("user/paymentfailed");
  }else{
    res.send("order status failing updation failed");
  }
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error");
  }
};


// -----------ORDER SUCCESS PAGE RENDERING----------------->
module.exports.placeorder = async (req, res) => {
    try {
      const order = await Order.findById(req.params.id).populate('items.product');
      console.log(order);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
      
      
      const id = req.session.user._id;
      console.log(id);
      const deleteCart = await Cart.deleteOne({userId: id});
      if(deleteCart){
        res.render('user/orderSuccessPage', { order });
      }else{
        console.log("deletion of cart has failed");
      }
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: 'Server error' });
    }
};


// -----------VIEW ORDER DETAILS----------------->
module.exports.vieworderdetails = async (req, res) => {
    try {
        const category = await Category.find({ active: true });
        const userId = req.session.user._id;
        const order = await Order.find({ userId: userId }).populate('items.product').sort({_id: -1})
        console.log(order);
        if (!order) {
            console.log("no order is available....")
        }
            console.log(order.items)
        // Render the order details page with the retrieved order
        res.render('user/vieworders', { order: order, user: userId, category: category });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


// -----------VIEW ORDER DETAILS----------------->
module.exports.SingleOrderDetail = async (req, res) => {
    try {
        const orderId = req.params.id;
        console.log(orderId);
        const orderDb = await Order.findOne({ _id: orderId }).populate('items.product');
        const userId = req.session.user._id;
        const category = await Category.find({ active: true });
        res.render("user/view-order-details", { order: orderDb, category: category, user: userId })
    } catch (error) {
        console.log(error.message);
    }
}


// -----------CANCEL ORDER----------------->
module.exports.orderCancel = async (req, res) => {
    try {
        const userId = req.session.user._id;
        const orderId = req.params.id;
          console.log('Order cancellation');
        const transactionDb = await Transaction.findOne({ userId: userId });
        const cancelOrder = await Order.findOneAndUpdate({ _id: orderId, userId: userId}, {$set: {canceled: true,status: "Canceled"}} );
          if (!cancelOrder) {
            return res.redirect('/view-order-details');
        }
          if (cancelOrder.payment === 'Razorpay') {
            let wallet = await Wallet.findOne({ userId});
          if (!wallet) {
               wallet = new Wallet({ userId: userId,balance: cancelOrder.totalAmount,});
              await wallet.save();
          console.log('New wallet created');

        const newTrans = new Transaction({userId: userId,transaction: [{mode: 'CREDIT', amount: cancelOrder.totalAmount,}] })
        const SaveNewTrans = await newTrans.save();
             } else {
               wallet.balance += cancelOrder.totalAmount;
              await wallet.save();
        const newTrans =  { }
               transactionDb.transaction.push({mode: 'CREDIT',
               amount: cancelOrder.totalAmount});
              await transactionDb.save();
                    }
                  }
              return res.redirect('/view-order-details/' + orderId);
    } catch (error) {
        console.log('Error in order cancellation:');
        console.log(error.message);
        return res.status(500).send('Internal Server Error');
    }
};


// -----------RETURN REQUEST----------------->
module.exports.returnRequest = async (req, res) => {
  try {
    const id = req.params.id;
    const order = await Order.findOne({ _id: id });
    if (!order) {
      return res.status(404).send('Order not found');
    }
     order.returnRequest = true;
    await order.save();
    console.log(order + "hloo");
    res.redirect('/view-order-details/' + id);
 }catch (error) {
    console.error(error.message);
    res.status(500).send('Internal ServerError');
 }
};


// -----------WALLET PAGE RENDERING----------------->
module.exports.walletPage = async (req, res) => {
    try {
      const userId = req.session.user._id;

      const orderId = req.params.id;
      const order = await Order.find({ userId: userId }).populate('items.product').sort({_id: -1})
              // console.log(re)
        const wallet = await Wallet.findOne({userId: userId})
        const category = await getCategory();
        console.log(wallet);
        const user = req.session.user
        const transaction = await Transaction.findOne({userId: userId});
        res.render('user/wallet', {order: order, category,wallet: wallet, transaction: transaction});
    } catch (error) {
        console.log('Error in walletPage controller: 👍👍👍👍👍👍👍👍👍');
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};


// -----------WALLET USAGE----------------->
module.exports.walletUsage = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.session.user._id;
    const total = req.body.orderTotal;
    const userWallet = await Wallet.findOne({ userId: userId });
    const userCart = await Cart.findOne({ userId: userId });
    const newTotal = userWallet.balance - total;
    userWallet.balance = newTotal;
    await userWallet.save();
    if (!userCart) {
      return res.status(400).send("No cart available.");
    }
    if (!userWallet) {
      return res.status(400).send("No wallet available.");
    }
    res.send({wallet: newTotal, newTotal: total})
    // res.render('user/wallet', {wallet: wallet});
} catch (error) {
    console.log('Try catch error in walletUsage ');
    console.log(error.message);
  }
};


// -----------INVOICE DOWNLOADING--------------->
module.exports.invoiceDownload= async (req, res) => {
  try {
  
    const id = req.body.orderId;
      
    const order = await Order.findById(id)
    res.send(order)
    

  } catch (error) {
    console.log('Try catch error in invoiceDownload');
    console.log(error.message);
  }
};










// -------------------------------------------------------------
// =========================== USER  SIDE======================>
// -------------------------------------------------------------







// -----------ORDER MANAGEMENT IN ADMIN SIDE--------------->
module.exports.orderManagement =  async (req, res) => {
    try {
      const order = await Order.find().populate('items.product').sort({_id: -1});
      console.log(order);
   
      if (!order) {
        console.log("no order is available....")
      }
      res.render('admin/orderMgt', { order: order });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
   };
   module.exports.viewdetails = async (req, res) => {
    const orderId = req.params.orderId;

    // Retrieve order details based on the order ID
    const order = await Order.findById(orderId).populate('items.product').populate('userId');
    console.log(order)
    if (!order) {
        // Handle case where order details are not found
        return res.status(404).send('Order not found');
    }

    // Render a view with the order details
    res.render('admin/viewDetails', { order });
};
 module.exports.changeOrderItemStatus = async(req,res)=>{
//     try {
// const{ProductId,OrderId,newStatus,customerId,paymentStatus} = req.body

// changeOrderItemStatusFromAdmin(ProductId,OrderId,newStatus,customerId,paymentStatus).then((response)=>{

//   console.log(response);

//   res.status(200).json({status:true,message:response})
// }).catch((err)=>{
//   console.log(err);
//   res.status(500).json({ status: false, message: err }); // Sending an error response in case of rejection

// })
//     } catch (error) {
//       console.log(error);
//       res.status(500).json({ status: false, message: 'An unexpected error occurred.' });

//     }
   }
 module.exports.changeOrderStatus = async (req, res) => {
    try {
      const orderId = req.body.orderId;
      const orderStatus = req.body.orderStatus;
  
      const order = await Order.findOneAndUpdate(
        { _id: orderId },
        { $set: { status: orderStatus } },
        { new: true }
      );
  
      if (orderStatus === 'Delivered') {
        order.dateDelivered = Date.now();
      }
  
      const savedOrder = await order.save();
  
      if (savedOrder) {
        console.log(savedOrder);
        res.send(orderStatus);
      } else {
        console.log('Data was not saved');
        res.status(500).send('Internal Server Error');
      }
    } catch (error) {
      console.log('Try-catch error');
      console.log(error.message);
      res.status(500).send('Internal Server Error');
    }
  };
module.exports.updateOrderStatus = async (req, res) => {
    try {
        const orderId = req.body.orderId;
        const orderStatus = req.body.orderStatus;

        const order = await Order.findOneAndUpdate(
            { _id: orderId },
            { $set: { status: orderStatus } },
            { new: true }
        );

        if (orderStatus === 'Delivered') {
            order.dateDelivered = Date.now();
        }

        const savedOrder = await order.save();

        if (savedOrder) {
            console.log(savedOrder);
            
            res.json({ orderStatus, updatedOrder: savedOrder });
        } else {
            console.log('Data was not saved');
            res.status(500).send('Internal Server Error');
        }
    } catch (error) {
        console.log('Try-catch error');
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};
module.exports.returnApprovel = async (req, res) => {
  try {
      const id = req.params.id;

      const returnApprovel = await Order.findOneAndUpdate(
          { _id: id },
          {
              $set: {
                
                  returnApprovel: true,
                  
              },
          },
          { new: true }           );
          const user = returnApprovel.userId;
        const walletAvailable = await Wallet.findOne({userId: user});
        const transactionDb = await Transaction.findOne({ userId: user });
      
          if(returnApprovel){
      
            if(walletAvailable){
              await Wallet.findOneAndUpdate({userId: user},{
                $set: {
                  balance: returnApprovel.totalAmount + walletAvailable.balance
                }
              })
      
         
         
    

               transactionDb.transaction.push(newTrans);
               await transactionDb.save({
                mode: 'CREDIT',
                amount: returnApprovel.totalAmount
               });
          

      
            }else{
              const OrderReturnMoney = new Wallet({
                userId: returnApprovel.userId,
                balance: returnApprovel.totalAmount
              
              }) 
              
              const saved = await OrderReturnMoney.save();
      
              
              const newTrans = new Transaction({
                userId: user,
                transaction: [{
                  mode: 'CREDIT',
                 amount: returnApprovel.totalAmount,
      
               }]
              })


      
              const SaveNewTrans = await newTrans.save();
      
              if(SaveNewTrans){
                console.log('New transaction has been saved ');
              }else{
                console.log("Error saving new TRansaction ");
              }
      
      if(saved){
        console.log('money Added to the wallet ');
      }else{
        console.log("Money adding to wallet failed ! ");
      }
              
            }
      
            
      

          res.redirect('/admin/view-order-details-admin/',id );
      }else{
        console.log("return approval failed ");
      }
  } catch (error) {
      console.log(error.message);
  }
};



module.exports.orderPagination = async (req, res) => {
    try {
        const { page, pageSize } = req.body;
        const skip = (page - 1) * pageSize;
        const orders = await Order.find()
            .skip(skip)
            .limit(pageSize);

        res.json({ orders });
    } catch (error) {
        console.error('Error fetching paginated data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};