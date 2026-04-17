// frontend/src/components/auth/LoginPanel.jsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { loginUser } from "../../services/authService";
import { getProfile as getPatientProfile } from "../../api/patientApi";
import { getProfile as getDoctorProfile } from "../../api/doctorApi";
import { ErrorMessage } from "../shared";
import {
  COLORS, inputStyle, Field, PrimaryButton, SocialButton, Divider,
  IconEmail, IconLock, IconArrowRight, IconGoogle, IconGitHub,
} from "./authTheme";

// Maps role to the function that checks whether their profile exists
const PROFILE_CHECKERS = {
  Patient: getPatientProfile,
  Doctor: getDoctorProfile,
};

// Maps role to the dashboard route after successful login + profile check
const DASHBOARD_ROUTES = {
  Patient: "/patient",
  Doctor: "/doctor",
  Admin: "/admin/dashboard",
};

export default function LoginPanel({ onSwitch, onResumeProfile }) {
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

      const role = data?.user?.role;
      const checkProfile = PROFILE_CHECKERS[role];

      // Roles that have a profile step (Patient, Doctor) get checked.
      // Admin and anything else skip straight to their dashboard.
      if (checkProfile) {
        try {
          await checkProfile();
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

          // 404 = profile not created yet. Network errors for Doctor
          // are treated the same, since the endpoint may not exist yet.
          if (status === 404 || (role === "Doctor" && !err?.response)) {
            onResumeProfile(role);
            return;
          }
        }
      }

      const from = location.state?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
      } else {
        navigate(DASHBOARD_ROUTES[role] || "/");
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Login failed. Please try again.");
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
}