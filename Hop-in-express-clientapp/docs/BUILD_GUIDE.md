# Build Guide for Android APK

**Goal**: Generate a production-ready APK/AAB for Hop-In Express (Customer, Rider, & Manager Apps in one).

## Prerequisites

1.  **Android Studio**: Ensure it's installed and the `ANDROID_HOME` environment variable is set.
2.  **SDK Tools**: Install "Android SDK Command-line Tools" via Android Studio SDK Manager.
3.  **Google Maps API Key**:
    *   Get an API Key from Google Cloud Console with **Maps SDK for Android** enabled.
    *   Open `app.json` and replace `TODO_REPLACE_WITH_YOUR_KEY` with your actual key.

## Step 1: Generate Native Project

Since we added native modules (`react-native-maps`, `react-native-deck-swiper`), we must regenerate the Android folder.

Run this in your terminal:

```bash
npx expo prebuild --platform android --clean
```

*   `--clean`: Deletes the existing `android` folder and creates a fresh one.
*   This ensures all new dependencies are linked correctly.

## Step 2: Build the APK

You have two options:

### Option A: Build with Expo CLI (Recommended for easy testing)

```bash
npx expo run:android --variant release
```

This will compile the app and install it directly on your connected device or emulator in "Release" mode.

### Option B: Build APK Manually (For sharing)

1.  Navigate to the android folder:
    ```bash
    cd android
    ```
2.  Run the Gradle assembler:
    ```bash
    ./gradlew assembleRelease
    ```

**Output**: The APK will be generated at:
`android/app/build/outputs/apk/release/app-release.apk`

## Step 3: Deployment

-   **Customer App**: The default view.
-   **Manager App**: Login or navigate to `/staff`.
-   **Rider App**: Navigate to Rider Mode (future impl).
