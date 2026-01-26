---
name: asset-migrator
description: Tools to download external images and host them permanently on Firebase Storage.
---

# Asset Migrator Skill

Use this skill to take ownership of your data by moving external dependencies (Unsplash/Pexels/Wikimedia) into your own cloud storage.

## Capabilities
1. **Download & Upload**: Fetches an image from a URL and uploads it to your Firebase Storage bucket.
2. **Link Swap**: Updates the Firestore document to point to the new `firebasestorage.googleapis.com` URL.
3. **Audit**: Reports how many items are still using external links.

## Helper Scripts
Location: `skills/asset-migrator/scripts/`

- `migrate_single.js`: Migrates one specific item by ID (Best for testing/fixing).
  - usage: `node skills/asset-migrator/scripts/migrate_single.js "PRODUCT_DOC_ID"`
  
- `migrate_all.js`: Scans the entire inventory and attempts to migrate ALL external links.
  - usage: `node skills/asset-migrator/scripts/migrate_all.js`

## Prerequisites
- Node.js `Fetch` API (Standard in Node 18+).
- Firebase Storage permissions (configured in `firebaseConfig`).
