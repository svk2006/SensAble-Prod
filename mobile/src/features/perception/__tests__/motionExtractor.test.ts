import { NormalizedFrame, NormalizedHand, NormalizedLandmark } from '../types/normalized';
import {
  computeHandMotion,
  computeLandmarkMotion,
  computeMotionTransition,
  extractSequenceMotion,
} from '../utils/motionExtractor';

describe('Step 11B: Temporal Motion Features', () => {
  // Helper to create a normalized hand with 21 landmarks
  const createNormalizedHand = (
    handedness: 'Left' | 'Right' = 'Right',
    xOffset: number = 0,
    yOffset: number = 0,
    zOffset: number = 0
  ): NormalizedHand => {
    const landmarks: NormalizedLandmark[] = Array.from({ length: 21 }, (_, i) => ({
      index: i,
      x: i * 0.1 + xOffset,
      y: i * 0.2 + yOffset,
      z: i * 0.05 + zOffset,
    }));

    return {
      handedness,
      confidence: 0.95,
      scale: 0.2,
      wristOrigin: { x: 0.5, y: 0.5, z: 0 },
      landmarks,
    };
  };

  const createFrame = (timestampMs: number, hands: NormalizedHand[]): NormalizedFrame => ({
    timestampMs,
    hands,
  });

  test('1. First frame produces no motion transition (N=1 -> 0 transitions)', () => {
    const seq: NormalizedFrame[] = [createFrame(100, [createNormalizedHand('Right')])];
    const motionSeq = extractSequenceMotion(seq);

    expect(motionSeq.transitions.length).toBe(0);
  });

  test('2. Identical consecutive frames produce zero movement', () => {
    const hand = createNormalizedHand('Right');
    const f1 = createFrame(100, [hand]);
    const f2 = createFrame(200, [hand]);

    const transition = computeMotionTransition(f1, f2);

    expect(transition.hands.length).toBe(1);
    const hMotion = transition.hands[0];
    expect(hMotion.averageMagnitude).toBeCloseTo(0, 5);
    expect(hMotion.maxMagnitude).toBeCloseTo(0, 5);
    expect(hMotion.averageSpeed).toBeCloseTo(0, 5);

    hMotion.landmarkMotions.forEach((lm) => {
      expect(lm.dx).toBeCloseTo(0, 5);
      expect(lm.dy).toBeCloseTo(0, 5);
      expect(lm.dz).toBeCloseTo(0, 5);
      expect(lm.magnitude).toBeCloseTo(0, 5);
    });
  });

  test('3. Known displacement produces expected dx/dy/dz', () => {
    const h1 = createNormalizedHand('Right', 0, 0, 0);
    const h2 = createNormalizedHand('Right', 0.5, 0.2, -0.1);

    const f1 = createFrame(1000, [h1]);
    const f2 = createFrame(1100, [h2]); // deltaTime = 100ms = 0.1s

    const transition = computeMotionTransition(f1, f2);
    const lm0 = transition.hands[0].landmarkMotions[0];

    expect(lm0.dx).toBeCloseTo(0.5, 5);
    expect(lm0.dy).toBeCloseTo(0.2, 5);
    expect(lm0.dz).toBeCloseTo(-0.1, 5);
  });

  test('4. Movement magnitude is mathematically correct: sqrt(dx² + dy² + dz²)', () => {
    const lm1: NormalizedLandmark = { index: 0, x: 0, y: 0, z: 0 };
    const lm2: NormalizedLandmark = { index: 0, x: 3, y: 4, z: 0 };

    const lmMotion = computeLandmarkMotion(lm1, lm2, 1000); // 1 second

    expect(lmMotion.dx).toBe(3);
    expect(lmMotion.dy).toBe(4);
    expect(lmMotion.dz).toBe(0);
    expect(lmMotion.magnitude).toBeCloseTo(5.0, 5); // sqrt(9 + 16) = 5
    expect(lmMotion.speed).toBeCloseTo(5.0, 5);      // 5 / 1s = 5
  });

  test('5. Positive x movement is preserved', () => {
    const h1 = createNormalizedHand('Left', 1.0, 0, 0);
    const h2 = createNormalizedHand('Left', 1.5, 0, 0);

    const transition = computeMotionTransition(createFrame(100, [h1]), createFrame(200, [h2]));
    expect(transition.hands[0].landmarkMotions[0].dx).toBeGreaterThan(0);
  });

  test('6. Positive y movement is preserved', () => {
    const h1 = createNormalizedHand('Left', 0, 1.0, 0);
    const h2 = createNormalizedHand('Left', 0, 1.8, 0);

    const transition = computeMotionTransition(createFrame(100, [h1]), createFrame(200, [h2]));
    expect(transition.hands[0].landmarkMotions[0].dy).toBeGreaterThan(0);
  });

  test('7. Positive z movement is preserved', () => {
    const h1 = createNormalizedHand('Left', 0, 0, 0.5);
    const h2 = createNormalizedHand('Left', 0, 0, 1.2);

    const transition = computeMotionTransition(createFrame(100, [h1]), createFrame(200, [h2]));
    expect(transition.hands[0].landmarkMotions[0].dz).toBeGreaterThan(0);
  });

  test('8. Timestamp difference is calculated correctly', () => {
    const f1 = createFrame(1000, [createNormalizedHand('Right')]);
    const f2 = createFrame(1250, [createNormalizedHand('Right')]);

    const transition = computeMotionTransition(f1, f2);

    expect(transition.fromTimestampMs).toBe(1000);
    expect(transition.toTimestampMs).toBe(1250);
    expect(transition.deltaTimeMs).toBe(250);
  });

  test('9. Zero timestamp difference does not produce invalid velocity or NaN', () => {
    const h1 = createNormalizedHand('Right', 0, 0, 0);
    const h2 = createNormalizedHand('Right', 1, 1, 1);

    const f1 = createFrame(1000, [h1]);
    const f2 = createFrame(1000, [h2]); // deltaTimeMs = 0

    const transition = computeMotionTransition(f1, f2);
    const lm = transition.hands[0].landmarkMotions[0];

    expect(transition.deltaTimeMs).toBe(0);
    expect(lm.vx).toBe(0);
    expect(lm.vy).toBe(0);
    expect(lm.vz).toBe(0);
    expect(lm.speed).toBe(0);
    expect(Number.isNaN(lm.vx)).toBe(false);
    expect(Number.isNaN(lm.speed)).toBe(false);
  });

  test('10. Two hands are matched independently by handedness', () => {
    const left1 = createNormalizedHand('Left', 0, 0, 0);
    const right1 = createNormalizedHand('Right', 0, 0, 0);

    const left2 = createNormalizedHand('Left', 0.2, 0, 0);
    const right2 = createNormalizedHand('Right', 0, 0.4, 0);

    // Swap order in frame 2 array: [Right, Left]
    const f1 = createFrame(100, [left1, right1]);
    const f2 = createFrame(200, [right2, left2]);

    const transition = computeMotionTransition(f1, f2);

    expect(transition.hands.length).toBe(2);

    const leftMotion = transition.hands.find((h) => h.handedness === 'Left');
    const rightMotion = transition.hands.find((h) => h.handedness === 'Right');

    expect(leftMotion).toBeDefined();
    expect(rightMotion).toBeDefined();

    expect(leftMotion?.landmarkMotions[0].dx).toBeCloseTo(0.2, 5);
    expect(leftMotion?.landmarkMotions[0].dy).toBeCloseTo(0, 5);

    expect(rightMotion?.landmarkMotions[0].dx).toBeCloseTo(0, 5);
    expect(rightMotion?.landmarkMotions[0].dy).toBeCloseTo(0.4, 5);
  });

  test('11. A newly appearing hand is handled safely without fabricating motion', () => {
    const f1 = createFrame(100, [createNormalizedHand('Right')]);
    // Frame 2 has Left and Right (Left is newly appearing)
    const f2 = createFrame(200, [createNormalizedHand('Right'), createNormalizedHand('Left')]);

    const transition = computeMotionTransition(f1, f2);

    // Only Right hand is matched; Left hand has no synthetic motion
    expect(transition.hands.length).toBe(1);
    expect(transition.hands[0].handedness).toBe('Right');
  });

  test('12. A disappearing hand is handled safely', () => {
    const f1 = createFrame(100, [createNormalizedHand('Left'), createNormalizedHand('Right')]);
    // Frame 2 has only Left (Right disappeared)
    const f2 = createFrame(200, [createNormalizedHand('Left')]);

    const transition = computeMotionTransition(f1, f2);

    expect(transition.hands.length).toBe(1);
    expect(transition.hands[0].handedness).toBe('Left');
  });

  test('13. Input normalized frames are not mutated during motion calculation', () => {
    const f1 = createFrame(100, [createNormalizedHand('Right')]);
    const f2 = createFrame(200, [createNormalizedHand('Right', 0.1, 0.1)]);

    const f1Copy = JSON.parse(JSON.stringify(f1));
    const f2Copy = JSON.parse(JSON.stringify(f2));

    computeMotionTransition(f1, f2);

    expect(f1).toEqual(f1Copy);
    expect(f2).toEqual(f2Copy);
  });

  test('14. A sequence of N frames produces N-1 transitions', () => {
    const seq: NormalizedFrame[] = [
      createFrame(100, [createNormalizedHand('Right', 0)]),
      createFrame(200, [createNormalizedHand('Right', 0.1)]),
      createFrame(300, [createNormalizedHand('Right', 0.2)]),
      createFrame(400, [createNormalizedHand('Right', 0.3)]),
    ];

    const motionSeq = extractSequenceMotion(seq);

    expect(motionSeq.transitions.length).toBe(3); // 4 - 1 = 3
    expect(motionSeq.transitions[0].fromTimestampMs).toBe(100);
    expect(motionSeq.transitions[0].toTimestampMs).toBe(200);
    expect(motionSeq.transitions[2].fromTimestampMs).toBe(300);
    expect(motionSeq.transitions[2].toTimestampMs).toBe(400);
  });

  test('15. Empty sequence (N=0) is handled safely', () => {
    const motionSeq = extractSequenceMotion([]);
    expect(motionSeq.transitions.length).toBe(0);
  });
});
