import mongoose, { Schema }  from 'mongoose';
import timestamp from 'mongoose-timestamp';

var products = require('./product-model');
var productSchema = mongoose.model('products').schema;

const transactionSchema = new Schema({
  productId: {
    type: Schema.Types.ObjectId, ref: 'products',
    require: true
  },
  listChange: [
    {
      productId: {
        type: Schema.Types.ObjectId, ref: 'products',
        default: undefined
      },
      date: {
        type: Date,
        default: Date.now
      },
      payMore: {
        type: Number,
        default: 0
      }
    }
  ],
  listAuction:
  [
    {
      owner: {
        type: Schema.Types.ObjectId, ref: 'users',
        default: undefined
      },
      price: {
        type: Number,
        default: 0
      },
      date: {
        type: Date,
        default: Date.now
      }
    }
  ],
  status: {
    type: Number,
    default: 0
    // 0 : in store
    // 1 : pedding
    // 2 : transaction success
  },
  success: {
    payWith: {
      type: Object,
      default: null
    },
    isAuction: {
      type: Boolean,
      default: false
    },
    date: {
      type: Date,
      default: Date.now
    },
    status: {
      type: Number,
      default: -1
      //-1 : null
      // 0 : pedding
      // 1 : shipping
      // 2 : received
      // 3 : refund
    }
  }
});

transactionSchema.plugin(timestamp);
module.exports = mongoose.model('transaction', transactionSchema);
