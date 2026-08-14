import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SensableText } from '../ui/SensableText';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export interface AppShellProps {
  title: string;
  subtitle?: string;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  style?: ViewStyle;
}

export const AppShell: React.FC<AppShellProps> = ({
  title,
  subtitle,
  headerRight,
  children,
  style,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top Header Bar */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <SensableText variant="headline" color={colors.primaryBodyText}>
            {title}
          </SensableText>
          {subtitle ? (
            <SensableText variant="caption" color={colors.secondaryBodyText}>
              {subtitle}
            </SensableText>
          ) : null}
        </View>
        {headerRight ? <View style={styles.headerRight}>{headerRight}</View> : null}
      </View>

      {/* Main Content Viewport */}
      <View style={[styles.content, style]}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenMargin,
    backgroundColor: colors.background,
  },
  titleContainer: {
    flexDirection: 'column',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.screenMargin,
  },
});
