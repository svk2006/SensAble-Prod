import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SensableText, SensableChip, SensableIconButton } from '../../../components/ui';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';

export interface GlossSequenceStripProps {
  glosses: string[];
  onClear: () => void;
}

export const GlossSequenceStrip: React.FC<GlossSequenceStripProps> = ({
  glosses,
  onClear,
}) => {
  const hasGlosses = glosses.length > 0;

  return (
    <View
      style={styles.container}
      accessible={true}
      accessibilityRole="summary"
      accessibilityLabel={
        hasGlosses
          ? `Signs detected: ${glosses.join(', ')}`
          : 'Signs detected area: Empty'
      }
    >
      {/* Header Row */}
      <View style={styles.headerRow}>
        <SensableText variant="caption" color={colors.secondaryBodyText}>
          Signs detected
        </SensableText>
        <SensableIconButton
          icon={
            <SensableText variant="caption" color={hasGlosses ? colors.darkCoralText : colors.disabledText}>
              ✕ Clear
            </SensableText>
          }
          accessibilityLabel="Clear recognized sign sequence"
          onPress={onClear}
          disabled={!hasGlosses}
          style={styles.clearIconButton}
        />
      </View>

      {/* Chips Scroll Strip */}
      <ScrollView
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {hasGlosses ? (
          glosses.map((glossToken, index) => (
            <SensableChip
              key={`${glossToken}-${index}`}
              label={glossToken}
              variant="gloss"
              style={styles.chipMargin}
            />
          ))
        ) : (
          <SensableText variant="body" color={colors.secondaryBodyText} style={styles.emptyText}>
            Your signs will appear here.
          </SensableText>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  clearIconButton: {
    minHeight: 36,
    paddingHorizontal: spacing.sm,
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    minHeight: 48,
  },
  chipMargin: {
    marginRight: spacing.sm,
  },
  emptyText: {
    fontStyle: 'italic',
  },
});
