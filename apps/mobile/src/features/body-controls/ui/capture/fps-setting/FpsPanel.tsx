import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useBodyStore } from '@entities/body';
import { usePreferencesStore } from '@entities/preferences';
import { GenericPillDetailPanel } from '@entities/system';

interface FpsPanelProps {
  parameterDetailPanelAnimatedStyle?: StyleProp<ViewStyle>;
}

export const FpsPanel = ({ parameterDetailPanelAnimatedStyle }: FpsPanelProps) => {
  const { fpsSetting, setFpsSetting, capabilities } = useBodyStore(useShallow(state => ({
    fpsSetting: state.fpsSetting,
    setFpsSetting: state.setFpsSetting,
    capabilities: state.capabilities,
  })));

  const maxFps = capabilities.maxFps ?? 60;
  const fpsOptions = [60, 30, 24].filter(f => f <= maxFps);

  return (
    <GenericPillDetailPanel
      options={fpsOptions}
      onChange={(val) => {
        setFpsSetting(val);
        usePreferencesStore.getState().setFpsSettingPref(val);
      }}
      value={fpsSetting}
      isActiveShared={(currVal, val) => {
        'worklet';
        return Math.round(currVal) === val;
      }}
      getLabel={(val) => val.toString()}
      parameterDetailPanelAnimatedStyle={parameterDetailPanelAnimatedStyle}
      pillMaxWidth={80}
    />
  );
};
