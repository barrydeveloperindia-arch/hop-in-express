# UI Component Documentation

## Overview
This document catalogs the key UI components and flows within the Hop-In Express application.

## 1. Core Atoms
*   **Typography**: Centralized text component supporting variants (`h1`, `body`, `caption`, etc.).
*   **Button**: Standardized buttons with variants (`primary`, `secondary`, `outline`) and sizes.
*   **Input**: Text input fields with consistent styling and focus states.
*   **CircularProgress**: Visual indicator for loading or countdowns (Staff Dashboard).

## 2. Key Organisms

### 2.1 Guest Checkout Sheet
*   **Path**: `src/components/organisms/GuestCheckoutSheet.tsx`
*   **Usage**: Displays the checkout form for guest users.
*   **Features**:
    *   Order Summary (Total, Items Count).
    *   Input Fields (Name, Phone, Address, Notes).
    *   Payment Method Selector (Card, GPay, Cash).
    *   Validation logic.

### 2.2 Edit Profile Sheet
*   **Path**: `src/components/organisms/EditProfileSheet.tsx`
*   **Usage**: Allows authenticated users to update their profile.
*   **Features**:
    *   Pre-filled data from Firestore.
    *   Real-time updates to `users` collection.

### 2.3 Navigation Dock
*   **Path**: `src/components/organisms/NavigationDock.tsx`
*   **Usage**: Bottom navigation bar.
*   **Logic**: Handles routing between Home, Category, Cart, Account.

## 3. Staff & Manager Layouts

### 3.1 Staff Dashboard Template
*   **Path**: `src/components/staff/StaffDashboardTemplate.tsx` (Note: Moving to `templates/staff` in future refactor).
*   **Usage**: Main view for Store Managers.
*   **Features**:
    *   **Live Queue**: Real-time order stream using `onSnapshot`.
    *   **Metrics**: Ticker showing KPIs.
    *   **Status Management**: Accept/Reject/Complete orders.

### 3.2 Picking Session Template
*   **Path**: `src/components/staff/PickingSessionTemplate.tsx`
*   **Usage**: Interface for packing orders.
*   **Features**:
    *   Scanner simulation.
    *   Item checklist.

## 4. Modules (Legacy -> Moving to Molecules/Organisms)
*   **BrandRail**: Horizontal scroll of brand logos.
*   **FeatureCarousel**: Hero banner slider.
*   **ProductCard**: Display item details and "Add to Cart" interactions.
