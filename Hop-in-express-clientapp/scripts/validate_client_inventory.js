const { initializeApp } = require("firebase/app");
const { getFirestore, initializeFirestore, collection, getDocs } = require("firebase/firestore");

// Config from src/lib/firebase.ts
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

async function validateInventory() {
    console.log("🔍 Starting Client App Inventory Check...");
    console.log("========================================");

    try {
        const shopId = 'hop-in-express-';
        const colRef = collection(db, 'shops', shopId, 'inventory');
        const snapshot = await getDocs(colRef);

        const total = snapshot.size;
        console.log(`📦 Total Items Found in DB: ${total}`);

        let validCount = 0;
        let missingImage = 0;
        let zeroPrice = 0;
        let missingName = 0;

        const samples = [];

        snapshot.forEach(doc => {
            const data = doc.data();
            let isValid = true;

            if (!data.name) {
                missingName++;
                isValid = false;
            }
            if (!data.price && data.price !== 0) {
                // strict check, but price might be 0? usually not for sales
                isValid = false;
            }
            if (parseFloat(data.price) === 0) {
                zeroPrice++;
                // isValid = false; // Maybe free items exist? warning only
            }
            // The field in DB is 'imageUrl', but app expects 'image' (which we map in firestore.ts)
            // Checking raw DB data here:
            if (!data.image && !data.imageUrl) {
                missingImage++;
                // isValid = false; // UI handles placeholders
            }

            if (isValid) validCount++;

            // Grab a few disparate samples
            if (samples.length < 5 && (data.image || data.imageUrl) && data.price > 0) {
                samples.push({ id: doc.id, ...data });
            }
        });

        console.log(`\n📊 Health Report:`);
        console.log(`   ✅ UI Ready Items: ${validCount} / ${total}`);
        console.log(`   ⚠️ Items with Price £0.00: ${zeroPrice}`);
        console.log(`   🖼️ Items missing Images: ${missingImage}`);
        console.log(`   ❌ Items missing Name: ${missingName}`);

        console.log(`\n✨ Sample "Ready" Items (Client View):`);
        samples.forEach(item => {
            console.log(`   - [${item.name}] @ £${item.price} (${item.stock} in stock)`);
            console.log(`     Img: ${item.image.substring(0, 40)}...`);
        });

    } catch (e) {
        console.error("❌ Validation Failed:", e);
    }
}

validateInventory();
