import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useBodyStore } from '@entities/body';
import { GenericPillDetailPanel } from '@entities/system';

interface AspectRatioDetailPanelProps {
  parameterDetailPanelAnimatedStyle?: StyleProp<ViewStyle>;
}

const ASPECT_RATIOS = ['4:3', '16:9', '1:1', '3:2', '65:24'];

export const AspectRatioDetailPanel = ({ parameterDetailPanelAnimatedStyle }: AspectRatioDetailPanelProps) => {
  const { aspectRatio, setAspectRatio } = useBodyStore(useShallow(state => ({
    aspectRatio: state.aspectRatio,
    setAspectRatio: state.setAspectRatio,
  })));

  return (
    <GenericPillDetailPanel
      options={ASPECT_RATIOS}
      onChange={(_, index) => setAspectRatio(index)}
      value={aspectRatio}
      isActiveShared={(currVal, _, index) => {
        'worklet';
        return currVal === index;
      }}
      getLabel={(label) => label}
      parameterDetailPanelAnimatedStyle={parameterDetailPanelAnimatedStyle}
      pillMaxWidth={65}
    />
  );
};
