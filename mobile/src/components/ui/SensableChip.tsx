import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { SensableText } from './SensableText';
import { colors } from '../../theme/colors';
import { shapes } from '../../theme/shapes';
import { spacing } from '../../theme/spacing';
import { ChipVariant } from '../../types/design-system';

export interface SensableChipProps {
  label: string;
  variant?: ChipVariant;
  style?: ViewStyle;
}

export const SensableChip: React.FC<SensableChipProps> = ({
  label,
  variant = 'gloss',
  style,
}) => {
  const getVariantStyles = (): { bg: string; text: string } => {
    switch (variant) {
      case 'gloss':
        return { bg: colors.primaryTeal, text: colors.surface };
      case 'active':
        return { bg: colors.warmCoral, text: colors.surface };
      case 'success':
        return { bg: colors.brightGreen, text: colors.darkGreenText };
      case 'warning':
        return { bg: colors.warning, text: colors.darkWarningText };
      case 'neutral':
      default:
        return { bg: colors.surfaceContainer, text: colors.primaryBodyText };
    }
  };

  const { bg, text } = getVariantStyles();

  return (
    <View style={[styles.chip, { backgroundColor: bg }, style]}>
      <SensableText variant="gloss" color={text}>
        {label}
      </SensableText>
    </View>
  );
};

const styles = StyleSheet.create({
  chip: {
    borderRadius: shapes.pillRadius,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
