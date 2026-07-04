import { useState } from "react";
import DepartmentsTab from "./DepartmentsTab";
import StaffTab from "./StaffTab";
import StatsTab from "./StatsTab";

const TABS = [
  { key: "stats", label: "Overview" },
  { key: "departments", label: "Departments" },
  { key: "staff", label: "Staff accounts" },
];

export default function AdminDashboardPage() {
  const [tab, setTab] = useState("stats");

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="font-display text-2xl font-semibold text-ink mb-6">Admin</h1>

      <div className="flex flex-nowrap gap-1 border-b border-line mb-6 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
              tab === t.key ? "border-amber text-ink" : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "stats" && <StatsTab />}
      {tab === "departments" && <DepartmentsTab />}
      {tab === "staff" && <StaffTab />}
    </div>
  );
}
