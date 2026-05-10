import { useEffect, useRef } from 'react';
import { messaging, getToken, onMessage } from '../lib/firebase';
import { apiClient } from '../lib/apiClient';

// ─────────────────────────────────────────────────────────────────
// Get your VAPID key from:
// Firebase Console → Project Settings → Cloud Messaging
// → Web Push Certificates → Key pair
// ─────────────────────────────────────────────────────────────────
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;
console.log('[FCM] VAPID KEY:', VAPID_KEY);
/**
 * Registers the FCM token with the backend once the user is logged in.
 * - Requests notification permission from the browser.
 * - Gets the FCM device token from Firebase.
 * - POSTs it to /api/v1/notification/fcm-token.
 * - Listens for foreground messages and shows a toast/alert.
 *
 * Usage: Call useFCM(user) in a top-level component (e.g. App.jsx or
 *        each dashboard root) passing the current auth user object.
 */
export function useFCM(user) {
  const registered = useRef(false);

  useEffect(() => {
    // Only run when a user is logged in and messaging is available
    if (!user || !messaging || registered.current) return;

    async function registerToken() {
      try {
        // 1. Request browser notification permission
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          console.warn('[FCM] Notification permission denied.');
          return;
        }

        // 2. Get the FCM token for this browser / device
        const fcmToken = await getToken(messaging, {
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: await navigator.serviceWorker.register(
            '/firebase-messaging-sw.js'
          ),
        });

        if (!fcmToken) {
          console.warn('[FCM] Could not retrieve token.');
          return;
        }

        console.log('[FCM] Token obtained:', fcmToken);

        // 3. Send the token to your backend
        const stored = localStorage.getItem('emporia_user');
        const authUser = stored ? JSON.parse(stored) : null;
        const token = authUser?.token || authUser?.accessToken || authUser?.access_token;

        await apiClient.request('/notification/fcm-token', {
          method: 'POST',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: { fcmToken },
        });

        registered.current = true;
        console.log('[FCM] Token successfully registered with backend.');
      } catch (err) {
        console.error('[FCM] Registration failed:', err.message);
      }
    }

    registerToken();

    // 4. Listen for foreground messages (tab is open and active)
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('[FCM] Foreground message received:', payload);

      const { title, body } = payload.notification ?? {};

      // Show a native browser notification even when tab is in focus
      if (Notification.permission === 'granted') {
        new Notification(title || 'Emporia', {
          body:  body || 'You have a new update.',
          icon:  '/favicon.ico',
        });
      }
    });

    return () => unsubscribe();
  }, [user]);
}
