# Hop-In Express Architecture & Code Standards

## 1. Directory Structure

We follow a modified **Atomic Design** principle, integrated with **Feature-based** organization for complex domains.

```
src/
├── components/          # Shared UI Components
│   ├── atoms/           # Basic building blocks (Button, Input, Typography, Icon)
│   ├── molecules/       # Simple combinations (ProductCard, SearchBar, Ticker)
│   ├── organisms/       # Complex sections (Header, Footer, CheckoutSheet, Carousel)
│   ├── templates/       # Page layouts (StaffDashboardTemplate, PickingSessionTemplate)
│   └── ui/              # Third-party or base UI library components (if any)
├── hooks/               # Custom React Hooks (useCart, useAuth)
├── lib/                 # Utilities, Constants, Helpers (firebase, theme, tw)
├── services/            # Business Logic & API calls (AuthService, CheckoutService, UserProfileService)
├── types/               # TypeScript interfaces and types (global)
└── ...
```

### 1.1 `app/` (Expo Router)
The `app/` directory corresponds to routes. Files here should be **lightweight**, primarily importing `templates` or `screens` and connecting them to data hooks.

## 2. Naming Conventions

### Files & Components
*   **PascalCase**: Components, Contexts, Screens.
    *   *Example*: `ProductCard.tsx`, `AuthContext.tsx`, `HomeScreen.tsx`
*   **camelCase**: Hooks, Utilities, Functions.
    *   *Example*: `useCart.ts`, `formatCurrency.ts`, `authService.ts`

### Variables & Functions
*   **camelCase**: standard variables and function names.
*   **UPPER_SNAKE_CASE**: Constants and Environment variables.
    *   *Example*: `MAX_RETRIES`, `API_URL`

### Interfaces & Types
*   **PascalCase**: prefixes with 'I' are **discouraged**. Use descriptive names.
    *   *Example*: `UserProfile`, `CartItem`, `OrderDetails` (not `IUser`)

## 3. State Management
*   **Local State**: `useState` for component-level UI state (toggles, inputs).
*   **Global Client State**: `useContext` (e.g., `CartContext` for shopping cart).
*   **Server State / Data**: **Firebase Firestore**. We use direct subscription (`onSnapshot`) for real-time data (Staff Dashboard) and `getDoc`/`setDoc` for transactional data.

## 4. Coding Patterns

### functional Components
Use `function` or `const` components.
```tsx
export const MyComponent: React.FC<Props> = ({ prop }) => { ... }
```

### Styling
Use **Tailwind CSS** via `twrnc` (`tw` utility).
```tsx
<View style={tw`bg-white p-4 rounded-lg`}>
```
Avoid `StyleSheet.create` unless performance is critical or for animations.

### Async/Await
Prefer `async/await` over `.then().catch()`.
Wrap async calls in `try/catch` blocks for error handling.

## 5. Deployment & Build
See `docs/BUILD_GUIDE.md` for Android APK generation instructions.
