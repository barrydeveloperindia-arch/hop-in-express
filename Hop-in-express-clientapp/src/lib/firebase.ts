import { initializeApp } from "firebase/app";
import { getFirestore, initializeFirestore } from "firebase/firestore";

// Config from your workspace .env.local
const firebaseConfig = {
    apiKey: "AIzaSyAyzMBc68JbPs7CaysjR1n7ItyYsCPSJmQ",
    authDomain: "hop-in-express-b5883.firebaseapp.com",
    projectId: "hop-in-express-b5883",
    storageBucket: "hop-in-express-b5883.appspot.com",
    messagingSenderId: "188740558519",
    appId: "1:188740558519:web:db33eb0d6b90ef29aab732",
    measurementId: "G-SY6450KXL9"
};

export const app = initializeApp(firebaseConfig);

// DATABASE ID: 'hopinexpress1' (Critical for your setup)
export const db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
}, 'hopinexpress1');

console.log("🔥 Firebase Client Initialized (DB: hopinexpress1)");
