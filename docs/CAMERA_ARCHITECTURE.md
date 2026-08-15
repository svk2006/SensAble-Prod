# SensAble — Camera Architecture & Implementation Specification (Step 10C.2 Completed)

**Status:** Implementation Verified & Tested  
**Target RN Version:** React Native `0.87.0` (React `19.2.3`, New Architecture / Fabric enabled)  
**Target Android Environment:** Android SDK 35 (JDK 21 JBR, Gradle 9.4.1, AGP 8.8.0, NDK 27.1)  
**Scope:** V1 Real-Time Native Front Camera Preview Foundation  

---

## 1. Installed Package Specification

The following exact camera engine dependencies are installed in `mobile/package.json`:

- **Main Package:** `react-native-vision-camera@5.2.0`
- **Installed Nitro Dependencies:**
  - `react-native-nitro-modules@^0.36.5`
  - `react-native-nitro-image@^0.15.1`

---

## 2. Verified Android Build Result

- **Build Command:** `$env:JAVA_HOME="C:\Program Files\Android\Android Studio\jbr"; cd android; .\gradlew assembleDebug`
- **Compilation Status:** **`BUILD SUCCESSFUL`** (342 actionable tasks: 181 executed, 161 up-to-date).
- **Output Debug APK Location:** [mobile/android/app/build/outputs/apk/debug/app-debug.apk](file:///c:/MyProjects/SensAble/mobile/android/app/build/outputs/apk/debug/app-debug.apk)

---

## 3. Native Android Configuration

Added camera permission and feature declarations to [mobile/android/app/src/main/AndroidManifest.xml](file:///c:/MyProjects/SensAble/mobile/android/app/src/main/AndroidManifest.xml):

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-feature android:name="android.hardware.camera" android:required="false" />
```

---

## 4. Camera Feature Architecture

The camera functionality is encapsulated in `mobile/src/features/camera/`:

```
mobile/src/features/camera/
├── components/
│   └── SensableCameraView.tsx     <- Native VisionCamera preview wrapper component
├── services/
│   └── cameraService.ts           <- Isolated Camera permission checker & requester
├── hooks/
│   └── useCameraPermission.ts     <- Permission state machine hook
└── types.ts                       <- Abstract camera domain types
```

---

## 5. Lifecycle & Privacy Enforcement

- **Tab Blur / Unmount:** Camera preview is automatically paused and released when navigating away from the Translate tab (`useIsFocused()`).
- **App Backgrounding:** Responds to `AppState` (`active` -> `background`). Camera hardware is immediately released when SensAble is backgrounded or when the phone locks.
- **App Foregrounding:** Re-attaches native front camera preview when returning to the foreground.
- **Privacy Boundary:** 100% on-device preview. Zero video frames recorded, saved, or uploaded to external endpoints.
