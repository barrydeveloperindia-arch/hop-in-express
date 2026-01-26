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

// The broken URL found in the 404 screenshot
const BROKEN_PEXELS_URL = "https://images.pexels.com/photos/11545620/pexels-photo-11545620.jpeg?auto=compress&cs=tinysrgb&w=600";

// A verified Wikimedia Commons URL for Fish and Chips (File:Fish_and_chips_blackpool.jpg)
const WORKING_URL = "https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Fish_and_chips_blackpool.jpg/640px-Fish_and_chips_blackpool.jpg";

async function fixSpecific404() {
    console.log("🕵️‍♀️ Hunting for the broken Fish & Chips Pexels URL...");

    // We scan inventory again for this specific string
    const inventoryRef = collection(db, 'shops', SHOP_ID, 'inventory');
    const snapshot = await getDocs(inventoryRef);

    let found = false;
    for (const d of snapshot.docs) {
        const data = d.data();
        if (data.image === BROKEN_PEXELS_URL || (data.image && data.image.includes("11545620"))) {
            console.log(`🚨 FOUND broken item: ${data.name} (${d.id})`);
            console.log(`   Replacing with Wikimedia: ${WORKING_URL}`);

            await updateDoc(doc(db, 'shops', SHOP_ID, 'inventory', d.id), {
                image: WORKING_URL
            });
            console.log("✅ Fixed.");
            found = true;
        }
    }

    if (!found) {
        console.log("❌ Could not find exact match. It might have been cached or already changed.");
    }
}

fixSpecific404();
