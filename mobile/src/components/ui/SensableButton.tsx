import React from 'react';
import {
  Pressable,
  StyleSheet,
  ViewStyle,
  ActivityIndicator,
  View,
  StyleProp,
} from 'react-native';
import { SensableText } from './SensableText';
import { colors } from '../../theme/colors';
import { shapes } from '../../theme/shapes';
import { spacing } from '../../theme/spacing';
import { motionTokens } from '../../theme/motion';
import { ButtonVariant } from '../../types/design-system';

export interface SensableButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export const SensableButton: React.FC<SensableButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  icon,
  accessibilityLabel,
  style,
}) => {
  const getContainerStyle = (pressed: boolean): ViewStyle => {
    let backgroundColor: string = colors.primaryTeal;
    let borderColor: string = 'transparent';
    let borderWidth: number = 0;

    if (variant === 'secondary') {
      backgroundColor = colors.surface;
      borderColor = colors.warmCoral;
      borderWidth = 2;
    } else if (variant === 'warning') {
      backgroundColor = colors.warning;
    }

    if (disabled) {
      backgroundColor = colors.disabledBackground;
      borderColor = 'transparent';
    }

    return {
      minHeight: shapes.touchTargetMin,
      minWidth: shapes.touchTargetMin,
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
      borderRadius: shapes.buttonRadius,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
      backgroundColor,
      borderColor,
      borderWidth,
      transform: [{ scale: pressed && !disabled ? motionTokens.buttonPressScale : 1 }],
      opacity: disabled ? 0.65 : 1,
    };
  };

  const getTextColor = (): string => {
    if (disabled) return colors.disabledText;
    if (variant === 'secondary') return colors.darkCoralText;
    if (variant === 'warning') return colors.darkWarningText;
    return colors.surface;
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || label}
      accessibilityState={{ disabled: disabled || loading }}
      style={({ pressed }) => [getContainerStyle(pressed), style]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <View style={styles.contentRow}>
          {icon ? <View style={styles.iconContainer}>{icon}</View> : null}
          <SensableText variant="bodyBold" color={getTextColor()}>
            {label}
          </SensableText>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: spacing.sm,
  },
});
