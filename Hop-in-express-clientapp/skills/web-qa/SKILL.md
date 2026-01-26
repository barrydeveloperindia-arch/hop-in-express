---
name: web-qa
description: Tools to validate the web application health, specifically checking for broken assets and links.
---

# Web QA Skill

Use this skill to ensure the application looks perfect and has no 404 errors.

## Capabilities
- **Image Validation**: Scans all URLs in the database and code to ensure they are live (200 OK).
- **Prohibited Domain Check**: Flags use of `flaticon`, `recipetineats`, or other blocked domains.

## Helper Scripts
Location: `skills/web-qa/scripts/`

- `health_check.js`: Headless URL validator.
  - usage: `node skills/web-qa/scripts/health_check.js`

## When to Use
- After importing new inventory.
- When the user reports "red wall" or "404" errors.
- Before a major demo.
