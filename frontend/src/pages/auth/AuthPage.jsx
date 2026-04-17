// frontend/src/pages/auth/AuthPage.jsx
import { useState } from "react";
import LoginPanel from "../../components/auth/LoginPanel";
import RegisterPanel from "../../components/auth/RegisterPanel";
import RoleSelectPanel from "../../components/auth/RoleSelectPanel";
import PatientProfilePanel from "../../components/auth/PatientProfilePanel";
import DoctorProfilePanel from "../../components/auth/DoctorProfilePanel";
import { COLORS } from "../../components/auth/authTheme";

// Registry of profile panels by role. Add new roles here as they come online.
const PROFILE_PANELS = {
  Patient: PatientProfilePanel,
  Doctor: DoctorProfilePanel,
};

const BrandLogo = () => (
  <img src="/LOGO.png" alt="HealthLink Logo" style={{ width: 60, height: 60, borderRadius: 10, objectFit: "cover" }} />
);

export default function AuthPage() {
  const [mode, setMode] = useState("login");       // "login" | "register"
  const [step, setStep] = useState("basic");       // "basic" | "role" | "profile"
  const [regData, setRegData] = useState({ name: "", email: "", password: "" });
  const [role, setRole] = useState(null);          // "Patient" | "Doctor"

  const goToLogin = () => { setMode("login"); setStep("basic"); };
  const goToRegister = () => { setMode("register"); setStep("basic"); };

  // When login detects an incomplete profile, jump into the profile step
  const resumeProfile = (userRole) => {
    setRole(userRole);
    setMode("register");
    setStep("profile");
  };

  const showTabs = step === "basic";

  const renderRightPanel = () => {
    if (mode === "login") {
      return <LoginPanel onSwitch={goToRegister} onResumeProfile={resumeProfile} />;
    }
    if (step === "basic") {
      return (
        <RegisterPanel
          initial={regData}
          onNext={(data) => { setRegData(data); setStep("role"); }}
          onSwitch={goToLogin}
        />
      );
    }
    if (step === "role") {
      return (
        <RoleSelectPanel
          regData={regData}
          onBack={() => setStep("basic")}
          onRegistered={(selectedRole) => { setRole(selectedRole); setStep("profile"); }}
        />
      );
    }
    if (step === "profile") {
      const Panel = PROFILE_PANELS[role];
      if (!Panel) {
        // Fallback, should never happen if registry is kept in sync with roles
        return <div style={{ color: COLORS.primary }}>No profile step configured for role: {role}</div>;
      }
      return <Panel />;
    }
    return null;
  };

  return (
    <>
      <style>{"@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap'); * { box-sizing: border-box; margin: 0; padding: 0; } body { font-family: 'DM Sans', sans-serif; }"}</style>
      <div style={{ minHeight: "100vh", display: "flex", fontFamily: "'DM Sans', sans-serif", background: "#0b1a44", position: "relative", overflow: "hidden" }}>
        <span style={{ position: "absolute", borderRadius: "50%", width: 420, height: 420, top: -80, left: -100, opacity: 0.06, background: COLORS.accent, pointerEvents: "none" }} />
        <span style={{ position: "absolute", borderRadius: "50%", width: 260, height: 260, bottom: 60, left: 160, opacity: 0.04, background: COLORS.accent, pointerEvents: "none" }} />
        <span style={{ position: "absolute", borderRadius: "50%", width: 140, height: 140, top: "50%", right: 40, opacity: 0.08, background: COLORS.teal, pointerEvents: "none" }} />

        {/* LEFT MARKETING PANEL */}
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

        {/* RIGHT CARD */}
        <div style={{ width: 460, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 48px", background: COLORS.lightBg, position: "relative", zIndex: 2, overflowY: "auto" }}>
          <div style={{ width: "100%", maxWidth: 360 }}>
            {showTabs && (
              <div style={{ display: "flex", background: "#e8eaf4", borderRadius: 12, padding: 4, marginBottom: 32 }}>
                <button
                  onClick={goToLogin}
                  style={{
                    flex: 1, padding: "9px", border: "none", borderRadius: 9,
                    background: mode === "login" ? "#fff" : "transparent",
                    fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500,
                    color: mode === "login" ? COLORS.primary : "#7a84b8",
                    cursor: "pointer",
                    boxShadow: mode === "login" ? "0 1px 4px rgba(18,32,86,0.12)" : "none",
                    transition: "all 0.2s",
                  }}
                >
                  Sign In
                </button>
                <button
                  onClick={goToRegister}
                  style={{
                    flex: 1, padding: "9px", border: "none", borderRadius: 9,
                    background: mode === "register" ? "#fff" : "transparent",
                    fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500,
                    color: mode === "register" ? COLORS.primary : "#7a84b8",
                    cursor: "pointer",
                    boxShadow: mode === "register" ? "0 1px 4px rgba(18,32,86,0.12)" : "none",
                    transition: "all 0.2s",
                  }}
                >
                  Register
                </button>
              </div>
            )}
            {renderRightPanel()}
          </div>
        </div>
      </div>
    </>
  );
}