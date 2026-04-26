import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post('/auth/login', form);
      login(res.data.user, res.data.token);
      navigate('/trips');
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-md p-8">

        {/* Logo */}
        <h1 className="text-2xl font-bold text-[#1D9E75] mb-1">✈️ TripSplit</h1>
        <p className="text-gray-500 text-sm mb-6">Welcome back!</p>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 text-red-500 text-sm px-4 py-2 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 font-medium">Email</label>
            <input
              name="email"
              type="email"
              placeholder="rahul@example.com"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 font-medium">Password</label>
            <input
              name="password"
              type="password"
              placeholder="Your password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1D9E75]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1D9E75] text-white py-2.5 rounded-lg font-medium hover:bg-[#178a63] transition disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-sm text-gray-500 text-center mt-4">
          Don't have an account?{" "}
          <Link to="/register" className="text-[#1D9E75] font-medium hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}