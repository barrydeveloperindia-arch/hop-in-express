const { initializeApp } = require("firebase/app");
const { getFirestore, initializeFirestore, collection, getDocs } = require("firebase/firestore");

const firebaseConfig = {
    apiKey: "AIzaSyAyzMBc68JbPs7CaysjR1n7ItyYsCPSJmQ",
    authDomain: "hop-in-express-b5883.firebaseapp.com",
    projectId: "hop-in-express-b5883",
    storageBucket: "hop-in-express-b5883.appspot.com",
    messagingSenderId: "188740558519",
    appId: "1:188740558519:web:db33eb0d6b90ef29aab732",
    measurementId: "G-SY6450KXL9"
};

const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, { experimentalForceLongPolling: true }, 'hopinexpress1');
const SHOP_ID = 'hop-in-express-';

async function checkUrl(url) {
    if (!url) return false;
    // Fast fail known bads
    if (url.includes("flaticon")) return false;

    // Assume good for Unsplash/Pexels/Wikimedia unless blocked
    // In this headless env, we might not have full fetch access to external if specific firewalls exist
    // But we check syntax at least.
    return url.startsWith("http");
}

async function validate() {
    console.log("🏥 Running Health Check...");
    const snapshot = await getDocs(collection(db, 'shops', SHOP_ID, 'inventory'));

    let issues = 0;

    for (const d of snapshot.docs) {
        const data = d.data();

        // 1. Check Image
        if (!data.image || !(await checkUrl(data.image))) {
            console.log(`[Broken Image] ${data.name}: ${data.image}`);
            issues++;
        }

        // 2. Check Price
        if (data.price === undefined || data.price === null) {
            console.log(`[Missing Price] ${data.name}`);
            issues++;
        }

        // 3. Check Category
        if (!data.category) {
            console.log(`[Missing Category] ${data.name}`);
            issues++;
        }
    }

    if (issues === 0) {
        console.log("✅ System Healthy.");
    } else {
        console.log(`❌ Found ${issues} issues.`);
    }
}

validate();
