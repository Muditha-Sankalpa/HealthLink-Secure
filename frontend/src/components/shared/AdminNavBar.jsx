import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// ---------------------------------------------------------------------------
// Helpers (module-level, no re-creation on every render)
// ---------------------------------------------------------------------------

const parseJwtPayload = (token) => {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
};

const getStoredUserName = () => {
  const keys = ['user', 'currentUser', 'authUser', 'profile'];
  for (const key of keys) {
    try {
      const parsed = JSON.parse(localStorage.getItem(key) || '');
      if (parsed?.name) return parsed.name;
      if (parsed?.firstName) return parsed.firstName;
      if (parsed?.email) return parsed.email;
    } catch {
      // ignore
    }
  }
  return '';
};

/**
 * Attempts to extract a display name and role from a JWT.
 * Returns safe fallbacks - never null - so missing claims
 * never trigger a redirect.
 */
const extractDisplayInfo = (token) => {
  const payload = parseJwtPayload(token);

  if (!payload) {
    return { firstName: 'User', role: 'User' };
  }

  const rawName =
    payload.name ||
    payload.firstName ||
    payload.given_name ||
    payload.username ||
    payload.email ||
    getStoredUserName() ||
    payload.sub ||
    '';

  const nameBase = rawName.includes('@') ? rawName.split('@')[0] : rawName;
  const firstName = (nameBase.trim().split(/\s+/)[0]) || 'User';

  const roleCandidate =
    payload.role ||
    payload.userRole ||
    payload.user_type ||
    payload.userType ||
    payload.roles ||
    payload.authority ||
    payload.userGroup ||
    '';

  const role = (Array.isArray(roleCandidate) ? roleCandidate[0] : roleCandidate) || 'User';

  return { firstName, role };
};

/**
 * Synchronous auth check.
 *
 * isAuthenticated is based ONLY on whether a token exists in localStorage.
 * JWT parseability is used only for display info and never gates auth.
 */
const resolveAuthInfo = (requireAuth, demoUser) => {
  if (!requireAuth) {
    return {
      isAuthenticated: true,
      ...(demoUser || { firstName: 'Admin', role: 'Admin' }),
    };
  }

  const token = localStorage.getItem('token');

  if (!token) {
    return { isAuthenticated: false, firstName: '', role: '' };
  }

  // Token present = authenticated. Display info is best-effort only.
  const { firstName, role } = extractDisplayInfo(token);
  return { isAuthenticated: true, firstName, role };
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const AdminNavbar = ({ requireAuth = false, demoUser }) => {
  const navigate = useNavigate();

  /**
   * useState lazy initialiser runs ONCE, synchronously, before the first
   * paint. This means the `return null` guard below fires on the very first
   * render with no flicker - the sidebar is never painted for
   * unauthenticated users.
   */
  const [userInfo] = useState(() => resolveAuthInfo(requireAuth, demoUser));

  useEffect(() => {
    if (requireAuth && !userInfo.isAuthenticated) {
      navigate('/login');
    }
    // Intentionally empty dep array: only run on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Guard renders null on first paint for unauthed users, preventing flicker.
  if (requireAuth && !userInfo.isAuthenticated) return null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <aside className="w-56 min-h-screen bg-primary border-r border-secondary flex flex-col px-4 py-6 gap-2 rounded-r-2xl">
      <div className="text-surface font-semibold text-lg mb-6 px-2">Admin Dashboard</div>

      <Link
        to="/admin/dashboard"
        className="text-sm text-surface/90 px-2 py-2 rounded-lg hover:bg-secondary/20 hover:text-white hover:font-bold hover:scale-105 transition-transform transition-colors duration-150 origin-left"
      >
        Patients
      </Link>
      <Link
        to="/admin/doctors"
        className="text-sm text-surface/90 px-2 py-2 rounded-lg hover:bg-secondary/20 hover:text-white hover:font-bold hover:scale-105 transition-transform transition-colors duration-150 origin-left"
      >
        Doctors
      </Link>
      <Link
        to="/admin/appointments"
        className="text-sm text-surface/90 px-2 py-2 rounded-lg hover:bg-secondary/20 hover:text-white hover:font-bold hover:scale-105 transition-transform transition-colors duration-150 origin-left"
      >
        Appointments
      </Link>
      <Link
        to="/admin/consultations"
        className="text-sm text-surface/90 px-2 py-2 rounded-lg hover:bg-secondary/20 hover:text-white hover:font-bold hover:scale-105 transition-transform transition-colors duration-150 origin-left"
      >
        Consultations
      </Link>

      <div className="mt-auto flex flex-col gap-2 px-1">
        <div className="text-xs text-surface/90">
          <span className="font-semibold text-white">{userInfo.firstName}</span>{' '}
          ({userInfo.role})
        </div>
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 self-start rounded-full border-2 border-danger bg-surface px-3 py-1.5 text-danger font-bold hover:scale-105 transition-transform duration-150"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-danger">
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M10 17l5-5-5-5" />
              <path d="M15 12H3" />
              <path d="M21 4v16a1 1 0 0 1-1 1h-8" />
            </svg>
          </span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminNavbar;