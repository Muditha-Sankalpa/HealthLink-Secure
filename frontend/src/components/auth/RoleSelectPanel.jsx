// frontend/src/components/auth/RoleSelectPanel.jsx
import { useState } from "react";
import { registerUser, loginUser } from "../../services/authService";
import { ErrorMessage } from "../shared";
import {
  COLORS, IconUser, IconStethoscope,
} from "./authTheme";

const RoleCard = ({ title, subtitle, icon, onClick, loading }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={loading ? undefined : onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: 20,
        border: "2px solid " + (hovered && !loading ? COLORS.accent : COLORS.border),
        borderRadius: 12,
        background: hovered && !loading ? "#f0f1fb" : COLORS.surface,
        cursor: loading ? "wait" : "pointer",
        display: "flex",
        alignItems: "center",
        gap: 14,
        transition: "all 0.2s",
        opacity: loading ? 0.6 : 1,
      }}
    >
      <div style={{ width: 44, height: 44, borderRadius: 10, background: COLORS.secondary, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.primary }}>{title}</div>
        <div style={{ fontSize: 12, color: COLORS.mutedText, marginTop: 2 }}>{subtitle}</div>
      </div>
    </div>
  );
};

export default function RoleSelectPanel({ regData, onBack, onRegistered }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSelect = async (selectedRole) => {
    try {
      setError("");
      setLoading(true);
      await registerUser({ ...regData, role: selectedRole });
      const data = await loginUser({ email: regData.email, password: regData.password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      onRegistered(selectedRole);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: 26, color: COLORS.primary, marginBottom: 6 }}>Who are you?</h2>
      <p style={{ fontSize: 13, color: COLORS.mutedText, marginBottom: 28 }}>Step 2 of 3, pick your role</p>
      {error && <ErrorMessage message={error} />}
      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
        <RoleCard
          title="I'm a Patient"
          subtitle="Book consultations and manage health records"
          icon={<IconUser />}
          onClick={() => handleSelect("Patient")}
          loading={loading}
        />
        <RoleCard
          title="I'm a Doctor"
          subtitle="Offer consultations and manage patients"
          icon={<IconStethoscope />}
          onClick={() => handleSelect("Doctor")}
          loading={loading}
        />
      </div>
      {loading && <p style={{ fontSize: 12, textAlign: "center", color: COLORS.mutedText }}>Setting up your account...</p>}
      <p style={{ fontSize: 12, textAlign: "center", color: COLORS.mutedText, marginTop: 12 }}>
        <a href="#" onClick={(e) => { e.preventDefault(); if (!loading) onBack(); }} style={{ color: COLORS.accent }}>
          ← Back
        </a>
      </p>
    </div>
  );
}