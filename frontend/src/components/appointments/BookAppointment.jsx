import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import PatientNavbar from "../../components/shared/PatientNavbar";

// ── Step indicator ────────────────────────────────────────────────────────────
const steps = ["Details", "Review", "Payment", "Confirmed"];

const StepBar = ({ current }) => (
  <div style={{ display: "flex", alignItems: "center", marginBottom: 36 }}>
    {steps.map((label, i) => {
      const done = i < current;
      const active = i === current;
      return (
        <div key={label} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : "none" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%",
              background: done ? "#16A34A" : active ? "#122056" : "#e8eaf4",
              color: done || active ? "#fff" : "#9ca3af",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 600, flexShrink: 0,
              transition: "background 0.3s",
            }}>
              {done ? "✓" : i + 1}
            </div>
            <span style={{
              fontSize: 11, fontWeight: 500,
              color: active ? "#122056" : done ? "#16A34A" : "#9ca3af",
              letterSpacing: "0.3px", whiteSpace: "nowrap",
            }}>{label}</span>
          </div>
          {i < steps.length - 1 && (
            <div style={{
              flex: 1, height: 2, margin: "0 8px", marginBottom: 18,
              background: done ? "#16A34A" : "#e8eaf4",
              transition: "background 0.3s",
            }} />
          )}
        </div>
      );
    })}
  </div>
);

// ── Field wrapper ─────────────────────────────────────────────────────────────
const Field = ({ label, required, children, hint }) => (
  <div style={{ marginBottom: 20 }}>
    <label style={{
      display: "block", fontSize: 12, fontWeight: 600,
      color: "#4a5280", marginBottom: 6,
      letterSpacing: "0.4px", textTransform: "uppercase",
    }}>
      {label}{required && <span style={{ color: "#DC2626", marginLeft: 2 }}>*</span>}
    </label>
    {children}
    {hint && <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>{hint}</p>}
  </div>
);

const inputStyle = (focused, disabled) => ({
  width: "100%", height: 44,
  border: `1.5px solid ${focused ? "#5B65DC" : "#dde0f0"}`,
  borderRadius: 10, 
  background: disabled ? "#f9fafb" : "#fff",
  fontFamily: "inherit", fontSize: 14,
  color: disabled ? "#9ca3af" : "#122056", 
  padding: "0 14px",
  outline: "none", boxSizing: "border-box",
  transition: "border-color 0.2s",
  cursor: disabled ? "not-allowed" : "text",
});

const selectStyle = (focused, disabled) => ({
  ...inputStyle(focused, disabled),
  appearance: "none", cursor: disabled ? "not-allowed" : "pointer",
});

// ── Controlled Input helpers ──────────────────────────────────────────────────
const TextInput = ({ value, onChange, placeholder, type = "text", disabled = false }) => {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type} value={value} onChange={onChange} placeholder={placeholder}
      disabled={disabled}
      style={inputStyle(focused, disabled)}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
    />
  );
};

const SelectInput = ({ value, onChange, children, disabled = false }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <select value={value} onChange={onChange} disabled={disabled} style={selectStyle(focused, disabled)}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}>
        {children}
      </select>
      <svg style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
        width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M2 4l4 4 4-4" stroke={disabled ? "#cbd5e1" : "#6b7280"} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
};

// ── Review row ────────────────────────────────────────────────────────────────
const ReviewRow = ({ label, value }) => (
  <div style={{
    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
    padding: "10px 0", borderBottom: "1px solid #f0f1f8",
  }}>
    <span style={{ fontSize: 13, color: "#8a90b8", fontWeight: 500, minWidth: 140 }}>{label}</span>
    <span style={{ fontSize: 13, color: "#122056", fontWeight: 600, textAlign: "right", maxWidth: 200 }}>{value || "—"}</span>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
export default function BookAppointment() {
  const [doctors, setDoctors] = useState([]);
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    doctorId: "",
    date: "",
    appointmentType: "",
    notes: "",
  });

  const [estimatedSlot, setEstimatedSlot] = useState(null);

useEffect(() => {
    if (form.doctorId && form.date) {
      const fetchSlotPreview = async () => {
        try {
          const token = localStorage.getItem("token");
          const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/appointments/check-slot?doctorId=${form.doctorId}&date=${form.date}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setEstimatedSlot(data);
          }
        } catch (err) {
          console.error("Could not fetch slot preview", err);
        }
      };
      fetchSlotPreview();
    } else {
      setEstimatedSlot(null);
    }
  }, [form.doctorId, form.date]);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/doctors/all`);
      const data = await res.json();
      setDoctors(data);
    } catch (err) {
      console.error(err);
    }
  };

  const selectedDoctor = doctors.find(d => d._id === form.doctorId);

  // --- SMART DATE CALCULATOR ---
  // Calculates the next 30 valid dates based on the doctor's availability
  const availableDates = useMemo(() => {
    if (!selectedDoctor) return [];
    
    const schedule = selectedDoctor.availability || [];
    
    // Get an array of days the doctor works (e.g., ["monday", "wednesday"])
    const availableDays = schedule
      .filter(a => a.isAvailable !== false)
      .map(a => a.day.toLowerCase());

    const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    let validDates = [];
    let current = new Date();

    // Check the next 14 days
    for (let i = 1; i <= 14; i++) {
      current.setDate(current.getDate() + 1); // Move forward 1 day
      let dayName = daysOfWeek[current.getDay()];

      // If doctor hasn't set an availability array, assume available every day.
      // Otherwise, check if today's dayName is in their availability list.
      if (availableDays.length === 0 || availableDays.includes(dayName)) {
        validDates.push({
          value: current.toISOString().split("T")[0],
          label: current.toLocaleDateString("en-LK", { 
            weekday: "short", month: "short", day: "numeric" 
          })
        });
      }
    }
    return validDates;
  }, [selectedDoctor]);

  // If the user changes the doctor, clear the previously selected date
  useEffect(() => {
    setForm(f => ({ ...f, date: "" }));
  }, [form.doctorId]);


  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  // ── Step 0: Form ─────────────────────────────────────────────────────────
  const handleNext = () => {
    if (!form.doctorId || !form.date || !form.appointmentType) {
      setError("Please fill in all required fields.");
      return;
    }
    setError("");
    setStep(1);
  };

  // ── Step 2: Submit to API ─────────────────────────────────────────────────
  const handleConfirm = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/appointments/book`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          doctorId: form.doctorId,
          date: form.date,
          appointmentType: form.appointmentType, // Use actual form state instead of hardcoding
          notes: form.notes,
        }),
      });

      const data = await res.json(); 

      if (!res.ok) throw new Error(data.message || "Booking failed");

      setStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = () => {
    setStep(3);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; }
        body { font-family: 'DM Sans', sans-serif; background: #FAFAFD; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.35s ease both; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.8s linear infinite; }
      `}</style>

      <div style={{ display: "flex", minHeight: "100vh", background: "#FAFAFD" }}>
        <PatientNavbar />

        <main style={{
          flex: 1, overflowY: "auto",
          display: "flex", alignItems: "flex-start", justifyContent: "center",
          padding: "48px 16px 32px",
        }}>
        <div style={{ width: "100%", maxWidth: 560 }}>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
            <button onClick={() => navigate(-1)} style={{
              background: "none", border: "1.5px solid #dde0f0", borderRadius: 8,
              width: 36, height: 36, cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center", color: "#6b7280",
            }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div>
              <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, color: "#122056", margin: 0 }}>
                Book Appointment
              </h1>
              <p style={{ fontSize: 13, color: "#8a90b8", margin: 0 }}>HealthLink Medical System</p>
            </div>
          </div>

          {/* Card */}
          <div className="fade-up" style={{
            background: "#fff", borderRadius: 20,
            border: "1px solid #eaecf8",
            boxShadow: "0 4px 24px rgba(18,32,86,0.07)",
            padding: "36px 40px",
          }}>
            <StepBar current={step} />

            {/* ── STEP 0: Appointment Form ── */}
            {step === 0 && (
              <div className="fade-up">
                <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: "#122056", marginBottom: 4 }}>
                  Appointment details
                </h2>
                <p style={{ fontSize: 13, color: "#8a90b8", marginBottom: 28 }}>
                  Fill in the details below to book your appointment.
                </p>

                <Field label="Select Doctor" required>
                  <SelectInput value={form.doctorId} onChange={set("doctorId")}>
                    <option value="" disabled>Choose a doctor...</option>
                    {doctors.map(d => (
                      <option key={d._id} value={d._id}>{d.name} — {d.specialty}</option>
                    ))}
                  </SelectInput>
                </Field>

                {selectedDoctor && (
                  <div style={{
                    display: "flex", alignItems: "center", gap: 12,
                    background: "#EEEFFD", borderRadius: 10, padding: "12px 16px",
                    marginBottom: 20, marginTop: -8,
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%",
                      background: "#5B65DC", color: "#fff",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, fontWeight: 600, flexShrink: 0,
                    }}>
                      {selectedDoctor.name.split(" ").slice(-1)[0][0]}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#122056" }}>{selectedDoctor.name}</p>
                      <p style={{ margin: 0, fontSize: 12, color: "#5B65DC" }}>{selectedDoctor.specialty}</p>
                    </div>
                  </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <Field label="Preferred Date" required>
                    {selectedDoctor ? (
                      <SelectInput value={form.date} onChange={set("date")}>
                        <option value="" disabled>Select a valid date...</option>
                        {availableDates.length > 0 ? (
                          availableDates.map(d => (
                            <option key={d.value} value={d.value}>{d.label}</option>
                          ))
                        ) : (
                          <option value="" disabled>No available dates</option>
                        )}
                      </SelectInput>
                    ) : (
                      <TextInput type="text" value="" placeholder="Select a doctor first" disabled={true} />
                    )}
                  </Field>

                  <Field label="Appointment Type" required>
                    <SelectInput value={form.appointmentType} onChange={set("appointmentType")}>
                      <option value="" disabled>Select type...</option>
                      <option value="Physical">Physical</option>
                    </SelectInput>
                  </Field>
                </div>

                {/* --- NEW SLOT PREVIEW UI --- */}
                {estimatedSlot && (
                  <div className="fade-up" style={{
                    background: "#f0fdf4", border: "1px solid #bbf7d0",
                    borderRadius: 10, padding: "12px 16px", marginBottom: 20,
                    display: "flex", alignItems: "center", gap: 12
                  }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: "50%",
                      background: "#16A34A", color: "#fff",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 16, flexShrink: 0
                    }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                    </div>
                    <div>
                      <p style={{ margin: 0, fontSize: 12, color: "#15803d", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        Assigned Time Slot
                      </p>
                      <p style={{ margin: "2px 0 0 0", fontSize: 15, color: "#166534", fontWeight: 600 }}>
                        {estimatedSlot.startTime} – {estimatedSlot.endTime} 
                        <span style={{ fontSize: 13, fontWeight: 500, opacity: 0.8, marginLeft: 6 }}>
                          (Queue No: {estimatedSlot.queueNumber})
                        </span>
                      </p>
                    </div>
                  </div>
                )}

                <Field label="Additional Notes" hint="Optional — describe your symptoms or reason for visit.">
                  <textarea
                    value={form.notes}
                    onChange={set("notes")}
                    placeholder="e.g. Recurring headache for 3 days..."
                    rows={3}
                    style={{
                      width: "100%", border: "1.5px solid #dde0f0", borderRadius: 10,
                      background: "#fff", fontFamily: "inherit", fontSize: 14,
                      color: "#122056", padding: "10px 14px", outline: "none",
                      resize: "vertical", boxSizing: "border-box", lineHeight: 1.6,
                    }}
                    onFocus={e => (e.target.style.borderColor = "#5B65DC")}
                    onBlur={e => (e.target.style.borderColor = "#dde0f0")}
                  />
                </Field>

                {error && (
                  <div style={{
                    background: "#fef2f2", border: "1px solid #fecaca",
                    borderRadius: 8, padding: "10px 14px", marginBottom: 20,
                    fontSize: 13, color: "#DC2626",
                  }}>
                    {error}
                  </div>
                )}

                <button onClick={handleNext} style={{
                  width: "100%", height: 48,
                  background: "#122056", border: "none", borderRadius: 12,
                  fontFamily: "inherit", fontSize: 15, fontWeight: 600,
                  color: "#fff", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}>
                  Review Appointment
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M6 3l5 5-5 5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            )}

            {/* ── STEP 1: Review ── */}
            {step === 1 && (
              <div className="fade-up">
                <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: "#122056", marginBottom: 4 }}>
                  Review your booking
                </h2>
                <p style={{ fontSize: 13, color: "#8a90b8", marginBottom: 24 }}>
                  Please confirm the details before proceeding.
                </p>

                <div style={{
                  background: "#FAFAFD", borderRadius: 12,
                  border: "1px solid #eaecf8", padding: "4px 16px", marginBottom: 28,
                }}>
                  <ReviewRow label="Doctor" value={selectedDoctor?.name} />
                  <ReviewRow label="Specialty" value={selectedDoctor?.specialty} />
                  <ReviewRow label="Date" value={new Date(form.date + "T00:00:00").toLocaleDateString("en-LK", { weekday: "long", year: "numeric", month: "long", day: "numeric" })} />
                  <ReviewRow label="Appointment Type" value={form.appointmentType} />
                  <ReviewRow label="Notes" value={form.notes || "None"} />
                </div>

                <div style={{
                  background: "#EEEFFD", borderRadius: 10,
                  padding: "12px 16px", marginBottom: 28,
                  fontSize: 13, color: "#5B65DC",
                  display: "flex", alignItems: "flex-start", gap: 8,
                }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                    <circle cx="8" cy="8" r="6.5" stroke="#5B65DC" strokeWidth="1.3" />
                    <path d="M8 5v4M8 10.5v.5" stroke="#5B65DC" strokeWidth="1.3" strokeLinecap="round" />
                  </svg>
                  Your time slot will be automatically assigned based on availability. You'll see your queue number after booking.
                </div>

                {error && (
                  <div style={{
                    background: "#fef2f2", border: "1px solid #fecaca",
                    borderRadius: 8, padding: "10px 14px", marginBottom: 20,
                    fontSize: 13, color: "#DC2626",
                  }}>
                    {error}
                  </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <button onClick={() => setStep(0)} style={{
                    height: 48, background: "#fff",
                    border: "1.5px solid #dde0f0", borderRadius: 12,
                    fontFamily: "inherit", fontSize: 14, fontWeight: 500,
                    color: "#6b7280", cursor: "pointer",
                  }}>
                    Edit Details
                  </button>
                  <button onClick={handleConfirm} disabled={loading} style={{
                    height: 48, background: loading ? "#9aa3c8" : "#122056",
                    border: "none", borderRadius: 12,
                    fontFamily: "inherit", fontSize: 14, fontWeight: 600,
                    color: "#fff", cursor: loading ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  }}>
                    {loading ? (
                      <>
                        <svg className="spin" width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
                          <path d="M8 2a6 6 0 0 1 6 6" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        Booking...
                      </>
                    ) : "Confirm Booking"}
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 2: Dummy Payment ── */}
            {step === 2 && (
              <div className="fade-up">
                <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: "#122056", marginBottom: 4 }}>
                  Payment
                </h2>
                <p style={{ fontSize: 13, color: "#8a90b8", marginBottom: 28 }}>
                  Your appointment is reserved. Complete payment to confirm.
                </p>

                <div style={{
                  background: "linear-gradient(135deg, #122056 0%, #1e3a8a 100%)",
                  borderRadius: 16, padding: "28px 24px", marginBottom: 24, color: "#fff",
                }}>
                  <div style={{ fontSize: 11, opacity: 0.6, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 20 }}>
                    Consultation Fee
                  </div>
                  <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 36, marginBottom: 4 }}>
                    LKR 2,500.00
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>
                    {selectedDoctor?.name} · {form.appointmentType} Visit
                  </div>
                </div>

                <Field label="Card Number">
                  <TextInput placeholder="4242 4242 4242 4242" />
                </Field>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <Field label="Expiry Date">
                    <TextInput placeholder="MM / YY" />
                  </Field>
                  <Field label="CVV">
                    <TextInput placeholder="•••" />
                  </Field>
                </div>

                <Field label="Cardholder Name">
                  <TextInput placeholder="Full name on card" />
                </Field>

                <div style={{
                  background: "#f0fdf4", border: "1px solid #bbf7d0",
                  borderRadius: 8, padding: "10px 14px", marginBottom: 20,
                  fontSize: 12, color: "#15803d", display: "flex", alignItems: "center", gap: 6,
                }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 1L1.5 4v4C1.5 10.8 4 13 7 13.8 10 13 12.5 10.8 12.5 8V4L7 1z" stroke="#15803d" strokeWidth="1.2" strokeLinejoin="round" />
                  </svg>
                  This is a demo — no real payment will be processed.
                </div>

                <button onClick={handlePayment} style={{
                  width: "100%", height: 48,
                  background: "#16A34A", border: "none", borderRadius: 12,
                  fontFamily: "inherit", fontSize: 15, fontWeight: 600,
                  color: "#fff", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect x="1" y="4" width="14" height="9" rx="2" stroke="#fff" strokeWidth="1.3" />
                    <path d="M1 7h14" stroke="#fff" strokeWidth="1.3" />
                  </svg>
                  Pay LKR 2,500.00
                </button>
              </div>
            )}

            {/* ── STEP 3: Confirmed ── */}
            {step === 3 && (
              <div className="fade-up" style={{ textAlign: "center", padding: "16px 0" }}>
                <div style={{
                  width: 72, height: 72, borderRadius: "50%",
                  background: "#f0fdf4", border: "2px solid #bbf7d0",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 20px",
                }}>
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <path d="M7 16l6 6 12-12" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>

                <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 24, color: "#122056", marginBottom: 8 }}>
                  Appointment Confirmed!
                </h2>
                <p style={{ fontSize: 14, color: "#8a90b8", marginBottom: 28, lineHeight: 1.6 }}>
                  Your appointment with <strong style={{ color: "#122056" }}>{selectedDoctor?.name}</strong> on{" "}
                  <strong style={{ color: "#122056" }}>
                    {new Date(form.date + "T00:00:00").toLocaleDateString("en-LK", { weekday: "short", month: "short", day: "numeric" })}
                  </strong>{" "}
                  has been booked successfully.
                </p>

                <div style={{
                  background: "#EEEFFD", borderRadius: 12,
                  padding: "16px 20px", marginBottom: 28, textAlign: "left",
                }}>
                  <p style={{ margin: 0, fontSize: 12, color: "#5B65DC", fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: 8 }}>
                    Booking Summary
                  </p>
                  <ReviewRow label="Doctor" value={selectedDoctor?.name} />
                  <ReviewRow label="Type" value={form.appointmentType} />
                  <ReviewRow label="Date" value={new Date(form.date + "T00:00:00").toLocaleDateString("en-LK", { weekday: "long", year: "numeric", month: "long", day: "numeric" })} />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <button
                    onClick={() => { setStep(0); setForm({ doctorId: "", date: "", appointmentType: "", notes: "" }); }}
                    style={{
                      height: 44, background: "#fff",
                      border: "1.5px solid #dde0f0", borderRadius: 12,
                      fontFamily: "inherit", fontSize: 14, fontWeight: 500,
                      color: "#6b7280", cursor: "pointer",
                    }}>
                    New Booking
                  </button>
                  <button
                    onClick={() => navigate("/patient/appointments")}
                    style={{
                      height: 44, background: "#122056",
                      border: "none", borderRadius: 12,
                      fontFamily: "inherit", fontSize: 14, fontWeight: 600,
                      color: "#fff", cursor: "pointer",
                    }}>
                    Go Home
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        </main>
      </div>
    </>
  );
}