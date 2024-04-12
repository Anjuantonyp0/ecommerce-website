const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const cartSchema = new Schema({
    userId: {
        type: String
    },
    items: [{
        product: {
            type: Schema.Types.ObjectId,
            ref: 'Product', 
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            default: 1,
        },
        subtotal: {
            type: Number,
            
        }
    }],
    totalPrice: {
        type: Number,
        // required: true,
        
    }
});
// method to clear items from the cart
cartSchema.methods.clearItems = function() {
    this.items = [];
    return this.save();
};

module.exports.Cart = mongoose.model('Cart', cartSchema);


