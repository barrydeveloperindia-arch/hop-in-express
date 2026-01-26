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
const db = initializeFirestore(app, { experimentalForceLongPolling: true }, 'hopinexpress1');
const SHOP_ID = 'hop-in-express-';

async function polish() {
    console.log("✨ Applying Blinkit-Style Polish...");
    const inventoryRef = collection(db, 'shops', SHOP_ID, 'inventory');

    // 1. Thums Up (Search Optimization)
    // Keywords: thums up, cola, soda, fizzy, indian
    const q1 = query(inventoryRef, where("name", ">=", "Thums"), where("name", "<=", "Thums\uf8ff"));
    const snap1 = await getDocs(q1);

    snap1.forEach(async (d) => {
        if (d.data().name.includes("Thums Up")) {
            console.log(`🔹 Enhancing Tags for: ${d.data().name}`);
            const newTags = ["thums up", "cola", "soda", "drink", "soft drink", "fizzy", "pop", "beverage"];
            await updateDoc(doc(db, 'shops', SHOP_ID, 'inventory', d.id), {
                tags: newTags
            });
            console.log("   ✅ Tags updated.");
        }
    });

    // 2. Nano Banana (Content Copywriting)
    // Description: Farm-fresh Organic Nano Banana, harvested at peak ripeness for maximum flavor and crunch.
    const q2 = query(inventoryRef, where("name", ">=", "Nano"), where("name", "<=", "Nano\uf8ff"));
    const snap2 = await getDocs(q2);

    snap2.forEach(async (d) => {
        if (d.data().name.includes("Nano Banana")) {
            console.log(`🔹 Enhancing Copy for: ${d.data().name}`);
            const premiumDesc = "Farm-fresh Organic Nano Banana, harvested at peak ripeness for maximum flavor and crunch. Perfect for a healthy snack.";
            await updateDoc(doc(db, 'shops', SHOP_ID, 'inventory', d.id), {
                description: premiumDesc,
                // Ensure tags are good too
                tags: ["banana", "fruit", "fresh", "organic", "healthy", "snack", "potassium"]
            });
            console.log("   ✅ Description updated.");
        }
    });

    // 3. Generic Polish (Any item with short description)
    // We can do a quick pass for "missing description" items if you want, 
    // but for now let's stick to the requested 2 examples to be fast.
}

polish();
