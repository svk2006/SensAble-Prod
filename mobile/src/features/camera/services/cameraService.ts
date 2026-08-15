import { VisionCamera } from 'react-native-vision-camera';
import { CameraPermissionState } from '../types';

export class CameraService {
  public static async checkPermission(): Promise<CameraPermissionState> {
    try {
      const status = VisionCamera.cameraPermissionStatus;
      if (status === 'authorized') {
        return 'granted';
      }
      if (status === 'denied' || status === 'restricted') {
        return 'permanently-denied';
      }
      return 'not-requested';
    } catch {
      return 'not-requested';
    }
  }

  public static async requestPermission(): Promise<CameraPermissionState> {
    try {
      const isGranted = await VisionCamera.requestCameraPermission();
      const status = VisionCamera.cameraPermissionStatus;
      if (isGranted || status === 'authorized') {
        return 'granted';
      }
      if (status === 'denied' || status === 'restricted') {
        return 'permanently-denied';
      }
      // Status is 'not-determined' after single denial -> can still retry
      return 'denied';
    } catch {
      return 'denied';
    }
  }
}

