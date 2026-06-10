import React from 'react';
import { StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useShallow } from 'zustand/shallow';
import { ParameterPanelWrapper } from '@entities/system';
import { useSystemStore } from '@entities/system';
import { PillButton } from '@shared/ui';

interface TemperatureTestPanelProps {
  animatedStyle?: StyleProp<ViewStyle>;
}

export const TemperatureTestPanel = ({ animatedStyle }: TemperatureTestPanelProps) => {
  const {
    thermalState,
    setThermalState,
    isLayoutOverlayEnabled,
  } = useSystemStore(useShallow(state => ({
    thermalState: state.thermalState,
    setThermalState: state.setThermalState,
    isLayoutOverlayEnabled: state.isLayoutOverlayEnabled,
  })));

  return (
    <ParameterPanelWrapper animatedStyle={animatedStyle} gap={16} paddingHorizontal={32} scrollable={true}>
      <PillButton
        label="NORMAL"
        isActive={thermalState === 'normal'}
        onPress={() => setThermalState('normal')}
        isLayoutOverlayEnabled={isLayoutOverlayEnabled}
        style={styles.pressable}
      />
      <PillButton
        label="WARNING"
        isActive={thermalState === 'warning'}
        onPress={() => setThermalState('warning')}
        isLayoutOverlayEnabled={isLayoutOverlayEnabled}
        style={styles.pressable}
      />
      <PillButton
        label="CRITICAL"
        isActive={thermalState === 'critical'}
        onPress={() => setThermalState('critical')}
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
