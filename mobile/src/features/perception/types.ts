/**
 * Gate C, C.1, Step 11A, Step 11B & Step 11C: Hand perception data types,
 * normalized recognition structures, temporal motion features,
 * and combined recognition representations.
 */

export interface HandLandmark {
  x: number; // Normalized [0.0, 1.0] relative to frame width
  y: number; // Normalized [0.0, 1.0] relative to frame height
  z: number; // Metric depth relative to wrist (negative = closer)
}

export interface HandDetection {
  handedness: 'Left' | 'Right';
  confidence: number;
  landmarks: HandLandmark[]; // Always exactly 21 landmarks per detected hand
}

export interface HandLandmarksEvent {
  timestampMs: number;
  imageWidth: number;
  imageHeight: number;
  rotationDegrees: number;
  hands: HandDetection[]; // 0, 1, or 2 detected hands
}

export * from './types/normalized';
export * from './types/motion';
export * from './types/recognition';
