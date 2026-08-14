import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, AccessibilityInfo } from 'react-native';
import { SensableCard, SensableText, SensableButton } from '../../../components/ui';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { motionTokens } from '../../../theme/motion';

export interface TranslationResultCardProps {
  translatedSentence: string | null;
  uiState: string;
  onListenSpeech: () => void;
}

export const TranslationResultCard: React.FC<TranslationResultCardProps> = ({
  translatedSentence,
  uiState,
  onListenSpeech,
}) => {
  const expandAnim = useRef(new Animated.Value(0)).current;
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
  }, []);

  const hasSentence = Boolean(translatedSentence);

  useEffect(() => {
    if (reduceMotion || !hasSentence) {
      expandAnim.setValue(hasSentence ? 1 : 0);
      return;
    }

    // 250ms expand-down reveal animation for natural English sentence
    Animated.timing(expandAnim, {
      toValue: 1,
      duration: motionTokens.translationRevealMs, // 250ms
      useNativeDriver: true,
    }).start();
  }, [reduceMotion, hasSentence, expandAnim]);

  return (
    <SensableCard style={styles.card}>
      {/* Label Row */}
      <SensableText variant="caption" color={colors.secondaryBodyText} style={styles.label}>
        SensAble says:
      </SensableText>

      {/* Main Sentence Output */}
      {hasSentence ? (
        <Animated.View
          style={{
            opacity: expandAnim,
            transform: [
              {
                translateY: expandAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [12, 0],
                }),
              },
            ],
          }}
        >
          <SensableText variant="translated" color={colors.primaryBodyText} style={styles.sentenceText}>
            "{translatedSentence}"
          </SensableText>
        </Animated.View>
      ) : (
        <SensableText variant="body" color={colors.secondaryBodyText} style={styles.emptyText}>
          Your translated sentence will appear here.
        </SensableText>
      )}

      {/* Footer Action Row (TTS Audio Listener) */}
      <View style={styles.footerRow}>
        <SensableButton
          label="Listen"
          variant="secondary"
          onPress={onListenSpeech}
          disabled={!hasSentence}
          accessibilityLabel={
            hasSentence
              ? `Play spoken audio for: ${translatedSentence}`
              : 'Listen audio button disabled'
          }
          icon={
            <SensableText variant="bodyBold" color={hasSentence ? colors.darkCoralText : colors.disabledText}>
              🔊
            </SensableText>
          }
          style={styles.listenButton}
        />
      </View>
    </SensableCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: spacing.cardPadding,
    marginVertical: spacing.sm,
  },
  label: {
    marginBottom: spacing.xs,
  },
  sentenceText: {
    fontWeight: '600',
    marginVertical: spacing.sm,
  },
  emptyText: {
    fontStyle: 'italic',
    marginVertical: spacing.sm,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: spacing.md,
  },
  listenButton: {
    minWidth: 120,
  },
});
