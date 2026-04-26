import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";

const categoryColors = {
  food: "bg-yellow-100 text-yellow-700",
  travel: "bg-blue-100 text-blue-600",
  stay: "bg-purple-100 text-purple-600",
  other: "bg-gray-100 text-gray-600",
};

const categoryIcons = {
  food: "🍜",
  travel: "🚗",
  stay: "🏨",
  other: "📦",
};

export default function Expenses() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [expenses, setExpenses] = useState([]);
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    description: "",
    amount: "",
    category: "food",
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [tripRes, expenseRes] = await Promise.all([
          api.get(`/trips/${id}`),
          api.get(`/expenses/${id}`),
        ]);
        setTrip(tripRes.data);
        setExpenses(expenseRes.data);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  function handleFormChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleAddExpense() {
    if (!form.description || !form.amount) {
      alert("Please fill in all fields");
      return;
    }
    try {
      const res = await api.post('/expenses', {
        tripId: id,
        description: form.description,
        amount: Number(form.amount),
        category: form.category,
        // Split between all trip members by default
        splitBetween: trip.members.map((m) => m._id),
      });
      setExpenses([...expenses, res.data]);
      setShowModal(false);
      setForm({ description: "", amount: "", category: "food" });
    } catch (err) {
      alert("Failed to add expense");
      console.error(err);
    }
  }

  async function handleSettle(expenseId) {
    try {
      await api.patch(`/expenses/${expenseId}/settle`);
      setExpenses(expenses.map((e) =>
        e._id === expenseId ? { ...e, settled: true } : e
      ));
    } catch (err) {
      alert("Failed to settle expense");
    }
  }

  // Calculate settlements — who owes whom
  function calculateSettlements() {
    if (!trip || expenses.length === 0) return [];

    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
    const share = totalSpent / trip.members.length;

    // How much each member paid
    const paid = {};
    trip.members.forEach((m) => { paid[m._id] = { name: m.name, amount: 0 }; });
    expenses.forEach((e) => {
      const payerId = e.paidBy?._id || e.paidBy;
      if (paid[payerId]) paid[payerId].amount += e.amount;
    });

    // Balance = paid - share (positive = gets back, negative = owes)
    const balances = Object.entries(paid).map(([id, data]) => ({
      id,
      name: data.name,
      balance: data.amount - share,
    }));

    // Generate settlement transactions
    const settlements = [];
    const debtors = balances.filter((b) => b.balance < -1).sort((a, b) => a.balance - b.balance);
    const creditors = balances.filter((b) => b.balance > 1).sort((a, b) => b.balance - a.balance);

    let i = 0, j = 0;
    while (i < debtors.length && j < creditors.length) {
      const amount = Math.min(Math.abs(debtors[i].balance), creditors[j].balance);
      settlements.push({
        from: debtors[i].name,
        to: creditors[j].name,
        amount: Math.round(amount),
      });
      debtors[i].balance += amount;
      creditors[j].balance -= amount;
      if (Math.abs(debtors[i].balance) < 1) i++;
      if (Math.abs(creditors[j].balance) < 1) j++;
    }

    return settlements;
  }

  const settlements = calculateSettlements();
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="p-8 text-gray-400 text-sm">Loading expenses...</div>
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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">💸 Expenses</h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-[#1D9E75] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#178a63] transition"
          >
            + Add Expense
          </button>
        </div>

        {/* Total spent */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-6 flex justify-between items-center">
          <span className="text-gray-500 text-sm">Total Spent</span>
          <span className="text-xl font-bold text-red-500">
            ₹{total.toLocaleString()}
          </span>
        </div>

        {/* Expense list */}
        {expenses.length === 0 ? (
          <p className="text-gray-400 text-sm mb-8">No expenses yet. Add one!</p>
        ) : (
          <div className="space-y-3 mb-8">
            {expenses.map((expense) => (
              <div
                key={expense._id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${categoryColors[expense.category]}`}>
                    {categoryIcons[expense.category]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {expense.description}
                    </p>
                    <p className="text-xs text-gray-400">
                      Paid by {expense.paidBy?.name || "You"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-semibold text-gray-700">
                    ₹{expense.amount.toLocaleString()}
                  </span>
                  {expense.settled ? (
                    <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                      Settled ✓
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSettle(expense._id)}
                      className="text-xs border border-gray-200 text-gray-500 px-2 py-1 rounded-full hover:bg-gray-50"
                    >
                      Settle
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Settle up section */}
        {settlements.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Settle Up
            </h2>
            <div className="space-y-3">
              {settlements.map((s, i) => (
                <div key={i} className="flex items-center justify-between">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium text-red-500">{s.from}</span>
                    {" owes "}
                    <span className="font-medium text-[#1D9E75]">{s.to}</span>
                    {" ₹"}{s.amount.toLocaleString()}
                  </p>
                  <button
                    onClick={() => alert("Razorpay coming soon!")}
                    className="bg-[#1D9E75] text-white text-xs px-3 py-1.5 rounded-lg hover:bg-[#178a63] transition"
                  >
                    Pay Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Add Expense
            </h2>
            <div className="space-y-3">
              <input
                name="description"
                placeholder="Description (e.g. Dinner at shack)"
                value={form.description}
                onChange={handleFormChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
              />
              <input
                type="number"
                name="amount"
                placeholder="Amount (₹)"
                value={form.amount}
                onChange={handleFormChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
              />
              <select
                name="category"
                value={form.category}
                onChange={handleFormChange}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
              >
                <option value="food">🍜 Food</option>
                <option value="travel">🚗 Travel</option>
                <option value="stay">🏨 Stay</option>
                <option value="other">📦 Other</option>
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
                onClick={handleAddExpense}
                className="bg-[#1D9E75] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#178a63]"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}