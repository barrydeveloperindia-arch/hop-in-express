// src/config/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// REPLACE WITH YOUR FIREBASE CONFIG
const firebaseConfig = {
    apiKey: "AIzaSyD-YOUR-API-KEY",
    authDomain: "hop-in-express.firebaseapp.com",
    projectId: "hop-in-express",
    storageBucket: "hop-in-express.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
};

let app;
let auth;

if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    // Initialize Auth (Default)
    auth = initializeAuth(app);
} else {
    app = getApp();
    auth = getAuth(app);
}

export const db = getFirestore(app);
export { auth };
