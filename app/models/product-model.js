import mongoose, { Schema }  from 'mongoose';
import timestamp from 'mongoose-timestamp';

const productSchema = new Schema({
  productName: {
    type: String,
    unique: true,
    require: true,
    index: true
  },
  productNameUnicode: {
    type: String,
    unique: true,
    require: true,
    index: true
  },
  category: {
    type: Schema.Types.ObjectId, ref: 'categories',
    require: true
  },
  description: {
    type: String,
    default: ''
  },
  image: {
    type: Array,
    default: [{filename:'productImageNone.jpg'}]
  },
  owner: {
    type: Schema.Types.ObjectId, ref: 'users'
  },
  priceIn: {
    type: Number,
    default: 0
  },
  priceOut: {
    type: Number,
    default: 0
  },
  status: {
    type: Number,
    default: 1
  },
  used: {
    type: String,
    default: '100%'
  }
});

productSchema.plugin(timestamp);
module.exports = mongoose.model('products', productSchema);
