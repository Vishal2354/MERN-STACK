import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function HomePage() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/departments")
      .then((res) => setDepartments(res.data))
      .catch(() => setError("Couldn't load departments. Is the backend running?"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <div className="mb-10 text-center">
        <p className="text-amber-dark text-sm font-medium tracking-wide mb-2">No more standing around</p>
        <h1 className="font-display text-4xl font-semibold text-ink mb-3">
          Join a queue in seconds
        </h1>
        <p className="text-muted max-w-md mx-auto">
          Pick where you need to go. We'll give you a ticket and let you know when it's your turn - from wherever you're waiting.
        </p>
      </div>

      {loading && <p className="text-center text-muted">Loading departments...</p>}
      {error && <p className="text-center text-danger">{error}</p>}

      <div className="grid sm:grid-cols-2 gap-4">
        {departments.map((dept) => (
          <button
            key={dept._id}
            onClick={() => navigate(`/join/${dept._id}`)}
            className="text-left bg-white border border-line rounded-xl p-5 hover:border-amber hover:shadow-md transition-all group"
          >
            <h3 className="font-display font-semibold text-lg text-ink group-hover:text-amber-dark transition-colors">
              {dept.name}
            </h3>
            {dept.description && <p className="text-sm text-muted mt-1">{dept.description}</p>}
            <p className="text-xs text-muted mt-3">~{dept.avgServiceTime} min per person</p>
          </button>
        ))}
      </div>

      {!loading && departments.length === 0 && !error && (
        <p className="text-center text-muted mt-8">
          No departments are open right now. Please check back later.
        </p>
      )}

      <p className="text-center text-xs text-muted mt-12">
        Already have a ticket? Check your ticket link from earlier, or ask staff to resend it.
      </p>
    </div>
  );
}
