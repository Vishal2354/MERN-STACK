// Styled like a physical queue ticket stub, complete with a perforated edge.
// This is the one recognizable visual signature of the app - everywhere a
// customer sees their token, it looks like something tangible they were handed.
export default function TicketStub({ tokenNumber, departmentName, status }) {
  const statusCopy = {
    waiting: { label: "Waiting", color: "text-amber-dark", dot: "bg-amber" },
    called: { label: "You're being called", color: "text-ink", dot: "bg-ink" },
    serving: { label: "In progress", color: "text-ink", dot: "bg-ink" },
    completed: { label: "Completed", color: "text-success", dot: "bg-success" },
    cancelled: { label: "Cancelled", color: "text-muted", dot: "bg-muted" },
    "no-show": { label: "Marked as no-show", color: "text-danger", dot: "bg-danger" },
  }[status] || { label: status, color: "text-muted", dot: "bg-muted" };

  return (
    <div className="ticket-perforation bg-white border border-line rounded-2xl shadow-sm px-8 py-10 text-center max-w-sm mx-auto">
      <p className="text-xs uppercase tracking-widest text-muted mb-1">{departmentName}</p>
      <p className="font-mono-token font-bold text-6xl text-ink leading-none my-4">
        {String(tokenNumber).padStart(3, "0")}
      </p>
      <div className={`flex items-center justify-center gap-2 text-sm font-medium ${statusCopy.color}`}>
        <span className={`w-2 h-2 rounded-full ${statusCopy.dot}`} />
        {statusCopy.label}
      </div>
    </div>
  );
}
