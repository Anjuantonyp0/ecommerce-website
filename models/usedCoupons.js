const mongoose = require('mongoose')


const usedCouponSchema = mongoose.Schema({

    UserId:{
    type: mongoose.Types.ObjectId,
    ref:'User'

    },

    Coupons:[
        {
        
            type:String,
            ref:'Coupon'
            
        }
    ]
},{
    versionKey: false,
  })
const usedCoupon = mongoose.model('UsedCoupon',usedCouponSchema)

module.exports=usedCoupon;
