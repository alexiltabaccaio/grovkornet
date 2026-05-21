import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useBodyStore } from '@entities/body';
import { GenericPillExtension } from '@entities/system';


interface ResolutionExtensionProps {
  parameterExtensionAnimatedStyle?: StyleProp<ViewStyle>;
}

const RESOLUTIONS = ['4K', '1080p', '720p', '480p', '360p', '240p', '144p'];

export const ResolutionExtension = ({ parameterExtensionAnimatedStyle }: ResolutionExtensionProps) => {
  const { resolutionSetting, setResolutionSetting } = useBodyStore(useShallow(state => ({
    resolutionSetting: state.resolutionSetting,
    setResolutionSetting: state.setResolutionSetting,
  })));

  return (
    <GenericPillExtension
      options={RESOLUTIONS}
      onChange={(_, index) => setResolutionSetting(index)}
      value={resolutionSetting}
      isActiveShared={(currVal, _, index) => {
        'worklet';
        return currVal === index;
      }}
      getLabel={(label) => label}
      parameterExtensionAnimatedStyle={parameterExtensionAnimatedStyle}
      pillMaxWidth={80}
    />
  );
};
