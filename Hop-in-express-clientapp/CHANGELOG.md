# Changelog

All notable changes to the "Hopin Express" project will be documented in this file.

## [v2.0.0] - 2026-01-26
### Added
- **Atomic Design Architecture**: Reorganized frontend into `atoms`, `molecules`, `organisms`, `templates`.
- **Service Layer**: Created `src/services` for microservice simulations (Order, Inventory, Logistics, Pricing).
- **Brand Identity**: Pivoted to "Blinkit Clean" (Light Mode) aesthetic.
- **Frontend Core**:
    - `Typography`, `Button`, `Input` atoms.
    - `ProductCard`, `Header`, `NavigationDock` organisms.
    - `HomeTemplate` layout.

### Changed
- **Home Screen**: Implemented "First Fold Efficiency" with `CategoryGrid` and `ImpulseRail`.
- **Navigation**: Switched to a persistent 5-tab `NavigationDock`.
- **Inventory Logic**: Connected `HomeTemplate` to live Firestore `subscribeToLiveInventory`.

### Deprecated
- **Midnight Vanta Theme**: Removed dark mode components (legacy `v1`).
