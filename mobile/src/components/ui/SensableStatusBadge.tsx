import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { SensableText } from './SensableText';
import { colors } from '../../theme/colors';
import { shapes } from '../../theme/shapes';
import { spacing } from '../../theme/spacing';
import { StatusVariant } from '../../types/design-system';

export interface SensableStatusBadgeProps {
  label: string;
  variant?: StatusVariant;
  style?: ViewStyle;
}

export const SensableStatusBadge: React.FC<SensableStatusBadgeProps> = ({
  label,
  variant = 'active',
  style,
}) => {
  const getVariantStyles = (): { bg: string; dot: string; text: string } => {
    switch (variant) {
      case 'active':
      case 'success':
        return {
          bg: colors.surface,
          dot: colors.brightGreen,
          text: colors.darkGreenText,
        };
      case 'warning':
        return {
          bg: colors.surface,
          dot: colors.warning,
          text: colors.darkWarningText,
        };
      case 'error':
        return {
          bg: colors.surface,
          dot: colors.error,
          text: colors.darkErrorText,
        };
      case 'neutral':
      default:
        return {
          bg: colors.surfaceContainer,
          dot: colors.secondaryBodyText,
          text: colors.secondaryBodyText,
        };
    }
  };

  const { bg, dot, text } = getVariantStyles();

  return (
    <View
      accessible={true}
      accessibilityRole="text"
      accessibilityLabel={`Status: ${label}`}
      style={[styles.badge, { backgroundColor: bg }, style]}
    >
      <View style={[styles.dot, { backgroundColor: dot }]} />
      <SensableText variant="caption" color={text}>
        {label}
      </SensableText>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: shapes.pillRadius,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.xs,
  },
});
