import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Wrap any staff/admin page in this. If `role` is passed, it also enforces
// that the logged-in user has that exact role (e.g. keeps staff out of /admin).
export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-ink/60">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}
