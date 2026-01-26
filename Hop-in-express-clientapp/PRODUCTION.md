# Production Deployment Guide (Hopin Express v2.1)

## 📦 Build Artifacts
This app is configured for Expo (Managed Workflow).

### 1. Pre-requisites
- Ensure `app.json` has the correct `bundleIdentifier` (iOS) and `package` (Android) before submitting.
- Verify `firebase.ts` allows the production domain (if using Web).

### 2. Building for Stores
**Android (APK/AAB):**
```bash
eas build -p android --profile production
```

**iOS (IPA):**
```bash
eas build -p ios --profile production
```

**Web (Static Bundle):**
```bash
npx expo export
```

## 🔍 Quality Assurance Checklist
- [x] **Light Mode UI**: Verified on Home, Product, Cart.
- [x] **Services**: Logistics (ETA) and Pricing (Fees) active.
- [x] **Navigation**: Deep linking `/product/:id` verified.
- [x] **Performance**: Images use optimal caching (Expo Image).
- [ ] **SEO**: (Web only) Ensure `title` tags are dynamic (Partially implemented in _layout).

## 🚀 Known Limitations (MVP)
- **Inventory**: Currently using `mockInventory.ts` + partial Firestore. Connect full Firestore before Scale.
- **Payments**: "Google Pay" button is UI-only. Integrate Stripe/Razorpay.
- **Auth**: Currently anonymous. Enable Firebase Auth for user profiles.

## 📞 Support
Contact the Engineering Team (Antigravity Agent) for architecture support.
