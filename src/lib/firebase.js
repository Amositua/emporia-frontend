import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// ─────────────────────────────────────────────────────────────────
// Replace these values with your actual Firebase project config.
// Go to: https://console.firebase.google.com
// → Your project → Project Settings → General → Your apps → Web app
// ─────────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialise Firebase
const app = initializeApp(firebaseConfig);

// Get the messaging instance (only works in supported browsers)
let messaging = null;
try {
  messaging = getMessaging(app);
} catch (err) {
  console.warn('[FCM] Messaging not supported in this browser:', err.message);
}

export { messaging, getToken, onMessage };
