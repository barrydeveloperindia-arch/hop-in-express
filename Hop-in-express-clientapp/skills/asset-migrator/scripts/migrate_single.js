/**
 * MIGRATION SCRIPT
 * Downloads an external image -> Uploads to Firebase Storage -> Updates Firestore
 */
const { initializeApp } = require("firebase/app");
const { getFirestore, initializeFirestore, doc, getDoc, updateDoc } = require("firebase/firestore");
const { getStorage, ref, uploadBytesresumable, getDownloadURL, uploadBytes } = require("firebase/storage");
const fs = require('fs');
const https = require('https');

// Helper to download file to buffer
async function downloadImage(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch ${url}`);
    return await response.arrayBuffer();
}

const firebaseConfig = {
    apiKey: "AIzaSyAyzMBc68JbPs7CaysjR1n7ItyYsCPSJmQ",
    authDomain: "hop-in-express-b5883.firebaseapp.com",
    projectId: "hop-in-express-b5883",
    storageBucket: "hop-in-express-b5883.appspot.com", // Ensure this bucket exists and is public readable for now
    messagingSenderId: "188740558519",
    appId: "1:188740558519:web:db33eb0d6b90ef29aab732",
    measurementId: "G-SY6450KXL9"
};

const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, { experimentalForceLongPolling: true }, 'hopinexpress1');
const storage = getStorage(app);
const SHOP_ID = 'hop-in-express-';

const args = process.argv.slice(2);
const docId = args[0];

if (!docId) {
    console.error("❌ Please provide a Document ID.");
    process.exit(1);
}

async function migrate() {
    console.log(`📦 Migrating asset for Doc ID: ${docId}...`);

    // 1. Get current data
    const docRef = doc(db, 'shops', SHOP_ID, 'inventory', docId);
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
        console.error("❌ Document not found.");
        return;
    }

    const data = snap.data();
    const currentUrl = data.image || "";

    if (!currentUrl.startsWith("http")) {
        console.log("⚠️ No valid image URL to migrate.");
        return;
    }

    if (currentUrl.includes("firebasestorage")) {
        console.log("✅ Already hosted on Firebase Storage. Skipping.");
        return;
    }

    console.log(`   Source: ${currentUrl}`);

    try {
        // 2. Download
        console.log("   ⬇️ Downloading...");
        const buffer = await downloadImage(currentUrl);

        // 3. Upload to Storage
        console.log("   ⬆️ Uploading to Firebase Storage...");
        // Use a clean filename based on doc ID
        const fileName = `products/${docId}_${Date.now()}.jpg`;
        const storageRef = ref(storage, fileName);

        // Upload Raw Bytes
        const metadata = { contentType: 'image/jpeg' };
        await uploadBytes(storageRef, new Uint8Array(buffer), metadata);

        // 4. Get New URL
        const newUrl = await getDownloadURL(storageRef);
        console.log(`   ✨ Hosted at: ${newUrl}`);

        // 5. Update Firestore
        await updateDoc(docRef, {
            image: newUrl,
            originalUrl: currentUrl, // Keep backup just in case
            migratedAt: new Date().toISOString()
        });

        console.log("🎉 Migration Success!");
    } catch (e) {
        console.error("❌ Migration Failed:", e.message);
    }
}

migrate();
