importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAC1FNAbsxIKutQrS528g8z5XsGgGvXpqM",
  authDomain: "grace-daily-6f520.firebaseapp.com",
  projectId: "grace-daily-6f520",
  storageBucket: "grace-daily-6f520.firebasestorage.app",
  messagingSenderId: "657047930577",
  appId: "1:657047930577:web:dbddea717984800a5fa7f0",
  measurementId: "G-E7YMXTMLH7"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(payload => {
  const { title, body } = payload.notification;
  self.registration.showNotification(title, {
    body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    vibrate: [200, 100, 200],
  });
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/'));
});
