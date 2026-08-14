import React from 'react';
import { Text as RNText, TextProps, TextStyle, StyleProp } from 'react-native';
import { TextVariant } from '../../types/design-system';
import { typography } from '../../theme/typography';

export interface SensableTextProps extends TextProps {
  variant?: TextVariant;
  color?: string;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  children: React.ReactNode;
}

export const SensableText: React.FC<SensableTextProps> = ({
  variant = 'body',
  color,
  align,
  style,
  children,
  ...props
}) => {
  const variantStyle = typography[variant];
  const overrideStyle: { color?: string; textAlign?: 'auto' | 'left' | 'right' | 'center' | 'justify' } = {
    ...(color ? { color } : {}),
    ...(align ? { textAlign: align } : {}),
  };

  const combinedStyle: StyleProp<TextStyle> = [variantStyle, overrideStyle as TextStyle, style];

  return (
    <RNText style={combinedStyle} {...props}>
      {children}
    </RNText>
  );
};
