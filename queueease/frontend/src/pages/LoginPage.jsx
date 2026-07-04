import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const trimmedEmail = email.trim();
      const trimmedPassword = password.trim();
      const data = await login(trimmedEmail, trimmedPassword);
      navigate(data.role === "admin" ? "/admin" : "/staff");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto px-6 py-20">
      <h1 className="font-display text-2xl font-semibold text-ink mb-1">Staff / admin login</h1>
      <p className="text-muted text-sm mb-8">
        Use your staff or administrator account to sign in. Your session stays stored in the browser so you remain signed in across refreshes unless you log out or your token expires.
      </p>

      <form onSubmit={handleSubmit} className="bg-white border border-line rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg border border-line focus:outline-none focus:ring-2 focus:ring-amber/50 focus:border-amber"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg border border-line focus:outline-none focus:ring-2 focus:ring-amber/50 focus:border-amber"
          />
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-ink text-white font-medium py-2.5 rounded-lg hover:bg-ink-light transition-colors disabled:opacity-50"
        >
          {submitting ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="text-xs text-muted mt-6 text-center">
        Demo accounts (after running <code className="font-mono-token">npm run seed</code>):<br />
        admin@queueease.com / admin123 &middot; staff@queueease.com / staff123
      </p>
    </div>
  );
}
