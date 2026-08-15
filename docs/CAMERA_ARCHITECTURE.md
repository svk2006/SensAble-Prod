# SensAble — Camera Architecture & Implementation Specification (Step 10C.3 Completed)

**Status:** Step 10C.3 UX Polish & Stability Completed  
**Target RN Version:** React Native `0.87.0` (React `19.2.3`, New Architecture / Fabric enabled)  
**Target Android Environment:** Android SDK 35 (JDK 21 JBR, Gradle 9.4.1, AGP 8.8.0, NDK 27.1)  
**Scope:** Production-Quality Front Camera UX, Lifecycle Choreography & Stability Foundation  

---

## 1. Installed Package Specification

The exact camera engine dependencies remain unchanged:

- **Main Package:** `react-native-vision-camera@5.2.0`
- **Installed Nitro Dependencies:**
  - `react-native-nitro-modules@^0.36.5`
  - `react-native-nitro-image@^0.15.1`

---

## 2. Verified Android Build Result

- **Build Command:** `$env:JAVA_HOME="C:\Program Files\Android\Android Studio\jbr"; cd android; .\gradlew assembleDebug`
- **Compilation Status:** **`BUILD SUCCESSFUL`**
- **Output Debug APK Location:** [mobile/android/app/build/outputs/apk/debug/app-debug.apk](file:///c:/MyProjects/SensAble/mobile/android/app/build/outputs/apk/debug/app-debug.apk)

---

## 3. Native Android Configuration

Camera permissions and features declared in [mobile/android/app/src/main/AndroidManifest.xml](file:///c:/MyProjects/SensAble/mobile/android/app/src/main/AndroidManifest.xml):

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-feature android:name="android.hardware.camera" android:required="false" />
```

---

## 4. Camera Feature Architecture

The camera functionality is encapsulated in `mobile/src/features/camera/` and `mobile/src/features/translate/`:

```
mobile/src/features/camera/
├── components/
│   └── SensableCameraView.tsx     <- Native VisionCamera preview wrapper with fade-in choreography & error handling
├── services/
│   └── cameraService.ts           <- VisionCamera permission status mapping ('not-determined', 'authorized', 'denied')
├── hooks/
│   └── useCameraPermission.ts     <- Permission hook with AppState auto-refresh
└── types.ts                       <- Abstract camera domain & UX types (CameraUXState, CameraPermissionState)

mobile/src/features/translate/
└── components/
    └── CameraViewportCard.tsx     <- 7-state camera card component with status badge & accessibility
```

---

## 5. Truthful 7 Visual Camera States

1. **`permission-required`**: Initial state before student requests camera. Card displays clear explanation and 48dp "Turn On Camera" button. Badge: `"Camera is off"` (neutral).
2. **`requesting-permission`**: State while OS system permission dialog is displayed. Action button displays `"Requesting..."`. Badge: `"Requesting..."`.
3. **`camera-starting`**: Permission granted, hardware initializing. Dark backdrop surface active with activity indicator. Badge: `"Starting camera..."` (warning).
4. **`camera-ready`**: Native frame received via `onPreviewStarted`. Preview surface smoothly fades in (200ms or 0ms with reduced motion). Badge: `"Ready! Show a sign"` (success).
5. **`permission-denied`**: User denied permission once (retryable). Card displays friendly microcopy `"SensAble needs camera access to see and translate your signs."` and 48dp `"Try Again"` button. Badge: `"Permission Required"` (warning).
6. **`permanently-blocked`**: Permission denied with "Don't ask again" / restricted in OS. Card displays `"Camera access is turned off in your device settings."` and 48dp `"Open Settings"` button (`Linking.openSettings()`). Badge: `"Blocked in Settings"` (warning).
7. **`camera-unavailable/error`**: Hardware failure or native initialization exception. Card displays friendly microcopy `"Camera couldn't start. Let's try starting your camera again."` and 48dp `"Retry Camera"` button. Badge: `"Camera Error"` (error).

---

## 6. Lifecycle & Privacy Enforcement

- **Navigation Tab Blur / Unmount:** Camera hardware is immediately released when navigating away from Translate tab (`isFocused === false`). Hardware preview resumes cleanly when returning.
- **Ordinary App Background / Foreground:** Responds to `AppState` (`active` -> `background`). Hardware is paused when backgrounded or phone locked, and resumes cleanly upon returning to foreground without losing permission state.
- **App Termination / Swipe-away:** Native camera context is cleaned up by the operating system.
- **Activation Choreography:** Surface loading -> native frame arrival (`onPreviewStarted`) -> smooth fade-in reveal -> badge shift to ready. Zero blank/white flashes, zero layout shifts.
- **Privacy Boundary:** 100% on-device live preview. Zero frame processing, zero ML, zero MediaPipe, zero network uploads.

