const { initializeApp } = require("firebase/app");
const { getFirestore, initializeFirestore, collection, getDocs, orderBy, query, limit } = require("firebase/firestore");

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

async function listOrders() {
    console.log("🔍 Checking 'shops/hop-in-express-/orders'...");

    try {
        const shopId = 'hop-in-express-';
        const ordersRef = collection(db, 'shops', shopId, 'orders');
        const q = query(ordersRef, orderBy('createdAt', 'desc'), limit(5));

        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            console.log("ℹ️ No orders found yet.");
            return;
        }

        console.log(`✅ Found ${snapshot.size} recent order(s):\n`);

        snapshot.forEach(doc => {
            const data = doc.data();
            const date = data.createdAt ? new Date(data.createdAt.seconds * 1000).toLocaleString() : 'Just now';

            console.log(`🧾 Order ID: ${doc.id}`);
            console.log(`   📅 Date: ${date}`);
            console.log(`   👤 Customer: ${data.customer?.name} (${data.customer?.phone})`);
            console.log(`   💰 Total: £${data.total?.toFixed(2)}`);
            console.log(`   🛒 Items:`);
            data.items?.forEach(item => {
                console.log(`      - ${item.qty}x ${item.name}`);
            });
            console.log('-----------------------------------');
        });

    } catch (e) {
        console.error("❌ Error fetching orders:", e);
    }
}

listOrders();
