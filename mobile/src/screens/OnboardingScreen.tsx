import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  BackHandler,
  Animated,
  AccessibilityInfo,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOnboarding } from '../context/OnboardingContext';
import { OnboardingStepper } from '../onboarding/OnboardingStepper';
import { OnboardingStep1 } from '../onboarding/OnboardingStep1';
import { OnboardingStep2 } from '../onboarding/OnboardingStep2';
import { OnboardingStep3 } from '../onboarding/OnboardingStep3';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { motionTokens } from '../theme/motion';

export const OnboardingScreen: React.FC = () => {
  const { completeOnboarding } = useOnboarding();
  const insets = useSafeAreaInsets();
  const [activeStep, setActiveStep] = useState<number>(1);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [reduceMotion, setReduceMotion] = useState<boolean>(false);

  // Single-owner animation values for page transition
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const translateXAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
  }, []);

  // Intercept Android hardware back button
  useEffect(() => {
    const onBackPress = () => {
      if (activeStep > 1 && !isAnimating) {
        goToStep(activeStep - 1, false);
        return true;
      }
      // On Step 1, consume the event to prevent bypassing onboarding
      return true;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [activeStep, isAnimating]);

  const goToStep = (targetStep: number, isForward = true) => {
    if (targetStep === activeStep || isAnimating) return;

    if (reduceMotion) {
      setActiveStep(targetStep);
      return;
    }

    setIsAnimating(true);
    const exitOffset = isForward ? -20 : 20;
    const enterOffset = isForward ? 20 : -20;

    // Step 1: Quick 80ms fade-out & exit shift of current screen
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(translateXAnim, {
        toValue: exitOffset,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Step 2: Switch active step (only ONE screen mounted at any instant!)
      setActiveStep(targetStep);
      translateXAnim.setValue(enterOffset);

      // Step 3: 140ms fade-in & enter shift of new screen (Total: 220ms)
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 140,
          useNativeDriver: true,
        }),
        Animated.timing(translateXAnim, {
          toValue: 0,
          duration: 140,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsAnimating(false);
      });
    });
  };

  const handleNext = () => {
    if (activeStep < 3) {
      goToStep(activeStep + 1, true);
    }
  };

  const handleSkip = () => {
    if (activeStep < 3) {
      goToStep(3, true);
    }
  };

  const renderStepComponent = (stepNum: number) => {
    switch (stepNum) {
      case 1:
        return <OnboardingStep1 onNext={handleNext} onSkip={handleSkip} />;
      case 2:
        return <OnboardingStep2 onNext={handleNext} onSkip={handleSkip} />;
      case 3:
        return <OnboardingStep3 onComplete={completeOnboarding} />;
      default:
        return null;
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: Math.max(insets.top, spacing.md),
          paddingBottom: Math.max(insets.bottom, spacing.lg),
        },
      ]}
    >
      {/* Top Stepper Indicator */}
      <View style={styles.stepperContainer}>
        <OnboardingStepper currentStep={activeStep} totalSteps={3} />
      </View>

      {/* Single-Owner Viewport Container */}
      <Animated.View
        style={[
          styles.viewportContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateX: translateXAnim }],
          },
        ]}
      >
        {renderStepComponent(activeStep)}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.screenMargin,
  },
  stepperContainer: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  viewportContainer: {
    flex: 1,
    marginTop: spacing.sm,
  },
});
