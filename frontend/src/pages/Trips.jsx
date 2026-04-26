import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

const vibeColors = {
  adventure: "bg-orange-100 text-orange-600",
  relaxed: "bg-blue-100 text-blue-600",
  "food-focused": "bg-yellow-100 text-yellow-700",
  culture: "bg-purple-100 text-purple-600",
};

export default function Trips() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    title: "",
    destination: "",
    startDate: "",
    endDate: "",
    budgetPerPerson: "",
    vibe: "relaxed",
  });

  // Fetch trips from backend on page load
  useEffect(() => {
    async function fetchTrips() {
      try {
        const res = await api.get('/trips');
        setTrips(res.data);
      } catch (err) {
        console.error('Failed to fetch trips:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchTrips();
  }, []);

  function handleFormChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleCreateTrip() {
    if (!form.title || !form.destination) {
      alert("Please fill in title and destination");
      return;
    }
    try {
      const res = await api.post('/trips', {
        title: form.title,
        destination: form.destination,
        dates: { start: form.startDate, end: form.endDate },
        budgetPerPerson: Number(form.budgetPerPerson),
        vibe: form.vibe,
      });
      // Add new trip to list
      setTrips([...trips, res.data]);
      setShowModal(false);
      setForm({ title: "", destination: "", startDate: "", endDate: "", budgetPerPerson: "", vibe: "relaxed" });
    } catch (err) {
      alert("Failed to create trip");
      console.error(err);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            {user?.name}'s Trips
          </h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-[#1D9E75] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#178a63] transition"
          >
            + New Trip
          </button>
        </div>

        {/* Loading state */}
        {loading ? (
          <p className="text-gray-400 text-sm">Loading trips...</p>
        ) : trips.length === 0 ? (
          <p className="text-gray-400 text-sm">No trips yet. Create one!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {trips.map((trip) => (
              <div
                key={trip._id}
                onClick={() => navigate(`/trips/${trip._id}`)}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 cursor-pointer hover:shadow-md transition"
              >
                <h2 className="text-lg font-semibold text-gray-800 mb-1">
                  {trip.title}
                </h2>
                <p className="text-sm text-gray-500 mb-3">
                  📍 {trip.destination}
                </p>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${vibeColors[trip.vibe]}`}>
                  {trip.vibe}
                </span>
                <div className="mt-4 text-sm text-gray-500 space-y-1">
                  <p>📅 {trip.dates?.start} → {trip.dates?.end}</p>
                  <p>💰 ₹{trip.budgetPerPerson?.toLocaleString()} / person</p>
                  <p>👥 {trip.members?.length} members</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Trip Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Create New Trip</h2>
            <div className="space-y-3">
              <input
                name="title"
                placeholder="Trip title"
                value={form.title}
                onChange={handleFormChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
              />
              <input
                name="destination"
                placeholder="Destination"
                value={form.destination}
                onChange={handleFormChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
              />
              <div className="flex gap-2">
                <input
                  type="date"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleFormChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
                />
                <input
                  type="date"
                  name="endDate"
                  value={form.endDate}
                  onChange={handleFormChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
                />
              </div>
              <input
                type="number"
                name="budgetPerPerson"
                placeholder="Budget per person (₹)"
                value={form.budgetPerPerson}
                onChange={handleFormChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
              />
              <select
                name="vibe"
                value={form.vibe}
                onChange={handleFormChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
              >
                <option value="relaxed">😌 Relaxed</option>
                <option value="adventure">🧗 Adventure</option>
                <option value="food-focused">🍜 Food-focused</option>
                <option value="culture">🏛️ Culture</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setShowModal(false)}
                className="border border-gray-200 bg-white text-gray-600 px-4 py-2 rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTrip}
                className="bg-[#1D9E75] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#178a63]"
              >
                Create Trip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}