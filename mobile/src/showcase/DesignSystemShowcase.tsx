import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  SensableText,
  SensableButton,
  SensableCard,
  SensableChip,
  SensableStatusBadge,
  SensableIconButton,
} from '../components/ui';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export const DesignSystemShowcase: React.FC = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SensableText variant="display" style={styles.headerTitle}>
        SensAble Design System
      </SensableText>
      <SensableText variant="body" color={colors.secondaryBodyText} style={styles.subtitle}>
        Internal Theme & UI Primitive Foundation Showcase
      </SensableText>

      {/* 1. TYPOGRAPHY */}
      <SensableCard style={styles.sectionCard}>
        <SensableText variant="headline" style={styles.sectionTitle}>
          1. Typography Scale
        </SensableText>
        <SensableText variant="display">Display Text (32px)</SensableText>
        <SensableText variant="headline">Headline Text (24px)</SensableText>
        <SensableText variant="gloss">[GLOSS_TOKEN_TEXT] (18px)</SensableText>
        <SensableText variant="translated">
          Translated Sentence Text: "I would like some water." (18px)
        </SensableText>
        <SensableText variant="body">
          Body Text: Standard readable text for descriptions and labels (15px).
        </SensableText>
        <SensableText variant="bodyBold">
          Body Bold Text: Emphasized text for action titles (15px).
        </SensableText>
        <SensableText variant="caption">
          Caption / Status Badge Text (12px)
        </SensableText>
      </SensableCard>

      {/* 2. BUTTONS */}
      <SensableCard style={styles.sectionCard}>
        <SensableText variant="headline" style={styles.sectionTitle}>
          2. Buttons (48dp Touch Targets)
        </SensableText>
        <View style={styles.buttonRow}>
          <SensableButton
            label="Primary Teal Action"
            variant="primary"
            onPress={() => {}}
            style={styles.buttonMargin}
          />
          <SensableButton
            label="Secondary Coral Action"
            variant="secondary"
            onPress={() => {}}
            style={styles.buttonMargin}
          />
          <SensableButton
            label="Warning Amber Action"
            variant="warning"
            onPress={() => {}}
            style={styles.buttonMargin}
          />
          <SensableButton
            label="Disabled Button"
            variant="primary"
            disabled={true}
            onPress={() => {}}
            style={styles.buttonMargin}
          />
        </View>
      </SensableCard>

      {/* 3. GLOSS CHIPS */}
      <SensableCard style={styles.sectionCard}>
        <SensableText variant="headline" style={styles.sectionTitle}>
          3. Gloss Token Chips
        </SensableText>
        <View style={styles.chipRow}>
          <SensableChip label="[ME]" variant="gloss" style={styles.chipMargin} />
          <SensableChip label="[WANT]" variant="gloss" style={styles.chipMargin} />
          <SensableChip label="[WATER]" variant="active" style={styles.chipMargin} />
          <SensableChip label="[SCHOOL]" variant="success" style={styles.chipMargin} />
          <SensableChip label="[PLEASE]" variant="warning" style={styles.chipMargin} />
        </View>
      </SensableCard>

      {/* 4. STATUS BADGES */}
      <SensableCard style={styles.sectionCard}>
        <SensableText variant="headline" style={styles.sectionTitle}>
          4. Status Badges
        </SensableText>
        <View style={styles.badgeRow}>
          <SensableStatusBadge label="Ready! Show a sign" variant="success" style={styles.chipMargin} />
          <SensableStatusBadge label="No hands visible" variant="warning" style={styles.chipMargin} />
          <SensableStatusBadge label="Glove Disconnected" variant="error" style={styles.chipMargin} />
          <SensableStatusBadge label="Camera Off" variant="neutral" style={styles.chipMargin} />
        </View>
      </SensableCard>

      {/* 5. ICON BUTTONS & CARDS */}
      <SensableCard style={styles.sectionCard}>
        <SensableText variant="headline" style={styles.sectionTitle}>
          5. Icon Buttons & Surface Card
        </SensableText>
        <View style={styles.iconRow}>
          <SensableIconButton
            icon={
              <SensableText variant="bodyBold" color={colors.darkTealText}>
                🔊
              </SensableText>
            }
            accessibilityLabel="Play Audio Translation"
            onPress={() => {}}
            style={styles.chipMargin}
          />
          <SensableIconButton
            icon={
              <SensableText variant="bodyBold" color={colors.darkCoralText}>
                ✕
              </SensableText>
            }
            accessibilityLabel="Clear Sequence"
            variant="coral"
            onPress={() => {}}
            style={styles.chipMargin}
          />
        </View>
      </SensableCard>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.screenMargin,
    paddingBottom: spacing.xxxl,
  },
  headerTitle: {
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  subtitle: {
    marginBottom: spacing.xl,
  },
  sectionCard: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    marginBottom: spacing.lg,
  },
  buttonRow: {
    gap: spacing.md,
  },
  buttonMargin: {
    marginBottom: spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  iconRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  chipMargin: {
    marginBottom: spacing.xs,
  },
});
