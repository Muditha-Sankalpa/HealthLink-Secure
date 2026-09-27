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
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('user', JSON.stringify(user));
        navigate(DASHBOARD_ROUTES[user.role] || '/', { replace: true });
      })
      .catch(() => setError('Google sign-in failed. Please try again.'));
  }, [navigate]);

  const containerStyle = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'system-ui, sans-serif',
    background: '#f8f9fb',
  };

  if (error) {
    return (
      <div style={containerStyle}>
        <p style={{ color: '#dc2626', fontSize: 16, fontWeight: 700 }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div
        style={{
          width: 40,
          height: 40,
          border: '4px solid #dbeafe',
          borderTopColor: '#2563eb',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          marginBottom: 16,
        }}
      />
      <p style={{ color: '#1d4ed8', fontSize: 17, fontWeight: 700 }}>Signing you in…</p>
      {/* <p style={{ color: '#2563eb', fontSize: 13, fontWeight: 700, marginTop: 4 }}>Loading</p> */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}