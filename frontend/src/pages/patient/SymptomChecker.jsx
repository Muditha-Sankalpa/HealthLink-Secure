import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PatientNavbar from "../../components/shared/PatientNavbar";

// ── All symptoms from the ML model ────────────────────────────────────────────
const ALL_SYMPTOMS = [
  "Abdominal Pain", "Back Pain", "Bleeding", "Blisters", "Bloating",
  "Blurred Vision", "Breathlessness", "Breast Pain", "Chest Pain", "Chills",
  "Cough", "Constipation", "Developmental Delay", "Diarrhea", "Dizziness",
  "Dry Mouth", "Earache", "Erectile Dysfunction", "Excessive Sweating",
  "Fainting", "Fatigue", "Fever", "Frequent Ear Infections", "Frequent Falls",
  "Growth Issues", "Hair Loss", "Headache", "Heartburn", "Hoarseness",
  "Indigestion", "Itching", "Joint Pain", "Loss of Appetite",
  "Loss of Taste or Smell", "Lumps", "Memory Loss", "Menstrual Pain",
  "Mood Swings", "Muscle Cramps", "Muscle Pain", "Nausea", "Neck Pain",
  "Night Sweats", "Nosebleed", "Palpitations", "Prostate Issues", "Rash",
  "Shortness of Breath", "Skin Redness", "Sore Throat", "Swelling",
  "Sweating (excessive)", "Testicular Pain", "Tingling", "Toothache",
  "Urinary Incontinence", "Vaginal Discharge", "Vomiting", "Weakness",
];

// Maps ML predicted specialty → doctor specialty in DB
const SPECIALTY_MAP = {
  "Cardiology": "Cardiologist",
  "Dermatology": "Dermatologist",
  "ENT": "ENT Specialist",
  "Pediatric ENT": "ENT Specialist",
  "Gastroenterology": "Gastroenterologist",
  "Internal Medicine": "General Physician",
  "General Practice": "General Physician",
  "Geriatrics": "General Physician",
  "Neurology": "Neurologist",
  "Orthopedics": "Orthopedist",
  "Obstetrics & Gynecology": "Gynecologist",
  "Urology": "Urologist",
  "Pediatrics": "Pediatrician",
  "Pediatric Dermatology": "Dermatologist",
  "Emergency Medicine": "General Physician",
};

const SPECIALTY_ICONS = {
  "Cardiologist": "🫀",
  "Dermatologist": "🧴",
  "ENT Specialist": "👂",
  "Gastroenterologist": "🫁",
  "General Physician": "🩺",
  "Neurologist": "🧠",
  "Orthopedist": "🦴",
  "Gynecologist": "👩‍⚕️",
  "Urologist": "⚕️",
  "Pediatrician": "👶",
};

// ── Symptom tag pill ──────────────────────────────────────────────────────────
const SymptomTag = ({ symptom, selected, onToggle }) => (
  <button
    onClick={() => onToggle(symptom)}
    style={{
      padding: "6px 14px",
      borderRadius: 20,
      border: selected ? "1.5px solid #122056" : "1.5px solid #dde0f0",
      background: selected ? "#122056" : "#fff",
      color: selected ? "#fff" : "#6b7280",
      fontSize: 13,
      fontWeight: selected ? 600 : 400,
      cursor: "pointer",
      transition: "all 0.15s",
      fontFamily: "inherit",
      whiteSpace: "nowrap",
    }}
  >
    {selected && <span style={{ marginRight: 5, fontSize: 11 }}>✓</span>}
    {symptom}
  </button>
);

// ── Severity badge ────────────────────────────────────────────────────────────
const SeverityOption = ({ value, label, description, selected, onClick, color }) => (
  <button
    onClick={() => onClick(value)}
    style={{
      flex: 1,
      padding: "14px 12px",
      borderRadius: 12,
      border: selected ? `2px solid ${color}` : "1.5px solid #dde0f0",
      background: selected ? `${color}12` : "#fff",
      cursor: "pointer",
      textAlign: "left",
      fontFamily: "inherit",
      transition: "all 0.15s",
    }}
  >
    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: selected ? color : "#374151" }}>{label}</p>
    <p style={{ margin: "3px 0 0", fontSize: 11, color: "#9ca3af", lineHeight: 1.4 }}>{description}</p>
  </button>
);

// ── Field wrapper ─────────────────────────────────────────────────────────────
const Field = ({ label, required, children, hint }) => (
  <div style={{ marginBottom: 24 }}>
    <label style={{
      display: "block", fontSize: 11, fontWeight: 700,
      color: "#4a5280", marginBottom: 8,
      letterSpacing: "0.6px", textTransform: "uppercase",
    }}>
      {label}{required && <span style={{ color: "#DC2626", marginLeft: 2 }}>*</span>}
    </label>
    {children}
    {hint && <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 5 }}>{hint}</p>}
  </div>
);

// ── Result card ───────────────────────────────────────────────────────────────
const ResultCard = ({ result, onBookAppointment, onRetry }) => {
  const severity = result.input.severity;
  const urgencyColors = {
    mild: { bg: "#f0fdf4", border: "#bbf7d0", text: "#16a34a", label: "Low Urgency" },
    moderate: { bg: "#fffbeb", border: "#fde68a", text: "#d97706", label: "Moderate Urgency" },
    severe: { bg: "#fef2f2", border: "#fecaca", text: "#dc2626", label: "High Urgency — Seek care immediately" },
  };
  const urgency = urgencyColors[severity] || urgencyColors.moderate;
  const mappedSpecialty = SPECIALTY_MAP[result.predicted_specialty] || result.predicted_specialty;
  const confidence = Math.round(result.confidence * 100);
  const icon = SPECIALTY_ICONS[mappedSpecialty] || "🩺";

  const topSpecialties = Object.entries(result.probabilities)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .filter(([, prob]) => prob > 0.03);

  return (
    <div className="fade-up">
      <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: "#122056", marginBottom: 4 }}>
        Your results are ready
      </h2>
      <p style={{ fontSize: 13, color: "#8a90b8", marginBottom: 28 }}>
        Based on your symptoms, here's what we recommend.
      </p>

      {/* Main recommendation */}
      <div style={{
        background: "linear-gradient(135deg, #122056 0%, #1e3a8a 100%)",
        borderRadius: 16, padding: "28px 24px", marginBottom: 20, color: "#fff",
        display: "flex", alignItems: "center", gap: 20,
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: "50%",
          background: "rgba(255,255,255,0.15)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 28, flexShrink: 0,
        }}>
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontSize: 11, opacity: 0.65, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 6 }}>
            Recommended Specialist
          </p>
          <p style={{ margin: 0, fontFamily: "'DM Serif Display', serif", fontSize: 24, lineHeight: 1.2 }}>
            {mappedSpecialty}
          </p>
          <p style={{ margin: "4px 0 0", fontSize: 12, opacity: 0.7 }}>
            ML Specialty: {result.predicted_specialty}
          </p>
        </div>
        <div style={{
          background: "rgba(255,255,255,0.12)", borderRadius: 10,
          padding: "8px 14px", textAlign: "center", flexShrink: 0,
        }}>
          <p style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>{confidence}%</p>
          <p style={{ margin: 0, fontSize: 10, opacity: 0.7, letterSpacing: "0.5px" }}>CONFIDENCE</p>
        </div>
      </div>

      {/* Urgency banner */}
      <div style={{
        background: urgency.bg, border: `1px solid ${urgency.border}`,
        borderRadius: 10, padding: "12px 16px", marginBottom: 20,
        display: "flex", alignItems: "flex-start", gap: 10,
      }}>
        <div style={{
          width: 8, height: 8, borderRadius: "50%",
          background: urgency.text, marginTop: 5, flexShrink: 0,
        }} />
        <div>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: urgency.text, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>
            {urgency.label}
          </p>
          <p style={{ margin: 0, fontSize: 13, color: urgency.text, lineHeight: 1.6 }}>
            {result.health_suggestion}
          </p>
        </div>
      </div>

      {/* Probability breakdown */}
      {topSpecialties.length > 1 && (
        <div style={{
          background: "#FAFAFD", borderRadius: 12,
          border: "1px solid #eaecf8", padding: "16px 20px", marginBottom: 20,
        }}>
          <p style={{ margin: "0 0 14px", fontSize: 11, fontWeight: 700, color: "#4a5280", textTransform: "uppercase", letterSpacing: "0.6px" }}>
            Differential breakdown
          </p>
          {topSpecialties.map(([spec, prob]) => {
            const pct = Math.round(prob * 100);
            const isTop = spec === result.predicted_specialty;
            return (
              <div key={spec} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: isTop ? "#122056" : "#6b7280", fontWeight: isTop ? 600 : 400 }}>
                    {SPECIALTY_MAP[spec] || spec}
                  </span>
                  <span style={{ fontSize: 12, color: isTop ? "#122056" : "#9ca3af", fontWeight: isTop ? 600 : 400 }}>
                    {pct}%
                  </span>
                </div>
                <div style={{ height: 5, background: "#e8eaf4", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", width: `${pct}%`,
                    background: isTop ? "#122056" : "#c7cae8",
                    borderRadius: 4, transition: "width 0.6s ease",
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Experience note */}
      <div style={{
        background: "#EEEFFD", borderRadius: 10,
        padding: "12px 16px", marginBottom: 28,
        fontSize: 13, color: "#5B65DC",
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
          <circle cx="8" cy="8" r="6.5" stroke="#5B65DC" strokeWidth="1.3" />
          <path d="M8 5v4M8 10.5v.5" stroke="#5B65DC" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
        We recommend a doctor with at least{" "}
        <strong style={{ marginLeft: 3 }}>{result.recommended_min_experience} year{result.recommended_min_experience !== 1 ? "s" : ""}</strong>
        &nbsp;of experience for your case.
      </div>

      {/* CTAs */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <button onClick={onRetry} style={{
          height: 48, background: "#fff",
          border: "1.5px solid #dde0f0", borderRadius: 12,
          fontFamily: "inherit", fontSize: 14, fontWeight: 500,
          color: "#6b7280", cursor: "pointer",
        }}>
          Check Again
        </button>
        <button onClick={() => onBookAppointment(mappedSpecialty)} style={{
          height: 48, background: "#122056",
          border: "none", borderRadius: 12,
          fontFamily: "inherit", fontSize: 14, fontWeight: 600,
          color: "#fff", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}>
          Find a Doctor
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 3l5 5-5 5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
export default function SymptomChecker() {
  const navigate = useNavigate();

  const [step, setStep] = useState("form"); // "form" | "loading" | "result"
  const [query, setQuery] = useState("");
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [severity, setSeverity] = useState("moderate");
  const [durationDays, setDurationDays] = useState(7);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const filteredSymptoms = query.trim()
    ? ALL_SYMPTOMS.filter(s => s.toLowerCase().includes(query.toLowerCase()))
    : ALL_SYMPTOMS;

  const toggleSymptom = (symptom) => {
    setSelectedSymptoms(prev =>
      prev.includes(symptom) ? prev.filter(s => s !== symptom) : [...prev, symptom]
    );
  };

  const handleSubmit = async () => {
    setError("");
    if (selectedSymptoms.length === 0) return setError("Please select at least one symptom.");
    if (!age || isNaN(age) || age < 0 || age > 120) return setError("Please enter a valid age (0–120).");
    if (!gender) return setError("Please select your gender.");

    setStep("loading");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/symptom-checker/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symptoms: selectedSymptoms,
          age: parseInt(age),
          gender: gender.toUpperCase(),
          severity,
          duration_days: parseInt(durationDays),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || "Prediction failed");

      setResult(data);
      setStep("result");
    } catch (err) {
      setError(err.message || "Could not reach the ML service. Make sure it's running on port 5007.");
      setStep("form");
    }
  };

  const handleBookAppointment = (specialty) => {
    navigate(`/book-appointment?specialty=${encodeURIComponent(specialty)}`);
  };

  const handleRetry = () => {
    setResult(null);
    setStep("form");
    setSelectedSymptoms([]);
    setError("");
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
        .spin { animation: spin 0.9s linear infinite; }
        @keyframes pulse {
          0%, 100% { opacity: 1; } 50% { opacity: 0.5; }
        }
        .symptom-grid {
          display: flex; flex-wrap: wrap; gap: 8px;
          max-height: 260px; overflow-y: auto;
          padding: 4px 2px;
        }
        .symptom-grid::-webkit-scrollbar { width: 4px; }
        .symptom-grid::-webkit-scrollbar-track { background: transparent; }
        .symptom-grid::-webkit-scrollbar-thumb { background: #dde0f0; border-radius: 4px; }
      `}</style>

      <div style={{ display: "flex", minHeight: "100vh", background: "#FAFAFD" }}>
        <PatientNavbar />

        <main style={{
          flex: 1, overflowY: "auto",
          display: "flex", alignItems: "flex-start", justifyContent: "center",
          padding: "48px 16px 48px",
        }}>
          <div style={{ width: "100%", maxWidth: 580 }}>

            {/* ── Header ── */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
              <button onClick={() => navigate(-1)} style={{
                background: "none", border: "1.5px solid #dde0f0", borderRadius: 8,
                width: 36, height: 36, cursor: "pointer", display: "flex",
                alignItems: "center", justifyContent: "center", color: "#6b7280",
                flexShrink: 0,
              }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <div>
                <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, color: "#122056", margin: 0 }}>
                  Symptom Checker
                </h1>
                <p style={{ fontSize: 13, color: "#8a90b8", margin: 0 }}>
                  HealthLink AI — Powered by machine learning
                </p>
              </div>
            </div>

            {/* ── Card ── */}
            <div className="fade-up" style={{
              background: "#fff", borderRadius: 20,
              border: "1px solid #eaecf8",
              boxShadow: "0 4px 24px rgba(18,32,86,0.07)",
              padding: "36px 40px",
            }}>

              {/* ── FORM ── */}
              {step === "form" && (
                <div className="fade-up">
                  <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: "#122056", marginBottom: 4 }}>
                    Describe your symptoms
                  </h2>
                  <p style={{ fontSize: 13, color: "#8a90b8", marginBottom: 28 }}>
                    Select all symptoms you're experiencing and we'll recommend the right specialist.
                  </p>

                  {/* Disclaimer */}
                  <div style={{
                    background: "#fffbeb", border: "1px solid #fde68a",
                    borderRadius: 10, padding: "10px 14px", marginBottom: 24,
                    fontSize: 12, color: "#92400e",
                    display: "flex", alignItems: "flex-start", gap: 8,
                  }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                      <path d="M7 1L1 12.5h12L7 1z" stroke="#d97706" strokeWidth="1.2" strokeLinejoin="round" />
                      <path d="M7 5.5v3M7 9.5v.5" stroke="#d97706" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                    This tool provides AI-based suggestions only. It is not a substitute for professional medical advice.
                  </div>

                  {/* Symptom search */}
                  <Field label="Symptoms" required hint={`${selectedSymptoms.length} selected`}>
                    <div style={{ position: "relative", marginBottom: 12 }}>
                      <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                        width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <circle cx="6" cy="6" r="4.5" stroke="#9ca3af" strokeWidth="1.3" />
                        <path d="M9.5 9.5L12 12" stroke="#9ca3af" strokeWidth="1.3" strokeLinecap="round" />
                      </svg>
                      <input
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Search symptoms..."
                        style={{
                          width: "100%", height: 40,
                          border: "1.5px solid #dde0f0", borderRadius: 10,
                          paddingLeft: 34, paddingRight: 14,
                          fontFamily: "inherit", fontSize: 13, color: "#122056",
                          outline: "none", boxSizing: "border-box",
                        }}
                        onFocus={e => (e.target.style.borderColor = "#5B65DC")}
                        onBlur={e => (e.target.style.borderColor = "#dde0f0")}
                      />
                    </div>

                    {/* Selected pills pinned at top */}
                    {selectedSymptoms.length > 0 && (
                      <div style={{
                        display: "flex", flexWrap: "wrap", gap: 6,
                        padding: "10px 12px", background: "#EEEFFD",
                        borderRadius: 10, marginBottom: 10,
                      }}>
                        {selectedSymptoms.map(s => (
                          <span key={s} style={{
                            background: "#122056", color: "#fff",
                            borderRadius: 20, padding: "4px 10px",
                            fontSize: 12, fontWeight: 500,
                            display: "flex", alignItems: "center", gap: 5,
                          }}>
                            {s}
                            <button onClick={() => toggleSymptom(s)} style={{
                              background: "none", border: "none", cursor: "pointer",
                              color: "rgba(255,255,255,0.7)", padding: 0, fontSize: 13, lineHeight: 1,
                            }}>×</button>
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="symptom-grid">
                      {filteredSymptoms.map(s => (
                        <SymptomTag
                          key={s}
                          symptom={s}
                          selected={selectedSymptoms.includes(s)}
                          onToggle={toggleSymptom}
                        />
                      ))}
                      {filteredSymptoms.length === 0 && (
                        <p style={{ fontSize: 13, color: "#9ca3af", padding: "8px 0" }}>
                          No symptoms match "{query}"
                        </p>
                      )}
                    </div>
                  </Field>

                  {/* Age + Gender */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <Field label="Age" required>
                      <input
                        type="number" value={age} min={0} max={120}
                        onChange={e => setAge(e.target.value)}
                        placeholder="e.g. 34"
                        style={{
                          width: "100%", height: 44,
                          border: "1.5px solid #dde0f0", borderRadius: 10,
                          padding: "0 14px", fontFamily: "inherit",
                          fontSize: 14, color: "#122056", outline: "none",
                          boxSizing: "border-box",
                        }}
                        onFocus={e => (e.target.style.borderColor = "#5B65DC")}
                        onBlur={e => (e.target.style.borderColor = "#dde0f0")}
                      />
                    </Field>

                    <Field label="Gender" required>
                      <div style={{ position: "relative" }}>
                        <select
                          value={gender}
                          onChange={e => setGender(e.target.value)}
                          style={{
                            width: "100%", height: 44,
                            border: "1.5px solid #dde0f0", borderRadius: 10,
                            padding: "0 14px", fontFamily: "inherit",
                            fontSize: 14, color: gender ? "#122056" : "#9ca3af",
                            outline: "none", boxSizing: "border-box",
                            appearance: "none", background: "#fff", cursor: "pointer",
                          }}
                          onFocus={e => (e.target.style.borderColor = "#5B65DC")}
                          onBlur={e => (e.target.style.borderColor = "#dde0f0")}
                        >
                          <option value="">Select...</option>
                          <option value="M">Male</option>
                          <option value="F">Female</option>
                        </select>
                        <svg style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                          width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2 4l4 4 4-4" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </Field>
                  </div>

                  {/* Severity */}
                  <Field label="How severe are your symptoms?" required>
                    <div style={{ display: "flex", gap: 10 }}>
                      <SeverityOption
                        value="mild" label="Mild" description="Minor discomfort"
                        selected={severity === "mild"} onClick={setSeverity} color="#16a34a"
                      />
                      <SeverityOption
                        value="moderate" label="Moderate" description="Noticeable, affecting daily life"
                        selected={severity === "moderate"} onClick={setSeverity} color="#d97706"
                      />
                      <SeverityOption
                        value="severe" label="Severe" description="Significant distress"
                        selected={severity === "severe"} onClick={setSeverity} color="#dc2626"
                      />
                    </div>
                  </Field>

                  {/* Duration */}
                  <Field label="How long have you had these symptoms?" hint={`${durationDays} day${durationDays !== 1 ? "s" : ""}`}>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <input
                        type="range" min={1} max={90} step={1}
                        value={durationDays}
                        onChange={e => setDurationDays(parseInt(e.target.value))}
                        style={{ flex: 1, accentColor: "#122056" }}
                      />
                      <div style={{
                        minWidth: 56, height: 36,
                        background: "#EEEFFD", borderRadius: 8,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 13, fontWeight: 700, color: "#122056",
                      }}>
                        {durationDays}d
                      </div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#9ca3af", marginTop: 4 }}>
                      <span>1 day</span>
                      <span>3 months</span>
                    </div>
                  </Field>

                  {/* Error */}
                  {error && (
                    <div style={{
                      background: "#fef2f2", border: "1px solid #fecaca",
                      borderRadius: 8, padding: "10px 14px", marginBottom: 20,
                      fontSize: 13, color: "#DC2626",
                    }}>
                      {error}
                    </div>
                  )}

                  {/* Submit */}
                  <button onClick={handleSubmit} style={{
                    width: "100%", height: 52,
                    background: selectedSymptoms.length === 0 ? "#9aa3c8" : "#122056",
                    border: "none", borderRadius: 12,
                    fontFamily: "inherit", fontSize: 15, fontWeight: 600,
                    color: "#fff", cursor: selectedSymptoms.length === 0 ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                    transition: "background 0.2s",
                  }}>
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <circle cx="8" cy="8" r="6" stroke="#fff" strokeWidth="1.5" />
                      <path d="M12.5 12.5L16 16" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    Analyse Symptoms
                    {selectedSymptoms.length > 0 && (
                      <span style={{
                        background: "rgba(255,255,255,0.2)", borderRadius: 12,
                        padding: "2px 8px", fontSize: 12,
                      }}>
                        {selectedSymptoms.length} selected
                      </span>
                    )}
                  </button>
                </div>
              )}

              {/* ── LOADING ── */}
              {step === "loading" && (
                <div style={{ textAlign: "center", padding: "48px 0" }}>
                  <div style={{
                    width: 72, height: 72, borderRadius: "50%",
                    background: "#EEEFFD",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 24px",
                  }}>
                    <svg className="spin" width="36" height="36" viewBox="0 0 36 36" fill="none">
                      <circle cx="18" cy="18" r="14" stroke="#dde0f0" strokeWidth="3" />
                      <path d="M18 4a14 14 0 0 1 14 14" stroke="#122056" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                  </div>
                  <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: "#122056", marginBottom: 8 }}>
                    Analysing your symptoms
                  </h2>
                  <p style={{ fontSize: 13, color: "#8a90b8", lineHeight: 1.6 }}>
                    Our AI is evaluating {selectedSymptoms.length} symptom{selectedSymptoms.length !== 1 ? "s" : ""} against
                    clinical patterns. This takes just a moment.
                  </p>
                  <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 24 }}>
                    {[0, 0.15, 0.3].map((delay, i) => (
                      <div key={i} style={{
                        width: 8, height: 8, borderRadius: "50%", background: "#122056",
                        animation: `pulse 1.2s ease-in-out ${delay}s infinite`,
                      }} />
                    ))}
                  </div>
                </div>
              )}

              {/* ── RESULT ── */}
              {step === "result" && result && (
                <ResultCard
                  result={result}
                  onBookAppointment={handleBookAppointment}
                  onRetry={handleRetry}
                />
              )}
            </div>

            {/* Footer note */}
            <p style={{ textAlign: "center", fontSize: 11, color: "#c4c8de", marginTop: 20, lineHeight: 1.6 }}>
              HealthLink AI · Results are indicative only · Always consult a qualified physician
            </p>
          </div>
        </main>
      </div>
    </>
  );
}