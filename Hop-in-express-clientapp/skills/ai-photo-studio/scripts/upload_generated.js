/**
 * AI STUDIO - UPLOAD SCRIPT
 * Takes a local generated image path -> Uploads to Firebase Storage -> Updates Firestore
 */
const { initializeApp } = require("firebase/app");
const { getFirestore, initializeFirestore, doc, updateDoc } = require("firebase/firestore");
const { getStorage, ref, uploadBytes, getDownloadURL } = require("firebase/storage");
const fs = require('fs');

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
const storage = getStorage(app);
const SHOP_ID = 'hop-in-express-';

const args = process.argv.slice(2);
const localPath = args[0];
const docId = args[1]; // The Product ID (e.g. 9f821794-646e-415b-8d65-0de17b1f61fe)

if (!localPath || !docId) {
    console.error("❌ Usage: node upload_generated.js <local_path> <doc_id>");
    process.exit(1);
}

async function upload() {
    console.log(`🎨 AI Studio: Processing '${docId}'...`);

    try {
        // 1. Read Local File
        const buffer = fs.readFileSync(localPath);

        // 2. Upload to Storage
        console.log("   ⬆️ Uploading generated asset...");
        const fileName = `products/ai_generated/${docId}_${Date.now()}.png`;
        const storageRef = ref(storage, fileName);

        await uploadBytes(storageRef, new Uint8Array(buffer), { contentType: 'image/png' });

        // 3. Get URL
        const newUrl = await getDownloadURL(storageRef);
        console.log(`   ✨ Hosted at: ${newUrl}`);

        // 4. Update Firestore
        await updateDoc(doc(db, 'shops', SHOP_ID, 'inventory', docId), {
            image: newUrl,
            tags: ["ai-generated", "studio"],
            source: "antigravity-ai-studio"
        });

        console.log("🎉 Product Image Updated!");
    } catch (e) {
        console.error("❌ Upload Failed:", e.message);
    }
}

upload();
