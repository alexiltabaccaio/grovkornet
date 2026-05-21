import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useBodyStore } from '@entities/body';
import { GenericPillExtension } from '@entities/system';


interface AspectRatioExtensionProps {
  parameterExtensionAnimatedStyle?: StyleProp<ViewStyle>;
}

const ASPECT_RATIOS = ['4:3', '16:9', '1:1', '3:2', '65:24'];

export const AspectRatioExtension = ({ parameterExtensionAnimatedStyle }: AspectRatioExtensionProps) => {
  const { aspectRatio, setAspectRatio } = useBodyStore(useShallow(state => ({
    aspectRatio: state.aspectRatio,
    setAspectRatio: state.setAspectRatio,
  })));

  return (
    <GenericPillExtension
      options={ASPECT_RATIOS}
      onChange={(_, index) => setAspectRatio(index)}
      value={aspectRatio}
      isActiveShared={(currVal, _, index) => {
        'worklet';
        return currVal === index;
      }}
      getLabel={(label) => label}
      parameterExtensionAnimatedStyle={parameterExtensionAnimatedStyle}
      pillMaxWidth={65}
    />
  );
};
