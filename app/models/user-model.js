import mongoose from 'mongoose';
import timestamp from 'mongoose-timestamp';

const userSchema = new mongoose.Schema({
  username: {
    type     : String,
    unique   : true,
    required : true,
    index    : true
  },
  password: {
    type     : String,
    required : true,
  },
  name: {
    firstName: String,
    lastName : String
  },
  gender: {
    type: Number,
    default: 0
  },
  DOB: Date,
  phone: {
    type: String,
    default: ''
  },
  address: {
    type    : String,
    default : ''
  },
  email: {
    type    : String,
    default : ''
  },
  maried: {
    type    : Boolean,
    default : false
  },
  child: {
    type    : Array,
    default : []
  },
  interest: {
    type    : Array,
    index   : true,
    default : []
  },
  rate: {
    type    : Number,
    default : 0
  },
  avatar: {
    type: Object,
    default: null
  },
  role: {
    type: Number,
    default: 0
  }
});

userSchema.virtual('fullname').get(function() {
  return this.name.firstName + '' + this.name.lastName;
});

userSchema.plugin(timestamp);
module.exports = mongoose.model('users', userSchema);

