import { useEffect, useRef, useState } from 'react';
import { DeviceEventEmitter } from 'react-native';
import { HandLandmarksEvent } from '../types';
import { NormalizedFrame } from '../types/normalized';
import { normalizeLandmarks } from '../utils/landmarkNormalizer';
import { TemporalSequenceBuffer } from '../utils/TemporalSequenceBuffer';

/**
 * Gate C & C.1: Existing hook subscribing to native SensAbleHandLandmarks events.
 *
 * Returns raw HandLandmarksEvent | null directly for backwards compatibility with UI overlay.
 * Does NOT alter display coordinate behavior.
 */
export function useHandPerception(isEnabled: boolean = true): HandLandmarksEvent | null {
  const [perceptionData, setPerceptionData] = useState<HandLandmarksEvent | null>(null);

  useEffect(() => {
    if (!isEnabled) {
      setPerceptionData(null);
      return;
    }

    const subscription = DeviceEventEmitter.addListener(
      'SensAbleHandLandmarks',
      (event: HandLandmarksEvent) => {
        setPerceptionData(event);
      }
    );

    return () => {
      subscription.remove();
      setPerceptionData(null);
    };
  }, [isEnabled]);

  return perceptionData;
}

export interface NormalizedPerceptionState {
  raw: HandLandmarksEvent | null;
  normalized: NormalizedFrame | null;
  sequence: NormalizedFrame[];
}

/**
 * Step 11A: Enhanced perception hook providing raw, normalized, and temporal sequence data.
 *
 * Keeps raw event untouched for rendering while deriving normalized recognition data
 * and maintaining a bounded temporal sequence buffer for future sign recognition.
 */
export function useNormalizedHandPerception(
  isEnabled: boolean = true,
  capacity: number = 30
): NormalizedPerceptionState {
  const [state, setState] = useState<NormalizedPerceptionState>({
    raw: null,
    normalized: null,
    sequence: [],
  });

  const bufferRef = useRef<TemporalSequenceBuffer>(new TemporalSequenceBuffer(capacity));

  useEffect(() => {
    bufferRef.current.setCapacity(capacity);
  }, [capacity]);

  useEffect(() => {
    if (!isEnabled) {
      bufferRef.current.clear();
      setState({
        raw: null,
        normalized: null,
        sequence: [],
      });
      return;
    }

    const subscription = DeviceEventEmitter.addListener(
      'SensAbleHandLandmarks',
      (event: HandLandmarksEvent) => {
        const normalized = normalizeLandmarks(event);
        if (normalized) {
          bufferRef.current.push(normalized);
        }
        setState({
          raw: event,
          normalized,
          sequence: bufferRef.current.getSequence(),
        });
      }
    );

    return () => {
      subscription.remove();
      bufferRef.current.clear();
      setState({
        raw: null,
        normalized: null,
        sequence: [],
      });
    };
  }, [isEnabled]);

  return state;
}
