// ─────────────────────────────────────────────────────────────────
// Firebase Cloud Messaging Service Worker
//
// This file MUST live at /public/firebase-messaging-sw.js
// It handles push notifications when the app is in the BACKGROUND
// or the browser tab is closed.
//
// Replace the firebaseConfig values with your own from the Firebase
// console, or use hardcoded strings here (env vars don't work in SW).
// ─────────────────────────────────────────────────────────────────

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyDWYNKDdo0u16p-jPfkmUqX_kNgaamScjo",
  authDomain: "emporia-fac5f.firebaseapp.com",
  projectId: "emporia-fac5f",
  storageBucket: "emporia-fac5f.firebasestorage.app",
  messagingSenderId: "663280977524",
  appId: "1:663280977524:web:735c0692de9762c7773321",
  measurementId: "G-TRJQQYCWZF"
});

const messaging = firebase.messaging();

// Show a notification when a message is received in the background
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Background message:', payload);

  const { title, body, icon } = payload.notification ?? {};

  self.registration.showNotification(title || 'Emporia Notification', {
    body:  body  || 'You have a new notification.',
    icon:  icon  || '/favicon.ico',
    badge: '/favicon.ico',
    data:  payload.data,
  });
});
