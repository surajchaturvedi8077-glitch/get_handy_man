/**
 * ProtectedRoute.jsx
 * ------------------------------------------------------------------
 * Wrap any route element with this to require login; redirects to
 * /login (preserving the intended destination) if not authenticated.
 * Usage: <Route path="/jobs" element={<ProtectedRoute><JobsPage/></ProtectedRoute>} />
 * ------------------------------------------------------------------
 */
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth.js';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}
