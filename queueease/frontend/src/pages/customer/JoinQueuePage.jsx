import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../../services/api";

export default function JoinQueuePage() {
  const { departmentId } = useParams();
  const navigate = useNavigate();

  const [department, setDepartment] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/departments/${departmentId}`)
      .then((res) => setDepartment(res.data))
      .catch(() => setError("This department couldn't be found."));
  }, [departmentId]);

  const isValidPhone = (value) => {
    const digits = value.replace(/\D/g, "");
    return digits.length >= 7 && digits.length <= 15;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName) {
      setError("Please enter your name.");
      return;
    }

    if (trimmedName.length < 2) {
      setError("Please enter a valid name.");
      return;
    }

    if (!trimmedPhone) {
      setError("Please enter your phone number.");
      return;
    }

    if (!isValidPhone(trimmedPhone)) {
      setError("Please enter a valid phone number with at least 7 digits.");
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post("/tickets/join", {
        departmentId,
        customerName: trimmedName,
        customerPhone: trimmedPhone,
      });
      navigate(`/ticket/${data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <Link to="/" className="text-sm text-muted hover:text-ink transition-colors">
        &larr; Back to departments
      </Link>

      <div className="mt-6 mb-8">
        <h1 className="font-display text-2xl font-semibold text-ink">
          {department ? department.name : "Join queue"}
        </h1>
        {department?.description && <p className="text-muted text-sm mt-1">{department.description}</p>}
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-line rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">Your name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            className="w-full px-3.5 py-2.5 rounded-lg border border-line focus:outline-none focus:ring-2 focus:ring-amber/50 focus:border-amber"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">Phone number</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="For a call if it's urgent"
            className="w-full px-3.5 py-2.5 rounded-lg border border-line focus:outline-none focus:ring-2 focus:ring-amber/50 focus:border-amber"
          />
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-ink text-white font-medium py-2.5 rounded-lg hover:bg-ink-light transition-colors disabled:opacity-50"
        >
          {submitting ? "Getting your ticket..." : "Get my ticket"}
        </button>
      </form>
    </div>
  );
}
