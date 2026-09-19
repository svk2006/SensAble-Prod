import { useEffect, useState } from 'react';
import { DeviceEventEmitter } from 'react-native';
import { HandLandmarksEvent } from '../types';

/**
 * Gate C: Hook subscribing to native SensAbleHandLandmarks events.
 *
 * Stores ONLY the latest frame event in React state (no history buffer).
 * Cleans up DeviceEventEmitter listener and resets state to null when disabled/unmounted.
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
