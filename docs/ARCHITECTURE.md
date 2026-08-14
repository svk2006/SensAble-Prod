# SensAble — System Architecture Specification

## 1. Executive Summary & V1 System Architecture
SensAble implements a decoupled, edge-cloud hybrid architecture for sign language recognition and natural language translation. The system provides two independent on-device recognition pipelines (**Camera Mode** and **Glove Mode**) that converge on a unified **Gloss Intermediate Representation**. This gloss sequence is sent via a secure serverless cloud gateway (**Zoho Catalyst**) to an NLP translation provider (**Hugging Face**) to yield natural English output.

> **Core Boundary Definition:** Sign perception, feature extraction, and sign classification are performed on-device. Natural-language refinement from Gloss to fluent English is cloud-based in V1.

```
+-----------------------------------------------------------------------------------+
|                               ON-DEVICE (ANDROID)                                 |
|                                                                                   |
|  +-----------------------+                         +---------------------------+  |
|  |     CAMERA MODE       |                         |        GLOVE MODE         |  |
|  | Android Camera Stream |                         | 5x Flex Sensors + Arduino |  |
|  |          |            |                         |      | (glove/ - HC-05)   |  |
|  | MediaPipe Hands       |                         | BT Serial Stream (RFCOMM) |  |
|  | (Single: 63 / Dual:126)|                         |          |                |  |
|  | Feature Extraction    |                         | Feature Extraction (5-val)|  |
|  |          |            |                         |          |                |  |
|  | Local Camera ML Model |                         | Local Glove ML Model      |  |
|  | (Random Forest Engine)|                         | (Random Forest Engine)    |  |
|  +----------+------------+                         +-------------+-------------+  |
|             |                                                    |                |
|             +-------------------------+--------------------------+                |
|                                       |                                           |
|                                       v                                           |
|                       +-------------------------------+                           |
|                       |   Common Gloss Token Stream   |                           |
|                       +---------------+---------------+                           |
|                                       |                                           |
|                                       v                                           |
|                       +-------------------------------+                           |
|                       |  Temporal Sequence Buffering  |                           |
|                       |  (Debounce, Idle Timeout)     |                           |
|                       +---------------+---------------+                           |
+---------------------------------------|-------------------------------------------+
                                        | (GlossSequence Text)
                                        v
+-----------------------------------------------------------------------------------+
|                                 CLOUD SERVICES                                    |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |                        Zoho Catalyst Serverless Backend                     |  |
|  |  +------------------------------+       +--------------------------------+  |  |
|  |  | Auth, Datastore, Progress,   |       |  Secure NLP Gateway Function   |  |  |
|  |  | Translation History APIs     |       |  (Holds Hugging Face Secret)   |  |  |
|  |  +------------------------------+       +---------------+----------------+  |  |
|  +---------------------------------------------------------|-------------------+  |
                                                             | (Authenticated)      
                                                             v                      
                                            +----------------------------------+    
                                            |      Hugging Face Cloud NLP      |    
                                            | (Gloss Sequence -> Natural Text) |    
                                            +----------------------------------+    
```

---

## 2. Camera Mode Architecture

### 2.1 Subsystem Design
Camera Mode runs entirely on the Android mobile device. Raw camera video frames are processed locally and must **NEVER** be uploaded to any server or cloud service.

```
[Android Camera API] 
       │ (30 FPS Frames)
       ▼
[MediaPipe Hands Native Module]
       │ (Single-Hand: 21 pts x 3 = 63 vals | Dual-Hand: 21 pts x 3 x 2 = 126 vals)
       ▼
[Camera Feature Extractor & Hand Representation Mapper]
       │ (Handles: Left only, Right only, Dual hands, Missing second hand)
       ▼
[Local Camera ML Classifier] (Scikit-learn Random Forest Model - On-Device Runtime)
       │
       ▼
[Gloss Token Event] ("HELLO", "THANK_YOU", etc.)
```

### 2.2 Camera Landmark & Hand Feature Representation
The camera architecture explicitly supports both single-hand and dual-hand sign gestures:
- **Single Hand Representation:** 21 landmarks $\times (X, Y, Z) = 63$ scalar values.
- **Dual Hand Representation:** 21 landmarks $\times (X, Y, Z) \times 2\text{ hands} = 126$ scalar values.

#### Hand Tracking State Handling:
The feature extraction engine explicitly manages four runtime hand tracking states:
1. **Left Hand Only:** Single-hand feature vector populated; right-hand channel flagged as absent.
2. **Right Hand Only:** Single-hand feature vector populated; left-hand channel flagged as absent.
3. **Both Hands Present:** Full dual-hand 126-value feature vector populated with handedness indices.
4. **Missing Second Hand:** For dual-hand signs where one hand drops out of view, the system applies a structured feature representation strategy.

> **Implementation Note:** The exact dual-hand feature encoding, masking, and padding strategy (e.g., zero-padding, sentinel values, or separate single/dual sub-classifiers) will be finalized during the camera dataset collection and model implementation phase.

---

## 3. Glove Mode Architecture

### 3.1 Subsystem Design
Glove Mode relies on a physical smart glove (located in `glove/`) equipped with flex sensors and an HC-05 Bluetooth module, operating independently from the camera system. High-frequency sensor streams remain strictly local.

```
[5x Flex Sensors] (Finger Bend Angles)
       │ (Analog Voltages)
       ▼
[Arduino Nano Microcontroller] (glove/firmware)
       │ (ADC Reading + Frame Packaging)
       ▼
[HC-05 Bluetooth Module]
       │ (UART Serial via RFCOMM)
       ▼
[React Native Bluetooth Manager]
       │ (Stream Parsing & Frame Validation)
       ▼
[Glove Feature Extractor]
       │ (5-element Normalized Bend Vector [f1, f2, f3, f4, f5])
       ▼
[Local Glove ML Classifier] (Scikit-learn Random Forest Model - On-Device Runtime)
       │
       ▼
[Gloss Token Event] ("YES", "NO", "PLEASE", etc.)
```

---

## 4. On-Device ML Model Runtime Strategy

### 4.1 V1 Training & Classification Engine
- **Training Model:** Scikit-learn **Random Forest Classifier** trained offline in Python using captured feature datasets.

### 4.2 Android Runtime Evaluation Policy
The final Android inference runtime format for the Random Forest model has **NOT** yet been permanently selected. The deployment format will be chosen after empirical testing on physical Android devices.

Candidate inference runtimes include:
1. **ONNX / ONNX Runtime for Android:** High-compatibility cross-platform ML engine.
2. **Custom / Native C++ Decision-Tree Engine:** Extremely lightweight, zero-dependency tree traverser compiled natively.
3. **TensorFlow Lite (TFLite):** Candidate option if scikit-learn tree conversion proves stable.

> **Deployment Rule:** TFLite must **NOT** be treated as guaranteed for the Random Forest implementation. The final runtime will be selected during the model deployment phase based on compatibility, latency ($< 30\text{ ms}$ target), APK size impact, and maintainability on Android.

---

## 5. Configurable Recognition & Buffering Parameters

To ensure flexibility during physical device testing, sign recognition and temporal debouncing parameters are centralized as configurable values:

| Parameter Name | Initial V1 Value | Purpose & Tuning Strategy |
| :--- | :--- | :--- |
| `CONFIDENCE_THRESHOLD` | **0.70** | Minimum probability score required for a prediction to be recognized. |
| `DEBOUNCE_WINDOW_MS` | **300 ms** | Sliding time window to merge consecutive identical gloss predictions. |
| `SEQUENCE_IDLE_TIMEOUT_MS` | **1.5 seconds (1500 ms)** | Inactivity duration before finalizing the active `GlossSequence`. |

> **Testing Note:** These initial V1 parameters will be tuned during real-device testing across different student gesture speeds.

---

## 6. Cloud Gateway & Responsibility Architecture

### 6.1 Secure Cloud Gateway Flow (Zoho Catalyst -> Hugging Face)
To prevent API key exposure, the Android client app **NEVER** holds a Hugging Face secret token.

```
[Android App] ──> (GlossSequence Text) ──> [Zoho Catalyst Serverless Function] ──> (Authenticated Call + HF Key) ──> [Hugging Face Inference API]
                                                                                                                          │
[Android App] <── (Natural English)   <── [Zoho Catalyst Serverless Function] <── (Generated English Sentence) <──────┘
```

### 6.2 Cloud Responsibility Matrix

| Subsystem / Provider | Architectural Responsibilities | Auth / Security Boundary |
| :--- | :--- | :--- |
| **Android Application** | Local vision/glove capture, feature extraction, on-device RF inference, gloss buffering, TTS, UI presentation. | Holds Zoho Catalyst Client Credentials / User Auth Token only. Zero Hugging Face keys. |
| **Zoho Catalyst (Auth & Data)** | User authentication, user profiles, vocabulary lists, student learning progress, translation history logging. | Catalyst BaaS Datastore & Auth SDK. |
| **Zoho Catalyst (Secure Gateway)** | Receives Gloss text, authenticates request, attaches server-side Hugging Face API key, calls Hugging Face, returns refined natural English. | Encapsulates Hugging Face secret key entirely inside Catalyst serverless environment. |
| **Hugging Face Inference API** | Hosts fine-tuned Seq2Seq transformer model (e.g., T5/BART fine-tuned on Gloss-to-English translation). | Accepts authenticated requests exclusively from Catalyst IP/Serverless instance. |

---

## 7. Local vs. Cloud Data Isolation

- **Local Boundary (On-Device):** All camera video frames, hand landmark keypoint arrays, raw analog flex voltage streams, and low-level feature vectors remain 100% local.
- **Cloud Boundary (Serverless Remote):** Only lightweight, text-based `GlossSequence` strings (e.g., `"ME WANT WATER"`) cross the network to Zoho Catalyst.

---

## 8. Development vs. Production Architecture

### Development Environment:
- **Mock Bluetooth Provider:** Enables UI and translation testing without physical glove hardware attached.
- **Mock Hand Landmark Injector:** Enables ML classification testing using pre-recorded landmark JSON files.
- **Catalyst Development Sandbox:** Staging environment for Catalyst serverless functions and database tables.

### Production Environment (V1 Target):
- Live Android CameraX feed and physical HC-05 paired glove hardware (`glove/`).
- Bundled, optimized Random Forest model binaries in mobile assets.
- Production Zoho Catalyst endpoints with server-side Hugging Face secret management.
