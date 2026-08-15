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
        return 'denied';
      }
      return 'not-requested';
    } catch {
      return 'not-requested';
    }
  }

  public static async requestPermission(): Promise<CameraPermissionState> {
    try {
      const isGranted = await VisionCamera.requestCameraPermission();
      if (isGranted) {
        return 'granted';
      }
      return 'permanently-denied';
    } catch {
      return 'denied';
    }
  }
}
