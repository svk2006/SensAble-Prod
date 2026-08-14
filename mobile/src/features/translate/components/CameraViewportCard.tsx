import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, AccessibilityInfo } from 'react-native';
import Svg, { Rect, Path, Circle } from 'react-native-svg';
import { SensableText, SensableButton, SensableStatusBadge } from '../../../components/ui';
import { TranslateStateData } from '../types';
import { colors } from '../../../theme/colors';
import { shapes } from '../../../theme/shapes';
import { spacing } from '../../../theme/spacing';
import { shadows } from '../../../theme/shadows';

export interface CameraViewportCardProps {
  stateData: TranslateStateData;
  onToggleCameraPlaceholder: () => void;
}

export const CameraViewportCard: React.FC<CameraViewportCardProps> = ({
  stateData,
  onToggleCameraPlaceholder,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
  }, []);

  useEffect(() => {
    if (reduceMotion || stateData.uiState === 'camera-off') {
      pulseAnim.setValue(1);
      return;
    }

    // 1.5s gentle status pulse
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
  }, [reduceMotion, stateData.uiState, pulseAnim]);

  const isCameraActive = stateData.uiState !== 'camera-off';

  return (
    <View style={styles.cardContainer}>
      {/* Status Badge Overlay */}
      <View style={styles.statusOverlay}>
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <SensableStatusBadge
            label={stateData.statusBadgeLabel}
            variant={stateData.statusBadgeVariant}
          />
        </Animated.View>
      </View>

      {/* Main Viewport Content */}
      <View style={styles.contentContainer}>
        {!isCameraActive ? (
          /* Truthful Camera Off Placeholder */
          <View style={styles.placeholderBox}>
            <Svg width={72} height={72} viewBox="0 0 72 72" fill="none">
              <Circle cx="36" cy="36" r="32" fill={`${colors.primaryTeal}12`} />
              <Path
                d="M48 40V28A4 4 0 0 0 44 24H28A4 4 0 0 0 24 28V40A4 4 0 0 0 28 44H44A4 4 0 0 0 48 40Z"
                stroke={colors.primaryTeal}
                strokeWidth="3"
              />
              <Circle cx="36" cy="34" r="5" stroke={colors.primaryTeal} strokeWidth="3" />
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
              Your camera will appear here when you turn it on.
            </SensableText>

            <SensableButton
              label="Turn On Camera"
              variant="primary"
              onPress={onToggleCameraPlaceholder}
              accessibilityLabel="Turn on camera preview placeholder"
              style={styles.actionButton}
            />
          </View>
        ) : (
          /* Active Camera Viewfinder Placeholder */
          <View style={styles.activeViewfinder}>
            <Svg width="100%" height="100%" viewBox="0 0 240 160" preserveAspectRatio="none">
              {/* Corner Viewfinder Guide Frame */}
              <Rect
                x="20"
                y="15"
                width="200"
                height="130"
                rx="12"
                fill={`${colors.primaryTeal}08`}
                stroke={colors.primaryTeal}
                strokeWidth="2"
                strokeDasharray="6 6"
              />
              {/* Subtle Hand Guide Vector (Illustrative only, zero fake tracking) */}
              <Path
                d="M100 110V80A5 5 0 0 1 110 80V110M110 110V70A5 5 0 0 1 120 70V110M120 110V75A5 5 0 0 1 130 75V110"
                stroke={`${colors.darkTealText}40`}
                strokeWidth="3"
                strokeLinecap="round"
              />
            </Svg>
            <SensableButton
              label="Turn Off Camera"
              variant="secondary"
              onPress={onToggleCameraPlaceholder}
              accessibilityLabel="Turn off camera preview placeholder"
              style={styles.toggleOffButton}
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
    minHeight: 220,
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
    padding: spacing.lg,
  },
  placeholderBox: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  placeholderTitle: {
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  placeholderBody: {
    marginBottom: spacing.lg,
  },
  actionButton: {
    minWidth: 180,
  },
  activeViewfinder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  toggleOffButton: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
  },
});
