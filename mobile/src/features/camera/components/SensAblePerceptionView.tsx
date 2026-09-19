/**
 * Gate A: JS wrapper for the native SensAblePerceptionView.
 *
 * Uses requireNativeComponent (legacy interop layer) which is supported
 * in RN 0.87 New Architecture via the Fabric interop compatibility layer.
 *
 * The native view manages its own CameraX lifecycle entirely:
 *   - startCamera() fires on onAttachedToWindow
 *   - stopCamera() fires on onDetachedFromWindow
 *
 * No frame data is passed from native to JS in Gate A.
 * No callbacks are needed in Gate A.
 * All Gate A evidence is in Logcat under tag "SensAblePerception".
 */

import { requireNativeComponent, type ViewProps } from 'react-native';

interface SensAblePerceptionViewProps extends ViewProps {
  // No custom props for Gate A — the view is fully self-contained.
}

/**
 * Native component backed by SensAblePerceptionView.kt.
 * Registered via SensAblePerceptionViewManager + SensAblePerceptionPackage.
 */
export const SensAblePerceptionView =
  requireNativeComponent<SensAblePerceptionViewProps>('SensAblePerceptionView');
