
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, writeBatch, initializeFirestore, Timestamp } from "firebase/firestore";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import XHR2 from 'xhr2';

// Polyfill
global.XMLHttpRequest = XHR2;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadEnv() {
    const envPath = path.resolve(__dirname, '../.env.local');
    if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf-8');
        const env = {};
        content.split('\n').forEach(line => {
            const parts = line.split('=');
            if (parts.length >= 2 && !line.startsWith('#')) {
                const key = parts[0].trim();
                const val = parts.slice(1).join('=').trim();
                env[key] = val;
            }
        });
        return env;
    }
    return {};
}

const env = loadEnv();

const FIREBASE_CONFIG = {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID
};

const firebaseApp = initializeApp(FIREBASE_CONFIG);
const db = initializeFirestore(firebaseApp, {
    experimentalForceLongPolling: true,
}, "hopinexpress1");

function randomTime(startHour, endHour) {
    const h = Math.floor(Math.random() * (endHour - startHour + 1)) + startHour;
    const m = Math.floor(Math.random() * 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

function calculateHours(start, end) {
    const [h1, m1] = start.split(':').map(Number);
    const [h2, m2] = end.split(':').map(Number);
    return parseFloat(((h2 * 60 + m2 - (h1 * 60 + m1)) / 60).toFixed(2));
}

async function run() {
    try {
        console.log("Connecting to Firestore for Seeding...");

        const shopsRef = collection(db, 'shops');
        const shopSnap = await getDocs(shopsRef);
        let userId = env.VITE_USER_ID;

        if (!userId) {
            if (shopSnap.empty) {
                console.error("No shops found.");
                process.exit(1);
            }
            userId = shopSnap.docs[0].id;
        }
        console.log("Target Shop:", userId);

        // Fetch Staff
        const staffRef = collection(db, 'shops', userId, 'staff');
        const staffSnap = await getDocs(staffRef);
        const staffIds = staffSnap.docs.map(d => d.id);

        if (staffIds.length === 0) {
            console.error("No staff found to seed attendance for.");
            process.exit(1);
        }
        console.log(`Found ${staffIds.length} staff members.`);

        const records = [];
        const startDate = new Date('2025-01-01');
        const endDate = new Date('2026-12-31');

        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            const isWeekend = d.getDay() === 0; // Sunday off

            if (isWeekend) continue; // Skip Sundays

            for (const staffId of staffIds) {
                // 10% chance of absence
                if (Math.random() < 0.1) continue;

                const clockIn = randomTime(8, 10); // 08:00 - 10:59
                const clockOut = randomTime(16, 19); // 16:00 - 19:59
                const hours = calculateHours(clockIn, clockOut);

                records.push({
                    id: `seed_${staffId}_${dateStr}`,
                    staffId,
                    date: dateStr,
                    status: 'Present',
                    clockIn,
                    clockOut,
                    hoursWorked: hours,
                    notes: 'Auto-generated history'
                });
            }
        }

        console.log(`Generated ${records.length} attendance records.`);
        console.log("Writing to Firestore in batches (this may take time)...");

        // Batch Write (Max 500 operations per batch)
        const CHUNK_SIZE = 400; // Safe limit
        for (let i = 0; i < records.length; i += CHUNK_SIZE) {
            const chunk = records.slice(i, i + CHUNK_SIZE);
            const batch = writeBatch(db);

            chunk.forEach(rec => {
                const ref = doc(db, 'shops', userId, 'attendance', rec.id);
                batch.set(ref, rec);
            });

            await batch.commit();
            console.log(`Committed records ${i + 1} to ${i + chunk.length}`);
        }

        console.log("✅ Seeding Complete!");
        process.exit(0);

    } catch (e) {
        console.error("Error:", e);
        process.exit(1);
    }
}

run();
