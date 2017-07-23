import mongoose, { Schema } from 'mongoose';
import timestamps from 'mongoose-timestamp';

const messageSchema = new Schema({
  roomId: {
    type: String,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'users'
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
