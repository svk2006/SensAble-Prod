import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

export type RootTabParamList = {
  Translate: undefined;
  Learn: undefined;
  Progress: undefined;
  Settings: undefined;
};

export type TranslateScreenProps = BottomTabScreenProps<RootTabParamList, 'Translate'>;
export type LearnScreenProps = BottomTabScreenProps<RootTabParamList, 'Learn'>;
export type ProgressScreenProps = BottomTabScreenProps<RootTabParamList, 'Progress'>;
export type SettingsScreenProps = BottomTabScreenProps<RootTabParamList, 'Settings'>;
