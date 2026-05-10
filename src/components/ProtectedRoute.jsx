import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Wraps a route so only authenticated users with the correct role can access it.
 * @param {string} requiredRole - if provided, user.role must match this value
 * @param {string} redirectTo   - where to send unauthenticated users (default: "/")
 */
export function ProtectedRoute({ children, requiredRole, redirectTo = '/get-started' }) {
  const { user } = useAuth();

  if (!user) {
    console.log(`[ProtectedRoute] No user found, redirecting to ${redirectTo}`);
    return <Navigate to={redirectTo} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    console.log(`[ProtectedRoute] Role mismatch: expected ${requiredRole}, got ${user.role}. Redirecting to ${redirectTo}`);
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}
