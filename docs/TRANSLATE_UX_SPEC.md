# SensAble — Translate Experience UX & Design Specification (Step 10A)

**Status:** Frozen Design & UX Specification  
**Target Audience:** K-12 School Students (Ages 8–18)  
**Scope:** V1 Camera-Only Sign Language Perception & Translation  
**Primary Font:** Quicksand  

---

## 1. Product Vision & Executive Design Philosophy

The **Translate Screen** is the core functional experience of the SensAble mobile application. It enables real-time camera-based sign language recognition, gloss sequence building, and natural English sentence translation for school students.

V1 is **100% CAMERA ONLY**. Smart Glove, Bluetooth managers, and hardware mode toggles are intentionally excluded from V1 onboarding and translation viewports.

### Target Experience Qualities
- **Approachability:** Friendly, encouraging, and easy to understand within seconds.
- **Visual Dominance:** Camera viewfinder is the primary visual anchor (~45% screen height).
- **Zero Jargon:** Technical ML terms (*MediaPipe, Random Forest, inference, landmarks, API, Catalyst, Hugging Face*) are strictly translated into student-friendly micro-copy.
- **Privacy Trust:** Clear, technically accurate video privacy assurances (*"Your video stays on your device"*).

---

## 2. Primary Screen Composition & Layout Hierarchy

The Translate viewport is organized into a clean, top-to-bottom vertical hierarchy avoiding crowded card stacks:

```
┌─────────────────────────────────────────────────────────┐
│  Translate                                          🕒  │  <- Top Header (Title + Secondary History Icon)
├─────────────────────────────────────────────────────────┤
│                                                         │
│                [ Live Viewfinder Card ]                 │  <- Camera Viewport (~45% screen height)
│               🟢 Ready! Show a sign to camera           │  <- Floating 1.5s Pulsing Status Badge
│                                                         │
├─────────────────────────────────────────────────────────┤
│  Signs Detected:                               [Clear]  │
│  ┌──────┐ ┌──────┐ ┌──────┐                             │  <- Gloss Token Strip
│  │ [ME] │ │[WANT]│ │[WATER│                             │     (150ms slide-up animation)
│  └──────┘ └──────┘ └──────┘                             │
├─────────────────────────────────────────────────────────┤
│  SensAble Says:                                         │
│  "I would like some water."                             │  <- Natural English Sentence Result Card
│  [ 🔊 Listen ]                        [ Save Practice ] │     (250ms expand-down reveal)
├─────────────────────────────────────────────────────────┤
│  [Translate]    [Learn]    [Progress]    [Settings]     │  <- Primary 4-Tab Bottom Navigation
└─────────────────────────────────────────────────────────┘
```

---

## 3. Structural Composition Directions Evaluated

Three structural compositions were evaluated against the SensAble Sensory Learning design system:

| Direction | Composition Ratio | Strengths | Weaknesses | Verdict |
| :--- | :--- | :--- | :--- | :--- |
| **A. Camera Dominant** | 65% Camera / 35% Compact Output | Maximum camera view | Output text and TTS buttons feel cramped on smaller screens | *Rejected* |
| **B. Balanced Workspace** | 45% Camera / 50% Output & Gloss | Optimal camera view + clear Gloss chips + readable sentence & TTS | Perfect balance for 8–18 age range across all phone sizes | **SELECTED** |
| **C. Guided Full-Overlay** | 100% Full-Bleed Camera with floating cards | Immersive visual feel | Low text readability in bright classrooms or outdoor glare | *Rejected* |

**Selection:** **Direction B (Balanced Workspace)** is selected for V1.

---

## 4. In-Context First-Use Camera Permission Experience

Onboarding intentionally omits camera permission requests. When a student opens the Translate tab for the first time:

### Pre-Permission Explanation Card (Before Native Android Dialog)
- **Title:** "Camera Access Needed"
- **Body:** "SensAble uses your phone camera to see your hands and translate your signs."
- **Privacy Promise:** "🔒 Privacy First: Your video stays on your device. Video frames are never recorded or uploaded."
- **Primary CTA:** "Turn On Camera" (48dp touch target) -> Triggers Android native OS permission prompt.

### Permission States & Handling Matrix
1. **Permission Not Yet Requested:** Displays the Pre-Permission Explanation Card inside the camera container.
2. **Permission Granted:** Viewfinder initializes immediately with green status badge (*"Ready! Show a sign"*).
3. **Permission Denied (First Time):** Viewfinder card displays: *"Camera permission needed to recognize signs."* + *"Grant Permission"* primary button.
4. **Permission Permanently Denied (OS Blocked):** Viewfinder card displays: *"Camera access is turned off in Android settings. Tap below to open settings."* + *"Open Settings"* primary button.

---

## 5. Comprehensive 14-State Translation Experience Matrix

The Translate experience covers 14 operational UX states:

| # | State Name | Viewfinder / Container Feedback | Status Badge | Gloss Strip | Natural Sentence Card | Primary Action | Secondary Action |
| :- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | **Permission Required** | Pre-permission explanation card with privacy icon. | Neutral: *"Camera Off"* | Empty placeholder: *"Your signs will appear here"* | Empty state: *"SensAble sentence will appear here"* | *"Turn On Camera"* | Open Settings |
| **2** | **Camera Ready** | Active viewfinder, subtle guide frame. | Green Pulse (1.5s): *"Ready! Show a sign"* | Active Gloss strip ready | Idle placeholder card | Gesture to camera | Stop Camera |
| **3** | **Looking for Hand** | Active viewfinder, guide frame overlay. | Amber: *"Place hands in frame"* | Existing Glosses retained | Current sentence retained | Adjust hand position | Stop Camera |
| **4** | **Hand Detected** | 21-keypoint Bright Green landmark skeleton (`#2ECC71`) overlaid on hand. | Green Active: *"Hand Visible"* | Existing Glosses retained | Current sentence retained | Complete sign gesture | Stop Camera |
| **5** | **Recognizing** | Landmark skeleton lights up bright green + subtle tick pulse. | Green Active: *"Recognizing..."* | Existing Glosses retained | Current sentence retained | Finish gesture | Stop Camera |
| **6** | **Gloss Recognized** | Green flash pulse on landmark skeleton. | Green Success: *"Sign Recognized!"* | New Gloss Chip (e.g. `[ME]`) slides up (150ms) | Idle placeholder card | Continue signing | Tap *"Clear"* |
| **7** | **Multiple Glosses** | Active viewfinder, green keypoints. | Green Active: *"Signing..."* | Gloss Chips sequence: `[ME] [WANT] [WATER]` | Card displays: *"Tap Translate when ready"* | Tap *"Translate"* or continue | Tap *"Clear"* |
| **8** | **Phrase Finalizing** | Idle viewfinder guide box. | Amber: *"Finalizing phrase..."* | Full Gloss sequence highlighted with soft teal glow | Sentence card displays animated shimmer: *"Building sentence..."* | Auto-finalizes after 1.5s idle | Tap *"Cancel"* |
| **9** | **Translating** | Static viewfinder overlay. | Teal Pulse: *"Refining sentence..."* | Sequence locked | Sentence card shimmer pulse | Wait for translation | Tap *"Cancel"* |
| **10**| **Translation Success**| Active camera ready for next phrase. | Green Success: *"Translation Ready!"* | Sequence completed | Sentence card expands (250ms): *"I would like some water."* | Tap *"🔊 Listen"* (TTS) | Tap *"Save Practice"* or *"Clear"* |
| **11**| **Speaking (TTS Active)**| Active camera. | Teal Active: *"Speaking sentence..."* | Completed sequence | Sentence card speaker button displays animated soundwave ring | Tap *"Stop Audio"* | Tap *"Clear"* |
| **12**| **Low-Confidence Retry**| Viewfinder guide box. | Amber Warning: *"Try that sign once more"* | Last Gloss highlighted in Amber | Sentence card prompt: *"Sign not quite recognized. Try signing again!"* | Re-sign gesture | Tap *"Clear"* |
| **13**| **Translation Failure**| Viewfinder active. | Coral Alert: *"Translation timeout"* | Raw Gloss sequence preserved (`[ME] [WANT] [WATER]`) | Card displays: *"Sentence translation taking longer than usual."* | Tap *"Retry Translation"* | Tap *"View Raw Glosses"* |
| **14**| **Camera Error** | Viewfinder replaced with alert card. | Error Badge: *"Camera unavailable"* | Empty | Empty | Tap *"Restart Camera"* | Open Settings |

---

## 6. Student Micro-Copy Dictionary

Technical debug strings and internal state names are strictly prohibited in the student UI:

| Internal / Technical State | Student-Facing Friendly Micro-Copy |
| :--- | :--- |
| `NO_HAND_DETECTED` | *"Place your hands clearly inside the frame."* |
| `LOW_CONFIDENCE_THRESHOLD` | *"Try that sign once more."* |
| `NETWORK_TIMEOUT` | *"Sentence translation taking longer than usual. Tap Retry."* |
| `CAMERA_PERMISSION_DENIED` | *"SensAble needs camera access to see your signs."* |
| `MODEL_INITIALIZING` | *"Getting SensAble camera ready..."* |
| `SEQUENCE_FINALIZED` | *"Building your sentence..."* |

---

## 7. Motion & Animation Specification (Animotion)

SensAble Translate motion strictly adheres to `docs/DESIGN_SYSTEM.md` motion tokens and respects reduced-motion accessibility:

- **Camera Status Badge Pulse:** 1500 ms gentle rhythmic pulse (`Pulsate Ring`) around the green status badge (*"Ready! Show a sign"*).
- **Gloss Token Entrance:** 150 ms slide-up and fade-in (`Slide In Up`) when a new `GlossChip` enters the horizontal strip.
- **Sequence Finalization Glow:** 200 ms soft teal glow pulse on the Gloss sequence strip.
- **Sentence Result Reveal:** 250 ms expand-down and fade-in card reveal when natural English text is returned.
- **TTS Speaking Feedback:** Animated pulsing soundwave ring around the speaker button while audio plays.
- **Sequence Clear:** 150 ms scale-down fade-out when the student taps *"Clear"*.
- **Reduced Motion Behavior:** When `prefers-reduced-motion` is active, all slide, scale, and pulse animations swap to instantaneous 0ms / cross-fade state changes.

---

## 8. Accessibility & Responsive Layout Rules

- **Touch Targets:** All primary actions (*"Turn On Camera"*, *"Clear"*, *"Listen"*, *"Translate"*, *"Retry"*) enforce a **minimum 48×48 dp** touch boundary.
- **Contrast & Text Variants:** Light background (`#FBF9F4`) uses dark text variants (`#006A6A` Dark Teal, `#A43B2D` Dark Coral, `#006D37` Dark Green, `#1B1C19` Primary Charcoal) for AAA contrast compliance.
- **Screen Reader Semantics:**
  - Viewfinder exposes `accessibilityLabel="Live Camera Viewfinder"`.
  - Status badges expose live region updates (`accessibilityLiveRegion="polite"`).
  - Gloss strip announces `"Sign detected: [ME]"`.
- **System Inset Respect:** Viewport padding dynamically factors `useSafeAreaInsets()` to prevent any overlap with Android 3-button or gesture navigation bars.
