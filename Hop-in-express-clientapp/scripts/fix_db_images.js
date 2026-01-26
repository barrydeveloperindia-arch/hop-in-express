const { initializeApp } = require("firebase/app");
const { getFirestore, initializeFirestore, collection, getDocs, updateDoc, doc, query, where } = require("firebase/firestore");

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
const BROKEN_URL = "https://images.unsplash.com/photo-1612803874987-1959b8676644?auto=format&fit=crop&w=600&q=90";
const FIXED_URL = "https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=600&auto=format&fit=crop";

async function fixBrokenImages() {
    console.log("🕵️‍♀️ Searching for broken image URLs in Firestore...");
    const inventoryRef = collection(db, 'shops', SHOP_ID, 'inventory');

    // We can't query by inequality easily without index, but we can query by equality or just fetch all
    // Since we know the exact broken URL, let's try to query for it if possible, otherwise client-side filter

    try {
        const q = query(inventoryRef, where("image", "==", BROKEN_URL));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            console.log("✅ No items found with the specific broken URL.");

            // Fallback: Check all items just in case of slight variations
            console.log("🔍 Scanning all items to be sure...");
            const allSnap = await getDocs(inventoryRef);
            let found = 0;
            for (const d of allSnap.docs) {
                const data = d.data();
                if (data.image && data.image.includes("1612803874987")) {
                    console.log(`⚠️ Found item with broken image ID: ${data.name} (${d.id})`);
                    await updateDoc(doc(db, 'shops', SHOP_ID, 'inventory', d.id), {
                        image: FIXED_URL
                    });
                    console.log(`🛠️ Fixed image for: ${data.name}`);
                    found++;
                }
            }
            if (found === 0) console.log("✅ Scan complete. Clean.");

        } else {
            console.log(`🚨 Found ${snapshot.size} items with the broken URL.`);
            for (const d of snapshot.docs) {
                console.log(`🔧 Fixing item: ${d.data().name} (${d.id})`);
                await updateDoc(doc(db, 'shops', SHOP_ID, 'inventory', d.id), {
                    image: FIXED_URL
                });
            }
            console.log("✅ Fix applied successfully.");
        }
    } catch (e) {
        console.error("❌ Error during fix:", e);
    }
}

fixBrokenImages();
