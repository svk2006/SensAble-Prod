import { useState, useEffect, useCallback } from 'react';
import { CameraPermissionState } from '../types';
import { CameraService } from '../services/cameraService';

export const useCameraPermission = () => {
  const [permissionState, setPermissionState] = useState<CameraPermissionState>('not-requested');

  const checkPermission = useCallback(async () => {
    const current = await CameraService.checkPermission();
    setPermissionState(current);
  }, []);

  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  const requestPermission = useCallback(async () => {
    const nextState = await CameraService.requestPermission();
    setPermissionState(nextState);
    return nextState;
  }, []);

  return {
    permissionState,
    requestPermission,
    checkPermission,
  };
};
