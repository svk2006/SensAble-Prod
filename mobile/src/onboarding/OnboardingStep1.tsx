import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SensableText, SensableButton, SensableCard } from '../components/ui';
import { WelcomeVisual } from './OnboardingVisuals';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export interface OnboardingStepProps {
  onNext: () => void;
  onSkip: () => void;
}

export const OnboardingStep1: React.FC<OnboardingStepProps> = ({ onNext, onSkip }) => {
  return (
    <View style={styles.container}>
      <View>
        <SensableText variant="display" color={colors.primaryBodyText} style={styles.title}>
          Express Yourself Freely
        </SensableText>
        <SensableText variant="headline" color={colors.darkTealText} style={styles.subtitle}>
          Turn signs into spoken words and learn at your own pace!
        </SensableText>
      </View>

      <View style={styles.visualWrapper}>
        <WelcomeVisual />
      </View>

      <View>
        <SensableCard style={styles.infoCard}>
          <SensableText variant="body" color={colors.secondaryBodyText} align="center">
            SensAble translates your hand signs into clear speech and text instantly so everyone can understand.
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
          accessibilityLabel="Continue to next onboarding screen"
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
