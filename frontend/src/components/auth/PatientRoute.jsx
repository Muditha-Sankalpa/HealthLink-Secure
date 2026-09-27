// frontend/src/components/auth/PatientRoute.jsx
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getProfile as getPatientProfile } from "../../api/patientApi";

export default function PatientRoute({ children }) {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    // V09/OAuth: don't gate on localStorage token — Bearer-token users and
    // cookie/OAuth-authenticated users both hit this check, so let the API
    // call itself determine auth status instead of assuming a token exists.
    getPatientProfile()
      .then(() => setStatus("ok"))
      .catch((err) => {
        const code = err?.response?.status;
        if (code === 404) setStatus("noProfile");
        else if (code === 403) setStatus("deactivated");
        else setStatus("unauth");
      });
  }, []);

  if (status === "checking") return <div style={{ padding: 40 }}>Loading...</div>;
  if (status === "noProfile" || status === "unauth" || status === "deactivated") {
    return <Navigate to="/auth" replace />;
  }
  return children;
}