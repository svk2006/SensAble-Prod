import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { colors } from '../theme/colors';
import { shapes } from '../theme/shapes';
import { spacing } from '../theme/spacing';

export interface OnboardingStepperProps {
  currentStep: number; // 1, 2, or 3
  totalSteps?: number;
  style?: StyleProp<ViewStyle>;
}

export const OnboardingStepper: React.FC<OnboardingStepperProps> = ({
  currentStep,
  totalSteps = 3,
  style,
}) => {
  const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

  return (
    <View
      style={[styles.container, style]}
      accessible={true}
      accessibilityRole="text"
      accessibilityLabel={`Step ${currentStep} of ${totalSteps}`}
    >
      {steps.map((step) => {
        const isActive = step === currentStep;
        return (
          <View
            key={`step-${step}`}
            style={[
              styles.dotBase,
              isActive ? styles.dotActive : styles.dotInactive,
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  dotBase: {
    height: 8,
    borderRadius: shapes.pillRadius,
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.primaryTeal,
  },
  dotInactive: {
    width: 8,
    backgroundColor: colors.disabledBackground,
  },
});
