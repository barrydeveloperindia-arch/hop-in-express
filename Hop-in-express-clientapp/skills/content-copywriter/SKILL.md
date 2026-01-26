---
name: content-copywriter
description: Tools to generate premium product descriptions and marketing copy for inventory items.
---

# Content Copywriter Skill

Use this skill to enhance the "Premium Feel" of the app by ensuring every item has a mouth-watering description.

## Capabilities
1. **Auto-Description**: Generates a 2-sentence marketing string for any given product name.
2. **Tag Generation**: Suggests 3 relevant search tags (e.g. "Spicy", "Vegan", "Party").
3. **Audit**: Checks for items with missing or "lorem ipsum" descriptions.

## Helper Scripts
Location: `skills/content-copywriter/scripts/`

- `generate_copy.js`: Run this to see suggestions for a specific item.
  - usage: `node skills/content-copywriter/scripts/generate_copy.js "Spicy Chicken Wings"`

- `bulk_enhance.js`: Scans the DB for empty descriptions and fills them (Requires confirmation).
  - usage: `node skills/content-copywriter/scripts/bulk_enhance.js`

## Tone Guidelines
- **Vibe**: Energetic, Appetizing, Premium.
- **Avoid**: "Good quality", "Nice item".
- **Prefer**: "Crispy", "Succulent", "Hand-crafted".
