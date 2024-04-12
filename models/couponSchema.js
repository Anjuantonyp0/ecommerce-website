const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const couponSchema = new Schema({
    couponCode: {
        type: String,
        required: true,
        unique: true
    },
    active: {
        type: Boolean,
        default: true
    },
    discountPercentage: {
        type: Number,
        required: true,

    },
    maxDiscount: {
        type: Number,
        required: true
    },
   expires: {
    type: Date,
    required: true
   }
});




module.exports.Coupon = mongoose.model('coupon', couponSchema);