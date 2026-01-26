---
name: firebase-admin
description: Safe tools for managing, patching, and auditing the live Firestore database.
---

# Firebase Admin Skill

Use this skill whenever you need to modify the live database, fix broken data, or perform bulk updates.

## Capabilities
1. **Safe Patching**: Apply updates to documents matching specific criteria.
2. **Backup**: Read collection data to a local JSON file before modification.
3. **Audit**: Scan for data anomalies (e.g. missing fields, broken URLs).

## Helper Scripts
Location: `skills/firebase-admin/scripts/`

- `universal_patch.js`: A configurable script to update documents.
  - usage: `node skills/firebase-admin/scripts/universal_patch.js --collection inventory --field price --value 10`
  *(Note: You usually need to edit this script for complex logic).*

## Workflow
1. **Always** check the current data state first.
2. If doing a bulk update, backup the collection to a local file.
3. Apply the fix on a single document ID first to verify.
4. Run the full patch.

## Safety Rules
- NEVER delete documents without explicit user confirmation.
- Always log the 'before' and 'after' state of modified documents.
