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
  apiKey: "AIzaSyBhh6XGVnoDSGSf2QlbQGq97VVfx8wWWCs",
  authDomain: "emporia-web.firebaseapp.com",
  projectId: "emporia-web",
  storageBucket: "emporia-web.firebasestorage.app",
  messagingSenderId: "871729126742",
  appId: "1:871729126742:web:f251083d67a9ec22c3caf7"
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
