import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppShell } from '../components/layout/AppShell';
import { SensableCard, SensableText, SensableIconButton } from '../components/ui';
import { TranslateScreenProps } from '../navigation/types';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export const TranslateScreen: React.FC<TranslateScreenProps> = () => {
  return (
    <AppShell
      title="Translate"
      subtitle="Real-time Sign Translation"
      headerRight={
        <SensableIconButton
          icon={
            <SensableText variant="bodyBold" color={colors.darkTealText}>
              🕒
            </SensableText>
          }
          accessibilityLabel="View Translation History"
          onPress={() => {
            // Secondary History access point (placeholder for future implementation)
          }}
        />
      }
    >
      <View style={styles.container}>
        <SensableCard style={styles.placeholderCard}>
          <SensableText variant="headline" style={styles.title}>
            Translate
          </SensableText>
          <SensableText variant="body" color={colors.secondaryBodyText}>
            Real-time Sign Perception & Translation Shell
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
