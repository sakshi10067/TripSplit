//schema for expenses in a trip, linked to the trip and the user who paid it
const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  tripId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Trip', 
    required: true 
  },
  paidBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  category: { 
    type: String, 
    enum: ['food', 'travel', 'stay', 'other'],
    default: 'other'
  },
  // Which members split this expense
  splitBetween: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  settled: { 
    type: Boolean, 
    default: false 
  },
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);