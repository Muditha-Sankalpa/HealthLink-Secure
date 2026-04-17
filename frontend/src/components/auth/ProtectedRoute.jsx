// frontend/src/components/auth/ProtectedRoute.jsx
import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated, getUserRole } from '../../utils/auth';
import { getProfile as getPatientProfile } from '../../api/patientApi';
import { getProfile as getDoctorProfile } from '../../api/doctorApi';

// Registry of profile-check functions by role.
// Roles not listed here (e.g. Admin) skip the profile check entirely.
const PROFILE_CHECKERS = {
  Patient: getPatientProfile,
  Doctor: getDoctorProfile,
};

export default function ProtectedRoute({ children, allowedRoles, requireProfile = true }) {
  const location = useLocation();
  const [profileStatus, setProfileStatus] = useState('checking'); // checking | ok | missing | deactivated | error

  const authed = isAuthenticated();
  const role = authed ? getUserRole() : null;
  const roleAllowed = !allowedRoles || allowedRoles.length === 0 || allowedRoles.includes(role);
  const checker = role ? PROFILE_CHECKERS[role] : null;
  const needsProfileCheck = authed && roleAllowed && requireProfile && checker;

  useEffect(() => {
    if (!needsProfileCheck) {
      setProfileStatus('ok');
      return;
    }
    let cancelled = false;
    checker()
      .then(() => { if (!cancelled) setProfileStatus('ok'); })
      .catch((err) => {
        if (cancelled) return;
        const status = err?.response?.status;
        if (status === 404 || (role === 'Doctor' && !err?.response)) {
          setProfileStatus('missing');
        } else if (status === 403) {
          setProfileStatus('deactivated');
        } else {
          setProfileStatus('error');
        }
      });
    return () => { cancelled = true; };
  }, [needsProfileCheck, role]);

  // 1. Not logged in, go to login
  if (!authed) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Wrong role, go home
  if (!roleAllowed) {
    return <Navigate to="/" replace />;
  }

  // 3. No profile check needed (Admin, or requireProfile=false)
  if (!needsProfileCheck) {
    return children;
  }

  // 4. Still checking
  if (profileStatus === 'checking') {
    return <div style={{ padding: 40 }}>Loading...</div>;
  }

  // 5. Profile missing, bounce to login which will resume the wizard
  if (profileStatus === 'missing' || profileStatus === 'deactivated' || profileStatus === 'error') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/login" replace />;
  }

  return children;
}