import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import { SensableText } from '../../../components/ui';
import { colors } from '../../../theme/colors';

export interface SensableCameraViewProps {
  isActive: boolean;
  position?: 'front' | 'back';
  onError?: (error: Error) => void;
}

export const SensableCameraView: React.FC<SensableCameraViewProps> = ({
  isActive,
  position = 'front',
  onError,
}) => {
  const device = useCameraDevice(position);

  if (device == null) {
    return (
      <View style={styles.errorContainer}>
        <SensableText variant="body" color={colors.secondaryBodyText} align="center">
          Front camera unavailable on this device.
        </SensableText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={isActive}
        onError={(err) => {
          if (onError) {
            onError(err);
          }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
});
