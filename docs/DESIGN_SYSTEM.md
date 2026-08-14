# SensAble — Design System Guidelines & Principles

## 1. Executive Design Philosophy
SensAble’s design system prioritizes an **engaging, friendly, highly usable, modern, accessible, and polished** mobile experience tailored specifically for K-12 school students. The interface blends minimalism with tactile softness, using purposeful color and generous whitespace to reduce cognitive anxiety during real-time sign recognition.

> **Design System Specification:** Established during the design phase under the theme **SensAble Sensory Learning**. The visual direction balances approachable visual elements for younger students (ages 8–12) with a modern, non-childish visual aesthetic suited for secondary students (ages 13–18).

---

## 2. Target Student Audience & Ergonomics
- **Age Appropriateness:** K-12 students (ages 8–18). Avoids clinical or overly corporate styles while strictly preventing infantile imagery.
- **Touch Ergonomics:** All primary action buttons and mode toggles enforce a minimum touch target boundary of **48×48 dp**.
- **One-Handed Usability:** Key interactive controls (mode switcher, TTS play button, clear sequence action) are positioned within easy thumb reach on standard Android phone viewports.
- **Instant Visual Feedback:** High-contrast visual state indicators (pulsing green landmark skeletons, animated Gloss token chips) provide instant confirmation during gesturing.
- **Optional & Configurable Haptics:** Haptic feedback (tactile pulses on sign detection or button tap) is **optional, accessibility-aware, user-configurable** in Settings, and **never required for core application functionality**. The application remains 100% usable with haptics disabled.

---

## 3. Selected Visual Direction
- **Direction Selected:** **Energetic Educational** (*SensAble Sensory Learning*).
- **Rationale:** Evaluated against *Calm Modern Assistive* (too clinical/low energy) and *Playful Premium Learning* (dark-mode heavy with potential outdoor glare). The *Energetic Educational* direction delivers optimal contrast, encouraging visual warmth, and long-term usability across classroom and personal environments.
- **Visual Personality:** Approachable, vibrant, modern, tactile, and non-generic.

---

## 4. Typography System

- **Primary Font Family:** **Quicksand** (Google Fonts sans-serif).
  - **Selection Rationale:** Selected specifically for its approachable visual personality, friendly rounded forms, clear letterforms, and suitability for a student-oriented visual identity.
  - **Accessibility Validation Rule:** Accessibility and legibility must be validated through actual mobile implementation and user testing rather than assumed from typeface choice.
- **Typographic Scale (Initial Baseline):**
  - **Display / Header LG:** Quicksand Bold, 32px / 40px line-height (Mobile).
  - **Headline MD:** Quicksand Bold, 24px / 32px line-height.
  - **Gloss Token Text:** Quicksand SemiBold, 18px / 24px line-height (ALL CAPS, clear letter spacing).
  - **Translated Sentence Text:** Quicksand Medium, 18px / 28px line-height (conversational English reading).
  - **Body / Label Text:** Quicksand Medium/Bold, 14px–16px / 24px line-height.
  - **Caption / Status Badge:** Quicksand Bold, 12px / 16px line-height.

---

## 5. Color System & Accessibility Rules

### 5.1 Palette Specification
- **Background (Low Glare):** Soft Off-white (`#FBF9F4`). Reduces eye strain during extended study sessions.
- **Surface Elevation (Cards):** Clean Pure White (`#FFFFFF`) with soft ambient shadows (`0px 4px 20px`, 5% opacity).
- **Primary Brand Accent:** **Vibrant Teal** (`#00A8A8`).
- **Secondary Accent:** **Warm Coral** (`#FF7F6B`).
- **Sensory & Active Indicator:** **Bright Green** (`#2ECC71`).
- **Semantic Warning / Attention:** **Warm Amber** (`#F59E0B`). Used for non-fatal guidance prompts (e.g., *"No hands visible"* or low battery).

### 5.2 Accessibility & Text Contrast Rules
Bright accent colors (`#00A8A8`, `#FF7F6B`, `#2ECC71`, `#F59E0B`) are primarily visual and accent colors. They are used for:
- Icons and graphical symbols
- Status indicators and landmark dots
- Badges and chip backgrounds
- Active visual state highlights
- Large decorative elements

For normal text elements on light surfaces, **darker text color variants** must be used whenever accessible text contrast is required:
- **Dark Teal Text Variant:** `#006A6A` (used for teal-themed text and labels).
- **Dark Coral Text Variant:** `#A43B2D` (used for coral-themed text and labels).
- **Dark Green Text Variant:** `#006D37` (used for green status text and success labels).
- **Dark Warning Text Variant:** `#B45309` (used for amber warning/attention text and prompt labels).
- **Primary Body Text:** Dark Charcoal (`#1B1C19`).
- **Secondary Body Text:** Dark Slate (`#3C4949`).

> **Validation Guardrail:** Universal WCAG AA compliance must NOT be claimed generically. Do not claim WCAG compliance for the Warning color or any other color until its specific foreground/background text pair is validated during implementation.

---

## 6. Shape & Component Language

- **Card Elevation & Radius:** Cards serve as content containers featuring a **24px corner radius** and **24px internal padding**. Monolithic gray boxes are strictly prohibited.
- **Interactive Component Radius:** Buttons and input fields use a **16px corner radius**.
- **Chips & Badges:** Gloss Tokens and status tags use a **full pill radius (9999px)**.
- **Hand Landmark Overlay:** Rendered as 6px Bright Green dots (`#2ECC71`) connected by 2px lime joint vectors overlaid directly on the camera viewfinder card.

---

## 7. Motion & Animation Tokens (Animotion Guidelines)

The following parameters serve as **initial design tokens**, not immutable implementation constraints:

- **Navigation Transitions:** Smooth **200 ms** lateral slide on tab selection.
- **Button Press Feedback:** Tactile **0.96 scale** compression with ambient shadow reduction on press.
- **Camera Active State Pulse:** Gentle **1.5 seconds** pulsing ring around the green camera status badge (*"Ready! Show a sign"*).
- **Gloss Token Entrance:** **150 ms** slide-up and fade-in when a newly recognized `GlossToken` chip enters the active sequence strip.
- **Translation Result Reveal:** Smooth **250 ms** expand-down card reveal when natural English text is returned.

> **Accessibility Rule for Motion:** All UI animations must respect Android system accessibility settings, disabling or simplifying motion when the user enables reduced-motion preferences (`prefers-reduced-motion`).

---

## 8. Detailed Translate Screen State Specifications

The Translate Screen is the primary recognition interface. The table below specifies the intended user experience across all 12 operational states:

| # | State Name | What the Student Sees | Primary Action | Secondary Action | Relevant Feedback | Loading / Error Behavior |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | **Idle State** | Mode switcher set to Camera, empty viewfinder card, friendly prompt banner. | Tap *"Start Camera"* or switch to *"Glove Mode"*. | Open Vocabulary / Settings. | Neutral status badge (*"Camera Off"*). | None. Static idle presentation. |
| **2** | **Camera Active State** | Live camera viewfinder, 1.5s pulsing green status badge (*"Ready! Show a sign"*). | Gesture to camera. | Tap *"Stop Camera"* or toggle mode. | Continuous 30 FPS viewfinder rendering. | Low-latency camera initialize indicator. |
| **3** | **No Hand Detected** | Active camera viewfinder with subtle bounding guide box. Status: *"Place hands in frame"*. | Adjust hand position relative to camera. | Tap *"Stop Camera"*. | Semantic Warning Amber badge (`#F59E0B` / text `#B45309` *"No hands visible"*). | Guidance micro-copy updates dynamically. |
| **4** | **Sign Detected** | Green 21-keypoint landmark skeleton overlaid on detected hand. Status: *"Recognizing..."*. | Complete sign gesture. | Tap *"Stop Camera"*. | Landmark skeleton lights up bright green (`#2ECC71`) with optional haptic pulse. | Instant (< 30ms) keypoint rendering. |
| **5** | **Gloss Sequence Building** | Detected Gloss Chip (e.g., `[ME]`) enters Gloss strip with 150ms slide-up animation. | Continue gesturing or tap *"Translate"*. | Tap *"Clear"* to reset sequence. | Subtle chip shimmer + optional haptic tick on each new gloss arrival. | Sequence auto-finalizes after 1.5s idle timeout. |
| **6** | **Translation Processing** | Gloss sequence highlighted; sentence card displays animated skeleton pulse (*"Refining sentence..."*). | Wait for cloud NLP response. | Tap *"Cancel"*. | Smooth pulse indicator on sentence card. | Network request to Catalyst secure gateway. |
| **7** | **Translation Success** | Natural English text card revealed (250ms animation): *"I am going to school."* | Tap *"Audio / Speaker"* to play TTS. | Tap *"Save to Practice"* or *"Clear"*. | Green success accent border; TTS speaks sentence aloud if auto-play enabled. | Complete. Card remains until cleared or new sequence starts. |
| **8** | **Translation Failure** | Raw Gloss sequence preserved (`[ME] [GO] [SCHOOL]`); alert card: *"Translation taking longer than usual."* | Tap *"Retry Translation"*. | Tap *"View Raw Glosses"*. | Soft red/coral alert border (`#A43B2D`). | Non-blocking retry button; Gloss data retained. |
| **9** | **Camera Permission Denied** | Camera viewfinder replaced with friendly graphic card: *"Camera permission needed to recognize signs."* | Tap *"Grant Permission"* (opens Android Settings). | Switch to *"Glove Mode"*. | Clear non-intimidating explanation card. | No hardware initialization attempted until granted. |
| **10**| **Glove Disconnected** | Mode switcher set to Glove; status badge: *"Glove Disconnected"*; illustration card. | Tap *"Connect Glove"*. | Switch to *"Camera Mode"*. | Red/coral connection badge. | Reconnection banner with 1-tap trigger. |
| **11**| **Glove Connecting** | Glove card showing animated connection ring: *"Connecting to Glove via Bluetooth..."*. | Wait for Bluetooth RFCOMM pairing. | Tap *"Cancel"*. | Pulsing blue/teal status badge. | 10-second timeout guardrail with retry prompt if un-paired. |
| **12**| **Glove Connected** | Glove card showing green battery/signal badge: *"Glove Ready! Flex fingers to sign."*. | Flex fingers / gesture with glove. | Tap *"Disconnect"*. | Green active badge (`#006D37`) + optional subtle vibration on receipt of sensor stream. | Continuous local sensor vector parsing. |

---

## 9. Student Micro-Copy & Non-Technical Guidance

Technical debug strings or hardware jargon are strictly prohibited in the student UI.

| Technical / Internal Event | Student-Facing Friendly Micro-Copy |
| :--- | :--- |
| `Bluetooth RFCOMM disconnected` | *"Your glove is disconnected. Let's reconnect it!"* |
| `MediaPipe model inference active` | *"Ready! Show a sign to the camera."* |
| `Hugging Face API request timeout` | *"Sentence translation taking longer than usual. Tap Retry."* |
| `Landmark tracking lost` | *"Place your hands clearly inside the frame."* |
| `Glove ADC calibration reset` | *"Calibrating glove sensors... Flex your fingers!"* |

---

## 10. Navigation Principles & Key Screens

### 10.1 Bottom Navigation Bar
The application uses **four primary bottom navigation destinations** featuring high-contrast icons, 48dp touch targets, and active indicator pills:

1. **Translate:** Camera / Glove real-time sign recognition, gloss sequence building, and natural English sentence translation.
2. **Learn:** Interactive student vocabulary practice, sign dictionary, and learning modules.
3. **Progress:** Student practice streak counter, mastered signs grid, and learning achievements.
4. **Settings:** Glove Bluetooth manager (`glove/`), camera permissions toggle, contrast/haptics settings, and student profile.

> **Navigation Boundary Rule:** Translation History is **NOT** a primary bottom navigation destination. It is accessible as a secondary action from within the Translate screen (e.g., top header action icon) or contextually related screens.

### 10.2 Core Screen Definitions
- **Onboarding Screen:** Welcome illustration, choice between Camera Mode and Smart Glove Mode, "Get Started" primary button.
- **Translate Screen:** Segmented mode bar, Viewfinder/Glove card, Gloss chip strip, Sentence output card with TTS, secondary History access icon.
- **Learn Screen:** Categorized sign practice cards (Alphabet, Phrases, School Words).
- **Progress Screen:** Practice streak counter, mastered signs grid, and daily learning goals.
- **Settings Screen:** Bluetooth pairing manager, camera permissions toggle, haptics toggle, contrast settings, and student profile.

---

## 11. Anti-Generic AI UI Prevention Rules

To ensure SensAble avoids generic, uninspired AI-generated dashboard templates, the following rules are strictly enforced:

1. **No Monolithic Gray Cards:** Avoid default neutral gray background boxes with sharp corners. Use custom card radiuses (24px) and soft ambient shadows.
2. **No Excessive Cards:** Do not stack dozens of small nested card widgets on a single screen. Limit each viewport to 2–3 clear functional cards.
3. **No Meaningless Decorative Elements:** Do not add random floating shapes, decorative background blobs, or glassmorphic blurs that distract from sign recognition.
4. **No Excessive Gradients:** Avoid heavy rainbow or multi-color gradients. Use flat surface colors with subtle tonal layering.
5. **No Random or Inconsistent Icons:** Use icons strictly from a unified vector set with consistent stroke weights.
6. **No Unnecessary Statistics or Dashboards:** Do not turn the student app into a cluttered analytics dashboard with line charts and complex metrics.
7. **No Technical Language:** Strictly map all technical hardware and network events to friendly student micro-copy (Section 9).
8. **No Excessive Animation:** Restrain motion to functional state transitions (Section 7).
