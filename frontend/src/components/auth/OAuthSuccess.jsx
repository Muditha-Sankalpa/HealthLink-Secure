import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DASHBOARD_ROUTES = { Patient: '/patient', Doctor: '/doctor/profile', Admin: '/admin/dashboard' };

export default function OAuthSuccess() {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/api/auth/me', { credentials: 'include' })
      .then((res) => {
        if (!res.ok) throw new Error('Not authenticated');
        return res.json();
      })
      .then((user) => {
        // /auth/me confirms identity via the httpOnly cookie set by
        // auth-service's OAuth callback. Store the non-sensitive display
        // info the rest of the app expects (matches utils/auth.js's
        // existing getUser()/getUserRole() pattern).
        localStorage.setItem('user', JSON.stringify(user));
        // Note: no JWT is stored here (httpOnly cookie only) — route guards
        // (ProtectedRoute.jsx) currently key off localStorage's 'token' key
        // for Bearer-header services, which OAuth users won't have. This is
        // a known limitation flagged for the team, not something to fix here.
        navigate(DASHBOARD_ROUTES[user.role] || '/', { replace: true });
      })
      .catch(() => setError('Google sign-in failed. Please try again.'));
  }, [navigate]);

  if (error) return <div style={{ padding: 40 }}>{error}</div>;
  return <div style={{ padding: 40 }}>Signing you in…</div>;
}