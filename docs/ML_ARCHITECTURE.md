# SensAble — Machine Learning Architecture Specification

## 1. Executive Overview
SensAble utilizes an edge-first machine learning architecture for sign language gesture recognition.

> **Core Boundary Definition:** Sign perception, feature extraction, and sign classification are performed on-device. Natural-language refinement from Gloss to fluent English is cloud-based in V1.

The system strictly decouples the feature extraction and classification of **Camera Mode** and **Glove Mode** into two distinct ML pipelines, both converging on a shared **Gloss Output Contract**.

---

## 2. Feature-Space Separation (Camera vs. Glove)

The fundamental physical inputs of Camera Mode and Glove Mode belong to completely different feature spaces and mathematical domains:

| Metric / Dimension | Camera Recognition Pipeline | Glove Recognition Pipeline (`glove/`) |
| :--- | :--- | :--- |
| **Physical Input** | 2D RGB Video Stream (30 FPS) | 5x Analog Flex Resistor Voltages (20–50 Hz) |
| **Raw Data Structure** | Pixel Array Matrix $(H \times W \times 3)$ | 5-Element Voltage Vector $(v_1, v_2, v_3, v_4, v_5)$ |
| **Feature Extraction Engine** | MediaPipe Hands (Native Android Module) | Arduino ADC + Mobile Byte Stream Parser |
| **Feature Space Dimensions** | Single-Hand: 63 scalar values<br>Dual-Hand: 126 scalar values | 5 Normalized Continuous Bending Ratios $[0.0, 1.0]$ |
| **Spatial Invariance Needs** | Wrist centering, scale normalization, handedness mapping | Baseline sensor calibration per glove wearing |
| **Classifier Model** | Dedicated Camera Random Forest Classifier | Dedicated Glove Random Forest Classifier |

> **V1 Rule:** Camera features and Glove features are **NEVER** concatenated or fed into a joint model in V1. Each mode uses its dedicated classifier tuned specifically for its feature space.

---

## 3. Camera Recognition Pipeline & Hand Feature Representation

```
[Camera Stream] ──> [MediaPipe Hands] ──> [Landmark Extractor (63 or 126 vals)] ──> [Spatial Normalizer] ──> [Camera RF Classifier] ──> [GlossToken]
```

### 3.1 Landmark Extraction & Normalization
1. **Keypoint Extraction:** MediaPipe Hands tracks 21 3D landmarks $(x_i, y_i, z_i)$ per detected hand.
2. **Wrist Centering:** The wrist landmark $(x_0, y_0, z_0)$ is subtracted from all 21 keypoints:
   $$(\hat{x}_i, \hat{y}_i, \hat{z}_i) = (x_i - x_0, y_i - y_0, z_i - z_0)$$
3. **Scale Normalization:** Coordinates are divided by the Euclidean distance between wrist $(x_0, y_0, z_0)$ and index finger MCP joint $(x_5, y_5, z_5)$ to achieve scale invariance:
   $$d_{ref} = \sqrt{(\hat{x}_5)^2 + (\hat{y}_5)^2 + (\hat{z}_5)^2}$$
   $$\vec{f}_{norm} = \frac{1}{d_{ref}} \left[ \hat{x}_0, \hat{y}_0, \hat{z}_0, \dots, \hat{x}_{20}, \hat{y}_{20}, \hat{z}_{20} \right]$$

### 3.2 Single-Hand vs. Dual-Hand Feature Representation
SensAble explicitly supports a clear distinction between single-hand and dual-hand camera input:
- **Single Hand Input:** 21 landmarks $\times (X, Y, Z) = 63$ values.
- **Dual Hand Input:** 21 landmarks $\times (X, Y, Z) \times 2\text{ hands} = 126$ values.

#### Hand Tracking Runtime States:
The system explicitly accounts for four distinct hand visibility scenarios during sign recognition:
1. **Left Hand Only:** Single-hand feature vector populated; right-hand channel flagged as absent.
2. **Right Hand Only:** Single-hand feature vector populated; left-hand channel flagged as absent.
3. **Both Hands Present:** Full dual-hand 126-value feature vector populated with handedness indices.
4. **Missing Second Hand:** Occurs when a two-handed gesture loses tracking on one hand mid-sign.

> **Finalization Directive:** The exact dual-hand feature encoding, padding, sentinel masking, and sub-classifier routing strategy will be finalized during the camera dataset collection and model implementation phase.

---

## 4. Glove Recognition Pipeline (`glove/`)

```
[5 Flex Sensors] ──> [Arduino ADC (0-1023)] ──> [HC-05 BT Byte Frame] ──> [RN Min/Max Calibrator] ──> [Glove RF Classifier] ──> [GlossToken]
```

### 4.1 Sensor Vector Formulation & Calibration
1. **Raw ADC Readings:** Arduino Nano measures 5 analog channels $(A_0, A_1, A_2, A_3, A_4)$ returning raw 10-bit integer values $[0, 1023]$.
2. **Min/Max Normalization:** Continuous calibration transforms raw ADC integer $v_k$ into a normalized flex ratio $r_k \in [0.0, 1.0]$:
   $$r_k = \text{clamp}\left( \frac{v_k - \text{min}_k}{\text{max}_k - \text{min}_k}, 0.0, 1.0 \right)$$
3. **Feature Vector:** $\vec{g} = [r_1, r_2, r_3, r_4, r_5]$.

---

## 5. Random Forest Training & Android Deployment Evaluation Strategy

### 5.1 Training Model (Scikit-Learn Random Forest)
- **Model Type:** Scikit-learn **Random Forest Classifier** trained offline in Python using collected feature vectors.
- **Training Strategy:** Ensemble of decision trees ($N_{estimators} = 100$, $\text{max\_depth} = 15$) optimized for classification accuracy on bounded sign gloss vocabulary.

### 5.2 Android Inference Runtime Evaluation
The final Android inference format for the Random Forest model has **NOT** yet been permanently selected. The deployment format will be chosen after empirical evaluation on physical Android hardware.

#### Candidate Runtimes Under Evaluation:
1. **ONNX / ONNX Runtime for Android:** Standardized cross-platform open neural network exchange format with optimized C++ execution.
2. **Custom / Native C++ Decision Tree Engine:** Custom compiled C++ decision-tree parser providing zero-dependency, ultra-low latency execution.
3. **TensorFlow Lite (TFLite):** Evaluation candidate via scikit-learn conversion tools.

> **Deployment Rule:** TFLite must **NOT** be treated as guaranteed for the Random Forest implementation. The final runtime will be selected during the model deployment phase after compatibility, latency ($< 30\text{ ms}$ target), APK size impact, and maintainability are thoroughly tested on Android hardware.

---

## 6. Centralized Configurable Recognition & Buffering Parameters

To prevent hard-coded magic values and allow empirical tuning during physical testing, initial recognition parameters are centralized:

| Parameter Name | Initial V1 Value | Description & Purpose |
| :--- | :--- | :--- |
| `CONFIDENCE_THRESHOLD` | **0.70** | Minimum model confidence score required to register a predicted gloss token. |
| `DEBOUNCE_WINDOW_MS` | **300 ms** | Sliding temporal window to merge continuous identical gloss predictions. |
| `SEQUENCE_IDLE_TIMEOUT_MS` | **1.5 seconds (1500 ms)** | Gesture inactivity duration before triggering automatic sequence translation. |

> **Real-Device Tuning Directive:** These initial values may be adjusted during real-device testing across different student gesture speeds and classroom environmental conditions.

---

## 7. Model Versioning & Asset Management
- Every exported ML model file includes embedded metadata headers:
  - `model_version` (e.g., `camera_rf_v1.0.2`, `glove_rf_v1.0.0`)
  - `supported_gloss_vocabulary` (Array of supported gloss label strings)
  - `feature_dimension` (e.g., 63, 126, or 5)
  - `trained_date` (ISO timestamp)
- The React Native application reads model metadata on startup to ensure feature extraction dimensions strictly match model expectations.

---

## 8. Summary of V1 Decisions vs. Future Upgrade Path

| Architectural Dimension | V1 Decision (Current Scope) | Future Upgrade Path (Post-V1) |
| :--- | :--- | :--- |
| **Camera ML Model** | Static Hand Pose Random Forest (Scikit-Learn) | Dynamic Spatial-Temporal CNN-LSTM / Transformer |
| **Glove ML Model** | 5-Channel Static Bending Random Forest | Multi-sensor (Flex + 6-DOF IMU) Dynamic Classifier |
| **Input Fusion** | Mutually Exclusive Modes (Camera OR Glove) | Synchronized Sensor Fusion (Camera AND Glove) |
| **Vocabulary Scale** | Baseline Bounded Sign Vocabulary (~20-50 signs) | Full WLASL (Word-Level American Sign Language) Dataset |
| **Inference Location** | On-Device Sign Perception & Classification | On-Device Sign Perception & Classification |
| **Language Model** | Cloud NLP (Hugging Face via Catalyst Secure Gateway) | Local On-Device Small Language Model (SLM) |
