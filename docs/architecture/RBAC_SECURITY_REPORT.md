# RBAC Implementation & Security Hardening

## Overview
This document outlines the final implementation of Role-Based Access Control (RBAC) for the Hop In Express Command OS. The system now enforces strict separation of duties between Admins (Owners) and regular Staff (Cashiers, etc.).

## 1. Authentication & Role Mapping
- **Mechanism**: Firebase Auth Email -> Firestore `staff` Document.
- **Logic**: Upon login, `App.tsx` scans the `staff` collection for a record matching `user.email`.
- **Match Found**: 
  - `currentUserRole` is set to the staff member's defined role (e.g., 'Owner', 'Cashier').
  - `currentStaffId` is updated to link audit logs and attendance records to the correct persona.
- **No Match**: Role defaults to 'Cashier' (Safe Mode, though currently falls back to `Authentication Required` view if no user at all).

## 2. Access Control Matrix

| Feature | Owner / Manager | Cashier / Stock |
| :--- | :---: | :---: |
| **Command Center** | ✅ Full Access | ✅ View Only |
| **Crew Management** | ✅ Full Control | ⚠️ Restricted (Terminal Only) |
| **Recruit Personnel** | ✅ Yes | ❌ Hidden |
| **Edit Staff Records** | ✅ Yes | ❌ Hidden |
| **Manual Clock-In/Out** | ✅ Yes | ❌ Hidden |
| **Terminal Access** | ✅ Yes | ✅ Yes (Kiosk Mode) |
| **Export/Seed Data** | ✅ Yes | ❌ Hidden |
| **Financials** | ✅ Yes | ❌ Hidden (Sidebar) |

## 3. Security Hardening Measures
### A. Staff View Constraints
- **Navigation**: The "Crew Management" (Staff View) module is now visible to ALL staff.
- **Button Guards**: 
  - `Recruit Personnel`, `Edit Staff` (Pencil), `Delete`, `Export`, `Seed Data` buttons are conditionally rendered based on `isAdmin` (`role === 'Owner'`).
  - **Critical Fix**: The "Manual Check-In/Out" buttons are now **Admin Only**. Regular staff MUST use the "Terminal".

### B. Terminal Security
- **Launch**: Any staff can launch the Terminal (Kiosk).
- **Close**: Closing the Terminal (via 'X') requires an **Owner PIN** (`9999` by default for Shop Owner).
- **Authentication**: Usage requires biometrics (simulated) or Personal PIN.

### C. Cashier Simulation
- Verified that a user with the 'Cashier' role:
  - Can navigate to Crew Management.
  - Can launch the Terminal.
  - **Cannot** see any administrative buttons.
  - **Cannot** edit attendance records.
  - **Cannot** change the "Personnel Focus" dropdown.

## 4. Bootstrap Configuration
- **Initial Account**: `demo@hopinexpress.com`
- **Linked Persona**: "Shop Owner" (Role: Owner, PIN: 9999)
- **Status**: Role linkage is verified and active.

## 5. Dashboard Fixes
- **Inventory Realization**: Fixed a bug where missing price/stock data caused `£NaN` display. Now defaults to 0 safely.

## Next Steps
- **Production Data**: Ensure all real staff members have their emails added to their profiles to enable their specific roles upon login.
- **PIN Rotation**: Change the default '9999' PIN for the Shop Owner before deployment.
