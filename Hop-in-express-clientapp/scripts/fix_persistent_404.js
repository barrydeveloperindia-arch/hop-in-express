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

// The culprit URL
const BAD_URL_PART = "1544126566";
const FALLBACK_IMAGE = "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"; // Generic healthy food

async function huntAndKill() {
    console.log(`🕵️‍♀️ Hunting for image containing '${BAD_URL_PART}'...`);

    const snapshot = await getDocs(collection(db, 'shops', SHOP_ID, 'inventory'));
    let found = false;

    for (const d of snapshot.docs) {
        const data = d.data();
        const url = data.image || "";

        if (url.includes(BAD_URL_PART)) {
            console.log(`🚨 FOUND IT! Item: ${data.name} (${d.id})`);
            console.log(`   URL: ${url}`);

            // Try to fix it properly by migrating
            try {
                // If it failed before, maybe we just swap it to a safe Pexels image now to be 100% sure
                console.log("   🛠️ Fixing with safe Pexels image (Authentication agnostic)...");

                await updateDoc(doc(db, 'shops', SHOP_ID, 'inventory', d.id), {
                    image: FALLBACK_IMAGE,
                    previous_broken_url: url
                });
                console.log("   ✅ Fixed.");
                found = true;
            } catch (e) {
                console.error("   ❌ Failed to update:", e);
            }
        }
    }

    if (!found) {
        console.log("❌ Could not find this URL in the active 'inventory' collection.");
        console.log("   It might be in 'recipes', 'banners', or hardcoded in the app.");
    }
}

huntAndKill();
