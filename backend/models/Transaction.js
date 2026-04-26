//schema for transactions between users, including payments for trips and other expenses
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  fromUser: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  toUser: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  tripId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Trip' 
  },
  razorpayPaymentId: { 
    type: String, 
    default: '' 
  },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);