import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Rect, Path } from 'react-native-svg';
import { SensableChip } from '../components/ui/SensableChip';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export const WelcomeVisual: React.FC = () => {
  return (
    <View style={styles.visualContainer}>
      <Svg width={180} height={160} viewBox="0 0 180 160" fill="none">
        {/* Soft Background Circle */}
        <Circle cx="90" cy="80" r="70" fill={`${colors.primaryTeal}12`} />
        {/* Hand Gesture Vector Graphic */}
        <Path
          d="M60 110V70A10 10 0 0 1 80 70V110"
          stroke={colors.primaryTeal}
          strokeWidth="6"
          strokeLinecap="round"
        />
        <Path
          d="M80 110V55A10 10 0 0 1 100 55V110"
          stroke={colors.primaryTeal}
          strokeWidth="6"
          strokeLinecap="round"
        />
        <Path
          d="M100 110V65A10 10 0 0 1 120 65V110"
          stroke={colors.primaryTeal}
          strokeWidth="6"
          strokeLinecap="round"
        />
        <Path
          d="M50 85A10 10 0 0 1 70 85V115C70 125 60 135 45 130"
          stroke={colors.warmCoral}
          strokeWidth="6"
          strokeLinecap="round"
        />
        <Path
          d="M50 110C50 130 70 140 90 140C115 140 130 125 130 110V95"
          stroke={colors.darkTealText}
          strokeWidth="6"
          strokeLinecap="round"
        />
      </Svg>
      {/* Floating Gloss Chips */}
      <View style={styles.floatingChip1}>
        <SensableChip label="[HELLO]" variant="gloss" />
      </View>
      <View style={styles.floatingChip2}>
        <SensableChip label="[READY!]" variant="active" />
      </View>
    </View>
  );
};

export const CameraVisual: React.FC = () => {
  return (
    <View style={styles.visualContainer}>
      <Svg width={180} height={160} viewBox="0 0 180 160" fill="none">
        {/* Phone Frame */}
        <Rect
          x="45"
          y="15"
          width="90"
          height="130"
          rx="16"
          fill={colors.surface}
          stroke={colors.primaryTeal}
          strokeWidth="4"
        />
        {/* Viewfinder Bounding Box */}
        <Rect
          x="55"
          y="30"
          width="70"
          height="95"
          rx="8"
          fill={`${colors.primaryTeal}08`}
          stroke={`${colors.primaryTeal}40`}
          strokeWidth="2"
          strokeDasharray="4 4"
        />
        {/* Illustrative Hand Landmark Vectors */}
        <Path
          d="M75 95L80 75L90 60L100 75L105 95"
          stroke={colors.brightGreen}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Circle cx="75" cy="95" r="4" fill={colors.brightGreen} />
        <Circle cx="80" cy="75" r="4" fill={colors.brightGreen} />
        <Circle cx="90" cy="60" r="4" fill={colors.brightGreen} />
        <Circle cx="100" cy="75" r="4" fill={colors.brightGreen} />
        <Circle cx="105" cy="95" r="4" fill={colors.brightGreen} />
      </Svg>
      <View style={styles.floatingChipCenter}>
        <SensableChip label="[SIGN]" variant="success" />
      </View>
    </View>
  );
};

export const CompletionVisual: React.FC = () => {
  return (
    <View style={styles.visualContainer}>
      <Svg width={180} height={160} viewBox="0 0 180 160" fill="none">
        {/* Soft Background Burst */}
        <Circle cx="90" cy="80" r="65" fill={`${colors.brightGreen}15`} />
        {/* Trophy / Star Celebration Vector */}
        <Path
          d="M90 35L98 58H122L103 72L110 95L90 81L70 95L77 72L58 58H82L90 35Z"
          fill={colors.warning}
          stroke={colors.darkWarningText}
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {/* Sparkle Lines */}
        <Path d="M40 40L30 30" stroke={colors.primaryTeal} strokeWidth="3" strokeLinecap="round" />
        <Path d="M140 40L150 30" stroke={colors.warmCoral} strokeWidth="3" strokeLinecap="round" />
        <Path d="M40 120L30 130" stroke={colors.brightGreen} strokeWidth="3" strokeLinecap="round" />
        <Path d="M140 120L150 130" stroke={colors.primaryTeal} strokeWidth="3" strokeLinecap="round" />
      </Svg>
      <View style={styles.floatingChipCenter}>
        <SensableChip label="[YOU'RE READY!]" variant="gloss" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  visualContainer: {
    width: '100%',
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.md,
    position: 'relative',
  },
  floatingChip1: {
    position: 'absolute',
    top: 10,
    left: 20,
  },
  floatingChip2: {
    position: 'absolute',
    bottom: 10,
    right: 20,
  },
  floatingChipCenter: {
    position: 'absolute',
    bottom: 0,
  },
});
