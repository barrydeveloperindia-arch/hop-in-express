---
name: search-configurator
description: Tools to audit and improve product discoverability via tags and keywords.
---

# Search Configurator Skill

Use this skill to ensure users find what they are looking for, even if they spell it wrong or use a synonym.

## Capabilities
1. **Synonym Injector**: Auto-adds tags like "Soda", "Pop", "Coke" to "Thums Up".
2. **Keyword Audit**: Checks if key products have minimal search terms.
3. **Index Helper**: Generates the necessary Firestore Composite Index JSON for complex queries.

## Helper Scripts
Location: `skills/search-configurator/scripts/`

- `audit_tags.js`: Scans inventory for items with < 3 tags.
  - usage: `node skills/search-configurator/scripts/audit_tags.js`

- `generate_synonyms.js`: Suggests tags for a given product name.
  - usage: `node skills/search-configurator/scripts/generate_synonyms.js "Thums Up"`

## Best Practices
- Tags should be lowercase.
- Include category name in tags.
- Include common typos if strictly necessary.
