const mongoose = require('mongoose');
const moment = require('moment');

const salesSchema = new mongoose.Schema({
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product',
      },
    },
  ],
  date: {
    type: Date,
    default: Date.now,
    validate: {
      validator: (value) => moment(value).isValid(),
      message: 'Invalid date for the sales date field',
    },
  },
  salesPerOrderQuantity: {
    type: Number,
    min: 0,
  },
  orderNumber: {
    type: String,
  },
  totalSalesPerOrderPrice: {
    type: Number,
    min: 0,
  },
  status: {
    type: String,
    default: 'pending',
  },
  PaymentMethod: {
    type: String,
  },
});

salesSchema.virtual('formattedDateOrdered').get(function () {
  return moment(this.date).format('DD-MM-YYYY HH:mm');
});

salesSchema.index({ date: 1 });

module.exports = mongoose.model('Sales', salesSchema);