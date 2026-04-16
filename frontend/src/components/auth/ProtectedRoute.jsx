import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated, getUserRole } from '../../utils/auth';

// allowedRoles is optional. If omitted, any authenticated user can access.
// If provided (e.g. ['Patient']), only those roles can access.
export default function ProtectedRoute({ children, allowedRoles }) {
  const location = useLocation();

  if (!isAuthenticated()) {
    // Not logged in, bounce to login page
    // We pass the attempted URL so login can redirect back after success
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const role = getUserRole();
    if (!allowedRoles.includes(role)) {
      // Logged in but wrong role, send them home
      return <Navigate to="/" replace />;
    }
  }

  return children;
}