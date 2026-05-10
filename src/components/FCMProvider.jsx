import { useFCM } from '../hooks/useFCM';
import { useAuth } from '../context/AuthContext';

/**
 * FCMProvider
 * A render-less component that must sit INSIDE <AuthProvider>.
 * It watches the logged-in user and registers the FCM token
 * whenever a user logs in, for all three roles (Seller/Buyer/Driver).
 */
export function FCMProvider({ children }) {
  const { user } = useAuth();
  useFCM(user);
  return children;
}
