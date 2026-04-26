//schema for user data in MongoDB using Mongoose
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  isPremium: { 
    type: Boolean, 
    default: false 
  },
  razorpayId: { 
    type: String, 
    default: '' 
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);