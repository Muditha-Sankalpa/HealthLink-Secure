import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const DoctorNavBar = ({ requireAuth = true, demoUser }) => {
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
      
      const rawName = payload.name || payload.firstName || payload.email || '';
      const firstName = (rawName || '').trim().split(/\s+/)[0];
      const role = payload.role || '';
      
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

  const userInfo = requireAuth ? getUserDisplayInfo() : (demoUser || { firstName: 'Doctor', role: 'Doctor' });

  useEffect(() => {
    if (requireAuth && !userInfo) {
      localStorage.removeItem('token');
      navigate('/login');
    }
  }, [navigate, requireAuth, userInfo]);

  if (requireAuth && !userInfo) return null;

  return (
    <aside className="w-56 min-h-screen bg-[#122056] border-r border-gray-200 flex flex-col px-4 py-6 gap-2 rounded-r-2xl shadow-lg">
      <div className="text-white font-semibold text-lg mb-6 px-2 italic">Doctor Portal</div>
      
      <Link to="/doctor/profile" className="text-sm text-white/90 px-2 py-2 rounded-lg hover:bg-white/10 hover:text-white hover:font-bold transition-all">
        Profile
      </Link>
      <Link to="/doctor/appointments" className="text-sm text-white/90 px-2 py-2 rounded-lg hover:bg-white/10 hover:text-white hover:font-bold transition-all">
        Appointments
      </Link>
      <Link to="/doctor/prescriptions" className="text-sm text-white/90 px-2 py-2 rounded-lg hover:bg-white/10 hover:text-white hover:font-bold transition-all">
        Prescriptions
      </Link>
      <Link to="/doctor/telemedicine" className="text-sm text-white/90 px-2 py-2 rounded-lg hover:bg-white/10 hover:text-white hover:font-bold transition-all">
        Telemedicine
      </Link>
      <Link to="/doctor/availability" className="text-sm text-white/90 px-2 py-2 rounded-lg hover:bg-white/10 hover:text-white hover:font-bold transition-all">
        Availability
      </Link>
      
      <div className="mt-auto flex flex-col gap-2 px-1">
        <div className="text-xs text-white/80">
          <span className="font-semibold text-white">{userInfo.firstName || 'User'}</span> ({userInfo.role})
        </div>
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 self-start rounded-full border-2 border-red-400 bg-white/10 px-3 py-1.5 text-red-100 font-bold hover:bg-red-500 hover:border-red-500 hover:text-white transition-all"
        >
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default DoctorNavBar;