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

async function analyze() {
    console.log("📊 Analyzing Inventory...");
    const snapshot = await getDocs(collection(db, 'shops', SHOP_ID, 'inventory'));

    let totalItems = 0;
    let totalValue = 0;
    let lowStock = 0;
    const categories = {};

    snapshot.forEach(doc => {
        const d = doc.data();
        totalItems++;

        const price = parseFloat(d.price) || 0;
        const stock = parseInt(d.stock) || 0;

        totalValue += (price * stock);

        if (stock < 5) lowStock++;

        const cat = d.category || "Uncategorized";
        categories[cat] = (categories[cat] || 0) + 1;
    });

    console.log(`\n--- REPORT ---`);
    console.log(`Total SKU Count: ${totalItems}`);
    console.log(`Total Inventory Value: £${totalValue.toFixed(2)}`);
    console.log(`Low Stock Items (<5): ${lowStock}`);

    console.log(`\n--- CATEGORIES ---`);
    Object.keys(categories).sort().forEach(c => {
        console.log(`${c}: ${categories[c]}`);
    });
    console.log(`--------------\n`);
}

analyze();
