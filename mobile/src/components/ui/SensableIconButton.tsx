import React from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { shapes } from '../../theme/shapes';
import { motionTokens } from '../../theme/motion';

export interface SensableIconButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  accessibilityLabel: string;
  disabled?: boolean;
  style?: ViewStyle;
  variant?: 'surface' | 'teal' | 'coral';
}

export const SensableIconButton: React.FC<SensableIconButtonProps> = ({
  icon,
  onPress,
  accessibilityLabel,
  disabled = false,
  style,
  variant = 'surface',
}) => {
  const getBackgroundColor = () => {
    if (disabled) return colors.disabledBackground;
    if (variant === 'teal') return colors.primaryTeal;
    if (variant === 'coral') return colors.warmCoral;
    return colors.surface;
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          transform: [
            { scale: pressed && !disabled ? motionTokens.buttonPressScale : 1 },
          ],
          opacity: disabled ? 0.6 : 1,
        },
        style,
      ]}
    >
      {icon}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    minWidth: shapes.touchTargetMin,
    minHeight: shapes.touchTargetMin,
    borderRadius: shapes.buttonRadius,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
