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

async function checkNano() {
    console.log("🍌 Checking Nano Banana status...");
    const snapshot = await getDocs(collection(db, 'shops', SHOP_ID, 'inventory'));

    let found = false;
    snapshot.forEach(doc => {
        const d = doc.data();
        if (d.name.toLowerCase().includes("banana")) {
            console.log(`\nfound item: ${d.name}`);
            console.log(`   ID: ${doc.id}`);
            console.log(`   Image URL: ${d.image}`);

            if (d.image && d.image.startsWith("http")) {
                console.log("   ✅ URL is valid format.");
                if (d.image.includes("pexels") || d.image.includes("wikimedia") || d.image.includes("firebasestorage")) {
                    console.log("   ✅ URL source is trusted.");
                } else {
                    console.log("   ⚠️ URL source might be external/unstable:", d.image);
                }
            } else {
                console.log("   ❌ URL is missing or invalid!");
            }
            found = true;
        }
    });

    if (!found) console.log("❌ No banana items found in inventory!");
}

checkNano();
