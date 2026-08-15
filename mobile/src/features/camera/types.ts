export type CameraPermissionState =
  | 'not-requested'
  | 'explanation'
  | 'granted'
  | 'denied'
  | 'permanently-denied';

export type CameraDevicePosition = 'front' | 'back';

export interface CameraStateData {
  permissionState: CameraPermissionState;
  isActive: boolean;
  position: CameraDevicePosition;
  hasError: boolean;
  errorMessage?: string;
}
