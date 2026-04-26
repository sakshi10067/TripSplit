import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Trips from "./pages/Trips";
import TripDashboard from "./pages/TripDashboard";
import Itinerary from "./pages/Itinerary";
import Expenses from "./pages/Expenses";
import Login from "./pages/Login";
import Register from "./pages/Register";

// Protect routes — redirect to login if not logged in
function PrivateRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route path="/" element={<Navigate to="/trips" />} />
        <Route path="/trips" element={<PrivateRoute><Trips /></PrivateRoute>} />
        <Route path="/trips/:id" element={<PrivateRoute><TripDashboard /></PrivateRoute>} />
        <Route path="/trips/:id/itinerary" element={<PrivateRoute><Itinerary /></PrivateRoute>} />
        <Route path="/trips/:id/expenses" element={<PrivateRoute><Expenses /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}