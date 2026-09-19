import { HandDetection, HandLandmark, HandLandmarksEvent } from '../types';
import { NormalizedFrame, NormalizedHand, NormalizedLandmark } from '../types/normalized';

// MediaPipe Landmark Indices
const WRIST_INDEX = 0;
const MIDDLE_MCP_INDEX = 9;

/**
 * Normalizes a single hand detection:
 * 1. Uses Wrist (landmark 0) as origin (x=0, y=0, z=0).
 * 2. Calculates hand scale as 3D Euclidean distance from Wrist (0) to Middle Finger MCP (9).
 * 3. Divides wrist-relative coordinates by hand scale for scale invariance.
 *
 * Immutability: Does NOT mutate the input HandDetection object or landmark array.
 */
export function normalizeHand(hand: HandDetection): NormalizedHand {
  const landmarks = hand.landmarks;
  if (!landmarks || landmarks.length === 0) {
    return {
      handedness: hand.handedness,
      confidence: hand.confidence,
      scale: 1.0,
      wristOrigin: { x: 0, y: 0, z: 0 },
      landmarks: [],
    };
  }

  const wrist = landmarks[WRIST_INDEX] || { x: 0, y: 0, z: 0 };
  const middleMcp = landmarks[MIDDLE_MCP_INDEX] || wrist;

  // Calculate wrist-relative 3D offset to Middle MCP
  const dx9 = middleMcp.x - wrist.x;
  const dy9 = middleMcp.y - wrist.y;
  const dz9 = middleMcp.z - wrist.z;

  // 3D Euclidean distance as reference scale
  const dist = Math.sqrt(dx9 * dx9 + dy9 * dy9 + dz9 * dz9);
  const scale = dist > 1e-6 ? dist : 1.0;

  const normalizedLandmarks: NormalizedLandmark[] = landmarks.map((lm, idx) => {
    const dx = lm.x - wrist.x;
    const dy = lm.y - wrist.y;
    const dz = lm.z - wrist.z;

    return {
      index: idx,
      x: dx / scale,
      y: dy / scale,
      z: dz / scale,
    };
  });

  return {
    handedness: hand.handedness,
    confidence: hand.confidence,
    scale,
    wristOrigin: {
      x: wrist.x,
      y: wrist.y,
      z: wrist.z,
    },
    landmarks: normalizedLandmarks,
  };
}

/**
 * Converts a raw HandLandmarksEvent into a clean NormalizedFrame.
 *
 * Immutability: Pure function; does NOT mutate the input event.
 */
export function normalizeLandmarks(event: HandLandmarksEvent | null): NormalizedFrame | null {
  if (!event) {
    return null;
  }

  const hands = event.hands ? event.hands.map((hand) => normalizeHand(hand)) : [];

  return {
    timestampMs: event.timestampMs,
    hands,
  };
}
