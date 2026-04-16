import { useState } from "react";
import { loginUser, registerUser } from "../../services/authService";
import { useNavigate, useLocation } from "react-router-dom";
import { Button, ErrorMessage } from "../../components/shared";
import { getProfile as getPatientProfile } from "../../api/patientApi";

const COLORS = {
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

const inputStyle = {
  width: "100%",
  height: 44,
  border: "1.5px solid " + COLORS.border,
  borderRadius: 10,
  background: COLORS.surface,
  padding: "0 14px 0 40px",
};

const IconEmail = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="1" y="3" width="14" height="10" rx="2" stroke={COLORS.primary} strokeWidth="1.3" />
    <path d="M1 5.5l7 4.5 7-4.5" stroke={COLORS.primary} strokeWidth="1.3" />
  </svg>
);

const IconLock = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="3" y="7" width="10" height="8" rx="2" stroke={COLORS.primary} strokeWidth="1.3" />
    <path d="M5 7V5a3 3 0 0 1 6 0v2" stroke={COLORS.primary} strokeWidth="1.3" />
    <circle cx="8" cy="11" r="1.2" fill={COLORS.primary} />
  </svg>
);

const IconUser = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="5" r="3" stroke={COLORS.primary} strokeWidth="1.3" />
    <path d="M1 14c0-3.3 3.1-6 7-6s7 2.7 7 6" stroke={COLORS.primary} strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

const IconArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M6 8h7M10 5l3 3-3 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 3H4a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h5" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

const IconPlus = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 1v14M1 8h14" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const IconGoogle = () => (
  <svg width="16" height="16" viewBox="0 0 16 16">
    <path d="M15.5 8.2c0-.6-.1-1.2-.2-1.7H8v3.2h4.2c-.2 1-.8 1.8-1.7 2.4v2h2.7c1.6-1.4 2.3-3.6 2.3-5.9z" fill="#4285F4" />
    <path d="M8 16c2.1 0 3.9-.7 5.2-1.9l-2.7-2c-.7.5-1.5.8-2.5.8-2 0-3.6-1.3-4.2-3H1v2.1C2.3 14.2 5 16 8 16z" fill="#34A853" />
    <path d="M3.8 9.9c-.2-.5-.3-1-.3-1.9s.1-1.4.3-1.9V4H1A7.9 7.9 0 0 0 0 8c0 1.3.3 2.5.9 3.6l2.9-1.7z" fill="#FBBC05" />
    <path d="M8 3.2c1.1 0 2.1.4 2.9 1.1L13.3 2C11.9.8 10.1 0 8 0 5 0 2.3 1.8 1 4.4l2.8 2.1C4.4 4.5 6 3.2 8 3.2z" fill="#EA4335" />
  </svg>
);

const IconGitHub = () => (
  <svg width="16" height="16" viewBox="0 0 16 16">
    <path d="M8 0C3.6 0 0 3.6 0 8c0 3.5 2.3 6.5 5.5 7.6.4.1.5-.2.5-.4V13.8c-2.2.5-2.7-1-2.7-1-.4-.9-.9-1.2-.9-1.2-.7-.5.1-.5.1-.5.8.1 1.2.8 1.2.8.7 1.2 1.9.9 2.3.7.1-.5.3-.9.5-1.1-1.8-.2-3.6-.9-3.6-4 0-.9.3-1.6.8-2.1-.1-.2-.4-1 .1-2.1 0 0 .7-.2 2.2.8.6-.2 1.3-.3 2-.3s1.4.1 2 .3c1.5-1 2.2-.8 2.2-.8.5 1.1.2 1.9.1 2.1.5.6.8 1.3.8 2.1 0 3.1-1.9 3.8-3.7 4 .3.3.6.8.6 1.5v2.2c0 .2.1.5.5.4C13.7 14.5 16 11.5 16 8c0-4.4-3.6-8-8-8z" fill="#333" />
  </svg>
);

const BrandLogo = () => (
  <img src="/LOGO.png" alt="HealthLink Logo" style={{ width: 60, height: 60, borderRadius: 10, objectFit: "cover" }} />
);

const Field = ({ label, icon: Icon, children }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: COLORS.labelColor, marginBottom: 6, letterSpacing: "0.4px", textTransform: "uppercase" }}>
      {label}
    </label>
    <div style={{ position: "relative" }}>
      <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", opacity: 0.4, display: "flex", alignItems: "center" }}>
        {Icon && <Icon />}
      </span>
      {children}
    </div>
  </div>
);

const PrimaryButton = ({ children, color, icon, onClick }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%",
        height: 48,
        background: hovered ? "#4a54c8" : color,
        border: "none",
        borderRadius: 12,
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 15,
        fontWeight: 600,
        color: "#fff",
        cursor: "pointer",
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

const SocialButton = ({ children, icon }) => {
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

const Divider = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
    <div style={{ flex: 1, height: 1, background: "#e0e3f0" }} />
    <span style={{ fontSize: 12, color: "#a0a8cc" }}>or continue with</span>
    <div style={{ flex: 1, height: 1, background: "#e0e3f0" }} />
  </div>
);

const LoginPanel = ({ onSwitch }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async () => {
    try {
      setError("");
      const data = await loginUser({ email, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (data?.user?.role === "Patient") {
        try {
          await getPatientProfile();
        } catch (err) {
          const status = err?.response?.status;
          const apiMessage = err?.response?.data?.message;
          const isDeactivated = status === 403 || String(apiMessage || err?.message || "").toLowerCase().includes("deactivated");
          if (isDeactivated) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            setError("Your account has been deactivated. Please contact support.");
            return;
          }
        }
      }

      const from = location.state?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
      } else if (data.user.role === "Admin") {
        navigate("/admin/dashboard");
      } else if (data.user.role === "Doctor") {
        navigate("/doctor/profile");
      } else {
        navigate("/patient");
      }
    } catch (err) {
      const apiMessage = err?.response?.data?.message;
      setError(apiMessage || err?.message || "Login failed. Please try again.");
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: 26, color: COLORS.primary }}>Welcome back</h2>
      {error && <ErrorMessage message={error} />}
      <Field label="Email address" icon={IconEmail}>
        <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
      </Field>
      <Field label="Password" icon={IconLock}>
        <input type="password" placeholder="********" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
      </Field>
      <PrimaryButton color={COLORS.accent} icon={<IconArrowRight />} onClick={handleLogin}>
        Sign In
      </PrimaryButton>
      <Divider />
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <SocialButton icon={<IconGoogle />}>Continue with Google</SocialButton>
        <SocialButton icon={<IconGitHub />}>Continue with GitHub</SocialButton>
      </div>
      <br />
      <p style={{ fontSize: 12, textAlign: "center", color: COLORS.mutedText }}>
        Don't have an account?{" "}
        <a href="#" onClick={(e) => { e.preventDefault(); onSwitch(); }} style={{ color: COLORS.accent, textDecoration: "none", fontWeight: 500, cursor: "pointer" }}>
          Create one
        </a>
      </p>
    </div>
  );
};

const RegisterPanel = ({ onSwitch }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    try {
      setError("");
      if (!name || !email || !password || !confirm) {
        setError("All fields are required");
        return;
      }
      if (password !== confirm) {
        setError("Passwords do not match");
        return;
      }
      setLoading(true);
      await registerUser({ name, email, password, role: "Patient" });
      alert("Account created successfully!");
      onSwitch();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: 26, color: COLORS.primary, marginBottom: 6 }}>Create account</h2>
      <p style={{ fontSize: 13, color: COLORS.mutedText, marginBottom: 28 }}>Join HealthLink, it takes under a minute</p>
      {error && <ErrorMessage message={error} />}
      <Field label="Full name" icon={IconUser}>
        <input type="text" placeholder="Dr. Jane Smith" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
      </Field>
      <Field label="Email address" icon={IconEmail}>
        <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
      </Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Password" icon={IconLock}>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
        </Field>
        <Field label="Confirm" icon={IconLock}>
          <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} style={inputStyle} />
        </Field>
      </div>
      <PrimaryButton color={COLORS.accent} icon={<IconPlus />} onClick={handleRegister}>
        {loading ? "Creating..." : "Create Account"}
      </PrimaryButton>
      <p style={{ fontSize: 11, color: "#a0a8cc", textAlign: "center", marginTop: 12 }}>
        By registering, you agree to our{" "}
        <a href="#" style={{ color: COLORS.accent }}>Terms</a>{" "}
        and{" "}
        <a href="#" style={{ color: COLORS.accent }}>Privacy Policy</a>
      </p>
      <p style={{ fontSize: 12, color: "#a0a8cc", textAlign: "center", marginTop: 16 }}>
        Already have an account?{" "}
        <a href="#" onClick={(e) => { e.preventDefault(); onSwitch(); }} style={{ color: COLORS.accent, fontWeight: 500 }}>
          Sign in
        </a>
      </p>
    </div>
  );
};

export default function AuthPage() {
  const [tab, setTab] = useState("login");
  return (
    <>
      <style>{"@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; } body { font-family: 'DM Sans', sans-serif; }"}</style>
      <div style={{ minHeight: "100vh", display: "flex", fontFamily: "'DM Sans', sans-serif", background: "#0b1a44", position: "relative", overflow: "hidden" }}>
        <span style={{ position: "absolute", borderRadius: "50%", width: 420, height: 420, top: -80, left: -100, opacity: 0.06, background: COLORS.accent, pointerEvents: "none" }} />
        <span style={{ position: "absolute", borderRadius: "50%", width: 260, height: 260, bottom: 60, left: 160, opacity: 0.04, background: COLORS.accent, pointerEvents: "none" }} />
        <span style={{ position: "absolute", borderRadius: "50%", width: 140, height: 140, top: "50%", right: 40, opacity: 0.08, background: COLORS.teal, pointerEvents: "none" }} />

        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px 56px", position: "relative", zIndex: 2 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 56 }}>
            <BrandLogo />
            <div>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 32, color: "#fff", letterSpacing: "-0.3px" }}>HealthLink</div>
              <div style={{ fontSize: 15, color: COLORS.mutedBlue, letterSpacing: "2px", textTransform: "uppercase", marginTop: 1, fontWeight: 500 }}>Medical System</div>
            </div>
          </div>

          <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(91,101,220,0.12)", color: COLORS.accent, fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 20, marginBottom: 20, letterSpacing: "0.5px", width: "fit-content" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: COLORS.teal, display: "inline-block" }} />
            System Online
          </div>

          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 42, lineHeight: 1.15, color: "#fff", marginBottom: 20, maxWidth: 340 }}>
            Your health,{" "}
            <em style={{ fontStyle: "italic", color: "#7ecbb5" }}>connected</em>
            <br />and secured.
          </h1>

          <p style={{ fontSize: 14, color: "#8a9bcc", lineHeight: 1.7, maxWidth: 300, marginBottom: 48 }}>
            A unified platform for patients, doctors, and administrators, bringing care closer through intelligent, seamless healthcare management.
          </p>

          <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
            <div>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, color: "#fff" }}>24/7</div>
              <div style={{ fontSize: 11, color: COLORS.mutedBlue, letterSpacing: "1px", textTransform: "uppercase", marginTop: 2 }}>Availability</div>
            </div>
            <div style={{ width: 1, height: 36, background: "rgba(255,255,255,0.08)" }} />
            <div>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, color: "#fff" }}>3</div>
              <div style={{ fontSize: 11, color: COLORS.mutedBlue, letterSpacing: "1px", textTransform: "uppercase", marginTop: 2 }}>User Roles</div>
            </div>
            <div style={{ width: 1, height: 36, background: "rgba(255,255,255,0.08)" }} />
            <div>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, color: "#fff" }}>SSL</div>
              <div style={{ fontSize: 11, color: COLORS.mutedBlue, letterSpacing: "1px", textTransform: "uppercase", marginTop: 2 }}>Encrypted</div>
            </div>
          </div>
        </div>

        <div style={{ width: 460, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 48px", background: COLORS.lightBg, position: "relative", zIndex: 2 }}>
          <div style={{ width: "100%", maxWidth: 360 }}>
            <div style={{ display: "flex", background: "#e8eaf4", borderRadius: 12, padding: 4, marginBottom: 32 }}>
              <button
                onClick={() => setTab("login")}
                style={{
                  flex: 1,
                  padding: "9px",
                  border: "none",
                  borderRadius: 9,
                  background: tab === "login" ? "#fff" : "transparent",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14,
                  fontWeight: 500,
                  color: tab === "login" ? COLORS.primary : "#7a84b8",
                  cursor: "pointer",
                  boxShadow: tab === "login" ? "0 1px 4px rgba(18,32,86,0.12)" : "none",
                  transition: "all 0.2s",
                }}
              >
                Sign In
              </button>
              <button
                onClick={() => setTab("register")}
                style={{
                  flex: 1,
                  padding: "9px",
                  border: "none",
                  borderRadius: 9,
                  background: tab === "register" ? "#fff" : "transparent",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14,
                  fontWeight: 500,
                  color: tab === "register" ? COLORS.primary : "#7a84b8",
                  cursor: "pointer",
                  boxShadow: tab === "register" ? "0 1px 4px rgba(18,32,86,0.12)" : "none",
                  transition: "all 0.2s",
                }}
              >
                Register
              </button>
            </div>
            {tab === "login"
              ? <LoginPanel onSwitch={() => setTab("register")} />
              : <RegisterPanel onSwitch={() => setTab("login")} />
            }
          </div>
        </div>
      </div>
    </>
  );
}
