---
name: inventory-analyst
description: Tools for analyzing stock levels, revenue projections, and category distribution.
---

# Inventory Analyst Skill

Use this skill to answer business questions about the inventory.

## Capabilities
- **Stock Low Alerts**: Identify items with stock < 5.
- **Category Breakdown**: Count items per category.
- **Value Calculation**: Sum of `price * stock` to estimate inventory value.

## Helper Scripts
Location: `skills/inventory-analyst/scripts/`

- `analyze.js`: Runs a full report on the inventory.
  - usage: `node skills/inventory-analyst/scripts/analyze.js`

## Analysis Prompts
- "What is the total value of our Chiller section?"
- "Which items are out of stock?"
- "Do we have any items with missing images?" (Cross-reference with Web QA skill)
