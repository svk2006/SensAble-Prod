import { StatusVariant } from '../../types/design-system';

export type TranslateUiState =
  | 'camera-off'
  | 'camera-ready'
  | 'looking-for-hand'
  | 'hand-detected'
  | 'recognizing'
  | 'gloss-recognized'
  | 'translating'
  | 'translation-ready'
  | 'speaking'
  | 'failure';

export interface TranslateStateData {
  uiState: TranslateUiState;
  statusBadgeLabel: string;
  statusBadgeVariant: StatusVariant;
  glosses: string[];
  translatedSentence: string | null;
  isDemoActive?: boolean;
}

export const initialTranslateState: TranslateStateData = {
  uiState: 'camera-off',
  statusBadgeLabel: 'Camera is off',
  statusBadgeVariant: 'neutral',
  glosses: [],
  translatedSentence: null,
  isDemoActive: false,
};

export const demoTranslateFixture: TranslateStateData = {
  uiState: 'translation-ready',
  statusBadgeLabel: 'Translation Ready!',
  statusBadgeVariant: 'success',
  glosses: ['[ME]', '[WANT]', '[WATER]'],
  translatedSentence: 'I would like some water.',
  isDemoActive: true,
};
