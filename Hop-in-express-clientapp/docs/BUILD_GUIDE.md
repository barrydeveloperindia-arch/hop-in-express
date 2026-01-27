# Build Guide for Android APK

**Goal**: Generate a production-ready APK/AAB for Hop-In Express (Customer, Rider, & Manager Apps in one).

## Prerequisites

1.  **Android Studio**: Ensure it's installed and the `ANDROID_HOME` environment variable is set.
2.  **SDK Tools**: Install "Android SDK Command-line Tools" via Android Studio SDK Manager.
3.  **Google Maps API Key**:
    *   **Step 1**: Go to the [Google Cloud Console](https://console.cloud.google.com/).
    *   **Step 2**: Create a new project (e.g., "Hop-In Express Maps").
    *   **Step 3**: In the search bar at the top, type "Maps SDK for Android" and select it. Click **Enable**.
    *   **Step 4**: Go to the **Credentials** page (Menu > APIs & Services > Credentials).
    *   **Step 5**: Click **Create Credentials** > **API Key**.
    *   **Step 6**: Copy the generated key string.
    *   **Step 7**: Open `app.json` in your project and replace `TODO_REPLACE_WITH_YOUR_KEY` with this copied key.
    
    *(Optional but Recommended)*: Click on the credential name to edit it. Under "API restrictions", select "Restrict key" and choose "Maps SDK for Android". Under "Application restrictions", choose "Android apps" and add your package name: `com.barry_developer.hopinexpress`.

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
