/**
 * Gate C & C.1: Hand perception data types crossing the native → React Native boundary.
 *
 * ONLY numerical coordinates and frame metadata cross this boundary.
 * NO images, bitmaps, or pixel buffers.
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
