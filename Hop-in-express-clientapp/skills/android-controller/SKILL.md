---
name: android-controller
description: Commands and shortcuts for managing the Android Emulator via ADB.
---

# Android Controller Skill

Use this skill when developing with the Android Emulator (Windows).

## Capabilities
- **Reverse Ports**: Ensure `localhost:8081` works on the device.
- **Shake**: Simulate shake gesture for dev menu.
- **Reload**: Force reload the bundle.
- **Input Text**: Type text via ADB (useful for long passwords).

## Common Commands

### 1. Fix Connectivity
```powershell
adb reverse tcp:8081 tcp:8081
```

### 2. Open Dev Menu
```powershell
adb shell input keyevent 82
```

### 3. Reload App
```powershell
adb shell input text "RR"
```

### 4. Input Text
```powershell
adb shell input text "testuser@gmail.com"
```

## Troubleshooting
- If `adb` is not found, check `ANDROID_HOME` or use the full path.
- If device is offline, try `adb kill-server` then `adb start-server`.
