const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const Trip = require('../models/Trip');
const verifyToken = require('../middleware/verifyToken');

// POST /api/expenses — add a new expense
router.post('/', verifyToken, async (req, res) => {
  try {
    const { tripId, amount, description, category, splitBetween } = req.body;

    const expense = await Expense.create({
      tripId,
      amount,
      description,
      category,
      splitBetween,
      paidBy: req.user._id,
    });

    // Add expense reference to the trip
    await Trip.findByIdAndUpdate(tripId, {
      $push: { expenses: expense._id }
    });

    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/expenses/:tripId — get all expenses for a trip
router.get('/:tripId', verifyToken, async (req, res) => {
  try {
    const expenses = await Expense.find({ tripId: req.params.tripId })
      .populate('paidBy', 'name email');
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PATCH /api/expenses/:id/settle — mark expense as settled
router.patch('/:id/settle', verifyToken, async (req, res) => {
  try {
    const expense = await Expense.findByIdAndUpdate(
      req.params.id,
      { settled: true },
      { new: true }
    );
    res.json(expense);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;