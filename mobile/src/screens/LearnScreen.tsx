import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppShell } from '../components/layout/AppShell';
import { SensableCard, SensableText } from '../components/ui';
import { LearnScreenProps } from '../navigation/types';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export const LearnScreen: React.FC<LearnScreenProps> = () => {
  return (
    <AppShell title="Learn" subtitle="Sign Vocabulary & Practice">
      <View style={styles.container}>
        <SensableCard style={styles.placeholderCard}>
          <SensableText variant="headline" style={styles.title}>
            Learn
          </SensableText>
          <SensableText variant="body" color={colors.secondaryBodyText}>
            Interactive Student Sign Dictionary & Lessons Shell
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
