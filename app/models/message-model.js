import mongoose, { Schema } from 'mongoose';
import timestamps from 'mongoose-timestamp';

const messageSchema = new Schema({
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  roomId: {
    type: String,
    index: true
  },
  content: {
    type: String,
    index: true
  },
  seen: {
    type: Boolean,
    default: 0
  }
});


messageSchema.plugin(timestamps);
module.exports = mongoose.model('message', messageSchema);
