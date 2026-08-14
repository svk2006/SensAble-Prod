import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { AppShell } from '../components/layout/AppShell';
import { SensableIconButton, SensableText, SensableButton } from '../components/ui';
import { CameraViewportCard } from '../features/translate/components/CameraViewportCard';
import { GlossSequenceStrip } from '../features/translate/components/GlossSequenceStrip';
import { TranslationResultCard } from '../features/translate/components/TranslationResultCard';
import {
  TranslateStateData,
  initialTranslateState,
  demoTranslateFixture,
} from '../features/translate/types';
import { TranslateScreenProps } from '../navigation/types';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export const TranslateScreen: React.FC<TranslateScreenProps> = () => {
  const [stateData, setStateData] = useState<TranslateStateData>(initialTranslateState);

  // Toggle Camera Placeholder State (UI placeholder action, no OS permissions requested yet)
  const handleToggleCameraPlaceholder = () => {
    if (stateData.uiState === 'camera-off') {
      setStateData((prev) => ({
        ...prev,
        uiState: 'camera-ready',
        statusBadgeLabel: 'Ready! Show a sign',
        statusBadgeVariant: 'success',
      }));
    } else {
      setStateData((prev) => ({
        ...prev,
        uiState: 'camera-off',
        statusBadgeLabel: 'Camera is off',
        statusBadgeVariant: 'neutral',
      }));
    }
  };

  // Clear Gloss & Translation UI state
  const handleClear = () => {
    setStateData(initialTranslateState);
  };

  // Simulated TTS listen action
  const handleListenSpeech = () => {
    // UI placeholder for future TTS integration
  };

  // Controlled DEV-only fixture toggle for testing full Gloss & Sentence UI layout
  const handleToggleDevFixture = () => {
    if (stateData.isDemoActive) {
      setStateData(initialTranslateState);
    } else {
      setStateData(demoTranslateFixture);
    }
  };

  return (
    <AppShell
      title="Translate"
      subtitle="Real-time Sign Translation"
      headerRight={
        <SensableIconButton
          icon={
            <SensableText variant="bodyBold" color={colors.darkTealText}>
              🕒
            </SensableText>
          }
          accessibilityLabel="View Translation History"
          onPress={() => {
            // Secondary History action slot (UI action placeholder)
          }}
        />
      }
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Camera Viewport Card (~45% flex height) */}
        <CameraViewportCard
          stateData={stateData}
          onToggleCameraPlaceholder={handleToggleCameraPlaceholder}
        />

        {/* 2. Gloss Token Sequence Strip */}
        <GlossSequenceStrip
          glosses={stateData.glosses}
          onClear={handleClear}
        />

        {/* 3. Natural English Translation Result Card */}
        <TranslationResultCard
          translatedSentence={stateData.translatedSentence}
          uiState={stateData.uiState}
          onListenSpeech={handleListenSpeech}
        />

        {/* 4. Development-only Fixture Toggle Bar */}
        {__DEV__ ? (
          <View style={styles.devFixtureBar}>
            <SensableButton
              label={stateData.isDemoActive ? "Reset Dev Fixture" : "Load Dev Preview Fixture"}
              variant="secondary"
              onPress={handleToggleDevFixture}
              style={styles.devButton}
            />
          </View>
        ) : null}
      </ScrollView>
    </AppShell>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  devFixtureBar: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  devButton: {
    minWidth: 200,
  },
});
