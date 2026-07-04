import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { getSocket } from "../../services/socket";

export default function StaffDashboardPage() {
  const { user } = useAuth();
  const departmentId = user?.department?._id;

  const [queue, setQueue] = useState({ waiting: [], active: [], totalWaiting: 0 });
  const [error, setError] = useState("");
  const [actingOn, setActingOn] = useState(null);

  const fetchQueue = useCallback(() => {
    if (!departmentId) return;
    api
      .get(`/tickets/department/${departmentId}`)
      .then((res) => setQueue(res.data))
      .catch(() => setError("Couldn't load the queue."));
  }, [departmentId]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  useEffect(() => {
    if (!departmentId) return;
    const socket = getSocket();
    socket.emit("joinDepartment", departmentId);
    socket.on("queueUpdated", fetchQueue);
    return () => {
      socket.emit("leaveDepartment", departmentId);
      socket.off("queueUpdated", fetchQueue);
    };
  }, [departmentId, fetchQueue]);

  const runAction = async (ticketId, action, extraBody) => {
    setActingOn(ticketId);
    try {
      await api.patch(`/tickets/${ticketId}/${action}`, extraBody);
      fetchQueue();
    } catch {
      setError("That action failed. Please try again.");
    } finally {
      setActingOn(null);
    }
  };

  if (!departmentId) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center text-muted">
        Your account isn't linked to a department yet. Ask an admin to assign one.
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="flex items-baseline justify-between mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink">{user.department.name}</h1>
        <span className="text-sm text-muted">{queue.totalWaiting} waiting</span>
      </div>

      {error && <p className="text-danger text-sm mb-4">{error}</p>}

      {/* Currently at the counter */}
      <section className="mb-8">
        <h2 className="text-sm font-medium text-muted uppercase tracking-wide mb-3">At the counter</h2>
        {queue.active.length === 0 && (
          <p className="text-sm text-muted bg-white border border-dashed border-line rounded-lg p-4">
            Nobody's been called yet.
          </p>
        )}
        <div className="space-y-2">
          {queue.active.map((t) => (
            <div key={t._id} className="bg-white border border-line rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="font-mono-token font-bold text-ink">{String(t.tokenNumber).padStart(3, "0")}</p>
                <p className="text-sm text-muted">{t.customerName} &middot; {t.customerPhone}</p>
              </div>
              <div className="flex gap-2">
                {t.status === "called" && (
                  <button
                    onClick={() => runAction(t._id, "serving")}
                    disabled={actingOn === t._id}
                    className="text-xs px-3 py-1.5 rounded-md bg-amber/20 text-amber-dark hover:bg-amber/30 transition-colors"
                  >
                    Mark arrived
                  </button>
                )}
                <button
                  onClick={() => runAction(t._id, "complete")}
                  disabled={actingOn === t._id}
                  className="text-xs px-3 py-1.5 rounded-md bg-success/10 text-success hover:bg-success/20 transition-colors"
                >
                  Complete
                </button>
                <button
                  onClick={() => runAction(t._id, "cancel", { noShow: true })}
                  disabled={actingOn === t._id}
                  className="text-xs px-3 py-1.5 rounded-md bg-danger/10 text-danger hover:bg-danger/20 transition-colors"
                >
                  No-show
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Waiting list */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-muted uppercase tracking-wide">Waiting</h2>
          {queue.waiting.length > 0 && (
            <button
              onClick={() => runAction(queue.waiting[0]._id, "call")}
              disabled={actingOn === queue.waiting[0]._id}
              className="text-sm px-4 py-1.5 rounded-md bg-ink text-white hover:bg-ink-light transition-colors disabled:opacity-50"
            >
              Call next &rarr;
            </button>
          )}
        </div>

        {queue.waiting.length === 0 && (
          <p className="text-sm text-muted bg-white border border-dashed border-line rounded-lg p-4">
            The waiting line is empty right now.
          </p>
        )}

        <div className="space-y-2">
          {queue.waiting.map((t, i) => (
            <div
              key={t._id}
              className={`bg-white border rounded-lg p-4 flex items-center justify-between ${
                i === 0 ? "border-amber" : "border-line"
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="font-mono-token font-bold text-ink w-12">
                  {String(t.tokenNumber).padStart(3, "0")}
                </span>
                <span className="text-sm text-muted">{t.customerName}</span>
              </div>
              {i === 0 && <span className="text-xs text-amber-dark font-medium">Up next</span>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
