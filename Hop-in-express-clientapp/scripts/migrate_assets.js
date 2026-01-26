const { initializeApp } = require("firebase/app");
const { getFirestore, initializeFirestore, collection, addDoc, doc, setDoc } = require("firebase/firestore");

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

// 1. Marketing Banners (from FeatureCarousel.tsx)
const BANNERS = [
    {
        id: "banner_nano_banana",
        title: "Nano Banana",
        subtitle: "Limited Edition", // inferred
        type: "banner",
        image: "https://images.unsplash.com/photo-1603833665858-e61d17a86224?q=80&w=1887&auto=format&fit=crop",
        active: true,
        order: 1
    },
    {
        id: "banner_truffle",
        title: "Alba White Truffle",
        subtitle: "Rare Find",
        type: "banner",
        image: "https://images.unsplash.com/photo-1608649887140-523c9ce05096?q=80&w=2670&auto=format&fit=crop",
        active: true,
        order: 2
    }
];

// 2. Categories (from CategoryRow.tsx)
const CATEGORIES = [
    {
        id: "cat_fruits",
        name: "Fruits",
        type: "category_thumbnail",
        image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=2670&auto=format&fit=crop",
    },
    {
        id: "cat_vegetables",
        name: "Vegetables",
        type: "category_thumbnail",
        image: "https://images.unsplash.com/photo-1597362925123-77861d3fbac7?q=80&w=2670&auto=format&fit=crop",
    },
    {
        id: "cat_bakery",
        name: "Bakery",
        type: "category_thumbnail",
        image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=2672&auto=format&fit=crop",
    }
];

// 3. Recipes (from RecipeService.v1.ts)
const RECIPES = [
    {
        id: "rec_shepherds_pie",
        name: "Shepherd's Pie",
        description: "Classic British comfort food with lamb and creamy mash.",
        image: "https://images.unsplash.com/photo-1662955676378-5d25ecf2b6e5?q=80&w=800&auto=format&fit=crop",
        cookingTime: "45 Mins",
        difficulty: "Medium",
        totalPrice: 15.50,
        ingredients: [
            { name: "Minced Lamb (500g)", price: 6.50, image: "https://images.unsplash.com/photo-1603048297172-c92544798d5e?q=80&w=200&auto=format&fit=crop" },
            { name: "Maris Piper Potatoes (2kg)", price: 2.50, image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?q=80&w=200&auto=format&fit=crop" },
            { name: "Frozen Peas", price: 2.00, image: "https://images.unsplash.com/photo-1592323679869-73e440776c58?q=80&w=200&auto=format&fit=crop" },
            { name: "Bisto Gravy", price: 4.50, image: "https://images.unsplash.com/photo-1604543472093-272cb250529d?q=80&w=200&auto=format&fit=crop" }
        ],
        type: "recipe"
    }
];

async function migrateAssets() {
    console.log("📦 Starting Application Assets Migration...");

    // Create specific collections for these asset types inside the Shop structure
    // Collection 1: Banners
    console.log("Creating/Updating 'banners' collection...");
    const bannersRef = collection(db, 'shops', SHOP_ID, 'banners');
    for (const item of BANNERS) {
        await setDoc(doc(bannersRef, item.id), item);
        console.log(` ✅ Banner: ${item.title}`);
    }

    // Collection 2: Category Highlights
    console.log("Creating/Updating 'category_highlights' collection...");
    const catRef = collection(db, 'shops', SHOP_ID, 'category_highlights');
    for (const item of CATEGORIES) {
        await setDoc(doc(catRef, item.id), item);
        console.log(` ✅ Category: ${item.name}`);
    }

    // Collection 3: Recipes
    console.log("Creating/Updating 'recipes' collection...");
    const recipeRef = collection(db, 'shops', SHOP_ID, 'recipes');
    for (const item of RECIPES) {
        await setDoc(doc(recipeRef, item.id), item);
        console.log(` ✅ Recipe: ${item.name}`);
    }

    // We also want to store these URLs in a central 'assets' table as requested, 
    // to have a single source of truth for "all images from other websites".
    console.log("Creating/Updating generic 'external_assets' table...");
    const assetsRef = collection(db, 'shops', SHOP_ID, 'external_assets');

    const allItems = [...BANNERS, ...CATEGORIES, ...RECIPES];
    for (const item of allItems) {
        // Flat log of images used
        // For recipe, we need to extract ingredient images too
        const imagesToStore = [{ id: item.id, url: item.image, name: item.name || item.title || "Unknown" }];

        if (item.ingredients) {
            item.ingredients.forEach((ing, idx) => {
                imagesToStore.push({
                    id: `${item.id}_ing_${idx}`,
                    url: ing.image,
                    name: `${item.name} - ${ing.name}`
                });
            });
        }

        for (const img of imagesToStore) {
            await setDoc(doc(assetsRef, img.id), {
                originalUrl: img.url,
                description: img.name,
                source: "unsplash",
                migratedAt: new Date().toISOString()
            });
        }
    }
    console.log("✅ All assets registered in 'external_assets' collection.");
    console.log("🎉 Migration Complete!");
}

migrateAssets();
