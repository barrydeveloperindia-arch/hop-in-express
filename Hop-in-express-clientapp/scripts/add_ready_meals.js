const { initializeApp } = require("firebase/app");
const { getFirestore, initializeFirestore, collection, addDoc } = require("firebase/firestore");

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

const SHOP_ID = 'hop-in-express-'; // Default single store

const NEW_ITEMS = [
    {
        name: "Classic Shepherd's Pie (400g)",
        price: 4.50,
        memberPrice: 3.99,
        category: "Chiller",
        brand: "Hop-In Kitchen",
        stock: 15,
        image: "https://images.unsplash.com/photo-1627449275066-613d7bcce856?auto=format&fit=crop&w=600&q=90",
        description: "Traditional lamb mince with fluffy mash potato topping."
    },
    {
        name: "Cottage Pie Family Size",
        price: 6.00,
        memberPrice: 5.50,
        category: "Chiller",
        brand: "Hop-In Kitchen",
        stock: 10,
        image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?q=80&w=600&auto=format&fit=crop", // Replaced broken URL
        description: "Minced beef in gravy topped with crispy cheese mash."
    },
    {
        name: "Chicken Tikka Masala & Rice",
        price: 4.25,
        category: "Chiller",
        brand: "Curry House",
        stock: 20,
        image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=90",
        description: "Medium spiced creamy curry with pilau rice."
    },
    {
        name: "Beef Lasagne Al Forno",
        price: 4.75,
        category: "Chiller",
        brand: "Italiano",
        stock: 12,
        image: "https://images.unsplash.com/photo-1574868235805-c35fd1605f63?auto=format&fit=crop&w=600&q=90",
        description: "Layers of pasta, beef ragu and béchamel sauce."
    },
    {
        name: "Macaroni Cheese",
        price: 3.50,
        category: "Chiller",
        brand: "Hop-In Kitchen",
        stock: 18,
        image: "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=600&q=90",
        description: "Classic pasta in a rich cheddar cheese sauce."
    },
    {
        name: "Toad in the Hole",
        price: 3.75,
        category: "Frozen",
        brand: "Yorkshire Best",
        stock: 8,
        image: "https://images.unsplash.com/photo-1604908177309-86ebf4b5030e?auto=format&fit=crop&w=600&q=90",
        description: "Pork sausages in crispy Yorkshire pudding batter."
    },
    {
        name: "Fish & Chips Large",
        price: 5.99,
        category: "Frozen",
        brand: "Seaside",
        stock: 10,
        image: "https://images.unsplash.com/photo-1579208575657-c529baee0c3c?auto=format&fit=crop&w=600&q=90",
        description: "Battered cod fillet with chunky chips."
    },
    {
        name: "Bangers & Mash",
        price: 4.00,
        category: "Chiller",
        brand: "Hop-In Kitchen",
        stock: 14,
        image: "https://images.unsplash.com/photo-1514781483863-71cc741d8e10?auto=format&fit=crop&w=600&q=90", // Sausage abstract
        description: "Cumberland sausages with creamy mash and onion gravy."
    }
];

async function addMeals() {
    console.log(`👨‍🍳 Adding ${NEW_ITEMS.length} Ready Meals to Inventory...`);
    const colRef = collection(db, 'shops', SHOP_ID, 'inventory');

    for (const item of NEW_ITEMS) {
        try {
            await addDoc(colRef, item);
            console.log(`✅ Added: ${item.name}`);
        } catch (e) {
            console.error(`❌ Failed: ${item.name}`, e);
        }
    }
    console.log("🎉 Done! Ready to eat.");
}

addMeals();
