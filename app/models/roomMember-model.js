import mongoose, { Schema } from 'mongoose';
import timestamps from 'mongoose-timestamp';

const roomMemberSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId, ref: 'users'
  },
  roomId: {
    type: Schema.Types.ObjectId, ref: 'rooms'
  },
  lastSeen: {
    type: Number
  }
});

roomMemberSchema.set('toJSON', { virtual: true });
roomMemberSchema.set('toObject', { virtual: true });

roomMemberSchema.plugin(timestamps);
module.exports = mongoose.model('roomMember', roomMemberSchema);
