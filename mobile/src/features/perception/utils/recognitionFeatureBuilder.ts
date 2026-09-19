import { MotionTransition, TemporalMotionSequence } from '../types/motion';
import { NormalizedFrame } from '../types/normalized';
import { RecognitionFrame, RecognitionHand, RecognitionSequence } from '../types/recognition';
import { extractSequenceMotion } from './motionExtractor';

export const FEATURES_PER_HAND_SLOT = 238; // 1 (isPresent) + 1 (conf) + 1 (scale) + 63 (spatial) + 168 (motion) + 4 (agg)
export const TOTAL_FRAME_FEATURES = FEATURES_PER_HAND_SLOT * 2; // 476 floats

/**
 * Combines a current NormalizedFrame and a MotionTransition (from t-1 to t)
 * into a structured RecognitionFrame.
 *
 * Immutability: Pure function; does NOT mutate input parameters.
 */
export function createRecognitionFrame(
  currFrame: NormalizedFrame,
  transition?: MotionTransition | null
): RecognitionFrame {
  const deltaTimeMs = transition ? transition.deltaTimeMs : 0;
  const hands: RecognitionHand[] = [];

  if (currFrame.hands && currFrame.hands.length > 0) {
    for (const spatialHand of currFrame.hands) {
      // Match motion transition for this hand by handedness
      const matchedMotion = transition?.hands?.find(
        (m) => m.handedness === spatialHand.handedness
      ) || null;

      hands.push({
        handedness: spatialHand.handedness,
        confidence: spatialHand.confidence,
        spatial: spatialHand,
        motion: matchedMotion,
      });
    }
  }

  return {
    timestampMs: currFrame.timestampMs,
    deltaTimeMs,
    hands,
  };
}

/**
 * Converts a sequence of NormalizedFrames into a chronological RecognitionSequence.
 * For N normalized frames, computes transitions (N-1) and attaches them starting at frame 1.
 * Frame 0 has deltaTimeMs = 0 and motion = null (no fabricated initial motion).
 *
 * Immutability: Pure function; does NOT mutate input sequence.
 */
export function createRecognitionSequence(
  frames: NormalizedFrame[],
  sequenceMotion?: TemporalMotionSequence
): RecognitionSequence {
  if (!frames || frames.length === 0) {
    return { frames: [] };
  }

  // Compute sequence motion transitions if not provided
  const motionSeq = sequenceMotion || extractSequenceMotion(frames);
  const recognitionFrames: RecognitionFrame[] = [];

  for (let i = 0; i < frames.length; i++) {
    const currFrame = frames[i];
    // Frame 0 has no preceding motion transition (index i-1)
    const transition = i > 0 ? motionSeq.transitions[i - 1] : null;
    recognitionFrames.push(createRecognitionFrame(currFrame, transition));
  }

  return { frames: recognitionFrames };
}

/**
 * Builds a deterministic numeric feature vector (238 floats) for a single hand slot.
 * Index 0: isPresent (1.0 if present, 0.0 if missing)
 * Index 1: confidence
 * Index 2: scale
 * Indices 3..65: 21 spatial landmarks (x, y, z)
 * Indices 66..233: 21 motion landmarks (dx, dy, dz, mag, vx, vy, vz, speed)
 * Indices 234..237: 4 aggregate motion stats (avgMag, maxMag, avgSpeed, maxSpeed)
 */
function buildHandSlotVector(hand: RecognitionHand | undefined): number[] {
  const vec = new Array<number>(FEATURES_PER_HAND_SLOT).fill(0);

  if (!hand) {
    // Missing hand: isPresent = 0.0; remaining 237 elements remain 0.0
    return vec;
  }

  vec[0] = 1.0; // handPresent indicator
  vec[1] = hand.confidence ?? 0;
  vec[2] = hand.spatial?.scale ?? 0;

  // 21 Spatial landmarks (63 floats: x, y, z for indices 0..20)
  let idx = 3;
  const spatialLms = hand.spatial?.landmarks;
  if (spatialLms) {
    for (let i = 0; i < 21; i++) {
      const lm = spatialLms[i];
      if (lm) {
        vec[idx++] = lm.x;
        vec[idx++] = lm.y;
        vec[idx++] = lm.z;
      } else {
        idx += 3;
      }
    }
  } else {
    idx += 63;
  }

  // 21 Motion landmarks (168 floats) + 4 Aggregate stats
  const motion = hand.motion;
  if (motion && motion.landmarkMotions) {
    for (let i = 0; i < 21; i++) {
      const m = motion.landmarkMotions[i];
      if (m) {
        vec[idx++] = m.dx;
        vec[idx++] = m.dy;
        vec[idx++] = m.dz;
        vec[idx++] = m.magnitude;
        vec[idx++] = m.vx;
        vec[idx++] = m.vy;
        vec[idx++] = m.vz;
        vec[idx++] = m.speed;
      } else {
        idx += 8;
      }
    }

    vec[idx++] = motion.averageMagnitude;
    vec[idx++] = motion.maxMagnitude;
    vec[idx++] = motion.averageSpeed;
    vec[idx++] = motion.maxSpeed;
  } else {
    // First frame or no motion -> motion values remain 0.0
    idx += 168 + 4;
  }

  return vec;
}

/**
 * Converts a RecognitionFrame into a deterministic fixed-shape numeric feature vector (476 floats).
 * Left Hand slot: Indices 0 to 237
 * Right Hand slot: Indices 238 to 475
 *
 * Guaranteed fixed shape regardless of whether 0, 1, or 2 hands are detected.
 * Missing hands are deterministically padded with isPresent = 0.0.
 */
export function toRecognitionFeatureVector(frame: RecognitionFrame): number[] {
  if (!frame) {
    return new Array<number>(TOTAL_FRAME_FEATURES).fill(0);
  }

  const leftHand = frame.hands?.find((h) => h.handedness === 'Left');
  const rightHand = frame.hands?.find((h) => h.handedness === 'Right');

  const leftSlot = buildHandSlotVector(leftHand);
  const rightSlot = buildHandSlotVector(rightHand);

  return [...leftSlot, ...rightSlot];
}

/**
 * Converts a RecognitionSequence into a matrix of feature vectors (N x 476 floats).
 */
export function toRecognitionSequenceVectors(sequence: RecognitionSequence): number[][] {
  if (!sequence || !sequence.frames) {
    return [];
  }
  return sequence.frames.map((f) => toRecognitionFeatureVector(f));
}
