import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppShell } from '../components/layout/AppShell';
import { SensableCard, SensableText } from '../components/ui';
import { ProgressScreenProps } from '../navigation/types';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export const ProgressScreen: React.FC<ProgressScreenProps> = () => {
  return (
    <AppShell title="Your Progress" subtitle="Student Practice & Achievements">
      <View style={styles.container}>
        <SensableCard style={styles.placeholderCard}>
          <SensableText variant="headline" style={styles.title}>
            Your Progress
          </SensableText>
          <SensableText variant="body" color={colors.secondaryBodyText}>
            Student Learning Achievements & Streaks Shell
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
