# 📱 Hop-In Express: MVP Product Specification
> **Strategic Focus**: A premium hyperlocal grocery delivery ecosystem bridging the gap between high-efficiency convenience and specialized "World Foods" emporium.
> **Target**: UK Urban Professionals & South Asian Diaspora.
> **Key Differentiator**: "Waitrose meets Mumbai Market" — Authentic, Premium, Fast.

---

## 1. Core Value Propositions
1.  **The "World Foods" Engine**: Prioritizing Indo-Chinese, South Asian, and authentic imports (e.g., 10kg Rice, Premium Spices) over generic groceries.
2.  **Hybrid Convenience**: Speed (10-30 min) + Depth (Specialist Pantry).
3.  **Premium Perception**: Trust, Authenticity, and High-End UI ("Midnight Vanta" aesthetic).

---

## 2. Inventory Architecture (The "Hero" Sections)

### 🌶️ The "Swicy" & Snacking Hub
*   **Concept**: Capitalize on the "Sweet & Spicy" trend.
*   **Key Brands**: Haldiram’s (Aloo Bhujia, Gulab Jamun), Cofresh (Bombay Mix), Balaji.
*   **Visuals**: Vibrant packaging against dark mode backgrounds.

### 🥤 Authentic Hydration ("Nostalgia Beverages")
*   **Concept**: Distinct from generic colas. Glass bottles and cans.
*   **Key Items**: Thums Up, Limca, Maaza, Rubicon (Mango/Guava).

### 🌾 Premium Pantry (Bulk Staples)
*   **Concept**: High-visibility for high-margin bulk items. Do not bury them.
*   **Key Items**: Tilda/Daawat Basmati Rice (5kg/10kg bags), Aashirvaad/Elephant Atta.

### ❄️ Frozen Gold
*   **Concept**: "Restaurant Quality at Home", not just emergency food.
*   **Key Items**: Shana (Okra/Bhindi, Toor Dal), Ashoka (Parathas/Naan), Taj Foods.

### 🎉 Seasonal & Festival Mode
*   **Dynamic UI**: Transforms for Diwali, Ramadan, Christmas.
*   **Focus**: Gifting hampers, Sweet tins, Alphonso Mangoes.

---

## 3. UI/UX Features & Functional Requirements

### 🎨 Design System
*   **Dark Mode First**: Sleek black backgrounds to make fresh produce pop.
*   **Shop by Brand Carousel**: Horizontal scroll of logos (Cadbury, Walkers, MDH, Shan, Gits, Patak's, Heinz).
*   **Visuals**: "Cut-out" style floating visuals.

### 🏷️ Commerce Features
*   **Dual-Pricing Cards (Loyalty First)**: 
    *   Standard Price (Struck through).
    *   **Hop-in Member Price** (Bold, contrasting color).
*   **Smart Search (Vernacular)**: 
    *   "Bhindi" -> Shows Okra.
    *   "Atta" -> Shows Wheat Flour.
*   **Trust Signals**:
    *   "Vegetarian" (Green Dot) & "Halal" Icons prominent.
    *   "Air-Freight Fresh" badge for herbs (Methi, Coriander).

### 🛒 Cart & Conversion Flow
*   **Quick-Add**: Quantity adjusters directly on listing cards (e.g., "+" button for 6 cans of Rubicon).
*   **Recipe-to-Cart**: "Cook Authentic" section (e.g., Chicken Tikka Masala recipe adds Spices + Meat + Yoghurt).
*   **Dynamic Delivery**: Free delivery thresholds for bulk items (encouraging 10kg Rice purchases).

---

## 4. MVP Wireframe Descriptions

### 🏡 Screen 1: Home "Lobby"
*   **Header**: Address Selector & "Festival Mode" Toggle.
*   **Hero Carousel**: "Seasonal Spotlight" (e.g., Alphonso Mangoes or "Swicy" Snacks).
*   **Brand Rail**: Horizontal logos (Shan, MDH, Tilda).
*   **Featured Collections**:
    *   "Nostalgia Sips" (Thums Up, Limca).
    *   "Frozen Feast" (Parathas, Curries).
*   **Bottom Navigation**: Floating Glass Dock [Home, Search, Bag, Profile].

### 🔍 Screen 2: Smart Search & Catalog
*   **Search Bar**: "Search for 'Atta', 'Maggi'..." placeholder.
*   **Results Grid**: 
    *   Dual Pricing shown clearly.
    *   Veg/Halal icons/badges on corner of images.
    *   Quick "Add" button with haptic feedback.

### 📦 Screen 3: Product Detail
*   **Hero Image**: Floating "Cut-out" product.
*   **Info Panel**: 
    *   "Packaged Date" badge for fresh produce.
    *   "Pairs well with..." suggestions (e.g., Naan with Butter Chicken).
*   **Bulk Toggle**: Option to switch from 1kg -> 5kg (Dynamic Savings display).

---

## 5. Development Specs
*   **Frontend**: React Native (Expo) - "Midnight Vanta" Theme.
*   **Inventory**: Firestore with "Best Before" tracking.
*   **Logic**: 
    *   Variable Delivery Pricing function.
    *   Synonym mapping for Search (Bhindi=Okra).
