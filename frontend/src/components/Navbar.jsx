import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <nav className="bg-white border-b border-gray-100 shadow-sm px-6 py-4 flex items-center justify-between">
      {/* Logo */}
      <span className="text-xl font-bold text-[#1D9E75]">✈️ TripSplit</span>

      {/* User info */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500 hidden sm:block">
          {user?.email}
        </span>
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-[#1D9E75] text-white flex items-center justify-center font-semibold text-sm">
          {user?.name?.charAt(0) || "?"}
        </div>
        {/* Logout */}
        <button
          onClick={handleLogout}
          className="text-sm text-gray-400 hover:text-red-500 transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}