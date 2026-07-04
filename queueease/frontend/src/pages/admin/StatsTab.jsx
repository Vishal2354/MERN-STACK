import { useEffect, useState } from "react";
import api from "../../services/api";

export default function StatsTab() {
  const [overview, setOverview] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/stats/overview")
      .then((res) => setOverview(res.data))
      .catch(() => setError("Couldn't load stats."));
  }, []);

  if (error) return <p className="text-danger text-sm">{error}</p>;

  const totals = overview.reduce(
    (acc, d) => ({
      total: acc.total + d.total,
      completed: acc.completed + d.completed,
      waiting: acc.waiting + d.waiting,
    }),
    { total: 0, completed: 0, waiting: 0 }
  );

  return (
    <div>
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Tickets today" value={totals.total} />
        <StatCard label="Completed" value={totals.completed} accent="text-success" />
        <StatCard label="Currently waiting" value={totals.waiting} accent="text-amber-dark" />
      </div>

      <p className="text-sm font-medium text-muted uppercase tracking-wide mb-3">By department</p>
      <div className="space-y-2">
        {overview.map((d) => (
          <div key={d.department._id} className="bg-white border border-line rounded-lg p-4 flex items-center justify-between">
            <p className="font-medium text-ink">{d.department.name}</p>
            <div className="flex gap-6 text-sm text-muted">
              <span>{d.total} total</span>
              <span className="text-success">{d.completed} done</span>
              <span className="text-amber-dark">{d.waiting} waiting</span>
              <span className="text-danger">{d.cancelled} cancelled</span>
            </div>
          </div>
        ))}
        {overview.length === 0 && <p className="text-sm text-muted">No departments to show yet.</p>}
      </div>
    </div>
  );
}

function StatCard({ label, value, accent = "text-ink" }) {
  return (
    <div className="bg-white border border-line rounded-xl p-5 text-center">
      <p className={`font-display text-3xl font-semibold ${accent}`}>{value}</p>
      <p className="text-xs text-muted mt-1">{label}</p>
    </div>
  );
}
