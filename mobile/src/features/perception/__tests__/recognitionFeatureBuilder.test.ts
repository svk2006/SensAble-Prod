import { MotionTransition } from '../types/motion';
import { NormalizedFrame, NormalizedHand, NormalizedLandmark } from '../types/normalized';
import {
  createRecognitionFrame,
  createRecognitionSequence,
  FEATURES_PER_HAND_SLOT,
  TOTAL_FRAME_FEATURES,
  toRecognitionFeatureVector,
  toRecognitionSequenceVectors,
} from '../utils/recognitionFeatureBuilder';

describe('Step 11C: Recognition Feature Representation', () => {
  const createNormalizedHand = (
    handedness: 'Left' | 'Right' = 'Right',
    xOffset: number = 0,
    yOffset: number = 0
  ): NormalizedHand => {
    const landmarks: NormalizedLandmark[] = Array.from({ length: 21 }, (_, i) => ({
      index: i,
      x: i * 0.05 + xOffset,
      y: i * 0.1 + yOffset,
      z: i * 0.01,
    }));

    return {
      handedness,
      confidence: 0.92,
      scale: 0.15,
      wristOrigin: { x: 0.4, y: 0.6, z: 0 },
      landmarks,
    };
  };

  const createNormalizedFrame = (
    timestampMs: number,
    hands: NormalizedHand[]
  ): NormalizedFrame => ({
    timestampMs,
    hands,
  });

  test('1. A normalized one-hand frame produces a recognition frame', () => {
    const hand = createNormalizedHand('Right');
    const normFrame = createNormalizedFrame(1000, [hand]);

    const recFrame = createRecognitionFrame(normFrame);

    expect(recFrame).toBeDefined();
    expect(recFrame.timestampMs).toBe(1000);
    expect(recFrame.hands.length).toBe(1);
    expect(recFrame.hands[0].handedness).toBe('Right');
  });

  test('2. All 21 normalized landmarks are preserved in recognition frame', () => {
    const hand = createNormalizedHand('Left');
    const recFrame = createRecognitionFrame(createNormalizedFrame(1000, [hand]));

    expect(recFrame.hands[0].spatial.landmarks.length).toBe(21);
    for (let i = 0; i < 21; i++) {
      expect(recFrame.hands[0].spatial.landmarks[i].index).toBe(i);
      expect(recFrame.hands[0].spatial.landmarks[i].x).toBe(hand.landmarks[i].x);
    }
  });

  test('3. Motion data is included correctly when transition is provided', () => {
    const hand1 = createNormalizedHand('Right', 0, 0);
    const hand2 = createNormalizedHand('Right', 0.1, 0.2);

    const f1 = createNormalizedFrame(1000, [hand1]);
    const f2 = createNormalizedFrame(1100, [hand2]);

    const seq = createRecognitionSequence([f1, f2]);

    expect(seq.frames.length).toBe(2);
    expect(seq.frames[1].hands[0].motion).not.toBeNull();
    expect(seq.frames[1].hands[0].motion?.landmarkMotions[0].dx).toBeCloseTo(0.1, 5);
    expect(seq.frames[1].hands[0].motion?.landmarkMotions[0].dy).toBeCloseTo(0.2, 5);
  });

  test('4. Handedness is preserved', () => {
    const leftHand = createNormalizedHand('Left');
    const recFrame = createRecognitionFrame(createNormalizedFrame(1000, [leftHand]));

    expect(recFrame.hands[0].handedness).toBe('Left');
  });

  test('5. Confidence score is preserved', () => {
    const hand = createNormalizedHand('Right');
    hand.confidence = 0.97;
    const recFrame = createRecognitionFrame(createNormalizedFrame(1000, [hand]));

    expect(recFrame.hands[0].confidence).toBe(0.97);
  });

  test('6. Two hands remain separate and independent', () => {
    const left = createNormalizedHand('Left', 0, 0);
    const right = createNormalizedHand('Right', 0.5, 0);

    const recFrame = createRecognitionFrame(createNormalizedFrame(1000, [left, right]));

    expect(recFrame.hands.length).toBe(2);
    expect(recFrame.hands[0].handedness).toBe('Left');
    expect(recFrame.hands[1].handedness).toBe('Right');
    expect(recFrame.hands[0].spatial.landmarks[0].x).not.toEqual(recFrame.hands[1].spatial.landmarks[0].x);
  });

  test('7. Missing left hand is handled deterministically (isPresent = 0 in vector)', () => {
    const rightOnly = createNormalizedHand('Right');
    const recFrame = createRecognitionFrame(createNormalizedFrame(1000, [rightOnly]));

    const vec = toRecognitionFeatureVector(recFrame);

    expect(vec.length).toBe(TOTAL_FRAME_FEATURES); // 476
    // Left slot (0..237): isPresent is 0
    expect(vec[0]).toBe(0.0);
    expect(vec[1]).toBe(0.0); // conf
    // Right slot (238..475): isPresent is 1
    expect(vec[FEATURES_PER_HAND_SLOT]).toBe(1.0);
    expect(vec[FEATURES_PER_HAND_SLOT + 1]).toBe(0.92); // conf
  });

  test('8. Missing right hand is handled deterministically (isPresent = 0 in vector)', () => {
    const leftOnly = createNormalizedHand('Left');
    const recFrame = createRecognitionFrame(createNormalizedFrame(1000, [leftOnly]));

    const vec = toRecognitionFeatureVector(recFrame);

    expect(vec.length).toBe(TOTAL_FRAME_FEATURES); // 476
    // Left slot (0..237): isPresent is 1
    expect(vec[0]).toBe(1.0);
    expect(vec[1]).toBe(0.92);
    // Right slot (238..475): isPresent is 0
    expect(vec[FEATURES_PER_HAND_SLOT]).toBe(0.0);
    expect(vec[FEATURES_PER_HAND_SLOT + 1]).toBe(0.0);
  });

  test('9. First frame does not fabricate motion (motion = null, deltaTimeMs = 0)', () => {
    const f1 = createNormalizedFrame(1000, [createNormalizedHand('Right')]);
    const recFrame = createRecognitionFrame(f1, null);

    expect(recFrame.deltaTimeMs).toBe(0);
    expect(recFrame.hands[0].motion).toBeNull();
  });

  test('10. Timestamp ordering is preserved in recognition sequence', () => {
    const f1 = createNormalizedFrame(1000, [createNormalizedHand('Right')]);
    const f2 = createNormalizedFrame(1100, [createNormalizedHand('Right')]);
    const f3 = createNormalizedFrame(1200, [createNormalizedHand('Right')]);

    const seq = createRecognitionSequence([f1, f2, f3]);

    expect(seq.frames.length).toBe(3);
    expect(seq.frames[0].timestampMs).toBe(1000);
    expect(seq.frames[1].timestampMs).toBe(1100);
    expect(seq.frames[2].timestampMs).toBe(1200);
  });

  test('11. Feature-vector ordering is deterministic (always 476 floats, Left slot then Right slot)', () => {
    const emptyFrame = createRecognitionFrame(createNormalizedFrame(1000, []));
    const vecEmpty = toRecognitionFeatureVector(emptyFrame);

    expect(vecEmpty.length).toBe(TOTAL_FRAME_FEATURES);
    expect(vecEmpty.every((v) => v === 0)).toBe(true);

    const twoHandFrame = createRecognitionFrame(
      createNormalizedFrame(1000, [createNormalizedHand('Right'), createNormalizedHand('Left')])
    );
    const vecTwo = toRecognitionFeatureVector(twoHandFrame);

    expect(vecTwo.length).toBe(TOTAL_FRAME_FEATURES);
    expect(vecTwo[0]).toBe(1.0); // Left isPresent
    expect(vecTwo[FEATURES_PER_HAND_SLOT]).toBe(1.0); // Right isPresent
  });

  test('12. Same input produces identical feature vectors', () => {
    const frame = createRecognitionFrame(
      createNormalizedFrame(1000, [createNormalizedHand('Left', 0.1, 0.2)])
    );

    const vec1 = toRecognitionFeatureVector(frame);
    const vec2 = toRecognitionFeatureVector(frame);

    expect(vec1).toEqual(vec2);
  });

  test('13. Input objects are not mutated during feature extraction', () => {
    const normFrame = createNormalizedFrame(1000, [createNormalizedHand('Right')]);
    const copy = JSON.parse(JSON.stringify(normFrame));

    createRecognitionFrame(normFrame);
    toRecognitionFeatureVector(createRecognitionFrame(normFrame));

    expect(normFrame).toEqual(copy);
  });

  test('14. Empty sequence is handled safely', () => {
    const seq = createRecognitionSequence([]);

    expect(seq.frames.length).toBe(0);
    const vecs = toRecognitionSequenceVectors(seq);
    expect(vecs).toEqual([]);
  });

  test('15. A multi-frame sequence preserves chronological order and vector matrix shape', () => {
    const f1 = createNormalizedFrame(1000, [createNormalizedHand('Left', 0, 0)]);
    const f2 = createNormalizedFrame(1050, [createNormalizedHand('Left', 0.1, 0.1)]);
    const f3 = createNormalizedFrame(1100, [createNormalizedHand('Left', 0.2, 0.2)]);

    const seq = createRecognitionSequence([f1, f2, f3]);
    const vecs = toRecognitionSequenceVectors(seq);

    expect(vecs.length).toBe(3); // 3 frames
    expect(vecs[0].length).toBe(TOTAL_FRAME_FEATURES); // 476
    expect(vecs[1].length).toBe(TOTAL_FRAME_FEATURES); // 476
    expect(vecs[2].length).toBe(TOTAL_FRAME_FEATURES); // 476

    // Frame 0 has motion values = 0 (first frame)
    expect(vecs[0][66]).toBe(0); // dx of landmark 0
    // Frame 1 has non-zero motion values (dx = 0.1)
    expect(vecs[1][66]).toBeCloseTo(0.1, 5);
  });
});
