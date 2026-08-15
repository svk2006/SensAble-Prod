export type CameraPermissionState =
  | 'not-requested'
  | 'explanation'
  | 'granted'
  | 'denied'
  | 'permanently-denied';

export type CameraUXState =
  | 'permission-required'
  | 'requesting-permission'
  | 'camera-starting'
  | 'camera-ready'
  | 'permission-denied'
  | 'permanently-blocked'
  | 'camera-error';

export type CameraDevicePosition = 'front' | 'back';

export interface CameraStateData {
  permissionState: CameraPermissionState;
  uxState: CameraUXState;
  isActive: boolean;
  position: CameraDevicePosition;
  hasError: boolean;
  errorMessage?: string;
}

