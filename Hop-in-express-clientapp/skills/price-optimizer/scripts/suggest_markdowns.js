/**
 * logical scanner for items that might need a discount.
 */
const { initializeApp } = require("firebase/app");
const { getFirestore, initializeFirestore, collection, getDocs } = require("firebase/firestore");

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

async function suggest() {
    console.log("💰 analyzing stock for markdowns...");
    const snapshot = await getDocs(collection(db, 'shops', SHOP_ID, 'inventory'));

    let opportunities = 0;

    snapshot.forEach(doc => {
        const d = doc.data();
        const stock = parseInt(d.stock) || 0;
        const price = parseFloat(d.price) || 0;
        const cat = d.category || "";

        // logic: fresh items with high stock need to go
        if (["fresh", "vegetables", "fruits", "bakery", "chiller"].includes(cat.toLowerCase())) {

            if (stock > 20) {
                const newPrice = (price * 0.80).toFixed(2); // 20% off
                console.log(`📉 [${cat}] ${d.name}`);
                console.log(`   Stock: ${stock} | Current: £${price}`);
                console.log(`   Suggest: £${newPrice} (SAVE 20%)`);
                opportunities++;
            }
        }
    });

    if (opportunities === 0) {
        console.log("✅ No immediate markdown candidates found.");
    } else {
        console.log(`\n💡 Found ${opportunities} markdown opportunities.`);
    }
}

suggest();
