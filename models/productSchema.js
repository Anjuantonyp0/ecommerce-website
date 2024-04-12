const mongoose = require('mongoose');
const schema = mongoose.Schema;


const productSchema =  new schema({
    name:{
        type: String,
        required: true
    },
    price:{
        type: Number,
        required:true,
        
    },
    category: {
        type: schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    stock:{
       type: Number,
       required: true
    },
    description: {
        type: String,
        required: true
    },
    image:[{
        url: {
            type: String,
            required: true
        }
    }],
    isDelete:{
        type:Boolean,
        defalt:false
    },
    orginalPrice: {
        type: Number,
        default: 0
    }
    
})




module.exports.Product = mongoose.model("Product", productSchema);

