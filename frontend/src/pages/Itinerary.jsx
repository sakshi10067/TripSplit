import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

const slots = [
  { key: "morning", icon: "🌅", label: "Morning" },
  { key: "afternoon", icon: "☀️", label: "Afternoon" },
  { key: "evening", icon: "🌙", label: "Evening" },
];

export default function Itinerary() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [itinerary, setItinerary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    async function fetchTrip() {
      try {
        const res = await api.get(`/trips/${id}`);
        // Load existing itinerary if it exists
        if (res.data.itinerary?.length > 0) {
          setItinerary(res.data.itinerary);
        }
      } catch (err) {
        console.error('Failed to fetch trip:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchTrip();
  }, [id]);

  async function handleGenerate() {
    setGenerating(true);
    try {
      const res = await api.post('/itinerary/generate', { tripId: id });
      setItinerary(res.data.itinerary);
    } catch (err) {
      alert("Failed to generate itinerary. Try again!");
      console.error(err);
    } finally {
      setGenerating(false);
    }
  }

  function handleExportPDF() {
    if (!user?.isPremium) {
      alert("⭐ This is a premium feature! Upgrade to export PDF.");
      return;
    }
    alert("Exporting PDF... (coming soon)");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="p-8 text-gray-400 text-sm">Loading itinerary...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Back button */}
        <button
          onClick={() => navigate(`/trips/${id}`)}
          className="text-sm text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1"
        >
          ← Back to Dashboard
        </button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
          <h1 className="text-2xl font-bold text-gray-800">🗺️ Trip Itinerary</h1>
          <div className="flex gap-2">
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="border border-gray-200 bg-white text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition disabled:opacity-50"
            >
              {generating ? "✨ Generating..." : "🔄 Generate"}
            </button>
            <button
              onClick={handleExportPDF}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition
                ${user?.isPremium
                  ? "bg-[#1D9E75] text-white hover:bg-[#178a63]"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
            >
              {user?.isPremium ? "📄 Export PDF" : "🔒 Export PDF"}
            </button>
          </div>
        </div>

        {/* Empty state */}
        {itinerary.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-10 text-center">
            <p className="text-4xl mb-3">🤖</p>
            <p className="text-gray-600 font-medium mb-1">No itinerary yet</p>
            <p className="text-gray-400 text-sm mb-4">
              Click Generate to create an AI itinerary for this trip
            </p>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="bg-[#1D9E75] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-[#178a63] transition disabled:opacity-50"
            >
              {generating ? "✨ Generating..." : "✨ Generate Itinerary"}
            </button>
          </div>
        ) : (
          <>
            {/* Day cards */}
            <div className="space-y-4">
              {itinerary.map((day) => (
                <div
                  key={day.day}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-bold text-gray-800">
                      Day {day.day}
                    </h2>
                    <span className="text-xs bg-[#e6f7f2] text-[#1D9E75] px-3 py-1 rounded-full font-medium">
                      Est. ₹{day.estimatedCost?.toLocaleString()}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {slots.map((slot) => (
                      <div key={slot.key} className="flex gap-3">
                        <div className="w-24 shrink-0 flex items-center gap-1 text-sm text-gray-400 font-medium">
                          {slot.icon} {slot.label}
                        </div>
                        <p className="text-sm text-gray-700">{day[slot.key]}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Total cost */}
            <div className="mt-6 bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex justify-between items-center">
              <span className="text-gray-600 font-medium">
                Total Estimated Cost
              </span>
              <span className="text-xl font-bold text-[#1D9E75]">
                ₹{itinerary
                  .reduce((sum, d) => sum + (d.estimatedCost || 0), 0)
                  .toLocaleString()}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}