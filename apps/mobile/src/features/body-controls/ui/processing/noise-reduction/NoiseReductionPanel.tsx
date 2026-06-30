import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { useShallow } from 'zustand/shallow';
import { useFilmStore } from '@entities/film';
import { useSystemStore, GenericPillPanel } from '@entities/system';
import { AutoButton } from '@shared/ui';

interface NoiseReductionPanelProps {
  animatedStyle?: StyleProp<ViewStyle>;
}

export const NoiseReductionPanel = React.memo(({ animatedStyle }: NoiseReductionPanelProps) => {
  const { noiseReductionMode, setNoiseReductionMode, noiseReductionAuto, setNoiseReductionAuto, capabilities } = useFilmStore(useShallow(state => ({
    noiseReductionMode: state.noiseReductionMode,
    setNoiseReductionMode: state.setNoiseReductionMode,
    noiseReductionAuto: state.noiseReductionAuto,
    setNoiseReductionAuto: state.setNoiseReductionAuto,
    capabilities: state.capabilities,
  })));
  const isLayoutOverlayEnabled = useSystemStore(s => s.isLayoutOverlayEnabled);

  const modes = React.useMemo(() => {
    const available = capabilities?.availableNoiseReductionModes;
    if (!available || available.length === 0) {
      return [0, 1, 2];
    }
    return [0, 1, 2, 3].filter(mode => available.includes(mode));
  }, [capabilities?.availableNoiseReductionModes]);

  const getLabel = (opt: number) => {
    if (opt === 0) return 'OFF';
    if (opt === 1) return 'FAST';
    if (opt === 2) return 'HQ';
    if (opt === 3) return 'MINIMAL';
    return '';
  };

  return (
    <GenericPillPanel
      options={modes}
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
          isLayoutOverlayEnabled={isLayoutOverlayEnabled}
        />
      }
    />
  );
});

NoiseReductionPanel.displayName = 'NoiseReductionPanel';
