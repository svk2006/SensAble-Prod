import React from 'react';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

export interface TabIconProps {
  color: string;
  size?: number;
  focused: boolean;
}

export const TranslateTabIcon: React.FC<TabIconProps> = ({ color, size = 24, focused }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Camera / Gesture Translate Icon */}
    <Path
      d="M23 19A2 2 0 0 1 21 21H3A2 2 0 0 1 1 19V8A2 2 0 0 1 3 6H7L9 3H15L17 6H21A2 2 0 0 1 23 8V19Z"
      stroke={color}
      strokeWidth={focused ? "2.5" : "2"}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={focused ? `${color}1A` : "none"}
    />
    <Circle
      cx="12"
      cy="13"
      r="4"
      stroke={color}
      strokeWidth={focused ? "2.5" : "2"}
      fill={focused ? color : "none"}
    />
  </Svg>
);

export const LearnTabIcon: React.FC<TabIconProps> = ({ color, size = 24, focused }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Book / Graduation Cap Icon */}
    <Path
      d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V4H6.5A2.5 2.5 0 0 0 4 6.5V19.5Z"
      stroke={color}
      strokeWidth={focused ? "2.5" : "2"}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill={focused ? `${color}1A` : "none"}
    />
    <Path
      d="M6.5 2H20V17H6.5A2.5 2.5 0 0 0 4 19.5V19.5A2.5 2.5 0 0 1 6.5 17Z"
      stroke={color}
      strokeWidth={focused ? "2.5" : "2"}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const ProgressTabIcon: React.FC<TabIconProps> = ({ color, size = 24, focused }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Streak / Growth Chart Icon */}
    <Path
      d="M18 20V10"
      stroke={color}
      strokeWidth={focused ? "3" : "2"}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 20V4"
      stroke={color}
      strokeWidth={focused ? "3" : "2"}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M6 20V14"
      stroke={color}
      strokeWidth={focused ? "3" : "2"}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const SettingsTabIcon: React.FC<TabIconProps> = ({ color, size = 24, focused }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Gear / Options Icon */}
    <Circle
      cx="12"
      cy="12"
      r="3"
      stroke={color}
      strokeWidth={focused ? "2.5" : "2"}
      fill={focused ? color : "none"}
    />
    <Path
      d="M19.4 15A1.65 1.65 0 0 0 20 12A1.65 1.65 0 0 0 19.4 9L21 7.4L19.4 5.8L17.8 7.4A1.65 1.65 0 0 0 14.8 6.8V4.5H12.5V6.8A1.65 1.65 0 0 0 9.5 7.4L7.9 5.8L6.3 7.4L7.9 9A1.65 1.65 0 0 0 7.3 12A1.65 1.65 0 0 0 7.9 15L6.3 16.6L7.9 18.2L9.5 16.6A1.65 1.65 0 0 0 12.5 17.2V19.5H14.8V17.2A1.65 1.65 0 0 0 17.8 16.6L19.4 18.2L21 16.6L19.4 15Z"
      stroke={color}
      strokeWidth={focused ? "2" : "1.5"}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
