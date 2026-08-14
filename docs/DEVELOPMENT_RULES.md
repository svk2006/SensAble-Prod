# SensAble — Development Rules & Engineering Directives

## 1. Document Overview
This document defines the strict engineering guidelines, development constraints, agent behavioral rules, testing requirements, and quality standards for the SensAble project. All implementation tasks performed by human developers or AI agents (including Antigravity) must strictly adhere to these rules.

---

## 2. General Coding Principles
- **TypeScript Strictness:** All React Native code must be written in TypeScript with strict mode enabled. Do NOT use explicit `any` types. Define clear interfaces/types for all state, props, API responses, and event payloads.
- **Modular Code Structure:** Keep files small, focused, and single-purpose. Separate UI components, custom hooks, business logic, hardware modules, and API services into dedicated directories.
- **Clean Code & Self-Documentation:** Write clear variable and function names. Maintain descriptive JSDoc/inline documentation for complex mathematical operations (such as spatial coordinate normalizations or flex sensor ADC mapping).
- **Preserve Comments:** Preserve all existing comments and docstrings unless explicitly asked to modify them.

---

## 3. Architecture Preservation Rules
1. **Strict Input Mode Separation:** Camera Mode and Glove Mode must remain completely separate recognition pipelines in V1. Do **NOT** attempt to fuse camera and glove data streams into a single classifier in V1 code.
2. **On-Device ML vs. Cloud Boundaries:**
   > *"Sign perception, feature extraction, and sign classification are performed on-device. Natural-language refinement from Gloss to fluent English is cloud-based in V1."*
3. **No Cloud Sensor Streaming:** Camera video frames and high-frequency raw flex sensor streams must **NEVER** be uploaded or streamed to any cloud server or API.
4. **Secure Cloud Gateway Rule:** The Android client application must **NEVER** hold a Hugging Face secret/token. The client sends Gloss sequences to Zoho Catalyst, which securely performs authenticated calls to Hugging Face.
5. **Common Gloss Interface Enforcement:** All sign recognition output from both Camera Mode and Glove Mode must conform strictly to the `GlossToken` schema defined in `API_CONTRACT.md`.
6. **No Direct Hardware Coupling in UI:** React Native UI components must never communicate directly with Bluetooth serial ports or MediaPipe native streams. Hardware access must be encapsulated inside dedicated service interfaces and custom hooks.
7. **Architectural Confirmation Requirement:** Any modification to core architectural boundaries, top-level folder structures (`mobile/`, `ml/`, `backend/`, `glove/`, `docs/`), or cross-subsystem contracts requires **EXPLICIT HUMAN APPROVAL** before execution.

---

## 4. Dependency & Android Compatibility Rules

> **Strengthened Engineering Rule:** No native Android module or major third-party dependency may be introduced until its compatibility with the project's React Native version, Android Gradle configuration, target Android SDK, and physical-device requirements has been verified.

- **Hardware Capability Physical Testing Requirement:** Native dependencies must be tested on a real Android device when their functionality depends on hardware capabilities such as:
  - Camera
  - Bluetooth
  - MediaPipe / Native ML
  - Text-to-Speech (TTS)
  - Sensors
- **Minimal Dependencies:** Do not add third-party npm packages without validating necessity and maintenance status.
- **No Web-Only Libraries:** Packages that rely on DOM elements (`window`, `document`, `HTMLCanvasElement`, web-only CSS frameworks like web-Tailwind) are strictly prohibited in the mobile app.
- **Dependency Audit:** Verify package size, native dependencies, and licensing before installation. Do not install dependencies in documentation tasks.

---

## 5. Machine Learning Runtime Evaluation Rules
- **Training Model:** Scikit-learn **Random Forest** is the V1 training/classification model.
- **Android Runtime Non-Guarantee:** The final Android inference format for the Random Forest model has **NOT** yet been permanently selected.
- **Runtime Candidates:** ONNX / ONNX Runtime and custom/native decision-tree C++ representations are primary candidates alongside TFLite.
- **No Guaranteed TFLite:** TFLite must **NOT** be treated as guaranteed for the Random Forest implementation.
- **Evaluation Criteria:** The final runtime will be selected during the model deployment phase after testing compatibility, latency, APK size impact, and maintainability on Android devices.

---

## 6. Centralized Recognition Threshold Rules
Recognition thresholds must be maintained as configurable parameters rather than hard-coded magic values:
- `CONFIDENCE_THRESHOLD`: Initial V1 baseline **0.70**.
- `DEBOUNCE_WINDOW_MS`: Initial V1 baseline **300 ms**.
- `SEQUENCE_IDLE_TIMEOUT_MS`: Initial V1 baseline **1.5 seconds (1500 ms)**.

> **Tuning Directive:** These initial values may be tuned during real-device testing across varying gesture execution speeds.

---

## 7. File & Directory Structure Rules
- **Top-Level Folder Standard:** Use `glove/` consistently for all smart glove firmware, schematics, and sensor code. Do **NOT** use `gloves/`.
- **Incremental Modifications:** Implement features and fixes in small, verifiable, incremental steps.
- **No Unnecessary Rewrites:** Never refactor or rewrite working modules completely when a small targeted update is sufficient.
- **Directory Structure Integrity:** Preserve the established top-level folder layout (`mobile/`, `ml/`, `backend/`, `glove/`, `docs/`).

---

## 8. Testing Requirements

### 8.1 Unit & Modular Testing
- **Feature Extractors:** Unit tests for single-hand (63-value) and dual-hand (126-value) landmark coordinate normalization, and 5-channel flex sensor packet parsing.
- **Gloss Sequence Buffering:** Unit tests verifying debouncing logic, timeout triggers, and sentence sequence formatting.
- **API Serializers:** Unit tests for API request/response formatters for Hugging Face and Zoho Catalyst interfaces.

### 8.2 Hardware & Integration Testing
- **Mock Hardware Providers:** Maintain mock providers (`MockBluetoothService`, `MockCameraLandmarkService`) so mobile application features can be thoroughly tested in the Android Emulator without physical glove hardware attached.
- **Physical Device Verification:** Every major mobile iteration must compile cleanly into an APK via Gradle in Android Studio and be verifiable on physical Android devices.

---

## 9. Error Handling Expectations
- **Zero Silent Failures:** Never swallow exceptions or use empty `catch` blocks. Log all unhandled errors with descriptive context.
- **Bluetooth Reconnection Resilience:** The glove Bluetooth driver must handle connection drops, buffer overruns, and out-of-range events gracefully with automatic retry prompts in the UI.
- **Permission Denial Handling:** If the user denies Camera or Bluetooth permissions, the app must display friendly, non-blocking guidance explaining how to grant permissions in Android Settings.
- **Cloud API Fallbacks:** If Hugging Face NLP or Zoho Catalyst APIs time out or fail offline, the app must preserve local Gloss sequences and present a fallback option (e.g., displaying raw Gloss sequence with a "Retry Translation" button).

---

## 10. Agent Behavior Rules (for Antigravity)
1. **Documentation First:** Read and honor all markdown documentation in `docs/` before writing any code.
2. **Empirical Log Verification:** Diagnose issues by inspecting full error logs and stack traces. Never guess root causes or apply superficial symptom patches.
3. **No Premature Declarations of Success:** Never declare a task complete without executing verification steps.
4. **No Implementation Code or Dependencies:** When assigned a documentation task, perform ONLY documentation updates. Do not create application code, npm packages, Android builds, backend functions, ML models, or Arduino scripts until directed.
