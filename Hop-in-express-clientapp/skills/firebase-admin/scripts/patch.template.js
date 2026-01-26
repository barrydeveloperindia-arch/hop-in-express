/**
 * Firebase Admin - Universal Patch Template
 * Usage: node patch.template.js
 * 
 * Edit this file to define your patch logic before running.
 */
const { initializeApp } = require("firebase/app");
const { getFirestore, initializeFirestore, collection, getDocs, updateDoc, doc } = require("firebase/firestore");

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

async function runPatch() {
    console.log("🔥 Starting Patch Job...");
    const colName = 'inventory'; // CHANGE ME
    const collectionRef = collection(db, 'shops', SHOP_ID, colName);
    const snapshot = await getDocs(collectionRef);

    let patched = 0;

    for (const d of snapshot.docs) {
        const data = d.data();

        // --- PATCH LOGIC HERE ---
        // Example: if (data.price < 0) { ... }

        const shouldPatch = false;
        const updates = {};

        // ------------------------

        if (shouldPatch) {
            console.log(`Updating ${d.id}...`);
            await updateDoc(doc(db, 'shops', SHOP_ID, colName, d.id), updates);
            patched++;
        }
    }

    console.log(`✅ Patch Complete. Updated ${patched} documents.`);
}

runPatch();
