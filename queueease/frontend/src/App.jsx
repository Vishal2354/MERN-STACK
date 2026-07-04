import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import HomePage from "./pages/customer/HomePage";
import JoinQueuePage from "./pages/customer/JoinQueuePage";
import TicketStatusPage from "./pages/customer/TicketStatusPage";
import LoginPage from "./pages/LoginPage";
import StaffDashboardPage from "./pages/staff/StaffDashboardPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";

export default function App() {
  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/join/:departmentId" element={<JoinQueuePage />} />
        <Route path="/ticket/:ticketId" element={<TicketStatusPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/staff"
          element={
            <ProtectedRoute role="staff">
              <StaffDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}
