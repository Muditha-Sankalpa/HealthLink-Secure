import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import PatientNavbar from "../../components/shared/PatientNavbar";
import { StatCard, TabBar, Button, Card, ErrorMessage } from "../../components/shared";

// ── Helpers ───────────────────────────────────────────────────────────────────

const API = "http://localhost:5000/api/appointments";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-LK", {
    weekday: "short", year: "numeric", month: "short", day: "numeric",
  });

const STATUS_STYLES = {
  Scheduled: {
    bg: "bg-[#EEEFFD]", text: "text-[#5B65DC]", dot: "bg-[#5B65DC]",
  },
  Completed: {
    bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500",
  },
  Cancelled: {
    bg: "bg-red-50", text: "text-red-500", dot: "bg-red-400",
  },
};

const TYPE_STYLES = {
  Physical: { bg: "bg-amber-50", text: "text-amber-700" },
  Online:   { bg: "bg-sky-50",   text: "text-sky-700"   },
};

// ── Status Badge ──────────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const s = STATUS_STYLES[status] || STATUS_STYLES.Scheduled;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
};

const TypeBadge = ({ type }) => {
  const t = TYPE_STYLES[type] || TYPE_STYLES.Physical;
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${t.bg} ${t.text}`}>
      {type}
    </span>
  );
};

// ── Reschedule Modal ──────────────────────────────────────────────────────────

const RescheduleModal = ({ appointment, onClose, onSave }) => {
  const [date, setDate] = useState(
    appointment.date ? new Date(appointment.date).toISOString().split("T")[0] : ""
  );
  const [notes, setNotes] = useState(appointment.notes || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const todayStr = new Date().toISOString().split("T")[0];

  const handleSave = async () => {
    if (!date) { setError("Please select a new date."); return; }
    if (date < todayStr) { setError("Please select a future date."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/${appointment._id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ date, notes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Reschedule failed");
      onSave(data.appointment);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-[fadeUp_0.25s_ease_both]">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-[#122056]">Reschedule Appointment</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="bg-[#EEEFFD] rounded-xl p-3 mb-5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#5B65DC] flex items-center justify-center text-white text-sm font-bold shrink-0">
            {appointment.doctorName?.split(" ").slice(-1)[0]?.[0] || "D"}
          </div>
          <div>
            <p className="text-sm font-semibold text-[#122056]">{appointment.doctorName}</p>
            <p className="text-xs text-[#5B65DC]">{appointment.specialty}</p>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-semibold text-[#4a5280] uppercase tracking-wide mb-1.5">
            New Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date" value={date} min={todayStr}
            onChange={e => setDate(e.target.value)}
            className="w-full h-11 border border-[#dde0f0] rounded-lg px-3 text-sm text-[#122056] outline-none focus:border-[#5B65DC] transition"
          />
        </div>

        <div className="mb-5">
          <label className="block text-xs font-semibold text-[#4a5280] uppercase tracking-wide mb-1.5">
            Notes
          </label>
          <textarea
            value={notes} onChange={e => setNotes(e.target.value)}
            rows={3} placeholder="Update reason or symptoms..."
            className="w-full border border-[#dde0f0] rounded-lg px-3 py-2 text-sm text-[#122056] outline-none focus:border-[#5B65DC] transition resize-none"
          />
        </div>

        {error && <ErrorMessage message={error} />}

        <div className="flex gap-3 mt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button variant="primary" onClick={handleSave} disabled={loading} className="flex-1">
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
};

// ── Appointment Card ──────────────────────────────────────────────────────────

const AppointmentCard = ({ appt, onCancel, onReschedule }) => {
  const [cancelling, setCancelling] = useState(false);

  const handleCancel = async () => {
    if (!window.confirm("Cancel this appointment?")) return;
    setCancelling(true);
    try {
      const res = await fetch(`${API}/${appt._id}/cancel`, {
        method: "PUT", headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      onCancel(appt._id);
    } catch (err) {
      alert(err.message);
    } finally {
      setCancelling(false);
    }
  };

  const isScheduled = appt.status === "Scheduled";

  return (
    <Card className="flex flex-col gap-0 !p-0 overflow-hidden hover:shadow-md transition-shadow duration-200">
      {/* Top accent bar by status */}
      <div className={`h-1 w-full ${
        appt.status === "Scheduled" ? "bg-[#5B65DC]" :
        appt.status === "Completed" ? "bg-green-500" : "bg-red-400"
      }`} />

      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#EEEFFD] flex items-center justify-center text-[#5B65DC] font-bold text-sm shrink-0">
              {appt.doctorName?.split(" ").slice(-1)[0]?.[0] || "D"}
            </div>
            <div>
              <p className="font-semibold text-[#122056] text-sm leading-tight">{appt.doctorName}</p>
              <p className="text-xs text-[#5B65DC] mt-0.5">{appt.specialty}</p>
            </div>
          </div>
          <StatusBadge status={appt.status} />
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs mb-4">
          <div>
            <p className="text-gray-400 font-medium uppercase tracking-wide text-[10px] mb-0.5">Date</p>
            <p className="text-[#122056] font-semibold">{formatDate(appt.date)}</p>
          </div>
          <div>
            <p className="text-gray-400 font-medium uppercase tracking-wide text-[10px] mb-0.5">Time Slot</p>
            <p className="text-[#122056] font-semibold">
              {appt.startTime && appt.endTime
                ? `${appt.startTime} – ${appt.endTime}`
                : "TBD"}
            </p>
          </div>
          <div>
            <p className="text-gray-400 font-medium uppercase tracking-wide text-[10px] mb-0.5">Queue No.</p>
            <p className="text-[#122056] font-semibold">
              {appt.queueNumber ? `#${appt.queueNumber}` : "—"}
            </p>
          </div>
          <div>
            <p className="text-gray-400 font-medium uppercase tracking-wide text-[10px] mb-0.5">Type</p>
            <TypeBadge type={appt.appointmentType} />
          </div>
        </div>

        {appt.notes && (
          <div className="bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-500 mb-4 border border-gray-100">
            <span className="font-semibold text-gray-600">Note: </span>{appt.notes}
          </div>
        )}

        {/* Actions */}
        {isScheduled && (
          <div className="flex gap-2 pt-2 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={() => onReschedule(appt)}
              className="flex-1 text-xs !py-1.5"
            >
              Reschedule
            </Button>
            <Button
              variant="danger"
              onClick={handleCancel}
              disabled={cancelling}
              className="flex-1 text-xs !py-1.5"
            >
              {cancelling ? "Cancelling..." : "Cancel"}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

// ── Empty State ───────────────────────────────────────────────────────────────

const EmptyState = ({ tab, onBook }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="w-16 h-16 rounded-full bg-[#EEEFFD] flex items-center justify-center mb-4">
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="4" y="6" width="20" height="18" rx="3" stroke="#5B65DC" strokeWidth="1.5" />
        <path d="M9 6V4M19 6V4M4 11h20" stroke="#5B65DC" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M9 16h10M9 20h6" stroke="#5B65DC" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
    <p className="text-[#122056] font-semibold text-base mb-1">No {tab.toLowerCase()} appointments</p>
    <p className="text-gray-400 text-sm mb-5">
      {tab === "Scheduled" ? "You have no upcoming appointments." : `No ${tab.toLowerCase()} appointments found.`}
    </p>
    {tab === "Scheduled" && (
      <Button variant="primary" onClick={onBook}>Book an Appointment</Button>
    )}
  </div>
);

// ── Main Page ─────────────────────────────────────────────────────────────────

const TABS = [
  { key: "Scheduled", label: "Upcoming" },
  { key: "Completed", label: "Completed" },
  { key: "Cancelled", label: "Cancelled" },
];

export default function PatientAppointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("Scheduled");
  const [rescheduling, setRescheduling] = useState(null); // appointment being rescheduled

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/my-appointments`, { headers: authHeaders() });
      if (res.status === 401) { navigate("/login"); return; }
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to load appointments");
      setAppointments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  const handleCancelled = (id) => {
    setAppointments(prev =>
      prev.map(a => a._id === id ? { ...a, status: "Cancelled" } : a)
    );
  };

  const handleRescheduled = (updated) => {
    setAppointments(prev =>
      prev.map(a => a._id === updated._id ? { ...a, ...updated } : a)
    );
    setRescheduling(null);
  };

  // Stats
  const scheduled  = appointments.filter(a => a.status === "Scheduled");
  const completed  = appointments.filter(a => a.status === "Completed");
  const cancelled  = appointments.filter(a => a.status === "Cancelled");
  const filtered   = appointments.filter(a => a.status === activeTab);

  return (
    <div className="flex min-h-screen bg-[var(--color-background)]">
      <PatientNavbar />

      <main className="flex-1 p-8 overflow-y-auto">
        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#122056]">My Appointments</h1>
            <p className="text-sm text-gray-400 mt-0.5">Manage and track your healthcare visits</p>
          </div>
          <Button variant="primary" onClick={() => navigate("/book-appointment")}>
            + Book Appointment
          </Button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard label="Upcoming" value={scheduled.length} color="text-[#5B65DC]" />
          <StatCard label="Completed" value={completed.length} color="text-green-600" />
          <StatCard label="Cancelled" value={cancelled.length} color="text-red-500" />
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6">
            <ErrorMessage message={error} />
            <button
              onClick={fetchAppointments}
              className="mt-2 text-sm text-[#5B65DC] hover:underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Tabs */}
        <TabBar tabs={TABS} active={activeTab} onChange={setActiveTab} />

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-xl border border-secondary h-52 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState tab={activeTab} onBook={() => navigate("/book-appointment")} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(appt => (
              <AppointmentCard
                key={appt._id}
                appt={appt}
                onCancel={handleCancelled}
                onReschedule={setRescheduling}
              />
            ))}
          </div>
        )}
      </main>

      {/* Reschedule modal */}
      {rescheduling && (
        <RescheduleModal
          appointment={rescheduling}
          onClose={() => setRescheduling(null)}
          onSave={handleRescheduled}
        />
      )}
    </div>
  );
}