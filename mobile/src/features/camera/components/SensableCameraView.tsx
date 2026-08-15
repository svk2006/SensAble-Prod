import React, { useEffect, useRef, useState, useCallback } from 'react';
import { StyleSheet, View, Animated, ActivityIndicator } from 'react-native';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import { SensableText } from '../../../components/ui';
import { colors } from '../../../theme/colors';

export interface SensableCameraViewProps {
  isActive: boolean;
  position?: 'front' | 'back';
  reduceMotion?: boolean;
  onReadyChange?: (isReady: boolean) => void;
  onError?: (error: Error) => void;
}

export const SensableCameraView: React.FC<SensableCameraViewProps> = React.memo(({
  isActive,
  position = 'front',
  reduceMotion = false,
  onReadyChange,
  onError,
}) => {
  const device = useCameraDevice(position);
  const [isPreviewReady, setIsPreviewReady] = useState<boolean>(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Reset ready state if camera is deactivated
  useEffect(() => {
    if (!isActive) {
      setIsPreviewReady(false);
      fadeAnim.setValue(0);
      if (onReadyChange) {
        onReadyChange(false);
      }
    }
  }, [isActive, onReadyChange, fadeAnim]);

  const handlePreviewStarted = useCallback(() => {
    setIsPreviewReady(true);
    if (onReadyChange) {
      onReadyChange(true);
    }
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: reduceMotion ? 0 : 200,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, onReadyChange, reduceMotion]);

  const handlePreviewStopped = useCallback(() => {
    setIsPreviewReady(false);
    fadeAnim.setValue(0);
    if (onReadyChange) {
      onReadyChange(false);
    }
  }, [fadeAnim, onReadyChange]);

  const handleError = useCallback((err: Error) => {
    setIsPreviewReady(false);
    fadeAnim.setValue(0);
    if (onReadyChange) {
      onReadyChange(false);
    }
    if (onError) {
      onError(err);
    }
  }, [fadeAnim, onError, onReadyChange]);

  if (device == null) {
    return (
      <View style={styles.errorContainer}>
        <SensableText variant="body" color={colors.secondaryBodyText} align="center">
          Front camera hardware is unavailable.
        </SensableText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Dark baseline backdrop prevents white flashes during camera engine start */}
      <View style={styles.darkBackdrop} />

      {/* Native Camera Surface with animated opacity */}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: fadeAnim }]}>
        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={isActive}
          onPreviewStarted={handlePreviewStarted}
          onPreviewStopped={handlePreviewStopped}
          onError={handleError}
        />
      </Animated.View>

      {/* Starting / Loading Overlay before first preview frame renders */}
      {isActive && !isPreviewReady ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primaryTeal} />
          <SensableText
            variant="bodyBold"
            color={colors.surface}
            align="center"
            style={styles.loadingText}
          >
            Starting camera...
          </SensableText>
        </View>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
    backgroundColor: '#1B1B1E',
  },
  darkBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#1B1B1E',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(27, 27, 30, 0.85)',
    zIndex: 5,
  },
  loadingText: {
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.surface,
  },
});

