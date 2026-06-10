import React from 'react';
import { StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useShallow } from 'zustand/shallow';
import { ParameterPanelWrapper } from '@entities/system';
import { useSystemStore } from '@entities/system';
import { PillButton } from '@shared/ui';

interface DeveloperOptionsPanelProps {
  animatedStyle?: StyleProp<ViewStyle>;
}

export const DeveloperOptionsPanel = ({ animatedStyle }: DeveloperOptionsPanelProps) => {
  const {
    isLogsEnabled,
    setIsLogsEnabled,
    isCameraSecure,
    setIsCameraSecure,
    isLayoutOverlayEnabled,
  } = useSystemStore(useShallow(state => ({
    isLogsEnabled: state.isLogsEnabled,
    setIsLogsEnabled: state.setIsLogsEnabled,
    isCameraSecure: state.isCameraSecure,
    setIsCameraSecure: state.setIsCameraSecure,
    isLayoutOverlayEnabled: state.isLayoutOverlayEnabled,
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
      <PillButton
        label="SECURE"
        isActive={isCameraSecure}
        onPress={() => setIsCameraSecure(!isCameraSecure)}
        isLayoutOverlayEnabled={isLayoutOverlayEnabled}
        style={styles.pressable}
      />
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
