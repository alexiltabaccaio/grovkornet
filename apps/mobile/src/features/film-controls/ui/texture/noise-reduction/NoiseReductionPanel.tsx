import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { useFilmStore } from '@entities/film';
import { useSystemStore, GenericPillPanel } from '@entities/system';
import { AutoButton } from '@shared/ui';

interface NoiseReductionPanelProps {
  animatedStyle?: StyleProp<ViewStyle>;
}

const MODES = [0, 1, 2];

export const NoiseReductionPanel = ({ animatedStyle }: NoiseReductionPanelProps) => {
  const { noiseReductionMode, setNoiseReductionMode, noiseReductionAuto, setNoiseReductionAuto } = useFilmStore(useShallow(state => ({
    noiseReductionMode: state.noiseReductionMode,
    setNoiseReductionMode: state.setNoiseReductionMode,
    noiseReductionAuto: state.noiseReductionAuto,
    setNoiseReductionAuto: state.setNoiseReductionAuto,
  })));
  const isDebugEnabled = useSystemStore(s => s.isDebugEnabled);

  const getLabel = (opt: number) => {
    if (opt === 0) return 'OFF';
    if (opt === 1) return 'FAST';
    return 'HQ';
  };

  return (
    <GenericPillPanel
      options={MODES}
      onChange={(mode) => {
        setNoiseReductionAuto(false);
        setNoiseReductionMode(mode);
      }}
      value={noiseReductionMode}
      isActiveShared={(currVal, _, index) => {
        'worklet';
        return currVal === index;
      }}
      getLabel={getLabel}
      animatedStyle={animatedStyle}
      pillMaxWidth={75}
      gap={12}
      paddingHorizontal={24}
      scrollable={false}
      leftAccessory={
        <AutoButton
          isActive={noiseReductionAuto}
          onPress={() => setNoiseReductionAuto(!noiseReductionAuto.value)}
          isDebugEnabled={isDebugEnabled}
        />
      }
    />
  );
};

