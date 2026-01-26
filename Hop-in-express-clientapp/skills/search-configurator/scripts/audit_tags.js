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

async function audit() {
    console.log("🔍 Auditing Product Visibility...");
    const snapshot = await getDocs(collection(db, 'shops', SHOP_ID, 'inventory'));

    let hiddenGems = 0;

    snapshot.forEach(doc => {
        const d = doc.data();
        const tags = d.tags || [];

        // Criteria: items with very few tags are hard to find
        if (tags.length < 3) {
            console.log(`⚠️  Poor Visibility: ${d.name} (Tags: ${tags.length})`);
            console.log(`    Suggest: node skills/search-configurator/scripts/generate_synonyms.js "${d.name}"`);
            hiddenGems++;
        }
    });

    if (hiddenGems === 0) {
        console.log("✅ All items have rich tag metadata.");
    } else {
        console.log(`\nfound ${hiddenGems} items that might be hard to search for.`);
    }
}

audit();
