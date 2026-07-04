import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const auth = useAuth();
  const user = auth?.user;
  const logout = auth?.logout;
  const navigate = useNavigate();

  const handleLogout = () => {
    if (logout) logout();
    navigate("/login");
  };

  return (
    <header className="border-b border-line bg-paper-raised">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber" />
          <span className="font-display font-semibold text-lg tracking-tight">QueueEase</span>
        </Link>

        <nav className="flex items-center gap-5 text-sm">
          {user ? (
            <>
              <span className="text-muted hidden sm:inline">
                {user.name} · <span className="capitalize">{user.role}</span>
              </span>
              <Link
                to={user.role === "admin" ? "/admin" : "/staff"}
                className="text-ink hover:text-amber-dark transition-colors"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="text-muted hover:text-danger transition-colors"
              >
                Log out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="px-3 py-1.5 rounded-md bg-ink text-white hover:bg-ink-light transition-colors text-sm"
            >
              Staff / Admin Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
