import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import {
  createBottomTabNavigator,
  BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootTabParamList } from './types';
import { TranslateScreen } from '../screens/TranslateScreen';
import { LearnScreen } from '../screens/LearnScreen';
import { ProgressScreen } from '../screens/ProgressScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import {
  TranslateTabIcon,
  LearnTabIcon,
  ProgressTabIcon,
  SettingsTabIcon,
} from '../components/ui/TabIcons';
import { SensableText } from '../components/ui/SensableText';
import { colors } from '../theme/colors';
import { shapes } from '../theme/shapes';
import { spacing } from '../theme/spacing';

const Tab = createBottomTabNavigator<RootTabParamList>();

const CustomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
  insets: tabInsets,
}) => {
  const safeAreaInsets = useSafeAreaInsets();
  // Dynamically resolve system navigation bar bottom inset (handles gesture & 3-button navigation)
  const bottomInset = tabInsets?.bottom ?? safeAreaInsets.bottom;

  return (
    <View
      style={[
        styles.tabBarContainer,
        { paddingBottom: Math.max(bottomInset, spacing.xs) },
      ]}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const label =
          options.tabBarLabel !== undefined
            ? (options.tabBarLabel as string)
            : options.title !== undefined
            ? options.title
            : route.name;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        const activeColor = colors.darkTealText;
        const inactiveColor = colors.disabledText;
        const iconColor = isFocused ? colors.primaryTeal : inactiveColor;

        const renderIcon = () => {
          switch (route.name) {
            case 'Translate':
              return <TranslateTabIcon color={iconColor} focused={isFocused} />;
            case 'Learn':
              return <LearnTabIcon color={iconColor} focused={isFocused} />;
            case 'Progress':
              return <ProgressTabIcon color={iconColor} focused={isFocused} />;
            case 'Settings':
              return <SettingsTabIcon color={iconColor} focused={isFocused} />;
            default:
              return null;
          }
        };

        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel || `${label} Tab`}
            testID={options.tabBarButtonTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabItem}
          >
            <View style={[styles.pillContainer, isFocused && styles.pillActive]}>
              {renderIcon()}
              <SensableText
                variant="caption"
                color={isFocused ? activeColor : inactiveColor}
                style={styles.tabLabel}
              >
                {label}
              </SensableText>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
};

export const BottomTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      backBehavior="firstRoute" // Android back press returns to Translate tab before exiting
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Translate"
        component={TranslateScreen}
        options={{ title: 'Translate' }}
      />
      <Tab.Screen
        name="Learn"
        component={LearnScreen}
        options={{ title: 'Learn' }}
      />
      <Tab.Screen
        name="Progress"
        component={ProgressScreen}
        options={{ title: 'Progress' }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceContainer,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.xs,
    alignItems: 'center',
    justifyContent: 'space-around',
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    minHeight: shapes.touchTargetMin,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: shapes.pillRadius,
    minHeight: shapes.touchTargetMin,
  },
  pillActive: {
    backgroundColor: `${colors.primaryTeal}15`, // Soft 8% Teal active tint
  },
  tabLabel: {
    marginTop: 2,
  },
});
