// frontend/src/components/auth/DoctorRoute.jsx
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getProfile as getDoctorProfile } from "../../api/doctorApi";

export default function DoctorRoute({ children }) {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { setStatus("unauth"); return; }

    getDoctorProfile()
      .then(() => setStatus("ok"))
      .catch((err) => {
        const code = err?.response?.status;
        if (code === 404 || !err?.response) setStatus("noProfile");
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