import React from 'react';
import { StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useShallow } from 'zustand/shallow';
import { ParameterPanelWrapper } from '@entities/system';
import { usePreferencesStore } from '@entities/preferences';
import { PillButton } from '@shared/ui';

interface VibrationPanelProps {
  animatedStyle?: StyleProp<ViewStyle>;
}

export const VibrationPanel = ({ animatedStyle }: VibrationPanelProps) => {
  const { hapticsEnabled, setHapticsEnabledPref } = usePreferencesStore(useShallow(state => ({
    hapticsEnabled: state.hapticsEnabled !== false, // default is true
    setHapticsEnabledPref: state.setHapticsEnabledPref,
  })));

  return (
    <ParameterPanelWrapper animatedStyle={animatedStyle} gap={16} paddingHorizontal={32}>
      <PillButton
        label="ON"
        isActive={hapticsEnabled}
        onPress={() => setHapticsEnabledPref(true)}
        style={styles.pressable}
      />
      <PillButton
        label="OFF"
        isActive={!hapticsEnabled}
        onPress={() => setHapticsEnabledPref(false)}
        style={styles.pressable}
      />
    </ParameterPanelWrapper>
  );
};

const styles = StyleSheet.create({
  pressable: {
    flex: 1,
    maxWidth: 140,
  },
});
