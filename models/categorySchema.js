const mongoose = require("mongoose")
const Schema = mongoose.Schema;



const categorySchema = new Schema({
    categoryName : {
        type:String,
        trim:"true",
        uppercase:"true",
        unique: true

    },
    active:{
        type:Boolean,
        default:true
    },
    isDeleted:{
        type:Boolean,
        default:false
    },
    offer: {
        type: Number,
        default: 0
    }
})

module.exports.Category = mongoose.model("Category",categorySchema)
