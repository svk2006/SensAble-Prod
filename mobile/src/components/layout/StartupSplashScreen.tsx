import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { SensableText } from '../ui/SensableText';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export const StartupSplashScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <SensableText variant="display" color={colors.primaryTeal} style={styles.title}>
        SensAble
      </SensableText>
      <SensableText variant="body" color={colors.secondaryBodyText} style={styles.subtitle}>
        Sensory Learning & Sign Translation
      </SensableText>
      <ActivityIndicator size="small" color={colors.primaryTeal} style={styles.spinner} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.screenMargin,
  },
  title: {
    marginBottom: spacing.xs,
  },
  subtitle: {
    marginBottom: spacing.xxl,
  },
  spinner: {
    marginTop: spacing.md,
  },
});
