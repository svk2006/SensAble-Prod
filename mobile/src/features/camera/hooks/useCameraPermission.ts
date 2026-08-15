import { useState, useEffect, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { CameraPermissionState } from '../types';
import { CameraService } from '../services/cameraService';

export const useCameraPermission = () => {
  const [permissionState, setPermissionState] = useState<CameraPermissionState>('not-requested');
  const [isRequesting, setIsRequesting] = useState<boolean>(false);

  const checkPermission = useCallback(async () => {
    const current = await CameraService.checkPermission();
    setPermissionState(current);
    return current;
  }, []);

  useEffect(() => {
    checkPermission();

    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        checkPermission();
      }
    });

    return () => subscription.remove();
  }, [checkPermission]);

  const requestPermission = useCallback(async () => {
    setIsRequesting(true);
    try {
      const nextState = await CameraService.requestPermission();
      setPermissionState(nextState);
      return nextState;
    } finally {
      setIsRequesting(false);
    }
  }, []);

  return {
    permissionState,
    isRequesting,
    requestPermission,
    checkPermission,
    setPermissionState,
  };
};

