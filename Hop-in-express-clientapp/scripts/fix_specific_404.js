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

async function findBadImage() {
    console.log("🕵️‍♀️ Hunting for 'image-1768886621936-285297025.jpg'...");

    // It's likely in inventory
    const inventoryRef = collection(db, 'shops', SHOP_ID, 'inventory');
    const snapshot = await getDocs(inventoryRef);

    let found = false;
    for (const d of snapshot.docs) {
        const data = d.data();
        if (data.image && data.image.includes("1768886621936")) {
            console.log(`🚨 FOUND IT!`);
            console.log(`Item: ${data.name} (${d.id})`);
            console.log(`Current URL: ${data.image}`);

            // Fix it to a placeholder for now
            const SAFE_BOX = "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1000";
            console.log(`🛠️ Fixing with safe placeholder...`);
            await updateDoc(doc(db, 'shops', SHOP_ID, 'inventory', d.id), {
                image: SAFE_BOX
            });
            console.log("✅ Fixed.");
            found = true;
        }
    }

    if (!found) {
        console.log("❌ Could not find that specific image string in the inventory. It might be local or in another collection.");
    }
}

findBadImage();
