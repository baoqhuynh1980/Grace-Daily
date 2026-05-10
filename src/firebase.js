import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
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
export const auth = getAuth(app);
export const db = getFirestore(app);
export const messaging = getMessaging(app);

export const requestNotificationPermission = async () => {
  try {
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
