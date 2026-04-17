// frontend/src/components/auth/DoctorProfilePanel.jsx
import { useNavigate } from "react-router-dom";
import { COLORS, PrimaryButton, IconArrowRight } from "./authTheme";

/*
==============================================================================
TO ACTIVATE THE DOCTOR PROFILE FORM:
==============================================================================
1. In src/api/doctorApi.js, uncomment:
     export const createProfile = (data) => axiosClient.post('/doctors/profile', data);

2. Replace the placeholder <div> below with a real form. Copy the structure of
   PatientProfilePanel.jsx and swap fields for doctor schema ones (e.g.,
   specialization, licenseNumber, yearsOfExperience, qualifications, bio).

3. Import and call createProfile:
     import { createProfile as createDoctorProfile } from "../../api/doctorApi";
     await createDoctorProfile(form);

4. On success, navigate("/doctor") instead of back to /auth.

Nothing outside this file needs to change. AuthPage, LoginPanel, RoleSelectPanel,
DoctorRoute, and the routing config are all already wired for the Doctor role.
==============================================================================
*/

export default function DoctorProfilePanel() {
  const navigate = useNavigate();

  const handleBackToLogin = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/auth");
  };

  return (
    <div>
      <h2 style={{ fontSize: 26, color: COLORS.primary, marginBottom: 6 }}>Almost there</h2>
      <p style={{ fontSize: 13, color: COLORS.mutedText, marginBottom: 24 }}>Step 3 of 3, doctor onboarding</p>

      <div style={{
        padding: 24,
        border: "1.5px dashed " + COLORS.border,
        borderRadius: 12,
        background: COLORS.surface,
        textAlign: "center",
        marginBottom: 20,
      }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: COLORS.primary, marginBottom: 8 }}>
          Doctor onboarding coming soon
        </div>
        <p style={{ fontSize: 13, color: COLORS.mutedText, lineHeight: 1.6 }}>
          Your account has been created. We're still finalizing the doctor profile setup. You'll be notified as soon as it's ready.
        </p>
      </div>

      <PrimaryButton color={COLORS.accent} icon={<IconArrowRight />} onClick={handleBackToLogin}>
        Back to sign in
      </PrimaryButton>
    </div>
  );
}