/**
 * Step 11B: Temporal Motion Feature types.
 *
 * Exclusively represents normalized landmark displacement, 3D magnitude,
 * and velocity between consecutive normalized perception frames.
 */

export interface LandmarkMotion {
  index: number;     // Landmark index (0 to 20)
  dx: number;        // Displacement in normalized x (current.x - previous.x)
  dy: number;        // Displacement in normalized y (current.y - previous.y)
  dz: number;        // Displacement in normalized z (current.z - previous.z)
  magnitude: number; // 3D Euclidean displacement magnitude: sqrt(dx² + dy² + dz²)
  vx: number;        // Velocity along x (normalized units / second)
  vy: number;        // Velocity along y (normalized units / second)
  vz: number;        // Velocity along z (normalized units / second)
  speed: number;     // 3D Speed (magnitude / second)
}

export interface HandMotion {
  handedness: 'Left' | 'Right';
  confidence: number;            // Current frame detection confidence
  landmarkMotions: LandmarkMotion[]; // 21 landmark motion vectors
  averageMagnitude: number;      // Mean displacement magnitude across all 21 landmarks
  maxMagnitude: number;          // Maximum displacement magnitude among 21 landmarks
  averageSpeed: number;          // Mean speed across all 21 landmarks
  maxSpeed: number;              // Maximum speed among 21 landmarks
}

export interface MotionTransition {
  fromTimestampMs: number;
  toTimestampMs: number;
  deltaTimeMs: number;
  hands: HandMotion[]; // Matched hand motions (0, 1, or 2 hands)
}

export interface TemporalMotionSequence {
  transitions: MotionTransition[]; // N-1 transitions for N normalized frames
}
