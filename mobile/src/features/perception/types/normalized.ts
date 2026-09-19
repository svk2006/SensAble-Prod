/**
 * Step 11A: Recognition-ready normalized perception types.
 *
 * Exclusively used for sign recognition feature extraction and temporal modeling.
 * Completely decoupled from display viewports, CameraX, Android, or UI rendering.
 */

export interface NormalizedLandmark {
  index: number; // Landmark index (0 to 20)
  x: number;     // Wrist-relative and scale-normalized x coordinate
  y: number;     // Wrist-relative and scale-normalized y coordinate
  z: number;     // Wrist-relative and scale-normalized z coordinate
}

export interface NormalizedHand {
  handedness: 'Left' | 'Right';
  confidence: number;
  scale: number; // Reference hand scale derived from Wrist (0) -> Middle MCP (9) distance
  wristOrigin: {
    x: number; // Original raw image-space wrist x [0, 1]
    y: number; // Original raw image-space wrist y [0, 1]
    z: number; // Original raw metric depth z
  };
  landmarks: NormalizedLandmark[]; // Always exactly 21 normalized landmarks
}

export interface NormalizedFrame {
  timestampMs: number;
  hands: NormalizedHand[]; // 0, 1, or 2 normalized hands
}
