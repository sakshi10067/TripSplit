const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
const Trip = require('../models/Trip');
const verifyToken = require('../middleware/verifyToken');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// POST /api/itinerary/generate
router.post('/generate', verifyToken, async (req, res) => {
  try {
    const { tripId } = req.body;

    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    const start = new Date(trip.dates.start);
    const end = new Date(trip.dates.end);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    const prompt = `
      You are a travel planner. Create a detailed day-by-day itinerary for a trip with these details:
      - Destination: ${trip.destination}
      - Number of days: ${days}
      - Budget per person: ₹${trip.budgetPerPerson}
      - Vibe: ${trip.vibe}
      - Number of people: ${trip.members.length}

      Return ONLY a JSON array with exactly ${days} objects. No extra text, no markdown, just raw JSON.
      Each object must have exactly these fields:
      {
        "day": 1,
        "morning": "activity description",
        "afternoon": "activity description",
        "evening": "activity description",
        "estimatedCost": 1500
      }
    `;

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
    });

    const text = completion.choices[0]?.message?.content || '';

    // Clean and parse JSON
    const cleaned = text.replace(/```json|```/g, '').trim();
    const itinerary = JSON.parse(cleaned);

    // Save to trip
    trip.itinerary = itinerary;
    await trip.save();

    res.json({ itinerary });
  } catch (err) {
    console.error('Groq error:', err);
    res.status(500).json({ message: 'Failed to generate itinerary', error: err.message });
  }
});

module.exports = router;