import { HandDetection, HandLandmark, HandLandmarksEvent } from '../types';
import { normalizeHand, normalizeLandmarks } from '../utils/landmarkNormalizer';
import { TemporalSequenceBuffer } from '../utils/TemporalSequenceBuffer';

describe('Step 11A: Landmark Normalization & Temporal Sequence Buffer', () => {
  // Helper to construct a synthetic 21-landmark hand
  const createTestHand = (
    handedness: 'Left' | 'Right' = 'Right',
    offsetX: number = 0,
    offsetY: number = 0,
    scaleFactor: number = 1.0
  ): HandDetection => {
    const baseLandmarks: HandLandmark[] = Array.from({ length: 21 }, (_, i) => ({
      x: (i * 0.02 + 0.1) * scaleFactor + offsetX,
      y: (i * 0.03 + 0.2) * scaleFactor + offsetY,
      z: i * 0.005 * scaleFactor,
    }));

    return {
      handedness,
      confidence: 0.95,
      landmarks: baseLandmarks,
    };
  };

  test('1. Wrist (landmark 0) becomes origin (0, 0, 0) in normalized space', () => {
    const hand = createTestHand('Right', 0.25, 0.45);
    const normalized = normalizeHand(hand);

    expect(normalized.landmarks.length).toBe(21);
    expect(normalized.landmarks[0].index).toBe(0);
    expect(normalized.landmarks[0].x).toBeCloseTo(0, 5);
    expect(normalized.landmarks[0].y).toBeCloseTo(0, 5);
    expect(normalized.landmarks[0].z).toBeCloseTo(0, 5);
  });

  test('2. Translation invariance: shifted hand produces identical normalized geometry', () => {
    const hand1 = createTestHand('Right', 0.0, 0.0);
    const hand2 = createTestHand('Right', 0.35, -0.2); // shifted hand

    const norm1 = normalizeHand(hand1);
    const norm2 = normalizeHand(hand2);

    for (let i = 0; i < 21; i++) {
      expect(norm1.landmarks[i].x).toBeCloseTo(norm2.landmarks[i].x, 5);
      expect(norm1.landmarks[i].y).toBeCloseTo(norm2.landmarks[i].y, 5);
      expect(norm1.landmarks[i].z).toBeCloseTo(norm2.landmarks[i].z, 5);
    }
  });

  test('3. Scale invariance: scaled hand produces equivalent normalized geometry', () => {
    const hand1 = createTestHand('Right', 0.1, 0.1, 1.0);
    const hand2 = createTestHand('Right', 0.1, 0.1, 2.5); // scaled hand 2.5x

    const norm1 = normalizeHand(hand1);
    const norm2 = normalizeHand(hand2);

    for (let i = 0; i < 21; i++) {
      expect(norm1.landmarks[i].x).toBeCloseTo(norm2.landmarks[i].x, 5);
      expect(norm1.landmarks[i].y).toBeCloseTo(norm2.landmarks[i].y, 5);
      expect(norm1.landmarks[i].z).toBeCloseTo(norm2.landmarks[i].z, 5);
    }
  });

  test('4. Immutability: input objects are not mutated during normalization', () => {
    const hand = createTestHand('Left', 0.1, 0.2);
    const handCopy = JSON.parse(JSON.stringify(hand));

    normalizeHand(hand);

    expect(hand).toEqual(handCopy);
  });

  test('5. Exactly 21 landmarks are preserved', () => {
    const hand = createTestHand('Right');
    const normalized = normalizeHand(hand);

    expect(normalized.landmarks.length).toBe(21);
    for (let i = 0; i < 21; i++) {
      expect(normalized.landmarks[i].index).toBe(i);
    }
  });

  test('6. One-hand input event works correctly', () => {
    const event: HandLandmarksEvent = {
      timestampMs: 1000,
      imageWidth: 960,
      imageHeight: 720,
      rotationDegrees: 270,
      hands: [createTestHand('Right')],
    };

    const normFrame = normalizeLandmarks(event);
    expect(normFrame).not.toBeNull();
    expect(normFrame?.hands.length).toBe(1);
    expect(normFrame?.hands[0].handedness).toBe('Right');
    expect(normFrame?.hands[0].landmarks.length).toBe(21);
  });

  test('7. Two-hand input event works correctly', () => {
    const event: HandLandmarksEvent = {
      timestampMs: 1050,
      imageWidth: 960,
      imageHeight: 720,
      rotationDegrees: 270,
      hands: [createTestHand('Left'), createTestHand('Right', 0.2, 0.2)],
    };

    const normFrame = normalizeLandmarks(event);
    expect(normFrame).not.toBeNull();
    expect(normFrame?.hands.length).toBe(2);
    expect(normFrame?.hands[0].handedness).toBe('Left');
    expect(normFrame?.hands[1].handedness).toBe('Right');
  });

  test('8. Empty or null input handled safely', () => {
    expect(normalizeLandmarks(null)).toBeNull();

    const emptyEvent: HandLandmarksEvent = {
      timestampMs: 1100,
      imageWidth: 960,
      imageHeight: 720,
      rotationDegrees: 270,
      hands: [],
    };

    const normEmpty = normalizeLandmarks(emptyEvent);
    expect(normEmpty).not.toBeNull();
    expect(normEmpty?.hands).toEqual([]);
  });

  test('9. Temporal sequence buffer respects maximum capacity', () => {
    const buffer = new TemporalSequenceBuffer(3);

    for (let i = 1; i <= 5; i++) {
      buffer.push({
        timestampMs: i * 100,
        hands: [],
      });
    }

    expect(buffer.size).toBe(3);
    const seq = buffer.getSequence();
    expect(seq.map((f) => f.timestampMs)).toEqual([300, 400, 500]);
  });

  test('10. Temporal sequence buffer reset works correctly', () => {
    const buffer = new TemporalSequenceBuffer(10);
    buffer.push({ timestampMs: 100, hands: [] });
    buffer.push({ timestampMs: 200, hands: [] });

    expect(buffer.size).toBe(2);
    buffer.clear();
    expect(buffer.size).toBe(0);
    expect(buffer.getSequence()).toEqual([]);
  });
});
