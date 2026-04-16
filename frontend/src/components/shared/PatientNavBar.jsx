import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

// ---------------------------------------------------------------------------
// Helpers
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

const extractDisplayInfo = (token) => {
  const payload = parseJwtPayload(token);
  if (!payload) return { firstName: 'User', role: 'User' };

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

const resolveAuthInfo = (requireAuth, demoUser) => {
  if (!requireAuth) {
    return { isAuthenticated: true, ...(demoUser || { firstName: 'Patient', role: 'Patient' }) };
  }
  const token = localStorage.getItem('token');
  if (!token) return { isAuthenticated: false, firstName: '', role: '' };
  const { firstName, role } = extractDisplayInfo(token);
  return { isAuthenticated: true, firstName, role };
};

// ---------------------------------------------------------------------------
// Nav links config
// ---------------------------------------------------------------------------

const NAV_LINKS = [
  { label: 'Home',          to: '/' },
  { label: 'Dashboard',     to: '/patient' },
  { label: 'Appointments',  to: '/patient/appointments' },
  { label: 'Consultations', to: '/patient/upload-report' },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const PatientNavbar = ({ requireAuth = true, demoUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userInfo] = useState(() => resolveAuthInfo(requireAuth, demoUser));

  useEffect(() => {
    if (requireAuth && !userInfo.isAuthenticated) {
      navigate('/login');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (requireAuth && !userInfo.isAuthenticated) return null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <aside className="w-56 min-h-screen bg-primary border-r border-secondary flex flex-col px-4 py-6 gap-2 rounded-r-2xl">

      {/* Brand heading */}
      <div className="px-2 mb-6">
        <div className="text-white font-bold text-xl" style={{ fontFamily: "'DM Serif Display', serif", letterSpacing: '-0.3px' }}>
          HealthLink
        </div>
        <div className="text-surface/60 text-xs mt-0.5" style={{ letterSpacing: '0.3px' }}>
          Patient Dashboard
        </div>
      </div>

      {/* Nav links */}
      {NAV_LINKS.map(({ label, to }) => {
        const isActive = location.pathname === to;
        return (
          <Link
            key={to}
            to={to}
            style={isActive ? {
              backgroundColor: 'rgba(0,168,150,0.18)',
              color: '#00c9b1',
              fontWeight: 700,
              borderLeft: '3px solid #00c9b1',
              paddingLeft: '5px',
            } : {}}
            className={`text-sm px-2 py-2 rounded-lg transition-transform transition-colors duration-150 origin-left
              ${isActive
                ? ''
                : 'text-surface/90 hover:bg-secondary/20 hover:text-white hover:font-bold hover:scale-105'
              }`}
          >
            {label}
          </Link>
        );
      })}

      {/* Footer: user info + logout */}
      <div className="mt-auto flex flex-col gap-3 px-1">
        <div className="text-xs text-surface/70 text-center">
          <span className="font-semibold text-white">{userInfo.firstName}</span>
        </div>
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '10px 0',
            borderRadius: 12,
            border: '2px solid rgba(255,255,255,0.35)',
            background: 'transparent',
            color: '#fff',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif",
            letterSpacing: '0.2px',
            transition: 'border-color 0.2s, background 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.7)';
            e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          Logout
        </button>
      </div>
    </aside>
  );
};

export default PatientNavbar;