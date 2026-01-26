---
name: feature-standards
description: Checklist and best practices for implementing new features in Hop-In Express.
---

# Feature Standards Skill

Use this skill to gate-keep code quality before marking a task as done.

## The "Definition of Done" Checklist

### 1. Visual Aesthetics
- [ ] Does it use `tailwind` classes (via `tw`)?
- [ ] Are colors from `src/lib/theme.ts` used?
- [ ] Is it responsive? (Check card width, flex wrapping)
- [ ] **NO PLACEHOLDERS**: Are images real (Pexels/Wikimedia)?

### 2. Code Quality
- [ ] Run `npm run lint` (Must pass or have valid overrides).
- [ ] run `tsc` (TypeScript check).
- [ ] No hardcoded strings for user-facing text (Use Typography).

### 3. Data Integrity
- [ ] Does it handle null/undefined data gracefully? (e.g. `(item.category || '').toLowerCase()`)
- [ ] Are remote resources verified (Web QA)?

### 4. User Experience
- [ ] Are tap targets large enough (44px+)?
- [ ] Is there feedback on interaction (opacity change, loader)?

## Commit Message Standard
Format: `[Feature/Fix] Brief description`
- Example: `[Fix] Replace broken Unsplash images with Pexels`
