import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, StyleSheet, Animated, AccessibilityInfo, AppState, AppStateStatus, Linking, useWindowDimensions } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import Svg, { Rect, Path, Circle } from 'react-native-svg';
import { SensableText, SensableButton, SensableStatusBadge } from '../../../components/ui';
import { SensableCameraView } from '../../camera/components/SensableCameraView';
import { useCameraPermission } from '../../camera/hooks/useCameraPermission';
import { TranslateStateData } from '../types';
import { colors } from '../../../theme/colors';
import { shapes } from '../../../theme/shapes';
import { spacing } from '../../../theme/spacing';
import { shadows } from '../../../theme/shadows';

export interface CameraViewportCardProps {
  stateData: TranslateStateData;
  onCameraActiveChange?: (isActive: boolean) => void;
  onToggleCameraPlaceholder?: () => void;
}

export const CameraViewportCard: React.FC<CameraViewportCardProps> = React.memo(({
  stateData,
  onCameraActiveChange,
  onToggleCameraPlaceholder,
}) => {
  const { permissionState, isRequesting, requestPermission, checkPermission } = useCameraPermission();
  const { height: windowHeight } = useWindowDimensions();
  // Responsively scale camera card height to ~52-55% of available content height
  const calculatedCardHeight = Math.max(320, Math.round(windowHeight * 0.44));

  const isFocused = useIsFocused();
  const [appState, setAppState] = useState<AppStateStatus>('active');
  const [isCameraTurnedOn, setIsCameraTurnedOn] = useState<boolean>(false);
  const [isCameraReady, setIsCameraReady] = useState<boolean>(false);
  const [hasCameraError, setHasCameraError] = useState<boolean>(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [reduceMotion, setReduceMotion] = useState<boolean>(false);
  const prevBadgeLabelRef = useRef<string>('');

  // Accessibility reduce-motion check
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
  }, []);

  // Monitor AppState (active, background, inactive)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      setAppState(nextAppState);
    });
    return () => subscription.remove();
  }, []);

  // Real Camera hardware is active ONLY when permission granted, user turned on, tab focused, app active, and no error
  const isCameraActive =
    permissionState === 'granted' &&
    isCameraTurnedOn &&
    isFocused &&
    appState === 'active' &&
    !hasCameraError;

  // Notify parent component of active camera status
  useEffect(() => {
    if (onCameraActiveChange) {
      onCameraActiveChange(isCameraActive);
    }
  }, [isCameraActive, onCameraActiveChange]);

  // Handle Camera Ready callback from native preview surface
  const handleReadyChange = useCallback((ready: boolean) => {
    setIsCameraReady(ready);
  }, []);

  // Handle Camera Error from VisionCamera
  const handleCameraError = useCallback((_err: Error) => {
    setHasCameraError(true);
    setIsCameraReady(false);
  }, []);

  // Retry Camera action
  const handleRetryCamera = useCallback(() => {
    setHasCameraError(false);
    setIsCameraReady(false);
    checkPermission();
  }, [checkPermission]);

  // Turn On Camera Action
  const handleTurnOnCamera = useCallback(async () => {
    setHasCameraError(false);
    if (permissionState === 'granted') {
      setIsCameraTurnedOn(true);
      if (onToggleCameraPlaceholder) {
        onToggleCameraPlaceholder();
      }
    } else if (permissionState === 'permanently-denied') {
      await Linking.openSettings();
    } else {
      const res = await requestPermission();
      if (res === 'granted') {
        setIsCameraTurnedOn(true);
        if (onToggleCameraPlaceholder) {
          onToggleCameraPlaceholder();
        }
      }
    }
  }, [permissionState, requestPermission, onToggleCameraPlaceholder]);

  // Turn Off Camera Action
  const handleTurnOffCamera = useCallback(() => {
    setIsCameraTurnedOn(false);
    setIsCameraReady(false);
    if (onToggleCameraPlaceholder) {
      onToggleCameraPlaceholder();
    }
  }, [onToggleCameraPlaceholder]);

  // Open System Settings Action
  const handleOpenSettings = useCallback(async () => {
    await Linking.openSettings();
  }, []);

  // Pulse animation loop for active camera ready badge
  useEffect(() => {
    if (reduceMotion || !isCameraActive || !isCameraReady) {
      pulseAnim.setValue(1);
      return;
    }

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1.0,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.start();

    return () => pulseLoop.stop();
  }, [reduceMotion, isCameraActive, isCameraReady, pulseAnim]);

  // Determine Badge Label & Variant based on exact state hierarchy
  const getBadgeInfo = () => {
    if (hasCameraError) {
      return { label: 'Camera Error', variant: 'error' as const };
    }
    if (permissionState === 'permanently-denied') {
      return { label: 'Blocked in Settings', variant: 'warning' as const };
    }
    if (permissionState === 'denied') {
      return { label: 'Permission Required', variant: 'warning' as const };
    }
    if (isRequesting) {
      return { label: 'Requesting...', variant: 'neutral' as const };
    }
    if (isCameraActive) {
      if (isCameraReady) {
        return { label: 'Ready! Show a sign', variant: 'success' as const };
      }
      return { label: 'Starting camera...', variant: 'warning' as const };
    }
    return { label: 'Camera is off', variant: 'neutral' as const };
  };

  const badgeInfo = getBadgeInfo();
  const currentBadgeLabel = stateData.isDemoActive ? stateData.statusBadgeLabel : badgeInfo.label;

  // Announce status changes for screen readers
  useEffect(() => {
    if (currentBadgeLabel && currentBadgeLabel !== prevBadgeLabelRef.current) {
      prevBadgeLabelRef.current = currentBadgeLabel;
      AccessibilityInfo.announceForAccessibility(`Camera status: ${currentBadgeLabel}`);
    }
  }, [currentBadgeLabel]);

  // Render camera viewport main surface based on state
  const renderViewportContent = () => {
    // State 7: Camera Error State
    if (hasCameraError) {
      return (
        <View style={styles.placeholderBox}>
          <Svg width={64} height={64} viewBox="0 0 64 64" fill="none">
            <Circle cx="32" cy="32" r="28" fill={`${colors.error}15`} />
            <Path
              d="M32 20V36M32 44H32.02"
              stroke={colors.error}
              strokeWidth="4"
              strokeLinecap="round"
            />
          </Svg>

          <SensableText variant="headline" style={styles.placeholderTitle}>
            Camera couldn't start
          </SensableText>

          <SensableText
            variant="body"
            color={colors.secondaryBodyText}
            align="center"
            style={styles.placeholderBody}
          >
            Let's try starting your camera again.
          </SensableText>

          <SensableButton
            label="Retry Camera"
            variant="primary"
            onPress={handleRetryCamera}
            accessibilityLabel="Retry starting native camera preview"
            style={styles.actionButton}
          />
        </View>
      );
    }

    // State 6: Permanently Blocked Permission State
    if (permissionState === 'permanently-denied') {
      return (
        <View style={styles.placeholderBox}>
          <Svg width={64} height={64} viewBox="0 0 64 64" fill="none">
            <Circle cx="32" cy="32" r="28" fill={`${colors.warning}20`} />
            <Path
              d="M24 28V24A8 8 0 0 1 40 24V28M20 28H44A4 4 0 0 1 48 32V44A4 4 0 0 1 44 48H20A4 4 0 0 1 16 44V32A4 4 0 0 1 20 28Z"
              stroke={colors.darkWarningText}
              strokeWidth="3"
              strokeLinecap="round"
            />
          </Svg>

          <SensableText variant="headline" style={styles.placeholderTitle}>
            Camera Access Blocked
          </SensableText>

          <SensableText
            variant="body"
            color={colors.secondaryBodyText}
            align="center"
            style={styles.placeholderBody}
          >
            Camera access is turned off in your device settings. Please open Settings to allow camera access for SensAble.
          </SensableText>

          <SensableButton
            label="Open Settings"
            variant="primary"
            onPress={handleOpenSettings}
            accessibilityLabel="Open device settings to allow camera permission"
            style={styles.actionButton}
          />
        </View>
      );
    }

    // State 5: Permission Denied State (Retryable)
    if (permissionState === 'denied') {
      return (
        <View style={styles.placeholderBox}>
          <Svg width={64} height={64} viewBox="0 0 64 64" fill="none">
            <Circle cx="32" cy="32" r="28" fill={`${colors.primaryTeal}15`} />
            <Path
              d="M42 36V26A4 4 0 0 0 38 22H26A4 4 0 0 0 22 26V36A4 4 0 0 0 26 40H38A4 4 0 0 0 42 36Z"
              stroke={colors.primaryTeal}
              strokeWidth="3"
            />
            <Circle cx="32" cy="31" r="4" stroke={colors.primaryTeal} strokeWidth="3" />
          </Svg>

          <SensableText variant="headline" style={styles.placeholderTitle}>
            Camera Permission Needed
          </SensableText>

          <SensableText
            variant="body"
            color={colors.secondaryBodyText}
            align="center"
            style={styles.placeholderBody}
          >
            SensAble needs camera access to see and translate your signs.
          </SensableText>

          <SensableButton
            label={isRequesting ? "Requesting..." : "Try Again"}
            variant="primary"
            onPress={handleTurnOnCamera}
            accessibilityLabel="Request camera permission again"
            style={styles.actionButton}
          />
        </View>
      );
    }

    // State 3 & 4: Active Native Camera Viewport (Camera Starting / Camera Ready)
    if (permissionState === 'granted' && isCameraTurnedOn) {
      return (
        <View style={[styles.activeViewfinder, { minHeight: calculatedCardHeight, height: calculatedCardHeight }]}>
          <SensableCameraView
            isActive={isCameraActive}
            position="front"
            reduceMotion={reduceMotion}
            onReadyChange={handleReadyChange}
            onError={handleCameraError}
          />

          {/* Corner Viewfinder Overlay Frame (Visible when ready) */}
          {isCameraReady ? (
            <Svg
              width="100%"
              height="100%"
              viewBox="0 0 240 160"
              preserveAspectRatio="none"
              style={StyleSheet.absoluteFill}
              pointerEvents="none"
            >
              <Rect
                x="20"
                y="15"
                width="200"
                height="130"
                rx="12"
                fill="transparent"
                stroke={colors.primaryTeal}
                strokeWidth="2"
                strokeDasharray="6 6"
              />
            </Svg>
          ) : null}

          <SensableButton
            label="Turn Off Camera"
            variant="secondary"
            onPress={handleTurnOffCamera}
            accessibilityLabel="Turn off native camera preview"
            style={styles.toggleOffButton}
          />
        </View>
      );
    }

    // State 1: Permission Required / Initial Camera Off Explanation Card
    return (
      <View style={styles.placeholderBox}>
        <Svg width={64} height={64} viewBox="0 0 64 64" fill="none">
          <Circle cx="32" cy="32" r="28" fill={`${colors.primaryTeal}12`} />
          <Path
            d="M42 36V26A4 4 0 0 0 38 22H26A4 4 0 0 0 22 26V36A4 4 0 0 0 26 40H38A4 4 0 0 0 42 36Z"
            stroke={colors.primaryTeal}
            strokeWidth="3"
          />
          <Circle cx="32" cy="31" r="4" stroke={colors.primaryTeal} strokeWidth="3" />
        </Svg>

        <SensableText variant="headline" style={styles.placeholderTitle}>
          Ready to sign?
        </SensableText>

        <SensableText
          variant="body"
          color={colors.secondaryBodyText}
          align="center"
          style={styles.placeholderBody}
        >
          SensAble uses your camera to see and understand your signs. Your video stays on your device.
        </SensableText>

        <SensableButton
          label={isRequesting ? "Requesting..." : "Turn On Camera"}
          variant="primary"
          onPress={handleTurnOnCamera}
          accessibilityLabel="Request camera permission and start native preview"
          style={styles.actionButton}
        />
      </View>
    );
  };

  return (
    <View style={[styles.cardContainer, { minHeight: calculatedCardHeight }]}>
      {/* Status Badge Overlay (Accessible & Scaled) */}
      <View style={styles.statusOverlay}>
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <SensableStatusBadge
            label={currentBadgeLabel}
            variant={stateData.isDemoActive ? stateData.statusBadgeVariant : badgeInfo.variant}
          />
        </Animated.View>
      </View>

      {/* Main Viewport Content */}
      <View style={styles.contentContainer}>
        {renderViewportContent()}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: colors.surface,
    borderRadius: shapes.cardRadius,
    minHeight: 240,
    flex: 1,
    overflow: 'hidden',
    ...shadows.cardSoft,
  },
  statusOverlay: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    zIndex: 10,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    marginTop: spacing.sm,
  },
  placeholderTitle: {
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  placeholderBody: {
    marginBottom: spacing.md,
    maxWidth: 280,
  },
  actionButton: {
    minWidth: 180,
    minHeight: 48,
  },
  activeViewfinder: {
    width: '100%',
    height: '100%',
    minHeight: 240,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: '#1B1B1E',
  },
  toggleOffButton: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
    zIndex: 20,
    minHeight: 48,
  },
});

