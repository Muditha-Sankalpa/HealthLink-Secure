import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const AdminNavbar = ({ requireAuth = true, demoUser }) => {
  const navigate = useNavigate();

  const parseJwtPayload = (token) => {
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length < 2) return null;

      const base64Url = tokenParts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
      return JSON.parse(atob(padded));
    } catch {
      return null;
    }
  };

  const getUserDisplayInfo = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const payload = parseJwtPayload(token);
      if (!payload) return null;

      const getStoredUserName = () => {
        const keys = ['user', 'currentUser', 'authUser', 'profile'];
        for (const key of keys) {
          const raw = localStorage.getItem(key);
          if (!raw) continue;
          try {
            const parsed = JSON.parse(raw);
            if (parsed?.name) return parsed.name;
            if (parsed?.firstName) return parsed.firstName;
            if (parsed?.email) return parsed.email;
          } catch {
            // Ignore malformed localStorage values
          }
        }
        return '';
      };

      const rawName =
        payload.name ||
        payload.firstName ||
        payload.given_name ||
        payload.username ||
        payload.email ||
        getStoredUserName() ||
        payload.sub ||
        '';
      const firstNameFromEmail = rawName.includes('@') ? rawName.split('@')[0] : rawName;
      const firstName = (firstNameFromEmail || '').trim().split(/\s+/)[0];
      const roleCandidate =
        payload.role ||
        payload.userRole ||
        payload.user_type ||
        payload.userType ||
        payload.roles;
      const role = Array.isArray(roleCandidate) ? roleCandidate[0] : roleCandidate || '';

      if (!role) return null;
      return { firstName, role };
    } catch {
      return null;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };
  const userInfo = requireAuth
    ? getUserDisplayInfo()
    : (demoUser || { firstName: 'Admin', role: 'Admin' });

  useEffect(() => {
    if (requireAuth && !userInfo) {
      localStorage.removeItem('token');
      navigate('/login');
    }
  }, [navigate, requireAuth, userInfo]);

  if (requireAuth && !userInfo) return null;

  return (
    <aside className="w-56 min-h-screen bg-primary border-r border-secondary flex flex-col px-4 py-6 gap-2 rounded-r-2xl">
      <div className="text-surface font-semibold text-lg mb-6 px-2">Admin Dashboard</div>
      <Link to="/admin/dashboard" className="text-sm text-surface/90 px-2 py-2 rounded-lg hover:bg-secondary/20 hover:text-white hover:font-bold hover:scale-105 transition-transform transition-colors duration-150 origin-left">Patients</Link>
      <Link to="/admin/doctors" className="text-sm text-surface/90 px-2 py-2 rounded-lg hover:bg-secondary/20 hover:text-white hover:font-bold hover:scale-105 transition-transform transition-colors duration-150 origin-left">Doctors</Link>
      <Link to="/admin/appointments" className="text-sm text-surface/90 px-2 py-2 rounded-lg hover:bg-secondary/20 hover:text-white hover:font-bold hover:scale-105 transition-transform transition-colors duration-150 origin-left">Appointments</Link>
      <Link to="/allSessions" className="text-sm text-surface/90 px-2 py-2 rounded-lg hover:bg-secondary/20 hover:text-white hover:font-bold hover:scale-105 transition-transform transition-colors duration-150 origin-left">Consultations</Link>
      <div className="mt-auto flex flex-col gap-2 px-1">
        <div className="text-xs text-surface/90">
          <span className="font-semibold text-white">{userInfo.firstName || 'User'}</span> ({userInfo.role})
        </div>
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 self-start rounded-full border-2 border-danger bg-surface px-3 py-1.5 text-danger font-bold hover:scale-105 transition-transform duration-150"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-danger">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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