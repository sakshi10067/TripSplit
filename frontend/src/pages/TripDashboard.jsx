import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../utils/api";

export default function TripDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch trip and expenses at the same time
        const [tripRes, expenseRes] = await Promise.all([
          api.get(`/trips/${id}`),
          api.get(`/expenses/${id}`),
        ]);
        setTrip(tripRes.data);
        setExpenses(expenseRes.data);
      } catch (err) {
        console.error('Failed to fetch trip:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="p-8 text-gray-400 text-sm">Loading trip...</div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="p-8 text-gray-400 text-sm">Trip not found.</div>
      </div>
    );
  }

  // Calculate stats from real expenses
  const totalBudget = trip.budgetPerPerson * (trip.members?.length || 1);
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const remaining = totalBudget - totalSpent;

  // Calculate who owes whom
  // Each member's share = totalSpent / number of members
  const share = totalSpent / (trip.members?.length || 1);

  // How much each member paid
  const paid = {};
  trip.members?.forEach((m) => { paid[m._id] = 0; });
  expenses.forEach((e) => {
    const payerId = e.paidBy?._id || e.paidBy;
    if (paid[payerId] !== undefined) {
      paid[payerId] += e.amount;
    }
  });

  // owes = share - paid (positive = owes money, negative = gets back money)
  const balances = trip.members?.map((member) => ({
    ...member,
    owes: share - (paid[member._id] || 0),
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Back button */}
        <button
          onClick={() => navigate("/trips")}
          className="text-sm text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1"
        >
          ← Back to Trips
        </button>

        {/* Trip header */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">{trip.title}</h1>
          <p className="text-gray-500 text-sm mt-1">📍 {trip.destination}</p>
          <p className="text-gray-500 text-sm">
            📅 {trip.dates?.start} → {trip.dates?.end}
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <StatCard
            label="Total Budget"
            value={`₹${totalBudget.toLocaleString()}`}
            color="text-gray-800"
          />
          <StatCard
            label="Total Spent"
            value={`₹${totalSpent.toLocaleString()}`}
            color="text-red-500"
          />
          <StatCard
            label="Remaining"
            value={`₹${remaining.toLocaleString()}`}
            color={remaining >= 0 ? "text-[#1D9E75]" : "text-red-500"}
          />
        </div>

        {/* Members */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Members</h2>
          <div className="space-y-3">
            {balances?.map((member) => (
              <div key={member._id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#1D9E75] text-white flex items-center justify-center font-semibold text-sm">
                    {member.name?.charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {member.name}
                  </span>
                </div>

                {/* Balance badge */}
                {Math.abs(member.owes) < 1 ? (
                  <span className="text-xs bg-green-100 text-green-600 px-3 py-1 rounded-full font-medium">
                    Settled ✓
                  </span>
                ) : member.owes > 0 ? (
                  <span className="text-xs bg-red-100 text-red-500 px-3 py-1 rounded-full font-medium">
                    Owes ₹{Math.round(member.owes).toLocaleString()}
                  </span>
                ) : (
                  <span className="text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded-full font-medium">
                    Gets back ₹{Math.round(Math.abs(member.owes)).toLocaleString()}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate(`/trips/${id}/itinerary`)}
            className="flex-1 bg-[#1D9E75] text-white py-3 rounded-xl font-medium hover:bg-[#178a63] transition"
          >
            🗺️ View Itinerary
          </button>
          <button
            onClick={() => navigate(`/trips/${id}/expenses`)}
            className="flex-1 border border-gray-200 bg-white text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition"
          >
            💸 View Expenses
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}