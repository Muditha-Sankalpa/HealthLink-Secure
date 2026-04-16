import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../../components/shared/AdminNavbar";

// ── Constants ─────────────────────────────────────────────────────────────────
const API = `${import.meta.env.VITE_API_BASE_URL}/api/appointments`;

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const STATUS_META = {
  Scheduled: { color: "#5B65DC", bg: "#EEEFFD", text: "#5B65DC", label: "Scheduled" },
  Completed:  { color: "#16A34A", bg: "#f0fdf4", text: "#16A34A", label: "Completed"  },
  Cancelled:  { color: "#DC2626", bg: "#fef2f2", text: "#DC2626", label: "Cancelled"  },
};

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-LK", { weekday: "short", year: "numeric", month: "short", day: "numeric" });

const todayStr = () => new Date().toISOString().split("T")[0];

// ── Admin Role Guard ──────────────────────────────────────────────────────────
const useAdminGuard = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/login"); return; }
    try {
      const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
      const role = Array.isArray(payload.role) ? payload.role[0] : payload.role;
      if (role !== "Admin") navigate("/login");
    } catch { navigate("/login"); }
  }, [navigate]);
};

// ── Donut Chart ───────────────────────────────────────────────────────────────
const DonutChart = ({ scheduled, completed, cancelled }) => {
  const total = scheduled + completed + cancelled;
  if (total === 0) return (
    <div className="flex items-center justify-center h-40 text-gray-300 text-sm">No data</div>
  );

  const slices = [
    { value: scheduled, color: "#5B65DC", label: "Scheduled" },
    { value: completed, color: "#16A34A", label: "Completed" },
    { value: cancelled, color: "#DC2626", label: "Cancelled" },
  ];

  const r = 54, cx = 70, cy = 70, strokeW = 18;
  const circumference = 2 * Math.PI * r;
  let offset = 0;

  const arcs = slices.map((s) => {
    const dash = (s.value / total) * circumference;
    const arc = { ...s, dash, offset, pct: Math.round((s.value / total) * 100) };
    offset += dash;
    return arc;
  });

  return (
    <div className="flex items-center gap-6">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f3f4f6" strokeWidth={strokeW} />
        {arcs.map((arc) => (
          <circle
            key={arc.label}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={arc.color}
            strokeWidth={strokeW}
            strokeDasharray={`${arc.dash} ${circumference - arc.dash}`}
            strokeDashoffset={-arc.offset + circumference * 0.25}
            strokeLinecap="butt"
          />
        ))}
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize="22" fontWeight="700" fill="#122056">{total}</text>
        <text x={cx} y={cy + 14} textAnchor="middle" fontSize="10" fill="#8a90b8">total</text>
      </svg>
      <div className="flex flex-col gap-2.5">
        {arcs.map((arc) => (
          <div key={arc.label} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: arc.color }} />
            <span className="text-xs text-gray-500 w-20">{arc.label}</span>
            <span className="text-xs font-bold" style={{ color: arc.color }}>{arc.pct}%</span>
            <span className="text-xs text-gray-400">({arc.value})</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Bar Chart (last 7 days) ───────────────────────────────────────────────────
const WeekBarChart = ({ appointments }) => {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });

  const bars = days.map((day) => {
    const dayAppts = appointments.filter(
      (a) => new Date(a.date).toISOString().split("T")[0] === day
    );
    return {
      day,
      label: new Date(day + "T00:00:00").toLocaleDateString("en-LK", { weekday: "short" }),
      scheduled: dayAppts.filter((a) => a.status === "Scheduled").length,
      completed: dayAppts.filter((a) => a.status === "Completed").length,
      cancelled: dayAppts.filter((a) => a.status === "Cancelled").length,
      total: dayAppts.length,
    };
  });

  const maxVal = Math.max(...bars.map((b) => b.total), 1);
  const BAR_H = 120;

  return (
    <div>
      <div className="flex items-end gap-2 h-36">
        {bars.map((b) => (
          <div key={b.day} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[10px] text-gray-400">{b.total || ""}</span>
            <div className="w-full flex flex-col-reverse rounded-t overflow-hidden" style={{ height: `${(b.total / maxVal) * BAR_H}px`, minHeight: b.total ? 4 : 2, background: b.total ? undefined : "#f3f4f6" }}>
              {b.cancelled > 0 && (
                <div style={{ height: `${(b.cancelled / b.total) * 100}%`, background: "#DC2626" }} />
              )}
              {b.completed > 0 && (
                <div style={{ height: `${(b.completed / b.total) * 100}%`, background: "#16A34A" }} />
              )}
              {b.scheduled > 0 && (
                <div style={{ height: `${(b.scheduled / b.total) * 100}%`, background: "#5B65DC" }} />
              )}
            </div>
            <span className={`text-[10px] font-medium ${b.day === todayStr() ? "text-[#5B65DC]" : "text-gray-400"}`}>
              {b.label}{b.day === todayStr() ? " ●" : ""}
            </span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4 mt-3">
        {[["#5B65DC","Scheduled"],["#16A34A","Completed"],["#DC2626","Cancelled"]].map(([c,l]) => (
          <div key={l} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm" style={{ background: c }} />
            <span className="text-[10px] text-gray-400">{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, color, icon, sub }) => (
  <div className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col gap-1">
    <div className="flex items-center justify-between mb-1">
      <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</span>
      <span className="text-lg">{icon}</span>
    </div>
    <span className="text-3xl font-bold" style={{ color }}>{value ?? 0}</span>
    {sub && <span className="text-xs text-gray-400 mt-0.5">{sub}</span>}
  </div>
);

// ── Status Badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const m = STATUS_META[status] || STATUS_META.Scheduled;
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{ background: m.bg, color: m.text }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: m.color }} />
      {status}
    </span>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function AdminAppointments() {
  useAdminGuard();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [stats, setStats]               = useState(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [cancelling, setCancelling]     = useState(null);

  // Filters
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDate,   setFilterDate  ] = useState("");
  const [search,       setSearch      ] = useState("");

  // ── Fetch all data ──────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [apptRes, statsRes] = await Promise.all([
        fetch(`${API}/admin/appointments`, { headers: authHeaders() }),
        fetch(`${API}/admin/stats`,        { headers: authHeaders() }),
      ]);
      if (apptRes.status === 401 || apptRes.status === 403) { navigate("/login"); return; }
      const apptData  = await apptRes.json();
      const statsData = await statsRes.json();
      if (!apptRes.ok)  throw new Error(apptData.message  || "Failed to load appointments");
      if (!statsRes.ok) throw new Error(statsData.message || "Failed to load stats");
      setAppointments(apptData);
      setStats(statsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Admin cancel ────────────────────────────────────────────────────────────
  const handleCancel = async (id) => {
    if (!window.confirm("Cancel this appointment? This action cannot be undone.")) return;
    setCancelling(id);
    try {
      const res = await fetch(`${API}/admin/appointments/${id}/cancel`, {
        method: "PUT", headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setAppointments(prev =>
        prev.map(a => a._id === id ? { ...a, status: "Cancelled", notes: (a.notes || "") + " (Cancelled by Admin)" } : a)
      );
      setStats(prev => prev ? {
        ...prev,
        activeAppointments: prev.activeAppointments - 1,
        cancelledAppointments: prev.cancelledAppointments + 1,
      } : prev);
    } catch (err) {
      alert(err.message);
    } finally {
      setCancelling(null);
    }
  };

  // ── Derived data ────────────────────────────────────────────────────────────
  const todayAppts = appointments.filter(
    (a) => new Date(a.date).toISOString().split("T")[0] === todayStr()
  );
  const todayScheduled = todayAppts.filter(a => a.status === "Scheduled").length;
  const todayCompleted = todayAppts.filter(a => a.status === "Completed").length;
  const todayCancelled = todayAppts.filter(a => a.status === "Cancelled").length;

  const filtered = appointments.filter((a) => {
    const matchStatus = filterStatus ? a.status === filterStatus : true;
    const matchDate   = filterDate   ? new Date(a.date).toISOString().split("T")[0] === filterDate : true;
    const term = search.toLowerCase();
    const matchSearch = term
      ? a.doctorName?.toLowerCase().includes(term) ||
        a.specialty?.toLowerCase().includes(term)  ||
        a.appointmentId?.toLowerCase().includes(term)
      : true;
    return matchStatus && matchDate && matchSearch;
  });

  // ── Skeleton ────────────────────────────────────────────────────────────────
  const Skeleton = ({ h = "h-4", w = "w-full", rounded = "rounded" }) => (
    <div className={`${h} ${w} ${rounded} bg-gray-100 animate-pulse`} />
  );

  return (
    <div className="flex min-h-screen bg-[#FAFAFD]">
      <AdminNavbar requireAuth={true} />

      <main className="flex-1 p-8 overflow-y-auto">

        {/* ── Page Header ── */}
        <div className="flex items-center justify-between mb-7">
          <div>
            <h1 className="text-2xl font-bold text-[#122056]">Appointments</h1>
            <p className="text-sm text-gray-400 mt-0.5">System-wide appointment management</p>
          </div>
          <button
            onClick={fetchAll}
            className="flex items-center gap-2 text-sm text-[#5B65DC] border border-[#EEEFFD] bg-[#EEEFFD] px-3 py-1.5 rounded-lg hover:bg-[#dde0f8] transition font-medium"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 7a6 6 0 1 0 1.2-3.6" stroke="#5B65DC" strokeWidth="1.4" strokeLinecap="round"/>
              <path d="M1 3v3.5H4.5" stroke="#5B65DC" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 flex items-center justify-between">
            {error}
            <button onClick={fetchAll} className="text-[#5B65DC] font-medium hover:underline ml-4 shrink-0">Retry</button>
          </div>
        )}

        {/* ── Top Stat Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
          {loading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse h-24" />
            ))
          ) : (
            <>
              <StatCard
                label="Total"
                value={stats?.totalAppointments}
                color="#122056"
                icon="📋"
                sub="All time"
              />
              <StatCard
                label="Active"
                value={stats?.activeAppointments}
                color="#5B65DC"
                icon="📅"
                sub="Scheduled & completed"
              />
              <StatCard
                label="Cancelled"
                value={stats?.cancelledAppointments}
                color="#DC2626"
                icon="✖"
                sub="All time"
              />
              <StatCard
                label="Today"
                value={todayAppts.length}
                color="#16A34A"
                icon="🗓"
                sub={`${todayScheduled} upcoming`}
              />
            </>
          )}
        </div>

        {/* ── Charts Row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-7">
          {/* Today's Breakdown Donut */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="mb-4">
              <h3 className="font-semibold text-[#122056] text-sm">Today's Breakdown</h3>
              <p className="text-xs text-gray-400">
                {new Date().toLocaleDateString("en-LK", { weekday: "long", month: "long", day: "numeric" })}
              </p>
            </div>
            {loading ? (
              <div className="flex items-center gap-6">
                <Skeleton h="h-32" w="w-32" rounded="rounded-full" />
                <div className="flex flex-col gap-2 flex-1">
                  <Skeleton h="h-3" w="w-28" />
                  <Skeleton h="h-3" w="w-24" />
                  <Skeleton h="h-3" w="w-20" />
                </div>
              </div>
            ) : (
              <DonutChart
                scheduled={todayScheduled}
                completed={todayCompleted}
                cancelled={todayCancelled}
              />
            )}
          </div>

          {/* 7-Day Bar Chart */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="mb-4">
              <h3 className="font-semibold text-[#122056] text-sm">Last 7 Days</h3>
              <p className="text-xs text-gray-400">Daily appointment volume</p>
            </div>
            {loading ? (
              <div className="flex items-end gap-2 h-28">
                {Array(7).fill(0).map((_, i) => (
                  <div key={i} className="flex-1 bg-gray-100 animate-pulse rounded-t" style={{ height: `${30 + Math.random() * 60}px` }} />
                ))}
              </div>
            ) : (
              <WeekBarChart appointments={appointments} />
            )}
          </div>
        </div>

        {/* ── Filters + Table ── */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {/* Filter bar */}
          <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-gray-100">
            <div className="relative flex-1 min-w-40">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M10 10l2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              <input
                type="text"
                placeholder="Search doctor, specialty, ID..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full h-9 pl-8 pr-3 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#5B65DC] transition text-[#122056] placeholder-gray-300"
              />
            </div>

            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="h-9 px-3 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#5B65DC] transition text-[#122056] bg-white cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            <input
              type="date"
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
              className="h-9 px-3 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#5B65DC] transition text-[#122056] bg-white cursor-pointer"
            />

            {(filterStatus || filterDate || search) && (
              <button
                onClick={() => { setFilterStatus(""); setFilterDate(""); setSearch(""); }}
                className="text-xs text-gray-400 hover:text-[#DC2626] transition font-medium"
              >
                Clear filters
              </button>
            )}

            <span className="ml-auto text-xs text-gray-400 shrink-0">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#FAFAFD] border-b border-gray-100">
                  {["Appointment ID", "Doctor", "Specialty", "Date", "Time", "Queue", "Type", "Status", "Action"].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array(6).fill(0).map((_, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      {Array(9).fill(0).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <Skeleton h="h-3" w="w-20" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-16 text-gray-300">
                      <div className="flex flex-col items-center gap-2">
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                          <rect x="4" y="6" width="24" height="22" rx="3" stroke="#e5e7eb" strokeWidth="1.5"/>
                          <path d="M10 6V4M22 6V4M4 13h24" stroke="#e5e7eb" strokeWidth="1.5" strokeLinecap="round"/>
                          <path d="M11 19h10M11 23h6" stroke="#e5e7eb" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                        <span className="text-sm">No appointments found</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((appt) => (
                    <tr
                      key={appt._id}
                      className="border-b border-gray-50 hover:bg-[#FAFAFD] transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-gray-400 whitespace-nowrap">
                        {appt.appointmentId?.slice(0, 16)}…
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#EEEFFD] flex items-center justify-center text-[#5B65DC] text-xs font-bold shrink-0">
                            {appt.doctorName?.split(" ").slice(-1)[0]?.[0] || "D"}
                          </div>
                          <span className="font-medium text-[#122056]">{appt.doctorName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{appt.specialty}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(appt.date)}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {appt.startTime && appt.endTime ? `${appt.startTime}–${appt.endTime}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {appt.queueNumber ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#EEEFFD] text-[#5B65DC] text-xs font-bold">
                            {appt.queueNumber}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${
                          appt.appointmentType === "Online"
                            ? "bg-sky-50 text-sky-700"
                            : "bg-amber-50 text-amber-700"
                        }`}>
                          {appt.appointmentType}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <StatusBadge status={appt.status} />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {appt.status === "Scheduled" ? (
                          <button
                            onClick={() => handleCancel(appt._id)}
                            disabled={cancelling === appt._id}
                            className="text-xs font-semibold text-[#DC2626] border border-red-200 bg-red-50 px-2.5 py-1 rounded-lg hover:bg-red-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {cancelling === appt._id ? "Cancelling…" : "Cancel"}
                          </button>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}