const mongoose = require('mongoose');
const schema = mongoose.Schema;


const addressSchema = new schema({
    userId: {
        type: String,
        required: true
    },
    addresses: [{
    firstName: String,
    lasstName: String,

    houseName: String,
    postOffice: String,
    district: String,
    phoneNumber:Number,
    pin:Number
    
}]
   
})

module.exports.Address = mongoose.model('Address', addressSchema);