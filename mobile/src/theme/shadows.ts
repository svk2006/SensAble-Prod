import { ViewStyle } from 'react-native';
import { colors } from './colors';

export const shadows: { cardSoft: ViewStyle; buttonActive: ViewStyle } = {
  cardSoft: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 3, // Android native shadow fallback
  },
  buttonActive: {
    shadowColor: colors.primaryTeal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
};
