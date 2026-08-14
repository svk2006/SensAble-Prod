# SensAble Onboarding Specification (Step 9A — V1 Camera Focused)

**Status:** Frozen Specification (Corrected Baseline)  
**Target Audience:** K-12 Students (Ages 8–18)  
**Visual Style:** SensAble Sensory Learning / Energetic Educational  
**Primary Font:** Quicksand  

---

## 1. Executive Summary & Flow Architecture

The SensAble onboarding experience introduces students to camera-based sign perception in three friendly, encouraging steps. It establishes trust, explains camera sign recognition without technical jargon, and provides accurate video privacy guarantees.

Camera permissions are **NOT** requested during onboarding; permissions are requested in context when the student opens the live camera translation viewport.

### Launch & Navigation Architecture
```
[App Launch]
     │
     ├── First Launch? (hasCompletedOnboarding == false)
     │         │
     │         └──> Onboarding Flow (Screen 1 → 2 → 3)
     │                   │
     │                   └──> Complete Onboarding
     │                             │
     │                             v
     └── Subsequent Launch ──────> Home (Translate Screen)
                                       │
                                       ├── Primary Bottom Navigation Tabs:
                                       │     1. Translate (Home Entry Destination)
                                       │     2. Learn
                                       │     3. Progress
                                       │     4. Settings
                                       │
                                       └── (Home is NOT a 5th bottom tab)
```

---

## 2. Onboarding Screen Specifications (V1 Camera Only)

The onboarding experience consists of **3 focused screens**. Each screen communicates exactly ONE primary concept.

---

### Screen 1: Welcome to SensAble

- **Primary Goal:** Welcome the student, introduce SensAble's core purpose, and build immediate excitement.
- **Header Title:** Welcome to SensAble
- **Subtitle / Hero Copy:** Turn signs into spoken words and learn at your own pace!
- **Illustration / Graphic Direction:** Friendly vector illustration of hands making sign gestures with dynamic Gloss chips (`[HELLO]`, `[WELCOME]`) floating around.
- **Progress Indicator State:** Step 1 of 3 (Active pill on position 1).
- **Primary CTA Label:** Next
- **Secondary CTA Label:** Skip (Navigates directly to Screen 3).
- **Student Tone:** Warm, approachable, inspiring.

#### Screen 1 Micro-Copy
- **Main Heading:** "Express Yourself Freely"
- **Body Text:** "SensAble translates your hand signs into clear speech and text instantly so everyone can understand."

---

### Screen 2: Sign With Your Camera

- **Primary Goal:** Explain camera-based sign perception in simple terms and reassure the student about camera privacy.
- **Header Title:** Sign With Your Camera
- **Subtitle / Hero Copy:** Show a sign and SensAble will help turn it into spoken English.
- **Illustration / Graphic Direction:** Vector visual card depicting a smartphone camera tracking 21 hand keypoints in real time with green landmark overlay.
- **Progress Indicator State:** Step 2 of 3 (Active pill on position 2).
- **Primary CTA Label:** Next
- **Secondary CTA Label:** Skip (Navigates directly to Screen 3).
- **Student Tone:** Clear, reassuring, empowering.

#### Screen 2 Micro-Copy
- **Main Heading:** "Instant Sign Perception"
- **Body Text:** "Just hold your hands in front of your camera. SensAble reads your gestures and builds sentences."
- **Privacy Callout Badge (Technically Accurate):** "🔒 Privacy First: Your video stays on your device. Video frames are never recorded or uploaded."

---

### Screen 3: You're All Set!

- **Primary Goal:** Celebrate completion and transition the student directly to the Home screen (Translate Tab).
- **Header Title:** You're All Set!
- **Subtitle / Hero Copy:** Ready to get started?
- **Illustration / Graphic Direction:** Celebrating student avatar with a bright Green success badge (`[READY!]`).
- **Progress Indicator State:** Step 3 of 3 (Active pill on position 3).
- **Primary CTA Label:** Start Signing
- **Secondary CTA Label:** *None* (Screen 3 requires explicit action to complete onboarding).
- **Student Tone:** Encouraging, confident, celebratory.

#### Screen 3 Micro-Copy
- **Main Heading:** "Ready to Explore"
- **Body Text:** "Tap below to enter SensAble and start translating your signs!"
- **Contextual Permission Note:** *"Camera access will be requested when you open the translation camera."*

---

## 3. Motion & Animation Choreography

SensAble onboarding motion strictly follows `docs/DESIGN_SYSTEM.md` motion tokens and respects system accessibility preferences.

```
Motion Language: Energetic Educational
Base Navigation Duration: 200ms (motionTokens.navigationMs)
Press Feedback: scale(0.96) (motionTokens.buttonPressScale)
Easing: cubic-bezier(0.25, 1, 0.5, 1) (Ease-out quad)
```

### Motion Sequence
1. **Screen Entrance (Fade In Up):**
   - Header & Illustration fade in and slide up slightly (`translateY: 12dp -> 0dp`, `opacity: 0 -> 1`) over 200ms.
   - Stagger: Title at 0ms, Illustration at 50ms, Body text at 100ms, Primary CTA at 150ms.
2. **Page Transitions (Fade In Right):**
   - Sliding to the next screen moves current screen left (`translateX: 0 -> -20dp`, opacity 0) while new screen slides in from right (`translateX: 20dp -> 0`, opacity 1) over 200ms.
3. **Progress Stepper Indicator:**
   - Active indicator pill smoothly expands width from 8dp to 24dp over 200ms with a soft spring ease.
4. **Completion Moment:**
   - On Screen 3 completion press, the primary CTA button scale pulses briefly (`scale: 0.96 -> 1.02 -> 1.0`) over 200ms before transitioning into the main app shell.
5. **Reduced Motion Accessibility:**
   - If `accessibilityState.reducedMotion` is enabled on the device, all slide and scale transforms are replaced with instant 100ms cross-fades.

---

## 4. Accessibility Specification

- **Minimum Touch Targets:** All interactive elements ("Next", "Skip", "Start Signing") enforce a minimum 48dp height and 48dp width.
- **Non-Color Dependent Stepper:** Progress stepper uses both color (SensAble Teal `#00A8A8` vs Slate `#E4E2DD`) AND shape (Active: 24dp x 8dp pill vs Inactive: 8dp x 8dp circle).
- **High-Contrast Typography:**
  - Dark Teal Text `#006A6A` on Light Background `#FBF9F4` (Contrast ratio 7.2:1 - AAA).
  - Primary Body Text `#1B1C19` on White Surface `#FFFFFF` (Contrast ratio 16.1:1 - AAA).
- **Screen Reader Navigation:**
  - Screen containers expose `accessibilityRole="header"` for main titles.
  - Stepper exposes `accessibilityLabel="Step X of 3"`.

---

## 5. Developer Reset Strategy (Development Only)

To test the onboarding flow during development without wiping app data:
- **Developer-Only Mechanism:** Onboarding reset will be available via developer builds (e.g. `__DEV__` flag toggle or hidden multi-tap gesture on the version number inside Settings).
- **Production Setting:** No visible "Replay Onboarding" control will exist in the production student UI.

---

## 6. Design Concept Evaluation Summary

| Concept | Structure | Visual Style | Verdict | Reason for Selection/Rejection |
| :--- | :--- | :--- | :--- | :--- |
| **Concept A: Storybook Canvas** | 4 Screens | Heavy illustrations, soft warm tone | *Rejected* | Slightly too passive; felt too young for older high school students. |
| **Concept B: Camera-Focused Stepper** | 3 Screens | V1 Camera focused, dynamic Gloss chips, video privacy guarantee | **SELECTED** | Ideal balance of energetic engagement, 100% camera focused for V1, accurate privacy wording. |
| **Concept C: Text-Heavy Wizard** | 3 Screens | Text-heavy, strict linear form | *Rejected* | Too clinical and unengaging for K-12 students. |
