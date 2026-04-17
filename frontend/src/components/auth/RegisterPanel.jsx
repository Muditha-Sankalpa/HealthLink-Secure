// frontend/src/components/auth/RegisterPanel.jsx
import { useState } from "react";
import { ErrorMessage } from "../shared";
import {
  COLORS, inputStyle, Field, PrimaryButton,
  IconUser, IconEmail, IconLock, IconArrowRight,
} from "./authTheme";

export default function RegisterPanel({ initial, onNext, onSwitch }) {
  const [name, setName] = useState(initial?.name || "");
  const [email, setEmail] = useState(initial?.email || "");
  const [password, setPassword] = useState(initial?.password || "");
  const [confirm, setConfirm] = useState(initial?.password || "");
  const [error, setError] = useState("");

  const handleContinue = () => {
    setError("");
    if (!name || !email || !password || !confirm) return setError("All fields are required");
    if (password !== confirm) return setError("Passwords do not match");
    onNext({ name, email, password });
  };

  return (
    <div>
      <h2 style={{ fontSize: 26, color: COLORS.primary, marginBottom: 6 }}>Create account</h2>
      <p style={{ fontSize: 13, color: COLORS.mutedText, marginBottom: 28 }}>Step 1 of 3, basic details</p>
      {error && <ErrorMessage message={error} />}
      <Field label="Full name" icon={IconUser}>
        <input type="text" placeholder="Jane Smith" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
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
      <PrimaryButton color={COLORS.accent} icon={<IconArrowRight />} onClick={handleContinue}>
        Continue
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
}