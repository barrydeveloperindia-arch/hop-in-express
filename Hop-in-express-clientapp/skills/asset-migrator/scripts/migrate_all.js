/**
 * BULK MIGRATION SCRIPT
 * Scans inventory and migrates ALL external assets.
 */
const { initializeApp } = require("firebase/app");
const { getFirestore, initializeFirestore, collection, getDocs, updateDoc, doc } = require("firebase/firestore");
const { getStorage, ref, uploadBytes, getDownloadURL } = require("firebase/storage");

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
const storage = getStorage(app);
const SHOP_ID = 'hop-in-express-';

async function downloadImage(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) return null;
        return await response.arrayBuffer();
    } catch (e) {
        return null;
    }
}

async function migrateAll() {
    console.log("🚀 Starting Bulk Asset Migration...");
    const snapshot = await getDocs(collection(db, 'shops', SHOP_ID, 'inventory'));

    let processed = 0;
    let errors = 0;
    let skipped = 0;

    for (const d of snapshot.docs) {
        const data = d.data();
        const url = data.image || "";

        if (!url || url.includes("firebasestorage.googleapis.com")) {
            skipped++;
            continue;
        }

        console.log(`\nProcessing: ${data.name} (${d.id})`);

        try {
            // Download
            const buffer = await downloadImage(url);
            if (!buffer) {
                console.log("   ⚠️ Failed to download source. Skipping.");
                errors++;
                continue;
            }

            // Upload
            const fileName = `products/${d.id}.jpg`; // Simple naming for bulk
            const storageRef = ref(storage, fileName);
            await uploadBytes(storageRef, new Uint8Array(buffer), { contentType: 'image/jpeg' });

            // Get URL
            const newUrl = await getDownloadURL(storageRef);

            // Update
            await updateDoc(doc(db, 'shops', SHOP_ID, 'inventory', d.id), {
                image: newUrl,
                migratedAt: new Date().toISOString()
            });

            console.log(`   ✅ Migrated to: ${newUrl}`);
            processed++;

        } catch (e) {
            console.log(`   ❌ Error: ${e.message}`);
            errors++;
        }
    }

    console.log(`\n🏁 Job Complete.`);
    console.log(`Processed: ${processed}`);
    console.log(`Skipped (Already Hosted): ${skipped}`);
    console.log(`Errors: ${errors}`);
}

migrateAll();
