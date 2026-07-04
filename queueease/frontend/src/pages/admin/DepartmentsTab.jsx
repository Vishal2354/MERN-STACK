import { useEffect, useState } from "react";
import api from "../../services/api";

const emptyForm = { name: "", description: "", avgServiceTime: 10 };

export default function DepartmentsTab() {
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => {
    api.get("/departments?all=true").then((res) => setDepartments(res.data));
  };

  useEffect(load, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      if (editingId) {
        await api.patch(`/departments/${editingId}`, form);
      } else {
        await api.post("/departments", form);
      }
      setForm(emptyForm);
      setEditingId(null);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't save the department.");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (dept) => {
    setEditingId(dept._id);
    setForm({ name: dept.name, description: dept.description || "", avgServiceTime: dept.avgServiceTime });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const toggleActive = async (dept) => {
    await api.patch(`/departments/${dept._id}`, { isActive: !dept.isActive });
    load();
  };

  const remove = async (dept) => {
    if (!confirm(`Remove "${dept.name}"? If it has ticket history it will just be hidden instead.`)) return;
    await api.delete(`/departments/${dept._id}`);
    load();
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="bg-white border border-line rounded-xl p-5 mb-6 space-y-3">
        <p className="text-sm font-medium text-ink">{editingId ? "Edit department" : "Add a new department"}</p>
        <div className="grid sm:grid-cols-3 gap-3">
          <input
            placeholder="Name (e.g. Billing Counter)"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="sm:col-span-1 px-3 py-2 rounded-lg border border-line focus:outline-none focus:ring-2 focus:ring-amber/50"
          />
          <input
            placeholder="Short description (optional)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="sm:col-span-1 px-3 py-2 rounded-lg border border-line focus:outline-none focus:ring-2 focus:ring-amber/50"
          />
          <input
            type="number"
            min={1}
            placeholder="Avg minutes/person"
            value={form.avgServiceTime}
            onChange={(e) => setForm({ ...form, avgServiceTime: Number(e.target.value) })}
            className="sm:col-span-1 px-3 py-2 rounded-lg border border-line focus:outline-none focus:ring-2 focus:ring-amber/50"
          />
        </div>
        {error && <p className="text-sm text-danger">{error}</p>}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-ink text-white text-sm font-medium hover:bg-ink-light transition-colors disabled:opacity-50"
          >
            {editingId ? "Save changes" : "Add department"}
          </button>
          {editingId && (
            <button type="button" onClick={cancelEdit} className="px-4 py-2 text-sm text-muted hover:text-ink">
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="space-y-2">
        {departments.map((dept) => (
          <div key={dept._id} className="bg-white border border-line rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-ink flex items-center gap-2">
                {dept.name}
                {!dept.isActive && <span className="text-xs text-muted bg-paper px-2 py-0.5 rounded-full">hidden</span>}
              </p>
              <p className="text-xs text-muted mt-0.5">{dept.description || "No description"} &middot; ~{dept.avgServiceTime} min/person</p>
            </div>
            <div className="flex gap-3 text-xs">
              <button onClick={() => startEdit(dept)} className="text-muted hover:text-ink">Edit</button>
              <button onClick={() => toggleActive(dept)} className="text-muted hover:text-ink">
                {dept.isActive ? "Hide" : "Unhide"}
              </button>
              <button onClick={() => remove(dept)} className="text-danger hover:text-danger/80">Delete</button>
            </div>
          </div>
        ))}
        {departments.length === 0 && <p className="text-sm text-muted">No departments yet - add one above.</p>}
      </div>
    </div>
  );
}
