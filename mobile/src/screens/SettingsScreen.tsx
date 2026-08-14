import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppShell } from '../components/layout/AppShell';
import { SensableCard, SensableText } from '../components/ui';
import { SettingsScreenProps } from '../navigation/types';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export const SettingsScreen: React.FC<SettingsScreenProps> = () => {
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
  },
  title: {
    marginBottom: spacing.xs,
  },
});
