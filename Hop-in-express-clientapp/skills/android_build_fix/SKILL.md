---
name: Fix Android Build Java Version
description: Resolves React Native Android build failures by using the bundled JDK from Android Studio instead of the system JDK.
---

# Fix Android Build Java Version

## Context
React Native (0.76+) and modern Gradle plugins require **Java 17** or newer. Many Windows systems default to Java 8 (`1.8.0`), causing build errors like:
- `incompatible Daemon`
- `Unsupported class file major version`

## Solution
Use the JDK bundled with Android Studio (`jbr` or `jre` folder) instead of installing a separate JDK.

## Implementation Script (PowerShell)

You can run this snippet in your terminal to temporarily configure the session:

```powershell
# 1. Detect JDK Path
$studioPath = "C:\Program Files\Android\Android Studio"
$jbrPath = "$studioPath\jbr"
$jrePath = "$studioPath\jre"

if (Test-Path $jbrPath) {
    $env:JAVA_HOME = $jbrPath
} elseif (Test-Path $jrePath) {
    $env:JAVA_HOME = $jrePath
} else {
    Write-Host "Error: Could not find Android Studio JDK." -ForegroundColor Red
    return
}

# 2. Update Path
$env:Path = "$env:JAVA_HOME\bin;$env:Path"

# 3. Verify
java -version
```

## Permanent Fix
To make this permanent, add `JAVA_HOME` to your User Environment Variables in Windows Settings pointing to `C:\Program Files\Android\Android Studio\jbr`.
