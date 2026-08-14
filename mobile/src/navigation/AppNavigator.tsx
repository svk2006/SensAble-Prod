import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useOnboarding } from '../context/OnboardingContext';
import { BottomTabNavigator } from './BottomTabNavigator';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { StartupSplashScreen } from '../components/layout/StartupSplashScreen';

export const AppNavigatorContent: React.FC = () => {
  const { isLoadingOnboarding, hasCompletedOnboarding } = useOnboarding();

  if (isLoadingOnboarding) {
    return <StartupSplashScreen />;
  }

  if (!hasCompletedOnboarding) {
    return <OnboardingScreen />;
  }

  return <BottomTabNavigator />;
};

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <AppNavigatorContent />
    </NavigationContainer>
  );
};
