import React from 'react';
import { StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { ParameterDetailPanelWrapper } from '@entities/system';
import { usePreferencesStore } from '@entities/preferences';
import { PillButton } from '@shared/ui';

interface VibrationDetailPanelProps {
  parameterDetailPanelAnimatedStyle?: StyleProp<ViewStyle>;
}

export const VibrationDetailPanel = ({ parameterDetailPanelAnimatedStyle }: VibrationDetailPanelProps) => {
  const { hapticsEnabled, setHapticsEnabledPref } = usePreferencesStore(useShallow(state => ({
    hapticsEnabled: state.hapticsEnabled !== false, // default is true
    setHapticsEnabledPref: state.setHapticsEnabledPref,
  })));

  return (
    <ParameterDetailPanelWrapper animatedStyle={parameterDetailPanelAnimatedStyle} gap={16} paddingHorizontal={32}>
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
    </ParameterDetailPanelWrapper>
  );
};

const styles = StyleSheet.create({
  pressable: {
    flex: 1,
    maxWidth: 140,
  },
});
