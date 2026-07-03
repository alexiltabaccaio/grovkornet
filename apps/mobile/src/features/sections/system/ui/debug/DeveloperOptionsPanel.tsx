import React from 'react';
import { StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useShallow } from 'zustand/shallow';
import { ParameterPanelWrapper } from '@entities/system';
import { useSystemStore } from '@entities/system';
import { useCameraStore, IS_SECURE_CAMERA_ENABLED } from '@entities/camera';
import { PillButton } from '@shared/ui';

interface DeveloperOptionsPanelProps {
  animatedStyle?: StyleProp<ViewStyle>;
}

export const DeveloperOptionsPanel = ({ animatedStyle }: DeveloperOptionsPanelProps) => {
  const {
    isLogsEnabled,
    setIsLogsEnabled,
    isLayoutOverlayEnabled,
  } = useSystemStore(useShallow(state => ({
    isLogsEnabled: state.isLogsEnabled,
    setIsLogsEnabled: state.setIsLogsEnabled,
    isLayoutOverlayEnabled: state.isLayoutOverlayEnabled,
  })));

  const {
    isCameraSecure,
    setIsCameraSecure,
  } = useCameraStore(useShallow(state => ({
    isCameraSecure: state.isCameraSecure,
    setIsCameraSecure: state.setIsCameraSecure,
  })));



  return (
    <ParameterPanelWrapper animatedStyle={animatedStyle} gap={16} paddingHorizontal={32} scrollable={true}>
      <PillButton
        label="LOGS"
        isActive={isLogsEnabled}
        onPress={() => setIsLogsEnabled(!isLogsEnabled)}
        isLayoutOverlayEnabled={isLayoutOverlayEnabled}
        style={styles.pressable}
      />
      {IS_SECURE_CAMERA_ENABLED && (
        <PillButton
          label="SECURE"
          isActive={isCameraSecure}
          onPress={() => setIsCameraSecure(!isCameraSecure)}
          isLayoutOverlayEnabled={isLayoutOverlayEnabled}
          style={styles.pressable}
        />
      )}

    </ParameterPanelWrapper>
  );
};

const styles = StyleSheet.create({
  pressable: {
    flex: 1,
    minWidth: 100,
    maxWidth: 140,
  },
});
