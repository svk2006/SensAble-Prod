import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, AccessibilityInfo } from 'react-native';
import { SensableText, SensableButton, SensableCard } from '../components/ui';
import { CompletionVisual } from './OnboardingVisuals';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export interface OnboardingStep3Props {
  onComplete: () => void;
}

export const OnboardingStep3: React.FC<OnboardingStep3Props> = ({ onComplete }) => {
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
  }, []);

  const handleStartSigning = () => {
    if (reduceMotion) {
      onComplete();
      return;
    }

    // Completion pulse animation: 0.96 -> 1.02 -> 1.0
    Animated.sequence([
      Animated.timing(buttonScaleAnim, {
        toValue: 0.96,
        duration: 60,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScaleAnim, {
        toValue: 1.02,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScaleAnim, {
        toValue: 1.0,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onComplete();
    });
  };

  return (
    <View style={styles.container}>
      <View>
        <SensableText variant="display" color={colors.primaryBodyText} style={styles.title}>
          You're All Set!
        </SensableText>
        <SensableText variant="headline" color={colors.darkTealText} style={styles.subtitle}>
          Ready to get started?
        </SensableText>
      </View>

      <View style={styles.visualWrapper}>
        <CompletionVisual />
      </View>

      <View>
        <SensableCard style={styles.infoCard}>
          <SensableText variant="body" color={colors.primaryBodyText} align="center" style={styles.cardHeading}>
            Ready to Explore
          </SensableText>
          <SensableText variant="body" color={colors.secondaryBodyText} align="center">
            Tap below to enter SensAble and start translating your signs!
          </SensableText>
        </SensableCard>
      </View>

      <Animated.View
        style={[
          styles.actionsContainer,
          {
            transform: [{ scale: buttonScaleAnim }],
          },
        ]}
      >
        <SensableButton
          label="Start Signing"
          variant="primary"
          onPress={handleStartSigning}
          accessibilityLabel="Complete onboarding and start signing"
          style={styles.startButton}
        />
      </Animated.View>
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
  cardHeading: {
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  actionsContainer: {
    marginTop: spacing.md,
  },
  startButton: {
    width: '100%',
  },
});
