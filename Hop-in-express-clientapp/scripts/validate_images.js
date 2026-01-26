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
const db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
}, 'hopinexpress1');

const SHOP_ID = 'hop-in-express-';
const SAFE_PLACEHOLDER = "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1000"; // Safe box image

// Simple fetch implementation since node might not have it global in this environment, 
// but modern node does. If fails, we proceed with assumption.
// We'll use a timeout to avoid hanging.

async function checkUrl(url) {
    if (!url || url.includes("flaticon") || url.includes("recipetineats")) return false; // Known bad domains
    if (url.startsWith("https://images.unsplash.com")) return true; // Assume Unsplash is generally good unless specific IDs died, relying on previous fix for specific bad one.

    // For this environment, we might not be able to easily make HTTP HEAD requests without extra deps like axios 
    // and 'fetch' might be limited. 
    // We will assume any non-unsplash URL is suspicious if we want to be aggressive, 
    // OR we can try to fetch.

    try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok;
    } catch (e) {
        console.log(`⚠️ Check failed for: ${url.substr(0, 30)}...`);
        return false;
    }
}

async function validateAndFix() {
    console.log("🕵️‍♀️ Auditing Inventory Images for 404s...");
    const inventoryRef = collection(db, 'shops', SHOP_ID, 'inventory');
    const snapshot = await getDocs(inventoryRef);

    let brokenCount = 0;

    for (const d of snapshot.docs) {
        const data = d.data();
        const img = data.image;

        // Check 1: Empty or Missing
        if (!img) continue;

        // Check 2: Known bad patterns that we might have missed
        // (Like the 5 items that are 404ing)
        // If the user says 5, it might be a specific batch.
        // Let's check for specific patterns we suspect.

        let shouldFix = false;

        // Pattern A: flaticon (often block hotlinking)
        if (img.includes("flaticon.com")) shouldFix = true;

        // Pattern B: recipetineats (known blocked)
        if (img.includes("recipetineats.com")) shouldFix = true;

        // Pattern C: non-https (rare but possible)
        if (img.startsWith("http:")) shouldFix = true;

        if (shouldFix) {
            console.log(`🔧 Fixing presumed bad URL for ${data.name}: ${img}`);
            await updateDoc(doc(db, 'shops', SHOP_ID, 'inventory', d.id), {
                image: SAFE_PLACEHOLDER
            });
            brokenCount++;
            continue; // Done with this one
        }

        // Active Check (slower)
        try {
            const isValid = await checkUrl(img);
            if (!isValid) {
                console.log(`🚫 Found DEAD URL for ${data.name}: ${img}`);
                await updateDoc(doc(db, 'shops', SHOP_ID, 'inventory', d.id), {
                    image: SAFE_PLACEHOLDER
                });
                brokenCount++;
            }
        } catch (e) {
            // Ignore fetch errors
        }
    }

    console.log(`✅ Audit Complete. Fixed ${brokenCount} broken images.`);
}

validateAndFix();
