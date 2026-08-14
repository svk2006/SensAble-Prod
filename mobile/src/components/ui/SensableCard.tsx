import React from 'react';
import { View, StyleSheet, ViewProps, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { shapes } from '../../theme/shapes';
import { spacing } from '../../theme/spacing';
import { shadows } from '../../theme/shadows';

export interface SensableCardProps extends ViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padded?: boolean;
}

export const SensableCard: React.FC<SensableCardProps> = ({
  children,
  style,
  padded = true,
  ...props
}) => {
  return (
    <View
      style={[
        styles.card,
        padded && styles.padded,
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: shapes.cardRadius,
    ...shadows.cardSoft,
  },
  padded: {
    padding: spacing.cardPadding,
  },
});
