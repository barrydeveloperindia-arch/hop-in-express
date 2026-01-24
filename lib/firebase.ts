

/**
 * 🚨 CRITICAL CONFIGURATION 🚨
 * DO NOT CHANGE or REMOVE the 'dbId' or database connection settings without
 * EXPLICIT USER PERMISSION. Changing this will disconnect the live app from
 * the 'hopinexpress1' database and cause data loss for users.
 */
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, initializeFirestore } from "firebase/firestore";

// Replace these with your actual Firebase project config from the console
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Using getFirestore with explicit Database ID to support multi-db projects
// VITE_FIREBASE_DATABASE_ID is set to 'hopinexpress1' in .env.local
const dbId = import.meta.env.VITE_FIREBASE_DATABASE_ID || 'hopinexpress1';

console.log("[Firebase] Initializing Firestore with DB ID:", dbId);

// Force explicit initialization for the named database to avoid default fallback
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true, // Force long polling to ensure stability
}, dbId);

import { getStorage } from "firebase/storage";
export const storage = getStorage(app);
