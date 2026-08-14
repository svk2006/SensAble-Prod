# SensAble — Project Context & Product Specification

## 1. Document Overview
This document defines the high-level purpose, vision, target user profile, core experience, scope boundaries, technology stack, and operational constraints for **SensAble**. It serves as the primary reference for product intent and technical alignment throughout development.

---

## 2. Project Purpose
SensAble is an accessible, real-time sign language translation and learning ecosystem designed to bridge the communication gap between deaf or hard-of-hearing individuals and hearing peers. By utilizing mobile device cameras and custom sensor-enabled smart gloves, SensAble translates Sign Language signs (glosses) into fluent, natural spoken/written English while providing an engaging learning platform.

---

## 3. Product Vision
To empower school students with a modern, friendly, and non-stigmatizing tool that makes sign language recognition accessible anywhere — whether through standard mobile phone hardware (camera) or interactive tactile hardware (smart glove). SensAble aims to transform sign language translation from an intimidating assistive technology into an intuitive, enjoyable learning and communication experience.

---

## 4. Target Users

### Primary Audience: School Students
- **Age Demographic:** K-12 students (approximately ages 8 to 18) and educators/peers interacting with them.
- **User Characteristics:** High expectation for smooth visual feedback, modern aesthetics, intuitive navigation, gamified/engaging interactions, fast response times, and minimal setup complexity.
- **Accessibility Needs:** High contrast support, screen-reader compatibility, clear visual indicator cues (haptics, badges, clear feedback states), and friendly error messages.

---

## 5. Core User Experience
1. **Dual Input Mode Switch:** The student chooses between **Camera Mode** (using phone camera) or **Glove Mode** (paired via HC-05 Bluetooth).
2. **Real-Time On-Device Sign Capture:** The active input mode captures gestures and performs feature extraction and sign classification locally on the device to output standardized **Gloss Tokens**.
3. **Sequence & Sentence Assembly:** Individual glosses (e.g., `[ME] [GO] [SCHOOL]`) are buffered on-device and assembled into sequence blocks based on configurable timeout and debounce parameters.
4. **Cloud Translation to Natural English:** The assembled Gloss sequence is sent to the Zoho Catalyst backend, which securely proxies the request to the cloud NLP model (Hugging Face) to generate natural English (e.g., *"I am going to school"*).
5. **Interactive Feedback & Audio Output:** The recognized text is displayed on UI card interfaces with text-to-speech (TTS) playback options.
6. **Student Progress & Learning Hub:** User authentication, vocabulary management, learning history, and progress tracking powered by Zoho Catalyst.

---

## 6. V1 Scope

### Included in V1:
- **Platform:** Native Android Application built with **React Native (TypeScript)**.
- **Input Mode 1 — Camera Mode:**
  - On-device hand tracking using MediaPipe Hands (supporting single-hand 63-value and dual-hand 126-value spatial keypoints).
  - Local feature extraction and on-device Random Forest classification to Gloss Tokens.
- **Input Mode 2 — Glove Mode:**
  - Physical glove (`glove/`) with 5 flex sensors, Arduino Nano, and HC-05 Bluetooth module.
  - Bluetooth RFCOMM communication to mobile app.
  - Local glove feature parsing and on-device Random Forest classification to Gloss Tokens.
- **Shared Intermediate Language Pipeline:**
  - Common `GlossToken` and `GlossSequence` data representation.
  - On-device sequence buffering with configurable threshold parameters (confidence, debouncing, idle timeout).
- **Cloud NLP & Storage Services:**
  - Zoho Catalyst acting as the secure API Gateway and serverless backend (storing Hugging Face API keys securely server-side).
  - Hugging Face Inference API called by Catalyst for Gloss-to-English translation.
  - Zoho Catalyst for Auth, User Profiles, Vocabulary Lists, Progress, and Translation History.
- **UI/UX & Design:**
  - Custom design exploration via Stitch MCP.
  - Mobile-adapted components (without web-only dependencies).
  - Engaging, accessible, student-friendly visual theme.
- **Distribution:** Manual Android APK build via Android Studio for testing and personal distribution.

---

## 7. Explicitly Out-of-Scope Items (V1)
- **Simultaneous Sensor Fusion:** Camera and Glove inputs are strictly **mutually exclusive** alternative modes in V1. Simultaneous multi-modal fusion is reserved for future versions.
- **Cloud Video Streaming / Remote Camera ML:** Camera video frame data must **NEVER** be uploaded or streamed to the cloud for recognition.
- **Direct App-to-Hugging Face Auth Tokens:** The Android app must **NEVER** contain Hugging Face secrets/tokens. All Hugging Face calls must be proxied through Zoho Catalyst.
- **Play Store Publication:** Google Play Store deployment, app signing pipelines, and developer console store assets are not required for V1.
- **Web / iOS Applications:** Web-only clients or iOS builds are explicitly excluded from V1.
- **Continuous Unconstrained Dynamic Sign Recognition:** V1 focuses on bounded sign sequences rather than unconstrained continuous sign language video streams.

---

## 8. Technology Overview

| Layer / Component | Chosen Technology | Role & Justification |
| :--- | :--- | :--- |
| **Mobile Framework** | React Native + TypeScript | Cross-platform UI efficiency, strong native module integration capability. |
| **Android Development** | Android Studio / Gradle | Android SDK management, emulator, native module compilation, APK builds. |
| **On-Device Vision ML** | MediaPipe Hands (Android Native) | On-device 2D/3D hand landmark detection (single-hand 63 values, dual-hand 126 values). |
| **Glove Hardware** | 5 Flex Sensors + Arduino Nano (`glove/`) | Microcontroller collecting analog finger bending values. |
| **Glove Connectivity** | HC-05 Bluetooth Module (SPP/RFCOMM) | Wireless UART serial transmission of sensor vectors to mobile. |
| **On-Device ML Engine** | Scikit-learn trained Random Forest (Runtime Candidate TBD) | On-device sign classification. Final Android inference format (ONNX Runtime, custom decision tree, TFLite) to be selected during deployment evaluation (TFLite is NOT guaranteed). |
| **Secure Cloud Gateway**| Zoho Catalyst Serverless Functions | Secure serverless API gateway hosting Hugging Face secret tokens, shielding cloud keys from client. |
| **Cloud NLP Translation**| Hugging Face Inference API | Cloud LLM/Seq2Seq model translating Gloss sequences to natural English (invoked exclusively via Catalyst). |
| **Backend & Auth** | Zoho Catalyst Datastore & Auth | Serverless auth, user data, vocabulary database, progress tracking, and translation history API. |
| **UI Design & Exploration**| Stitch MCP | Prompt-driven visual UI generation, screen iteration, and design system exploration. |

---

## 9. Major Project Constraints & Architectural Clarifications

1. **Precise On-Device vs. Cloud Boundary:**
   > *"Sign perception, feature extraction, and sign classification are performed on-device. Natural-language refinement from Gloss to fluent English is cloud-based in V1."*
2. **Privacy & Data Limits:** Video frames and high-frequency raw flex sensor streams must remain strictly on-device. Only lightweight Gloss text strings are sent to the cloud.
3. **Secure Cloud Gateway:** The Android app sends Gloss sequences to Zoho Catalyst. Catalyst performs authenticated server-side calls to Hugging Face. No Hugging Face authorization token exists inside the Android app bundle.
4. **Hardware Decoupling:** The glove subsystem (`glove/`) remains independently developable and testable via Bluetooth serial monitors without blocking mobile app work.
5. **Decoupled Feature Spaces:** Camera features (3D joint landmarks) and Glove features (5 analog flex values) are fundamentally distinct and classified using separate dedicated models.
6. **Model Runtime Selection:** Random Forest is the V1 training model. Scikit-learn is used for offline training. The final Android runtime (ONNX Runtime, custom decision tree, or TFLite) will be selected after testing compatibility, performance, APK size, and maintainability on Android. TFLite is not guaranteed.
7. **Student Usability & Accessibility:** UI elements must adhere to touch target minimums (48×48 dp), high contrast ratios, and clear responsive feedback.
8. **Architectural Stability:** No structural changes to input pipelines, common gloss contracts, or cloud boundaries may occur without explicit architectural approval.
