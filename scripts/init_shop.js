
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper: Load Environment Variables
function loadEnv() {
    const envPath = path.resolve(__dirname, '../.env.local');
    if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf-8');
        const env = {};
        content.split('\n').filter(l => !l.startsWith('#') && l.includes('=')).forEach(line => {
            const [k, v] = line.split('=');
            env[k.trim()] = v.trim();
        });
        return env;
    }
    return {};
}

const env = loadEnv();
const FIREBASE_CONFIG = {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID
};

const USER_ID = env.VITE_USER_ID;

async function initShop() {
    if (!USER_ID) {
        console.error("❌ CRTICAL: VITE_USER_ID missing in .env.local");
        process.exit(1);
    }

    console.log(`🚀 Initializing Shop Database for ID: ${USER_ID}`);
    const app = initializeApp(FIREBASE_CONFIG);
    const db = getFirestore(app);

    const shopRef = doc(db, 'shops', USER_ID);

    try {
        const snap = await getDoc(shopRef);
        if (snap.exists()) {
            console.log("✅ Shop Record already exists.");
        } else {
            console.log("⚠️ Shop Record not found. Creating new...");
            await setDoc(shopRef, {
                name: "Hop-in Express",
                owner: "Salil Anand",
                address: "37 High St, Eastleigh SO50 5LG, United Kingdom",
                contact: "+44 7453 313017",
                currency: "GBP",
                taxRate: 20,
                createdAt: new Date().toISOString()
            });
            console.log("✅ Shop Initialized Successfully!");
        }
    } catch (error) {
        console.error("❌ Initialization Failed:", error);
        console.log("\nTROUBLESHOOTING:");
        console.log("1. Check your Firestore Security Rules (allow read, write: if true; for testing)");
        console.log("2. Ensure your Firebase Project ID is correct in .env.local");
    }

    process.exit(0);
}

initShop();
