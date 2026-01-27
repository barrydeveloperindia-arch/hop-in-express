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

## [v2.1.0] - 2026-01-27
### Added
- **Manager Cockpit**: Specialized dashboard for store managers (`StaffDashboardTemplate`).
- **Dark Operations Theme**: High-contrast dark mode for warehouse/picking environments (Phase 3).
- **Gamified KPI Dials**: `CircularProgress` for inventory health monitoring.
- **Rider Fleet Map**: Live visualization of rider locations (`RiderMap`).
- **One-Tap Restock**: `RestockSwiper` for rapid inventory management.
- **Live Event Ticker**: Real-time alerts implementation (`Ticker`). 

### Changed
- **Picking Session**: Refactored `PickingSessionTemplate` to use "Dark Operations" theme for better visibility in dim conditions.
