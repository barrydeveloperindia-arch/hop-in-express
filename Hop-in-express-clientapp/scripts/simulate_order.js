const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');

// Minimal Firebase Config (Hardcoded for this script)
const firebaseConfig = {
    // Assuming use from existing app config or public demo logic
    // Normally we'd load from .env, but for a quick script we'll fetch from project
    projectId: "hopinexpress1"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const SHOP_ID = 'hop-in-express-';

async function placeTestOrder() {
    console.log("🚀 Placing Test Order...");

    try {
        const orderData = {
            items: [
                { id: '1', name: 'Test Banana', qty: 2, effectivePrice: 0.50 },
                { id: '2', name: 'Test Milk', qty: 1, effectivePrice: 1.20 }
            ],
            subtotal: 2.20,
            deliveryFee: 0.00,
            total: 2.20,
            status: 'pending', // lowercase match
            customer: {
                name: 'Script Bot',
                phone: '+447000000000',
                address: '123 Script Lane'
            },
            createdAt: serverTimestamp(),
            shopId: SHOP_ID
        };

        const ordersRef = collection(db, 'shops', SHOP_ID, 'orders');
        const docRef = await addDoc(ordersRef, orderData);

        console.log("✅ Order Placed Successfully!");
        console.log("🆔 Order ID:", docRef.id);
        console.log("👀 Check Staff Dashboard now.");
    } catch (e) {
        console.error("❌ Failed to place order:", e);
    }
}

placeTestOrder();
