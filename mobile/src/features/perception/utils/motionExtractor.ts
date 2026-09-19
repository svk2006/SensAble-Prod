import { NormalizedFrame, NormalizedHand, NormalizedLandmark } from '../types/normalized';
import { HandMotion, LandmarkMotion, MotionTransition, TemporalMotionSequence } from '../types/motion';

/**
 * Computes 3D motion displacement, magnitude, and velocity for a single landmark
 * between consecutive normalized frames.
 */
export function computeLandmarkMotion(
  prevLm: NormalizedLandmark,
  currLm: NormalizedLandmark,
  deltaTimeMs: number
): LandmarkMotion {
  const dx = currLm.x - prevLm.x;
  const dy = currLm.y - prevLm.y;
  const dz = currLm.z - prevLm.z;

  const magnitude = Math.sqrt(dx * dx + dy * dy + dz * dz);

  let vx = 0;
  let vy = 0;
  let vz = 0;
  let speed = 0;

  // Compute velocity if time delta is strictly positive
  if (deltaTimeMs > 0) {
    const deltaTimeSec = deltaTimeMs / 1000.0;
    vx = dx / deltaTimeSec;
    vy = dy / deltaTimeSec;
    vz = dz / deltaTimeSec;
    speed = magnitude / deltaTimeSec;
  }

  return {
    index: currLm.index,
    dx,
    dy,
    dz,
    magnitude,
    vx,
    vy,
    vz,
    speed,
  };
}

/**
 * Computes motion for a matched hand between consecutive normalized frames.
 */
export function computeHandMotion(
  prevHand: NormalizedHand,
  currHand: NormalizedHand,
  deltaTimeMs: number
): HandMotion {
  const landmarkMotions: LandmarkMotion[] = [];
  let totalMagnitude = 0;
  let maxMagnitude = 0;
  let totalSpeed = 0;
  let maxSpeed = 0;

  const len = Math.min(prevHand.landmarks.length, currHand.landmarks.length);

  for (let i = 0; i < len; i++) {
    const prevLm = prevHand.landmarks[i];
    const currLm = currHand.landmarks[i];
    const lmMotion = computeLandmarkMotion(prevLm, currLm, deltaTimeMs);

    landmarkMotions.push(lmMotion);

    totalMagnitude += lmMotion.magnitude;
    if (lmMotion.magnitude > maxMagnitude) {
      maxMagnitude = lmMotion.magnitude;
    }

    totalSpeed += lmMotion.speed;
    if (lmMotion.speed > maxSpeed) {
      maxSpeed = lmMotion.speed;
    }
  }

  const count = landmarkMotions.length;
  const averageMagnitude = count > 0 ? totalMagnitude / count : 0;
  const averageSpeed = count > 0 ? totalSpeed / count : 0;

  return {
    handedness: currHand.handedness,
    confidence: currHand.confidence,
    landmarkMotions,
    averageMagnitude,
    maxMagnitude,
    averageSpeed,
    maxSpeed,
  };
}

/**
 * Computes the motion transition between two consecutive normalized frames.
 * Matches hands based on handedness ('Left' or 'Right').
 * Newly appearing or disappearing hands are safely ignored (no synthetic positions fabricated).
 */
export function computeMotionTransition(
  prevFrame: NormalizedFrame,
  currFrame: NormalizedFrame
): MotionTransition {
  const deltaTimeMs = currFrame.timestampMs - prevFrame.timestampMs;
  const matchedHandMotions: HandMotion[] = [];

  if (currFrame.hands && currFrame.hands.length > 0) {
    for (const currHand of currFrame.hands) {
      // Find matching hand in previous frame by handedness
      const prevHand = prevFrame.hands?.find(
        (ph) => ph.handedness === currHand.handedness
      );

      // Only compute motion if the same hand was present in previous frame
      if (prevHand) {
        const handMotion = computeHandMotion(prevHand, currHand, deltaTimeMs);
        matchedHandMotions.push(handMotion);
      }
    }
  }

  return {
    fromTimestampMs: prevFrame.timestampMs,
    toTimestampMs: currFrame.timestampMs,
    deltaTimeMs,
    hands: matchedHandMotions,
  };
}

/**
 * Extracts a temporal motion sequence from an array of normalized frames.
 * For N normalized frames, returns at most N - 1 motion transitions.
 * Pure function: does NOT mutate the input frames array.
 */
export function extractSequenceMotion(
  sequence: NormalizedFrame[]
): TemporalMotionSequence {
  if (!sequence || sequence.length < 2) {
    return { transitions: [] };
  }

  const transitions: MotionTransition[] = [];

  for (let i = 1; i < sequence.length; i++) {
    const prevFrame = sequence[i - 1];
    const currFrame = sequence[i];
    const transition = computeMotionTransition(prevFrame, currFrame);
    transitions.push(transition);
  }

  return { transitions };
}
