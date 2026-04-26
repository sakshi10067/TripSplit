//schema for trip data in MongoDB using Mongoose
const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  destination: { 
    type: String, 
    required: true 
  },
  dates: {
    start: { type: String },
    end: { type: String },
  },
  budgetPerPerson: { 
    type: Number, 
    required: true 
  },
  vibe: { 
    type: String, 
    enum: ['adventure', 'relaxed', 'food-focused', 'culture'],
    default: 'relaxed'
  },
  // Who created the trip
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  // All members of the trip
  members: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  // AI generated itinerary stored here
  itinerary: [{
    day: Number,
    morning: String,
    afternoon: String,
    evening: String,
    estimatedCost: Number,
  }],
  expenses: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Expense' 
  }],
}, { timestamps: true });

module.exports = mongoose.model('Trip', tripSchema);