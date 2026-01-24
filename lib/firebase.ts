
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
export const db = getFirestore(app, dbId);
// Note: experimentalForceLongPolling disabled to let CapacitorHttp handle connection

import { getStorage } from "firebase/storage";
export const storage = getStorage(app);
