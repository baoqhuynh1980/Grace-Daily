import { initializeApp } from "firebase/app";
import { initializeAuth, indexedDBLocalPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAC1FNAbsxIKutQrS528g8z5XsGgGvXpqM",
  authDomain: "grace-daily-6f520.firebaseapp.com",
  projectId: "grace-daily-6f520",
  storageBucket: "grace-daily-6f520.firebasestorage.app",
  messagingSenderId: "657047930577",
  appId: "1:657047930577:web:dbddea717984800a5fa7f0",
  measurementId: "G-E7YMXTMLH7"
};

const app = initializeApp(firebaseConfig);

// Set up sign-in the lean way. initializeAuth (instead of getAuth) skips the
// hidden popup/redirect connection that hangs inside the native app and was
// freezing the app on "Loading...". Email/password sign-in needs none of that,
// and this works the same in the web browser too.
export const auth = initializeAuth(app, {
  persistence: [indexedDBLocalPersistence, browserLocalPersistence]
});

export const db = getFirestore(app);

// Firebase Cloud Messaging uses service workers, which only exist in a real
// web browser (your Safari / PWA version). The native iOS app has no service
// worker, so we only set messaging up when it's actually available. On native
// it stays null and push notifications are simply skipped.
let messaging = null;
try {
  if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
    messaging = getMessaging(app);
  }
} catch (err) {
  messaging = null;
}
export { messaging };

export const requestNotificationPermission = async () => {
  try {
    if (!messaging) return null;
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey: "BJUY99x7fObzUKUpv5CfGqhp7G9lUIgNMRB3r_Lg-hQ5Zr5FYEbtfKonjURcez_udkQfTuS22peQS51njZ3X6sk"
      });
      return token;
    }
    return null;
  } catch (err) {
    console.error("Notification permission error:", err);
    return null;
  }
};

export { onMessage };
