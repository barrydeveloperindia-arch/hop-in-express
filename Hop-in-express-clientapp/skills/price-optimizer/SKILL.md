---
name: price-optimizer
description: Logic to suggest dynamic pricing changes based on stock levels and "freshness" rules.
---

# Price Optimizer Skill

Use this skill to optimize revenue and clear stagnant stock.

## Capabilities
1. **Clearance Finder**: Identifies Chiller/Fresh items with high stock that need to move fast.
2. **Scarcity Pricing**: Identifies low-stock, high-demand items where discounts should be removed.
3. **Margin Calculator**: Ensures new prices don't dip below a safe margin (e.g. cost + 20%).

## Helper Scripts
Location: `skills/price-optimizer/scripts/`

- `suggest_markdowns.js`: Scans for overstocked fresh items and suggests a sale price.
  - usage: `node skills/price-optimizer/scripts/suggest_markdowns.js`

## Rules
- **Fresh/Chiller**: heavy discount if stock > 20.
- **Pantry/Frozen**: minimal discount, long shelf life.
- **Never** price below £0.50 (minimum transaction cost).
