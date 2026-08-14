import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SensableText, SensableButton, SensableCard, SensableStatusBadge } from '../components/ui';
import { CameraVisual } from './OnboardingVisuals';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export interface OnboardingStepProps {
  onNext: () => void;
  onSkip: () => void;
}

export const OnboardingStep2: React.FC<OnboardingStepProps> = ({ onNext, onSkip }) => {
  return (
    <View style={styles.container}>
      <View>
        <SensableText variant="display" color={colors.primaryBodyText} style={styles.title}>
          Sign with your camera
        </SensableText>
        <SensableText variant="headline" color={colors.darkTealText} style={styles.subtitle}>
          Show a sign and SensAble will help turn it into spoken English.
        </SensableText>
      </View>

      <View style={styles.visualWrapper}>
        <CameraVisual />
      </View>

      <View>
        <SensableCard style={styles.infoCard}>
          <SensableStatusBadge
            label="Privacy First"
            variant="active"
            style={styles.privacyBadge}
          />
          <SensableText variant="body" color={colors.secondaryBodyText} align="center">
            Your video stays on your device. Video frames are never recorded or uploaded.
          </SensableText>
        </SensableCard>
      </View>

      <View style={styles.actionsRow}>
        <SensableButton
          label="Skip"
          variant="secondary"
          onPress={onSkip}
          accessibilityLabel="Skip to final onboarding step"
          style={styles.skipButton}
        />
        <SensableButton
          label="Next"
          variant="primary"
          onPress={onNext}
          accessibilityLabel="Continue to final onboarding screen"
          style={styles.nextButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    marginBottom: spacing.xs,
  },
  subtitle: {
    marginBottom: spacing.md,
  },
  visualWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCard: {
    padding: spacing.lg,
    marginVertical: spacing.sm,
    alignItems: 'center',
  },
  privacyBadge: {
    marginBottom: spacing.xs,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  skipButton: {
    flex: 1,
  },
  nextButton: {
    flex: 2,
  },
});
