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
const db = initializeFirestore(app, { experimentalForceLongPolling: true }, 'hopinexpress1');
const SHOP_ID = 'hop-in-express-';

const BAD_URL_PART = "1544126566";
const FALLBACK = "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1";

async function deepSearch() {
    console.log(`🕵️‍♀️ Deep/Wide Search for '${BAD_URL_PART}'...`);

    // Check ALL content collections
    const collections = ['recipes', 'banners', 'category_highlights', 'external_assets'];

    for (const colName of collections) {
        console.log(`Scanning [${colName}]...`);
        const snapshot = await getDocs(collection(db, 'shops', SHOP_ID, colName));

        for (const d of snapshot.docs) {
            const data = d.data();
            const strData = JSON.stringify(data);

            if (strData.includes(BAD_URL_PART)) {
                console.log(`🚨 FOUND in ${colName} -> ${d.id}`);
                console.log(strData.substring(0, 100));

                // Smart fix based on structure
                const updates = {};

                // 1. Root level image
                if (data.image && data.image.includes(BAD_URL_PART)) updates.image = FALLBACK;

                // 2. Ingredients array (common in recipes)
                if (data.ingredients && Array.isArray(data.ingredients)) {
                    const newIngredients = data.ingredients.map(ing => {
                        if (ing.image && ing.image.includes(BAD_URL_PART)) {
                            console.log(`   Fixing ingredient: ${ing.name}`);
                            return { ...ing, image: FALLBACK };
                        }
                        return ing;
                    });
                    updates.ingredients = newIngredients;
                }

                if (Object.keys(updates).length > 0) {
                    await updateDoc(doc(db, 'shops', SHOP_ID, colName, d.id), updates);
                    console.log("   ✅ Fixed.");
                } else {
                    console.log("   🤔 Found string but couldn't auto-patch structure. Please inspect manually.");
                }
            }
        }
    }
    console.log("🏁 Done.");
}

deepSearch();
