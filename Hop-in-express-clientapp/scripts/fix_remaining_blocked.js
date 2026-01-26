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

// Map of Unsplash ID partials to Safe Pexels URLs
const REPLACEMENTS = [
    {
        id: "1574868235805", // Beef Lasagne
        safe: "https://images.pexels.com/photos/4079520/pexels-photo-4079520.jpeg?auto=compress&cs=tinysrgb&w=600",
        name: "Beef Lasagne"
    },
    {
        id: "1604908177309", // Toad in the Hole (Sausages)
        safe: "https://images.pexels.com/photos/929137/pexels-photo-929137.jpeg?auto=compress&cs=tinysrgb&w=600",
        name: "Toad in the Hole"
    },
    {
        id: "1579208575657", // Fish & Chips
        safe: "https://images.pexels.com/photos/11545620/pexels-photo-11545620.jpeg?auto=compress&cs=tinysrgb&w=600", // Fish & Chips approximation
        name: "Fish & Chips"
    }
];

async function fixBlocked() {
    console.log("🕵️‍♀️ Hunting for remaining blocked Unsplash images in Inventory...");
    const inventoryRef = collection(db, 'shops', SHOP_ID, 'inventory');
    const snapshot = await getDocs(inventoryRef);

    let fixedCount = 0;

    for (const d of snapshot.docs) {
        const data = d.data();
        const img = data.image || "";

        for (const target of REPLACEMENTS) {
            if (img.includes(target.id)) {
                console.log(`🚨 Found blocked image for item: ${data.name}`);
                console.log(`   URL: ${img}`);
                console.log(`   Fixing with Pexels: ${target.safe}`);

                await updateDoc(doc(db, 'shops', SHOP_ID, 'inventory', d.id), {
                    image: target.safe
                });

                fixedCount++;
            }
        }
    }

    if (fixedCount === 0) {
        console.log("✅ No matching blocked images found in this pass.");
    } else {
        console.log(`🎉 Successfully fixed ${fixedCount} blocked images.`);
    }
}

fixBlocked();
