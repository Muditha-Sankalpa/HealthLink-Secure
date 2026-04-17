// frontend/src/components/auth/authTheme.js
import { useState } from "react";

export const COLORS = {
  primary: "#122056",
  accent: "#5B65DC",
  secondary: "#EEEFFD",
  background: "#FAFAFD",
  surface: "#FFFFFF",
  teal: "#22d3a5",
  mutedBlue: "#6b7ec4",
  lightBg: "#f5f6fc",
  border: "#dde0f0",
  labelColor: "#4a5280",
  mutedText: "#8a90b8",
  inputText: "#122056",
  placeholder: "#b0b6d4",
};

export const inputStyle = {
  width: "100%",
  height: 44,
  border: "1.5px solid " + COLORS.border,
  borderRadius: 10,
  background: COLORS.surface,
  padding: "0 14px 0 40px",
};

export const inputStyleNoIcon = {
  ...inputStyle,
  paddingLeft: 14,
};

export const IconEmail = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="1" y="3" width="14" height="10" rx="2" stroke={COLORS.primary} strokeWidth="1.3" />
    <path d="M1 5.5l7 4.5 7-4.5" stroke={COLORS.primary} strokeWidth="1.3" />
  </svg>
);

export const IconLock = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="3" y="7" width="10" height="8" rx="2" stroke={COLORS.primary} strokeWidth="1.3" />
    <path d="M5 7V5a3 3 0 0 1 6 0v2" stroke={COLORS.primary} strokeWidth="1.3" />
    <circle cx="8" cy="11" r="1.2" fill={COLORS.primary} />
  </svg>
);

export const IconUser = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="5" r="3" stroke={COLORS.primary} strokeWidth="1.3" />
    <path d="M1 14c0-3.3 3.1-6 7-6s7 2.7 7 6" stroke={COLORS.primary} strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

export const IconArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M6 8h7M10 5l3 3-3 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 3H4a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h5" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

export const IconStethoscope = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M4 2v4a3 3 0 0 0 6 0V2" stroke={COLORS.primary} strokeWidth="1.3" strokeLinecap="round" />
    <path d="M7 9v2a3 3 0 0 0 6 0" stroke={COLORS.primary} strokeWidth="1.3" strokeLinecap="round" />
    <circle cx="13" cy="11" r="1.5" stroke={COLORS.primary} strokeWidth="1.3" />
  </svg>
);

export const IconGoogle = () => (
  <svg width="16" height="16" viewBox="0 0 16 16">
    <path d="M15.5 8.2c0-.6-.1-1.2-.2-1.7H8v3.2h4.2c-.2 1-.8 1.8-1.7 2.4v2h2.7c1.6-1.4 2.3-3.6 2.3-5.9z" fill="#4285F4" />
    <path d="M8 16c2.1 0 3.9-.7 5.2-1.9l-2.7-2c-.7.5-1.5.8-2.5.8-2 0-3.6-1.3-4.2-3H1v2.1C2.3 14.2 5 16 8 16z" fill="#34A853" />
    <path d="M3.8 9.9c-.2-.5-.3-1-.3-1.9s.1-1.4.3-1.9V4H1A7.9 7.9 0 0 0 0 8c0 1.3.3 2.5.9 3.6l2.9-1.7z" fill="#FBBC05" />
    <path d="M8 3.2c1.1 0 2.1.4 2.9 1.1L13.3 2C11.9.8 10.1 0 8 0 5 0 2.3 1.8 1 4.4l2.8 2.1C4.4 4.5 6 3.2 8 3.2z" fill="#EA4335" />
  </svg>
);

export const IconGitHub = () => (
  <svg width="16" height="16" viewBox="0 0 16 16">
    <path d="M8 0C3.6 0 0 3.6 0 8c0 3.5 2.3 6.5 5.5 7.6.4.1.5-.2.5-.4V13.8c-2.2.5-2.7-1-2.7-1-.4-.9-.9-1.2-.9-1.2-.7-.5.1-.5.1-.5.8.1 1.2.8 1.2.8.7 1.2 1.9.9 2.3.7.1-.5.3-.9.5-1.1-1.8-.2-3.6-.9-3.6-4 0-.9.3-1.6.8-2.1-.1-.2-.4-1 .1-2.1 0 0 .7-.2 2.2.8.6-.2 1.3-.3 2-.3s1.4.1 2 .3c1.5-1 2.2-.8 2.2-.8.5 1.1.2 1.9.1 2.1.5.6.8 1.3.8 2.1 0 3.1-1.9 3.8-3.7 4 .3.3.6.8.6 1.5v2.2c0 .2.1.5.5.4C13.7 14.5 16 11.5 16 8c0-4.4-3.6-8-8=8z" fill="#333" />
  </svg>
);

export const Field = ({ label, icon: Icon, children }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: COLORS.labelColor, marginBottom: 6, letterSpacing: "0.4px", textTransform: "uppercase" }}>
      {label}
    </label>
    <div style={{ position: "relative" }}>
      {Icon && (
        <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", opacity: 0.4, display: "flex", alignItems: "center" }}>
          <Icon />
        </span>
      )}
      {children}
    </div>
  </div>
);

export const PrimaryButton = ({ children, color = COLORS.accent, icon, onClick, disabled }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "100%",
        height: 48,
        background: disabled ? "#b5bae6" : (hovered ? "#4a54c8" : color),
        border: "none",
        borderRadius: 12,
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 15,
        fontWeight: 600,
        color: "#fff",
        cursor: disabled ? "not-allowed" : "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        marginBottom: 20,
        transition: "background 0.2s",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {icon}
      {children}
    </button>
  );
};

export const SocialButton = ({ children, icon }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      style={{
        height: 40,
        border: "1.5px solid " + (hovered ? COLORS.accent : COLORS.border),
        borderRadius: 10,
        background: hovered ? "#f0f1fb" : COLORS.surface,
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 13,
        fontWeight: 500,
        color: COLORS.labelColor,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 7,
        transition: "border-color 0.2s, background 0.2s",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {icon}
      {children}
    </button>
  );
};

export const Divider = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
    <div style={{ flex: 1, height: 1, background: "#e0e3f0" }} />
    <span style={{ fontSize: 12, color: "#a0a8cc" }}>or continue with</span>
    <div style={{ flex: 1, height: 1, background: "#e0e3f0" }} />
  </div>
);