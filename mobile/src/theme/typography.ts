import { TextStyle } from 'react-native';
import { colors } from './colors';
import { TextVariant } from '../types/design-system';

export const fontFamilies = {
  bold: 'Quicksand-Bold',
  semibold: 'Quicksand-SemiBold',
  medium: 'Quicksand-Medium',
  regular: 'Quicksand-Regular',
} as const;

export const typography: Record<TextVariant, TextStyle> = {
  display: {
    fontFamily: fontFamilies.bold,
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700',
    color: colors.primaryBodyText,
  },
  headline: {
    fontFamily: fontFamilies.bold,
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '700',
    color: colors.primaryBodyText,
  },
  gloss: {
    fontFamily: fontFamilies.semibold,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: colors.darkTealText,
  },
  translated: {
    fontFamily: fontFamilies.medium,
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '500',
    color: colors.primaryBodyText,
  },
  body: {
    fontFamily: fontFamilies.medium,
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '500',
    color: colors.primaryBodyText,
  },
  bodyBold: {
    fontFamily: fontFamilies.bold,
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '700',
    color: colors.primaryBodyText,
  },
  caption: {
    fontFamily: fontFamilies.bold,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    color: colors.secondaryBodyText,
  },
};
