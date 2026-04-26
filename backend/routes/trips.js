const express = require('express');
const router = express.Router();
const Trip = require('../models/Trip');
const verifyToken = require('../middleware/verifyToken');

// POST /api/trips — create a new trip
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, destination, dates, budgetPerPerson, vibe } = req.body;

    const trip = await Trip.create({
      title,
      destination,
      dates,
      budgetPerPerson,
      vibe,
      createdBy: req.user._id,
      members: [req.user._id], // creator is automatically a member
    });

    res.status(201).json(trip);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/trips — get all trips for logged-in user
router.get('/', verifyToken, async (req, res) => {
  try {
    const trips = await Trip.find({ members: req.user._id });
    res.json(trips);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/trips/:id — get single trip
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate('members', 'name email')
      .populate('expenses');

    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    res.json(trip);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/trips/:id/join — join a trip via invite link
router.post('/:id/join', verifyToken, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    // Check if already a member
    if (trip.members.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already a member' });
    }

    trip.members.push(req.user._id);
    await trip.save();

    res.json({ message: 'Joined trip successfully', trip });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;