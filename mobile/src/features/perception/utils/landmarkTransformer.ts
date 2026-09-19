import { HandLandmark } from '../types';

export interface TransformationParams {
  imageWidth: number; // e.g. 960 (raw landscape buffer width)
  imageHeight: number; // e.g. 720 (raw landscape buffer height)
  rotationDegrees: number; // e.g. 270
  viewWidth: number; // e.g. 360 (viewport layout width in px)
  viewHeight: number; // e.g. 320 (viewport layout height in px)
  isFrontCamera?: boolean; // default true
}

export interface Point2D {
  x: number;
  y: number;
}

/**
 * Gate C.1: Single-pass, mathematically derived coordinate transformation pipeline.
 *
 * Pipeline:
 * MediaPipe raw coordinates (x_mp, y_mp) ∈ [0, 1]²
 *   → Orientation transform (based on CameraX rotationDegrees)
 *   → Front-camera horizontal mirror transform
 *   → Aspect-fill (cover) scale & crop centering offset
 *   → Viewport pixel coordinates (x_view, y_view)
 *
 * Rigid mathematical derivation for 270° front-camera orientation:
 * 270° rotation matrix maps raw landscape (x, y) to upright portrait:
 *   x_upright = 1 - y_raw
 *   y_upright = 1 - x_raw
 */
export function transformLandmarkToView(
  landmark: HandLandmark,
  params: TransformationParams
): Point2D {
  const {
    imageWidth,
    imageHeight,
    rotationDegrees,
    viewWidth,
    viewHeight,
    isFrontCamera = true,
  } = params;

  // Fallback defaults if image dimensions are uninitialized
  const imgW = imageWidth > 0 ? imageWidth : 960;
  const imgH = imageHeight > 0 ? imageHeight : 720;

  // Normalize rotation angle to [0, 360)
  const rot = ((rotationDegrees % 360) + 360) % 360;

  let uprightWidth: number;
  let uprightHeight: number;
  let xUpright: number;
  let yUpright: number;

  if (rot === 270) {
    // Front camera in portrait mode on Android (sensor rotated 270°)
    // Raw landscape image: W = 960, H = 720
    // Upright portrait image: W = 720, H = 960
    uprightWidth = imgH;
    uprightHeight = imgW;

    if (isFrontCamera) {
      // 270° counterclockwise rotation + horizontal mirror:
      // x_upright = 1 - y_raw
      // y_upright = 1 - x_raw
      xUpright = 1 - landmark.y;
      yUpright = 1 - landmark.x;
    } else {
      xUpright = landmark.y;
      yUpright = 1 - landmark.x;
    }
  } else if (rot === 90) {
    uprightWidth = imgH;
    uprightHeight = imgW;

    if (isFrontCamera) {
      xUpright = landmark.y;
      yUpright = landmark.x;
    } else {
      xUpright = 1 - landmark.y;
      yUpright = landmark.x;
    }
  } else if (rot === 180) {
    uprightWidth = imgW;
    uprightHeight = imgH;

    if (isFrontCamera) {
      xUpright = landmark.x;
      yUpright = 1 - landmark.y;
    } else {
      xUpright = 1 - landmark.x;
      yUpright = 1 - landmark.y;
    }
  } else {
    // 0 degrees
    uprightWidth = imgW;
    uprightHeight = imgH;

    if (isFrontCamera) {
      xUpright = 1 - landmark.x;
      yUpright = landmark.y;
    } else {
      xUpright = landmark.x;
      yUpright = landmark.y;
    }
  }

  // Aspect-Fill (cover) scale factor and crop centering offsets
  // PreviewView uses ScaleType.FILL_CENTER
  const scale = Math.max(viewWidth / uprightWidth, viewHeight / uprightHeight);

  const renderedWidth = uprightWidth * scale;
  const renderedHeight = uprightHeight * scale;

  const offsetX = (viewWidth - renderedWidth) / 2;
  const offsetY = (viewHeight - renderedHeight) / 2;

  // Map normalized upright coordinates [0, 1] to view pixel coordinates
  const xView = xUpright * renderedWidth + offsetX;
  const yView = yUpright * renderedHeight + offsetY;

  return { x: xView, y: yView };
}
