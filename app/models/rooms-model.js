import mongoose, { Schema } from 'mongoose';
import timestamps from 'mongoose-timestamp';

const messageSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'users',
    unique: true,
    require: true
  },
  listRoom: [{
    roomId: {
      type: String,
      require: true
    },
    withUser: {
      type: Schema.Types.ObjectId,
      ref: 'users',
    }
  }],
  seen: {
    type: Boolean,
    default: 0
  }
});


messageSchema.plugin(timestamps);
module.exports = mongoose.model('rooms', messageSchema);
