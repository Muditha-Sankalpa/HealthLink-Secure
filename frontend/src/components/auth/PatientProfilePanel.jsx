// frontend/src/components/auth/PatientProfilePanel.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProfile as createPatientProfile } from "../../api/patientApi";
import { ErrorMessage } from "../shared";
import {
  COLORS, inputStyle, inputStyleNoIcon, Field, PrimaryButton,
  IconUser, IconEmail, IconArrowRight,
} from "./authTheme";

const CheckboxOption = ({ label, checked, onChange }) => (
  <label
    style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "10px 14px",
      border: "1.5px solid " + (checked ? COLORS.accent : COLORS.border),
      borderRadius: 10,
      background: checked ? "#f0f1fb" : COLORS.surface,
      cursor: "pointer",
      flex: 1,
      fontSize: 14,
      color: COLORS.primary,
      fontWeight: 500,
      transition: "all 0.2s",
    }}
  >
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      style={{ accentColor: COLORS.accent, width: 16, height: 16, cursor: "pointer" }}
    />
    {label}
  </label>
);

export default function PatientProfilePanel() {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [form, setForm] = useState({
    name: storedUser.name || "",
    email: storedUser.email || "",
    contactNumber: "",
    dob: "",
    gender: "",
    address: "",
    bloodGroup: "",
    notificationPreference: ["email", "sms"],
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const toggleNotification = (channel) => {
    setForm((prev) => {
      const has = prev.notificationPreference.includes(channel);
      const next = has
        ? prev.notificationPreference.filter((c) => c !== channel)
        : [...prev.notificationPreference, channel];
      return { ...prev, notificationPreference: next };
    });
  };

  const handleSubmit = async () => {
    try {
      setError("");
      if (!form.name || !form.email) {
        setError("Name and email are required");
        return;
      }
      if (form.notificationPreference.length === 0) {
        setError("Please select at least one notification preference");
        return;
      }
      setLoading(true);
      await createPatientProfile(form);
      navigate("/patient");
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: 26, color: COLORS.primary, marginBottom: 6 }}>Your profile</h2>
      <p style={{ fontSize: 13, color: COLORS.mutedText, marginBottom: 24 }}>Step 3 of 3, tell us about yourself</p>
      {error && <ErrorMessage message={error} />}

      <Field label="Full name" icon={IconUser}>
        <input type="text" value={form.name} onChange={update("name")} style={inputStyle} />
      </Field>

      <Field label="Email" icon={IconEmail}>
        <input
          type="email"
          value={form.email}
          readOnly
          style={{ ...inputStyle, background: "#f0f1fb", cursor: "not-allowed" }}
        />
      </Field>

      <Field label="Contact number">
        <input type="tel" placeholder="+94 77 123 4567" value={form.contactNumber} onChange={update("contactNumber")} style={inputStyleNoIcon} />
      </Field>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Date of birth">
          <input type="date" value={form.dob} onChange={update("dob")} style={inputStyleNoIcon} />
        </Field>
        <Field label="Gender">
          <select value={form.gender} onChange={update("gender")} style={inputStyleNoIcon}>
            <option value="">Select...</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </Field>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Blood group">
          <select value={form.bloodGroup} onChange={update("bloodGroup")} style={inputStyleNoIcon}>
            <option value="">Select...</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
        </Field>
        <Field label="Address">
          <input type="text" value={form.address} onChange={update("address")} style={inputStyleNoIcon} />
        </Field>
      </div>

      <Field label="Notification preference">
        <div style={{ display: "flex", gap: 10 }}>
          <CheckboxOption
            label="Email"
            checked={form.notificationPreference.includes("email")}
            onChange={() => toggleNotification("email")}
          />
          <CheckboxOption
            label="SMS"
            checked={form.notificationPreference.includes("sms")}
            onChange={() => toggleNotification("sms")}
          />
        </div>
      </Field>

      <div style={{ marginTop: 20 }}>
        <PrimaryButton color={COLORS.accent} icon={<IconArrowRight />} onClick={handleSubmit} disabled={loading}>
          {loading ? "Saving..." : "Complete Setup"}
        </PrimaryButton>
      </div>
    </div>
  );
}