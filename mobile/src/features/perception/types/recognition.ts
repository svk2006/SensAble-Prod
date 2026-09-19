import { HandMotion } from './motion';
import { NormalizedHand } from './normalized';

/**
 * Step 11C: Combined static + temporal recognition feature representations.
 *
 * Designed to present clean, structured, and vectorizable features
 * to future sign language gesture recognition models.
 */

export interface RecognitionHand {
  handedness: 'Left' | 'Right';
  confidence: number;
  spatial: NormalizedHand;   // Static wrist-relative & scale-normalized 21 landmarks
  motion: HandMotion | null; // Motion features relative to previous frame (null if first frame or newly appeared)
}

export interface RecognitionFrame {
  timestampMs: number;
  deltaTimeMs: number;       // Elapsed time from previous frame (0 for first frame)
  hands: RecognitionHand[];  // 0, 1, or 2 recognition hands
}

export interface RecognitionSequence {
  frames: RecognitionFrame[]; // Chronological sequence of RecognitionFrames
}
