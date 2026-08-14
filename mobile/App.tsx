import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { OnboardingProvider } from './src/context/OnboardingContext';
import { AppNavigator } from './src/navigation/AppNavigator';

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <OnboardingProvider>
        <StatusBar barStyle="dark-content" />
        <AppNavigator />
      </OnboardingProvider>
    </SafeAreaProvider>
  );
}

export default App;
