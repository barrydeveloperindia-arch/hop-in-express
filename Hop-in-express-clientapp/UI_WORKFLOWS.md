# 📱 UI Workflows & Interaction Guide

**Design Version**: 1.0 "Midnight Vanta"

This document outlines the user flows and interaction models for the key screens.

## 1. The "Lobby" (Home Flow)
**Goal**: Immerse the user immediately. Zero friction.

*   **State A: Loading**
    *   Show a pulsating "H" logo in Electric Indigo.
    *   Background: Deep Black.
*   **State B: Active**
    *   **Header**: Sticky Glassmorphic bar. "Good Evening, [Name]".
    *   **Hero Section**: Full-width card with video/image background.
    *   **Interaction**:
        *   Scroll Down -> Header blurs and shrinks.
        *   Tap Product -> Opens **Product Detail Modal**.
        *   Long Press Product -> "Quick Add" with Haptic Feedback.
*   **State C: Empty/Error**
    *   Minimalist illustration in dark grey. "The shelves are being restocked."

## 2. The "Vault" (Product Discovery)
**Goal**: Make browsing feel like a gallery.

*   **View**: Infinite vertical scroll of "Aisle" categories (Horizontal rails).
*   **Search**:
    *   Tap Search Icon -> Full screen overlay fades in.
    *   Keyboard opens automatically.
    *   Results populate instantly (Optimistic UI).
*   **Filtering**:
    *   Pill-shaped tags filter by "Vibe" (e.g., "Party", "Relax").
    *   Selected tags glow Electric Indigo.

## 3. Product Detail (The "Jewel Case")
**Goal**: Elevate the item.

*   **Transition**: Shared Element Transition (Image expands from thumbnail to full screen).
*   **Layout**:
    *   Top 60%: Immersive Product Image.
    *   Bottom 40%: Glass sheet slides up containing Title, Price, Description.
*   **Actions**:
    *   "Add to Bag": Big, full-width button.
    *   Feedback: Button turns green, checkmark icon, firm Haptic 'Thud'.

## 4. The "Bag" (Checkout)
**Goal**: Trust and Speed.

*   **Entry**: Swipe up on Bottom Bar or tap Bag icon.
*   **List**: Items stack with swipe-to-delete.
*   **Checkout**:
    *   "Slide to Pay": A physical slide and release action to confirm.
    *   Success: Screen bursts with subtle confetti or gold particle effect.

---

## 🧩 Component Versioning

| Component | Version | Status | Notes |
| :--- | :--- | :--- | :--- |
| `GlassHeader` | v1.0 | 🟢 Ready | Uses `expo-blur` |
| `HeroCard` | v1.1 | 🟢 Ready | Supports video bg |
| `ProductCard` | v1.2 | 🟡 In Prog | Needs quick-add |
| `CartSheet` | v0.9 | 🔴 Planned | Pending Stripe |

