import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useHardwareStore } from '@features/camera-controls/model/useHardwareStore';
import { GenericPillExtension } from '@features/camera-controls/ui/footer/components/GenericPillExtension';

interface FpsExtensionProps {
  parameterExtensionAnimatedStyle?: StyleProp<ViewStyle>;
}

export const FpsExtension = ({ parameterExtensionAnimatedStyle }: FpsExtensionProps) => {
  const { fpsSetting, setFpsSetting, capabilities } = useHardwareStore(useShallow(state => ({
    fpsSetting: state.fpsSetting,
    setFpsSetting: state.setFpsSetting,
    capabilities: state.capabilities,
  })));

  const maxFps = capabilities.maxFps ?? 60;
  const fpsOptions = [60, 30, 24].filter(f => f <= maxFps);

  return (
    <GenericPillExtension
      options={fpsOptions}
      onChange={(val) => setFpsSetting(val)}
      value={fpsSetting}
      isActiveShared={(currVal, val) => {
        'worklet';
        return Math.round(currVal) === val;
      }}
      getLabel={(val) => val.toString()}
      parameterExtensionAnimatedStyle={parameterExtensionAnimatedStyle}
      pillMaxWidth={80}
    />
  );
};
