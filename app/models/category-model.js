import mongoose, { Schema }  from 'mongoose';
import timestamp from 'mongoose-timestamp';

const cateogrySchema = new Schema({
  categoryName: {
    type: String,
    unique: true,
    require: true
  },
  categoryImage: {
    type: Object,
    default: {filename:'categoryImageNone.jpg'}
  },
  iconName: {
    type: String,
    default: 'ActionHelp'
  }
});

cateogrySchema.plugin(timestamp);
module.exports = mongoose.model('categories', cateogrySchema);
