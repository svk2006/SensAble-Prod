export const motionTokens = {
  navigationMs: 200,
  buttonPressScale: 0.96,
  cameraPulseMs: 1500,
  glossEntranceMs: 150,
  translationRevealMs: 250,
} as const;

/**
 * Motion configuration abstraction to respect accessibility settings
 */
export interface MotionConfig {
  reducedMotionEnabled: boolean;
  getDuration: (baseDurationMs: number) => number;
  getScale: (baseScale: number) => number;
}

export const defaultMotionConfig: MotionConfig = {
  reducedMotionEnabled: false,
  getDuration: (baseDurationMs: number) => baseDurationMs,
  getScale: (baseScale: number) => baseScale,
};
