// orderSchema.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    userId: {
        type: String
    },
    items: [
        {
            product: {
                type: Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                default: 1
            },
            subtotal: {
                type: Number
            },
           
        }
    ],
    totalAmount: {
        type: Number,
        required: true
    },
    address: {
        name: String,
        houseName: String,
        postOffice: String,
        district: String,
        pin: String
    },
    status: {
        type: String,
       
    },

    canceled:{
        type:Boolean,
        default: false
    },
    returned:{
        type:Boolean,
        default:false
    },
    returnRequest:{
        type:Boolean,
        default:false
    },
    returnApprovel:{
        type:Boolean,
        default:false
    },
    payment:{
        type:String,
    },
    paymentstatus:{
        type: String,
        default: "Pending"
    }

} , 
 { timestamps:true},

);

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
