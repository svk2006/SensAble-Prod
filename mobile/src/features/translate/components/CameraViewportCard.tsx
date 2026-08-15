import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, AccessibilityInfo, AppState, AppStateStatus } from 'react-native';
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

export const CameraViewportCard: React.FC<CameraViewportCardProps> = ({
  stateData,
  onCameraActiveChange,
  onToggleCameraPlaceholder,
}) => {
  const { permissionState, requestPermission } = useCameraPermission();
  const isFocused = useIsFocused();
  const [appState, setAppState] = useState<AppStateStatus>('active');
  const [isCameraTurnedOn, setIsCameraTurnedOn] = useState<boolean>(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [reduceMotion, setReduceMotion] = useState<boolean>(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
  }, []);

  // Listen to AppState (background / foreground)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      setAppState(nextAppState);
    });
    return () => subscription.remove();
  }, []);

  // Active camera state depends on: permission granted + user turned on + tab focused + app active
  const isCameraActive =
    permissionState === 'granted' &&
    isCameraTurnedOn &&
    isFocused &&
    appState === 'active';

  useEffect(() => {
    if (onCameraActiveChange) {
      onCameraActiveChange(isCameraActive);
    }
  }, [isCameraActive, onCameraActiveChange]);

  // 1.5s status pulse
  useEffect(() => {
    if (reduceMotion || !isCameraActive) {
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
  }, [reduceMotion, isCameraActive, pulseAnim]);

  const handleTurnOnCamera = async () => {
    if (permissionState === 'granted') {
      setIsCameraTurnedOn(true);
      if (onToggleCameraPlaceholder) {
        onToggleCameraPlaceholder();
      }
    } else {
      const res = await requestPermission();
      if (res === 'granted') {
        setIsCameraTurnedOn(true);
        if (onToggleCameraPlaceholder) {
          onToggleCameraPlaceholder();
        }
      }
    }
  };

  const handleTurnOffCamera = () => {
    setIsCameraTurnedOn(false);
    if (onToggleCameraPlaceholder) {
      onToggleCameraPlaceholder();
    }
  };

  // Determine status badge label & variant based on real state
  const getBadgeInfo = () => {
    if (isCameraActive) {
      return { label: 'Ready! Show a sign', variant: 'success' as const };
    }
    if (permissionState === 'denied' || permissionState === 'permanently-denied') {
      return { label: 'Permission Required', variant: 'warning' as const };
    }
    return { label: 'Camera is off', variant: 'neutral' as const };
  };

  const badgeInfo = getBadgeInfo();

  return (
    <View style={styles.cardContainer}>
      {/* Status Badge Overlay */}
      <View style={styles.statusOverlay}>
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <SensableStatusBadge
            label={stateData.isDemoActive ? stateData.statusBadgeLabel : badgeInfo.label}
            variant={stateData.isDemoActive ? stateData.statusBadgeVariant : badgeInfo.variant}
          />
        </Animated.View>
      </View>

      {/* Main Viewport Content */}
      <View style={styles.contentContainer}>
        {isCameraActive ? (
          /* REAL Camera Preview */
          <View style={styles.activeViewfinder}>
            <SensableCameraView isActive={isCameraActive} position="front" />

            {/* Corner Viewfinder Overlay Frame */}
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

            <SensableButton
              label="Turn Off Camera"
              variant="secondary"
              onPress={handleTurnOffCamera}
              accessibilityLabel="Turn off native camera preview"
              style={styles.toggleOffButton}
            />
          </View>
        ) : (
          /* Camera Off / Permission Explanation Card */
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
              {permissionState === 'granted' ? 'Ready to sign?' : 'Camera Access Needed'}
            </SensableText>

            <SensableText
              variant="body"
              color={colors.secondaryBodyText}
              align="center"
              style={styles.placeholderBody}
            >
              {permissionState === 'granted'
                ? 'Your camera will appear here when you turn it on.'
                : 'SensAble uses your camera to see and understand your signs. Your video stays on your device.'}
            </SensableText>

            <SensableButton
              label="Turn On Camera"
              variant="primary"
              onPress={handleTurnOnCamera}
              accessibilityLabel="Request camera permission and start preview"
              style={styles.actionButton}
            />
          </View>
        )}
      </View>
    </View>
  );
};

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
  },
  activeViewfinder: {
    width: '100%',
    height: '100%',
    minHeight: 240,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  toggleOffButton: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
    zIndex: 20,
  },
});
