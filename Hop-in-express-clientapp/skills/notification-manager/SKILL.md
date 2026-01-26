---
name: notification-manager
description: Tools to identify user engagement opportunities and generate push notification payloads.
---

# Notification Manager Skill

Use this skill to re-engage users who have dropped off or to promote specific inventory.

## Capabilities
1. **Campaign Generator**: Creates title/body text for different scenarios (Rainy Day, Late Night, Lunch Rush).
2. **Abandoned Cart**: (Future) Scan pending orders and nudge users.
3. **New Arrival**: Generate announcements for items added in the last 24h.

## Helper Scripts
Location: `skills/notification-manager/scripts/`

- `generate_campaign.js`: Outputs a JSON payload for a specific marketing angle.
  - usage: `node skills/notification-manager/scripts/generate_campaign.js "Rainy Day"`

## Tone Guidelines
- Short & Punchy (User is on mobile).
- Use Emojis 🌧️ 🌙 🍔.
- Always include a Call to Action (CTA) like "Order Now".
