import { useEffect, useState } from "react";
import api from "../../services/api";

const emptyForm = { name: "", email: "", password: "", department: "" };

export default function StaffTab() {
  const [departments, setDepartments] = useState([]);
  const [staffAccounts, setStaffAccounts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const departmentsRes = await api.get("/departments?all=true");
        setDepartments(departmentsRes.data || []);
      } catch (err) {
        console.error("Failed to load departments", err);
        setDepartments([]);
      }
    };

    const loadStaffAccounts = async () => {
      try {
        const staffRes = await api.get("/auth/staff");
        setStaffAccounts(staffRes.data || []);
      } catch (err) {
        console.error("Failed to load staff accounts", err);
        setStaffAccounts([]);
      }
    };

    loadDepartments();
    loadStaffAccounts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.department) {
      setError("Please assign this staff member to a department.");
      return;
    }

    setSaving(true);
    try {
      await api.post("/auth/register", { ...form, role: "staff" });
      const staffRes = await api.get("/auth/staff");
      setStaffAccounts(staffRes.data || []);
      setSuccess(`Account created for ${form.name}. Share the email and password with them.`);
      setForm(emptyForm);
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't create the account.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-md">
      <p className="text-sm text-muted mb-4">
        Create a login for counter staff. Each staff account is tied to one department and can only manage that department's queue.
      </p>

      <form onSubmit={handleSubmit} className="bg-white border border-line rounded-xl p-5 space-y-3">
        <input
          placeholder="Full name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border border-line focus:outline-none focus:ring-2 focus:ring-amber/50"
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border border-line focus:outline-none focus:ring-2 focus:ring-amber/50"
        />
        <input
          type="password"
          placeholder="Temporary password (min 6 chars)"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border border-line focus:outline-none focus:ring-2 focus:ring-amber/50"
        />
        <select
          value={form.department}
          onChange={(e) => setForm({ ...form, department: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border border-line focus:outline-none focus:ring-2 focus:ring-amber/50"
        >
          <option value="">Assign a department...</option>
          <option value="all">All departments</option>
          {departments.map((d) => (
            <option key={d._id} value={d._id}>{d.name}</option>
          ))}
        </select>

        {error && <p className="text-sm text-danger">{error}</p>}
        {success && <p className="text-sm text-success">{success}</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-full px-4 py-2.5 rounded-lg bg-ink text-white text-sm font-medium hover:bg-ink-light transition-colors disabled:opacity-50"
        >
          {saving ? "Creating..." : "Create staff account"}
        </button>
      </form>

      <div className="mt-6">
        <p className="text-sm font-medium text-muted uppercase tracking-wide mb-3">Existing staff accounts</p>
        <div className="space-y-2">
          {staffAccounts.length === 0 && <p className="text-sm text-muted">No staff accounts yet.</p>}
          {staffAccounts.map((staff) => (
            <div key={staff._id} className="bg-white border border-line rounded-lg p-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-medium text-ink">{staff.name}</p>
                <p className="text-sm text-muted">{staff.email}</p>
              </div>
              <p className="text-sm text-muted">
                {staff.department?.name || "No department assigned"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
