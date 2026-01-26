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
const BAD_STRING = "1768886621936";
const SAFE_BOX = "https://images.pexels.com/photos/1666067/pexels-photo-1666067.jpeg?auto=compress&cs=tinysrgb&w=600"; // Safe box

async function bruteForceSearch() {
    console.log(`🕵️‍♀️ Deep Scanning ALL collections for URL containing '${BAD_STRING}'...`);

    // We'll search these likely collections
    const collectionsToCheck = ['inventory', 'recipes', 'banners', 'category_highlights', 'external_assets', 'users'];

    for (const colName of collectionsToCheck) {
        console.log(`Searching '${colName}'...`);
        const ref = collection(db, 'shops', SHOP_ID, colName);
        const snapshot = await getDocs(ref);

        for (const d of snapshot.docs) {
            const data = d.data();
            const jsonStr = JSON.stringify(data); // Brute force string search on entire object

            if (jsonStr.includes(BAD_STRING)) {
                console.log(`🚨 FOUND in [${colName}] -> Doc ID: ${d.id}`);
                console.log(`Data snippet: ${jsonStr.substr(0, 100)}...`);

                // Smart Fix
                const updates = {};

                // Check common fields
                if (data.image && data.image.includes(BAD_STRING)) updates.image = SAFE_BOX;
                if (data.imageUrl && data.imageUrl.includes(BAD_STRING)) updates.imageUrl = SAFE_BOX;
                if (data.url && data.url.includes(BAD_STRING)) updates.url = SAFE_BOX;
                if (data.icon && data.icon.includes(BAD_STRING)) updates.icon = SAFE_BOX;

                if (Object.keys(updates).length > 0) {
                    console.log(`🛠️ Fixing image field...`);
                    await updateDoc(doc(db, 'shops', SHOP_ID, colName, d.id), updates);
                    console.log("✅ Fixed.");
                } else {
                    console.log("⚠️ Found the string but couldn't identify the exact field to update automatically. Please check manually.");
                }
            }
        }
    }
    console.log("🏁 Scan complete.");
}

bruteForceSearch();
