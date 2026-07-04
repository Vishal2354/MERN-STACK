import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../services/api";
import { getSocket } from "../../services/socket";
import TicketStub from "../../components/TicketStub";

export default function TicketStatusPage() {
  const { ticketId } = useParams();
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const fetchTicket = useCallback(() => {
    api
      .get(`/tickets/${ticketId}`)
      .then((res) => setTicket(res.data))
      .catch(() => setError("This ticket couldn't be found."));
  }, [ticketId]);

  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  // Once we know which department this ticket belongs to, subscribe to
  // that department's room so the position/status updates live, without
  // the customer needing to refresh the page while they wait.
  useEffect(() => {
    if (!ticket?.department?._id) return;

    const socket = getSocket();
    const deptId = ticket.department._id;

    socket.emit("joinDepartment", deptId);
    socket.on("queueUpdated", fetchTicket);

    return () => {
      socket.emit("leaveDepartment", deptId);
      socket.off("queueUpdated", fetchTicket);
    };
  }, [ticket?.department?._id, fetchTicket]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await api.patch(`/tickets/${ticketId}/cancel`);
      fetchTicket();
    } catch {
      setError("Couldn't cancel the ticket. Please try again.");
    } finally {
      setCancelling(false);
    }
  };

  if (error) {
    return (
      <div className="max-w-md mx-auto px-6 py-16 text-center">
        <p className="text-danger mb-4">{error}</p>
        <Link to="/" className="text-ink underline">Go back home</Link>
      </div>
    );
  }

  if (!ticket) {
    return <div className="text-center py-16 text-muted">Loading your ticket...</div>;
  }

  const isActive = ["waiting", "called", "serving"].includes(ticket.status);

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <TicketStub
        tokenNumber={ticket.tokenNumber}
        departmentName={ticket.department?.name}
        status={ticket.status}
      />

      {ticket.status === "waiting" && (
        <div className="mt-8 grid grid-cols-2 gap-4 text-center">
          <div className="bg-white border border-line rounded-lg py-4">
            <p className="font-display text-2xl font-semibold text-ink">{ticket.position}</p>
            <p className="text-xs text-muted mt-1">people ahead + you</p>
          </div>
          <div className="bg-white border border-line rounded-lg py-4">
            <p className="font-display text-2xl font-semibold text-ink">~{ticket.estimatedWaitMinutes}</p>
            <p className="text-xs text-muted mt-1">minutes estimated</p>
          </div>
        </div>
      )}

      {ticket.status === "called" && (
        <p className="text-center text-ink font-medium mt-6">
          Please head to the counter now - you're up next.
        </p>
      )}

      {ticket.status === "completed" && (
        <p className="text-center text-success mt-6">Thanks for visiting. This ticket is now closed.</p>
      )}

      {isActive && (
        <button
          onClick={handleCancel}
          disabled={cancelling}
          className="w-full mt-6 text-sm text-muted hover:text-danger transition-colors disabled:opacity-50"
        >
          {cancelling ? "Cancelling..." : "Cancel this ticket"}
        </button>
      )}

      <p className="text-center text-xs text-muted mt-8">
        Keep this page open or bookmark it - your position updates automatically.
      </p>
    </div>
  );
}
