# SensAble — API Contract & Conceptual Interface Specification

> **Status Notice:** This document defines the **provisional** conceptual interfaces, data contracts, and payload structures for SensAble V1. Final database schemas and live network endpoints will be finalized during backend/cloud integration tasks. No APIs are implemented in this step.

---

## 1. Interface Architectural Overview

> **Core Boundary Definition:** Sign perception, feature extraction, and sign classification are performed on-device. Natural-language refinement from Gloss to fluent English is cloud-based in V1.

```
 [ Camera Mode Engine ] ──(RecognizedGlossEvent)──┐
 (63 / 126 vals)                                  ├──> [ Local Gloss Buffer ]
 [ Glove Mode Engine  ] ──(RecognizedGlossEvent)──┘    (Debounce, Idle Timeout)
 (5 flex vals - glove/)                                           │
                                                                  │ (GlossSequence Text)
                                                                  ▼
                                                   [ Zoho Catalyst Secure Gateway ]
                                                   (Holds HF Secret Token)
                                                                  │
                                                                  │ (Authenticated Request)
                                                                  ▼
                                                   [ Cloud NLP (Hugging Face) ]
                                                                  │
                                                                  │ (Natural English Sentence)
                                                                  ▼
                                                    [ Mobile UI & TTS Engine ]
                                                                  │
                                                                  │ (Sync History / Progress)
                                                                  ▼
                                                   [ Zoho Catalyst Auth & Data ]
```

---

## 2. Configurable On-Device Recognition Parameters

Sign sequence buffering and recognition triggers rely on centralized configurable parameters:

```typescript
export interface RecognitionConfig {
  /** Minimum confidence threshold required for a predicted gloss (default: 0.70) */
  confidenceThreshold: number;
  
  /** Sliding window duration in ms to debounce identical consecutive glosses (default: 300 ms) */
  debounceWindowMs: number;
  
  /** Idle duration in ms of gesture inactivity before finalizing sequence (default: 1500 ms) */
  sequenceIdleTimeoutMs: number;
}

export const INITIAL_RECOGNITION_CONFIG: RecognitionConfig = {
  confidenceThreshold: 0.70,
  debounceWindowMs: 300,
  sequenceIdleTimeoutMs: 1500,
};
```

---

## 3. Common Intermediate Gloss Representation

All sign recognition outputs (from both Camera and Glove pipelines) must be transformed into standardized TypeScript interfaces on-device before reaching the sequence buffer.

### 3.1 `GlossToken` Interface (Provisional)
```typescript
/**
 * Represents a single recognized sign language gloss item.
 */
export interface GlossToken {
  /** Unique string label representing the gloss (e.g., "HELLO", "THANK_YOU", "DRINK") */
  label: string;
  
  /** Model confidence score ranging from 0.0 to 1.0 */
  confidence: number;
  
  /** Unix timestamp in milliseconds when the gloss was recognized */
  timestamp: number;
  
  /** Identifies which input mode produced this gloss token */
  sourceMode: 'CAMERA' | 'GLOVE';
  
  /** Optional metadata containing feature extraction metrics */
  metadata?: {
    frameId?: number;
    sensorValues?: number[];
    handLandmarkCount?: number;
    handTrackingState?: 'LEFT_ONLY' | 'RIGHT_ONLY' | 'BOTH_HANDS' | 'MISSING_SECOND_HAND';
  };
}
```

### 3.2 `GlossSequence` Interface (Provisional)
```typescript
/**
 * Represents an ordered buffer of recognized gloss tokens forming a phrase/sentence.
 */
export interface GlossSequence {
  /** Unique client-generated session or sequence ID */
  sequenceId: string;
  
  /** Ordered array of recognized Gloss Tokens */
  tokens: GlossToken[];
  
  /** Concatenated string representation of glosses (e.g., "ME WANT WATER") */
  rawGlossString: string;
  
  /** Timestamp when the sequence started */
  startTime: number;
  
  /** Timestamp when the sequence was finalized for translation */
  finalizedTime?: number;
  
  /** Reason why the sequence was closed/finalized */
  finalizedReason?: 'TIMEOUT' | 'MANUAL_TRIGGER' | 'END_PUNCTUATION_GESTURE';
}
```

---

## 4. Mobile Recognition Internal Events

### 4.1 Recognition Output Event Payload
Internal publish/subscribe contract emitted by `CameraRecognitionService` or `GloveRecognitionService`:

```typescript
export interface RecognizedGlossEvent {
  type: 'GLOSS_RECOGNIZED';
  payload: GlossToken;
}
```

---

## 5. Cloud Gateway API Contracts (Android App <-> Zoho Catalyst <-> Hugging Face)

The Android application communicates **exclusively with Zoho Catalyst**. It never sends requests directly to Hugging Face and contains no Hugging Face API keys.

### 5.1 Translation Request (Android App -> Zoho Catalyst Secure Gateway)
**Endpoint:** `POST https://sensable.catalystserverless.com/server/sensable_function/translate`

```json
{
  "sequenceId": "seq_123456789",
  "rawGlossString": "ME GO SCHOOL TODAY",
  "config": {
    "targetLanguage": "en-US"
  }
}
```

### 5.2 Server-to-Server Translation (Zoho Catalyst -> Hugging Face Inference API)
*Executed entirely within the secure Catalyst serverless environment.*

**Endpoint:** `POST https://api-inference.huggingface.co/models/sensable/gloss-to-english-v1`
**Header:** `Authorization: Bearer [CATALYST_SERVER_STORED_HF_TOKEN]`

```json
{
  "inputs": "ME GO SCHOOL TODAY",
  "parameters": {
    "max_new_tokens": 64,
    "temperature": 0.3
  }
}
```

### 5.3 Translation Response (Zoho Catalyst Gateway -> Android App)
**HTTP Status:** `200 OK`

```json
{
  "status": "success",
  "sequenceId": "seq_123456789",
  "rawGlossString": "ME GO SCHOOL TODAY",
  "translatedText": "I am going to school today.",
  "processingTimeMs": 240
}
```

---

## 6. Mobile <-> Zoho Catalyst Auth & User Data APIs

### 6.1 Authentication Contracts (Provisional)
- `POST /baas/v1/project/{project_id}/signup`
- `POST /baas/v1/project/{project_id}/login`

### 6.2 Translation History API Contract (Provisional)
- `POST /server/sensable_function/history`

```json
{
  "userId": "cat_user_98765",
  "sequenceId": "seq_123456789",
  "inputMode": "CAMERA",
  "rawGlossString": "ME WANT WATER",
  "translatedText": "I would like some water.",
  "timestamp": 1770987600000
}
```

### 6.3 Student Progress & Vocabulary API Contract (Provisional)
- `GET /server/sensable_function/progress?userId=cat_user_98765`

```json
{
  "status": "success",
  "data": {
    "userId": "cat_user_98765",
    "totalGlossesLearned": 45,
    "masteredGlosses": ["HELLO", "THANK_YOU", "YES", "NO", "PLEASE"],
    "practiceStreakDays": 5,
    "lastActive": 1770987600000
  }
}
```

---

## 7. Standardized Error Response Contract

All remote Catalyst API calls must return a standardized error structure when requests fail:

```typescript
export interface ApiErrorResponse {
  error: {
    code: string;           // E.g., "TIMEOUT", "UNAUTHORIZED", "MODEL_LOADING", "INVALID_GLOSS"
    message: string;        // Human-readable message suitable for student display
    details?: string;       // Debugging technical context
  };
  timestamp: number;
}
```
