import React, { useEffect } from 'react';
import { View, StyleSheet, BackHandler } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useOnboarding } from '../context/OnboardingContext';
import { SensableCard, SensableText, SensableButton } from '../components/ui';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export const OnboardingPlaceholderScreen: React.FC = () => {
  const { completeOnboarding } = useOnboarding();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    // Intercept Android back press during onboarding root state to prevent bypassing onboarding
    const onBackPress = () => {
      // Return true to consume the event and prevent exiting or bypassing onboarding
      return true;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
      <View style={styles.header}>
        <SensableText variant="display" color={colors.primaryTeal}>
          SensAble
        </SensableText>
        <SensableText variant="caption" color={colors.secondaryBodyText}>
          First-Launch Student Onboarding
        </SensableText>
      </View>

      <SensableCard style={styles.card}>
        <SensableText variant="headline" style={styles.cardTitle}>
          Welcome to SensAble!
        </SensableText>
        <SensableText variant="body" color={colors.secondaryBodyText} style={styles.cardBody}>
          Turn signs into spoken words and learn at your own pace.
        </SensableText>

        <SensableButton
          label="Complete Onboarding"
          variant="primary"
          onPress={completeOnboarding}
          style={styles.button}
        />
      </SensableCard>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.screenMargin,
    justifyContent: 'space-between',
  },
  header: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  card: {
    marginBottom: spacing.xxl,
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  cardTitle: {
    marginBottom: spacing.md,
  },
  cardBody: {
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  button: {
    width: '100%',
  },
});
