import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_STORAGE_KEY = '@sensable/has_completed_onboarding';

/**
 * Reads local onboarding completion state safely.
 * Returns false if key doesn't exist or on storage read failure.
 */
export const getHasCompletedOnboarding = async (): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
    return value === 'true';
  } catch (error) {
    console.warn('[SensAble Persistence] Failed to read onboarding completion state:', error);
    return false; // Safe fallback: treat as first launch
  }
};

/**
 * Persists onboarding completion state.
 */
export const setHasCompletedOnboarding = async (completed: boolean): Promise<void> => {
  try {
    await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, completed ? 'true' : 'false');
  } catch (error) {
    console.error('[SensAble Persistence] Failed to save onboarding completion state:', error);
  }
};

/**
 * Development-only helper to reset onboarding completion state.
 */
export const resetOnboardingStateDev = async (): Promise<void> => {
  if (__DEV__) {
    try {
      await AsyncStorage.removeItem(ONBOARDING_STORAGE_KEY);
      console.log('[SensAble Dev Reset] Onboarding state reset to false');
    } catch (error) {
      console.error('[SensAble Dev Reset] Failed to reset onboarding state:', error);
    }
  }
};
