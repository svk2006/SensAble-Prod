import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppShell } from '../components/layout/AppShell';
import { SensableCard, SensableText, SensableButton } from '../components/ui';
import { useOnboarding } from '../context/OnboardingContext';
import { SettingsScreenProps } from '../navigation/types';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export const SettingsScreen: React.FC<SettingsScreenProps> = () => {
  const { resetOnboardingDev } = useOnboarding();

  return (
    <AppShell title="Settings" subtitle="Hardware & App Options">
      <View style={styles.container}>
        <SensableCard style={styles.placeholderCard}>
          <SensableText variant="headline" style={styles.title}>
            Settings
          </SensableText>
          <SensableText variant="body" color={colors.secondaryBodyText}>
            Bluetooth Smart Glove & Application Settings Shell
          </SensableText>
        </SensableCard>

        {/* Development-only reset mechanism */}
        {__DEV__ ? (
          <SensableCard style={styles.devCard}>
            <SensableText variant="caption" color={colors.darkWarningText} style={styles.devTitle}>
              🛠️ Developer Controls (__DEV__ Only)
            </SensableText>
            <SensableButton
              label="Reset Onboarding Flow"
              variant="warning"
              onPress={resetOnboardingDev}
            />
          </SensableCard>
        ) : null}
      </View>
    </AppShell>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: spacing.lg,
  },
  placeholderCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
    marginBottom: spacing.lg,
  },
  title: {
    marginBottom: spacing.xs,
  },
  devCard: {
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.warning,
    backgroundColor: `${colors.warning}10`,
  },
  devTitle: {
    marginBottom: spacing.sm,
  },
});
