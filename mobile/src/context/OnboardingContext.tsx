import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getHasCompletedOnboarding,
  setHasCompletedOnboarding,
  resetOnboardingStateDev,
} from '../services/storage/onboardingStorage';

export interface OnboardingContextValue {
  isLoadingOnboarding: boolean;
  hasCompletedOnboarding: boolean;
  completeOnboarding: () => Promise<void>;
  resetOnboardingDev: () => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextValue | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoadingOnboarding, setIsLoadingOnboarding] = useState<boolean>(true);
  const [hasCompletedOnboarding, setHasCompletedOnboardingState] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const loadState = async () => {
      const completed = await getHasCompletedOnboarding();
      if (isMounted) {
        setHasCompletedOnboardingState(completed);
        setIsLoadingOnboarding(false);
      }
    };
    loadState();
    return () => {
      isMounted = false;
    };
  }, []);

  const completeOnboarding = async () => {
    await setHasCompletedOnboarding(true);
    setHasCompletedOnboardingState(true);
  };

  const resetOnboardingDev = async () => {
    if (__DEV__) {
      await resetOnboardingStateDev();
      setHasCompletedOnboardingState(false);
    }
  };

  return (
    <OnboardingContext.Provider
      value={{
        isLoadingOnboarding,
        hasCompletedOnboarding,
        completeOnboarding,
        resetOnboardingDev,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = (): OnboardingContextValue => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};
