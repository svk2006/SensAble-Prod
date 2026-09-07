# SensAble

SensAble is an accessible, practice-focused sign language learning application designed primarily for deaf, mute, and non-speaking school students who already know sign language but do not get enough opportunities to practice it regularly. The app turns sign language practice into an interactive learning experience that can also be used by enthusiasts who want to learn sign language.

## What SensAble Solves

Many sign language learners understand the basics but struggle to practice regularly. School students in particular may have limited opportunities to practice with other signers. SensAble provides an accessible environment where they can practice independently, receive feedback, and gradually build confidence.

The application is designed around practice rather than passive content consumption.

## Target Users

- Deaf and mute students who use sign language.
- Non-speaking students who communicate using sign language.
- School students who want a structured way to practice.
- Learners who already know signs but need regular reinforcement.
- Sign language enthusiasts who want to learn and practice.

## Key Features

### Onboarding
A student-oriented onboarding flow introduces the application and establishes the initial learning experience.

### Learning Experience
The app is structured around a dedicated translation and learning experience. The interface is designed to make practice clear, visual, and approachable.

### Camera-Based Sign Practice
The camera is used as the input for sign practice. The current implementation uses a dedicated native CameraX pipeline instead of passing raw camera frames through JavaScript.

### Real-Time Hand Perception
SensAble uses MediaPipe Hand Landmarker to detect hands and extract hand landmarks from live camera frames.

Current capabilities:
- Live camera frames
- Up to two hands
- 21 landmarks per detected hand
- Handedness classification
- Landmark coordinates
- LIVE_STREAM inference
- CPU-based inference
- Native frame processing

### Live Skeleton Visualization
Detected landmarks are rendered as a hand skeleton over the camera preview, including landmark nodes and anatomical connections.

The coordinate transformation layer accounts for camera sensor rotation, front-camera mirroring, viewport scaling, and aspect-fill cropping.

### Feedback-Oriented Practice
The perception pipeline is the foundation for future sign comparison and learning feedback. Perception is separated from the learning UI so recognition and scoring can be added without rebuilding the camera layer.

## Current Implementation Status

### Implemented and verified

- React Native application shell
- Student onboarding experience
- Onboarding launch state and persistence
- Camera experience foundation
- Dedicated native CameraX perception view
- CameraX Preview + ImageAnalysis pipeline
- Native MediaPipe Hand Landmarker integration
- Official Hand Landmarker model asset
- LIVE_STREAM inference
- Detection of up to two hands
- 21 landmarks per hand
- Handedness output
- Native-to-JavaScript landmark event delivery
- Latest-frame perception state management
- Live landmark skeleton overlay
- Coordinate transformation for the current camera/view configuration
- Physical-device verification of hand detection
- Physical-device verification of landmark movement and overlay alignment
- TypeScript validation
- Android debug build verification

### Current technical boundary

The current system successfully detects and visualizes hand landmarks. Full sign-language recognition, sign classification, vocabulary evaluation, scoring, progression logic, and a complete practice curriculum are not claimed as completed by this implementation stage.

## Architecture

```text
                    ┌─────────────────────────┐
                    │       SensAble App      │
                    │      React Native       │
                    └────────────┬────────────┘
                                 │
                    ┌────────────▼────────────┐
                    │     Learning / UI       │
                    │  Onboarding + Practice  │
                    └────────────┬────────────┘
                                 │
                         Landmark events only
                                 │
                    ┌────────────▼────────────┐
                    │  Perception RN Layer    │
                    │                          │
                    │ useHandPerception        │
                    │ Landmark Transformer     │
                    │ Skeleton Overlay         │
                    └────────────┬────────────┘
                                 │
                           Native View
                                 │
              ┌──────────────────▼──────────────────┐
              │     Native SensAble Perception     │
              │              CameraX                │
              │                                    │
              │      Preview + ImageAnalysis       │
              └──────────────────┬─────────────────┘
                                 │
                           ImageProxy frame
                                 │
                            toBitmap() copy
                                 │
                         imageProxy.close()
                                 │
                    ┌────────────▼────────────┐
                    │    MediaPipe Tasks     │
                    │     HandLandmarker     │
                    │       LIVE_STREAM      │
                    └────────────┬────────────┘
                                 │
                    Hand landmarks + handedness
                                 │
                    ┌────────────▼────────────┐
                    │  Landmark Event Payload │
                    │ timestamp               │
                    │ image metadata           │
                    │ hand detections          │
                    │ 21 landmarks / hand     │
                    └─────────────────────────┘
```

## Camera Frame Lifecycle

A critical design decision is to keep the lifetime of camera buffers inside the native analyzer.

```text
CameraX
   │
   ▼
ImageProxy
   │
   ├──► toBitmap()
   │       │
   │       ▼
   │   Independent Bitmap
   │       │
   │       ▼
   │    MediaPipe MPImage
   │
   └──► imageProxy.close()
           │
           ▼
      Camera buffer returned

MediaPipe
   │
   ▼
HandLandmarker.detectAsync()
   │
   ▼
Detection callback
   │
   ▼
Landmark payload
   │
   ▼
React Native
```

This avoids keeping an `ImageProxy` alive after the analyzer callback and keeps raw frame data out of the JavaScript bridge.

## Coordinate Transformation

The current camera setup produces raw frames with a 270° sensor rotation and uses the front camera. The transformation pipeline converts MediaPipe normalized coordinates into display viewport coordinates.

```text
MediaPipe normalized coordinates
              │
              ▼
       Sensor rotation
              │
              ▼
       Front-camera mirror
              │
              ▼
      Aspect-fill scaling
              │
              ▼
          Crop offset
              │
              ▼
      Viewport pixel position
              │
              ▼
        SVG skeleton
```

The transformation is isolated in `landmarkTransformer.ts`, making it easier to test and modify independently from the camera and perception layers.

## Project Structure

```text
SensAble/
├── mobile/
│   ├── android/
│   │   └── app/
│   │       ├── src/main/
│   │       │   ├── assets/
│   │       │   │   └── hand_landmarker.task
│   │       │   └── java/com/com.sensable.app/
│   │       │       └── perception/
│   │       │           ├── SensAblePerceptionView.kt
│   │       │           ├── SensAblePerceptionViewManager.kt
│   │       │           └── SensAblePerceptionPackage.kt
│   │       └── build.gradle
│   │
│   └── src/
│       └── features/
│           ├── camera/
│           │   └── components/
│           │       └── SensAblePerceptionView.tsx
│           ├── perception/
│           │   ├── components/
│           │   │   └── HandLandmarkOverlay.tsx
│           │   ├── hooks/
│           │   │   └── useHandPerception.ts
│           │   ├── utils/
│           │   │   └── landmarkTransformer.ts
│           │   └── types.ts
│           └── translate/
│               └── components/
│                   └── CameraViewportCard.tsx
│
└── README.md
```

## Technology Stack

| Layer | Technology |
|---|---|
| Mobile framework | React Native 0.87.0 |
| UI runtime | React 19.2.3 |
| Android architecture | React Native New Architecture / Fabric |
| Camera | Android CameraX |
| Perception | MediaPipe Tasks Vision |
| Hand model | MediaPipe Hand Landmarker |
| Native language | Kotlin |
| Frontend language | TypeScript / TSX |
| Android minimum SDK | 24 |
| Android NDK | 27.1.12297006 |
| MediaPipe mode | LIVE_STREAM |
| MediaPipe delegate | CPU |
| Maximum hands | 2 |

## Verification

The perception pipeline has been verified on a physical Samsung SM-A156E device.

Reported runtime measurements include:
- Camera frames arriving at approximately 25 FPS.
- MediaPipe inference callbacks at approximately 8–9 Hz on CPU.
- Inference latency around 131–163 ms in the reported test.
- Zero hands when no hand is present.
- One hand with 21 landmarks.
- Two hands with 42 landmarks.
- Landmark coordinates changing as the hand moves.
- Landmark skeleton alignment with the physical hand after coordinate transformation.
- ImageProxy buffers being closed after native bitmap conversion.

Build verification passed with:

```bash
npx tsc --noEmit
```

and:

```bash
cd mobile/android
.\gradlew assembleDebug
```

## Development

From the repository root:

```bash
cd mobile
npm install
```

Start Metro:

```bash
npx react-native start
```

In another terminal:

```bash
cd mobile
npx react-native run-android
```

For Android debug builds:

```bash
cd mobile/android
.\gradlew assembleDebug
```

The generated APK is normally located at:

```text
mobile/android/app/build/outputs/apk/debug/app-debug.apk
```

## Testing on a Physical Device

Enable USB debugging, connect an Android phone, and verify:

```bash
adb devices
```

Then install:

```bash
adb install -r mobile/android/app/build/outputs/apk/debug/app-debug.apk
```

For runtime diagnostics:

```bash
adb logcat
```

The perception pipeline uses the native `SensAblePerception` log tag for diagnostics.

## Emulator Development

The project can also be run on an Android emulator for UI and general application development. Depending on the configured AVD, the emulator can expose a virtual camera or route a host webcam.

Camera and real-time hand-perception behavior should ultimately be verified on a physical Android device because emulator camera behavior and performance may differ from the target device.

## Architecture Principles

1. Keep raw camera frames native.
2. Avoid unnecessary JS/native frame transfers.
3. Keep camera-buffer ownership explicit.
4. Separate perception from presentation.
5. Emit compact landmark data rather than raw images.
6. Isolate coordinate transformation logic.
7. Keep the learning layer independent of the camera implementation.
8. Verify major native stages with runtime evidence rather than build success alone.

## Roadmap

```text
Hand Landmarks
      │
      ▼
Feature Extraction
      │
      ▼
Sign Representation
      │
      ▼
Sign Recognition
      │
      ▼
Expected vs Actual Comparison
      │
      ▼
Practice Feedback
      │
      ▼
Progress / Scoring
      │
      ▼
Personalized Learning
```

The recognition and learning layers can be developed above the perception layer without routing raw camera frames through React Native.

## Project Philosophy

SensAble is intended to make sign-language practice more accessible, consistent, and engaging for students. The goal is not simply to show a camera feed or detect a hand. The perception system is a foundation for an interactive learning experience where users can practice signs, receive meaningful feedback, and build confidence through regular use.

## Implementation Status

```text
Application Shell              ████████████████████  Complete
Onboarding                     ████████████████████  Complete
Camera Foundation              ████████████████████  Complete
Native CameraX Pipeline        ████████████████████  Complete
MediaPipe Hand Detection       ████████████████████  Complete
Landmark Extraction            ████████████████████  Complete
Live Skeleton Overlay          ████████████████████  Complete
Coordinate Alignment           ████████████████████  Verified
Sign Recognition               ░░░░░░░░░░░░░░░░░░░░  Next stage
Sign Evaluation                ░░░░░░░░░░░░░░░░░░░░  Next stage
Scoring / Progression          ░░░░░░░░░░░░░░░░░░░░  Next stage
Full Practice Curriculum       ░░░░░░░░░░░░░░░░░░░░  Next stage
```

## Important Note

The current implementation status is intentionally separated from the future roadmap. A working hand-landmark detector is not the same thing as a complete sign-language recognition system. SensAble currently has a verified native perception foundation and live visualization layer, which are the building blocks for the next recognition and learning stages.
